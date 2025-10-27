# QA Checklist - Laravel-like Routing Implementation

## ✅ Pre-Review Checklist

Before reviewing this PR, ensure you have:

- [ ] MySQL 8.0+ installed and running
- [ ] Node.js 18+ or Bun 1.0+ installed
- [ ] Git repository cloned
- [ ] `.env` file configured with valid MySQL credentials

## 🧪 Functional Testing

### 1. Installation & Setup

```bash
# Clone and install
git checkout copilot/modify-routing-for-laravel-pattern
npm install
cd apps/web && npm install && cd ../..
```

- [ ] Dependencies install without errors
- [ ] Frontend dependencies install successfully
- [ ] No critical security vulnerabilities

### 2. Build Process

```bash
# Build frontend
npm run build:web
```

- [ ] Frontend builds successfully
- [ ] `apps/web/dist/` directory is created
- [ ] `apps/web/dist/index.html` exists
- [ ] `apps/web/dist/assets/` contains JS and CSS files

**Expected output:**
```
dist/index.html                   X.XX kB
dist/assets/index-[hash].css     X.XX kB
dist/assets/index-[hash].js      XXX.XX kB
✓ built in XXXms
```

### 3. Production Server

```bash
# Configure .env first
cp .env.example .env
# Edit .env with your MySQL credentials

# Run migrations
npm run db:migrate

# Start production server
npm start
```

- [ ] Server starts without errors
- [ ] Displays startup messages with URLs
- [ ] No database connection errors

**Expected console output:**
```
🚀 Server is running on http://localhost:5001
📡 API available at http://localhost:5001/api
🌐 Frontend available at http://localhost:5001
```

### 4. API Endpoint Tests

#### Test 1: Health Check Endpoint

```bash
curl http://localhost:5001/api/health
```

