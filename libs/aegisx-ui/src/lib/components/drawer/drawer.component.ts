import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  TemplateRef,
  ContentChild,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { animate, style, transition, trigger } from '@angular/animations';
import { DrawerPosition, DrawerSize } from './drawer.types';

/**
 * AegisX Drawer/Sheet Component
 *
 * A sliding panel that appears from the edge of the screen.
 * Useful for navigation, filters, forms, and detail views.
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <ax-drawer [(open)]="isOpen" title="Settings">
 *   <p>Drawer content here</p>
 * </ax-drawer>
 *
 * <!-- With footer template -->
 * <ax-drawer [(open)]="isOpen" title="Edit Item">
 *   <ng-template #footer>
 *     <button mat-flat-button color="primary">Save</button>
 *   </ng-template>
 *   <form>...</form>
 * </ax-drawer>
 *
 * <!-- Bottom sheet on mobile -->
 * <ax-drawer [(open)]="isOpen" position="bottom" size="sm">
 *   <p>Sheet content</p>
 * </ax-drawer>
 * ```
 */
@Component({
  selector: 'ax-drawer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('backdrop', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('slidePanel', [
      // Left: slide in from left
      transition('void => left', [
        style({ transform: 'translateX(-100%)' }),
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateX(0)' }),
        ),
      ]),
      transition('left => void', [
        animate(
          '200ms cubic-bezier(0.4, 0, 0.6, 1)',
          style({ transform: 'translateX(-100%)' }),
        ),
      ]),
      // Right: slide in from right
      transition('void => right', [
        style({ transform: 'translateX(100%)' }),
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateX(0)' }),
        ),
      ]),
      transition('right => void', [
        animate(
          '200ms cubic-bezier(0.4, 0, 0.6, 1)',
          style({ transform: 'translateX(100%)' }),
        ),
      ]),
      // Top: slide in from top
      transition('void => top', [
        style({ transform: 'translateY(-100%)' }),
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(0)' }),
        ),
      ]),
      transition('top => void', [
        animate(
          '200ms cubic-bezier(0.4, 0, 0.6, 1)',
          style({ transform: 'translateY(-100%)' }),
        ),
      ]),
      // Bottom: slide in from bottom
      transition('void => bottom', [
        style({ transform: 'translateY(100%)' }),
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(0)' }),
        ),
      ]),
      transition('bottom => void', [
        animate(
          '200ms cubic-bezier(0.4, 0, 0.6, 1)',
          style({ transform: 'translateY(100%)' }),
        ),
      ]),
    ]),
  ],
  template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      @if (hasBackdrop) {
        <div
          class="ax-drawer-backdrop"
          [@backdrop]
          (click)="onBackdropClick()"
          (keydown.escape)="onBackdropClick()"
          role="button"
          tabindex="0"
          aria-label="Close drawer"
        ></div>
      }

      <!-- Drawer Panel -->
      <div
        class="ax-drawer-panel"
        [class.ax-drawer-left]="position === 'left'"
        [class.ax-drawer-right]="position === 'right'"
        [class.ax-drawer-top]="position === 'top'"
        [class.ax-drawer-bottom]="position === 'bottom'"
        [class.ax-drawer-sm]="size === 'sm'"
        [class.ax-drawer-md]="size === 'md'"
        [class.ax-drawer-lg]="size === 'lg'"
        [class.ax-drawer-xl]="size === 'xl'"
        [class.ax-drawer-full]="size === 'full'"
        [@slidePanel]="position"
      >
        <!-- Header -->
        @if (showHeader) {
          <div class="ax-drawer-header">
            <div class="ax-drawer-header-content">
              @if (icon) {
                <mat-icon class="ax-drawer-icon">{{ icon }}</mat-icon>
              }
              @if (title) {
                <h2 class="ax-drawer-title">{{ title }}</h2>
              }
              @if (subtitle) {
                <p class="ax-drawer-subtitle">{{ subtitle }}</p>
              }
            </div>
            @if (showCloseButton) {
              <button
                mat-icon-button
                class="ax-drawer-close"
                (click)="close()"
                aria-label="Close drawer"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
        }

        <!-- Content -->
        <div class="ax-drawer-content">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        @if (footerTemplate) {
          <div class="ax-drawer-footer">
            <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        pointer-events: none;
      }

      :host:has(.ax-drawer-backdrop),
      :host:has(.ax-drawer-panel) {
        pointer-events: auto;
      }

      .ax-drawer-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
      }

      .ax-drawer-panel {
        position: fixed;
        background: var(--ax-background-default, #ffffff);
        box-shadow: var(--ax-shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1));
        display: flex;
        flex-direction: column;
        z-index: 1001;
        max-height: 100vh;
        max-width: 100vw;
      }

      // Position variants
      .ax-drawer-left,
      .ax-drawer-right {
        top: 0;
        height: 100%;
      }

      .ax-drawer-left {
        left: 0;
        border-right: 1px solid var(--ax-border-default, #e4e4e7);
      }

      .ax-drawer-right {
        right: 0;
        border-left: 1px solid var(--ax-border-default, #e4e4e7);
      }

      .ax-drawer-top,
      .ax-drawer-bottom {
        left: 0;
        width: 100%;
      }

      .ax-drawer-top {
        top: 0;
        border-bottom: 1px solid var(--ax-border-default, #e4e4e7);
      }

      .ax-drawer-bottom {
        bottom: 0;
        border-top: 1px solid var(--ax-border-default, #e4e4e7);
        border-radius: var(--ax-radius-xl, 1rem) var(--ax-radius-xl, 1rem) 0 0;
      }

      // Size variants (for left/right)
      .ax-drawer-left,
      .ax-drawer-right {
        &.ax-drawer-sm {
          width: 320px;
        }
        &.ax-drawer-md {
          width: 400px;
        }
        &.ax-drawer-lg {
          width: 500px;
        }
        &.ax-drawer-xl {
          width: 640px;
        }
        &.ax-drawer-full {
          width: 100%;
        }
      }

      // Size variants (for top/bottom)
      .ax-drawer-top,
      .ax-drawer-bottom {
        &.ax-drawer-sm {
          height: 200px;
        }
        &.ax-drawer-md {
          height: 320px;
        }
        &.ax-drawer-lg {
          height: 480px;
        }
        &.ax-drawer-xl {
          height: 640px;
        }
        &.ax-drawer-full {
          height: 100%;
        }
      }

      // Header
      .ax-drawer-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--ax-border-muted, #f4f4f5);
        flex-shrink: 0;
      }

      .ax-drawer-header-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .ax-drawer-icon {
        color: var(--ax-text-secondary, #71717a);
        margin-bottom: 0.25rem;
      }

      .ax-drawer-title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ax-text-heading, #0a0a0a);
      }

      .ax-drawer-subtitle {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ax-text-secondary, #71717a);
      }

      .ax-drawer-close {
        margin: -0.5rem -0.5rem 0 0;
      }

      // Content
      .ax-drawer-content {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
      }

      // Footer
      .ax-drawer-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--ax-border-muted, #f4f4f5);
        flex-shrink: 0;
      }

      // Responsive
      @media (max-width: 640px) {
        .ax-drawer-left,
        .ax-drawer-right {
          &.ax-drawer-sm,
          &.ax-drawer-md,
          &.ax-drawer-lg,
          &.ax-drawer-xl {
            width: 100%;
          }
        }
      }

      // Dark mode
      :host-context(.dark),
      :host-context([data-theme='dark']) {
        .ax-drawer-panel {
          background: var(--ax-background-default);
          border-color: var(--ax-border-default);
        }

        .ax-drawer-header,
        .ax-drawer-footer {
          border-color: var(--ax-border-default);
        }
      }
    `,
  ],
})
export class AxDrawerComponent {
  /**
   * Whether the drawer is open
   */
  @Input()
  set open(value: boolean) {
    this.isOpen.set(value);
  }
  get open(): boolean {
    return this.isOpen();
  }

  /**
   * Emit when open state changes
   */
  @Output() openChange = new EventEmitter<boolean>();

  /**
   * Position of the drawer
   * @default 'right'
   */
  @Input() position: DrawerPosition = 'right';

  /**
   * Size of the drawer
   * @default 'md'
   */
  @Input() size: DrawerSize = 'md';

  /**
   * Drawer title
   */
  @Input() title?: string;

  /**
   * Drawer subtitle
   */
  @Input() subtitle?: string;

  /**
   * Icon to show in header
   */
  @Input() icon?: string;

  /**
   * Show header section
   * @default true
   */
  @Input() showHeader: boolean = true;

  /**
   * Show close button
   * @default true
   */
  @Input() showCloseButton: boolean = true;

  /**
   * Show backdrop
   * @default true
   */
  @Input() hasBackdrop: boolean = true;

  /**
   * Close on backdrop click
   * @default true
   */
  @Input() closeOnBackdropClick: boolean = true;

  /**
   * Close on Escape key
   * @default true
   */
  @Input() closeOnEscape: boolean = true;

  /**
   * Footer template
   */
  @ContentChild('footer') footerTemplate?: TemplateRef<unknown>;

  /**
   * Internal open state
   */
  protected readonly isOpen = signal(false);

  constructor() {
    // Handle Escape key
    effect(() => {
      if (this.isOpen() && this.closeOnEscape) {
        const handler = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            this.close();
          }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
      }
      return undefined;
    });
  }

  /**
   * Close the drawer
   */
  close(): void {
    this.isOpen.set(false);
    this.openChange.emit(false);
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(): void {
    if (this.closeOnBackdropClick) {
      this.close();
    }
  }
}
