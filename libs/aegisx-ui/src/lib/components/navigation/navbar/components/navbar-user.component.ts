import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

export interface NavbarUser {
  name: string;
  email?: string;
  avatar?: string;
  initials?: string;
  role?: string;
}

export interface NavbarUserMenuItem {
  label: string;
  icon?: string;
  action?: string;
  routerLink?: string | string[];
  href?: string;
  divider?: boolean;
  disabled?: boolean;
  danger?: boolean;
}

/**
 * Navbar User Component
 *
 * User profile dropdown for navbar with avatar, name, and menu actions.
 * Commonly used for profile, settings, and logout actions.
 *
 * @example
 * <ax-navbar-user
 *   [user]="{ name: 'John Doe', email: 'john@example.com', avatar: 'path/to/avatar.jpg' }"
 *   [menuItems]="[
 *     { label: 'Profile', icon: 'person', action: 'profile' },
 *     { label: 'Settings', icon: 'settings', action: 'settings' },
 *     { divider: true },
 *     { label: 'Logout', icon: 'logout', action: 'logout', danger: true }
 *   ]"
 *   (menuAction)="handleMenuAction($event)"
 * ></ax-navbar-user>
 */
@Component({
  selector: 'ax-navbar-user',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <div class="ax-navbar-user">
      <button
        class="ax-navbar-user__trigger"
        [matMenuTriggerFor]="userMenu"
        aria-label="User menu"
      >
        <!-- Avatar -->
        <div class="ax-navbar-user__avatar">
          <img
            *ngIf="user?.avatar"
            [src]="user?.avatar"
            [alt]="user?.name"
            class="ax-navbar-user__avatar-img"
          />
          <span *ngIf="!user?.avatar" class="ax-navbar-user__avatar-initials">
            {{ user?.initials || getInitials(user?.name || '') }}
          </span>
        </div>

        <!-- User info (optional) -->
        <div *ngIf="showInfo" class="ax-navbar-user__info">
          <span class="ax-navbar-user__name">{{ user?.name }}</span>
          <span *ngIf="user?.role" class="ax-navbar-user__role">{{
            user?.role
          }}</span>
        </div>

        <!-- Chevron -->
        <mat-icon class="ax-navbar-user__chevron" *ngIf="showChevron"
          >expand_more</mat-icon
        >
      </button>

      <!-- User Menu -->
      <mat-menu #userMenu="matMenu" class="ax-navbar-user__menu">
        <!-- User header in menu -->
        <div class="ax-navbar-user__menu-header" *ngIf="showMenuHeader && user">
          <div class="ax-navbar-user__menu-avatar">
            <img *ngIf="user.avatar" [src]="user.avatar" [alt]="user.name" />
            <span *ngIf="!user.avatar">
              {{ user.initials || getInitials(user.name || '') }}
            </span>
          </div>
          <div class="ax-navbar-user__menu-info">
            <span class="ax-navbar-user__menu-name">{{ user.name }}</span>
            <span class="ax-navbar-user__menu-email">{{ user.email }}</span>
          </div>
        </div>

        <mat-divider *ngIf="showMenuHeader"></mat-divider>

        <!-- Menu Items -->
        <ng-container *ngFor="let item of menuItems">
          <mat-divider *ngIf="item.divider"></mat-divider>
          <button
            *ngIf="!item.divider"
            mat-menu-item
            [class.ax-navbar-user__menu-item--danger]="item.danger"
            [disabled]="item.disabled"
            (click)="onMenuItemClick(item)"
          >
            <mat-icon *ngIf="item.icon">{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </button>
        </ng-container>
      </mat-menu>
    </div>
  `,
  styles: [
    `
      .ax-navbar-user__trigger {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        padding: var(--ax-spacing-xs, 0.25rem);
        padding-right: var(--ax-spacing-sm, 0.5rem);
        border: none;
        background: transparent;
        border-radius: var(--ax-radius-full, 9999px);
        cursor: pointer;
        transition: background-color var(--ax-duration-fast, 150ms);

        &:hover {
          background-color: var(--ax-background-subtle);
        }
      }

      .ax-navbar-user__avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        overflow: hidden;
        background-color: var(--ax-primary);
        color: var(--ax-primary-inverted);
        font-weight: 600;
        font-size: var(--ax-text-sm, 0.875rem);
      }

      .ax-navbar-user__avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .ax-navbar-user__avatar-initials {
        text-transform: uppercase;
      }

      .ax-navbar-user__info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;

        @media (max-width: 768px) {
          display: none;
        }
      }

      .ax-navbar-user__name {
        font-size: var(--ax-text-sm, 0.875rem);
        font-weight: 500;
        color: var(--ax-navbar-text-color, var(--ax-text-primary));
        line-height: 1.2;
      }

      .ax-navbar-user__role {
        font-size: var(--ax-text-xs, 0.75rem);
        color: var(--ax-navbar-text-muted, var(--ax-text-secondary));
        line-height: 1.2;
      }

      .ax-navbar-user__chevron {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--ax-navbar-text-muted, var(--ax-text-secondary));
        transition: transform var(--ax-duration-fast, 150ms);
      }

      .ax-navbar-user__trigger[aria-expanded='true'] {
        .ax-navbar-user__chevron {
          transform: rotate(180deg);
        }
      }

      // Menu styles
      .ax-navbar-user__menu-header {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm, 0.5rem);
        padding: var(--ax-spacing-md, 0.75rem) var(--ax-spacing-lg, 1rem);
      }

      .ax-navbar-user__menu-avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        background-color: var(--ax-primary);
        color: var(--ax-primary-inverted);
        font-weight: 600;
        font-size: var(--ax-text-sm, 0.875rem);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        span {
          text-transform: uppercase;
        }
      }

      .ax-navbar-user__menu-info {
        display: flex;
        flex-direction: column;
      }

      .ax-navbar-user__menu-name {
        font-size: var(--ax-text-sm, 0.875rem);
        font-weight: 600;
        color: var(--ax-text-primary);
      }

      .ax-navbar-user__menu-email {
        font-size: var(--ax-text-xs, 0.75rem);
        color: var(--ax-text-secondary);
      }

      .ax-navbar-user__menu-item--danger {
        color: var(--ax-error) !important;

        .mat-icon {
          color: var(--ax-error);
        }
      }
    `,
  ],
})
export class AxNavbarUserComponent {
  /** User data */
  @Input() user?: NavbarUser;

  /** Menu items */
  @Input() menuItems: NavbarUserMenuItem[] = [];

  /** Show user info next to avatar */
  @Input() showInfo = false;

  /** Show chevron indicator */
  @Input() showChevron = true;

  /** Show user header in menu */
  @Input() showMenuHeader = true;

  /** Menu item action event */
  @Output() menuAction = new EventEmitter<string>();

  /** Menu item click event (with full item data) */
  @Output() menuItemClick = new EventEmitter<NavbarUserMenuItem>();

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  onMenuItemClick(item: NavbarUserMenuItem): void {
    if (item.action) {
      this.menuAction.emit(item.action);
    }
    this.menuItemClick.emit(item);
  }
}
