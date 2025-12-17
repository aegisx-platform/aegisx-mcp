# Frontend Integration Guide

Guide for customizing and integrating Angular frontend code with generated backend APIs. Provides reusable patterns for services, components, dialogs, and AegisX UI integration.

## What This Skill Does

Claude will **automatically use this skill** when you:

- Ask to "customize frontend", "implement UI", or "integrate backend API"
- Request help with "signals", "services", or "state management"
- Need to "create dialog", "build list component", or "setup filters"
- Ask about "AegisX UI components" or Angular patterns
- Want examples of "standalone components" or "reactive forms"

## Core Patterns

### 1. Signal-Based Service Pattern

All services use Angular Signals for reactive state management:

```typescript
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  // Private signals
  private _state = signal<ProductsState>({
    items: [],
    loading: false,
    error: null,
  });

  // Public read-only signals
  readonly items = computed(() => this._state().items);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  // Methods that update signals
  loadItems(): Observable<Product[]> {
    this._state.update((s) => ({ ...s, loading: true }));

    return this.http.get<ApiResponse<Product[]>>('/api/v1/products').pipe(
      tap((response) => {
        this._state.update((s) => ({
          ...s,
          items: response.data,
          loading: false,
        }));
      }),
    );
  }
}
```

### 2. List Component with Signals

Components inject services and use signals directly in templates:

```typescript
@Component({
  selector: 'app-products-list',
  template: `
    @if (service.loading()) {
      <mat-spinner></mat-spinner>
    } @else if (service.items().length === 0) {
      <ax-empty-state title="No products"></ax-empty-state>
    } @else {
      <table mat-table [dataSource]="service.items()">
        <!-- Table columns -->
      </table>
    }
  `,
})
export class ProductsListComponent {
  protected service = inject(ProductsService);

  ngOnInit(): void {
    this.service.loadItems().subscribe();
  }
}
```

### 3. Dialog Component with Forms

Dialog components use reactive forms and proper structure:

```typescript
@Component({
  template: `
    <div>
      <!-- Header - MANDATORY Structure -->
      <div mat-dialog-title class="flex items-center justify-between pb-4 border-b">
        <div class="flex items-center gap-3">
          <mat-icon>{{ mode === 'create' ? 'add_circle' : 'edit' }}</mat-icon>
          <h2 class="text-xl font-semibold m-0">
            {{ mode === 'create' ? 'Create' : 'Edit' }}
          </h2>
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
        <button mat-raised-button color="primary" (click)="onSave()">Save</button>
      </mat-dialog-actions>
    </div>
  `,
})
export class ProductFormDialogComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  onSave(): void {
    if (this.form.valid) {
      this.service.create(this.form.value).subscribe(
        (result) => this.dialogRef.close(result),
        (error) => console.error(error),
      );
    }
  }
}
```

### 4. AegisX UI Integration

Combine Material Design with AegisX components:

```html
<!-- Breadcrumb -->
<ax-breadcrumb
  [items]="[
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Products', active: true }
  ]"
></ax-breadcrumb>

<!-- Card with loading -->
<ax-card title="Products" [loading]="loading()">
  @if (items().length === 0) {
  <ax-empty-state title="No products" description="Create your first product"></ax-empty-state>
  }
</ax-card>

<!-- Error handling -->
@if (error()) {
<ax-error-state [title]="'Error loading'" [description]="error()"></ax-error-state>
}

<!-- Badges for status -->
<ax-badge [color]="active ? 'success' : 'error'"> {{ active ? 'Active' : 'Inactive' }} </ax-badge>
```

## Quick Start Examples

### Example 1: Create a Simple List Component

```
User: "Create a list component for products with search and filters"

Claude will:
1. Create ProductsListComponent with MatTable
2. Add search form field
3. Add status filter dropdown
4. Integrate ax-card and ax-empty-state
5. Show pagination
6. Add action buttons (Create, Edit, Delete)
```

### Example 2: Implement Service with Signals

```
User: "Setup a products service with signals for loading, items, and errors"

Claude will:
1. Create ProductsService with @Injectable
2. Define private _state signal
3. Create public computed signals for items, loading, error
4. Implement loadItems() with error handling
5. Add create, update, delete methods
6. Show how to use in components
```

