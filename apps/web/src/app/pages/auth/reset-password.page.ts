import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PasswordResetService } from '../../core/auth/services/password-reset.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full space-y-6">
        <!-- Logo and Header -->
        <div class="text-center">
          <div
            class="mx-auto h-20 w-20 flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30"
          >
            <mat-icon class="text-white text-3xl">lock_open</mat-icon>
          </div>
          <h2 class="mt-6 text-3xl font-bold text-slate-900 tracking-tight">
            Set new password
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            Enter your new password below
          </p>
        </div>

        <!-- Verifying Token State -->
        @if (isVerifying()) {
          <div
            class="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          >
            <div class="flex flex-col items-center justify-center gap-4">
              <mat-spinner diameter="40"></mat-spinner>
              <p class="text-sm text-slate-600">Verifying reset link...</p>
            </div>
          </div>
        }

        <!-- Invalid Token State -->
        @if (!isVerifying() && !isTokenValid()) {
          <div
            class="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          >
            <div
              class="rounded-lg bg-red-50 p-4 border border-red-200"
              role="alert"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <div
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-red-100"
                  >
                    <mat-icon class="text-red-600 !text-sm">error</mat-icon>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-red-900">
                    Invalid or expired reset link
                  </p>
                  <p class="mt-1 text-xs text-red-700">
                    This reset link is invalid or has expired. Please request a
                    new one.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6 text-center">
              <a
                routerLink="/forgot-password"
                class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
              >
                Request new reset link
              </a>
            </div>
          </div>
        }

        <!-- Valid Token - Show Form -->
        @if (!isVerifying() && isTokenValid()) {
          <div
            class="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          >
            <!-- Success Message -->
            @if (successMessage()) {
              <div
                class="rounded-lg bg-green-50 p-4 border border-green-200 mb-6"
                role="alert"
                aria-live="polite"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0">
                    <div
                      class="flex h-5 w-5 items-center justify-center rounded-full bg-green-100"
                    >
                      <mat-icon class="text-green-600 !text-sm"
                        >check_circle</mat-icon
                      >
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-green-900">
                      {{ successMessage() }}
                    </p>
                    <p class="mt-1 text-xs text-green-700">
                      Redirecting to login page...
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- Error Alert -->
            @if (errorMessage()) {
              <div
                class="rounded-lg bg-red-50 p-4 border border-red-200 mb-6"
                role="alert"
                aria-live="polite"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0">
                    <div
                      class="flex h-5 w-5 items-center justify-center rounded-full bg-red-100"
                    >
                      <mat-icon class="text-red-600 !text-sm">error</mat-icon>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-red-900">
                      {{ errorMessage() }}
                    </p>
                  </div>
                </div>
              </div>
            }

            <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
              <!-- New Password Field - Tremor Style -->
              <div class="mb-5">
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <div class="relative">
                  <input
                    [type]="hidePassword() ? 'password' : 'text'"
                    formControlName="newPassword"
                    placeholder="Enter new password"
                    autocomplete="new-password"
                    class="w-full px-4 py-2.5 text-sm border rounded-lg transition-colors pr-10
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                           placeholder:text-slate-400"
                    [class.border-slate-300]="
                      !resetPasswordForm.get('newPassword')?.invalid ||
                      !resetPasswordForm.get('newPassword')?.touched
                    "
                    [class.border-red-500]="
                      resetPasswordForm.get('newPassword')?.invalid &&
                      resetPasswordForm.get('newPassword')?.touched
                    "
                    [class.bg-red-50]="
                      resetPasswordForm.get('newPassword')?.invalid &&
                      resetPasswordForm.get('newPassword')?.touched
                    "
                    [attr.aria-invalid]="
                      resetPasswordForm.get('newPassword')?.invalid &&
                      resetPasswordForm.get('newPassword')?.touched
                    "
                    required
                  />
                  <button
                    type="button"
                    (click)="togglePasswordVisibility()"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                    [attr.aria-label]="
                      hidePassword() ? 'Show password' : 'Hide password'
                    "
                  >
                    <mat-icon class="!text-base">{{
                      hidePassword() ? 'visibility' : 'visibility_off'
                    }}</mat-icon>
                  </button>
                </div>
                @if (
                  resetPasswordForm.get('newPassword')?.hasError('required') &&
                  resetPasswordForm.get('newPassword')?.touched
                ) {
                  <p class="mt-1.5 text-xs text-red-600">
                    Password is required
                  </p>
                }
                @if (
                  resetPasswordForm.get('newPassword')?.hasError('minlength') &&
                  resetPasswordForm.get('newPassword')?.touched
                ) {
                  <p class="mt-1.5 text-xs text-red-600">
                    Password must be at least 8 characters
                  </p>
                }
              </div>

              <!-- Confirm Password Field - Tremor Style -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div class="relative">
                  <input
                    [type]="hideConfirmPassword() ? 'password' : 'text'"
                    formControlName="confirmPassword"
                    placeholder="Confirm new password"
                    autocomplete="new-password"
                    class="w-full px-4 py-2.5 text-sm border rounded-lg transition-colors pr-10
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                           placeholder:text-slate-400"
                    [class.border-slate-300]="
                      !resetPasswordForm.get('confirmPassword')?.invalid ||
                      !resetPasswordForm.get('confirmPassword')?.touched
                    "
                    [class.border-red-500]="
                      resetPasswordForm.get('confirmPassword')?.invalid &&
                      resetPasswordForm.get('confirmPassword')?.touched
                    "
                    [class.bg-red-50]="
                      resetPasswordForm.get('confirmPassword')?.invalid &&
                      resetPasswordForm.get('confirmPassword')?.touched
                    "
                    [attr.aria-invalid]="
                      resetPasswordForm.get('confirmPassword')?.invalid &&
                      resetPasswordForm.get('confirmPassword')?.touched
                    "
                    required
                  />
                  <button
                    type="button"
                    (click)="toggleConfirmPasswordVisibility()"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                    [attr.aria-label]="
                      hideConfirmPassword() ? 'Show password' : 'Hide password'
                    "
                  >
                    <mat-icon class="!text-base">{{
                      hideConfirmPassword() ? 'visibility' : 'visibility_off'
                    }}</mat-icon>
                  </button>
                </div>
                @if (
                  resetPasswordForm
                    .get('confirmPassword')
                    ?.hasError('required') &&
                  resetPasswordForm.get('confirmPassword')?.touched
                ) {
                  <p class="mt-1.5 text-xs text-red-600">
                    Please confirm your password
                  </p>
                }
                @if (
                  resetPasswordForm.hasError('passwordMismatch') &&
                  resetPasswordForm.get('confirmPassword')?.touched
                ) {
                  <p class="mt-1.5 text-xs text-red-600">
                    Passwords do not match
                  </p>
                }
              </div>

              <!-- Submit Button - Tremor Style -->
              <button
                type="submit"
                class="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:bg-slate-300 disabled:cursor-not-allowed
                       transition-colors duration-200 shadow-sm"
                [disabled]="resetPasswordForm.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <span class="flex items-center justify-center gap-2">
                    <mat-spinner diameter="16" class="inline"></mat-spinner>
                    <span>Resetting password...</span>
                  </span>
                } @else {
                  Reset password
                }
              </button>

              <!-- Back to Login Link -->
              <div class="mt-6 text-center">
                <a
                  routerLink="/login"
                  class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                >
                  <mat-icon class="!text-base">arrow_back</mat-icon>
                  Back to login
                </a>
              </div>
            </form>
          </div>
        }

        <!-- Password Requirements Info - Tremor Style -->
        @if (!isVerifying() && isTokenValid() && !successMessage()) {
          <div class="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50"
                >
                  <mat-icon class="text-blue-600 !text-base">info</mat-icon>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-slate-900 mb-2">
                  Password Requirements
                </h4>
                <ul class="space-y-1.5 text-xs text-slate-600">
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-blue-500 !text-xs mt-0.5"
                      >check_circle</mat-icon
                    >
                    <span>At least 8 characters long</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-blue-500 !text-xs mt-0.5"
                      >check_circle</mat-icon
                    >
                    <span>Both passwords must match</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <mat-icon class="text-blue-500 !text-xs mt-0.5"
                      >check_circle</mat-icon
                    >
                    <span>All active sessions will be terminated</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      /* Tremor-inspired spinner styling */
      .mat-spinner {
        --mdc-circular-progress-active-indicator-color: white !important;
      }

      ::ng-deep .mat-mdc-progress-spinner circle {
        stroke: white !important;
      }

      /* Blue spinner for verification */
      .mat-spinner:not(.inline) {
        --mdc-circular-progress-active-indicator-color: #2563eb !important;
      }

      .mat-spinner:not(.inline) ::ng-deep circle {
        stroke: #2563eb !important;
      }

      /* Icon size adjustments */
      .mat-icon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      /* Smooth transitions */
      input,
      button,
      a {
        transition: all 0.15s ease-in-out;
      }
    `,
  ],
})
export class ResetPasswordPage implements OnInit {
  private formBuilder = inject(FormBuilder);
  private passwordResetService = inject(PasswordResetService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals for reactive state
  protected isVerifying = signal<boolean>(true);
  protected isTokenValid = signal<boolean>(false);
  protected isLoading = signal<boolean>(false);
  protected errorMessage = signal<string>('');
  protected successMessage = signal<string>('');
  protected hidePassword = signal<boolean>(true);
  protected hideConfirmPassword = signal<boolean>(true);

  private resetToken: string | null = null;

  // Reactive form
  protected resetPasswordForm: FormGroup;

  constructor() {
    this.resetPasswordForm = this.formBuilder.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    // Get token from query parameter
    this.route.queryParams.subscribe((params) => {
      this.resetToken = params['token'];

      if (!this.resetToken) {
        this.isVerifying.set(false);
        this.isTokenValid.set(false);
        return;
      }

      // Verify token
      this.verifyToken(this.resetToken);
    });
  }

  private verifyToken(token: string): void {
    this.passwordResetService.verifyResetToken(token).subscribe({
      next: (response) => {
        this.isVerifying.set(false);
        this.isTokenValid.set(response.valid);
      },
      error: () => {
        this.isVerifying.set(false);
        this.isTokenValid.set(false);
      },
    });
  }

  protected onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.resetToken) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { newPassword } = this.resetPasswordForm.value;

    this.passwordResetService
      .resetPassword(this.resetToken, newPassword)
      .subscribe({
        next: (message) => {
          this.isLoading.set(false);
          this.successMessage.set(message);
          this.resetPasswordForm.reset();

          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.message || 'Failed to reset password. Please try again.',
          );
        },
      });
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  private passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.resetPasswordForm.controls).forEach((key) => {
      const control = this.resetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }
}
