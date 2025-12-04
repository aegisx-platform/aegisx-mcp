import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ax-error-404',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="error-page">
      <div class="error-page__container">
        <!-- Illustration -->
        <div class="error-page__illustration">
          <div class="error-page__code">404</div>
          <div class="error-page__rings">
            <div class="error-page__ring error-page__ring--1"></div>
            <div class="error-page__ring error-page__ring--2"></div>
            <div class="error-page__ring error-page__ring--3"></div>
          </div>
          <mat-icon class="error-page__icon">search_off</mat-icon>
        </div>

        <!-- Content -->
        <div class="error-page__content">
          <h1 class="error-page__title">Page Not Found</h1>
          <p class="error-page__description">
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          <!-- Actions -->
          <div class="error-page__actions">
            <a mat-flat-button color="primary" routerLink="/">
              <mat-icon>home</mat-icon>
              Back to Home
            </a>
            <button mat-stroked-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Go Back
            </button>
          </div>

          <!-- Helpful Links -->
          <div class="error-page__links">
            <span class="error-page__links-label">Helpful Links:</span>
            <a routerLink="/docs" class="error-page__link">Documentation</a>
            <a routerLink="/support" class="error-page__link">Support</a>
            <a routerLink="/contact" class="error-page__link">Contact Us</a>
          </div>
        </div>
      </div>

      <!-- Background Decoration -->
      <div class="error-page__bg-decoration">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="currentColor"
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.1C64.8,55,53.7,66.3,40.4,73.7C27.1,81.1,11.6,84.6,-3.9,90.3C-19.4,96,-38.8,103.9,-54.4,99.3C-70,94.7,-81.7,77.6,-87.7,59.3C-93.7,41,-94,21.5,-91.3,3.4C-88.7,-14.7,-83.1,-31.4,-74.4,-46.1C-65.7,-60.8,-53.9,-73.5,-40,-80.5C-26.1,-87.5,-10.1,-88.8,3.4,-94.7C16.8,-100.6,30.6,-83.6,44.7,-76.4Z"
            transform="translate(100 100)"
          />
        </svg>
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
        color: var(--ax-brand-default);
        opacity: 0.1;
        line-height: 1;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .error-page__rings {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .error-page__ring {
        position: absolute;
        border: 2px solid var(--ax-brand-default);
        border-radius: 50%;
        opacity: 0.2;
        animation: pulse 3s ease-in-out infinite;
      }

      .error-page__ring--1 {
        width: 100px;
        height: 100px;
        top: -50px;
        left: -50px;
        animation-delay: 0s;
      }

      .error-page__ring--2 {
        width: 150px;
        height: 150px;
        top: -75px;
        left: -75px;
        animation-delay: 0.5s;
      }

      .error-page__ring--3 {
        width: 200px;
        height: 200px;
        top: -100px;
        left: -100px;
        animation-delay: 1s;
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 0.2;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.4;
        }
      }

      .error-page__icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--ax-brand-default);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
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
      }

      /* Links */
      .error-page__links {
        display: flex;
        gap: 1rem;
        justify-content: center;
        align-items: center;
        margin-top: 2rem;
        flex-wrap: wrap;
      }

      .error-page__links-label {
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
      }

      .error-page__link {
        font-size: 0.875rem;
        color: var(--ax-brand-default);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;

        &:hover {
          color: var(--ax-brand-emphasis);
          text-decoration: underline;
        }
      }

      /* Background */
      .error-page__bg-decoration {
        position: absolute;
        width: 600px;
        height: 600px;
        right: -200px;
        bottom: -200px;
        opacity: 0.03;
        color: var(--ax-brand-default);
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
export class Error404Component {
  goBack(): void {
    window.history.back();
  }
}
