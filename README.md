# AegisX Starter - Enterprise-Ready Full Stack Application

> A production-ready monorepo starter template with Angular 19, Fastify, PostgreSQL, Redis, and comprehensive RBAC system.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Key Features

### ✅ Core Platform Features

- **🤖 CRUD Generator v2.2.0** - Material Dialog structure + Optional chaining (100% platform alignment, ready for npm publish)
- **🔐 Enterprise RBAC** - Complete role-based access control with multi-role support
  - Navigation Management (✅ Complete with UI)
  - Permission Management
  - Role Management
  - User Role Assignment
- **⚡ Real-Time Features** - WebSocket integration with event-driven architecture
- **📦 Bulk Import System** - Excel/CSV import with validation and progress tracking
- **🔑 API Keys Management** - Secure API key generation and validation with Redis caching
- **📎 Attachment System** - Config-driven polymorphic attachments for any entity
- **🎨 Material Design** - Angular 19 with Signals, Material Design, Material Icons
- **🐳 DevOps Ready** - Docker, CI/CD, Multi-instance development support

### 🏗️ Architecture Highlights

- **Frontend**: Angular 19 with Signals, Angular Material, TailwindCSS, Material Icons
- **Backend**: Fastify 4 with plugin architecture, TypeBox validation
- **Database**: PostgreSQL 15 with Knex.js migrations
- **Caching**: Redis for sessions and permission caching (99% query reduction)
- **Authentication**: JWT + Refresh Tokens in httpOnly cookies
- **Authorization**: Multi-Role RBAC with wildcard permissions (`*:*`)
- **Real-Time**: Socket.io with optional event-driven updates
- **Type Safety**: 100% TypeScript coverage with strict mode

## 📦 What's Included

```
aegisx-starter/
├── apps/
│   ├── api/          # Fastify backend (14 core modules)
│   ├── web/          # Angular web app (10 core features)
│   ├── admin/        # Angular admin panel
│   └── e2e/          # Playwright E2E tests
├── libs/
│   ├── aegisx-crud-generator/  # CRUD generator (@aegisx/crud-generator)
│   ├── aegisx-ui/    # Shared UI components
│   └── shared/       # Shared utilities
├── docs/             # Comprehensive documentation
│   ├── crud-generator/    # 8 CRUD generator guides
│   ├── features/          # Feature documentation
│   ├── development/       # Development workflows
│   └── infrastructure/    # DevOps & deployment
└── scripts/          # Automation scripts
```

## 🛠️ Quick Start

### Prerequisites

- **Node.js 18+**
- **PNPM** (run `npm install -g pnpm`)
- **Docker & Docker Compose**

### Installation

```bash
# Clone the repository
git clone git@github.com:aegisx-platform/aegisx-starter.git
cd aegisx-starter

# Install dependencies (⚠️ USE PNPM, NOT NPM OR YARN!)
pnpm install

# Configure environment and start services
pnpm run setup
# This runs: setup-env.sh + docker:up + db:migrate + db:seed
```

### Manual Setup (Alternative)

```bash
# 1. Configure instance-specific environment
pnpm run setup:env

# 2. Start PostgreSQL and Redis
pnpm run docker:up

# 3. Run database migrations
pnpm run db:migrate

# 4. Seed database with initial data
pnpm run db:seed

# 5. Start development servers
pnpm run dev
# Or separately:
pnpm run dev:api   # API server
pnpm run dev:web   # Web application
```

### Access Applications

**⚠️ Note**: Ports are auto-assigned based on folder name (see `.env.local` after setup)

**Default Instance (`aegisx-starter`)**:

- **API**: http://localhost:3333
- **Web App**: http://localhost:4200
- **API Documentation**: http://localhost:3333/documentation

**For other instances** (e.g., `aegisx-starter-1`):

- Check `.env.local` for your assigned ports
- Example: `API_PORT=3383`, `WEB_PORT=4249`

### Monitoring & Health

- **Health Check**: `http://localhost:{API_PORT}/health`
- **Metrics**: `http://localhost:{API_PORT}/metrics`

## 🔐 Default Credentials

### Admin User

