/**
 * Barcode Scanner Component Type Definitions
 * Following Priority 1 Inventory UI Components Spec
 */

/**
 * Barcode format types supported by the scanner
 */
export type BarcodeFormat =
  | 'qr'
  | 'ean13'
  | 'ean8'
  | 'code128'
  | 'code39'
  | 'datamatrix';

/**
 * Scanner mode
 */
export type ScannerMode = 'camera' | 'manual' | 'auto';

/**
 * Scan result containing barcode data and metadata
 */
export interface ScanResult {
  /** Scanned barcode value */
  code: string;
  /** Detected format */
  format: BarcodeFormat;
  /** Timestamp of scan */
  timestamp: Date;
  /** Mode used for scanning */
  mode: 'camera' | 'manual';
}

/**
 * Scan error types
 */
export interface ScanError {
  type: 'permission-denied' | 'invalid-format' | 'camera-error' | 'timeout';
  message: string;
}
