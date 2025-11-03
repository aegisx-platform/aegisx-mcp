import { AxNavigationItem } from '@aegisx/ui';
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

interface ApiNavigationItem {
  id: string;
  title: string;
  type: 'item' | 'group' | 'collapsible' | 'divider';
  icon?: string;
  link?: string;
  badge?: {
    content: string;
    type?: 'info' | 'success' | 'primary' | 'accent' | 'warn';
  };
  externalLink?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  disabled?: boolean;
  hidden?: boolean;
  permissions?: string[];
  children?: ApiNavigationItem[];
}

interface NavigationData {
  default: ApiNavigationItem[];
  compact: ApiNavigationItem[];
  horizontal: ApiNavigationItem[];
  mobile: ApiNavigationItem[];
}

interface NavigationResponse {
  success: boolean;
  data: NavigationData;
  message?: string;
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
    environment?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = '/navigation';

  // Default navigation items (fallback when API fails)
  // Simplified version aligned with seed data structure
  private readonly defaultNavigation: AxNavigationItem[] = [
    // Dashboard
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      icon: 'dashboard',
      link: '/dashboard',
    },
    // User Management
    {
      id: 'user-management',
      title: 'User Management',
      type: 'collapsible',
      icon: 'people',
      children: [
        {
          id: 'users-list',
          title: 'Users',
          type: 'item',
          icon: 'group',
          link: '/users',
          permissions: ['users:read', '*:*'],
        },
        {
          id: 'user-profile',
          title: 'My Profile',
          type: 'item',
          icon: 'account_circle',
          link: '/profile',
        },
      ],
    },
    // RBAC Management
    {
      id: 'rbac-management',
      title: 'RBAC Management',
      type: 'collapsible',
      icon: 'security',
      permissions: ['dashboard:view', '*:*'],
      children: [
        {
          id: 'rbac-dashboard',
          title: 'Overview',
          type: 'item',
          icon: 'bar_chart',
          link: '/rbac/dashboard',
          permissions: ['dashboard:view', '*:*'],
        },
        {
          id: 'rbac-roles',
          title: 'Roles',
          type: 'item',
          icon: 'badge',
          link: '/rbac/roles',
          permissions: ['roles:read', '*:*'],
        },
        {
          id: 'rbac-permissions',
          title: 'Permissions',
          type: 'item',
          icon: 'vpn_key',
          link: '/rbac/permissions',
          permissions: ['permissions:read', '*:*'],
        },
        {
          id: 'rbac-user-roles',
          title: 'User Assignments',
          type: 'item',
          icon: 'person_add',
          link: '/rbac/user-roles',
          permissions: ['user-roles:read', '*:*'],
        },
        {
          id: 'rbac-navigation',
          title: 'Navigation',
          type: 'item',
          icon: 'menu',
          link: '/rbac/navigation',
          permissions: ['navigation:read', '*:*'],
        },
      ],
    },
    // Monitoring
    {
      id: 'monitoring',
      title: 'Monitoring',
      type: 'collapsible',
      icon: 'speed',
      permissions: ['monitoring:view', '*:*'],
      children: [
        {
          id: 'monitoring-dashboard',
          title: 'System Dashboard',
          type: 'item',
          icon: 'dashboard',
          link: '/monitoring/dashboard',
          permissions: ['monitoring:view', '*:*'],
        },
        {
          id: 'system-monitoring',
          title: 'System Metrics',
          type: 'item',
          icon: 'bar_chart',
          link: '/monitoring/system',
          permissions: ['monitoring:view', '*:*'],
        },
        {
          id: 'error-logs',
          title: 'Error Logs',
          type: 'item',
          icon: 'bug_report',
          link: '/monitoring/error-logs',
          permissions: ['error-logs:read', '*:*'],
        },
      ],
    },
    // System
    {
      id: 'system-config',
      title: 'System',
      type: 'collapsible',
      icon: 'settings',
      children: [
        {
          id: 'settings',
          title: 'Settings',
          type: 'item',
          icon: 'tune',
          link: '/settings',
          permissions: ['settings:view', '*:*'],
        },
        {
          id: 'pdf-templates',
          title: 'PDF Templates',
          type: 'item',
          icon: 'description',
          link: '/pdf-templates',
        },
      ],
    },
    // Files
    {
      id: 'file-management',
      title: 'Files',
      type: 'item',
      icon: 'folder',
      link: '/file-upload',
    },
    // Dev Tools (only in development)
    ...(environment.production
      ? []
      : [
          {
            id: 'dev-tools',
            title: 'Dev Tools',
            type: 'group' as const,
            children: [
              {
                id: 'dev',
                title: 'Development Tools',
                type: 'item' as const,
                icon: 'science',
                link: '/dev',
                badge: {
                  content: 'Dev',
                  type: 'warn' as const,
                },
              },
            ],
          },
        ]),
  ];

  // Signals for reactive state
  private _navigationItems = signal<AxNavigationItem[]>(this.defaultNavigation);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _dataSource = signal<'api' | 'fallback'>('fallback');
  private _loadedOnce = signal<boolean>(false); // Prevent duplicate loading

  // Public readonly signals
  readonly navigationItems = this._navigationItems.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly dataSource = this._dataSource.asReadonly();

  // Computed signal for navigation with additional info
  readonly navigationInfo = computed(() => ({
    items: this.navigationItems(),
    loading: this.loading(),
    error: this.error(),
    dataSource: this.dataSource(),
    isUsingFallback: this.dataSource() === 'fallback',
  }));

  constructor() {
    // Don't auto-load navigation - let layout components load when needed
    // This prevents navigation API calls on login page
  }

  /**
   * Load navigation items from API with fallback
   */
  loadNavigation(
    type: 'default' | 'compact' | 'horizontal' | 'mobile' = 'default',
  ): Observable<AxNavigationItem[]> {
    // Don't load if already loaded and not explicitly refreshing
    if (
      this._loadedOnce() &&
      this._dataSource() === 'api' &&
      !this._loading()
    ) {
      console.log('✅ Navigation already loaded, skipping duplicate call');
      return of(this._navigationItems());
    }

    this._loading.set(true);
    this._error.set(null);
    this._navigationItems.set(this.defaultNavigation); // Reset to default while loading

    return this.http.get<NavigationResponse>(this.apiUrl).pipe(
      map((response) => {
        if (response.success && response.data && response.data[type]) {
          const convertedItems = this.convertApiItemsToNavigationItems(
            response.data[type],
          );
          // Filter navigation by user permissions
          const filteredItems =
            this.filterNavigationByPermissions(convertedItems);
          this._navigationItems.set(filteredItems);
          this._dataSource.set('api');
          this._loadedOnce.set(true);
          this._loading.set(false);
          console.log('✅ Navigation loaded from API', {
            count: filteredItems.length,
            type: type,
            source: 'api',
          });
          return filteredItems;
        } else {
          throw new Error(
            `Invalid API response structure or missing ${type} navigation`,
          );
        }
      }),
      catchError((error) => {
        console.warn(
          '⚠️ Failed to load navigation from API, using fallback',
          error,
        );
        // Filter navigation by user permissions for fallback too
        const filteredItems = this.filterNavigationByPermissions(
          this.defaultNavigation,
        );
        this._navigationItems.set(filteredItems);
        this._dataSource.set('fallback');
        this._error.set(error.message || 'Failed to load navigation from API');
        this._loading.set(false);
        return of(filteredItems);
      }),
    );
  }

  /**
   * Refresh navigation data (force reload from API)
   */
  refresh(
    type: 'default' | 'compact' | 'horizontal' | 'mobile' = 'default',
  ): Observable<AxNavigationItem[]> {
    console.log('🔄 Refreshing navigation data from API...');
    // Force refresh by clearing loaded flag
    this._loadedOnce.set(false);
    return this.loadNavigation(type);
  }

  /**
   * Load user-specific navigation with permissions filtering
   */
  loadUserNavigation(
    type: 'default' | 'compact' | 'horizontal' | 'mobile' = 'default',
  ): Observable<AxNavigationItem[]> {
    this._loading.set(true);
    this._error.set(null);

    const userApiUrl = `${this.apiUrl}/user?type=${type}`;

    return this.http.get<NavigationResponse>(userApiUrl).pipe(
      map((response) => {
        if (response.success && response.data && response.data[type]) {
          const convertedItems = this.convertApiItemsToNavigationItems(
            response.data[type],
          );
          this._navigationItems.set(convertedItems);
          this._dataSource.set('api');
          this._loading.set(false);
          console.log('✅ User navigation loaded from API', {
            count: convertedItems.length,
            type: type,
            source: 'api/user',
          });
          return convertedItems;
        } else {
          throw new Error(
            `Invalid API response structure or missing ${type} user navigation`,
          );
        }
      }),
      catchError((error) => {
        console.warn(
          '⚠️ Failed to load user navigation from API, falling back to general navigation',
          error,
        );
        // Fallback to general navigation if user-specific fails
        return this.loadNavigation(type);
      }),
    );
  }

  /**
   * Get current navigation items (synchronous)
   */
  getCurrentNavigation(): AxNavigationItem[] {
    return this._navigationItems();
  }

  /**
   * Force use fallback navigation
   */
  useFallback(): void {
    console.log('🔄 Switching to fallback navigation');
    const filteredItems = this.filterNavigationByPermissions(
      this.defaultNavigation,
    );
    this._navigationItems.set(filteredItems);
    this._dataSource.set('fallback');
    this._error.set(null);
    this._loading.set(false);
  }

  /**
   * Check if currently using fallback data
   */
  isUsingFallback(): boolean {
    return this._dataSource() === 'fallback';
  }

  /**
   * Convert API navigation items to UI navigation items
   */
  private convertApiItemsToNavigationItems(
    apiItems: ApiNavigationItem[],
  ): AxNavigationItem[] {
    return apiItems.map((item) => this.convertApiItem(item));
  }

  /**
   * Convert single API item to UI navigation item
   */
  private convertApiItem(apiItem: ApiNavigationItem): AxNavigationItem {
    const navItem: AxNavigationItem = {
      id: apiItem.id,
      title: apiItem.title,
      type: apiItem.type,
    };

    // Optional properties
    if (apiItem.icon) navItem.icon = apiItem.icon;
    if (apiItem.link) navItem.link = apiItem.link;
    if (apiItem.badge) navItem.badge = apiItem.badge;
    if (apiItem.externalLink) navItem.externalLink = apiItem.externalLink;
    if (apiItem.target) navItem.target = apiItem.target;

    // New API fields
    if (apiItem.disabled !== undefined) navItem.disabled = apiItem.disabled;
    if (apiItem.hidden !== undefined) navItem.hidden = apiItem.hidden;

    // Note: permissions are handled at API level, not passed to UI
    // The API should filter navigation items based on user permissions

    // Handle children recursively (filter out hidden items)
    if (apiItem.children && apiItem.children.length > 0) {
      const visibleChildren = apiItem.children.filter((child) => !child.hidden);
      if (visibleChildren.length > 0) {
        navItem.children = visibleChildren.map((child) =>
          this.convertApiItem(child),
        );
      }
    }

    return navItem;
  }

  /**
   * Filter navigation items based on user permissions
   * Items without permissions field are always visible
   * Items with permissions field are only visible if user has at least one of those permissions (OR logic)
   */
  filterNavigationByPermissions(items: AxNavigationItem[]): AxNavigationItem[] {
    return items
      .filter((item) => {
        // Always show items without permission requirement
        if (!item.permissions) {
          return true;
        }
        // Check if user has at least one of the required permissions (OR logic)
        return item.permissions.some((permission) =>
          this.authService.hasPermission()(permission),
        );
      })
      .map((item) => {
        // Recursively filter children if they exist
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterNavigationByPermissions(
            item.children,
          );
          // Only include parent if it has visible children or if it's not a group/collapsible type
          if (item.type === 'group' || item.type === 'collapsible') {
            return filteredChildren.length > 0
              ? { ...item, children: filteredChildren }
              : null;
          }
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter((item): item is AxNavigationItem => item !== null);
  }

  /**
   * Get navigation statistics
   */
  getNavigationStats() {
    const items = this._navigationItems();
    let totalItems = 0;
    let groups = 0;
    let collapsibles = 0;
    let regularItems = 0;

    const countItems = (navItems: AxNavigationItem[]) => {
      navItems.forEach((item) => {
        totalItems++;
        switch (item.type) {
          case 'group':
            groups++;
            break;
          case 'collapsible':
            collapsibles++;
            break;
          case 'item':
            regularItems++;
            break;
        }
        if (item.children) {
          countItems(item.children);
        }
      });
    };

    countItems(items);

    return {
      totalItems,
      groups,
      collapsibles,
      regularItems,
      dataSource: this._dataSource(),
      hasError: !!this._error(),
      isLoading: this._loading(),
    };
  }
}
