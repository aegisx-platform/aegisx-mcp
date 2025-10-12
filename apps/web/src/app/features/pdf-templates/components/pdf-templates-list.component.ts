import {
  Component,
  OnInit,
  computed,
  signal,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material imports
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { PdfTemplateService } from '../services/pdf-templates.service';
import {
  PdfTemplate,
  ListPdfTemplateQuery,
} from '../types/pdf-templates.types';
import { PdfTemplateCreateDialogComponent } from './pdf-templates-create.dialog';
import {
  PdfTemplateEditDialogComponent,
  PdfTemplateEditDialogData,
} from './pdf-templates-edit.dialog';
import {
  PdfTemplateViewDialogComponent,
  PdfTemplateViewDialogData,
} from './pdf-templates-view.dialog';
import {
  PdfTemplatePreviewDialog,
  PdfTemplatePreviewDialogData,
} from './pdf-templates-preview.dialog';
import {
  PdfTemplateDuplicateDialog,
  PdfTemplateDuplicateDialogData,
} from './pdf-templates-duplicate.dialog';

@Component({
  selector: 'app-pdf-templates-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatToolbarModule,
    MatSelectModule,
    MatOptionModule,
    MatChipsModule,
    MatExpansionModule,
    MatBadgeModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  template: `
    <div class="pdf-templates-list-container">
      <!-- Header -->
      <mat-toolbar color="primary" class="page-header">
        <h1 class="page-title">Pdf Templates</h1>
        <span class="spacer"></span>
      </mat-toolbar>

      <!-- Permission Error Banner -->
      @if (pdfTemplatesService.permissionError()) {
        <mat-card class="permission-error-banner">
          <mat-card-content>
            <div class="permission-error-content">
              <div class="error-icon-section">
                <mat-icon class="error-icon">lock</mat-icon>
              </div>
              <div class="error-message-section">
                <h3 class="error-title">Access Denied</h3>
                <p class="error-message">
                  You don't have permission to access or modify Pdf Templates.
                  @if (pdfTemplatesService.lastErrorStatus() === 403) {
                    <span class="error-details">
                      Please contact your administrator to request the necessary
                      permissions.
                    </span>
                  }
                </p>
              </div>
              <div class="error-actions-section">
                <button
                  mat-raised-button
                  color="warn"
                  (click)="pdfTemplatesService.clearPermissionError()"
                  class="dismiss-btn"
                >
                  <mat-icon>close</mat-icon>
                  Dismiss
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Search & Filters Section -->
      <mat-card class="search-filters-card">
        <mat-card-content>
          <div class="search-filters-wrapper">
            <!-- Search Field -->
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <input
                matInput
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearch($event)"
                placeholder="Search by name, display name, category..."
              />
              <mat-icon matPrefix>search</mat-icon>
              @if (searchTerm) {
                <button
                  matSuffix
                  mat-icon-button
                  (click)="clearSearch()"
                  matTooltip="Clear search"
                >
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>

            <!-- Category Filter -->
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Category</mat-label>
              <mat-select
                [(ngModel)]="selectedCategory"
                (ngModelChange)="onCategoryFilterChange($event)"
              >
                <mat-option [value]="''">All Categories</mat-option>
                <mat-option value="invoice">Invoice</mat-option>
                <mat-option value="receipt">Receipt</mat-option>
                <mat-option value="report">Report</mat-option>
                <mat-option value="letter">Letter</mat-option>
                <mat-option value="certificate">Certificate</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Status Filter -->
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select
                [(ngModel)]="quickFilter"
                (ngModelChange)="setQuickFilter($event)"
              >
                <mat-option value="all">All Status</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
                <mat-option value="starters">Template Starters</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button
                mat-stroked-button
                (click)="clearAllFilters()"
                class="reset-btn"
              >
                <mat-icon>clear</mat-icon>
                <span>Reset</span>
              </button>
              <button
                mat-raised-button
                color="primary"
                (click)="openCreateDialog()"
                [disabled]="
                  pdfTemplatesService.loading() ||
                  pdfTemplatesService.permissionError()
                "
                [matTooltip]="
                  pdfTemplatesService.permissionError()
                    ? 'You do not have permission to create Pdf Templates'
                    : ''
                "
                class="add-btn"
              >
                <mat-icon>add</mat-icon>
                Add Pdf Templates
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Active Filters -->
      @if (getActiveFilterChips().length > 0) {
        <div class="active-filters">
          <span class="active-filters-label">Active Filters:</span>
          <div class="filter-chips">
            <mat-chip
              *ngFor="let chip of getActiveFilterChips()"
              (removed)="removeFilter(chip.key)"
              class="filter-chip"
              removable
            >
              <strong>{{ chip.label }}:</strong> {{ chip.value }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </div>
          <button
            mat-stroked-button
            color="warn"
            (click)="clearAllFilters()"
            class="clear-all-btn"
          >
            <mat-icon>clear_all</mat-icon>
            Clear All
          </button>
        </div>
      }

      <!-- Summary Dashboard -->
      <mat-card class="summary-dashboard-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>analytics</mat-icon>
            Template Statistics
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="summary-grid">
            <!-- Total Templates -->
            <div class="summary-item">
              <div class="summary-icon">
                <mat-icon color="primary">view_list</mat-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">
                  {{ pdfTemplatesService.totalPdfTemplate() }}
                </div>
                <div class="summary-label">Total Templates</div>
              </div>
            </div>

            <!-- Active Templates -->
            <div
              class="summary-item clickable"
              (click)="setQuickFilter('active')"
            >
              <div class="summary-icon">
                <mat-icon color="accent">check_circle</mat-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ getActiveCount() }}</div>
                <div class="summary-label">Active</div>
              </div>
            </div>

            <!-- Template Starters -->
            <div
              class="summary-item clickable"
              (click)="setQuickFilter('starters')"
            >
              <div class="summary-icon">
                <mat-icon style="color: #ff9800;">stars</mat-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">
                  {{ getTemplateStartersCount() }}
                </div>
                <div class="summary-label">Starter Templates</div>
              </div>
            </div>

            <!-- Total Usage -->
            <div class="summary-item">
              <div class="summary-icon">
                <mat-icon style="color: #9c27b0;">trending_up</mat-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ getTotalUsageCount() }}</div>
                <div class="summary-label">Total Usage</div>
              </div>
            </div>

            <!-- Templates by Category -->
            <div class="summary-item category-breakdown">
              <div class="summary-header">
                <mat-icon color="primary">category</mat-icon>
                <span class="breakdown-title">By Category</span>
              </div>
              <div class="category-list">
                @for (cat of getCategoryBreakdown(); track cat.category) {
                  <div
                    class="category-item"
                    (click)="onCategoryFilterChange(cat.category)"
                  >
                    <span class="category-name">{{ cat.label }}</span>
                    <span class="category-count">{{ cat.count }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Most Used Template -->
            <div class="summary-item most-used">
              <div class="summary-header">
                <mat-icon style="color: #4caf50;">emoji_events</mat-icon>
                <span class="breakdown-title">Most Used</span>
              </div>
              <div class="most-used-content">
                @if (getMostUsedTemplate(); as template) {
                  <div class="template-info">
                    <div class="template-name">{{ template.display_name }}</div>
                    <div class="template-usage">
                      {{ template.usage_count }} uses
                    </div>
                  </div>
                } @else {
                  <div class="no-data">No usage data</div>
                }
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      @if (pdfTemplatesService.loading()) {
        <div class="loading-container">
          <mat-progress-spinner
            mode="indeterminate"
            diameter="50"
          ></mat-progress-spinner>
          <p>Loading Pdf Templates...</p>
        </div>
      }

      <!-- Error State -->
      @if (pdfTemplatesService.error()) {
        <mat-card class="error-card">
          <mat-card-content>
            <div class="error-content">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ pdfTemplatesService.error() }}</p>
              <button mat-button color="primary" (click)="retry()">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Data Table -->
      @if (!pdfTemplatesService.loading() && !pdfTemplatesService.error()) {
        <mat-card class="table-card">
          <mat-card-content>
            <!-- Bulk Actions -->
            @if (hasSelected()) {
              <div class="bulk-actions">
                <span class="selection-info"
                  >{{ selectedItems().length }} selected</span
                >
                <div class="bulk-buttons">
                  <!-- Bulk Delete -->
                  <button
                    mat-stroked-button
                    color="warn"
                    (click)="bulkDelete()"
                    [disabled]="pdfTemplatesService.loading()"
                    matTooltip="Delete selected items"
                  >
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>

                  <!-- Bulk Status Update -->
                  <button
                    mat-stroked-button
                    [matMenuTriggerFor]="bulkStatusMenu"
                    [disabled]="pdfTemplatesService.loading()"
                    matTooltip="Update status for selected items"
                  >
                    <mat-icon>edit</mat-icon>
                    Update Status
                  </button>
                  <mat-menu #bulkStatusMenu="matMenu">
                    <button mat-menu-item (click)="bulkUpdateStatus('active')">
                      <mat-icon>check_circle</mat-icon>
                      <span>Set Active</span>
                    </button>
                    <button
                      mat-menu-item
                      (click)="bulkUpdateStatus('inactive')"
                    >
                      <mat-icon>cancel</mat-icon>
                      <span>Set Inactive</span>
                    </button>
                    <button
                      mat-menu-item
                      (click)="bulkUpdateStatus('published')"
                    >
                      <mat-icon>publish</mat-icon>
                      <span>Publish</span>
                    </button>
                    <button mat-menu-item (click)="bulkUpdateStatus('draft')">
                      <mat-icon>draft</mat-icon>
                      <span>Set Draft</span>
                    </button>
                  </mat-menu>

                  <!-- Clear Selection -->
                  <button mat-stroked-button (click)="clearSelection()">
                    <mat-icon>clear</mat-icon>
                    Clear Selection
                  </button>
                </div>
              </div>
            }

            <!-- Table -->
            <div class="table-container">
              <table
                mat-table
                [dataSource]="pdfTemplatesService.pdfTemplatesList()"
                class="pdf-templates-table"
              >
                <!-- Selection Column -->
                <ng-container matColumnDef="select">
                  <th mat-header-cell *matHeaderCellDef>
                    <mat-checkbox
                      [checked]="isAllSelected()"
                      [indeterminate]="hasSelected() && !isAllSelected()"
                      (change)="toggleSelectAll()"
                    ></mat-checkbox>
                  </th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <mat-checkbox
                      [checked]="isSelected(pdfTemplates.id)"
                      (change)="toggleSelect(pdfTemplates.id)"
                    ></mat-checkbox>
                  </td>
                </ng-container>

                <!-- name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.name || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- display_name Column -->
                <ng-container matColumnDef="display_name">
                  <th mat-header-cell *matHeaderCellDef>Display_name</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="text-cell">{{
                        pdfTemplates.display_name || '-'
                      }}</span>
                      @if (pdfTemplates.is_template_starter) {
                        <mat-icon
                          class="template-starter-icon"
                          matTooltip="Template Starter"
                          color="accent"
                        >
                          stars
                        </mat-icon>
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- category Column -->
                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.category || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- type Column -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.type || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- template_data Column -->
                <ng-container matColumnDef="template_data">
                  <th mat-header-cell *matHeaderCellDef>Template_data</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.template_data || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- sample_data Column -->
                <ng-container matColumnDef="sample_data">
                  <th mat-header-cell *matHeaderCellDef>Sample_data</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.sample_data || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- schema Column -->
                <ng-container matColumnDef="schema">
                  <th mat-header-cell *matHeaderCellDef>Schema</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.schema || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- page_size Column -->
                <ng-container matColumnDef="page_size">
                  <th mat-header-cell *matHeaderCellDef>Page_size</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.page_size || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- orientation Column -->
                <ng-container matColumnDef="orientation">
                  <th mat-header-cell *matHeaderCellDef>Orientation</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.orientation || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- styles Column -->
                <ng-container matColumnDef="styles">
                  <th mat-header-cell *matHeaderCellDef>Styles</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.styles || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- fonts Column -->
                <ng-container matColumnDef="fonts">
                  <th mat-header-cell *matHeaderCellDef>Fonts</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.fonts || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- version Column -->
                <ng-container matColumnDef="version">
                  <th mat-header-cell *matHeaderCellDef>Version</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.version || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- is_active Column -->
                <ng-container matColumnDef="is_active">
                  <th mat-header-cell *matHeaderCellDef>Is_active</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <mat-icon
                      [color]="pdfTemplates.is_active ? 'primary' : 'warn'"
                      class="status-icon"
                    >
                      {{ pdfTemplates.is_active ? 'check_circle' : 'cancel' }}
                    </mat-icon>
                  </td>
                </ng-container>

                <!-- is_default Column -->
                <ng-container matColumnDef="is_default">
                  <th mat-header-cell *matHeaderCellDef>Is_default</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <mat-icon
                      [color]="pdfTemplates.is_default ? 'primary' : 'warn'"
                      class="status-icon"
                    >
                      {{ pdfTemplates.is_default ? 'check_circle' : 'cancel' }}
                    </mat-icon>
                  </td>
                </ng-container>

                <!-- usage_count Column -->
                <ng-container matColumnDef="usage_count">
                  <th mat-header-cell *matHeaderCellDef>Usage_count</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.usage_count || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- assets Column -->
                <ng-container matColumnDef="assets">
                  <th mat-header-cell *matHeaderCellDef>Assets</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.assets || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- permissions Column -->
                <ng-container matColumnDef="permissions">
                  <th mat-header-cell *matHeaderCellDef>Permissions</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.permissions || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- created_by Column -->
                <ng-container matColumnDef="created_by">
                  <th mat-header-cell *matHeaderCellDef>Created_by</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.created_by || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- updated_by Column -->
                <ng-container matColumnDef="updated_by">
                  <th mat-header-cell *matHeaderCellDef>Updated_by</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <span class="text-cell">{{
                      pdfTemplates.updated_by || '-'
                    }}</span>
                  </td>
                </ng-container>

                <!-- Created Date Column -->
                <ng-container matColumnDef="created_at">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    {{ pdfTemplates.created_at | date: 'short' }}
                  </td>
                </ng-container>
                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let pdfTemplates">
                    <div class="action-buttons">
                      <!-- Primary Action: Preview -->
                      <button
                        mat-icon-button
                        (click)="openPreviewDialog(pdfTemplates)"
                        matTooltip="Preview PDF"
                        color="primary"
                      >
                        <mat-icon>preview</mat-icon>
                      </button>

                      <!-- More Actions Menu -->
                      <button
                        mat-icon-button
                        [matMenuTriggerFor]="actionMenu"
                        matTooltip="More Actions"
                      >
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #actionMenu="matMenu">
                        <button
                          mat-menu-item
                          (click)="openViewDialog(pdfTemplates)"
                        >
                          <mat-icon>visibility</mat-icon>
                          <span>View Details</span>
                        </button>
                        <button
                          mat-menu-item
                          (click)="openEditDialog(pdfTemplates)"
                        >
                          <mat-icon>edit</mat-icon>
                          <span>Edit</span>
                        </button>
                        <button
                          mat-menu-item
                          (click)="openDuplicateDialog(pdfTemplates)"
                        >
                          <mat-icon>content_copy</mat-icon>
                          <span>Duplicate</span>
                        </button>
                        <mat-divider></mat-divider>
                        <button
                          mat-menu-item
                          (click)="deletePdfTemplate(pdfTemplates)"
                          [disabled]="pdfTemplatesService.loading()"
                          class="delete-action"
                        >
                          <mat-icon color="warn">delete</mat-icon>
                          <span>Delete</span>
                        </button>
                      </mat-menu>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                ></tr>
              </table>
            </div>

            <!-- Empty State -->
            @if (pdfTemplatesService.pdfTemplatesList().length === 0) {
              <div class="empty-state">
                <mat-icon class="empty-icon">inbox</mat-icon>
                <h3>No Pdf Templates found</h3>
                <p>Create your first Pdf Templates to get started</p>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="openCreateDialog()"
                >
                  <mat-icon>add</mat-icon>
                  Add Pdf Templates
                </button>
              </div>
            }

            <!-- Pagination -->
            @if (pdfTemplatesService.pdfTemplatesList().length > 0) {
              <mat-paginator
                [length]="pdfTemplatesService.totalPdfTemplate()"
                [pageSize]="pdfTemplatesService.pageSize()"
                [pageSizeOptions]="[5, 10, 25, 50, 100]"
                [pageIndex]="pdfTemplatesService.currentPage() - 1"
                (page)="onPageChange($event)"
                showFirstLastButtons
              ></mat-paginator>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .pdf-templates-list-container {
        padding: 16px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 16px;
        border-radius: 4px;
      }

      .page-title {
        margin: 0;
        font-weight: 500;
      }

      .spacer {
        flex: 1 1 auto;
      }

      /* Template Starter Icon */
      .template-starter-icon {
        font-size: 20px !important;
        width: 20px !important;
        height: 20px !important;
      }

      /* Action Buttons Container */
      .action-buttons {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* Delete Action in Menu */
      .delete-action {
        color: #f44336 !important;
      }

      /* Permission Error Banner */
      .permission-error-banner {
        margin-bottom: 16px;
        background: #ffebee;
        border-left: 4px solid #f44336;
      }

      .permission-error-content {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }

      .error-icon-section {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .error-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #f44336;
      }

      .error-message-section {
        flex: 1;
        min-width: 200px;
      }

      .error-title {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 500;
        color: #c62828;
      }

      .error-message {
        margin: 0;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        line-height: 1.5;
      }

      .error-details {
        display: block;
        margin-top: 4px;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.6);
      }

      .error-actions-section {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .dismiss-btn {
        min-width: 120px;
      }

      .search-filters-card,
      .summary-dashboard-card {
        margin-bottom: 16px;
      }

      .search-filters-wrapper {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .search-field {
        flex: 1;
        min-width: 300px;
      }

      .filter-field {
        width: 200px;
      }

      .action-buttons {
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }

      .reset-btn,
      .add-btn {
        height: 56px;
        padding: 0 24px;
        white-space: nowrap;
        min-width: 120px;
      }

      .reset-btn mat-icon,
      .add-btn mat-icon {
        margin-right: 4px;
      }

      .active-filters {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
        padding: 12px 16px;
        background-color: #f5f5f5;
        border-radius: 8px;
        border-left: 4px solid #1976d2;
      }

      .active-filters-label {
        font-weight: 500;
        color: #1976d2;
        margin-right: 8px;
        flex-shrink: 0;
      }

      .filter-chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
        flex: 1;
      }

      .filter-chips mat-chip {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      .clear-all-btn {
        margin-left: auto;
        flex-shrink: 0;
      }

      .filters-panel {
        box-shadow: none !important;
      }

      .advanced-filters {
        padding: 20px;
      }

      /* Unified Filter Header */
      .filters-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        margin-bottom: 24px;
        font-size: 18px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
      }

      .filters-header mat-icon {
        font-size: 24px;
      }

      /* Unified Filter Grid */
      .unified-filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .filter-item {
        display: flex;
        flex-direction: column;
      }

      .filter-item mat-form-field {
        width: 100%;
      }

      /* Range Filter (Number/Date) - Takes 2 columns */
      .filter-item-range {
        grid-column: span 2;
      }

      .filter-item-date {
        grid-column: span 2;
      }

      @media (max-width: 968px) {
        .filter-item-range,
        .filter-item-date {
          grid-column: span 1;
        }
      }

      @media (max-width: 768px) {
        .unified-filter-grid {
          grid-template-columns: 1fr;
        }
      }

      .range-label {
        font-weight: 500;
        color: #424242;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .range-container {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .range-container mat-form-field {
        flex: 1;
      }

      .range-separator {
        color: #666;
        font-weight: 500;
        padding: 0 4px;
        margin-top: 8px;
      }

      .filter-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        align-items: center;
      }

      .reset-btn {
        min-width: 120px;
      }

      .apply-btn {
        min-width: 140px;
      }

      .search-btn {
        min-width: 100px;
      }

      .clear-search-btn {
        min-width: 80px;
      }

      .checkbox-filter {
        display: flex;
        align-items: center;
        min-width: 120px;
        margin: 8px 0;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px;
      }

      .loading-container p {
        margin-top: 16px;
        color: #666;
      }

      .error-card {
        margin-bottom: 16px;
      }

      .error-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .error-content mat-icon {
        font-size: 24px;
      }

      .error-content p {
        flex: 1;
        margin: 0;
      }

      .table-card {
        margin-bottom: 16px;
      }

      .bulk-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 16px;
      }

      .selection-info {
        font-weight: 500;
        color: #1976d2;
      }

      .bulk-buttons {
        display: flex;
        gap: 8px;
      }

      .table-container {
        overflow-x: auto;
      }

      .pdf-templates-table {
        width: 100%;
        min-width: 600px;
      }

      .empty-state {
        text-align: center;
        padding: 40px;
      }

      .empty-icon {
        font-size: 48px;
        color: #ccc;
        margin-bottom: 16px;
      }

      .empty-state h3 {
        margin: 0 0 8px 0;
        color: #666;
      }

      .empty-state p {
        margin: 0 0 24px 0;
        color: #999;
      }

      /* Summary Dashboard Styles */
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin: 16px 0;
      }

      .summary-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.02);
      }

      .summary-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.05);
      }

      .summary-content {
        flex: 1;
      }

      .summary-value {
        font-size: 24px;
        font-weight: 600;
        line-height: 1.2;
        color: rgba(0, 0, 0, 0.87);
      }

      .summary-label {
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: rgba(0, 0, 0, 0.6);
        margin-top: 2px;
      }

      .summary-item.clickable {
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .summary-item.clickable:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background: rgba(0, 0, 0, 0.04);
      }

      /* Category Breakdown Styles */
      .summary-item.category-breakdown {
        flex-direction: column;
        align-items: flex-start;
        grid-column: span 2;
      }

      .summary-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .breakdown-title {
        font-size: 14px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.87);
      }

      .category-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: white;
        border-radius: 6px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .category-item:hover {
        background: #f5f5f5;
        border-color: #1976d2;
      }

      .category-name {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.87);
      }

      .category-count {
        font-size: 13px;
        font-weight: 600;
        color: #1976d2;
        background: rgba(25, 118, 210, 0.1);
        padding: 2px 8px;
        border-radius: 12px;
      }

      /* Most Used Template Styles */
      .summary-item.most-used {
        flex-direction: column;
        align-items: flex-start;
        grid-column: span 2;
      }

      .most-used-content {
        width: 100%;
      }

      .template-info {
        padding: 12px;
        background: white;
        border-radius: 6px;
        border: 1px solid rgba(0, 0, 0, 0.08);
      }

      .template-name {
        font-size: 14px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.87);
        margin-bottom: 4px;
      }

      .template-usage {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }

      .no-data {
        text-align: center;
        padding: 16px;
        color: rgba(0, 0, 0, 0.38);
        font-size: 13px;
      }

      @media (max-width: 768px) {
        .pdf-templates-list-container {
          padding: 8px;
        }

        .search-container {
          flex-direction: column;
          align-items: stretch;
        }

        .search-group {
          flex-direction: column;
          align-items: stretch;
          min-width: unset;
          gap: 8px;
        }

        .search-field {
          min-width: unset;
        }

        .search-buttons {
          justify-content: center;
        }

        .search-btn,
        .clear-search-btn {
          flex: 1;
          min-width: unset;
        }

        .bulk-actions {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;
        }

        .bulk-buttons {
          justify-content: center;
        }

        .summary-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .summary-item {
          padding: 12px;
        }

        .summary-item.category-breakdown,
        .summary-item.most-used {
          grid-column: span 1;
        }
      }
    `,
  ],
})
export class PdfTemplateListComponent implements OnInit, OnDestroy {
  protected pdfTemplatesService = inject(PdfTemplateService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Search and filtering
  searchTerm = '';
  selectedCategory = ''; // Category filter selection
  private searchTimeout: any;
  private filterTimeout: any;

  private filtersSignal = signal<Partial<ListPdfTemplateQuery>>({});
  readonly filters = this.filtersSignal.asReadonly();

  // Quick filter state
  protected quickFilter = 'all';

  // Validation state
  private validationErrorsSignal = signal<Record<string, string>>({});
  readonly validationErrors = this.validationErrorsSignal.asReadonly();

  // Selection
  private selectedIdsSignal = signal<Set<string>>(new Set());
  readonly selectedItems = computed(() =>
    this.pdfTemplatesService
      .pdfTemplatesList()
      .filter((item) => this.selectedIdsSignal().has(item.id)),
  );

  // Table configuration - simplified to show only essential columns
  displayedColumns: string[] = [
    'select',
    'name',
    'display_name',
    'category',
    'actions',
  ];

  ngOnInit() {
    this.loadPdfTemplates();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
  }

  // ===== DATA LOADING =====

  async loadPdfTemplates() {
    const params: ListPdfTemplateQuery = {
      page: this.pdfTemplatesService.currentPage(),
      limit: this.pdfTemplatesService.pageSize(),
      ...this.filters(),
    };

    await this.pdfTemplatesService.loadPdfTemplateList(params);
  }

  async retry() {
    this.pdfTemplatesService.clearError();
    await this.loadPdfTemplates();
  }

  // ===== VALIDATION METHODS =====

  private isValidUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  private validateTechnicalFields(): { field: string; message: string }[] {
    const errors: { field: string; message: string }[] = [];
    const filters = this.filters();

    return errors;
  }

  private showFieldErrors(errors: { field: string; message: string }[]) {
    const errorMap: Record<string, string> = {};
    errors.forEach((error) => {
      errorMap[error.field] = error.message;
    });
    this.validationErrorsSignal.set(errorMap);

    // Show snackbar for user feedback
    if (errors.length > 0) {
      this.snackBar.open(
        'Please check your search criteria and try again',
        'Close',
        { duration: 3000, panelClass: ['error-snackbar'] },
      );
    }
  }

  private clearValidationErrors() {
    this.validationErrorsSignal.set({});
  }

  // ===== SEARCH AND FILTERING =====

  onSearch(term: string) {
    // Debounce search to prevent multiple API calls
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      // Update filters with search term
      this.filtersSignal.update((filters) => ({
        ...filters,
        search: term || undefined,
      }));

      // Reset to page 1 and reload
      this.pdfTemplatesService.setCurrentPage(1);
      this.loadPdfTemplates();
    }, 300);
  }

  clearSearch() {
    this.searchTerm = '';

    // Remove search from filters
    this.filtersSignal.update((filters) => {
      const { search, ...rest } = filters;
      return rest;
    });

    // Reset to page 1 and reload
    this.pdfTemplatesService.setCurrentPage(1);
    this.loadPdfTemplates();
  }

  // ===== CATEGORY FILTERING =====

  onCategoryFilterChange(category: string) {
    // Clear quick filter when category filter is used
    if (this.quickFilter !== 'all') {
      this.quickFilter = 'all';
    }

    // Update filters with category
    this.filtersSignal.update((filters) => ({
      ...filters,
      category: category || undefined,
    }));

    // Reset to page 1 and reload
    this.pdfTemplatesService.setCurrentPage(1);
    this.loadPdfTemplates();
  }

  // ===== DATE FILTERING =====

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    console.log('Date filter change:', dateFilter); // Debug log

    // Update filters with date filter values
    this.filtersSignal.update((filters) => ({
      ...filters,
      ...dateFilter,
    }));

    console.log('Updated filters:', this.filters()); // Debug log

    // Apply filters with debounce
    this.applyFilters();
  }

  // Handle filter field changes
  onFilterChange(field: string, event: any) {
    const value = event.target ? event.target.value : event;

    // Convert string numbers to numbers for numeric fields
    let processedValue = value;
    if (
      field.includes('_min') ||
      field.includes('_max') ||
      field === 'view_count'
    ) {
      processedValue = value === '' ? undefined : Number(value);
    }

    // Convert string booleans for boolean fields
    if (field === 'published') {
      processedValue = value === '' ? undefined : value;
    }

    // Clear quick filter when advance filters are used
    if (this.quickFilter !== 'all') {
      this.quickFilter = 'all';
    }

    this.filtersSignal.update((filters) => ({
      ...filters,
      [field]: processedValue,
    }));

    this.applyFilters();
  }

  applyFilters() {
    // Debounce filter changes to prevent multiple API calls
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.filterTimeout = setTimeout(() => {
      this.pdfTemplatesService.setCurrentPage(1);
      this.loadPdfTemplates();
    }, 300);
  }

  // Immediate filter application (for button clicks)
  applyFiltersImmediate() {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.pdfTemplatesService.setCurrentPage(1);
    this.loadPdfTemplates();
  }

  clearFilters() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.searchTerm = '';
    this.filtersSignal.set({});
    this.clearValidationErrors();
    this.pdfTemplatesService.setCurrentPage(1);
    this.loadPdfTemplates();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.length > 0 || Object.keys(this.filters()).length > 0;
  }

  activeFiltersCount(): number {
    let count = 0;
    if (this.searchTerm.length > 0) count++;
    count += Object.keys(this.filters()).length;
    return count;
  }

  // ===== PAGINATION =====

  onPageChange(event: PageEvent) {
    this.pdfTemplatesService.setCurrentPage(event.pageIndex + 1);
    this.pdfTemplatesService.setPageSize(event.pageSize);
    this.loadPdfTemplates();
  }

  // ===== SELECTION =====

  isSelected(id: string): boolean {
    return this.selectedIdsSignal().has(id);
  }

  hasSelected(): boolean {
    return this.selectedIdsSignal().size > 0;
  }

  isAllSelected(): boolean {
    const total = this.pdfTemplatesService.pdfTemplatesList().length;
    return total > 0 && this.selectedIdsSignal().size === total;
  }

  toggleSelect(id: string) {
    this.selectedIdsSignal.update((selected) => {
      const newSet = new Set(selected);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedIdsSignal.set(new Set());
    } else {
      const allIds = this.pdfTemplatesService
        .pdfTemplatesList()
        .map((item) => item.id);
      this.selectedIdsSignal.set(new Set(allIds));
    }
  }

  clearSelection() {
    this.selectedIdsSignal.set(new Set());
  }

  // ===== DIALOG OPERATIONS =====

  openCreateDialog() {
    const dialogRef = this.dialog.open(PdfTemplateCreateDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refresh the list to show the new item
        this.loadPdfTemplates();
      }
    });
  }

  openEditDialog(pdfTemplates: PdfTemplate) {
    const dialogRef = this.dialog.open(PdfTemplateEditDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      disableClose: true,
      data: { pdfTemplates } as PdfTemplateEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refresh the list to ensure array fields are properly displayed
        this.loadPdfTemplates();
      }
    });
  }

  openViewDialog(pdfTemplates: PdfTemplate) {
    const dialogRef = this.dialog.open(PdfTemplateViewDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { pdfTemplates } as PdfTemplateViewDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'edit') {
        // User clicked edit from view dialog
        this.openEditDialog(result.data);
      }
    });
  }

  // ===== QUICK FILTERS =====

  protected setQuickFilter(filter: string) {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.quickFilter = filter;

    // Clear all filters first
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filtersSignal.set({});
    this.clearValidationErrors();

    switch (filter) {
      case 'active':
        this.filtersSignal.set({ is_active: true });
        break;
      case 'inactive':
        this.filtersSignal.set({ is_active: false });
        break;
      case 'starters':
        this.filtersSignal.set({ is_template_starter: true });
        break;
      case 'all':
      default:
        // Already cleared above
        break;
    }

    // Quick filters should apply immediately
    this.pdfTemplatesService.setCurrentPage(1);
    this.loadPdfTemplates();
  }

  // ===== ACTIVE FILTER CHIPS =====

  protected getActiveFilterChips(): Array<{
    key: string;
    label: string;
    value: string;
  }> {
    const chips: Array<{ key: string; label: string; value: string }> = [];
    const filters = this.filters();

    // Add quick filter chip if not 'all'
    if (this.quickFilter !== 'all') {
      const quickFilterLabels: Record<string, string> = {
        active: 'Active Items',
        // 'featured': 'Featured Items',
        // 'available': 'Available Items',
        // 'draft': 'Draft Status',
      };
      chips.push({
        key: '_quickFilter',
        label: 'Quick Filter',
        value: quickFilterLabels[this.quickFilter] || this.quickFilter,
      });
    }

    if (this.searchTerm) {
      chips.push({ key: 'search', label: 'Search', value: this.searchTerm });
    }

    // Category filter
    if (this.selectedCategory) {
      const categoryLabels: Record<string, string> = {
        invoice: 'Invoice',
        receipt: 'Receipt',
        report: 'Report',
        letter: 'Letter',
        certificate: 'Certificate',
        other: 'Other',
      };
      chips.push({
        key: 'category',
        label: 'Category',
        value: categoryLabels[this.selectedCategory] || this.selectedCategory,
      });
    }

    // Date field filters - only add if fields exist in schema

    if (filters.created_at) {
      chips.push({
        key: 'created_at',
        label: 'Created Date',
        value: this.formatDate(filters.created_at as string),
      });
    } else if (filters.created_at_min || filters.created_at_max) {
      const from = filters.created_at_min
        ? this.formatDate(filters.created_at_min as string)
        : '...';
      const to = filters.created_at_max
        ? this.formatDate(filters.created_at_max as string)
        : '...';
      chips.push({
        key: 'created_at_range',
        label: 'Created Date Range',
        value: `${from} - ${to}`,
      });
    }

    if (filters.updated_at) {
      chips.push({
        key: 'updated_at',
        label: 'Updated Date',
        value: this.formatDate(filters.updated_at as string),
      });
    } else if (filters.updated_at_min || filters.updated_at_max) {
      const from = filters.updated_at_min
        ? this.formatDate(filters.updated_at_min as string)
        : '...';
      const to = filters.updated_at_max
        ? this.formatDate(filters.updated_at_max as string)
        : '...';
      chips.push({
        key: 'updated_at_range',
        label: 'Updated Date Range',
        value: `${from} - ${to}`,
      });
    }

    // String field filters

    // Number field filters

    // Foreign Key filters

    return chips;
  }

  protected removeFilter(key: string) {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    if (key === '_quickFilter') {
      // Reset quick filter to 'all'
      this.setQuickFilter('all');
      return;
    }

    if (key === 'search') {
      this.searchTerm = '';
    } else if (key === 'category') {
      this.selectedCategory = '';
      this.filtersSignal.update((filters) => {
        const updated = { ...filters } as any;
        delete updated.category;
        return updated;
      });
    } else if (key.includes('_range')) {
      // Handle date range removal
      const fieldName = key.replace('_range', '');
      this.filtersSignal.update((filters) => {
        const updated = { ...filters } as any;
        delete updated[fieldName];
        delete updated[`${fieldName}_min`];
        delete updated[`${fieldName}_max`];
        return updated;
      });
    } else {
      this.filtersSignal.update((filters) => {
        const updated = { ...filters } as any;
        delete updated[key];
        return updated;
      });
    }
    this.clearValidationErrors();
    this.pdfTemplatesService.setCurrentPage(1);
    this.loadPdfTemplates();
  }

  protected clearAllFilters() {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.searchTerm = '';
    this.selectedCategory = '';
    this.filtersSignal.set({});
    this.quickFilter = 'all';
    this.clearValidationErrors();
    this.pdfTemplatesService.setCurrentPage(1);
    this.loadPdfTemplates();
  }

  protected resetFilters() {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    this.filtersSignal.set({});
    this.clearValidationErrors();

    // Reset filters should apply immediately
    this.pdfTemplatesService.setCurrentPage(1);
    this.loadPdfTemplates();
  }

  // ===== DATE FILTER HANDLERS =====

  protected updateDateFilter(filterUpdate: any) {
    this.filtersSignal.update((current) => ({ ...current, ...filterUpdate }));
    this.applyFilters();
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // ===== ACTIONS =====

  async deletePdfTemplate(pdfTemplates: PdfTemplate) {
    if (confirm(`Are you sure you want to delete this pdfTemplates?`)) {
      try {
        await this.pdfTemplatesService.deletePdfTemplate(pdfTemplates.id);
        this.snackBar.open('Pdf Templates deleted successfully', 'Close', {
          duration: 3000,
        });
      } catch (error: any) {
        const errorMessage = this.pdfTemplatesService.permissionError()
          ? 'You do not have permission to delete Pdf Templates'
          : error?.message || 'Failed to delete Pdf Templates';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      }
    }
  }

  async bulkDelete() {
    const selectedIds = Array.from(this.selectedIdsSignal());
    if (selectedIds.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedIds.length} Pdf Templates?`,
    );
    if (!confirmed) return;

    try {
      await this.pdfTemplatesService.bulkDeletePdfTemplate(selectedIds);
      this.clearSelection();
      this.snackBar.open(
        `${selectedIds.length} Pdf Templates deleted successfully`,
        'Close',
        {
          duration: 3000,
        },
      );
    } catch (error: any) {
      const errorMessage = this.pdfTemplatesService.permissionError()
        ? 'You do not have permission to delete Pdf Templates'
        : error?.message || 'Failed to delete Pdf Templates';
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  async bulkUpdateStatus(status: string) {
    const selectedIds = Array.from(this.selectedIdsSignal());
    if (selectedIds.length === 0) return;

    try {
      // Create bulk update data with status field
      const items = selectedIds.map((id) => ({
        id,
        data: { status } as any,
      }));

      await this.pdfTemplatesService.bulkUpdatePdfTemplate(items);
      this.clearSelection();
      this.snackBar.open(
        `${selectedIds.length} Pdf Templates status updated successfully`,
        'Close',
        {
          duration: 3000,
        },
      );
    } catch (error: any) {
      const errorMessage = this.pdfTemplatesService.permissionError()
        ? 'You do not have permission to update Pdf Templates'
        : error?.message || 'Failed to update Pdf Templates status';
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  // ===== SUMMARY DASHBOARD METHODS =====

  /**
   * Get count of active templates
   */
  getActiveCount(): number {
    return this.pdfTemplatesService.pdfTemplatesList().filter((item) => {
      return item.is_active === true;
    }).length;
  }

  /**
   * Get count of template starters
   */
  getTemplateStartersCount(): number {
    return this.pdfTemplatesService.pdfTemplatesList().filter((item) => {
      return item.is_template_starter === true;
    }).length;
  }

  /**
   * Get total usage count across all templates
   */
  getTotalUsageCount(): number {
    return this.pdfTemplatesService.pdfTemplatesList().reduce((total, item) => {
      return total + (item.usage_count || 0);
    }, 0);
  }

  /**
   * Get breakdown of templates by category
   */
  getCategoryBreakdown(): Array<{
    category: string;
    label: string;
    count: number;
  }> {
    const categories = [
      'invoice',
      'receipt',
      'report',
      'letter',
      'certificate',
      'other',
    ];
    const labels: Record<string, string> = {
      invoice: 'Invoice',
      receipt: 'Receipt',
      report: 'Report',
      letter: 'Letter',
      certificate: 'Certificate',
      other: 'Other',
    };

    const breakdown = categories
      .map((category) => ({
        category,
        label: labels[category],
        count: this.pdfTemplatesService
          .pdfTemplatesList()
          .filter((item) => item.category === category).length,
      }))
      .filter((item) => item.count > 0); // Only show categories with templates

    return breakdown;
  }

  /**
   * Get the most used template
   */
  getMostUsedTemplate(): any {
    const templates = this.pdfTemplatesService.pdfTemplatesList();
    if (templates.length === 0) return null;

    return templates.reduce((max, item) => {
      const itemUsage = item.usage_count || 0;
      const maxUsage = max.usage_count || 0;
      return itemUsage > maxUsage ? item : max;
    }, templates[0]);
  }

  // ===== ADVANCED FEATURE METHODS =====

  /**
   * Open preview dialog to show PDF preview
   */
  openPreviewDialog(template: PdfTemplate) {
    const dialogRef = this.dialog.open(PdfTemplatePreviewDialog, {
      width: '90vw',
      height: '90vh',
      maxWidth: '1400px',
      maxHeight: '900px',
      data: { template } as PdfTemplatePreviewDialogData,
      disableClose: false,
    });
  }

  /**
   * Open duplicate dialog and handle duplication
   */
  openDuplicateDialog(template: PdfTemplate) {
    const dialogRef = this.dialog.open(PdfTemplateDuplicateDialog, {
      width: '600px',
      data: { template } as PdfTemplateDuplicateDialogData,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.name) {
        try {
          const duplicated = await this.pdfTemplatesService.duplicateTemplate(
            template.id,
            result.name,
          );

          if (duplicated) {
            this.snackBar.open(
              `Template "${template.display_name}" duplicated successfully as "${result.name}"`,
              'Close',
              {
                duration: 5000,
                panelClass: ['success-snackbar'],
              },
            );
            // Refresh list to show new template
            await this.loadPdfTemplates();
          }
        } catch (error: any) {
          console.error('Duplication failed:', error);
          this.snackBar.open(
            `Failed to duplicate template: ${error.message || 'Unknown error'}`,
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            },
          );
        }
      }
    });
  }
}
