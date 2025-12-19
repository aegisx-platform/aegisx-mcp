import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  ProductVariant,
  VariantSelection,
  AttributeFilterEvent,
  StockBadgeType,
  VariantLayoutMode,
  QuickViewData,
} from './ax-variant-selector.component.types';

/**
 * Product Variant Selector Component - Priority 2 Phase 8
 *
 * Features:
 * - Multi-dimensional variant selection (size, color, style)
 * - Multiple layout modes (grid, list, compact)
 * - Stock availability display per variant
 * - Image thumbnails for variants
 * - Search and filter by attributes
 * - Multi-select mode with quantities
 * - Quick view details modal
 * - Responsive design for mobile and desktop
 *
 * @example
 * ```html
 * <ax-variant-selector
 *   [productId]="'PROD-001'"
 *   [variants]="productVariants"
 *   [(layout)]="selectedLayout"
 *   [allowMultiple]="true"
 *   [showStock]="true"
 *   [showPrice]="true"
 *   (onVariantSelect)="handleSelection($event)"
 * />
 * ```
 */
@Component({
  selector: 'ax-variant-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatRadioModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './ax-variant-selector.component.html',
  styleUrls: ['./ax-variant-selector.component.scss'],
})
export class AxVariantSelectorComponent {
  // Expose Math for template use
  protected readonly Math = Math;

  // =============================================================================
  // INPUTS
  // =============================================================================

  /** Base product ID */
  productId = input.required<string>();

  /** Available product variants */
  variants = input.required<ProductVariant[]>();

  /** Attribute dimensions to display (e.g., ['size', 'color']) */
  attributes = input<string[]>([]);

  /** Display layout mode (supports two-way binding) */
  layout = model<VariantLayoutMode>('grid');

  /** Show variant images */
  showImages = input<boolean>(true);

  /** Show stock levels */
  showStock = input<boolean>(true);

  /** Show price differences */
  showPrice = input<boolean>(true);

  /** Allow selecting multiple variants */
  allowMultiple = input<boolean>(false);

  /** Low stock threshold for warning badge */
  lowStockThreshold = input<number>(10);

  /** Enable quick view modal */
  enableQuickView = input<boolean>(true);

  /** Show attribute filter chips */
  showAttributeFilters = input<boolean>(true);

  /** Enable search functionality */
  enableSearch = input<boolean>(true);

  // =============================================================================
  // OUTPUTS
  // =============================================================================

  /** Emitted when variant selection changes */
  onVariantSelect = output<VariantSelection>();

  /** Emitted when attribute filter is applied */
  onAttributeFilter = output<AttributeFilterEvent>();

  // =============================================================================
  // INTERNAL STATE
  // =============================================================================

  /** Selected variants with quantities */
  private selectedVariants = signal<Map<string, number>>(new Map());

  /** Search filter term */
  searchTerm = signal<string>('');

  /** Active attribute filters */
  protected attributeFilters = signal<Map<string, string>>(new Map());

  /** Quick view modal data */
  quickViewData = signal<QuickViewData | null>(null);

  /** Table columns for list layout */
  readonly displayedColumns = [
    'select',
    'image',
    'name',
    'attributes',
    'price',
    'stock',
    'actions',
  ];

  // =============================================================================
  // COMPUTED SIGNALS
  // =============================================================================

  /**
   * Filtered variants based on search and attribute filters
   */
  filteredVariants = computed(() => {
    let variants = this.variants();
    const search = this.searchTerm().toLowerCase();
    const filters = this.attributeFilters();

    // Apply search filter
    if (search) {
      variants = variants.filter(
        (v) =>
          v.name.toLowerCase().includes(search) ||
          v.sku.toLowerCase().includes(search) ||
          Object.values(v.attributes).some((val) =>
            String(val).toLowerCase().includes(search),
          ),
      );
    }

    // Apply attribute filters
    if (filters.size > 0) {
      variants = variants.filter((v) =>
        Array.from(filters.entries()).every(
          ([attr, value]) => v.attributes[attr] === value,
        ),
      );
    }

    return variants;
  });

  /**
   * Available attributes from variants
   * Auto-detected if not explicitly provided
   */
  availableAttributes = computed(() => {
    const attrs = this.attributes();
    if (attrs.length > 0) return attrs;

    // Auto-detect from variants
    const variants = this.variants();
    const allAttrs = new Set<string>();
    variants.forEach((v) => {
      Object.keys(v.attributes).forEach((attr) => allAttrs.add(attr));
    });
    return Array.from(allAttrs);
  });

  /**
   * Available values for each attribute
   */
  attributeValues = computed(() => {
    const variants = this.variants();
    const attributes = this.availableAttributes();
    const valueMap = new Map<string, Set<string>>();

    attributes.forEach((attr) => {
      valueMap.set(attr, new Set());
    });

    variants.forEach((variant) => {
      attributes.forEach((attr) => {
        if (variant.attributes[attr]) {
          valueMap.get(attr)?.add(variant.attributes[attr]);
        }
      });
    });

    // Convert Sets to sorted arrays
    const result = new Map<string, string[]>();
    valueMap.forEach((values, attr) => {
      result.set(attr, Array.from(values).sort());
    });

    return result;
  });

  /**
   * Total quantity of selected variants
   */
  totalSelectedQuantity = computed(() => {
    let total = 0;
    this.selectedVariants().forEach((qty) => {
      total += qty;
    });
    return total;
  });

