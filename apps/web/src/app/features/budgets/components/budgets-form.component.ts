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
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '../types/budgets.types';

export type BudgetFormMode = 'create' | 'edit';

export interface BudgetFormData {
  budget_code: string;
  budget_type: string;
  budget_category: string;
  budget_description?: string;
  is_active?: boolean;
}

@Component({
  selector: 'app-budgets-form',
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
    <form [formGroup]="budgetsForm" class="budgets-form">
      <!-- budget_code Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Budget Code</mat-label>
        <input
          matInput
          type="text"
          formControlName="budget_code"
          placeholder="Enter budget code"
        />
        <mat-error *ngIf="budgetsForm.get('budget_code')?.hasError('required')">
          Budget Code is required
        </mat-error>
      </mat-form-field>
      
      <!-- budget_type Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Budget Type</mat-label>
        <input
          matInput
          type="text"
          formControlName="budget_type"
          placeholder="Enter budget type"
        />
        <mat-error *ngIf="budgetsForm.get('budget_type')?.hasError('required')">
          Budget Type is required
        </mat-error>
      </mat-form-field>
      
      <!-- budget_category Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Budget Category</mat-label>
        <input
          matInput
          type="text"
          formControlName="budget_category"
          placeholder="Enter budget category"
        />
        <mat-error *ngIf="budgetsForm.get('budget_category')?.hasError('required')">
          Budget Category is required
        </mat-error>
      </mat-form-field>
      
      <!-- budget_description Field -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Budget Description</mat-label>
        <textarea
          matInput
          formControlName="budget_description"
          placeholder="Enter budget description"
          rows="3"
        ></textarea>
      </mat-form-field>

      <!-- is_active Field -->
      <div class="checkbox-field">
        <mat-checkbox formControlName="is_active"> Is Active </mat-checkbox>
      </div>

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
            budgetsForm.invalid || loading || (mode === 'edit' && !hasChanges())
          "
        >
          <mat-spinner
            diameter="20"
            class="inline-spinner"
            *ngIf="loading"
          ></mat-spinner>
          {{ mode === 'create' ? 'Create' : 'Update' }} Budget
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      /* Tremor-inspired Form - Minimal Changes */
      .budgets-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      /* Tremor Border Colors - Darker (from Tremor Blocks) */
      ::ng-deep .budgets-form {
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
export class BudgetFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() mode: BudgetFormMode = 'create';
  @Input() initialData?: Budget;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<BudgetFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;

  budgetsForm: FormGroup = this.fb.group({
    budget_code: ['', [Validators.required]],
    budget_type: ['', [Validators.required]],
    budget_category: ['', [Validators.required]],
    budget_description: ['', []],
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
      budget_code: budgets.budget_code,
      budget_type: budgets.budget_type,
      budget_category: budgets.budget_category,
      budget_description: budgets.budget_description,
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
