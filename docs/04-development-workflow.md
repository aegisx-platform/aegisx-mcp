# Feature Development Workflow

## IMPORTANT: Follow this workflow for EVERY new feature

## Step 0: Initialize Feature Tracking
**ALWAYS start with creating a feature tracking card:**

```markdown
1. Gather requirements
2. Document design decisions  
3. Create task checklist
4. Set initial status
5. Define API response format (CREATE must return record)
```

Use `/start [feature-name]` to begin.

## Step 1: API-First Design
1. **Update OpenAPI specification** (`openapi/schema.yaml`)
   - Define new endpoints
   - Add request/response schemas
   - Update data models
2. **Generate types and client**
   ```bash
   yarn openapi:generate
   ```
3. **Verify generated code** in `libs/api-client`
   - Check TypeScript types are generated correctly
   - Verify API client services match schema
   - Ensure response interfaces include ApiResponse wrapper

## Step 2: Database Changes (if needed)
1. **Create migration**
   ```bash
   yarn knex migrate:make feature_name
   ```
2. **Write migration** in `database/migrations/`
3. **Run migration**
   ```bash
   yarn knex migrate:latest
   ```
4. **Update seeds** if needed
   ```bash
   yarn knex seed:run
   ```

## Step 3: Backend Implementation

### Feature Module Architecture

1. **Create feature module** in `apps/api/src/modules/`

#### Basic Module Structure (Single Controller)
```
apps/api/src/modules/[feature]/
├── [feature].controller.ts     # HTTP Layer - Routes & Request/Response
├── [feature].service.ts        # Business Logic Layer
├── [feature].repository.ts     # Data Access Layer - Database queries
├── [feature].validation.ts     # Validation Schemas (Zod)
├── [feature].types.ts         # TypeScript Types/Interfaces
├── [feature].test.ts          # Test Suite
└── index.ts                   # Module registration
```

#### Complex Module Structure (Multiple Controllers)
```
apps/api/src/modules/user/
├── controllers/
│   ├── user.controller.ts         # Main user CRUD
│   ├── user-profile.controller.ts # Profile management
│   ├── user-auth.controller.ts    # Authentication endpoints
│   ├── user-admin.controller.ts   # Admin-only operations
│   └── index.ts
├── services/
│   ├── user.service.ts
│   ├── user-profile.service.ts
│   ├── user-auth.service.ts
│   └── index.ts
├── repositories/
│   ├── user.repository.ts
│   ├── user-session.repository.ts
│   └── index.ts
├── validations/
│   ├── user.validation.ts
│   ├── profile.validation.ts
│   ├── auth.validation.ts
│   └── index.ts
├── types/
│   ├── user.types.ts
│   ├── auth.types.ts
│   └── index.ts
├── tests/
│   ├── user.controller.test.ts
│   ├── user.service.test.ts
│   ├── user.repository.test.ts
│   └── integration.test.ts
└── index.ts                       # Module registration
```

2. **Layer Responsibilities**:

   - **Controller**: HTTP handling, route definition, request/response formatting
   - **Service**: Business logic, orchestration, transaction management
   - **Repository**: Database operations, query building, data mapping
   - **Validation**: Input validation, schema definition, type safety
   - **Types**: TypeScript interfaces, enums, type definitions

3. **Data Flow**:
   ```
   Request → Controller → Validation → Service → Repository → Database
              ↓            ↓            ↓          ↓           ↓
           Response ← Transform ← Business ← Query ← Raw Data
                                  Logic      Result
   ```

4. **Implementation Order**:
   - Define types/interfaces
   - Create validation schemas
   - Implement repository (database layer)
   - Implement service (business logic)
   - Implement controller (routes)
   - Write tests for each layer
   - Register module in main app

5. **Module Registration Example**:
   ```typescript
   // index.ts
   export async function registerUserModule(app: FastifyInstance) {
     // Initialize repositories
     const userRepository = new UserRepository(knex);
     
     // Initialize services
     const userService = new UserService(userRepository);
     
     // Initialize controllers
     const userController = new UserController(userService);
     
     // Register routes
     await userController.register(app);
   }
   ```

6. **Register routes** in main application
7. **Test with Swagger** at `/api-docs`

