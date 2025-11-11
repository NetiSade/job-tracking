import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config";

const TOKEN_KEY = "anonymous_auth_token";
const REFRESH_TOKEN_KEY = "anonymous_refresh_token";
const EXPIRES_AT_KEY = "anonymous_expires_at";

// Check if token is expired or about to expire (within 5 minutes)
const isTokenExpired = async (): Promise<boolean> => {
  try {
    const expiresAt = await AsyncStorage.getItem(EXPIRES_AT_KEY);
    if (!expiresAt) return true;

    const expiresTime = parseInt(expiresAt, 10);
    const now = Math.floor(Date.now() / 1000);
    const buffer = 5 * 60; // 5 minutes buffer

    return now >= expiresTime - buffer;
  } catch {
    return true;
  }
};

// Refresh the access token
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      console.log("No refresh token found, need to create new session");
      return null;
    }

    console.log("🔄 Refreshing token...");
    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      { timeout: 10000 }
    );

    if (response.data?.token) {
      console.log("✅ Token refreshed successfully");
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
      if (response.data.refresh_token) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh_token);
      }
      if (response.data.expires_at) {
        await AsyncStorage.setItem(EXPIRES_AT_KEY, response.data.expires_at.toString());
      }
      return response.data.token;
    }

    return null;
  } catch (error: any) {
    console.error("❌ Error refreshing token:", error);
    // If refresh fails, clear tokens and create new session
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, EXPIRES_AT_KEY]);
    return null;
  }
};

// Sign in anonymously via backend
export const signInAnonymously = async (): Promise<string | null> => {
  try {
    console.log("🔐 Checking for existing session...");

    // Check if we have a stored token
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);

    if (storedToken) {
      // Check if token is expired
      const expired = await isTokenExpired();
      if (!expired) {
        console.log("✅ Found valid token in storage");
        return storedToken;
      }

      // Try to refresh the token
      console.log("⚠️ Token expired, attempting refresh...");
      const refreshedToken = await refreshToken();
      if (refreshedToken) {
        return refreshedToken;
      }

      // If refresh failed, create new session
      console.log("⚠️ Refresh failed, creating new session...");
    }

    console.log("📝 Creating new anonymous session via backend...");

    // Request anonymous auth from backend
    const response = await axios.post(
      `${API_URL}/auth/anonymous`,
      {},
      {
        timeout: 10000,
      }
    );

    if (response.data?.token) {
      console.log("✅ Anonymous auth successful");
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
      if (response.data.refresh_token) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh_token);
      }
      if (response.data.expires_at) {
        await AsyncStorage.setItem(EXPIRES_AT_KEY, response.data.expires_at.toString());
      }
      return response.data.token;
    }

    console.error("❌ No token received from backend");
    return null;
  } catch (error: any) {
    console.error("❌ Error signing in anonymously:", error);
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
    });
    return null;
  }
};

// Get current session token (with auto-refresh)
export const getSessionToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      return await signInAnonymously();
    }

    // Check if token is expired
    const expired = await isTokenExpired();
    if (expired) {
      console.log("Token expired, refreshing...");
      const refreshedToken = await refreshToken();
      if (refreshedToken) {
        return refreshedToken;
      }
      // If refresh failed, try to create new session
      return await signInAnonymously();
    }

    return token;
  } catch (error) {
    console.error("Error getting session:", error);
    return await signInAnonymously();
  }
};

// Get current user ID (stored with token)
export const getUserId = async (): Promise<string | null> => {
  return null; // Backend handles user_id
};

