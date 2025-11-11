import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

const TOKEN_KEY = 'anonymous_auth_token';

// Sign in anonymously via backend
export const signInAnonymously = async (): Promise<string | null> => {
  try {
    console.log('🔐 Checking for existing session...');
    
    // Check if we have a stored token
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    
    if (storedToken) {
      console.log('✅ Found existing token in storage');
      return storedToken;
    }

    console.log('📝 Creating new anonymous session via backend...');
    
    // Request anonymous auth from backend
    const response = await axios.post(`${API_URL}/auth/anonymous`, {}, {
      timeout: 10000,
    });
    
    if (response.data?.token) {
      console.log('✅ Anonymous auth successful');
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
      return response.data.token;
    }
    
    console.error('❌ No token received from backend');
    return null;
  } catch (error: any) {
    console.error('❌ Error signing in anonymously:', error);
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
    });
    return null;
  }
};

// Get current session token
export const getSessionToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Get current user ID (stored with token)
export const getUserId = async (): Promise<string | null> => {
  return null; // Backend handles user_id
};

