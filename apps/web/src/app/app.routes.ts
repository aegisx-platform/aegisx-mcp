import { Route } from '@angular/router';
import { AuthGuard, GuestGuard } from './core/auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Authentication routes (guest only)
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login.page').then((m) => m.LoginPage),
    canActivate: [GuestGuard],
  },

  // Protected routes (require authentication)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboards/project',
    loadComponent: () =>
      import('./pages/dashboard/project-dashboard.page').then(
        (m) => m.ProjectDashboardPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/users/user-list.component').then(
            (m) => m.UserListComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/users/user-detail.component').then(
            (m) => m.UserDetailComponent,
          ),
      },
    ],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'components',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'buttons',
        loadComponent: () =>
          import('./pages/components/buttons/buttons.page').then(
            (m) => m.ButtonsPage,
          ),
      },
      {
        path: 'cards',
        loadComponent: () =>
          import('./pages/components/cards/cards.page').then(
            (m) => m.CardsPage,
          ),
      },
      {
        path: 'forms',
        loadComponent: () =>
          import('./pages/components/forms/forms.page').then(
            (m) => m.FormsPage,
          ),
      },
      {
        path: 'tables',
        loadComponent: () =>
          import('./pages/components/tables/tables.page').then(
            (m) => m.TablesPage,
          ),
      },
    ],
  },
  {
    path: 'test-ax',
    loadComponent: () =>
      import('./pages/test-ax/test-ax.component').then(
        (m) => m.TestAxComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'icon-test',
    loadComponent: () =>
      import('./icon-test.component').then((m) => m.IconTestComponent),
  },
  {
    path: 'test-navigation',
    loadComponent: () =>
      import('./test-navigation.component').then(
        (m) => m.TestNavigationComponent,
      ),
  },
  {
    path: 'debug-icons',
    loadComponent: () =>
      import('./debug-icons.component').then((m) => m.DebugIconsComponent),
  },
  {
    path: 'debug-navigation',
    loadComponent: () =>
      import('./debug-navigation.component').then(
        (m) => m.DebugNavigationComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'demo/navigation',
    loadComponent: () =>
      import('./demo/navigation-demo.component').then(
        (m) => m.NavigationDemoComponent,
      ),
  },
  {
    path: 'material-demo',
    loadComponent: () =>
      import('./pages/material-demo/material-demo.component').then(
        (m) => m.MaterialDemoComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'test-material',
    loadComponent: () =>
      import('./pages/material-demo/test-material.component').then(
        (m) => m.TestMaterialComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
