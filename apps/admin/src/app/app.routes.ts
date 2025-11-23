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
    path: 'kpi-card-demo',
    loadComponent: () =>
      import('./pages/kpi-card-demo/kpi-card-demo.component').then(
        (m) => m.KpiCardDemoComponent,
      ),
  },
  {
    path: 'segmented-progress-demo',
    loadComponent: () =>
      import(
        './pages/segmented-progress-demo/segmented-progress-demo.component'
      ).then((m) => m.SegmentedProgressDemoComponent),
  },
  {
    path: 'circular-progress-demo',
    loadComponent: () =>
      import(
        './pages/circular-progress-demo/circular-progress-demo.component'
      ).then((m) => m.CircularProgressDemoComponent),
  },
  {
    path: 'sparkline-demo',
    loadComponent: () =>
      import('./pages/sparkline-demo/sparkline-demo.component').then(
        (m) => m.SparklineDemoComponent,
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
  // AegisX UI Components Routes
  {
    path: 'aegisx-ui',
    loadComponent: () =>
      import('./pages/aegisx-ui/aegisx-ui.component').then(
        (m) => m.AegisxUiComponent,
      ),
  },
  {
    path: 'aegisx-ui/date-picker',
    loadComponent: () =>
      import(
        './pages/aegisx-ui/date-picker-demo/date-picker-demo.component'
      ).then((m) => m.DatePickerDemoComponent),
  },
  {
    path: 'aegisx-ui/cards',
    loadComponent: () =>
      import('./pages/aegisx-ui/cards-demo/cards-demo.component').then(
        (m) => m.CardsDemoComponent,
      ),
  },
  {
    path: 'aegisx-ui/lists',
    loadComponent: () =>
      import('./pages/aegisx-ui/lists-demo/lists-demo.component').then(
        (m) => m.ListsDemoComponent,
      ),
  },
  {
    path: 'aegisx-ui/data-display',
    loadComponent: () =>
      import(
        './pages/aegisx-ui/data-display-demo/data-display-demo.component'
      ).then((m) => m.DataDisplayDemoComponent),
  },
  {
    path: 'aegisx-ui/avatar',
    loadComponent: () =>
      import('./pages/aegisx-ui/avatar-demo/avatar-demo.component').then(
        (m) => m.AvatarDemoComponent,
      ),
  },
  {
    path: 'aegisx-ui/feedback',
    loadComponent: () =>
      import('./pages/aegisx-ui/feedback-demo/feedback-demo.component').then(
        (m) => m.FeedbackDemoComponent,
      ),
  },
  {
    path: 'aegisx-ui/breadcrumb',
    loadComponent: () =>
      import(
        './pages/aegisx-ui/breadcrumb-demo/breadcrumb-demo.component'
      ).then((m) => m.BreadcrumbDemoComponent),
  },
];
