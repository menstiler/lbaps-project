import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import TaskItem from '../components/TaskItem';
import './tasks.css';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tasks/');
            setTasks(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="tasks-container">
                <div className="loading">Loading tasks...</div>
            </div>
        );
    }

    return (
        <div className="tasks-container">
            <div className="tasks-header">
                <h2>My Tasks</h2>
                <Link to="/tasks/new" className="new-task-button">
                    + New Task
                </Link>
            </div>

            <div className="tasks-list">
                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <p>No tasks.</p>
                        <Link to="/tasks/new" className="new-task-link">
                            Create your first task
                        </Link>
                    </div>
                ) : (
                    tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                        />
                    ))
                )}
            </div>
            {tasks.length > 0 && (
                <Link to="/tasks/new">
                    + Add Task
                </Link>
            )}

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Tasks;