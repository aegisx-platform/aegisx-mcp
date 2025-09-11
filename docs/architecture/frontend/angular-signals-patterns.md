# Angular Signals Patterns

## Signal-Based State Management

### Service with Signals Pattern

```typescript
// Core service pattern with signals
@Injectable({ providedIn: 'root' })
export class BaseSignalService<T> {
  // Private signals (mutable)
  private dataSignal = signal<T[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private selectedSignal = signal<T | null>(null);

  // Public readonly signals
  readonly data = this.dataSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selected = this.selectedSignal.asReadonly();

  // Computed signals
  readonly isEmpty = computed(() => this.data().length === 0);
  readonly hasError = computed(() => this.error() !== null);
  readonly isReady = computed(() => !this.loading() && !this.hasError());

  // Actions
  setData(data: T[]) {
    this.dataSignal.set(data);
  }
  setLoading(loading: boolean) {
    this.loadingSignal.set(loading);
  }
  setError(error: string | null) {
    this.errorSignal.set(error);
  }
  setSelected(item: T | null) {
    this.selectedSignal.set(item);
  }

  // Update operations
  addItem(item: T) {
    this.dataSignal.update((items) => [...items, item]);
  }

  updateItem(id: string, updates: Partial<T>) {
    this.dataSignal.update((items) => items.map((item) => ((item as any).id === id ? { ...item, ...updates } : item)));
  }

  removeItem(id: string) {
    this.dataSignal.update((items) => items.filter((item) => (item as any).id !== id));
  }
}
```

### Advanced Signal Patterns

```typescript
// Complex state with multiple signal types
@Injectable({ providedIn: 'root' })
export class UserService extends BaseSignalService<User> {
  // Additional signals for user-specific features
  private searchSignal = signal('');
  private filtersSignal = signal<UserFilters>({});
  private paginationSignal = signal({ page: 1, limit: 10 });

  // Computed derived state
  readonly filteredUsers = computed(() => {
    const users = this.data();
    const search = this.searchSignal().toLowerCase();
    const filters = this.filtersSignal();

    return users.filter((user) => {
      // Search filter
      if (search && !this.matchesSearch(user, search)) return false;

      // Role filter
      if (filters.role && user.role.name !== filters.role) return false;

      // Status filter
      if (filters.status !== undefined && user.isActive !== filters.status) return false;

      return true;
    });
  });

  readonly paginatedUsers = computed(() => {
    const filtered = this.filteredUsers();
    const { page, limit } = this.paginationSignal();
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  });

  readonly totalPages = computed(() => {
    const total = this.filteredUsers().length;
    const { limit } = this.paginationSignal();
    return Math.ceil(total / limit);
  });

  // Signal actions
  search(term: string) {
    this.searchSignal.set(term);
    this.resetPagination();
  }

  setFilters(filters: UserFilters) {
    this.filtersSignal.set(filters);
    this.resetPagination();
  }

  setPage(page: number) {
    this.paginationSignal.update((p) => ({ ...p, page }));
  }

  private resetPagination() {
    this.paginationSignal.update((p) => ({ ...p, page: 1 }));
  }

  private matchesSearch(user: User, search: string): boolean {
    return [user.email, user.firstName, user.lastName, user.username].some((field) => field?.toLowerCase().includes(search));
  }
}
```

## Component Patterns with Signals

### Smart Component Pattern

