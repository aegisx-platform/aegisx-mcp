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
import { MatOptionModule } from '@angular/material/core';

import { NotificationService } from '../services/notifications.service';
import {
  Notification,
  ListNotificationQuery,
} from '../types/notification.types';
import { NotificationCreateDialogComponent } from './notifications-create.dialog';
import {
  NotificationEditDialogComponent,
  NotificationEditDialogData,
} from './notifications-edit.dialog';
import {
  NotificationViewDialogComponent,
  NotificationViewDialogData,
} from './notifications-view.dialog';

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
  ],
  template: `
    <div class="notifications-list-container">
      <!-- Header -->
      <mat-toolbar color="primary" class="page-header">
        <h1 class="page-title">Notifications</h1>
        <span class="spacer"></span>
        <button
          mat-raised-button
          color="accent"
          (click)="openCreateDialog()"
          [disabled]="notificationsService.loading()"
        >
          <mat-icon>add</mat-icon>
          Add Notifications
        </button>
      </mat-toolbar>

      <mat-card class="search-card">
        <mat-card-content>
          <!-- Search and Filters -->
          <div class="search-container">
            <div class="search-group">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search Notifications</mat-label>
                <input
                  matInput
                  placeholder="Search by title, name, description"
                  [(ngModel)]="searchTerm"
                  (input)="onSearchChange()"
                  (keyup.enter)="onSearchButtonClick()"
                />
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
              <div class="search-buttons">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="onSearchButtonClick()"
                  [disabled]="notificationsService.loading()"
                  class="search-btn"
                >
                  <mat-icon>search</mat-icon>
                  Search
                </button>
                <button
                  mat-stroked-button
                  (click)="clearSearch()"
                  [disabled]="
                    !searchTerm.trim() || notificationsService.loading()
                  "
                  class="clear-search-btn"
                >
                  <mat-icon>clear</mat-icon>
                  Clear
                </button>
              </div>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Id</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().id"
                (input)="applyFilters()"
              />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>User Id</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().user_id"
                (input)="applyFilters()"
              />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select
                [(ngModel)]="filters().type"
                (selectionChange)="applyFilters()"
              >
                <mat-option value="">All</mat-option>
                <mat-option value="info">Info</mat-option>
                <mat-option value="warning">Warning</mat-option>
                <mat-option value="error">Error</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().title"
                (input)="applyFilters()"
              />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Message</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().message"
                (input)="applyFilters()"
              />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Data</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().data"
                (input)="applyFilters()"
              />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Action Url</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().action_url"
                (input)="applyFilters()"
              />
            </mat-form-field>
            <div class="checkbox-filter">
              <mat-checkbox
                [(ngModel)]="filters().read"
                (change)="applyFilters()"
              >
                Read
              </mat-checkbox>
            </div>
            <mat-form-field appearance="outline">
              <mat-label>Read At</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().read_at"
                (input)="applyFilters()"
              />
            </mat-form-field>
            <div class="checkbox-filter">
              <mat-checkbox
                [(ngModel)]="filters().archived"
                (change)="applyFilters()"
              >
                Archived
              </mat-checkbox>
            </div>
            <mat-form-field appearance="outline">
              <mat-label>Archived At</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().archived_at"
                (input)="applyFilters()"
              />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select
                [(ngModel)]="filters().priority"
                (selectionChange)="applyFilters()"
              >
                <mat-option value="">All</mat-option>
                <mat-option value="low">Low</mat-option>
                <mat-option value="normal">Normal</mat-option>
                <mat-option value="high">High</mat-option>
                <mat-option value="urgent">Urgent</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Expires At</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().expires_at"
                (input)="applyFilters()"
              />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Created At</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().created_at"
                (input)="applyFilters()"
              />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Updated At</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="filters().updated_at"
                (input)="applyFilters()"
              />
            </mat-form-field>

            <button
              mat-stroked-button
              (click)="clearFilters()"
              [disabled]="!hasActiveFilters()"
            >
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="notificationsService.loading()" class="loading-container">
        <mat-progress-spinner
          mode="indeterminate"
          diameter="50"
        ></mat-progress-spinner>
        <p>Loading Notifications...</p>
      </div>

      <!-- Error State -->
      <mat-card *ngIf="notificationsService.error()" class="error-card">
        <mat-card-content>
          <div class="error-content">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ notificationsService.error() }}</p>
            <button mat-button color="primary" (click)="retry()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Data Table -->
      <mat-card
        *ngIf="!notificationsService.loading() && !notificationsService.error()"
        class="table-card"
      >
        <mat-card-content>
          <!-- Bulk Actions -->
          <div *ngIf="hasSelected()" class="bulk-actions">
            <span class="selection-info"
              >{{ selectedItems().length }} selected</span
            >
            <div class="bulk-buttons">
              <button
                mat-stroked-button
                color="warn"
                (click)="bulkDelete()"
                [disabled]="notificationsService.loading()"
              >
                <mat-icon>delete</mat-icon>
                Delete Selected
              </button>
              <button mat-stroked-button (click)="clearSelection()">
                <mat-icon>clear</mat-icon>
                Clear Selection
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="table-container">
            <table
              mat-table
              [dataSource]="notificationsService.notificationsList()"
              class="notifications-table"
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
                <td mat-cell *matCellDef="let notifications">
                  <mat-checkbox
                    [checked]="isSelected(notifications.id)"
                    (change)="toggleSelect(notifications.id)"
                  ></mat-checkbox>
                </td>
              </ng-container>

              <!-- user_id Column -->
              <ng-container matColumnDef="user_id">
                <th mat-header-cell *matHeaderCellDef>User Id</th>
                <td mat-cell *matCellDef="let notifications">
                  {{ notifications.user_id }}
                </td>
              </ng-container>

              <!-- type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let notifications">
                  {{ notifications.type }}
                </td>
              </ng-container>

              <!-- title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let notifications">
                  {{ notifications.title }}
                </td>
              </ng-container>

              <!-- message Column -->
              <ng-container matColumnDef="message">
                <th mat-header-cell *matHeaderCellDef>Message</th>
                <td mat-cell *matCellDef="let notifications">
                  <span [title]="notifications.message">
                    {{ notifications.message | slice: 0 : 50
                    }}<span *ngIf="notifications.message.length > 50">...</span>
                  </span>
                </td>
              </ng-container>

              <!-- data Column -->
              <ng-container matColumnDef="data">
                <th mat-header-cell *matHeaderCellDef>Data</th>
                <td mat-cell *matCellDef="let notifications">
                  {{ notifications.data }}
                </td>
              </ng-container>

              <!-- action_url Column -->
              <ng-container matColumnDef="action_url">
                <th mat-header-cell *matHeaderCellDef>Action Url</th>
                <td mat-cell *matCellDef="let notifications">
                  {{ notifications.action_url }}
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
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          <!-- Empty State -->
          <div
            *ngIf="notificationsService.notificationsList().length === 0"
            class="empty-state"
          >
            <mat-icon class="empty-icon">inbox</mat-icon>
            <h3>No Notifications found</h3>
            <p>Create your first Notifications to get started</p>
            <button
              mat-raised-button
              color="primary"
              (click)="openCreateDialog()"
            >
              <mat-icon>add</mat-icon>
              Add Notifications
            </button>
          </div>

          <!-- Pagination -->
          <mat-paginator
            *ngIf="notificationsService.notificationsList().length > 0"
            [length]="notificationsService.totalNotification()"
            [pageSize]="notificationsService.pageSize()"
            [pageSizeOptions]="[5, 10, 25, 50, 100]"
            [pageIndex]="notificationsService.currentPage() - 1"
            (page)="onPageChange($event)"
            showFirstLastButtons
          ></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
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

      .search-card {
        margin-bottom: 16px;
      }

      .search-container {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }

      .search-group {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 300px;
      }

      .search-field {
        flex: 1;
        min-width: 250px;
      }

      .search-buttons {
        display: flex;
        gap: 8px;
        align-items: center;
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
      }
    `,
  ],
})
export class NotificationListComponent implements OnInit, OnDestroy {
  protected notificationsService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Search and filtering
  searchTerm = '';
  private searchTimeout: any;

