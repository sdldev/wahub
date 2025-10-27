# Example Commands for Reviewers

This document provides copy-paste commands for reviewers to quickly test the Laravel-like routing implementation.

## 🚀 Quick Start (5 minutes)

```bash
# 1. Checkout PR branch
git fetch origin
git checkout copilot/modify-routing-for-laravel-pattern

# 2. Install dependencies
npm install
cd apps/web && npm install && cd ../..

# 3. Configure environment (requires MySQL)
cp .env.example .env
# Edit .env with your MySQL credentials:
# - DB_HOST=localhost
# - DB_USER=wahub_user
# - DB_PASSWORD=your_password
# - DB_NAME=wahub

# 4. Run migrations
npm run db:migrate

# 5. Build frontend
npm run build:web

# 6. Start production server
npm start
```

**Expected output:**
```
🚀 Server is running on http://localhost:5001
📡 API available at http://localhost:5001/api
🌐 Frontend available at http://localhost:5001
```

## 🧪 Test API Endpoints

### Test 1: Health Check

```bash
curl http://localhost:5001/api/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T...",
  "uptime": 123.456,
  "memory": {...},
  "version": "v20.x.x"
}
```

### Test 2: API Route vs Frontend Route

```bash
# API route - should return JSON
curl -I http://localhost:5001/api/health

# Frontend route - should return HTML
curl -I http://localhost:5001/dashboard

# Compare the Content-Type headers
```

**Expected:**
- API: `Content-Type: application/json`
- Frontend: `Content-Type: text/html`

## 🌐 Test Frontend

### Test 1: Root Route

```bash
# Open in browser
open http://localhost:5001/
# Or for Linux:
xdg-open http://localhost:5001/
```

**What to check:**
- [ ] Page loads without errors
- [ ] Shows "WhatsApp Gateway Dashboard" heading
- [ ] Health check button works
- [ ] No console errors

### Test 2: Direct Navigation (SPA Routing)

```bash
# Open directly at a route that doesn't exist as a file
open http://localhost:5001/dashboard
```

**What to check:**
- [ ] No 404 error
- [ ] SPA loads correctly
- [ ] Same content as root route

### Test 3: API Call from Frontend

Open browser console at `http://localhost:5001/` and run:

```javascript
// Test API call
fetch('/api/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ API call successful!');
    console.log('Status:', data.status);
    console.log('Uptime:', data.uptime);
  })
  .catch(err => {
    console.error('❌ API call failed:', err);
  });
```

**Expected:**
- No CORS errors
- Status: "ok"
- Uptime in seconds

## 🔒 Test Security Headers

```bash
# Check security headers
curl -I http://localhost:5001/ | grep -E "(Content-Security-Policy|X-Frame-Options|X-Content-Type-Options)"
```

**Expected headers:**
```
Content-Security-Policy: default-src 'self'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Test Cache Headers

```bash
# Get asset filename (replace [hash] with actual hash)
ls apps/web/dist/assets/

# Test cache header on asset
curl -I http://localhost:5001/assets/index-[hash].js | grep Cache-Control
```

**Expected:**
```
Cache-Control: public, max-age=31536000, immutable
```

## 🔄 Test Development Mode

```bash
# Stop production server first (Ctrl+C)

# Start development mode
npm run dev
```

**Expected:**
- Two processes start (frontend on 3000, backend on 5001)
- No errors in console

### Test Dev Proxy

```bash
# In another terminal, test frontend dev server
curl http://localhost:3000/api/health
```

**Expected:**
- Returns API health data
- Proxied from port 5001

### Test Hot Module Replacement

```bash
# While dev server is running, edit a file
echo "// Test comment" >> apps/web/src/App.tsx

# Watch terminal - should see:
# - Frontend: "HMR update" or "page reloaded"
# - Backend: "Restarting..." (if changed backend file)
```

## 🏗️ Test Build Process

```bash
# Clean previous builds
rm -rf apps/web/dist/

# Build frontend
npm run build:web

