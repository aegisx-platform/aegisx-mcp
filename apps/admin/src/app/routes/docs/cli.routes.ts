import { Route } from '@angular/router';

/**
 * CLI Reference Routes
 *
 * Documentation for AegisX CLI commands
 * Base path: /docs/cli
 */
export const CLI_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'reference',
    pathMatch: 'full',
  },
  {
    path: 'reference',
    loadComponent: () =>
      import('../../pages/docs/cli/cli-reference.component').then(
        (m) => m.CliReferenceComponent,
      ),
    data: {
      title: 'CLI Reference',
      description: 'Complete command-line reference for AegisX CRUD Generator',
    },
  },
];
