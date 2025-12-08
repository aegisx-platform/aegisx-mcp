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
  DrugGeneric,
  CreateDrugGenericRequest,
  UpdateDrugGenericRequest,
} from '../types/drug-generics.types';
// CRUD-GENERATOR-TAG: Foreign Key Service Import

export type DrugGenericFormMode = 'create' | 'edit';

export interface DrugGenericFormData {
  working_code: string;
  generic_name: string;
  dosage_form?: string;
  strength_unit?: string;
  dosage_form_id?: string;
  strength_unit_id?: string;
  strength_value?: unknown;
  is_active?: boolean;
}

@Component({
  selector: 'app-drug-generics-form',
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
      <form [formGroup]="drugGenericsForm" class="drug-generics-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">DrugGeneric Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- working_code Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Working Code</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="working_code"
                  placeholder="Enter working code"
                />
                <mat-error
                  *ngIf="
                    drugGenericsForm.get('working_code')?.hasError('required')
                  "
                >
                  Working Code is required
                </mat-error>
              </mat-form-field>

              <!-- generic_name Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Generic Name</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="generic_name"
                  placeholder="Enter generic name"
                />
                <mat-error
                  *ngIf="
                    drugGenericsForm.get('generic_name')?.hasError('required')
                  "
                >
                  Generic Name is required
                </mat-error>
              </mat-form-field>

              <!-- dosage_form Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dosage Form</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="dosage_form"
                  placeholder="Enter dosage form"
                />
              </mat-form-field>

              <!-- strength_unit Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Strength Unit</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="strength_unit"
                  placeholder="Enter strength unit"
                />
              </mat-form-field>

              <!-- dosage_form_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dosage Form Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="dosage_form_id"
                  placeholder="Enter dosage form id"
                />
              </mat-form-field>

              <!-- strength_unit_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Strength Unit Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="strength_unit_id"
                  placeholder="Enter strength unit id"
                />
              </mat-form-field>

              <!-- strength_value Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Strength Value</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="strength_value"
                  placeholder="Enter strength value"
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
          drugGenericsForm.invalid ||
          loading ||
          (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} DrugGeneric
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .drug-generics-form {
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
export class DrugGenericFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  // CRUD-GENERATOR-TAG: Foreign Key Service Injection

  @Input() mode: DrugGenericFormMode = 'create';
  @Input() initialData?: DrugGeneric;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<DrugGenericFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;
  // CRUD-GENERATOR-TAG: Foreign Key Options State

  drugGenericsForm: FormGroup = this.fb.group({
    working_code: ['', [Validators.required]],
    generic_name: ['', [Validators.required]],
    dosage_form: ['', []],
    strength_unit: ['', []],
    dosage_form_id: ['', []],
    strength_unit_id: ['', []],
    strength_value: ['', []],
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

  private populateForm(drugGenerics: DrugGeneric) {
    const formValue = {
      working_code: drugGenerics.working_code,
      generic_name: drugGenerics.generic_name,
      dosage_form: drugGenerics.dosage_form,
      strength_unit: drugGenerics.strength_unit,
      dosage_form_id: drugGenerics.dosage_form_id,
      strength_unit_id: drugGenerics.strength_unit_id,
      strength_value: drugGenerics.strength_value,
      is_active: drugGenerics.is_active,
    };

    this.drugGenericsForm.patchValue(formValue);
    this.originalFormValue = this.drugGenericsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.drugGenericsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.drugGenericsForm.valid) {
      const formData = {
        ...this.drugGenericsForm.value,
      } as DrugGenericFormData;

      // Convert number fields from string to number (TypeBox expects number, not string)
      if (formData.strength_value !== undefined) {
        const strength_valueVal = formData.strength_value;
        formData.strength_value =
          strength_valueVal === '' || strength_valueVal === null
            ? null
            : Number(strength_valueVal);
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
