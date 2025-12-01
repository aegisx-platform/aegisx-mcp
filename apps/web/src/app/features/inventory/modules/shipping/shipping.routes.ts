import { Routes } from '@angular/router';

/**
 * Shipping Module Routes
 *
 * /inventory/shipping             -> Orders
 * /inventory/shipping/picking     -> Picking
 * /inventory/shipping/packing     -> Packing
 * /inventory/shipping/dispatch    -> Dispatch
 */
export const SHIPPING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shipping.page').then((m) => m.ShippingPage),
  },
  {
    path: 'picking',
    loadComponent: () => import('./shipping.page').then((m) => m.ShippingPage),
    data: { view: 'picking' },
  },
  {
    path: 'packing',
    loadComponent: () => import('./shipping.page').then((m) => m.ShippingPage),
    data: { view: 'packing' },
  },
  {
    path: 'dispatch',
    loadComponent: () => import('./shipping.page').then((m) => m.ShippingPage),
    data: { view: 'dispatch' },
  },
];
