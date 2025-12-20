---
paths: apps/web/src/app/**/*.component.ts
---

# Angular Frontend Component Rules

**NOTE**: This file covers Angular-specific patterns. For API integration, see `inventory-domain.md`

## CRITICAL: Use Standalone Components

### ✅ ALWAYS use standalone: true

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true, // REQUIRED!
  imports: [CommonModule, FormsModule, AegisXUIModule],
  templateUrl: './my-component.component.html',
})
export class MyComponent {
  // ...
}
```

### ❌ NEVER use NgModule-based components

```typescript
// ❌ DON'T DO THIS - No NgModule pattern
@NgModule({
  declarations: [MyComponent],
  imports: [CommonModule],
})
export class MyModule {}
```

## State Management with Signals

### ✅ Use Signals for Reactive State

```typescript
import { Component, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-item-list',
  standalone: true,
  template: `
    <div>
      <input [(ngModel)]="searchTerm" />
      <p>Found: {{ filteredItems().length }} items</p>
      <div *ngFor="let item of filteredItems()">
        {{ item.name }}
      </div>
    </div>
  `,
})
export class ItemListComponent {
  // State signals
  items = signal<Item[]>([]);
  searchTerm = signal<string>('');
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed signals (auto-updates)
  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.items().filter((item) => item.name.toLowerCase().includes(term));
  });

  itemCount = computed(() => this.items().length);
  hasItems = computed(() => this.items().length > 0);

  // Effects (side effects when signals change)
  constructor() {
    effect(() => {
      console.log('Items changed:', this.items().length);
      // This runs whenever items() changes
    });
  }

  // Update signals
  addItem(item: Item) {
    this.items.update((current) => [...current, item]);
  }

  setItems(items: Item[]) {
    this.items.set(items);
  }

  clearItems() {
    this.items.set([]);
  }
}
```

### ❌ DON'T use BehaviorSubject (old pattern)

```typescript
// ❌ OLD PATTERN - Don't use anymore
import { BehaviorSubject } from 'rxjs';

export class ItemListComponent {
  private items$ = new BehaviorSubject<Item[]>([]);

  // Don't do this anymore - use Signals instead!
}
```

## AegisX UI Components

### Always Use AegisX Components

```typescript
import { Component } from '@angular/core';
import { AegisXBadgeComponent, AegisXButtonComponent, AegisXCardComponent, AegisXTableComponent, AegisXDrawerComponent } from '@aegisx/ui';

@Component({
  selector: 'app-item-view',
  standalone: true,
  imports: [AegisXBadgeComponent, AegisXButtonComponent, AegisXCardComponent, AegisXTableComponent, AegisXDrawerComponent],
  template: `
    <ax-card>
      <h2>{{ item().name }}</h2>
      <ax-badge [variant]="item().status">{{ item().status }}</ax-badge>

      <ax-table [data]="items()" [columns]="columns" (rowClick)="onRowClick($event)"> </ax-table>

      <ax-button variant="primary" (click)="openDrawer()"> Add Item </ax-button>
    </ax-card>

    <ax-drawer [isOpen]="drawerOpen()" title="Add Item" (close)="closeDrawer()">
      <!-- Form content -->
    </ax-drawer>
  `,
})
export class ItemViewComponent {
  item = signal<Item>({} as Item);
  items = signal<Item[]>([]);
  drawerOpen = signal(false);

  columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'quantity', label: 'Quantity' },
  ];

  openDrawer() {
    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  onRowClick(item: Item) {
    this.item.set(item);
  }
}
```

### Common AegisX Components

#### Buttons

```typescript
<ax-button variant="primary" size="md" (click)="save()">
  Save
</ax-button>

<ax-button variant="secondary" [loading]="loading()">
  Submit
</ax-button>

<ax-button variant="danger" (click)="delete()">
  Delete
</ax-button>
```

#### Badges

```typescript
<ax-badge variant="success">Active</ax-badge>
<ax-badge variant="warning">Pending</ax-badge>
<ax-badge variant="danger">Inactive</ax-badge>
<ax-badge variant="info">Draft</ax-badge>
```

#### Cards

```typescript
<ax-card>
  <div class="card-header">
    <h3>Title</h3>
  </div>
  <div class="card-body">
    Content here
  </div>
  <div class="card-footer">
    <ax-button>Action</ax-button>
  </div>
</ax-card>
```

#### Tables

```typescript
<ax-table
  [data]="items()"
  [columns]="columns"
  [loading]="loading()"
  [pagination]="true"
  [pageSize]="20"
  (rowClick)="onRowClick($event)"
  (sortChange)="onSortChange($event)">
</ax-table>
```

#### Drawers

```typescript
<ax-drawer
  [isOpen]="drawerOpen()"
  [title]="drawerTitle()"
  [size]="'large'"
  (close)="closeDrawer()">
  <form>
    <!-- Form content -->
  </form>
