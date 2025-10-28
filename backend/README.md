# WhatsApp Gateway - Backend API

REST API backend untuk WhatsApp Multi-Session Gateway menggunakan Node.js, TypeScript, dan Hono.js.

## 🎯 Features

- ✅ **Multi-Session Management** - Kelola multiple WhatsApp accounts
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **MySQL Database** - Production-ready dengan Drizzle ORM
- ✅ **Message Queue** - Anti-spam rate limiting
- ✅ **Session Deduplication** - Prevent duplicate sessions
- ✅ **Auto Phone Detection** - Deteksi otomatis nomor WhatsApp
- ✅ **Role-Based Access** - Admin, User, ReadOnly roles
- ✅ **API Key Management** - Per-user API keys
- ✅ **Winston Logging** - Structured logging

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Hono.js
- **Database**: MySQL + Drizzle ORM
- **Authentication**: JWT + bcrypt
- **Logging**: Winston
- **Validation**: Zod
- **WhatsApp**: wa-multi-session

## 📦 Installation

### Prerequisites

- Node.js 18+ or Bun
- MySQL 8.0+

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env dengan MySQL credentials dan secrets
nano .env

# Run database migrations
npm run db:migrate

# Seed database (optional, untuk development)
npm run db:seed
```

## ⚙️ Configuration

Edit file `.env`:

```env
# Server
NODE_ENV=DEVELOPMENT
PORT=5001
KEY=your-api-key

# MySQL Database
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=wahub_user
DB_PASSWORD=your_password
DB_NAME=wahub

# JWT & Security
JWT_SECRET=your-jwt-secret-64-chars
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-encryption-key-64-chars

# Rate Limiting
MESSAGE_DELAY_MIN=3000
MESSAGE_DELAY_MAX=7000
MAX_MESSAGES_PER_MINUTE=20
MAX_MESSAGES_PER_HOUR=500
MAX_MESSAGES_PER_RECIPIENT=10
MAX_RETRY_ATTEMPTS=3

# Webhook (optional)
WEBHOOK_BASE_URL=https://your-webhook-url.com
```

## 🏃 Running

### Development

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5001`

### Production

```bash
# Build
npm run build

# Start
npm run start

# Or with PM2
pm2 start ecosystem.config.js
```

## 🔌 API Endpoints

### Authentication

#### POST /auth/register
Register user baru
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### POST /auth/login
Login dan dapatkan JWT token
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "apiKey": "..."
  }
}
```

#### GET /auth/me
Get user profile (requires token)

Headers: `Authorization: ******`

### Session Management

#### POST /session/create
Create WhatsApp session
```json
{
  "sessionId": "my-session",
  "phoneNumber": "+6281234567890"  // optional
}
```

#### GET /session/list
List all sessions

Headers: `x-api-key: your-api-key`

Response:
```json
{
  "data": [
    {
      "sessionId": "session1",
      "phoneNumber": "+6281234567890",
      "status": "connected",
      "userId": 1,
      "createdAt": "2025-10-27T10:00:00.000Z",
      "updatedAt": "2025-10-27T10:05:00.000Z"
    }
  ]
}
```

#### GET /session/status?session=mysession
Get session status

#### GET /session/qr/:sessionId
Get QR code (JSON)

#### GET /session/qr-image/:sessionId
Get QR code (PNG image)

#### POST /session/logout
Logout session
```json
{
  "sessionId": "my-session"
}
```

#### POST /session/check-phone
Check if phone has active session
```json
{
  "phoneNumber": "+6281234567890"
}
```

Response:
```json
{
  "hasActiveSession": false
}
```

#### POST /session/cleanup
Cleanup inactive sessions
```json
{
  "hours": 24
}
```

### Messages

#### POST /message/send-text
Send text message
```json
{
  "session": "my-session",
  "to": "+6281234567890",
  "text": "Hello from API!"
}
```

#### POST /message/send-image
Send image with caption
```json
{
  "session": "my-session",
  "to": "+6281234567890",
  "image": "https://example.com/image.jpg",
  "caption": "Check this out!"
}
```

#### POST /message/send-document
Send document
```json
{
  "session": "my-session",
  "to": "+6281234567890",
  "document": "https://example.com/file.pdf",
  "filename": "document.pdf"
}
```

#### GET /message/queue-status?session=mysession
Get queue status

Response:
```json
{
  "session": "my-session",
  "pending": 5,
  "processing": 1,
  "completed": 100,
  "failed": 2,
  "isProcessing": true
}
```

#### POST /message/clear-queue
Clear message queue
```json
{
  "session": "my-session"
}
```

### User Management (Admin only)

#### GET /user/list
List all users

#### POST /user/create
Create new user

#### PUT /user/:id
Update user

#### DELETE /user/:id
Delete user

## 📊 Database Schema

Database menggunakan MySQL dengan Drizzle ORM.

### Tables

- `users` - User accounts
- `whatsapp_accounts` - WhatsApp sessions
- `messages` - Message history
- `message_queue` - Message queue
- `rate_limits` - Rate limiting counters

> **Dokumentasi lengkap**: [drizzle/README.md](drizzle/README.md)

### Migrations

```bash
# Generate migration
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema (development)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

## 🔒 Security

### Authentication

Backend menggunakan dual authentication:

1. **JWT Token** - Untuk user authentication
   - Login → Receive JWT token
   - Include token dalam header: `Authorization: ******`

2. **API Key** - Untuk API access
   - Setiap user memiliki unique API key
   - Include dalam header: `x-api-key: your-api-key`

### Password Security

- Passwords di-hash dengan bcrypt (10 rounds)
- JWT secrets harus 64+ characters
- Encryption key untuk sensitive data

### Rate Limiting

- Per-minute limits: 20 messages (configurable)
- Per-hour limits: 500 messages (configurable)
- Per-recipient limits: 10 messages/hour
- Automatic queue pause on limits

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── auth.ts       # Authentication
│   │   ├── session.ts    # Session management
│   │   ├── message.ts    # Message operations
│   │   └── user.ts       # User management
│   ├── services/         # Business logic
│   │   ├── session-management.service.ts
│   │   ├── whatsapp-account.service.ts
│   │   └── message-queue.service.ts
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── db/              # Database setup
│   │   ├── schema.ts    # Drizzle schema
│   │   └── index.ts     # Database connection
│   ├── utils/           # Utilities
│   │   ├── phone.service.ts
│   │   └── logger.ts
│   └── index.ts         # Entry point
├── drizzle/             # Database migrations
├── scripts/             # Utility scripts
├── dist/                # Compiled output
├── .env.example         # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check MySQL service
systemctl status mysql

# Test connection
mysql -u wahub_user -p wahub
```

### Session Not Creating

```bash
# Check logs
tail -f logs/app.log

# Verify WhatsApp library
npm install --force
```

### QR Code Not Showing

- Pastikan session belum connected
- Restart session jika perlu
- Check session status via `/session/status`

### Rate Limit Issues

- Adjust limits di `.env`
- Check queue status
- Clear queue jika perlu

## 📝 Development

### Code Style

```bash
# Lint
npm run lint

# Format
npm run format:fix

# Type check
npm run type-check
```

### Adding New Endpoints

1. Create controller di `src/controllers/`
2. Add route di `src/index.ts`
3. Add types/interfaces
4. Update API documentation

### Database Changes

1. Modify schema di `src/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Review migration files
4. Run migration: `npm run db:migrate`

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests and lints
5. Submit pull request
