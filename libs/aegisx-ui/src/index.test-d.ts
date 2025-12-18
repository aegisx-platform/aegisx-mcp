/**
 * Type Tests for AegisX UI Library
 *
 * This file contains compile-time type tests using tsd.
 * Run tests with: pnpm nx run aegisx-ui:build && cd dist/libs/aegisx-ui && npx tsd
 */

import {
  expectType,
  expectError,
  expectAssignable,
  expectNotAssignable,
} from 'tsd';
import type {
  // Navigation types
  AxNavigationItem,
  AxNavigation,
  AxNavigationBadge,
  // Config types
  AegisxConfig,
  AegisxLayoutType,
  // Component types - Drawer
  DrawerPosition,
  DrawerSize,
  // Component types - Badge
  BadgeVariant,
  BadgeType,
  BadgeSize,
  BadgeRounded,
  // Component types - Alert
  AlertVariant,
  // Component types - Launcher
  LauncherColor,
  LauncherAppStatus,
  LauncherViewMode,
  LauncherGroupBy,
  LauncherApp,
  LauncherConfig,
  // Widget types
  WidgetCategory,
  WidgetStatus,
  WidgetDefinition,
  WidgetInstance,
  WidgetPosition,
  DashboardConfig,
  // Service types - Theme
  ThemeMode,
  ColorScheme,
  ThemeConfig,
  BackgroundKey,
  TextKey,
  BorderKey,
  FontSizeKey,
  // Service types - Toast
  ToastType,
  ToastProvider,
  ToastPosition,
  ToastOptions,
  ToastRef,
} from './index';

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

// Positive: Valid navigation item with all required fields
const navItem: AxNavigationItem = {
  id: 'home',
  title: 'Home',
  type: 'item',
  link: '/home',
};
expectType<AxNavigationItem>(navItem);

// Positive: Navigation item with badge
const navItemWithBadge: AxNavigationItem = {
  id: 'notifications',
  title: 'Notifications',
  type: 'item',
  badge: {
    content: '5',
    type: 'warn',
  },
};
expectType<AxNavigationItem>(navItemWithBadge);

// Positive: Navigation group with children
const navGroup: AxNavigationItem = {
  id: 'admin',
  title: 'Admin',
  type: 'group',
  children: [{ id: 'users', title: 'Users', type: 'item', link: '/users' }],
};
expectType<AxNavigationItem>(navGroup);

// Negative: Missing required fields
expectError<AxNavigationItem>({ id: 'test' });
expectError<AxNavigationItem>({ id: 'test', title: 'Test' }); // Missing type

// Positive: Navigation collection
const navigation: AxNavigation = {
  default: [navItem],
  compact: [navItem],
};
expectType<AxNavigation>(navigation);

// Negative: Missing required property
expectError<AxNavigation>({ default: [] }); // Missing compact

// Positive: Valid badge types
expectType<AxNavigationBadge>({ content: '10', type: 'primary' });
expectType<AxNavigationBadge>({ content: 'NEW', type: 'accent' });

// =============================================================================
// CONFIG TYPES
// =============================================================================

// Positive: Valid config
const config: AegisxConfig = {
  theme: { scheme: 'dark' },
  layout: { default: 'enterprise' },
};
expectType<AegisxConfig>(config);

// Positive: Valid layout types
expectType<AegisxLayoutType>('enterprise');
expectType<AegisxLayoutType>('classic');
expectType<AegisxLayoutType>('compact');
expectType<AegisxLayoutType>('empty');

// Negative: Invalid layout type
expectError<AegisxLayoutType>('invalid');

// =============================================================================
// COMPONENT TYPES - DRAWER
// =============================================================================

// Positive: Valid drawer positions
expectType<DrawerPosition>('left');
expectType<DrawerPosition>('right');
expectType<DrawerPosition>('top');
expectType<DrawerPosition>('bottom');

// Negative: Invalid drawer position
expectError<DrawerPosition>('center');
expectError<DrawerPosition>('middle');

