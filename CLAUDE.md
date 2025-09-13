# Enterprise Monorepo Application

> **📚 Complete documentation has been split into organized files in the `docs/` directory for better readability.**

## 🚨 Important Development Guidelines

### 🚨 CRITICAL: Standard Development Policy

**NEVER make changes without explicit user approval**

- **DO NOT add/modify standards without asking first**
- **DO NOT extend checklists or create new verification steps**
- **DO NOT write code or configs based on assumptions**
- **ALWAYS ask user before adding new requirements**

**When encountering gaps in standards:**

1. **STOP development**
2. **Ask user:** "Found [issue]. Should we create standard for this?"
3. **Wait for explicit approval and direction**
4. **Create standard only as instructed by user**

**Examples of what requires user approval:**

- Adding new checklist items
- Creating new verification scripts
- Extending existing standards
- Adding new phase/step requirements
- Modifying workflow processes

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

### Schema Standards (MANDATORY)

**🚨 ALL API routes MUST use TypeBox schemas - NO EXCEPTIONS**

- **See [TypeBox Schema Standard](./docs/05c-typebox-schema-standard.md) for implementation**
- **TypeBox provides both runtime validation and TypeScript types**
- **Use base schemas from `/src/schemas/base.schemas.ts`**
- **Register schemas via schema registry**

### Universal Development Standard (MANDATORY)

**🚨 MUST follow Universal Full-Stack Standard for ALL feature development - NO EXCEPTIONS**

See **[Universal Full-Stack Standard](./docs/development/universal-fullstack-standard.md)** for complete database-first development workflow that must be followed for every feature to prevent integration bugs.

### Feature Development Standard (MANDATORY)

**🚨 MUST follow Feature Development Standard for EVERY feature - NO EXCEPTIONS**

- **See [Feature Development Standard](./docs/development/feature-development-standard.md)** for complete feature lifecycle from planning to completion
- **ALWAYS create feature documentation before coding** using templates from `docs/features/templates/`
- **Reserve resources** in [Resource Registry](./docs/features/RESOURCE_REGISTRY.md) before starting development
- **Follow [Multi-Feature Workflow](./docs/development/multi-feature-workflow.md)** when multiple features are being developed simultaneously
- **Update progress daily** in feature PROGRESS.md files
- **Check [Feature Status Dashboard](./docs/features/README.md)** for coordination with other developers

### Quality Assurance Workflow (MANDATORY)

**🚨 MUST run QA Checklist after every code change - NO EXCEPTIONS**

See **[QA Checklist](./docs/development/qa-checklist.md)** for complete quality assurance steps that must be performed before every commit.

### Testing Workflow (MANDATORY)

**🚨 ALWAYS follow this workflow when writing tests - NO EXCEPTIONS**

**Before writing ANY test:**

1. **📋 Check existing schemas** - Review `*.schemas.ts` files for the module you're testing
2. **🔍 Verify request/response formats** - Ensure test data matches schema exactly
3. **🏗️ Check test app helper** - Ensure all required plugins are registered in test environment
4. **📊 Compare with main app** - Verify test setup mirrors production plugin registration order

**Test Data Rules:**

- **NEVER guess request formats** - Always use schema definitions
- **Match schemas exactly** - Include only fields defined in request schemas
- **Use schema-based factories** - Create separate functions for API-valid test data
- **Check plugin registration** - Ensure test app includes ALL plugins the route needs

**Example Test Workflow:**

```typescript
// 1. Check schema first
import { RegisterRequestSchema } from '../auth.schemas';

// 2. Create API-compatible test data
function createRegisterRequestData() {
  return {
    email: 'test@example.com',
    username: 'testuser',
    password: 'testpass123',
    firstName: 'Test',
    lastName: 'User',
    // ❌ Don't include: role, status, emailVerified (not in schema)
  };
}

// 3. Verify test app helper includes ALL required plugins
```

