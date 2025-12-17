# AegisX Claude Code Skills - Master Plan

> **Opus Supervisor Analysis** - Plan for creating 4 essential development skills

---

## Executive Summary

This document outlines the comprehensive plan for creating 4 Claude Code skills that will serve as the **single source of truth** for all development work on the AegisX platform. Each skill is designed to integrate with existing tools (aegisx-cli, aegisx-mcp, spec-workflow) and provide complete workflow guidance.

---

## Skill 1: aegisx-development-workflow

### Complexity Level: **Complex (Opus level)**

### Purpose

The **master orchestration skill** that coordinates the complete development workflow from idea to production. This skill acts as the central hub that:

- Guides developers through the complete feature lifecycle
- Integrates all other skills at appropriate points
- Coordinates between backend and frontend development
- Ensures quality gates are met at each phase

### When to Use

- Starting a new feature from scratch
- Resuming work on an existing feature
- User asks "how do I build [feature]?"
- User mentions "create", "develop", "implement", "build" for a new feature
- When multi-step coordination is needed

### Key Sections

#### 1. Phase 0: Planning & Spec (Optional but Recommended)

```
Integration Point: spec-workflow MCP tools
- Use spec-workflow-guide for complex features
- Create requirements.md, design.md, tasks.md
- Get approvals through dashboard
```

#### 2. Phase 1: Database First

```
Steps:
1. Design database schema
2. Create Knex migration
3. Run migration: pnpm run db:migrate
4. Verify with: pnpm run crud:list

Integration: Skill typebox-schema-generator (auto-invoked after migration)
```

#### 3. Phase 2: Backend Generation

```
Decision Tree for Package Selection:
- Simple CRUD only? → standard
- Need Excel/CSV import? → enterprise
- Need real-time updates? → full

Domain Selection:
- Reference/lookup data? → master-data
- Transactional data? → operations

Command Builder: Use aegisx-mcp tool aegisx_crud_build_command
```

#### 4. Phase 3: Backend Customization

```
Integration Point: Skill backend-customization-guide
- Add business logic to service layer
- Create custom endpoints beyond CRUD
- Implement advanced validations
- Add authorization rules
```

#### 5. Phase 4: Backend Verification

```
Integration Point: Skill api-endpoint-tester
- Test all generated endpoints
- Verify authentication works
- Check error responses
```

#### 6. Phase 5: Frontend Generation

```
Command: ./bin/cli.js generate TABLE --target frontend [--shell SHELL]
- Generate after backend is complete and tested
- Choose appropriate shell for route registration
```

#### 7. Phase 6: Frontend Integration

```
Integration Point: Skill frontend-integration-guide
- Customize generated components
- Add business-specific UI logic
- Integrate with AegisX UI components
```

#### 8. Phase 7: Quality Assurance

```
- Run pnpm run build (must pass)
- Test complete CRUD flow manually
- Verify loading states and error handling
```

### Workflow Diagram

```
[Spec] → [Migration] → [CRUD Gen Backend] → [Customize Backend] → [Test API]
                                                        ↓
                                   [Frontend Gen] ← [Customize Frontend] ← [Integration Test]
```

### Integration with Other Skills

| Phase | Integrated Skill            | When Invoked                   |
| ----- | --------------------------- | ------------------------------ |
| 1     | typebox-schema-generator    | After migration, before routes |
| 3     | backend-customization-guide | When adding business logic     |
| 4     | api-endpoint-tester         | After backend complete         |
| 5     | api-contract-generator      | To document new APIs           |
| 6     | frontend-integration-guide  | When customizing frontend      |

### Agent Assignment: **Opus**

- Requires complex decision making
- Must coordinate multiple phases
- Needs to understand context and make judgment calls
- Integrates with spec-workflow for planning

---

## Skill 2: crud-generator-guide

### Complexity Level: **Medium (Sonnet level)**

### Purpose

Complete guide for using the AegisX CRUD generator effectively. Helps developers:

- Choose the right package (standard/enterprise/full)
- Understand domain architecture (master-data vs operations)
- Execute generation commands correctly
- Handle post-generation customization

### When to Use

- User asks about "CRUD generator", "generate module", "aegisx-cli"
- User wants to create a new feature for an existing table
- User is confused about packages or domains
- User asks "how do I use pnpm run crud"

### Key Sections

#### 1. Package Selection Decision Tree

```
Do you need Excel/CSV import?
├── Yes → Do you need real-time WebSocket events?
│         ├── Yes → full package
│         └── No → enterprise package
└── No → Do you need real-time WebSocket events?
          ├── Yes → enterprise + --with-events
          └── No → standard package
```

