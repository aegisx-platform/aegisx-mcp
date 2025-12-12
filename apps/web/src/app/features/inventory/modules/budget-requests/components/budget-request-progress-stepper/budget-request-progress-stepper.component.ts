import {
  Component,
  Input,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { BudgetRequest } from '../../types/budget-requests.types';

@Component({
  selector: 'app-budget-request-progress-stepper',
  standalone: true,
  imports: [CommonModule, MatStepperModule, MatIconModule],
  templateUrl: './budget-request-progress-stepper.component.html',
  styleUrls: ['./budget-request-progress-stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetRequestProgressStepperComponent {
  readonly requestSignal = signal<BudgetRequest | null>(null);

  @Input({ required: true })
  set request(value: BudgetRequest | null) {
    this.requestSignal.set(value);
  }

  // Define the sequence of steps
  private readonly steps = [
    'DRAFT',
    'SUBMITTED',
    'DEPT_APPROVED',
    'FINANCE_APPROVED',
  ];

  // Compute the selected index for the stepper
  readonly selectedIndex = computed(() => {
    const status = this.requestSignal()?.status;
    if (!status || status === 'REJECTED') {
      return 0; // Default to first step if rejected or no status
    }
    return this.steps.indexOf(status);
  });

  readonly isRejected = computed(
    () => this.requestSignal()?.status === 'REJECTED',
  );

  // Computed signal for the rejected step to show rejection details
  readonly rejectionDetails = computed(() => {
    if (!this.isRejected()) return null;
    const request = this.requestSignal();
    return {
      reason: request?.rejection_reason || 'No reason provided.',
      by: request?.finance_reviewed_by || request?.dept_reviewed_by, // Assuming one of these exists
      at: request?.finance_reviewed_at || request?.dept_reviewed_at,
    };
  });
}
