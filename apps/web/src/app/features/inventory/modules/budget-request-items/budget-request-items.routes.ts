import { Routes } from '@angular/router';

export const budgetRequestItemsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/budget-request-items-list.component').then(
        (m) => m.BudgetRequestItemsListComponent,
      ),
    title: 'Budget Request Items',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/budget-request-items-page.component').then(
        (m) => m.BudgetRequestItemsPageComponent,
      ),
    title: 'Budget Request Items Detail',
  },
];
