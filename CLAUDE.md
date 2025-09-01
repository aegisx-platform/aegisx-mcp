# Enterprise Monorepo Application

> **📚 Complete documentation has been split into organized files in the `docs/` directory for better readability.**

## 🚨 Important Development Guidelines

### Git Commit Rules
**DO NOT include the following in git commits**:
- `🤖 Generated with Claude Code`
- `Co-Authored-By: Claude <noreply@anthropic.com>`

Keep commit messages clean and professional.

### File Management Rules
**CRITICAL: File Deletion Policy**
- **NEVER delete any files without explicit permission**
- **ALWAYS ask for approval before removing any file**
- **This includes temporary files, old code, or seemingly unused files**
- When refactoring or cleaning up, list files to be deleted and wait for confirmation

## Quick Navigation

- **[📊 Feature Tracking System](./docs/01-feature-tracking.md)** - Track development progress
- **[🚀 Quick Commands](./docs/02-quick-commands.md)** - Claude command reference (/feature, /status, etc.)
- **[🏗️ Project Setup](./docs/03-project-setup.md)** - Bootstrap guide
- **[🔄 Development Workflow](./docs/04-development-workflow.md)** - Step-by-step workflows
- **[🎯 API-First Workflow](./docs/04a-api-first-workflow.md)** - Recommended development approach
- **[🏛️ Architecture](./docs/05-architecture.md)** - Frontend/Backend patterns
- **[🧪 Testing Strategy](./docs/06-testing.md)** - E2E with Playwright MCP
- **[🚀 Deployment](./docs/07-deployment.md)** - Docker + CI/CD
- **[🤖 MCP Integration](./docs/09-mcp-integration.md)** - Nx MCP & Playwright MCP usage
- **[📋 All Commands Reference](./docs/CLAUDE_COMMANDS.md)** - Complete shell command list

## 🛠️ Technology Stack

- **Frontend**: Angular 19+ with Signals, Angular Material + TailwindCSS
- **Backend**: Fastify 4+ with TypeScript
- **Database**: PostgreSQL 15+ with Knex.js
- **Monorepo**: Nx with Yarn workspaces
- **Testing**: Jest + Playwright + MCP
- **Infrastructure**: Docker + GitHub Actions + GitHub Container Registry

## 🏃‍♂️ Quick Start Commands

```bash
# Install dependencies
yarn install

# Set up environment
cp .env.example .env

# Start databases
docker-compose up -d postgres redis

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development
nx run-many --target=serve --projects=api,web
```

## 📋 Most Used Commands

| Command | Description | Actual Command |
|---------|-------------|----------------|
| **Install** | Install dependencies | `yarn install` |
| **DB Setup** | Run migrations & seeds | `npm run db:migrate && npm run db:seed` |
| **Develop** | Start dev servers | `nx run-many --target=serve --projects=api,web` |
| **Test** | Run all tests | `nx run-many --target=test --all` |
| **E2E** | Run E2E tests | `nx e2e e2e` |
| **Build** | Build for production | `nx run-many --target=build --all` |
| **Docker** | Start services | `docker-compose up -d` |


## 🚀 Project Structure

```
aegisx-starter/
├── apps/                      # Applications
│   ├── api/                   # ✅ Fastify backend
│   ├── web/                   # ✅ Angular web app
│   └── admin/                 # ✅ Angular admin panel
├── docs/                      # ✅ Complete documentation
│   ├── 01-feature-tracking.md
│   ├── 02-quick-commands.md
│   ├── 04a-api-first-workflow.md
│   └── ...
├── docker-compose.yml         # ✅ Development environment
├── package.json               # ✅ NPM scripts
└── nx.json                    # ✅ Nx configuration
```

## 🎯 Development Philosophy

1. **API-First**: Design OpenAPI spec before implementation (See [API-First Workflow Guide](./docs/04a-api-first-workflow.md))
2. **Feature Modules**: Organized, testable, maintainable code
3. **E2E Testing**: Visual verification with Playwright MCP
4. **Progress Tracking**: Always maintain development status
5. **Quality Gates**: Unit → Integration → E2E → Visual tests
6. **Signals-First**: Angular state management with Signals
7. **Type Safety**: Full TypeScript with strict mode
8. **Contract-Driven**: Frontend and Backend develop from same spec
9. **Alignment Checks**: Continuous validation of frontend-backend compatibility

---

*For complete documentation, see individual files in the `docs/` directory.*