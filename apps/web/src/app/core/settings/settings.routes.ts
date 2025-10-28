import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/settings.component').then((m) => m.SettingsComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Settings',
      description: 'Manage your application preferences and configurations',
    },
  },
];
