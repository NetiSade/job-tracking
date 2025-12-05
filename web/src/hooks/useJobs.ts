import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchJobs, 
  createJob, 
  updateJob, 
  deleteJob,
  addJobComment,
  updateJobComment,
  deleteJobComment,
  reorderJobs
} from '../services/api';
import type { CreateJobInput, UpdateJobInput, Job, JobComment } from '@job-tracking/shared';

const QUERY_KEY = ['jobs'];

export const useJobs = () => {
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchJobs,
  });

  const createJobMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobInput }) => updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ jobId, content }: { jobId: string; content: string }) =>
      addJobComment(jobId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateJobComment(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteJobComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const reorderJobsMutation = useMutation({
    mutationFn: reorderJobs,
    onError: (err, _variables, context: any) => {
      // Rollback on error
      if (context?.previousJobs) {
        queryClient.setQueryData(QUERY_KEY, context.previousJobs);
      }
      console.error('Failed to reorder jobs:', err);
      alert('Failed to save job order');
    },
  });

  const handleReorderJobs = async (reorderedJobs: Job[]) => {
    const previousJobs = queryClient.getQueryData<Job[]>(QUERY_KEY);
    
    // Optimistic update - immediately update the UI
    queryClient.setQueryData<Job[]>(QUERY_KEY, reorderedJobs);
    
    try {
      await reorderJobsMutation.mutateAsync({
        orders: reorderedJobs.map((job, index) => ({
          id: job.id,
          sort_order: index,
          status: job.status, // Include status to handle cross-column moves
        })),
      });
    } catch (error) {
      // Error handling is done in mutation's onError
    }
  };

  return {
    jobs,
    isLoading,
    error,
    createJob: (data: CreateJobInput) => createJobMutation.mutateAsync(data),
    updateJob: (id: string, data: UpdateJobInput) => updateJobMutation.mutateAsync({ id, data }),
    deleteJob: (id: string) => deleteJobMutation.mutateAsync(id),
    addComment: (jobId: string, content: string) => addCommentMutation.mutateAsync({ jobId, content }),
    updateComment: (commentId: string, content: string) => updateCommentMutation.mutateAsync({ commentId, content }),
    deleteComment: (commentId: string) => deleteCommentMutation.mutateAsync(commentId),
    handleReorderJobs,
    isCreating: createJobMutation.isPending,
    isUpdating: updateJobMutation.isPending,
    isDeleting: deleteJobMutation.isPending,
  };
};
