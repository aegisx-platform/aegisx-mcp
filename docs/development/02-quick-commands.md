# Quick Commands for Claude

## Status Management Commands

#### **`/status`** - Show current feature status

```bash
# Shows the current feature tracking card
```

#### **`/start [feature-name]`** - Start new feature

```bash
# Example: /start invoice-management
# Claude will ask you to choose approach:

# 1. API-First (Recommended)
#    - Design OpenAPI spec first
#    - Generate types for both layers
#    - Best for new features
#    - Ensures alignment from start

# 2. Backend-First
#    - Build API implementation first
#    - Good when backend logic is complex
#    - Frontend follows later

# 3. Frontend-First
#    - Build UI with mock data first
#    - Good for prototyping/demos
#    - Backend implements to match

# 4. Parallel Development
#    - Frontend & Backend simultaneously
#    - Requires good coordination
#    - Uses mocks until integration

# Options can be forced:
/start invoice-management --full-stack     # Default: ทำทั้ง frontend + backend
/start invoice-management --backend-only   # ทำแค่ backend
/start invoice-management --frontend-only  # ทำแค่ frontend
/start invoice-management --api-first      # ออกแบบ API ก่อน

# Claude will:
1. Create tracking card
2. Ask for your preferred approach
3. Explain pros/cons based on context
4. Let you decide
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

# Check alignment before integration
/align:check invoice

# Fix any mismatches
/align:fix invoice

# Integration when both ready
/test integration invoice
```

**Contract-First Development (Recommended):**