#### 2. Domain Classification Rules

```
Master-Data (inventory/master-data):
✅ Lookup/reference data
✅ Rarely changes
✅ Used in dropdowns
✅ Referenced by FK from other tables
Examples: budget_types, departments, drug_generics

Operations (inventory/operations):
✅ Transactional data
✅ Changes frequently
✅ Has state/status fields
✅ References master-data
Examples: budget_allocations, inventory_transactions
```

#### 3. Command Reference

```bash
# Standard CRUD
pnpm run crud -- TABLE_NAME --force

# With import
pnpm run crud:import -- TABLE_NAME --force

# With events
pnpm run crud:events -- TABLE_NAME --force

# Full package
pnpm run crud:full -- TABLE_NAME --force

# Domain-specific generation
pnpm run crud -- TABLE --domain inventory/master-data --schema inventory --force

# Frontend generation (after backend)
./bin/cli.js generate TABLE --target frontend --force
./bin/cli.js generate TABLE --target frontend --shell system --force
```

#### 4. Common Mistakes Prevention

- Missing `--` separator with pnpm
- Frontend before backend
- Wrong domain selection
- Forgetting --force flag

#### 5. Post-Generation Checklist

```
Backend:
□ Verify routes registered in index.ts
□ Check schemas compile: pnpm run build
□ Test endpoints work

Frontend:
□ Routes added to shell routes
□ Service URLs correct (/api prefix)
□ Build passes
```

### MCP Integration

```typescript
// Use these aegisx-mcp tools:
aegisx_crud_build_command; // Build correct command
aegisx_crud_packages; // Package info
aegisx_crud_files; // See generated files
aegisx_crud_workflow; // Get complete workflow
```

### Agent Assignment: **Sonnet**

- Clear decision trees
- Well-defined rules
- Standard command patterns
- Can follow documentation

---

## Skill 3: backend-customization-guide

### Complexity Level: **Medium (Sonnet level)**

### Purpose

Guide for customizing generated backend code beyond basic CRUD. Covers:

- Adding business logic to services
- Creating custom endpoints
- Implementing complex validations
- Extending repositories with custom queries

### When to Use

- User needs endpoints beyond standard CRUD
- User asks to "add validation", "business logic", "custom endpoint"
- After CRUD generation when customization is needed
- User mentions specific business rules to implement

### Key Sections

#### 1. Service Layer Customization

```typescript
// Location: apps/api/src/modules/[module]/[module].service.ts

// Pattern: Add business logic BEFORE calling repository
export class ProductService {
  constructor(private repository: ProductRepository) {}

  async create(data: CreateProductDto, userId: string): Promise<Product> {
    // 1. Business validation
    await this.validateBusinessRules(data);

    // 2. Transform/enrich data
    const enrichedData = await this.enrichWithDefaults(data, userId);

    // 3. Call repository
    return this.repository.create(enrichedData);
  }

  private async validateBusinessRules(data: CreateProductDto): Promise<void> {
    // Custom validation logic
    if (data.price < 0) {
      throw new BusinessError('Price cannot be negative');
    }
  }
}
```

#### 2. Adding Custom Endpoints

```typescript
// Location: apps/api/src/modules/[module]/[module].routes.ts

// Pattern: Add routes in the routes file with schema
fastify.route({
  method: 'POST',
  url: '/calculate-total',
  schema: {
    description: 'Calculate total for order',
    tags: ['Products'],
    body: CalculateTotalSchema,
    response: {
      200: TotalResponseSchema,
      400: ErrorSchema,
    },
  },
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    const result = await fastify.productService.calculateTotal(request.body);
    return reply.success(result);
  },
});
```

#### 3. Repository Extensions

```typescript
// Location: apps/api/src/modules/[module]/[module].repository.ts

// Pattern: Extend BaseRepository with custom queries
export class ProductRepository extends BaseRepository<Product> {
  // Inherited: findAll, findById, create, update, delete

  // Add custom methods
  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.knex(this.tableName).where('category_id', categoryId).where('is_active', true);
  }

  async getStatistics(): Promise<ProductStats> {
    const stats = await this.knex(this.tableName).select(this.knex.raw('COUNT(*) as total'), this.knex.raw('SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active')).first();
    return stats;
  }
}
```

#### 4. Advanced Validation Patterns

```typescript
// TypeBox schema with custom validation
const CreateProductSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  price: Type.Number({ minimum: 0 }),
  sku: Type.String({
    pattern: '^[A-Z]{3}-[0-9]{4}$',
    description: 'Format: XXX-0000'
  }),
});

// Service-level validation
async validateUniqueConstraints(data: CreateProductDto): Promise<void> {
  const existing = await this.repository.findBySku(data.sku);
  if (existing) {
    throw new ConflictError('SKU_EXISTS', 'Product with this SKU already exists');
  }
}
```

