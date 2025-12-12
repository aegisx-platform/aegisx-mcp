# Pre-submission Checklist Dialog - Integration Checklist

## Pre-Integration Requirements

- [ ] Component files are in place
  - [ ] `pre-submission-checklist.dialog.ts` exists
  - [ ] `pre-submission-checklist.dialog.html` exists
  - [ ] `pre-submission-checklist.dialog.scss` exists

- [ ] Project builds successfully
  - [ ] `pnpm run build` passes without errors
  - [ ] No TypeScript compilation errors
  - [ ] No template syntax errors

- [ ] Dependencies available
  - [ ] Angular Material 20+ installed
  - [ ] AegisX UI library available
  - [ ] HttpClient available in project

---

## Step 1: Import Component in Parent Module/Component

### Option A: Standalone Component (Recommended)

**In your list component:**

```typescript
import { PreSubmissionChecklistDialogComponent } from './dialogs/pre-submission-checklist/pre-submission-checklist.dialog';

@Component({
  selector: 'app-budget-requests-list',
  standalone: true,
  imports: [
    // ... other imports
    PreSubmissionChecklistDialogComponent,
  ],
})
export class BudgetRequestsListComponent {
  // ...
}
```

- [ ] Import added to component
- [ ] Component added to imports array

### Option B: Module-based

**In your feature module:**

```typescript
import { PreSubmissionChecklistDialogComponent } from './dialogs/pre-submission-checklist/pre-submission-checklist.dialog';

@NgModule({
  declarations: [],
  imports: [
    // ... other imports
    PreSubmissionChecklistDialogComponent,
  ],
})
export class BudgetRequestsModule {}
```

- [ ] Import added to module
- [ ] Component added to imports/declarations

---

## Step 2: Ensure MatDialog is Available

### Check: MatDialogModule Provider

```typescript
// In your component or module
import { MatDialogModule } from '@angular/material/dialog';

// Either in component:
@Component({
  imports: [MatDialogModule]
})

// Or in module:
@NgModule({
  imports: [MatDialogModule]
})
```

- [ ] MatDialogModule imported
- [ ] MatDialog injectable in component

---

## Step 3: Inject Required Services

### In your parent component:

```typescript
import { MatDialog } from '@angular/material/dialog';
import { BudgetRequestService } from '../services/budget-requests.service';

export class BudgetRequestsListComponent {
  constructor(
    private dialog: MatDialog,
    private budgetRequestService: BudgetRequestService,
  ) {}
}
```

- [ ] MatDialog injected
- [ ] BudgetRequestService injected
- [ ] HttpClient available (for API calls)

---

## Step 4: Create Dialog Trigger Method

### Add method to your component:

```typescript
async openPreSubmissionDialog(requestId: number): Promise<void> {
  try {
    // Load the request data
    const request = await this.budgetRequestService.loadBudgetRequestById(requestId);

    if (!request) {
      console.error('Failed to load budget request');
      return;
    }

    // Open the dialog
    const dialogRef = this.dialog.open(PreSubmissionChecklistDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: {
        requestId,
        request
      }
    });

    // Handle the result
    const result = await dialogRef.afterClosed().toPromise();

    if (result === 'submit' || result === 'submit_anyway') {
      await this.submitRequest(requestId);
    }
    // If result === null, user cancelled

  } catch (error) {
    console.error('Error in pre-submission dialog:', error);
    // Handle error appropriately
  }
}

private async submitRequest(requestId: number): Promise<void> {
  try {
    const response = await this.budgetRequestService.submitBudgetRequest(requestId);

    // Show success message
    this.showSuccessMessage('Budget request submitted successfully');

    // Reload the list
    await this.budgetRequestService.loadBudgetRequestList();

  } catch (error: any) {
    // Show error message
    this.showErrorMessage(
      error?.error?.message || 'Failed to submit budget request'
    );
  }
}

private showSuccessMessage(message: string): void {
  // Use your notification system (snackbar, toast, etc.)
  // Example: this.snackBar.open(message, 'Close', { duration: 5000 });
}

private showErrorMessage(message: string): void {
  // Use your notification system
  // Example: this.snackBar.open(message, 'Close', { duration: 5000 });
}
```

