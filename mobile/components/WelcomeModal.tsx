import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Portal, Dialog, Text, Button, Surface } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

interface WelcomeModalProps {
    visible: boolean;
    onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
    const { colors } = useTheme();

    return (
        <Portal>
            {visible && (
                <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
                    <Dialog.Title>Welcome to My Career Journey! 🚀</Dialog.Title>

                    <Dialog.ScrollArea style={styles.scrollArea}>
                        <ScrollView contentContainerStyle={styles.content}>
                            {/* Hero Section */}
                            <Text
                                variant="headlineMedium"
                                style={{ textAlign: "center", color: colors.text, marginBottom: 8 }}
                            >
                                Track Your Career Path
                            </Text>
                            <Text
                                variant="bodyMedium"
                                style={{ textAlign: "center", color: colors.textSecondary, marginBottom: 24 }}
                            >
                                Stay organized and focused on your job search journey
                            </Text>

                            {/* Features */}
                            <Surface style={[styles.feature, { backgroundColor: colors.card }]}>
                                <Text variant="titleLarge" style={{ marginBottom: 4 }}>
                                    🌟 Explore Opportunities
                                </Text>
                                <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
                                    Save jobs you're interested in and keep track of them all in one place
                                </Text>
                            </Surface>

                            <Surface style={[styles.feature, { backgroundColor: colors.card }]}>
                                <Text variant="titleLarge" style={{ marginBottom: 4 }}>
                                    🚀 Take Action
                                </Text>
                                <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
                                    Move jobs through your pipeline as you apply and interview
                                </Text>
                            </Surface>

                            <Surface style={[styles.feature, { backgroundColor: colors.card }]}>
                                <Text variant="titleLarge" style={{ marginBottom: 4 }}>
                                    💬 Add Notes
                                </Text>
                                <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
                                    Keep track of important details, contacts, and follow-ups
                                </Text>
                            </Surface>

                            <Surface style={[styles.feature, { backgroundColor: colors.card }]}>
                                <Text variant="titleLarge" style={{ marginBottom: 4 }}>
                                    📂 Archive History
                                </Text>
                                <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
                                    Keep a record of your journey for future reference
                                </Text>
                            </Surface>

                            {/* CTA */}
                            <View style={styles.cta}>
                                <Text
                                    variant="titleMedium"
                                    style={{ textAlign: "center", color: colors.primary, marginBottom: 8 }}
                                >
                                    Ready to get started?
                                </Text>
                                <Text
                                    variant="bodyMedium"
                                    style={{ textAlign: "center", color: colors.textSecondary }}
                                >
                                    Tap the + button to add your first opportunity!
                                </Text>
                            </View>
                        </ScrollView>
                    </Dialog.ScrollArea>

                    <Dialog.Actions>
                        <Button mode="contained" onPress={onClose}>
                            Get Started
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            )}
        </Portal>
    );
};

const styles = StyleSheet.create({
    dialog: {
        maxHeight: '90%',
    },
    scrollArea: {
        paddingHorizontal: 0,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
    },
    feature: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    cta: {
        marginTop: 24,
        paddingVertical: 16,
    },
});
