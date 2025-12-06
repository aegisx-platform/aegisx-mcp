import { Routes } from '@angular/router';

export const dosageFormsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dosage-forms-list.component').then(
        (m) => m.DosageFormsListComponent,
      ),
    title: 'Dosage Forms',
  },
];
