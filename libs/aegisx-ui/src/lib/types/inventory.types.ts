/**
 * AegisX Inventory Management - Shared Type Definitions
 * ================================================================
 *
 * This file contains all shared types and interfaces used across
 * the inventory management components. It serves as the single source
 * of truth for inventory-related domain models.
 *
 * Organization:
 * - Configuration Types
 * - Domain Models
 * - State & Events
 * - API Contracts
 * - Strategy Patterns
 */

// =============================================================================
// PRIORITY 1: CORE TYPES
// =============================================================================

/**
 * Unit configuration interface for quantity measurements
 * Used by AxQuantityInputComponent for unit conversion
 */
export interface UnitConfig {
  /** Unit identifier (e.g., 'piece', 'kg', 'liter') */
  id: string;

  /** Display name of the unit */
  label: string;

  /** Conversion factor to base unit */
  conversionFactor: number;

  /** Whether this is the base unit */
  isBase: boolean;

  /** Short notation for the unit (e.g., 'pcs', 'kg') */
  shortCode?: string;
}

/**
 * Batch information interface
 * Used by AxBatchSelectorComponent to represent product batches
 */
export interface BatchInfo {
  /** Unique batch identifier */
  id: string;

  /** Batch number/label */
  label: string;

  /** Batch creation date */
  createdDate: Date;

  /** Batch expiry date */
  expiryDate?: Date;

  /** Quantity available in batch */
  quantity: number;

  /** Manufacturing batch number */
  manufacturingBatch?: string;

  /** Additional batch metadata */
  metadata?: Record<string, any>;
}

/**
 * Inventory strategy type definition
 * Defines how inventory should be managed for a product
 */
export type InventoryStrategy =
  | 'fifo' // First In First Out
  | 'lifo' // Last In First Out
  | 'weighted-average' // Weighted Average
  | 'standard-cost'; // Standard Cost

// =============================================================================
// PRIORITY 2: EXTENDED TYPES
// =============================================================================

/**
 * Movement type enum
 * Categorizes different types of inventory movements
 */
export enum MovementType {
  InboundReceipt = 'inbound-receipt',
  OutboundDispatch = 'outbound-dispatch',
  InternalTransfer = 'internal-transfer',
  Adjustment = 'adjustment',
  Return = 'return',
  Damage = 'damage',
  Expiry = 'expiry',
}

/**
 * Stock movement record interface
 * Used by AxStockMovementTimelineComponent
 */
export interface MovementRecord {
  /** Unique movement identifier */
  id: string;

  /** Type of movement */
  type: MovementType;

  /** Quantity moved */
  quantity: number;

  /** Movement timestamp */
  timestamp: Date;

  /** Reference document number */
  referenceNo?: string;

  /** Movement description */
  description?: string;

  /** User who performed the movement */
  performedBy?: string;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Product variant interface
 * Used by AxVariantSelectorComponent
 */
export interface ProductVariant {
  /** Unique variant identifier */
  id: string;

  /** Variant name */
  name: string;

  /** Variant SKU */
  sku?: string;

  /** Variant attributes */
  attributes?: Record<string, string>;

  /** Variant price */
  price?: number;

  /** Stock quantity for variant */
  stock?: number;

  /** Is variant available */
  isAvailable?: boolean;
}

/**
 * Stock alert interface
 * Used by AxStockAlertPanelComponent
 */
export interface StockAlert {
  /** Unique alert identifier */
  id: string;

  /** Alert title */
  title: string;

  /** Alert message */
  message: string;

  /** Alert severity level */
  severity: 'critical' | 'warning' | 'info';

  /** Related product ID */
  productId?: string;

  /** Alert creation timestamp */
  createdAt: Date;

  /** Whether alert has been acknowledged */
  acknowledged?: boolean;
}

/**
 * Location type enum
 * Categorizes different types of storage locations
 */
export enum LocationType {
  Warehouse = 'warehouse',
  Section = 'section',
  Shelf = 'shelf',
  Bin = 'bin',
}

/**
 * Location node interface
 * Used by AxLocationPickerComponent for hierarchical location selection
 */
export interface LocationNode {
  /** Unique location identifier */
  id: string;

