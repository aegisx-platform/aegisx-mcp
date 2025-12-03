import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

export type IconButtonSize = 'sm' | 'md' | 'lg';

/**
 * Navbar Icon Button
 *
 * Icon button for navbar actions with optional badge and tooltip.
 *
 * @example
 * // Simple icon button
 * <ax-navbar-icon-button icon="search" (click)="openSearch()"></ax-navbar-icon-button>
 *
 * @example
 * // With badge
 * <ax-navbar-icon-button icon="notifications" [badge]="3" tooltip="Notifications"></ax-navbar-icon-button>
 *
 * @example
 * // Different sizes
 * <ax-navbar-icon-button icon="settings" size="lg"></ax-navbar-icon-button>
 */
@Component({
  selector: 'ax-navbar-icon-button',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  template: `
    <button
      mat-icon-button
      class="ax-navbar-icon-button"
      [class.ax-navbar-icon-button--sm]="size === 'sm'"
      [class.ax-navbar-icon-button--lg]="size === 'lg'"
      [disabled]="disabled"
      [matTooltip]="tooltip"
      [matTooltipPosition]="tooltipPosition"
      [attr.aria-label]="ariaLabel || tooltip || icon"
      (click)="onClick($event)"
    >
      <mat-icon
        [matBadge]="badge"
        [matBadgeHidden]="!badge"
        [matBadgeColor]="badgeColor"
        matBadgeSize="small"
        [matBadgeOverlap]="true"
      >
        {{ icon }}
      </mat-icon>
    </button>
  `,
  styles: [
    `
      .ax-navbar-icon-button {
        color: var(--ax-navbar-text-color, var(--ax-text-secondary));
        transition: color var(--ax-duration-fast, 150ms);
      }

      .ax-navbar-icon-button:hover:not(:disabled) {
        color: var(--ax-navbar-text-color, var(--ax-text-primary));
        opacity: 0.8;
      }

      .ax-navbar-icon-button--sm {
        width: 32px;
        height: 32px;
      }

      .ax-navbar-icon-button--sm .mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .ax-navbar-icon-button--lg {
        width: 48px;
        height: 48px;
      }

      .ax-navbar-icon-button--lg .mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      ::ng-deep .mat-badge-content {
        font-size: 10px;
        font-weight: 600;
      }
    `,
  ],
})
export class AxNavbarIconButtonComponent {
  /** Material icon name */
  @Input() icon!: string;

  /** Badge value (number or string) */
  @Input() badge?: number | string;

  /** Badge color */
  @Input() badgeColor: 'primary' | 'accent' | 'warn' = 'warn';

  /** Tooltip text */
  @Input() tooltip?: string;

  /** Tooltip position */
  @Input() tooltipPosition: 'above' | 'below' | 'left' | 'right' = 'below';

  /** Button size */
  @Input() size: IconButtonSize = 'md';

  /** Disabled state */
  @Input() disabled = false;

  /** ARIA label */
  @Input() ariaLabel?: string;

  /** Click event */
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.buttonClick.emit(event);
  }
}
