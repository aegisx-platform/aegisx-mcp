/**
 * Multi-App Configuration Types
 *
 * Provides type definitions for multi-app architecture within the enterprise platform.
 * Supports dynamic navigation, themes, and sub-app configuration.
 *
 * @example
 * ```typescript
 * const inventoryApp: AppConfig = {
 *   id: 'inventory',
 *   name: 'Inventory Management',
 *   theme: 'inventory',
 *   baseRoute: '/inventory',
 *   subApps: [
 *     {
 *       id: 'warehouse',
 *       name: 'Warehouse',
 *       icon: 'warehouse',
 *       route: '/inventory/warehouse',
 *       navigation: [...],
 *     },
 *   ],
 * };
 * ```
 */

import { AxNavigationItem } from '@aegisx/ui';
import { EnterprisePresetTheme, EnterpriseAppTheme } from '@aegisx/ui';

/**
 * Header action button configuration
 */
export interface HeaderAction {
  /** Unique identifier */
  id: string;

  /** Material icon name */
  icon: string;

  /** Tooltip text */
  tooltip: string;

  /** Optional badge count */
  badge?: number;

  /** Click handler function name */
  action: string;

  /** Required roles to show this action */
  roles?: string[];

  /** Required permissions to show this action */
  permissions?: string[];
}

/**
 * Sub-app configuration within a main app
 */
export interface SubAppConfig {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Material icon name */
  icon: string;

  /** Route path (absolute from root) */
  route: string;

  /** Sidebar navigation items for this sub-app */
  navigation: AxNavigationItem[];

  /** Optional sub-navigation tabs */
  subNavigation?: AxNavigationItem[];

  /** Header action buttons */
  headerActions?: HeaderAction[];

  /** Required roles to access this sub-app */
  roles?: string[];

  /** Required permissions to access this sub-app */
  permissions?: string[];

  /** Sub-app description */
  description?: string;

  /** Whether this is the default sub-app */
  isDefault?: boolean;
}

/**
 * Main app configuration
 */
export interface AppConfig {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Theme preset or custom theme */
  theme: EnterprisePresetTheme | EnterpriseAppTheme;

  /** Optional logo URL */
  logo?: string;

  /** Base route for the app */
  baseRoute: string;

  /** Default route to redirect to */
  defaultRoute: string;

  /** Sub-apps within this main app */
  subApps: SubAppConfig[];

  /** Global header actions (shown in all sub-apps) */
  headerActions?: HeaderAction[];

  /** Show footer */
  showFooter?: boolean;

  /** Footer content */
  footerContent?: string;

  /** Required roles to access this app */
  roles?: string[];

  /** Required permissions to access this app */
  permissions?: string[];

  /** App description */
  description?: string;
}

/**
 * Active app context
 */
export interface ActiveAppContext {
  /** Current app config */
  app: AppConfig;

  /** Current sub-app config */
  subApp: SubAppConfig | null;

  /** Current navigation items */
  navigation: AxNavigationItem[];

  /** Current sub-navigation items */
  subNavigation: AxNavigationItem[];

  /** Current header actions */
  headerActions: HeaderAction[];

  /** Resolved theme */
  theme: EnterprisePresetTheme | EnterpriseAppTheme;
}

/**
 * App registry entry for launcher
 */
export interface AppRegistryEntry {
  /** App config */
  config: AppConfig;

  /** Is app active/enabled */
  enabled: boolean;

  /** Sort order for launcher */
  order: number;
}
