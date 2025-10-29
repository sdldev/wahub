# 🚀 MONOREPO COMMANDS

Perintah untuk menjalankan WhatsApp Hub Monorepo dengan mudah.

## 📋 Available Commands

### Development Commands

```bash
# Jalankan backend dan frontend bersamaan
npm run dev

# Jalankan hanya backend
npm run dev:backend

# Jalankan hanya frontend  
npm run dev:frontend
```

### Build Commands

```bash
# Build semua aplikasi
npm run build

# Build hanya backend
npm run build:backend

# Build hanya frontend
npm run build:frontend
```

### Production Commands

```bash
# Start semua aplikasi dalam mode production
npm run start

# Start hanya backend
npm run start:backend

# Start hanya frontend (preview mode)
npm run start:frontend
```

### Testing Commands

```bash
# Test semua aplikasi
npm run test

# Test hanya backend
npm run test:backend

# Test hanya frontend
npm run test:frontend
```

### Code Quality Commands

```bash
# Lint semua kode
npm run lint

# Format semua kode
npm run format
```

### Database Commands

```bash
# Buka Drizzle Studio
npm run db:studio

# Jalankan migrasi database
npm run db:migrate
```

### Utility Commands

```bash
# Install semua dependencies
npm run install:all

# Bersihkan node_modules dan dist
npm run clean

# Tampilkan info dokumentasi dan jalankan dev
npm run docs
```

## 🌟 Quick Start

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start development:**
   ```bash
   npm run dev
   ```

3. **Access applications:**
   - 🌐 Frontend: http://localhost:5173
   - 📚 API Docs: http://localhost:5001/api-docs/ui
   - ⚡ API Health: http://localhost:5001/health

## 📁 Project Structure

```
wahub/
├── backend/          # Hono API Server
├── frontend/         # React Application
├── package.json      # Monorepo scripts
└── README.md         # This file
```

## 🔧 Development Notes

- Backend berjalan di port **5001**
- Frontend berjalan di port **5173**  
- Database menggunakan MySQL dengan Drizzle ORM
- API documentation tersedia di `/api-docs/ui`
- Semua aplikasi menggunakan **Bun** sebagai runtime

## 📊 Monitoring

Saat development mode aktif, Anda dapat memantau:
- Hot reload untuk perubahan kode
- Real-time log dari backend dan frontend
- Error handling dan debugging info

Happy coding! 🎉