import React from "react";
import { Appbar } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

interface AppHeaderProps {
  activeCount: number;
  wishlistCount: number;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  activeCount,
  wishlistCount,
}) => {
  const { toggleTheme, isDark, colors } = useTheme();

  return (
    <Appbar.Header style={{ backgroundColor: colors.headerBackground }}>
      <Appbar.Content
        title="Job Tracker"
        subtitle={`${activeCount} active • ${wishlistCount} wishlist`}
        titleStyle={{ color: colors.headerText }}
        subtitleStyle={{ color: colors.headerText, opacity: 0.9 }}
      />
      <Appbar.Action
        icon={isDark ? "white-balance-sunny" : "moon-waning-crescent"}
        onPress={toggleTheme}
        color={colors.headerText}
      />
    </Appbar.Header>
  );
};

export default AppHeader;

