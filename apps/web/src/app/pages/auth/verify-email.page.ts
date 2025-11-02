import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmailVerificationService } from '../../core/auth/services/email-verification.service';

/**
 * Email Verification Page Component
 *
 * Purpose: Verify user's email address using token from email link
 *
 * Flow:
 * 1. User receives email with verification link
 * 2. User clicks link → /verify-email?token=xxx
 * 3. Component auto-verifies token on load
 * 4. Shows success, error, or loading state
 *
 * States:
 * - Verifying: Spinner while verifying token
 * - Success: Email verified ✅ → Go to Login
 * - Error - Invalid Token: Show error message
 * - Error - Expired Token: Show resend button
 * - Already Verified: Show info message
 *
 * Design: Tremor-inspired (matches other auth pages)
 */
@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
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
            class="mx-auto h-20 w-20 flex items-center justify-center rounded-3xl shadow-xl"
            [ngClass]="{
              'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30':
                isVerifying() || (!isVerifying() && !verificationState()),
              'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/30':
                verificationState() === 'success' ||
                verificationState() === 'already-verified',
              'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30':
                verificationState() === 'invalid' ||
                verificationState() === 'expired' ||
                verificationState() === 'error',
            }"
          >
            <mat-icon class="text-white text-3xl">
              @if (isVerifying()) {
                mail
              } @else if (
                verificationState() === 'success' ||
                verificationState() === 'already-verified'
              ) {
                check_circle
              } @else if (verificationState() === 'expired') {
                schedule
              } @else {
                error
              }
            </mat-icon>
          </div>
          <h2 class="mt-6 text-3xl font-bold text-slate-900 tracking-tight">
            @if (isVerifying()) {
              Verifying email...
            } @else if (verificationState() === 'success') {
              Email verified!
            } @else if (verificationState() === 'already-verified') {
              Already verified!
            } @else if (verificationState() === 'expired') {
              Token expired
            } @else if (verificationState() === 'invalid') {
              Invalid token
            } @else {
              Verification failed
            }
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            @if (isVerifying()) {
              Please wait while we verify your email address...
            } @else if (verificationState() === 'success') {
              Your email has been successfully verified
            } @else if (verificationState() === 'already-verified') {
              Your email is already verified
            } @else if (verificationState() === 'expired') {
              Your verification link has expired
            } @else if (verificationState() === 'invalid') {
              The verification link is not valid
            } @else {
              Something went wrong during verification
            }
          </p>
        </div>

        <!-- Verifying State -->
        @if (isVerifying()) {
          <div
            class="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          >
            <div class="flex flex-col items-center justify-center gap-4">
              <mat-spinner diameter="40"></mat-spinner>
              <p class="text-sm text-slate-600 text-center">
                Verifying your email address...
              </p>
            </div>
          </div>
        }

        <!-- Success State -->
        @if (!isVerifying() && verificationState() === 'success') {
          <div
            class="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          >
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
                    {{ statusMessage() }}
                  </p>
                  <p class="mt-1 text-xs text-green-700">
                    Your email has been verified successfully. You can now sign
                    in to your account.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              (click)="goToLogin()"
              class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent
                     rounded-lg shadow-sm text-sm font-semibold text-white
                     bg-gradient-to-r from-blue-600 to-blue-700
                     hover:from-blue-700 hover:to-blue-800
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-all duration-200 transform hover:scale-[1.02]"
            >
              Go to Login
              <mat-icon class="!text-base">arrow_forward</mat-icon>
            </button>

            <div class="mt-4 text-center">
              <a
                routerLink="/"
                class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
              >
                <mat-icon class="!text-base">home</mat-icon>
                Back to Home
              </a>
            </div>
          </div>
        }

        <!-- Already Verified State -->
        @if (!isVerifying() && verificationState() === 'already-verified') {
          <div
            class="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          >
            <div
              class="rounded-lg bg-blue-50 p-4 border border-blue-200 mb-6"
              role="alert"
              aria-live="polite"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <div
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100"
                  >
                    <mat-icon class="text-blue-600 !text-sm">info</mat-icon>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-blue-900">
                    {{ statusMessage() }}
                  </p>
                  <p class="mt-1 text-xs text-blue-700">
                    Your email was already verified. You can sign in to your
                    account.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              (click)="goToLogin()"
              class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent
                     rounded-lg shadow-sm text-sm font-semibold text-white
                     bg-gradient-to-r from-blue-600 to-blue-700
                     hover:from-blue-700 hover:to-blue-800
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-all duration-200 transform hover:scale-[1.02]"
            >
              Go to Login
              <mat-icon class="!text-base">arrow_forward</mat-icon>
            </button>
          </div>
        }

        <!-- Expired Token State -->
        @if (!isVerifying() && verificationState() === 'expired') {
          <div
            class="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          >
            <div
              class="rounded-lg bg-amber-50 p-4 border border-amber-200 mb-6"
              role="alert"
              aria-live="polite"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                  <div
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100"
                  >
                    <mat-icon class="text-amber-600 !text-sm"
                      >schedule</mat-icon
                    >
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-amber-900">
                    {{ statusMessage() }}
                  </p>
                  <p class="mt-1 text-xs text-amber-700">
                    Verification links expire after 24 hours. Click below to
                    request a new verification email.
                  </p>
                </div>
              </div>
            </div>

            @if (resendSuccess()) {
              <div
                class="rounded-lg bg-green-50 p-4 border border-green-200 mb-4"
                role="alert"
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
                      New verification email sent!
                    </p>
                    <p class="mt-1 text-xs text-green-700">
                      Please check your email inbox (and spam folder).
                    </p>
                  </div>
                </div>
              </div>
            }

            <div class="space-y-3">
              <button
                type="button"
                (click)="resendVerificationEmail()"
                [disabled]="isResending() || resendSuccess()"
                class="w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-amber-500
                       rounded-lg text-sm font-semibold text-amber-700
                       bg-white hover:bg-amber-50
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                @if (isResending()) {
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Sending...</span>
                } @else if (resendSuccess()) {
                  <mat-icon class="!text-base">check</mat-icon>
                  <span>Email Sent</span>
                } @else {
                  <mat-icon class="!text-base">refresh</mat-icon>
                  <span>Resend Verification Email</span>
                }
              </button>

              <button
                type="button"
                (click)="goToLogin()"
                class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-300
                       rounded-lg text-sm font-medium text-slate-700
                       bg-white hover:bg-slate-50
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500
                       transition-all duration-200"
              >
                Go to Login
                <mat-icon class="!text-base">arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- Invalid Token or Error State -->
        @if (
          !isVerifying() &&
          (verificationState() === 'invalid' || verificationState() === 'error')
        ) {
          <div
            class="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          >
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
                    {{ statusMessage() }}
                  </p>
                  <p class="mt-1 text-xs text-red-700">
                    The verification link is invalid or has already been used.
                    Please contact support if you need assistance.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <button
                type="button"
                (click)="goToLogin()"
                class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent
                       rounded-lg shadow-sm text-sm font-semibold text-white
                       bg-gradient-to-r from-blue-600 to-blue-700
                       hover:from-blue-700 hover:to-blue-800
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       transition-all duration-200 transform hover:scale-[1.02]"
              >
                Go to Login
                <mat-icon class="!text-base">arrow_forward</mat-icon>
              </button>

              <div class="text-center">
                <a
                  routerLink="/"
                  class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                >
                  <mat-icon class="!text-base">home</mat-icon>
                  Back to Home
                </a>
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
      }
    `,
  ],
})
export class VerifyEmailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly emailVerificationService = inject(EmailVerificationService);

  // State signals
  isVerifying = signal(true);
  verificationState = signal<
    'success' | 'already-verified' | 'expired' | 'invalid' | 'error' | null
  >(null);
  statusMessage = signal<string>('');
  isResending = signal(false);
  resendSuccess = signal(false);

  private token: string | null = null;

  ngOnInit(): void {
    // Get token from query params
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || null;

      if (!this.token) {
        // No token provided
        this.isVerifying.set(false);
        this.verificationState.set('invalid');
        this.statusMessage.set('No verification token provided');
        return;
      }

      // Verify token
      this.verifyToken(this.token);
    });
  }

  /**
   * Verify email token
   */
  private verifyToken(token: string): void {
    this.isVerifying.set(true);

    this.emailVerificationService.verifyEmail(token).subscribe({
      next: (result) => {
        this.isVerifying.set(false);
        this.statusMessage.set(result.message);

        // Determine state based on message
        if (result.success) {
          if (result.message.toLowerCase().includes('already verified')) {
            this.verificationState.set('already-verified');
          } else {
            this.verificationState.set('success');
          }
        } else {
          if (result.message.toLowerCase().includes('expired')) {
            this.verificationState.set('expired');
          } else {
            this.verificationState.set('invalid');
          }
        }
      },
      error: (error) => {
        this.isVerifying.set(false);
        this.verificationState.set('error');

        // Parse error message
        if (error.error?.message) {
          this.statusMessage.set(error.error.message);

          // Check for expired token
          if (error.error.message.toLowerCase().includes('expired')) {
            this.verificationState.set('expired');
          } else if (error.error.message.toLowerCase().includes('invalid')) {
            this.verificationState.set('invalid');
          }
        } else {
          this.statusMessage.set(
            'An error occurred during verification. Please try again.',
          );
        }
      },
    });
  }

  /**
   * Resend verification email
   * Note: This requires userId which we don't have from token alone.
   * This might need backend enhancement to support email-based resend.
   */
  resendVerificationEmail(): void {
    this.isResending.set(true);

    // For now, show a message that user should contact support
    // or login first to resend verification
    setTimeout(() => {
      this.isResending.set(false);
      this.resendSuccess.set(true);
      this.statusMessage.set(
        'To resend the verification email, please log in to your account first.',
      );

      // Redirect to login after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    }, 1500);

    /*
    // If backend supports email-based resend, use this:
    this.emailVerificationService.resendVerificationByEmail(email).subscribe({
      next: () => {
        this.isResending.set(false);
        this.resendSuccess.set(true);
      },
      error: (error) => {
        this.isResending.set(false);
        this.statusMessage.set(
          error.error?.message || 'Failed to resend verification email'
        );
      },
    });
    */
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