#### 5. Authorization Patterns

```typescript
// Route-level authorization
preHandler: fastify.auth([
  fastify.verifyJWT,
  fastify.verifyRole(['admin', 'manager']),
]),

// Resource-level authorization in service
async update(id: string, data: UpdateDto, userId: string): Promise<Product> {
  const existing = await this.repository.findById(id);

  // Check ownership or admin role
  if (existing.createdBy !== userId && !this.isAdmin(userId)) {
    throw new ForbiddenError('Cannot update other users\' products');
  }

  return this.repository.update(id, data);
}
```

### MCP Integration

```typescript
// Use these patterns from aegisx-mcp:
aegisx_patterns_get('Service Layer Pattern');
aegisx_patterns_get('Repository with UUID Validation');
aegisx_patterns_get('Auth Middleware Pattern');
```

### Agent Assignment: **Sonnet**

- Clear patterns to follow
- Well-documented approaches
- Standard TypeScript/Fastify patterns

---

## Skill 4: frontend-integration-guide

### Complexity Level: **Simple-Medium (Haiku/Sonnet level)**

### Purpose

Guide for integrating frontend with generated backend. Covers:

- Angular Signals-based patterns
- AegisX UI component integration
- Dialog component patterns
- List with filters pattern

### When to Use

- After frontend generation when customization needed
- User asks about "Angular", "frontend", "UI component"
- User needs to integrate with AegisX UI components
- User asks about signals, state management

### Key Sections

#### 1. Signal-Based State Management

```typescript
// Location: apps/web/src/app/features/[module]/services/

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/v1/products';

  // State signals
  private _state = signal<ProductsState>({
    items: [],
    loading: false,
    error: null,
  });

  // Read-only accessors
  readonly items = () => this._state().items;
  readonly loading = () => this._state().loading;
  readonly error = () => this._state().error;

  // Computed signals
  readonly activeItems = computed(() => this.items().filter((item) => item.isActive));

  // Methods
  loadItems(): Observable<Product[]> {
    this._state.update((s) => ({ ...s, loading: true }));

    return this.http.get<ApiResponse<Product[]>>(this.baseUrl).pipe(
      tap((response) => {
        this._state.update((s) => ({
          ...s,
          items: response.data,
          loading: false,
        }));
      }),
      catchError((error) => {
        this._state.update((s) => ({ ...s, loading: false, error: error.message }));
        return throwError(() => error);
      }),
    );
  }
}
```

#### 2. Component Pattern with Signals

```typescript
@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, ...MaterialModules, ...AegisXComponents],
  template: `
    @if (loading()) {
      <ax-skeleton type="table" [lines]="5"></ax-skeleton>
    } @else {
      <div class="grid gap-4">
        @for (product of filteredProducts(); track product.id) {
          <ax-card [title]="product.name">
            <ax-badge [color]="product.isActive ? 'success' : 'error'">
              {{ product.isActive ? 'Active' : 'Inactive' }}
            </ax-badge>
          </ax-card>
        } @empty {
          <p>No products found</p>
        }
      </div>
    }
  `,
})
export class ProductsListComponent {
  private service = inject(ProductsService);

  // Use service signals directly
  loading = this.service.loading;
  items = this.service.items;

  // Local computed
  filteredProducts = computed(() => this.items().filter((p) => p.isActive));

  ngOnInit() {
    this.service.loadItems().subscribe();
  }
}
```

#### 3. Dialog Pattern (MANDATORY Structure)

```typescript
@Component({
  template: `
    <div class="product-dialog">
      <!-- Header - MANDATORY Structure -->
      <div mat-dialog-title class="flex items-center justify-between pb-4 border-b">
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl text-blue-600">add_circle</mat-icon>
          <h2 class="text-xl font-semibold m-0">Create Product</h2>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <mat-dialog-content class="py-6">
        <form [formGroup]="form">
          <!-- Form fields -->
        </form>
      </mat-dialog-content>

      <!-- Actions -->
      <mat-dialog-actions class="flex justify-end gap-2 pt-4 border-t">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()">
          <mat-icon>save</mat-icon>
          Save
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class ProductDialogComponent {
  private dialogRef = inject(MatDialogRef<ProductDialogComponent>);
  private service = inject(ProductsService);

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  onSave() {
    if (this.form.valid) {
      this.service.create(this.form.value).subscribe({
        next: (result) => this.dialogRef.close(result),
        error: (error) => console.error(error),
      });
    }
  }
}
```

#### 4. AegisX UI Component Integration

```typescript
// Import AegisX components
import {
  BreadcrumbComponent,
  BadgeComponent,
  CardComponent,
  SkeletonComponent,
  AlertComponent,
} from '@aegisx/ui';

