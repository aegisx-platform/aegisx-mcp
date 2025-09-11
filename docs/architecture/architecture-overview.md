# Architecture Overview

This document provides an overview of the architecture patterns used in the enterprise monorepo.

## 📁 Architecture Documentation Structure

### 🎨 [Frontend Architecture](./05a-frontend-architecture.md)

Complete Angular 19+ architecture patterns including:

- Angular Feature Module Pattern
- Smart vs Presentational Components
- Signals-based State Management
- Angular Material + TailwindCSS Strategy
- Standalone Components & Control Flow

### ⚙️ [Backend Architecture](./05b-backend-architecture.md)

Complete Fastify 4+ architecture patterns including:

- Plugin-First Architecture
- MANDATORY OpenAPI Schema System
- Knex Integration with CRUD patterns
- Pagination, Filtering & Sorting
- Error Handling & Response Standards
- Essential Enterprise Plugins

## 🏛️ Architecture Principles

### Frontend (Angular 19+)

- **Signals-First**: Primary state management with Angular Signals
- **Standalone Components**: No NgModules, better tree-shaking
- **Feature Modules**: Organized by business domain
- **Material + Tailwind**: Best of both worlds

### Backend (Fastify 4+)

- **Plugin Architecture**: Everything is a plugin
- **Schema-First**: Every route MUST have OpenAPI schema
- **Knex for Database**: Better than raw @fastify/postgres
- **Type Safety**: Full TypeScript integration

## 🔗 Integration Points

### API Contract

- OpenAPI 3.1 specification
- Generated TypeScript types
- Consistent response formats
- Automatic validation

### Data Flow

```
Angular Components ← Signals ← Services ← HTTP Client ← API ← Fastify ← Knex ← PostgreSQL
```

### Module Communication

- Frontend: Signal-based services
- Backend: Plugin dependency injection
- Database: Knex query builder
- API: JSON Schema validation

## 📚 Quick Links

- **[Frontend Patterns](./05a-frontend-architecture.md)** - Angular components, services, routing
- **[Backend Patterns](./05b-backend-architecture.md)** - Fastify plugins, schemas, middleware
