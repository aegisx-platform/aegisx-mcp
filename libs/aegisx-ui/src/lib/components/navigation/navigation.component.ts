import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AegisxNavigationItem } from '../../types/navigation.types';
import { expandCollapse } from '../../animations';

@Component({
  selector: 'ax-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  animations: [expandCollapse],
  template: `
    <div class="ax-navigation" [class]="'ax-navigation-' + appearance">
      @for (item of navigation; track item.id) {
        @switch (item.type) {
          @case ('group') {
            <div class="ax-nav-group">
              @if (item.title) {
                <div class="ax-nav-group-title">{{ item.title }}</div>
              }
              @if (item.children) {
                <ax-navigation
                  [navigation]="item.children"
                  [layout]="layout"
                  [appearance]="appearance"
                ></ax-navigation>
              }
            </div>
          }
          @case ('divider') {
            <div class="ax-nav-divider"></div>
          }
          @case ('spacer') {
            <div class="ax-nav-spacer"></div>
          }
          @default {
            <a
              [routerLink]="item.link"
              [routerLinkActive]="'active'"
              [routerLinkActiveOptions]="{ exact: item.exactMatch || false }"
              class="ax-nav-item"
              [class.ax-nav-item-disabled]="item.disabled"
            >
              @if (item.icon) {
                <mat-icon class="ax-nav-item-icon">{{ item.icon }}</mat-icon>
              }
              <span class="ax-nav-item-title">{{ item.title }}</span>
              @if (item.badge) {
                <span class="ax-nav-item-badge" [class]="item.badge.classes">
                  {{ item.badge.title }}
                </span>
              }
            </a>
          }
        }
      }
    </div>
  `,
  styles: [
    `
      .ax-navigation {
        @apply py-2;
      }

      .ax-nav-group {
        @apply mb-2;
      }

      .ax-nav-group-title {
        @apply px-4 py-2 text-xs font-semibold uppercase tracking-wider opacity-50;
      }

      .ax-nav-divider {
        @apply my-2 border-t border-gray-200 dark:border-gray-700;
      }

      .ax-nav-spacer {
        @apply flex-1;
      }

      .ax-nav-item {
        @apply flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200;
        @apply text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800;
      }

      .ax-nav-item.active {
        @apply bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300;
      }

      .ax-nav-item-disabled {
        @apply opacity-50 pointer-events-none;
      }

      .ax-nav-item-icon {
        @apply mr-3 text-current;
        font-size: 25px;
        width: 25px;
        height: 25px;
      }

      .ax-nav-item-title {
        @apply flex-1;
      }

      .ax-nav-item-badge {
        @apply ml-2 px-2 py-0.5 text-xs rounded-full;
      }

      /* Compact appearance */
      .ax-navigation-compact .ax-nav-item {
        @apply justify-center px-2;
      }

      .ax-navigation-compact .ax-nav-item-icon {
        @apply mr-0;
      }

      .ax-navigation-compact .ax-nav-item-title {
        @apply hidden;
      }

      .ax-navigation-compact .ax-nav-item-badge {
        @apply absolute top-1 right-1;
      }
    `,
  ],
})
export class AegisxNavigationComponent {
  @Input() navigation: AegisxNavigationItem[] = [];
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() appearance: 'default' | 'compact' | 'dense' = 'default';
}
