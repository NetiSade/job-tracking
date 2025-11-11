import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { signInAnonymously } from "../services/auth";

interface UseAuthReturn {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      const token = await signInAnonymously();
      if (token) {
        setIsAuthenticated(true);
      } else {
        Alert.alert("Error", "Failed to initialize app. Please restart.");
      }
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert("Error", "Failed to initialize app. Please restart.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return { isAuthenticating, isAuthenticated };
};

