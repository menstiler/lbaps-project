import './taskItem.css';

const TaskItem = ({ task }) => {
    return (
        <div className="task-item">
            <div className="task-item-content">
                <div className="task-info">
                    {task.title && (
                        <span className="task-field task-title">{task.title}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskItem;