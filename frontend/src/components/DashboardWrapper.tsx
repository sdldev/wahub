import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionCheck } from '@/components/SessionCheck';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export function DashboardWrapper() {
  const [sessionReady, setSessionReady] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // All users (including admin) need to check session
    setIsCheckingSession(true);
    setSessionReady(false);
  }, [user]);

  const handleSessionReady = () => {
    setSessionReady(true);
    setIsCheckingSession(false);
  };

  // Show session check when session not ready
  if (isCheckingSession || !sessionReady) {
    return <SessionCheck onSessionReady={handleSessionReady} />;
  }

  // Show dashboard when session is ready or user is admin
  return <DashboardLayout />;
}