/**
 * AegisX Toast Types
 *
 * Type definitions for the unified toast notification service.
 */

/**
 * Toast notification type/severity
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast provider selection
 * - 'toastr': ngx-toastr (supports stacking, icons, rich features)
 * - 'snackbar': Angular Material MatSnackBar (single toast, action button)
 * - 'auto': Automatically select based on context (default: toastr)
 */
export type ToastProvider = 'toastr' | 'snackbar' | 'auto';

/**
 * Toast position for ngx-toastr
 */
export type ToastPosition =
  | 'toast-top-right'
  | 'toast-top-left'
  | 'toast-top-center'
  | 'toast-top-full-width'
  | 'toast-bottom-right'
  | 'toast-bottom-left'
  | 'toast-bottom-center'
  | 'toast-bottom-full-width';

/**
 * Snackbar horizontal position
 */
export type SnackbarHorizontalPosition =
  | 'start'
  | 'center'
  | 'end'
  | 'left'
  | 'right';

/**
 * Snackbar vertical position
 */
export type SnackbarVerticalPosition = 'top' | 'bottom';

/**
 * Toast configuration options
 */
export interface ToastOptions {
  /**
   * Duration in milliseconds (0 = persistent until dismissed)
   * @default 5000
   */
  duration?: number;

  /**
   * Which provider to use
   * @default 'auto'
   */
  provider?: ToastProvider;

  /**
   * Toast title (ngx-toastr only)
   */
  title?: string;

  /**
   * Action button text (MatSnackBar) or close button (ngx-toastr)
   */
  action?: string;

  /**
   * Callback when action button is clicked
   */
  onAction?: () => void;

  /**
   * Position for ngx-toastr
   * @default 'toast-top-right'
   */
  position?: ToastPosition;

  /**
   * Horizontal position for MatSnackBar
   * @default 'center'
   */
  horizontalPosition?: SnackbarHorizontalPosition;

  /**
   * Vertical position for MatSnackBar
   * @default 'bottom'
   */
  verticalPosition?: SnackbarVerticalPosition;

  /**
   * Show close button (ngx-toastr only)
   * @default true
   */
  closeButton?: boolean;

  /**
   * Show progress bar (ngx-toastr only)
   * @default true
   */
  progressBar?: boolean;

  /**
   * Prevent duplicate toasts with same message
   * @default false
   */
  preventDuplicates?: boolean;

  /**
   * Custom CSS class
   */
  panelClass?: string | string[];

  /**
   * Enable HTML in message (ngx-toastr only, use with caution)
   * @default false
   */
  enableHtml?: boolean;

  /**
   * Disable click to dismiss (ngx-toastr only)
   * @default false
   */
  disableTimeOut?: boolean;

  /**
   * Extend timeout on hover (ngx-toastr only)
   * @default true
   */
  extendedTimeOut?: number;
}

/**
 * Global toast service configuration
 */
export interface ToastConfig {
  /**
   * Default provider when 'auto' is selected
   * @default 'toastr'
   */
  defaultProvider: ToastProvider;

  /**
   * Default duration in milliseconds
   * @default 5000
   */
  defaultDuration: number;

  /**
   * Default position for ngx-toastr
   * @default 'toast-top-right'
   */
  defaultPosition: ToastPosition;

  /**
   * Maximum number of toasts to show at once (ngx-toastr)
   * @default 5
   */
  maxOpened: number;

  /**
   * Auto dismiss older toasts when max is reached
   * @default true
   */
  autoDismiss: boolean;

  /**
   * Show newest toast on top
   * @default true
   */
  newestOnTop: boolean;

  /**
   * Prevent duplicate messages
   * @default false
   */
  preventDuplicates: boolean;

  /**
   * Icon prefix for toastr
   */
  iconClasses: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
}

/**
 * Toast reference for programmatic control
 */
export interface ToastRef {
  /**
   * Dismiss the toast
   */
  dismiss: () => void;

  /**
   * Promise that resolves when toast is dismissed
   */
  afterDismissed: () => Promise<void>;

  /**
   * Promise that resolves when action is clicked (MatSnackBar only)
   */
  onAction?: () => Promise<void>;
}

/**
 * Default toast configuration
 */
export const DEFAULT_TOAST_CONFIG: ToastConfig = {
  defaultProvider: 'toastr',
  defaultDuration: 5000,
  defaultPosition: 'toast-top-right',
  maxOpened: 5,
  autoDismiss: true,
  newestOnTop: true,
  preventDuplicates: false,
  iconClasses: {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info',
  },
};
