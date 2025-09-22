# 🐳 Docker Environment Setup Guide

## Complete Docker Configuration for Stock Management System

This guide provides step-by-step instructions to set up the full-stack stock management system using Docker containers.

---

## 📁 Project Structure

```
stock-management-system/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env
├── nginx/
│   ├── nginx.conf
│   └── nginx.prod.conf
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── requirements.txt
│   ├── app/
│   └── alembic/
├── frontend/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── package.json
│   └── src/
└── database/
    ├── init.sql
    └── sample_data.sql
```

---

## 🚀 Quick Start

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git

### 1. Clone and Setup
```bash
# Create project directory
mkdir stock-management-system
cd stock-management-system

# Create environment file
cp .env.example .env
# Edit .env with your configurations
```

### 2. Run Development Environment
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### 3. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432

---

## 📋 Docker Compose Files

### Development Environment (docker-compose.yml)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: stock_management_db
    environment:
      POSTGRES_DB: ${DB_NAME:-stock_management}
      POSTGRES_USER: ${DB_USER:-stockuser}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-stockpass123}
      POSTGRES_HOST_AUTH_METHOD: trust
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/01_init.sql
      - ./database/sample_data.sql:/docker-entrypoint-initdb.d/02_sample_data.sql
    ports:
      - "${DB_PORT:-5432}:5432"
    networks:
      - stock_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-stockuser} -d ${DB_NAME:-stock_management}"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  # Redis Cache (Optional)
  redis:
    image: redis:7-alpine
    container_name: stock_management_redis
    ports:
      - "${REDIS_PORT:-6379}:6379"
    networks:
      - stock_network
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: stock_management_api
    environment:
      DATABASE_URL: postgresql://${DB_USER:-stockuser}:${DB_PASSWORD:-stockpass123}@postgres:5432/${DB_NAME:-stock_management}
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY:-dev-secret-key-change-in-production}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
      CORS_ORIGINS: http://localhost:3000,http://127.0.0.1:3000
      DEBUG: "true"
    volumes:
      - ./backend:/app
      - /app/.venv  # Exclude virtual environment from volume
    ports:
      - "${API_PORT:-8000}:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - stock_network
    command: >
      sh -c "
        echo 'Waiting for database...' &&
        python -c 'import time; import psycopg2; 
        while True:
          try: 
            psycopg2.connect(host=\"postgres\", database=\"stock_management\", user=\"stockuser\", password=\"stockpass123\"); 
            break
          except psycopg2.OperationalError: 
            time.sleep(1)' &&
        echo 'Database ready!' &&
        alembic upgrade head &&
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
      "

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: stock_management_frontend
    environment:
      REACT_APP_API_URL: http://localhost:${API_PORT:-8000}/api
      REACT_APP_WS_URL: ws://localhost:${API_PORT:-8000}/ws
      CHOKIDAR_USEPOLLING: "true"
      WATCHPACK_POLLING: "true"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    depends_on:
      - backend
    networks:
      - stock_network
    stdin_open: true
    tty: true

  # pgAdmin (Optional - Database Management)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: stock_management_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@stockmanagement.com
      PGADMIN_DEFAULT_PASSWORD: admin123
      PGADMIN_CONFIG_SERVER_MODE: "False"
    ports:
      - "${PGADMIN_PORT:-5050}:80"
    depends_on:
      - postgres
    networks:
      - stock_network
    profiles:
      - tools

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  stock_network:
    driver: bridge
    name: stock_management_network
```

### Production Environment (docker-compose.prod.yml)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: stock_management_db_prod
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/01_init.sql
    networks:
      - stock_network_prod
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: stock_management_redis_prod
    networks:
      - stock_network_prod
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data_prod:/data

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: stock_management_api_prod
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: ${TOKEN_EXPIRE_MINUTES:-60}
      DEBUG: "false"
      CORS_ORIGINS: ${FRONTEND_URL}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - stock_network_prod
    restart: unless-stopped
    command: >
      sh -c "
        alembic upgrade head &&
        gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
      "

  # React Frontend (Built)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        REACT_APP_API_URL: ${FRONTEND_API_URL}
    container_name: stock_management_frontend_prod
    depends_on:
      - backend
    networks:
      - stock_network_prod
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: stock_management_nginx_prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - backend
      - frontend
    networks:
      - stock_network_prod
    restart: unless-stopped

volumes:
  postgres_data_prod:
    driver: local
  redis_data_prod:
    driver: local

networks:
  stock_network_prod:
    driver: bridge
```

---

## 🔧 Dockerfile Configurations

### Backend Dockerfile (Development)

```dockerfile
# Multi-stage build for FastAPI backend
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Development stage
FROM base as development

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install development dependencies
COPY requirements.dev.txt .
RUN pip install -r requirements.dev.txt

# Copy application code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Development command (with reload)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### Backend Dockerfile (Production)

```dockerfile
# Production Dockerfile for FastAPI backend
FROM python:3.11-slim as base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Build stage
FROM base as builder

WORKDIR /build

COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Production stage
FROM base as production

WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Production command with Gunicorn
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

### Frontend Dockerfile (Development)

```dockerfile
# Development Dockerfile for React frontend
FROM node:18-alpine as development

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

EXPOSE 3000

# Development server with hot reload
CMD ["npm", "start"]
```

### Frontend Dockerfile (Production)

```dockerfile
# Multi-stage build for React frontend
FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine as production

# Copy built app
COPY --from=builder /app/build /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## ⚙️ Environment Configuration

### .env File

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=stock_management
DB_USER=stockuser
DB_PASSWORD=stockpass123

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_secure_password

# Application Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
TOKEN_EXPIRE_MINUTES=60
DEBUG=true

# API Configuration
API_PORT=8000
FRONTEND_PORT=3000
PGADMIN_PORT=5050

# Production URLs (for production environment)
FRONTEND_URL=https://your-domain.com
FRONTEND_API_URL=https://api.your-domain.com/api

# SSL Configuration (Production)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/private.key

# Backup Configuration
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
```

### .env.example

```bash
# Copy this file to .env and update with your values

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=stock_management
DB_USER=stockuser
DB_PASSWORD=CHANGE_THIS_PASSWORD

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD

# Application Configuration
SECRET_KEY=CHANGE_THIS_SECRET_KEY_TO_SOMETHING_SECURE
TOKEN_EXPIRE_MINUTES=60
DEBUG=false

# Ports
API_PORT=8000
FRONTEND_PORT=3000
PGADMIN_PORT=5050

# Production Configuration
FRONTEND_URL=https://your-domain.com
FRONTEND_API_URL=https://api.your-domain.com/api
```

---

## 🌐 Nginx Configuration

### Development Nginx (nginx/nginx.conf)

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend proxy
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket support for development
        location /ws {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

### Production Nginx (nginx/nginx.prod.conf)

```nginx
events {
    worker_connections 2048;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    upstream backend {
        server backend:8000;
        keepalive 32;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/private.key;
        ssl_session_timeout 1d;
        ssl_session_cache shared:MozTLS:10m;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header Strict-Transport-Security "max-age=63072000" always;
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;";

        # Static files from React build
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Authentication endpoints with stricter rate limiting
        location /api/auth/ {
            limit_req zone=auth burst=10 nodelay;
            proxy_pass http://backend;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## 🗄️ Database Initialization

### Database Schema (database/init.sql)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database schema
CREATE SCHEMA IF NOT EXISTS stock_management;

-- Set search path
SET search_path TO stock_management, public;

-- Create tables (from technical specifications)
-- [Include all table creation scripts from TECHNICAL_SPECIFICATIONS.md]

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_gin 
ON products USING gin(to_tsvector('english', name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_date_product 
ON stock_transactions(transaction_date, product_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_stock_category 
ON products(current_stock, category) WHERE status = 'active';

-- Create materialized view for dashboard stats
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'active') as total_products,
    SUM(current_stock * unit_price) FILTER (WHERE status = 'active') as total_inventory_value,
    COUNT(*) FILTER (WHERE current_stock <= min_stock_level AND status = 'active') as low_stock_count,
    CURRENT_TIMESTAMP as last_updated
FROM products;

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA stock_management TO stockuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA stock_management TO stockuser;
```

### Sample Data (database/sample_data.sql)

```sql
-- Insert sample data (from technical specifications)
-- [Include all sample data insertion scripts]

-- Refresh materialized view
SELECT refresh_dashboard_stats();
```

---

## 🚀 Deployment Commands

### Development Deployment

```bash
# Start all services
docker-compose up --build

# Start specific services
docker-compose up postgres redis

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec postgres psql -U stockuser -d stock_management

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: Data will be lost)
docker-compose down -v
```

### Production Deployment

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Update application (zero-downtime deployment)
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
```

---

## 🔍 Monitoring and Maintenance

### Health Check Scripts

**scripts/health-check.sh**
```bash
#!/bin/bash

# Health check script
echo "Checking application health..."

# Check database
docker-compose exec -T postgres pg_isready -U stockuser -d stock_management
if [ $? -eq 0 ]; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is not responding"
    exit 1
fi

# Check backend API
curl -f http://localhost:8000/health || {
    echo "❌ Backend API is not responding"
    exit 1
}
echo "✅ Backend API is healthy"

# Check frontend
curl -f http://localhost:3000 || {
    echo "❌ Frontend is not responding"
    exit 1
}
echo "✅ Frontend is healthy"

