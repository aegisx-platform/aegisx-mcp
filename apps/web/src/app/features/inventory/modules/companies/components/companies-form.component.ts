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
  Companie,
  CreateCompanieRequest,
  UpdateCompanieRequest,
} from '../types/companies.types';
// CRUD-GENERATOR-TAG: Foreign Key Service Import

export type CompanieFormMode = 'create' | 'edit';

export interface CompanieFormData {
  company_code: string;
  company_name: string;
  tax_id?: string;
  bank_id?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  is_vendor?: boolean;
  is_manufacturer?: boolean;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
}

@Component({
  selector: 'app-companies-form',
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
      <form [formGroup]="companiesForm" class="companies-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">Companie Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- company_code Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Company Code</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="company_code"
                  placeholder="Enter company code"
                />
                <mat-error
                  *ngIf="
                    companiesForm.get('company_code')?.hasError('required')
                  "
                >
                  Company Code is required
                </mat-error>
              </mat-form-field>

              <!-- company_name Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Company Name</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="company_name"
                  placeholder="Enter company name"
                />
                <mat-error
                  *ngIf="
                    companiesForm.get('company_name')?.hasError('required')
                  "
                >
                  Company Name is required
                </mat-error>
              </mat-form-field>

              <!-- tax_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tax Id</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="tax_id"
                  placeholder="Enter tax id"
                />
              </mat-form-field>

              <!-- bank_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bank Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="bank_id"
                  placeholder="Enter bank id"
                />
              </mat-form-field>

              <!-- bank_account_number Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bank Account Number</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="bank_account_number"
                  placeholder="Enter bank account number"
                />
              </mat-form-field>

              <!-- bank_account_name Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bank Account Name</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="bank_account_name"
                  placeholder="Enter bank account name"
                />
              </mat-form-field>

              <!-- is_vendor Field -->
              <div class="checkbox-field">
                <mat-checkbox formControlName="is_vendor">
                  Is Vendor
                </mat-checkbox>
              </div>

              <!-- is_manufacturer Field -->
              <div class="checkbox-field">
                <mat-checkbox formControlName="is_manufacturer">
                  Is Manufacturer
                </mat-checkbox>
              </div>

              <!-- contact_person Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contact Person</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="contact_person"
                  placeholder="Enter contact person"
                />
              </mat-form-field>

              <!-- phone Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="phone"
                  placeholder="Enter phone"
                />
              </mat-form-field>

              <!-- email Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="Enter email"
                />
                <mat-error
                  *ngIf="companiesForm.get('email')?.hasError('maxlength')"
                >
                  Email must be less than 255 characters
                </mat-error>
              </mat-form-field>

              <!-- address Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Address</mat-label>
                <textarea
                  matInput
                  formControlName="address"
                  placeholder="Enter address"
                  rows="3"
                ></textarea>
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
          companiesForm.invalid || loading || (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} Companie
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .companies-form {
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
export class CompanieFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  // CRUD-GENERATOR-TAG: Foreign Key Service Injection

  @Input() mode: CompanieFormMode = 'create';
  @Input() initialData?: Companie;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<CompanieFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;
  // CRUD-GENERATOR-TAG: Foreign Key Options State

  companiesForm: FormGroup = this.fb.group({
    company_code: ['', [Validators.required]],
    company_name: ['', [Validators.required]],
    tax_id: ['', []],
    bank_id: ['', []],
    bank_account_number: ['', []],
    bank_account_name: ['', []],
    is_vendor: [false, []],
    is_manufacturer: [false, []],
    contact_person: ['', []],
    phone: ['', []],
    email: ['', [Validators.maxLength(255)]],
    address: ['', []],
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

  private populateForm(companies: Companie) {
    const formValue = {
      company_code: companies.company_code,
      company_name: companies.company_name,
      tax_id: companies.tax_id,
      bank_id: companies.bank_id,
      bank_account_number: companies.bank_account_number,
      bank_account_name: companies.bank_account_name,
      is_vendor: companies.is_vendor,
      is_manufacturer: companies.is_manufacturer,
      contact_person: companies.contact_person,
      phone: companies.phone,
      email: companies.email,
      address: companies.address,
      is_active: companies.is_active,
    };

    this.companiesForm.patchValue(formValue);
    this.originalFormValue = this.companiesForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.companiesForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.companiesForm.valid) {
      const formData = { ...this.companiesForm.value } as CompanieFormData;

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
