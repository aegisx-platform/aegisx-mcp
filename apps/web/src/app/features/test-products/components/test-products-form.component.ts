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
  TestProduct,
  CreateTestProductRequest,
  UpdateTestProductRequest,
} from '../types/test-products.types';
// CRUD-GENERATOR-TAG: Foreign Key Service Import
import {
  formatDateForInput,
  formatDateForSubmission,
} from '../../../shared/utils/datetime.utils';

export type TestProductFormMode = 'create' | 'edit';

export interface TestProductFormData {
  sku: string;
  name: string;
  barcode?: string;
  manufacturer?: string;
  description?: string;
  long_description?: string;
  specifications?: string;
  quantity?: number;
  min_quantity?: number;
  max_quantity?: number;
  price: number;
  cost?: number;
  weight?: number;
  discount_percentage?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_taxable?: boolean;
  is_shippable?: boolean;
  allow_backorder?: boolean;
  status?: string;
  condition?: string;
  availability?: string;
  launch_date?: string;
  discontinued_date?: string;
  last_stock_check?: string;
  next_restock_date?: string;
  attributes?: string;
  tags?: string;
  images?: string;
  pricing_tiers?: string;
  dimensions?: string;
  seo_metadata?: string;
  category_id: string;
  parent_product_id?: string;
  supplier_id?: string;
  deleted_at?: string;
  updated_by?: string;
}

