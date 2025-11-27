import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "../hooks/useThemedStyles";
import { ThemeColors } from "../constants/theme";

interface FloatingActionButtonProps {
  onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
}) => {
  const styles = useThemedStyles(stylesFactory);

  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
  );
};

const stylesFactory = (colors: ThemeColors) => StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default FloatingActionButton;
