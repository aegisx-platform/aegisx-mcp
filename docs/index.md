---
layout: home

hero:
  name: 'AegisX Platform'
  text: 'Enterprise Full-Stack Framework'
  tagline: 'Angular 19+ · Fastify 4+ · PostgreSQL 15+ · Nx Monorepo'
  image:
    src: /logo.svg
    alt: AegisX Platform
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/aegisx-platform/aegisx-starter-1

features:
  - icon: 🚀
    title: Modern Tech Stack
    details: Built with Angular 19+ Signals, Fastify 4+, PostgreSQL 15+, and Nx monorepo for optimal developer experience and performance.

  - icon: 🏗️
    title: Enterprise Architecture
    details: Production-ready architecture with RBAC, audit logging, file uploads, API response standards, and comprehensive error handling.

  - icon: 🛠️
    title: CRUD Generator
    details: Automatic CRUD API generation with TypeBox validation, bulk operations, Excel/CSV import, and WebSocket events support.

  - icon: 🎨
    title: UI Library
    details: Enterprise Angular UI library with Angular Material + TailwindCSS, theme system, and 50+ production-ready components.

  - icon: 🧪
    title: Testing Suite
    details: Comprehensive testing with Jest unit tests, Playwright E2E, visual regression, accessibility, and performance testing.

  - icon: 📦
    title: Full Documentation
    details: 489+ markdown documents organized in 5-layer architecture with API specs, guides, architecture patterns, and feature specifications.

  - icon: 🔐
    title: Security First
    details: JWT authentication, role-based access control, password hashing, account lockout, email verification, and audit trails.

  - icon: 🚢
    title: CI/CD Ready
    details: GitHub Actions workflows for automated testing, building, Docker deployment, and GitHub Pages documentation publishing.

  - icon: 📊
    title: Monitoring Stack
    details: Built-in system monitoring with CPU/memory metrics, database pool stats, Redis cache analytics, and real-time alerts.
---

## Quick Start

### Prerequisites

- **Node.js:** 22+ (required)
- **pnpm:** 10+ (package manager)
- **PostgreSQL:** 15+ (database)
- **Redis:** 7+ (optional, for caching)

### Installation

```bash
# Clone the repository
git clone https://github.com/aegisx-platform/aegisx-starter-1.git
cd aegisx-starter-1

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run database migrations
pnpm run db:migrate

# Seed database with demo data
pnpm run db:seed

# Start development servers
pnpm run dev
```

### Development Servers

After running `pnpm run dev`, the following servers will start:

- **API Server:** http://localhost:3383
- **Web App:** http://localhost:4249
- **Documentation:** http://localhost:5173 (this site)

### Default Credentials

```
Email: admin@aegisx.local
Password: Admin123!@#
```

## Documentation Structure

This documentation follows the **Diátaxis Framework** with a 5-layer information architecture:

| Section                                                    | Description                                |
| ---------------------------------------------------------- | ------------------------------------------ |
| [Getting Started](/getting-started/getting-started)        | Installation, setup, first steps           |
| [Guides](/guides/development/feature-development-standard) | How-to guides, workflows, best practices   |
| [Reference](/reference/api/api-response-standard)          | API docs, CLI commands, standards          |
| [Architecture](/architecture/concepts/module-isolation)    | System design, patterns, concepts          |
| [Features](/features/)                                     | Feature specifications and API contracts   |
| [Analysis](/analysis/platform/fuse-integration-summary)    | Technical analysis and research            |
| [Reports](/reports/ui-test-report)                         | Testing reports and audits                 |
| [Archive](/archive/2024-Q4/)                               | Historical documentation and session notes |

## Technology Stack

| Layer               | Technology                     | Version |
| ------------------- | ------------------------------ | ------- |
| **Frontend**        | Angular + Signals              | 19+     |
| **UI Library**      | Angular Material + TailwindCSS | Latest  |
| **Backend**         | Fastify + TypeBox              | 4+      |
| **Database**        | PostgreSQL + Knex.js           | 15+     |
| **Testing**         | Jest + Playwright              | Latest  |
| **Monorepo**        | Nx Workspace                   | Latest  |
| **Package Manager** | pnpm                           | 10+     |
| **Runtime**         | Node.js                        | 22+     |

## Key Features

### 🔐 Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password reset and email verification
- Account lockout after failed attempts
- Audit logging for all authentication events

### 🛠️ Developer Tools

- **CRUD Generator:** Automatic API generation with full TypeScript support
- **MCP Integration:** Nx and Playwright Model Context Protocol servers
- **Hot Reload:** Fast development with Nx build cache
- **Type Safety:** TypeBox schemas for runtime validation
- **Database Migrations:** Knex.js for schema versioning

### 📊 Platform Features

- File upload and attachment management
- PDF export with custom templates
- Excel/CSV import for bulk operations
- WebSocket real-time updates
- System monitoring dashboard
- Redis caching layer
- Department management
- User profile system
- Navigation menu builder
- Settings management

## Community & Support

- **GitHub Repository:** [aegisx-platform/aegisx-starter-1](https://github.com/aegisx-platform/aegisx-starter-1)
- **Issues:** [Report bugs or request features](https://github.com/aegisx-platform/aegisx-starter-1/issues)
- **Documentation:** You're reading it! 📖

## License

This project is released under the [MIT License](https://github.com/aegisx-platform/aegisx-starter-1/blob/main/LICENSE).

---

**Ready to start?** Head over to the [Getting Started Guide](/getting-started/getting-started) to begin your journey with AegisX Platform.
