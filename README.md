# 🚀 AegisX Starter

Enterprise-ready full-stack monorepo starter with Angular, Fastify, and PostgreSQL.

## ✨ Features

### Currently Implemented (v1.0)
- ✅ **Nx Monorepo** - Powerful build system with caching
- ✅ **PostgreSQL Database** - With migrations and seeds
- ✅ **RBAC Schema** - Roles, permissions, and user management ready
- ✅ **Docker Development** - PostgreSQL, Redis, pgAdmin
- ✅ **TypeScript** - Full type safety across the stack
- ✅ **Project Structure** - Scalable architecture

### Coming Soon (v2.0)
- 🔨 JWT Authentication with refresh tokens
- 🔨 User Management API
- 🔨 Angular Authentication UI
- 🔨 Admin Dashboard
- 🔨 Shared UI Components
- 🔨 WebSocket Support
- 🔨 File Upload Service
- 🔨 Email Notifications

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### One Command Setup
```bash
./quick-start.sh
```

### Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start Docker services
docker-compose up -d

# 4. Run migrations (wait 5s for DB to be ready)
npm run db:migrate

# 5. Seed database
npm run db:seed

# 6. Start development
npm run dev
```

## 📁 Project Structure

```
aegisx-starter/
├── apps/
│   ├── api/              # Fastify backend API
│   ├── web/              # Angular web application  
│   └── admin/            # Angular admin panel
├── libs/
│   └── shared/           # Shared types and utilities
├── tools/                # Build tools and scripts
├── docker-compose.yml    # Local development environment
└── nx.json              # Nx configuration
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start all apps
npm run dev:api         # Start API only
npm run dev:web         # Start web only
npm run dev:admin       # Start admin only

# Database
npm run db:migrate      # Run migrations
npm run db:rollback     # Rollback migrations
npm run db:seed         # Seed database
npm run db:reset        # Reset database

# Testing
npm test                # Run all tests
npm run e2e             # Run E2E tests

# Building
npm run build           # Build all apps
npm run build:api       # Build API
npm run build:web       # Build web app
```

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Main database |
| Redis | 6380 | Session store & cache |
| pgAdmin | 5050 | Database management |

## 🔐 Default Credentials

**Admin User**
- Email: `admin@aegisx.local`
- Password: `Admin123!`

**pgAdmin**
- Email: `admin@aegisx.local`
- Password: `admin`

## 📚 Database Schema

The starter includes a complete RBAC (Role-Based Access Control) system:

- **users** - User accounts with secure password hashing
- **roles** - Role definitions (admin, user)
- **permissions** - Granular permissions
- **user_sessions** - JWT refresh token management

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available options.

### Ports
- API: `3333`
- Web: `4200`
- Admin: `4201`
- PostgreSQL: `5432`
- Redis: `6380`
- pgAdmin: `5050`

## 🚀 Deployment

### Docker
```bash
docker build -t aegisx-api apps/api
docker build -t aegisx-web apps/web
```

### Kubernetes
Helm charts coming soon!

## 📖 Documentation

- [Architecture Guide](docs/05-architecture.md)
- [Development Workflow](docs/04-development-workflow.md)
- [API Documentation](docs/05b-backend-architecture.md)
- [Frontend Guide](docs/05a-frontend-architecture.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT

---

Built with ❤️ by [AegisX Platform](https://github.com/aegisx-platform)