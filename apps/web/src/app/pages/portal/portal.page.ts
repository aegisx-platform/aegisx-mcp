import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import {
  AxLauncherComponent,
  AxThemeSwitcherComponent,
  AxEnterpriseLayoutComponent,
  LauncherApp,
  LauncherAppClickEvent,
  LauncherMenuActionEvent,
  LauncherUserContext,
  LauncherConfig,
  LauncherLayoutChangeEvent,
  EnterprisePresetTheme,
} from '@aegisx/ui';
import { AuthService } from '../../core/auth';
import { MultiAppService } from '../../shared/multi-app';
import {
  PORTAL_APPS,
  PORTAL_CATEGORIES,
  PORTAL_CONFIG,
  FEATURED_APPS_LAYOUT,
} from './portal.config';

/**
 * Enterprise Portal Page
 *
 * Main landing page that displays all enterprise applications
 * using the ax-launcher component. Users can:
 * - Search for apps
 * - Filter by category
 * - Pin/favorite apps
 * - Customize layout (drag and drop)
 * - Quick access to recent apps
 */
@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    AxLauncherComponent,
    AxThemeSwitcherComponent,
    AxEnterpriseLayoutComponent,
  ],
  template: `
    <ax-enterprise-layout
      [appName]="'AegisX Portal'"
      [appTheme]="appTheme"
      [showFooter]="true"
      [contentBackground]="'gray'"
      (logoutClicked)="logout()"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
        <!-- Theme Switcher -->
        <ax-theme-switcher mode="dropdown"></ax-theme-switcher>

        <!-- Notifications -->
        <button mat-icon-button matTooltip="Notifications">
          <mat-icon [matBadge]="3" matBadgeColor="warn" matBadgeSize="small">
            notifications
          </mat-icon>
        </button>
      </ng-template>

      <!-- Main Content -->
      <div class="portal-content">
        <ax-launcher
          [apps]="filteredApps()"
          [categories]="categories"
          [userContext]="userContext()"
          [config]="config"
          [title]="'Applications'"
          [subtitle]="'Access your enterprise applications'"
          (appClick)="onAppClick($event)"
          (menuAction)="onMenuAction($event)"
          (layoutChange)="onLayoutChange($event)"
        >
          <!-- Footer -->
          <div launcherFooter class="portal-footer">
            <span>AegisX Platform v1.0.0</span>
            <span class="portal-footer__separator">|</span>
            <span>{{ currentDate | date: 'EEEE, MMMM d, y' }}</span>
          </div>
        </ax-launcher>
      </div>

      <!-- Footer Content -->
      <ng-template #footerContent>
        <span>AegisX Platform</span>
        <span class="footer-version">v1.0.0</span>
      </ng-template>
    </ax-enterprise-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      /* Main Content */
      .portal-content {
        padding: 2rem;
        max-width: 1600px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      }

      /* Footer inside launcher */
      .portal-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        padding: 1.5rem;
        font-size: 0.8125rem;
        color: var(--ax-text-muted, #6b7280);
        border-top: 1px solid var(--ax-border-default, #e5e7eb);
        margin-top: 2rem;
      }

      .portal-footer__separator {
        color: var(--ax-border-default, #d1d5db);
      }

      .footer-version {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
        margin-left: 0.5rem;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .portal-content {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class PortalPage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly multiAppService = inject(MultiAppService);

  // Configuration
  readonly appTheme: EnterprisePresetTheme = 'default';
  readonly categories = PORTAL_CATEGORIES;
  readonly config: LauncherConfig = PORTAL_CONFIG;
  readonly currentDate = new Date();

  // Apps with layout positions applied
  // Combines static PORTAL_APPS with dynamic registered apps from MultiAppService
  private readonly _apps = signal<LauncherApp[]>(
    this.applyFeaturedLayout(PORTAL_APPS),
  );

  // Apps registered with MultiAppService (converted to LauncherApp format)
  readonly registeredApps = computed(() => {
    return this.multiAppService.getAppsAsLauncherFormat();
  });

  // User context for RBAC
  readonly userContext = computed<LauncherUserContext>(() => {
    const user = this.authService.currentUser();
    return {
      roles: user?.roles || (user?.role ? [user.role] : []),
      permissions: user?.permissions || [],
      isAdmin:
        user?.role === 'admin' || user?.roles?.includes('admin') || false,
    };
  });

  // User info
  readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      : 'Guest';
  });

  readonly userEmail = computed(() => {
    const user = this.authService.currentUser();
    return user?.email || '';
  });

  // Filter apps based on user permissions (basic implementation)
  readonly filteredApps = computed(() => {
    const context = this.userContext();
    const apps = this._apps();

    // For now, return all apps (RBAC filtering happens in ax-launcher)
    // Add custom filtering logic here if needed
    return apps;
  });

  ngOnInit(): void {
    // Load saved layout from localStorage if available
    this.loadSavedLayout();
  }

  /**
   * Apply featured layout positions to apps
   */
  private applyFeaturedLayout(apps: LauncherApp[]): LauncherApp[] {
    return apps.map((app) => {
      const layout = FEATURED_APPS_LAYOUT.find((l) => l.id === app.id);
      if (layout) {
        return {
          ...app,
          x: layout.x,
          y: layout.y,
          cols: layout.cols,
          rows: layout.rows,
        };
      }
      return app;
    });
  }

  /**
   * Load saved layout from localStorage
   */
  private loadSavedLayout(): void {
    const prefix = this.config.storageKeyPrefix || 'aegisx-portal';
    const savedLayout = localStorage.getItem(`${prefix}-layout`);

    if (savedLayout) {
      try {
        const layout = JSON.parse(savedLayout);
        const apps = this._apps();

        const updatedApps = apps.map((app) => {
          const savedPosition = layout.find(
            (l: { id: string }) => l.id === app.id,
          );
          if (savedPosition) {
            return {
              ...app,
              x: savedPosition.x,
              y: savedPosition.y,
              cols: savedPosition.cols,
              rows: savedPosition.rows,
            };
          }
          return app;
        });

        this._apps.set(updatedApps);
      } catch (e) {
        console.error('Failed to load saved layout:', e);
      }
    }
  }

  /**
   * Handle app click - navigate to app route
   */
  onAppClick(event: LauncherAppClickEvent): void {
    const { app, newTab } = event;

    if (app.externalUrl) {
      // External URL - open in new tab
      window.open(app.externalUrl, '_blank');
    } else if (app.route) {
      if (newTab) {
        // Open in new tab
        const url = window.location.origin + app.route;
        window.open(url, '_blank');
      } else {
        // Navigate to route
        this.router.navigate([app.route]);
      }
    }
  }

  /**
   * Handle menu actions
   */
  onMenuAction(event: LauncherMenuActionEvent): void {
    const { app, action } = event;

    switch (action.id) {
      case 'settings':
        // Navigate to app settings if available
        if (app.route) {
          this.router.navigate([app.route, 'settings']);
        }
        break;

      default:
        console.log('Menu action:', action.id, 'for app:', app.id);
    }
  }

  /**
   * Handle layout change (drag & drop)
   */
  onLayoutChange(event: LauncherLayoutChangeEvent): void {
    // Layout is automatically saved by ax-launcher
    console.log('Layout changed:', event.layout.length, 'items');
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        // Force navigate to login even on error
        this.router.navigate(['/login']);
      },
    });
  }
}