- **Email**: `admin@aegisx.local`
- **Password**: `Admin123!`
- **Roles**: Admin (has `*:*` wildcard permission)

### Manager User

- **Email**: `manager@aegisx.local`
- **Password**: `Manager123!`
- **Roles**: Manager (limited permissions)

### Test User

- **Email**: `user@aegisx.local`
- **Password**: `User123!`
- **Roles**: User (basic permissions)

## 🤖 CRUD Generator Quick Start

The CRUD Generator creates complete full-stack CRUD operations in seconds.

### Installation

```bash
# Publish to npm (for global use)
cd libs/aegisx-crud-generator
npm publish

# Or use locally
pnpm aegisx-crud <module-name> --package
```

### Basic Usage

```bash
# Generate basic CRUD
pnpm aegisx-crud products --package

# Generate with import functionality
pnpm aegisx-crud inventory --package --with-import

# Generate with WebSocket events
pnpm aegisx-crud notifications --package --with-events

# Generate with both import and events
pnpm aegisx-crud patients --package --with-import --with-events

# Dry run (preview without creating files)
pnpm aegisx-crud orders --package --dry-run

# Force overwrite existing files
pnpm aegisx-crud products --package --force
```

### Generated Files

**Backend** (6 files):

- Controller with 8+ endpoints
- Service with business logic
- Repository with BaseRepository pattern
- Routes with TypeBox validation
- Schemas with OpenAPI documentation
- Unit tests

**Frontend** (6 files):

- List component with Material table
- Create/Edit/View dialogs
- Import dialog (if `--with-import`)
- Service with 8+ API methods
- Types matching backend schemas
- Complete CRUD workflow

📚 **Complete Documentation**: See [`docs/crud-generator/`](./docs/crud-generator/) for comprehensive guides.

## 📚 Documentation

### 🚀 Start Here

- **[📖 Getting Started](./docs/getting-started/getting-started.md)** - **READ FIRST! Git workflow & essential rules**
- **[🚨 Project Status](./PROJECT_STATUS.md)** - Current development status & session recovery
- **[🤖 Claude Instructions](./CLAUDE.md)** - Instructions for AI development assistant

### Core Documentation

- **[🤖 CRUD Generator](./docs/crud-generator/)** - Complete CRUD generator documentation (8 guides)
  - [User Guide](./docs/crud-generator/USER_GUIDE.md) - How to use the generator
  - [Events Guide](./docs/crud-generator/EVENTS_GUIDE.md) - WebSocket integration
  - [Import Guide](./docs/crud-generator/IMPORT_GUIDE.md) - Bulk import system
  - [Quick Commands](./docs/crud-generator/QUICK_COMMANDS.md) - Command reference

### Development Guides

- **[🔄 Development Workflow](./docs/development/development-workflow.md)** - Step-by-step workflows
- **[🎯 API-First Workflow](./docs/development/api-first-workflow.md)** - Recommended development approach
- **[📋 Feature Development Standard](./docs/development/feature-development-standard.md)** - **MANDATORY** feature lifecycle
- **[🤝 Multi-Feature Workflow](./docs/development/multi-feature-workflow.md)** - Parallel development coordination
- **[🚀 Quick Commands](./docs/development/quick-commands.md)** - Claude command reference

### Architecture Documentation

- **[🏛️ Architecture Overview](./docs/architecture/architecture-overview.md)** - System architecture
- **[Frontend Architecture](./docs/architecture/frontend-architecture.md)** - Angular patterns & practices
- **[Backend Architecture](./docs/architecture/backend-architecture.md)** - Fastify patterns & practices

### Feature Documentation

- **[📊 Feature Status Dashboard](./docs/features/README.md)** - Central feature tracking
- **[📝 Resource Registry](./docs/features/RESOURCE_REGISTRY.md)** - Reserve resources to prevent conflicts
- **[🔐 RBAC Feature](./docs/features/rbac/)** - Role-based access control documentation
- **[📎 Attachment System](./docs/features/attachment-system/)** - Config-driven attachments
- **[🔑 API Keys](./docs/features/api-keys/)** - API key management

