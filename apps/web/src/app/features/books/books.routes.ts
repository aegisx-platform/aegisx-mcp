import { Routes } from '@angular/router';

export const booksRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/books-list.component').then(
        (m) => m.BookListComponent,
      ),
    title: 'Books',
  },
];
