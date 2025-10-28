import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbComponent, AegisxNavigationItem } from '@aegisx/ui';
import { ConfirmDialogComponent } from '../../../../shared/ui/components/confirm-dialog.component';
import { Role, UserRole, UserRoleFilters } from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';
import { BulkAssignDialogComponent } from '../../dialogs/bulk-assign-dialog/bulk-assign-dialog.component';
import { UserRoleAssignDialogComponent } from '../../dialogs/user-role-assign-dialog/user-role-assign-dialog.component';
import { UserRolesDialogComponent } from '../../dialogs/user-roles-dialog/user-roles-dialog.component';
import { UserPermissionsDialogComponent } from '../../dialogs/user-permissions-dialog/user-permissions-dialog.component';
import { UserOverviewDialogComponent } from '../../dialogs/user-overview-dialog/user-overview-dialog.component';
import { SetExpiryDialogComponent } from '../../dialogs/set-expiry-dialog/set-expiry-dialog.component';
import { BulkSetExpiryDialogComponent } from '../../dialogs/bulk-set-expiry-dialog/bulk-set-expiry-dialog.component';

@Component({
  selector: 'app-user-role-assignment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    MatDividerModule,
    BreadcrumbComponent,
  ],
  template: `
    <div class="user-role-assignment p-6 space-y-6">
      <!-- Breadcrumb -->
      <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>

      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            User Role Assignments
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage role assignments and user access permissions
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            mat-raised-button
            color="primary"
            (click)="openAssignDialog()"
            [disabled]="isLoading()"
          >
            <mat-icon>person_add</mat-icon>
            Assign Role
          </button>
          <button
            mat-raised-button
            color="accent"
            (click)="openBulkAssignDialog()"
            [disabled]="isLoading()"
          >
            <mat-icon>group_add</mat-icon>
            Bulk Assign
          </button>
          <button
            mat-raised-button
            (click)="refreshAssignments()"
            [disabled]="isLoading()"
          >
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <mat-card class="p-4 text-center">
          <div class="text-2xl font-bold text-blue-600 mb-1">
            {{ totalAssignments() }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Total Assignments
          </div>
        </mat-card>

        <mat-card class="p-4 text-center">
          <div class="text-2xl font-bold text-green-600 mb-1">
            {{ activeAssignments() }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Active Assignments
          </div>
        </mat-card>

        <mat-card class="p-4 text-center">
          <div class="text-2xl font-bold text-orange-600 mb-1">
            {{ expiringAssignments() }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Expiring Soon
          </div>
        </mat-card>

        <mat-card class="p-4 text-center">
          <div class="text-2xl font-bold text-red-600 mb-1">
            {{ expiredAssignments() }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Expired</div>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card>
        <mat-card-content class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Search users</mat-label>
              <input
                matInput
                [(ngModel)]="filters.search"
                (ngModelChange)="onFilterChange()"
                placeholder="Search by user name or email"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Role</mat-label>
              <mat-select
                [(ngModel)]="filters.roleId"
                (ngModelChange)="onFilterChange()"
              >
                <mat-option [value]="null">All Roles</mat-option>
                <mat-option
                  *ngFor="let role of availableRoles()"
                  [value]="role.id"
                >
                  {{ role.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Status</mat-label>
              <mat-select
                [(ngModel)]="filters.isActive"
                (ngModelChange)="onFilterChange()"
              >
                <mat-option [value]="null">All Statuses</mat-option>
                <mat-option [value]="true">Active</mat-option>
                <mat-option [value]="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Expiry Status</mat-label>
              <mat-select
                [(ngModel)]="filters.expiryStatus"
                (ngModelChange)="onFilterChange()"
              >
                <mat-option [value]="'all'">All</mat-option>
                <mat-option [value]="'active'">No Expiry</mat-option>
                <mat-option [value]="'expiring'">Expiring Soon</mat-option>
                <mat-option [value]="'expired'">Expired</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Bulk Actions -->
          <div
            *ngIf="selection.hasValue()"
            class="flex items-center gap-2 mt-4 pt-4 border-t"
          >
            <span class="text-sm text-gray-600">
              {{ selection.selected.length }} assignment(s) selected
            </span>
            <button
              mat-stroked-button
              color="primary"
              (click)="bulkSetExpiry()"
            >
              <mat-icon>event</mat-icon>
              Set Expiry
            </button>
            <button
              mat-stroked-button
              color="primary"
              (click)="bulkExtendExpiry()"
            >
              <mat-icon>schedule</mat-icon>
              Extend Expiry
            </button>
            <button mat-stroked-button color="warn" (click)="bulkRemoveRoles()">
              <mat-icon>person_remove</mat-icon>
              Remove Roles
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Assignments Table -->
      <mat-card>
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            <!-- Selection Column -->
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef class="w-12">
                <mat-checkbox
                  (change)="$event ? toggleAllRows() : null"
                  [checked]="selection.hasValue() && isAllSelected()"
                  [indeterminate]="selection.hasValue() && !isAllSelected()"
                >
                </mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let row" class="w-12">
                <mat-checkbox
                  (click)="$event.stopPropagation()"
                  (change)="$event ? selection.toggle(row) : null"
                  [checked]="selection.isSelected(row)"
                >
                </mat-checkbox>
              </td>
            </ng-container>

            <!-- User Column -->
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>User</th>
              <td mat-cell *matCellDef="let assignment">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
                  >
                    <mat-icon class="text-blue-600 text-base">person</mat-icon>
                  </div>
                  <div>
                    <div class="font-medium">
                      {{ getUserDisplayName(assignment) }}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ getUserEmail(assignment) }}
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Role Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
              <td mat-cell *matCellDef="let assignment">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ assignment.role.name }}</span>
                  <mat-chip
                    *ngIf="assignment.role.is_system_role"
                    class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200"
                  >
                    System
                  </mat-chip>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ assignment.role.category }}
                </div>
              </td>
            </ng-container>

            <!-- Assigned By Column -->
            <ng-container matColumnDef="assigned_by">
              <th mat-header-cell *matHeaderCellDef>Assigned By</th>
              <td mat-cell *matCellDef="let assignment">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-gray-500 text-base"
                    >account_circle</mat-icon
                  >
                  <span class="text-sm">
                    {{ assignment.assigned_by || 'System' }}
                  </span>
                </div>
              </td>
            </ng-container>

            <!-- Assigned Date Column -->
            <ng-container matColumnDef="assigned_at">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>
                Assigned Date
              </th>
              <td mat-cell *matCellDef="let assignment">
                <div class="text-sm">
                  {{ formatDate(assignment.assigned_at) }}
                </div>
              </td>
            </ng-container>

            <!-- Expiry Column -->
            <ng-container matColumnDef="expires_at">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Expires</th>
              <td mat-cell *matCellDef="let assignment">
                <div *ngIf="assignment.expires_at; else noExpiry">
                  <div class="text-sm">
                    {{ formatDate(assignment.expires_at) }}
                  </div>
                  <mat-chip
                    [class]="getExpiryStatusClass(assignment)"
                    class="!text-xs !mt-1"
                  >
                    {{ getExpiryStatusText(assignment) }}
                  </mat-chip>
                </div>
                <ng-template #noExpiry>
                  <mat-chip
                    class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200 !text-xs"
                  >
                    No Expiry
                  </mat-chip>
                </ng-template>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let assignment">
                <mat-chip
                  [class]="
                    assignment.is_active
                      ? '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200'
                      : '!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200'
                  "
                >
                  {{ assignment.is_active ? 'Active' : 'Inactive' }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="w-24">Actions</th>
              <td mat-cell *matCellDef="let assignment" class="w-24">
                <button
                  mat-icon-button
                  [matMenuTriggerFor]="actionMenu"
                  (click)="$event.stopPropagation()"
                >
                  <mat-icon>more_vert</mat-icon>
                </button>

                <mat-menu #actionMenu="matMenu">
                  <button mat-menu-item (click)="viewUserOverview(assignment)">
                    <mat-icon>account_circle</mat-icon>
                    View Overview
                  </button>
                  <button mat-menu-item (click)="viewUserRoles(assignment)">
                    <mat-icon>visibility</mat-icon>
                    View All User Roles
                  </button>
                  <button mat-menu-item (click)="viewPermissions(assignment)">
                    <mat-icon>security</mat-icon>
                    View Permissions
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="setExpiry(assignment)">
                    <mat-icon>schedule</mat-icon>
                    Set Expiry
                  </button>
                  <mat-divider></mat-divider>
                  <button
                    mat-menu-item
                    (click)="removeRole(assignment)"
                    class="text-red-600"
                  >
                    <mat-icon class="text-red-600">person_remove</mat-icon>
                    Remove Role
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
              (click)="viewAssignmentDetails(row)"
              class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            ></tr>
          </table>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="!isLoading() && dataSource.data.length === 0"
          class="flex flex-col items-center justify-center py-12 text-gray-500"
        >
          <mat-icon class="text-6xl mb-4 opacity-50">assignment_ind</mat-icon>
          <h3 class="text-lg font-medium mb-2">No role assignments found</h3>
          <p class="text-center mb-4">
            {{
              hasActiveFilters()
                ? 'Try adjusting your filters'
                : 'Start by assigning roles to users'
            }}
          </p>
          <button
            mat-raised-button
            color="primary"
            (click)="hasActiveFilters() ? clearFilters() : openAssignDialog()"
          >
            <mat-icon>{{
              hasActiveFilters() ? 'clear_all' : 'person_add'
            }}</mat-icon>
            {{ hasActiveFilters() ? 'Clear Filters' : 'Assign Role' }}
          </button>
        </div>

        <!-- Pagination -->
        <mat-paginator
          *ngIf="!isLoading() && dataSource.data.length > 0"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[10, 25, 50, 100]"
          [showFirstLastButtons]="true"
          (page)="onPageChange($event)"
        >
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .user-role-assignment {
        min-height: 100vh;
      }

      mat-card {
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .mat-mdc-table {
        background: transparent;
      }

      .mat-mdc-row:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      :host-context(.dark) .mat-mdc-row:hover {
        background: rgba(255, 255, 255, 0.04);
      }

      .mat-mdc-chip {
        min-height: 24px;
        font-size: 12px;
      }

      .mat-mdc-header-cell {
        font-weight: 600;
        color: var(--mdc-theme-on-surface);
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(45deg, #6366f1, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
      }
    `,
  ],
})
export class UserRoleAssignmentComponent implements OnInit {
  private readonly rbacService = inject(RbacService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'user',
    'role',
    'assigned_by',
    'assigned_at',
    'expires_at',
    'status',
    'actions',
  ];

