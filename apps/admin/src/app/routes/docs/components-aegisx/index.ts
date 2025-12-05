/**
 * AegisX Components Routes
 *
 * Split into category files for better maintainability.
 * Each file contains routes for a specific category of components.
 */

import { Route } from '@angular/router';
import { DATA_DISPLAY_ROUTES, CHARTS_ROUTES } from './data-display.routes';
import { FORMS_ROUTES } from './forms.routes';
import { FEEDBACK_ROUTES } from './feedback.routes';
import { NAVIGATION_ROUTES } from './navigation.routes';
import { LAYOUT_ROUTES } from './layout.routes';
import { UTILITIES_ROUTES, DASHBOARD_ROUTES } from './utilities.routes';
import { AUTH_ROUTES } from './auth.routes';

const BASE_PATH = '../../pages/docs/components/aegisx';

/**
 * Overview route for components section
 */
const OVERVIEW_ROUTE: Route = {
  path: 'overview',
  loadComponent: () =>
    import(`${BASE_PATH}/overview/components-overview.component`).then(
      (m) => m.ComponentsOverviewComponent,
    ),
  data: {
    title: 'Components Overview',
    description: 'AegisX components library overview',
  },
};

/**
 * All AegisX component routes combined
 */
export const COMPONENTS_AEGISX_ROUTES: Route[] = [
  OVERVIEW_ROUTE,
  ...DATA_DISPLAY_ROUTES,
  ...CHARTS_ROUTES,
  ...FORMS_ROUTES,
  ...FEEDBACK_ROUTES,
  ...NAVIGATION_ROUTES,
  ...LAYOUT_ROUTES,
  ...UTILITIES_ROUTES,
  ...DASHBOARD_ROUTES,
  ...AUTH_ROUTES,
];

// Re-export individual route arrays for granular imports
export {
  DATA_DISPLAY_ROUTES,
  CHARTS_ROUTES,
  FORMS_ROUTES,
  FEEDBACK_ROUTES,
  NAVIGATION_ROUTES,
  LAYOUT_ROUTES,
  UTILITIES_ROUTES,
  DASHBOARD_ROUTES,
  AUTH_ROUTES,
};
