/**
 * Department Management UI Types
 * ===================================
 * Comprehensive TypeScript interfaces for department management UI
 * supporting REQ-1 (Admin Department Management Interface) and
 * REQ-4 (Department Hierarchy Management)
 *
 * These types provide type-safe data structures for:
 * - Form data handling (create/edit dialogs)
 * - Filter state management
 * - Department hierarchy tree nodes
 * - UI state management
 * - Summary displays
 * - Dialog data passing
 */

// ===== CORE ENTITY TYPES =====

/**
 * Department entity
 * Represents a department in the system
 * This is a minimal interface matching the API response structure
 */
export interface Department {
  id: number;
  dept_code: string;
  dept_name: string;
  his_code?: string | null;
  parent_id?: number | null;
  consumption_group?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// ===== FORM DATA TYPES =====

/**
 * DepartmentFormData
 * Data structure for create/edit department dialog forms
 *
 * Used when:
 * - Creating a new department
 * - Editing an existing department
 * - Submitting form data to the API
 *
 * Properties:
 * - dept_code: Unique department code identifier
 * - dept_name: Display name of the department
 * - parent_id: ID of the parent department (for hierarchy), null if root
 * - is_active: Whether the department is active/visible in the system
 */
export interface DepartmentFormData {
  dept_code: string;
  dept_name: string;
  parent_id: number | null;
  is_active: boolean;
}

// ===== FILTER STATE TYPES =====

/**
 * DepartmentFilterState
 * Manages the current filter and pagination state for department lists
 *
 * Used by:
 * - List component to track current filters
 * - Service to build API query parameters
 * - UI to display active filters
 *
 * Properties:
 * - searchTerm: Text search across dept_code and dept_name
 * - isActive: Filter by active/inactive status
 *   - null: Show all departments
 *   - true: Show only active departments
 *   - false: Show only inactive departments
 * - parentId: Filter departments by parent (null = root departments)
 * - page: Current page number (1-indexed)
 * - pageSize: Number of items per page
 * - sortBy: Field name to sort by (e.g., 'dept_code', 'dept_name')
 * - sortOrder: Sort direction ('asc' for ascending, 'desc' for descending)
 */
export interface DepartmentFilterState {
  searchTerm: string;
  isActive: boolean | null;
  parentId: number | null;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// ===== HIERARCHY TREE TYPES =====

/**
 * DepartmentHierarchyNode
 * Tree node structure for representing the department hierarchy
 *
 * Used by:
 * - Hierarchy tree component to display parent-child relationships
 * - Department tree view with expand/collapse functionality
 * - Breadcrumb navigation showing department path
 *
 * Properties:
 * - id: Unique identifier for the department
 * - dept_code: Department code
 * - dept_name: Department name
 * - parent_id: ID of parent department (null if root node)
 * - is_active: Active status of department
 * - children: Array of child DepartmentHierarchyNode objects
 * - level: Depth level in the tree (0 = root)
 * - expandable: Whether this node has or can have children
 */
export interface DepartmentHierarchyNode {
  id: number;
  dept_code: string;
  dept_name: string;
  parent_id: number | null;
  is_active: boolean;
  children: DepartmentHierarchyNode[];
  level: number;
  expandable: boolean;
}

// ===== UI STATE TYPES =====

/**
 * DepartmentUIState
 * Complete UI state for the department management module
 *
 * Used by:
 * - State management service/store (NgRx, signals, etc.)
 * - Components to access current application state
 * - For data binding and change detection
 *
 * Properties:
 * - departments: Array of current departments being displayed
 * - isLoading: Loading indicator state
 * - totalCount: Total number of departments in the system
 * - filters: Current filter and pagination state (DepartmentFilterState)
 */
export interface DepartmentUIState {
  departments: Department[];
  isLoading: boolean;
  totalCount: number;
  filters: DepartmentFilterState;
}

// ===== SUMMARY DISPLAY TYPES =====

/**
 * DepartmentSummary
 * Simplified department information for display purposes
 *
 * Used by:
 * - Dropdown/select lists
 * - Breadcrumb components
 * - Quick reference displays
 * - Autocomplete suggestions
 *
 * Properties:
 * - id: Unique identifier
 * - dept_code: Department code (unique)
 * - dept_name: Display name
 */
export interface DepartmentSummary {
  id: number;
  dept_code: string;
  dept_name: string;
}

// ===== DIALOG DATA TYPES =====

/**
 * DepartmentFormDialogData
 * Data passed to the create/edit department dialog
 *
 * Used by:
 * - Dialog component to determine mode (create vs edit)
 * - Pre-population of form fields in edit mode
 * - Submission handler to know which operation to perform
 *
 * Properties:
 * - mode: 'create' for new department, 'edit' for updating existing
 * - department: The department being edited (undefined for create mode)
 */
export interface DepartmentFormDialogData {
  mode: 'create' | 'edit';
  department?: Department;
}

// ===== UTILITY/HELPER TYPES =====

/**
 * DepartmentBreadcrumbItem
 * Single item in a breadcrumb navigation for department hierarchy
 *
 * Used by:
 * - Breadcrumb component
 * - Navigation trails showing path from root to current department
 *
 * Properties:
 * - id: Department ID
 * - name: Department name for display
 * - route: Optional route path for navigation
 */
export interface DepartmentBreadcrumbItem {
  id: number;
  name: string;
  route?: string;
}

/**
 * DepartmentTableColumn
 * Column configuration for department list table
 *
 * Used by:
 * - Table component to render columns
 * - Column visibility/hidden state management
 * - Column header configuration
 *
 * Properties:
 * - field: Department field name to display
 * - header: Display header text
 * - visible: Whether column is visible
 * - sortable: Whether column is sortable
 * - width: Optional column width
 */
export interface DepartmentTableColumn {
  field: keyof Department;
  header: string;
  visible: boolean;
  sortable: boolean;
  width?: string;
}

/**
 * DepartmentAction
 * User action result from department operations
 *
 * Used by:
 * - Dialog/form submission
 * - Bulk operations
 * - Toast notifications
 *
 * Properties:
 * - type: Action type performed
 * - success: Whether action succeeded
 * - message: User-friendly message
 * - data: Operation result data
 */
export interface DepartmentAction {
  type: 'create' | 'update' | 'delete' | 'bulk_delete';
  success: boolean;
  message: string;
  data?: Department | Department[];
}
