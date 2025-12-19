import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AxStockMovementTimelineComponent } from './ax-stock-movement-timeline.component';
import {
  MovementRecord,
  MovementFilter,
  MovementApiResponse,
  MOVEMENT_TYPE_CONFIGS,
} from './ax-stock-movement-timeline.component.types';

describe('AxStockMovementTimelineComponent', () => {
  let component: AxStockMovementTimelineComponent;
  let fixture: ComponentFixture<AxStockMovementTimelineComponent>;
  let httpMock: HttpTestingController;
  let compiled: DebugElement;

  const mockMovements: MovementRecord[] = [
    {
      id: '1',
      timestamp: new Date('2025-12-19T10:00:00Z'),
      type: 'receive',
      quantity: 100,
      balanceAfter: 150,
      unit: 'pieces',
      user: { id: 'user1', name: 'John Doe' },
      referenceDocument: { type: 'PO', number: 'PO-2025-001' },
      location: 'Warehouse A',
      batchNumber: 'BATCH-001',
      notes: 'Initial receipt',
    },
    {
      id: '2',
      timestamp: new Date('2025-12-19T14:30:00Z'),
      type: 'issue',
      quantity: 50,
      balanceAfter: 100,
      unit: 'pieces',
      user: { id: 'user2', name: 'Jane Smith' },
      referenceDocument: { type: 'SO', number: 'SO-2025-042' },
      batchNumber: 'BATCH-001',
    },
    {
      id: '3',
      timestamp: new Date('2025-12-18T16:45:00Z'),
      type: 'adjust-in',
      quantity: 25,
      balanceAfter: 50,
      unit: 'pieces',
      user: { id: 'user1', name: 'John Doe' },
      referenceDocument: { type: 'ADJ', number: 'ADJ-2025-012' },
      notes: 'Stock count adjustment',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AxStockMovementTimelineComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AxStockMovementTimelineComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    compiled = fixture.debugElement;

    // Set required inputs
    fixture.componentRef.setInput('productId', 'PROD-001');
  });

  afterEach(() => {
    httpMock.verify();
  });

  // =============================================================================
  // BASIC COMPONENT TESTS
  // =============================================================================

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default input values', () => {
      expect(component.groupBy()).toBe('none');
      expect(component.showBalance()).toBe(true);
      expect(component.showFilters()).toBe(true);
      expect(component.enableExport()).toBe(true);
      expect(component.enableRealtime()).toBe(false);
      expect(component.pageSize()).toBe(50);
    });

    it('should initialize with empty movements', () => {
      expect(component.filteredMovements()).toEqual([]);
    });
  });

  // =============================================================================
  // MOVEMENT LOADING TESTS
  // =============================================================================

  describe('Movement Loading', () => {
    it('should use provided movements if available', async () => {
      fixture.componentRef.setInput('movements', mockMovements);
      await component.ngOnInit();
      fixture.detectChanges();

      expect(component.filteredMovements().length).toBe(3);
    });

    it('should load movements from API if not provided', async () => {
      const apiResponse: MovementApiResponse = {
        movements: mockMovements,
        total: 3,
        currentBalance: 100,
      };

      const initPromise = component.ngOnInit();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/inventory/products/PROD-001/movements'),
      );
      expect(req.request.method).toBe('GET');
      req.flush(apiResponse);

      await initPromise;
      fixture.detectChanges();

      expect(component.filteredMovements().length).toBe(3);
    });

    it('should handle API errors gracefully', async () => {
      const errorSpy = jasmine.createSpy('onError');
      component.onError.subscribe(errorSpy);

      const initPromise = component.ngOnInit();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/inventory/products/PROD-001/movements'),
      );
      req.error(new ErrorEvent('Network error'));

      await initPromise;
      fixture.detectChanges();

      expect(errorSpy).toHaveBeenCalled();
      expect(component.filteredMovements().length).toBe(0);
    });

    it('should emit onMovementsLoad after successful API call', async () => {
      const loadSpy = jasmine.createSpy('onMovementsLoad');
      component.onMovementsLoad.subscribe(loadSpy);

      const apiResponse: MovementApiResponse = {
        movements: mockMovements,
        total: 3,
        currentBalance: 100,
      };

      const initPromise = component.ngOnInit();

      const req = httpMock.expectOne((request) =>
        request.url.includes('/api/inventory/products/PROD-001/movements'),
      );
      req.flush(apiResponse);

      await initPromise;
      fixture.detectChanges();

      expect(loadSpy).toHaveBeenCalledWith(jasmine.any(Array));
    });
  });

  // =============================================================================
  // FILTERING TESTS
  // =============================================================================

  describe('Movement Filtering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('movements', mockMovements);
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should filter movements by type', () => {
      component.toggleTypeFilter('receive');
      fixture.detectChanges();

      const filtered = component.filteredMovements();
      expect(filtered.length).toBe(1);
      expect(filtered[0].type).toBe('receive');
    });

    it('should filter movements by multiple types', () => {
      component.toggleTypeFilter('receive');
      component.toggleTypeFilter('issue');
      fixture.detectChanges();

      const filtered = component.filteredMovements();
      expect(filtered.length).toBe(2);
    });

    it('should remove filter when toggled again', () => {
      component.toggleTypeFilter('receive');
      fixture.detectChanges();
      expect(component.filteredMovements().length).toBe(1);

      component.toggleTypeFilter('receive');
      fixture.detectChanges();
      expect(component.filteredMovements().length).toBe(3);
    });

    it('should filter by date range', () => {
      const startDate = new Date('2025-12-19T00:00:00Z');
      const endDate = new Date('2025-12-19T23:59:59Z');

      component.filterDateStart.set(startDate);
      component.filterDateEnd.set(endDate);
      component.applyDateFilter();
      fixture.detectChanges();

      const filtered = component.filteredMovements();
      expect(filtered.length).toBe(2); // Only movements on Dec 19
    });

    it('should clear all filters', () => {
      component.toggleTypeFilter('receive');
      component.filterDateStart.set(new Date('2025-12-19T00:00:00Z'));
      component.filterDateEnd.set(new Date('2025-12-19T23:59:59Z'));
      component.applyDateFilter();
      fixture.detectChanges();

      expect(component.filteredMovements().length).toBeLessThan(3);

      component.clearFilters();
      fixture.detectChanges();

      expect(component.filteredMovements().length).toBe(3);
      expect(component.selectedTypes().length).toBe(0);
      expect(component.filterDateStart()).toBeNull();
      expect(component.filterDateEnd()).toBeNull();
    });

    it('should emit onFilterChange when filters are applied', () => {
      const filterSpy = jasmine.createSpy('onFilterChange');
      component.onFilterChange.subscribe(filterSpy);

      component.toggleTypeFilter('receive');

      expect(filterSpy).toHaveBeenCalled();
    });
  });

  // =============================================================================
  // GROUPING TESTS
  // =============================================================================

  describe('Movement Grouping', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('movements', mockMovements);
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should not group when groupBy is "none"', () => {
      component.groupBy.set('none');
      fixture.detectChanges();

      const groups = component.groupedMovements();
      expect(groups.length).toBe(1);
      expect(groups[0].key).toBe('all');
      expect(groups[0].movements.length).toBe(3);
    });

    it('should group movements by day', () => {
      component.groupBy.set('day');
      fixture.detectChanges();

      const groups = component.groupedMovements();
      expect(groups.length).toBe(2); // Dec 19 and Dec 18
      expect(groups[0].movements.length).toBe(2); // Dec 19 (newest first)
      expect(groups[1].movements.length).toBe(1); // Dec 18
    });

    it('should calculate net change for groups', () => {
      component.groupBy.set('day');
      fixture.detectChanges();

      const groups = component.groupedMovements();
      const dec19Group = groups.find((g) => g.key.startsWith('2025-12-19'));

      expect(dec19Group).toBeDefined();
      expect(dec19Group!.total).toBe(50); // +100 (receive) -50 (issue)
    });

    it('should format group labels correctly', () => {
      component.groupBy.set('day');
      fixture.detectChanges();

      const groups = component.groupedMovements();
      const label = component.getGroupLabel(groups[0]);

      expect(label).toContain('2025');
      expect(label).toContain('December');
    });
  });

  // =============================================================================
  // CALCULATION TESTS
  // =============================================================================

  describe('Movement Calculations', () => {
    it('should calculate quantity change correctly for inbound movements', () => {
      const movement: MovementRecord = {
        ...mockMovements[0],
        type: 'receive',
        quantity: 100,
      };

      const formatted = component.formatQuantityWithSign(movement);
      expect(formatted).toBe('+100');
    });

    it('should calculate quantity change correctly for outbound movements', () => {
      const movement: MovementRecord = {
        ...mockMovements[1],
        type: 'issue',
        quantity: 50,
      };

      const formatted = component.formatQuantityWithSign(movement);
      expect(formatted).toBe('-50');
    });

    it('should calculate balance data for chart', () => {
      fixture.componentRef.setInput('movements', mockMovements);
      component.ngOnInit();
      fixture.detectChanges();

      const balanceData = component.balanceData();
      expect(balanceData.length).toBe(3);
      expect(balanceData.every((d) => typeof d.balance === 'number')).toBe(
        true,
      );
    });
  });

  // =============================================================================
  // INTERACTION TESTS
  // =============================================================================

  describe('Movement Interaction', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('movements', mockMovements);
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should toggle movement expansion', () => {
      const movement = mockMovements[0];
      expect(component.isExpanded(movement)).toBe(false);

      component.toggleMovement(movement);
      expect(component.isExpanded(movement)).toBe(true);

      component.toggleMovement(movement);
      expect(component.isExpanded(movement)).toBe(false);
    });

    it('should emit onMovementClick when movement is clicked', () => {
      const clickSpy = jasmine.createSpy('onMovementClick');
      component.onMovementClick.subscribe(clickSpy);

      component.toggleMovement(mockMovements[0]);

      expect(clickSpy).toHaveBeenCalledWith(mockMovements[0]);
    });
  });

  // =============================================================================
  // EXPORT TESTS
  // =============================================================================

  describe('Export Functionality', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('movements', mockMovements);
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should emit onExport when export is triggered', async () => {
      const exportSpy = jasmine.createSpy('onExport');
      component.onExport.subscribe(exportSpy);

      // Mock the dynamic import
      spyOn<any>(component, 'exportToExcel').and.returnValue(Promise.resolve());

      await component.exportData('excel');

      expect(exportSpy).toHaveBeenCalledWith({
        format: 'excel',
        data: jasmine.any(Array),
      });
    });
  });

  // =============================================================================
  // MOVEMENT TYPE CONFIG TESTS
  // =============================================================================

  describe('Movement Type Configuration', () => {
    it('should have config for all movement types', () => {
      const types = [
        'receive',
        'issue',
        'transfer-in',
        'transfer-out',
        'adjust-in',
        'adjust-out',
      ];

      types.forEach((type) => {
        const config = component.getMovementConfig(type as any);
        expect(config).toBeDefined();
        expect(config.label).toBeDefined();
        expect(config.icon).toBeDefined();
        expect(config.cssClass).toBeDefined();
      });
    });

    it('should identify inbound movements correctly', () => {
      expect(MOVEMENT_TYPE_CONFIGS['receive'].isInbound).toBe(true);
      expect(MOVEMENT_TYPE_CONFIGS['transfer-in'].isInbound).toBe(true);
      expect(MOVEMENT_TYPE_CONFIGS['adjust-in'].isInbound).toBe(true);

      expect(MOVEMENT_TYPE_CONFIGS['issue'].isInbound).toBe(false);
      expect(MOVEMENT_TYPE_CONFIGS['transfer-out'].isInbound).toBe(false);
      expect(MOVEMENT_TYPE_CONFIGS['adjust-out'].isInbound).toBe(false);
    });
  });

  // =============================================================================
  // UTILITY TESTS
  // =============================================================================

  describe('Utility Methods', () => {
    it('should format dates correctly', () => {
      const date = new Date('2025-12-19T10:30:00Z');
      const formatted = component.formatDate(date);
      expect(formatted).toBeTruthy();
    });

    it('should format time correctly', () => {
      const date = new Date('2025-12-19T10:30:00Z');
      const formatted = component.formatTime(date);
      expect(formatted).toBeTruthy();
    });

    it('should track movements by ID', () => {
      const trackId = component.trackByMovementId(0, mockMovements[0]);
      expect(trackId).toBe('1');
    });
  });

  // =============================================================================
  // TEMPLATE TESTS
  // =============================================================================

  describe('Template Rendering', () => {
    it('should show loading state when loading', () => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const loadingEl = compiled.query(By.css('.timeline-loading'));
      expect(loadingEl).toBeTruthy();
    });

    it('should show empty state when no movements', () => {
      component.isLoading.set(false);
      fixture.detectChanges();

      const emptyEl = compiled.query(By.css('.timeline-empty'));
      expect(emptyEl).toBeTruthy();
    });

    it('should render filter controls when showFilters is true', () => {
      fixture.componentRef.setInput('showFilters', true);
      fixture.detectChanges();

      const filtersEl = compiled.query(By.css('.timeline-filters'));
      expect(filtersEl).toBeTruthy();
    });

    it('should hide filter controls when showFilters is false', () => {
      fixture.componentRef.setInput('showFilters', false);
      fixture.detectChanges();

      const filtersEl = compiled.query(By.css('.timeline-filters'));
      expect(filtersEl).toBeFalsy();
    });

    it('should render movement cards when movements exist', () => {
      fixture.componentRef.setInput('movements', mockMovements);
      component.ngOnInit();
      component.isLoading.set(false);
      fixture.detectChanges();

      const cards = compiled.queryAll(By.css('.movement-card'));
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // EDGE CASES
  // =============================================================================

  describe('Edge Cases', () => {
    it('should handle empty movements array', () => {
      fixture.componentRef.setInput('movements', []);
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.filteredMovements().length).toBe(0);
      expect(component.groupedMovements().length).toBe(1);
    });

    it('should handle movements without optional fields', () => {
      const minimalMovement: MovementRecord = {
        id: '999',
        timestamp: new Date(),
        type: 'receive',
        quantity: 10,
        balanceAfter: 10,
        unit: 'pieces',
        user: { id: 'user1', name: 'User' },
      };

      fixture.componentRef.setInput('movements', [minimalMovement]);
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.filteredMovements().length).toBe(1);
    });

    it('should handle large datasets with virtual scrolling', () => {
      const largeDataset = Array.from({ length: 200 }, (_, i) => ({
        id: `${i}`,
        timestamp: new Date(),
        type: 'receive' as const,
        quantity: 10,
        balanceAfter: 100 + i * 10,
        unit: 'pieces',
        user: { id: 'user1', name: 'User' },
      }));

      fixture.componentRef.setInput('movements', largeDataset);
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.filteredMovements().length).toBe(200);
    });
  });
});
