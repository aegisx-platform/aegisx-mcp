import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * File item with upload state
 */
export interface FileItem {
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

/**
 * AegisX File Upload Component
 *
 * A drag-and-drop file upload component with preview and progress indication.
 * Supports single and multiple file uploads with validation.
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <ax-file-upload
 *   (filesChange)="onFilesSelected($event)"
 *   accept="image/*"
 * ></ax-file-upload>
 *
 * <!-- Multiple files with size limit -->
 * <ax-file-upload
 *   [multiple]="true"
 *   [maxFiles]="5"
 *   [maxSize]="5242880"
 *   accept=".pdf,.doc,.docx"
 *   (filesChange)="onFilesSelected($event)"
 * ></ax-file-upload>
 *
 * <!-- With form control -->
 * <ax-file-upload formControlName="attachments"></ax-file-upload>
 * ```
 */
@Component({
  selector: 'ax-file-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxFileUploadComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="ax-file-upload"
      [class.ax-file-upload-drag-over]="isDragOver()"
      [class.ax-file-upload-disabled]="disabled"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (click)="openFileDialog()"
      (keydown.enter)="openFileDialog()"
      (keydown.space)="openFileDialog()"
      role="button"
      tabindex="0"
      [attr.aria-label]="label || 'Upload files'"
    >
      <!-- Hidden file input -->
      <input
        #fileInput
        type="file"
        class="ax-file-upload-input"
        [accept]="accept"
        [multiple]="multiple"
        [disabled]="disabled"
        (change)="onFileInputChange($event)"
      />

      <!-- Drop zone -->
      <div class="ax-file-upload-dropzone">
        <mat-icon class="ax-file-upload-icon">cloud_upload</mat-icon>
        <div class="ax-file-upload-text">
          <span class="ax-file-upload-primary">
            {{ dragText || 'Drag and drop files here' }}
          </span>
          <span class="ax-file-upload-secondary">
            or <span class="ax-file-upload-link">browse files</span>
          </span>
        </div>
        @if (hint) {
          <span class="ax-file-upload-hint">{{ hint }}</span>
        }
      </div>
    </div>

    <!-- File list -->
    @if (files().length > 0) {
      <div class="ax-file-upload-list">
        @for (item of files(); track item.name) {
          <div
            class="ax-file-upload-item"
            [class.ax-file-upload-item-error]="item.status === 'error'"
          >
            <!-- Preview/Icon -->
            <div class="ax-file-upload-preview">
              @if (item.preview && isImage(item.type)) {
                <img [src]="item.preview" [alt]="item.name" />
              } @else {
                <mat-icon>{{ getFileIcon(item.type) }}</mat-icon>
              }
            </div>

            <!-- File info -->
            <div class="ax-file-upload-info">
              <span class="ax-file-upload-name">{{ item.name }}</span>
              <span class="ax-file-upload-size">{{
                formatSize(item.size)
              }}</span>
              @if (item.status === 'uploading') {
                <mat-progress-bar
                  mode="determinate"
                  [value]="item.progress"
                ></mat-progress-bar>
              }
              @if (item.error) {
                <span class="ax-file-upload-error">{{ item.error }}</span>
              }
            </div>

            <!-- Status/Actions -->
            <div class="ax-file-upload-actions">
              @if (item.status === 'success') {
                <mat-icon class="ax-file-upload-status success"
                  >check_circle</mat-icon
                >
              }
              @if (item.status === 'error') {
                <mat-icon class="ax-file-upload-status error">error</mat-icon>
              }
              <button
                mat-icon-button
                type="button"
                class="ax-file-upload-remove"
                (click)="removeFile(item); $event.stopPropagation()"
                [disabled]="disabled"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ax-file-upload {
        border: 2px dashed var(--ax-border-default, #e4e4e7);
        border-radius: var(--ax-radius-lg, 0.75rem);
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 200ms ease;
        background: var(--ax-background-default, #ffffff);
      }

      .ax-file-upload:hover:not(.ax-file-upload-disabled) {
        border-color: var(--ax-brand-default, #3b82f6);
        background: var(--ax-brand-faint, #eff6ff);
      }

      .ax-file-upload.ax-file-upload-drag-over {
        border-color: var(--ax-brand-default, #3b82f6);
        background: var(--ax-brand-faint, #eff6ff);
        border-style: solid;
      }

      .ax-file-upload.ax-file-upload-disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ax-file-upload-input {
        display: none;
      }

      .ax-file-upload-dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .ax-file-upload-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: var(--ax-text-subtle, #a1a1aa);
      }

      .ax-file-upload-text {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .ax-file-upload-primary {
        font-size: 1rem;
        font-weight: 500;
        color: var(--ax-text-primary, #3f3f46);
      }

      .ax-file-upload-secondary {
        font-size: 0.875rem;
        color: var(--ax-text-secondary, #71717a);
      }

      .ax-file-upload-link {
        color: var(--ax-brand-default, #3b82f6);
        font-weight: 500;
        text-decoration: underline;
      }

      .ax-file-upload-hint {
        font-size: 0.75rem;
        color: var(--ax-text-subtle, #a1a1aa);
        margin-top: 0.25rem;
      }

      // File list
      .ax-file-upload-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .ax-file-upload-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--ax-background-subtle, #f4f4f5);
        border-radius: var(--ax-radius-md, 0.5rem);
        border: 1px solid var(--ax-border-muted, #f4f4f5);
      }

      .ax-file-upload-item.ax-file-upload-item-error {
        background: var(--ax-error-faint, #fef2f2);
        border-color: var(--ax-error-muted, #fecaca);
      }

      .ax-file-upload-preview {
        width: 40px;
        height: 40px;
        border-radius: var(--ax-radius-sm, 0.25rem);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ax-background-default, #ffffff);
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        mat-icon {
          color: var(--ax-text-secondary, #71717a);
        }
      }

      .ax-file-upload-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .ax-file-upload-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ax-text-primary, #3f3f46);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ax-file-upload-size {
        font-size: 0.75rem;
        color: var(--ax-text-secondary, #71717a);
      }

      .ax-file-upload-error {
        font-size: 0.75rem;
        color: var(--ax-error-default, #ef4444);
      }

      .ax-file-upload-actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
      }

      .ax-file-upload-status.success {
        color: var(--ax-success-default, #22c55e);
      }

      .ax-file-upload-status.error {
        color: var(--ax-error-default, #ef4444);
      }

      .ax-file-upload-remove {
        width: 32px;
        height: 32px;
      }

      // Dark mode
      :host-context(.dark) .ax-file-upload,
      :host-context([data-theme='dark']) .ax-file-upload {
        background: var(--ax-background-default);
        border-color: var(--ax-border-default);
      }

      :host-context(.dark) .ax-file-upload:hover:not(.ax-file-upload-disabled),
      :host-context([data-theme='dark'])
        .ax-file-upload:hover:not(.ax-file-upload-disabled) {
        background: rgba(59, 130, 246, 0.1);
      }

      :host-context(.dark) .ax-file-upload.ax-file-upload-drag-over,
      :host-context([data-theme='dark'])
        .ax-file-upload.ax-file-upload-drag-over {
        background: rgba(59, 130, 246, 0.1);
      }

      :host-context(.dark) .ax-file-upload-item,
      :host-context([data-theme='dark']) .ax-file-upload-item {
        background: var(--ax-background-subtle);
        border-color: var(--ax-border-default);
      }
    `,
  ],
})
export class AxFileUploadComponent implements ControlValueAccessor {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /**
   * Accepted file types (same as HTML input accept)
   */
  @Input() accept = '*';

  /**
   * Allow multiple files
   * @default false
   */
  @Input() multiple = false;

  /**
   * Maximum number of files (when multiple=true)
   * @default 10
   */
  @Input() maxFiles = 10;

  /**
   * Maximum file size in bytes
   * @default 10MB
   */
  @Input() maxSize = 10 * 1024 * 1024;

  /**
   * Custom drag text
   */
  @Input() dragText?: string;

  /**
   * Hint text below dropzone
   */
  @Input() hint?: string;

  /**
   * Accessible label for the file upload area
   */
  @Input() label?: string;

  /**
   * Disabled state
   */
  @Input() disabled = false;

  /**
   * Emits when files change
   */
  @Output() filesChange = new EventEmitter<FileItem[]>();

  /**
   * Emits when a file is removed
   */
  @Output() fileRemoved = new EventEmitter<FileItem>();

  // Internal state
  protected readonly files = signal<FileItem[]>([]);
  protected readonly isDragOver = signal(false);

  // Form control callbacks
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: File[]) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  /**
   * Open native file dialog
   */
  openFileDialog(): void {
    if (!this.disabled) {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Handle file input change
   */
  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
    // Reset input for same file selection
    input.value = '';
  }

  /**
   * Handle drag over
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver.set(true);
    }
  }

  /**
   * Handle drag leave
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  /**
   * Handle drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (!this.disabled && event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  /**
   * Add files with validation
   */
  private addFiles(newFiles: File[]): void {
    const currentFiles = this.files();

    // Limit files if not multiple
    if (!this.multiple) {
      newFiles = newFiles.slice(0, 1);
    }

    // Check max files
    const availableSlots = this.maxFiles - currentFiles.length;
    if (availableSlots <= 0) {
      return;
    }
    newFiles = newFiles.slice(0, availableSlots);

    // Process each file
    const fileItems: FileItem[] = newFiles.map((file) => {
      const item: FileItem = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending',
      };

      // Validate size
      if (file.size > this.maxSize) {
        item.status = 'error';
        item.error = `File exceeds ${this.formatSize(this.maxSize)} limit`;
      }

      // Generate preview for images
      if (this.isImage(file.type) && item.status !== 'error') {
        this.generatePreview(item);
      }

      return item;
    });

    // Update state
    if (this.multiple) {
      this.files.update((files) => [...files, ...fileItems]);
    } else {
      this.files.set(fileItems);
    }

    this.emitChanges();
  }

  /**
   * Remove a file
   */
  removeFile(item: FileItem): void {
    this.files.update((files) => files.filter((f) => f !== item));
    this.fileRemoved.emit(item);
    this.emitChanges();
  }

  /**
   * Generate image preview
   */
  private generatePreview(item: FileItem): void {
    const reader = new FileReader();
    reader.onload = () => {
      item.preview = reader.result as string;
    };
    reader.readAsDataURL(item.file);
  }

  /**
   * Emit file changes
   */
  private emitChanges(): void {
    const files = this.files();
    this.filesChange.emit(files);
    this.onChange(files.map((f) => f.file));
    this.onTouched();
  }

  /**
   * Check if file type is image
   */
  isImage(type: string): boolean {
    return type.startsWith('image/');
  }

  /**
   * Get icon based on file type
   */
  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'videocam';
    if (type.startsWith('audio/')) return 'audiotrack';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word') || type.includes('document'))
      return 'description';
    if (type.includes('excel') || type.includes('spreadsheet'))
      return 'table_chart';
    if (type.includes('zip') || type.includes('archive')) return 'folder_zip';
    return 'insert_drive_file';
  }

  /**
   * Format file size
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // ControlValueAccessor implementation
  writeValue(files: File[]): void {
    if (files && Array.isArray(files)) {
      const fileItems = files.map((file) => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 100,
        status: 'success' as const,
      }));
      this.files.set(fileItems);
    } else {
      this.files.set([]);
    }
  }

  registerOnChange(fn: (value: File[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
