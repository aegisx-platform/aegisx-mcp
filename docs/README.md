# Enterprise Monorepo Documentation

Full-stack enterprise application with Angular 19+, Fastify 4+, and Nx monorepo architecture.

## 📚 Documentation Index

### 📊 [Feature Development Tracking](./01-feature-tracking.md)
Complete system for tracking feature development progress, status management, and session documentation.

### 🚀 [Quick Commands for Claude](./02-quick-commands.md)
Comprehensive command reference for Claude to efficiently create features, components, and workflows.

### 🏗️ [Project Setup & Bootstrap](./03-project-setup.md)
Step-by-step guide to bootstrap the entire monorepo from scratch with test validation.

### 🔄 [Development Workflow](./04-development-workflow.md)
Complete workflow for feature development from API design to production deployment.

### 🏛️ [Architecture Patterns](./05-architecture.md)
Architecture overview with links to detailed frontend and backend patterns.

### 🧪 [Testing Strategy](./06-testing.md)
Comprehensive testing strategy including unit tests, E2E tests with Playwright MCP, and visual regression.

### 🚀 [Deployment & Infrastructure](./07-deployment.md)
Docker configuration, CI/CD pipelines, security requirements, and production deployment.

## 🛠️ Technology Stack

- **Frontend**: Angular 19+ with Signals, Angular Material + TailwindCSS
- **Backend**: Fastify 4+ with TypeScript
- **Database**: PostgreSQL 15+ with Knex.js
- **Monorepo**: Nx with Yarn workspaces
- **Testing**: Jest + Playwright + MCP
- **Infrastructure**: Docker + GitHub Actions + GitHub Container Registry

## 🏃‍♂️ Quick Start

```bash
# 1. Bootstrap project
/bootstrap

# 2. Start development
docker-compose up -d postgres redis
yarn dev:api
yarn dev:web
yarn dev:admin

# 3. Create a feature
/feature user-management

# 4. Test everything
/test e2e user-management
/test visual user-management
```

## 📋 Feature Commands

| Command | Description |
|---------|-------------|
| `/feature [name]` | Create complete full-stack feature |
| `/feature:backend [name]` | Backend only |
| `/feature:frontend [name]` | Frontend only |
| `/api [resource]` | Create API endpoints |
| `/component [name] [type]` | Create Angular component |
| `/test e2e [feature]` | Run E2E tests with Playwright |
| `/test visual [page]` | Visual regression testing |

## 🎯 Development Approach

### API-First Development
1. Design OpenAPI specification
2. Generate types for frontend/backend
3. Implement backend with tests
4. Build frontend with real API
5. E2E testing with Playwright MCP

### Feature Module Pattern
- **Backend**: Controller → Service → Repository
- **Frontend**: Smart Components + Presentational Components
- **Testing**: Unit → Integration → E2E → Visual

## 📊 Project Status

Track all development with the Feature Tracking System:
- Requirements gathering and documentation
- Design decisions and API contracts
- Implementation progress with checklists
- E2E testing with visual verification
- Session management and recovery

Use `/start [feature-name]` to begin any new feature development.

---

*Generated from comprehensive CLAUDE.md documentation*