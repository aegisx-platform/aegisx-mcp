import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Confirm Email Page Example
 *
 * A complete, copy-paste ready email confirmation page with:
 * - Token validation from URL
 * - Loading, success, and error states
 * - Resend confirmation option
 * - Navigate to login on success
 *
 * Usage:
 * 1. Copy this component to your project
 * 2. Update the branding and messaging
 * 3. Implement the email confirmation logic
 * 4. Handle token from email link (?token=xxx)
 */
@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="confirm-email-page">
      <div class="confirm-card">
        <!-- Loading State -->
        @if (isLoading()) {
          <div class="state-container loading">
            <mat-spinner diameter="64"></mat-spinner>
            <h2>Verifying your email...</h2>
            <p>Please wait while we confirm your email address.</p>
          </div>
        }

        <!-- Success State -->
        @if (isSuccess()) {
          <div class="state-container success">
            <div class="icon-wrapper success">
              <mat-icon>check_circle</mat-icon>
            </div>
            <h2>Email Confirmed!</h2>
            <p>
              Your email has been verified successfully. You can now log in to
              your account.
            </p>
            <button
              mat-flat-button
              color="primary"
              (click)="goToLogin()"
              class="action-button"
            >
              <mat-icon>login</mat-icon>
              Go to Login
            </button>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="state-container error">
            <div class="icon-wrapper error">
              <mat-icon>error</mat-icon>
            </div>
            <h2>Verification Failed</h2>
            <p>{{ error() }}</p>
            <div class="action-buttons">
              <button
                mat-flat-button
                color="primary"
                (click)="resendConfirmation()"
                [disabled]="isResending()"
                class="action-button"
              >
                @if (isResending()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>refresh</mat-icon>
                  Resend Confirmation
                }
              </button>
              <button
                mat-stroked-button
                (click)="goToLogin()"
                class="action-button"
              >
                Back to Login
              </button>
            </div>
          </div>
        }

        <!-- Pending State (No token, just registered) -->
        @if (!isLoading() && !isSuccess() && !error() && !hasToken) {
          <div class="state-container pending">
            <div class="icon-wrapper pending">
              <mat-icon>mark_email_unread</mat-icon>
            </div>
            <h2>Check Your Email</h2>
            <p>
              We've sent a confirmation link to your email address. Please click
              the link to verify your account.
            </p>
            <div class="email-tips">
              <h4>Didn't receive the email?</h4>
              <ul>
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email</li>
                <li>Wait a few minutes and try again</li>
              </ul>
            </div>
            <div class="action-buttons">
              <button
                mat-flat-button
                color="primary"
                (click)="resendConfirmation()"
                [disabled]="isResending()"
                class="action-button"
              >
                @if (isResending()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>refresh</mat-icon>
                  Resend Confirmation
                }
              </button>
              <button
                mat-stroked-button
                (click)="goToLogin()"
                class="action-button"
              >
                Back to Login
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Branding Footer -->
      <div class="branding-footer">
        <mat-icon class="brand-icon">shield</mat-icon>
        <span>AegisX Platform</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .confirm-email-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: linear-gradient(
          135deg,
          var(--ax-brand-subtle) 0%,
          var(--ax-background-default) 50%,
          var(--ax-background-subtle) 100%
        );
      }

      .confirm-card {
        max-width: 480px;
        width: 100%;
        background: var(--ax-background-default);
        border-radius: var(--ax-radius-xl);
        box-shadow: var(--ax-shadow-xl);
        padding: 3rem;
        text-align: center;
      }

      .state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .icon-wrapper {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }
      }

      .icon-wrapper.success {
        background: var(--ax-success-subtle);
        color: var(--ax-success-default);
      }

      .icon-wrapper.error {
        background: var(--ax-danger-subtle);
        color: var(--ax-danger-default);
      }

      .icon-wrapper.pending {
        background: var(--ax-brand-subtle);
        color: var(--ax-brand-default);
      }

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ax-text-default);
      }

      p {
        margin: 0;
        color: var(--ax-text-secondary);
        line-height: 1.6;
      }

      .email-tips {
        margin-top: 1.5rem;
        padding: 1rem;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-lg);
        text-align: left;

        h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ax-text-default);
        }

        ul {
          margin: 0;
          padding-left: 1.25rem;
          color: var(--ax-text-secondary);
          font-size: 0.875rem;

          li {
            margin-bottom: 0.25rem;
          }
        }
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
        margin-top: 1rem;
      }

      .action-button {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;

        mat-spinner {
          margin-right: 0.5rem;
        }
      }

      .branding-footer {
        margin-top: 2rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--ax-text-subtle);
        font-size: 0.875rem;

        .brand-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      /* Loading state */
      .state-container.loading {
        mat-spinner {
          margin-bottom: 1rem;
        }
      }
    `,
  ],
})
export class ConfirmEmailComponent implements OnInit {
  isLoading = signal(false);
  isSuccess = signal(false);
  isResending = signal(false);
  error = signal<string | null>(null);
  hasToken = false;
  private token: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || null;
      this.hasToken = !!this.token;

      if (this.token) {
        this.verifyEmail();
      }
    });
  }

  private verifyEmail() {
    this.isLoading.set(true);
    this.error.set(null);

    // TODO: Implement your email verification logic here
    // Example:
    // this.authService.verifyEmail(this.token).subscribe({
    //   next: () => {
    //     this.isSuccess.set(true);
    //     this.isLoading.set(false);
    //   },
    //   error: (err) => {
    //     this.error.set(err.message);
    //     this.isLoading.set(false);
    //   }
    // });

    // Simulated verification for demo
    setTimeout(() => {
      this.isLoading.set(false);
      // Simulate success (in real app, this would depend on API response)
      if (this.token === 'invalid') {
        this.error.set('This confirmation link is invalid or has expired.');
      } else {
        this.isSuccess.set(true);
      }
    }, 2000);
  }

  resendConfirmation() {
    this.isResending.set(true);

    // TODO: Implement resend confirmation logic
    // Example:
    // this.authService.resendConfirmation(email).subscribe({
    //   next: () => {
    //     this.isResending.set(false);
    //     // Show success message
    //   },
    //   error: () => {
    //     this.isResending.set(false);
    //   }
    // });

    // Simulated resend for demo
    setTimeout(() => {
      this.isResending.set(false);
      this.error.set(null);
      // Reset to pending state
    }, 1500);
  }

  goToLogin() {
    this.router.navigate(['/examples/auth/login']);
  }
}
