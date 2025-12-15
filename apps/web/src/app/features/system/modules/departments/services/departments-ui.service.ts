/**
 * Departments UI Service
 * ===================================
 * Manages reactive UI state for department management
 * supporting REQ-1 (Admin Department Management Interface) acceptance criteria 11-14
 *
 * State Management:
 * - Filter state: search, isActive, parentId, pagination, sorting
 * - Selection state: tracked selected department IDs
 * - Computed signals: active filters status, current filter state
 *
 * This is a UI-only service that does not make HTTP calls.
 * API calls are delegated to the DepartmentsService.
 */

import { Injectable, signal, computed } from '@angular/core';
import type { DepartmentFilterState } from '../types/departments-ui.types';

/**
 * Initial filter state configuration
 * Sets default values for all filter and pagination fields
 */
const INITIAL_FILTER_STATE: DepartmentFilterState = {
  searchTerm: '',
  isActive: null, // null = show all departments
  parentId: null, // null = show root departments
  page: 1,
  pageSize: 25,
  sortBy: 'dept_code',
  sortOrder: 'asc',
};

@Injectable({
  providedIn: 'root',
})
export class DepartmentsUIService {
  // ============================================================================
  // Private State Signals
  // ============================================================================

  /**
   * Current filter and pagination state
   * Tracks all filtering, searching, pagination, and sorting options
   * Updated only through dedicated methods to ensure consistency
   */
  private readonly _filterState = signal<DepartmentFilterState>(
    INITIAL_FILTER_STATE,
  );

  /**
   * Set of selected department IDs
   * Tracks which departments are currently selected in the UI
   * Used for bulk operations and multi-select functionality
   */
  private readonly _selectedDepartmentIds = signal<Set<number>>(new Set());

  // ============================================================================
  // Public Read-Only Signals
  // ============================================================================

  /**
   * Read-only view of the filter state signal
   * Components can observe changes without being able to modify directly
   */
  readonly filterState = this._filterState.asReadonly();

  /**
   * Read-only view of the selected department IDs signal
   * Components can observe selection changes
   */
  readonly selectedDepartmentIds = this._selectedDepartmentIds.asReadonly();

  // ============================================================================
  // Computed Signals
  // ============================================================================

  /**
   * Computed signal: Current filter state
   * Returns the current complete filter state object
   * Useful for components that need the entire state at once
   *
   * Usage:
   * ```typescript
   * const currentFilters = this.departmentsUIService.getFilterState();
   * effect(() => {
   *   console.log(currentFilters());
   * });
   * ```
   */
  readonly getFilterState = computed(() => this._filterState());

  /**
   * Computed signal: Check if any filters are currently active
   * Returns true if any filter differs from the default state
   * Useful for "Clear Filters" button visibility and state
   *
   * Usage:
   * ```typescript
   * <button [disabled]="!departmentsUIService.hasActiveFilters()">
   *   Clear Filters
   * </button>
   * ```
   */
  readonly hasActiveFilters = computed(() => {
    const current = this._filterState();
    return (
      current.searchTerm !== '' ||
      current.isActive !== null ||
      current.parentId !== null ||
      current.page !== 1 ||
      current.pageSize !== 25 ||
      current.sortBy !== 'dept_code' ||
      current.sortOrder !== 'asc'
    );
  });

  /**
   * Computed signal: Number of selected departments
   * Returns count of selected department IDs
   * Useful for bulk action indicators (e.g., "Delete 5 departments")
   */
  readonly selectionCount = computed(() => this._selectedDepartmentIds().size);

  /**
   * Computed signal: Whether any departments are selected
   * Returns true if at least one department is selected
   * Useful for enabling/disabling bulk action buttons
   */
  readonly hasSelection = computed(() => this.selectionCount() > 0);

  constructor() {
    // Service initialization - no special setup needed for signal-based service
  }

  // ============================================================================
  // Filter Update Methods
  // ============================================================================

  /**
   * Update a single filter field
   * @param key - The filter field key to update
   * @param value - The new value for the field
   *
   * Usage:
   * ```typescript
   * departmentsUIService.updateFilter('searchTerm', 'HR');
   * departmentsUIService.updateFilter('isActive', true);
   * departmentsUIService.updateFilter('pageSize', 50);
   * ```
   */
  updateFilter(key: keyof DepartmentFilterState, value: any): void {
    const current = this._filterState();
    this._filterState.set({
      ...current,
      [key]: value,
      // Reset to page 1 when changing filters (except pagination changes)
      ...(key !== 'page' && key !== 'pageSize' ? { page: 1 } : {}),
    });
  }

  /**
   * Update multiple filter fields at once
   * @param partial - Partial object with fields to update
   *
   * Useful for applying multiple filter changes simultaneously
   * without triggering multiple signal updates
   *
   * Usage:
   * ```typescript
   * departmentsUIService.updateFilters({
   *   searchTerm: 'Finance',
   *   isActive: true,
   *   pageSize: 50,
   * });
   * ```
   */
  updateFilters(partial: Partial<DepartmentFilterState>): void {
    const current = this._filterState();
    const hasFilterChanges =
      'searchTerm' in partial ||
      'isActive' in partial ||
      'parentId' in partial ||
      'sortBy' in partial ||
      'sortOrder' in partial;

    this._filterState.set({
      ...current,
      ...partial,
      // Reset to page 1 if any filter (not pagination) changed
      ...(hasFilterChanges ? { page: 1 } : {}),
    });
  }

