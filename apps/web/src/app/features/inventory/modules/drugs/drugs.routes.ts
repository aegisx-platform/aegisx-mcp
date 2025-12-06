import { Routes } from '@angular/router';

export const drugsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/drugs-list.component').then(
        (m) => m.DrugsListComponent,
      ),
    title: 'Drugs',
  },
];
