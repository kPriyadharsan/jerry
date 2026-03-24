import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatScreen from './pages/ChatScreen';
import TaskInputPanel from './pages/TaskInputPanel';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EnglishPracticePage from './pages/EnglishPracticePage';
import VoicePracticePage from './pages/VoicePracticePage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <div className="flex h-screen w-full bg-bg-primary text-text-primary">
                <Sidebar />
                <div className="flex-1 relative flex flex-col h-full overflow-hidden">
                  <Routes>
                    <Route path="/" element={<ChatScreen />} />
                    <Route path="/tasks" element={<TaskInputPanel />} />
                    <Route path="/english-practice" element={<EnglishPracticePage />} />
                    <Route path="/voice-practice" element={<VoicePracticePage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* Fallback for protected routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

