import { Component, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import {
  FileUploadComponent,
  FileManagementComponent,
  UploadedFile,
  FileUploadService,
} from '../../shared/ui/components/file-upload';

@Component({
  selector: 'app-file-upload-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    FileUploadComponent,
    FileManagementComponent,
  ],
  template: `
    <div class="file-upload-page">
      <div class="page-header mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          File Upload & Management
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Upload, organize, and manage your files in one place
        </p>
      </div>

      <mat-tab-group class="file-upload-tabs" animationDuration="300ms">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="mr-2">cloud_upload</mat-icon>
            Upload Files
          </ng-template>

          <div class="tab-content">
            <app-file-upload
              [multiple]="true"
              [maxFiles]="10"
              [showOptions]="true"
              [autoUpload]="false"
              (uploadComplete)="onUploadComplete($event)"
              (uploadError)="onUploadError($event)"
            >
            </app-file-upload>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="mr-2">folder_open</mat-icon>
            File Management
            <span
              *ngIf="fileStats()?.totalFiles && fileStats()!.totalFiles > 0"
              class="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full"
            >
              {{ fileStats()!.totalFiles }}
            </span>
          </ng-template>

          <div class="tab-content">
            <app-file-management
              [allowBulkActions]="true"
              [showStats]="true"
              (filesDeleted)="onFilesDeleted($event)"
            >
            </app-file-management>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .file-upload-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .page-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .file-upload-tabs {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .tab-content {
        padding: 2rem;
        min-height: 400px;
      }

      /* Dark theme adjustments */
      :host-context(.dark) .file-upload-tabs {
        background: #424242;
      }

      :host-context(.dark) .page-header h1 {
        color: #fff;
      }

      :host-context(.dark) .page-header p {
        color: #ccc;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .file-upload-page {
          padding: 1rem;
        }

        .tab-content {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class FileUploadPage {
  @ViewChild(FileManagementComponent) fileManagement!: FileManagementComponent;

  private fileUploadService = inject(FileUploadService);

  // Use file statistics from the API instead of local counter
  readonly fileStats = this.fileUploadService.fileStats;

  onUploadComplete(files: UploadedFile[]): void {
    console.log('Files uploaded successfully:', files);

    // Refresh file management list and stats to show newly uploaded files
    if (this.fileManagement) {
      this.fileManagement.refreshFiles();
    }
  }

  onUploadError(error: string): void {
    console.error('Upload error:', error);
    // Error handling is already done in the component via snackbar
  }

  onFilesDeleted(files: UploadedFile[]): void {
    console.log('Files deleted:', files);
    // File management already refreshes and reloads stats after deletion
  }
}
