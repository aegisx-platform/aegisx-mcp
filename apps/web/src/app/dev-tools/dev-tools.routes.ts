import { Routes } from '@angular/router';

export const DEV_TOOLS_ROUTES: Routes = [
  {
    path: 'test-ax',
    loadComponent: () =>
      import('./pages/material-demo/material-demo.component').then(
        (c) => c.MaterialDemoComponent,
      ),
    title: 'Test AX Component',
  },
  {
    path: 'realtime-demo',
    loadComponent: () =>
      import('./pages/realtime-demo/realtime-demo.component').then(
        (c) => c.RealtimeDemoComponent,
      ),
    title: 'Realtime Demo',
  },
  {
    path: 'material-demo',
    loadComponent: () =>
      import('./pages/material-demo/material-demo.component').then(
        (c) => c.MaterialDemoComponent,
      ),
    title: 'Material Demo',
  },
  {
    path: 'file-upload-demo',
    loadComponent: () =>
      import('./pages/file-upload-demo.page').then((c) => c.FileUploadDemoPage),
    title: 'File Upload Demo',
  },
  {
    path: 'test-navigation',
    loadComponent: () =>
      import('./components/debug-navigation.component').then(
        (c) => c.DebugNavigationComponent,
      ),
    title: 'Test Navigation',
  },
  {
    path: 'test-rbac-websocket',
    loadComponent: () =>
      import('./pages/realtime-demo/realtime-demo.component').then(
        (c) => c.RealtimeDemoComponent,
      ),
    title: 'Test RBAC WebSocket',
  },
  {
    path: 'debug-icons',
    loadComponent: () =>
      import('./components/debug-icons.component').then(
        (c) => c.DebugIconsComponent,
      ),
    title: 'Debug Icons',
  },
  {
    path: 'debug-navigation',
    loadComponent: () =>
      import('./components/debug-navigation.component').then(
        (c) => c.DebugNavigationComponent,
      ),
    title: 'Debug Navigation',
  },
  {
    path: 'icon-test',
    loadComponent: () =>
      import('./components/debug-icons.component').then(
        (c) => c.DebugIconsComponent,
      ),
    title: 'Icon Test',
  },
  {
    path: 'navigation-demo',
    loadComponent: () =>
      import('./demo/navigation-demo.component').then(
        (c) => c.NavigationDemoComponent,
      ),
    title: 'Navigation Demo',
  },
  {
    path: 'test-material',
    loadComponent: () =>
      import('./pages/material-demo/material-demo.component').then(
        (c) => c.MaterialDemoComponent,
      ),
    title: 'Test Material',
  },
];
