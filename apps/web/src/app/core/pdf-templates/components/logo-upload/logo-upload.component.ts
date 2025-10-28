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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileUploadService } from '../../../../shared/ui/components/file-upload/file-upload.service';

export interface LogoUploadData {
  id: string;
  fileSize?: number;
  originalName?: string;
  mimeType?: string;
  signedUrls?: {
    view?: string;
    thumbnail?: string;
  };
}

@Component({
  selector: 'app-logo-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  template: `
    <div class="logo-upload-section">
      <div class="upload-area">
        <input
          type="file"
          #fileInput
          accept="image/*"
          (change)="onLogoFileSelected($event)"
          class="file-input"
          aria-label="Upload logo file"
        />
        <button
          mat-raised-button
          color="accent"
          type="button"
          (click)="fileInput.click()"
          [disabled]="uploadingLogo()"
        >
          <mat-icon>cloud_upload</mat-icon>
          {{ uploadedLogo() ? 'Change Logo' : 'Upload Logo' }}
        </button>
        @if (uploadingLogo()) {
          <mat-spinner diameter="24" class="upload-spinner"></mat-spinner>
        }
      </div>

      @if (logoPreviewUrl()) {
        <div class="logo-preview-container">
          <div class="logo-preview">
            <img [src]="logoPreviewUrl()" alt="Logo preview" />
            <button
              mat-icon-button
              color="warn"
              type="button"
              (click)="removeLogo()"
              class="remove-logo-btn"
              matTooltip="Remove logo"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
          @if (uploadedLogo()) {
            <div class="logo-info">
              <p><strong>File:</strong> {{ uploadedLogo()?.originalName }}</p>
              <p>
                <strong>Size:</strong>
                {{ formatFileSize(uploadedLogo()?.fileSize || 0) }}
              </p>
              <p><strong>Type:</strong> {{ uploadedLogo()?.mimeType }}</p>
            </div>
          }
        </div>
      }

      @if (logoError()) {
        <mat-error class="logo-error">{{ logoError() }}</mat-error>
      }

      <mat-hint class="logo-hint">
        {{ helperText }}
      </mat-hint>
    </div>
  `,
  styles: [
    `
      .logo-upload-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 8px;
        border: 1px dashed rgba(0, 0, 0, 0.12);
      }

      .file-input {
        display: none;
      }

      .upload-area {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .upload-spinner {
        display: inline-block;
      }

      .logo-preview-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .logo-preview {
        position: relative;
        width: fit-content;
        max-width: 400px;
        padding: 16px;
        background: white;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .logo-preview img {
        max-width: 100%;
        max-height: 200px;
        display: block;
        object-fit: contain;
      }

      .remove-logo-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .logo-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .logo-info p {
        margin: 0;
      }

      .logo-error {
        color: #f44336;
        font-size: 12px;
      }

      .logo-hint {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }

      @media (max-width: 768px) {
        .logo-preview {
          max-width: 100%;
        }
      }
    `,
  ],
})
export class LogoUploadComponent implements OnInit {
  private fileUploadService = inject(FileUploadService);

  /**
   * Initial logo file ID (for edit mode)
   */
  @Input() initialLogoId?: string;

  /**
   * Helper text to display below the upload section
   */
  @Input() helperText = 'Upload a logo image (PNG, JPG, SVG)';

  /**
   * Emits when a logo is successfully uploaded
   * Returns the logo file ID and metadata
   */
  @Output() logoUploaded = new EventEmitter<LogoUploadData>();

  /**
   * Emits when logo is removed
   */
  @Output() logoRemoved = new EventEmitter<void>();

  /**
   * Emits when there's an error during upload or loading
   */
  @Output() errorOccurred = new EventEmitter<string>();

  // Component state
  uploadingLogo = signal(false);
  uploadedLogo = signal<LogoUploadData | null>(null);
  logoPreviewUrl = signal<string | null>(null);
  logoError = signal<string | null>(null);

  ngOnInit() {
    // Load existing logo if initialLogoId is provided
    if (this.initialLogoId) {
      this.loadExistingLogo(this.initialLogoId);
    }
  }

  /**
   * Load existing logo file data
   */
  private loadExistingLogo(logoId: string) {
    this.fileUploadService.getFile(logoId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const logoData: LogoUploadData = {
            id: response.data.id,
            fileSize: response.data.fileSize,
            originalName: response.data.originalName,
            mimeType: response.data.mimeType,
            signedUrls: response.data.signedUrls,
          };

          this.uploadedLogo.set(logoData);

          // Use signed URL from API response
          if (response.data.signedUrls?.view) {
            this.logoPreviewUrl.set(response.data.signedUrls.view);
          } else if (response.data.signedUrls?.thumbnail) {
            this.logoPreviewUrl.set(response.data.signedUrls.thumbnail);
          }
        }
      },
      error: (error) => {
        const errorMsg = 'Failed to load logo file';
        console.error(errorMsg, error);
        this.logoError.set(errorMsg);
        this.errorOccurred.emit(errorMsg);
      },
    });
  }

  /**
   * Handle logo file selection
   */
  async onLogoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validate file
    const validation = this.fileUploadService.validateFiles([file], {
      allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 1,
    });

    if (!validation[0].valid) {
      const errorMsg = validation[0].errors.join(', ');
      this.logoError.set(errorMsg);
      this.errorOccurred.emit(errorMsg);
      return;
    }

    this.logoError.set(null);

    // Generate preview
    const preview = await this.fileUploadService.generateFilePreview(file);
    if (preview) {
      this.logoPreviewUrl.set(preview);
    }

    // Upload file
    this.uploadingLogo.set(true);
    this.fileUploadService
      .uploadFile(file, {
        category: 'logo',
        isPublic: true,
      })
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const logoData: LogoUploadData = {
              id: response.data.id,
              fileSize: response.data.fileSize,
              originalName: response.data.originalName,
              mimeType: response.data.mimeType,
              signedUrls: response.data.signedUrls,
            };

            this.uploadedLogo.set(logoData);

            // Use signed URL from API response
            if (response.data.signedUrls?.view) {
              this.logoPreviewUrl.set(response.data.signedUrls.view);
            } else if (response.data.signedUrls?.thumbnail) {
              this.logoPreviewUrl.set(response.data.signedUrls.thumbnail);
            }

            this.uploadingLogo.set(false);
            console.log('Logo uploaded successfully:', logoData);

            // Emit the uploaded logo data
            this.logoUploaded.emit(logoData);
          }
        },
        error: (error) => {
          this.uploadingLogo.set(false);
          const errorMsg = error.message || 'Failed to upload logo';
          this.logoError.set(errorMsg);
          this.errorOccurred.emit(errorMsg);
          console.error('Logo upload error:', error);
        },
      });

    // Reset the file input
    input.value = '';
  }

  /**
   * Remove logo
   */
  removeLogo() {
    this.uploadedLogo.set(null);
    this.logoPreviewUrl.set(null);
    this.logoError.set(null);
    this.logoRemoved.emit();
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }

  /**
   * Check if logo is currently uploaded
   */
  hasLogo(): boolean {
    return !!this.uploadedLogo();
  }

  /**
   * Get current logo ID
   */
  getLogoId(): string | null {
    return this.uploadedLogo()?.id || null;
  }
}
