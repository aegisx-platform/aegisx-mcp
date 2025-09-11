# Project Bootstrap Guide

## 🚀 Quick Start

### **Project Setup**

```bash
# Clone the repository
git clone <repository-url>
cd aegisx-starter

# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Start databases
docker-compose up -d

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development
nx run-many --target=serve --projects=api,web
```

### **Project Structure**

The project is already set up with:

1. **Nx Monorepo** - Managing multiple applications
2. **Three Applications**:
   - `apps/api` - Fastify backend with auth system
   - `apps/web` - Angular frontend for users
   - `apps/admin` - Angular admin panel
3. **Database Ready** - PostgreSQL with migrations
4. **Authentication** - JWT with refresh tokens
5. **Development Tools** - ESLint, Prettier, TypeScript
6. **Docker Environment** - PostgreSQL + Redis + PgAdmin

### **Login Credentials (After Seeding)**

- **Super Admin**: admin@aegisx.com / Admin123!
- **Demo Admin**: admin@demo.com / Admin123!
- **Demo Manager**: manager@demo.com / Admin123!
- **Demo User**: user@demo.com / Admin123!

---

## Manual Setup (Alternative)

If you prefer manual setup or need to understand the process:

### Phase 1: Initial Setup & Basic Routes

#### 1. Create Workspace

```bash
# Move existing files temporarily
mv docs ../docs-backup
mv CLAUDE.md ../

# Create Nx workspace
npx create-nx-workspace@latest . \
  --preset=empty \
  --packageManager=yarn \
  --nxCloud=skip

# Restore files
mv ../docs-backup docs
mv ../CLAUDE.md .

# Add Nx plugins
yarn add -D @nx/angular @nx/node @nx/jest @nx/workspace @nx/playwright

# Generate apps
nx g @nx/angular:app frontend --style=scss --routing --standalone
nx g @nx/node:app api --framework=none

# Generate shared libs
nx g @nx/workspace:lib shared/types
nx g @nx/workspace:lib shared/utils
```

#### 2. Create Test API Route

```typescript
// apps/api/src/app/app.ts
import Fastify from 'fastify';

const app = Fastify({ logger: true });

// Health check route for testing
app.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0',
  };
});

// Simple test API route
app.get('/api/test', async () => {
  return {
    message: 'API is working!',
    environment: process.env.NODE_ENV || 'development',
  };
});

export default app;
```

#### 3. Create Test Frontend Route

```typescript
// apps/web/src/app/app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'test',
    loadComponent: () => import('./test/test.component').then((m) => m.TestComponent),
  },
];

// apps/web/src/app/test/test.component.ts
@Component({
  selector: 'app-test',
  standalone: true,
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-4">Web Test Page</h1>
      <button mat-raised-button color="primary" (click)="testApi()">Test API Connection</button>
      <pre>{{ apiResponse | json }}</pre>
    </div>
  `,
})
export class TestComponent {
  apiResponse = signal<any>(null);

  async testApi() {
    const response = await fetch('/api/test');
    const data = await response.json();
    this.apiResponse.set(data);
  }
}

// Similar for apps/admin/src/app/test/test.component.ts
```

## Phase 2: Docker Setup

#### 1. Create Dockerfiles

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn nx build api --prod

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist/apps/api ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "main.js"]
```

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn nx build web --prod

FROM nginx:alpine
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# apps/admin/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn nx build admin --prod --base-href=/admin/

FROM nginx:alpine
COPY --from=builder /app/dist/apps/admin /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Test Docker Build Locally

```bash
# Build images
docker build -f apps/api/Dockerfile -t myapp-api:test .
docker build -f apps/web/Dockerfile -t myapp-web:test .
docker build -f apps/admin/Dockerfile -t myapp-admin:test .

# Run containers
docker run -d -p 3000:3000 myapp-api:test
docker run -d -p 4200:80 myapp-web:test
docker run -d -p 4201:80 myapp-admin:test

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:4200
curl http://localhost:4201/admin
```