### Example 3: Create Dialog for Create/Edit

```
User: "Create a product form dialog with validation"

Claude will:
1. Create ProductFormDialogComponent
2. Build reactive form with validators
3. Implement MANDATORY dialog structure
4. Add save button with loading state
5. Show error feedback
6. Handle both create and edit modes
```

### Example 4: Add Filters Component

```
User: "Add advanced filters for the products list"

Claude will:
1. Create ProductsListFiltersComponent
2. Add search field with clear button
3. Add status dropdown
4. Add sort options
5. Add reset filters button
6. Hook up to service filter state
```

## File Structure

### Typical Feature Module

```
apps/web/src/app/features/products/
├── components/
│   ├── product-form-dialog/
│   │   ├── product-form-dialog.component.ts
│   │   └── product-form-dialog.component.html
│   ├── products-list.component.ts
│   ├── products-list-filters.component.ts
│   └── products-list-header.component.ts
├── services/
│   ├── products.service.ts
│   └── products-ui.service.ts
├── types/
│   └── products.types.ts
└── products.routes.ts
```

## Service Architecture

### API Service (Data Layer)

Handles HTTP communication with backend:

```typescript
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private _items = signal<Product[]>([]);
  private _loading = signal(false);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadItems(): Observable<Product[]> {
    this._loading.set(true);
    return this.http.get<ApiResponse<Product[]>>('/api/v1/products').pipe(
      tap((response) => {
        this._items.set(response.data);
        this._loading.set(false);
      }),
      catchError((error) => {
        this._loading.set(false);
        return throwError(() => error);
      }),
    );
  }
}
```

### UI Service (Presentation Layer)

Manages filter state and selection:

```typescript
@Injectable({ providedIn: 'root' })
export class ProductsUIService {
  private _filterState = signal<FilterState>({
    searchTerm: '',
    isActive: null,
    page: 1,
    pageSize: 25,
  });

  readonly filterState = this._filterState.asReadonly();

  updateFilter(key: string, value: any): void {
    this._filterState.update((s) => ({
      ...s,
      [key]: value,
      page: 1, // Reset to first page
    }));
  }
}
```

## Component Template Patterns

### Data Table with Sorting

```html
<table mat-table [dataSource]="dataSource" matSort>
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Product Name</th>
    <td mat-cell *matCellDef="let element">{{ element.name }}</td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
</table>
```

### Conditional Rendering

```html
<!-- Using @if -->
@if (loading()) {
<mat-spinner></mat-spinner>
} @else if (items().length === 0) {
<ax-empty-state></ax-empty-state>
} @else {
<table mat-table [dataSource]="items()"></table>
}

<!-- Using @for -->
@for (item of items(); track item.id) {
<div>{{ item.name }}</div>
} @empty {
<p>No items</p>
}
```

### Form Validation Display

```html
<mat-form-field>
  <mat-label>Product Name</mat-label>
  <input matInput formControlName="name" required />
  @if (form.get('name')?.hasError('required')) {
  <mat-error>Product name is required</mat-error>
  } @if (form.get('name')?.hasError('minlength')) {
  <mat-error>Minimum 3 characters required</mat-error>
  }
</mat-form-field>
```

## Dependency Injection Pattern

Modern Angular uses `inject()` function:

```typescript
export class ProductsListComponent {
  // Inject service
  private service = inject(ProductsService);

  // Inject dialog
  private dialog = inject(MatDialog);

  // Inject form builder
  private fb = inject(FormBuilder);

  // Use injected dependencies
  ngOnInit(): void {
    this.service.loadItems().subscribe();
  }
}
```

## Error Handling Patterns

### In Service

```typescript
create(data: CreateProductDto): Observable<Product> {
  return this.http.post<ApiResponse<Product>>('/api/v1/products', data)
    .pipe(
      tap(response => {
        this._items.update(s => [...s, response.data]);
      }),
      catchError(error => {
        const errorMsg = error.error?.message || 'Failed to create';
        this._error.set(errorMsg);
        return throwError(() => error);
      })
    );
}
```

