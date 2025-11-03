import { Route } from '@angular/router';
import { AuthGuard, GuestGuard } from './core/auth';
import { environment } from '../environments/environment';

export const appRoutes: Route[] = [
  // Authentication routes (guest only)
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login.page').then((m) => m.LoginPage),
    canActivate: [GuestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-password.page').then(
        (m) => m.ForgotPasswordPage,
      ),
    canActivate: [GuestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register.page').then((m) => m.RegisterPage),
    canActivate: [GuestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/auth/reset-password.page').then(
        (m) => m.ResetPasswordPage,
      ),
    canActivate: [GuestGuard],
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/auth/verify-email.page').then((m) => m.VerifyEmailPage),
    canActivate: [GuestGuard],
  },

  // Protected routes (require authentication)
  {
    path: '',
    loadComponent: () =>
      import('./pages/welcome/home.page').then((m) => m.HomePage),
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
    loadChildren: () =>
      import('./core/users/users.routes').then((m) => m.usersRoutes),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./core/user-profile/user-profile.routes').then(
        (m) => m.userProfileRoutes,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./core/settings/settings.routes').then((m) => m.settingsRoutes),
    canActivate: [AuthGuard],
  },
  {
    path: 'rbac',
    loadChildren: () =>
      import('./core/rbac/rbac.routes').then((m) => m.rbacRoutes),
    canActivate: [AuthGuard],
    data: {
      title: 'RBAC Management',
      description: 'Role-Based Access Control Management System',
    },
  },
  {
    path: 'monitoring',
    loadChildren: () =>
      import('./core/monitoring/monitoring.routes').then(
        (m) => m.monitoringRoutes,
      ),
    canActivate: [AuthGuard],
    data: {
      title: 'Monitoring',
      description: 'System Monitoring and Error Logs',
    },
  },
  {
    path: 'audit',
    loadChildren: () =>
      import('./core/audit/audit.routes').then((m) => m.auditRoutes),
    canActivate: [AuthGuard],
    data: {
      title: 'Audit',
      description: 'Login Attempts and File Activity',
    },
  },
  {
    path: 'pdf-templates',
    loadChildren: () =>
      import('./core/pdf-templates/pdf-templates.routes').then(
        (m) => m.pdf_templatesRoutes,
      ),
    canActivate: [AuthGuard],
    data: {
      title: 'PDF Templates',
      description: 'PDF Template Management System',
    },
  },
  {
    path: 'file-upload',
    loadComponent: () =>
      import('./pages/file-upload/file-upload.page').then(
        (m) => m.FileUploadPage,
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

  // Dev/Test routes (only in development environment)
  ...(environment.production
    ? []
    : [
        {
          path: 'dev',
          loadChildren: () =>
            import('./dev-tools/dev-tools.routes').then(
              (m) => m.DEV_TOOLS_ROUTES,
            ),
          canActivate: [AuthGuard],
          data: {
            title: 'Dev Tools',
            description: 'Development & Testing Tools',
          },
        },
      ]),

  // Error pages (no authentication required)
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

  // Fallback - redirect unknown routes to 404
  {
    path: '**',
    redirectTo: '404',
  },
];
