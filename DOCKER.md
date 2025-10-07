# Docker Setup for Compliance API

This document explains how to run the Compliance API using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Production Setup

```bash
# Build and start all services
npm run docker:up

# Or manually:
docker-compose up -d
```

### 2. Development Setup

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d
```

## Services

The Docker setup includes the following services:

### 1. **compliance-api** (Port 4000)
- Main Node.js application
- Handles all API endpoints
- Connects to MongoDB

### 2. **mongodb** (Port 27017)
- MongoDB database
- Persistent data storage
- Initialized with proper indexes

### 3. **mongo-express** (Port 8081)
- MongoDB web interface
- Username: `admin`
- Password: `admin123`
- Access: http://localhost:8081

## Available Commands

```bash
# Build the Docker image
npm run docker:build

# Start all services (detached)
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Restart the API service
npm run docker:restart

# Clean up (remove containers and volumes)
npm run docker:clean
```

## Manual Docker Commands

```bash
# Build the image
docker build -t compliance-api .

# Run the container
docker run -p 4000:4000 compliance-api

# Start with docker-compose
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f compliance-api

# Execute commands in running container
docker-compose exec compliance-api sh
```

## Environment Variables

The application uses the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `4000` | Application port |
| `MONGO_URI` | MongoDB connection string | Database connection |
| `JWT_SECRET` | Required | JWT signing secret |

## Database Configuration

### Production
- **Host**: `mongodb` (container name)
- **Port**: `27017`
- **Database**: `merchantdb`
- **Username**: `admin`
- **Password**: `password123`

### Connection String
```
mongodb://admin:password123@mongodb:27017/merchantdb?authSource=admin
```

## Volumes

- **mongodb_data**: Persistent MongoDB data
- **./uploads**: File uploads directory (mounted to host)

## Development vs Production

### Production (`docker-compose.yml`)
- Optimized Node.js image
- No source code mounting
- Production dependencies only
- Health checks enabled

### Development (`docker-compose.dev.yml`)
- Source code mounted for hot reload
- All dependencies installed
- Nodemon for automatic restarts
- Development-friendly configuration

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :4000
   
   # Stop the process or change the port in docker-compose.yml
   ```

2. **MongoDB connection issues**
   ```bash
   # Check if MongoDB is running
   docker-compose ps
   
   # View MongoDB logs
   docker-compose logs mongodb
   ```

3. **Permission issues with uploads**
   ```bash
   # Fix upload directory permissions
   sudo chown -R $USER:$USER uploads/
   chmod 755 uploads/
   ```

### Useful Commands

```bash
# Check running containers
docker ps

# Check container logs
docker logs compliance-api

# Access container shell
docker exec -it compliance-api sh

# Check MongoDB connection
docker exec -it compliance-mongodb mongosh -u admin -p password123

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and start fresh
docker-compose down -v
docker system prune -f
docker-compose up -d
```

## API Access

Once running, the API will be available at:

- **API**: http://localhost:4000
- **Health Check**: http://localhost:4000/
- **MongoDB Admin**: http://localhost:8081

## Security Notes

⚠️ **Important**: Change the default passwords and secrets before deploying to production!

1. Update `JWT_SECRET` in docker-compose.yml
2. Change MongoDB credentials
3. Update mongo-express credentials
4. Use environment files for sensitive data

## File Structure

```
compliance-api/
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── docker-compose.yml      # Production compose file
├── docker-compose.dev.yml  # Development compose file
├── .dockerignore           # Files to exclude from Docker build
├── mongo-init.js           # MongoDB initialization script
├── env.example             # Environment variables template
└── DOCKER.md               # This documentation
```



