import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AxConfirmDialogComponent } from '../components/dialogs/ax-confirm-dialog/ax-confirm-dialog.component';
import { AxConfirmDialogData } from '../components/dialogs/ax-confirm-dialog/ax-confirm-dialog.types';

/**
 * AegisX Dialog Service
 *
 * Provides convenient methods to open dialogs without importing MatDialog and components separately.
 *
 * Usage:
 * ```typescript
 * constructor(private axDialog: AxDialogService) {}
 *
 * deleteItem() {
 *   this.axDialog.confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure?',
 *     isDangerous: true,
 *   }).subscribe(confirmed => {
 *     if (confirmed) {
 *       // Handle deletion
 *     }
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AxDialogService {
  private dialog = inject(MatDialog);

  /**
   * Open a confirm dialog
   *
   * @param config Configuration for the confirm dialog
   * @returns Observable that emits true if confirmed, false otherwise
   *
   * @example
   * ```typescript
   * this.axDialog.confirm({
   *   title: 'Delete Book',
   *   message: 'Are you sure you want to delete this book?',
   *   confirmText: 'Delete',
   *   isDangerous: true,
   * }).subscribe(confirmed => {
   *   if (confirmed) {
   *     // Handle deletion
   *   }
   * });
   * ```
   */
  confirm(config: AxConfirmDialogData) {
    const dialogRef = this.dialog.open(AxConfirmDialogComponent, {
      width: '400px',
      disableClose: false,
      data: config,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Open a confirm dialog for a single item delete
   *
   * @param itemName Name of the item to delete
   * @param isDangerous Whether to show warning (red button)
   * @returns Observable that emits true if confirmed, false otherwise
   *
   * @example
   * ```typescript
   * this.axDialog.confirmDelete('Book Title').subscribe(confirmed => {
   *   if (confirmed) {
   *     this.deleteBook(book.id);
   *   }
   * });
   * ```
   */
  confirmDelete(itemName: string, isDangerous = true) {
    return this.confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous,
    });
  }

  /**
   * Open a confirm dialog for bulk delete
   *
   * @param count Number of items to delete
   * @param itemType Type of items (e.g., 'books', 'users')
   * @returns Observable that emits true if confirmed, false otherwise
   *
   * @example
   * ```typescript
   * this.axDialog.confirmBulkDelete(5, 'books').subscribe(confirmed => {
   *   if (confirmed) {
   *     this.deleteBooks(selectedIds);
   *   }
   * });
   * ```
   */
  confirmBulkDelete(count: number, itemType = 'items') {
    return this.confirm({
      title: `Delete ${count} ${itemType}`,
      message: `Are you sure you want to permanently delete ${count} ${itemType}? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      isDangerous: true,
    });
  }
}
