import { Route } from '@angular/router';
import { AuthGuard } from '../../core/auth';
import { environment } from '../../../environments/environment';

/**
 * System Routes
 *
 * All routes under /system use the SystemShellComponent as shell
 * with AxEnterpriseLayoutComponent for navigation.
 */
export const SYSTEM_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./system-shell.component').then((m) => m.SystemShellComponent),
    canActivate: [AuthGuard],
    children: [
      // Dashboard (default route)
      {
        path: '',
        loadComponent: () =>
          import('../../pages/welcome/home.page').then((m) => m.HomePage),
        data: {
          title: 'Dashboard',
          description: 'System Administration Dashboard',
        },
      },

      // Project Dashboard
      {
        path: 'dashboards/project',
        loadComponent: () =>
          import('../../pages/dashboard/project-dashboard.page').then(
            (m) => m.ProjectDashboardPage,
          ),
        data: {
          title: 'Project Dashboard',
          description: 'Project Overview and Analytics',
        },
      },

      // User Management
      {
        path: 'users',
        loadChildren: () =>
          import('../../core/users/users.routes').then((m) => m.usersRoutes),
        data: {
          title: 'User Management',
          description: 'Manage system users',
        },
      },

      // Profile
      {
        path: 'profile',
        loadChildren: () =>
          import('../../core/user-profile/user-profile.routes').then(
            (m) => m.userProfileRoutes,
          ),
        data: {
          title: 'My Profile',
          description: 'User profile and preferences',
        },
      },

      // Settings
      {
        path: 'settings',
        loadChildren: () =>
          import('../../core/settings/settings.routes').then(
            (m) => m.settingsRoutes,
          ),
        data: {
          title: 'Settings',
          description: 'System settings and preferences',
        },
      },

      // RBAC
      {
        path: 'rbac',
        loadChildren: () =>
          import('../../core/rbac/rbac.routes').then((m) => m.rbacRoutes),
        data: {
          title: 'RBAC Management',
          description: 'Role-Based Access Control Management System',
        },
      },

      // Monitoring
      {
        path: 'monitoring',
        loadChildren: () =>
          import('../../core/monitoring/monitoring.routes').then(
            (m) => m.monitoringRoutes,
          ),
        data: {
          title: 'Monitoring',
          description: 'System Monitoring and Error Logs',
        },
      },

      // Audit
      {
        path: 'audit',
        loadChildren: () =>
          import('../../core/audit/audit.routes').then((m) => m.auditRoutes),
        data: {
          title: 'Audit Logs',
          description: 'Login Attempts and File Activity',
        },
      },

      // System Initialization
      {
        path: 'system-init',
        loadChildren: () =>
          import('../../features/system-init/system-init.routes').then(
            (m) => m.SYSTEM_INIT_ROUTES,
          ),
        data: {
          title: 'System Initialization',
          description: 'Manage system initialization and data imports',
        },
      },

      // Tools
      {
        path: 'tools',
        children: [
          {
            path: 'pdf-templates',
            loadChildren: () =>
              import('../../core/pdf-templates/pdf-templates.routes').then(
                (m) => m.pdf_templatesRoutes,
              ),
            data: {
              title: 'PDF Templates',
              description: 'PDF Template Management System',
            },
          },
          {
            path: 'file-upload',
            loadComponent: () =>
              import('../../pages/file-upload/file-upload.page').then(
                (m) => m.FileUploadPage,
              ),
            data: {
              title: 'File Manager',
              description: 'Upload and manage files',
            },
          },
          {
            path: 'theme-showcase',
            loadComponent: () =>
              import('../../pages/theme-showcase/theme-showcase.page').then(
                (m) => m.ThemeShowcasePage,
              ),
            data: {
              title: 'Theme Showcase',
              description: 'Material Components & Theme Testing',
            },
          },
        ],
      },

      // Components
      {
        path: 'components',
        children: [
          {
            path: 'buttons',
            loadComponent: () =>
              import('../../pages/components/buttons/buttons.page').then(
                (m) => m.ButtonsPage,
              ),
            data: {
              title: 'Buttons',
              description: 'Button component showcase',
            },
          },
          {
            path: 'cards',
            loadComponent: () =>
              import('../../pages/components/cards/cards.page').then(
                (m) => m.CardsPage,
              ),
            data: {
              title: 'Cards',
              description: 'Card component showcase',
            },
          },
          {
            path: 'forms',
            loadComponent: () =>
              import('../../pages/components/forms/forms.page').then(
                (m) => m.FormsPage,
              ),
            data: {
              title: 'Forms',
              description: 'Form component showcase',
            },
          },
          {
            path: 'tables',
            loadComponent: () =>
              import('../../pages/components/tables/tables.page').then(
                (m) => m.TablesPage,
              ),
            data: {
              title: 'Tables',
              description: 'Table component showcase',
            },
          },
        ],
      },

      // Dev Tools (only in development)
      ...(environment.production
        ? []
        : [
            {
              path: 'dev',
              loadChildren: () =>
                import('../../dev-tools/dev-tools.routes').then(
                  (m) => m.DEV_TOOLS_ROUTES,
                ),
              data: {
                title: 'Dev Tools',
                description: 'Development & Testing Tools',
              },
            },
          ]),

      // Test Products (Generated CRUD)
      {
        path: 'test-products',
        loadChildren: () =>
          import('../../features/test-products/test-products.routes').then(
            (m) => m.testProductsRoutes,
          ),
        data: {
          title: 'Test Products',
          description: 'Test Products Management System',
          requiredPermissions: ['test-products.read', 'admin.*'],
        },
      },
    ],
  },
];
