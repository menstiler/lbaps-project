import './taskItem.css';

const TaskItem = ({ task }) => {
    return (
        <div className="task-item">
            <div className="task-item-content">
                <div className="task-info">
                    {task.title && (
                        <span className="task-field task-title">{task.title}</span>
                    )}
                    {task.custom_fields && task.custom_fields.length > 0 && (
                        <div className="task-field task-fields-container">
                            {task.custom_fields.map((customField, index) => (
                                <div key={customField.id || index} className="task-custom-field">
                                    <span className="task-custom-label">
                                        {customField.field_name}:
                                    </span>
                                    <span className="task-custom-value">
                                        {customField.value !== null && customField.value !== undefined
                                            ? String(customField.value)
                                            : 'N/A'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskItem;