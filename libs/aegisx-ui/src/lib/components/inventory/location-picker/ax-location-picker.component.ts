import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import {
  LocationNode,
  FlatLocationNode,
  LocationSelection,
  LocationType,
  LocationStatus,
  SelectionMode,
  BreadcrumbItem,
  RecentLocation,
  FavoriteLocation,
  LocationSelectEvent,
  FavoriteToggleEvent,
  NodeExpandEvent,
  LocationFilter,
  DEFAULT_LOCATION_PICKER_CONFIG,
} from './ax-location-picker.component.types';

/**
 * Location Picker Component
 * ================================================================
 *
 * Hierarchical location/warehouse picker with advanced features:
 * - Multi-level tree navigation (Warehouse → Zone → Aisle → Shelf → Bin)
 * - Search functionality with auto-expand to matches
 * - Breadcrumb navigation
 * - Recent and favorite locations
 * - Single and multi-select modes
 * - Stock capacity indicators
 * - Type filtering
 *
 * @example
 * ```html
 * <ax-location-picker
 *   [locations]="warehouseTree"
 *   [currentLocation]="selectedLocationId"
 *   [showCapacity]="true"
 *   [allowedTypes]="[LocationType.Shelf, LocationType.Bin]"
 *   (onLocationSelect)="handleLocationSelect($event)"
 * />
 * ```
 */
@Component({
  selector: 'ax-location-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatTabsModule,
  ],
  templateUrl: './ax-location-picker.component.html',
  styleUrl: './ax-location-picker.component.scss',
})
export class AxLocationPickerComponent implements OnInit, OnDestroy {
  // =============================================================================
  // INPUTS
  // =============================================================================

  /** Location hierarchy data */
  locations = input.required<LocationNode[]>();

  /** Pre-selected location ID */
  currentLocation = input<string | undefined>(undefined);

  /** Show stock availability */
  showAvailability = input<boolean>(
    DEFAULT_LOCATION_PICKER_CONFIG.showCapacity,
  );

  /** Allowed location types for selection */
  allowedTypes = input<LocationType[] | undefined>(undefined);

  /** Show recent locations */
  showRecent = input<boolean>(DEFAULT_LOCATION_PICKER_CONFIG.showRecent);

  /** Show favorite locations */
  showFavorites = input<boolean>(DEFAULT_LOCATION_PICKER_CONFIG.showFavorites);

  /** Enable search */
  searchable = input<boolean>(DEFAULT_LOCATION_PICKER_CONFIG.searchable);

  /** Show breadcrumb navigation */
  showBreadcrumbs = input<boolean>(
    DEFAULT_LOCATION_PICKER_CONFIG.showBreadcrumbs,
  );

  /** Selection mode */
  selectionMode = input<SelectionMode>(
    DEFAULT_LOCATION_PICKER_CONFIG.selectionMode,
  );

  /** Maximum recent locations */
  maxRecentLocations = input<number>(
    DEFAULT_LOCATION_PICKER_CONFIG.maxRecentLocations,
  );

  // =============================================================================
  // OUTPUTS
  // =============================================================================

  /** Emitted when location is selected */
  onLocationSelect = output<LocationSelection>();

  /** Emitted when favorite is toggled */
  onFavoriteToggle = output<FavoriteToggleEvent>();

  /** Emitted when node is expanded/collapsed */
  onNodeExpand = output<NodeExpandEvent>();

  // =============================================================================
  // INTERNAL STATE (Signals)
  // =============================================================================

  /** Search term */
  protected searchTerm = signal<string>('');

  /** Expanded node IDs */
  protected expandedNodeIds = signal<Set<string>>(new Set());

  /** Selected location(s) */
  protected selectedLocations = signal<LocationNode[]>([]);

  /** Recent locations */
  protected recentLocations = signal<RecentLocation[]>([]);

  /** Favorite locations */
  protected favoriteLocations = signal<FavoriteLocation[]>([]);

  /** Active tab index (0: tree, 1: recent, 2: favorites) */
  protected activeTab = signal<number>(0);

  /** Filter state */
  protected filter = signal<LocationFilter>({});

  // =============================================================================
  // TREE CONTROL
  // =============================================================================

  /** Tree control for flat tree */
  protected treeControl = new FlatTreeControl<FlatLocationNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  /** Tree flattener */
  protected treeFlattener = new MatTreeFlattener<
    LocationNode,
    FlatLocationNode
  >(
    this.transformer.bind(this),
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children || [],
  );

