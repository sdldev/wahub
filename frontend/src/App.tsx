import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import SessionsPage from '@/pages/dashboard/SessionsPage';
import MessagesPage from '@/pages/dashboard/MessagesPage';
import { setNavigate } from '@/lib/navigation';

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize navigation utility with React Router's navigate
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route
          path="analytics"
          element={
            <div className="text-center py-12 text-muted-foreground">
              Analytics page coming soon...
            </div>
          }
        />
        <Route
          path="users"
          element={
            <div className="text-center py-12 text-muted-foreground">Users page coming soon...</div>
          }
        />
        <Route
          path="settings"
          element={
            <div className="text-center py-12 text-muted-foreground">
              Settings page coming soon...
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
