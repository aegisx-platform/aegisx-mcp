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

import { AuthorService } from '../services/authors.service';
import { Author, ListAuthorQuery } from '../types/authors.types';
import { AuthorCreateDialogComponent } from './authors-create.dialog';
import { AuthorEditDialogComponent, AuthorEditDialogData } from './authors-edit.dialog';
import { AuthorViewDialogComponent, AuthorViewDialogData } from './authors-view.dialog';
import { DateRangeFilterComponent } from '../../../shared/components/date-range-filter/date-range-filter.component';
import { SharedExportComponent, ExportOptions, ExportService } from '../../../shared/components/shared-export/shared-export.component';

@Component({
  selector: 'app-authors-list',
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
    <div class="authors-list-container">
      <!-- Header -->
      <mat-toolbar color="primary" class="page-header">
        <h1 class="page-title">Authors</h1>
        <span class="spacer"></span>
      </mat-toolbar>

      <!-- Quick Search Section -->
      <mat-card class="search-card">
        <mat-card-content>
          <div class="search-wrapper">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Authors</mat-label>
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
              [disabled]="authorsService.loading()"
              class="add-btn"
            >
              <mat-icon>add</mat-icon>
              Add Authors
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
            Authors Overview
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-icon">
                <mat-icon color="primary">view_list</mat-icon>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ authorsService.totalAuthor() \}}</div>
                <div class="summary-label">Total Authors</div>
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
          <mat-card-subtitle>Export Authors data in various formats</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <app-export
            [exportService]="exportServiceAdapter"
            [currentFilters]="filters()"
            [selectedItems]="selectedItems()"
            [availableFields]="availableExportFields"
            [moduleName]="'authors'"
            (exportStarted)="onExportStarted($event)"
            (exportCompleted)="onExportCompleted($event)"
          ></app-export>
          
          <!-- Export Information -->
          <div class="export-info">
            <mat-icon class="info-icon">info</mat-icon>
            <span class="info-text">
              Total Authors: {{ authorsService.totalAuthor() \}} records
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
            <!-- Boolean Filters -->
            <div class="filter-grid">
              <h4 class="section-header">
                <mat-icon>toggle_on</mat-icon>
                Boolean Filters
              </h4>
              <div class="filter-group">
                <label class="filter-label">Active</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Active</mat-label>
                  <mat-select
                    [value]="filters().active"
                    (selectionChange)="onFilterChange('active', $event.value)"
                  >
                    <mat-option value="">All</mat-option>
                    <mat-option [value]="true">Yes</mat-option>
                    <mat-option [value]="false">No</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>


            <!-- String Filters -->
            <div class="filter-grid">
              <h4 class="section-header">
                <mat-icon>text_fields</mat-icon>
                Text Filters
              </h4>
              <div class="filter-group">
                <label class="filter-label">Name</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Name</mat-label>
                  <input
                    matInput
                    type="text"
                    [value]="filters().name || ''"
                    (input)="onFilterChange('name', $event)"
                    placeholder="Enter name"
                  />
                </mat-form-field>
              </div>
              <div class="filter-group">
                <label class="filter-label">Email</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Email</mat-label>
                  <input
                    matInput
                    type="text"
                    [value]="filters().email || ''"
                    (input)="onFilterChange('email', $event)"
                    placeholder="Enter email address"
                  />
                </mat-form-field>
              </div>
              <div class="filter-group">
                <label class="filter-label">Country</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Country</mat-label>
                  <input
                    matInput
                    type="text"
                    [value]="filters().country || ''"
                    (input)="onFilterChange('country', $event)"
                    placeholder="Enter country"
                  />
                </mat-form-field>
              </div>
            </div>


            <!-- Date Filters (Date only, no time) -->
            <div class="date-filters-section">
              <h4 class="section-header">
                <mat-icon>event</mat-icon>
                Date Filters
              </h4>
              <div class="date-filters-grid">
                <div class="date-filter-group">
                  <label class="filter-label">Birth Date</label>
                  <app-date-range-filter
                    fieldName="birth_date"
                    label="Birth Date"
                    [isDateTime]="false"
                    (filterChange)="onDateFilterChange($event)"
                  ></app-date-range-filter>
                </div>
              </div>
            </div>

            <!-- DateTime Filters (Date + Time) -->
            <div class="date-filters-section">
              <h4 class="section-header">
                <mat-icon>schedule</mat-icon>
                DateTime Filters
              </h4>
              <div class="date-filters-grid">
                <div class="date-filter-group">
                  <label class="filter-label">Updated At</label>
                  <app-date-range-filter
                    fieldName="updated_at"
                    label="Updated At"
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
      @if (authorsService.loading()) {
      <div class="loading-container">
        <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
        <p>Loading Authors...</p>
      </div>
      }

      <!-- Error State -->
      @if (authorsService.error()) {
      <mat-card class="error-card">
        <mat-card-content>
          <div class="error-content">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ authorsService.error() \}}</p>
            <button mat-button color="primary" (click)="retry()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
        </mat-card-content>
      </mat-card>
      }

      <!-- Data Table -->
      @if (!authorsService.loading() && !authorsService.error()) {
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
                [disabled]="authorsService.loading()"
                matTooltip="Delete selected items"
              >
                <mat-icon>delete</mat-icon>
                Delete
              </button>
              
              <!-- Bulk Status Update -->
              <button 
                mat-stroked-button 
                [matMenuTriggerFor]="bulkStatusMenu"
                [disabled]="authorsService.loading()"
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
                [disabled]="authorsService.loading()"
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
            <table mat-table [dataSource]="authorsService.authorsList()" class="authors-table">
              <!-- Selection Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox
                    [checked]="isAllSelected()"
                    [indeterminate]="hasSelected() && !isAllSelected()"
                    (change)="toggleSelectAll()"
                  ></mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let authors">
                  <mat-checkbox
                    [checked]="isSelected(authors.id)"
                    (change)="toggleSelect(authors.id)"
                  ></mat-checkbox>
                </td>
              </ng-container>

              <!-- name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let authors">
                  <span class="text-cell">{{ authors.name || '-' \}}</span>
                </td>
              </ng-container>

              <!-- email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let authors">
                  <span class="text-cell">{{ authors.email || '-' \}}</span>
                </td>
              </ng-container>

              <!-- bio Column -->
              <ng-container matColumnDef="bio">
                <th mat-header-cell *matHeaderCellDef>Bio</th>
                <td mat-cell *matCellDef="let authors">
                  <span class="text-cell">{{ authors.bio || '-' \}}</span>
                </td>
              </ng-container>

              <!-- birth_date Column -->
              <ng-container matColumnDef="birth_date">
                <th mat-header-cell *matHeaderCellDef>Birth_date</th>
                <td mat-cell *matCellDef="let authors">
                  <span class="text-cell">{{ authors.birth_date || '-' \}}</span>
                </td>
              </ng-container>

              <!-- country Column -->
              <ng-container matColumnDef="country">
                <th mat-header-cell *matHeaderCellDef>Country</th>
                <td mat-cell *matCellDef="let authors">
                  <span class="text-cell">{{ authors.country || '-' \}}</span>
                </td>
              </ng-container>

              <!-- active Column -->
              <ng-container matColumnDef="active">
                <th mat-header-cell *matHeaderCellDef>Active</th>
                <td mat-cell *matCellDef="let authors">
                  <mat-icon [color]="authors.active ? 'primary' : 'warn'" class="status-icon">
                    {{ authors.active ? 'check_circle' : 'cancel' \}}
                  </mat-icon>
                </td>
              </ng-container>


              <!-- Created Date Column -->
              <ng-container matColumnDef="created_at">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let authors">
                  {{ authors.created_at | date:'short' }}
                </td>
              </ng-container>
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let authors">
                  <button 
                    mat-icon-button 
                    (click)="openViewDialog(authors)"
                    matTooltip="View Details"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    (click)="openEditDialog(authors)"
                    matTooltip="Edit"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    color="warn"
                    (click)="deleteAuthor(authors)"
                    matTooltip="Delete"
                    [disabled]="authorsService.loading()"
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
          @if (authorsService.authorsList().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">inbox</mat-icon>
            <h3>No Authors found</h3>
            <p>Create your first Authors to get started</p>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Add Authors
            </button>
          </div>
          }

          <!-- Pagination -->
          @if (authorsService.authorsList().length > 0) {
          <mat-paginator
            [length]="authorsService.totalAuthor()"
            [pageSize]="authorsService.pageSize()"
            [pageSizeOptions]="[5, 10, 25, 50, 100]"
            [pageIndex]="authorsService.currentPage() - 1"
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
    .authors-list-container {
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

    .authors-table {
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
      .authors-list-container {
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
export class AuthorListComponent implements OnInit, OnDestroy {
  protected authorsService = inject(AuthorService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Search and filtering
  searchTerm = '';
  private searchTimeout: any;
  private filterTimeout: any;
  
  private filtersSignal = signal<Partial<ListAuthorQuery>>({});
  readonly filters = this.filtersSignal.asReadonly();

  // Quick filter state
  protected quickFilter = 'all';

  // Validation state
  private validationErrorsSignal = signal<Record<string, string>>({});
  readonly validationErrors = this.validationErrorsSignal.asReadonly();

  // Selection
  private selectedIdsSignal = signal<Set<string>>(new Set());
  readonly selectedItems = computed(() => 
    this.authorsService.authorsList().filter(item => this.selectedIdsSignal().has(item.id))
  );

  // Export configuration
  exportServiceAdapter: ExportService = {
    export: (options: ExportOptions) => this.authorsService.exportAuthor(options)
  };
  
  availableExportFields = [
    { key: 'id', label: 'Id' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'bio', label: 'Bio' },
    { key: 'birth_date', label: 'Birth date' },
    { key: 'country', label: 'Country' },
    { key: 'active', label: 'Active' },
    { key: 'created_at', label: 'Created at' },
    { key: 'updated_at', label: 'Updated at' },
  ];

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'name',
    'email',
    'bio',
    'birth_date',
    'country',
    'active',
    'created_at',
    'actions'
  ];

  ngOnInit() {
    this.loadAuthors();
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

  async loadAuthors() {
    const params: ListAuthorQuery = {
      page: this.authorsService.currentPage(),
      limit: this.authorsService.pageSize(),
      ...this.filters(),
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    await this.authorsService.loadAuthorList(params);
  }

  async retry() {
    this.authorsService.clearError();
    await this.loadAuthors();
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
      this.authorsService.setCurrentPage(1);
      this.loadAuthors();
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
    
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
  }

  clearSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTerm = '';
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
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
      this.authorsService.setCurrentPage(1);
      this.loadAuthors();
    }, 300);
  }

  // Immediate filter application (for button clicks)
  applyFiltersImmediate() {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
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
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
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
    this.authorsService.setCurrentPage(event.pageIndex + 1);
    this.authorsService.setPageSize(event.pageSize);
    this.loadAuthors();
  }

  // ===== SELECTION =====

  isSelected(id: string): boolean {
    return this.selectedIdsSignal().has(id);
  }

  hasSelected(): boolean {
    return this.selectedIdsSignal().size > 0;
  }

  isAllSelected(): boolean {
    const total = this.authorsService.authorsList().length;
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
      const allIds = this.authorsService.authorsList().map(item => item.id);
      this.selectedIdsSignal.set(new Set(allIds));
    }
  }

  clearSelection() {
    this.selectedIdsSignal.set(new Set());
  }

  // ===== DIALOG OPERATIONS =====

  openCreateDialog() {
    const dialogRef = this.dialog.open(AuthorCreateDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refresh the list to show the new item
        this.loadAuthors();
      }
    });
  }

  openEditDialog(authors: Author) {
    const dialogRef = this.dialog.open(AuthorEditDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      data: { authors } as AuthorEditDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // The service automatically updates the list with optimistic updates
        // No need to refresh unless there was an error
      }
    });
  }

  openViewDialog(authors: Author) {
    const dialogRef = this.dialog.open(AuthorViewDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { authors } as AuthorViewDialogData,
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
        this.filtersSignal.set({ active: true });
        break;
      case 'published':
        this.filtersSignal.set({ active: true });
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
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
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
    
    // String field filters
    if (filters.name !== undefined && filters.name !== '') {
      chips.push({ key: 'name', label: 'Name', value: String(filters.name) });
    }

    if (filters.email !== undefined && filters.email !== '') {
      chips.push({ key: 'email', label: 'Email', value: String(filters.email) });
    }

    if (filters.country !== undefined && filters.country !== '') {
      chips.push({ key: 'country', label: 'Country', value: String(filters.country) });
    }


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
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
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
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
  }

  protected resetFilters() {
    // Clear any pending filter operations
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.filtersSignal.set({});
    this.clearValidationErrors();
    
    // Reset filters should apply immediately
    this.authorsService.setCurrentPage(1);
    this.loadAuthors();
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

  async deleteAuthor(authors: Author) {
    if (confirm(`Are you sure you want to delete this authors?`)) {
      try {
        await this.authorsService.deleteAuthor(authors.id);
        this.snackBar.open('Authors deleted successfully', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        this.snackBar.open('Failed to delete Authors', 'Close', {
          duration: 5000,
        });
      }
    }
  }

  async bulkDelete() {
    const selectedIds = Array.from(this.selectedIdsSignal());
    if (selectedIds.length === 0) return;

    const confirmed = confirm(`Are you sure you want to delete ${selectedIds.length} Authors?`);
    if (!confirmed) return;

    try {
      await this.authorsService.bulkDeleteAuthor(selectedIds);
      this.clearSelection();
      this.snackBar.open(`${selectedIds.length} Authors deleted successfully`, 'Close', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Failed to delete Authors', 'Close', {
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
      
      await this.authorsService.bulkUpdateAuthor(items);
      this.clearSelection();
      this.snackBar.open(`${selectedIds.length} Authors status updated successfully`, 'Close', {
        duration: 3000,
      });
    } catch (error) {
      this.snackBar.open('Failed to update Authors status', 'Close', {
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
      this.snackBar.open('Failed to export Authors', 'Close', {
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
    return this.authorsService.authorsList().filter(item => {
      return item.active === true;
    }).length;
  }

  getDraftCount(): number {
    return this.authorsService.authorsList().filter(item => {
      return item.active === false;
    }).length;
  }

  getRecentCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.authorsService.authorsList().filter(item => 
      item.created_at && new Date(item.created_at) >= oneWeekAgo
    ).length;
  }
}