# Verify build output
ls -la apps/web/dist/
```

**Expected files:**
- `index.html`
- `assets/index-[hash].js`
- `assets/index-[hash].css`

### Verify Build Size

```bash
# Check bundle size
du -sh apps/web/dist/
du -h apps/web/dist/assets/*.js
```

**Expected:**
- Total size: < 1MB
- JS bundle: < 500KB (uncompressed)

## 🐳 Test Docker Build

```bash
# Build Docker image (if Dockerfile exists)
docker build -t wahub:test .

# Run container
docker run -p 5001:5001 --env-file .env wahub:test
```

**Test in another terminal:**

```bash
# Test API
curl http://localhost:5001/api/health

# Test frontend
curl http://localhost:5001/
```

## 📊 Performance Tests

### Test 1: Response Time

```bash
# Test API response time
time curl -s http://localhost:5001/api/health > /dev/null

# Should be < 100ms
```

### Test 2: Multiple Requests

```bash
# Send 100 requests and measure
for i in {1..100}; do
  curl -s http://localhost:5001/api/health > /dev/null
done
```

**Watch for:**
- No errors
- Consistent response times
- No memory leaks (check with `curl http://localhost:5001/api/health | jq .memory`)

### Test 3: Concurrent Requests

```bash
# Install Apache Bench if not available
# Ubuntu: sudo apt-get install apache2-utils
# macOS: brew install ab

# Run concurrent test
ab -n 1000 -c 10 http://localhost:5001/api/health

# Check:
# - Requests per second
# - No failed requests
```

## 🔍 Test Error Handling

### Test 1: 404 on API

```bash
curl -i http://localhost:5001/api/nonexistent
```

**Expected:**
- Status: 404
- Content-Type: application/json
- Error message in response

### Test 2: 404 on Frontend (Should Serve SPA)

```bash
curl -i http://localhost:5001/nonexistent-route
```

**Expected:**
- Status: 200 (not 404!)
- Content-Type: text/html
- Returns index.html (SPA handles routing)

### Test 3: Invalid API Request

```bash
# Try to access protected endpoint without API key
curl -i http://localhost:5001/api/session
```

**Expected:**
- Status: 401 (Unauthorized) or 403 (Forbidden)
- JSON error response

## 🌍 Test CORS

### Test 1: Cross-Origin Request (Development)

In browser console (from any other site):

```javascript
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Expected in development:**
- ✅ Request succeeds (CORS allows all origins)

### Test 2: CORS Headers

```bash
curl -H "Origin: http://example.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     -i http://localhost:5001/api/health
```

**Expected headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key
```

## 🧬 Test with Different Node Versions

```bash
# Check current Node version
node --version

# Test with different Node versions (using nvm)
nvm install 18
nvm use 18
npm start

nvm install 20
nvm use 20
npm start

nvm install 22
nvm use 22
npm start
```

**Expected:**
- Works with Node 18+
- No version-specific errors

## 🐝 Test with Bun (Optional)

### Install Bun

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Verify
bun --version
```

### Run with Bun

```bash
# Install with Bun
bun install

# Build frontend (still uses Vite)
npm run build:web

# Start server with Bun
bun apps/server/index.ts
```

### Compare Performance

```bash
# Benchmark Node.js
time npm start & 
sleep 2
time curl http://localhost:5001/api/health
kill %1

# Benchmark Bun
time bun apps/server/index.ts &
sleep 2
time curl http://localhost:5001/api/health
kill %1

# Compare startup times and response times
```

## 📱 Test Browser Compatibility

### Desktop Browsers

```bash
# Chrome
open -a "Google Chrome" http://localhost:5001/

# Firefox
open -a Firefox http://localhost:5001/

# Safari (macOS)
open -a Safari http://localhost:5001/
```

**Check in each browser:**
- [ ] Page loads correctly
- [ ] API calls work
- [ ] No console errors
- [ ] Responsive design works

### Mobile Testing

```bash
# Get your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from mobile device
# http://[YOUR-IP]:5001/
```

## 🔄 Test Page Reload

### Test 1: Reload at Root

1. Open http://localhost:5001/
2. Press F5 (or Cmd+R)
3. Check: Page reloads correctly

### Test 2: Reload at Route

1. Open http://localhost:5001/dashboard
2. Press F5 (or Cmd+R)
3. Check: No 404, SPA loads correctly

### Test 3: Hard Reload

1. Open http://localhost:5001/
2. Press Ctrl+Shift+R (or Cmd+Shift+R)
3. Check: Assets reload, no errors

## 🎯 Complete Test Script

Save this as `test-all.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Testing Laravel-like Routing Implementation"
echo "============================================="

# Test 1: API Health
echo ""
echo "📡 Test 1: API Health Check"
HEALTH=$(curl -s http://localhost:5001/api/health | jq -r .status)
if [ "$HEALTH" = "ok" ]; then
  echo "✅ API health check passed"
else
  echo "❌ API health check failed"
  exit 1
fi

# Test 2: Frontend Serves
echo ""
echo "🌐 Test 2: Frontend Serves"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/)
if [ "$STATUS" = "200" ]; then
  echo "✅ Frontend serves correctly"
else
  echo "❌ Frontend failed (status: $STATUS)"
  exit 1
fi

# Test 3: SPA Routing
echo ""
echo "🔄 Test 3: SPA Routing (History Fallback)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/dashboard)
if [ "$STATUS" = "200" ]; then
  echo "✅ SPA routing works"
else
  echo "❌ SPA routing failed"
  exit 1
fi

# Test 4: Security Headers
echo ""
echo "🔒 Test 4: Security Headers"
HEADERS=$(curl -s -I http://localhost:5001/ | grep -c -E "(X-Frame-Options|X-Content-Type-Options)")
if [ "$HEADERS" -ge 2 ]; then
  echo "✅ Security headers present"
else
  echo "❌ Security headers missing"
  exit 1
fi

echo ""
echo "✅ All tests passed!"
```

Run it:

```bash
chmod +x test-all.sh
./test-all.sh
```

## 📝 Final Checklist

Before approving the PR, verify:

```bash
# 1. Code quality
npm run lint:check
npm run format:check

# 2. Build succeeds
npm run build:web

# 3. Server starts
npm start
# Wait 5 seconds, then Ctrl+C

# 4. Dev mode works
npm run dev
# Wait 5 seconds, then Ctrl+C

# 5. Tests pass (if any)
npm test

# 6. Documentation is complete
ls -la *.md
# Should see:
# - MONOREPO-ARCHITECTURE.md
# - BUN-ALTERNATIVE.md
# - QA-CHECKLIST.md
# - PR-SUMMARY.md
# - EXAMPLE-COMMANDS.md
```

## 🎉 Success Criteria

If all these tests pass, the PR is ready to merge:

✅ API health endpoint returns 200  
✅ Frontend serves at root  
✅ SPA routing works (no 404 on page reload)  
✅ Security headers present  
✅ Cache headers correct  
✅ CORS configured  
✅ Development mode works  
✅ Production build succeeds  
✅ Documentation complete  

## 📞 Questions?

If you encounter any issues:

1. Check the logs: `npm start` output
2. Review: MONOREPO-ARCHITECTURE.md
3. Check QA-CHECKLIST.md
4. Open an issue with error details

---

**Happy Testing! 🚀**
