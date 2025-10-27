import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Image, FileText } from 'lucide-react';

export default function MessagesPage() {
  const [messageData, setMessageData] = useState({
    session: '',
    recipient: '',
    message: '',
    type: 'text',
  });

  const handleSendMessage = () => {
    // TODO: Implement API call to send message
    console.log('Sending message:', messageData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Send Messages</h2>
        <p className="text-muted-foreground">
          Send messages through your connected WhatsApp sessions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
              <CardDescription>Fill in the details to send a message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session">Session</Label>
                <Input
                  id="session"
                  placeholder="Select or enter session ID"
                  value={messageData.session}
                  onChange={(e) =>
                    setMessageData({ ...messageData, session: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  placeholder="+62812345678"
                  value={messageData.recipient}
                  onChange={(e) =>
                    setMessageData({ ...messageData, recipient: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Type your message here..."
                  value={messageData.message}
                  onChange={(e) =>
                    setMessageData({ ...messageData, message: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSendMessage} className="flex-1">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline">
                  <Image className="mr-2 h-4 w-4" />
                  Image
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sent Today</span>
                <span className="text-sm font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="text-sm font-medium text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Queue</span>
                <span className="text-sm font-medium">12 pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Failed</span>
                <span className="text-sm font-medium text-destructive">3</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use international format for phone numbers</li>
                <li>• Check session status before sending</li>
                <li>• Monitor queue for large batches</li>
                <li>• Respect rate limits to avoid bans</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Your message history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">+62 812 3456 789{i}</p>
                  <p className="text-xs text-muted-foreground">
                    Hello, this is a test message
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{i} min ago</p>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Sent
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
