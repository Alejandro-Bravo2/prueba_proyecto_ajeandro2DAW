# ============================================================================

# COFIRA - Installation Guide

# ============================================================================

## 📋 Prerequisites

- **Node.js** >= 20.x
- **Java** >= 17
- **Docker** and **Docker Compose**
- **PostgreSQL** 16+ (or use Docker)
- **Git**

## 🚀 Quick Start with Docker

The fastest way to run the entire application:

```bash
# Clone the repository
git clone https://github.com/Alejandro-Bravo2/proyecto_angular_DWEC_alejandrobravo.git
cd proyecto_angular_DWEC_alejandrobravo

# Copy environment file
cp .env.example .env

# Edit .env with your values (optional for development)
nano .env

# Start all services
docker-compose up -d
```

Access the application:

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8080
- **API Documentation:** http://localhost:8080/swagger-ui.html
- **PgAdmin:** http://localhost:5050

## 🛠️ Development Setup

### 1. Environment Configuration

```bash
# Create .env file from template
cp .env.example .env

# Generate a secure JWT secret
openssl rand -hex 64

# Edit .env and update:
# - JWT_SECRET with generated value
# - Database credentials
# - Other environment variables
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)

```bash
docker-compose up -d postgres pgadmin
```

#### Option B: Local PostgreSQL

```bash
# Create database
psql -U postgres
CREATE DATABASE cofira;
CREATE USER admin WITH PASSWORD 'admin123';
GRANT ALL PRIVILEGES ON DATABASE cofira TO admin;
\q
```

### 3. Backend Setup

```bash
cd backend

# Make gradlew executable
chmod +x gradlew

# Build the project
./gradlew build

# Run the application
./gradlew bootRun

# Or with environment variables
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/cofira \
SPRING_DATASOURCE_USERNAME=admin \
SPRING_DATASOURCE_PASSWORD=admin123 \
JWT_SECRET=your_secret_here \
./gradlew bootRun
```

### 4. Frontend Setup

```bash
cd cofira-app

# Install dependencies
npm install

# Start development server
npm start

# Or run with backend proxy
npm run dev
```

## 🧪 Running Tests

### Frontend Tests

```bash
cd cofira-app

# Unit tests
npm test

# Tests with coverage
npm run test:coverage

# E2E tests (requires Cypress)
npm run e2e
```

### Backend Tests

```bash
cd backend

# Run all tests
./gradlew test

# With coverage
./gradlew test jacocoTestReport
```

## 📦 Building for Production

### Frontend

```bash
cd cofira-app
npm run build

# Output will be in dist/cofira-app/browser
```

### Backend

```bash
cd backend
./gradlew bootJar

# JAR will be in build/libs/
```

### Docker Images

```bash
# Build frontend image
docker build -t cofira-frontend:latest ./cofira-app

# Build backend image
docker build -t cofira-backend:latest ./backend

# Or build everything
docker-compose build
```

## 🌐 Production Deployment

### Using Docker

```bash
# Pull latest images
docker pull ghcr.io/alejandro-bravo2/proyecto_angular_dwec_alejandrobravo/cofira-frontend:latest
docker pull ghcr.io/alejandro-bravo2/proyecto_angular_dwec_alejandrobravo/cofira-backend:latest

# Run with production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

#### Frontend (Nginx)

```bash
# Build
cd cofira-app
npm run build

# Copy to web server
scp -r dist/cofira-app/browser/* user@server:/var/www/cofira

# Configure Nginx (see nginx.conf)
```

#### Backend (Systemd Service)

```bash
# Build JAR
cd backend
./gradlew bootJar

# Copy to server
scp build/libs/cofira-*.jar user@server:/opt/cofira/

# Create systemd service (see deployment docs)
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Application
NODE_ENV=production
APP_NAME=Cofira

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cofira
DB_USERNAME=admin
DB_PASSWORD=secure_password_here

# Security
JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRATION_MS=86400000

# Backend
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=production

# Frontend
ANGULAR_PORT=4200
API_URL=https://api.yourdomain.com
```

### Database Migrations

```bash
# The application uses Hibernate with ddl-auto=update
# For production, use migrations:

# 1. Set ddl-auto=validate in application.properties
# 2. Use Flyway or Liquibase for migrations
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (64+ characters)
- [ ] Use HTTPS for all connections
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Backup database regularly

## 📊 Monitoring

### Health Checks

- **Frontend:** http://localhost/health
- **Backend:** http://localhost:8080/actuator/health

### Metrics

Access backend metrics:

```bash
curl http://localhost:8080/actuator/metrics
```

### Logs

```bash
# Frontend (Docker)
docker logs cofira-frontend

# Backend (Docker)
docker logs cofira-backend

# All services
docker-compose logs -f
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs cofira-postgres

# Test connection
psql -h localhost -U admin -d cofira
```

### Port Conflicts

```bash
# Check what's using a port
lsof -i :4200
lsof -i :8080
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Clean Docker system
docker system prune -a

# Rebuild images
docker-compose build --no-cache

# Reset volumes
docker-compose down -v
```

## 📚 Additional Resources

- [API Documentation](./API-DOCS.md)
- [Development Guide](./DEVELOPMENT.md)
- [Architecture Overview](./DESIGN_SYSTEM.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🆘 Support

- **Issues:** https://github.com/Alejandro-Bravo2/proyecto_angular_DWEC_alejandrobravo/issues
- **Discussions:** https://github.com/Alejandro-Bravo2/proyecto_angular_DWEC_alejandrobravo/discussions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
