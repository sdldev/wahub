# WhatsApp Gateway AI Coding Agent Instructions

## Project Overview
WhatsApp Multi-Session Gateway - Fullstack TypeScript application with Node.js/Hono.js backend, React frontend, and MySQL database. Manages multiple WhatsApp sessions with comprehensive authentication, role-based access control, and message queuing.

## Architecture & Key Components

### Backend (Node.js + Hono.js + TypeScript)
- **Framework**: Hono.js for high-performance REST API
- **Database**: MySQL with Drizzle ORM (`backend/src/db/`)
- **Auth**: Dual authentication - JWT tokens + API keys
- **WhatsApp**: wa-multi-session library for multi-account management
- **Queue**: Message queue with rate limiting and anti-spam

### Frontend (React + TypeScript + Vite)
- **Framework**: React 19 with TypeScript
- **UI**: Shadcn/UI + Tailwind CSS
- **State**: AuthContext for authentication, services for API calls
- **Build**: Vite for fast development and production builds

### Database Schema
- `users` - User accounts with roles (admin/user/readonly)
- `whatsapp_accounts` - WhatsApp sessions with phone detection
- `message_queue` - Persistent message queuing with retry logic
- `rate_limits` - Anti-spam rate limiting counters

## Critical Development Patterns



### Authentication Flow
```typescript
// Backend: Dual auth system
Authorization: Bearer <jwt_token>  // User management
x-api-key: <api_key>              // WhatsApp operations

// Frontend: Automatic token injection
// Services use axios interceptors for auth headers
```

### Session Management
- **Phone numbers as session IDs** - Natural unique identifiers
- **One phone = One session** - Strict deduplication
- **QR code generation** - Real-time connection status
- **Admin bypass removed** - All users need WhatsApp connection

### API Service Layer Pattern
```typescript
// Frontend services follow consistent pattern:
// /frontend/src/services/{module}.service.ts
export const {module}Service = {
  method: async (data: RequestType): Promise<ResponseType> => {
    const response = await api.post('/endpoint', data);
    return response.data;
  }
};
```

## Development Workflows

### Terminal Management (CRITICAL)
⚠️ **FATAL ERROR PREVENTION**: Never interrupt background processes for testing
- **Background processes**: Use `isBackground=true` for servers - KEEP ALIVE
- **Testing/checking**: Use `isBackground=false` in SEPARATE terminals only
- **Never mix**: Background services and testing in same terminal
- **RULE**: If server running in terminal ID X, NEVER use terminal ID X for testing

⚠️ **SYSTEM BUG**: `run_in_terminal` with `isBackground=false` sometimes uses same terminal as background process. This is a SYSTEM LIMITATION, not user error.

**WORKAROUND**: 
- Start servers with `isBackground=true` 
- Use `get_terminal_output` to check server status
- **DO NOT RUN TESTS** if server is in background - document functionality instead

### Monorepo Commands
```bash
# Development
npm run dev                    # Start both backend + frontend
npm run dev:backend           # Backend only (port 5001)
npm run dev:frontend          # Frontend only (port 5173)

# Database
npm run db:migrate            # Run Drizzle migrations
npm run db:studio            # Open Drizzle Studio
cd backend && bun src/db/seed.ts  # Seed database

# Production
npm run build                # Build both projects
docker-compose up -d         # Full stack with Docker
```

### Project Structure Navigation
```
backend/src/
├── controllers/     # Hono.js route handlers
├── db/services/     # Database operations (Drizzle ORM)
├── middlewares/     # JWT, API key, validation
├── services/        # Business logic (queue, session mgmt)
└── utils/          # JWT, logging, validation

frontend/src/
├── components/      # React components (UI + layout)
├── services/        # API client layer (axios-based)
├── contexts/        # AuthContext for global state
└── pages/          # Route components
```

## Key Integration Points

### WhatsApp Session Flow
1. User creates session with phone number
2. Backend generates QR code via wa-multi-session
3. Frontend displays QR for WhatsApp Web pairing
4. Session becomes active, message queue resumes
5. Phone number auto-detected and stored

### Message Queue System
- **Rate limiting**: 20/min, 500/hour per session
- **Retry logic**: 3 attempts with exponential backoff
- **Anti-spam**: Per-recipient limits (10/hour)
- **Queue persistence**: MySQL storage for reliability

### Role-Based Access Control
```typescript
// Middleware usage pattern:
app.get('/admin/*', 
  createJwtMiddleware(),           // Verify JWT
  createRoleMiddleware(['admin']), // Check role
  handler
);
```

## Common Pitfalls & Solutions

### Database Operations
- **Always use transactions** for multi-table operations
- **Use Drizzle's `eq()` helper** for WHERE clauses
- **Handle unique constraint violations** gracefully

### Frontend API Calls
- **Use centralized services** - Import from `@/services`
- **Handle 401/403 properly** - AuthContext auto-logout
- **Type all API responses** - Consistent error handling

### Session Management
- **Phone validation required** - Use WhatsApp format detection
- **Session deduplication** - Check existing before create
- **QR expiration handling** - 2-minute timeout with refresh

## Environment Configuration

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=wahub_user
DB_PASSWORD=password
DB_NAME=wahub

# Security
JWT_SECRET=64-char-secret
JWT_EXPIRES_IN=7d

# Rate Limiting
MAX_MESSAGES_PER_MINUTE=20
MAX_MESSAGES_PER_HOUR=500
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
```

## Testing & Debugging

### API Testing Pattern
```bash
# Always use separate terminal for testing
TOKEN=$(curl -s POST /auth/login -d '{"email":"user@example.com","password":"pass"}' | jq -r '.data.token')
curl -H "Authorization: Bearer $TOKEN" /api/endpoint
```

### Common Debug Commands
```bash
# Check backend health
curl http://localhost:5001/health

# View database
cd backend && bun run db:studio

# Check session status  
curl -H "x-api-key: key" http://localhost:5001/session/list
```

When implementing features, prioritize type safety, proper error handling, and follow the established service patterns. Always test authentication flows and ensure proper terminal separation for development workflows.