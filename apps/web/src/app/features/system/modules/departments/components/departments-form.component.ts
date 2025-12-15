import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '../types/departments.types';
// CRUD-GENERATOR-TAG: Foreign Key Service Import

export type DepartmentFormMode = 'create' | 'edit';

export interface DepartmentFormData {
  dept_code: string;
  dept_name: string;
  his_code?: string;
  parent_id?: string;
  consumption_group?: string;
  is_active?: boolean;
}

@Component({
  selector: 'app-departments-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatOptionModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <!-- Dialog Content -->
    <mat-dialog-content>
      <form [formGroup]="departmentsForm" class="departments-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">Department Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- dept_code Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dept Code</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="dept_code"
                  placeholder="Enter dept code"
                />
                <mat-error
                  *ngIf="departmentsForm.get('dept_code')?.hasError('required')"
                >
                  Dept Code is required
                </mat-error>
              </mat-form-field>

              <!-- dept_name Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dept Name</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="dept_name"
                  placeholder="Enter dept name"
                />
                <mat-error
                  *ngIf="departmentsForm.get('dept_name')?.hasError('required')"
                >
                  Dept Name is required
                </mat-error>
              </mat-form-field>

              <!-- his_code Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>His Code</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="his_code"
                  placeholder="Enter his code"
                />
              </mat-form-field>

              <!-- parent_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Parent Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="parent_id"
                  placeholder="Enter parent id"
                />
              </mat-form-field>

              <!-- consumption_group Field -->
              <!-- FK reference not found, render as plain text input -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Consumption Group</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="consumption_group"
                  placeholder="Enter consumption group"
                />
              </mat-form-field>

              <!-- is_active Field -->
              <div class="checkbox-field">
                <mat-checkbox formControlName="is_active">
                  Is Active
                </mat-checkbox>
              </div>
            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <!-- Form Actions - Outside mat-dialog-content, proper mat-dialog-actions -->
    <mat-dialog-actions align="end">
      <button
        mat-button
        type="button"
        (click)="onCancel()"
        [disabled]="loading"
      >
        Cancel
      </button>
      <button
        mat-flat-button
        color="primary"
        type="button"
        (click)="onSubmit()"
        [disabled]="
          departmentsForm.invalid ||
          loading ||
          (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} Department
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .departments-form {
        display: flex;
        flex-direction: column;
      }

      /* Responsive Grid Layout for Form Fields */
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--ax-spacing-md, 16px);
      }

      .full-width {
        width: 100%;
      }

      /* Checkbox Field */
      .checkbox-field {
        display: flex;
        align-items: center;
        min-height: 56px;
        padding: var(--ax-spacing-sm, 8px) 0;
      }

      .inline-spinner {
        margin-right: 8px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DepartmentFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  // CRUD-GENERATOR-TAG: Foreign Key Service Injection

  @Input() mode: DepartmentFormMode = 'create';
  @Input() initialData?: Department;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<DepartmentFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;
  // CRUD-GENERATOR-TAG: Foreign Key Options State

  departmentsForm: FormGroup = this.fb.group({
    dept_code: ['', [Validators.required]],
    dept_name: ['', [Validators.required]],
    his_code: ['', []],
    parent_id: ['', []],
    consumption_group: ['', []],
    is_active: [false, []],
  });

  ngOnInit() {
    // CRUD-GENERATOR-TAG: Load Foreign Key Options
    if (this.mode === 'edit' && this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && this.initialData && this.mode === 'edit') {
      this.populateForm(this.initialData);
    }
  }

  private populateForm(departments: Department) {
    const formValue = {
      dept_code: departments.dept_code,
      dept_name: departments.dept_name,
      his_code: departments.his_code,
      parent_id: departments.parent_id,
      consumption_group: departments.consumption_group,
      is_active: departments.is_active,
    };

    this.departmentsForm.patchValue(formValue);
    this.originalFormValue = this.departmentsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.departmentsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.departmentsForm.valid) {
      const formData = { ...this.departmentsForm.value } as DepartmentFormData;

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
