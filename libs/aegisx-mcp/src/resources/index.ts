/**
 * AegisX MCP Resources Registration
 */

import { Resource } from '@modelcontextprotocol/sdk/types.js';

/**
 * Register all available resources
 */
export function registerResources(): Resource[] {
  return [
    {
      uri: 'aegisx://design-tokens',
      name: 'Design Tokens',
      description: 'AegisX design tokens: colors, spacing, typography, shadows',
      mimeType: 'text/markdown',
    },
    {
      uri: 'aegisx://development-standards',
      name: 'Development Standards',
      description: 'AegisX development standards, rules, and best practices',
      mimeType: 'text/markdown',
    },
    {
      uri: 'aegisx://api-reference',
      name: 'API Reference',
      description: 'Backend API conventions, response formats, error handling',
      mimeType: 'text/markdown',
    },
    {
      uri: 'aegisx://project-structure',
      name: 'Project Structure',
      description: 'Monorepo structure, folder conventions, file naming',
      mimeType: 'text/markdown',
    },
    {
      uri: 'aegisx://quick-start',
      name: 'Quick Start Guide',
      description: 'Getting started with AegisX development',
      mimeType: 'text/markdown',
    },
  ];
}

/**
 * Handle resource read requests
 */
export function handleResourceRead(uri: string): {
  contents: Array<{ uri: string; mimeType: string; text: string }>;
} {
  const content = getResourceContent(uri);

  return {
    contents: [
      {
        uri,
        mimeType: 'text/markdown',
        text: content,
      },
    ],
  };
}

function getResourceContent(uri: string): string {
  switch (uri) {
    case 'aegisx://design-tokens':
      return getDesignTokensContent();
    case 'aegisx://development-standards':
      return getDevelopmentStandardsContent();
    case 'aegisx://api-reference':
      return getApiReferenceContent();
    case 'aegisx://project-structure':
      return getProjectStructureContent();
    case 'aegisx://quick-start':
      return getQuickStartContent();
    default:
      return `Resource not found: ${uri}`;
  }
}

