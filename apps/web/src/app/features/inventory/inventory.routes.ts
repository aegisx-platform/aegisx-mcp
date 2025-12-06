import { Route } from '@angular/router';
import { AuthGuard } from '../../core/auth';

/**
 * Inventory Routes
 *
 * Route structure:
 * /inventory           -> Main page (ax-launcher with all modules)
 * /inventory/dashboard -> Dashboard (analytics, KPIs)
 *
 * CRUD modules are auto-registered at the marked section below.
 */
export const INVENTORY_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./inventory-shell.component').then(
        (m) => m.InventoryShellComponent,
      ),
    canActivate: [AuthGuard],
    children: [
      // Main page - ax-launcher with all modules
      {
        path: '',
        loadComponent: () =>
          import('./pages/main/main.page').then((m) => m.MainPage),
        data: {
          title: 'Inventory',
          description: 'Inventory modules',
        },
      },

      // Dashboard page
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage,
          ),
        data: {
          title: 'Dashboard',
          description: 'Inventory Dashboard',
        },
      },

      // === AUTO-GENERATED ROUTES START ===
      // CRUD modules will be auto-registered here by the generator
      // === AUTO-GENERATED ROUTES END ===
    ],
  },
];
