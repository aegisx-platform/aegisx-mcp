import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { AxLauncherCardComponent } from './launcher-card.component';
import {
  LauncherApp,
  LauncherCategory,
  LauncherUserContext,
  LauncherConfig,
  LauncherViewMode,
  LauncherGroupBy,
  LauncherGroupedApps,
  LauncherAppClickEvent,
  LauncherMenuActionEvent,
  LauncherStatusChangeEvent,
  LauncherEnabledChangeEvent,
  LauncherCardSize,
} from './launcher.types';

/** Default configuration */
const DEFAULT_CONFIG: LauncherConfig = {
  showSearch: true,
  showCategoryTabs: true,
  showStatusFilter: false,
  showViewToggle: false,
  defaultViewMode: 'grid',
  defaultGroupBy: 'category',
  emptyMessage: 'No applications available',
  noResultsMessage: 'No applications found',
  enableFavorites: true,
  enableRecent: true,
  maxRecentApps: 5,
  storageKeyPrefix: 'ax-launcher',
  cardMinWidth: 240,
  cardMaxWidth: 320,
  cardGap: 20,
};

@Component({
  selector: 'ax-launcher',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatBadgeModule,
    AxLauncherCardComponent,
  ],
  template: `
    <div class="ax-launcher" [class.ax-launcher--list]="viewMode() === 'list'">
      <!-- Header -->
      <div class="ax-launcher__header">
        <div class="ax-launcher__title-section">
          @if (title()) {
            <h2 class="ax-launcher__title">{{ title() }}</h2>
          }
          @if (subtitle()) {
            <p class="ax-launcher__subtitle">{{ subtitle() }}</p>
          }
        </div>

        <div class="ax-launcher__actions">
          <!-- Notification Summary Badge -->
          @if (totalNotifications() > 0) {
            <div
              class="ax-launcher__notification-summary"
              matTooltip="Total pending notifications"
            >
              <mat-icon
                [matBadge]="totalNotifications()"
                matBadgeColor="warn"
                matBadgeSize="small"
              >
                notifications
              </mat-icon>
            </div>
          }

          <!-- Search with Keyboard Shortcut -->
          @if (mergedConfig().showSearch) {
            <mat-form-field
              appearance="outline"
              class="ax-launcher__search"
              subscriptSizing="dynamic"
            >
              <mat-icon matPrefix>search</mat-icon>
              <input
                #searchInput
                matInput
                placeholder="Search apps..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
              />
              @if (searchQuery()) {
                <button matSuffix mat-icon-button (click)="clearSearch()">
                  <mat-icon>close</mat-icon>
                </button>
              } @else {
                <span matSuffix class="ax-launcher__search-hint">⌘K</span>
              }
            </mat-form-field>
          }

          <!-- View Toggle -->
          @if (mergedConfig().showViewToggle) {
            <mat-button-toggle-group
              [value]="viewMode()"
              (change)="viewMode.set($event.value)"
              class="ax-launcher__view-toggle"
            >
              <mat-button-toggle value="grid" matTooltip="Grid view">
                <mat-icon>grid_view</mat-icon>
              </mat-button-toggle>
              <mat-button-toggle value="list" matTooltip="List view">
                <mat-icon>view_list</mat-icon>
              </mat-button-toggle>
            </mat-button-toggle-group>
          }
        </div>
      </div>

      <!-- Category Tabs -->
      @if (mergedConfig().showCategoryTabs && categoriesWithAll().length > 1) {
        <mat-tab-group
          class="ax-launcher__tabs"
          [selectedIndex]="selectedCategoryIndex()"
          (selectedIndexChange)="onCategoryChange($event)"
          animationDuration="200ms"
        >
          <!-- Pinned Tab -->
          @if (pinnedApps().length > 0) {
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon tab-icon--pinned">push_pin</mat-icon>
                <span>Pinned</span>
                <span class="tab-count tab-count--pinned">{{
                  pinnedApps().length
                }}</span>
              </ng-template>
            </mat-tab>
          }
          <!-- Recently Used Tab -->
          @if (mergedConfig().enableRecent && recentAppsData().length > 0) {
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">history</mat-icon>
                <span>Recent</span>
                <span class="tab-count">{{ recentAppsData().length }}</span>
              </ng-template>
            </mat-tab>
          }
          <!-- Featured Tab (Bento Grid) -->
          @if (hasFeaturedApps()) {
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">star</mat-icon>
                <span>Featured</span>
                <span class="tab-count">{{ featuredApps().length }}</span>
              </ng-template>
            </mat-tab>
          }
          @for (cat of categoriesWithAll(); track cat.id) {
            <mat-tab>
              <ng-template mat-tab-label>
                @if (cat.icon) {
                  <mat-icon class="tab-icon">{{ cat.icon }}</mat-icon>
                }
                <span>{{ cat.name }}</span>
                <span class="tab-count">{{ getCategoryCount(cat.id) }}</span>
              </ng-template>
            </mat-tab>
          }
        </mat-tab-group>
      }

      <!-- Quick Filters -->
      @if (mergedConfig().enableFavorites || mergedConfig().enableRecent) {
        <div class="ax-launcher__filters">
          @if (mergedConfig().enableFavorites && favorites().length > 0) {
            <mat-chip-listbox>
              <mat-chip-option
                [selected]="showFavoritesOnly()"
                (selectionChange)="showFavoritesOnly.set($event.selected)"
              >
                <mat-icon matChipAvatar>star</mat-icon>
                Favorites ({{ favorites().length }})
              </mat-chip-option>
            </mat-chip-listbox>
          }
        </div>
      }

      <!-- Apps Grid/List -->
      <div class="ax-launcher__content">
        @if (showPinnedView()) {
          <!-- Pinned Apps Grid -->
          <div class="ax-launcher__section">
            <div class="ax-launcher__section-header">
              <mat-icon class="section-icon section-icon--pinned"
                >push_pin</mat-icon
              >
              <h3>Pinned Apps</h3>
              <span class="section-hint"
                >Your pinned apps for quick access</span
              >
            </div>
            <div
              class="ax-launcher__grid"
              [style.--card-min-width.px]="mergedConfig().cardMinWidth"
              [style.--card-gap.px]="mergedConfig().cardGap"
            >
              @for (app of pinnedAppsData(); track app.id) {
                <ax-launcher-card
                  [app]="app"
                  [isAdmin]="userContext().isAdmin || false"
                  [isFavorite]="isFavorite(app.id)"
                  [isPinned]="true"
                  (cardClick)="onAppClick($event)"
                  (menuAction)="onMenuAction($event)"
                  (favoriteToggle)="toggleFavorite($event)"
                  (pinToggle)="togglePin($event)"
                />
              }
            </div>
          </div>
        } @else if (showRecentView()) {
          <!-- Recently Used Apps Grid -->
          <div class="ax-launcher__section">
            <div class="ax-launcher__section-header">
              <mat-icon class="section-icon">history</mat-icon>
              <h3>Recently Used</h3>
              <span class="section-hint">Apps you've used recently</span>
            </div>
            <div
              class="ax-launcher__grid"
              [style.--card-min-width.px]="mergedConfig().cardMinWidth"
              [style.--card-gap.px]="mergedConfig().cardGap"
            >
              @for (app of recentAppsData(); track app.id) {
                <ax-launcher-card
                  [app]="app"
                  [isAdmin]="userContext().isAdmin || false"
                  [isFavorite]="isFavorite(app.id)"
                  [isPinned]="isPinned(app.id)"
                  (cardClick)="onAppClick($event)"
                  (menuAction)="onMenuAction($event)"
                  (favoriteToggle)="toggleFavorite($event)"
                  (pinToggle)="togglePin($event)"
                />
              }
            </div>
          </div>
        } @else if (showFeaturedView()) {
          <!-- Featured/Bento Grid View -->
          <div class="ax-launcher__bento-grid">
            @for (app of featuredApps(); track app.id) {
              <ax-launcher-card
                class="bento-item"
                [class.bento-item--sm]="getCardSize(app) === 'sm'"
                [class.bento-item--md]="getCardSize(app) === 'md'"
                [class.bento-item--lg]="getCardSize(app) === 'lg'"
                [class.bento-item--xl]="getCardSize(app) === 'xl'"
                [app]="app"
                [size]="getCardSize(app)"
                [isAdmin]="userContext().isAdmin || false"
                [isFavorite]="isFavorite(app.id)"
                [isPinned]="isPinned(app.id)"
                (cardClick)="onAppClick($event)"
                (menuAction)="onMenuAction($event)"
                (favoriteToggle)="toggleFavorite($event)"
                (pinToggle)="togglePin($event)"
              />
            }
          </div>
        } @else if (groupedApps().length === 0) {
          <!-- Empty State -->
          <div class="ax-launcher__empty">
            <mat-icon>apps</mat-icon>
            <p>
              {{
                searchQuery()
                  ? mergedConfig().noResultsMessage
                  : mergedConfig().emptyMessage
              }}
            </p>
            @if (searchQuery()) {
              <button mat-stroked-button (click)="clearSearch()">
                Clear Search
              </button>
            }
          </div>
        } @else {
          @for (
            group of groupedApps();
            track group.category?.id || 'uncategorized'
          ) {
            <!-- Category Header (if grouped) -->
            @if (
              mergedConfig().defaultGroupBy === 'category' &&
              group.category &&
              !selectedCategory()
            ) {
              <div class="ax-launcher__group-header">
                @if (group.category.icon) {
                  <mat-icon>{{ group.category.icon }}</mat-icon>
                }
                <h3>{{ group.category.name }}</h3>
                <span class="group-count">{{ group.apps.length }}</span>
              </div>
            }

            <!-- Apps Grid -->
            <div
              class="ax-launcher__grid"
              [style.--card-min-width.px]="mergedConfig().cardMinWidth"
              [style.--card-max-width.px]="mergedConfig().cardMaxWidth"
              [style.--card-gap.px]="mergedConfig().cardGap"
            >
              @for (app of group.apps; track app.id) {
                <ax-launcher-card
                  [app]="app"
                  [isAdmin]="userContext().isAdmin || false"
                  [isFavorite]="isFavorite(app.id)"
                  [isPinned]="isPinned(app.id)"
                  (cardClick)="onAppClick($event)"
                  (menuAction)="onMenuAction($event)"
                  (favoriteToggle)="toggleFavorite($event)"
                  (pinToggle)="togglePin($event)"
                />
              }
            </div>
          }
        }
      </div>

      <!-- Footer (optional slot) -->
      <ng-content select="[launcherFooter]"></ng-content>
    </div>
  `,
  styles: `
    .ax-launcher {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Header */
    .ax-launcher__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .ax-launcher__title-section {
      flex: 1;
      min-width: 200px;
    }

    .ax-launcher__title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--ax-text-heading, #111827);
      margin: 0 0 0.25rem;
    }

    .ax-launcher__subtitle {
      font-size: 0.9375rem;
      color: var(--ax-text-secondary, #6b7280);
      margin: 0;
    }

    .ax-launcher__actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .ax-launcher__search {
      width: 280px;

      ::ng-deep {
        .mat-mdc-form-field-subscript-wrapper {
          display: none;
        }

        .mat-mdc-text-field-wrapper {
          background: var(--ax-background-default, #fff);
        }
      }
    }

    .ax-launcher__view-toggle {
      height: 40px;
    }

    /* Notification Summary */
    .ax-launcher__notification-summary {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: var(--ax-radius-md, 8px);
      transition: background-color 0.2s ease;

      &:hover {
        background: var(--ax-background-subtle, #f3f4f6);
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: var(--ax-text-secondary, #6b7280);
      }
    }

    /* Search Hint */
    .ax-launcher__search-hint {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.5rem;
      margin-right: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ax-text-muted, #9ca3af);
      background: var(--ax-background-subtle, #f3f4f6);
      border-radius: var(--ax-radius-sm, 4px);
      border: 1px solid var(--ax-border-default, #e5e7eb);
    }

    /* Tabs */
    .ax-launcher__tabs {
      ::ng-deep {
        .mat-mdc-tab-labels {
          gap: 0.5rem;
        }

        .mat-mdc-tab {
          min-width: auto;
          padding: 0 1rem;
        }
      }

      .tab-icon {
        margin-right: 0.5rem;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .tab-count {
        margin-left: 0.5rem;
        padding: 0.125rem 0.5rem;
        background: var(--ax-background-subtle, #f3f4f6);
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--ax-text-muted, #6b7280);
      }

      .tab-icon--pinned {
        color: var(--ax-warning-default, #f59e0b);
      }

      .tab-count--pinned {
        background: var(--ax-warning-faint, #fef3c7);
        color: var(--ax-warning-700, #b45309);
      }
    }

    /* Filters */
    .ax-launcher__filters {
      display: flex;
      gap: 0.5rem;
    }

    /* Content */
    .ax-launcher__content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Section (Pinned/Recent) */
    .ax-launcher__section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .ax-launcher__section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--ax-border-default, #e5e7eb);

      .section-icon {
        color: var(--ax-text-muted, #6b7280);
        font-size: 22px;
        width: 22px;
        height: 22px;

        &.section-icon--pinned {
          color: var(--ax-warning-default, #f59e0b);
        }
      }

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ax-text-heading, #111827);
        margin: 0;
      }

      .section-hint {
        font-size: 0.875rem;
        color: var(--ax-text-muted, #9ca3af);
        margin-left: auto;
      }
    }

    /* Group Header */
    .ax-launcher__group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--ax-border-default, #e5e7eb);

      mat-icon {
        color: var(--ax-text-muted);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ax-text-heading);
        margin: 0;
      }

      .group-count {
        padding: 0.125rem 0.5rem;
        background: var(--ax-background-subtle);
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--ax-text-muted);
      }
    }

    /* Grid */
    .ax-launcher__grid {
      display: grid;
      grid-template-columns: repeat(
        auto-fill,
        minmax(var(--card-min-width, 240px), 1fr)
      );
      gap: var(--card-gap, 20px);
    }

    /* List View */
    .ax-launcher--list {
      .ax-launcher__grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
    }

    /* Empty State */
    .ax-launcher__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--ax-text-muted);
        opacity: 0.4;
        margin-bottom: 1rem;
      }

      p {
        font-size: 1rem;
        color: var(--ax-text-secondary);
        margin: 0 0 1rem;
      }
    }

    /* Bento Grid Layout */
    .ax-launcher__bento-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-auto-rows: minmax(140px, auto);
      gap: 1.25rem;
    }

    .bento-item {
      display: block;
    }

    .bento-item--sm {
      grid-column: span 1;
      grid-row: span 1;
    }

    .bento-item--md {
      grid-column: span 1;
      grid-row: span 1;
    }

    .bento-item--lg {
      grid-column: span 2;
      grid-row: span 1;
    }

    .bento-item--xl {
      grid-column: span 2;
      grid-row: span 2;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .ax-launcher__bento-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .bento-item--xl {
        grid-column: span 2;
        grid-row: span 2;
      }
    }

    @media (max-width: 768px) {
      .ax-launcher__header {
        flex-direction: column;
      }

      .ax-launcher__actions {
        width: 100%;
      }

      .ax-launcher__search {
        flex: 1;
        width: 100%;
      }

      .ax-launcher__grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;
      }

      .ax-launcher__bento-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: minmax(120px, auto);
        gap: 1rem;
      }

      .bento-item--lg {
        grid-column: span 2;
        grid-row: span 1;
      }

      .bento-item--xl {
        grid-column: span 2;
        grid-row: span 1;
      }
    }

    @media (max-width: 480px) {
      .ax-launcher__bento-grid {
        grid-template-columns: 1fr;
      }

      .bento-item--sm,
      .bento-item--md,
      .bento-item--lg,
      .bento-item--xl {
        grid-column: span 1;
        grid-row: span 1;
      }
    }

    /* Dark Mode Support */
    :host-context(.dark),
    .dark {
      .ax-launcher__title {
        color: #f9fafb;
      }

      .ax-launcher__subtitle {
        color: #9ca3af;
      }

      .ax-launcher__search {
        ::ng-deep .mat-mdc-text-field-wrapper {
          background: #1f2937;
        }
      }

      .ax-launcher__search-hint {
        color: #6b7280;
        background: #374151;
        border-color: #4b5563;
      }

      .ax-launcher__notification-summary {
        &:hover {
          background: #374151;
        }
        mat-icon {
          color: #9ca3af;
        }
      }

      .tab-count {
        background: #374151;
        color: #9ca3af;
      }

      .tab-count--pinned {
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
      }

      .ax-launcher__section-header {
        border-bottom-color: #374151;

        h3 {
          color: #f9fafb;
        }

        .section-hint {
          color: #6b7280;
        }

        .section-icon {
          color: #9ca3af;

          &.section-icon--pinned {
            color: #fbbf24;
          }
        }
      }

      .ax-launcher__group-header {
        border-bottom-color: #374151;

        mat-icon {
          color: #9ca3af;
        }

        h3 {
          color: #f9fafb;
        }

        .group-count {
          background: #374151;
          color: #9ca3af;
        }
      }

      .ax-launcher__empty {
        mat-icon {
          color: #6b7280;
        }

        p {
          color: #9ca3af;
        }
      }
    }
  `,
})
export class AxLauncherComponent {
  // ============================================
  // INPUTS
  // ============================================

