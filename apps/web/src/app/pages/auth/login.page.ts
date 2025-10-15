import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-6">

        <!-- Logo and Header -->
        <div class="text-center">
          <div class="mx-auto h-20 w-20 flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30">
            <mat-icon class="text-white text-3xl">shield</mat-icon>
          </div>
          <h2 class="mt-6 text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            Sign in to your AegisX account
          </p>
        </div>

        <!-- Login Form Card - Tremor Style -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

            <!-- Error Alert - Tremor Style -->
            @if (errorMessage()) {
              <div
                class="rounded-lg bg-red-50 p-4 border border-red-200 mb-6"
                data-testid="login-error"
                role="alert"
                aria-live="polite"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0">
                    <div class="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                      <mat-icon class="text-red-600 !text-sm">error</mat-icon>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-red-900">{{ errorMessage() }}</p>
                  </div>
                </div>
              </div>
            }

            <!-- Email Field - Tremor Style -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Email
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
                  [class.border-slate-300]="!loginForm.get('email')?.invalid || !loginForm.get('email')?.touched"
                  [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  [class.bg-red-50]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  [attr.aria-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  required
                >
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <mat-icon class="text-slate-400 !text-base">email</mat-icon>
                </div>
              </div>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <p class="mt-1.5 text-xs text-red-600">Email is required</p>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <p class="mt-1.5 text-xs text-red-600">Please enter a valid email address</p>
              }
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
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  class="w-full px-4 py-2.5 text-sm border rounded-lg transition-colors pr-10
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                         placeholder:text-slate-400"
                  [class.border-slate-300]="!loginForm.get('password')?.invalid || !loginForm.get('password')?.touched"
                  [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  [class.bg-red-50]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  [attr.aria-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  required
                >
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  [attr.aria-label]="hidePassword() ? 'Show password' : 'Hide password'"
                >
                  <mat-icon class="!text-base">{{ hidePassword() ? 'visibility' : 'visibility_off' }}</mat-icon>
                </button>
              </div>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <p class="mt-1.5 text-xs text-red-600">Password is required</p>
              }
              @if (loginForm.get('password')?.hasError('minlength') && loginForm.get('password')?.touched) {
                <p class="mt-1.5 text-xs text-red-600">Password must be at least 6 characters</p>
              }
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between mb-6">
              <label class="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  formControlName="rememberMe"
                  class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                >
                <span class="ml-2 text-sm text-slate-700 group-hover:text-slate-900">Remember me</span>
              </label>
              <a
                routerLink="/forgot-password"
                class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <!-- Submit Button - Tremor Style -->
            <button
              type="submit"
              class="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:bg-slate-300 disabled:cursor-not-allowed
                     transition-colors duration-200 shadow-sm"
              [disabled]="loginForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <mat-spinner diameter="16" class="inline"></mat-spinner>
                  <span>Signing in...</span>
                </span>
              } @else {
                Sign in
              }
            </button>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-200"></div>
              </div>
              <div class="relative flex justify-center text-xs">
                <span class="px-2 bg-white text-slate-500">Don't have an account?</span>
              </div>
            </div>

            <!-- Sign Up Link -->
            <div class="text-center">
              <a
                routerLink="/register"
                class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Create an account
              </a>
            </div>
          </form>
        </div>

        <!-- Demo Credentials - Tremor Style (Development Only) -->
        @if (isDevelopment()) {
          <div class="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <mat-icon class="text-blue-600 !text-base">info</mat-icon>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-slate-900 mb-3">Quick Login (Dev Only)</h4>
                <div class="space-y-2">
                  <!-- Admin Button -->
                  <button
                    type="button"
                    (click)="fillDemoCredentials('admin')"
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg border border-slate-200
                           hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <mat-icon class="text-white !text-sm">admin_panel_settings</mat-icon>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-semibold text-slate-900 group-hover:text-blue-700">Admin Account</div>
                      <div class="text-xs text-slate-500 truncate">admin@aegisx.local</div>
                    </div>
                    <mat-icon class="text-slate-400 group-hover:text-blue-600 !text-base">arrow_forward</mat-icon>
                  </button>

                  <!-- Demo Button -->
                  <button
                    type="button"
                    (click)="fillDemoCredentials('demo')"
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg border border-slate-200
                           hover:border-green-300 hover:bg-green-50 transition-all group"
                  >
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <mat-icon class="text-white !text-sm">person</mat-icon>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-semibold text-slate-900 group-hover:text-green-700">Demo Account</div>
                      <div class="text-xs text-slate-500 truncate">demo@aegisx.local</div>
                    </div>
                    <mat-icon class="text-slate-400 group-hover:text-green-600 !text-base">arrow_forward</mat-icon>
                  </button>
                </div>
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

      /* Custom checkbox styling */
      input[type='checkbox'] {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-color: white;
        border: 1px solid #cbd5e1;
        border-radius: 0.25rem;
        cursor: pointer;
        position: relative;
        transition: all 0.2s;
      }

      input[type='checkbox']:checked {
        background-color: #2563eb;
        border-color: #2563eb;
      }

      input[type='checkbox']:checked::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 0.375rem;
        height: 0.625rem;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: translate(-50%, -60%) rotate(45deg);
      }

      input[type='checkbox']:focus {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }

      /* Icon size adjustments - allow custom sizes */
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

      /* Code blocks */
      code {
        font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        font-size: 0.75rem;
      }
    `,
  ],
})
export class LoginPage {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals for reactive state
  protected isLoading = signal<boolean>(false);
  protected errorMessage = signal<string>('');
  protected hidePassword = signal<boolean>(true);
  protected isDevelopment = signal<boolean>(!this.isProduction());

  // Reactive form
  protected loginForm: FormGroup;

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true,
      });
      // Don't mark as touched when loading remembered email
      this.loginForm.get('email')?.markAsUntouched();
    }
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password, rememberMe } = this.loginForm.value;

    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Navigation is handled by AuthService
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.message || 'Login failed. Please try again.',
        );
      },
    });
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  protected fillDemoCredentials(type: 'admin' | 'demo'): void {
    const credentials = {
      admin: {
        email: 'admin@aegisx.local',
        password: 'Admin123!',
      },
      demo: {
        email: 'demo@aegisx.local',
        password: 'Demo123!',
      },
    };

    const { email, password } = credentials[type];

    this.loginForm.patchValue({
      email,
      password,
      rememberMe: false,
    });

    // Mark fields as touched to show they're filled
    this.loginForm.get('email')?.markAsTouched();
    this.loginForm.get('password')?.markAsTouched();
  }

  private isProduction(): boolean {
    // Check if we're in production mode
    // You can customize this based on your environment setup
    return (
      window.location.hostname === 'aegisx.com' ||
      window.location.hostname === 'www.aegisx.com' ||
      localStorage.getItem('environment') === 'production'
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
