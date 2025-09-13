import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../users/user.service';

export interface AvatarUploadResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

@Component({
  selector: 'ax-avatar-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="avatar-upload-container">
      <!-- Avatar Display -->
      <div class="relative">
        <div
          class="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          [class.border-primary]="isDragOver()"
        >
          @if (currentAvatarUrl()) {
            <img
              [src]="currentAvatarUrl()"
              [alt]="displayName + ' avatar'"
              class="w-full h-full object-cover"
            />
          } @else {
            <mat-icon
              class="text-gray-500 dark:text-gray-400"
              style="font-size: 48px; height: 48px; width: 48px;"
            >
              person
            </mat-icon>
          }

          <!-- Upload Progress Overlay -->
          @if (isUploading()) {
            <div
              class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
            >
              <div class="text-center">
                <mat-icon
                  class="text-white animate-spin mb-1"
                  style="font-size: 24px;"
                >
                  sync
                </mat-icon>
                <div class="text-white text-xs">
                  {{ uploadProgressValue() }}%
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Upload Button -->
        <button
          mat-mini-fab
          color="primary"
          class="absolute bottom-0 right-0 transform translate-x-1 translate-y-1"
          [disabled]="isUploading()"
          (click)="triggerFileInput()"
          matTooltip="Change profile picture"
        >
          @if (isUploading()) {
            <mat-icon class="animate-spin">sync</mat-icon>
          } @else {
            <mat-icon>photo_camera</mat-icon>
          }
        </button>
      </div>

      <!-- Drag & Drop Zone (when no avatar) -->
      @if (!currentAvatarUrl() && !isUploading()) {
        <div
          class="mt-4 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center transition-colors duration-200"
          [class.border-primary]="isDragOver()"
          [class.bg-primary-50]="isDragOver()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <mat-icon
            class="text-gray-400 mb-2"
            style="font-size: 48px; height: 48px; width: 48px;"
          >
            cloud_upload
          </mat-icon>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop your photo here, or
            <button
              type="button"
              class="text-primary-600 hover:text-primary-500 underline"
              (click)="triggerFileInput()"
            >
              browse
            </button>
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-500">
            JPG, PNG or WebP up to 5MB
          </p>
        </div>
      }

      <!-- Upload Progress Bar -->
      @if (isUploading()) {
        <div class="mt-4">
          <mat-progress-bar
            mode="determinate"
            [value]="uploadProgressValue()"
            class="w-full"
          ></mat-progress-bar>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
            Uploading... {{ uploadProgressValue() }}%
          </p>
        </div>
      }

      <!-- Hidden File Input -->
      <input
        #fileInput
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        (change)="onFileSelected($event)"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .avatar-upload-container {
        max-width: 300px;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }

      .border-primary {
        border-color: rgb(var(--mat-primary-500-rgb)) !important;
      }

      .bg-primary-50 {
        background-color: rgb(var(--mat-primary-50-rgb)) !important;
      }

      .text-primary-600 {
        color: rgb(var(--mat-primary-600-rgb)) !important;
      }

      .text-primary-500:hover {
        color: rgb(var(--mat-primary-500-rgb)) !important;
      }
    `,
  ],
})
export class AvatarUploadComponent implements OnInit, OnChanges {
  @Input() avatarUrl: string | null = null;
  @Input() displayName: string = 'User';
  @Input() maxSizeInMB: number = 5;
  @Input() disabled: boolean = false;

  @Output() avatarChange = new EventEmitter<string>();
  @Output() uploadStart = new EventEmitter<void>();
  @Output() uploadComplete = new EventEmitter<AvatarUploadResult>();
  @Output() uploadError = new EventEmitter<string>();

  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  // Signals for reactive state management
  currentAvatarUrl = signal<string | null>(null);
  isUploading = signal(false);
  uploadProgressValue = signal(0);
  isDragOver = signal(false);

  ngOnInit() {
    this.currentAvatarUrl.set(this.avatarUrl);
  }

  ngOnChanges() {
    this.currentAvatarUrl.set(this.avatarUrl);
  }

  triggerFileInput() {
    if (this.disabled || this.isUploading()) return;

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled && !this.isUploading()) {
      this.isDragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (this.disabled || this.isUploading()) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const error = 'Please select a valid image file (JPG, PNG, or WebP)';
      this.showError(error);
      this.uploadError.emit(error);
      return;
    }

    // Validate file size
    const maxSizeInBytes = this.maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      const error = `File size must be less than ${this.maxSizeInMB}MB`;
      this.showError(error);
      this.uploadError.emit(error);
      return;
    }

    // For now, create a preview and simulate upload
    // TODO: In production, this should open a cropping dialog first
    this.uploadFile(file);
  }

  private uploadFile(file: File) {
    this.isUploading.set(true);
    this.uploadProgressValue.set(0);
    this.uploadStart.emit();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('avatar', file);

    // Call actual API
    this.userService
      .uploadAvatar(formData, (progress) => {
        this.uploadProgressValue.set(progress);
      })
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.isUploading.set(false);
            this.currentAvatarUrl.set(response.data.avatar);
            this.avatarChange.emit(response.data.avatar);

            const result: AvatarUploadResult = {
              success: true,
              avatarUrl: response.data.avatar,
            };

            this.uploadComplete.emit(result);
            this.showSuccess('Profile picture updated successfully!');
          }
        },
        error: (error) => {
          this.isUploading.set(false);
          this.uploadProgressValue.set(0);
          const errorMessage = error.message || 'Failed to upload avatar';
          this.showError(errorMessage);
          this.uploadError.emit(errorMessage);
        },
      });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}
