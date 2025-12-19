import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AxBatchSelectorComponent } from './ax-batch-selector.component';
import {
  BatchInfo,
  BatchSelection,
  ExpiryStatus,
} from './ax-batch-selector.component.types';

describe('AxBatchSelectorComponent - Priority 1 Tests', () => {
  let component: AxBatchSelectorComponent;
  let fixture: ComponentFixture<AxBatchSelectorComponent>;
  let httpMock: HttpTestingController;

  // Mock batch data
  const createMockBatch = (
    batchNumber: string,
    expiryDate: Date,
    manufacturingDate?: Date,
    availableQuantity = 100,
    status: 'available' | 'reserved' | 'expired' | 'quarantine' = 'available',
  ): BatchInfo => ({
    batchNumber,
    expiryDate,
    manufacturingDate,
    availableQuantity,
    unit: 'pieces',
    status,
    location: 'WAREHOUSE-01',
  });

  const mockBatch1 = createMockBatch(
    'BATCH-2024-001',
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    new Date('2024-01-10'),
  );

  const mockBatch2 = createMockBatch(
    'BATCH-2024-002',
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    new Date('2024-02-15'),
  );

  const mockBatch3 = createMockBatch(
    'BATCH-2023-099',
    new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), // 17 days ago (expired)
    new Date('2023-11-01'),
    50,
    'expired',
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AxBatchSelectorComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AxBatchSelectorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // =============================================================================
  // BASIC TESTS
  // =============================================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // =============================================================================
  // BATCH SORTING STRATEGIES
  // =============================================================================

  describe('Batch Sorting Strategies', () => {
    beforeEach(() => {
      component['internalBatches'].set([mockBatch1, mockBatch2, mockBatch3]);
    });

    it('should sort batches by FEFO (First Expired First Out)', () => {
      component.strategy.set('fefo');
      const sorted = component.sortedBatches();

      expect(sorted[0].batchNumber).toBe('BATCH-2023-099'); // Earliest expiry (expired)
      expect(sorted[1].batchNumber).toBe('BATCH-2024-002'); // 15 days
      expect(sorted[2].batchNumber).toBe('BATCH-2024-001'); // 60 days
    });

    it('should sort batches by FIFO (First In First Out)', () => {
      component.strategy.set('fifo');
      const sorted = component.sortedBatches();

      expect(sorted[0].batchNumber).toBe('BATCH-2023-099'); // Oldest manufacturing date
      expect(sorted[1].batchNumber).toBe('BATCH-2024-001'); // Second oldest
      expect(sorted[2].batchNumber).toBe('BATCH-2024-002'); // Newest
    });

    it('should sort batches by LIFO (Last In First Out)', () => {
      component.strategy.set('lifo');
      const sorted = component.sortedBatches();

      expect(sorted[0].batchNumber).toBe('BATCH-2024-002'); // Newest manufacturing date
      expect(sorted[1].batchNumber).toBe('BATCH-2024-001'); // Second newest
      expect(sorted[2].batchNumber).toBe('BATCH-2023-099'); // Oldest
    });
  });

  // =============================================================================
  // EXPIRY STATUS LOGIC
  // =============================================================================

  describe('Expiry Status Logic', () => {
    it('should identify safe batches (>30 days)', () => {
      const safeBatch = createMockBatch(
        'SAFE-BATCH',
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      );
      expect(component.getExpiryStatus(safeBatch)).toBe('safe');
    });

    it('should identify warning batches (7-30 days)', () => {
      const warningBatch = createMockBatch(
        'WARNING-BATCH',
        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      );
      expect(component.getExpiryStatus(warningBatch)).toBe('warning');
    });

    it('should identify critical batches (<7 days)', () => {
      const criticalBatch = createMockBatch(
        'CRITICAL-BATCH',
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      );
      expect(component.getExpiryStatus(criticalBatch)).toBe('critical');
    });

    it('should identify expired batches', () => {
      const expiredBatch = createMockBatch(
        'EXPIRED-BATCH',
        new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      );
      expect(component.getExpiryStatus(expiredBatch)).toBe('expired');
    });

    it('should generate correct badge text for expired batch', () => {
      const expiredBatch = createMockBatch(
        'EXPIRED-BATCH',
        new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      );
      const badgeText = component.getExpiryBadgeText(expiredBatch);
      expect(badgeText).toContain('EXPIRED');
      expect(badgeText).toContain('17 days ago');
    });

    it('should generate correct badge text for critical batch', () => {
      const criticalBatch = createMockBatch(
        'CRITICAL-BATCH',
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      );
      const badgeText = component.getExpiryBadgeText(criticalBatch);
      expect(badgeText).toContain('5 days left');
    });

    it('should return correct CSS class for expiry status', () => {
      const safeBatch = createMockBatch(
        'SAFE-BATCH',
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      );
      expect(component.getExpiryBadgeClass(safeBatch)).toBe(
        'expiry-badge--safe',
      );

      const expiredBatch = createMockBatch(
        'EXPIRED-BATCH',
        new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      );
      expect(component.getExpiryBadgeClass(expiredBatch)).toBe(
        'expiry-badge--expired',
      );
    });
  });

  // =============================================================================
  // BATCH SELECTION LOGIC
  // =============================================================================

  describe('Batch Selection Logic - Single Select', () => {
    beforeEach(() => {
      component['internalBatches'].set([mockBatch1, mockBatch2]);
      fixture.componentRef.setInput('allowMultiple', false);
    });

    it('should select a single batch', () => {
      component.selectBatch(mockBatch1);
      expect(component['selectedBatches']().length).toBe(1);
      expect(component['selectedBatches']()[0].batch.batchNumber).toBe(
        'BATCH-2024-001',
      );
    });

    it('should replace selection when selecting another batch', () => {
      component.selectBatch(mockBatch1);
      component.selectBatch(mockBatch2);

      expect(component['selectedBatches']().length).toBe(1);
      expect(component['selectedBatches']()[0].batch.batchNumber).toBe(
        'BATCH-2024-002',
      );
    });

    it('should check if batch is selected', () => {
      component.selectBatch(mockBatch1);
      expect(component.isSelected(mockBatch1)).toBe(true);
      expect(component.isSelected(mockBatch2)).toBe(false);
    });
  });

  describe('Batch Selection Logic - Multi Select', () => {
    beforeEach(() => {
      component['internalBatches'].set([mockBatch1, mockBatch2]);
      fixture.componentRef.setInput('allowMultiple', true);
    });

    it('should select multiple batches', () => {
      component.selectBatch(mockBatch1);
      component.selectBatch(mockBatch2);

      expect(component['selectedBatches']().length).toBe(2);
    });

    it('should calculate total selected quantity', () => {
      component.selectBatch(mockBatch1, 50);
      component.selectBatch(mockBatch2, 75);

      expect(component.totalSelectedQuantity()).toBe(125);
    });

    it('should update batch quantity', () => {
      component.selectBatch(mockBatch1, 50);
      component.updateBatchQuantity(mockBatch1, 80);

      expect(component.getSelectedQuantity(mockBatch1)).toBe(80);
    });

    it('should deselect batch', () => {
      component.selectBatch(mockBatch1);
      component.selectBatch(mockBatch2);

      component.deselectBatch('BATCH-2024-001');
      expect(component['selectedBatches']().length).toBe(1);
      expect(component.isSelected(mockBatch1)).toBe(false);
    });

    it('should toggle batch selection', () => {
      component.toggleBatch(mockBatch1);
      expect(component.isSelected(mockBatch1)).toBe(true);

      component.toggleBatch(mockBatch1);
      expect(component.isSelected(mockBatch1)).toBe(false);
    });
  });

  describe('Batch Selection - Quantity Management', () => {
    beforeEach(() => {
      component['internalBatches'].set([mockBatch1, mockBatch2]);
      fixture.componentRef.setInput('allowMultiple', true);
      fixture.componentRef.setInput('requestedQuantity', 150);
    });

    it('should auto-calculate quantity based on requested quantity', () => {
      component.selectBatch(mockBatch1);

      const selectedQty = component.getSelectedQuantity(mockBatch1);
      expect(selectedQty).toBe(100); // Batch has 100 available
    });

    it('should limit selection based on requested quantity', () => {
      component.selectBatch(mockBatch1, 100);
      component.selectBatch(mockBatch2, 100);

      expect(component.totalSelectedQuantity()).toBe(200);
      expect(component.canSelectMore()).toBe(false);
    });
  });

  // =============================================================================
  // BATCH FILTERING & SEARCH
  // =============================================================================

  describe('Batch Filtering & Search', () => {
    beforeEach(() => {
      component['internalBatches'].set([mockBatch1, mockBatch2, mockBatch3]);
    });

    it('should filter batches by batch number', () => {
      component.searchTerm.set('2024-001');
      const filtered = component.filteredBatches();

      expect(filtered.length).toBe(1);
      expect(filtered[0].batchNumber).toBe('BATCH-2024-001');
    });

    it('should filter batches by lot number', () => {
      const batchWithLot = createMockBatch(
        'BATCH-001',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      );
      batchWithLot.lotNumber = 'LOT-ABC-123';
      component['internalBatches'].set([batchWithLot]);

      component.searchTerm.set('ABC');
      const filtered = component.filteredBatches();

      expect(filtered.length).toBe(1);
      expect(filtered[0].lotNumber).toContain('ABC');
    });

    it('should return all batches when search is empty', () => {
      component.searchTerm.set('');
      const filtered = component.filteredBatches();

      expect(filtered.length).toBe(3);
    });
  });

  // =============================================================================
  // RECOMMENDED BATCH
  // =============================================================================

  describe('Recommended Batch Logic', () => {
    it('should recommend first available batch by strategy', () => {
      component['internalBatches'].set([mockBatch1, mockBatch2]);
      component.strategy.set('fefo');

      const recommended = component.recommendedBatchId();
      expect(recommended).toBe('BATCH-2024-002'); // Earliest expiry
    });

    it('should not recommend expired batches', () => {
      component['internalBatches'].set([mockBatch3]);

      const recommended = component.recommendedBatchId();
      expect(recommended).toBeNull();
    });

    it('should return null when showRecommendation is false', () => {
      component['internalBatches'].set([mockBatch1, mockBatch2]);
      fixture.componentRef.setInput('showRecommendation', false);

      const recommended = component.recommendedBatchId();
      expect(recommended).toBeNull();
    });
  });

  // =============================================================================
  // API INTEGRATION
  // =============================================================================

  describe('API Integration', () => {
    it('should load batches from API on init', fakeAsync(() => {
      fixture.componentRef.setInput('productId', 'PROD-001');
      fixture.componentRef.setInput('batches', []);

      component.ngOnInit();
      tick();

      const req = httpMock.expectOne(
        '/api/inventory/products/PROD-001/batches?status=available',
      );
      expect(req.request.method).toBe('GET');

      req.flush({
        batches: [mockBatch1, mockBatch2],
        strategy: 'fefo',
      });
      tick();

      expect(component['internalBatches']().length).toBe(2);
      expect(component.strategy()).toBe('fefo');
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      fixture.componentRef.setInput('productId', 'PROD-001');
      fixture.componentRef.setInput('batches', []);

      let emittedError: string | undefined;
      component.onError.subscribe((error) => {
        emittedError = error;
      });

      component.ngOnInit();
      tick();

      const req = httpMock.expectOne(
        '/api/inventory/products/PROD-001/batches?status=available',
      );
      req.error(new ErrorEvent('Network error'));
      tick();

      expect(emittedError).toContain('Failed to load batches');
      expect(component['internalBatches']().length).toBe(0);
    }));

    it('should use provided batches instead of loading from API', () => {
      fixture.componentRef.setInput('productId', 'PROD-001');
      fixture.componentRef.setInput('batches', [mockBatch1, mockBatch2]);

      component.ngOnInit();

      httpMock.expectNone(
        '/api/inventory/products/PROD-001/batches?status=available',
      );
      expect(component['internalBatches']().length).toBe(2);
    });
  });

  // =============================================================================
  // EVENTS
  // =============================================================================

  describe('Event Emissions', () => {
    beforeEach(() => {
      component['internalBatches'].set([mockBatch1, mockBatch2]);
    });

    it('should emit onSelect when batch is selected', (done) => {
      component.onSelect.subscribe((selection: BatchSelection) => {
        expect(selection.batches.length).toBe(1);
        expect(selection.totalQuantity).toBe(100);
        expect(selection.strategy).toBe('fefo');
        done();
      });

      component.selectBatch(mockBatch1);
    });

    it('should emit onBatchesLoad when batches are loaded from API', (done) => {
      fixture.componentRef.setInput('productId', 'PROD-001');
      fixture.componentRef.setInput('batches', []);

      component.onBatchesLoad.subscribe((batches: BatchInfo[]) => {
        expect(batches.length).toBe(2);
        done();
      });

      component.ngOnInit();

      const req = httpMock.expectOne(
        '/api/inventory/products/PROD-001/batches?status=available',
      );
      req.flush({
        batches: [mockBatch1, mockBatch2],
      });
    });
  });

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  describe('Utility Methods', () => {
    it('should clear all selections', () => {
      component['selectedBatches'].set([
        { batch: mockBatch1, quantity: 50 },
        { batch: mockBatch2, quantity: 75 },
      ]);

      component.clearSelection();
      expect(component['selectedBatches']().length).toBe(0);
    });

    it('should format dates correctly', () => {
      const date = new Date('2024-12-25');
      const formatted = component.formatDate(date);
      expect(formatted).toBeTruthy();
      expect(formatted).not.toBe('N/A');
    });

    it('should handle undefined dates', () => {
      const formatted = component.formatDate(undefined);
      expect(formatted).toBe('N/A');
    });

    it('should check if batch can be selected', () => {
      expect(component.canSelectBatch(mockBatch1)).toBe(true);
      expect(component.canSelectBatch(mockBatch3)).toBe(false); // Expired
    });
  });

  // =============================================================================
  // EDGE CASES
  // =============================================================================

  describe('Edge Cases', () => {
    it('should handle empty batch list', () => {
      component['internalBatches'].set([]);
      expect(component.filteredBatches().length).toBe(0);
      expect(component.recommendedBatchId()).toBeNull();
    });

    it('should prevent selecting expired batches', () => {
      let errorEmitted: string | undefined;
      component.onError.subscribe((error) => {
        errorEmitted = error;
      });

      component.selectBatch(mockBatch3); // Expired batch

      expect(errorEmitted).toContain('Cannot select batch');
      expect(component['selectedBatches']().length).toBe(0);
    });

    it('should handle batches without manufacturing date in FIFO', () => {
      const batchNoMfg = createMockBatch(
        'NO-MFG',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      );
      delete batchNoMfg.manufacturingDate;

      component['internalBatches'].set([mockBatch1, batchNoMfg]);
      component.strategy.set('fifo');

      const sorted = component.sortedBatches();
      expect(sorted).toBeDefined();
      expect(sorted.length).toBe(2);
    });
  });
});
