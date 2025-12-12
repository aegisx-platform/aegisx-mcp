# Pre-submission Checklist Dialog - Quick Start Guide

## 30-Second Overview

The Pre-submission Checklist Dialog validates budget requests before submission. It shows:

- Required fields check (✓ green)
- Budget items review (item count, total amount)
- Warnings if any (⚠️ orange)
- Errors if any (✗ red)
- Budget impact visualization (progress bar)
- Next steps information

## Import in Your Component

```typescript
import { PreSubmissionChecklistDialogComponent } from './dialogs/pre-submission-checklist/pre-submission-checklist.dialog';
import { MatDialog } from '@angular/material/dialog';

export class BudgetRequestsListComponent {
  constructor(private dialog: MatDialog) {}

  // ...
}
```

## Open the Dialog

```typescript
async openPreSubmissionDialog(requestId: number): Promise<void> {
  // Load the request data
  const request = await this.budgetRequestService.loadBudgetRequestById(requestId);
  if (!request) return;

  // Open dialog
  const dialogRef = this.dialog.open(PreSubmissionChecklistDialogComponent, {
    width: '700px',
    maxWidth: '90vw',
    data: {
      requestId,
      request
    }
  });

  // Handle result
  const result = await dialogRef.afterClosed().toPromise();

  if (result === 'submit') {
    await this.submitRequest(requestId);
  } else if (result === 'submit_anyway') {
    await this.submitRequest(requestId); // Same flow for warnings
  }
  // null = cancelled
}

private async submitRequest(requestId: number): Promise<void> {
  try {
    await this.budgetRequestService.submitBudgetRequest(requestId);
    this.snackBar.open('Submitted successfully', 'Close');
  } catch (error) {
    this.snackBar.open('Submission failed', 'Close');
  }
}
```

## Dialog Data Structure

```typescript
{
  requestId: 123,                    // Budget request ID
  request: {                         // Full BudgetRequest object
    id: 123,
    fiscal_year: 2568,
    department_id: 5,
    total_requested_amount: 2500000,
    justification: 'Need to purchase...',
    items: [
      {
        id: 1,
        drug_name: 'Paracetamol 500mg',
        quantity: 1000,
        q1_quantity: 250,
        q2_quantity: 250,
        q3_quantity: 250,
        q4_quantity: 250
      }
    ]
  }
}
```

## Dialog Return Values

| Value             | Meaning                                                |
| ----------------- | ------------------------------------------------------ |
| `'submit'`        | User confirmed and clicked "Submit for Approval"       |
| `'submit_anyway'` | User acknowledged warnings and clicked "Submit Anyway" |
| `null`            | User clicked Cancel                                    |

## Button Behavior

| Scenario                 | Cancel  | Submit Anyway   | Submit    |
| ------------------------ | ------- | --------------- | --------- |
| No errors, no warnings   | Enabled | Hidden          | Enabled\* |
| No errors, with warnings | Enabled | Enabled\*       | Enabled\* |
| With errors              | Enabled | Hidden          | Disabled  |
| Loading                  | Enabled | Hidden/Disabled | Disabled  |

\*Only if user checks the confirmation checkbox

## What It Displays

### Section 1: Required Information

- Fiscal Year
- Department ID
- Justification (character count)

### Section 2: Budget Request Items

- Total items count
- Total requested amount
- Quarterly distribution (Q1+Q2+Q3+Q4)

### Section 3: Warnings (if any)

- Non-blocking validation issues
- Drugs not in budget plan
- High budget utilization warnings

### Section 4: Errors (if any)

- Blocking validation issues
- Cannot submit until fixed

### Section 5: Budget Impact

- Budget Type name
- Allocated amount
- Already Used amount
- Reserved amount
- Available amount
- This Request amount
- Utilization percentage with color-coded progress bar
  - Green: < 50%
  - Orange: 50-80%
  - Red: > 80%

### Section 6: Next Steps

- Department Head will be notified
- Cannot edit after submission
- Approval takes 2-3 days

## Key Features

✓ **Automatic Validation** - Loads and displays validation results
✓ **Budget Visualization** - Color-coded progress bar
✓ **Graceful Loading** - Spinner while fetching data
✓ **Error Handling** - Shows errors without blocking
✓ **Smart Buttons** - Adaptive based on validation state
✓ **Responsive** - Works on mobile, tablet, desktop
✓ **Accessible** - WCAG AA compliant

