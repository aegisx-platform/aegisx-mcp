import { Routes } from '@angular/router';

/**
 * Master Data Routes
 *
 * Route structure:
 * /inventory/master-data          -> Launcher grid with all modules
 */
export const MASTER_DATA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./master-data.component').then((m) => m.MasterDataComponent),
    title: 'Master Data',
  },
];
