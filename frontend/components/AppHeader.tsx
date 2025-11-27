import React from "react";
import { Appbar } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

interface AppHeaderProps {

}

const AppHeader: React.FC<AppHeaderProps> = ({

}) => {
  const { toggleTheme, isDark, colors } = useTheme();

  return (
    <Appbar.Header style={{ backgroundColor: colors.headerBackground }} >
      <Appbar.Content
        title="My Job Tracker"
        titleStyle={{ color: colors.headerText }}
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

