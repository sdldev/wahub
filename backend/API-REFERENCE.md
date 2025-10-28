# WhatsApp Hub API Reference

**Base URL**: `http://localhost:5001`  
**API Documentation UI**: `http://localhost:5001/api-docs/ui`  
**OpenAPI Spec**: `http://localhost:5001/api-docs/spec`

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [WhatsApp Sessions](#whatsapp-sessions)
- [Messages](#messages)
- [Profile](#profile)
- [System](#system)

---

## Authentication

All authentication endpoints use JWT tokens for user management operations.

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "apiKey": "abc123...",
      "createdAt": "2025-10-28T01:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: User already exists or validation error
- `500`: Server error

---

### POST /auth/login

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "apiKey": "abc123...",
      "createdAt": "2025-10-28T01:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Invalid credentials
- `500`: Server error

---

### GET /auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "apiKey": "abc123...",
    "createdAt": "2025-10-28T01:00:00.000Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

---

### POST /auth/regenerate-api-key

Generate a new API key for the current user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "new_api_key_123..."
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

---

## User Management

All user management endpoints require JWT authentication and appropriate role permissions.

### GET /user/profile

Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "apiKey": "abc123...",
    "createdAt": "2025-10-28T01:00:00.000Z",
    "updatedAt": "2025-10-28T01:00:00.000Z"
  }
}
```

---

### PUT /user/profile

Update current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "password": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "newemail@example.com",
    "role": "user",
    "apiKey": "abc123...",
    "updatedAt": "2025-10-28T02:00:00.000Z"
  }
}
```

---

### GET /user/accounts

Get WhatsApp accounts for current user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "62812345678",
      "phoneNumber": "+62812345678",
      "status": "connected",
      "userId": 1,
      "createdAt": "2025-10-28T01:00:00.000Z",
      "updatedAt": "2025-10-28T01:05:00.000Z"
    }
  ]
}
```

---

### GET /user/admin/users

List all users (admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2025-10-28T01:00:00.000Z",
      "updatedAt": "2025-10-28T01:00:00.000Z"
    }
  ]
}
```

---

## WhatsApp Sessions

All session endpoints require API key authentication.

### POST /session/start

Create a new WhatsApp session (deprecated, use /session/create for frontend).

**Headers:**
```
x-api-key: <your_api_key>
```

**Request Body:**
```json
{
  "session": "62812345678",
  "phoneNumber": "+62812345678"
}
```

**Response:**
```json
{
  "qr": "2@abc123..."
}
```

or if already connected:

