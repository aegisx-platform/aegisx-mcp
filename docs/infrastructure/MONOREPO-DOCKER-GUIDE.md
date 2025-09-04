# Monorepo Docker & CI/CD Management Guide

## 🏗️ Monorepo Structure Overview

ในโครงการ AegisX เราใช้ Nx monorepo ที่มี 3 applications:

```
aegisx-starter/
├── apps/
│   ├── api/          # Fastify Backend API (Port 3333)
│   ├── web/          # Angular Public Web App (Port 4200)
│   └── admin/        # Angular Admin Dashboard (Port 4201)
├── libs/             # Shared libraries
├── docker-compose.yml
└── nx.json          # Nx configuration
```

## 🐳 Docker Strategy สำหรับ Monorepo

### 1. แยก Dockerfile สำหรับแต่ละ App

แต่ละ app มี Dockerfile ของตัวเอง:

```
apps/api/Dockerfile      # Node.js + Fastify
apps/web/Dockerfile      # Angular + Nginx
apps/admin/Dockerfile    # Angular + Nginx (with auth)
```

### 2. Build Process

#### API Build (Node.js)

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo files
COPY package*.json yarn.lock ./
COPY nx.json tsconfig.base.json ./

# Install ALL dependencies (monorepo)
RUN yarn install --frozen-lockfile

# Copy source code
COPY apps/api apps/api
COPY libs libs

# Build ONLY api app
RUN yarn nx build api --prod

# Production stage - copy only built files
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist/apps/api ./
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "main.js"]
```

#### Web/Admin Build (Angular)

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Copy monorepo files
COPY package*.json yarn.lock ./
COPY nx.json tsconfig.base.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source
COPY apps/web apps/web
COPY libs libs

# Build ONLY web app
RUN yarn nx build web --prod

# Production stage - serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
```

## 🔨 Nx Commands แยกตาม App

```bash
# Development
nx serve api    # Start API only
nx serve web    # Start Web only
nx serve admin  # Start Admin only

# Build
nx build api --prod    # Build API only
nx build web --prod    # Build Web only
nx build admin --prod  # Build Admin only

# Test
nx test api     # Test API only
nx test web     # Test Web only
nx test admin   # Test Admin only

# All apps together
nx run-many --target=serve --projects=api,web,admin
nx run-many --target=build --all --prod
nx run-many --target=test --all
```

## 🚀 CI/CD Pipeline สำหรับ Monorepo

### Parallel Build Strategy

ใน `.github/workflows/ci-cd.yml`:

```yaml
jobs:
  build:
    strategy:
      matrix:
        app: [api, web, admin]

    steps:
      - name: Build ${{ matrix.app }}
        run: |
          # Build specific app
          yarn nx build ${{ matrix.app }} --prod

      - name: Build Docker image
        run: |
          docker build \
            -f apps/${{ matrix.app }}/Dockerfile \
            -t ghcr.io/${{ github.repository }}/${{ matrix.app }}:${{ github.sha }} \
            .
```

### Affected Apps Detection

Nx สามารถตรวจสอบว่า app ไหนได้รับผลกระทบจากการเปลี่ยนแปลง:

```yaml
- name: Get affected apps
  run: |
    AFFECTED=$(npx nx affected:apps --base=origin/main --head=HEAD --plain)
    echo "affected_apps=$AFFECTED" >> $GITHUB_OUTPUT

- name: Build affected only
  run: |
    for app in $AFFECTED; do
      docker build -f apps/$app/Dockerfile -t $app:latest .
    done
```

## 📦 Docker Compose Management

### Development Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Shared services
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: aegisx_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  # Apps (for development)
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - '3333:3333'
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/aegisx_db
      REDIS_URL: redis://redis:6379

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - '4200:80'
    depends_on:
      - api

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - '4201:80'
    depends_on:
      - api
