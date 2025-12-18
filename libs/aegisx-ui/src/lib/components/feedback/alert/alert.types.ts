/**
 * Alert Component Types
 *
 * Type definitions for the AxAlert feedback component.
 */

/**
 * Alert variant determines the visual style and icon displayed.
 *
 * @example
 * // Using different variants
 * <ax-alert variant="success" title="Operation completed"></ax-alert>
 * <ax-alert variant="error" title="Something went wrong"></ax-alert>
 * <ax-alert variant="warning" title="Please review"></ax-alert>
 * <ax-alert variant="info" title="Information"></ax-alert>
 *
 * @see {@link AxAlertComponent}
 */
export type AlertVariant = 'success' | 'error' | 'warning' | 'info' | 'default';
