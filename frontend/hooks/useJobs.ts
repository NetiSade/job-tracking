import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import {
  fetchJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../services/api";
import { Job, CreateJobInput, UpdateJobInput, JobStatus } from "../types";

interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  activeFilter: JobStatus | "all";
  setActiveFilter: (filter: JobStatus | "all") => void;
  loadJobs: () => Promise<void>;
  handleCreateJob: (jobData: CreateJobInput) => Promise<void>;
  handleUpdateJob: (jobId: string, jobData: UpdateJobInput) => Promise<void>;
  handleDeleteJob: (jobId: string) => void;
  getFilteredJobs: () => Job[];
  getJobCountByStatus: (status: JobStatus) => number;
}

export const useJobs = (isAuthenticated: boolean): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<JobStatus | "all">(
    "in_progress"
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
    }
  }, [isAuthenticated]);

  const loadJobs = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateJob = useCallback(
    async (jobData: CreateJobInput): Promise<void> => {
      try {
        const newJob = await createJob(jobData);
        setJobs((prevJobs) => [newJob, ...prevJobs]);
        Alert.alert("Success", "Job added successfully");
      } catch (error) {
        Alert.alert("Error", "Failed to create job");
        throw error;
      }
    },
    []
  );

  const handleUpdateJob = useCallback(
    async (jobId: string, jobData: UpdateJobInput): Promise<void> => {
      try {
        const updatedJob = await updateJob(jobId, jobData);
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job.id === jobId ? updatedJob : job))
        );
        Alert.alert("Success", "Job updated successfully");
      } catch (error) {
        Alert.alert("Error", "Failed to update job");
        throw error;
      }
    },
    []
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
            setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
            Alert.alert("Success", "Job deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete job");
          }
        },
      },
    ]);
  }, []);

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
    getFilteredJobs,
    getJobCountByStatus,
  };
};

