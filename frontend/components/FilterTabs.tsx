import React from "react";
import { View, StyleSheet } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import { JobStatus } from "../types";
import { useTheme } from "../context/ThemeContext";

interface FilterTabsProps {
  activeFilter: JobStatus | "all";
  onFilterChange: (filter: JobStatus | "all") => void;
  getJobCount: (status: JobStatus) => number;
  totalJobs: number;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilter,
  onFilterChange,
  getJobCount,
  totalJobs,
}) => {
  const { colors } = useTheme();

  const buttons = [
    {
      value: "in_progress",
      label: `In Progress (${getJobCount("in_progress")})`,
    },
    {
      value: "wishlist",
      label: `Wishlist (${getJobCount("wishlist")})`,
    },
    {
      value: "archived",
      label: `Archived (${getJobCount("archived")})`,
    },
    {
      value: "all",
      label: `All (${totalJobs})`,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <SegmentedButtons
        value={activeFilter}
        onValueChange={(value) => onFilterChange(value as JobStatus | "all")}
        buttons={buttons}
        style={styles.segmentedButtons}
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
  segmentedButtons: {
    // SegmentedButtons will use theme colors automatically
  },
});

export default FilterTabs;
