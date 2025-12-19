import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';

import {
  BatchInfo,
  SelectedBatch,
  BatchSelection,
  ExpiryStatus,
  BatchApiResponse,
} from './ax-batch-selector.component.types';

/**
 * Batch/Lot Number Selector Component - Priority 1
 *
 * Features:
 * - Multiple batch sorting strategies (FIFO/FEFO/LIFO)
 * - Expiry date tracking with color-coded status
 * - Single and multi-select modes
 * - Quantity per batch selection
 * - Search/filter by batch number
 * - API integration for batch loading
 * - Recommended batch highlighting
 *
 * @example
 * ```html
 * <ax-batch-selector
 *   [productId]="'PROD-001'"
 *   [(strategy)]="selectedStrategy"
 *   [allowMultiple]="true"
 *   [requestedQuantity]="150"
 *   (onSelect)="handleBatchSelection($event)"
 * />
 * ```
 */
@Component({
  selector: 'ax-batch-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
  ],
  templateUrl: './ax-batch-selector.component.html',
  styleUrls: ['./ax-batch-selector.component.scss'],
})
export class AxBatchSelectorComponent implements OnInit {
  private readonly http = inject(HttpClient);

  // Expose Math for template use
  protected readonly Math = Math;

  // =============================================================================
  // INPUTS
  // =============================================================================

  /** Product ID to fetch batches for */
  productId = input.required<string>();

  /** Optional pre-loaded batches (if not loading from API) */
  batches = input<BatchInfo[]>([]);

  /** Batch selection strategy (supports two-way binding) */
  strategy = model<'fifo' | 'fefo' | 'lifo'>('fefo');

  /** Allow selecting multiple batches */
  allowMultiple = input<boolean>(false);

  /** Optional requested quantity (for auto-calculation) */
  requestedQuantity = input<number | undefined>(undefined);

  /** Show expiry date information */
  showExpiry = input<boolean>(true);

  /** Show manufacturing date information */
  showManufacturing = input<boolean>(false);

  /** Show recommended batch indicator */
  showRecommendation = input<boolean>(true);

  /** Days threshold for expiry warning (yellow) */
  expiryWarningDays = input<number>(30);

  /** Days threshold for critical expiry (red) */
  expiryCriticalDays = input<number>(7);

  // =============================================================================
  // OUTPUTS
  // =============================================================================

  /** Emitted when batch selection changes */
  select = output<BatchSelection>();

  /** Emitted when batches are loaded from API */
  batchesLoad = output<BatchInfo[]>();

  /** Emitted on errors */
  error = output<string>();

  // =============================================================================
  // INTERNAL STATE
  // =============================================================================

  /** Internal batch storage */
  private internalBatches = signal<BatchInfo[]>([]);

  /** Selected batches with quantities */
  selectedBatches = signal<SelectedBatch[]>([]);

  /** Search/filter term */
  searchTerm = signal<string>('');

  /** Loading state */
  isLoading = signal<boolean>(false);

  // =============================================================================
  // COMPUTED SIGNALS
  // =============================================================================

  /**
   * Batches sorted by current strategy
   */
  sortedBatches = computed(() => {
    const batches = [...this.internalBatches()];
    const strategy = this.strategy();

    switch (strategy) {
      case 'fifo':
        // First In First Out - Sort by manufacturing date ascending
        return batches.sort((a, b) => {
          const dateA = a.manufacturingDate?.getTime() || 0;
          const dateB = b.manufacturingDate?.getTime() || 0;
          return dateA - dateB;
        });

      case 'fefo':
        // First Expired First Out - Sort by expiry date ascending
        return batches.sort(
          (a, b) => a.expiryDate.getTime() - b.expiryDate.getTime(),
        );

      case 'lifo':
        // Last In First Out - Sort by manufacturing date descending
        return batches.sort((a, b) => {
          const dateA = a.manufacturingDate?.getTime() || 0;
          const dateB = b.manufacturingDate?.getTime() || 0;
          return dateB - dateA;
        });

      default:
        return batches;
    }
  });

  /**
   * Filtered and sorted batches based on search term
   */
  filteredBatches = computed(() => {
    let batches = this.sortedBatches();
    const term = this.searchTerm().toLowerCase();

    if (term) {
      batches = batches.filter(
        (b) =>
          b.batchNumber.toLowerCase().includes(term) ||
          b.lotNumber?.toLowerCase().includes(term),
      );
    }

    return batches;
  });

  /**
   * Recommended batch ID based on strategy
   */
  recommendedBatchId = computed(() => {
    if (!this.showRecommendation()) return null;

    const available = this.sortedBatches().filter(
      (b) => b.status === 'available' && !this.isExpired(b),
    );

    return available[0]?.batchNumber || null;
  });

  /**
   * Total quantity of selected batches
   */
  totalSelectedQuantity = computed(() => {
    return this.selectedBatches().reduce((sum, sb) => sum + sb.quantity, 0);
  });

  /**
   * Whether more batches can be selected (based on requested quantity)
   */
  canSelectMore = computed(() => {
    if (!this.allowMultiple()) return true;
    const requested = this.requestedQuantity();
    if (!requested) return true;
    return this.totalSelectedQuantity() < requested;
  });

  // =============================================================================
  // LIFECYCLE HOOKS
  // =============================================================================

  async ngOnInit() {
    const providedBatches = this.batches();
    if (providedBatches.length > 0) {
      // Use provided batches
      this.internalBatches.set(providedBatches);
    } else {
      // Load from API
      await this.loadBatches();
    }
  }

