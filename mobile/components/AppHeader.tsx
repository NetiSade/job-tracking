import React from "react";
import { Appbar } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

interface AppHeaderProps {
  onSettingsPress: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSettingsPress }) => {
  const { colors } = useTheme();

  return (
    <Appbar.Header style={{ backgroundColor: colors.headerBackground }}>
      <Appbar.Content
        title="My Career Journey 👨‍💻👩‍💻"
        titleStyle={{ color: colors.headerText }}
      />
      <Appbar.Action
        icon="cog"
        onPress={onSettingsPress}
        color={colors.headerText}
      />
    </Appbar.Header>
  );
};

export default AppHeader;
