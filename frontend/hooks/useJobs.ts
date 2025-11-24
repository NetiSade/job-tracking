import { useState, useCallback } from "react";
import { Alert } from "react-native";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchJobs,
  createJob,
  updateJob,
  deleteJob,
  addJobComment,
  updateJobComment,
  deleteJobComment,
  reorderJobs,
} from "../services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useNetworkStatus } from './useNetworkStatus';
import {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobStatus,
  JobComment,
} from "../types";

interface UpdateJobOptions {
  successMessage?: string | false;
}

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  activeFilter: JobStatus | "all";
  setActiveFilter: (filter: JobStatus | "all") => void;
  loadJobs: () => Promise<void>; // Kept for compatibility but effectively a no-op or refetch
  handleCreateJob: (jobData: CreateJobInput) => Promise<void>;
  handleUpdateJob: (
    jobId: string,
    jobData: UpdateJobInput,
    options?: UpdateJobOptions
  ) => Promise<void>;
  handleDeleteJob: (jobId: string) => void;
  handleAddComment: (jobId: string, content: string) => Promise<JobComment>;
  handleUpdateComment: (
    jobId: string,
    commentId: string,
    content: string
  ) => Promise<JobComment>;
  handleDeleteComment: (jobId: string, commentId: string) => Promise<void>;
  handleReorderJobs: (reorderedJobs: Job[]) => Promise<void>;
  getFilteredJobs: () => Job[];
  getJobCountByStatus: (status: JobStatus) => number;
  isOnline: boolean;
}

const JOBS_CACHE_KEY = 'jobs_cache';
const QUERY_KEY = ['jobs'];

const sortJobsByOrder = (list: Job[]): Job[] =>
  [...list].sort((a, b) => a.sort_order - b.sort_order);

const sortCommentsByCreated = (comments: JobComment[]): JobComment[] =>
  [...comments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

export const useJobs = (isAuthenticated: boolean): UseJobsReturn => {
  const queryClient = useQueryClient();
  const isOnline = useNetworkStatus();
  const [activeFilter, setActiveFilter] = useState<JobStatus | "all">(
    "in_progress"
  );

  const { data: jobs = [], isLoading: loading, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      try {
        if (isOnline) {
          const data = await fetchJobs();
          const normalized = data.map((job) => ({
            ...job,
            comments: sortCommentsByCreated(job.comments || []),
          }));
          const sortedJobs = sortJobsByOrder(normalized);
          await AsyncStorage.setItem(JOBS_CACHE_KEY, JSON.stringify(sortedJobs));
          return sortedJobs;
        } else {
          const cached = await AsyncStorage.getItem(JOBS_CACHE_KEY);
          return cached ? JSON.parse(cached) : [];
        }
      } catch (error) {
        console.error('[useJobs] Failed to load jobs', error);
        const cached = await AsyncStorage.getItem(JOBS_CACHE_KEY);
        if (cached) return JSON.parse(cached);
        throw error;
      }
    },
    enabled: isAuthenticated,
    initialData: [],
  });

  const createJobMutation = useMutation({
    mutationFn: createJob,
    onMutate: async (newJobData) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousJobs = queryClient.getQueryData<Job[]>(QUERY_KEY);
      
      // Optimistic update
      queryClient.setQueryData<Job[]>(QUERY_KEY, (old = []) => {
        const tempJob: Job = {
          id: 'temp-' + Date.now(),
          user_id: 'temp-user',
          ...newJobData,
          sort_order: old.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          comments: [],
        };
        return [...old, tempJob];
      });

      return { previousJobs };
    },
    onError: (err, newJob, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousJobs);
      Alert.alert("Error", "Failed to create job");
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Job added successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobInput }) => updateJob(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousJobs = queryClient.getQueryData<Job[]>(QUERY_KEY);

      queryClient.setQueryData<Job[]>(QUERY_KEY, (old = []) => 
        old.map(job => job.id === id ? { ...job, ...data } : job)
      );

      return { previousJobs };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousJobs);
      Alert.alert("Error", "Failed to update job");
    },
    onSuccess: async (_, vars) => {
       // Success message handled in wrapper
       queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: deleteJob,
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousJobs = queryClient.getQueryData<Job[]>(QUERY_KEY);

      queryClient.setQueryData<Job[]>(QUERY_KEY, (old = []) => 
        old.filter(job => job.id !== jobId)
      );

      return { previousJobs };
    },
    onError: (err, jobId, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousJobs);
      Alert.alert("Error", "Failed to delete job");
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Job deleted successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
  });

  // Wrappers to match existing interface
  const handleCreateJob = useCallback(async (jobData: CreateJobInput) => {
    if (!isOnline) {
      Alert.alert("Offline", "You cannot create jobs while offline.");
      return;
    }
    await createJobMutation.mutateAsync(jobData);
  }, [isOnline, createJobMutation]);

  const handleUpdateJob = useCallback(async (
    jobId: string,
    jobData: UpdateJobInput,
    options?: UpdateJobOptions
  ) => {
    if (!isOnline) {
      Alert.alert("Offline", "You cannot update jobs while offline.");
      return;
    }
    await updateJobMutation.mutateAsync({ id: jobId, data: jobData });
    
    const successMessage = options?.successMessage === undefined
      ? "Job updated successfully"
      : options.successMessage;
      
    if (successMessage) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", successMessage);
    }
  }, [isOnline, updateJobMutation]);

  const handleDeleteJob = useCallback((jobId: string) => {
    if (!isOnline) {
      Alert.alert("Offline", "You cannot delete jobs while offline.");
      return;
    }
    Alert.alert("Delete Job", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteJobMutation.mutate(jobId),
      },
    ]);
  }, [isOnline, deleteJobMutation]);

  // Comment mutations (simplified for brevity, similar pattern)
  const handleAddComment = useCallback(async (jobId: string, content: string) => {
    const newComment = await addJobComment(jobId, { content });
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    return newComment;
  }, [queryClient]);

  const handleUpdateComment = useCallback(async (jobId: string, commentId: string, content: string) => {
    const updatedComment = await updateJobComment(commentId, { content });
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    return updatedComment;
  }, [queryClient]);

  const handleDeleteComment = useCallback(async (jobId: string, commentId: string) => {
    await deleteJobComment(commentId);
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  const handleReorderJobs = useCallback(async (reorderedList: Job[]) => {
    // Optimistic update for reordering
    const previousJobs = queryClient.getQueryData<Job[]>(QUERY_KEY);
    
    // Update local state immediately
    queryClient.setQueryData<Job[]>(QUERY_KEY, reorderedList);
    
    try {
      await reorderJobs({
        orders: reorderedList.map((job) => ({
          id: job.id,
          sort_order: job.sort_order,
        })),
      });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("[useJobs] Failed to reorder jobs", error);
      Alert.alert("Error", "Failed to save job order");
      // Rollback
      queryClient.setQueryData(QUERY_KEY, previousJobs);
    }
  }, [queryClient]);

  const getFilteredJobs = useCallback((): Job[] => {
    if (activeFilter === "all") {
      return jobs;
    }
    return jobs.filter((job) => job.status === activeFilter);
  }, [jobs, activeFilter]);

  const getJobCountByStatus = useCallback(
    (status: JobStatus): number => {
      return jobs.filter((job) => job.status === status).length;
    },
    [jobs]
  );

  return {
    jobs,
    loading,
    activeFilter,
    setActiveFilter,
    loadJobs: async () => { await refetch(); },
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleReorderJobs,
    getFilteredJobs,
    getJobCountByStatus,
    isOnline,
  };
};
