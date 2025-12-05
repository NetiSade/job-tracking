import { 
  configureApi,
  fetchJobs,
  createJob,
  updateJob,
  reorderJobs,
  deleteJob,
  addJobComment,
  updateJobComment,
  deleteJobComment
} from '@job-tracking/shared';
import { getSessionToken, clearSession } from './auth';
import { API_URL } from '../config';

configureApi({
  baseUrl: API_URL,
  getToken: getSessionToken,
  onTokenRefreshFailed: () => {
    console.warn("Token refresh failed, signing out...");
    clearSession();
    window.location.href = '/login';
  },
  logger: console,
});

export {
  fetchJobs,
  createJob,
  updateJob,
  reorderJobs,
  deleteJob,
  addJobComment,
  updateJobComment,
  deleteJobComment
};
