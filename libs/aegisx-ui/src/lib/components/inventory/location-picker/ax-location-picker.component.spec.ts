import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AxLocationPickerComponent } from './ax-location-picker.component';
import {
  LocationNode,
  LocationType,
  LocationStatus,
  SelectionMode,
  LocationSelection,
} from './ax-location-picker.component.types';

/**
 * Comprehensive unit tests for Location Picker Component
 * ================================================================
 *
 * Test coverage includes:
 * - Component initialization
 * - Tree structure and navigation
 * - Search and filtering
 * - Selection modes (single/multi)
 * - Recent and favorite locations
 * - Breadcrumb navigation
 * - Expand/collapse functionality
 * - Capacity indicators
 * - LocalStorage persistence
 */

describe('AxLocationPickerComponent', () => {
  let component: AxLocationPickerComponent;
  let fixture: ComponentFixture<AxLocationPickerComponent>;
  let componentRef: ComponentRef<AxLocationPickerComponent>;

  // Mock location data
  const mockLocations: LocationNode[] = [
    {
      id: 'wh-1',
      code: 'WH-01',
      name: 'Main Warehouse',
      type: LocationType.Warehouse,
      status: LocationStatus.Active,
      stockCount: 1000,
      capacity: 5000,
      utilization: 20,
      children: [
        {
          id: 'zone-1',
          code: 'ZONE-A',
          name: 'Zone A',
          type: LocationType.Zone,
          parentId: 'wh-1',
          status: LocationStatus.Active,
          stockCount: 500,
          capacity: 2000,
          utilization: 25,
          children: [
            {
              id: 'shelf-1',
              code: 'SHELF-01',
              name: 'Shelf 01',
              type: LocationType.Shelf,
              parentId: 'zone-1',
              status: LocationStatus.Active,
              stockCount: 100,
              capacity: 200,
              utilization: 50,
            },
            {
              id: 'shelf-2',
              code: 'SHELF-02',
              name: 'Shelf 02',
              type: LocationType.Shelf,
              parentId: 'zone-1',
              status: LocationStatus.Full,
              disabled: true,
              stockCount: 200,
              capacity: 200,
              utilization: 100,
            },
          ],
        },
        {
          id: 'zone-2',
          code: 'ZONE-B',
          name: 'Zone B',
          type: LocationType.Zone,
          parentId: 'wh-1',
          status: LocationStatus.Maintenance,
          stockCount: 200,
          capacity: 1000,
          utilization: 20,
        },
      ],
    },
    {
      id: 'wh-2',
      code: 'WH-02',
      name: 'Secondary Warehouse',
      type: LocationType.Warehouse,
      status: LocationStatus.Active,
      stockCount: 300,
      capacity: 2000,
      utilization: 15,
    },
  ];

  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AxLocationPickerComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AxLocationPickerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set required inputs using ComponentRef.setInput()
    componentRef.setInput('locations', mockLocations);
  });

  // =============================================================================
  // BASIC COMPONENT TESTS
  // =============================================================================

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default inputs', () => {
      fixture.detectChanges();

      expect(component.searchable()).toBe(true);
      expect(component.showBreadcrumbs()).toBe(true);
      expect(component.showRecent()).toBe(true);
      expect(component.showFavorites()).toBe(true);
      expect(component.selectionMode()).toBe(SelectionMode.Single);
    });

    it('should load locations into tree data source', () => {
      fixture.detectChanges();

      expect(component['dataSource'].data).toEqual(mockLocations);
    });
  });

  // =============================================================================
  // SELECTION TESTS
  // =============================================================================

  describe('Location Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should select a location in single-select mode', () => {
      const location = mockLocations[0];
      let emittedSelection: LocationSelection | undefined;

      component.onLocationSelect.subscribe((selection) => {
        emittedSelection = selection;
      });

      component['selectLocation'](location);

      expect(component['selectedLocations']()).toEqual([location]);
      expect(emittedSelection).toBeDefined();
      expect(emittedSelection?.location).toEqual(location);
      expect(emittedSelection?.pathString).toBe('WH-01');
    });

    it('should replace selection when selecting another location in single mode', () => {
      const location1 = mockLocations[0];
      const location2 = mockLocations[1];

      component['selectLocation'](location1);
      expect(component['selectedLocations']().length).toBe(1);

      component['selectLocation'](location2);
      expect(component['selectedLocations']()).toEqual([location2]);
      expect(component['selectedLocations']().length).toBe(1);
    });

    it('should toggle selection in multi-select mode', () => {
      componentRef.setInput('selectionMode', SelectionMode.Multiple);
      fixture.detectChanges();

      const location1 = mockLocations[0];
      const location2 = mockLocations[1];

      component['selectLocation'](location1);
      expect(component['selectedLocations']().length).toBe(1);

      component['selectLocation'](location2);
      expect(component['selectedLocations']().length).toBe(2);

      // Deselect first location
      component['selectLocation'](location1);
      expect(component['selectedLocations']().length).toBe(1);
      expect(component['selectedLocations']()[0]).toEqual(location2);
    });

    it('should not select disabled location', () => {
      const disabledLocation = mockLocations[0].children![0].children![1];

      component['selectLocation'](disabledLocation);

      expect(component['selectedLocations']().length).toBe(0);
    });

    it('should not select location if type is not allowed', () => {
      componentRef.setInput('allowedTypes', [LocationType.Shelf]);
      fixture.detectChanges();

      const warehouseLocation = mockLocations[0];

      component['selectLocation'](warehouseLocation);

      expect(component['selectedLocations']().length).toBe(0);
    });

    it('should check if location is selected', () => {
      const location = mockLocations[0];

      expect(component['isSelected'](location)).toBe(false);

      component['selectLocation'](location);

      expect(component['isSelected'](location)).toBe(true);
    });
  });

  // =============================================================================
  // TREE NAVIGATION TESTS
  // =============================================================================

  describe('Tree Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get full path to location', () => {
      const shelfLocation = mockLocations[0].children![0].children![0];
      const path = component['getLocationPath'](shelfLocation);

      expect(path.length).toBe(3);
      expect(path[0].code).toBe('WH-01');
      expect(path[1].code).toBe('ZONE-A');
      expect(path[2].code).toBe('SHELF-01');
    });

    it('should find location by ID', () => {
      const found = component['findLocationById']('shelf-1');

      expect(found).toBeDefined();
      expect(found?.code).toBe('SHELF-01');
    });

    it('should return null for non-existent location ID', () => {
      const found = component['findLocationById']('non-existent');

      expect(found).toBeNull();
    });

    it('should expand tree to specific location', () => {
      component['expandToLocation']('shelf-1');

      const expandedIds = component['expandedNodeIds']();
      expect(expandedIds.has('wh-1')).toBe(true);
      expect(expandedIds.has('zone-1')).toBe(true);
      expect(expandedIds.has('shelf-1')).toBe(true);
    });

    it('should auto-expand to current location on init', () => {
      componentRef.setInput('currentLocation', 'shelf-1');
      fixture.detectChanges();

      const expandedIds = component['expandedNodeIds']();
      expect(expandedIds.has('wh-1')).toBe(true);
      expect(expandedIds.has('zone-1')).toBe(true);
    });
  });

  // =============================================================================
  // BREADCRUMB TESTS
  // =============================================================================

  describe('Breadcrumbs', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should generate breadcrumbs for selected location', () => {
      const shelfLocation = mockLocations[0].children![0].children![0];
      component['selectLocation'](shelfLocation);

      const breadcrumbs = component['breadcrumbs']();

      expect(breadcrumbs.length).toBe(3);
      expect(breadcrumbs[0].code).toBe('WH-01');
      expect(breadcrumbs[1].code).toBe('ZONE-A');
      expect(breadcrumbs[2].code).toBe('SHELF-01');
      expect(breadcrumbs[2].isLast).toBe(true);
    });

    it('should navigate to breadcrumb location', () => {
      const shelfLocation = mockLocations[0].children![0].children![0];
      component['selectLocation'](shelfLocation);

      const breadcrumbs = component['breadcrumbs']();
      const zoneItem = breadcrumbs[1]; // Zone A

      component['navigateToBreadcrumb'](zoneItem);

      expect(component['selectedLocations']()[0].code).toBe('ZONE-A');
    });
  });

  // =============================================================================
  // SEARCH AND FILTER TESTS
  // =============================================================================

  describe('Search and Filter', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter locations by search term', () => {
      component['searchTerm'].set('SHELF');
      fixture.detectChanges();

      const filtered = component['filteredLocations']();

      // Should include parent nodes that have matching children
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should clear search term', () => {
      component['searchTerm'].set('test');

      component['clearSearch']();

      expect(component['searchTerm']()).toBe('');
    });

    it('should find matching nodes', () => {
      const matchingNodes: string[] = [];
      component['findMatchingNodes'](mockLocations, 'shelf', matchingNodes);

      expect(matchingNodes.length).toBeGreaterThan(0);
      expect(matchingNodes).toContain('shelf-1');
      expect(matchingNodes).toContain('shelf-2');
    });

    it('should expand search results automatically', () => {
      component['searchTerm'].set('SHELF-01');
      fixture.detectChanges();

      const expandedIds = component['expandedNodeIds']();
      expect(expandedIds.has('wh-1')).toBe(true);
      expect(expandedIds.has('zone-1')).toBe(true);
    });
  });

  // =============================================================================
  // RECENT LOCATIONS TESTS
  // =============================================================================

  describe('Recent Locations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should add location to recent on selection', () => {
      const location = mockLocations[0];

      component['selectLocation'](location);

      const recent = component['recentLocations']();
      expect(recent.length).toBe(1);
      expect(recent[0].location).toEqual(location);
      expect(recent[0].accessCount).toBe(1);
    });

    it('should increment access count for existing recent location', () => {
      const location = mockLocations[0];

      component['selectLocation'](location);
      component['selectLocation'](location);

      const recent = component['recentLocations']();
      expect(recent.length).toBe(1);
      expect(recent[0].accessCount).toBe(2);
    });

    it('should limit recent locations to maxRecentLocations', () => {
      componentRef.setInput('maxRecentLocations', 3);
      fixture.detectChanges();

      // Add more than max locations
      for (let i = 0; i < 5; i++) {
        component['selectLocation'](mockLocations[i % mockLocations.length]);
      }

      const recent = component['recentLocations']();
      expect(recent.length).toBeLessThanOrEqual(3);
    });

    it('should persist recent locations to localStorage', () => {
      const location = mockLocations[0];

      component['selectLocation'](location);

      const stored = localStorage.getItem('ax-location-picker-recent');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
    });

    it('should load recent locations from localStorage', () => {
      const recentData = [
        {
          location: mockLocations[0],
          lastAccessed: new Date().toISOString(),
          accessCount: 5,
        },
      ];

      localStorage.setItem(
        'ax-location-picker-recent',
        JSON.stringify(recentData),
      );

      component['loadRecentLocations']();

      const recent = component['recentLocations']();
      expect(recent.length).toBe(1);
      expect(recent[0].accessCount).toBe(5);
    });
  });

  // =============================================================================
  // FAVORITE LOCATIONS TESTS
  // =============================================================================

  describe('Favorite Locations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle favorite', () => {
      const location = mockLocations[0];
      let toggleEvent;

      component.onFavoriteToggle.subscribe((event) => {
        toggleEvent = event;
      });

      component['toggleFavorite'](location);

      expect(component['isFavorite'](location)).toBe(true);
      expect(toggleEvent).toBeDefined();
    });

    it('should remove favorite on second toggle', () => {
      const location = mockLocations[0];

      component['toggleFavorite'](location);
      expect(component['isFavorite'](location)).toBe(true);

      component['toggleFavorite'](location);
      expect(component['isFavorite'](location)).toBe(false);
    });

    it('should persist favorites to localStorage', () => {
      const location = mockLocations[0];

      component['toggleFavorite'](location);

      const stored = localStorage.getItem('ax-location-picker-favorites');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
    });

    it('should load favorites from localStorage', () => {
      const favoritesData = [
        {
          location: mockLocations[0],
          addedAt: new Date().toISOString(),
        },
      ];

      localStorage.setItem(
        'ax-location-picker-favorites',
        JSON.stringify(favoritesData),
      );

      component['loadFavoriteLocations']();

      const favorites = component['favoriteLocations']();
      expect(favorites.length).toBe(1);
    });
  });

  // =============================================================================
  // UTILITY METHODS TESTS
  // =============================================================================

  describe('Utility Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get correct icon for location type', () => {
      expect(component['getLocationIcon'](LocationType.Warehouse)).toBe(
        'warehouse',
      );
      expect(component['getLocationIcon'](LocationType.Zone)).toBe('layers');
      expect(component['getLocationIcon'](LocationType.Aisle)).toBe(
        'view_week',
      );
      expect(component['getLocationIcon'](LocationType.Shelf)).toBe('shelves');
      expect(component['getLocationIcon'](LocationType.Bin)).toBe(
        'inventory_2',
      );
    });

    it('should get correct status color class', () => {
      expect(component['getStatusColorClass'](LocationStatus.Active)).toBe(
        'text-success-700',
      );
      expect(component['getStatusColorClass'](LocationStatus.Inactive)).toBe(
        'text-neutral-500',
      );
      expect(component['getStatusColorClass'](LocationStatus.Maintenance)).toBe(
        'text-warning-700',
      );
      expect(component['getStatusColorClass'](LocationStatus.Full)).toBe(
        'text-error-700',
      );
    });

    it('should get correct capacity color class', () => {
      expect(component['getCapacityColorClass'](95)).toBe('text-error-700');
      expect(component['getCapacityColorClass'](75)).toBe('text-warning-700');
      expect(component['getCapacityColorClass'](50)).toBe('text-success-700');
    });

    it('should format capacity correctly', () => {
      expect(component['formatCapacity'](100, 200)).toBe('100/200');
      expect(component['formatCapacity'](undefined, 200)).toBe('');
      expect(component['formatCapacity'](100, undefined)).toBe('');
    });
  });

  // =============================================================================
  // TREE CONTROL TESTS
  // =============================================================================

  describe('Tree Control', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should transform location node to flat node', () => {
      const location = mockLocations[0];
      const flatNode = component['transformer'](location, 0);

      expect(flatNode.id).toBe(location.id);
      expect(flatNode.code).toBe(location.code);
      expect(flatNode.level).toBe(0);
      expect(flatNode.expandable).toBe(true);
    });

    it('should detect if node has children', () => {
      const location = mockLocations[0];
      const flatNode = component['transformer'](location, 0);

      expect(component['hasChild'](0, flatNode)).toBe(true);
    });

    it('should toggle node expansion and emit event', () => {
      const location = mockLocations[0];
      const flatNode = component['transformer'](location, 0);
      let expandEvent;

      component.onNodeExpand.subscribe((event) => {
        expandEvent = event;
      });

      component['toggleNode'](flatNode);

      expect(expandEvent).toBeDefined();
      expect(component['expandedNodeIds']().has(flatNode.id)).toBe(true);
    });
  });

  // =============================================================================
  // COMPUTED SIGNALS TESTS
  // =============================================================================

  describe('Computed Signals', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should detect if search has results', () => {
      expect(component['hasSearchResults']()).toBe(true);

      component['searchTerm'].set('nonexistent-location-xyz');
      fixture.detectChanges();

      expect(component['hasSearchResults']()).toBe(false);
    });

    it('should sort recent locations by access time', () => {
      const location1 = mockLocations[0];
      const location2 = mockLocations[1];

      component['selectLocation'](location1);
      // Wait a bit to ensure different timestamps
      component['selectLocation'](location2);

      const sorted = component['sortedRecentLocations']();
      expect(sorted[0].location).toEqual(location2);
    });

    it('should sort favorite locations by added time', () => {
      const location1 = mockLocations[0];
      const location2 = mockLocations[1];

      component['toggleFavorite'](location1);
      component['toggleFavorite'](location2);

      const sorted = component['sortedFavoriteLocations']();
      expect(sorted[0].location).toEqual(location2);
    });
  });
});
