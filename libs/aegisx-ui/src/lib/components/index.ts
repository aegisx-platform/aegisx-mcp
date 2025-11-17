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
export { AegisxCardComponent as AxCardComponent } from './card/card.component';

// State Components (restored for CRUD Generator compatibility)
export * from './empty-state';
export * from './error-state';

// Additional Components
// Note: AxLoadingBarComponent is now exported from feedback module
export * from './ax-navigation.component';

// Dialog Components
export * from './dialogs';

// Theme & Layout Switchers
export * from './ax-theme-switcher.component';
export * from './ax-layout-switcher.component';
