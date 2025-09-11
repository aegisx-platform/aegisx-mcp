# Docker & Deployment

## Multi-Stage Dockerfiles

### API Dockerfile

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS runner
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

### Angular Dockerfile

```dockerfile
# apps/user-portal/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Docker Compose

### Development Setup

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp_dev
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  api:
    build: ./apps/api
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://admin:password@postgres:5432/myapp_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/api/src:/app/src:ro

volumes:
  postgres_data:
  redis_data:
```

### Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    image: ghcr.io/yourorg/api:latest
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  user-portal:
    image: ghcr.io/yourorg/user-portal:latest
    ports:
      - '80:80'

  nginx:
    image: nginx:alpine
    ports:
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

## Kubernetes Deployment

### Basic Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: ghcr.io/yourorg/api:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database-url
          resources:
            requests:
              memory: '256Mi'
              cpu: '200m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 3000
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run build

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and push Docker images
        run: |
          docker build -t ghcr.io/yourorg/api:${{ github.sha }} ./apps/api
          docker build -t ghcr.io/yourorg/user-portal:${{ github.sha }} ./apps/user-portal

          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/yourorg/api:${{ github.sha }}
          docker push ghcr.io/yourorg/user-portal:${{ github.sha }}

      - name: Deploy to production
        run: |
          kubectl set image deployment/api api=ghcr.io/yourorg/api:${{ github.sha }}
          kubectl set image deployment/user-portal user-portal=ghcr.io/yourorg/user-portal:${{ github.sha }}
```

## Environment Configuration

### Production Environment

```bash
# .env.production
NODE_ENV=production
API_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://user:pass@prod-db:5432/myapp
REDIS_URL=redis://prod-redis:6379
LOG_LEVEL=info
```

### Health Checks

```typescript
// Health check endpoint for load balancers
fastify.get('/health', async () => {
  try {
    await knex.raw('SELECT 1');
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    throw new Error('Database connection failed');
  }
});
```

## Deployment Best Practices

1. **Multi-stage builds**: Smaller production images
2. **Health checks**: Proper liveness/readiness probes
3. **Resource limits**: Prevent resource exhaustion
4. **Secrets management**: Use Kubernetes secrets
5. **Rolling updates**: Zero-downtime deployments
6. **Monitoring**: Comprehensive observability
7. **Backup strategy**: Database and file backups
