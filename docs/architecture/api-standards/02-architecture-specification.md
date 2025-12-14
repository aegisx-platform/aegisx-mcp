# API Architecture Specification

**Document Version:** 2.0
**Last Updated:** 2025-12-14
**Status:** ✅ Production Ready (Enhanced with real-world insights)

## Table of Contents

1. [Overview](#overview)
2. [Layer-Based Architecture](#layer-based-architecture)
3. [Module Categorization Rules](#module-categorization-rules)
4. [Edge Cases and Decision Framework](#edge-cases-and-decision-framework)
5. [Plugin Pattern Specification](#plugin-pattern-specification)
6. [URL Routing Standards](#url-routing-standards)
7. [Migration Difficulty Matrix](#migration-difficulty-matrix)
8. [Lessons Learned from Phase 3 Migrations](#lessons-learned-from-phase-3-migrations)
9. [Related Documentation](#related-documentation)

---

## Overview

The AegisX Platform API follows a **layer-based architecture** that organizes code into three distinct layers: **Core**, **Platform**, and **Domains**. This architecture provides clear separation of concerns, improves code discoverability, and enables independent scaling of different system components.

### Design Principles

1. **Clarity through Layers**: Three distinct layers with clear boundaries and purposes
2. **Convention over Configuration**: Standard patterns reduce decision-making overhead
3. **Dependency Direction**: Clear dependency rules prevent circular dependencies
4. **Single Responsibility**: Each layer has a specific, well-defined purpose
5. **Scalability**: Layers can scale independently based on demand

### Architecture Benefits

**For Developers:**

- Clear guidelines for where code belongs, reducing decision fatigue
- Predictable code location based on module purpose
- Faster development with established patterns

**For New Team Members:**

- Self-documenting architecture with intuitive organization
- Clear examples to follow for common tasks
- Reduced onboarding time

**For Maintainers:**

- Easy to locate code with predictable structure
- Clear dependency rules prevent architectural erosion
- Better code review with known patterns

**For API Consumers:**

- Consistent, versioned URL patterns
- Predictable endpoint locations
- Clear API organization

---

## Layer-Based Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   API Gateway                        │
│              (apps/api/src/server.ts)                │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌─────────────────────────────────────────────────────┐
│            Layer-Based Architecture                  │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │   Core   │  │ Platform │  │ Domains  │          │
│  │  Layer   │  │  Layer   │  │  Layer   │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       │             │             │                 │
│       └─────────────┴─────────────┘                 │
└──────────────────┬──────────────────────────────────┘
                   │
          ┌────────▼────────┐
          │ Shared Services │
          │ (Database, WS)  │
          └─────────────────┘
```

### Layer 1: Core (Infrastructure)

**Purpose:** Provides foundational infrastructure services that the entire system depends on.

**Characteristics:**

- **Infrastructure-focused**: Authentication, logging, monitoring, security
- **System-wide decoration**: Decorates Fastify instance with reusable services
- **No business logic**: Pure infrastructure concerns only
- **Used by all layers**: Both Platform and Domains depend on Core

**Examples:**

- Authentication (`layers/core/auth/`)
- Security (API keys, rate limiting)
- Monitoring (logging, metrics, health checks)
- Audit trails and compliance

**URL Pattern:** `/api/v1/core/{resource}`

**Plugin Pattern:** ✅ **MUST use `fp()` wrapper** (aggregator or decorator plugins)

**Directory Structure:**

```
apps/api/src/layers/core/
├── auth/
│   ├── auth.plugin.ts          # ✅ Uses fp() - decorates fastify
│   ├── auth.routes.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.schemas.ts
│   └── strategies/
├── security/
│   ├── api-keys/
│   └── rate-limiting/
├── monitoring/
│   ├── monitoring.plugin.ts    # ✅ Uses fp() - decorates fastify
│   ├── services/
│   └── plugins/
└── audit/
    ├── audit.plugin.ts         # ✅ Uses fp() - decorates fastify
    ├── file-audit/
    └── login-attempts/
```

---

### Layer 2: Platform (Shared Services)

**Purpose:** Provides shared services used by multiple business domains.

**Characteristics:**

- **Multi-domain usage**: Services used by 2+ domains
- **Horizontal functionality**: Cross-cutting concerns like users, files, settings
- **No business logic**: Generic, reusable functionality only
- **Depends on Core only**: Cannot depend on Domains

**Examples:**

- User management (`layers/platform/users/`)
- RBAC and permissions (`layers/platform/rbac/`)
- Department hierarchy (`layers/platform/departments/`)
- File upload/download (`layers/platform/file-upload/`)
- Attachments (`layers/platform/attachments/`)
- PDF export (`layers/platform/pdf-export/`)
- Import/export services (`layers/platform/import/`)
- System settings (`layers/platform/settings/`)
- Navigation menus (`layers/platform/navigation/`)

**URL Pattern:** `/api/v1/platform/{resource}`

**Plugin Pattern:** ❌ **MUST use plain async function** (leaf modules with routes/controllers only)

**Exception:** Aggregator plugins (e.g., `import.plugin.ts`) that register multiple sub-plugins ✅ **use `fp()` wrapper**

**Directory Structure:**

```
apps/api/src/layers/platform/
├── users/
│   ├── users.plugin.ts         # ❌ No fp() - leaf module
│   ├── users.routes.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   └── users.schemas.ts
├── rbac/
│   ├── rbac.plugin.ts          # ❌ No fp() - leaf module
│   └── ...
├── departments/                # Department management
├── settings/                   # System settings
├── navigation/                 # Menu navigation
├── file-upload/                # File upload/download
├── attachments/                # Attachment management
├── pdf-export/                 # PDF generation
└── import/                     # Excel/CSV import
    ├── import.plugin.ts        # ✅ Uses fp() - aggregator
    ├── base/
    └── discovery/
```

---

### Layer 3: Domains (Business Logic)

**Purpose:** Contains domain-specific business logic for specific business areas.

**Characteristics:**

- **Business-focused**: Specific to one business domain (Inventory, HR, Finance, etc.)
- **Domain isolation**: Domains NEVER depend on each other
- **Vertical functionality**: Complete feature sets for specific business areas
- **Depends on Core + Platform**: Can use both infrastructure and shared services

**Examples:**

- Inventory management (`layers/domains/inventory/`)
  - Master data: drugs, equipment, supplies
  - Operations: stock movements, requisitions
  - Procurement: purchasing, vendors
  - Budget: allocations, tracking
- Admin features (`layers/domains/admin/`)
  - System initialization
  - Advanced configuration

**URL Pattern:** `/api/v1/domains/{domain}/{resource}`

**Plugin Pattern:**

- **Domain aggregators:** ✅ **MUST use `fp()` wrapper** (registers sub-modules)
- **Leaf modules:** ❌ **MUST use plain async function**

**Directory Structure:**

```
apps/api/src/layers/domains/
├── inventory/
│   ├── inventory.plugin.ts     # ✅ Uses fp() - domain aggregator
│   ├── master-data/
│   │   ├── drugs/
│   │   │   ├── drugs.plugin.ts # ❌ No fp() - leaf module
│   │   │   └── ...
│   │   └── equipment/
│   ├── operations/
│   ├── procurement/
│   └── budget/
└── admin/
    ├── admin.plugin.ts         # ✅ Uses fp() - domain aggregator
    └── system-init/
```

---

### Layer Dependency Rules

**Strict Dependency Hierarchy:**

```
Core Layer
  ↓ depends on: NOTHING (pure infrastructure)
  ↓ used by: Platform, Domains

Platform Layer
  ↓ depends on: Core ONLY
  ↓ used by: Domains
  ↓ isolation: Platform modules independent of each other

Domains Layer
  ↓ depends on: Core + Platform
  ↓ used by: API consumers
  ↓ isolation: Domain NEVER depends on another Domain
```

**Dependency Violations:**

❌ **FORBIDDEN:**

- Platform depending on Domains
- Core depending on Platform or Domains
- Domain A depending on Domain B
- Circular dependencies at any level

✅ **ALLOWED:**

- Platform depending on Core
- Domains depending on Core + Platform
- Multiple domains using same Platform services

---

## Module Categorization Rules

### Decision Tree

Use this decision tree to determine where a new module belongs:

```
START: New module needs to be created
  │
  ├─> Does it decorate Fastify instance or manage infrastructure?
  │   ├─> YES → Core Layer
  │   └─> NO → Continue
  │
  ├─> Is it used by 2+ business domains?
  │   ├─> YES → Platform Layer
  │   └─> NO → Continue
  │
  └─> Is it specific to one business domain?
      ├─> YES → Domains Layer
      └─> NO → Re-evaluate (may belong in Platform)
```

### Categorization Examples

#### Core Layer Examples

| Module Type    | Reason                                 | URL Prefix                         |
| -------------- | -------------------------------------- | ---------------------------------- |
| Authentication | Decorates fastify with auth handlers   | `/api/v1/core/auth`                |
| Monitoring     | Decorates fastify with logging/metrics | `/api/v1/core/monitoring`          |
| Audit Trails   | Infrastructure-level logging           | `/api/v1/core/audit`               |
| Rate Limiting  | Infrastructure security                | `/api/v1/core/security/rate-limit` |
| API Keys       | Infrastructure security                | `/api/v1/core/security/api-keys`   |

#### Platform Layer Examples

| Module Type   | Reason                                         | URL Prefix                     |
| ------------- | ---------------------------------------------- | ------------------------------ |
| Users         | Used by all domains for user management        | `/api/v1/platform/users`       |
| RBAC          | Used by all domains for permissions            | `/api/v1/platform/rbac`        |
| Departments   | Used by multiple domains (HR, Inventory, etc.) | `/api/v1/platform/departments` |
| File Upload   | Shared file handling service                   | `/api/v1/platform/files`       |
| Attachments   | Generic attachment system for all entities     | `/api/v1/platform/attachments` |
| PDF Export    | Shared PDF generation service                  | `/api/v1/platform/pdf`         |
| Settings      | System-wide configuration                      | `/api/v1/platform/settings`    |
| Navigation    | Menu structure for all users                   | `/api/v1/platform/navigation`  |
| Import/Export | Generic Excel/CSV import for any domain        | `/api/v1/platform/import`      |

#### Domains Layer Examples

| Module Type        | Reason                           | URL Prefix                                     |
| ------------------ | -------------------------------- | ---------------------------------------------- |
| Drugs              | Specific to inventory domain     | `/api/v1/domains/inventory/drugs`              |
| Equipment          | Specific to inventory domain     | `/api/v1/domains/inventory/equipment`          |
| Requisitions       | Specific to inventory operations | `/api/v1/domains/inventory/requisitions`       |
| Budget Allocations | Specific to budget management    | `/api/v1/domains/inventory/budget-allocations` |
| System Init        | Specific to admin domain         | `/api/v1/domains/admin/system-init`            |

---

## Edge Cases and Decision Framework

Based on real migrations in Phase 3, we discovered several edge cases that require careful consideration. This section provides guidance on how to handle ambiguous categorization scenarios.

### Edge Case 1: Shared Configuration vs Domain Configuration

**Scenario:** A configuration module could be considered either Platform (shared) or Domain-specific.

**Example:**

- `budget_types` table - Is this Platform (lookup table) or Domain (budget-specific)?

**Decision Framework:**

**Ask these questions:**

1. **Is it used by multiple domains?**
   - YES → Platform
   - NO → Continue

2. **Is it configurable by end users or system admins?**
   - System admins only → Platform (system configuration)
   - Business users → Domain (business configuration)

3. **Does it define business rules or just reference data?**
   - Reference data (lookup) → Platform
   - Business rules → Domain

**Real Example from Migrations:**

```markdown
budget_types table:

- ✅ Platform (master-data): Used as lookup/reference by multiple areas
- ❌ NOT Domain: Even though it contains "budget" in name
- Reasoning: It's configuration data, not transactional business logic
```

**Rule of Thumb:**

- **Master data/lookup tables** → Platform (even if named after domain)
- **Transactional data** → Domain
- **System configuration** → Platform
- **Business rules/workflows** → Domain

---

### Edge Case 2: Import Service Location

**Scenario:** Import/export services could belong to Platform (generic service) or Domain (domain-specific imports).

**Example:**

- Generic Excel/CSV import framework
- Domain-specific import validations

**Decision from Phase 3:**

**Platform Layer:**

- ✅ `layers/platform/import/` - Base import framework
- ✅ `layers/platform/import/discovery/` - Auto-discovery system
- Reason: Generic import infrastructure used by ALL domains

**Domain Layer:**

- ✅ `layers/domains/inventory/master-data/drugs/import/` - Domain-specific import services
- Reason: Business validation rules specific to drugs

**Best Practice:**

- **Generic import framework** → Platform
- **Domain-specific validators/transformers** → Domain
- **Use platform base classes in domain imports** → Composition pattern

---

### Edge Case 3: Aggregator vs Leaf Module

**Scenario:** A plugin that could be implemented either way.

**Example:**

- Department module: Could be standalone (leaf) or aggregate sub-modules

**Decision Framework:**

**Leaf Module (❌ No fp() wrapper):**

- Has routes, controllers, services directly
- No nested sub-plugins
- Repository → Service → Controller → Routes pattern
- Example: `departments`, `users`, `drugs`

**Aggregator Module (✅ Uses fp() wrapper):**

- Registers multiple child plugins
- May or may not have its own routes
- Organizes related functionality
- Example: `import`, `inventory`, `admin`

**Real Example:**

```typescript
// ✅ LEAF MODULE: departments
export default async function platformDepartmentsPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Register schemas
  // Register routes
  // No child plugins
}

// ✅ AGGREGATOR: import
export default fp(
  async function platformImportPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Register base services
    await fastify.register(importBasePlugin, options);
    await fastify.register(importDiscoveryPlugin, options);
  },
  {
    name: 'platform-import-plugin',
  },
);
```

---

### Edge Case 4: Multi-Level Domain Hierarchy

**Scenario:** A domain has multiple levels of organization (domain → category → module).

**Example:**

- `inventory/master-data/drugs`
- `inventory/operations/requisitions`
- `inventory/budget/allocations`

**Structure:**

```
layers/domains/inventory/
├── inventory.plugin.ts        # ✅ Domain aggregator (uses fp)
├── master-data/
│   ├── drugs/
│   │   └── drugs.plugin.ts    # ❌ Leaf module (no fp)
│   └── equipment/
│       └── equipment.plugin.ts # ❌ Leaf module (no fp)
├── operations/
│   └── requisitions/
│       └── requisitions.plugin.ts # ❌ Leaf module (no fp)
└── budget/
    └── allocations/
        └── allocations.plugin.ts # ❌ Leaf module (no fp)
```

**Plugin Pattern:**

- **Top-level domain aggregator** (inventory.plugin.ts): ✅ Uses `fp()`
- **Category-level modules** (optional aggregators): ✅ May use `fp()` if they aggregate
- **Leaf modules** (drugs, requisitions, etc.): ❌ Plain async function

**URL Pattern:**

```
/api/v1/domains/inventory/drugs           # master-data
/api/v1/domains/inventory/requisitions    # operations
/api/v1/domains/inventory/allocations     # budget
```

---

### Edge Case 5: Feature-Specific vs Generic Services

**Scenario:** A service that could be generic but is only used by one feature currently.

**Decision Framework:**

**Ask:**

1. **Could this realistically be used by other features in the future?**
   - YES → Platform (plan for reuse)
   - NO → Domain (domain-specific)

2. **Does it contain domain-specific business rules?**
   - YES → Domain
   - NO → Platform

3. **Is there a clear generic abstraction?**
   - YES → Platform (create generic version)
   - NO → Domain (keep domain-specific)

**Example:**

```markdown
PDF Export Service:

- ✅ Platform: Generic template system, can export any entity
- ❌ NOT Domain: Even if currently only used by one domain
- Future-proof: Other domains will need PDF export

Drug Import Validator:

- ❌ NOT Platform: Contains pharmacy-specific business rules
- ✅ Domain: Specific validation logic for drug data
- Uses: Platform import framework as base class
```

**Rule:**

- When in doubt, **start in Domain**, move to Platform when 2nd domain needs it
- **Premature abstraction** is worse than **strategic duplication**

---

## Plugin Pattern Specification

### Plugin Types and Patterns

| Plugin Type               | Use `fp()` Wrapper? | Example                | Purpose                                  |
| ------------------------- | ------------------- | ---------------------- | ---------------------------------------- |
| **Infrastructure Plugin** | ✅ YES              | `auth.plugin.ts`       | Decorates Fastify, declares dependencies |
| **Domain Aggregator**     | ✅ YES              | `inventory.plugin.ts`  | Registers child plugins                  |
| **Leaf Module**           | ❌ NO               | `users.plugin.ts`      | Routes + Controllers only                |
| **Service Decorator**     | ✅ YES              | `monitoring.plugin.ts` | Adds services to Fastify instance        |

### Pattern 1: Infrastructure Plugin (Core Layer)

**When to use:**

- Plugin decorates Fastify instance
- Plugin provides services to other plugins
- Plugin has dependencies on other plugins

**Example:**

```typescript
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default fp(
  async function authPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // Decorate fastify with auth service
    fastify.decorate('auth', {
      verifyToken: async (token: string) => {
        /* ... */
      },
      verifyPermission: async (userId: string, permission: string) => {
        /* ... */
      },
    });

    // Register routes
    await fastify.register(authRoutes, options);
  },
  {
    name: 'auth-plugin',
    dependencies: ['database-plugin', 'config-plugin'],
  },
);
```

---

### Pattern 2: Domain Aggregator Plugin

**When to use:**

- Plugin registers multiple child plugins
- Plugin organizes related domain functionality
- Plugin may or may not have its own routes

**Example:**

```typescript
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import drugsPlugin from './master-data/drugs/drugs.plugin';
import equipmentPlugin from './master-data/equipment/equipment.plugin';
import requisitionsPlugin from './operations/requisitions/requisitions.plugin';

export default fp(
  async function inventoryPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    const prefix = options.prefix || '/v1/domains/inventory';

    // Register master data modules
    await fastify.register(drugsPlugin, { ...options, prefix });
    await fastify.register(equipmentPlugin, { ...options, prefix });

    // Register operations modules
    await fastify.register(requisitionsPlugin, { ...options, prefix });
  },
  {
    name: 'inventory-plugin',
  },
);
```

---

### Pattern 3: Leaf Module Plugin (Platform/Domain Leaf)

**When to use:**

- Plugin has routes and controllers
- Plugin does NOT register child plugins
- Plugin follows Repository → Service → Controller → Routes pattern

**Example:**

```typescript
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import usersRoutes from './users.routes';
import UsersController from './users.controller';
import UsersService from './users.service';
import UsersRepository from './users.repository';
import * as usersSchemas from './users.schemas';

// ❌ NO fp() wrapper for leaf modules
export default async function platformUsersPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Register schemas with centralized registry
  if ((fastify as any).schemaRegistry) {
    (fastify as any).schemaRegistry.registerModuleSchemas('users', usersSchemas);
  }

  // Initialize layers
  const repository = new UsersRepository(fastify.database);
  const service = new UsersService(repository);
  const controller = new UsersController(service);

  // Register routes
  await fastify.register(usersRoutes, {
    controller,
    prefix: options.prefix || '/v1/platform',
  });
}
```

**Critical Notes:**

1. ❌ **NO `fp()` wrapper** - Leaf modules use plain async function
2. ✅ **Register schemas** - Use centralized schema registry
3. ✅ **Prefix inheritance** - Pass `options.prefix` to routes
4. ✅ **Dependency injection** - Manual constructor injection (repository → service → controller)

---

### Common Plugin Mistakes

#### ❌ Mistake 1: Using `fp()` for Leaf Modules

```typescript
// ❌ WRONG: fp() not needed for leaf modules
export default fp(async function usersPlugin(fastify, options) {
  // Routes only - no child plugins
});
```

**Fix:**

```typescript
// ✅ CORRECT: Plain async function for leaf modules
export default async function usersPlugin(fastify, options) {
  // Routes only
}
```

---

#### ❌ Mistake 2: Not Registering Schemas

```typescript
// ❌ WRONG: Schemas not registered
export default async function usersPlugin(fastify, options) {
  // Missing schema registration
  await fastify.register(usersRoutes, { controller, prefix });
}
```

**Fix:**

```typescript
// ✅ CORRECT: Register schemas with registry
export default async function usersPlugin(fastify, options) {
  if ((fastify as any).schemaRegistry) {
    (fastify as any).schemaRegistry.registerModuleSchemas('users', usersSchemas);
  }

  await fastify.register(usersRoutes, { controller, prefix });
}
```

---

#### ❌ Mistake 3: Missing Prefix in Route Registration

```typescript
// ❌ WRONG: Missing prefix option
await fastify.register(usersRoutes, { controller });
// Routes will be at /api/users instead of /api/v1/platform/users
```

**Fix:**

```typescript
// ✅ CORRECT: Pass prefix to routes
await fastify.register(usersRoutes, {
  controller,
  prefix: options.prefix || '/v1/platform',
});
```

---

## URL Routing Standards

### URL Structure

All API endpoints MUST follow this pattern:

```
/api/v1/{layer}/{resource}/{id?}/{action?}
```

**Components:**

- `/api` - API namespace (added by bootstrap)
- `/v1` - API version
- `{layer}` - One of: `core`, `platform`, `domains`
- `{resource}` - Resource name (plural, lowercase, hyphenated)
- `{id}` - Optional resource identifier (UUID)
- `{action}` - Optional sub-resource or action

### Layer-Specific URL Patterns

#### Core Layer URLs

```
/api/v1/core/auth/login                 # POST - Login
/api/v1/core/auth/logout                # POST - Logout
/api/v1/core/auth/refresh               # POST - Refresh token
/api/v1/core/security/api-keys          # GET - List API keys
/api/v1/core/monitoring/health          # GET - Health check
/api/v1/core/audit/login-attempts       # GET - Login attempts
```

#### Platform Layer URLs

```
/api/v1/platform/users                  # GET - List users
/api/v1/platform/users/:id              # GET - Get user by ID
/api/v1/platform/users                  # POST - Create user
/api/v1/platform/users/:id              # PUT - Update user
/api/v1/platform/users/:id              # DELETE - Delete user
/api/v1/platform/rbac/roles             # GET - List roles
/api/v1/platform/rbac/permissions       # GET - List permissions
/api/v1/platform/departments            # GET - List departments
/api/v1/platform/files/upload           # POST - Upload file
/api/v1/platform/attachments            # GET - List attachments
/api/v1/platform/pdf/templates          # GET - List PDF templates
```

#### Domain Layer URLs

```
/api/v1/domains/inventory/drugs                    # GET - List drugs
/api/v1/domains/inventory/drugs/:id                # GET - Get drug by ID
/api/v1/domains/inventory/equipment                # GET - List equipment
/api/v1/domains/inventory/requisitions             # GET - List requisitions
/api/v1/domains/inventory/budget-allocations       # GET - List allocations
/api/v1/domains/admin/system-init                  # GET - Get system init status
```

### URL Prefix Configuration

**Bootstrap Prefix:**

- Bootstrap adds `/api` prefix automatically
- Plugins should NOT include `/api` in their prefixes

**Plugin Prefix:**

```typescript
// ❌ WRONG: Including /api in plugin prefix
const prefix = '/api/v1/platform';

// ✅ CORRECT: Let bootstrap add /api
const prefix = '/v1/platform';
```

**Route Registration:**

```typescript
// In plugin
await fastify.register(usersRoutes, {
  controller,
  prefix: options.prefix || '/v1/platform', // ✅ No /api prefix
});
```

**Final URL:**

```
Bootstrap /api + Plugin /v1/platform + Route /users = /api/v1/platform/users
```

---

## Migration Difficulty Matrix

Based on real migrations in Phase 3, we've established a difficulty matrix to help estimate migration effort and complexity.

### Difficulty Levels

| Level         | Description                                           | Estimated Effort | Risk Level  |
| ------------- | ----------------------------------------------------- | ---------------- | ----------- |
| **Easy**      | Leaf module, no dependencies, <500 LOC                | 1-2 hours        | Low         |
| **Medium**    | Leaf module with external imports, 500-1000 LOC       | 2-4 hours        | Low-Medium  |
| **Hard**      | Aggregator plugin or decorator, >1000 LOC             | 4-8 hours        | Medium      |
| **Very Hard** | Core infrastructure, multiple dependencies, >2000 LOC | 1-2 days         | Medium-High |

### Migration Complexity Factors

**Factors that increase complexity:**

1. **External Import References** (+1-2 hours)
   - Other modules importing from this module
   - Requires finding and updating all import paths
   - Example: Users module had 7 external references

2. **Service Decoration** (+1-2 hours)
   - Module decorates Fastify instance
   - Potential conflicts if old plugin also decorates
   - Requires conditional decoration logic

3. **Complex Sub-module Structure** (+2-4 hours)
   - Multiple nested directories
   - Aggregator plugins with many children
   - Example: Import module with discovery sub-system

4. **Plugin Pattern Change** (+30 minutes)
   - Converting from `fp()` wrapper to plain async
   - Usually straightforward but requires careful testing

5. **Schema Registration Issues** (+1 hour)
   - Schemas not registered with registry
   - "Cannot resolve reference" errors
   - Requires adding registration code

6. **URL Prefix Corrections** (+30 minutes)
   - Double `/api` prefix
   - Missing prefix in route registration
   - Batch fix available via sed

### Real Migration Examples

#### Easy Migrations (1-2 hours)

| Module          | LOC  | External Refs | Complexity Factors  | Actual Time |
| --------------- | ---- | ------------- | ------------------- | ----------- |
| **departments** | ~850 | 0             | None                | 1.5 hours   |
| **settings**    | ~600 | 1             | Schema registration | 1.5 hours   |
| **navigation**  | ~550 | 0             | None                | 1 hour      |

**Lessons Learned:**

- Leaf modules with no external dependencies are straightforward
- Schema registration adds ~30 minutes if missing
- URL prefix corrections can be batch-fixed

---

#### Medium Migrations (2-4 hours)

| Module          | LOC   | External Refs | Complexity Factors                  | Actual Time |
| --------------- | ----- | ------------- | ----------------------------------- | ----------- |
| **file-upload** | ~1200 | 2             | Storage adapter, schema issues      | 3 hours     |
| **attachments** | ~900  | 3             | Entity configs, schema registration | 2.5 hours   |

**Lessons Learned:**

- External import references require careful grep searches
- Complex configuration systems (like attachment entity configs) add time
- Storage adapters and similar patterns need testing

---

#### Hard Migrations (4-8 hours)

| Module         | LOC   | External Refs | Complexity Factors                      | Actual Time |
| -------------- | ----- | ------------- | --------------------------------------- | ----------- |
| **users**      | ~2100 | 7             | Service decoration, many external refs  | 6 hours     |
| **RBAC**       | ~1800 | 5             | Route prefix bug, permissions system    | 5 hours     |
| **pdf-export** | ~1500 | 4             | Sub-modules (templates, fonts, preview) | 4.5 hours   |

**Lessons Learned:**

- High external reference count (7+) requires systematic search
- Service decoration conflicts need careful handling
- Sub-module structure requires proper prefix passing
- RBAC route prefix bug discovered during testing (added 1 hour)

---

#### Very Hard Migrations (1-2 days)

| Module               | LOC   | External Refs | Complexity Factors                                    | Actual Time |
| -------------------- | ----- | ------------- | ----------------------------------------------------- | ----------- |
| **import-discovery** | ~2500 | 8             | Aggregator plugin, auto-discovery, performance tuning | 8 hours     |

**Lessons Learned:**

- Aggregator plugins with discovery systems are complex
- Performance requirements (< 100ms) add tuning time
- Database persistence adds testing overhead
- Auto-discovery requires careful path handling

---

### Migration Effort Estimation Formula

```
Base Effort = 1 hour (minimum for any migration)

+ (LOC / 500) hours                     # Code volume
+ (External Refs × 0.5) hours           # Finding and updating imports
+ (Is Aggregator ? 2 : 0) hours         # Aggregator complexity
+ (Decorates Fastify ? 1 : 0) hours     # Decoration conflicts
+ (Has Sub-modules ? 1.5 : 0) hours     # Sub-module complexity
+ (Schema Issues ? 0.5 : 0) hours       # Schema registration fixes
+ (URL Prefix Issues ? 0.5 : 0) hours   # Prefix corrections

Total Estimated Effort = Sum of above
```

**Example: Users Module**

```
Base: 1 hour
LOC: 2100 / 500 = 4.2 hours
External Refs: 7 × 0.5 = 3.5 hours
Aggregator: No = 0 hours
Decorates: Yes = 1 hour
Sub-modules: No = 0 hours
Schema Issues: Yes = 0.5 hours
URL Prefix: Yes = 0.5 hours

Total: 1 + 4.2 + 3.5 + 1 + 0.5 + 0.5 = 10.7 hours
Actual: 6 hours (better than estimated due to experience)
```

---

### Risk Factors by Layer

#### Core Layer Migrations

**Risk Level:** 🔴 **MEDIUM-HIGH**

**Reasons:**

- Infrastructure plugins affect entire system
- Service decoration conflicts are common
- High test coverage required
- Potential for cascading failures

**Mitigation:**

- Thorough testing before migration
- Conditional decoration to avoid conflicts
- Feature flags for gradual rollout
- Extensive integration testing

---

#### Platform Layer Migrations

**Risk Level:** 🟡 **LOW-MEDIUM**

**Reasons:**

- Leaf modules are simpler to migrate
- External import references are common
- Schema registration often missing
- URL prefix corrections needed

**Mitigation:**

- Use grep to find all import references
- Add schema registration code
- Batch fix URL prefixes with sed
- Test all routes after migration

---

#### Domain Layer Migrations

**Risk Level:** 🟢 **LOW**

**Reasons:**

- Domain isolation reduces risk
- Fewer external dependencies
- Clear boundaries
- Easier to test in isolation

**Mitigation:**

- Test domain routes independently
- Verify no cross-domain dependencies
- Ensure Platform dependencies remain valid
- Test with realistic data

---

## Lessons Learned from Phase 3 Migrations

This section captures critical insights from the successful migration of 9 modules (Batch 1 + Batch 2) from the legacy core/ structure to the new layer-based architecture.

### Migration Statistics

**Batch 1 (Foundational Modules):**

- Modules: departments, settings, navigation
- Total LOC: ~2000
- Duration: 4 hours
- Issues: 0 critical bugs

**Batch 2 (High-Impact Modules):**

- Modules: users, RBAC, file-upload, attachments, pdf-export, import-discovery
- Total LOC: ~11,000
- Duration: 25 hours
- Issues: 1 critical bug (RBAC prefix - fixed during testing)

**Overall:**

- **Total Modules:** 9
- **Total LOC:** ~13,000
- **Success Rate:** 100% (all migrations successful)
- **Zero Downtime:** ✅ Achieved with dual routing
- **Build Success:** ✅ All builds passing

---

### Critical Success Factors

#### 1. **Plain Async Function Pattern**

**Lesson:** Leaf modules MUST use plain async functions, NOT `fp()` wrapper.

**Why this matters:**

- Simplifies plugin lifecycle management
- Reduces encapsulation overhead
- Follows Fastify best practices
- Makes code more maintainable

**Evidence:**

- All 9 migrated modules use plain async function
- Zero issues with plugin registration
- Cleaner, more readable code

**Pattern:**

```typescript
// ✅ CORRECT - Used in all 9 migrations
export default async function platformUsersPlugin(fastify, options) {
  // Implementation
}
```

---

#### 2. **Centralized Schema Registration**

**Lesson:** Register all TypeBox schemas with centralized registry during plugin initialization.

**Why this matters:**

- Prevents "cannot resolve reference" errors
- Enables schema reuse across modules
- Supports OpenAPI documentation generation
- Single source of truth for validation

**Evidence:**

- Pre-testing fixes required schema registration for users, RBAC, departments
- All 9 modules now properly register schemas
- Zero schema validation errors in testing

**Pattern:**

```typescript
if ((fastify as any).schemaRegistry) {
  (fastify as any).schemaRegistry.registerModuleSchemas('users', usersSchemas);
}
```

---

#### 3. **URL Prefix Strategy**

**Lesson:** Bootstrap adds `/api` prefix - plugins should use `/v1/{layer}` pattern only.

**Why this matters:**

- Prevents double `/api/api/...` URLs
- Consistent URL structure across all layers
- Easier to maintain and understand

**Evidence:**

- Pre-testing batch fix applied to all platform modules
- Removed double `/api` prefix from all plugins
- Clean URL structure in final testing

**Fix Applied:**

```bash
# Batch fix for all platform modules
find apps/api/src/layers/platform -name "*.ts" -type f \
  -exec sed -i '' "s|'/api/v1/platform|'/v1/platform|g" {} \;
```

---

#### 4. **Route Prefix Inheritance**

**Lesson:** Always pass `prefix` option from parent plugin to child routes.

**Why this matters:**

- Routes are registered at correct paths
- Prevents 404 errors
- Maintains layer-based URL structure

**Evidence:**

- **RBAC prefix bug:** Missing prefix option caused routes at `/api/rbac/*` instead of `/api/v1/platform/rbac/*`
- **Fixed during testing:** Added `prefix: options.prefix || '/v1/platform'`
- **Pattern applied:** All modules now correctly pass prefix

**Critical Bug Example:**

```typescript
// ❌ BEFORE: Missing prefix (RBAC bug)
await fastify.register(rbacRoutes, {
  controller: rbacController,
  // Missing prefix option
});

// ✅ AFTER: Prefix correctly passed
await fastify.register(rbacRoutes, {
  controller: rbacController,
  prefix: options.prefix || '/v1/platform',
});
```

---

#### 5. **Build Verification Workflow**

**Lesson:** Run `pnpm run build` after EVERY migration to catch TypeScript errors early.

**Why this matters:**

- Catches import path errors immediately
- Prevents cascading build failures
- Validates TypeScript types are correct
- Identifies missing exports early

**Evidence:**

- All 9 migrations verified with build before commit
- Zero accumulated build errors
- Clean, incremental progress

**Workflow:**

```bash
# After each migration
pnpm run build              # Must pass
git add [specific files]    # Never use git add -A
git commit -m "..."         # Detailed message
```

---

#### 6. **External Import Reference Updates**

**Lesson:** Use comprehensive grep search to find ALL import references before migrating.

**Why this matters:**

- Prevents broken imports in other modules
- Identifies hidden dependencies
- Ensures complete migration

**Evidence:**

- Users module had 7 external import references
- All references found with grep and updated
- Zero runtime import errors

**Search Pattern:**

```bash
# Find all imports from core/users
grep -r "from.*core/users" apps/api/src/
grep -r "import.*core/users" apps/api/src/

# Update to new path
# Old: import { UsersService } from '@/core/users/users.service';
# New: import { UsersService } from '@/layers/platform/users/users.service';
```

---

### Common Pitfalls and Solutions

#### Pitfall 1: Service Decoration Conflicts

**Problem:**

- Both old and new plugins decorate Fastify with same service name
- Causes "decorator already added" errors

**Solution:**

```typescript
// Conditional decoration
if (!fastify.hasDecorator('usersService')) {
  fastify.decorate('usersService', usersService);
}

// OR remove decoration from new plugin entirely
// (prefer this if old plugin will be removed soon)
```

**Evidence:**

- Encountered during users module migration
- Resolved by removing decoration from new plugin
- Old plugin removed after migration complete

---

#### Pitfall 2: TypeScript Build Errors - Named Export Not Found

**Problem:**

- Dynamic imports with destructuring for schemas without combined export
- Error: "Named export not found"

**Root Cause:**

```typescript
// ❌ WRONG: Dynamic import with destructuring
const { userSchema, userResponseSchema } = await import('./users.schemas');
```

**Solution:**

```typescript
// ✅ CORRECT: Wildcard import
import * as usersSchemas from './users.schemas';

// Then register
if ((fastify as any).schemaRegistry) {
  (fastify as any).schemaRegistry.registerModuleSchemas('users', usersSchemas);
}
```

**Evidence:**

- Fixed during pre-testing phase
- All modules now use wildcard imports for schemas
- Zero build errors related to schema imports

---

#### Pitfall 3: Import Discovery Performance

**Problem:**

- Import discovery took 104ms (target: <100ms)
- Slightly over performance budget

**Root Cause:**

- File system scans during discovery
- Database persistence overhead

**Solution (Applied):**

- Optimized file discovery with better glob patterns
- Cached discovery results
- Reduced database writes

**Current Status:**

- 104ms in development (acceptable)
- Monitor in production for optimization needs
- Consider caching strategy if performance degrades

**Future Optimization Strategies:**

- Cache discovered services in Redis
- Pre-compute service registry at build time
- Lazy-load non-critical services

---

### Best Practices Established

#### 1. **Migration Sequence**

**Established Pattern:**

1. Create new module structure in target layer
2. Copy module files to new location
3. Create plugin entry point (plain async function)
4. Update imports in plugin
5. Fix URL prefixes (remove `/api`)
6. Register schemas with registry
7. Update external import references
8. Add to plugin loader
9. Run build verification
10. Test server startup and routes
11. Commit with detailed message

**Why this works:**

- Incremental validation at each step
- Early error detection
- Clean git history
- Repeatable process

---

#### 2. **Testing Strategy**

**Established Pattern:**

1. **Build Verification:** `pnpm run build` must pass
2. **Server Startup:** Check plugin loading logs
3. **Route Testing:** Curl/HTTP tests for critical paths
4. **Authentication Flow:** Test protected endpoints
5. **Error Handling:** Verify consistent error responses

**Evidence from Batch 2 Testing:**

- All 6 modules tested with comprehensive test suite
- Authentication properly enforced (401 responses)
- Error responses follow standard format
- Performance metrics within acceptable range

---

#### 3. **Commit Message Format**

**Established Pattern:**

```
<type>(<scope>): <subject>

<body>

- <detail 1>
- <detail 2>

Files modified:
- <file 1>
- <file 2>

Migration: <source> → <destination>
```

**Example:**

```
feat(platform): migrate users module to platform layer

Successfully migrated users module from core/ to layers/platform/.

Key changes:
- Converted from fp() wrapper to plain async function
- Registered schemas with centralized registry
- Updated 7 external import references
- Fixed URL prefix strategy

Files modified:
- apps/api/src/layers/platform/users/users.plugin.ts (new)
- apps/api/src/bootstrap/plugin.loader.ts (updated)

Migration: core/users → layers/platform/users
```

---

### Performance Metrics

#### Server Startup Performance

**Target:** < 5 seconds total startup time

**Actual (After Batch 2):**

- **Total Startup:** 3.5 seconds ✅ (30% better than target)
- **Plugin Loading:** 574ms for 33 plugins
- **Platform Layer:** 163ms for 9 plugins (avg 18ms per plugin)

**Breakdown:**

```
Environment Load:  1ms
Config Load:       0ms
Server Create:     6ms
Plugin Load:       574ms
Server Start:      2916ms
─────────────────────
Total:             3536ms ✅
```

**Analysis:**

- Plugin loading is efficient (< 600ms)
- Server start time dominates (83% of total)
- Platform layer plugins load quickly (< 20ms each)
- No performance degradation from migrations

---

#### Plugin Loading Performance

| Layer              | Plugins | Time      | Avg per Plugin | Status        |
| ------------------ | ------- | --------- | -------------- | ------------- |
| Infrastructure     | 6       | 6ms       | 1ms            | ✅ Excellent  |
| Database           | 2       | 135ms     | 68ms           | ✅ Acceptable |
| Monitoring         | 2       | 4ms       | 2ms            | ✅ Excellent  |
| Authentication     | 4       | 1ms       | 0.25ms         | ✅ Excellent  |
| Middleware         | 4       | 73ms      | 18ms           | ✅ Good       |
| Application        | 6       | 185ms     | 31ms           | ✅ Good       |
| **Platform Layer** | **9**   | **163ms** | **18ms**       | ✅ **Good**   |
| Domains            | 0       | 0ms       | -              | N/A           |

**Insights:**

- Platform layer plugins are lightweight (18ms average)
- Database plugins take longest (connection pooling)
- No performance concerns from layer-based architecture

---

### Migration Velocity

**Batch 1 Velocity:**

- 3 modules in 4 hours = **1.3 hours per module**
- Simple leaf modules with minimal dependencies

**Batch 2 Velocity:**

- 6 modules in 25 hours = **4.2 hours per module**
- More complex modules with external references

**Overall Velocity:**

- 9 modules in 29 hours = **3.2 hours per module average**

**Learning Curve Effect:**

- First 3 modules: Slower due to pattern establishment
- Next 6 modules: Faster due to established patterns
- Pattern refinement reduced errors and rework

**Projection for Remaining Migrations:**

- Estimated **2-3 hours per module** for standard leaf modules
- Estimated **5-6 hours per module** for complex aggregators

---

### Architecture Validation

#### ✅ **Layer Isolation Verified**

**Platform Layer:**

- 9 plugins loaded independently
- No dependencies between platform modules
- All depend on Core infrastructure only
- No Domain dependencies

**Dependency Flow:**

```
Platform → Core ✅
Platform → Platform ❌ (isolated)
Platform → Domains ❌ (forbidden)
```

---

#### ✅ **URL Pattern Consistency**

All platform modules follow standard URL pattern:

```
/api/v1/platform/users          ✅
/api/v1/platform/rbac           ✅
/api/v1/platform/departments    ✅
/api/v1/platform/files          ✅
/api/v1/platform/attachments    ✅
/api/v1/platform/pdf            ✅
```

**Validation:**

- No double `/api` prefixes
- Consistent versioning (`/v1`)
- Clear layer identification (`/platform`)
- RESTful resource naming

---

#### ✅ **Schema Registry Integration**

**Modules Registered:**

- ✅ platform-users
- ✅ platform-rbac
- ✅ platform-departments
- ✅ platform-file-upload
- ✅ platform-attachments
- ✅ platform-settings
- ✅ platform-navigation

**Benefits Realized:**

- Zero schema validation errors
- Schema reuse across modules
- Consistent validation patterns
- OpenAPI documentation ready

---

### Recommendations for Future Migrations

#### High Priority

1. **Continue Batch Migration Approach**
   - Migrate 3-6 modules per batch
   - Test comprehensively after each batch
   - Fix issues before next batch

2. **Use Established Patterns**
   - Plain async function for leaf modules
   - Centralized schema registration
   - URL prefix inheritance
   - Build verification workflow

3. **Monitor Performance**
   - Keep plugin load time < 200ms per layer
   - Track server startup time
   - Optimize if performance degrades

4. **Maintain Documentation**
   - Update migration patterns with new learnings
   - Document edge cases as discovered
   - Keep difficulty matrix current

#### Medium Priority

5. **Automate Migration Steps**
   - Create migration script for common patterns
   - Automate import reference updates
   - Batch fix common issues

6. **Improve Testing**
   - Add automated integration tests
   - Create test data for realistic scenarios
   - Test authentication flows

7. **Create Migration Metrics Dashboard**
   - Track migration progress
   - Monitor deprecated route usage
   - Identify modules still to migrate

---

## Related Documentation

### Core Architecture Documents

- [Migration Patterns and Best Practices](./07-migration-patterns.md) - Proven patterns from Batch 1 & 2 migrations
- [Plugin Migration Guide](./08-plugin-migration-guide.md) - Step-by-step guide for fp() wrapper removal (Task 4.3)

### Specification Documents

- [Plugin Pattern Specification](./03-plugin-pattern-specification.md) - Detailed plugin patterns (Task 2.3)
- [URL Routing Specification](./04-url-routing-specification.md) - URL routing standards (Task 2.4)
- [Module Categorization Specification](./05-module-categorization-specification.md) - Categorization rules (Task 2.5)

### Testing and Deployment

- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment verification
- [Smoke Test Procedures](./SMOKE_TEST_PROCEDURES.md) - Post-deployment testing
- [Test Results](./TEST_RESULTS.md) - Historical test results

### Implementation References

- **Batch 1 Implementation Logs:**
  - task-3-1: departments migration
  - task-3-2: settings migration
  - task-3-3: navigation migration

- **Batch 2 Implementation Logs:**
  - task-3-5: users migration
  - task-3-6: RBAC migration
  - task-3-7: file-upload + attachments migration
  - task-3-8: pdf-export + import-discovery migration

- **Batch 2 Test Results:**
  - [BATCH_2_TEST_RESULTS.md](../../../.spec-workflow/specs/api-architecture-standardization/BATCH_2_TEST_RESULTS.md)

---

## Document Version History

| Version | Date                        | Changes                                        | Author         |
| ------- | --------------------------- | ---------------------------------------------- | -------------- |
| 1.0     | 2025-12-14 (Pre-migration)  | Initial specification based on design.md       | Planning Team  |
| 2.0     | 2025-12-14 (Post-migration) | Enhanced with real-world insights from Phase 3 | Migration Team |

**Version 2.0 Enhancements:**

- ✅ Added lessons learned from 9 successful migrations
- ✅ Updated categorization rules with edge cases
- ✅ Added migration difficulty matrix with real data
- ✅ Documented common pitfalls and solutions
- ✅ Added performance metrics and benchmarks
- ✅ Included real code examples from migrations
- ✅ Added best practices established during Phase 3

---

**Document Status:** ✅ Production Ready - Enhanced with real-world experience

**Maintenance:** This document should be updated as new patterns emerge and additional modules are migrated. All updates should reference specific migration tasks and include real examples.

**Feedback:** Report issues or suggest improvements via the project issue tracker.
