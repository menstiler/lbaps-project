import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './header.css';

const Header = () => {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return null; // hide header on login page
    }

    return (
        <header className="header">
            <div className="header-content">
                <h1 className="header-title">To Do List</h1>
                <button
                    onClick={handleLogout}
                    className="logout-button"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
};

export default Header;