import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import {
  AxAuthLayoutComponent,
  AxConfirmEmailComponent,
  ConfirmEmailStatus,
} from '@aegisx/ui';

@Component({
  selector: 'app-confirm-email-example',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    AxAuthLayoutComponent,
    AxConfirmEmailComponent,
  ],
  template: `
    <div class="example-page">
      <!-- Back Button -->
      <a
        routerLink="/docs/components/aegisx/auth"
        class="back-button"
        mat-button
      >
        <mat-icon>arrow_back</mat-icon>
        Back to Auth Docs
      </a>

      <!-- Full Page Confirm Email Example -->
      <ax-auth-layout
        [brandName]="'AegisX Platform'"
        [tagline]="'Email verification'"
        [brandIcon]="'mark_email_read'"
        [features]="features"
      >
        <ax-confirm-email
          [status]="currentStatus()"
          [email]="'user@example.com'"
          [resendLoading]="isResendLoading()"
          [config]="confirmEmailConfig"
          (continue)="onContinue()"
          (resendEmail)="onResendEmail()"
          (tryAgain)="onTryAgain()"
          (backToLogin)="onBackToLogin()"
        />
      </ax-auth-layout>

      <!-- Demo Info Panel -->
      <div class="demo-info-panel">
        <div class="demo-info-header">
          <mat-icon>info</mat-icon>
          <span>Demo Mode</span>
        </div>
        <p>นี่คือตัวอย่างหน้า Confirm Email สำหรับ Documentation</p>
        <p class="small">เลือก status เพื่อดูสถานะต่างๆ</p>

        <!-- Status Selector -->
        <div class="status-selector">
          <label>Status:</label>
          <mat-button-toggle-group
            [value]="currentStatus()"
            (change)="onStatusChange($event.value)"
          >
            <mat-button-toggle value="pending">
              <mat-icon>mark_email_unread</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle value="verifying">
              <mat-icon>hourglass_empty</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle value="success">
              <mat-icon>check_circle</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle value="error">
              <mat-icon>error</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle value="expired">
              <mat-icon>timer_off</mat-icon>
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <div class="status-labels">
          @switch (currentStatus()) {
            @case ('pending') {
              <span class="status-label pending">Pending</span>
            }
            @case ('verifying') {
              <span class="status-label verifying">Verifying</span>
            }
            @case ('success') {
              <span class="status-label success">Success</span>
            }
            @case ('error') {
              <span class="status-label error">Error</span>
            }
            @case ('expired') {
              <span class="status-label expired">Expired</span>
            }
          }
        </div>

        @if (lastEvent()) {
          <div class="event-log">
            <strong>Last Event:</strong>
            <code>{{ lastEvent() }}</code>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .example-page {
        min-height: 100vh;
        position: relative;
      }

      .back-button {
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 1000;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        box-shadow: var(--ax-shadow-md);
      }

      .demo-info-panel {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 1000;
        max-width: 320px;
        padding: 1rem;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        box-shadow: var(--ax-shadow-lg);
        font-size: 0.875rem;
      }

      .demo-info-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: var(--ax-info-default);
        margin-bottom: 0.5rem;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .demo-info-panel p {
        margin: 0 0 0.25rem 0;
        color: var(--ax-text-secondary);
      }

      .demo-info-panel .small {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }

      .status-selector {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--ax-border-default);

        label {
          display: block;
          font-size: 0.75rem;
          color: var(--ax-text-subtle);
          margin-bottom: 0.5rem;
        }

        mat-button-toggle-group {
          width: 100%;
          display: flex;

          mat-button-toggle {
            flex: 1;

            mat-icon {
              font-size: 18px;
            }

            ::ng-deep .mat-pseudo-checkbox {
              display: none !important;
            }
          }
        }
      }

      .status-labels {
        margin-top: 0.5rem;
        text-align: center;
      }

      .status-label {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: var(--ax-radius-full);
        font-size: 0.75rem;
        font-weight: 500;
      }

      .status-label.pending {
        background: var(--ax-brand-subtle);
        color: var(--ax-brand-default);
      }

      .status-label.verifying {
        background: var(--ax-background-muted);
        color: var(--ax-text-subtle);
      }

      .status-label.success {
        background: var(--ax-success-subtle);
        color: var(--ax-success-default);
      }

      .status-label.error {
        background: var(--ax-danger-subtle);
        color: var(--ax-danger-default);
      }

      .status-label.expired {
        background: var(--ax-warning-subtle);
        color: var(--ax-warning-default);
      }

      .event-log {
        margin-top: 0.75rem;
        padding: 0.5rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-md);
        font-size: 0.75rem;

        code {
          display: block;
          margin-top: 0.25rem;
          color: var(--ax-brand-default);
          word-break: break-all;
        }
      }
    `,
  ],
})
export class ConfirmEmailExampleComponent {
  currentStatus = signal<ConfirmEmailStatus>('pending');
  isResendLoading = signal(false);
  lastEvent = signal<string>('');

  features = [
    'Verify your email address to activate your account',
    'Check your inbox for the verification link',
    'Request a new link if it expires',
  ];

  confirmEmailConfig = {
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

  onStatusChange(status: ConfirmEmailStatus) {
    this.currentStatus.set(status);
    this.lastEvent.set(`Status changed to: ${status}`);
  }

  onContinue() {
    this.lastEvent.set('continue clicked - navigating to dashboard');
  }

  onResendEmail() {
    this.lastEvent.set('resendEmail clicked');
    this.isResendLoading.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isResendLoading.set(false);
      this.lastEvent.set('Verification email resent! (simulated)');
    }, 1500);
  }

  onTryAgain() {
    this.lastEvent.set('tryAgain clicked');
    this.currentStatus.set('verifying');

    // Simulate verification
    setTimeout(() => {
      this.currentStatus.set('success');
      this.lastEvent.set('Verification successful! (simulated)');
    }, 2000);
  }

  onBackToLogin() {
    this.lastEvent.set('backToLogin clicked');
  }
}
