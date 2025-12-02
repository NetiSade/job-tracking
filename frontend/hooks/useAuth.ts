import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { signInWithGoogle as googleSignIn, signOut as googleSignOut, getSessionToken } from "../services/auth";

interface UseAuthReturn {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      const token = await getSessionToken();
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsAuthenticating(true);
      const token = await googleSignIn();
      if (token) {
        setIsAuthenticated(true);
      } else {
        Alert.alert("Error", "Google Sign-In failed");
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      Alert.alert("Error", "An error occurred during sign in");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signOut = async () => {
    try {
      await googleSignOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return { isAuthenticating, isAuthenticated, signInWithGoogle, signOut };
};

