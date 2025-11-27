import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  // ============================================
  // ROOT REDIRECT
  // ============================================
  {
    path: '',
    redirectTo: 'docs/getting-started/introduction',
    pathMatch: 'full',
  },

  // ============================================
  // DOCUMENTATION ROUTES - /docs/*
  // ============================================

  // --- Getting Started ---
  {
    path: 'docs/getting-started/introduction',
    loadComponent: () =>
      import(
        './pages/docs/getting-started/introduction/introduction-doc.component'
      ).then((m) => m.IntroductionDocComponent),
  },
  {
    path: 'docs/getting-started/installation',
    loadComponent: () =>
      import(
        './pages/docs/getting-started/installation/installation-doc.component'
      ).then((m) => m.InstallationDocComponent),
  },
  {
    path: 'docs/getting-started/quick-start',
    loadComponent: () =>
      import(
        './pages/docs/getting-started/quick-start/quick-start-doc.component'
      ).then((m) => m.QuickStartDocComponent),
  },

  // --- Foundations ---
  {
    path: 'docs/foundations/overview',
    loadComponent: () =>
      import(
        './pages/docs/foundations/overview/foundations-overview.component'
      ).then((m) => m.FoundationsOverviewComponent),
  },
  {
    path: 'docs/foundations/design-tokens',
    loadComponent: () =>
      import(
        './pages/docs/foundations/design-tokens/design-tokens.component'
      ).then((m) => m.DesignTokensComponent),
  },
  {
    path: 'docs/foundations/colors',
    loadComponent: () =>
      import('./pages/docs/foundations/colors/colors.component').then(
        (m) => m.ColorsComponent,
      ),
  },
  {
    path: 'docs/foundations/typography',
    loadComponent: () =>
      import(
        './pages/docs/foundations/typography/typography-showcase.component'
      ).then((m) => m.TypographyShowcaseComponent),
  },
  {
    path: 'docs/foundations/spacing',
    loadComponent: () =>
      import('./pages/docs/foundations/spacing/spacing.component').then(
        (m) => m.SpacingComponent,
      ),
  },
  {
    path: 'docs/foundations/shadows',
    loadComponent: () =>
      import('./pages/docs/foundations/shadows/shadows.component').then(
        (m) => m.ShadowsComponent,
      ),
  },
  {
    path: 'docs/foundations/motion',
    loadComponent: () =>
      import('./pages/docs/foundations/motion/motion.component').then(
        (m) => m.MotionComponent,
      ),
  },

  // --- Components > AegisX > Data Display ---
  {
    path: 'docs/components/aegisx/data-display/overview',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/data-display/overview/data-display-demo.component'
      ).then((m) => m.DataDisplayDemoComponent),
  },
  {
    path: 'docs/components/aegisx/data-display/card',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/data-display/card/card-doc.component'
      ).then((m) => m.CardDocComponent),
  },
  {
    path: 'docs/components/aegisx/data-display/kpi-card',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/data-display/kpi-card/kpi-card-doc.component'
      ).then((m) => m.KpiCardDocComponent),
  },
  {
    path: 'docs/components/aegisx/data-display/badge',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/data-display/badge/badge-doc.component'
      ).then((m) => m.BadgeDocComponent),
  },
  {
    path: 'docs/components/aegisx/data-display/avatar',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/data-display/avatar/avatar-doc.component'
      ).then((m) => m.AvatarDocComponent),
  },
  {
    path: 'docs/components/aegisx/data-display/list',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/data-display/list/list-doc.component'
      ).then((m) => m.ListDocComponent),
  },

  // --- Components > AegisX > Charts ---
  {
    path: 'docs/components/aegisx/charts/sparkline',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/charts/sparkline/sparkline-demo.component'
      ).then((m) => m.SparklineDemoComponent),
  },
  {
    path: 'docs/components/aegisx/charts/circular-progress',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/charts/circular-progress/circular-progress-demo.component'
      ).then((m) => m.CircularProgressDemoComponent),
  },
  {
    path: 'docs/components/aegisx/charts/segmented-progress',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/charts/segmented-progress/segmented-progress-demo.component'
      ).then((m) => m.SegmentedProgressDemoComponent),
  },

  // --- Components > AegisX > Forms ---
  {
    path: 'docs/components/aegisx/forms/date-picker',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/forms/date-picker/date-picker-doc.component'
      ).then((m) => m.DatePickerDocComponent),
  },
  {
    path: 'docs/components/aegisx/forms/file-upload',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/forms/file-upload/file-upload-doc.component'
      ).then((m) => m.FileUploadDocComponent),
  },

  // --- Components > AegisX > Feedback ---
  {
    path: 'docs/components/aegisx/feedback/alert',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/feedback/alert/alert-doc.component'
      ).then((m) => m.AlertDocComponent),
  },
  {
    path: 'docs/components/aegisx/feedback/loading-bar',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/feedback/loading-bar/loading-bar-doc.component'
      ).then((m) => m.LoadingBarDocComponent),
  },
  {
    path: 'docs/components/aegisx/feedback/dialogs',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/feedback/dialogs/dialogs-doc.component'
      ).then((m) => m.DialogsDocComponent),
  },
  {
    path: 'docs/components/aegisx/feedback/toast',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/feedback/toast/toast-doc.component'
      ).then((m) => m.ToastDocComponent),
  },
  {
    path: 'docs/components/aegisx/feedback/skeleton',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/feedback/skeleton/skeleton-doc.component'
      ).then((m) => m.SkeletonDocComponent),
  },

  // --- Components > AegisX > Navigation ---
  {
    path: 'docs/components/aegisx/navigation/breadcrumb',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/navigation/breadcrumb/breadcrumb-doc.component'
      ).then((m) => m.BreadcrumbDocComponent),
  },
  {
    path: 'docs/components/aegisx/navigation/stepper',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/navigation/stepper/stepper-doc.component'
      ).then((m) => m.StepperDocComponent),
  },

  // --- Components > AegisX > Layout ---
  {
    path: 'docs/components/aegisx/layout/drawer',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/layout/drawer/drawer-doc.component'
      ).then((m) => m.DrawerDocComponent),
  },

  // --- Components > Material (placeholder for future) ---
  // TODO: Add Material component docs

  // --- Patterns ---
  {
    path: 'docs/patterns/form-sizes',
    loadComponent: () =>
      import('./pages/docs/patterns/form-sizes/form-sizes-doc.component').then(
        (m) => m.FormSizesDocComponent,
      ),
  },
  {
    path: 'docs/patterns/form-layouts',
    loadComponent: () =>
      import(
        './pages/docs/patterns/form-layouts/form-layouts-doc.component'
      ).then((m) => m.FormLayoutsDocComponent),
  },

  // ============================================
  // PLAYGROUND ROUTES - /playground/*
  // ============================================

  // --- Page Templates ---
  {
    path: 'playground/pages/login',
    loadComponent: () =>
      import('./pages/playground/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'playground/pages/dashboard',
    loadComponent: () =>
      import('./pages/playground/pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'playground/pages/user-management',
    loadComponent: () =>
      import(
        './pages/playground/pages/user-management/user-management.component'
      ).then((m) => m.UserManagementComponent),
  },

  // --- Experiments ---
  {
    path: 'playground/experiments/components',
    loadComponent: () =>
      import(
        './pages/playground/experiments/components-demo/components-demo.component'
      ).then((m) => m.ComponentsDemoComponent),
  },
  {
    path: 'playground/experiments/cards',
    loadComponent: () =>
      import(
        './pages/playground/experiments/card-examples/card-examples.component'
      ).then((m) => m.CardExamplesComponent),
  },
  {
    path: 'playground/experiments/prose',
    loadComponent: () =>
      import(
        './pages/playground/experiments/prose-demo/prose-demo.component'
      ).then((m) => m.ProseDemoComponent),
  },
  {
    path: 'playground/experiments/charts',
    loadComponent: () =>
      import(
        './pages/playground/experiments/spark-charts/spark-charts.component'
      ).then((m) => m.SparkChartsComponent),
  },

  // ============================================
  // STANDALONE ROUTES
  // ============================================
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/playground/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },

  // ============================================
  // LEGACY REDIRECTS (old routes → new routes)
  // ============================================

  // Getting Started redirects
  {
    path: 'introduction',
    redirectTo: 'docs/getting-started/introduction',
    pathMatch: 'full',
  },
  {
    path: 'installation',
    redirectTo: 'docs/getting-started/installation',
    pathMatch: 'full',
  },
  {
    path: 'quick-start',
    redirectTo: 'docs/getting-started/quick-start',
    pathMatch: 'full',
  },

  // Foundations redirects
  {
    path: 'design-tokens',
    redirectTo: 'docs/foundations/design-tokens',
    pathMatch: 'full',
  },
  {
    path: 'typography',
    redirectTo: 'docs/foundations/typography',
    pathMatch: 'full',
  },

  // Old component routes → new aegisx routes
  {
    path: 'docs/components/data-display/overview',
    redirectTo: 'docs/components/aegisx/data-display/overview',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/data-display/card',
    redirectTo: 'docs/components/aegisx/data-display/card',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/data-display/badge',
    redirectTo: 'docs/components/aegisx/data-display/badge',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/data-display/avatar',
    redirectTo: 'docs/components/aegisx/data-display/avatar',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/data-display/list',
    redirectTo: 'docs/components/aegisx/data-display/list',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/data-display/kpi-card',
    redirectTo: 'docs/components/aegisx/data-display/kpi-card',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/data-display/sparkline',
    redirectTo: 'docs/components/aegisx/charts/sparkline',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/data-display/circular-progress',
    redirectTo: 'docs/components/aegisx/charts/circular-progress',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/data-display/segmented-progress',
    redirectTo: 'docs/components/aegisx/charts/segmented-progress',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/forms/date-picker',
    redirectTo: 'docs/components/aegisx/forms/date-picker',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/feedback/alert',
    redirectTo: 'docs/components/aegisx/feedback/alert',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/feedback/loading-bar',
    redirectTo: 'docs/components/aegisx/feedback/loading-bar',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/feedback/dialogs',
    redirectTo: 'docs/components/aegisx/feedback/dialogs',
    pathMatch: 'full',
  },
  {
    path: 'docs/components/navigation/breadcrumb',
    redirectTo: 'docs/components/aegisx/navigation/breadcrumb',
    pathMatch: 'full',
  },

  // Examples redirects → playground
  {
    path: 'docs/examples/dashboard',
    redirectTo: 'playground/pages/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'docs/examples/user-management',
    redirectTo: 'playground/pages/user-management',
    pathMatch: 'full',
  },
  {
    path: 'docs/examples/components',
    redirectTo: 'playground/experiments/components',
    pathMatch: 'full',
  },
  {
    path: 'docs/examples/card-examples',
    redirectTo: 'playground/experiments/cards',
    pathMatch: 'full',
  },

  // Other legacy redirects
  {
    path: 'dashboard',
    redirectTo: 'playground/pages/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'users',
    redirectTo: 'playground/pages/user-management',
    pathMatch: 'full',
  },
  {
    path: 'components',
    redirectTo: 'playground/experiments/components',
    pathMatch: 'full',
  },
  {
    path: 'form-sizes',
    redirectTo: 'docs/patterns/form-sizes',
    pathMatch: 'full',
  },
  {
    path: 'form-layouts',
    redirectTo: 'docs/patterns/form-layouts',
    pathMatch: 'full',
  },
  {
    path: 'badges',
    redirectTo: 'docs/components/aegisx/data-display/badge',
    pathMatch: 'full',
  },
  {
    path: 'kpi-card-demo',
    redirectTo: 'docs/components/aegisx/data-display/kpi-card',
    pathMatch: 'full',
  },
  {
    path: 'card-examples',
    redirectTo: 'playground/experiments/cards',
    pathMatch: 'full',
  },
  {
    path: 'sparkline-demo',
    redirectTo: 'docs/components/aegisx/charts/sparkline',
    pathMatch: 'full',
  },
  {
    path: 'circular-progress-demo',
    redirectTo: 'docs/components/aegisx/charts/circular-progress',
    pathMatch: 'full',
  },
  {
    path: 'segmented-progress-demo',
    redirectTo: 'docs/components/aegisx/charts/segmented-progress',
    pathMatch: 'full',
  },
  {
    path: 'aegisx-ui',
    redirectTo: 'docs/components/aegisx/data-display/overview',
    pathMatch: 'full',
  },
  {
    path: 'aegisx-ui/cards',
    redirectTo: 'docs/components/aegisx/data-display/card',
    pathMatch: 'full',
  },
  {
    path: 'aegisx-ui/lists',
    redirectTo: 'docs/components/aegisx/data-display/list',
    pathMatch: 'full',
  },
  {
    path: 'aegisx-ui/data-display',
    redirectTo: 'docs/components/aegisx/data-display/overview',
    pathMatch: 'full',
  },
  {
    path: 'aegisx-ui/avatar',
    redirectTo: 'docs/components/aegisx/data-display/avatar',
    pathMatch: 'full',
  },
  {
    path: 'aegisx-ui/date-picker',
    redirectTo: 'docs/components/aegisx/forms/date-picker',
    pathMatch: 'full',
  },
  {
    path: 'aegisx-ui/alerts',
    redirectTo: 'docs/components/aegisx/feedback/alert',
    pathMatch: 'full',
  },
  {
    path: 'aegisx-ui/loading-bar',
    redirectTo: 'docs/components/aegisx/feedback/loading-bar',
    pathMatch: 'full',
  },
  {
    path: 'aegisx-ui/breadcrumb',
    redirectTo: 'docs/components/aegisx/navigation/breadcrumb',
    pathMatch: 'full',
  },
  {
    path: 'aegisx-ui/dialogs',
    redirectTo: 'docs/components/aegisx/feedback/dialogs',
    pathMatch: 'full',
  },
  {
    path: 'prose-demo',
    redirectTo: 'playground/experiments/prose',
    pathMatch: 'full',
  },
  {
    path: 'spark-charts',
    redirectTo: 'playground/experiments/charts',
    pathMatch: 'full',
  },
];
