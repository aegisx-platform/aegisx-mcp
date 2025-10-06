import { Routes } from '@angular/router';

export const comprehensive_testsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/comprehensive-tests-list.component').then(
        (m) => m.ComprehensiveTestListComponent,
      ),
    title: 'Comprehensive Tests',
  },
];
