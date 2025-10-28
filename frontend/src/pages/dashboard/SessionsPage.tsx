import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, QrCode, Radio, Trash2, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { sessionService } from '@/services/session.service';

interface UserWithSession {
  userId: number;
  email: string;
  role: string;
  sessionId?: string;
  phoneNumber?: string;
  status?: string;
  isActive?: boolean;
  updatedAt?: string;
}

export default function SessionsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [destroyLoading, setDestroyLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await sessionService.getAllUsersWithSessions();
      if (response.success) {
        // Transform data to user-centric format
        const usersWithSessions = response.data.map(session => ({
          userId: session.userId,
          email: `user${session.userId}@wahub.local`, // This should come from API
          phoneNumber: session.phoneNumber,
          role: session.userId === 1 ? 'admin' : 'user', // This should come from API
          sessionId: session.sessionId,
          sessionStatus: session.status,
          isSessionActive: session.isActive,
          lastActive: session.updatedAt,
          createdAt: session.createdAt,
        }));
        setUsers(usersWithSessions);
      } else {
        setMessage('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('Error loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestroySession = async (userWithSession: UserWithSession) => {
    if (!userWithSession.sessionId) {
      setMessage('❌ No active session to destroy');
      return;
    }

    if (!confirm(`Are you sure you want to destroy WhatsApp session for ${userWithSession.email} (${userWithSession.phoneNumber})?\n\nThis will disconnect the user from WhatsApp permanently.`)) {
      return;
    }

    setDestroyLoading(userWithSession.userId);
    setMessage('');
    
    try {
      const response = await sessionService.destroyUserSession({
        sessionId: userWithSession.sessionId,
        phoneNumber: userWithSession.phoneNumber,
        userId: userWithSession.userId
      });

      if (response.success) {
        setMessage(`✅ ${response.data.message}`);
        await loadUsers();
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

  const handleAddSession = async () => {
    if (!sessionName.trim()) {
      setMessage('Session name is required');
      return;
    }

    try {
      const response = await sessionService.createSession({
        sessionId: sessionName,
        phoneNumber: sessionName
      });

      if (response.success && response.qr) {
        setQrCode(response.qr);
        setShowQrDialog(true);
        setShowAddDialog(false);
        setSessionName('');
      } else {
        setMessage('Failed to create session');
      }
    } catch (error: any) {
      console.error('Error creating session:', error);
      setMessage(error.response?.data?.message || 'Failed to create session');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (isActive && status === 'connected') return '🟢';
    if (status === 'connecting') return '🟡';
    if (status === 'disconnected') return '🔴';
    return '⚪';
  };

  const getStatusText = (status: string, isActive: boolean) => {
    if (isActive && status === 'connected') return 'connected';
    if (status === 'connecting') return 'connecting';
    return 'disconnected';
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (isActive && status === 'connected') return 'text-green-600';
    if (status === 'connecting') return 'text-yellow-600';
    return 'text-gray-500';
  };

  const formatLastActive = (updatedAt: string) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">WhatsApp Sessions</h2>
          <p className="text-muted-foreground">Manage your connected WhatsApp accounts</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadUsers} 
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Session
          </Button>
        </div>
      </div>

      {message && (
        <Card className={`border-l-4 ${message.includes('✅') ? 'border-l-green-500' : message.includes('❌') ? 'border-l-red-500' : 'border-l-blue-500'}`}>
          <CardContent className="pt-4">
            <p className="text-sm">{message}</p>
          </CardContent>
        </Card>
      )}

      {showAddDialog && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Add New Session</CardTitle>
            <CardDescription>Create a new WhatsApp session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Session Name</Label>
              <Input
                id="sessionName"
                placeholder="e.g., my-session"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddSession}>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showQrDialog && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>Open WhatsApp on your phone and scan this QR code</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed">
              {qrCode ? (
                <img 
                  src={qrCode} 
                  alt="WhatsApp QR Code" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <QrCode className="mx-auto h-12 w-12 mb-2" />
                  <p className="text-sm">QR Code will appear here</p>
                  <p className="text-xs mt-2">Waiting for backend connection...</p>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => setShowQrDialog(false)}>
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading sessions...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No users yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No users found in the system
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Session
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Phone Number</th>
                    <th className="text-left p-4 font-medium">Session Status</th>
                    <th className="text-left p-4 font-medium">Last Active</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userWithSession: UserWithSession) => (
                    <tr key={userWithSession.userId} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{userWithSession.email}</span>
                          <span className="text-sm text-gray-500 capitalize">{userWithSession.role}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{userWithSession.phoneNumber || '-'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{userWithSession.sessionId ? 
                            getStatusIcon(userWithSession.status || 'disconnected', userWithSession.isActive || false) : 
                            '🔴'
                          }</span>
                          <span className={`font-medium ${userWithSession.sessionId ? 
                            getStatusColor(userWithSession.status || 'disconnected', userWithSession.isActive || false) : 
                            'text-red-600'
                          }`}>
                            {userWithSession.sessionId ? 
                              getStatusText(userWithSession.status || 'disconnected', userWithSession.isActive || false) : 
                              'No Session'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {userWithSession.updatedAt ? formatLastActive(userWithSession.updatedAt) : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1">
                          {userWithSession.sessionId ? (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDestroySession(userWithSession)}
                              disabled={destroyLoading === userWithSession.userId}
                              title="Destroy Session"
                            >
                              {destroyLoading === userWithSession.userId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">No session</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Only Warning */}
      {user?.role !== 'admin' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Some features require admin privileges. Contact your administrator for session management.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