// Positive: Valid drawer sizes
expectType<DrawerSize>('sm');
expectType<DrawerSize>('md');
expectType<DrawerSize>('lg');
expectType<DrawerSize>('xl');
expectType<DrawerSize>('full');

// Negative: Invalid drawer size
expectError<DrawerSize>('xs');
expectError<DrawerSize>('2xl');

// =============================================================================
// COMPONENT TYPES - BADGE
// =============================================================================

// Positive: Valid badge variants
expectType<BadgeVariant>('outlined');
expectType<BadgeVariant>('soft');
expectType<BadgeVariant>('outlined-strong');

// Negative: Invalid badge variant
expectError<BadgeVariant>('solid');
expectError<BadgeVariant>('filled');

// Positive: Valid badge types
expectType<BadgeType>('success');
expectType<BadgeType>('error');
expectType<BadgeType>('warning');
expectType<BadgeType>('info');
expectType<BadgeType>('neutral');

// Negative: Invalid badge type
expectError<BadgeType>('danger');
expectError<BadgeType>('primary');

// Positive: Valid badge sizes
expectType<BadgeSize>('sm');
expectType<BadgeSize>('md');
expectType<BadgeSize>('lg');

// Negative: Invalid badge size
expectError<BadgeSize>('xs');
expectError<BadgeSize>('xl');

// Positive: Valid badge rounded values
expectType<BadgeRounded>('none');
expectType<BadgeRounded>('sm');
expectType<BadgeRounded>('md');
expectType<BadgeRounded>('lg');
expectType<BadgeRounded>('full');

// =============================================================================
// COMPONENT TYPES - ALERT
// =============================================================================

// Positive: Valid alert variants
expectType<AlertVariant>('success');
expectType<AlertVariant>('error');
expectType<AlertVariant>('warning');
expectType<AlertVariant>('info');
expectType<AlertVariant>('default');

// Negative: Invalid alert variant
expectError<AlertVariant>('danger');
expectError<AlertVariant>('primary');

// =============================================================================
// COMPONENT TYPES - LAUNCHER
// =============================================================================

// Positive: Valid launcher colors
expectType<LauncherColor>('pink');
expectType<LauncherColor>('peach');
expectType<LauncherColor>('mint');
expectType<LauncherColor>('blue');
expectType<LauncherColor>('white');

// Negative: Invalid launcher color
expectError<LauncherColor>('red');
expectError<LauncherColor>('green');

// Positive: Valid launcher app status
expectType<LauncherAppStatus>('active');
expectType<LauncherAppStatus>('beta');
expectType<LauncherAppStatus>('new');
expectType<LauncherAppStatus>('maintenance');
expectType<LauncherAppStatus>('coming_soon');
expectType<LauncherAppStatus>('disabled');
expectType<LauncherAppStatus>('hidden');

// Positive: Valid launcher view modes
expectType<LauncherViewMode>('grid');
expectType<LauncherViewMode>('list');
expectType<LauncherViewMode>('compact');

// Negative: Invalid view mode
expectError<LauncherViewMode>('table');

// Positive: Valid group by options
expectType<LauncherGroupBy>('category');
expectType<LauncherGroupBy>('status');
expectType<LauncherGroupBy>('none');

// Positive: Valid launcher app
const launcherApp: LauncherApp = {
  id: 'app1',
  name: 'My App',
  icon: 'dashboard',
  color: 'blue',
  status: 'active',
  enabled: true,
};
expectType<LauncherApp>(launcherApp);

// Negative: Missing required fields
expectError<LauncherApp>({ id: 'app1', name: 'My App' }); // Missing icon, color, status, enabled

// Positive: Valid launcher config
const launcherConfig: LauncherConfig = {
  showSearch: true,
  defaultViewMode: 'grid',
  enableFavorites: true,
};
expectType<LauncherConfig>(launcherConfig);

// =============================================================================
// WIDGET TYPES
// =============================================================================