  dataSource = new MatTableDataSource<UserRole>([]);
  selection = new SelectionModel<UserRole>(true, []);

  // Signals
  readonly isLoading = signal(true);
  readonly userRoles = signal<UserRole[]>([]);
  readonly availableRoles = signal<Role[]>([]);
  readonly totalCount = signal(0);
  readonly pageSize = signal(25);
  readonly currentPage = signal(0);

  // Breadcrumb items
  breadcrumbItems: AegisxNavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      link: '/',
      type: 'basic',
    },
    {
      id: 'management',
      title: 'Management',
      icon: 'settings',
      type: 'basic',
    },
    {
      id: 'rbac',
      title: 'RBAC Management',
      icon: 'security',
      link: '/rbac',
      type: 'basic',
    },
    {
      id: 'user-roles',
      title: 'User Role Assignments',
      icon: 'assignment_ind',
      type: 'basic',
    },
  ];

  // Filters
  filters: UserRoleFilters = {
    search: '',
    roleId: null,
    isActive: null,
    expiryStatus: 'all',
  };

  // Computed statistics
  readonly totalAssignments = computed(() => this.userRoles().length);
  readonly activeAssignments = computed(
    () =>
      this.userRoles().filter((ur) => ur.is_active && !this.isExpired(ur))
        .length,
  );
  readonly expiringAssignments = computed(
    () => this.userRoles().filter((ur) => this.isExpiringSoon(ur)).length,
  );
  readonly expiredAssignments = computed(
    () => this.userRoles().filter((ur) => this.isExpired(ur)).length,
  );

  // Computed filtered data
  readonly filteredUserRoles = computed(() => {
    let filtered = this.userRoles();

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (ur) =>
          this.getUserDisplayName(ur).toLowerCase().includes(search) ||
          this.getUserEmail(ur).toLowerCase().includes(search) ||
          ur.role.name.toLowerCase().includes(search),
      );
    }

    if (this.filters.roleId) {
      filtered = filtered.filter((ur) => ur.role_id === this.filters.roleId);
    }

    if (this.filters.isActive !== null) {
      filtered = filtered.filter(
        (ur) => ur.is_active === this.filters.isActive,
      );
    }

    if (this.filters.expiryStatus !== 'all') {
      filtered = filtered.filter((ur) => {
        switch (this.filters.expiryStatus) {
          case 'active':
            return !ur.expires_at;
          case 'expiring':
            return this.isExpiringSoon(ur);
          case 'expired':
            return this.isExpired(ur);
          default:
            return true;
        }
      });
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadUserRoles();
    this.loadRoles();

    // Check for query parameters
    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'bulk-assign') {
        setTimeout(() => this.openBulkAssignDialog(), 100);
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private async loadUserRoles(): Promise<void> {
    try {
      this.isLoading.set(true);

      const response = await this.rbacService
        .getUserRoles({
          page: this.currentPage() + 1,
          limit: this.pageSize(),
          include_role: true,
        })
        .toPromise();

      if (response) {
        this.userRoles.set(response.data);
        this.totalCount.set(response.pagination.total);
        this.updateDataSource();
      }
    } catch (error) {
      this.snackBar.open('Failed to load user role assignments', 'Close', {
        duration: 3000,
      });
      console.error('Failed to load user roles:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadRoles(): Promise<void> {
    try {
      const response = await this.rbacService
        .getRoles({
          page: 1,
          limit: 1000,
          is_active: true,
        })
        .toPromise();

      if (response) {
        this.availableRoles.set(response.data);
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  }

  private updateDataSource(): void {
    this.dataSource.data = this.filteredUserRoles();
  }

  // Filter methods
  onFilterChange(): void {
    this.updateDataSource();
    this.selection.clear();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.roleId ||
      this.filters.isActive !== null ||
      this.filters.expiryStatus !== 'all'
    );
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      roleId: null,
      isActive: null,
      expiryStatus: 'all',
    };
    this.onFilterChange();
  }

  // Table methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadUserRoles();
  }

  // Assignment actions
  openAssignDialog(): void {
    const dialogRef = this.dialog.open(UserRoleAssignDialogComponent, {
      width: '600px',
      data: {
        mode: 'assign',
        availableRoles: this.availableRoles(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshAssignments();
        this.snackBar.open('Role assigned successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  openBulkAssignDialog(): void {
    const dialogRef = this.dialog.open(BulkAssignDialogComponent, {
      width: '700px',
      data: {
        selectedUsers: [],
        availableRoles: this.availableRoles(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshAssignments();
        this.snackBar.open('Bulk assignment completed', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  async removeRole(assignment: UserRole): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Role Assignment',
        message: `Are you sure you want to remove the "${assignment.role.name}" role from this user?`,
        confirmText: 'Remove',
        cancelText: 'Cancel',
        type: 'warn',
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      try {
        await this.rbacService
          .removeRoleFromUser(assignment.user_id, assignment.role_id)
          .toPromise();

        this.refreshAssignments();
        this.snackBar.open('Role removed successfully', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Failed to remove role', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  private async updateUserRoleExpiry(
    assignment: UserRole,
    expiryDate: Date | null,
  ): Promise<void> {
    await this.rbacService
      .updateUserRoleExpiry(assignment.user_id, assignment.role_id, expiryDate)
      .toPromise();
  }

  viewUserOverview(assignment: UserRole): void {
    const dialogRef = this.dialog.open(UserOverviewDialogComponent, {
      width: '1000px',
      maxWidth: '90vw',
      data: {
        userId: assignment.user_id,
        userName: this.getUserDisplayName(assignment),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'manage') {
        this.openAssignDialog();
      }
    });
  }

  setExpiry(assignment: UserRole): void {
    const dialogRef = this.dialog.open(SetExpiryDialogComponent, {
      width: '600px',
      data: {
        userRole: assignment,
        userName: this.getUserDisplayName(assignment),
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.updateUserRoleExpiry(assignment, result.expiryDate);
          this.refreshAssignments();

          const action =
            result.mode === 'remove'
              ? 'removed'
              : result.mode === 'extend'
                ? 'extended'
                : 'set';
          this.snackBar.open(`Role expiry ${action} successfully`, 'Close', {
            duration: 3000,
          });
        } catch (error) {
          this.snackBar.open('Failed to update role expiry', 'Close', {
            duration: 3000,
          });
          console.error('Failed to update expiry:', error);
        }
      }
    });
  }

  viewAssignmentDetails(assignment: UserRole): void {
    // TODO: Open assignment details modal or navigate to details page
    console.log('View assignment details:', assignment);
  }

  viewUserRoles(assignment: UserRole): void {
    const dialogRef = this.dialog.open(UserRolesDialogComponent, {
      width: '700px',
      data: {
        userId: assignment.user_id,
        userName: this.getUserDisplayName(assignment),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'manage') {
        // Could navigate to user management page or open role assignment dialog
        this.openAssignDialog();
      }
    });
  }

  viewPermissions(assignment: UserRole): void {
    const dialogRef = this.dialog.open(UserPermissionsDialogComponent, {
      width: '900px',
      data: {
        userId: assignment.user_id,
        userName: this.getUserDisplayName(assignment),
        userRole: assignment,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Handle any actions from the permissions dialog if needed
      if (result) {
        console.log('Permissions dialog result:', result);
      }
    });
  }

  // Bulk actions
  bulkSetExpiry(): void {
    const selectedAssignments = this.selection.selected;

    if (selectedAssignments.length === 0) {
      this.snackBar.open('Please select assignments to update', 'Close', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(BulkSetExpiryDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        selectedAssignments,
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          // Process each assignment
          let successCount = 0;
          let errorCount = 0;

          for (const assignment of result.assignments) {
            try {
              await this.updateUserRoleExpiry(assignment, result.expiryDate);
              successCount++;
            } catch (error) {
              errorCount++;
              console.error(
                `Failed to update expiry for assignment:`,
                assignment,
                error,
              );
            }
          }

          // Clear selection and refresh
          this.selection.clear();
          this.refreshAssignments();

          // Show result message
          if (errorCount === 0) {
            const action = result.mode === 'remove' ? 'removed' : 'set';
            this.snackBar.open(
              `Successfully ${action} expiry for ${successCount} assignment(s)`,
              'Close',
              { duration: 3000 },
            );
          } else {
            this.snackBar.open(
              `Updated ${successCount} assignment(s), ${errorCount} failed`,
              'Close',
              { duration: 5000 },
            );
          }
        } catch (error) {
          this.snackBar.open('Failed to update role expiries', 'Close', {
            duration: 3000,
          });
          console.error('Bulk set expiry failed:', error);
        }
      }
    });
  }

  bulkExtendExpiry(): void {
    // TODO: Open bulk expiry extension dialog
    console.log('Bulk extend expiry for selected assignments');
  }

  async bulkRemoveRoles(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Role Assignments',
        message: `Are you sure you want to remove ${this.selection.selected.length} role assignment(s)?`,
        confirmText: 'Remove',
        cancelText: 'Cancel',
        type: 'warn',
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      try {
        // Remove roles one by one
        for (const assignment of this.selection.selected) {
          await this.rbacService
            .removeRoleFromUser(assignment.user_id, assignment.role_id)
            .toPromise();
        }

        this.refreshAssignments();
        this.selection.clear();
        this.snackBar.open('Role assignments removed successfully', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Failed to remove some role assignments', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  // Utility methods
  refreshAssignments(): void {
    this.loadUserRoles();
  }

  getUserDisplayName(assignment: UserRole): string {
    // This would normally come from the user data in the assignment
    // For now, we'll use a placeholder
    return `User ${assignment.user_id.substring(0, 8)}`;
  }

  getUserEmail(assignment: UserRole): string {
    // This would normally come from the user data in the assignment
    // For now, we'll use a placeholder
    return `user.${assignment.user_id.substring(0, 8)}@example.com`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  isExpired(assignment: UserRole): boolean {
    if (!assignment.expires_at) return false;
    return new Date(assignment.expires_at) < new Date();
  }

  isExpiringSoon(assignment: UserRole): boolean {
    if (!assignment.expires_at) return false;
    const expiryDate = new Date(assignment.expires_at);
    const now = new Date();
    const diffDays = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 7 && diffDays > 0;
  }

  getExpiryStatusText(assignment: UserRole): string {
    if (this.isExpired(assignment)) {
      return 'Expired';
    } else if (this.isExpiringSoon(assignment)) {
      return 'Expiring Soon';
    } else {
      return 'Active';
    }
  }

  getExpiryStatusClass(assignment: UserRole): string {
    if (this.isExpired(assignment)) {
      return '!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200';
    } else if (this.isExpiringSoon(assignment)) {
      return '!bg-orange-100 !text-orange-800 dark:!bg-orange-900 dark:!text-orange-200';
    } else {
      return '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200';
    }
  }
}
