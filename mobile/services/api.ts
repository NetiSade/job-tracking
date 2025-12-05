import { configureApi } from '@job-tracking/shared/dist/services/api';
import { getSessionToken, signOut } from './auth';
import { API_URL } from '../config';
import { Logger } from './logger';

configureApi({
  baseUrl: API_URL,
  getToken: getSessionToken,
  onTokenRefreshFailed: () => {
    Logger.warn("Token refresh failed, signing out...");
    signOut();
  },
  logger: Logger,
});

export * from '@job-tracking/shared/dist/services/api';
