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
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '../types/budgets.types';

export type BudgetFormMode = 'create' | 'edit';

export interface BudgetFormData {
  budget_type_id: string;
  budget_category_id: string;
  description?: string;
  is_active?: boolean;
}

@Component({
  selector: 'app-budgets-form',
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
      <form [formGroup]="budgetsForm" class="budgets-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">Budget Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- budget_type_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Budget Type Id</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="budget_type_id"
                  placeholder="Enter budget type id"
                />
                <mat-error
                  *ngIf="
                    budgetsForm.get('budget_type_id')?.hasError('required')
                  "
                >
                  Budget Type Id is required
                </mat-error>
              </mat-form-field>

              <!-- budget_category_id Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Budget Category Id</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="budget_category_id"
                  placeholder="Enter budget category id"
                />
                <mat-error
                  *ngIf="
                    budgetsForm.get('budget_category_id')?.hasError('required')
                  "
                >
                  Budget Category Id is required
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
                  *ngIf="budgetsForm.get('description')?.hasError('maxlength')"
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
          budgetsForm.invalid || loading || (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} Budget
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .budgets-form {
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
export class BudgetFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() mode: BudgetFormMode = 'create';
  @Input() initialData?: Budget;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<BudgetFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;

  budgetsForm: FormGroup = this.fb.group({
    budget_type_id: ['', [Validators.required]],
    budget_category_id: ['', [Validators.required]],
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

  private populateForm(budgets: Budget) {
    const formValue = {
      budget_type_id: budgets.budget_type_id,
      budget_category_id: budgets.budget_category_id,
      description: budgets.description,
      is_active: budgets.is_active,
    };

    this.budgetsForm.patchValue(formValue);
    this.originalFormValue = this.budgetsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.budgetsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.budgetsForm.valid) {
      const formData = { ...this.budgetsForm.value } as BudgetFormData;

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
