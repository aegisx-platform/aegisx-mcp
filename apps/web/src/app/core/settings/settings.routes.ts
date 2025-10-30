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
  {
    path: 'api-keys',
    loadComponent: () =>
      import('../api-keys/pages/api-keys-management.component').then(
        (m) => m.ApiKeysManagementComponent,
      ),
    canActivate: [AuthGuard],
    data: {
      title: 'API Keys Management',
      description: 'Manage your API keys for programmatic access',
    },
  },
];
