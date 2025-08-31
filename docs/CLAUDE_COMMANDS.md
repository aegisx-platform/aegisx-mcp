# Claude Code Commands Reference

> Quick reference for all commands you can use with Claude Code in the AegisX project

## 🚀 Project Setup Commands

### Initial Setup
```bash
# Bootstrap the entire project
./scripts/bootstrap.sh

# Validate your setup
./scripts/validate-setup.sh

# Copy environment file
cp .env.example .env

# Install dependencies (if already bootstrapped)
yarn install
```

### Docker Environment
```bash
# Start all services (databases, cache, etc.)
docker-compose up -d

# Start only core services (postgres, redis)
docker-compose up -d postgres redis

# Start with development tools (pgAdmin, Redis Commander)
docker-compose --profile tools up -d

# Start with email testing (Mailhog)
docker-compose --profile dev up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 🏗️ Code Generation Commands

### Generate New Feature
```bash
# Generate complete full-stack feature
./scripts/generate-feature.sh <feature-name>

# Examples:
./scripts/generate-feature.sh user-management
./scripts/generate-feature.sh product-catalog
./scripts/generate-feature.sh order-processing
```

### Nx Generators
```bash
# Generate Angular component
nx g @nx/angular:component <name> --project=frontend

# Generate Angular service
nx g @nx/angular:service <name> --project=frontend

# Generate Node.js library
nx g @nx/node:lib <name> --directory=libs/backend

# Generate Angular library
nx g @nx/angular:lib <name> --directory=libs/frontend
```

## 🔧 Development Commands

### Start Development Servers
```bash
# Start backend API
nx serve api

# Start frontend Angular app
nx serve frontend

# Start both in parallel
nx run-many --target=serve --projects=api,frontend

# Start with specific configuration
nx serve api --configuration=development
```

### Database Commands
```bash
# Run migrations
nx run api:migrate

# Create new migration
nx run api:migrate:make <migration-name>

# Rollback migrations
nx run api:migrate:rollback

# Seed database
nx run api:seed
```

### Build Commands
```bash
# Build all projects
nx run-many --target=build --all

# Build specific project
nx build api
nx build frontend

# Build for production
nx build api --configuration=production
nx build frontend --configuration=production

# Build affected projects only
nx affected:build
```

## 🧪 Testing Commands

### Unit Tests
```bash
# Run all tests
nx run-many --target=test --all

# Run tests for specific project
nx test api
nx test frontend
nx test backend-user-management

# Run tests in watch mode
nx test api --watch

# Run tests with coverage
nx test api --coverage
```

### E2E Tests
```bash
# Run all E2E tests
nx e2e e2e

# Run specific E2E test suite
nx e2e user-management-e2e

# Run E2E tests in headed mode (see browser)
nx e2e e2e --headed

# Run E2E tests with specific browser
nx e2e e2e --browser=firefox

# Update visual regression snapshots
nx e2e e2e --update-snapshots
```

### Linting
```bash
# Lint all projects
nx run-many --target=lint --all

# Lint specific project
nx lint api
nx lint frontend

# Lint and fix
nx lint api --fix

# Lint affected projects
nx affected:lint
```

## 📊 Analysis Commands

### Dependency Graph
```bash
# View project dependency graph
nx graph

# View affected projects
nx affected:graph

# View specific project dependencies
nx graph --focus=api
```

### Bundle Analysis
```bash
# Analyze frontend bundle size
nx build frontend --stats-json
webpack-bundle-analyzer dist/apps/frontend/stats.json
```

## 🚢 Deployment Commands

### Docker Build
```bash
# Build Docker images
docker build -t aegisx-api:latest -f apps/api/Dockerfile .
docker build -t aegisx-frontend:latest -f apps/frontend/Dockerfile .

# Tag for registry
docker tag aegisx-api:latest ghcr.io/yourorg/aegisx-api:latest
docker tag aegisx-frontend:latest ghcr.io/yourorg/aegisx-frontend:latest

# Push to registry
docker push ghcr.io/yourorg/aegisx-api:latest
docker push ghcr.io/yourorg/aegisx-frontend:latest
```

### Production Deployment
```bash
# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Deploy with kubectl
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n aegisx
kubectl get services -n aegisx
```

## 🛠️ Utility Commands

### Clean & Reset
```bash
# Clean build artifacts
nx run-many --target=clean --all

# Reset node_modules
rm -rf node_modules
yarn install

# Reset everything (clean slate)
nx reset
rm -rf node_modules dist tmp
yarn install
```

### Format Code
```bash
# Format all files
nx format:write

# Check formatting
nx format:check

# Format specific files
prettier --write "apps/**/*.ts"
```

### Update Dependencies
```bash
# Check for updates
yarn outdated

# Update dependencies
yarn upgrade-interactive

# Update Nx
nx migrate latest
nx migrate --run-migrations
```

## 📝 Git Commands

### Conventional Commits
```bash
# Feature
git commit -m "feat: add user authentication"

# Bug fix
git commit -m "fix: resolve login validation error"

# Documentation
git commit -m "docs: update API documentation"

# Style changes
git commit -m "style: format code with prettier"

# Refactoring
git commit -m "refactor: extract user service methods"

# Performance
git commit -m "perf: optimize database queries"

# Tests
git commit -m "test: add user service unit tests"

# Chores
git commit -m "chore: update dependencies"
```

## 🔍 Troubleshooting Commands

### Debug Backend
```bash
# Start with debug mode
nx serve api --inspect

# View logs
docker-compose logs -f api

# Check database connection
docker exec -it aegisx-postgres psql -U postgres -d aegisx
```

### Debug Frontend
```bash
# Start with source maps
nx serve frontend --source-map

# Check bundle size
nx build frontend --stats-json

# Run with production config locally
nx serve frontend --configuration=production
```

### Health Checks
```bash
# Check API health
curl http://localhost:3000/health

# Check database
docker exec aegisx-postgres pg_isready

# Check Redis
docker exec aegisx-redis redis-cli ping
```

## 🤖 Claude-Specific Commands

When working with Claude Code, you can use these commands:

```bash
# Ask Claude to bootstrap project
"Please run ./scripts/bootstrap.sh to set up the project"

# Ask Claude to create a feature
"Please generate a user-management feature using ./scripts/generate-feature.sh"

# Ask Claude to run tests
"Please run nx test api to check if tests pass"

# Ask Claude to start development
"Please start the development servers with nx run-many --target=serve --projects=api,frontend"
```

## 📚 Quick Command Sequences

### Start Fresh Development
```bash
./scripts/bootstrap.sh
cp .env.example .env
docker-compose up -d postgres redis
nx run api:migrate
nx run api:seed
nx run-many --target=serve --projects=api,frontend
```

### Create and Test New Feature
```bash
./scripts/generate-feature.sh my-feature
nx test backend-my-feature
nx test frontend-my-feature
nx serve api
nx serve frontend
```

### Prepare for Production
```bash
nx run-many --target=lint --all
nx run-many --target=test --all
nx run-many --target=build --all --configuration=production
nx e2e e2e
```

---

> 💡 **Tip**: Most commands support `--help` flag for additional options and information.