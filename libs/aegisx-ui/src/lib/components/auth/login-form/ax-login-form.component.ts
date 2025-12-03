import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormConfig {
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  showSocialLogin?: boolean;
  showSignupLink?: boolean;
  forgotPasswordText?: string;
  signupText?: string;
  signupLinkText?: string;
}

/**
 * AegisX Login Form Component
 *
 * A reusable login form with email/password fields, social login options,
 * and configurable UI elements.
 *
 * @example
 * ```html
 * <ax-login-form
 *   [config]="{ title: 'Welcome back' }"
 *   [loading]="isLoading"
 *   (formSubmit)="onLogin($event)"
 *   (forgotPassword)="onForgotPassword()"
 *   (socialLogin)="onSocialLogin($event)"
 *   (signupClick)="onSignup()"
 * />
 * ```
 */
@Component({
  selector: 'ax-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <mat-card appearance="outlined" class="login-card">
      <!-- Header -->
      <mat-card-header class="login-header">
        <mat-card-title class="login-title">{{ config.title }}</mat-card-title>
        <mat-card-subtitle class="login-subtitle">
          {{ config.subtitle }}
        </mat-card-subtitle>
      </mat-card-header>

      <!-- Form -->
      <mat-card-content class="login-content">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input
              matInput
              type="email"
              formControlName="email"
              placeholder="your@email.com"
              autocomplete="email"
            />
            @if (
              loginForm.get('email')?.hasError('required') &&
              loginForm.get('email')?.touched
            ) {
              <mat-error>Email is required</mat-error>
            }
            @if (
              loginForm.get('email')?.hasError('email') &&
              loginForm.get('email')?.touched
            ) {
              <mat-error>Please enter a valid email</mat-error>
            }
          </mat-form-field>

          <!-- Password Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input
              matInput
              [type]="hidePassword() ? 'password' : 'text'"
              formControlName="password"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="togglePasswordVisibility()"
              [attr.aria-label]="'Hide password'"
              [attr.aria-pressed]="!hidePassword()"
            >
              <mat-icon>{{
                hidePassword() ? 'visibility_off' : 'visibility'
              }}</mat-icon>
            </button>
            @if (
              loginForm.get('password')?.hasError('required') &&
              loginForm.get('password')?.touched
            ) {
              <mat-error>Password is required</mat-error>
            }
            @if (
              loginForm.get('password')?.hasError('minlength') &&
              loginForm.get('password')?.touched
            ) {
              <mat-error>Password must be at least 6 characters</mat-error>
            }
          </mat-form-field>

          <!-- Remember Me & Forgot Password -->
          @if (config.showRememberMe || config.showForgotPassword) {
            <div class="form-options">
              @if (config.showRememberMe) {
                <mat-checkbox formControlName="rememberMe" class="remember-me">
                  Remember me
                </mat-checkbox>
              }
              @if (config.showForgotPassword) {
                <a
                  href="javascript:void(0)"
                  class="forgot-password"
                  (click)="onForgotPasswordClick()"
                >
                  {{ config.forgotPasswordText }}
                </a>
              }
            </div>
          }

          <!-- Login Button -->
          <button
            mat-raised-button
            color="primary"
            type="submit"
            class="login-button full-width"
            [disabled]="loading"
          >
            @if (loading) {
              <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
              <span>Signing in...</span>
            } @else {
              <span>{{ config.submitButtonText }}</span>
              <mat-icon>arrow_forward</mat-icon>
            }
          </button>
        </form>

        <!-- Social Login -->
        @if (config.showSocialLogin) {
          <div class="divider-container">
            <mat-divider></mat-divider>
            <span class="divider-text">or continue with</span>
            <mat-divider></mat-divider>
          </div>

          <div class="social-login">
            <button
              mat-stroked-button
              class="social-button"
              type="button"
              (click)="onSocialLoginClick('google')"
            >
              <mat-icon>g_mobiledata</mat-icon>
              <span>Google</span>
            </button>
            <button
              mat-stroked-button
              class="social-button"
              type="button"
              (click)="onSocialLoginClick('github')"
            >
              <mat-icon>code</mat-icon>
              <span>GitHub</span>
            </button>
          </div>
        }
      </mat-card-content>

      <!-- Footer -->
      @if (config.showSignupLink) {
        <mat-card-footer class="login-footer">
          <p>
            {{ config.signupText }}
            <a
              href="javascript:void(0)"
              class="signup-link"
              (click)="onSignupClick()"
            >
              {{ config.signupLinkText }}
            </a>
          </p>
        </mat-card-footer>
      }
    </mat-card>
  `,
  styles: [
    `
      .login-card {
        width: 100%;
        max-width: 440px;
        box-shadow: var(--ax-shadow-sm) !important;
        animation: fadeIn 0.4s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .login-header {
        padding: 2rem 2rem 0 !important;
        margin-bottom: 0 !important;

        @media (max-width: 960px) {
          padding: 1.5rem 1.5rem 0 !important;
        }
      }

      .login-title {
        font-size: 1.75rem !important;
        font-weight: 600 !important;
        color: var(--ax-text-strong) !important;
        margin-bottom: 0.5rem !important;
      }

      .login-subtitle {
        font-size: 0.875rem !important;
        color: var(--ax-text-subtle) !important;
        margin-bottom: 0 !important;
      }

      .login-content {
        padding: 2rem !important;

        @media (max-width: 960px) {
          padding: 1.5rem !important;
        }
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .full-width {
        width: 100%;
      }

      mat-form-field {
        mat-icon[matPrefix] {
          margin-right: 0.75rem;
          color: var(--ax-text-subtle);
        }
      }

      .form-options {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: -0.5rem 0 0.5rem;

        @media (max-width: 480px) {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }
      }

      .remember-me {
        font-size: 0.875rem;
      }

      .forgot-password {
        font-size: 0.875rem;
        color: var(--ax-brand-default);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;

        &:hover {
          color: var(--ax-brand-emphasis);
          text-decoration: underline;
        }
      }

      .login-button {
        height: 48px !important;
        font-size: 1rem !important;
        font-weight: 500 !important;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .button-spinner {
        margin-right: 0.5rem;

        ::ng-deep circle {
          stroke: currentColor !important;
        }
      }

      .divider-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 2rem 0;

        mat-divider {
          flex: 1;
        }
      }

      .divider-text {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
        white-space: nowrap;
      }

      .social-login {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .social-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        height: 44px;
        font-weight: 500;
        transition: all 0.2s ease;

        &:hover {
          background-color: var(--ax-background-muted) !important;
          border-color: var(--ax-brand-default) !important;
        }

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        span {
          font-size: 0.875rem;
        }
      }

      .login-footer {
        padding: 1.5rem 2rem !important;
        border-top: 1px solid var(--ax-border-default);
        text-align: center;

        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ax-text-body);
        }

        @media (max-width: 960px) {
          padding: 1.5rem !important;
        }
      }

      .signup-link {
        color: var(--ax-brand-default);
        text-decoration: none;
        font-weight: 500;
        margin-left: 0.25rem;
        transition: color 0.2s ease;

        &:hover {
          color: var(--ax-brand-emphasis);
          text-decoration: underline;
        }
      }
    `,
  ],
})
export class AxLoginFormComponent {
  /** Form configuration options */
  @Input() set config(value: Partial<LoginFormConfig>) {
    this._config = { ...this.defaultConfig, ...value };
  }
  get config(): LoginFormConfig {
    return this._config;
  }

  /** Loading state for submit button */
  @Input() loading = false;

  /** Emits form data when submitted */
  @Output() formSubmit = new EventEmitter<LoginFormData>();

  /** Emits when forgot password is clicked */
  @Output() forgotPassword = new EventEmitter<void>();

  /** Emits social provider name when social login is clicked */
  @Output() socialLogin = new EventEmitter<string>();

  /** Emits when signup link is clicked */
  @Output() signupClick = new EventEmitter<void>();

  loginForm: FormGroup;
  hidePassword = signal(true);

  private defaultConfig: LoginFormConfig = {
    title: 'Welcome back',
    subtitle: 'Sign in to your account to continue',
    submitButtonText: 'Sign In',
    showRememberMe: true,
    showForgotPassword: true,
    showSocialLogin: true,
    showSignupLink: true,
    forgotPasswordText: 'Forgot password?',
    signupText: "Don't have an account?",
    signupLinkText: 'Sign up',
  };

  private _config: LoginFormConfig = this.defaultConfig;

  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.formSubmit.emit(this.loginForm.value as LoginFormData);
    } else {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  onForgotPasswordClick(): void {
    this.forgotPassword.emit();
  }

  onSocialLoginClick(provider: string): void {
    this.socialLogin.emit(provider);
  }

  onSignupClick(): void {
    this.signupClick.emit();
  }
}
