# Frontend Architecture Patterns

## Angular Feature Module Pattern

The frontend uses a feature-based module structure with smart and presentational components pattern.

### Why Feature Module Pattern?

- **Lazy Loading**: Load features only when needed
- **Code Organization**: Related components stay together
- **Reusability**: Share components within feature
- **Team Collaboration**: Teams own complete features
- **Testing**: Test features in isolation

### Module Structure Decision Guide

**Use Basic Structure when:**

- Simple CRUD operations
- 3-5 components per feature
- No complex state management
- Single route hierarchy

**Use Complex Structure (with NgRx) when:**

- Complex state management needed
- Multiple components share state
- Side effects and async operations
- Need time-travel debugging
- Optimistic updates required

### UI Component Patterns

**Smart Components (Containers):**

- Connect to services/store
- Handle business logic
- Manage state
- Pass data to presentational components

**Presentational Components:**

- Receive data via @Input()
- Emit events via @Output()
- Focus on UI presentation
- Highly reusable

### Angular Material + TailwindCSS Strategy

**Use Angular Material for:**

- Complex components (Tables, Forms, Dialogs)
- Consistent interaction patterns
- Accessibility requirements
- Theme consistency

**Use TailwindCSS for:**

- Layout and spacing
- Custom styling
- Utility classes
- Responsive design
- Quick prototyping

**Combination Example:**

```html
<!-- Angular Material component with Tailwind utilities -->
<mat-card class="shadow-lg hover:shadow-xl transition-shadow duration-300">
  <mat-card-content class="p-6 space-y-4">
    <!-- Content -->
  </mat-card-content>
</mat-card>
```

### Form Handling Best Practices

**Reactive Forms:**

- Use for complex forms
- Dynamic form controls
- Custom validators
- Cross-field validation

**Template-driven Forms:**

- Use for simple forms
- Quick prototypes
- Two-way data binding

**Validation Strategy:**

- Client-side validation for UX
- Server-side validation for security
- Display inline errors
- Show loading states

### State Management Decision Tree

```
Need State Management?
├── Simple component state → Use Signals
├── Parent-child sharing → Use Signal + @Input/@Output
├── Sibling sharing → Use service with Signals
├── Complex app state → Consider NgRx (use sparingly)
└── Server cache → Use Signals with API service
```

### Angular 19 Features to Use

**Signals (Primary State Management):**

- Use for all component state
- Replace BehaviorSubject with signals
- Use computed() for derived state
- Use effect() for side effects

**Control Flow Syntax:**

- Use @if, @for, @switch instead of *ngIf, *ngFor, \*ngSwitch
- Use @defer for lazy loading parts of template

**Standalone Components:**

- Default for all new components
- No NgModules needed
- Better tree-shaking
- Simpler dependency injection

**Example Control Flow:**

```html
@if (loading()) {
<mat-spinner />
} @else if (error()) {
<div class="error">{{ error() }}</div>
} @else { @for (user of users(); track user.id) {
<user-card [user]="user" />
} @empty {
<p>No users found</p>
} } @defer (on viewport) {
<heavy-component />
} @placeholder {
<div>Loading...</div>
} @loading {
<mat-spinner />
}
```

## Angular Feature Module Architecture

### Generate feature module structure

#### Basic Feature Structure

```
apps/[app]/src/app/features/[feature]/
├── components/
│   ├── [feature]-list/
│   │   ├── [feature]-list.component.ts
│   │   ├── [feature]-list.component.html
│   │   ├── [feature]-list.component.scss
│   │   └── [feature]-list.component.spec.ts
│   ├── [feature]-detail/
│   │   ├── [feature]-detail.component.ts
│   │   ├── [feature]-detail.component.html
│   │   └── [feature]-detail.component.scss
│   ├── [feature]-form/
│   │   ├── [feature]-form.component.ts
│   │   ├── [feature]-form.component.html
│   │   └── [feature]-form.component.scss
│   └── [feature]-dialog/
│       └── [feature]-dialog.component.ts
├── services/
│   ├── [feature].service.ts
│   └── [feature]-state.service.ts
├── guards/
│   └── [feature].guard.ts
├── models/
│   └── [feature].model.ts
├── pages/
│   ├── [feature]-page/
│   │   ├── [feature]-page.component.ts
│   │   └── [feature]-page.component.html
│   └── [feature]-admin-page/
│       └── [feature]-admin-page.component.ts
├── pipes/
│   └── [feature].pipe.ts
├── directives/
│   └── [feature].directive.ts
├── [feature]-routing.module.ts
└── [feature].module.ts
```

