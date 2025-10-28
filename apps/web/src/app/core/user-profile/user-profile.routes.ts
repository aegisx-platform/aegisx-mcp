import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';

export const userProfileRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-profile.component').then(
        (m) => m.UserProfileComponent,
      ),
    canActivate: [AuthGuard],
    data: {
      title: 'My Profile',
      description: 'Manage your account information and preferences',
    },
  },
];
