# AegisX UI Type Catalog

> **Comprehensive Reference for All Exported Types**
>
> This document provides a complete catalog of all types exported from `@aegisx/ui`, organized by category with descriptions, import paths, and usage examples.

## Table of Contents

- [Core Types](#core-types)
  - [Configuration](#configuration)
  - [Layout](#layout)
  - [Theme](#theme)
  - [Navigation](#navigation)
- [Component Types](#component-types)
  - [Data Display](#data-display)
  - [Forms](#forms)
  - [Feedback](#feedback)
  - [Navigation Components](#navigation-components)
  - [Dialogs](#dialogs)
  - [Advanced Components](#advanced-components)
- [Widget Types](#widget-types)
  - [Widget Core](#widget-core)
  - [Widget Components](#widget-components)
- [Service Types](#service-types)
  - [Theme Service](#theme-service)
  - [Toast Service](#toast-service)
- [Layout Types](#layout-types)
- [Utility Types](#utility-types)

---

## Core Types

### Configuration

Configuration types for initializing and customizing the AegisX UI library.

#### `AegisxConfig`

Main configuration interface for the AegisX UI library.

```typescript
import { AegisxConfig } from '@aegisx/ui';

interface AegisxConfig {
  theme?: AegisxThemeConfig;
  layout?: AegisxLayoutPreferences;
  features?: AegisxFeatureConfig;
  navigation?: AegisxNavigationConfig;
  ui?: AegisxUIConfig;
  language?: string;
  custom?: Record<string, unknown>;
}
```

**Usage Example:**

```typescript
import { provideAegisx, AegisxConfig } from '@aegisx/ui';

const config: AegisxConfig = {
  theme: {
    name: 'default',
    scheme: 'dark',
    colors: {
      primary: '#3f51b5',
      accent: '#ff4081',
    },
  },
  layout: {
    default: 'enterprise',
    sidenavWidth: 280,
  },
  features: {
    darkMode: true,
    animations: true,
  },
};

export const appConfig: ApplicationConfig = {
  providers: [provideAegisx(config)],
};
```

**Related Types:** [`AegisxThemeConfig`](#aegisxthemeconfig), [`AegisxLayoutPreferences`](#aegisxlayoutpreferences), [`AegisxFeatureConfig`](#aegisxfeatureconfig), [`AegisxNavigationConfig`](#aegisxnavigationconfig), [`AegisxUIConfig`](#aegisxuiconfig)

---

#### `AegisxThemeConfig`

Theme configuration options.

```typescript
import { AegisxThemeConfig } from '@aegisx/ui';

interface AegisxThemeConfig {
  name?: string;
  scheme?: 'light' | 'dark' | 'auto';
  colors?: {
    primary?: string;
    accent?: string;
    warn?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: string;
  };
  spacing?: Record<string, string>;
  customCss?: string;
}
```

---

#### `AegisxLayoutPreferences`

General layout preferences.

```typescript
import { AegisxLayoutPreferences, AegisxLayoutType } from '@aegisx/ui';

interface AegisxLayoutPreferences {
  default?: AegisxLayoutType;
  sidenavWidth?: number;
  showBranding?: boolean;
  collapsible?: boolean;
}
```

---

#### `AegisxLayoutType`

Available layout types.

```typescript
import { AegisxLayoutType } from '@aegisx/ui';

type AegisxLayoutType = 'empty' | 'classic' | 'compact' | 'enterprise' | 'docs';
```

**Usage Example:**

```typescript
const layoutType: AegisxLayoutType = 'enterprise';
```

---

#### `AegisxFeatureConfig`

Feature flags for optional functionality.

```typescript
import { AegisxFeatureConfig } from '@aegisx/ui';

interface AegisxFeatureConfig {
  darkMode?: boolean;
  rtl?: boolean;
  animations?: boolean;
  ripple?: boolean;
  virtualScrolling?: boolean;
}
```

---

#### `AegisxNavigationConfig`

Navigation behavior configuration.

```typescript
import { AegisxNavigationConfig } from '@aegisx/ui';

interface AegisxNavigationConfig {
  size?: 'default' | 'compact' | 'comfortable';
  style?: 'default' | 'flat';
  position?: 'left' | 'right' | 'top';
  autoCollapse?: boolean;
}
```

---

#### `AegisxUIConfig`

UI behavior configuration.

```typescript
import { AegisxUIConfig } from '@aegisx/ui';

interface AegisxUIConfig {
  animations?: boolean;
  ripple?: boolean;
  notifications?: {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    duration?: number;
  };
}
```

---

### Layout

Layout component configuration types.

#### `AegisxLayoutConfig`

Detailed layout component configuration.

```typescript
import { AegisxLayoutConfig } from '@aegisx/ui';

interface AegisxLayoutConfig {
  navbar: {
    hidden: boolean;
    position: 'left' | 'right' | 'top';
    width: number;
    backgroundColor?: string;
    variant?: 'vertical' | 'horizontal';
  };
  toolbar: {
    hidden: boolean;
    position: 'above' | 'below' | 'none';
    height: number;
    backgroundColor?: string;
  };
  footer: {
    hidden: boolean;
    position: 'above' | 'below' | 'none';
    height: number;
    backgroundColor?: string;
  };
  sidepanel: {
    hidden: boolean;
    position: 'left' | 'right';
  };
  settings: {
    hidden: boolean;
  };
}
```

**Usage Example:**

```typescript
import { AegisxLayoutConfig } from '@aegisx/ui';

const layoutConfig: AegisxLayoutConfig = {
  navbar: {
    hidden: false,
    position: 'left',
    width: 280,
    variant: 'vertical',
  },
  toolbar: {
    hidden: false,
    position: 'above',
    height: 64,
  },
  footer: {
    hidden: true,
    position: 'none',
    height: 0,
  },
  sidepanel: {
    hidden: true,
    position: 'right',
  },
  settings: {
    hidden: false,
  },
};
```

---

#### `AegisxBreakpoints`

Responsive breakpoint configuration.

```typescript
import { AegisxBreakpoints } from '@aegisx/ui';

interface AegisxBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}
```

---

### Theme

Theme system types for color schemes, modes, and customization.

#### `ColorScheme`

Available color schemes.

```typescript
import { ColorScheme } from '@aegisx/ui';

type ColorScheme = 'aegisx' | 'verus';
```

---

#### `ThemeMode`

Theme mode (light/dark).

```typescript
import { ThemeMode } from '@aegisx/ui';

type ThemeMode = 'light' | 'dark';
```

---

#### `ThemeOption`

Theme option configuration.

```typescript
import { ThemeOption } from '@aegisx/ui';

interface ThemeOption {
  id: string;
  name: string;
  path: string;
  colorScheme?: ColorScheme;
  mode?: ThemeMode;
  dataTheme?: string;
}
```

---

#### `ThemeConfig`

Current theme configuration state.

```typescript
import { ThemeConfig } from '@aegisx/ui';

interface ThemeConfig {
  colorScheme: ColorScheme;
  mode: ThemeMode;
  themeId: string;
  dataTheme: string;
}
```

---

#### Theme Builder Keys

Type-safe keys for theme customization.

```typescript
import { BackgroundKey, TextKey, BorderKey, FontSizeKey, FontWeightKey, LineHeightKey, SpacingKey, RadiusKey, ShadowKey } from '@aegisx/ui';

type BackgroundKey = 'muted' | 'subtle' | 'default' | 'emphasis';
type TextKey = 'disabled' | 'subtle' | 'secondary' | 'primary' | 'heading' | 'inverted';
type BorderKey = 'muted' | 'default' | 'emphasis';
type FontSizeKey = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type FontWeightKey = 'normal' | 'medium' | 'semibold' | 'bold';
type LineHeightKey = 'tight' | 'normal' | 'relaxed';
type SpacingKey = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type RadiusKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
type ShadowKey = 'sm' | 'md' | 'lg';
```

**Usage Example:**

```typescript
import { AxThemeService, BackgroundKey, TextKey } from '@aegisx/ui';

@Component({
  template: `
    <div>
      <input [(ngModel)]="bgKey" placeholder="Background key" />
      <input [(ngModel)]="textKey" placeholder="Text key" />
    </div>
  `,
})
export class ThemeCustomizerComponent {
  bgKey: BackgroundKey = 'default';
  textKey: TextKey = 'primary';

  constructor(private theme: AxThemeService) {}

  applyColors() {
    // Type-safe theme customization
    const bgColor = this.theme.getColor('background', this.bgKey);
    const textColor = this.theme.getColor('text', this.textKey);
  }
}
```

---

### Navigation

Unified navigation types for all layouts.

#### `AxNavigationItem`

Primary navigation item interface used across all layouts.

```typescript
import { AxNavigationItem } from '@aegisx/ui';

interface AxNavigationItem {
  id: string;
  title: string;
  subtitle?: string;
  type?: 'item' | 'basic' | 'group' | 'collapsible' | 'collapsable' | 'divider' | 'spacer';
  icon?: string;
  link?: string | string[];
  children?: AxNavigationItem[];
  badge?: AxNavigationBadge | { content: string; type?: string };
  hidden?: boolean | (() => boolean);
  active?: boolean | (() => boolean);
  disabled?: boolean | (() => boolean);
  tooltip?: string;
  exactMatch?: boolean;
  externalLink?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  permissions?: string[];
  classes?: string;
  meta?: Record<string, unknown>;
  expanded?: boolean;
  defaultOpen?: boolean;
  badgeColor?: 'primary' | 'accent' | 'warn';
}
```

**Usage Example:**

```typescript
import { AxNavigationItem } from '@aegisx/ui';

const navigation: AxNavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'item',
    icon: 'dashboard',
    link: '/dashboard',
  },
  {
    id: 'apps',
    title: 'Applications',
    type: 'collapsible',
    icon: 'apps',
    children: [
      {
        id: 'crm',
        title: 'CRM',
        type: 'item',
        link: '/apps/crm',
        badge: {
          content: 'New',
          type: 'success',
        },
      },
      {
        id: 'analytics',
        title: 'Analytics',
        type: 'item',
        link: '/apps/analytics',
        permissions: ['analytics:view'],
      },
    ],
  },
  {
    id: 'divider-1',
    type: 'divider',
  },
  {
    id: 'settings',
    title: 'Settings',
    type: 'item',
    icon: 'settings',
    link: '/settings',
    permissions: ['settings:manage'],
  },
];
```

**Related Types:** [`AxNavigationBadge`](#axnavigationbadge)

---

#### `AxNavigationBadge`

Badge configuration for navigation items.

```typescript
import { AxNavigationBadge } from '@aegisx/ui';

interface AxNavigationBadge {
  content?: string;
  title?: string;
  type?: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  classes?: string;
}
```

**Usage Example:**

```typescript
import { AxNavigationBadge } from '@aegisx/ui';

const badge: AxNavigationBadge = {
  content: '5',
  type: 'warn',
};
```

---

#### `AxNavigation`

Navigation collection for different layout modes.

```typescript
import { AxNavigation } from '@aegisx/ui';

interface AxNavigation {
  default: AxNavigationItem[];
  compact: AxNavigationItem[];
  horizontal?: AxNavigationItem[];
  mobile?: AxNavigationItem[];
}
```

**Usage Example:**

```typescript
import { AxNavigation, AxNavigationItem } from '@aegisx/ui';

const navigation: AxNavigation = {
  default: [{ id: 'home', title: 'Home', type: 'item', icon: 'home', link: '/' }],
  compact: [{ id: 'home', title: 'Home', type: 'item', icon: 'home', link: '/' }],
  horizontal: [{ id: 'home', title: 'Home', type: 'item', link: '/' }],
};
```

---

#### `AxNavigationConfig`

Navigation component configuration.

```typescript
import { AxNavigationConfig } from '@aegisx/ui';

interface AxNavigationConfig {
  state: 'collapsed' | 'expanded';
  mode: 'side' | 'over' | 'push';
  position: 'left' | 'right';
  showToggleButton: boolean;
  autoCollapse: boolean;
  breakpoint: 'sm' | 'md' | 'lg' | 'xl';
}
```

---

#### `AxNavigationEvents`

Navigation component event handlers.

```typescript
import { AxNavigationEvents } from '@aegisx/ui';

interface AxNavigationEvents {
  onStateChange?: (state: 'collapsed' | 'expanded') => void;
  onItemClick?: (item: AxNavigationItem) => void;
  onGroupToggle?: (group: AxNavigationItem, isOpen: boolean) => void;
}
```

---

## Component Types

### Data Display

Types for data display components.

#### `DrawerPosition`

Drawer slide-in position.

```typescript
import { DrawerPosition } from '@aegisx/ui';

type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
```

**Usage Example:**

```typescript
import { DrawerPosition } from '@aegisx/ui';

@Component({
  template: `
    <ax-drawer [position]="position" [size]="size">
      <h2>Drawer Content</h2>
    </ax-drawer>
  `,
})
export class MyComponent {
  position: DrawerPosition = 'right';
  size: DrawerSize = 'md';
}
```

**Related Types:** [`DrawerSize`](#drawersize)

---

#### `DrawerSize`

Drawer size preset.

```typescript
import { DrawerSize } from '@aegisx/ui';

type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
```

**Dimensions:**

- **Side drawers (left/right):** sm=320px, md=400px, lg=500px, xl=640px, full=100%
- **Bottom drawers (top/bottom):** sm=200px, md=320px, lg=480px, xl=640px, full=100%

**Usage Example:**

```typescript
// Medium side drawer (400px wide)
<ax-drawer position="right" size="md">
  Sidebar content
</ax-drawer>

// Small bottom sheet (200px tall)
<ax-drawer position="bottom" size="sm">
  Quick actions
</ax-drawer>
```

---

#### `BadgeVariant`

Badge visual style variant.

```typescript
import { BadgeVariant } from '@aegisx/ui';

type BadgeVariant = 'outlined' | 'soft' | 'outlined-strong';
```

**Related Types:** [`BadgeType`](#badgetype), [`BadgeSize`](#badgesize), [`BadgeRounded`](#badgerounded)

---

#### `BadgeType`

Badge semantic type/color.

```typescript
import { BadgeType } from '@aegisx/ui';

type BadgeType = 'success' | 'error' | 'warning' | 'info' | 'neutral';
```

**Usage Example:**

```typescript
import { BadgeType, BadgeVariant } from '@aegisx/ui';

@Component({
  template: ` <ax-badge [type]="type" [variant]="variant">{{ label }}</ax-badge> `,
})
export class StatusBadgeComponent {
  type: BadgeType = 'success';
  variant: BadgeVariant = 'soft';
  label = 'Active';
}
```

---

#### `BadgeSize`

Badge size options.

```typescript
import { BadgeSize } from '@aegisx/ui';

type BadgeSize = 'sm' | 'md' | 'lg';
```

---

#### `BadgeRounded`

Badge border radius.

```typescript
import { BadgeRounded } from '@aegisx/ui';

type BadgeRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';
```

---

### Forms

Types for form components.

#### `DatePickerSize`

Date picker display size.

```typescript
import { DatePickerSize } from '@aegisx/ui';

type DatePickerSize = 'sm' | 'md';
```

**Related Types:** [`DatePickerLocale`](#datepickerlocale), [`DatePickerCalendar`](#datepickercalendar), [`DatePickerMode`](#datepickermode)

---

#### `DatePickerLocale`

Date picker localization.

```typescript
import { DatePickerLocale } from '@aegisx/ui';

type DatePickerLocale = 'en' | 'th';
```

---

#### `DatePickerCalendar`

Date picker calendar system.

```typescript
import { DatePickerCalendar } from '@aegisx/ui';

type DatePickerCalendar = 'gregorian' | 'buddhist';
```

---

#### `DatePickerMode`

Date picker selection mode.

```typescript
import { DatePickerMode } from '@aegisx/ui';

type DatePickerMode = 'single' | 'range';
```

---

#### `DatePickerMonthFormat`

Month name display format.

```typescript
import { DatePickerMonthFormat } from '@aegisx/ui';

type DatePickerMonthFormat = 'full' | 'short';
```

---

#### `DatePickerDisplayMode`

Date picker presentation mode.

```typescript
import { DatePickerDisplayMode } from '@aegisx/ui';

type DatePickerDisplayMode = 'input' | 'inline';
```

---

#### `DateRange`

Date range value for range mode.

```typescript
import { DateRange } from '@aegisx/ui';

interface DateRange {
  start: Date | null;
  end: Date | null;
}
```

**Usage Example:**

```typescript
import { DateRange, DatePickerMode } from '@aegisx/ui';

@Component({
  template: ` <ax-date-picker [mode]="mode" [(ngModel)]="dateRange" (ngModelChange)="onDateChange($event)"> </ax-date-picker> `,
})
export class DateRangePickerComponent {
  mode: DatePickerMode = 'range';
  dateRange: DateRange = {
    start: new Date('2024-03-01'),
    end: new Date('2024-03-15'),
  };

  onDateChange(range: DateRange) {
    console.log('Start:', range.start);
    console.log('End:', range.end);
  }
}
```

---

### Feedback

Types for feedback components.

#### `AlertVariant`

Alert visual variant and severity.

```typescript
import { AlertVariant } from '@aegisx/ui';

type AlertVariant = 'success' | 'error' | 'warning' | 'info' | 'default';
```

**Usage Example:**

```typescript
import { AlertVariant } from '@aegisx/ui';

@Component({
  template: `
    <ax-alert [variant]="variant" [title]="title">
      {{ message }}
    </ax-alert>
  `,
})
export class NotificationComponent {
  variant: AlertVariant = 'success';
  title = 'Operation completed';
  message = 'Your changes have been saved successfully.';
}
```

---

### Navigation Components

Types for navigation components.

#### `CommandItem`

Command palette executable item.

```typescript
import { CommandItem } from '@aegisx/ui';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category?: string;
  keywords?: string[];
  disabled?: boolean;
  action?: string | (() => void);
  routerLink?: string | string[];
  href?: string;
  children?: CommandItem[];
  data?: unknown;
}
```

**Usage Example:**

```typescript
import { CommandItem } from '@aegisx/ui';

const commands: CommandItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Go to Dashboard',
    description: 'Navigate to the main dashboard',
    icon: 'dashboard',
    shortcut: '⌘D',
    category: 'Navigation',
    routerLink: '/dashboard',
  },
  {
    id: 'create-user',
    label: 'Create New User',
    icon: 'person_add',
    category: 'Actions',
    keywords: ['add', 'new', 'user'],
    action: () => this.openCreateUserDialog(),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    children: [
      {
        id: 'profile',
        label: 'Profile Settings',
        routerLink: '/settings/profile',
      },
      {
        id: 'security',
        label: 'Security',
        routerLink: '/settings/security',
      },
    ],
  },
];
```

**Related Types:** [`CommandGroup`](#commandgroup), [`CommandPaletteConfig`](#commandpaletteconfig), [`CommandSearchResult`](#commandsearchresult)

---

#### `CommandGroup`

Command group for organizing commands.

```typescript
import { CommandGroup } from '@aegisx/ui';

interface CommandGroup {
  id: string;
  label: string;
  commands: CommandItem[];
  priority?: number;
}
```

---

#### `CommandPaletteConfig`

Command palette configuration.

```typescript
import { CommandPaletteConfig } from '@aegisx/ui';

interface CommandPaletteConfig {
  placeholder?: string;
  emptyMessage?: string;
  maxRecentCommands?: number;
  showRecent?: boolean;
  showShortcuts?: boolean;
  hotkey?: string;
  useMetaKey?: boolean;
  searchDebounce?: number;
  maxHeight?: string;
  animationDuration?: number;
}
```

**Usage Example:**

```typescript
import { CommandPaletteConfig } from '@aegisx/ui';

const config: CommandPaletteConfig = {
  placeholder: 'Search commands...',
  emptyMessage: 'No commands found',
  maxRecentCommands: 5,
  showRecent: true,
  showShortcuts: true,
  hotkey: 'k',
  useMetaKey: true,
  searchDebounce: 150,
  maxHeight: '400px',
};
```

---

#### `CommandSearchResult`

Search result with highlighting.

```typescript
import { CommandSearchResult } from '@aegisx/ui';

interface CommandSearchResult {
  item: CommandItem;
  score: number;
  matches?: {
    field: string;
    indices: [number, number][];
  }[];
}
```

---

#### `CommandPaletteState`

Command palette internal state.

```typescript
import { CommandPaletteState } from '@aegisx/ui';

interface CommandPaletteState {
  isOpen: boolean;
  searchQuery: string;
  selectedIndex: number;
  results: CommandSearchResult[];
  recentCommands: CommandItem[];
  isLoading: boolean;
}
```

---

#### `CommandExecutedEvent`

Event emitted when command executes.

```typescript
import { CommandExecutedEvent } from '@aegisx/ui';

interface CommandExecutedEvent {
  command: CommandItem;
  timestamp: Date;
}
```

---

### Dialogs

Dialog component types are exported from the dialogs module. See [`AxDialogService`](#service-types) for programmatic dialog usage.

---

### Advanced Components

#### App Launcher Types

##### `LauncherColor`

Pastel color theme for app cards.

```typescript
import { LauncherColor } from '@aegisx/ui';

type LauncherColor = 'pink' | 'peach' | 'mint' | 'blue' | 'yellow' | 'lavender' | 'cyan' | 'rose' | 'neutral' | 'white';
```

**Related Types:** [`LauncherApp`](#launcherapp), [`LauncherAppStatus`](#launcherappstatus)

---

##### `LauncherAppStatus`

App visibility/operational status.

```typescript
import { LauncherAppStatus } from '@aegisx/ui';

type LauncherAppStatus = 'active' | 'beta' | 'new' | 'maintenance' | 'coming_soon' | 'disabled' | 'hidden';
```

---

##### `LauncherViewMode`

Launcher display mode.

```typescript
import { LauncherViewMode } from '@aegisx/ui';

type LauncherViewMode = 'grid' | 'list' | 'compact';
```

---

##### `LauncherGroupBy`

Launcher grouping option.

```typescript
import { LauncherGroupBy } from '@aegisx/ui';

type LauncherGroupBy = 'category' | 'status' | 'none';
```

---

##### `LauncherCategory`

App category for grouping.

```typescript
import { LauncherCategory } from '@aegisx/ui';

interface LauncherCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  order?: number;
  color?: string;
}
```

---

##### `LauncherPermission`

RBAC permission configuration.

```typescript
import { LauncherPermission } from '@aegisx/ui';

interface LauncherPermission {
  viewRoles?: string[];
  accessRoles?: string[];
  viewPermissions?: string[];
  accessPermissions?: string[];
  canView?: () => boolean | Observable<boolean>;
  canAccess?: () => boolean | Observable<boolean>;
}
```

---

##### `LauncherMenuAction`

Menu action for app card.

```typescript
import { LauncherMenuAction } from '@aegisx/ui';

interface LauncherMenuAction {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  roles?: string[];
  permissions?: string[];
}
```

---

##### `LauncherApp`

Main app item interface.

```typescript
import { LauncherApp } from '@aegisx/ui';

interface LauncherApp {
  id: string;
  name: string;
  description?: string;
  icon: string;
  route?: string;
  externalUrl?: string;
  color: LauncherColor;
  categoryId?: string;
  tags?: string[];
  order?: number;
  status: LauncherAppStatus;
  enabled: boolean;
  notificationCount?: number;
  lastEdited?: string;
  version?: string;
  permission?: LauncherPermission;
  menuActions?: LauncherMenuAction[];
  showDefaultMenu?: boolean;
  featured?: boolean;
  x?: number;
  y?: number;
  cols?: number;
  rows?: number;
}
```

**Usage Example:**

```typescript
import { LauncherApp, LauncherColor, LauncherAppStatus } from '@aegisx/ui';

const apps: LauncherApp[] = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Customer Relationship Management',
    icon: 'people',
    route: '/apps/crm',
    color: 'blue',
    status: 'active',
    enabled: true,
    categoryId: 'business',
    featured: true,
    notificationCount: 5,
    permission: {
      viewRoles: ['user', 'admin'],
      accessRoles: ['user', 'admin'],
    },
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Business Intelligence Dashboard',
    icon: 'analytics',
    route: '/apps/analytics',
    color: 'mint',
    status: 'beta',
    enabled: true,
    categoryId: 'analytics',
    permission: {
      viewPermissions: ['analytics:view'],
      accessPermissions: ['analytics:access'],
    },
    menuActions: [
      {
        id: 'export',
        label: 'Export Data',
        icon: 'download',
      },
    ],
  },
];
```

**Related Types:** [`LauncherConfig`](#launcherconfig), [`LauncherAppClickEvent`](#launcherappclickevent)

---

##### `LauncherConfig`

Launcher component configuration.

```typescript
import { LauncherConfig } from '@aegisx/ui';

interface LauncherConfig {
  showSearch?: boolean;
  showCategoryTabs?: boolean;
  showStatusFilter?: boolean;
  showViewToggle?: boolean;
  defaultViewMode?: LauncherViewMode;
  defaultGroupBy?: LauncherGroupBy;
  emptyMessage?: string;
  noResultsMessage?: string;
  enableFavorites?: boolean;
  enablePinned?: boolean;
  enableRecent?: boolean;
  maxRecentApps?: number;
  storageKeyPrefix?: string;
  defaultMenuActions?: LauncherDefaultMenuActions;
  cardMinWidth?: number;
  cardMaxWidth?: number;
  cardGap?: number;
  enableDraggable?: boolean;
  gridsterConfig?: LauncherGridsterConfig;
}
```

---

##### `LauncherAppClickEvent`

App click event.

```typescript
import { LauncherAppClickEvent } from '@aegisx/ui';

interface LauncherAppClickEvent {
  app: LauncherApp;
  newTab?: boolean;
}
```

---

##### `LauncherMenuActionEvent`

Menu action event.

```typescript
import { LauncherMenuActionEvent } from '@aegisx/ui';

interface LauncherMenuActionEvent {
  app: LauncherApp;
  action: LauncherMenuAction;
}
```

---

## Widget Types

### Widget Core

Core types for the widget framework.

#### `WidgetCategory`

Widget category classification.

```typescript
import { WidgetCategory } from '@aegisx/ui';

type WidgetCategory = 'display' | 'chart' | 'data' | 'action' | 'custom';
```

**Related Types:** [`WidgetDefinition`](#widgetdefinition), [`WidgetStatus`](#widgetstatus)

---

#### `WidgetStatus`

Widget stability status.

```typescript
import { WidgetStatus } from '@aegisx/ui';

type WidgetStatus = 'stable' | 'beta' | 'experimental' | 'deprecated';
```

---

#### `WidgetSize`

Widget dimensions in grid units.

```typescript
import { WidgetSize } from '@aegisx/ui';

interface WidgetSize {
  cols: number;
  rows: number;
}
```

**Usage Example:**

```typescript
import { WidgetSize } from '@aegisx/ui';

const size: WidgetSize = {
  cols: 2,
  rows: 1,
};
```

**Related Types:** [`WidgetSizeConstraints`](#widgetsizeconstraints), [`WidgetPosition`](#widgetposition)

---

#### `WidgetSizeConstraints`

Widget size constraints.

```typescript
import { WidgetSizeConstraints } from '@aegisx/ui';

interface WidgetSizeConstraints {
  minSize: WidgetSize;
  maxSize?: WidgetSize;
  defaultSize: WidgetSize;
}
```

**Usage Example:**

```typescript
import { WidgetSizeConstraints } from '@aegisx/ui';

const constraints: WidgetSizeConstraints = {
  minSize: { cols: 1, rows: 1 },
  maxSize: { cols: 4, rows: 4 },
  defaultSize: { cols: 2, rows: 2 },
};
```

---

#### `WidgetPosition`

Widget position in grid (extends WidgetSize).

```typescript
import { WidgetPosition } from '@aegisx/ui';

interface WidgetPosition extends WidgetSize {
  x: number;
  y: number;
}
```

**Usage Example:**

```typescript
import { WidgetPosition } from '@aegisx/ui';

const position: WidgetPosition = {
  x: 0,
  y: 0,
  cols: 2,
  rows: 1,
};
```

---

#### `WidgetDataSource`

Data source configuration for widgets.

```typescript
import { WidgetDataSource } from '@aegisx/ui';

interface WidgetDataSource {
  endpoint?: string;
  params?: Record<string, unknown>;
  wsChannel?: string;
  refreshInterval?: number;
  transform?: string;
}
```

**Usage Example:**

```typescript
import { WidgetDataSource } from '@aegisx/ui';

const dataSource: WidgetDataSource = {
  endpoint: '/api/kpi/revenue',
  params: {
    period: 'monthly',
    year: 2024,
  },
  wsChannel: 'revenue-updates',
  refreshInterval: 60000, // 1 minute
  transform: 'formatCurrency',
};
```

---

#### `WidgetDefinition`

Widget registry entry (definition).

```typescript
import { WidgetDefinition } from '@aegisx/ui';

interface WidgetDefinition<TConfig = unknown> {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: WidgetCategory;
  status?: WidgetStatus;
  component: Type<unknown>;
  sizes: WidgetSizeConstraints;
  defaultConfig: TConfig;
  configSchema?: object;
  thumbnail?: string;
  tags?: string[];
}
```

**Usage Example:**

```typescript
import { WidgetDefinition, WidgetCategory } from '@aegisx/ui';
import { KpiWidgetComponent, KpiWidgetConfig } from './kpi-widget';

const kpiWidget: WidgetDefinition<KpiWidgetConfig> = {
  id: 'ax-kpi-widget',
  name: 'KPI Widget',
  description: 'Display key performance indicators',
  icon: 'analytics',
  category: 'display',
  status: 'stable',
  component: KpiWidgetComponent,
  sizes: {
    minSize: { cols: 1, rows: 1 },
    maxSize: { cols: 2, rows: 2 },
    defaultSize: { cols: 1, rows: 1 },
  },
  defaultConfig: {
    title: 'KPI',
    value: 0,
    trend: 'up',
    color: 'primary',
  },
  tags: ['kpi', 'metrics', 'analytics'],
};
```

**Related Types:** [`WidgetInstance`](#widgetinstance), [`DashboardConfig`](#dashboardconfig)

---

#### `WidgetInstance`

Widget instance in a dashboard.

```typescript
import { WidgetInstance } from '@aegisx/ui';

interface WidgetInstance<TConfig = Record<string, unknown>> {
  instanceId: string;
  widgetId: string;
  position: WidgetPosition;
  config: TConfig;
  dataSource?: WidgetDataSource;
  title?: string;
  visible?: boolean;
}
```

**Usage Example:**

```typescript
import { WidgetInstance } from '@aegisx/ui';
import { KpiWidgetConfig } from './kpi-widget';

const instance: WidgetInstance<KpiWidgetConfig> = {
  instanceId: 'kpi-revenue-001',
  widgetId: 'ax-kpi-widget',
  position: {
    x: 0,
    y: 0,
    cols: 1,
    rows: 1,
  },
  config: {
    title: 'Monthly Revenue',
    value: 125000,
    trend: 'up',
    color: 'success',
  },
  dataSource: {
    endpoint: '/api/kpi/revenue',
    refreshInterval: 60000,
  },
  visible: true,
};
```

---

#### `DashboardConfig`

Dashboard configuration.

```typescript
import { DashboardConfig } from '@aegisx/ui';

interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  columns: number;
  rowHeight: number;
  gap: number;
  widgets: WidgetInstance[];
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}
```

**Usage Example:**

```typescript
import { DashboardConfig, WidgetInstance } from '@aegisx/ui';

const dashboard: DashboardConfig = {
  id: 'dashboard-main',
  name: 'Main Dashboard',
  description: 'Executive dashboard with key metrics',
  columns: 4,
  rowHeight: 160,
  gap: 16,
  widgets: [
    // WidgetInstance array
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin',
};
```

---

#### `DashboardSummary`

Dashboard summary (for listings).

```typescript
import { DashboardSummary } from '@aegisx/ui';

interface DashboardSummary {
  id: string;
  name: string;
  description?: string;
  widgetCount: number;
  updatedAt: string;
  createdBy?: string;
}
```

---

#### Widget Events

##### `WidgetConfigChangeEvent`

Widget configuration change event.

```typescript
import { WidgetConfigChangeEvent } from '@aegisx/ui';

interface WidgetConfigChangeEvent<TConfig = unknown> {
  instanceId: string;
  changes: Partial<TConfig>;
}
```

---

##### `WidgetDataEvent`

Widget data update event.

```typescript
import { WidgetDataEvent } from '@aegisx/ui';

interface WidgetDataEvent<TData = unknown> {
  instanceId: string;
  data: TData;
  timestamp: number;
  source: 'fetch' | 'realtime' | 'cache';
}
```

---

##### `WidgetErrorEvent`

Widget error event.

```typescript
import { WidgetErrorEvent } from '@aegisx/ui';

interface WidgetErrorEvent {
  instanceId: string;
  error: string;
  code?: string;
  retryable?: boolean;
}
```

---

### Widget Components

Individual widget configuration types.

#### KPI Widget Types

Types specific to the KPI widget component (exported from `@aegisx/ui/widgets`).

#### Chart Widget Types

Types specific to the Chart widget component (exported from `@aegisx/ui/widgets`).

#### Table Widget Types

Types specific to the Table widget component (exported from `@aegisx/ui/widgets`).

#### List Widget Types

Types specific to the List widget component (exported from `@aegisx/ui/widgets`).

---

## Service Types

### Theme Service

Theme service types.

All theme service types are documented in the [Theme](#theme) section above.

**Key Exports:**

- [`ColorScheme`](#colorscheme)
- [`ThemeMode`](#thememode)
- [`ThemeOption`](#themeoption)
- [`ThemeConfig`](#themeconfig)
- Theme builder keys ([BackgroundKey](#theme-builder-keys), [TextKey](#theme-builder-keys), etc.)

---

### Toast Service

Toast notification service types.

#### `ToastType`

Toast notification severity.

```typescript
import { ToastType } from '@aegisx/ui';

type ToastType = 'success' | 'error' | 'warning' | 'info';
```

**Related Types:** [`ToastOptions`](#toastoptions), [`ToastProvider`](#toastprovider)

---

#### `ToastProvider`

Toast provider selection.

```typescript
import { ToastProvider } from '@aegisx/ui';

type ToastProvider = 'toastr' | 'snackbar' | 'auto';
```

---

#### `ToastPosition`

Toast position for ngx-toastr.

```typescript
import { ToastPosition } from '@aegisx/ui';

type ToastPosition = 'toast-top-right' | 'toast-top-left' | 'toast-top-center' | 'toast-top-full-width' | 'toast-bottom-right' | 'toast-bottom-left' | 'toast-bottom-center' | 'toast-bottom-full-width';
```

---

#### `SnackbarHorizontalPosition`

Snackbar horizontal position.

```typescript
import { SnackbarHorizontalPosition } from '@aegisx/ui';

type SnackbarHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
```

---

#### `SnackbarVerticalPosition`

Snackbar vertical position.

```typescript
import { SnackbarVerticalPosition } from '@aegisx/ui';

type SnackbarVerticalPosition = 'top' | 'bottom';
```

---

#### `ToastOptions`

Toast configuration options.

```typescript
import { ToastOptions } from '@aegisx/ui';

interface ToastOptions {
  duration?: number;
  provider?: ToastProvider;
  title?: string;
  action?: string;
  onAction?: () => void;
  position?: ToastPosition;
  horizontalPosition?: SnackbarHorizontalPosition;
  verticalPosition?: SnackbarVerticalPosition;
  closeButton?: boolean;
  progressBar?: boolean;
  preventDuplicates?: boolean;
  panelClass?: string | string[];
  enableHtml?: boolean;
  disableTimeOut?: boolean;
  extendedTimeOut?: number;
}
```

**Usage Example:**

```typescript
import { AxToastService, ToastOptions, ToastType } from '@aegisx/ui';

@Component({
  selector: 'app-notification-demo',
})
export class NotificationDemoComponent {
  constructor(private toast: AxToastService) {}

  showSuccess() {
    const options: ToastOptions = {
      duration: 5000,
      position: 'toast-top-right',
      progressBar: true,
      closeButton: true,
    };

    this.toast.success('Operation completed successfully!', options);
  }

  showError() {
    this.toast.error('An error occurred', {
      duration: 0, // Persistent
      action: 'Retry',
      onAction: () => this.retryOperation(),
    });
  }

  showCustom() {
    this.toast.show('info', 'Custom notification', {
      provider: 'snackbar',
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: 'custom-toast',
    });
  }
}
```

**Related Types:** [`ToastConfig`](#toastconfig), [`ToastRef`](#toastref)

---

#### `ToastConfig`

Global toast service configuration.

```typescript
import { ToastConfig } from '@aegisx/ui';

interface ToastConfig {
  defaultProvider: ToastProvider;
  defaultDuration: number;
  defaultPosition: ToastPosition;
  maxOpened: number;
  autoDismiss: boolean;
  newestOnTop: boolean;
  preventDuplicates: boolean;
  iconClasses: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
}
```

---

#### `ToastRef`

Toast reference for programmatic control.

```typescript
import { ToastRef } from '@aegisx/ui';

interface ToastRef {
  dismiss: () => void;
  afterDismissed: () => Promise<void>;
  onAction?: () => Promise<void>;
}
```

**Usage Example:**

```typescript
import { AxToastService, ToastRef } from '@aegisx/ui';

@Component({
  selector: 'app-toast-demo',
})
export class ToastDemoComponent {
  private toastRef?: ToastRef;

  constructor(private toast: AxToastService) {}

  showPersistentToast() {
    this.toastRef = this.toast.info('Processing...', {
      duration: 0,
      closeButton: false,
    });
  }

  async dismissToast() {
    if (this.toastRef) {
      this.toastRef.dismiss();
      await this.toastRef.afterDismissed();
      console.log('Toast dismissed');
    }
  }
}
```

---

## Layout Types

Layout component types are documented in the [Layout](#layout) section above.

**Key Exports:**

- [`AegisxLayoutConfig`](#aegisxlayoutconfig)
- [`AegisxBreakpoints`](#aegisxbreakpoints)

---

## Utility Types

Utility types and helpers exported from the library.

### Constants

#### `DASHBOARD_DEFAULTS`

Default dashboard configuration values.

```typescript
import { DASHBOARD_DEFAULTS } from '@aegisx/ui';

const DASHBOARD_DEFAULTS = {
  columns: 4,
  rowHeight: 160,
  gap: 16,
} as const;
```

**Usage Example:**

```typescript
import { DASHBOARD_DEFAULTS, DashboardConfig } from '@aegisx/ui';

const dashboard: DashboardConfig = {
  id: 'new-dashboard',
  name: 'New Dashboard',
  columns: DASHBOARD_DEFAULTS.columns,
  rowHeight: DASHBOARD_DEFAULTS.rowHeight,
  gap: DASHBOARD_DEFAULTS.gap,
  widgets: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

---

#### `DEFAULT_CONFIG`

Default AegisX configuration.

```typescript
import { DEFAULT_CONFIG } from '@aegisx/ui';

const DEFAULT_CONFIG: AegisxConfig = {
  theme: {
    name: 'default',
    scheme: 'light',
    colors: {
      primary: '#3f51b5',
      accent: '#ff4081',
      warn: '#f44336',
    },
  },
  layout: {
    default: 'classic',
    sidenavWidth: 280,
    showBranding: true,
    collapsible: true,
  },
  features: {
    darkMode: true,
    rtl: false,
    animations: true,
    ripple: true,
    virtualScrolling: false,
  },
  navigation: {
    size: 'default',
    style: 'default',
    position: 'left',
    autoCollapse: false,
  },
  ui: {
    animations: true,
    ripple: true,
    notifications: {
      position: 'top-right',
      duration: 5000,
    },
  },
  language: 'en',
};
```

---

#### `DEFAULT_TOAST_CONFIG`

Default toast configuration.

```typescript
import { DEFAULT_TOAST_CONFIG } from '@aegisx/ui';

const DEFAULT_TOAST_CONFIG: ToastConfig = {
  defaultProvider: 'toastr',
  defaultDuration: 5000,
  defaultPosition: 'toast-top-right',
  maxOpened: 5,
  autoDismiss: true,
  newestOnTop: true,
  preventDuplicates: false,
  iconClasses: {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info',
  },
};
```

---

## Type Import Patterns

### Importing from Main Entry Point

All types are re-exported from the main entry point:

```typescript
// Recommended: Import from main package
import { AegisxConfig, AxNavigationItem, DrawerPosition, DrawerSize, ToastType, ToastOptions, WidgetDefinition, DashboardConfig } from '@aegisx/ui';
```

### Importing from Submodules

You can also import from specific submodules if needed:

```typescript
// Import from types module
import { AegisxConfig } from '@aegisx/ui/types';

// Import from components
import { DrawerPosition, DrawerSize } from '@aegisx/ui/components';

// Import from services
import { ToastType, ToastOptions } from '@aegisx/ui/services';

// Import from widgets
import { WidgetDefinition } from '@aegisx/ui/widgets';
```

---

## Type Safety Best Practices

### 1. Use Strict Type Annotations

Always use explicit type annotations for better IDE support:

```typescript
// ✅ Good: Explicit types
const position: DrawerPosition = 'right';
const size: DrawerSize = 'md';
const variant: BadgeVariant = 'soft';

// ❌ Avoid: Implicit types
const position = 'right'; // Type is just 'string'
```

### 2. Leverage Union Types

Use union types for type-safe configurations:

```typescript
import { AlertVariant } from '@aegisx/ui';

function showAlert(variant: AlertVariant, message: string) {
  // TypeScript ensures variant is one of the valid values
}

// ✅ Valid
showAlert('success', 'Saved!');

// ❌ Compile error
showAlert('invalid', 'Error'); // Type error
```

### 3. Use Interfaces for Complex Configurations

```typescript
import { AxNavigationItem, LauncherApp } from '@aegisx/ui';

// ✅ Good: Type-safe navigation
const navigation: AxNavigationItem[] = [
  {
    id: 'home',
    title: 'Home',
    type: 'item',
    icon: 'home',
    link: '/',
  },
];

// ✅ Good: Type-safe launcher apps
const apps: LauncherApp[] = [
  {
    id: 'crm',
    name: 'CRM',
    icon: 'people',
    color: 'blue',
    status: 'active',
    enabled: true,
  },
];
```

### 4. Generic Type Parameters

Use generic type parameters for widget configurations:

```typescript
import { WidgetDefinition, WidgetInstance } from '@aegisx/ui';

interface MyWidgetConfig {
  title: string;
  value: number;
  color: 'primary' | 'accent';
}

// ✅ Typed widget definition
const definition: WidgetDefinition<MyWidgetConfig> = {
  id: 'my-widget',
  name: 'My Widget',
  // ... other properties
  defaultConfig: {
    title: 'Widget',
    value: 0,
    color: 'primary',
  },
};

// ✅ Typed widget instance
const instance: WidgetInstance<MyWidgetConfig> = {
  instanceId: 'widget-001',
  widgetId: 'my-widget',
  position: { x: 0, y: 0, cols: 1, rows: 1 },
  config: {
    title: 'My Custom Widget',
    value: 100,
    color: 'accent',
  },
};
```

---

## See Also

- [Type Documentation Standards](./type-documentation-standards.md) - JSDoc conventions and standards
- [API Reference](../README.md) - Component API documentation
- [Migration Guide](./type-migration-guide.md) - Upgrading to typed APIs
- [CHANGELOG](../CHANGELOG.md) - Version history and changes

---

**Last Updated:** 2024-12-18

**Library Version:** @aegisx/ui v1.x.x
