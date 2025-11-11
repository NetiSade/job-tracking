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
} from "../services/api";
import {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobStatus,
  JobComment,
} from "../types";

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  activeFilter: JobStatus | "all";
  setActiveFilter: (filter: JobStatus | "all") => void;
  loadJobs: () => Promise<void>;
  handleCreateJob: (jobData: CreateJobInput) => Promise<void>;
  handleUpdateJob: (jobId: string, jobData: UpdateJobInput) => Promise<void>;
  handleDeleteJob: (jobId: string) => void;
  handleAddComment: (jobId: string, content: string) => Promise<JobComment>;
  handleUpdateComment: (
    jobId: string,
    commentId: string,
    content: string
  ) => Promise<JobComment>;
  handleDeleteComment: (jobId: string, commentId: string) => Promise<void>;
  getFilteredJobs: () => Job[];
  getJobCountByStatus: (status: JobStatus) => number;
}

const sortJobsByUpdated = (list: Job[]): Job[] =>
  [...list].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

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

  const setJobsWithSort = useCallback((updater: (jobs: Job[]) => Job[]) => {
    setJobs((prevJobs) => sortJobsByUpdated(updater(prevJobs)));
  }, []);

  const loadJobs = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      const normalized = data.map((job) => ({
        ...job,
        comments: sortCommentsByCreated(job.comments || []),
      }));
      setJobs(sortJobsByUpdated(normalized));
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
        setJobsWithSort((prevJobs) => [normalizedJob, ...prevJobs]);
        Alert.alert("Success", "Job added successfully");
      } catch (error) {
        Alert.alert("Error", "Failed to create job");
        throw error;
      }
    },
    [setJobsWithSort]
  );

  const handleUpdateJob = useCallback(
    async (jobId: string, jobData: UpdateJobInput): Promise<void> => {
      try {
        const updatedJob = await updateJob(jobId, jobData);
        const normalizedJob = {
          ...updatedJob,
          comments: sortCommentsByCreated(updatedJob.comments || []),
        };
        setJobsWithSort((prevJobs) =>
          prevJobs.map((job) => (job.id === jobId ? normalizedJob : job))
        );
        Alert.alert("Success", "Job updated successfully");
      } catch (error) {
        Alert.alert("Error", "Failed to update job");
        throw error;
      }
    },
    [setJobsWithSort]
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
            setJobsWithSort((prevJobs) =>
              prevJobs.filter((job) => job.id !== jobId)
            );
            Alert.alert("Success", "Job deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete job");
          }
        },
      },
    ]);
  }, [setJobsWithSort]);

  const handleAddComment = useCallback(
    async (jobId: string, content: string): Promise<JobComment> => {
      const newComment = await addJobComment(jobId, { content });
      setJobsWithSort((prevJobs) =>
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
    [setJobsWithSort]
  );

  const handleUpdateComment = useCallback(
    async (
      jobId: string,
      commentId: string,
      content: string
    ): Promise<JobComment> => {
      const updatedComment = await updateJobComment(commentId, { content });
      setJobsWithSort((prevJobs) =>
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
    [setJobsWithSort]
  );

  const handleDeleteComment = useCallback(
    async (jobId: string, commentId: string): Promise<void> => {
      await deleteJobComment(commentId);
      const deletionTime = new Date().toISOString();
      setJobsWithSort((prevJobs) =>
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
    [setJobsWithSort]
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
    getFilteredJobs,
    getJobCountByStatus,
  };
};