**ผิดแล้วต้องแก้ทันที - ห้ามเดา!**

## 🔴 IMPORTANT: This project uses PNPM, not NPM or Yarn

**Always use `pnpm` commands, never use `npm` or `yarn` commands for dependencies**

## 🏗️ Multi-Instance Development Setup

**When working on multiple features simultaneously (cloned repos):**

### 📋 Quick Setup (One Command)

```bash
# Auto-configure ports and containers based on folder name
pnpm setup
# This runs: setup-env.sh + docker-compose up + migrations + seeds
```

### 🔧 Manual Setup Steps

```bash
# 1. Configure instance-specific environment
pnpm run setup:env

# 2. Start services with unique ports/containers
pnpm run docker:up

# 3. Initialize database
pnpm run db:migrate && pnpm run db:seed
```

### 📊 Port Assignment Strategy

- **Main repo (aegisx-starter)**: Default ports (5432, 6380, 3333, 4200)
- **Feature repos (aegisx-starter-{name})**: Auto-assigned unique ports
- **Examples**:
  - `aegisx-starter-mpv` → PostgreSQL: 5433, Redis: 6381, API: 3334
  - `aegisx-starter-rbac` → PostgreSQL: 5434, Redis: 6382, API: 3335

### 🛠️ Instance Management Commands

```bash
# View all instances and their ports
./scripts/port-manager.sh list

# Check for port conflicts
./scripts/port-manager.sh conflicts

# Stop specific instance
./scripts/port-manager.sh stop aegisx-starter-mpv

# Stop all instances
./scripts/port-manager.sh stop-all

# Show running services
./scripts/port-manager.sh running

# Clean up unused containers/volumes
./scripts/port-manager.sh cleanup
```

### 🎯 Benefits

- ✅ **Isolated environments** - Each feature has its own database
- ✅ **No port conflicts** - Auto-assigned unique ports
- ✅ **Parallel development** - Work on multiple features simultaneously
- ✅ **Easy switching** - Stop/start instances as needed
- ✅ **Consistent naming** - Folder name determines configuration

## Quick Navigation

### 🚀 Start Here

- **[📖 Getting Started](./docs/getting-started/getting-started.md)** - **อ่านก่อนเริ่มงาน! Git workflow & rules**

### Development Resources

- **[🚨 Current Project Status](./PROJECT_STATUS.md)** - Session recovery & current progress
- **[📚 Complete Documentation](./docs/)** - Organized documentation hub
- **[📊 Feature Status Dashboard](./docs/features/README.md)** - Central feature development tracking
- **[📋 Feature Development Standard](./docs/development/feature-development-standard.md)** - **MANDATORY** feature lifecycle
- **[🤝 Multi-Feature Workflow](./docs/development/multi-feature-workflow.md)** - Parallel development coordination
- **[📝 Resource Registry](./docs/features/RESOURCE_REGISTRY.md)** - Reserve resources to prevent conflicts
- **[📊 Feature Tracking System](./docs/development/feature-tracking.md)** - Track development progress
- **[🚀 Quick Commands](./docs/development/quick-commands.md)** - Claude command reference (/feature, /status, etc.)
- **[🏗️ Project Setup](./docs/getting-started/project-setup.md)** - Bootstrap guide
- **[🔄 Development Workflow](./docs/development/development-workflow.md)** - Step-by-step workflows
- **[🎯 API-First Workflow](./docs/development/api-first-workflow.md)** - Recommended development approach
- **[🏛️ Architecture](./docs/architecture/architecture-overview.md)** - Frontend/Backend patterns
- **[🧪 Testing Strategy](./docs/testing/testing-strategy.md)** - E2E with Playwright MCP
- **[🚀 Deployment](./docs/infrastructure/deployment.md)** - Docker + CI/CD
- **[🤖 MCP Integration](./docs/development/mcp-integration.md)** - Nx MCP & Playwright MCP usage
- **[📋 All Commands Reference](./docs/references/claude-commands.md)** - Complete shell command list

