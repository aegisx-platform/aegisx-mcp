import { Component, OnInit, computed, signal, inject, OnDestroy } from '@angular/core';
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
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { NotificationService } from '../services/notifications.service';
import { Notification, ListNotificationQuery } from '../types/notification.types';
import { NotificationCreateDialogComponent } from './notifications-create.dialog';
import { NotificationEditDialogComponent, NotificationEditDialogData } from './notifications-edit.dialog';
import { NotificationViewDialogComponent, NotificationViewDialogData } from './notifications-view.dialog';
import { DateRangeFilterComponent } from '../../../shared/components/date-range-filter/date-range-filter.component';
import { SharedExportComponent, ExportOptions, ExportService } from '../../../shared/components/shared-export/shared-export.component';

@Component({
  selector: 'app-notifications-list',
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
    DateRangeFilterComponent,
    SharedExportComponent,
  ],
  template: `
    <div class="notifications-list-container">
      <!-- Header -->
      <mat-toolbar color="primary" class="page-header">
        <h1 class="page-title">Notifications</h1>
        <span class="spacer"></span>
      </mat-toolbar>

      <!-- Quick Search Section -->
      <mat-card class="search-card">
        <mat-card-content>
          <div class="search-wrapper">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Notifications</mat-label>
              <input 
                matInput 
                placeholder="Search by title, name, description"
                [(ngModel)]="searchTerm"
                (input)="onSearchChange()"
                (keyup.enter)="onSearchButtonClick()"
              >
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="openCreateDialog()"
              [disabled]="notificationsService.loading()"
              class="add-btn"
            >
              <mat-icon>add</mat-icon>
              Add Notifications
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Quick Filters -->
      <mat-card class="quick-filters-card">
        <mat-card-content>
          <div class="quick-filters">
            <button 
              mat-stroked-button 
              [class.active]="quickFilter === 'all'"
              (click)="setQuickFilter('all')"
              class="filter-chip"
            >
              All
            </button>
            
            <!-- Active Items Filter -->
            <button 
              mat-stroked-button 
              [class.active]="quickFilter === 'active'"
              (click)="setQuickFilter('active')"
              class="filter-chip"
            >
              Active
            </button>
            
            <!-- Published Status Filter -->
            <button 
              mat-stroked-button 
              [class.active]="quickFilter === 'published'"
              (click)="setQuickFilter('published')"
              class="filter-chip"
            >
              Published
            </button>
            
            <!-- Additional quick filters - uncomment as needed -->
            <!-- Featured Items:
            <button 
              mat-stroked-button 
              [class.active]="quickFilter === 'featured'"
              (click)="setQuickFilter('featured')"
              class="filter-chip"
            >
              Featured
            </button>
            -->
            
            <!-- Available Items:
            <button 
              mat-stroked-button 
              [class.active]="quickFilter === 'available'"
              (click)="setQuickFilter('available')"
              class="filter-chip"
            >
              Available
            </button>
            -->
            
            <!-- Draft Status:
            <button 
              mat-stroked-button 
              [class.active]="quickFilter === 'draft'"
              (click)="setQuickFilter('draft')"
              class="filter-chip"
            >
              Draft
            </button>
            -->
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
            <strong>{{ chip.label \}}:</strong> {{ chip.value \}}
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
            <mat-icon>dashboard</mat-icon>
            Notifications Overview
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-icon">
                <mat-icon color="primary">view_list</mat-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ notificationsService.totalNotification() \}}</div>
                <div class="summary-label">Total Notifications</div>
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-icon">
                <mat-icon color="accent">check_circle</mat-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ getActiveCount() \}}</div>
                <div class="summary-label">Active Items</div>
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-icon">
                <mat-icon color="warn">schedule</mat-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ getDraftCount() \}}</div>
                <div class="summary-label">Draft Items</div>
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-icon">
                <mat-icon>today</mat-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ getRecentCount() \}}</div>
                <div class="summary-label">Added This Week</div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Export Tools -->
      <mat-card class="export-tools-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>file_download</mat-icon>
            Export Data
          </mat-card-title>
          <mat-card-subtitle>Export Notifications data in various formats</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <app-export
            [exportService]="exportServiceAdapter"
            [currentFilters]="filters()"
            [selectedItems]="selectedItems()"
            [availableFields]="availableExportFields"
            [moduleName]="'notifications'"
            (exportStarted)="onExportStarted($event)"
            (exportCompleted)="onExportCompleted($event)"
          ></app-export>
          
          <!-- Export Information -->
          <div class="export-info">
            <mat-icon class="info-icon">info</mat-icon>
            <span class="info-text">
              Total Notifications: {{ notificationsService.totalNotification() \}} records
              @if (hasActiveFilters()) {
                ({{ activeFiltersCount() \}} filters active)
              }
              @if (selectedItems().length > 0) {
                | {{ selectedItems().length \}} selected
              }
            </span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Advanced Filters -->
      <mat-card class="advanced-filters-card">
        <mat-expansion-panel class="filters-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>tune</mat-icon>
              Advanced Filters
            </mat-panel-title>
            <mat-panel-description>
              Filter by specific criteria
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="advanced-filters">
            <!-- Filter Fields -->
            <div class="filter-grid">
              <!-- Fields Filter -->
              <div class="filter-group">
                <label class="filter-label">Fields</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Fields</mat-label>
                  <input
                    matInput
                    type="text"
                    [value]="filters().fields || ''"
                    (input)="onFilterChange('fields', $event)"
                    placeholder="Enter fields"
                  />
                </mat-form-field>
              </div>
              
              <!-- Type Filter -->
              <div class="filter-group">
                <label class="filter-label">Type</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Type</mat-label>
                  <mat-select 
                    [value]="filters().type"
                    (selectionChange)="onFilterChange('type', $event.value)"
                  >
                    <mat-option value="">All</mat-option>
                    <mat-option value="info">Info</mat-option>
                    <mat-option value="warning">Warning</mat-option>
                    <mat-option value="error">Error</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              
              <!-- Read Filter -->
              <div class="filter-group">
                <label class="filter-label">Read</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Read</mat-label>
                  <mat-select 
                    [value]="filters().read"
                    (selectionChange)="onFilterChange('read', $event.value)"
                  >
                    <mat-option value="">All</mat-option>
                    <mat-option [value]="true">Yes</mat-option>
                    <mat-option [value]="false">No</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              
              <!-- Archived Filter -->
              <div class="filter-group">
                <label class="filter-label">Archived</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Archived</mat-label>
                  <mat-select 
                    [value]="filters().archived"
                    (selectionChange)="onFilterChange('archived', $event.value)"
                  >
                    <mat-option value="">All</mat-option>
                    <mat-option [value]="true">Yes</mat-option>
                    <mat-option [value]="false">No</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              
            </div>

            <!-- Date Filters Section -->
            <div class="date-filters-section">
              <h4 class="section-header">
                <mat-icon>event</mat-icon>
                Date Filters
              </h4>
              
              <div class="date-filters-grid">
                <!-- Published Date Filter -->
                <div class="date-filter-group">
                  <label class="filter-label">Published Date</label>
                  <app-date-range-filter
                    fieldName="published_at"
                    label="Published Date"
                    [isDateTime]="true"
                    (filterChange)="onDateFilterChange($event)"
                  ></app-date-range-filter>
                </div>
                
                <!-- Created Date Filter -->
                <div class="date-filter-group">
                  <label class="filter-label">Created Date</label>
                  <app-date-range-filter
                    fieldName="created_at"
                    label="Created Date"
                    [isDateTime]="true"
                    (filterChange)="onDateFilterChange($event)"
                  ></app-date-range-filter>
                </div>
                
                <!-- Updated Date Filter -->
                <div class="date-filter-group">
                  <label class="filter-label">Updated Date</label>
                  <app-date-range-filter
                    fieldName="updated_at"
                    label="Updated Date"
                    [isDateTime]="true"
                    (filterChange)="onDateFilterChange($event)"
                  ></app-date-range-filter>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="filter-actions">
              <button 
                mat-stroked-button 
                (click)="resetFilters()"
                class="reset-btn"
              >
                Reset Filters
              </button>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="applyFiltersImmediate()"
                class="apply-btn"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-card>

      <!-- Loading State -->
      @if (notificationsService.loading()) {
      <div class="loading-container">
        <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
        <p>Loading Notifications...</p>
      </div>
      }

      <!-- Error State -->
      @if (notificationsService.error()) {
      <mat-card class="error-card">
        <mat-card-content>
          <div class="error-content">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ notificationsService.error() \}}</p>
            <button mat-button color="primary" (click)="retry()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
        </mat-card-content>
      </mat-card>
      }

      <!-- Data Table -->
      @if (!notificationsService.loading() && !notificationsService.error()) {
      <mat-card class="table-card">
        <mat-card-content>
          <!-- Bulk Actions -->
          @if (hasSelected()) {
          <div class="bulk-actions">
            <span class="selection-info">{{ selectedItems().length \}} selected</span>
            <div class="bulk-buttons">
              <!-- Bulk Delete -->
              <button 
                mat-stroked-button 
                color="warn"
                (click)="bulkDelete()"
                [disabled]="notificationsService.loading()"
                matTooltip="Delete selected items"
              >
                <mat-icon>delete</mat-icon>
                Delete
              </button>
              
              <!-- Bulk Status Update -->
              <button 
                mat-stroked-button 
                [matMenuTriggerFor]="bulkStatusMenu"
                [disabled]="notificationsService.loading()"
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
                <button mat-menu-item (click)="bulkUpdateStatus('inactive')">
                  <mat-icon>cancel</mat-icon>
                  <span>Set Inactive</span>
                </button>
                <button mat-menu-item (click)="bulkUpdateStatus('published')">
                  <mat-icon>publish</mat-icon>
                  <span>Publish</span>
                </button>
                <button mat-menu-item (click)="bulkUpdateStatus('draft')">
                  <mat-icon>draft</mat-icon>
                  <span>Set Draft</span>
                </button>
              </mat-menu>
              
              <!-- Bulk Export -->
              <button 
                mat-stroked-button 
                color="accent"
                [matMenuTriggerFor]="bulkExportMenu"
                [disabled]="notificationsService.loading()"
                matTooltip="Export selected items"
              >
                <mat-icon>download</mat-icon>
                Export
              </button>
              <mat-menu #bulkExportMenu="matMenu">
                <button mat-menu-item (click)="exportSelected('csv')">
                  <mat-icon>table_chart</mat-icon>
                  <span>Export as CSV</span>
                </button>
                <button mat-menu-item (click)="exportSelected('excel')">
                  <mat-icon>grid_on</mat-icon>
                  <span>Export as Excel</span>
                </button>
                <button mat-menu-item (click)="exportSelected('pdf')">
                  <mat-icon>picture_as_pdf</mat-icon>
                  <span>Export as PDF</span>
                </button>
              </mat-menu>
              
              <!-- Clear Selection -->
              <button 
                mat-stroked-button 
                (click)="clearSelection()"
              >
                <mat-icon>clear</mat-icon>
                Clear Selection
              </button>
            </div>
          </div>
          }

          <!-- Table -->
          <div class="table-container">
            <table mat-table [dataSource]="notificationsService.notificationsList()" class="notifications-table">
              <!-- Selection Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox
                    [checked]="isAllSelected()"
                    [indeterminate]="hasSelected() && !isAllSelected()"
                    (change)="toggleSelectAll()"
                  ></mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let notifications">
                  <mat-checkbox
                    [checked]="isSelected(notifications.id)"
                    (change)="toggleSelect(notifications.id)"
                  ></mat-checkbox>
                </td>
              </ng-container>

              <!-- user_id Column -->
              <ng-container matColumnDef="user_id">
                <th mat-header-cell *matHeaderCellDef>User_id</th>
                <td mat-cell *matCellDef="let notifications">
                  <span class="text-cell">{{ notifications.user_id || '-' \}}</span>
                </td>
              </ng-container>

              <!-- type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let notifications">
                  <span class="text-cell">{{ notifications.type || '-' \}}</span>
                </td>
              </ng-container>

              <!-- title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let notifications">
                  <span class="text-cell">{{ notifications.title || '-' \}}</span>
                </td>
              </ng-container>

              <!-- message Column -->
              <ng-container matColumnDef="message">
                <th mat-header-cell *matHeaderCellDef>Message</th>
                <td mat-cell *matCellDef="let notifications">
                  <span [title]="notifications.message" class="truncated-cell">
                    {{ notifications.message | slice:0:50 \}}
                    @if (notifications.message && notifications.message.length > 50) {
                      <span>...</span>
                    }
                  </span>
                </td>
              </ng-container>

              <!-- data Column -->
              <ng-container matColumnDef="data">
                <th mat-header-cell *matHeaderCellDef>Data</th>
                <td mat-cell *matCellDef="let notifications">
                  <span class="text-cell">{{ notifications.data || '-' \}}</span>
                </td>
              </ng-container>

              <!-- action_url Column -->
              <ng-container matColumnDef="action_url">
                <th mat-header-cell *matHeaderCellDef>Action_url</th>
                <td mat-cell *matCellDef="let notifications">
                  <span class="text-cell">{{ notifications.action_url || '-' \}}</span>
                </td>
              </ng-container>

              <!-- read Column -->
              <ng-container matColumnDef="read">
                <th mat-header-cell *matHeaderCellDef>Read</th>
                <td mat-cell *matCellDef="let notifications">
                  <mat-icon [color]="notifications.read ? 'primary' : 'warn'" class="status-icon">
                    {{ notifications.read ? 'check_circle' : 'cancel' \}}
                  </mat-icon>
                </td>
              </ng-container>

              <!-- read_at Column -->
              <ng-container matColumnDef="read_at">
                <th mat-header-cell *matHeaderCellDef>Read_at</th>
                <td mat-cell *matCellDef="let notifications">
                  {{ notifications.read_at | date:'short' \}}
                </td>
              </ng-container>

              <!-- archived Column -->
              <ng-container matColumnDef="archived">
                <th mat-header-cell *matHeaderCellDef>Archived</th>
                <td mat-cell *matCellDef="let notifications">
                  <mat-icon [color]="notifications.archived ? 'primary' : 'warn'" class="status-icon">
                    {{ notifications.archived ? 'check_circle' : 'cancel' \}}
                  </mat-icon>
                </td>
              </ng-container>

              <!-- archived_at Column -->
              <ng-container matColumnDef="archived_at">
                <th mat-header-cell *matHeaderCellDef>Archived_at</th>
                <td mat-cell *matCellDef="let notifications">
                  {{ notifications.archived_at | date:'short' \}}
                </td>
              </ng-container>

              <!-- priority Column -->
              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef>Priority</th>
                <td mat-cell *matCellDef="let notifications">
                  <span class="text-cell">{{ notifications.priority || '-' \}}</span>
                </td>
              </ng-container>

              <!-- expires_at Column -->
              <ng-container matColumnDef="expires_at">
                <th mat-header-cell *matHeaderCellDef>Expires_at</th>
                <td mat-cell *matCellDef="let notifications">
                  {{ notifications.expires_at | date:'short' \}}
                </td>
              </ng-container>


              <!-- Created Date Column -->
              <ng-container matColumnDef="created_at">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let notifications">
                  {{ notifications.created_at | date:'short' }}
                </td>
              </ng-container>
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let notifications">
                  <button 
                    mat-icon-button 
                    (click)="openViewDialog(notifications)"
                    matTooltip="View Details"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    (click)="openEditDialog(notifications)"
                    matTooltip="Edit"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    color="warn"
                    (click)="deleteNotification(notifications)"
                    matTooltip="Delete"
                    [disabled]="notificationsService.loading()"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <!-- Empty State -->
          @if (notificationsService.notificationsList().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">inbox</mat-icon>
            <h3>No Notifications found</h3>
            <p>Create your first Notifications to get started</p>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Add Notifications
            </button>
          </div>
          }

          <!-- Pagination -->
          @if (notificationsService.notificationsList().length > 0) {
          <mat-paginator
            [length]="notificationsService.totalNotification()"
            [pageSize]="notificationsService.pageSize()"
            [pageSizeOptions]="[5, 10, 25, 50, 100]"
            [pageIndex]="notificationsService.currentPage() - 1"
            (page)="onPageChange($event)"
            showFirstLastButtons
          ></mat-paginator>
          }
        </mat-card-content>
      </mat-card>
      }
    </div>
  `,
  styles: [`
    .notifications-list-container {
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

    .search-card, .quick-filters-card, .summary-dashboard-card, .export-tools-card, .advanced-filters-card {
      margin-bottom: 16px;
    }

    .search-wrapper {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .add-btn {
      height: 56px;
      padding: 0 24px;
      white-space: nowrap;
      min-width: 140px;
    }

    .quick-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-chip {
      transition: all 0.2s ease;
    }

    .filter-chip.active {
      background-color: #1976d2;
      color: white;
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
      padding: 16px 0;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-group.full-width {
      grid-column: 1 / -1;
    }

    .filter-label {
      font-weight: 500;
      color: #424242;
      font-size: 14px;
    }

    .filter-field {
      width: 100%;
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

    .notifications-table {
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

    /* Date Filters Styles */
    .date-filters-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .section-header mat-icon {
      font-size: 20px;
      color: #1976d2;
    }

    .date-filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .date-filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
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

    /* Export Tools Styles */
    .export-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .export-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      font-size: 14px;
    }

    .info-icon {
      font-size: 18px;
      color: rgba(0, 0, 0, 0.6);
    }

    .info-text {
      color: rgba(0, 0, 0, 0.7);
    }

    @media (max-width: 768px) {
      .notifications-list-container {
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

      .export-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
    }
  `]
})
export class NotificationListComponent implements OnInit, OnDestroy {
  protected notificationsService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Search and filtering
  searchTerm = '';
  private searchTimeout: any;
  private filterTimeout: any;
  