  /** Tree data source */
  protected dataSource = new MatTreeFlatDataSource(
    this.treeControl,
    this.treeFlattener,
  );

  // =============================================================================
  // COMPUTED SIGNALS
  // =============================================================================

  /**
   * Filtered locations based on search and filter
   */
  protected filteredLocations = computed(() => {
    const locations = this.locations();
    const search = this.searchTerm().toLowerCase();
    const filterCriteria = this.filter();

    if (!search && !this.hasActiveFilter()) {
      return locations;
    }

    return this.filterLocationTree(locations, search, filterCriteria);
  });

  /**
   * Breadcrumb trail for selected location
   */
  protected breadcrumbs = computed((): BreadcrumbItem[] => {
    const selected = this.selectedLocations();
    if (selected.length === 0) {
      return [];
    }

    const location = selected[0]; // Use first selected for single mode
    const path = this.getLocationPath(location);

    return path.map((node, index) => ({
      id: node.id,
      code: node.code,
      name: node.name,
      type: node.type,
      isLast: index === path.length - 1,
    }));
  });

  /**
   * Whether search has results
   */
  protected hasSearchResults = computed(() => {
    return this.filteredLocations().length > 0;
  });

  /**
   * Recent locations sorted by access time
   */
  protected sortedRecentLocations = computed(() => {
    return [...this.recentLocations()].sort(
      (a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime(),
    );
  });

  /**
   * Favorite locations sorted by added time
   */
  protected sortedFavoriteLocations = computed(() => {
    return [...this.favoriteLocations()].sort(
      (a, b) => b.addedAt.getTime() - a.addedAt.getTime(),
    );
  });

  // =============================================================================
  // LIFECYCLE HOOKS
  // =============================================================================

  constructor() {
    // Auto-update tree when locations change
    effect(() => {
      const locations = this.filteredLocations();
      this.dataSource.data = locations;
    });

    // Auto-expand to current location
    effect(() => {
      const currentId = this.currentLocation();
      if (currentId) {
        this.expandToLocation(currentId);
      }
    });

    // Auto-expand search results
    effect(() => {
      const search = this.searchTerm();
      if (search) {
        this.expandSearchResults();
      }
    });
  }

  ngOnInit(): void {
    this.loadRecentLocations();
    this.loadFavoriteLocations();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // =============================================================================
  // TREE OPERATIONS
  // =============================================================================

  /**
   * Transform location node to flat node
   */
  private transformer(node: LocationNode, level: number): FlatLocationNode {
    return {
      id: node.id,
      code: node.code,
      name: node.name,
      type: node.type,
      level: level,
      expandable: !!node.children && node.children.length > 0,
      expanded: this.expandedNodeIds().has(node.id),
      stockCount: node.stockCount,
      capacity: node.capacity,
      utilization: node.utilization,
      status: node.status,
      disabled: node.disabled,
    };
  }

  /**
   * Check if node has children
   */
  protected hasChild = (_: number, node: FlatLocationNode): boolean => {
    return node.expandable;
  };

  /**
   * Check if node is expanded
   */
  protected isExpanded(node: FlatLocationNode): boolean {
    return this.treeControl.isExpanded(node);
  }

  /**
   * Toggle node expansion
   */
  protected toggleNode(node: FlatLocationNode): void {
    this.treeControl.toggle(node);

    const expandedIds = this.expandedNodeIds();
    if (this.treeControl.isExpanded(node)) {
      expandedIds.add(node.id);
    } else {
      expandedIds.delete(node.id);
    }
    this.expandedNodeIds.set(new Set(expandedIds));

    this.onNodeExpand.emit({
      nodeId: node.id,
      isExpanded: this.treeControl.isExpanded(node),
      timestamp: new Date(),
    });
  }

  // =============================================================================
  // SELECTION
  // =============================================================================

  /**
   * Select a location
   */
  protected selectLocation(location: LocationNode): void {
    // Check if location type is allowed
    const allowedTypes = this.allowedTypes();
    if (
      allowedTypes &&
      allowedTypes.length > 0 &&
      !allowedTypes.includes(location.type)
    ) {
      return;
    }

    // Check if disabled
    if (location.disabled) {
      return;
    }

    // Handle selection based on mode
    const mode = this.selectionMode();
    if (mode === SelectionMode.Single) {
      this.selectedLocations.set([location]);
    } else {
      const selected = [...this.selectedLocations()];
      const index = selected.findIndex((loc) => loc.id === location.id);

      if (index > -1) {
        selected.splice(index, 1);
      } else {
        selected.push(location);
      }

      this.selectedLocations.set(selected);
    }

    // Emit selection
    const path = this.getLocationPath(location);
    const selection: LocationSelection = {
      location,
      path,
      pathString: path.map((node) => node.code).join(' > '),
    };

    this.onLocationSelect.emit(selection);

    // Add to recent
    this.addToRecent(location);
  }

  /**
   * Check if location is selected
   */
  protected isSelected(location: LocationNode): boolean {
    return this.selectedLocations().some((loc) => loc.id === location.id);
  }

  /**
   * Check if location type is allowed
   */
  protected isLocationAllowed(location: LocationNode): boolean {
    const allowedTypes = this.allowedTypes();
    if (!allowedTypes || allowedTypes.length === 0) {
      return true;
    }
    return allowedTypes.includes(location.type);
  }

  // =============================================================================
  // SEARCH & FILTER
  // =============================================================================

  /**
   * Filter location tree
   */
  private filterLocationTree(
    nodes: LocationNode[],
    searchTerm: string,
    filter: LocationFilter,
  ): LocationNode[] {
    return nodes.reduce<LocationNode[]>((acc, node) => {
      const matchesSearch =
        !searchTerm ||
        node.code.toLowerCase().includes(searchTerm) ||
        node.name.toLowerCase().includes(searchTerm);

      const matchesTypeFilter =
        !filter.types ||
        filter.types.length === 0 ||
        filter.types.includes(node.type);

      const matchesStatusFilter =
        !filter.statuses ||
        filter.statuses.length === 0 ||
        (node.status && filter.statuses.includes(node.status));

      const matchesCapacityFilter =
        filter.minCapacity === undefined ||
        (node.capacity !== undefined && node.capacity >= filter.minCapacity);

      const filteredChildren = node.children
        ? this.filterLocationTree(node.children, searchTerm, filter)
        : [];

      const nodeMatches =
        matchesSearch &&
        matchesTypeFilter &&
        matchesStatusFilter &&
        matchesCapacityFilter;

      if (nodeMatches || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children:
            filteredChildren.length > 0 ? filteredChildren : node.children,
        });
      }

      return acc;
    }, []);
  }

