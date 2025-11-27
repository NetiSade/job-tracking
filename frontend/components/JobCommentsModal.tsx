import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
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
  onDeleteComment,
}) => {
  const { colors } = useTheme();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = useCallback(async () => {
    if (!job || !newComment.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(job.id, newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [job, newComment, onAddComment]);

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
                      <IconButton
                        icon="delete"
                        size={16}
                        onPress={() => handleDeleteComment(comment.id)}
                      />
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
          <Button
            mode="contained"
            onPress={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
            loading={isSubmitting}
          >
            Add Comment
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
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