echo "🎉 All services are healthy!"
```

### Backup Script

**scripts/backup.sh**
```bash
#!/bin/bash

# Database backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="stock_management"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database dump
docker-compose exec -T postgres pg_dump -U stockuser $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### Monitoring with Docker Compose Override

**docker-compose.override.yml** (for monitoring)
```yaml
version: '3.8'

services:
  # Prometheus monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: stock_management_prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - stock_network

  # Grafana dashboards
  grafana:
    image: grafana/grafana:latest
    container_name: stock_management_grafana
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    networks:
      - stock_network
    depends_on:
      - prometheus

volumes:
  grafana_data:
```

---

## 🛠️ Troubleshooting Guide

### Common Issues and Solutions

#### 1. Database Connection Issues
```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Connect to database manually
docker-compose exec postgres psql -U stockuser -d stock_management

# Reset database (WARNING: Data loss)
docker-compose down -v
docker-compose up postgres
```

#### 2. Frontend Build Issues
```bash
# Clear node_modules and rebuild
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm install

# Rebuild frontend container
docker-compose build --no-cache frontend
```

#### 3. Backend API Issues
```bash
# Check API logs
docker-compose logs backend

# Check if migrations are applied
docker-compose exec backend alembic current

# Apply migrations manually
docker-compose exec backend alembic upgrade head

# Check API health
curl http://localhost:8000/health
```

#### 4. Port Conflicts
```bash
# Check what's using the port
lsof -i :8000
lsof -i :3000

# Change ports in .env file or docker-compose.yml
```

#### 5. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker socket permissions (Linux)
sudo chmod 666 /var/run/docker.sock
```

---

## 📊 Performance Optimization

### Docker Performance Tips

```yaml
# Production optimizations in docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Nginx Caching Configuration
```nginx
# Add to nginx.prod.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m 
                 inactive=60m use_temp_path=off;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
}
```

---

## 🔐 Security Considerations

### Security Headers
```nginx
# Add to nginx configuration
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline';";
```

### Environment Variable Security
```bash
# Use Docker secrets in production
echo "your-secret-password" | docker secret create db_password -
```

### Network Security
```yaml
# Restrict network access
networks:
  stock_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

This comprehensive Docker setup guide provides everything needed to deploy and maintain the stock management system in both development and production environments.