#### Complex Feature with State Management (NgRx)

```
apps/[portal]/src/app/features/[feature]/
├── components/           # Presentational components
├── containers/          # Smart components (connected to store)
├── services/
├── guards/
├── models/
├── store/               # NgRx state management
│   ├── actions/
│   │   └── [feature].actions.ts
│   ├── effects/
│   │   └── [feature].effects.ts
│   ├── reducers/
│   │   └── [feature].reducer.ts
│   ├── selectors/
│   │   └── [feature].selectors.ts
│   └── index.ts
├── [feature]-routing.module.ts
└── [feature].module.ts
```

### Generate Angular components with CLI

```bash
# Generate module
nx g @nx/angular:module features/user --project=web --routing

# Generate components
nx g @nx/angular:component features/user/components/user-list --project=web
nx g @nx/angular:component features/user/components/user-form --project=web

# Generate service
nx g @nx/angular:service features/user/services/user --project=web

# Generate guard
nx g @nx/angular:guard features/user/guards/user --project=web
```

### UI Implementation with Angular Material + TailwindCSS

#### Component Template Example

```html
<!-- user-list.component.html -->
<div class="container mx-auto p-4">
  <!-- Header with TailwindCSS -->
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-800">Users Management</h1>
    <button mat-raised-button color="primary" class="flex items-center gap-2" (click)="openCreateDialog()">
      <mat-icon>add</mat-icon>
      <span>Add User</span>
    </button>
  </div>

  <!-- Filters with Angular Material -->
  <mat-card class="mb-4 shadow-sm">
    <mat-card-content>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Role</mat-label>
          <mat-select [(value)]="selectedRole">
            <mat-option value="">All</mat-option>
            <mat-option *ngFor="let role of roles" [value]="role.id"> {{ role.name }} </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Status</mat-label>
          <mat-select [(value)]="selectedStatus">
            <mat-option value="">All</mat-option>
            <mat-option value="active">Active</mat-option>
            <mat-option value="inactive">Inactive</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Data Table with Angular Material -->
  <mat-card class="shadow-sm">
    <mat-card-content class="p-0">
      <div class="overflow-x-auto">
        <table mat-table [dataSource]="dataSource" matSort class="w-full">
          <!-- Columns definitions -->
          <ng-container matColumnDef="avatar">
            <th mat-header-cell *matHeaderCellDef class="w-16">Avatar</th>
            <td mat-cell *matCellDef="let user">
              <div class="flex items-center">
                <img [src]="user.avatar || 'assets/default-avatar.png'" class="w-10 h-10 rounded-full" />
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let user">
              <div class="py-2">
                <p class="font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</p>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let user">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                [ngClass]="{
                      'bg-purple-100 text-purple-800': user.role === 'Admin',
                      'bg-blue-100 text-blue-800': user.role === 'Manager',
                      'bg-green-100 text-green-800': user.role === 'User'
                    }"
              >
                {{ user.role }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let user">
              <mat-slide-toggle [checked]="user.isActive" (change)="toggleStatus(user)"> </mat-slide-toggle>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
            <td mat-cell *matCellDef="let user" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="viewUser(user)">
                  <mat-icon>visibility</mat-icon>
                  <span>View</span>
                </button>
                <button mat-menu-item (click)="editUser(user)">
                  <mat-icon>edit</mat-icon>
                  <span>Edit</span>
                </button>
                <button mat-menu-item (click)="deleteUser(user)" class="text-red-600">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 cursor-pointer" (click)="selectUser(row)"></tr>
        </table>
      </div>

      <!-- Paginator -->
      <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons class="border-t"> </mat-paginator>
    </mat-card-content>
  </mat-card>
</div>
```