## Step 4: Frontend Implementation

### Angular Feature Module Architecture

1. **Generate feature module structure**

#### Basic Feature Structure
```
apps/[app]/src/app/features/[feature]/
├── components/
│   ├── [feature]-list/
│   │   ├── [feature]-list.component.ts
│   │   ├── [feature]-list.component.html
│   │   ├── [feature]-list.component.scss
│   │   └── [feature]-list.component.spec.ts
│   ├── [feature]-detail/
│   │   ├── [feature]-detail.component.ts
│   │   ├── [feature]-detail.component.html
│   │   └── [feature]-detail.component.scss
│   ├── [feature]-form/
│   │   ├── [feature]-form.component.ts
│   │   ├── [feature]-form.component.html
│   │   └── [feature]-form.component.scss
│   └── [feature]-dialog/
│       └── [feature]-dialog.component.ts
├── services/
│   ├── [feature].service.ts
│   └── [feature]-state.service.ts
├── guards/
│   └── [feature].guard.ts
├── models/
│   └── [feature].model.ts
├── pages/
│   ├── [feature]-page/
│   │   ├── [feature]-page.component.ts
│   │   └── [feature]-page.component.html
│   └── [feature]-admin-page/
│       └── [feature]-admin-page.component.ts
├── pipes/
│   └── [feature].pipe.ts
├── directives/
│   └── [feature].directive.ts
├── [feature]-routing.module.ts
└── [feature].module.ts
```

#### Complex Feature with State Management (NgRx)
```
apps/[portal]/src/app/features/[feature]/
├── components/           # Presentational components
├── containers/          # Smart components (connected to store)
├── services/
├── guards/
├── models/
├── store/               # NgRx state management
│   ├── actions/
│   │   └── [feature].actions.ts
│   ├── effects/
│   │   └── [feature].effects.ts
│   ├── reducers/
│   │   └── [feature].reducer.ts
│   ├── selectors/
│   │   └── [feature].selectors.ts
│   └── index.ts
├── [feature]-routing.module.ts
└── [feature].module.ts
```

2. **Generate Angular components with CLI**
   ```bash
   # For web app
   nx g @nx/angular:module features/user --project=web --routing
   nx g @nx/angular:component features/user/components/user-list --project=web
   nx g @nx/angular:component features/user/components/user-form --project=web
   nx g @nx/angular:service features/user/services/user --project=web
   nx g @nx/angular:guard features/user/guards/user --project=web
   
   # For admin app
   nx g @nx/angular:module features/user --project=admin --routing
   nx g @nx/angular:component features/user/components/user-management --project=admin
   nx g @nx/angular:service features/user/services/user-admin --project=admin
   ```

3. **IMPORTANT: Use generated types from OpenAPI**
   ```typescript
   // Import ONLY types from generated code (no wrapper client)
   import { User, CreateUserRequest, ApiResponse } from '@org/api-client';
   
   // Use standard Angular HttpClient with generated types
   constructor(private http: HttpClient) {}
   
   async getUsers(): Promise<User[]> {
     const response = await this.http.get<ApiResponse<User[]>>('/api/users').toPromise();
     return response?.data || [];
   }
   
   // DON'T create duplicate interfaces ❌
   // DO use generated types with HttpClient ✅
   ```

7. **Add routes** to main routing module

## Step 5: Testing
1. **Unit tests**
   ```bash
   nx test api --watch
   nx test web --watch
   ```
2. **Integration tests** for API
   ```bash
   nx test api-e2e
   ```
3. **E2E tests with Playwright**
   ```bash
   # Run headless
   nx e2e web-e2e
   
   # Run with browser visible (for debugging)
   nx e2e web-e2e --headed
   
   # Run specific test
   nx e2e web-e2e --grep "user management"
   
   # Update visual snapshots
   nx e2e web-e2e --update-snapshots
   ```
4. **Visual regression tests**
   ```bash
   # Run visual tests
   yarn e2e:visual
   
   # Claude with MCP can also run:
   /test visual [feature-name]
   /test screenshot [feature-name]-completed
   ```
5. **Accessibility tests**
   ```bash
   yarn e2e:a11y
   ```