```json
{
  "data": {
    "message": "Connected"
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Session already exists or invalid phone number
- `401`: Invalid API key

---

### GET /session/list

List all WhatsApp sessions for the user.

**Headers:**
```
x-api-key: <your_api_key>
```

**Response:**
```json
{
  "data": [
    {
      "sessionId": "62812345678",
      "phoneNumber": "+62812345678",
      "status": "connected",
      "userId": 1,
      "createdAt": "2025-10-28T01:00:00.000Z",
      "updatedAt": "2025-10-28T01:05:00.000Z"
    }
  ]
}
```

---

### GET /session/status

Get status of a specific session.

**Headers:**
```
x-api-key: <your_api_key>
```

**Query Parameters:**
- `session`: Session ID (required)

**Example:**
```
GET /session/status?session=62812345678
```

**Response:**
```json
{
  "data": {
    "sessionId": "62812345678",
    "phoneNumber": "+62812345678",
    "status": "connected",
    "isConnected": true,
    "lastUpdated": "2025-10-28T01:05:00.000Z",
    "createdAt": "2025-10-28T01:00:00.000Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Session not found
- `401`: Invalid API key

---

### POST /session/logout

Logout and delete a session.

**Headers:**
```
x-api-key: <your_api_key>
```

**Request Body:**
```json
{
  "session": "62812345678"
}
```

or Query Parameter:
```
POST /session/logout?session=62812345678
```

**Response:**
```json
{
  "data": "success"
}
```

---

### POST /session/check-phone

Check if a phone number already has an active session.

**Headers:**
```
x-api-key: <your_api_key>
```

**Request Body:**
```json
{
  "phoneNumber": "+62812345678"
}
```

**Response:**
```json
{
  "hasActiveSession": false
}
```

or if session exists:

```json
{
  "hasActiveSession": true,
  "session": {
    "sessionId": "62812345678",
    "phoneNumber": "+62812345678",
    "status": "connected"
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid phone number format
- `401`: Invalid API key

---

### GET /session/qr-image

Get QR code as PNG image for scanning.

**Headers:**
```
x-api-key: <your_api_key>
```

**Query Parameters:**
- `session`: Session ID (required)

**Example:**
```
GET /session/qr-image?session=62812345678
```

**Response:**
- Content-Type: `image/png`
- Binary PNG image data

**Status Codes:**
- `200`: Success - returns PNG image
- `400`: Session already connected or QR not available
- `401`: Invalid API key

---

### POST /session/cleanup

Cleanup inactive sessions older than specified hours.

**Headers:**
```
x-api-key: <your_api_key>
```

**Query Parameters:**
- `hours`: Number of hours (default: 24)

**Example:**
```
POST /session/cleanup?hours=48
```

**Response:**
```json
{
  "data": {
    "message": "Cleaned up 5 inactive sessions",
    "cleanedCount": 5
  }
}
```

---

## Messages

All message endpoints require API key authentication and use the message queue system.

### POST /message/send-text

Send a text message via WhatsApp.

> **Note:** There is also a deprecated `GET /message/send-text` endpoint that will be removed in v2.0. Always use the POST method for new implementations.

**Headers:**
```
x-api-key: <your_api_key>
```

**Request Body:**
```json
{
  "session": "62812345678",
  "to": "6287654321",
  "text": "Hello World!",
  "is_group": false
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_123456",
  "message": "Message queued successfully"
}
```

**Status Codes:**
- `200`: Success - message queued
- `400`: Session does not exist
- `429`: Rate limit exceeded
- `401`: Invalid API key

---

### POST /message/send-image

Send an image message with optional caption.

**Headers:**
```
x-api-key: <your_api_key>
```

**Request Body:**
```json
{
  "session": "62812345678",
  "to": "6287654321",
  "text": "Check this out!",
  "image_url": "https://example.com/image.jpg",
  "is_group": false
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_123456",
  "message": "Message queued successfully"
}
```

**Status Codes:**
- `200`: Success - message queued
- `400`: Session does not exist or invalid URL
- `429`: Rate limit exceeded
- `401`: Invalid API key

---

### POST /message/send-document

Send a document file via WhatsApp.

**Headers:**
```
x-api-key: <your_api_key>
```

**Request Body:**
```json
{
  "session": "62812345678",
  "to": "6287654321",
  "text": "Here's the document",
  "document_url": "https://example.com/document.pdf",
  "document_name": "document.pdf",
  "is_group": false
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_123456",
  "message": "Message queued successfully"
}
```

**Status Codes:**
- `200`: Success - message queued
- `400`: Session does not exist or invalid URL
- `429`: Rate limit exceeded
- `401`: Invalid API key

---

### POST /message/send-sticker

Send a sticker via WhatsApp.

**Headers:**
```
x-api-key: <your_api_key>
```

**Request Body:**
```json
{
  "session": "62812345678",
  "to": "6287654321",
  "image_url": "https://example.com/sticker.webp",
  "is_group": false
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_123456",
  "message": "Message queued successfully"
}
```

---

### GET /message/queue-status

Get message queue status for a session.

**Headers:**
```
x-api-key: <your_api_key>
```

**Query Parameters:**
- `session`: Session ID (required)

**Example:**
```
GET /message/queue-status?session=62812345678
```

**Response:**
```json
{
  "session": "62812345678",
  "stats": {
    "pending": 5,
    "processing": 1,
    "completed": 100,
    "failed": 2
  },
  "queue": [
    {
      "messageId": "msg_123",
      "to": "6287654321",
      "type": "text",
      "status": "pending",
      "createdAt": "2025-10-28T01:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `400`: Session does not exist
- `401`: Invalid API key

---

## Profile

Profile operations for WhatsApp contacts.

### POST /profile

Get WhatsApp profile information for a contact.

**Headers:**
```
x-api-key: <your_api_key>
```

**Request Body:**
```json
{
  "session": "62812345678",
  "target": "6287654321@s.whatsapp.net"
}
```

**Response:**
```json
{
  "data": {
    "name": "John Doe",
    "about": "Available",
    "profilePicUrl": "https://...",
    "phoneNumber": "+6287654321"
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Session does not exist or target not registered
- `401`: Invalid API key

---

## System

System health and monitoring endpoints.

### GET /health

Check system health and status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T01:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 123456789,
    "heapTotal": 67108864,
    "heapUsed": 33554432,
    "external": 1234567
  },
  "version": "v20.0.0"
}
```

**Status Codes:**
- `200`: System is healthy

---

## Authentication Methods

### JWT Bearer Token

Used for user management endpoints (`/auth/*`, `/user/*`).

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Get Token:**
1. Register via `/auth/register`
2. Login via `/auth/login`
3. Use returned token in Authorization header

---

### API Key

Used for WhatsApp operations (`/session/*`, `/message/*`, `/profile/*`).

**Header:**
```
x-api-key: <your_api_key>
```

**Get API Key:**
1. Register/login to get user account
2. Get API key from `/auth/me` endpoint
3. Use API key in x-api-key header

---

## Rate Limits

- **Messages**: Max 20 per minute, 500 per hour
- **Per Recipient**: Max 10 messages per session per hour
- **API Calls**: Standard rate limiting applies

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

**Common HTTP Status Codes:**
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Invalid/missing authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server-side error

---

## Frontend Integration Guide

### 1. User Authentication Flow

```javascript
// Register new user
const registerResponse = await fetch('http://localhost:5001/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123',
    role: 'user'
  })
});
const { data: { token, user } } = await registerResponse.json();

// Store token for subsequent requests
localStorage.setItem('jwtToken', token);
localStorage.setItem('apiKey', user.apiKey);
```

### 2. Create WhatsApp Session

```javascript
const apiKey = localStorage.getItem('apiKey');

const createSessionResponse = await fetch('http://localhost:5001/session/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  },
  body: JSON.stringify({
    session: '62812345678',
    phoneNumber: '+62812345678'
  })
});

const { qr } = await createSessionResponse.json();
// Display QR code for scanning
```

### 3. Send Message

```javascript
const apiKey = localStorage.getItem('apiKey');

const sendMessageResponse = await fetch('http://localhost:5001/message/send-text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  },
  body: JSON.stringify({
    session: '62812345678',
    to: '6287654321',
    text: 'Hello from frontend!',
    is_group: false
  })
});

const { success, messageId } = await sendMessageResponse.json();
```

### 4. Check Session Status

```javascript
const apiKey = localStorage.getItem('apiKey');

const statusResponse = await fetch(
  'http://localhost:5001/session/status?session=62812345678',
  {
    headers: { 'x-api-key': apiKey }
  }
);

const { data: sessionStatus } = await statusResponse.json();
console.log('Session status:', sessionStatus.status);
```

---

## Notes for Frontend Developers

1. **Always use HTTPS in production** to protect JWT tokens and API keys
2. **Store tokens securely** - use httpOnly cookies or secure storage
3. **Implement token refresh** for better UX
4. **Handle rate limiting** - show appropriate UI feedback
5. **Monitor session status** - poll or use webhooks for real-time updates
6. **Validate inputs** client-side before sending to API
7. **Handle errors gracefully** - show user-friendly error messages
8. **Use the API documentation UI** at `/api-docs/ui` for interactive testing

---

## Support

For issues or questions:
- Check API Documentation UI: http://localhost:5001/api-docs/ui
- Review this reference guide
- Check server logs for detailed error information
