import { Route } from '@angular/router';

/**
 * Examples Routes - Standalone page examples
 *
 * These are copy-paste friendly page examples that developers can use
 * directly in their projects. Each example is a complete, self-contained page.
 *
 * Route Structure:
 * /examples/error/404      - 404 Not Found page
 * /examples/error/500      - 500 Server Error page
 * /examples/error/403      - 403 Forbidden page
 * /examples/error/maintenance - Maintenance mode page
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
];
