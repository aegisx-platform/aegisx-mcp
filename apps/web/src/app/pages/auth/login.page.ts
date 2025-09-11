import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Logo and Header -->
        <div class="text-center">
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <mat-icon class="text-indigo-600">lock</mat-icon>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to AegisX
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        <!-- Login Form -->
        <mat-card class="p-6">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            
            <!-- Error Message -->
            @if (errorMessage()) {
              <div 
                class="rounded-md bg-red-50 p-4 border border-red-200"
                data-testid="login-error"
                role="alert"
                aria-live="polite"
              >
                <div class="flex">
                  <div class="flex-shrink-0">
                    <mat-icon class="h-5 w-5 text-red-400">error</mat-icon>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-red-800">{{ errorMessage() }}</p>
                  </div>
                </div>
              </div>
            }

            <!-- Email Field -->
            <div class="mb-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email address</mat-label>
              <input 
                matInput 
                type="email" 
                formControlName="email"
                placeholder="Enter your email"
                autocomplete="email"
                [attr.aria-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                required
              >
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>
            </div>

            <!-- Password Field -->
            <div class="mb-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
                placeholder="Enter your password"
                autocomplete="current-password"
                [attr.aria-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                required
              >
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="hidePassword() ? 'Show password' : 'Hide password'"
              >
                <mat-icon>{{ hidePassword() ? 'visibility' : 'visibility_off' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched">
                Password is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength') && loginForm.get('password')?.touched">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>
            </div>

            <!-- Remember Me Checkbox -->
            <div class="mb-4">
            <div class="flex items-center">
              <mat-checkbox formControlName="rememberMe" class="text-sm">
                Remember me
              </mat-checkbox>
            </div>
            </div>

            <!-- Submit Button -->
            <div class="mb-4">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="w-full py-3 text-white font-medium"
              [disabled]="loginForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <mat-spinner diameter="20" class="inline mr-2"></mat-spinner>
              }
              {{ isLoading() ? 'Signing in...' : 'Sign in' }}
            </button>
            </div>

            <!-- Forgot Password Link -->
            <div class="text-center">
              <a 
                routerLink="/forgot-password" 
                class="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Forgot your password?
              </a>
            </div>

            <!-- Sign Up Link -->
            <div class="text-center">
              <span class="text-sm text-gray-600">Don't have an account? </span>
              <a 
                routerLink="/register" 
                class="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Sign up
              </a>
            </div>
          </form>
        </mat-card>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 class="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h4>
          <div class="text-xs text-blue-700 space-y-1">
            <div><strong>Admin:</strong> admin@aegisx.local / Admin123!</div>
            <div><strong>Demo:</strong> demo@aegisx.local / Demo123!</div>
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

      .mat-mdc-card {
        box-shadow:
          0 10px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      .mat-mdc-form-field {
        margin-bottom: 0.5rem;
        display: block;
      }
      
      /* Add space for error messages */
      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        position: static !important;
        margin-top: 0.25rem;
        min-height: 1.25rem;
      }
      
      /* Ensure error messages don't overlap */
      ::ng-deep .mat-mdc-form-field-error-wrapper {
        padding: 0.25rem 0;
      }
      
      /* Fix form field bottom spacing */
      ::ng-deep .mat-mdc-text-field-wrapper {
        margin-bottom: 0 !important;
      }

      .mat-mdc-raised-button {
        height: 48px;
      }

      .mat-spinner {
        color: white !important;
      }
      
      /* Fix for Material form field outline appearance */
      ::ng-deep .mat-mdc-form-field-outline {
        color: rgba(0, 0, 0, 0.12) !important;
      }
      
      ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-outline {
        color: #2196f3 !important;
      }
      
      ::ng-deep .mat-mdc-form-field.mat-form-field-invalid .mat-mdc-form-field-outline {
        color: #f44336 !important;
      }
      
      /* Only show error state when field is touched */
      ::ng-deep .mat-mdc-form-field:not(.mat-form-field-invalid) .mat-mdc-form-field-outline {
        color: rgba(0, 0, 0, 0.12) !important;
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

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
