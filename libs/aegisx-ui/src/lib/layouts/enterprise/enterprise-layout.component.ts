import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  computed,
  signal,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AxLoadingBarComponent } from '../../components/feedback/loading-bar/loading-bar.component';
import { AxNavigationItem } from '../../types/ax-navigation.types';
import {
  EnterpriseAppThemeInput,
  EnterpriseAppThemeOverride,
  EnterpriseAppTheme,
  resolveEnterpriseTheme,
  generateThemeCSSVariables,
} from './enterprise-theme.types';

/**
 * Enterprise Layout Component
 *
 * A full-width layout with horizontal navigation only (no sidebar).
 * Ideal for applications that need maximum horizontal space.
 *
 * Features:
 * - Horizontal primary navigation in header
 * - Optional sub-navigation tabs
 * - Full-width content area
 * - Customizable header actions
 * - Loading bar integration
 * - **App-specific theming** with preset themes and custom overrides
 *
 * @example Basic usage
 * ```html
 * <ax-enterprise-layout
 *   [appName]="'My Enterprise App'"
 *   [navigation]="navItems"
 * >
 *   <router-outlet></router-outlet>
 * </ax-enterprise-layout>
 * ```
 *
 * @example With preset theme
 * ```html
 * <ax-enterprise-layout
 *   [appName]="'Hospital Information System'"
 *   [appTheme]="'medical'"
 *   [navigation]="navItems"
 * >
 *   <router-outlet></router-outlet>
 * </ax-enterprise-layout>
 * ```
 *
 * @example With theme override
 * ```html
 * <ax-enterprise-layout
 *   [appName]="'Custom App'"
 *   [appTheme]="'finance'"
 *   [themeOverrides]="{ headerBg: '#1a1a2e', primary: '#16a34a' }"
 * >
 *   <router-outlet></router-outlet>
 * </ax-enterprise-layout>
 * ```
 *
 * Available preset themes:
 * - `default` - Indigo/Slate (default AegisX)
 * - `medical` - Cyan/Teal (Healthcare/HIS)
 * - `finance` - Teal/Amber (Banking/Finance)
 * - `inventory` - Violet/Orange (Warehouse/Inventory)
 * - `hr` - Pink/Purple (Human Resources)
 * - `education` - Blue/Emerald (LMS/Education)
 * - `retail` - Orange/Lime (POS/Retail)
 * - `manufacturing` - Slate/Yellow (MES/Manufacturing)
 * - `logistics` - Emerald/Sky (TMS/Logistics)
 */
