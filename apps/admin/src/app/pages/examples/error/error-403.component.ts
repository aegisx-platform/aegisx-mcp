import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ax-error-403',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="error-page error-page--403">
      <div class="error-page__container">
        <!-- Illustration -->
        <div class="error-page__illustration">
          <div class="error-page__code">403</div>
          <div class="error-page__shield">
            <mat-icon class="error-page__shield-icon">shield</mat-icon>
            <mat-icon class="error-page__lock-icon">lock</mat-icon>
          </div>
        </div>

        <!-- Content -->
        <div class="error-page__content">
          <h1 class="error-page__title">Access Denied</h1>
          <p class="error-page__description">
            You don't have permission to access this page. This might be because
            your role doesn't have the required privileges, or you need to sign
            in with a different account.
          </p>

          <!-- Reason Card -->
          <div class="error-page__reason-card">
            <mat-icon>info</mat-icon>
            <div class="error-page__reason-content">
              <strong>Why am I seeing this?</strong>
              <p>
                This resource requires specific permissions that your current
                account doesn't have.
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="error-page__actions">
            <a mat-flat-button color="primary" routerLink="/auth/login">
              <mat-icon>login</mat-icon>
              Sign In with Different Account
            </a>
            <a mat-stroked-button routerLink="/">
              <mat-icon>home</mat-icon>
              Back to Home
            </a>
          </div>

          <!-- Request Access -->
          <div class="error-page__request">
            <p>Need access to this resource?</p>
            <a routerLink="/support/request-access" class="error-page__link">
              <mat-icon>mail</mat-icon>
              Request Access
            </a>
          </div>
        </div>
      </div>

      <!-- Background Pattern -->
      <div class="error-page__bg-pattern">
        @for (i of [1, 2, 3, 4, 5, 6]; track i) {
          <div class="error-page__stripe"></div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .error-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ax-background-default);
        position: relative;
        overflow: hidden;
        padding: 2rem;
      }

      .error-page--403 {
        --error-color: var(--ax-warning-default, #f59e0b);
      }

      .error-page__container {
        text-align: center;
        max-width: 520px;
        position: relative;
        z-index: 1;
      }

      /* Illustration */
      .error-page__illustration {
        position: relative;
        height: 200px;
        margin-bottom: 2rem;
      }

      .error-page__code {
        font-size: 8rem;
        font-weight: 800;
        color: var(--error-color);
        opacity: 0.1;
        line-height: 1;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .error-page__shield {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .error-page__shield-icon {
        font-size: 96px;
        width: 96px;
        height: 96px;
        color: var(--error-color);
        opacity: 0.2;
      }

      .error-page__lock-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--error-color);
        animation: shake 0.5s ease-in-out infinite alternate;
      }

      @keyframes shake {
        0% {
          transform: translate(-50%, -50%) rotate(-3deg);
        }
        100% {
          transform: translate(-50%, -50%) rotate(3deg);
        }
      }

      /* Content */
      .error-page__content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .error-page__title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--ax-text-heading);
        margin: 0;
      }

      .error-page__description {
        font-size: 1rem;
        color: var(--ax-text-secondary);
        margin: 0;
        line-height: 1.6;
      }

      /* Reason Card */
      .error-page__reason-card {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 1rem;
        background: oklch(from var(--error-color) 95% 0.03 h);
        border: 1px solid oklch(from var(--error-color) 85% 0.08 h);
        border-radius: var(--ax-radius-lg);
        text-align: left;
        margin: 0.5rem 0;

        mat-icon {
          color: var(--error-color);
          flex-shrink: 0;
          margin-top: 2px;
        }

        strong {
          display: block;
          font-size: 0.875rem;
          color: var(--ax-text-heading);
          margin-bottom: 0.25rem;
        }

        p {
          font-size: 0.8125rem;
          color: var(--ax-text-secondary);
          margin: 0;
          line-height: 1.5;
        }
      }

      :host-context(.dark) .error-page__reason-card {
        background: oklch(from var(--error-color) 20% 0.03 h);
        border-color: oklch(from var(--error-color) 30% 0.08 h);
      }

      /* Actions */
      .error-page__actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1rem;
        flex-wrap: wrap;

        button,
        a {
          mat-icon {
            margin-right: 0.5rem;
          }
        }
      }

      /* Request Access */
      .error-page__request {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--ax-border-default);

        p {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          margin: 0 0 0.5rem 0;
        }
      }

      .error-page__link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--ax-brand-default);
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        transition: color 0.2s;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &:hover {
          color: var(--ax-brand-emphasis);
          text-decoration: underline;
        }
      }

      /* Background */
      .error-page__bg-pattern {
        position: absolute;
        inset: 0;
        display: flex;
        gap: 20px;
        transform: rotate(-12deg) scale(1.5);
        opacity: 0.03;
        pointer-events: none;
      }

      .error-page__stripe {
        flex: 1;
        background: repeating-linear-gradient(
          45deg,
          var(--error-color),
          var(--error-color) 10px,
          transparent 10px,
          transparent 20px
        );
      }

      /* Responsive */
      @media (max-width: 640px) {
        .error-page__code {
          font-size: 5rem;
        }

        .error-page__title {
          font-size: 1.5rem;
        }

        .error-page__actions {
          flex-direction: column;

          button,
          a {
            width: 100%;
          }
        }
      }
    `,
  ],
})
export class Error403Component {
  /** Optional resource name that was denied */
  resource = input<string>('');
}