</ax-drawer>
```

## Service Layer with Signals

### ✅ Use Signals in Services

```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly apiUrl = '/api/inventory/items';

  // Shared state signals
  items = signal<Item[]>([]);
  selectedItem = signal<Item | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  async loadItems(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await this.http.get<{ data: Item[] }>(this.apiUrl).toPromise();

      this.items.set(response?.data || []);
    } catch (err) {
      this.error.set('Failed to load items');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  async createItem(data: CreateItemDto): Promise<Item | null> {
    this.loading.set(true);

    try {
      const item = await this.http.post<Item>(this.apiUrl, data).toPromise();

      if (item) {
        // Add to items list
        this.items.update((current) => [...current, item]);
      }

      return item || null;
    } catch (err) {
      this.error.set('Failed to create item');
      console.error(err);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async updateItem(id: string, data: UpdateItemDto): Promise<Item | null> {
    this.loading.set(true);

    try {
      const updated = await this.http.put<Item>(`${this.apiUrl}/${id}`, data).toPromise();

      if (updated) {
        // Update in items list
        this.items.update((current) => current.map((item) => (item.id === id ? updated : item)));
      }

      return updated || null;
    } catch (err) {
      this.error.set('Failed to update item');
      console.error(err);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async deleteItem(id: string): Promise<boolean> {
    this.loading.set(true);

    try {
      await this.http.delete(`${this.apiUrl}/${id}`).toPromise();

      // Remove from items list
      this.items.update((current) => current.filter((item) => item.id !== id));

      return true;
    } catch (err) {
      this.error.set('Failed to delete item');
      console.error(err);
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  selectItem(item: Item | null) {
    this.selectedItem.set(item);
  }
}
```

## Form Handling

### Template-Driven Forms with Signals

```typescript
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()">
      <div>
        <label>Name</label>
        <input type="text" [(ngModel)]="formData.name" name="name" required />
      </div>

      <div>
        <label>Code</label>
        <input type="text" [(ngModel)]="formData.code" name="code" required />
      </div>

      <div>
        <label>Quantity</label>
        <input type="number" [(ngModel)]="formData.quantity" name="quantity" min="0" />
      </div>

      <ax-button type="submit" [disabled]="submitting()">
        {{ submitting() ? 'Saving...' : 'Save' }}
      </ax-button>
    </form>
  `,
})
export class ItemFormComponent {
  formData = {
    name: '',
    code: '',
    quantity: 0,
  };

  submitting = signal(false);
  error = signal<string | null>(null);

  constructor(private itemService: ItemService) {}

  async onSubmit() {
    this.submitting.set(true);
    this.error.set(null);

    try {
      const result = await this.itemService.createItem(this.formData);

      if (result) {
        // Reset form
        this.formData = { name: '', code: '', quantity: 0 };
      }
    } catch (err) {
      this.error.set('Failed to save item');
    } finally {
      this.submitting.set(false);
    }
  }
}
```

### Reactive Forms with Signals

```typescript
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="itemForm" (ngSubmit)="onSubmit()">
      <div>
        <label>Name</label>
        <input formControlName="name" />
        <span *ngIf="itemForm.get('name')?.invalid && itemForm.get('name')?.touched"> Name is required </span>
      </div>

      <div>
        <label>Code</label>
        <input formControlName="code" />
      </div>

      <ax-button type="submit" [disabled]="itemForm.invalid || submitting()"> Save </ax-button>
    </form>
  `,
})
export class ItemFormComponent {
  itemForm: FormGroup;
  submitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
  ) {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required]],
      quantity: [0, [Validators.min(0)]],
    });
  }

  async onSubmit() {
    if (this.itemForm.invalid) return;

    this.submitting.set(true);

    try {
      await this.itemService.createItem(this.itemForm.value);
      this.itemForm.reset();
    } catch (err) {
      console.error(err);
    } finally {
      this.submitting.set(false);
    }
  }
}
```

## Component Communication

### Parent to Child (Input)

```typescript
// Child Component
@Component({
  selector: 'app-item-detail',
  standalone: true,
  template: `<div>{{ item().name }}</div>`,
})
export class ItemDetailComponent {
  item = input.required<Item>(); // Angular 17+ input signal
}

// Parent Component
@Component({
  template: `<app-item-detail [item]="selectedItem()" />`,
})
export class ParentComponent {
  selectedItem = signal<Item>({} as Item);
}
```

### Child to Parent (Output)

```typescript
// Child Component
@Component({
  selector: 'app-item-form',
  standalone: true,
  template: `
    <form (ngSubmit)="onSubmit()">
      <!-- form fields -->
      <button type="submit">Save</button>
    </form>
  `,
})
export class ItemFormComponent {
  @Output() itemSaved = new EventEmitter<Item>();

  onSubmit() {
    const item: Item = {
      /* ... */
    };
    this.itemSaved.emit(item);
  }
}

// Parent Component
@Component({
  template: ` <app-item-form (itemSaved)="onItemSaved($event)" /> `,
})
export class ParentComponent {
  onItemSaved(item: Item) {
    console.log('Item saved:', item);
  }
}
```

## Lifecycle Hooks

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true,
})
export class MyComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  ngOnInit() {
    // Initialize component
    this.loadData();
  }

  ngOnDestroy() {
    // Cleanup
    this.subscription?.unsubscribe();
  }

  async loadData() {
    // Load data
  }
}
```

## Common Mistakes

### ❌ WRONG: Not using standalone

```typescript
@Component({
  selector: 'app-my-component',
  // Missing standalone: true
})
```

### ✅ CORRECT: Always standalone

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true
})
```

### ❌ WRONG: Using BehaviorSubject

```typescript
items$ = new BehaviorSubject<Item[]>([]);
```

### ✅ CORRECT: Use Signals

```typescript
items = signal<Item[]>([]);
```

### ❌ WRONG: Mutating signal value

```typescript
const items = this.items();
items.push(newItem); // Don't mutate!
```

### ✅ CORRECT: Use update/set

```typescript
this.items.update((current) => [...current, newItem]);
// or
this.items.set([...this.items(), newItem]);
```

## Quick Reference Checklist

Before committing any component:

- ✅ Component is standalone
- ✅ Using Signals for state (not BehaviorSubject)
- ✅ Using AegisX UI components
- ✅ Imports are correct and minimal
- ✅ Template uses computed signals for derived state
- ✅ Form validation is implemented
- ✅ Error handling is present
- ✅ Loading states are shown
- ✅ TypeScript types are properly defined
- ✅ No console.log statements in production code
