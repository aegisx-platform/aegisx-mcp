/**
 * Department Form Dialog Component
 * ===================================
 * Handles create and edit operations for departments with comprehensive validation
 *
 * Features:
 * - Create/Edit mode support (REQ-1 AC 3-7)
 * - Reactive form with validation (required, pattern, length)
 * - Parent department selection with hierarchy display (REQ-4 AC 1-4)
 * - Circular reference prevention (REQ-4 AC 3-4)
 * - Active/Inactive toggle (REQ-1 AC 11)
 * - Duplicate dept_code error handling (409 Conflict)
 * - Real-time validation feedback
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DepartmentService } from '../../services/departments.service';
import type {
  Department,
  DepartmentFormDialogData,
} from '../../types/departments-ui.types';

/**
 * Parent department option with hierarchy indentation
 */
interface ParentDepartmentOption {
  id: number;
  dept_name: string; // Original name without indentation
  displayName: string; // Name with indentation prefix
  level: number;
  disabled: boolean;
  hierarchyPath?: string; // Full path from root (e.g., "Engineering > Backend Team")
}

@Component({
  selector: 'app-department-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './department-form-dialog.component.html',
  styleUrls: ['./department-form-dialog.component.scss'],
})
export class DepartmentFormDialogComponent implements OnInit {
  // Injected dependencies
  private dialogRef = inject(MatDialogRef<DepartmentFormDialogComponent>);
  private dialogData = inject<DepartmentFormDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private snackBar = inject(MatSnackBar);

  // Signals for reactive state
  loading = signal(false);
  parentDepartments = signal<Department[]>([]);
  parentOptions = signal<ParentDepartmentOption[]>([]);

  // Computed values
  mode = computed(() => this.dialogData.mode);
  isEditMode = computed(() => this.mode() === 'edit');
  dialogTitle = computed(() =>
    this.isEditMode() ? 'Edit Department' : 'Create Department'
  );
  submitButtonText = computed(() =>
    this.isEditMode() ? 'Update' : 'Create'
  );

  // Form group
  form!: FormGroup;

  // Validation patterns
  private readonly DEPT_CODE_PATTERN = /^[A-Z0-9_-]+$/;

  ngOnInit(): void {
    this.initializeForm();
    this.loadParentDepartments();
  }

