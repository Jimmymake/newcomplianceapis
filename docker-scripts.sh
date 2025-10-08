#!/bin/bash

# Docker Management Scripts for Compliance API
# This script provides easy commands to manage your integrated MongoDB setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start production environment
start_production() {
    print_header "Starting Production Environment"
    check_docker
    
    print_status "Building and starting production containers..."
    docker-compose up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    print_status "Checking service status..."
    docker-compose ps
    
    print_status "Production environment started successfully!"
    print_status "API: http://localhost:4000"
    print_status "Mongo Express: http://localhost:8081 (admin/admin123)"
    print_status "MongoDB: localhost:27017"
}

# Function to start development environment
start_development() {
    print_header "Starting Development Environment"
    check_docker
    
    print_status "Building and starting development containers..."
    docker-compose -f docker-compose.dev.yml up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    print_status "Checking service status..."
    docker-compose -f docker-compose.dev.yml ps
    
    print_status "Development environment started successfully!"
    print_status "API: http://localhost:4000 (with hot reload)"
    print_status "Mongo Express: http://localhost:8081 (admin/admin123)"
    print_status "MongoDB: localhost:27018"
}

# Function to stop all services
stop_all() {
    print_header "Stopping All Services"
    check_docker
    
    print_status "Stopping production services..."
    docker-compose down 2>/dev/null || true
    
    print_status "Stopping development services..."
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    print_status "All services stopped!"
}

# Function to view logs
view_logs() {
    local service=${1:-compliance-api}
    local env=${2:-production}
    
    print_header "Viewing Logs for $service ($env)"
    
    if [ "$env" = "development" ]; then
        docker-compose -f docker-compose.dev.yml logs -f "$service"
    else
        docker-compose logs -f "$service"
    fi
}

# Function to restart a service
restart_service() {
    local service=${1:-compliance-api}
    local env=${2:-production}
    
    print_header "Restarting $service ($env)"
    
    if [ "$env" = "development" ]; then
        docker-compose -f docker-compose.dev.yml restart "$service"
    else
        docker-compose restart "$service"
    fi
    
    print_status "$service restarted successfully!"
}

# Function to clean everything
clean_all() {
    print_header "Cleaning All Docker Resources"
    check_docker
    
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Stopping and removing all containers..."
        docker-compose down -v 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
        
        print_status "Removing unused Docker resources..."
        docker system prune -f
        
        print_status "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to backup MongoDB
backup_mongodb() {
    print_header "Backing up MongoDB"
    check_docker
    
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    print_status "Creating backup in $backup_dir..."
    docker exec compliance-mongodb mongodump --username admin --password password123 --authenticationDatabase admin --db merchantdb --out /tmp/backup
    docker cp compliance-mongodb:/tmp/backup "$backup_dir"
    
    print_status "Backup completed: $backup_dir"
}

# Function to restore MongoDB
restore_mongodb() {
    local backup_path=$1
    
    if [ -z "$backup_path" ]; then
        print_error "Please provide backup path: ./docker-scripts.sh restore /path/to/backup"
        exit 1
    fi
    
    print_header "Restoring MongoDB from $backup_path"
    check_docker
    
    print_warning "This will overwrite existing data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Restoring from backup..."
        docker cp "$backup_path" compliance-mongodb:/tmp/restore
        docker exec compliance-mongodb mongorestore --username admin --password password123 --authenticationDatabase admin --db merchantdb --drop /tmp/restore/merchantdb
        
        print_status "Restore completed!"
    else
        print_status "Restore cancelled."
    fi
}

# Function to show status
show_status() {
    print_header "Service Status"
    check_docker
    
    print_status "Production Services:"
    docker-compose ps 2>/dev/null || print_warning "Production services not running"
    
    echo ""
    print_status "Development Services:"
    docker-compose -f docker-compose.dev.yml ps 2>/dev/null || print_warning "Development services not running"
    
    echo ""
    print_status "Docker System Info:"
    docker system df
}

# Function to show help
show_help() {
    echo "Compliance API Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start-prod     Start production environment"
    echo "  start-dev      Start development environment"
    echo "  stop           Stop all services"
    echo "  restart [service] [env]  Restart a service (default: compliance-api, production)"
    echo "  logs [service] [env]     View logs (default: compliance-api, production)"
    echo "  status         Show service status"
    echo "  backup         Backup MongoDB data"
    echo "  restore [path] Restore MongoDB from backup"
    echo "  clean          Clean all Docker resources"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start-prod"
    echo "  $0 start-dev"
    echo "  $0 logs compliance-api development"
    echo "  $0 restart mongodb production"
    echo "  $0 backup"
    echo "  $0 restore ./backups/20240115_143022"
}

# Main script logic
case "${1:-help}" in
    start-prod)
        start_production
        ;;
    start-dev)
        start_development
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_service "$2" "$3"
        ;;
    logs)
        view_logs "$2" "$3"
        ;;
    status)
        show_status
        ;;
    backup)
        backup_mongodb
        ;;
    restore)
        restore_mongodb "$2"
        ;;
    clean)
        clean_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
