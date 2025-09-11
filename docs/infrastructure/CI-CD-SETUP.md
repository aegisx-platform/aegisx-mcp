# CI/CD Pipeline Setup Guide

This document provides comprehensive information about the AegisX platform CI/CD pipeline setup, including deployment strategies, environment configurations, and operational procedures.

## Overview

The AegisX platform uses a complete CI/CD pipeline with:

- **Semantic Versioning**: Automated version management with conventional commits
- **Multi-stage Docker Builds**: Optimized, secure container images
- **GitHub Actions**: Comprehensive workflows for testing, building, and deployment
- **GitHub Container Registry (GHCR)**: Centralized image storage and distribution
- **Environment-specific Deployments**: Staging and production environments
- **Security Scanning**: Automated vulnerability detection and compliance checks

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │    API      │ │    │ │    API      │ │    │ │    API      │ │
│ │  (Node.js)  │ │    │ │ (Container) │ │    │ │ (Container) │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │     Web     │ │    │ │     Web     │ │    │ │     Web     │ │
│ │ (Angular)   │ │    │ │ (Container) │ │    │ │ (Container) │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │    Admin    │ │    │ │    Admin    │ │    │ │    Admin    │ │
│ │ (Angular)   │ │    │ │ (Container) │ │    │ │ (Container) │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Workflow Files

### Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Git tags starting with `v*`

**Jobs:**

1. **Quality**: Linting, unit tests, coverage reporting
2. **Security**: Vulnerability scanning, dependency audit
3. **Build**: Multi-platform Docker image building and pushing
4. **Integration**: Integration tests with real services
5. **Deploy Staging**: Automatic deployment on `develop` branch
6. **Deploy Production**: Manual deployment on version tags
7. **Cleanup**: Remove old container images

### Security Workflow (`.github/workflows/security.yml`)

**Triggers:**

- Daily schedule (2 AM)
- Manual dispatch
- Changes to dependencies or Dockerfiles

**Scans:**

- Dependency vulnerabilities (Snyk, npm audit)
- Container image security (Trivy)
- Code quality analysis (CodeQL)

### Release Workflow (`.github/workflows/release.yml`)

**Manual Release Process:**

- Select version type (patch/minor/major)
- Run full test suite
- Generate changelog
- Create git tag and GitHub release
- Trigger production deployment

### Cleanup Workflow (`.github/workflows/cleanup.yml`)

**Automated Maintenance:**

- Weekly cleanup of untagged images
- Retention of latest 10 versions per service
- Preservation of environment-specific tags

## Docker Configuration

### Multi-stage Builds

Each application uses optimized multi-stage Dockerfiles:

#### API Service (`apps/api/Dockerfile`)

```dockerfile
# Stage 1: Build dependencies
FROM node:20-alpine AS builder
# Install dependencies and build application

# Stage 2: Production runtime
FROM node:20-alpine AS runtime
# Copy built artifacts and run as non-root user
```

#### Frontend Services (`apps/web/Dockerfile`, `apps/admin/Dockerfile`)

```dockerfile
# Stage 1: Build Angular application
FROM node:20-alpine AS builder
# Build production-optimized Angular bundles

# Stage 2: Nginx runtime
FROM nginx:1.25-alpine AS runtime
# Serve static files with security headers
```

### Security Features

- **Non-root execution**: All containers run as non-privileged users
- **Security headers**: Comprehensive HTTP security headers
- **Health checks**: Built-in container health monitoring
- **Vulnerability scanning**: Automated image security scanning
- **Minimal base images**: Alpine Linux for reduced attack surface

## Environment Configuration

### Development

```bash
# Local development with hot reload
yarn dev:all

# Local Docker environment
docker-compose up -d
```

### Staging

```bash
# Deploy to staging
./scripts/deploy.sh staging --build --migrate

# Environment-specific configuration
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

### Production

```bash
# Deploy to production
./scripts/deploy.sh production --migrate

# Production-optimized configuration
docker-compose -f docker-compose.prod.yml up -d
```

## Versioning Strategy

### Semantic Versioning (SemVer)

The project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (`1.0.0`): Breaking changes
- **MINOR** (`1.1.0`): New features, backward compatible
- **PATCH** (`1.1.1`): Bug fixes, backward compatible

### Conventional Commits

Commit messages follow [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

feat(auth): add OAuth2 integration
fix(api): resolve memory leak in user service
docs(readme): update deployment instructions
chore(deps): update dependencies
```

### Automated Versioning

```bash
# Manual version bump
npm run version:patch   # 1.0.0 → 1.0.1
npm run version:minor   # 1.0.1 → 1.1.0
npm run version:major   # 1.1.0 → 2.0.0

# Automated release process
npm run release
```

## Deployment Strategies

### Blue-Green Deployment

1. **Build new version** in parallel environment
2. **Run health checks** on new deployment
3. **Switch traffic** from old to new version
4. **Keep old version** for quick rollback

