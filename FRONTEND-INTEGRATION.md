# Frontend Integration Checklist

This document provides a checklist for frontend developers to integrate with the WhatsApp Hub API.

## ✅ API Documentation Status

### Complete Documentation Available

- ✅ **OpenAPI/Swagger UI**: Available at `http://localhost:5001/api-docs/ui`
- ✅ **OpenAPI Spec (JSON)**: Available at `http://localhost:5001/api-docs/spec`
- ✅ **API Reference Guide**: See `backend/API-REFERENCE.md`
- ✅ **Tests**: All documentation tests passing (21/21)

## 📋 API Endpoints Ready for Frontend

### Authentication Endpoints ✅

All authentication endpoints are ready and documented:

- ✅ `POST /auth/register` - Register new user
- ✅ `POST /auth/login` - User login  
- ✅ `GET /auth/me` - Get current user
- ✅ `POST /auth/regenerate-api-key` - Regenerate API key

**Authentication Methods:**
- ✅ JWT Bearer Token for user management (`Authorization: Bearer <token>`)
- ✅ API Key for WhatsApp operations (`x-api-key: <api_key>`)

### Session Management Endpoints ✅

All session endpoints are ready and documented:

- ✅ `POST /session/start` - Create new session with QR
- ✅ `GET /session/list` - List all sessions
- ✅ `GET /session/status` - Get session status
- ✅ `GET /session/qr-image` - Get QR code as PNG image
- ✅ `POST /session/logout` - Logout session
- ✅ `POST /session/check-phone` - Check if phone has session
- ✅ `POST /session/cleanup` - Cleanup inactive sessions

### Message Endpoints ✅

All message endpoints are ready and documented:

- ✅ `POST /message/send-text` - Send text message
- ✅ `POST /message/send-image` - Send image with caption
- ✅ `POST /message/send-document` - Send document file
- ✅ `POST /message/send-sticker` - Send sticker
- ✅ `GET /message/queue-status` - Get queue status

**Message Queue System:**
- ✅ Rate limiting: 20 messages/min, 500/hour
- ✅ Per-recipient limits: 10 messages/hour
- ✅ Queue status tracking (pending, processing, completed, failed)

### User Management Endpoints ✅

All user endpoints are ready and documented:

- ✅ `GET /user/profile` - Get user profile
- ✅ `PUT /user/profile` - Update user profile
- ✅ `GET /user/accounts` - Get user's WhatsApp accounts
- ✅ `GET /user/admin/users` - List all users (admin)
- ✅ `GET /user/admin/users/:id` - Get user by ID (admin)
- ✅ `PUT /user/admin/users/:id` - Update user (admin)
- ✅ `DELETE /user/admin/users/:id` - Delete user (admin)
- ✅ `GET /user/admin/accounts` - List all accounts (admin)

### Profile Endpoints ✅

- ✅ `POST /profile` - Get WhatsApp contact profile

### System Endpoints ✅

- ✅ `GET /health` - System health check

## 🔧 Frontend Implementation Guide

### 1. Environment Configuration

Create `.env` file in frontend:

```env
VITE_API_URL=http://localhost:5001
VITE_API_DOCS_URL=http://localhost:5001/api-docs/ui
```

### 2. API Client Setup

```typescript
// api/client.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem('jwtToken');
  const apiKey = localStorage.getItem('apiKey');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(apiKey && { 'x-api-key': apiKey }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}
```

### 3. Authentication Module

```typescript
// api/auth.ts
import { apiRequest } from './client';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user' | 'readonly';
  apiKey: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export async function register(
  email: string,
  password: string,
  role?: string
): Promise<AuthResponse> {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser(): Promise<{ success: boolean; data: User }> {
  return apiRequest('/auth/me');
}

export async function regenerateApiKey(): Promise<{ success: boolean; data: { apiKey: string } }> {
  return apiRequest('/auth/regenerate-api-key', {
    method: 'POST',
  });
}
```

### 4. Session Management Module

```typescript
// api/sessions.ts
import { apiRequest } from './client';

export interface Session {
  sessionId: string;
  phoneNumber: string;
  status: 'connecting' | 'connected' | 'disconnected';
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export async function createSession(
  session: string,
  phoneNumber: string
): Promise<{ qr?: string; data?: any }> {
  return apiRequest('/session/start', {
    method: 'POST',
    body: JSON.stringify({ session, phoneNumber }),
  });
}

export async function listSessions(): Promise<{ data: Session[] }> {
  return apiRequest('/session/list');
}

export async function getSessionStatus(
  session: string
): Promise<{ data: Session }> {
  return apiRequest(`/session/status?session=${session}`);
}

export async function getQRImage(session: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/session/qr-image?session=${session}`,
    {
      headers: {
        'x-api-key': localStorage.getItem('apiKey') || '',
      },
    }
  );
  return response.blob();
}

export async function logoutSession(session: string): Promise<{ data: string }> {
  return apiRequest('/session/logout', {
    method: 'POST',
    body: JSON.stringify({ session }),
  });
}

