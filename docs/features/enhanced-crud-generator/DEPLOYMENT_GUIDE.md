# Enhanced CRUD Generator - Deployment Guide

> **🚀 Production deployment instructions for Enhanced CRUD Generator and generated modules**

## 🎯 Deployment Overview

The Enhanced CRUD Generator creates production-ready modules that follow enterprise deployment standards. This guide covers deploying both the generator tool and the generated API modules.

## 📋 Pre-Deployment Checklist

### Environment Verification

```bash
# 1. Verify Node.js version
node --version  # Should be >= 18.0.0

# 2. Check PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"

# 3. Verify all dependencies
pnpm install --frozen-lockfile

# 4. Run TypeScript compilation
nx run api:build

# 5. Execute tests
nx run api:test
```

### Generated Module Validation

```bash
# 1. Verify generated modules compile
find apps/api/src/modules -name "*.ts" -exec echo "Checking: {}" \;

# 2. Check schema validation
nx run api:lint

# 3. Test API endpoints
npm run api:dev &
curl http://localhost:3333/api/health
```

## 🐳 Docker Deployment

### Production Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN nx run api:build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --production

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/src/database ./apps/api/src/database

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3333/api/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Start application
CMD ["node", "dist/apps/api/main.js"]
```

### Docker Compose for Production

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - '3333:3333'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3333/api/health']
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

## ☁️ Cloud Deployment

### AWS ECS with Fargate

```yaml
# ecs-task-definition.json
{ 'family': 'aegisx-api', 'networkMode': 'awsvpc', 'requiresCompatibilities': ['FARGATE'], 'cpu': '512', 'memory': '1024', 'executionRoleArn': 'arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole', 'taskRoleArn': 'arn:aws:iam::ACCOUNT:role/ecsTaskRole', 'containerDefinitions': [{ 'name': 'api', 'image': 'ACCOUNT.dkr.ecr.REGION.amazonaws.com/aegisx-api:latest', 'portMappings': [{ 'containerPort': 3333, 'protocol': 'tcp' }], 'environment': [{ 'name': 'NODE_ENV', 'value': 'production' }], 'secrets': [{ 'name': 'DATABASE_URL', 'valueFrom': 'arn:aws:secretsmanager:REGION:ACCOUNT:secret:aegisx/database-url' }], 'logConfiguration': { 'logDriver': 'awslogs', 'options': { 'awslogs-group': '/ecs/aegisx-api', 'awslogs-region': 'us-east-1', 'awslogs-stream-prefix': 'ecs' } }, 'healthCheck': { 'command': ['CMD-SHELL', 'curl -f http://localhost:3333/api/health || exit 1'], 'interval': 30, 'timeout': 5, 'retries': 3 } }] }
```

### Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aegisx-api
  labels:
    app: aegisx-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aegisx-api
  template:
    metadata:
      labels:
        app: aegisx-api
    spec:
      containers:
        - name: api
          image: aegisx/api:latest
          ports:
            - containerPort: 3333
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: aegisx-secrets
                  key: database-url
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3333
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3333
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: aegisx-api-service
spec:
  selector:
    app: aegisx-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3333
  type: LoadBalancer
```

## 🗄️ Database Deployment

### Migration Strategy

```bash
# Production migration workflow
#!/bin/bash

# 1. Backup current database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations
npm run db:migrate

# 3. Verify migration success
npm run db:verify

# 4. Run smoke tests
npm run test:smoke
```

### Migration Rollback Plan

```bash
# rollback-migration.sh
#!/bin/bash

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Stop application
docker-compose down

# Restore database
psql $DATABASE_URL < $BACKUP_FILE

# Restart application
docker-compose up -d

# Verify rollback
curl -f http://localhost:3333/api/health
```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# .env.production
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@postgres.internal:5432/aegisx_prod
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20
DATABASE_SSL=true

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRY=24h

# Redis
REDIS_URL=redis://redis.internal:6379
REDIS_TTL=3600

# API Configuration
API_HOST=0.0.0.0
API_PORT=3333
API_CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Rate Limiting
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=900000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DESTINATION=/app/uploads
```

### Security Configuration

```bash
# security.env
# Database security
DATABASE_SSL_REJECT_UNAUTHORIZED=true
DATABASE_SSL_CA=/path/to/ca-certificate.crt

