/**
 * Navigation Routes
 *
 * IMPORTANT: Dynamic imports MUST use static string paths.
 * Template literals with variables do NOT work with Webpack/Angular.
 */

import { Route } from '@angular/router';

export const NAVIGATION_ROUTES: Route[] = [
  {
    path: 'navigation/breadcrumb',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/navigation/breadcrumb/breadcrumb-doc.component'
      ).then((m) => m.BreadcrumbDocComponent),
    data: {
      title: 'Breadcrumb',
      description: 'Breadcrumb navigation component',
    },
  },
  {
    path: 'navigation/stepper',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/navigation/stepper/stepper-doc.component'
      ).then((m) => m.StepperDocComponent),
    data: {
      title: 'Stepper',
      description: 'Stepper component',
    },
  },
  {
    path: 'navigation/launcher',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/navigation/launcher/launcher-doc.component'
      ).then((m) => m.LauncherDocComponent),
    data: {
      title: 'Launcher',
      description: 'App launcher component',
    },
  },
  {
    path: 'navigation/navigation-menu',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/navigation/navigation-menu/navigation-menu-doc.component'
      ).then((m) => m.NavigationMenuDocComponent),
    data: {
      title: 'Navigation Menu',
      description: 'Navigation menu component',
    },
  },
  {
    path: 'navigation/navbar',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/navigation/navbar/navbar-doc.component'
      ).then((m) => m.NavbarDocComponent),
    data: {
      title: 'Navbar',
      description: 'Enterprise navigation bar component',
    },
  },
  {
    path: 'navigation/command-palette',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/navigation/command-palette/command-palette-doc.component'
      ).then((m) => m.CommandPaletteDocComponent),
    data: {
      title: 'Command Palette',
      description: 'Keyboard-first command search and execution',
    },
  },
];
