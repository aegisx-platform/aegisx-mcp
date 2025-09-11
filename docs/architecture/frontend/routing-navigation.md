# Routing & Navigation Patterns

## Modern Angular Routing with Signals

### Application Route Structure

```typescript
// apps/user-portal/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from '@org/auth';

export const routes: Routes = [
  // Public routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // Protected routes
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'Dashboard',
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/user.routes').then((m) => m.userRoutes),
        canActivate: [AuthGuard],
        data: { requiredPermission: 'users.read' },
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then((m) => m.settingsRoutes),
      },
    ],
  },

  // Error routes
  {
    path: '404',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Page Not Found',
  },
  {
    path: '403',
    loadComponent: () => import('./shared/components/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
    title: 'Access Forbidden',
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
```

### Feature Route Configuration

```typescript
// features/users/user.routes.ts
import { Routes } from '@angular/router';
import { PermissionGuard } from '@org/auth';
import { UserFormGuard } from './guards/user-form.guard';

export const userRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-page/user-page.component').then((m) => m.UserPageComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/user-list/user-list.component').then((m) => m.UserListComponent),
        title: 'Users',
        data: { breadcrumb: 'Users' },
      },
      {
        path: 'new',
        loadComponent: () => import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
        canActivate: [PermissionGuard],
        canDeactivate: [UserFormGuard],
        title: 'Create User',
        data: {
          breadcrumb: 'Create User',
          requiredPermission: 'users.create',
        },
      },
      {
        path: ':id',
        loadComponent: () => import('./components/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
        title: 'User Details',
        data: { breadcrumb: 'User Details' },
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
        canActivate: [PermissionGuard],
        canDeactivate: [UserFormGuard],
        title: 'Edit User',
        data: {
          breadcrumb: 'Edit User',
          requiredPermission: 'users.update',
        },
      },
    ],
  },
];
```

## Navigation Service with Signals

### Router State Management

```typescript
// libs/ui-kit/src/lib/services/navigation.service.ts
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private location = inject(Location);

  // Navigation state signals
  private currentRouteSignal = signal<string>('');
  private routeParamsSignal = signal<Params>({});
  private queryParamsSignal = signal<Params>({});
  private routeDataSignal = signal<any>({});
  private navigationHistorySignal = signal<string[]>([]);

  // Public readonly signals
  readonly currentRoute = this.currentRouteSignal.asReadonly();
  readonly routeParams = this.routeParamsSignal.asReadonly();
  readonly queryParams = this.queryParamsSignal.asReadonly();
  readonly routeData = this.routeDataSignal.asReadonly();
  readonly navigationHistory = this.navigationHistorySignal.asReadonly();

  // Computed navigation state
  readonly breadcrumbs = computed(() => this.generateBreadcrumbs());
  readonly canGoBack = computed(() => this.navigationHistory().length > 1);
  readonly previousRoute = computed(() => {
    const history = this.navigationHistory();
    return history.length > 1 ? history[history.length - 2] : null;
  });

  constructor() {
    // Track route changes
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentRouteSignal.set(event.url);
      this.updateNavigationHistory(event.url);
    });

    // Track route params
    this.activatedRoute.params.subscribe((params) => {
      this.routeParamsSignal.set(params);
    });

    // Track query params
    this.activatedRoute.queryParams.subscribe((params) => {
      this.queryParamsSignal.set(params);
    });

    // Track route data
    this.activatedRoute.data.subscribe((data) => {
      this.routeDataSignal.set(data);
    });
  }

  // Navigation methods
  async navigateTo(path: string, extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate([path], extras);
  }

  async navigateToWithParams(path: string, params: any = {}, queryParams: any = {}): Promise<boolean> {
    return this.router.navigate([path, params], { queryParams });
  }

  goBack(): void {
    if (this.canGoBack()) {
      this.location.back();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  reload(): void {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  // Query parameter helpers
  updateQueryParams(params: Params, merge: boolean = true): void {
    const queryParams = merge ? { ...this.queryParams(), ...params } : params;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: merge ? 'merge' : 'replace',
    });
  }

  removeQueryParam(key: string): void {
    const queryParams = { ...this.queryParams() };
    delete queryParams[key];

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
    });
  }

  // Private methods
  private updateNavigationHistory(url: string): void {
    this.navigationHistorySignal.update((history) => {
      const newHistory = [...history, url];
      // Keep only last 10 routes
      return newHistory.slice(-10);
    });
  }

  private generateBreadcrumbs(): Array<{ label: string; url: string; active: boolean }> {
    const breadcrumbs: Array<{ label: string; url: string; active: boolean }> = [];
    let route = this.activatedRoute.root;
    let url = '';

    while (route) {
      if (route.routeConfig?.data?.['breadcrumb']) {
        url += `/${route.routeConfig.path}`;
        breadcrumbs.push({
          label: route.routeConfig.data['breadcrumb'],
          url,
          active: false,
        });
      }
      route = route.firstChild!;
    }

    // Mark last breadcrumb as active
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].active = true;
    }

    return breadcrumbs;
  }
}
```

