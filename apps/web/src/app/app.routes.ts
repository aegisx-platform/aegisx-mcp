import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'components',
    children: [
      {
        path: 'buttons',
        loadComponent: () => import('./pages/components/buttons/buttons.page').then(m => m.ButtonsPage)
      },
      {
        path: 'cards',
        loadComponent: () => import('./pages/components/cards/cards.page').then(m => m.CardsPage)
      },
      {
        path: 'forms',
        loadComponent: () => import('./pages/components/forms/forms.page').then(m => m.FormsPage)
      },
      {
        path: 'tables',
        loadComponent: () => import('./pages/components/tables/tables.page').then(m => m.TablesPage)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