  /** Location name */
  name: string;

  /** Location type */
  type: LocationType;

  /** Parent location ID */
  parentId?: string;

  /** Child locations */
  children?: LocationNode[];

  /** Location capacity */
  capacity?: number;

  /** Current utilization */
  utilization?: number;

  /** Whether location is active */
  isActive?: boolean;
}

/**
 * Transfer item for stock transfers
 * Used by AxTransferWizardComponent
 */
export interface TransferItem {
  /** Product identifier */
  productId: string;

  /** Quantity to transfer */
  quantity: number;

  /** Associated batch ID */
  batchId?: string;
}

/**
 * Stock transfer request
 * Used by AxTransferWizardComponent
 */
export interface StockTransfer {
  /** Source location ID */
  fromLocationId: string;

  /** Destination location ID */
  toLocationId: string;

  /** Items to transfer */
  items: TransferItem[];

  /** Additional notes */
  notes?: string;

  /** Reference number */
  referenceNo?: string;
}

// =============================================================================
// STATE MANAGEMENT TYPES
// =============================================================================

/**
 * Stock level state
 */
export interface StockLevelState {
  currentStock: number;
  reorderLevel: number;
  maxStock: number;
  status: 'critical' | 'low' | 'optimal' | 'overstock';
  percentageFilled: number;
}

/**
 * Quantity input state
 */
export interface QuantityInputState {
  value: number;
  unit: string;
  isDisabled: boolean;
  errors: string[];
}

/**
 * Batch selection state
 */
export interface BatchSelectionState {
  selectedBatches: BatchInfo[];
  totalQuantity: number;
  expandedBatches: string[];
  multiSelectEnabled: boolean;
}

/**
 * Timeline state for movement history
 */
export interface TimelineState {
  movements: MovementRecord[];
  displayCount: number;
  totalCount: number;
  isLoading: boolean;
}

/**
 * Expiry badge state
 */
export interface ExpiryBadgeState {
  status: 'valid' | 'warning' | 'expiring-soon' | 'expired';
  daysRemaining: number;
  expiryDate: Date | null;
  isExpired: boolean;
}

/**
 * Variant selection state
 */
export interface VariantSelectionState {
  selectedVariant: ProductVariant | null;
  availableVariants: ProductVariant[];
  filterApplied?: string;
}

/**
 * Alert panel state
 */
export interface AlertPanelState {
  alerts: StockAlert[];
  activeAlerts: number;
  criticalAlerts: number;
}

/**
 * Location selection state
 */
export interface LocationSelectionState {
  selectedLocation: LocationNode | null;
  expandedLocations: string[];
  availableLocations: LocationNode[];
}

/**
 * Transfer wizard state
 */
export interface TransferWizardState {
  currentStep: number;
  fromLocation: LocationNode | null;
  toLocation: LocationNode | null;
  selectedItems: TransferItem[];
  isProcessing: boolean;
}

// =============================================================================
// EVENT TYPES
// =============================================================================

/**
 * Quantity change event
 */
export interface QuantityChangeEvent {
  value: number;
  previousValue: number;
  delta: number;
  timestamp: Date;
}

/**
 * Batch selection change event
 */
export interface BatchSelectionChangeEvent {
  previousSelection: BatchInfo[];
  currentSelection: BatchInfo[];
  addedBatches: BatchInfo[];
  removedBatches: BatchInfo[];
  timestamp: Date;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Generic paginated result type
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Inventory configuration
 */
export interface InventoryConfig {
  /** Available units for measurement */
  units: UnitConfig[];

  /** Default inventory strategy */
  defaultStrategy: InventoryStrategy;

  /** Low stock warning threshold */
  lowStockThreshold: number;

  /** Critical stock threshold */
  criticalStockThreshold: number;

  /** Enable batch tracking */
  enableBatchTracking: boolean;

  /** Enable expiry tracking */
  enableExpiryTracking: boolean;

  /** Enable multi-location support */
  enableMultiLocation: boolean;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
