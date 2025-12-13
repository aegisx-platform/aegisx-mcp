# Import Service Decorator - Usage Examples

Complete examples demonstrating the @ImportService decorator infrastructure.

## Table of Contents

1. [Basic Service Implementation](#basic-service-implementation)
2. [Service with Complex Validation](#service-with-complex-validation)
3. [Service with Dependencies](#service-with-dependencies)
4. [Registry Queries](#registry-queries)
5. [Runtime Metadata Access](#runtime-metadata-access)
6. [Error Handling](#error-handling)

## Basic Service Implementation

### Simple Master Data Service

```typescript
import { Knex } from 'knex';
import { FastifyInstance } from 'fastify';
import { ImportService, BaseImportService, TemplateColumn, ValidationError } from '@/core/import';
import { DrugGeneric } from '../types/drug-generic.types';
import { DrugGenericsRepository } from '../repositories/drug-generics.repository';

@ImportService({
  module: 'drug_generics',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Drug Generics (ยาหลัก)',
  description: 'Master list of generic drug names and classifications',
  dependencies: [], // No dependencies - can import first
  priority: 1, // Highest priority
  tags: ['master-data', 'required', 'inventory'],
  supportsRollback: true,
  version: '1.0.0',
})
export class DrugGenericsImportService extends BaseImportService<DrugGeneric> {
  private repository: DrugGenericsRepository;

  constructor(
    private db: Knex,
    private fastify: FastifyInstance,
  ) {
    super();
    this.repository = new DrugGenericsRepository(db);
  }

  getTemplateColumns(): TemplateColumn[] {
    return [
      {
        name: 'generic_code',
        displayName: 'Generic Code',
        required: true,
        type: 'string',
        maxLength: 50,
        pattern: '^[A-Z0-9_-]+$',
        description: 'Unique code for the generic drug',
        example: 'PARA500',
      },
      {
        name: 'generic_name_th',
        displayName: 'Generic Name (Thai)',
        required: true,
        type: 'string',
        maxLength: 255,
        description: 'Thai name of the generic drug',
        example: 'พาราเซตามอล',
      },
      {
        name: 'generic_name_en',
        displayName: 'Generic Name (English)',
        required: false,
        type: 'string',
        maxLength: 255,
        description: 'English name of the generic drug',
        example: 'Paracetamol',
      },
      {
        name: 'is_active',
        displayName: 'Active',
        required: false,
        type: 'boolean',
        description: 'Whether this generic is currently active',
        example: 'true',
      },
    ];
  }

  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!row.generic_code) {
      errors.push({
        row: rowNumber,
        field: 'generic_code',
        message: 'Generic code is required',
        severity: 'ERROR',
        code: 'MISSING_REQUIRED',
      });
    }

    // Validate format
    if (row.generic_code && !/^[A-Z0-9_-]+$/.test(row.generic_code)) {
      errors.push({
        row: rowNumber,
        field: 'generic_code',
        message: 'Code must contain only uppercase letters, numbers, hyphens, and underscores',
        severity: 'ERROR',
        code: 'INVALID_FORMAT',
      });
    }

    return errors;
  }

  // BaseImportService provides default implementations for:
  // - generateTemplate(format: 'csv' | 'excel'): Promise<Buffer>
  // - validateFile(buffer, fileName, fileType): Promise<ValidationResult>
  // - importData(sessionId, options): Promise<{jobId, status}>
  // - getImportStatus(jobId): Promise<ImportStatus>
  // - canRollback(jobId): Promise<boolean>
  // - rollback(jobId): Promise<void>
  // - getImportHistory(limit?): Promise<ImportHistoryRecord[]>
}
```

## Service with Complex Validation

### Service with Business Logic Validation

```typescript
import { ImportService, BaseImportService, TemplateColumn, ValidationError, ValidationWarning } from '@/core/import';

@ImportService({
  module: 'locations',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Storage Locations (สถานที่จัดเก็บ)',
  dependencies: ['departments'], // Requires departments to be imported first
  priority: 2,
  tags: ['master-data', 'locations'],
  supportsRollback: true,
  version: '1.0.0',
})
export class LocationsImportService extends BaseImportService<Location> {
  constructor(
    private db: Knex,
    private fastify: FastifyInstance,
  ) {
    super();
    this.repository = new LocationsRepository(db);
  }

  getTemplateColumns(): TemplateColumn[] {
    return [
      {
        name: 'location_code',
        displayName: 'Location Code',
        required: true,
        type: 'string',
        maxLength: 50,
        pattern: '^[A-Z0-9_-]+$',
        description: 'Unique code for the location',
        example: 'WARD_A1',
      },
      {
        name: 'location_name_th',
        displayName: 'Location Name (Thai)',
        required: true,
        type: 'string',
        maxLength: 255,
        description: 'Thai name of the location',
        example: 'ห้องเก็บยา ชั้น 1',
      },
      {
        name: 'department_id',
        displayName: 'Department ID',
        required: true,
        type: 'string',
        description: 'UUID of the department this location belongs to',
        example: 'a1b2c3d4-...',
      },
      {
        name: 'capacity_kg',
        displayName: 'Capacity (kg)',
        required: false,
        type: 'number',
        minValue: 0,
        maxValue: 100000,
        description: 'Storage capacity in kilograms',
        example: '1000',
      },
      {
        name: 'storage_condition',
        displayName: 'Storage Condition',
        required: true,
        type: 'string',
        enumValues: ['room_temp', 'refrigerated', 'frozen'],
        description: 'Temperature condition for storage',
        example: 'room_temp',
      },
    ];
  }

  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // 1. Check for duplicate location code
    const existing = await this.repository.findByCode(row.location_code);
    if (existing) {
      errors.push({
        row: rowNumber,
        field: 'location_code',
        message: `Location code '${row.location_code}' already exists`,
        severity: 'ERROR',
        code: 'DUPLICATE_CODE',
      });
    }

    // 2. Verify department exists (dependency validation)
    const department = await this.db('departments').where('id', row.department_id).first();
    if (!department) {
      errors.push({
        row: rowNumber,
        field: 'department_id',
        message: `Department with ID '${row.department_id}' not found. Import departments first.`,
        severity: 'ERROR',
        code: 'MISSING_DEPENDENCY',
      });
    }

    // 3. Validate storage condition enum
    if (row.storage_condition && !['room_temp', 'refrigerated', 'frozen'].includes(row.storage_condition)) {
      errors.push({
        row: rowNumber,
        field: 'storage_condition',
        message: `Invalid storage condition. Must be: room_temp, refrigerated, or frozen`,
        severity: 'ERROR',
        code: 'INVALID_ENUM',
      });
    }

    // 4. Validate numeric fields
    if (row.capacity_kg !== undefined && row.capacity_kg !== null) {
      const capacity = Number(row.capacity_kg);
      if (isNaN(capacity) || capacity < 0) {
        errors.push({
          row: rowNumber,
          field: 'capacity_kg',
          message: 'Capacity must be a positive number',
          severity: 'ERROR',
          code: 'INVALID_NUMBER',
        });
      }
    }

    // 5. Warning if capacity is very large
    if (row.capacity_kg && Number(row.capacity_kg) > 50000) {
      errors.push({
        row: rowNumber,
        field: 'capacity_kg',
        message: 'Capacity exceeds 50,000 kg. Please verify this is correct.',
        severity: 'WARNING',
        code: 'UNUSUAL_VALUE',
      });
    }

    return errors;
  }
}
```

## Service with Dependencies

### Budget Planning Service (Multiple Dependencies)

```typescript
@ImportService({
  module: 'budget_allocations',
  domain: 'inventory',
  subdomain: 'operations',
  displayName: 'Budget Allocations (การจัดสรรงบประมาณ)',
  description: 'Quarterly budget allocations by department and drug',
  dependencies: [
    'departments', // Must exist
    'drug_generics', // Must exist
    'budget_plans', // Must exist and be imported first
  ],
  priority: 5, // Import after budget_plans (priority 4)
  tags: ['operations', 'budget', 'planning'],
  supportsRollback: true,
  version: '1.0.0',
})
export class BudgetAllocationsImportService extends BaseImportService<BudgetAllocation> {
  constructor(
    private db: Knex,
    private fastify: FastifyInstance,
  ) {
    super();
    this.repository = new BudgetAllocationsRepository(db);
  }

  getTemplateColumns(): TemplateColumn[] {
    return [
      {
        name: 'budget_plan_id',
        displayName: 'Budget Plan ID',
        required: true,
        type: 'string',
        description: 'UUID of the budget plan',
      },
      {
        name: 'department_id',
        displayName: 'Department ID',
        required: true,
        type: 'string',
        description: 'UUID of the department',
      },
      {
        name: 'generic_id',
        displayName: 'Generic Drug ID',
        required: true,
        type: 'string',
        description: 'UUID of the generic drug',
      },
      {
        name: 'quarter_number',
        displayName: 'Quarter',
        required: true,
        type: 'number',
        minValue: 1,
        maxValue: 4,
        description: 'Quarter number (1-4)',
      },
      {
        name: 'allocated_amount',
        displayName: 'Allocated Amount (THB)',
        required: true,
        type: 'number',
        minValue: 0,
        description: 'Amount in Thai Baht',
      },
    ];
  }

  async validateRow(row: any, rowNumber: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate budget plan exists
    const budgetPlan = await this.db('budget_plans').where('id', row.budget_plan_id).first();
    if (!budgetPlan) {
      errors.push({
        row: rowNumber,
        field: 'budget_plan_id',
        message: 'Budget plan not found. Import budget plans first.',
        severity: 'ERROR',
        code: 'MISSING_DEPENDENCY',
      });
    }

    // Validate department exists
    const department = await this.db('departments').where('id', row.department_id).first();
    if (!department) {
      errors.push({
        row: rowNumber,
        field: 'department_id',
        message: 'Department not found',
        severity: 'ERROR',
        code: 'MISSING_DEPENDENCY',
      });
    }

    // Validate generic drug exists
    const generic = await this.db('drug_generics').where('id', row.generic_id).first();
    if (!generic) {
      errors.push({
        row: rowNumber,
        field: 'generic_id',
        message: 'Generic drug not found. Import drugs first.',
        severity: 'ERROR',
        code: 'MISSING_DEPENDENCY',
      });
    }

    // Validate quarter number
    const quarter = Number(row.quarter_number);
    if (isNaN(quarter) || quarter < 1 || quarter > 4) {
      errors.push({
        row: rowNumber,
        field: 'quarter_number',
        message: 'Quarter must be 1, 2, 3, or 4',
        severity: 'ERROR',
        code: 'INVALID_ENUM',
      });
    }

    // Check for duplicates
    const existing = await this.db('budget_allocations')
      .where({
        budget_plan_id: row.budget_plan_id,
        department_id: row.department_id,
        generic_id: row.generic_id,
        quarter_number: quarter,
      })
      .first();
    if (existing) {
      errors.push({
        row: rowNumber,
        field: 'budget_plan_id',
        message: 'Allocation for this budget plan, department, drug, and quarter already exists',
        severity: 'ERROR',
        code: 'DUPLICATE_RECORD',
      });
    }

    return errors;
  }
}
```

## Registry Queries

### Complete Registry Usage Examples

```typescript
import { getImportServiceRegistry, getRegisteredImportServices, getServiceMetadata, getServiceInstance, getAllRegisteredServices } from '@/core/import';

// Get the global registry singleton
const registry = getImportServiceRegistry();

// ===== Query Examples =====

// 1. Get all registered service metadata
const allServices = getRegisteredImportServices();
console.log(`Total services: ${allServices.length}`);
allServices.forEach((service) => {
  console.log(`- ${service.module}: ${service.displayName} (priority ${service.priority})`);
});

// 2. Get specific service metadata
const drugGenericsMeta = getServiceMetadata('drug_generics');
console.log(`Module: ${drugGenericsMeta?.module}`);
console.log(`Display Name: ${drugGenericsMeta?.displayName}`);
console.log(`Dependencies: ${drugGenericsMeta?.dependencies.join(', ')}`);
console.log(`Tags: ${drugGenericsMeta?.tags.join(', ')}`);
console.log(`Supports Rollback: ${drugGenericsMeta?.supportsRollback}`);
console.log(`Version: ${drugGenericsMeta?.version}`);

// 3. Get service instance
const drugGenericsService = getServiceInstance('drug_generics');
if (drugGenericsService) {
  // Use the service
  const metadata = drugGenericsService.getMetadata();
  const columns = drugGenericsService.getTemplateColumns();
  const template = await drugGenericsService.generateTemplate('csv');
}

// 4. Get all services with instances (fully initialized)
const initializedServices = getAllRegisteredServices();
initializedServices.forEach(({ metadata, instance, filePath }) => {
  console.log(`Service: ${metadata.module}`);
  console.log(`Instance available: ${instance !== undefined}`);
  console.log(`File: ${filePath}`);
});

// 5. Query by domain
const inventoryServices = registry.getServicesByDomain('inventory');
console.log(`Inventory services: ${inventoryServices.map((s) => s.module).join(', ')}`);

const coreServices = registry.getServicesByDomain('core');
console.log(`Core services: ${coreServices.map((s) => s.module).join(', ')}`);

// 6. Query by tag
const masterDataServices = registry.getServicesByTag('master-data');
console.log(`Master data services: ${masterDataServices.length}`);

const requiredServices = registry.getServicesByTag('required');
console.log(`Required services: ${requiredServices.map((s) => s.module).join(', ')}`);

// 7. Sort by priority (1 = import first)
const importOrder = registry.getServicesByPriority();
console.log('Import order:');
importOrder.forEach((service, index) => {
  console.log(`${index + 1}. ${service.module} (priority ${service.priority})`);
});

// 8. Count services
const totalCount = registry.getServiceCount();
console.log(`Total services: ${totalCount}`);

// 9. Check if service exists
if (registry.hasService('drug_generics')) {
  console.log('Drug generics service is registered');
}

if (registry.hasInstance('drug_generics')) {
  console.log('Drug generics instance is available');
}

// 10. Get detailed statistics
const stats = registry.getStats();
console.log(`Total services: ${stats.totalServices}`);
console.log(`Instantiated: ${stats.instantiatedServices}`);
console.log(`Domains: ${stats.domains.join(', ')}`);
console.log(`Tags: ${stats.tags.join(', ')}`);
console.log(`By priority:`);
stats.byPriority.forEach((service) => {
  console.log(`  - ${service.module}: ${service.displayName}`);
});
```

## Runtime Metadata Access

### Class Reflection Examples

```typescript
import { getImportServiceMetadata, isImportService } from '@/core/import';
import { DrugGenericsImportService } from './services/drug-generics-import.service';

// Check if a class is decorated with @ImportService
if (isImportService(DrugGenericsImportService)) {
  console.log('This is an import service');
}

// Get metadata from the class
const metadata = getImportServiceMetadata(DrugGenericsImportService);
if (metadata) {
  console.log(`Module: ${metadata.module}`);
  console.log(`Domain: ${metadata.domain}`);
  console.log(`Subdomain: ${metadata.subdomain}`);
  console.log(`Display Name: ${metadata.displayName}`);
  console.log(`Description: ${metadata.description}`);
  console.log(`Dependencies: ${metadata.dependencies.join(', ')}`);
  console.log(`Priority: ${metadata.priority}`);
  console.log(`Tags: ${metadata.tags.join(', ')}`);
  console.log(`Supports Rollback: ${metadata.supportsRollback}`);
  console.log(`Version: ${metadata.version}`);

  // Access the class constructor for instantiation
  if (metadata.target) {
    const instance = new metadata.target(db, fastify);
    const templateColumns = instance.getTemplateColumns();
  }
}

// Generic function to check and process any class
function processIfImportService(cls: any): void {
  if (!isImportService(cls)) {
    console.log('Not an import service');
    return;
  }

  const metadata = getImportServiceMetadata(cls);
  console.log(`Processing: ${metadata!.module}`);

  // Continue with service-specific logic
}

processIfImportService(DrugGenericsImportService);
```

## Error Handling

### Decorator Validation Errors

```typescript
// These will throw errors during class definition:

// ❌ Missing module
@ImportService({
  domain: 'inventory',
  displayName: 'Test',
  dependencies: [],
  priority: 1,
  tags: [],
  supportsRollback: false,
  version: '1.0.0',
  // Error: "module" is required and must be a string
})
class TestService {}

// ❌ Missing domain
@ImportService({
  module: 'test',
  displayName: 'Test',
  dependencies: [],
  priority: 1,
  tags: [],
  supportsRollback: false,
  version: '1.0.0',
  // Error: "domain" is required and must be a string
})
class TestService {}

// ❌ Invalid priority
@ImportService({
  module: 'test',
  domain: 'inventory',
  displayName: 'Test',
  dependencies: [],
  priority: -1, // Invalid: must be non-negative
  tags: [],
  supportsRollback: false,
  version: '1.0.0',
  // Error: priority must be a non-negative integer
})
class TestService {}

// ❌ Invalid version format (warning, not error)
@ImportService({
  module: 'test',
  domain: 'inventory',
  displayName: 'Test',
  dependencies: [],
  priority: 1,
  tags: [],
  supportsRollback: false,
  version: '1', // Warning: should follow semantic versioning (x.y.z)
})
class TestService {}

// ✅ Correct implementation
@ImportService({
  module: 'test',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Test Service',
  description: 'Test service for demonstration',
  dependencies: [],
  priority: 1,
  tags: ['test', 'master-data'],
  supportsRollback: true,
  version: '1.0.0',
})
class TestService extends BaseImportService<any> {
  // Implementation...
}
```

## Summary

The @ImportService decorator provides:

1. **Type-Safe** - Zero `any` types, full TypeScript support
2. **Self-Registering** - Automatic global registry updates
3. **Validated** - All metadata fields validated at decorator time
4. **Queryable** - Powerful registry queries for discovery
5. **Reflectable** - Runtime metadata access via Reflect API
6. **Documented** - Comprehensive JSDoc comments

Use it to implement import services for any data import scenario!
