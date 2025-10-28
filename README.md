# WhatsApp Multi-Session Gateway - Fullstack Application

Aplikasi fullstack yang powerful untuk mengelola multiple WhatsApp sessions dengan REST API backend dan modern web dashboard.

> **📦 Struktur Fullstack**: Backend (Node.js) + Frontend (React) + Dokumentasi lengkap

---

## 🏗️ Struktur Proyek

```
wahub/
├── backend/          # REST API Server (Node.js + TypeScript)
│   ├── src/         # Source code backend
│   ├── drizzle/     # Database migrations
│   └── ...
├── frontend/         # Web Dashboard (React + TypeScript)
│   ├── src/         # Source code frontend
│   └── ...
├── docs/            # Dokumentasi lengkap
│   ├── PHASE1-IMPLEMENTATION.md
│   ├── PHASE2-IMPLEMENTATION.md
│   ├── PHASE3-IMPLEMENTATION.md
│   ├── PHASE4-IMPLEMENTATION.md
│   ├── MYSQL-MIGRATION.md
│   └── TO-DO.md
└── docker-compose.yml  # Docker orchestration
```

---

## 🚀 Quick Start

### 🐳 Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/sdldev/wahub.git
cd wahub

# Start seluruh stack (Backend + Frontend + Database)
docker-compose up -d

# Check logs
docker-compose logs -f
```

**Akses aplikasi:**
- 🖥️ **Frontend Dashboard**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:5001
- 📊 **API Documentation (Swagger UI)**: http://localhost:5001/api-docs/ui
- 📖 **API Reference**: [backend/API-REFERENCE.md](backend/API-REFERENCE.md)
- 🚀 **Frontend Integration Guide**: [FRONTEND-INTEGRATION.md](FRONTEND-INTEGRATION.md)

### 📋 Manual Installation

#### 1. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Setup database
cp .env.example .env
# Edit .env dengan MySQL credentials

# Run migrations
npm run db:migrate
npm run db:seed

# Start backend server
npm run dev
```

**Backend akan berjalan di**: `http://localhost:5001`

> 📖 **Backend README**: [backend/README.md](backend/README.md)

#### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env (VITE_API_URL=http://localhost:5001)

# Start frontend dev server
npm run dev
```

**Frontend akan berjalan di**: `http://localhost:5173`

> 📖 **Frontend README**: [frontend/README.md](frontend/README.md)

---

## 🎯 Fitur Utama

### Backend API

- ✅ **Multi-Session Management** - Kelola multiple WhatsApp accounts
- ✅ **REST API** - Complete API endpoints untuk integrasi
- ✅ **JWT Authentication** - Secure authentication system
- ✅ **MySQL Database** - Production-ready database
- ✅ **Message Queue** - Anti-spam dengan rate limiting
- ✅ **Session Deduplication** - Prevent duplicate sessions
- ✅ **Auto Phone Detection** - Deteksi otomatis nomor WhatsApp

### Frontend Dashboard

- ✅ **Modern UI** - React + TypeScript + Shadcn/UI
- ✅ **Authentication** - Login/Register interface
- ✅ **Dashboard Overview** - Real-time statistics
- ✅ **Session Management** - Visual interface untuk sessions
- ✅ **Message Composer** - Send messages dengan UI
- ✅ **Responsive Design** - Mobile-friendly interface

---

## 📚 Dokumentasi

### Implementasi Phases

| Phase | Deskripsi | Status | Dokumentasi |
|-------|-----------|--------|-------------|
| **Phase 1** | Message Queue & Rate Limiting | ✅ Completed | [docs/PHASE1-IMPLEMENTATION.md](docs/PHASE1-IMPLEMENTATION.md) |
| **Phase 2** | Database & Authentication | ✅ Completed | [docs/PHASE2-IMPLEMENTATION.md](docs/PHASE2-IMPLEMENTATION.md) |
| **Phase 3** | Session Management | ✅ Completed | [docs/PHASE3-IMPLEMENTATION.md](docs/PHASE3-IMPLEMENTATION.md) |
| **Phase 4** | Frontend Dashboard | ✅ Completed | [docs/PHASE4-IMPLEMENTATION.md](docs/PHASE4-IMPLEMENTATION.md) |

