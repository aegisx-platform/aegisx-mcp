/**
 * Department Hierarchy View Component
 * ======================================
 * Displays department hierarchy as an expandable/collapsible tree structure
 *
 * Requirements:
 * - REQ-4 AC 5: Display hierarchy levels with indentation
 * - REQ-4 AC 6: Call GET /v1/platform/departments/hierarchy
 * - REQ-4 AC 7: Display tree structure with expand/collapse controls
 *
 * Features:
 * - Material Tree with nested nodes
 * - Expand/collapse all functionality
 * - Department count per branch (total descendants)
 * - Visual indication of inactive departments
 * - Click to select department
 * - Handles orphaned nodes gracefully
 */

import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';

import type {
  Department,
  DepartmentHierarchyNode,
} from '../../types/departments-ui.types';
import { DepartmentService } from '../../services/departments.service';

@Component({
  selector: 'app-department-hierarchy-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './department-hierarchy-view.component.html',
  styleUrl: './department-hierarchy-view.component.scss',
})
export class DepartmentHierarchyViewComponent implements OnInit {
  private departmentService = inject(DepartmentService);

  // Signals for state management
  loading = signal(false);
  error = signal<string | null>(null);
  selectedNodeId = signal<number | null>(null);

  // Tree control and data source
  treeControl = new NestedTreeControl<DepartmentHierarchyNode>(
    (node) => node.children
  );
  dataSource = new MatTreeNestedDataSource<DepartmentHierarchyNode>();

  // Event emitter for selected department
  @Output() selectedDepartment = new EventEmitter<Department>();

  ngOnInit(): void {
    this.loadHierarchy();
  }

  /**
   * Load department hierarchy from API
   * REQ-4 AC 6: Call GET /v1/platform/departments/hierarchy
   */
  async loadHierarchy(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const departments = await this.departmentService.loadDepartmentHierarchy();
      const treeNodes = this.buildTree(departments);

      this.dataSource.data = treeNodes;
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load department hierarchy');
      console.error('Error loading hierarchy:', err);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Build hierarchical tree structure from flat department list
   * REQ-4 AC 5: Display hierarchy levels with indentation
   *
   * Algorithm:
   * 1. Create map for O(1) lookups
   * 2. Create tree nodes from departments
   * 3. Build parent-child relationships
   * 4. Calculate descendant counts
   * 5. Handle orphaned nodes (missing parents)
   */
  buildTree(departments: Department[]): DepartmentHierarchyNode[] {
    // Create map for quick lookup
    const map = new Map<number, DepartmentHierarchyNode>();
    const roots: DepartmentHierarchyNode[] = [];

    // First pass: Create all nodes
    departments.forEach((dept) => {
      const node: DepartmentHierarchyNode = {
        id: dept.id,
        dept_code: dept.dept_code,
        dept_name: dept.dept_name,
        parent_id: dept.parent_id ?? null,
        is_active: dept.is_active ?? true,
        children: [],
        level: 0,
        expandable: false,
      };
      map.set(dept.id, node);
    });

    // Second pass: Build hierarchy
    departments.forEach((dept) => {
      const node = map.get(dept.id);
      if (!node) return;

      if (dept.parent_id === null || dept.parent_id === undefined) {
        // Root node
        roots.push(node);
      } else {
        const parent = map.get(dept.parent_id);
        if (parent) {
          // Valid parent found
          parent.children.push(node);
          node.level = parent.level + 1;
          parent.expandable = true;
        } else {
          // Orphaned node (parent doesn't exist) - add as root
          console.warn(
            `Department ${dept.dept_code} has missing parent_id ${dept.parent_id}, treating as root`
          );
          roots.push(node);
        }
      }
    });

    // Sort children by dept_code at each level
    const sortChildren = (nodes: DepartmentHierarchyNode[]) => {
      nodes.sort((a, b) => a.dept_code.localeCompare(b.dept_code));
      nodes.forEach((node) => {
        if (node.children.length > 0) {
          sortChildren(node.children);
        }
      });
    };
    sortChildren(roots);

    return roots;
  }

  /**
   * Check if node has children
   * REQ-4 AC 7: Display tree structure with expand/collapse controls
   */
  hasChild = (_: number, node: DepartmentHierarchyNode): boolean => {
    return node.expandable && node.children.length > 0;
  };

  /**
   * Get node depth level
   * REQ-4 AC 5: Display hierarchy levels with indentation
   */
  getLevel(node: DepartmentHierarchyNode): number {
    return node.level;
  }

  /**
   * Select a department node
   * Emits the selected department and highlights it
   */
  selectNode(node: DepartmentHierarchyNode): void {
    this.selectedNodeId.set(node.id);

    // Convert hierarchy node back to Department for emission
    const department: Department = {
      id: node.id,
      dept_code: node.dept_code,
      dept_name: node.dept_name,
      parent_id: node.parent_id,
      is_active: node.is_active,
    };

    this.selectedDepartment.emit(department);
  }

  /**
   * Check if node is currently selected
   */
  isSelected(node: DepartmentHierarchyNode): boolean {
    return this.selectedNodeId() === node.id;
  }

  /**
   * Expand all tree nodes
   * REQ-4 AC 7: Display tree structure with expand/collapse controls
   */
  expandAll(): void {
    this.treeControl.expandAll();
  }

  /**
   * Collapse all tree nodes
   * REQ-4 AC 7: Display tree structure with expand/collapse controls
   */
  collapseAll(): void {
    this.treeControl.collapseAll();
  }

  /**
   * Count total descendants of a node (recursive)
   */
  countDescendants(node: DepartmentHierarchyNode): number {
    if (node.children.length === 0) {
      return 0;
    }

    let count = node.children.length;
    node.children.forEach((child) => {
      count += this.countDescendants(child);
    });

    return count;
  }

  /**
   * Get display text for node
   */
  getNodeDisplayText(node: DepartmentHierarchyNode): string {
    return `${node.dept_code} - ${node.dept_name}`;
  }

  /**
   * Check if tree has data
   */
  hasData(): boolean {
    return this.dataSource.data.length > 0;
  }
}
