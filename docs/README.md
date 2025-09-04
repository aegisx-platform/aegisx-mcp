# AegisX Documentation

> Enterprise-ready full-stack application documentation with Angular 19+, Fastify 4+, PostgreSQL, and Nx monorepo.

## 🚀 Quick Navigation

### 📖 [Getting Started](./getting-started/)

Everything you need to bootstrap and run the project for the first time.

- **[Getting Started Guide](./getting-started/00-GETTING-STARTED.md)** - Git workflow, rules, and first steps
- **[Project Setup](./getting-started/03-project-setup.md)** - Complete bootstrap guide with validation

### 🛠️ [Development](./development/)

Workflows, commands, and development standards for efficient coding.

- **[Feature Tracking System](./development/01-feature-tracking.md)** - Progress tracking and session documentation
- **[Quick Commands](./development/02-quick-commands.md)** - Claude command reference (/feature, /status, etc.)
- **[Development Workflow](./development/04-development-workflow.md)** - Step-by-step feature development
- **[API-First Workflow](./development/04a-api-first-workflow.md)** - Recommended development approach
- **[MCP Integration](./development/09-mcp-integration.md)** - Nx MCP & Playwright MCP usage

### 🏗️ [Architecture](./architecture/)

System design patterns and architectural guidelines.

- **[Architecture Overview](./architecture/05-architecture.md)** - High-level system design
- **[Frontend Architecture](./architecture/05a-frontend-architecture.md)** - Angular patterns and standards
- **[Backend Architecture](./architecture/05b-backend-architecture.md)** - Fastify patterns and standards
- **Frontend Patterns**: [Signals](./architecture/frontend/), [UI Design](./architecture/frontend/), [Forms](./architecture/frontend/)
- **Backend Patterns**: [Plugins](./architecture/backend/), [RBAC](./architecture/backend/), [CRUD](./architecture/backend/)

### 🧪 [Testing](./testing/)

Comprehensive testing strategy and tools.

- **[Testing Strategy](./testing/06-testing.md)** - Unit, integration, and E2E testing
- **[API Testing](./testing/08-api-testing.md)** - Backend API testing patterns
- **[Integration Tests](./testing/INTEGRATION_TESTS.md)** - Full application testing
- **[Manual Test Commands](./testing/manual-test-commands.md)** - Manual testing procedures

### 🚀 [Infrastructure](./infrastructure/)

Deployment, CI/CD, and production operations.

- **[Deployment Guide](./infrastructure/07-deployment.md)** - Docker and production deployment
- **[CI/CD Setup](./infrastructure/CI-CD-SETUP.md)** - GitHub Actions and automation
- **[Git Flow & Release](./infrastructure/GIT-FLOW-RELEASE-GUIDE.md)** - Branch strategy and releases
- **[Docker Guide](./infrastructure/MONOREPO-DOCKER-GUIDE.md)** - Containerization for monorepo
- **[Automated Versioning](./infrastructure/AUTOMATED-VERSIONING-GUIDE.md)** - Release management

### 📡 [API Documentation](./api/)

API specifications and response standards.

- **[API Response Standard](./api/api-response-standard.md)** - Unified response format
- **[TypeBox Schema Standard](./api/05c-typebox-schema-standard.md)** - Schema validation patterns
- **[Response Patterns](./api/08a-response-patterns-examples.md)** - Implementation examples

### 📚 [References](./references/)

Quick reference guides and standards.

- **[Claude Commands](./references/CLAUDE_COMMANDS.md)** - Complete command reference
- **[Fastify Plugin Standards](./references/FASTIFY_PLUGIN_STANDARDS.md)** - Plugin development guide
- **[Library Standards](./references/08-library-standards.md)** - Code standards and conventions

### 📊 [Reports & Audits](./reports/)

Performance reports, security audits, and analysis.

- **[Performance Report](./reports/PERFORMANCE_REPORT.md)** - System performance analysis
- **[Security Audit](./reports/JWT_SECURITY_AUDIT.md)** - JWT and authentication security
- **[Redis Caching Guide](./reports/REDIS_CACHING_GUIDE.md)** - Caching implementation
- **[UI Test Report](./reports/UI-TEST-REPORT.md)** - Frontend testing results

## 🛠️ Technology Stack

- **Frontend**: Angular 19+ with Signals, Angular Material + TailwindCSS
- **Backend**: Fastify 4+ with plugin architecture and TypeBox validation
- **Database**: PostgreSQL 15+ with Knex.js migrations
- **Testing**: Jest unit tests + Playwright E2E + Visual regression
- **Infrastructure**: Docker + GitHub Actions + Monitoring stack
- **Monorepo**: Nx workspace with optimized build caching

## 📋 Development Guidelines

### ⚠️ Critical Rules

- **ALWAYS** use TypeBox schemas for API validation
- **ALWAYS** follow API-First development workflow
- **ALWAYS** check existing schemas before writing tests
- **USE** yarn (never npm) for package management
- **ASK** before deleting any files

### 🎯 Recommended Workflow

1. **Start**: Read [CLAUDE.md](../CLAUDE.md) for development guidelines
2. **Status**: Check [PROJECT_STATUS.md](../PROJECT_STATUS.md) for current progress
3. **Plan**: Use [API-First Workflow](./development/04a-api-first-workflow.md) for new features
4. **Build**: Follow [Development Workflow](./development/04-development-workflow.md)
5. **Test**: Implement [Testing Strategy](./testing/06-testing.md)
6. **Deploy**: Use [Infrastructure](./infrastructure/) guides

## 🔗 Quick Links

- **[Main Development Hub](../CLAUDE.md)** - Development guidelines and navigation
- **[Project Status](../PROJECT_STATUS.md)** - Current progress and session recovery
- **[GitHub Repository README](../README.md)** - Project overview and quick start

---

> 💡 **Tip**: Use Claude commands like `/feature`, `/test`, `/align:check` for efficient development. See [Quick Commands](./development/02-quick-commands.md) for the complete reference.
