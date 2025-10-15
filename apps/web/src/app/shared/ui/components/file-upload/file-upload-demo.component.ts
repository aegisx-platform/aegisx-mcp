import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { FileUploadComponent } from './file-upload.component';
import { FileManagementComponent } from './file-management.component';
import { FileUploadService } from './file-upload.service';
import { UploadedFile } from './file-upload.types';

@Component({
  selector: 'app-file-upload-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FileUploadComponent,
    FileManagementComponent,
  ],
  template: `
    <div class="demo-container">
      <mat-card class="demo-header">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>cloud_upload</mat-icon>
            File Upload System Demo
          </mat-card-title>
          <mat-card-subtitle>
            Comprehensive file upload and management system with drag-and-drop,
            validation, and progress tracking
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <mat-tab-group class="demo-tabs" animationDuration="300ms">
        <!-- Upload Tab -->
        <mat-tab label="File Upload">
          <div class="tab-content">
            <h3>Single & Multiple File Upload</h3>
            <p class="tab-description">
              Upload files with drag-and-drop support, real-time validation,
              progress tracking, and file previews. Supports images, documents,
              and various file types with configurable size limits and
              categories.
            </p>

            <app-file-upload
              [multiple]="true"
              [maxFiles]="5"
              [showOptions]="true"
              [autoUpload]="false"
              (filesSelected)="onFilesSelected($event)"
              (uploadComplete)="onUploadComplete($event)"
              (uploadError)="onUploadError($event)"
            >
            </app-file-upload>

            <!-- Upload Results -->
            <mat-card *ngIf="recentUploads().length > 0" class="recent-uploads">
              <mat-card-header>
                <mat-card-title>Recently Uploaded Files</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="upload-list">
                  <div *ngFor="let file of recentUploads()" class="upload-item">
                    <mat-icon>{{ getFileIcon(file.mimeType) }}</mat-icon>
                    <div class="upload-details">
                      <span class="file-name">{{ file.originalName }}</span>
                      <span class="file-info"
                        >{{ formatFileSize(file.fileSize) }} •
                        {{ file.uploadedAt | date: 'short' }}</span
                      >
                    </div>
                    <button
                      mat-icon-button
                      (click)="viewFile(file)"
                      matTooltip="View file"
                    >
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Management Tab -->
        <mat-tab label="File Management">
          <div class="tab-content">
            <h3>File Management & Organization</h3>
            <p class="tab-description">
              Browse, search, and manage your uploaded files with advanced
              filtering, sorting, and bulk operations. Switch between table and
              grid views for optimal file browsing experience.
            </p>

            <app-file-management
              [showStats]="true"
              [allowBulkActions]="true"
              [defaultPageSize]="10"
              (fileSelected)="onFileSelected($event)"
              (filesDeleted)="onFilesDeleted($event)"
            >
            </app-file-management>
          </div>
        </mat-tab>

        <!-- Avatar Upload Tab -->
        <mat-tab label="Avatar Upload">
          <div class="tab-content">
            <h3>Specialized Avatar Upload</h3>
            <p class="tab-description">
              Specialized component for avatar uploads with image-only
              restrictions, automatic cropping suggestions, and profile picture
              optimization.
            </p>

            <app-file-upload
              [multiple]="false"
              [maxFiles]="1"
              [acceptedTypes]="imageTypes"
              [category]="'avatar'"
              [maxFileSize]="5242880"
              [showOptions]="false"
              [autoUpload]="true"
              (uploadComplete)="onAvatarUpload($event)"
              class="avatar-upload"
            >
            </app-file-upload>

            <!-- Avatar Preview -->
            <mat-card *ngIf="currentAvatar()" class="avatar-preview">
              <mat-card-header>
                <mat-card-title>Current Avatar</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="avatar-display">
                  <img
                    [src]="currentAvatar()!.signedUrls?.view || ''"
                    [alt]="currentAvatar()!.originalName"
                    class="avatar-image"
                  />
                  <div class="avatar-info">
                    <p>
                      <strong>{{ currentAvatar()!.originalName }}</strong>
                    </p>
                    <p>{{ formatFileSize(currentAvatar()!.fileSize) }}</p>
                    <p>
                      Uploaded {{ currentAvatar()!.uploadedAt | date: 'short' }}
                    </p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- API Examples Tab -->
        <mat-tab label="API Examples">
          <div class="tab-content">
            <h3>File Upload API Integration</h3>
            <p class="tab-description">
              Examples of how to integrate the file upload components with your
              Angular application, including service usage, configuration
              options, and event handling.
            </p>

            <mat-card class="code-example">
              <mat-card-header>
                <mat-card-title>Basic Usage</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <pre><code>{{ basicUsageExample }}</code></pre>
              </mat-card-content>
            </mat-card>

            <mat-card class="code-example">
              <mat-card-header>
                <mat-card-title>Service Integration</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <pre><code>{{ serviceExample }}</code></pre>
              </mat-card-content>
            </mat-card>

            <mat-card class="code-example">
              <mat-card-header>
                <mat-card-title>Configuration Options</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <pre><code>{{ configExample }}</code></pre>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .demo-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
      }

      .demo-header {
        margin-bottom: 2rem;
      }

      .demo-header mat-card-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .demo-tabs {
        margin-bottom: 2rem;
      }

      .tab-content {
        padding: 2rem 1rem;
      }

      .tab-content h3 {
        margin-top: 0;
        color: #333;
        font-weight: 500;
      }

      .tab-description {
        color: #666;
        line-height: 1.6;
        margin-bottom: 2rem;
      }

      .recent-uploads {
        margin-top: 2rem;
      }

      .upload-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .upload-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem;
        border-radius: 8px;
        background: #f5f5f5;
      }

      .upload-item mat-icon:first-child {
        color: #2196f3;
      }

      .upload-details {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .file-name {
        font-weight: 500;
        color: #333;
      }

      .file-info {
        font-size: 0.875rem;
        color: #666;
      }

      .avatar-upload {
        max-width: 500px;
        margin: 0 auto;
      }

      .avatar-preview {
        margin-top: 2rem;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
      }

      .avatar-display {
        display: flex;
        align-items: center;
        gap: 2rem;
      }

      .avatar-image {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid #e0e0e0;
      }

      .avatar-info p {
        margin: 0.25rem 0;
      }

      .code-example {
        margin-bottom: 1.5rem;
      }

      .code-example pre {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      .code-example code {
        color: #333;
      }

      /* Dark theme adjustments */
      :host-context(.dark) .tab-content h3 {
        color: #fff;
      }

      :host-context(.dark) .tab-description {
        color: #ccc;
      }

      :host-context(.dark) .upload-item {
        background: #424242;
      }

      :host-context(.dark) .file-name {
        color: #fff;
      }

      :host-context(.dark) .file-info {
        color: #ccc;
      }

      :host-context(.dark) .code-example pre {
        background: #2d2d2d;
        color: #f8f8f2;
      }

      @media (max-width: 768px) {
        .demo-container {
          padding: 0.5rem;
        }

        .tab-content {
          padding: 1rem 0.5rem;
        }

        .avatar-display {
          flex-direction: column;
          text-align: center;
          gap: 1rem;
        }
      }
    `,
  ],
})
export class FileUploadDemoComponent {
  private snackBar = inject(MatSnackBar);
  private fileUploadService = inject(FileUploadService);

