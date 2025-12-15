import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
    MatCardModule,
    BulkStatusChangeDialogComponent,
    BulkRoleChangeDialogComponent,
    RoleAssignmentInfoModalComponent,
  ],
  template: `
    <div class="user-list-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Users Management</h1>
          <p class="page-subtitle">Manage system users and their permissions</p>
        </div>
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          <span>Add User</span>
        </button>
      </div>

      <!-- Filters Card -->
      <mat-card appearance="outlined" class="filters-card">
        <mat-card-content>
          <div class="filters-container">
            <!-- LEFT GROUP: Filters (Primary User Intent) -->
            <div class="filters-grid">
              <!-- Search Field with Integrated Clear Button -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
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
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Role</mat-label>
                <mat-select
                  [(ngModel)]="selectedRole"
                  (ngModelChange)="applyFilters()"
                  aria-label="Filter by role"
                >
                  <mat-option value="">All Roles</mat-option>
                  <mat-option value="admin">
                    <mat-icon>admin_panel_settings</mat-icon>
                    Admin
                  </mat-option>
                  <mat-option value="manager">
                    <mat-icon>manage_accounts</mat-icon>
                    Manager
                  </mat-option>
                  <mat-option value="user">
                    <mat-icon>person</mat-icon>
                    User
                  </mat-option>
                </mat-select>
                @if (selectedRole) {
                  <mat-icon matSuffix>filter_alt</mat-icon>
                }
              </mat-form-field>

              <!-- Status Filter -->
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Status</mat-label>
                <mat-select
                  [(ngModel)]="selectedStatus"
                  (ngModelChange)="applyFilters()"
                  aria-label="Filter by status"
                >
                  <mat-option value="">All Status</mat-option>
                  <mat-option value="active">
                    <mat-icon>check_circle</mat-icon>
                    Active
                  </mat-option>
                  <mat-option value="inactive">
                    <mat-icon>cancel</mat-icon>
                    Inactive
                  </mat-option>
                  <mat-option value="suspended">
                    <mat-icon>block</mat-icon>
                    Suspended
                  </mat-option>
                  <mat-option value="pending">
                    <mat-icon>schedule</mat-icon>
                    Pending
                  </mat-option>
                </mat-select>
                @if (selectedStatus) {
                  <mat-icon matSuffix>filter_alt</mat-icon>
                }
              </mat-form-field>
            </div>

            <!-- RIGHT GROUP: Actions (Secondary Intent) -->
            <div class="filters-actions">
              <!-- Search Button (Raised style - primary emphasis) -->
              <button
                mat-flat-button
                color="primary"
                (click)="applyFilters()"
                matTooltip="Search users"
                aria-label="Search users"
              >
                <mat-icon>search</mat-icon>
                <span class="btn-text">Search</span>
              </button>

              <!-- Reset Filters Button (Text style - low emphasis) -->
              @if (hasActiveFilters()) {
                <button
                  mat-button
                  (click)="resetFilters()"
                  matTooltip="Clear all filters"
                  aria-label="Clear all filters"
                >
                  <mat-icon>filter_alt_off</mat-icon>
                  <span class="btn-text">Reset</span>
                </button>
              }

              <!-- Export Button (Stroked style - medium emphasis) -->
              <button
                mat-stroked-button
                color="primary"
                (click)="exportUsers()"
                [disabled]="filteredUsers().length === 0"
                matTooltip="Export filtered users to CSV"
                aria-label="Export filtered users"
              >
                <mat-icon>download</mat-icon>
                <span class="btn-text">Export</span>
              </button>
            </div>
          </div>

          <!-- Active Filters Indicator -->
          @if (hasActiveFilters()) {
            <div class="active-filters-section">
              <div class="active-filters-container">
                <span class="active-filters-label"> Active filters: </span>

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
        </mat-card-content>
      </mat-card>

      <!-- Bulk Actions Bar -->
      @if (selectedUsers().length > 0) {
        <mat-card appearance="outlined" class="bulk-actions-card">
          <mat-card-content>
            <div class="bulk-actions-container">
              <div class="bulk-actions-info">
                <mat-icon class="bulk-actions-icon">fact_check</mat-icon>
                <span class="bulk-actions-text">
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

              <div class="bulk-actions-buttons">
                <button
                  mat-flat-button
                  color="primary"
                  [disabled]="bulkLoading()"
                  (click)="openBulkActivateDialog()"
                  matTooltip="Activate selected users"
                >
                  <mat-icon>check_circle</mat-icon>
                  Activate
                </button>

                <button
                  mat-flat-button
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
                  <button
                    mat-menu-item
                    (click)="openBulkDeleteDialog()"
                    class="delete-action"
                  >
                    <mat-icon>delete</mat-icon>
                    <span>Delete Users</span>
                  </button>
                </mat-menu>

                @if (bulkLoading()) {
                  <mat-spinner [diameter]="24"></mat-spinner>
                }
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Bulk Progress Indicator -->
      @if (bulkLoading() && bulkProgress().total > 0) {
        <mat-card appearance="outlined" class="bulk-progress-card">
          <mat-card-content>
            <div class="bulk-progress-container">
              <div class="bulk-progress-content">
                <mat-icon class="bulk-progress-icon">hourglass_empty</mat-icon>
                <div class="bulk-progress-text">
                  <p class="bulk-progress-title">
                    Processing
                    <strong
                      >{{ bulkProgress().current }}/{{
                        bulkProgress().total
                      }}</strong
                    >
                    user(s)...
                  </p>
                  <p class="bulk-progress-subtitle">
                    Please wait while roles are being updated
                  </p>
                </div>
              </div>
              <div class="bulk-progress-chart">
                <div class="progress-ring">
                  <svg viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      class="progress-ring-bg"
                      stroke-width="2"
                    ></circle>
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      class="progress-ring-fill"
                      stroke-width="2"
                      [attr.stroke-dasharray]="
                        (bulkProgress().current / bulkProgress().total) *
                          100.5 +
                        ', 100.5'
                      "
                      stroke-linecap="round"
                    ></circle>
                  </svg>
                  <div class="progress-percentage">
                    <span>
                      {{
                        (bulkProgress().current / bulkProgress().total) * 100
                          | number: '1.0-0'
                      }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Users Table -->
      <mat-card appearance="outlined">
        @if (loading()) {
          <div class="loading-container">
            <mat-spinner [diameter]="40"></mat-spinner>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <p class="error-title">Error loading users</p>
            <p class="error-message">{{ error() }}</p>
            <button mat-flat-button color="primary" (click)="loadUsers()">
              <mat-icon>refresh</mat-icon>
              <span>Retry</span>
            </button>
          </div>
        } @else {
          <div class="table-container">
            <table
              mat-table
              [dataSource]="filteredUsers()"
              matSort
              class="users-table"
            >
              <!-- Checkbox Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef class="col-checkbox">
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
                  class="user-cell"
                  (click)="viewUser(user)"
                >
                  <div class="user-info">
                    <div class="user-avatar">
                      <span class="user-initials">
                        {{ getInitials(user) }}
                      </span>
                    </div>
                    <div class="user-details">
                      <div class="user-name-row">
                        <p class="user-name">
                          {{ user.firstName }} {{ user.lastName }}
                        </p>
                        <!-- Role Count Badge -->
                        <span
                          *ngIf="getRoleCount(user) > 0"
                          [matTooltip]="'Click to view role details'"
                          matTooltipPosition="above"
                          (click)="
                            $event.stopPropagation();
                            openRoleAssignmentInfoModal(user)
                          "
                          [ngClass]="{
                            'role-badge-single': getRoleCount(user) === 1,
                            'role-badge-multiple': getRoleCount(user) > 1,
                          }"
                          class="role-badge"
                        >
                          {{ getRoleCount(user) }}
                        </span>
                      </div>
                      <p class="user-email">
                        {{ user.email }}
                      </p>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Department Column -->
              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef>Department</th>
                <td mat-cell *matCellDef="let user">
                  {{ user.department?.dept_name || '-' }}
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
                      class="role-chip"
                    >
                      {{ role.roleName | titlecase }}
                    </mat-chip>
                  </mat-chip-set>
                  <!-- Fallback for backward compatibility (single role) -->
                  <mat-chip
                    *ngIf="!user.roles || user.roles.length === 0"
                    [matTooltip]="'Single role assignment'"
                    matTooltipPosition="above"
                    class="role-chip"
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
                  class="status-cell"
                >
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="statusMenu"
                    [matTooltip]="
                      user.status ? (user.status | titlecase) : 'Unknown Status'
                    "
                    [ngClass]="{
                      'status-active': user.status === 'active',
                      'status-inactive': user.status === 'inactive',
                      'status-suspended': user.status === 'suspended',
                      'status-pending': user.status === 'pending',
                      'status-unknown': !user.status,
                    }"
                    class="status-button"
                  >
                    <mat-icon>
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
                      class="status-menu-active"
                    >
                      <mat-icon>check_circle</mat-icon>
                      <span>Active</span>
                    </button>
                    <button
                      mat-menu-item
                      [disabled]="user.status === 'inactive'"
                      (click)="updateUserStatus(user, 'inactive')"
                      class="status-menu-inactive"
                    >
                      <mat-icon>cancel</mat-icon>
                      <span>Inactive</span>
                    </button>
                    <button
                      mat-menu-item
                      [disabled]="user.status === 'suspended'"
                      (click)="updateUserStatus(user, 'suspended')"
                      class="status-menu-suspended"
                    >
                      <mat-icon>block</mat-icon>
                      <span>Suspended</span>
                    </button>
                    <button
                      mat-menu-item
                      [disabled]="user.status === 'pending'"
                      (click)="updateUserStatus(user, 'pending')"
                      class="status-menu-pending"
                    >
                      <mat-icon>schedule</mat-icon>
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
                <td mat-cell *matCellDef="let user" class="last-login-cell">
                  {{
                    user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'
                  }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="col-actions">
                  Actions
                </th>
                <td
                  mat-cell
                  *matCellDef="let user"
                  class="col-actions"
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
                      class="delete-action"
                    >
                      <mat-icon>delete</mat-icon>
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
                class="table-row"
              ></tr>

              <!-- No data row -->
              <tr class="mat-row" *matNoDataRow>
                <td
                  class="empty-state-cell"
                  [colSpan]="displayedColumns.length"
                >
                  <mat-icon class="empty-state-icon">person_search</mat-icon>
                  <p class="empty-state-title">No users found</p>
                  <p class="empty-state-subtitle">
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
            class="paginator-border"
          ></mat-paginator>
        }
      </mat-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* ===== CONTAINER ===== */
      .user-list-container {
        padding: var(--ax-spacing-2xl) var(--ax-spacing-lg);
        max-width: 1400px;
        margin: 0 auto;
      }

      /* ===== PAGE HEADER ===== */
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--ax-spacing-2xl);
        gap: var(--ax-spacing-lg);
      }

      .header-content {
        flex: 1;
      }

      .page-title {
        margin: 0 0 var(--ax-spacing-xs) 0;
        font-size: var(--ax-font-size-3xl);
        font-weight: var(--ax-font-weight-bold);
        color: var(--ax-text-heading);
        letter-spacing: -0.02em;
      }

      .page-subtitle {
        margin: 0;
        font-size: var(--ax-font-size-sm);
        color: var(--ax-text-subtle);
      }

      /* ===== FILTERS CARD ===== */
      .filters-card {
        margin-bottom: var(--ax-spacing-lg);
      }

      .filters-container {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-md);
      }

      .filters-grid {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--ax-spacing-md);
      }

      .filters-actions {
        display: flex;
        gap: var(--ax-spacing-sm);
        flex-shrink: 0;
      }

      .btn-text {
        display: none;
      }

      .active-filters-section {
        margin-top: var(--ax-spacing-md);
        padding-top: var(--ax-spacing-md);
        border-top: 1px solid var(--ax-border-default);
      }

      .active-filters-container {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm);
        flex-wrap: wrap;
      }

      .active-filters-label {
        font-size: var(--ax-font-size-sm);
        font-weight: var(--ax-font-weight-medium);
        color: var(--ax-text-default);
      }

      /* ===== BULK ACTIONS ===== */
      .bulk-actions-card {
        margin-bottom: var(--ax-spacing-lg);
        background-color: var(--ax-info-subtle);
        border-color: var(--ax-info-muted);
      }

      .bulk-actions-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .bulk-actions-info {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-md);
      }

      .bulk-actions-icon {
        color: var(--ax-info-emphasis);
      }

      .bulk-actions-text {
        font-weight: var(--ax-font-weight-medium);
        color: var(--ax-info-emphasis);
      }

      .bulk-actions-buttons {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm);
      }

      /* ===== BULK PROGRESS ===== */
      .bulk-progress-card {
        margin-bottom: var(--ax-spacing-lg);
        background-color: var(--ax-success-subtle);
        border-color: var(--ax-success-muted);
      }

      .bulk-progress-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ax-spacing-lg);
      }

      .bulk-progress-content {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-md);
        flex: 1;
      }

      .bulk-progress-icon {
        color: var(--ax-success-emphasis);
        animation: spin 2s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .bulk-progress-text {
        flex: 1;
      }

      .bulk-progress-title {
        font-weight: var(--ax-font-weight-medium);
        color: var(--ax-success-emphasis);
        margin: 0 0 var(--ax-spacing-xs);
      }

      .bulk-progress-subtitle {
        font-size: var(--ax-font-size-sm);
        color: var(--ax-success-default);
        margin: 0;
      }

      .bulk-progress-chart {
        text-align: right;
      }

      .progress-ring {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        position: relative;
      }

      .progress-ring svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
      }

      .progress-ring-bg {
        stroke: var(--ax-border-muted);
      }

      .progress-ring-fill {
        stroke: var(--ax-success-emphasis);
        stroke-linecap: round;
        transition: stroke-dasharray 0.3s ease;
      }

      .progress-percentage {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .progress-percentage span {
        font-size: var(--ax-font-size-sm);
        font-weight: var(--ax-font-weight-bold);
        color: var(--ax-success-emphasis);
      }

      /* ===== LOADING & ERROR ===== */
      .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 256px;
      }

      .error-container {
        text-align: center;
        padding: var(--ax-spacing-3xl) var(--ax-spacing-md);
      }

      .error-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--ax-error-emphasis);
      }

      .error-title {
        font-size: var(--ax-font-size-lg);
        font-weight: var(--ax-font-weight-semibold);
        color: var(--ax-text-heading);
        margin: var(--ax-spacing-md) 0 var(--ax-spacing-sm);
      }

      .error-message {
        color: var(--ax-text-subtle);
        margin: 0 0 var(--ax-spacing-lg);
      }

      /* ===== STATUS ICONS ===== */
      .status-icon-active {
        color: var(--ax-success-emphasis);
      }

      .status-icon-inactive {
        color: var(--ax-text-subtle);
      }

      .status-icon-suspended {
        color: var(--ax-error-emphasis);
      }

      .status-icon-pending {
        color: var(--ax-warning-emphasis);
      }

      /* ===== TABLE ===== */
      .table-container {
        overflow-x: auto;
      }

      .users-table {
        width: 100%;
      }

      .mat-mdc-header-row {
        background-color: var(--ax-background-muted);
      }

      .mat-column-select {
        overflow: initial;
      }

      .col-checkbox {
        width: 64px;
      }

      .col-actions {
        text-align: right;
      }

      /* User Cell */
      .user-cell {
        cursor: pointer;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-md);
        padding: var(--ax-spacing-sm) 0;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--ax-radius-full);
        background-color: var(--ax-brand-faint);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .user-initials {
        color: var(--ax-brand-emphasis);
        font-weight: var(--ax-font-weight-semibold);
        font-size: var(--ax-font-size-sm);
      }

      .user-details {
        flex: 1;
        min-width: 0;
      }

      .user-name-row {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm);
      }

      .user-name {
        margin: 0;
        font-weight: var(--ax-font-weight-medium);
        color: var(--ax-text-heading);
        font-size: var(--ax-font-size-base);
      }

      .user-email {
        margin: 0;
        font-size: var(--ax-font-size-sm);
        color: var(--ax-text-subtle);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .role-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: var(--ax-radius-full);
        font-size: 11px;
        font-weight: var(--ax-font-weight-medium);
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        background-color: var(--ax-background-subtle);
        color: var(--ax-text-default);
        border: 1px solid var(--ax-border-default);
      }

      .role-badge:hover {
        background-color: var(--ax-background-muted);
        color: var(--ax-text-heading);
      }

      .role-badge-single {
        /* Unified styling - no special color */
      }

      .role-badge-multiple {
        /* Unified styling - no special color */
      }

      /* Role Chips in Role Column */
      ::ng-deep .role-chip {
        background-color: var(--ax-background-subtle) !important;
        color: var(--ax-text-default) !important;
        border: 1px solid var(--ax-border-default) !important;
        font-size: var(--ax-font-size-sm) !important;
        font-weight: var(--ax-font-weight-medium) !important;
      }

      /* Status Cell */
      .status-cell {
        position: relative;
      }

      .status-button {
        font-size: var(--ax-font-size-sm);
        font-weight: var(--ax-font-weight-medium);
      }

      .status-active {
        color: var(--ax-success-emphasis);
      }

      .status-inactive {
        color: var(--ax-text-subtle);
      }

      .status-suspended {
        color: var(--ax-error-emphasis);
      }

      .status-pending {
        color: var(--ax-warning-emphasis);
      }

      .status-unknown {
        color: var(--ax-text-disabled);
      }

      /* Last Login Cell */
      .last-login-cell {
        font-size: var(--ax-font-size-sm);
        color: var(--ax-text-subtle);
      }

      /* Delete Action */
      .delete-action {
        color: var(--ax-error-emphasis);
      }

      .delete-action mat-icon {
        color: var(--ax-error-emphasis);
      }

      /* Table Row */
      .table-row:hover {
        background-color: var(--ax-background-muted);
      }

      /* Paginator */
      .paginator-border {
        border-top: 1px solid var(--ax-border-default);
      }

      /* Empty State */
      .empty-state-cell {
        text-align: center;
        padding: var(--ax-spacing-3xl) var(--ax-spacing-md);
      }

      .empty-state-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--ax-text-disabled);
        margin-bottom: var(--ax-spacing-md);
      }

      .empty-state-title {
        margin: 0 0 var(--ax-spacing-xs);
        font-size: var(--ax-font-size-lg);
        font-weight: var(--ax-font-weight-semibold);
        color: var(--ax-text-subtle);
      }

      .empty-state-subtitle {
        margin: 0;
        font-size: var(--ax-font-size-sm);
        color: var(--ax-text-subtle);
      }

      /* ===== RESPONSIVE ===== */
      @media (min-width: 640px) {
        .btn-text {
          display: inline;
        }

        .filters-container {
          flex-direction: row;
          align-items: flex-end;
        }
      }

      @media (max-width: 768px) {
        .user-list-container {
          padding: var(--ax-spacing-lg) var(--ax-spacing-md);
        }

        .page-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .page-title {
          font-size: var(--ax-font-size-2xl);
        }

        .filters-actions {
          width: 100%;
        }

        .filters-actions button {
          flex: 1;
        }
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
  bulkProgress = signal<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  // Table columns
  displayedColumns: string[] = [
    'select',
    'user',
    'department',
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
      const assignedDate = new Date(role.assignedAt).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        },
      );
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
