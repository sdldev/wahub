# CI Configuration for Monorepo

This project uses a monorepo structure with separate CI jobs for backend and frontend.

## Project Structure

```
wahub/
├── backend/          # Bun + TypeScript API
├── frontend/         # React + Vite Dashboard  
├── apps/web/         # Additional React App
├── .github/
│   └── workflows/
│       └── ci.yml    # CI Pipeline
└── ci-test.sh        # Local CI simulation
```

## CI Pipeline

### Backend Tests (`backend/`)
- **Runtime**: Bun (latest)
- **Build Time**: ~237ms for production build (15.67 MB bundle)
- **Scripts**: 
  - Type check: `bun run build` (includes type checking)
  - Lint: `bun run lint:check`
  - Format: `bun run format:check`
  - Test: `bun test` (3 tests passing)
  - Build: `bun run build`

### Frontend Tests (`frontend/`)
- **Runtime**: Bun (latest) - **UNIFIED** ✅
- **Build Time**: ~363ms for production build (280.40 kB gzipped)
- **Build Tool**: rolldown-vite (ultrafast Rust-based bundler)
- **Scripts**:
  - Type check: `bun run type-check`
  - Lint: `bun run lint:check`
  - Format: `bun run format:check`
  - Test: `bun run test` (to be added)
  - Build: `bun run build`

### Integration Tests
- **Docker**: Build and test container (Node.js 20 + Bun)
- **Status**: ⚠️ In progress - native dependencies require build tools
- **Dependencies**: Both backend and frontend must pass first

## Local Development

### Run CI Locally
```bash
# Full CI simulation
./ci-test.sh

# Individual components (Both use Bun now!)
cd backend && bun install && bun test && bun run build
cd frontend && bun install && bun run build
```

### Backend Development
```bash
cd backend
bun install
bun run dev          # Development server
bun test            # Run tests
bun run build       # Production build
```

### Frontend Development
```bash
cd frontend
bun install         # Now using Bun!
bun run dev         # Development server
bun run build       # Production build
bun run lint:check  # Code linting
bun run format:check # Code formatting
```

## CI Status

The CI pipeline runs on:
- **Triggers**: Push to `main`, All pull requests
- **Jobs**: backend, frontend, integration (parallel)
- **Runtime**: Bun (latest) for both backend and frontend - **UNIFIED** ✅
- **Performance**: 
  - Backend build: 237ms (15.67 MB)
  - Frontend build: 363ms (280.40 kB gzipped)
  - Total CI time: ~1-2 minutes (excluding Docker)

## ✅ Runtime Unification Complete

Both backend and frontend now use **Bun** as the unified runtime:

### Before (Mixed)
- Backend: Bun ✓
- Frontend: Node.js/npm ❌

### After (Unified) 
- Backend: Bun ✓
- Frontend: Bun ✓

**Benefits:**
- Single runtime to maintain
- Consistent package management 
- Faster installs and builds
- Simplified CI configuration
- Better developer experience

## Troubleshooting

### Backend Issues
- Ensure Bun is installed: `bun --version`
- Check dependencies: `bun install`
- Verify scripts in `backend/package.json`

### Frontend Issues  
- Ensure Bun is installed: `bun --version`
- Check dependencies: `bun install`
- Verify scripts in `frontend/package.json`

### Docker Issues
- Ensure Docker is running: `docker --version`
- Check Dockerfile in project root
- Verify build context includes both backend and frontend

## Branch Compatibility

This CI configuration is designed for the new monorepo structure. Branches using the old structure (single package.json with Bun) will need:

1. **Update CI**: Use the Bun-based CI from `main` branch
2. **Migrate Structure**: Move to monorepo layout  
3. **Update Scripts**: Adjust package.json scripts for new structure