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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
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
import { Role, RoleFilters } from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';
import { RoleDialogComponent } from '../../dialogs/role-dialog/role-dialog.component';

@Component({
  selector: 'app-role-management',
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
    MatDividerModule,
    BreadcrumbComponent,
  ],
  template: `
    <div class="role-management p-6 space-y-6">
      <!-- Breadcrumb -->
      <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>

      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Role Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage system roles and their permissions
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            mat-raised-button
            color="primary"
            (click)="openCreateDialog()"
            [disabled]="isLoading()"
          >
            <mat-icon>add</mat-icon>
            Create Role
          </button>
          <button
            mat-raised-button
            (click)="refreshRoles()"
            [disabled]="isLoading()"
          >
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card>
        <mat-card-content class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Search roles</mat-label>
              <input
                matInput
                [(ngModel)]="filters.search"
                (ngModelChange)="onFilterChange()"
                placeholder="Search by name or description"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Category</mat-label>
              <mat-select
                [(ngModel)]="filters.category"
                (ngModelChange)="onFilterChange()"
              >
                <mat-option [value]="null">All Categories</mat-option>
                <mat-option
                  *ngFor="let category of availableCategories()"
                  [value]="category"
                >
                  {{ category }}
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
              <mat-label>Type</mat-label>
              <mat-select
                [(ngModel)]="filters.isSystemRole"
                (ngModelChange)="onFilterChange()"
              >
                <mat-option [value]="null">All Types</mat-option>
                <mat-option [value]="false">Custom</mat-option>
                <mat-option [value]="true">System</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Bulk Actions -->
          <div
            *ngIf="selection.hasValue()"
            class="flex items-center gap-2 mt-4 pt-4 border-t"
          >
            <span class="text-sm text-gray-600">
              {{ selection.selected.length }} role(s) selected
            </span>
            <button mat-stroked-button color="primary" (click)="bulkActivate()">
              <mat-icon>check_circle</mat-icon>
              Activate
            </button>
            <button mat-stroked-button color="warn" (click)="bulkDeactivate()">
              <mat-icon>block</mat-icon>
              Deactivate
            </button>
            <button
              mat-stroked-button
              color="warn"
              (click)="bulkDelete()"
              [disabled]="!canBulkDelete()"
            >
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Role Table -->
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

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let role" class="font-medium">
                <div class="flex items-center gap-2">
                  <span>{{ role.name }}</span>
                  <mat-chip-set *ngIf="role.is_system_role">
                    <mat-chip
                      class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200"
                    >
                      System
                    </mat-chip>
                  </mat-chip-set>
                </div>
              </td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let role">
                <span class="text-gray-600 dark:text-gray-400">
                  {{ role.description || 'No description' }}
                </span>
              </td>
            </ng-container>

            <!-- Category Column -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>
                Category
              </th>
              <td mat-cell *matCellDef="let role">
                <mat-chip-set>
                  <mat-chip
                    class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200"
                  >
                    {{ role.category }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <!-- Permissions Column -->
            <ng-container matColumnDef="permissions">
              <th mat-header-cell *matHeaderCellDef>Permissions</th>
              <td mat-cell *matCellDef="let role">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">{{
                    role.permissions?.length || 0
                  }}</span>
                  <button
                    mat-icon-button
                    (click)="viewPermissions(role); $event.stopPropagation()"
                    [disabled]="!role.permissions?.length"
                    matTooltip="View permissions"
                  >
                    <mat-icon class="text-base">visibility</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <!-- Users Column -->
            <ng-container matColumnDef="users">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Users</th>
              <td mat-cell *matCellDef="let role">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">{{
                    role.user_count || 0
                  }}</span>
                  <button
                    mat-icon-button
                    (click)="viewUsers(role); $event.stopPropagation()"
                    [disabled]="!role.user_count"
                    matTooltip="View assigned users"
                  >
                    <mat-icon class="text-base">people</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let role">
                <mat-chip-set>
                  <mat-chip
                    [class]="
                      role.is_active
                        ? '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200'
                        : '!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200'
                    "
                  >
                    {{ role.is_active ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="w-24">Actions</th>
              <td mat-cell *matCellDef="let role" class="w-24">
                <button
                  mat-icon-button
                  [matMenuTriggerFor]="actionMenu"
                  (click)="$event.stopPropagation()"
                >
                  <mat-icon>more_vert</mat-icon>
                </button>

                <mat-menu #actionMenu="matMenu">
                  <button mat-menu-item (click)="editRole(role)">
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <button mat-menu-item (click)="duplicateRole(role)">
                    <mat-icon>content_copy</mat-icon>
                    Duplicate
                  </button>
                  <button mat-menu-item (click)="toggleRoleStatus(role)">
                    <mat-icon>{{
                      role.is_active ? 'block' : 'check_circle'
                    }}</mat-icon>
                    {{ role.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                  <mat-divider></mat-divider>
                  <button
                    mat-menu-item
                    (click)="deleteRole(role)"
                    [disabled]="!canDeleteRole(role)"
                    class="text-red-600"
                  >
                    <mat-icon class="text-red-600">delete</mat-icon>
                    Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns"
              (click)="viewRoleDetails(row)"
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
          <mat-icon class="text-6xl mb-4 opacity-50">people</mat-icon>
          <h3 class="text-lg font-medium mb-2">No roles found</h3>
          <p class="text-center mb-4">
            {{
              hasActiveFilters()
                ? 'Try adjusting your filters'
                : 'Create your first role to get started'
            }}
          </p>
          <button
            mat-raised-button
            color="primary"
            (click)="hasActiveFilters() ? clearFilters() : openCreateDialog()"
          >
            <mat-icon>{{ hasActiveFilters() ? 'clear_all' : 'add' }}</mat-icon>
            {{ hasActiveFilters() ? 'Clear Filters' : 'Create Role' }}
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
      .role-management {
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
    `,
  ],
})
export class RoleManagementComponent implements OnInit {
  private readonly rbacService = inject(RbacService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'name',
    'description',
    'category',
    'permissions',
    'users',
    'status',
    'actions',
  ];

