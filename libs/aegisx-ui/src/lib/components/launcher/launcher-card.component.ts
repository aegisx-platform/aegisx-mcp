import { Component, computed, input, output } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import {
  LauncherApp,
  LauncherMenuAction,
  LauncherAppClickEvent,
  LauncherMenuActionEvent,
  LauncherCardSize,
} from './launcher.types';

@Component({
  selector: 'ax-launcher-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    TitleCasePipe,
  ],
  template: `
    <div
      class="launcher-card"
      [class]="cardClasses()"
      [class.launcher-card--disabled]="isDisabled()"
      [class.launcher-card--maintenance]="app().status === 'maintenance'"
      [class.launcher-card--coming-soon]="app().status === 'coming_soon'"
      (click)="onCardClick()"
      (keydown.enter)="onCardClick()"
      [attr.tabindex]="isClickable() ? 0 : -1"
      [attr.role]="isClickable() ? 'button' : 'article'"
      [attr.aria-disabled]="!isClickable()"
    >
      <!-- Header: Icon + Actions -->
      <div class="launcher-card__header">
        <div class="launcher-card__icon-wrapper">
          <div class="launcher-card__icon">
            <mat-icon>{{ app().icon }}</mat-icon>
          </div>
          @if ((app().notificationCount ?? 0) > 0) {
            <span class="launcher-card__badge">{{ displayBadgeCount() }}</span>
          }
        </div>

        <!-- Quick Actions (Pin, Favorite, Menu) -->
        <div
          class="launcher-card__quick-actions"
          [class.launcher-card__quick-actions--visible]="
            isPinned() || isFavorite()
          "
        >
          <!-- Pin Button -->
          <button
            mat-icon-button
            class="launcher-card__action-btn"
            [class.launcher-card__action-btn--active]="isPinned()"
            (click)="onPinClick($event)"
            [matTooltip]="isPinned() ? 'Unpin' : 'Pin to top'"
          >
            <mat-icon>{{ isPinned() ? 'push_pin' : 'push_pin' }}</mat-icon>
          </button>

          <!-- Favorite Button -->
          <button
            mat-icon-button
            class="launcher-card__action-btn"
            [class.launcher-card__action-btn--active]="isFavorite()"
            (click)="onFavoriteClick($event)"
            [matTooltip]="
              isFavorite() ? 'Remove from favorites' : 'Add to favorites'
            "
          >
            <mat-icon>{{ isFavorite() ? 'star' : 'star_border' }}</mat-icon>
          </button>

          <!-- Menu Button -->
          @if (menuActions().length > 0 && !isDisabled()) {
            <button
              mat-icon-button
              class="launcher-card__action-btn launcher-card__menu-btn"
              [matMenuTriggerFor]="menu"
              (click)="$event.stopPropagation()"
              matTooltip="More actions"
            >
              <mat-icon>more_horiz</mat-icon>
            </button>

            <mat-menu #menu="matMenu">
              @for (action of menuActions(); track action.id) {
                @if (action.divider) {
                  <mat-divider></mat-divider>
                }
                <button
                  mat-menu-item
                  [disabled]="action.disabled"
                  (click)="onMenuAction(action)"
                >
                  @if (action.icon) {
                    <mat-icon>{{ action.icon }}</mat-icon>
                  }
                  <span>{{ action.label }}</span>
                </button>
              }
            </mat-menu>
          }
        </div>
      </div>

      <!-- Pinned Indicator -->
      @if (isPinned()) {
        <span class="launcher-card__pinned-indicator" matTooltip="Pinned">
          <mat-icon>push_pin</mat-icon>
        </span>
      }

      <!-- Content -->
      <div class="launcher-card__content">
        <h3 class="launcher-card__name">{{ app().name }}</h3>
        @if (app().description) {
          <p class="launcher-card__description">{{ app().description }}</p>
        }
        @if (app().lastEdited) {
          <p class="launcher-card__meta">{{ app().lastEdited }}</p>
        }
      </div>

      <!-- Status Badge -->
      @if (statusBadge()) {
        <span
          class="launcher-card__status launcher-card__status--{{
            app().status
          }}"
        >
          {{ statusBadge() }}
        </span>
      }

      <!-- Disabled/Maintenance Overlay -->
      @if (showOverlay()) {
        <div class="launcher-card__overlay">
          <mat-icon>{{ overlayIcon() }}</mat-icon>
          <span>{{ overlayText() }}</span>
        </div>
      }

      <!-- Admin Badge (shows disabled status to admin) -->
      @if (showAdminBadge()) {
        <span class="launcher-card__admin-badge">
          <mat-icon>visibility_off</mat-icon>
          Disabled
        </span>
      }
    </div>
  `,
  styles: `
    .launcher-card {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
      border-radius: var(--ax-radius-xl, 16px);
      min-height: 160px;
      cursor: pointer;
      transition: all 0.2s ease;
      overflow: hidden;

      &:hover:not(.launcher-card--disabled):not(
          .launcher-card--maintenance
        ):not(.launcher-card--coming-soon) {
        transform: translateY(-4px);
        box-shadow: var(--ax-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
      }

      &:focus-visible {
        outline: 2px solid var(--ax-brand-default, #6366f1);
        outline-offset: 2px;
      }

      &--disabled,
      &--maintenance,
      &--coming-soon {
        cursor: not-allowed;
        opacity: 0.7;

        &:hover {
          transform: none;
        }
      }
    }

    /* Pastel Color Variants with subtle border and shadow */
    .launcher-card--pink {
      background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
      border: 1px solid rgba(236, 72, 153, 0.15);
      box-shadow:
        0 1px 3px 0 rgba(236, 72, 153, 0.08),
        0 1px 2px -1px rgba(0, 0, 0, 0.05);
      .launcher-card__icon {
        background: #fbcfe8;
        color: #be185d;
      }
    }

    .launcher-card--peach {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      border: 1px solid rgba(249, 115, 22, 0.15);
      box-shadow:
        0 1px 3px 0 rgba(249, 115, 22, 0.08),
        0 1px 2px -1px rgba(0, 0, 0, 0.05);
      .launcher-card__icon {
        background: #fed7aa;
        color: #c2410c;
      }
    }

    .launcher-card--mint {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid rgba(34, 197, 94, 0.15);
      box-shadow:
        0 1px 3px 0 rgba(34, 197, 94, 0.08),
        0 1px 2px -1px rgba(0, 0, 0, 0.05);
      .launcher-card__icon {
        background: #bbf7d0;
        color: #15803d;
      }
    }

    .launcher-card--blue {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid rgba(59, 130, 246, 0.15);
      box-shadow:
        0 1px 3px 0 rgba(59, 130, 246, 0.08),
        0 1px 2px -1px rgba(0, 0, 0, 0.05);
      .launcher-card__icon {
        background: #bfdbfe;
        color: #1d4ed8;
      }
    }

    .launcher-card--yellow {
      background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
      border: 1px solid rgba(234, 179, 8, 0.15);
      box-shadow:
        0 1px 3px 0 rgba(234, 179, 8, 0.08),
        0 1px 2px -1px rgba(0, 0, 0, 0.05);
      .launcher-card__icon {
        background: #fef08a;
        color: #a16207;
      }
    }

    .launcher-card--lavender {
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border: 1px solid rgba(168, 85, 247, 0.15);
      box-shadow:
        0 1px 3px 0 rgba(168, 85, 247, 0.08),
        0 1px 2px -1px rgba(0, 0, 0, 0.05);
      .launcher-card__icon {
        background: #e9d5ff;
        color: #7e22ce;
      }
    }

    .launcher-card--cyan {
      background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%);
      border: 1px solid rgba(6, 182, 212, 0.15);
      box-shadow:
        0 1px 3px 0 rgba(6, 182, 212, 0.08),
        0 1px 2px -1px rgba(0, 0, 0, 0.05);
      .launcher-card__icon {
        background: #a5f3fc;
        color: #0e7490;
      }
    }

    .launcher-card--rose {
      background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
      border: 1px solid rgba(244, 63, 94, 0.15);
      box-shadow:
        0 1px 3px 0 rgba(244, 63, 94, 0.08),
        0 1px 2px -1px rgba(0, 0, 0, 0.05);
      .launcher-card__icon {
        background: #fecdd3;
        color: #be123c;
      }
    }

    .launcher-card--neutral {
      background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%);
      border: 1px solid rgba(113, 113, 122, 0.15);
      box-shadow:
        0 1px 3px 0 rgba(0, 0, 0, 0.06),
        0 1px 2px -1px rgba(0, 0, 0, 0.05);
      .launcher-card__icon {
        background: #e4e4e7;
        color: #3f3f46;
      }
    }

    /* White Card with Border Shadow (supports dark mode) */
    .launcher-card--white {
      background: var(--ax-bg, #ffffff);
      border: 1px solid var(--ax-border, #e5e7eb);
      box-shadow:
        0 1px 3px 0 rgba(0, 0, 0, 0.1),
        0 1px 2px -1px rgba(0, 0, 0, 0.1);
      .launcher-card__icon {
        background: var(--ax-background-subtle, #f3f4f6);
        color: var(--ax-text-heading, #111827);
      }
    }

    :host-context(.dark) .launcher-card--white,
    .dark .launcher-card--white {
      background: var(--ax-bg, #1f2937);
      border-color: var(--ax-border, #374151);
      box-shadow:
        0 1px 3px 0 rgba(0, 0, 0, 0.3),
        0 1px 2px -1px rgba(0, 0, 0, 0.3);
      .launcher-card__icon {
        background: var(--ax-background-subtle, #111827);
        color: var(--ax-text-heading, #f9fafb);
      }
    }

    /* Dark Mode for Pastel Colors */
    :host-context(.dark),
    .dark {
      .launcher-card--pink {
        background: linear-gradient(135deg, #831843 0%, #9d174d 100%);
        border-color: rgba(236, 72, 153, 0.3);
        .launcher-card__icon {
          background: rgba(251, 207, 232, 0.15);
          color: #f9a8d4;
        }
        .launcher-card__name {
          color: #fdf2f8;
        }
        .launcher-card__description {
          color: #f9a8d4;
        }
      }

      .launcher-card--peach {
        background: linear-gradient(135deg, #7c2d12 0%, #9a3412 100%);
        border-color: rgba(249, 115, 22, 0.3);
        .launcher-card__icon {
          background: rgba(254, 215, 170, 0.15);
          color: #fdba74;
        }
        .launcher-card__name {
          color: #fff7ed;
        }
        .launcher-card__description {
          color: #fdba74;
        }
      }

      .launcher-card--mint {
        background: linear-gradient(135deg, #14532d 0%, #166534 100%);
        border-color: rgba(34, 197, 94, 0.3);
        .launcher-card__icon {
          background: rgba(187, 247, 208, 0.15);
          color: #86efac;
        }
        .launcher-card__name {
          color: #f0fdf4;
        }
        .launcher-card__description {
          color: #86efac;
        }
      }

      .launcher-card--blue {
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
        border-color: rgba(59, 130, 246, 0.3);
        .launcher-card__icon {
          background: rgba(191, 219, 254, 0.15);
          color: #93c5fd;
        }
        .launcher-card__name {
          color: #eff6ff;
        }
        .launcher-card__description {
          color: #93c5fd;
        }
      }

      .launcher-card--yellow {
        background: linear-gradient(135deg, #713f12 0%, #854d0e 100%);
        border-color: rgba(234, 179, 8, 0.3);
        .launcher-card__icon {
          background: rgba(254, 240, 138, 0.15);
          color: #fde047;
        }
        .launcher-card__name {
          color: #fefce8;
        }
        .launcher-card__description {
          color: #fde047;
        }
      }

      .launcher-card--lavender {
        background: linear-gradient(135deg, #581c87 0%, #6b21a8 100%);
        border-color: rgba(168, 85, 247, 0.3);
        .launcher-card__icon {
          background: rgba(233, 213, 255, 0.15);
          color: #d8b4fe;
        }
        .launcher-card__name {
          color: #faf5ff;
        }
        .launcher-card__description {
          color: #d8b4fe;
        }
      }

      .launcher-card--cyan {
        background: linear-gradient(135deg, #164e63 0%, #155e75 100%);
        border-color: rgba(6, 182, 212, 0.3);
        .launcher-card__icon {
          background: rgba(165, 243, 252, 0.15);
          color: #67e8f9;
        }
        .launcher-card__name {
          color: #ecfeff;
        }
        .launcher-card__description {
          color: #67e8f9;
        }
      }

      .launcher-card--rose {
        background: linear-gradient(135deg, #881337 0%, #9f1239 100%);
        border-color: rgba(244, 63, 94, 0.3);
        .launcher-card__icon {
          background: rgba(254, 205, 211, 0.15);
          color: #fda4af;
        }
        .launcher-card__name {
          color: #fff1f2;
        }
        .launcher-card__description {
          color: #fda4af;
        }
      }

      .launcher-card--neutral {
        background: linear-gradient(135deg, #27272a 0%, #3f3f46 100%);
        border-color: rgba(113, 113, 122, 0.3);
        .launcher-card__icon {
          background: rgba(228, 228, 231, 0.15);
          color: #a1a1aa;
        }
        .launcher-card__name {
          color: #fafafa;
        }
        .launcher-card__description {
          color: #a1a1aa;
        }
      }

      /* Dark mode overlay */
      .launcher-card__overlay {
        background: rgba(0, 0, 0, 0.8);
        mat-icon {
          color: #9ca3af;
        }
        span {
          color: #d1d5db;
        }
      }

      /* Dark mode text defaults */
      .launcher-card__name {
        color: #f9fafb;
      }
      .launcher-card__description {
        color: #d1d5db;
      }
      .launcher-card__meta {
        color: #9ca3af;
      }
    }

    /* Header */
    .launcher-card__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    /* Icon wrapper */
    .launcher-card__icon-wrapper {
      position: relative;
    }

    .launcher-card__icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    /* Notification Badge */
    .launcher-card__badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: 600;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Quick Actions Container */
    .launcher-card__quick-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.15s ease;

      &--visible {
        opacity: 1;
      }
    }

    .launcher-card:hover .launcher-card__quick-actions {
      opacity: 1;
    }

    /* Action Button Base */
    .launcher-card__action-btn {
      width: 28px;
      height: 28px;
      opacity: 0.6;
      transition: all 0.15s ease;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.05);
      }

      &--active {
        opacity: 1;
        color: var(--ax-brand-default, #6366f1);

        mat-icon {
          color: inherit;
        }
      }
    }

    /* Pinned Indicator */
    .launcher-card__pinned-indicator {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: var(--ax-brand-default, #6366f1);
      color: white;
      border-radius: 50%;
      transform: rotate(45deg);

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    /* Menu Button */
    .launcher-card__menu-btn {
      opacity: 0.6;

      &:hover {
        opacity: 1;
      }
    }

    /* Content */
    .launcher-card__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .launcher-card__name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--ax-text-heading, #111827);
      margin: 0 0 0.25rem;
      line-height: 1.4;
    }

    .launcher-card__description {
      font-size: 0.8125rem;
      color: var(--ax-text-secondary, #4b5563);
      margin: 0 0 0.25rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .launcher-card__meta {
      font-size: 0.75rem;
      color: var(--ax-text-muted, #6b7280);
      margin: 0;
    }

    /* Status Badge */
    .launcher-card__status {
      position: absolute;
      top: 1rem;
      right: 3rem;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .launcher-card__status--beta {
      background: #fef3c7;
      color: #92400e;
    }

    .launcher-card__status--new {
      background: #dbeafe;
      color: #1e40af;
    }

    .launcher-card__status--maintenance {
      background: #fee2e2;
      color: #991b1b;
    }

    .launcher-card__status--coming_soon {
      background: #e0e7ff;
      color: #3730a3;
    }

    /* Overlay for disabled/maintenance states */
    .launcher-card__overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border-radius: var(--ax-radius-xl, 16px);

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--ax-text-muted);
      }

      span {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ax-text-secondary);
      }
    }

    /* Admin Badge */
    .launcher-card__admin-badge {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
      color: #dc2626;

      mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
      }
    }

    /* Size Variants for Bento Grid */
    .launcher-card--size-sm {
      min-height: 140px;
      padding: 1rem;

      .launcher-card__icon {
        width: 40px;
        height: 40px;
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .launcher-card__name {
        font-size: 0.9375rem;
      }

      .launcher-card__description {
        font-size: 0.75rem;
        -webkit-line-clamp: 1;
      }
    }

    .launcher-card--size-md {
      /* Default size - uses base styles */
    }

    .launcher-card--size-lg {
      min-height: 200px;
      padding: 1.5rem;

      .launcher-card__icon {
        width: 56px;
        height: 56px;
        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
      }

      .launcher-card__name {
        font-size: 1.125rem;
      }

      .launcher-card__description {
        font-size: 0.875rem;
        -webkit-line-clamp: 3;
      }
    }

    .launcher-card--size-xl {
      min-height: 260px;
      padding: 1.75rem;

      .launcher-card__icon {
        width: 64px;
        height: 64px;
        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }

      .launcher-card__name {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
      }

      .launcher-card__description {
        font-size: 0.9375rem;
        -webkit-line-clamp: 4;
      }

      .launcher-card__meta {
        font-size: 0.8125rem;
        margin-top: 0.5rem;
      }
    }
  `,
})
export class AxLauncherCardComponent {
  // Inputs
  app = input.required<LauncherApp>();
  isAdmin = input<boolean>(false);
  isFavorite = input<boolean>(false);
  /** Whether app is pinned */
  isPinned = input<boolean>(false);
  /** Card size for bento grid layout */
  size = input<LauncherCardSize>('md');

