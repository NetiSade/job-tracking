import React from "react";
import { ScrollView, StyleSheet, View, Linking } from "react-native";
import { Portal, Dialog, Text, Button, Divider, Surface } from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

interface AboutScreenProps {
    visible: boolean;
    onClose: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ visible, onClose }) => {
    const { colors } = useTheme();

    const handleGitHub = () => {
        Linking.openURL("https://github.com/NetiSade/job-tracking");
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
                <Dialog.Title>About My Career Journey</Dialog.Title>

                <Dialog.ScrollArea style={styles.scrollArea}>
                    <ScrollView contentContainerStyle={styles.content}>
                        {/* App Icon/Logo Section */}
                        <View style={styles.logoSection}>
                            <Text variant="displaySmall" style={{ textAlign: "center" }}>
                                🚀
                            </Text>
                            <Text variant="titleLarge" style={{ textAlign: "center", color: colors.text, marginTop: 8 }}>
                                My Career Journey
                            </Text>
                            <Text variant="bodyMedium" style={{ textAlign: "center", color: colors.textSecondary, marginTop: 4 }}>
                                Version 1.0.0
                            </Text>
                        </View>

                        <Divider style={styles.divider} />

                        {/* Description */}
                        <Surface style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text variant="titleMedium" style={{ color: colors.primary, marginBottom: 8 }}>
                                📱 About This App
                            </Text>
                            <Text variant="bodyMedium" style={{ color: colors.text, lineHeight: 22 }}>
                                My Career Journey helps you track and manage your job search opportunities.
                                Organize applications, track progress, and stay on top of your career goals
                                with a beautiful, intuitive interface.
                            </Text>
                        </Surface>

                        {/* Features */}
                        <Surface style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text variant="titleMedium" style={{ color: colors.primary, marginBottom: 8 }}>
                                ✨ Features
                            </Text>
                            <Text variant="bodyMedium" style={{ color: colors.text, lineHeight: 22 }}>
                                • Track opportunities across different stages{'\n'}
                                • Add notes and comments to each job{'\n'}
                                • Beautiful light & dark themes{'\n'}
                                • Offline support{'\n'}
                                • Drag & drop reordering{'\n'}
                                • Haptic feedback
                            </Text>
                        </Surface>

                        {/* Tech Stack */}
                        <Surface style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text variant="titleMedium" style={{ color: colors.primary, marginBottom: 8 }}>
                                🛠️ Built With
                            </Text>
                            <Text variant="bodyMedium" style={{ color: colors.text, lineHeight: 22 }}>
                                • React Native & Expo{'\n'}
                                • TypeScript{'\n'}
                                • React Query{'\n'}
                                • React Native Paper{'\n'}
                                • Express & PostgreSQL
                            </Text>
                        </Surface>

                        {/* Credits */}
                        <Surface style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text variant="titleMedium" style={{ color: colors.primary, marginBottom: 8 }}>
                                💙 Credits
                            </Text>
                            <Text variant="bodyMedium" style={{ color: colors.text, lineHeight: 22 }}>
                                Developed with love by Neti Sade
                            </Text>
                            <Button
                                mode="text"
                                icon="github"
                                onPress={handleGitHub}
                                style={{ marginTop: 8, alignSelf: "flex-start" }}
                            >
                                View on GitHub
                            </Button>
                        </Surface>

                        {/* Footer */}
                        <Text
                            variant="bodySmall"
                            style={{
                                textAlign: "center",
                                color: colors.textSecondary,
                                marginTop: 24,
                                fontStyle: "italic"
                            }}
                        >
                            Made with ☕, 🚀 and 🤖
                        </Text>
                    </ScrollView>
                </Dialog.ScrollArea>

                <Dialog.Actions>
                    <Button onPress={onClose}>Close</Button>
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
        paddingBottom: 16,
    },
    logoSection: {
        alignItems: "center",
        paddingVertical: 16,
    },
    divider: {
        marginVertical: 16,
    },
    section: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
});
