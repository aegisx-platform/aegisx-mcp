/**
 * Department Selector Component
 * ===================================
 * Reusable dropdown component for selecting departments with hierarchical display
 *
 * Features:
 * - Implements ControlValueAccessor for seamless reactive forms integration
 * - Hierarchical department display with indentation (REQ-2 AC 2, 4)
 * - Nullable selection support (REQ-2 AC 5)
 * - Signal-based reactive state management
 * - Loading states and error handling
 * - Support for active/inactive filtering
 * - Emits full Department object on selection
 *
 * Usage Example:
 * ```html
 * <app-department-selector
 *   formControlName="department_id"
 *   label="Department"
 *   [required]="false"
 *   (departmentSelected)="onDepartmentSelected($event)"
 * />
 * ```
 *
 * Requirements Mapping:
 * - REQ-2 AC 1: Department dropdown selector
 * - REQ-2 AC 2: Hierarchical display
 * - REQ-2 AC 3: Populates user.department_id
 * - REQ-2 AC 4: Show child departments under parents
 * - REQ-2 AC 5: Allow empty selection
 */

import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatFormFieldModule, MatFormFieldAppearance } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DepartmentService } from '../../services/departments.service';
import type { Department } from '../../types/departments-ui.types';

/**
 * Department option with hierarchical display information
 */
interface DepartmentOption {
  id: number;
  dept_code: string;
  dept_name: string; // Original name without indentation
  displayName: string; // Name with indentation prefix
  level: number;
  hierarchyPath: string; // Full path from root (e.g., "Engineering > Backend Team")
}

@Component({
  selector: 'app-department-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './department-selector.component.html',
  styleUrls: ['./department-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DepartmentSelectorComponent),
      multi: true,
    },
  ],
})
export class DepartmentSelectorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  // Injected dependencies
  private departmentService = inject(DepartmentService);
  private snackBar = inject(MatSnackBar);

  // Signals for reactive state
  departments = signal<Department[]>([]);
  hierarchicalOptions = signal<DepartmentOption[]>([]);
  isLoading = signal(false);
  disabled = signal(false);

  // Form control for mat-select
  selectControl = new FormControl<number | null>(null);

  // ControlValueAccessor callbacks
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  // Component Inputs
  @Input() label = 'Department';
  @Input() placeholder = 'Select department';
  @Input() required = false;
  @Input() showInactive = false;
  @Input() appearance: MatFormFieldAppearance = 'outline';

  // Component Outputs
  @Output() departmentSelected = new EventEmitter<Department | null>();

  ngOnInit(): void {
    this.loadDepartments();

    // Subscribe to select control changes and propagate to parent form
    this.selectControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.onChange(value);
        this.onTouched();
        this.emitSelectedDepartment(value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load departments from API with optional active/inactive filter
   */
  private async loadDepartments(): Promise<void> {
    try {
      this.isLoading.set(true);

      // Build query parameters
      const queryParams: { is_active?: boolean; limit: number } = {
        limit: 1000, // Load all departments for hierarchy
      };

      // Use getDepartmentsForDropdown which returns only active departments
      const departments = await this.departmentService.getDepartmentsForDropdown();
      this.departments.set(departments);
      this.buildHierarchicalOptions();
    } catch (error) {
      console.error('Failed to load departments:', error);
      this.snackBar.open('Failed to load departments', 'Close', {
        duration: 3000,
      });
      this.departments.set([]);
      this.hierarchicalOptions.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Build hierarchical dropdown options with indentation
   * Displays departments in tree structure with visual hierarchy
   */
  private buildHierarchicalOptions(): void {
    const departments = this.departments();
    const options: DepartmentOption[] = [];

    // Recursive function to build options with hierarchy levels
    const buildOptions = (
      parentId: number | null,
      level: number,
      ancestorPath: string[] = []
    ): void => {
      // Find all children of current parent
      const children = departments.filter(dept => dept.parent_id === parentId);

      // Sort children by dept_name for consistent ordering
      children.sort((a, b) => a.dept_name.localeCompare(b.dept_name));

      children.forEach(dept => {
        // Create indentation prefix (-- for each level)
        const indent = '-- '.repeat(level);
        const displayName = level > 0
          ? `${indent}${dept.dept_name}`
          : dept.dept_name;

        // Build hierarchy path for tooltip/display (e.g., "Engineering > Backend Team")
        const currentPath = [...ancestorPath, dept.dept_name];
        const hierarchyPath = currentPath.join(' > ');

        options.push({
          id: dept.id,
          dept_code: dept.dept_code,
          dept_name: dept.dept_name,
          displayName,
          level,
          hierarchyPath,
        });

        // Recursively add children
        buildOptions(dept.id, level + 1, currentPath);
      });
    };

    // Start building from root departments (parent_id = null)
    buildOptions(null, 0);

    this.hierarchicalOptions.set(options);
  }

  /**
   * Emit the selected department object
   */
  private emitSelectedDepartment(deptId: number | null): void {
    if (deptId === null) {
      this.departmentSelected.emit(null);
      return;
    }

    // Find the full department object by ID
    const selectedDept = this.departments().find(dept => dept.id === deptId);
    this.departmentSelected.emit(selectedDept || null);
  }

  // ===== ControlValueAccessor Implementation =====

  /**
   * Write value from parent form control
   * Called when the parent form sets a value programmatically
   */
  writeValue(value: number | null): void {
    this.selectControl.setValue(value, { emitEvent: false });
  }

  /**
   * Register callback for value changes
   * Called by the forms API to register the onChange callback
   */
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Register callback for touched state
   * Called by the forms API to register the onTouched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Set the disabled state
   * Called when the parent form control is enabled/disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled) {
      this.selectControl.disable({ emitEvent: false });
    } else {
      this.selectControl.enable({ emitEvent: false });
    }
  }
}
