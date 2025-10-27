# WhatsApp Gateway - Monorepo Architecture

## 📋 Overview

This document explains the Laravel-like routing pattern implementation for the WhatsApp Gateway project. The frontend and backend remain in one codebase and are served by a single server entrypoint.

## 🏗️ Repository Structure

```
wahub/
├── apps/
│   ├── api/              # Backend API code (TypeScript)
│   │   ├── controllers/  # API route controllers
│   │   ├── services/     # Business logic services
│   │   ├── db/           # Database schemas and services
│   │   ├── middlewares/  # API middlewares
│   │   ├── utils/        # Utility functions
│   │   └── webhooks/     # Webhook handlers
│   │
│   ├── web/              # React + Vite frontend
│   │   ├── src/          # Frontend source code
│   │   ├── public/       # Static assets
│   │   └── dist/         # Build output (generated)
│   │
│   └── server/           # Unified server entrypoint
│       └── index.ts      # Main server file
│
├── scripts/              # Build and utility scripts
├── drizzle/              # Database migrations
├── .env.example          # Environment variables template
└── package.json          # Root package configuration
```

## 🚀 Key Features

### Laravel-like Routing Pattern

- **API Routes**: All API endpoints are under `/api/*`
- **Frontend Routes**: All non-API routes serve the SPA frontend
- **History Fallback**: Direct navigation to any route (e.g., `/dashboard`) serves the SPA
- **Single Server**: One server process serves both API and frontend

### Architecture Benefits

✅ **Monorepo**: Frontend and backend in the same codebase  
✅ **Single Deployment**: Deploy as one application  
✅ **Shared Types**: Share TypeScript types between frontend and backend  
✅ **Unified Build**: Single build process for the entire application  
✅ **No CORS Issues**: Frontend and backend on the same origin  
✅ **Development Proxy**: Vite dev server proxies `/api/*` to backend  

## 📦 Installation

### Prerequisites

- Node.js 18+ or Bun 1.0+
- MySQL 8.0+
- npm or yarn or pnpm

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/sdldev/wahub.git
cd wahub

# 2. Install dependencies
npm install

# 3. Install frontend dependencies
cd apps/web
npm install
cd ../..

# 4. Setup MySQL database
mysql -u root -p
CREATE DATABASE wahub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wahub_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON wahub.* TO 'wahub_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 5. Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# 6. Run migrations
npm run db:migrate

# 7. Seed database (development only)
npm run db:seed
```

## 🛠️ Development

### Running in Development Mode

```bash
# Start both frontend and backend in dev mode
npm run dev