function getDesignTokensContent(): string {
  return `# AegisX Design Tokens

## Color Tokens

### Primary Colors
\`\`\`css
--ax-primary-50: #e3f2fd;
--ax-primary-100: #bbdefb;
--ax-primary-200: #90caf9;
--ax-primary-300: #64b5f6;
--ax-primary-400: #42a5f5;
--ax-primary-500: #2196f3;  /* Default */
--ax-primary-600: #1e88e5;
--ax-primary-700: #1976d2;
--ax-primary-800: #1565c0;
--ax-primary-900: #0d47a1;
\`\`\`

### Accent Colors
\`\`\`css
--ax-accent-50: #fce4ec;
--ax-accent-500: #e91e63;  /* Default */
--ax-accent-900: #880e4f;
\`\`\`

### Semantic Colors
\`\`\`css
--ax-success: #4caf50;
--ax-warning: #ff9800;
--ax-error: #f44336;
--ax-info: #2196f3;
\`\`\`

### Neutral Colors
\`\`\`css
--ax-gray-50: #fafafa;
--ax-gray-100: #f5f5f5;
--ax-gray-200: #eeeeee;
--ax-gray-300: #e0e0e0;
--ax-gray-400: #bdbdbd;
--ax-gray-500: #9e9e9e;
--ax-gray-600: #757575;
--ax-gray-700: #616161;
--ax-gray-800: #424242;
--ax-gray-900: #212121;
\`\`\`

## Spacing Tokens

\`\`\`css
--ax-space-0: 0;
--ax-space-1: 0.25rem;   /* 4px */
--ax-space-2: 0.5rem;    /* 8px */
--ax-space-3: 0.75rem;   /* 12px */
--ax-space-4: 1rem;      /* 16px */
--ax-space-5: 1.25rem;   /* 20px */
--ax-space-6: 1.5rem;    /* 24px */
--ax-space-8: 2rem;      /* 32px */
--ax-space-10: 2.5rem;   /* 40px */
--ax-space-12: 3rem;     /* 48px */
--ax-space-16: 4rem;     /* 64px */
--ax-space-20: 5rem;     /* 80px */
--ax-space-24: 6rem;     /* 96px */
\`\`\`

## Typography

### Font Families
\`\`\`css
--ax-font-sans: 'Inter', system-ui, sans-serif;
--ax-font-mono: 'JetBrains Mono', monospace;
\`\`\`

### Font Sizes
\`\`\`css
--ax-text-xs: 0.75rem;    /* 12px */
--ax-text-sm: 0.875rem;   /* 14px */
--ax-text-base: 1rem;     /* 16px */
--ax-text-lg: 1.125rem;   /* 18px */
--ax-text-xl: 1.25rem;    /* 20px */
--ax-text-2xl: 1.5rem;    /* 24px */
--ax-text-3xl: 1.875rem;  /* 30px */
--ax-text-4xl: 2.25rem;   /* 36px */
\`\`\`

### Font Weights
\`\`\`css
--ax-font-light: 300;
--ax-font-normal: 400;
--ax-font-medium: 500;
--ax-font-semibold: 600;
--ax-font-bold: 700;
\`\`\`

## Border Radius

\`\`\`css
--ax-radius-none: 0;
--ax-radius-sm: 0.125rem;   /* 2px */
--ax-radius-md: 0.375rem;   /* 6px */
--ax-radius-lg: 0.5rem;     /* 8px */
--ax-radius-xl: 0.75rem;    /* 12px */
--ax-radius-2xl: 1rem;      /* 16px */
--ax-radius-full: 9999px;
\`\`\`

## Shadows

\`\`\`css
--ax-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--ax-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--ax-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--ax-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
\`\`\`

## Breakpoints

\`\`\`css
--ax-screen-sm: 640px;
--ax-screen-md: 768px;
--ax-screen-lg: 1024px;
--ax-screen-xl: 1280px;
--ax-screen-2xl: 1536px;
\`\`\`

## Motion

\`\`\`css
--ax-duration-fast: 150ms;
--ax-duration-normal: 300ms;
--ax-duration-slow: 500ms;

--ax-ease-in: cubic-bezier(0.4, 0, 1, 1);
--ax-ease-out: cubic-bezier(0, 0, 0.2, 1);
--ax-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
\`\`\`

## Usage with TailwindCSS

These tokens are available as Tailwind classes:
- Colors: \`text-primary-500\`, \`bg-accent-100\`
- Spacing: \`p-4\`, \`m-6\`, \`gap-8\`
- Typography: \`text-lg\`, \`font-semibold\`
- Radius: \`rounded-lg\`, \`rounded-xl\`
`;
}

