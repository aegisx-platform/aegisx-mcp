#!/bin/bash

# Multi-Instance Environment Setup Script
# Auto-configures ports and container names based on folder name

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Get current folder name
CURRENT_DIR=$(pwd)
FOLDER_NAME=$(basename "$CURRENT_DIR")

print_status "🏗️ Setting up environment for folder: $FOLDER_NAME"

# Extract suffix from folder name
if [[ "$FOLDER_NAME" == "aegisx-starter" ]]; then
    # Main repo - use default ports
    SUFFIX=""
    INSTANCE_NAME="main"
    print_status "📁 Detected main repository"
else
    # Feature repo - extract suffix
    SUFFIX=${FOLDER_NAME#aegisx-starter}
    SUFFIX=${SUFFIX#-}  # Remove leading dash if present
    INSTANCE_NAME=$SUFFIX
    print_status "📁 Detected feature repository: $SUFFIX"
fi

# Calculate ports based on folder suffix
if [ -z "$SUFFIX" ]; then
    # Main repo ports
    POSTGRES_PORT=5432
    REDIS_PORT=6380
    API_PORT=3333
    WEB_PORT=4200
    ADMIN_PORT=4201
    PGADMIN_PORT=5050
    
    # Container names
    POSTGRES_CONTAINER="aegisx_postgres"
    REDIS_CONTAINER="aegisx_redis"
    PGADMIN_CONTAINER="aegisx_pgadmin"
    
    # Volume names
    POSTGRES_VOLUME="postgres_data"
    REDIS_VOLUME="redis_data"
else
    # Feature repo ports - use hash for consistent port assignment
    # Get first 2 characters of MD5 hash and convert to decimal
    HASH=$(echo -n "$SUFFIX" | md5sum | cut -c1-2)
    OFFSET=$((0x$HASH % 50 + 1))  # 1-50 range to avoid conflicts
    
    POSTGRES_PORT=$((5432 + OFFSET))
    REDIS_PORT=$((6380 + OFFSET))
    API_PORT=$((3333 + OFFSET))
    WEB_PORT=$((4200 + OFFSET))
    ADMIN_PORT=$((4201 + OFFSET))
    PGADMIN_PORT=$((5050 + OFFSET))
    
    # Container names with suffix
    POSTGRES_CONTAINER="aegisx_${SUFFIX}_postgres"
    REDIS_CONTAINER="aegisx_${SUFFIX}_redis" 
    PGADMIN_CONTAINER="aegisx_${SUFFIX}_pgadmin"
    
    # Volume names with suffix
    POSTGRES_VOLUME="${SUFFIX}_postgres_data"
    REDIS_VOLUME="${SUFFIX}_redis_data"
fi

print_status "🔧 Port assignments:"
echo "  PostgreSQL: $POSTGRES_PORT"
echo "  Redis: $REDIS_PORT" 
echo "  API: $API_PORT"
echo "  Web: $WEB_PORT"
echo "  Admin: $ADMIN_PORT"
echo "  PgAdmin: $PGADMIN_PORT"

print_status "📦 Container names:"
echo "  PostgreSQL: $POSTGRES_CONTAINER"
echo "  Redis: $REDIS_CONTAINER"
echo "  PgAdmin: $PGADMIN_CONTAINER"

# Check for and handle old conflicting containers
print_status "🧹 Checking for conflicting containers..."

# Check if old default containers exist and are running
OLD_CONTAINERS=(aegisx_postgres aegisx_redis aegisx_pgadmin)
FOUND_CONFLICTS=false

for container in "${OLD_CONTAINERS[@]}"; do
    if docker ps -q --filter "name=$container" | grep -q .; then
        print_warning "Found running container: $container"
        FOUND_CONFLICTS=true
    elif docker ps -aq --filter "name=$container" | grep -q .; then
        print_warning "Found stopped container: $container"
        FOUND_CONFLICTS=true
    fi
done

if [ "$FOUND_CONFLICTS" = true ]; then
    print_warning "Conflicting containers detected. These may block ports needed for this instance."
    echo "To avoid port conflicts, we recommend stopping old containers:"
    echo "  docker stop aegisx_postgres aegisx_redis aegisx_pgadmin 2>/dev/null || true"
    echo "  docker rm aegisx_postgres aegisx_redis aegisx_pgadmin 2>/dev/null || true"
    echo ""
    echo "Or use the port manager script: ./scripts/port-manager.sh stop-all"
    echo ""
fi

# Generate .env.local file
print_status "📄 Generating .env.local..."

cat > .env.local << EOF
# Auto-generated environment for instance: $INSTANCE_NAME
# Generated on: $(date)
# Folder: $FOLDER_NAME

# Instance Configuration
INSTANCE_NAME=$INSTANCE_NAME
INSTANCE_SUFFIX=$SUFFIX

# Application Ports
PORT=$API_PORT
API_PORT=$API_PORT
WEB_PORT=$WEB_PORT
ADMIN_PORT=$ADMIN_PORT

# Database Configuration  
DATABASE_HOST=localhost
DATABASE_PORT=$POSTGRES_PORT
DATABASE_NAME=aegisx_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_URL=postgresql://\${DATABASE_USER}:\${DATABASE_PASSWORD}@\${DATABASE_HOST}:\${DATABASE_PORT}/\${DATABASE_NAME}

# Alternative naming for Docker Compose compatibility
POSTGRES_HOST=localhost
POSTGRES_PORT=$POSTGRES_PORT
POSTGRES_DB=aegisx_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=$REDIS_PORT
REDIS_PASSWORD=
REDIS_URL=redis://\${REDIS_HOST}:\${REDIS_PORT}

# Container Configuration
POSTGRES_CONTAINER=$POSTGRES_CONTAINER
REDIS_CONTAINER=$REDIS_CONTAINER
PGADMIN_CONTAINER=$PGADMIN_CONTAINER
POSTGRES_VOLUME=$POSTGRES_VOLUME
REDIS_VOLUME=$REDIS_VOLUME

# PgAdmin Configuration
PGADMIN_PORT=$PGADMIN_PORT
PGADMIN_DEFAULT_EMAIL=admin@aegisx.local
PGADMIN_DEFAULT_PASSWORD=admin

# JWT Configuration (inherit from .env)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$SUFFIX
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-$SUFFIX

# Frontend URLs
WEB_URL=http://localhost:$WEB_PORT
ADMIN_URL=http://localhost:$ADMIN_PORT
EOF

print_success ".env.local created with instance-specific configuration"

# Generate docker-compose.instance.yml
print_status "🐳 Generating docker-compose.instance.yml..."

cat > docker-compose.instance.yml << EOF
# Instance-specific Docker Compose file for: $INSTANCE_NAME
# Generated on: $(date)
# Folder: $FOLDER_NAME

services:
  postgres:
    image: postgres:15-alpine
    container_name: $POSTGRES_CONTAINER
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: aegisx_db
    ports:
      - '$POSTGRES_PORT:5432'
    volumes:
      - $POSTGRES_VOLUME:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: $REDIS_CONTAINER
    ports:
      - '$REDIS_PORT:6379'
    command: redis-server --appendonly yes
    volumes:
      - $REDIS_VOLUME:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: $PGADMIN_CONTAINER
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@aegisx.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - '$PGADMIN_PORT:80'
    depends_on:
      - postgres

volumes:
  $POSTGRES_VOLUME:
  $REDIS_VOLUME:
EOF

print_success "docker-compose.instance.yml created with instance-specific ports and names"

# Check for port conflicts
print_status "🔍 Checking for port conflicts..."

check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port ($service) is already in use"
        return 1
    else
        print_success "Port $port ($service) is available"
        return 0
    fi
}

CONFLICTS=0
check_port $POSTGRES_PORT "PostgreSQL" || CONFLICTS=1
check_port $REDIS_PORT "Redis" || CONFLICTS=1
check_port $API_PORT "API" || CONFLICTS=1
check_port $WEB_PORT "Web" || CONFLICTS=1
check_port $ADMIN_PORT "Admin" || CONFLICTS=1
check_port $PGLADMIN_PORT "PgAdmin" || CONFLICTS=1

if [ $CONFLICTS -eq 1 ]; then
    print_warning "Some ports are in use. You may need to stop other instances or choose different ports."
    echo ""
    print_status "To check what's using the ports:"
    echo "  lsof -i :$POSTGRES_PORT"
    echo "  lsof -i :$REDIS_PORT"
    echo ""
    print_status "To stop other AegisX instances:"
    echo "  docker-compose down"
    echo ""
fi

# Update port registry
REGISTRY_FILE="$HOME/.aegisx-port-registry"
print_status "📋 Updating port registry..."

# Remove existing entry for this folder
if [ -f "$REGISTRY_FILE" ]; then
    grep -v "^$FOLDER_NAME:" "$REGISTRY_FILE" > "${REGISTRY_FILE}.tmp" || true
    mv "${REGISTRY_FILE}.tmp" "$REGISTRY_FILE"
fi

# Add current entry
echo "$FOLDER_NAME:$POSTGRES_PORT:$REDIS_PORT:$API_PORT:$WEB_PORT:$ADMIN_PORT:$PGADMIN_PORT" >> "$REGISTRY_FILE"

print_success "Environment setup completed!"
echo ""
print_status "🚀 Next steps:"
echo "1. Start services: pnpm run docker:up"
echo "2. Run migrations: pnpm db:migrate"
echo "3. Seed database: pnpm db:seed"  
echo "4. Start development: pnpm dev"
echo ""
print_status "🔗 Access URLs:"
echo "  API: http://localhost:$API_PORT"
echo "  Web: http://localhost:$WEB_PORT"
echo "  Admin: http://localhost:$ADMIN_PORT"
echo "  PgAdmin: http://localhost:$PGADMIN_PORT"
echo ""
print_status "📋 View all instances: cat $REGISTRY_FILE"