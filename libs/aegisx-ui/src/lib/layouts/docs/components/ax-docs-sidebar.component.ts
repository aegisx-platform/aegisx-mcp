import {
  Component,
  Input,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter, Subject, takeUntil } from 'rxjs';

/**
 * Documentation navigation item interface
 */
export interface DocsNavItem {
  id: string;
  title: string;
  link?: string;
  children?: DocsNavItem[];
  defaultOpen?: boolean;
}

/**
 * Documentation Sidebar Component
 *
 * Shadcn/ui-inspired minimal navigation sidebar for documentation.
 * Features:
 * - Text-based navigation (minimal icons)
 * - Collapsible sections
 * - Active state highlighting
 * - Smooth animations
 */
@Component({
  selector: 'ax-docs-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <nav class="docs-sidebar">
      <!-- Navigation Groups -->
      <div class="docs-sidebar__nav">
        @for (group of navigation; track group.id) {
          <div class="docs-nav-group">
            <!-- Group Header (if has children) -->
            @if (group.children && group.children.length > 0) {
              <button
                class="docs-nav-group__header"
                (click)="toggleGroup(group.id)"
                [attr.aria-expanded]="isGroupOpen(group.id)"
              >
                <span class="docs-nav-group__title">{{ group.title }}</span>
                <mat-icon
                  class="docs-nav-group__icon"
                  [class.docs-nav-group__icon--open]="isGroupOpen(group.id)"
                >
                  chevron_right
                </mat-icon>
              </button>

              <!-- Group Items -->
              <div
                class="docs-nav-group__items"
                [class.docs-nav-group__items--open]="isGroupOpen(group.id)"
              >
                @for (item of group.children; track item.id) {
                  <!-- Nested group -->
                  @if (item.children && item.children.length > 0) {
                    <div class="docs-nav-subgroup">
                      <button
                        class="docs-nav-subgroup__header"
                        (click)="toggleGroup(item.id)"
                        [attr.aria-expanded]="isGroupOpen(item.id)"
                      >
                        <span>{{ item.title }}</span>
                        <mat-icon
                          class="docs-nav-subgroup__icon"
                          [class.docs-nav-subgroup__icon--open]="
                            isGroupOpen(item.id)
                          "
                        >
                          chevron_right
                        </mat-icon>
                      </button>
                      <div
                        class="docs-nav-subgroup__items"
                        [class.docs-nav-subgroup__items--open]="
                          isGroupOpen(item.id)
                        "
                      >
                        @for (subItem of item.children; track subItem.id) {
                          <a
                            class="docs-nav-item"
                            [routerLink]="subItem.link"
                            routerLinkActive="docs-nav-item--active"
                            [routerLinkActiveOptions]="{ exact: false }"
                          >
                            {{ subItem.title }}
                          </a>
                        }
                      </div>
                    </div>
                  } @else if (item.link) {
                    <!-- Simple item with link -->
                    <a
                      class="docs-nav-item"
                      [routerLink]="item.link"
                      routerLinkActive="docs-nav-item--active"
                      [routerLinkActiveOptions]="{ exact: false }"
                    >
                      {{ item.title }}
                    </a>
                  } @else {
                    <!-- Item without link (label only) -->
                    <span class="docs-nav-item docs-nav-item--label">
                      {{ item.title }}
                    </span>
                  }
                }
              </div>
            } @else {
              <!-- Single item without children -->
              <a
                class="docs-nav-item docs-nav-item--top"
                [routerLink]="group.link"
                routerLinkActive="docs-nav-item--active"
                [routerLinkActiveOptions]="{ exact: false }"
              >
                {{ group.title }}
              </a>
            }
          </div>
        }
      </div>
    </nav>
  `,
  styles: [
    `
      /* Tremor-inspired sidebar - clean & spacious */
      .docs-sidebar {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 1.5rem 1rem;
        overflow-y: auto;
        overflow-x: hidden;

        /* Custom scrollbar */
        &::-webkit-scrollbar {
          width: 4px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--ax-border-default, #e5e7eb);
          border-radius: 2px;
        }

        &::-webkit-scrollbar-thumb:hover {
          background: var(--ax-text-tertiary, #9ca3af);
        }
      }

      .docs-sidebar__nav {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Group - Section headers */
      .docs-nav-group {
        display: flex;
        flex-direction: column;
      }

      .docs-nav-group__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.25rem 0;
        margin: 0;
        margin-bottom: 0.5rem;
        border: none;
        background: transparent;
        color: #111827;
        font-size: 0.875rem;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        transition: color 150ms ease;

        &:hover {
          color: #6366f1;
        }

        &:focus-visible {
          outline: 2px solid var(--ax-primary-default, #6366f1);
          outline-offset: 2px;
          border-radius: 0.25rem;
        }
      }

      .docs-nav-group__title {
        flex: 1;
      }

      .docs-nav-group__icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #9ca3af;
        transition: transform 200ms ease;
      }

      .docs-nav-group__icon--open {
        transform: rotate(90deg);
      }

      /* Group Items Container */
      .docs-nav-group__items {
        display: none;
        flex-direction: column;
        gap: 0.125rem;
        overflow: hidden;
      }

      .docs-nav-group__items--open {
        display: flex;
      }

      /* Subgroup (nested) - Category headers */
      .docs-nav-subgroup {
        display: flex;
        flex-direction: column;
        margin-top: 0.75rem;
      }

      .docs-nav-subgroup__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.25rem 0;
        padding-left: 0.75rem;
        margin: 0;
        margin-bottom: 0.25rem;
        border: none;
        background: transparent;
        color: #6b7280;
        font-size: 0.8125rem;
        font-weight: 500;
        text-align: left;
        cursor: pointer;
        transition: color 150ms ease;

        &:hover {
          color: #111827;
        }
      }

      .docs-nav-subgroup__icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: #9ca3af;
        transition: transform 200ms ease;
      }

      .docs-nav-subgroup__icon--open {
        transform: rotate(90deg);
      }

      .docs-nav-subgroup__items {
        display: none;
        flex-direction: column;
        gap: 0.125rem;
        overflow: hidden;
      }

      .docs-nav-subgroup__items--open {
        display: flex;
      }

      /* Navigation Item - Tremor style */
      .docs-nav-item {
        display: block;
        padding: 0.375rem 0.75rem;
        color: #6b7280;
        font-size: 0.875rem;
        line-height: 1.5;
        text-decoration: none;
        border-radius: 0.375rem;
        transition: all 150ms ease;
        border-left: 2px solid transparent;
        margin-left: 0;

        &:hover {
          color: #111827;
          background-color: #f3f4f6;
        }
      }

      .docs-nav-item--active {
        color: #6366f1;
        font-weight: 500;
        border-left-color: #6366f1;
        background-color: #eef2ff;

        &:hover {
          background-color: #e0e7ff;
        }
      }

      .docs-nav-item--top {
        margin-left: 0;
        border-left: none;
        font-weight: 500;
      }

      /* Items inside subgroup - slight indent */
      .docs-nav-subgroup__items .docs-nav-item {
        padding-left: 1.25rem;
      }

      /* Dark mode support */
      :host-context(.dark) {
        .docs-nav-group__header {
          color: #f9fafb;

          &:hover {
            color: #818cf8;
          }
        }

        .docs-nav-group__icon {
          color: #6b7280;
        }

        .docs-nav-subgroup__header {
          color: #9ca3af;

          &:hover {
            color: #f9fafb;
          }
        }

        .docs-nav-item {
          color: #9ca3af;

          &:hover {
            color: #f9fafb;
            background-color: #1f2937;
          }
        }

        .docs-nav-item--active {
          color: #818cf8;
          background-color: rgba(99, 102, 241, 0.1);

          &:hover {
            background-color: rgba(99, 102, 241, 0.15);
          }
        }
      }
    `,
  ],
})
export class AxDocsSidebarComponent implements OnInit, OnDestroy {
  @Input() navigation: DocsNavItem[] = [];

  private _router = inject(Router);
  private _destroy$ = new Subject<void>();

  // Track open/closed state of groups
  private _openGroups = signal<Set<string>>(new Set());

  ngOnInit(): void {
    // Initialize open groups based on defaultOpen and current route
    this.initializeOpenGroups();

    // Listen to route changes to auto-expand relevant groups
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this.expandGroupsForCurrentRoute();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private initializeOpenGroups(): void {
    const openGroups = new Set<string>();

    // Add groups with defaultOpen = true
    this.navigation.forEach((group) => {
      if (group.defaultOpen) {
        openGroups.add(group.id);
      }
      group.children?.forEach((item) => {
        if (item.defaultOpen) {
          openGroups.add(item.id);
        }
      });
    });

    this._openGroups.set(openGroups);

    // Also expand groups for current route
    this.expandGroupsForCurrentRoute();
  }

  private expandGroupsForCurrentRoute(): void {
    const currentUrl = this._router.url;
    const openGroups = new Set(this._openGroups());

    // Find and open groups that contain the current route
    this.navigation.forEach((group) => {
      if (this.groupContainsRoute(group, currentUrl)) {
        openGroups.add(group.id);
      }
      group.children?.forEach((item) => {
        if (item.children && this.groupContainsRoute(item, currentUrl)) {
          openGroups.add(group.id);
          openGroups.add(item.id);
        }
      });
    });

    this._openGroups.set(openGroups);
  }

  private groupContainsRoute(group: DocsNavItem, url: string): boolean {
    if (group.link && url.includes(group.link)) {
      return true;
    }
    if (group.children) {
      return group.children.some((item) => this.groupContainsRoute(item, url));
    }
    return false;
  }

  toggleGroup(groupId: string): void {
    const openGroups = new Set(this._openGroups());
    if (openGroups.has(groupId)) {
      openGroups.delete(groupId);
    } else {
      openGroups.add(groupId);
    }
    this._openGroups.set(openGroups);
  }

  isGroupOpen(groupId: string): boolean {
    return this._openGroups().has(groupId);
  }
}
