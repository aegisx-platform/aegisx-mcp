/**
 * Navigation Configuration
 *
 * Centralized navigation configuration for the admin app.
 * This file contains all navigation items used by different layouts.
 *
 * Structure:
 * - COMPACT_NAVIGATION: Used by AxCompactLayoutComponent (full icons + collapsible)
 * - DOCS_NAVIGATION: Used by AxDocsLayoutComponent (shadcn/ui-style sidebar)
 */

import { AxNavigationItem } from '@aegisx/ui';

// ============================================================
// GETTING STARTED SECTION
// ============================================================

const GETTING_STARTED_ITEMS: AxNavigationItem[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    type: 'item',
    icon: 'home',
    link: '/docs/getting-started/introduction',
  },
  {
    id: 'installation',
    title: 'Installation',
    type: 'item',
    icon: 'download',
    link: '/docs/getting-started/installation',
  },
  {
    id: 'quick-start',
    title: 'Quick Start',
    type: 'item',
    icon: 'speed',
    link: '/docs/getting-started/quick-start',
  },
];

// ============================================================
// FOUNDATIONS SECTION
// ============================================================

const FOUNDATIONS_ITEMS: AxNavigationItem[] = [
  {
    id: 'foundations-overview',
    title: 'Overview',
    type: 'item',
    icon: 'dashboard',
    link: '/docs/foundations/overview',
  },
  {
    id: 'design-tokens',
    title: 'Design Tokens',
    type: 'item',
    icon: 'palette',
    link: '/docs/foundations/design-tokens',
  },
  {
    id: 'colors',
    title: 'Colors',
    type: 'item',
    icon: 'color_lens',
    link: '/docs/foundations/colors',
  },
  {
    id: 'typography',
    title: 'Typography',
    type: 'item',
    icon: 'text_fields',
    link: '/docs/foundations/typography',
  },
  {
    id: 'spacing',
    title: 'Spacing',
    type: 'item',
    icon: 'straighten',
    link: '/docs/foundations/spacing',
  },
  {
    id: 'shadows',
    title: 'Shadows',
    type: 'item',
    icon: 'layers',
    link: '/docs/foundations/shadows',
  },
  {
    id: 'motion',
    title: 'Motion',
    type: 'item',
    icon: 'animation',
    link: '/docs/foundations/motion',
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    type: 'item',
    icon: 'accessibility_new',
    link: '/docs/foundations/accessibility',
  },
  {
    id: 'theming',
    title: 'Theming',
    type: 'item',
    icon: 'palette',
    link: '/docs/foundations/theming',
  },
];

// ============================================================
// COMPONENTS - DATA DISPLAY
// ============================================================

const DATA_DISPLAY_ITEMS: AxNavigationItem[] = [
  {
    id: 'data-display-overview',
    title: 'Overview',
    type: 'item',
    icon: 'dashboard',
    link: '/docs/components/aegisx/data-display/overview',
  },
  {
    id: 'card',
    title: 'Card',
    type: 'item',
    icon: 'credit_card',
    link: '/docs/components/aegisx/data-display/card',
  },
  {
    id: 'kpi-card',
    title: 'KPI Card',
    type: 'item',
    icon: 'analytics',
    link: '/docs/components/aegisx/data-display/kpi-card',
  },
  {
    id: 'badge',
    title: 'Badge',
    type: 'item',
    icon: 'label',
    link: '/docs/components/aegisx/data-display/badge',
  },
  {
    id: 'avatar',
    title: 'Avatar',
    type: 'item',
    icon: 'account_circle',
    link: '/docs/components/aegisx/data-display/avatar',
  },
  {
    id: 'list',
    title: 'List',
    type: 'item',
    icon: 'list',
    link: '/docs/components/aegisx/data-display/list',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    type: 'item',
    icon: 'calendar_month',
    link: '/docs/components/aegisx/data-display/calendar',
  },
  {
    id: 'kbd',
    title: 'Kbd',
    type: 'item',
    icon: 'keyboard',
    link: '/docs/components/aegisx/data-display/kbd',
  },
  {
    id: 'field-display',
    title: 'Field Display',
    type: 'item',
    icon: 'text_snippet',
    link: '/docs/components/aegisx/data-display/field-display',
  },
  {
    id: 'description-list',
    title: 'Description List',
    type: 'item',
    icon: 'format_list_bulleted',
    link: '/docs/components/aegisx/data-display/description-list',
  },
  {
    id: 'stats-card',
    title: 'Stats Card',
    type: 'item',
    icon: 'bar_chart',
    link: '/docs/components/aegisx/data-display/stats-card',
  },
  {
    id: 'timeline',
    title: 'Timeline',
    type: 'item',
    icon: 'timeline',
    link: '/docs/components/aegisx/data-display/timeline',
  },
  {
    id: 'divider',
    title: 'Divider',
    type: 'item',
    icon: 'horizontal_rule',
    link: '/docs/components/aegisx/data-display/divider',
  },
  {
    id: 'sparkline',
    title: 'Sparkline',
    type: 'item',
    icon: 'show_chart',
    link: '/docs/components/aegisx/charts/sparkline',
  },
  {
    id: 'circular-progress',
    title: 'Circular Progress',
    type: 'item',
    icon: 'donut_large',
    link: '/docs/components/aegisx/charts/circular-progress',
  },
  {
    id: 'segmented-progress',
    title: 'Segmented Progress',
    type: 'item',
    icon: 'data_usage',
    link: '/docs/components/aegisx/charts/segmented-progress',
  },
];

