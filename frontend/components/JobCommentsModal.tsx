import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Portal, Dialog, Button, TextInput, Text, Card, IconButton } from "react-native-paper";
import { Job, JobComment } from "../types";
import { formatDateTime } from "../utils/date";
import { useTheme } from "../context/ThemeContext";

interface JobCommentsModalProps {
  visible: boolean;
  onClose: () => void;
  job: Job | null;
  onAddComment: (jobId: string, content: string) => Promise<JobComment>;
  onUpdateComment: (jobId: string, commentId: string, content: string) => Promise<JobComment>;
  onDeleteComment: (jobId: string, commentId: string) => Promise<void>;
}

const JobCommentsModal: React.FC<JobCommentsModalProps> = ({
  visible,
  onClose,
  job,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}) => {
  const { colors } = useTheme();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const handleSubmitComment = useCallback(async () => {
    if (!job || !newComment.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCommentId) {
        await onUpdateComment(job.id, editingCommentId, newComment.trim());
        setEditingCommentId(null);
      } else {
        await onAddComment(job.id, newComment.trim());
      }
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [job, newComment, editingCommentId, onAddComment, onUpdateComment]);

  const handleEditComment = useCallback((comment: JobComment) => {
    setEditingCommentId(comment.id);
    setNewComment(comment.content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setNewComment("");
  }, []);

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!job) {
        return;
      }

      try {
        await onDeleteComment(job.id, commentId);
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    },
    [job, onDeleteComment]
  );

  if (!job) {
    return null;
  }

  const comments = job.comments || [];

  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
          <Dialog.Title>
            Comments - {job.company} ({job.position})
          </Dialog.Title>

          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView contentContainerStyle={styles.content}>
              {comments.length === 0 ? (
                <Text
                  variant="bodyMedium"
                  style={{ textAlign: "center", color: colors.textSecondary, marginVertical: 20 }}
                >
                  No comments yet. Add one below!
                </Text>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id} mode="outlined" style={styles.commentCard}>
                    <Card.Content>
                      <View style={styles.commentHeader}>
                        <Text variant="labelSmall" style={{ color: colors.primary }}>
                          {formatDateTime(comment.updated_at)}
                        </Text>
                        <View style={styles.commentActions}>
                          <IconButton
                            icon="pencil"
                            size={16}
                            onPress={() => handleEditComment(comment)}
                          />
                          <IconButton
                            icon="delete"
                            size={16}
                            onPress={() => handleDeleteComment(comment.id)}
                          />
                        </View>
                      </View>
                      <Text variant="bodyMedium" style={{ color: colors.text }}>
                        {comment.content}
                      </Text>
                    </Card.Content>
                  </Card>
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>

          <View style={styles.inputContainer}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.textInput}
            />
          </View>

          <Dialog.Actions>
            <Button onPress={onClose}>Close</Button>
            {editingCommentId && (
              <Button onPress={handleCancelEdit}>Cancel Edit</Button>
            )}
            <Button
              mode="contained"
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              loading={isSubmitting}
            >
              {editingCommentId ? "Update Comment" : "Add Comment"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  dialog: {
    maxHeight: '85%',
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  commentCard: {
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: -8,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  textInput: {
    maxHeight: 100,
  },
});

export default JobCommentsModal;
