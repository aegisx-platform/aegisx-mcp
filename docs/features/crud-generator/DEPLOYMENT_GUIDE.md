# 🚀 CRUD Generator Deployment Guide

> **Production deployment instructions for the enterprise CRUD generator system**

This guide provides comprehensive instructions for deploying and managing the CRUD Generator in production environments.

## 🎯 Deployment Overview

### Deployment Models

The CRUD Generator supports multiple deployment scenarios:

1. **Development Integration**: Local development with hot generation
2. **CI/CD Pipeline**: Automated generation in build pipelines
3. **Production Server**: Dedicated generation service
4. **Cloud Native**: Containerized deployment with orchestration
5. **Hybrid**: Combination of local and remote generation

### Architecture Deployment

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_CLI[CLI Tool]
        DEV_DB[(Dev Database)]
        DEV_FILES[Generated Files]
    end

    subgraph "CI/CD Pipeline"
        CI_TRIGGER[Git Push]
        CI_GENERATOR[Generator Service]
        CI_BUILD[Build Process]
        CI_DEPLOY[Deploy Artifacts]
    end

    subgraph "Production Environment"
        PROD_API[API Server]
        PROD_WEB[Web Application]
        PROD_DB[(Production DB)]
        MONITOR[Monitoring]
    end

    DEV_CLI --> DEV_DB
    DEV_CLI --> DEV_FILES

    CI_TRIGGER --> CI_GENERATOR
    CI_GENERATOR --> CI_BUILD
    CI_BUILD --> CI_DEPLOY

    CI_DEPLOY --> PROD_API
    CI_DEPLOY --> PROD_WEB
    PROD_API --> PROD_DB

    MONITOR --> PROD_API
    MONITOR --> PROD_WEB
```

## 🛠️ Local Development Setup

### Prerequisites

```bash
# System requirements
node >= 18.0.0
pnpm >= 8.0.0
postgresql >= 13.0
docker >= 20.0.0 (optional)

# Project dependencies
cd tools/crud-generator
pnpm install
```

### Environment Configuration

Create development environment file:

```bash
# .env.development
DATABASE_URL=postgresql://user:password@localhost:5432/aegisx_dev
GENERATOR_OUTPUT_DIR=../../apps
TEMPLATE_DIR=./templates
FRONTEND_TEMPLATE_DIR=./frontend-templates

# Generation options
DEFAULT_PACKAGE=enhanced
AUTO_FORMAT=true
BACKUP_EXISTING=true
VALIDATION_STRICT=true

# Debug options
DEBUG=crud-generator:*
LOG_LEVEL=debug
PERFORMANCE_MONITORING=true
```

### Development Workflow

```bash
# 1. Setup development environment
./scripts/setup-dev.sh

# 2. Start database
docker-compose up -d postgres

# 3. Run migrations
cd ../..
pnpm db:migrate

# 4. Generate module (development)
cd tools/crud-generator
node index.js generate books --package enhanced --dry-run
node index.js generate books --package enhanced

# 5. Generate frontend
node generate-frontend-direct.js books enhanced

# 6. Test generation
cd ../..
nx build api
nx build web
```

## 🏗️ CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/crud-generation.yml`:

```yaml
name: CRUD Generator CI/CD

on:
  push:
    paths:
      - 'database/migrations/**'
      - 'tools/crud-generator/**'
  pull_request:
    paths:
      - 'database/migrations/**'
      - 'tools/crud-generator/**'

jobs:
  detect-schema-changes:
    runs-on: ubuntu-latest
    outputs:
      tables: ${{ steps.detect.outputs.tables }}

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Detect Changed Tables
        id: detect
        run: |
          # Parse migration files for new tables
          TABLES=$(git diff HEAD~1 --name-only | grep -E "\.sql$|migrations.*\.ts$" | xargs grep -l "CREATE TABLE" | xargs grep -oP "CREATE TABLE \K\w+" | tr '\n' ',' | sed 's/,$//')
          echo "tables=$TABLES" >> $GITHUB_OUTPUT

  generate-crud:
    needs: detect-schema-changes
    if: needs.detect-schema-changes.outputs.tables != ''
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: aegisx_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Setup database
        run: |
          pnpm db:migrate
          pnpm db:seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/aegisx_test

      - name: Generate CRUD modules
        run: |
          cd tools/crud-generator

          # Parse tables from previous step
          IFS=',' read -ra TABLES <<< "${{ needs.detect-schema-changes.outputs.tables }}"

          for table in "${TABLES[@]}"; do
            echo "Generating CRUD for table: $table"
            
            # Generate backend
            node index.js generate "$table" --package enhanced --force
            
            # Generate frontend
            node generate-frontend-direct.js "$table" enhanced --force
          done
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/aegisx_test

      - name: Verify builds
        run: |
          # Test backend build
          nx build api

          # Test frontend build
          nx build web

      - name: Run tests
        run: |
          # Run generated module tests
          nx test api

      - name: Commit generated files
        if: github.event_name == 'push'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"

          git add apps/api/src/modules/
          git add apps/web/src/app/features/

          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "feat: auto-generate CRUD modules for tables: ${{ needs.detect-schema-changes.outputs.tables }}"
            git push
          fi
```

