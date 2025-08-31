# Quick Commands for Claude

## Status Management Commands

#### **`/status`** - Show current feature status
```bash
# Shows the current feature tracking card
```

#### **`/start [feature-name]`** - Start new feature
```bash
# Example: /start invoice-management
# Options:
/start invoice-management --full-stack     # Default: ทำทั้ง frontend + backend
/start invoice-management --backend-only   # ทำแค่ backend
/start invoice-management --frontend-only  # ทำแค่ frontend
/start invoice-management --api-first      # ออกแบบ API ก่อน

# Creates tracking card and asks for approach
```

#### **`/update-status`** - Update current status
```bash
# Updates the tracking card with latest progress
```

#### **`/resume`** - Resume from last session
```bash
# Shows last status and continues from there
```

#### **`/checklist`** - Show current checklist
```bash
# Shows what's done and what's pending
```

## Feature Development Commands

Use these shortcuts to quickly instruct Claude to create features:

#### **`/feature [name]`** - Create complete feature (Full-Stack)
```bash
# Example: /feature user-management
# Claude will:
1. Update OpenAPI spec
2. Create database migration
3. Generate backend module (controller, service, repository)
4. Generate frontend module (components, service, routes)
5. Create tests
6. Run E2E tests
7. Update routing
```

#### **`/feature:backend [name]`** - Backend only
```bash
# Example: /feature:backend user-management
# Claude will:
1. Update OpenAPI spec
2. Create database migration
3. Generate controller with CRUD
4. Generate service & repository
5. Add validation schemas
6. Create unit tests
7. Test with Swagger/Postman
```

#### **`/feature:frontend [name]`** - Frontend only
```bash
# Example: /feature:frontend user-management
# Claude will:
1. Check/use existing API spec
2. Create feature module structure
3. Generate components (list, form, detail)
4. Create service with signals
5. Configure routing
6. Create component tests
7. Run E2E tests with Playwright

# Options:
/feature:frontend users --web    # For web app
/feature:frontend users --admin  # For admin app
```

#### **`/feature:api [name]`** - API design only
```bash
# Example: /feature:api user-management
# Claude will:
1. Design OpenAPI specification
2. Define endpoints
3. Create request/response schemas
4. Generate TypeScript types
5. Create API documentation
```

#### **`/feature:ui [name]`** - UI components only
```bash
# Example: /feature:ui user-management
# Claude will:
1. Create UI components
2. Implement Material + Tailwind styling
3. Add responsive design
4. Create Storybook stories (if applicable)
5. Take visual snapshots
```

## Workflow Options

**Sequential Development:**
```bash
# Start with backend
/feature:backend invoice

# After backend is ready
/feature:frontend invoice

# Finally, integration testing
/test e2e invoice
```

**Parallel Development:**
```bash
# Design API first
/feature:api invoice

# Then parallel work
/feature:backend invoice --from-spec
/feature:frontend invoice --mock-api

# Integration when both ready
/test integration invoice
```

**Component by Component:**
```bash
# Backend endpoints one by one
/api invoices/list
/api invoices/create
/api invoices/update

# Frontend components one by one
/component invoice-list smart
/component invoice-form presentational
/component invoice-detail smart
```

## Individual Commands

#### **`/api [resource]`** - Create API endpoint
```bash
# Example: /api products
# Claude will:
1. Update OpenAPI spec
2. Create controller with CRUD
3. Create service & repository
4. Add validation schemas
5. Generate tests
```

#### **`/page [name]`** - Create Angular page
```bash
# Example: /page dashboard
# Claude will:
1. Create page component
2. Add routing
3. Create service if needed
4. Add to navigation

# Options:
/page dashboard --web    # For web app (default)
/page dashboard --admin  # For admin app
```

#### **`/crud [entity]`** - Full CRUD implementation
```bash
# Example: /crud product
# Claude will create:
- Backend: controller, service, repository, validation
- Frontend: list, form, detail components
- Database: migration
- Tests: unit & integration
```

#### **`/migration [name]`** - Database migration
```bash
# Example: /migration add-user-avatar
# Claude will:
1. Create Knex migration file
2. Add up/down methods
3. Update TypeScript types
```

#### **`/component [name] [type]`** - Create component
```bash
# Example: /component user-card presentational
# Types: smart | presentational | dialog | form
```

#### **`/service [name]`** - Create service
```bash
# Example: /service notification
# Creates service with signals for frontend or backend
```

#### **`/test [target]`** - Generate tests
```bash
# Example: /test user.service
# Generates appropriate test file with mocks

# With Playwright MCP:
# Example: /test e2e user-management
# Runs E2E tests and captures screenshots

# Example: /test visual user-list
# Runs visual regression tests
```

