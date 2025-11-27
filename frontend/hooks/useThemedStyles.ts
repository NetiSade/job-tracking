import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../constants/theme";

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  styleFactory: (colors: ThemeColors) => T
): T => {
  const { colors } = useTheme();

  return useMemo(() => {
    return StyleSheet.create(styleFactory(colors));
  }, [colors, styleFactory]);
};
