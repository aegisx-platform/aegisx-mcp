import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'ax-error-500',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="error-page error-page--500">
      <div class="error-page__container">
        <!-- Illustration -->
        <div class="error-page__illustration">
          <div class="error-page__code">500</div>
          <div class="error-page__gears">
            <div class="error-page__gear error-page__gear--1">
              <mat-icon>settings</mat-icon>
            </div>
            <div class="error-page__gear error-page__gear--2">
              <mat-icon>settings</mat-icon>
            </div>
          </div>
          <mat-icon class="error-page__icon">report_problem</mat-icon>
        </div>

        <!-- Content -->
        <div class="error-page__content">
          <h1 class="error-page__title">Server Error</h1>
          <p class="error-page__description">
            Something went wrong on our end. Our team has been notified and is
            working to fix the issue. Please try again later.
          </p>

          <!-- Error Details (Optional) -->
          <div class="error-page__details">
            <button
              mat-button
              (click)="showDetails.set(!showDetails())"
              class="error-page__toggle"
            >
              <mat-icon>{{
                showDetails() ? 'expand_less' : 'expand_more'
              }}</mat-icon>
              {{ showDetails() ? 'Hide' : 'Show' }} Technical Details
            </button>
            @if (showDetails()) {
              <div class="error-page__error-box">
                <code>
                  Error ID: ERR_{{ errorId }}<br />
                  Timestamp: {{ timestamp }}<br />
                  Status: 500 Internal Server Error
                </code>
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="error-page__actions">
            <button
              mat-flat-button
              color="primary"
              (click)="retry()"
              [disabled]="isRetrying()"
            >
              @if (isRetrying()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>refresh</mat-icon>
              }
              {{ isRetrying() ? 'Retrying...' : 'Try Again' }}
            </button>
            <a mat-stroked-button routerLink="/">
              <mat-icon>home</mat-icon>
              Back to Home
            </a>
          </div>

          <!-- Support -->
          <div class="error-page__support">
            <p>
              If the problem persists,
              <a routerLink="/support" class="error-page__link"
                >contact our support team</a
              >.
            </p>
          </div>
        </div>
      </div>

      <!-- Background -->
      <div class="error-page__bg-grid"></div>
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

      .error-page--500 {
        --error-color: var(--ax-error-default, #ef4444);
      }

      .error-page__container {
        text-align: center;
        max-width: 480px;
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

      .error-page__gears {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .error-page__gear {
        position: absolute;
        color: var(--error-color);
        opacity: 0.3;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }
      }

      .error-page__gear--1 {
        top: -60px;
        left: 30px;
        animation: rotate 8s linear infinite;
      }

      .error-page__gear--2 {
        top: -40px;
        left: -50px;
        animation: rotate-reverse 6s linear infinite;

        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
        }
      }

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes rotate-reverse {
        from {
          transform: rotate(360deg);
        }
        to {
          transform: rotate(0deg);
        }
      }

      .error-page__icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--error-color);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
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

      /* Details */
      .error-page__details {
        margin-top: 0.5rem;
      }

      .error-page__toggle {
        color: var(--ax-text-secondary);
        font-size: 0.875rem;
      }

      .error-page__error-box {
        margin-top: 0.5rem;
        padding: 1rem;
        background: var(--ax-background-muted);
        border-radius: var(--ax-radius-md);
        border: 1px solid var(--ax-border-default);
        text-align: left;

        code {
          font-size: 0.75rem;
          color: var(--ax-text-secondary);
          font-family: var(--ax-font-mono);
          line-height: 1.8;
        }
      }

      /* Actions */
      .error-page__actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1rem;

        button,
        a {
          mat-icon {
            margin-right: 0.5rem;
          }
        }

        mat-spinner {
          margin-right: 0.5rem;
        }
      }

      /* Support */
      .error-page__support {
        margin-top: 1.5rem;

        p {
          font-size: 0.875rem;
          color: var(--ax-text-secondary);
          margin: 0;
        }
      }

      .error-page__link {
        color: var(--ax-brand-default);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }

      /* Background */
      .error-page__bg-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(var(--ax-border-default) 1px, transparent 1px),
          linear-gradient(90deg, var(--ax-border-default) 1px, transparent 1px);
        background-size: 50px 50px;
        opacity: 0.3;
        pointer-events: none;
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
        }
      }
    `,
  ],
})
export class Error500Component {
  showDetails = signal(false);
  isRetrying = signal(false);

  errorId = Math.random().toString(36).substring(2, 10).toUpperCase();
  timestamp = new Date().toISOString();

  retry(): void {
    this.isRetrying.set(true);
    setTimeout(() => {
      this.isRetrying.set(false);
      window.location.reload();
    }, 1500);
  }
}
