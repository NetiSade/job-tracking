import React from 'react';
import { Alert } from 'react-native';
import { Portal, Dialog, List, Divider, Switch } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    onAboutPress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onAboutPress }) => {
    const { isDark, toggleTheme, colors } = useTheme();
    const { signOut } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        console.log('User confirmed logout');
                        await signOut();
                        onClose();
                    },
                },
            ]
        );
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onClose} style={{ backgroundColor: colors.card }}>
                <Dialog.Title style={{ color: colors.text }}>Settings</Dialog.Title>
                <Dialog.Content>
                    <List.Item
                        title="Dark Mode"
                        titleStyle={{ color: colors.text }}
                        left={() => <List.Icon icon="theme-light-dark" color={colors.text} />}
                        right={() => (
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                color={colors.primary}
                            />
                        )}
                    />
                    <Divider style={{ backgroundColor: colors.border }} />
                    <List.Item
                        title="About"
                        titleStyle={{ color: colors.text }}
                        left={() => <List.Icon icon="information-outline" color={colors.text} />}
                        onPress={() => {
                            onAboutPress();
                        }}
                    />
                    <Divider style={{ backgroundColor: colors.border }} />
                    <List.Item
                        title="Logout"
                        titleStyle={{ color: colors.error }}
                        left={() => <List.Icon icon="logout" color={colors.error} />}
                        onPress={handleLogout}
                    />
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
};
