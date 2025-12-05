import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { signInWithGoogle as googleSignIn, signOut as googleSignOut, getSessionToken } from "../services/auth";
import { Logger } from "../services/logger";

interface AuthContextType {
    isAuthenticating: boolean;
    isAuthenticated: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
            Logger.error("Auth error:", error);
        } finally {
            setIsAuthenticating(false);
        }
    };

    const signInWithGoogle = async () => {
        try {
            Logger.info("📱 [AuthContext] Starting Google Sign-In");
            setIsAuthenticating(true);
            const token = await googleSignIn();
            if (token) {
                Logger.info("📱 [AuthContext] Got token, setting authenticated to TRUE");
                setIsAuthenticated(true);
                setIsAuthenticating(false);
            } else {
                Logger.info("📱 [AuthContext] No token received");
                setIsAuthenticating(false);
                Alert.alert("Error", "Google Sign-In failed");
            }
        } catch (error) {
            Logger.error("Google Sign-In error:", error);
            setIsAuthenticating(false);
            Alert.alert("Error", "An error occurred during sign in");
        }
    };

    const signOut = async () => {
        try {
            Logger.info("🔓 [AuthContext] Signing out...");
            await googleSignOut();
            setIsAuthenticated(false);
            Logger.info("✅ [AuthContext] Signed out successfully");
        } catch (error) {
            Logger.error("Sign out error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticating, isAuthenticated, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
