# Design Document

## Overview

The API Architecture Standardization feature will establish a layer-based architecture (Core/Platform/Domains) for the Fastify API, replacing the current inconsistent structure. This design follows a spec-driven approach: first creating comprehensive specifications, then updating the CRUD generator, and finally migrating existing code systematically with zero downtime.

**Key Design Principles:**

- **Clarity through Layers**: Three distinct layers with clear boundaries
- **Convention over Configuration**: Standard patterns reduce decision-making
- **Backwards Compatibility**: Old routes continue working during migration
- **Zero Downtime**: Gradual rollout with feature flags and route aliasing
- **CRUD Generator Alignment**: Generator creates code following new standards automatically

## Steering Document Alignment

### Technical Standards (tech.md)

_Note: No steering documents exist yet. This design follows general best practices:_

- **TypeBox Schemas**: All routes use TypeBox for type-safe validation (existing standard)
- **Repository-Service-Controller Pattern**: Maintain existing pattern across all layers
- **Fastify Plugins**: Use `fastify-plugin` wrapper appropriately based on plugin purpose
- **Dependency Injection**: Manual dependency injection via constructor parameters (existing approach)
- **Error Handling**: Leverage existing global error handlers and response handlers
- **WebSocket Support**: Existing WebSocket plugin remains available to all layers

### Project Structure (structure.md)

_Note: This design will CREATE the new structure standard:_

```
apps/api/src/
├── layers/                       # NEW: Layer-based organization
│   ├── core/                     # Infrastructure layer
│   ├── platform/                 # Shared services layer
│   └── domains/                  # Business domains layer
├── bootstrap/                    # MODIFY: Plugin loader
├── config/                       # ADD: Route aliases, feature flags
├── plugins/                      # KEEP: Global plugins (unchanged)
└── shared/                       # KEEP: Shared utilities (unchanged)
```

## Code Reuse Analysis

### Existing Components to Leverage

**1. Plugin Loader Infrastructure (`apps/api/src/bootstrap/plugin.loader.ts`)**

- **Current**: Registers plugins in groups (infrastructure, database, authentication, core-infrastructure, business-features)
- **Reuse**: Group-based loading pattern, error handling, timing metrics
- **Extend**: Add layer-based groups, feature flag support, route aliasing

**2. Auth Plugin Pattern (`apps/api/src/core/auth/auth.plugin.ts`)**

- **Current**: Uses `fp()` wrapper, decorates fastify instance, declares dependencies
- **Reuse**: This is the **correct pattern for infrastructure plugins** - will serve as template
- **Usage**: Template for all Core layer plugins

**3. Users Plugin Pattern (`apps/api/src/core/users/users.plugin.ts`)**

