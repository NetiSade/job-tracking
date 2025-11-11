import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config';
import {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobComment,
  CreateCommentInput,
  UpdateCommentInput,
} from '../types';
import { getSessionToken } from './auth';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getSessionToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors by refreshing token and retrying
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to get a fresh token (will refresh if needed)
        const newToken = await getSessionToken();
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const fetchJobs = async (): Promise<Job[]> => {
  const response = await api.get<Job[]>('/jobs');
  return response.data;
};

export const createJob = async (jobData: CreateJobInput): Promise<Job> => {
  const response = await api.post<Job>('/jobs', jobData);
  return response.data;
};

export const updateJob = async (id: string, jobData: UpdateJobInput): Promise<Job> => {
  const response = await api.put<Job>(`/jobs/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/jobs/${id}`);
  return response.data;
};


export const addJobComment = async (
  jobId: string,
  payload: CreateCommentInput
): Promise<JobComment> => {
  const response = await api.post<JobComment>(`/jobs/${jobId}/comments`, payload);
  return response.data;
};

export const updateJobComment = async (
  commentId: string,
  payload: UpdateCommentInput
): Promise<JobComment> => {
  const response = await api.put<JobComment>(`/comments/${commentId}`, payload);
  return response.data;
};

export const deleteJobComment = async (commentId: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/comments/${commentId}`);
  return response.data;
};
