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
  BudgetRequestItem,
  CreateBudgetRequestItemRequest,
  UpdateBudgetRequestItemRequest,
} from '../types/budget-request-items.types';
// CRUD-GENERATOR-TAG: Foreign Key Service Import

export type BudgetRequestItemFormMode = 'create' | 'edit';

export interface BudgetRequestItemFormData {
  budget_request_id: string;
  budget_id: string;
  requested_amount?: unknown;
  q1_qty?: unknown;
  q2_qty?: unknown;
  q3_qty?: unknown;
  q4_qty?: unknown;
  item_justification?: string;
  drug_id?: string;
  generic_id?: string;
  generic_code?: string;
  generic_name?: string;
  package_size?: string;
  unit?: string;
  line_number?: unknown;
  avg_usage?: unknown;
  estimated_usage_2569?: unknown;
  current_stock?: unknown;
  estimated_purchase?: unknown;
  unit_price?: unknown;
  requested_qty?: unknown;
  budget_type_id?: string;
  budget_category_id?: string;
  historical_usage?: unknown;
}

@Component({
  selector: 'app-budget-request-items-form',
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
      <form
        [formGroup]="budgetRequestItemsForm"
        class="budget-request-items-form"
      >
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">BudgetRequestItem Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- budget_request_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Budget Request Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="budget_request_id"
                  placeholder="Enter budget request id"
                />
                <mat-error
                  *ngIf="
                    budgetRequestItemsForm
                      .get('budget_request_id')
                      ?.hasError('required')
                  "
                >
                  Budget Request Id is required
                </mat-error>
              </mat-form-field>

              <!-- budget_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Budget Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="budget_id"
                  placeholder="Enter budget id"
                />
                <mat-error
                  *ngIf="
                    budgetRequestItemsForm
                      .get('budget_id')
                      ?.hasError('required')
                  "
                >
                  Budget Id is required
                </mat-error>
              </mat-form-field>

              <!-- requested_amount Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Requested Amount</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="requested_amount"
                  placeholder="Enter requested amount"
                />
              </mat-form-field>

              <!-- q1_qty Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Q1 Qty</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="q1_qty"
                  placeholder="Enter q1 qty"
                />
              </mat-form-field>

              <!-- q2_qty Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Q2 Qty</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="q2_qty"
                  placeholder="Enter q2 qty"
                />
              </mat-form-field>

              <!-- q3_qty Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Q3 Qty</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="q3_qty"
                  placeholder="Enter q3 qty"
                />
              </mat-form-field>

              <!-- q4_qty Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Q4 Qty</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="q4_qty"
                  placeholder="Enter q4 qty"
                />
              </mat-form-field>

              <!-- item_justification Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Item Justification</mat-label>
                <textarea
                  matInput
                  formControlName="item_justification"
                  placeholder="Enter item justification"
                  rows="3"
                ></textarea>
              </mat-form-field>

              <!-- drug_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Drug Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="drug_id"
                  placeholder="Enter drug id"
                />
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
              </mat-form-field>

              <!-- generic_code Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Generic Code</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="generic_code"
                  placeholder="Enter generic code"
                />
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
              </mat-form-field>

              <!-- package_size Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Package Size</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="package_size"
                  placeholder="Enter package size"
                />
              </mat-form-field>

              <!-- unit Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Unit</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="unit"
                  placeholder="Enter unit"
                />
              </mat-form-field>

              <!-- line_number Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Line Number</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="line_number"
                  placeholder="Enter line number"
                />
              </mat-form-field>

              <!-- avg_usage Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Avg Usage</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="avg_usage"
                  placeholder="Enter avg usage"
                />
              </mat-form-field>

              <!-- estimated_usage_2569 Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Estimated Usage 2569</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="estimated_usage_2569"
                  placeholder="Enter estimated usage 2569"
                />
              </mat-form-field>

              <!-- current_stock Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Current Stock</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="current_stock"
                  placeholder="Enter current stock"
                />
              </mat-form-field>

              <!-- estimated_purchase Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Estimated Purchase</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="estimated_purchase"
                  placeholder="Enter estimated purchase"
                />
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

              <!-- requested_qty Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Requested Qty</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="requested_qty"
                  placeholder="Enter requested qty"
                />
              </mat-form-field>

              <!-- budget_type_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Budget Type Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="budget_type_id"
                  placeholder="Enter budget type id"
                />
              </mat-form-field>

              <!-- budget_category_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Budget Category Id</mat-label>
                <input
                  matInput
                  type="dropdown"
                  formControlName="budget_category_id"
                  placeholder="Enter budget category id"
                />
              </mat-form-field>

              <!-- historical_usage Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Historical Usage</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="historical_usage"
                  placeholder="Enter historical usage"
                />
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
          budgetRequestItemsForm.invalid ||
          loading ||
          (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} BudgetRequestItem
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .budget-request-items-form {
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
export class BudgetRequestItemFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  // CRUD-GENERATOR-TAG: Foreign Key Service Injection

  @Input() mode: BudgetRequestItemFormMode = 'create';
  @Input() initialData?: BudgetRequestItem;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<BudgetRequestItemFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;
  // CRUD-GENERATOR-TAG: Foreign Key Options State

  budgetRequestItemsForm: FormGroup = this.fb.group({
    budget_request_id: ['', [Validators.required]],
    budget_id: ['', [Validators.required]],
    requested_amount: ['', []],
    q1_qty: ['', []],
    q2_qty: ['', []],
    q3_qty: ['', []],
    q4_qty: ['', []],
    item_justification: ['', []],
    drug_id: ['', []],
    generic_id: ['', []],
    generic_code: ['', []],
    generic_name: ['', []],
    package_size: ['', []],
    unit: ['', []],
    line_number: ['', []],
    avg_usage: ['', []],
    estimated_usage_2569: ['', []],
    current_stock: ['', []],
    estimated_purchase: ['', []],
    unit_price: ['', []],
    requested_qty: ['', []],
    budget_type_id: ['', []],
    budget_category_id: ['', []],
    historical_usage: ['', []],
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

  private populateForm(budgetRequestItems: BudgetRequestItem) {
    const formValue = {
      budget_request_id: budgetRequestItems.budget_request_id,
      budget_id: budgetRequestItems.budget_id,
      requested_amount: budgetRequestItems.requested_amount,
      q1_qty: budgetRequestItems.q1_qty,
      q2_qty: budgetRequestItems.q2_qty,
      q3_qty: budgetRequestItems.q3_qty,
      q4_qty: budgetRequestItems.q4_qty,
      item_justification: budgetRequestItems.item_justification,
      drug_id: budgetRequestItems.drug_id,
      generic_id: budgetRequestItems.generic_id,
      generic_code: budgetRequestItems.generic_code,
      generic_name: budgetRequestItems.generic_name,
      package_size: budgetRequestItems.package_size,
      unit: budgetRequestItems.unit,
      line_number: budgetRequestItems.line_number,
      avg_usage: budgetRequestItems.avg_usage,
      estimated_usage_2569: budgetRequestItems.estimated_usage_2569,
      current_stock: budgetRequestItems.current_stock,
      estimated_purchase: budgetRequestItems.estimated_purchase,
      unit_price: budgetRequestItems.unit_price,
      requested_qty: budgetRequestItems.requested_qty,
      budget_type_id: budgetRequestItems.budget_type_id,
      budget_category_id: budgetRequestItems.budget_category_id,
      historical_usage:
        typeof budgetRequestItems.historical_usage === 'object' &&
        budgetRequestItems.historical_usage !== null
          ? JSON.stringify(budgetRequestItems.historical_usage, null, 2)
          : budgetRequestItems.historical_usage || '',
    };

    this.budgetRequestItemsForm.patchValue(formValue);
    this.originalFormValue = this.budgetRequestItemsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.budgetRequestItemsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.budgetRequestItemsForm.valid) {
      const formData = {
        ...this.budgetRequestItemsForm.value,
      } as BudgetRequestItemFormData;

      // Convert number fields from string to number (TypeBox expects number, not string)
      if (formData.requested_amount !== undefined) {
        const requested_amountVal = formData.requested_amount;
        formData.requested_amount =
          requested_amountVal === '' || requested_amountVal === null
            ? null
            : Number(requested_amountVal);
      }
      if (formData.q1_qty !== undefined) {
        const q1_qtyVal = formData.q1_qty;
        formData.q1_qty =
          q1_qtyVal === '' || q1_qtyVal === null ? null : Number(q1_qtyVal);
      }
      if (formData.q2_qty !== undefined) {
        const q2_qtyVal = formData.q2_qty;
        formData.q2_qty =
          q2_qtyVal === '' || q2_qtyVal === null ? null : Number(q2_qtyVal);
      }
      if (formData.q3_qty !== undefined) {
        const q3_qtyVal = formData.q3_qty;
        formData.q3_qty =
          q3_qtyVal === '' || q3_qtyVal === null ? null : Number(q3_qtyVal);
      }
      if (formData.q4_qty !== undefined) {
        const q4_qtyVal = formData.q4_qty;
        formData.q4_qty =
          q4_qtyVal === '' || q4_qtyVal === null ? null : Number(q4_qtyVal);
      }
      if (formData.line_number !== undefined) {
        const line_numberVal = formData.line_number;
        formData.line_number =
          line_numberVal === '' || line_numberVal === null
            ? null
            : Number(line_numberVal);
      }
      if (formData.avg_usage !== undefined) {
        const avg_usageVal = formData.avg_usage;
        formData.avg_usage =
          avg_usageVal === '' || avg_usageVal === null
            ? null
            : Number(avg_usageVal);
      }
      if (formData.estimated_usage_2569 !== undefined) {
        const estimated_usage_2569Val = formData.estimated_usage_2569;
        formData.estimated_usage_2569 =
          estimated_usage_2569Val === '' || estimated_usage_2569Val === null
            ? null
            : Number(estimated_usage_2569Val);
      }
      if (formData.current_stock !== undefined) {
        const current_stockVal = formData.current_stock;
        formData.current_stock =
          current_stockVal === '' || current_stockVal === null
            ? null
            : Number(current_stockVal);
      }
      if (formData.estimated_purchase !== undefined) {
        const estimated_purchaseVal = formData.estimated_purchase;
        formData.estimated_purchase =
          estimated_purchaseVal === '' || estimated_purchaseVal === null
            ? null
            : Number(estimated_purchaseVal);
      }
      if (formData.unit_price !== undefined) {
        const unit_priceVal = formData.unit_price;
        formData.unit_price =
          unit_priceVal === '' || unit_priceVal === null
            ? null
            : Number(unit_priceVal);
      }
      if (formData.requested_qty !== undefined) {
        const requested_qtyVal = formData.requested_qty;
        formData.requested_qty =
          requested_qtyVal === '' || requested_qtyVal === null
            ? null
            : Number(requested_qtyVal);
      }

      // Parse JSON fields from string to object (TypeBox expects object, not string)
      if (typeof formData.historical_usage === 'string') {
        try {
          formData.historical_usage =
            formData.historical_usage.trim() === ''
              ? {}
              : JSON.parse(formData.historical_usage);
        } catch {
          formData.historical_usage = {};
        }
      } else if (!formData.historical_usage) {
        formData.historical_usage = {};
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
