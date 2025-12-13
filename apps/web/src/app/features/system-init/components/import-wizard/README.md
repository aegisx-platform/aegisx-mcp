# Import Wizard Dialog

A comprehensive 4-step wizard dialog for importing data through the System Initialization feature.

## Overview

The Import Wizard provides a guided, user-friendly interface for:
1. Downloading data templates
2. Uploading data files
3. Validating data before import
4. Executing and tracking imports

## Features

### Step 1: Download Template
- Download CSV or Excel templates
- View required field information
- Template includes correct column headers and format

### Step 2: Upload File
- **Drag & Drop** support for easy file selection
- File browser fallback
- Client-side validation:
  - File type: CSV, Excel (.csv, .xlsx, .xls)
  - File size: Maximum 10 MB
  - Maximum rows: 10,000
- Visual file information display
- Replace file functionality

### Step 3: Validation Results
- **Automatic validation** when entering step
- Clear display of:
  - Total rows, valid rows, error rows
  - Detailed error messages with row/field information
  - Warning messages (can proceed if warnings only)
- **Import Options Configuration**:
  - Skip warnings checkbox
  - Batch size selection (50/100/500/1000)
  - On conflict strategy (skip/update/error)
- Error state prevents proceeding

### Step 4: Confirm & Import
- Import summary with all details
- Warning about database changes
- **Real-time progress tracking**:
  - Progress percentage
  - Records imported count
  - Elapsed time
  - Estimated remaining time
- **Success/Failure states**:
  - Success: Shows import statistics, next steps
  - Failure: Shows error message, option to retry

## Usage

### Basic Usage

```typescript
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImportWizardDialog } from './components/import-wizard';
import type { ImportModule } from './types/system-init.types';

export class MyComponent {
  private dialog = inject(MatDialog);

  openImportWizard(module: ImportModule) {
    const dialogRef = this.dialog.open(ImportWizardDialog, {
      width: '800px',
      maxHeight: '90vh',
      data: { module },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        console.log('Import completed!', result.jobId);
        // Refresh data, show notification, etc.
      }
    });
  }
}
```

### Dialog Data

```typescript
export interface ImportWizardData {
  module: ImportModule; // The module to import data for
}
```

### Dialog Result

```typescript
export interface ImportWizardResult {
  success: boolean;  // True if import completed successfully
  jobId?: string;    // Job ID of the import (if started)
}
```

## API Dependencies

The wizard relies on two services:

### SystemInitService

```typescript
// Download template
downloadTemplate(moduleName: string, format: 'csv' | 'xlsx'): Observable<Blob>

// Validate uploaded file
validateFile(moduleName: string, file: File): Observable<ValidationResult>

// Start import job
importData(moduleName: string, sessionId: string, options: ImportOptions): Observable<ImportJobResponse>
```

### ImportProgressService

```typescript
// Track import progress (polls every 2 seconds)
trackProgress(moduleName: string, jobId: string): Observable<ImportStatus>

// Stop tracking
cancelTracking(moduleName: string, jobId: string): void
```

## State Management

All state is managed using Angular Signals:

### Primary State
- `currentStep: Signal<number>` - Current wizard step (1-4)
- `selectedFile: Signal<File | null>` - Uploaded file
- `validationResult: Signal<ValidationResult | null>` - Validation response
- `importOptions: Signal<ImportOptions>` - User-configured options
- `importStatus: Signal<ImportStatus | null>` - Real-time import progress

### Computed Signals
- `canProceedToNextStep()` - Navigation guard based on step requirements
- `fileInfo()` - File details with validation status
- `validationSummary()` - Parsed validation statistics
- `importProgress()` - Progress with time calculations

## Navigation Rules

### Step 1 → 2
- Always allowed

### Step 2 → 3
- Requires: Valid file selected
- Auto-triggers validation

### Step 3 → 4
- Requires: Validation passed (isValid or canProceed)
- Blocks if errors exist