### Jenkins Pipeline

Create `Jenkinsfile.crud-generator`:

```groovy
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        PNPM_VERSION = '8'
        DATABASE_URL = credentials('database-url')
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    // Install Node.js and pnpm
                    sh """
                        nvm install ${NODE_VERSION}
                        nvm use ${NODE_VERSION}
                        npm install -g pnpm@${PNPM_VERSION}
                        pnpm install
                    """
                }
            }
        }

        stage('Database Setup') {
            steps {
                script {
                    // Start database and run migrations
                    sh """
                        docker-compose up -d postgres
                        sleep 10
                        pnpm db:migrate
                        pnpm db:seed
                    """
                }
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    // Detect schema changes
                    def changedTables = sh(
                        script: """
                            git diff HEAD~1 --name-only | grep -E "\\.sql\$|migrations.*\\.ts\$" | \
                            xargs grep -l "CREATE TABLE" | \
                            xargs grep -oP "CREATE TABLE \\K\\w+" | \
                            tr '\\n' ',' | sed 's/,\$//'
                        """,
                        returnStdout: true
                    ).trim()

                    env.CHANGED_TABLES = changedTables
                    echo "Changed tables: ${changedTables}"
                }
            }
        }

        stage('Generate CRUD') {
            when {
                expression { env.CHANGED_TABLES != '' }
            }
            steps {
                script {
                    def tables = env.CHANGED_TABLES.split(',')

                    dir('tools/crud-generator') {
                        tables.each { table ->
                            echo "Generating CRUD for table: ${table}"

                            // Generate backend
                            sh "node index.js generate ${table} --package enhanced --force"

                            // Generate frontend
                            sh "node generate-frontend-direct.js ${table} enhanced --force"
                        }
                    }
                }
            }
        }

        stage('Verify & Test') {
            steps {
                parallel(
                    'Backend Build': {
                        sh 'nx build api'
                    },
                    'Frontend Build': {
                        sh 'nx build web'
                    },
                    'Run Tests': {
                        sh 'nx test api'
                    }
                )
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Deploy to staging/production
                    sh """
                        # Build for production
                        nx build api --prod
                        nx build web --prod

                        # Deploy artifacts
                        ./scripts/deploy.sh
                    """
                }
            }
        }
    }

    post {
        always {
            // Cleanup
            sh 'docker-compose down'
        }
        failure {
            // Notify team of build failure
            emailext (
                subject: "CRUD Generator Build Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "The CRUD generation build has failed. Please check the Jenkins logs.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
```

## 🐳 Docker Deployment

### Generator Service Dockerfile

Create `tools/crud-generator/Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    git \
    curl

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./
COPY tools/crud-generator/package*.json ./tools/crud-generator/

# Install dependencies
RUN npm install -g pnpm@8
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tools/crud-generator/ ./tools/crud-generator/
COPY apps/ ./apps/

# Build stage
FROM base AS build

WORKDIR /app/tools/crud-generator

# Pre-compile templates
RUN node scripts/precompile-templates.js

# Production stage
FROM node:18-alpine AS production

RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy built application
COPY --from=build /app/tools/crud-generator/ ./
COPY --from=build /app/apps/ ./apps/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S generator -u 1001
USER generator

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node health-check.js || exit 1

EXPOSE 3000

CMD ["node", "server.js"]
```

### Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  crud-generator:
    build:
      context: .
      dockerfile: tools/crud-generator/Dockerfile
      target: production
    ports:
      - '3001:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - LOG_LEVEL=info
      - RATE_LIMIT_MAX=100
      - RATE_LIMIT_WINDOW=900000
    volumes:
      - ./generated-output:/app/output
      - ./logs:/app/logs
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - '5432:5432'
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - crud-generator
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment

Create `k8s/crud-generator-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crud-generator
  labels:
    app: crud-generator
spec:
  replicas: 3
  selector:
    matchLabels:
      app: crud-generator
  template:
    metadata:
      labels:
        app: crud-generator
    spec:
      containers:
        - name: crud-generator
          image: aegisx/crud-generator:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: redis-secret
                  key: url
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          volumeMounts:
            - name: output-volume
              mountPath: /app/output
            - name: config-volume
              mountPath: /app/config
      volumes:
        - name: output-volume
          persistentVolumeClaim:
            claimName: generator-output-pvc
        - name: config-volume
          configMap:
            name: generator-config

---
apiVersion: v1
kind: Service
metadata:
  name: crud-generator-service
spec:
  selector:
    app: crud-generator
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: crud-generator-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - generator.aegisx.com
      secretName: generator-tls
  rules:
    - host: generator.aegisx.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: crud-generator-service
                port:
                  number: 80
```

## ☁️ Cloud Provider Deployments

### AWS ECS Deployment

Create `aws/task-definition.json`:

```json
{
  "family": "crud-generator",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "crud-generator",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/crud-generator:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "/crud-generator/database-url"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "/crud-generator/redis-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/crud-generator",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### Google Cloud Run Deployment

Create `gcp/service.yaml`:

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: crud-generator
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/execution-environment: gen2
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/cpu-throttling: 'false'
        run.googleapis.com/memory: '1Gi'
        run.googleapis.com/cpu: '1'
        run.googleapis.com/max-scale: '10'
        run.googleapis.com/min-scale: '1'
    spec:
      containers:
        - image: gcr.io/PROJECT_ID/crud-generator:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: redis-secret
                  key: url
          resources:
            limits:
              cpu: '1'
              memory: '1Gi'
          startupProbe:
            httpGet:
              path: /health
              port: 3000
            failureThreshold: 3
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            failureThreshold: 3
            periodSeconds: 10
  traffic:
    - percent: 100
      latestRevision: true
```

### Azure Container Instances

Create `azure/container-group.yaml`:

```yaml
apiVersion: 2021-09-01
location: East US
name: crud-generator-group
properties:
  containers:
    - name: crud-generator
      properties:
        image: aegisxregistry.azurecr.io/crud-generator:latest
        ports:
          - port: 3000
            protocol: TCP
        resources:
          requests:
            cpu: 0.5
            memoryInGB: 1
        environmentVariables:
          - name: NODE_ENV
            value: production
          - name: DATABASE_URL
            secureValue: 'postgresql://...'
          - name: REDIS_URL
            secureValue: 'redis://...'
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3
  osType: Linux
  ipAddress:
    type: Public
    ports:
      - port: 3000
        protocol: TCP
    dnsNameLabel: crud-generator
  restartPolicy: Always
```

## 🔧 Configuration Management

### Environment Variables

```bash
# Core Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_TIMEOUT=30000

# Redis Configuration (for caching)
REDIS_URL=redis://host:6379
REDIS_TTL=3600
REDIS_KEY_PREFIX=crud-gen:

# Generation Configuration
DEFAULT_PACKAGE=enhanced
AUTO_FORMAT=true
BACKUP_EXISTING=true
OUTPUT_DIR=/app/output
TEMPLATE_DIR=/app/templates

# Security Configuration
API_KEY_REQUIRED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
CORS_ORIGINS=https://app.aegisx.com,https://admin.aegisx.com

# Monitoring Configuration
METRICS_ENABLED=true
HEALTH_CHECK_TIMEOUT=5000
PERFORMANCE_MONITORING=true
ERROR_REPORTING=true

# Storage Configuration (for generated files)
STORAGE_TYPE=s3
S3_BUCKET=aegisx-generated-code
S3_REGION=us-west-2
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...

# Notification Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EMAIL_NOTIFICATION=admin@aegisx.com
```

### Configuration Templates

Create `config/production.js`:

