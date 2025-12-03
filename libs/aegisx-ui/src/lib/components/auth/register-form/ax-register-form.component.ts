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
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
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

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface RegisterFormConfig {
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  showTermsCheckbox?: boolean;
  showSocialLogin?: boolean;
  showLoginLink?: boolean;
  termsText?: string;
  termsLinkText?: string;
  privacyLinkText?: string;
  loginText?: string;
  loginLinkText?: string;
}

/**
 * AegisX Register Form Component
 *
 * A reusable registration form with name, email, password fields,
 * password confirmation, terms acceptance, and social signup options.
 *
 * @example
 * ```html
 * <ax-register-form
 *   [config]="{ title: 'Create an account' }"
 *   [loading]="isLoading"
 *   (formSubmit)="onRegister($event)"
 *   (socialLogin)="onSocialSignup($event)"
 *   (loginClick)="onLogin()"
 *   (termsClick)="openTerms()"
 * />
 * ```
 */
@Component({
  selector: 'ax-register-form',
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
    <mat-card appearance="outlined" class="register-card">
      <!-- Header -->
      <mat-card-header class="register-header">
        <mat-card-title class="register-title">{{
          config.title
        }}</mat-card-title>
        <mat-card-subtitle class="register-subtitle">
          {{ config.subtitle }}
        </mat-card-subtitle>
      </mat-card-header>

      <!-- Form -->
      <mat-card-content class="register-content">
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <!-- Name Fields -->
          <div class="name-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>First name</mat-label>
              <input
                matInput
                type="text"
                formControlName="firstName"
                placeholder="John"
                autocomplete="given-name"
              />
              @if (
                registerForm.get('firstName')?.hasError('required') &&
                registerForm.get('firstName')?.touched
              ) {
                <mat-error>First name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Last name</mat-label>
              <input
                matInput
                type="text"
                formControlName="lastName"
                placeholder="Doe"
                autocomplete="family-name"
              />
              @if (
                registerForm.get('lastName')?.hasError('required') &&
                registerForm.get('lastName')?.touched
              ) {
                <mat-error>Last name is required</mat-error>
              }
            </mat-form-field>
          </div>

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
              registerForm.get('email')?.hasError('required') &&
              registerForm.get('email')?.touched
            ) {
              <mat-error>Email is required</mat-error>
            }
            @if (
              registerForm.get('email')?.hasError('email') &&
              registerForm.get('email')?.touched
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
              placeholder="Create a password"
              autocomplete="new-password"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="togglePasswordVisibility()"
            >
              <mat-icon>{{
                hidePassword() ? 'visibility_off' : 'visibility'
              }}</mat-icon>
            </button>
            @if (
              registerForm.get('password')?.hasError('required') &&
              registerForm.get('password')?.touched
            ) {
              <mat-error>Password is required</mat-error>
            }
            @if (
              registerForm.get('password')?.hasError('minlength') &&
              registerForm.get('password')?.touched
            ) {
              <mat-error>Password must be at least 8 characters</mat-error>
            }
            <mat-hint>At least 8 characters</mat-hint>
          </mat-form-field>

          <!-- Confirm Password Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirm password</mat-label>
            <mat-icon matPrefix>lock_outline</mat-icon>
            <input
              matInput
              [type]="hideConfirmPassword() ? 'password' : 'text'"
              formControlName="confirmPassword"
              placeholder="Confirm your password"
              autocomplete="new-password"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="toggleConfirmPasswordVisibility()"
            >
              <mat-icon>{{
                hideConfirmPassword() ? 'visibility_off' : 'visibility'
              }}</mat-icon>
            </button>
            @if (
              registerForm.get('confirmPassword')?.hasError('required') &&
              registerForm.get('confirmPassword')?.touched
            ) {
              <mat-error>Please confirm your password</mat-error>
            }
            @if (
              registerForm
                .get('confirmPassword')
                ?.hasError('passwordMismatch') &&
              registerForm.get('confirmPassword')?.touched
            ) {
              <mat-error>Passwords do not match</mat-error>
            }
          </mat-form-field>

          <!-- Terms Checkbox -->
          @if (config.showTermsCheckbox) {
            <div class="terms-container">
              <mat-checkbox
                formControlName="acceptTerms"
                class="terms-checkbox"
              >
                <span class="terms-text">
                  {{ config.termsText }}
                  <a
                    href="javascript:void(0)"
                    class="terms-link"
                    (click)="onTermsClick($event)"
                  >
                    {{ config.termsLinkText }}
                  </a>
                  and
                  <a
                    href="javascript:void(0)"
                    class="terms-link"
                    (click)="onPrivacyClick($event)"
                  >
                    {{ config.privacyLinkText }}
                  </a>
                </span>
              </mat-checkbox>
              @if (
                registerForm.get('acceptTerms')?.hasError('requiredTrue') &&
                registerForm.get('acceptTerms')?.touched
              ) {
                <mat-error class="terms-error">
                  You must accept the terms and conditions
                </mat-error>
              }
            </div>
          }

          <!-- Register Button -->
          <button
            mat-raised-button
            color="primary"
            type="submit"
            class="register-button full-width"
            [disabled]="loading"
          >
            @if (loading) {
              <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
              <span>Creating account...</span>
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
            <span class="divider-text">or sign up with</span>
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
      @if (config.showLoginLink) {
        <mat-card-footer class="register-footer">
          <p>
            {{ config.loginText }}
            <a
              href="javascript:void(0)"
              class="login-link"
              (click)="onLoginClick()"
            >
              {{ config.loginLinkText }}
            </a>
          </p>
        </mat-card-footer>
      }
    </mat-card>
  `,
  styles: [
    `
      .register-card {
        width: 100%;
        max-width: 480px;
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

      .register-header {
        padding: 2rem 2rem 0 !important;
        margin-bottom: 0 !important;

        @media (max-width: 960px) {
          padding: 1.5rem 1.5rem 0 !important;
        }
      }

      .register-title {
        font-size: 1.75rem !important;
        font-weight: 600 !important;
        color: var(--ax-text-strong) !important;
        margin-bottom: 0.5rem !important;
      }

      .register-subtitle {
        font-size: 0.875rem !important;
        color: var(--ax-text-subtle) !important;
        margin-bottom: 0 !important;
      }

      .register-content {
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

      .name-row {
        display: flex;
        gap: 1rem;

        @media (max-width: 480px) {
          flex-direction: column;
          gap: 1rem;
        }
      }

      .full-width {
        width: 100%;
      }

      .half-width {
        flex: 1;

        @media (max-width: 480px) {
          width: 100%;
        }
      }

      mat-form-field {
        mat-icon[matPrefix] {
          margin-right: 0.75rem;
          color: var(--ax-text-subtle);
        }
      }

      .terms-container {
        margin: 0.5rem 0;
      }

      .terms-checkbox {
        ::ng-deep .mdc-form-field {
          align-items: flex-start;
        }
      }

      .terms-text {
        font-size: 0.875rem;
        color: var(--ax-text-body);
        line-height: 1.5;
      }

      .terms-link {
        color: var(--ax-brand-default);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }

      .terms-error {
        font-size: 0.75rem;
        margin-top: 0.25rem;
        display: block;
      }

      .register-button {
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

      .register-footer {
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

      .login-link {
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
export class AxRegisterFormComponent {
  /** Form configuration options */
  @Input() set config(value: Partial<RegisterFormConfig>) {
    this._config = { ...this.defaultConfig, ...value };
  }
  get config(): RegisterFormConfig {
    return this._config;
  }

  /** Loading state for submit button */
  @Input() loading = false;

  /** Emits form data when submitted */
  @Output() formSubmit = new EventEmitter<RegisterFormData>();

  /** Emits social provider name when social login is clicked */
  @Output() socialLogin = new EventEmitter<string>();

  /** Emits when login link is clicked */
  @Output() loginClick = new EventEmitter<void>();

  /** Emits when terms link is clicked */
  @Output() termsClick = new EventEmitter<void>();

  /** Emits when privacy link is clicked */
  @Output() privacyClick = new EventEmitter<void>();

  registerForm: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  private defaultConfig: RegisterFormConfig = {
    title: 'Create an account',
    subtitle: 'Enter your details to get started',
    submitButtonText: 'Create Account',
    showTermsCheckbox: true,
    showSocialLogin: true,
    showLoginLink: true,
    termsText: 'I agree to the',
    termsLinkText: 'Terms of Service',
    privacyLinkText: 'Privacy Policy',
    loginText: 'Already have an account?',
    loginLinkText: 'Sign in',
  };

  private _config: RegisterFormConfig = this.defaultConfig;

  private fb = inject(FormBuilder);

  constructor() {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.formSubmit.emit(this.registerForm.value as RegisterFormData);
    } else {
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  onSocialLoginClick(provider: string): void {
    this.socialLogin.emit(provider);
  }

  onLoginClick(): void {
    this.loginClick.emit();
  }

  onTermsClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.termsClick.emit();
  }

  onPrivacyClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.privacyClick.emit();
  }

  private passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }
}