// ============================================================
// COMPONENTS - FORMS
// ============================================================

const FORMS_ITEMS: AxNavigationItem[] = [
  {
    id: 'date-picker',
    title: 'Date Picker',
    type: 'item',
    icon: 'calendar_today',
    link: '/docs/components/aegisx/forms/date-picker',
  },
  {
    id: 'file-upload',
    title: 'File Upload',
    type: 'item',
    icon: 'cloud_upload',
    link: '/docs/components/aegisx/forms/file-upload',
  },
  {
    id: 'time-slots',
    title: 'Time Slots',
    type: 'item',
    icon: 'schedule',
    link: '/docs/components/aegisx/forms/time-slots',
  },
  {
    id: 'scheduler',
    title: 'Scheduler',
    type: 'item',
    icon: 'event',
    link: '/docs/components/aegisx/forms/scheduler',
  },
  {
    id: 'input-otp',
    title: 'Input OTP',
    type: 'item',
    icon: 'pin',
    link: '/docs/components/aegisx/forms/input-otp',
  },
  {
    id: 'popup-edit',
    title: 'Popup Edit',
    type: 'item',
    icon: 'edit',
    link: '/docs/components/aegisx/forms/popup-edit',
  },
  {
    id: 'knob',
    title: 'Knob',
    type: 'item',
    icon: 'tune',
    link: '/docs/components/aegisx/forms/knob',
  },
];

// ============================================================
// COMPONENTS - FEEDBACK
// ============================================================

const FEEDBACK_ITEMS: AxNavigationItem[] = [
  {
    id: 'alert',
    title: 'Alert',
    type: 'item',
    icon: 'notifications',
    link: '/docs/components/aegisx/feedback/alert',
  },
  {
    id: 'loading-bar',
    title: 'Loading Bar',
    type: 'item',
    icon: 'hourglass_empty',
    link: '/docs/components/aegisx/feedback/loading-bar',
  },
  {
    id: 'dialogs',
    title: 'Dialogs',
    type: 'item',
    icon: 'open_in_new',
    link: '/docs/components/aegisx/feedback/dialogs',
  },
  {
    id: 'toast',
    title: 'Toast',
    type: 'item',
    icon: 'announcement',
    link: '/docs/components/aegisx/feedback/toast',
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    type: 'item',
    icon: 'view_stream',
    link: '/docs/components/aegisx/feedback/skeleton',
  },
  {
    id: 'inner-loading',
    title: 'Inner Loading',
    type: 'item',
    icon: 'autorenew',
    link: '/docs/components/aegisx/feedback/inner-loading',
  },
  {
    id: 'empty-state',
    title: 'Empty State',
    type: 'item',
    icon: 'inbox',
    link: '/docs/components/aegisx/feedback/empty-state',
  },
  {
    id: 'error-state',
    title: 'Error State',
    type: 'item',
    icon: 'error_outline',
    link: '/docs/components/aegisx/feedback/error-state',
  },
  {
    id: 'splash-screen',
    title: 'Splash Screen',
    type: 'item',
    icon: 'rocket_launch',
    link: '/docs/components/aegisx/feedback/splash-screen',
  },
];

