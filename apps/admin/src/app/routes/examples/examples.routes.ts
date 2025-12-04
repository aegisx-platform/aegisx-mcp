import { Route } from '@angular/router';

/**
 * Examples Routes - Standalone page examples
 *
 * These are copy-paste friendly page examples that developers can use
 * directly in their projects. Each example is a complete, self-contained page.
 *
 * Route Structure:
 * /examples/error/404         - 404 Not Found page
 * /examples/error/500         - 500 Server Error page
 * /examples/error/403         - 403 Forbidden page
 * /examples/error/maintenance - Maintenance mode page
 * /examples/account/profile   - User profile page
 * /examples/account/settings  - Account settings page
 * /examples/dashboard/analytics  - Analytics dashboard
 * /examples/dashboard/ecommerce  - E-commerce dashboard
 * /examples/auth/login           - Login page
 * /examples/auth/register        - Registration page
 * /examples/auth/forgot-password - Forgot password page
 * /examples/auth/reset-password  - Reset password page
 * /examples/auth/confirm-email   - Email confirmation page
 */
export const EXAMPLES_ROUTES: Route[] = [
  // Redirect /examples to error pages overview
  {
    path: '',
    redirectTo: 'error/404',
    pathMatch: 'full',
  },

  // Error Pages
  {
    path: 'error',
    children: [
      {
        path: '',
        redirectTo: '404',
        pathMatch: 'full',
      },
      {
        path: '404',
        loadComponent: () =>
          import('../../pages/examples/error/error-404.component').then(
            (m) => m.Error404Component,
          ),
        data: {
          layout: 'empty',
          title: '404 Not Found',
          description: 'Page not found error example',
        },
      },
      {
        path: '500',
        loadComponent: () =>
          import('../../pages/examples/error/error-500.component').then(
            (m) => m.Error500Component,
          ),
        data: {
          layout: 'empty',
          title: '500 Server Error',
          description: 'Internal server error example',
        },
      },
      {
        path: '403',
        loadComponent: () =>
          import('../../pages/examples/error/error-403.component').then(
            (m) => m.Error403Component,
          ),
        data: {
          layout: 'empty',
          title: '403 Forbidden',
          description: 'Access denied error example',
        },
      },
      {
        path: 'maintenance',
        loadComponent: () =>
          import('../../pages/examples/error/maintenance.component').then(
            (m) => m.MaintenanceComponent,
          ),
        data: {
          layout: 'empty',
          title: 'Maintenance Mode',
          description: 'Scheduled maintenance page example',
        },
      },
    ],
  },

  // Account Pages
  {
    path: 'account',
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../../pages/examples/account/profile.component').then(
            (m) => m.ProfileExampleComponent,
          ),
        data: {
          layout: 'empty',
          title: 'Profile',
          description: 'User profile page example',
        },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../../pages/examples/account/settings.component').then(
            (m) => m.SettingsExampleComponent,
          ),
        data: {
          layout: 'empty',
          title: 'Settings',
          description: 'Account settings page example',
        },
      },
    ],
  },

  // Dashboard Pages
  {
    path: 'dashboard',
    children: [
      {
        path: '',
        redirectTo: 'analytics',
        pathMatch: 'full',
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import(
            '../../pages/examples/dashboard/analytics-dashboard.component'
          ).then((m) => m.AnalyticsDashboardComponent),
        data: {
          layout: 'empty',
          title: 'Analytics Dashboard',
          description: 'Analytics dashboard example',
        },
      },
      {
        path: 'ecommerce',
        loadComponent: () =>
          import(
            '../../pages/examples/dashboard/ecommerce-dashboard.component'
          ).then((m) => m.EcommerceDashboardComponent),
        data: {
          layout: 'empty',
          title: 'E-commerce Dashboard',
          description: 'E-commerce dashboard example',
        },
      },
    ],
  },

  // Auth Pages
  {
    path: 'auth',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('../../pages/examples/auth/login.component').then(
            (m) => m.LoginComponent,
          ),
        data: {
          layout: 'empty',
          title: 'Login',
          description: 'Login page example',
        },
      },
      {
        path: 'register',
        loadComponent: () =>
          import('../../pages/examples/auth/register.component').then(
            (m) => m.RegisterComponent,
          ),
        data: {
          layout: 'empty',
          title: 'Register',
          description: 'Registration page example',
        },
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('../../pages/examples/auth/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
        data: {
          layout: 'empty',
          title: 'Forgot Password',
          description: 'Forgot password page example',
        },
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('../../pages/examples/auth/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
        data: {
          layout: 'empty',
          title: 'Reset Password',
          description: 'Reset password page example',
        },
      },
      {
        path: 'confirm-email',
        loadComponent: () =>
          import('../../pages/examples/auth/confirm-email.component').then(
            (m) => m.ConfirmEmailComponent,
          ),
        data: {
          layout: 'empty',
          title: 'Confirm Email',
          description: 'Email confirmation page example',
        },
      },
    ],
  },
];
