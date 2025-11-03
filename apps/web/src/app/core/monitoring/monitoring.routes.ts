import { Route } from '@angular/router';
import { PermissionGuard } from '../rbac/guards/permission.guard';

export const monitoringRoutes: Route[] = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/system-dashboard/system-dashboard.component').then(
        (m) => m.DashboardPage,
      ),
    canActivate: [PermissionGuard],
    data: {
      title: 'System Dashboard',
      description:
        'Comprehensive system monitoring dashboard with real-time widgets',
      permissions: ['system:monitoring:read', '*:*'], // Admin or users with monitoring permission
    },
  },
  {
    path: 'system',
    loadComponent: () =>
      import('./pages/system-monitoring/system-monitoring.component').then(
        (m) => m.SystemMonitoringComponent,
      ),
    canActivate: [PermissionGuard],
    data: {
      title: 'System Monitoring',
      description: 'Real-time system metrics and performance monitoring',
      permissions: ['system:monitoring:read', '*:*'], // Admin or users with monitoring permission
    },
  },
  {
    path: 'error-logs',
    loadComponent: () =>
      import('./pages/error-logs/error-logs.component').then(
        (m) => m.ErrorLogsComponent,
      ),
    canActivate: [PermissionGuard],
    data: {
      title: 'Error Logs',
      description: 'View and manage application error logs',
      permissions: ['error-logs:read', '*:*'], // Admin or users with error-logs read permission
    },
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
