import { AegisxCardComponent } from '@aegisx/ui';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../shared/ui/components/confirm-dialog.component';
import { BulkRoleChangeDialogComponent } from '../components/bulk-role-change-dialog.component';
import { BulkStatusChangeDialogComponent } from '../components/bulk-status-change-dialog.component';
import { UserFormDialogComponent } from '../components/user-form-dialog.component';
import { RoleAssignmentInfoModalComponent } from '../components/role-assignment-info-modal.component';
import { UserService, UserStatus } from '../services/user.service';

@Component({
  selector: 'ax-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTooltipModule,
    AegisxCardComponent,
    BulkStatusChangeDialogComponent,
    BulkRoleChangeDialogComponent,
    RoleAssignmentInfoModalComponent,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Users Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage system users and their permissions
          </p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          <span>Add User</span>
        </button>
      </div>

      <!-- Filters Card -->
      <ax-card [appearance]="'outlined'" class="mb-3">
        <div class="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          <!-- LEFT GROUP: Filters (Primary User Intent) -->
          <div
            class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <!-- Search Field with Integrated Clear Button -->
            <mat-form-field
              appearance="outline"
              subscriptSizing="dynamic"
              class="w-full"
            >
              <mat-label>Search Users</mat-label>
              <input
                matInput
                [(ngModel)]="searchTerm"
                (keyup.enter)="applyFilters()"
                placeholder="Name or email"
                aria-label="Search users by name or email"
              />
              <mat-icon matPrefix>search</mat-icon>
              @if (searchTerm) {
                <button
                  mat-icon-button
                  matSuffix
                  (click)="searchTerm = ''; applyFilters()"
                  matTooltip="Clear search"
                  aria-label="Clear search field"
                >
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>

            <!-- Role Filter -->
            <mat-form-field
              appearance="outline"
              subscriptSizing="dynamic"
              class="w-full"
            >
              <mat-label>Role</mat-label>
              <mat-select
                [(ngModel)]="selectedRole"
                (ngModelChange)="applyFilters()"
                aria-label="Filter by role"
              >
                <mat-option value="">All Roles</mat-option>
                <mat-option value="admin">
                  <mat-icon class="text-purple-600 align-middle mr-2"
                    >admin_panel_settings</mat-icon
                  >
                  Admin
                </mat-option>
                <mat-option value="manager">
                  <mat-icon class="text-blue-600 align-middle mr-2"
                    >manage_accounts</mat-icon
                  >
                  Manager
                </mat-option>
                <mat-option value="user">
                  <mat-icon class="text-green-600 align-middle mr-2"
                    >person</mat-icon
                  >
                  User
                </mat-option>
              </mat-select>
              @if (selectedRole) {
                <mat-icon matSuffix class="text-primary-600"
                  >filter_alt</mat-icon
                >
              }
            </mat-form-field>

            <!-- Status Filter -->
            <mat-form-field
              appearance="outline"
              subscriptSizing="dynamic"
              class="w-full"
            >
              <mat-label>Status</mat-label>
              <mat-select
                [(ngModel)]="selectedStatus"
                (ngModelChange)="applyFilters()"
                aria-label="Filter by status"
              >
                <mat-option value="">All Status</mat-option>
                <mat-option value="active">
                  <mat-icon class="text-green-600 align-middle mr-2"
                    >check_circle</mat-icon
                  >
                  Active
                </mat-option>
                <mat-option value="inactive">
                  <mat-icon class="text-gray-500 align-middle mr-2"
                    >cancel</mat-icon
                  >
                  Inactive
                </mat-option>
                <mat-option value="suspended">
                  <mat-icon class="text-red-600 align-middle mr-2"
                    >block</mat-icon
                  >
                  Suspended
                </mat-option>
                <mat-option value="pending">
                  <mat-icon class="text-yellow-600 align-middle mr-2"
                    >schedule</mat-icon
                  >
                  Pending
                </mat-option>
              </mat-select>
              @if (selectedStatus) {
                <mat-icon matSuffix class="text-primary-600"
                  >filter_alt</mat-icon
                >
              }
            </mat-form-field>
          </div>

          <!-- RIGHT GROUP: Actions (Secondary Intent) -->
          <div class="flex gap-2 flex-shrink-0">
            <!-- Search Button (Raised style - primary emphasis) -->
            <button
              mat-raised-button
              color="primary"
              (click)="applyFilters()"
              class="whitespace-nowrap"
              matTooltip="Search users"
              aria-label="Search users"
            >
              <mat-icon>search</mat-icon>
              <span class="hidden sm:inline">Search</span>
            </button>

            <!-- Reset Filters Button (Text style - low emphasis) -->
            @if (hasActiveFilters()) {
              <button
                mat-button
                (click)="resetFilters()"
                class="whitespace-nowrap"
                matTooltip="Clear all filters"
                aria-label="Clear all filters"
              >
                <mat-icon>filter_alt_off</mat-icon>
                <span class="hidden sm:inline">Reset</span>
              </button>
            }

            <!-- Export Button (Stroked style - medium emphasis) -->
            <button
              mat-stroked-button
              color="primary"
              (click)="exportUsers()"
              [disabled]="filteredUsers().length === 0"
              class="whitespace-nowrap"
              matTooltip="Export filtered users to CSV"
              aria-label="Export filtered users"
            >
              <mat-icon>download</mat-icon>
              <span class="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        <!-- Active Filters Indicator -->
        @if (hasActiveFilters()) {
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Active filters:
              </span>

              @if (searchTerm) {
                <mat-chip
                  [removable]="true"
                  (removed)="searchTerm = ''; applyFilters()"
                  aria-label="Remove search filter"
                >
                  <mat-icon matChipAvatar>search</mat-icon>
                  {{ searchTerm }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }

              @if (selectedRole) {
                <mat-chip
                  [removable]="true"
                  (removed)="selectedRole = ''; applyFilters()"
                  aria-label="Remove role filter"
                >
                  <mat-icon matChipAvatar>work</mat-icon>
                  {{ selectedRole | titlecase }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }

              @if (selectedStatus) {
                <mat-chip
                  [removable]="true"
                  (removed)="selectedStatus = ''; applyFilters()"
                  aria-label="Remove status filter"
                >
                  <mat-icon matChipAvatar>info</mat-icon>
                  {{ selectedStatus | titlecase }}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip>
              }
            </div>
          </div>
        }
      </ax-card>

      <!-- Bulk Actions Bar -->
      @if (selectedUsers().length > 0) {
        <ax-card
          [appearance]="'elevated'"
          class="mb-3 bg-blue-50 border-blue-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <mat-icon class="text-blue-600">fact_check</mat-icon>
              <span class="font-medium text-blue-800">
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

            <div class="flex items-center space-x-2">
              <button
                mat-raised-button
                color="primary"
                [disabled]="bulkLoading()"
                (click)="openBulkActivateDialog()"
                matTooltip="Activate selected users"
              >
                <mat-icon>check_circle</mat-icon>
                Activate
              </button>

              <button
                mat-raised-button
                color="warn"
                [disabled]="bulkLoading()"
                (click)="openBulkDeactivateDialog()"
                matTooltip="Deactivate selected users"
              >
                <mat-icon>block</mat-icon>
                Deactivate
              </button>

              <button
                mat-button
                [matMenuTriggerFor]="bulkMenu"
                [disabled]="bulkLoading()"
              >
                <mat-icon>more_vert</mat-icon>
                More Actions
              </button>

              <mat-menu #bulkMenu="matMenu">
                <button mat-menu-item (click)="openBulkChangeStatusDialog()">
                  <mat-icon>settings</mat-icon>
                  Change Status
                </button>
                <button mat-menu-item (click)="openBulkRoleChangeDialog()">
                  <mat-icon>manage_accounts</mat-icon>
                  Change Role
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="openBulkDeleteDialog()">
                  <mat-icon class="text-red-600">delete</mat-icon>
                  <span class="text-red-600">Delete Users</span>
                </button>
              </mat-menu>

              @if (bulkLoading()) {
                <mat-spinner [diameter]="24"></mat-spinner>
              }
            </div>
          </div>
        </ax-card>
      }

      <!-- Bulk Progress Indicator -->
      @if (bulkLoading() && bulkProgress().total > 0) {
        <ax-card [appearance]="'elevated'" class="mb-3 bg-green-50 border-green-200">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 flex-1">
              <mat-icon class="text-green-600 animate-spin">hourglass_empty</mat-icon>
              <div class="flex-1">
                <p class="font-medium text-green-800">
                  Processing
                  <strong>{{ bulkProgress().current }}/{{ bulkProgress().total }}</strong>
                  user(s)...
                </p>
                <p class="text-sm text-green-700 mt-1">
                  Please wait while roles are being updated
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="inline-flex items-center justify-center w-16 h-16">
                <svg class="w-full h-full" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#e5e7eb"
                    stroke-width="2"
                  ></circle>
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#16a34a"
                    stroke-width="2"
                    [attr.stroke-dasharray]="
                      ((bulkProgress().current / bulkProgress().total) * 100.5) +
                      ', 100.5'
                    "
                    stroke-linecap="round"
                    [style.transform]="'rotate(-90deg)'"
                    [style.transform-origin]="'50% 50%'"
                    style="transition: stroke-dasharray 0.3s ease"
                  ></circle>
                </svg>
                <div class="absolute text-center">
                  <span class="text-sm font-bold text-green-800">
                    {{
                      ((bulkProgress().current / bulkProgress().total) * 100)
                        | number: '1.0-0'
                    }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ax-card>
      }

      <!-- Users Table -->
      <ax-card [appearance]="'elevated'">
        @if (loading()) {
          <div class="flex items-center justify-center h-64">
            <mat-spinner [diameter]="40"></mat-spinner>
          </div>
        } @else if (error()) {
          <div class="text-center py-8">
            <mat-icon class="text-6xl text-red-500">error_outline</mat-icon>
            <p
              class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4"
            >
              Error loading users
            </p>
            <p class="text-gray-600 dark:text-gray-400">{{ error() }}</p>
            <button
              mat-raised-button
              color="primary"
              (click)="loadUsers()"
              class="mt-4"
            >
              <mat-icon>refresh</mat-icon>
              <span>Retry</span>
            </button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table
              mat-table
              [dataSource]="filteredUsers()"
              matSort
              class="w-full"
            >
              <!-- Checkbox Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef class="w-16">
                  <mat-checkbox
                    [checked]="isAllSelected()"
                    [indeterminate]="
                      !isAllSelected() && selectedUsers().length > 0
                    "
                    (change)="toggleAllSelection($event)"
                    color="primary"
                  ></mat-checkbox>
                </th>
                <td
                  mat-cell
                  *matCellDef="let user"
                  (click)="$event.stopPropagation()"
                >
                  <mat-checkbox
                    [checked]="isSelected(user)"
                    (change)="toggleSelection(user)"
                    color="primary"
                  ></mat-checkbox>
                </td>
              </ng-container>

              <!-- User Info Column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>User</th>
                <td
                  mat-cell
                  *matCellDef="let user"
                  class="cursor-pointer"
                  (click)="viewUser(user)"
                >
                  <div class="flex items-center space-x-3 py-2">
                    <div
                      class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
                    >
                      <span
                        class="text-primary-600 dark:text-primary-400 font-semibold"
                      >
                        {{ getInitials(user) }}
                      </span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <p class="font-medium text-gray-900 dark:text-gray-100">
                          {{ user.firstName }} {{ user.lastName }}
                        </p>
                        <!-- Role Count Badge -->
                        <span
                          *ngIf="getRoleCount(user) > 0"
                          [matTooltip]="'Click to view role details'"
                          matTooltipPosition="above"
                          (click)="$event.stopPropagation(); openRoleAssignmentInfoModal(user)"
                          [ngClass]="{
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200':
                              getRoleCount(user) === 1,
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200':
                              getRoleCount(user) > 1,
                          }"
                          class="inline-flex items-center justify-center rounded-full text-xs font-semibold h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {{ getRoleCount(user) }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ user.email }}
                      </p>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role(s)</th>
                <td mat-cell *matCellDef="let user">
                  <!-- Multi-role support: display all roles as chips with tooltips -->
                  <mat-chip-set *ngIf="user.roles && user.roles.length > 0">
                    <mat-chip
                      *ngFor="let role of user.roles"
                      [matTooltip]="formatRoleTooltip(role)"
                      matTooltipPosition="above"
                      [ngClass]="{
                        'bg-purple-100 text-purple-800':
                          role.roleName === 'admin',
                        'bg-blue-100 text-blue-800':
                          role.roleName === 'manager',
                        'bg-green-100 text-green-800': role.roleName === 'user',
                      }"
                    >
                      {{ role.roleName | titlecase }}
                    </mat-chip>
                  </mat-chip-set>
                  <!-- Fallback for backward compatibility (single role) -->
                  <mat-chip
                    *ngIf="!user.roles || user.roles.length === 0"
                    [matTooltip]="'Single role assignment'"
                    matTooltipPosition="above"
                    [ngClass]="{
                      'bg-purple-100 text-purple-800': user.role === 'admin',
                      'bg-blue-100 text-blue-800': user.role === 'manager',
                      'bg-green-100 text-green-800': user.role === 'user',
                    }"
                  >
                    {{ user.role | titlecase }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td
                  mat-cell
                  *matCellDef="let user"
                  (click)="$event.stopPropagation()"
                  class="relative"
                >
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="statusMenu"
                    [matTooltip]="
                      user.status ? (user.status | titlecase) : 'Unknown Status'
                    "
                    [ngClass]="{
                      'text-green-600': user.status === 'active',
                      'text-gray-500': user.status === 'inactive',
                      'text-red-600': user.status === 'suspended',
                      'text-yellow-600': user.status === 'pending',
                      'text-gray-400': !user.status,
                    }"
                    class="text-sm font-medium"
                  >
                    <mat-icon class="mr-1">
                      {{ getStatusIcon(user.status || '') }}
                    </mat-icon>
                    <span>{{
                      user.status ? (user.status | titlecase) : '?'
                    }}</span>
                  </button>
                  <mat-menu #statusMenu="matMenu">
                    <button
                      mat-menu-item
                      [disabled]="user.status === 'active'"
                      (click)="updateUserStatus(user, 'active')"
                    >
                      <mat-icon class="text-green-600">check_circle</mat-icon>
                      <span>Active</span>
                    </button>
                    <button
                      mat-menu-item
                      [disabled]="user.status === 'inactive'"
                      (click)="updateUserStatus(user, 'inactive')"
                    >
                      <mat-icon class="text-gray-500">cancel</mat-icon>
                      <span>Inactive</span>
                    </button>
                    <button
                      mat-menu-item
                      [disabled]="user.status === 'suspended'"
                      (click)="updateUserStatus(user, 'suspended')"
                    >
                      <mat-icon class="text-red-600">block</mat-icon>
                      <span>Suspended</span>
                    </button>
                    <button
                      mat-menu-item
                      [disabled]="user.status === 'pending'"
                      (click)="updateUserStatus(user, 'pending')"
                    >
                      <mat-icon class="text-yellow-600">schedule</mat-icon>
                      <span>Pending</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <!-- Last Login Column -->
              <ng-container matColumnDef="lastLogin">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Last Login
                </th>
                <td
                  mat-cell
                  *matCellDef="let user"
                  class="text-sm text-gray-600 dark:text-gray-400"
                >
                  {{
                    user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'
                  }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="text-right">
                  Actions
                </th>
                <td
                  mat-cell
                  *matCellDef="let user"
                  class="text-right"
                  (click)="$event.stopPropagation()"
                >
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewUser(user)">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </button>
                    <button mat-menu-item (click)="editUser(user)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit User</span>
                    </button>
                    <button mat-menu-item (click)="resetPassword(user)">
                      <mat-icon>lock_reset</mat-icon>
                      <span>Reset Password</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button
                      mat-menu-item
                      (click)="deleteUser(user)"
                      class="text-red-600"
                    >
                      <mat-icon class="text-red-600">delete</mat-icon>
                      <span>Delete User</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr
                mat-header-row
                *matHeaderRowDef="displayedColumns; sticky: true"
              ></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
              ></tr>

              <!-- No data row -->
              <tr class="mat-row" *matNoDataRow>
                <td
                  class="mat-cell text-center py-8"
                  [colSpan]="displayedColumns.length"
                >
                  <mat-icon class="text-6xl text-gray-400"
                    >person_search</mat-icon
                  >
                  <p
                    class="text-lg font-semibold text-gray-600 dark:text-gray-400 mt-4"
                  >
                    No users found
                  </p>
                  <p class="text-gray-500 dark:text-gray-500">
                    Try adjusting your filters or add a new user
                  </p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Paginator -->
          <mat-paginator
            [pageSizeOptions]="[10, 25, 50, 100]"
            [pageSize]="pageSize()"
            [length]="totalUsers()"
            showFirstLastButtons
            (page)="onPageChange($event)"
            class="border-t dark:border-gray-700"
          ></mat-paginator>
        }
      </ax-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      table {
        width: 100%;
      }

      .mat-mdc-header-row {
        background-color: rgba(0, 0, 0, 0.04);
      }

      :host-context(.dark) .mat-mdc-header-row {
        background-color: rgba(255, 255, 255, 0.04);
      }

      .mat-column-select {
        overflow: initial;
      }
    `,
  ],
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Signals
  users = this.userService.users;
  loading = this.userService.loading;
  error = this.userService.error;
  totalUsers = this.userService.totalUsers;
  currentPage = this.userService.currentPage;
  pageSize = signal(10);

  // Filters
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';

  // Selection
  selectedUsers = signal<any[]>([]);
  bulkLoading = signal(false);
  bulkProgress = signal<{ current: number; total: number }>({ current: 0, total: 0 });

  // Table columns
  displayedColumns: string[] = [
    'select',
    'user',
    'role',
    'status',
    'lastLogin',
    'actions',
  ];

  // Computed signals
  filteredUsers = computed(() => {
    let filtered = this.users();

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(search) ||
          user.firstName?.toLowerCase().includes(search) ||
          user.lastName?.toLowerCase().includes(search),
      );
    }

    if (this.selectedRole) {
      // Multi-role support: check if selectedRole exists in user's roles
      filtered = filtered.filter(
        (user) =>
          user.role === this.selectedRole ||
          user.roles?.some((r) => r.roleName === this.selectedRole) ||
          false,
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter((user) => user.status === this.selectedStatus);
    }

    return filtered;
  });

  // Check if any filters are currently active
  hasActiveFilters = computed(() => {
    return !!(this.searchTerm || this.selectedRole || this.selectedStatus);
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.loadUsers({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm,
      role: this.selectedRole,
      status: this.selectedStatus as any,
    });
  }

  applyFilters(): void {
    this.userService.setCurrentPage(1);
    this.loadUsers();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  onPageChange(event: any): void {
    this.pageSize.set(event.pageSize);
    this.userService.setCurrentPage(event.pageIndex + 1);
    this.userService.setPageSize(event.pageSize);
    this.loadUsers();
  }

  // Selection methods
  isSelected(user: any): boolean {
    return this.selectedUsers().some((u) => u.id === user.id);
  }

  isAllSelected(): boolean {
    const filtered = this.filteredUsers();
    return (
      filtered.length > 0 && this.selectedUsers().length === filtered.length
    );
  }

  toggleSelection(user: any): void {
    this.selectedUsers.update((users) => {
      const index = users.findIndex((u) => u.id === user.id);
      if (index >= 0) {
        return users.filter((_, i) => i !== index);
      }
      return [...users, user];
    });
  }

  toggleAllSelection(event: any): void {
    if (event.checked) {
      this.selectedUsers.set([...this.filteredUsers()]);
    } else {
      this.selectedUsers.set([]);
    }
  }

  // User actions
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  viewUser(user: any): void {
    this.router.navigate(['/users', user.id]);
  }

  editUser(user: any): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  async updateUserStatus(user: any, newStatus: string): Promise<void> {
    try {
      await this.userService.updateUser(user.id, { status: newStatus as any });
      const statusMessages: Record<string, string> = {
        active: 'activated',
        inactive: 'deactivated',
        suspended: 'suspended',
        pending: 'set to pending',
      };
      this.snackBar.open(
        `User ${statusMessages[newStatus] || 'status changed'} successfully`,
        'Close',
        { duration: 3000 },
      );
    } catch (error) {
      this.snackBar.open('Failed to update user status', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active':
        return 'check_circle';
      case 'inactive':
        return 'cancel';
      case 'suspended':
        return 'block';
      case 'pending':
        return 'schedule';
      default:
        return 'help';
    }
  }

  resetPassword(user: any): void {
    // Implement password reset logic
    this.snackBar.open('Password reset email sent', 'Close', {
      duration: 3000,
    });
  }

  deleteUser(user: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.userService.deleteUser(user.id);
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
          });
        } catch (error) {
          this.snackBar.open('Failed to delete user', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      }
    });
  }

  clearSelection(): void {
    this.selectedUsers.set([]);
  }

  // Bulk action dialog methods
  openBulkActivateDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Activate Users',
        message: `Are you sure you want to activate ${this.selectedUsers().length} user(s)?`,
        confirmText: 'Activate',
        confirmColor: 'primary',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.bulkActivate();
      }
    });
  }

  openBulkDeactivateDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Deactivate Users',
        message: `Are you sure you want to deactivate ${this.selectedUsers().length} user(s)?`,
        confirmText: 'Deactivate',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.bulkDeactivate();
      }
    });
  }

  openBulkDeleteDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Users',
        message: `Are you sure you want to delete ${this.selectedUsers().length} user(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.bulkDelete();
      }
    });
  }

  async openBulkRoleChangeDialog(): Promise<void> {
    const dialogRef = this.dialog.open(BulkRoleChangeDialogComponent, {
      width: '400px',
      data: {
        selectedUserCount: this.selectedUsers().length,
      },
    });

    dialogRef.afterClosed().subscribe((roleIds) => {
      if (roleIds && roleIds.length > 0) {
        this.bulkChangeRoles(roleIds);
      }
    });
  }

  openRoleAssignmentInfoModal(user: any): void {
    this.dialog.open(RoleAssignmentInfoModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        roles: user.roles || [],
      },
    });
  }

  // Bulk actions
  async bulkActivate(): Promise<void> {
    if (this.selectedUsers().length === 0) return;

    this.bulkLoading.set(true);
    try {
      const userIds = this.selectedUsers().map((user) => user.id);
      const result = await this.userService.bulkActivateUsers(userIds);

      this.showBulkOperationResult(result, 'Activate');
      this.selectedUsers.set([]);
    } catch (error: any) {
      this.snackBar.open(error.message || 'Failed to activate users', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.bulkLoading.set(false);
    }
  }

  async bulkDeactivate(): Promise<void> {
    if (this.selectedUsers().length === 0) return;

    this.bulkLoading.set(true);
    try {
      const userIds = this.selectedUsers().map((user) => user.id);
      const result = await this.userService.bulkDeactivateUsers(userIds);

      this.showBulkOperationResult(result, 'Deactivate');
      this.selectedUsers.set([]);
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Failed to deactivate users',
        'Close',
        { duration: 3000, panelClass: ['error-snackbar'] },
      );
    } finally {
      this.bulkLoading.set(false);
    }
  }

  async bulkDelete(): Promise<void> {
    if (this.selectedUsers().length === 0) return;

    this.bulkLoading.set(true);
    try {
      const userIds = this.selectedUsers().map((user) => user.id);
      const result = await this.userService.bulkDeleteUsers(userIds);

      this.showBulkOperationResult(result, 'Delete');
      this.selectedUsers.set([]);
    } catch (error: any) {
      this.snackBar.open(error.message || 'Failed to delete users', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.bulkLoading.set(false);
    }
  }

  async openBulkChangeStatusDialog(): Promise<void> {
    const dialogRef = this.dialog.open(BulkStatusChangeDialogComponent, {
      width: '400px',
      data: {
        selectedUserCount: this.selectedUsers().length,
      },
    });

    dialogRef.afterClosed().subscribe((status) => {
      if (status) {
        this.bulkChangeUserStatus(status);
      }
    });
  }

  async bulkChangeRoles(roleIds: string[]): Promise<void> {
    if (this.selectedUsers().length === 0 || !roleIds || roleIds.length === 0)
      return;

    this.bulkLoading.set(true);
    const totalUsers = this.selectedUsers().length;

    // Show initial progress
    this.bulkProgress.set({ current: 0, total: totalUsers });

    try {
      const userIds = this.selectedUsers().map((user) => user.id);

      // Simulate progress during the operation
      const progressInterval = setInterval(() => {
        const current = this.bulkProgress().current;
        if (current < totalUsers - 1) {
          this.bulkProgress.set({ current: current + 1, total: totalUsers });
        }
      }, 200);

      const result = await this.userService.bulkChangeUserRoles(
        userIds,
        roleIds,
      );

      clearInterval(progressInterval);

      // Update progress to 100%
      this.bulkProgress.set({ current: totalUsers, total: totalUsers });

      this.showBulkOperationResult(result, 'Role Change');
      this.selectedUsers.set([]);
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Failed to change user roles',
        'Close',
        { duration: 3000, panelClass: ['error-snackbar'] },
      );
    } finally {
      this.bulkLoading.set(false);
      // Reset progress after a delay
      setTimeout(() => {
        this.bulkProgress.set({ current: 0, total: 0 });
      }, 1000);
    }
  }

  async bulkChangeUserStatus(status: UserStatus): Promise<void> {
    if (this.selectedUsers().length === 0) return;

    this.bulkLoading.set(true);
    try {
      const userIds = this.selectedUsers().map((user) => user.id);
      const result = await this.userService.bulkChangeUserStatus(
        userIds,
        status,
      );

      this.showBulkOperationResult(result, 'Status Change');
      this.selectedUsers.set([]);
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Failed to change user status',
        'Close',
        { duration: 3000, panelClass: ['error-snackbar'] },
      );
    } finally {
      this.bulkLoading.set(false);
    }
  }

  private showBulkOperationResult(result: any, operationType: string): void {
    const { successCount, failureCount, summary } = result;

    if (failureCount === 0) {
      // All successful
      this.snackBar.open(
        `${operationType} completed successfully for ${successCount} user(s)`,
        'Close',
        { duration: 3000, panelClass: ['success-snackbar'] },
      );
    } else if (successCount === 0) {
      // All failed
      this.snackBar.open(`${operationType} failed for all users`, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } else {
      // Partial success
      this.snackBar.open(
        `${operationType}: ${successCount} successful, ${failureCount} failed`,
        'View Details',
        { duration: 7000, panelClass: ['warning-snackbar'] },
      );
    }
  }

  exportUsers(): void {
    // Implement export functionality
    this.snackBar.open('Exporting users...', 'Close', { duration: 3000 });
  }

  // Helper methods
  getInitials(user: any): string {
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatRoleTooltip(role: any): string {
    if (!role) return 'Role information';

    const lines: string[] = [];

    // Role name and status
    const statusLabel = role.isActive ? 'Active' : 'Inactive';
    lines.push(`${role.roleName} (${statusLabel})`);

    // Assigned date
    if (role.assignedAt) {
      const assignedDate = new Date(role.assignedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      lines.push(`Assigned: ${assignedDate}`);
    }

    // Assigned by (if available)
    if (role.assignedBy) {
      lines.push(`By: ${role.assignedBy}`);
    }

    // Expiry date (if applicable)
    if (role.expiresAt) {
      const expiryDate = new Date(role.expiresAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      lines.push(`Expires: ${expiryDate}`);
    }

    return lines.join('\n');
  }

  getRoleCount(user: any): number {
    // Return count of roles assigned to the user
    // Supports both multi-role (user.roles array) and single-role (user.role string)
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.length;
    }
    return user.role ? 1 : 0;
  }
}
