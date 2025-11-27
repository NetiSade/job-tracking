import React from "react";
import { FAB } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

interface FloatingActionButtonProps {
  onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <FAB
      icon="plus"
      color="white"
      style={{
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary,
      }}
      onPress={onPress}
    />
  );
};

export default FloatingActionButton;
