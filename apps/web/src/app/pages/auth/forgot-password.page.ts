import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { PasswordResetService } from '../../core/auth/services/password-reset.service';

@Component({
  selector: 'app-forgot-password',
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
            <mat-icon class="text-white text-3xl">lock_reset</mat-icon>
          </div>
          <h2 class="mt-6 text-3xl font-bold text-slate-900 tracking-tight">
            Reset your password
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <!-- Form Card - Tremor Style -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
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
                    Please check your email inbox (and spam folder) for the
                    reset link.
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

          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            <!-- Email Field - Tremor Style -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <div class="relative">
                <input
                  type="email"
                  formControlName="email"
                  placeholder="name@company.com"
                  autocomplete="email"
                  class="w-full px-4 py-2.5 text-sm border rounded-lg transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                         placeholder:text-slate-400"
                  [class.border-slate-300]="
                    !forgotPasswordForm.get('email')?.invalid ||
                    !forgotPasswordForm.get('email')?.touched
                  "
                  [class.border-red-500]="
                    forgotPasswordForm.get('email')?.invalid &&
                    forgotPasswordForm.get('email')?.touched
                  "
                  [class.bg-red-50]="
                    forgotPasswordForm.get('email')?.invalid &&
                    forgotPasswordForm.get('email')?.touched
                  "
                  [attr.aria-invalid]="
                    forgotPasswordForm.get('email')?.invalid &&
                    forgotPasswordForm.get('email')?.touched
                  "
                  required
                />
                <div
                  class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                >
                  <mat-icon class="text-slate-400 !text-base">email</mat-icon>
                </div>
              </div>
              @if (
                forgotPasswordForm.get('email')?.hasError('required') &&
                forgotPasswordForm.get('email')?.touched
              ) {
                <p class="mt-1.5 text-xs text-red-600">Email is required</p>
              }
              @if (
                forgotPasswordForm.get('email')?.hasError('email') &&
                forgotPasswordForm.get('email')?.touched
              ) {
                <p class="mt-1.5 text-xs text-red-600">
                  Please enter a valid email address
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
              [disabled]="forgotPasswordForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <mat-spinner diameter="16" class="inline"></mat-spinner>
                  <span>Sending reset link...</span>
                </span>
              } @else {
                Send reset link
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

        <!-- Info Card - Tremor Style -->
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
                Password Reset Information
              </h4>
              <ul class="space-y-1.5 text-xs text-slate-600">
                <li class="flex items-start gap-2">
                  <mat-icon class="text-blue-500 !text-xs mt-0.5"
                    >check_circle</mat-icon
                  >
                  <span>Reset link expires in 1 hour</span>
                </li>
                <li class="flex items-start gap-2">
                  <mat-icon class="text-blue-500 !text-xs mt-0.5"
                    >check_circle</mat-icon
                  >
                  <span>Check spam folder if not received</span>
                </li>
                <li class="flex items-start gap-2">
                  <mat-icon class="text-blue-500 !text-xs mt-0.5"
                    >check_circle</mat-icon
                  >
                  <span>Limited to 3 requests per hour for security</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
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
export class ForgotPasswordPage {
  private formBuilder = inject(FormBuilder);
  private passwordResetService = inject(PasswordResetService);

  // Signals for reactive state
  protected isLoading = signal<boolean>(false);
  protected errorMessage = signal<string>('');
  protected successMessage = signal<string>('');

  // Reactive form
  protected forgotPasswordForm: FormGroup;

  constructor() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  protected onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { email } = this.forgotPasswordForm.value;

    this.passwordResetService.requestPasswordReset(email).subscribe({
      next: (message) => {
        this.isLoading.set(false);
        this.successMessage.set(message);
        this.forgotPasswordForm.reset();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.message || 'Failed to send reset link. Please try again.',
        );
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach((key) => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }
}