  /** All apps to display */
  apps = input.required<LauncherApp[]>();

  /** Categories for grouping */
  categories = input<LauncherCategory[]>([]);

  /** User context for RBAC */
  userContext = input<LauncherUserContext>({ roles: [], permissions: [] });

  /** Component configuration */
  config = input<Partial<LauncherConfig>>({});

  /** Title */
  title = input<string>('');

  /** Subtitle */
  subtitle = input<string>('');

  // ============================================
  // OUTPUTS
  // ============================================

  appClick = output<LauncherAppClickEvent>();
  menuAction = output<LauncherMenuActionEvent>();
  statusChange = output<LauncherStatusChangeEvent>();
  enabledChange = output<LauncherEnabledChangeEvent>();

  // ============================================
  // STATE
  // ============================================

  searchQuery = signal<string>('');
  selectedCategory = signal<string | null>(null);
  viewMode = signal<LauncherViewMode>('grid');
  groupBy = signal<LauncherGroupBy>('category');
  showFavoritesOnly = signal<boolean>(false);
  favorites = signal<string[]>([]);
  recentApps = signal<string[]>([]);
  /** Pinned apps (shown at top of featured) */
  pinnedApps = signal<string[]>([]);
  /** Whether featured tab is selected */
  showFeaturedTab = signal<boolean>(true);
  /** Current active view: 'pinned' | 'recent' | 'featured' | 'category' */
  activeView = signal<'pinned' | 'recent' | 'featured' | 'category'>(
    'featured',
  );

