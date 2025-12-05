import React, { useRef, useEffect } from "react";
import { Animated, Pressable } from "react-native";
import { FAB } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

// Standard bottom navigation height in React Native Paper
const BOTTOM_NAV_HEIGHT = 80;

interface FloatingActionButtonProps {
  onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.9)).current; // small start size

  // Calculate dynamic bottom position: bottom nav height + bottom safe area
  const bottomOffset = BOTTOM_NAV_HEIGHT + insets.bottom;

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
        bottom: bottomOffset,
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
