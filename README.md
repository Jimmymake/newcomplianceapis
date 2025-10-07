# Compliance API

A comprehensive merchant onboarding and compliance management API built with Node.js, Express, and MongoDB.

## Features

- 🔐 **User Authentication & Authorization** (JWT-based)
- 👥 **Multi-role Support** (Admin, Merchant, User)
- 📋 **Multi-step Onboarding Process**
  - Company Information
  - UBO (Ultimate Beneficial Owner) Details
  - Payment & Processing Information
  - Settlement Bank Details
  - Risk Management
  - KYC Documents
- 📊 **Admin Dashboard** with comprehensive user management
- 📁 **File Upload Support** for documents
- 🔍 **Advanced Search & Filtering**
- 📈 **Progress Tracking & Statistics**
- 🐳 **Docker Support** for easy deployment

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd compliance-api

# Run the setup script
./setup-docker.sh

# Or manually start with Docker Compose
docker-compose up -d
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start MongoDB (make sure it's running)
# Start the application
npm run dev
```

## Docker Setup

This project includes comprehensive Docker support:

- **Production**: Optimized containers with health checks
- **Development**: Hot reload with mounted source code
- **MongoDB**: Persistent database with initialization
- **Mongo Express**: Web-based MongoDB admin interface

### Quick Commands

```bash
# Start production environment
npm run docker:up

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
npm run docker:logs

# Stop services
npm run docker:down

# Clean up everything
npm run docker:clean
```

For detailed Docker documentation, see [DOCKER.md](./DOCKER.md).

## API Endpoints

### Authentication
- `POST /api/user/signup` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/list` - List all users (admin)

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/profiles` - List all profiles (admin)
- `GET /api/user/form-status` - Get form completion status

### Onboarding Steps
- `POST /api/companyinfor` - Company information
- `POST /api/uboinfo` - UBO information
- `POST /api/paymentinfo` - Payment information
- `POST /api/settlementbank` - Settlement bank details
- `POST /api/riskmanagementinfo` - Risk management
- `POST /api/kycinfo` - KYC documents

### Admin & Management
- `GET /api/admin/*` - Admin endpoints
- `GET /api/dashboard/*` - Dashboard endpoints
- `POST /api/upload/*` - File upload endpoints

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `4000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/merchantdb` |
| `JWT_SECRET` | JWT signing secret | Required |

## Project Structure

```
compliance-api/
├── models/              # Database models
├── routes/              # API route handlers
├── middleware/          # Custom middleware
├── uploads/             # File uploads directory
├── docker-compose.yml   # Production Docker setup
├── docker-compose.dev.yml # Development Docker setup
├── Dockerfile           # Production Docker image
├── Dockerfile.dev       # Development Docker image
├── setup-docker.sh      # Docker setup script
└── DOCKER.md           # Docker documentation
```

## Development

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- Docker (optional but recommended)

### Local Setup
```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Start with Docker
./setup-docker.sh
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run docker:up` - Start Docker environment
- `npm run docker:down` - Stop Docker environment
- `npm run docker:logs` - View Docker logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
