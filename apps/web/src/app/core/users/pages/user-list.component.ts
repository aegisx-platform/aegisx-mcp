import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AegisxCardComponent } from '@aegisx/ui';
import { UserService, BulkOperationResult } from '../services/user.service';
import { UserFormDialogComponent } from '../components/user-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/ui/components/confirm-dialog.component';

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
      <ax-card [appearance]="'outlined'" class="mb-3 form-compact">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Search</mat-label>
            <input
              matInput
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              placeholder="Search by name or email"
            />
            <mat-icon matPrefix>search</mat-icon>
            @if (searchTerm) {
              <button
                mat-icon-button
                matSuffix
                (click)="searchTerm = ''; applyFilters()"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Role</mat-label>
            <mat-select
              [(ngModel)]="selectedRole"
              (ngModelChange)="applyFilters()"
            >
              <mat-option value="">All Roles</mat-option>
              <mat-option value="admin">Admin</mat-option>
              <mat-option value="manager">Manager</mat-option>
              <mat-option value="user">User</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Status</mat-label>
            <mat-select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="applyFilters()"
            >
              <mat-option value="">All Status</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="flex items-start space-x-2">
            <button
              mat-stroked-button
              (click)="resetFilters()"
              class="h-[56px]"
            >
              <mat-icon>clear</mat-icon>
              <span>Reset</span>
            </button>
            <button
              mat-stroked-button
              color="primary"
              (click)="exportUsers()"
              class="h-[56px]"
            >
              <mat-icon>download</mat-icon>
              <span>Export</span>
            </button>
          </div>
        </div>
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
                  <mat-slide-toggle
                    [checked]="isAllSelected()"
                    (change)="toggleAllSelection($event)"
                    color="primary"
                  ></mat-slide-toggle>
                </th>
                <td
                  mat-cell
                  *matCellDef="let user"
                  (click)="$event.stopPropagation()"
                >
                  <mat-slide-toggle
                    [checked]="isSelected(user)"
                    (change)="toggleSelection(user)"
                    color="primary"
                  ></mat-slide-toggle>
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
                    <div>
                      <p class="font-medium text-gray-900 dark:text-gray-100">
                        {{ user.firstName }} {{ user.lastName }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
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
                  <mat-chip
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
                >
                  <mat-slide-toggle
                    [checked]="user.isActive"
                    (change)="toggleUserStatus(user)"
                    color="primary"
                  ></mat-slide-toggle>
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

        <!-- Bulk Actions -->
        @if (selectedUsers().length > 0) {
          <div
            class="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4"
          >
            <p
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ selectedUsers().length }} user(s) selected
            </p>
            <div class="flex space-x-2">
              <button mat-stroked-button (click)="bulkActivate()">
                <mat-icon>check_circle</mat-icon>
                <span>Activate</span>
              </button>
              <button mat-stroked-button (click)="bulkDeactivate()">
                <mat-icon>block</mat-icon>
                <span>Deactivate</span>
              </button>
              <button mat-stroked-button color="warn" (click)="bulkDelete()">
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </button>
            </div>
          </div>
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
      filtered = filtered.filter((user) => user.role === this.selectedRole);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter((user) =>
        this.selectedStatus === 'active' ? user.isActive : !user.isActive,
      );
    }

    return filtered;
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

  async toggleUserStatus(user: any): Promise<void> {
    try {
      await this.userService.updateUser(user.id, { isActive: !user.isActive });
      this.snackBar.open(
        `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
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
    try {
      const roles = await this.userService.getRoles();

      // TODO: Create proper role selection dialog component
      // For now, using a simple prompt
      const roleNames = roles.map((r) => `${r.name} (${r.id})`).join('\n');
      const selectedRole = prompt(
        `Select a role:\n${roleNames}\n\nEnter role ID:`,
      );

      if (selectedRole) {
        await this.bulkChangeRoles(selectedRole);
      }
    } catch (error) {
      this.snackBar.open('Failed to load roles', 'Close', { duration: 3000 });
    }
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

  async bulkChangeRoles(roleId: string): Promise<void> {
    if (this.selectedUsers().length === 0 || !roleId) return;

    this.bulkLoading.set(true);
    try {
      const userIds = this.selectedUsers().map((user) => user.id);
      const result = await this.userService.bulkChangeUserRoles(
        userIds,
        roleId,
      );

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
}
