import { BreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';
import { SelectionModel } from '@angular/cdk/collections';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
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
import { ConfirmDialogComponent } from '../../../../shared/ui/components/confirm-dialog.component';
import { NavigationItemDialogComponent } from '../../dialogs/navigation-item-dialog/navigation-item-dialog.component';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import {
  getPermissionName,
  Permission,
  Role,
} from '../../models/rbac.interfaces';
import {
  NavigationItem,
  NavigationItemsService,
} from '../../services/navigation-items.service';
import { RbacService } from '../../services/rbac.service';

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
    DragDropModule,
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
          <h1 class="heading-title">Navigation Management</h1>
          <p class="subtitle-text">
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
            <mat-form-field
              subscriptSizing="dynamic"
              appearance="outline"
              class="w-full"
            >
              <mat-label>Search navigation items</mat-label>
              <input
                matInput
                [ngModel]="filters().search"
                (ngModelChange)="updateSearchFilter($event)"
                placeholder="Search by key or title"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field
              subscriptSizing="dynamic"
              appearance="outline"
              class="w-full"
            >
              <mat-label>Type</mat-label>
              <mat-select
                [ngModel]="filters().type"
                (ngModelChange)="updateTypeFilter($event)"
              >
                <mat-option [value]="null">All Types</mat-option>
                <mat-option value="item">Item</mat-option>
                <mat-option value="group">Group</mat-option>
                <mat-option value="collapsible">Collapsible</mat-option>
                <mat-option value="divider">Divider</mat-option>
                <mat-option value="spacer">Spacer</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field
              subscriptSizing="dynamic"
              appearance="outline"
              class="w-full"
            >
              <mat-label>Status</mat-label>
              <mat-select
                [ngModel]="filters().disabled"
                (ngModelChange)="updateDisabledFilter($event)"
              >
                <mat-option [value]="null">All Statuses</mat-option>
                <mat-option [value]="false">Enabled</mat-option>
                <mat-option [value]="true">Disabled</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field
              subscriptSizing="dynamic"
              appearance="outline"
              class="w-full"
            >
              <mat-label>Visibility</mat-label>
              <mat-select
                [ngModel]="filters().hidden"
                (ngModelChange)="updateHiddenFilter($event)"
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
            class="flex items-center gap-2 mt-4 pt-4 bulk-actions-container"
          >
            <span class="bulk-actions-count">
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

      <!-- Role Preview Mode Section -->
      <mat-card *hasPermission="'navigation:read'">
        <mat-card-header class="p-6 pb-4">
          <mat-card-title class="text-lg font-semibold">
            <div class="flex items-center gap-2">
              <mat-icon class="text-brand">visibility</mat-icon>
              <span>Role Preview Mode</span>
            </div>
          </mat-card-title>
          <mat-card-subtitle class="mt-1">
            View navigation from different role perspectives
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="p-6 pt-0">
          <!-- Role Selection Toggle Buttons -->
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Role:
            </span>

            <div class="flex flex-wrap gap-2">
              @for (role of availableRoles(); track role.id) {
                <button
                  mat-raised-button
                  [color]="
                    selectedRole()?.id === role.id ? 'primary' : undefined
                  "
                  [disabled]="isLoading()"
                  (click)="previewAsRole(role)"
                  class="transition-all"
                >
                  <mat-icon class="!text-base mr-1">
                    {{
                      selectedRole()?.id === role.id ? 'check_circle' : 'person'
                    }}
                  </mat-icon>
                  {{ role.name }}
                  @if (selectedRole()?.id === role.id) {
                    <span class="ml-2 text-xs opacity-80">
                      ({{ menuCount().visible }}/{{ menuCount().total }} items)
                    </span>
                  }
                </button>
              }

              @if (previewMode()) {
                <button
                  mat-stroked-button
                  color="warn"
                  (click)="exitPreviewMode()"
                  class="ml-2"
                >
                  <mat-icon>close</mat-icon>
                  Exit Preview
                </button>
              }
            </div>
          </div>

          <!-- Preview Mode Information -->
          @if (selectedRole()) {
            <div class="mt-4 p-4 info-banner rounded-lg">
              <div class="flex items-start gap-3">
                <mat-icon class="info-banner-icon mt-0.5">info</mat-icon>
                <div class="flex-1">
                  <p class="text-sm font-medium info-banner-title mb-2">
                    Previewing as: {{ selectedRole()!.name }}
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span class="info-banner-label font-medium"
                        >Visible Items:</span
                      >
                      <span class="ml-2 info-banner-value">
                        {{ menuCount().visible }} of {{ menuCount().total }}
                      </span>
                    </div>
                    <div>
                      <span class="info-banner-label font-medium"
                        >Permissions:</span
                      >
                      <span class="ml-2 info-banner-value">
                        {{ rolePermissions().length }} total
                      </span>
                    </div>
                    <div>
                      <span class="info-banner-label font-medium"
                        >Hidden Items:</span
                      >
                      <span class="ml-2 info-banner-value">
                        {{ menuCount().total - menuCount().visible }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Navigation Table -->
      <mat-card>
        <!-- Drag Info Banner -->
        <div *ngIf="!isDragEnabled()" class="warning-banner">
          <mat-icon class="warning-banner-icon mt-0.5">info</mat-icon>
          <div class="flex-1">
            <p class="text-sm warning-banner-title font-medium mb-1">
              Drag-and-drop is disabled
            </p>
            <p class="text-sm warning-banner-text">
              Clear all filters to enable drag-and-drop reordering. Items can
              only be reordered when viewing the complete list.
            </p>
          </div>
        </div>

        <!-- Preview Mode Banner -->
        <div *ngIf="previewMode() && selectedRole()" class="info-banner">
          <mat-icon class="info-banner-icon mt-0.5">visibility</mat-icon>
          <div class="flex-1">
            <p class="text-sm info-banner-title font-medium mb-1">
              Role Preview Mode Active - {{ selectedRole()!.name }}
            </p>
            <p class="text-sm info-banner-text mb-2">
              Showing {{ menuCount().visible }} of
              {{ menuCount().total }} navigation items visible to this role.
              Items are filtered based on role permissions.
            </p>
            <div class="flex flex-wrap gap-2 text-xs">
              <mat-chip class="chip-info"> Read-only mode </mat-chip>
              <mat-chip class="chip-info">
                {{ rolePermissions().length }} permissions
              </mat-chip>
              <mat-chip class="chip-info">
                {{ menuCount().total - menuCount().visible }} items hidden
              </mat-chip>
            </div>
          </div>
          <button
            mat-icon-button
            (click)="exitPreviewMode()"
            matTooltip="Exit preview mode"
            class="info-banner-icon"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table
            mat-table
            [dataSource]="dataSource"
            matSort
            class="w-full"
            cdkDropList
            [cdkDropListDisabled]="!isDragEnabled()"
            (cdkDropListDropped)="onRowDrop($event)"
          >
            <!-- Drag Handle Column -->
            <ng-container matColumnDef="dragHandle">
              <th mat-header-cell *matHeaderCellDef class="w-12">
                <mat-icon
                  class="text-gray-400"
                  [matTooltip]="
                    isDragEnabled()
                      ? 'Drag to reorder'
                      : 'Clear filters to enable drag'
                  "
                  >reorder</mat-icon
                >
              </th>
              <td mat-cell *matCellDef="let row" class="w-12">
                <mat-icon
                  cdkDragHandle
                  class="cursor-move text-gray-600 hover:text-primary-600 transition-colors"
                  [class.opacity-30]="!isDragEnabled()"
                  [class.cursor-not-allowed]="!isDragEnabled()"
                  [matTooltip]="
                    isDragEnabled()
                      ? 'Drag to reorder'
                      : 'Clear filters to enable drag'
                  "
                  >drag_indicator</mat-icon
                >
              </td>
            </ng-container>
            <!-- Title Column with Enhanced Hierarchy Display -->
            <ng-container matColumnDef="title">
              <th
                mat-header-cell
                *matHeaderCellDef
                mat-sort-header
                class="title-header"
              >
                Title
              </th>
              <td
                mat-cell
                *matCellDef="let item"
                [class]="'hierarchy-level-' + getIndentLevel(item)"
                class="title-cell"
              >
                <div
                  class="flex items-center gap-2 hierarchy-content"
                  [style.padding-left.rem]="getIndentLevel(item) * 2"
                >
                  <!-- Hierarchy Indicator -->
                  <span
                    *ngIf="getIndentLevel(item) > 0"
                    class="hierarchy-arrow text-lg font-bold text-primary-500 dark:text-primary-400"
                  >
                    ↳
                  </span>
                  <!-- Item Icon -->
                  <mat-icon
                    *ngIf="item.icon"
                    class="text-base text-gray-600 dark:text-gray-300"
                  >
                    {{ item.icon }}
                  </mat-icon>
                  <!-- Item Title -->
                  <span class="font-medium">{{ item.title }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Parent Column -->
            <ng-container matColumnDef="parent">
              <th mat-header-cell *matHeaderCellDef>Parent</th>
              <td mat-cell *matCellDef="let item">
                <span class="secondary-text">
                  {{ getParentName(item) }}
                </span>
              </td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let item">
                <mat-chip-set>
                  <mat-chip
                    [class]="
                      item.type === 'item'
                        ? 'chip-info'
                        : item.type === 'group'
                          ? 'chip-success'
                          : item.type === 'collapsible'
                            ? 'chip-info'
                            : 'chip-neutral'
                    "
                  >
                    {{ item.type }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <!-- Link Column -->
            <ng-container matColumnDef="link">
              <th mat-header-cell *matHeaderCellDef>Link</th>
              <td mat-cell *matCellDef="let item">
                <span class="secondary-text">
                  {{ item.link || '-' }}
                </span>
              </td>
            </ng-container>
            <!-- Permissions Column -->
            <ng-container matColumnDef="permissions">
              <th mat-header-cell *matHeaderCellDef>Permissions</th>
              <td mat-cell *matCellDef="let item" class="permissions-cell">
                <div class="flex items-center gap-2">
                  <mat-icon
                    class="text-base"
                    [class.text-primary-600]="item.permissions?.length"
                    [class.text-gray-400]="!item.permissions?.length"
                    [matTooltip]="
                      item.permissions?.length
                        ? item.permissions.join(', ')
                        : 'No permissions'
                    "
                    matTooltipClass="permissions-tooltip"
                  >
                    {{ item.permissions?.length ? 'shield' : 'shield_off' }}
                  </mat-icon>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ item.permissions?.length || 0 }}
                  </span>
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
                      [class]="!item.disabled ? 'chip-success' : 'chip-error'"
                    >
                      {{ !item.disabled ? 'Enabled' : 'Disabled' }}
                    </mat-chip>
                  </mat-chip-set>
                  <mat-chip-set *ngIf="item.hidden">
                    <mat-chip class="chip-neutral"> Hidden </mat-chip>
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

                  <!-- Hide edit actions when in preview mode -->
                  @if (!previewMode()) {
                    <button
                      *hasPermission="'navigation:update'"
                      mat-menu-item
                      (click)="editNavigationItem(item)"
                    >
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button
                      *hasPermission="'navigation:create'"
                      mat-menu-item
                      (click)="duplicateNavigationItem(item)"
                    >
                      <mat-icon>content_copy</mat-icon>
                      Duplicate
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
                      class="delete-action"
                    >
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  }

                  <!-- Show read-only message in preview mode -->
                  @if (previewMode()) {
                    <mat-divider></mat-divider>
                    <div class="px-4 py-2 text-xs secondary-text">
                      <mat-icon class="text-sm align-middle mr-1"
                        >info</mat-icon
                      >
                      Read-only mode active
                    </div>
                  }
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr
              mat-row
              cdkDrag
              [cdkDragDisabled]="!isDragEnabled()"
              *matRowDef="let row; columns: displayedColumns"
              (click)="viewNavigationItem(row)"
              class="cursor-pointer table-row-hover transition-transform"
              [class.cdk-drag-disabled]="!isDragEnabled()"
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
          class="empty-state"
        >
          <mat-icon class="empty-state-icon">menu</mat-icon>
          <h3 class="empty-state-title">No navigation items found</h3>
          <p class="empty-state-message">
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
      /* Layout */
      .navigation-management {
        min-height: 100vh;
      }

      /* Card styling with Material tokens */
      mat-card {
        background: var(--mat-sys-surface-container);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: var(--ax-radius-lg);
        box-shadow: var(--mat-sys-level1);
      }

      /* Typography */
      .heading-title {
        color: var(--mat-sys-on-surface);
        font-size: var(--ax-text-3xl);
        font-weight: var(--ax-font-bold);
        line-height: var(--ax-leading-tight);
      }

      .subtitle-text {
        color: var(--mat-sys-on-surface-variant);
        font-size: var(--ax-text-base);
        line-height: var(--ax-leading-normal);
        margin-top: var(--ax-spacing-xs);
      }

      .secondary-text {
        color: var(--mat-sys-on-surface-variant);
        font-size: var(--ax-text-sm);
      }

      /* Bulk Actions */
      .bulk-actions-container {
        border-top: 1px solid var(--mat-sys-outline-variant);
      }

      .bulk-actions-count {
        color: var(--mat-sys-on-surface-variant);
        font-size: var(--ax-text-sm);
      }

      /* Banners */
      .info-banner {
        background: var(--ax-info-faint);
        border-left: 4px solid var(--ax-info-emphasis);
        padding: var(--ax-spacing-md);
        margin-bottom: var(--ax-spacing-md);
        display: flex;
        align-items: flex-start;
        gap: var(--ax-spacing-sm);
      }

      .info-banner-icon {
        color: var(--ax-info-emphasis);
      }

      .info-banner-title {
        color: var(--ax-info-emphasis);
      }

      .info-banner-text {
        color: var(--ax-info-default);
      }

      .info-banner-label {
        color: var(--ax-info-default);
        font-weight: var(--ax-font-medium);
      }

      .info-banner-value {
        margin-left: var(--ax-spacing-sm);
        color: var(--ax-info-emphasis);
      }

      .warning-banner {
        background: var(--ax-warning-faint);
        border-left: 4px solid var(--ax-warning-emphasis);
        padding: var(--ax-spacing-md);
        margin-bottom: var(--ax-spacing-md);
        display: flex;
        align-items: flex-start;
        gap: var(--ax-spacing-sm);
      }

      .warning-banner-icon {
        color: var(--ax-warning-emphasis);
      }

      .warning-banner-title {
        color: var(--ax-warning-emphasis);
      }

      .warning-banner-text {
        color: var(--ax-warning-default);
      }

      /* Table styling */
      .mat-mdc-table {
        background: transparent;
      }

      .mat-mdc-header-cell {
        color: var(--mat-sys-on-surface);
        font-weight: var(--ax-font-semibold);
        font-size: var(--ax-text-sm);
      }

      .table-row-hover:hover {
        background: var(--mat-sys-surface-variant);
      }

      /* Chips */
      .mat-mdc-chip {
        min-height: 24px;
        font-size: var(--ax-text-xs);
        font-weight: var(--ax-font-medium);
      }

      .chip-info {
        background: var(--ax-info-faint);
        color: var(--ax-info-emphasis);
      }

      .chip-neutral {
        background: var(--mat-sys-surface-variant);
        color: var(--mat-sys-on-surface);
      }

      .chip-success {
        background: var(--ax-success-faint);
        color: var(--ax-success-emphasis);
      }

      .chip-error {
        background: var(--ax-error-faint);
        color: var(--ax-error-emphasis);
      }

      /* Delete action */
      .delete-action {
        color: var(--ax-error-default);
      }

      .delete-action mat-icon {
        color: var(--ax-error-default);
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--ax-spacing-2xl) var(--ax-spacing-lg);
        color: var(--mat-sys-on-surface-variant);
      }

      .empty-state-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        opacity: 0.5;
        margin-bottom: var(--ax-spacing-lg);
      }

      .empty-state-title {
        color: var(--mat-sys-on-surface);
        font-size: var(--ax-text-lg);
        font-weight: var(--ax-font-medium);
        margin-bottom: var(--ax-spacing-sm);
      }

      .empty-state-message {
        text-align: center;
        margin-bottom: var(--ax-spacing-lg);
        font-size: var(--ax-text-base);
      }

      /* Drag-drop styles */
      .cdk-drag-preview {
        box-shadow: var(--mat-sys-level3);
        opacity: 0.9;
        background: var(--mat-sys-surface-container);
        border: 1px solid var(--mat-sys-outline-variant);
      }

      .cdk-drag-placeholder {
        opacity: 0.5;
        background: var(--mat-sys-surface-variant) !important;
      }

      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .cdk-drop-list-dragging .cdk-drag {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .cdk-drag-disabled {
        cursor: default !important;
        opacity: 0.6;
      }

      .cdk-drag-disabled .cursor-move {
        cursor: not-allowed !important;
      }

      /* Hierarchy visual styles */
      .title-header {
        font-weight: var(--ax-font-bold);
        font-size: var(--ax-text-base);
      }

      .title-cell {
        font-size: var(--ax-text-sm);
      }

      .hierarchy-content {
        position: relative;
        transition: all 0.2s ease;
      }

      .hierarchy-arrow {
        transition: transform 0.2s ease;
        user-select: none;
        color: var(--mat-sys-primary);
      }

      /* Hierarchy level indicators with design tokens */
      .hierarchy-level-0 {
        background: color-mix(in srgb, var(--mat-sys-primary) 2%, transparent);
      }

      .hierarchy-level-1 {
        background: color-mix(in srgb, var(--mat-sys-primary) 4%, transparent);
        border-left: 3px solid
          color-mix(in srgb, var(--mat-sys-primary) 30%, transparent);
      }

      .hierarchy-level-2 {
        background: color-mix(in srgb, var(--mat-sys-primary) 6%, transparent);
        border-left: 3px solid
          color-mix(in srgb, var(--mat-sys-primary) 50%, transparent);
      }

      .hierarchy-level-3 {
        background: color-mix(in srgb, var(--mat-sys-primary) 8%, transparent);
        border-left: 3px solid
          color-mix(in srgb, var(--mat-sys-primary) 70%, transparent);
      }

      .hierarchy-level-4,
      .hierarchy-level-5,
      .hierarchy-level-6,
      .hierarchy-level-7,
      .hierarchy-level-8,
      .hierarchy-level-9,
      .hierarchy-level-10 {
        background: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
        border-left: 3px solid
          color-mix(in srgb, var(--mat-sys-primary) 90%, transparent);
      }

      /* Permissions cell styles */
      .permissions-cell .mat-icon {
        cursor: help;
        transition: all 0.2s ease;
      }

      .permissions-cell .mat-icon:hover {
        transform: scale(1.15);
      }
    `,
  ],
})
export class NavigationManagementComponent implements OnInit {
  private readonly navigationService = inject(NavigationItemsService);
  private readonly rbacService = inject(RbacService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'dragHandle',
    'title',
    'parent',
    'type',
    'link',
    'permissions',
    'status',
    'actions',
  ];

  dataSource = new MatTableDataSource<NavigationItem>([]);
  selection = new SelectionModel<NavigationItem>(true, []);

  // Signals
  readonly isLoading = signal(true);
  readonly navigationItems = signal<NavigationItem[]>([]);
  readonly isDragEnabled = signal(true); // Drag enabled by default, disabled when filters active
  readonly filters = signal<NavigationFilters>({
    search: '',
    type: null,
    disabled: null,
    hidden: null,
  });

  // Role Preview Mode Signals
  readonly previewMode = signal(false);
  readonly selectedRole = signal<Role | null>(null);
  readonly availableRoles = signal<Role[]>([]);
  readonly rolePermissions = signal<Permission[]>([]);

  // Breadcrumb items
  breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      url: '/',
    },
    {
      label: 'Management',
      icon: 'settings',
    },
    {
      label: 'RBAC Management',
      icon: 'security',
      url: '/rbac',
    },
    {
      label: 'Navigation Management',
      icon: 'menu',
    },
  ];

  // Computed
  readonly filteredNavigationItems = computed(() => {
    let filtered = this.navigationItems();
    const currentFilters = this.filters();

    if (currentFilters.search) {
      const search = currentFilters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.key.toLowerCase().includes(search) ||
          item.title.toLowerCase().includes(search),
      );
    }

    if (currentFilters.type) {
      filtered = filtered.filter((item) => item.type === currentFilters.type);
    }

    if (currentFilters.disabled !== null) {
      filtered = filtered.filter(
        (item) => item.disabled === currentFilters.disabled,
      );
    }

    if (currentFilters.hidden !== null) {
      filtered = filtered.filter(
        (item) => item.hidden === currentFilters.hidden,
      );
    }

    return filtered;
  });

  // Role Preview Computed Values
  readonly visibleItemsForRole = computed(() => {
    const items = this.filteredNavigationItems();
    const inPreviewMode = this.previewMode();
    const permissions = this.rolePermissions();

    // If not in preview mode, show all items
    if (!inPreviewMode) {
      return items;
    }

    // In preview mode, filter based on role permissions
    // Navigation items without permissions are visible to all roles
    // Items with permissions are visible only if role has at least one matching permission
    const rolePermissionStrings = permissions.map((p) => getPermissionName(p));

    // Also create a version with dots for backward compatibility
    const rolePermissionsWithDots = rolePermissionStrings.map((p) =>
      p.replace(':', '.'),
    );

    const filtered = items.filter((item) => {
      // Items without permissions are visible to all
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      // Check if role has any of the item's permissions
      // Support both formats: "resource:action" and "resource.action"
      // item.permissions is string[] like ['users.create', 'users.read']
      const hasMatch = item.permissions.some((itemPermString) => {
        // Try exact match first (colon format)
        const exactMatch = rolePermissionStrings.includes(itemPermString);

        // Try dot format
        const dotMatch = rolePermissionsWithDots.includes(itemPermString);

        // Try converting item permission from dot to colon
        const itemPermColonFormat = itemPermString.replace('.', ':');
        const colonMatch = rolePermissionStrings.includes(itemPermColonFormat);

        return exactMatch || dotMatch || colonMatch;
      });

      return hasMatch;
    });

    return filtered;
  });

  readonly menuCount = computed(() => {
    const visible = this.visibleItemsForRole().length;
    const total = this.filteredNavigationItems().length;
    return { visible, total };
  });

  constructor() {
    // Effect to disable drag when filters are active
    effect(() => {
      const currentFilters = this.filters();
      const hasActiveFilters =
        currentFilters.search ||
        currentFilters.type !== null ||
        currentFilters.disabled !== null ||
        currentFilters.hidden !== null;

      this.isDragEnabled.set(!hasActiveFilters);
    });

    // Effect to update dataSource when preview mode or role permissions change
    effect(() => {
      // Trigger on preview mode, role permissions, or filtered items change
      const inPreviewMode = this.previewMode();
      const visible = this.visibleItemsForRole();
      const filtered = this.filteredNavigationItems();

      // Update dataSource based on preview mode
      this.dataSource.data = inPreviewMode ? visible : filtered;
    });

    // Effect to disable drag when in preview mode
    effect(() => {
      const inPreviewMode = this.previewMode();
      if (inPreviewMode) {
        this.isDragEnabled.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.loadNavigationItems();
    this.loadAvailableRoles();
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

        // ⚠️ CRITICAL: Re-apply current filters (including preview mode) after data refresh
        // Don't set dataSource.data directly - use onFilterChange() to respect current state
        this.onFilterChange();
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
  updateSearchFilter(value: string): void {
    this.filters.update((f) => ({ ...f, search: value }));
    this.onFilterChange();
  }

  updateTypeFilter(value: string | null): void {
    this.filters.update((f) => ({ ...f, type: value }));
    this.onFilterChange();
  }

  updateDisabledFilter(value: boolean | null): void {
    this.filters.update((f) => ({ ...f, disabled: value }));
    this.onFilterChange();
  }

  updateHiddenFilter(value: boolean | null): void {
    this.filters.update((f) => ({ ...f, hidden: value }));
    this.onFilterChange();
  }

  onFilterChange(): void {
    // Use visibleItemsForRole when in preview mode, otherwise use filteredNavigationItems
    this.dataSource.data = this.previewMode()
      ? this.visibleItemsForRole()
      : this.filteredNavigationItems();
    this.selection.clear();
  }

  hasActiveFilters(): boolean {
    const currentFilters = this.filters();
    return !!(
      currentFilters.search ||
      currentFilters.type ||
      currentFilters.disabled !== null ||
      currentFilters.hidden !== null
    );
  }

  clearFilters(): void {
    this.filters.set({
      search: '',
      type: null,
      disabled: null,
      hidden: null,
    });
    this.onFilterChange();
  }

  // Hierarchy helper methods
  getParentName(item: NavigationItem): string {
    if (!item.parent_id) {
      return '-';
    }
    const parent = this.navigationItems().find((i) => i.id === item.parent_id);
    return parent ? parent.title : 'Unknown';
  }

  getIndentLevel(item: NavigationItem): number {
    let level = 0;
    let currentItem = item;
    const visited = new Set<string>([item.id]);

    while (currentItem.parent_id) {
      // Prevent infinite loops
      if (visited.has(currentItem.parent_id)) {
        console.warn('Circular parent reference detected', currentItem);
        break;
      }

      const parent = this.navigationItems().find(
        (i) => i.id === currentItem.parent_id,
      );
      if (!parent) break;

      level++;
      visited.add(parent.id);
      currentItem = parent;

      // Max depth protection
      if (level > 10) break;
    }

    return level;
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

  duplicateNavigationItem(item: NavigationItem): void {
    this.navigationService.getById(item.id).subscribe({
      next: (sourceItem: NavigationItem) => {
        // Generate unique key by appending -copy (or -copy-2, -copy-3, etc.)
        let newKey = `${sourceItem.key}-copy`;
        let copyNumber = 2;

        // Check if key already exists and increment until unique
        while (
          this.navigationItems().some((navItem) => navItem.key === newKey)
        ) {
          newKey = `${sourceItem.key}-copy-${copyNumber}`;
          copyNumber++;
        }

        // Open create dialog with pre-filled data
        const dialogRef = this.dialog.open(NavigationItemDialogComponent, {
          width: '900px',
          data: {
            mode: 'create',
            prefilledData: {
              ...sourceItem,
              key: newKey,
              title: `${sourceItem.title} (Copy)`,
              // Don't copy the id, created_at, updated_at
              id: undefined,
              created_at: undefined,
              updated_at: undefined,
            },
            availableNavigationItems: this.navigationItems().filter(
              (navItem) =>
                navItem.type === 'group' || navItem.type === 'collapsible',
            ),
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.refreshNavigationItems();
            this.snackBar.open(
              'Navigation item duplicated successfully',
              'Close',
              {
                duration: 3000,
              },
            );
          }
        });
      },
      error: (error: Error) => {
        console.error('Failed to duplicate navigation item:', error);
        this.snackBar.open('Failed to duplicate navigation item', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  onRowDrop(event: CdkDragDrop<NavigationItem[]>): void {
    const items = this.dataSource.data;
    const movedItem = items[event.previousIndex];

    // Move in array for immediate UI update
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.dataSource.data = [...items];

    // Update sort_order for all items based on new positions
    const updates = items.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
    }));

    // Call reorder API
    this.navigationService.reorder(updates).subscribe({
      next: () => {
        this.snackBar.open('Items reordered successfully', 'Close', {
          duration: 2000,
        });
        // Refresh to get updated data from backend
        this.refreshNavigationItems();
      },
      error: (error: Error) => {
        console.error('Failed to reorder items:', error);
        this.snackBar.open('Failed to reorder items', 'Close', {
          duration: 3000,
        });
        // Revert on error by refreshing
        this.refreshNavigationItems();
      },
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

  // Role Preview Mode Methods
  private async loadAvailableRoles(): Promise<void> {
    try {
      const response = await this.rbacService
        .getRoles({ page: 1, limit: 1000, is_active: true })
        .toPromise();
      if (response?.data) {
        this.availableRoles.set(response.data);
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
      this.snackBar.open('Failed to load roles for preview', 'Close', {
        duration: 3000,
      });
    }
  }

  async previewAsRole(role: Role): Promise<void> {
    try {
      // Load permissions for selected role
      const response = await this.rbacService
        .getRolePermissions(role.id)
        .toPromise();

      if (response?.data) {
        const permissions = response.data;

        // Set state in correct order: permissions → role → preview mode
        this.rolePermissions.set(permissions);
        this.selectedRole.set(role);
        this.previewMode.set(true);

        // ⚠️ CRITICAL: Update dataSource immediately to reflect filtered items
        this.onFilterChange();

        this.snackBar.open(`Previewing navigation as: ${role.name}`, 'Close', {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Failed to load role permissions:', error);
      this.snackBar.open('Failed to load role permissions', 'Close', {
        duration: 3000,
      });
    }
  }

  exitPreviewMode(): void {
    this.previewMode.set(false);
    this.selectedRole.set(null);
    this.rolePermissions.set([]);

    // ⚠️ CRITICAL: Restore full table view
    this.onFilterChange();

    this.snackBar.open('Exited preview mode', 'Close', {
      duration: 2000,
    });
  }
}
