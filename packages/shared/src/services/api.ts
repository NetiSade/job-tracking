import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobComment,
  CreateCommentInput,
  UpdateCommentInput,
  ReorderJobsInput,
} from '../types';

// Configuration interface
interface ApiConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  onTokenRefreshFailed?: () => void;
  logger?: {
    info: (msg: string, ...args: any[]) => void;
    error: (msg: string, ...args: any[]) => void;
    warn: (msg: string, ...args: any[]) => void;
  };
}

let config: ApiConfig = {
  baseUrl: '',
  getToken: async () => null,
};

let api: AxiosInstance;

export const configureApi = (newConfig: ApiConfig) => {
  config = { ...config, ...newConfig };
  
  api = axios.create({
    baseURL: config.baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to all requests
  api.interceptors.request.use(
    async (reqConfig: InternalAxiosRequestConfig) => {
      const token = await config.getToken();
      if (token && reqConfig.headers) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Handle 401 errors by refreshing token and retrying
  api.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to get a fresh token (will refresh if needed via the getToken callback)
          const newToken = await config.getToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          config.logger?.error("Failed to refresh token:", refreshError);
          config.onTokenRefreshFailed?.();
        }
      }

      return Promise.reject(error);
    }
  );
};

// Helper to ensure api is initialized
const getApi = () => {
  if (!api) {
    throw new Error("API not configured. Call configureApi first.");
  }
  return api;
};

export const fetchJobs = async (): Promise<Job[]> => {
  const response = await getApi().get<Job[]>('/jobs');
  return response.data;
};

export const createJob = async (jobData: CreateJobInput): Promise<Job> => {
  const response = await getApi().post<Job>('/jobs', jobData);
  return response.data;
};

export const updateJob = async (id: string, jobData: UpdateJobInput): Promise<Job> => {
  const response = await getApi().put<Job>(`/jobs/${id}`, jobData);
  return response.data;
};

export const reorderJobs = async (payload: ReorderJobsInput): Promise<void> => {
  await getApi().put('/jobs/reorder', payload);
};

export const deleteJob = async (id: string): Promise<{ message: string }> => {
  const response = await getApi().delete<{ message: string }>(`/jobs/${id}`);
  return response.data;
};


export const addJobComment = async (
  jobId: string,
  payload: CreateCommentInput
): Promise<JobComment> => {
  const response = await getApi().post<JobComment>(`/jobs/${jobId}/comments`, payload);
  return response.data;
};

export const updateJobComment = async (
  commentId: string,
  payload: UpdateCommentInput
): Promise<JobComment> => {
  const response = await getApi().put<JobComment>(`/comments/${commentId}`, payload);
  return response.data;
};

export const deleteJobComment = async (commentId: string): Promise<{ message: string }> => {
  const response = await getApi().delete<{ message: string }>(`/comments/${commentId}`);
  return response.data;
};
