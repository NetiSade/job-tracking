import { Job, CreateJobInput, UpdateJobInput, JobComment, CreateCommentInput, UpdateCommentInput, ReorderJobsInput } from '../types';
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
export declare const configureApi: (newConfig: ApiConfig) => void;
export declare const fetchJobs: () => Promise<Job[]>;
export declare const createJob: (jobData: CreateJobInput) => Promise<Job>;
export declare const updateJob: (id: string, jobData: UpdateJobInput) => Promise<Job>;
export declare const reorderJobs: (payload: ReorderJobsInput) => Promise<void>;
export declare const deleteJob: (id: string) => Promise<{
    message: string;
}>;
export declare const addJobComment: (jobId: string, payload: CreateCommentInput) => Promise<JobComment>;
export declare const updateJobComment: (commentId: string, payload: UpdateCommentInput) => Promise<JobComment>;
export declare const deleteJobComment: (commentId: string) => Promise<{
    message: string;
}>;
export {};
