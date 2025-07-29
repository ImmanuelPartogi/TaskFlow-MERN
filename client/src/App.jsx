import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/common/PrivateRoute';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import './index.css';

// Lazy load components to improve performance
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const ProjectList = lazy(() => import('./components/Projects/ProjectList'));
const ProjectForm = lazy(() => import('./components/Projects/ProjectForm'));
const ProjectDetail = lazy(() => import('./components/Projects/ProjectDetail'));
const TaskBoard = lazy(() => import('./components/Tasks/TaskBoard'));

// ErrorBoundary untuk menangkap error
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4">
          <h2 className="font-bold">Terjadi kesalahan</h2>
          <p>{this.state.error && this.state.error.toString()}</p>
          <button
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => window.location.reload()}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/*" element={<PrivateLayout />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

const PrivateLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar onToggle={handleSidebarToggle} initialCollapsed={sidebarCollapsed} />
        <main className={`flex-1 pt-16 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route
                  path="/"
                  element={<PrivateRoute element={<Dashboard />} />}
                />
                <Route
                  path="/dashboard"
                  element={<PrivateRoute element={<Dashboard />} />}
                />
                <Route
                  path="/projects"
                  element={<PrivateRoute element={<ProjectList />} />}
                />
                <Route
                  path="/projects/new"
                  element={<PrivateRoute element={<ProjectForm />} />}
                />
                <Route
                  path="/projects/:projectId/edit"
                  element={<PrivateRoute element={<ProjectForm isEditing={true} />} />}
                />
                <Route
                  path="/projects/:projectId"
                  element={<PrivateRoute element={<ProjectDetail />} />}
                />
                <Route
                  path="/projects/:projectId/tasks"
                  element={<PrivateRoute element={<TaskBoard />} />}
                />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default App;