import { Routes } from '@angular/router';

export const bankRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/bank-list.component').then(
        (m) => m.BankListComponent,
      ),
    title: 'Bank',
  },
];