- [ ] Returns HTTP 200 status
- [ ] Returns JSON response
- [ ] Response contains `status: "ok"`
- [ ] Response contains `timestamp`
- [ ] Response contains `uptime`
- [ ] Response contains `memory` object
- [ ] Response contains `version`

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T...",
  "uptime": 123.456,
  "memory": {
    "rss": 12345678,
    "heapTotal": 12345678,
    "heapUsed": 12345678,
    "external": 12345678,
    "arrayBuffers": 12345678
  },
  "version": "v20.x.x"
}
```

#### Test 2: API Route Structure

```bash
# Test that API routes are prefixed correctly
curl http://localhost:5001/api/session  # Should work (requires API key)
curl http://localhost:5001/session      # Should return HTML (SPA)
```

- [ ] `/api/*` routes return JSON responses
- [ ] Non-`/api/*` routes return HTML

### 5. Frontend Tests

#### Test 1: Root Route

Open browser: `http://localhost:5001/`

- [ ] Page loads successfully
- [ ] Shows "WhatsApp Gateway Dashboard" heading
- [ ] Shows "API Health Check" card
- [ ] Health check button works
- [ ] Health data displays after clicking "Refresh Health"
- [ ] No JavaScript errors in console
- [ ] No 404 errors for assets in network tab

#### Test 2: Direct Route Navigation

Open browser: `http://localhost:5001/dashboard`

- [ ] Page loads (no 404 error)
- [ ] SPA is served correctly
- [ ] Same content as root route

#### Test 3: API Call from Frontend

In browser console at `http://localhost:5001/`:

```javascript
fetch('/api/health').then(r => r.json()).then(console.log)
```

- [ ] Request succeeds without CORS errors
- [ ] Returns health data object
- [ ] No network errors

#### Test 4: Page Reload Test

1. Navigate to `http://localhost:5001/`
2. Reload page (F5 or Cmd+R)

- [ ] Page reloads successfully
- [ ] No 404 errors
- [ ] Application state restored

### 6. Development Mode Tests

```bash
# Stop production server first (Ctrl+C)

# Start development mode
npm run dev
```

- [ ] Both frontend and backend start
- [ ] Frontend runs on port 3000
- [ ] Backend runs on port 5001
- [ ] No startup errors

#### Test 1: Frontend Dev Server

Open browser: `http://localhost:3000/`

- [ ] Page loads successfully
- [ ] Hot module replacement works (make a change, see update)
- [ ] Health check button works
- [ ] API calls succeed (proxied to backend)

#### Test 2: API Proxy

In browser console at `http://localhost:3000/`:

```javascript
fetch('/api/health').then(r => r.json()).then(console.log)
```

- [ ] Request succeeds
- [ ] No CORS errors
- [ ] Returns health data from backend (port 5001)

#### Test 3: Backend Hot Reload

1. Edit `apps/api/controllers/session.ts`
2. Add a comment or log statement
3. Save file

- [ ] Backend automatically restarts
- [ ] No need to manually restart server

### 7. Security Headers Tests

```bash
curl -I http://localhost:5001/
```

Check response headers:

- [ ] `Content-Security-Policy` is present
- [ ] `X-Frame-Options: DENY` is present
- [ ] `X-Content-Type-Options: nosniff` is present
- [ ] `X-XSS-Protection: 1; mode=block` is present
- [ ] `Referrer-Policy` is present

### 8. Static Asset Caching

```bash
curl -I http://localhost:5001/assets/index-[hash].js
```

- [ ] `Cache-Control` header is present
- [ ] Contains `max-age=31536000` (1 year)
- [ ] Contains `immutable`

### 9. CORS Configuration

Test CORS in browser console:

```javascript
fetch('http://localhost:5001/api/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
```

- [ ] Request succeeds
- [ ] No CORS errors
- [ ] Can make cross-origin requests in development

## 📝 Code Quality Checks

### Linting

```bash
npm run lint:check
```

- [ ] No critical linting errors
- [ ] Warnings are acceptable or documented

### Formatting

```bash
npm run format:check
```

- [ ] Code follows formatting standards
- [ ] No formatting errors

### Type Checking

```bash
npm run type-check
```

- [ ] TypeScript compiles without errors
- [ ] No type errors

## 📋 File Structure Verification

### Check Repository Structure

```bash
ls -la apps/
```

- [ ] `apps/api/` directory exists with backend code
- [ ] `apps/web/` directory exists with frontend code
- [ ] `apps/server/` directory exists with unified server

### Check Build Outputs

```bash
ls -la apps/web/dist/
```

- [ ] `index.html` exists
- [ ] `assets/` directory exists with hashed files
- [ ] No source maps in production build (unless intended)

## 🔄 Migration Verification

### Backward Compatibility

- [ ] Original API endpoints still work at `/api/*`
- [ ] No breaking changes to existing API
- [ ] Database schema unchanged
- [ ] Environment variables compatible with existing `.env`

### Documentation

- [ ] `MONOREPO-ARCHITECTURE.md` exists and is complete
- [ ] `README.md` updated with new structure
- [ ] Instructions for migration included
- [ ] Development and production instructions clear

## 🚀 Deployment Readiness

### Docker Build

```bash
docker build -t wahub:test .
```

- [ ] Docker image builds successfully
- [ ] Frontend dist is included in image
- [ ] No build errors

### Docker Run

```bash
docker run -p 5001:5001 --env-file .env wahub:test
```

- [ ] Container starts successfully
- [ ] Server accessible at http://localhost:5001
- [ ] API and frontend both work

## 📊 Performance Checks

### Frontend Bundle Size

- [ ] Total bundle size < 500KB (gzipped)
- [ ] No unnecessary dependencies in bundle
- [ ] Code splitting implemented

### Server Response Time

```bash
time curl http://localhost:5001/api/health
```

- [ ] Response time < 100ms
- [ ] No noticeable delays

### Memory Usage

Monitor server memory usage:

```bash
# After server has been running for a while
curl http://localhost:5001/api/health | jq .memory.heapUsed
```

- [ ] Memory usage stable (not constantly increasing)
- [ ] No memory leaks detected

## ✨ Additional Checks

### Error Handling

#### Test 404 on API

```bash
curl http://localhost:5001/api/nonexistent
```

- [ ] Returns 404 with appropriate message
- [ ] Returns JSON error response

#### Test 404 on Frontend (should serve SPA)

```bash
curl http://localhost:5001/nonexistent
```

- [ ] Returns 200 with index.html
- [ ] SPA handles routing client-side

### Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

All should:
- [ ] Load frontend correctly
- [ ] API calls work
- [ ] No console errors

## 🎯 Final Acceptance Criteria

All of the following MUST pass:

- [ ] `/api/health` returns 200 with JSON status
- [ ] Frontend fetches to `/api/*` succeed without CORS errors
- [ ] Direct navigation to `/dashboard` serves the SPA (no 404)
- [ ] Page reload at any route serves the SPA correctly
- [ ] Static assets served with proper cache headers
- [ ] Security headers present on all responses
- [ ] Development mode works with hot reload
- [ ] Production build completes successfully
- [ ] Production server runs without errors
- [ ] Documentation is complete and accurate
- [ ] No breaking changes to existing API

## 📝 Reviewer Notes

Add any additional observations or issues found during review:

```
[Add notes here]
```

## ✅ Sign-off

- [ ] All functional tests pass
- [ ] All code quality checks pass
- [ ] Documentation is complete
- [ ] Ready for merge

**Reviewed by:** ________________  
**Date:** ________________  
**Status:** ☐ Approved  ☐ Changes Requested  ☐ Rejected  