- [ ] Method created in component
- [ ] Dialog data passed correctly
- [ ] Result handling implemented
- [ ] Submit method implemented
- [ ] Notification methods implemented

---

## Step 5: Add Dialog Trigger Button

### In your list/detail component template:

```html
<!-- Add to your submit button -->
<button mat-raised-button color="primary" (click)="openPreSubmissionDialog(request.id)" [disabled]="request.status !== 'DRAFT'">
  <mat-icon>send</mat-icon>
  Submit for Approval
</button>

<!-- Or as a separate button -->
<button mat-icon-button matTooltip="Submit this budget request" (click)="openPreSubmissionDialog(request.id)" [disabled]="request.status !== 'DRAFT'">
  <mat-icon>send</mat-icon>
</button>
```

- [ ] Button template added
- [ ] Event handler connected to method
- [ ] Button properly disabled for non-DRAFT status
- [ ] Icon and label appropriate

---

## Step 6: Verify API Endpoints

### Check backend API endpoints:

**Endpoint 1: Validation**

```
POST /inventory/budget/budget-requests/:id/validate
Response: { valid, errors[], warnings[], info[] }
```

- [ ] Endpoint implemented
- [ ] Response format matches ValidationResult interface
- [ ] Error handling works

**Endpoint 2: Budget Availability**

```
POST /inventory/budget/budget-requests/:id/check-budget-availability
Response: { budgetTypeId, budgetTypeName, allocated, used, reserved, available, utilizationPercent }
```

- [ ] Endpoint implemented
- [ ] Response format matches BudgetImpact interface
- [ ] Calculations correct

**Endpoint 3: Drugs in Plan**

```
POST /inventory/budget/budget-requests/:id/check-drugs-in-plan
Request: { drug_ids[] }
Response: { drugsNotInPlan[], drugsInPlan[] }
```

- [ ] Endpoint implemented
- [ ] Request format correct
- [ ] Response format matches DrugsInPlanResult interface

---

## Step 7: Add Error Handling & Notifications

### Install Snackbar/Toast (if not already available)

```typescript
// In your component
import { MatSnackBar } from '@angular/material/snack-bar';

constructor(
  private snackBar: MatSnackBar,
  // ... other injections
) {}

private showSuccessMessage(message: string): void {
  this.snackBar.open(message, 'Close', {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
    panelClass: ['snackbar-success']
  });
}

private showErrorMessage(message: string): void {
  this.snackBar.open(message, 'Close', {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'bottom',
    panelClass: ['snackbar-error']
  });
}
```

- [ ] Snackbar/Toast service imported
- [ ] Success notification method implemented
- [ ] Error notification method implemented
- [ ] Styling classes defined (if using custom styles)

---

## Step 8: Test All Scenarios

### Scenario 1: No Errors, No Warnings

- [ ] Dialog opens
- [ ] All sections display with green checkmarks
- [ ] Submit button becomes enabled after checkbox
- [ ] Submit Anyway button is hidden
- [ ] Submission succeeds

### Scenario 2: With Warnings Only

- [ ] Dialog opens
- [ ] Warnings section displays in orange
- [ ] Both Submit and Submit Anyway buttons available
- [ ] Both require checkbox confirmation
- [ ] Submission succeeds with either button

### Scenario 3: With Errors

- [ ] Dialog opens
- [ ] Errors section displays in red
- [ ] Submit buttons disabled
- [ ] Confirmation checkbox disabled
- [ ] User cannot submit

### Scenario 4: Loading State

- [ ] Spinner displays
- [ ] All buttons disabled
- [ ] Cancel button remains enabled
- [ ] Data loads and displays

### Scenario 5: API Failure

- [ ] Error message displays
- [ ] Dialog doesn't crash
- [ ] Cancel button works
- [ ] Appropriate error notification shown

### Scenario 6: Mobile Responsive

- [ ] Dialog is full-width on mobile
- [ ] Buttons stack vertically
- [ ] Content scrolls properly
- [ ] All sections visible

- [ ] All scenarios tested and working

---

## Step 9: Localization (Optional but Recommended)

### Update text strings for Thai language

**In component:**