// ============================================================
// COMPONENTS - NAVIGATION
// ============================================================

const NAVIGATION_ITEMS: AxNavigationItem[] = [
  {
    id: 'breadcrumb',
    title: 'Breadcrumb',
    type: 'item',
    icon: 'arrow_forward',
    link: '/docs/components/aegisx/navigation/breadcrumb',
  },
  {
    id: 'stepper',
    title: 'Stepper',
    type: 'item',
    icon: 'linear_scale',
    link: '/docs/components/aegisx/navigation/stepper',
  },
  {
    id: 'launcher',
    title: 'Launcher',
    type: 'item',
    icon: 'apps',
    link: '/docs/components/aegisx/navigation/launcher',
  },
  {
    id: 'navigation-menu',
    title: 'Navigation Menu',
    type: 'item',
    icon: 'menu',
    link: '/docs/components/aegisx/navigation/navigation-menu',
  },
  {
    id: 'navbar',
    title: 'Navbar',
    type: 'item',
    icon: 'web',
    link: '/docs/components/aegisx/navigation/navbar',
  },
  {
    id: 'command-palette',
    title: 'Command Palette',
    type: 'item',
    icon: 'keyboard_command_key',
    link: '/docs/components/aegisx/navigation/command-palette',
  },
];

// ============================================================
// COMPONENTS - LAYOUT
// ============================================================

const LAYOUT_ITEMS: AxNavigationItem[] = [
  {
    id: 'drawer',
    title: 'Drawer / Sheet',
    type: 'item',
    icon: 'menu_open',
    link: '/docs/components/aegisx/layout/drawer',
  },
  {
    id: 'enterprise-layout',
    title: 'Enterprise Layout',
    type: 'item',
    icon: 'web',
    link: '/docs/components/aegisx/layout/enterprise',
  },
  {
    id: 'splitter',
    title: 'Splitter',
    type: 'item',
    icon: 'view_column',
    link: '/docs/components/aegisx/layout/splitter',
  },
  {
    id: 'compact-layout',
    title: 'Compact Layout',
    type: 'item',
    icon: 'view_quilt',
    link: '/docs/components/aegisx/layout/compact',
  },
  {
    id: 'empty-layout',
    title: 'Empty Layout',
    type: 'item',
    icon: 'crop_free',
    link: '/docs/components/aegisx/layout/empty',
  },
];

// ============================================================
// COMPONENTS - UTILITIES
// ============================================================

const UTILITIES_ITEMS: AxNavigationItem[] = [
  {
    id: 'theme-switcher',
    title: 'Theme Switcher',
    type: 'item',
    icon: 'palette',
    link: '/docs/components/aegisx/utilities/theme-switcher',
  },
  {
    id: 'layout-switcher',
    title: 'Layout Switcher',
    type: 'item',
    icon: 'view_quilt',
    link: '/docs/components/aegisx/utilities/layout-switcher',
  },
  {
    id: 'theme-builder',
    title: 'Theme Builder',
    type: 'item',
    icon: 'brush',
    link: '/docs/components/aegisx/utilities/theme-builder',
    badge: { content: 'New', type: 'info' },
  },
];

// ============================================================
// COMPONENTS - DASHBOARD
// ============================================================

const DASHBOARD_ITEMS: AxNavigationItem[] = [
  {
    id: 'widget-framework',
    title: 'Widget Framework',
    type: 'item',
    icon: 'widgets',
    link: '/docs/components/aegisx/dashboard/widget-framework',
  },
];

// ============================================================
// COMPONENTS - AUTH
// ============================================================

const AUTH_ITEMS: AxNavigationItem[] = [
  {
    id: 'auth-overview',
    title: 'Authentication',
    type: 'item',
    icon: 'lock',
    link: '/docs/components/aegisx/auth',
  },
];

// ============================================================
// INTEGRATIONS SECTION
// ============================================================