// Positive: Valid widget categories
expectType<WidgetCategory>('display');
expectType<WidgetCategory>('chart');
expectType<WidgetCategory>('data');
expectType<WidgetCategory>('action');
expectType<WidgetCategory>('custom');

// Negative: Invalid widget category
expectError<WidgetCategory>('table');

// Positive: Valid widget status
expectType<WidgetStatus>('stable');
expectType<WidgetStatus>('beta');
expectType<WidgetStatus>('experimental');
expectType<WidgetStatus>('deprecated');

// Positive: Valid widget position
const widgetPos: WidgetPosition = {
  x: 0,
  y: 0,
  cols: 2,
  rows: 2,
};
expectType<WidgetPosition>(widgetPos);

// Positive: Widget definition with generic constraint
const widgetDef: WidgetDefinition<{ title: string }> = {
  id: 'my-widget',
  name: 'My Widget',
  description: 'A test widget',
  icon: 'widgets',
  category: 'display',
  component: {} as any, // Component reference
  sizes: {
    minSize: { cols: 1, rows: 1 },
    defaultSize: { cols: 2, rows: 2 },
  },
  defaultConfig: { title: 'Test' },
};
expectType<WidgetDefinition<{ title: string }>>(widgetDef);

// Positive: Widget instance
const widgetInstance: WidgetInstance<{ title: string }> = {
  instanceId: 'widget-1',
  widgetId: 'my-widget',
  position: widgetPos,
  config: { title: 'My Instance' },
};
expectType<WidgetInstance<{ title: string }>>(widgetInstance);

// Test generic type inference
expectAssignable<WidgetInstance>(widgetInstance);

