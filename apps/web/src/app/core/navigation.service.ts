import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, catchError, map, tap } from 'rxjs';
import { AxNavigationItem } from '@aegisx/ui';

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
  private readonly apiUrl = '/api/navigation';

  // Default navigation items (fallback)
  private readonly defaultNavigation: AxNavigationItem[] = [
    {
      id: 'main',
      title: 'Main',
      type: 'group',
      children: [
        {
          id: 'dashboard',
          title: 'Analytics Dashboard',
          type: 'item',
          icon: 'heroicons_outline:home',
          link: '/dashboard',
        },
        {
          id: 'dashboard.project',
          title: 'Project Dashboard',
          type: 'item',
          icon: 'heroicons_outline:briefcase',
          link: '/dashboards/project',
        },
      ],
    },
    {
      id: 'management',
      title: 'Management',
      type: 'group',
      children: [
        {
          id: 'users',
          title: 'User Management',
          type: 'item',
          icon: 'heroicons_outline:users',
          link: '/users',
        },
        {
          id: 'products',
          title: 'Products',
          type: 'collapsible',
          icon: 'heroicons_outline:shopping-bag',
          children: [
            {
              id: 'products.list',
              title: 'Product List',
              type: 'item',
              link: '/products',
            },
            {
              id: 'products.categories',
              title: 'Categories',
              type: 'item',
              link: '/products/categories',
            },
          ],
        },
        {
          id: 'orders',
          title: 'Orders',
          type: 'item',
          icon: 'heroicons_outline:shopping-cart',
          link: '/orders',
        },
      ],
    },
    {
      id: 'settings',
      title: 'Settings',
      type: 'group',
      children: [
        {
          id: 'settings',
          title: 'Settings',
          type: 'item',
          icon: 'heroicons_outline:cog-6-tooth',
          link: '/settings',
        },
        {
          id: 'test-ax',
          title: 'Test Ax Navigation',
          type: 'item',
          icon: 'heroicons_outline:beaker',
          link: '/test-ax',
        },
        {
          id: 'material-demo',
          title: 'Material Components Demo',
          type: 'item',
          icon: 'heroicons_outline:cube',
          link: '/material-demo',
        },
        {
          id: 'docs',
          title: 'Documentation',
          type: 'item',
          icon: 'heroicons_outline:book-open',
          link: '/docs',
          externalLink: true,
          target: '_blank',
        },
      ],
    },
  ];

  // Signals for reactive state
  private _navigationItems = signal<AxNavigationItem[]>(this.defaultNavigation);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _dataSource = signal<'api' | 'fallback'>('fallback');

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
    // Auto-load navigation on service initialization
    this.loadNavigation().subscribe();
  }

  /**
   * Load navigation items from API with fallback
   */
  loadNavigation(
    type: 'default' | 'compact' | 'horizontal' | 'mobile' = 'default',
  ): Observable<AxNavigationItem[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<NavigationResponse>(this.apiUrl).pipe(
      map((response) => {
        if (response.success && response.data && response.data[type]) {
          const convertedItems = this.convertApiItemsToNavigationItems(
            response.data[type],
          );
          this._navigationItems.set(convertedItems);
          this._dataSource.set('api');
          this._loading.set(false);
          console.log('✅ Navigation loaded from API', {
            count: convertedItems.length,
            type: type,
            source: 'api',
          });
          return convertedItems;
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
        this._navigationItems.set(this.defaultNavigation);
        this._dataSource.set('fallback');
        this._error.set(error.message || 'Failed to load navigation from API');
        this._loading.set(false);
        return of(this.defaultNavigation);
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
    this._navigationItems.set(this.defaultNavigation);
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
