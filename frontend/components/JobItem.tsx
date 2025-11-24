import React, { useCallback, useMemo, useState, memo, useEffect } from "react";
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Job, JobStatus } from "../types";
import { getStatusColor } from "../utils/jobStyles";
import { formatDateTime } from "../utils/date";

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
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [menuButtonLayout, setMenuButtonLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

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

  const [isStatusMenuVisible, setIsStatusMenuVisible] = useState(false);

  const menuButtonRef = React.useRef<TouchableOpacity>(null);

  const handleMenuButtonPress = useCallback(() => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      setMenuButtonLayout({ x, y, width, height });
      setIsStatusMenuVisible(true);
    });
  }, []);

  const closeStatusMenu = useCallback(() => {
    setIsStatusMenuVisible(false);
  }, []);

  const handleStatusSelect = useCallback(
    (status: JobStatus) => {
      closeStatusMenu();
      if (status === job.status) {
        return;
      }
      onChangeStatus(job, status);
    },
    [closeStatusMenu, job, onChangeStatus]
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
    <View style={[styles.container, isDragging && styles.dragging]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            ref={menuButtonRef}
            style={styles.menuButton}
            onPress={handleMenuButtonPress}
          >
            <Text style={styles.menuButtonText}>⋮</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.company}>{job.company}</Text>
            <Text style={styles.position}>{job.position}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.badges}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getStatusColor(job.status) },
                ]}
              >
                <Text style={styles.badgeText}>{formatStatus(job.status)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.dragHandle}
              onLongPress={handleDragStart}
              delayLongPress={120}
              disabled={!onDrag}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.dragHandleText}>:::</Text>
            </TouchableOpacity>
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

        {job.salary_expectations ? (
          <Text style={styles.salaryText}>
            {`Salary expectations: ${job.salary_expectations}`}
          </Text>
        ) : null}

        {displayedComments.length > 0 && (
          <View style={styles.commentsPreview}>
            {displayedComments.map((comment) => (
              <View key={comment.id} style={styles.commentRow}>
                <Text style={styles.commentTimestamp}>
                  {formatDateTime(comment.updated_at)}
                </Text>
                <Text
                  style={styles.commentText}
                  numberOfLines={commentsExpanded ? undefined : 2}
                >
                  {comment.content}
                </Text>
              </View>
            ))}
            {commentCount > 0 && (
              <TouchableOpacity
                style={styles.toggleCommentsButton}
                onPress={handleToggleComments}
              >
                <Text style={styles.toggleCommentsText}>{toggleLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <Modal
        visible={isStatusMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeStatusMenu}
      >
        <View style={styles.menuOverlay}>
          <TouchableWithoutFeedback onPress={closeStatusMenu}>
            <View style={styles.menuBackdrop} />
          </TouchableWithoutFeedback>
          {menuButtonLayout && (
            <View
              style={[
                styles.menuContainer,
                {
                  top: menuButtonLayout.y + menuButtonLayout.height + 4,
                  left: menuButtonLayout.x,
                },
              ]}
            >
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Change Status</Text>
                {STATUS_OPTIONS.map((option) => {
                  const isActive = option.value === job.status;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.menuItem,
                        isActive && [
                          styles.menuItemActive,
                          { borderLeftColor: getStatusColor(option.value) },
                        ],
                      ]}
                      onPress={() => handleStatusSelect(option.value)}
                    >
                      <Text
                        style={[
                          styles.menuItemText,
                          isActive && styles.menuItemTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </Modal>

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
  dragging: {
    opacity: 0.9,
    shadowOpacity: 0.2,
    transform: [{ scale: 0.98 }],
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
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dragHandle: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d6dbe4",
    backgroundColor: "#f5f7fa",
  },
  dragHandleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7b8898",
    letterSpacing: 1,
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
    alignItems: "center",
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
  menuButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  menuButtonText: {
    fontSize: 20,
    color: "#516175",
    fontWeight: "600",
    lineHeight: 20,
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
  salaryText: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
  },
  commentsPreview: {
    marginTop: 12,
    gap: 8,
  },
  toggleCommentsButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#eef1f6",
  },
  toggleCommentsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4a90e2",
  },
  commentRow: {
    backgroundColor: "#f7f9fc",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e6f0",
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#4a90e2",
    fontWeight: "600",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
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
  menuOverlay: {
    flex: 1,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  menuContainer: {
    position: "absolute",
    alignItems: "flex-start",
  },
  menuContent: {
    width: 200,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#516175",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuItemActive: {
    backgroundColor: "#eef1f6",
    borderLeftWidth: 3,
    borderLeftColor: "#4a90e2",
  },
  menuItemText: {
    fontSize: 14,
    color: "#333",
  },
  menuItemTextActive: {
    fontWeight: "600",
    color: "#4a90e2",
  },
});

export default memo(JobItem);
