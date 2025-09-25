import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FileUploadService } from './file-upload.service';
import {
  FileUploadOptions,
  FileUploadProgress,
  FileValidationResult,
  UploadedFile,
  FileUploadResponse,
  FILE_UPLOAD_LIMITS,
} from './file-upload.types';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatInputModule,
    MatButtonToggleModule,
  ],
  template: `
    <mat-card class="file-upload-container">
      <mat-card-header>
        <mat-card-title>File Upload</mat-card-title>
        <mat-card-subtitle>
          Max {{ maxFiles }} files, {{ formatFileSize(maxFileSize) }} each
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Upload Options Form -->
        <form
          [formGroup]="optionsForm"
          class="upload-options mb-4"
          *ngIf="showOptions"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="">Select category</mat-option>
                <mat-option
                  *ngFor="let category of availableCategories"
                  [value]="category"
                >
                  {{ category | titlecase }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <div class="flex items-center space-x-4">
              <mat-checkbox formControlName="isPublic">
                Public access
              </mat-checkbox>
              <mat-checkbox formControlName="isTemporary">
                Temporary file
              </mat-checkbox>
              <mat-checkbox formControlName="allowDuplicates">
                Allow duplicates
              </mat-checkbox>
            </div>

            <mat-form-field
              appearance="outline"
              *ngIf="optionsForm.get('isTemporary')?.value"
            >
              <mat-label>Expires in (hours)</mat-label>
              <input
                matInput
                type="number"
                min="1"
                max="8760"
                formControlName="expiresIn"
              />
            </mat-form-field>
          </div>
        </form>

        <!-- Drag and Drop Area -->
        <div
          class="drop-zone"
          [class.drag-over]="isDragOver()"
          [class.has-files]="selectedFiles().length > 0"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="openFileDialog()"
        >
          <input
            #fileInput
            type="file"
            [multiple]="multiple"
            [accept]="acceptedTypes.join(',')"
            (change)="onFileSelect($event)"
            class="hidden"
          />

          <!-- Empty State -->
          <div *ngIf="selectedFiles().length === 0" class="drop-zone-empty">
            <mat-icon class="upload-icon">cloud_upload</mat-icon>
            <h3
              class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2"
            >
              Drop files here or click to browse
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Supports: {{ acceptedTypesDisplay() }}
            </p>
            <mat-button-toggle-group class="mb-4" *ngIf="multiple">
              <button mat-stroked-button color="primary">
                <mat-icon>add</mat-icon>
                Choose Files
              </button>
            </mat-button-toggle-group>
          </div>

          <!-- File Preview Area -->
          <div *ngIf="selectedFiles().length > 0" class="file-preview-grid">
            <div
              *ngFor="
                let fileProgress of uploadProgress();
                trackBy: trackByFile
              "
              class="file-preview-item"
              [class.upload-success]="fileProgress.status === 'completed'"
              [class.upload-error]="fileProgress.status === 'error'"
            >
              <!-- File Preview -->
              <div class="file-preview">
                <img
                  *ngIf="fileProgress.preview"
                  [src]="fileProgress.preview"
                  [alt]="fileProgress.file.name"
                  class="preview-image"
                />
                <div *ngIf="!fileProgress.preview" class="file-icon">
                  <mat-icon>{{ getFileIcon(fileProgress.file.type) }}</mat-icon>
                </div>
              </div>

              <!-- File Info -->
              <div class="file-info">
                <h4 class="file-name" [title]="fileProgress.file.name">
                  {{ fileProgress.file.name }}
                </h4>
                <p class="file-size">
                  {{ formatFileSize(fileProgress.file.size) }}
                </p>

                <!-- Progress Bar -->
                <mat-progress-bar
                  *ngIf="fileProgress.status === 'uploading'"
                  mode="determinate"
                  [value]="fileProgress.progress"
                  class="mt-2"
                >
                </mat-progress-bar>

                <!-- Status Icons -->
                <div class="status-indicator">
                  <mat-icon
                    *ngIf="fileProgress.status === 'completed'"
                    class="text-green-500"
                  >
                    check_circle
                  </mat-icon>
                  <mat-icon
                    *ngIf="fileProgress.status === 'error'"
                    class="text-red-500"
                  >
                    error
                  </mat-icon>
                  <mat-icon
                    *ngIf="fileProgress.status === 'pending'"
                    class="text-gray-500"
                  >
                    schedule
                  </mat-icon>
                </div>
              </div>

              <!-- Actions -->
              <div class="file-actions">
                <button
                  mat-icon-button
                  color="warn"
                  (click)="removeFile(fileProgress)"
                  [disabled]="fileProgress.status === 'uploading'"
                  title="Remove file"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <!-- Error Message -->
              <div *ngIf="fileProgress.error" class="error-message">
                {{ fileProgress.error }}
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Summary -->
        <div *ngIf="uploadSummary()" class="upload-summary mt-4">
          <div class="summary-stats">
            <span class="stat-item">
              <strong>{{ uploadSummary()?.total }}</strong> files selected
            </span>
            <span class="stat-item">
              <strong>{{ uploadSummary()?.validFiles }}</strong> valid
            </span>
            <span
              *ngIf="uploadSummary() && uploadSummary()!.invalidFiles > 0"
              class="stat-item text-red-600"
            >
              <strong>{{ uploadSummary()?.invalidFiles }}</strong> invalid
            </span>
            <span class="stat-item">
              Total size:
              <strong>{{ uploadSummary()?.totalSizeFormatted }}</strong>
            </span>
          </div>
        </div>

        <!-- Validation Errors -->
        <div
          *ngIf="validationErrors().length > 0"
          class="validation-errors mt-4"
        >
          <mat-card class="error-card">
            <mat-card-header>
              <mat-card-title class="text-red-600">
                <mat-icon>error</mat-icon>
                Validation Errors
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <ul class="error-list">
                <li *ngFor="let error of validationErrors()" class="error-item">
                  {{ error }}
                </li>
              </ul>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-card-content>

      <mat-card-actions align="end" class="upload-actions">
        <button
          mat-button
          (click)="clearFiles()"
          [disabled]="
            (selectedFiles().length === 0 &&
              validUploadedFiles().length === 0) ||
            isUploading()
          "
        >
          {{ selectedFiles().length > 0 ? 'Clear Selected' : 'Clear All' }}
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="startUpload()"
          [disabled]="!canUpload()"
        >
          <mat-icon>cloud_upload</mat-icon>
          Upload
          {{
            validFiles().length > 1 ? validFiles().length + ' Files' : 'File'
          }}
        </button>
      </mat-card-actions>
    </mat-card>

    <!-- Uploaded Files Display -->
    <mat-card
      class="uploaded-files-container mt-4"
      *ngIf="validUploadedFiles().length > 0"
    >
      <mat-card-header>
        <mat-card-title>
          <mat-icon>cloud_done</mat-icon>
          Uploaded Files ({{ validUploadedFiles().length }})
        </mat-card-title>
        <mat-card-subtitle>
          Successfully uploaded files with actions
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="uploaded-files-grid">
          <ng-container
            *ngFor="
              let file of validUploadedFiles();
              trackBy: trackByUploadedFile
            "
          >
            <div *ngIf="file" class="uploaded-file-item">
              <!-- File Thumbnail/Preview -->
              <div class="uploaded-file-preview">
                <img
                  *ngIf="isImageFile(file.mimeType) && getFilePreview(file)"
                  [src]="getFilePreview(file)"
                  [alt]="file.originalName"
                  class="thumbnail-image"
                />
                <div
                  *ngIf="!isImageFile(file.mimeType)"
                  class="file-icon-large"
                >
                  <mat-icon>{{
                    getFileIconByMimeType(file.mimeType)
                  }}</mat-icon>
                </div>
              </div>

              <!-- File Info -->
              <div class="uploaded-file-info">
                <h4 class="file-name" [title]="file.originalName">
                  {{ file.originalName }}
                </h4>
                <p class="file-details">
                  {{ formatFileSize(file.fileSize) }} • {{ file.fileType }}
                </p>
                <p class="upload-date">
                  Uploaded {{ formatUploadDate(file.uploadedAt) }}
                </p>

                <!-- File Status -->
                <div class="file-status">
                  <mat-chip
                    [color]="file.isPublic ? 'primary' : 'accent'"
                    [disabled]="false"
                  >
                    {{ file.isPublic ? 'Public' : 'Private' }}
                  </mat-chip>
                  <mat-chip
                    *ngIf="file.isTemporary"
                    color="warn"
                    [disabled]="false"
                  >
                    Temporary
                  </mat-chip>
                </div>
              </div>

              <!-- File Actions -->
              <div class="uploaded-file-actions">
                <button
                  mat-icon-button
                  color="primary"
                  (click)="viewFile(file)"
                  title="View file"
                >
                  <mat-icon>visibility</mat-icon>
                </button>
                <button
                  mat-icon-button
                  color="accent"
                  (click)="downloadFile(file)"
                  title="Download file"
                >
                  <mat-icon>download</mat-icon>
                </button>
                <button
                  mat-icon-button
                  *ngIf="isImageFile(file.mimeType)"
                  (click)="showCustomThumbnailOptions(file)"
                  title="Custom thumbnail"
                >
                  <mat-icon>photo_size_select_large</mat-icon>
                </button>
                <button
                  mat-icon-button
                  color="warn"
                  (click)="deleteUploadedFile(file)"
                  title="Delete file"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </ng-container>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .file-upload-container {
        max-width: 100%;
      }

      .drop-zone {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background-color: #fafafa;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .drop-zone:hover {
        border-color: #2196f3;
        background-color: #f5f5f5;
      }

      .drop-zone.drag-over {
        border-color: #4caf50;
        background-color: #e8f5e8;
      }

      .drop-zone.has-files {
        border-style: solid;
        padding: 1rem;
      }

      .drop-zone-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .upload-icon {
        font-size: 4rem;
        height: 4rem;
        width: 4rem;
        color: #ccc;
        margin-bottom: 1rem;
      }

      .file-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        width: 100%;
      }

      .file-preview-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        position: relative;
        transition: all 0.3s ease;
      }

      .file-preview-item.upload-success {
        border-color: #4caf50;
        background-color: #f1f8e9;
      }

      .file-preview-item.upload-error {
        border-color: #f44336;
        background-color: #ffebee;
      }

      .file-preview {
        flex-shrink: 0;
        width: 60px;
        height: 60px;
        margin-right: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        overflow: hidden;
        background-color: #f5f5f5;
      }

      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }

      .file-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }

      .file-icon mat-icon {
        font-size: 2rem;
        height: 2rem;
        width: 2rem;
        color: #666;
      }

      .file-info {
        flex: 1;
        min-width: 0;
      }

      .file-name {
        font-weight: 500;
        margin: 0 0 0.25rem 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.9rem;
      }

      .file-size {
        color: #666;
        font-size: 0.8rem;
        margin: 0;
      }

      .file-actions {
        flex-shrink: 0;
        margin-left: 1rem;
      }

      .status-indicator {
        position: absolute;
        top: 0.5rem;
        right: 3rem;
      }

      .error-message {
        position: absolute;
        bottom: -1.5rem;
        left: 0;
        right: 0;
        font-size: 0.75rem;
        color: #f44336;
        background: white;
        padding: 0.25rem 0.5rem;
        border-radius: 0 0 8px 8px;
        border: 1px solid #f44336;
        border-top: none;
      }

      .upload-summary {
        padding: 1rem;
        background-color: #f5f5f5;
        border-radius: 8px;
      }

      .summary-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.9rem;
      }

      .stat-item {
        display: flex;
        align-items: center;
      }

      .validation-errors {
        margin-top: 1rem;
      }

      .error-card {
        border-left: 4px solid #f44336;
      }

      .error-list {
        margin: 0;
        padding-left: 1rem;
      }

      .error-item {
        margin-bottom: 0.5rem;
        color: #f44336;
        font-size: 0.9rem;
      }

      .upload-options {
        margin-bottom: 1rem;
        padding: 1rem;
        background-color: #f9f9f9;
        border-radius: 8px;
      }

      .upload-actions {
        padding: 1rem;
        background-color: #fafafa;
        border-top: 1px solid #e0e0e0;
      }

      /* Dark theme adjustments */
      :host-context(.dark) .drop-zone {
        background-color: #303030;
        border-color: #666;
      }

      :host-context(.dark) .drop-zone:hover {
        background-color: #424242;
      }

      :host-context(.dark) .file-preview-item {
        background-color: #424242;
        border-color: #666;
      }

      :host-context(.dark) .upload-summary {
        background-color: #303030;
      }

      :host-context(.dark) .upload-options {
        background-color: #303030;
      }

      :host-context(.dark) .upload-actions {
        background-color: #303030;
        border-color: #666;
      }

      /* Uploaded Files Styles */
      .uploaded-files-container {
        margin-top: 1rem;
      }

      .uploaded-files-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .uploaded-file-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background-color: #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: box-shadow 0.3s ease;
      }

      .uploaded-file-item:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .uploaded-file-preview {
        flex-shrink: 0;
        width: 60px;
        height: 60px;
        margin-right: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        overflow: hidden;
        background-color: #f5f5f5;
      }

      .thumbnail-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 6px;
      }

      .file-icon-large {
        font-size: 2rem;
        color: #666;
      }

      .file-icon-large mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }

      .uploaded-file-info {
        flex-grow: 1;
        min-width: 0;
      }

      .uploaded-file-info .file-name {
        margin: 0 0 0.25rem 0;
        font-weight: 500;
        font-size: 0.95rem;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .uploaded-file-info .file-details {
        margin: 0 0 0.25rem 0;
        font-size: 0.85rem;
        color: #666;
      }

      .uploaded-file-info .upload-date {
        margin: 0 0 0.5rem 0;
        font-size: 0.8rem;
        color: #888;
      }

      .file-status {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .file-status mat-chip {
        font-size: 0.7rem;
        height: 20px;
        line-height: 20px;
      }

      .uploaded-file-actions {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-left: 0.5rem;
      }

      .uploaded-file-actions button {
        width: 36px;
        height: 36px;
        line-height: 36px;
      }

      .uploaded-file-actions mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* Dark theme for uploaded files */
      :host-context(.dark) .uploaded-file-item {
        background-color: #424242;
        border-color: #666;
        color: #ffffff;
      }

      :host-context(.dark) .uploaded-file-preview {
        background-color: #303030;
      }

      :host-context(.dark) .uploaded-file-info .file-name {
        color: #ffffff;
      }

      :host-context(.dark) .uploaded-file-info .file-details {
        color: #cccccc;
      }

      :host-context(.dark) .uploaded-file-info .upload-date {
        color: #aaaaaa;
      }

      .thumbnail-options {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
    `,
  ],
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @Input() multiple = true;
  @Input() maxFiles: number = FILE_UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD;
  @Input() maxFileSize = FILE_UPLOAD_LIMITS.MAX_FILE_SIZE;
  @Input() acceptedTypes: string[] = [
    ...FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES,
    ...FILE_UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES,
  ];
  @Input() category?: string;
  @Input() showOptions = true;
  @Input() autoUpload = false;

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() uploadComplete = new EventEmitter<UploadedFile[]>();
  @Output() uploadError = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private fileUploadService = inject(FileUploadService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private subscription = new Subscription();

  // Signals
  private _isDragOver = signal(false);
  private _selectedFiles = signal<File[]>([]);
  private _uploadProgress = signal<FileUploadProgress[]>([]);
  private _validationResults = signal<FileValidationResult[]>([]);
  private _uploadedFiles = signal<(UploadedFile & { preview?: string })[]>([]);

  // Readonly signals
  readonly isDragOver = this._isDragOver.asReadonly();
  readonly selectedFiles = this._selectedFiles.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly uploadedFiles = this._uploadedFiles.asReadonly();

  // Form for upload options
  optionsForm: FormGroup = this.fb.group({
    category: [this.category || ''],
    isPublic: [false],
    isTemporary: [false],
    allowDuplicates: [true], // Default to allow duplicates
    expiresIn: [24],
  });

  readonly availableCategories = FILE_UPLOAD_LIMITS.ALLOWED_CATEGORIES;

  // Computed properties
  readonly validationErrors = computed(() => {
    return this._validationResults()
      .filter((result) => !result.valid)
      .flatMap((result) => result.errors);
  });

  readonly validUploadedFiles = computed(() => {
    return this._uploadedFiles().filter((file) => file && file.id);
  });

  readonly validFiles = computed(() => {
    return this._validationResults()
      .filter((result) => result.valid)
      .map((result) => result.file);
  });

  readonly uploadSummary = computed(() => {
    const files = this._selectedFiles();
    if (files.length === 0) return null;

    const validFiles = this.validFiles().length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    return {
      total: files.length,
      validFiles,
      invalidFiles: files.length - validFiles,
      totalSizeFormatted: this.formatFileSize(totalSize),
    };
  });

  readonly canUpload = computed(() => {
    return this.validFiles().length > 0 && !this.isUploading();
  });

  readonly acceptedTypesDisplay = computed(() => {
    return (
      this.acceptedTypes
        .map((type) => type.split('/')[1].toUpperCase())
        .slice(0, 3)
        .join(', ') + (this.acceptedTypes.length > 3 ? '...' : '')
    );
  });

  ngOnInit() {
    // Subscribe to upload progress
    this.subscription.add(
      this.fileUploadService.uploadProgress$.subscribe((progress) => {
        this._uploadProgress.set(progress);
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._isDragOver.set(false);

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFileSelection(files);
  }

  openFileDialog(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.handleFileSelection(files);

    // Clear input for subsequent selections
    input.value = '';
  }

  private async handleFileSelection(files: File[]): Promise<void> {
    if (!this.multiple && files.length > 1) {
      files = [files[0]];
    }

    if (files.length > this.maxFiles) {
      this.snackBar.open(
        `Maximum ${this.maxFiles} files allowed. Only first ${this.maxFiles} files selected.`,
        'Close',
        { duration: 5000 },
      );
      files = files.slice(0, this.maxFiles);
    }

    // Validate files
    const validationResults = this.fileUploadService.validateFiles(files, {
      maxFileSize: this.maxFileSize,
      allowedTypes: this.acceptedTypes,
      maxFiles: this.maxFiles,
    });

    this._validationResults.set(validationResults);

    // Set selected files
    const existingFiles = this.multiple ? this._selectedFiles() : [];
    const newFiles = this.multiple ? [...existingFiles, ...files] : files;
    this._selectedFiles.set(newFiles);

    // Generate previews for images
    const progressItems: FileUploadProgress[] = await Promise.all(
      files.map(async (file) => {
        const preview = await this.fileUploadService.generateFilePreview(file);
        return {
          file,
          progress: 0,
          status: 'pending' as const,
          preview: preview || undefined,
        };
      }),
    );

    const currentProgress = this.multiple ? this._uploadProgress() : [];
    this._uploadProgress.set([...currentProgress, ...progressItems]);

    // Emit files selected event
    this.filesSelected.emit(newFiles);

    // Auto upload if enabled
    if (this.autoUpload && this.validFiles().length > 0) {
      setTimeout(() => this.startUpload(), 100);
    }
  }

  removeFile(fileProgress: FileUploadProgress): void {
    if (fileProgress.status === 'uploading') {
      this.snackBar.open('Cannot remove file while uploading', 'Close', {
        duration: 2000,
      });
      return;
    }

    // Remove from selected files, upload progress, and validation results
    const selectedFiles = this._selectedFiles().filter(
      (f) => f !== fileProgress.file,
    );
    const uploadProgress = this._uploadProgress().filter(
      (p) => p.file !== fileProgress.file,
    );
    const validationResults = this._validationResults().filter(
      (v) => v.file !== fileProgress.file,
    );

    this._selectedFiles.set(selectedFiles);
    this._uploadProgress.set(uploadProgress);
    this._validationResults.set(validationResults);

    // Show confirmation message
    this.snackBar.open(
      `Removed ${fileProgress.file.name} from selection`,
      'Close',
      { duration: 2000 },
    );
  }

  clearFiles(): void {
    if (this.isUploading()) {
      this.snackBar.open('Cannot clear files while uploading', 'Close', {
        duration: 2000,
      });
      return;
    }

    const selectedCount = this._selectedFiles().length;
    const uploadedCount = this.validUploadedFiles().length;

    this._selectedFiles.set([]);
    this._uploadProgress.set([]);
    this._validationResults.set([]);
    this._uploadedFiles.set([]);
    this.fileUploadService.clearUploadProgress();

    // Show appropriate message based on what was cleared
    if (selectedCount > 0 && uploadedCount > 0) {
      this.snackBar.open(
        `Cleared ${selectedCount} selected files and ${uploadedCount} uploaded files`,
        'Close',
        { duration: 3000 },
      );
    } else if (selectedCount > 0) {
      this.snackBar.open(`Cleared ${selectedCount} selected files`, 'Close', {
        duration: 2000,
      });
    } else if (uploadedCount > 0) {
      this.snackBar.open(`Cleared ${uploadedCount} uploaded files`, 'Close', {
        duration: 2000,
      });
    }
  }

  async startUpload(): Promise<void> {
    const validFiles = this.validFiles();
    if (validFiles.length === 0) return;

    const options: FileUploadOptions = this.optionsForm.value;
    console.log('Upload options:', options);

    try {
      // Use sequential single file uploads for better performance
      await this.uploadFilesSequentially(validFiles, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      this.uploadError.emit(message);
      this.snackBar.open(message, 'Close', { duration: 5000 });
    }
  }

  private async uploadFilesSequentially(
    validFiles: File[],
    options: FileUploadOptions,
  ): Promise<void> {
    let successCount = 0;
    let failCount = 0;
    const uploadedFiles: UploadedFile[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];

      try {
        // Upload single file
        const response = await new Promise<FileUploadResponse>(
          (resolve, reject) => {
            this.fileUploadService.uploadFile(file, options).subscribe({
              next: (response) => {
                // Check if this is a complete response with data
                if (response && response.data && response.data.id) {
                  resolve(response);
                }
                // Ignore intermediate progress events (empty responses)
              },
              error: (error) => reject(error),
            });
          },
        );

        // Track successful upload
        successCount++;
        const uploadedFile = response.data;

        // Add preview from progress if available, prioritize signed URLs over local preview
        const progressItem = this._uploadProgress().find(
          (p) => p.file.name === uploadedFile.originalName,
        );
        const uploadedFileWithPreview = {
          ...uploadedFile,
          preview: uploadedFile.signedUrls?.thumbnail || progressItem?.preview,
        };

        uploadedFiles.push(uploadedFile);
        this._uploadedFiles.update((files) => [
          ...files,
          uploadedFileWithPreview,
        ]);

        // Show progress update
        this.snackBar.open(
          `File ${i + 1}/${validFiles.length} uploaded: ${file.name}`,
          'Close',
          { duration: 2000 },
        );
      } catch (error) {
        failCount++;
        console.error(`Failed to upload ${file.name}:`, error);

        // Show error for individual file
        this.snackBar.open(
          `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'Close',
          { duration: 3000 },
        );
      }
    }

    // Emit completion event with all successfully uploaded files
    if (uploadedFiles.length > 0) {
      this.uploadComplete.emit(uploadedFiles);
    }

    // Show final summary
    if (failCount === 0) {
      this.snackBar.open(
        `All ${successCount} files uploaded successfully!`,
        'Close',
        { duration: 3000 },
      );
    } else {
      this.snackBar.open(
        `${successCount} files uploaded, ${failCount} failed`,
        'Close',
        { duration: 5000 },
      );
    }

    // Clear selected files and progress after completion
    this._selectedFiles.set([]);
    this._uploadProgress.set([]);
    this._validationResults.set([]);
    this.fileUploadService.clearUploadProgress();
  }

  isUploading(): boolean {
    return this._uploadProgress().some((p) => p.status === 'uploading');
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

  // Uploaded Files Management Methods
  trackByUploadedFile(index: number, item: UploadedFile): string {
    return item?.id || `index-${index}`;
  }

  getFilePreview(file: UploadedFile & { preview?: string }): string | null {
    // Use stored preview if available, fallback to signedUrls if exists
    return file.preview || file.signedUrls?.thumbnail || null;
  }

  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  getFileIconByMimeType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'videocam';
    if (mimeType.startsWith('audio/')) return 'audiotrack';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word') || mimeType.includes('document'))
      return 'description';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
      return 'table_chart';
    if (mimeType.includes('zip') || mimeType.includes('compressed'))
      return 'archive';
    return 'insert_drive_file';
  }

  formatUploadDate(uploadedAt: string): string {
    const date = new Date(uploadedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  }

  viewFile(file: UploadedFile): void {
    if (!file?.id) return;
    // Use signedUrls if available, otherwise fallback to API
    const viewUrl =
      file.signedUrls?.view || this.fileUploadService.getViewUrl(file.id);
    window.open(viewUrl, '_blank');
  }

  downloadFile(file: UploadedFile): void {
    // Use signed download URL if available
    if (file.signedUrls?.download) {
      const link = document.createElement('a');
      link.href = file.signedUrls.download;
      link.download = file.originalName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback: Generate download URL via service
      const downloadUrl = this.fileUploadService.getDownloadUrl(file.id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.originalName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  showCustomThumbnailOptions(file: UploadedFile): void {
    if (!file?.id) return;
    // Show different thumbnail sizes using signed URLs if available
    if (file.signedUrls?.thumbnail) {
      console.log(
        'Available thumbnail for',
        file.originalName,
        ':',
        file.signedUrls.thumbnail,
      );
      this.snackBar.open('Thumbnail URL logged to console', 'Close', {
        duration: 3000,
      });
    } else {
      this.snackBar.open('No thumbnail available for this file', 'Close', {
        duration: 3000,
      });
    }
  }

  async deleteUploadedFile(file: UploadedFile): Promise<void> {
    if (!file?.id) return;

    const fileName = file.originalName;

    try {
      // Remove from local state immediately for better UX
      this._uploadedFiles.update((files) =>
        files.filter((f) => f?.id !== file.id),
      );

      // Call delete API endpoint
      await this.fileUploadService.deleteFile(file.id).toPromise();

      this.snackBar.open(`${fileName} deleted successfully`, 'Close', {
        duration: 3000,
      });
    } catch (error) {
      // Restore file in local state if delete failed
      this._uploadedFiles.update((files) => [...files, file]);

      const message =
        error instanceof Error ? error.message : 'Failed to delete file';
      this.snackBar.open(`Failed to delete ${fileName}: ${message}`, 'Close', {
        duration: 5000,
      });
    }
  }

  trackByFile(index: number, item: FileUploadProgress): string {
    return `${item.file.name}-${item.file.size}-${index}`;
  }
}
