/**
 * Layout Routes
 *
 * IMPORTANT: Dynamic imports MUST use static string paths.
 * Template literals with variables do NOT work with Webpack/Angular.
 */

import { Route } from '@angular/router';

export const LAYOUT_ROUTES: Route[] = [
  {
    path: 'layout/drawer',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/layout/drawer/drawer-doc.component'
      ).then((m) => m.DrawerDocComponent),
    data: {
      title: 'Drawer',
      description: 'Drawer layout component',
    },
  },
  {
    path: 'layout/splitter',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/layout/splitter/splitter-doc.component'
      ).then((m) => m.SplitterDocComponent),
    data: {
      title: 'Splitter',
      description: 'Splitter layout component',
    },
  },
  {
    path: 'layout/enterprise',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/layout/enterprise/enterprise-layout-doc.component'
      ).then((m) => m.EnterpriseLayoutDocComponent),
    data: {
      title: 'Enterprise Layout',
      description: 'Enterprise layout component',
    },
  },
  {
    path: 'layout/compact',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/layout/compact/compact-layout-doc.component'
      ).then((m) => m.CompactLayoutDocComponent),
    data: {
      title: 'Compact Layout',
      description: 'Compact layout component',
    },
  },
  {
    path: 'layout/empty',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/layout/empty/empty-layout-doc.component'
      ).then((m) => m.EmptyLayoutDocComponent),
    data: {
      title: 'Empty Layout',
      description: 'Empty layout component',
    },
  },
];
