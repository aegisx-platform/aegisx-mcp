/**
 * Utilities and Dashboard Routes
 *
 * IMPORTANT: Dynamic imports MUST use static string paths.
 * Template literals with variables do NOT work with Webpack/Angular.
 */

import { Route } from '@angular/router';

export const UTILITIES_ROUTES: Route[] = [
  {
    path: 'utilities/theme-switcher',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/utilities/theme-switcher/theme-switcher-doc.component'
      ).then((m) => m.ThemeSwitcherDocComponent),
    data: {
      title: 'Theme Switcher',
      description: 'Theme switcher utility',
    },
  },
  {
    path: 'utilities/layout-switcher',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/utilities/layout-switcher/layout-switcher-doc.component'
      ).then((m) => m.LayoutSwitcherDocComponent),
    data: {
      title: 'Layout Switcher',
      description: 'Layout switcher utility',
    },
  },
  {
    path: 'utilities/theme-builder',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/utilities/theme-builder/theme-builder-doc.component'
      ).then((m) => m.ThemeBuilderDocComponent),
    data: {
      title: 'Theme Builder Doc',
      description: 'Theme builder utility documentation',
    },
  },
];

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: 'dashboard/widget-framework',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/dashboard/widget-framework/widget-framework-doc.component'
      ).then((m) => m.WidgetFrameworkDocComponent),
    data: {
      title: 'Widget Framework',
      description: 'Widget framework documentation',
    },
  },
];