### Panduan Setup

- 🔄 **MySQL Setup**: [docs/MYSQL-MIGRATION.md](docs/MYSQL-MIGRATION.md)
- 🐳 **Docker Setup**: [docs/DOCKER.md](docs/DOCKER.md)
- 📋 **Development Roadmap**: [docs/TO-DO.md](docs/TO-DO.md)

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Hono.js
- **Database**: MySQL + Drizzle ORM
- **Authentication**: JWT + bcrypt
- **Queue**: Message queue dengan rate limiting
- **Logging**: Winston

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/UI + Tailwind CSS
- **Routing**: React Router v6
- **State**: TanStack Query + Zustand
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2

---

## 🔌 API Endpoints

### Authentication
```bash
POST /auth/login      # Login
POST /auth/register   # Register
GET  /auth/me         # Get current user
```

### Session Management
```bash
POST   /session/create     # Create new session
GET    /session/list       # List all sessions
GET    /session/status     # Get session status
GET    /session/qr/:id     # Get QR code
POST   /session/logout     # Logout session
POST   /session/check-phone # Check phone availability
POST   /session/cleanup    # Cleanup inactive sessions
```

### Messages
```bash
POST /message/send-text     # Send text message
POST /message/send-image    # Send image
POST /message/send-document # Send document
GET  /message/queue-status  # Get queue status
POST /message/clear-queue   # Clear queue
```

> 📖 **Complete API Documentation**: 
> - [Backend README](backend/README.md)
> - [API Reference Guide](backend/API-REFERENCE.md) - Comprehensive endpoint documentation
> - [Swagger UI](http://localhost:5001/api-docs/ui) - Interactive API testing
> - [Frontend Integration Guide](FRONTEND-INTEGRATION.md) - For frontend developers

---

## 🏃 Development

### Backend Development

```bash
cd backend
npm run dev          # Start dengan hot reload
npm run build        # Build untuk production
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build untuk production
npm run preview      # Preview production build
```

---

## 🐛 Troubleshooting

### Common Issues

**Backend tidak bisa connect ke database:**
- Check MySQL service: `systemctl status mysql`
- Verify credentials di `backend/.env`
- Run migrations: `cd backend && npm run db:migrate`

**Frontend tidak bisa connect ke backend:**
- Pastikan backend running di port 5001
- Check `frontend/.env` VITE_API_URL
- Verify CORS settings di backend

**QR Code tidak muncul:**
- Check session status via API
- Restart session jika diperlukan
- Verify WhatsApp connection

---

## 📦 Production Deployment

### Docker Production

```bash
# Build dan start production
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Manual Production

**Backend:**
```bash
cd backend
npm run build
pm2 start ecosystem.config.js
```

**Frontend:**
```bash
cd frontend
npm run build
# Deploy dist/ ke static hosting (Nginx/Vercel/Netlify)
```

---

## 🔒 Security

- ✅ JWT authentication untuk API
- ✅ bcrypt password hashing
- ✅ API key per user
- ✅ Rate limiting untuk prevent spam
- ✅ Input validation
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ CORS configuration

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 💬 Support

- 📧 **Email**: support@wahub.com
- 💬 **Telegram**: [Join our group](https://t.me/wahub)
- 🐛 **Issues**: [GitHub Issues](https://github.com/sdldev/wahub/issues)

---

## 👥 Team

Developed with ❤️ by the WaHub Team

- **Backend**: Node.js + TypeScript
- **Frontend**: React + TypeScript  
- **Database**: MySQL + Drizzle ORM
- **UI**: Shadcn/UI + Tailwind CSS
