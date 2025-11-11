import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface FloatingActionButtonProps {
  onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    fontSize: 32,
    color: "#ffffff",
    fontWeight: "300",
  },
});

export default FloatingActionButton;

