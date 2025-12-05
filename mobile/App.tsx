import "react-native-gesture-handler";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ToastProvider } from "./components/ToastProvider";
import HomeScreen from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

const ThemedApp = () => {
  const { isAuthenticated } = useAuth();
  const { theme, colors } = useTheme();

  const paperTheme = theme === 'dark'
    ? {
      ...MD3DarkTheme,
      colors: {
        ...MD3DarkTheme.colors,
        background: colors.background,
        surface: colors.card,
        primary: colors.primary,
        onSurface: colors.text,
        onSurfaceVariant: colors.textSecondary,
      },
    }
    : {
      ...MD3LightTheme,
      colors: {
        ...MD3LightTheme.colors,
        background: colors.background,
        surface: colors.card,
        primary: colors.primary,
        onSurface: colors.text,
        onSurfaceVariant: colors.textSecondary,
      },
    };

  return (
    <PaperProvider theme={paperTheme}>
      <ToastProvider>
        {isAuthenticated ? <HomeScreen /> : <LoginScreen />}
      </ToastProvider>
    </PaperProvider>
  );
};

import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <ThemedApp />
            </QueryClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
