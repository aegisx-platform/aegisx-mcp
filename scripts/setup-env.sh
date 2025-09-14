#!/bin/bash

# AegisX Multi-Instance Environment Setup Script
# Generates instance-specific configuration for parallel development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Simple hash function for consistent port assignment
simple_hash() {
    local input="$1"
    local hash=0
    for (( i=0; i<${#input}; i++ )); do
        char=$(printf "%d" "'${input:$i:1}")
        hash=$((hash + char))
    done
    echo $((hash % 100))
}

# Get current directory name
CURRENT_DIR=$(basename "$(pwd)")
FOLDER_NAME="$CURRENT_DIR"

print_status "🚀 Setting up AegisX Multi-Instance Environment"
echo "📂 Current folder: $FOLDER_NAME"

# Determine instance configuration
if [[ "$FOLDER_NAME" == "aegisx-starter" ]]; then
    # Main repository - use default ports
    INSTANCE_NAME="main"
    POSTGRES_PORT=5432
    REDIS_PORT=6379
    API_PORT=3333
    WEB_PORT=4200
    ADMIN_PORT=4201
    PGLADMIN_PORT=5050
    
    print_status "📍 Detected main repository - using default ports"
else
    # Feature repository - extract suffix and calculate unique ports
    if [[ "$FOLDER_NAME" =~ ^aegisx-starter-(.+)$ ]]; then
        SUFFIX="${BASH_REMATCH[1]}"
        INSTANCE_NAME=$(echo "$SUFFIX" | tr '-' '_')
        
        print_status "📍 Detected feature repository: $FOLDER_NAME"
        print_status "🔧 Instance suffix: $SUFFIX"
        
        # Calculate hash-based port offsets
        HASH=$(simple_hash "$SUFFIX")
        print_status "🧮 Calculated hash: $HASH"
        
        # Assign unique ports based on hash
        POSTGRES_PORT=$((5432 + HASH + 1))
        REDIS_PORT=$((6379 + HASH + 2))
        API_PORT=$((3333 + HASH + 1))
        WEB_PORT=$((4200 + HASH))
        ADMIN_PORT=$((4201 + HASH))
        PGLADMIN_PORT=$((5050 + HASH + 1))
    else
        print_warning "⚠️  Folder name doesn't match expected pattern 'aegisx-starter-{suffix}'"
        print_warning "Using default ports with fallback suffix"
        SUFFIX="custom"
        INSTANCE_NAME="custom"
        POSTGRES_PORT=5432
        REDIS_PORT=6379
        API_PORT=3333
        WEB_PORT=4200
        ADMIN_PORT=4201
        PGLADMIN_PORT=5050
    fi
fi

# Generate container names and volume names
POSTGRES_CONTAINER="aegisx_${INSTANCE_NAME}_postgres"
REDIS_CONTAINER="aegisx_${INSTANCE_NAME}_redis"
PGLADMIN_CONTAINER="aegisx_${INSTANCE_NAME}_pgladmin"
POSTGRES_VOLUME="${INSTANCE_NAME}_postgres_data"
REDIS_VOLUME="${INSTANCE_NAME}_redis_data"

print_status "🎯 Port assignments:"
echo "  PostgreSQL: $POSTGRES_PORT"
echo "  Redis: $REDIS_PORT"
echo "  API: $API_PORT"
echo "  Web: $WEB_PORT"
echo "  Admin: $ADMIN_PORT"
echo "  PgAdmin: $PGLADMIN_PORT"

print_status "🐳 Container names:"
echo "  PostgreSQL: $POSTGRES_CONTAINER"
echo "  Redis: $REDIS_CONTAINER"
echo "  PgAdmin: $PGLADMIN_CONTAINER"

# Check for and handle old conflicting containers
print_status "🧹 Checking for conflicting containers..."

# Check if old default containers exist and are running
OLD_CONTAINERS=(aegisx_postgres aegisx_redis aegisx_pgladmin)
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
    echo "  docker stop aegisx_postgres aegisx_redis aegisx_pgladmin 2>/dev/null || true"
    echo "  docker rm aegisx_postgres aegisx_redis aegisx_pgladmin 2>/dev/null || true"
    echo ""
    echo "Or use the port manager script: ./scripts/port-manager.sh stop-all"
    echo ""
fi

# Generate .env.local file
print_status "📄 Generating .env.local..."

cat > .env.local << EOF
# Instance configuration for: $INSTANCE_NAME
# Generated on: $(date)
# Folder: $FOLDER_NAME

INSTANCE_NAME=$INSTANCE_NAME
FOLDER_NAME=$FOLDER_NAME

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:$POSTGRES_PORT/aegisx_db
POSTGRES_HOST=localhost
POSTGRES_PORT=$POSTGRES_PORT
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=aegisx_db

# Redis Configuration  
REDIS_URL=redis://localhost:$REDIS_PORT
REDIS_HOST=localhost
REDIS_PORT=$REDIS_PORT

# API Configuration
API_PORT=$API_PORT
API_URL=http://localhost:$API_PORT

# Frontend Configuration
WEB_PORT=$WEB_PORT
ADMIN_PORT=$ADMIN_PORT
WEB_URL=http://localhost:$WEB_PORT
ADMIN_URL=http://localhost:$ADMIN_PORT

# PgAdmin Configuration
PGLADMIN_PORT=$PGLADMIN_PORT
PGLADMIN_URL=http://localhost:$PGLADMIN_PORT

# Docker Configuration
POSTGRES_CONTAINER=$POSTGRES_CONTAINER
REDIS_CONTAINER=$REDIS_CONTAINER
PGLADMIN_CONTAINER=$PGLADMIN_CONTAINER
POSTGRES_VOLUME=$POSTGRES_VOLUME
REDIS_VOLUME=$REDIS_VOLUME
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

  pgladmin:
    image: dpage/pgladmin4:latest
    container_name: $PGLADMIN_CONTAINER
    environment:
      PGLADMIN_DEFAULT_EMAIL: admin@aegisx.local
      PGLADMIN_DEFAULT_PASSWORD: admin
    ports:
      - '$PGLADMIN_PORT:80'
    depends_on:
      - postgres

volumes:
  $POSTGRES_VOLUME:
  $REDIS_VOLUME:
EOF

print_success "docker-compose.instance.yml created with instance-specific ports and names"

# Check for port conflicts
print_status "🔍 Checking for port conflicts..."

PORTS_TO_CHECK=($POSTGRES_PORT $REDIS_PORT $API_PORT $WEB_PORT $ADMIN_PORT $PGLADMIN_PORT)
CONFLICTS_FOUND=false

for port in "${PORTS_TO_CHECK[@]}"; do
    if lsof -ti:$port >/dev/null 2>&1; then
        print_warning "Port $port is already in use"
        CONFLICTS_FOUND=true
    fi
done

if [ "$CONFLICTS_FOUND" = true ]; then
    print_warning "Some ports are already in use. You may need to:"
    echo "  1. Stop conflicting services: ./scripts/port-manager.sh stop-all"
    echo "  2. Use different folder suffix for unique ports"
    echo "  3. Manually stop processes using these ports"
else
    print_success "All assigned ports are available"
fi

# Update port registry
print_status "📊 Updating port registry..."

PORT_REGISTRY_FILE="$HOME/.aegisx-port-registry"
REGISTRY_ENTRY="$INSTANCE_NAME:$POSTGRES_PORT:$REDIS_PORT:$API_PORT:$WEB_PORT:$ADMIN_PORT:$PGLADMIN_PORT:$(date +'%Y-%m-%d_%H:%M')"

# Remove existing entry for this instance
if [ -f "$PORT_REGISTRY_FILE" ]; then
    grep -v "^$INSTANCE_NAME:" "$PORT_REGISTRY_FILE" > "${PORT_REGISTRY_FILE}.tmp" || true
    mv "${PORT_REGISTRY_FILE}.tmp" "$PORT_REGISTRY_FILE"
fi

# Add new entry
echo "$REGISTRY_ENTRY" >> "$PORT_REGISTRY_FILE"

print_success "Environment setup completed!"
echo ""
print_status "🚀 Next steps:"
echo "1. Start services: pnpm run docker:up"
echo "2. Run migrations: pnpm db:migrate"
echo "3. Seed database: pnpm db:seed"
echo "4. Start development:"
echo "   - All apps: pnpm dev"
echo "   - Web only: pnpm dev:web"
echo "   - Admin only: pnpm dev:admin"
echo "   - API only: pnpm dev:api"
echo ""
print_status "🔗 Your applications will be available at:"
echo "  Web App: http://localhost:$WEB_PORT"
echo "  Admin App: http://localhost:$ADMIN_PORT"
echo "  API: http://localhost:$API_PORT"
echo "  PgAdmin: http://localhost:$PGLADMIN_PORT"