### Breadcrumb Component

```typescript
// libs/ui-kit/src/lib/components/breadcrumb/breadcrumb.component.ts
@Component({
  selector: 'ui-breadcrumb',
  standalone: true,
  template: `
    <nav class="flex" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2">
        @for (breadcrumb of breadcrumbs(); track breadcrumb.url; let isLast = $last) {
          <li class="flex items-center">
            @if (!isLast) {
              <a [routerLink]="breadcrumb.url" class="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                {{ breadcrumb.label }}
              </a>
              <mat-icon class="mx-2 text-gray-400 text-sm">chevron_right</mat-icon>
            } @else {
              <span class="text-sm font-medium text-gray-900" aria-current="page">
                {{ breadcrumb.label }}
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  private navigationService = inject(NavigationService);

  breadcrumbs = this.navigationService.breadcrumbs;
}
```

### Navigation Menu Component

```typescript
// shared/components/navigation/navigation.component.ts
@Component({
  selector: 'app-navigation',
  standalone: true,
  template: `
    <nav class="bg-white shadow-sm border-r border-gray-200 h-full">
      <!-- Logo -->
      <div class="p-4 border-b border-gray-200">
        <img src="/assets/logo.svg" alt="Logo" class="h-8" />
      </div>

      <!-- Navigation Items -->
      <div class="p-4">
        @for (item of navigationItems(); track item.path) {
          @if (item.visible) {
            <div class="mb-2">
              @if (item.children?.length > 0) {
                <!-- Expandable Group -->
                <button (click)="toggleGroup(item.path)" class="w-full flex items-center justify-between p-2 text-left rounded-md hover:bg-gray-100 transition-colors">
                  <div class="flex items-center">
                    <mat-icon class="mr-3 text-gray-500">{{ item.icon }}</mat-icon>
                    <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
                  </div>
                  <mat-icon class="text-gray-400 transition-transform" [class.rotate-180]="isGroupExpanded(item.path)"> expand_more </mat-icon>
                </button>

                @if (isGroupExpanded(item.path)) {
                  <div class="ml-6 mt-2 space-y-1">
                    @for (child of item.children; track child.path) {
                      <a [routerLink]="child.path" routerLinkActive="bg-primary-100 text-primary-700 border-r-2 border-primary-600" class="block p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                        {{ child.label }}
                      </a>
                    }
                  </div>
                }
              } @else {
                <!-- Direct Link -->
                <a [routerLink]="item.path" routerLinkActive="bg-primary-100 text-primary-700 border-r-2 border-primary-600" class="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <mat-icon class="mr-3 text-gray-500">{{ item.icon }}</mat-icon>
                  <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>

                  @if (item.badge) {
                    <span class="ml-auto px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                      {{ item.badge }}
                    </span>
                  }
                </a>
              }
            </div>
          }
        }
      </div>

      <!-- User Menu -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button [matMenuTriggerFor]="userMenu" class="w-full flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors">
          <img [src]="currentUser()?.avatar || '/assets/default-avatar.png'" class="w-8 h-8 rounded-full mr-3" />
          <div class="flex-1 text-left">
            <p class="text-sm font-medium text-gray-900">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</p>
            <p class="text-xs text-gray-500">{{ currentUser()?.role.name }}</p>
          </div>
          <mat-icon class="text-gray-400">more_vert</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu" xPosition="before">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </nav>
  `,
})
export class NavigationComponent {
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private router = inject(Router);

  // Navigation state
  private expandedGroupsSignal = signal<Set<string>>(new Set());

  readonly expandedGroups = this.expandedGroupsSignal.asReadonly();
  readonly currentUser = this.authService.currentUser;

  // Navigation items computed based on permissions
  readonly navigationItems = computed(() => {
    const userPermissions = this.permissionService.userPermissions();

    return [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        visible: true,
      },
      {
        path: '/users',
        label: 'User Management',
        icon: 'people',
        visible: this.permissionService.hasPermission('users.read'),
        children: [
          {
            path: '/users',
            label: 'All Users',
            visible: this.permissionService.hasPermission('users.read'),
          },
          {
            path: '/users/new',
            label: 'Create User',
            visible: this.permissionService.hasPermission('users.create'),
          },
          {
            path: '/users/import',
            label: 'Import Users',
            visible: this.permissionService.hasPermission('users.import'),
          },
        ],
      },
      {
        path: '/reports',
        label: 'Reports',
        icon: 'analytics',
        visible: this.permissionService.hasPermission('reports.read'),
        badge: this.getReportNotificationCount(),
      },
      {
        path: '/settings',
        label: 'Settings',
        icon: 'settings',
        visible: true,
        children: [
          {
            path: '/settings/general',
            label: 'General',
            visible: true,
          },
          {
            path: '/settings/security',
            label: 'Security',
            visible: this.permissionService.hasPermission('settings.security'),
          },
          {
            path: '/settings/integrations',
            label: 'Integrations',
            visible: this.permissionService.hasPermission('settings.integrations'),
          },
        ],
      },
    ].filter((item) => item.visible);
  });

  toggleGroup(path: string) {
    this.expandedGroupsSignal.update((groups) => {
      const newGroups = new Set(groups);
      if (newGroups.has(path)) {
        newGroups.delete(path);
      } else {
        newGroups.add(path);
      }
      return newGroups;
    });
  }

  isGroupExpanded(path: string): boolean {
    return this.expandedGroups().has(path);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private getReportNotificationCount(): number {
    // Return pending report count or 0
    return 0;
  }
}

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  visible: boolean;
  badge?: number;
  children?: Array<{
    path: string;
    label: string;
    visible: boolean;
  }>;
}
```

## Advanced Routing Patterns

### Route Guards with Permissions

```typescript
// libs/auth/src/lib/guards/permission.guard.ts
@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  private permissionService = inject(PermissionService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const requiredPermission = route.data['requiredPermission'] as string;

    if (!requiredPermission) {
      // No permission required
      return true;
    }

    const hasPermission = await this.permissionService.checkPermission(requiredPermission);

    if (!hasPermission) {
      this.notificationService.error('Access Denied', 'You do not have permission to access this page');
      this.router.navigate(['/403']);
      return false;
    }

    return true;
  }
}

