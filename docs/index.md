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
      text: Get Started →
      link: /getting-started/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/aegisx-platform/aegisx-starter-1

features:
  - icon: 🚀
    title: Modern Tech Stack
    details: Angular 19+ Signals · Fastify 4+ · PostgreSQL 15+ with Nx monorepo
    link: /architecture/architecture-overview
    linkText: Learn more →

  - icon: 🛠️
    title: CRUD Generator
    details: Auto-generate TypeBox-validated APIs with bulk ops & real-time events
    link: /reference/cli/aegisx-cli/README
    linkText: View docs →

  - icon: 🎨
    title: UI Component Library
    details: 50+ production-ready components with Material + TailwindCSS theming
    link: /reference/ui/aegisx-ui-standards
    linkText: Explore components →

  - icon: 🔐
    title: Enterprise Security
    details: JWT auth · RBAC · Audit trails · Password policies · Account lockout
    link: /features/authentication/README
    linkText: Security features →

  - icon: 🧪
    title: Full Testing Suite
    details: Jest · Playwright E2E · Visual regression · Accessibility testing
    link: /guides/testing/testing-strategy
    linkText: Testing guide →

  - icon: 📚
    title: 489+ Documentation Pages
    details: Complete guides, API specs, architecture patterns & feature docs
    link: /getting-started/contributing
    linkText: Browse docs →
---

## Why AegisX Platform?

AegisX is a **production-ready enterprise framework** that eliminates months of boilerplate setup. Built on proven patterns from real-world healthcare and government systems, it provides:

- **Type-safe from DB to UI** - TypeBox schemas ensure runtime validation matches TypeScript types
- **API-First Development** - Generate complete CRUD APIs with migrations, validations, and tests in seconds
- **Multi-tenant Ready** - Department isolation, RBAC, and audit logging built-in
- **Developer Experience** - Hot reload, Nx caching, MCP integration, and comprehensive docs

## Quick Links

<div class="quick-links-grid">

### 🎯 For Developers

- [Getting Started Guide](/getting-started/getting-started) - Installation & first steps
- [Feature Development](/guides/development/feature-development-standard) - Complete workflow
- [API Standards](/reference/api/api-response-standard) - REST API conventions
- [CRUD Generator](/reference/cli/aegisx-cli/README) - Auto-generate boilerplate

### 🏗️ For Architects

- [Architecture Overview](/architecture/architecture-overview) - System design
- [Domain Architecture](/architecture/domain-architecture-guide) - Multi-domain patterns
- [Frontend Patterns](/architecture/frontend-architecture) - Angular best practices
- [Backend Patterns](/architecture/backend-architecture) - Fastify architecture

### 🚀 For DevOps

- [Multi-Instance Setup](/guides/infrastructure/multi-instance-setup) - Parallel dev environments
- [CI/CD Quick Start](/guides/infrastructure/ci-cd/quick-start) - GitHub Actions
- [Docker Guide](/infrastructure/monorepo-docker-guide) - Container deployment
- [Git Flow](/guides/infrastructure/version-management/git-flow-release-guide) - Release strategy

### 🧪 For QA Engineers

- [Testing Strategy](/guides/testing/testing-strategy) - Test architecture
- [API Testing](/guides/testing/api-testing) - Backend testing
- [E2E Testing](/guides/testing/integration-tests) - Playwright tests
- [QA Checklist](/guides/development/qa-checklist) - Quality gates

</div>

## Technology Stack

| Layer          | Technology                     | Version |
| -------------- | ------------------------------ | ------- |
| **Frontend**   | Angular + Signals              | 19+     |
| **UI Library** | Angular Material + TailwindCSS | Latest  |
| **Backend**    | Fastify + TypeBox              | 4+      |
| **Database**   | PostgreSQL + Knex.js           | 15+     |
| **Testing**    | Jest + Playwright              | Latest  |
| **Monorepo**   | Nx Workspace                   | Latest  |

## What You Get Out of the Box

### 🔐 Authentication & Authorization

- JWT with refresh tokens
- Role-based access control (RBAC)
- Password reset & email verification
- Account lockout & audit logging

### 🛠️ Developer Tools

- **CRUD Generator** - Generate APIs in seconds
- **MCP Integration** - Nx & Playwright context servers
- **Hot Reload** - Fast development with Nx cache
- **Type Safety** - TypeBox runtime validation

### 📊 Platform Features

- File upload & attachment system
- PDF export with templates
- Excel/CSV bulk import
- WebSocket real-time updates
- System monitoring dashboard
- Department & user management

---

<div style="text-align: center; margin: 3rem 0;">

**Ready to build?** Start with the [Getting Started Guide](/getting-started/getting-started) or explore [example features](/features/).

[Get Started →](/getting-started/getting-started){.get-started-button}

</div>

<style>
.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.quick-links-grid h3 {
  margin-top: 0;
  color: var(--vp-c-brand-1);
}

.quick-links-grid ul {
  list-style: none;
  padding: 0;
}

.quick-links-grid li {
  margin: 0.5rem 0;
}

.get-started-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--vp-c-brand-1);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.get-started-button:hover {
  background: var(--vp-c-brand-2);
}
</style>