6. **Run all tests**
   ```bash
   nx run-many --target=test --all
   nx run-many --target=e2e --all
   ```

## Step 6: Documentation & Commit
1. **Update README** if needed
2. **Commit with conventional commit**
   ```bash
   yarn commit
   # Select type: feat/fix/etc
   # Select scope: api/web/admin
   # Write message
   ```

## Step 7: Pull Request
1. **Check affected projects**
   ```bash
   nx affected:graph
   ```
2. **Run affected tests**
   ```bash
   nx affected:test
   nx affected:lint
   ```
3. **Create PR** with description
4. **Wait for CI** to pass

## Step 8: Update Status (REQUIRED)
**After EVERY work session:**
1. Update task checklist ✅
2. Document what was completed
3. Note any blockers
4. Write TODO for next session
5. Show updated status card

Use `/update-status` or `/checkpoint` to save progress.

## Development Commands

### Initial Setup
```bash
# Create workspace
npx create-nx-workspace@latest my-workspace --preset=angular --packageManager=yarn

# Add Fastify backend
nx g @nx/node:application api --framework=fastify

# Install dependencies
yarn add knex pg bcrypt @fastify/jwt @fastify/cors @fastify/cookie
yarn add -D @types/node @types/bcrypt

# Angular Material & TailwindCSS setup
ng add @angular/material --project=web
nx g @nx/angular:setup-tailwind web
```

### Daily Development
```bash
# Start services
docker-compose up -d        # Start database & nginx
yarn dev:api               # Start API
yarn dev:web               # Start web app
yarn dev:admin             # Start admin app

# Database
yarn knex migrate:latest   # Run migrations
yarn knex migrate:make name # Create migration
yarn knex seed:run         # Run seeds

# Testing
yarn test                  # Unit tests
yarn test:affected         # Test changed only
yarn e2e                   # E2E tests with Playwright
yarn e2e:headed           # E2E with browser visible
yarn e2e:visual           # Visual regression tests
yarn e2e:debug            # Debug mode with Playwright Inspector

# Building
yarn build:affected        # Build changed
yarn build:all            # Build everything

# Code quality
yarn lint                  # Run ESLint
yarn format               # Run Prettier
yarn type-check           # TypeScript check
```

### Committing & Releasing
```bash
# Interactive commit
yarn commit

# Version preview
yarn version:preview

# Release
yarn release
```

## Conventional Commits

### Commit Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types & Version Impact
| Type | Description | Version Impact |
|------|-------------|----------------|
| feat | New feature | MINOR |
| fix | Bug fix | PATCH |
| docs | Documentation | None |
| style | Code style | None |
| refactor | Refactoring | None |
| perf | Performance | PATCH |
| test | Tests | None |
| chore | Maintenance | None |

### Breaking Changes
- Use `BREAKING CHANGE:` in footer → MAJOR version
- Or use `!` after type: `feat!:`

### Scopes
- `api`, `web`, `admin`
- `ui-kit`, `auth`, `utils`, `api-client`
- `database`, `docker`, `ci`

## Feature Completion Checklist

Before marking feature as DONE, must complete:

#### ✅ Code Complete
- [ ] Backend API implemented and tested
- [ ] Frontend UI implemented
- [ ] Integration working end-to-end
- [ ] Unit tests written (>80% coverage)

#### ✅ E2E Testing Complete  
- [ ] Page objects created
- [ ] E2E specs written
- [ ] All tests passing locally
- [ ] Visual snapshots captured
- [ ] Tested on all target browsers
- [ ] Responsive design verified
- [ ] Accessibility checked

#### ✅ Quality Assurance
- [ ] Code reviewed
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security considerations addressed
- [ ] Documentation updated

#### ✅ Ready for Production
- [ ] CI/CD pipeline passing
- [ ] E2E tests in CI passing
- [ ] Visual regression approved
- [ ] Stakeholder sign-off

### Automated Test Execution

Claude will automatically run tests when:
- Feature implementation complete
- Before committing code
- After fixing bugs
- During code review

```bash
# Claude auto-executes:
/test e2e [feature-name]
/test visual [feature-name]
/checkpoint "E2E tests completed"
```