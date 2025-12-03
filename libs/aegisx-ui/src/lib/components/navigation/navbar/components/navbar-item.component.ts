import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';

export interface NavbarMenuItem {
  label: string;
  icon?: string;
  svgIcon?: string;
  routerLink?: string | string[];
  href?: string;
  disabled?: boolean;
  divider?: boolean;
  children?: NavbarMenuItem[];
}

/**
 * Navbar Navigation Item
 *
 * Individual navigation item with support for:
 * - Simple links (routerLink/href)
 * - Dropdown menus
 * - Icons
 * - Active state indication
 *
 * @example
 * // Simple link
 * <ax-nav-item label="Home" routerLink="/"></ax-nav-item>
 *
 * @example
 * // With dropdown menu
 * <ax-nav-item label="Products" [menu]="[
 *   { label: 'Software', routerLink: '/products/software' },
 *   { label: 'Hardware', routerLink: '/products/hardware' }
 * ]"></ax-nav-item>
 *
 * @example
 * // With icon
 * <ax-nav-item label="Settings" icon="settings" routerLink="/settings"></ax-nav-item>
 */
@Component({
  selector: 'ax-nav-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule,
    MatDividerModule,
  ],
  template: `
    <li class="ax-nav-item">
      <!-- Simple link (no menu) -->
      <a
        *ngIf="!menu?.length; else menuTrigger"
        class="ax-nav-item__link"
        [class.ax-nav-item__link--active]="isActive"
        [class.ax-nav-item__link--disabled]="disabled"
        [routerLink]="routerLink"
        [routerLinkActive]="routerLinkActiveClass"
        [routerLinkActiveOptions]="routerLinkActiveOptions"
        [attr.href]="!routerLink ? href : null"
        [attr.target]="target"
        [attr.aria-current]="isActive ? 'page' : null"
        matRipple
        [matRippleDisabled]="disabled"
        (click)="onClick($event)"
      >
        <mat-icon *ngIf="icon && !svgIcon" class="ax-nav-item__icon">{{
          icon
        }}</mat-icon>
        <mat-icon
          *ngIf="svgIcon"
          class="ax-nav-item__icon"
          [svgIcon]="svgIcon"
        ></mat-icon>
        <span class="ax-nav-item__label">{{ label }}</span>
        <mat-icon *ngIf="badge" class="ax-nav-item__badge">{{
          badge
        }}</mat-icon>
      </a>

      <!-- Menu trigger -->
      <ng-template #menuTrigger>
        <button
          class="ax-nav-item__link ax-nav-item__link--menu"
          [class.ax-nav-item__link--active]="isActive"
          [class.ax-nav-item__link--disabled]="disabled"
          [matMenuTriggerFor]="dropdownMenu"
          [disabled]="disabled"
          matRipple
        >
          <mat-icon *ngIf="icon && !svgIcon" class="ax-nav-item__icon">{{
            icon
          }}</mat-icon>
          <mat-icon
            *ngIf="svgIcon"
            class="ax-nav-item__icon"
            [svgIcon]="svgIcon"
          ></mat-icon>
          <span class="ax-nav-item__label">{{ label }}</span>
          <mat-icon class="ax-nav-item__chevron">expand_more</mat-icon>
        </button>

        <mat-menu #dropdownMenu="matMenu" class="ax-nav-item__menu">
          <ng-container *ngFor="let item of menu">
            <mat-divider *ngIf="item.divider"></mat-divider>
            <a
              *ngIf="!item.divider"
              mat-menu-item
              [routerLink]="item.routerLink"
              [attr.href]="!item.routerLink ? item.href : null"
              [disabled]="item.disabled"
            >
              <mat-icon *ngIf="item.icon && !item.svgIcon">{{
                item.icon
              }}</mat-icon>
              <mat-icon
                *ngIf="item.svgIcon"
                [svgIcon]="item.svgIcon"
              ></mat-icon>
              <span>{{ item.label }}</span>
            </a>
          </ng-container>
        </mat-menu>
      </ng-template>
    </li>
  `,
  styles: [
    `
      .ax-nav-item {
        display: flex;
      }

      .ax-nav-item__link {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-xs, 0.25rem);
        padding: var(--ax-spacing-sm, 0.5rem) var(--ax-spacing-md, 0.75rem);
        border-radius: var(--ax-radius-md, 0.5rem);
        text-decoration: none;
        color: var(--ax-navbar-text-muted, var(--ax-text-secondary));
        font-size: var(--ax-text-sm, 0.875rem);
        font-weight: 500;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all var(--ax-duration-fast, 150ms);
        white-space: nowrap;
      }

      .ax-nav-item__link:hover:not(.ax-nav-item__link--disabled) {
        background-color: var(
          --ax-navbar-hover-bg,
          var(--ax-background-subtle)
        );
        color: var(--ax-navbar-text-color, var(--ax-text-primary));
      }

      .ax-nav-item__link--active {
        background-color: var(--ax-navbar-active-bg, var(--ax-primary-faint));
        color: var(--ax-navbar-active-color, var(--ax-primary));
      }

      .ax-nav-item__link--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ax-nav-item__link--menu {
        font-family: inherit;
      }

      .ax-nav-item__icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .ax-nav-item__label {
        line-height: 1.2;
      }

      .ax-nav-item__chevron {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-left: var(--ax-spacing-xs, 0.25rem);
        transition: transform var(--ax-duration-fast, 150ms);
      }

      .ax-nav-item__link--menu[aria-expanded='true'] .ax-nav-item__chevron {
        transform: rotate(180deg);
      }

      .ax-nav-item__badge {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: var(--ax-primary);
      }

      /* Vertical mode (mobile) */
      :host-context(.ax-navbar-nav--vertical) .ax-nav-item {
        width: 100%;
      }

      :host-context(.ax-navbar-nav--vertical) .ax-nav-item__link {
        width: 100%;
        justify-content: flex-start;
        padding: var(--ax-spacing-md, 0.75rem);
      }
    `,
  ],
})
export class AxNavItemComponent {
  private readonly elementRef = inject(ElementRef);

  /** Display label */
  @Input() label!: string;

  /** Material icon name */
  @Input() icon?: string;

  /** SVG icon name (registered via MatIconRegistry) */
  @Input() svgIcon?: string;

  /** Badge icon (e.g., for "new" indicator) */
  @Input() badge?: string;

  /** RouterLink for navigation */
  @Input() routerLink?: string | string[];

  /** External href (if not using routerLink) */
  @Input() href?: string;

  /** Link target */
  @Input() target?: string;

  /** Disabled state */
  @Input() disabled = false;

  /** Active state (manual override) */
  @Input() isActive = false;

  /** RouterLinkActive class */
  @Input() routerLinkActiveClass = 'ax-nav-item__link--active';

  /** RouterLinkActive options */
  @Input() routerLinkActiveOptions: { exact: boolean } = { exact: false };

  /** Dropdown menu items */
  @Input() menu?: NavbarMenuItem[];

  /** Click event */
  @Output() itemClick = new EventEmitter<MouseEvent>();

  @HostBinding('class.ax-nav-item-host') hostClass = true;

  onClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.itemClick.emit(event);
  }
}