```

### Production Deployment

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    image: ghcr.io/aegisx-platform/aegisx-starter/api:${VERSION:-latest}
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    healthcheck:
      test: ['CMD', 'node', 'healthcheck.js']
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    image: ghcr.io/aegisx-platform/aegisx-starter/web:${VERSION:-latest}
    restart: unless-stopped
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.web.rule=Host(`app.aegisx.com`)'
      - 'traefik.http.routers.web.tls=true'

  admin:
    image: ghcr.io/aegisx-platform/aegisx-starter/admin:${VERSION:-latest}
    restart: unless-stopped
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.admin.rule=Host(`admin.aegisx.com`)'
      - 'traefik.http.routers.admin.tls=true'
      - 'traefik.http.routers.admin.middlewares=auth@docker'
```

## 🎯 Image Tagging Strategy

```bash
# Development
api:dev-${COMMIT_SHA}
web:dev-${COMMIT_SHA}
admin:dev-${COMMIT_SHA}

# Staging
api:staging-${VERSION}
web:staging-${VERSION}
admin:staging-${VERSION}

# Production
api:v1.2.3
web:v1.2.3
admin:v1.2.3

api:latest
web:latest
admin:latest
```

## 🔄 Deployment Workflow

### 1. Development → Staging

```bash
# Auto-deploy when pushed to develop branch
- Build all affected apps
- Tag with staging-${VERSION}
- Deploy to staging environment
- Run E2E tests
```

### 2. Staging → Production

```bash
# Manual approval required
- Create GitHub release
- Tag with v${VERSION}
- Deploy to production (blue-green)
- Monitor for 15 minutes
- Auto-rollback if errors detected
```

## 📊 Monitoring Individual Apps

```bash
# Health checks
curl http://api.aegisx.com/health    # API health
curl http://app.aegisx.com/health    # Web app health
curl http://admin.aegisx.com/health  # Admin health

# Logs
docker logs aegisx-api-1
docker logs aegisx-web-1
docker logs aegisx-admin-1

# Metrics per app
- API: Response time, DB queries, Active connections
- Web: Page load time, JS errors, User sessions
- Admin: Login attempts, Admin actions, Audit logs
```

## 🛠️ Common Commands

```bash
# Build specific app only
nx build api --prod

# Build and push specific app
./scripts/build-push.sh api v1.2.3

# Deploy specific app only
./scripts/deploy.sh production --app=api --version=v1.2.3

# Rollback specific app
./scripts/rollback.sh production --app=web --to-version=v1.2.2

# Scale specific app
docker-compose -f docker-compose.prod.yml scale api=3
```

## ⚡ Performance Tips

1. **Cache Nx computations**:

   ```yaml
   - uses: actions/cache@v4
     with:
       path: .nx/cache
       key: nx-${{ hashFiles('**/yarn.lock') }}
   ```

2. **Build only affected**:

   ```bash
   nx affected:build --base=main --head=HEAD
   ```

3. **Parallel builds**:

   ```bash
   nx run-many --target=build --all --parallel=3
   ```

4. **Docker layer caching**:
   ```yaml
   - uses: docker/build-push-action@v5
     with:
       cache-from: type=gha
       cache-to: type=gha,mode=max
   ```

## 🔐 Security Considerations

1. **Separate secrets per app**:
   - API_JWT_SECRET
   - WEB_API_KEY
   - ADMIN_SECRET_KEY

2. **Network isolation**:

   ```yaml
   networks:
     frontend: # web, admin
     backend: # api, postgres, redis
   ```

3. **App-specific rate limiting**:
   - API: 100 req/min per IP
   - Web: 1000 req/min per IP
   - Admin: 10 req/min per user

## 📈 Scaling Strategy

```yaml
# docker-compose.prod.yml
services:
  api:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  web:
    deploy:
      replicas: 2

  admin:
    deploy:
      replicas: 1 # Usually less traffic
```

This setup ensures each app in your monorepo can be built, deployed, and scaled independently while sharing common code through the libs folder!
