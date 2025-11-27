import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ComponentToken } from '../../../types/docs.types';

/**
 * Component Tokens Component
 *
 * Displays CSS tokens/variables used by a component with:
 * - Token name and CSS variable
 * - Usage description
 * - Live computed value preview
 * - Click to copy
 */
@Component({
  selector: 'ax-component-tokens',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="component-tokens">
      <h3 class="component-tokens__title">
        <mat-icon>palette</mat-icon>
        Tokens Used
      </h3>
      <p class="component-tokens__description">
        CSS variables that control this component's appearance.
      </p>

      <div class="component-tokens__table-wrapper">
        <table class="component-tokens__table">
          <thead>
            <tr>
              <th class="component-tokens__th--preview">Preview</th>
              <th class="component-tokens__th--token">Token</th>
              <th class="component-tokens__th--usage">Usage</th>
              <th class="component-tokens__th--value">Value</th>
            </tr>
          </thead>
          <tbody>
            @for (token of tokens; track token.cssVar) {
              <tr
                class="component-tokens__row"
                (click)="copyToken(token.cssVar)"
                matTooltip="Click to copy"
              >
                <td class="component-tokens__cell--preview">
                  <span
                    class="component-tokens__swatch"
                    [style]="getPreviewStyle(token)"
                  ></span>
                </td>
                <td class="component-tokens__cell--token">
                  <code class="component-tokens__code">{{ token.cssVar }}</code>
                  <span class="component-tokens__category">{{
                    token.category
                  }}</span>
                </td>
                <td class="component-tokens__cell--usage">
                  {{ token.usage }}
                </td>
                <td class="component-tokens__cell--value">
                  <code class="component-tokens__value">{{
                    getComputedValue(token.cssVar)
                  }}</code>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .component-tokens {
        margin: var(--ax-spacing-xl, 1.5rem) 0;
      }

      .component-tokens__title {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        font-size: var(--ax-text-xl, 1.25rem);
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 0 0 var(--ax-spacing-xs, 0.25rem) 0;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
          color: var(--ax-brand-default);
        }
      }

      .component-tokens__description {
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-secondary);
        margin: 0 0 var(--ax-spacing-md, 0.75rem) 0;
      }

      .component-tokens__table-wrapper {
        overflow-x: auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg, 0.75rem);
      }

      .component-tokens__table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--ax-text-sm, 0.875rem);
      }

      .component-tokens__table th {
        text-align: left;
        padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-md, 0.75rem);
        background-color: var(--ax-background-subtle);
        border-bottom: 1px solid var(--ax-border-default);
        font-weight: 600;
        color: var(--ax-text-secondary);
        font-size: var(--ax-text-xs, 0.75rem);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .component-tokens__th--preview {
        width: 50px;
      }

      .component-tokens__th--token {
        width: 35%;
      }

      .component-tokens__th--usage {
        width: 35%;
      }

      .component-tokens__th--value {
        width: 20%;
      }

      .component-tokens__row {
        cursor: pointer;
        transition: background-color var(--ax-duration-fast, 150ms);

        &:hover {
          background-color: var(--ax-background-subtle);
        }

        &:not(:last-child) td {
          border-bottom: 1px solid var(--ax-border-default);
        }
      }

      .component-tokens__row td {
        padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-md, 0.75rem);
        vertical-align: middle;
      }

      .component-tokens__swatch {
        display: block;
        width: 24px;
        height: 24px;
        border-radius: var(--ax-radius-sm, 0.25rem);
        border: 1px solid var(--ax-border-default);
      }

      .component-tokens__cell--token {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .component-tokens__code {
        font-family: var(--ax-font-mono);
        font-size: var(--ax-text-sm, 0.875rem);
        color: var(--ax-text-primary);
        word-break: break-all;
      }

      .component-tokens__category {
        font-size: var(--ax-text-xs, 0.75rem);
        color: var(--ax-text-secondary);
      }

      .component-tokens__cell--usage {
        color: var(--ax-text-secondary);
      }

      .component-tokens__value {
        font-family: var(--ax-font-mono);
        font-size: var(--ax-text-xs, 0.75rem);
        color: var(--ax-text-secondary);
        background-color: var(--ax-background-subtle);
        padding: 2px 6px;
        border-radius: var(--ax-radius-sm, 0.25rem);
      }
    `,
  ],
})
export class ComponentTokensComponent implements OnInit {
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  @Input() tokens: ComponentToken[] = [];

  private computedValues: Map<string, string> = new Map();

  ngOnInit(): void {
    // Pre-compute all token values
    this.tokens.forEach((token) => {
      const value = this.computeCssValue(token.cssVar);
      this.computedValues.set(token.cssVar, value);
    });
  }

  getComputedValue(cssVar: string): string {
    return this.computedValues.get(cssVar) || 'inherit';
  }

  getPreviewStyle(token: ComponentToken): Record<string, string> {
    const value = this.getComputedValue(token.cssVar);
    const category = token.category.toLowerCase();

    if (category === 'colors' || category === 'color') {
      return { backgroundColor: `var(${token.cssVar})` };
    } else if (category === 'shadows' || category === 'shadow') {
      return {
        backgroundColor: 'var(--ax-background-default)',
        boxShadow: `var(${token.cssVar})`,
      };
    } else if (category === 'borders' || category === 'border') {
      if (token.cssVar.includes('radius')) {
        return {
          backgroundColor: 'var(--ax-brand-default)',
          borderRadius: `var(${token.cssVar})`,
        };
      }
      return {
        border: `2px solid var(--ax-border-default)`,
        borderWidth: `var(${token.cssVar})`,
      };
    } else if (category === 'spacing') {
      return {
        backgroundColor: 'var(--ax-brand-faint)',
        width: `var(${token.cssVar})`,
        height: `var(${token.cssVar})`,
        minWidth: '8px',
        minHeight: '8px',
        maxWidth: '24px',
        maxHeight: '24px',
      };
    }

    // Default: show as color
    return { backgroundColor: `var(${token.cssVar}, #ccc)` };
  }

  copyToken(cssVar: string): void {
    const copyText = `var(${cssVar})`;
    this.clipboard.copy(copyText);
    this.snackBar.open(`Copied: ${copyText}`, 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  private computeCssValue(cssVar: string): string {
    if (typeof document === 'undefined') return 'inherit';

    const root = document.documentElement;
    const value = getComputedStyle(root)
      .getPropertyValue(cssVar.replace('--', ''))
      .trim();
    return value || 'inherit';
  }
}