const INTEGRATIONS_ITEMS: AxNavigationItem[] = [
  {
    id: 'integrations-overview',
    title: 'Overview',
    type: 'item',
    icon: 'dashboard',
    link: '/docs/integrations/overview',
  },
  {
    id: 'integrations-gridster',
    title: 'Gridster',
    type: 'item',
    icon: 'grid_view',
    link: '/docs/integrations/gridster',
  },
  {
    id: 'integrations-fullcalendar',
    title: 'FullCalendar',
    type: 'item',
    icon: 'calendar_month',
    link: '/docs/components/aegisx/data-display/calendar',
  },
  {
    id: 'integrations-qrcode',
    title: 'QR Code',
    type: 'item',
    icon: 'qr_code',
    link: '/docs/integrations/qrcode',
  },
  {
    id: 'integrations-signature-pad',
    title: 'Signature Pad',
    type: 'item',
    icon: 'draw',
    link: '/docs/integrations/signature-pad',
  },
  {
    id: 'integrations-ngx-charts',
    title: 'NGX Charts',
    type: 'item',
    icon: 'bar_chart',
    link: '/docs/integrations/ngx-charts',
  },
  {
    id: 'integrations-chartjs',
    title: 'Chart.js',
    type: 'item',
    icon: 'ssid_chart',
    link: '/docs/integrations/chartjs',
  },
  {
    id: 'integrations-pdf-viewer',
    title: 'PDF Viewer',
    type: 'item',
    icon: 'picture_as_pdf',
    link: '/docs/integrations/pdf-viewer',
  },
  {
    id: 'integrations-image-cropper',
    title: 'Image Cropper',
    type: 'item',
    icon: 'crop',
    link: '/docs/integrations/image-cropper',
  },
  {
    id: 'integrations-monaco-editor',
    title: 'Monaco Editor',
    type: 'item',
    icon: 'code',
    link: '/docs/integrations/monaco-editor',
  },
];

// ============================================================
// MATERIAL COMPONENTS SECTION
// ============================================================

const MATERIAL_ACTIONS_ITEMS: AxNavigationItem[] = [
  {
    id: 'material-button',
    title: 'Button',
    type: 'item',
    icon: 'smart_button',
    link: '/docs/material/button',
  },
  {
    id: 'material-fab',
    title: 'FAB',
    type: 'item',
    icon: 'add_circle',
    link: '/docs/material/fab',
  },
  {
    id: 'material-button-toggle',
    title: 'Button Toggle',
    type: 'item',
    icon: 'toggle_on',
    link: '/docs/material/button-toggle',
  },
];

const MATERIAL_DATA_DISPLAY_ITEMS: AxNavigationItem[] = [
  {
    id: 'material-card',
    title: 'Card',
    type: 'item',
    icon: 'credit_card',
    link: '/docs/material/card',
  },
  {
    id: 'material-table',
    title: 'Table',
    type: 'item',
    icon: 'table_chart',
    link: '/docs/material/table',
  },
  {
    id: 'material-list',
    title: 'List',
    type: 'item',
    icon: 'list',
    link: '/docs/material/list',
  },
  {
    id: 'material-chips',
    title: 'Chips',
    type: 'item',
    icon: 'label',
    link: '/docs/material/chips',
  },
  {
    id: 'material-icon',
    title: 'Icon',
    type: 'item',
    icon: 'emoji_symbols',
    link: '/docs/material/icon',
  },
  {
    id: 'material-badge',
    title: 'Badge',
    type: 'item',
    icon: 'badge',
    link: '/docs/material/badge',
  },
  {
    id: 'material-divider',
    title: 'Divider',
    type: 'item',
    icon: 'horizontal_rule',
    link: '/docs/material/divider',
  },
  {
    id: 'material-grid-list',
    title: 'Grid List',
    type: 'item',
    icon: 'grid_view',
    link: '/docs/material/grid-list',
  },
  {
    id: 'material-tree',
    title: 'Tree',
    type: 'item',
    icon: 'account_tree',
    link: '/docs/material/tree',
  },
  {
    id: 'material-paginator',
    title: 'Paginator',
    type: 'item',
    icon: 'last_page',
    link: '/docs/material/paginator',
  },
  {
    id: 'material-sort',
    title: 'Sort',
    type: 'item',
    icon: 'sort',
    link: '/docs/material/sort',
  },
];

