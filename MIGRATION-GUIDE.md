# Frontend API Service Migration Guide

## Overview
This guide helps developers migrate from old service implementations to the new, corrected API service layer.

## Breaking Changes

### 1. Session Service Changes

#### ❌ Old (Removed)
```typescript
// This method no longer exists
await sessionService.getQRCode(sessionId);
```

#### ✅ New (Use this instead)
```typescript
// Get QR code as image blob
const blob = await sessionService.getQRCodeImage(sessionId);
const imageUrl = URL.createObjectURL(blob);
```

#### ⚠️ Updated Method Signatures

**createSession()**
```typescript
// Old (incorrect endpoint)
await sessionService.createSession({
  sessionId: '62812345678',
  phoneNumber: '+62812345678'
});

// New (correct endpoint: /session/start)
await sessionService.createSession({
  sessionId: '62812345678',
  phoneNumber: '+62812345678'
});
// Implementation changed internally, but usage stays the same
```

### 2. Message Service Changes

#### ⚠️ Updated Interfaces

**SendImageMessageRequest**
```typescript
// Old
interface SendImageMessageRequest {
  session: string;
  to: string;
  image: string;        // ❌ Wrong field name
  caption?: string;     // ❌ Wrong field name
}

// New
interface SendImageMessageRequest {
  session: string;
  to: string;
  image_url: string;    // ✅ Correct field name
  text: string;         // ✅ Correct field name
  is_group?: boolean;   // ✅ Added
}
```

**SendDocumentMessageRequest**
```typescript
// Old
interface SendDocumentMessageRequest {
  session: string;
  to: string;
  document: string;     // ❌ Wrong field name
  filename?: string;    // ❌ Wrong field name
}

// New
interface SendDocumentMessageRequest {
  session: string;
  to: string;
  document_url: string; // ✅ Correct field name
  document_name: string;// ✅ Correct field name
  text: string;         // ✅ Added
  is_group?: boolean;   // ✅ Added
}
```

#### ❌ Removed Methods
```typescript
// These methods have been removed (backend endpoints don't exist)
await messageService.clearQueue(session);
await messageService.getMessageHistory(session);
```

#### ✅ Added Method
```typescript
// New method for sending stickers
await messageService.sendSticker({
  session: '62812345678',
  to: '6287654321',
  image_url: 'https://example.com/sticker.webp',
  is_group: false
});
```

### 3. Auth Service Changes

#### ✅ New Method Added
```typescript
// Regenerate API key for current user
const { data } = await authService.regenerateApiKey();
console.log('New API key:', data.apiKey);
```

## New Services

### 1. User Service (NEW)

```typescript
import { userService } from '@/services';

// Get current user's WhatsApp accounts
const accounts = await userService.getAccounts();

// Get current user profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({
  email: 'new@example.com',
  password: 'newpassword123'
});

// Admin operations
const users = await userService.listAllUsers();
const user = await userService.getUserById(1);
await userService.updateUser(1, { role: 'admin' });
await userService.deleteUser(1);
const allAccounts = await userService.listAllAccounts();
```

### 2. Profile Service (NEW)

```typescript
import { profileService } from '@/services';

// Get WhatsApp contact profile
const profile = await profileService.getProfile({
  session: '62812345678',
  target: '6287654321@s.whatsapp.net'  // Must include domain
});

console.log(profile.name, profile.about, profile.profilePicUrl);
```

## Migration Examples

### Example 1: Migrating Session Creation

```typescript
// Before
const createSession = async () => {
  try {
    const response = await sessionService.createSession({
      sessionId: phoneNumber,
      phoneNumber: phoneNumber
    });
    
    if (response.qr) {
      // Get QR code string
      const qrData = response.qr;
      // Generate QR image somehow...
    }
  } catch (error) {
    console.error(error);
  }
};

// After (no changes needed, works the same way!)
const createSession = async () => {
  try {
    const response = await sessionService.createSession({
      sessionId: phoneNumber,
      phoneNumber: phoneNumber
    });
    
    if (response.qr) {
      // Still works the same
      const qrData = response.qr;
    }
  } catch (error) {
    console.error(error);
  }
};
```

### Example 2: Migrating QR Code Display

```typescript
// Before (using non-existent method)
const getQR = async (sessionId: string) => {
  const response = await sessionService.getQRCode(sessionId);
  return response.qr;
};

// After (using correct method)
const getQR = async (sessionId: string) => {
  const blob = await sessionService.getQRCodeImage(sessionId);
  const imageUrl = URL.createObjectURL(blob);
  return imageUrl;
};
```

### Example 3: Migrating Message Sending

```typescript
// Before (wrong field names)
const sendImage = async () => {
  await messageService.sendImage({
    session: '62812345678',
    to: '6287654321',
    image: 'https://example.com/image.jpg',  // ❌ Wrong
    caption: 'Check this out!'                // ❌ Wrong
  });
};

// After (correct field names)
const sendImage = async () => {
  await messageService.sendImage({
    session: '62812345678',
    to: '6287654321',
    image_url: 'https://example.com/image.jpg',  // ✅ Correct
    text: 'Check this out!',                      // ✅ Correct
    is_group: false                               // ✅ Added
  });
};
```

### Example 4: Using New User Service

```typescript
// New feature: User management
const UserProfile = () => {
  const [accounts, setAccounts] = useState([]);
  
  useEffect(() => {
    const loadAccounts = async () => {
      const data = await userService.getAccounts();
      setAccounts(data);
    };
    
    loadAccounts();
  }, []);
  
  return (
    <div>
      {accounts.map(account => (
        <div key={account.sessionId}>
          {account.phoneNumber} - {account.status}
        </div>
      ))}
    </div>
  );
};
```

## Import Changes

### Before
```typescript
import { authService } from '@/services/auth.service';
import { sessionService } from '@/services/session.service';
import { messageService } from '@/services/message.service';
```

### After (Recommended)
```typescript
// Import from central index
import { 
  authService, 
  sessionService, 
  messageService,
  userService,      // New
  profileService    // New
} from '@/services';

// Or import types
import type { 
  User, 
  Session, 
  WhatsAppAccount 
} from '@/services';
```

## Testing Your Migration

### 1. Type Checking
```bash
npm run type-check
```
If you see TypeScript errors, check:
- Field names in message interfaces
- Method signatures
- Removed methods usage

### 2. Runtime Testing
- Test session creation with QR code display
- Test sending images and documents with new field names
- Test user management features
- Test profile fetching

## Common Migration Errors

### Error: Property 'getQRCode' does not exist
**Solution:** Use `getQRCodeImage()` instead

### Error: Property 'image' does not exist on type 'SendImageMessageRequest'
**Solution:** Change `image` to `image_url`

### Error: Property 'caption' does not exist on type 'SendImageMessageRequest'
**Solution:** Change `caption` to `text`

### Error: Property 'clearQueue' does not exist
**Solution:** Remove usage, backend endpoint doesn't exist

### Error: Property 'getMessageHistory' does not exist
**Solution:** Remove usage, backend endpoint doesn't exist

## Need Help?

- Check API-IMPLEMENTATION.md for detailed documentation
- Check backend/API-REFERENCE.md for API specifications
- Check Swagger UI at http://localhost:5001/api-docs/ui

## Checklist

- [ ] Updated all session service calls
- [ ] Updated message field names (image → image_url, etc.)
- [ ] Removed usage of getQRCode, clearQueue, getMessageHistory
- [ ] Added is_group field to message calls where needed
- [ ] Tested QR code display with new method
- [ ] Updated imports to use central index
- [ ] Tested build and type-check
- [ ] Tested runtime functionality
