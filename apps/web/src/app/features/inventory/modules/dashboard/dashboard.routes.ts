import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';

/**
 * Dashboard Module Routes
 *
 * /inventory/dashboard          -> Overview
 * /inventory/dashboard/kpis     -> KPI Metrics
 * /inventory/dashboard/alerts   -> Stock Alerts
 */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardPage,
  },
  {
    path: 'kpis',
    component: DashboardPage,
    data: { view: 'kpis' },
  },
  {
    path: 'alerts',
    component: DashboardPage,
    data: { view: 'alerts' },
  },
];
