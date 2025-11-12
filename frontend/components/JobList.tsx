import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import JobItem from "./JobItem";
import { Job, JobStatus } from "../types";

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onViewComments: (job: Job) => void;
  onChangeStatus: (job: Job, status: JobStatus) => Promise<void> | void;
  onReorder: (orderedJobs: Job[]) => Promise<void> | void;
  refreshing: boolean;
  onRefresh: () => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  onEdit,
  onDelete,
  onViewComments,
  onChangeStatus,
  onReorder,
  refreshing,
  onRefresh,
}) => {
  if (jobs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No job applications yet</Text>
        <Text style={styles.emptySubtext}>Add your first job!</Text>
      </View>
    );
  }

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Job>) => (
      <JobItem
        job={item}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewComments={onViewComments}
        onChangeStatus={onChangeStatus}
        onDrag={drag}
        isDragging={isActive}
      />
    ),
    [onEdit, onDelete, onViewComments, onChangeStatus]
  );

  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: Job[] }) => {
      if (data.length === 0) {
        return;
      }
      Promise.resolve(onReorder(data)).catch(() => {
        // Errors are surfaced via hook-level alerts; suppress console noise here.
      });
    },
    [onReorder]
  );

  return (
    <DraggableFlatList
      style={styles.list}
      data={jobs}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
      onDragEnd={handleDragEnd}
      activationDistance={12}
      containerStyle={styles.listContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
  },
  container: {
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    backgroundColor: "#ffffff",
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
});

export default JobList;
