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
    redirectTo: 'introduction',
    pathMatch: 'full',
  },

  // Getting Started Routes
  {
    path: 'introduction',
    loadComponent: () =>
      import('./pages/introduction/introduction.component').then(
        (m) => m.IntroductionComponent,
      ),
  },
  {
    path: 'installation',
    loadComponent: () =>
      import('./pages/installation/installation.component').then(
        (m) => m.InstallationComponent,
      ),
  },
  {
    path: 'quick-start',
    loadComponent: () =>
      import('./pages/quick-start/quick-start.component').then(
        (m) => m.QuickStartComponent,
      ),
  },

  // Examples Routes
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
    path: 'form-sizes',
    loadComponent: () =>
      import('./pages/form-sizes-demo/form-sizes-demo.component').then(
        (m) => m.FormSizesDemoComponent,
      ),
  },
  {
    path: 'form-layouts',
    loadComponent: () =>
      import('./pages/form-layouts/form-layouts.component').then(
        (m) => m.FormLayoutsComponent,
      ),
  },
  {
    path: 'card-examples',
    loadComponent: () =>
      import('./pages/card-examples/card-examples.component').then(
        (m) => m.CardExamplesComponent,
      ),
  },
  {
    path: 'badges',
    loadComponent: () =>
      import('./pages/badges-demo/badges-demo.component').then(
        (m) => m.BadgesDemoComponent,
      ),
  },
  {
    path: 'spark-charts',
    loadComponent: () =>
      import('./pages/spark-charts/spark-charts.component').then(
        (m) => m.SparkChartsComponent,
      ),
  },
  {
    path: 'design-tokens',
    loadComponent: () =>
      import('./pages/design-tokens/design-tokens.component').then(
        (m) => m.DesignTokensComponent,
      ),
  },
  {
    path: 'typography',
    loadComponent: () =>
      import('./pages/typography-showcase/typography-showcase.component').then(
        (m) => m.TypographyShowcaseComponent,
      ),
  },
  {
    path: 'aegisx-ui',
    loadComponent: () =>
      import('./pages/aegisx-ui-showcase/aegisx-ui-showcase.component').then(
        (m) => m.AegisxUiShowcaseComponent,
      ),
  },
];
