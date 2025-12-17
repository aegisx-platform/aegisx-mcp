# Frontend Integration Guide - Quick Reference

Fast lookup for common patterns and code snippets.

## Signal Patterns

### Basic Signal

```typescript
private _count = signal(0);
readonly count = this._count.asReadonly();

this._count.set(5);           // Set value
this._count.update(v => v++); // Update with function
```

### Computed Signal

```typescript
readonly doubleCount = computed(() => this.count() * 2);
readonly filtered = computed(() =>
  this.items().filter(item => item.isActive)
);
```

### Signal in Template

```html
<!-- Call signal as function -->
{{ count() }} {{ doubleCount() }}

<!-- In @if and @for -->
@if (loading()) { ... } @for (item of items(); track item.id) { ... }
```

## Dependency Injection

### Inject Pattern (Modern)

```typescript
private http = inject(HttpClient);
private service = inject(MyService);
private fb = inject(FormBuilder);
```

## HTTP Patterns

### GET Request

```typescript
this.http.get<ApiResponse<T>>('/api/v1/resource').pipe(
  tap((response) => {
    this._state.update((s) => ({ ...s, items: response.data }));
  }),
  catchError((error) => {
    this._state.update((s) => ({ ...s, error: error.message }));
    return throwError(() => error);
  }),
);
```

### POST Request

```typescript
this.http.post<ApiResponse<T>>('/api/v1/resource', data).pipe(
  tap((response) => {
    this._state.update((s) => ({
      ...s,
      items: [...s.items, response.data],
    }));
  }),
);
```

### Query Parameters

```typescript
let params = new HttpParams();
params = params.set('page', '1');
params = params.set('search', 'text');

this.http.get(url, { params });
```

## Form Patterns

### Reactive Form

```typescript
form = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  active: [true],
});

if (this.form.valid) {
  // Submit
}
```

### Form Validation Display

```html
<mat-form-field>
  <input matInput formControlName="name" />
  @if (form.get('name')?.hasError('required')) {
  <mat-error>Name is required</mat-error>
  } @if (form.get('name')?.hasError('minlength')) {
  <mat-error>Minimum 3 characters</mat-error>
  }
</mat-form-field>
```

## Template Patterns

### Conditional Rendering

```html
<!-- @if directive -->
@if (condition) {
<div>Shown when true</div>
} @else if (other) {
<div>Other condition</div>
} @else {
<div>Default</div>
}

<!-- Shorthand -->
{{ condition ? 'true' : 'false' }}
```

### Loop with Track

```html
<!-- @for with track function -->
@for (item of items(); track item.id) {
<div>{{ item.name }}</div>
} @empty {
<p>No items</p>
}
```

### Empty State

```html
@if (items().length === 0) {
<ax-empty-state title="No items" description="Create one to get started"></ax-empty-state>
}
```

## Material Components

### Button

```html
<button mat-button>Flat</button>
<button mat-raised-button color="primary">Raised</button>
<button mat-stroked-button>Outlined</button>
<button mat-icon-button [matMenuTriggerFor]="menu">
  <mat-icon>menu</mat-icon>
</button>
```

### Input

```html
<mat-form-field>
  <mat-label>Name</mat-label>
  <input matInput placeholder="Enter name" />
</mat-form-field>
```

### Select

```html
<mat-form-field>
  <mat-label>Category</mat-label>
  <mat-select [(value)]="selected">
    @for (cat of categories(); track cat.id) {
    <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
    }
  </mat-select>
</mat-form-field>
```

### Table

```html
<table mat-table [dataSource]="items()">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef>Name</th>
    <td mat-cell *matCellDef="let el">{{ el.name }}</td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="['name']"></tr>
  <tr mat-row *matRowDef="let row; columns: ['name']"></tr>
</table>
```

### Dialog

```typescript
const dialogRef = this.dialog.open(MyDialogComponent, {
  width: '600px',
  data: { name: 'John' },
});

dialogRef.afterClosed().subscribe((result) => {
  console.log(result);
});
```

### Snackbar

```typescript
this.snackBar.open('Message', 'Close', { duration: 3000 });
```

## AegisX UI Components

### Card

```html
<ax-card title="Title" [loading]="loading()"> Content here </ax-card>
```

### Empty State

```html
<ax-empty-state title="No items found" description="Create your first item" icon="inbox"></ax-empty-state>
```

### Error State

```html
<ax-error-state title="Error occurred" description="Please try again"></ax-error-state>
```

### Badge

```html
<ax-badge color="success">Active</ax-badge>
<ax-badge color="error">Inactive</ax-badge>
<ax-badge color="warning">Pending</ax-badge>
<ax-badge color="info">Info</ax-badge>
```

### Breadcrumb

```html
<ax-breadcrumb
  [items]="[
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Products', active: true }
  ]"
></ax-breadcrumb>
```

### Alert

```html
<ax-alert type="success">Success message</ax-alert>
<ax-alert type="error">Error message</ax-alert>
<ax-alert type="warning">Warning message</ax-alert>
<ax-alert type="info">Info message</ax-alert>
```

## Dialog Structure (MANDATORY)

