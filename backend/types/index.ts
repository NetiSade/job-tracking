export type JobStatus = 'wishlist' | 'in_progress' | 'archived';

export interface JobComment {
  id: string;
  job_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  company: string;
  position: string;
  status: JobStatus;
  sort_order: number;
  salary_expectations?: string | null;
  created_at: string;
  updated_at: string;
  comments: JobComment[];
}

export interface CreateJobInput {
  company: string;
  position: string;
  status?: JobStatus;
  salary_expectations?: string | null;
  sort_order?: number;
}

export interface UpdateJobInput {
  company?: string;
  position?: string;
  status?: JobStatus;
  salary_expectations?: string | null;
  sort_order?: number;
}

export interface CreateCommentInput {
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}
