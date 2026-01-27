import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './login.css';
import { z } from 'zod';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const parseResult = loginSchema.safeParse(formData);
        if (!parseResult.success) {
            setFormErrors(parseResult.error.flatten().fieldErrors);
            return;
        }
        const result = await login(formData.username, formData.password);
        if (result.success) {
            navigate('/tasks');
        } else {
            setError(result.error || 'Invalid username or password.');
        }
    };
    const handleChange = (e) => {
        setFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-fields">
                    <div className="form-field">
                        <label className="form-field-label">                
                            Username
                            <input
                                type="text"
                                placeholder="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-field-input"
                            />
                        </label>
                        {formErrors?.username && <div className="form-field-error">{formErrors.username}</div>}
                    </div>
                    <div className="form-field">
                        <label className="form-field-label">
                            Password
                            <input
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-field-input"
                            />
                        </label>
                        {formErrors?.password && <div className="form-field-error">{formErrors.password}</div>}
                    </div>
                </div>
                {error && <div className="login-error">{error}</div>}
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};

export default Login;