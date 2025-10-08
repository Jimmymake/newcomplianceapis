# 🐳 Docker Setup for Compliance API

This project now has **fully integrated MongoDB** with Docker, eliminating the need to run MongoDB externally.

## 📋 Quick Start

### Production Environment
```bash
# Start production environment (MongoDB + API + Mongo Express)
npm run docker:start-prod

# Or using the script directly
./docker-scripts.sh start-prod
```

### Development Environment
```bash
# Start development environment with hot reload
npm run docker:start-dev

# Or using the script directly
./docker-scripts.sh start-dev
```

## 🏗️ Architecture

### Production Setup
- **MongoDB**: `localhost:27017` (with persistent data)
- **API**: `http://localhost:4000`
- **Mongo Express**: `http://localhost:8081` (admin/admin123)

### Development Setup
- **MongoDB**: `localhost:27018` (separate from production)
- **API**: `http://localhost:4000` (with hot reload)
- **Mongo Express**: `http://localhost:8081` (admin/admin123)

## 🛠️ Available Commands

### NPM Scripts
```bash
npm run docker:start-prod    # Start production environment
npm run docker:start-dev     # Start development environment
npm run docker:stop          # Stop all services
npm run docker:status        # Show service status
npm run docker:backup        # Backup MongoDB data
npm run docker:restore       # Restore MongoDB from backup
```

### Direct Script Commands
```bash
./docker-scripts.sh start-prod     # Start production
./docker-scripts.sh start-dev      # Start development
./docker-scripts.sh stop           # Stop all services
./docker-scripts.sh status         # Show status
./docker-scripts.sh logs [service] [env]  # View logs
./docker-scripts.sh restart [service] [env]  # Restart service
./docker-scripts.sh backup         # Backup MongoDB
./docker-scripts.sh restore [path] # Restore from backup
./docker-scripts.sh clean          # Clean all Docker resources
```

## 📁 Project Structure

```
compliance-api/
├── docker/
│   ├── mongodb/
│   │   └── mongod.conf          # MongoDB configuration
│   └── secrets/
│       ├── mongo_root_username.txt
│       └── mongo_root_password.txt
├── docker-compose.yml           # Production setup
├── docker-compose.dev.yml       # Development setup
├── Dockerfile                   # Production image
├── Dockerfile.dev              # Development image
├── docker-scripts.sh           # Management scripts
├── mongo-init.js               # MongoDB initialization
└── uploads/                    # File uploads (mounted)
```

## 🔧 Configuration

### Environment Variables

#### Production (.env)
```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb://admin:password123@mongodb:27017/merchantdb?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### Development
```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://admin:password123@mongodb:27017/merchantdb_dev?authSource=admin
JWT_SECRET=dev-jwt-secret-key
```

### MongoDB Configuration
- **Authentication**: Enabled with admin user
- **Database**: `merchantdb` (production) / `merchantdb_dev` (development)
- **Collections**: Auto-created with proper indexes
- **Persistence**: Data stored in Docker volumes

## 🚀 Usage Examples

### Start Development Environment
```bash
# Start with hot reload
./docker-scripts.sh start-dev

# View API logs
./docker-scripts.sh logs compliance-api development

# Restart MongoDB
./docker-scripts.sh restart mongodb development
```

### Production Deployment
```bash
# Start production environment
./docker-scripts.sh start-prod

# Check status
./docker-scripts.sh status

# View logs
./docker-scripts.sh logs compliance-api production
```

### Database Management
```bash
# Backup database
./docker-scripts.sh backup

# Restore from backup
./docker-scripts.sh restore ./backups/20240115_143022

# Access Mongo Express
# Open http://localhost:8081 (admin/admin123)
```

## 🔒 Security Features

- **Secrets Management**: Database credentials stored in Docker secrets
- **Non-root User**: Application runs as non-root user
- **Network Isolation**: Services communicate through isolated network
- **Health Checks**: Automatic health monitoring
- **Authentication**: MongoDB authentication enabled

## 📊 Monitoring

### Health Checks
- **MongoDB**: Ping check every 30 seconds
- **API**: HTTP health check every 30 seconds
- **Auto-restart**: Services restart automatically on failure

### Logs
```bash
# View all logs
./docker-scripts.sh logs

# View specific service logs
./docker-scripts.sh logs mongodb production
./docker-scripts.sh logs compliance-api development
```

## 🧹 Maintenance

### Clean Up
```bash
# Stop and remove all containers/volumes
./docker-scripts.sh clean

# Remove only stopped containers
docker container prune

# Remove unused images
docker image prune
```

### Backup Strategy
```bash
# Create backup
./docker-scripts.sh backup

# Backup will be created in ./backups/YYYYMMDD_HHMMSS/
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :4000
   lsof -i :27017
   
   # Stop conflicting services
   ./docker-scripts.sh stop
   ```

2. **Permission Issues**
   ```bash
   # Fix script permissions
   chmod +x docker-scripts.sh
   
   # Fix uploads directory
   sudo chown -R $USER:$USER uploads/
   ```

3. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB logs
   ./docker-scripts.sh logs mongodb
   
   # Restart MongoDB
   ./docker-scripts.sh restart mongodb
   ```

### Reset Everything
```bash
# Complete reset
./docker-scripts.sh clean
./docker-scripts.sh start-prod
```

## 📈 Performance

### Optimizations
- **MongoDB**: Configured with proper indexes and caching
- **Node.js**: Production optimizations enabled
- **Docker**: Multi-stage builds for smaller images
- **Volumes**: Persistent data storage

### Resource Usage
- **MongoDB**: ~200MB RAM, 1GB cache
- **API**: ~100MB RAM
- **Total**: ~300MB RAM for full stack

## 🔄 Updates

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
./docker-scripts.sh stop
./docker-scripts.sh start-prod
```

### Update Dependencies
```bash
# Update package.json
npm update

# Rebuild Docker image
docker-compose build --no-cache
```

---

## 🎉 Benefits of This Setup

✅ **No External Dependencies**: Everything runs in Docker  
✅ **Consistent Environment**: Same setup across all machines  
✅ **Easy Development**: Hot reload and separate dev database  
✅ **Production Ready**: Optimized for production deployment  
✅ **Data Persistence**: MongoDB data survives container restarts  
✅ **Easy Management**: Simple scripts for all operations  
✅ **Security**: Proper authentication and network isolation  
✅ **Monitoring**: Health checks and logging built-in  

Your MongoDB is now fully integrated with your project! 🚀