  // =============================================================================
  // API INTEGRATION
  // =============================================================================

  /**
   * Load batches from API
   */
  private async loadBatches() {
    const productId = this.productId();
    if (!productId) {
      this.error.emit('Product ID is required to load batches');
      return;
    }

    this.isLoading.set(true);

    try {
      const response = await firstValueFrom(
        this.http.get<BatchApiResponse>(
          `/api/inventory/products/${productId}/batches`,
          {
            params: {
              status: 'available',
            },
          },
        ),
      );

      this.internalBatches.set(response.batches);
      this.batchesLoad.emit(response.batches);

      // Apply strategy from API if provided
      if (response.strategy) {
        this.strategy.set(response.strategy);
      }
    } catch (error: any) {
      this.error.emit(
        `Failed to load batches: ${error.message || 'Unknown error'}`,
      );
      this.internalBatches.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  // =============================================================================
  // EXPIRY STATUS LOGIC
  // =============================================================================

  /**
   * Calculate expiry status for a batch
   */
  getExpiryStatus(batch: BatchInfo): ExpiryStatus {
    const now = new Date();
    const expiry = new Date(batch.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= this.expiryCriticalDays()) return 'critical';
    if (daysUntilExpiry <= this.expiryWarningDays()) return 'warning';
    return 'safe';
  }

  /**
   * Get badge text for expiry status
   */
  getExpiryBadgeText(batch: BatchInfo): string {
    const status = this.getExpiryStatus(batch);
    const now = new Date();
    const expiry = new Date(batch.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    switch (status) {
      case 'expired':
        return `EXPIRED ${Math.abs(daysUntilExpiry)} days ago`;
      case 'critical':
        return `${daysUntilExpiry} days left`;
      case 'warning':
        return `${daysUntilExpiry} days left`;
      case 'safe':
        return `Expires in ${daysUntilExpiry} days`;
    }
  }

  /**
   * Get CSS class for expiry badge
   */
  getExpiryBadgeClass(batch: BatchInfo): string {
    const status = this.getExpiryStatus(batch);
    return `expiry-badge--${status}`;
  }

  /**
   * Check if batch is expired
   */
  isExpired(batch: BatchInfo): boolean {
    return this.getExpiryStatus(batch) === 'expired';
  }

  /**
   * Check if batch can be selected
   */
  canSelectBatch(batch: BatchInfo): boolean {
    return batch.status === 'available' && !this.isExpired(batch);
  }

  // =============================================================================
  // SELECTION LOGIC
  // =============================================================================

  /**
   * Select or update a batch
   */
  selectBatch(batch: BatchInfo, quantity?: number) {
    if (!this.canSelectBatch(batch)) {
      this.error.emit(
        `Cannot select batch ${batch.batchNumber}: ${batch.status}`,
      );
      return;
    }

    const selected = this.selectedBatches();

    if (this.allowMultiple()) {
      // Multi-select mode
      const existing = selected.find(
        (s) => s.batch.batchNumber === batch.batchNumber,
      );

      if (existing) {
        // Update quantity for existing selection
        const newSelected = selected.map((s) =>
          s.batch.batchNumber === batch.batchNumber
            ? { ...s, quantity: quantity || s.quantity }
            : s,
        );
        this.selectedBatches.set(newSelected);
      } else {
        // Add new batch
        const defaultQty =
          quantity ||
          Math.min(
            batch.availableQuantity,
            (this.requestedQuantity() || batch.availableQuantity) -
              this.totalSelectedQuantity(),
          );

        this.selectedBatches.set([
          ...selected,
          { batch, quantity: defaultQty },
        ]);
      }
    } else {
      // Single-select mode
      this.selectedBatches.set([
        { batch, quantity: quantity || batch.availableQuantity },
      ]);
    }

    this.emitSelection();
  }

  /**
   * Deselect a batch
   */
  deselectBatch(batchNumber: string) {
    const selected = this.selectedBatches().filter(
      (s) => s.batch.batchNumber !== batchNumber,
    );
    this.selectedBatches.set(selected);
    this.emitSelection();
  }

  /**
   * Toggle batch selection (for checkbox/radio)
   */
  toggleBatch(batch: BatchInfo) {
    if (this.isSelected(batch)) {
      this.deselectBatch(batch.batchNumber);
    } else {
      this.selectBatch(batch);
    }
  }

  /**
   * Check if batch is selected
   */
  isSelected(batch: BatchInfo): boolean {
    return this.selectedBatches().some(
      (s) => s.batch.batchNumber === batch.batchNumber,
    );
  }

  /**
   * Get selected quantity for a batch
   */
  getSelectedQuantity(batch: BatchInfo): number {
    const selected = this.selectedBatches().find(
      (s) => s.batch.batchNumber === batch.batchNumber,
    );
    return selected?.quantity || 0;
  }

  /**
   * Update quantity for a selected batch
   */
  updateBatchQuantity(batch: BatchInfo, quantity: number) {
    const selected = this.selectedBatches().map((s) =>
      s.batch.batchNumber === batch.batchNumber ? { ...s, quantity } : s,
    );
    this.selectedBatches.set(selected);
    this.emitSelection();
  }

  /**
   * Emit selection event
   */
  private emitSelection() {
    const selection: BatchSelection = {
      batches: this.selectedBatches(),
      totalQuantity: this.totalSelectedQuantity(),
      strategy: this.strategy(),
    };
    this.select.emit(selection);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Clear all selections
   */
  clearSelection() {
    this.selectedBatches.set([]);
    this.emitSelection();
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