### Rolling Updates

1. **Update services incrementally**
2. **Maintain service availability**
3. **Monitor health during updates**
4. **Rollback on failure detection**

### Rollback Procedures

```bash
# Automatic rollback on health check failure
# Manual rollback to previous version
./scripts/deploy.sh production --rollback

# Container-level rollback
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

## GitHub Container Registry (GHCR)

### Image Naming Convention

```
ghcr.io/username/aegisx-starter/api:latest
ghcr.io/username/aegisx-starter/api:v1.2.3
ghcr.io/username/aegisx-starter/api:main
ghcr.io/username/aegisx-starter/api:staging
```

### Image Lifecycle Management

- **Latest**: Current production version
- **Versioned**: Specific release versions (v1.2.3)
- **Branch**: Development branches (main, staging)
- **SHA**: Commit-specific builds (main-abc1234)

### Cleanup Policies

- Keep **latest 10 versions** per service
- Remove **untagged images** weekly
- Preserve **environment tags** (latest, staging, main)
- **Automated cleanup** via GitHub Actions

## Security Configuration

### Required Secrets

Add these secrets to your GitHub repository settings:

```bash
# Container Registry
GITHUB_TOKEN              # Automatic (GitHub provides)

# Security Scanning
SNYK_TOKEN                # Snyk authentication token

# Deployment
STAGING_HOST              # Staging server hostname
STAGING_USER              # SSH username for staging
STAGING_SSH_KEY           # SSH private key for staging
PRODUCTION_HOST           # Production server hostname
PRODUCTION_USER           # SSH username for production
PRODUCTION_SSH_KEY        # SSH private key for production

# Notifications
SLACK_WEBHOOK_URL         # Slack notifications

# Application Secrets
JWT_SECRET                # JWT signing key
SESSION_SECRET           # Session encryption key
POSTGRES_PASSWORD        # Database password
REDIS_PASSWORD           # Redis password
SMTP_USER               # Email service username
SMTP_PASSWORD           # Email service password
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://user:pass@host:port

# Authentication
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRES_IN=15m

# Email
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password

# Application
NODE_ENV=production
API_VERSION=v1
CORS_ORIGIN=https://your-domain.com
```

## Monitoring and Logging

### Container Health Checks

Each container includes health check endpoints:

```bash
# API health check
curl http://localhost:3000/health

# Web application health check
curl http://localhost:80/health

# Admin panel health check
curl http://localhost:8080/health
```

### Log Management

```bash
# View container logs
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f admin

# Log rotation configuration
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Metrics Collection

- **Container metrics**: CPU, memory, network usage
- **Application metrics**: Request rates, response times, error rates
- **Database metrics**: Connection pool, query performance
- **Security metrics**: Failed auth attempts, rate limit hits

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear Docker build cache
docker system prune -a

# Rebuild without cache
npm run docker:build:no-cache
```

#### Deployment Issues

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs [service-name]

# Restart services
docker-compose restart [service-name]
```

#### Health Check Failures

```bash
# Manual health check
curl -f http://localhost:3000/health || echo "API health check failed"

# Check container status
docker inspect --format='{{.State.Health.Status}}' container-name
```

### Recovery Procedures

#### Database Recovery

```bash
# Restore from backup
docker-compose exec postgres psql -U postgres -d aegisx_db < /backups/backup.sql

# Reset database
npm run db:reset
```

#### Service Recovery

```bash
# Rolling restart
docker-compose restart api
docker-compose restart web
docker-compose restart admin

# Complete environment reset
docker-compose down
docker-compose up -d
```

## Best Practices

### Development Workflow

1. **Feature branches**: Create branches from `develop`
2. **Pull requests**: Require code review and CI checks
3. **Conventional commits**: Use standardized commit messages
4. **Test coverage**: Maintain >80% test coverage
5. **Security scanning**: Address vulnerabilities promptly

### Deployment Workflow

1. **Staging first**: Deploy to staging before production
2. **Health checks**: Verify service health after deployment
3. **Monitoring**: Monitor metrics and logs post-deployment
4. **Rollback plan**: Have rollback procedures ready
5. **Documentation**: Update deployment notes

### Security Practices

1. **Secrets management**: Use GitHub secrets for sensitive data
2. **Vulnerability scanning**: Regular security audits
3. **Access control**: Limit deployment permissions
4. **Audit logging**: Track deployment activities
5. **Compliance**: Follow security best practices

## Support

For deployment issues or questions:

1. Check the [troubleshooting guide](#troubleshooting)
2. Review [container logs](#log-management)
3. Consult the [monitoring dashboard](#monitoring-and-logging)
4. Contact the DevOps team via #devops Slack channel
5. Create an issue in the GitHub repository

---

_This documentation is maintained by the AegisX DevOps team. Last updated: $(date)_
