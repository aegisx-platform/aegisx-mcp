import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AegisxNavigationItem } from '../../types/ax-navigation.types';
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
        padding: var(--ax-spacing-sm) 0;
      }

      .ax-nav-group {
        margin-bottom: var(--ax-spacing-sm);
      }

      .ax-nav-group-title {
        padding: var(--ax-spacing-sm) var(--ax-spacing-md);
        font-size: var(--ax-text-xs);
        font-weight: var(--ax-font-semibold);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.5;
      }

      .ax-nav-divider {
        margin: var(--ax-spacing-sm) 0;
        border-top: 1px solid var(--ax-border-default);
      }

      .ax-nav-spacer {
        flex: 1;
      }

      .ax-nav-item {
        display: flex;
        align-items: center;
        padding: var(--ax-spacing-sm) var(--ax-spacing-md);
        margin: 0 var(--ax-spacing-sm);
        border-radius: var(--ax-radius-md);
        transition:
          background-color var(--ax-transition-fast),
          color var(--ax-transition-fast);
        color: var(--ax-text-primary);
        text-decoration: none;
      }

      .ax-nav-item:hover {
        background-color: var(--ax-background-hover);
      }

      .ax-nav-item.active {
        background-color: var(--ax-primary-faint);
        color: var(--ax-primary-emphasis);
      }

      .ax-nav-item-disabled {
        opacity: 0.5;
        pointer-events: none;
      }

      .ax-nav-item-icon {
        margin-right: var(--ax-spacing-sm);
        color: currentColor;
        font-size: 25px;
        width: 25px;
        height: 25px;
      }

      .ax-nav-item-title {
        flex: 1;
      }

      .ax-nav-item-badge {
        margin-left: var(--ax-spacing-sm);
        padding: 2px var(--ax-spacing-sm);
        font-size: var(--ax-text-xs);
        border-radius: var(--ax-radius-full);
      }

      /* Compact appearance */
      .ax-navigation-compact .ax-nav-item {
        justify-content: center;
        padding: var(--ax-spacing-sm);
      }

      .ax-navigation-compact .ax-nav-item-icon {
        margin-right: 0;
      }

      .ax-navigation-compact .ax-nav-item-title {
        display: none;
      }

      .ax-navigation-compact .ax-nav-item-badge {
        position: absolute;
        top: var(--ax-spacing-xs);
        right: var(--ax-spacing-xs);
      }
    `,
  ],
})
export class AegisxNavigationComponent {
  @Input() navigation: AegisxNavigationItem[] = [];
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() appearance: 'default' | 'compact' | 'dense' = 'default';
}
