---
name: aegisx-development-workflow
description: Master orchestration skill for complete feature development. Use when building new features, resuming work on existing features, or when multi-step coordination is needed. Coordinates database, backend, frontend, and testing phases.
allowed-tools: Read, Grep, Glob, Write, Bash
---

# AegisX Development Workflow

The **master orchestration skill** that coordinates the complete development workflow from database design to production-ready features.

## When Claude Should Use This Skill

- User asks to "build", "create", "develop", or "implement" a new feature
- User wants to start work on a new table or module
- User mentions "end-to-end", "full stack", or "complete feature"
- Resuming work on an existing feature
- User asks "how do I build [feature]?"
- When multi-step coordination is needed between backend and frontend
- User provides a database table name and wants a complete CRUD module

## Pre-Flight Checklist

Before starting ANY development work, verify:

```bash
# 1. Check if server can build
pnpm run build

# 2. Check database connection
pnpm run crud:list

# 3. Check current port configuration
cat .env.local | grep PORT
```

If any of these fail, resolve before proceeding.

---

## Phase Overview

```
[Planning] → [Database] → [Backend Gen] → [Backend Custom] → [API Test] → [Frontend Gen] → [Frontend Custom] → [QA]
    ↓           ↓             ↓               ↓                 ↓              ↓                ↓            ↓
Optional    Required      Required        Optional          Required       Required         Optional     Required
```

---

## Phase 0: Planning & Specification (Optional but Recommended)

### When to Use Planning Phase

Use for complex features that need:

- Multiple stakeholder approval
- Detailed requirements documentation
- Architecture decisions
- Risk assessment

### Integration: spec-workflow MCP

If available, use spec-workflow MCP tools:

```
Use MCP Tool: spec_workflow_create
- Create requirements.md
- Create design.md
- Create tasks.md
```

### Skip Planning When

- Simple CRUD with no custom logic
- User explicitly says "just build it"
- Table already exists and is straightforward

---

## Phase 1: Database First

### Step 1.1: Determine Domain Classification

**CRITICAL DECISION: Master-Data vs Operations**

Use this decision tree:

```
Is the table referenced by other tables via FK?
├── Yes → Is it configuration/lookup data?
│         ├── Yes → MASTER-DATA
│         └── No  → Check state fields
└── No  → Does it have state/status fields?
          ├── Yes → OPERATIONS
          └── No  → MASTER-DATA (likely reference data)
```

**Quick Classification Guide:**

| Characteristics         | Domain      |
| ----------------------- | ----------- |
| Lookup/reference data   | master-data |
| Rarely changes          | master-data |
| Used in dropdowns       | master-data |
| Has FK references TO it | master-data |
| Transactional data      | operations  |
| Has state/status fields | operations  |
| Changes frequently      | operations  |
| References master-data  | operations  |

**Examples:**

- `budget_types` → master-data (lookup)
- `departments` → master-data (reference)
- `budget_allocations` → operations (has q1_spent, q2_spent state)
- `inventory_transactions` → operations (transactional)

### Step 1.2: Create Database Migration

Create migration file:

```bash
# Generate migration file
npx knex migrate:make create_TABLE_NAME_table --knexfile apps/api/knexfile.ts
```

For domain-specific schemas:

```bash
# For inventory domain
npx knex migrate:make create_TABLE_NAME_table --knexfile knexfile-inventory.ts
```

