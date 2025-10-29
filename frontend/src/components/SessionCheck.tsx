import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
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
    status: 'checking',
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const [qrRefreshCount, setQrRefreshCount] = useState(0);
  const [qrRefreshTimer, setQrRefreshTimer] = useState<number>(0);
  const pollIntervalRef = useRef<number | null>(null);
  const qrRefreshIntervalRef = useRef<number | null>(null);
  const qrTimerIntervalRef = useRef<number | null>(null);

  // WhatsApp QR refresh settings
  const QR_REFRESH_INTERVAL = 18000; // 18 seconds (refresh before 20s expiry)
  const MAX_QR_REFRESH_ATTEMPTS = 3;

  const checkSession = useCallback(async (preserveQrCode = false) => {
    try {
      const response = await fetch('http://localhost:5001/api/session/user-status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessionStatus((prev) => ({
            connected: data.data.connected,
            phoneNumber: data.data.phoneNumber,
            // Preserve existing QR code if not returned from API and preserveQrCode is true
            qrCode: data.data.qrCode || (preserveQrCode ? prev.qrCode : undefined),
            status: data.data.connected ? 'connected' : 'disconnected',
            message: data.data.message,
          }));

          if (data.data.connected) {
            // Clear polling when connected
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            // Session ready, proceed to dashboard
            setTimeout(() => onSessionReady(), 1000);
          }
        } else {
          setSessionStatus((prev) => ({
            connected: false,
            status: 'error',
            message: data.message || 'Failed to check session status',
            // Keep existing QR code and phone number if error is temporary
            qrCode: preserveQrCode ? prev.qrCode : undefined,
            phoneNumber: prev.phoneNumber,
          }));
        }
      } else {
        throw new Error('Failed to fetch session status');
      }
    } catch (error) {
      console.error('Session check error:', error);
      setSessionStatus((prev) => ({
        connected: false,
        status: 'error',
        message: 'Unable to check WhatsApp session status',
        // Keep existing QR code if this is just a network error during polling
        qrCode: preserveQrCode ? prev.qrCode : undefined,
        phoneNumber: prev.phoneNumber,
      }));
    }
  }, [onSessionReady]);

  const startQrTimer = useCallback(() => {
    // Clear existing timer
    if (qrTimerIntervalRef.current) {
      clearInterval(qrTimerIntervalRef.current);
    }
    
    // Reset timer display
    setQrRefreshTimer(QR_REFRESH_INTERVAL / 1000);
    
    // Start countdown
    qrTimerIntervalRef.current = setInterval(() => {
      setQrRefreshTimer((prev) => {
        if (prev <= 1) {
          return QR_REFRESH_INTERVAL / 1000;
        }
        return prev - 1;
      });
    }, 1000);
  }, [QR_REFRESH_INTERVAL]);

  const refreshQrCode = useCallback(async (): Promise<boolean> => {
    try {
      console.log(`QR refresh attempt ${qrRefreshCount + 1}/${MAX_QR_REFRESH_ATTEMPTS}`);
      
      const response = await fetch('http://localhost:5001/api/session/user-initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.qrCode) {
          setSessionStatus((prev) => ({
            ...prev,
            qrCode: data.data.qrCode,
            status: 'disconnected',
            message: `QR code refreshed. Scan with WhatsApp to connect. (Attempt ${qrRefreshCount + 1}/${MAX_QR_REFRESH_ATTEMPTS})`,
          }));
          
          setQrRefreshCount((prev) => prev + 1);
          startQrTimer(); // Reset timer
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('QR refresh error:', error);
      return false;
    }
  }, [qrRefreshCount, MAX_QR_REFRESH_ATTEMPTS, startQrTimer]);

  const startQrRefreshCycle = useCallback(() => {
    // Clear existing intervals
    if (qrRefreshIntervalRef.current) {
      clearInterval(qrRefreshIntervalRef.current);
    }
    
    // Start QR refresh cycle
    qrRefreshIntervalRef.current = setInterval(async () => {
      if (qrRefreshCount >= MAX_QR_REFRESH_ATTEMPTS) {
        // Max attempts reached, stop refresh and show error
        if (qrRefreshIntervalRef.current) {
          clearInterval(qrRefreshIntervalRef.current);
          qrRefreshIntervalRef.current = null;
        }
        if (qrTimerIntervalRef.current) {
          clearInterval(qrTimerIntervalRef.current);
          qrTimerIntervalRef.current = null;
        }
        
        setSessionStatus({
          connected: false,
          status: 'error',
          message: 'Unable to check WhatsApp session status',
        });
        return;
      }

      // Attempt to refresh QR
      const success = await refreshQrCode();
      if (!success) {
        // If refresh failed and we've reached max attempts
        if (qrRefreshCount >= MAX_QR_REFRESH_ATTEMPTS - 1) {
          if (qrRefreshIntervalRef.current) {
            clearInterval(qrRefreshIntervalRef.current);
            qrRefreshIntervalRef.current = null;
          }
          if (qrTimerIntervalRef.current) {
            clearInterval(qrTimerIntervalRef.current);
            qrTimerIntervalRef.current = null;
          }
          
          setSessionStatus({
            connected: false,
            status: 'error',
            message: 'Unable to check WhatsApp session status',
          });
        }
      }
    }, QR_REFRESH_INTERVAL);
    
    // Start timer display
    startQrTimer();
  }, [qrRefreshCount, MAX_QR_REFRESH_ATTEMPTS, refreshQrCode, startQrTimer, QR_REFRESH_INTERVAL]);

  const initializeSession = async () => {
    setIsRetrying(true);
    setSessionStatus((prev) => ({ ...prev, status: 'connecting' }));

    try {
      const response = await fetch('http://localhost:5001/api/session/user-initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Reset QR refresh counter
          setQrRefreshCount(0);
          
          setSessionStatus({
            connected: false,
            qrCode: data.data.qrCode,
            status: 'disconnected',
            message: 'Scan QR code with WhatsApp to connect',
          });

          // Clear any existing polling and QR refresh
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          if (qrRefreshIntervalRef.current) {
            clearInterval(qrRefreshIntervalRef.current);
          }
          if (qrTimerIntervalRef.current) {
            clearInterval(qrTimerIntervalRef.current);
          }

          // Start polling for connection status
          pollIntervalRef.current = setInterval(async () => {
            await checkSession(true); // Preserve QR code during polling
          }, 3000);

          // Start QR refresh cycle
          startQrRefreshCycle();

          // Clear all intervals after 2 minutes (total timeout)
          setTimeout(() => {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            if (qrRefreshIntervalRef.current) {
              clearInterval(qrRefreshIntervalRef.current);
              qrRefreshIntervalRef.current = null;
            }
            if (qrTimerIntervalRef.current) {
              clearInterval(qrTimerIntervalRef.current);
              qrTimerIntervalRef.current = null;
            }
          }, 120000);
        }
      }
    } catch (error) {
      console.error('Initialize session error:', error);
      setSessionStatus({
        connected: false,
        status: 'error',
        message: 'Failed to initialize WhatsApp session',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    checkSession();
    
    // Cleanup all intervals on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (qrRefreshIntervalRef.current) {
        clearInterval(qrRefreshIntervalRef.current);
        qrRefreshIntervalRef.current = null;
      }
      if (qrTimerIntervalRef.current) {
        clearInterval(qrTimerIntervalRef.current);
        qrTimerIntervalRef.current = null;
      }
    };
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
        return sessionStatus.qrCode 
          ? 'Scan QR code with WhatsApp to connect'
          : 'WhatsApp not connected. Please initialize connection.';
      case 'connecting':
        return sessionStatus.qrCode
          ? 'Generating QR code... Please wait and scan when ready.'
          : 'Initializing WhatsApp connection...';
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
          <div className="mx-auto mb-4">{getStatusIcon()}</div>
          <CardTitle>WhatsApp Connection Required</CardTitle>
          <CardDescription>{getStatusMessage()}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {sessionStatus.status === 'connected' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Connection Successful!</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Redirecting to dashboard...</p>
            </div>
          )}

          {(sessionStatus.status === 'disconnected' || sessionStatus.status === 'connecting') && sessionStatus.qrCode && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img src={sessionStatus.qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
                </div>
              </div>

              {/* QR Timer Display */}
              {qrRefreshTimer > 0 && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>QR expires in: {qrRefreshTimer}s</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Refresh attempt: {qrRefreshCount + 1}/{MAX_QR_REFRESH_ATTEMPTS}
                  </p>
                </div>
              )}

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

          {(sessionStatus.status === 'error' ||
            (sessionStatus.status === 'disconnected' && !sessionStatus.qrCode)) && (
            <div className="text-center">
              <Button onClick={initializeSession} disabled={isRetrying} className="w-full">
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
              <Button onClick={() => checkSession()} variant="outline" className="w-full">
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
