import { Injectable, computed, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AxNavigationItem } from '@aegisx/ui';
import {
  AppConfig,
  SubAppConfig,
  ActiveAppContext,
  AppRegistryEntry,
  HeaderAction,
} from './multi-app.types';

/**
 * Multi-App Service
 *
 * Manages app registration, navigation switching, and active context
 * based on current route.
 *
 * @example
 * ```typescript
 * const multiAppService = inject(MultiAppService);
 *
 * // Register an app
 * multiAppService.registerApp(inventoryConfig);
 *
 * // Get current context
 * const context = multiAppService.activeContext();
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class MultiAppService {
  private readonly router = inject(Router);

  // Registry of all apps
  private readonly _registry = signal<Map<string, AppRegistryEntry>>(new Map());

  // Current active app ID
  private readonly _activeAppId = signal<string | null>(null);

  // Current active sub-app ID
  private readonly _activeSubAppId = signal<string | null>(null);

  // Computed: All registered apps
  readonly apps = computed(() => {
    const registry = this._registry();
    return Array.from(registry.values())
      .filter((entry) => entry.enabled)
      .sort((a, b) => a.order - b.order)
      .map((entry) => entry.config);
  });

  // Computed: Active app config
  readonly activeApp = computed(() => {
    const appId = this._activeAppId();
    if (!appId) return null;
    return this._registry().get(appId)?.config || null;
  });

  // Computed: Active sub-app config
  readonly activeSubApp = computed(() => {
    const app = this.activeApp();
    const subAppId = this._activeSubAppId();
    if (!app || !subAppId) return null;
    return app.subApps.find((s) => s.id === subAppId) || null;
  });

  // Computed: Current navigation items
  readonly currentNavigation = computed<AxNavigationItem[]>(() => {
    const subApp = this.activeSubApp();
    return subApp?.navigation || [];
  });

  // Computed: Current sub-navigation items
  readonly currentSubNavigation = computed<AxNavigationItem[]>(() => {
    const subApp = this.activeSubApp();
    return subApp?.subNavigation || [];
  });

  // Computed: Current header actions
  readonly currentHeaderActions = computed<HeaderAction[]>(() => {
    const app = this.activeApp();
    const subApp = this.activeSubApp();

    const globalActions = app?.headerActions || [];
    const subAppActions = subApp?.headerActions || [];

    return [...globalActions, ...subAppActions];
  });

  // Computed: Full active context
  readonly activeContext = computed<ActiveAppContext | null>(() => {
    const app = this.activeApp();
    if (!app) return null;

    const subApp = this.activeSubApp();

    return {
      app,
      subApp,
      navigation: this.currentNavigation(),
      subNavigation: this.currentSubNavigation(),
      headerActions: this.currentHeaderActions(),
      theme: app.theme,
    };
  });

  constructor() {
    // Subscribe to route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateActiveContext((event as NavigationEnd).url);
      });
  }

  /**
   * Register an app configuration
   */
  registerApp(config: AppConfig, order = 0, enabled = true): void {
    const registry = new Map(this._registry());
    registry.set(config.id, { config, enabled, order });
    this._registry.set(registry);
  }

  /**
   * Unregister an app
   */
  unregisterApp(appId: string): void {
    const registry = new Map(this._registry());
    registry.delete(appId);
    this._registry.set(registry);
  }

  /**
   * Enable/disable an app
   */
  setAppEnabled(appId: string, enabled: boolean): void {
    const registry = new Map(this._registry());
    const entry = registry.get(appId);
    if (entry) {
      registry.set(appId, { ...entry, enabled });
      this._registry.set(registry);
    }
  }

  /**
   * Get app config by ID
   */
  getApp(appId: string): AppConfig | null {
    return this._registry().get(appId)?.config || null;
  }

  /**
   * Get sub-app config
   */
  getSubApp(appId: string, subAppId: string): SubAppConfig | null {
    const app = this.getApp(appId);
    if (!app) return null;
    return app.subApps.find((s) => s.id === subAppId) || null;
  }

  /**
   * Navigate to an app
   */
  navigateToApp(appId: string): void {
    const app = this.getApp(appId);
    if (app) {
      this.router.navigate([app.defaultRoute]);
    }
  }

  /**
   * Navigate to a sub-app
   */
  navigateToSubApp(appId: string, subAppId: string): void {
    const subApp = this.getSubApp(appId, subAppId);
    if (subApp) {
      this.router.navigate([subApp.route]);
    }
  }

  /**
   * Update active context based on URL
   */
  private updateActiveContext(url: string): void {
    const registry = this._registry();

    // Find matching app
    for (const [appId, entry] of registry) {
      if (!entry.enabled) continue;

      const app = entry.config;
      if (url.startsWith(app.baseRoute)) {
        this._activeAppId.set(appId);

        // Find matching sub-app
        const matchedSubApp = app.subApps.find((subApp) =>
          url.startsWith(subApp.route),
        );

        if (matchedSubApp) {
          this._activeSubAppId.set(matchedSubApp.id);
        } else {
          // Use default sub-app
          const defaultSubApp = app.subApps.find((s) => s.isDefault);
          this._activeSubAppId.set(defaultSubApp?.id || null);
        }

        return;
      }
    }

    // No matching app found
    this._activeAppId.set(null);
    this._activeSubAppId.set(null);
  }

  /**
   * Get apps available for launcher (filtered by roles/permissions)
   */
  getAppsForLauncher(
    userRoles: string[] = [],
    userPermissions: string[] = [],
  ): AppConfig[] {
    return this.apps().filter((app) => {
      // Check roles
      if (app.roles && app.roles.length > 0) {
        const hasRole = app.roles.some((role) => userRoles.includes(role));
        if (!hasRole) return false;
      }

      // Check permissions
      if (app.permissions && app.permissions.length > 0) {
        const hasPermission = app.permissions.some((perm) =>
          userPermissions.includes(perm),
        );
        if (!hasPermission) return false;
      }

      return true;
    });
  }

  /**
   * Get sub-apps available for user
   */
  getSubAppsForUser(
    appId: string,
    userRoles: string[] = [],
    userPermissions: string[] = [],
  ): SubAppConfig[] {
    const app = this.getApp(appId);
    if (!app) return [];

    return app.subApps.filter((subApp) => {
      // Check roles
      if (subApp.roles && subApp.roles.length > 0) {
        const hasRole = subApp.roles.some((role) => userRoles.includes(role));
        if (!hasRole) return false;
      }

      // Check permissions
      if (subApp.permissions && subApp.permissions.length > 0) {
        const hasPermission = subApp.permissions.some((perm) =>
          userPermissions.includes(perm),
        );
        if (!hasPermission) return false;
      }

      return true;
    });
  }
}
