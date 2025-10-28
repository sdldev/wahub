import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, MessageSquare, Radio, Users, LogOut, QrCode, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { sessionService } from '@/services/session.service';

const stats = [
  {
    title: 'Active Sessions',
    value: '5',
    description: 'Connected WhatsApp accounts',
    icon: Radio,
    color: 'text-green-600',
  },
  {
    title: 'Messages Sent',
    value: '1,234',
    description: 'Total messages today',
    icon: MessageSquare,
    color: 'text-blue-600',
  },
  {
    title: 'Queue Status',
    value: '12',
    description: 'Messages pending',
    icon: Activity,
    color: 'text-orange-600',
  },
  {
    title: 'Total Users',
    value: '8',
    description: 'Registered users',
    icon: Users,
    color: 'text-purple-600',
  },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleScanClick = async () => {
    setIsLoading(true);
    setIsQrModalOpen(true);
    
    try {
      // Check current session status first
      const statusResponse = await sessionService.getUserStatus();
      
      if (statusResponse.data.connected) {
        setSessionStatus(`✅ Already connected to WhatsApp as ${statusResponse.data.phoneNumber}`);
        setQrCode(null);
      } else {
        // Try to initialize new session for QR
        try {
          const qrResponse = await sessionService.initializeUserSession();
          if (qrResponse.success && qrResponse.data.qrCode) {
            setQrCode(qrResponse.data.qrCode);
            setSessionStatus(qrResponse.data.message);
          } else if (qrResponse.data.connected) {
            setSessionStatus(`✅ ${qrResponse.data.message}`);
            setQrCode(null);
          } else {
            setSessionStatus(qrResponse.data.message || 'Failed to generate QR code');
            setQrCode(null);
          }
        } catch (initError: unknown) {
          console.error('Session initialization error:', initError);
          
          // Handle specific error cases
          if (initError && typeof initError === 'object' && 'response' in initError) {
            const axiosError = initError as { response?: { data?: { error?: string } } };
            if (axiosError.response?.data?.error?.includes('already exists')) {
              setSessionStatus('⚠️ WhatsApp session already exists. Please disconnect first or check connection status.');
            } else if (axiosError.response?.data?.error) {
              setSessionStatus(`❌ ${axiosError.response.data.error}`);
            } else {
              setSessionStatus('❌ Failed to generate QR code. Please try again.');
            }
          } else {
            setSessionStatus('❌ Failed to generate QR code. Please try again.');
          }
          setQrCode(null);
        }
      }
    } catch (error: unknown) {
      console.error('Error checking session status:', error);
      setSessionStatus('❌ Failed to check WhatsApp connection status');
      setQrCode(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.email || 'User'}! Manage your WhatsApp Gateway
          </p>
        </div>
        {user?.role === 'admin' ? (
          <Button variant="outline" onClick={handleScanClick} className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Scan
          </Button>
        ) : (
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest messages and session updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Session connected</p>
                  <p className="text-xs text-muted-foreground">+6281234567890 - 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Message sent</p>
                  <p className="text-xs text-muted-foreground">To +6289876543210 - 5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Queue processing</p>
                  <p className="text-xs text-muted-foreground">
                    12 messages pending - 10 minutes ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Server health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">API Status</span>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Database</span>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Queue Service</span>
                <span className="text-sm font-medium text-green-600">Running</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Modal for Admin */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">WhatsApp Connection</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQrModalOpen(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              {isLoading ? (
                <div className="py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading...</p>
                </div>
              ) : qrCode ? (
                <div className="py-4">
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="mx-auto mb-4 border rounded-lg"
                    style={{ maxWidth: '256px', height: 'auto' }}
                  />
                  <p className="text-sm text-gray-600 mb-2">
                    Scan this QR code with your WhatsApp
                  </p>
                  <p className="text-xs text-gray-500">
                    QR code expires in 2 minutes
                  </p>
                </div>
              ) : (
                <div className="py-4">
                  <p className="text-sm text-gray-600">{sessionStatus}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