```bash
# 1. Design the contract
/feature:api user-management

# 2. Generate shared types
/sync:types

# 3. Develop in parallel with alignment checks
/feature:backend user-management --from-spec
/feature:frontend user-management --from-spec

# 4. Continuous alignment verification
/align:check user-management --watch

# 5. Integration testing
/integration:test user-management
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

## Priority Management Commands

#### **`/priority [level]`** - Set task priority

```bash
# Example: /priority high
# Levels: urgent | high | medium | low
# Updates current task priority in tracking
```

#### **`/urgent [task]`** - Mark as urgent

```bash
# Example: /urgent fix-authentication-bug
# Marks task as urgent and moves to top of queue
# Automatically sets priority to 'urgent'
```

#### **`/defer [task]`** - Defer task

```bash
# Example: /defer optimize-images
# Moves task to backlog with 'low' priority
```

## Validation Commands

#### **`/validate`** - Validate current implementation

```bash
# Runs comprehensive validation:
1. TypeScript compilation check
2. Linting (ESLint)
3. Unit tests
4. Integration tests
5. Build verification
```

#### **`/lint [target]`** - Run linting

```bash
# Example: /lint
# Example: /lint apps/web
# Runs ESLint on specified target or entire project
```

#### **`/typecheck [target]`** - Check TypeScript types

```bash
# Example: /typecheck
# Example: /typecheck apps/api
# Runs TypeScript compiler in check mode
```

#### **`/audit`** - Security audit

```bash
# Runs security audit on dependencies
# Checks for known vulnerabilities
```

## Alignment & Integration Commands

#### **`/align:check [feature]`** - Check frontend-backend alignment

```bash
# Example: /align:check user-management
# Comprehensive alignment check:
1. API contract validation (OpenAPI spec vs implementation)
2. TypeScript interface matching
3. Request/Response payload verification
4. Endpoint URL consistency
5. Authentication/Authorization alignment
6. Error handling compatibility
```

#### **`/align:fix [feature]`** - Auto-fix alignment issues

```bash
# Example: /align:fix user-management
# Attempts to fix common alignment issues:
- Updates TypeScript interfaces
- Syncs API endpoints
- Aligns error codes
- Fixes response formats
```

#### **`/contract:verify`** - Verify API contracts

```bash
# Verifies that:
- Frontend API calls match backend endpoints
- Request DTOs match between layers
- Response types are consistent
- HTTP methods are correct
- Query parameters align
```

#### **`/sync:types`** - Synchronize TypeScript types

```bash
# Generates shared types from:
- OpenAPI specification
- Database schemas
- Ensures frontend/backend use same types
```

#### **`/integration:test [feature]`** - Test frontend-backend integration

```bash
# Example: /integration:test auth
# Runs actual integration tests:
1. Frontend calls real backend
2. Validates data flow
3. Checks error scenarios
4. Verifies state management
```

#### **`/mismatch:detect`** - Detect API mismatches

```bash
# Scans for:
- Unused API endpoints
- Frontend calls to non-existent endpoints
- Type mismatches in API calls
- Missing error handlers
- Inconsistent naming conventions
```

#### **`/schema:compare`** - Compare schemas

```bash
# Compares:
- OpenAPI spec vs actual implementation
- Frontend models vs backend DTOs
- Database schema vs API responses
- Shows differences and suggests fixes
```

## Documentation Commands

#### **`/docs:api [feature]`** - Generate API documentation

```bash
# Example: /docs:api user-management
# Generates OpenAPI documentation
# Updates Swagger/Postman collections
```

#### **`/docs:update [section]`** - Update documentation

```bash
# Example: /docs:update architecture
# Updates specific documentation section
# Syncs with code changes
```

#### **`/changelog [type]`** - Update changelog

```bash
# Example: /changelog feature "Added user management"
# Types: feature | fix | breaking | improvement
```

#### **`/readme`** - Update README

```bash
# Updates README with latest changes
# Adds new features to documentation
```

## Rollback/Undo Commands

#### **`/rollback`** - Rollback last change

```bash
# Rolls back the most recent change
# Shows what will be rolled back first
```

#### **`/undo [steps]`** - Undo specific steps

```bash
# Example: /undo 3
# Undoes last 3 operations
# Shows preview before executing
```

#### **`/restore [checkpoint]`** - Restore from checkpoint

```bash
# Example: /restore checkpoint-2024-01-15-1420
# Restores project state from checkpoint
# Lists available checkpoints if none specified
```

#### **`/revert [file]`** - Revert file changes

```bash
# Example: /revert src/app/user.service.ts
# Reverts file to last known good state
```

## Testing Shortcuts

#### **`/test:unit [target]`** - Run unit tests

```bash
# Example: /test:unit user.service
# Example: /test:unit apps/api
# Runs Jest unit tests for target
```

#### **`/test:integration [feature]`** - Run integration tests

```bash
# Example: /test:integration auth
# Runs integration tests for feature
# Includes API and database tests
```

#### **`/test:e2e [scenario]`** - Run E2E tests with Playwright MCP

```bash
# Example: /test:e2e user-registration
# Uses Playwright MCP for visual E2E testing
# Shows browser interactions in real-time
# Captures screenshots automatically

# With MCP:
"Use Playwright MCP to run user registration E2E test"
"Use Playwright MCP to debug failing login test"
```

#### **`/test:coverage [threshold]`** - Check coverage

```bash
# Example: /test:coverage 80
# Checks if coverage meets threshold
# Shows uncovered lines
```

#### **`/test:visual [component]`** - Visual regression tests

```bash
# Example: /test:visual user-list
# Takes screenshots and compares
# Uses Playwright MCP for visual testing

# With MCP:
"Use Playwright MCP to capture visual snapshots"
"Use Playwright MCP to compare UI changes"
```

## MCP-Enhanced Commands

#### **`/mcp:nx [command]`** - Use Nx through MCP

```bash
# Examples:
/mcp:nx generate component user-card
/mcp:nx affected:test
/mcp:nx dep-graph

# Or ask Claude directly:
"Use Nx MCP to generate a new library"
"Use Nx MCP to show affected projects"
```

#### **`/mcp:playwright [action]`** - Use Playwright through MCP

```bash
# Examples:
/mcp:playwright test login.spec.ts
/mcp:playwright debug checkout-flow
/mcp:playwright record new-test

