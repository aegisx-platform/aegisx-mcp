import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

/**
 * Navbar Brand Component
 *
 * Displays the application logo and name in the navbar.
 * Supports image logos, Material icons, custom SVG icons, or text.
 *
 * @example
 * // With image/SVG logo file
 * <ax-navbar-brand logo="assets/logo.svg" name="AegisX"></ax-navbar-brand>
 *
 * @example
 * // With Material icon
 * <ax-navbar-brand icon="business" name="Enterprise"></ax-navbar-brand>
 *
 * @example
 * // With custom SVG icon (registered via MatIconRegistry)
 * <ax-navbar-brand svgIcon="custom-logo" name="Custom Brand"></ax-navbar-brand>
 *
 * @example
 * // Text only
 * <ax-navbar-brand name="AegisX" [showLogo]="false"></ax-navbar-brand>
 *
 * @example
 * // With custom template
 * <ax-navbar-brand>
 *   <ng-template axBrandTemplate>
 *     <custom-logo></custom-logo>
 *   </ng-template>
 * </ax-navbar-brand>
 */
@Component({
  selector: 'ax-navbar-brand',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <a
      class="ax-navbar-brand"
      [routerLink]="routerLink"
      [class.ax-navbar-brand--clickable]="routerLink || href"
      [attr.href]="!routerLink ? href : null"
      (click)="onClick($event)"
    >
      <!-- Logo/Icon -->
      <ng-container *ngIf="showLogo">
        <!-- Image/SVG file -->
        <img
          *ngIf="logo"
          class="ax-navbar-brand__logo"
          [src]="logo"
          [alt]="logoAlt || name"
          [style.height]="logoHeight"
        />
        <!-- Material icon -->
        <mat-icon
          *ngIf="!logo && icon && !svgIcon"
          class="ax-navbar-brand__mat-icon"
          >{{ icon }}</mat-icon
        >
        <!-- Custom SVG icon -->
        <mat-icon
          *ngIf="!logo && svgIcon"
          class="ax-navbar-brand__mat-icon"
          [svgIcon]="svgIcon"
        ></mat-icon>
        <!-- Text icon (legacy) -->
        <span
          *ngIf="!logo && !icon && !svgIcon && logoIcon"
          class="ax-navbar-brand__icon"
        >
          {{ logoIcon }}
        </span>
      </ng-container>

      <!-- Name -->
      <span *ngIf="name && showName" class="ax-navbar-brand__name">
        {{ name }}
      </span>

      <!-- Custom content -->
      <ng-content></ng-content>
    </a>
  `,
  styles: [
    `
      .ax-navbar-brand {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        text-decoration: none;
        color: inherit;
        font-weight: 600;
        font-size: var(--ax-text-lg, 1.125rem);
        transition: opacity var(--ax-duration-fast, 150ms);
      }

      .ax-navbar-brand--clickable {
        cursor: pointer;
      }

      .ax-navbar-brand--clickable:hover {
        opacity: 0.8;
      }

      .ax-navbar-brand__logo {
        height: 32px;
        width: auto;
        object-fit: contain;
      }

      .ax-navbar-brand__icon {
        font-size: 28px;
        line-height: 1;
      }

      .ax-navbar-brand__mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: var(--ax-navbar-text-color, var(--ax-text-heading));
      }

      .ax-navbar-brand__name {
        color: var(--ax-navbar-text-color, var(--ax-text-heading));
        white-space: nowrap;
      }

      @media (max-width: 640px) {
        .ax-navbar-brand__name {
          display: none;
        }
      }
    `,
  ],
})
export class AxNavbarBrandComponent {
  /** Logo image URL (path to SVG/image file) */
  @Input() logo?: string;

  /** Material icon name (e.g., 'business', 'dashboard') */
  @Input() icon?: string;

  /** Custom SVG icon name (registered via MatIconRegistry) */
  @Input() svgIcon?: string;

  /** Text icon (legacy - use icon or svgIcon instead) */
  @Input() logoIcon?: string;

  /** Alt text for logo image */
  @Input() logoAlt?: string;

  /** Logo height (CSS value) */
  @Input() logoHeight = '32px';

  /** Application/Brand name */
  @Input() name?: string;

  /** Show logo */
  @Input() showLogo = true;

  /** Show name */
  @Input() showName = true;

  /** RouterLink for navigation */
  @Input() routerLink?: string | string[];

  /** External href (if not using routerLink) */
  @Input() href?: string;

  /** Click event */
  @Output() brandClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.brandClick.emit(event);
  }
}
