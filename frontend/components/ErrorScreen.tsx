import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ErrorScreenProps {
  title?: string;
  message?: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = "Failed to initialize app",
  message = "Please restart the application",
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e74c3c",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#999",
  },
});

export default ErrorScreen;

