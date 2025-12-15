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
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import {
  BudgetRequest,
  CreateBudgetRequestRequest,
  UpdateBudgetRequestRequest,
} from '../types/budget-requests.types';
import { DepartmentService } from '../../departments/services/departments.service';
import { Department } from '../../departments/types/departments.types';

export type BudgetRequestFormMode = 'create' | 'edit';

export interface BudgetRequestFormData {
  fiscal_year: number;
  department_id?: number | null;
  justification?: string;
}

@Component({
  selector: 'app-budget-requests-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <!-- Dialog Content -->
    <mat-dialog-content>
      <form [formGroup]="budgetRequestsForm" class="budget-requests-form">
        <!-- Form Fields Section -->
        <div class="ax-dialog-section">
          <h3 class="ax-dialog-section-title">Budget Request Information</h3>
          <div class="ax-dialog-section-content">
            <div class="form-grid">
              <!-- fiscal_year Field - Dropdown -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Fiscal Year / ปีงบประมาณ</mat-label>
                <mat-select formControlName="fiscal_year">
                  @for (year of fiscalYearOptions; track year) {
                    <mat-option [value]="year">{{ year }}</mat-option>
                  }
                </mat-select>
                <mat-error
                  *ngIf="
                    budgetRequestsForm.get('fiscal_year')?.hasError('required')
                  "
                >
                  Fiscal Year is required
                </mat-error>
              </mat-form-field>

              <!-- department_id Field - Dropdown -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Department / แผนก</mat-label>
                <mat-select formControlName="department_id">
                  <mat-option [value]="null"
                    >ทุกแผนก (All Departments)</mat-option
                  >
                  @for (dept of departments(); track dept.id) {
                    <mat-option [value]="dept.id">{{
                      dept.dept_name
                    }}</mat-option>
                  }
                </mat-select>
                <mat-hint>Optional - leave blank for all departments</mat-hint>
              </mat-form-field>

              <!-- justification Field -->
              <mat-form-field appearance="outline" class="full-width span-2">
                <mat-label>Justification / เหตุผลประกอบการขอ</mat-label>
                <textarea
                  matInput
                  formControlName="justification"
                  placeholder="Enter justification for this budget request"
                  rows="4"
                ></textarea>
                <mat-hint
                  >Describe the purpose and need for this budget
                  request</mat-hint
                >
              </mat-form-field>

              <!-- Read-only info for Edit mode -->
              @if (mode === 'edit' && initialData) {
                <div class="info-section span-2">
                  <h4>Request Information</h4>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Request Number:</span>
                      <span class="info-value">{{
                        initialData.request_number
                      }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Status:</span>
                      <span
                        class="info-value status-badge"
                        [class]="'status-' + initialData.status?.toLowerCase()"
                      >
                        {{ initialData.status }}
                      </span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Total Amount:</span>
                      <span class="info-value"
                        >฿{{
                          initialData.total_requested_amount | number: '1.2-2'
                        }}</span
                      >
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <!-- Form Actions -->
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
          budgetRequestsForm.invalid ||
          loading ||
          (mode === 'edit' && !hasChanges())
        "
      >
        @if (loading) {
          <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
        }
        {{ mode === 'create' ? 'Create' : 'Update' }} Budget Request
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .budget-requests-form {
        display: flex;
        flex-direction: column;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--ax-spacing-md, 16px);
      }

      .full-width {
        width: 100%;
      }

      .span-2 {
        grid-column: span 2;
      }

      .inline-spinner {
        margin-right: 8px;
      }

      .info-section {
        background: var(--ax-surface-variant, #f5f5f5);
        border-radius: 8px;
        padding: 16px;
        margin-top: 8px;
      }

      .info-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--ax-on-surface-variant, #666);
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .info-label {
        font-size: 12px;
        color: var(--ax-on-surface-variant, #666);
      }

      .info-value {
        font-size: 14px;
        font-weight: 500;
      }

      .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }

      .status-draft {
        background: #e3f2fd;
        color: #1976d2;
      }

      .status-submitted {
        background: #fff3e0;
        color: #f57c00;
      }

      .status-approved {
        background: #e8f5e9;
        color: #388e3c;
      }

      .status-rejected {
        background: #ffebee;
        color: #d32f2f;
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }

        .span-2 {
          grid-column: span 1;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class BudgetRequestFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private departmentService = inject(DepartmentService);

  @Input() mode: BudgetRequestFormMode = 'create';
  @Input() initialData?: BudgetRequest;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<BudgetRequestFormData>();
  @Output() formCancel = new EventEmitter<void>();

  private originalFormValue: any;

  // Fiscal year options (Thai Buddhist calendar: 2567-2575)
  fiscalYearOptions: number[] = [];

  // Departments loaded from API
  departments = signal<Department[]>([]);

  budgetRequestsForm: FormGroup = this.fb.group({
    fiscal_year: [null, [Validators.required]],
    department_id: [null],
    justification: [''],
  });

  ngOnInit() {
    this.initFiscalYearOptions();
    this.loadDepartments();

    if (this.mode === 'edit' && this.initialData) {
      this.populateForm(this.initialData);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && this.initialData && this.mode === 'edit') {
      this.populateForm(this.initialData);
    }
  }

  private initFiscalYearOptions() {
    // Thai Buddhist calendar years (current year + 5 years ahead)
    const currentYear = new Date().getFullYear() + 543; // Convert to Buddhist year
    for (let i = 0; i <= 8; i++) {
      this.fiscalYearOptions.push(currentYear + i);
    }
  }

  private async loadDepartments() {
    try {
      await this.departmentService.loadDepartmentList({
        limit: 100,
        is_active: true,
      });
      const departmentsList = this.departmentService.departmentsList();
      this.departments.set(departmentsList);
    } catch (error) {
      console.error('Failed to load departments:', error);
      // Fallback - form still works without departments
    }
  }

  private populateForm(budgetRequest: BudgetRequest) {
    const formValue = {
      fiscal_year: budgetRequest.fiscal_year,
      department_id: budgetRequest.department_id || null,
      justification: budgetRequest.justification || '',
    };

    this.budgetRequestsForm.patchValue(formValue);
    this.originalFormValue = this.budgetRequestsForm.value;
  }

  hasChanges(): boolean {
    if (this.mode === 'create') return true;
    const currentValue = this.budgetRequestsForm.value;
    return (
      JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue)
    );
  }

  onSubmit() {
    if (this.budgetRequestsForm.valid) {
      const formData: BudgetRequestFormData = {
        fiscal_year: Number(this.budgetRequestsForm.value.fiscal_year),
        department_id: this.budgetRequestsForm.value.department_id || null,
        justification: this.budgetRequestsForm.value.justification || undefined,
      };

      this.formSubmit.emit(formData);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
