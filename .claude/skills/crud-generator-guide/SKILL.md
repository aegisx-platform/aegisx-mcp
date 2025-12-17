---
name: crud-generator-guide
description: Complete guide for using the AegisX CRUD generator (aegisx-cli). Use when generating new modules, choosing packages, classifying domains, or when user asks about CRUD generation commands.
allowed-tools: Read, Grep, Glob, Write, Bash
---

# CRUD Generator Guide

Complete guide for generating CRUD modules using the AegisX CLI (aegisx-cli).

## When Claude Should Use This Skill

- User asks about "CRUD generator", "generate module", "aegisx-cli"
- User wants to create a new feature for an existing table
- User is confused about packages (standard/enterprise/full)
- User is confused about domains (master-data vs operations)
- User asks "how do I use pnpm run crud"
- User mentions "generate backend" or "generate frontend"
- User needs to understand command options and flags

## Package Selection Decision Tree

### Step 1: Identify Requirements

Ask these questions to determine the correct package:

```
Do you need Excel/CSV import functionality?
├── Yes → Need real-time WebSocket events?
│         ├── Yes → Use: full package
│         └── No  → Use: enterprise package
└── No  → Need real-time WebSocket events?
          ├── Yes → Use: enterprise + --with-events
          └── No  → Use: standard package
```

### Package Comparison

| Package        | CRUD | Bulk Ops | Import/Export | Events   | Validation | Search |
| -------------- | ---- | -------- | ------------- | -------- | ---------- | ------ |
| **standard**   | ✅   | ❌       | ❌            | Optional | ❌         | ❌     |
| **enterprise** | ✅   | ✅       | ✅            | Optional | ❌         | ✅     |
| **full**       | ✅   | ✅       | ✅            | ✅       | ✅         | ✅     |

**When to use each:**

- **standard**: Simple lookup tables, basic reference data
- **enterprise**: Most production features (recommended default)
- **full**: Complex features with all requirements

## Domain Classification Rules

### Master-Data Domain (`inventory/master-data`)

**Use when:**

- ✅ Reference/lookup data
- ✅ Rarely changes
- ✅ Used in dropdowns
- ✅ Referenced by foreign key from other tables
- ✅ Configuration data set up before system use

**Examples:**

```
✅ budget_types         - Budget type lookup (ประเภทงบ)
✅ budget_categories    - Budget category lookup (หมวดงบ)
✅ budgets              - Budget configuration (type + category)
✅ drug_generics        - Generic drug names
✅ dosage_forms         - Drug forms (tablet, capsule)
✅ companies            - Company master data
✅ departments          - Department master data
✅ locations            - Storage location master data
```

### Operations Domain (`inventory/operations`)

**Use when:**

- ✅ Transactional data
- ✅ Changes frequently
- ✅ Has status/state that changes
- ✅ References master-data
- ✅ Created through business transactions

**Examples:**

```
✅ budget_allocations   - Budget allocation transactions
✅ budget_plans         - Budget planning transactions
✅ budget_plan_items    - Budget plan line items
✅ budget_reservations  - Budget reservation transactions
✅ inventory            - Stock inventory (changes often)
✅ inventory_transactions - Inventory movements
✅ drug_distributions   - Drug dispensing transactions
✅ drug_returns         - Drug return transactions
```

### Common Mistake: Budgets Domain

**❌ WRONG:** Put `budgets` in operations

- Reason: budgets is NOT transactional
- It's configuration data

**✅ CORRECT:** Put `budgets` in master-data

- Reason: budgets is reference data
- Other tables reference it (budget_allocations, budget_plans)
- It defines what budget types exist, not transactions

### Decision Checklist

Before generating, ask:

1. **Does this table store transactions?** → Operations
2. **Is it referenced by many other tables?** → Master-Data
3. **Does it have frequently changing state?** → Operations
4. **Is it set up once and rarely modified?** → Master-Data
5. **Is it used in dropdown selects?** → Master-Data

## Command Reference

### Backend Generation

#### Using pnpm Scripts (Recommended for Common Cases)