  // Outputs
  cardClick = output<LauncherAppClickEvent>();
  menuAction = output<LauncherMenuActionEvent>();
  favoriteToggle = output<LauncherApp>();
  pinToggle = output<LauncherApp>();

  // Computed properties
  cardClasses = computed(() => {
    const colorClass = `launcher-card--${this.app().color}`;
    const sizeClass = `launcher-card--size-${this.size()}`;
    return `${colorClass} ${sizeClass}`;
  });

  displayBadgeCount = computed(() => {
    const count = this.app().notificationCount || 0;
    return count > 99 ? '99+' : count.toString();
  });

  isDisabled = computed(() => {
    const status = this.app().status;
    return !this.app().enabled || status === 'disabled' || status === 'hidden';
  });

  isClickable = computed(() => {
    const status = this.app().status;
    return (
      this.app().enabled &&
      status !== 'disabled' &&
      status !== 'hidden' &&
      status !== 'maintenance' &&
      status !== 'coming_soon'
    );
  });

  statusBadge = computed(() => {
    const status = this.app().status;
    switch (status) {
      case 'beta':
        return 'Beta';
      case 'new':
        return 'New';
      case 'maintenance':
        return 'Maintenance';
      case 'coming_soon':
        return 'Coming Soon';
      default:
        return null;
    }
  });

