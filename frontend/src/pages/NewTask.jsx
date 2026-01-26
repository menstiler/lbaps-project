import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import './newTask.css';

const NewTask = () => {
    const navigate = useNavigate();

    const handleTaskAdded = () => {
        // Navigate back to tasks list after successful creation
        navigate('/tasks');
    };

    return (
        <div className="new-task-container">
            <h2>Create New Task</h2>
            <TaskForm onTaskAdded={handleTaskAdded} />
        </div>
    );
};

export default NewTask;