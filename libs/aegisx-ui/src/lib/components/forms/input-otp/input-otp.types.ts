/**
 * Input OTP Component Type Definitions
 *
 * Type definitions for the AegisX one-time password (OTP) input component.
 * Accessible OTP input with copy/paste support and pattern validation.
 */

// ============================================================================
// OTP Configuration Types
// ============================================================================

/**
 * OTP input length
 *
 * Defines the number of character inputs for the OTP.
 * Supported lengths: 4, 5, 6, 7, or 8 characters.
 *
 * Common use cases:
 * - 4: Short PINs or basic OTPs
 * - 6: Standard email/SMS verification codes (most common)
 * - 8: Extended security codes
 */
export type OtpLength = 4 | 5 | 6 | 7 | 8;

/**
 * OTP character pattern validation
 *
 * Determines what characters are allowed in the OTP:
 * - digits: Numbers only (0-9) - default and most common
 * - alphanumeric: Letters and numbers (A-Z, a-z, 0-9)
 * - alpha: Letters only (A-Z, a-z)
 */
export type OtpPattern = 'digits' | 'alphanumeric' | 'alpha';

/**
 * OTP input display size
 *
 * Controls the visual size of each OTP character box:
 * - sm: Small, compact inputs
 * - md: Medium, default size
 * - lg: Large, prominent inputs
 */
export type OtpSize = 'sm' | 'md' | 'lg';

// ============================================================================
// OTP Separator Configuration
// ============================================================================

/**
 * OTP visual separator configuration
 *
 * Defines where to place a visual separator (e.g., dash or space)
 * between OTP input boxes for improved readability.
 *
 * @example
 * // Add dash after 3rd character (e.g., "123-456")
 * const config: OtpSeparatorConfig = {
 *   position: 3,
 *   character: '-'
 * };
 *
 * @example
 * // Add space after 4th character (e.g., "1234 56")
 * const config: OtpSeparatorConfig = {
 *   position: 4,
 *   character: ' '
 * };
 */
export interface OtpSeparatorConfig {
  /** Position after which to insert separator (1-based index) */
  position: number;

  /** Optional separator character - defaults to dash '-' */
  character?: string;
}
