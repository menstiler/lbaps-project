import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './taskForm.css';

const TaskForm = ({ onTaskAdded }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFieldChange = ({ target: { name, value } }) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if (error.length > 0) {
            setError('');
        }
    };

    const validateForm = () => {
        const errors = {};

        // Validate title
        if (!formData.title || formData.title.trim() === '') {
            errors.title = 'Title is required';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitData = {
                title: formData.title,
            };

            const response = await api.post('/tasks/', submitData);

            // Reset form
            setFormData({
                title: '',
            });
            setFieldErrors({});
            setError('');

            if (onTaskAdded) {
                onTaskAdded(response.data);
            } else {
                // navigate back to tasks page when no callback is provided
                navigate('/tasks');
            }
        } catch (err) {
            console.error('Error creating task:', err);

            // Handle field-specific errors from API
            if (err.response?.data) {
                const apiErrors = {};
                Object.keys(err.response.data).forEach(key => {
                    const errorValue = err.response.data[key];
                    if (Array.isArray(errorValue)) {
                        apiErrors[key] = errorValue[0];
                    } else {
                        apiErrors[key] = errorValue;
                    }
                });
                setFieldErrors(apiErrors);
            }

            setError(err.response?.data?.detail || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/tasks');
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="task-form">
                <div className="form-field">
                    <label className="form-field-label">
                        Title
                        <span className="required-asterisk">*</span>
                        <input
                            value={formData.title}
                            type="text"
                            name="title"
                            onChange={handleFieldChange}
                            className="form-field-input form-field-string"
                            placeholder="Enter task title"
                        />
                    </label>
                    {fieldErrors.title && (
                        <div className="form-field-error">{fieldErrors.title}</div>
                    )}
                </div>

                <div className="task-form-button-container">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="task-form-button task-form-button-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="task-form-button"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Task'}
                    </button>
                </div>
            </form>
            {error && <div className="task-form-error">{error}</div>}
        </>
    );
};

export default TaskForm;

