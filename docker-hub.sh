#!/bin/bash

# Docker Hub Management Script for Compliance API
# Usage: ./docker-hub.sh [build|push|pull|login]

set -e

DOCKER_USERNAME="jimmymake"
IMAGE_NAME="compliance-api"
VERSION="v1.0"

echo "🐳 Docker Hub Management for Compliance API"
echo "============================================"

show_help() {
    echo "Usage: ./docker-hub.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build    - Build and tag the Docker image"
    echo "  push     - Push image to Docker Hub"
    echo "  pull     - Pull image from Docker Hub"
    echo "  login    - Login to Docker Hub"
    echo "  status   - Show current images"
    echo "  help     - Show this help message"
    echo ""
    echo "Image: ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
}

build_image() {
    echo "🔨 Building Docker image..."
    docker build -t ${IMAGE_NAME}:latest .
    
    echo "🏷️  Tagging image..."
    docker tag ${IMAGE_NAME}:latest ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
    docker tag ${IMAGE_NAME}:latest ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
    
    echo "✅ Image built and tagged successfully!"
    echo "   Local: ${IMAGE_NAME}:latest"
    echo "   Hub: ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
    echo "   Hub: ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
}

push_image() {
    echo "📤 Pushing image to Docker Hub..."
    
    # Check if user is logged in
    if ! docker info | grep -q "Username"; then
        echo "⚠️  You need to login first. Run: ./docker-hub.sh login"
        exit 1
    fi
    
    echo "Pushing ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}..."
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
    
    echo "Pushing ${DOCKER_USERNAME}/${IMAGE_NAME}:latest..."
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
    
    echo "✅ Images pushed successfully!"
    echo "🌐 Available at: https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"
}

pull_image() {
    echo "📥 Pulling image from Docker Hub..."
    docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
    echo "✅ Image pulled successfully!"
}

login_docker() {
    echo "🔐 Logging into Docker Hub..."
    echo "Please enter your Docker Hub credentials:"
    docker login
    echo "✅ Login successful!"
}

show_status() {
    echo "📊 Current Docker Images:"
    echo "========================"
    docker images | grep -E "(REPOSITORY|${IMAGE_NAME}|${DOCKER_USERNAME})" || echo "No compliance-api images found"
    echo ""
    echo "🏷️  Available tags:"
    echo "   ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
    echo "   ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
}

# Main command handling
case "${1:-help}" in
    "build")
        build_image
        ;;
    "push")
        push_image
        ;;
    "pull")
        pull_image
        ;;
    "login")
        login_docker
        ;;
    "status")
        show_status
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac





