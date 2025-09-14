# Multi-Instance Docker Workflow Guide

## 🎯 Overview

This guide provides comprehensive documentation for AegisX's revolutionary Multi-Instance Development System that enables developers to work on multiple features simultaneously without any conflicts.

**Key Innovation**: Unlike traditional override approaches, AegisX uses **complete instance-specific Docker Compose files** for true isolation and zero conflicts.

## 🏗️ Architecture Principles

### **Complete Instance Isolation**

- Each development instance gets its own `docker-compose.instance.yml` file
- No shared configurations or dual port mappings
- Predictable port assignment based on folder name
- Container name isolation prevents conflicts

### **Smart Script Integration**

- Package.json scripts automatically detect instance files
- Graceful fallback to base `docker-compose.yml` if no instance file exists
- Zero configuration changes required for existing workflows

## 📊 Workflow Diagrams

### **Multi-Instance Architecture Overview**

```mermaid
graph TB
    subgraph "Developer Machine"
        subgraph "Main Repo"
            A1[aegisx-starter]
            A2[PostgreSQL: 5432]
            A3[Redis: 6379]
            A4[API: 3333]
        end

        subgraph "Feature A Repo"
            B1[aegisx-starter-auth]
            B2[PostgreSQL: 5433]
            B3[Redis: 6381]
            B4[API: 3334]
            B5[docker-compose.instance.yml]
        end

        subgraph "Feature B Repo"
            C1[aegisx-starter-payment]
            C2[PostgreSQL: 5434]
            C3[Redis: 6382]
            C4[API: 3335]
            C5[docker-compose.instance.yml]
        end
    end

    A1 --> A2
    A1 --> A3
    A1 --> A4

    B1 --> B2
    B1 --> B3
    B1 --> B4
    B5 --> B2
    B5 --> B3

    C1 --> C2
    C1 --> C3
    C1 --> C4
    C5 --> C2
    C5 --> C3

    style A1 fill:#e1f5fe
    style B1 fill:#f3e5f5
    style C1 fill:#e8f5e8
    style B5 fill:#fff3e0
    style C5 fill:#fff3e0
```

### **Instance Setup Workflow**

```mermaid
flowchart TD
    A[git clone aegisx-starter-myfeature] --> B[cd aegisx-starter-myfeature]
    B --> C[pnpm setup]

    C --> D{setup-env.sh}
    D --> E[Calculate ports from folder name]
    D --> F[Check for port conflicts]
    D --> G[Generate .env.local]
    D --> H[Generate docker-compose.instance.yml]

    E --> I[Suffix: 'myfeature']
    I --> J[Hash: 47]
    J --> K[PostgreSQL: 5479<br/>Redis: 6426<br/>API: 3380]

    G --> L[Instance-specific<br/>environment variables]
    H --> M[Complete Docker Compose<br/>configuration file]

    L --> N[pnpm run docker:up]
    M --> N
    N --> O[Start isolated containers]

    O --> P[pnpm run db:migrate]
    P --> Q[pnpm run db:seed]
    Q --> R[pnpm dev - Ready for development!]

    style C fill:#4caf50
    style D fill:#ff9800
    style K fill:#2196f3
    style R fill:#4caf50
```

### **Smart Script Detection Flow**

```mermaid
flowchart TD
    A[pnpm run docker:up] --> B{docker-compose.instance.yml exists?}

    B -->|Yes| C[Use Instance File]
    B -->|No| D[Use Base File]

    C --> E[docker-compose -f docker-compose.instance.yml up -d]
    D --> F[docker-compose up -d]

    E --> G[Start with unique ports<br/>and container names]
    F --> H[Start with default ports<br/>and container names]

    G --> I[Instance Isolation ✅]
    H --> J[Standard Setup ✅]

    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#e8f5e8
    style D fill:#f3e5f5
    style I fill:#4caf50
    style J fill:#4caf50
```

### **Port Assignment Algorithm**

```mermaid
flowchart LR
    A[Folder Name:<br/>aegisx-starter-auth] --> B[Extract Suffix:<br/>'auth']
    B --> C[Calculate Hash:<br/>hash('auth') = 33]
    C --> D[Apply to Base Ports]

    D --> E[PostgreSQL:<br/>5432 + 33 + 1 = 5466]
    D --> F[Redis:<br/>6379 + 33 + 2 = 6414]
    D --> G[API:<br/>3333 + 33 + 1 = 3367]
    D --> H[Web:<br/>4200 + 33 = 4233]
    D --> I[Admin:<br/>4201 + 33 = 4234]
    D --> J[PgAdmin:<br/>5050 + 33 + 1 = 5084]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style G fill:#e8f5e8
    style H fill:#e8f5e8
    style I fill:#e8f5e8
    style J fill:#e8f5e8
```

### **Multi-Team Development Scenario**

```mermaid
graph TB
    subgraph "Team Development"
        subgraph "Developer A - Auth Feature"
            A1[aegisx-starter-auth]
            A2[PostgreSQL: 5466]
            A3[Redis: 6414]
            A4[API: 3367]
            A5[Web: 4233]
            A6[Admin: 4234]
        end

        subgraph "Developer B - Payment Feature"
            B1[aegisx-starter-payment]
            B2[PostgreSQL: 5445]
            B3[Redis: 6390]
            B4[API: 3345]
            B5[Web: 4212]
            B6[Admin: 4213]
        end

        subgraph "Developer C - UI Improvements"
            C1[aegisx-starter-ui-fix]
            C2[PostgreSQL: 5478]
            C3[Redis: 6425]
            C4[API: 3378]
            C5[Web: 4245]
            C6[Admin: 4246]
        end

        subgraph "Developer D - Main Branch"
            D1[aegisx-starter]
            D2[PostgreSQL: 5432]
            D3[Redis: 6379]
            D4[API: 3333]
            D5[Web: 4200]
            D6[Admin: 4201]
        end
    end

    subgraph "Shared Resources"
        E[GitHub Repository]
        F[CI/CD Pipeline]
        G[Port Registry<br/>~/.aegisx-port-registry]
    end

    A1 -.-> E
    B1 -.-> E
    C1 -.-> E
    D1 -.-> E

    A1 --> G
    B1 --> G
    C1 --> G
    D1 --> G

    E --> F

    style A1 fill:#ffebee
    style B1 fill:#e8f5e8
    style C1 fill:#e3f2fd
    style D1 fill:#fff3e0
    style G fill:#f3e5f5
```

### **Instance Lifecycle Management**

```mermaid
stateDiagram-v2
    [*] --> Setup: git clone + pnpm setup

    Setup --> Running: pnpm dev
    Setup --> ConfigGenerated: .env.local + docker-compose.instance.yml created

    ConfigGenerated --> Running: pnpm run docker:up

    Running --> Paused: pnpm run docker:down
    Running --> Reset: pnpm run docker:reset
    Running --> Stopped: pnpm run docker:down -v

    Paused --> Running: pnpm run docker:up (resume)
    Reset --> Running: Fresh database, same config
    Stopped --> [*]: Complete cleanup

    Running --> Development: Feature work
    Development --> Running: Continuous development

    note right of Setup
        Generates unique ports
        based on folder name
    end note

    note right of ConfigGenerated
        Instance files are
        git-ignored
    end note

    note right of Paused
        Containers stopped,
        volumes preserved
    end note
```

### **Container Isolation Comparison**

```mermaid
graph LR
    subgraph "Traditional Override Approach"
        A1[docker-compose.yml<br/>Base services]
        A2[docker-compose.override.yml<br/>Port overrides only]
        A1 --> A2
        A2 --> A3[⚠️ Dual port mappings<br/>⚠️ Possible conflicts<br/>⚠️ Shared containers]
    end

    subgraph "AegisX Instance Approach"
        B1[docker-compose.instance.yml<br/>Complete configuration]
        B1 --> B2[✅ Unique ports only<br/>✅ Zero conflicts<br/>✅ Complete isolation]
    end

    style A3 fill:#ffebee
    style B2 fill:#e8f5e8
```

