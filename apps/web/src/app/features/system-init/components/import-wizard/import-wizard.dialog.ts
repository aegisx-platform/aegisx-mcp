import { Component, Inject, signal, computed, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { firstValueFrom } from 'rxjs';
import { SystemInitService, ImportProgressService } from '../../services';
import type {
  ImportModule,
  ValidationResult,
  ImportOptions,
  ImportJobResponse,
  ImportStatus
} from '../../types/system-init.types';

export interface ImportWizardData {
  module: ImportModule;
}

export interface ImportWizardResult {
  success: boolean;
  jobId?: string;
}

@Component({
  selector: 'app-import-wizard-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatStepperModule
  ],
  templateUrl: './import-wizard.dialog.html',
  styleUrls: ['./import-wizard.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportWizardDialog implements OnDestroy {
  // Wizard state
  currentStep = signal(1);
  readonly totalSteps = 4;

  // Upload state
  selectedFile = signal<File | null>(null);
  uploadProgress = signal(0);
  isDragging = signal(false);

  // Validation state
  validationResult = signal<ValidationResult | null>(null);
  isValidating = signal(false);

  // Import state
  sessionId = signal<string | null>(null);
  importOptions = signal<ImportOptions>({
    skipWarnings: false,
    batchSize: 100,
    onConflict: 'skip'
  });

  // Import job state
  importJob = signal<ImportJobResponse | null>(null);
  importStatus = signal<ImportStatus | null>(null);
  isImporting = signal(false);

  // Computed values
  canProceedToNextStep = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return true; // Can always proceed from template download
      case 2:
        return this.selectedFile() !== null;
      case 3:
        const result = this.validationResult();
        return result !== null && (result.isValid || result.canProceed);
      case 4:
        return false; // Final step, no next
      default:
        return false;
    }
  });

  canNavigate = computed(() => !this.isImporting());

  fileInfo = computed(() => {
    const file = this.selectedFile();
    if (!file) return null;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10 MB
    const isValidType = file.name.endsWith('.csv') ||
                       file.name.endsWith('.xlsx') ||
                       file.name.endsWith('.xls');

    return {
      name: file.name,
      size: sizeInMB,
      isValidSize,
      isValidType,
      isValid: isValidSize && isValidType
    };
  });

  validationSummary = computed(() => {
    const result = this.validationResult();
    if (!result) return null;

    return {
      isValid: result.isValid,
      canProceed: result.canProceed,
      totalRows: result.stats.totalRows,
      validRows: result.stats.validRows,
      errorRows: result.stats.errorRows,
      errorCount: result.errors.length,
      warningCount: result.warnings.length
    };
  });

  importSummary = computed(() => {
    const result = this.validationResult();
    const options = this.importOptions();

    if (!result) return null;

    return {
      module: this.data.module.displayName,
      file: this.selectedFile()?.name || '',
      recordsToImport: result.stats.validRows,
      skipWarnings: options.skipWarnings,
      batchSize: options.batchSize,
      onConflict: options.onConflict
    };
  });

  importProgress = computed(() => {
    const status = this.importStatus();
    if (!status) return null;

    const { progress } = status;
    const elapsedTime = status.startedAt
      ? Math.floor((new Date().getTime() - new Date(status.startedAt).getTime()) / 1000)
      : 0;

    const estimatedRemaining = progress.percentComplete > 0
      ? Math.floor((elapsedTime / progress.percentComplete) * (100 - progress.percentComplete))
      : 0;

    return {
      ...progress,
      elapsedTime,
      estimatedRemaining,
      isComplete: status.status === 'completed',
      isFailed: status.status === 'failed',
      error: status.error
    };
  });

  // Batch size options
  readonly batchSizeOptions = [50, 100, 500, 1000];

  // On conflict options
  readonly onConflictOptions = [
    { value: 'skip', label: 'Skip (ignore existing records)' },
    { value: 'update', label: 'Update (overwrite existing records)' },
    { value: 'error', label: 'Error (fail if duplicate found)' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ImportWizardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ImportWizardData,
    private systemInitService: SystemInitService,
    private importProgressService: ImportProgressService,
    private snackBar: MatSnackBar
  ) {}

  ngOnDestroy() {
    // Clean up progress tracking
    const job = this.importJob();
    if (job) {
      this.importProgressService.cancelTracking(this.data.module.module, job.jobId);
    }
  }

  // ===== STEP 1: Download Template =====

  async downloadTemplate(format: 'csv' | 'xlsx') {
    try {
      const blob = await firstValueFrom(
        this.systemInitService.downloadTemplate(this.data.module.module, format)
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.data.module.module}_template.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.snackBar.open('Template downloaded successfully', 'Close', { duration: 3000 });
    } catch (err: any) {
      console.error('Failed to download template:', err);
      this.snackBar.open(
        err.error?.message || 'Failed to download template',
        'Close',
        { duration: 5000 }
      );
    }
  }

  // ===== STEP 2: Upload File =====

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFileSelection(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  private handleFileSelection(file: File) {
    // Validate file type
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
      this.snackBar.open(
        'Invalid file type. Please upload CSV or Excel file.',
        'Close',
        { duration: 5000 }
      );
      return;
    }

    // Validate file size (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.snackBar.open(
        'File size exceeds 10 MB limit.',
        'Close',
        { duration: 5000 }
      );
      return;
    }

    this.selectedFile.set(file);
    this.snackBar.open('File selected successfully', 'Close', { duration: 2000 });
  }

  removeFile() {
    this.selectedFile.set(null);
    this.validationResult.set(null);
    this.sessionId.set(null);
  }

  // ===== STEP 3: Validate File =====

  async validateFile() {
    const file = this.selectedFile();
    if (!file) return;

    this.isValidating.set(true);

    try {
      const result = await firstValueFrom(
        this.systemInitService.validateFile(this.data.module.module, file)
      );

      this.validationResult.set(result);
      this.sessionId.set(result.sessionId);

      if (result.isValid) {
        this.snackBar.open('Validation passed!', 'Close', { duration: 3000 });
      } else if (result.canProceed) {
        this.snackBar.open(
          'Validation completed with warnings',
          'Close',
          { duration: 3000 }
        );
      } else {
        this.snackBar.open(
          'Validation failed. Please fix errors and try again.',
          'Close',
          { duration: 5000 }
        );
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      this.snackBar.open(
        err.error?.message || 'Validation failed',
        'Close',
        { duration: 5000 }
      );
    } finally {
      this.isValidating.set(false);
    }
  }

  updateImportOption(key: keyof ImportOptions, value: any) {
    this.importOptions.update(opts => ({
      ...opts,
      [key]: value
    }));
  }

  // ===== STEP 4: Confirm & Import =====

  async startImport() {
    const sessionId = this.sessionId();
    if (!sessionId) {
      this.snackBar.open('No validation session found', 'Close', { duration: 5000 });
      return;
    }

    this.isImporting.set(true);

    try {
      // Start import
      const jobResponse = await firstValueFrom(
        this.systemInitService.importData(
          this.data.module.module,
          sessionId,
          this.importOptions()
        )
      );

      this.importJob.set(jobResponse);

      this.snackBar.open('Import started successfully', 'Close', { duration: 3000 });

      // Track progress
      this.importProgressService
        .trackProgress(this.data.module.module, jobResponse.jobId)
        .subscribe({
          next: (status) => {
            this.importStatus.set(status);

            if (status.status === 'completed') {
              this.snackBar.open(
                'Import completed successfully!',
                'Close',
                { duration: 5000 }
              );
              this.isImporting.set(false);
            } else if (status.status === 'failed') {
              this.snackBar.open(
                `Import failed: ${status.error || 'Unknown error'}`,
                'Close',
                { duration: 5000 }
              );
              this.isImporting.set(false);
            }
          },
          error: (err) => {
            console.error('Failed to track import progress:', err);
            this.snackBar.open(
              'Failed to track import progress',
              'Close',
              { duration: 5000 }
            );
            this.isImporting.set(false);
          }
        });
    } catch (err: any) {
      console.error('Failed to start import:', err);
      this.snackBar.open(
        err.error?.message || 'Failed to start import',
        'Close',
        { duration: 5000 }
      );
      this.isImporting.set(false);
    }
  }

  // ===== Navigation =====

  nextStep() {
    if (!this.canProceedToNextStep() || !this.canNavigate()) return;

    // Auto-validate when moving from step 2 to step 3
    if (this.currentStep() === 2 && !this.validationResult()) {
      this.validateFile();
    }

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  previousStep() {
    if (!this.canNavigate()) return;

    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  close(success: boolean = false) {
    // Check if import is in progress
    if (this.isImporting()) {
      const confirmed = confirm(
        'Import is in progress. Are you sure you want to close? This will not cancel the import.'
      );
      if (!confirmed) return;
    }

    const result: ImportWizardResult = {
      success,
      jobId: this.importJob()?.jobId
    };
    this.dialogRef.close(result);
  }

  // ===== Helper Methods =====

  getStepTitle(): string {
    switch (this.currentStep()) {
      case 1: return 'Download Template';
      case 2: return 'Upload File';
      case 3: return 'Validation Results';
      case 4: return 'Confirm & Import';
      default: return '';
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}