const MATERIAL_FORMS_ITEMS: AxNavigationItem[] = [
  {
    id: 'material-form-field',
    title: 'Form Field',
    type: 'item',
    icon: 'input',
    link: '/docs/material/form-field',
  },
  {
    id: 'material-input',
    title: 'Input',
    type: 'item',
    icon: 'text_fields',
    link: '/docs/material/input',
  },
  {
    id: 'material-select',
    title: 'Select',
    type: 'item',
    icon: 'arrow_drop_down',
    link: '/docs/material/select',
  },
  {
    id: 'material-autocomplete',
    title: 'Autocomplete',
    type: 'item',
    icon: 'search',
    link: '/docs/material/autocomplete',
  },
  {
    id: 'material-datepicker',
    title: 'Datepicker',
    type: 'item',
    icon: 'calendar_today',
    link: '/docs/material/datepicker',
  },
  {
    id: 'material-checkbox',
    title: 'Checkbox',
    type: 'item',
    icon: 'check_box',
    link: '/docs/material/checkbox',
  },
  {
    id: 'material-radio',
    title: 'Radio',
    type: 'item',
    icon: 'radio_button_checked',
    link: '/docs/material/radio',
  },
  {
    id: 'material-slide-toggle',
    title: 'Slide Toggle',
    type: 'item',
    icon: 'toggle_on',
    link: '/docs/material/slide-toggle',
  },
  {
    id: 'material-slider',
    title: 'Slider',
    type: 'item',
    icon: 'tune',
    link: '/docs/material/slider',
  },
];

const MATERIAL_NAVIGATION_ITEMS: AxNavigationItem[] = [
  {
    id: 'material-menu',
    title: 'Menu',
    type: 'item',
    icon: 'menu',
    link: '/docs/material/menu',
  },
  {
    id: 'material-tabs',
    title: 'Tabs',
    type: 'item',
    icon: 'tab',
    link: '/docs/material/tabs',
  },
  {
    id: 'material-sidenav',
    title: 'Sidenav',
    type: 'item',
    icon: 'menu_open',
    link: '/docs/material/sidenav',
  },
  {
    id: 'material-toolbar',
    title: 'Toolbar',
    type: 'item',
    icon: 'view_headline',
    link: '/docs/material/toolbar',
  },
  {
    id: 'material-stepper',
    title: 'Stepper',
    type: 'item',
    icon: 'linear_scale',
    link: '/docs/material/stepper',
  },
];

const MATERIAL_FEEDBACK_ITEMS: AxNavigationItem[] = [
  {
    id: 'material-dialog',
    title: 'Dialog',
    type: 'item',
    icon: 'open_in_new',
    link: '/docs/material/dialog',
  },
  {
    id: 'material-bottom-sheet',
    title: 'Bottom Sheet',
    type: 'item',
    icon: 'vertical_align_bottom',
    link: '/docs/material/bottom-sheet',
  },
  {
    id: 'material-snackbar',
    title: 'Snackbar',
    type: 'item',
    icon: 'announcement',
    link: '/docs/material/snackbar',
  },
  {
    id: 'material-tooltip',
    title: 'Tooltip',
    type: 'item',
    icon: 'info',
    link: '/docs/material/tooltip',
  },
  {
    id: 'material-progress',
    title: 'Progress Indicators',
    type: 'item',
    icon: 'hourglass_empty',
    link: '/docs/material/progress',
  },
  {
    id: 'material-expansion',
    title: 'Expansion Panel',
    type: 'item',
    icon: 'expand_more',
    link: '/docs/material/expansion',
  },
];

// ============================================================
// PATTERNS SECTION
// ============================================================

const PATTERNS_ITEMS: AxNavigationItem[] = [
  {
    id: 'form-sizes',
    title: 'Form Sizes',
    type: 'item',
    icon: 'height',
    link: '/docs/patterns/form-sizes',
  },
  {
    id: 'form-layouts',
    title: 'Form Layouts',
    type: 'item',
    icon: 'view_module',
    link: '/docs/patterns/form-layouts',
  },
];

// ============================================================
// ARCHITECTURE SECTION
// ============================================================

const ARCHITECTURE_ITEMS: AxNavigationItem[] = [
  {
    id: 'multi-app',
    title: 'Multi-App Architecture',
    type: 'item',
    icon: 'apps',
    link: '/docs/architecture/multi-app',
  },
  {
    id: 'shell-pattern',
    title: 'Shell Pattern & Routing',
    type: 'item',
    icon: 'route',
    link: '/docs/architecture/shell-pattern',
  },
];

