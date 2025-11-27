import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AxBreadcrumbComponent } from '@aegisx/ui';
import { BreadcrumbItem, ComponentStatus } from '../../../types/docs.types';

/**
 * Documentation Header Component
 *
 * Unified header for all documentation pages:
 * - Component docs: with import statement, status badge, version
 * - Guide/prose pages: simplified header without code-related elements
 *
 * Features:
 * - Breadcrumb navigation (with optional icon)
 * - Title and description
 * - Status badge (stable/beta/experimental/deprecated)
 * - Quick import statement with copy button
 * - Quick links for navigation
 *
 * Variants:
 * - 'component': Full header with import, status, version (default)
 * - 'page': Simplified header for prose/guide pages
 */
@Component({
  selector: 'ax-doc-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    AxBreadcrumbComponent,
  ],
  template: `
    <header class="doc-header" [class.doc-header--page]="variant === 'page'">
      <!-- Breadcrumb -->
      @if (breadcrumbs.length > 0) {
        <nav class="doc-header__breadcrumb">
          @if (icon) {
            <mat-icon class="doc-header__breadcrumb-icon">{{ icon }}</mat-icon>
          }
          @for (item of breadcrumbs; track item.label; let last = $last) {
            @if (item.link && !last) {
              <a [routerLink]="item.link" class="doc-header__breadcrumb-link">
                {{ item.label }}
              </a>
              <mat-icon class="doc-header__breadcrumb-separator"
                >chevron_right</mat-icon
              >
            } @else {
              <span class="doc-header__breadcrumb-current">{{
                item.label
              }}</span>
            }
          }
        </nav>
      }

      <!-- Title Row -->
      <div class="doc-header__title-row">
        <h1 class="doc-header__title">{{ title }}</h1>
        @if (showStatus && status) {
          <span class="doc-header__badge doc-header__badge--{{ status }}">
            {{ getStatusLabel(status) }}
          </span>
        }
        @if (showVersion && version) {
          <span class="doc-header__version">{{ version }}</span>
        }
      </div>

      <!-- Description -->
      @if (description) {
        <p class="doc-header__description">{{ description }}</p>
      }

      <!-- Import Statement (only for component variant) -->
      @if (showImport && importName) {
        <div class="doc-header__import">
          <code class="doc-header__import-code">
            import {{ '{' }} {{ importName }} {{ '}' }} from '{{ importPath }}';
          </code>
          <button
            mat-icon-button
            class="doc-header__copy-btn"
            matTooltip="Copy import"
            (click)="copyImport()"
          >
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
      }

      <!-- Quick Links (only for component variant) -->
      @if (showQuickLinks) {
        <nav class="doc-header__quick-links">
          <span class="doc-header__quick-links-label">Jump to:</span>
          <a href="#examples" class="doc-header__quick-link">Examples</a>
          <a href="#api" class="doc-header__quick-link">API</a>
          @if (showTokens) {
            <a href="#tokens" class="doc-header__quick-link">Tokens</a>
          }
          <a href="#guidelines" class="doc-header__quick-link">Guidelines</a>
        </nav>
      }
    </header>
  `,
  styles: [
    `
      .doc-header {
        margin-bottom: var(--ax-spacing-xl, 1.5rem);
      }

      .doc-header__breadcrumb {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs, 0.25rem);
        margin-bottom: var(--ax-spacing-md, 0.75rem);
        font-size: var(--ax-text-sm, 0.875rem);
      }

      .doc-header__breadcrumb-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--ax-brand-default);
        margin-right: var(--ax-spacing-xs, 0.25rem);
      }

      .doc-header__breadcrumb-link {
        color: var(--ax-text-secondary);
        text-decoration: none;
        transition: color var(--ax-duration-fast, 150ms);

        &:hover {
          color: var(--ax-text-primary);
        }
      }

      .doc-header__breadcrumb-separator {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--ax-text-disabled);
      }

      .doc-header__breadcrumb-current {
        color: var(--ax-text-primary);
        font-weight: 500;
      }

      .doc-header__title-row {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        margin-bottom: var(--ax-spacing-sm, 0.5rem);
      }

      .doc-header__title {
        font-size: var(--ax-text-3xl, 1.875rem);
        font-weight: 700;
        color: var(--ax-text-heading);
        margin: 0;
        line-height: 1.2;
      }

      /* Page variant - larger title */
      .doc-header--page .doc-header__title {
        font-size: 2.25rem;
      }

      .doc-header__badge {
        display: inline-flex;
        align-items: center;
        padding: 0.125rem 0.5rem;
        border-radius: var(--ax-radius-full, 9999px);
        font-size: var(--ax-text-xs, 0.75rem);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }

      .doc-header__badge--stable {
        background-color: var(--ax-success-faint);
        color: var(--ax-success-emphasis);
      }

      .doc-header__badge--beta {
        background-color: var(--ax-warning-faint);
        color: var(--ax-warning-emphasis);
      }

      .doc-header__badge--experimental {
        background-color: var(--ax-info-faint);
        color: var(--ax-info-emphasis);
      }

      .doc-header__badge--deprecated {
        background-color: var(--ax-error-faint);
        color: var(--ax-error-emphasis);
      }

      .doc-header__version {
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-secondary);
        font-weight: 500;
      }

      .doc-header__description {
        font-size: var(--ax-text-lg, 1.125rem);
        color: var(--ax-text-secondary);
        margin: 0 0 var(--ax-spacing-md, 0.75rem) 0;
        line-height: 1.6;
        max-width: 65ch;
      }

      .doc-header__import {
        display: inline-flex;
        align-items: center;
        gap: var(--ax-spacing-xs, 0.25rem);
        background-color: var(--ax-background-subtle);
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-md, 0.5rem);
        padding: var(--ax-spacing-xs, 0.25rem) var(--ax-spacing-sm, 0.5rem);
        margin-bottom: var(--ax-spacing-md, 0.75rem);
      }

      .doc-header__import-code {
        font-family: var(--ax-font-mono);
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-primary);
      }

      .doc-header__copy-btn {
        width: 28px;
        height: 28px;
        line-height: 28px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .doc-header__quick-links {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        font-size: var(--ax-text-sm, 0.875rem);
      }

      .doc-header__quick-links-label {
        color: var(--ax-text-secondary);
      }

      .doc-header__quick-link {
        color: var(--ax-brand-default);
        text-decoration: none;
        font-weight: 500;
        transition: color var(--ax-duration-fast, 150ms);

        &:hover {
          color: var(--ax-brand-emphasis);
          text-decoration: underline;
        }

        &::after {
          content: '|';
          margin-left: var(--ax-spacing-sm, 0.5rem);
          color: var(--ax-border-default);
        }

        &:last-child::after {
          content: '';
        }
      }
    `,
  ],
})
export class DocHeaderComponent {
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  // Content
  @Input() title = '';
  @Input() description = '';
  @Input() breadcrumbs: BreadcrumbItem[] = [];

  // Variant: 'component' (default) or 'page' (for prose/guide pages)
  @Input() variant: 'component' | 'page' = 'component';

  // Optional icon for breadcrumb (e.g., 'rocket_launch' for Getting Started)
  @Input() icon?: string;

  // Component metadata
  @Input() status?: ComponentStatus;
  @Input() version?: string;
  @Input() importPath = '@aegisx/ui';
  @Input() importName = '';

  // Visibility controls
  @Input() showImport = true;
  @Input() showStatus = true;
  @Input() showVersion = true;
  @Input() showQuickLinks = true;
  @Input() showTokens = true;

  getStatusLabel(status: ComponentStatus): string {
    const labels: Record<ComponentStatus, string> = {
      stable: 'Stable',
      beta: 'Beta',
      experimental: 'Experimental',
      deprecated: 'Deprecated',
    };
    return labels[status];
  }

  copyImport(): void {
    const importStatement = `import { ${this.importName} } from '${this.importPath}';`;
    this.clipboard.copy(importStatement);
    this.snackBar.open('Import copied to clipboard', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
