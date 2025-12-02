# AegisX Documentation

> Enterprise-ready full-stack application documentation with Angular 19+, Fastify 4+, PostgreSQL, and Nx monorepo.

## 🚀 Quick Navigation

### 📖 [Getting Started](./getting-started/)

Everything you need to bootstrap and run the project for the first time.

- **[Getting Started Guide](./getting-started/getting-started.md)** - Git workflow, rules, and first steps
- **[Project Setup](./getting-started/project-setup.md)** - Complete bootstrap guide with validation

### 🛠️ [Development](./development/)

Workflows, commands, and development standards for efficient coding.

- **[QA Checklist](./development/qa-checklist.md)** - 🚨 Mandatory quality assurance steps (do this every time!)
- **[Feature Tracking System](./development/feature-tracking.md)** - Progress tracking and session documentation
- **[Quick Commands](./development/quick-commands.md)** - Claude command reference (/feature, /status, etc.)
- **[Development Workflow](./development/development-workflow.md)** - Step-by-step feature development
- **[API-First Workflow](./development/api-first-workflow.md)** - Recommended development approach
- **[MCP Integration](./development/mcp-integration.md)** - Nx MCP & Playwright MCP usage

### 🏗️ [Architecture](./architecture/)

System design patterns and architectural guidelines.

- **[Architecture Overview](./architecture/architecture-overview.md)** - High-level system design
- **[Frontend Architecture](./architecture/frontend-architecture.md)** - Angular patterns and standards
- **[Backend Architecture](./architecture/backend-architecture.md)** - Fastify patterns and standards
- **Frontend Patterns**: [Signals](./architecture/frontend/), [UI Design](./architecture/frontend/), [Forms](./architecture/frontend/)
- **Backend Patterns**: [Plugins](./architecture/backend/), [RBAC](./architecture/backend/), [CRUD](./architecture/backend/)

### 🧪 [Testing](./testing/)

Comprehensive testing strategy and tools.

- **[Testing Strategy](./testing/testing-strategy.md)** - Unit, integration, and E2E testing
- **[API Testing](./testing/api-testing.md)** - Backend API testing patterns
- **[Integration Tests](./testing/integration-tests.md)** - Full application testing
- **[Manual Test Commands](./testing/manual-test-commands.md)** - Manual testing procedures

### 🚀 [Infrastructure](./infrastructure/)

Deployment, CI/CD, and production operations.

- **[Deployment Guide](./infrastructure/deployment.md)** - Docker and production deployment
- **[CI/CD Setup](./infrastructure/ci-cd-setup.md)** - GitHub Actions and automation
- **[Git Flow & Release](./infrastructure/git-flow-release-guide.md)** - Branch strategy and releases
- **[Docker Guide](./infrastructure/monorepo-docker-guide.md)** - Containerization for monorepo
- **[Automated Versioning](./infrastructure/automated-versioning-guide.md)** - Release management

### 📡 [API Documentation](./api/)

API specifications and response standards.

- **[API Response Standard](./api/api-response-standard.md)** - Unified response format
- **[TypeBox Schema Standard](./api/typebox-schema-standard.md)** - Schema validation patterns
- **[Response Patterns](./api/response-patterns-examples.md)** - Implementation examples

### 🎨 [AegisX UI Library](./ui/)

Enterprise Angular UI library documentation.

- **[Git Workflow](./ui/GIT_WORKFLOW.md)** - Git subtree sync and separate repository
- **[NPM Publishing](./ui/NPM_PUBLISHING.md)** - Publishing to npm registry
- **[Theme System Standard](./ui/THEME_SYSTEM_STANDARD.md)** - Theme system documentation
- **[Token Reference](./ui/TOKEN_REFERENCE.md)** - Design token reference

### 🤖 [CRUD Generator](./crud-generator/)

Automatic CRUD API generation tool.

- **[Quick Reference](./crud-generator/QUICK_REFERENCE.md)** - Command reference and examples
- **[Git Workflow](./crud-generator/GIT_WORKFLOW.md)** - Version release & NPM publishing
- **[Command Reference](./crud-generator/COMMAND_REFERENCE.md)** - CLI commands

### 📚 [References](./references/)

Quick reference guides and standards.

- **[Claude Commands](./references/claude-commands.md)** - Complete command reference
- **[Fastify Plugin Standards](./references/fastify-plugin-standards.md)** - Plugin development guide
- **[Library Standards](./references/library-standards.md)** - Code standards and conventions

### 📊 [Reports & Audits](./reports/)

Performance reports, security audits, and analysis.

- **[Performance Report](./reports/performance-report.md)** - System performance analysis
- **[Security Audit](./reports/jwt-security-audit.md)** - JWT and authentication security
- **[Redis Caching Guide](./reports/redis-caching-guide.md)** - Caching implementation
- **[UI Test Report](./reports/ui-test-report.md)** - Frontend testing results

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
3. **Plan**: Use [API-First Workflow](./development/api-first-workflow.md) for new features
4. **Build**: Follow [Development Workflow](./development/development-workflow.md)
5. **Test**: Implement [Testing Strategy](./testing/testing-strategy.md)
6. **Deploy**: Use [Infrastructure](./infrastructure/) guides

## 🔗 Quick Links

- **[Main Development Hub](../CLAUDE.md)** - Development guidelines and navigation
- **[Project Status](../PROJECT_STATUS.md)** - Current progress and session recovery
- **[GitHub Repository README](../README.md)** - Project overview and quick start

---

> 💡 **Tip**: Use Claude commands like `/feature`, `/test`, `/align:check` for efficient development. See [Quick Commands](./development/quick-commands.md) for the complete reference.
