import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import {
  AxAuthLayoutComponent,
  AxLoginFormComponent,
  LoginFormData,
} from '@aegisx/ui';

type LoginState = 'idle' | 'loading' | 'success';

@Component({
  selector: 'app-login-example',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    AxAuthLayoutComponent,
    AxLoginFormComponent,
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

      <!-- Full Page Login Example -->
      <ax-auth-layout
        [brandName]="'AegisX Platform'"
        [tagline]="'Enterprise-grade Admin Dashboard'"
        [brandIcon]="'shield'"
        [features]="features"
      >
        <ax-login-form
          [config]="loginConfig"
          [loading]="currentState() === 'loading'"
          (formSubmit)="onSubmit($event)"
          (forgotPassword)="onForgotPassword()"
          (signupClick)="onSignup()"
          (socialLogin)="onSocialLogin($event)"
        />
      </ax-auth-layout>

      <!-- Demo Info Panel -->
      <div class="demo-info-panel">
        <div class="demo-info-header">
          <mat-icon>info</mat-icon>
          <span>Demo Mode</span>
        </div>
        <p>นี่คือตัวอย่างหน้า Login สำหรับ Documentation</p>
        <p class="small">เลือก state เพื่อดูสถานะต่างๆ</p>

        <!-- State Selector -->
        <div class="state-selector">
          <label>State:</label>
          <mat-button-toggle-group
            [value]="currentState()"
            (change)="onStateChange($event.value)"
          >
            <mat-button-toggle value="idle">
              <mat-icon>edit</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle value="loading">
              <mat-icon>hourglass_empty</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle value="success">
              <mat-icon>check_circle</mat-icon>
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <div class="state-labels">
          @switch (currentState()) {
            @case ('idle') {
              <span class="state-label idle">Idle</span>
            }
            @case ('loading') {
              <span class="state-label loading">Loading</span>
            }
            @case ('success') {
              <span class="state-label success">Success</span>
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

      .state-selector {
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

      .state-labels {
        margin-top: 0.5rem;
        text-align: center;
      }

      .state-label {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: var(--ax-radius-full);
        font-size: 0.75rem;
        font-weight: 500;
      }

      .state-label.idle {
        background: var(--ax-background-muted);
        color: var(--ax-text-secondary);
      }

      .state-label.loading {
        background: var(--ax-brand-subtle);
        color: var(--ax-brand-default);
      }

      .state-label.success {
        background: var(--ax-success-subtle);
        color: var(--ax-success-default);
      }

      .state-label.error {
        background: var(--ax-danger-subtle);
        color: var(--ax-danger-default);
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
export class LoginExampleComponent {
  currentState = signal<LoginState>('idle');
  lastEvent = signal<string>('');

  features = [
    'Multi-factor authentication and role-based access control',
    'Optimized for speed with lazy loading and caching',
    'Flexible theming with design tokens',
  ];

  loginConfig = {
    showRememberMe: true,
    showForgotPassword: true,
    showSignupLink: true,
    showSocialLogin: true,
  };

  onStateChange(state: LoginState) {
    this.currentState.set(state);
    this.lastEvent.set(`State changed to: ${state}`);
  }

  onSubmit(data: LoginFormData) {
    this.lastEvent.set(`formSubmit: ${JSON.stringify(data)}`);

    if (this.currentState() === 'idle') {
      this.currentState.set('loading');

      // Simulate API call
      setTimeout(() => {
        this.currentState.set('success');
        this.lastEvent.set('Login successful! (simulated)');
      }, 1500);
    }
  }

  onForgotPassword() {
    this.lastEvent.set('forgotPassword clicked');
  }

  onSignup() {
    this.lastEvent.set('signupClick clicked');
  }

  onSocialLogin(provider: string) {
    this.lastEvent.set(`socialLogin: ${provider}`);
  }
}
