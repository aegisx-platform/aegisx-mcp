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
  Drug,
  CreateDrugRequest,
  UpdateDrugRequest,
} from '../types/drugs.types';

export type DrugFormMode = 'create' | 'edit';

export interface DrugFormData {
  drug_code: string;
  trade_name: string;
  generic_id: string;
  manufacturer_id: string;
  tmt_tpu_id?: string;
  nlem_status: string;
  drug_status: string;
  product_category: string;
  status_changed_date?: string;
  unit_price?: unknown;
  package_size?: unknown;
  package_unit?: string;
  is_active?: boolean;
}

@Component({
  selector: 'app-drugs-form',
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
      <form [formGroup]="drugsForm" class="drugs-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">Drug Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- drug_code Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Drug Code</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="drug_code"
                  placeholder="Enter drug code"
                />
                <mat-error
                  *ngIf="drugsForm.get('drug_code')?.hasError('required')"
                >
                  Drug Code is required
                </mat-error>
              </mat-form-field>

              <!-- trade_name Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Trade Name</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="trade_name"
                  placeholder="Enter trade name"
                />
                <mat-error
                  *ngIf="drugsForm.get('trade_name')?.hasError('required')"
                >
                  Trade Name is required
                </mat-error>
              </mat-form-field>

              <!-- generic_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Generic Id</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="generic_id"
                  placeholder="Enter generic id"
                />
                <mat-error
                  *ngIf="drugsForm.get('generic_id')?.hasError('required')"
                >
                  Generic Id is required
                </mat-error>
              </mat-form-field>

              <!-- manufacturer_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Manufacturer Id</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="manufacturer_id"
                  placeholder="Enter manufacturer id"
                />
                <mat-error
                  *ngIf="drugsForm.get('manufacturer_id')?.hasError('required')"
                >
                  Manufacturer Id is required
                </mat-error>
              </mat-form-field>

              <!-- tmt_tpu_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tmt Tpu Id</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="tmt_tpu_id"
                  placeholder="Enter tmt tpu id"
                />
              </mat-form-field>

              <!-- nlem_status Field -->
              <!-- FK reference not found, render as plain text input -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nlem Status</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="nlem_status"
                  placeholder="Enter nlem status"
                />
                <mat-error
                  *ngIf="drugsForm.get('nlem_status')?.hasError('required')"
                >
                  Nlem Status is required
                </mat-error>
              </mat-form-field>

              <!-- drug_status Field -->
              <!-- FK reference not found, render as plain text input -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Drug Status</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="drug_status"
                  placeholder="Enter drug status"
                />
                <mat-error
                  *ngIf="drugsForm.get('drug_status')?.hasError('required')"
                >
                  Drug Status is required
                </mat-error>
              </mat-form-field>

              <!-- product_category Field -->
              <!-- FK reference not found, render as plain text input -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Product Category</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="product_category"
                  placeholder="Enter product category"
                />
                <mat-error
                  *ngIf="
                    drugsForm.get('product_category')?.hasError('required')
                  "
                >
                  Product Category is required
                </mat-error>
              </mat-form-field>

              <!-- status_changed_date Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Status Changed Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="status_changed_datePicker"
                  formControlName="status_changed_date"
                  placeholder="Enter status changed date"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="status_changed_datePicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #status_changed_datePicker></mat-datepicker>
              </mat-form-field>

              <!-- unit_price Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Unit Price</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="unit_price"
                  placeholder="Enter unit price"
                />
              </mat-form-field>

              <!-- package_size Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Package Size</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="package_size"
                  placeholder="Enter package size"
                />
              </mat-form-field>

              <!-- package_unit Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Package Unit</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="package_unit"
                  placeholder="Enter package unit"
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
          drugsForm.invalid || loading || (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} Drug
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .drugs-form {
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
export class DrugFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() mode: DrugFormMode = 'create';
  @Input() initialData?: Drug;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<DrugFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;

  drugsForm: FormGroup = this.fb.group({
    drug_code: ['', [Validators.required]],
    trade_name: ['', [Validators.required]],
    generic_id: ['', [Validators.required]],
    manufacturer_id: ['', [Validators.required]],
    tmt_tpu_id: ['', []],
    nlem_status: ['', [Validators.required]],
    drug_status: ['', [Validators.required]],
    product_category: ['', [Validators.required]],
    status_changed_date: ['', []],
    unit_price: ['', []],
    package_size: ['', []],
    package_unit: ['', []],
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

  private populateForm(drugs: Drug) {
    const formValue = {
      drug_code: drugs.drug_code,
      trade_name: drugs.trade_name,
      generic_id: drugs.generic_id,
      manufacturer_id: drugs.manufacturer_id,
      tmt_tpu_id: drugs.tmt_tpu_id,
      nlem_status: drugs.nlem_status,
      drug_status: drugs.drug_status,
      product_category: drugs.product_category,
      status_changed_date: drugs.status_changed_date
        ? new Date(drugs.status_changed_date)
        : null,
      unit_price: drugs.unit_price,
      package_size: drugs.package_size,
      package_unit: drugs.package_unit,
      is_active: drugs.is_active,
    };

    this.drugsForm.patchValue(formValue);
    this.originalFormValue = this.drugsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.drugsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.drugsForm.valid) {
      const formData = { ...this.drugsForm.value } as DrugFormData;

      // Convert number fields from string to number (TypeBox expects number, not string)
      if (formData.unit_price !== undefined) {
        const unit_priceVal = formData.unit_price;
        formData.unit_price =
          unit_priceVal === '' || unit_priceVal === null
            ? null
            : Number(unit_priceVal);
      }
      if (formData.package_size !== undefined) {
        const package_sizeVal = formData.package_size;
        formData.package_size =
          package_sizeVal === '' || package_sizeVal === null
            ? null
            : Number(package_sizeVal);
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
