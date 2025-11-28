import {
  Component,
  Input,
  ContentChild,
  TemplateRef,
  signal,
  inject,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AxDocsSidebarComponent,
  DocsNavItem,
} from './components/ax-docs-sidebar.component';
import {
  AxDocsTocComponent,
  TocItem,
} from './components/ax-docs-toc.component';
import { AxMediaWatcherService } from '../../services/ax-media-watcher.service';
import { AxLoadingBarComponent } from '../../components/ax-loading-bar.component';
import {
  LoadingBarService,
  LoadingBarState,
} from '../../components/feedback/loading-bar/loading-bar.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * Documentation Layout Component
 *
 * Three-column layout for documentation pages:
 * - Left: Fixed sidebar navigation (Shadcn/ui style)
 * - Center: Scrollable content area
 * - Right: Fixed table of contents
 *
 * Features:
 * - Responsive design (hides TOC on tablet, sidebar on mobile)
 * - Fixed sidebar and TOC (content scrolls independently)
 * - Mobile hamburger menu
 * - Preserves existing header
 */
@Component({
  selector: 'ax-docs-layout',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    AxDocsSidebarComponent,
    AxDocsTocComponent,
    AxLoadingBarComponent,
  ],
  template: `
    <!-- Loading bar - Connected to LoadingBarService -->
    <ax-loading-bar
      [visible]="loadingBarState().visible"
      [mode]="loadingBarState().mode"
      [progress]="loadingBarState().progress"
      [color]="loadingBarState().color"
    ></ax-loading-bar>

    <!-- Header/Toolbar - Fixed at top (Tremor style) -->
    @if (showHeader) {
      <header class="ax-docs-header">
        <!-- Left: Logo -->
        <div class="ax-docs-header__left">
          @if (isMobile()) {
            <button
              mat-icon-button
              class="ax-docs-header__menu-btn"
              (click)="toggleSidebar()"
              aria-label="Toggle navigation"
            >
              <mat-icon>{{ sidebarOpen() ? 'close' : 'menu' }}</mat-icon>
            </button>
          }
          <a class="ax-docs-header__logo" [routerLink]="headerLogoLink">
            <span class="ax-docs-header__logo-text">{{ appName }}</span>
          </a>
        </div>

        <!-- Right: Actions -->
        <div class="ax-docs-header__actions">
          @if (headerActions) {
            <ng-container *ngTemplateOutlet="headerActions"></ng-container>
          } @else {
            <button mat-icon-button aria-label="Search">
              <mat-icon>search</mat-icon>
            </button>
            <a
              mat-icon-button
              [href]="githubUrl"
              target="_blank"
              aria-label="GitHub"
            >
              <mat-icon>code</mat-icon>
            </a>
          }
        </div>
      </header>
    }

    <!-- Main Layout Container -->
    <div
      class="ax-docs-layout"
      [class.ax-docs-layout--sidebar-open]="sidebarOpen()"
      [class.ax-docs-layout--has-header]="showHeader"
    >
      <!-- Sidebar Overlay (mobile) -->
      @if (isMobile() && sidebarOpen()) {
        <div
          class="ax-docs-layout__overlay"
          (click)="closeSidebar()"
          (keydown.escape)="closeSidebar()"
          role="button"
          tabindex="0"
          aria-label="Close sidebar"
        ></div>
      }

      <!-- Sidebar -->
      <aside
        class="ax-docs-layout__sidebar"
        [class.ax-docs-layout__sidebar--open]="sidebarOpen()"
        [class.ax-docs-layout__sidebar--has-header]="showHeader"
      >
        <!-- Sidebar Header (optional) -->
        @if (sidebarHeader) {
          <div class="ax-docs-layout__sidebar-header">
            <ng-container *ngTemplateOutlet="sidebarHeader"></ng-container>
          </div>
        }

        <ax-docs-sidebar [navigation]="navigation"></ax-docs-sidebar>

        <!-- Sidebar Footer (optional) -->
        @if (sidebarFooter) {
          <div class="ax-docs-layout__sidebar-footer">
            <ng-container *ngTemplateOutlet="sidebarFooter"></ng-container>
          </div>
        }
      </aside>

      <!-- Main Content Area -->
      <main class="ax-docs-layout__main">
        <div class="ax-docs-layout__content docs-content">
          <ng-content select="router-outlet, [docsContent]"></ng-content>
          <ng-content></ng-content>
        </div>

        <!-- Table of Contents (hidden on mobile/tablet) -->
        @if (showToc && !isMobile() && !isTablet()) {
          <aside class="ax-docs-layout__toc">
            <ax-docs-toc
              [contentSelector]="tocContentSelector"
              [manualItems]="tocItems"
              [scrollOffset]="tocScrollOffset"
            ></ax-docs-toc>
          </aside>
        }
      </main>
    </div>
  `,
  styles: [
    `
      ax-docs-layout {
        --ax-docs-sidebar-width: 280px;
        --ax-docs-toc-width: 220px;
        --ax-docs-header-height: 64px;
        display: block;
        min-height: 100vh;
      }

      /* Header - Tremor style (clean & minimal) */
      ax-docs-layout > .ax-docs-header {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: var(--ax-docs-header-height) !important;
        background-color: var(--ax-background-default, #ffffff) !important;
        border-bottom: 1px solid var(--ax-border-default, #e5e7eb) !important;
        z-index: 100 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 1.25rem !important;
        box-sizing: border-box !important;
      }

      ax-docs-layout .ax-docs-header__left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      ax-docs-layout .ax-docs-header__logo {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: inherit;
      }

      ax-docs-layout .ax-docs-header__menu-btn {
        flex-shrink: 0;
      }

      ax-docs-layout .ax-docs-header__logo-text {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ax-text-default, #111827);
        letter-spacing: -0.025em;
      }

      ax-docs-layout .ax-docs-header__actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      ax-docs-layout .ax-docs-header__actions button,
      ax-docs-layout .ax-docs-header__actions a {
        color: var(--ax-text-secondary, #6b7280);
      }

      ax-docs-layout .ax-docs-header__actions button:hover,
      ax-docs-layout .ax-docs-header__actions a:hover {
        color: var(--ax-text-default, #111827);
      }

      /* Main Layout */
      ax-docs-layout .ax-docs-layout {
        display: flex;
        min-height: 100vh;
        background-color: var(--ax-background-default, #ffffff);
      }

      ax-docs-layout .ax-docs-layout--has-header {
        padding-top: var(--ax-docs-header-height);
      }

      /* Overlay for mobile */
      ax-docs-layout .ax-docs-layout__overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 998;
        animation: axDocsFadeIn 200ms ease;
      }

      @keyframes axDocsFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      /* Sidebar */
      ax-docs-layout .ax-docs-layout__sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: var(--ax-docs-sidebar-width);
        background-color: var(--ax-background-default, #ffffff);
        border-right: 1px solid var(--ax-border-default, #e5e7eb);
        display: flex;
        flex-direction: column;
        z-index: 999;
        overflow-y: auto;
        overflow-x: hidden;
        transition: transform 300ms ease;
      }

      ax-docs-layout .ax-docs-layout__sidebar--has-header {
        top: var(--ax-docs-header-height);
      }

      ax-docs-layout .ax-docs-layout__sidebar-header {
        padding: 0.75rem;
        border-bottom: 1px solid var(--ax-border-default, #e5e7eb);
      }

      ax-docs-layout .ax-docs-layout__sidebar-footer {
        margin-top: auto;
        padding: 0.75rem;
        border-top: 1px solid var(--ax-border-default, #e5e7eb);
      }

      /* Main Content */
      ax-docs-layout .ax-docs-layout__main {
        flex: 1;
        display: flex;
        margin-left: var(--ax-docs-sidebar-width);
        min-width: 0;
      }

      ax-docs-layout .ax-docs-layout__content {
        flex: 1;
        padding: 2rem;
        min-width: 0;
        max-width: 100%;
      }

      /* Table of Contents */
      ax-docs-layout .ax-docs-layout__toc {
        width: var(--ax-docs-toc-width);
        flex-shrink: 0;
        padding-top: 1rem;
        position: sticky;
        top: calc(var(--ax-docs-header-height) + 1rem);
        height: fit-content;
        max-height: calc(100vh - var(--ax-docs-header-height) - 2rem);
        overflow-y: auto;
      }

      /* Responsive: Tablet (hide TOC) */
      @media (max-width: 1024px) {
        ax-docs-layout {
          --ax-docs-toc-width: 0;
        }

        ax-docs-layout .ax-docs-layout__toc {
          display: none;
        }
      }

      /* Responsive: Mobile (hide sidebar by default) */
      @media (max-width: 768px) {
        ax-docs-layout {
          --ax-docs-sidebar-width: 280px;
        }

        ax-docs-layout > .ax-docs-header {
          padding: 0 1rem !important;
        }

        ax-docs-layout .ax-docs-layout__sidebar {
          transform: translateX(-100%);
          top: 0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        ax-docs-layout .ax-docs-layout__sidebar--open {
          transform: translateX(0);
        }

        ax-docs-layout .ax-docs-layout__main {
          margin-left: 0;
        }

        ax-docs-layout .ax-docs-layout__content {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class AxDocsLayoutComponent implements OnInit, OnDestroy {
  /** Navigation items for sidebar */
  @Input() navigation: DocsNavItem[] = [];

  /** Show header bar */
  @Input() showHeader = true;

  /** Application name for header */
  @Input() appName = 'AegisX Design System';

  /** Header logo link */
  @Input() headerLogoLink = '/docs/getting-started/introduction';

  /** GitHub URL for header */
  @Input() githubUrl = 'https://github.com/anthropics/claude-code';

  /** Show table of contents */
  @Input() showToc = true;

  /** CSS selector for content to scan for TOC headings */
  @Input() tocContentSelector = '.docs-content';

  /** Manual TOC items (optional, otherwise auto-generated) */
  @Input() tocItems: TocItem[] = [];

  /** Scroll offset for TOC */
  @Input() tocScrollOffset = 80;

  /** Custom header title template */
  @ContentChild('headerTitle') headerTitle?: TemplateRef<unknown>;

  /** Custom header actions template */
  @ContentChild('headerActions') headerActions?: TemplateRef<unknown>;

  /** Custom sidebar header template */
  @ContentChild('sidebarHeader') sidebarHeader?: TemplateRef<unknown>;

  /** Custom sidebar footer template */
  @ContentChild('sidebarFooter') sidebarFooter?: TemplateRef<unknown>;

  private _mediaWatcher = inject(AxMediaWatcherService);
  private _loadingBarService = inject(LoadingBarService);
  private _destroy$ = new Subject<void>();

  // Expose loading bar state as a signal for reactive template binding
  protected readonly loadingBarState = toSignal(
    this._loadingBarService.state$,
    {
      initialValue: {
        visible: false,
        mode: 'indeterminate' as const,
        progress: 0,
        color: 'primary' as const,
      } satisfies LoadingBarState,
    },
  );

  sidebarOpen = signal(false);
  isMobile = signal(false);
  isTablet = signal(false);

  ngOnInit(): void {
    // Check initial screen size
    this.checkScreenSize();

    // Watch for screen size changes
    this._mediaWatcher.onMediaChange$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.checkScreenSize();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private checkScreenSize(): void {
    const width = window.innerWidth;
    this.isMobile.set(width < 768);
    this.isTablet.set(width >= 768 && width < 1024);

    // Auto-close sidebar when switching to desktop
    if (width >= 768) {
      this.sidebarOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
