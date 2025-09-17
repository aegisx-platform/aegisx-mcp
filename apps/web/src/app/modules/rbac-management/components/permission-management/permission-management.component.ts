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
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
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
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';
import {
  Permission,
  PermissionCategory,
  PermissionFilters,
  getPermissionName,
} from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';
import { PermissionDialogComponent } from '../permission-dialog/permission-dialog.component';

@Component({
  selector: 'app-permission-management',
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
    MatExpansionModule,
    MatBadgeModule,
    MatDividerModule,
    BreadcrumbComponent,
  ],
  template: `
    <div class="permission-management p-6 space-y-6">
      <!-- Breadcrumb -->
      <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>

      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Permission Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage system permissions and access controls
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
            Create Permission
          </button>
          <button
            mat-raised-button
            (click)="toggleViewMode()"
            [disabled]="isLoading()"
          >
            <mat-icon>{{
              viewMode() === 'table' ? 'category' : 'table_view'
            }}</mat-icon>
            {{ viewMode() === 'table' ? 'Category View' : 'Table View' }}
          </button>
          <button
            mat-raised-button
            (click)="refreshPermissions()"
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Search permissions</mat-label>
              <input
                matInput
                [(ngModel)]="filters.search"
                (ngModelChange)="onFilterChange()"
                placeholder="Search by name, description, etc."
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
              <mat-label>Resource</mat-label>
              <mat-select
                [(ngModel)]="filters.resource"
                (ngModelChange)="onFilterChange()"
              >
                <mat-option [value]="null">All Resources</mat-option>
                <mat-option
                  *ngFor="let resource of availableResources()"
                  [value]="resource"
                >
                  {{ resource }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Action</mat-label>
              <mat-select
                [(ngModel)]="filters.action"
                (ngModelChange)="onFilterChange()"
              >
                <mat-option [value]="null">All Actions</mat-option>
                <mat-option
                  *ngFor="let action of availableActions()"
                  [value]="action"
                >
                  {{ action }}
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
          </div>

          <!-- Bulk Actions -->
          <div
            *ngIf="selection.hasValue()"
            class="flex items-center gap-2 mt-4 pt-4 border-t"
          >
            <span class="text-sm text-gray-600">
              {{ selection.selected.length }} permission(s) selected
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

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Table View -->
      <div *ngIf="!isLoading() && viewMode() === 'table'">
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
                <td mat-cell *matCellDef="let permission" class="font-medium">
                  <div class="flex items-center gap-2">
                    <span>{{ getPermissionName(permission) }}</span>
                    <mat-chip-set *ngIf="permission.is_system_permission">
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
                <td mat-cell *matCellDef="let permission">
                  <span class="text-gray-600 dark:text-gray-400 text-sm">
                    {{ permission.description }}
                  </span>
                </td>
              </ng-container>

              <!-- Resource/Action Column -->
              <ng-container matColumnDef="resource_action">
                <th mat-header-cell *matHeaderCellDef>Resource & Action</th>
                <td mat-cell *matCellDef="let permission">
                  <div class="flex gap-2">
                    <mat-chip
                      class="!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200 !text-xs"
                    >
                      {{ permission.resource }}
                    </mat-chip>
                    <mat-chip
                      class="!bg-purple-100 !text-purple-800 dark:!bg-purple-900 dark:!text-purple-200 !text-xs"
                    >
                      {{ permission.action }}
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Category
                </th>
                <td mat-cell *matCellDef="let permission">
                  <mat-chip
                    class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200"
                  >
                    {{ permission.category }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Roles Column -->
              <ng-container matColumnDef="roles">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Used in Roles
                </th>
                <td mat-cell *matCellDef="let permission">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">{{
                      permission.role_count || 0
                    }}</span>
                    <button
                      mat-icon-button
                      (click)="viewRoles(permission); $event.stopPropagation()"
                      [disabled]="!permission.role_count"
                      matTooltip="View roles using this permission"
                    >
                      <mat-icon class="text-base">visibility</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  Status
                </th>
                <td mat-cell *matCellDef="let permission">
                  <mat-chip
                    [class]="
                      permission.is_active
                        ? '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200'
                        : '!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200'
                    "
                  >
                    {{ permission.is_active ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="w-24">Actions</th>
                <td mat-cell *matCellDef="let permission" class="w-24">
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="actionMenu"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>

                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="editPermission(permission)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button
                      mat-menu-item
                      (click)="duplicatePermission(permission)"
                    >
                      <mat-icon>content_copy</mat-icon>
                      Duplicate
                    </button>
                    <button
                      mat-menu-item
                      (click)="togglePermissionStatus(permission)"
                    >
                      <mat-icon>{{
                        permission.is_active ? 'block' : 'check_circle'
                      }}</mat-icon>
                      {{ permission.is_active ? 'Deactivate' : 'Activate' }}
                    </button>
                    <mat-divider></mat-divider>
                    <button
                      mat-menu-item
                      (click)="deletePermission(permission)"
                      [disabled]="!canDeletePermission(permission)"
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
                (click)="viewPermissionDetails(row)"
                class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              ></tr>
            </table>
          </div>

          <!-- Empty State -->
          <div
            *ngIf="dataSource.data.length === 0"
            class="flex flex-col items-center justify-center py-12 text-gray-500"
          >
            <mat-icon class="text-6xl mb-4 opacity-50">security</mat-icon>
            <h3 class="text-lg font-medium mb-2">No permissions found</h3>
            <p class="text-center mb-4">
              {{
                hasActiveFilters()
                  ? 'Try adjusting your filters'
                  : 'Create your first permission to get started'
              }}
            </p>
            <button
              mat-raised-button
              color="primary"
              (click)="hasActiveFilters() ? clearFilters() : openCreateDialog()"
            >
              <mat-icon>{{
                hasActiveFilters() ? 'clear_all' : 'add'
              }}</mat-icon>
              {{ hasActiveFilters() ? 'Clear Filters' : 'Create Permission' }}
            </button>
          </div>

          <!-- Pagination -->
          <mat-paginator
            *ngIf="dataSource.data.length > 0"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[10, 25, 50, 100]"
            [showFirstLastButtons]="true"
            (page)="onPageChange($event)"
          >
          </mat-paginator>
        </mat-card>
      </div>

      <!-- Category View -->
      <div *ngIf="!isLoading() && viewMode() === 'category'" class="space-y-4">
        <mat-accordion
          *ngIf="permissionCategories().length > 0; else noCategoriesFound"
        >
          <mat-expansion-panel
            *ngFor="
              let category of permissionCategories();
              trackBy: trackByCategory
            "
            [expanded]="category.isExpanded"
          >
            <mat-expansion-panel-header>
              <mat-panel-title class="flex items-center gap-3">
                <mat-icon class="text-blue-600">folder</mat-icon>
                <span class="font-medium">{{ category.name }}</span>
                <mat-chip
                  class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !ml-2"
                >
                  {{ category.count }} permissions
                </mat-chip>
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4"
            >
              <mat-card
                *ngFor="
                  let permission of category.permissions;
                  trackBy: trackByPermission
                "
                class="cursor-pointer transition-transform hover:scale-105"
                (click)="viewPermissionDetails(permission)"
              >
                <mat-card-header class="pb-2">
                  <mat-card-title
                    class="flex items-center justify-between text-base"
                  >
                    <span class="truncate">{{
                      getPermissionName(permission)
                    }}</span>
                    <mat-chip
                      *ngIf="permission.is_system_permission"
                      class="!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200 !ml-2"
                    >
                      System
                    </mat-chip>
                  </mat-card-title>
                </mat-card-header>

                <mat-card-content class="py-2">
                  <p
                    class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2"
                  >
                    {{ permission.description }}
                  </p>

                  <div class="flex flex-wrap gap-2 mb-3">
                    <mat-chip
                      class="!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200 !text-xs"
                    >
                      {{ permission.resource }}
                    </mat-chip>
                    <mat-chip
                      class="!bg-purple-100 !text-purple-800 dark:!bg-purple-900 dark:!text-purple-200 !text-xs"
                    >
                      {{ permission.action }}
                    </mat-chip>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <mat-icon class="text-sm text-gray-500">people</mat-icon>
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        {{ permission.role_count || 0 }} roles
                      </span>
                    </div>

                    <mat-chip
                      [class]="
                        permission.is_active
                          ? '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200'
                          : '!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200'
                      "
                    >
                      {{ permission.is_active ? 'Active' : 'Inactive' }}
                    </mat-chip>
                  </div>
                </mat-card-content>

                <mat-card-actions class="flex justify-end p-2">
                  <button
                    mat-icon-button
                    (click)="
                      editPermission(permission); $event.stopPropagation()
                    "
                    matTooltip="Edit"
                  >
                    <mat-icon class="text-base">edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="categoryActionMenu"
                    (click)="$event.stopPropagation()"
                    matTooltip="More actions"
                  >
                    <mat-icon class="text-base">more_vert</mat-icon>
                  </button>

                  <mat-menu #categoryActionMenu="matMenu">
                    <button
                      mat-menu-item
                      (click)="duplicatePermission(permission)"
                    >
                      <mat-icon>content_copy</mat-icon>
                      Duplicate
                    </button>
                    <button
                      mat-menu-item
                      (click)="togglePermissionStatus(permission)"
                    >
                      <mat-icon>{{
                        permission.is_active ? 'block' : 'check_circle'
                      }}</mat-icon>
                      {{ permission.is_active ? 'Deactivate' : 'Activate' }}
                    </button>
                    <mat-divider></mat-divider>
                    <button
                      mat-menu-item
                      (click)="deletePermission(permission)"
                      [disabled]="!canDeletePermission(permission)"
                      class="text-red-600"
                    >
                      <mat-icon class="text-red-600">delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </mat-card-actions>
              </mat-card>
            </div>
          </mat-expansion-panel>
        </mat-accordion>

        <ng-template #noCategoriesFound>
          <div
            class="flex flex-col items-center justify-center py-12 text-gray-500"
          >
            <mat-icon class="text-6xl mb-4 opacity-50">category</mat-icon>
            <h3 class="text-lg font-medium mb-2">
              No permission categories found
            </h3>
            <p class="text-center mb-4">
              {{
                hasActiveFilters()
                  ? 'Try adjusting your filters'
                  : 'Create your first permission to get started'
              }}
            </p>
            <button
              mat-raised-button
              color="primary"
              (click)="hasActiveFilters() ? clearFilters() : openCreateDialog()"
            >
              <mat-icon>{{
                hasActiveFilters() ? 'clear_all' : 'add'
              }}</mat-icon>
              {{ hasActiveFilters() ? 'Clear Filters' : 'Create Permission' }}
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .permission-management {
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

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .mat-mdc-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .mat-expansion-panel {
        margin-bottom: 16px !important;
        border-radius: 8px !important;
      }
    `,
  ],
})
export class PermissionManagementComponent implements OnInit {
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
    'resource_action',
    'category',
    'roles',
    'status',
    'actions',
  ];

  dataSource = new MatTableDataSource<Permission>([]);
  selection = new SelectionModel<Permission>(true, []);

  // Utility methods for template
  getPermissionName(permission: Permission): string {
    return getPermissionName(permission);
  }

  // Signals
  readonly isLoading = signal(true);
  readonly permissions = signal<Permission[]>([]);
  readonly permissionCategories = signal<PermissionCategory[]>([]);
  readonly totalCount = signal(0);
  readonly pageSize = signal(25);
  readonly currentPage = signal(0);
  readonly viewMode = signal<'table' | 'category'>('table');
  readonly availableCategories = signal<string[]>([]);
  readonly availableResources = signal<string[]>([]);
  readonly availableActions = signal<string[]>([]);

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
      id: 'permissions',
      title: 'Permission Management',
      icon: 'verified_user',
      type: 'basic',
    },
  ];

  // Filters
  filters: PermissionFilters = {
    search: '',
    category: null,
    resource: null,
    action: null,
    isActive: null,
    isSystemPermission: null,
  };

  // Computed
  readonly filteredPermissions = computed(() => {
    let filtered = this.permissions();

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (permission) =>
          getPermissionName(permission).toLowerCase().includes(search) ||
          permission.description.toLowerCase().includes(search) ||
          permission.resource.toLowerCase().includes(search) ||
          permission.action.toLowerCase().includes(search),
      );
    }

    if (this.filters.category) {
      filtered = filtered.filter(
        (permission) => permission.category === this.filters.category,
      );
    }

    if (this.filters.resource) {
      filtered = filtered.filter(
        (permission) => permission.resource === this.filters.resource,
      );
    }

    if (this.filters.action) {
      filtered = filtered.filter(
        (permission) => permission.action === this.filters.action,
      );
    }

    if (this.filters.isActive !== null) {
      filtered = filtered.filter(
        (permission) => permission.is_active === this.filters.isActive,
      );
    }

    if (this.filters.isSystemPermission !== null) {
      filtered = filtered.filter(
        (permission) =>
          permission.is_system_permission === this.filters.isSystemPermission,
      );
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadPermissions();
    this.loadFilterOptions();

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

  private async loadPermissions(): Promise<void> {
    try {
      this.isLoading.set(true);

      const response = await this.rbacService
        .getPermissions({
          page: this.currentPage() + 1,
          limit: this.pageSize(),
          include_role_count: true,
        })
        .toPromise();

      if (response) {
        this.permissions.set(response.data);
        this.totalCount.set(response.pagination.total);
        this.updateDataSource();
        this.updateCategoryView();
      }
    } catch (error) {
      this.snackBar.open('Failed to load permissions', 'Close', {
        duration: 3000,
      });
      console.error('Failed to load permissions:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [categories, resources, actions] = await Promise.all([
        this.rbacService.getPermissionCategories().toPromise(),
        this.rbacService.getResourceList().toPromise(),
        this.rbacService.getActionList().toPromise(),
      ]);

      if (categories) this.availableCategories.set(categories);
      if (resources) this.availableResources.set(resources);
      if (actions) this.availableActions.set(actions);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  }

  private updateDataSource(): void {
    this.dataSource.data = this.filteredPermissions();
  }

  private updateCategoryView(): void {
    const filtered = this.filteredPermissions();
    const grouped = filtered.reduce(
      (acc, permission) => {
        const category = permission.category;
        if (!acc[category]) {
          acc[category] = {
            name: category,
            permissions: [],
            count: 0,
            isExpanded: true,
          };
        }
        acc[category].permissions.push(permission);
        acc[category].count++;
        return acc;
      },
      {} as Record<string, PermissionCategory>,
    );

    this.permissionCategories.set(Object.values(grouped));
  }

  // Filter methods
  onFilterChange(): void {
    this.updateDataSource();
    this.updateCategoryView();
    this.selection.clear();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.category ||
      this.filters.resource ||
      this.filters.action ||
      this.filters.isActive !== null ||
      this.filters.isSystemPermission !== null
    );
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      category: null,
      resource: null,
      action: null,
      isActive: null,
      isSystemPermission: null,
    };
    this.onFilterChange();
  }

  toggleViewMode(): void {
    this.viewMode.update((mode) => (mode === 'table' ? 'category' : 'table'));
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
    this.loadPermissions();
  }

  // Permission actions
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '700px',
      data: {
        mode: 'create',
        availableCategories: this.availableCategories(),
        availableResources: this.availableResources(),
        availableActions: this.availableActions(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshPermissions();
        this.snackBar.open('Permission created successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  editPermission(permission: Permission): void {
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '700px',
      data: {
        mode: 'edit',
        permission: permission,
        availableCategories: this.availableCategories(),
        availableResources: this.availableResources(),
        availableActions: this.availableActions(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshPermissions();
        this.snackBar.open('Permission updated successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  duplicatePermission(permission: Permission): void {
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '700px',
      data: {
        mode: 'create',
        permission: {
          ...permission,
          id: '',
          name: `${getPermissionName(permission)} (Copy)`,
          is_system_permission: false,
          role_count: 0,
          created_at: '',
          updated_at: '',
        },
        availableCategories: this.availableCategories(),
        availableResources: this.availableResources(),
        availableActions: this.availableActions(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshPermissions();
        this.snackBar.open('Permission duplicated successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  async deletePermission(permission: Permission): Promise<void> {
    if (!this.canDeletePermission(permission)) {
      this.snackBar.open('Cannot delete this permission', 'Close', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Permission',
        message: `Are you sure you want to delete the permission "${getPermissionName(permission)}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warn',
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      try {
        await this.rbacService.deletePermission(permission.id).toPromise();
        this.refreshPermissions();
        this.snackBar.open('Permission deleted successfully', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Failed to delete permission', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  async togglePermissionStatus(permission: Permission): Promise<void> {
    try {
      await this.rbacService
        .updatePermission(permission.id, {
          is_active: !permission.is_active,
        })
        .toPromise();

      this.refreshPermissions();
      this.snackBar.open(
        `Permission ${permission.is_active ? 'deactivated' : 'activated'} successfully`,
        'Close',
        { duration: 3000 },
      );
    } catch (error) {
      this.snackBar.open('Failed to update permission status', 'Close', {
        duration: 3000,
      });
    }
  }

  viewPermissionDetails(permission: Permission): void {
    // TODO: Navigate to permission details page or open details modal
    console.log('View permission details:', permission);
  }

  viewRoles(permission: Permission): void {
    // TODO: Navigate to roles using this permission
    console.log('View roles for permission:', permission);
  }

  // Bulk actions
  async bulkActivate(): Promise<void> {
    const permissionIds = this.selection.selected.map(
      (permission) => permission.id,
    );

    try {
      await this.rbacService
        .bulkUpdatePermissions({
          permission_ids: permissionIds,
          updates: { is_active: true },
        })
        .toPromise();

      this.refreshPermissions();
      this.selection.clear();
      this.snackBar.open('Permissions activated successfully', 'Close', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Failed to activate permissions', 'Close', {
        duration: 3000,
      });
    }
  }

  async bulkDeactivate(): Promise<void> {
    const permissionIds = this.selection.selected.map(
      (permission) => permission.id,
    );

    try {
      await this.rbacService
        .bulkUpdatePermissions({
          permission_ids: permissionIds,
          updates: { is_active: false },
        })
        .toPromise();

      this.refreshPermissions();
      this.selection.clear();
      this.snackBar.open('Permissions deactivated successfully', 'Close', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Failed to deactivate permissions', 'Close', {
        duration: 3000,
      });
    }
  }

  async bulkDelete(): Promise<void> {
    const deletablePermissions = this.selection.selected.filter((permission) =>
      this.canDeletePermission(permission),
    );

    if (deletablePermissions.length === 0) {
      this.snackBar.open('No permissions can be deleted', 'Close', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Permissions',
        message: `Are you sure you want to delete ${deletablePermissions.length} permission(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warn',
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      try {
        // Delete permissions one by one (API might not support bulk delete)
        for (const permission of deletablePermissions) {
          await this.rbacService.deletePermission(permission.id).toPromise();
        }

        this.refreshPermissions();
        this.selection.clear();
        this.snackBar.open(
          `${deletablePermissions.length} permission(s) deleted successfully`,
          'Close',
          { duration: 3000 },
        );
      } catch (error) {
        this.snackBar.open('Failed to delete some permissions', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  // Utility methods
  refreshPermissions(): void {
    this.loadPermissions();
    this.loadFilterOptions();
  }

  canDeletePermission(permission: Permission): boolean {
    return this.rbacService.isPermissionDeletable(permission);
  }

  canBulkDelete(): boolean {
    return this.selection.selected.some((permission) =>
      this.canDeletePermission(permission),
    );
  }

  trackByCategory(index: number, item: PermissionCategory): string {
    return item.name;
  }

  trackByPermission(index: number, item: Permission): string {
    return item.id;
  }
}
