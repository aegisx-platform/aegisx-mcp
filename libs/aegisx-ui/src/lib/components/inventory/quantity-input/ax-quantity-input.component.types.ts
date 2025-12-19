/**
 * Quantity Input Component Type Definitions
 * ================================================================
 * Type definitions for the AxQuantityInputComponent with unit conversion support.
 */

/**
 * Validation error for quantity input
 */
export interface ValidationError {
  /** Type of validation error */
  type: 'min' | 'max' | 'decimal' | 'integer';
  /** Error message */
  message: string;
}

/**
 * Validation state
 */
export interface ValidationState {
  /** Whether the value is valid */
  valid: boolean;
  /** Array of validation errors */
  errors: ValidationError[];
}

/**
 * Unit configuration for quantity input
 * Note: This extends the shared UnitConfig from inventory.types.ts
 * with additional properties specific to the quantity input component
 */
export interface QuantityUnitConfig {
  /** Unit code (e.g., 'pieces', 'box', 'kg') */
  code: string;
  /** Display label */
  label: string;
  /** Conversion rate to base unit (e.g., 12 pieces per box) */
  conversionRate: number;
  /** Allowed decimal places for this unit */
  decimalPlaces: number;
  /** Optional unit symbol */
  symbol?: string;
}