  /**
   * Initialize the reactive form with validators
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      dept_code: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          Validators.pattern(this.DEPT_CODE_PATTERN),
        ],
      ],
      dept_name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(200),
        ],
      ],
      parent_id: [null, [this.validateCircularReference.bind(this)]],
      is_active: [true],
    });

    // Pre-fill form if in edit mode
    if (this.isEditMode() && this.dialogData.department) {
      const dept = this.dialogData.department;
      this.form.patchValue({
        dept_code: dept.dept_code,
        dept_name: dept.dept_name,
        parent_id: dept.parent_id,
        is_active: dept.is_active ?? true,
      });
    }
  }

  /**
   * Load all active departments for parent selection dropdown
   */
  private async loadParentDepartments(): Promise<void> {
    try {
      this.loading.set(true);
      const departments = await this.departmentService.getDepartmentsForDropdown();
      this.parentDepartments.set(departments);
      this.buildHierarchicalOptions();
    } catch (error) {
      console.error('Failed to load parent departments:', error);
      this.snackBar.open('Failed to load parent departments', 'Close', {
        duration: 3000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Build hierarchical dropdown options with indentation
   * In edit mode, excludes current department and all descendants
   */
  private buildHierarchicalOptions(): void {
    const departments = this.parentDepartments();
    const currentDeptId = this.dialogData.department?.id;

    // Build hierarchy tree
    const deptMap = new Map<number, Department>();
    departments.forEach((dept) => deptMap.set(dept.id, dept));

    // Get all descendant IDs if in edit mode
    const excludedIds = new Set<number>();
    if (currentDeptId) {
      excludedIds.add(currentDeptId);
      this.collectDescendants(currentDeptId, deptMap, excludedIds);
    }

    // Build options with hierarchy levels
    const options: ParentDepartmentOption[] = [];

    const buildOptions = (
      parentId: number | null,
      level: number,
      ancestorPath: string[] = []
    ): void => {
      const children = departments.filter(
        (dept) => dept.parent_id === parentId
      );

      children.forEach((dept) => {
        const isExcluded = excludedIds.has(dept.id);
        const indent = '-- '.repeat(level);
        const displayName = level > 0
          ? `${indent}${dept.dept_name}`
          : dept.dept_name;

        // Build hierarchy path for display (e.g., "Engineering > Backend Team")
        const currentPath = [...ancestorPath, dept.dept_name];
        const hierarchyPath = currentPath.join(' > ');

        options.push({
          id: dept.id,
          dept_name: dept.dept_name,
          displayName,
          level,
          disabled: isExcluded,
          hierarchyPath: level > 0 ? hierarchyPath : undefined,
        });

        // Recursively add children
        if (!isExcluded) {
          buildOptions(dept.id, level + 1, currentPath);
        }
      });
    };

    // Start building from root departments (parent_id = null)
    buildOptions(null, 0);

    this.parentOptions.set(options);
  }

  /**
   * Recursively collect all descendant department IDs
   * Used to prevent circular references by excluding descendants from parent selection
   */
  private collectDescendants(
    deptId: number,
    deptMap: Map<number, Department>,
    excludedIds: Set<number>
  ): void {
    const departments = this.parentDepartments();
    const children = departments.filter((dept) => dept.parent_id === deptId);

    children.forEach((child) => {
      excludedIds.add(child.id);
      this.collectDescendants(child.id, deptMap, excludedIds);
    });
  }

  /**
   * Validate that selected parent doesn't create circular reference
   * This is a safety check in addition to excluding options
   */
  private validateCircularReference(
    control: AbstractControl
  ): ValidationErrors | null {
    const parentId = control.value;
    if (!parentId || !this.isEditMode()) {
      return null;
    }

    const currentDeptId = this.dialogData.department?.id;
    if (!currentDeptId) {
      return null;
    }

    // Check if selected parent is current department
    if (parentId === currentDeptId) {
      return { circularReference: true };
    }

    // Check if selected parent is a descendant
    const departments = this.parentDepartments();
    const excludedIds = new Set<number>();
    excludedIds.add(currentDeptId);
    this.collectDescendants(
      currentDeptId,
      new Map(departments.map((d) => [d.id, d])),
      excludedIds
    );

    if (excludedIds.has(parentId)) {
      return { circularReference: true };
    }

    return null;
  }

  /**
   * Handle form submission
   */
  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      this.loading.set(true);

      const formValue = this.form.value;
      const departmentData = {
        dept_code: formValue.dept_code,
        dept_name: formValue.dept_name,
        parent_id: formValue.parent_id || null,
        is_active: formValue.is_active,
      };

      let result: Department | null;

      if (this.isEditMode()) {
        const deptId = this.dialogData.department!.id;
        result = await this.departmentService.updateDepartment(
          deptId,
          departmentData
        );
        if (result) {
          this.snackBar.open('Department updated successfully', 'Close', {
            duration: 3000,
          });
        }
      } else {
        result = await this.departmentService.createDepartment(
          departmentData
        );
        if (result) {
          this.snackBar.open('Department created successfully', 'Close', {
            duration: 3000,
          });
        }
      }

      // Close dialog with result (even if null)
      this.dialogRef.close(result);
    } catch (error: any) {
      this.handleError(error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleError(error: any): void {
    console.error('Department operation failed:', error);

    // Handle 409 Conflict (duplicate dept_code)
    if (error.status === 409) {
      this.form.get('dept_code')?.setErrors({ duplicate: true });
      this.snackBar.open(
        'Department code already exists. Please use a different code.',
        'Close',
        { duration: 5000 }
      );
      return;
    }

    // Handle 422 Validation errors
    if (error.status === 422 && error.error?.errors) {
      const errors = error.error.errors;
      Object.keys(errors).forEach((field) => {
        const control = this.form.get(field);
        if (control) {
          control.setErrors({ serverError: errors[field] });
        }
      });
      this.snackBar.open('Please fix validation errors', 'Close', {
        duration: 3000,
      });
      return;
    }

    // Generic error
    const message =
      error.error?.message ||
      error.message ||
      'Failed to save department. Please try again.';
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  /**
   * Cancel and close dialog
   */
  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Get error message for dept_code field
   */
  getDeptCodeError(): string {
    const control = this.form.get('dept_code');
    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Department code is required';
    }
    if (control.errors['minlength']) {
      return 'Department code must be at least 2 characters';
    }
    if (control.errors['maxlength']) {
      return 'Department code cannot exceed 20 characters';
    }
    if (control.errors['pattern']) {
      return 'Department code must contain only uppercase letters, numbers, underscores, and hyphens';
    }
    if (control.errors['duplicate']) {
      return 'Department code already exists';
    }
    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    return '';
  }

  /**
   * Get error message for dept_name field
   */
  getDeptNameError(): string {
    const control = this.form.get('dept_name');
    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Department name is required';
    }
    if (control.errors['minlength']) {
      return 'Department name must be at least 2 characters';
    }
    if (control.errors['maxlength']) {
      return 'Department name cannot exceed 200 characters';
    }
    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    return '';
  }

  /**
   * Get error message for parent_id field with specific department name
   */
  getParentIdError(): string {
    const control = this.form.get('parent_id');
    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['circularReference']) {
      const parentId = control.value;
      if (parentId) {
        const selectedParent = this.parentOptions().find(opt => opt.id === parentId);
        if (selectedParent) {
          const currentDeptName = this.dialogData.department?.dept_name || 'this department';

          // Check if trying to set as own parent
          if (parentId === this.dialogData.department?.id) {
            return `Cannot set "${selectedParent.dept_name}" as parent - a department cannot be its own parent`;
          }

          // It's a descendant
          return `Cannot set "${selectedParent.dept_name}" as parent - it is a descendant of ${currentDeptName}`;
        }
      }
      return 'Cannot create circular reference in department hierarchy';
    }

    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    return '';
  }
}
