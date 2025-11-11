import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Job, JobComment } from "../types";
import { formatDate, formatDateTime, isDifferentTimestamp } from "../utils/date";

interface JobCommentsModalProps {
  visible: boolean;
  job: Job | null;
  onClose: () => void;
  onAddComment: (jobId: string, content: string) => Promise<JobComment>;
  onUpdateComment: (
    jobId: string,
    commentId: string,
    content: string
  ) => Promise<JobComment>;
  onDeleteComment: (jobId: string, commentId: string) => Promise<void>;
}

interface CommentItemProps {
  comment: JobComment;
  onEdit: (comment: JobComment) => void;
  onDelete: (comment: JobComment) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onEdit, onDelete }) => {
  const handleEditPress = useCallback(() => {
    onEdit(comment);
  }, [comment, onEdit]);

  const handleDeletePress = useCallback(() => {
    onDelete(comment);
  }, [comment, onDelete]);

  const createdLabel = formatDateTime(comment.created_at);
  const updatedLabel = formatDateTime(comment.updated_at);
  const edited = isDifferentTimestamp(comment.created_at, comment.updated_at);

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentDate}>{createdLabel}</Text>
        {edited && <Text style={styles.commentEdited}>Edited {updatedLabel}</Text>}
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity
          style={[styles.commentButton, styles.commentEditButton]}
          onPress={handleEditPress}
        >
          <Text style={styles.commentButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.commentButton, styles.commentDeleteButton]}
          onPress={handleDeletePress}
        >
          <Text style={styles.commentButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const JobCommentsModal: React.FC<JobCommentsModalProps> = ({
  visible,
  job,
  onClose,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}) => {
  const [content, setContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset form when the modal closes or job changes
    if (!visible || !job) {
      setContent("");
      setEditingCommentId(null);
    }
  }, [visible, job]);

  useEffect(() => {
    if (!job || !editingCommentId) {
      return;
    }
    const stillExists = job.comments.some((comment) => comment.id === editingCommentId);
    if (!stillExists) {
      setEditingCommentId(null);
      setContent("");
    }
  }, [job, editingCommentId]);

  const handleChangeContent = useCallback((text: string) => {
    setContent(text);
  }, []);

  const handleStartEdit = useCallback((comment: JobComment) => {
    setEditingCommentId(comment.id);
    setContent(comment.content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setContent("");
  }, []);

  const handleDeleteComment = useCallback(
    (comment: JobComment) => {
      if (!job) return;

      Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await onDeleteComment(job.id, comment.id);
          },
        },
      ]);
    },
    [job, onDeleteComment]
  );

  const handleSubmit = useCallback(async () => {
    if (!job) return;

    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert("Comment required", "Please enter some details.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCommentId) {
        await onUpdateComment(job.id, editingCommentId, trimmed);
      } else {
        await onAddComment(job.id, trimmed);
      }
      setContent("");
      setEditingCommentId(null);
    } catch (error) {
      Alert.alert("Error", "Could not save comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [job, content, editingCommentId, onAddComment, onUpdateComment]);

  const modalTitle = job ? `${job.company} • Comments` : "Comments";
  const primaryButtonLabel = editingCommentId ? "Update Comment" : "Add Comment";

  const sortedComments = useMemo(() => job?.comments ?? [], [job]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.headerAction}>Close</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            {job && (
              <Text style={styles.modalSubtitle}>
                Last updated {formatDate(job.updated_at)}
              </Text>
            )}
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
          keyboardShouldPersistTaps="handled"
        >
          {sortedComments.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No updates yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Use the form below to add the first progress update.
              </Text>
            </View>
          )}

          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={handleStartEdit}
              onDelete={handleDeleteComment}
            />
          ))}
        </ScrollView>

        <View style={styles.divider} />

        <View style={styles.formContainer}>
          <Text style={styles.formLabel}>
            {editingCommentId ? "Edit comment" : "Add a new comment"}
          </Text>
          <TextInput
            style={styles.textArea}
            value={content}
            onChangeText={handleChangeContent}
            placeholder="Share updates about this application..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.formActions}>
            {editingCommentId && (
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.formButton, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Saving..." : primaryButtonLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerPlaceholder: {
    width: 60,
  },
  headerAction: {
    fontSize: 16,
    color: "#4a90e2",
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  commentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentDate: {
    fontSize: 13,
    color: "#4a90e2",
    fontWeight: "600",
  },
  commentEdited: {
    fontSize: 12,
    color: "#999",
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 8,
  },
  commentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  commentEditButton: {
    backgroundColor: "#4a90e2",
  },
  commentDeleteButton: {
    backgroundColor: "#e74c3c",
  },
  commentButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#fafafa",
    minHeight: 120,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 10,
  },
  formButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#4a90e2",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default JobCommentsModal;