  // Signals for demo state
  private _recentUploads = signal<UploadedFile[]>([]);
  private _currentAvatar = signal<UploadedFile | null>(null);

  readonly recentUploads = this._recentUploads.asReadonly();
  readonly currentAvatar = this._currentAvatar.asReadonly();

  readonly imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  readonly basicUsageExample = `
<!-- Basic file upload component -->
<app-file-upload
  [multiple]="true"
  [maxFiles]="5"
  [showOptions]="true"
  [autoUpload]="false"
  (filesSelected)="onFilesSelected($event)"
  (uploadComplete)="onUploadComplete($event)"
  (uploadError)="onUploadError($event)">
</app-file-upload>

<!-- File management component -->
<app-file-management
  [showStats]="true"
  [allowBulkActions]="true"
  [defaultPageSize]="25"
  (fileSelected)="onFileSelected($event)"
  (filesDeleted)="onFilesDeleted($event)">
</app-file-management>
  `.trim();

  readonly serviceExample = `
import { FileUploadService, FileUploadOptions } from './file-upload';

constructor(private fileUploadService: FileUploadService) {}

uploadFile(file: File) {
  const options: FileUploadOptions = {
    category: 'document',
    isPublic: false,
    isTemporary: false
  };

  this.fileUploadService.uploadFile(file, options).subscribe({
    next: (response) => {
      console.log('File uploaded:', response.data);
    },
    error: (error) => {
      console.error('Upload failed:', error);
    }
  });
}

getFiles() {
  this.fileUploadService.getFiles({
    category: 'image',
    limit: 10,
    sort: 'uploadedAt',
    order: 'desc'
  }).subscribe(response => {
    console.log('Files:', response.data);
  });
}
  `.trim();

