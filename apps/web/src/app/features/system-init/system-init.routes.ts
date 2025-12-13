import { Routes } from '@angular/router';

/**
 * System Initialization Feature Routes
 *
 * This module provides routing for the System Initialization Dashboard feature.
 * All routes are lazy-loaded and include metadata for breadcrumb and page title.
 */
export const SYSTEM_INIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/system-init-dashboard/system-init-dashboard.page').then(
        (m) => m.SystemInitDashboardPage,
      ),
    data: {
      title: 'System Initialization',
      breadcrumb: 'System Init',
      description: 'Manage system initialization and data imports',
    },
  },
];
