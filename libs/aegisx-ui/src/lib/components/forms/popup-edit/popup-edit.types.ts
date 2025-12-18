/**
 * Popup Edit Component Type Definitions
 *
 * Type definitions for the AegisX inline popup editing component.
 * Perfect for editable table cells or quick inline updates.
 */

// ============================================================================
// Popup Edit Input Types
// ============================================================================

/**
 * Input type for popup edit field
 *
 * Determines the type of input control shown in the popup:
 * - text: Single-line text input (default)
 * - number: Numeric input with number validation
 * - textarea: Multi-line text input for longer content
 */
export type PopupEditInputType = 'text' | 'number' | 'textarea';
