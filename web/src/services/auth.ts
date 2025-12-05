import { googleLogout } from '@react-oauth/google';

const TOKEN_KEY = 'auth_token';

export const getSessionToken = async (): Promise<string | null> => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setSessionToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  googleLogout();
};

export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};