function getDevelopmentStandardsContent(): string {
  return `# AegisX Development Standards

## 1. Code Organization

### Backend (Fastify + TypeBox)
- Use TypeBox schemas for ALL request/response validation
- Follow repository pattern for database access
- Use dependency injection via Fastify decorators
- Implement soft delete using \`deleted_at\` field

### Frontend (Angular 17+)
- Use standalone components
- Prefer Signals over BehaviorSubject
- Use \`inject()\` for dependency injection
- Use @if/@for control flow syntax

## 2. File Naming Conventions

\`\`\`
Backend:
  {feature}.routes.ts      - Route definitions
  {feature}.controller.ts  - Request handlers
  {feature}.service.ts     - Business logic
  {feature}.repository.ts  - Database operations
  {feature}.schemas.ts     - TypeBox schemas
  {feature}.types.ts       - TypeScript types

Frontend:
  {feature}.component.ts   - Component
  {feature}.service.ts     - HTTP service
  {feature}.types.ts       - Interfaces
  {feature}.routes.ts      - Route config
\`\`\`

## 3. API Design

### URL Patterns
- Use kebab-case: \`/api/user-profiles\`
- Use plural nouns: \`/api/products\` (not \`/api/product\`)
- Nest related resources: \`/api/users/:userId/orders\`

### HTTP Methods
- GET: Read operations
- POST: Create operations
- PATCH: Partial update
- DELETE: Remove (soft delete by default)

### Response Format
\`\`\`typescript
// Success (single item)
{
  "id": "uuid",
  "name": "Item Name",
  "createdAt": "2024-01-01T00:00:00Z"
}

// Success (list with pagination)
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}

// Error
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed"
}
\`\`\`

## 4. Database Conventions

### Table Naming
- Use snake_case: \`user_profiles\`
- Use plural: \`products\` (not \`product\`)

### Column Naming
- Use snake_case: \`created_at\`, \`user_id\`
- Foreign keys: \`{related_table}_id\`

### Required Columns
\`\`\`sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP DEFAULT NOW()
deleted_at  TIMESTAMP NULL  -- Soft delete
created_by  UUID REFERENCES users(id)
updated_by  UUID REFERENCES users(id)
\`\`\`

## 5. Git Workflow

### Branch Naming
- feature/{ticket}-{description}
- fix/{ticket}-{description}
- chore/{description}

### Commit Messages
\`\`\`
feat(scope): add new feature
fix(scope): fix bug description
refactor(scope): refactor code
docs(scope): update documentation
test(scope): add tests
chore(scope): maintenance task
\`\`\`

### Commit Rules
- NEVER use \`git add -A\` or \`git add .\`
- ALWAYS run \`pnpm run build\` before committing
- NEVER include "BREAKING CHANGE" in commits

## 6. Testing Requirements

### Unit Tests
- Test services with mocked dependencies
- Test pure functions
- Aim for >80% coverage on business logic

### Integration Tests
- Test API endpoints with real database
- Test authentication flows
- Test error handling

### E2E Tests
- Critical user flows only
- Use Playwright
- Run in CI pipeline

## 7. Security Standards

### Authentication
- Use JWT with short expiration (15 min access, 7 day refresh)
- Store refresh tokens securely
- Implement rate limiting

### Authorization
- Use role-based access control (RBAC)
- NEVER return \`reply.forbidden()\` in preValidation hooks
- ALWAYS use \`return reply.unauthorized()\` or \`return reply.forbidden()\`

### Input Validation
- ALWAYS validate with TypeBox schemas
- Sanitize user input
- Use parameterized queries (Knex handles this)

## 8. Performance Guidelines

### Backend
- Use pagination for list endpoints
- Add database indexes for common queries
- Use connection pooling

### Frontend
- Use lazy loading for routes
- Implement virtual scrolling for long lists
- Use OnPush change detection

## 9. Documentation Requirements

### Every Feature Needs:
- README.md - Overview
- API_CONTRACTS.md - API documentation
- DEVELOPER_GUIDE.md - Implementation details
- Inline JSDoc comments
`;
}

function getApiReferenceContent(): string {
  return `# AegisX API Reference

## Base URL

\`\`\`
Development: http://localhost:{PORT}/api
Production: https://api.example.com/api
\`\`\`

## Authentication

### Login
\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

Response:
\`\`\`json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
\`\`\`

### Refresh Token
\`\`\`http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
\`\`\`

### Protected Routes
Add Authorization header:
\`\`\`http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
\`\`\`

## Standard CRUD Endpoints

For any resource (e.g., \`products\`):

### List All
\`\`\`http
GET /api/products?page=1&limit=20&search=keyword&sortBy=name&sortOrder=asc
\`\`\`

Query Parameters:
- \`page\` - Page number (default: 1)
- \`limit\` - Items per page (default: 20, max: 100)
- \`search\` - Search term
- \`sortBy\` - Sort field
- \`sortOrder\` - \`asc\` or \`desc\`

### Get One
\`\`\`http
GET /api/products/:id
\`\`\`

### Create
\`\`\`http
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "price": 99.99
}
\`\`\`

### Update
\`\`\`http
PATCH /api/products/:id
Content-Type: application/json

{
  "name": "Updated Name"
}
\`\`\`

### Delete
\`\`\`http
DELETE /api/products/:id
\`\`\`

## Error Responses

### 400 Bad Request
\`\`\`json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "body/name must NOT have fewer than 1 characters"
}
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
\`\`\`

### 403 Forbidden
\`\`\`json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Product not found"
}
\`\`\`

### 500 Internal Server Error
\`\`\`json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
\`\`\`

## Rate Limiting

- 100 requests per minute per IP for public endpoints
- 1000 requests per minute for authenticated users

Headers:
\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
\`\`\`

## File Upload

\`\`\`http
POST /api/files/upload
Content-Type: multipart/form-data

file: (binary)
\`\`\`

Response:
\`\`\`json
{
  "id": "uuid",
  "filename": "document.pdf",
  "mimeType": "application/pdf",
  "size": 12345,
  "url": "/api/files/uuid"
}
\`\`\`

## WebSocket Events

Connect to: \`ws://localhost:{PORT}/ws\`

### Subscribe to Events
\`\`\`json
{
  "type": "subscribe",
  "channel": "products"
}
\`\`\`

### Event Types
- \`created\` - New item created
- \`updated\` - Item updated
- \`deleted\` - Item deleted

Event Format:
\`\`\`json
{
  "type": "products.created",
  "data": {
    "id": "uuid",
    "name": "New Product"
  }
}
\`\`\`
`;
}

