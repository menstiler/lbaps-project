import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthRoute from './components/AuthRoute';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import Header from './components/Header';
import NewTask from './pages/NewTask';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/tasks"
            element={
              <AuthRoute>
                <Tasks />
              </AuthRoute>
            }
          />
          <Route
            path="/tasks/new"
            element={
              <AuthRoute>
                <NewTask />
              </AuthRoute>
            }
          />
          <Route path="/" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;