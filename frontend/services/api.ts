import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config';
import { Job, CreateJobInput, UpdateJobInput } from '../types';
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

