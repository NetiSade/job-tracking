import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { API_URL } from "../config";
import { Logger } from "./logger";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const EXPIRES_AT_KEY = "expires_at";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: "949490405498-mrie2c1ul2qqgo33vasfhj28iv4d8nco.apps.googleusercontent.com",
  offlineAccess: true,
});

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
      console.log("No refresh token found");
      return null;
    }

    console.log("🔄 Refreshing token...");
    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      { timeout: 10000 }
    );

    if (response.data?.token) {
      Logger.info("✅ Token refreshed successfully");
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
    Logger.error("❌ Error refreshing token:", error);
    await signOut();
    return null;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<string | null> => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    
    if (!response.data || !response.data.idToken) {
      throw new Error("No ID token present");
    }

    const idToken = response.data.idToken;

    Logger.info("🔐 Authenticating with backend...");
    const authResponse = await axios.post(
      `${API_URL}/auth/google`,
      { id_token: idToken },
      { timeout: 10000 }
    );

    if (authResponse.data?.token) {
      Logger.info("✅ Auth successful");
      await AsyncStorage.setItem(TOKEN_KEY, authResponse.data.token);
      if (authResponse.data.refresh_token) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, authResponse.data.refresh_token);
      }
      if (authResponse.data.expires_at) {
        await AsyncStorage.setItem(EXPIRES_AT_KEY, authResponse.data.expires_at.toString());
      }
      return authResponse.data.token;
    }

    return null;
  } catch (error: any) {
    Logger.error("❌ Google Sign-In error:", error);
    return null;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    Logger.info("🔓 Starting sign out...");
    await GoogleSignin.signOut();
    Logger.info("✅ Google sign out successful");
    
    // Clear all tokens
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, EXPIRES_AT_KEY]);
    Logger.info("✅ Cleared all tokens from storage");
  } catch (error) {
    Logger.error("Error signing out:", error);
    throw error; // Re-throw to let caller know about the error
  }
};

// Get current session token (with auto-refresh)
export const getSessionToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    // Check if token is expired
    const expired = await isTokenExpired();
    if (expired) {
      console.log("Token expired, refreshing...");
      const refreshedToken = await refreshToken();
      if (refreshedToken) {
        return refreshedToken;
      }
      return null;
    }

    return token;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

// Get current user ID
export const getUserId = async (): Promise<string | null> => {
  return null; // Backend handles user_id
};

