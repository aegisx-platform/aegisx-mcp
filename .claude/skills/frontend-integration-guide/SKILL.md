---
name: frontend-integration-guide
description: Integrate Angular frontend with generated backend APIs. Use when customizing frontend components, implementing signals-based services, integrating AegisX UI components, or creating dialog patterns. Provides reusable component patterns and service templates.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

# Frontend Integration Guide

Guide for customizing and integrating generated Angular frontend code with backend APIs. Provides proven patterns for services, components, dialogs, and AegisX UI integration.

## When Claude Should Use This Skill

- User asks to "customize frontend", "implement UI", or "integrate with backend"
- After frontend generation when business-specific UI logic is needed
- User needs help with "signals", "components", "dialogs", or "state management"
- User asks about "AegisX UI components" or "Material components"
- User mentions Angular patterns like "@if", "@for", or "computed"
- Integrating existing backend API with new frontend

## Key Principles

1. **Signal-Based State Management** - Use Angular Signals for all reactive state
2. **Service Injection with `inject()`** - Use the modern injection pattern
3. **Standalone Components** - All components are standalone
4. **Material + AegisX UI** - Combine Material Design with AegisX components
5. **Control Flow Syntax** - Use @if, @for, @else for templates
6. **Computed Signals** - Derive state reactively using computed()
7. **Read-Only Signals** - Expose only asReadonly() from services

## Service Pattern - Signal-Based State Management

### Step 1: Define Service State Type

```typescript
interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  filterState: {
    searchTerm: string;
    isActive: boolean | null;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}
```

### Step 2: Create Service with Signals

Location: `apps/web/src/app/features/[module]/services/[feature].service.ts`

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/products';

  // Private state signals
  private readonly _state = signal<ProductsState>({
    items: [],
    loading: false,
    error: null,
    selectedIds: new Set(),
    filterState: {
      searchTerm: '',
      isActive: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
  });

  // Public read-only signals
  readonly items = computed(() => this._state().items);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly selectedIds = computed(() => this._state().selectedIds);
  readonly filterState = computed(() => this._state().filterState);

  // Computed signals
  readonly selectedCount = computed(() => this._state().selectedIds.size);
  readonly hasSelection = computed(() => this.selectedCount() > 0);
  readonly activeItems = computed(() => this.items().filter((item) => item.isActive));

  // Load items from API
  loadItems(): Observable<Product[]> {
    this._state.update((s) => ({ ...s, loading: true }));

    return this.http.get<ApiResponse<Product[]>>(this.baseUrl).pipe(
      tap((response) => {
        this._state.update((s) => ({
          ...s,
          items: response.data,
          loading: false,
          error: null,
        }));
      }),
      catchError((error) => {
        this._state.update((s) => ({
          ...s,
          loading: false,
          error: error.message || 'Failed to load items',
        }));
        return throwError(() => error);
      }),
    );
  }

  // Create item
  create(data: CreateProductDto): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.baseUrl, data).pipe(
      tap((response) => {
        this._state.update((s) => ({
          ...s,
          items: [...s.items, response.data],
        }));
      }),
      catchError((error) => {
        this._state.update((s) => ({
          ...s,
          error: error.error?.message || 'Failed to create item',
        }));
        return throwError(() => error);
      }),
    );
  }

  // Update item
  update(id: string, data: UpdateProductDto): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/${id}`, data).pipe(
      tap((response) => {
        this._state.update((s) => ({
          ...s,
          items: s.items.map((item) => (item.id === id ? response.data : item)),
        }));
      }),
      catchError((error) => {
        this._state.update((s) => ({
          ...s,
          error: error.error?.message || 'Failed to update item',
        }));
        return throwError(() => error);
      }),
    );
  }

  // Delete item
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this._state.update((s) => ({
          ...s,
          items: s.items.filter((item) => item.id !== id),
          selectedIds: (() => {
            const updated = new Set(s.selectedIds);
            updated.delete(id);
            return updated;
          })(),
        }));
      }),
      catchError((error) => {
        this._state.update((s) => ({
          ...s,
          error: error.error?.message || 'Failed to delete item',
        }));
        return throwError(() => error);
      }),
    );
  }

  // Selection methods
  toggleSelection(id: string): void {
    this._state.update((s) => {
      const updated = new Set(s.selectedIds);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return { ...s, selectedIds: updated };
    });
  }

  clearSelection(): void {
    this._state.update((s) => ({ ...s, selectedIds: new Set() }));
  }

  // Filter methods
  updateFilter(key: string, value: any): void {
    this._state.update((s) => ({
      ...s,
      filterState: {
        ...s.filterState,
        [key]: value,
      },
    }));
  }
}
```

## Component Pattern - List with Filters

### Step 1: Create List Component

