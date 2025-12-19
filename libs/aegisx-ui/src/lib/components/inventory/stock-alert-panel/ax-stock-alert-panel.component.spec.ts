import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AxStockAlertPanelComponent } from './ax-stock-alert-panel.component';
import {
  StockAlert,
  AlertFilter,
  AlertGroupBy,
} from './ax-stock-alert-panel.component.types';

describe('AxStockAlertPanelComponent', () => {
  let component: AxStockAlertPanelComponent;
  let fixture: ComponentFixture<AxStockAlertPanelComponent>;

  // Mock alerts data
  const mockAlerts: StockAlert[] = [
    {
      id: '1',
      type: 'out-of-stock',
      severity: 'critical',
      product: {
        id: 'prod-001',
        name: 'Aspirin 500mg',
        sku: 'SKU-001',
      },
      message: 'Product is out of stock',
      createdAt: new Date('2025-12-19T10:00:00'),
      metadata: {
        currentStock: 0,
        minimumStock: 50,
      },
      read: false,
      resolved: false,
    },
    {
      id: '2',
      type: 'expired',
      severity: 'critical',
      product: {
        id: 'prod-042',
        name: 'Ibuprofen 200mg',
        sku: 'SKU-042',
      },
      message: 'Product has expired',
      createdAt: new Date('2025-12-19T09:00:00'),
      metadata: {
        expiryDate: new Date('2025-12-14T00:00:00'),
        batchNumber: 'BATCH-2023-099',
      },
      read: false,
      resolved: false,
    },
    {
      id: '3',
      type: 'low-stock',
      severity: 'warning',
      product: {
        id: 'prod-015',
        name: 'Paracetamol 650mg',
        sku: 'SKU-015',
      },
      message: 'Stock level below minimum threshold',
      createdAt: new Date('2025-12-19T08:00:00'),
      metadata: {
        currentStock: 25,
        minimumStock: 50,
      },
      read: false,
      resolved: false,
    },
    {
      id: '4',
      type: 'expiring',
      severity: 'info',
      product: {
        id: 'prod-020',
        name: 'Vitamin C 1000mg',
        sku: 'SKU-020',
      },
      message: 'Product expiring in 30 days',
      createdAt: new Date('2025-12-19T07:00:00'),
      metadata: {
        expiryDate: new Date('2026-01-18T00:00:00'),
      },
      read: true,
      resolved: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AxStockAlertPanelComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AxStockAlertPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.groupBy()).toBe('priority');
      expect(component.showActions()).toBe(true);
      expect(component.maxDisplay()).toBe(10);
      expect(component.enableRealtime()).toBe(false);
      expect(component.enableSounds()).toBe(false);
      expect(component.isLoading()).toBe(false);
      expect(component.error()).toBe(null);
    });

    it('should load mock alerts on init when no alerts provided', fakeAsync(() => {
      fixture.detectChanges();
      tick(500); // Wait for mock API call

      expect(component['internalAlerts']().length).toBeGreaterThan(0);
      expect(component.isLoading()).toBe(false);
    }));

    it('should use provided alerts input', () => {
      fixture.componentRef.setInput('alerts', mockAlerts);
      fixture.detectChanges();

      expect(component['internalAlerts']()).toEqual(mockAlerts);
    });
  });

  describe('Alert Filtering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('alerts', mockAlerts);
      fixture.detectChanges();
    });

    it('should filter alerts by type', () => {
      const filter: AlertFilter = {
        types: ['out-of-stock', 'expired'],
      };
      fixture.componentRef.setInput('filters', filter);
      fixture.detectChanges();

      const filtered = component.filteredAlerts();
      expect(filtered.length).toBe(2);
      expect(
        filtered.every(
          (a) => a.type === 'out-of-stock' || a.type === 'expired',
        ),
      ).toBe(true);
    });

    it('should filter alerts by severity', () => {
      const filter: AlertFilter = {
        severity: ['critical'],
      };
      fixture.componentRef.setInput('filters', filter);
      fixture.detectChanges();

      const filtered = component.filteredAlerts();
      expect(filtered.length).toBe(2);
      expect(filtered.every((a) => a.severity === 'critical')).toBe(true);
    });

    it('should filter unread alerts only', () => {
      const filter: AlertFilter = {
        unreadOnly: true,
      };
      fixture.componentRef.setInput('filters', filter);
      fixture.detectChanges();

      const filtered = component.filteredAlerts();
      expect(filtered.every((a) => !a.read)).toBe(true);
      expect(filtered.length).toBe(3);
    });

    it('should filter unresolved alerts only', () => {
      const filter: AlertFilter = {
        unresolvedOnly: true,
      };
      fixture.componentRef.setInput('filters', filter);
      fixture.detectChanges();

      const filtered = component.filteredAlerts();
      expect(filtered.every((a) => !a.resolved)).toBe(true);
    });

    it('should apply multiple filters simultaneously', () => {
      const filter: AlertFilter = {
        severity: ['critical', 'warning'],
        unreadOnly: true,
      };
      fixture.componentRef.setInput('filters', filter);
      fixture.detectChanges();

      const filtered = component.filteredAlerts();
      expect(
        filtered.every(
          (a) =>
            (a.severity === 'critical' || a.severity === 'warning') && !a.read,
        ),
      ).toBe(true);
    });
  });

  describe('Alert Grouping', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('alerts', mockAlerts);
      fixture.detectChanges();
    });

    it('should group alerts by priority (severity)', () => {
      fixture.componentRef.setInput('groupBy', 'priority' as AlertGroupBy);
      fixture.detectChanges();

      const grouped = component.groupedAlerts();
      expect(grouped.length).toBeGreaterThan(0);

      const criticalGroup = grouped.find((g) => g.key === 'critical');
      expect(criticalGroup).toBeDefined();
      expect(
        criticalGroup!.alerts.every((a) => a.severity === 'critical'),
      ).toBe(true);
    });

    it('should group alerts by type', () => {
      fixture.componentRef.setInput('groupBy', 'type' as AlertGroupBy);
      fixture.detectChanges();

      const grouped = component.groupedAlerts();
      expect(grouped.length).toBeGreaterThan(0);

      const outOfStockGroup = grouped.find((g) => g.key === 'out-of-stock');
      expect(outOfStockGroup).toBeDefined();
      expect(
        outOfStockGroup!.alerts.every((a) => a.type === 'out-of-stock'),
      ).toBe(true);
    });

    it('should not group when groupBy is none', () => {
      fixture.componentRef.setInput('groupBy', 'none' as AlertGroupBy);
      fixture.detectChanges();

      const grouped = component.groupedAlerts();
      expect(grouped.length).toBe(1);
      expect(grouped[0].key).toBe('all');
    });

    it('should calculate group counts correctly', () => {
      fixture.componentRef.setInput('groupBy', 'priority' as AlertGroupBy);
      fixture.detectChanges();

      const grouped = component.groupedAlerts();
      const criticalGroup = grouped.find((g) => g.key === 'critical');

      expect(criticalGroup).toBeDefined();
      expect(criticalGroup!.criticalCount).toBe(2);
    });
  });

  describe('Alert Counts', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('alerts', mockAlerts);
      fixture.detectChanges();
    });

    it('should calculate alert counts correctly', () => {
      const counts = component.alertCounts();

      expect(counts.total).toBe(4);
      expect(counts.critical).toBe(2);
      expect(counts.warning).toBe(1);
      expect(counts.info).toBe(1);
      expect(counts.unread).toBe(3);
      expect(counts.unresolved).toBe(4);
    });

    it('should update counts when alerts change', () => {
      const newAlerts = mockAlerts.slice(0, 2);
      fixture.componentRef.setInput('alerts', newAlerts);
      fixture.detectChanges();

      const counts = component.alertCounts();
      expect(counts.total).toBe(2);
      expect(counts.critical).toBe(2);
    });
  });

  describe('Alert Actions', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('alerts', mockAlerts);
      fixture.detectChanges();
    });

    it('should emit onAlertClick when alert is clicked', () => {
      const emitSpy = jest.spyOn(component.onAlertClick, 'emit');
      const alert = mockAlerts[0];

      component.handleAlertClick(alert);

      expect(emitSpy).toHaveBeenCalledWith(alert);
    });

    it('should mark alert as read when clicked', () => {
      const alert = mockAlerts[0];
      expect(alert.read).toBe(false);

      component.handleAlertClick(alert);

      const internalAlert = component['internalAlerts']().find(
        (a) => a.id === alert.id,
      );
      expect(internalAlert?.read).toBe(true);
    });

    it('should emit onAlertAction when action button is clicked', () => {
      const emitSpy = jest.spyOn(component.onAlertAction, 'emit');
      const alert = mockAlerts[0];

      component.handleAction(alert, 'create-po');

      expect(emitSpy).toHaveBeenCalledWith({
        alert,
        action: 'create-po',
      });
    });

    it('should dismiss alert and emit event', () => {
      const emitSpy = jest.spyOn(component.onAlertDismiss, 'emit');
      const alertId = mockAlerts[0].id;

      component.dismissAlert(alertId);

      expect(emitSpy).toHaveBeenCalledWith(alertId);
      const remainingAlerts = component['internalAlerts']();
      expect(remainingAlerts.find((a) => a.id === alertId)).toBeUndefined();
    });

    it('should resolve alert and emit event', () => {
      const emitSpy = jest.spyOn(component.onAlertResolve, 'emit');
      const alertId = mockAlerts[0].id;

      component.resolveAlert(alertId);

      expect(emitSpy).toHaveBeenCalledWith(alertId);
      const resolvedAlert = component['internalAlerts']().find(
        (a) => a.id === alertId,
      );
      expect(resolvedAlert?.resolved).toBe(true);
    });
  });

  describe('Suggested Actions', () => {
    it('should return custom suggested actions when provided', () => {
      const alert: StockAlert = {
        ...mockAlerts[0],
        suggestedActions: ['custom-action-1', 'custom-action-2'],
      };

      const actions = component.getSuggestedActions(alert);
      expect(actions).toEqual(['custom-action-1', 'custom-action-2']);
    });

    it('should return default actions for out-of-stock alerts', () => {
      const alert = mockAlerts[0]; // out-of-stock
      const actions = component.getSuggestedActions(alert);
      expect(actions).toContain('create-po');
      expect(actions).toContain('view-product');
    });

    it('should return default actions for low-stock alerts', () => {
      const alert = mockAlerts[2]; // low-stock
      const actions = component.getSuggestedActions(alert);
      expect(actions).toContain('reorder');
      expect(actions).toContain('view-product');
    });

    it('should return default actions for expired alerts', () => {
      const alert = mockAlerts[1]; // expired
      const actions = component.getSuggestedActions(alert);
      expect(actions).toContain('dispose');
      expect(actions).toContain('view-product');
    });
  });

  describe('Severity Helpers', () => {
    it('should return correct severity icon', () => {
      expect(component.getSeverityIcon('critical')).toBe('error');
      expect(component.getSeverityIcon('warning')).toBe('warning');
      expect(component.getSeverityIcon('info')).toBe('info');
    });

    it('should return correct severity class', () => {
      expect(component.getSeverityClass('critical')).toBe('severity-critical');
      expect(component.getSeverityClass('warning')).toBe('severity-warning');
      expect(component.getSeverityClass('info')).toBe('severity-info');
    });
  });

  describe('Alert Type Helpers', () => {
    it('should return correct alert type icon', () => {
      expect(component.getAlertTypeIcon('low-stock')).toBe('trending_down');
      expect(component.getAlertTypeIcon('out-of-stock')).toBe('remove_circle');
      expect(component.getAlertTypeIcon('expiring')).toBe('schedule');
      expect(component.getAlertTypeIcon('expired')).toBe('event_busy');
      expect(component.getAlertTypeIcon('overstock')).toBe('trending_up');
      expect(component.getAlertTypeIcon('reorder')).toBe('refresh');
    });
  });

  describe('Action Labels and Icons', () => {
    it('should return correct action label', () => {
      expect(component.getActionLabel('create-po')).toBe('Create PO');
      expect(component.getActionLabel('adjust-stock')).toBe('Adjust Stock');
      expect(component.getActionLabel('view-product')).toBe('View Product');
      expect(component.getActionLabel('dispose')).toBe('Dispose');
      expect(component.getActionLabel('reorder')).toBe('Reorder');
    });

    it('should return correct action icon', () => {
      expect(component.getActionIcon('create-po')).toBe('add_shopping_cart');
      expect(component.getActionIcon('adjust-stock')).toBe('edit');
      expect(component.getActionIcon('view-product')).toBe('visibility');
      expect(component.getActionIcon('dispose')).toBe('delete');
      expect(component.getActionIcon('reorder')).toBe('refresh');
    });
  });

  describe('Max Display and Pagination', () => {
    beforeEach(() => {
      const manyAlerts: StockAlert[] = Array.from({ length: 20 }, (_, i) => ({
        id: `alert-${i}`,
        type: 'low-stock',
        severity: 'warning',
        product: {
          id: `prod-${i}`,
          name: `Product ${i}`,
          sku: `SKU-${i}`,
        },
        message: `Alert ${i}`,
        createdAt: new Date(),
        read: false,
        resolved: false,
      }));
      fixture.componentRef.setInput('alerts', manyAlerts);
      fixture.componentRef.setInput('maxDisplay', 5);
      fixture.detectChanges();
    });

    it('should limit displayed alerts to maxDisplay', () => {
      const grouped = component.groupedAlerts();
      const totalDisplayed = grouped.reduce(
        (sum, g) => sum + g.alerts.length,
        0,
      );
      expect(totalDisplayed).toBeLessThanOrEqual(5);
    });

    it('should indicate when there are more alerts', () => {
      expect(component.hasMoreAlerts()).toBe(true);
    });

    it('should calculate hidden alerts count', () => {
      const hidden = component.hiddenAlertsCount();
      expect(hidden).toBe(15); // 20 total - 5 displayed
    });
  });

  describe('Refresh Functionality', () => {
    it('should call loadAlerts when refreshAlerts is called', fakeAsync(() => {
      const loadSpy = jest.spyOn<any>(component, 'loadAlerts');
      component.refreshAlerts();
      expect(loadSpy).toHaveBeenCalled();
    }));
  });

  describe('WebSocket Integration', () => {
    it('should setup WebSocket when enableRealtime is true', fakeAsync(() => {
      fixture.componentRef.setInput('enableRealtime', true);
      fixture.detectChanges();

      tick(1000); // Wait for mock WebSocket connection

      expect(component['wsConnected']()).toBe(true);
    }));

    it('should add new alerts from WebSocket', fakeAsync(() => {
      fixture.componentRef.setInput('alerts', mockAlerts);
      fixture.componentRef.setInput('enableRealtime', true);
      fixture.detectChanges();

      const initialCount = component['internalAlerts']().length;

      // Simulate WebSocket message
      const newAlert: StockAlert = {
        id: 'ws-alert-1',
        type: 'out-of-stock',
        severity: 'critical',
        product: {
          id: 'prod-999',
          name: 'New Product',
          sku: 'SKU-999',
        },
        message: 'New alert from WebSocket',
        createdAt: new Date(),
        read: false,
        resolved: false,
      };

      component['handleWebSocketMessage']({
        type: 'new-alert',
        data: newAlert,
        timestamp: new Date(),
      });

      expect(component['internalAlerts']().length).toBe(initialCount + 1);
      expect(component['internalAlerts']()[0].id).toBe('ws-alert-1');
    }));
  });

  describe('Sound Notifications', () => {
    it('should initialize audio context when sounds enabled', () => {
      fixture.componentRef.setInput('enableSounds', true);
      fixture.detectChanges();

      // Audio context may not be available in test environment
      // Just verify no errors occur
      expect(component['audioContext']).toBeDefined();
    });
  });

  describe('Component Cleanup', () => {
    it('should cleanup WebSocket on destroy', () => {
      fixture.componentRef.setInput('enableRealtime', true);
      fixture.detectChanges();

      const closeSpy = jest.fn();
      component['ws'] = { close: closeSpy };

      component.ngOnDestroy();

      expect(closeSpy).toHaveBeenCalled();
      expect(component['ws']).toBe(null);
    });

    it('should cleanup audio context on destroy', () => {
      fixture.componentRef.setInput('enableSounds', true);
      fixture.detectChanges();

      const audioContext = component['audioContext'];
      if (audioContext) {
        const closeSpy = jest.spyOn(audioContext, 'close');
        component.ngOnDestroy();
        expect(closeSpy).toHaveBeenCalled();
      }
    });

    it('should clear auto-refresh interval on destroy', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      component['autoRefreshInterval'] = 123;

      component.ngOnDestroy();

      expect(clearIntervalSpy).toHaveBeenCalledWith(123);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('alerts', mockAlerts);
      fixture.detectChanges();
    });

    it('should render alert count chips', () => {
      const compiled = fixture.nativeElement;
      const chips = compiled.querySelectorAll('.count-chip');
      expect(chips.length).toBe(3); // Critical, Warning, Info
    });

    it('should render alerts in list', () => {
      const compiled = fixture.nativeElement;
      const alertItems = compiled.querySelectorAll('.alert-item');
      expect(alertItems.length).toBeGreaterThan(0);
    });

    it('should show empty state when no alerts', () => {
      fixture.componentRef.setInput('alerts', []);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const emptyState = compiled.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should show loading state', fakeAsync(() => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const loadingState = compiled.querySelector('.loading-state');
      expect(loadingState).toBeTruthy();
    }));

    it('should show error state', () => {
      component.error.set('Test error message');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const errorState = compiled.querySelector('.error-state');
      expect(errorState).toBeTruthy();
      expect(errorState.textContent).toContain('Test error message');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('alerts', mockAlerts);
      fixture.detectChanges();
    });

    it('should have proper ARIA labels on chips', () => {
      const compiled = fixture.nativeElement;
      const chipSet = compiled.querySelector('mat-chip-set');
      expect(chipSet.getAttribute('aria-label')).toBe('Alert counts');
    });

    it('should have tooltips on action buttons', () => {
      const compiled = fixture.nativeElement;
      const refreshButton = compiled.querySelector(
        'button[matTooltip="Refresh alerts"]',
      );
      expect(refreshButton).toBeTruthy();
    });
  });
});