```bash
# Standard CRUD
pnpm run crud -- TABLE_NAME --force

# With import functionality
pnpm run crud:import -- TABLE_NAME --force

# With WebSocket events
pnpm run crud:events -- TABLE_NAME --force

# Full package (all features)
pnpm run crud:full -- TABLE_NAME --force
```

**CRITICAL**: Always use `--` separator with pnpm scripts!

#### Using Direct CLI (Advanced Options)

```bash
# Standard generation
./bin/cli.js generate products --force

# With multiple features
./bin/cli.js generate products --with-import --with-events --force

# With domain and schema
./bin/cli.js generate drugs \
  --domain inventory/master-data \
  --schema inventory \
  --force

# Enterprise package with import
./bin/cli.js generate products \
  --package enterprise \
  --with-import \
  --force

# Full package with all features
./bin/cli.js generate orders \
  --package full \
  --with-import \
  --with-events \
  --smart-stats \
  --force
```

### Frontend Generation

**MUST generate backend first!**

```bash
# Basic frontend
./bin/cli.js generate products --target frontend --force

# With import dialog
./bin/cli.js generate products \
  --target frontend \
  --with-import \
  --force

# To specific app
./bin/cli.js generate products \
  --target frontend \
  --app admin \
  --force

# Register in specific shell
./bin/cli.js generate products \
  --target frontend \
  --shell system \
  --force

# With domain (frontend section)
./bin/cli.js generate drugs \
  --target frontend \
  --shell inventory \
  --section master-data \
  --domain inventory/master-data \
  --schema inventory \
  --force
```

### Domain-Specific Generation

```bash
# Master-Data module
./bin/cli.js generate budget_types \
  --target backend \
  --domain inventory/master-data \
  --schema inventory \
  --package enterprise \
  --with-import \
  --force

# Operations module
./bin/cli.js generate budget_allocations \
  --target backend \
  --domain inventory/operations \
  --schema inventory \
  --package full \
  --with-import \
  --force

# Frontend for domain module
./bin/cli.js generate budget_types \
  --target frontend \
  --shell inventory \
  --section master-data \
  --domain inventory/master-data \
  --schema inventory \
  --force
```

### Helper Commands

```bash
# List available tables
pnpm run crud:list

# Validate generated module
pnpm run crud:validate -- MODULE_NAME

# Initialize new domain
pnpm run domain:init -- DOMAIN_NAME

# List initialized domains
pnpm run domain:list

# Show package information
./bin/cli.js packages

# Preview without generating (dry run)
./bin/cli.js generate TABLE_NAME --dry-run
```

## Common Flags and Options

### Target Selection

| Flag           | Options               | Default     | Description                                 |
| -------------- | --------------------- | ----------- | ------------------------------------------- |
| `-t, --target` | `backend`, `frontend` | `backend`   | What to generate                            |
| `-a, --app`    | `api`, `web`, `admin` | `api`/`web` | Target application                          |
| `-s, --shell`  | `system`, `inventory` | none        | Shell for route registration                |
| `--domain`     | `<path>`              | none        | Domain path (e.g., `inventory/master-data`) |
| `--schema`     | `<name>`              | `public`    | PostgreSQL schema name                      |
| `--section`    | `<name>`              | none        | Frontend section for UX grouping            |

### Feature Selection

| Flag                | Default    | Description                                    |
| ------------------- | ---------- | ---------------------------------------------- |
| `--package`         | `standard` | Package level (`standard`/`enterprise`/`full`) |
| `-e, --with-events` | `false`    | Add WebSocket events                           |
| `--with-import`     | `false`    | Add Excel/CSV import                           |
| `--smart-stats`     | `false`    | Auto-detect stats fields                       |
| `--multiple-roles`  | `false`    | Generate 3 roles (admin/editor/viewer)         |

### Generation Control

| Flag            | Default | Description              |
| --------------- | ------- | ------------------------ |
| `-f, --force`   | `false` | Overwrite without prompt |
| `-d, --dry-run` | `false` | Preview only             |
| `--no-register` | `false` | Skip auto-registration   |
| `--no-format`   | `false` | Skip prettier formatting |
| `--no-roles`    | `false` | Skip role generation     |

