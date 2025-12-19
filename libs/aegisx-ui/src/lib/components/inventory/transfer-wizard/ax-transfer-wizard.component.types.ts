/**
 * Transfer Wizard Component Type Definitions
 * ============================================
 *
 * Type definitions for the multi-step inventory transfer wizard component.
 * Supports complete transfer workflow from source selection to review and submit.
 */

/**
 * Transfer item interface with product details and quantity
 */
export interface TransferItem {
  /** Unique product identifier */
  productId: string;

  /** Product name for display */
  productName: string;

  /** Product SKU */
  sku?: string;

  /** Quantity to transfer */
  quantity: number;

  /** Available quantity at source location */
  availableQuantity: number;

  /** Unit of measurement (e.g., 'pieces', 'boxes') */
  unit?: string;

  /** Batch number if batch tracking enabled */
  batchNumber?: string;

  /** Optional batch ID */
  batchId?: string;

  /** Optional notes for this item */
  notes?: string;
}

/**
 * Product search result for autocomplete
 */
export interface ProductSearchResult {
  /** Product ID */
  id: string;

  /** Product name */
  name: string;

  /** Product SKU */
  sku: string;

  /** Available quantity at source location */
  availableQuantity: number;

  /** Unit of measurement */
  unit: string;

  /** Product image URL */
  imageUrl?: string;
}

/**
 * Location information for source/destination
 */
export interface TransferLocation {
  /** Location ID */
  id: string;

  /** Location name/code */
  name: string;

  /** Location type (warehouse, zone, shelf, etc.) */
  type?: string;

  /** Full path string (e.g., "Warehouse A > Zone 1 > Shelf 5") */
  pathString?: string;
}

/**
 * Stock transfer request payload
 */
export interface StockTransfer {
  /** Source location ID */
  sourceLocationId: string;

  /** Destination location ID */
  destinationLocationId: string;

  /** Items to transfer */
  items: TransferItem[];

  /** Optional transfer notes */
  notes?: string;

  /** Transfer reference number (optional) */
  referenceNo?: string;

  /** Whether approval is required */
  requiresApproval?: boolean;

  /** Scheduled transfer date (optional) */
  scheduledDate?: Date;
}

/**
 * Transfer wizard step configuration
 */
export interface WizardStep {
  /** Step unique identifier */
  id: string;

  /** Step title/label */
  title: string;

  /** Step description (optional) */
  description?: string;

  /** Whether step is optional */
  optional?: boolean;

  /** Custom component for step (advanced use) */
  component?: any;
}

/**
 * Transfer wizard state for tracking progress
 */
export interface TransferWizardState {
  /** Current active step (0-indexed) */
  currentStep: number;

  /** Total number of steps */
  totalSteps: number;

  /** Source location selection */
  sourceLocation: TransferLocation | null;

  /** Destination location selection */
  destinationLocation: TransferLocation | null;

  /** Selected items to transfer */
  selectedItems: TransferItem[];

  /** Transfer notes */
  notes: string;

  /** Whether wizard is processing submission */
  isProcessing: boolean;

  /** Whether wizard is complete */
  isComplete: boolean;

  /** Validation errors by step */
  stepErrors: Record<number, string[]>;

  /** Draft saved state */
  isDraftSaved: boolean;

  /** Last saved timestamp */
  lastSavedAt?: Date;
}

/**
 * Draft transfer for save/load functionality
 */
export interface TransferDraft {
  /** Draft ID */
  id: string;

  /** Draft name/description */
  name: string;

  /** Draft state */
  state: Partial<TransferWizardState>;

  /** Transfer data */
  transfer: Partial<StockTransfer>;

  /** Created timestamp */
  createdAt: Date;

  /** Last modified timestamp */
  updatedAt: Date;

  /** User who created draft */
  createdBy?: string;
}

/**
 * Step validation result
 */
export interface StepValidationResult {
  /** Whether step is valid */
  valid: boolean;

  /** Validation error messages */
  errors: string[];

  /** Warnings (non-blocking) */
  warnings?: string[];
}

/**
 * Transfer wizard configuration options
 */
export interface TransferWizardConfig {
  /** Allow partial quantity transfers */
  allowPartialTransfer: boolean;

  /** Require approval for transfers */
  requireApproval: boolean;

  /** Allow multiple products in single transfer */
  allowMultipleProducts: boolean;

  /** Enable draft save/load functionality */
  enableDraftSave: boolean;

  /** Enable batch number selection */
  enableBatchTracking: boolean;

  /** Show summary review step */
  showReviewStep: boolean;

  /** Custom validation function */
  customValidator?: (transfer: Partial<StockTransfer>) => StepValidationResult;
}

/**
 * Default wizard steps
 */
export const DEFAULT_WIZARD_STEPS: WizardStep[] = [
  {
    id: 'source',
    title: 'Select Source',
    description: 'Choose the source location for the transfer',
  },
  {
    id: 'destination',
    title: 'Select Destination',
    description: 'Choose the destination location for the transfer',
  },
  {
    id: 'items',
    title: 'Select Items',
    description: 'Choose products and quantities to transfer',
  },
  {
    id: 'quantities',
    title: 'Confirm Quantities',
    description: 'Review and adjust transfer quantities',
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review transfer details and submit',
  },
];

/**
 * Default wizard configuration
 */
export const DEFAULT_WIZARD_CONFIG: TransferWizardConfig = {
  allowPartialTransfer: true,
  requireApproval: false,
  allowMultipleProducts: true,
  enableDraftSave: true,
  enableBatchTracking: false,
  showReviewStep: true,
};