// Feature-specific guards
@Injectable()
export class UserFormGuard implements CanDeactivate<UserFormComponent> {
  canDeactivate(component: UserFormComponent): boolean | Observable<boolean> {
    if (component.form.dirty && !component.submitting()) {
      return confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }
}
```

### Route Resolvers with Signals

```typescript
// features/users/resolvers/user.resolver.ts
@Injectable({ providedIn: 'root' })
export class UserResolver implements Resolve<User | null> {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  async resolve(route: ActivatedRouteSnapshot): Promise<User | null> {
    const userId = route.params['id'];

    if (!userId) return null;

    try {
      return await this.userService.loadUserById(userId);
    } catch (error) {
      this.notificationService.error('Error', 'Failed to load user');
      return null;
    }
  }
}

// Usage in routes
{
  path: ':id/edit',
  loadComponent: () => import('./user-form.component').then(m => m.UserFormComponent),
  resolve: { user: UserResolver },
  title: 'Edit User'
}
```

### Dynamic Route Loading

```typescript
// Dynamic route service for admin features
@Injectable({ providedIn: 'root' })
export class DynamicRoutingService {
  private router = inject(Router);
  private permissionService = inject(PermissionService);

  private dynamicRoutesSignal = signal<Routes>([]);
  readonly dynamicRoutes = this.dynamicRoutesSignal.asReadonly();

