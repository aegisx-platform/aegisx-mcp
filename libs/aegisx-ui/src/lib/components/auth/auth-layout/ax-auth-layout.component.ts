import { Component, Input, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * AegisX Auth Layout Component
 *
 * A reusable split-screen authentication layout with branding on the left
 * and form content on the right. Fully responsive for mobile devices.
 *
 * @example
 * ```html
 * <ax-auth-layout
 *   brandName="AegisX"
 *   brandIcon="shield"
 *   tagline="Enterprise admin platform"
 *   [features]="['Feature 1', 'Feature 2']"
 * >
 *   <ax-login-form />
 * </ax-auth-layout>
 * ```
 */
@Component({
  selector: 'ax-auth-layout',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="auth-container">
      <!-- Left Side - Branding -->
      <div class="auth-branding" [style.background]="brandingBackground">
        <div class="branding-content">
          <!-- Logo -->
          <div class="logo-container">
            @if (brandIconTemplate) {
              <ng-container
                *ngTemplateOutlet="brandIconTemplate"
              ></ng-container>
            } @else {
              <mat-icon class="logo-icon">{{ brandIcon }}</mat-icon>
            }
            <h1 class="logo-text">{{ brandName }}</h1>
          </div>

          <!-- Tagline -->
          @if (tagline) {
            <p class="tagline">{{ tagline }}</p>
          }

          <!-- Features -->
          @if (features.length > 0) {
            <div class="features">
              @for (feature of features; track feature) {
                <div class="feature-item">
                  <mat-icon>check_circle</mat-icon>
                  <span>{{ feature }}</span>
                </div>
              }
            </div>
          }

          <!-- Custom branding content -->
          <ng-content select="[slot=branding]"></ng-content>
        </div>
      </div>

      <!-- Right Side - Form Content -->
      <div class="auth-form-container">
        <div class="form-wrapper">
          <ng-content></ng-content>
        </div>

        <!-- Footer Links -->
        @if (showFooterLinks) {
          <div class="footer-links">
            @for (link of footerLinks; track link.label) {
              <a [href]="link.url">{{ link.label }}</a>
              @if (!$last) {
                <span>•</span>
              }
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      // ============================================================================
      // 1. Container Layout (Split Screen)
      // ============================================================================
      .auth-container {
        display: flex;
        min-height: 100vh;
        width: 100%;
        background: var(--ax-background-subtle, #f9fafb);

        @media (max-width: 960px) {
          flex-direction: column;
        }
      }

      // ============================================================================
      // 2. Left Side - Branding
      // ============================================================================
      .auth-branding {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        background: linear-gradient(
          135deg,
          var(--ax-brand-default, #4f46e5) 0%,
          var(--ax-brand-emphasis, #6366f1) 100%
        );
        color: white;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 1px,
            transparent 1px
          );
          background-size: 50px 50px;
          opacity: 0.3;
        }

        @media (max-width: 960px) {
          min-height: 35vh;
          padding: 2rem;
        }
      }

      .branding-content {
        position: relative;
        z-index: 1;
        max-width: 500px;
        text-align: center;

        @media (max-width: 960px) {
          max-width: 100%;
        }
      }

      .logo-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .logo-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: white;
      }

      .logo-text {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0;
        color: white;
        letter-spacing: -0.02em;
      }

      .tagline {
        font-size: 1.125rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 3rem;
      }

      .features {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        text-align: left;
      }

      .feature-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: rgba(255, 255, 255, 0.95);
        font-size: 1rem;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
          color: rgba(255, 255, 255, 0.9);
        }
      }

      // ============================================================================
      // 3. Right Side - Form Container
      // ============================================================================
      .auth-form-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        background: var(--ax-background-default, #ffffff);

        @media (max-width: 960px) {
          padding: 2rem 1.5rem;
        }
      }

      .form-wrapper {
        width: 100%;
        max-width: 440px;
      }

      // ============================================================================
      // 4. Footer Links
      // ============================================================================
      .footer-links {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        margin-top: 2rem;
        font-size: 0.875rem;
        color: var(--ax-text-subtle);

        a {
          color: var(--ax-text-body);
          text-decoration: none;
          transition: color 0.2s ease;

          &:hover {
            color: var(--ax-brand-default);
            text-decoration: underline;
          }
        }

        span {
          color: var(--ax-text-subtle);
        }
      }
    `,
  ],
})
export class AxAuthLayoutComponent {
  /** Brand name displayed in the branding section */
  @Input() brandName = 'AegisX';

  /** Material icon name for the brand logo */
  @Input() brandIcon = 'shield';

  /** Tagline displayed below the brand name */
  @Input() tagline = '';

  /** List of features to display with checkmarks */
  @Input() features: string[] = [];

  /** Custom background for branding section (CSS gradient or color) */
  @Input() brandingBackground = '';

  /** Whether to show footer links */
  @Input() showFooterLinks = true;

  /** Footer links configuration */
  @Input() footerLinks: Array<{ label: string; url: string }> = [
    { label: 'Terms', url: '#' },
    { label: 'Privacy', url: '#' },
    { label: 'Help', url: '#' },
  ];

  /** Custom brand icon template */
  @ContentChild('brandIcon') brandIconTemplate?: TemplateRef<unknown>;
}