# Or run separately:
npm run dev:web    # Frontend only (port 3000)
npm run dev:api    # Backend only (port 5001)
```

**Development URLs:**
- Frontend: http://localhost:3000
- API (proxied): http://localhost:3000/api/health
- Backend direct: http://localhost:5001/api/health

### How Development Mode Works

1. **Frontend (Vite)**: Runs on port 3000 with hot module replacement
2. **Backend (tsx)**: Runs on port 5001 with auto-reload on changes
3. **Proxy**: Vite proxies all `/api/*` requests to port 5001
4. **No CORS**: Everything appears to come from port 3000

## 🏭 Production Build

### Build for Production

```bash
# Build everything
npm run build

# Or build separately:
npm run build:web   # Build frontend (React + Vite)
npm run build:api   # Prepare API (using tsx, no build needed)
```

### Start Production Server

```bash
# Start unified server
npm start

# Or with production environment
npm run start:prod
```

**Production Setup:**
- Server runs on port 5001 (configurable via `PORT` env var)
- Serves frontend static files from `apps/web/dist`
- All `/api/*` routes handled by backend
- All other routes serve `index.html` (SPA fallback)

## 🔀 Routing Details

### API Routes (`/api/*`)

All API routes are prefixed with `/api/`:

```
GET  /api/health              # Health check endpoint
POST /api/auth/login          # Authentication
POST /api/auth/register       # User registration
GET  /api/session             # List WhatsApp sessions
POST /api/session/create      # Create session
GET  /api/session/qr/:id      # Get QR code
POST /api/message/send-text   # Send message
... and more
```

### Frontend Routes (Everything Else)

All non-API routes serve the SPA:

```
/                    → index.html (SPA)
/dashboard           → index.html (SPA)
/sessions            → index.html (SPA)
/any-route           → index.html (SPA)
```

### Static Assets

Static assets are served with long-term caching:

```
/assets/*            → Served from apps/web/dist/assets/
Cache-Control: public, max-age=31536000, immutable
```

## 🔒 Security Headers

The server automatically adds security headers:

- **Content-Security-Policy**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking (DENY)
- **X-Content-Type-Options**: Prevents MIME sniffing (nosniff)
- **X-XSS-Protection**: Enables XSS filtering
- **Referrer-Policy**: Controls referrer information

## 🧪 Testing

### Manual Testing Checklist

```bash
# 1. Install and build
npm install
npm run build

# 2. Start server
npm start

# 3. Test API endpoint
curl http://localhost:5001/api/health
# Should return: {"status":"ok", ...}

# 4. Test frontend
open http://localhost:5001
# Should show WhatsApp Gateway Dashboard

# 5. Test SPA routing
open http://localhost:5001/dashboard
# Should show SPA (not 404)

# 6. Test from frontend
# Open browser console on http://localhost:5001
# Run: fetch('/api/health').then(r => r.json()).then(console.log)
# Should return health data without CORS errors
```

### Automated Tests

```bash
# Run tests (to be implemented)
npm test
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Single Container Approach

The application runs as a single container serving both API and frontend:

**Pros:**
- Simpler deployment
- No reverse proxy needed
- Fewer moving parts
- Easier local development

**Cons:**
- Can't scale frontend and backend independently
- Single point of failure

### Alternative: Two Containers + Nginx

You can also deploy with separate containers:

```
┌─────────────────┐
│  Nginx Proxy    │
│  Port 80/443    │
└────────┬────────┘
         │
    ┌────┴──────┐
    │           │
┌───▼────┐  ┌──▼──────┐
│Frontend│  │ Backend │
│ :3000  │  │  :5001  │
└────────┘  └─────────┘
```

**Pros:**
- Independent scaling
- Can use CDN for frontend
- Backend can restart without affecting frontend

**Cons:**
- More complex setup
- Need reverse proxy configuration
- CORS configuration required

## 🔄 Migration from Separated Architecture

If you have a separated frontend/backend architecture (like PR #11 concept):

### Step 1: Move Frontend Code

```bash
# Move your existing frontend to apps/web
mv your-frontend/* apps/web/
```

### Step 2: Update API Imports

Change all API base URLs in frontend:

```typescript
// Before
const API_BASE = 'http://localhost:5001';
fetch(`${API_BASE}/session/list`);

// After (same origin)
fetch('/api/session/list');
```

### Step 3: Update Vite Config

Ensure `apps/web/vite.config.ts` has proxy:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
```

### Step 4: Update Deployment

Replace separate deployments with unified deployment:

```bash
# Build everything
npm run build

# Deploy single artifact
npm start
```

## 🐝 Bun Alternative (Experimental)

### Using Bun as Runtime

Bun can be used as a drop-in replacement for Node.js:

```bash
# Install with Bun
bun install

# Dev mode
bun run dev

# Production
bun run start
```

### Trade-offs: Bun vs Node.js

**Bun Advantages:**
- ⚡ Faster startup time
- 🚀 Better performance for I/O operations
- 📦 Built-in bundler and test runner
- 💾 Lower memory usage

**Bun Disadvantages:**
- ⚠️ Less mature ecosystem
- 🔧 Some native modules may not work
- 📚 Less documentation and community support
- 🐛 Potential compatibility issues

### Dependency Compatibility

Most dependencies work fine with Bun:

✅ **Compatible:**
- Hono.js ✓
- Drizzle ORM ✓
- MySQL2 ✓
- Winston ✓
- Zod ✓

⚠️ **Needs Testing:**
- Sharp (image processing) - may need native build
- wa-multi-session - WebSocket implementation

### Testing with Bun

```bash
# Test critical dependencies
bun install
bun run build
bun run start

# If any errors, use Node.js instead:
npm install
npm run build
npm start
```

## 📊 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build frontend
        run: npm run build:web
      
      - name: Run tests
        run: npm test
      
      - name: Build Docker image
        run: docker build -t wahub:latest .
      
      - name: Deploy
        run: # Your deployment script
```

### Required CI/CD Changes

**From Separated Architecture:**
- Remove separate frontend/backend pipelines
- Use single build pipeline
- Deploy single Docker image
- Update health check URLs

**New Pipeline:**
1. Install dependencies
2. Build frontend (`npm run build:web`)
3. Run tests
4. Build Docker image (includes frontend dist)
5. Deploy unified application

## 🤔 Why This Architecture?

### Rationale for Laravel-like Pattern

**Problem with Separation:**
- PR #11 separated frontend and backend
- Required separate deployments
- CORS configuration needed
- More complex infrastructure
- Harder local development

**Benefits of Monorepo:**
- ✅ Single deployment artifact
- ✅ Shared types and utilities
- ✅ No CORS issues
- ✅ Simpler development workflow
- ✅ Easier testing and debugging
- ✅ Lower infrastructure costs

### When to Separate?

Consider separation if you need:
- Independent scaling (e.g., frontend on CDN)
- Different release cycles
- Specialized hosting (Vercel for frontend, AWS for backend)
- Team independence (separate frontend/backend teams)

**Solution for Separation:** Use reverse proxy or API gateway to maintain `/api/*` routing pattern while hosting separately.

## 📝 Environment Variables

Key environment variables for the unified server:

```bash
# Server Configuration
NODE_ENV=DEVELOPMENT          # DEVELOPMENT | PRODUCTION
PORT=5001                     # Server port

# Database (MySQL)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=wahub_user
DB_PASSWORD=your_password
DB_NAME=wahub

# Security
JWT_SECRET=your-jwt-secret-64-chars
ENCRYPTION_KEY=your-encryption-key-64-chars
KEY=your-api-key

# Optional
WEBHOOK_BASE_URL=https://your-webhook-url.com
```

## 🔍 Troubleshooting

### Frontend not loading

```bash
# Build the frontend first
npm run build:web

# Check if dist exists
ls -la apps/web/dist/

# Restart server
npm start
```

### API returns 404

```bash
# Ensure API routes start with /api/
# Check server logs for errors
# Verify MySQL is running and configured
```

### CORS errors in development

```bash
# Check Vite proxy configuration in apps/web/vite.config.ts
# Ensure proxy target is correct (http://localhost:5001)
# Restart dev servers
```

### Build fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/web/node_modules
npm install
cd apps/web && npm install && cd ../..

# Try building again
npm run build
```

## 📚 Additional Resources

- [Hono.js Documentation](https://hono.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [React Documentation](https://react.dev/)

## 🤝 Contributing

When contributing to this project:

1. Keep frontend and backend in the monorepo
2. All API routes must be prefixed with `/api/`
3. Update both frontend and backend together
4. Test both development and production builds
5. Update this documentation if changing architecture

## 📄 License

ISC License - see LICENSE file for details
