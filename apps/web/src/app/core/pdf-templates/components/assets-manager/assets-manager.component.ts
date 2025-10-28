import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileUploadService } from '../../../../shared/ui/components/file-upload/file-upload.service';

export interface AssetData {
  id: string;
  fileSize?: number;
  originalName?: string;
  mimeType?: string;
  signedUrls?: {
    view?: string;
    thumbnail?: string;
  };
  uploadedAt?: Date;
}

export interface AssetInsertEvent {
  assetId: string;
  assetName: string;
}

@Component({
  selector: 'app-assets-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatListModule,
  ],
  template: `
    <div class="assets-manager">
      <div class="manager-header">
        <h4>Template Assets</h4>
        <button
          mat-raised-button
          color="primary"
          type="button"
          (click)="fileInput.click()"
          [disabled]="uploading()"
        >
          <mat-icon>add</mat-icon>
          Upload Asset
        </button>
        <input
          type="file"
          #fileInput
          accept="image/*"
          multiple
          (change)="onFilesSelected($event)"
          class="file-input"
          aria-label="Upload asset files"
        />
      </div>

      @if (uploading()) {
        <div class="upload-progress">
          <mat-spinner diameter="24"></mat-spinner>
          <span>Uploading {{ uploadingCount() }} file(s)...</span>
        </div>
      }

      @if (uploadError()) {
        <div class="upload-error">{{ uploadError() }}</div>
      }

      @if (assets().length === 0 && !uploading()) {
        <div class="empty-state">
          <mat-icon class="empty-icon">photo_library</mat-icon>
          <p>No assets uploaded yet</p>
          <small>Upload images to use in your PDF templates</small>
        </div>
      }

      @if (assets().length > 0) {
        <div class="assets-grid">
          @for (asset of assets(); track asset.id) {
            <mat-card class="asset-card">
              <mat-card-header>
                <mat-card-title class="asset-title">
                  {{ asset.originalName }}
                </mat-card-title>
              </mat-card-header>

              <mat-card-content class="asset-content">
                @if (isImage(asset.mimeType)) {
                  <div class="asset-preview">
                    <img
                      [src]="
                        asset.signedUrls?.thumbnail || asset.signedUrls?.view
                      "
                      [alt]="asset.originalName"
                      (error)="onImageError($event)"
                    />
                  </div>
                } @else {
                  <div class="asset-preview file-icon">
                    <mat-icon>insert_drive_file</mat-icon>
                  </div>
                }

                <div class="asset-info">
                  <mat-chip class="size-chip">
                    {{ formatFileSize(asset.fileSize || 0) }}
                  </mat-chip>
                  <mat-chip class="type-chip">
                    {{ getFileExtension(asset.originalName || '') }}
                  </mat-chip>
                </div>
              </mat-card-content>

              <mat-card-actions class="asset-actions">
                <button
                  mat-button
                  color="primary"
                  (click)="insertAsset(asset)"
                  matTooltip="Insert into template"
                  type="button"
                >
                  <mat-icon>code</mat-icon>
                  Insert
                </button>

                <button
                  mat-button
                  (click)="viewAsset(asset)"
                  matTooltip="View full size"
                  type="button"
                >
                  <mat-icon>visibility</mat-icon>
                  View
                </button>

                <button
                  mat-icon-button
                  color="warn"
                  (click)="removeAsset(asset)"
                  matTooltip="Remove asset"
                  type="button"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .assets-manager {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 8px;
      }

      .manager-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .manager-header h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }

      .file-input {
        display: none;
      }

      .upload-progress {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(63, 81, 181, 0.1);
        border-radius: 4px;
      }

      .upload-error {
        padding: 12px;
        background: rgba(244, 67, 54, 0.1);
        border-radius: 4px;
        font-size: 14px;
        color: #f44336;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        text-align: center;
        color: rgba(0, 0, 0, 0.6);
      }

      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        opacity: 0.3;
        margin-bottom: 16px;
      }

      .empty-state p {
        margin: 8px 0 4px;
        font-size: 16px;
      }

      .empty-state small {
        font-size: 14px;
        opacity: 0.7;
      }

      .assets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }

      .asset-card {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .asset-title {
        font-size: 14px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .asset-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px !important;
      }

      .asset-preview {
        width: 100%;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
        overflow: hidden;
      }

      .asset-preview img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .asset-preview.file-icon {
        background: rgba(0, 0, 0, 0.03);
      }

      .asset-preview.file-icon mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        opacity: 0.3;
      }

      .asset-info {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .size-chip,
      .type-chip {
        font-size: 11px;
        min-height: 24px;
        padding: 4px 8px;
      }

      .asset-actions {
        display: flex;
        justify-content: space-between;
        padding: 8px !important;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
      }

      @media (max-width: 768px) {
        .assets-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }

        .asset-preview {
          height: 120px;
        }
      }
    `,
  ],
})
export class AssetsManagerComponent implements OnInit {
  private fileUploadService = inject(FileUploadService);

  /**
   * Initial asset IDs (for edit mode)
   */
  @Input() initialAssetIds: string[] = [];

