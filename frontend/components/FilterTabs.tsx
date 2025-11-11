import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { JobStatus } from "../types";

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
  const filters = [
    {
      id: "in_progress" as JobStatus,
      label: "In Progress",
      count: getJobCount("in_progress"),
    },
    {
      id: "wishlist" as JobStatus,
      label: "Wishlist",
      count: getJobCount("wishlist"),
    },
    {
      id: "archived" as JobStatus,
      label: "Archived",
      count: getJobCount("archived"),
    },
    { id: "all" as const, label: "All", count: totalJobs },
  ];

  const handlePress = (filterId: JobStatus | "all") => {
    onFilterChange(filterId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.tab,
              activeFilter === filter.id && styles.tabActive,
            ]}
            onPress={() => handlePress(filter.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeFilter === filter.id && styles.tabTextActive,
              ]}
            >
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  scroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  tabActive: {
    backgroundColor: "#4a90e2",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  tabTextActive: {
    color: "#ffffff",
  },
});

export default FilterTabs;

