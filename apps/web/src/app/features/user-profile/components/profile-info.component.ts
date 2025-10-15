import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../users/services/user.service';
import {
  AvatarUploadComponent,
  AvatarUploadResult,
} from './avatar-upload.component';

@Component({
  selector: 'ax-profile-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatCardModule,
    AvatarUploadComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Profile Picture Section -->
      <div class="flex items-center space-x-6">
        <ax-avatar-upload
          [avatarUrl]="userProfile?.avatar"
          [displayName]="getDisplayName()"
          (avatarChange)="onAvatarChange($event)"
          (uploadStart)="onAvatarUploadStart()"
          (uploadComplete)="onAvatarUploadComplete($event)"
          (uploadError)="onAvatarUploadError($event)"
        ></ax-avatar-upload>

        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {{ getDisplayName() }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ userProfile?.email }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Member since {{ formatDate(userProfile?.createdAt) }}
          </p>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Profile Information Form -->
      <form [formGroup]="profileForm" class="space-y-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Personal Information
        </h3>

        <!-- Name Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>First Name</mat-label>
            <input
              matInput
              formControlName="firstName"
              placeholder="Enter your first name"
            />
            <mat-icon matSuffix>person</mat-icon>
            <mat-error
              *ngIf="profileForm.get('firstName')?.hasError('required')"
            >
              First name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Last Name</mat-label>
            <input
              matInput
              formControlName="lastName"
              placeholder="Enter your last name"
            />
            <mat-icon matSuffix>person</mat-icon>
            <mat-error
              *ngIf="profileForm.get('lastName')?.hasError('required')"
            >
              Last name is required
            </mat-error>
          </mat-form-field>
        </div>

        <!-- Username and Email -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Username</mat-label>
            <input
              matInput
              formControlName="username"
              placeholder="Enter your username"
            />
            <mat-icon matSuffix>alternate_email</mat-icon>
            <mat-error
              *ngIf="profileForm.get('username')?.hasError('required')"
            >
              Username is required
            </mat-error>
            <mat-error
              *ngIf="profileForm.get('username')?.hasError('minlength')"
            >
              Username must be at least 3 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email</mat-label>
            <input
              matInput
              formControlName="email"
              placeholder="Enter your email"
              type="email"
            />
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
              Please enter a valid email address
            </mat-error>
          </mat-form-field>
        </div>

        <!-- Bio -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Bio</mat-label>
          <textarea
            matInput
            formControlName="bio"
            placeholder="Tell us about yourself..."
            rows="4"
            maxlength="500"
          ></textarea>
          <mat-icon matSuffix>description</mat-icon>
          <mat-hint>{{ getBioLength() }}/500 characters</mat-hint>
        </mat-form-field>

        <!-- Account Status (Read-only) -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
            Account Status
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Role:</span>
              <span
                class="font-medium text-gray-900 dark:text-gray-100 capitalize"
              >
                {{ userProfile?.role }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Status:</span>
              <span
                class="font-medium capitalize"
                [ngClass]="getStatusColor(userProfile?.status)"
              >
                {{ userProfile?.status }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400"
                >Email Verified:</span
              >
              <span
                class="font-medium"
                [ngClass]="
                  userProfile?.emailVerified
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
                {{ userProfile?.emailVerified ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400"
                >Last Updated:</span
              >
              <span class="font-medium text-gray-900 dark:text-gray-100">
                {{ formatDate(userProfile?.updatedAt) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-2">
          <button
            mat-button
            type="button"
            (click)="resetForm()"
            [disabled]="!hasChanges()"
          >
            Reset Changes
          </button>
          <button
            mat-raised-button
            color="primary"
            type="button"
            (click)="saveChanges()"
            [disabled]="profileForm.invalid || !hasChanges() || isSaving()"
          >
            @if (isSaving()) {
              <ng-container>
                <mat-icon class="mr-2 animate-spin">sync</mat-icon>
                Saving...
              </ng-container>
            } @else {
              <ng-container>
                <mat-icon class="mr-2">save</mat-icon>
                Save Changes
              </ng-container>
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-form-field {
        margin-bottom: 4px;
      }

      .status-active {
        @apply text-green-600 dark:text-green-400;
      }

      .status-inactive {
        @apply text-red-600 dark:text-red-400;
      }

      .status-pending {
        @apply text-yellow-600 dark:text-yellow-400;
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
    `,
  ],
})
export class ProfileInfoComponent implements OnChanges {
  @Input() userProfile: any = null;
  @Output() profileChange = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  isSaving = signal(false);

  profileForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    bio: ['', [Validators.maxLength(500)]],
  });

  private originalValues: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userProfile'] && this.userProfile) {
      this.loadProfileData();
    }
  }

  private loadProfileData(): void {
    if (this.userProfile) {
      const profileData = {
        firstName: this.userProfile.firstName || '',
        lastName: this.userProfile.lastName || '',
        username: this.userProfile.username || '',
        email: this.userProfile.email || '',
        bio: this.userProfile.bio || '',
      };

      this.profileForm.patchValue(profileData);
      this.originalValues = { ...profileData };
    }
  }

  getDisplayName(): string {
    if (!this.userProfile) return 'User';
    const firstName = this.userProfile.firstName || '';
    const lastName = this.userProfile.lastName || '';
    return (
      `${firstName} ${lastName}`.trim() || this.userProfile.username || 'User'
    );
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  }

  getBioLength(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }

  getStatusColor(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'inactive':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  hasChanges(): boolean {
    if (!this.originalValues || Object.keys(this.originalValues).length === 0) {
      return false;
    }

    const currentValues = this.profileForm.value;
    return Object.keys(this.originalValues).some(
      (key) =>
        currentValues[key as keyof typeof currentValues] !==
        this.originalValues[key],
    );
  }

  resetForm(): void {
    this.profileForm.patchValue(this.originalValues);
  }

  async saveChanges(): Promise<void> {
    if (!this.profileForm.valid || !this.hasChanges()) return;

    this.isSaving.set(true);

    try {
      const formValue = this.profileForm.value;
      const changes = {
        firstName: formValue.firstName || undefined,
        lastName: formValue.lastName || undefined,
        username: formValue.username || undefined,
        email: formValue.email || undefined,
        bio: formValue.bio || undefined,
      };
      const updatedProfile = await this.userService
        .updateProfile(changes)
        .toPromise();

      // Update original values to reflect saved state
      this.originalValues = { ...changes };

      // Emit the updated profile to parent component
      this.profileChange.emit(updatedProfile);

      this.snackBar.open('Profile updated successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });
    } catch (error: any) {
      this.snackBar.open(error.message || 'Failed to update profile', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });
    } finally {
      this.isSaving.set(false);
    }
  }

  onAvatarChange(avatarUrl: string): void {
    // Update the local profile data
    if (this.userProfile) {
      this.userProfile = {
        ...this.userProfile,
        avatar: avatarUrl,
      };

      // Emit the updated profile
      this.profileChange.emit(this.userProfile);
    }
  }

  onAvatarUploadStart(): void {
    console.log('Avatar upload started');
  }

  onAvatarUploadComplete(result: AvatarUploadResult): void {
    if (result.success && result.avatarUrl) {
      console.log('Avatar upload completed:', result.avatarUrl);
      this.onAvatarChange(result.avatarUrl);
    }
  }

  onAvatarUploadError(error: string): void {
    console.error('Avatar upload error:', error);
    // Error is already handled by the AvatarUploadComponent with snackbar
  }
}
