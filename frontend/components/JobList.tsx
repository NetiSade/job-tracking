import React from "react";
import { View, Text, StyleSheet } from "react-native";
import JobItem from "./JobItem";
import { Job } from "../types";

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onViewComments: (job: Job) => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  onEdit,
  onDelete,
  onViewComments,
}) => {
  if (jobs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No job applications yet</Text>
        <Text style={styles.emptySubtext}>Add your first job!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {jobs.map((job, index) => (
        <View key={job.id} style={index > 0 ? styles.itemSpacing : undefined}>
          <JobItem
            job={job}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewComments={onViewComments}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container for job items
  },
  itemSpacing: {
    marginTop: 12,
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
