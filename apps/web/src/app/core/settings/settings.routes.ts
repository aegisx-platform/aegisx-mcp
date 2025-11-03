import { Routes } from '@angular/router';
import { PermissionGuard } from '../rbac/guards/permission.guard';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/settings.component').then((m) => m.SettingsComponent),
    canActivate: [PermissionGuard],
    data: {
      title: 'Settings',
      description: 'Manage your application preferences and configurations',
      permissions: ['settings:view', '*:*'], // Admin only
    },
  },
  {
    path: 'api-keys',
    loadComponent: () =>
      import('../api-keys/pages/api-keys-management.component').then(
        (m) => m.ApiKeysManagementComponent,
      ),
    canActivate: [PermissionGuard],
    data: {
      title: 'API Keys Management',
      description: 'Manage your API keys for programmatic access',
      permissions: ['api-keys:read', '*:*'], // Admin only
    },
  },
];
