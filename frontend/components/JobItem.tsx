import React, { useCallback, memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Job, JobStatus } from "../types";
import { getStatusColor, getPriorityColor } from "../utils/jobStyles";
import { formatDate, formatDateTime, isDifferentTimestamp } from "../utils/date";

interface JobItemProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onViewComments: (job: Job) => void;
}

const JobItem: React.FC<JobItemProps> = ({ job, onEdit, onDelete, onViewComments }) => {
  const handleEditPress = useCallback(() => {
    onEdit(job);
  }, [job, onEdit]);

  const handleDeletePress = useCallback(() => {
    onDelete(job.id);
  }, [job.id, onDelete]);

  const handleCommentsPress = useCallback(() => {
    onViewComments(job);
  }, [job, onViewComments]);

  const formatStatus = (status: JobStatus): string =>
    status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  const commentCount = job.comments?.length ?? 0;
  const lastComment = job.comments?.[0];

  const lastCommentLabel = lastComment
    ? `Last comment ${formatDateTime(lastComment.updated_at)}`
    : "No comments yet";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.company}>{job.company}</Text>
            <Text style={styles.position}>{job.position}</Text>
          </View>
          <View style={styles.badges}>
            <View
              style={[
                styles.badge,
                { backgroundColor: getPriorityColor(job.priority) },
              ]}
            >
              <Text style={styles.badgeText}>{job.priority.toUpperCase()}</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: getStatusColor(job.status) },
              ]}
            >
              <Text style={styles.badgeText}>{formatStatus(job.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaPrimary}>{`Updated ${formatDateTime(
            job.updated_at
          )}`}</Text>
          <Text style={styles.metaSecondary}>{`${commentCount} comment${
            commentCount === 1 ? "" : "s"
          }`}</Text>
        </View>

        <Text style={styles.metaHint}>{lastCommentLabel}</Text>

        {lastComment && isDifferentTimestamp(lastComment.created_at, lastComment.updated_at) && (
          <Text style={styles.metaNote}>Edited comment</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEditPress}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.commentButton]}
          onPress={handleCommentsPress}
        >
          <Text style={styles.buttonText}>Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeletePress}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  company: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  position: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  badges: {
    flexDirection: "row",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaPrimary: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a90e2",
  },
  metaSecondary: {
    fontSize: 14,
    color: "#666",
  },
  metaHint: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },
  metaNote: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#4a90e2",
    marginRight: 4,
  },
  commentButton: {
    backgroundColor: "#7b61ff",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    marginLeft: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default memo(JobItem);
