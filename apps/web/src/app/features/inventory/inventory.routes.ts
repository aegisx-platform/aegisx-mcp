import { Routes } from '@angular/router';
import { InventoryShellComponent } from './inventory-shell.component';

/**
 * Inventory Feature Routes
 *
 * Main route structure:
 * /inventory                    -> Dashboard (default)
 * /inventory/dashboard          -> Dashboard module
 * /inventory/warehouse          -> Warehouse module
 * /inventory/receiving          -> Receiving module
 * /inventory/shipping           -> Shipping module
 */
export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    component: InventoryShellComponent,
    children: [
      // Default redirect to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      // Dashboard module
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./modules/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },

      // Warehouse module
      {
        path: 'warehouse',
        loadChildren: () =>
          import('./modules/warehouse/warehouse.routes').then(
            (m) => m.WAREHOUSE_ROUTES,
          ),
      },

      // Receiving module
      {
        path: 'receiving',
        loadChildren: () =>
          import('./modules/receiving/receiving.routes').then(
            (m) => m.RECEIVING_ROUTES,
          ),
      },

      // Shipping module
      {
        path: 'shipping',
        loadChildren: () =>
          import('./modules/shipping/shipping.routes').then(
            (m) => m.SHIPPING_ROUTES,
          ),
      },
    ],
  },
];