### Step 4
- No next step
- Import starts on "Start Import" button
- Close button enabled after completion

### During Import
- All navigation disabled
- Close button shows confirmation dialog

## Styling

Comprehensive SCSS with:
- Material Design principles
- Responsive breakpoints
- Loading states
- Status indicators (success/warning/error)
- Animations (spinning icons)
- Step progression visual

### Key Classes
- `.import-wizard-dialog` - Root container
- `.dialog-header` - Header with title and close button
- `.module-info` - Module details display
- `.stepper-container` - Step progression indicator
- `.step-content` - Content area for each step
- `.drop-zone` - Drag & drop area

## Responsive Design

### Desktop (≥768px)
- Full 800px width
- All features visible
- Step labels shown

### Mobile (<768px)
- Adaptive width
- Step labels hidden (icons only)
- Stacked layouts

## Error Handling

### File Upload Errors
- Invalid file type → Snackbar notification
- File too large → Snackbar notification
- File selection cancellation → No action

### Validation Errors
- API error → Snackbar with error message
- Validation failed → Display errors, block proceed
- Network error → Retry option

### Import Errors
- Start import failed → Snackbar, stay on step
- Import job failed → Show error state, back button
- Progress tracking failed → Snackbar, maintain state

### All Errors
- Console logging for debugging
- User-friendly messages via MatSnackBar
- No silent failures

## Performance

### Optimizations
- OnPush change detection
- Computed signals for derived state
- Lazy template rendering (@if)
- Proper cleanup in ngOnDestroy
- Progress polling only when active

### Resource Management
- Cancel progress polling on dialog close
- Clean up file references
- Unsubscribe from observables
- Clear timeouts/intervals

## Accessibility

### Features
- Keyboard navigation support
- ARIA labels on buttons
- Focus management
- Screen reader friendly
- High contrast compatible

### ARIA Attributes
- Dialog role
- aria-label on icon buttons
- aria-describedby for help text

## Testing

### Unit Tests
Test each step independently:
- Step navigation logic
- File validation
- Import options updates
- Progress calculation

### Integration Tests
Test complete flows:
- Download → Upload → Validate → Import
- Error handling at each step
- Cancel/back navigation

### E2E Tests
Test user workflows:
- Complete successful import
- Handle validation errors
- Cancel during import

## Future Enhancements

### Planned Features
- [ ] Drag & drop for Excel files
- [ ] Preview data before import
- [ ] Edit data inline
- [ ] Bulk imports (multiple files)
- [ ] Schedule imports
- [ ] Import templates library
- [ ] Data mapping UI
- [ ] Duplicate detection preview

### Technical Improvements
- [ ] WebSocket for real-time updates (replace polling)
- [ ] Resume interrupted imports
- [ ] Client-side validation before upload
- [ ] Chunked file upload for large files
- [ ] Import history in dialog

## File Structure

```
import-wizard/
├── import-wizard.dialog.ts      # Main component logic
├── import-wizard.dialog.html    # Template (4 steps)
├── import-wizard.dialog.scss    # Comprehensive styling
├── import-wizard.example.ts     # Usage examples
├── index.ts                     # Exports
└── README.md                    # This file
```

## Related Components

- `module-card.component.ts` - Triggers the wizard
- `validation-results.component.ts` - Displays validation (placeholder)
- `progress-tracker.component.ts` - Shows import progress (placeholder)
- `import-history-timeline.component.ts` - Shows past imports

## Related Services

- `system-init.service.ts` - API calls
- `import-progress.service.ts` - Progress tracking

## Related Types

- `types/system-init.types.ts` - All TypeScript interfaces

## Support

For issues or questions:
1. Check the example file: `import-wizard.example.ts`
2. Review the specification: `docs/features/system-initialization/FRONTEND_SPECIFICATION.md`
3. Contact the development team

## License

Internal use only - AegisX Platform
