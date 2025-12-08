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
  ContractItem,
  CreateContractItemRequest,
  UpdateContractItemRequest,
} from '../types/contract-items.types';
// CRUD-GENERATOR-TAG: Foreign Key Service Import

export type ContractItemFormMode = 'create' | 'edit';

export interface ContractItemFormData {
  contract_id: string;
  generic_id: string;
  agreed_unit_price: unknown;
  quantity_limit?: unknown;
  quantity_used?: unknown;
  notes?: string;
}

@Component({
  selector: 'app-contract-items-form',
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
      <form [formGroup]="contractItemsForm" class="contract-items-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">ContractItem Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- contract_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contract Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="contract_id"
                  placeholder="Enter contract id"
                />
                <mat-error
                  *ngIf="
                    contractItemsForm.get('contract_id')?.hasError('required')
                  "
                >
                  Contract Id is required
                </mat-error>
              </mat-form-field>

              <!-- generic_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Generic Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="generic_id"
                  placeholder="Enter generic id"
                />
                <mat-error
                  *ngIf="
                    contractItemsForm.get('generic_id')?.hasError('required')
                  "
                >
                  Generic Id is required
                </mat-error>
              </mat-form-field>

              <!-- agreed_unit_price Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Agreed Unit Price</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="agreed_unit_price"
                  placeholder="Enter agreed unit price"
                />
                <mat-error
                  *ngIf="
                    contractItemsForm
                      .get('agreed_unit_price')
                      ?.hasError('required')
                  "
                >
                  Agreed Unit Price is required
                </mat-error>
              </mat-form-field>

              <!-- quantity_limit Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Quantity Limit</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="quantity_limit"
                  placeholder="Enter quantity limit"
                />
              </mat-form-field>

              <!-- quantity_used Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Quantity Used</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="quantity_used"
                  placeholder="Enter quantity used"
                />
              </mat-form-field>

              <!-- notes Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes</mat-label>
                <textarea
                  matInput
                  formControlName="notes"
                  placeholder="Enter notes"
                  rows="3"
                ></textarea>
              </mat-form-field>
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
          contractItemsForm.invalid ||
          loading ||
          (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} ContractItem
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .contract-items-form {
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
export class ContractItemFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  // CRUD-GENERATOR-TAG: Foreign Key Service Injection

  @Input() mode: ContractItemFormMode = 'create';
  @Input() initialData?: ContractItem;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<ContractItemFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;
  // CRUD-GENERATOR-TAG: Foreign Key Options State

  contractItemsForm: FormGroup = this.fb.group({
    contract_id: ['', [Validators.required]],
    generic_id: ['', [Validators.required]],
    agreed_unit_price: ['', [Validators.required]],
    quantity_limit: ['', []],
    quantity_used: ['', []],
    notes: ['', []],
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

  private populateForm(contractItems: ContractItem) {
    const formValue = {
      contract_id: contractItems.contract_id,
      generic_id: contractItems.generic_id,
      agreed_unit_price: contractItems.agreed_unit_price,
      quantity_limit: contractItems.quantity_limit,
      quantity_used: contractItems.quantity_used,
      notes: contractItems.notes,
    };

    this.contractItemsForm.patchValue(formValue);
    this.originalFormValue = this.contractItemsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.contractItemsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.contractItemsForm.valid) {
      const formData = {
        ...this.contractItemsForm.value,
      } as ContractItemFormData;

      // Convert number fields from string to number (TypeBox expects number, not string)
      if (formData.agreed_unit_price !== undefined) {
        const agreed_unit_priceVal = formData.agreed_unit_price;
        formData.agreed_unit_price =
          agreed_unit_priceVal === '' || agreed_unit_priceVal === null
            ? null
            : Number(agreed_unit_priceVal);
      }
      if (formData.quantity_limit !== undefined) {
        const quantity_limitVal = formData.quantity_limit;
        formData.quantity_limit =
          quantity_limitVal === '' || quantity_limitVal === null
            ? null
            : Number(quantity_limitVal);
      }
      if (formData.quantity_used !== undefined) {
        const quantity_usedVal = formData.quantity_used;
        formData.quantity_used =
          quantity_usedVal === '' || quantity_usedVal === null
            ? null
            : Number(quantity_usedVal);
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
