/**
 * Batch Selector Component Type Definitions
 * Priority 1 Implementation - Complete spec-compliant types
 */

/**
 * Batch information interface (extended from shared types)
 */
export interface BatchInfo {
  /** Unique batch number (primary identifier) */
  batchNumber: string;

  /** Optional lot number */
  lotNumber?: string;

  /** Batch expiry date */
  expiryDate: Date;

  /** Manufacturing/production date */
  manufacturingDate?: Date;

  /** Available quantity in this batch */
  availableQuantity: number;

  /** Unit of measurement */
  unit: string;

  /** Storage location */
  location?: string;

  /** Batch status */
  status: 'available' | 'reserved' | 'expired' | 'quarantine';

  /** Additional batch metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Selected batch with quantity
 */
export interface SelectedBatch {
  /** The batch information */
  batch: BatchInfo;

  /** Quantity selected from this batch */
  quantity: number;
}

/**
 * Batch selection result emitted by component
 */
export interface BatchSelection {
  /** Array of selected batches with quantities */
  batches: SelectedBatch[];

  /** Total quantity across all selected batches */
  totalQuantity: number;

  /** Strategy used for batch ordering */
  strategy: 'fifo' | 'fefo' | 'lifo';
}

/**
 * Expiry status categories
 */
export type ExpiryStatus = 'safe' | 'warning' | 'critical' | 'expired';

/**
 * API response for batch fetch
 */
export interface BatchApiResponse {
  /** Array of batches */
  batches: BatchInfo[];

  /** Recommended strategy for this product */
  strategy?: 'fifo' | 'fefo' | 'lifo';
}
