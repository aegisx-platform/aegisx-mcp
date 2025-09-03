# AegisX Starter - Enterprise-Ready Full Stack Application

> A production-ready monorepo starter template with Angular 19, Fastify, PostgreSQL, and complete authentication system.

## 🚀 Features

### ✅ Completed Features

- **Database Setup**: PostgreSQL with migrations and seed data
- **Authentication System**: JWT with refresh tokens, RBAC, secure sessions
- **Monorepo Structure**: Nx workspace with 3 applications (API, Web, Admin)
- **Monitoring & Logging**: Winston logging, Prometheus metrics, Health checks
- **Developer Experience**: Hot reload, TypeScript, ESLint, Prettier

### 🏗️ Architecture

- **Frontend**: Angular 19 with Signals, Angular Material, TailwindCSS
- **Backend**: Fastify 4 with plugin architecture
- **Database**: PostgreSQL 15 with Knex.js migrations
- **Authentication**: JWT + Refresh Tokens in httpOnly cookies
- **Authorization**: Role-Based Access Control (RBAC)

## 📦 What's Included

```
aegisx-starter/
├── apps/
│   ├── api/          # Fastify backend API
│   ├── web/          # Angular web application
│   └── admin/        # Angular admin panel
├── libs/             # Shared libraries
├── docs/             # Complete documentation
└── docker-compose.yml
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Yarn (v1.22+)

### Installation

```bash
# Clone the repository
git clone git@github.com:aegisx-platform/aegisx-starter.git
cd aegisx-starter

# Install dependencies
yarn install

# Set up environment
cp .env.example .env

# Start PostgreSQL
docker-compose up -d

# Run database migrations
npx knex migrate:latest

# Seed database with initial data
npx knex seed:run

# Start development servers
nx run-many --target=serve --projects=api,web,admin

# Optional: Start monitoring stack
yarn monitoring:start
```

### Access Applications

- **API**: http://localhost:3333
- **Web App**: http://localhost:4200
- **Admin Panel**: http://localhost:4201
- **API Documentation**: http://localhost:3333/documentation

### Monitoring & Observability

- **Health Check**: http://localhost:3333/health/ready
- **Metrics**: http://localhost:3333/metrics
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3030 (admin/aegisx123)

## 🔐 Default Credentials

### Admin User

- **Email**: admin@aegisx.local
- **Password**: Admin123!

### Test User

- **Email**: test4@example.com
- **Password**: password123

## 📚 Documentation

### 🚀 Start Here

- **[📖 Getting Started Guide](./docs/00-GETTING-STARTED.md)** - **MUST READ! Git workflow, rules, and quick start**

### Quick Links

- [📊 Feature Tracking](./docs/01-feature-tracking.md) - Development progress tracker
- [🚀 Quick Commands](./docs/02-quick-commands.md) - Common commands reference
- [🏗️ Project Setup](./docs/03-project-setup.md) - Detailed setup instructions
- [🔄 Development Workflow](./docs/04-development-workflow.md) - Development best practices
- [🎯 API-First Workflow](./docs/04a-api-first-workflow.md) - Recommended development approach
- [🏛️ Architecture Overview](./docs/05-architecture.md) - System architecture

### Architecture Guides

- [Frontend Architecture](./docs/05a-frontend-architecture.md) - Angular patterns & practices
- [Backend Architecture](./docs/05b-backend-architecture.md) - Fastify patterns & practices
- [Database Migrations](./docs/05b7-database-migrations.md) - Migration strategies
- [RBAC & Authentication](./docs/05b2-rbac-auth.md) - Security implementation

### Development Progress

- [Project Status](./PROJECT_STATUS.md) - Current development status and session recovery

### CI/CD & DevOps Documentation

- [Git Flow & Release Strategy](./docs/GIT-FLOW-RELEASE-GUIDE.md) - Branch management and release process
- [Automated Versioning Guide](./docs/AUTOMATED-VERSIONING-GUIDE.md) - Semantic versioning with conventional commits
- [Monorepo Docker Management](./docs/MONOREPO-DOCKER-GUIDE.md) - Docker strategies for monorepo apps
- [CI/CD Quick Start](./docs/QUICK-START-CICD.md) - Get started with GitHub Actions
- [Complete CI/CD Setup](./docs/CI-CD-SETUP.md) - Detailed DevOps documentation

## 🧪 Testing

```bash
# Run unit tests
nx run-many --target=test --all

# Run e2e tests
nx e2e e2e

# Test specific project
nx test api
nx test web
nx test admin
```

## 🔧 Common Tasks

### Database Operations

```bash
# Create new migration
npx knex migrate:make migration_name

# Run migrations
npx knex migrate:latest

# Rollback migrations
npx knex migrate:rollback

# Reset database
npx knex migrate:rollback --all && npx knex migrate:latest && npx knex seed:run
```

### Generate New Feature (API-First Approach)

```bash
# Recommended workflow for new features:
1. /start [feature]           # Start new feature
2. /feature:api              # Design API contract first
3. /sync:types               # Generate shared types
4. /feature:backend --from-spec  # Backend follows spec
5. /feature:frontend --from-spec # Frontend uses same spec
6. /align:check --watch      # Continuous alignment validation
7. /integration:test         # Verify integration
```

### API Testing

```bash
# Health check
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

### Backend Structure

```
apps/api/src/
├── database/
│   ├── migrations/     # Database migrations
│   └── seeds/          # Seed data
├── modules/
│   └── auth/           # Authentication module
│       ├── auth.plugin.ts
│       ├── auth.routes.ts
│       ├── auth.controller.ts
│       └── services/
├── plugins/            # Shared Fastify plugins
└── types/             # TypeScript definitions
```

### Frontend Structure

```
apps/web/src/
├── app/
│   ├── core/          # Core services, guards
│   ├── features/      # Feature modules
│   ├── shared/        # Shared components
│   └── app.routes.ts  # Main routing
└── assets/
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

Key variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `SESSION_SECRET`: Secret for sessions
- `NODE_ENV`: Environment (development/production)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

Built with:

- [Nx](https://nx.dev) - Smart, extensible build framework
- [Angular](https://angular.io) - Modern web framework
- [Fastify](https://www.fastify.io) - Fast and low overhead web framework
- [PostgreSQL](https://www.postgresql.org) - The world's most advanced open source database

---

For more detailed information, please refer to the [documentation](./docs/README.md).
