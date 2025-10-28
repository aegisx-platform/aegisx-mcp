/**
 * Configuration for AegisX Confirm Dialog
 */
export interface AxConfirmDialogData {
  /** Dialog title */
  title: string;
  /** Dialog message/content */
  message: string;
  /** Confirm button text (default: 'Confirm') */
  confirmText?: string;
  /** Cancel button text (default: 'Cancel') */
  cancelText?: string;
  /** Mark as dangerous action (red button) */
  isDangerous?: boolean;
}
