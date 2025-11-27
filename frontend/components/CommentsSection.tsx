import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { Job } from "../types";
import { formatDateTime } from "../utils/date";
import { useTheme } from "../context/ThemeContext";

const LAST_COMMENTS_COUNT = 5;

type JobComment = Job["comments"] extends (infer C)[] ? C : never;

interface CommentsSectionProps {
    comments?: JobComment[];
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments = [] }) => {
    const { colors } = useTheme();
    const [expanded, setExpanded] = useState(false);

    // Reset expand state when comment list changes
    useEffect(() => {
        setExpanded(false);
    }, [comments.length]);

    const commentCount = comments.length;
    const hasMoreComments = commentCount > LAST_COMMENTS_COUNT;

    const visibleComments = useMemo(
        () =>
            expanded || !hasMoreComments
                ? comments
                : comments.slice(-LAST_COMMENTS_COUNT),
        [comments, expanded, hasMoreComments]
    );

    const toggleLabel = expanded
        ? "Show fewer comments"
        : `View all ${commentCount} comments`;

    const handleToggle = useCallback(() => {
        setExpanded((prev) => !prev);
    }, []);

    if (visibleComments.length === 0) return null;

    return (
        <View style={styles.commentsPreview}>
            {visibleComments.map((comment) => (
                <Card key={comment.id} mode="outlined" style={styles.commentCard}>
                    <Card.Content>
                        <Text
                            variant="labelSmall"
                            style={{ color: colors.primary, marginBottom: 4 }}
                        >
                            {formatDateTime(comment.updated_at)}
                        </Text>
                        <Text
                            variant="bodySmall"
                            style={{ color: colors.text }}
                            numberOfLines={expanded ? undefined : 2}
                        >
                            {comment.content}
                        </Text>
                    </Card.Content>
                </Card>
            ))}

            {hasMoreComments && (
                <Button mode="text" onPress={handleToggle}>
                    {toggleLabel}
                </Button>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    commentsPreview: {
        marginTop: 12,
    },
    commentCard: {
        marginBottom: 8,
    },
});

export default CommentsSection;
