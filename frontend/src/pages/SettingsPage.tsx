import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Phone, User, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { sessionService } from '@/services/session.service';

interface UserSession {
  userId: number;
  sessionId: string;
  phoneNumber: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [destroyLoading, setDestroyLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  // Only allow admin to access this page
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Access Denied</h3>
              <p className="text-gray-600">Admin role required to access settings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadUserSessions = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await sessionService.getAllUsersWithSessions();
      if (response.success) {
        setUserSessions(response.data);
      } else {
        setMessage('Failed to load user sessions');
      }
    } catch (error) {
      console.error('Error loading user sessions:', error);
      setMessage('Error loading user sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestroySession = async (session: UserSession) => {
    if (!confirm(`Are you sure you want to destroy WhatsApp session for ${session.phoneNumber}?\n\nThis will disconnect the user from WhatsApp and remove the session completely.`)) {
      return;
    }

    setDestroyLoading(session.sessionId);
    setMessage('');
    
    try {
      const response = await sessionService.destroyUserSession({
        sessionId: session.sessionId,
        phoneNumber: session.phoneNumber,
        userId: session.userId
      });

      if (response.success) {
        setMessage(`✅ ${response.data.message}`);
        // Reload the list
        await loadUserSessions();
      } else {
        setMessage(`❌ Failed to destroy session`);
      }
    } catch (error: any) {
      console.error('Error destroying session:', error);
      setMessage(`❌ ${error.response?.data?.error || 'Failed to destroy session'}`);
    } finally {
      setDestroyLoading(null);
    }
  };

  useEffect(() => {
    loadUserSessions();
  }, []);

  const getStatusColor = (status: string, isActive: boolean) => {
    if (isActive && status === 'connected') return 'text-green-600';
    if (status === 'connecting') return 'text-yellow-600';
    if (status === 'disconnected') return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (isActive && status === 'connected') return '🟢';
    if (status === 'connecting') return '🟡';
    if (status === 'disconnected') return '🔴';
    return '⚪';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage WhatsApp sessions and system settings
          </p>
        </div>
        <Button 
          onClick={loadUserSessions} 
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {message && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <p className="text-sm">{message}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            WhatsApp Sessions Management
          </CardTitle>
          <CardDescription>
            View and manage all WhatsApp sessions. You can destroy sessions that are stuck or causing issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading sessions...</span>
            </div>
          ) : userSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No WhatsApp sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userSessions.map((session) => (
                <div 
                  key={session.sessionId} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.phoneNumber}</span>
                        <span className="text-sm">
                          {getStatusIcon(session.status, session.isActive)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="mr-4">User ID: {session.userId}</span>
                        <span className="mr-4">Session: {session.sessionId}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <span className={`mr-4 ${getStatusColor(session.status, session.isActive)}`}>
                          Status: {session.status} {session.isActive ? '(Active)' : '(Inactive)'}
                        </span>
                        <span>Updated: {new Date(session.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDestroySession(session)}
                    disabled={destroyLoading === session.sessionId}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {destroyLoading === session.sessionId ? 'Destroying...' : 'Destroy Session'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            Warning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Destroy Session</strong> will permanently remove the WhatsApp session and disconnect the user.
            </p>
            <p>
              Use this feature when:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>A session is stuck and not responding</li>
              <li>A user reports connection issues</li>
              <li>A session shows as connected but WhatsApp is not working</li>
              <li>Need to force a fresh WhatsApp connection</li>
            </ul>
            <p className="text-yellow-600 font-medium">
              ⚠️ The user will need to scan QR code again to reconnect.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}