```typescript
// Add property or use i18n service
budgetRequestTexts = {
  title: 'พร้อมที่จะส่งใช่หรือไม่',
  intro: 'โปรดตรวจสอบทุกส่วนก่อนส่ง',
  requiredInfo: 'ข้อมูลที่จำเป็น',
  // ... etc
};
```

**In template:**

```html
<h1 mat-dialog-title>
  <mat-icon>checklist</mat-icon>
  {{ budgetRequestTexts.title }}
</h1>
```

- [ ] All text strings extracted
- [ ] Thai translations added
- [ ] Layout works with Thai text
- [ ] Font supports Thai characters

---

## Step 10: Add Analytics (Optional)

### Track user interactions

```typescript
// Import analytics service
import { AnalyticsService } from '../../../services/analytics.service';

// In component
constructor(private analytics: AnalyticsService) {}

// Track dialog open
openPreSubmissionDialog(requestId: number): void {
  this.analytics.track('budget_request_submission_dialog_open', {
    requestId,
    timestamp: new Date()
  });
  // ... rest of method
}

// Track submission
private async submitRequest(requestId: number): Promise<void> {
  this.analytics.track('budget_request_submitted', {
    requestId,
    timestamp: new Date()
  });
  // ... rest of method
}
```

- [ ] Analytics service imported
- [ ] Dialog open event tracked
- [ ] Submission event tracked
- [ ] Warning acknowledgments tracked (optional)

---

## Step 11: Documentation & Handoff

### Documentation files to review:

- [ ] README.md - Read full feature documentation
- [ ] QUICK-START.md - Review quick reference
- [ ] Component code - Review TypeScript implementation
- [ ] Template code - Review HTML structure
- [ ] Styles - Review SCSS styling

### Team documentation:

- [ ] Update project README with feature reference
- [ ] Add to feature documentation
- [ ] Update API documentation
- [ ] Add to team wiki/confluence
- [ ] Create training materials if needed

---

## Final Verification Checklist

### Code Quality

- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] No unused imports
- [ ] Proper error handling throughout
- [ ] Code follows project patterns

### Functionality

- [ ] Dialog opens correctly
- [ ] All API calls work
- [ ] Validation displays correctly
- [ ] Buttons respond to state changes
- [ ] Submission works end-to-end

### User Experience

- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Button states obvious
- [ ] Mobile responsive
- [ ] Keyboard navigation works

### Performance

- [ ] Dialog opens quickly (< 200ms)
- [ ] No memory leaks
- [ ] API calls optimized
- [ ] No unnecessary re-renders
- [ ] Bundle size acceptable

### Accessibility

- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] Color not sole indicator
- [ ] Contrast ratios sufficient
- [ ] ARIA labels present

### Documentation

- [ ] Code comments clear
- [ ] README complete
- [ ] Quick start guide provided
- [ ] Examples included
- [ ] Integration guide clear

---

## Deployment Readiness

- [ ] All tests passing
- [ ] Build succeeds without errors
- [ ] No merge conflicts
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Team notified
- [ ] Ready for production

---

## Post-Deployment

### Monitor for issues:

- [ ] Check error logs for API failures
- [ ] Monitor API response times
- [ ] Verify user submissions successful
- [ ] Gather user feedback
- [ ] Track analytics metrics

### Follow-up tasks:

- [ ] Optimize performance if needed
- [ ] Update documentation based on feedback
- [ ] Plan next features
- [ ] Schedule team training
- [ ] Archive documentation

---

## Rollback Plan (if needed)

If issues occur after deployment:

1. [ ] Revert component files to previous version
2. [ ] Revert API endpoints if modified
3. [ ] Clear browser cache
4. [ ] Run tests to verify rollback
5. [ ] Notify team and users
6. [ ] Investigate root cause
7. [ ] Plan fix and re-deploy

---

## Sign-Off

- Completed By: ********\_********
- Date: ********\_********
- Reviewed By: ********\_********
- Date: ********\_********

---

## Notes

```
Additional notes, issues, or follow-up items:

_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________
```

---

**Integration Checklist Complete!**

For questions or issues, refer to:

- README.md - Comprehensive documentation
- QUICK-START.md - Quick reference guide
- Component source code - Implementation details
