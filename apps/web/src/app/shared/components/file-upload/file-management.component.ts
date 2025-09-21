import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription, debounceTime, distinctUntilChanged, skip } from 'rxjs';

import { FileUploadService } from './file-upload.service';
import { ConfirmDialogComponent } from '../confirm-dialog.component';
import {
  UploadedFile,
  FileListQuery,
  FILE_UPLOAD_LIMITS,
  isViewableMimeType,
} from './file-upload.types';

@Component({
  selector: 'app-file-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  template: `
    <mat-card class="file-management-container">
      <mat-card-header class="file-management-header">
        <mat-card-title>File Management</mat-card-title>
        <mat-card-subtitle> Manage your uploaded files </mat-card-subtitle>
        <div class="header-actions">
          <button
            mat-icon-button
            (click)="refreshFiles()"
            [disabled]="isLoading()"
          >
            <mat-icon>refresh</mat-icon>
          </button>
          <button
            mat-icon-button
            [matMenuTriggerFor]="viewMenu"
            matTooltip="View options"
          >
            <mat-icon>view_module</mat-icon>
          </button>
          <mat-menu #viewMenu="matMenu">
            <button mat-menu-item (click)="toggleView('table')">
              <mat-icon>table_rows</mat-icon>
              Table View
            </button>
            <button mat-menu-item (click)="toggleView('grid')">
              <mat-icon>grid_view</mat-icon>
              Grid View
            </button>
          </mat-menu>
        </div>
      </mat-card-header>

      <!-- File Statistics -->
      <div *ngIf="fileStats()" class="file-stats">
        <div class="stats-grid">
          <div class="stat-card">
            <mat-icon>folder</mat-icon>
            <div>
              <div class="stat-value">{{ fileStats()!.totalFiles }}</div>
              <div class="stat-label">Total Files</div>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon>storage</mat-icon>
            <div>
              <div class="stat-value">
                {{ fileStats()!.totalSizeFormatted }}
              </div>
              <div class="stat-label">Total Size</div>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon>pie_chart</mat-icon>
            <div>
              <div class="stat-value">{{ fileStats()!.quotaPercentage }}%</div>
              <div class="stat-label">Quota Used</div>
            </div>
          </div>
        </div>
      </div>

      <mat-card-content>
        <!-- Filters and Search -->
        <form [formGroup]="filterForm" class="filter-form">
          <div class="filter-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search files</mat-label>
              <input
                matInput
                formControlName="search"
                placeholder="Search by filename"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="">All Categories</mat-option>
                <mat-option
                  *ngFor="let category of availableCategories"
                  [value]="category"
                >
                  {{ category | titlecase }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>File Type</mat-label>
              <mat-select formControlName="type">
                <mat-option value="">All Types</mat-option>
                <mat-option value="image">Images</mat-option>
                <mat-option value="document">Documents</mat-option>
                <mat-option value="video">Videos</mat-option>
                <mat-option value="audio">Audio</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="isPublic">
                <mat-option value="">All Files</mat-option>
                <mat-option [value]="true">Public</mat-option>
                <mat-option [value]="false">Private</mat-option>
              </mat-select>
            </mat-form-field>

            <button
              mat-stroked-button
              color="primary"
              (click)="clearFilters()"
              [disabled]="!hasActiveFilters()"
            >
              Clear Filters
            </button>
          </div>
        </form>

        <!-- Bulk Actions -->
        <div *ngIf="selectedFiles().length > 0" class="bulk-actions">
          <mat-chip-listbox>
            <mat-chip selected
              >{{ selectedFiles().length }} files selected</mat-chip
            >
          </mat-chip-listbox>
          <div class="bulk-action-buttons">
            <button mat-button (click)="bulkDelete()" color="warn">
              <mat-icon>delete</mat-icon>
              Delete Selected
            </button>
            <button mat-button (click)="bulkDownload()">
              <mat-icon>download</mat-icon>
              Download Selected
            </button>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div *ngIf="isLoading()" class="loading-container">
          <mat-progress-spinner
            mode="indeterminate"
            diameter="50"
          ></mat-progress-spinner>
          <p>Loading files...</p>
        </div>

        <!-- Table View -->
        <div
          *ngIf="viewMode() === 'table' && !isLoading()"
          class="table-container"
        >
          <table
            mat-table
            [dataSource]="dataSource"
            matSort
            (matSortChange)="onSortChange($event)"
          >
            <!-- Selection Column -->
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef>
                <mat-checkbox
                  [checked]="isAllSelected()"
                  [indeterminate]="hasSelection() && !isAllSelected()"
                  (change)="toggleAllSelection()"
                >
                </mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let file">
                <mat-checkbox
                  [checked]="isSelected(file)"
                  (change)="toggleSelection(file)"
                >
                </mat-checkbox>
              </td>
            </ng-container>

            <!-- Preview Column -->
            <ng-container matColumnDef="preview">
              <th mat-header-cell *matHeaderCellDef>Preview</th>
              <td mat-cell *matCellDef="let file">
                <div class="file-preview-cell">
                  <img
                    *ngIf="file.fileType === 'image'"
                    [src]="getDisplayThumbnailUrl(file)"
                    [alt]="file.originalName"
                    class="file-thumbnail"
                    loading="lazy"
                  />
                  <mat-icon
                    *ngIf="file.fileType !== 'image'"
                    class="file-type-icon"
                  >
                    {{ getFileIcon(file.mimeType) }}
                  </mat-icon>
                </div>
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="originalName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let file">
                <div class="file-name-cell">
                  <span class="file-name" [title]="file.originalName">{{
                    file.originalName
                  }}</span>
                  <div class="file-meta">
                    <mat-chip-set>
                      <mat-chip [class]="'category-' + file.fileCategory">{{
                        file.fileCategory
                      }}</mat-chip>
                      <mat-chip *ngIf="file.isPublic" class="public-chip"
                        >Public</mat-chip
                      >
                      <mat-chip *ngIf="file.isTemporary" class="temp-chip"
                        >Temporary</mat-chip
                      >
                    </mat-chip-set>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Size Column -->
            <ng-container matColumnDef="fileSize">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Size</th>
              <td mat-cell *matCellDef="let file">
                {{ formatFileSize(file.fileSize) }}
              </td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="mimeType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let file">
                <span class="file-type">{{ file.mimeType }}</span>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="processingStatus">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let file">
                <mat-chip [class]="'status-' + file.processingStatus">
                  <mat-icon *ngIf="file.processingStatus === 'completed'"
                    >check</mat-icon
                  >
                  <mat-icon *ngIf="file.processingStatus === 'processing'"
                    >hourglass_empty</mat-icon
                  >
                  <mat-icon *ngIf="file.processingStatus === 'failed'"
                    >error</mat-icon
                  >
                  {{ file.processingStatus | titlecase }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Upload Date Column -->
            <ng-container matColumnDef="uploadedAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>
                Uploaded
              </th>
              <td mat-cell *matCellDef="let file">
                {{ file.uploadedAt | date: 'short' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let file">
                <button mat-icon-button [matMenuTriggerFor]="fileMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #fileMenu="matMenu">
                  <button mat-menu-item (click)="downloadFile(file)">
                    <mat-icon>download</mat-icon>
                    Download
                  </button>
                  <button mat-menu-item (click)="viewFile(file)">
                    <mat-icon>visibility</mat-icon>
                    View
                  </button>
                  <button mat-menu-item (click)="copyLink(file)">
                    <mat-icon>link</mat-icon>
                    Copy Link
                  </button>
                  <mat-divider></mat-divider>
                  <button
                    mat-menu-item
                    (click)="deleteFile(file)"
                    class="delete-action"
                  >
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <!-- No Data Message -->
          <div *ngIf="files().length === 0" class="no-data">
            <mat-icon>folder_open</mat-icon>
            <h3>No files found</h3>
            <p>
              {{
                hasActiveFilters()
                  ? 'Try adjusting your filters'
                  : 'Upload some files to get started'
              }}
            </p>
          </div>
        </div>

        <!-- Grid View -->
        <div
          *ngIf="viewMode() === 'grid' && !isLoading()"
          class="grid-container"
        >
          <div class="file-grid">
            <div
              *ngFor="let file of files(); trackBy: trackByFileId"
              class="file-card"
              [class.selected]="isSelected(file)"
            >
              <!-- Selection Checkbox -->
              <div class="card-selection">
                <mat-checkbox
                  [checked]="isSelected(file)"
                  (change)="toggleSelection(file)"
                >
                </mat-checkbox>
              </div>

              <!-- File Preview -->
              <div class="card-preview">
                <img
                  *ngIf="file.fileType === 'image'"
                  [src]="getDisplayThumbnailUrl(file)"
                  [alt]="file.originalName"
                  class="grid-thumbnail"
                  loading="lazy"
                />
                <div *ngIf="file.fileType !== 'image'" class="grid-file-icon">
                  <mat-icon>{{ getFileIcon(file.mimeType) }}</mat-icon>
                </div>
              </div>

              <!-- File Info -->
              <div class="card-info">
                <h4 class="card-title" [title]="file.originalName">
                  {{ file.originalName }}
                </h4>
                <p class="card-meta">
                  {{ formatFileSize(file.fileSize) }} •
                  {{ file.uploadedAt | date: 'short' }}
                </p>

                <div class="card-tags">
                  <mat-chip-set>
                    <mat-chip [class]="'category-' + file.fileCategory">{{
                      file.fileCategory
                    }}</mat-chip>
                    <mat-chip *ngIf="file.isPublic" class="public-chip"
                      >Public</mat-chip
                    >
                  </mat-chip-set>
                </div>
              </div>

              <!-- Actions -->
              <div class="card-actions">
                <button
                  mat-icon-button
                  (click)="downloadFile(file)"
                  matTooltip="Download"
                >
                  <mat-icon>download</mat-icon>
                </button>
                <button
                  mat-icon-button
                  (click)="viewFile(file)"
                  matTooltip="View"
                >
                  <mat-icon>visibility</mat-icon>
                </button>
                <button
                  mat-icon-button
                  [matMenuTriggerFor]="cardMenu"
                  matTooltip="More options"
                >
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #cardMenu="matMenu">
                  <button mat-menu-item (click)="copyLink(file)">
                    <mat-icon>link</mat-icon>
                    Copy Link
                  </button>
                  <mat-divider></mat-divider>
                  <button
                    mat-menu-item
                    (click)="deleteFile(file)"
                    class="delete-action"
                  >
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                </mat-menu>
              </div>
            </div>
          </div>

          <!-- No Data Message -->
          <div *ngIf="files().length === 0" class="no-data">
            <mat-icon>folder_open</mat-icon>
            <h3>No files found</h3>
            <p>
              {{
                hasActiveFilters()
                  ? 'Try adjusting your filters'
                  : 'Upload some files to get started'
              }}
            </p>
          </div>
        </div>

        <!-- Pagination -->
        <mat-paginator
          *ngIf="!isLoading()"
          [length]="totalFiles()"
          [pageSize]="pageSize()"
          [pageIndex]="currentPage()"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (page)="onPageChange($event)"
          showFirstLastButtons
        >
        </mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .file-management-container {
        width: 100%;
      }

      .file-management-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .file-stats {
        padding: 1rem;
        background-color: #f5f5f5;
        border-bottom: 1px solid #e0e0e0;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .stat-card mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: #2196f3;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #333;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #666;
      }

      .filter-form {
        margin-bottom: 1rem;
      }

      .filter-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr auto;
        gap: 1rem;
        align-items: center;
      }

      .search-field {
        min-width: 250px;
      }

      .bulk-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background-color: #e3f2fd;
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      .bulk-action-buttons {
        display: flex;
        gap: 0.5rem;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        gap: 1rem;
      }

      .table-container {
        overflow-x: auto;
      }

      .file-preview-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
      }

      .file-thumbnail {
        width: 32px;
        height: 32px;
        object-fit: cover;
        border-radius: 4px;
      }

      .file-type-icon {
        color: #666;
      }

      .file-name-cell {
        max-width: 300px;
      }

      .file-name {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500;
        margin-bottom: 0.25rem;
      }

      .file-meta {
        margin-top: 0.25rem;
      }

      .file-type {
        font-family: monospace;
        font-size: 0.875rem;
        color: #666;
      }

      .delete-action {
        color: #f44336 !important;
      }

      .no-data {
        text-align: center;
        padding: 3rem;
        color: #666;
      }

      .no-data mat-icon {
        font-size: 4rem;
        height: 4rem;
        width: 4rem;
        color: #ccc;
        margin-bottom: 1rem;
      }

      .grid-container {
        margin-top: 1rem;
      }

      .file-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }

      .file-card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        transition: all 0.3s ease;
        position: relative;
      }

      .file-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .file-card.selected {
        border-color: #2196f3;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
      }

      .card-selection {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        z-index: 2;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        padding: 0.25rem;
      }

      .card-preview {
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        position: relative;
      }

      .grid-thumbnail {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .grid-file-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .grid-file-icon mat-icon {
        font-size: 4rem;
        height: 4rem;
        width: 4rem;
        color: #666;
      }

      .card-info {
        padding: 1rem;
      }

      .card-title {
        font-size: 1rem;
        font-weight: 500;
        margin: 0 0 0.5rem 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .card-meta {
        font-size: 0.875rem;
        color: #666;
        margin: 0 0 0.5rem 0;
      }

      .card-tags {
        margin-top: 0.5rem;
      }

      .card-actions {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        display: flex;
        gap: 0.25rem;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        padding: 0.25rem;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .file-card:hover .card-actions {
        opacity: 1;
      }

      /* Chip Styles */
      .category-image {
        background-color: #4caf50;
        color: white;
      }
      .category-document {
        background-color: #2196f3;
        color: white;
      }
      .category-avatar {
        background-color: #9c27b0;
        color: white;
      }
      .category-media {
        background-color: #ff9800;
        color: white;
      }
      .public-chip {
        background-color: #00bcd4;
        color: white;
      }
      .temp-chip {
        background-color: #ff5722;
        color: white;
      }
      .status-completed {
        background-color: #4caf50;
        color: white;
      }
      .status-processing {
        background-color: #ff9800;
        color: white;
      }
      .status-failed {
        background-color: #f44336;
        color: white;
      }

      /* Dark theme adjustments */
      :host-context(.dark) .file-stats {
        background-color: #303030;
        border-color: #666;
      }

      :host-context(.dark) .stat-card {
        background-color: #424242;
        color: white;
      }

      :host-context(.dark) .bulk-actions {
        background-color: #1e3a5f;
      }

      :host-context(.dark) .file-card {
        background-color: #424242;
        border-color: #666;
      }

      :host-context(.dark) .card-preview {
        background-color: #303030;
      }

      @media (max-width: 768px) {
        .filter-row {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        .bulk-actions {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .file-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class FileManagementComponent implements OnInit, OnDestroy {
  @Input() showStats = true;
  @Input() allowBulkActions = true;
  @Input() defaultPageSize = 25;

  @Output() fileSelected = new EventEmitter<UploadedFile>();
  @Output() filesDeleted = new EventEmitter<UploadedFile[]>();

  private fileUploadService = inject(FileUploadService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private subscription = new Subscription();

  // Signals
  private _files = signal<UploadedFile[]>([]);
  private _isLoading = signal(false);
  private _currentPage = signal(0);
  private _pageSize = signal(this.defaultPageSize);
  private _totalFiles = signal(0);
  private _selectedFiles = signal<UploadedFile[]>([]);
  private _viewMode = signal<'table' | 'grid'>('table');

  readonly files = this._files.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalFiles = this._totalFiles.asReadonly();
  readonly selectedFiles = this._selectedFiles.asReadonly();
  readonly viewMode = this._viewMode.asReadonly();
  readonly fileStats = this.fileUploadService.fileStats;

  readonly availableCategories = FILE_UPLOAD_LIMITS.ALLOWED_CATEGORIES;

  // Filter form
  filterForm: FormGroup = this.fb.group({
    search: [''],
    category: [''],
    type: [''],
    isPublic: [''],
    sort: ['uploadedAt'],
    order: ['desc'],
  });

  // Table configuration
  displayedColumns = [
    'select',
    'preview',
    'originalName',
    'fileSize',
    'mimeType',
    'processingStatus',
    'uploadedAt',
    'actions',
  ];
  dataSource = new MatTableDataSource<UploadedFile>();

  // Computed properties
  readonly hasActiveFilters = computed(() => {
    const formValue = this.filterForm.value;
    return Object.values(formValue).some(
      (value) => value !== '' && value !== null && value !== undefined,
    );
  });

  readonly hasSelection = computed(() => this._selectedFiles().length > 0);
  readonly isAllSelected = computed(() => {
    const files = this._files();
    const selected = this._selectedFiles();
    return files.length > 0 && selected.length === files.length;
  });

  ngOnInit() {
    this.setupFilterSubscription();
    this.loadFiles();

    if (this.showStats) {
      this.loadFileStats();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private setupFilterSubscription() {
    this.subscription.add(
      this.filterForm.valueChanges
        .pipe(
          skip(1), // Skip initial value เพื่อป้องกัน immediate trigger
          debounceTime(300),
          distinctUntilChanged(),
        )
        .subscribe((value) => {
          // ป้องกัน infinite loop โดยตรวจสอบว่า loading อยู่หรือไม่
          if (!this._isLoading()) {
            this._currentPage.set(0);
            this.loadFiles();
          }
        }),
    );
  }

  loadFiles() {
    this._isLoading.set(true);

    const query: FileListQuery = {
      page: this._currentPage() + 1, // API uses 1-based pagination
      limit: this._pageSize(),
      ...this.filterForm.value,
    };

    // Remove empty values
    Object.keys(query).forEach((key) => {
      if (
        query[key as keyof FileListQuery] === '' ||
        query[key as keyof FileListQuery] == null
      ) {
        delete query[key as keyof FileListQuery];
      }
    });

    this.subscription.add(
      this.fileUploadService.getFiles(query).subscribe({
        next: (response) => {
          this._files.set(response.data);
          this._totalFiles.set(response.pagination.total);
          this.dataSource.data = response.data;
          this._isLoading.set(false);
        },
        error: (error) => {
          this.snackBar.open(
            'Failed to load files: ' + error.message,
            'Close',
            { duration: 5000 },
          );
          this._isLoading.set(false);
        },
      }),
    );
  }

  loadFileStats() {
    this.subscription.add(
      this.fileUploadService.getFileStats().subscribe({
        error: (error) => {
          console.warn('Failed to load file statistics:', error);
        },
      }),
    );
  }

  refreshFiles() {
    this.loadFiles();
    if (this.showStats) {
      this.loadFileStats();
    }
  }

  clearFilters() {
    // Reset form โดยไม่ trigger valueChanges เพื่อป้องกัน infinite loop
    this.filterForm.reset(
      {
        search: '',
        category: '',
        type: '',
        isPublic: '',
        sort: 'uploadedAt',
        order: 'desc',
      },
      { emitEvent: false },
    );

    // เรียก loadFiles() โดยตรงแทน
    this._currentPage.set(0);
    this.loadFiles();
  }

  toggleView(mode: 'table' | 'grid') {
    this._viewMode.set(mode);
  }

  onPageChange(event: PageEvent) {
    this._currentPage.set(event.pageIndex);
    this._pageSize.set(event.pageSize);
    this.loadFiles();
  }

  onSortChange(sort: Sort) {
    // ปรับปรุง form โดยไม่ trigger valueChanges เพื่อป้องกัน infinite loop
    this.filterForm.patchValue(
      {
        sort: sort.active || 'uploadedAt',
        order: sort.direction || 'desc',
      },
      { emitEvent: false },
    ); // เพิ่ม emitEvent: false เพื่อไม่ให้ trigger valueChanges

    // เรียก loadFiles() โดยตรงแทน
    this._currentPage.set(0);
    this.loadFiles();
  }

  toggleSelection(file: UploadedFile) {
    const selected = this._selectedFiles();
    const index = selected.findIndex((f) => f.id === file.id);

    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(file);
    }

    this._selectedFiles.set([...selected]);
  }

  toggleAllSelection() {
    if (this.isAllSelected()) {
      this._selectedFiles.set([]);
    } else {
      this._selectedFiles.set([...this._files()]);
    }
  }

  isSelected(file: UploadedFile): boolean {
    return this._selectedFiles().some((f) => f.id === file.id);
  }

  downloadFile(file: UploadedFile) {
    // Use signed download URL if available, otherwise fallback to regular download
    if (file.signedUrls?.download) {
      window.open(file.signedUrls.download, '_blank');
    } else {
      // Generate signed URL for download
      this.subscription.add(
        this.fileUploadService
          .generateSignedUrl(file.id, { expiresIn: 3600 })
          .subscribe({
            next: (response) => {
              window.open(response.data.urls.download, '_blank');
            },
            error: (error) => {
              this.snackBar.open(
                'Failed to generate download link: ' + error.message,
                'Close',
                {
                  duration: 5000,
                },
              );
            },
          }),
      );
    }
  }

  viewFile(file: UploadedFile) {
    // Smart View Logic: Check if file is viewable, otherwise force download
    const isViewable = isViewableMimeType(file.mimeType);

    if (!isViewable) {
      // File cannot be viewed inline, show message and offer download instead
      this.snackBar.open(
        `This file type (${file.mimeType}) cannot be previewed. Click Download to save the file.`,
        'Close',
        { duration: 5000 },
      );
      // Automatically trigger download for non-viewable files
      this.downloadFile(file);
      return;
    }

    // Use signed view URL if available, otherwise fallback to regular view
    if (file.signedUrls?.view) {
      window.open(file.signedUrls.view, '_blank');
    } else {
      // Generate signed URL for view
      this.subscription.add(
        this.fileUploadService
          .generateSignedUrl(file.id, { expiresIn: 3600 })
          .subscribe({
            next: (response) => {
              window.open(response.data.urls.view, '_blank');
            },
            error: (error) => {
              this.snackBar.open(
                'Failed to generate view link: ' + error.message,
                'Close',
                {
                  duration: 5000,
                },
              );
            },
          }),
      );
    }
    this.fileSelected.emit(file);
  }

  copyLink(file: UploadedFile) {
    // Use signed download URL if available, otherwise generate one
    if (file.signedUrls?.download) {
      navigator.clipboard.writeText(file.signedUrls.download).then(() => {
        this.snackBar.open(
          'Signed download link copied to clipboard',
          'Close',
          {
            duration: 2000,
          },
        );
      });
    } else {
      // Generate signed URL for sharing
      this.subscription.add(
        this.fileUploadService
          .generateSignedUrl(file.id, { expiresIn: 86400 })
          .subscribe({
            next: (response) => {
              navigator.clipboard
                .writeText(response.data.urls.download)
                .then(() => {
                  this.snackBar.open(
                    'Signed download link copied to clipboard',
                    'Close',
                    {
                      duration: 2000,
                    },
                  );
                });
            },
            error: (error) => {
              this.snackBar.open(
                'Failed to generate shareable link: ' + error.message,
                'Close',
                {
                  duration: 5000,
                },
              );
            },
          }),
      );
    }
  }

  deleteFile(file: UploadedFile) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete File',
        message: `Are you sure you want to delete "${file.originalName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.subscription.add(
          this.fileUploadService.deleteFile(file.id).subscribe({
            next: () => {
              this.snackBar.open('File deleted successfully', 'Close', {
                duration: 3000,
              });
              this.refreshFiles();
              this.filesDeleted.emit([file]);
            },
            error: (error) => {
              this.snackBar.open(
                'Failed to delete file: ' + error.message,
                'Close',
                { duration: 5000 },
              );
            },
          }),
        );
      }
    });
  }

  bulkDelete() {
    const selected = this._selectedFiles();
    if (selected.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Files',
        message: `Are you sure you want to delete ${selected.length} selected files? This action cannot be undone.`,
        confirmText: 'Delete All',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._isLoading.set(true);
        const deletePromises = selected.map((file) =>
          this.fileUploadService.deleteFile(file.id).toPromise(),
        );

        Promise.allSettled(deletePromises)
          .then(() => {
            this.snackBar.open(`Deleted ${selected.length} files`, 'Close', {
              duration: 3000,
            });
            this._selectedFiles.set([]);
            this.refreshFiles();
            this.filesDeleted.emit(selected);
          })
          .catch((_error) => {
            this.snackBar.open('Some files could not be deleted', 'Close', {
              duration: 5000,
            });
            this.refreshFiles();
          });
      }
    });
  }

  bulkDownload() {
    const selected = this._selectedFiles();
    selected.forEach((file) => {
      this.downloadFile(file);
    });
  }

  formatFileSize = this.fileUploadService.formatFileSize;

  getFileIcon(mimeType: string): string {
    const category = this.fileUploadService.getFileTypeCategory(mimeType);

    switch (category) {
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'audio':
        return 'audiotrack';
      case 'pdf':
        return 'picture_as_pdf';
      case 'document':
        return 'description';
      case 'spreadsheet':
        return 'grid_on';
      case 'archive':
        return 'archive';
      default:
        return 'insert_drive_file';
    }
  }

  trackByFileId(index: number, file: UploadedFile): string {
    return file.id;
  }

  /**
   * Get display thumbnail URL (uses signed URLs directly)
   */
  getDisplayThumbnailUrl(file: UploadedFile): string {
    // Use signed thumbnail URL directly - CORS is configured to allow this
    if (file.signedUrls?.thumbnail) {
      return file.signedUrls.thumbnail;
    }

    // If no signed URL, return empty (should not happen in current implementation)
    return '';
  }
}