## 🚀 Quick Start

### **1. Clone and Setup Instance**

```bash
# Clone for new feature
git clone git@github.com:aegisx-platform/aegisx-starter.git aegisx-starter-auth-fix

# Navigate and setup
cd aegisx-starter-auth-fix
pnpm setup
```

### **2. Automatic Configuration**

The setup automatically generates:

- `.env.local` - Instance-specific environment variables
- `docker-compose.instance.yml` - Complete Docker Compose configuration

### **3. Start Development**

```bash
# Smart scripts automatically use instance files
pnpm run docker:up
pnpm run db:migrate
pnpm run db:seed
pnpm dev
```

## 📋 Port Assignment Strategy

### **Folder-Based Hashing**

```bash
# Main repository (no suffix)
aegisx-starter/          → PostgreSQL: 5432, Redis: 6379, API: 3333, Web: 4200, Admin: 4201

# Feature repositories (with suffix)
aegisx-starter-auth/     → PostgreSQL: 5466, Redis: 6414, API: 3367, Web: 4233, Admin: 4234
aegisx-starter-payment/  → PostgreSQL: 5445, Redis: 6390, API: 3345, Web: 4212, Admin: 4213
aegisx-starter-ui-fix/   → PostgreSQL: 5478, Redis: 6425, API: 3378, Web: 4245, Admin: 4246
```

### **Port Calculation Algorithm**

```javascript
// Simplified algorithm
const suffix = folderName.split('-').slice(2).join('-'); // Extract suffix
const hash = simpleHash(suffix); // Generate numeric hash
const basePort = 5432;
const instancePort = basePort + (hash % 100) + 1;
```

### **Port Range Allocation**

```
PostgreSQL: 5432-5532   (Base 5432 + 100 instances)
Redis:      6379-6479   (Base 6379 + 100 instances)
API:        3333-3433   (Base 3333 + 100 instances)
Web:        4200-4300   (Base 4200 + 100 instances)
Admin:      4201-4301   (Base 4201 + 100 instances)
PgAdmin:    5050-5150   (Base 5050 + 100 instances)
```

## 🐳 Docker Compose Instance Files

### **Generated Instance File Structure**

```yaml
# docker-compose.instance.yml
# Instance-specific Docker Compose file for: auth-fix
# Generated on: 2025-09-13 09:15:30 +07

services:
  postgres:
    image: postgres:15-alpine
    container_name: aegisx_auth_fix_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: aegisx_db
    ports:
      - '5433:5432'
    volumes:
      - auth_fix_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: aegisx_auth_fix_redis
    ports:
      - '6381:6379'
    command: redis-server --appendonly yes
    volumes:
      - auth_fix_redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: aegisx_auth_fix_pgladmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@aegisx.local
      PGLADMIN_DEFAULT_PASSWORD: admin
    ports:
      - '5051:80'
    depends_on:
      - postgres

volumes:
  auth_fix_postgres_data:
  auth_fix_redis_data:
```

### **Key Differences from Override Approach**

| Aspect                | Override Approach        | Instance File Approach    |
| --------------------- | ------------------------ | ------------------------- |
| **File Strategy**     | Extends base file        | Complete standalone file  |
| **Port Conflicts**    | Possible dual mappings   | Zero conflicts guaranteed |
| **Container Names**   | Shared + overrides       | Completely unique         |
| **Volume Isolation**  | Manual configuration     | Automatic separation      |
| **Script Complexity** | Complex condition checks | Simple file detection     |

## 📝 Smart Package.json Scripts

### **Auto-Detection Logic**

