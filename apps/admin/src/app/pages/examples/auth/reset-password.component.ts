import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  AxAuthLayoutComponent,
  AxResetPasswordFormComponent,
} from '@aegisx/ui';

/**
 * Reset Password Page Example
 *
 * A complete, copy-paste ready reset password page with:
 * - Split-screen layout with branding
 * - New password input with confirmation
 * - Password strength indicator
 * - Token validation from URL
 *
 * Usage:
 * 1. Copy this component to your project
 * 2. Update the branding (brandName, tagline, features)
 * 3. Implement the password reset logic in onSubmit()
 * 4. Handle token validation from email link
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AxAuthLayoutComponent,
    AxResetPasswordFormComponent,
  ],
  template: `
    <ax-auth-layout
      [brandName]="'AegisX Platform'"
      [tagline]="'Create new password'"
      [brandIcon]="'lock'"
      [features]="features"
    >
      <div class="auth-form-container">
        <ax-reset-password-form
          [config]="resetPasswordConfig"
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
export class ResetPasswordComponent {
  isLoading = signal(false);
  isSuccess = signal(false);
  token: string | null = null;

  features = [
    'Choose a strong, unique password',
    'At least 8 characters recommended',
    'Mix letters, numbers, and symbols',
  ];

  resetPasswordConfig = {
    passwordLabel: 'New Password',
    confirmPasswordLabel: 'Confirm Password',
    submitButtonText: 'Reset Password',
    showPasswordStrength: true,
    passwordMinLength: 8,
    successMessage: 'Password reset successfully! You can now log in.',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // Get token from URL query params
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || null;
    });
  }

  onSubmit(data: { password: string; confirmPassword: string }) {
    if (!this.token) {
      console.warn('Invalid or expired reset link');
      return;
    }

    this.isLoading.set(true);
    this.isSuccess.set(false);

    // TODO: Implement your password reset logic here
    // Example:
    // this.authService.resetPassword(this.token, data.password).subscribe({
    //   next: () => {
    //     this.isSuccess.set(true);
    //     this.isLoading.set(false);
    //     setTimeout(() => this.router.navigate(['/examples/auth/login']), 2000);
    //   },
    //   error: (err) => {
    //     this.isLoading.set(false);
    //   }
    // });

    // Simulated password reset for demo
    setTimeout(() => {
      this.isLoading.set(false);
      this.isSuccess.set(true);
      // Redirect to login after success
      setTimeout(() => {
        this.router.navigate(['/examples/auth/login']);
      }, 2000);
    }, 1500);
  }

  onBackToLogin() {
    this.router.navigate(['/examples/auth/login']);
  }
}
