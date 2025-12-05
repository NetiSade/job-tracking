import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { setSessionToken } from '../services/auth';
import axios from 'axios';
import { API_URL } from '../config';
import './Login.css';

export const Login = () => {
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse: any) => {
        try {
            const { credential } = credentialResponse;
            // Exchange ID token for session token with backend
            const res = await axios.post(`${API_URL}/auth/google`, {
                id_token: credential
            });

            if (res.data.token) {
                setSessionToken(res.data.token);
                navigate('/');
            }
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Job Tracker</h1>
                <p>Manage your job applications efficiently.</p>
                <div className="google-btn-wrapper">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