Location: `apps/web/src/app/features/[module]/components/[feature]-list.component.ts`

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// AegisX UI
import { BreadcrumbComponent, AxCardComponent, AxEmptyStateComponent, AxErrorStateComponent, BadgeComponent } from '@aegisx/ui';

// Service & types
import { ProductsService } from '../services/products.service';
import { Product } from '../types/products.types';

// Dialog
import { MatDialog } from '@angular/material/dialog';
import { ProductFormDialogComponent } from './product-form-dialog/product-form-dialog.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    // Material
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    // AegisX
    BreadcrumbComponent,
    AxCardComponent,
    AxEmptyStateComponent,
    AxErrorStateComponent,
    BadgeComponent,
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Breadcrumb -->
      <ax-breadcrumb
        [items]="[
          { label: 'Dashboard', url: '/dashboard' },
          { label: 'Products', active: true },
        ]"
      ></ax-breadcrumb>

      <!-- Header with actions -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Products</h1>
        <button mat-raised-button color="primary" (click)="openCreate()">
          <mat-icon>add</mat-icon>
          Add Product
        </button>
      </div>

      <!-- Filters -->
      <ax-card>
        <div class="flex gap-4">
          <mat-form-field class="flex-1">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)" placeholder="Search products..." />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Status</mat-label>
            <mat-select [(value)]="statusFilter" (selectionChange)="onFilterChange()">
              <mat-option value="">All</mat-option>
              <mat-option [value]="true">Active</mat-option>
              <mat-option [value]="false">Inactive</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button (click)="resetFilters()">
            <mat-icon>clear</mat-icon>
            Clear Filters
          </button>
        </div>
      </ax-card>

      <!-- Table -->
      <ax-card title="Products List" [loading]="service.loading()">
        @if (service.loading()) {
          <div class="flex justify-center p-8">
            <mat-spinner [diameter]="40"></mat-spinner>
          </div>
        } @else if (service.items().length === 0) {
          <ax-empty-state title="No products found" description="Try adjusting your filters or create a new product."></ax-empty-state>
        } @else {
          <table mat-table [dataSource]="dataSource" class="w-full">
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let element">{{ element.id }}</td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Product Name</th>
              <td mat-cell *matCellDef="let element">
                <span class="font-medium">{{ element.name }}</span>
              </td>
            </ng-container>

            <!-- Price Column -->
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let element">
                {{ element.price | currency }}
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let element">
                <ax-badge [color]="element.isActive ? 'success' : 'error'">
                  {{ element.isActive ? 'Active' : 'Inactive' }}
                </ax-badge>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button (click)="openEdit(element)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="openDelete(element)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" [pageSize]="25" [length]="service.items().length" (page)="onPageChange($event)"></mat-paginator>
        }
      </ax-card>

      <!-- Error -->
      @if (service.error()) {
        <ax-error-state [title]="'Error loading products'" [description]="service.error() || 'An error occurred'"></ax-error-state>
      }
    </div>
  `,
})
export class ProductsListComponent implements OnInit {
  protected service = inject(ProductsService);
  private dialog = inject(MatDialog);

  // Local state
  searchTerm = '';
  statusFilter: boolean | string = '';

  displayedColumns = ['id', 'name', 'price', 'status', 'actions'];
  dataSource = new MatTableDataSource<Product>();

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.service.loadItems().subscribe({
      next: () => {
        this.dataSource.data = this.service.items();
      },
      error: (err) => console.error('Failed to load products', err),
    });
  }

  onSearch(term: string): void {
    this.service.updateFilter('searchTerm', term);
    this.loadData();
  }

  onFilterChange(): void {
    this.service.updateFilter('isActive', this.statusFilter || null);
    this.loadData();
  }

  onPageChange(event: PageEvent): void {
    this.service.updateFilter('page', event.pageIndex + 1);
    this.service.updateFilter('pageSize', event.pageSize);
    this.loadData();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.loadData();
  }

  openCreate(): void {
    this.dialog
      .open(ProductFormDialogComponent, {
        width: '600px',
        data: { mode: 'create' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadData();
      });
  }

  openEdit(product: Product): void {
    this.dialog
      .open(ProductFormDialogComponent, {
        width: '600px',
        data: { mode: 'edit', product },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadData();
      });
  }

  openDelete(product: Product): void {
    if (confirm(`Delete product "${product.name}"?`)) {
      this.service.delete(product.id).subscribe({
        next: () => console.log('Deleted'),
        error: (err) => console.error('Delete failed', err),
      });
    }
  }
}
```

## Dialog Component Pattern - MANDATORY Structure

### Step 1: Create Dialog Component

Location: `apps/web/src/app/features/[module]/components/[feature]-form-dialog.component.ts`

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProductsService } from '../../services/products.service';

