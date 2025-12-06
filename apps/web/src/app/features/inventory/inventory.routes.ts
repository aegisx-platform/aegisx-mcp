import { Route } from '@angular/router';
import { AuthGuard } from '../../core/auth';

/**
 * Inventory Routes
 *
 * All routes under /inventory use the InventoryShellComponent as shell
 * with AxEnterpriseLayoutComponent for navigation.
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
      // Dashboard (default route)
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage,
          ),
        data: {
          title: 'Dashboard',
          description: 'Inventory Dashboard',
        },
      },

      // Master Data (launcher for CRUD modules)
      {
        path: 'master-data',
        loadComponent: () =>
          import('./pages/master-data/master-data.page').then(
            (m) => m.MasterDataPage,
          ),
        data: {
          title: 'Master Data',
          description: 'Inventory Master Data',
        },
      },

      // === AUTO-GENERATED ROUTES START ===
      // CRUD modules will be auto-registered here by the generator
      // === AUTO-GENERATED ROUTES END ===
    ],
  },
];
