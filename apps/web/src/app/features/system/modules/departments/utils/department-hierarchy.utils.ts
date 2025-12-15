/**
 * Department Hierarchy Utilities
 * ===================================
 * Utility functions for building and managing department hierarchy paths
 *
 * REQ-3 AC 4: Show full hierarchy path (e.g., "Engineering > Backend Team")
 * REQ-3 AC 6: Fetch department details from API
 */

import type { Department } from '../types/departments-ui.types';
import type { DepartmentService } from '../services/departments.service';

/**
 * Builds department hierarchy breadcrumb path
 *
 * @param departmentId - The ID of the department to build path for
 * @param departmentService - Instance of DepartmentService for API calls
 * @param cache - Optional cache to avoid redundant API calls
 * @returns Promise resolving to breadcrumb string (e.g., "Engineering > Backend Team > API Squad")
 *
 * @example
 * ```typescript
 * const path = await buildDepartmentPath(42, departmentService);
 * // Returns: "Engineering > Backend Team > API Squad"
 * ```
 *
 * Features:
 * - Recursively traverses parent hierarchy
 * - Caches departments to minimize API calls
 * - Protects against circular references
 * - Handles missing or deleted departments gracefully
 */
export async function buildDepartmentPath(
  departmentId: number,
  departmentService: DepartmentService,
  cache: Map<number, Department> = new Map()
): Promise<string> {
  // Track visited IDs to prevent infinite loops from circular references
  const visited = new Set<number>();

  // Array to store department names in order (root to leaf)
  const path: string[] = [];

  /**
   * Recursive function to traverse up the hierarchy
   * @param id - Current department ID
   */
  async function traverse(id: number): Promise<void> {
    // Circular reference protection
    if (visited.has(id)) {
      console.warn(`Circular reference detected in department hierarchy: ${id}`);
      return;
    }
    visited.add(id);

    try {
      // Check cache first to avoid redundant API calls
      let dept = cache.get(id);

      if (!dept) {
        // Fetch from API if not in cache
        const fetchedDept = await departmentService.loadDepartmentById(id);
        if (fetchedDept) {
          dept = fetchedDept;
          cache.set(id, dept);
        } else {
          // Department not found
          path.unshift('[Unknown Department]');
          return;
        }
      }

      // Add department name to the beginning of the path array
      // This ensures proper order when building breadcrumb
      path.unshift(dept.dept_name);

      // If department has a parent, recursively fetch parent
      if (dept.parent_id) {
        await traverse(dept.parent_id);
      }
    } catch (error) {
      console.error(`Failed to load department ${id}:`, error);
      // Add placeholder for failed department
      path.unshift('[Unknown Department]');
    }
  }

  // Start traversal from the requested department
  await traverse(departmentId);

  // Join path segments with " > " separator
  return path.join(' > ');
}

/**
 * Builds department path from cached hierarchy data
 * This is a synchronous version that doesn't make API calls
 *
 * @param departmentId - The ID of the department
 * @param allDepartments - Complete list of all departments
 * @returns Breadcrumb string or null if department not found
 *
 * @example
 * ```typescript
 * const path = buildDepartmentPathFromCache(42, departments);
 * // Returns: "Engineering > Backend Team"
 * ```
 */
export function buildDepartmentPathFromCache(
  departmentId: number,
  allDepartments: Department[]
): string | null {
  // Create lookup map for fast access
  const deptMap = new Map<number, Department>();
  allDepartments.forEach(dept => deptMap.set(dept.id, dept));

  // Track visited to prevent circular references
  const visited = new Set<number>();
  const path: string[] = [];

  let currentId: number | null | undefined = departmentId;

  while (currentId) {
    // Circular reference protection
    if (visited.has(currentId)) {
      console.warn(`Circular reference detected: ${currentId}`);
      break;
    }
    visited.add(currentId);

    const dept = deptMap.get(currentId);
    if (!dept) {
      console.warn(`Department ${currentId} not found in cache`);
      break;
    }

    // Add to beginning of path
    path.unshift(dept.dept_name);

    // Move to parent
    currentId = dept.parent_id;
  }

  return path.length > 0 ? path.join(' > ') : null;
}

/**
 * Gets the root department for a given department
 *
 * @param departmentId - The ID of the department
 * @param departmentService - Instance of DepartmentService
 * @returns Promise resolving to root department
 */
export async function getRootDepartment(
  departmentId: number,
  departmentService: DepartmentService
): Promise<Department> {
  const cache = new Map<number, Department>();
  const visited = new Set<number>();

  let currentId = departmentId;
  let rootDept: Department | null = null;

  while (currentId) {
    if (visited.has(currentId)) {
      throw new Error(`Circular reference in department hierarchy: ${currentId}`);
    }
    visited.add(currentId);

    let dept = cache.get(currentId);
    if (!dept) {
      const fetchedDept = await departmentService.loadDepartmentById(currentId);
      if (!fetchedDept) {
        throw new Error(`Department not found: ${currentId}`);
      }
      dept = fetchedDept;
      cache.set(currentId, dept);
    }

    rootDept = dept;

    if (!dept.parent_id) {
      break;
    }

    currentId = dept.parent_id;
  }

  if (!rootDept) {
    throw new Error(`Failed to find root department for ${departmentId}`);
  }

  return rootDept;
}

/**
 * Calculates the depth level of a department in the hierarchy
 *
 * @param departmentId - The ID of the department
 * @param departmentService - Instance of DepartmentService
 * @returns Promise resolving to depth level (0 = root)
 */
export async function getDepartmentDepth(
  departmentId: number,
  departmentService: DepartmentService
): Promise<number> {
  const cache = new Map<number, Department>();
  const visited = new Set<number>();

  let depth = 0;
  let currentId: number | null = departmentId;

  while (currentId) {
    if (visited.has(currentId)) {
      throw new Error(`Circular reference in department hierarchy: ${currentId}`);
    }
    visited.add(currentId);

    let dept = cache.get(currentId);
    if (!dept) {
      const fetchedDept = await departmentService.loadDepartmentById(currentId);
      if (!fetchedDept) {
        throw new Error(`Department not found: ${currentId}`);
      }
      dept = fetchedDept;
      cache.set(currentId, dept);
    }

    if (!dept.parent_id) {
      break;
    }

    depth++;
    currentId = dept.parent_id;
  }

  return depth;
}