```typescript
// Smart component - connects to services and manages state
@Component({
  selector: 'app-user-management',
  standalone: true,
  template: `
    <div class="p-6">
      <app-user-filters [filters]="currentFilters()" (filtersChange)="onFiltersChange($event)" (search)="onSearch($event)" />

      <app-user-list [users]="userService.paginatedUsers()" [loading]="userService.loading()" [error]="userService.error()" [selectedIds]="selectedIds()" (selectionChange)="onSelectionChange($event)" (userAction)="onUserAction($event)" />

      <app-pagination [currentPage]="userService.pagination().page" [totalPages]="userService.totalPages()" (pageChange)="onPageChange($event)" />
    </div>
  `,
})
export class UserManagementComponent {
  userService = inject(UserService);

  // Local component state
  selectedIds = signal<Set<string>>(new Set());
  currentFilters = signal<UserFilters>({});

  // Effects for side effects
  constructor() {
    // Auto-load data when filters change
    effect(() => {
      const filters = this.currentFilters();
      this.userService.loadUsers(filters);
    });
  }

  // Event handlers
  onFiltersChange(filters: UserFilters) {
    this.currentFilters.set(filters);
  }

  onSearch(term: string) {
    this.userService.search(term);
  }

  onSelectionChange(ids: Set<string>) {
    this.selectedIds.set(ids);
  }

  onUserAction(action: { type: string; user: User }) {
    switch (action.type) {
      case 'edit':
        this.router.navigate(['/users', action.user.id, 'edit']);
        break;
      case 'delete':
        this.deleteUser(action.user);
        break;
    }
  }

  onPageChange(page: number) {
    this.userService.setPage(page);
  }

  private async deleteUser(user: User) {
    if (confirm(`Delete ${user.firstName} ${user.lastName}?`)) {
      await this.userService.deleteUser(user.id);
    }
  }
}
```

### Presentational Component Pattern

