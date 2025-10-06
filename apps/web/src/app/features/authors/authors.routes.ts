import { Routes } from '@angular/router';

export const authorsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/authors-list.component').then(
        (m) => m.AuthorListComponent,
      ),
    title: 'Authors',
  },
];
