import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Initializing...",
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4a90e2" />
      <Text style={styles.text}>{message}</Text>
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
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});

export default LoadingScreen;