### CI/CD & DevOps

- **[🔄 Git Flow & Release](./docs/infrastructure/git-flow-release-guide.md)** - Branch strategy & release process
- **[📦 Automated Versioning](./docs/infrastructure/automated-versioning-guide.md)** - Conventional commits & changelog
- **[🐳 Monorepo Docker Guide](./docs/infrastructure/monorepo-docker-guide.md)** - Docker management for monorepo
- **[🚀 CI/CD Quick Start](./docs/infrastructure/quick-start-cicd.md)** - GitHub Actions setup & usage

## 🧪 Testing

```bash
# Run unit tests
nx run-many --target=test --all

# Run E2E tests
nx e2e e2e

# Test specific project
nx test api
nx test web

# Run tests with coverage
nx test api --coverage
```

## 🔧 Common Tasks

### Database Operations

```bash
# Create new migration
npx knex migrate:make migration_name

# Run migrations
pnpm run db:migrate

# Rollback migrations
pnpm run db:rollback

# Seed database
pnpm run db:seed

# Reset database (rollback + migrate + seed)
pnpm run db:reset
```

### Multi-Instance Development

**When working on multiple features simultaneously:**

```bash
# View all instances and their ports
./scripts/port-manager.sh list

# Check for port conflicts
./scripts/port-manager.sh conflicts

# Stop specific instance
./scripts/port-manager.sh stop aegisx-starter-feature-x

# Stop all instances
./scripts/port-manager.sh stop-all

# Show running services
./scripts/port-manager.sh running
```

### Docker Operations

```bash
# Start services
pnpm run docker:up

# Stop services
pnpm run docker:down

# View logs
pnpm run docker:logs

# Reset (down + up + migrate + seed)
pnpm run docker:reset

# Show current instance containers
pnpm run docker:ps
```

### API Testing

```bash
# Health check (replace PORT with your API_PORT from .env.local)
curl http://localhost:3333/health

# Login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@aegisx.local", "password": "Admin123!"}'

# Get profile (with token)
curl http://localhost:3333/api/auth/me \
  -H "Authorization: Bearer <access-token>"
```

## 📁 Project Structure

### Backend Modules (14 Core Modules)

```
apps/api/src/
├── core/                    # Core system modules
│   ├── auth/               # Authentication & JWT
│   ├── users/              # User management
│   ├── rbac/               # Role-Based Access Control
│   ├── api-keys/           # API key management
│   ├── navigation/         # Dynamic navigation system
│   ├── settings/           # Application settings
│   ├── user-profile/       # User profiles & preferences
│   ├── file-upload/        # File upload system
│   ├── pdf-export/         # PDF generation
│   ├── pdf-templates/      # PDF template management
│   ├── monitoring/         # System monitoring
│   ├── websocket/          # Real-time events
│   └── system/             # Core system functionality
├── database/
│   ├── migrations/         # Database migrations
│   └── seeds/              # Seed data
├── modules/                # Business modules (empty - ready for HIS, Inventory, etc.)
└── plugins/                # Shared Fastify plugins
```

### Frontend Features (10 Core Features)

```
apps/web/src/app/
├── core/                   # Core application features
│   ├── auth/              # Authentication
│   ├── navigation/        # Navigation system
│   ├── rbac/              # RBAC management UI
│   │   ├── pages/
│   │   │   ├── rbac-dashboard/        # ✅ Complete
│   │   │   ├── navigation-management/ # ✅ Complete
│   │   │   ├── role-management/       # 🏗️ In Progress
│   │   │   ├── permission-management/ # 🏗️ In Progress
│   │   │   └── user-role-assignment/  # 🏗️ In Progress
│   │   ├── dialogs/       # Shared dialogs
│   │   ├── directives/    # Permission directives
│   │   └── guards/        # Route guards
│   ├── settings/          # Settings management
│   ├── user-profile/      # User profile & preferences
│   └── users/             # User management
├── features/              # Business features (empty - ready for HIS, Inventory, etc.)
├── shared/                # Shared components & services
└── app.routes.ts          # Main routing
```

## 🚀 Deployment

### Docker Build

