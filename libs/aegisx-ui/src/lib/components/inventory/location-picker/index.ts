/**
 * Location Picker Component Public API
 * ================================================================
 *
 * Exports all public components, types, and utilities for the
 * Location Picker module.
 */

// Component
export { AxLocationPickerComponent } from './ax-location-picker.component';

// Types and Interfaces
export type {
  LocationNode,
  FlatLocationNode,
  LocationSelection,
  LocationFilter,
  LocationSearchMatch,
  LocationSelectionState,
  RecentLocation,
  FavoriteLocation,
  LocationPickerConfig,
  LocationSelectEvent,
  FavoriteToggleEvent,
  NodeExpandEvent,
  LocationTreeStats,
  BreadcrumbItem,
} from './ax-location-picker.component.types';

// Enums
export {
  LocationType,
  LocationStatus,
  SelectionMode,
} from './ax-location-picker.component.types';

// Constants
export { DEFAULT_LOCATION_PICKER_CONFIG } from './ax-location-picker.component.types';