  private filtersSignal = signal<Partial<ListNotificationQuery>>({});
  readonly filters = this.filtersSignal.asReadonly();

  // Selection
  private selectedIdsSignal = signal<Set<string>>(new Set());
  readonly selectedItems = computed(() => Array.from(this.selectedIdsSignal()));

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'user_id',
    'type',
    'title',
    'message',
    'data',
    'action_url',
    'actions',
  ];

  ngOnInit() {
    this.loadNotifications();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
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
    // Manual search - immediate execution
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

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

  applyFilters() {
    this.notificationsService.setCurrentPage(1);
    this.loadNotifications();
  }

  clearFilters() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTerm = '';
    this.filtersSignal.set({});
    this.notificationsService.setCurrentPage(1);
    this.loadNotifications();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.length > 0 || Object.keys(this.filters()).length > 0;
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
      const allIds = this.notificationsService
        .notificationsList()
        .map((item) => item.id);
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

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedIds.length} Notifications?`,
    );
    if (!confirmed) return;

    try {
      await this.notificationsService.bulkDeleteNotification(selectedIds);
      this.clearSelection();
      this.snackBar.open(
        `${selectedIds.length} Notifications deleted successfully`,
        'Close',
        {
          duration: 3000,
        },
      );
    } catch (error) {
      this.snackBar.open('Failed to delete Notifications', 'Close', {
        duration: 5000,
      });
    }
  }
}
