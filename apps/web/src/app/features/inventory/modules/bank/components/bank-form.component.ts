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
  Bank,
  CreateBankRequest,
  UpdateBankRequest,
} from '../types/bank.types';

export type BankFormMode = 'create' | 'edit';

export interface BankFormData {
  bank_code: string;
  bank_name: string;
  swift_code?: string;
  is_active?: boolean;
}

@Component({
  selector: 'app-bank-form',
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
      <form [formGroup]="bankForm" class="bank-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">Bank Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- bank_code Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bank Code</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="bank_code"
                  placeholder="Enter bank code"
                />
                <mat-error
                  *ngIf="bankForm.get('bank_code')?.hasError('required')"
                >
                  Bank Code is required
                </mat-error>
              </mat-form-field>

              <!-- bank_name Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bank Name</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="bank_name"
                  placeholder="Enter bank name"
                />
                <mat-error
                  *ngIf="bankForm.get('bank_name')?.hasError('required')"
                >
                  Bank Name is required
                </mat-error>
              </mat-form-field>

              <!-- swift_code Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Swift Code</mat-label>
                <input
                  matInput
                  type="text"
                  formControlName="swift_code"
                  placeholder="Enter swift code"
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
          bankForm.invalid || loading || (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} Bank
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      /* Form Container */
      .bank-form {
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
export class BankFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() mode: BankFormMode = 'create';
  @Input() initialData?: Bank;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<BankFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;

  bankForm: FormGroup = this.fb.group({
    bank_code: ['', [Validators.required]],
    bank_name: ['', [Validators.required]],
    swift_code: ['', []],
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

  private populateForm(bank: Bank) {
    const formValue = {
      bank_code: bank.bank_code,
      bank_name: bank.bank_name,
      swift_code: bank.swift_code,
      is_active: bank.is_active,
    };

    this.bankForm.patchValue(formValue);
    this.originalFormValue = this.bankForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.bankForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.bankForm.valid) {
      const formData = { ...this.bankForm.value } as BankFormData;

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
