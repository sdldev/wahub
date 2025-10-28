import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from 'lucide-react';


interface SessionStatus {
  connected: boolean;
  phoneNumber?: string;
  qrCode?: string;
  status: 'checking' | 'disconnected' | 'connecting' | 'connected' | 'error';
  message?: string;
}

interface SessionCheckProps {
  onSessionReady: () => void;
}

export function SessionCheck({ onSessionReady }: SessionCheckProps) {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    connected: false,
    status: 'checking'
  });
  const [isRetrying, setIsRetrying] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5001/api/session/user-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessionStatus({
            connected: data.data.connected,
            phoneNumber: data.data.phoneNumber,
            qrCode: data.data.qrCode,
            status: data.data.connected ? 'connected' : 'disconnected',
            message: data.data.message
          });

          if (data.data.connected) {
            // Session ready, proceed to dashboard
            setTimeout(() => onSessionReady(), 1000);
          }
        } else {
          setSessionStatus({
            connected: false,
            status: 'error',
            message: data.message || 'Failed to check session status'
          });
        }
      } else {
        throw new Error('Failed to fetch session status');
      }
    } catch (error) {
      console.error('Session check error:', error);
      setSessionStatus({
        connected: false,
        status: 'error',
        message: 'Unable to check WhatsApp session status'
      });
    }
  }, [onSessionReady]);

  const initializeSession = async () => {
    setIsRetrying(true);
    setSessionStatus(prev => ({ ...prev, status: 'connecting' }));

    try {
      const response = await fetch('http://localhost:5001/api/session/user-initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessionStatus({
            connected: false,
            qrCode: data.data.qrCode,
            status: 'disconnected',
            message: 'Scan QR code with WhatsApp to connect'
          });

          // Start polling for connection status
          const pollInterval = setInterval(async () => {
            await checkSession();
            if (sessionStatus.connected) {
              clearInterval(pollInterval);
            }
          }, 3000);

          // Clear polling after 2 minutes
          setTimeout(() => clearInterval(pollInterval), 120000);
        }
      }
    } catch (error) {
      console.error('Initialize session error:', error);
      setSessionStatus({
        connected: false,
        status: 'error',
        message: 'Failed to initialize WhatsApp session'
      });
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const getStatusIcon = () => {
    switch (sessionStatus.status) {
      case 'checking':
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="h-12 w-12 text-orange-500" />;
      case 'connecting':
        return <Wifi className="h-12 w-12 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Smartphone className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (sessionStatus.status) {
      case 'checking':
        return 'Checking WhatsApp connection status...';
      case 'connected':
        return `Connected as ${sessionStatus.phoneNumber || 'WhatsApp user'}`;
      case 'disconnected':
        return 'WhatsApp not connected. Please scan QR code to continue.';
      case 'connecting':
        return 'Initializing WhatsApp connection...';
      case 'error':
        return sessionStatus.message || 'Connection error occurred';
      default:
        return 'Unknown connection status';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle>WhatsApp Connection Required</CardTitle>
          <CardDescription>
            {getStatusMessage()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {sessionStatus.status === 'connected' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Connection Successful!</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {sessionStatus.status === 'disconnected' && sessionStatus.qrCode && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img 
                    src={sessionStatus.qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-48 h-48"
                  />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="font-medium">How to connect:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 text-left max-w-sm mx-auto">
                  <li>1. Open WhatsApp on your phone</li>
                  <li>2. Tap Menu or Settings and select Linked Devices</li>
                  <li>3. Tap on Link a Device</li>
                  <li>4. Point your phone at this screen to scan the code</li>
                </ol>
              </div>
            </div>
          )}

          {(sessionStatus.status === 'error' || (sessionStatus.status === 'disconnected' && !sessionStatus.qrCode)) && (
            <div className="text-center">
              <Button 
                onClick={initializeSession}
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Initialize WhatsApp Connection
                  </>
                )}
              </Button>
            </div>
          )}

          {sessionStatus.status === 'checking' && (
            <div className="text-center">
              <Button 
                onClick={checkSession}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}