# Enterprise Monorepo Application

> **Complete documentation in `docs/` directory. Detailed rules in [docs/development/claude-detailed-rules.md](./docs/development/claude-detailed-rules.md)**

## Critical Development Rules

### 1. Universal Work Rules (MANDATORY)

- **Read docs FIRST** - Check `docs/` before any task
- **Search ENTIRE codebase** - `grep -r` across all directories, not partial
- **Test BEFORE changes** - `pnpm run build` must pass before and after
- **Follow existing patterns** - No new patterns without approval
- **Verify completeness** - 100% or nothing, no partial work
- **When unsure: STOP and ASK** - Never proceed with uncertainty

### 2. Multi-Instance Port Configuration

**Ports are AUTO-ASSIGNED based on folder name. NEVER hardcode ports.**

```bash
# Check current ports FIRST
cat .env.local | grep PORT

# Use pnpm commands (they read .env.local)
pnpm run dev:api
```

**NEVER modify**: `.env.local`, `docker-compose.instance.yml`, `proxy.conf.js`

See [docs/guides/infrastructure/multi-instance-setup.md](./docs/guides/infrastructure/multi-instance-setup.md)

### 3. Git Rules (MANDATORY)

**Commit message rules:**

- NO `Generated with Claude Code` or `Co-Authored-By: Claude`
- NO `BREAKING CHANGE:` - triggers v2.x.x release (FORBIDDEN)
- Use: `IMPORTANT:`, `MAJOR UPDATE:`, `MIGRATION:` instead

**Git workflow:**

- NEVER use `git add -A` or `git add .`
- ALWAYS add specific files only
- ALWAYS run `pnpm run build` before commit
- Pre-commit hooks don't check TypeScript - build does

**Git Subtree** - Shared libs sync to separate repos:

- `libs/aegisx-cli` → GitHub: aegisx-platform/crud-generator
- `libs/aegisx-ui` → GitHub: aegisx-platform/aegisx-ui
- `libs/aegisx-mcp` → GitHub: aegisx-platform/aegisx-mcp
- Commit to monorepo first, then use `sync-to-repo.sh`

See [docs/guides/infrastructure/git-subtree-guide.md](./docs/guides/infrastructure/git-subtree-guide.md)

### 4. Standard Development Policy

- **NEVER add/modify standards without user approval**
- **NEVER extend checklists or create new verification steps**
- **ALWAYS ask before adding new requirements**

### 5. File Management

- **NEVER delete files without permission**
- **Keep root directory clean** - only essential files
- **Move docs to `docs/`** - features/, architecture/, development/, infrastructure/

### 6. Type Safety (MANDATORY)

- **ALL routes MUST use TypeBox schemas** - no exceptions
- **NEVER use `any` or type assertions** - use proper schemas
- **UUID fields MUST be validated** - BaseRepository handles this automatically

Flow: Schema → Type Export → Route → Controller → Type-safe access

### 7. Fastify preValidation Hook (CRITICAL)

**NEVER throw errors in preValidation hooks - causes timeouts!**

```typescript
// ❌ WRONG: throw new Error('...') - request hangs
// ✅ CORRECT: return reply.unauthorized() or return reply.forbidden()
```

See `apps/api/src/core/auth/strategies/auth.strategies.ts` for reference.

### 8. API-First Development

Before implementing frontend:

1. Check API spec in `docs/features/[feature]/API_CONTRACTS.md`
2. Verify backend routes exist
3. Test API endpoints
4. Then implement frontend

See [docs/guides/development/api-calling-standard.md](./docs/guides/development/api-calling-standard.md)

### 9. Domain Architecture (CRITICAL)

**ก่อนสร้าง CRUD module ใหม่ MUST อ่านคู่มือ domain architecture!**

```bash
# ใช้ Domain Checker ก่อน generate ทุกครั้ง
bash /tmp/check_domain.sh TABLE_NAME
```

**กฎทองคำ:**

- **Master-Data** = Lookup/Reference data (budget_types, drugs, locations)
- **Operations** = Transactional data (budget_allocations, inventory_transactions)
- **Section** (frontend) ≠ **Domain** (backend) - ต่างกันได้!

**Documentation:**

- [Domain Architecture Guide](./docs/architecture/domain-architecture-guide.md) - คู่มือฉบับเต็ม
- [Quick Domain Reference](./docs/architecture/quick-domain-reference.md) - อ้างอิงด่วน

