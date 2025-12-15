import { Routes } from '@angular/router';

export const departmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/departments-list.component').then(
        (m) => m.DepartmentsListComponent,
      ),
    title: 'Departments',
    data: {
      title: 'Department Management',
      description: 'Manage departments and organizational hierarchy',
    },
  },
];
