import React, { useRef, useEffect } from "react";
import { Animated, Pressable } from "react-native";
import { FAB } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

interface FloatingActionButtonProps {
  onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0.9)).current; // small start size

  // On mount → little entrance bounce
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 8,
      bounciness: 12,
      useNativeDriver: true,
    }).start();
  }, []);

  // Press feedback animation
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      speed: 30,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      bounciness: 6,
      speed: 12,
      useNativeDriver: true,
    }).start();
    onPress();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        position: "absolute",
        right: 0,
        bottom: 0,
      }}
    >
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <FAB
          icon="plus"
          color="white"
          style={{
            margin: 32,
            backgroundColor: colors.primary,
          }}
        />
      </Pressable>
    </Animated.View>
  );
};

export default FloatingActionButton;