### In Component

```typescript
onSave(): void {
  this.service.create(this.form.value).subscribe({
    next: (result) => {
      this.dialogRef.close(result);
    },
    error: (err) => {
      const message = err.error?.message || 'Operation failed';
      this.snackBar.open(message, 'Close', { duration: 5000 });
    },
  });
}
```

## Material + AegisX UI Imports

```typescript
// Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

// AegisX UI
import {
  BreadcrumbComponent,
  CardComponent,
  EmptyStateComponent,
  ErrorStateComponent,
  BadgeComponent,
  SkeletonComponent,
} from '@aegisx/ui';

// Use in component
@Component({
  imports: [
    // Material modules
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    // AegisX components
    BreadcrumbComponent,
    CardComponent,
    BadgeComponent,
  ],
})
```

## Standalone Component Pattern

All components are standalone:

```typescript
@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    // ... other imports
  ],
  template: `...`,
  styles: [`...`],
})
export class ProductsListComponent {}
```

## Working with API Contracts

Before implementing frontend, check the API contract:

```
docs/features/products/API_CONTRACTS.md
```

Extract:

- Base URL: `/api/v1/products`
- Endpoints: GET, POST, PUT, DELETE
- Request schemas: What fields to send
- Response format: How data comes back
- Validations: What constraints exist

Then build services and components around the API contract.

## Testing Patterns

### Service Test

```typescript
describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductsService],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load items', () => {
    service.loadItems().subscribe();

    const req = httpMock.expectOne('/api/v1/products');
    req.flush({ success: true, data: [] });

    expect(service.items()).toEqual([]);
  });
});
```

## Common Issues

### Signals not updating in template

```typescript
// Wrong - signals are functions
{
  {
    service.items.length;
  }
}

// Correct - call signal as function
{
  {
    service.items().length;
  }
}
```

### Type errors with forms

```typescript
// Always import ReactiveFormsModule
@Component({
  imports: [ReactiveFormsModule, ...]
})
```

### AegisX UI not found

```typescript
// Check tsconfig paths
"@aegisx/ui": ["libs/aegisx-ui/src/index.ts"]
```

## Best Practices

1. **Always expose read-only signals** from services
2. **Use computed() for derived state** instead of methods
3. **Handle errors in every observable** subscribe
4. **Use @if/@for** for template control flow
5. **Separate concerns** - API service vs UI service
6. **Document complex logic** with JSDoc comments
7. **Test signals independently** from components
8. **Use track function** in @for loops for performance

## Integration with Backend

### Step 1: Read API Contract

```bash
cat docs/features/products/API_CONTRACTS.md
```

### Step 2: Create Types

Map backend response to TypeScript interfaces

### Step 3: Create Service

Implement service with signals and HTTP calls

### Step 4: Create Components

Build components using service signals

### Step 5: Add Routes

Register components in module routes

### Step 6: Test

Test service, component, and integration

## Real Examples

See existing features for complete examples:

```
apps/web/src/app/features/system/modules/departments/
```

This shows:

- Service with signals (departments.service.ts)
- UI service for filters (departments-ui.service.ts)
- List component (departments-list.component.ts)
- Filter component (departments-list-filters.component.ts)
- Form dialog (department-form-dialog.component.ts)
- Types definitions (departments.types.ts)

## Questions for Claude

Ask Claude when you need help with:

- "How do I implement a service with signals?"
- "Create a list component with filters"
- "Setup a form dialog for create/edit"
- "Add AegisX UI components to my template"
- "Fix this type error in my form"
- "How do I test this service?"

## Related Skills

- **backend-customization-guide** - Customize generated backend code
- **api-contract-generator** - Generate API documentation
- **api-endpoint-tester** - Test API endpoints

## Project Standards

This skill follows:

- [Universal Full-Stack Standard](../../../docs/guides/development/universal-fullstack-standard.md)
- [API Calling Standard](../../../docs/guides/development/api-calling-standard.md)
- [Feature Development Standard](../../../docs/guides/development/feature-development-standard.md)

---

**Ready to use!** Ask Claude to help integrate your frontend with backend APIs.
