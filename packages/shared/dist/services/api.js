import axios from 'axios';
let config = {
    baseUrl: '',
    getToken: async () => null,
};
let api;
export const configureApi = (newConfig) => {
    config = { ...config, ...newConfig };
    api = axios.create({
        baseURL: config.baseUrl,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    // Add auth token to all requests
    api.interceptors.request.use(async (reqConfig) => {
        const token = await config.getToken();
        if (token && reqConfig.headers) {
            reqConfig.headers.Authorization = `Bearer ${token}`;
        }
        return reqConfig;
    }, (error) => {
        return Promise.reject(error);
    });
    // Handle 401 errors by refreshing token and retrying
    api.interceptors.response.use((response) => response, async (error) => {
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
            }
            catch (refreshError) {
                config.logger?.error("Failed to refresh token:", refreshError);
                config.onTokenRefreshFailed?.();
            }
        }
        return Promise.reject(error);
    });
};
// Helper to ensure api is initialized
const getApi = () => {
    if (!api) {
        throw new Error("API not configured. Call configureApi first.");
    }
    return api;
};
export const fetchJobs = async () => {
    const response = await getApi().get('/jobs');
    return response.data;
};
export const createJob = async (jobData) => {
    const response = await getApi().post('/jobs', jobData);
    return response.data;
};
export const updateJob = async (id, jobData) => {
    const response = await getApi().put(`/jobs/${id}`, jobData);
    return response.data;
};
export const reorderJobs = async (payload) => {
    await getApi().put('/jobs/reorder', payload);
};
export const deleteJob = async (id) => {
    const response = await getApi().delete(`/jobs/${id}`);
    return response.data;
};
export const addJobComment = async (jobId, payload) => {
    const response = await getApi().post(`/jobs/${jobId}/comments`, payload);
    return response.data;
};
export const updateJobComment = async (commentId, payload) => {
    const response = await getApi().put(`/comments/${commentId}`, payload);
    return response.data;
};
export const deleteJobComment = async (commentId) => {
    const response = await getApi().delete(`/comments/${commentId}`);
    return response.data;
};