// ============================================================
// EXAMPLES SECTION
// ============================================================

const EXAMPLES_ITEMS: AxNavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'item',
    icon: 'dashboard',
    link: '/docs/examples/dashboard',
  },
  {
    id: 'user-management',
    title: 'User Management',
    type: 'item',
    icon: 'people',
    link: '/docs/examples/user-management',
  },
  {
    id: 'components-demo',
    title: 'Material Playground',
    type: 'item',
    icon: 'view_module',
    link: '/docs/examples/components',
  },
  {
    id: 'card-examples',
    title: 'Card Examples',
    type: 'item',
    icon: 'credit_card',
    link: '/docs/examples/card-examples',
  },
];

// ============================================================
// DEMO APPS SECTION
// ============================================================

const DEMO_APPS_ITEMS: AxNavigationItem[] = [
  {
    id: 'app-launcher-demo',
    title: 'App Launcher',
    type: 'item',
    icon: 'apps',
    link: '/app-launcher-demo',
  },
  {
    id: 'gridster-demo',
    title: 'Gridster Demo',
    type: 'item',
    icon: 'grid_view',
    link: '/gridster-demo',
  },
  {
    id: 'enterprise-demo',
    title: 'Enterprise Dashboard',
    type: 'item',
    icon: 'business',
    link: '/enterprise-demo',
  },
  {
    id: 'inventory-demo',
    title: 'Inventory System',
    type: 'item',
    icon: 'inventory_2',
    link: '/inventory-demo',
  },
  {
    id: 'his-demo',
    title: 'HIS (Hospital)',
    type: 'item',
    icon: 'local_hospital',
    link: '/his-demo',
  },
];

// ============================================================
// TOOLS SECTION
// ============================================================

const TOOLS_ITEMS: AxNavigationItem[] = [
  {
    id: 'theme-builder-tool',
    title: 'Theme Builder',
    type: 'item',
    icon: 'brush',
    link: '/tools/theme-builder',
    badge: { content: 'New', type: 'info' },
  },
];

// ============================================================
// PAGE EXAMPLES SECTION (Copy-paste friendly templates)
// ============================================================

const PAGE_EXAMPLES_ERROR_ITEMS: AxNavigationItem[] = [
  {
    id: 'error-404',
    title: '404 Not Found',
    type: 'item',
    icon: 'search_off',
    link: '/examples/error/404',
  },
  {
    id: 'error-500',
    title: '500 Server Error',
    type: 'item',
    icon: 'report_problem',
    link: '/examples/error/500',
  },
  {
    id: 'error-403',
    title: '403 Forbidden',
    type: 'item',
    icon: 'lock',
    link: '/examples/error/403',
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    type: 'item',
    icon: 'build',
    link: '/examples/error/maintenance',
  },
];

const PAGE_EXAMPLES_ACCOUNT_ITEMS: AxNavigationItem[] = [
  {
    id: 'profile',
    title: 'Profile',
    type: 'item',
    icon: 'person',
    link: '/examples/account/profile',
  },
  {
    id: 'settings',
    title: 'Settings',
    type: 'item',
    icon: 'settings',
    link: '/examples/account/settings',
  },
];

const PAGE_EXAMPLES_DASHBOARD_ITEMS: AxNavigationItem[] = [
  {
    id: 'analytics',
    title: 'Analytics',
    type: 'item',
    icon: 'insights',
    link: '/examples/dashboard/analytics',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    type: 'item',
    icon: 'store',
    link: '/examples/dashboard/ecommerce',
  },
];

const PAGE_EXAMPLES_AUTH_ITEMS: AxNavigationItem[] = [
  {
    id: 'login',
    title: 'Login',
    type: 'item',
    icon: 'login',
    link: '/examples/auth/login',
  },
  {
    id: 'register',
    title: 'Register',
    type: 'item',
    icon: 'person_add',
    link: '/examples/auth/register',
  },
  {
    id: 'forgot-password',
    title: 'Forgot Password',
    type: 'item',
    icon: 'lock_reset',
    link: '/examples/auth/forgot-password',
  },
  {
    id: 'reset-password',
    title: 'Reset Password',
    type: 'item',
    icon: 'lock',
    link: '/examples/auth/reset-password',
  },
  {
    id: 'confirm-email',
    title: 'Confirm Email',
    type: 'item',
    icon: 'mark_email_read',
    link: '/examples/auth/confirm-email',
  },
];

