import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

const ErrorScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="displayLarge" style={styles.emoji}>🔐</Text>
      <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
        Authentication Required
      </Text>
      <Text variant="bodyLarge" style={[styles.message, { color: colors.textSecondary }]}>
        Please sign in to view your jobs
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emoji: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  message: {
    textAlign: "center",
  },
});

export default ErrorScreen;
