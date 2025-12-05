import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DocHeaderComponent } from '../../../../../components/docs/doc-header/doc-header.component';
import { AxCodeTabsComponent, CodeTab } from '@aegisx/ui';
import { PropsTableComponent } from '../../../../../components/props-table/props-table.component';

@Component({
  selector: 'ax-auth-doc',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DocHeaderComponent,
    AxCodeTabsComponent,
    PropsTableComponent,
  ],
  template: `
    <div class="docs-page">
      <!-- Header -->
      <ax-doc-header
        title="Authentication Components"
        description="ชุด components สำหรับสร้างหน้า authentication ที่ครบครัน รวม Login, Register, Forgot Password, Social Login และ Auth Layout"
        category="Authentication"
      />

      <!-- Live Examples Section -->
      <mat-card appearance="outlined" class="card-section examples-card">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">
              <mat-icon class="title-icon">launch</mat-icon>
              Live Examples
            </h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="text-secondary mb-4">
            คลิกที่การ์ดด้านล่างเพื่อดูตัวอย่างจริงของหน้า Authentication
            แต่ละประเภท หน้าเหล่านี้เป็นหน้าที่ใช้งานจริงใน Web Application
          </p>

          <div class="example-grid">
            <!-- Login Page -->
            <a
              routerLink="/docs/components/aegisx/auth/examples/login"
              class="example-card"
            >
              <div class="example-card-header">
                <div class="example-icon-wrapper login-gradient">
                  <mat-icon>login</mat-icon>
                </div>
                <mat-chip-set>
                  <mat-chip>Example</mat-chip>
                </mat-chip-set>
              </div>
              <div class="example-card-content">
                <h3>Login Page</h3>
                <p>หน้า Login พร้อม Remember Me และ Social Login</p>
                <ul class="feature-list">
                  <li>
                    <mat-icon>check</mat-icon>
                    Email/Password validation
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Remember me checkbox
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Social login integration
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Auth layout with branding
                  </li>
                </ul>
              </div>
              <div class="example-card-footer">
                <span class="view-link">
                  View Example
                  <mat-icon>arrow_forward</mat-icon>
                </span>
              </div>
            </a>

            <!-- Register Page -->
            <a
              routerLink="/docs/components/aegisx/auth/examples/register"
              class="example-card"
            >
              <div class="example-card-header">
                <div class="example-icon-wrapper register-gradient">
                  <mat-icon>person_add</mat-icon>
                </div>
                <mat-chip-set>
                  <mat-chip>Example</mat-chip>
                </mat-chip-set>
              </div>
              <div class="example-card-content">
                <h3>Register Page</h3>
                <p>หน้าลงทะเบียนพร้อม Password Strength Indicator</p>
                <ul class="feature-list">
                  <li>
                    <mat-icon>check</mat-icon>
                    Full registration form
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Password strength meter
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Terms & conditions
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Social login options
                  </li>
                </ul>
              </div>
              <div class="example-card-footer">
                <span class="view-link">
                  View Example
                  <mat-icon>arrow_forward</mat-icon>
                </span>
              </div>
            </a>

            <!-- Forgot Password Page -->
            <a
              routerLink="/docs/components/aegisx/auth/examples/forgot-password"
              class="example-card"
            >
              <div class="example-card-header">
                <div class="example-icon-wrapper forgot-gradient">
                  <mat-icon>lock_reset</mat-icon>
                </div>
                <mat-chip-set>
                  <mat-chip>Example</mat-chip>
                </mat-chip-set>
              </div>
              <div class="example-card-content">
                <h3>Forgot Password</h3>
                <p>หน้า Reset Password ผ่าน Email</p>
                <ul class="feature-list">
                  <li>
                    <mat-icon>check</mat-icon>
                    Email input validation
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Success message
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Back to login link
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Clear instructions
                  </li>
                </ul>
              </div>
              <div class="example-card-footer">
                <span class="view-link">
                  View Example
                  <mat-icon>arrow_forward</mat-icon>
                </span>
              </div>
            </a>

            <!-- Reset Password Page -->
            <a
              routerLink="/docs/components/aegisx/auth/examples/reset-password"
              class="example-card"
            >
              <div class="example-card-header">
                <div class="example-icon-wrapper reset-gradient">
                  <mat-icon>password</mat-icon>
                </div>
                <mat-chip-set>
                  <mat-chip>Example</mat-chip>
                </mat-chip-set>
              </div>
              <div class="example-card-content">
                <h3>Reset Password</h3>
                <p>หน้าตั้ง Password ใหม่หลังกด reset link</p>
                <ul class="feature-list">
                  <li>
                    <mat-icon>check</mat-icon>
                    Password confirmation
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Minimum 8 characters
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Success state display
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Toggle visibility
                  </li>
                </ul>
              </div>
              <div class="example-card-footer">
                <span class="view-link">
                  View Example
                  <mat-icon>arrow_forward</mat-icon>
                </span>
              </div>
            </a>

            <!-- Confirm Email Page -->
            <a
              routerLink="/docs/components/aegisx/auth/examples/confirm-email"
              class="example-card"
            >
              <div class="example-card-header">
                <div class="example-icon-wrapper verify-gradient">
                  <mat-icon>mark_email_read</mat-icon>
                </div>
                <mat-chip-set>
                  <mat-chip>Example</mat-chip>
                </mat-chip-set>
              </div>
              <div class="example-card-content">
                <h3>Confirm Email</h3>
                <p>หน้ายืนยัน Email พร้อม 5 สถานะ</p>
                <ul class="feature-list">
                  <li>
                    <mat-icon>check</mat-icon>
                    Pending, Verifying states
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Success, Error states
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Expired link handling
                  </li>
                  <li>
                    <mat-icon>check</mat-icon>
                    Resend email option
                  </li>
                </ul>
              </div>
              <div class="example-card-footer">
                <span class="view-link">
                  View Example
                  <mat-icon>arrow_forward</mat-icon>
                </span>
              </div>
            </a>
          </div>

          <!-- Note -->
          <div class="info-box">
            <mat-icon>info</mat-icon>
            <div>
              <strong>Note:</strong>
              ตัวอย่างเหล่านี้เป็นหน้าจำลอง (Demo Mode) สำหรับดูรูปแบบการใช้งาน
              Components ข้อมูลจะไม่ถูกส่งไป server จริง
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Components Overview -->
      <mat-card appearance="outlined" class="card-section">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">
              <mat-icon class="title-icon">widgets</mat-icon>
              Available Components
            </h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="component-grid">
            <div class="component-item">
              <mat-icon class="component-icon">view_quilt</mat-icon>
              <div class="component-info">
                <strong>AxAuthLayoutComponent</strong>
                <p>Layout wrapper สำหรับหน้า authentication พร้อม branding</p>
                <code
                  >import {{ '{' }} AxAuthLayoutComponent {{ '}' }} from
                  '&#64;aegisx/ui';</code
                >
              </div>
            </div>

            <div class="component-item">
              <mat-icon class="component-icon">login</mat-icon>
              <div class="component-info">
                <strong>AxLoginFormComponent</strong>
                <p>Form สำหรับ login พร้อม validation และ remember me</p>
                <code
                  >import {{ '{' }} AxLoginFormComponent {{ '}' }} from
                  '&#64;aegisx/ui';</code
                >
              </div>
            </div>

            <div class="component-item">
              <mat-icon class="component-icon">person_add</mat-icon>
              <div class="component-info">
                <strong>AxRegisterFormComponent</strong>
                <p>Form สำหรับ registration พร้อม password strength</p>
                <code
                  >import {{ '{' }} AxRegisterFormComponent {{ '}' }} from
                  '&#64;aegisx/ui';</code
                >
              </div>
            </div>

            <div class="component-item">
              <mat-icon class="component-icon">lock_reset</mat-icon>
              <div class="component-info">
                <strong>AxForgotPasswordFormComponent</strong>
                <p>Form สำหรับ request password reset</p>
                <code
                  >import {{ '{' }} AxForgotPasswordFormComponent {{ '}' }} from
                  '&#64;aegisx/ui';</code
                >
              </div>
            </div>

            <div class="component-item">
              <mat-icon class="component-icon">password</mat-icon>
              <div class="component-info">
                <strong>AxResetPasswordFormComponent</strong>
                <p>Form สำหรับ set new password</p>
                <code
                  >import {{ '{' }} AxResetPasswordFormComponent {{ '}' }} from
                  '&#64;aegisx/ui';</code
                >
              </div>
            </div>

            <div class="component-item">
              <mat-icon class="component-icon">share</mat-icon>
              <div class="component-info">
                <strong>AxSocialLoginComponent</strong>
                <p>ปุ่ม Social login (Google, Facebook, GitHub, etc.)</p>
                <code
                  >import {{ '{' }} AxSocialLoginComponent {{ '}' }} from
                  '&#64;aegisx/ui';</code
                >
              </div>
            </div>

            <div class="component-item">
              <mat-icon class="component-icon">mark_email_read</mat-icon>
              <div class="component-info">
                <strong>AxConfirmEmailComponent</strong>
                <p>
                  หน้ายืนยัน email พร้อม 5 สถานะ (pending, verifying, success,
                  error, expired)
                </p>
                <code
                  >import {{ '{' }} AxConfirmEmailComponent {{ '}' }} from
                  '&#64;aegisx/ui';</code
                >
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Usage Examples -->
      <mat-card appearance="outlined" class="card-section">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">
              <mat-icon class="title-icon">code</mat-icon>
              Usage Examples
            </h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h3 class="subsection-title">Basic Login Page</h3>
          <ax-code-tabs [tabs]="loginUsageCode" />

          <h3 class="subsection-title mt-6">With Auth Layout</h3>
          <ax-code-tabs [tabs]="authLayoutUsageCode" />

          <h3 class="subsection-title mt-6">Social Login Integration</h3>
          <ax-code-tabs [tabs]="socialLoginUsageCode" />
        </mat-card-content>
      </mat-card>

      <!-- API Reference -->
      <mat-card appearance="outlined" class="card-section">
        <mat-card-header>
          <mat-card-title>
            <h2 class="section-title">
              <mat-icon class="title-icon">description</mat-icon>
              API Reference
            </h2>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h3 class="subsection-title">AxLoginFormComponent</h3>
          <ax-props-table [properties]="loginFormProps" />

          <h3 class="subsection-title mt-6">AxRegisterFormComponent</h3>
          <ax-props-table [properties]="registerFormProps" />

          <h3 class="subsection-title mt-6">AxAuthLayoutComponent</h3>
          <ax-props-table [properties]="authLayoutProps" />
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .docs-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .card-section {
        margin-bottom: 1rem;
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .title-icon {
        color: var(--ax-brand-default);
      }

      .subsection-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 1.5rem 0 0.75rem 0;
      }

      .text-secondary {
        color: var(--ax-text-secondary);
      }

      .mb-4 {
        margin-bottom: 1rem;
      }

      .mt-6 {
        margin-top: 1.5rem;
      }

      /* Example Grid */
      .example-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
      }

      .example-card {
        display: flex;
        flex-direction: column;
        background: var(--ax-background-default);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-xl);
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;
        cursor: pointer;
      }

      .example-card:hover {
        border-color: var(--ax-brand-default);
        box-shadow: var(--ax-shadow-lg);
        transform: translateY(-2px);
      }

      .example-card-header {
        padding: 1.25rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        background: var(--ax-background-subtle);
      }

      .example-icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: var(--ax-radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          color: white;
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      .login-gradient {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
      }

      .register-gradient {
        background: linear-gradient(135deg, #10b981, #059669);
      }

      .forgot-gradient {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      .reset-gradient {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
      }

      .verify-gradient {
        background: linear-gradient(135deg, #06b6d4, #0891b2);
      }

      .example-card-content {
        padding: 1.25rem;
        flex: 1;

        h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--ax-text-heading);
        }

        p {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
        }
      }

      .feature-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--ax-text-secondary);
          margin-bottom: 0.375rem;

          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            color: var(--ax-success-default);
          }
        }
      }

      .example-card-footer {
        padding: 1rem 1.25rem;
        border-top: 1px solid var(--ax-border-default);
        background: var(--ax-background-subtle);
      }

      .view-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ax-brand-default);
        transition: gap 0.2s ease;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          transition: transform 0.2s ease;
        }
      }

      .example-card:hover .view-link {
        gap: 0.75rem;

        mat-icon {
          transform: translateX(4px);
        }
      }

      /* Info Box */
      .info-box {
        display: flex;
        gap: 1rem;
        padding: 1rem 1.25rem;
        margin-top: 1.5rem;
        background: var(--ax-info-surface);
        border: 1px solid var(--ax-info-border);
        border-radius: var(--ax-radius-lg);
        font-size: 0.875rem;
        color: var(--ax-info-emphasis);

        mat-icon {
          flex-shrink: 0;
          color: var(--ax-info-default);
        }

        code {
          background: var(--ax-background-default);
          padding: 0.125rem 0.5rem;
          border-radius: var(--ax-radius-sm);
          font-family: monospace;
        }
      }

      /* Component Grid */
      .component-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1rem;
      }

      .component-item {
        display: flex;
        gap: 1rem;
        padding: 1.25rem;
        background: var(--ax-background-subtle);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
      }

      .component-icon {
        flex-shrink: 0;
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--ax-brand-default);
      }

      .component-info {
        flex: 1;
        min-width: 0;

        strong {
          display: block;
          font-size: 0.9375rem;
          color: var(--ax-text-heading);
          margin-bottom: 0.25rem;
        }

        p {
          font-size: 0.8125rem;
          color: var(--ax-text-secondary);
          margin: 0 0 0.5rem 0;
        }

        code {
          display: block;
          font-size: 0.75rem;
          font-family: monospace;
          color: var(--ax-text-subtle);
          background: var(--ax-background-default);
          padding: 0.375rem 0.625rem;
          border-radius: var(--ax-radius-sm);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    `,
  ],
})
export class AuthDocComponent {
  // Code examples
  loginUsageCode: CodeTab[] = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<ax-login-form
  [config]="loginConfig"
  (login)="onLogin($event)"
  (forgotPassword)="onForgotPassword()"
  (register)="onRegister()"
/>`,
    },
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { AxLoginFormComponent, LoginFormConfig } from '@aegisx/ui';

@Component({
  imports: [AxLoginFormComponent],
})
export class LoginPage {
  loginConfig: LoginFormConfig = {
    showRememberMe: true,
    showForgotPassword: true,
    showRegisterLink: true,
  };

  onLogin(data: LoginFormData) {
    this.authService.login(data).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => this.showError(err.message)
    });
  }
}`,
    },
  ];

  authLayoutUsageCode: CodeTab[] = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<ax-auth-layout
  [brandName]="'My App'"
  [tagline]="'Enterprise Solutions'"
