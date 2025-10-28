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
import { BreadcrumbComponent, AegisxNavigationItem } from '@aegisx/ui';
import { ConfirmDialogComponent } from '../../../../shared/ui/components/confirm-dialog.component';
import {
  NavigationItem,
  NavigationItemsService,
} from '../../services/navigation-items.service';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { NavigationItemDialogComponent } from '../../dialogs/navigation-item-dialog/navigation-item-dialog.component';

interface NavigationFilters {
  search: string;
  type: string | null;
  disabled: boolean | null;
  hidden: boolean | null;
}

@Component({
  selector: 'app-navigation-management',
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
    HasPermissionDirective,
  ],
  template: `
    <div class="navigation-management p-6 space-y-6">
      <!-- Breadcrumb -->
      <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>

      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Navigation Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage application navigation items and menu structure
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            *hasPermission="'navigation:create'"
            mat-raised-button
            color="primary"
            (click)="openCreateDialog()"
            [disabled]="isLoading()"
          >
            <mat-icon>add</mat-icon>
            Create Navigation Item
          </button>
          <button
            mat-raised-button
            (click)="refreshNavigationItems()"
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
              <mat-label>Search navigation items</mat-label>
              <input
                matInput
                [(ngModel)]="filters.search"
                (ngModelChange)="onFilterChange()"
                placeholder="Search by key or title"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Type</mat-label>
              <mat-select
                [(ngModel)]="filters.type"
                (ngModelChange)="onFilterChange()"
              >
                <mat-option [value]="null">All Types</mat-option>
                <mat-option value="item">Item</mat-option>
                <mat-option value="group">Group</mat-option>
                <mat-option value="collapsible">Collapsible</mat-option>
                <mat-option value="divider">Divider</mat-option>
                <mat-option value="spacer">Spacer</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Status</mat-label>
              <mat-select
                [(ngModel)]="filters.disabled"
                (ngModelChange)="onFilterChange()"
              >
                <mat-option [value]="null">All Statuses</mat-option>
                <mat-option [value]="false">Enabled</mat-option>
                <mat-option [value]="true">Disabled</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Visibility</mat-label>
              <mat-select
                [(ngModel)]="filters.hidden"
                (ngModelChange)="onFilterChange()"
              >
                <mat-option [value]="null">All</mat-option>
                <mat-option [value]="false">Visible</mat-option>
                <mat-option [value]="true">Hidden</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Bulk Actions -->
          <div
            *ngIf="selection.hasValue()"
            class="flex items-center gap-2 mt-4 pt-4 border-t"
          >
            <span class="text-sm text-gray-600">
              {{ selection.selected.length }} item(s) selected
            </span>
            <button
              *hasPermission="'navigation:update'"
              mat-stroked-button
              color="primary"
              (click)="bulkEnable()"
            >
              <mat-icon>check_circle</mat-icon>
              Enable
            </button>
            <button
              *hasPermission="'navigation:update'"
              mat-stroked-button
              color="warn"
              (click)="bulkDisable()"
            >
              <mat-icon>block</mat-icon>
              Disable
            </button>
            <button
              *hasPermission="'navigation:delete'"
              mat-stroked-button
              color="warn"
              (click)="bulkDelete()"
            >
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Navigation Table -->
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

            <!-- Key Column -->
            <ng-container matColumnDef="key">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Key</th>
              <td mat-cell *matCellDef="let item" class="font-medium">
                {{ item.key }}
              </td>
            </ng-container>

            <!-- Title Column -->
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
              <td mat-cell *matCellDef="let item">
                <div class="flex items-center gap-2">
                  <mat-icon *ngIf="item.icon" class="text-base">{{
                    item.icon
                  }}</mat-icon>
                  <span>{{ item.title }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let item">
                <mat-chip-set>
                  <mat-chip [class]="getTypeChipClass(item.type)">
                    {{ item.type }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <!-- Link Column -->
            <ng-container matColumnDef="link">
              <th mat-header-cell *matHeaderCellDef>Link</th>
              <td mat-cell *matCellDef="let item">
                <span class="text-gray-600 dark:text-gray-400 text-sm">
                  {{ item.link || '-' }}
                </span>
              </td>
            </ng-container>

            <!-- Order Column -->
            <ng-container matColumnDef="sort_order">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Order</th>
              <td mat-cell *matCellDef="let item">
                <span class="text-sm font-medium">{{ item.sort_order }}</span>
              </td>
            </ng-container>

            <!-- Permissions Column -->
            <ng-container matColumnDef="permissions">
              <th mat-header-cell *matHeaderCellDef>Permissions</th>
              <td mat-cell *matCellDef="let item">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">{{
                    item.permissions?.length || 0
                  }}</span>
                  <button
                    mat-icon-button
                    (click)="viewPermissions(item); $event.stopPropagation()"
                    [disabled]="!item.permissions?.length"
                    matTooltip="View permissions"
                  >
                    <mat-icon class="text-base">visibility</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let item">
                <div class="flex gap-1">
                  <mat-chip-set>
                    <mat-chip
                      [class]="
                        !item.disabled
                          ? '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200'
                          : '!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200'
                      "
                    >
                      {{ !item.disabled ? 'Enabled' : 'Disabled' }}
                    </mat-chip>
                  </mat-chip-set>
                  <mat-chip-set *ngIf="item.hidden">
                    <mat-chip
                      class="!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200"
                    >
                      Hidden
                    </mat-chip>
                  </mat-chip-set>
                </div>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="w-24">Actions</th>
              <td mat-cell *matCellDef="let item" class="w-24">
                <button
                  mat-icon-button
                  [matMenuTriggerFor]="actionMenu"
                  (click)="$event.stopPropagation()"
                >
                  <mat-icon>more_vert</mat-icon>
                </button>

                <mat-menu #actionMenu="matMenu">
                  <button mat-menu-item (click)="viewNavigationItem(item)">
                    <mat-icon>visibility</mat-icon>
                    View Details
                  </button>
                  <button
                    *hasPermission="'navigation:update'"
                    mat-menu-item
                    (click)="editNavigationItem(item)"
                  >
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <button
                    *hasPermission="'navigation:update'"
                    mat-menu-item
                    (click)="toggleItemStatus(item)"
                  >
                    <mat-icon>{{
                      !item.disabled ? 'block' : 'check_circle'
                    }}</mat-icon>
                    {{ !item.disabled ? 'Disable' : 'Enable' }}
                  </button>
                  <mat-divider></mat-divider>
                  <button
                    *hasPermission="'navigation:delete'"
                    mat-menu-item
                    (click)="deleteNavigationItem(item)"
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
              (click)="viewNavigationItem(row)"
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
          <mat-icon class="text-6xl mb-4 opacity-50">menu</mat-icon>
          <h3 class="text-lg font-medium mb-2">No navigation items found</h3>
          <p class="text-center mb-4">
            {{
              hasActiveFilters()
                ? 'Try adjusting your filters'
                : 'Create your first navigation item to get started'
            }}
          </p>
          <button
            mat-raised-button
            color="primary"
            (click)="hasActiveFilters() ? clearFilters() : openCreateDialog()"
          >
            <mat-icon>{{ hasActiveFilters() ? 'clear_all' : 'add' }}</mat-icon>
            {{
              hasActiveFilters() ? 'Clear Filters' : 'Create Navigation Item'
            }}
          </button>
        </div>

        <!-- Pagination -->
        <mat-paginator
          *ngIf="!isLoading() && dataSource.data.length > 0"
          [pageSize]="25"
          [pageSizeOptions]="[10, 25, 50, 100]"
          [showFirstLastButtons]="true"
        >
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .navigation-management {
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
export class NavigationManagementComponent implements OnInit {
  private readonly navigationService = inject(NavigationItemsService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'key',
    'title',
    'type',
    'link',
    'sort_order',
    'permissions',
    'status',
    'actions',
  ];

  dataSource = new MatTableDataSource<NavigationItem>([]);
  selection = new SelectionModel<NavigationItem>(true, []);

  // Signals
  readonly isLoading = signal(true);
  readonly navigationItems = signal<NavigationItem[]>([]);

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
      id: 'navigation',
      title: 'Navigation Management',
      icon: 'menu',
      type: 'basic',
    },
  ];

  // Filters
  filters: NavigationFilters = {
    search: '',
    type: null,
    disabled: null,
    hidden: null,
  };

  // Computed
  readonly filteredNavigationItems = computed(() => {
    let filtered = this.navigationItems();

    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.key.toLowerCase().includes(search) ||
          item.title.toLowerCase().includes(search),
      );
    }

    if (this.filters.type) {
      filtered = filtered.filter((item) => item.type === this.filters.type);
    }

    if (this.filters.disabled !== null) {
      filtered = filtered.filter(
        (item) => item.disabled === this.filters.disabled,
      );
    }

    if (this.filters.hidden !== null) {
      filtered = filtered.filter((item) => item.hidden === this.filters.hidden);
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadNavigationItems();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private async loadNavigationItems(): Promise<void> {
    try {
      this.isLoading.set(true);

      const items = await this.navigationService.getAll().toPromise();

      if (items) {
        this.navigationItems.set(items);
        this.dataSource.data = items;
      }
    } catch (error) {
      this.snackBar.open('Failed to load navigation items', 'Close', {
        duration: 3000,
      });
      console.error('Failed to load navigation items:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Filter methods
  onFilterChange(): void {
    this.dataSource.data = this.filteredNavigationItems();
    this.selection.clear();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.type ||
      this.filters.disabled !== null ||
      this.filters.hidden !== null
    );
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      type: null,
      disabled: null,
      hidden: null,
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

  // Navigation actions
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(NavigationItemDialogComponent, {
      width: '900px',
      data: {
        mode: 'create',
        availableNavigationItems: this.navigationItems().filter(
          (item) => item.type === 'group' || item.type === 'collapsible',
        ),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshNavigationItems();
        this.snackBar.open('Navigation item created successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  viewNavigationItem(item: NavigationItem): void {
    this.dialog.open(NavigationItemDialogComponent, {
      width: '900px',
      data: {
        mode: 'view',
        navigationItem: item,
        availableNavigationItems: this.navigationItems().filter(
          (navItem) =>
            navItem.id !== item.id &&
            (navItem.type === 'group' || navItem.type === 'collapsible'),
        ),
      },
    });
  }

  editNavigationItem(item: NavigationItem): void {
    const dialogRef = this.dialog.open(NavigationItemDialogComponent, {
      width: '900px',
      data: {
        mode: 'edit',
        navigationItem: item,
        availableNavigationItems: this.navigationItems().filter(
          (navItem) =>
            navItem.id !== item.id &&
            (navItem.type === 'group' || navItem.type === 'collapsible'),
        ),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshNavigationItems();
        this.snackBar.open('Navigation item updated successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  async deleteNavigationItem(item: NavigationItem): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Navigation Item',
        message: `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warn',
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      try {
        await this.navigationService.delete(item.id).toPromise();
        this.refreshNavigationItems();
        this.snackBar.open('Navigation item deleted successfully', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Failed to delete navigation item', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  async toggleItemStatus(item: NavigationItem): Promise<void> {
    try {
      await this.navigationService
        .update(item.id, {
          disabled: !item.disabled,
        })
        .toPromise();

      this.refreshNavigationItems();
      this.snackBar.open(
        `Navigation item ${item.disabled ? 'enabled' : 'disabled'} successfully`,
        'Close',
        { duration: 3000 },
      );
    } catch (error) {
      this.snackBar.open('Failed to update navigation item status', 'Close', {
        duration: 3000,
      });
    }
  }

  viewPermissions(item: NavigationItem): void {
    // TODO: Open permissions view modal
    console.log('View permissions for item:', item);
  }

  // Bulk actions
  async bulkEnable(): Promise<void> {
    try {
      for (const item of this.selection.selected) {
        await this.navigationService
          .update(item.id, { disabled: false })
          .toPromise();
      }

      this.refreshNavigationItems();
      this.selection.clear();
      this.snackBar.open('Navigation items enabled successfully', 'Close', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Failed to enable navigation items', 'Close', {
        duration: 3000,
      });
    }
  }

  async bulkDisable(): Promise<void> {
    try {
      for (const item of this.selection.selected) {
        await this.navigationService
          .update(item.id, { disabled: true })
          .toPromise();
      }

      this.refreshNavigationItems();
      this.selection.clear();
      this.snackBar.open('Navigation items disabled successfully', 'Close', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Failed to disable navigation items', 'Close', {
        duration: 3000,
      });
    }
  }

  async bulkDelete(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Navigation Items',
        message: `Are you sure you want to delete ${this.selection.selected.length} navigation item(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warn',
      },
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      try {
        for (const item of this.selection.selected) {
          await this.navigationService.delete(item.id).toPromise();
        }

        this.refreshNavigationItems();
        this.selection.clear();
        this.snackBar.open(
          `${this.selection.selected.length} navigation item(s) deleted successfully`,
          'Close',
          { duration: 3000 },
        );
      } catch (error) {
        this.snackBar.open('Failed to delete some navigation items', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  // Utility methods
  refreshNavigationItems(): void {
    this.loadNavigationItems();
  }

  getTypeChipClass(type: string): string {
    const classes: Record<string, string> = {
      item: '!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200',
      group:
        '!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200',
      collapsible:
        '!bg-purple-100 !text-purple-800 dark:!bg-purple-900 dark:!text-purple-200',
      divider:
        '!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200',
      spacer:
        '!bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200',
    };
    return classes[type] || classes['item'];
  }
}
