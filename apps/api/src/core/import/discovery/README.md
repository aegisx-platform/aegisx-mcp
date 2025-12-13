# ImportDiscoveryService - File Scanning & Auto-Discovery

Implementation of the ImportDiscoveryService component from the Auto-Discovery Import System.

## What's Implemented

This directory contains the production-ready ImportDiscoveryService with the following capabilities:

### Core Features

1. **File Scanning**
   - Scans `apps/api/src/modules/**/*-import.service.ts` files recursively
   - Uses synchronous directory traversal (no external dependencies)
   - Handles both TypeScript source and compiled JavaScript
   - Filters out spec/test files automatically

2. **Dynamic Import Registration**
   - Loads service files to trigger `@ImportService` decorator execution
   - Supports both CommonJS (require) and ESM (import) module formats
   - Gracefully handles import failures with logging

3. **Dependency Graph Building**
   - Maps module dependencies in both directions
   - Supports multiple levels of transitive dependencies
   - Optimized for fast graph operations

4. **Dependency Validation**
   - Detects circular dependencies using DFS
   - Checks for missing/undefined dependencies
   - Reports all issues with detailed error messages

5. **Topological Sorting**
   - Calculates optimal import order respecting dependencies
   - Considers priority levels (1 = highest)
   - Groups modules by priority for efficient processing

6. **Database Persistence**
   - Stores registry metadata in `import_service_registry` table
   - Batch insert for performance
   - Atomic operations for data consistency

## Performance

**Target: Sub-100ms discovery for 30+ modules**

Estimated breakdown:

- Directory scanning: 10-20ms
- Dynamic imports: 30-40ms
- Dependency graph: 5-10ms
- Validation: 10-15ms
- Database persistence: 15-25ms

Total: ~70-110ms

## Usage

### Basic Usage

```typescript
import { createImportDiscoveryService } from '@/core/import';
import { fastify } from './app';
import { db } from './database';

// Initialize discovery service (runs automatically)
const discoveryService = await createImportDiscoveryService(fastify, db);

// Check if everything discovered successfully
if (!discoveryService.isHealthy()) {
  console.error('Discovery errors:', discoveryService.getValidationErrors());
  console.error('Circular deps:', discoveryService.getCircularDependencies());
}
```

### Get Services

```typescript
// Get all discovered services
const allServices = discoveryService.getAllServices();
console.log(`Discovered ${allServices.length} services`);

// Get specific service by module name
const drugService = discoveryService.getService('drug_generics');
if (drugService) {
  const metadata = drugService.getMetadata();
  console.log(`Found: ${metadata.displayName}`);
}

// Filter by domain
const inventoryServices = discoveryService.getServicesByDomain('inventory');

// Filter by tag
const masterDataServices = discoveryService.getServicesByTag('master-data');

// Get sorted by priority
const byPriority = discoveryService.getServicesByPriority();
```

### Get Import Order

```typescript
// Get flat list of modules in recommended import order
const importOrder = discoveryService.getImportOrder();
// Result: ['drug_generics', 'users', 'departments', 'drugs', ...]

// Get with reasons for each module
const withReasons = discoveryService.getImportOrderWithReasons();
// Result: [
//   { module: 'drug_generics', reason: 'No dependencies' },
//   { module: 'users', reason: 'No dependencies' },
//   { module: 'departments', reason: 'Requires: users' },
//   ...
// ]
```

### Error Handling

```typescript
const errors = discoveryService.getValidationErrors();
const circulars = discoveryService.getCircularDependencies();

if (errors.length > 0) {
  console.error('Validation errors:');
  errors.forEach((err) => console.error(`  - ${err}`));
}

if (circulars.length > 0) {
  console.error('Circular dependencies detected:');
  circulars.forEach((circ) => {
    console.error(`  ${circ.path.join(' -> ')}`);
  });
}
```

## Architecture

### Class Structure

```
ImportDiscoveryService
├── discoverServices()              // Main orchestration
├── scanForImportServices()         // File system scanning
├── dynamicImportServices()         // Load service files
├── buildRegistry()                 // Instantiate services
├── buildDependencyGraph()          // Map dependencies
├── validateDependencies()          // Check for issues
├── topologicalSort()               // Calculate import order
├── persistRegistry()               // Store in database
└── [Public Query Methods]
    ├── getService()
    ├── getAllServices()
    ├── getServicesByDomain()
    ├── getServicesByTag()
    ├── getServicesByPriority()
    ├── getImportOrder()
    ├── getImportOrderWithReasons()
    └── isHealthy()
```

### Data Structures

**DependencyGraph**

```typescript
{
  'drug_generics': Set { 'drugs', 'budget_plans' },
  'users': Set { 'departments' },
  'departments': Set { 'budget_plans' },
  ...
}
```

**DiscoveryResult**

```typescript
{
  totalServices: 30,
  discoveredServices: ['drug_generics', 'users', ...],
  dependencies: { ... },
  importOrder: ['drug_generics', 'users', 'departments', ...],
  circularDependencies: [],
  validationErrors: []
}
```

## Integration Points

### With Fastify