// Positive: Dashboard config
const dashboardConfig: DashboardConfig = {
  id: 'dash-1',
  name: 'My Dashboard',
  columns: 4,
  rowHeight: 160,
  gap: 16,
  widgets: [widgetInstance],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
expectType<DashboardConfig>(dashboardConfig);

// Negative: Missing required fields
expectError<DashboardConfig>({
  id: 'dash-1',
  name: 'My Dashboard',
  // Missing columns, rowHeight, gap, widgets, createdAt, updatedAt
});

// =============================================================================
// SERVICE TYPES - THEME
// =============================================================================

// Positive: Valid theme modes
expectType<ThemeMode>('light');
expectType<ThemeMode>('dark');

// Negative: Invalid theme mode
expectError<ThemeMode>('auto');
expectError<ThemeMode>('system');

// Positive: Valid color schemes
expectType<ColorScheme>('aegisx');
expectType<ColorScheme>('verus');

// Negative: Invalid color scheme
expectError<ColorScheme>('custom');

// Positive: Valid theme config
const themeConfig: ThemeConfig = {
  colorScheme: 'aegisx',
  mode: 'dark',
  themeId: 'aegisx-dark',
  dataTheme: 'aegisx-dark',
};
expectType<ThemeConfig>(themeConfig);

// Positive: Valid background keys
expectType<BackgroundKey>('muted');
expectType<BackgroundKey>('subtle');
expectType<BackgroundKey>('default');
expectType<BackgroundKey>('emphasis');

// Negative: Invalid background key
expectError<BackgroundKey>('primary');

// Positive: Valid text keys
expectType<TextKey>('disabled');
expectType<TextKey>('subtle');
expectType<TextKey>('secondary');
expectType<TextKey>('primary');
expectType<TextKey>('heading');
expectType<TextKey>('inverted');

// Positive: Valid border keys
expectType<BorderKey>('muted');
expectType<BorderKey>('default');
expectType<BorderKey>('emphasis');

// Positive: Valid font size keys
expectType<FontSizeKey>('xs');
expectType<FontSizeKey>('sm');
expectType<FontSizeKey>('base');
expectType<FontSizeKey>('lg');
expectType<FontSizeKey>('xl');
expectType<FontSizeKey>('2xl');
expectType<FontSizeKey>('3xl');
expectType<FontSizeKey>('4xl');

// Negative: Invalid font size key
expectError<FontSizeKey>('5xl');
expectError<FontSizeKey>('xxs');

// =============================================================================
// SERVICE TYPES - TOAST
// =============================================================================

// Positive: Valid toast types
expectType<ToastType>('success');
expectType<ToastType>('error');
expectType<ToastType>('warning');
expectType<ToastType>('info');

// Negative: Invalid toast type
expectError<ToastType>('danger');

// Positive: Valid toast providers
expectType<ToastProvider>('toastr');
expectType<ToastProvider>('snackbar');
expectType<ToastProvider>('auto');

// Negative: Invalid toast provider
expectError<ToastProvider>('custom');

// Positive: Valid toast positions
expectType<ToastPosition>('toast-top-right');
expectType<ToastPosition>('toast-bottom-left');
expectType<ToastPosition>('toast-top-center');

// Negative: Invalid toast position
expectError<ToastPosition>('center');

// Positive: Valid toast options
const toastOptions: ToastOptions = {
  duration: 5000,
  provider: 'toastr',
  title: 'Success',
  position: 'toast-top-right',
  closeButton: true,
  progressBar: true,
};
expectType<ToastOptions>(toastOptions);

// Positive: Minimal toast options (all optional)
expectType<ToastOptions>({});

// Positive: Toast ref interface
const toastRef: ToastRef = {
  dismiss: () => undefined,
  afterDismissed: () => Promise.resolve(),
};
expectType<ToastRef>(toastRef);

// =============================================================================
// TYPE INFERENCE TESTS
// =============================================================================

// Test that widget definition config type is preserved
const myWidgetDef: WidgetDefinition<{ count: number }> = {
  id: 'counter',
  name: 'Counter',
  description: 'A counter widget',
  icon: 'add',
  category: 'display',
  component: {} as any,
  sizes: {
    minSize: { cols: 1, rows: 1 },
    defaultSize: { cols: 1, rows: 1 },
  },
  defaultConfig: { count: 0 },
};

// The config type should be inferred correctly
expectType<{ count: number }>(myWidgetDef.defaultConfig);

// Test that widget instance config matches definition
const myWidgetInstance: WidgetInstance<{ count: number }> = {
  instanceId: 'counter-1',
  widgetId: 'counter',
  position: { x: 0, y: 0, cols: 1, rows: 1 },
  config: { count: 5 },
};

expectType<{ count: number }>(myWidgetInstance.config);

// =============================================================================
// GENERIC CONSTRAINTS TESTS
// =============================================================================

// Test that WidgetDefinition accepts any config type
expectAssignable<WidgetDefinition<unknown>>({
  id: 'any-widget',
  name: 'Any Widget',
  description: 'Test',
  icon: 'widgets',
  category: 'custom',
  component: {} as any,
  sizes: {
    minSize: { cols: 1, rows: 1 },
    defaultSize: { cols: 2, rows: 2 },
  },
  defaultConfig: { anything: true },
});

// Test that WidgetInstance config must match type parameter
expectNotAssignable<WidgetInstance<{ title: string }>>({
  instanceId: 'test',
  widgetId: 'test',
  position: { x: 0, y: 0, cols: 1, rows: 1 },
  config: { count: 5 }, // Wrong config type
});

// =============================================================================
// UNION TYPE TESTS
// =============================================================================

// Test that union types work correctly for navigation item types
const itemType:
  | 'item'
  | 'basic'
  | 'group'
  | 'collapsible'
  | 'divider'
  | 'spacer' = 'group';
const navWithUnionType: AxNavigationItem = {
  id: 'test',
  title: 'Test',
  type: itemType,
};
expectType<AxNavigationItem>(navWithUnionType);

// Test that color scheme can be used in type guards
const colorScheme: ColorScheme = 'aegisx';
if (colorScheme === 'aegisx') {
  expectType<'aegisx'>(colorScheme);
}
