import { Route } from '@angular/router';
import { AuthGuard, GuestGuard } from './core/auth';
import { showcaseGuard } from './pages/component-showcase/guards/showcase.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Authentication routes (guest only)
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login.page').then((m) => m.LoginPage),
    canActivate: [GuestGuard],
  },

  // Protected routes (require authentication)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'realtime-demo',
    loadComponent: () =>
      import('./dev-tools/pages/realtime-demo/realtime-demo.component').then(
        (m) => m.RealtimeDemoComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboards/project',
    loadComponent: () =>
      import('./pages/dashboard/project-dashboard.page').then(
        (m) => m.ProjectDashboardPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then((m) => m.usersRoutes),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/user-profile/user-profile.routes').then(
        (m) => m.userProfileRoutes,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.routes').then(
        (m) => m.settingsRoutes,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'rbac',
    loadChildren: () =>
      import('./features/rbac/rbac.routes').then((m) => m.rbacRoutes),
    canActivate: [AuthGuard],
    data: {
      title: 'RBAC Management',
      description: 'Role-Based Access Control Management System',
      requiredPermissions: ['rbac.read', 'admin.*'],
    },
  },
  {
    path: 'books',
    loadChildren: () =>
      import('./features/books/books.routes').then((m) => m.booksRoutes),
    canActivate: [AuthGuard],
    data: {
      title: 'Books',
      description: 'Books Management System',
      requiredPermissions: ['books.read', 'admin.*'],
    },
  },
  {
    path: 'authors',
    loadChildren: () =>
      import('./features/authors/authors.routes').then((m) => m.authorsRoutes),
    canActivate: [AuthGuard],
    data: {
      title: 'Authors',
      description: 'Authors Management System',
      requiredPermissions: ['authors.read', 'admin.*'],
    },
  },
  {
    path: 'pdf-templates',
    loadChildren: () =>
      import('./features/pdf-templates/pdf-templates.routes').then(
        (m) => m.pdf_templatesRoutes,
      ),
    canActivate: [AuthGuard],
    data: {
      title: 'PDF Templates',
      description: 'PDF Template Management System',
      requiredPermissions: ['templates.read', 'admin.*'],
    },
  },
  {
    path: 'file-upload',
    loadComponent: () =>
      import('./pages/file-upload/file-upload.page').then(
        (m) => m.FileUploadPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'file-upload-demo',
    loadComponent: () =>
      import('./dev-tools/pages/file-upload-demo.page').then(
        (m) => m.FileUploadDemoPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'components',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'buttons',
        loadComponent: () =>
          import('./pages/components/buttons/buttons.page').then(
            (m) => m.ButtonsPage,
          ),
      },
      {
        path: 'cards',
        loadComponent: () =>
          import('./pages/components/cards/cards.page').then(
            (m) => m.CardsPage,
          ),
      },
      {
        path: 'forms',
        loadComponent: () =>
          import('./pages/components/forms/forms.page').then(
            (m) => m.FormsPage,
          ),
      },
      {
        path: 'tables',
        loadComponent: () =>
          import('./pages/components/tables/tables.page').then(
            (m) => m.TablesPage,
          ),
      },
    ],
  },
  {
    path: 'test-ax',
    loadComponent: () =>
      import('./dev-tools/pages/material-demo/material-demo.component').then(
        (m) => m.MaterialDemoComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'icon-test',
    loadComponent: () =>
      import('./dev-tools/components/debug-icons.component').then(
        (m) => m.DebugIconsComponent,
      ),
  },
  {
    path: 'test-navigation',
    loadComponent: () =>
      import('./dev-tools/components/debug-navigation.component').then(
        (m) => m.DebugNavigationComponent,
      ),
  },
  {
    path: 'debug-icons',
    loadComponent: () =>
      import('./dev-tools/components/debug-icons.component').then(
        (m) => m.DebugIconsComponent,
      ),
  },
  {
    path: 'debug-navigation',
    loadComponent: () =>
      import('./dev-tools/components/debug-navigation.component').then(
        (m) => m.DebugNavigationComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'demo/navigation',
    loadComponent: () =>
      import('./dev-tools/demo/navigation-demo.component').then(
        (m) => m.NavigationDemoComponent,
      ),
  },
  {
    path: 'material-demo',
    loadComponent: () =>
      import('./dev-tools/pages/material-demo/material-demo.component').then(
        (m) => m.MaterialDemoComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'component-showcase',
    loadComponent: () =>
      import('./pages/component-showcase/component-showcase.component').then(
        (m) => m.ComponentShowcaseComponent,
      ),
    canActivate: [AuthGuard, showcaseGuard],
  },
  {
    path: 'test-material',
    loadComponent: () =>
      import('./dev-tools/pages/material-demo/material-demo.component').then(
        (m) => m.MaterialDemoComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'test-rbac-websocket',
    loadComponent: () =>
      import('./dev-tools/pages/realtime-demo/realtime-demo.component').then(
        (m) => m.RealtimeDemoComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
