import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, AlertCircle, CheckCircle, Clock, WifiOff, QrCode, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { messageService } from '@/services/message.service';
import { sessionService } from '@/services/session.service';

interface ConnectionStatus {
  connected: boolean;
  phoneNumber?: string;
  sessionId?: string;
  status?: 'connected' | 'disconnected' | 'connecting' | 'error';
  message: string;
}

export default function MessagesPage() {
  const [messageData, setMessageData] = useState({
    recipient: '',
    message: '',
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Check WhatsApp connection status
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await sessionService.getUserStatus();
      if (response.success) {
        setConnectionStatus(response.data);
      }
    } catch (error: unknown) {
      console.error('Failed to check connection status:', error);
      setConnectionStatus({
        connected: false,
        message: 'Failed to check connection status'
      });
    }
  };

  const handleScanQR = async () => {
    try {
      setIsGeneratingQR(true);
      setQrCode(null);
      setShowQRModal(true);

      const response = await sessionService.initializeUserSession();
      
      if (response.success && response.data.qrCode) {
        setQrCode(response.data.qrCode);
        
        // Auto refresh connection status after successful connection
        // Only close modal when status is actually "connected"
        const checkInterval = setInterval(async () => {
          const statusResponse = await sessionService.getUserStatus();
          if (statusResponse.success) {
            const status = statusResponse.data.status || 'disconnected';
            
            // Only close modal and show success when truly connected
            if (status === 'connected' && statusResponse.data.connected) {
              setConnectionStatus(statusResponse.data);
              setShowQRModal(false);
              setStatusMessage('✅ WhatsApp connected successfully!');
              clearInterval(checkInterval);
            }
            // Update connection status but keep modal open if still connecting
            else if (status === 'connecting') {
              setConnectionStatus({
                ...statusResponse.data,
                connected: false,
                status: 'connecting'
              });
            }
          }
        }, 3000);

        // Clear interval after 2 minutes (QR code expires)
        setTimeout(() => {
          clearInterval(checkInterval);
          // If still showing modal after 2 minutes, show timeout message
          setStatusMessage('⏱️ QR code expired. Please try again.');
        }, 120000);
      } else {
        setStatusMessage('❌ Failed to generate QR code. Please try again.');
        setShowQRModal(false);
      }
    } catch (error: unknown) {
      console.error('Error generating QR:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      setStatusMessage(`❌ ${axiosError.response?.data?.message || 'Failed to generate QR code'}`);
      setShowQRModal(false);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleSendMessage = async () => {
    if (!connectionStatus?.connected || !connectionStatus.sessionId) {
      setStatusMessage('❌ WhatsApp not connected. Please connect first.');
      return;
    }

    if (!messageData.recipient.trim() || !messageData.message.trim()) {
      setStatusMessage('❌ Please fill in recipient and message.');
      return;
    }

    try {
      setIsSending(true);
      setStatusMessage('');

      const response = await messageService.sendText({
        session: connectionStatus.sessionId,
        to: messageData.recipient,
        text: messageData.message,
      });

      if (response.success) {
        setStatusMessage('✅ Message sent successfully!');
        setMessageData({ recipient: '', message: '' });
      } else {
        setStatusMessage('❌ Failed to send message. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      setStatusMessage(`❌ ${axiosError.response?.data?.message || 'Failed to send message'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Send Messages</h2>
        <p className="text-muted-foreground">
          Send messages through your connected WhatsApp session
        </p>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connectionStatus?.status === 'connected' && connectionStatus?.connected ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                WhatsApp Connected
              </>
            ) : connectionStatus?.status === 'connecting' ? (
              <>
                <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />
                WhatsApp Connecting
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                WhatsApp Disconnected
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`text-sm font-medium ${
                connectionStatus?.status === 'connected' && connectionStatus?.connected
                  ? 'text-green-600'
                  : connectionStatus?.status === 'connecting'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {connectionStatus?.status === 'connected' && connectionStatus?.connected
                  ? 'Connected'
                  : connectionStatus?.status === 'connecting'
                  ? 'Connecting...'
                  : 'Disconnected'}
              </span>
            </div>
            {connectionStatus?.phoneNumber && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phone Number</span>
                <span className="text-sm font-medium">{connectionStatus.phoneNumber}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Actions</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={checkConnectionStatus}>
                  Refresh
                </Button>
                {connectionStatus?.status !== 'connected' && !connectionStatus?.connected && (
                  <Button 
                    size="sm" 
                    onClick={handleScanQR}
                    disabled={isGeneratingQR || connectionStatus?.status === 'connecting'}
                  >
                    {isGeneratingQR ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : connectionStatus?.status === 'connecting' ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-pulse" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan QR
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm">{connectionStatus?.message || 'Checking connection...'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
              <CardDescription>
                {connectionStatus?.connected 
                  ? 'Fill in the details to send a message' 
                  : 'Connect WhatsApp first to send messages'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Phone Number</Label>
                <Input
                  id="recipient"
                  placeholder="+628123456789"
                  value={messageData.recipient}
                  onChange={(e) => setMessageData({ ...messageData, recipient: e.target.value })}
                  disabled={!connectionStatus?.connected}
                />
                <p className="text-xs text-muted-foreground">
                  Use international format (e.g., +628123456789)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Type your message here..."
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                  disabled={!connectionStatus?.connected}
                />
              </div>

              {statusMessage && (
                <div className="p-3 rounded-md bg-muted">
                  <p className="text-sm">{statusMessage}</p>
                </div>
              )}

              <Button 
                onClick={handleSendMessage} 
                className="w-full"
                disabled={!connectionStatus?.connected || isSending}
              >
                {isSending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Guide</CardTitle>
            </CardHeader>
            <CardContent>
              {!connectionStatus?.connected ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">WhatsApp Not Connected</p>
                      <p className="text-xs text-muted-foreground">
                        You need to connect your WhatsApp first
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>To connect WhatsApp:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to Dashboard</li>
                      <li>Click "Scan" button</li>
                      <li>Scan QR code with WhatsApp</li>
                      <li>Return here to send messages</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Ready to Send</p>
                      <p className="text-xs text-muted-foreground">
                        Your WhatsApp is connected and ready
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Connected as: {connectionStatus?.phoneNumber}</p>
                    <p>Session: {connectionStatus?.sessionId}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use international format (+628xxx)</li>
                <li>• Keep messages under 4096 characters</li>
                <li>• Avoid spam to prevent account ban</li>
                <li>• Check connection status regularly</li>
                <li>• Only text messages are supported</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {connectionStatus?.connected && (
        <Card>
          <CardHeader>
            <CardTitle>Message Information</CardTitle>
            <CardDescription>Important information about messaging</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Rate Limits</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Max 20 messages per minute</li>
                    <li>• Max 500 messages per hour</li>
                    <li>• Max 10 messages per recipient/hour</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Message Queue</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Messages are queued automatically</li>
                    <li>• Failed messages retry 3 times</li>
                    <li>• Check logs for delivery status</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect WhatsApp</DialogTitle>
            <DialogDescription>
              {connectionStatus?.status === 'connecting' 
                ? 'Scan this QR code with your WhatsApp mobile app to connect'
                : 'Generating QR code...'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-6">
            {qrCode ? (
              <>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64"
                  />
                </div>
                <div className="text-center space-y-2">
                  {connectionStatus?.status === 'connecting' ? (
                    <div className="flex items-center justify-center gap-2 text-yellow-600">
                      <Clock className="h-4 w-4 animate-pulse" />
                      <p className="text-sm font-medium">Waiting for scan...</p>
                    </div>
                  ) : null}
                  <p className="text-sm font-medium">How to scan:</p>
                  <ol className="text-xs text-muted-foreground space-y-1">
                    <li>1. Open WhatsApp on your phone</li>
                    <li>2. Tap Menu (⋮) → Linked devices</li>
                    <li>3. Tap "Link a device"</li>
                    <li>4. Point your phone at this screen</li>
                  </ol>
                  <p className="text-xs text-amber-600 mt-3">
                    ⏱️ QR code expires in 2 minutes
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground">Generating QR code...</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              {connectionStatus?.status === 'connecting' 
                ? 'Scan QR code to connect'
                : 'Having trouble? Refresh and try again'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowQRModal(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
