import { Link } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import './newTask.css';

const NewTask = () => {
    return (
        <div className="new-task-page">
            <div className="new-task-header">
            <Link to="/tasks"> <span className="arrow">&lt;</span> Back to Tasks</Link>
            </div>
            <div className="new-task-container">
                <h2>Create New Task</h2>
                <TaskForm />
            </div>
        </div>
    );
};

export default NewTask;