  /**
   * Apply search term to filter departments
   * Searches across dept_code and dept_name (server-side)
   * @param term - Search text (empty string to clear search)
   *
   * Usage:
   * ```typescript
   * departmentsUIService.applySearch('HR');
   * ```
   */
  applySearch(term: string): void {
    this.updateFilter('searchTerm', term);
  }

  /**
   * Update pagination settings
   * @param page - Page number (1-indexed)
   * @param pageSize - Items per page (10, 25, 50, or 100)
   *
   * Usage:
   * ```typescript
   * departmentsUIService.setPagination(2, 50);
   * ```
   */
  setPagination(page: number, pageSize: number): void {
    this.updateFilters({
      page,
      pageSize,
    });
  }

  /**
   * Set active/inactive filter
   * @param isActive - null (all), true (active only), false (inactive only)
   *
   * Usage:
   * ```typescript
   * departmentsUIService.setActiveFilter(true);  // Show only active departments
   * departmentsUIService.setActiveFilter(null);  // Show all departments
   * ```
   */
  setActiveFilter(isActive: boolean | null): void {
    this.updateFilter('isActive', isActive);
  }

  /**
   * Set parent department filter
   * @param parentId - null (root departments), or specific parent ID
   *
   * Usage:
   * ```typescript
   * departmentsUIService.setParentFilter(5);  // Show children of dept ID 5
   * departmentsUIService.setParentFilter(null);  // Show root departments
   * ```
   */
  setParentFilter(parentId: number | null): void {
    this.updateFilter('parentId', parentId);
  }

  /**
   * Set sorting order
   * @param sortBy - Field to sort by (e.g., 'dept_code', 'dept_name')
   * @param sortOrder - 'asc' or 'desc'
   *
   * Usage:
   * ```typescript
   * departmentsUIService.setSort('dept_name', 'desc');
   * ```
   */
  setSort(sortBy: string, sortOrder: 'asc' | 'desc'): void {
    this.updateFilters({
      sortBy,
      sortOrder,
    });
  }

  // ============================================================================
  // Reset Methods
  // ============================================================================

  /**
   * Reset all filters to default/initial state
   * Returns to showing all departments, page 1, default pagination
   *
   * Usage:
   * ```typescript
   * departmentsUIService.resetFilters();
   * ```
   */
  resetFilters(): void {
    this._filterState.set({ ...INITIAL_FILTER_STATE });
  }

  // ============================================================================
  // Selection Methods
  // ============================================================================

  /**
   * Toggle selection of a single department
   * Adds to selection if not present, removes if already selected
   * @param id - Department ID to toggle
   *
   * Usage:
   * ```typescript
   * departmentsUIService.toggleDepartmentSelection(5);
   * ```
   */
  toggleDepartmentSelection(id: number): void {
    const current = this._selectedDepartmentIds();
    const updated = new Set(current);

    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }

    this._selectedDepartmentIds.set(updated);
  }

  /**
   * Check if a specific department is selected
   * @param id - Department ID to check
   * @returns true if the department is selected
   *
   * Usage:
   * ```typescript
   * if (departmentsUIService.isSelected(5)) {
   *   console.log('Department 5 is selected');
   * }
   * ```
   */
  isSelected(id: number): boolean {
    return this._selectedDepartmentIds().has(id);
  }

  /**
   * Clear all selected departments
   *
   * Usage:
   * ```typescript
   * departmentsUIService.clearSelection();
   * ```
   */
  clearSelection(): void {
    this._selectedDepartmentIds.set(new Set());
  }

  /**
   * Get array of selected department IDs
   * @returns Array of selected IDs (snapshot at call time)
   *
   * Usage:
   * ```typescript
   * const selectedIds = departmentsUIService.getSelectedIds();
   * console.log(selectedIds); // [1, 5, 10]
   * ```
   */
  getSelectedIds(): number[] {
    return Array.from(this._selectedDepartmentIds());
  }

  /**
   * Select multiple departments at once
   * Replaces current selection with provided IDs
   * @param ids - Array of department IDs to select
   *
   * Usage:
   * ```typescript
   * departmentsUIService.setSelection([1, 2, 3]);
   * ```
   */
  setSelection(ids: number[]): void {
    this._selectedDepartmentIds.set(new Set(ids));
  }

  /**
   * Add multiple departments to current selection
   * Does not clear existing selections
   * @param ids - Array of department IDs to add
   *
   * Usage:
   * ```typescript
   * departmentsUIService.addToSelection([4, 5]);
   * ```
   */
  addToSelection(ids: number[]): void {
    const current = this._selectedDepartmentIds();
    const updated = new Set(current);
    ids.forEach((id) => updated.add(id));
    this._selectedDepartmentIds.set(updated);
  }

  /**
   * Remove multiple departments from selection
   * @param ids - Array of department IDs to remove
   *
   * Usage:
   * ```typescript
   * departmentsUIService.removeFromSelection([1, 2]);
   * ```
   */
  removeFromSelection(ids: number[]): void {
    const current = this._selectedDepartmentIds();
    const updated = new Set(current);
    ids.forEach((id) => updated.delete(id));
    this._selectedDepartmentIds.set(updated);
  }
}
