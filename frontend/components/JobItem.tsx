import React, { useCallback, useMemo, useState, memo, useEffect } from "react";
import * as Haptics from 'expo-haptics';
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Text, Button, Chip, IconButton, Menu } from "react-native-paper";
import { Job, JobStatus } from "../types";
import { getStatusColor } from "../utils/jobStyles";
import { formatDateTime } from "../utils/date";
import { useTheme } from "../context/ThemeContext";

const STATUS_OPTIONS: { label: string; value: JobStatus }[] = [
  { label: "Wishlist", value: "wishlist" },
  { label: "In Progress", value: "in_progress" },
  { label: "Archived", value: "archived" },
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

const PREVIEW_COMMENT_COUNT = 3;

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
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [isStatusMenuVisible, setIsStatusMenuVisible] = useState(false);

  useEffect(() => {
    setCommentsExpanded(false);
  }, [job.id]);

  const handleEditPress = useCallback(() => {
    onEdit(job);
  }, [job, onEdit]);

  const handleDeletePress = useCallback(() => {
    onDelete(job.id);
  }, [job.id, onDelete]);

  const handleCommentsPress = useCallback(() => {
    onViewComments(job);
  }, [job, onViewComments]);

  const handleStatusSelect = useCallback(
    (status: JobStatus) => {
      setIsStatusMenuVisible(false);
      if (status === job.status) {
        return;
      }
      onChangeStatus(job, status);
    },
    [job, onChangeStatus]
  );

  const handleToggleComments = useCallback(() => {
    setCommentsExpanded((prev) => !prev);
  }, []);

  const handleDragStart = useCallback(() => {
    if (onDrag) {
      Haptics.selectionAsync();
      onDrag();
    }
  }, [onDrag]);

  const formatStatus = (status: JobStatus): string =>
    status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  const commentCount = job.comments?.length ?? 0;
  const displayedComments = useMemo(() => {
    const comments = job.comments || [];
    return commentsExpanded
      ? comments
      : comments.slice(0, PREVIEW_COMMENT_COUNT);
  }, [job.comments, commentsExpanded]);

  const toggleLabel = useMemo(() => {
    if (commentsExpanded) {
      return "Show fewer comments";
    }
    if (commentCount > PREVIEW_COMMENT_COUNT) {
      return `View all ${commentCount} comments`;
    }
    return "Expand comments";
  }, [commentsExpanded, commentCount]);

  return (
    <Card style={[styles.card, isDragging && styles.dragging]} mode="elevated">
      <Card.Content>
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
              title="Change Status"
              disabled
              titleStyle={{ fontWeight: 'bold' }}
            />
            {STATUS_OPTIONS.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => handleStatusSelect(option.value)}
                title={option.label}
                leadingIcon={job.status === option.value ? "check" : undefined}
              />
            ))}
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
              style={{ backgroundColor: getStatusColor(job.status) }}
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

        <View style={styles.metaRow}>
          <Text variant="bodySmall" style={{ color: colors.primary }}>
            Updated {formatDateTime(job.updated_at)}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
            {commentCount} comment{commentCount === 1 ? "" : "s"}
          </Text>
        </View>

        {job.salary_expectations && (
          <Text variant="bodyMedium" style={{ marginTop: 8, color: colors.text }}>
            Salary expectations: {job.salary_expectations}
          </Text>
        )}

        {displayedComments.length > 0 && (
          <View style={styles.commentsPreview}>
            {displayedComments.map((comment) => (
              <Card key={comment.id} mode="outlined" style={{ marginBottom: 8 }}>
                <Card.Content>
                  <Text variant="labelSmall" style={{ color: colors.primary, marginBottom: 4 }}>
                    {formatDateTime(comment.updated_at)}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: colors.text }}
                    numberOfLines={commentsExpanded ? undefined : 2}
                  >
                    {comment.content}
                  </Text>
                </Card.Content>
              </Card>
            ))}
            {commentCount > 0 && (
              <Button mode="text" onPress={handleToggleComments}>
                {toggleLabel}
              </Button>
            )}
          </View>
        )}
      </Card.Content>

      <Card.Actions>
        <Button mode="contained" onPress={handleEditPress}>
          Edit
        </Button>
        <Button mode="contained-tonal" onPress={handleCommentsPress}>
          Comments
        </Button>
        <Button
          mode="contained"
          buttonColor={colors.error}
          onPress={handleDeletePress}
        >
          Delete
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
  commentsPreview: {
    marginTop: 12,
  },
});

export default memo(JobItem);