```html
<div>
  <!-- Header -->
  <div mat-dialog-title class="flex items-center justify-between pb-4 border-b">
    <div class="flex items-center gap-3">
      <mat-icon>icon_name</mat-icon>
      <h2 class="text-xl font-semibold m-0">Title</h2>
    </div>
    <button mat-icon-button mat-dialog-close>
      <mat-icon>close</mat-icon>
    </button>
  </div>

  <!-- Content -->
  <mat-dialog-content class="py-6">
    <!-- Form or content here -->
  </mat-dialog-content>

  <!-- Actions -->
  <mat-dialog-actions class="flex justify-end gap-2 pt-4 border-t">
    <button mat-button mat-dialog-close>Cancel</button>
    <button mat-raised-button color="primary" (click)="save()">Save</button>
  </mat-dialog-actions>
</div>
```

## Observable Patterns

### Subscribe with Handlers

```typescript
this.service.loadItems().subscribe({
  next: (items) => console.log(items),
  error: (error) => console.error(error),
  complete: () => console.log('Done'),
});
```

### Pipe Operators

```typescript
this.http
  .get(url)
  .pipe(
    tap((data) => console.log(data)), // Side effect
    map((data) => data.items), // Transform
    filter((items) => items.length > 0), // Filter
    take(1), // Take first
    catchError((error) => throwError(() => error)), // Error handling
  )
  .subscribe();
```

### Unsubscribe Pattern

```typescript
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.service.items$
    .pipe(takeUntil(this.destroy$))
    .subscribe(items => this.items = items);
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## Error Handling

### Service Level

```typescript
catchError((error) => {
  const message = error.error?.message || 'Unknown error';
  this._state.update((s) => ({ ...s, error: message }));
  return throwError(() => error);
});
```

### Component Level

```typescript
this.service.create(data).subscribe({
  next: () => this.onSuccess(),
  error: (err) => {
    const msg = err.error?.message || 'Operation failed';
    this.snackBar.open(msg, 'Close', { duration: 5000 });
  },
});
```

### Display in Template

```html
@if (service.error()) {
<ax-error-state [description]="service.error()"></ax-error-state>
}
```

## Utility Functions

### Format Date

```typescript
formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}
```

### Format Currency

```html
{{ price | currency: 'USD' }} {{ price | currency: 'USD':'symbol':'1.2-2' }}
```

### Sort Array

```typescript
const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
```

### Filter Array

```typescript
const active = items.filter((item) => item.isActive);
const search = items.filter((item) => item.name.toLowerCase().includes(term.toLowerCase()));
```

## Router Patterns

### Navigate

```typescript
this.router.navigate(['/products', id]);
this.router.navigateByUrl('/products?id=123');
```

### Get Route Params

```typescript
route.params.subscribe((params) => {
  const id = params['id'];
});
```

### Query Params

```typescript
route.queryParams.subscribe((params) => {
  const search = params['search'];
});
```

## Testing Patterns

### Service Test

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [MyService],
    imports: [HttpClientTestingModule],
  });
  service = TestBed.inject(MyService);
  httpMock = TestBed.inject(HttpTestingController);
});

it('should load items', () => {
  service.loadItems().subscribe();
  const req = httpMock.expectOne('/api/v1/items');
  req.flush({ success: true, data: [] });
  expect(service.items()).toEqual([]);
});
```

### Component Test

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [MyComponent],
  });
  fixture = TestBed.createComponent(MyComponent);
  component = fixture.componentInstance;
});

it('should render title', () => {
  fixture.detectChanges();
  const title = fixture.nativeElement.querySelector('h1');
  expect(title.textContent).toContain('Title');
});
```

## Performance Tips

### Track Function in @for

```html
<!-- Bad - no track -->
@for (item of items()) {
<div>{{ item.name }}</div>
}

<!-- Good - with track -->
@for (item of items(); track item.id) {
<div>{{ item.name }}</div>
}
```

### Computed for Derived State

```typescript
// Instead of recalculating in component
readonly filtered = computed(() =>
  this.items().filter(i => i.isActive)
);
```

### OnPush Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## Common Mistakes

### Signal Called as Property

```typescript
// Wrong
{
  {
    items.length;
  }
}

// Correct
{
  {
    items().length;
  }
}
```

### Missing Standalone

```typescript
// Wrong
@NgModule({
  declarations: [MyComponent]
})

// Correct
@Component({
  standalone: true,
  imports: [...]
})
```

### Missing Track in @for

```typescript
// Bad - performance issue
@for (item of items()) { }

// Good
@for (item of items(); track item.id) { }
```

### Not Handling Errors

```typescript
// Bad - no error handling
this.service.load().subscribe((data) => {});

// Good
this.service.load().subscribe({
  next: (data) => {},
  error: (err) => console.error(err),
});
```

## File Structure Checklist

```
features/product/
├── components/
│   ├── product-form-dialog/
│   │   ├── product-form-dialog.component.ts
│   │   └── product-form-dialog.component.html
│   ├── product-list.component.ts
│   ├── product-list.component.html
│   └── product-list-filters.component.ts
├── services/
│   ├── product.service.ts
│   └── product-ui.service.ts
├── types/
│   └── product.types.ts
└── product.routes.ts
```

## Imports Quick Copy

```typescript
// Service
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Component
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

// AegisX UI
import { BreadcrumbComponent, CardComponent, EmptyStateComponent, ErrorStateComponent, BadgeComponent, SkeletonComponent } from '@aegisx/ui';
```