```json
{
  "scripts": {
    "docker:up": "if [ -f docker-compose.instance.yml ]; then docker-compose -f docker-compose.instance.yml up -d; else docker-compose up -d; fi",
    "docker:down": "if [ -f docker-compose.instance.yml ]; then docker-compose -f docker-compose.instance.yml down; else docker-compose down; fi",
    "docker:reset": "if [ -f docker-compose.instance.yml ]; then docker-compose -f docker-compose.instance.yml down -v && docker-compose -f docker-compose.instance.yml up -d; else docker-compose down -v && docker-compose up -d; fi"
  }
}
```

### **Script Behavior**

```bash
# In main repository (no instance file)
pnpm run docker:up  # Uses docker-compose.yml

# In feature repository (has instance file)
pnpm run docker:up  # Uses docker-compose.instance.yml

# Seamless experience in both cases
```

## 🔧 Environment Configuration

### **Generated .env.local**

```bash
# Instance configuration for: auth-fix
INSTANCE_NAME=auth_fix
FOLDER_NAME=aegisx-starter-auth-fix

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/aegisx_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DATABASE=aegisx_db

# Redis Configuration
REDIS_URL=redis://localhost:6381
REDIS_HOST=localhost
REDIS_PORT=6381

# API Configuration
API_PORT=3334
API_URL=http://localhost:3334

# Frontend Configuration
WEB_PORT=4200
ADMIN_PORT=4201
WEB_URL=http://localhost:4200
ADMIN_URL=http://localhost:4201

# PgAdmin Configuration
PGADMIN_PORT=5051

# Docker Configuration
POSTGRES_CONTAINER=aegisx_auth_fix_postgres
REDIS_CONTAINER=aegisx_auth_fix_redis
PGADMIN_CONTAINER=aegisx_auth_fix_pgadmin
POSTGRES_VOLUME=auth_fix_postgres_data
REDIS_VOLUME=auth_fix_redis_data
```

### **Environment Hierarchy**

```
.env.local (instance-specific)
↓ (overrides)
.env (shared defaults)
↓ (system fallback)
environment variables
```

## 🎮 Development Workflows

### **Single Feature Development**

```bash
# Standard workflow - works with instance files automatically
git clone git@github.com:aegisx-platform/aegisx-starter.git my-feature
cd my-feature
pnpm setup          # Generates instance config
pnpm dev            # Starts with unique ports
```

### **Multi-Feature Development**

```bash
# Terminal 1: Feature A
cd aegisx-starter-auth
pnpm dev            # PostgreSQL:5466, API:3367, Web:4233, Admin:4234

# Terminal 2: Feature B
cd aegisx-starter-payment
pnpm dev            # PostgreSQL:5445, API:3345, Web:4212, Admin:4213

# Terminal 3: Bug Fix
cd aegisx-starter-hotfix
pnpm dev            # PostgreSQL:5478, API:3378, Web:4245, Admin:4246
```

### **Team Development Scenarios**

#### **Scenario 1: Shared Feature Branch**

```bash
# Team member 1
git clone git@github.com:aegisx-platform/aegisx-starter.git aegisx-starter-dashboard
cd aegisx-starter-dashboard
git checkout -b feature/dashboard-redesign

# Team member 2 (same feature)
git clone git@github.com:aegisx-platform/aegisx-starter.git aegisx-starter-dashboard
cd aegisx-starter-dashboard
git checkout feature/dashboard-redesign

# Both get identical port assignments: PostgreSQL:5466, Redis:6414, Web:4233, etc.
```

#### **Scenario 2: Different Feature Branches**

```bash
# Developer A - Authentication
cd aegisx-starter-auth     → PostgreSQL:5466, Redis:6414, Web:4233, Admin:4234

# Developer B - Payment Integration
cd aegisx-starter-payment  → PostgreSQL:5445, Redis:6390, Web:4212, Admin:4213

# Developer C - UI Improvements
cd aegisx-starter-ui       → PostgreSQL:5478, Redis:6425, Web:4245, Admin:4246
```

## 📊 Management & Monitoring

### **Port Registry System**

```bash
# Global registry at ~/.aegisx-port-registry
cat ~/.aegisx-port-registry

# Example output:
auth:5466:6414:3367:4233:4234:5084:2025-09-13_09:15
payment:5445:6390:3345:4212:4213:5058:2025-09-13_10:22
ui-fix:5478:6425:3378:4245:4246:5091:2025-09-13_11:18
```

