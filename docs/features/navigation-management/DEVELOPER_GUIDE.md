# Navigation Management - Developer Guide

> **Technical guide for developers working with the Navigation Management System**

## Table of Contents

- [Development Setup](#development-setup)
- [Backend Implementation](#backend-implementation)
- [Frontend Implementation](#frontend-implementation)
- [Integration Guide](#integration-guide)
- [Testing](#testing)
- [Performance Optimization](#performance-optimization)
- [Extending the System](#extending-the-system)
- [Migration Guide](#migration-guide)

## Development Setup

### Prerequisites

```bash
# Backend
Node.js >= 18.x
PostgreSQL >= 15.x
Redis (optional, recommended for production)

# Frontend
Angular CLI >= 19.x
Angular Material
TypeScript >= 5.x
```

### Environment Configuration

```bash
# .env file
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
REDIS_URL=redis://localhost:6379

# Optional: Cache configuration
NAVIGATION_CACHE_ENABLED=true
NAVIGATION_CACHE_TTL=300
```

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

## Backend Implementation

### Project Structure

```
apps/api/src/core/navigation/
├── navigation.plugin.ts              # Fastify plugin registration
├── navigation.routes.ts              # Public navigation routes
├── navigation.types.ts               # TypeScript type definitions
├── navigation.repository.ts          # Database operations
├── services/
│   └── navigation.service.ts         # Business logic & caching
├── navigation-items.controller.ts    # CRUD controllers
├── navigation-items.routes.ts        # CRUD API routes
└── navigation-items.schemas.ts       # TypeBox validation schemas
```

### Key Components

#### 1. NavigationRepository

**Purpose**: Database operations with Knex.js

**Key Methods**:

```typescript
class NavigationRepository {
  // Get all navigation items (tree or flat)
  async getNavigationItems(includeDisabled: boolean = false, flatten: boolean = false): Promise<NavigationItemWithChildren[]>;

  // Get user-specific navigation (filtered by permissions)
  async getUserNavigationItems(userId: string, type?: NavigationType, includeDisabled: boolean = false): Promise<NavigationItemWithChildren[]>;

  // Get user permissions from roles
  async getUserPermissions(userId: string): Promise<string[]>;

  // CRUD operations
  async createNavigationItem(item: Partial<NavigationItemEntity>);
  async updateNavigationItem(id: string, updates: Partial<NavigationItemEntity>);
  async deleteNavigationItem(id: string): Promise<boolean>;

  // Permission management
  async assignPermissionsToNavigationItem(navigationItemId: string, permissionIds: string[]): Promise<void>;

  // Helper methods
  private buildNavigationTree(items: NavigationItemWithChildren[]);
  private filterByPermissions(items, userPermissions: string[]);
  filterByType(items, type: NavigationType);
}
```

**Example Usage**:

```typescript
// Get flat list for management UI
const items = await repository.getNavigationItems(false, true);

// Get hierarchical tree for navigation menu
const tree = await repository.getNavigationItems(false, false);

// Get user-specific navigation
const userNav = await repository.getUserNavigationItems('user-uuid', 'default', false);
```

#### 2. NavigationService

**Purpose**: Business logic, caching, and API transformation

**Key Methods**:

```typescript
class NavigationService {
  // Public API methods
  async getNavigation(options: GetNavigationOptions): Promise<NavigationResponse>;
  async getUserNavigation(userId: string, options: GetNavigationOptions): Promise<NavigationResponse>;

  // CRUD wrapper methods (with cache invalidation)
  async createNavigationItem(item: any);
  async updateNavigationItem(id: string, updates: any);
  async deleteNavigationItem(id: string): Promise<boolean>;
  async assignPermissionsToNavigationItem(itemId: string, permIds: string[]);

  // Cache management
  async invalidateCache(userId?: string): Promise<void>;

  // Private helpers
  private buildNavigationResponse(items, type?: NavigationType);
  private transformNavigationItem(item: NavigationItemWithChildren);
  private getCachedData(key: string);
  private setCachedData(key: string, data: any, ttl?: number);
  private deleteCachedData(pattern: string);
}
```

**Caching Strategy**:

```typescript
// Cache keys
const globalKey = `navigation:${type}:${includeDisabled}`;
const userKey = `navigation:user:${userId}:${type}`;

// Cache check
const cached = await this.getCachedData(cacheKey);
if (cached) return cached;

// Cache miss: query + cache
const data = await this.navigationRepository.getNavigationItems();
await this.setCachedData(cacheKey, data, ttl);
return data;
```

**Cache Invalidation**:

```typescript
// Invalidate all navigation cache
await navigationService.invalidateCache();

// Invalidate user-specific cache
await navigationService.invalidateCache(userId);
```

#### 3. Routes & Controllers

**Public Navigation Routes** (`navigation.routes.ts`):

```typescript
// GET /api/navigation?type=default&includeDisabled=false
app.get(
  '/navigation',
  {
    schema: {
      querystring: GetNavigationQuerySchema,
      response: { 200: NavigationResponseSchema },
    },
  },
  async (request, reply) => {
    const options = {
      type: request.query.type,
      includeDisabled: request.query.includeDisabled === 'true',
    };
    const navigation = await navigationService.getNavigation(options);
    return { success: true, data: navigation };
  },
);

// GET /api/navigation/user?type=default
app.get(
  '/navigation/user',
  {
    onRequest: [app.authenticate],
    schema: {
      querystring: GetUserNavigationQuerySchema,
      response: { 200: NavigationResponseSchema },
    },
  },
  async (request, reply) => {
    const userId = request.user.id;
    const options = { type: request.query.type };
    const navigation = await navigationService.getUserNavigation(userId, options);
    return { success: true, data: navigation };
  },
);
```

**CRUD Routes** (`navigation-items.routes.ts`):

```typescript
// GET /api/navigation-items
app.get(
  '/navigation-items',
  {
    onRequest: [app.authenticate],
    preHandler: app.requirePermission(['navigation:read', '*:*']),
    schema: {
      response: { 200: NavigationItemsListResponseSchema },
    },
  },
  navigationItemsController.getAll,
);

// POST /api/navigation-items
app.post(
  '/navigation-items',
  {
    onRequest: [app.authenticate],
    preHandler: app.requirePermission(['navigation:create', '*:*']),
    schema: {
      body: CreateNavigationItemSchema,
      response: { 200: NavigationItemResponseSchema },
    },
  },
  navigationItemsController.create,
);

// PUT /api/navigation-items/:id
app.put(
  '/navigation-items/:id',
  {
    onRequest: [app.authenticate],
    preHandler: app.requirePermission(['navigation:update', '*:*']),
    schema: {
      params: NavigationItemIdSchema,
      body: UpdateNavigationItemSchema,
      response: { 200: NavigationItemResponseSchema },
    },
  },
  navigationItemsController.update,
);

// DELETE /api/navigation-items/:id
app.delete(
  '/navigation-items/:id',
  {
    onRequest: [app.authenticate],
    preHandler: app.requirePermission(['navigation:delete', '*:*']),
    schema: {
      params: NavigationItemIdSchema,
      response: { 200: SuccessResponseSchema },
    },
  },
  navigationItemsController.delete,
);

// POST /api/navigation-items/reorder
app.post(
  '/navigation-items/reorder',
  {
    onRequest: [app.authenticate],
    preHandler: app.requirePermission(['navigation:update', '*:*']),
    schema: {
      body: ReorderNavigationItemsSchema,
      response: { 200: SuccessResponseSchema },
    },
  },
  navigationItemsController.reorder,
);

// POST /api/navigation-items/:id/permissions
app.post(
  '/navigation-items/:id/permissions',
  {
    onRequest: [app.authenticate],
    preHandler: app.requirePermission(['navigation:update', '*:*']),
    schema: {
      params: NavigationItemIdSchema,
      body: AssignPermissionsSchema,
      response: { 200: PermissionsResponseSchema },
    },
  },
  navigationItemsController.assignPermissions,
);
```

### TypeBox Schemas

**Purpose**: Runtime validation + TypeScript types

```typescript
import { Type, Static } from '@sinclair/typebox';

// Navigation Item Schema
export const NavigationItemSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  parent_id: Type.Optional(Type.String({ format: 'uuid' })),
  key: Type.String({ maxLength: 100 }),
  title: Type.String({ maxLength: 200 }),
  type: Type.Union([
    Type.Literal('item'),
    Type.Literal('group'),
    Type.Literal('collapsible'),
    Type.Literal('divider'),
    Type.Literal('spacer')
  ]),
  icon: Type.Optional(Type.String({ maxLength: 100 })),
  link: Type.Optional(Type.String({ maxLength: 500 })),
  target: Type.Optional(Type.String()),
  sort_order: Type.Integer({ default: 0 }),
  disabled: Type.Boolean({ default: false }),
  hidden: Type.Boolean({ default: false }),
  exact_match: Type.Boolean({ default: false }),
  badge_title: Type.Optional(Type.String({ maxLength: 50 })),
  badge_classes: Type.Optional(Type.String({ maxLength: 200 })),
  badge_variant: Type.Optional(Type.String({ maxLength: 20 })),
  show_in_default: Type.Boolean({ default: true }),
  show_in_compact: Type.Boolean({ default: false }),
  show_in_horizontal: Type.Boolean({ default: false }),
  show_in_mobile: Type.Boolean({ default: true }),
  meta: Type.Optional(Type.Any()),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  permissions: Type.Optional(Type.Array(Type.String()))
});

// Create Request Schema
export const CreateNavigationItemSchema = Type.Object({
  parent_id: Type.Optional(Type.String({ format: 'uuid' })),
  key: Type.String({ maxLength: 100 }),
  title: Type.String({ maxLength: 200 }),
  type: Type.Union([...]),
  icon: Type.Optional(Type.String()),
  link: Type.Optional(Type.String()),
  target: Type.Optional(Type.String()),
  sort_order: Type.Optional(Type.Integer()),
  disabled: Type.Optional(Type.Boolean()),
  hidden: Type.Optional(Type.Boolean()),
  exact_match: Type.Optional(Type.Boolean()),
  badge_title: Type.Optional(Type.String()),
  badge_classes: Type.Optional(Type.String()),
  badge_variant: Type.Optional(Type.String()),
  show_in_default: Type.Optional(Type.Boolean()),
  show_in_compact: Type.Optional(Type.Boolean()),
  show_in_horizontal: Type.Optional(Type.Boolean()),
  show_in_mobile: Type.Optional(Type.Boolean()),
  meta: Type.Optional(Type.Any()),
  permission_ids: Type.Optional(Type.Array(Type.String({ format: 'uuid' })))
});

// Export types
export type NavigationItem = Static<typeof NavigationItemSchema>;
export type CreateNavigationItemRequest = Static<typeof CreateNavigationItemSchema>;
```

### Adding New Navigation Items (Backend)

```typescript
// In seed files or setup scripts
await knex('navigation_items').insert({
  id: generateUUID(),
  key: 'my-feature',
  title: 'My Feature',
  type: 'item',
  icon: 'star',
  link: '/my-feature',
  sort_order: 100,
  show_in_default: true,
  show_in_mobile: true,
  created_at: new Date(),
  updated_at: new Date(),
});

// Assign permissions
const navItemId = '...';
const permissionId = '...';

await knex('navigation_permissions').insert({
  navigation_item_id: navItemId,
  permission_id: permissionId,
  created_at: new Date(),
  updated_at: new Date(),
});
```

## Frontend Implementation

### Project Structure

```
apps/web/src/app/
├── core/navigation/
│   └── services/
│       └── navigation.service.ts     # Navigation menu service
├── core/rbac/
│   ├── pages/
│   │   └── navigation-management/
│   │       └── navigation-management.component.ts  # Management UI
│   ├── dialogs/
│   │   └── navigation-item-dialog/
│   │       └── navigation-item-dialog.component.ts # CRUD dialog
│   └── services/
│       └── navigation-items.service.ts  # CRUD API service
└── libs/aegisx-ui/src/lib/components/
    └── ax-navigation.component.ts       # Reusable navigation component
```

### Key Components

#### 1. NavigationService (Menu Display)

**Purpose**: Load and provide navigation data to components

```typescript
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private http = inject(HttpClient);

  // Signals for reactive state
  readonly navigationSignal = signal<Navigation>({});
  readonly isLoadingSignal = signal(false);

  /**
   * Load navigation for current user
   */
  async loadNavigation(): Promise<void> {
    try {
      this.isLoadingSignal.set(true);

      const response = await this.http.get<ApiResponse<Navigation>>('/api/navigation/user?type=all').toPromise();

      if (response) {
        this.navigationSignal.set(response.data);
      }
    } catch (error) {
      console.error('Failed to load navigation:', error);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Get navigation by type
   */
  getNavigation(type: NavigationType = 'default'): NavigationItem[] {
    return this.navigationSignal()[type] || [];
  }
}
```

#### 2. NavigationItemsService (CRUD Operations)

**Purpose**: API calls for navigation management

```typescript
@Injectable({ providedIn: 'root' })
export class NavigationItemsService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/navigation-items';

  getAll(): Observable<NavigationItem[]> {
    return this.http.get<ApiResponse<NavigationItem[]>>(this.baseUrl).pipe(map((response) => response.data));
  }

  getById(id: string): Observable<NavigationItem> {
    return this.http.get<ApiResponse<NavigationItem>>(`${this.baseUrl}/${id}`).pipe(map((response) => response.data));
  }

  create(data: CreateNavigationItemRequest): Observable<NavigationItem> {
    return this.http.post<ApiResponse<NavigationItem>>(this.baseUrl, data).pipe(map((response) => response.data));
  }

  update(id: string, data: UpdateNavigationItemRequest): Observable<NavigationItem> {
    return this.http.put<ApiResponse<NavigationItem>>(`${this.baseUrl}/${id}`, data).pipe(map((response) => response.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }

  reorder(orders: Array<{ id: string; sort_order: number }>): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/reorder`, { orders }).pipe(map(() => undefined));
  }

  assignPermissions(id: string, permissionIds: string[]): Observable<Permission[]> {
    return this.http
      .post<ApiResponse<Permission[]>>(`${this.baseUrl}/${id}/permissions`, {
        permission_ids: permissionIds,
      })
      .pipe(map((response) => response.data));
  }
}
```

#### 3. ax-navigation Component (Reusable Menu)

**Purpose**: Render navigation menu with animations and interactions

```typescript
@Component({
  selector: 'ax-navigation',
  standalone: true,
  template: `
    <nav class="ax-navigation">
      @for (item of items; track item.id) {
        @if (!isHidden(item)) {
          <div class="ax-navigation__item">
            @if (item.type === 'collapsible') {
              <!-- Collapsible menu group -->
              <button (click)="toggleCollapsible(item)" [attr.aria-expanded]="isExpanded(item)">
                <mat-icon>{{ item.icon }}</mat-icon>
                <span>{{ item.title }}</span>
                <mat-icon class="arrow" [class.rotated]="isExpanded(item)"> chevron_right </mat-icon>
              </button>

              @if (isExpanded(item) && item.children) {
                <div [@expandCollapse]>
                  <ng-container *ngFor="let child of item.children" [ngTemplateOutlet]="navigationItem" [ngTemplateOutletContext]="{ item: child }"> </ng-container>
                </div>
              }
            } @else {
              <!-- Regular menu item -->
              <a [routerLink]="item.link" routerLinkActive="active" [target]="item.target">
                <mat-icon>{{ item.icon }}</mat-icon>
                <span>{{ item.title }}</span>
                @if (item.badge) {
                  <span class="badge" [attr.data-variant]="item.badge.variant">
                    {{ item.badge.title }}
                  </span>
                }
              </a>
            }
          </div>
        }
      }
    </nav>
  `,
})
export class AxNavigationComponent {
  @Input() items: NavigationItem[] = [];
  @Output() itemClick = new EventEmitter<NavigationItem>();

  private _expandedItems = signal<Set<string>>(new Set());

  toggleCollapsible(item: NavigationItem): void {
    if (!item.id) return;
    this._expandedItems.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
      } else {
        newSet.add(item.id);
      }
      return newSet;
    });
  }

  isExpanded(item: NavigationItem): boolean {
    return item.id ? this._expandedItems().has(item.id) : false;
  }

  isHidden(item: NavigationItem): boolean {
    if (typeof item.hidden === 'function') {
      return item.hidden();
    }
    return item.hidden || false;
  }
}
```

#### 4. Navigation Management Component

**Purpose**: Admin UI for CRUD operations

```typescript
@Component({
  selector: 'app-navigation-management',
  template: `
    <!-- Toolbar -->
    <div class="toolbar">
      <h2>Navigation Management</h2>
      <button mat-raised-button color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
        Create Navigation Item
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <mat-form-field>
        <input matInput placeholder="Search..." [ngModel]="filters().search" (ngModelChange)="updateSearchFilter($event)" />
      </mat-form-field>

      <mat-form-field>
        <mat-select placeholder="Type" [ngModel]="filters().type" (ngModelChange)="updateTypeFilter($event)">
          <mat-option [value]="null">All Types</mat-option>
          <mat-option value="item">Item</mat-option>
          <mat-option value="group">Group</mat-option>
          <mat-option value="collapsible">Collapsible</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-button (click)="resetFilters()">Reset</button>
    </div>

    <!-- Table -->
    <table mat-table [dataSource]="filteredNavigationItems()">
      <!-- Columns... -->
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
    </table>
  `,
})
export class NavigationManagementComponent implements OnInit {
  private navigationService = inject(NavigationItemsService);
  private dialog = inject(MatDialog);

  // Signals
  readonly navigationItems = signal<NavigationItem[]>([]);
  readonly filters = signal<NavigationFilters>({
    search: '',
    type: null,
    disabled: null,
    hidden: null,
  });

  readonly filteredNavigationItems = computed(() => {
    let filtered = this.navigationItems();
    const currentFilters = this.filters();

    if (currentFilters.search) {
      const search = currentFilters.search.toLowerCase();
      filtered = filtered.filter((item) => item.key.toLowerCase().includes(search) || item.title.toLowerCase().includes(search));
    }

    if (currentFilters.type) {
      filtered = filtered.filter((item) => item.type === currentFilters.type);
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadNavigationItems();
  }

  async loadNavigationItems(): Promise<void> {
    const items = await this.navigationService.getAll().toPromise();
    if (items) {
      this.navigationItems.set(items);
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(NavigationItemDialogComponent, {
      data: {
        mode: 'create',
        availableNavigationItems: this.navigationItems(),
      },
      width: '900px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadNavigationItems();
      }
    });
  }

  openEditDialog(item: NavigationItem): void {
    const dialogRef = this.dialog.open(NavigationItemDialogComponent, {
      data: {
        mode: 'edit',
        navigationItem: item,
        availableNavigationItems: this.navigationItems(),
      },
      width: '900px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadNavigationItems();
      }
    });
  }

  async deleteItem(item: NavigationItem): Promise<void> {
    const confirmed = await this.confirmDelete(item);
    if (!confirmed) return;

    await this.navigationService.delete(item.id).toPromise();
    this.loadNavigationItems();
  }
}
```

### Frontend Type Definitions

```typescript
// Frontend types (matching backend but with string[] for permissions)
export interface NavigationItem {
  id: string;
  parent_id?: string;
  key: string;
  title: string;
  type: 'item' | 'group' | 'collapsible' | 'divider' | 'spacer';
  icon?: string;
  link?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  sort_order: number;
  disabled: boolean;
  hidden: boolean;
  exact_match: boolean;
  badge_title?: string;
  badge_classes?: string;
  badge_variant?: string;
  show_in_default: boolean;
  show_in_compact: boolean;
  show_in_horizontal: boolean;
  show_in_mobile: boolean;
  meta?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  // Backend returns permissions as string[] like ['users.create', 'users.read']
  permissions?: string[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Navigation {
  default?: NavigationItem[];
  compact?: NavigationItem[];
  horizontal?: NavigationItem[];
  mobile?: NavigationItem[];
}
```

## Integration Guide

### Adding Navigation to New Module

**Step 1: Create Database Migration**

```typescript
// migrations/xxx_add_inventory_navigation.ts
export async function up(knex: Knex): Promise<void> {
  // Create parent group
  const [parentId] = await knex('navigation_items')
    .insert({
      id: knex.raw('gen_random_uuid()'),
      key: 'inventory',
      title: 'Inventory',
      type: 'collapsible',
      icon: 'inventory_2',
      sort_order: 50,
      show_in_default: true,
      show_in_mobile: true,
    })
    .returning('id');

  // Create child items
  await knex('navigation_items').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      parent_id: parentId,
      key: 'inventory-items',
      title: 'Items',
      type: 'item',
      icon: 'list',
      link: '/inventory/items',
      sort_order: 1,
      show_in_default: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      parent_id: parentId,
      key: 'inventory-reports',
      title: 'Reports',
      type: 'item',
      icon: 'bar_chart',
      link: '/inventory/reports',
      sort_order: 2,
      show_in_default: true,
    },
  ]);

  // Assign permissions
  const permission = await knex('permissions').where({ resource: 'inventory', action: 'read' }).first();

  if (permission) {
    await knex('navigation_permissions').insert({
      navigation_item_id: parentId,
      permission_id: permission.id,
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex('navigation_items').whereIn('key', ['inventory', 'inventory-items', 'inventory-reports']).delete();
}
```

**Step 2: Create Route with Permission Guard**

```typescript
// apps/web/src/app/features/inventory/inventory.routes.ts
export const inventoryRoutes: Routes = [
  {
    path: '',
    redirectTo: 'items',
    pathMatch: 'full',
  },
  {
    path: 'items',
    loadComponent: () => import('./pages/items-list/items-list.component').then((m) => m.ItemsListComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      title: 'Inventory Items',
      permissions: ['inventory:read', '*:*'],
    },
  },
];
```

**Step 3: Register Routes in App**

```typescript
// apps/web/src/app/app.routes.ts
export const appRoutes: Route[] = [
  // ... other routes
  {
    path: 'inventory',
    loadChildren: () => import('./features/inventory/inventory.routes').then((m) => m.inventoryRoutes),
    canActivate: [AuthGuard],
  },
];
```

**Step 4: Cache Invalidation After Setup**

```bash
# Via API or admin panel
curl -X POST http://localhost:3333/api/navigation/invalidate-cache \
  -H "Authorization: Bearer $TOKEN"

# Or clear Redis manually
redis-cli DEL "navigation:*"
```

### Programmatic Navigation Updates

```typescript
// In backend service or setup script
import { NavigationService } from './navigation/services/navigation.service';

class InventorySetup {
  constructor(private navigationService: NavigationService) {}

  async setupNavigation() {
    // Create parent
    const parent = await this.navigationService.createNavigationItem({
      key: 'inventory',
      title: 'Inventory',
      type: 'collapsible',
      icon: 'inventory_2',
      sort_order: 50,
      show_in_default: true,
      permission_ids: [inventoryReadPermissionId],
    });

    // Create children
    await this.navigationService.createNavigationItem({
      parent_id: parent.id,
      key: 'inventory-items',
      title: 'Items',
      type: 'item',
      icon: 'list',
      link: '/inventory/items',
      sort_order: 1,
      show_in_default: true,
      permission_ids: [inventoryReadPermissionId],
    });

    // Cache automatically invalidated
  }
}
```

## Testing

### Unit Tests

**Backend Repository Tests**:

```typescript
describe('NavigationRepository', () => {
  let repository: NavigationRepository;
  let knex: Knex;

  beforeEach(() => {
    // Setup test database
    knex = setupTestDatabase();
    repository = new NavigationRepository(knex);
  });

  it('should get all navigation items', async () => {
    const items = await repository.getNavigationItems(false, false);
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should filter by user permissions', async () => {
    const userId = 'test-user-id';
    const items = await repository.getUserNavigationItems(userId, 'default', false);

    // Verify only items user has permission for are returned
    items.forEach((item) => {
      if (item.permissions && item.permissions.length > 0) {
        // Item has permissions, user must have at least one
        expect(userHasPermission(userId, item.permissions)).toBe(true);
      }
    });
  });

  it('should build hierarchical tree', async () => {
    const items = await repository.getNavigationItems(false, false);
    const rootItems = items.filter((item) => !item.parent_id);

    rootItems.forEach((root) => {
      if (root.children && root.children.length > 0) {
        // Verify children sorted by sort_order
        const sortOrders = root.children.map((c) => c.sort_order);
        expect(sortOrders).toEqual([...sortOrders].sort((a, b) => a - b));
      }
    });
  });
});
```

**Frontend Component Tests**:

```typescript
describe('NavigationManagementComponent', () => {
  let component: NavigationManagementComponent;
  let fixture: ComponentFixture<NavigationManagementComponent>;
  let navigationService: jasmine.SpyObj<NavigationItemsService>;

  beforeEach(() => {
    const navServiceSpy = jasmine.createSpyObj('NavigationItemsService',
      ['getAll', 'create', 'update', 'delete']);

    TestBed.configureTestingModule({
      imports: [NavigationManagementComponent],
      providers: [
        { provide: NavigationItemsService, useValue: navServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(NavigationManagementComponent);
    component = fixture.componentInstance;
    navigationService = TestBed.inject(NavigationItemsService) as jasmine.SpyObj<NavigationItemsService>;
  });

  it('should load navigation items on init', async () => {
    const mockItems: NavigationItem[] = [
      { id: '1', key: 'test', title: 'Test', ... }
    ];
    navigationService.getAll.and.returnValue(of(mockItems));

    component.ngOnInit();

    expect(navigationService.getAll).toHaveBeenCalled();
    expect(component.navigationItems()).toEqual(mockItems);
  });

  it('should filter items by search', () => {
    component.navigationItems.set([
      { id: '1', key: 'dashboard', title: 'Dashboard', ... },
      { id: '2', key: 'users', title: 'Users', ... }
    ]);

    component.updateSearchFilter('dash');

    const filtered = component.filteredNavigationItems();
    expect(filtered.length).toBe(1);
    expect(filtered[0].key).toBe('dashboard');
  });
});
```

### Integration Tests

```typescript
describe('Navigation API Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  it('GET /api/navigation/user returns filtered navigation', async () => {
    // Create test user with specific permissions
    const user = await createTestUser({
      permissions: ['users:read'],
    });
    const token = generateToken(user);

    const response = await app.inject({
      method: 'GET',
      url: '/api/navigation/user?type=default',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.success).toBe(true);
    expect(data.data.default).toBeDefined();

    // Verify only items user has permission for are returned
    data.data.default.forEach((item: NavigationItem) => {
      if (item.permissions && item.permissions.length > 0) {
        expect(item.permissions.some((p) => ['users:read', '*:*'].includes(p))).toBe(true);
      }
    });
  });

  it('POST /api/navigation-items creates item and invalidates cache', async () => {
    const admin = await createAdminUser();
    const token = generateToken(admin);

    // Warm up cache
    await app.inject({
      method: 'GET',
      url: '/api/navigation/user?type=default',
      headers: { authorization: `Bearer ${token}` },
    });

    // Create new item
    const response = await app.inject({
      method: 'POST',
      url: '/api/navigation-items',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        key: 'test-item',
        title: 'Test Item',
        type: 'item',
        link: '/test',
        sort_order: 100,
        show_in_default: true,
      },
    });

    expect(response.statusCode).toBe(200);

    // Verify cache invalidated (new item appears in next request)
    const navResponse = await app.inject({
      method: 'GET',
      url: '/api/navigation/user?type=default',
      headers: { authorization: `Bearer ${token}` },
    });

    const navData = JSON.parse(navResponse.payload);
    const newItem = navData.data.default.find((item: NavigationItem) => item.key === 'test-item');
    expect(newItem).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create new navigation item', async ({ page }) => {
    // Navigate to management page
    await page.goto('/rbac/navigation');

    // Click create button
    await page.click('button:has-text("Create Navigation Item")');

    // Fill form
    await page.fill('[formControlName="key"]', 'test-feature');
    await page.fill('[formControlName="title"]', 'Test Feature');
    await page.selectOption('[formControlName="type"]', 'item');
    await page.fill('[formControlName="icon"]', 'star');
    await page.fill('[formControlName="link"]', '/test');

    // Submit
    await page.click('button:has-text("Create Item")');

    // Verify success
    await expect(page.locator('.mat-snack-bar-container')).toContainText('successfully');

    // Verify item appears in table
    await expect(page.locator('table tbody tr')).toContainText('test-feature');
  });

  test('should filter navigation items', async ({ page }) => {
    await page.goto('/rbac/navigation');

    // Type in search
    await page.fill('input[placeholder="Search..."]', 'dashboard');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Verify only matching items shown
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('dashboard');
  });
});
```

## Performance Optimization

### Query Optimization

**Use Single Query with JOINs**:

```typescript
// ✅ GOOD: Single query with aggregation
const items = await this.knex('navigation_items as ni')
  .select([
    'ni.*',
    this.knex.raw(
      "ARRAY_AGG(DISTINCT CONCAT(p.resource, '.', p.action)) FILTER (WHERE p.id IS NOT NULL) as permissions"
    )
  ])
  .leftJoin('navigation_permissions as np', 'ni.id', 'np.navigation_item_id')
  .leftJoin('permissions as p', 'np.permission_id', 'p.id')
  .groupBy('ni.id');

// ❌ BAD: N+1 query problem
const items = await this.knex('navigation_items').select('*');
for (const item of items) {
  item.permissions = await this.knex('permissions')
    .join('navigation_permissions', ...)
    .where('navigation_item_id', item.id);
}
```

### Caching Strategy

**Layered Caching**:

```typescript
class NavigationService {
  // 1. Check Redis cache
  async getCachedData(key: string) {
    if (this.redis) {
      const cached = await this.redis.get(key);
      if (cached) return JSON.parse(cached);
    }

    // 2. Fallback to in-memory cache
    const memCached = this.memoryCache.get(key);
    if (memCached && memCached.expires > Date.now()) {
      return memCached.data;
    }

    // 3. Cache miss
    return null;
  }

  // Set both Redis and memory cache
  async setCachedData(key: string, data: any, ttl: number) {
    // Redis (persistent)
    if (this.redis) {
      await this.redis.setex(key, ttl, JSON.stringify(data));
    }

    // Memory (fast access)
    this.memoryCache.set(key, {
      data,
      expires: Date.now() + ttl * 1000,
    });
  }
}
```

**Cache Warming**:

```typescript
// Warm up cache on application startup
class NavigationPlugin {
  async onAppStart(app: FastifyInstance) {
    const navigationService = new NavigationService(app);

    // Warm up common navigation types
    await Promise.all([navigationService.getNavigation({ type: 'default' }), navigationService.getNavigation({ type: 'mobile' })]);

    app.log.info('Navigation cache warmed up');
  }
}
```

### Frontend Optimization

**Lazy Loading**:

```typescript
// Load navigation management only when needed
{
  path: 'navigation',
  loadComponent: () => import('./pages/navigation-management/navigation-management.component')
    .then(m => m.NavigationManagementComponent)
}
```

**Virtual Scrolling** (for large lists):

```typescript
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="48" class="viewport">
      <div *cdkVirtualFor="let item of items">
        {{ item.title }}
      </div>
    </cdk-virtual-scroll-viewport>
  `,
})
export class LargeNavigationListComponent {
  items: NavigationItem[] = [];
}
```

## Extending the System

### Adding Custom Fields

**Step 1: Database Migration**

```typescript
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('navigation_items', (table) => {
    table.string('custom_field', 255);
    table.jsonb('custom_metadata');
  });
}
```

**Step 2: Update TypeScript Types**

```typescript
// Backend
interface NavigationItemEntity {
  // ... existing fields
  custom_field?: string;
  custom_metadata?: Record<string, any>;
}

// Frontend
interface NavigationItem {
  // ... existing fields
  custom_field?: string;
  custom_metadata?: Record<string, any>;
}
```

**Step 3: Update Schemas**

```typescript
export const NavigationItemSchema = Type.Object({
  // ... existing fields
  custom_field: Type.Optional(Type.String({ maxLength: 255 })),
  custom_metadata: Type.Optional(Type.Any()),
});
```

**Step 4: Update UI**

```html
<!-- In navigation-item-dialog.component.html -->
<mat-form-field>
  <mat-label>Custom Field</mat-label>
  <input matInput formControlName="custom_field" />
</mat-form-field>
```

### Custom Permission Logic

```typescript
class CustomNavigationRepository extends NavigationRepository {
  /**
   * Override permission filtering with custom logic
   */
  protected override filterByPermissions(items: NavigationItemWithChildren[], userPermissions: string[]): NavigationItemWithChildren[] {
    return items.filter((item) => {
      // No permissions = public access
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      // Admin wildcard
      if (userPermissions.includes('*:*')) {
        return true;
      }

      // Custom logic: Require ALL permissions (AND logic)
      return item.permissions.every((permission) => userPermissions.includes(permission));

      // Or use original OR logic:
      // return item.permissions.some(permission =>
      //   userPermissions.includes(permission)
      // );
    });
  }
}
```

### Dynamic Badge Counts

```typescript
class NotificationNavigationService extends NavigationService {
  /**
   * Update badge counts dynamically
   */
  async updateBadgeCounts(userId: string) {
    // Get unread count from another service
    const unreadCount = await notificationService.getUnreadCount(userId);

    // Update navigation item
    const notificationItem = await this.getNavigationItemByKey('notifications');
    if (notificationItem) {
      await this.updateNavigationItem(notificationItem.id, {
        badge_title: unreadCount > 0 ? String(unreadCount) : undefined,
      });

      // Invalidate user cache only
      await this.invalidateCache(userId);
    }
  }
}
```

## Migration Guide

### Migrating from Static Menu to Dynamic Navigation

**Before** (Hardcoded in Component):

```typescript
// Old: Hardcoded menu
@Component({
  template: `
    <nav>
      <a routerLink="/dashboard">Dashboard</a>
      <a routerLink="/users">Users</a>
      <a routerLink="/settings">Settings</a>
    </nav>
  `,
})
export class OldNavComponent {
  // No data, all static
}
```

**After** (Database-Driven):

**Step 1**: Migrate existing menu to database

```typescript
// Create migration with existing menu structure
export async function up(knex: Knex): Promise<void> {
  await knex('navigation_items').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      key: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      icon: 'dashboard',
      link: '/dashboard',
      sort_order: 10,
      show_in_default: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      key: 'users',
      title: 'Users',
      type: 'item',
      icon: 'people',
      link: '/users',
      sort_order: 20,
      show_in_default: true,
    },
    {
      id: knex.raw('gen_random_uuid()'),
      key: 'settings',
      title: 'Settings',
      type: 'item',
      icon: 'settings',
      link: '/settings',
      sort_order: 30,
      show_in_default: true,
    },
  ]);
}
```

**Step 2**: Replace component

```typescript
// New: Dynamic from database
@Component({
  template: ` <ax-navigation [items]="navigation().default" (itemClick)="onItemClick($event)"> </ax-navigation> `,
})
export class NewNavComponent {
  private navigationService = inject(NavigationService);
  readonly navigation = this.navigationService.navigationSignal;

  constructor() {
    this.navigationService.loadNavigation();
  }

  onItemClick(item: NavigationItem) {
    // Handle custom logic
  }
}
```

**Step 3**: Add permission-based filtering

```typescript
// Assign permissions to sensitive items
await knex('navigation_permissions').insert([
  {
    navigation_item_id: usersItemId,
    permission_id: usersReadPermissionId,
  },
  {
    navigation_item_id: settingsItemId,
    permission_id: settingsManagePermissionId,
  },
]);
```

**Step 4**: Test with different user roles

```bash
# Test as admin (sees all)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3333/api/navigation/user

# Test as regular user (sees filtered)
curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:3333/api/navigation/user
```

**Benefits of Migration**:

- ✅ Dynamic menu management (no code changes)
- ✅ Permission-based access control
- ✅ Hierarchical organization
- ✅ Multi-layout support
- ✅ Badge notifications
- ✅ Centralized configuration

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-29
**Maintained By**: Development Team