function getProjectStructureContent(): string {
  return `# AegisX Project Structure

## Monorepo Layout

\`\`\`
aegisx-starter/
├── apps/
│   ├── api/                    # Fastify backend
│   │   ├── src/
│   │   │   ├── core/           # Core functionality
│   │   │   │   ├── auth/       # Authentication
│   │   │   │   ├── database/   # DB connection
│   │   │   │   └── plugins/    # Fastify plugins
│   │   │   ├── modules/        # Feature modules
│   │   │   │   ├── users/
│   │   │   │   ├── products/
│   │   │   │   └── ...
│   │   │   ├── schemas/        # Shared schemas
│   │   │   └── app.ts          # App entry
│   │   └── package.json
│   │
│   ├── admin/                  # Angular admin app
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/       # Core services
│   │   │   │   ├── features/   # Feature modules
│   │   │   │   ├── shared/     # Shared components
│   │   │   │   ├── config/     # App config
│   │   │   │   └── routes/     # Route definitions
│   │   │   ├── assets/
│   │   │   └── environments/
│   │   └── package.json
│   │
│   └── web/                    # Angular public app
│       └── (similar structure)
│
├── libs/
│   ├── aegisx-ui/              # UI component library
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── services/       # UI services
│   │   │   └── theme/          # Theme styles
│   │   └── package.json
│   │
│   ├── aegisx-cli/  # CRUD generator CLI
│   │   ├── bin/                # CLI entry
│   │   ├── src/
│   │   │   ├── commands/       # CLI commands
│   │   │   ├── generators/     # Code generators
│   │   │   └── templates/      # Code templates
│   │   └── package.json
│   │
│   └── aegisx-mcp/             # MCP server
│       └── (this project)
│
├── docs/                       # Documentation
│   ├── architecture/
│   ├── development/
│   ├── features/
│   └── infrastructure/
│
├── tools/                      # Build/dev tools
├── docker-compose.yml
├── nx.json                     # Nx configuration
├── package.json
└── tsconfig.base.json
\`\`\`

## Backend Module Structure

\`\`\`
modules/products/
├── products.routes.ts         # Route definitions
├── products.controller.ts     # Request handlers
├── products.service.ts        # Business logic
├── products.repository.ts     # Database operations
├── products.schemas.ts        # TypeBox schemas
├── products.types.ts          # TypeScript types
├── products.import.service.ts # Import (optional)
└── products.events.ts         # Events (optional)
\`\`\`

## Frontend Feature Structure

\`\`\`
features/products/
├── products.component.ts      # Container component
├── products.service.ts        # HTTP service
├── products.types.ts          # TypeScript interfaces
├── products.routes.ts         # Route config
├── components/
│   ├── products-list.component.ts
│   ├── products-form.component.ts
│   ├── products-dialog.component.ts
│   └── products-filters.component.ts
└── index.ts                   # Public API
\`\`\`

## Configuration Files

| File | Purpose |
|------|---------|
| \`nx.json\` | Nx workspace configuration |
| \`tsconfig.base.json\` | Base TypeScript config |
| \`package.json\` | Root dependencies |
| \`.env.local\` | Local environment (auto-generated) |
| \`docker-compose.yml\` | Docker services |
| \`docker-compose.instance.yml\` | Instance-specific Docker |

## Key Commands

\`\`\`bash
# Development
pnpm run dev              # Start all apps
pnpm run dev:api          # Start API only
pnpm run dev:admin        # Start admin app only

# Build
pnpm run build            # Build all
pnpm run build:api        # Build API
pnpm run build:admin      # Build admin

# Database
pnpm run db:migrate       # Run migrations
pnpm run db:seed          # Seed database
pnpm run db:reset         # Reset database

# Testing
pnpm run test             # Run all tests
pnpm run test:api         # Test API
pnpm run e2e              # Run E2E tests

# CRUD Generator
pnpm run crud -- TABLE    # Generate CRUD
pnpm run crud:list        # List tables
\`\`\`
`;
}

