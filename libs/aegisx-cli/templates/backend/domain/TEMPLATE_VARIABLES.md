# Backend Domain Template Variables

This document describes the variables required by the updated backend domain templates (index.hbs) following the API Architecture Standardization.

## Layer Classification Variables

These variables are provided by the layer classifier utility (`libs/aegisx-cli/lib/utils/layer-classifier.js`):

### `layer` (string, required)

**Values:** `'core'` | `'platform'` | `'domains'`

Determines the architectural layer where the module belongs.

- **`core`** - Infrastructure services (auth, monitoring, audit)
- **`platform`** - Shared services used by multiple domains (users, RBAC, departments)
- **`domains`** - Domain-specific business logic (inventory, hr, etc.)

**Example:**

```javascript
layer: 'platform';
```

### `moduleType` (string, required)

**Values:** `'infrastructure'` | `'aggregator'` | `'leaf'`

Classifies the module's pattern and purpose.

- **`infrastructure`** - Core services that decorate Fastify instance
- **`aggregator`** - Plugins that register multiple child plugins
- **`leaf`** - Modules with routes + controllers only (no child plugins)

**Example:**

```javascript
moduleType: 'leaf';
```

### `useFpWrapper` (boolean, required)

**Values:** `true` | `false`

Determines whether to use `fastify-plugin` (fp) wrapper.

**Rules:**

- `true` for `core` layer (all modules)
- `true` for `aggregator` modules (any layer)
- `false` for `leaf` modules in `platform` or `domains` layers

**Example:**

```javascript
useFpWrapper: false; // Leaf module in platform layer
```

### `urlPrefix` (string, required)

**Format:** `/v1/{layer}/{domain?}/{resource}`

The URL prefix for route registration (without `/api` - bootstrap adds that).

**Examples:**

```javascript
// Platform layer
urlPrefix: '/v1/platform/users';

// Domains layer
urlPrefix: '/v1/domains/inventory/drugs';

// Core layer
urlPrefix: '/v1/core/auth';
```

### `domain` (string, optional)

**Examples:** `'inventory'`, `'hr'`, `'finance'`, `'admin'`

The business domain name (only for domains layer).

**Usage:**

- Required for `domains` layer modules
- Not used for `core` or `platform` layers
- Used in plugin naming and logging

**Example:**

```javascript
domain: 'inventory';
```

## Existing Template Variables

These variables are already provided by the current generator:

### Core Module Variables

- `moduleName` - Module name in camelCase (e.g., `'users'`)
- `ModuleName` - Module name in PascalCase (e.g., `'Users'`)
- `tableName` - Database table name in snake_case (e.g., `'users'`)
- `currentRoute` - Object with route metadata
  - `currentRoute.camelName` - Route name in camelCase

### Feature Flags

- `withImport` - boolean, include import/export functionality
- `withEvents` - boolean, include WebSocket events
- `package` - string: `'standard'`, `'enterprise'`, `'full'`

### Paths

- `servicesPath` - Path to shared services directory

## Template Logic Examples

### Conditional fp() Import

```handlebars
{{#if useFpWrapper}}import fp from 'fastify-plugin';
{{/if}}
```

**Output when `useFpWrapper = false`:**

```typescript
// No import
```

**Output when `useFpWrapper = true`:**

```typescript
import fp from 'fastify-plugin';
```

### Conditional Export Wrapper

```handlebars
{{#if useFpWrapper}}export default fp( async function
  {{moduleName}}Plugin(
{{else}}export default async function
  {{moduleName}}Plugin(
{{/if}}
```

**Output when `useFpWrapper = false` (Platform leaf):**

```typescript
export default async function usersPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // ...
}
```

**Output when `useFpWrapper = true` (Core infrastructure):**

```typescript
export default fp(
  async function authPlugin(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // ...
  },
  {
    name: 'auth-plugin',
    dependencies: ['knex-plugin', 'response-handler-plugin'],
  },
);
```

### Layer-Specific Comments

```handlebars
/** * {{ModuleName}} {{#if (eq layer 'core')}}Core Infrastructure{{else if (eq layer 'platform')}}Platform{{else}}Domain{{/if}} Plugin */
```

**Output variations:**

```typescript
// For layer = 'core'
/** Users Core Infrastructure Plugin */

// For layer = 'platform'
/** Users Platform Plugin */

// For layer = 'domains'
/** Users Domain Plugin */
```

### Module Type Documentation

```handlebars
{{#if (eq moduleType 'infrastructure')}}
  * Infrastructure plugin that provides system-wide services and decorates Fastify instance.
{{else if (eq moduleType 'aggregator')}}
  * Aggregator plugin that registers and coordinates multiple child plugins.
{{else}}
  * Leaf module plugin with routes and controllers following the repository-service-controller pattern.
{{/if}}
```

### URL Prefix Usage

```handlebars
await fastify.register(usersRoutes, { controller: usersController, prefix: options.prefix || '{{urlPrefix}}' });
```

**Output:**

