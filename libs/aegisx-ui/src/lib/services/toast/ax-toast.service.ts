import { Injectable, inject, InjectionToken } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import {
  ToastType,
  ToastOptions,
  ToastConfig,
  ToastRef,
  DEFAULT_TOAST_CONFIG,
} from './ax-toast.types';

/**
 * Injection token for toast configuration
 */
export const AX_TOAST_CONFIG = new InjectionToken<Partial<ToastConfig>>(
  'AX_TOAST_CONFIG',
);

/**
 * AegisX Toast Service
 *
 * Unified toast notification service that supports both ngx-toastr and MatSnackBar.
 * Provides a simple API for showing notifications with automatic provider selection.
 *
 * @example
 * ```typescript
 * // Simple usage
 * this.toast.success('บันทึกสำเร็จ');
 * this.toast.error('เกิดข้อผิดพลาด');
 *
 * // With options
 * this.toast.success('บันทึกสำเร็จ', { title: 'สำเร็จ', duration: 3000 });
 *
 * // Force specific provider
 * this.toast.info('กำลังดำเนินการ...', { provider: 'snackbar', action: 'ยกเลิก' });
 *
 * // With action callback
 * this.toast.warning('ต้องการลบข้อมูล?', {
 *   provider: 'snackbar',
 *   action: 'ลบ',
 *   onAction: () => this.deleteItem()
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AxToastService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly toastr = inject(ToastrService, { optional: true });
  private readonly config: ToastConfig;

  constructor() {
    // Merge default config with injected config
    const injectedConfig = inject(AX_TOAST_CONFIG, { optional: true });
    this.config = { ...DEFAULT_TOAST_CONFIG, ...injectedConfig };
  }

  // ============================================
  // PUBLIC API - Simple Methods
  // ============================================

  /**
   * Show success toast
   */
  success(message: string, options?: ToastOptions): ToastRef {
    return this.show('success', message, options);
  }

  /**
   * Show error toast
   */
  error(message: string, options?: ToastOptions): ToastRef {
    return this.show('error', message, options);
  }

  /**
   * Show warning toast
   */
  warning(message: string, options?: ToastOptions): ToastRef {
    return this.show('warning', message, options);
  }

  /**
   * Show info toast
   */
  info(message: string, options?: ToastOptions): ToastRef {
    return this.show('info', message, options);
  }

  /**
   * Show toast with specified type
   */
  show(type: ToastType, message: string, options?: ToastOptions): ToastRef {
    const provider = this.resolveProvider(options?.provider);

    if (provider === 'snackbar') {
      return this.showSnackbar(type, message, options);
    }

    return this.showToastr(type, message, options);
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toastr?.clear();
    this.snackBar.dismiss();
  }

  /**
   * Clear all toastr toasts only
   */
  clearToastr(): void {
    this.toastr?.clear();
  }

  /**
   * Dismiss current snackbar
   */
  dismissSnackbar(): void {
    this.snackBar.dismiss();
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Resolve which provider to use
   */
  private resolveProvider(requested?: string): 'toastr' | 'snackbar' {
    if (requested === 'snackbar') return 'snackbar';
    if (requested === 'toastr') return 'toastr';

    // Auto: use toastr if available, otherwise snackbar
    if (this.toastr) {
      return this.config.defaultProvider === 'snackbar' ? 'snackbar' : 'toastr';
    }

    return 'snackbar';
  }

  /**
   * Show toast using ngx-toastr
   */
  private showToastr(
    type: ToastType,
    message: string,
    options?: ToastOptions,
  ): ToastRef {
    if (!this.toastr) {
      console.warn('ngx-toastr not available, falling back to MatSnackBar');
      return this.showSnackbar(type, message, options);
    }

    const config: Partial<IndividualConfig> = {
      timeOut: options?.duration ?? this.config.defaultDuration,
      positionClass: options?.position ?? this.config.defaultPosition,
      closeButton: options?.closeButton ?? true,
      progressBar: options?.progressBar ?? true,
      enableHtml: options?.enableHtml ?? false,
      disableTimeOut: options?.disableTimeOut ?? false,
      extendedTimeOut: options?.extendedTimeOut ?? 1000,
    };

    if (options?.panelClass) {
      config.toastClass = Array.isArray(options.panelClass)
        ? options.panelClass.join(' ')
        : options.panelClass;
    }

    const title = options?.title || '';
    let toastRef: ReturnType<ToastrService['success']>;

    switch (type) {
      case 'success':
        toastRef = this.toastr.success(message, title, config);
        break;
      case 'error':
        toastRef = this.toastr.error(message, title, config);
        break;
      case 'warning':
        toastRef = this.toastr.warning(message, title, config);
        break;
      case 'info':
      default:
        toastRef = this.toastr.info(message, title, config);
        break;
    }

    return {
      dismiss: () => this.toastr?.clear(toastRef.toastId),
      afterDismissed: () =>
        new Promise<void>((resolve) => {
          toastRef.onHidden.subscribe(() => resolve());
        }),
    };
  }

  /**
   * Show toast using MatSnackBar
   */
  private showSnackbar(
    type: ToastType,
    message: string,
    options?: ToastOptions,
  ): ToastRef {
    const panelClasses = this.getSnackbarPanelClass(type, options?.panelClass);

    const config: MatSnackBarConfig = {
      duration: options?.duration ?? this.config.defaultDuration,
      horizontalPosition: options?.horizontalPosition ?? 'center',
      verticalPosition: options?.verticalPosition ?? 'bottom',
      panelClass: panelClasses,
    };

    const action = options?.action || '';
    const snackBarRef = this.snackBar.open(message, action, config);

    // Handle action callback
    if (options?.onAction) {
      snackBarRef.onAction().subscribe(() => {
        options.onAction?.();
      });
    }

    return {
      dismiss: () => snackBarRef.dismiss(),
      afterDismissed: () =>
        new Promise<void>((resolve) => {
          snackBarRef.afterDismissed().subscribe(() => resolve());
        }),
      onAction: () =>
        new Promise<void>((resolve) => {
          snackBarRef.onAction().subscribe(() => resolve());
        }),
    };
  }

  /**
   * Get panel classes for snackbar based on type
   */
  private getSnackbarPanelClass(
    type: ToastType,
    customClass?: string | string[],
  ): string[] {
    const baseClasses: string[] = ['ax-snackbar'];

    // Add type-specific class
    switch (type) {
      case 'success':
        baseClasses.push('ax-snackbar-success');
        break;
      case 'error':
        baseClasses.push('ax-snackbar-error');
        break;
      case 'warning':
        baseClasses.push('ax-snackbar-warning');
        break;
      case 'info':
        baseClasses.push('ax-snackbar-info');
        break;
    }

    // Add custom classes
    if (customClass) {
      if (Array.isArray(customClass)) {
        baseClasses.push(...customClass);
      } else {
        baseClasses.push(customClass);
      }
    }

    return baseClasses;
  }
}
