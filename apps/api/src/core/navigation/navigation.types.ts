/**
 * Navigation API Types
 * Based on OpenAPI specification: navigation-api.yaml
 */

export type NavigationType = 'default' | 'compact' | 'horizontal' | 'mobile' | 'all';
export type NavigationItemType = 'item' | 'group' | 'collapsible' | 'divider' | 'spacer';
export type NavigationTarget = '_self' | '_blank' | '_parent' | '_top';
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

export interface NavigationBadge {
  title?: string;
  classes?: string;
  variant?: BadgeVariant;
}

export interface NavigationItem {
  id: string;
  title: string;
  type: NavigationItemType;
  icon?: string;
  link?: string;
  target?: NavigationTarget;
  disabled?: boolean;
  hidden?: boolean;
  badge?: NavigationBadge;
  permissions?: string[];
  children?: NavigationItem[];
  meta?: Record<string, unknown>;
}

export interface NavigationResponse {
  default?: NavigationItem[];
  compact?: NavigationItem[];
  horizontal?: NavigationItem[];
  mobile?: NavigationItem[];
}

// Database entity types
export interface NavigationItemEntity {
  id: string;
  parent_id?: string;
  key: string;
  title: string;
  type: NavigationItemType;
  icon?: string;
  link?: string;
  target: NavigationTarget;
  sort_order: number;
  disabled: boolean;
  hidden: boolean;
  exact_match: boolean;
  badge_title?: string;
  badge_classes?: string;
  badge_variant?: BadgeVariant;
  show_in_default: boolean;
  show_in_compact: boolean;
  show_in_horizontal: boolean;
  show_in_mobile: boolean;
  meta?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface NavigationPermissionEntity {
  navigation_item_id: string;
  permission_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserNavigationPreferenceEntity {
  id: string;
  user_id: string;
  navigation_item_id: string;
  hidden?: boolean;
  custom_sort_order?: number;
  pinned: boolean;
  created_at: Date;
  updated_at: Date;
}

// Service input types
export interface GetNavigationOptions {
  type?: NavigationType;
  includeDisabled?: boolean;
  userId?: string;
  userPermissions?: string[];
}

// Internal types for building navigation tree
export interface NavigationItemWithChildren extends NavigationItemEntity {
  children?: NavigationItemWithChildren[];
  permissions?: string[];
  userPreference?: UserNavigationPreferenceEntity;
}

// Permission types
export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

// User context for permission checking
export interface UserContext {
  id: string;
  role: string;
  permissions: string[];
}

// Cache key types
export type NavigationCacheKey = 
  | `navigation:${NavigationType}:${boolean}` // Global navigation with includeDisabled flag
  | `navigation:user:${string}:${NavigationType}`; // User-specific navigation

// API request/response types matching OpenAPI spec
export interface GetNavigationQuery {
  type?: NavigationType;
  includeDisabled?: string;
}

export interface GetUserNavigationQuery {
  type?: NavigationType;
}