import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, QrCode, Radio, Trash2, LogOut } from 'lucide-react';

// Mock data - will be replaced with actual API calls
const mockSessions = [
  {
    id: 'session1',
    phoneNumber: '+62 812 3456 7890',
    status: 'connected',
    lastActive: '2 minutes ago',
  },
  {
    id: 'session2',
    phoneNumber: '+62 898 7654 3210',
    status: 'connected',
    lastActive: '5 minutes ago',
  },
  {
    id: 'session3',
    phoneNumber: '+62 856 1234 5678',
    status: 'disconnected',
    lastActive: '1 hour ago',
  },
];

export default function SessionsPage() {
  const [sessions] = useState(mockSessions);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');

  const handleAddSession = () => {
    // TODO: Implement API call to create session
    console.log('Creating session:', sessionName);
    setShowQrDialog(true);
    setShowAddDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">WhatsApp Sessions</h2>
          <p className="text-muted-foreground">Manage your connected WhatsApp accounts</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </div>

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
              <div className="text-center text-muted-foreground">
                <QrCode className="mx-auto h-12 w-12 mb-2" />
                <p className="text-sm">QR Code will appear here</p>
                <p className="text-xs mt-2">Waiting for backend connection...</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowQrDialog(false)}>
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Radio
                    className={`h-4 w-4 ${
                      session.status === 'connected' ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <CardTitle className="text-base">{session.id}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <LogOut className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <CardDescription>{session.phoneNumber}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`font-medium ${
                    session.status === 'connected' ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {session.status}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Active</span>
                <span>{session.lastActive}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radio className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No sessions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first WhatsApp session to get started
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