@Component({
  selector: 'ax-enterprise-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    MatTooltipModule,
    MatDividerModule,
    AxLoadingBarComponent,
  ],
  template: `
    <div class="ax-enterprise-layout" [class.has-app-theme]="hasAppTheme()">
      <!-- Loading Bar -->
      <ax-loading-bar variant="primary" />

      <!-- Header -->
      <header
        class="ax-enterprise-header"
        [class.dark-header]="headerTheme === 'dark'"
        [class.themed-header]="hasAppTheme()"
      >
        <div class="ax-enterprise-header-primary">
          <div class="ax-enterprise-header-container">
            <!-- Brand -->
            <div class="ax-enterprise-brand">
              @if (logoUrl) {
                <img
                  [src]="logoUrl"
                  [alt]="appName"
                  class="ax-enterprise-logo"
                />
              } @else {
                <div class="ax-enterprise-logo-placeholder">
                  <mat-icon>widgets</mat-icon>
                </div>
              }
              <span class="ax-enterprise-brand-text">{{ appName }}</span>
            </div>

            <!-- Primary Navigation (Desktop) -->
            @if (navigation.length > 0 && !showSubNavAsTabs) {
              <nav class="ax-enterprise-primary-nav">
                @for (item of navigation; track item.id) {
                  @if (!item.children || item.children.length === 0) {
                    <a
                      [routerLink]="item.link"
                      routerLinkActive="active"
                      [routerLinkActiveOptions]="{
                        exact: item.exactMatch ?? false,
                      }"
                      class="ax-enterprise-nav-link"
                      [class.disabled]="item.disabled"
                    >
                      @if (item.icon) {
                        <mat-icon>{{ item.icon }}</mat-icon>
                      }
                      <span>{{ item.title }}</span>
                      @if (item.badge) {
                        <span
                          class="ax-enterprise-badge"
                          [class]="'badge-' + (item.badgeColor || 'primary')"
                        >
                          {{ item.badge }}
                        </span>
                      }
                    </a>
                  } @else {
                    <button
                      mat-button
                      [matMenuTriggerFor]="navMenu"
                      class="ax-enterprise-nav-link"
                      [class.disabled]="item.disabled"
                    >
                      @if (item.icon) {
                        <mat-icon>{{ item.icon }}</mat-icon>
                      }
                      <span>{{ item.title }}</span>
                      <mat-icon class="dropdown-arrow"
                        >arrow_drop_down</mat-icon
                      >
                    </button>
                    <mat-menu #navMenu="matMenu">
                      @for (child of item.children; track child.id) {
                        <a mat-menu-item [routerLink]="child.link">
                          @if (child.icon) {
                            <mat-icon>{{ child.icon }}</mat-icon>
                          }
                          <span>{{ child.title }}</span>
                        </a>
                      }
                    </mat-menu>
                  }
                }
              </nav>
            }

            <!-- Spacer -->
            <div class="ax-enterprise-spacer"></div>

            <!-- Search (Optional) -->
            @if (showSearch) {
              <div class="ax-enterprise-search">
                <button
                  mat-icon-button
                  [matTooltip]="'Search'"
                  (click)="searchClicked.emit()"
                >
                  <mat-icon>search</mat-icon>
                </button>
              </div>
            }

            <!-- Header Actions (Custom) -->
            @if (headerActions) {
              <div class="ax-enterprise-header-actions">
                <ng-container [ngTemplateOutlet]="headerActions" />
              </div>
            }

            <!-- User Menu -->
            @if (userMenu) {
              <ng-container [ngTemplateOutlet]="userMenu" />
            } @else if (showDefaultUserMenu) {
              <button
                mat-icon-button
                [matMenuTriggerFor]="defaultUserMenu"
                [matTooltip]="'Account'"
              >
                <mat-icon>account_circle</mat-icon>
              </button>
              <mat-menu #defaultUserMenu="matMenu">
                <button mat-menu-item>
                  <mat-icon>person</mat-icon>
                  <span>Profile</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>settings</mat-icon>
                  <span>Settings</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logoutClicked.emit()">
                  <mat-icon>logout</mat-icon>
                  <span>Sign out</span>
                </button>
              </mat-menu>
            }
          </div>
        </div>

        <!-- Sub Navigation (Tabs) -->
        @if (showSubNavAsTabs && navigation.length > 0) {
          <div class="ax-enterprise-subnav">
            <div class="ax-enterprise-subnav-container">
              <nav
                mat-tab-nav-bar
                [tabPanel]="tabPanel"
                class="ax-enterprise-tabs"
              >
                @for (item of navigation; track item.id) {
                  <a
                    mat-tab-link
                    [routerLink]="item.link"
                    routerLinkActive
                    [routerLinkActiveOptions]="{
                      exact: item.exactMatch ?? false,
                    }"
                    #rla="routerLinkActive"
                    [active]="rla.isActive"
                    [disabled]="item.disabled || false"
                  >
                    @if (item.icon) {
                      <mat-icon class="tab-icon">{{ item.icon }}</mat-icon>
                    }
                    {{ item.title }}
                    @if (item.badge) {
                      <span
                        class="ax-enterprise-badge tab-badge"
                        [class]="'badge-' + (item.badgeColor || 'primary')"
                      >
                        {{ item.badge }}
                      </span>
                    }
                  </a>
                }
              </nav>
            </div>
          </div>
        }
        @if (subNavigation.length > 0) {
          <div class="ax-enterprise-subnav">
            <div class="ax-enterprise-subnav-container">
              <nav
                mat-tab-nav-bar
                [tabPanel]="tabPanel"
                class="ax-enterprise-tabs"
              >
                @for (item of subNavigation; track item.id) {
                  <a
                    mat-tab-link
                    [routerLink]="item.link"
                    routerLinkActive
                    [routerLinkActiveOptions]="{
                      exact: item.exactMatch ?? false,
                    }"
                    #rla="routerLinkActive"
                    [active]="rla.isActive"
                    [disabled]="item.disabled || false"
                  >
                    @if (item.icon) {
                      <mat-icon class="tab-icon">{{ item.icon }}</mat-icon>
                    }
                    {{ item.title }}
                    @if (item.badge) {
                      <span
                        class="ax-enterprise-badge tab-badge"
                        [class]="'badge-' + (item.badgeColor || 'primary')"
                      >
                        {{ item.badge }}
                      </span>
                    }
                  </a>
                }
              </nav>
            </div>
          </div>
        }
        <mat-tab-nav-panel #tabPanel></mat-tab-nav-panel>
      </header>

      <!-- Main Content -->
      <main
        class="ax-enterprise-main"
        [class.has-subnav]="subNavigation.length > 0 || showSubNavAsTabs"
        [class.bg-gray]="contentBackground === 'gray'"
      >
        <div
          class="ax-enterprise-content"
          [class.full-width]="fullWidth"
          [class.contained]="!fullWidth"
        >
          <ng-content></ng-content>
        </div>
      </main>

      <!-- Footer (Optional) -->
      @if (showFooter) {
        <footer class="ax-enterprise-footer">
          <div class="ax-enterprise-footer-container">
            @if (footerContent) {
              <ng-container [ngTemplateOutlet]="footerContent" />
            } @else {
              <span class="ax-enterprise-footer-text">
                © {{ currentYear }} {{ appName }}. All rights reserved.
              </span>
            }
          </div>
        </footer>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1 1 auto;
        width: 100%;
        height: 100%;
      }

      .ax-enterprise-layout {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-height: 100vh;
        background: var(--ax-background-default);
      }

      /* Header */
      .ax-enterprise-header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: var(--ax-background-surface);
        border-bottom: 1px solid var(--ax-border-default);
      }

      .ax-enterprise-header-primary {
        background: var(--ax-surface-elevated);
        border-bottom: 1px solid var(--ax-border-subtle);
      }

      /* Dark Header Theme */
      .ax-enterprise-header.dark-header {
        background: #0b1622;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .ax-enterprise-header-primary {
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ax-enterprise-logo-placeholder {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .ax-enterprise-brand-text {
          color: white;
        }

        .ax-enterprise-nav-link {
          color: rgba(255, 255, 255, 0.7);

          &:hover {
            color: white;
            background: rgba(255, 255, 255, 0.1);
          }

          &.active {
            color: white;
            background: rgba(255, 255, 255, 0.15);
          }

          .dropdown-arrow {
            color: rgba(255, 255, 255, 0.5);
          }
        }

        .ax-enterprise-header-actions button,
        .ax-enterprise-search button,
        .ax-enterprise-header-container > button {
          color: rgba(255, 255, 255, 0.8);

          mat-icon {
            color: rgba(255, 255, 255, 0.8);
          }

          &:hover {
            color: white;
            background: rgba(255, 255, 255, 0.1);

            mat-icon {
              color: white;
            }
          }
        }

        .ax-enterprise-subnav {
          background: #0b1622;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);

          .mat-mdc-tab-link {
            color: rgba(255, 255, 255, 0.7) !important;

            &.mdc-tab--active {
              color: white !important;
            }
          }

          .mdc-tab-indicator__content--underline {
            border-color: var(--ax-brand-default) !important;
          }
        }
      }

      /* App-Specific Themed Header (uses CSS variables from theme) */
      .ax-enterprise-header.themed-header {
        background: var(--ax-enterprise-header-bg);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .ax-enterprise-header-primary {
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ax-enterprise-logo-placeholder {
          background: var(--ax-enterprise-logo-bg);
          color: var(--ax-enterprise-logo-color);
        }

        .ax-enterprise-brand-text {
          color: var(--ax-enterprise-header-text-hover);
        }

        .ax-enterprise-nav-link {
          color: var(--ax-enterprise-header-text);

          &:hover {
            color: var(--ax-enterprise-header-text-hover);
            background: rgba(255, 255, 255, 0.1);
          }

          &.active {
            color: var(--ax-enterprise-header-text-hover);
            background: var(--ax-enterprise-header-active-bg);
          }

          .dropdown-arrow {
            color: var(--ax-enterprise-header-text);
          }
        }

        .ax-enterprise-header-actions button,
        .ax-enterprise-search button,
        .ax-enterprise-header-container > button {
          color: var(--ax-enterprise-header-text);

          mat-icon {
            color: var(--ax-enterprise-header-text);
          }

          &:hover {
            color: var(--ax-enterprise-header-text-hover);
            background: rgba(255, 255, 255, 0.1);

            mat-icon {
              color: var(--ax-enterprise-header-text-hover);
            }
          }
        }

        .ax-enterprise-subnav {
          background: var(--ax-enterprise-subnav-bg);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);

          .mat-mdc-tab-link {
            color: var(--ax-enterprise-header-text) !important;

            &.mdc-tab--active {
              color: var(--ax-enterprise-header-text-hover) !important;
            }
          }

          .mdc-tab-indicator__content--underline {
            border-color: var(--ax-enterprise-tab-indicator) !important;
          }
        }

        .ax-enterprise-badge {
          &.badge-primary {
            background: var(--ax-enterprise-badge-primary);
            color: white;
          }

          &.badge-accent {
            background: var(--ax-enterprise-badge-accent);
            color: white;
          }
        }
      }

      .ax-enterprise-header-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 1600px;
        margin: 0 auto;
        padding: 0 1.5rem;
        height: 64px;
      }

      /* Brand */
      .ax-enterprise-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-shrink: 0;
      }

      .ax-enterprise-logo {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }

      .ax-enterprise-logo-placeholder {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ax-brand-default);
        border-radius: var(--ax-radius-sm);
        color: white;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .ax-enterprise-brand-text {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ax-text-heading);

        @media (max-width: 640px) {
          display: none;
        }
      }

      /* Primary Navigation */
      .ax-enterprise-primary-nav {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-left: 2rem;

        @media (max-width: 1024px) {
          display: none;
        }
      }

      .ax-enterprise-nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ax-text-secondary);
        text-decoration: none;
        border-radius: var(--ax-radius-md);
        transition: all 0.15s ease;
        background: transparent;
        border: none;
        cursor: pointer;

        &:hover {
          color: var(--ax-text-heading);
          background: var(--ax-background-muted);
        }

        &.active {
          color: var(--ax-brand-default);
          background: var(--ax-brand-faint);
        }

        &.disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        .dropdown-arrow {
          margin-left: -0.25rem;
          margin-right: -0.5rem;
        }
      }

      /* Spacer */
      .ax-enterprise-spacer {
        flex: 1;
      }

      /* Search & Actions */
      .ax-enterprise-search,
      .ax-enterprise-header-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* Badge */
      .ax-enterprise-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 0.375rem;
        font-size: 0.6875rem;
        font-weight: 600;
        border-radius: var(--ax-radius-full);
        line-height: 1;

        &.badge-primary {
          background: var(--ax-brand-default);
          color: white;
        }

        &.badge-accent {
          background: var(--ax-info-default);
          color: white;
        }

        &.badge-warn {
          background: var(--ax-warning-default);
          color: var(--ax-warning-950);
        }
      }

      /* Sub Navigation */
      .ax-enterprise-subnav {
        background: var(--ax-background-surface);
        border-bottom: 1px solid var(--ax-border-default);
      }

      .ax-enterprise-subnav-container {
        max-width: 1600px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }

      .ax-enterprise-tabs {
        border-bottom: none !important;

        .tab-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          margin-right: 0.5rem;
        }

        .tab-badge {
          margin-left: 0.5rem;
        }
      }

      /* Main Content */
      .ax-enterprise-main {
        flex: 1;
        overflow-y: auto;
        background: var(--ax-background-default);

        &.bg-gray {
          background: var(--ax-background-subtle);
        }
      }

      .ax-enterprise-content {
        min-height: 100%;

        &.contained {
          max-width: 1600px;
          margin: 0 auto;
          padding: 1.5rem;

          @media (min-width: 768px) {
            padding: 2rem;
          }
        }

        &.full-width {
          width: 100%;
          padding: 0;
        }
      }

      /* Footer */
      .ax-enterprise-footer {
        background: var(--ax-background-surface);
        border-top: 1px solid var(--ax-border-default);
      }

      .ax-enterprise-footer-container {
        max-width: 1600px;
        margin: 0 auto;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .ax-enterprise-footer-text {
        font-size: 0.875rem;
        color: var(--ax-text-subtle);
      }
    `,
  ],
})
export class EnterpriseLayoutComponent {
  // App Configuration
  @Input() appName = 'Enterprise App';
  @Input() logoUrl: string | null = null;
  @Input() showFooter = true;
  @Input() fullWidth = false;
  @Input() showSearch = true;
  @Input() showDefaultUserMenu = true;
  @Input() headerTheme: 'light' | 'dark' = 'light';
  @Input() contentBackground: 'white' | 'gray' = 'white';