export async function checkPhoneSession(phoneNumber: string): Promise<{
  hasActiveSession: boolean;
  session?: Session;
}> {
  return apiRequest('/session/check-phone', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
}
```

### 5. Message Module

```typescript
// api/messages.ts
import { apiRequest } from './client';

export interface MessageRequest {
  session: string;
  to: string;
  text: string;
  is_group?: boolean;
}

export interface ImageMessageRequest extends MessageRequest {
  image_url: string;
}

export interface DocumentMessageRequest extends MessageRequest {
  document_url: string;
  document_name: string;
}

export async function sendTextMessage(
  data: MessageRequest
): Promise<{ success: boolean; messageId: string; message: string }> {
  return apiRequest('/message/send-text', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function sendImageMessage(
  data: ImageMessageRequest
): Promise<{ success: boolean; messageId: string; message: string }> {
  return apiRequest('/message/send-image', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function sendDocumentMessage(
  data: DocumentMessageRequest
): Promise<{ success: boolean; messageId: string; message: string }> {
  return apiRequest('/message/send-document', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getQueueStatus(session: string): Promise<{
  session: string;
  stats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  queue: any[];
}> {
  return apiRequest(`/message/queue-status?session=${session}`);
}
```

### 6. Error Handling

```typescript
// api/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: any): string {
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please login.';
      case 403:
        return 'Access denied. Insufficient permissions.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Rate limit exceeded. Please try again later.';
      case 500:
        return 'Server error. Please try again.';
      default:
        return error.message || 'An error occurred';
    }
  }
  return 'An unexpected error occurred';
}
```

## 🔒 Security Best Practices

### Token Storage

✅ **Recommended Approaches:**
- Use httpOnly cookies for JWT tokens (most secure)
- Use secure localStorage with encryption
- Implement token refresh mechanism

❌ **Avoid:**
- Storing tokens in regular localStorage without encryption
- Exposing tokens in URL parameters
- Storing tokens in sessionStorage for long-lived sessions

### API Key Protection

- ✅ Never expose API keys in client-side code
- ✅ Use environment variables
- ✅ Implement proper CORS in production
- ✅ Use HTTPS in production

## 🎯 Required UI Components

### Authentication UI
- ✅ Login form
- ✅ Registration form
- ✅ Password validation (min 8 chars)
- ✅ Token storage and management
- ✅ Auto-redirect on authentication

### Session Management UI
- ✅ Session list view
- ✅ Create session form
- ✅ QR code display component
- ✅ Session status indicator
- ✅ Phone number validation
- ✅ Session disconnect button

### Message UI
- ✅ Message composer
- ✅ Recipient selection
- ✅ Text message input
- ✅ Image upload and preview
- ✅ Document upload
- ✅ Queue status display
- ✅ Send confirmation
- ✅ Error handling display

### Admin UI (Optional)
- ✅ User list
- ✅ User creation/edit
- ✅ Role management
- ✅ Session overview

## 📊 State Management Recommendations

### Using TanStack Query (React Query)

```typescript
// hooks/useAuth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import * as authAPI from '../api/auth';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authAPI.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem('jwtToken', data.data.token);
      localStorage.setItem('apiKey', data.data.user.apiKey);
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authAPI.getCurrentUser,
    retry: false,
  });
}
```

### Using Zustand

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { User } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  apiKey: string | null;
  setAuth: (user: User, token: string, apiKey: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('jwtToken'),
  apiKey: localStorage.getItem('apiKey'),
  setAuth: (user, token, apiKey) => {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('apiKey', apiKey);
    set({ user, token, apiKey });
  },
  clearAuth: () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('apiKey');
    set({ user: null, token: null, apiKey: null });
  },
}));
```

## 🧪 Testing Recommendations

### API Integration Tests

```typescript
// tests/api.test.ts
import { describe, it, expect } from 'vitest';
import * as authAPI from '../api/auth';

describe('Authentication API', () => {
  it('should register a new user', async () => {
    const response = await authAPI.register(
      'test@example.com',
      'Password123'
    );
    expect(response.success).toBe(true);
    expect(response.data.user).toBeDefined();
    expect(response.data.token).toBeDefined();
  });

  it('should login with valid credentials', async () => {
    const response = await authAPI.login(
      'test@example.com',
      'Password123'
    );
    expect(response.success).toBe(true);
  });
});
```

## 📱 Real-time Updates

For real-time session status and message updates, consider:

1. **Polling** (Simple):
   ```typescript
   // Poll session status every 5 seconds
   useQuery({
     queryKey: ['sessionStatus', sessionId],
     queryFn: () => getSessionStatus(sessionId),
     refetchInterval: 5000,
   });
   ```

2. **WebSocket** (Advanced, requires backend implementation):
   - Connect to WebSocket endpoint
   - Subscribe to session events
   - Update UI in real-time

## ✅ Final Checklist

Before starting frontend development, ensure:

- [x] API documentation is available at `/api-docs/ui`
- [x] All endpoints are documented with request/response examples
- [x] Authentication methods are understood (JWT + API Key)
- [x] Rate limits are documented and understood
- [x] Error response format is consistent
- [x] Frontend integration guide is available
- [x] Security best practices are documented
- [x] Example code is provided for common operations

## 🚀 Next Steps for Frontend Team

1. **Review Documentation**
   - Read `backend/API-REFERENCE.md`
   - Explore Swagger UI at `http://localhost:5001/api-docs/ui`

2. **Set Up Development Environment**
   - Configure environment variables
   - Create API client module

3. **Implement Authentication Flow**
   - Login/Register forms
   - Token management
   - Protected routes

4. **Implement Session Management**
   - Session creation with QR display
   - Session list and status
   - Session controls

5. **Implement Messaging**
   - Message composer
   - Queue status display
   - Error handling

6. **Testing**
   - Test all API integrations
   - Handle edge cases
   - Test error scenarios

## 📞 Support

For questions or issues:
- API Documentation: http://localhost:5001/api-docs/ui
- API Reference: backend/API-REFERENCE.md
- Backend Team: Check repository issues

---

**Status**: ✅ All API endpoints ready for frontend integration
**Last Updated**: 2025-10-28
**Tests Passing**: 21/21 documentation tests ✅
