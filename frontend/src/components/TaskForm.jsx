import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { z } from 'zod';
import { taskSchema } from '../validation/taskSchema';
import FormField from './TaskFormFields/FormField';
import CustomFormField from './TaskFormFields/CustomFormField';
import ReorderControls from './ReorderControls';
import useDragAndDrop from '../hooks/useDragAndDrop';
import useFieldOrder from '../hooks/useFieldOrder';
import './taskForm.css';

const INITIAL_FORM_DATA = {
    title: '',
    notes: '',
    due_date: '',
    high_priority: false,
    custom_field: {
        field_name: '',
        field_type: '',
        field_value: '',
    }
};

const TaskForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldOrder, setFieldOrder, saveFieldOrder] = useFieldOrder(['title', 'custom_field', 'due_date', 'high_priority', 'notes']);
    
    const handleReorder = (draggedIndex, dropIndex) => {
        const newOrder = [...fieldOrder];
        const draggedField = newOrder[draggedIndex];
        
        // Remove dragged item
        newOrder.splice(draggedIndex, 1);
        
        // Insert at new position
        newOrder.splice(dropIndex, 0, draggedField);
        
        setFieldOrder(newOrder);
        saveFieldOrder(newOrder);
    };

    const {
        draggedIndex,
        dragOverIndex,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
    } = useDragAndDrop(handleReorder);

    const handleFieldChange = ({ target: { name, value, type, checked } }) => {
        const fieldValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: fieldValue }));

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

            // Convert empty date string to null for backend
            const dueDate = formData.due_date && formData.due_date.trim() !== '' ? formData.due_date : null;

            await api.post('/tasks/', {
                ...formData,
                due_date: dueDate,
                custom_field: {
                    ...formData.custom_field,
                    field_value: customValue,
                },
            });

            // Reset form
            setFormData(INITIAL_FORM_DATA);
            setFieldErrors({});
            setError('');

            navigate('/tasks');
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

    const moveField = (index, direction) => {
        const newOrder = [...fieldOrder];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        
        // prevent moving beyond boundaries
        if (newIndex < 0 || newIndex >= newOrder.length) {
            return; 
        }

        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
        setFieldOrder(newOrder);
        saveFieldOrder(newOrder);
    };

    const fieldComponents = {
        title: (
            <FormField
                label="Title"
                value={formData.title}
                onChange={handleFieldChange}
                type="text"
                error={fieldErrors.title}
                className="title"
                name="title"
                placeholder="Enter task title"
                required={true}
            />     
        ),
        custom_field: (
            <CustomFormField
                formData={formData}
                errors={fieldErrors.custom_field}
                fieldOptions={fieldOptions}
                onChange={handleFieldChange}
            />
        ),
        notes: (
            <FormField
                label="Notes"
                value={formData.notes}
                onChange={handleFieldChange}
                type="textarea"
                error={fieldErrors.notes}
                className="notes"
                name="notes"
                placeholder="Enter notes"
            />        
        ),
        due_date: (
            <FormField
                label="Due Date"
                value={formData.due_date}
                onChange={handleFieldChange}
                type="date"
                error={fieldErrors.due_date}
                className="date"
                name="due_date"
                placeholder="Enter due date"
            />
        ),
        high_priority: (
            <FormField
                label="High Priority"
                value={formData.high_priority}
                onChange={handleFieldChange}
                type="checkbox"
                error={fieldErrors.high_priority}
                className="checkbox"
                name="high_priority"
                labelStyle={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            />
        )
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="task-form">
                {fieldOrder.map((fieldKey, index) => {
                     const isDragging = draggedIndex === index;
                     const isDragOver = dragOverIndex === index;
                    
                     return (
                        <div 
                            key={fieldKey} 
                            className={`reorderable-field-container ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            <ReorderControls
                                index={index}
                                fieldOrderLength={fieldOrder.length}
                                onMoveUp={() => moveField(index, 'up')}
                                onMoveDown={() => moveField(index, 'down')}
                            />
                            {fieldComponents[fieldKey]}
                        </div>
                    )
                })} 
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