import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { ThemeColors } from "../constants/theme";

interface AppHeaderProps {
  activeCount: number;
  wishlistCount: number;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  activeCount,
  wishlistCount,
}) => {
  const { toggleTheme, isDark } = useTheme();
  const styles = useThemedStyles(stylesFactory);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Job Tracker</Text>
        <Text style={styles.subtitle}>
          {activeCount} active • {wishlistCount} wishlist
        </Text>
      </View>
      <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
        <Text style={styles.themeButtonText}>{isDark ? "☀️" : "🌙"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const stylesFactory = (colors: ThemeColors) => StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.headerBackground,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.headerText,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
    color: colors.headerText,
  },
  themeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  themeButtonText: {
    fontSize: 20,
  },
});

export default AppHeader;