# API Security
HELMET_ENABLED=true
CORS_CREDENTIALS=true
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# Rate limiting per IP
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false
RATE_LIMIT_SKIP_FAILED_REQUESTS=false

# Request timeout
REQUEST_TIMEOUT=30000

# Content Security Policy
CSP_ENABLED=true
CSP_DIRECTIVE="default-src 'self'"
```

## 📊 Monitoring & Observability

### Health Check Implementation

```typescript
// Generated health check for each module
export async function healthCheck(fastify: FastifyInstance) {
  fastify.get(
    '/api/health',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              modules: {
                type: 'object',
                additionalProperties: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    responseTime: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const startTime = Date.now();

      // Check database connectivity
      const dbStatus = await checkDatabase(fastify.knex);

      // Check generated modules
      const moduleChecks = await Promise.all([
        checkModule('users', fastify),
        checkModule('products', fastify),
        // ... other generated modules
      ]);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        modules: Object.fromEntries(moduleChecks),
      };
    },
  );
}
```

### Metrics Collection

```typescript
// Prometheus metrics for generated modules
import { register, Counter, Histogram } from 'prom-client';

const requestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'module'],
});

const requestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'module'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Auto-instrumented in generated controllers
export function instrumentController(moduleName: string) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const startTime = Date.now();

    reply.raw.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;

      requestCounter.inc({
        method: request.method,
        route: request.routerPath,
        status_code: reply.statusCode,
        module: moduleName,
      });

      requestDuration.observe(
        {
          method: request.method,
          route: request.routerPath,
          module: moduleName,
        },
        duration,
      );
    });
  };
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: |
          nx run api:test
          nx run api:build

      - name: Test generated modules
        run: |
          # Generate test module
          node tools/crud-generator/index.js generate test_deploy --package=full --force
          nx run api:build
          npm run test:generated

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: aegisx-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster aegisx-cluster \
            --service aegisx-api-service \
            --force-new-deployment
```

## 📈 Performance Tuning

### Database Optimization

```sql
-- Performance indexes for generated modules
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_created
ON users (is_active, created_at DESC)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search
ON products USING gin(to_tsvector('english', name || ' ' || description));

-- Connection pooling settings
-- postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
```

### API Performance

```typescript
// Production optimizations
const fastify = Fastify({
  logger: {
    level: 'info',
    serializers: {
      req: reqSerializer,
      res: resSerializer,
    },
  },
  // Connection limits
  connectionTimeout: 30000,
  keepAliveTimeout: 5000,
  maxRequestSize: 1048576, // 1MB

  // Performance settings
  ignoreTrailingSlash: true,
  caseSensitive: false,
});

// Register compression
await fastify.register(import('@fastify/compress'), {
  encodings: ['gzip', 'deflate'],
});

// Register caching
await fastify.register(import('@fastify/caching'), {
  privacy: 'private',
});
```

## 🚨 Security Hardening

### Production Security Configuration

```typescript
// Security middleware for production
await fastify.register(import('@fastify/helmet'), {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

await fastify.register(import('@fastify/rate-limit'), {
  max: 1000,
  timeWindow: '15 minutes',
  skipOnError: true,
});

// Request validation
await fastify.register(import('@fastify/sensible'));
```

## 🔧 Troubleshooting Production Issues

### Common Deployment Issues

```bash
# 1. Check container logs
docker logs -f aegisx-api

# 2. Database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# 3. Migration status
npm run db:migrate:status

# 4. API health check
curl -f http://localhost:3333/api/health

# 5. Generated module validation
node -e "
  const modules = require('fs').readdirSync('apps/api/src/modules');
  console.log('Generated modules:', modules);
"
```

### Performance Monitoring

```bash
# Monitor API performance
curl -s http://localhost:9090/metrics | grep http_request_duration

# Database performance
psql $DATABASE_URL -c "
  SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
  FROM pg_stat_user_tables
  ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;
"

# Memory usage
docker stats aegisx-api
```

---

**Related Documentation:**

- [User Guide](./USER_GUIDE.md) - Basic usage instructions
- [Architecture](./ARCHITECTURE.md) - System design
- [Troubleshooting](./TROUBLESHOOTING.md) - Issue resolution
- [API Reference](./API_REFERENCE.md) - Endpoint documentation