## Complete Workflows

### Workflow 1: Basic Feature (Standard Package)

```bash
# Step 1: Check table exists
pnpm run crud:list

# Step 2: Generate backend
pnpm run crud -- departments --force

# Step 3: Test backend
pnpm run build

# Step 4: Generate frontend
./bin/cli.js generate departments --target frontend --force

# Step 5: Test complete build
pnpm run build
```

### Workflow 2: Feature with Import (Enterprise Package)

```bash
# Step 1: Backend with import
pnpm run crud:import -- products --force

# Step 2: Frontend with import dialog
./bin/cli.js generate products \
  --target frontend \
  --with-import \
  --force
```

### Workflow 3: Real-time Feature (Full Package)

```bash
# Step 1: Backend with all features
./bin/cli.js generate orders \
  --package full \
  --with-import \
  --with-events \
  --force

# Step 2: Frontend with all features
./bin/cli.js generate orders \
  --target frontend \
  --package full \
  --with-import \
  --with-events \
  --force
```

### Workflow 4: Domain-Specific Module

```bash
# Step 1: Master-Data backend
./bin/cli.js generate drugs \
  --domain inventory/master-data \
  --schema inventory \
  --package enterprise \
  --with-import \
  --force

# Step 2: Master-Data frontend
./bin/cli.js generate drugs \
  --target frontend \
  --shell inventory \
  --section master-data \
  --domain inventory/master-data \
  --schema inventory \
  --force
```

### Workflow 5: Multi-App Frontend

```bash
# Step 1: Backend
pnpm run crud -- settings --force

# Step 2: Generate to web app
./bin/cli.js generate settings --target frontend --app web --force

# Step 3: Generate to admin app
./bin/cli.js generate settings --target frontend --app admin --force
```

## Generated Files

### Backend Files (Standard Package)

```
apps/api/src/modules/products/
├── products.routes.ts         # Fastify routes
├── products.controller.ts     # Request handlers
├── products.service.ts        # Business logic
├── products.repository.ts     # Database queries
├── schemas/
│   └── products.schemas.ts    # TypeBox validation
└── __tests__/
    ├── products.controller.spec.ts
    └── products.service.spec.ts
```

### Backend Files (Enterprise Package)

Includes standard files plus:

```
├── products.bulk.service.ts   # Bulk operations
├── products.export.service.ts # Excel/CSV export
└── products.import.service.ts # Excel/CSV import
```

### Backend Files (Full Package)

Includes enterprise files plus:

```
├── products.events.ts         # WebSocket events
├── products.validation.ts     # Advanced validation
└── products.stats.service.ts  # Statistics
```

### Frontend Files

```
apps/web/src/app/features/products/
├── products.routes.ts         # Angular routes
├── services/
│   └── products.service.ts    # HTTP service
├── components/
│   ├── product-list/          # List component
│   ├── product-form/          # Form dialog
│   └── product-detail/        # Detail view (if full package)
└── models/
    └── product.model.ts       # TypeScript interfaces
```

### Frontend Files (with Import)

Includes standard files plus:

```
└── components/
    └── product-import/        # Import dialog
```

## Post-Generation Steps

### Backend

1. **Verify Route Registration**

   ```bash
   # Check module is registered in domain index.ts or app.ts
   cat apps/api/src/modules/[domain]/index.ts
   ```

2. **Test Build**

   ```bash
   pnpm run build
   ```

3. **Test Endpoints**

   ```bash
   # List all routes
   pnpm run dev:api
   # Check: http://localhost:3000/api/products
   ```

4. **Customize Business Logic**
   - Add validation to service layer
   - Implement custom queries in repository
   - Add custom endpoints in routes

### Frontend

1. **Verify Route Registration**

   ```bash
   # Check routes added to shell or app.routes.ts
   cat apps/web/src/app/app.routes.ts
   ```