  // Theme Configuration
  @Input() set appTheme(value: EnterpriseAppThemeInput | undefined) {
    this._appTheme.set(value);
  }
  @Input() set themeOverrides(value: EnterpriseAppThemeOverride | undefined) {
    this._themeOverrides.set(value);
  }

  // Navigation
  @Input() navigation: AxNavigationItem[] = [];
  @Input() subNavigation: AxNavigationItem[] = [];
  @Input() showSubNavAsTabs = false;

  // Events
  @Output() searchClicked = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  // Content Projections
  @ContentChild('headerActions') headerActions!: TemplateRef<unknown>;
  @ContentChild('userMenu') userMenu!: TemplateRef<unknown>;
  @ContentChild('footerContent') footerContent!: TemplateRef<unknown>;

  currentYear = new Date().getFullYear();

  // Theme signals
  private readonly _appTheme = signal<EnterpriseAppThemeInput | undefined>(
    undefined,
  );
  private readonly _themeOverrides = signal<
    EnterpriseAppThemeOverride | undefined
  >(undefined);

  // Computed resolved theme
  protected readonly resolvedTheme = computed<EnterpriseAppTheme>(() => {
    return resolveEnterpriseTheme(this._appTheme(), this._themeOverrides());
  });

  // Check if using app theme (dark header is applied automatically)
  protected readonly hasAppTheme = computed(() => !!this._appTheme());

  // Computed CSS variables string for host binding
  protected readonly themeStyles = computed(() => {
    if (!this._appTheme()) {
      return '';
    }
    const theme = this.resolvedTheme();
    const cssVars = generateThemeCSSVariables(theme);
    return Object.entries(cssVars)
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');
  });

  // Apply CSS variables via host binding
  @HostBinding('style')
  get hostStyles(): string {
    return this.themeStyles();
  }
}