@Component({
  imports: [
    // Angular Material
    MatTableModule,
    MatButtonModule,
    // AegisX UI
    BreadcrumbComponent,
    BadgeComponent,
    CardComponent,
  ],
  template: `
    <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>

    <ax-card title="Products" [loading]="loading()">
      <mat-table [dataSource]="dataSource">
        <!-- columns -->
      </mat-table>
    </ax-card>
  `,
})
```

#### 5. List + Filters Pattern

```typescript
@Component({
  template: `
    <div class="products-page p-6 space-y-6">
      <!-- Breadcrumb -->
      <ax-breadcrumb [items]="breadcrumbs"></ax-breadcrumb>

      <!-- Header with actions -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Products</h1>
        <button mat-raised-button color="primary" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          Add Product
        </button>
      </div>

      <!-- Filters -->
      <mat-card>
        <mat-card-content class="flex gap-4">
          <mat-form-field>
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)">
          </mat-form-field>
          <mat-form-field>
            <mat-label>Status</mat-label>
            <mat-select [(value)]="statusFilter" (selectionChange)="onFilter()">
              <mat-option value="">All</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Table -->
      <mat-card>
        @if (loading()) {
          <ax-inner-loading></ax-inner-loading>
        } @else {
          <table mat-table [dataSource]="dataSource" matSort>
            <!-- columns definition -->
          </table>
          <mat-paginator [pageSizeOptions]="[10, 25, 50]"></mat-paginator>
        }
      </mat-card>
    </div>
  `,
})
```

### MCP Integration

```typescript
// Use these from aegisx-mcp:
aegisx_components_list(); // List all AegisX UI components
aegisx_components_get('Badge'); // Get component details
aegisx_patterns_get('Angular Signal-based Component');
aegisx_patterns_get('AegisX UI Integration');
```

### Agent Assignment: **Sonnet** (mostly patterns) or **Haiku** (simple template copying)

- Clear templates to follow
- Well-defined patterns
- Standard Angular practices

---

## Implementation Order

### Phase 1: Foundation (High Priority)

1. **aegisx-development-workflow** - Master skill that coordinates everything
2. **crud-generator-guide** - Most commonly used, reduces confusion

### Phase 2: Customization (Medium Priority)

3. **backend-customization-guide** - Needed after CRUD generation
4. **frontend-integration-guide** - Needed for UI work

---

## Skill File Structure

Each skill should have:

```
.claude/skills/{skill-name}/
├── SKILL.md          # Main skill instructions (required)
├── README.md         # Human-readable documentation
├── REFERENCE.md      # Quick reference tables (optional)
└── scripts/          # Helper scripts (optional)
    └── *.sh          # Verification scripts
```

### SKILL.md Format

```markdown
---
name: skill-name
description: Brief description of when to use this skill
allowed-tools: Read, Grep, Glob, Write, Bash
---

# Skill Name

[Main instructions...]

## When Claude Should Use This Skill

[Trigger conditions...]

## Process

[Step-by-step guide...]

## Examples

[Concrete examples...]

## Related Skills

[Cross-references...]
```

---

## Dependencies Between Skills

```
                    aegisx-development-workflow (Master)
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   crud-generator      backend-customization   frontend-integration
       guide                 guide                  guide
          │                   │                     │
          └───────────────────┴─────────────────────┘
                              │
                              ▼
                     Existing Skills:
                  - typebox-schema-generator
                  - api-contract-generator
                  - api-contract-validator
                  - api-endpoint-tester
```

---

## Success Metrics

After implementing these skills, Claude should be able to:

1. **Guide complete feature development** from database to UI
2. **Make correct decisions** about packages and domains without user input
3. **Generate correct commands** every time (no more missing `--` separators)
4. **Customize generated code** following established patterns
5. **Integrate with AegisX UI** correctly using proper components
6. **Follow project standards** for dialogs, services, and components

---

## Next Steps

1. Create aegisx-development-workflow skill (Opus assignment)
2. Create crud-generator-guide skill (Sonnet assignment)
3. Create backend-customization-guide skill (Sonnet assignment)
4. Create frontend-integration-guide skill (Haiku/Sonnet assignment)
5. Test integration by having Claude develop a sample feature
6. Iterate based on usage patterns

---

**Document Version:** 1.0
**Created:** 2025-12-17
**Supervisor:** Opus 4.5
