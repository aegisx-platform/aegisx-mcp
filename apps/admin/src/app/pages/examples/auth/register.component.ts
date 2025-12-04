import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AxAuthLayoutComponent, AxRegisterFormComponent } from '@aegisx/ui';

/**
 * Register Page Example
 *
 * A complete, copy-paste ready registration page with:
 * - Split-screen layout with branding
 * - Registration form with validation
 * - Password strength indicator
 * - Terms & conditions acceptance
 * - Social signup options
 *
 * Usage:
 * 1. Copy this component to your project
 * 2. Update the branding (brandName, tagline, features)
 * 3. Implement the registration logic in onRegister()
 * 4. Update terms and privacy policy links
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AxAuthLayoutComponent,
    AxRegisterFormComponent,
  ],
  template: `
    <ax-auth-layout
      [brandName]="'AegisX Platform'"
      [tagline]="'Create your account'"
      [brandIcon]="'person_add'"
      [features]="features"
    >
      <div class="auth-form-container">
        <ax-register-form
          [config]="registerConfig"
          [loading]="isLoading()"
          (formSubmit)="onRegister($event)"
          (loginClick)="onLogin()"
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
export class RegisterComponent {
  isLoading = signal(false);

  features = [
    'Your data is encrypted and protected',
    'Verify your email to activate your account',
    'Strong password requirements for protection',
  ];

  registerConfig = {
    showTerms: true,
    showLoginLink: true,
    showSocialLogin: true,
    passwordMinLength: 8,
    showPasswordStrength: true,
    termsLink: '/terms',
    privacyLink: '/privacy',
  };

  constructor(private router: Router) {}

  onRegister(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    this.isLoading.set(true);

    // TODO: Implement your registration logic here
    // Example:
    // this.authService.register(data).subscribe({
    //   next: () => this.router.navigate(['/examples/auth/confirm-email']),
    //   error: (err) => {
    //     this.isLoading.set(false);
    //   }
    // });

    // Simulated registration for demo
    setTimeout(() => {
      this.isLoading.set(false);
      // Navigate to confirmation page on success
      this.router.navigate(['/examples/auth/confirm-email']);
    }, 1500);
  }

  onLogin() {
    this.router.navigate(['/examples/auth/login']);
  }

  onSocialLogin(provider: string) {
    console.log('Social signup with:', provider);
    // TODO: Implement OAuth signup with the provider
  }
}
