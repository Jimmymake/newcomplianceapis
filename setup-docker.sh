#!/bin/bash

# Compliance API Docker Setup Script
# This script helps you set up and run the Compliance API with Docker

set -e

echo "🐳 Compliance API Docker Setup"
echo "=============================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    mkdir -p uploads
    chmod 755 uploads
    echo "✅ Created uploads directory"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
    echo "⚠️  Don't forget to change the JWT_SECRET and database passwords!"
fi

# Function to show menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) Start Production Environment"
    echo "2) Start Development Environment"
    echo "3) Stop All Services"
    echo "4) View Logs"
    echo "5) Clean Up (Remove all containers and volumes)"
    echo "6) Build Docker Image"
    echo "7) Show Service Status"
    echo "8) Exit"
    echo ""
}

# Function to start production
start_production() {
    echo "🚀 Starting Production Environment..."
    docker-compose up -d
    echo "✅ Production environment started!"
    echo "📍 API: http://localhost:4001"
    echo "📍 MongoDB Admin: http://localhost:8081 (admin/admin123)"
}

# Function to start development
start_development() {
    echo "🛠️  Starting Development Environment..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ Development environment started!"
    echo "📍 API: http://localhost:4001 (with hot reload)"
    echo "📍 MongoDB Admin: http://localhost:8081 (admin/admin123)"
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    echo "✅ All services stopped!"
}

# Function to view logs
view_logs() {
    echo "📋 Viewing logs (Press Ctrl+C to exit)..."
    docker-compose logs -f compliance-api 2>/dev/null || docker-compose -f docker-compose.dev.yml logs -f compliance-api-dev
}

# Function to clean up
clean_up() {
    echo "🧹 Cleaning up..."
    read -p "⚠️  This will remove all containers and volumes. Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
        docker system prune -f
        echo "✅ Cleanup completed!"
    else
        echo "❌ Cleanup cancelled."
    fi
}

# Function to build image
build_image() {
    echo "🔨 Building Docker image..."
    docker build -t compliance-api .
    echo "✅ Docker image built successfully!"
}

# Function to show status
show_status() {
    echo "📊 Service Status:"
    echo "=================="
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(compliance|mongodb|mongo-express)" || echo "No services running"
}

# Main menu loop
while true; do
    show_menu
    read -p "Enter your choice (1-8): " choice
    
    case $choice in
        1)
            start_production
            ;;
        2)
            start_development
            ;;
        3)
            stop_services
            ;;
        4)
            view_logs
            ;;
        5)
            clean_up
            ;;
        6)
            build_image
            ;;
        7)
            show_status
            ;;
        8)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-8."
            ;;
    esac
done






