import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import LoadingScreen from '../components/LoadingScreen';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const { isAuthenticating } = useAuth();

    if (isAuthenticating) {
        return <LoadingScreen />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View style={styles.content}>
                <Text variant="displaySmall" style={[styles.title, { color: colors.text }]}>
                    Welcome to
                </Text>
                <Text variant="displayMedium" style={[styles.appName, { color: colors.primary }]}>
                    Job Tracker 🚀
                </Text>
                <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Track your job applications with ease
                </Text>
                <View style={styles.buttonContainer}>
                    <GoogleLoginButton />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    appName: {
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    subtitle: {
        marginBottom: 48,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
    },
});
