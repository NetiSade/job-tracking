import "react-native-gesture-handler";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { ToastProvider } from "./components/ToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomeScreen from "./screens/HomeScreen";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

const queryClient = new QueryClient();

// Wrapper component to access theme context
const ThemedApp = () => {
  const { isDark, colors } = useTheme();

  const paperTheme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: colors.primary,
      surface: colors.card,
      background: colors.background,
      error: colors.error,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <ToastProvider>
        <HomeScreen />
      </ToastProvider>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <ThemedApp />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
