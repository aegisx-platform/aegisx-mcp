# AegisX Development Workflow Skill

> **Master orchestration skill** for complete feature development in the AegisX Platform.

## Overview

This skill coordinates the entire development workflow from database design to production-ready features. It integrates with all other skills and MCP tools to provide a seamless development experience.

## When to Use

Use this skill when:

- Starting a new feature from scratch
- Building a complete CRUD module for a database table
- Resuming work on an existing feature
- Needing guidance on the development workflow
- Asking "how do I build [feature]?"

## Development Phases

```
Phase 0: Planning (Optional) ─┐
                              │
Phase 1: Database Migration ──┼─► Required
                              │
Phase 2: Backend Generation ──┤
                              │
Phase 3: Backend Customization (Optional)
                              │
Phase 4: API Testing ─────────┤
                              │
Phase 5: API Documentation ───┤
                              │
Phase 6: Frontend Generation ─┤
                              │
Phase 7: Frontend Integration (Optional)
                              │
Phase 8: Quality Assurance ───┘
```

## Quick Start

### Minimal Workflow (5 commands)

```bash
# 1. Create and run migration
npx knex migrate:make create_products_table --knexfile apps/api/knexfile.ts
# (edit migration file)
pnpm run db:migrate

# 2. Generate backend
pnpm run crud -- products --force

# 3. Generate frontend
./bin/cli.js generate products --target frontend --shell system --force

# 4. Build and run
pnpm run build
pnpm run dev:admin
```

### Full Workflow

See [SKILL.md](./SKILL.md) for the complete workflow with all phases.

## Key Decision Trees

### Package Selection

```
Need Excel/CSV import?
├── Yes → Need real-time events?
│         ├── Yes → pnpm run crud:full -- TABLE --force
│         └── No  → pnpm run crud:import -- TABLE --force
└── No  → Need real-time events?
          ├── Yes → pnpm run crud:events -- TABLE --force
          └── No  → pnpm run crud -- TABLE --force
```

### Domain Classification

```
Is it lookup/reference data?
├── Yes → master-data
└── No  → Does it have state/status fields?
          ├── Yes → operations
          └── No  → master-data
```

## Integration Points

### MCP Tools

| Tool                        | Phase | Purpose               |
| --------------------------- | ----- | --------------------- |
| `spec_workflow_create`      | 0     | Create spec documents |
| `aegisx_crud_build_command` | 2     | Build CRUD commands   |
| `aegisx_crud_packages`      | 2     | Get package info      |
| `aegisx_crud_workflow`      | All   | Get workflow guidance |

### Related Skills

| Skill                       | Phase | Purpose                  |
| --------------------------- | ----- | ------------------------ |
| typebox-schema-generator    | 1     | Generate TypeBox schemas |
| backend-customization-guide | 3     | Customize backend code   |
| api-endpoint-tester         | 4     | Test API endpoints       |
| api-contract-generator      | 5     | Document APIs            |
| frontend-integration-guide  | 7     | Customize frontend       |

## Common Commands

### Backend Generation

```bash
# Standard CRUD
pnpm run crud -- TABLE --force

# With import (Excel/CSV)
pnpm run crud:import -- TABLE --force

# With WebSocket events
pnpm run crud:events -- TABLE --force

# Full features
pnpm run crud:full -- TABLE --force

# Domain-specific
pnpm run crud -- TABLE --domain inventory/master-data --schema inventory --force
```

### Frontend Generation

```bash
# Basic
./bin/cli.js generate TABLE --target frontend --force

# With shell registration
./bin/cli.js generate TABLE --target frontend --shell system --force

# With import dialog
./bin/cli.js generate TABLE --target frontend --with-import --force

# For admin app
./bin/cli.js generate TABLE --target frontend --app admin --force
```

### Database Operations

```bash
# Create migration
npx knex migrate:make create_TABLE_table --knexfile apps/api/knexfile.ts

# Run migration
pnpm run db:migrate

# List tables
pnpm run crud:list

# Rollback
pnpm run db:migrate:rollback
```

## Files in This Skill

```
aegisx-development-workflow/
├── SKILL.md              # Main skill instructions for Claude
├── README.md             # This file (user documentation)
└── scripts/
    └── workflow.sh       # Helper script for common workflows
```

## Usage Examples

### Example 1: New Product Feature

```
User: "Create a complete CRUD module for products"

Claude will:
1. Check for existing migration
2. Create migration if needed
3. Run migration
4. Generate backend with pnpm run crud
5. Test endpoints with curl
6. Generate frontend with shell registration
7. Verify build passes
8. Provide testing instructions
```

### Example 2: Resume Feature Development

```
User: "Continue work on the inventory module"

Claude will:
1. Check current state (tables, modules, routes)
2. Identify what's complete vs pending
3. Resume from appropriate phase
4. Complete remaining work
```

### Example 3: Domain-Specific Feature

```
User: "Create a drug categories module for the inventory system"

Claude will:
1. Classify as master-data (lookup/reference)
2. Create migration in inventory schema
3. Generate backend with domain path
4. Register in inventory domain
5. Generate frontend in inventory shell
```

## Troubleshooting

### "Table not found"

```bash
# Check if migration was run
pnpm run crud:list

# Run pending migrations
pnpm run db:migrate
```

### "Build failed"

```bash
# Check TypeScript errors
pnpm run build 2>&1 | head -50

# Common fix: missing imports
# Add manually if needed
```

### "Frontend not loading data"

1. Check network tab in browser devtools
2. Verify API is running: `curl http://localhost:3000/health`
3. Check authentication token
4. Verify proxy configuration

## Best Practices

1. **Always run migrations first** - Backend generation requires the table to exist
2. **Generate backend before frontend** - Frontend needs backend types
3. **Test API before frontend** - Catch issues early
4. **Use shell registration** - Keeps routes organized
5. **Build after each phase** - Catch errors immediately
6. **Commit after each phase** - Easy rollback if needed

## Related Documentation

- [Feature Development Standard](../../../docs/guides/development/feature-development-standard.md)
- [Domain Architecture Guide](../../../docs/architecture/domain-architecture-guide.md)
- [CRUD Generator Reference](../../../libs/aegisx-cli/docs/QUICK_REFERENCE.md)
- [API Response Standard](../../../docs/reference/api/api-response-standard.md)

---

**Skill Version:** 1.0.0
**Last Updated:** December 2024
**Agent Level:** Opus (Complex orchestration)
