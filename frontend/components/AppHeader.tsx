import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AppHeaderProps {
  activeCount: number;
  wishlistCount: number;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  activeCount,
  wishlistCount,
}) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Job Tracker</Text>
        <Text style={styles.subtitle}>
          {activeCount} active • {wishlistCount} wishlist
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#4a90e2",
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.9,
    marginTop: 4,
  },
});

export default AppHeader;

