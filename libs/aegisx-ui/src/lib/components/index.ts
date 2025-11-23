// =============================================================================
// NEW COMPONENT MODULES (v1.0.0 Redesign - Ax Prefix Standard)
// =============================================================================

// Forms Module
export * from './forms';

// Data Display Module
export * from './data-display';

// Feedback Module
export * from './feedback';

// Navigation Module
export * from './navigation';

// =============================================================================
// EXISTING COMPONENTS (Legacy - kept for backward compatibility)
// =============================================================================

// Individual Components (standardized names with actual component classes)
// NOTE: AxCardComponent is now exported from ./data-display module

// State Components (restored for CRUD Generator compatibility)
export * from './empty-state';
export * from './error-state';

// Additional Components
// Note: AxLoadingBarComponent is now exported from feedback module
export * from './ax-navigation.component';

// Dialog Components
export * from './dialogs';

// Theme & Layout Switchers
export * from './theme-switcher'; // NEW: Enhanced theme switcher with dropdown mode
export * from './ax-layout-switcher.component';