interface DialogData {
  mode: 'create' | 'edit';
  product?: any;
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule],
  template: `
    <div class="product-dialog">
      <!-- Header - MANDATORY Structure -->
      <div mat-dialog-title class="flex items-center justify-between pb-4 border-b">
        <div class="flex items-center gap-3">
          <mat-icon class="!text-2xl text-blue-600">
            {{ data.mode === 'create' ? 'add_circle' : 'edit' }}
          </mat-icon>
          <h2 class="text-xl font-semibold m-0">
            {{ data.mode === 'create' ? 'Create Product' : 'Edit Product' }}
          </h2>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <mat-dialog-content class="py-6">
        <form [formGroup]="form">
          <mat-form-field class="w-full">
            <mat-label>Product Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter product name" />
            @if (form.get('name')?.hasError('required')) {
              <mat-error>Product name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Price</mat-label>
            <input matInput type="number" formControlName="price" placeholder="Enter price" />
            @if (form.get('price')?.hasError('required')) {
              <mat-error>Price is required</mat-error>
            }
            @if (form.get('price')?.hasError('min')) {
              <mat-error>Price must be greater than 0</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" placeholder="Enter description" rows="3"></textarea>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <!-- Actions -->
      <mat-dialog-actions class="flex justify-end gap-2 pt-4 border-t">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!form.valid || loading()">
          @if (loading()) {
            <mat-spinner diameter="20"></mat-spinner>
            Saving...
          } @else {
            <mat-icon>save</mat-icon>
            Save
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-form-field {
        width: 100%;
        margin-bottom: 1rem;
      }

      .product-dialog {
        min-width: 400px;
      }
    `,
  ],
})
export class ProductFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  protected data = inject<DialogData>(MAT_DIALOG_DATA);
  private service = inject(ProductsService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  loading = signal(false);

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.product?.name || '', [Validators.required, Validators.minLength(3)]],
      price: [this.data.product?.price || 0, [Validators.required, Validators.min(0)]],
      description: [this.data.product?.description || '', []],
    });
  }

  onSave(): void {
    if (this.form.invalid) return;

    this.loading.set(true);

    const operation = this.data.mode === 'create' ? this.service.create(this.form.value) : this.service.update(this.data.product.id, this.form.value);

    operation.subscribe({
      next: (result) => {
        this.loading.set(false);
        this.dialogRef.close(result);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Operation failed', err);
      },
    });
  }
}
```

## AegisX UI Component Integration

### Import AegisX Components

```typescript
import { BreadcrumbComponent, BadgeComponent, CardComponent, SkeletonComponent, EmptyStateComponent, ErrorStateComponent, AlertComponent, NotificationComponent } from '@aegisx/ui';
```

### Common Usage Patterns

```html
<!-- Breadcrumb Navigation -->
<ax-breadcrumb
  [items]="[
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Products', active: true }
  ]"
></ax-breadcrumb>

<!-- Card Container -->
<ax-card title="Products" [loading]="loading()">
  <!-- Content inside card -->
</ax-card>

<!-- Empty State -->
@if (!items().length) {
<ax-empty-state title="No products found" description="Create your first product to get started." [icon]="'inventory'"></ax-empty-state>
}

<!-- Error State -->
@if (error()) {
<ax-error-state [title]="'Error loading products'" [description]="error() || 'An unexpected error occurred'"></ax-error-state>
}

<!-- Badge for Status -->
<ax-badge [color]="isActive ? 'success' : 'error'"> {{ isActive ? 'Active' : 'Inactive' }} </ax-badge>