```typescript
// Decorate fastify instance
fastify.decorate('importDiscovery', discoveryService);

// Use in routes
fastify.get('/admin/system-init/available-modules', async (request, reply) => {
  const services = fastify.importDiscovery.getAllServices();
  return { modules: services };
});
```

### With Database

Uses Knex for:

- Batch deletes (`db('import_service_registry').del()`)
- Batch inserts (`db('import_service_registry').insert(data)`)
- Timestamp functions (`db.fn.now()`)

### With Decorators

Services must use the `@ImportService` decorator for auto-discovery:

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

## Files

- `import-discovery.service.ts` - Main service implementation (19KB, ~550 lines)
- `DISCOVERY_SERVICE.md` - Detailed API documentation
- `README.md` - This file

## Key Methods

### Public Methods

| Method                        | Returns                     | Purpose                        |
| ----------------------------- | --------------------------- | ------------------------------ |
| `discoverServices()`          | `Promise<DiscoveryResult>`  | Execute full discovery process |
| `getService(name)`            | `IImportService \| null`    | Get service by module name     |
| `getAllServices()`            | `RegisteredImportService[]` | Get all registered services    |
| `getServicesByDomain(d)`      | `RegisteredImportService[]` | Filter by domain               |
| `getServicesByTag(tag)`       | `RegisteredImportService[]` | Filter by tag                  |
| `getServicesByPriority()`     | `RegisteredImportService[]` | Get sorted by priority         |
| `getImportOrder()`            | `string[]`                  | Get optimal import sequence    |
| `getImportOrderWithReasons()` | `{ module, reason }[]`      | Get order with explanations    |
| `getDependencyGraph()`        | `DependencyGraph`           | Access raw dependency graph    |
| `getValidationErrors()`       | `string[]`                  | Get list of validation errors  |
| `getCircularDependencies()`   | `CircularDependencyError[]` | Get circular dependency info   |
| `isHealthy()`                 | `boolean`                   | Check overall health status    |

### Private Methods

- `scanForImportServices()` - Recursive directory traversal
- `scanDirectory()` - Helper for directory scanning
- `dynamicImportServices()` - Load service files
- `getValidPath()` - Resolve src vs dist paths
- `buildRegistry()` - Instantiate services
- `buildDependencyGraph()` - Map module dependencies
- `validateDependencies()` - Detect issues
- `detectCircularDependency()` - DFS circular detection
- `topologicalSort()` - Calculate import order
- `depthFirstSort()` - Helper for topo sort
- `persistRegistry()` - Save to database

## Error Handling

### Validation Errors

When discovery detects issues, they're collected in `validationErrors`:

```
Module 'drugs' depends on 'dosage_forms' which is not registered
Module 'budget_plans' depends on 'departments' which is not registered
```

### Circular Dependencies

When cycles are detected, they're reported in `circularDependencies`:

```
Path: ['A', 'B', 'C', 'A']
```

### Import Failures

When a service file fails to load:

- Logged as warning
- Service is skipped
- Discovery continues
- Other services still available

## Testing

```typescript
// Test discovery result
const result = await discoveryService.discoverServices();
expect(result.totalServices).toBe(30);
expect(result.circularDependencies).toHaveLength(0);
expect(result.validationErrors).toHaveLength(0);

// Test import order
const order = discoveryService.getImportOrder();
expect(order).toContain('drug_generics');
expect(order.indexOf('drugs')).toBeGreaterThan(order.indexOf('drug_generics'));

// Test service retrieval
const service = discoveryService.getService('drug_generics');
expect(service).toBeDefined();
expect(service?.getMetadata().module).toBe('drug_generics');
```

## Implementation Notes

### Why Synchronous File Scanning?

- Simpler implementation
- No external glob dependency required
- Fast enough for 30-50 modules
- Can be easily async-ified if needed in future

### Why Directory Traversal vs Glob?

- No additional npm dependencies
- Built-in Node.js `fs` module
- Full control over filtering
- Better error handling

### Why Both Require and Import?

- Compatibility with CommonJS and ESM modules
- Graceful fallback if one fails
- Decorator execution happens in either case

### Why Batch Database Operations?

- Single database round-trip
- Atomic operation (all or nothing)
- Better performance than row-by-row
- Simpler transaction management

## Future Enhancements

Potential improvements for future iterations:

1. **Async Directory Scanning** - Use `fs.promises.readdir()` for non-blocking I/O
2. **Caching** - Cache discovery results until file system changes
3. **Incremental Discovery** - Only re-discover changed files
4. **Performance Metrics** - Track timing for each discovery stage
5. **Health Checks** - Periodically re-validate dependencies
6. **Event Emission** - Emit discovery lifecycle events
7. **Module Watching** - Hot reload on file changes during dev

## References

- [Auto-Discovery Import System Design](../../features/system-initialization/AUTO_DISCOVERY_IMPORT_SYSTEM.md)
- [Import Service Types](../types/import-service.types.ts)
- [Import Service Decorator](../decorator/import-service.decorator.ts)
- [Import Service Registry](../registry/import-service-registry.ts)
- [Database Migrations](../../database/migrations/20251213073722_create_import_service_registry.ts)