**Common Mistake:**

- ❌ ใส่ `budgets` ใน operations (ผิด!)
- ✅ ใส่ `budgets` ใน master-data (ถูก - เป็น configuration)

---

## Quick Reference

### Package Manager

**Use PNPM only** - never npm or yarn for dependencies

### Common Commands

```bash
# Development
pnpm run dev:api          # Start API server
pnpm run dev:admin        # Start Admin frontend
pnpm run build            # Build all

# Database
pnpm run db:migrate       # Run migrations
pnpm run db:seed          # Seed database

# CRUD Generator
pnpm run crud -- TABLE --force              # Basic CRUD
pnpm run crud:import -- TABLE --force       # With Excel/CSV import
pnpm run crud:events -- TABLE --force       # With WebSocket events
pnpm run crud:full -- TABLE --force         # All features
pnpm run crud:list                          # List tables

# Domain Management (for enterprise-scale multi-domain systems)
pnpm run domain:init -- DOMAIN              # Initialize domain (inventory, hr, etc.)
pnpm run domain:list                        # List initialized domains

# Generate CRUD for specific domain/schema
pnpm run crud -- TABLE --domain inventory/master-data --schema inventory --force
```

See [libs/aegisx-cli/docs/QUICK_REFERENCE.md](./libs/aegisx-cli/docs/QUICK_REFERENCE.md)

### Custom Commands

**doc-sync** - Update PROJECT_STATUS.md and sync with remote after session

---

## Documentation Structure

### Web Documentation

**View Online:** https://aegisx-platform.github.io/aegisx-starter-1/ (after deployment)
**Local Preview:** `pnpm run docs:dev` → http://localhost:5173

Our documentation follows the **Diátaxis Framework** organized in 4 main sections:

1. **Getting Started** - Installation, setup, onboarding
2. **Guides** - How-to guides, workflows, best practices
3. **Reference** - API docs, CLI commands, standards
4. **Architecture** - System design, patterns, concepts

### Quick Links

#### Getting Started

- [Getting Started Guide](./docs/getting-started/getting-started.md) - Git workflow & project setup
- [Project Setup](./docs/getting-started/project-setup.md) - Environment configuration
- [Contributing to Docs](./docs/getting-started/contributing.md) - Documentation standards

#### Development Guides

- [Feature Development Standard](./docs/guides/development/feature-development-standard.md) - Complete feature lifecycle
- [API Calling Standard](./docs/guides/development/api-calling-standard.md) - Correct API patterns
- [QA Checklist](./docs/guides/development/qa-checklist.md) - Quality assurance steps
- [Universal Full-Stack Standard](./docs/guides/development/universal-fullstack-standard.md) - Database-first workflow
- [Claude Detailed Rules](./docs/development/claude-detailed-rules.md) - Verbose development rules

#### Infrastructure Guides

- [Multi-Instance Setup](./docs/guides/infrastructure/multi-instance-setup.md) - Parallel development setup
- [Git Subtree Guide](./docs/guides/infrastructure/git-subtree-guide.md) - Shared library management
- [Git Flow & Release](./docs/guides/infrastructure/version-management/git-flow-release-guide.md) - Branch strategy & releases

#### API Reference

- [API Response Standard](./docs/reference/api/api-response-standard.md) - Standard API response format
- [TypeBox Schema Standard](./docs/reference/api/typebox-schema-standard.md) - Schema validation patterns
- [Bulk Operations API](./docs/reference/api/bulk-operations-api-design.md) - Bulk operations design
- [File Upload Guide](./docs/reference/api/file-upload-guide.md) - File upload implementation

#### Architecture

- [Domain Architecture Guide](./docs/architecture/domain-architecture-guide.md) - คู่มือฉบับเต็ม (Thai)
- [Quick Domain Reference](./docs/architecture/quick-domain-reference.md) - อ้างอิงด่วน (Thai)
- [Frontend Architecture](./docs/architecture/frontend-architecture.md) - Angular architecture patterns
- [Backend Architecture](./docs/architecture/backend-architecture.md) - Fastify architecture patterns

#### CRUD Generator

- [Quick Reference](./libs/aegisx-cli/docs/QUICK_REFERENCE.md) - Commands & examples

---

**For complete documentation, browse the [docs/](./docs/) directory or run `pnpm run docs:dev` for interactive web docs.**