# Or ask Claude directly:
"Use Playwright MCP to create a new test"
"Use Playwright MCP to debug with browser open"
```

## Environment Commands

#### **`/env:check`** - Check environment setup

```bash
# Validates environment configuration:
- Node.js version
- Required env variables
- Database connection
- Redis connection
- Docker status
```

#### **`/env:vars [show|set|validate]`** - Manage env variables

```bash
# Example: /env:vars show
# Shows all required env variables

# Example: /env:vars validate
# Checks if all required vars are set

# Example: /env:vars set JWT_SECRET
# Helps set environment variable
```

#### **`/docker:status`** - Check Docker status

```bash
# Shows status of all containers
# Checks health of services
```

#### **`/docker:logs [service]`** - Show Docker logs

```bash
# Example: /docker:logs postgres
# Shows logs for specific service
```

#### **`/db:status`** - Database status

```bash
# Checks database connection
# Shows migration status
# Lists pending migrations
```

## Help Commands

#### **`/help [command]`** - Show command help

```bash
# Example: /help feature
# Shows detailed help for command
# Includes examples and options
```

#### **`/commands [category]`** - List commands

```bash
# Example: /commands
# Lists all available commands

# Example: /commands testing
# Lists commands in category
```

#### **`/examples [command]`** - Show examples

```bash
# Example: /examples feature
# Shows real usage examples
# Includes common scenarios
```

#### **`/tips`** - Show productivity tips

```bash
# Shows tips for efficient development
# Suggests optimal workflows
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

### Generation Modifiers

- `--dry-run` - Show what will be created without creating
- `--force` - Overwrite existing files
- `--skip-tests` - Don't generate tests
- `--with-state` - Include state management
- `--standalone` - Use standalone components
- `--template=[name]` - Use specific template

### Target Modifiers

- `--admin` - For admin portal instead of user portal
- `--web` - Target web application
- `--api` - Target API only

### Development Modifiers

- `--mock` - Use mock data/API
- `--from-spec` - Generate from OpenAPI spec
- `--parallel` - For parallel development

### Scope Modifiers

- `--only-crud` - Basic CRUD operations only
- `--only-list` - List view only
- `--only-form` - Form component only
- `--only-detail` - Detail view only
- `--minimal` - Minimal implementation
- `--full` - Full implementation with all features

### Output Modifiers

- `--verbose` - Show detailed output
- `--silent` - Minimal output
- `--interactive` - Ask for options during execution
- `--json` - Output in JSON format
- `--no-format` - Skip code formatting

### Testing Modifiers

- `--with-e2e` - Include E2E tests
- `--with-visual` - Include visual tests
- `--coverage` - Run with coverage report

Example:

```bash
/feature products --admin --with-state --verbose
/feature:frontend users --mock --only-list --template=material
/feature:backend orders --from-spec --skip-tests --dry-run
/component product-list smart --standalone --interactive
/test:unit user.service --coverage --verbose
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
Use `/align:check` to verify frontend-backend alignment.

## Best Practices for Frontend-Backend Alignment

### 1. Always Start with API Contract

```bash
/feature:api [name]  # Design API first
/sync:types         # Generate shared types
```

### 2. Use Alignment Checks During Development

```bash
/align:check [feature] --watch  # Continuous monitoring
```

### 3. Validate Before Integration

```bash
/contract:verify     # Check API contracts
/mismatch:detect    # Find inconsistencies
/align:fix [feature] # Fix issues
```

### 4. Common Alignment Issues to Avoid

- Different field names (userId vs user_id)
- Missing error handling on frontend
- Mismatched data types (string vs number)
- Different API paths
- Inconsistent authentication headers
- Response format differences

### 5. Alignment Workflow Example

```bash
# Start new feature with alignment
/start invoice-management --api-first

