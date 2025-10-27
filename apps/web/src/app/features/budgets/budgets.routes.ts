import { Routes } from '@angular/router';

export const budgetsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/budgets-list.component').then(
        (m) => m.BudgetsListComponent
      ),
    title: 'Budgets'
  }
];