import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './taskForm.css';
import { z } from 'zod';
import { taskSchema } from '../validation/taskSchema';

const TaskForm = ({ onTaskAdded }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        custom_field: {
            field_name: '',
            field_type: '',
            field_value: '',
        }
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFieldChange = ({ target: { name, value } }) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name.includes('custom_field.')) {
            const field = name.split('custom_field.')[1];
            // update field value whenever field type is changed
            if (field === 'field_type') {
                setFormData(prev => ({ ...prev, custom_field: { ...prev.custom_field, [field]: value, field_value: '' } }));
            } else {
                setFormData(prev => ({ ...prev, custom_field: { ...prev.custom_field, [field]: value } }));
            }
        }

        // Clear error for this field when user starts typing
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            if (name === 'title') {
                delete newErrors.title;
            } else if (name.startsWith('custom_field.')) {
                const field = name.split('.')[1];
                if (newErrors.custom_field) {
                    delete newErrors.custom_field[field];
                    if (Object.keys(newErrors.custom_field).length === 0) {
                        delete newErrors.custom_field;
                    }
                }
            }
            return newErrors;
        });

        if (error.length > 0) {
            setError('');
        }
    };

    const validateForm = () => {
        try {
            taskSchema.parse(formData);
            setFieldErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const errors = {};
                err.issues.forEach(issue => {
                    const path = issue.path;
                    if (path.length === 1) {
                        errors[path[0]] = issue.message;
                    } else if (path[0] === 'custom_field') {
                        if (!errors.custom_field) errors.custom_field = {};
                        errors.custom_field[path[1]] = issue.message;
                    }
                });
                setError(`Please correct the above error${Object.keys(err.issues).length > 1 ? 's' : ''}.`);
                setFieldErrors(errors);
            }
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form data 
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            // update field value to correct type to pass backend validation
            let customValue = formData.custom_field.field_value;
            if (formData.custom_field.field_type === 'boolean') {
                customValue = formData.custom_field.field_value === 'true' ? true : false;
            } else if (formData.custom_field.field_type === 'number') {
                customValue = parseFloat(formData.custom_field.field_value);
            }

            const response = await api.post('/tasks/', {
                ...formData,
                custom_field: {
                    ...formData.custom_field,
                    field_value: customValue,
                },
            });

            // Reset form
            setFormData({
                title: '',
                custom_field: {
                    field_name: '',
                    field_type: '',
                    field_value: '',
                },
            });
            setFieldErrors({});
            setError('');

            if (onTaskAdded) {
                onTaskAdded(response.data);
            } else {
                navigate('/tasks');
            }
        } catch (err) {
            console.error('Error creating task:', err);
            let errorMessage = 'Error creating task.';
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
                errorMessage += ' Please correct the above errors.';
                setFieldErrors(apiErrors);
            }

            setError(err.response?.data?.detail || errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/tasks');
    };

    const fieldOptions = [
        { value: 'string', label: 'String' },
        { value: 'boolean', label: 'Boolean' },
        { value: 'number', label: 'Number' },
    ];

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
                <div className="task-form-fields">
                    <div className="form-field">
                        <label className="form-field-label">
                            Field Name
                            <input
                                value={formData.custom_field.field_name}
                                type="text"
                                name="custom_field.field_name"
                                onChange={handleFieldChange}
                                className="form-field-input"
                                placeholder="Field name"
                            />
                        </label>
                        {fieldErrors.custom_field?.field_name && (
                            <div className="form-field-error">{fieldErrors.custom_field.field_name}</div>
                        )}
                    </div>

                    <div className="form-field">
                        <label className="form-field-label">
                            Field Type
                        </label>
                        <select
                            value={formData.custom_field.field_type || ''}
                            name="custom_field.field_type"
                            onChange={handleFieldChange}
                            className="form-field-select"
                        >
                            <option value="">Select type</option>
                            {fieldOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.custom_field?.field_type && (
                            <div className="form-field-error">{fieldErrors.custom_field.field_type}</div>
                        )}
                    </div>

                    <div className="form-field">
                        <label className="form-field-label">
                            Field Value
                        </label>
                        {formData.custom_field.field_type === 'boolean' ? (
                            <select
                                value={formData.custom_field.field_value || ''}
                                name="custom_field.field_value"
                                onChange={handleFieldChange}
                                className="form-field-select"
                            >
                                <option value="">Select value</option>
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        ) : (
                            <input
                                value={formData.custom_field.field_value || ''}
                                type={formData.custom_field.field_type === 'number' ? 'number' : 'text'}
                                name="custom_field.field_value"
                                onChange={handleFieldChange}
                                className="form-field-input"
                                placeholder="Enter value"
                            />
                        )}
                        {fieldErrors.custom_field?.field_value && (
                            <div className="form-field-error">{fieldErrors.custom_field.field_value}</div>
                        )}
                    </div>
                </div>
                {error && <div className="task-form-error">{error}</div>}
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
        </>
    );
};

export default TaskForm;