```typescript
// Platform module
prefix: options.prefix || '/v1/platform/users';

// Domain module
prefix: options.prefix || '/v1/domains/inventory/drugs';
```

### Infrastructure Decoration (conditional)

```handlebars
{{#if (eq moduleType 'infrastructure')}}
  // Decorate Fastify instance with service for cross-plugin access fastify.decorate('{{moduleName}}Service',
  {{moduleName}}Service);
{{/if}}
```

**Output when `moduleType = 'infrastructure'`:**

```typescript
// Decorate Fastify instance with service for cross-plugin access
fastify.decorate('authService', authService);
```

**Output when `moduleType = 'leaf'`:**

```typescript
// Nothing - no decoration
```

## Complete Example Context Objects

### Example 1: Platform Leaf Module (Users)

```javascript
{
  layer: 'platform',
  moduleType: 'leaf',
  useFpWrapper: false,
  urlPrefix: '/v1/platform/users',
  domain: null,
  moduleName: 'users',
  ModuleName: 'Users',
  tableName: 'users',
  currentRoute: { camelName: 'users' },
  withImport: true,
  withEvents: true,
  package: 'full'
}
```

**Generates:** Plain async function, no fp() wrapper, schema registration, lifecycle hooks

### Example 2: Domains Leaf Module (Drugs)

```javascript
{
  layer: 'domains',
  moduleType: 'leaf',
  useFpWrapper: false,
  urlPrefix: '/v1/domains/inventory/drugs',
  domain: 'inventory',
  moduleName: 'drugs',
  ModuleName: 'Drugs',
  tableName: 'drugs',
  currentRoute: { camelName: 'drugs' },
  withImport: true,
  withEvents: false,
  package: 'enterprise'
}
```

**Generates:** Plain async function in domains/inventory/master-data/drugs

### Example 3: Core Infrastructure (Auth)

```javascript
{
  layer: 'core',
  moduleType: 'infrastructure',
  useFpWrapper: true,
  urlPrefix: '/v1/core/auth',
  domain: null,
  moduleName: 'auth',
  ModuleName: 'Auth',
  tableName: 'users', // auth uses users table
  currentRoute: { camelName: 'auth' },
  withImport: false,
  withEvents: false,
  package: 'standard'
}
```

**Generates:** fp() wrapped plugin with dependencies, service decoration, TypeScript declaration

### Example 4: Domain Aggregator (Inventory)

```javascript
{
  layer: 'domains',
  moduleType: 'aggregator',
  useFpWrapper: true,
  urlPrefix: '/v1/domains/inventory',
  domain: 'inventory',
  moduleName: 'inventory',
  ModuleName: 'Inventory',
  // Aggregators don't have table/routes directly
  currentRoute: null,
  withImport: false,
  withEvents: false,
  package: 'standard'
}
```

**Generates:** fp() wrapped plugin that registers child plugins (drugs, equipment, etc.)

## Migration Path

To integrate this updated template with the layer classifier:

1. **Task 5.1** ✅ - Created layer classifier utility
2. **Task 5.2** ✅ - Updated backend plugin template (current task)
3. **Task 5.4** (Next) - Update generator to:
   - Import layer classifier: `const { determineLayer } = require('../utils/layer-classifier')`
   - Call classifier: `const classification = determineLayer(tableName, { domain, type })`
   - Pass variables to template: `{ ...existingVars, ...classification }`

## Testing

To test template output with different layer configurations:

```bash
# Test Platform leaf module
node test-template.js --layer=platform --moduleType=leaf --table=users

# Test Domain leaf module
node test-template.js --layer=domains --moduleType=leaf --domain=inventory --table=drugs

# Test Core infrastructure
node test-template.js --layer=core --moduleType=infrastructure --table=auth
```

## Validation Rules

The template expects these validation rules to be enforced by the generator:

1. **`useFpWrapper` consistency:**
   - If `layer = 'core'` → `useFpWrapper = true`
   - If `moduleType = 'aggregator'` → `useFpWrapper = true`
   - If `moduleType = 'leaf'` and `layer != 'core'` → `useFpWrapper = false`

2. **`domain` requirement:**
   - If `layer = 'domains'` → `domain` must be provided
   - If `layer != 'domains'` → `domain` should be null

3. **`urlPrefix` format:**
   - Must start with `/v1/`
   - Must include layer: `/v1/{layer}/...`
   - Must NOT include `/api` (bootstrap adds it)

## Related Files

- **Layer Classifier:** `libs/aegisx-cli/lib/utils/layer-classifier.js`
- **Architecture Spec:** `docs/architecture/api-standards/02-architecture-specification.md`
- **Plugin Migration Guide:** `docs/architecture/api-standards/08-plugin-migration-guide.md`
- **Template:** `libs/aegisx-cli/templates/backend/domain/index.hbs`

## Notes

- Template uses Handlebars syntax (`.hbs`)
- All conditional logic is based on proven patterns from Phase 3 migrations
- Generated code matches hand-migrated examples (departments, users, auth)
- Template supports backward compatibility through existing variables
