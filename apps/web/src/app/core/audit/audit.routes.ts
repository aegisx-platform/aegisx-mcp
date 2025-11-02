import { Routes } from '@angular/router';
import { AuthGuard } from '../auth/guards/auth.guard';

export const auditRoutes: Routes = [
  {
    path: 'login-attempts',
    loadComponent: () =>
      import('./pages/login-attempts/login-attempts.component').then(
        (m) => m.LoginAttemptsComponent,
      ),
    canActivate: [AuthGuard],
    title: 'Login Attempts',
  },
  {
    path: 'file-audit',
    loadComponent: () =>
      import('./pages/file-audit/file-audit.component').then(
        (m) => m.FileAuditComponent,
      ),
    canActivate: [AuthGuard],
    title: 'File Activity',
  },
];
