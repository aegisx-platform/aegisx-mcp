import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';

export const rbacRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/rbac-dashboard/rbac-dashboard.component').then(
        (m) => m.RbacDashboardComponent,
      ),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      title: 'RBAC Dashboard',
      description: 'Overview of roles, permissions, and user assignments',
      permissions: ['dashboard:view', '*:*'],
    },
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./pages/role-management/role-management.component').then(
        (m) => m.RoleManagementComponent,
      ),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      title: 'Role Management',
      description: 'Manage system roles and their permissions',
      permissions: ['roles:read', '*:*'],
    },
  },
  {
    path: 'permissions',
    loadComponent: () =>
      import(
        './pages/permission-management/permission-management.component'
      ).then((m) => m.PermissionManagementComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      title: 'Permission Management',
      description: 'Manage system permissions and access controls',
      permissions: ['permissions:read', '*:*'],
    },
  },
  {
    path: 'user-roles',
    loadComponent: () =>
      import(
        './pages/user-role-assignment/user-role-assignment.component'
      ).then((m) => m.UserRoleAssignmentComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      title: 'User Role Assignments',
      description: 'Manage role assignments and user access permissions',
      permissions: ['user-roles:read', '*:*'],
    },
  },
  {
    path: 'navigation',
    loadComponent: () =>
      import(
        './pages/navigation-management/navigation-management.component'
      ).then((m) => m.NavigationManagementComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      title: 'Navigation Management',
      description: 'Manage application navigation items and menu structure',
      permissions: ['navigation:read', '*:*'],
    },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
