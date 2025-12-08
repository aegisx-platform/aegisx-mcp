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
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
} from '../types/contracts.types';
// CRUD-GENERATOR-TAG: Foreign Key Service Import
import { formatDateForInput, formatDateForSubmission } from '@aegisx/ui';

export type ContractFormMode = 'create' | 'edit';

export interface ContractFormData {
  contract_number: string;
  contract_type: string;
  vendor_id: string;
  start_date: string;
  end_date: string;
  total_value: unknown;
  remaining_value: unknown;
  fiscal_year: string;
  status?: string;
  egp_number?: string;
  project_number?: string;
  is_active?: boolean;
}

@Component({
  selector: 'app-contracts-form',
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
      <form [formGroup]="contractsForm" class="contracts-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">Contract Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- contract_number Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contract Number</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="contract_number"
                  placeholder="Enter contract number"
                />
                <mat-error
                  *ngIf="
                    contractsForm.get('contract_number')?.hasError('required')
                  "
                >
                  Contract Number is required
                </mat-error>
              </mat-form-field>

              <!-- contract_type Field -->
              <!-- FK reference not found, render as plain text input -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contract Type</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="contract_type"
                  placeholder="Enter contract type"
                />
                <mat-error
                  *ngIf="
                    contractsForm.get('contract_type')?.hasError('required')
                  "
                >
                  Contract Type is required
                </mat-error>
              </mat-form-field>

              <!-- vendor_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Vendor Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="vendor_id"
                  placeholder="Enter vendor id"
                />
                <mat-error
                  *ngIf="contractsForm.get('vendor_id')?.hasError('required')"
                >
                  Vendor Id is required
                </mat-error>
              </mat-form-field>

              <!-- start_date Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Start Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="start_datePicker"
                  formControlName="start_date"
                  placeholder="Enter start date"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="start_datePicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #start_datePicker></mat-datepicker>
              </mat-form-field>

              <!-- end_date Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>End Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="end_datePicker"
                  formControlName="end_date"
                  placeholder="Enter end date"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="end_datePicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #end_datePicker></mat-datepicker>
              </mat-form-field>

              <!-- total_value Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Total Value</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="total_value"
                  placeholder="Enter total value"
                />
                <mat-error
                  *ngIf="contractsForm.get('total_value')?.hasError('required')"
                >
                  Total Value is required
                </mat-error>
              </mat-form-field>

              <!-- remaining_value Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Remaining Value</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="remaining_value"
                  placeholder="Enter remaining value"
                />
                <mat-error
                  *ngIf="
                    contractsForm.get('remaining_value')?.hasError('required')
                  "
                >
                  Remaining Value is required
                </mat-error>
              </mat-form-field>

              <!-- fiscal_year Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Fiscal Year</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="fiscal_year"
                  placeholder="Enter fiscal year"
                />
                <mat-error
                  *ngIf="contractsForm.get('fiscal_year')?.hasError('required')"
                >
                  Fiscal Year is required
                </mat-error>
              </mat-form-field>

              <!-- status Field -->
              <!-- FK reference not found, render as plain text input -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Status</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="status"
                  placeholder="Enter status"
                />
              </mat-form-field>

              <!-- egp_number Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Egp Number</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="egp_number"
                  placeholder="Enter egp number"
                />
              </mat-form-field>

              <!-- project_number Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Project Number</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="project_number"
                  placeholder="Enter project number"
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
          contractsForm.invalid || loading || (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} Contract
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .contracts-form {
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
export class ContractFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  // CRUD-GENERATOR-TAG: Foreign Key Service Injection

  @Input() mode: ContractFormMode = 'create';
  @Input() initialData?: Contract;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<ContractFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;
  // CRUD-GENERATOR-TAG: Foreign Key Options State

  contractsForm: FormGroup = this.fb.group({
    contract_number: ['', [Validators.required]],
    contract_type: ['', [Validators.required]],
    vendor_id: ['', [Validators.required]],
    start_date: ['', [Validators.required]],
    end_date: ['', [Validators.required]],
    total_value: ['', [Validators.required]],
    remaining_value: ['', [Validators.required]],
    fiscal_year: ['', [Validators.required]],
    status: ['', [Validators.maxLength(20)]],
    egp_number: ['', []],
    project_number: ['', []],
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

  private populateForm(contracts: Contract) {
    const formValue = {
      contract_number: contracts.contract_number,
      contract_type: contracts.contract_type,
      vendor_id: contracts.vendor_id,
      start_date: contracts.start_date ? new Date(contracts.start_date) : null,
      end_date: contracts.end_date ? new Date(contracts.end_date) : null,
      total_value: contracts.total_value,
      remaining_value: contracts.remaining_value,
      fiscal_year: contracts.fiscal_year,
      status: contracts.status,
      egp_number: contracts.egp_number,
      project_number: contracts.project_number,
      is_active: contracts.is_active,
    };

    this.contractsForm.patchValue(formValue);
    this.originalFormValue = this.contractsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.contractsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.contractsForm.valid) {
      const formData = { ...this.contractsForm.value } as ContractFormData;

      // Convert date fields to date-only format for submission
      if (formData.start_date) {
        formData.start_date = formatDateForSubmission(formData.start_date);
      }
      if (formData.end_date) {
        formData.end_date = formatDateForSubmission(formData.end_date);
      }

      // Convert number fields from string to number (TypeBox expects number, not string)
      if (formData.total_value !== undefined) {
        const total_valueVal = formData.total_value;
        formData.total_value =
          total_valueVal === '' || total_valueVal === null
            ? null
            : Number(total_valueVal);
      }
      if (formData.remaining_value !== undefined) {
        const remaining_valueVal = formData.remaining_value;
        formData.remaining_value =
          remaining_valueVal === '' || remaining_valueVal === null
            ? null
            : Number(remaining_valueVal);
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