```bash
# Build all applications
docker-compose -f docker-compose.prod.yml build

# Run in production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

See `.env.example` for all available environment variables.

**Key variables**:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `SESSION_SECRET`: Secret for sessions
- `NODE_ENV`: Environment (development/production/test)
- `API_PORT`: API server port (auto-assigned for multi-instance)
- `WEB_PORT`: Web server port (auto-assigned for multi-instance)

## 🎯 Technology Stack

### Frontend

- **Angular 19+** - Modern web framework with Signals
- **Angular Material** - Material Design components
- **TailwindCSS** - Utility-first CSS framework
- **Material Icons** - Google's Material Design icon font
- **RxJS** - Reactive programming
- **TypeScript 5+** - Static type checking

### Backend

- **Fastify 4+** - High-performance Node.js framework
- **TypeBox** - Runtime validation + TypeScript types
- **Knex.js** - SQL query builder
- **Socket.io** - WebSocket real-time communication
- **bcrypt** - Password hashing
- **jose** - JWT implementation

### Database & Caching

- **PostgreSQL 15+** - Primary database
- **Redis** - Caching & session storage (99% query reduction for permissions)
- **Knex migrations** - Version control for database schema

### Infrastructure

- **Nx** - Monorepo build system
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD
- **PNPM** - Fast, disk space efficient package manager

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Playwright** - E2E testing
- **Winston** - Logging
- **Prometheus** - Metrics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Follow [conventional commits](https://www.conventionalcommits.org/) format
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

**Important**:

- ⚠️ Read [CLAUDE.md](./CLAUDE.md) for development guidelines
- ⚠️ Use PNPM, not npm or yarn
- ⚠️ Follow the [Feature Development Standard](./docs/development/feature-development-standard.md)

## 🏆 Features in Detail

### CRUD Generator v2.1.1

Professional code generation with:

- **HIS Mode** - Data accuracy first (reload trigger pattern)
- **Permission-Based Authorization** - `verifyPermission('resource', 'action')`
- **Import System** - Excel/CSV import with validation
- **WebSocket Events** - Optional real-time updates
- **TypeBox Schemas** - Full request/response validation
- **OpenAPI Documentation** - Auto-generated API docs
- **Base Patterns** - BaseRepository, BaseService, BaseController
- **Type Safety** - Frontend types match backend schemas exactly

### RBAC System (50% Complete)

Complete role-based access control:

- ✅ **Navigation Management** - Full CRUD UI with permissions, filters, bulk operations
- ✅ **Permission Guards** - Route guards and directives
- ✅ **Multi-Role Support** - Users can have multiple roles
- ✅ **Wildcard Permissions** - `*:*` for admin, `resource:*` for resource admins
- ✅ **Redis Caching** - 99% reduction in permission check queries
- 🏗️ **Role Management** - In progress
- 🏗️ **Permission Management** - In progress
- 🏗️ **User Role Assignment** - In progress

### Multi-Instance Support

Parallel development on multiple features:

- **Automatic Port Assignment** - Based on folder name hash
- **Isolated Environments** - Each instance has own database
- **No Port Conflicts** - Auto-generated unique ports
- **Easy Switching** - Start/stop instances as needed
- **Consistent Naming** - Folder name determines configuration

### Real-Time Features

WebSocket integration with optional updates:

- **Event-Driven Architecture** - Backend always emits events
- **Optional Frontend Sync** - Frontend can subscribe to events
- **HIS Mode Compatible** - Data accuracy with reload triggers
- **Bulk Operation Events** - Progress tracking for imports
- **Custom Events** - Easy to add new event types

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with excellent open-source tools:

- [Nx](https://nx.dev) - Smart, extensible build framework
- [Angular](https://angular.io) - Modern web framework
- [Fastify](https://www.fastify.io) - Fast and low overhead web framework
- [PostgreSQL](https://www.postgresql.org) - The world's most advanced open source database
- [Redis](https://redis.io) - In-memory data structure store
- [Material Design](https://material.io) - Google's design system

---

**For detailed documentation, see the [`docs/`](./docs/) directory.**

**Questions?** Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current development status.
