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

See [docs/infrastructure/multi-instance-setup.md](./docs/infrastructure/multi-instance-setup.md)

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

See [docs/infrastructure/git-subtree-guide.md](./docs/infrastructure/git-subtree-guide.md)

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

See [docs/development/API_CALLING_STANDARD.md](./docs/development/API_CALLING_STANDARD.md)

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

See [docs/crud-generator/QUICK_REFERENCE.md](./docs/crud-generator/QUICK_REFERENCE.md)

### Custom Commands

**doc-sync** - Update PROJECT_STATUS.md and sync with remote after session

---

## Documentation Links

### Start Here

- [Getting Started](./docs/getting-started/getting-started.md) - Git workflow & rules
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Session recovery & current progress
- [README.md](./README.md) - Tech stack, quick start

### Development

- [Feature Development Standard](./docs/development/feature-development-standard.md) - Feature lifecycle
- [API Calling Standard](./docs/development/API_CALLING_STANDARD.md) - Correct URL patterns
- [QA Checklist](./docs/development/qa-checklist.md) - Quality assurance steps
- [Universal Full-Stack Standard](./docs/development/universal-fullstack-standard.md) - Database-first workflow
- [Claude Detailed Rules](./docs/development/claude-detailed-rules.md) - Verbose examples

### Infrastructure

- [Multi-Instance Setup](./docs/infrastructure/multi-instance-setup.md) - Parallel development
- [Git Subtree Guide](./docs/infrastructure/git-subtree-guide.md) - Shared library management
- [Git Flow & Release](./docs/infrastructure/git-flow-release-guide.md) - Branch strategy

### CRUD Generator

- [CRUD Generator Overview](./docs/crud-generator/) - Automatic API generation
- [Quick Reference](./docs/crud-generator/QUICK_REFERENCE.md) - Commands & examples

---

_For complete documentation, see `docs/` directory._