```javascript
module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['https://app.aegisx.com'],
      credentials: true,
    },
  },

  database: {
    connection: process.env.DATABASE_URL,
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN) || 2,
      max: parseInt(process.env.DATABASE_POOL_MAX) || 10,
    },
    acquireTimeout: parseInt(process.env.DATABASE_TIMEOUT) || 30000,
  },

  redis: {
    url: process.env.REDIS_URL,
    ttl: parseInt(process.env.REDIS_TTL) || 3600,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'crud-gen:',
  },

  generator: {
    defaultPackage: process.env.DEFAULT_PACKAGE || 'enhanced',
    autoFormat: process.env.AUTO_FORMAT === 'true',
    backupExisting: process.env.BACKUP_EXISTING === 'true',
    outputDir: process.env.OUTPUT_DIR || '/app/output',
    templateDir: process.env.TEMPLATE_DIR || '/app/templates',
  },

  security: {
    apiKeyRequired: process.env.API_KEY_REQUIRED === 'true',
    rateLimit: {
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      window: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000,
    },
  },

  monitoring: {
    enabled: process.env.METRICS_ENABLED === 'true',
    healthCheckTimeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
    performance: process.env.PERFORMANCE_MONITORING === 'true',
    errorReporting: process.env.ERROR_REPORTING === 'true',
  },

  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  },

  notifications: {
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
    },
    email: {
      recipient: process.env.EMAIL_NOTIFICATION,
    },
  },
};
```

## 📊 Monitoring & Observability

### Health Checks

Create `health-check.js`:

```javascript
const http = require('http');
const { Pool } = require('pg');

class HealthChecker {
  constructor(config) {
    this.config = config;
    this.db = new Pool({ connectionString: config.database.connection });
  }

  async checkDatabase() {
    try {
      const result = await this.db.query('SELECT 1');
      return { status: 'healthy', latency: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkRedis() {
    // Redis health check implementation
    return { status: 'healthy' };
  }

  async checkTemplates() {
    // Template availability check
    return { status: 'healthy' };
  }

  async getHealthStatus() {
    const checks = await Promise.allSettled([this.checkDatabase(), this.checkRedis(), this.checkTemplates()]);

    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      checks: {
        database: checks[0].value,
        redis: checks[1].value,
        templates: checks[2].value,
      },
    };

    const hasUnhealthy = checks.some((check) => check.value?.status === 'unhealthy');

    if (hasUnhealthy) {
      results.status = 'unhealthy';
    }

    return results;
  }
}

module.exports = HealthChecker;
```

### Metrics Collection

Create `metrics.js`:

```javascript
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const generationDuration = new prometheus.Histogram({
  name: 'crud_generation_duration_seconds',
  help: 'Duration of CRUD generation in seconds',
  labelNames: ['table_name', 'package_type', 'success'],
});

const generationCounter = new prometheus.Counter({
  name: 'crud_generation_total',
  help: 'Total number of CRUD generations',
  labelNames: ['table_name', 'package_type', 'success'],
});

const activeConnections = new prometheus.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
});

// Middleware for HTTP metrics
function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });

  next();
}

// Generation metrics
function recordGeneration(tableName, packageType, success, duration) {
  generationDuration.labels(tableName, packageType, success).observe(duration);

  generationCounter.labels(tableName, packageType, success).inc();
}

module.exports = {
  metricsMiddleware,
  recordGeneration,
  register: prometheus.register,
};
```

### Logging Configuration

Create `logging.js`:

```javascript
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
  defaultMeta: {
    service: 'crud-generator',
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),

    // File transport
    new winston.transports.File({
      filename: '/app/logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    new winston.transports.File({
      filename: '/app/logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add Elasticsearch transport in production
if (process.env.NODE_ENV === 'production' && process.env.ELASTICSEARCH_URL) {
  logger.add(
    new ElasticsearchTransport({
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        },
      },
      index: 'crud-generator-logs',
    }),
  );
}

module.exports = logger;
```

## 🔒 Security Configuration

### API Authentication

```javascript
// auth-middleware.js
const jwt = require('jsonwebtoken');

function authenticateAPI(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticateAPI, requireRole };
```

### Rate Limiting

```javascript
// rate-limit.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

const createRateLimit = (options = {}) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    windowMs: options.window || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    message: {
      error: 'Too many requests',
      retryAfter: Math.ceil(options.window / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = { createRateLimit };
```

## 📈 Performance Optimization

### Caching Strategy

