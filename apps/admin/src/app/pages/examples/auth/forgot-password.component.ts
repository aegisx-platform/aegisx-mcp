import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  AxAuthLayoutComponent,
  AxForgotPasswordFormComponent,
} from '@aegisx/ui';

/**
 * Forgot Password Page Example
 *
 * A complete, copy-paste ready forgot password page with:
 * - Split-screen layout with branding
 * - Email input for password reset
 * - Back to login link
 * - Success state handling
 *
 * Usage:
 * 1. Copy this component to your project
 * 2. Update the branding (brandName, tagline, features)
 * 3. Implement the password reset logic in onSubmit()
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AxAuthLayoutComponent,
    AxForgotPasswordFormComponent,
  ],
  template: `
    <ax-auth-layout
      [brandName]="'AegisX Platform'"
      [tagline]="'Reset your password'"
      [brandIcon]="'lock_reset'"
      [features]="features"
    >
      <div class="auth-form-container">
        <ax-forgot-password-form
          [config]="forgotPasswordConfig"
          [loading]="isLoading()"
          [success]="isSuccess()"
          (formSubmit)="onSubmit($event)"
          (backToLogin)="onBackToLogin()"
        />
      </div>
    </ax-auth-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .auth-form-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
    `,
  ],
})
export class ForgotPasswordComponent {
  isLoading = signal(false);
  isSuccess = signal(false);

  features = [
    'Check your email for reset instructions',
    'Link expires in 24 hours for security',
    'Contact support if you need help',
  ];

  forgotPasswordConfig = {
    emailLabel: 'Email Address',
    submitButtonText: 'Send Reset Link',
    showBackToLogin: true,
    successMessage: 'Password reset link sent! Check your email.',
  };

  constructor(private router: Router) {}

  onSubmit(data: { email: string }) {
    this.isLoading.set(true);
    this.isSuccess.set(false);

    // TODO: Implement your password reset logic here
    // Example:
    // this.authService.sendPasswordReset(data.email).subscribe({
    //   next: () => {
    //     this.isSuccess.set(true);
    //     this.isLoading.set(false);
    //   },
    //   error: (err) => {
    //     this.isLoading.set(false);
    //   }
    // });

    // Simulated password reset for demo
    setTimeout(() => {
      this.isLoading.set(false);
      this.isSuccess.set(true);
    }, 1500);
  }

  onBackToLogin() {
    this.router.navigate(['/examples/auth/login']);
  }
}
