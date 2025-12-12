import { Routes } from '@angular/router';

export const budgetRequestsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/overview-dashboard/overview-dashboard.component').then(
        (m) => m.OverviewDashboardComponent,
      ),
    title: 'Budget Requests Dashboard',
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./components/budget-requests-list.component').then(
        (m) => m.BudgetRequestsListComponent,
      ),
    title: 'Budget Requests',
  },
  {
    path: ':id/items',
    loadComponent: () =>
      import('./pages/budget-request-detail.component').then(
        (m) => m.BudgetRequestDetailComponent,
      ),
    title: 'Budget Request Items',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/budget-request-edit.component').then(
        (m) => m.BudgetRequestEditComponent,
      ),
    title: 'Edit Budget Request',
  },
];
