/**
 * Enhanced AegisX UI Configuration Interface
 * Supports theme customization, layout preferences, and feature flags
 */
export interface AegisxConfig {
  // Theme configuration
  theme?: AegisxThemeConfig;

  // Layout configuration
  layout?: AegisxLayoutPreferences;

  // Feature flags
  features?: AegisxFeatureConfig;

  // Navigation preferences
  navigation?: AegisxNavigationConfig;

  // UI behavior preferences
  ui?: AegisxUIConfig;

  // Language and localization
  language?: string;

  // Custom properties for extensibility
  custom?: Record<string, unknown>;
}

/**
 * Theme configuration options
 */
export interface AegisxThemeConfig {
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

/**
 * General layout preferences (different from detailed layout component config)
 */
export interface AegisxLayoutPreferences {
  default?: AegisxLayoutType;
  sidenavWidth?: number;
  showBranding?: boolean;
  collapsible?: boolean;
}

/**
 * Feature flags for optional functionality
 */
export interface AegisxFeatureConfig {
  darkMode?: boolean;
  rtl?: boolean;
  animations?: boolean;
  ripple?: boolean;
  virtualScrolling?: boolean;
}

/**
 * Navigation behavior configuration
 */
export interface AegisxNavigationConfig {
  size?: 'default' | 'compact' | 'comfortable';
  style?: 'default' | 'flat';
  position?: 'left' | 'right' | 'top';
  autoCollapse?: boolean;
}

/**
 * UI behavior configuration
 */
export interface AegisxUIConfig {
  animations?: boolean;
  ripple?: boolean;
  notifications?: {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    duration?: number;
  };
}

export type AegisxLayoutType = 'empty' | 'classic' | 'compact' | 'enterprise';

/**
 * Default AegisX configuration
 */
export const DEFAULT_CONFIG: AegisxConfig = {
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
