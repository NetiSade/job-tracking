import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { ThemeColors } from "../constants/theme";

const LoadingScreen: React.FC = () => {
  const styles = useThemedStyles(stylesFactory);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4a90e2" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const stylesFactory = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default LoadingScreen;