  /**
   * Allow duplicate file uploads
   */
  @Input() allowDuplicates = true;

  /**
   * Maximum number of assets allowed
   */
  @Input() maxAssets = 20;

  /**
   * Emits when an asset is successfully uploaded
   */
  @Output() assetUploaded = new EventEmitter<AssetData>();

  /**
   * Emits when an asset is removed
   */
  @Output() assetRemoved = new EventEmitter<string>();

  /**
   * Emits when user wants to insert an asset into the template
   */
  @Output() assetInserted = new EventEmitter<AssetInsertEvent>();

  /**
   * Emits when there's an error
   */
  @Output() errorOccurred = new EventEmitter<string>();

  // Component state
  assets = signal<AssetData[]>([]);
  uploading = signal(false);
  uploadingCount = signal(0);
  uploadError = signal<string | null>(null);

  ngOnInit() {
    // Load existing assets if initialAssetIds are provided
    if (this.initialAssetIds.length > 0) {
      this.loadExistingAssets(this.initialAssetIds);
    }
  }

  /**
   * Load existing asset files
   */
  private loadExistingAssets(assetIds: string[]) {
    assetIds.forEach((assetId) => {
      this.fileUploadService.getFile(assetId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const assetData: AssetData = {
              id: response.data.id,
              fileSize: response.data.fileSize,
              originalName: response.data.originalName,
              mimeType: response.data.mimeType,
              signedUrls: response.data.signedUrls,
              uploadedAt: response.data.uploadedAt
                ? new Date(response.data.uploadedAt)
                : undefined,
            };

            this.assets.update((current) => [...current, assetData]);
          }
        },
        error: (error) => {
          const errorMsg = `Failed to load asset ${assetId}`;
          console.error(errorMsg, error);
          this.uploadError.set(errorMsg);
          this.errorOccurred.emit(errorMsg);
        },
      });
    });
  }

  /**
   * Handle file selection
   */
  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);

    // Check max assets limit
    if (this.assets().length + files.length > this.maxAssets) {
      const errorMsg = `Maximum ${this.maxAssets} assets allowed. You can upload ${this.maxAssets - this.assets().length} more.`;
      this.uploadError.set(errorMsg);
      this.errorOccurred.emit(errorMsg);
      input.value = '';
      return;
    }

    // Validate files
    const validations = this.fileUploadService.validateFiles(files, {
      allowedTypes: [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/svg+xml',
        'image/webp',
      ],
      maxFileSize: 5 * 1024 * 1024, // 5MB per file
      maxFiles: files.length,
    });

    const invalidFiles = validations.filter((v) => !v.valid);
    if (invalidFiles.length > 0) {
      const errorMsg = invalidFiles.map((v) => v.errors.join(', ')).join('; ');
      this.uploadError.set(errorMsg);
      this.errorOccurred.emit(errorMsg);
      input.value = '';
      return;
    }

    this.uploadError.set(null);
    this.uploading.set(true);
    this.uploadingCount.set(files.length);

    // Upload files sequentially
    for (const file of files) {
      try {
        await this.uploadFile(file);
      } catch (error) {
        console.error('Upload failed:', error);
        const errorMsg =
          error instanceof Error ? error.message : 'Upload failed';
        this.uploadError.set(errorMsg);
        this.errorOccurred.emit(errorMsg);
      }
    }

    this.uploading.set(false);
    this.uploadingCount.set(0);
    input.value = '';
  }

  /**
   * Upload a single file
   */
  private async uploadFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fileUploadService
        .uploadFile(file, {
          allowDuplicates: this.allowDuplicates,
        })
        .subscribe({
          next: (response) => {
            // Filter out empty progress events
            if (!response || Object.keys(response).length === 0) {
              return; // Skip empty response objects from progress events
            }

            if (response.success && response.data) {
              const assetData: AssetData = {
                id: response.data.id,
                fileSize: response.data.fileSize,
                originalName: response.data.originalName,
                mimeType: response.data.mimeType,
                signedUrls: response.data.signedUrls,
                uploadedAt: new Date(),
              };

              this.assets.update((current) => [...current, assetData]);
              this.assetUploaded.emit(assetData);
              resolve();
            }
            // Ignore intermediate states - errors will come through error handler
          },
          error: (error) => {
            reject(error);
          },
        });
    });
  }

  /**
   * Insert asset marker into template
   */
  insertAsset(asset: AssetData) {
    this.assetInserted.emit({
      assetId: asset.id,
      assetName: asset.originalName || 'asset',
    });
  }

  /**
   * View asset in full size
   */
  viewAsset(asset: AssetData) {
    const url = asset.signedUrls?.view;
    if (url) {
      window.open(url, '_blank');
    }
  }

  /**
   * Remove asset from list
   */
  removeAsset(asset: AssetData) {
    this.assets.update((current) => current.filter((a) => a.id !== asset.id));
    this.assetRemoved.emit(asset.id);
  }

  /**
   * Check if mime type is an image
   */
  isImage(mimeType: string | undefined): boolean {
    return mimeType?.startsWith('image/') || false;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toUpperCase() || '' : '';
  }

  /**
   * Handle image load errors
   */
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
