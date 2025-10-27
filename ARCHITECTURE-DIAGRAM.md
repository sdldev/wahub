# Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Unified Server (Port 5001)                         │
│                apps/server/index.ts                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             Request Router                           │   │
│  │                                                       │   │
│  │  Is path starting with /api/* ?                     │   │
│  │         │                    │                       │   │
│  │        YES                  NO                       │   │
│  │         │                    │                       │   │
│  │         ▼                    ▼                       │   │
│  │  ┌─────────────┐    ┌──────────────────┐           │   │
│  │  │   API       │    │  Static / SPA    │           │   │
│  │  │  Routes     │    │   Fallback       │           │   │
│  │  └─────────────┘    └──────────────────┘           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │   API Layer          │  │  Static Files        │        │
│  │   apps/api/          │  │  apps/web/dist/      │        │
│  │                      │  │                      │        │
│  │  • Controllers       │  │  • index.html        │        │
│  │  • Services          │  │  • assets/*.js       │        │
│  │  • Middlewares       │  │  • assets/*.css      │        │
│  │  • Database          │  │  • images            │        │
│  └──────────────────────┘  └──────────────────────┘        │
│           │                           │                      │
│           ▼                           │                      │
│  ┌──────────────────────┐            │                      │
│  │   MySQL Database     │            │                      │
│  │   • Sessions         │            │                      │
│  │   • Messages         │            │                      │
│  │   • Users            │            │                      │
│  └──────────────────────┘            │                      │
│           │                           │                      │
│           ▼                           │                      │
│  ┌──────────────────────┐            │                      │
│  │  WhatsApp Gateway    │            │                      │
│  │  wa-multi-session    │            │                      │
│  └──────────────────────┘            │                      │
└───────────────────────────────────────┴──────────────────────┘
```

## Request Flow

### API Request Flow

```
Client Request: GET /api/health
         │
         ▼
┌─────────────────────┐
│  Unified Server     │
│  (apps/server)      │
└──────────┬──────────┘
           │
           ▼
    Path = /api/health
    Matches /api/* ?
           │
          YES
           │
           ▼
┌─────────────────────┐
│  API Router         │
│  (apps/api)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Health Controller  │
│  Returns JSON       │
└──────────┬──────────┘
           │
           ▼
    Response:
    { "status": "ok",
      "timestamp": "...",
      "uptime": 123 }
```

### Frontend Request Flow

```
Client Request: GET /dashboard
         │
         ▼
┌─────────────────────┐
│  Unified Server     │
│  (apps/server)      │
└──────────┬──────────┘
           │
           ▼
    Path = /dashboard
    Matches /api/* ?
           │
           NO
           │
           ▼
┌─────────────────────┐
│  Static Handler     │
│  Check for file     │
└──────────┬──────────┘
           │
   File exists? NO
           │
           ▼
┌─────────────────────┐
│  SPA Fallback       │
│  Serve index.html   │
└──────────┬──────────┘
           │
           ▼
    Response:
    index.html
    (React app loads
     and handles routing
     client-side)
```

### Static Asset Flow

```
Client Request: GET /assets/index-abc123.js
         │
         ▼
┌─────────────────────┐
│  Unified Server     │
│  (apps/server)      │
└──────────┬──────────┘
           │
           ▼
    Path = /assets/...
    Matches /api/* ?
           │
           NO
           │
           ▼
┌─────────────────────┐
│  Static Handler     │
│  Check for file     │
└──────────┬──────────┘
           │
   File exists? YES
           │
           ▼
┌─────────────────────┐
│  Serve Static File  │
│  + Cache Headers    │
└──────────┬──────────┘
           │
           ▼
    Response:
    File content
    Cache-Control:
    max-age=31536000
```

## Development vs Production

### Development Architecture

```
┌──────────────────┐         ┌──────────────────┐
│  Frontend Dev    │         │  Backend Dev     │
│  Vite Server     │         │  tsx --watch     │
│  Port 3000       │────────▶│  Port 5001       │
│                  │  Proxy  │                  │
│  /api/* → 5001   │  /api/* │  API Routes      │
└──────────────────┘         └──────────────────┘
         │                            │
         │                            │
         ▼                            ▼
    Hot Module                   Auto Reload
    Replacement                  on Changes
```

**Development Flow:**
1. Frontend runs on port 3000 with HMR
2. Backend runs on port 5001 with auto-reload
3. Vite proxies `/api/*` requests to 5001
4. No CORS issues (same origin from browser perspective)
5. Fast iteration (hot reload both sides)

### Production Architecture

```
┌────────────────────────────────────────┐
│       Unified Server (Port 5001)       │
│                                        │
│  ┌──────────────┐  ┌────────────────┐│
│  │   API        │  │  Static Files  ││
│  │   /api/*     │  │  /*, /assets/* ││
│  └──────────────┘  └────────────────┘│
└────────────────────────────────────────┘
              │
              ▼
         Single Process
         Single Port
         Single Deployment
```

**Production Flow:**
1. Frontend built to static files (`apps/web/dist/`)
2. Server serves both API and static files
3. Single process, single port
4. Simplified deployment

## Routing Table

| Request Path | Handler | Response Type | Cache |
|-------------|---------|---------------|-------|
| `/` | SPA Fallback | HTML | No-cache |
| `/dashboard` | SPA Fallback | HTML | No-cache |
| `/any-route` | SPA Fallback | HTML | No-cache |
| `/api/health` | API Controller | JSON | No-cache |
| `/api/session` | API Controller | JSON | No-cache |
| `/api/message` | API Controller | JSON | No-cache |
| `/assets/*.js` | Static File | JavaScript | 1 year |
| `/assets/*.css` | Static File | CSS | 1 year |
| `/vite.svg` | Static File | Image | 1 year |

## Security Layers

```
┌─────────────────────────────────────────┐
│            Client Request                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         CORS Middleware                  │
│  • Check origin                          │
│  • Validate headers                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Security Headers Middleware         │
│  • Content-Security-Policy               │
│  • X-Frame-Options: DENY                 │
│  • X-Content-Type-Options: nosniff       │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Request Router                     │
│  • /api/* → API Auth Middleware          │
│  • Other → Public Access                 │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
┌─────────────┐  ┌──────────────┐
│ API Auth    │  │  Static      │
│ • API Key   │  │  No Auth     │
│ • JWT Token │  │              │
└─────────────┘  └──────────────┘
```

## Data Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│ Browser  │─────▶│  Server  │─────▶│ Database │
│          │◀─────│          │◀─────│          │
└──────────┘      └──────────┘      └──────────┘
     │                  │                  │
     │                  │                  │
     ▼                  ▼                  ▼
  React App         Hono.js           MySQL
  • State           • Routes          • Sessions
  • API calls       • Business         • Messages
  • UI              • Logic            • Users
```

## Monorepo Structure

```
wahub/
│
├── apps/
│   ├── api/                    # Backend API
│   │   ├── controllers/        # API route handlers
│   │   ├── services/           # Business logic
│   │   ├── middlewares/        # Auth, validation
│   │   ├── db/                 # Database layer
│   │   └── utils/              # Helpers
│   │
│   ├── web/                    # Frontend SPA
│   │   ├── src/                # React source
│   │   │   ├── App.tsx         # Main component
│   │   │   └── main.tsx        # Entry point
│   │   ├── dist/               # Build output
│   │   └── vite.config.ts      # Build config
│   │
│   └── server/                 # Unified server
│       └── index.ts            # Entry point
│
├── scripts/                    # Build scripts
├── drizzle/                    # DB migrations
│
└── Documentation
    ├── MONOREPO-ARCHITECTURE.md
    ├── BUN-ALTERNATIVE.md
    ├── QA-CHECKLIST.md
    ├── PR-SUMMARY.md
    └── EXAMPLE-COMMANDS.md
```

## Build Process

```
Development:
┌──────────┐     ┌──────────┐
│  Edit    │────▶│  Watch   │
│  Code    │     │  & HMR   │
└──────────┘     └──────────┘
                      │
                      ▼
              ┌──────────────┐
              │  Dev Server  │
              │  (2 ports)   │
              └──────────────┘

Production:
┌──────────┐     ┌──────────┐
│  Build   │────▶│  Bundle  │
│  Frontend│     │  Optimize│
└──────────┘     └──────────┘
     │                │
     ▼                ▼
┌──────────┐     ┌──────────┐
│  dist/   │────▶│  Deploy  │
│  Static  │     │  Unified │
└──────────┘     └──────────┘
```

## Deployment Options

### Option 1: Single Container (Recommended)

```
┌─────────────────────────────────┐
│      Docker Container           │
│                                 │
│  ┌───────────────────────────┐ │
│  │   Node.js / tsx           │ │
│  │                           │ │
│  │   apps/server/index.ts    │ │
│  │   ├─ API (apps/api)       │ │
│  │   └─ Static (apps/web)    │ │
│  └───────────────────────────┘ │
│                                 │
│  Port: 5001                     │
└─────────────────────────────────┘
```

### Option 2: Two Containers + Nginx

```
┌──────────────────┐
│  Nginx Proxy     │
│  Port 80/443     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Frontend│ │Backend │
│:3000   │ │:5001   │
└────────┘ └────────┘
```

## Technology Stack

```
Frontend:
├── React 18
├── TypeScript
├── Vite 7
└── CSS

Backend:
├── Node.js 18+
├── TypeScript
├── Hono.js
├── tsx
└── Drizzle ORM

Database:
└── MySQL 8.0+

Runtime Options:
├── Node.js (Stable)
└── Bun (Fast)
```

## Summary

This architecture provides:

✅ **Unified Deployment** - Single server, single port
✅ **Clear Routing** - `/api/*` for API, everything else for SPA
✅ **Security** - Multiple security headers and CORS
✅ **Performance** - Cache optimization, efficient routing
✅ **Development** - Hot reload for both frontend and backend
✅ **Production** - Static file serving with cache headers
✅ **Scalability** - Can migrate to microservices if needed
✅ **Flexibility** - Supports both Node.js and Bun runtimes
