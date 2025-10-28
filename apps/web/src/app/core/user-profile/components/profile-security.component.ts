import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../users/services/user.service';

@Component({
  selector: 'ax-profile-security',
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
  ],
  template: `
    <div class="space-y-6">
      <!-- Password Change Section -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Change Password
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Ensure your account is using a long, random password to stay secure.
        </p>

        <form
          [formGroup]="passwordForm"
          (ngSubmit)="onPasswordChange()"
          class="space-y-4"
        >
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Current Password</mat-label>
            <input
              matInput
              formControlName="currentPassword"
              type="password"
              required
              autocomplete="current-password"
            />
            <mat-icon matSuffix>lock</mat-icon>
            <mat-error
              *ngIf="passwordForm.get('currentPassword')?.hasError('required')"
            >
              Current password is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>New Password</mat-label>
            <input
              matInput
              formControlName="newPassword"
              type="password"
              required
              autocomplete="new-password"
            />
            <mat-icon matSuffix>lock_reset</mat-icon>
            <mat-error
              *ngIf="passwordForm.get('newPassword')?.hasError('required')"
            >
              New password is required
            </mat-error>
            <mat-error
              *ngIf="passwordForm.get('newPassword')?.hasError('minlength')"
            >
              Password must be at least 8 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Confirm New Password</mat-label>
            <input
              matInput
              formControlName="confirmPassword"
              type="password"
              required
              autocomplete="new-password"
            />
            <mat-icon matSuffix>lock_reset</mat-icon>
            <mat-error
              *ngIf="passwordForm.get('confirmPassword')?.hasError('required')"
            >
              Password confirmation is required
            </mat-error>
            <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
              Passwords do not match
            </mat-error>
          </mat-form-field>

          <div class="flex gap-2">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="passwordForm.invalid || isChangingPassword()"
              class="flex-1"
            >
              @if (isChangingPassword()) {
                <ng-container>
                  <mat-icon class="mr-2">refresh</mat-icon>
                  Changing Password...
                </ng-container>
              } @else {
                <ng-container>
                  <mat-icon class="mr-2">security</mat-icon>
                  Change Password
                </ng-container>
              }
            </button>

            <button
              mat-button
              type="button"
              (click)="resetPasswordForm()"
              [disabled]="isChangingPassword()"
            >
              Reset
            </button>
          </div>

          @if (passwordChangeMessage()) {
            <div class="p-3 rounded-md" [ngClass]="getMessageClasses()">
              <div class="flex items-center">
                <mat-icon class="mr-2">
                  {{
                    passwordChangeMessage()?.type === 'success'
                      ? 'check_circle'
                      : 'error'
                  }}
                </mat-icon>
                {{ passwordChangeMessage()?.text }}
              </div>
            </div>
          }
        </form>
      </div>

      <mat-divider></mat-divider>

      <!-- Security Information -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Security Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Password Strength Requirements -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4
              class="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center"
            >
              <mat-icon class="mr-2 text-blue-600">info</mat-icon>
              Password Requirements
            </h4>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li class="flex items-center">
                <mat-icon
                  class="mr-2 text-green-600"
                  style="font-size: 16px; height: 16px; width: 16px;"
                  >check</mat-icon
                >
                At least 8 characters long
              </li>
              <li class="flex items-center">
                <mat-icon
                  class="mr-2 text-blue-600"
                  style="font-size: 16px; height: 16px; width: 16px;"
                  >recommend</mat-icon
                >
                Mix of uppercase and lowercase letters
              </li>
              <li class="flex items-center">
                <mat-icon
                  class="mr-2 text-blue-600"
                  style="font-size: 16px; height: 16px; width: 16px;"
                  >recommend</mat-icon
                >
                Include numbers and special characters
              </li>
              <li class="flex items-center">
                <mat-icon
                  class="mr-2 text-blue-600"
                  style="font-size: 16px; height: 16px; width: 16px;"
                  >recommend</mat-icon
                >
                Avoid common passwords and personal information
              </li>
            </ul>
          </div>

          <!-- Security Status -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4
              class="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center"
            >
              <mat-icon class="mr-2 text-green-600">shield</mat-icon>
              Security Status
            </h4>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400"
                  >Two-Factor Authentication:</span
                >
                <span class="text-red-600 dark:text-red-400 font-medium"
                  >Disabled</span
                >
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400"
                  >Last Password Change:</span
                >
                <span class="text-gray-900 dark:text-gray-100 font-medium"
                  >Never</span
                >
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400"
                  >Login Sessions:</span
                >
                <span class="text-blue-600 dark:text-blue-400 font-medium"
                  >1 active</span
                >
              </div>
            </div>
            <div
              class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600"
            >
              <button mat-button color="primary" class="text-sm" disabled>
                <mat-icon
                  class="mr-1"
                  style="font-size: 16px; height: 16px; width: 16px;"
                  >settings</mat-icon
                >
                Manage Security Settings (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Active Sessions -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Active Sessions
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Monitor and manage your active login sessions across devices.
        </p>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <mat-icon class="mr-3 text-green-600">laptop</mat-icon>
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">
                  Current Session
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Browser • {{ getCurrentLocation() }} • Active now
                </p>
              </div>
            </div>
            <span
              class="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded"
            >
              Current
            </span>
          </div>
        </div>

        <div class="mt-4">
          <button mat-button color="primary" disabled>
            <mat-icon class="mr-2">manage_accounts</mat-icon>
            View All Sessions (Coming Soon)
          </button>
        </div>
      </div>
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

      .success-message {
        @apply bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200;
      }

      .error-message {
        @apply bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200;
      }
    `,
  ],
})
export class ProfileSecurityComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  isChangingPassword = signal(false);
  passwordChangeMessage = signal<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  passwordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  passwordMatchValidator(form: AbstractControl) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  getMessageClasses(): string {
    const message = this.passwordChangeMessage();
    if (!message) return '';

    return message.type === 'success'
      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200';
  }

  getCurrentLocation(): string {
    // Simple location detection (could be enhanced with actual geolocation)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone.split('/').pop()?.replace('_', ' ') || 'Unknown Location';
  }

  async onPasswordChange(): Promise<void> {
    if (this.passwordForm.invalid) return;

    this.isChangingPassword.set(true);
    this.passwordChangeMessage.set(null);

    try {
      const formValue = this.passwordForm.value;

      await this.userService.changePassword({
        currentPassword: formValue.currentPassword!,
        newPassword: formValue.newPassword!,
        confirmPassword: formValue.confirmPassword!,
      });

      this.passwordChangeMessage.set({
        type: 'success',
        text: 'Password changed successfully! You can now use your new password to sign in.',
      });

      this.resetPasswordForm();
    } catch (error: any) {
      this.passwordChangeMessage.set({
        type: 'error',
        text:
          error.message ||
          'Failed to change password. Please check your current password and try again.',
      });
    } finally {
      this.isChangingPassword.set(false);
    }
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.passwordChangeMessage.set(null);
  }
}