  /**
   * Check if filter is active
   */
  private hasActiveFilter(): boolean {
    const f = this.filter();
    return !!(
      (f.types && f.types.length > 0) ||
      (f.statuses && f.statuses.length > 0) ||
      f.minCapacity !== undefined
    );
  }

  /**
   * Expand all nodes matching search
   */
  private expandSearchResults(): void {
    const search = this.searchTerm().toLowerCase();
    if (!search) return;

    const matchingNodes: string[] = [];
    this.findMatchingNodes(this.locations(), search, matchingNodes);

    matchingNodes.forEach((nodeId) => {
      this.expandToLocation(nodeId);
    });
  }

  /**
   * Find all nodes matching search term
   */
  private findMatchingNodes(
    nodes: LocationNode[],
    search: string,
    results: string[],
  ): void {
    nodes.forEach((node) => {
      if (
        node.code.toLowerCase().includes(search) ||
        node.name.toLowerCase().includes(search)
      ) {
        results.push(node.id);
      }

      if (node.children) {
        this.findMatchingNodes(node.children, search, results);
      }
    });
  }

  /**
   * Clear search
   */
  protected clearSearch(): void {
    this.searchTerm.set('');
  }

  // =============================================================================
  // PATH & NAVIGATION
  // =============================================================================

  /**
   * Get full path from root to location
   */
  private getLocationPath(location: LocationNode): LocationNode[] {
    const path: LocationNode[] = [location];
    let current = location;

    while (current.parentId) {
      const parent = this.findLocationById(current.parentId);
      if (parent) {
        path.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }

    return path;
  }

  /**
   * Find location by ID in tree
   */
  private findLocationById(id: string): LocationNode | null {
    const search = (nodes: LocationNode[]): LocationNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = search(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return search(this.locations());
  }

  /**
   * Expand tree to specific location
   */
  private expandToLocation(locationId: string): void {
    const location = this.findLocationById(locationId);
    if (!location) return;

    const path = this.getLocationPath(location);
    const expandedIds = this.expandedNodeIds();

    path.forEach((node) => {
      expandedIds.add(node.id);
      // Find flat node and expand it
      const flatNode = this.treeControl.dataNodes.find((n) => n.id === node.id);
      if (flatNode && !this.treeControl.isExpanded(flatNode)) {
        this.treeControl.expand(flatNode);
      }
    });

    this.expandedNodeIds.set(new Set(expandedIds));
  }

  /**
   * Navigate to breadcrumb location
   */
  protected navigateToBreadcrumb(item: BreadcrumbItem): void {
    const location = this.findLocationById(item.id);
    if (location) {
      this.selectLocation(location);
    }
  }

  // =============================================================================
  // RECENT & FAVORITES
  // =============================================================================

  /**
   * Add location to recent
   */
  private addToRecent(location: LocationNode): void {
    const recent = [...this.recentLocations()];
    const existing = recent.find((r) => r.location.id === location.id);

    if (existing) {
      existing.lastAccessed = new Date();
      existing.accessCount++;
    } else {
      recent.push({
        location,
        lastAccessed: new Date(),
        accessCount: 1,
      });
    }

    // Keep only max recent
    const sorted = recent.sort(
      (a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime(),
    );
    const trimmed = sorted.slice(0, this.maxRecentLocations());

    this.recentLocations.set(trimmed);
    this.saveRecentLocations();
  }

  /**
   * Toggle favorite
   */
  protected toggleFavorite(location: LocationNode, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const favorites = [...this.favoriteLocations()];
    const index = favorites.findIndex((f) => f.location.id === location.id);

    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push({
        location,
        addedAt: new Date(),
      });
    }

    this.favoriteLocations.set(favorites);
    this.saveFavoriteLocations();

    this.onFavoriteToggle.emit({
      locationId: location.id,
      isFavorite: index === -1,
      timestamp: new Date(),
    });
  }

  /**
   * Check if location is favorited
   */
  protected isFavorite(location: LocationNode): boolean {
    return this.favoriteLocations().some((f) => f.location.id === location.id);
  }

  /**
   * Load recent locations from localStorage
   */
  private loadRecentLocations(): void {
    try {
      const stored = localStorage.getItem('ax-location-picker-recent');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const recent = parsed.map((r: any) => ({
          ...r,
          lastAccessed: new Date(r.lastAccessed),
        }));
        this.recentLocations.set(recent);
      }
    } catch (error) {
      console.error('Failed to load recent locations:', error);
    }
  }

  /**
   * Save recent locations to localStorage
   */
  private saveRecentLocations(): void {
    try {
      localStorage.setItem(
        'ax-location-picker-recent',
        JSON.stringify(this.recentLocations()),
      );
    } catch (error) {
      console.error('Failed to save recent locations:', error);
    }
  }

  /**
   * Load favorite locations from localStorage
   */
  private loadFavoriteLocations(): void {
    try {
      const stored = localStorage.getItem('ax-location-picker-favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const favorites = parsed.map((f: any) => ({
          ...f,
          addedAt: new Date(f.addedAt),
        }));
        this.favoriteLocations.set(favorites);
      }
    } catch (error) {
      console.error('Failed to load favorite locations:', error);
    }
  }

  /**
   * Save favorite locations to localStorage
   */
  private saveFavoriteLocations(): void {
    try {
      localStorage.setItem(
        'ax-location-picker-favorites',
        JSON.stringify(this.favoriteLocations()),
      );
    } catch (error) {
      console.error('Failed to save favorite locations:', error);
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get icon for location type
   */
  protected getLocationIcon(type: LocationType): string {
    switch (type) {
      case LocationType.Warehouse:
        return 'warehouse';
      case LocationType.Zone:
        return 'layers';
      case LocationType.Aisle:
        return 'view_week';
      case LocationType.Shelf:
        return 'shelves';
      case LocationType.Bin:
        return 'inventory_2';
      default:
        return 'place';
    }
  }

  /**
   * Get status color class
   */
  protected getStatusColorClass(status?: LocationStatus): string {
    if (!status) return '';

    switch (status) {
      case LocationStatus.Active:
        return 'text-success-700';
      case LocationStatus.Inactive:
        return 'text-neutral-500';
      case LocationStatus.Maintenance:
        return 'text-warning-700';
      case LocationStatus.Full:
        return 'text-error-700';
      default:
        return '';
    }
  }

  /**
   * Get capacity color class
   */
  protected getCapacityColorClass(utilization?: number): string {
    if (utilization === undefined) return '';

    if (utilization >= 90) return 'text-error-700';
    if (utilization >= 70) return 'text-warning-700';
    return 'text-success-700';
  }

  /**
   * Format capacity display
   */
  protected formatCapacity(stockCount?: number, capacity?: number): string {
    if (stockCount === undefined || capacity === undefined) return '';
    return `${stockCount}/${capacity}`;
  }
}
