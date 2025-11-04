import { Routes } from '@angular/router';

export const testProductsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/test-products-list.component').then(
        (m) => m.TestProductsListComponent,
      ),
    title: 'Test Products',
  },
];
