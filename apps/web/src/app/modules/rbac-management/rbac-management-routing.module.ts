import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/rbac-dashboard/rbac-dashboard.component').then(
        (m) => m.RbacDashboardComponent,
      ),
    canActivate: [AuthGuard],
    data: {
      title: 'RBAC Dashboard',
      description: 'Overview of roles, permissions, and user assignments',
      requiredPermissions: ['rbac.read', 'admin.*'],
    },
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./components/role-management/role-management.component').then(
        (m) => m.RoleManagementComponent,
      ),
    canActivate: [AuthGuard],
    data: {
      title: 'Role Management',
      description: 'Manage system roles and their permissions',
      requiredPermissions: ['rbac.roles.read', 'admin.*'],
    },
  },
  {
    path: 'permissions',
    loadComponent: () =>
      import(
        './components/permission-management/permission-management.component'
      ).then((m) => m.PermissionManagementComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Permission Management',
      description: 'Manage system permissions and access controls',
      requiredPermissions: ['rbac.permissions.read', 'admin.*'],
    },
  },
  {
    path: 'user-roles',
    loadComponent: () =>
      import(
        './components/user-role-assignment/user-role-assignment.component'
      ).then((m) => m.UserRoleAssignmentComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'User Role Assignments',
      description: 'Manage role assignments and user access permissions',
      requiredPermissions: ['rbac.assignments.read', 'admin.*'],
    },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RbacManagementRoutingModule {}
