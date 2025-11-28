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
  TestProduct,
  CreateTestProductRequest,
  UpdateTestProductRequest,
} from '../types/test-products.types';

export type TestProductFormMode = 'create' | 'edit';

export interface TestProductFormData {
  code: string;
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: unknown;
  item_count?: unknown;
  discount_rate?: unknown;
  metadata?: unknown;
  settings?: unknown;
  status?: string;
}

@Component({
  selector: 'app-test-products-form',
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
      <form [formGroup]="testProductsForm" class="test-products-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">TestProduct Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- code Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Code</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="code"
                  placeholder="Enter code"
                />
                <mat-error
                  *ngIf="testProductsForm.get('code')?.hasError('required')"
                >
                  Code is required
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
                <mat-error
                  *ngIf="testProductsForm.get('name')?.hasError('required')"
                >
                  Name is required
                </mat-error>
                <mat-error
                  *ngIf="testProductsForm.get('name')?.hasError('maxlength')"
                >
                  Name must be less than 255 characters
                </mat-error>
              </mat-form-field>

              <!-- slug Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Slug</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="slug"
                  placeholder="Enter slug"
                />
                <mat-error
                  *ngIf="testProductsForm.get('slug')?.hasError('required')"
                >
                  Slug is required
                </mat-error>
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
                    testProductsForm.get('description')?.hasError('maxlength')
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

              <!-- is_featured Field -->
              <div class="checkbox-field">
                <mat-checkbox formControlName="is_featured">
                  Is Featured
                </mat-checkbox>
              </div>

              <!-- display_order Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Display Order</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="display_order"
                  placeholder="Enter display order"
                />
              </mat-form-field>

              <!-- item_count Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Item Count</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="item_count"
                  placeholder="Enter item count"
                />
              </mat-form-field>

              <!-- discount_rate Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Discount Rate</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="discount_rate"
                  placeholder="Enter discount rate"
                />
              </mat-form-field>

              <!-- metadata Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Metadata</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="metadata"
                  placeholder="Enter metadata"
                />
              </mat-form-field>

              <!-- settings Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Settings</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="settings"
                  placeholder="Enter settings"
                />
              </mat-form-field>

              <!-- status Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Status</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="status"
                  placeholder="Enter status"
                />
                <mat-error
                  *ngIf="testProductsForm.get('status')?.hasError('maxlength')"
                >
                  Status must be less than 20 characters
                </mat-error>
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
          testProductsForm.invalid ||
          loading ||
          (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} TestProduct
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .test-products-form {
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
export class TestProductFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() mode: TestProductFormMode = 'create';
  @Input() initialData?: TestProduct;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<TestProductFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;

  testProductsForm: FormGroup = this.fb.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    slug: ['', [Validators.required]],
    description: ['', [Validators.maxLength(1000)]],
    is_active: [false, []],
    is_featured: [false, []],
    display_order: ['', []],
    item_count: ['', []],
    discount_rate: ['', []],
    metadata: ['', []],
    settings: ['', []],
    status: ['', [Validators.maxLength(20)]],
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

  private populateForm(testProducts: TestProduct) {
    const formValue = {
      code: testProducts.code,
      name: testProducts.name,
      slug: testProducts.slug,
      description: testProducts.description,
      is_active: testProducts.is_active,
      is_featured: testProducts.is_featured,
      display_order: testProducts.display_order,
      item_count: testProducts.item_count,
      discount_rate: testProducts.discount_rate,
      metadata:
        typeof testProducts.metadata === 'object' &&
        testProducts.metadata !== null
          ? JSON.stringify(testProducts.metadata, null, 2)
          : testProducts.metadata || '',
      settings:
        typeof testProducts.settings === 'object' &&
        testProducts.settings !== null
          ? JSON.stringify(testProducts.settings, null, 2)
          : testProducts.settings || '',
      status: testProducts.status,
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

      // Convert number fields from string to number (TypeBox expects number, not string)
      if (formData.display_order !== undefined) {
        const display_orderVal = formData.display_order;
        formData.display_order =
          display_orderVal === '' || display_orderVal === null
            ? null
            : Number(display_orderVal);
      }
      if (formData.item_count !== undefined) {
        const item_countVal = formData.item_count;
        formData.item_count =
          item_countVal === '' || item_countVal === null
            ? null
            : Number(item_countVal);
      }
      if (formData.discount_rate !== undefined) {
        const discount_rateVal = formData.discount_rate;
        formData.discount_rate =
          discount_rateVal === '' || discount_rateVal === null
            ? null
            : Number(discount_rateVal);
      }

      // Parse JSON fields from string to object (TypeBox expects object, not string)
      if (typeof formData.metadata === 'string') {
        try {
          formData.metadata =
            formData.metadata.trim() === ''
              ? {}
              : JSON.parse(formData.metadata);
        } catch {
          formData.metadata = {};
        }
      } else if (!formData.metadata) {
        formData.metadata = {};
      }
      if (typeof formData.settings === 'string') {
        try {
          formData.settings =
            formData.settings.trim() === ''
              ? {}
              : JSON.parse(formData.settings);
        } catch {
          formData.settings = {};
        }
      } else if (!formData.settings) {
        formData.settings = {};
      }

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
