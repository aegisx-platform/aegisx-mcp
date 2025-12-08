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
          // Contract Items (Generated CRUD)
          {
            path: 'contract-items',
            loadChildren: () =>
              import('./modules/contract-items/contract-items.routes').then(
                (m) => m.contractItemsRoutes,
              ),
            data: {
              title: 'Contract Items',
              description: 'Contract Items Management System',
              requiredPermissions: ['contract-items.read', 'admin.*'],
            },
          },
          // Contracts (Generated CRUD)
          {
            path: 'contracts',
            loadChildren: () =>
              import('./modules/contracts/contracts.routes').then(
                (m) => m.contractsRoutes,
              ),
            data: {
              title: 'Contracts',
              description: 'Contracts Management System',
              requiredPermissions: ['contracts.read', 'admin.*'],
            },
          },
          // Return Actions (Generated CRUD)
          {
            path: 'return-actions',
            loadChildren: () =>
              import('./modules/return-actions/return-actions.routes').then(
                (m) => m.returnActionsRoutes,
              ),
            data: {
              title: 'Return Actions',
              description: 'Return Actions Management System',
              requiredPermissions: ['return-actions.read', 'admin.*'],
            },
          },
          // Adjustment Reasons (Generated CRUD)
          {
            path: 'adjustment-reasons',
            loadChildren: () =>
              import(
                './modules/adjustment-reasons/adjustment-reasons.routes'
              ).then((m) => m.adjustmentReasonsRoutes),
            data: {
              title: 'Adjustment Reasons',
              description: 'Adjustment Reasons Management System',
              requiredPermissions: ['adjustment-reasons.read', 'admin.*'],
            },
          },
          // Drug Units (Generated CRUD)
          {
            path: 'drug-units',
            loadChildren: () =>
              import('./modules/drug-units/drug-units.routes').then(
                (m) => m.drugUnitsRoutes,
              ),
            data: {
              title: 'Drug Units',
              description: 'Drug Units Management System',
              requiredPermissions: ['drug-units.read', 'admin.*'],
            },
          },
          // Dosage Forms (Generated CRUD)
          {
            path: 'dosage-forms',
            loadChildren: () =>
              import('./modules/dosage-forms/dosage-forms.routes').then(
                (m) => m.dosageFormsRoutes,
              ),
            data: {
              title: 'Dosage Forms',
              description: 'Dosage Forms Management System',
              requiredPermissions: ['dosage-forms.read', 'admin.*'],
            },
          },
          // Drug Pack Ratios (Generated CRUD)
          {
            path: 'drug-pack-ratios',
            loadChildren: () =>
              import('./modules/drug-pack-ratios/drug-pack-ratios.routes').then(
                (m) => m.drugPackRatiosRoutes,
              ),
            data: {
              title: 'Drug Pack Ratios',
              description: 'Drug Pack Ratios Management System',
              requiredPermissions: ['drug-pack-ratios.read', 'admin.*'],
            },
          },
          // Drug Focus Lists (Generated CRUD)
          {
            path: 'drug-focus-lists',
            loadChildren: () =>
              import('./modules/drug-focus-lists/drug-focus-lists.routes').then(
                (m) => m.drugFocusListsRoutes,
              ),
            data: {
              title: 'Drug Focus Lists',
              description: 'Drug Focus Lists Management System',
              requiredPermissions: ['drug-focus-lists.read', 'admin.*'],
            },
          },
          // Drug Components (Generated CRUD)
          {
            path: 'drug-components',
            loadChildren: () =>
              import('./modules/drug-components/drug-components.routes').then(
                (m) => m.drugComponentsRoutes,
              ),
            data: {
              title: 'Drug Components',
              description: 'Drug Components Management System',
              requiredPermissions: ['drug-components.read', 'admin.*'],
            },
          },
          // Drug Generics (Generated CRUD)
          {
            path: 'drug-generics',
            loadChildren: () =>
              import('./modules/drug-generics/drug-generics.routes').then(
                (m) => m.drugGenericsRoutes,
              ),
            data: {
              title: 'Drug Generics',
              description: 'Drug Generics Management System',
              requiredPermissions: ['drug-generics.read', 'admin.*'],
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

      // Budget Section (with children for CRUD modules)
      {
        path: 'budget',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/budget/budget.page').then((m) => m.BudgetPage),
            data: {
              title: 'Budget',
            },
          },
          // === BUDGET ROUTES START ===
          // Budget Reservations (Generated CRUD)
          {
            path: 'budget-reservations',
            loadChildren: () =>
              import(
                './modules/budget-reservations/budget-reservations.routes'
              ).then((m) => m.budgetReservationsRoutes),
            data: {
              title: 'Budget Reservations',
              description: 'Budget Reservations Management System',
              requiredPermissions: ['budget-reservations.read', 'admin.*'],
            },
          },
          // Budget Plan Items (Generated CRUD)
          {
            path: 'budget-plan-items',
            loadChildren: () =>
              import(
                './modules/budget-plan-items/budget-plan-items.routes'
              ).then((m) => m.budgetPlanItemsRoutes),
            data: {
              title: 'Budget Plan Items',
              description: 'Budget Plan Items Management System',
              requiredPermissions: ['budget-plan-items.read', 'admin.*'],
            },
          },
          // Budget Plans (Generated CRUD)
          {
            path: 'budget-plans',
            loadChildren: () =>
              import('./modules/budget-plans/budget-plans.routes').then(
                (m) => m.budgetPlansRoutes,
              ),
            data: {
              title: 'Budget Plans',
              description: 'Budget Plans Management System',
              requiredPermissions: ['budget-plans.read', 'admin.*'],
            },
          },
          // Budget Allocations (Generated CRUD)
          {
            path: 'budget-allocations',
            loadChildren: () =>
              import(
                './modules/budget-allocations/budget-allocations.routes'
              ).then((m) => m.budgetAllocationsRoutes),
            data: {
              title: 'Budget Allocations',
              description: 'Budget Allocations Management System',
              requiredPermissions: ['budget-allocations.read', 'admin.*'],
            },
          },
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
          // Budget Categories (Generated CRUD)
          {
            path: 'budget-categories',
            loadChildren: () =>
              import(
                './modules/budget-categories/budget-categories.routes'
              ).then((m) => m.budgetCategoriesRoutes),
            data: {
              title: 'Budget Categories',
              description: 'Budget Categories Management System',
              requiredPermissions: ['budget-categories.read', 'admin.*'],
            },
          },
          // Budget Types (Generated CRUD)
          {
            path: 'budget-types',
            loadChildren: () =>
              import('./modules/budget-types/budget-types.routes').then(
                (m) => m.budgetTypesRoutes,
              ),
            data: {
              title: 'Budget Types',
              description: 'Budget Types Management System',
              requiredPermissions: ['budget-types.read', 'admin.*'],
            },
          },
          // CRUD modules will be auto-registered here by the generator
          // === BUDGET ROUTES END ===
        ],
      },

      // === AUTO-GENERATED ROUTES START ===
      // CRUD modules will be auto-registered here by the generator
      // === AUTO-GENERATED ROUTES END ===
    ],
  },
];