  /**
   * Number of selected variants
   */
  selectedCount = computed(() => {
    return this.selectedVariants().size;
  });

  /**
   * Check if any variants are selected
   */
  hasSelection = computed(() => {
    return this.selectedCount() > 0;
  });

  // =============================================================================
  // STOCK BADGE LOGIC
  // =============================================================================

  /**
   * Get stock badge type for variant
   */
  getStockBadgeType(variant: ProductVariant): StockBadgeType {
    if (!variant.available || variant.stockLevel === 0) {
      return 'error';
    }
    if (variant.stockLevel <= this.lowStockThreshold()) {
      return 'warning';
    }
    return 'success';
  }

  /**
   * Get stock badge text
   */
  getStockBadgeText(variant: ProductVariant): string {
    if (!variant.available || variant.stockLevel === 0) {
      return 'Out of Stock';
    }
    if (variant.stockLevel <= this.lowStockThreshold()) {
      return `Low Stock (${variant.stockLevel})`;
    }
    return `In Stock (${variant.stockLevel})`;
  }

  /**
   * Get stock badge CSS class
   */
  getStockBadgeClass(variant: ProductVariant): string {
    const type = this.getStockBadgeType(variant);
    return `stock-badge--${type}`;
  }

  /**
   * Check if variant can be selected
   */
  canSelectVariant(variant: ProductVariant): boolean {
    return variant.available && variant.stockLevel > 0;
  }

  // =============================================================================
  // SELECTION LOGIC
  // =============================================================================

  /**
   * Toggle variant selection
   */
  toggleVariant(variant: ProductVariant) {
    if (!this.canSelectVariant(variant)) {
      return;
    }

    const selected = new Map(this.selectedVariants());

    if (this.allowMultiple()) {
      // Multi-select mode
      if (selected.has(variant.sku)) {
        selected.delete(variant.sku);
      } else {
        selected.set(variant.sku, 1); // Default quantity: 1
      }
    } else {
      // Single-select mode
      selected.clear();
      selected.set(variant.sku, 1);
    }

    this.selectedVariants.set(selected);
    this.emitSelection();
  }

  /**
   * Update quantity for selected variant
   */
  updateVariantQuantity(sku: string, quantity: number) {
    const selected = new Map(this.selectedVariants());

    if (quantity <= 0) {
      selected.delete(sku);
    } else {
      const variant = this.variants().find((v) => v.sku === sku);
      if (variant) {
        const maxQty = variant.stockLevel;
        const validQty = Math.min(quantity, maxQty);
        selected.set(sku, validQty);
      }
    }

    this.selectedVariants.set(selected);
    this.emitSelection();
  }

  /**
   * Check if variant is selected
   */
  isSelected(variant: ProductVariant): boolean {
    return this.selectedVariants().has(variant.sku);
  }

  /**
   * Get selected quantity for variant
   */
  getSelectedQuantity(variant: ProductVariant): number {
    return this.selectedVariants().get(variant.sku) || 0;
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    this.selectedVariants.set(new Map());
    this.emitSelection();
  }

  /**
   * Emit selection event
   */
  private emitSelection() {
    const variants = this.variants();
    const selection: VariantSelection = {
      variants: Array.from(this.selectedVariants().entries()).map(
        ([sku, quantity]) => ({
          variant: variants.find((v) => v.sku === sku)!,
          quantity,
        }),
      ),
    };
    this.onVariantSelect.emit(selection);
  }

  // =============================================================================
  // FILTER LOGIC
  // =============================================================================

  /**
   * Apply attribute filter
   */
  applyAttributeFilter(attribute: string, value: string) {
    const filters = new Map(this.attributeFilters());

    if (filters.get(attribute) === value) {
      // Toggle off if same value clicked
      filters.delete(attribute);
    } else {
      filters.set(attribute, value);
    }

    this.attributeFilters.set(filters);
    this.onAttributeFilter.emit({ attribute, value });
  }

  /**
   * Check if attribute filter is active
   */
  isAttributeFilterActive(attribute: string, value: string): boolean {
    return this.attributeFilters().get(attribute) === value;
  }

  /**
   * Get active filter for attribute
   */
  getActiveFilter(attribute: string): string | undefined {
    return this.attributeFilters().get(attribute);
  }

  /**
   * Clear all attribute filters
   */
  clearAttributeFilters() {
    this.attributeFilters.set(new Map());
  }

  /**
   * Clear search term
   */
  clearSearch() {
    this.searchTerm.set('');
  }

  // =============================================================================
  // QUICK VIEW LOGIC
  // =============================================================================

  /**
   * Open quick view modal
   */
  openQuickView(variant: ProductVariant) {
    if (!this.enableQuickView()) return;

    this.quickViewData.set({
      variant,
      isOpen: true,
    });
  }

  /**
   * Close quick view modal
   */
  closeQuickView() {
    this.quickViewData.set(null);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Format attribute key for display
   */
  formatAttributeKey(key: string): string {
    return key
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  /**
   * Get attribute display string
   */
  getAttributeDisplay(variant: ProductVariant): string {
    const attrs = this.availableAttributes();
    return attrs
      .map((attr) => variant.attributes[attr])
      .filter(Boolean)
      .join(' / ');
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByVariantSku(index: number, variant: ProductVariant): string {
    return variant.sku;
  }
}