## Common Integration Patterns

### Pattern 1: Simple Integration

```typescript
// In list component's submit button click handler
async handleSubmitClick(requestId: number): Promise<void> {
  const request = await this.loadRequest(requestId);
  const dialogRef = this.dialog.open(PreSubmissionChecklistDialogComponent, {
    data: { requestId, request }
  });

  const result = await dialogRef.afterClosed().toPromise();
  if (result) {
    await this.submitRequest(requestId);
  }
}
```

### Pattern 2: With Loading State

```typescript
async handleSubmitClick(requestId: number): Promise<void> {
  this.isLoading = true;
  try {
    const request = await this.loadRequest(requestId);
    const dialogRef = this.dialog.open(PreSubmissionChecklistDialogComponent, {
      disableClose: true,
      data: { requestId, request }
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      await this.submitRequest(requestId);
      this.successNotification();
    }
  } finally {
    this.isLoading = false;
  }
}
```

### Pattern 3: With Error Handling

```typescript
async handleSubmitClick(requestId: number): Promise<void> {
  try {
    const request = await this.loadRequest(requestId);
    if (!request) {
      this.errorNotification('Failed to load request');
      return;
    }

    const dialogRef = this.dialog.open(PreSubmissionChecklistDialogComponent, {
      data: { requestId, request }
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      const submitted = await this.submitRequest(requestId);
      if (submitted) {
        this.successNotification('Request submitted successfully');
        this.refreshList();
      } else {
        this.errorNotification('Submission failed');
      }
    }
  } catch (error) {
    this.errorNotification(error.message);
  }
}
```

## Styling & Customization

### Dialog Size Options

```typescript
// Desktop (default)
{ width: '700px', maxWidth: '90vw' }

// Larger
{ width: '800px', maxWidth: '95vw' }

// Smaller
{ width: '600px', maxWidth: '85vw' }
```

### Theme Customization

The component uses Material Design 3 CSS variables:

```scss
--mat-primary-color      // Primary blue
--mat-on-surface         // Text color
--mat-surface            // Background
--mat-divider-color      // Borders
```

## Troubleshooting

### Issue: Dialog won't open

**Solution:** Ensure MatDialogModule is imported/provided in your module

### Issue: Validation data not loading

**Solution:** Check that API endpoints are accessible:

- `POST /inventory/budget/budget-requests/:id/validate`
- `POST /inventory/budget/budget-requests/:id/check-budget-availability`
- `POST /inventory/budget/budget-requests/:id/check-drugs-in-plan`

### Issue: Submit button always disabled

**Solution:** Make sure user checks the confirmation checkbox and data has loaded

### Issue: Errors not displaying

**Solution:** Check browser console for API errors, ensure error response format matches

## API Response Format Expected

### Validation Response

```json
{
  "valid": false,
  "errors": [{ "field": "justification", "message": "Minimum 20 characters" }],
  "warnings": [{ "message": "Budget utilization > 80%" }],
  "info": []
}
```

### Budget Impact Response

```json
{
  "budgetTypeId": "OP001",
  "budgetTypeName": "ยาและเวชภัณฑ์",
  "allocated": 3000000,
  "used": 500000,
  "reserved": 0,
  "available": 2500000,
  "utilizationPercent": 83
}
```

### Drugs Plan Response

```json
{
  "drugsNotInPlan": [{ "id": "1", "name": "Paracetamol", "quantity": 100 }],
  "drugsInPlan": [{ "id": "2", "name": "Ibuprofen", "quantity": 200 }]
}
```

## Performance Notes

- Dialog lazy loads on component init
- Uses OnPush change detection (fast)
- Signals for reactive updates (efficient)
- Handles API errors gracefully
- Responsive image-less design (lightweight)

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 14+)
- Mobile: ✅ Responsive design

## Next: Integration Checklist

- [ ] Import component in parent module
- [ ] Add dialog trigger button
- [ ] Test with sample data
- [ ] Verify API endpoints work
- [ ] Add error handling
- [ ] Test on mobile
- [ ] Localize text strings
- [ ] Add analytics tracking
