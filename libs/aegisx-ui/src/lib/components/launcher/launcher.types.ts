import { Observable } from 'rxjs';

// ============================================
// COLOR & STATUS TYPES
// ============================================

/** Pastel color theme for app cards */
export type LauncherColor =
  | 'pink' // #fdf2f8 / pink-50
  | 'peach' // #fff7ed / orange-50
  | 'mint' // #f0fdf4 / green-50
  | 'blue' // #eff6ff / blue-50
  | 'yellow' // #fefce8 / yellow-50
  | 'lavender' // #faf5ff / purple-50
  | 'cyan' // #ecfeff / cyan-50
  | 'rose' // #fff1f2 / rose-50
  | 'neutral' // #fafafa / zinc-50
  | 'white'; // White with border shadow (supports dark mode)

/** App visibility/operational status */
export type LauncherAppStatus =
  | 'active' // App is fully operational
  | 'beta' // App is in beta testing
  | 'new' // Newly released app
  | 'maintenance' // App is under maintenance (visible but not accessible)
  | 'coming_soon' // App is coming soon (visible but not accessible)
  | 'disabled' // App is disabled (hidden from users without admin role)
  | 'hidden'; // App is completely hidden

/** View mode options */
export type LauncherViewMode = 'grid' | 'list' | 'compact' | 'bento';

/** Card size for bento grid layout */
export type LauncherCardSize = 'sm' | 'md' | 'lg' | 'xl';

/** Group by options */
export type LauncherGroupBy = 'category' | 'status' | 'none';

// ============================================
// CATEGORY
// ============================================

/** App Category for grouping */
export interface LauncherCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  order?: number;
  /** Category color (optional) */
  color?: string;
}

// ============================================
// RBAC / PERMISSIONS
// ============================================

/** Permission configuration for RBAC */
export interface LauncherPermission {
  /**
   * Required roles to VIEW this app (OR logic - user needs at least one)
   * Example: ['admin', 'manager'] - user with 'admin' OR 'manager' can see
   */
  viewRoles?: string[];

  /**
   * Required roles to ACCESS this app (OR logic)
   * If not set, same as viewRoles
   */
  accessRoles?: string[];

  /**
   * Required permissions to VIEW this app (OR logic)
   * Example: ['apps:view', 'apps:manage']
   */
  viewPermissions?: string[];

  /**
   * Required permissions to ACCESS this app (OR logic)
   */
  accessPermissions?: string[];

  /**
   * Custom permission check function for viewing
   * Return true if user can see the app
   */
  canView?: () => boolean | Observable<boolean>;

  /**
   * Custom permission check function for accessing
   * Return true if user can access/click the app
   */
  canAccess?: () => boolean | Observable<boolean>;
}

// ============================================
// MENU ACTIONS
// ============================================

/** Menu action for app card */
export interface LauncherMenuAction {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  /** Divider before this action */
  divider?: boolean;
  /** Required roles to see this action */
  roles?: string[];
  /** Required permissions to see this action */
  permissions?: string[];
}

// ============================================
// APP ITEM
// ============================================

/** Main app item interface */
export interface LauncherApp {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Short description */
  description?: string;

  /** Material icon name */
  icon: string;

  /** Internal route path (e.g., '/dashboard') */
  route?: string;

  /** External URL (opens in new tab) */
  externalUrl?: string;

  /** Card background color */
  color: LauncherColor;

  // ============================================
  // CATEGORY & ORGANIZATION
  // ============================================

  /** Category ID for grouping */
  categoryId?: string;

  /** Tags for filtering/searching */
  tags?: string[];

  /** Display order within category (lower = first) */
  order?: number;

  // ============================================
  // STATUS & STATE
  // ============================================

  /** App operational status */
  status: LauncherAppStatus;

  /** Whether app is enabled (admin can toggle) */
  enabled: boolean;

  /** Notification badge count (0 or undefined = hidden) */
  notificationCount?: number;

  /** Last edited info (e.g., "Last edit by Mark at 7:40 PM") */
  lastEdited?: string;

  /** Version info */
  version?: string;

  // ============================================
  // RBAC
  // ============================================

  /** Permission configuration */
  permission?: LauncherPermission;

  // ============================================
  // MENU & ACTIONS
  // ============================================

  /** Custom menu actions */
  menuActions?: LauncherMenuAction[];

  /** Whether to show default menu actions */
  showDefaultMenu?: boolean;

  // ============================================
  // BENTO GRID
  // ============================================

  /** Card size for bento grid layout (featured/frequently used apps) */
  size?: LauncherCardSize;

  /** Whether this is a featured/frequently used app */
  featured?: boolean;

  /** Usage count for auto-sizing in bento grid */
  usageCount?: number;
}

// ============================================
// COMPONENT CONFIGURATION
// ============================================

/** Default menu actions that can be enabled/disabled */
export interface LauncherDefaultMenuActions {
  open?: boolean;
  openNewTab?: boolean;
  copyLink?: boolean;
  addToFavorites?: boolean;
  settings?: boolean;
}

/** Launcher component configuration */
export interface LauncherConfig {
  /** Show search input */
  showSearch?: boolean;

  /** Show category filter tabs */
  showCategoryTabs?: boolean;

  /** Show status filter dropdown */
  showStatusFilter?: boolean;

  /** Show view mode toggle (grid/list) */
  showViewToggle?: boolean;

  /** Default view mode */
  defaultViewMode?: LauncherViewMode;

  /** Default group by */
  defaultGroupBy?: LauncherGroupBy;

  /** Empty state message */
  emptyMessage?: string;

  /** No results message */
  noResultsMessage?: string;

  /** Enable favorites (stored in localStorage) */
  enableFavorites?: boolean;

  /** Enable recent apps tracking */
  enableRecent?: boolean;

  /** Max recent apps to track */
  maxRecentApps?: number;

  /** LocalStorage key prefix */
  storageKeyPrefix?: string;

  /** Default menu actions to show */
  defaultMenuActions?: LauncherDefaultMenuActions;

  /** Card min width for grid */
  cardMinWidth?: number;

  /** Card max width for grid */
  cardMaxWidth?: number;

  /** Gap between cards */
  cardGap?: number;
}

// ============================================
// USER CONTEXT (for RBAC)
// ============================================

/** User context for permission checking */
export interface LauncherUserContext {
  /** User's roles (e.g., ['admin', 'user']) */
  roles: string[];

  /** User's permissions (e.g., ['apps:view', 'apps:manage']) */
  permissions: string[];

  /** Whether user is admin (can see disabled apps) */
  isAdmin?: boolean;
}

// ============================================
// EVENTS
// ============================================

/** App click event */
export interface LauncherAppClickEvent {
  app: LauncherApp;
  /** Whether to open in new tab */
  newTab?: boolean;
}

/** Menu action event */
export interface LauncherMenuActionEvent {
  app: LauncherApp;
  action: LauncherMenuAction;
}

/** App status change event (for admin) */
export interface LauncherStatusChangeEvent {
  app: LauncherApp;
  previousStatus: LauncherAppStatus;
  newStatus: LauncherAppStatus;
}

/** App enabled change event (for admin) */
export interface LauncherEnabledChangeEvent {
  app: LauncherApp;
  enabled: boolean;
}

// ============================================
// GROUPED APPS (for display)
// ============================================

/** Grouped apps by category */
export interface LauncherGroupedApps {
  category: LauncherCategory | null;
  apps: LauncherApp[];
}
