# WhatsApp Multi-Session Gateway (Node.js)

Sebuah gateway WhatsApp headless yang powerful, ringan, dan mudah di-deploy menggunakan Node.js. Mendukung multiple sessions, multi-device login, dan berbagai jenis pesan termasuk teks, gambar, dan dokumen.

## 📋 Table of Contents
- [Fitur Utama](#-fitur-utama)
- [Panduan Instalasi](#-panduan-instalasi)
- [Konfigurasi](#️-konfigurasi)
- [Menjalankan Server](#-menjalankan-server)
- [QR Code Setup](#-qr-code-setup)
- [API Endpoints](#-api-endpoints)
- [Fitur Anti-Ban](#️-fitur-anti-ban)
- [Tips Penggunaan](#-tips-penggunaan)
- [Troubleshooting](#-troubleshooting)

## 🚀 Fitur Utama

### Core Features
- ✅ **Multi-Device Support** - Mendukung WhatsApp Multi-Device
- ✅ **Multi-Session Ready** - Kelola beberapa akun WhatsApp sekaligus
- ✅ **REST API** - Integrasi mudah dengan aplikasi lain
- ✅ **Built-in Webhook** - Notifikasi real-time untuk pesan masuk

### Message Types
- ✅ **Text Messages** - Kirim pesan teks biasa
- ✅ **Image Messages** - Kirim gambar dengan caption
- ✅ **Document Files** - Kirim berbagai jenis dokumen
- ✅ **Sticker Messages** - Kirim sticker WhatsApp

### Anti-Ban Protection
- ✅ **Message Queue System** - Antrian pesan dengan rate limiting
- ✅ **Anti-Spam Protection** - Perlindungan dari banned
- ✅ **Typing Indicator** - Simulasi "sedang mengetik"
- ✅ **Random Delay** - Delay acak untuk simulasi manusia
- ✅ **Retry Mechanism** - Retry otomatis untuk pesan gagal
- ✅ **Queue Monitoring** - Status tracking dan monitoring

### Phase 2: Foundation & Security ✅ **NEW**
- ✅ **Multi-User Support** - User management dengan role-based access
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Database Integration** - SQLite atau MySQL untuk persistent storage
- ✅ **MySQL Support** - **Production-ready untuk 1000+ pesan/hari**
- ✅ **Message History** - Complete message history tracking
- ✅ **Structured Logging** - Winston logger dengan file rotation
- ✅ **Data Encryption** - Enkripsi untuk data sensitif
- ✅ **API Key per User** - Setiap user memiliki API key sendiri

> 📖 **Dokumentasi Lengkap Phase 2**: [PHASE2-IMPLEMENTATION.md](PHASE2-IMPLEMENTATION.md)
> 🔄 **MySQL Migration Guide**: [MYSQL-MIGRATION.md](MYSQL-MIGRATION.md) *(Recommended for high volume)*

## 📦 Panduan Instalasi

### 🐳 Instalasi dengan Docker (Recommended)
```bash
# Clone repository
git clone https://github.com/Pramtoxz/wa_gateway.git
cd wa_gateway

# Setup environment
cp .env.docker .env
nano .env  # Edit sesuai kebutuhan

# Start dengan Docker
chmod +x docker-manager.sh
./docker-manager.sh start
```
> 📖 **Dokumentasi lengkap Docker**: [DOCKER.md](DOCKER.md)

### 📋 Instalasi Manual

#### 1. Clone Repository
```bash
git clone https://github.com/Pramtoxz/wa_gateway.git
cd wa_gateway
```

#### 2. Install Dependencies
```bash
npm install
# or with Bun (recommended)
bun install
```

#### 3. Run Tests (Optional)
```bash
bun test
```

## ⚙️ Konfigurasi

### Setup Environment Variables
Copy file `.env.example` menjadi `.env` dan sesuaikan konfigurasi:
```bash
cp .env.example .env
```

Edit file `.env`:
```env
# Server Configuration
NODE_ENV=DEVELOPMENT
PORT=5001
KEY=your-secret-api-key

# Webhook (Optional)
WEBHOOK_BASE_URL=https://your-webhook-url.com

# Rate Limiting Configuration (Anti-Ban)
MESSAGE_DELAY_MIN=3000           # Delay minimum (ms)
MESSAGE_DELAY_MAX=7000           # Delay maksimum (ms)
MAX_MESSAGES_PER_MINUTE=20       # Limit pesan per menit
MAX_MESSAGES_PER_HOUR=500        # Limit pesan per jam
MAX_MESSAGES_PER_RECIPIENT=10    # Limit per penerima per jam
MAX_RETRY_ATTEMPTS=3             # Jumlah retry jika gagal
```

### Penjelasan Konfigurasi
| Variable | Deskripsi | Default | Recommended |
|----------|-----------|---------|-------------|
| `NODE_ENV` | Environment mode | DEVELOPMENT | PRODUCTION untuk live |
| `PORT` | Port server | 5001 | Sesuai kebutuhan |
| `KEY` | API Key untuk autentikasi | - | String acak yang kuat |
| `MESSAGE_DELAY_MIN` | Delay minimum antar pesan | 3000ms | 3000-5000ms |
| `MESSAGE_DELAY_MAX` | Delay maksimum antar pesan | 7000ms | 7000-10000ms |
| `MAX_MESSAGES_PER_MINUTE` | Limit pesan per menit | 20 | 10-30 |
| `MAX_MESSAGES_PER_HOUR` | Limit pesan per jam | 500 | 300-1000 |

## 🏃 Menjalankan Server

### 🐳 Dengan Docker (Recommended)
```bash
# Production mode
./docker-manager.sh start

# Development mode (dengan hot reload)
./docker-manager.sh dev

# Lihat logs
./docker-manager.sh logs

# Stop server
./docker-manager.sh stop
```

### 📋 Manual Mode

#### Development Mode
```bash
bun run dev
```

#### Production Mode
```bash
bun run start

# Atau menggunakan PM2
pm2 start ecosystem.config.js
```

### 🧪 Testing
```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/app.test.ts
```

Server akan berjalan di: `http://localhost:5001`

## 📱 QR Code Setup

### Method 1: Browser (Mudah)
Buka browser dan akses:
```
http://localhost:5001/session/start?session=mysession
```

### Method 2: API Endpoint (untuk Postman)

#### QR Code sebagai JSON:
```bash
GET http://localhost:5001/session/qr/mysession
Headers: x-api-key: your-api-key

Response:
{
  "success": true,
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### QR Code sebagai Gambar (PNG) - **RECOMMENDED untuk Postman**:
```bash
GET http://localhost:5001/session/qr-image/mysession
Headers: x-api-key: your-api-key

Response: image/png (QR Code langsung sebagai gambar)
```

> **💡 Tip untuk Postman**: Gunakan endpoint `/session/qr-image/` karena akan menampilkan QR code langsung sebagai gambar di tab **Preview** Postman. Sangat mudah untuk di-scan!

### Method 3: POST Request
```bash
POST http://localhost:5001/session/qr-image
Headers: 
  x-api-key: your-api-key
  Content-Type: application/json
Body:
{
  "sessionId": "mysession"
}
```

### Langkah-langkah Scan QR:
1. Buka WhatsApp di HP → Titik 3 → Perangkat Tertaut
2. Tap "Tautkan Perangkat"
3. Scan QR code yang muncul
4. Tunggu hingga status berubah menjadi "connected"

## 🔌 API Endpoints

### Authentication
Semua API endpoint memerlukan header `x-api-key` dengan nilai sesuai `KEY` di file `.env`.

### 📱 Session Management

#### Create/Start Session
```bash
POST /session/create
Headers: x-api-key: your-api-key
Body: {
  "sessionId": "mysession"
}
```

#### Get All Sessions
```bash
GET /session
Headers: x-api-key: your-api-key
```

#### Get QR Code (JSON)
```bash
GET /session/qr/:sessionId
Headers: x-api-key: your-api-key
```

#### Get QR Code (Image)
```bash
GET /session/qr-image/:sessionId
Headers: x-api-key: your-api-key
Response: image/png
```

#### Logout Session
```bash
POST /session/logout
Headers: x-api-key: your-api-key
Body: {
  "sessionId": "mysession"
}
```

### 💬 Send Messages

#### Send Text Message
```bash
POST /message/send-text
Headers: 
  x-api-key: your-api-key
  Content-Type: application/json
Body: {
  "session": "mysession",
  "to": "628123456789",
  "text": "Hello from WhatsApp Gateway!"
}
```

#### Send Image with Caption
```bash
POST /message/send-image
Headers: x-api-key: your-api-key
Body: {
  "session": "mysession",
  "to": "628123456789",
  "image": "https://example.com/image.jpg",
  "caption": "Check this image!"
}
```

#### Send Document
```bash
POST /message/send-document
Headers: x-api-key: your-api-key
Body: {
  "session": "mysession",
  "to": "628123456789",
  "document": "https://example.com/file.pdf",
  "filename": "document.pdf"
}
```

### 📊 Queue Management

#### Get Queue Status
```bash
GET /message/queue-status?session=mysession
Headers: x-api-key: your-api-key
```

#### Clear Queue
```bash
POST /message/clear-queue
Headers: x-api-key: your-api-key
Body: {
  "session": "mysession"
}
```

### 👤 Profile Management

#### Get Profile Info
```bash
POST /profile
Headers: x-api-key: your-api-key
Body: {
  "session": "mysession",
  "to": "628123456789"
}
```

## 🛡️ Fitur Anti-Ban

Sistem ini dilengkapi dengan mekanisme anti-spam untuk meminimalisir risiko banned:

### 🚦 Rate Limiting System
- **Per Minute**: Maksimal 20 pesan per menit (configurable)
- **Per Hour**: Maksimal 500 pesan per jam (configurable)  
- **Per Recipient**: Maksimal 10 pesan per penerima per jam
- **Queue System**: Pesan diproses secara berurutan dengan delay

### ⏱️ Smart Delay Management
- **Random Delay**: 3-7 detik antar pesan (configurable)
- **Typing Indicator**: Simulasi "sedang mengetik" sebelum kirim
- **Human-like Behavior**: Meniru perilaku pengguna normal

### 🔄 Retry & Recovery
- **Auto Retry**: Retry otomatis hingga 3x untuk pesan gagal
- **Queue Recovery**: Queue otomatis pause/resume saat disconnect
- **Error Handling**: Penanganan error yang robust

## 💡 Tips Penggunaan

### ✅ Best Practices untuk Menghindari Banned

#### ⚙️ Konfigurasi Optimal
- Gunakan delay 3-7 detik (atau lebih) antar pesan
- Set limit maksimal 20 pesan per menit untuk akun baru
- Untuk akun established, bisa dinaikkan hingga 30-50 per menit
- Jangan kirim lebih dari 1000 pesan per hari

#### 📱 Pemilihan Nomor
- Gunakan nomor bisnis resmi jika memungkinkan
- Verifikasi nomor dengan foto KTP untuk akun bisnis
- Hindari nomor yang baru saja dibuat
- Warming up akun baru dengan aktivitas normal selama beberapa hari

#### 📝 Content Guidelines
- Hindari konten spam atau promosi berlebihan
- Gunakan template pesan yang bervariasi
- Pastikan penerima sudah opt-in menerima pesan
- Sertakan opsi unsubscribe dalam pesan broadcast

#### 🎯 Target Audience
- Kirim pesan hanya ke nomor yang aktif
- Jangan spam ke nomor yang sama berulang kali
- Bersihkan database dari nomor yang tidak merespon
- Segmentasi audience berdasarkan engagement

### 🔧 Production Setup

#### PM2 Configuration
Buat file `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'wa-gateway',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

#### SSL Setup (Nginx)
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Troubleshooting

### ❌ Common Issues

#### WebSocket Warnings with Bun
Jika menggunakan Bun sebagai runtime, Anda mungkin melihat warning seperti:
```
[bun] Warning: ws.WebSocket 'upgrade' event is not implemented in bun
[bun] Warning: ws.WebSocket 'unexpected-response' event is not implemented in bun
```

**Solusi**: Warning ini tidak berbahaya dan tidak mempengaruhi fungsionalitas aplikasi. Mereka sudah di-suppress secara otomatis saat menjalankan `bun run dev` atau `bun run start`.

#### QR Code Tidak Muncul
```bash
# Check apakah session sudah dibuat
GET /session

# Restart session jika perlu
POST /session/logout
POST /session/create
```

#### Pesan Tidak Terkirim
```bash
# Check status queue
GET /message/queue-status?session=mysession

# Check apakah session masih connected
GET /session
```

#### Rate Limit Exceeded
- Kurangi `MAX_MESSAGES_PER_MINUTE` di `.env`
- Tambah `MESSAGE_DELAY_MIN` dan `MESSAGE_DELAY_MAX`
- Tunggu beberapa menit sebelum kirim lagi

#### Session Sering Disconnect
- Pastikan koneksi internet stabil
- Jangan login di device lain secara bersamaan
- Restart server jika perlu

### 📋 Error Codes

| Code | Deskripsi | Solusi |
|------|-----------|--------|
| 401 | Unauthorized | Check API key di header `x-api-key` |
| 404 | Session not found | Buat session baru dengan `/session/create` |
| 429 | Rate limit exceeded | Tunggu atau kurangi rate limit |
| 500 | Internal server error | Check logs server |

### 📊 Monitoring

#### Log Files Location
```bash
# Development
tail -f logs/app.log

# PM2 Production
pm2 logs wa-gateway
```

#### Health Check Endpoint
```bash
GET /health
Response: {"status": "ok", "timestamp": "2025-10-27T02:45:00.000Z"}
```

---

## 📄 License
MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing
Pull requests are welcome! Please read our contributing guidelines first.

## 💬 Support
- Create an issue on GitHub
- Join our Telegram group: [Link]
- Email: support@example.com