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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordFormConfig {
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  backToLoginText?: string;
  successTitle?: string;
  successMessage?: string;
}

/**
 * AegisX Forgot Password Form Component
 *
 * A form for requesting a password reset link via email.
 *
 * @example
 * ```html
 * <ax-forgot-password-form
 *   [loading]="isLoading"
 *   [success]="emailSent"
 *   (formSubmit)="onRequestReset($event)"
 *   (backToLogin)="navigateToLogin()"
 * />
 * ```
 */
@Component({
  selector: 'ax-forgot-password-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card appearance="outlined" class="forgot-password-card">
      @if (!success) {
        <!-- Request Form -->
        <mat-card-header class="card-header">
          <div class="header-icon">
            <mat-icon>lock_reset</mat-icon>
          </div>
          <mat-card-title class="card-title">{{ config.title }}</mat-card-title>
          <mat-card-subtitle class="card-subtitle">
            {{ config.subtitle }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="card-content">
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
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
                forgotPasswordForm.get('email')?.hasError('required') &&
                forgotPasswordForm.get('email')?.touched
              ) {
                <mat-error>Email is required</mat-error>
              }
              @if (
                forgotPasswordForm.get('email')?.hasError('email') &&
                forgotPasswordForm.get('email')?.touched
              ) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <!-- Submit Button -->
            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="submit-button full-width"
              [disabled]="loading"
            >
              @if (loading) {
                <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                <span>Sending...</span>
              } @else {
                <span>{{ config.submitButtonText }}</span>
                <mat-icon>send</mat-icon>
              }
            </button>
          </form>
        </mat-card-content>
      } @else {
        <!-- Success State -->
        <mat-card-header class="card-header success-header">
          <div class="header-icon success-icon">
            <mat-icon>mark_email_read</mat-icon>
          </div>
          <mat-card-title class="card-title">{{
            config.successTitle
          }}</mat-card-title>
          <mat-card-subtitle class="card-subtitle success-message">
            {{ config.successMessage }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="card-content">
          <p class="check-spam-note">
            Didn't receive the email? Check your spam folder or try again.
          </p>

          <button
            mat-stroked-button
            type="button"
            class="resend-button full-width"
            (click)="onResendClick()"
            [disabled]="loading"
          >
            @if (loading) {
              <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
            } @else {
              <mat-icon>refresh</mat-icon>
            }
            <span>Resend Email</span>
          </button>
        </mat-card-content>
      }

      <!-- Footer -->
      <mat-card-footer class="card-footer">
        <button
          mat-button
          type="button"
          class="back-button"
          (click)="onBackToLoginClick()"
        >
          <mat-icon>arrow_back</mat-icon>
          <span>{{ config.backToLoginText }}</span>
        </button>
      </mat-card-footer>
    </mat-card>
  `,
  styles: [
    `
      .forgot-password-card {
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

      .card-header {
        padding: 2rem 2rem 0 !important;
        margin-bottom: 0 !important;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .header-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--ax-brand-default, #4f46e5) 0%,
          var(--ax-brand-emphasis, #6366f1) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: white;
        }
      }

      .success-icon {
        background: linear-gradient(
          135deg,
          var(--ax-success-default, #10b981) 0%,
          var(--ax-success-emphasis, #059669) 100%
        );
      }

      .card-title {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        color: var(--ax-text-strong) !important;
        margin-bottom: 0.5rem !important;
      }

      .card-subtitle {
        font-size: 0.875rem !important;
        color: var(--ax-text-subtle) !important;
        max-width: 320px;
        line-height: 1.5;
      }

      .success-message {
        color: var(--ax-success-default) !important;
      }

      .card-content {
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

      .submit-button,
      .resend-button {
        height: 48px !important;
        font-size: 1rem !important;
        font-weight: 500 !important;
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

      .check-spam-note {
        text-align: center;
        font-size: 0.875rem;
        color: var(--ax-text-subtle);
        margin-bottom: 1.5rem;
      }

      .card-footer {
        padding: 1.5rem 2rem !important;
        border-top: 1px solid var(--ax-border-default);
        display: flex;
        justify-content: center;
      }

      .back-button {
        color: var(--ax-text-body);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          margin-right: 0.5rem;
        }
      }
    `,
  ],
})
export class AxForgotPasswordFormComponent {
  /** Form configuration options */
  @Input() set config(value: Partial<ForgotPasswordFormConfig>) {
    this._config = { ...this.defaultConfig, ...value };
  }
  get config(): ForgotPasswordFormConfig {
    return this._config;
  }

  /** Loading state for submit button */
  @Input() loading = false;

  /** Success state - shows confirmation message */
  @Input() success = false;

  /** Emits form data when submitted */
  @Output() formSubmit = new EventEmitter<ForgotPasswordFormData>();

  /** Emits when back to login is clicked */
  @Output() backToLogin = new EventEmitter<void>();

  /** Emits when resend email is clicked */
  @Output() resendEmail = new EventEmitter<void>();

  forgotPasswordForm: FormGroup;

  private defaultConfig: ForgotPasswordFormConfig = {
    title: 'Forgot password?',
    subtitle: "No worries, we'll send you reset instructions.",
    submitButtonText: 'Send Reset Link',
    backToLoginText: 'Back to login',
    successTitle: 'Check your email',
    successMessage: "We've sent a password reset link to your email address.",
  };

  private _config: ForgotPasswordFormConfig = this.defaultConfig;

  private fb = inject(FormBuilder);
  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.formSubmit.emit(
        this.forgotPasswordForm.value as ForgotPasswordFormData,
      );
    } else {
      Object.keys(this.forgotPasswordForm.controls).forEach((key) => {
        this.forgotPasswordForm.get(key)?.markAsTouched();
      });
    }
  }

  onBackToLoginClick(): void {
    this.backToLogin.emit();
  }

  onResendClick(): void {
    this.resendEmail.emit();
  }
}