// ============================================================
// COMPACT NAVIGATION (with icons, for AxCompactLayoutComponent)
// ============================================================

export const COMPACT_NAVIGATION: AxNavigationItem[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    type: 'collapsible',
    icon: 'rocket_launch',
    children: GETTING_STARTED_ITEMS,
  },
  {
    id: 'foundations',
    title: 'Foundations',
    type: 'collapsible',
    icon: 'architecture',
    children: FOUNDATIONS_ITEMS,
  },
  {
    id: 'components',
    title: 'Components',
    type: 'collapsible',
    icon: 'widgets',
    children: [
      {
        id: 'components-overview',
        title: 'Overview',
        type: 'item',
        icon: 'home',
        link: '/docs/components/aegisx/overview',
      },
      {
        id: 'data-display',
        title: 'Data Display',
        type: 'collapsible',
        icon: 'table_chart',
        children: DATA_DISPLAY_ITEMS,
      },
      {
        id: 'forms',
        title: 'Forms',
        type: 'collapsible',
        icon: 'edit_note',
        children: FORMS_ITEMS,
      },
      {
        id: 'feedback',
        title: 'Feedback',
        type: 'collapsible',
        icon: 'feedback',
        children: FEEDBACK_ITEMS,
      },
      {
        id: 'navigation',
        title: 'Navigation',
        type: 'collapsible',
        icon: 'menu',
        children: NAVIGATION_ITEMS,
      },
      {
        id: 'layout',
        title: 'Layout',
        type: 'collapsible',
        icon: 'view_quilt',
        children: LAYOUT_ITEMS,
      },
      {
        id: 'utilities',
        title: 'Utilities',
        type: 'collapsible',
        icon: 'build',
        children: UTILITIES_ITEMS,
      },
      {
        id: 'auth',
        title: 'Authentication',
        type: 'collapsible',
        icon: 'lock',
        children: AUTH_ITEMS,
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    type: 'collapsible',
    icon: 'extension',
    children: INTEGRATIONS_ITEMS,
  },
  {
    id: 'material',
    title: 'Material',
    type: 'collapsible',
    icon: 'palette',
    children: [
      {
        id: 'material-overview',
        title: 'Overview',
        type: 'item',
        icon: 'dashboard',
        link: '/docs/material/overview',
      },
      ...MATERIAL_ACTIONS_ITEMS.slice(0, 3),
      ...MATERIAL_DATA_DISPLAY_ITEMS.slice(0, 3),
      ...MATERIAL_FORMS_ITEMS.slice(0, 2),
      ...MATERIAL_NAVIGATION_ITEMS.slice(0, 2),
      ...MATERIAL_FEEDBACK_ITEMS.slice(0, 2),
    ],
  },
  {
    id: 'patterns',
    title: 'Patterns',
    type: 'collapsible',
    icon: 'pattern',
    children: PATTERNS_ITEMS,
  },
  {
    id: 'architecture',
    title: 'Architecture',
    type: 'collapsible',
    icon: 'account_tree',
    children: ARCHITECTURE_ITEMS,
  },
  {
    id: 'examples',
    title: 'Examples',
    type: 'collapsible',
    icon: 'apps',
    children: EXAMPLES_ITEMS,
  },
  {
    id: 'demo-apps',
    title: 'Demo Apps',
    type: 'collapsible',
    icon: 'play_circle',
    children: DEMO_APPS_ITEMS,
  },
  {
    id: 'page-examples',
    title: 'Page Examples',
    type: 'collapsible',
    icon: 'web_stories',
    badge: { content: 'New', type: 'info' },
    children: [
      {
        id: 'error-pages',
        title: 'Error Pages',
        type: 'collapsible',
        icon: 'error_outline',
        children: PAGE_EXAMPLES_ERROR_ITEMS,
      },
      {
        id: 'account-pages',
        title: 'Account Pages',
        type: 'collapsible',
        icon: 'manage_accounts',
        children: PAGE_EXAMPLES_ACCOUNT_ITEMS,
      },
      {
        id: 'dashboard-pages',
        title: 'Dashboard',
        type: 'collapsible',
        icon: 'dashboard',
        children: PAGE_EXAMPLES_DASHBOARD_ITEMS,
      },
      {
        id: 'auth-pages',
        title: 'Authentication',
        type: 'collapsible',
        icon: 'lock',
        children: PAGE_EXAMPLES_AUTH_ITEMS,
      },
    ],
  },
];

// ============================================================
// DOCS NAVIGATION (shadcn/ui-style, for AxDocsLayoutComponent)
// ============================================================

export const DOCS_NAVIGATION: AxNavigationItem[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    defaultOpen: true,
    children: GETTING_STARTED_ITEMS.map((item) => ({
      ...item,
      type: undefined,
      icon: undefined,
    })),
  },
  {
    id: 'foundations',
    title: 'Foundations',
    children: FOUNDATIONS_ITEMS.map((item) => ({
      ...item,
      type: undefined,
      icon: undefined,
    })),
  },
  {
    id: 'components',
    title: 'Components',
    children: [
      {
        id: 'components-overview',
        title: 'Overview',
        link: '/docs/components/aegisx/overview',
      },
      {
        id: 'data-display',
        title: 'Data Display',
        children: DATA_DISPLAY_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'forms',
        title: 'Forms',
        children: [
          ...FORMS_ITEMS.map((item) => ({
            id: item.id,
            title: item.title,
            link: item.link,
          })),
          {
            id: 'form-sizes',
            title: 'Form Sizes',
            link: '/docs/patterns/form-sizes',
          },
          {
            id: 'form-layouts',
            title: 'Form Layouts',
            link: '/docs/patterns/form-layouts',
          },
        ],
      },
      {
        id: 'feedback',
        title: 'Feedback',
        children: FEEDBACK_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'navigation',
        title: 'Navigation',
        children: NAVIGATION_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'layout',
        title: 'Layout',
        children: LAYOUT_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'utilities',
        title: 'Utilities',
        children: UTILITIES_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
          badge: item.badge,
        })),
      },
      {
        id: 'dashboard',
        title: 'Dashboard',
        children: DASHBOARD_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'auth',
        title: 'Authentication',
        children: AUTH_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
    ],
  },
  {
    id: 'material',
    title: 'Material',
    children: [
      {
        id: 'material-overview',
        title: 'Overview',
        link: '/docs/material/overview',
      },
      {
        id: 'actions',
        title: 'Actions',
        children: MATERIAL_ACTIONS_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'data-display',
        title: 'Data Display',
        children: MATERIAL_DATA_DISPLAY_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'forms',
        title: 'Form Controls',
        children: MATERIAL_FORMS_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'navigation',
        title: 'Navigation',
        children: MATERIAL_NAVIGATION_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'feedback',
        title: 'Feedback',
        children: MATERIAL_FEEDBACK_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    children: INTEGRATIONS_ITEMS.map((item) => ({
      id: item.id,
      title: item.title,
      link: item.link,
    })),
  },
  {
    id: 'architecture',
    title: 'Architecture',
    children: ARCHITECTURE_ITEMS.map((item) => ({
      id: item.id,
      title: item.title,
      link: item.link,
    })),
  },
  {
    id: 'examples',
    title: 'Examples',
    children: EXAMPLES_ITEMS.map((item) => ({
      id: item.id,
      title: item.title,
      link: item.link,
    })),
  },
  {
    id: 'demo-apps',
    title: 'Demo Apps',
    children: DEMO_APPS_ITEMS.map((item) => ({
      id: item.id,
      title: item.title,
      link: item.link,
    })),
  },
  {
    id: 'tools',
    title: 'Tools',
    children: TOOLS_ITEMS.map((item) => ({
      id: item.id,
      title: item.title,
      link: item.link,
      badge: item.badge,
    })),
  },
  {
    id: 'page-examples',
    title: 'Page Examples',
    badge: { content: 'New', type: 'info' },
    children: [
      {
        id: 'error-pages',
        title: 'Error Pages',
        children: PAGE_EXAMPLES_ERROR_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'account-pages',
        title: 'Account Pages',
        children: PAGE_EXAMPLES_ACCOUNT_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'dashboard-pages',
        title: 'Dashboard',
        children: PAGE_EXAMPLES_DASHBOARD_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
      {
        id: 'auth-pages',
        title: 'Authentication',
        children: PAGE_EXAMPLES_AUTH_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          link: item.link,
        })),
      },
    ],
  },
];
