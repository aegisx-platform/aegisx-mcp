import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AxVariantSelectorComponent } from './ax-variant-selector.component';
import {
  ProductVariant,
  VariantSelection,
} from './ax-variant-selector.component.types';

describe('AxVariantSelectorComponent', () => {
  let component: AxVariantSelectorComponent;
  let fixture: ComponentFixture<AxVariantSelectorComponent>;

  const mockVariants: ProductVariant[] = [
    {
      sku: 'VAR-001',
      name: 'Blue T-Shirt Medium',
      attributes: { color: 'Blue', size: 'M' },
      price: 29.99,
      stockLevel: 50,
      available: true,
      imageUrl: 'https://example.com/blue-m.jpg',
    },
    {
      sku: 'VAR-002',
      name: 'Red T-Shirt Large',
      attributes: { color: 'Red', size: 'L' },
      price: 29.99,
      stockLevel: 8, // Low stock
      available: true,
      imageUrl: 'https://example.com/red-l.jpg',
    },
    {
      sku: 'VAR-003',
      name: 'Green T-Shirt Small',
      attributes: { color: 'Green', size: 'S' },
      price: 32.99,
      stockLevel: 0,
      available: false,
    },
    {
      sku: 'VAR-004',
      name: 'Yellow T-Shirt XL',
      attributes: { color: 'Yellow', size: 'XL' },
      price: 34.99,
      stockLevel: 100,
      available: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AxVariantSelectorComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AxVariantSelectorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('productId', 'PROD-001');
    fixture.componentRef.setInput('variants', mockVariants);
    fixture.detectChanges();
  });

  // =============================================================================
  // COMPONENT INITIALIZATION
  // =============================================================================

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with required inputs', () => {
      expect(component.productId()).toBe('PROD-001');
      expect(component.variants()).toEqual(mockVariants);
    });

    it('should initialize with default values', () => {
      expect(component.layout()).toBe('grid');
      expect(component.showImages()).toBe(true);
      expect(component.showStock()).toBe(true);
      expect(component.showPrice()).toBe(true);
      expect(component.allowMultiple()).toBe(false);
      expect(component.lowStockThreshold()).toBe(10);
      expect(component.enableQuickView()).toBe(true);
      expect(component.showAttributeFilters()).toBe(true);
      expect(component.enableSearch()).toBe(true);
    });
  });

  // =============================================================================
  // COMPUTED SIGNALS
  // =============================================================================

  describe('Computed Signals', () => {
    it('should compute filteredVariants correctly', () => {
      const filtered = component.filteredVariants();
      expect(filtered.length).toBe(4);
      expect(filtered).toEqual(mockVariants);
    });

    it('should filter variants by search term', () => {
      component.searchTerm.set('blue');
      const filtered = component.filteredVariants();
      expect(filtered.length).toBe(1);
      expect(filtered[0].sku).toBe('VAR-001');
    });

    it('should filter variants by SKU', () => {
      component.searchTerm.set('VAR-002');
      const filtered = component.filteredVariants();
      expect(filtered.length).toBe(1);
      expect(filtered[0].sku).toBe('VAR-002');
    });

    it('should filter variants by attribute value', () => {
      component.searchTerm.set('Large');
      const filtered = component.filteredVariants();
      expect(filtered.length).toBe(1);
      expect(filtered[0].attributes['size']).toBe('L');
    });

    it('should auto-detect available attributes', () => {
      const attrs = component.availableAttributes();
      expect(attrs).toContain('color');
      expect(attrs).toContain('size');
    });

    it('should use explicit attributes if provided', () => {
      fixture.componentRef.setInput('attributes', ['color']);
      fixture.detectChanges();
      const attrs = component.availableAttributes();
      expect(attrs).toEqual(['color']);
    });

    it('should compute attribute values correctly', () => {
      const attrValues = component.attributeValues();
      const colors = attrValues.get('color');
      const sizes = attrValues.get('size');

      expect(colors).toContain('Blue');
      expect(colors).toContain('Red');
      expect(colors).toContain('Green');
      expect(colors).toContain('Yellow');

      expect(sizes).toContain('S');
      expect(sizes).toContain('M');
      expect(sizes).toContain('L');
      expect(sizes).toContain('XL');
    });

    it('should calculate totalSelectedQuantity correctly', () => {
      fixture.componentRef.setInput('allowMultiple', true);
      fixture.detectChanges();

      component.toggleVariant(mockVariants[0]);
      component.updateVariantQuantity('VAR-001', 5);
      component.toggleVariant(mockVariants[1]);
      component.updateVariantQuantity('VAR-002', 3);

      expect(component.totalSelectedQuantity()).toBe(8);
    });

    it('should calculate selectedCount correctly', () => {
      fixture.componentRef.setInput('allowMultiple', true);
      fixture.detectChanges();

      component.toggleVariant(mockVariants[0]);
      component.toggleVariant(mockVariants[1]);

      expect(component.selectedCount()).toBe(2);
    });

    it('should compute hasSelection correctly', () => {
      expect(component.hasSelection()).toBe(false);

      component.toggleVariant(mockVariants[0]);
      expect(component.hasSelection()).toBe(true);
    });
  });

  // =============================================================================
  // STOCK BADGE LOGIC
  // =============================================================================

  describe('Stock Badge Logic', () => {
    it('should return success badge for high stock', () => {
      const variant = mockVariants[0]; // stockLevel: 50
      expect(component.getStockBadgeType(variant)).toBe('success');
      expect(component.getStockBadgeText(variant)).toContain('In Stock');
      expect(component.getStockBadgeClass(variant)).toBe(
        'stock-badge--success',
      );
    });

    it('should return warning badge for low stock', () => {
      const variant = mockVariants[1]; // stockLevel: 8
      expect(component.getStockBadgeType(variant)).toBe('warning');
      expect(component.getStockBadgeText(variant)).toContain('Low Stock');
      expect(component.getStockBadgeClass(variant)).toBe(
        'stock-badge--warning',
      );
    });

    it('should return error badge for out of stock', () => {
      const variant = mockVariants[2]; // stockLevel: 0
      expect(component.getStockBadgeType(variant)).toBe('error');
      expect(component.getStockBadgeText(variant)).toContain('Out of Stock');
      expect(component.getStockBadgeClass(variant)).toBe('stock-badge--error');
    });

    it('should check if variant can be selected', () => {
      expect(component.canSelectVariant(mockVariants[0])).toBe(true);
      expect(component.canSelectVariant(mockVariants[2])).toBe(false); // Out of stock
    });

    it('should respect custom low stock threshold', () => {
      fixture.componentRef.setInput('lowStockThreshold', 50);
      fixture.detectChanges();

      const variant = mockVariants[0]; // stockLevel: 50
      expect(component.getStockBadgeType(variant)).toBe('warning'); // Now considered low
    });
  });

  // =============================================================================
  // SELECTION LOGIC
  // =============================================================================

  describe('Selection Logic', () => {
    describe('Single-Select Mode', () => {
      it('should select a variant', () => {
        component.toggleVariant(mockVariants[0]);
        expect(component.isSelected(mockVariants[0])).toBe(true);
      });

      it('should emit selection event', (done) => {
        component.onVariantSelect.subscribe((selection: VariantSelection) => {
          expect(selection.variants.length).toBe(1);
          expect(selection.variants[0].variant.sku).toBe('VAR-001');
          expect(selection.variants[0].quantity).toBe(1);
          done();
        });

        component.toggleVariant(mockVariants[0]);
      });

      it('should replace selection when selecting another variant', () => {
        component.toggleVariant(mockVariants[0]);
        expect(component.isSelected(mockVariants[0])).toBe(true);

        component.toggleVariant(mockVariants[1]);
        expect(component.isSelected(mockVariants[0])).toBe(false);
        expect(component.isSelected(mockVariants[1])).toBe(true);
      });

      it('should keep variant selected when clicking it again in single-select', () => {
        component.toggleVariant(mockVariants[0]);
        expect(component.isSelected(mockVariants[0])).toBe(true);

        component.toggleVariant(mockVariants[0]);
        // In single-select mode, it clears and then re-adds the same variant
        expect(component.isSelected(mockVariants[0])).toBe(true);
        expect(component.selectedCount()).toBe(1);
      });

      it('should not select unavailable variant', () => {
        component.toggleVariant(mockVariants[2]); // Out of stock
        expect(component.isSelected(mockVariants[2])).toBe(false);
      });
    });

    describe('Multi-Select Mode', () => {
      beforeEach(() => {
        fixture.componentRef.setInput('allowMultiple', true);
        fixture.detectChanges();
      });

      it('should allow selecting multiple variants', () => {
        component.toggleVariant(mockVariants[0]);
        component.toggleVariant(mockVariants[1]);

        expect(component.isSelected(mockVariants[0])).toBe(true);
        expect(component.isSelected(mockVariants[1])).toBe(true);
        expect(component.selectedCount()).toBe(2);
      });

      it('should update variant quantity', () => {
        component.toggleVariant(mockVariants[0]);
        component.updateVariantQuantity('VAR-001', 5);

        expect(component.getSelectedQuantity(mockVariants[0])).toBe(5);
      });

      it('should limit quantity to stock level', () => {
        component.toggleVariant(mockVariants[1]); // stockLevel: 8
        component.updateVariantQuantity('VAR-002', 100);

        expect(component.getSelectedQuantity(mockVariants[1])).toBe(8); // Capped at stock level
      });

      it('should deselect variant when quantity set to 0', () => {
        component.toggleVariant(mockVariants[0]);
        expect(component.isSelected(mockVariants[0])).toBe(true);

        component.updateVariantQuantity('VAR-001', 0);
        expect(component.isSelected(mockVariants[0])).toBe(false);
      });

      it('should emit selection with quantities', (done) => {
        component.onVariantSelect.subscribe((selection: VariantSelection) => {
          if (selection.variants.length === 2) {
            expect(selection.variants[0].quantity).toBe(5);
            expect(selection.variants[1].quantity).toBe(3);
            done();
          }
        });

        component.toggleVariant(mockVariants[0]);
        component.updateVariantQuantity('VAR-001', 5);
        component.toggleVariant(mockVariants[1]);
        component.updateVariantQuantity('VAR-002', 3);
      });
    });

    it('should clear all selections', () => {
      fixture.componentRef.setInput('allowMultiple', true);
      fixture.detectChanges();

      component.toggleVariant(mockVariants[0]);
      component.toggleVariant(mockVariants[1]);
      expect(component.selectedCount()).toBe(2);

      component.clearSelection();
      expect(component.selectedCount()).toBe(0);
      expect(component.hasSelection()).toBe(false);
    });
  });

  // =============================================================================
  // FILTER LOGIC
  // =============================================================================

  describe('Filter Logic', () => {
    it('should apply attribute filter', () => {
      component.applyAttributeFilter('color', 'Blue');
      expect(component.isAttributeFilterActive('color', 'Blue')).toBe(true);

      const filtered = component.filteredVariants();
      expect(filtered.length).toBe(1);
      expect(filtered[0].attributes['color']).toBe('Blue');
    });

    it('should toggle attribute filter', () => {
      component.applyAttributeFilter('color', 'Blue');
      expect(component.isAttributeFilterActive('color', 'Blue')).toBe(true);

      component.applyAttributeFilter('color', 'Blue'); // Toggle off
      expect(component.isAttributeFilterActive('color', 'Blue')).toBe(false);

      const filtered = component.filteredVariants();
      expect(filtered.length).toBe(4); // All variants
    });

    it('should apply multiple attribute filters', () => {
      component.applyAttributeFilter('color', 'Red');
      component.applyAttributeFilter('size', 'L');

      const filtered = component.filteredVariants();
      expect(filtered.length).toBe(1);
      expect(filtered[0].sku).toBe('VAR-002');
    });

    it('should emit attribute filter event', (done) => {
      component.onAttributeFilter.subscribe((event) => {
        expect(event.attribute).toBe('color');
        expect(event.value).toBe('Blue');
        done();
      });

      component.applyAttributeFilter('color', 'Blue');
    });

    it('should get active filter for attribute', () => {
      component.applyAttributeFilter('color', 'Red');
      expect(component.getActiveFilter('color')).toBe('Red');
      expect(component.getActiveFilter('size')).toBeUndefined();
    });

    it('should clear all attribute filters', () => {
      component.applyAttributeFilter('color', 'Blue');
      component.applyAttributeFilter('size', 'M');

      component.clearAttributeFilters();

      expect(component.isAttributeFilterActive('color', 'Blue')).toBe(false);
      expect(component.isAttributeFilterActive('size', 'M')).toBe(false);
    });

    it('should clear search term', () => {
      component.searchTerm.set('test');
      expect(component.searchTerm()).toBe('test');

      component.clearSearch();
      expect(component.searchTerm()).toBe('');
    });

    it('should combine search and attribute filters', () => {
      component.searchTerm.set('T-Shirt');
      component.applyAttributeFilter('color', 'Red');

      const filtered = component.filteredVariants();
      expect(filtered.length).toBe(1);
      expect(filtered[0].sku).toBe('VAR-002');
    });
  });

  // =============================================================================
  // QUICK VIEW LOGIC
  // =============================================================================

  describe('Quick View Logic', () => {
    it('should open quick view modal', () => {
      component.openQuickView(mockVariants[0]);

      const quickView = component.quickViewData();
      expect(quickView).not.toBeNull();
      expect(quickView?.variant.sku).toBe('VAR-001');
      expect(quickView?.isOpen).toBe(true);
    });

    it('should close quick view modal', () => {
      component.openQuickView(mockVariants[0]);
      expect(component.quickViewData()).not.toBeNull();

      component.closeQuickView();
      expect(component.quickViewData()).toBeNull();
    });

    it('should not open quick view if disabled', () => {
      fixture.componentRef.setInput('enableQuickView', false);
      fixture.detectChanges();

      component.openQuickView(mockVariants[0]);
      expect(component.quickViewData()).toBeNull();
    });
  });

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  describe('Utility Methods', () => {
    it('should format attribute key correctly', () => {
      expect(component.formatAttributeKey('color')).toBe('Color');
      expect(component.formatAttributeKey('product-size')).toBe('Product Size');
      expect(component.formatAttributeKey('item_type')).toBe('Item Type');
    });

    it('should format price correctly', () => {
      const formatted = component.formatPrice(29.99);
      expect(formatted).toContain('29.99');
      expect(formatted).toContain('$');
    });

    it('should get attribute display string', () => {
      const display = component.getAttributeDisplay(mockVariants[0]);
      expect(display).toContain('Blue');
      expect(display).toContain('M');
      expect(display).toContain('/');
    });

    it('should track variants by SKU', () => {
      const sku = component.trackByVariantSku(0, mockVariants[0]);
      expect(sku).toBe('VAR-001');
    });
  });

  // =============================================================================
  // EDGE CASES
  // =============================================================================

  describe('Edge Cases', () => {
    it('should handle empty variants array', () => {
      fixture.componentRef.setInput('variants', []);
      fixture.detectChanges();

      expect(component.filteredVariants().length).toBe(0);
      expect(component.availableAttributes().length).toBe(0);
    });

    it('should handle variants without attributes', () => {
      const variantsNoAttrs: ProductVariant[] = [
        {
          sku: 'SIMPLE-001',
          name: 'Simple Variant',
          attributes: {},
          price: 10,
          stockLevel: 5,
          available: true,
        },
      ];

      fixture.componentRef.setInput('variants', variantsNoAttrs);
      fixture.detectChanges();

      const display = component.getAttributeDisplay(variantsNoAttrs[0]);
      expect(display).toBe('');
    });

    it('should handle case-insensitive search', () => {
      component.searchTerm.set('BLUE');
      const filtered = component.filteredVariants();
      expect(filtered.length).toBe(1);
      expect(filtered[0].attributes['color']).toBe('Blue');
    });

    it('should handle negative quantity updates', () => {
      component.toggleVariant(mockVariants[0]);
      component.updateVariantQuantity('VAR-001', -5);

      expect(component.isSelected(mockVariants[0])).toBe(false);
    });

    it('should handle quantity updates for non-selected variants', () => {
      component.updateVariantQuantity('VAR-999', 10); // Non-existent variant
      expect(component.selectedCount()).toBe(0);
    });
  });

  // =============================================================================
  // INTEGRATION TESTS
  // =============================================================================

  describe('Integration Tests', () => {
    it('should handle complete workflow: search → filter → select → quantity', () => {
      fixture.componentRef.setInput('allowMultiple', true);
      fixture.detectChanges();

      // 1. Search for T-Shirts
      component.searchTerm.set('T-Shirt');
      expect(component.filteredVariants().length).toBe(4);

      // 2. Filter by color
      component.applyAttributeFilter('color', 'Blue');
      expect(component.filteredVariants().length).toBe(1);

      // 3. Select variant
      const variant = component.filteredVariants()[0];
      component.toggleVariant(variant);
      expect(component.isSelected(variant)).toBe(true);

      // 4. Update quantity
      component.updateVariantQuantity(variant.sku, 10);
      expect(component.getSelectedQuantity(variant)).toBe(10);
      expect(component.totalSelectedQuantity()).toBe(10);

      // 5. Clear filters (selection should persist)
      component.clearSearch();
      component.clearAttributeFilters();
      expect(component.isSelected(variant)).toBe(true);
    });
  });
});
