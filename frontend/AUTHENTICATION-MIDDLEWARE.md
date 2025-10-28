# 🔐 AUTHENTICATION MIDDLEWARE

Implementasi sistem authentication untuk WhatsApp Hub dengan middleware protection.

## 📋 Overview

Dashboard dan halaman protected lainnya sekarang memerlukan login yang sukses untuk diakses. Sistem authentication menggunakan JWT tokens dan localStorage untuk session management.

## 🛡️ Protected Routes

### Routes yang Dilindungi:
- `/dashboard` - Main dashboard
- `/dashboard/sessions` - Session management  
- `/dashboard/messages` - Message history
- `/dashboard/analytics` - Analytics (coming soon)
- `/dashboard/users` - User management (coming soon)
- `/dashboard/settings` - Settings (coming soon)

### Public Routes:
- `/login` - Login page
- `/register` - Registration page

## 🔧 Implementation

### 1. AuthContext (`src/contexts/AuthContext.tsx`)

Menyediakan state management untuk authentication:

```tsx
const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

**Features:**
- JWT token storage di localStorage
- Automatic token validation
- User session persistence
- Auto-redirect untuk authenticated users

### 2. ProtectedRoute Component (`src/components/ProtectedRoute.tsx`)

Middleware yang melindungi routes:

```tsx
<ProtectedRoute>
  <DashboardLayout />
</ProtectedRoute>
```

**Features:**
- Loading state saat check authentication
- Auto-redirect ke `/login` jika belum login
- Preserve intended destination setelah login

### 3. Login Flow

#### Login Page (`src/pages/auth/LoginPage.tsx`)

```typescript
// API call ke backend
const response = await fetch('http://localhost:5001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Store token dan redirect
localStorage.setItem('token', data.data.token);
navigate('/dashboard');
```

#### Register Page (`src/pages/auth/RegisterPage.tsx`)

```typescript
// Registration dengan redirect ke login
const response = await fetch('http://localhost:5001/auth/register', {
  method: 'POST',
  body: JSON.stringify({ email, password, role: 'user' }),
});

// Redirect ke login setelah sukses register
navigate('/login', { state: { message: 'Registration successful!' } });
```

### 4. Dashboard Integration

#### TopNav dengan User Info
```tsx
// Display user email dan logout button
<span>{user?.email}</span>
<Button onClick={logout}>Logout</Button>
```

#### Auto-logout pada Token Expiry
```typescript
// Axios interceptor di src/services/api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      navigateTo('/login');
    }
    return Promise.reject(error);
  }
);
```

## 🚀 Usage

### 1. Wrap App dengan AuthProvider:
```tsx
<BrowserRouter>
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
</BrowserRouter>
```

### 2. Protect Routes:
```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
```

### 3. Use Auth in Components:
```tsx
const { user, logout, isAuthenticated } = useAuth();

if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

## 🔒 Security Features

### Token Management
- JWT tokens stored di localStorage sebagai `token`
- Automatic token validation pada app startup
- Token dikirim di Authorization header: `Bearer <token>`

### Route Protection
- Semua dashboard routes protected
- Loading state saat validasi token
- Redirect dengan state preservation

### Session Handling
- Auto-logout pada token expiry (401 response)
- Clear semua auth data saat logout
- Persistent session across browser reload

### Error Handling
- Network error handling
- Invalid credentials feedback
- Registration validation

## 📊 Flow Diagram

```
App Start
    ↓
Check localStorage for token
    ↓
    ├─ Token exists → Validate with backend
    │   ├─ Valid → Set user state → Allow access
    │   └─ Invalid → Clear token → Redirect to login
    │
    └─ No token → Show login page
        ↓
    User login → Store token → Redirect to dashboard
        ↓
    Access protected routes → Middleware check → Allow/Deny
```

## 🛠️ API Integration

### Backend Endpoints Used:
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration  
- `GET /auth/me` - Token validation
- All protected endpoints dengan `Authorization: Bearer <token>`

### Token Format:
```typescript
// Request header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Response data
{
  success: true,
  data: {
    token: "jwt_token_here",
    user: {
      id: "user_id",
      email: "user@example.com", 
      role: "user"
    }
  }
}
```

## ✅ Testing

### Login Flow:
1. Visit `http://localhost:5173`
2. Auto-redirect ke `/login` (not authenticated)
3. Enter credentials dan submit
4. Success → redirect ke `/dashboard`
5. Access protected routes normally

### Logout Flow:
1. Click logout button di TopNav atau Dashboard
2. Clear auth data dan redirect ke `/login`
3. Protected routes no longer accessible

### Session Persistence:
1. Login successfully
2. Reload browser → stay logged in
3. Close/reopen browser → stay logged in (until token expires)

**🔐 Authentication middleware sekarang fully implemented dan dashboard hanya bisa diakses setelah login sukses!** 🎉