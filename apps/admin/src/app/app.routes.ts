import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  // Standalone routes (no layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },

  // Main routes (with layout)
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/user-management/user-management.component').then(
        (m) => m.UserManagementComponent,
      ),
  },
  {
    path: 'components',
    loadComponent: () =>
      import('./pages/components-demo/components-demo.component').then(
        (m) => m.ComponentsDemoComponent,
      ),
  },
  {
    path: 'design-tokens',
    loadComponent: () =>
      import('./pages/design-tokens/design-tokens.component').then(
        (m) => m.DesignTokensComponent,
      ),
  },
];