# Design contract
/feature:api invoice-management

# Generate and sync types
/sync:types

# Develop with alignment
/feature:backend invoice-management --from-spec
/feature:frontend invoice-management --from-spec

# Check alignment continuously
/align:check invoice-management --watch

# Before merging
/contract:verify
/integration:test invoice-management
```

## Development Approach Decision Flow

When you use `/start [feature]`, Claude will present options based on context:

### 🎯 Understanding Different Approaches

#### **API-First vs Backend-First - ความแตกต่างที่สำคัญ**

**🔵 API-First Approach**

```
Definition: ออกแบบ Contract/Interface (OpenAPI Spec) ก่อน แล้วค่อย implement
```

- เริ่มจาก: OpenAPI specification design
- Frontend/Backend: พัฒนาตาม spec พร้อมกันได้
- Type Safety: Generate types จาก spec
- Documentation: Auto-generated
- Best for: New features, External APIs, Team collaboration

**🟢 Backend-First Approach**

```
Definition: Implement backend code โดยตรง ไม่มี spec ก่อน
```

- เริ่มจาก: Database + Code implementation
- Frontend: ต้องรอดู actual API response
- Type Safety: Extract จาก implementation
- Documentation: Generate ทีหลัง (หรือไม่มี)
- Best for: Prototypes, Internal tools, Solo development

### ✅ **Recommended Best Practice: API-First → Implementation**

```bash
# The RIGHT way (API-First → Backend Implementation)
1. Design API Contract (OpenAPI Spec)
2. Review & Approve with team
3. Generate shared types
4. Backend implements following spec
5. Frontend implements using same spec
6. Both sides aligned automatically ✅

# NOT Backend-First (ไม่แนะนำ)
❌ Backend codes without spec
❌ Frontend guesses the API
❌ Misalignment risks
```

### 📋 **Standard Workflow Example**

```bash
/start user-management

# Step 1: Choose API-First (Recommended)
Claude: "Which approach would you prefer?"
> 1 (API-First)

# Step 2: Design Phase
/feature:api user-management
# Output: Complete OpenAPI specification

# Step 3: Type Generation
/sync:types
# Output: Shared TypeScript interfaces

# Step 4: Implementation Phase
/feature:backend user-management --from-spec
/feature:frontend user-management --from-spec --mock

# Step 5: Continuous Alignment
/align:check user-management --watch

# Step 6: Integration
/integration:test user-management
```

### Scenario-Based Recommendations:

**1. New Feature from Scratch**

```
Recommended: API-First → Implementation
- Design contract first
- Backend implements spec
- Frontend uses same spec
- Best alignment guarantee
```

**2. Urgent Frontend Demo Needed**

```
Recommended: API-First → Frontend with Mocks
- Quick spec design (30 mins)
- Frontend with mock data
- Backend catches up later
- Still maintains contract
```

**3. Complex Business Logic**

```
Recommended: API-First with detailed schemas
- Design data models in spec
- Backend implements carefully
- Frontend knows what to expect
```

**4. Team Working in Parallel**

```
Recommended: API-First (Essential!)
- Define contract together
- Work independently
- No miscommunication
- Meet at integration
```

**5. Legacy System Migration**

```
Exception: Backend-First might be OK
- Understand existing system
- Expose as-is first
- Refactor later
```

### Interactive Selection Example:

```
/start user-management

Claude: "I see you're starting user-management feature. Based on current context:
- ✅ Database is ready
- ✅ Auth system exists
- ⚠️ No existing user module

Which approach would you prefer?

1️⃣ API-First (Recommended)
   Best for ensuring frontend-backend alignment

2️⃣ Backend-First
   If you need complex role/permission logic first

3️⃣ Frontend-First
   If you need to demo UI quickly

4️⃣ Parallel Development
   If you have clear requirements for both

Please choose (1-4) or let me recommend based on your deadline/constraints."
```
