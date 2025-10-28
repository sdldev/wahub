# Frontend API Services Quick Reference

## Import
```typescript
import { 
  authService, 
  sessionService, 
  messageService,
  userService,
  profileService 
} from '@/services';
```

## Authentication Service

### Register
```typescript
const { data } = await authService.register({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});
// Returns: { token, user }
```

### Login
```typescript
const { data } = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});
// Returns: { token, user }
```

### Get Current User
```typescript
const { data } = await authService.getCurrentUser();
// Returns: User object
```

### Regenerate API Key
```typescript
const { data } = await authService.regenerateApiKey();
// Returns: { apiKey }
```

### Logout
```typescript
authService.logout();
// Clears local storage and redirects to login
```

## Session Service

### Create Session
```typescript
const response = await sessionService.createSession({
  sessionId: '62812345678',
  phoneNumber: '+62812345678'
});
// Returns: { qr?: string, data?: any }
```

### Get All Sessions
```typescript
const sessions = await sessionService.getAllSessions();
// Returns: Session[]
```

### Get Session Status
```typescript
const status = await sessionService.getSessionStatus('62812345678');
// Returns: Session object
```

### Get QR Code Image
```typescript
const blob = await sessionService.getQRCodeImage('62812345678');
const imageUrl = URL.createObjectURL(blob);
// Returns: Blob (PNG image)
```

### Logout Session
```typescript
await sessionService.logoutSession('62812345678');
// Returns: void
```

### Check Phone Number
```typescript
const result = await sessionService.checkPhoneNumber('+62812345678');
// Returns: { hasActiveSession: boolean, session?: Session }
```

### Cleanup Sessions
```typescript
const result = await sessionService.cleanupSessions(24); // hours
// Returns: { message: string, cleanedCount: number }
```

## Message Service

### Send Text Message
```typescript
await messageService.sendText({
  session: '62812345678',
  to: '6287654321',
  text: 'Hello World!'
});
// Returns: { success: boolean, message: string }
```

### Send Image Message
```typescript
await messageService.sendImage({
  session: '62812345678',
  to: '6287654321',
  text: 'Check this out!',
  image_url: 'https://example.com/image.jpg',
  is_group: false
});
// Returns: { success: boolean, message: string }
```

### Send Document Message
```typescript
await messageService.sendDocument({
  session: '62812345678',
  to: '6287654321',
  text: 'Here is the document',
  document_url: 'https://example.com/doc.pdf',
  document_name: 'document.pdf',
  is_group: false
});
// Returns: { success: boolean, message: string }
```

### Send Sticker
```typescript
await messageService.sendSticker({
  session: '62812345678',
  to: '6287654321',
  image_url: 'https://example.com/sticker.webp',
  is_group: false
});
// Returns: { success: boolean, message: string }
```

### Get Queue Status
```typescript
const status = await messageService.getQueueStatus('62812345678');
// Returns: { session: string, stats: {...}, queue: [...] }
// Note: Backend returns data directly, not wrapped in { data: ... }
```

## User Service

### Get Current User's Accounts
```typescript
const accounts = await userService.getAccounts();
// Returns: WhatsAppAccount[]
```

### Get Current User Profile
```typescript
const profile = await userService.getProfile();
// Returns: User object
```

### Update Current User Profile
```typescript
const updated = await userService.updateProfile({
  email: 'new@example.com',
  password: 'newpassword123'
});
// Returns: User object
```

### Admin: List All Users
```typescript
const users = await userService.listAllUsers();
// Returns: User[]
```

### Admin: Get User By ID
```typescript
const user = await userService.getUserById(1);
// Returns: User object
```

### Admin: Update User
```typescript
const updated = await userService.updateUser(1, {
  role: 'admin',
  email: 'updated@example.com'
});
// Returns: User object
```

### Admin: Delete User
```typescript
await userService.deleteUser(1);
// Returns: void
```

### Admin: List All Accounts
```typescript
const accounts = await userService.listAllAccounts();
// Returns: WhatsAppAccount[]
```

## Profile Service

### Get WhatsApp Profile
```typescript
const profile = await profileService.getProfile({
  session: '62812345678',
  target: '6287654321@s.whatsapp.net'  // Must include @s.whatsapp.net or @g.us
});
// Returns: WhatsAppProfile object
// { name, about, profilePicUrl, phoneNumber }
```

## Common Patterns

### Authentication Flow
```typescript
// 1. Login
const { data } = await authService.login({ email, password });
localStorage.setItem('token', data.token);
localStorage.setItem('apiKey', data.user.apiKey);

// 2. Use API
// Token and API key are automatically added by axios interceptor
const sessions = await sessionService.getAllSessions();

// 3. Logout
authService.logout(); // Clears storage and redirects
```

### Session Creation with QR Display
```typescript
// 1. Create session
const response = await sessionService.createSession({
  sessionId: phoneNumber,
  phoneNumber: phoneNumber
});

// 2. Display QR if returned
if (response.qr) {
  setQrCode(response.qr); // QR string
} else if (response.data?.message === 'Connected') {
  setConnected(true);
}

// 3. Or get QR as image
const blob = await sessionService.getQRCodeImage(phoneNumber);
const imageUrl = URL.createObjectURL(blob);
setQrImageUrl(imageUrl);
```

### Send Message with Error Handling
```typescript
try {
  await messageService.sendText({
    session: currentSession,
    to: recipient,
    text: messageText
  });
  showSuccess('Message sent!');
} catch (error) {
  if (error.response?.status === 429) {
    showError('Rate limit exceeded. Please wait.');
  } else if (error.response?.status === 400) {
    showError('Session not found or invalid.');
  } else {
    showError('Failed to send message.');
  }
}
```

### User Management (Admin)
```typescript
// Load all users
const users = await userService.listAllUsers();

// Update user role
await userService.updateUser(userId, { role: 'admin' });

// Delete user
if (confirm('Delete user?')) {
  await userService.deleteUser(userId);
}

// Get all WhatsApp accounts across all users
const allAccounts = await userService.listAllAccounts();
```

## TypeScript Types

```typescript
// Import types
import type {
  User,
  Session,
  WhatsAppAccount,
  SendTextMessageRequest,
  SendImageMessageRequest,
  SendDocumentMessageRequest,
  QueueStatus,
  WhatsAppProfile
} from '@/services';

// Use in your components
const [session, setSession] = useState<Session | null>(null);
const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
```

## API Response Format

All backend responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (not logged in or invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Environment Variables

```env
VITE_API_URL=http://localhost:5001
```

## Authentication Headers

The axios interceptor automatically adds:
- `Authorization: Bearer <token>` (from localStorage.token)
- `x-api-key: <apiKey>` (from localStorage.apiKey)

No need to manually add these headers!

## Rate Limits

- **Messages**: Max 20/min, 500/hour
- **Per Recipient**: Max 10 messages/session/hour

Handle 429 errors appropriately in your UI.

## Resources

- Full Documentation: `/API-IMPLEMENTATION.md`
- Migration Guide: `/MIGRATION-GUIDE.md`
- Backend API Docs: `http://localhost:5001/api-docs/ui`
- Backend Reference: `/backend/API-REFERENCE.md`
