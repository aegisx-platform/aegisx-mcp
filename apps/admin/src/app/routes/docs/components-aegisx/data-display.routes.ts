/**
 * Data Display Routes
 *
 * IMPORTANT: Dynamic imports MUST use static string paths.
 * Template literals with variables do NOT work with Webpack/Angular.
 */

import { Route } from '@angular/router';

export const DATA_DISPLAY_ROUTES: Route[] = [
  {
    path: 'data-display/overview',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/overview/data-display-demo.component'
      ).then((m) => m.DataDisplayDemoComponent),
    data: {
      title: 'Data Display Components',
      description: 'Components for displaying data',
    },
  },
  {
    path: 'data-display/card',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/card/card-doc.component'
      ).then((m) => m.CardDocComponent),
    data: {
      title: 'Card Component',
      description: 'Card component documentation',
    },
  },
  {
    path: 'data-display/kpi-card',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/kpi-card/kpi-card-doc.component'
      ).then((m) => m.KpiCardDocComponent),
    data: {
      title: 'KPI Card Component',
      description: 'KPI Card component documentation',
    },
  },
  {
    path: 'data-display/badge',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/badge/badge-doc.component'
      ).then((m) => m.BadgeDocComponent),
    data: {
      title: 'Badge Component',
      description: 'Badge component documentation',
    },
  },
  {
    path: 'data-display/avatar',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/avatar/avatar-doc.component'
      ).then((m) => m.AvatarDocComponent),
    data: {
      title: 'Avatar Component',
      description: 'Avatar component documentation',
    },
  },
  {
    path: 'data-display/list',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/list/list-doc.component'
      ).then((m) => m.ListDocComponent),
    data: {
      title: 'List Component',
      description: 'List component documentation',
    },
  },
  {
    path: 'data-display/calendar',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/calendar/calendar-doc.component'
      ).then((m) => m.CalendarDocComponent),
    data: {
      title: 'Calendar Component',
      description: 'Calendar component documentation',
    },
  },
  {
    path: 'data-display/kbd',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/kbd/kbd-doc.component'
      ).then((m) => m.KbdDocComponent),
    data: {
      title: 'Kbd Component',
      description: 'Keyboard component documentation',
    },
  },
  {
    path: 'data-display/field-display',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/field-display/field-display-doc.component'
      ).then((m) => m.FieldDisplayDocComponent),
    data: {
      title: 'Field Display Component',
      description: 'Field Display component documentation',
    },
  },
  {
    path: 'data-display/description-list',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/description-list/description-list-doc.component'
      ).then((m) => m.DescriptionListDocComponent),
    data: {
      title: 'Description List Component',
      description: 'Description List component documentation',
    },
  },
  {
    path: 'data-display/stats-card',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/stats-card/stats-card-doc.component'
      ).then((m) => m.StatsCardDocComponent),
    data: {
      title: 'Stats Card Component',
      description: 'Stats Card component documentation',
    },
  },
  {
    path: 'data-display/timeline',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/timeline/timeline-doc.component'
      ).then((m) => m.TimelineDocComponent),
    data: {
      title: 'Timeline Component',
      description: 'Timeline component documentation',
    },
  },
  {
    path: 'data-display/divider',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/data-display/divider/divider-doc.component'
      ).then((m) => m.DividerDocComponent),
    data: {
      title: 'Divider Component',
      description: 'Divider component documentation',
    },
  },
];

export const CHARTS_ROUTES: Route[] = [
  {
    path: 'charts/sparkline',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/charts/sparkline/sparkline-demo.component'
      ).then((m) => m.SparklineDemoComponent),
    data: {
      title: 'Sparkline Chart',
      description: 'Sparkline chart component',
    },
  },
  {
    path: 'charts/circular-progress',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/charts/circular-progress/circular-progress-demo.component'
      ).then((m) => m.CircularProgressDemoComponent),
    data: {
      title: 'Circular Progress',
      description: 'Circular progress component',
    },
  },
  {
    path: 'charts/segmented-progress',
    loadComponent: () =>
      import(
        '../../../pages/docs/components/aegisx/charts/segmented-progress/segmented-progress-demo.component'
      ).then((m) => m.SegmentedProgressDemoComponent),
    data: {
      title: 'Segmented Progress',
      description: 'Segmented progress component',
    },
  },
];
