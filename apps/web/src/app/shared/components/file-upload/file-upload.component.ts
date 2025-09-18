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
          [disabled]="selectedFiles().length === 0 || isUploading()"
        >
          Clear All
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

  // Readonly signals
  readonly isDragOver = this._isDragOver.asReadonly();
  readonly selectedFiles = this._selectedFiles.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();

  // Form for upload options
  optionsForm: FormGroup = this.fb.group({
    category: [this.category || ''],
    isPublic: [false],
    isTemporary: [false],
    expiresIn: [24],
  });

  readonly availableCategories = FILE_UPLOAD_LIMITS.ALLOWED_CATEGORIES;

  // Computed properties
  readonly validationErrors = computed(() => {
    return this._validationResults()
      .filter((result) => !result.valid)
      .flatMap((result) => result.errors);
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
    if (fileProgress.status === 'uploading') return;

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
  }

  clearFiles(): void {
    if (this.isUploading()) return;

    this._selectedFiles.set([]);
    this._uploadProgress.set([]);
    this._validationResults.set([]);
    this.fileUploadService.clearUploadProgress();
  }

  async startUpload(): Promise<void> {
    const validFiles = this.validFiles();
    if (validFiles.length === 0) return;

    const options: FileUploadOptions = this.optionsForm.value;

    try {
      if (validFiles.length === 1) {
        this.fileUploadService.uploadFile(validFiles[0], options).subscribe({
          next: (response) => {
            this.uploadComplete.emit([response.data]);
            this.snackBar.open('File uploaded successfully!', 'Close', {
              duration: 3000,
            });
            // Clear the upload state after successful upload
            this.clearFiles();
          },
          error: (error) => {
            this.uploadError.emit(error.message);
            this.snackBar.open(error.message, 'Close', { duration: 5000 });
          },
        });
      } else {
        this.fileUploadService
          .uploadMultipleFiles(validFiles, options)
          .subscribe({
            next: (response) => {
              this.uploadComplete.emit(response.data.uploaded);

              if (response.data.failed.length > 0) {
                this.snackBar.open(
                  `${response.data.uploaded.length} files uploaded, ${response.data.failed.length} failed`,
                  'Close',
                  { duration: 5000 },
                );
              } else {
                this.snackBar.open(
                  'All files uploaded successfully!',
                  'Close',
                  { duration: 3000 },
                );
              }

              // Clear the upload state after successful upload
              this.clearFiles();
            },
            error: (error) => {
              this.uploadError.emit(error.message);
              this.snackBar.open(error.message, 'Close', { duration: 5000 });
            },
          });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      this.uploadError.emit(message);
      this.snackBar.open(message, 'Close', { duration: 5000 });
    }
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

  trackByFile(index: number, item: FileUploadProgress): string {
    return `${item.file.name}-${item.file.size}-${index}`;
  }
}
