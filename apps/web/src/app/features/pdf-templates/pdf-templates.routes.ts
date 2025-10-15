import { Routes } from '@angular/router';

export const pdf_templatesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/pdf-templates-list.component').then(
        (m) => m.PdfTemplateListComponent
      ),
    title: 'Pdf Templates'
  }
];