2. **Test Build**

   ```bash
   pnpm run build
   ```

3. **Test in Browser**

   ```bash
   pnpm run dev:admin
   # Navigate to feature in browser
   ```

4. **Customize UI**
   - Update form fields
   - Add custom columns to table
   - Implement business-specific UI logic

## Common Mistakes and Solutions

### Mistake 1: Missing `--` Separator

```bash
# ❌ WRONG - Arguments ignored
pnpm run crud products --force

# ✅ CORRECT - With double dash
pnpm run crud -- products --force
```

### Mistake 2: Frontend Before Backend

```bash
# ❌ WRONG - Backend must exist first
./bin/cli.js generate products --target frontend --force

# ✅ CORRECT - Backend first
pnpm run crud -- products --force
./bin/cli.js generate products --target frontend --force
```

### Mistake 3: Wrong Domain Classification

```bash
# ❌ WRONG - budgets is NOT operational
./bin/cli.js generate budgets \
  --domain inventory/operations

# ✅ CORRECT - budgets is master-data
./bin/cli.js generate budgets \
  --domain inventory/master-data
```

### Mistake 4: Forgot --force Flag

```bash
# Without --force, you'll get interactive prompts
pnpm run crud -- products

# Add --force to skip prompts (recommended for automation)
pnpm run crud -- products --force
```

### Mistake 5: Using Non-existent Command

```bash
# ❌ WRONG - Command doesn't exist
pnpm aegisx-crud products

# ✅ CORRECT - Use pnpm run
pnpm run crud -- products --force
```

### Mistake 6: Double Command

```bash
# ❌ WRONG - Causes "generate generate"
pnpm run crud generate products --force

# ✅ CORRECT - No "generate" needed
pnpm run crud -- products --force
```

## Table Name Conventions

Database table names are converted automatically:

| Database Table  | Module Folder    | TypeScript Types | API Routes           |
| --------------- | ---------------- | ---------------- | -------------------- |
| `test_products` | `test-products/` | `TestProducts`   | `/api/test-products` |
| `user_profiles` | `user-profiles/` | `UserProfiles`   | `/api/user-profiles` |
| `blog_posts`    | `blog-posts/`    | `BlogPosts`      | `/api/blog-posts`    |

**Always use snake_case for table names:**

```bash
# ✅ CORRECT
pnpm run crud -- test_products --force

# ❌ WRONG - Don't use kebab-case or PascalCase
pnpm run crud -- test-products --force
pnpm run crud -- TestProducts --force
```

## Pre-Generation Checklist

Before generating, always:

- [ ] Read database migration to understand table structure
- [ ] Identify foreign key relationships
- [ ] Classify as master-data or operations domain
- [ ] Choose appropriate package (standard/enterprise/full)
- [ ] Determine if import/export needed
- [ ] Determine if real-time events needed
- [ ] Check table exists: `pnpm run crud:list`
- [ ] Preview with dry run: `--dry-run`

## Domain Architecture Tool

Use domain checker script to verify domain classification:

```bash
# Check if table belongs to master-data or operations
bash /tmp/check_domain.sh budget_allocations
# Output: ✅ OPERATIONS (has foreign keys, has state fields)

bash /tmp/check_domain.sh budgets
# Output: ✅ MASTER-DATA (referenced by other tables, no state)
```

**Note:** This script analyzes table structure and provides recommendation.

## Troubleshooting

### Error: "Table not found"

```bash
# Solution: Check if table exists
pnpm run crud:list

# Ensure migrations ran
pnpm run db:migrate

# For domain-specific tables
npx knex migrate:latest --knexfile knexfile-inventory.ts
```

### Error: "Arguments not recognized"

```bash
# Solution: Check for missing `--` separator
pnpm run crud -- products --force
#            ^^^ Don't forget this!
```

### Error: "Frontend files not generated"

```bash
# Solution: Backend must exist first
pnpm run crud -- products --force  # Backend first
./bin/cli.js generate products --target frontend --force  # Then frontend
```

### Error: "Module not registered"

