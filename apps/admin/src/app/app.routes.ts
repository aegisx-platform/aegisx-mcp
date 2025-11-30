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

  // --- Components > AegisX > Overview ---
  {
    path: 'docs/components/aegisx/overview',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/overview/components-overview.component'
      ).then((m) => m.ComponentsOverviewComponent),
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
  {
    path: 'docs/components/aegisx/data-display/calendar',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/data-display/calendar/calendar-doc.component'
      ).then((m) => m.CalendarDocComponent),
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
  {
    path: 'docs/components/aegisx/forms/popup-edit',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/forms/popup-edit/popup-edit-doc.component'
      ).then((m) => m.PopupEditDocComponent),
  },
  {
    path: 'docs/components/aegisx/forms/knob',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/forms/knob/knob-doc.component'
      ).then((m) => m.KnobDocComponent),
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
    path: 'docs/components/aegisx/feedback/inner-loading',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/feedback/inner-loading/inner-loading-doc.component'
      ).then((m) => m.InnerLoadingDocComponent),
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
  {
    path: 'docs/components/aegisx/navigation/launcher',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/navigation/launcher/launcher-doc.component'
      ).then((m) => m.LauncherDocComponent),
  },

  // --- Components > AegisX > Layout ---
  {
    path: 'docs/components/aegisx/layout/drawer',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/layout/drawer/drawer-doc.component'
      ).then((m) => m.DrawerDocComponent),
  },
  {
    path: 'docs/components/aegisx/layout/splitter',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/layout/splitter/splitter-doc.component'
      ).then((m) => m.SplitterDocComponent),
  },
  {
    path: 'docs/components/aegisx/layout/enterprise',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/layout/enterprise/enterprise-layout-doc.component'
      ).then((m) => m.EnterpriseLayoutDocComponent),
  },

  // --- Components > AegisX > Dashboard ---
  {
    path: 'docs/components/aegisx/dashboard/widget-framework',
    loadComponent: () =>
      import(
        './pages/docs/components/aegisx/dashboard/widget-framework/widget-framework-doc.component'
      ).then((m) => m.WidgetFrameworkDocComponent),
  },

  // --- Integrations ---
  {
    path: 'docs/integrations/overview',
    loadComponent: () =>
      import(
        './pages/docs/integrations/overview/integrations-overview.component'
      ).then((m) => m.IntegrationsOverviewComponent),
  },
  {
    path: 'docs/integrations/gridster',
    loadComponent: () =>
      import('./pages/docs/integrations/gridster/gridster-doc.component').then(
        (m) => m.GridsterDocComponent,
      ),
  },
  {
    path: 'docs/integrations/qrcode',
    loadComponent: () =>
      import('./pages/docs/integrations/qrcode/qrcode-doc.component').then(
        (m) => m.QRCodeDocComponent,
      ),
  },

  // --- Components > Material ---
  {
    path: 'docs/material/overview',
    loadComponent: () =>
      import('./pages/docs/material/material-overview.component').then(
        (m) => m.MaterialOverviewComponent,
      ),
  },
  {
    path: 'docs/material/button',
    loadComponent: () =>
      import('./pages/docs/material/button/material-button-doc.component').then(
        (m) => m.MaterialButtonDocComponent,
      ),
  },
  {
    path: 'docs/material/card',
    loadComponent: () =>
      import('./pages/docs/material/card/material-card-doc.component').then(
        (m) => m.MaterialCardDocComponent,
      ),
  },
  {
    path: 'docs/material/table',
    loadComponent: () =>
      import('./pages/docs/material/table/material-table-doc.component').then(
        (m) => m.MaterialTableDocComponent,
      ),
  },
  {
    path: 'docs/material/form-field',
    loadComponent: () =>
      import(
        './pages/docs/material/form-field/material-form-field-doc.component'
      ).then((m) => m.MaterialFormFieldDocComponent),
  },
  {
    path: 'docs/material/chips',
    loadComponent: () =>
      import('./pages/docs/material/chips/material-chips-doc.component').then(
        (m) => m.MaterialChipsDocComponent,
      ),
  },
  {
    path: 'docs/material/dialog',
    loadComponent: () =>
      import('./pages/docs/material/dialog/material-dialog-doc.component').then(
        (m) => m.MaterialDialogDocComponent,
      ),
  },
  {
    path: 'docs/material/menu',
    loadComponent: () =>
      import('./pages/docs/material/menu/material-menu-doc.component').then(
        (m) => m.MaterialMenuDocComponent,
      ),
  },
  {
    path: 'docs/material/tabs',
    loadComponent: () =>
      import('./pages/docs/material/tabs/material-tabs-doc.component').then(
        (m) => m.MaterialTabsDocComponent,
      ),
  },
  {
    path: 'docs/material/fab',
    loadComponent: () =>
      import('./pages/docs/material/fab/material-fab-doc.component').then(
        (m) => m.MaterialFabDocComponent,
      ),
  },
  {
    path: 'docs/material/select',
    loadComponent: () =>
      import('./pages/docs/material/select/material-select-doc.component').then(
        (m) => m.MaterialSelectDocComponent,
      ),
  },
  {
    path: 'docs/material/progress',
    loadComponent: () =>
      import(
        './pages/docs/material/progress/material-progress-doc.component'
      ).then((m) => m.MaterialProgressDocComponent),
  },
  {
    path: 'docs/material/tooltip',
    loadComponent: () =>
      import(
        './pages/docs/material/tooltip/material-tooltip-doc.component'
      ).then((m) => m.MaterialTooltipDocComponent),
  },
  {
    path: 'docs/material/checkbox',
    loadComponent: () =>
      import(
        './pages/docs/material/checkbox/material-checkbox-doc.component'
      ).then((m) => m.MaterialCheckboxDocComponent),
  },
  {
    path: 'docs/material/slider',
    loadComponent: () =>
      import('./pages/docs/material/slider/material-slider-doc.component').then(
        (m) => m.MaterialSliderDocComponent,
      ),
  },
  {
    path: 'docs/material/snackbar',
    loadComponent: () =>
      import(
        './pages/docs/material/snackbar/material-snackbar-doc.component'
      ).then((m) => m.MaterialSnackbarDocComponent),
  },
  {
    path: 'docs/material/expansion',
    loadComponent: () =>
      import(
        './pages/docs/material/expansion/material-expansion-doc.component'
      ).then((m) => m.MaterialExpansionDocComponent),
  },
  {
    path: 'docs/material/list',
    loadComponent: () =>
      import('./pages/docs/material/list/material-list-doc.component').then(
        (m) => m.MaterialListDocComponent,
      ),
  },
  {
    path: 'docs/material/icon',
    loadComponent: () =>
      import('./pages/docs/material/icon/material-icon-doc.component').then(
        (m) => m.MaterialIconDocComponent,
      ),
  },
  {
    path: 'docs/material/button-toggle',
    loadComponent: () =>
      import(
        './pages/docs/material/button-toggle/material-button-toggle-doc.component'
      ).then((m) => m.MaterialButtonToggleDocComponent),
  },
  {
    path: 'docs/material/datepicker',
    loadComponent: () =>
      import(
        './pages/docs/material/datepicker/material-datepicker-doc.component'
      ).then((m) => m.MaterialDatepickerDocComponent),
  },
  {
    path: 'docs/material/progress-bar',
    loadComponent: () =>
      import(
        './pages/docs/material/progress-bar/material-progress-bar-doc.component'
      ).then((m) => m.MaterialProgressBarDocComponent),
  },
  // Placeholder routes for other Material components
  {
    path: 'docs/material/:component',
    loadComponent: () =>
      import('./pages/docs/material/material-placeholder.component').then(
        (m) => m.MaterialPlaceholderComponent,
      ),
  },

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
  {
    path: 'enterprise-demo',
    loadComponent: () =>
      import('./pages/enterprise-demo/enterprise-demo.component').then(
        (m) => m.EnterpriseDemoComponent,
      ),
  },
  {
    path: 'inventory-demo',
    loadComponent: () =>
      import('./pages/inventory-demo/inventory-shell.component').then(
        (m) => m.InventoryShellComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/inventory-demo/pages/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./pages/inventory-demo/pages/stock.component').then(
            (m) => m.StockComponent,
          ),
      },
      {
        path: 'purchase',
        loadComponent: () =>
          import('./pages/inventory-demo/pages/purchase.component').then(
            (m) => m.PurchaseComponent,
          ),
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./pages/inventory-demo/pages/suppliers.component').then(
            (m) => m.SuppliersComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/inventory-demo/pages/reports.component').then(
            (m) => m.ReportsComponent,
          ),
      },
    ],
  },
  {
    path: 'his-demo',
    loadComponent: () =>
      import('./pages/his-demo/his-shell.component').then(
        (m) => m.HisShellComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/his-demo/pages/dashboard.component').then(
            (m) => m.HisDashboardComponent,
          ),
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./pages/his-demo/pages/patients.component').then(
            (m) => m.PatientsComponent,
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./pages/his-demo/pages/appointments.component').then(
            (m) => m.AppointmentsComponent,
          ),
      },
      {
        path: 'lab-results',
        loadComponent: () =>
          import('./pages/his-demo/pages/lab-results.component').then(
            (m) => m.LabResultsComponent,
          ),
      },
      {
        path: 'pharmacy',
        loadComponent: () =>
          import('./pages/his-demo/pages/pharmacy.component').then(
            (m) => m.PharmacyComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/his-demo/pages/reports.component').then(
            (m) => m.HisReportsComponent,
          ),
      },
      {
        path: 'appointment-calendar',
        loadComponent: () =>
          import(
            './pages/his-demo/pages/appointment-calendar/appointment-calendar.component'
          ).then((m) => m.AppointmentCalendarComponent),
        data: { title: 'ระบบนัดหมายคนไข้' },
      },
      {
        path: 'followup-demo',
        loadComponent: () =>
          import(
            './pages/his-demo/pages/followup-demo/followup-demo.component'
          ).then((m) => m.FollowupDemoComponent),
        data: { title: 'Follow-up Booking Demo' },
      },
    ],
  },
  {
    path: 'app-launcher-demo',
    loadComponent: () =>
      import('./pages/app-launcher-demo/app-launcher-demo.component').then(
        (m) => m.AppLauncherDemoComponent,
      ),
  },
  {
    path: 'gridster-demo',
    loadComponent: () =>
      import('./pages/gridster-demo/gridster-demo.component').then(
        (m) => m.GridsterDemoComponent,
      ),
  },
  {
    path: 'gridster-poc',
    loadComponent: () =>
      import('./pages/gridster-poc/gridster-poc.component').then(
        (m) => m.GridsterPocComponent,
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
    redirectTo: 'docs/components/aegisx/overview',
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
    redirectTo: 'docs/components/aegisx/overview',
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

  // ============================================
  // WIDGET FRAMEWORK DEMO
  // ============================================
  {
    path: 'widget-demo',
    loadComponent: () =>
      import('./pages/widget-demo/widget-demo.component').then(
        (m) => m.WidgetDemoComponent,
      ),
  },
];
