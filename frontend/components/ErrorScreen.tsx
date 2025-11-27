import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useThemedStyles } from "../hooks/useThemedStyles";
import { ThemeColors } from "../constants/theme";

const ErrorScreen: React.FC = () => {
  const styles = useThemedStyles(stylesFactory);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔐</Text>
      <Text style={styles.title}>Authentication Required</Text>
      <Text style={styles.message}>
        Please sign in to view your jobs
      </Text>
    </View>
  );
};

const stylesFactory = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: colors.textSecondary,
  },
});

export default ErrorScreen;
