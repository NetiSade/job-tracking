import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { clearSession } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import './Layout.css';

export const Layout = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearSession();
        navigate('/login');
    };

    return (
        <div className="layout">
            <header className="header">
                <div className="header-content">
                    <h1>Job Tracker</h1>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};