- **Current**: Uses `fp()` wrapper, Repository→Service→Controller chain, decorates fastify
- **Issues**: Should NOT use `fp()` wrapper (it's a leaf module, not infrastructure)
- **Refactor**: Remove `fp()` wrapper, move to Platform layer

**4. Response Handler Plugin (`apps/api/src/plugins/response-handler.plugin.ts`)**

- **Current**: Provides standardized API responses (success(), error(), etc.)
- **Reuse**: All layers will continue using this for consistent responses
- **No changes needed**

**5. Global Error Handlers**

- **Current**: Centralized error handling with proper HTTP status codes
- **Reuse**: All layers continue using existing error handling
- **No changes needed**

**6. TypeBox Schemas Registry (`apps/api/src/plugins/schemas.plugin.ts`)**

- **Current**: Registers module schemas for validation
- **Reuse**: All layers continue registering schemas
- **No changes needed**

### Integration Points

**1. Plugin Loader (`apps/api/src/bootstrap/plugin.loader.ts`)**

- **Integration**: Replace `createCorePluginGroup()` and `createFeaturePluginGroup()` with layer-based groups
- **New Functions**: `createCoreLayerGroup()`, `createPlatformLayerGroup()`, `createDomainsLayerGroup()`
- **Feature Flags**: Add conditional registration based on `ENABLE_NEW_ROUTES`, `ENABLE_OLD_ROUTES`

**2. Route Aliasing Plugin (NEW: `apps/api/src/config/route-aliases.ts`)**

- **Integration**: Register early in plugin loading sequence (after logging, before routes)
- **Purpose**: Redirect old routes to new routes during migration
- **Implementation**: Use `fastify.all()` with HTTP 307 redirects

**3. Feature Flags (`apps/api/src/config/default.ts`)**

- **Integration**: Extend existing config system
- **New Flags**: `features.enableNewRoutes`, `features.enableOldRoutes`
- **Usage**: Control which route sets are active

**4. CRUD Generator (`libs/aegisx-cli/templates/`)**

- **Integration**: Update all templates to generate layer-based structure
- **Files to Modify**: `backend-route.ejs`, `backend-controller.ejs`, `backend-service.ejs`, etc.
- **New Logic**: Determine layer based on domain/table type

**5. Database Schema (No changes)**

- **Integration**: No database schema changes required - pure code reorganization
- **Existing Tables**: Remain unchanged
- **Migrations**: None needed for this feature

## Architecture

The architecture introduces three distinct layers with clear separation of concerns and dependency rules:

```
┌─────────────────────────────────────────────────────┐
│                   API Gateway                        │
│              (apps/api/src/server.ts)                │
└──────────────────┬──────────────────────────────────┘
                   │
          ┌────────▼────────┐
          │  Route Aliasing │  (During Migration)
          │  /api → /api/v1 │
          └────────┬────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌───────────┐               ┌───────────┐
│ Old Routes│               │New Routes │
│  (Phase   │               │ (Layer-   │
│Migration) │               │  based)   │
└───────────┘               └─────┬─────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────▼─────┐ ┌────▼────┐ ┌──────▼──────┐
              │   Core    │ │Platform │ │  Domains    │
              │   Layer   │ │  Layer  │ │   Layer     │
              └───────────┘ └────┬────┘ └──────┬──────┘
                    │             │             │
                    └─────────────┴─────────────┘
                                  │
                         ┌────────▼────────┐
                         │  Shared Services│
                         │  (Database,     │
                         │   WebSocket)    │
                         └─────────────────┘
```

### Layer Dependency Rules

```
Core Layer
  ↓ depends on: nothing (pure infrastructure)
  ↓ used by: Platform, Domains

Platform Layer
  ↓ depends on: Core only
  ↓ used by: Domains

Domains Layer
  ↓ depends on: Core + Platform
  ↓ used by: API consumers
  ↓ isolation: Domain NEVER depends on another Domain
```

### Modular Design Principles

1. **Single File Responsibility**: Each file handles one specific concern
   - Plugin file: Registration and dependency declaration only
   - Routes file: Route definitions only
   - Controller file: Request/response handling only
   - Service file: Business logic only
   - Repository file: Database access only

2. **Component Isolation**: Small, focused components
   - Maximum ~300 lines per file (excluding generated code)
   - Clear interfaces between components
   - No circular dependencies

3. **Service Layer Separation**:
   - Repository Layer: Database queries (SELECT, INSERT, UPDATE, DELETE)
   - Service Layer: Business logic, validation, transactions
   - Controller Layer: HTTP request/response, serialization
   - Plugin Layer: Registration, wiring, dependency management

4. **Utility Modularity**:
   - Shared utilities remain in `apps/api/src/shared/`
   - Layer-specific utilities live within their layer
   - No utilities duplicated across layers

### Directory Structure Detail

```
apps/api/src/
├── layers/
│   ├── core/                           # Layer 1: Core Infrastructure
│   │   ├── auth/                       # Authentication primitives
│   │   │   ├── auth.plugin.ts          # ✅ Uses fp() - decorates fastify
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schemas.ts
│   │   │   └── strategies/
│   │   ├── security/                   # API keys, rate limiting
│   │   │   ├── api-keys/
│   │   │   └── rate-limiting/
│   │   ├── monitoring/                 # Logging, metrics, health
│   │   │   ├── monitoring.plugin.ts    # ✅ Uses fp() - decorates fastify
│   │   │   ├── services/
│   │   │   └── plugins/
│   │   └── audit/                      # Audit logs, compliance
│   │       ├── audit.plugin.ts         # ✅ Uses fp() - decorates fastify
│   │       ├── file-audit/
│   │       └── login-attempts/
│   │
│   ├── platform/                       # Layer 2: Shared Services
│   │   ├── users/                      # User management
│   │   │   ├── users.plugin.ts         # ❌ Remove fp() - leaf module
│   │   │   ├── users.routes.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   └── users.schemas.ts
│   │   ├── rbac/                       # Authorization
│   │   │   ├── rbac.plugin.ts          # ❌ Remove fp() - leaf module
│   │   │   └── ...
│   │   ├── departments/                # Department management
│   │   ├── settings/                   # System settings
│   │   ├── navigation/                 # Menu navigation
│   │   ├── files/                      # File upload/download
│   │   ├── attachments/                # Attachment management
│   │   ├── pdf-export/                 # PDF generation
│   │   └── import/                     # Excel/CSV import
│   │       ├── import.plugin.ts        # ✅ Uses fp() - aggregator
│   │       ├── base/
│   │       └── discovery/
│   │
│   └── domains/                        # Layer 3: Business Domains
│       ├── inventory/                  # Inventory management
│       │   ├── inventory.plugin.ts     # ✅ Uses fp() - domain aggregator
│       │   ├── master-data/
│       │   │   ├── drugs/
│       │   │   │   ├── drugs.plugin.ts # ❌ No fp() - leaf module
│       │   │   │   └── ...
│       │   │   └── ...
│       │   ├── operations/
│       │   ├── procurement/
│       │   └── budget/
│       └── admin/                      # Admin features
│           ├── admin.plugin.ts         # ✅ Uses fp() - domain aggregator
│           └── system-init/
│
├── config/
│   ├── default.ts                      # ADD: Feature flags
│   └── route-aliases.ts                # NEW: Route aliasing plugin
│
├── bootstrap/
│   └── plugin.loader.ts                # MODIFY: Layer-based loading
│
├── plugins/                            # UNCHANGED: Global plugins
└── shared/                             # UNCHANGED: Shared utilities
```

## Components and Interfaces

### Component 1: Layer-Based Plugin Loader

**Purpose:** Manage plugin registration in layer-based groups with feature flag support

**File:** `apps/api/src/bootstrap/plugin.loader.ts`

**Interfaces:**

```typescript
// New layer-based group creators
export function createCoreLayerGroup(): PluginGroup;
export function createPlatformLayerGroup(): PluginGroup;
export function createDomainsLayerGroup(): PluginGroup;

// Enhanced plugin registration with feature flags
export async function loadAllPlugins(fastify: FastifyInstance, appConfig: AppConfig, securityConfig: SecurityConfig, databaseConfig: DatabaseConfig, quiet?: boolean): Promise<void>;
```

**Dependencies:**

- Fastify instance
- Config objects (appConfig, securityConfig, databaseConfig)
- All plugin modules

**Reuses:**

- Existing `PluginGroup` interface
- Existing `loadPluginGroup()` function
- Existing error handling and timing logic

**Changes:**

- Replace `createCorePluginGroup()` with `createCoreLayerGroup()`
- Replace `createFeaturePluginGroup()` with `createPlatformLayerGroup()` and `createDomainsLayerGroup()`
- Add conditional loading based on feature flags

### Component 2: Route Aliasing Plugin

**Purpose:** Provide backwards compatibility by redirecting old routes to new layer-based routes

**File:** `apps/api/src/config/route-aliases.ts` (NEW)

**Interfaces:**

```typescript
export interface RouteAliasConfig {
  enableAliasing: boolean;
  aliasMap: Record<string, string>; // old -> new
}

export const routeAliasPlugin: FastifyPluginAsync<RouteAliasConfig>;
```

**Implementation:**

```typescript
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export const routeAliasPlugin = fp(
  async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const config = fastify.config;

    // Skip if feature disabled
    if (!config.features.enableNewRoutes) {
      return;
    }

    const aliasMap: Record<string, string> = {
      '/api/auth': '/api/v1/core/auth',
      '/api/users': '/api/v1/platform/users',
      '/api/rbac': '/api/v1/platform/rbac',
      '/api/departments': '/api/v1/platform/departments',
      '/api/settings': '/api/v1/platform/settings',
      '/api/inventory': '/api/v1/domains/inventory',
      '/api/admin': '/api/v1/domains/admin',
    };

    // Register redirect handlers
    for (const [oldPath, newPath] of Object.entries(aliasMap)) {
      fastify.all(`${oldPath}/*`, async (request, reply) => {
        const targetPath = request.url.replace(oldPath, newPath);

        // Log usage for metrics
        if (fastify.monitoring) {
          fastify.monitoring.recordEvent('route_alias_used', {
            old: request.url,
            new: targetPath,
            method: request.method,
          });
        }

        // HTTP 307: Temporary redirect (preserves method & body)
        return reply.redirect(307, targetPath);
      });
    }
  },
  {
    name: 'route-alias-plugin',
    dependencies: ['logging-plugin'], // Log before aliasing
  },
);
```

**Dependencies:**

- Logging plugin (optional: for metrics)
- Config plugin (for feature flags)

**Reuses:**

- Existing fastify-plugin pattern
- Existing monitoring service (if available)

### Component 3: Feature Flags Configuration

**Purpose:** Control which route sets are active during migration

**File:** `apps/api/src/config/default.ts` (EXTEND)

**Interfaces:**

```typescript
export interface AppConfig {
  // ... existing config ...
  features: {
    enableNewRoutes: boolean; // NEW
    enableOldRoutes: boolean; // NEW
  };
}
```

**Implementation:**

```typescript
export default {
  // ... existing config ...
  features: {
    enableNewRoutes: process.env.ENABLE_NEW_ROUTES === 'true',
    enableOldRoutes: process.env.ENABLE_OLD_ROUTES !== 'false', // Default true
  },
};
```

**Dependencies:** None (pure configuration)

**Reuses:** Existing config structure and loading mechanism

### Component 4: Infrastructure Plugin Template

**Purpose:** Standard template for Core layer plugins that decorate fastify instance

**Pattern:** Use `fastify-plugin` (fp) wrapper

**Example:** `apps/api/src/layers/core/monitoring/monitoring.plugin.ts`

```typescript
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { MonitoringService } from './services/monitoring.service';

export default fp(
  async function monitoringPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    // Initialize service
    const service = new MonitoringService(fastify.config);
    await service.initialize();

    // Decorate fastify instance
    fastify.decorate('monitoring', service);

    // Register lifecycle hooks
    fastify.addHook('onRequest', async (request) => {
      request.startTime = Date.now();
    });

    fastify.addHook('onResponse', async (request, reply) => {
      const duration = Date.now() - request.startTime;
      service.recordMetric('http_request_duration_ms', duration);
    });

    // Cleanup on close
    fastify.addHook('onClose', async () => {
      await service.close();
    });
  },
  {
    name: 'monitoring-plugin',
    dependencies: ['config-plugin'],
  },
);

// TypeScript declarations
declare module 'fastify' {
  interface FastifyInstance {
    monitoring: MonitoringService;
  }
}
```

**When to use:**

- Plugin decorates fastify instance
- Plugin registers global hooks
- Plugin manages lifecycle (initialize/close)
- Plugin has explicit dependencies

### Component 5: Leaf Module Plugin Template

**Purpose:** Standard template for Platform/Domain leaf modules (routes + controllers)

**Pattern:** Plain async function (NO fp wrapper)

**Example:** `apps/api/src/layers/platform/users/users.plugin.ts`

```typescript
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersRoutes } from './users.routes';
import { usersSchemas } from './users.schemas';

export default async function usersPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Register schemas
  if ((fastify as any).schemaRegistry) {
    (fastify as any).schemaRegistry.registerModuleSchemas('users', usersSchemas);
  }

  // Initialize dependency chain
  const repository = new UsersRepository(fastify.knex);
  const service = new UsersService(repository);
  const controller = new UsersController(service, fastify.eventService);

  // Register routes
  await fastify.register(usersRoutes, {
    controller,
    prefix: opts.prefix || '/users',
  });
}
```

**When to use:**

- Plugin only registers routes/controllers
- Plugin does NOT decorate fastify instance
- Plugin is a terminal/leaf module
- Plugin respects encapsulation (isolated from siblings)

### Component 6: Domain Aggregator Plugin Template

**Purpose:** Standard template for domain-level aggregators that group related modules

**Pattern:** Use `fastify-plugin` (fp) wrapper

**Example:** `apps/api/src/layers/domains/inventory/inventory.plugin.ts`

```typescript
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import masterDataPlugin from './master-data/master-data.plugin';
import operationsPlugin from './operations/operations.plugin';
import procurementPlugin from './procurement/procurement.plugin';
import budgetPlugin from './budget/budget.plugin';

export default fp(
  async function inventoryPlugin(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    // Register all sub-domains with sub-prefixes
    await fastify.register(masterDataPlugin, {
      prefix: '/master-data',
    });

    await fastify.register(operationsPlugin, {
      prefix: '/operations',
    });

    await fastify.register(procurementPlugin, {
      prefix: '/procurement',
    });

    await fastify.register(budgetPlugin, {
      prefix: '/budget',
    });
  },
  {
    name: 'inventory-plugin',
    // No dependencies - children manage their own
  },
);
```

**When to use:**

- Plugin aggregates multiple child plugins
- Plugin provides namespace isolation
- Plugin coordinates related functionality
- Child plugins need access to parent context

### Component 7: CRUD Generator Updates

**Purpose:** Generate code following layer-based architecture

**Files to Modify:**

- `libs/aegisx-cli/templates/backend/plugin.ejs`
- `libs/aegisx-cli/templates/backend/routes.ejs`
- `libs/aegisx-cli/templates/backend/controller.ejs`
- `libs/aegisx-cli/templates/backend/service.ejs`
- `libs/aegisx-cli/templates/backend/repository.ejs`
- `libs/aegisx-cli/src/generators/backend.generator.ts`

**Key Changes:**

1. **Directory Structure**:

```javascript
// OLD
const outputDir = `apps/api/src/modules/${domain}/${type}/${tableName}`;

// NEW
const layer = determineLayer(domain, type);
const outputDir = `apps/api/src/layers/${layer}/${domain}/${type}/${tableName}`;

function determineLayer(domain: string, type: string): 'core' | 'platform' | 'domains' {
  // Core: Infrastructure (auth, monitoring, audit)
  if (['auth', 'monitoring', 'audit', 'security'].includes(domain)) {
    return 'core';
  }

  // Platform: Shared services (users, files, settings)
  if (['users', 'rbac', 'files', 'settings', 'departments'].includes(domain)) {
    return 'platform';
  }

  // Domains: Everything else (inventory, admin, hr, finance)
  return 'domains';
}
```

2. **Plugin Template**:

```ejs
<%# Determine if should use fp() wrapper %>
<% const useFp = layer === 'core' || isAggregator; %>

<% if (useFp) { %>
import fp from 'fastify-plugin';

export default fp(
  async function <%= pluginName %>Plugin(fastify, opts) {
    // ... implementation ...
  },
  {
    name: '<%= pluginName %>-plugin',
    dependencies: <%= JSON.stringify(dependencies) %>,
  }
);
<% } else { %>
export default async function <%= pluginName %>Plugin(fastify, opts) {
  // ... implementation ...
}
<% } %>
```

3. **URL Routing**:

```ejs
// OLD
prefix: opts.prefix || '/<%= tableName %>',

// NEW
prefix: opts.prefix || '/api/v1/<%= layer %>/<%= domain %>/<%= tableName %>',
```

**Dependencies:**

- Existing template system
- Domain classification logic

**Reuses:**

- Existing EJS templates
- Existing generator infrastructure

## Data Models

### Model 1: Plugin Registration Metadata

```typescript
interface PluginGroup {
  name: string; // Group identifier
  description: string; // Human-readable description
  layer?: 'core' | 'platform' | 'domains'; // NEW: Layer classification
  plugins: PluginRegistration[];
}

interface PluginRegistration {
  name: string; // Plugin name
  plugin: any; // Plugin function
  options?: any; // Plugin options
  required?: boolean; // Is plugin required?
  layer?: 'core' | 'platform' | 'domains'; // NEW: Layer classification
  urlPattern?: string; // NEW: URL pattern (e.g., /api/v1/core/auth)
}
```

### Model 2: Route Alias Mapping

```typescript
interface RouteAlias {
  oldPath: string; // Old route pattern
  newPath: string; // New route pattern
  preserveMethod: boolean; // Preserve HTTP method (always true)
  preserveBody: boolean; // Preserve request body (always true)
  statusCode: 307; // HTTP 307 Temporary Redirect
}

interface RouteAliasMetrics {
  route: string; // Old route that was aliased
  targetRoute: string; // New route redirected to
  hitCount: number; // Number of times aliased
  uniqueClients: number; // Distinct client IDs
  firstSeen: Date; // First usage timestamp
  lastSeen: Date; // Last usage timestamp
}
```

### Model 3: Feature Flags

```typescript
interface FeatureFlags {
  enableNewRoutes: boolean; // Enable /api/v1/{layer}/{resource} routes
  enableOldRoutes: boolean; // Enable legacy routes (with aliasing)
}

// Environment variables
process.env.ENABLE_NEW_ROUTES; // "true" | "false"
process.env.ENABLE_OLD_ROUTES; // "true" | "false" (default: "true")
```

### Model 4: Layer Classification Rules

```typescript
type Layer = 'core' | 'platform' | 'domains';

interface ModuleClassification {
  moduleName: string;
  currentPath: string; // Current location
  targetLayer: Layer; // Target layer
  targetPath: string; // Target location
  reason: string; // Reason for classification
  useFpWrapper: boolean; // Should use fp() wrapper?
  dependencies: string[]; // Plugin dependencies
}

// Classification examples
const classifications: ModuleClassification[] = [
  {
    moduleName: 'auth',
    currentPath: 'apps/api/src/core/auth',
    targetLayer: 'core',
    targetPath: 'apps/api/src/layers/core/auth',
    reason: 'Infrastructure - authentication primitives',
    useFpWrapper: true,
    dependencies: ['knex-plugin', 'jwt-plugin'],
  },
  {
    moduleName: 'users',
    currentPath: 'apps/api/src/core/users',
    targetLayer: 'platform',
    targetPath: 'apps/api/src/layers/platform/users',
    reason: 'Shared service - used by multiple domains',
    useFpWrapper: false,
    dependencies: ['knex-plugin'],
  },
  {
    moduleName: 'inventory',
    currentPath: 'apps/api/src/modules/inventory',
    targetLayer: 'domains',
    targetPath: 'apps/api/src/layers/domains/inventory',
    reason: 'Business logic - inventory domain',
    useFpWrapper: true, // Aggregator
    dependencies: [],
  },
];
```

## Error Handling

### Error Scenario 1: Plugin Registration Failure

**Description:** Plugin fails to load due to missing dependency or initialization error

**Handling:**

- If `required: true`: Throw error, prevent server startup, log detailed error message
- If `required: false`: Log warning, continue with other plugins, track failure in metrics

**User Impact:**

- Development: Clear error message with plugin name, dependency chain, and fix suggestions
- Production: Server fails to start if critical plugin fails (prevents broken state)

**Example:**

```typescript
try {
  await fastify.register(pluginReg.plugin, pluginReg.options);
} catch (error) {
  const errorMsg = error instanceof Error ? error.message : String(error);

  if (pluginReg.required) {
    console.error(`❌ ${pluginReg.name} FAILED: ${errorMsg}`);
    throw new Error(`Required plugin ${pluginReg.name} failed to load: ${errorMsg}\n` + `Dependencies: ${JSON.stringify(pluginReg.dependencies || [])}\n` + `Hint: Check if all dependencies are registered before this plugin.`);
  } else {
    console.warn(`⚠️ ${pluginReg.name} OPTIONAL FAILED: ${errorMsg}`);
    // Continue without this plugin
  }
}
```

### Error Scenario 2: Route Aliasing Redirect Failure

**Description:** Route alias redirect fails (e.g., new route doesn't exist)

**Handling:**

- Log error with old route, target route, and error details
- Return HTTP 500 with helpful error message
- Alert monitoring system

**User Impact:**

- API consumers receive error response with migration guide link
- DevOps team receives alert about broken alias

**Example:**

```typescript
fastify.all(`${oldPath}/*`, async (request, reply) => {
  try {
    const targetPath = request.url.replace(oldPath, newPath);
    return reply.redirect(307, targetPath);
  } catch (error) {
    fastify.log.error({
      error,
      oldPath: request.url,
      targetPath,
      message: 'Route alias redirect failed',
    });

    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Route aliasing failed. Please use new API URL format.',
      migration_guide: '/docs/api-migration-guide',
      old_url: request.url,
      new_url_pattern: '/api/v1/{layer}/{resource}',
    });
  }
});
```

### Error Scenario 3: Feature Flag Configuration Error

**Description:** Invalid feature flag configuration (e.g., both flags disabled)

**Handling:**

- Validate flags at server startup
- Prevent invalid configurations (both disabled = no routes work)
- Log warning if both enabled (migration mode)

**User Impact:**

- Server fails to start with clear error message
- Configuration fix suggested in error output

**Example:**

```typescript
// In server.ts startup validation
function validateFeatureFlags(config: AppConfig): void {
  const { enableNewRoutes, enableOldRoutes } = config.features;

  // Invalid: Both disabled
  if (!enableNewRoutes && !enableOldRoutes) {
    throw new Error('Invalid configuration: Both ENABLE_NEW_ROUTES and ENABLE_OLD_ROUTES are false.\n' + 'At least one must be enabled for API to function.\n' + 'Recommended: Set ENABLE_NEW_ROUTES=true for migration mode.');
  }

  // Warning: Both enabled (migration mode)
  if (enableNewRoutes && enableOldRoutes) {
    console.warn('⚠️  Migration mode: Both old and new routes enabled.\n' + '   Old routes will redirect to new routes.\n' + '   Disable old routes after clients migrate: ENABLE_OLD_ROUTES=false');
  }
}
```

### Error Scenario 4: Module Categorization Ambiguity

**Description:** Developer unsure which layer a new module belongs to

**Handling:**

- Provide decision tree in documentation
- CLI helper command to suggest layer
- Validation in CRUD generator with confirmation prompt

**User Impact:**

- Developer receives clear guidance
- Prevents incorrect module placement

**Example:**

```bash
# CLI helper
$ pnpm run check-layer -- user-sessions

Analyzing: user-sessions

Questions:
1. Does it provide infrastructure? (auth, logging, monitoring) → No
2. Is it used by multiple domains? → Yes
3. Is it business-specific to one domain? → No

Recommendation: Platform Layer
Path: apps/api/src/layers/platform/user-sessions
Reason: Shared service used by multiple domains

Use fp() wrapper? No (leaf module)
```

## Testing Strategy

### Unit Testing

**Approach:** Test individual components in isolation

**Key Components to Test:**

1. **Route Aliasing Plugin**:
   - Test old route redirects to correct new route
   - Test HTTP method preservation (GET, POST, PUT, DELETE)
   - Test request body preservation
   - Test query string preservation
   - Test metrics logging

2. **Plugin Loader**:
   - Test layer-based group creation
   - Test feature flag conditional loading
   - Test error handling for required vs optional plugins
   - Test plugin dependency resolution

3. **Module Classification Logic** (CRUD Generator):
   - Test layer determination for different domains
   - Test fp() wrapper decision logic
   - Test URL pattern generation

**Test Files:**

```
apps/api/src/config/__tests__/route-aliases.test.ts
apps/api/src/bootstrap/__tests__/plugin.loader.test.ts
libs/aegisx-cli/src/__tests__/layer-classification.test.ts
```

**Example Test:**

```typescript
describe('Route Aliasing Plugin', () => {
  it('should redirect /api/users to /api/v1/platform/users with 307', async () => {
    const app = await createTestApp({ enableNewRoutes: true });

    const response = await app.inject({
      method: 'GET',
      url: '/api/users/123',
    });

    expect(response.statusCode).toBe(307);
    expect(response.headers.location).toBe('/api/v1/platform/users/123');
  });

  it('should preserve POST body during redirect', async () => {
    const app = await createTestApp({ enableNewRoutes: true });

    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { name: 'John' },
    });

    expect(response.statusCode).toBe(307);
    // Note: HTTP 307 spec requires client to preserve body
  });
});
```

### Integration Testing

**Approach:** Test layer interactions and plugin registration flow

**Key Flows to Test:**

1. **Full Server Startup with New Routes**:
   - Start server with `ENABLE_NEW_ROUTES=true`
   - Verify all layers load successfully
   - Verify routes registered at correct paths
   - Verify cross-layer dependencies work

2. **Migration Mode (Both Routes Active)**:
   - Start with both flags enabled
   - Test old routes redirect correctly
   - Test new routes work directly
   - Verify metrics track alias usage

3. **Gradual Migration**:
   - Start with old routes only
   - Enable new routes (migration mode)
   - Disable old routes (cutover complete)
   - Verify no downtime at each transition

**Test Files:**

```
apps/api/src/__tests__/integration/layer-architecture.test.ts
apps/api/src/__tests__/integration/migration-flow.test.ts
```

**Example Test:**

```typescript
describe('Layer Architecture Integration', () => {
  it('should load all three layers in correct order', async () => {
    const app = await createTestApp();

    // Core layer loaded first
    expect(app.authService).toBeDefined();
    expect(app.monitoring).toBeDefined();

    // Platform layer loaded second
    expect(app.hasRoute('GET', '/api/v1/platform/users')).toBe(true);

    // Domains layer loaded third
    expect(app.hasRoute('GET', '/api/v1/domains/inventory/drugs')).toBe(true);
  });

  it('should enforce dependency rules between layers', () => {
    // Platform can depend on Core
    const platformService = new UsersService(/* core dependencies */);
    expect(platformService).toBeDefined();

    // Domain can depend on Platform + Core
    const domainService = new InventoryService();
    /* platform and core dependencies */
    expect(domainService).toBeDefined();

    // Domain should NOT depend on another Domain (enforced by architecture)
  });
});
```

### End-to-End Testing

**Approach:** Test complete user journeys through API

**User Scenarios to Test:**

1. **API Consumer Using Old Routes**:
   - Consumer calls `/api/users`
   - Gets redirected to `/api/v1/platform/users`
   - Receives same response format
   - Deprecation headers present

2. **API Consumer Using New Routes**:
   - Consumer calls `/api/v1/platform/users`
   - No redirection occurs
   - Response format identical to old route
   - Performance within SLA

3. **CRUD Generator End-to-End**:
   - Run generator for new table
   - Verify files created in correct layer
   - Verify routes work immediately
   - Verify generated code passes linting

**Test Files:**

```
apps/api/src/__tests__/e2e/api-consumer-journey.test.ts
libs/aegisx-cli/__tests__/e2e/generator-full-flow.test.ts
```

**Example Test:**

```typescript
describe('API Consumer Migration Journey', () => {
  it('should support gradual client migration', async () => {
    const app = await createTestApp({
      enableOldRoutes: true,
      enableNewRoutes: true,
    });

    // Old client (using legacy routes)
    const oldResponse = await app.inject({
      method: 'GET',
      url: '/api/users/123',
    });
    expect(oldResponse.statusCode).toBe(307); // Redirected
    expect(oldResponse.headers['x-api-deprecated']).toBe('true');

    // New client (using versioned routes)
    const newResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/platform/users/123',
    });
    expect(newResponse.statusCode).toBe(200); // Direct
    expect(newResponse.headers['x-api-deprecated']).toBeUndefined();

    // Responses should be identical
    expect(oldResponse.json()).toEqual(newResponse.json());
  });
});
```

## Migration Architecture

### Phase-by-Phase Architecture Changes

**Phase 1: Specifications (Weeks 1-2)**

- No code changes
- Document creation only
- Architecture diagrams in specs
- Review and approval gates

**Phase 2: CRUD Generator (Week 3)**

- Modify templates to support layer structure
- Add layer classification logic
- Update CLI to accept layer parameter
- Ensure backward compatibility (can still generate old format)

**Phase 3: Setup & Route Aliasing (Week 4)**

- Create `apps/api/src/layers/{core,platform,domains}/` directories
- Implement route aliasing plugin
- Add feature flags to config
- Update plugin loader to support dual registration
- Deploy with flags disabled (no behavior change)

**Phase 4: Incremental Migration (Weeks 5-7)**

- Copy modules to new locations (don't delete old yet)
- Update plugin patterns (fp vs plain async)
- Register both old and new routes
- Test in staging environment
- Canary deployment to production

**Phase 5: Testing (Week 8)**

- Comprehensive test suite execution
- Performance benchmarking
- Load testing
- Security scanning

**Phase 6: Cleanup (Weeks 9-10)**

- Disable old routes
- Delete old code
- Remove route aliasing (after sunset period)
- Archive migration artifacts

### Rollback Architecture

Each phase has specific rollback capability:

**Phase 3-4 Rollback**: Disable `ENABLE_NEW_ROUTES` flag → instant revert
**Phase 5 Rollback**: Deployment rollback via CI/CD → 5-minute recovery
**Phase 6 Rollback**: Re-enable `ENABLE_OLD_ROUTES` flag → restore old routes

### Performance Architecture

**Aliasing Performance:**

- Route matching: O(1) hash map lookup
- Redirect overhead: <5ms (URL string replacement)
- No database queries added
- No serialization overhead

**Plugin Loading Performance:**

- Layer-based groups load sequentially (Core → Platform → Domains)
- Within layer, plugins load in parallel where possible
- Dependency resolution unchanged
- Startup time target: <10% increase

### Security Architecture

**Route Aliasing Security:**

- Redirects preserve authentication headers
- CSRF tokens maintained through 307 redirect
- Rate limiting applies before redirection
- Audit logs capture both old and new URLs

**Layer Isolation:**

- Domains cannot access other Domains directly (architectural boundary)
- Platform services accessed via dependency injection only
- Core infrastructure available globally (by design)

## Implementation Roadmap

### Week 1-2: Specification Documents

- Create 5 specification documents (this document + 4 others)
- Team review and feedback incorporation
- Stakeholder approval

### Week 3: CRUD Generator Updates

- Modify templates in `libs/aegisx-cli/templates/`
- Add layer classification logic
- Test generator with sample tables
- Update generator documentation

### Week 4: Setup & Route Aliasing

- Create layer directory structure
- Implement route aliasing plugin
- Add feature flags
- Update plugin loader
- Deploy to production (flags disabled)

### Week 5: Low-Risk Migration

- Migrate `departments`, `settings`, `navigation`
- Test dual routes
- Monitor metrics
- Canary deployment

### Week 6: Medium-Risk Migration

- Migrate `users`, `rbac`, `files`, `attachments`, `pdf-export`, `import`
- Comprehensive testing
- Gradual rollout

### Week 7: High-Risk Migration

- Migrate `auth`, `monitoring`, `audit`
- Migrate `inventory`, `admin` domains
- Full testing suite
- Production deployment

### Week 8: Testing

- Unit + integration + E2E tests
- Performance benchmarks
- Load testing
- Security audit

### Week 9-10: Cleanup

- Soft deprecation (headers)
- Hard cutover (disable old routes)
- Delete old code
- Update documentation

Total: 10 weeks from spec to production-ready
