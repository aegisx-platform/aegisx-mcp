/**
 * Location Picker Component Type Definitions
 * ================================================================
 *
 * Comprehensive types for hierarchical location/warehouse picking
 * with multi-level navigation, filtering, and capacity indicators.
 */

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Location type hierarchy
 * Warehouse → Zone → Aisle → Shelf → Bin
 */
export enum LocationType {
  Warehouse = 'warehouse',
  Zone = 'zone',
  Aisle = 'aisle',
  Shelf = 'shelf',
  Bin = 'bin',
}

/**
 * Location status
 */
export enum LocationStatus {
  Active = 'active',
  Inactive = 'inactive',
  Maintenance = 'maintenance',
  Full = 'full',
}

/**
 * Selection mode
 */
export enum SelectionMode {
  Single = 'single',
  Multiple = 'multiple',
}

// =============================================================================
// CORE INTERFACES
// =============================================================================

/**
 * Location node in hierarchical structure
 */
export interface LocationNode {
  /** Unique location identifier */
  id: string;

  /** Location code (e.g., WH-01, ZONE-A) */
  code: string;

  /** Location name */
  name: string;

  /** Location type in hierarchy */
  type: LocationType;

  /** Parent location ID */
  parentId?: string;

  /** Child locations */
  children?: LocationNode[];

  /** Current stock count */
  stockCount?: number;

  /** Maximum capacity */
  capacity?: number;

  /** Current utilization percentage */
  utilization?: number;

  /** Location status */
  status?: LocationStatus;

  /** Whether location is disabled for selection */
  disabled?: boolean;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Flattened location node for tree rendering
 */
export interface FlatLocationNode {
  /** Unique location identifier */
  id: string;

  /** Location code */
  code: string;

  /** Location name */
  name: string;

  /** Location type */
  type: LocationType;

  /** Tree depth level (0 = root) */
  level: number;

  /** Whether node can be expanded */
  expandable: boolean;

  /** Whether node is expanded */
  expanded?: boolean;

  /** Stock count */
  stockCount?: number;

  /** Capacity */
  capacity?: number;

  /** Utilization percentage */
  utilization?: number;

  /** Status */
  status?: LocationStatus;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * Location selection result
 */
export interface LocationSelection {
  /** Selected location node */
  location: LocationNode;

  /** Full path from root to selected (array of nodes) */
  path: LocationNode[];

  /** Path as formatted string (e.g., "WH-01 > Zone-A > Shelf-12") */
  pathString: string;
}

// =============================================================================
// FILTER & SEARCH
// =============================================================================

/**
 * Location filter criteria
 */
export interface LocationFilter {
  /** Filter by location types */
  types?: LocationType[];

  /** Filter by status */
  statuses?: LocationStatus[];

  /** Minimum available capacity */
  minCapacity?: number;

  /** Search term (code or name) */
  searchTerm?: string;
}

/**
 * Search match result
 */
export interface LocationSearchMatch {
  /** Matched location */
  location: LocationNode;

  /** Match score (0-1) */
  score: number;

  /** Matched field */
  matchedField: 'code' | 'name';
}

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

/**
 * Location selection state
 */
export interface LocationSelectionState {
  /** Currently selected location(s) */
  selectedLocations: LocationNode[];

  /** Expanded node IDs */
  expandedNodes: Set<string>;

  /** Search term */
  searchTerm: string;

  /** Active filter */
  filter: LocationFilter | null;

  /** Selection mode */
  mode: SelectionMode;
}

/**
 * Recent location entry
 */
export interface RecentLocation {
  /** Location reference */
  location: LocationNode;

  /** Last accessed timestamp */
  lastAccessed: Date;

  /** Access count */
  accessCount: number;
}

/**
 * Favorite location entry
 */
export interface FavoriteLocation {
  /** Location reference */
  location: LocationNode;

  /** User-defined label */
  label?: string;

  /** Added timestamp */
  addedAt: Date;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Location picker configuration
 */
export interface LocationPickerConfig {
  /** Enable search functionality */
  searchable: boolean;

  /** Show breadcrumb navigation */
  showBreadcrumbs: boolean;

  /** Show stock capacity indicators */
  showCapacity: boolean;

  /** Show recent locations */
  showRecent: boolean;

  /** Show favorite locations */
  showFavorites: boolean;

  /** Maximum recent locations to track */
  maxRecentLocations: number;

  /** Allowed location types for selection */
  allowedTypes?: LocationType[];

  /** Selection mode */
  selectionMode: SelectionMode;

  /** Auto-expand to current location */
  autoExpand: boolean;

  /** Enable virtual scrolling for large trees */
  virtualScroll: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_LOCATION_PICKER_CONFIG: LocationPickerConfig = {
  searchable: true,
  showBreadcrumbs: true,
  showCapacity: false,
  showRecent: true,
  showFavorites: true,
  maxRecentLocations: 5,
  selectionMode: SelectionMode.Single,
  autoExpand: true,
  virtualScroll: false,
};

// =============================================================================
// EVENTS
// =============================================================================

/**
 * Location select event
 */
export interface LocationSelectEvent {
  /** Selected location */
  location: LocationNode;

  /** Full path */
  path: LocationNode[];

  /** Selection timestamp */
  timestamp: Date;
}

/**
 * Favorite toggle event
 */
export interface FavoriteToggleEvent {
  /** Location ID */
  locationId: string;

  /** Is now favorited */
  isFavorite: boolean;

  /** Timestamp */
  timestamp: Date;
}

/**
 * Node expand/collapse event
 */
export interface NodeExpandEvent {
  /** Node ID */
  nodeId: string;

  /** Is now expanded */
  isExpanded: boolean;

  /** Timestamp */
  timestamp: Date;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Location tree statistics
 */
export interface LocationTreeStats {
  /** Total nodes */
  totalNodes: number;

  /** Total warehouses */
  totalWarehouses: number;

  /** Total zones */
  totalZones: number;

  /** Total aisles */
  totalAisles: number;

  /** Total shelves */
  totalShelves: number;

  /** Total bins */
  totalBins: number;

  /** Active locations */
  activeLocations: number;

  /** Full capacity locations */
  fullLocations: number;

  /** Average utilization */
  averageUtilization: number;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  /** Location ID */
  id: string;

  /** Location code */
  code: string;

  /** Location name */
  name: string;

  /** Location type */
  type: LocationType;

  /** Is last in breadcrumb */
  isLast: boolean;
}
