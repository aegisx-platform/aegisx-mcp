import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * Live Preview Component
 *
 * Simple container for displaying live component examples with:
 * - Customizable background
 * - Flexible layout options (row/column, wrap, gap)
 * - Theme-aware styling
 */
@Component({
  selector: 'ax-live-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="live-preview"
      [class.live-preview--bordered]="variant === 'bordered'"
    >
      <div
        class="live-preview__content"
        [class.live-preview__content--dark]="variant === 'dark'"
        [class.live-preview__content--subtle]="variant === 'subtle'"
        [class.live-preview__content--white]="variant === 'white'"
        [class.live-preview__content--contrast]="variant === 'contrast'"
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
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .live-preview {
        border-radius: var(--ax-radius-lg, 0.75rem);
        overflow: visible;
        background-color: var(--ax-background-default);
        margin: var(--ax-spacing-md, 0.75rem) 0;
      }

      .live-preview--bordered {
        border: 1px solid var(--ax-border-default);
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

      .live-preview__content--white {
        background-color: #ffffff;
      }

      .live-preview__content--contrast {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    `,
  ],
})
export class LivePreviewComponent {
  @Input() variant:
    | 'default'
    | 'dark'
    | 'subtle'
    | 'bordered'
    | 'white'
    | 'contrast' = 'bordered';
  @Input() align: 'center' | 'start' | 'end' | 'stretch' = 'center';
  @Input() direction: 'row' | 'column' = 'row';
  @Input() wrap = true;
  @Input() minHeight = '100px';
  @Input() padding = 'var(--ax-spacing-lg, 1rem)';
  @Input() gap = 'var(--ax-spacing-md, 0.75rem)';
}
