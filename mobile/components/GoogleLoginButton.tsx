import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useAuth } from '../hooks/useAuth';

export const GoogleLoginButton = () => {
    const { signInWithGoogle, isAuthenticating } = useAuth();

    return (
        <View style={styles.container}>
            <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={signInWithGoogle}
                disabled={isAuthenticating}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
});
