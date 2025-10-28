---
applyTo: '**'
---

# Terminal Management and Testing Guidelines

## 🚨 CRITICAL: Terminal Usage Rules

### Terminal Management (CRITICAL)

#### Background Processes vs Testing
1. **NEVER use the same terminal** for running background processes AND testing
2. **Background processes** (servers, watchers) should run in dedicated terminals
3. **Testing/checking** should ALWAYS use separate terminals that can be closed after completion
4. **PENTING: PISAHKAN TERMINAL KETIKA MENJALANKAN TEST** - Jangan pernah interrupt background process untuk testing

### Proper Terminal Workflow

#### ✅ CORRECT Approach:
```bash
# Terminal 1: Background process (keep alive)
cd /project && bun run dev  # isBackground=true

# Terminal 2: Testing (separate terminal, closes after test)  
curl http://localhost:5001/health | jq .  # isBackground=false
```

#### ❌ WRONG Approach:
```bash
# Same terminal for both background process AND testing
cd /project && bun run dev &  # Background
curl http://localhost:5001/health     # Testing in same terminal
```

### Implementation Rules

#### When Starting Services:
- Use `isBackground=true` for all servers, watchers, and long-running processes
- Keep these terminals alive throughout the session
- Don't use these terminals for testing

#### When Testing/Checking:
- Always use `isBackground=false` for API tests, curl commands, and checks
- Use fresh terminal sessions for each test  
- Terminal closes automatically after test completion
- **NEVER interrupt background processes** - use completely separate terminals
- **CRITICAL**: If server is running in background, DO NOT use that terminal for testing

#### Terminal ID Management:
- Background processes get persistent terminal IDs
- Testing commands use ephemeral terminals
- Never mix background and testing in same terminal

### Examples

#### ✅ Starting Full Stack Application:
```typescript
run_in_terminal({
  command: "cd /project && bun run dev",
  explanation: "Starting backend and frontend servers",
  isBackground: true  // ← Keeps terminal alive
})
```

#### ✅ Testing API:
```typescript
run_in_terminal({
  command: "curl -s http://localhost:5001/api/health | jq .",
  explanation: "Testing API health endpoint", 
  isBackground: false  // ← Terminal closes after test
})
```

#### ✅ When Server Already Running Externally:
```typescript
// Server sudah running di luar VS Code - hanya test saja
run_in_terminal({
  command: "curl -s http://localhost:5001/health | jq .",
  explanation: "Check if external server is responding",
  isBackground: false  // ← Always false for testing only
})
```

#### ❌ Wrong Pattern:
```typescript
// DON'T DO THIS - mixing background and testing
run_in_terminal({
  command: "cd /project && bun run dev && curl localhost:5001/health",
  isBackground: true
})
```

### Testing Workflow

1. **Start services** in background terminals (keep alive)
2. **Wait for services** to be ready (check logs if needed)
3. **Run tests** in separate terminals (close after completion)
4. **Validate results** 
5. **Continue with next test** using new terminal

### Error Prevention

- Before testing, confirm services are running via background terminal logs
- Use `get_terminal_output` to check background service status
- Don't interrupt background processes for testing
- Keep background and testing concerns completely separate

### External Server Running (IMPORTANT)

If server is already running outside VS Code (e.g., in external terminal):
- **DO NOT** start server again with `isBackground=true`
- **ONLY USE** `isBackground=false` for testing/checking
- Verify server is running first with health check
- Use separate terminals only for testing API endpoints

### Project Context and Coding Guidelines

This project is a WhatsApp Gateway system with:
- Backend: Node.js/Hono.js with MySQL database
- Frontend: React TypeScript with Vite
- WhatsApp Integration: wa-multi-session library
- Authentication: JWT-based with role management
- Database: MySQL with Drizzle ORM

When implementing features:
1. Follow separation of concerns
2. Use proper error handling
3. Implement proper validation
4. Follow TypeScript best practices
5. Keep terminals organized per above rules