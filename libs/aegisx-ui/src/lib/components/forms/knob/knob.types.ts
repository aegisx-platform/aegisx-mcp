/**
 * Knob Component Type Definitions
 *
 * Type definitions for the AegisX circular knob input control.
 * A rotary input controlled by mouse/touch drag, useful for
 * dashboard gauges, volume controls, and settings.
 */

// ============================================================================
// Knob Size & Color
// ============================================================================

/**
 * Knob component display size
 *
 * Controls the visual size of the knob control:
 * - sm: Small knob (e.g., 80px diameter)
 * - md: Medium knob (default, e.g., 120px diameter)
 * - lg: Large knob (e.g., 160px diameter)
 * - xl: Extra large knob (e.g., 200px diameter)
 */
export type KnobSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Knob color theme
 *
 * Determines the color scheme for the knob progress arc:
 * - primary: Primary theme color
 * - accent: Accent theme color
 * - success: Green color for positive metrics
 * - warning: Orange/yellow for warning states
 * - error: Red color for error states or critical values
 */
export type KnobColor = 'primary' | 'accent' | 'success' | 'warning' | 'error';
