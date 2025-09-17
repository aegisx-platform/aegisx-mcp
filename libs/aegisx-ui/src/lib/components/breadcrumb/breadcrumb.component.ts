import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AegisxNavigationItem } from '../../types/navigation.types';

@Component({
  selector: 'ax-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <nav class="ax-breadcrumb" aria-label="breadcrumb">
      <ol class="ax-breadcrumb-list">
        @for (item of breadcrumbItems(); track item.id; let isLast = $last) {
          <li
            class="ax-breadcrumb-item"
            [class.ax-breadcrumb-item--active]="isLast"
          >
            @if (!isLast && item.link) {
              <a
                [routerLink]="item.link"
                class="ax-breadcrumb-link"
                [attr.aria-current]="isLast ? 'page' : null"
              >
                @if (item.icon && showIcons) {
                  <mat-icon class="ax-breadcrumb-icon">{{
                    item.icon
                  }}</mat-icon>
                }
                {{ item.title }}
              </a>
            } @else {
              <span class="ax-breadcrumb-text">
                @if (item.icon && showIcons) {
                  <mat-icon class="ax-breadcrumb-icon">{{
                    item.icon
                  }}</mat-icon>
                }
                {{ item.title }}
              </span>
            }

            @if (!isLast) {
              <mat-icon class="ax-breadcrumb-separator">chevron_right</mat-icon>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [
    `
      .ax-breadcrumb {
        padding: 0;
        margin: 0;
      }

      .ax-breadcrumb-list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        list-style: none;
        padding: 0;
        margin: 0;
        gap: 0.25rem;
      }

      .ax-breadcrumb-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .ax-breadcrumb-link {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        text-decoration: none;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
        line-height: 1.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        transition: all 0.2s ease-in-out;
      }

      .ax-breadcrumb-link:hover {
        background-color: var(--mat-sys-surface-variant);
        color: var(--mat-sys-on-surface);
      }

      .ax-breadcrumb-text {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--mat-sys-on-surface);
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 500;
        padding: 0.25rem 0.5rem;
      }

      .ax-breadcrumb-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }

      .ax-breadcrumb-separator {
        color: var(--mat-sys-on-surface-variant);
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        opacity: 0.6;
      }

      .ax-breadcrumb-item--active .ax-breadcrumb-text {
        font-weight: 600;
      }

      /* Dark theme support */
      :host-context(.dark) .ax-breadcrumb-link {
        color: rgba(255, 255, 255, 0.7);
      }

      :host-context(.dark) .ax-breadcrumb-link:hover {
        background-color: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
      }

      :host-context(.dark) .ax-breadcrumb-text {
        color: rgba(255, 255, 255, 0.9);
      }

      :host-context(.dark) .ax-breadcrumb-separator {
        color: rgba(255, 255, 255, 0.6);
      }

      /* Responsive design */
      @media (max-width: 640px) {
        .ax-breadcrumb-list {
          gap: 0.125rem;
        }

        .ax-breadcrumb-link,
        .ax-breadcrumb-text {
          font-size: 0.75rem;
          padding: 0.125rem 0.25rem;
        }

        .ax-breadcrumb-icon,
        .ax-breadcrumb-separator {
          font-size: 0.875rem;
          width: 0.875rem;
          height: 0.875rem;
        }
      }
    `,
  ],
})
export class BreadcrumbComponent {
  /**
   * Breadcrumb items to display
   */
  @Input() items: AegisxNavigationItem[] = [];

  /**
   * Whether to show icons in breadcrumb items
   */
  @Input() showIcons = true;

  /**
   * Maximum number of items to show. If exceeded, will show first, last, and ellipsis
   */
  @Input() maxItems?: number;

  /**
   * Computed breadcrumb items
   */
  breadcrumbItems = () => {
    let items = this.items || [];

    // If maxItems is set and items exceed, truncate
    if (this.maxItems && items.length > this.maxItems) {
      const firstItem = items[0];
      const lastItems = items.slice(-2); // Keep last 2 items

      // Create ellipsis item
      const ellipsisItem: AegisxNavigationItem = {
        id: 'ellipsis',
        title: '...',
        type: 'basic',
      };

      items = [firstItem, ellipsisItem, ...lastItems];
    }

    return items;
  };
}