  dataSource = new MatTableDataSource<Role>([]);
  selection = new SelectionModel<Role>(true, []);

  // Signals
  readonly isLoading = signal(true);
  readonly roles = signal<Role[]>([]);
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
      id: 'roles',
      title: 'Role Management',
      icon: 'people',
      type: 'basic',
    },
  ];
  readonly availableCategories = signal<string[]>([]);

  // Filters
  filters: RoleFilters = {
    search: '',
    category: null,
    isActive: null,
    isSystemRole: null,
    parentRoleId: null,
  };

  // Computed
  readonly filteredRoles = computed(() => {
    let filtered = this.roles();

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.name.toLowerCase().includes(search) ||
          (role.description && role.description.toLowerCase().includes(search)),
      );
    }

    if (this.filters.category) {
      filtered = filtered.filter(
        (role) => role.category === this.filters.category,
      );
    }

    if (this.filters.isActive !== null) {
      filtered = filtered.filter(
        (role) => role.is_active === this.filters.isActive,
      );
    }

    if (this.filters.isSystemRole !== null) {
      filtered = filtered.filter(
        (role) => role.is_system_role === this.filters.isSystemRole,
      );
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadRoles();
    this.loadCategories();

    // Check for query parameters
    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'create') {
        setTimeout(() => this.openCreateDialog(), 100);
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private async loadRoles(): Promise<void> {
    try {
      this.isLoading.set(true);

      const response = await this.rbacService
        .getRoles({
          page: this.currentPage() + 1,
          limit: this.pageSize(),
          include_permissions: true,
          include_user_count: true,
        })
        .toPromise();

      if (response) {
        this.roles.set(response.data);
        this.totalCount.set(response.pagination.total);
        this.dataSource.data = response.data;
      }
    } catch (error) {
      this.snackBar.open('Failed to load roles', 'Close', { duration: 3000 });
      console.error('Failed to load roles:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadCategories(): Promise<void> {
    try {
      const categories = await this.rbacService.getRoleCategories().toPromise();
      if (categories) {
        this.availableCategories.set(categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  // Filter methods
  onFilterChange(): void {
    this.dataSource.data = this.filteredRoles();
    this.selection.clear();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.category ||
      this.filters.isActive !== null ||
      this.filters.isSystemRole !== null
    );
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      category: null,
      isActive: null,
      isSystemRole: null,
      parentRoleId: null,
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
    this.loadRoles();
  }

  // Role actions
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '800px',
      data: {
        mode: 'create',
        availablePermissions: [], // Will be loaded in dialog
        availableRoles: this.roles().filter((r) => !r.is_system_role),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshRoles();
        this.snackBar.open('Role created successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  editRole(role: Role): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '800px',
      data: {
        mode: 'edit',
        role: role,
        availablePermissions: [], // Will be loaded in dialog
        availableRoles: this.roles().filter(
          (r) => r.id !== role.id && !r.is_system_role,
        ),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshRoles();
        this.snackBar.open('Role updated successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  duplicateRole(role: Role): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '800px',
      data: {
        mode: 'create',
        role: {
          ...role,
          id: '',
          name: `${role.name} (Copy)`,
          is_system_role: false,
          user_count: 0,
          created_at: '',
          updated_at: '',
        },
        availablePermissions: [], // Will be loaded in dialog
        availableRoles: this.roles().filter((r) => !r.is_system_role),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshRoles();
        this.snackBar.open('Role duplicated successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  async deleteRole(role: Role): Promise<void> {
    if (!this.canDeleteRole(role)) {
      this.snackBar.open('Cannot delete this role', 'Close', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Role',
        message: `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warn',
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      try {
        await this.rbacService.deleteRole(role.id).toPromise();
        this.refreshRoles();
        this.snackBar.open('Role deleted successfully', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Failed to delete role', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  async toggleRoleStatus(role: Role): Promise<void> {
    try {
      await this.rbacService
        .updateRole(role.id, {
          is_active: !role.is_active,
        })
        .toPromise();

      this.refreshRoles();
      this.snackBar.open(
        `Role ${role.is_active ? 'deactivated' : 'activated'} successfully`,
        'Close',
        { duration: 3000 },
      );
    } catch (error) {
      this.snackBar.open('Failed to update role status', 'Close', {
        duration: 3000,
      });
    }
  }

  viewRoleDetails(role: Role): void {
    // TODO: Navigate to role details page or open details modal
    console.log('View role details:', role);
  }

  viewPermissions(role: Role): void {
    // TODO: Open permissions view modal
    console.log('View permissions for role:', role);
  }

  viewUsers(role: Role): void {
    // TODO: Navigate to user assignments for this role
    console.log('View users for role:', role);
  }

  // Bulk actions
  async bulkActivate(): Promise<void> {
    const roleIds = this.selection.selected.map((role) => role.id);

    try {
      await this.rbacService
        .bulkUpdateRoles({
          role_ids: roleIds,
          updates: { is_active: true },
        })
        .toPromise();

      this.refreshRoles();
      this.selection.clear();
      this.snackBar.open('Roles activated successfully', 'Close', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Failed to activate roles', 'Close', {
        duration: 3000,
      });
    }
  }

  async bulkDeactivate(): Promise<void> {
    const roleIds = this.selection.selected.map((role) => role.id);

    try {
      await this.rbacService
        .bulkUpdateRoles({
          role_ids: roleIds,
          updates: { is_active: false },
        })
        .toPromise();

      this.refreshRoles();
      this.selection.clear();
      this.snackBar.open('Roles deactivated successfully', 'Close', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Failed to deactivate roles', 'Close', {
        duration: 3000,
      });
    }
  }

  async bulkDelete(): Promise<void> {
    const deletableRoles = this.selection.selected.filter((role) =>
      this.canDeleteRole(role),
    );

    if (deletableRoles.length === 0) {
      this.snackBar.open('No roles can be deleted', 'Close', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Roles',
        message: `Are you sure you want to delete ${deletableRoles.length} role(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warn',
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      try {
        // Delete roles one by one (API might not support bulk delete)
        for (const role of deletableRoles) {
          await this.rbacService.deleteRole(role.id).toPromise();
        }

        this.refreshRoles();
        this.selection.clear();
        this.snackBar.open(
          `${deletableRoles.length} role(s) deleted successfully`,
          'Close',
          { duration: 3000 },
        );
      } catch (error) {
        this.snackBar.open('Failed to delete some roles', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  // Utility methods
  refreshRoles(): void {
    this.loadRoles();
  }

  canDeleteRole(role: Role): boolean {
    return this.rbacService.isRoleDeletable(role);
  }

  canBulkDelete(): boolean {
    return this.selection.selected.some((role) => this.canDeleteRole(role));
  }
}
