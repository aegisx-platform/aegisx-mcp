/**
 * Stock Movement Timeline Component Type Definitions
 *
 * Defines types for the stock movement timeline component including
 * movement records, filters, grouping, and chart data.
 */

/**
 * Movement type enumeration
 */
export type MovementType =
  | 'receive'
  | 'issue'
  | 'transfer-in'
  | 'transfer-out'
  | 'adjust-in'
  | 'adjust-out';

/**
 * Reference document types
 */
export type ReferenceDocumentType = 'PO' | 'SO' | 'TO' | 'ADJ';

/**
 * Grouping strategies
 */
export type GroupByStrategy = 'none' | 'day' | 'week' | 'month';

/**
 * Export formats
 */
export type ExportFormat = 'pdf' | 'excel';

/**
 * Reference document information
 */
export interface ReferenceDocument {
  /** Document type (PO, SO, TO, ADJ) */
  type: ReferenceDocumentType;

  /** Document number */
  number: string;
}

/**
 * User information
 */
export interface MovementUser {
  /** User ID */
  id: string;

  /** User name */
  name: string;
}

/**
 * Stock movement record
 */
export interface MovementRecord {
  /** Unique movement identifier */
  id: string;

  /** Timestamp of movement */
  timestamp: Date;

  /** Type of movement */
  type: MovementType;

  /** Quantity moved */
  quantity: number;

  /** Balance after this movement */
  balanceAfter: number;

  /** Unit of measurement */
  unit: string;

  /** User who performed the movement */
  user: MovementUser;

  /** Reference document (optional) */
  referenceDocument?: ReferenceDocument;

  /** Location code/name (optional) */
  location?: string;

  /** Batch number (optional) */
  batchNumber?: string;

  /** Notes/comments (optional) */
  notes?: string;

  /** Additional metadata (optional) */
  metadata?: Record<string, unknown>;
}

/**
 * Movement filter criteria
 */
export interface MovementFilter {
  /** Filter by movement types */
  types: MovementType[];

  /** Filter by date range (optional) */
  dateRange?: {
    start: Date;
    end: Date;
  };

  /** Filter by users (optional) */
  users?: string[];

  /** Filter by locations (optional) */
  locations?: string[];
}

/**
 * Grouped movements with metadata
 */
export interface MovementGroup {
  /** Group key (e.g., '2025-12-19' for day grouping) */
  key: string;

  /** Date for this group (first movement date) */
  date: Date | null;

  /** Movements in this group */
  movements: MovementRecord[];

  /** Net quantity change for this group */
  total: number;
}

/**
 * Balance data point for chart
 */
export interface BalanceDataPoint {
  /** Timestamp of the data point */
  timestamp: Date;

  /** Balance at this point */
  balance: number;
}

/**
 * API response for movements
 */
export interface MovementApiResponse {
  /** List of movements */
  movements: MovementRecord[];

  /** Total count (for pagination) */
  total: number;

  /** Current balance */
  currentBalance: number;
}

/**
 * Export event data
 */
export interface ExportEventData {
  /** Export format (pdf or excel) */
  format: ExportFormat;

  /** Data to export */
  data: MovementRecord[];
}

/**
 * WebSocket message types
 */
export type WebSocketMessageType = 'subscribe' | 'movement';

/**
 * WebSocket subscription message
 */
export interface WebSocketSubscribeMessage {
  /** Message type */
  type: 'subscribe';

  /** Product ID to subscribe to */
  productId: string;
}

/**
 * WebSocket movement event message
 */
export interface WebSocketMovementMessage {
  /** Message type */
  type: 'movement';

  /** Movement data */
  data: MovementRecord;
}

/**
 * WebSocket message union type
 */
export type WebSocketMessage =
  | WebSocketSubscribeMessage
  | WebSocketMovementMessage;

/**
 * Movement type display configuration
 */
export interface MovementTypeConfig {
  /** Display label */
  label: string;

  /** Icon name (Material Icons) */
  icon: string;

  /** CSS class for styling */
  cssClass: string;

  /** Background color class */
  bgClass: string;

  /** Text color class */
  textClass: string;

  /** Whether this is an inbound movement (+) */
  isInbound: boolean;
}

/**
 * Movement type configurations map
 */
export const MOVEMENT_TYPE_CONFIGS: Record<MovementType, MovementTypeConfig> = {
  receive: {
    label: 'RECEIVE',
    icon: 'arrow_downward',
    cssClass: 'movement-type--receive',
    bgClass: 'bg-success-50',
    textClass: 'text-success-700',
    isInbound: true,
  },
  issue: {
    label: 'ISSUE',
    icon: 'arrow_upward',
    cssClass: 'movement-type--issue',
    bgClass: 'bg-error-50',
    textClass: 'text-error-700',
    isInbound: false,
  },
  'transfer-in': {
    label: 'TRANSFER IN',
    icon: 'call_received',
    cssClass: 'movement-type--transfer-in',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    isInbound: true,
  },
  'transfer-out': {
    label: 'TRANSFER OUT',
    icon: 'call_made',
    cssClass: 'movement-type--transfer-out',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    isInbound: false,
  },
  'adjust-in': {
    label: 'ADJUST IN',
    icon: 'add_circle',
    cssClass: 'movement-type--adjust-in',
    bgClass: 'bg-warning-50',
    textClass: 'text-warning-700',
    isInbound: true,
  },
  'adjust-out': {
    label: 'ADJUST OUT',
    icon: 'remove_circle',
    cssClass: 'movement-type--adjust-out',
    bgClass: 'bg-warning-50',
    textClass: 'text-warning-700',
    isInbound: false,
  },
};