```typescript
// Presentational component - pure UI, no service dependencies
@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    @if (loading) {
      <div class="flex justify-center p-8">
        <mat-spinner></mat-spinner>
      </div>
    } @else if (error) {
      <div class="bg-red-50 text-red-700 p-4 rounded">
        {{ error }}
      </div>
    } @else {
      <div class="overflow-x-auto">
        <table mat-table [dataSource]="users" class="w-full">
          <!-- Table columns -->
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let user; columns: displayedColumns" [class.bg-blue-50]="selectedIds.has(user.id)" (click)="selectUser(user)"></tr>
        </table>
      </div>
    }
  `,
})
export class UserListComponent {
  // Input properties with proper typing
  @Input({ required: true }) users: User[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() selectedIds = new Set<string>();

  // Output events
  @Output() selectionChange = new EventEmitter<Set<string>>();
  @Output() userAction = new EventEmitter<{ type: string; user: User }>();

  displayedColumns = ['select', 'name', 'email', 'role', 'status', 'actions'];

  selectUser(user: User) {
    this.userAction.emit({ type: 'select', user });
  }

  editUser(user: User) {
    this.userAction.emit({ type: 'edit', user });
  }

  deleteUser(user: User) {
    this.userAction.emit({ type: 'delete', user });
  }
}
```

## Signal Composition Patterns

### Combining Multiple Services

```typescript
// Dashboard service combining multiple data sources
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);

  // Combined loading state
  readonly isLoading = computed(() => this.userService.loading() || this.orderService.loading() || this.productService.loading());

  // Combined error state
  readonly hasErrors = computed(() => this.userService.hasError() || this.orderService.hasError() || this.productService.hasError());

  // Dashboard summary data
  readonly dashboardSummary = computed(() => ({
    users: {
      total: this.userService.data().length,
      active: this.userService.data().filter((u) => u.isActive).length,
    },
    orders: {
      total: this.orderService.data().length,
      pending: this.orderService.data().filter((o) => o.status === 'pending').length,
    },
    products: {
      total: this.productService.data().length,
      inStock: this.productService.data().filter((p) => p.stock > 0).length,
    },
  }));

  constructor() {
    // Load all data on initialization
    effect(() => {
      this.loadDashboardData();
    });
  }

  private async loadDashboardData() {
    await Promise.all([this.userService.loadUsers(), this.orderService.loadOrders(), this.productService.loadProducts()]);
  }
}
```

### Signal-based Form Validation

```typescript
// Advanced form with signal-based validation
@Component({
  selector: 'app-user-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- Form fields -->

      <!-- Real-time validation feedback -->
      @if (emailExists()) {
        <div class="text-red-600 text-sm">Email already exists</div>
      }

      @if (usernameExists()) {
        <div class="text-red-600 text-sm">Username already taken</div>
      }

      <button type="submit" [disabled]="!canSubmit()">
        @if (submitting()) {
          <mat-spinner diameter="16"></mat-spinner>
        }
        {{ submitButtonText() }}
      </button>
    </form>
  `,
})
export class UserFormComponent {
  private userService = inject(UserService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  // Signal-based validation
  private emailCheckSignal = signal<string>('');
  private usernameCheckSignal = signal<string>('');
  submitting = signal(false);

  // Real-time validation computed signals
  readonly emailExists = computed(() => {
    const email = this.emailCheckSignal();
    if (!email) return false;

    return this.userService.data().some((user) => user.email.toLowerCase() === email.toLowerCase());
  });

  readonly usernameExists = computed(() => {
    const username = this.usernameCheckSignal();
    if (!username) return false;

    return this.userService.data().some((user) => user.username.toLowerCase() === username.toLowerCase());
  });

  readonly canSubmit = computed(() => this.form.valid && !this.emailExists() && !this.usernameExists() && !this.submitting());

  readonly submitButtonText = computed(() => (this.submitting() ? 'Saving...' : 'Save User'));

  constructor() {
    // Watch form changes and trigger validation
    effect(() => {
      const email = this.form.get('email')?.value;
      if (email && this.form.get('email')?.valid) {
        // Debounce email check
        setTimeout(() => this.emailCheckSignal.set(email), 500);
      }
    });

    effect(() => {
      const username = this.form.get('username')?.value;
      if (username && this.form.get('username')?.valid) {
        // Debounce username check
        setTimeout(() => this.usernameCheckSignal.set(username), 500);
      }
    });
  }

  async onSubmit() {
    if (!this.canSubmit()) return;

    this.submitting.set(true);

    try {
      const formData = this.form.value as CreateUserRequest;
      await this.userService.createUser(formData);
      this.router.navigate(['/users']);
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      this.submitting.set(false);
    }
  }
}
```

## Signal Performance Patterns

### Optimized List Management

```typescript
@Injectable({ providedIn: 'root' })
export class OptimizedUserService {
  // Use Map for O(1) lookups
  private usersMapSignal = signal(new Map<string, User>());
  private userIdsSignal = signal<string[]>([]);

  // Computed arrays from Map
  readonly users = computed(() => this.userIdsSignal().map((id) => this.usersMapSignal().get(id)!));

  // Efficient updates
  updateUser(id: string, updates: Partial<User>) {
    this.usersMapSignal.update((map) => {
      const newMap = new Map(map);
      const existing = newMap.get(id);
      if (existing) {
        newMap.set(id, { ...existing, ...updates });
      }
      return newMap;
    });
  }

  addUser(user: User) {
    this.usersMapSignal.update((map) => new Map(map).set(user.id, user));
    this.userIdsSignal.update((ids) => [...ids, user.id]);
  }

  removeUser(id: string) {
    this.usersMapSignal.update((map) => {
      const newMap = new Map(map);
      newMap.delete(id);
      return newMap;
    });
    this.userIdsSignal.update((ids) => ids.filter((uid) => uid !== id));
  }
}
```

### Signal Effects for Side Effects

```typescript
@Component({
  selector: 'app-user-dashboard',
})
export class UserDashboardComponent {
  userService = inject(UserService);
  notificationService = inject(NotificationService);

  // Signal for search with debouncing
  searchInput = signal('');

  constructor() {
    // Debounced search effect
    effect((onCleanup) => {
      const searchTerm = this.searchInput();

      const timeoutId = setTimeout(() => {
        this.userService.search(searchTerm);
      }, 300);

      onCleanup(() => clearTimeout(timeoutId));
    });

    // Auto-save effect
    effect(() => {
      const selectedUser = this.userService.selected();
      if (selectedUser) {
        // Save to localStorage
        localStorage.setItem('selectedUserId', selectedUser.id);
      }
    });

    // Error notification effect
    effect(() => {
      const error = this.userService.error();
      if (error) {
        this.notificationService.showError(error);
      }
    });
  }
}
```

## Signal Testing Patterns

### Testing Services with Signals

```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: spy }],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should update users signal when loaded', async () => {
    const mockUsers = [{ id: '1', email: 'test@example.com', firstName: 'Test' }];

    httpMock.get.and.returnValue(
      of({
        success: true,
        data: mockUsers,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    );

    await service.loadUsers();

    expect(service.users()).toEqual(mockUsers);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should handle filtered users correctly', () => {
    // Set test data
    service.setData([
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' },
    ]);

    // Test search
    service.search('john');

    expect(service.filteredUsers()).toHaveLength(1);
    expect(service.filteredUsers()[0].firstName).toBe('John');
  });
});
```

### Testing Components with Signals

```typescript
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should react to signal changes', () => {
    // Update signal
    component.users = signal([{ id: '1', firstName: 'John', email: 'john@test.com' }]);

    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('[data-testid="user-row"]'));
    expect(rows).toHaveLength(1);
  });

  it('should emit events correctly', () => {
    spyOn(component.userAction, 'emit');

    const user = { id: '1', firstName: 'John' } as User;
    component.editUser(user);

    expect(component.userAction.emit).toHaveBeenCalledWith({
      type: 'edit',
      user,
    });
  });
});
```

## Best Practices

### 1. Signal Naming Conventions

```typescript
// Clear naming for signal types
class UserService {
  // Private mutable signals
  private usersSignal = signal<User[]>([]); // Data
  private loadingSignal = signal(false); // State
  private errorSignal = signal<string | null>(null); // Errors

  // Public readonly signals
  readonly users = this.usersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals (no Signal suffix)
  readonly activeUsers = computed(() => this.users().filter((u) => u.isActive));
}
```

### 2. Signal Update Patterns

```typescript
// Immutable updates
updateUser(id: string, updates: Partial<User>) {
  this.usersSignal.update(users =>
    users.map(user =>
      user.id === id ? { ...user, ...updates } : user
    )
  );
}

// Batch updates
updateMultipleUsers(updates: Array<{ id: string; data: Partial<User> }>) {
  this.usersSignal.update(users => {
    const updatesMap = new Map(updates.map(u => [u.id, u.data]));

    return users.map(user => {
      const update = updatesMap.get(user.id);
      return update ? { ...user, ...update } : user;
    });
  });
}
```

### 3. Effect Cleanup

```typescript
constructor() {
  // Effect with cleanup
  effect((onCleanup) => {
    const subscription = this.dataStream$.subscribe(data => {
      this.dataSignal.set(data);
    });

    onCleanup(() => subscription.unsubscribe());
  });

  // Timer effect with cleanup
  effect((onCleanup) => {
    const interval = setInterval(() => {
      this.refreshData();
    }, 30000);

    onCleanup(() => clearInterval(interval));
  });
}
```

### 4. Signal Dependencies

```typescript
// Clear signal dependencies
readonly summary = computed(() => {
  const users = this.userService.users();      // Dependency 1
  const orders = this.orderService.orders();   // Dependency 2

  return {
    totalUsers: users.length,
    totalOrders: orders.length,
    averageOrdersPerUser: users.length > 0 ? orders.length / users.length : 0
  };
});
```

### 5. Avoiding Signal Pitfalls

```typescript
// ❌ Don't do this - creates infinite loop
effect(() => {
  const count = this.countSignal();
  this.countSignal.set(count + 1); // Infinite loop!
});

// ✅ Do this instead - guard against unnecessary updates
effect(() => {
  const users = this.users();
  const count = users.length;

  if (this.userCountSignal() !== count) {
    this.userCountSignal.set(count);
  }
});

// ❌ Don't call signals in callbacks without effect
onClick() {
  // Signal not tracked properly
  setTimeout(() => {
    this.dataSignal.set(newData); // Won't trigger change detection
  }, 1000);
}

// ✅ Use effect for async operations
constructor() {
  effect((onCleanup) => {
    const trigger = this.refreshTrigger();

    const timeout = setTimeout(async () => {
      const data = await this.loadData();
      this.dataSignal.set(data);
    }, 1000);

    onCleanup(() => clearTimeout(timeout));
  });
}
```