## Quick Fix Commands

#### **`/fix [error]`** - Fix specific error
```bash
# Example: /fix "Cannot find module '@org/auth'"
```

#### **`/refactor [target] [pattern]`** - Refactor code
```bash
# Example: /refactor user.service signals
# Refactors service to use signals
```

#### **`/optimize [target]`** - Optimize performance
```bash
# Example: /optimize user-list.component
```

## Project Commands

#### **`/setup [tool]`** - Setup tools/libraries
```bash
# Example: /setup sentry
# Example: /setup redis
```

#### **`/deploy [env]`** - Deployment help
```bash
# Example: /deploy staging
```

#### **`/debug [issue]`** - Debug assistance
```bash
# Example: /debug "JWT token not refreshing"
```

## Workflow Shortcuts

#### **`/workflow feature [name]`** - Complete feature workflow
```bash
# Example: /workflow feature invoice-management
# Executes full workflow:
1. Design API (/api-design)
2. Create migration (/migration)
3. Build backend (/backend)
4. Build frontend (/frontend)
5. Create tests (/tests)
6. Run E2E with Playwright (/test e2e)
7. Visual QA (/test visual)
8. Update docs (/docs)
```

#### **`/workflow auth [type]`** - Auth implementation
```bash
# Example: /workflow auth oauth-google
# Implements complete OAuth flow
```

#### **`/workflow deploy`** - Deployment workflow
```bash
# Prepares everything for deployment:
1. Run tests
2. Build images
3. Update configs
4. Create release
```

## Context Commands

#### **`/context [area]`** - Load specific context
```bash
# Example: /context backend
# Focuses on backend-specific patterns

# Example: /context frontend
# Focuses on Angular/UI patterns
```

#### **`/spec [area]`** - Show specification
```bash
# Example: /spec database
# Shows database schema and patterns

# Example: /spec api
# Shows API patterns and endpoints
```

## Code Generation Shortcuts

#### **`/gen [template] [name]`** - Generate from template
```bash
# Templates:
- module: Full feature module
- api: API endpoint set
- component: Angular component
- service: Service with signals
- repository: Database repository
- migration: Database migration
- test: Test suite

# Example: /gen module user-profile
```

## Batch Commands

#### **`/batch [commands]`** - Execute multiple commands
```bash
# Example: /batch "migration:add-roles, api:roles, page:role-management"
```

## Smart Commands (Context-Aware)

#### **`/continue`** - Continue last task
```bash
# Continues from where we left off
# Shows last status first
```

#### **`/next`** - Next logical step
```bash
# Suggests and executes next step in workflow
# Updates checklist automatically
```

#### **`/review`** - Review current work
```bash
# Reviews code and suggests improvements
# Updates status with review notes
```

#### **`/checkpoint`** - Save progress
```bash
# Creates detailed checkpoint
# Can resume from this exact point
```

## Usage Examples

```bash
# Full-stack feature (ทำทั้งหมด)
/feature user-management

# Backend first approach (ทำ backend ก่อน)
/feature:backend user-management
# ... test backend ...
/feature:frontend user-management

# Frontend with mocked API (ทำ frontend ก่อน)
/feature:api user-management
/feature:frontend user-management --mock
# ... later ...
/feature:backend user-management

# Specific parts only (ทำเฉพาะส่วน)
/feature:backend users --only-crud
/feature:frontend users --only-list
/component user-card presentational

# Fix specific layer (แก้เฉพาะส่วน)
/fix:backend "user service error"
/fix:frontend "form validation not working"
/optimize:backend user-query
/optimize:frontend user-list-performance
```

## Command Modifiers

Add these modifiers to any command:

- `--dry-run` - Show what will be created without creating
- `--force` - Overwrite existing files
- `--skip-tests` - Don't generate tests
- `--with-state` - Include state management
- `--standalone` - Use standalone components
- `--admin` - For admin portal instead of user portal
- `--mock` - Use mock data/API
- `--from-spec` - Generate from OpenAPI spec
- `--only-crud` - Basic CRUD operations only
- `--only-list` - List view only
- `--only-form` - Form component only
- `--parallel` - For parallel development

Example:
```bash
/feature products --admin --with-state
/feature:frontend users --mock --only-list
/feature:backend orders --from-spec --skip-tests
/component product-list smart --standalone
```

## Workflow State Management

Claude will track workflow state:

```typescript
// Claude tracks:
{
  currentFeature: "user-management",
  completedSteps: ["openapi", "migration", "backend"],
  pendingSteps: ["frontend", "tests"],
  errors: [],
  context: "backend"
}
```

Use `/status` to check current state.
Use `/continue` to resume workflow.