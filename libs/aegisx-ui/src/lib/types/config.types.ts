export interface AegisxConfig {
  // Theme configuration
  theme: string;
  scheme: 'light' | 'dark' | 'auto';
  
  // Layout configuration
  layout: AegisxLayoutType;
  
  // Navigation
  navigation: {
    size: 'default' | 'compact' | 'comfortable';
    style: 'default' | 'flat';
    position: 'left' | 'right' | 'top';
  };
  
  // UI preferences
  ui: {
    animations: boolean;
    ripple: boolean;
    notifications: {
      position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
      duration: number;
    };
  };
  
  // Language
  language: string;
  
  // Custom properties
  custom?: Record<string, any>;
}

export type AegisxLayoutType = 'empty' | 'classic' | 'compact' | 'enterprise';

export const DEFAULT_CONFIG: AegisxConfig = {
  theme: 'default',
  scheme: 'light',
  layout: 'classic',
  navigation: {
    size: 'default',
    style: 'default',
    position: 'left'
  },
  ui: {
    animations: true,
    ripple: true,
    notifications: {
      position: 'top-right',
      duration: 5000
    }
  },
  language: 'en'
};