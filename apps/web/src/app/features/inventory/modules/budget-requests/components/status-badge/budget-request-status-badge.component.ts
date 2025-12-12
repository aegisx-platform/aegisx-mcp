import {
  Component,
  Input,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BudgetRequestStatus } from '../../types/budget-requests.types';

type StatusInfo = {
  icon: string;
  colorClass: string;
  label: string;
};

const STATUS_MAP: Record<BudgetRequestStatus, StatusInfo> = {
  DRAFT: {
    icon: 'edit_note',
    colorClass: 'status-draft',
    label: 'Draft',
  },
  SUBMITTED: {
    icon: 'outbox',
    colorClass: 'status-submitted',
    label: 'Submitted',
  },
  DEPT_APPROVED: {
    icon: 'approval',
    colorClass: 'status-dept-approved',
    label: 'Dept. Approved',
  },
  FINANCE_APPROVED: {
    icon: 'verified',
    colorClass: 'status-finance-approved',
    label: 'Approved',
  },
  REJECTED: {
    icon: 'cancel',
    colorClass: 'status-rejected',
    label: 'Rejected',
  },
};

@Component({
  selector: 'app-budget-request-status-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './budget-request-status-badge.component.html',
  styleUrls: ['./budget-request-status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetRequestStatusBadgeComponent {
  private readonly _status = signal<BudgetRequestStatus>('DRAFT');

  @Input({ required: true })
  set status(value: BudgetRequestStatus | undefined | null) {
    this._status.set(value ?? 'DRAFT');
  }

  readonly statusInfo = computed(() => {
    return STATUS_MAP[this._status()] || STATUS_MAP.DRAFT;
  });
}