### **Instance Management Commands**

```bash
# List all active instances
./scripts/port-manager.sh list

# Check port conflicts
./scripts/port-manager.sh check-conflicts

# Stop specific instance
./scripts/port-manager.sh stop auth

# Stop all instances
./scripts/port-manager.sh stop-all

# Clean up unused resources
./scripts/port-manager.sh cleanup
```

### **Container Monitoring**

```bash
# View all AegisX containers
docker ps --filter "name=aegisx" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

# View specific instance containers
docker ps --filter "name=aegisx_auth" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

# Monitor container logs
docker logs -f aegisx_auth_fix_postgres
docker logs -f aegisx_payment_redis
```

## 🛠️ Troubleshooting

### **Port Conflicts**

```bash
# Check what's using a port
lsof -i :5433

# Stop conflicting containers
docker stop aegisx_postgres aegisx_redis aegisx_pgadmin 2>/dev/null || true
docker rm aegisx_postgres aegisx_redis aegisx_pgadmin 2>/dev/null || true

# Or use port manager
./scripts/port-manager.sh stop-all
```

### **Instance File Not Found**

```bash
# Problem: pnpm run docker:up fails with "docker-compose.instance.yml not found"

# Solution: Generate instance configuration
pnpm run setup:env

# Verify files created
ls -la docker-compose.instance.yml .env.local

# Then start services
pnpm run docker:up
```

### **Container Name Conflicts**

```bash
# Problem: Container name already exists

# Solution: Stop old containers
docker stop aegisx_auth_fix_postgres
docker rm aegisx_auth_fix_postgres

# Or regenerate with new name
rm -f .env.local docker-compose.instance.yml
pnpm run setup:env
```

### **Database Connection Issues**

```bash
# Check if PostgreSQL is running on correct port
docker ps --filter "name=postgres" --format "table {{.Names}}\t{{.Ports}}"

# Test connection
psql -h localhost -p 5433 -U postgres -d aegisx_db

# Verify environment variables
cat .env.local | grep POSTGRES
```

## 🔄 CI/CD Integration

### **Build Matrix Strategy**

```yaml
# .github/workflows/multi-instance-test.yml
name: Multi-Instance Testing

on:
  pull_request:
    branches: [main, develop]

jobs:
  test-instances:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        instance: [auth, payment, dashboard, mobile-api]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Instance Environment
        run: |
          # Simulate instance folder name
          export FOLDER_NAME="aegisx-starter-${{ matrix.instance }}"
          ./scripts/setup-env.sh

      - name: Start Instance Services
        run: |
          pnpm run docker:up
          sleep 10

      - name: Run Tests
        run: |
          pnpm run db:migrate
          pnpm run db:seed
          pnpm test

      - name: Cleanup Instance
        run: |
          pnpm run docker:down -v
```

### **Production Deployment**

```yaml
# Multi-instance approach for staging environments
staging-auth:
  image: ghcr.io/aegisx-platform/aegisx-starter/api:auth-${VERSION}
  ports:
    - '3334:3000'

staging-payment:
  image: ghcr.io/aegisx-platform/aegisx-starter/api:payment-${VERSION}
  ports:
    - '3335:3000'
```

## 🎯 Best Practices

### **1. Consistent Naming Convention**

```bash
# Good: Clear feature identification
aegisx-starter-user-auth
aegisx-starter-payment-integration
aegisx-starter-mobile-api

# Avoid: Generic names that don't scale
aegisx-starter-fix
aegisx-starter-new
aegisx-starter-test
```

### **2. Instance Lifecycle Management**

