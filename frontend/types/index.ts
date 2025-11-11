export type JobStatus = 'wishlist' | 'in_progress' | 'archived';
export type JobPriority = 'low' | 'medium' | 'high';

export interface Job {
  id: string;
  user_id: string;
  company: string;
  position: string;
  status: JobStatus;
  priority: JobPriority;
  comments: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobInput {
  company: string;
  position: string;
  status: JobStatus;
  priority: JobPriority;
  comments: string;
}

export interface UpdateJobInput {
  company: string;
  position: string;
  status: JobStatus;
  priority: JobPriority;
  comments: string;
}

export interface PickerOption {
  label: string;
  value: string;
}

