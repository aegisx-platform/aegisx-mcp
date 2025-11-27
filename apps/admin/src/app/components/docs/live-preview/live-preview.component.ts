import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Live Preview Component
 *
 * Container for displaying live component examples with:
 * - Preview area with customizable background
 * - Responsive viewport toggles (mobile/tablet/desktop)
 * - Theme-aware styling
 */
@Component({
  selector: 'ax-live-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
  ],
  template: `
    <div
      class="live-preview"
      [class.live-preview--bordered]="variant === 'bordered'"
    >
      <!-- Header -->
      @if (showHeader) {
        <div class="live-preview__header">
          @if (title) {
            <span class="live-preview__title">{{ title }}</span>
          }
          <div class="live-preview__actions">
            @if (showResponsiveToggle) {
              <mat-button-toggle-group
                [value]="viewport()"
                (change)="viewport.set($event.value)"
                class="live-preview__viewport-toggle"
              >
                <mat-button-toggle value="mobile" matTooltip="Mobile (375px)">
                  <mat-icon>smartphone</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="tablet" matTooltip="Tablet (768px)">
                  <mat-icon>tablet</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="desktop" matTooltip="Desktop (100%)">
                  <mat-icon>computer</mat-icon>
                </mat-button-toggle>
              </mat-button-toggle-group>
            }
          </div>
        </div>
      }

      <!-- Preview Area -->
      <div
        class="live-preview__content"
        [class.live-preview__content--dark]="variant === 'dark'"
        [class.live-preview__content--subtle]="variant === 'subtle'"
        [class.live-preview__content--center]="align === 'center'"
        [class.live-preview__content--start]="align === 'start'"
        [class.live-preview__content--end]="align === 'end'"
        [class.live-preview__content--stretch]="align === 'stretch'"
        [class.live-preview__content--column]="direction === 'column'"
        [class.live-preview__content--wrap]="wrap"
        [style.min-height]="minHeight"
        [style.padding]="padding"
        [style.gap]="gap"
      >
        <div
          class="live-preview__viewport"
          [class.live-preview__viewport--mobile]="viewport() === 'mobile'"
          [class.live-preview__viewport--tablet]="viewport() === 'tablet'"
        >
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .live-preview {
        border-radius: var(--ax-radius-lg, 0.75rem);
        overflow: hidden;
        background-color: var(--ax-background-default);
        margin: var(--ax-spacing-md, 0.75rem) 0;
      }

      .live-preview--bordered {
        border: 1px solid var(--ax-border-default);
      }

      .live-preview__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-md, 0.75rem);
        background-color: var(--ax-background-subtle);
        border-bottom: 1px solid var(--ax-border-default);
      }

      .live-preview__title {
        font-size: var(--ax-text-sm, 0.875rem);
        font-weight: 600;
        color: var(--ax-text-primary);
      }

      .live-preview__actions {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
      }

      .live-preview__viewport-toggle {
        ::ng-deep {
          .mat-button-toggle {
            width: 32px;
            height: 32px;
          }

          .mat-button-toggle-label-content {
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }

      .live-preview__content {
        display: flex;
        padding: var(--ax-spacing-lg, 1rem);
        min-height: 100px;
        background-color: var(--ax-background-subtle);
      }

      .live-preview__content--dark {
        background-color: #1e1e1e;
      }

      .live-preview__content--subtle {
        background-color: var(--ax-background-subtle);
      }

      .live-preview__content--center {
        justify-content: center;
        align-items: center;
      }

      .live-preview__content--start {
        justify-content: flex-start;
        align-items: flex-start;
      }

      .live-preview__content--end {
        justify-content: flex-end;
        align-items: flex-end;
      }

      .live-preview__content--stretch {
        align-items: stretch;
      }

      .live-preview__content--column {
        flex-direction: column;
      }

      .live-preview__content--wrap {
        flex-wrap: wrap;
      }

      .live-preview__viewport {
        width: 100%;
        transition: width var(--ax-duration-normal, 250ms) ease;
      }

      .live-preview__viewport--mobile {
        width: 375px;
        max-width: 100%;
        margin: 0 auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-md, 0.5rem);
        background-color: var(--ax-background-default);
        padding: var(--ax-spacing-md, 0.75rem);
      }

      .live-preview__viewport--tablet {
        width: 768px;
        max-width: 100%;
        margin: 0 auto;
        border: 1px solid var(--ax-border-default);
        border-radius: var(--ax-radius-md, 0.5rem);
        background-color: var(--ax-background-default);
        padding: var(--ax-spacing-md, 0.75rem);
      }
    `,
  ],
})
export class LivePreviewComponent {
  @Input() title = '';
  @Input() variant: 'default' | 'dark' | 'subtle' | 'bordered' = 'bordered';
  @Input() align: 'center' | 'start' | 'end' | 'stretch' = 'center';
  @Input() direction: 'row' | 'column' = 'row';
  @Input() wrap = false;
  @Input() minHeight = '100px';
  @Input() padding = 'var(--ax-spacing-lg, 1rem)';
  @Input() gap = 'var(--ax-spacing-md, 0.75rem)';
  @Input() showHeader = true;
  @Input() showResponsiveToggle = false;

  protected viewport = signal<'mobile' | 'tablet' | 'desktop'>('desktop');
}
