# Pre-submission Checklist Dialog Component

## Overview

The Pre-submission Checklist Dialog is a comprehensive validation component that appears before a user submits a budget request. It performs multi-level validation and displays a detailed review of all submission requirements.

## Component Details

**File:** `pre-submission-checklist.dialog.ts`
**Template:** `pre-submission-checklist.dialog.html`
**Styles:** `pre-submission-checklist.dialog.scss`
**Selector:** `app-pre-submission-checklist-dialog`

## Features

### 1. Multi-Level Validation

- **Client-side validation** - Immediate feedback on required fields
- **Server-side validation** - Backend rules enforcement
- **Budget integration** - Checks budget availability and utilization
- **Drug plan validation** - Identifies drugs not in budget plan

### 2. Comprehensive Display Sections

#### Required Information Section

- Fiscal year verification
- Department confirmation
- Justification text (with character count)

#### Budget Request Items Section

- Total items count
- Total requested amount
- Quarterly distribution validation
- Status indicator (success/warning/error)

#### Warnings Section (conditional)

- Non-blocking issues that may occur
- Drugs not in budget plan listing
- Budget utilization warnings
- Uses AegisX Alert component with warning status

#### Errors Section (conditional)

- Blocking issues preventing submission
- Field-specific error messages
- Uses AegisX Alert component with danger status

#### Budget Impact Section

- Budget type information
- Allocated amount
- Already used amount
- Reserved amount
- Available amount
- Requested amount
- Visual progress bar showing utilization percentage
- Color-coded by utilization level (green < 50%, orange 50-80%, red > 80%)

#### Next Steps Information

- Step 1: Department Head notification
- Step 2: Edit restrictions after submission
- Step 3: Expected approval timeline

#### Confirmation Checkbox

- Required acknowledgment before submission
- Disabled if validation errors exist

### 3. Loading States

- Loading spinner during data fetching
- Error display with fallback messaging
- Graceful handling of API failures

### 4. Smart Button Control

- **Cancel Button** - Always available, closes dialog without action
- **Submit Anyway Button** - Only shows if warnings exist (no errors)
- **Submit for Approval Button** - Primary action, only enabled when:
  - No validation errors exist
  - User has confirmed acknowledgment
  - Data has finished loading

## Dialog Data Input

```typescript
interface PreSubmissionChecklistData {
  requestId: number; // Budget request ID to validate
  request: BudgetRequest; // Full budget request object
}
```

## Dialog Return Values

The dialog returns different values based on user action:

```typescript
// User cancels
null;

// User submits despite warnings
('submit_anyway');

// User submits normally
('submit');
```

## API Integration

The component calls three main API endpoints:

### 1. Validation Endpoint

```
POST /inventory/budget/budget-requests/:id/validate
```

Returns comprehensive validation results with errors, warnings, and info messages.

### 2. Budget Availability Endpoint

```
POST /inventory/budget/budget-requests/:id/check-budget-availability
```

Returns budget impact including:

- Allocated budget
- Used amount
- Reserved amount
- Available amount
- Utilization percentage

### 3. Drugs Plan Check Endpoint

```
POST /inventory/budget/budget-requests/:id/check-drugs-in-plan
```

Returns array of drugs and their plan status.

## How to Use

### Opening the Dialog

```typescript
import { MatDialog } from '@angular/material/dialog';
import { PreSubmissionChecklistDialogComponent } from './path/to/dialog';

export class BudgetRequestListComponent {
  constructor(private dialog: MatDialog) {}

  openPreSubmissionDialog(requestId: number, request: BudgetRequest): void {
    const dialogRef = this.dialog.open(PreSubmissionChecklistDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: {
        requestId,
        request,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'submit') {
        this.submitRequest(requestId);
      } else if (result === 'submit_anyway') {
        this.submitRequestAnyway(requestId);
      }
      // result === null means user cancelled
    });
  }

  private async submitRequest(requestId: number): Promise<void> {
    try {
      await this.budgetRequestService.submitBudgetRequest(requestId);
      // Show success message
    } catch (error) {
      // Handle submission error
    }
  }

  private async submitRequestAnyway(requestId: number): Promise<void> {
    try {
      await this.budgetRequestService.submitBudgetRequest(requestId);
      // Show success message with warning acknowledgment
    } catch (error) {
      // Handle submission error
    }
  }
}
```

## Styling & Theming

### Material Design Integration

- Uses Material Design 3 theming variables
- Color system:
  - Primary: #1976d2 (blue) for main actions
  - Success: #4caf50 (green) for valid items
  - Warning: #ff9800 (orange) for warnings
  - Error: #f44336 (red) for errors

