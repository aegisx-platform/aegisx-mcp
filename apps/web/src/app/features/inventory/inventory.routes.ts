import { Route } from '@angular/router';
import { AuthGuard } from '../../core/auth';

/**
 * Inventory Routes
 *
 * Route structure:
 * /inventory                    -> Main page (ax-launcher with all modules)
 * /inventory/dashboard          -> Dashboard (analytics, KPIs)
 * /inventory/master-data        -> Master Data page (ax-launcher for section)
 * /inventory/master-data/drugs  -> Drugs CRUD module
 *
 * CRUD modules are auto-registered at the marked section below.
 */
export const INVENTORY_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./inventory-shell.component').then(
        (m) => m.InventoryShellComponent,
      ),
    canActivate: [AuthGuard],
    children: [
      // Main page - ax-launcher with all modules
      {
        path: '',
        loadComponent: () =>
          import('./pages/main/main.page').then((m) => m.MainPage),
        data: {
          title: 'Inventory',
          description: 'Inventory modules',
        },
      },

      // Dashboard page
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage,
          ),
        data: {
          title: 'Dashboard',
          description: 'Inventory Dashboard',
        },
      },

      // Master Data Section (with children for CRUD modules)
      {
        path: 'master-data',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/master-data/master-data.page').then(
                (m) => m.MasterDataPage,
              ),
            data: {
              title: 'Master Data',
            },
          },
          // === MASTER-DATA ROUTES START ===
          // Budgets (Generated CRUD)
          {
            path: 'budgets',
            loadChildren: () =>
              import('./modules/budgets/budgets.routes').then(
                (m) => m.budgetsRoutes,
              ),
            data: {
              title: 'Budgets',
              description: 'Budgets Management System',
              requiredPermissions: ['budgets.read', 'admin.*'],
            },
          },
          // Bank (Generated CRUD)
          {
            path: 'bank',
            loadChildren: () =>
              import('./modules/bank/bank.routes').then((m) => m.bankRoutes),
            data: {
              title: 'Bank',
              description: 'Bank Management System',
              requiredPermissions: ['bank.read', 'admin.*'],
            },
          },
          // Hospitals (Generated CRUD)
          {
            path: 'hospitals',
            loadChildren: () =>
              import('./modules/hospitals/hospitals.routes').then(
                (m) => m.hospitalsRoutes,
              ),
            data: {
              title: 'Hospitals',
              description: 'Hospitals Management System',
              requiredPermissions: ['hospitals.read', 'admin.*'],
            },
          },
          // Departments (Generated CRUD)
          {
            path: 'departments',
            loadChildren: () =>
              import('./modules/departments/departments.routes').then(
                (m) => m.departmentsRoutes,
              ),
            data: {
              title: 'Departments',
              description: 'Departments Management System',
              requiredPermissions: ['departments.read', 'admin.*'],
            },
          },
          // Companies (Generated CRUD)
          {
            path: 'companies',
            loadChildren: () =>
              import('./modules/companies/companies.routes').then(
                (m) => m.companiesRoutes,
              ),
            data: {
              title: 'Companies',
              description: 'Companies Management System',
              requiredPermissions: ['companies.read', 'admin.*'],
            },
          },
          // Locations (Generated CRUD)
          {
            path: 'locations',
            loadChildren: () =>
              import('./modules/locations/locations.routes').then(
                (m) => m.locationsRoutes,
              ),
            data: {
              title: 'Locations',
              description: 'Locations Management System',
              requiredPermissions: ['locations.read', 'admin.*'],
            },
          },
          // Drugs (Generated CRUD)
          {
            path: 'drugs',
            loadChildren: () =>
              import('./modules/drugs/drugs.routes').then((m) => m.drugsRoutes),
            data: {
              title: 'Drugs',
              description: 'Drugs Management System',
              requiredPermissions: ['drugs.read', 'admin.*'],
            },
          },
          // CRUD modules will be auto-registered here by the generator
          // === MASTER-DATA ROUTES END ===
        ],
      },

      // === AUTO-GENERATED ROUTES START ===
      // CRUD modules will be auto-registered here by the generator
      // === AUTO-GENERATED ROUTES END ===
    ],
  },
];
