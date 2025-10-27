# Docker Setup Guide

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Minimal 2GB RAM tersedia
- Minimal 5GB disk space

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/Pramtoxz/wa-gateway.git
cd wa-gateway
```

### 2. Setup Environment
```bash
# Copy environment template
cp .env.docker .env

# Edit environment variables
nano .env
```

### 3. Start Application
```bash
# Make script executable
chmod +x docker-manager.sh

# Start production mode
./docker-manager.sh start
```

## 🔧 Docker Manager Script

Script `docker-manager.sh` menyediakan commands untuk memudahkan management:

### Available Commands

```bash
# Build Docker images
./docker-manager.sh build

# Start production mode
./docker-manager.sh start

# Start development mode (with hot reload)
./docker-manager.sh dev

# Stop all services
./docker-manager.sh stop

# Restart services
./docker-manager.sh restart

# Show real-time logs
./docker-manager.sh logs

# Show container status
./docker-manager.sh status

# Create backup
./docker-manager.sh backup

# Restore from backup
./docker-manager.sh restore backups/20231027_143000

# Clean up everything (DESTRUCTIVE)
./docker-manager.sh cleanup

# Show help
./docker-manager.sh help
```

## 🏗️ Architecture

### Production Setup (`docker-compose.yml`)
- **wa-gateway**: Main application
- **redis**: Queue management
- **nginx**: Reverse proxy (optional)
- **adminer**: Database UI (optional)
- **redis-commander**: Redis UI (optional)

### Development Setup (`docker-compose.dev.yml`)
- **wa-gateway-dev**: Development dengan hot reload
- Volumes mounted untuk source code

## 📊 Service Profiles

Aktifkan service tambahan dengan profiles:

```bash
# Start dengan Nginx reverse proxy
docker-compose --profile nginx up -d

# Start dengan Adminer (database UI)
docker-compose --profile adminer up -d

# Start dengan Redis Commander (redis UI)
docker-compose --profile redis-ui up -d

# Start dengan semua optional services
docker-compose --profile nginx --profile adminer --profile redis-ui up -d
```

## 🔌 Access Points

### Production Mode
- **Main App**: http://localhost:5001
- **Health Check**: http://localhost:5001/health
- **Nginx** (jika enabled): http://localhost:80
- **Adminer** (jika enabled): http://localhost:8080
- **Redis UI** (jika enabled): http://localhost:8081

### Development Mode
- **Main App**: http://localhost:5001
- Hot reload enabled untuk development

## 📁 Persistent Data

### Volumes
- `wa_credentials/`: WhatsApp session credentials
- `media/`: Uploaded media files
- `database_data/`: SQLite database
- `redis_data/`: Redis persistence
- `logs_data/`: Application logs

### Local Directories
```
wa-gateway/
├── wa_credentials/    # WhatsApp credentials (persistent)
├── media/            # Media files (persistent)
├── data/             # Database files
└── logs/             # Log files
```

## 🔧 Environment Configuration

### Required Variables
```env
NODE_ENV=production
PORT=5001
KEY=your-secure-api-key
```

### Optional Variables
```env
WEBHOOK_BASE_URL=https://your-webhook.com
DATABASE_URL=file:./data/app.db
REDIS_URL=redis://redis:6379
MESSAGE_DELAY_MIN=3000
MESSAGE_DELAY_MAX=7000
MAX_MESSAGES_PER_MINUTE=20
```

## 🛠️ Development

### Hot Reload Development
```bash
# Start development mode
./docker-manager.sh dev

# Source code akan di-mount sebagai volume
# Perubahan code akan otomatis restart aplikasi
```

### Debug Mode
```bash
# Access container untuk debugging
docker exec -it wa-gateway-dev sh

# View logs
docker logs -f wa-gateway-dev
```

## 🔄 Backup & Restore

### Create Backup
```bash
./docker-manager.sh backup
# Backup akan disimpan di: backups/YYYYMMDD_HHMMSS/
```

### Restore from Backup
```bash
./docker-manager.sh restore backups/20231027_143000
```

### Manual Backup
```bash
# Backup credentials
cp -r wa_credentials/ backup_$(date +%Y%m%d)/

# Backup database
docker exec wa-gateway-app cp /app/data/app.db /tmp/
docker cp wa-gateway-app:/tmp/app.db ./backup_$(date +%Y%m%d)/
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:5001/health
```

### Container Stats
```bash
docker stats wa-gateway-app
```

### Logs
```bash
# Real-time logs
./docker-manager.sh logs

# Specific service logs
docker-compose logs -f redis
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 5001
sudo netstat -tulpn | grep 5001

# Kill process if needed
sudo kill -9 PID
```

#### Permission Denied
```bash
# Fix script permissions
chmod +x docker-manager.sh

# Fix directory permissions
sudo chown -R $USER:$USER wa_credentials/ media/
```

#### Out of Disk Space
```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Restart services
./docker-manager.sh restart
```

## 🔐 Security

### Production Security
- Change default API key in `.env`
- Use strong passwords
- Enable SSL/TLS dengan Nginx
- Restrict network access
- Regular security updates

### SSL Setup
```bash
# Generate self-signed certificate
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem

# Update nginx.conf untuk enable HTTPS
```

## 📦 Deployment

### Production Deployment
```bash
# Build dan start
./docker-manager.sh build
./docker-manager.sh start

# Dengan reverse proxy
docker-compose --profile nginx up -d
```

### Auto-restart
```bash
# Enable auto-restart policy
# Sudah dikonfigurasi di docker-compose.yml:
# restart: unless-stopped
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Test dengan Docker
4. Submit pull request

## 📞 Support

- GitHub Issues: [wa-gateway/issues](https://github.com/Pramtoxz/wa-gateway/issues)
- Documentation: [README.md](README.md)
- Docker Hub: (coming soon)