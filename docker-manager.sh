#!/bin/bash

# WhatsApp Gateway Docker Management Script
# Usage: ./docker-manager.sh [command]

set -e

COMPOSE_FILE="docker-compose.yml"
COMPOSE_DEV_FILE="docker-compose.dev.yml"
ENV_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_warning ".env file tidak ditemukan"
        print_status "Membuat .env dari .env.docker..."
        cp .env.docker .env
        print_success ".env file berhasil dibuat"
        print_warning "Silakan edit file .env sesuai kebutuhan Anda"
    fi
}

# Function to build images
build() {
    print_status "Building Docker images..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    print_success "Docker images berhasil di-build"
}

# Function to start services in production mode
start() {
    check_env_file
    print_status "Starting WhatsApp Gateway (Production Mode)..."
    docker-compose -f $COMPOSE_FILE up -d
    print_success "WhatsApp Gateway berhasil dijalankan"
    print_status "Akses aplikasi di: http://localhost:5001"
}

# Function to start services in development mode
dev() {
    print_status "Starting WhatsApp Gateway (Development Mode)..."
    docker-compose -f $COMPOSE_DEV_FILE up -d
    print_success "WhatsApp Gateway (Development) berhasil dijalankan"
    print_status "Akses aplikasi di: http://localhost:5001"
    print_status "Hot reload enabled - perubahan code akan otomatis restart"
}

# Function to stop services
stop() {
    print_status "Stopping WhatsApp Gateway..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_DEV_FILE down 2>/dev/null || true
    print_success "WhatsApp Gateway berhasil dihentikan"
}

# Function to restart services
restart() {
    print_status "Restarting WhatsApp Gateway..."
    stop
    start
    print_success "WhatsApp Gateway berhasil direstart"
}

# Function to show logs
logs() {
    print_status "Menampilkan logs WhatsApp Gateway..."
    docker-compose -f $COMPOSE_FILE logs -f wa-gateway
}

# Function to show status
status() {
    print_status "Status WhatsApp Gateway:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    docker-compose -f $COMPOSE_DEV_FILE ps 2>/dev/null || true
}

# Function to clean up
cleanup() {
    print_warning "Membersihkan semua data (containers, volumes, images)..."
    read -p "Apakah Anda yakin? Data akan hilang permanent! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Menghentikan dan menghapus containers..."
        docker-compose -f $COMPOSE_FILE down -v --remove-orphans
        docker-compose -f $COMPOSE_DEV_FILE down -v --remove-orphans 2>/dev/null || true
        
        print_status "Menghapus images..."
        docker rmi $(docker images "wa-gateway*" -q) 2>/dev/null || true
        
        print_success "Cleanup selesai"
    else
        print_status "Cleanup dibatalkan"
    fi
}

# Function to backup data
backup() {
    print_status "Membuat backup data..."
    
    # Create backup directory dengan timestamp
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup wa_credentials
    if [ -d "./wa_credentials" ]; then
        cp -r ./wa_credentials "$BACKUP_DIR/"
        print_success "WhatsApp credentials berhasil di-backup"
    fi
    
    # Backup media files
    if [ -d "./media" ]; then
        cp -r ./media "$BACKUP_DIR/"
        print_success "Media files berhasil di-backup"
    fi
    
    # Backup environment file
    if [ -f "./.env" ]; then
        cp ./.env "$BACKUP_DIR/"
        print_success "Environment file berhasil di-backup"
    fi
    
    print_success "Backup selesai: $BACKUP_DIR"
}

# Function to restore from backup
restore() {
    if [ -z "$2" ]; then
        print_error "Usage: $0 restore <backup_directory>"
        exit 1
    fi
    
    BACKUP_DIR="$2"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "Backup directory tidak ditemukan: $BACKUP_DIR"
        exit 1
    fi
    
    print_warning "Restoring dari backup: $BACKUP_DIR"
    
    # Restore wa_credentials
    if [ -d "$BACKUP_DIR/wa_credentials" ]; then
        cp -r "$BACKUP_DIR/wa_credentials" ./
        print_success "WhatsApp credentials berhasil di-restore"
    fi
    
    # Restore media
    if [ -d "$BACKUP_DIR/media" ]; then
        cp -r "$BACKUP_DIR/media" ./
        print_success "Media files berhasil di-restore"
    fi
    
    # Restore environment
    if [ -f "$BACKUP_DIR/.env" ]; then
        cp "$BACKUP_DIR/.env" ./
        print_success "Environment file berhasil di-restore"
    fi
    
    print_success "Restore selesai"
}

# Function to show help
help() {
    echo "WhatsApp Gateway Docker Manager"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build     - Build Docker images"
    echo "  start     - Start services (production mode)"
    echo "  dev       - Start services (development mode)"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart services"
    echo "  logs      - Show logs"
    echo "  status    - Show status"
    echo "  cleanup   - Clean up all data (WARNING: destructive)"
    echo "  backup    - Backup important data"
    echo "  restore   - Restore from backup"
    echo "  help      - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start production mode"
    echo "  $0 dev                      # Start development mode"
    echo "  $0 logs                     # Show real-time logs"
    echo "  $0 backup                   # Create backup"
    echo "  $0 restore backups/20231027_143000  # Restore from backup"
}

# Main script logic
case "${1:-help}" in
    "build")
        build
        ;;
    "start")
        start
        ;;
    "dev")
        dev
        ;;
    "stop")
        stop
        ;;
    "restart")
        restart
        ;;
    "logs")
        logs
        ;;
    "status")
        status
        ;;
    "cleanup")
        cleanup
        ;;
    "backup")
        backup
        ;;
    "restore")
        restore "$@"
        ;;
    "help"|*)
        help
        ;;
esac