  /** Search input element reference */
  private searchInputRef =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // ============================================
  // KEYBOARD SHORTCUT
  // ============================================

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.focusSearch();
    }
  }

  focusSearch(): void {
    const inputRef = this.searchInputRef();
    if (inputRef) {
      inputRef.nativeElement.focus();
    }
  }

  // ============================================
  // COMPUTED
  // ============================================

  /** Merged configuration with defaults */
  mergedConfig = computed(() => ({
    ...DEFAULT_CONFIG,
    ...this.config(),
  }));

  /** Categories with "All" option */
  categoriesWithAll = computed<LauncherCategory[]>(() => {
    const cats = this.categories();
    if (cats.length === 0) return [];

    return [
      { id: 'all', name: 'All Apps', icon: 'apps' },
      ...cats.sort((a, b) => (a.order || 0) - (b.order || 0)),
    ];
  });

  /** Featured apps (apps with featured=true or size defined, or top used) */
  featuredApps = computed(() => {
    const allApps = this.apps();
    const user = this.userContext();
    const recent = this.recentApps();
    const pinned = this.pinnedApps();

    // Get apps that are featured, pinned, or have a size defined
    const featured = allApps.filter((app) => {
      if (!this.canViewApp(app, user)) return false;
      // Include pinned apps in featured view
      if (pinned.includes(app.id)) return true;
      return app.featured || app.size || app.usageCount;
    });

    // Sort by: pinned first, then usageCount (desc), recent usage, then by size priority
    const sizePriority: Record<LauncherCardSize, number> = {
      xl: 4,
      lg: 3,
      md: 2,
      sm: 1,
    };

    return featured.sort((a, b) => {
      // Pinned apps always come first
      const pinnedA = pinned.includes(a.id);
      const pinnedB = pinned.includes(b.id);
      if (pinnedA && !pinnedB) return -1;
      if (!pinnedA && pinnedB) return 1;

      // If both pinned, maintain pin order
      if (pinnedA && pinnedB) {
        return pinned.indexOf(a.id) - pinned.indexOf(b.id);
      }

      // Then by usage count
      const usageA = a.usageCount || 0;
      const usageB = b.usageCount || 0;
      if (usageB !== usageA) return usageB - usageA;

      // Then by recent usage
      const recentA = recent.indexOf(a.id);
      const recentB = recent.indexOf(b.id);
      if (recentA !== -1 && recentB !== -1) return recentA - recentB;
      if (recentA !== -1) return -1;
      if (recentB !== -1) return 1;

      // Then by size priority
      const sizeA = sizePriority[a.size || 'md'];
      const sizeB = sizePriority[b.size || 'md'];
      return sizeB - sizeA;
    });
  });

  /** Check if there are any featured apps */
  hasFeaturedApps = computed(() => this.featuredApps().length > 0);

  /** Total notification count across all apps */
  totalNotifications = computed(() => {
    return this.apps().reduce(
      (sum, app) => sum + (app.notificationCount || 0),
      0,
    );
  });

  /** Pinned apps data (actual app objects) */
  pinnedAppsData = computed(() => {
    const pinned = this.pinnedApps();
    const allApps = this.apps();
    const user = this.userContext();

    return pinned
      .map((id) => allApps.find((app) => app.id === id))
      .filter(
        (app): app is LauncherApp =>
          app !== undefined && this.canViewApp(app, user),
      );
  });

  /** Recent apps data (actual app objects) */
  recentAppsData = computed(() => {
    const recent = this.recentApps();
    const allApps = this.apps();
    const user = this.userContext();

    return recent
      .map((id) => allApps.find((app) => app.id === id))
      .filter(
        (app): app is LauncherApp =>
          app !== undefined && this.canViewApp(app, user),
      );
  });

  /** Whether to show pinned view */
  showPinnedView = computed(() => {
    return (
      this.activeView() === 'pinned' &&
      this.pinnedAppsData().length > 0 &&
      !this.searchQuery()
    );
  });

  /** Whether to show recent view */
  showRecentView = computed(() => {
    return (
      this.activeView() === 'recent' &&
      this.recentAppsData().length > 0 &&
      !this.searchQuery()
    );
  });

  /** Whether to show featured view (bento grid) */
  showFeaturedView = computed(() => {
    return (
      this.activeView() === 'featured' &&
      this.hasFeaturedApps() &&
      !this.searchQuery()
    );
  });

  /** Selected category index for tabs (adjusted for special tabs: Pinned, Recent, Featured) */
  selectedCategoryIndex = computed(() => {
    const active = this.activeView();
    const hasPinned = this.pinnedApps().length > 0;
    const hasRecent =
      this.mergedConfig().enableRecent && this.recentAppsData().length > 0;
    const hasFeatured = this.hasFeaturedApps();

    // Calculate indices dynamically
    let currentIndex = 0;

    // Pinned tab (index 0 if exists)
    if (hasPinned) {
      if (active === 'pinned') return currentIndex;
      currentIndex++;
    }

    // Recent tab
    if (hasRecent) {
      if (active === 'recent') return currentIndex;
      currentIndex++;
    }

    // Featured tab
    if (hasFeatured) {
      if (active === 'featured') return currentIndex;
      currentIndex++;
    }

    // Category tabs
    if (active === 'category') {
      const selected = this.selectedCategory();
      if (!selected) return currentIndex; // "All Apps" tab
      const catIndex = this.categoriesWithAll().findIndex(
        (c) => c.id === selected,
      );
      return catIndex >= 0 ? currentIndex + catIndex : currentIndex;
    }

    return 0;
  });

  /** Filtered apps based on RBAC and search */
  filteredApps = computed(() => {
    const allApps = this.apps();
    const user = this.userContext();
    const search = this.searchQuery().toLowerCase().trim();
    const selectedCat = this.selectedCategory();
    const favoritesOnly = this.showFavoritesOnly();
    const favs = this.favorites();

    return allApps.filter((app) => {
      // 1. Check visibility based on status and permissions
      if (!this.canViewApp(app, user)) {
        return false;
      }

      // 2. Search filter
      if (search) {
        const matchesSearch =
          app.name.toLowerCase().includes(search) ||
          app.description?.toLowerCase().includes(search) ||
          app.tags?.some((tag) => tag.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      // 3. Category filter
      if (selectedCat && selectedCat !== 'all') {
        if (app.categoryId !== selectedCat) return false;
      }

      // 4. Favorites filter
      if (favoritesOnly) {
        if (!favs.includes(app.id)) return false;
      }

      return true;
    });
  });

  /** Grouped apps for display */
  groupedApps = computed<LauncherGroupedApps[]>(() => {
    const apps = this.filteredApps();
    const cats = this.categories();
    const group = this.groupBy();

    if (group === 'none' || cats.length === 0) {
      return [{ category: null, apps }];
    }

    // Group by category
    const grouped = new Map<string, LauncherApp[]>();
    const uncategorized: LauncherApp[] = [];

    apps.forEach((app) => {
      if (app.categoryId) {
        const existing = grouped.get(app.categoryId) || [];
        grouped.set(app.categoryId, [...existing, app]);
      } else {
        uncategorized.push(app);
      }
    });

    const result: LauncherGroupedApps[] = [];

    // Add categorized apps
    cats.forEach((cat) => {
      const catApps = grouped.get(cat.id);
      if (catApps && catApps.length > 0) {
        result.push({
          category: cat,
          apps: catApps.sort((a, b) => (a.order || 0) - (b.order || 0)),
        });
      }
    });

    // Add uncategorized apps
    if (uncategorized.length > 0) {
      result.push({
        category: { id: 'uncategorized', name: 'Other' },
        apps: uncategorized,
      });
    }

    return result;
  });

  // ============================================
  // CONSTRUCTOR & EFFECTS
  // ============================================

  constructor() {
    // Load favorites from localStorage
    effect(
      () => {
        const prefix = this.mergedConfig().storageKeyPrefix;
        const stored = localStorage.getItem(`${prefix}-favorites`);
        if (stored) {
          try {
            this.favorites.set(JSON.parse(stored));
          } catch {
            this.favorites.set([]);
          }
        }
      },
      { allowSignalWrites: true },
    );

    // Load recent apps from localStorage
    effect(
      () => {
        const prefix = this.mergedConfig().storageKeyPrefix;
        const stored = localStorage.getItem(`${prefix}-recent`);
        if (stored) {
          try {
            this.recentApps.set(JSON.parse(stored));
          } catch {
            this.recentApps.set([]);
          }
        }
      },
      { allowSignalWrites: true },
    );

    // Load pinned apps from localStorage
    effect(
      () => {
        const prefix = this.mergedConfig().storageKeyPrefix;
        const stored = localStorage.getItem(`${prefix}-pinned`);
        if (stored) {
          try {
            this.pinnedApps.set(JSON.parse(stored));
          } catch {
            this.pinnedApps.set([]);
          }
        }
      },
      { allowSignalWrites: true },
    );

    // Initialize view mode from config
    effect(
      () => {
        const defaultMode = this.mergedConfig().defaultViewMode;
        if (defaultMode) {
          this.viewMode.set(defaultMode);
        }
      },
      { allowSignalWrites: true },
    );

    // Initialize group by from config
    effect(
      () => {
        const defaultGroup = this.mergedConfig().defaultGroupBy;
        if (defaultGroup) {
          this.groupBy.set(defaultGroup);
        }
      },
      { allowSignalWrites: true },
    );
  }

  // ============================================
  // RBAC METHODS
  // ============================================

  /** Check if user can view an app */
  canViewApp(app: LauncherApp, user: LauncherUserContext): boolean {
    // Hidden apps are never shown
    if (app.status === 'hidden') {
      return false;
    }

    // Disabled apps only shown to admins
    if (app.status === 'disabled' || !app.enabled) {
      return user.isAdmin || false;
    }

    // Check permission config
    if (app.permission) {
      const { viewRoles, viewPermissions, canView } = app.permission;

      // Check roles (OR logic)
      if (viewRoles && viewRoles.length > 0) {
        const hasRole = viewRoles.some((role) => user.roles.includes(role));
        if (!hasRole && !user.isAdmin) {
          return false;
        }
      }

      // Check permissions (OR logic)
      if (viewPermissions && viewPermissions.length > 0) {
        const hasPermission = viewPermissions.some((perm) =>
          user.permissions.includes(perm),
        );
        if (!hasPermission && !user.isAdmin) {
          return false;
        }
      }

      // Custom check
      if (canView) {
        const result = canView();
        if (typeof result === 'boolean' && !result && !user.isAdmin) {
          return false;
        }
      }
    }

    return true;
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onCategoryChange(index: number): void {
    const hasPinned = this.pinnedApps().length > 0;
    const hasRecent =
      this.mergedConfig().enableRecent && this.recentAppsData().length > 0;
    const hasFeatured = this.hasFeaturedApps();

    let currentIndex = 0;

    // Pinned tab
    if (hasPinned) {
      if (index === currentIndex) {
        this.activeView.set('pinned');
        this.selectedCategory.set(null);
        return;
      }
      currentIndex++;
    }

    // Recent tab
    if (hasRecent) {
      if (index === currentIndex) {
        this.activeView.set('recent');
        this.selectedCategory.set(null);
        return;
      }
      currentIndex++;
    }

    // Featured tab
    if (hasFeatured) {
      if (index === currentIndex) {
        this.activeView.set('featured');
        this.selectedCategory.set(null);
        return;
      }
      currentIndex++;
    }

    // Category tabs
    const catIndex = index - currentIndex;
    const cats = this.categoriesWithAll();
    const cat = cats[catIndex];

    this.activeView.set('category');
    this.selectedCategory.set(cat?.id === 'all' ? null : cat?.id || null);
  }

  getCategoryCount(categoryId: string): number {
    if (categoryId === 'all') {
      return this.filteredApps().length;
    }
    return this.filteredApps().filter((app) => app.categoryId === categoryId)
      .length;
  }

  /** Get card size for bento grid - uses app.size or calculates based on usage */
  getCardSize(app: LauncherApp): LauncherCardSize {
    // Use explicit size if defined
    if (app.size) return app.size;

    // Auto-calculate based on usage count
    const usageCount = app.usageCount || 0;
    if (usageCount >= 100) return 'xl';
    if (usageCount >= 50) return 'lg';
    if (usageCount >= 20) return 'md';
    return 'sm';
  }

  onAppClick(event: LauncherAppClickEvent): void {
    // Add to recent
    this.addToRecent(event.app.id);
    // Emit event
    this.appClick.emit(event);
  }

  onMenuAction(event: LauncherMenuActionEvent): void {
    const { action } = event;

    // Handle built-in actions
    switch (action.id) {
      case 'open':
        this.appClick.emit({ app: event.app });
        break;
      case 'open_new_tab':
        this.appClick.emit({ app: event.app, newTab: true });
        break;
      case 'copy_link':
        this.copyAppLink(event.app);
        break;
      default:
        this.menuAction.emit(event);
    }
  }

  // ============================================
  // FAVORITES & RECENT
  // ============================================

  isFavorite(appId: string): boolean {
    return this.favorites().includes(appId);
  }

  toggleFavorite(app: LauncherApp): void {
    const favs = this.favorites();
    const newFavs = favs.includes(app.id)
      ? favs.filter((id) => id !== app.id)
      : [...favs, app.id];

    this.favorites.set(newFavs);
    this.saveFavorites(newFavs);
  }

  private saveFavorites(favs: string[]): void {
    const prefix = this.mergedConfig().storageKeyPrefix;
    localStorage.setItem(`${prefix}-favorites`, JSON.stringify(favs));
  }

  private addToRecent(appId: string): void {
    const maxRecent = this.mergedConfig().maxRecentApps || 5;
    const recent = this.recentApps();

    // Remove if already exists, add to front
    const newRecent = [appId, ...recent.filter((id) => id !== appId)].slice(
      0,
      maxRecent,
    );

    this.recentApps.set(newRecent);
    this.saveRecent(newRecent);
  }

  private saveRecent(recent: string[]): void {
    const prefix = this.mergedConfig().storageKeyPrefix;
    localStorage.setItem(`${prefix}-recent`, JSON.stringify(recent));
  }

  // ============================================
  // PINNED APPS
  // ============================================

  isPinned(appId: string): boolean {
    return this.pinnedApps().includes(appId);
  }

  togglePin(app: LauncherApp): void {
    const pinned = this.pinnedApps();
    const newPinned = pinned.includes(app.id)
      ? pinned.filter((id) => id !== app.id)
      : [...pinned, app.id];

    this.pinnedApps.set(newPinned);
    this.savePinnedApps(newPinned);
  }

  private savePinnedApps(pinned: string[]): void {
    const prefix = this.mergedConfig().storageKeyPrefix;
    localStorage.setItem(`${prefix}-pinned`, JSON.stringify(pinned));
  }

  // ============================================
  // UTILITIES
  // ============================================

  private copyAppLink(app: LauncherApp): void {
    const url =
      app.externalUrl ||
      (app.route ? `${window.location.origin}${app.route}` : '');
    if (url) {
      navigator.clipboard.writeText(url);
    }
  }
}
