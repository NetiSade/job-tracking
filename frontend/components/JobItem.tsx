import React, { useCallback, useState, memo } from "react";
import * as Haptics from "expo-haptics";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Text, Button, Chip, IconButton, Menu, Divider } from "react-native-paper";
import { Job, JobStatus } from "../types";
import { getStatusColor } from "../utils/jobStyles";
import { formatDateTime } from "../utils/date";
import { useTheme } from "../context/ThemeContext";
import CommentsSection from "./CommentsSection";

const STATUS_OPTIONS: { label: string; value: JobStatus }[] = [
  { label: "🌟 Exploring", value: "wishlist" },
  { label: "🚀 Taking Action", value: "in_progress" },
  { label: "✅ Completed", value: "archived" },
];

interface JobItemProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onViewComments: (job: Job) => void;
  onChangeStatus: (job: Job, status: JobStatus) => Promise<void> | void;
  onDrag?: () => void;
  isDragging?: boolean;
}

const JobItem: React.FC<JobItemProps> = ({
  job,
  onEdit,
  onDelete,
  onViewComments,
  onChangeStatus,
  onDrag,
  isDragging,
}) => {
  const { colors } = useTheme();
  const [isStatusMenuVisible, setIsStatusMenuVisible] = useState(false);

  const comments = job.comments ?? [];
  const commentCount = comments.length;

  const handleEditPress = useCallback(() => {
    onEdit(job);
  }, [job, onEdit]);

  const handleCommentsPress = useCallback(() => {
    onViewComments(job);
  }, [job, onViewComments]);

  const handleStatusSelect = useCallback(
    (status: JobStatus) => {
      setIsStatusMenuVisible(false);
      if (status !== job.status) {
        onChangeStatus(job, status);
      }
    },
    [job, onChangeStatus]
  );

  const handleDragStart = useCallback(() => {
    if (onDrag) {
      Haptics.selectionAsync();
      onDrag();
    }
  }, [onDrag]);

  const formatStatus = (status: JobStatus): string =>
    status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        isDragging && styles.dragging
      ]}
      mode="elevated"
    >
      <Card.Content>
        {/* HEADER */}
        <View style={styles.header}>
          <Menu
            visible={isStatusMenuVisible}
            onDismiss={() => setIsStatusMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setIsStatusMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              title="Update Journey Stage"
              disabled
              titleStyle={{ fontWeight: "bold" }}
            />

            {STATUS_OPTIONS.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => handleStatusSelect(option.value)}
                title={option.label}
                leadingIcon={job.status === option.value ? "check" : undefined}
              />
            ))}

            <Divider />

            <Menu.Item
              title="Delete"
              leadingIcon="trash-can"
              onPress={() => onDelete(job.id)}
              titleStyle={{ color: "red" }}
            />
          </Menu>


          <View style={styles.headerTextContainer}>
            <Text variant="titleLarge" style={{ color: colors.text }}>
              {job.company}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
              {job.position}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Chip
              mode="flat"
              style={{ backgroundColor: getStatusColor(job.status, colors) }}
              textStyle={{ color: "#ffffff" }}
            >
              {formatStatus(job.status)}
            </Chip>

            {onDrag && (
              <TouchableOpacity
                onLongPress={handleDragStart}
                delayLongPress={120}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconButton icon="drag-horizontal-variant" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* META */}
        <View style={styles.metaRow}>
          <Text variant="bodySmall" style={{ color: colors.primary }}>
            Updated {formatDateTime(job.updated_at)}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
            {commentCount} comment{commentCount === 1 ? "" : "s"}
          </Text>
        </View>

        {/* SALARY */}
        {job.salary_expectations && (
          <Text
            variant="bodyMedium"
            style={{ marginTop: 8, color: colors.text }}
          >
            Target compensation: {job.salary_expectations}
          </Text>
        )}

        {/* COMMENTS */}
        <CommentsSection comments={comments} />
      </Card.Content>

      <Divider style={styles.divider} />

      {/* FOOTER ACTIONS */}
      <Card.Actions style={styles.actionsFooter}>
        <Button mode="text" onPress={handleEditPress} icon="pencil">
          Edit
        </Button>
        <Button mode="text" onPress={handleCommentsPress} icon="comment-outline">
          Comments
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  dragging: {
    opacity: 0.9,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  divider: {
    marginVertical: 8,
  },
  actionsFooter: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 8,
    paddingHorizontal: 0,
  },
});

export default memo(JobItem);
