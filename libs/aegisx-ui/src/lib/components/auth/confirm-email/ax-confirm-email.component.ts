import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ConfirmEmailStatus =
  | 'pending'
  | 'verifying'
  | 'success'
  | 'error'
  | 'expired';

export interface ConfirmEmailConfig {
  pendingTitle?: string;
  pendingMessage?: string;
  verifyingTitle?: string;
  verifyingMessage?: string;
  successTitle?: string;
  successMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  expiredTitle?: string;
  expiredMessage?: string;
  continueButtonText?: string;
  resendButtonText?: string;
  tryAgainButtonText?: string;
}

/**
 * AegisX Confirm Email Component
 *
 * A component for displaying email confirmation status with different states:
 * - pending: Waiting for user to check their email
 * - verifying: Currently verifying the email token
 * - success: Email verified successfully
 * - error: Verification failed
 * - expired: Token has expired
 *
 * @example
 * ```html
 * <ax-confirm-email
 *   [status]="'success'"
 *   (continue)="navigateToDashboard()"
 *   (resendEmail)="onResendVerification()"
 * />
 * ```
 */
@Component({
  selector: 'ax-confirm-email',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-card appearance="outlined" class="confirm-email-card">
      <mat-card-header class="card-header">
        <!-- Icon based on status -->
        <div class="header-icon" [ngClass]="getIconClass()">
          @switch (status) {
            @case ('pending') {
              <mat-icon>mark_email_unread</mat-icon>
            }
            @case ('verifying') {
              <mat-spinner
                diameter="32"
                class="verifying-spinner"
              ></mat-spinner>
            }
            @case ('success') {
              <mat-icon>verified</mat-icon>
            }
            @case ('error') {
              <mat-icon>error_outline</mat-icon>
            }
            @case ('expired') {
              <mat-icon>timer_off</mat-icon>
            }
          }
        </div>

        <mat-card-title class="card-title">{{ getTitle() }}</mat-card-title>
        <mat-card-subtitle class="card-subtitle" [ngClass]="getSubtitleClass()">
          {{ getMessage() }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="card-content">
        @switch (status) {
          @case ('pending') {
            <div class="email-display">
              @if (email) {
                <span class="email-text">{{ email }}</span>
              }
            </div>

            <button
              mat-stroked-button
              type="button"
              class="action-button full-width"
              (click)="onResendClick()"
              [disabled]="resendLoading"
            >
              @if (resendLoading) {
                <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
              } @else {
                <mat-icon>refresh</mat-icon>
              }
              <span>{{ config.resendButtonText }}</span>
            </button>
          }

          @case ('verifying') {
            <p class="status-text">Please wait while we verify your email...</p>
          }

          @case ('success') {
            <button
              mat-raised-button
              color="primary"
              type="button"
              class="action-button full-width"
              (click)="onContinueClick()"
            >
              <span>{{ config.continueButtonText }}</span>
              <mat-icon>arrow_forward</mat-icon>
            </button>
          }

          @case ('error') {
            <button
              mat-raised-button
              color="primary"
              type="button"
              class="action-button full-width"
              (click)="onTryAgainClick()"
            >
              <mat-icon>refresh</mat-icon>
              <span>{{ config.tryAgainButtonText }}</span>
            </button>
          }

          @case ('expired') {
            <button
              mat-raised-button
              color="primary"
              type="button"
              class="action-button full-width"
              (click)="onResendClick()"
              [disabled]="resendLoading"
            >
              @if (resendLoading) {
                <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
              } @else {
                <mat-icon>send</mat-icon>
              }
              <span>{{ config.resendButtonText }}</span>
            </button>
          }
        }
      </mat-card-content>

      @if (status !== 'verifying') {
        <mat-card-footer class="card-footer">
          <button
            mat-button
            type="button"
            class="back-button"
            (click)="onBackToLoginClick()"
          >
            <mat-icon>arrow_back</mat-icon>
            <span>Back to login</span>
          </button>
        </mat-card-footer>
      }
    </mat-card>
  `,
  styles: [
    `
      .confirm-email-card {
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
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: white;
        }
      }

      .icon-pending {
        background: linear-gradient(
          135deg,
          var(--ax-brand-default, #4f46e5) 0%,
          var(--ax-brand-emphasis, #6366f1) 100%
        );
      }

      .icon-verifying {
        background: var(--ax-background-muted);

        .verifying-spinner {
          ::ng-deep circle {
            stroke: var(--ax-brand-default) !important;
          }
        }
      }

      .icon-success {
        background: linear-gradient(
          135deg,
          var(--ax-success-default, #10b981) 0%,
          var(--ax-success-emphasis, #059669) 100%
        );
      }

      .icon-error {
        background: linear-gradient(
          135deg,
          var(--ax-danger-default, #ef4444) 0%,
          var(--ax-danger-emphasis, #dc2626) 100%
        );
      }

      .icon-expired {
        background: linear-gradient(
          135deg,
          var(--ax-warning-default, #f59e0b) 0%,
          var(--ax-warning-emphasis, #d97706) 100%
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

      .subtitle-success {
        color: var(--ax-success-default) !important;
      }

      .subtitle-error {
        color: var(--ax-danger-default) !important;
      }

      .subtitle-expired {
        color: var(--ax-warning-default) !important;
      }

      .card-content {
        padding: 2rem !important;

        @media (max-width: 960px) {
          padding: 1.5rem !important;
        }
      }

      .email-display {
        text-align: center;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: var(--ax-background-muted);
        border-radius: 8px;
      }

      .email-text {
        font-weight: 500;
        color: var(--ax-text-strong);
      }

      .status-text {
        text-align: center;
        color: var(--ax-text-subtle);
        font-size: 0.875rem;
      }

      .full-width {
        width: 100%;
      }

      .action-button {
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
export class AxConfirmEmailComponent {
  /** Current verification status */
  @Input() status: ConfirmEmailStatus = 'pending';

  /** Email address being verified */
  @Input() email = '';

  /** Loading state for resend button */
  @Input() resendLoading = false;

  /** Component configuration */
  @Input() set config(value: Partial<ConfirmEmailConfig>) {
    this._config = { ...this.defaultConfig, ...value };
  }
  get config(): ConfirmEmailConfig {
    return this._config;
  }

  /** Emits when continue button is clicked (success state) */
  @Output() continue = new EventEmitter<void>();

  /** Emits when resend email button is clicked */
  @Output() resendEmail = new EventEmitter<void>();

  /** Emits when try again button is clicked (error state) */
  @Output() tryAgain = new EventEmitter<void>();

  /** Emits when back to login is clicked */
  @Output() backToLogin = new EventEmitter<void>();

  private defaultConfig: ConfirmEmailConfig = {
    pendingTitle: 'Check your email',
    pendingMessage: "We've sent a verification link to your email address.",
    verifyingTitle: 'Verifying email',
    verifyingMessage: 'Please wait while we verify your email address.',
    successTitle: 'Email verified!',
    successMessage: 'Your email has been successfully verified.',
    errorTitle: 'Verification failed',
    errorMessage: 'We could not verify your email. Please try again.',
    expiredTitle: 'Link expired',
    expiredMessage:
      'This verification link has expired. Please request a new one.',
    continueButtonText: 'Continue to dashboard',
    resendButtonText: 'Resend verification email',
    tryAgainButtonText: 'Try again',
  };

  private _config: ConfirmEmailConfig = this.defaultConfig;

  getTitle(): string {
    switch (this.status) {
      case 'pending':
        return this.config.pendingTitle || '';
      case 'verifying':
        return this.config.verifyingTitle || '';
      case 'success':
        return this.config.successTitle || '';
      case 'error':
        return this.config.errorTitle || '';
      case 'expired':
        return this.config.expiredTitle || '';
      default:
        return '';
    }
  }

  getMessage(): string {
    switch (this.status) {
      case 'pending':
        return this.config.pendingMessage || '';
      case 'verifying':
        return this.config.verifyingMessage || '';
      case 'success':
        return this.config.successMessage || '';
      case 'error':
        return this.config.errorMessage || '';
      case 'expired':
        return this.config.expiredMessage || '';
      default:
        return '';
    }
  }

  getIconClass(): string {
    return `icon-${this.status}`;
  }

  getSubtitleClass(): string {
    switch (this.status) {
      case 'success':
        return 'subtitle-success';
      case 'error':
        return 'subtitle-error';
      case 'expired':
        return 'subtitle-expired';
      default:
        return '';
    }
  }

  onContinueClick(): void {
    this.continue.emit();
  }

  onResendClick(): void {
    this.resendEmail.emit();
  }

  onTryAgainClick(): void {
    this.tryAgain.emit();
  }

  onBackToLoginClick(): void {
    this.backToLogin.emit();
  }
}