```bash
# Solution: Re-generate with force to trigger registration
pnpm run crud -- products --force

# Or manually register in:
# - apps/api/src/modules/[domain]/index.ts (for domain modules)
# - apps/api/src/app.ts (for root modules)
```

### Build Fails After Generation

```bash
# Solution: Check for TypeScript errors
pnpm run build

# Common issues:
# - Missing imports in index.ts
# - Schema validation errors
# - Route registration syntax

# Fix and rebuild
pnpm run build
```

## Best Practices

### 1. Always Generate Backend First

Backend must exist before frontend can reference it.

```bash
# Correct order
pnpm run crud -- products --force
./bin/cli.js generate products --target frontend --force
```

### 2. Use Appropriate Package

Don't use `full` package unless you need all features.

```bash
# For simple lookup tables
pnpm run crud -- departments --force

# For production features
pnpm run crud:import -- products --force

# Only when you need everything
./bin/cli.js generate orders --package full --with-import --with-events --force
```

### 3. Verify After Generation

```bash
# Always test build
pnpm run build

# Test endpoints
curl http://localhost:3000/api/products

# Test frontend
pnpm run dev:admin
```

### 4. Customize After Generation

Generated code is a starting point. Customize:

- Business validation in service layer
- Custom queries in repository
- Custom endpoints in routes
- UI components and forms
- Column definitions in tables

### 5. Use Domain Architecture

For enterprise-scale systems:

```bash
# Initialize domain first
pnpm run domain:init -- inventory

# Run domain migrations
npx knex migrate:latest --knexfile knexfile-inventory.ts

# Generate with domain
./bin/cli.js generate drugs \
  --domain inventory/master-data \
  --schema inventory \
  --force
```

## Integration with Other Skills

This skill integrates with:

1. **typebox-schema-generator** - Generate schemas before routes
2. **backend-customization-guide** - Customize generated backend
3. **frontend-integration-guide** - Customize generated frontend
4. **api-contract-generator** - Document generated APIs
5. **api-endpoint-tester** - Test generated endpoints

## Output Format

After using this skill, always provide:

```markdown
## CRUD Generation Summary

**Feature:** [feature-name]
**Table:** [table_name]
**Domain:** [master-data/operations]
**Package:** [standard/enterprise/full]

**Commands Executed:**

1. Backend: pnpm run crud -- [table] --force
2. Frontend: ./bin/cli.js generate [table] --target frontend --force

**Files Generated:**
Backend:

- apps/api/src/modules/[domain]/[module]/
  - [module].routes.ts
  - [module].controller.ts
  - [module].service.ts
  - [module].repository.ts
  - schemas/[module].schemas.ts

Frontend:

- apps/web/src/app/features/[module]/
  - [module].routes.ts
  - services/[module].service.ts
  - components/[module]-list/
  - components/[module]-form/

**Next Steps:**

1. Test build: pnpm run build
2. Test endpoints: curl http://localhost:3000/api/[module]
3. Customize service layer business logic
4. Test frontend in browser
5. Customize UI components
```

## Related Documentation

- [CRUD Generator Quick Reference](../../../libs/aegisx-cli/docs/QUICK_REFERENCE.md)
- [Domain Architecture Guide](../../../docs/architecture/domain-architecture-guide.md)
- [Quick Domain Reference](../../../docs/architecture/quick-domain-reference.md)
- [Universal Full-Stack Standard](../../../docs/guides/development/universal-fullstack-standard.md)
- [Feature Development Standard](../../../docs/guides/development/feature-development-standard.md)

## Summary

**Golden Rules:**

1. **Backend first, frontend second** - Always in this order
2. **Use `--` with pnpm** - Never forget the separator
3. **Master-data vs Operations** - Choose domain carefully
4. **Package selection** - Match features to requirements
5. **Test after generation** - Always run `pnpm run build`
6. **Customize generated code** - It's a starting point, not final product

**When in doubt:**

- Check domain architecture guide
- Use dry run to preview: `--dry-run`
- List available tables: `pnpm run crud:list`
- Ask about domain classification