>
  <ax-login-form
    [config]="loginConfig"
    (login)="onLogin($event)"
  />
</ax-auth-layout>`,
    },
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import {
  AxAuthLayoutComponent,
  AxLoginFormComponent
} from '@aegisx/ui';

@Component({
  imports: [AxAuthLayoutComponent, AxLoginFormComponent],
  template: \`
    <ax-auth-layout [brandName]="'My App'">
      <ax-login-form />
    </ax-auth-layout>
  \`
})
export class LoginPage {}`,
    },
  ];

  socialLoginUsageCode: CodeTab[] = [
    {
      language: 'html' as const,
      label: 'HTML',
      code: `<ax-social-login
  [providers]="['google', 'facebook', 'github']"
  [config]="{
    showDivider: true,
    dividerText: 'or continue with',
    layout: 'horizontal'
  }"
  (providerClick)="onSocialLogin($event)"
/>`,
    },
    {
      language: 'typescript' as const,
      label: 'TypeScript',
      code: `import { AxSocialLoginComponent } from '@aegisx/ui';

@Component({
  imports: [AxSocialLoginComponent],
})
export class LoginPage {
  onSocialLogin(provider: string) {
    // Redirect to OAuth provider
    window.location.href = \`/api/auth/\${provider}\`;
  }
}`,
    },
  ];

  // API Props
  loginFormProps = [
    {
      name: 'config',
      type: 'LoginFormConfig',
      default: '{}',
      description: 'Configuration object for the login form',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Shows loading state on submit button',
    },
    {
      name: 'login',
      type: 'EventEmitter<LoginFormData>',
      default: '-',
      description: 'Emits when form is submitted with valid data',
    },
    {
      name: 'forgotPassword',
      type: 'EventEmitter<void>',
      default: '-',
      description: 'Emits when forgot password link is clicked',
    },
    {
      name: 'register',
      type: 'EventEmitter<void>',
      default: '-',
      description: 'Emits when register link is clicked',
    },
  ];

  registerFormProps = [
    {
      name: 'config',
      type: 'RegisterFormConfig',
      default: '{}',
      description: 'Configuration object for the register form',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Shows loading state on submit button',
    },
    {
      name: 'register',
      type: 'EventEmitter<RegisterFormData>',
      default: '-',
      description: 'Emits when form is submitted with valid data',
    },
    {
      name: 'login',
      type: 'EventEmitter<void>',
      default: '-',
      description: 'Emits when login link is clicked',
    },
  ];

  authLayoutProps = [
    {
      name: 'brandName',
      type: 'string',
      default: "'App'",
      description: 'Application name displayed in the layout',
    },
    {
      name: 'brandIcon',
      type: 'string',
      default: "'shield'",
      description: 'Icon name for the brand logo',
    },
    {
      name: 'tagline',
      type: 'string',
      default: "''",
      description: 'Tagline text displayed below brand name',
    },
    {
      name: 'features',
      type: 'AuthFeature[]',
      default: '[]',
      description: 'List of features to display in branding section',
    },
    {
      name: 'brandingBackground',
      type: 'string',
      default: "'gradient'",
      description: 'Background style for branding panel',
    },
  ];
}
