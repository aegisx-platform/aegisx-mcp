import { Routes } from '@angular/router';

/**
 * Warehouse Module Routes
 *
 * /inventory/warehouse              -> Stock Overview
 * /inventory/warehouse/locations    -> Locations
 * /inventory/warehouse/counts       -> Stock Counts
 * /inventory/warehouse/transfers    -> Transfers
 */
export const WAREHOUSE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./warehouse.page').then((m) => m.WarehousePage),
  },
  {
    path: 'locations',
    loadComponent: () =>
      import('./warehouse.page').then((m) => m.WarehousePage),
    data: { view: 'locations' },
  },
  {
    path: 'counts',
    loadComponent: () =>
      import('./warehouse.page').then((m) => m.WarehousePage),
    data: { view: 'counts' },
  },
  {
    path: 'transfers',
    loadComponent: () =>
      import('./warehouse.page').then((m) => m.WarehousePage),
    data: { view: 'transfers' },
  },
];
