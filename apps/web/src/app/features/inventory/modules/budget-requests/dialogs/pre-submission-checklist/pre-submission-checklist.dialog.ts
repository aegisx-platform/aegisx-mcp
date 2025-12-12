import {
  Component,
  Inject,
  ChangeDetectionStrategy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

import { BudgetRequest } from '../../types/budget-requests.types';
import {
  ValidationResult,
  BudgetRequestValidationService,
} from '../../services/budget-request-validation.service';
import { AxAlertComponent } from '@aegisx/ui';

export interface PreSubmissionChecklistData {
  requestId: number;
  request: BudgetRequest;
}

export interface BudgetImpact {
  budgetTypeId: string;
  budgetTypeName: string;
  allocated: number;
  used: number;
  reserved: number;
  available: number;
  utilizationPercent: number;
}

export interface DrugsInPlanResult {
  drugsNotInPlan: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  drugsInPlan: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}

export interface QuarterlyDistribution {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  total: number;
}

@Component({
  selector: 'app-pre-submission-checklist-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    AxAlertComponent,
  ],
  templateUrl: './pre-submission-checklist.dialog.html',
  styleUrls: ['./pre-submission-checklist.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreSubmissionChecklistDialogComponent implements OnInit {
  private http = inject(HttpClient);
  private validationService = inject(BudgetRequestValidationService);

  // Signals
  isConfirmed = signal(false);
  isLoading = signal(true);
  loadingError = signal<string | null>(null);
  validationResult = signal<ValidationResult | null>(null);
  budgetImpact = signal<BudgetImpact | null>(null);
  drugsInPlan = signal<DrugsInPlanResult | null>(null);
  quarterlyDistribution = signal<QuarterlyDistribution | null>(null);

  readonly baseUrl = '/inventory/budget/budget-requests';

  constructor(
    public dialogRef: MatDialogRef<PreSubmissionChecklistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PreSubmissionChecklistData,
  ) {}

  ngOnInit(): void {
    this.loadValidationData();
  }

  private async loadValidationData(): Promise<void> {
    try {
      const requestId = this.data.requestId;

      // Load validation results
      const validation = await this.validationService
        .validateForSubmit(requestId, this.data.request)
        .toPromise();

      if (validation) {
        this.validationResult.set(validation);
      }

      // Load budget impact
      try {
        const budgetResponse = await this.http
          .post<BudgetImpact>(
            `${this.baseUrl}/${requestId}/check-budget-availability`,
            {},
          )
          .toPromise();

        if (budgetResponse) {
          this.budgetImpact.set(budgetResponse);
        }
      } catch (error: any) {
        console.warn('Failed to load budget impact:', error);
      }

      // Load drugs in plan check
      try {
        const drugsResponse = await this.http
          .post<DrugsInPlanResult>(
            `${this.baseUrl}/${requestId}/check-drugs-in-plan`,
            { drug_ids: (this.data.request.items || []).map((i: any) => i.id) },
          )
          .toPromise();

        if (drugsResponse) {
          this.drugsInPlan.set(drugsResponse);
        }
      } catch (error: any) {
        console.warn('Failed to load drugs plan check:', error);
      }

      // Extract quarterly distribution from request items
      this.extractQuarterlyDistribution();
    } catch (error: any) {
      this.loadingError.set(
        error?.error?.message || 'Failed to load validation data',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  private extractQuarterlyDistribution(): void {
    const items = this.data.request.items || [];
    const distribution: QuarterlyDistribution = {
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      total: items.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0,
      ),
    };

    // Parse quarterly distribution from items
    // This assumes items have q1_quantity, q2_quantity, etc. fields
    items.forEach((item: any) => {
      distribution.q1 += item.q1_quantity || 0;
      distribution.q2 += item.q2_quantity || 0;
      distribution.q3 += item.q3_quantity || 0;
      distribution.q4 += item.q4_quantity || 0;
    });

    this.quarterlyDistribution.set(distribution);
  }

  get hasErrors(): boolean {
    const validation = this.validationResult();
    return validation ? validation.errors.length > 0 : false;
  }

  get hasWarnings(): boolean {
    const validation = this.validationResult();
    return validation ? validation.warnings.length > 0 : false;
  }

  get isValidationPassed(): boolean {
    const validation = this.validationResult();
    return validation ? validation.valid : false;
  }

  get budgetUtilizationPercent(): number {
    const impact = this.budgetImpact();
    return impact ? impact.utilizationPercent : 0;
  }

  get budgetUtilizationColor(): string {
    const percent = this.budgetUtilizationPercent;
    if (percent < 50) return 'primary';
    if (percent < 80) return 'accent';
    return 'warn';
  }

  get quarterlyValid(): boolean {
    const q = this.quarterlyDistribution();
    if (!q) return true;
    return q.q1 + q.q2 + q.q3 + q.q4 === q.total;
  }

  get submitButtonDisabled(): boolean {
    return this.hasErrors || !this.isConfirmed() || this.isLoading();
  }

  get submitAnyWayButtonDisabled(): boolean {
    return !this.hasWarnings || !this.isConfirmed() || this.isLoading();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmitAnyway(): void {
    if (!this.hasErrors && this.isConfirmed()) {
      this.dialogRef.close('submit_anyway');
    }
  }

  onSubmit(): void {
    if (!this.hasErrors && this.isConfirmed()) {
      this.dialogRef.close('submit');
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  getDrugName(item: any): string {
    return item.drug_name || item.name || 'Unknown Drug';
  }

  formatDrugQuantity(drug: any): string {
    const qty = drug.quantity || 0;
    const unit = drug.unit || 'units';
    return `${qty} ${unit}`;
  }
}
