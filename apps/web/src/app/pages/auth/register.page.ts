import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-register',
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
            <mat-icon class="text-white text-3xl">person_add</mat-icon>
          </div>
          <h2 class="mt-6 text-3xl font-bold text-slate-900 tracking-tight">
            Create your account
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            Sign up to get started with your account
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
                    Redirecting to dashboard...
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

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Email Field - Tremor Style -->
            <div class="mb-5">
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
                    !registerForm.get('email')?.invalid ||
                    !registerForm.get('email')?.touched
                  "
                  [class.border-red-500]="
                    registerForm.get('email')?.invalid &&
                    registerForm.get('email')?.touched
                  "
                  [class.bg-red-50]="
                    registerForm.get('email')?.invalid &&
                    registerForm.get('email')?.touched
                  "
                  [attr.aria-invalid]="
                    registerForm.get('email')?.invalid &&
                    registerForm.get('email')?.touched
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
                registerForm.get('email')?.hasError('required') &&
                registerForm.get('email')?.touched
              ) {
                <p class="mt-1.5 text-xs text-red-600">Email is required</p>
              }
              @if (
                registerForm.get('email')?.hasError('email') &&
                registerForm.get('email')?.touched
              ) {
                <p class="mt-1.5 text-xs text-red-600">
                  Please enter a valid email address
                </p>
              }
            </div>

            <!-- Username Field - Tremor Style -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <div class="relative">
                <input
                  type="text"
                  formControlName="username"
                  placeholder="johndoe"
                  autocomplete="username"
                  class="w-full px-4 py-2.5 text-sm border rounded-lg transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                         placeholder:text-slate-400"
                  [class.border-slate-300]="
                    !registerForm.get('username')?.invalid ||
                    !registerForm.get('username')?.touched
                  "
                  [class.border-red-500]="
                    registerForm.get('username')?.invalid &&
                    registerForm.get('username')?.touched
                  "
                  [class.bg-red-50]="
                    registerForm.get('username')?.invalid &&
                    registerForm.get('username')?.touched
                  "
                  [attr.aria-invalid]="
                    registerForm.get('username')?.invalid &&
                    registerForm.get('username')?.touched
                  "
                  required
                />
                <div
                  class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                >
                  <mat-icon class="text-slate-400 !text-base"
                    >account_circle</mat-icon
                  >
                </div>
              </div>
              @if (
                registerForm.get('username')?.hasError('required') &&
                registerForm.get('username')?.touched
              ) {
                <p class="mt-1.5 text-xs text-red-600">Username is required</p>
              }
              @if (
                registerForm.get('username')?.hasError('minlength') &&
                registerForm.get('username')?.touched
              ) {
                <p class="mt-1.5 text-xs text-red-600">
                  Username must be at least 3 characters
                </p>
              }
            </div>

            <!-- First Name and Last Name - Two Column Grid -->
            <div class="grid grid-cols-2 gap-4 mb-5">
              <!-- First Name Field -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  formControlName="firstName"
                  placeholder="John"
                  autocomplete="given-name"
                  class="w-full px-4 py-2.5 text-sm border rounded-lg transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                         placeholder:text-slate-400"
                  [class.border-slate-300]="
                    !registerForm.get('firstName')?.invalid ||
                    !registerForm.get('firstName')?.touched
                  "
                  [class.border-red-500]="
                    registerForm.get('firstName')?.invalid &&
                    registerForm.get('firstName')?.touched
                  "
                  [class.bg-red-50]="
                    registerForm.get('firstName')?.invalid &&
                    registerForm.get('firstName')?.touched
                  "
                  [attr.aria-invalid]="
                    registerForm.get('firstName')?.invalid &&
                    registerForm.get('firstName')?.touched
                  "
                  required
                />
                @if (
                  registerForm.get('firstName')?.hasError('required') &&
                  registerForm.get('firstName')?.touched
                ) {
                  <p class="mt-1.5 text-xs text-red-600">Required</p>
                }
              </div>

              <!-- Last Name Field -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  formControlName="lastName"
                  placeholder="Doe"
                  autocomplete="family-name"
                  class="w-full px-4 py-2.5 text-sm border rounded-lg transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                         placeholder:text-slate-400"
                  [class.border-slate-300]="
                    !registerForm.get('lastName')?.invalid ||
                    !registerForm.get('lastName')?.touched
                  "
                  [class.border-red-500]="
                    registerForm.get('lastName')?.invalid &&
                    registerForm.get('lastName')?.touched
                  "
                  [class.bg-red-50]="
                    registerForm.get('lastName')?.invalid &&
                    registerForm.get('lastName')?.touched
                  "
                  [attr.aria-invalid]="
                    registerForm.get('lastName')?.invalid &&
                    registerForm.get('lastName')?.touched
                  "
                  required
                />
                @if (
                  registerForm.get('lastName')?.hasError('required') &&
                  registerForm.get('lastName')?.touched
                ) {
                  <p class="mt-1.5 text-xs text-red-600">Required</p>
                }
              </div>
            </div>

            <!-- Password Field - Tremor Style -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div class="relative">
                <input
                  [type]="hidePassword() ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Enter password"
                  autocomplete="new-password"
                  class="w-full px-4 py-2.5 text-sm border rounded-lg transition-colors pr-10
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                         placeholder:text-slate-400"
                  [class.border-slate-300]="
                    !registerForm.get('password')?.invalid ||
                    !registerForm.get('password')?.touched
                  "
                  [class.border-red-500]="
                    registerForm.get('password')?.invalid &&
                    registerForm.get('password')?.touched
                  "
                  [class.bg-red-50]="
                    registerForm.get('password')?.invalid &&
                    registerForm.get('password')?.touched
                  "
                  [attr.aria-invalid]="
                    registerForm.get('password')?.invalid &&
                    registerForm.get('password')?.touched
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
                registerForm.get('password')?.hasError('required') &&
                registerForm.get('password')?.touched
              ) {
                <p class="mt-1.5 text-xs text-red-600">Password is required</p>
              }
              @if (
                registerForm.get('password')?.hasError('minlength') &&
                registerForm.get('password')?.touched
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
                  placeholder="Confirm password"
                  autocomplete="new-password"
                  class="w-full px-4 py-2.5 text-sm border rounded-lg transition-colors pr-10
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                         placeholder:text-slate-400"
                  [class.border-slate-300]="
                    !registerForm.get('confirmPassword')?.invalid ||
                    !registerForm.get('confirmPassword')?.touched
                  "
                  [class.border-red-500]="
                    registerForm.get('confirmPassword')?.invalid &&
                    registerForm.get('confirmPassword')?.touched
                  "
                  [class.bg-red-50]="
                    registerForm.get('confirmPassword')?.invalid &&
                    registerForm.get('confirmPassword')?.touched
                  "
                  [attr.aria-invalid]="
                    registerForm.get('confirmPassword')?.invalid &&
                    registerForm.get('confirmPassword')?.touched
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
                registerForm.get('confirmPassword')?.hasError('required') &&
                registerForm.get('confirmPassword')?.touched
              ) {
                <p class="mt-1.5 text-xs text-red-600">
                  Please confirm your password
                </p>
              }
              @if (
                registerForm.hasError('passwordMismatch') &&
                registerForm.get('confirmPassword')?.touched
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
              [disabled]="registerForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <mat-spinner diameter="16" class="inline"></mat-spinner>
                  <span>Creating account...</span>
                </span>
              } @else {
                Create account
              }
            </button>

            <!-- Sign In Link -->
            <div class="mt-6 text-center">
              <span class="text-sm text-slate-600"
                >Already have an account?
              </span>
              <a
                routerLink="/login"
                class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in
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
                Account Information
              </h4>
              <ul class="space-y-1.5 text-xs text-slate-600">
                <li class="flex items-start gap-2">
                  <mat-icon class="text-blue-500 !text-xs mt-0.5"
                    >check_circle</mat-icon
                  >
                  <span>Password must be at least 8 characters</span>
                </li>
                <li class="flex items-start gap-2">
                  <mat-icon class="text-blue-500 !text-xs mt-0.5"
                    >check_circle</mat-icon
                  >
                  <span>Username must be unique</span>
                </li>
                <li class="flex items-start gap-2">
                  <mat-icon class="text-blue-500 !text-xs mt-0.5"
                    >check_circle</mat-icon
                  >
                  <span>Limited to 3 registrations per hour for security</span>
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
export class RegisterPage {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals for reactive state
  protected isLoading = signal<boolean>(false);
  protected errorMessage = signal<string>('');
  protected successMessage = signal<string>('');
  protected hidePassword = signal<boolean>(true);
  protected hideConfirmPassword = signal<boolean>(true);

  // Reactive form
  protected registerForm: FormGroup;

  constructor() {
    this.registerForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  protected onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { email, username, firstName, lastName, password } =
      this.registerForm.value;

    this.authService
      .register({ email, username, firstName, lastName, password })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set(
            'Account created successfully! Please check your email to verify your account.',
          );
          this.registerForm.reset();

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.message || 'Failed to create account. Please try again.',
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
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