  async loadUserSpecificRoutes() {
    const userPermissions = this.permissionService.userPermissions();
    const dynamicRoutes: Routes = [];

    // Add admin routes if user has admin permissions
    if (this.permissionService.hasPermission('admin.access')) {
      dynamicRoutes.push({
        path: 'admin',
        loadChildren: () => import('../features/admin/admin.routes').then((m) => m.adminRoutes),
        canActivate: [PermissionGuard],
        data: { requiredPermission: 'admin.access' },
      });
    }

    // Add manager routes if user has manager permissions
    if (this.permissionService.hasPermission('manager.access')) {
      dynamicRoutes.push({
        path: 'manager',
        loadChildren: () => import('../features/manager/manager.routes').then((m) => m.managerRoutes),
        canActivate: [PermissionGuard],
        data: { requiredPermission: 'manager.access' },
      });
    }

    this.dynamicRoutesSignal.set(dynamicRoutes);

    // Add routes to router configuration
    this.router.resetConfig([...this.router.config, ...dynamicRoutes]);
  }
}
```

## Tab Navigation Pattern

### Tab Navigation Component

```typescript
// libs/ui-kit/src/lib/components/tab-navigation/tab-navigation.component.ts
@Component({
  selector: 'ui-tab-navigation',
  standalone: true,
  template: `
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        @for (tab of tabs(); track tab.path) {
          <a [routerLink]="tab.path" routerLinkActive="border-primary-500 text-primary-600" class="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all">
            @if (tab.icon) {
              <mat-icon class="mr-2 text-sm">{{ tab.icon }}</mat-icon>
            }

            {{ tab.label }}

            @if (tab.count !== undefined) {
              <span class="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {{ tab.count }}
              </span>
            }

            @if (tab.badge) {
              <span class="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                {{ tab.badge }}
              </span>
            }
          </a>
        }
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="py-4">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class TabNavigationComponent {
  tabs = input<Tab[]>([]);

  private navigationService = inject(NavigationService);

  // Track active tab
  readonly activeTab = computed(() => {
    const currentRoute = this.navigationService.currentRoute();
    return this.tabs().find((tab) => currentRoute.startsWith(tab.path));
  });
}

interface Tab {
  path: string;
  label: string;
  icon?: string;
  count?: number;
  badge?: string | number;
}

// Usage in user management page
@Component({
  template: `
    <ui-page-layout title="User Management">
      <ui-tab-navigation [tabs]="userTabs()"> </ui-tab-navigation>
    </ui-page-layout>
  `,
})
export class UserPageComponent {
  private userService = inject(UserService);

  userTabs = computed(() => [
    {
      path: '/users',
      label: 'All Users',
      icon: 'people',
      count: this.userService.users().length,
    },
    {
      path: '/users/pending',
      label: 'Pending Approval',
      icon: 'pending',
      badge: this.getPendingCount(),
    },
    {
      path: '/users/inactive',
      label: 'Inactive',
      icon: 'people_off',
    },
  ]);

  private getPendingCount(): number {
    return this.userService.users().filter((u) => u.status === 'pending').length;
  }
}
```

## Mobile Navigation Patterns

### Responsive Navigation

```typescript
@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  template: `
    <!-- Mobile Bottom Navigation -->
    @if (breakpointService.isMobile()) {
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div class="grid grid-cols-4 py-2">
          @for (item of mobileNavItems(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="text-primary-600" class="flex flex-col items-center py-2 text-gray-500 hover:text-gray-700 transition-colors">
              <mat-icon class="text-2xl mb-1">{{ item.icon }}</mat-icon>
              <span class="text-xs">{{ item.label }}</span>

              @if (item.badge) {
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {{ item.badge }}
                </span>
              }
            </a>
          }
        </div>
      </div>
    }

    <!-- Mobile Drawer Toggle -->
    @if (breakpointService.isMobile()) {
      <button mat-icon-button (click)="toggleMobileMenu()" class="fixed top-4 left-4 z-50 bg-white shadow-md">
        <mat-icon>{{ showMobileMenu() ? 'close' : 'menu' }}</mat-icon>
      </button>

      <!-- Mobile Drawer -->
      @if (showMobileMenu()) {
        <div class="fixed inset-0 z-40">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black bg-opacity-50" (click)="closeMobileMenu()"></div>

          <!-- Drawer -->
          <div class="absolute left-0 top-0 h-full w-80 bg-white shadow-xl" @slideInLeft>
            <div class="p-4">
              <h2 class="text-lg font-semibold mb-4">Navigation</h2>
              @for (item of navigationItems(); track item.path) {
                <a [routerLink]="item.path" (click)="closeMobileMenu()" class="block p-3 rounded-md hover:bg-gray-100 transition-colors">
                  <div class="flex items-center">
                    <mat-icon class="mr-3">{{ item.icon }}</mat-icon>
                    <span>{{ item.label }}</span>
                  </div>
                </a>
              }
            </div>
          </div>
        </div>
      }
    }
  `,
  animations: [trigger('slideInLeft', [transition(':enter', [style({ transform: 'translateX(-100%)' }), animate('300ms ease-out', style({ transform: 'translateX(0)' }))])])],
})
export class MobileNavigationComponent {
  breakpointService = inject(BreakpointService);
  private navigationService = inject(NavigationService);

  private showMobileMenuSignal = signal(false);
  readonly showMobileMenu = this.showMobileMenuSignal.asReadonly();

  readonly navigationItems = this.navigationService.navigationItems;

  readonly mobileNavItems = computed(() => [
    { path: '/dashboard', label: 'Home', icon: 'home' },
    { path: '/users', label: 'Users', icon: 'people' },
    { path: '/reports', label: 'Reports', icon: 'analytics', badge: this.getReportBadge() },
    { path: '/profile', label: 'Profile', icon: 'person' },
  ]);

  toggleMobileMenu() {
    this.showMobileMenuSignal.update((show) => !show);
  }

  closeMobileMenu() {
    this.showMobileMenuSignal.set(false);
  }

  private getReportBadge(): number | undefined {
    // Return pending reports count
    return undefined;
  }
}
```

## Route Animation Patterns

### Page Transition Animations

```typescript
// shared/animations/route.animations.ts
export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true },
    ),
    query(':enter', [style({ left: '100%' })], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([query(':leave', [animate('300ms ease-out', style({ left: '-100%' }))], { optional: true }), query(':enter', [animate('300ms ease-out', style({ left: '0%' }))], { optional: true })]),
    query(':enter', animateChild(), { optional: true }),
  ]),
]);

// Usage in app component
@Component({
  template: `
    <div [@routeAnimations]="getRouteAnimationData()">
      <router-outlet></router-outlet>
    </div>
  `,
  animations: [slideInAnimation],
})
export class AppComponent {
  constructor(private router: Router) {}

  getRouteAnimationData() {
    return this.router.routerState.root.firstChild?.snapshot?.data?.['animation'] || '';
  }
}
```

### Loading States During Navigation

```typescript
@Injectable({ providedIn: 'root' })
export class NavigationLoadingService {
  private loadingSignal = signal(false);
  readonly loading = this.loadingSignal.asReadonly();

  constructor() {
    const router = inject(Router);

    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingSignal.set(true);
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loadingSignal.set(false);
      }
    });
  }
}

// Loading indicator component
@Component({
  selector: 'app-loading-bar',
  standalone: true,
  template: `
    @if (navigationLoadingService.loading()) {
      <div class="fixed top-0 left-0 right-0 z-50">
        <div class="h-1 bg-primary-600 animate-pulse"></div>
      </div>
    }
  `,
})
export class LoadingBarComponent {
  navigationLoadingService = inject(NavigationLoadingService);
}
```

## URL State Management

### Query Parameter Service

```typescript
@Injectable({ providedIn: 'root' })
export class QueryParamService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Convert query params to signals
  readonly queryParams = toSignal(this.route.queryParams, { initialValue: {} });

  // Typed query parameter getters
  getString(key: string, defaultValue: string = ''): string {
    return this.queryParams()[key] || defaultValue;
  }

  getNumber(key: string, defaultValue: number = 0): number {
    const value = this.queryParams()[key];
    return value ? parseInt(value, 10) || defaultValue : defaultValue;
  }

  getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = this.queryParams()[key];
    return value ? value === 'true' : defaultValue;
  }

  getArray(key: string, defaultValue: string[] = []): string[] {
    const value = this.queryParams()[key];
    return value ? (Array.isArray(value) ? value : [value]) : defaultValue;
  }

  // Update query parameters
  updateParam(key: string, value: any): void {
    this.updateParams({ [key]: value });
  }

  updateParams(params: Params): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  removeParam(key: string): void {
    const params = { ...this.queryParams() };
    delete params[key];

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
    });
  }

  clear(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }
}

// Usage in list components for search/filter state
@Component({
  template: ` <input [value]="searchTerm()" (input)="onSearchChange($event.target.value)" placeholder="Search users..." /> `,
})
export class UserListComponent {
  private queryParamService = inject(QueryParamService);
  private userService = inject(UserService);

  // Sync search term with URL
  readonly searchTerm = computed(() => this.queryParamService.getString('search'));

  constructor() {
    // Effect to sync URL search with service
    effect(() => {
      const search = this.searchTerm();
      this.userService.setSearchTerm(search);
    });
  }

  onSearchChange(term: string) {
    this.queryParamService.updateParam('search', term);
  }
}
```

## Navigation Testing

### Testing Route Guards

```typescript
describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let permissionService: jasmine.SpyObj<PermissionService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const permissionSpy = jasmine.createSpyObj('PermissionService', ['checkPermission']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [PermissionGuard, { provide: PermissionService, useValue: permissionSpy }, { provide: Router, useValue: routerSpy }],
    });

    guard = TestBed.inject(PermissionGuard);
    permissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow access when user has permission', async () => {
    permissionService.checkPermission.and.returnValue(Promise.resolve(true));

    const route = { data: { requiredPermission: 'users.read' } } as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect when user lacks permission', async () => {
    permissionService.checkPermission.and.returnValue(Promise.resolve(false));

    const route = { data: { requiredPermission: 'admin.access' } } as ActivatedRouteSnapshot;
    const result = await guard.canActivate(route);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/403']);
  });
});
```

### E2E Navigation Testing

```typescript
// e2e navigation tests
test('should navigate through user management workflow', async ({ page }) => {
  await page.goto('/users');

  // Test breadcrumb navigation
  await expect(page.getByTestId('breadcrumb')).toContainText('Users');

  // Navigate to create form
  await page.click('[data-testid="add-user-button"]');
  await expect(page).toHaveURL('/users/new');
  await expect(page.getByTestId('breadcrumb')).toContainText('Create User');

  // Test back navigation
  await page.click('[data-testid="back-button"]');
  await expect(page).toHaveURL('/users');

  // Test mobile navigation
  await page.setViewportSize({ width: 375, height: 667 });
  await page.click('[data-testid="mobile-menu-toggle"]');
  await expect(page.getByTestId('mobile-menu')).toBeVisible();
});
```

## Best Practices

### Routing Best Practices

1. **Lazy Loading**: Load features only when needed
2. **Route Guards**: Protect routes with proper authorization
3. **URL State**: Sync component state with URL parameters
4. **Breadcrumbs**: Provide clear navigation context
5. **Error Handling**: Handle route errors gracefully
6. **Mobile First**: Design navigation for mobile users
7. **Performance**: Minimize bundle size with lazy loading
8. **Accessibility**: Support keyboard navigation and screen readers
9. **Testing**: Test navigation flows with E2E tests
10. **Analytics**: Track navigation patterns for UX insights