### Responsive Design

- Desktop: 500-700px width, scrollable content area
- Tablet: Adjusts to screen constraints
- Mobile: Full width (300px minimum), buttons stack vertically

### CSS Features

- Custom progress bar styling
- Color-coded status icons
- Smooth animations and transitions
- Proper spacing and typography hierarchy
- Dark mode support via CSS variables

## Component Signals (Reactive State Management)

```typescript
// UI State
isConfirmed: Signal<boolean>; // User confirmation checkbox
isLoading: Signal<boolean>; // Loading state
loadingError: Signal<string | null>; // Error message

// Data
validationResult: Signal<ValidationResult | null>;
budgetImpact: Signal<BudgetImpact | null>;
drugsInPlan: Signal<DrugsInPlanResult | null>;
quarterlyDistribution: Signal<QuarterlyDistribution | null>;
```

## Computed Properties

```typescript
hasErrors: boolean; // Has validation errors
hasWarnings: boolean; // Has warnings (non-blocking)
isValidationPassed: boolean; // Validation succeeded
budgetUtilizationPercent: number; // Budget usage percentage
budgetUtilizationColor: string; // Progress bar color
quarterlyValid: boolean; // Q1+Q2+Q3+Q4 = Total
submitButtonDisabled: boolean; // Submit button disabled state
submitAnyWayButtonDisabled: boolean; // Submit anyway disabled state
```

## Type Definitions

```typescript
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
```

## Validation Rules Enforced

From the backend validation service:

1. **Justification** - Minimum 20 characters required
2. **Items** - At least 1 item required
3. **Quarterly Distribution** - Q1+Q2+Q3+Q4 must equal total
4. **Fiscal Year** - Valid year (2560+)
5. **Budget Availability** - Warning if utilization > 80%
6. **Drugs in Plan** - Warning if drugs not in budget plan

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color + icons for status indication (not color alone)
- Proper contrast ratios (WCAG AA compliant)
- Loading state announced to screen readers

## Performance Optimizations

- OnPush change detection strategy
- Lazy signal evaluation
- Async operations handled gracefully
- Loading spinner prevents race conditions
- Optimistic error handling doesn't block UI

## Error Handling

The component handles errors gracefully:

1. **API Failure** - Shows error message, doesn't block submission
2. **Missing Data** - Displays "unavailable" message for missing sections
3. **Network Error** - Catches and displays user-friendly error
4. **Timeout** - Uses reasonable defaults and continues

## Material Components Used

- `MatDialogModule` - Dialog container
- `MatDialogTitle` - Title section
- `MatDialogContent` - Scrollable content area
- `MatDialogActions` - Action buttons
- `MatButtonModule` - All buttons
- `MatCheckboxModule` - Confirmation checkbox
- `MatListModule` - Item listings
- `MatIconModule` - Icons for status/actions
- `MatProgressBarModule` - Budget utilization bar
- `MatDividerModule` - Visual separators

## AegisX Components Used

- `AxAlertComponent` - Error/Warning alerts with status styling

## Next Steps After Implementation

1. **Hook to List Component** - Add method to open dialog from list
2. **Error Handling** - Implement proper error toasts in parent component
3. **API Integration** - Verify all three endpoints return expected data
4. **Testing** - Create unit/e2e tests for validation scenarios
5. **Analytics** - Track submission attempts and warning acknowledgments
6. **Localization** - Translate all text labels to Thai/other languages

## Related Features

- Budget Request List Component
- Budget Request Service
- Budget Request Validation Service
- Budget Request Permission Service

## Example Complete Integration

```typescript
// In budget-requests-list.component.ts
async openPreSubmissionAndSubmit(requestId: number): Promise<void> {
  const request = await this.budgetRequestService.loadBudgetRequestById(requestId);
  if (!request) return;

  const dialogRef = this.dialog.open(
    PreSubmissionChecklistDialogComponent,
    {
      width: '700px',
      data: { requestId, request }
    }
  );

  const result = await dialogRef.afterClosed().toPromise();

  if (result === 'submit' || result === 'submit_anyway') {
    try {
      await this.budgetRequestService.submitBudgetRequest(requestId);
      this.snackBar.open(
        'Budget request submitted successfully',
        'Close',
        { duration: 5000, panelClass: ['snackbar-success'] }
      );
      // Reload list
      await this.budgetRequestService.loadBudgetRequestList();
    } catch (error: any) {
      this.snackBar.open(
        error.error?.message || 'Failed to submit budget request',
        'Close',
        { duration: 5000, panelClass: ['snackbar-error'] }
      );
    }
  }
}
```
