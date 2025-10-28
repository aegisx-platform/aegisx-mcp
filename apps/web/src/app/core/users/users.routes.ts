import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list.component').then((m) => m.UserListComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Users Management',
      description: 'Manage system users and their permissions',
    },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/user-detail.component').then(
        (m) => m.UserDetailComponent,
      ),
    canActivate: [AuthGuard],
    data: {
      title: 'User Details',
      description: 'View detailed user information',
    },
  },
];
