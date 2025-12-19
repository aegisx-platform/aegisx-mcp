/**
 * Variant Selector Component Type Definitions
 * ================================================================
 *
 * Type definitions for the Product Variant Selector component.
 * Supports multi-dimensional variant selection with attributes,
 * stock availability, pricing, and multiple layout modes.
 */

/**
 * Product variant interface with comprehensive details
 */
export interface ProductVariant {
  /** Unique variant SKU identifier */
  sku: string;

  /** Variant display name */
  name: string;

  /** Multi-dimensional attributes (size, color, style, etc.) */
  attributes: Record<string, string>;

  /** Variant image URL */
  imageUrl?: string;

  /** Variant price (may differ from base product) */
  price: number;

  /** Current stock level */
  stockLevel: number;

  /** Whether variant is available for selection */
  available: boolean;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Variant selection result
 * Used when variants are selected (single or multiple)
 */
export interface VariantSelection {
  /** Array of selected variants with quantities */
  variants: Array<{
    variant: ProductVariant;
    quantity: number;
  }>;
}

/**
 * Attribute filter event
 * Emitted when user filters by specific attribute value
 */
export interface AttributeFilterEvent {
  /** Attribute key (e.g., 'size', 'color') */
  attribute: string;

  /** Selected value (e.g., 'Large', 'Blue') */
  value: string;
}

/**
 * Stock badge type
 * Visual indicator for stock availability
 */
export type StockBadgeType = 'success' | 'warning' | 'error';

/**
 * Layout mode for variant display
 */
export type VariantLayoutMode = 'grid' | 'list' | 'compact';

/**
 * Variant selection state (internal)
 */
export interface VariantSelectionState {
  /** Currently selected variant(s) with quantities */
  selectedVariants: Map<string, number>;

  /** Search filter term */
  searchTerm: string;

  /** Active attribute filters */
  attributeFilters: Map<string, string>;

  /** Current layout mode */
  layout: VariantLayoutMode;
}

/**
 * Quick view modal data
 */
export interface QuickViewData {
  /** Variant to display */
  variant: ProductVariant;

  /** Whether modal is open */
  isOpen: boolean;
}