@Component({
  selector: 'app-test-products-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
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
    <form [formGroup]="testProductsForm" class="test-products-form">
      <!-- sku Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Sku</mat-label>
        <input
          matInput
          type="text"
          formControlName="sku"
          placeholder="Enter sku"
        />
        <mat-error *ngIf="testProductsForm.get('sku')?.hasError('required')">
          Sku is required
        </mat-error>
      </mat-form-field>

      <!-- name Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Name</mat-label>
        <input
          matInput
          type="text"
          formControlName="name"
          placeholder="Enter name"
        />
        <mat-error *ngIf="testProductsForm.get('name')?.hasError('required')">
          Name is required
        </mat-error>
        <mat-error *ngIf="testProductsForm.get('name')?.hasError('maxlength')">
          Name must be less than 255 characters
        </mat-error>
      </mat-form-field>

      <!-- barcode Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Barcode</mat-label>
        <input
          matInput
          type="text"
          formControlName="barcode"
          placeholder="Enter barcode"
        />
      </mat-form-field>

      <!-- manufacturer Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Manufacturer</mat-label>
        <input
          matInput
          type="text"
          formControlName="manufacturer"
          placeholder="Enter manufacturer"
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
          *ngIf="testProductsForm.get('description')?.hasError('maxlength')"
        >
          Description must be less than 1000 characters
        </mat-error>
      </mat-form-field>

      <!-- long_description Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Long Description</mat-label>
        <textarea
          matInput
          formControlName="long_description"
          placeholder="Enter long description"
          rows="3"
        ></textarea>
      </mat-form-field>

      <!-- specifications Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Specifications</mat-label>
        <textarea
          matInput
          formControlName="specifications"
          placeholder="Enter specifications"
          rows="3"
        ></textarea>
      </mat-form-field>

      <!-- quantity Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Quantity</mat-label>
        <input
          matInput
          type="number"
          formControlName="quantity"
          placeholder="Enter quantity"
        />
      </mat-form-field>

      <!-- min_quantity Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Min Quantity</mat-label>
        <input
          matInput
          type="number"
          formControlName="min_quantity"
          placeholder="Enter min quantity"
        />
      </mat-form-field>

      <!-- max_quantity Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Max Quantity</mat-label>
        <input
          matInput
          type="number"
          formControlName="max_quantity"
          placeholder="Enter max quantity"
        />
      </mat-form-field>

      <!-- price Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Price</mat-label>
        <input
          matInput
          type="number"
          formControlName="price"
          placeholder="Enter price"
        />
        <mat-error *ngIf="testProductsForm.get('price')?.hasError('required')">
          Price is required
        </mat-error>
      </mat-form-field>

      <!-- cost Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Cost</mat-label>
        <input
          matInput
          type="number"
          formControlName="cost"
          placeholder="Enter cost"
        />
      </mat-form-field>

      <!-- weight Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Weight</mat-label>
        <input
          matInput
          type="number"
          formControlName="weight"
          placeholder="Enter weight"
        />
      </mat-form-field>

      <!-- discount_percentage Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Discount Percentage</mat-label>
        <input
          matInput
          type="number"
          formControlName="discount_percentage"
          placeholder="Enter discount percentage"
        />
      </mat-form-field>

      <!-- is_active Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="is_active"> Is Active </mat-checkbox>
      </div>

      <!-- is_featured Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="is_featured"> Is Featured </mat-checkbox>
      </div>

      <!-- is_taxable Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="is_taxable"> Is Taxable </mat-checkbox>
      </div>

      <!-- is_shippable Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="is_shippable">
          Is Shippable
        </mat-checkbox>
      </div>

      <!-- allow_backorder Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="allow_backorder">
          Allow Backorder
        </mat-checkbox>
      </div>

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

      <!-- condition Field -->
      <!-- FK reference not found, render as plain text input -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Condition</mat-label>
        <input
          matInput
          type="text"
          formControlName="condition"
          placeholder="Enter condition"
        />
      </mat-form-field>

      <!-- availability Field -->
      <!-- FK reference not found, render as plain text input -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Availability</mat-label>
        <input
          matInput
          type="text"
          formControlName="availability"
          placeholder="Enter availability"
        />
      </mat-form-field>

      <!-- launch_date Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Launch Date</mat-label>
        <input
          matInput
          type="text"
          formControlName="launch_date"
          placeholder="Enter launch date"
        />
      </mat-form-field>

      <!-- discontinued_date Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Discontinued Date</mat-label>
        <input
          matInput
          type="text"
          formControlName="discontinued_date"
          placeholder="Enter discontinued date"
        />
      </mat-form-field>

      <!-- last_stock_check Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Last Stock Check</mat-label>
        <input
          matInput
          type="text"
          formControlName="last_stock_check"
          placeholder="Enter last stock check"
        />
      </mat-form-field>

      <!-- next_restock_date Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Next Restock Date</mat-label>
        <input
          matInput
          type="text"
          formControlName="next_restock_date"
          placeholder="Enter next restock date"
        />
      </mat-form-field>

      <!-- attributes Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Attributes</mat-label>
        <input
          matInput
          type="text"
          formControlName="attributes"
          placeholder="Enter attributes"
        />
      </mat-form-field>

      <!-- tags Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Tags</mat-label>
        <input
          matInput
          type="text"
          formControlName="tags"
          placeholder="Enter tags"
        />
      </mat-form-field>

      <!-- images Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Images</mat-label>
        <input
          matInput
          type="text"
          formControlName="images"
          placeholder="Enter images"
        />
      </mat-form-field>

      <!-- pricing_tiers Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Pricing Tiers</mat-label>
        <input
          matInput
          type="text"
          formControlName="pricing_tiers"
          placeholder="Enter pricing tiers"
        />
      </mat-form-field>

      <!-- dimensions Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Dimensions</mat-label>
        <input
          matInput
          type="text"
          formControlName="dimensions"
          placeholder="Enter dimensions"
        />
      </mat-form-field>

      <!-- seo_metadata Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Seo Metadata</mat-label>
        <input
          matInput
          type="text"
          formControlName="seo_metadata"
          placeholder="Enter seo metadata"
        />
      </mat-form-field>

      <!-- category_id Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Category Id</mat-label>
        <input
          matInput
          type="text"
          formControlName="category_id"
          placeholder="Enter category id"
        />
        <mat-error
          *ngIf="testProductsForm.get('category_id')?.hasError('required')"
        >
          Category Id is required
        </mat-error>
      </mat-form-field>

      <!-- parent_product_id Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Parent Product Id</mat-label>
        <input
          matInput
          type="dropdown"
          formControlName="parent_product_id"
          placeholder="Enter parent product id"
        />
      </mat-form-field>

      <!-- supplier_id Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Supplier Id</mat-label>
        <input
          matInput
          type="text"
          formControlName="supplier_id"
          placeholder="Enter supplier id"
        />
      </mat-form-field>

      <!-- deleted_at Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Deleted At</mat-label>
        <input
          matInput
          type="text"
          formControlName="deleted_at"
          placeholder="Enter deleted at"
        />
      </mat-form-field>

      <!-- updated_by Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Updated By</mat-label>
        <input
          matInput
          type="text"
          formControlName="updated_by"
          placeholder="Enter updated by"
        />
      </mat-form-field>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          mat-button
          type="button"
          (click)="onCancel()"
          [disabled]="loading"
        >
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          type="button"
          (click)="onSubmit()"
          [disabled]="
            testProductsForm.invalid ||
            loading ||
            (mode === 'edit' && !hasChanges())
          "
        >
          <mat-spinner
            diameter="20"
            class="inline-spinner"
            *ngIf="loading"
          ></mat-spinner>
          {{ mode === 'create' ? 'Create' : 'Update' }} TestProduct
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      /* Tremor-inspired Form - Minimal Changes */
      .test-products-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      /* Tremor Border Colors - Darker (from Tremor Blocks) */
      ::ng-deep .test-products-form {
        .mdc-text-field--outlined:not(.mdc-text-field--disabled) {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: #d1d5db;
            border-width: 1px;
          }

          &:hover .mdc-notched-outline {
            .mdc-notched-outline__leading,
            .mdc-notched-outline__notch,
            .mdc-notched-outline__trailing {
              border-color: #9ca3af;
            }
          }

          &.mdc-text-field--focused .mdc-notched-outline {
            .mdc-notched-outline__leading,
            .mdc-notched-outline__notch,
            .mdc-notched-outline__trailing {
              border-color: #3b82f6;
              border-width: 2px;
            }
          }
        }

        /* Error Messages - Tremor red */
        .mat-mdc-form-field-error {
          color: #ef4444;
        }

        /* Datepicker Toggle */
        .mat-datepicker-toggle {
          color: #6b7280;

          &:hover {
            color: #3b82f6;
          }
        }
      }

      /* Checkbox Field */
      .checkbox-field {
        margin: 8px 0;
      }

      /* Form Actions */
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
      }

      .inline-spinner {
        margin-right: 8px;
      }

      @media (max-width: 768px) {
        .form-actions {
          flex-direction: column;
          gap: 8px;
        }
      }
    `,
  ],
})
export class TestProductFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  // CRUD-GENERATOR-TAG: Foreign Key Service Injection

  @Input() mode: TestProductFormMode = 'create';
  @Input() initialData?: TestProduct;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<TestProductFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;
  // CRUD-GENERATOR-TAG: Foreign Key Options State

  testProductsForm: FormGroup = this.fb.group({
    sku: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    barcode: ['', []],
    manufacturer: ['', []],
    description: ['', [Validators.maxLength(1000)]],
    long_description: ['', []],
    specifications: ['', []],
    quantity: ['', []],
    min_quantity: ['', []],
    max_quantity: ['', []],
    price: ['', [Validators.required]],
    cost: ['', []],
    weight: ['', []],
    discount_percentage: ['', []],
    is_active: [false, []],
    is_featured: [false, []],
    is_taxable: [false, []],
    is_shippable: [false, []],
    allow_backorder: [false, []],
    status: ['', [Validators.maxLength(20)]],
    condition: ['', []],
    availability: ['', []],
    launch_date: ['', []],
    discontinued_date: ['', []],
    last_stock_check: ['', []],
    next_restock_date: ['', []],
    attributes: ['', []],
    tags: ['', []],
    images: ['', []],
    pricing_tiers: ['', []],
    dimensions: ['', []],
    seo_metadata: ['', []],
    category_id: ['', [Validators.required]],
    parent_product_id: ['', []],
    supplier_id: ['', []],
    deleted_at: ['', []],
    updated_by: ['', []],
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

  private populateForm(testProducts: TestProduct) {
    const formValue = {
      sku: testProducts.sku,
      name: testProducts.name,
      barcode: testProducts.barcode,
      manufacturer: testProducts.manufacturer,
      description: testProducts.description,
      long_description: testProducts.long_description,
      specifications: testProducts.specifications,
      quantity: testProducts.quantity,
      min_quantity: testProducts.min_quantity,
      max_quantity: testProducts.max_quantity,
      price: testProducts.price,
      cost: testProducts.cost,
      weight: testProducts.weight,
      discount_percentage: testProducts.discount_percentage,
      is_active: testProducts.is_active,
      is_featured: testProducts.is_featured,
      is_taxable: testProducts.is_taxable,
      is_shippable: testProducts.is_shippable,
      allow_backorder: testProducts.allow_backorder,
      status: testProducts.status,
      condition: testProducts.condition,
      availability: testProducts.availability,
      launch_date: testProducts.launch_date,
      discontinued_date: testProducts.discontinued_date,
      last_stock_check: testProducts.last_stock_check,
      next_restock_date: testProducts.next_restock_date,
      attributes: testProducts.attributes,
      tags: testProducts.tags,
      images: testProducts.images,
      pricing_tiers: testProducts.pricing_tiers,
      dimensions: testProducts.dimensions,
      seo_metadata: testProducts.seo_metadata,
      category_id: testProducts.category_id,
      parent_product_id: testProducts.parent_product_id,
      supplier_id: testProducts.supplier_id,
      deleted_at: testProducts.deleted_at,
      updated_by: testProducts.updated_by,
    };

    this.testProductsForm.patchValue(formValue);
    this.originalFormValue = this.testProductsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.testProductsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.testProductsForm.valid) {
      const formData = {
        ...this.testProductsForm.value,
      } as TestProductFormData;

      // Convert date fields to date-only format for submission
      if (formData.launch_date) {
        formData.launch_date = formatDateForSubmission(formData.launch_date);
      }
      if (formData.discontinued_date) {
        formData.discontinued_date = formatDateForSubmission(
          formData.discontinued_date,
        );
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
