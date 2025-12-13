/**
 * Example: How to use the Import Wizard Dialog
 *
 * This example shows how to open the Import Wizard dialog from a component
 */

import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ImportWizardDialog,
  ImportWizardData,
  ImportWizardResult,
} from './import-wizard.dialog';
import type { ImportModule } from '../../types/system-init.types';

@Component({
  selector: 'app-example-usage',
  template: `
    <button mat-raised-button color="primary" (click)="openImportWizard()">
      Open Import Wizard
    </button>
  `,
})
export class ExampleUsageComponent {
  private dialog = inject(MatDialog);

  // Example module data
  private exampleModule: ImportModule = {
    module: 'departments',
    domain: 'inventory',
    subdomain: 'master-data',
    displayName: 'Departments',
    displayNameThai: 'แผนก',
    dependencies: [],
    priority: 1,
    importStatus: 'not_started',
    recordCount: 0,
    tags: [],
    supportsRollback: false,
    version: '1.0.0',
  };

  openImportWizard() {
    const dialogRef = this.dialog.open<
      ImportWizardDialog,
      ImportWizardData,
      ImportWizardResult
    >(ImportWizardDialog, {
      width: '800px',
      maxHeight: '90vh',
      data: { module: this.exampleModule },
      disableClose: true, // Prevent accidental close during import
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        console.log('Import completed successfully!', result.jobId);
        // Refresh data, show success message, etc.
      } else {
        console.log('Import was cancelled or failed');
      }
    });
  }
}

/**
 * Integration Example: Using in System Init Dashboard
 *
 * This shows how the dialog integrates with the main dashboard page
 */

/*
// In system-init-dashboard.page.ts

import { ImportWizardDialog } from '../../components/import-wizard';

export class SystemInitDashboardPage {
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
        this.snackBar.open('Import completed successfully!', 'Close', {
          duration: 5000
        });
        this.loadDashboard(); // Refresh dashboard data
      }
    });
  }
}
*/

/**
 * Dialog Flow:
 *
 * Step 1: Download Template
 * - User can download CSV or Excel template
 * - Shows required fields information
 * - Always can proceed to next step
 *
 * Step 2: Upload File
 * - Drag & drop or file browser
 * - Client-side validation (size, type)
 * - Must select valid file to proceed
 *
 * Step 3: Validation Results
 * - Auto-validates file when entering step
 * - Shows errors/warnings
 * - Configure import options
 * - Can only proceed if validation passes
 *
 * Step 4: Confirm & Import
 * - Shows summary
 * - Starts import job
 * - Real-time progress tracking
 * - Shows final results
 */

/**
 * API Integration:
 *
 * The dialog uses SystemInitService and ImportProgressService:
 *
 * 1. downloadTemplate(moduleName, format) -> Blob
 * 2. validateFile(moduleName, file) -> ValidationResult
 * 3. importData(moduleName, sessionId, options) -> ImportJobResponse
 * 4. getImportStatus(moduleName, jobId) -> ImportStatus (polled every 2s)
 */

/**
 * State Management:
 *
 * All state is managed with Angular Signals:
 * - currentStep: Current wizard step (1-4)
 * - selectedFile: Uploaded file
 * - validationResult: Validation response
 * - importOptions: User-selected options
 * - importStatus: Real-time import progress
 *
 * Computed signals for derived state:
 * - canProceedToNextStep: Navigation guard
 * - fileInfo: File details with validation
 * - validationSummary: Parsed validation stats
 * - importProgress: Progress with time estimates
 */

/**
 * Error Handling:
 *
 * - All async operations wrapped in try/catch
 * - User-friendly error messages via MatSnackBar
 * - Failed validations prevent proceeding
 * - Import errors shown in final step
 * - Console logging for debugging
 */

/**
 * UX Features:
 *
 * - Step indicator shows progress
 * - Drag & drop for file upload
 * - Real-time validation
 * - Progress tracking with time estimates
 * - Prevent navigation during import
 * - Confirmation before closing during import
 * - Responsive design
 * - Loading states throughout
 */
