# CRUD Generator Guide Skill

Complete guide for using the AegisX CRUD Generator (aegisx-cli) to generate full-stack CRUD modules.

## What This Skill Does

Claude will **automatically use this skill** when you:

- Ask about "CRUD generator", "generate module", or "aegisx-cli"
- Want to create a new feature for an existing database table
- Need help choosing packages (standard/enterprise/full)
- Need help classifying domains (master-data vs operations)
- Ask "how do I use pnpm run crud"

## Quick Start

### Example 1: Basic CRUD Module

```
You: "Generate a CRUD module for products table"
```

**Claude will:**

1. Check if table exists: `pnpm run crud:list`
2. Determine appropriate package (probably enterprise)
3. Generate backend: `pnpm run crud:import -- products --force`
4. Generate frontend: `./bin/cli.js generate products --target frontend --force`
5. Test build: `pnpm run build`

### Example 2: Need Help Choosing Package

```
You: "I want to generate CRUD for orders. It needs Excel import and real-time updates."
```

**Claude will:**

1. Use decision tree → Need import + events → `full` package
2. Generate: `./bin/cli.js generate orders --package full --with-import --with-events --force`
3. Generate frontend with same features

### Example 3: Domain Classification

```
You: "Should budgets go in master-data or operations domain?"
```

**Claude will:**

