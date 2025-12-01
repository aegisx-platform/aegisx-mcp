import { Route } from '@angular/router';
import { AuthGuard, GuestGuard } from './core/auth';

/**
 * Application Routes
 *
 * Route Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Route Pattern        │ Layout Type      │ Description           │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ /login, /register    │ Empty Layout     │ Auth pages (guest)    │
 * │ /portal              │ Enterprise Shell │ App launcher portal   │
 * │ /inventory/*         │ Enterprise Shell │ Inventory feature app │
 * │ /system/*            │ Enterprise Shell │ System admin app      │
 * │ /4xx, /5xx           │ No Layout        │ Error pages           │
 * └─────────────────────────────────────────────────────────────────┘
 */
export const appRoutes: Route[] = [
  // ============================================
  // Authentication Routes (Empty Layout - Guest Only)
  // ============================================
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/auth-shell.component').then(
        (m) => m.AuthShellComponent,
      ),
    canActivate: [GuestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/auth/forgot-password.page').then(
            (m) => m.ForgotPasswordPage,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register.page').then((m) => m.RegisterPage),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/auth/reset-password.page').then(
            (m) => m.ResetPasswordPage,
          ),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./pages/auth/verify-email.page').then(
            (m) => m.VerifyEmailPage,
          ),
      },
    ],
  },

  // ============================================
  // Portal (Enterprise Shell - Standalone Page)
  // ============================================
  {
    path: 'portal',
    loadComponent: () =>
      import('./pages/portal/portal.page').then((m) => m.PortalPage),
    canActivate: [AuthGuard],
    data: {
      title: 'Enterprise Portal',
      description: 'Access your enterprise applications',
    },
  },

  // ============================================
  // System Administration (Enterprise Shell)
  // All admin routes are under /system prefix
  // ============================================
  {
    path: 'system',
    loadChildren: () =>
      import('./features/system/system.routes').then((m) => m.SYSTEM_ROUTES),
    data: {
      title: 'System Administration',
      description: 'System administration and management',
    },
  },

  // ============================================
  // Feature Apps (Enterprise Shell)
  // Each feature app has its own shell component
  // ============================================
  {
    path: 'inventory',
    loadChildren: () =>
      import('./features/inventory/inventory.routes').then(
        (m) => m.INVENTORY_ROUTES,
      ),
    canActivate: [AuthGuard],
    data: {
      title: 'Inventory Management',
      description: 'Warehouse and Inventory Management System',
      requiredPermissions: ['inventory.read', 'admin.*'],
    },
  },

  // ============================================
  // Default Redirects
  // ============================================
  {
    path: '',
    redirectTo: 'portal',
    pathMatch: 'full',
  },

  // ============================================
  // Error Pages (No Layout)
  // ============================================
  {
    path: '401',
    loadComponent: () =>
      import('./pages/errors/unauthorized.page').then(
        (m) => m.UnauthorizedPage,
      ),
  },
  {
    path: '403',
    loadComponent: () =>
      import('./pages/errors/forbidden.page').then((m) => m.ForbiddenPage),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./pages/errors/not-found.page').then((m) => m.NotFoundPage),
  },
  {
    path: '429',
    loadComponent: () =>
      import('./pages/errors/rate-limit.page').then((m) => m.RateLimitPage),
  },
  {
    path: '500',
    loadComponent: () =>
      import('./pages/errors/server-error.page').then((m) => m.ServerErrorPage),
  },

  // ============================================
  // Catch-all (404)
  // ============================================
  {
    path: '**',
    redirectTo: '404',
  },
];