## Phase 3: Semantic Release Setup

#### 1. Install Semantic Release

```bash
# Install semantic-release and plugins
yarn add -D \
  semantic-release \
  @semantic-release/changelog \
  @semantic-release/git \
  @semantic-release/github \
  @semantic-release/npm \
  @semantic-release/commit-analyzer \
  @semantic-release/release-notes-generator \
  @semantic-release/exec

# For monorepo support
yarn add -D \
  semantic-release-monorepo \
  @qiwi/multi-semantic-release
```

#### 2. Configure Semantic Release

```json
// .releaserc.json
{
  "branches": ["main", "master"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    [
      "@semantic-release/exec",
      {
        "prepareCmd": "yarn nx affected --target=build --all"
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json", "yarn.lock"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\\n\\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
}
```

#### 3. Multi-Package Release Config

```javascript
// release.config.js
module.exports = {
  extends: 'semantic-release-monorepo',
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    '@semantic-release/git',
    '@semantic-release/github',
  ],
};
```

## Phase 4: GitHub Actions Setup

#### 1. CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run tests
        run: |
          yarn nx affected --target=lint --base=origin/main
          yarn nx affected --target=test --base=origin/main
          yarn nx affected --target=build --base=origin/main

  build-and-push:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    strategy:
      matrix:
        app: [api, web, admin]

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ github.repository }}-${{ matrix.app }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/${{ matrix.app }}/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  release:
    needs: build-and-push
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      packages: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

## Phase 5: Validate Everything

#### Test Checklist

```bash
# 1. Local Development
yarn dev:api          # API works?
yarn dev:web          # Web app works?
yarn dev:admin        # Admin app works?
curl http://localhost:3000/health  # Health check OK?

# 2. Docker Build
docker build -f apps/api/Dockerfile -t test-api .
docker build -f apps/web/Dockerfile -t test-web .
docker build -f apps/admin/Dockerfile -t test-admin .
docker run -p 3000:3000 test-api
docker run -p 4200:80 test-web
docker run -p 4201:80 test-admin

# 3. Push to GitHub
git add .
git commit -m "feat: initial setup with test routes"
git push origin main

# 4. Check GitHub Actions
# - Go to Actions tab
# - Verify CI/CD pipeline runs
# - Check docker images in Packages

# 5. Verify Registry
# - Go to github.com/[username]?tab=packages
# - See docker images published

# 6. Test Semantic Release
git commit -m "feat: add new feature"
git push  # Should trigger version bump

git commit -m "fix: fix bug"
git push  # Should trigger patch version

git commit -m "feat!: breaking change"
git push  # Should trigger major version
```

## Bootstrap Commands for Claude

#### **`/bootstrap`** - Initialize project with test routes

```bash
# Claude will:
1. Create basic API health route
2. Create test frontend page
3. Setup Docker files
4. Configure GitHub Actions
5. Setup Semantic Release
6. Create first commit
```

#### **`/validate-pipeline`** - Test entire pipeline

```bash
# Claude will help:
1. Build Docker images
2. Run containers locally
3. Test GitHub Actions
4. Verify registry push
5. Test semantic versioning
```

## Development Approach Templates

#### **Backend-First Approach**

```markdown
Phase 1: Backend Development

- [ ] Design API specification
- [ ] Create database schema
- [ ] Implement backend logic
- [ ] Write API tests
- [ ] Document API

Phase 2: Frontend Development

- [ ] Generate types from API
- [ ] Build UI components
- [ ] Connect to real API
- [ ] Write E2E tests

Phase 3: Integration

- [ ] End-to-end testing
- [ ] Performance optimization
```

#### **Frontend-First Approach**

```markdown
Phase 1: Frontend with Mocks

- [ ] Design UI/UX
- [ ] Build components with mock data
- [ ] Create mock API service
- [ ] Write component tests

Phase 2: Backend Development

- [ ] Implement API to match mocks
- [ ] Create database schema
- [ ] Write API tests

Phase 3: Integration

- [ ] Replace mocks with real API
- [ ] Integration testing
- [ ] E2E testing
```

#### **Parallel Development**

```markdown
Phase 1: API Contract

- [ ] Define OpenAPI spec together
- [ ] Generate types for both sides

Phase 2: Parallel Work
Backend Team:

- [ ] Implement API
- [ ] Database setup
- [ ] API tests

Frontend Team:

- [ ] Build UI with mock API
- [ ] Component development
- [ ] Frontend tests

Phase 3: Integration

- [ ] Connect frontend to backend
- [ ] Integration testing
- [ ] E2E testing with Playwright
```

## Project Overview

Full-stack enterprise application with multi-tenant support, role-based access control, and separate user/admin portals built with Nx monorepo architecture.

## Technology Stack

### Frontend

- Framework: Angular 19+
- TypeScript: 5.2+ (Angular-specific configuration)
- State Management: Angular Signals (primary), NgRx (complex scenarios)
- UI Libraries: Angular Material + TailwindCSS
- Applications:
  - `web`: Public-facing application (user portal)
  - `admin`: Administrative application (admin portal)

### Backend

- Framework: Fastify 4+ with TypeScript
- TypeScript: 5.2+ (Node.js-specific configuration)
- Database: PostgreSQL 15+
- Query Builder: Knex.js
- ORM (optional): Prisma for type generation
- Authentication: JWT with refresh tokens

### Infrastructure

- Monorepo: Nx
- Package Manager: Yarn with workspaces
- Version Control: Git + GitHub
- Versioning: Lerna + Conventional Commits
- API Contract: OpenAPI 3.0
- CI/CD: GitHub Actions
- Container: Docker
- Registry: GitHub Container Registry (ghcr.io)
- Reverse Proxy: Nginx Proxy Manager

### Testing & Quality

- Unit Testing: Jest
- E2E Testing: Playwright + MCP (Model Context Protocol)
- Visual Testing: Playwright screenshots & visual regression
- API Testing: Supertest
- Code Formatting: Prettier
- Linting: ESLint
- Git Hooks: Husky
- Commit Linting: Commitlint

## Project Structure

```
monorepo-root/
├── .github/workflows/          # CI/CD pipelines
├── .husky/                     # Git hooks
├── apps/
│   ├── web/                    # Angular web app
│   │   ├── src/
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.spec.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── project.json
│   ├── admin/                  # Angular admin app
│   │   ├── src/
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.spec.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── project.json
│   └── api/                    # Fastify backend
│       ├── src/
│       │   ├── modules/
│       │   ├── middleware/
│       │   ├── database/
│       │   └── utils/
│       ├── tsconfig.app.json
│       ├── tsconfig.spec.json
│       ├── tsconfig.json
│       ├── Dockerfile
│       └── project.json
├── libs/
│   ├── ui-kit/                # Shared Angular components
│   ├── auth/                  # Shared auth logic
│   ├── utils/                 # Universal utilities
│   └── api-client/            # Generated from OpenAPI
├── e2e/
│   ├── web-e2e/
│   ├── admin-e2e/
│   └── api-e2e/
├── database/
│   ├── migrations/            # Knex migrations
│   ├── seeds/                 # Knex seeds
│   └── knexfile.ts
├── openapi/
│   └── schema.yaml            # API specification
├── nginx/
│   ├── nginx.conf
│   ├── default.conf
│   └── proxy-manager/
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── .env.example
├── scripts/
│   ├── generate-api.sh
│   └── release.sh
├── tsconfig.base.json         # Root TypeScript config
├── tsconfig.frontend.json     # Angular base config
├── tsconfig.backend.json      # Node.js base config
├── nx.json
├── package.json
├── lerna.json
├── .prettierrc.json
├── .eslintrc.json
├── .commitlintrc.json
└── yarn.lock
```