### CI/CD & DevOps

- **[🔄 Git Flow & Release](./docs/infrastructure/git-flow-release-guide.md)** - Branch strategy & release process
- **[📦 Automated Versioning](./docs/infrastructure/automated-versioning-guide.md)** - Conventional commits & changelog
- **[🐳 Monorepo Docker Guide](./docs/infrastructure/monorepo-docker-guide.md)** - Docker management for monorepo
- **[🚀 CI/CD Quick Start](./docs/infrastructure/quick-start-cicd.md)** - GitHub Actions setup & usage
- **[📚 CI/CD Complete Setup](./docs/infrastructure/ci-cd-setup.md)** - Detailed CI/CD documentation

## 🛠️ Technology Stack

- **Frontend**: Angular 19+ with Signals, Angular Material + TailwindCSS
- **Backend**: Fastify 4+ with TypeScript
- **Database**: PostgreSQL 15+ with Knex.js
- **Monorepo**: Nx with Yarn workspaces
- **Testing**: Jest + Playwright + MCP
- **Infrastructure**: Docker + GitHub Actions + GitHub Container Registry

## 🏃‍♂️ Quick Start Commands

```bash
# Install dependencies (⚠️ USE PNPM, NOT NPM OR YARN!)
pnpm install

# Set up environment
cp .env.example .env

# Start databases
pnpm run docker:up

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development
nx run-many --target=serve --projects=api,web
```

## 📋 Most Used Commands

| Command       | Description                      | Actual Command                                  |
| ------------- | -------------------------------- | ----------------------------------------------- |
| **Install**   | Install dependencies (USE PNPM!) | `pnpm install`                                  |
| **DB Setup**  | Run migrations & seeds           | `pnpm db:migrate && pnpm db:seed`               |
| **Develop**   | Start dev servers                | `nx run-many --target=serve --projects=api,web` |
| **Test**      | Run all tests                    | `nx run-many --target=test --all`               |
| **E2E**       | Run E2E tests                    | `nx e2e e2e`                                    |
| **Build**     | Build for production             | `nx run-many --target=build --all`              |
| **Docker**    | Start services                   | `pnpm run docker:up`                            |
| **Docker PS** | Show current instance containers | `pnpm run docker:ps`                            |

## 🚀 Feature Development Commands

| Command       | Description              | Actual Command                                              |
| ------------- | ------------------------ | ----------------------------------------------------------- |
| **Start**     | Start new feature        | `./scripts/feature-toolkit.sh start [name] [priority]`      |
| **Status**    | Check feature progress   | `./scripts/feature-toolkit.sh status [name]`                |
| **Progress**  | Update feature progress  | `./scripts/feature-toolkit.sh progress [name] "[task]" [%]` |
| **Complete**  | Mark feature complete    | `./scripts/feature-toolkit.sh complete [name]`              |
| **Dashboard** | Show all features        | `./scripts/feature-toolkit.sh dashboard`                    |
| **Conflicts** | Check resource conflicts | `./scripts/feature-toolkit.sh conflicts [name]`             |

## 🐳 Multi-Instance Docker Commands

| Command    | Description                   | Actual Command          |
| ---------- | ----------------------------- | ----------------------- |
| **Up**     | Start instance services       | `pnpm run docker:up`    |
| **Down**   | Stop instance services        | `pnpm run docker:down`  |
| **Status** | Show instance containers      | `pnpm run docker:ps`    |
| **Reset**  | Reset instance (down+up+data) | `pnpm run docker:reset` |

### Quick Aliases (add to ~/.bashrc or ~/.zshrc)

```bash
source .feature-aliases  # Load feature command shortcuts
# Then use: fs, fstat, fprog, fcomp, fdash
```

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

_For complete documentation, see individual files in the `docs/` directory._
