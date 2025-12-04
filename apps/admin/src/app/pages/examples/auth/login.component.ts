import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AxAuthLayoutComponent, AxLoginFormComponent } from '@aegisx/ui';

/**
 * Login Page Example
 *
 * A complete, copy-paste ready login page with:
 * - Split-screen layout with branding
 * - Login form with email/password
 * - Social login options
 * - Forgot password & register links
 *
 * Usage:
 * 1. Copy this component to your project
 * 2. Update the branding (brandName, tagline, features)
 * 3. Implement the authentication logic in onLogin()
 * 4. Configure routes for forgot password and registration
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AxAuthLayoutComponent,
    AxLoginFormComponent,
  ],
  template: `
    <ax-auth-layout
      [brandName]="'AegisX Platform'"
      [tagline]="'Enterprise-grade Admin Dashboard'"
      [brandIcon]="'shield'"
      [features]="features"
    >
      <div class="auth-form-container">
        <ax-login-form
          [config]="loginConfig"
          [loading]="isLoading()"
          (formSubmit)="onLogin($event)"
          (forgotPassword)="onForgotPassword()"
          (signupClick)="onRegister()"
          (socialLogin)="onSocialLogin($event)"
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
export class LoginComponent {
  isLoading = signal(false);

  features = [
    'Multi-factor authentication and role-based access control',
    'Optimized for speed with lazy loading and caching',
    'Flexible theming with design tokens',
  ];

  loginConfig = {
    showRememberMe: true,
    showForgotPassword: true,
    showRegisterLink: true,
    showSocialLogin: true,
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    submitButtonText: 'Sign In',
  };

  constructor(private router: Router) {}

  onLogin(data: { email: string; password: string; rememberMe?: boolean }) {
    this.isLoading.set(true);

    // TODO: Implement your authentication logic here
    // Example:
    // this.authService.login(data.email, data.password).subscribe({
    //   next: () => this.router.navigate(['/dashboard']),
    //   error: (err) => {
    //     this.isLoading.set(false);
    //   }
    // });

    // Simulated login for demo
    setTimeout(() => {
      this.isLoading.set(false);
      // Navigate to dashboard on success
      // this.router.navigate(['/dashboard']);
    }, 1500);
  }

  onForgotPassword() {
    this.router.navigate(['/examples/auth/forgot-password']);
  }

  onRegister() {
    this.router.navigate(['/examples/auth/register']);
  }

  onSocialLogin(provider: string) {
    console.log('Social login with:', provider);
    // TODO: Implement OAuth login with the provider
  }
}
