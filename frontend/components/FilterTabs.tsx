import React from "react";
import { View, StyleSheet } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import { JobStatus } from "../types";
import { useTheme } from "../context/ThemeContext";

interface FilterTabsProps {
  activeFilter: JobStatus;
  onFilterChange: (filter: JobStatus) => void;
  getJobCount: (status: JobStatus) => number;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilter,
  onFilterChange,
  getJobCount,
}) => {
  const { colors } = useTheme();

  const buttons = [
    {
      value: "in_progress",
      label: `Active (${getJobCount("in_progress")})`,
    },
    {
      value: "wishlist",
      label: `Wishlist (${getJobCount("wishlist")})`,
    },
    {
      value: "archived",
      label: `Archived (${getJobCount("archived")})`,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <SegmentedButtons
        value={activeFilter}
        onValueChange={(value) => onFilterChange(value as JobStatus)}
        buttons={buttons}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
});

export default FilterTabs;
