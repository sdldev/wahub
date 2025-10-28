import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import SessionsPage from '@/pages/dashboard/SessionsPage';
import MessagesPage from '@/pages/dashboard/MessagesPage';
import UsersPage from '@/pages/dashboard/UsersPage';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { setNavigate } from '@/lib/navigation';

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize navigation utility with React Router's navigate
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
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
        <Route path="users" element={<UsersPage />} />
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
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