**Migration Template:**

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('table_name', (table) => {
    // Primary key (choose one)
    table.increments('id').primary(); // Auto-increment integer
    // OR
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Business fields
    table.string('code', 20).notNullable().unique();
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.boolean('is_active').defaultTo(true);

    // Foreign keys (if needed)
    table.integer('category_id').unsigned().references('id').inTable('categories');

    // Timestamps
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('table_name');
}
```

### Step 1.3: Run Migration

```bash
# For main system (public schema)
pnpm run db:migrate

# For domain-specific (e.g., inventory)
pnpm run db:migrate:inventory
```

### Step 1.4: Verify Table Created

```bash
pnpm run crud:list
```

Look for your table in the output.

### Integration: typebox-schema-generator

After migration, invoke `typebox-schema-generator` skill to create TypeBox schemas:

```
→ Use Skill: typebox-schema-generator
  - Input: Table name, migration file
  - Output: [Feature].schemas.ts with all validation schemas
```

---

## Phase 2: Backend CRUD Generation

### Step 2.1: Package Selection Decision Tree

```
Do you need Excel/CSV import functionality?
├── Yes → Do you need real-time WebSocket events?
│         ├── Yes → FULL PACKAGE
│         │         Command: pnpm run crud:full -- TABLE --force
│         └── No  → ENTERPRISE PACKAGE
│                   Command: pnpm run crud:import -- TABLE --force
└── No  → Do you need real-time WebSocket events?
          ├── Yes → STANDARD + EVENTS
          │         Command: pnpm run crud:events -- TABLE --force
          └── No  → STANDARD PACKAGE
                    Command: pnpm run crud -- TABLE --force
```

**Package Comparison:**

| Feature             | Standard | Enterprise | Full |
| ------------------- | -------- | ---------- | ---- |
| Basic CRUD          | Yes      | Yes        | Yes  |
| Pagination          | Yes      | Yes        | Yes  |
| Search              | Yes      | Yes        | Yes  |
| Dropdown API        | No       | Yes        | Yes  |
| Bulk Operations     | No       | Yes        | Yes  |
| Excel/CSV Import    | No       | Yes        | Yes  |
| Export              | No       | Yes        | Yes  |
| WebSocket Events    | No       | No         | Yes  |
| Advanced Validation | No       | No         | Yes  |
| Uniqueness Checks   | No       | No         | Yes  |

### Step 2.2: Build Command with MCP Tool

**Integration: aegisx-mcp**

Use the MCP tool for complex command building:

```
Use MCP Tool: aegisx_crud_build_command
Input: {
  table: "table_name",
  package: "standard|enterprise|full",
  domain: "inventory/master-data",  // optional
  schema: "inventory",               // optional
  withImport: true|false,
  withEvents: true|false
}
Output: Complete command string
```

### Step 2.3: Execute Generation

For simple cases (no domain):

```bash
# Standard
pnpm run crud -- TABLE_NAME --force

# With import
pnpm run crud:import -- TABLE_NAME --force

# With events
pnpm run crud:events -- TABLE_NAME --force

# Full package
pnpm run crud:full -- TABLE_NAME --force
```

For domain-specific:

```bash
# Master-data in inventory domain
pnpm run crud -- TABLE_NAME --domain inventory/master-data --schema inventory --force

# Operations in inventory domain
pnpm run crud -- TABLE_NAME --domain inventory/operations --schema inventory --force
```

### Step 2.4: Verify Backend Generation

```bash
# Check files generated
ls apps/api/src/modules/TABLE_NAME/ 2>/dev/null || ls apps/api/src/layers/*/TABLE_NAME/

# Build to check for errors
pnpm run build
```

**Expected Files:**

- `TABLE_NAME.routes.ts` - Route definitions
- `TABLE_NAME.controller.ts` - Request handlers
- `TABLE_NAME.service.ts` - Business logic
- `TABLE_NAME.repository.ts` - Database queries
- `schemas/TABLE_NAME.schemas.ts` - TypeBox schemas

---

## Phase 3: Backend Customization (Optional)

### When to Customize

Customize when you need:

- Business logic beyond basic CRUD
- Custom endpoints
- Complex validation
- Authorization rules
- Relationships/joins

### Integration: backend-customization-guide

```
→ Use Skill: backend-customization-guide
  - Guides service layer customization
  - Patterns for custom endpoints
  - Repository extensions
  - Authorization patterns
```

### Quick Customization Patterns

#### Adding Business Logic (Service Layer)

Location: `apps/api/src/.../TABLE_NAME/TABLE_NAME.service.ts`

```typescript
async create(data: CreateDTO, userId: string): Promise<Entity> {
  // 1. Business validation
  await this.validateBusinessRules(data);

  // 2. Enrich data
  const enriched = await this.enrichWithDefaults(data, userId);

  // 3. Call repository
  return this.repository.create(enriched);
}
```

#### Adding Custom Endpoint

Location: `apps/api/src/.../TABLE_NAME/TABLE_NAME.routes.ts`

```typescript
fastify.route({
  method: 'POST',
  url: '/custom-action',
  schema: {
    body: CustomActionSchema,
    response: { 200: ResponseSchema },
  },
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    const result = await fastify.tableNameService.customAction(request.body);
    return reply.success(result);
  },
});
```

---

## Phase 4: API Testing

### Integration: api-endpoint-tester

```
→ Use Skill: api-endpoint-tester
  - Tests all generated endpoints
  - Verifies authentication
  - Checks error responses
  - Documents test results
```

### Quick API Test Sequence

```bash
# Get authentication token
TOKEN=$(curl -s -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.data.access_token')

# Test endpoints
# 1. Create
curl -X POST "http://localhost:3000/api/v1/TABLE_NAME" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field":"value"}' | jq '.'

# 2. List
curl -X GET "http://localhost:3000/api/v1/TABLE_NAME" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 3. Get by ID
curl -X GET "http://localhost:3000/api/v1/TABLE_NAME/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 4. Update
curl -X PUT "http://localhost:3000/api/v1/TABLE_NAME/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field":"updated"}' | jq '.'

# 5. Delete
curl -X DELETE "http://localhost:3000/api/v1/TABLE_NAME/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### API Test Checklist

- [ ] All CRUD endpoints return correct status codes
- [ ] Authentication is enforced
- [ ] Validation errors return 400
- [ ] Not found returns 404
- [ ] Response format matches contract

---

## Phase 5: API Contract Documentation

### Integration: api-contract-generator

```
→ Use Skill: api-contract-generator
  - Generates API_CONTRACTS.md from routes
  - Documents all endpoints
  - Includes request/response schemas
```

Output: `docs/features/TABLE_NAME/API_CONTRACTS.md`

---

## Phase 6: Frontend Generation

### Prerequisite Check

Before generating frontend:

```bash
# Verify backend exists and works
curl http://localhost:3000/api/v1/TABLE_NAME -H "Authorization: Bearer $TOKEN"
```

### Step 6.1: Generate Frontend Module

```bash
# Basic frontend
./bin/cli.js generate TABLE_NAME --target frontend --force

# With shell registration (recommended)
./bin/cli.js generate TABLE_NAME --target frontend --shell system --force

# With import dialog
./bin/cli.js generate TABLE_NAME --target frontend --with-import --force

# For admin app
./bin/cli.js generate TABLE_NAME --target frontend --app admin --force
```

### Step 6.2: Shell Selection

| Shell       | Use Case                                 |
| ----------- | ---------------------------------------- |
| `system`    | Platform/core features (users, settings) |
| `inventory` | Inventory domain features                |
| (none)      | Manual route registration needed         |

### Step 6.3: Verify Frontend Generation

```bash
# Check files
ls apps/web/src/app/features/TABLE_NAME/

# Build to check
pnpm run build
```

**Expected Files:**

- `TABLE_NAME.routes.ts` - Angular routes
- `TABLE_NAME-list.page.ts` - List component
- `TABLE_NAME-form.dialog.ts` - Create/Edit dialog
- `services/TABLE_NAME.service.ts` - HTTP service

---

## Phase 7: Frontend Integration (Optional)

### Integration: frontend-integration-guide

```
→ Use Skill: frontend-integration-guide
  - Signal-based state management
  - AegisX UI component integration
  - Dialog patterns
  - List + filters pattern
```

### Quick Customization Points

#### Service Layer

- Add computed signals for filtered data
- Add business-specific methods

#### List Component

- Add custom filters
- Add action buttons
- Customize table columns

#### Dialog Component

- Add complex form validation
- Add dependent field logic
- Add file uploads

---

## Phase 8: Quality Assurance

### Mandatory Checks

```bash
# 1. Build must pass
pnpm run build

# 2. Start both servers
pnpm run dev:api    # Terminal 1
pnpm run dev:admin  # Terminal 2

# 3. Manual testing in browser
# - List page loads
# - Create works
# - Edit works
# - Delete works
# - Search works
# - Pagination works
```

### QA Checklist

- [ ] Backend
  - [ ] All endpoints work
  - [ ] Validation enforced
  - [ ] Authentication required
  - [ ] Error messages clear
- [ ] Frontend
  - [ ] List loads correctly
  - [ ] Create dialog opens/saves
  - [ ] Edit dialog loads data
  - [ ] Delete confirms/works
  - [ ] Loading states show
  - [ ] Error handling works
- [ ] Integration
  - [ ] Frontend calls correct API
  - [ ] Response data displays
  - [ ] Real-time updates (if events enabled)

---

## Error Recovery Strategies

### Migration Failed

```bash
# Rollback migration
pnpm run db:migrate:rollback

# Fix migration file, then re-run
pnpm run db:migrate
```

### CRUD Generation Failed

```bash
# Check error message
# Common issues:
# 1. Table not found → run migration first
# 2. Missing -- separator → add it
# 3. Schema mismatch → check --schema flag

# Retry with verbose output
./bin/cli.js generate TABLE --force --verbose
```

### Build Failed After Generation

```bash
# Check TypeScript errors
pnpm run build 2>&1 | head -50

# Common issues:
# 1. Missing import → add manually
# 2. Type mismatch → check schemas
# 3. Circular dependency → reorganize imports
```

### Frontend Not Loading Data

```bash
# Check network tab in browser
# Common issues:
# 1. Wrong API URL → check proxy.conf.js
# 2. CORS error → check server config
# 3. Auth error → check token

# Verify API directly
curl http://localhost:3000/api/v1/TABLE_NAME -v
```

---

## Quick Reference Commands

### Backend

```bash
# List tables
pnpm run crud:list

# Generate (choose one)
pnpm run crud -- TABLE --force           # Standard
pnpm run crud:import -- TABLE --force    # + Import
pnpm run crud:events -- TABLE --force    # + Events
pnpm run crud:full -- TABLE --force      # All features

# With domain
pnpm run crud -- TABLE --domain DOMAIN/SUB --schema SCHEMA --force
```

### Frontend

```bash
# Generate
./bin/cli.js generate TABLE --target frontend --force

# With shell
./bin/cli.js generate TABLE --target frontend --shell SHELL --force

# With import
./bin/cli.js generate TABLE --target frontend --with-import --force
```

### Testing

```bash
# Build check
pnpm run build

# Start servers
pnpm run dev:api
pnpm run dev:admin
```

---

## Workflow Summary

For a typical new feature:

```bash
# 1. Create migration
npx knex migrate:make create_TABLE_table --knexfile apps/api/knexfile.ts
# Edit migration file with table structure

# 2. Run migration
pnpm run db:migrate

# 3. Generate backend
pnpm run crud -- TABLE --force

# 4. Test API
curl http://localhost:3000/api/v1/TABLE

# 5. Generate frontend
./bin/cli.js generate TABLE --target frontend --shell system --force

# 6. Build and test
pnpm run build
pnpm run dev:admin
```

---

## Related Skills

| Phase | Skill                       | Purpose                          |
| ----- | --------------------------- | -------------------------------- |
| 1     | typebox-schema-generator    | Generate TypeBox schemas from DB |
| 3     | backend-customization-guide | Customize generated backend      |
| 4     | api-endpoint-tester         | Test API endpoints               |
| 5     | api-contract-generator      | Document APIs                    |
| 7     | frontend-integration-guide  | Customize generated frontend     |

---

## Related Documentation

- [Feature Development Standard](../../../docs/guides/development/feature-development-standard.md)
- [Domain Architecture Guide](../../../docs/architecture/domain-architecture-guide.md)
- [Quick Domain Reference](../../../docs/architecture/quick-domain-reference.md)
- [CRUD Generator Quick Reference](../../../libs/aegisx-cli/docs/QUICK_REFERENCE.md)
- [API Response Standard](../../../docs/reference/api/api-response-standard.md)
- [TypeBox Schema Standard](../../../docs/reference/api/typebox-schema-standard.md)