```bash
# Start instance
cd aegisx-starter-auth
pnpm setup                # Generate instance config
pnpm dev                  # Start development with dynamic ports

# Pause instance (preserve data)
pnpm run docker:down      # Stop containers, keep volumes

# Resume instance
pnpm run docker:up        # Restart with same config

# Reset instance (lose data)
pnpm run docker:reset     # Fresh database

# Cleanup instance
pnpm run docker:down -v   # Remove everything
rm -f .env.local docker-compose.instance.yml
```

### **3. Team Coordination**

```bash
# Share instance configuration via docs
echo "Feature: Authentication Module" > README.md
echo "Instance: aegisx-starter-auth" >> README.md
echo "PostgreSQL: 5433, API: 3334" >> README.md

# Document active instances in team chat
#team-dev: Working on auth (instance: auth, ports: 5433/3334)
```

### **4. Resource Management**

```bash
# Weekly cleanup routine
./scripts/port-manager.sh stop-all
./scripts/port-manager.sh cleanup
docker system prune -f
docker volume prune -f

# Instance audit
./scripts/port-manager.sh list | grep $(date -d "7 days ago" +%Y-%m)
```

## 🔐 Security Considerations

### **Development Environment Security**

- Instance files are git-ignored (no credentials in repo)
- Each instance uses separate databases (data isolation)
- Container networks are isolated per instance
- Default credentials only for development

### **Production Considerations**

```yaml
# Production deployment uses separate secrets
api-auth:
  environment:
    DATABASE_URL: ${AUTH_DATABASE_URL}
    JWT_SECRET: ${AUTH_JWT_SECRET}

api-payment:
  environment:
    DATABASE_URL: ${PAYMENT_DATABASE_URL}
    STRIPE_SECRET: ${PAYMENT_STRIPE_SECRET}
```

## 📈 Performance Optimization

### **Resource Allocation Per Instance**

```yaml
# docker-compose.instance.yml
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### **Development vs Production Resources**

```bash
# Development: Light resource usage
- PostgreSQL: 256MB RAM, 0.25 CPU
- Redis: 64MB RAM, 0.1 CPU
- API: 512MB RAM, 0.5 CPU

# Production: Full resource allocation
- PostgreSQL: 4GB RAM, 2 CPU
- Redis: 1GB RAM, 1 CPU
- API: 2GB RAM, 1 CPU
```

## 📚 Advanced Usage

### **Custom Instance Templates**

```bash
# Create template for specific feature types
mkdir templates/
cp docker-compose.instance.yml templates/microservice-template.yml

# Use template for new instances
./scripts/setup-env.sh --template=microservice
```

### **Multi-Environment Instances**

```bash
# Development
aegisx-starter-auth-dev     → PostgreSQL: 5433

# Staging
aegisx-starter-auth-staging → PostgreSQL: 5443

# Production
aegisx-starter-auth-prod    → PostgreSQL: 5453
```

### **Integration with Docker Swarm**

```yaml
# docker-stack-instances.yml
version: '3.8'

services:
  api-auth:
    image: ghcr.io/aegisx-platform/api:latest
    deploy:
      replicas: 2
      placement:
        constraints:
          - node.labels.instance == auth

  api-payment:
    image: ghcr.io/aegisx-platform/api:latest
    deploy:
      replicas: 3
      placement:
        constraints:
          - node.labels.instance == payment
```

## 🎉 Conclusion

AegisX's Multi-Instance Docker Workflow revolutionizes parallel development by providing:

- **Zero Conflicts**: Complete instance isolation with unique ports and containers
- **Predictable Behavior**: Consistent port assignment based on folder names
- **Developer Experience**: One-command setup with smart script detection
- **Scalable Architecture**: Support for unlimited parallel development instances
- **Production Ready**: Seamless transition from development to production deployment

This system eliminates the complexity of traditional Docker override approaches while providing superior isolation and predictability for enterprise development teams.

---

**Next Steps:**

- Review the [Multi-Instance Setup Guide](../development/multi-instance-setup.md) for detailed configuration
- Check [Multi-Instance Commands Reference](../references/multi-instance-commands.md) for all available commands
- Explore [CI/CD Setup Guide](./ci-cd-setup.md) for production deployment strategies
