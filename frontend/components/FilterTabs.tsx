import React from "react";
import { View, StyleSheet } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import { JobStatus } from "../types";
import { useTheme } from "../context/ThemeContext";
import { STATUS_LABELS } from "../utils/statusMapping";

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
      label: `${STATUS_LABELS.in_progress} (${getJobCount("in_progress")})`,
    },
    {
      value: "wishlist",
      label: `${STATUS_LABELS.wishlist} (${getJobCount("wishlist")})`,
    },
    {
      value: "archived",
      label: `${STATUS_LABELS.archived} (${getJobCount("archived")})`,
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