  private filtersSignal = signal<Partial<ListNotificationQuery>>({});
  readonly filters = this.filtersSignal.asReadonly();

  // Quick filter state
  protected quickFilter = 'all';

  // Validation state
  private validationErrorsSignal = signal<Record<string, string>>({});
  readonly validationErrors = this.validationErrorsSignal.asReadonly();

  // Selection
  private selectedIdsSignal = signal<Set<string>>(new Set());
  readonly selectedItems = computed(() => 
    this.notificationsService.notificationsList().filter(item => this.selectedIdsSignal().has(item.id))
  );

  // Export configuration
  exportServiceAdapter: ExportService = {
    export: (options: ExportOptions) => this.notificationsService.exportNotification(options)
  };
  
  availableExportFields = [
    { key: 'id', label: 'Id' },
    { key: 'user_id', label: 'User id' },
    { key: 'type', label: 'Type' },
    { key: 'title', label: 'Title' },
    { key: 'message', label: 'Message' },
    { key: 'data', label: 'Data' },
    { key: 'action_url', label: 'Action url' },
    { key: 'read', label: 'Read' },
    { key: 'read_at', label: 'Read at' },
    { key: 'archived', label: 'Archived' },
    { key: 'archived_at', label: 'Archived at' },
    { key: 'priority', label: 'Priority' },
    { key: 'expires_at', label: 'Expires at' },
    { key: 'created_at', label: 'Created at' },
    { key: 'updated_at', label: 'Updated at' },
  ];

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'user_id',
    'type',
    'title',
    'message',
    'data',
    'action_url',
    'read',
    'read_at',
    'archived',
    'archived_at',
    'priority',
    'expires_at',
    'created_at',
    'actions'
  ];

  ngOnInit() {
    this.loadNotifications();
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

  async loadNotifications() {
    const params: ListNotificationQuery = {
      page: this.notificationsService.currentPage(),
      limit: this.notificationsService.pageSize(),
      ...this.filters(),
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    await this.notificationsService.loadNotificationList(params);
  }

  async retry() {
    this.notificationsService.clearError();
    await this.loadNotifications();
  }

  // ===== VALIDATION METHODS =====

  private isValidUuid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  private validateTechnicalFields(): { field: string; message: string }[] {
    const errors: { field: string; message: string }[] = [];
    const filters = this.filters();

    return errors;
  }

  private showFieldErrors(errors: { field: string; message: string }[]) {
    const errorMap: Record<string, string> = {};
    errors.forEach(error => {
      errorMap[error.field] = error.message;
    });
    this.validationErrorsSignal.set(errorMap);

    // Show snackbar for user feedback
    if (errors.length > 0) {
      this.snackBar.open(
        'Please check your search criteria and try again',
        'Close',
        { duration: 3000, panelClass: ['error-snackbar'] }
      );
    }
  }

  private clearValidationErrors() {
    this.validationErrorsSignal.set({});
  }

  // ===== SEARCH AND FILTERING =====

  onSearchChange() {
    // Debounce search for auto-search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.notificationsService.setCurrentPage(1);
      this.loadNotifications();
    }, 300);
  }

  onSearchButtonClick() {
    // Manual search - validate before execution
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Validate technical fields first
    const validationErrors = this.validateTechnicalFields();
    
    if (validationErrors.length > 0) {
      this.showFieldErrors(validationErrors);
      return; // Don't proceed with search
    }

    // Clear any previous validation errors
    this.clearValidationErrors();
    
    this.notificationsService.setCurrentPage(1);
    this.loadNotifications();
  }

  clearSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTerm = '';
    this.notificationsService.setCurrentPage(1);
    this.loadNotifications();
  }

  // ===== DATE FILTERING =====

  onDateFilterChange(dateFilter: { [key: string]: string | null | undefined }) {
    console.log('Date filter change:', dateFilter); // Debug log
    
    // Update filters with date filter values
    this.filtersSignal.update(filters => ({
      ...filters,
      ...dateFilter
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
    if (field.includes('_min') || field.includes('_max') || field === 'view_count') {
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
    
    this.filtersSignal.update(filters => ({
      ...filters,
      [field]: processedValue
    }));
    
    this.applyFilters();
  }

  applyFilters() {
    // Debounce filter changes to prevent multiple API calls
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.filterTimeout = setTimeout(() => {
      this.notificationsService.setCurrentPage(1);
      this.loadNotifications();
    }, 300);
  }

  // Immediate filter application (for button clicks)
  applyFiltersImmediate() {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.notificationsService.setCurrentPage(1);
    this.loadNotifications();
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
    this.notificationsService.setCurrentPage(1);
    this.loadNotifications();
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
    this.notificationsService.setCurrentPage(event.pageIndex + 1);
    this.notificationsService.setPageSize(event.pageSize);
    this.loadNotifications();
  }

  // ===== SELECTION =====

  isSelected(id: string): boolean {
    return this.selectedIdsSignal().has(id);
  }

  hasSelected(): boolean {
    return this.selectedIdsSignal().size > 0;
  }

  isAllSelected(): boolean {
    const total = this.notificationsService.notificationsList().length;
    return total > 0 && this.selectedIdsSignal().size === total;
  }

  toggleSelect(id: string) {
    this.selectedIdsSignal.update(selected => {
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
      const allIds = this.notificationsService.notificationsList().map(item => item.id);
      this.selectedIdsSignal.set(new Set(allIds));
    }
  }

  clearSelection() {
    this.selectedIdsSignal.set(new Set());
  }

  // ===== DIALOG OPERATIONS =====

  openCreateDialog() {
    const dialogRef = this.dialog.open(NotificationCreateDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refresh the list to show the new item
        this.loadNotifications();
      }
    });
  }

  openEditDialog(notifications: Notification) {
    const dialogRef = this.dialog.open(NotificationEditDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      data: { notifications } as NotificationEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // The service automatically updates the list with optimistic updates
        // No need to refresh unless there was an error
      }
    });
  }

  openViewDialog(notifications: Notification) {
    const dialogRef = this.dialog.open(NotificationViewDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { notifications } as NotificationViewDialogData,
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
    this.filtersSignal.set({});
    this.clearValidationErrors();
    
    switch (filter) {
      case 'active':
        break;
      case 'published':
        break;
      // case 'featured':
      //   this.filtersSignal.set({ is_featured: true });
      //   break;
      // case 'available':
      //   this.filtersSignal.set({ is_available: true });
      //   break;
      // case 'draft':
      //   this.filtersSignal.set({ status: 'draft' });
      //   break;
      case 'all':
      default:
        // Already cleared above
        break;
    }
    
    // Quick filters should apply immediately
    this.notificationsService.setCurrentPage(1);
    this.loadNotifications();
  }

  // ===== ACTIVE FILTER CHIPS =====

  protected getActiveFilterChips(): Array<{ key: string; label: string; value: string }> {
    const chips: Array<{ key: string; label: string; value: string }> = [];
    const filters = this.filters();
    
    // Add quick filter chip if not 'all'
    if (this.quickFilter !== 'all') {
      const quickFilterLabels: Record<string, string> = {
        'active': 'Active Items',
        'published': 'Published Status',
        // 'featured': 'Featured Items',
        // 'available': 'Available Items',
        // 'draft': 'Draft Status',
      };
      chips.push({ 
        key: '_quickFilter', 
        label: 'Quick Filter', 
        value: quickFilterLabels[this.quickFilter] || this.quickFilter 
      });
    }
    
    if (this.searchTerm) {
      chips.push({ key: 'search', label: 'Search', value: this.searchTerm });
    }
    
    // Date field filters - only add if fields exist in schema
    
    if (filters.created_at) {
      chips.push({ key: 'created_at', label: 'Created Date', value: this.formatDate(filters.created_at as string) });
    } else if (filters.created_at_min || filters.created_at_max) {
      const from = filters.created_at_min ? this.formatDate(filters.created_at_min as string) : '...';
      const to = filters.created_at_max ? this.formatDate(filters.created_at_max as string) : '...';
      chips.push({ key: 'created_at_range', label: 'Created Date Range', value: `${from} - ${to}` });
    }
    
    if (filters.updated_at) {
      chips.push({ key: 'updated_at', label: 'Updated Date', value: this.formatDate(filters.updated_at as string) });
    } else if (filters.updated_at_min || filters.updated_at_max) {
      const from = filters.updated_at_min ? this.formatDate(filters.updated_at_min as string) : '...';
      const to = filters.updated_at_max ? this.formatDate(filters.updated_at_max as string) : '...';
      chips.push({ key: 'updated_at_range', label: 'Updated Date Range', value: `${from} - ${to}` });
    }
    
    // Regular field filters
    if (filters.fields !== undefined && filters.fields.length > 0) {
      chips.push({ key: 'fields', label: 'Fields', value: String(filters.fields) });
    }
    
    if (filters.type !== undefined && filters.type !== '') {
      chips.push({ key: 'type', label: 'Type', value: String(filters.type) });
    }
    
    if (filters.read !== undefined && filters.read !== null) {
      chips.push({ key: 'read', label: 'Read', value: filters.read ? 'Yes' : 'No' });
    }
    
    if (filters.archived !== undefined && filters.archived !== null) {
      chips.push({ key: 'archived', label: 'Archived', value: filters.archived ? 'Yes' : 'No' });
    }
    
    
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
    } else if (key.includes('_range')) {
      // Handle date range removal
      const fieldName = key.replace('_range', '');
      this.filtersSignal.update(filters => {
        const updated = { ...filters } as any;
        delete updated[fieldName];
        delete updated[`${fieldName}_min`];
        delete updated[`${fieldName}_max`];
        return updated;
      });
    } else {
      this.filtersSignal.update(filters => {
        const updated = { ...filters } as any;
        delete updated[key];
        return updated;
      });
    }
    this.clearValidationErrors();
    this.notificationsService.setCurrentPage(1);
    this.loadNotifications();
  }

  protected clearAllFilters() {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.searchTerm = '';
    this.filtersSignal.set({});
    this.quickFilter = 'all';
    this.clearValidationErrors();
    this.notificationsService.setCurrentPage(1);
    this.loadNotifications();
  }

  protected resetFilters() {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.filtersSignal.set({});
    this.clearValidationErrors();
    
    // Reset filters should apply immediately
    this.notificationsService.setCurrentPage(1);
    this.loadNotifications();
  }

  // ===== DATE FILTER HANDLERS =====

  protected updateDateFilter(filterUpdate: any) {
    this.filtersSignal.update(current => ({ ...current, ...filterUpdate }));
    this.applyFilters();
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // ===== ACTIONS =====

  async deleteNotification(notifications: Notification) {
    if (confirm(`Are you sure you want to delete this notifications?`)) {
      try {
        await this.notificationsService.deleteNotification(notifications.id);
        this.snackBar.open('Notifications deleted successfully', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Failed to delete Notifications', 'Close', {
          duration: 5000,
        });
      }
    }
  }

  async bulkDelete() {
    const selectedIds = Array.from(this.selectedIdsSignal());
    if (selectedIds.length === 0) return;

    const confirmed = confirm(`Are you sure you want to delete ${selectedIds.length} Notifications?`);
    if (!confirmed) return;

    try {
      await this.notificationsService.bulkDeleteNotification(selectedIds);
      this.clearSelection();
      this.snackBar.open(`${selectedIds.length} Notifications deleted successfully`, 'Close', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Failed to delete Notifications', 'Close', {
        duration: 5000,
      });
    }
  }

  async bulkUpdateStatus(status: string) {
    const selectedIds = Array.from(this.selectedIdsSignal());
    if (selectedIds.length === 0) return;

    try {
      // Create bulk update data with status field
      const items = selectedIds.map(id => ({
        id,
        data: { status } as any
      }));
      
      await this.notificationsService.bulkUpdateNotification(items);
      this.clearSelection();
      this.snackBar.open(`${selectedIds.length} Notifications status updated successfully`, 'Close', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Failed to update Notifications status', 'Close', {
        duration: 5000,
      });
    }
  }

  async exportSelected(format: 'csv' | 'excel' | 'pdf') {
    const selectedIds = Array.from(this.selectedIdsSignal());
    if (selectedIds.length === 0) {
      this.snackBar.open('Please select items to export', 'Close', { duration: 3000 });
      return;
    }

    try {
      // For now, show a placeholder message since export endpoints need to be implemented
      this.snackBar.open(`Export feature coming soon (${format.toUpperCase()})`, 'Close', {
        duration: 3000,
      });
      console.log('Export selected:', { selectedIds, format });
    } catch (error) {
      this.snackBar.open('Failed to export Notifications', 'Close', {
        duration: 5000,
      });
    }
  }

  // ===== EXPORT EVENT HANDLERS =====

  onExportStarted(options: ExportOptions) {
    console.log('Export started:', options);
    this.snackBar.open(`Preparing ${options.format.toUpperCase()} export...`, '', {
      duration: 2000,
    });
  }

  onExportCompleted(result: { success: boolean; format: string }) {
    if (result.success) {
      this.snackBar.open(`${result.format.toUpperCase()} export completed successfully!`, 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } else {
      this.snackBar.open(`${result.format.toUpperCase()} export failed`, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // ===== SUMMARY DASHBOARD METHODS =====

  getActiveCount(): number {
    return this.notificationsService.notificationsList().filter(item => {
      return true; // Default to count all if no relevant field exists
          }).length;
  }

  getDraftCount(): number {
    return this.notificationsService.notificationsList().filter(item => {
      return false; // Default to count none if no relevant field exists
          }).length;
  }

  getRecentCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.notificationsService.notificationsList().filter(item => 
      item.created_at && new Date(item.created_at) >= oneWeekAgo
    ).length;
  }
}