#### Form Component Example

```html
<!-- user-form.component.html -->
<form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="max-w-2xl mx-auto p-6">
  <mat-card>
    <mat-card-header>
      <mat-card-title> {{ isEditMode ? 'Edit User' : 'Create User' }} </mat-card-title>
    </mat-card-header>

    <mat-card-content>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- First Name -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName" required />
          <mat-error *ngIf="f['firstName']?.errors?.['required']"> First name is required </mat-error>
        </mat-form-field>

        <!-- Last Name -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName" required />
          <mat-error *ngIf="f['lastName']?.errors?.['required']"> Last name is required </mat-error>
        </mat-form-field>

        <!-- Email -->
        <mat-form-field appearance="outline" class="w-full md:col-span-2">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" required />
          <mat-error *ngIf="f['email']?.errors?.['required']"> Email is required </mat-error>
          <mat-error *ngIf="f['email']?.errors?.['email']"> Invalid email format </mat-error>
        </mat-form-field>

        <!-- Role Selection -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Role</mat-label>
          <mat-select formControlName="roleId" required>
            <mat-option *ngFor="let role of roles$ | async" [value]="role.id"> {{ role.name }} </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Status Toggle -->
        <div class="flex items-center space-x-2">
          <mat-slide-toggle formControlName="isActive"> Active Status </mat-slide-toggle>
        </div>
      </div>
    </mat-card-content>

    <mat-card-actions align="end" class="px-4 pb-4">
      <button mat-button type="button" (click)="onCancel()" class="mr-2">Cancel</button>
      <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid || isSubmitting">
        <mat-spinner *ngIf="isSubmitting" diameter="20" class="inline-block mr-2"></mat-spinner>
        {{ isEditMode ? 'Update' : 'Create' }}
      </button>
    </mat-card-actions>
  </mat-card>
</form>
```

### Service Implementation with Signals + Generated Types

