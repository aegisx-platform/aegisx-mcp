import { AxCardComponent } from '@aegisx/ui';
import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';

// Mock data interface
interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: Date;
  lastLoginAt: Date | null;
}

@Component({
  selector: 'ax-user-list-ui-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    MatProgressBarModule,
    AxCardComponent,
  ],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Page Header -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h1 class="text-3xl font-bold" style="color: var(--ax-text-strong)">
            Users Management
          </h1>
          <p class="mt-2 text-base" style="color: var(--ax-text-body)">
            Manage {{ totalUsers() }} system users and their permissions
          </p>
        </div>
        <div class="flex gap-2">
          <button
            mat-stroked-button
            color="primary"
            matTooltip="Import users from Excel or CSV"
          >
            <mat-icon>upload</mat-icon>
            <span class="hidden sm:inline ml-2">Import</span>
          </button>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            <span class="ml-2">Add User</span>
          </button>
        </div>
      </div>

      <!-- Advanced Filters Card -->
      <ax-card [variant]="'outlined'" class="mb-4">
        <mat-expansion-panel
          [expanded]="filtersExpanded()"
          (expandedChange)="filtersExpanded.set($event)"
          class="mat-elevation-0"
        >
          <mat-expansion-panel-header>
            <mat-panel-title class="flex items-center gap-2">
              <mat-icon>filter_list</mat-icon>
              <span class="font-medium">Advanced Filters</span>
              @if (activeFilterCount() > 0) {
                <span
                  class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full"
                  style="background-color: var(--ax-brand-default); color: white;"
                  matTooltip="{{ activeFilterCount() }} active filter(s)"
                >
                  {{ activeFilterCount() }}
                </span>
              }
            </mat-panel-title>
            <mat-panel-description>
              Search, filter, and organize users
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="pt-4">
            <!-- Quick Search -->
            <div class="mb-4">
              <mat-form-field
                appearance="outline"
                subscriptSizing="dynamic"
                class="w-full"
              >
                <mat-label>Quick Search</mat-label>
                <input
                  matInput
                  [(ngModel)]="searchTerm"
                  placeholder="Search by name, email, or username"
                />
                <mat-icon matPrefix>search</mat-icon>
                @if (searchTerm) {
                  <button
                    mat-icon-button
                    matSuffix
                    (click)="searchTerm = ''"
                    matTooltip="Clear search"
                  >
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </mat-form-field>
            </div>

            <!-- Filter Grid -->
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
            >
              <!-- Role Filter -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Roles</mat-label>
                <mat-select [(ngModel)]="selectedRoles" multiple>
                  <mat-option value="admin">
                    <mat-icon
                      class="align-middle mr-2"
                      style="color: var(--ax-brand-emphasis)"
                      >admin_panel_settings</mat-icon
                    >
                    Admin
                  </mat-option>
                  <mat-option value="manager">
                    <mat-icon class="align-middle mr-2 text-blue-600"
                      >manage_accounts</mat-icon
                    >
                    Manager
                  </mat-option>
                  <mat-option value="user">
                    <mat-icon
                      class="align-middle mr-2"
                      style="color: var(--ax-success-default)"
                      >person</mat-icon
                    >
                    User
                  </mat-option>
                </mat-select>
                @if (selectedRoles.length > 0) {
                  <mat-icon matSuffix style="color: var(--ax-brand-default)"
                    >filter_alt</mat-icon
                  >
                }
              </mat-form-field>

              <!-- Status Filter -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="selectedStatuses" multiple>
                  <mat-option value="active">
                    <mat-icon
                      class="align-middle mr-2"
                      style="color: var(--ax-success-default)"
                      >check_circle</mat-icon
                    >
                    Active
                  </mat-option>
                  <mat-option value="inactive">
                    <mat-icon class="align-middle mr-2 text-gray-500"
                      >cancel</mat-icon
                    >
                    Inactive
                  </mat-option>
                  <mat-option value="suspended">
                    <mat-icon class="align-middle mr-2 text-red-600"
                      >block</mat-icon
                    >
                    Suspended
                  </mat-option>
                  <mat-option value="pending">
                    <mat-icon
                      class="align-middle mr-2"
                      style="color: var(--ax-warning-default)"
                      >schedule</mat-icon
                    >
                    Pending
                  </mat-option>
                </mat-select>
                @if (selectedStatuses.length > 0) {
                  <mat-icon matSuffix style="color: var(--ax-brand-default)"
                    >filter_alt</mat-icon
                  >
                }
              </mat-form-field>

              <!-- Created Date From -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Created Date From</mat-label>
                <input
                  matInput
                  [matDatepicker]="createdFromPicker"
                  [(ngModel)]="createdDateFrom"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="createdFromPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #createdFromPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Created Date To</mat-label>
                <input
                  matInput
                  [matDatepicker]="createdToPicker"
                  [(ngModel)]="createdDateTo"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="createdToPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #createdToPicker></mat-datepicker>
              </mat-form-field>

              <!-- Last Login From -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Last Login From</mat-label>
                <input
                  matInput
                  [matDatepicker]="loginFromPicker"
                  [(ngModel)]="lastLoginFrom"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="loginFromPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #loginFromPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Last Login To</mat-label>
                <input
                  matInput
                  [matDatepicker]="loginToPicker"
                  [(ngModel)]="lastLoginTo"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="loginToPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #loginToPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <!-- Filter Actions -->
            <div class="flex justify-between items-center flex-wrap gap-4">
              <div class="flex gap-2">
                <button
                  mat-stroked-button
                  matTooltip="Load saved filter preset"
                >
                  <mat-icon>bookmark</mat-icon>
                  <span class="hidden sm:inline ml-2">Saved Filters</span>
                </button>

                @if (activeFilterCount() > 0) {
                  <button
                    mat-button
                    (click)="resetFilters()"
                    matTooltip="Clear all filters"
                  >
                    <mat-icon>filter_alt_off</mat-icon>
                    <span class="hidden sm:inline ml-2">Reset All</span>
                  </button>
                }
              </div>

              <div class="flex gap-2">
                <button
                  mat-stroked-button
                  color="primary"
                  [disabled]="filteredUsers().length === 0"
                  matTooltip="Export users to file"
                >
                  <mat-icon>download</mat-icon>
                  <span class="hidden sm:inline ml-2">Export</span>
                </button>

                <button
                  mat-raised-button
                  color="primary"
                  matTooltip="Apply filters"
                >
                  <mat-icon>search</mat-icon>
                  <span class="ml-2">Search</span>
                </button>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
      </ax-card>

      <!-- Active Filter Tags -->
      @if (activeFilterCount() > 0 && !filtersExpanded()) {
        <ax-card
          [variant]="'outlined'"
          class="mb-4"
          style="background-color: var(--ax-background-subtle);"
        >
          <div class="flex items-center gap-2 flex-wrap">
            <span
              class="text-sm font-medium"
              style="color: var(--ax-text-emphasis)"
            >
              Active filters ({{ activeFilterCount() }}):
            </span>

            @if (searchTerm) {
              <mat-chip [removable]="true" (removed)="searchTerm = ''">
                <mat-icon matChipAvatar>search</mat-icon>
                "{{ searchTerm }}"
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            }

            @for (role of selectedRoles; track role) {
              <mat-chip [removable]="true" (removed)="removeRoleFilter(role)">
                <mat-icon matChipAvatar>work</mat-icon>
                {{ role | titlecase }}
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            }

            @for (status of selectedStatuses; track status) {
              <mat-chip
                [removable]="true"
                (removed)="removeStatusFilter(status)"
              >
                <mat-icon matChipAvatar>info</mat-icon>
                {{ status | titlecase }}
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            }

            <button mat-button (click)="resetFilters()" class="ml-auto">
              <mat-icon>clear_all</mat-icon>
              Clear All
            </button>
          </div>
        </ax-card>
      }

      <!-- Bulk Actions Bar -->
      @if (selectedUsers().length > 0) {
        <ax-card
          [variant]="'elevated'"
          class="mb-4"
          style="background-color: #dbeafe; border: 1px solid #3b82f6;"
        >
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-4">
              <mat-icon class="text-blue-600">fact_check</mat-icon>
              <span class="font-semibold text-blue-800">
                {{ selectedUsers().length }} user(s) selected
              </span>
              <button
                mat-text-button
                color="primary"
                (click)="clearSelection()"
              >
                Clear Selection
              </button>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button
                mat-raised-button
                style="background-color: var(--ax-success-default); color: white;"
              >
                <mat-icon>check_circle</mat-icon>
                <span class="ml-2">Activate</span>
              </button>

              <button mat-raised-button color="warn">
                <mat-icon>block</mat-icon>
                <span class="ml-2">Deactivate</span>
              </button>

              <button mat-stroked-button [matMenuTriggerFor]="bulkMenu">
                <mat-icon>more_vert</mat-icon>
                <span class="ml-2 hidden sm:inline">More</span>
              </button>

              <mat-menu #bulkMenu="matMenu">
                <button mat-menu-item>
                  <mat-icon>settings</mat-icon>
                  Change Status
                </button>
                <button mat-menu-item>
                  <mat-icon>manage_accounts</mat-icon>
                  Change Role
                </button>
                <button mat-menu-item>
                  <mat-icon>download</mat-icon>
                  Export Selected
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item>
                  <mat-icon class="text-red-600">delete</mat-icon>
                  <span class="text-red-600">Delete Users</span>
                </button>
              </mat-menu>
            </div>
          </div>
        </ax-card>
      }

      <!-- Users Table -->
      <ax-card [variant]="'elevated'">
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="paginatedUsers()" class="w-full">
            <!-- Checkbox Column -->
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef class="w-16">
                <mat-checkbox
                  [checked]="isAllSelected()"
                  [indeterminate]="
                    !isAllSelected() && selectedUsers().length > 0
                  "
                  (change)="toggleAllSelection()"
                  color="primary"
                ></mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let user">
                <mat-checkbox
                  [checked]="isSelected(user)"
                  (change)="toggleSelection(user)"
                  color="primary"
                ></mat-checkbox>
              </td>
            </ng-container>

            <!-- User Info Column -->
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let user">
                <div class="flex items-center gap-3 py-2">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style="background-color: var(--ax-brand-faint); color: var(--ax-brand-emphasis);"
                  >
                    <span class="text-sm font-semibold">
                      {{ getInitials(user) }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="font-medium truncate"
                      style="color: var(--ax-text-strong)"
                    >
                      {{ user.firstName }} {{ user.lastName }}
                    </p>
                    <p
                      class="text-sm truncate"
                      style="color: var(--ax-text-body)"
                    >
                      {{ user.email }}
                    </p>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Role Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip-set>
                  <mat-chip
                    [style.background-color]="
                      getRoleColor(user.role).background
                    "
                    [style.color]="getRoleColor(user.role).text"
                  >
                    {{ user.role | titlecase }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <button
                  mat-button
                  [matMenuTriggerFor]="statusMenu"
                  class="text-sm font-medium"
                >
                  <mat-icon
                    class="mr-1"
                    [style.color]="getStatusColor(user.status)"
                  >
                    {{ getStatusIcon(user.status) }}
                  </mat-icon>
                  <span [style.color]="getStatusColor(user.status)">
                    {{ user.status | titlecase }}
                  </span>
                </button>
                <mat-menu #statusMenu="matMenu">
                  <button mat-menu-item>
                    <mat-icon style="color: var(--ax-success-default)"
                      >check_circle</mat-icon
                    >
                    Active
                  </button>
                  <button mat-menu-item>
                    <mat-icon class="text-gray-500">cancel</mat-icon>
                    Inactive
                  </button>
                  <button mat-menu-item>
                    <mat-icon class="text-red-600">block</mat-icon>
                    Suspended
                  </button>
                  <button mat-menu-item>
                    <mat-icon style="color: var(--ax-warning-default)"
                      >schedule</mat-icon
                    >
                    Pending
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <!-- Created Date Column -->
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td
                mat-cell
                *matCellDef="let user"
                class="text-sm"
                style="color: var(--ax-text-body)"
              >
                {{ formatDate(user.createdAt) }}
              </td>
            </ng-container>

            <!-- Last Login Column -->
            <ng-container matColumnDef="lastLogin">
              <th mat-header-cell *matHeaderCellDef>Last Login</th>
              <td
                mat-cell
                *matCellDef="let user"
                class="text-sm"
                style="color: var(--ax-text-body)"
              >
                {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right w-20">
                Actions
              </th>
              <td mat-cell *matCellDef="let user" class="text-right">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item>
                    <mat-icon>visibility</mat-icon>
                    View Details
                  </button>
                  <button mat-menu-item>
                    <mat-icon>edit</mat-icon>
                    Edit User
                  </button>
                  <button mat-menu-item>
                    <mat-icon>lock_reset</mat-icon>
                    Reset Password
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item class="text-red-600">
                    <mat-icon class="text-red-600">delete</mat-icon>
                    Delete User
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr
              mat-header-row
              *matHeaderRowDef="displayedColumns; sticky: true"
              style="background-color: var(--ax-background-subtle);"
            ></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
              class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            ></tr>
          </table>
        </div>

        <!-- Paginator -->
        <div style="border-top: 1px solid var(--ax-border-default);">
          <mat-paginator
            [pageSizeOptions]="[10, 25, 50]"
            [pageSize]="pageSize()"
            [length]="filteredUsers().length"
            [pageIndex]="currentPage() - 1"
            showFirstLastButtons
            (page)="onPageChange($event)"
          ></mat-paginator>
        </div>
      </ax-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      table {
        width: 100%;
      }

      .mat-mdc-header-row {
        font-weight: 600;
      }

      .mat-column-select {
        overflow: initial;
      }

      .mat-mdc-row {
        transition: background-color 200ms;
      }

      ::ng-deep .mat-expansion-panel {
        box-shadow: none !important;
        border: none !important;
      }

      ::ng-deep .mat-expansion-panel-header {
        padding: 0 !important;
      }

      ::ng-deep .mat-mdc-chip {
        transition: all 200ms;
      }

      ::ng-deep .mat-mdc-chip:hover {
        opacity: 0.8;
      }
    `,
  ],
})
export class UserListUiDemoComponent {
  // UI State
  filtersExpanded = signal(false);
  searchTerm = '';
  selectedRoles: string[] = [];
  selectedStatuses: string[] = [];
  createdDateFrom: Date | null = null;
  createdDateTo: Date | null = null;
  lastLoginFrom: Date | null = null;
  lastLoginTo: Date | null = null;

  // Selection
  selectedUsers = signal<MockUser[]>([]);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);

  // Table columns
  displayedColumns: string[] = [
    'select',
    'user',
    'role',
    'status',
    'createdAt',
    'lastLogin',
    'actions',
  ];

  // Mock Data
  private mockUsers: MockUser[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date('2025-01-11'),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'manager',
      status: 'active',
      createdAt: new Date('2024-02-20'),
      lastLoginAt: new Date('2025-01-10'),
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date('2024-03-10'),
      lastLoginAt: new Date('2025-01-09'),
    },
    {
      id: '4',
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.williams@example.com',
      role: 'user',
      status: 'inactive',
      createdAt: new Date('2024-04-05'),
      lastLoginAt: new Date('2024-12-15'),
    },
    {
      id: '5',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      role: 'manager',
      status: 'active',
      createdAt: new Date('2024-05-12'),
      lastLoginAt: new Date('2025-01-11'),
    },
    {
      id: '6',
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@example.com',
      role: 'user',
      status: 'pending',
      createdAt: new Date('2024-06-18'),
      lastLoginAt: null,
    },
    {
      id: '7',
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.davis@example.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2024-07-22'),
      lastLoginAt: new Date('2025-01-10'),
    },
    {
      id: '8',
      firstName: 'Frank',
      lastName: 'Wilson',
      email: 'frank.wilson@example.com',
      role: 'user',
      status: 'suspended',
      createdAt: new Date('2024-08-30'),
      lastLoginAt: new Date('2024-11-20'),
    },
    {
      id: '9',
      firstName: 'Grace',
      lastName: 'Taylor',
      email: 'grace.taylor@example.com',
      role: 'manager',
      status: 'active',
      createdAt: new Date('2024-09-14'),
      lastLoginAt: new Date('2025-01-11'),
    },
    {
      id: '10',
      firstName: 'Henry',
      lastName: 'Anderson',
      email: 'henry.anderson@example.com',
      role: 'user',
      status: 'active',
      createdAt: new Date('2024-10-08'),
      lastLoginAt: new Date('2025-01-08'),
    },
  ];

  // Computed signals
  filteredUsers = computed(() => {
    let filtered = [...this.mockUsers];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(search) ||
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search),
      );
    }

    // Role filter
    if (this.selectedRoles.length > 0) {
      filtered = filtered.filter((user) =>
        this.selectedRoles.includes(user.role),
      );
    }

    // Status filter
    if (this.selectedStatuses.length > 0) {
      filtered = filtered.filter((user) =>
        this.selectedStatuses.includes(user.status),
      );
    }

    // Date filters (simplified for demo)
    if (this.createdDateFrom) {
      filtered = filtered.filter(
        (user) => user.createdAt >= this.createdDateFrom!,
      );
    }
    if (this.createdDateTo) {
      const endOfDay = new Date(this.createdDateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter((user) => user.createdAt <= endOfDay);
    }

    return filtered;
  });

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredUsers().slice(start, end);
  });

  totalUsers = computed(() => this.filteredUsers().length);

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchTerm) count++;
    count += this.selectedRoles.length;
    count += this.selectedStatuses.length;
    if (this.createdDateFrom || this.createdDateTo) count++;
    if (this.lastLoginFrom || this.lastLoginTo) count++;
    return count;
  });

  // Filter methods
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRoles = [];
    this.selectedStatuses = [];
    this.createdDateFrom = null;
    this.createdDateTo = null;
    this.lastLoginFrom = null;
    this.lastLoginTo = null;
  }

  removeRoleFilter(role: string): void {
    this.selectedRoles = this.selectedRoles.filter((r) => r !== role);
  }

  removeStatusFilter(status: string): void {
    this.selectedStatuses = this.selectedStatuses.filter((s) => s !== status);
  }

  // Selection methods
  isSelected(user: MockUser): boolean {
    return this.selectedUsers().some((u) => u.id === user.id);
  }

  isAllSelected(): boolean {
    const paginated = this.paginatedUsers();
    return (
      paginated.length > 0 && paginated.every((user) => this.isSelected(user))
    );
  }

  toggleSelection(user: MockUser): void {
    this.selectedUsers.update((users) => {
      const index = users.findIndex((u) => u.id === user.id);
      if (index >= 0) {
        return users.filter((_, i) => i !== index);
      }
      return [...users, user];
    });
  }

  toggleAllSelection(): void {
    const paginated = this.paginatedUsers();
    if (this.isAllSelected()) {
      // Deselect all from current page
      this.selectedUsers.update((users) =>
        users.filter((u) => !paginated.find((p) => p.id === u.id)),
      );
    } else {
      // Select all from current page
      const newSelection = [...this.selectedUsers()];
      paginated.forEach((user) => {
        if (!newSelection.find((u) => u.id === user.id)) {
          newSelection.push(user);
        }
      });
      this.selectedUsers.set(newSelection);
    }
  }

  clearSelection(): void {
    this.selectedUsers.set([]);
  }

  // Pagination
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
  }

  // Helper methods
  getInitials(user: MockUser): string {
    const first = user.firstName[0] || '';
    const last = user.lastName[0] || '';
    return (first + last).toUpperCase();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getRoleColor(role: string): { background: string; text: string } {
    const colors: Record<string, { background: string; text: string }> = {
      admin: {
        background: 'var(--ax-brand-faint)',
        text: 'var(--ax-brand-emphasis)',
      },
      manager: {
        background: '#dbeafe',
        text: '#1e40af',
      },
      user: {
        background: '#dcfce7',
        text: '#166534',
      },
    };
    return colors[role] || { background: '#f3f4f6', text: '#6b7280' };
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'var(--ax-success-default)',
      inactive: '#6b7280',
      suspended: '#dc2626',
      pending: 'var(--ax-warning-default)',
    };
    return colors[status] || '#9ca3af';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      active: 'check_circle',
      inactive: 'cancel',
      suspended: 'block',
      pending: 'schedule',
    };
    return icons[status] || 'help';
  }
}