<!-- Skeleton Loading -->
@if (loading()) {
<ax-skeleton type="table" [lines]="5"></ax-skeleton>
}
```

## Filter Component Pattern

### Location

`apps/web/src/app/features/[module]/components/[feature]-list-filters.component.ts`

### Template

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  template: `
    <div class="flex gap-4 p-4 bg-white rounded-lg shadow-sm">
      <!-- Search -->
      <mat-form-field class="flex-1">
        <mat-label>Search</mat-label>
        <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)" placeholder="Search by name or code..." />
        @if (searchTerm) {
          <button matSuffix mat-icon-button (click)="clearSearch()" aria-label="Clear">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <!-- Status Filter -->
      <mat-form-field>
        <mat-label>Status</mat-label>
        <mat-select [(value)]="statusFilter" (selectionChange)="onStatusChange()">
          <mat-option value="">All</mat-option>
          <mat-option [value]="true">Active</mat-option>
          <mat-option [value]="false">Inactive</mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Reset -->
      <button mat-stroked-button (click)="resetFilters()" [disabled]="!hasActiveFilters()">
        <mat-icon>clear</mat-icon>
        Reset
      </button>
    </div>
  `,
})
export class ProductsFiltersComponent {
  private service = inject(ProductsService);

  searchTerm = '';
  statusFilter: boolean | string = '';

  onSearch(term: string): void {
    this.service.updateFilter('searchTerm', term);
  }

  onStatusChange(): void {
    this.service.updateFilter('isActive', this.statusFilter || null);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch('');
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.service.updateFilter('searchTerm', '');
    this.service.updateFilter('isActive', null);
  }

  hasActiveFilters(): boolean {
    return this.searchTerm !== '' || this.statusFilter !== '';
  }
}
```

## HTTP Response Type

### Standard API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Usage in service
this.http.get<ApiResponse<Product[]>>('/api/v1/products').pipe(
  tap((response) => {
    const items = response.data;
    const pagination = response.pagination;
  }),
);
```

## Common Patterns

### 1. Dependency Injection with inject()

```typescript
// Instead of constructor
private http = inject(HttpClient);
private dialog = inject(MatDialog);
private service = inject(ProductsService);
```

### 2. Signals for State

```typescript
// Signal declaration
private _state = signal<State>(initialValue);

// Read-only exposure
readonly state = this._state.asReadonly();

// Update state
this._state.update((s) => ({ ...s, field: newValue }));

// Computed derived state
readonly activeItems = computed(() =>
  this.items().filter((item) => item.isActive)
);
```

### 3. Conditional Rendering

```html
<!-- @if directive -->
@if (condition) {
<div>Shown when true</div>
} @else if (otherCondition) {
<div>Shown when otherCondition true</div>
} @else {
<div>Default content</div>
}

<!-- @for directive -->
@for (item of items(); track item.id) {
<div>{{ item.name }}</div>
} @empty {
<div>No items</div>
}
```

### 4. Error Handling in Components

```typescript
operation.subscribe({
  next: (result) => {
    // Success
    this.loadData();
  },
  error: (err) => {
    // Handle error
    const errorMsg = err.error?.message || 'Unknown error';
    console.error(errorMsg);
  },
  complete: () => {
    // Final cleanup
  },
});
```

### 5. Observable to Signal Pattern

```typescript
// Service method returns Observable
loadItems(): Observable<Product[]> {
  return this.http.get<ApiResponse<Product[]>>(url).pipe(
    tap((response) => {
      // Update signal on success
      this._state.update((s) => ({
        ...s,
        items: response.data,
      }));
    })
  );
}

// Component subscribes and uses signal
ngOnInit(): void {
  this.service.loadItems().subscribe();
  // Data is now in this.service.items() signal
}
```

## Type Definitions Pattern

### Location

`apps/web/src/app/features/[module]/types/[feature].types.ts`

### Template

```typescript
/**
 * Product entity type definition
 * Maps to backend Product model
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating products
 * Subset of Product fields sent in POST request
 */
export interface CreateProductDto {
  name: string;
  price: number;
  description?: string;
}

/**
 * DTO for updating products
 * All fields optional for PATCH operations
 */
export interface UpdateProductDto {
  name?: string;
  price?: number;
  description?: string;
  isActive?: boolean;
}

/**
 * List query parameters for filtering
 */
export interface ListProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## Testing Patterns

### Service Unit Test Pattern

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
    const mockData = { success: true, data: [{ id: '1', name: 'Product 1' }] };

    service.loadItems().subscribe();

    const req = httpMock.expectOne('/api/v1/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    expect(service.items()).toEqual(mockData.data);
  });
});
```

## Common Issues and Solutions

### Issue: Signals not updating in template

**Solution:** Ensure using signals as functions in template:

```html
<!-- Correct -->
{{ service.items().length }}

<!-- Incorrect -->
{{ service.items.length }}
```

### Issue: Type errors with Material forms

**Solution:** Always import ReactiveFormsModule with standalone:

```typescript
imports: [ReactiveFormsModule, ...]
```

### Issue: AegisX UI components not found

**Solution:** Verify import path in tsconfig:

```json
"@aegisx/ui": ["libs/aegisx-ui/src/index.ts"]
```

## Best Practices

1. **Always use asReadonly()** on service signals
2. **Keep services focused** - one service per feature
3. **Separate UI state and data state** - use UI service for filters
4. **Use computed() for derived state** instead of methods
5. **Implement error states** in all components
6. **Test signals** in isolation from components
7. **Follow naming conventions** - use clear, descriptive names
8. **Document complex logic** with comments

## Related Skills

- Use `backend-customization-guide` for API customization
- Use `api-contract-generator` to generate API documentation
- Use `api-endpoint-tester` to test API endpoints

## Related Documentation

- [Universal Full-Stack Standard](../../../docs/guides/development/universal-fullstack-standard.md)
- [API Calling Standard](../../../docs/guides/development/api-calling-standard.md)
- [Feature Development Standard](../../../docs/guides/development/feature-development-standard.md)