```typescript
// user.service.ts
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

// IMPORTANT: Import ONLY types from generated OpenAPI client
import { User, CreateUserRequest, UpdateUserRequest, ApiResponse, Pagination } from '@org/api-client';

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

interface PaginatedUsersResponse extends ApiResponse<User[]> {
  data: User[];
  pagination: Pagination;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  // Signals for state management
  private usersSignal = signal<User[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private selectedUserSignal = signal<User | null>(null);
  private searchTermSignal = signal<string>('');
  private currentPageSignal = signal<number>(1);
  private pageSizeSignal = signal<number>(10);
  private totalUsersSignal = signal<number>(0);

  // Public readonly signals
  readonly users = this.usersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedUser = this.selectedUserSignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly totalUsers = this.totalUsersSignal.asReadonly();

  // Computed signals
  readonly filteredUsers = computed(() => {
    const search = this.searchTermSignal().toLowerCase();
    const users = this.usersSignal();

    if (!search) return users;

    return users.filter((user) => user.email.toLowerCase().includes(search) || user.firstName?.toLowerCase().includes(search) || user.lastName?.toLowerCase().includes(search));
  });

  readonly paginatedUsers = computed(() => {
    const filtered = this.filteredUsers();
    const page = this.currentPageSignal();
    const size = this.pageSizeSignal();
    const start = (page - 1) * size;
    const end = start + size;

    return filtered.slice(start, end);
  });

  readonly totalPages = computed(() => {
    const total = this.totalUsersSignal();
    const size = this.pageSizeSignal();
    return Math.ceil(total / size);
  });

  readonly hasNextPage = computed(() => {
    return this.currentPageSignal() < this.totalPages();
  });

  readonly hasPreviousPage = computed(() => {
    return this.currentPageSignal() > 1;
  });

  constructor() {
    // Effect to auto-load users when search or pagination changes
    effect(() => {
      const search = this.searchTermSignal();
      const page = this.currentPageSignal();
      const size = this.pageSizeSignal();

      this.loadUsers({ search, page, limit: size });
    });
  }

  // Actions using HttpClient directly with generated types
  async loadUsers(params?: GetUsersParams) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      // Build HTTP params
      let httpParams = new HttpParams();
      if (params?.page) httpParams = httpParams.set('page', params.page.toString());
      if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params?.search) httpParams = httpParams.set('search', params.search);
      if (params?.role) httpParams = httpParams.set('role', params.role);
      if (params?.status) httpParams = httpParams.set('status', params.status);

      // Direct HTTP call with generated response type
      const response = await this.http.get<PaginatedUsersResponse>(this.baseUrl, { params: httpParams }).toPromise();

      if (response?.success && response.data) {
        this.usersSignal.set(response.data);
        this.totalUsersSignal.set(response.pagination.total);
      }
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load users');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadUserById(id: string): Promise<User | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`).toPromise();

      if (response?.success && response.data) {
        this.selectedUserSignal.set(response.data);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to load user');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createUser(data: CreateUserRequest): Promise<User | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http.post<ApiResponse<User>>(this.baseUrl, data).toPromise();

      if (response?.success && response.data) {
        // Update users list
        this.usersSignal.update((users) => [...users, response.data!]);
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to create user');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User | null> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, data).toPromise();

      if (response?.success && response.data) {
        // Update users list
        this.usersSignal.update((users) => users.map((user) => (user.id === id ? response.data! : user)));
        // Update selected user if it's the same
        if (this.selectedUserSignal()?.id === id) {
          this.selectedUserSignal.set(response.data);
        }
        return response.data;
      }
      return null;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to update user');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    this.loadingSignal.set(true);

    try {
      const response = await this.http.delete<ApiResponse<{ id: string }>>(`${this.baseUrl}/${id}`).toPromise();

      if (response?.success) {
        // Remove from users list
        this.usersSignal.update((users) => users.filter((user) => user.id !== id));
        // Clear selected user if it's the deleted one
        if (this.selectedUserSignal()?.id === id) {
          this.selectedUserSignal.set(null);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      this.errorSignal.set(error.message || 'Failed to delete user');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // Utility methods
  setSearchTerm(term: string) {
    this.searchTermSignal.set(term);
    this.currentPageSignal.set(1); // Reset to first page on search
  }

  setCurrentPage(page: number) {
    this.currentPageSignal.set(page);
  }

  setPageSize(size: number) {
    this.pageSizeSignal.set(size);
    this.currentPageSignal.set(1); // Reset to first page
  }

  selectUser(user: User | null) {
    this.selectedUserSignal.set(user);
  }

  clearError() {
    this.errorSignal.set(null);
  }

  reset() {
    this.usersSignal.set([]);
    this.selectedUserSignal.set(null);
    this.searchTermSignal.set('');
    this.currentPageSignal.set(1);
    this.errorSignal.set(null);
  }
}
```

### Component with Signals Example

```typescript
// user-list.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

// Generated types from OpenAPI
import { User } from '@org/api-client';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    // Other Material modules
  ],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  private userService = inject(UserService);

  // Signals from service
  users = this.userService.paginatedUsers;
  loading = this.userService.loading;
  error = this.userService.error;

  // Local component signals
  selectedRows = signal<Set<string>>(new Set());
  showFilters = signal(false);

  // Computed signals
  selectedCount = computed(() => this.selectedRows().size);
  hasSelection = computed(() => this.selectedCount() > 0);

  // Methods
  onSearch(term: string) {
    this.userService.setSearchTerm(term);
  }

  toggleSelection(userId: string) {
    this.selectedRows.update((rows) => {
      const newSet = new Set(rows);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }
}
```

## OpenAPI Type Generation & Usage

### 1. Generate Types from OpenAPI

```bash
# Generate TypeScript types from OpenAPI spec
yarn openapi:generate

# This creates:
# libs/api-client/src/lib/types/
# libs/api-client/src/lib/services/
# libs/api-client/src/lib/api-client.ts
```

### 2. Generated Type Structure

```typescript
// libs/api-client/src/lib/types/user.types.ts (Generated)
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
  meta?: Record<string, any>;
}

export interface PaginatedUsersResponse extends ApiResponse<User[]> {
  data: User[];
  pagination: Pagination;
}
```

### 3. Generated Types Only (No Client Wrapper)

```typescript
// libs/api-client/src/lib/types/index.ts (Generated from OpenAPI)
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
  meta?: Record<string, any>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Use these types directly with HttpClient - no wrapper needed
```

### 4. Form Component with Generated Types

```typescript
// user-form.component.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

// Generated types from OpenAPI - ALWAYS use these
import { User, CreateUserRequest, UpdateUserRequest, Role } from '@org/api-client';

@Component({
  selector: 'app-user-form',
  standalone: true,
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  // Signals with proper typing
  user = signal<User | null>(null);
  roles = signal<Role[]>([]);
  isSubmitting = signal(false);

  // Form with proper typing matching CreateUserRequest
  userForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    roleId: ['', Validators.required],
    isActive: [true],
  });

  async onSubmit() {
    if (!this.userForm.valid) return;

    this.isSubmitting.set(true);

    try {
      // Form value automatically typed as CreateUserRequest
      const formData = this.userForm.value as CreateUserRequest;

      if (this.isEditMode()) {
        const updateData: UpdateUserRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          isActive: formData.isActive,
          roleId: formData.roleId,
        };
        await this.userService.updateUser(this.userId()!, updateData);
      } else {
        await this.userService.createUser(formData);
      }

      this.router.navigate(['/users']);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
```

### 5. Type Safety in Templates

```html
<!-- user-list.component.html -->
<!-- TypeScript knows users() returns User[] from generated types -->
@for (user of users(); track user.id) {
<tr class="hover:bg-gray-50">
  <td>{{ user.firstName }} {{ user.lastName }}</td>
  <td>{{ user.email }}</td>
  <td>{{ user.role.name }}</td>
  <td>
    <span [class]="user.isActive ? 'text-green-600' : 'text-red-600'"> {{ user.isActive ? 'Active' : 'Inactive' }} </span>
  </td>
</tr>
}
```

### 6. HTTP Client Configuration (No API Client Module Needed)

```typescript
// main.ts (Standalone approach)
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    // Standard Angular HTTP client - no wrapper needed
    provideHttpClient(
      withInterceptors([
        authInterceptor, // Add auth headers
        errorInterceptor, // Handle API errors
        loadingInterceptor, // Loading states
      ]),
    ),
    // Other providers...
  ],
});

// Use environment for API base URL in services
// No need for API client module or wrapper services
```

### Module Configuration (Standalone Components)

```typescript
// user.routes.ts (Standalone approach)
import { Routes } from '@angular/router';
import { AuthGuard } from '@org/auth';

export const userRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/user-page/user-page.component').then((m) => m.UserPageComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./components/user-list/user-list.component').then((m) => m.UserListComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
          },
        ],
      },
    ],
  },
];
```

## @aegisx-ui Framework

Based on our analysis of Fuse Architecture, we will implement @aegisx-ui as a modern Angular UI framework with Signals-first approach.

> 📄 **See full implementation plan**: [aegisx-ui-implementation.md](./aegisx-ui-implementation.md)

### Quick Overview

@aegisx-ui will be an enterprise-grade UI framework featuring:

- **Angular 19+** with Signals for state management
- **Standalone Components** for better tree-shaking
- **TailwindCSS + Angular Material** hybrid approach
- **Type-safe APIs** with full TypeScript support
- **i18n Ready** with Transloco integration
- **Performance First** with < 200KB initial bundle

### Key Components

- Core services (Config, Theme, Auth, Loading)
- UI components (Card, Button, Alert, DataTable, etc.)
- Layout system (Admin, Modern, Compact)
- Theming with CSS custom properties
- Form system with dynamic builders
- Navigation components

The framework will follow a 10-week implementation roadmap with clear phases and deliverables.
