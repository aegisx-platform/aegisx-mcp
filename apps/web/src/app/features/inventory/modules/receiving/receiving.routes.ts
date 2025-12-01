import { Routes } from '@angular/router';

/**
 * Receiving Module Routes
 *
 * /inventory/receiving              -> Pending Receipts
 * /inventory/receiving/received     -> Received
 * /inventory/receiving/inspection   -> Quality Check
 */
export const RECEIVING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./receiving.page').then((m) => m.ReceivingPage),
  },
  {
    path: 'received',
    loadComponent: () =>
      import('./receiving.page').then((m) => m.ReceivingPage),
    data: { view: 'received' },
  },
  {
    path: 'inspection',
    loadComponent: () =>
      import('./receiving.page').then((m) => m.ReceivingPage),
    data: { view: 'inspection' },
  },
];
