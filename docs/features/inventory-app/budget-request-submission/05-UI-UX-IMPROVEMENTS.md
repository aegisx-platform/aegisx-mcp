# 05. UI/UX Improvements for Submission Flow

**Version:** 1.0.0
**Date:** 2025-12-12

[← Back to Index](./README.md) | [← Previous: Dashboard Spec](./04-DASHBOARD-SPEC.md)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Current UX Issues](#current-ux-issues)
3. [Progress Indicator](#progress-indicator)
4. [Pre-submission Checklist Dialog](#pre-submission-checklist-dialog)
5. [Inline Validation Feedback](#inline-validation-feedback)
6. [Status Badge & Visual Indicators](#status-badge--visual-indicators)
7. [Action Buttons & States](#action-buttons--states)
8. [Toast Notifications](#toast-notifications)
9. [Confirmation Dialogs](#confirmation-dialogs)
10. [Mobile Responsiveness](#mobile-responsiveness)

---

## Overview

การปรับปรุง UX เพื่อให้:

1. **ผู้ใช้รู้ว่าอยู่ขั้นตอนไหน** - Progress indicator
2. **ผู้ใช้รู้ว่าต้องทำอะไรต่อ** - Clear action buttons & checklist
3. **ผู้ใช้รู้ทันทีว่าผิดพลาด** - Inline validation feedback
4. **ผู้ใช้มั่นใจก่อนทำ action สำคัญ** - Confirmation dialogs
5. **ผู้ใช้เห็น feedback ทันที** - Toast notifications

---

## Current UX Issues

### 🔴 Critical UX Problems

1. **No Visual Progress** - ผู้ใช้ไม่รู้ว่าอยู่ขั้นตอนไหน
2. **No Pre-submit Checklist** - ไม่รู้ว่าพร้อม submit หรือยัง
3. **Validation Errors Hidden** - เห็นข้อผิดพลาดตอน submit เท่านั้น
4. **Confusing Action Buttons** - ปุ่มเยอะ ไม่รู้ว่าควรกดอะไร
5. **No Confirmation for Critical Actions** - กด reject/delete ไม่มี confirm

---

## Progress Indicator

### Stepper Component

แสดง progress ของ Budget Request workflow

```
┌─────────────────────────────────────────────────────────┐
│  Budget Request Progress                                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ● ────────── ○ ────────── ○ ────────── ○               │
│  DRAFT      SUBMITTED  DEPT_APPROVED  FINANCE_APPROVED  │
│  ✓ Done     Current        Pending       Pending        │
│                                                           │
│  Created by: นายสมชาย ใจดี                              │
│  Created at: 2025-12-10 14:00                           │
│  Last updated: 2025-12-12 10:00                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
@Component({
  selector: 'budget-request-progress-stepper',
  template: `
    <mat-stepper [linear]="false" [selectedIndex]="currentStepIndex()">
      <!-- Step 1: DRAFT -->
      <mat-step [completed]="status() !== 'DRAFT'">
        <ng-template matStepLabel>
          <div class="step-label">
            <span class="step-title">Draft</span>
            <span class="step-subtitle">Creating request</span>
          </div>
        </ng-template>
        <div class="step-content">
          @if (status() === 'DRAFT') {
            <p>✍️ Currently editing...</p>
            <p class="hint">Click "Submit" when ready for approval</p>
          } @else {
            <p>✅ Created {{ createdAt() | date: 'short' }}</p>
            <p>By: {{ createdByName() }}</p>
          }
        </div>
      </mat-step>

      <!-- Step 2: SUBMITTED -->
      <mat-step [completed]="isCompletedStep('SUBMITTED')" [state]="getStepState('SUBMITTED')">
        <ng-template matStepLabel>
          <div class="step-label">
            <span class="step-title">Submitted</span>
            <span class="step-subtitle">Awaiting dept approval</span>
          </div>
        </ng-template>
        <div class="step-content">
          @if (status() === 'SUBMITTED') {
            <p>⏳ Waiting for Department Head approval</p>
            <p>Submitted: {{ submittedAt() | date: 'short' }}</p>
            <p>Waiting: {{ daysWaiting() }} days</p>
          } @else if (isCompletedStep('SUBMITTED')) {
            <p>✅ Submitted {{ submittedAt() | date: 'short' }}</p>
          }
        </div>
      </mat-step>

      <!-- Step 3: DEPT_APPROVED -->
      <mat-step [completed]="isCompletedStep('DEPT_APPROVED')" [state]="getStepState('DEPT_APPROVED')">
        <ng-template matStepLabel>
          <div class="step-label">
            <span class="step-title">Dept Approved</span>
            <span class="step-subtitle">Awaiting finance approval</span>
          </div>
        </ng-template>
        <div class="step-content">
          @if (status() === 'DEPT_APPROVED') {
            <p>⏳ Waiting for Finance Manager approval</p>
            <p>Approved by: {{ deptReviewedByName() }}</p>
            <p>Approved at: {{ deptReviewedAt() | date: 'short' }}</p>
          } @else if (isCompletedStep('DEPT_APPROVED')) {
            <p>✅ Dept approved {{ deptReviewedAt() | date: 'short' }}</p>
          }
        </div>
      </mat-step>

      <!-- Step 4: FINANCE_APPROVED -->
      <mat-step [completed]="status() === 'FINANCE_APPROVED'" state="done">
        <ng-template matStepLabel>
          <div class="step-label">
            <span class="step-title">Finance Approved</span>
            <span class="step-subtitle">Complete</span>
          </div>
        </ng-template>
        <div class="step-content">
          @if (status() === 'FINANCE_APPROVED') {
            <p>✅ Fully Approved!</p>
            <p>Approved by: {{ financeReviewedByName() }}</p>
            <p>Approved at: {{ financeReviewedAt() | date: 'short' }}</p>
          }
        </div>
      </mat-step>
    </mat-stepper>

    <!-- Rejected State (if applicable) -->
    @if (status() === 'REJECTED') {
      <mat-card class="rejected-notice">
        <mat-icon color="warn">cancel</mat-icon>
        <div>
          <h3>Request Rejected</h3>
          <p>Reason: {{ rejectionReason() }}</p>
          <button mat-button color="primary" (click)="reopen()">Reopen and Edit</button>
        </div>
      </mat-card>
    }
  `,
})
export class BudgetRequestProgressStepperComponent {
  @Input() budgetRequest!: BudgetRequest;

  status = computed(() => this.budgetRequest.status);

  currentStepIndex = computed(() => {
    const statusMap = {
      DRAFT: 0,
      SUBMITTED: 1,
      DEPT_APPROVED: 2,
      FINANCE_APPROVED: 3,
      REJECTED: -1,
    };
    return statusMap[this.status()] || 0;
  });

  isCompletedStep(targetStatus: string): boolean {
    const order = ['DRAFT', 'SUBMITTED', 'DEPT_APPROVED', 'FINANCE_APPROVED'];
    const currentIndex = order.indexOf(this.status());
    const targetIndex = order.indexOf(targetStatus);
    return currentIndex > targetIndex;
  }

  getStepState(targetStatus: string): string {
    if (this.status() === targetStatus) return 'edit'; // Current step
    if (this.isCompletedStep(targetStatus)) return 'done';
    return 'number'; // Pending
  }
}
```

---

## Pre-submission Checklist Dialog

### Checklist Dialog Component

แสดง checklist ก่อน submit พร้อมสรุปข้อมูล

```
┌─────────────────────────────────────────────────────┐
│  📋 Ready to Submit?                        [X]     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Please review before submitting:                    │
│                                                       │
│  ✅ Required Information                             │
│     ✓ Fiscal Year: 2568                             │
│     ✓ Department: Pharmacy Department               │
│     ✓ Justification: Provided (150 characters)      │
│                                                       │
│  ✅ Budget Request Items                             │
│     ✓ Total Items: 45 drugs                         │
│     ✓ Total Amount: 2,500,000.00 บาท                │
│     ✓ All items have valid prices                   │
│     ✓ All items have quarterly distribution         │
│                                                       │
│  ⚠️ Warnings                                         │
│     ⚠️ 3 drugs not in budget plan:                  │
│        - Paracetamol 500mg TAB                      │
│        - Ibuprofen 400mg TAB                        │
│        - Amoxicillin 500mg CAP                      │
│     ⚠️ Total exceeds 80% of available budget        │
│        (2,500,000 / 3,000,000 = 83%)                │
│                                                       │
│  💰 Budget Impact                                    │
│     Budget Type: OP001 - ยาและเวชภัณฑ์              │
│     Allocated:   3,000,000 บาท                      │
│     Used:        0 บาท                               │
│     Reserved:    500,000 บาท                        │
│     Available:   2,500,000 บาท                      │
│     This Request: 2,500,000 บาท                     │
│     After Submit: 0 บาท (100% utilized) ⚠️          │
│                                                       │
│  ℹ️ Next Steps After Submit                         │
│     1. Department Head will be notified             │
│     2. You cannot edit after submission             │
│     3. Approval typically takes 2-3 days            │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ ☑️ I have reviewed all information above    │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│             [Cancel]  [Submit for Approval]          │
└─────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
@Component({
  selector: 'pre-submission-checklist-dialog',
  templateUrl: './pre-submission-checklist-dialog.html',
})
export class PreSubmissionChecklistDialog {
  data = inject<{
    request: BudgetRequest;
    validation: ValidationResults;
    budgetImpact: BudgetImpact;
  }>(MAT_DIALOG_DATA);

  dialogRef = inject(MatDialogRef);

  confirmed = signal(false);

  get canSubmit(): boolean {
    return this.confirmed() && this.data.validation.valid;
  }

  submit() {
    if (this.canSubmit) {
      this.dialogRef.close(true);
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
```

---

## Inline Validation Feedback

### Real-time Field Validation

แสดง validation errors/warnings ทันทีที่พิมพ์

```html
<!-- Justification field with inline validation -->
<mat-form-field class="full-width">
  <mat-label>Justification (เหตุผลในการขอ)</mat-label>
  <textarea matInput rows="4" [(ngModel)]="justification" (ngModelChange)="validateJustification()" placeholder="กรุณาระบุเหตุผลในการขอจัดซื้อยาครั้งนี้อย่างน้อย 20 ตัวอักษร"></textarea>

  <!-- Character counter -->
  <mat-hint align="end">
    {{ justification.length }} / 1000 characters @if (justification.length < 20) {
    <span class="text-warn">(need {{ 20 - justification.length }} more)</span>
    }
  </mat-hint>

  <!-- Error messages -->
  @if (justificationError()) {
  <mat-error>{{ justificationError() }}</mat-error>
  }

  <!-- Warning messages -->
  @if (justificationWarning()) {
  <div class="field-warning">
    <mat-icon>warning</mat-icon>
    {{ justificationWarning() }}
  </div>
  }
</mat-form-field>
```

### Item-level Validation

```html
<!-- Quantity field with validation -->
<mat-form-field>
  <mat-label>Quantity</mat-label>
  <input matInput type="number" [(ngModel)]="item.requested_qty" (ngModelChange)="validateQuantity(item)" min="1" />

  @if (item.validation?.qty_error) {
  <mat-error>{{ item.validation.qty_error }}</mat-error>
  } @if (item.validation?.qty_warning) {
  <div class="field-warning">
    <mat-icon>info</mat-icon>
    {{ item.validation.qty_warning }}
    <br />
    <small>3-year average: {{ item.avg_usage | number }}</small>
  </div>
  }
</mat-form-field>

<!-- Price field with comparison -->
<mat-form-field>
  <mat-label>Unit Price</mat-label>
  <input matInput type="number" [(ngModel)]="item.unit_price" (ngModelChange)="validatePrice(item)" min="0.01" step="0.01" />

  @if (item.validation?.price_warning) {
  <div class="field-warning">
    <mat-icon>trending_up</mat-icon>
    Price {{ item.price_diff_percent }}% {{ item.price_diff_percent > 0 ? 'higher' : 'lower' }} than last price
    <br />
    <small>Last price: {{ item.last_price | number:'1.2-2' }} บาท</small>
  </div>
  }
</mat-form-field>
```

---

## Status Badge & Visual Indicators

### Status Badge Component

```typescript
@Component({
  selector: 'budget-request-status-badge',
  template: `
    <span class="status-badge" [class]="'status-badge--' + status().toLowerCase()">
      <mat-icon>{{ statusIcon() }}</mat-icon>
      {{ statusLabel() }}
    </span>
  `,
  styles: [
    `
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;

        &--draft {
          background: var(--ax-neutral-faint);
          color: var(--ax-neutral-default);
        }

        &--submitted {
          background: var(--ax-info-faint);
          color: var(--ax-info-default);
        }

        &--dept_approved {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-default);
        }

        &--finance_approved {
          background: var(--ax-success-faint);
          color: var(--ax-success-default);
        }

        &--rejected {
          background: var(--ax-error-faint);
          color: var(--ax-error-default);
        }
      }
    `,
  ],
})
export class BudgetRequestStatusBadgeComponent {
  @Input() status!: BudgetRequestStatus;

  statusLabel = computed(() => {
    const labels = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      DEPT_APPROVED: 'Dept Approved',
      FINANCE_APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };
    return labels[this.status()];
  });

  statusIcon = computed(() => {
    const icons = {
      DRAFT: 'edit',
      SUBMITTED: 'send',
      DEPT_APPROVED: 'check_circle_outline',
      FINANCE_APPROVED: 'check_circle',
      REJECTED: 'cancel',
    };
    return icons[this.status()];
  });
}
```

---

## Action Buttons & States

### Smart Action Bar

ปุ่มแสดงตาม status และ permission

```html
<div class="action-bar">
  <!-- DRAFT status actions -->
  @if (status() === 'DRAFT' && canEdit()) {
  <div class="action-group action-group--primary">
    <button mat-raised-button color="primary" (click)="submit()" [disabled]="hasUnsavedChanges() || !canSubmit()">
      <mat-icon>send</mat-icon>
      Submit for Approval
    </button>

    @if (hasUnsavedChanges()) {
    <button mat-flat-button color="accent" (click)="saveAll()">
      <mat-icon>save</mat-icon>
      Save Changes ({{ unsavedCount() }})
    </button>
    }
  </div>

  <div class="action-group action-group--secondary">
    <button mat-stroked-button (click)="initialize()">
      <mat-icon>auto_fix_high</mat-icon>
      Initialize
    </button>

    <button mat-stroked-button (click)="importExcel()">
      <mat-icon>upload_file</mat-icon>
      Import Excel
    </button>

    <button mat-stroked-button color="warn" (click)="delete()">
      <mat-icon>delete</mat-icon>
      Delete
    </button>
  </div>
  }

  <!-- SUBMITTED status actions (Dept Head) -->
  @if (status() === 'SUBMITTED' && canApproveDept()) {
  <div class="action-group action-group--approval">
    <button mat-raised-button color="accent" (click)="approveDepartment()">
      <mat-icon>check_circle</mat-icon>
      Approve (Department)
    </button>

    <button mat-stroked-button color="warn" (click)="reject()">
      <mat-icon>cancel</mat-icon>
      Reject
    </button>
  </div>

  <div class="action-group action-group--view">
    <button mat-stroked-button (click)="exportPDF()">
      <mat-icon>picture_as_pdf</mat-icon>
      Export PDF
    </button>
  </div>
  }

  <!-- DEPT_APPROVED status actions (Finance) -->
  @if (status() === 'DEPT_APPROVED' && canApproveFinance()) {
  <div class="action-group action-group--approval">
    <button mat-raised-button color="primary" (click)="approveFinance()">
      <mat-icon>verified</mat-icon>
      Final Approve (Finance)
    </button>

    <button mat-stroked-button color="warn" (click)="reject()">
      <mat-icon>cancel</mat-icon>
      Reject
    </button>
  </div>
  }

  <!-- REJECTED status actions -->
  @if (status() === 'REJECTED' && canReopen()) {
  <div class="action-group">
    <button mat-raised-button color="primary" (click)="reopen()">
      <mat-icon>refresh</mat-icon>
      Reopen and Edit
    </button>
  </div>
  }

  <!-- FINANCE_APPROVED status (read-only) -->
  @if (status() === 'FINANCE_APPROVED') {
  <div class="action-group">
    <button mat-stroked-button (click)="exportPDF()">
      <mat-icon>picture_as_pdf</mat-icon>
      Export PDF
    </button>

    <button mat-stroked-button (click)="print()">
      <mat-icon>print</mat-icon>
      Print
    </button>
  </div>
  }

  <!-- Common actions (all statuses) -->
  <div class="action-group action-group--common">
    <button mat-stroked-button (click)="goBack()">
      <mat-icon>arrow_back</mat-icon>
      Back to List
    </button>
  </div>
</div>
```

### Button Loading States

```html
<button mat-raised-button color="primary" (click)="submit()" [disabled]="submitting()">
  @if (submitting()) {
  <mat-spinner diameter="20"></mat-spinner>
  <span>Submitting...</span>
  } @else {
  <mat-icon>send</mat-icon>
  <span>Submit</span>
  }
</button>
```

---

## Toast Notifications

### Success Messages

```typescript
// After successful submit
this.snackBar
  .open('✅ Budget request submitted successfully!', 'View', {
    duration: 5000,
    panelClass: ['snackbar-success'],
    horizontalPosition: 'end',
    verticalPosition: 'top',
  })
  .onAction()
  .subscribe(() => {
    this.router.navigate(['/inventory/budget-requests', request.id]);
  });

// After successful approval
this.snackBar.open('✅ Budget request approved!', 'Close', {
  duration: 3000,
  panelClass: ['snackbar-success'],
});

// After save
this.snackBar.open('💾 Changes saved (12 items updated)', 'Close', {
  duration: 2000,
  panelClass: ['snackbar-info'],
});
```

### Error Messages

```typescript
// Validation error
this.snackBar
  .open('❌ Cannot submit: Please fix 3 validation errors', 'Show Details', {
    duration: 5000,
    panelClass: ['snackbar-error'],
  })
  .onAction()
  .subscribe(() => {
    this.showValidationErrors();
  });

// Permission error
this.snackBar.open('🔒 You do not have permission to approve this request', 'Close', {
  duration: 4000,
  panelClass: ['snackbar-error'],
});

// Budget exceeded
this.snackBar
  .open('⚠️ Insufficient budget: Need 2.5M but only 2M available', 'View Budget', {
    duration: 7000,
    panelClass: ['snackbar-warn'],
  })
  .onAction()
  .subscribe(() => {
    this.viewBudgetDashboard();
  });
```

### Warning Messages

```typescript
// Unsaved changes
this.snackBar
  .open('⚠️ You have 5 unsaved changes', 'Save Now', {
    duration: 0, // Don't auto-dismiss
    panelClass: ['snackbar-warn'],
  })
  .onAction()
  .subscribe(() => {
    this.saveAll();
  });

// Drug not in plan
this.snackBar.open('ℹ️ 3 drugs are not in budget plan - review before submit', 'View', {
  duration: 5000,
  panelClass: ['snackbar-info'],
});
```

---

## Confirmation Dialogs

### Reject Confirmation

```typescript
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: 'Reject Budget Request?',
    message: 'Are you sure you want to reject this budget request?',
    content: `
      <p>Request: <strong>${request.request_number}</strong></p>
      <p>Amount: <strong>${request.total_requested_amount.toLocaleString()} บาท</strong></p>
      <p>Created by: <strong>${request.created_by_name}</strong></p>
    `,
    requireReason: true,
    reasonLabel: 'Rejection Reason (required)',
    reasonPlaceholder: 'Please provide a clear reason for rejection...',
    confirmText: 'Reject',
    confirmColor: 'warn',
    cancelText: 'Cancel',
  },
});

dialogRef.afterClosed().subscribe((result) => {
  if (result?.confirmed) {
    this.budgetRequestService.reject(request.id, result.reason);
  }
});
```

### Delete Confirmation

```typescript
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: 'Delete Budget Request?',
    message: 'This action cannot be undone.',
    content: `
      <p>You are about to delete:</p>
      <ul>
        <li><strong>${request.request_number}</strong></li>
        <li>${request.items.length} items</li>
        <li>Total: ${request.total_requested_amount.toLocaleString()} บาท</li>
      </ul>
    `,
    confirmText: 'Delete',
    confirmColor: 'warn',
    cancelText: 'Cancel',
    requireConfirmationText: true,
    confirmationText: request.request_number,
  },
});
```

### Approve with Budget Warning

```typescript
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: 'Approve Budget Request',
    message: 'Please review budget impact before approving',
    content: `
      <div class="budget-impact-summary">
        <h4>⚠️ High Budget Utilization Warning</h4>
        <p>This approval will use <strong>83%</strong> of available budget</p>

        <table>
          <tr>
            <td>Available:</td>
            <td>3,000,000 บาท</td>
          </tr>
          <tr>
            <td>This Request:</td>
            <td>2,500,000 บาท</td>
          </tr>
          <tr class="total">
            <td>Remaining After:</td>
            <td>500,000 บาท (17%)</td>
          </tr>
        </table>

        <p class="warning">
          ⚠️ Only <strong>500K</strong> will remain for future requests this quarter
        </p>
      </div>
    `,
    requireCheckbox: true,
    checkboxLabel: 'I have reviewed the budget impact and approve this request',
    confirmText: 'Approve',
    confirmColor: 'primary',
    cancelText: 'Cancel',
  },
});
```

---

## Mobile Responsiveness

### Responsive Action Bar

```scss
.action-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;

    .action-group {
      flex-direction: column;
      width: 100%;

      button {
        width: 100%;
      }
    }
  }
}
```

### Responsive Tables

```html
<!-- Desktop: Full table -->
<table mat-table [dataSource]="items()" class="desktop-only">
  <ng-container matColumnDef="line_number">
    <th mat-header-cell *matHeaderCellDef>#</th>
    <td mat-cell *matCellDef="let item">{{ item.line_number }}</td>
  </ng-container>
  <!-- ... more columns -->
</table>

<!-- Mobile: Card layout -->
<div class="mobile-only">
  @for (item of items(); track item.id) {
  <mat-card class="item-card">
    <mat-card-header>
      <mat-card-title> #{{ item.line_number }} - {{ item.generic_name }} </mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div class="item-detail">
        <span class="label">Quantity:</span>
        <span class="value">{{ item.requested_qty | number }}</span>
      </div>
      <div class="item-detail">
        <span class="label">Unit Price:</span>
        <span class="value">{{ item.unit_price | number:'1.2-2' }}</span>
      </div>
      <div class="item-detail">
        <span class="label">Total:</span>
        <span class="value total">{{ item.requested_amount | number:'1.2-2' }}</span>
      </div>
    </mat-card-content>
  </mat-card>
  }
</div>
```

---

## Summary

### UX Improvements Checklist

✅ **Progress Indicator**

- Stepper showing current status
- Visual timeline of approvals
- Days waiting indicator

✅ **Pre-submission Checklist**

- Validation summary
- Warnings highlighted
- Budget impact shown
- Confirmation required

✅ **Inline Validation**

- Real-time field validation
- Character counters
- Warning messages
- Contextual hints

✅ **Visual Indicators**

- Color-coded status badges
- Icon-based states
- Progress bars for budget

✅ **Smart Action Buttons**

- Context-aware buttons
- Loading states
- Permission-based visibility

✅ **Notifications**

- Success toasts
- Error messages
- Warning alerts

✅ **Confirmations**

- Reject dialog with reason
- Delete confirmation
- Budget warning on approve

✅ **Responsive Design**

- Mobile-friendly layout
- Adaptive tables
- Touch-friendly buttons

### Next Steps

1. ✅ Implement progress stepper component
2. ✅ Create pre-submission checklist dialog
3. ✅ Add inline validation to all fields
4. ✅ Implement toast notification service
5. ⏭️ Read [06-INTEGRATION-SPEC.md](./06-INTEGRATION-SPEC.md) for integration details

---

[← Back to Index](./README.md) | [← Previous: Dashboard Spec](./04-DASHBOARD-SPEC.md) | [Next: Integration Spec →](./06-INTEGRATION-SPEC.md)