  showOverlay = computed(() => {
    const status = this.app().status;
    return status === 'maintenance' || status === 'coming_soon';
  });

  overlayIcon = computed(() => {
    const status = this.app().status;
    if (status === 'maintenance') return 'build';
    if (status === 'coming_soon') return 'schedule';
    return 'block';
  });

  overlayText = computed(() => {
    const status = this.app().status;
    if (status === 'maintenance') return 'Under Maintenance';
    if (status === 'coming_soon') return 'Coming Soon';
    return 'Unavailable';
  });

  showAdminBadge = computed(() => {
    return this.isAdmin() && !this.app().enabled;
  });

  menuActions = computed(() => {
    const app = this.app();
    const defaultActions: LauncherMenuAction[] = [];

    // Add default actions if enabled
    if (app.showDefaultMenu !== false) {
      defaultActions.push(
        { id: 'open', label: 'Open', icon: 'open_in_new' },
        { id: 'open_new_tab', label: 'Open in New Tab', icon: 'tab' },
      );

      if (app.route || app.externalUrl) {
        defaultActions.push({
          id: 'copy_link',
          label: 'Copy Link',
          icon: 'link',
        });
      }

      defaultActions.push({
        id: 'pin',
        label: this.isPinned() ? 'Unpin' : 'Pin to Top',
        icon: 'push_pin',
        divider: true,
      });

      defaultActions.push({
        id: 'favorite',
        label: this.isFavorite() ? 'Remove from Favorites' : 'Add to Favorites',
        icon: this.isFavorite() ? 'star' : 'star_border',
      });
    }

    // Merge with custom actions
    const customActions = app.menuActions || [];
    return [...defaultActions, ...customActions];
  });

  // Methods
  onCardClick(): void {
    if (this.isClickable()) {
      this.cardClick.emit({ app: this.app() });
    }
  }

  onPinClick(event: Event): void {
    event.stopPropagation();
    this.pinToggle.emit(this.app());
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoriteToggle.emit(this.app());
  }

  onMenuAction(action: LauncherMenuAction): void {
    if (action.id === 'favorite') {
      this.favoriteToggle.emit(this.app());
    } else if (action.id === 'pin') {
      this.pinToggle.emit(this.app());
    } else {
      this.menuAction.emit({ app: this.app(), action });
    }
  }
}