  readonly configExample = `
// Component configuration
export interface FileUploadConfig {
  multiple: boolean;           // Allow multiple files
  maxFiles: number;           // Maximum number of files
  maxFileSize: number;        // Maximum file size in bytes
  acceptedTypes: string[];    // Allowed MIME types
  category?: string;          // Default category
  showOptions: boolean;       // Show upload options form
  autoUpload: boolean;        // Upload automatically on selection
}

// Service configuration
export interface FileUploadOptions {
  category?: string;          // File category
  isPublic?: boolean;         // Public access
  isTemporary?: boolean;      // Temporary file
  expiresIn?: number;         // Expiration in hours
  metadata?: Record<string, any>; // Additional metadata
}
  `.trim();

  onFilesSelected(files: File[]) {
    console.log('Files selected:', files);
    this.snackBar.open(`${files.length} files selected`, 'Close', {
      duration: 2000,
    });
  }

  onUploadComplete(files: UploadedFile[]) {
    console.log('Upload complete:', files);

    // Add to recent uploads
    const recent = [...this._recentUploads(), ...files];
    this._recentUploads.set(recent.slice(0, 10)); // Keep last 10

    this.snackBar.open(
      `${files.length} ${files.length === 1 ? 'file' : 'files'} uploaded successfully!`,
      'Close',
      { duration: 3000 },
    );
  }

  onUploadError(error: string) {
    console.error('Upload error:', error);
    this.snackBar.open(`Upload failed: ${error}`, 'Close', { duration: 5000 });
  }

  onFileSelected(file: UploadedFile) {
    console.log('File selected for viewing:', file);
  }

  onFilesDeleted(files: UploadedFile[]) {
    console.log('Files deleted:', files);

    // Remove from recent uploads
    const recent = this._recentUploads().filter(
      (recent) => !files.some((deleted) => deleted.id === recent.id),
    );
    this._recentUploads.set(recent);

    this.snackBar.open(
      `${files.length} ${files.length === 1 ? 'file' : 'files'} deleted`,
      'Close',
      { duration: 3000 },
    );
  }

  onAvatarUpload(files: UploadedFile[]) {
    if (files.length > 0) {
      this._currentAvatar.set(files[0]);
      this.snackBar.open('Avatar updated successfully!', 'Close', {
        duration: 3000,
      });
    }
  }

  viewFile(file: UploadedFile) {
    // Use signed view URL if available
    if (file.signedUrls?.view) {
      window.open(file.signedUrls.view, '_blank');
    } else {
      // Fallback: Generate view URL via service
      const viewUrl = this.fileUploadService.getViewUrl(file.id);
      window.open(viewUrl + '?inline=true', '_blank');
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'videocam';
    if (mimeType.startsWith('audio/')) return 'audiotrack';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word') || mimeType.includes('document'))
      return 'description';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
      return 'grid_on';
    if (mimeType.includes('zip') || mimeType.includes('compressed'))
      return 'archive';
    return 'insert_drive_file';
  }
}
