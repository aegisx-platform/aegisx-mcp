/**
 * Stock Alert Panel Component Type Definitions
 * =============================================================================
 *
 * This file contains type definitions for the Stock Alert Panel component,
 * which displays real-time stock alerts with filtering, grouping, and actions.
 */

/**
 * Alert type enumeration
 * Categorizes different types of stock alerts
 */
export type AlertType =
  | 'low-stock'
  | 'out-of-stock'
  | 'expiring'
  | 'expired'
  | 'overstock'
  | 'reorder';

/**
 * Alert severity enumeration
 * Defines priority levels for alerts
 */
export type AlertSeverity = 'critical' | 'warning' | 'info';

/**
 * Stock alert interface (enhanced version)
 * Represents a single stock alert with complete metadata
 */
export interface StockAlert {
  /** Unique alert identifier */
  id: string;

  /** Alert type */
  type: AlertType;

  /** Alert severity level */
  severity: AlertSeverity;

  /** Product information */
  product: {
    /** Product ID */
    id: string;
    /** Product name */
    name: string;
    /** Product SKU */
    sku: string;
    /** Product image URL (optional) */
    imageUrl?: string;
  };

  /** Alert message */
  message: string;

  /** Alert creation timestamp */
  createdAt: Date;

  /** Additional metadata */
  metadata?: {
    /** Current stock level */
    currentStock?: number;
    /** Minimum stock level */
    minimumStock?: number;
    /** Maximum stock level */
    maximumStock?: number;
    /** Expiry date for expiring/expired alerts */
    expiryDate?: Date;
    /** Batch number for batch-specific alerts */
    batchNumber?: string;
    /** Location ID where alert originated */
    locationId?: string;
    /** Location name */
    locationName?: string;
  };

  /** Suggested actions for resolving the alert */
  suggestedActions?: string[];

  /** Whether the alert has been read */
  read?: boolean;

  /** Whether the alert has been resolved */
  resolved?: boolean;
}

/**
 * Alert filter criteria
 * Used to filter alerts by various properties
 */
export interface AlertFilter {
  /** Filter by alert types */
  types?: AlertType[];

  /** Filter by severity levels */
  severity?: AlertSeverity[];

  /** Filter by product IDs */
  productIds?: string[];

  /** Filter by location IDs */
  locationIds?: string[];

  /** Show only unread alerts */
  unreadOnly?: boolean;

  /** Show only unresolved alerts */
  unresolvedOnly?: boolean;
}

/**
 * Alert grouping strategy
 * Defines how alerts should be grouped in the panel
 */
export type AlertGroupBy = 'type' | 'priority' | 'location' | 'none';

/**
 * Grouped alerts interface
 * Represents a group of alerts with metadata
 */
export interface AlertGroup {
  /** Group key (type, severity, or location ID) */
  key: string;

  /** Group display label */
  label: string;

  /** Alerts in this group */
  alerts: StockAlert[];

  /** Number of critical alerts in group */
  criticalCount: number;

  /** Number of warning alerts in group */
  warningCount: number;

  /** Number of info alerts in group */
  infoCount: number;
}

/**
 * Alert counts by severity
 * Used for displaying badge counts
 */
export interface AlertCounts {
  /** Total number of alerts */
  total: number;

  /** Number of critical alerts */
  critical: number;

  /** Number of warning alerts */
  warning: number;

  /** Number of info alerts */
  info: number;

  /** Number of unread alerts */
  unread: number;

  /** Number of unresolved alerts */
  unresolved: number;
}

/**
 * Alert action event
 * Emitted when an action is performed on an alert
 */
export interface AlertActionEvent {
  /** The alert being acted upon */
  alert: StockAlert;

  /** Action type */
  action:
    | 'create-po'
    | 'adjust-stock'
    | 'view-product'
    | 'dispose'
    | 'reorder'
    | 'dismiss'
    | 'resolve'
    | 'custom';

  /** Optional action data */
  data?: any;
}

/**
 * WebSocket alert message
 * Real-time alert update from WebSocket
 */
export interface WebSocketAlertMessage {
  /** Message type */
  type: 'new-alert' | 'alert-updated' | 'alert-resolved' | 'alert-dismissed';

  /** Alert data */
  data: StockAlert;

  /** Message timestamp */
  timestamp: Date;
}

/**
 * Alert notification sound configuration
 */
export interface SoundConfig {
  /** Whether sound is enabled */
  enabled: boolean;

  /** Volume level (0.0 to 1.0) */
  volume: number;

  /** Sound to play for critical alerts */
  criticalSound?: 'beep' | 'chime' | 'alarm' | 'custom';

  /** Sound to play for warning alerts */
  warningSound?: 'beep' | 'chime' | 'alarm' | 'custom';

  /** Custom sound URL (if criticalSound or warningSound is 'custom') */
  customSoundUrl?: string;
}

/**
 * Alert panel configuration
 */
export interface AlertPanelConfig {
  /** Maximum number of alerts to display (default: 10) */
  maxDisplay?: number;

  /** Default grouping strategy (default: 'priority') */
  defaultGroupBy?: AlertGroupBy;

  /** Enable real-time WebSocket updates (default: false) */
  enableRealtime?: boolean;

  /** Enable notification sounds (default: false) */
  enableSounds?: boolean;

  /** Sound configuration */
  soundConfig?: SoundConfig;

  /** Auto-refresh interval in milliseconds (0 = disabled) */
  autoRefreshInterval?: number;

  /** Show action buttons on alerts (default: true) */
  showActions?: boolean;

  /** Show alert history (default: false) */
  showHistory?: boolean;

  /** API endpoint for fetching alerts */
  apiEndpoint?: string;

  /** WebSocket endpoint for real-time updates */
  wsEndpoint?: string;
}