1. Analyze table structure and relationships
2. Check if it's reference data (master-data) or transactional (operations)
3. Explain: budgets = master-data (it's configuration, referenced by other tables)
4. Provide correct command with domain flags

## Package Decision Tree

### Simple Decision Flow

```
Need Excel/CSV import?
├── Yes → Need real-time events?
│         ├── Yes → Use: full
│         └── No  → Use: enterprise
└── No  → Need real-time events?
          ├── Yes → Use: enterprise + --with-events
          └── No  → Use: standard
```

### Package Comparison

| Feature             | Standard | Enterprise | Full |
| ------------------- | -------- | ---------- | ---- |
| Basic CRUD          | ✅       | ✅         | ✅   |
| Bulk Operations     | ❌       | ✅         | ✅   |
| Excel/CSV Import    | ❌       | ✅         | ✅   |
| Export              | ❌       | ✅         | ✅   |
| WebSocket Events    | Optional | Optional   | ✅   |
| Advanced Validation | ❌       | ❌         | ✅   |
| Smart Stats         | ❌       | ❌         | ✅   |

**Recommendations:**

- **standard**: Simple lookup tables only
- **enterprise**: Most production features (recommended default)
- **full**: Complex features needing everything

## Domain Classification

### Master-Data vs Operations

**Master-Data** (`inventory/master-data`):

- Reference/lookup data
- Rarely changes
- Used in dropdowns
- Referenced by other tables
- Set up before system use

**Examples:**

```
✅ budget_types
✅ budget_categories
✅ budgets (configuration!)
✅ drugs
✅ departments
✅ locations
```

**Operations** (`inventory/operations`):

- Transactional data
- Changes frequently
- Has status/state
- References master-data
- Created through transactions

**Examples:**

```
✅ budget_allocations
✅ budget_plans
✅ inventory_transactions
✅ drug_distributions
✅ purchase_orders
```

### Common Confusion: Budgets

**Question:** "Is budgets master-data or operations?"

**Answer:** **Master-data** ✅

**Why?**

- `budgets` is configuration data (defines budget types)
- Referenced by `budget_allocations`, `budget_plans` (operations)
- Doesn't store transaction state
- Set up before creating allocations/plans

**Wrong thinking:** "It's about budgets, so it must be operations"
**Correct thinking:** "It's referenced by operations, so it's master-data"

## Common Commands

### Backend Generation

```bash
# Standard CRUD
pnpm run crud -- TABLE_NAME --force

# With import (recommended)
pnpm run crud:import -- TABLE_NAME --force

# With events
pnpm run crud:events -- TABLE_NAME --force

# Full package
pnpm run crud:full -- TABLE_NAME --force

# With domain
./bin/cli.js generate TABLE \
  --domain inventory/master-data \
  --schema inventory \
  --force
```

### Frontend Generation

**MUST generate backend first!**

```bash
# Basic frontend
./bin/cli.js generate TABLE --target frontend --force

# With import dialog
./bin/cli.js generate TABLE \
  --target frontend \
  --with-import \
  --force

# Register in shell
./bin/cli.js generate TABLE \
  --target frontend \
  --shell system \
  --force

# With domain
./bin/cli.js generate TABLE \
  --target frontend \
  --shell inventory \
  --section master-data \
  --domain inventory/master-data \
  --force
```

### Helper Commands

```bash
# List tables
pnpm run crud:list

# Preview (dry run)
./bin/cli.js generate TABLE --dry-run

# Initialize domain
pnpm run domain:init -- DOMAIN_NAME

# List domains
pnpm run domain:list

# Validate module
pnpm run crud:validate -- MODULE_NAME
```

## Complete Workflow Examples

### Workflow 1: Basic Feature

```bash
# 1. Check table exists
pnpm run crud:list

# 2. Generate backend
pnpm run crud -- departments --force

# 3. Test
pnpm run build

# 4. Generate frontend
./bin/cli.js generate departments --target frontend --force

# 5. Final test
pnpm run build
```

### Workflow 2: Feature with Import

```bash
# 1. Backend with import
pnpm run crud:import -- products --force

# 2. Frontend with import dialog
./bin/cli.js generate products \
  --target frontend \
  --with-import \
  --force
```

### Workflow 3: Domain-Specific Module

```bash
# 1. Backend (master-data)
./bin/cli.js generate drugs \
  --domain inventory/master-data \
  --schema inventory \
  --package enterprise \
  --with-import \
  --force

# 2. Frontend
./bin/cli.js generate drugs \
  --target frontend \
  --shell inventory \
  --section master-data \
  --domain inventory/master-data \
  --schema inventory \
  --force
```

### Workflow 4: Real-time Feature

```bash
# 1. Backend with all features
./bin/cli.js generate notifications \
  --package full \
  --with-events \
  --force

# 2. Frontend with events
./bin/cli.js generate notifications \
  --target frontend \
  --with-events \
  --force
```

## Generated Files

### Backend Structure

```
apps/api/src/modules/products/
├── products.routes.ts         # Fastify routes
├── products.controller.ts     # Controllers
├── products.service.ts        # Business logic
├── products.repository.ts     # Database queries
├── schemas/
│   └── products.schemas.ts    # TypeBox schemas
└── __tests__/
    └── products.*.spec.ts     # Tests
```

**With enterprise package:**

```
├── products.bulk.service.ts
├── products.import.service.ts
├── products.export.service.ts
```

**With full package:**

```
├── products.events.ts
├── products.validation.ts
├── products.stats.service.ts
```

### Frontend Structure

```
apps/web/src/app/features/products/
├── products.routes.ts
├── services/
│   └── products.service.ts
├── components/
│   ├── product-list/
│   ├── product-form/
│   └── product-import/  (if --with-import)
└── models/
    └── product.model.ts
```

## Common Mistakes

### 1. Missing `--` Separator

```bash
# ❌ WRONG
pnpm run crud products --force

# ✅ CORRECT
pnpm run crud -- products --force
```

### 2. Frontend Before Backend

```bash
# ❌ WRONG - Backend must exist first
./bin/cli.js generate products --target frontend

# ✅ CORRECT - Backend first
pnpm run crud -- products --force
./bin/cli.js generate products --target frontend --force
```

### 3. Wrong Domain

```bash
# ❌ WRONG - budgets is NOT operations
./bin/cli.js generate budgets --domain inventory/operations

# ✅ CORRECT - budgets is master-data
./bin/cli.js generate budgets --domain inventory/master-data
```

### 4. Using Wrong Command

```bash
# ❌ WRONG - Command doesn't exist
pnpm aegisx-crud products

# ✅ CORRECT
pnpm run crud -- products --force
```

### 5. Forgetting --force

```bash
# Without --force, gets interactive prompts
pnpm run crud -- products

# With --force, automated
pnpm run crud -- products --force
```

## Post-Generation Checklist

### Backend

- [ ] Verify build passes: `pnpm run build`
- [ ] Check route registration in index.ts
- [ ] Test API endpoints work
- [ ] Customize service layer logic
- [ ] Add custom validations if needed

### Frontend

- [ ] Verify build passes: `pnpm run build`
- [ ] Check route registration in routes file
- [ ] Test in browser
- [ ] Customize form fields
- [ ] Update table columns
- [ ] Style components

## Troubleshooting

### "Table not found"

```bash
# Check tables
pnpm run crud:list

# Run migrations
pnpm run db:migrate

# For domain tables
npx knex migrate:latest --knexfile knexfile-inventory.ts
```

### "Arguments not recognized"

```bash
# Add `--` separator
pnpm run crud -- products --force
```

### "Frontend not generated"

```bash
# Generate backend first
pnpm run crud -- products --force
./bin/cli.js generate products --target frontend --force
```

### Build fails

```bash
# Check TypeScript errors
pnpm run build

# Common issues:
# - Missing imports in index.ts
# - Schema errors
# - Route registration
```

## Best Practices

### 1. Always Backend First

Backend must exist before frontend.

### 2. Use Appropriate Package

Match package to requirements:

- Simple lookup → standard
- Production feature → enterprise
- Everything → full

### 3. Test After Generation

```bash
pnpm run build  # Always test build
```

### 4. Classify Domain Correctly

Use decision checklist:

- Transaction? → operations
- Reference data? → master-data
- Referenced by others? → master-data
- Has changing state? → operations

### 5. Use Dry Run

```bash
# Preview before generating
./bin/cli.js generate TABLE --dry-run
```

## Integration with Development Workflow

### Complete Feature Development

```
1. Design database schema
   ↓
2. Create migration
   ↓
3. Run migration: pnpm run db:migrate
   ↓
4. Generate CRUD (this skill) ← You are here
   ↓
5. Customize backend logic
   ↓
6. Test API endpoints
   ↓
7. Customize frontend UI
   ↓
8. Integration testing
   ↓
9. Documentation
```

### With Other Skills

This skill integrates with:

1. **typebox-schema-generator** - For custom schemas
2. **backend-customization-guide** - After backend generation
3. **frontend-integration-guide** - After frontend generation
4. **api-contract-generator** - For API documentation
5. **api-endpoint-tester** - For testing endpoints

## Helper Script

Quick generation from command line:

```bash
# Generate CRUD module
./.claude/skills/crud-generator-guide/scripts/generate.sh products

# With options
./.claude/skills/crud-generator-guide/scripts/generate.sh products \
  --package enterprise \
  --with-import

# Preview
./.claude/skills/crud-generator-guide/scripts/generate.sh products --dry-run
```

**Note:** For best results, ask Claude directly.

## Key Takeaways

**Golden Rules:**

1. **Backend first, frontend second** - Always
2. **Use `--` with pnpm** - Don't forget
3. **Master-data vs Operations** - Classify carefully
4. **Package = Features** - Match to requirements
5. **Test after generation** - Always build

**Decision Trees:**

- **Package:** Need features? → Choose package
- **Domain:** Transaction or reference? → Choose domain
- **Command:** pnpm script or direct CLI? → Choose approach

**Common Patterns:**

```bash
# Most common: Enterprise with import
pnpm run crud:import -- TABLE --force

# With domain
./bin/cli.js generate TABLE \
  --domain DOMAIN/SUBDOMAIN \
  --schema SCHEMA \
  --package enterprise \
  --with-import \
  --force
```

## Related Documentation

- [CRUD Generator Quick Reference](../../../libs/aegisx-cli/docs/QUICK_REFERENCE.md)
- [Domain Architecture Guide](../../../docs/architecture/domain-architecture-guide.md)
- [Quick Domain Reference](../../../docs/architecture/quick-domain-reference.md)
- [Universal Full-Stack Standard](../../../docs/guides/development/universal-fullstack-standard.md)

## Questions?

Ask Claude:

- "How do I generate CRUD for [table]?"
- "What package should I use for [feature]?"
- "Is [table] master-data or operations?"
- "Show me commands for generating [module]"
- "What files will be generated?"

---

**Ready to use!** Just ask Claude about CRUD generation.
