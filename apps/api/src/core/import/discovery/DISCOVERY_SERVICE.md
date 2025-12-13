# ImportDiscoveryService

Auto-discovery service for import modules using file scanning, decorator registration, and dependency graph analysis.

## Overview

The `ImportDiscoveryService` is responsible for:

1. **File Scanning**: Discovers all `**/*-import.service.ts` files using glob patterns
2. **Dynamic Import**: Loads service files to trigger decorator registration
3. **Dependency Graph**: Builds a map of module dependencies for proper import ordering
4. **Validation**: Checks for circular dependencies and missing dependencies
5. **Persistence**: Stores registry metadata in `import_service_registry` database table
6. **Topological Sort**: Calculates recommended import order based on dependencies and priority

## Performance Requirement

- **Target**: Sub-100ms discovery time for 30+ modules
- Optimized for:
  - Efficient glob scanning
  - Parallel dynamic imports
  - In-memory dependency graph
  - Minimal database operations

## Usage

### Basic Discovery

```typescript
import { FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import { createImportDiscoveryService } from '@/core/import';

const fastify: FastifyInstance = ...;
const db: Knex = ...;

// Discover all import services
const discoveryService = await createImportDiscoveryService(fastify, db);

// Log summary
console.log(`Discovered ${discoveryService.getAllServices().length} services`);
```

### Get Import Services

```typescript
// Get all services
const allServices = discoveryService.getAllServices();

// Get service by module name
const service = discoveryService.getService('drug_generics');

// Get services by domain
const inventoryServices = discoveryService.getServicesByDomain('inventory');

// Get services by tag
const masterDataServices = discoveryService.getServicesByTag('master-data');

// Get services sorted by priority
const byPriority = discoveryService.getServicesByPriority();
```

### Get Import Order

```typescript
// Get modules in recommended import order
const importOrder = discoveryService.getImportOrder();
// Returns: ['drug_generics', 'users', 'departments', 'drugs', ...]

// Get import order with reasons
const withReasons = discoveryService.getImportOrderWithReasons();
// Returns:
// [
//   { module: 'drug_generics', reason: 'No dependencies' },
//   { module: 'users', reason: 'No dependencies' },
//   { module: 'departments', reason: 'Requires: users' },
//   ...
// ]
```

### Access Dependency Information

```typescript
// Get dependency graph
const deps = discoveryService.getDependencyGraph();
// Format: { moduleName: Set<dependentModules> }

// Check for issues
const errors = discoveryService.getValidationErrors();
const circulars = discoveryService.getCircularDependencies();

// Check health
if (!discoveryService.isHealthy()) {
  console.error('Discovery has errors or circular dependencies');
}
```

## Service Structure

### File Scanning

```
Pattern: apps/api/src/modules/**/*-import.service.ts
Example matches:
  - apps/api/src/modules/inventory/master-data/drugs/drug-import.service.ts
  - apps/api/src/modules/inventory/master-data/dosage-forms/dosage-forms-import.service.ts
  - apps/api/src/modules/core/users/users-import.service.ts
```

### Decorator Registration

Services must be decorated with `@ImportService`:

```typescript
@ImportService({
  module: 'drug_generics',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Drug Generics (ยาหลัก)',
  dependencies: [],
  priority: 1,
  tags: ['master-data', 'required'],
  supportsRollback: true,
  version: '1.0.0',
})
export class DrugGenericsImportService extends BaseImportService<DrugGeneric> {
  // Implementation
}
```

### Dependency Graph

```
Format: Map<moduleName, Set<dependentModules>>

Example:
{
  'drug_generics': Set { 'drugs', 'budget_plans' },
  'users': Set { 'departments' },
  'dosage_forms': Set { 'drugs' },
  'departments': Set { 'budget_plans' },
  'drugs': Set { 'budget_allocations' },
  'budget_plans': Set { 'budget_allocations' }
}
```

### Topological Sort Algorithm

1. Group modules by priority (1 = highest)
2. Process each priority level
3. Use depth-first traversal respecting dependencies
4. Result: modules in optimal import order

Example Result:

```
[
  'drug_generics',        // Priority 1, no deps
  'users',                // Priority 1, no deps
  'dosage_forms',         // Priority 1, no deps
  'departments',          // Priority 2, deps: [users]
  'drugs',                // Priority 3, deps: [drug_generics, dosage_forms]
  'budget_plans',         // Priority 4, deps: [departments, drug_generics]
  'budget_allocations'    // Priority 5, deps: [budget_plans, drugs]
]
```

## Database Persistence

Registry is stored in `import_service_registry` table with columns:

```typescript
{
  id: number; // Primary key
  module_name: string; // Unique module identifier
  domain: string; // Domain (inventory, core, hr)
  subdomain: string | null; // Subdomain (master-data, operations)
  display_name: string; // Human-readable name
  description: string | null; // Module description
  dependencies: JSON; // Array of dependency module names
  priority: number; // Import priority (1 = highest)
  tags: JSON; // Array of categorization tags
  supports_rollback: boolean; // Rollback capability
  version: string | null; // Service version
  import_status: string; // Current status (not_started, in_progress, completed, error)
  last_import_date: timestamp; // Last successful import
  last_import_job_id: uuid; // Reference to import job
  record_count: number; // Records in last import
  discovered_at: timestamp; // Discovery timestamp
  file_path: string | null; // Service file path
  created_at: timestamp;
  updated_at: timestamp;
}
```

## Error Handling

### Validation Errors

Caught and stored for reporting:

```typescript
discoveryService.getValidationErrors();
// Returns:
// [
//   "Module 'drugs' depends on 'dosage_forms' which is not registered",
//   "Module 'budgets' depends on 'departments' which is not registered"
// ]
```

### Circular Dependencies

Detected using depth-first search:

```typescript
// Module A depends on B, B depends on C, C depends on A

discoveryService.getCircularDependencies();
// Returns:
// [
//   {
//     path: ['A', 'B', 'C', 'A'],
//     detected: true
//   }
// ]
```

## Performance Metrics

Target: Sub-100ms for 30+ modules

### Breakdown (estimated):

- File scanning (glob): ~10-20ms
- Dynamic imports: ~30-40ms
- Dependency graph: ~5-10ms
- Validation: ~10-15ms
- Database persistence: ~15-25ms
- **Total**: ~70-110ms

### Optimization Tips

1. **Compiled files**: Service uses `.js` from dist if available
2. **Parallel imports**: Multiple dynamic imports run in parallel
3. **In-memory graphs**: Dependency calculations are in-memory
4. **Single DB write**: All registry entries written in batch

## Integration with Fastify

The discovery service integrates with Fastify server:

```typescript
// In Fastify plugin
import { createImportDiscoveryService } from '@/core/import';

fastify.decorate('importDiscovery', null);

// During server initialization
const discoveryService = await createImportDiscoveryService(fastify, fastify.knex);
fastify.importDiscovery = discoveryService;

// Access in routes
fastify.get('/admin/system-init/available-modules', async (request, reply) => {
  const services = fastify.importDiscovery.getAllServices();
  return { modules: services };
});
```

## Testing

### Mock Services

```typescript
// For testing discovery without real services
const mockService: ImportServiceMetadata = {
  module: 'test_module',
  domain: 'test',
  displayName: 'Test Module',
  dependencies: [],
  priority: 1,
  tags: ['test'],
  supportsRollback: true,
  version: '1.0.0',
  target: TestImportService,
};

registry.registerService(mockService, TestImportService, '/path/to/service.ts');
```

### Dependency Graph Testing

```typescript
// Verify import order
const order = discoveryService.getImportOrder();
expect(order).toContain('drug_generics');
expect(order.indexOf('drugs')).toBeGreaterThan(order.indexOf('drug_generics'));
```

## Related Documentation

- [Auto-Discovery Import System Design](../../features/system-initialization/AUTO_DISCOVERY_IMPORT_SYSTEM.md)
- [Import Service Decorator](../decorator/import-service.decorator.ts)
- [Import Service Registry](../registry/import-service-registry.ts)
- [Base Import Service](../../shared/services/base-import.service.ts)

## API Methods

### Discovery Methods

- `discoverServices(): Promise<DiscoveryResult>` - Execute full discovery process
- `getService(moduleName: string): IImportService | null` - Get service instance
- `getAllServices(): RegisteredImportService[]` - Get all registered services
- `getServicesByDomain(domain: string): RegisteredImportService[]` - Filter by domain
- `getServicesByTag(tag: string): RegisteredImportService[]` - Filter by tag
- `getServicesByPriority(): RegisteredImportService[]` - Get sorted by priority

### Order Methods

- `getImportOrder(): string[]` - Get modules in recommended order
- `getImportOrderWithReasons(): Array<{ module: string; reason: string }>` - Get order with explanations

### Graph Methods

- `getDependencyGraph(): DependencyGraph` - Access raw dependency graph
- `getValidationErrors(): string[]` - Get validation errors
- `getCircularDependencies(): CircularDependencyError[]` - Get circular dependency info
- `isHealthy(): boolean` - Check overall health