```javascript
// cache-manager.js
const Redis = require('ioredis');

class CacheManager {
  constructor(config) {
    this.redis = new Redis(config.redis.url);
    this.ttl = config.redis.ttl;
    this.prefix = config.redis.keyPrefix;
  }

  async get(key) {
    const value = await this.redis.get(`${this.prefix}${key}`);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value, ttl = this.ttl) {
    await this.redis.setex(`${this.prefix}${key}`, ttl, JSON.stringify(value));
  }

  async del(key) {
    await this.redis.del(`${this.prefix}${key}`);
  }

  async invalidatePattern(pattern) {
    const keys = await this.redis.keys(`${this.prefix}${pattern}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Schema caching
  async cacheSchema(tableName, schema) {
    await this.set(`schema:${tableName}`, schema, 3600); // 1 hour
  }

  async getSchema(tableName) {
    return await this.get(`schema:${tableName}`);
  }

  // Template caching
  async cacheTemplate(templateName, compiled) {
    await this.set(`template:${templateName}`, compiled, 7200); // 2 hours
  }

  async getTemplate(templateName) {
    return await this.get(`template:${templateName}`);
  }
}

module.exports = CacheManager;
```

## 🚨 Disaster Recovery

### Backup Strategy

Create `scripts/backup.sh`:

```bash
#!/bin/bash

# Backup configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
S3_BUCKET="aegisx-backups"

# Create backup directory
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

# Backup database schema
pg_dump --schema-only "$DATABASE_URL" > "$BACKUP_DIR/$TIMESTAMP/schema.sql"

# Backup templates
tar -czf "$BACKUP_DIR/$TIMESTAMP/templates.tar.gz" /app/templates/

# Backup configuration
cp /app/config/* "$BACKUP_DIR/$TIMESTAMP/"

# Backup generated code samples
tar -czf "$BACKUP_DIR/$TIMESTAMP/generated-samples.tar.gz" /app/output/samples/

# Upload to S3
aws s3 sync "$BACKUP_DIR/$TIMESTAMP" "s3://$S3_BUCKET/crud-generator/$TIMESTAMP/"

# Cleanup old backups (keep last 7 days)
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $TIMESTAMP"
```

### Recovery Procedures

Create `scripts/restore.sh`:

```bash
#!/bin/bash

BACKUP_TIMESTAMP=$1
S3_BUCKET="aegisx-backups"
RESTORE_DIR="/tmp/restore"

if [ -z "$BACKUP_TIMESTAMP" ]; then
    echo "Usage: $0 <backup_timestamp>"
    echo "Available backups:"
    aws s3 ls "s3://$S3_BUCKET/crud-generator/" | grep PRE
    exit 1
fi

# Download backup from S3
mkdir -p "$RESTORE_DIR"
aws s3 sync "s3://$S3_BUCKET/crud-generator/$BACKUP_TIMESTAMP/" "$RESTORE_DIR/"

# Restore database schema
psql "$DATABASE_URL" < "$RESTORE_DIR/schema.sql"

# Restore templates
tar -xzf "$RESTORE_DIR/templates.tar.gz" -C /

# Restore configuration
cp "$RESTORE_DIR"/*.js /app/config/

echo "Restore completed from backup: $BACKUP_TIMESTAMP"
```

## 📚 Maintenance Procedures

### Update Deployment

```bash
#!/bin/bash
# scripts/update-deployment.sh

# 1. Build new version
docker build -t aegisx/crud-generator:latest .

# 2. Tag with version
VERSION=$(git describe --tags --abbrev=0)
docker tag aegisx/crud-generator:latest aegisx/crud-generator:$VERSION

# 3. Push to registry
docker push aegisx/crud-generator:latest
docker push aegisx/crud-generator:$VERSION

# 4. Update Kubernetes deployment
kubectl set image deployment/crud-generator crud-generator=aegisx/crud-generator:$VERSION

# 5. Wait for rollout
kubectl rollout status deployment/crud-generator

# 6. Verify deployment
kubectl get pods -l app=crud-generator
```

### Database Migration

```bash
#!/bin/bash
# scripts/migrate-production.sh

# 1. Backup current database
./scripts/backup.sh

# 2. Run migrations
NODE_ENV=production pnpm db:migrate

# 3. Verify migration
NODE_ENV=production pnpm db:status

# 4. Restart services
kubectl rollout restart deployment/crud-generator

echo "Production migration completed"
```

---

**This deployment guide provides comprehensive instructions for deploying the CRUD Generator in production environments with enterprise-grade reliability and security.** 🚀

_Follow these procedures to ensure successful deployment and operation of the generator system in production._