function getQuickStartContent(): string {
  return `# AegisX Quick Start Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose
- Git

## Initial Setup

### 1. Clone and Install

\`\`\`bash
git clone https://github.com/your-org/aegisx-starter.git
cd aegisx-starter
pnpm install
\`\`\`

### 2. Run Setup Script

\`\`\`bash
pnpm run setup
\`\`\`

This will:
- Generate \`.env.local\` with unique ports
- Start Docker containers (PostgreSQL, Redis)
- Run database migrations
- Seed initial data

### 3. Start Development

\`\`\`bash
pnpm run dev
\`\`\`

Access:
- API: http://localhost:PORT/api (check .env.local for PORT)
- Admin: http://localhost:4200
- Web: http://localhost:4201

## Creating a New Feature

### 1. Create Database Migration

\`\`\`bash
pnpm run db:make:migration create_products_table
\`\`\`

Edit the migration file:
\`\`\`typescript
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.text('description');
    table.boolean('is_active').defaultTo(true);
    table.uuid('created_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('products');
}
\`\`\`

Run migration:
\`\`\`bash
pnpm run db:migrate
\`\`\`

### 2. Generate CRUD Module

\`\`\`bash
# Generate backend
pnpm run crud -- products --force

# Generate frontend
./bin/cli.js generate products --target frontend --force
\`\`\`

### 3. Add Navigation

Edit \`apps/admin/src/app/config/navigation.config.ts\`:
\`\`\`typescript
{
  id: 'products',
  title: 'Products',
  type: 'basic',
  icon: 'heroicons_outline:cube',
  link: '/products',
}
\`\`\`

### 4. Test Your Feature

\`\`\`bash
# Rebuild
pnpm run build

# Start dev servers
pnpm run dev

# Test API
curl http://localhost:PORT/api/products
\`\`\`

## Common Tasks

### Add New UI Component

\`\`\`typescript
import { AxCardComponent, AxBadgeComponent } from '@aegisx/ui';

@Component({
  imports: [AxCardComponent, AxBadgeComponent],
  template: \`
    <ax-card title="My Card">
      <ax-badge color="success">Active</ax-badge>
    </ax-card>
  \`
})
export class MyComponent {}
\`\`\`

### Add API Endpoint

1. Define schema:
\`\`\`typescript
// products.schemas.ts
export const CreateProductSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  price: Type.Number({ minimum: 0 }),
});
\`\`\`

2. Add route:
\`\`\`typescript
// products.routes.ts
fastify.post('/', {
  schema: { body: CreateProductSchema },
  preValidation: [fastify.verifyJWT],
}, controller.create);
\`\`\`

### Add Protected Route

\`\`\`typescript
fastify.get('/admin-only', {
  preValidation: [
    fastify.verifyJWT,
    fastify.verifyRole(['admin']),
  ],
}, controller.adminEndpoint);
\`\`\`

## Troubleshooting

### Port Conflict
\`\`\`bash
# Check current ports
cat .env.local | grep PORT

# Kill process on port
lsof -ti:PORT | xargs kill
\`\`\`

### Database Connection
\`\`\`bash
# Check Docker containers
docker ps

# Restart containers
docker-compose down && docker-compose up -d
\`\`\`

### Build Errors
\`\`\`bash
# Clean and rebuild
rm -rf dist node_modules/.cache
pnpm install
pnpm run build
\`\`\`

## Resources

- Use \`aegisx_components_list\` to see all UI components
- Use \`aegisx_crud_workflow\` for CRUD generation guide
- Use \`aegisx_patterns_suggest\` for code patterns
`;
}
