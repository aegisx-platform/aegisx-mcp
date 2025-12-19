/**
 * Stock Level Component Type Definitions
 * Implements Material Design 3 with traffic-light and gradient color schemes
 */

/**
 * Size variants for the progress bar
 */
export type StockLevelSize = 'sm' | 'md' | 'lg';

/**
 * Color scheme options for stock level display
 */
export type StockLevelColorScheme = 'traffic-light' | 'gradient';

/**
 * Warning event emitted when stock reaches critical levels
 */
export interface StockLevelWarningEvent {
  /** Warning level triggered (low or critical) */
  level: 'low' | 'critical';
  /** Current stock value */
  current: number;
  /** Minimum threshold */
  minimum: number;
}
