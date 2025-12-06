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
  DosageForm,
  CreateDosageFormRequest,
  UpdateDosageFormRequest,
} from '../types/dosage-forms.types';

export type DosageFormFormMode = 'create' | 'edit';

export interface DosageFormFormData {
  form_code: string;
  form_name: string;
  form_name_en?: string;
  description?: string;
  is_active?: boolean;
}

@Component({
  selector: 'app-dosage-forms-form',
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
      <form [formGroup]="dosageFormsForm" class="dosage-forms-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">DosageForm Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- form_code Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Form Code</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="form_code"
                  placeholder="Enter form code"
                />
                <mat-error
                  *ngIf="dosageFormsForm.get('form_code')?.hasError('required')"
                >
                  Form Code is required
                </mat-error>
              </mat-form-field>

              <!-- form_name Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Form Name</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="form_name"
                  placeholder="Enter form name"
                />
                <mat-error
                  *ngIf="dosageFormsForm.get('form_name')?.hasError('required')"
                >
                  Form Name is required
                </mat-error>
              </mat-form-field>

              <!-- form_name_en Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Form Name En</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="form_name_en"
                  placeholder="Enter form name en"
                />
              </mat-form-field>

              <!-- description Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  placeholder="Enter description"
                  rows="3"
                ></textarea>
                <mat-error
                  *ngIf="
                    dosageFormsForm.get('description')?.hasError('maxlength')
                  "
                >
                  Description must be less than 1000 characters
                </mat-error>
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
          dosageFormsForm.invalid ||
          loading ||
          (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} DosageForm
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .dosage-forms-form {
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
export class DosageFormFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() mode: DosageFormFormMode = 'create';
  @Input() initialData?: DosageForm;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<DosageFormFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;

  dosageFormsForm: FormGroup = this.fb.group({
    form_code: ['', [Validators.required]],
    form_name: ['', [Validators.required]],
    form_name_en: ['', []],
    description: ['', [Validators.maxLength(1000)]],
    is_active: [false, []],
  });

  ngOnInit() {
    if (this.mode === 'edit' && this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && this.initialData && this.mode === 'edit') {
      this.populateForm(this.initialData);
    }
  }

  private populateForm(dosageForms: DosageForm) {
    const formValue = {
      form_code: dosageForms.form_code,
      form_name: dosageForms.form_name,
      form_name_en: dosageForms.form_name_en,
      description: dosageForms.description,
      is_active: dosageForms.is_active,
    };

    this.dosageFormsForm.patchValue(formValue);
    this.originalFormValue = this.dosageFormsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.dosageFormsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.dosageFormsForm.valid) {
      const formData = { ...this.dosageFormsForm.value } as DosageFormFormData;

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
