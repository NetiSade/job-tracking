import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
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
  loadJobs: () => Promise<void>;
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
}

const sortJobsByOrder = (list: Job[]): Job[] =>
  [...list].sort((a, b) => a.sort_order - b.sort_order);

const sortCommentsByCreated = (comments: JobComment[]): JobComment[] =>
  [...comments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

export const useJobs = (isAuthenticated: boolean): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<JobStatus | "all">(
    "in_progress"
  );

  const setJobsWithOrder = useCallback((updater: (jobs: Job[]) => Job[]) => {
    setJobs((prevJobs) => sortJobsByOrder(updater(prevJobs)));
  }, []);

  const loadJobs = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      const normalized = data.map((job) => ({
        ...job,
        comments: sortCommentsByCreated(job.comments || []),
      }));
      setJobs(sortJobsByOrder(normalized));
    } catch (error) {
      console.error('[useJobs] Failed to load jobs', error);
      Alert.alert("Error", "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
    }
  }, [isAuthenticated, loadJobs]);

  const handleCreateJob = useCallback(
    async (jobData: CreateJobInput): Promise<void> => {
      try {
        const newJob = await createJob(jobData);
        const normalizedJob = {
          ...newJob,
          comments: sortCommentsByCreated(newJob.comments || []),
        };
        setJobsWithOrder((prevJobs) => [...prevJobs, normalizedJob]);
        Alert.alert("Success", "Job added successfully");
      } catch (error) {
        Alert.alert("Error", "Failed to create job");
        throw error;
      }
    },
    [setJobsWithOrder]
  );

  const handleUpdateJob = useCallback(
    async (
      jobId: string,
      jobData: UpdateJobInput,
      options?: UpdateJobOptions
    ): Promise<void> => {
      try {
        const updatedJob = await updateJob(jobId, jobData);
        const normalizedJob = {
          ...updatedJob,
          comments: sortCommentsByCreated(updatedJob.comments || []),
        };
        setJobsWithOrder((prevJobs) =>
          prevJobs.map((job) => (job.id === jobId ? normalizedJob : job))
        );
        const successMessage =
          options?.successMessage === undefined
            ? "Job updated successfully"
            : options.successMessage;
        if (successMessage) {
          Alert.alert("Success", successMessage);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to update job");
        throw error;
      }
    },
    [setJobsWithOrder]
  );

  const handleDeleteJob = useCallback((jobId: string): void => {
    Alert.alert("Delete Job", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteJob(jobId);
            setJobsWithOrder((prevJobs) =>
              prevJobs.filter((job) => job.id !== jobId)
            );
            Alert.alert("Success", "Job deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete job");
          }
        },
      },
    ]);
  }, [setJobsWithOrder]);

  const handleAddComment = useCallback(
    async (jobId: string, content: string): Promise<JobComment> => {
      const newComment = await addJobComment(jobId, { content });
      setJobsWithOrder((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                updated_at: newComment.updated_at,
                comments: sortCommentsByCreated([newComment, ...job.comments]),
              }
            : job
        )
      );
      return newComment;
    },
    [setJobsWithOrder]
  );

  const handleUpdateComment = useCallback(
    async (
      jobId: string,
      commentId: string,
      content: string
    ): Promise<JobComment> => {
      const updatedComment = await updateJobComment(commentId, { content });
      setJobsWithOrder((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                updated_at: updatedComment.updated_at,
                comments: sortCommentsByCreated(
                  job.comments.map((comment) =>
                    comment.id === commentId ? updatedComment : comment
                  )
                ),
              }
            : job
        )
      );
      return updatedComment;
    },
    [setJobsWithOrder]
  );

  const handleDeleteComment = useCallback(
    async (jobId: string, commentId: string): Promise<void> => {
      await deleteJobComment(commentId);
      const deletionTime = new Date().toISOString();
      setJobsWithOrder((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                updated_at: deletionTime,
                comments: job.comments.filter((comment) => comment.id !== commentId),
              }
            : job
        )
      );
    },
    [setJobsWithOrder]
  );

  const handleReorderJobs = useCallback(
    async (reorderedList: Job[]): Promise<void> => {
      if (!Array.isArray(reorderedList) || reorderedList.length === 0) {
        return;
      }

      let previousJobsSnapshot: Job[] = jobs;
      let nextJobsSnapshot: Job[] = jobs;
      let didChange = false;

      setJobs((currentJobs) => {
        previousJobsSnapshot = currentJobs.map((job) => ({ ...job }));

        let updatedJobs: Job[];
        if (activeFilter === "all") {
          const unchanged =
            reorderedList.length === currentJobs.length &&
            reorderedList.every(
              (job, index) => job.id === currentJobs[index]?.id
            );

          if (unchanged) {
            nextJobsSnapshot = currentJobs;
            didChange = false;
            return currentJobs;
          }

          updatedJobs = [...reorderedList];
        } else {
          const filteredCurrent = currentJobs.filter(
            (job) => job.status === activeFilter
          );

          const unchanged =
            filteredCurrent.length === reorderedList.length &&
            reorderedList.every(
              (job, index) => job.id === filteredCurrent[index]?.id
            );

          if (unchanged) {
            nextJobsSnapshot = currentJobs;
            didChange = false;
            return currentJobs;
          }

          const filteredQueue = [...reorderedList];
          let filteredIndex = 0;
          updatedJobs = currentJobs.map((job) => {
            if (job.status === activeFilter) {
              const nextJob =
                filteredQueue[filteredIndex] !== undefined
                  ? filteredQueue[filteredIndex]
                  : job;
              filteredIndex += 1;
              return nextJob;
            }
            return job;
          });
        }

        didChange = true;

        const withSequentialOrder = updatedJobs.map((job, index) => ({
          ...job,
          sort_order: index,
        }));

        nextJobsSnapshot = withSequentialOrder;
        return withSequentialOrder;
      });

      if (!didChange) {
        return;
      }

      try {
        await reorderJobs({
          orders: nextJobsSnapshot.map((job) => ({
            id: job.id,
            sort_order: job.sort_order,
          })),
        });
      } catch (error) {
        console.error("[useJobs] Failed to reorder jobs", error);
        Alert.alert("Error", "Failed to save job order");
        setJobs(sortJobsByOrder([...previousJobsSnapshot]));
        throw error;
      }
    },
    [activeFilter, jobs]
  );

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
    loadJobs,
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleReorderJobs,
    getFilteredJobs,
    getJobCountByStatus,
  };
};
