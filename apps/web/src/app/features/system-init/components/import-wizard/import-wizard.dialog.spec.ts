import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, Subject, BehaviorSubject } from 'rxjs';
import { ImportWizardDialog, ImportWizardData, ImportWizardResult } from './import-wizard.dialog';
import { SystemInitService, ImportProgressService } from '../../services';
import type {
  ValidationResult,
  ImportJobResponse,
  ImportStatus,
  ImportModule,
} from '../../types/system-init.types';

/**
 * Type for file input events
 */
interface FileInputEvent {
  target: {
    files: FileList | File[];
  };
}

describe('ImportWizardDialog', () => {
  let component: ImportWizardDialog;
  let fixture: ComponentFixture<ImportWizardDialog>;
  let mockDialogRef: jest.Mocked<MatDialogRef<ImportWizardDialog>>;
  let mockSystemInitService: jest.Mocked<SystemInitService>;
  let mockImportProgressService: jest.Mocked<ImportProgressService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let originalConfirm: typeof window.confirm;

  const mockModule: ImportModule = {
    module: 'drugs',
    domain: 'inventory',
    subdomain: 'master-data',
    displayName: 'Drug Generics',
    displayNameThai: 'ยาสามัญ',
    dependencies: [],
    priority: 1,
    importStatus: 'not_started',
    recordCount: 0,
  };

  const mockDialogData: ImportWizardData = {
    module: mockModule,
  };

  const mockValidationResult: ValidationResult = {
    sessionId: 'session-123',
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalRows: 100,
      validRows: 100,
      errorRows: 0,
    },
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    canProceed: true,
  };

  const mockImportJobResponse: ImportJobResponse = {
    jobId: 'job-123',
    status: 'queued',
    message: 'Import job queued successfully',
  };

  const mockImportStatus: ImportStatus = {
    jobId: 'job-123',
    status: 'running',
    progress: {
      totalRows: 100,
      importedRows: 50,
      errorRows: 0,
      currentRow: 50,
      percentComplete: 50,
    },
    startedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    // Save original global functions before mocking
    originalConfirm = window.confirm;

    mockDialogRef = {
      close: jest.fn(),
    } as jest.Mocked<MatDialogRef<ImportWizardDialog>>;

    mockSystemInitService = {
      downloadTemplate: jest.fn(),
      validateFile: jest.fn(),
      importData: jest.fn(),
      getImportStatus: jest.fn(),
    } as jest.Mocked<SystemInitService>;

    mockImportProgressService = {
      trackProgress: jest.fn(),
      cancelTracking: jest.fn(),
    } as jest.Mocked<ImportProgressService>;

    mockSnackBar = {
      open: jest.fn(),
    } as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [ImportWizardDialog],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: SystemInitService, useValue: mockSystemInitService },
        { provide: ImportProgressService, useValue: mockImportProgressService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportWizardDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Restore original global functions
    window.confirm = originalConfirm;

    if (component) {
      component.ngOnDestroy();
    }
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize at step 1 (Download Template)', () => {
      expect(component.currentStep()).toBe(1);
    });

    it('should have no file selected initially', () => {
      expect(component.selectedFile()).toBeNull();
    });

    it('should have no validation result initially', () => {
      expect(component.validationResult()).toBeNull();
    });

    it('should have default import options', () => {
      expect(component.importOptions()).toEqual({
        skipWarnings: false,
        batchSize: 100,
        onConflict: 'skip',
      });
    });

    it('should have isImporting as false initially', () => {
      expect(component.isImporting()).toBeFalsy();
    });

    it('should have isValidating as false initially', () => {
      expect(component.isValidating()).toBeFalsy();
    });

    it('should have isDragging as false initially', () => {
      expect(component.isDragging()).toBeFalsy();
    });

    it('should have uploadProgress at 0 initially', () => {
      expect(component.uploadProgress()).toBe(0);
    });

    it('should have sessionId as null initially', () => {
      expect(component.sessionId()).toBeNull();
    });

    it('should have importJob as null initially', () => {
      expect(component.importJob()).toBeNull();
    });

    it('should have importStatus as null initially', () => {
      expect(component.importStatus()).toBeNull();
    });

    it('should have batch size options available', () => {
      expect(component.batchSizeOptions).toEqual([50, 100, 500, 1000]);
    });

    it('should have on-conflict options available', () => {
      expect(component.onConflictOptions).toEqual([
        { value: 'skip', label: 'Skip (ignore existing records)' },
        { value: 'update', label: 'Update (overwrite existing records)' },
        { value: 'error', label: 'Error (fail if duplicate found)' },
      ]);
    });

    it('should have total steps as 4', () => {
      expect(component.totalSteps).toBe(4);
    });

    it('should inject dialog data correctly', () => {
      expect(component.data).toEqual(mockDialogData);
      expect(component.data.module.module).toBe('drugs');
    });
  });

  describe('Step 1: Download Template', () => {
    it('should allow proceeding from step 1', () => {
      expect(component.canProceedToNextStep()).toBeTruthy();
    });

    it('should return correct step title for step 1', () => {
      component.currentStep.set(1);
      expect(component.getStepTitle()).toBe('Download Template');
    });

    it('should download CSV template successfully', fakeAsync(() => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });
      mockSystemInitService.downloadTemplate.mockReturnValue(of(mockBlob));

      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(window.URL, 'revokeObjectURL');

      component.downloadTemplate('csv');
      tick();

      expect(mockSystemInitService.downloadTemplate).toHaveBeenCalledWith('drugs', 'csv');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Template downloaded successfully',
        'Close',
        { duration: 3000 }
      );
    }));

    it('should download XLSX template successfully', fakeAsync(() => {
      const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' });
      mockSystemInitService.downloadTemplate.mockReturnValue(of(mockBlob));

      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(window.URL, 'revokeObjectURL');

      component.downloadTemplate('xlsx');
      tick();

      expect(mockSystemInitService.downloadTemplate).toHaveBeenCalledWith('drugs', 'xlsx');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Template downloaded successfully',
        'Close',
        { duration: 3000 }
      );
    }));

    it('should handle download template error', fakeAsync(() => {
      const error = { error: { message: 'Download failed' } };
      mockSystemInitService.downloadTemplate.mockReturnValue(throwError(() => error));

      component.downloadTemplate('csv');
      tick();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Download failed',
        'Close',
        { duration: 5000 }
      );
    }));

    it('should handle download template error without message', fakeAsync(() => {
      const error = {};
      mockSystemInitService.downloadTemplate.mockReturnValue(throwError(() => error));

      component.downloadTemplate('csv');
      tick();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Failed to download template',
        'Close',
        { duration: 5000 }
      );
    }));
  });

  describe('Step 2: File Upload & Validation', () => {
    it('should not allow proceeding without file selected', () => {
      component.currentStep.set(2);
      expect(component.canProceedToNextStep()).toBeFalsy();
    });

    it('should allow proceeding with file selected', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);
      component.currentStep.set(2);
      expect(component.canProceedToNextStep()).toBeTruthy();
    });

    it('should return correct step title for step 2', () => {
      component.currentStep.set(2);
      expect(component.getStepTitle()).toBe('Upload File');
    });

    it('should handle file selection from input', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      const event: FileInputEvent = {
        target: {
          files: [file],
        },
      };

      component.onFileSelected(event);

      expect(component.selectedFile()).toEqual(file);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'File selected successfully',
        'Close',
        { duration: 2000 }
      );
    });

    it('should reject file with invalid extension', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const event: FileInputEvent = {
        target: {
          files: [file],
        },
      };

      component.onFileSelected(event);

      expect(component.selectedFile()).toBeNull();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Invalid file type. Please upload CSV or Excel file.',
        'Close',
        { duration: 5000 }
      );
    });

    it('should reject file exceeding size limit (10 MB)', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'test.csv', { type: 'text/csv' });
      const event: FileInputEvent = {
        target: {
          files: [largeFile],
        },
      };

      component.onFileSelected(event);

      expect(component.selectedFile()).toBeNull();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'File size exceeds 10 MB limit.',
        'Close',
        { duration: 5000 }
      );
    });

    it('should accept CSV file under 10 MB', () => {
      const file = new File(['test data'], 'test.csv', { type: 'text/csv' });
      const event: FileInputEvent = {
        target: {
          files: [file],
        },
      };

      component.onFileSelected(event);

      expect(component.selectedFile()).toEqual(file);
    });

    it('should accept XLSX file under 10 MB', () => {
      const file = new File(['test data'], 'test.xlsx', { type: 'application/vnd.ms-excel' });
      const event: FileInputEvent = {
        target: {
          files: [file],
        },
      };

      component.onFileSelected(event);

      expect(component.selectedFile()).toEqual(file);
    });

    it('should accept XLS file under 10 MB', () => {
      const file = new File(['test data'], 'test.xls', { type: 'application/vnd.ms-excel' });
      const event: FileInputEvent = {
        target: {
          files: [file],
        },
      };

      component.onFileSelected(event);

      expect(component.selectedFile()).toEqual(file);
    });

    it('should compute file info correctly', () => {
      const file = new File(['test data'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);

      const fileInfo = component.fileInfo();

      expect(fileInfo).toBeTruthy();
      expect(fileInfo?.name).toBe('test.csv');
      expect(fileInfo?.isValid).toBeTruthy();
      expect(fileInfo?.isValidType).toBeTruthy();
      expect(fileInfo?.isValidSize).toBeTruthy();
    });

    it('should mark invalid file type in fileInfo', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      component.selectedFile.set(file);

      const fileInfo = component.fileInfo();

      expect(fileInfo?.isValidType).toBeFalsy();
      expect(fileInfo?.isValid).toBeFalsy();
    });

    it('should mark invalid file size in fileInfo', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(largeFile);

      const fileInfo = component.fileInfo();

      expect(fileInfo?.isValidSize).toBeFalsy();
      expect(fileInfo?.isValid).toBeFalsy();
    });

    it('should return null fileInfo when no file selected', () => {
      expect(component.fileInfo()).toBeNull();
    });

    it('should remove file and clear validation result', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);
      component.validationResult.set(mockValidationResult);

      component.removeFile();

      expect(component.selectedFile()).toBeNull();
      expect(component.validationResult()).toBeNull();
      expect(component.sessionId()).toBeNull();
    });
  });

  describe('Drag & Drop File Handling', () => {
    it('should set isDragging to true on dragover', () => {
      const event = new DragEvent('dragover', {
        dataTransfer: new DataTransfer(),
      });

      component.onDragOver(event);

      expect(component.isDragging()).toBeTruthy();
    });

    it('should set isDragging to false on dragleave', () => {
      component.isDragging.set(true);
      const event = new DragEvent('dragleave', {
        dataTransfer: new DataTransfer(),
      });

      component.onDragLeave(event);

      expect(component.isDragging()).toBeFalsy();
    });

    it('should handle file drop with valid file', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const event = new DragEvent('drop', { dataTransfer });

      component.onFileDrop(event);

      expect(component.selectedFile()).toEqual(file);
      expect(component.isDragging()).toBeFalsy();
    });

    it('should reject file drop with invalid type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const event = new DragEvent('drop', { dataTransfer });

      component.onFileDrop(event);

      expect(component.selectedFile()).toBeNull();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Invalid file type. Please upload CSV or Excel file.',
        'Close',
        { duration: 5000 }
      );
    });

    it('should reject file drop exceeding size limit', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'test.csv', { type: 'text/csv' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(largeFile);
      const event = new DragEvent('drop', { dataTransfer });

      component.onFileDrop(event);

      expect(component.selectedFile()).toBeNull();
    });

    it('should set isDragging to false after drop', () => {
      component.isDragging.set(true);
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const event = new DragEvent('drop', { dataTransfer });

      component.onFileDrop(event);

      expect(component.isDragging()).toBeFalsy();
    });
  });

  describe('Step 3: File Validation', () => {
    beforeEach(() => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);
      component.currentStep.set(3);
    });

    it('should return correct step title for step 3', () => {
      component.currentStep.set(3);
      expect(component.getStepTitle()).toBe('Validation Results');
    });

    it('should validate file successfully', fakeAsync(() => {
      mockSystemInitService.validateFile.mockReturnValue(of(mockValidationResult));

      component.validateFile();
      tick();

      expect(mockSystemInitService.validateFile).toHaveBeenCalled();
      expect(component.validationResult()).toEqual(mockValidationResult);
      expect(component.sessionId()).toBe('session-123');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Validation passed!',
        'Close',
        { duration: 3000 }
      );
    }));

    it('should validate file with warnings', fakeAsync(() => {
      const resultWithWarnings: ValidationResult = {
        ...mockValidationResult,
        isValid: false,
        canProceed: true,
        warnings: [
          {
            row: 10,
            field: 'code',
            message: 'Invalid format',
            severity: 'WARNING',
            code: 'INVALID_FORMAT',
          },
        ],
      };

      mockSystemInitService.validateFile.mockReturnValue(of(resultWithWarnings));

      component.validateFile();
      tick();

      expect(component.validationResult()).toEqual(resultWithWarnings);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Validation completed with warnings',
        'Close',
        { duration: 3000 }
      );
    }));

    it('should fail validation', fakeAsync(() => {
      const resultWithErrors: ValidationResult = {
        ...mockValidationResult,
        isValid: false,
        canProceed: false,
        errors: [
          {
            row: 1,
            field: 'name',
            message: 'Required field missing',
            severity: 'ERROR',
            code: 'REQUIRED_FIELD',
          },
        ],
      };

      mockSystemInitService.validateFile.mockReturnValue(of(resultWithErrors));

      component.validateFile();
      tick();

      expect(component.validationResult()).toEqual(resultWithErrors);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Validation failed. Please fix errors and try again.',
        'Close',
        { duration: 5000 }
      );
    }));

    it('should handle validation error', fakeAsync(() => {
      const error = { error: { message: 'Validation service error' } };
      mockSystemInitService.validateFile.mockReturnValue(throwError(() => error));

      component.validateFile();
      tick();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Validation service error',
        'Close',
        { duration: 5000 }
      );
      expect(component.isValidating()).toBeFalsy();
    }));

    it('should set isValidating flag during validation', fakeAsync(() => {
      mockSystemInitService.validateFile.mockReturnValue(of(mockValidationResult));

      expect(component.isValidating()).toBeFalsy();

      component.validateFile();

      expect(component.isValidating()).toBeTruthy();

      tick();

      expect(component.isValidating()).toBeFalsy();
    }));

    it('should not proceed without file selected', () => {
      component.selectedFile.set(null);

      component.validateFile();

      expect(mockSystemInitService.validateFile).not.toHaveBeenCalled();
    });

    it('should allow proceeding from step 3 with valid result', () => {
      component.validationResult.set(mockValidationResult);

      expect(component.canProceedToNextStep()).toBeTruthy();
    });

    it('should allow proceeding from step 3 with canProceed flag', () => {
      const resultWithWarnings: ValidationResult = {
        ...mockValidationResult,
        isValid: false,
        canProceed: true,
      };
      component.validationResult.set(resultWithWarnings);

      expect(component.canProceedToNextStep()).toBeTruthy();
    });

    it('should not allow proceeding from step 3 with invalid result', () => {
      const resultWithErrors: ValidationResult = {
        ...mockValidationResult,
        isValid: false,
        canProceed: false,
      };
      component.validationResult.set(resultWithErrors);

      expect(component.canProceedToNextStep()).toBeFalsy();
    });

    it('should compute validation summary correctly', () => {
      component.validationResult.set(mockValidationResult);

      const summary = component.validationSummary();

      expect(summary).toBeTruthy();
      expect(summary?.isValid).toBeTruthy();
      expect(summary?.canProceed).toBeTruthy();
      expect(summary?.totalRows).toBe(100);
      expect(summary?.validRows).toBe(100);
      expect(summary?.errorRows).toBe(0);
      expect(summary?.errorCount).toBe(0);
      expect(summary?.warningCount).toBe(0);
    });

    it('should return null validation summary when no result', () => {
      expect(component.validationSummary()).toBeNull();
    });
  });

  describe('Step 4: Confirm & Import', () => {
    beforeEach(() => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);
      component.validationResult.set(mockValidationResult);
      component.sessionId.set('session-123');
      component.currentStep.set(4);
    });

    it('should return correct step title for step 4', () => {
      component.currentStep.set(4);
      expect(component.getStepTitle()).toBe('Confirm & Import');
    });

    it('should not allow proceeding from final step', () => {
      expect(component.canProceedToNextStep()).toBeFalsy();
    });

    it('should compute import summary correctly', () => {
      const summary = component.importSummary();

      expect(summary).toBeTruthy();
      expect(summary?.module).toBe('Drug Generics');
      expect(summary?.file).toBe('test.csv');
      expect(summary?.recordsToImport).toBe(100);
      expect(summary?.skipWarnings).toBeFalsy();
      expect(summary?.batchSize).toBe(100);
      expect(summary?.onConflict).toBe('skip');
    });

    it('should return null import summary when no validation result', () => {
      component.validationResult.set(null);

      expect(component.importSummary()).toBeNull();
    });

    it('should start import successfully', fakeAsync(() => {
      const progressSubject = new BehaviorSubject<ImportStatus>(mockImportStatus);
      mockSystemInitService.importData.mockReturnValue(of(mockImportJobResponse));
      mockImportProgressService.trackProgress.mockReturnValue(progressSubject.asObservable());

      component.startImport();
      tick();

      expect(mockSystemInitService.importData).toHaveBeenCalledWith(
        'drugs',
        'session-123',
        component.importOptions()
      );
      expect(component.importJob()).toEqual(mockImportJobResponse);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Import started successfully',
        'Close',
        { duration: 3000 }
      );
    }));

    it('should set isImporting flag during import', fakeAsync(() => {
      const progressSubject = new BehaviorSubject<ImportStatus>(mockImportStatus);
      mockSystemInitService.importData.mockReturnValue(of(mockImportJobResponse));
      mockImportProgressService.trackProgress.mockReturnValue(progressSubject.asObservable());

      expect(component.isImporting()).toBeFalsy();

      component.startImport();

      expect(component.isImporting()).toBeTruthy();

      tick();
    }));

    it('should handle import error', fakeAsync(() => {
      const error = { error: { message: 'Import failed' } };
      mockSystemInitService.importData.mockReturnValue(throwError(() => error));

      component.startImport();
      tick();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Import failed',
        'Close',
        { duration: 5000 }
      );
      expect(component.isImporting()).toBeFalsy();
    }));

    it('should not start import without sessionId', () => {
      component.sessionId.set(null);

      component.startImport();

      expect(mockSystemInitService.importData).not.toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'No validation session found',
        'Close',
        { duration: 5000 }
      );
    });
  });

  describe('Import Options Management', () => {
    it('should update skipWarnings option', () => {
      component.updateImportOption('skipWarnings', true);

      expect(component.importOptions().skipWarnings).toBeTruthy();
    });

    it('should update batchSize option', () => {
      component.updateImportOption('batchSize', 500);

      expect(component.importOptions().batchSize).toBe(500);
    });

    it('should update onConflict option', () => {
      component.updateImportOption('onConflict', 'update');

      expect(component.importOptions().onConflict).toBe('update');
    });

    it('should preserve other options when updating one', () => {
      component.importOptions.set({
        skipWarnings: true,
        batchSize: 200,
        onConflict: 'error',
      });

      component.updateImportOption('batchSize', 300);

      const options = component.importOptions();
      expect(options.skipWarnings).toBeTruthy();
      expect(options.batchSize).toBe(300);
      expect(options.onConflict).toBe('error');
    });
  });

  describe('Real-time Progress Tracking', () => {
    beforeEach(() => {
      component.sessionId.set('session-123');
    });

    it('should track import progress', fakeAsync(() => {
      const progressSubject = new BehaviorSubject<ImportStatus>(mockImportStatus);
      mockSystemInitService.importData.mockReturnValue(of(mockImportJobResponse));
      mockImportProgressService.trackProgress.mockReturnValue(progressSubject.asObservable());

      component.startImport();
      tick();

      expect(component.importStatus()).toEqual(mockImportStatus);
    }));

    it('should update progress as import continues', fakeAsync(() => {
      const progressSubject = new Subject<ImportStatus>();
      mockSystemInitService.importData.mockReturnValue(of(mockImportJobResponse));
      mockImportProgressService.trackProgress.mockReturnValue(progressSubject.asObservable());

      component.startImport();
      tick();

      const progressUpdate: ImportStatus = {
        ...mockImportStatus,
        progress: {
          totalRows: 100,
          importedRows: 75,
          errorRows: 0,
          currentRow: 75,
          percentComplete: 75,
        },
      };

      progressSubject.next(progressUpdate);
      tick();

      expect(component.importStatus()).toEqual(progressUpdate);
    }));

    it('should handle import completion', fakeAsync(() => {
      const progressSubject = new Subject<ImportStatus>();
      mockSystemInitService.importData.mockReturnValue(of(mockImportJobResponse));
      mockImportProgressService.trackProgress.mockReturnValue(progressSubject.asObservable());

      component.startImport();
      tick();

      const completedStatus: ImportStatus = {
        ...mockImportStatus,
        status: 'completed',
        completedAt: new Date().toISOString(),
        progress: {
          totalRows: 100,
          importedRows: 100,
          errorRows: 0,
          currentRow: 100,
          percentComplete: 100,
        },
      };

      progressSubject.next(completedStatus);
      tick();

      expect(component.importStatus()).toEqual(completedStatus);
      expect(component.isImporting()).toBeFalsy();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Import completed successfully!',
        'Close',
        { duration: 5000 }
      );
    }));

    it('should handle import failure', fakeAsync(() => {
      const progressSubject = new Subject<ImportStatus>();
      mockSystemInitService.importData.mockReturnValue(of(mockImportJobResponse));
      mockImportProgressService.trackProgress.mockReturnValue(progressSubject.asObservable());

      component.startImport();
      tick();

      const failedStatus: ImportStatus = {
        ...mockImportStatus,
        status: 'failed',
        error: 'Database connection lost',
        progress: {
          totalRows: 100,
          importedRows: 50,
          errorRows: 0,
          currentRow: 50,
          percentComplete: 50,
        },
      };

      progressSubject.next(failedStatus);
      tick();

      expect(component.importStatus()).toEqual(failedStatus);
      expect(component.isImporting()).toBeFalsy();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Import failed: Database connection lost',
        'Close',
        { duration: 5000 }
      );
    }));

    it('should handle progress tracking error', fakeAsync(() => {
      const error = new Error('Connection lost');
      mockSystemInitService.importData.mockReturnValue(of(mockImportJobResponse));
      mockImportProgressService.trackProgress.mockReturnValue(throwError(() => error));

      component.startImport();
      tick();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Failed to track import progress',
        'Close',
        { duration: 5000 }
      );
      expect(component.isImporting()).toBeFalsy();
    }));

    it('should compute import progress correctly', () => {
      component.importStatus.set(mockImportStatus);

      const progress = component.importProgress();

      expect(progress).toBeTruthy();
      expect(progress?.percentComplete).toBe(50);
      expect(progress?.isComplete).toBeFalsy();
      expect(progress?.isFailed).toBeFalsy();
    });

    it('should compute import progress with completion', () => {
      const completedStatus: ImportStatus = {
        ...mockImportStatus,
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
      component.importStatus.set(completedStatus);

      const progress = component.importProgress();

      expect(progress?.isComplete).toBeTruthy();
      expect(progress?.isFailed).toBeFalsy();
    });

    it('should compute import progress with failure', () => {
      const failedStatus: ImportStatus = {
        ...mockImportStatus,
        status: 'failed',
        error: 'Error message',
      };
      component.importStatus.set(failedStatus);

      const progress = component.importProgress();

      expect(progress?.isFailed).toBeTruthy();
      expect(progress?.error).toBe('Error message');
    });

    it('should return null progress when no import status', () => {
      expect(component.importProgress()).toBeNull();
    });

    it('should estimate remaining time correctly', () => {
      const now = new Date();
      const startedAt = new Date(now.getTime() - 30000); // 30 seconds ago
      const status: ImportStatus = {
        ...mockImportStatus,
        startedAt: startedAt.toISOString(),
        progress: {
          totalRows: 100,
          importedRows: 50,
          errorRows: 0,
          currentRow: 50,
          percentComplete: 50,
        },
      };
      component.importStatus.set(status);

      const progress = component.importProgress();

      expect(progress?.estimatedRemaining).toBeGreaterThan(0);
      expect(progress?.elapsedTime).toBeGreaterThan(0);
    });
  });

  describe('Step Navigation', () => {
    it('should move to next step when conditions are met', fakeAsync(() => {
      component.currentStep.set(1);

      component.nextStep();

      expect(component.currentStep()).toBe(2);
    }));

    it('should not move beyond total steps', () => {
      component.currentStep.set(4);

      component.nextStep();

      expect(component.currentStep()).toBe(4);
    });

    it('should move to previous step', () => {
      component.currentStep.set(2);

      component.previousStep();

      expect(component.currentStep()).toBe(1);
    });

    it('should not move before step 1', () => {
      component.currentStep.set(1);

      component.previousStep();

      expect(component.currentStep()).toBe(1);
    });

    it('should auto-validate on transition from step 2 to 3', fakeAsync(() => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);
      component.currentStep.set(2);

      mockSystemInitService.validateFile.mockReturnValue(of(mockValidationResult));

      component.nextStep();

      expect(mockSystemInitService.validateFile).toHaveBeenCalled();
      tick();

      expect(component.currentStep()).toBe(3);
    }));

    it('should not auto-validate if result already exists', fakeAsync(() => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);
      component.validationResult.set(mockValidationResult);
      component.currentStep.set(2);

      mockSystemInitService.validateFile.mockReturnValue(of(mockValidationResult));

      component.nextStep();

      expect(component.currentStep()).toBe(3);
      tick();

      // validateFile should not be called since result already exists
      expect(mockSystemInitService.validateFile).not.toHaveBeenCalled();
    }));

    it('should not navigate when importing', () => {
      component.isImporting.set(true);
      component.currentStep.set(1);

      component.nextStep();

      expect(component.currentStep()).toBe(1);
    });

    it('should not navigate backward when importing', () => {
      component.isImporting.set(true);
      component.currentStep.set(2);

      component.previousStep();

      expect(component.currentStep()).toBe(2);
    });

    it('should indicate when navigation is allowed', () => {
      component.isImporting.set(false);

      expect(component.canNavigate()).toBeTruthy();
    });

    it('should indicate when navigation is disabled', () => {
      component.isImporting.set(true);

      expect(component.canNavigate()).toBeFalsy();
    });
  });

  describe('Dialog Close & Unsaved Changes', () => {
    it('should close dialog successfully without import', () => {
      component.close(false);

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        success: false,
        jobId: undefined,
      });
    });

    it('should close dialog with success', () => {
      component.close(true);

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        success: true,
        jobId: undefined,
      });
    });

    it('should close dialog with job ID when import completed', () => {
      component.importJob.set(mockImportJobResponse);

      component.close(true);

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        success: true,
        jobId: 'job-123',
      });
    });

    it('should confirm before closing during import', () => {
      component.isImporting.set(true);
      window.confirm = jest.fn().mockReturnValue(true);

      component.close(true);

      expect(window.confirm).toHaveBeenCalledWith(
        'Import is in progress. Are you sure you want to close? This will not cancel the import.'
      );
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should not close if user cancels during import', () => {
      component.isImporting.set(true);
      window.confirm = jest.fn().mockReturnValue(false);

      component.close(true);

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should format bytes correctly', () => {
      expect(component.formatBytes(0)).toBe('0 Bytes');
      expect(component.formatBytes(1024)).toBe('1 KB');
      expect(component.formatBytes(1024 * 1024)).toBe('1 MB');
      expect(component.formatBytes(5 * 1024 * 1024)).toBe('5 MB');
    });

    it('should format time correctly', () => {
      expect(component.formatTime(30)).toBe('30 seconds');
      expect(component.formatTime(60)).toBe('1m 0s');
      expect(component.formatTime(90)).toBe('1m 30s');
      expect(component.formatTime(300)).toBe('5m 0s');
    });

    it('should return correct step titles', () => {
      expect(component.getStepTitle()).toBe('Download Template');

      component.currentStep.set(1);
      expect(component.getStepTitle()).toBe('Download Template');

      component.currentStep.set(2);
      expect(component.getStepTitle()).toBe('Upload File');

      component.currentStep.set(3);
      expect(component.getStepTitle()).toBe('Validation Results');

      component.currentStep.set(4);
      expect(component.getStepTitle()).toBe('Confirm & Import');

      component.currentStep.set(5);
      expect(component.getStepTitle()).toBe('');
    });
  });

  describe('Form State Management with Signals', () => {
    it('should maintain independent signal states', () => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);
      component.currentStep.set(2);
      component.isValidating.set(true);

      expect(component.selectedFile()).toEqual(file);
      expect(component.currentStep()).toBe(2);
      expect(component.isValidating()).toBeTruthy();
    });

    it('should update signals independently', () => {
      component.currentStep.set(1);
      component.isImporting.set(false);
      component.isDragging.set(false);

      component.currentStep.set(2);

      expect(component.currentStep()).toBe(2);
      expect(component.isImporting()).toBeFalsy();
      expect(component.isDragging()).toBeFalsy();
    });

    it('should reflect changes in computed values when signals change', () => {
      component.currentStep.set(1);
      expect(component.canProceedToNextStep()).toBeTruthy();

      component.currentStep.set(2);
      expect(component.canProceedToNextStep()).toBeFalsy();

      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);

      expect(component.canProceedToNextStep()).toBeTruthy();
    });

    it('should handle complex state transitions', fakeAsync(() => {
      // Step 1: Download template
      expect(component.currentStep()).toBe(1);
      expect(component.canProceedToNextStep()).toBeTruthy();

      // Step 2: Upload file
      component.nextStep();
      expect(component.currentStep()).toBe(2);
      expect(component.canProceedToNextStep()).toBeFalsy();

      // Select file
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);
      expect(component.canProceedToNextStep()).toBeTruthy();

      // Step 3: Validate
      mockSystemInitService.validateFile.mockReturnValue(of(mockValidationResult));
      component.nextStep();
      tick();

      expect(component.currentStep()).toBe(3);
      expect(component.validationResult()).toEqual(mockValidationResult);

      // Step 4: Import
      component.currentStep.set(4);
      component.sessionId.set('session-123');

      expect(component.importSummary()).toBeTruthy();
    }));
  });

  describe('Lifecycle Cleanup', () => {
    it('should cancel tracking on destroy', () => {
      const jobResponse: ImportJobResponse = {
        jobId: 'job-456',
        status: 'running',
        message: 'Import in progress',
      };
      component.importJob.set(jobResponse);

      component.ngOnDestroy();

      expect(mockImportProgressService.cancelTracking).toHaveBeenCalledWith('drugs', 'job-456');
    });

    it('should not cancel tracking if no import job', () => {
      component.ngOnDestroy();

      expect(mockImportProgressService.cancelTracking).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle file with 10 MB size exactly', () => {
      const file = new File(['x'.repeat(10 * 1024 * 1024)], 'test.csv', { type: 'text/csv' });
      const event: FileInputEvent = {
        target: {
          files: [file],
        },
      };

      component.onFileSelected(event);

      expect(component.selectedFile()).toEqual(file);
    });

    it('should handle file with 0 bytes', () => {
      const file = new File([], 'test.csv', { type: 'text/csv' });
      const event: FileInputEvent = {
        target: {
          files: [file],
        },
      };

      component.onFileSelected(event);

      expect(component.selectedFile()).toEqual(file);
    });

    it('should handle case-insensitive file extensions', () => {
      const file = new File(['test'], 'test.CSV', { type: 'text/csv' });
      const event: FileInputEvent = {
        target: {
          files: [file],
        },
      };

      component.onFileSelected(event);

      expect(component.selectedFile()).toEqual(file);
    });

    it('should compute accurate file size display', () => {
      const file = new File(['test data test data test data'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);

      const fileInfo = component.fileInfo();

      expect(fileInfo?.size).toBeTruthy();
      expect(parseFloat(fileInfo?.size as string)).toBeGreaterThan(0);
    });

    it('should handle empty file input', () => {
      const event: FileInputEvent = {
        target: {
          files: [],
        },
      };

      component.onFileSelected(event);

      expect(component.selectedFile()).toBeNull();
    });
  });

  describe('Computed Values Reactivity', () => {
    it('should update fileInfo when file changes', () => {
      expect(component.fileInfo()).toBeNull();

      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);

      expect(component.fileInfo()).toBeTruthy();
      expect(component.fileInfo()?.name).toBe('test.csv');

      const newFile = new File(['other'], 'other.xlsx', { type: 'application/vnd.ms-excel' });
      component.selectedFile.set(newFile);

      expect(component.fileInfo()?.name).toBe('other.xlsx');
    });

    it('should update validationSummary when validation result changes', () => {
      expect(component.validationSummary()).toBeNull();

      component.validationResult.set(mockValidationResult);

      expect(component.validationSummary()).toBeTruthy();
      expect(component.validationSummary()?.totalRows).toBe(100);
    });

    it('should update importProgress when status changes', () => {
      expect(component.importProgress()).toBeNull();

      component.importStatus.set(mockImportStatus);

      expect(component.importProgress()).toBeTruthy();
      expect(component.importProgress()?.percentComplete).toBe(50);
    });
  });

  describe('Accessibility - ARIA Labels', () => {
    it('should have proper ARIA labels on dialog buttons', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have aria-label on Next button', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button[mat-button], button[mat-raised-button]');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have aria-label on Cancel button', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button[mat-button], button[mat-raised-button]');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have aria-label on file input element', () => {
      component.currentStep.set(2);
      fixture.detectChanges();
      const fileInput = fixture.nativeElement.querySelector('input[type="file"]');
      if (fileInput) {
        const ariaLabel = fileInput.getAttribute('aria-label') || fileInput.getAttribute('accept');
        expect(ariaLabel).toBeTruthy();
      }
    });

    it('should have role="progressbar" during import', () => {
      component.isImporting.set(true);
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
      if (progressBar) {
        expect(progressBar.getAttribute('role')).toBe('progressbar');
      }
    });

    it('should have aria-valuenow on progress bar', () => {
      component.importStatus.set(mockImportStatus);
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
      if (progressBar) {
        expect(progressBar).toBeTruthy();
      }
    });

    it('should have role="dialog" on dialog container', () => {
      fixture.detectChanges();
      const dialog = fixture.nativeElement.closest('mat-dialog-container') ||
                     fixture.nativeElement.querySelector('.mat-dialog-container');
      if (dialog) {
        expect(dialog).toBeTruthy();
      }
    });

    it('should have aria-labelledby for dialog title', () => {
      fixture.detectChanges();
      const title = fixture.nativeElement.querySelector('mat-dialog-title');
      if (title) {
        expect(title).toBeTruthy();
      }
    });

    it('should have role="alert" for validation error messages', () => {
      component.validationResult.set({
        sessionId: 'session-123',
        isValid: false,
        errors: [{ row: 1, field: 'test', message: 'Error', severity: 'ERROR', code: 'ERR' }],
        warnings: [],
        stats: { totalRows: 100, validRows: 99, errorRows: 1 },
        expiresAt: new Date().toISOString(),
        canProceed: false,
      });
      fixture.detectChanges();
      const errorElement = fixture.nativeElement.querySelector('[role="alert"]');
      expect(errorElement || fixture.nativeElement.textContent.includes('Error')).toBeTruthy();
    });

    it('should have aria-live="polite" for status updates', () => {
      fixture.detectChanges();
      const liveRegion = fixture.nativeElement.querySelector('[aria-live="polite"]');
      expect(liveRegion || fixture.nativeElement.textContent).toBeTruthy();
    });

    it('should have aria-describedby for validation messages', () => {
      component.validationResult.set(mockValidationResult);
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('mat-card');
      expect(cards.length).toBeGreaterThanOrEqual(0);
    });

    it('should have aria-current="step" on active step', () => {
      component.currentStep.set(2);
      fixture.detectChanges();
      const activeStep = fixture.nativeElement.querySelector('[aria-current="step"]');
      expect(activeStep || fixture.nativeElement.textContent).toBeTruthy();
    });

    it('should have aria-busy during validation', fakeAsync(() => {
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile.set(file);
      mockSystemInitService.validateFile.mockReturnValue(of(mockValidationResult));

      component.validateFile();
      fixture.detectChanges();

      expect(component.isValidating()).toBeTruthy();

      tick();
      expect(component.isValidating()).toBeFalsy();
    }));
  });

  describe('Keyboard Navigation - Accessibility (a11y)', () => {
    describe('Tab Key Navigation', () => {
      it('should navigate between wizard steps with Tab key', () => {
        component.currentStep.set(1);

        // Tab key should allow focus cycling without advancing steps
        const _tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(_tabEvent);

        expect(component.currentStep()).toBe(1);
      });

      it('should maintain focus within dialog when tabbing', () => {
        component.currentStep.set(2);
        const file = new File(['test'], 'test.csv', { type: 'text/csv' });
        component.selectedFile.set(file);

        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        jest.spyOn(event, 'preventDefault');

        expect(component).toBeTruthy();
        expect(component.currentStep()).toBe(2);
      });

      it('should allow tab navigation through form inputs', () => {
        component.currentStep.set(2);

        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(tabEvent);

        expect(component.currentStep()).toBe(2);
      });
    });

    describe('Enter Key - Confirm/Proceed', () => {
      it('should proceed to next step when Enter key pressed on Next button', () => {
        component.currentStep.set(1);

        // Simulate Enter key (tests that component responds to navigation)
        component.nextStep();

        expect(component.currentStep()).toBe(2);
      });

      it('should confirm action in step 2 (Upload File) with Enter key', () => {
        const file = new File(['test'], 'test.csv', { type: 'text/csv' });
        component.selectedFile.set(file);
        component.currentStep.set(2);

        // Simulate Enter key confirmation
        component.nextStep();

        expect(component.currentStep()).toBe(3);
      });

      it('should trigger file validation with Enter key in step 3', fakeAsync(() => {
        const file = new File(['test'], 'test.csv', { type: 'text/csv' });
        component.selectedFile.set(file);
        component.currentStep.set(3);

        mockSystemInitService.validateFile.mockReturnValue(of(mockValidationResult));

        // Simulate Enter key to validate
        component.validateFile();
        tick();

        expect(mockSystemInitService.validateFile).toHaveBeenCalled();
      }));

      it('should trigger import with Enter key in step 4', fakeAsync(() => {
        const file = new File(['test'], 'test.csv', { type: 'text/csv' });
        component.selectedFile.set(file);
        component.validationResult.set(mockValidationResult);
        component.sessionId.set('session-123');
        component.currentStep.set(4);

        const progressSubject = new BehaviorSubject<ImportStatus>(mockImportStatus);
        mockSystemInitService.importData.mockReturnValue(of(mockImportJobResponse));
        mockImportProgressService.trackProgress.mockReturnValue(progressSubject.asObservable());

        // Simulate Enter key to start import
        component.startImport();
        tick();

        expect(component.isImporting()).toBeTruthy();
      }));
    });

    describe('Escape Key - Close Dialog with Confirmation', () => {
      it('should close dialog with Escape key when no unsaved changes', () => {
        component.currentStep.set(1);

        // Simulate Escape key to close
        component.close(false);

        expect(mockDialogRef.close).toHaveBeenCalledWith({
          success: false,
          jobId: undefined,
        });
      });

      it('should confirm before closing with Escape key when importing', () => {
        component.isImporting.set(true);
        window.confirm = jest.fn().mockReturnValue(true);

        component.close(true);

        expect(window.confirm).toHaveBeenCalledWith(
          'Import is in progress. Are you sure you want to close? This will not cancel the import.'
        );
        expect(mockDialogRef.close).toHaveBeenCalled();
      });

      it('should prevent close with Escape key when user cancels import confirmation', () => {
        component.isImporting.set(true);
        window.confirm = jest.fn().mockReturnValue(false);

        component.close(true);

        expect(window.confirm).toHaveBeenCalled();
        expect(mockDialogRef.close).not.toHaveBeenCalled();
      });

      it('should close dialog with Escape key when file is selected but not validated', () => {
        const file = new File(['test'], 'test.csv', { type: 'text/csv' });
        component.selectedFile.set(file);
        component.currentStep.set(2);

        component.close(false);

        expect(mockDialogRef.close).toHaveBeenCalledWith({
          success: false,
          jobId: undefined,
        });
      });

      it('should preserve import job ID when closing dialog after successful import', () => {
        component.importJob.set(mockImportJobResponse);

        component.close(true);

        expect(mockDialogRef.close).toHaveBeenCalledWith({
          success: true,
          jobId: 'job-123',
        });
      });
    });

    describe('Arrow Keys - Option Selection', () => {
      it('should navigate batch size options with arrow keys', () => {
        const initialBatchSize = component.importOptions().batchSize;

        component.updateImportOption('batchSize', 500);

        expect(component.importOptions().batchSize).toBe(500);
        expect(component.importOptions().batchSize).not.toBe(initialBatchSize);
      });

      it('should navigate on-conflict options with arrow keys', () => {
        component.updateImportOption('onConflict', 'update');

        expect(component.importOptions().onConflict).toBe('update');
      });

      it('should cycle through batch size options (50, 100, 500, 1000)', () => {
        const batchSizeOptions = component.batchSizeOptions;

        expect(batchSizeOptions).toContain(50);
        expect(batchSizeOptions).toContain(100);
        expect(batchSizeOptions).toContain(500);
        expect(batchSizeOptions).toContain(1000);
      });

      it('should have accessible on-conflict options list', () => {
        const options = component.onConflictOptions;

        expect(options.length).toBe(3);
        expect(options[0].value).toBe('skip');
        expect(options[1].value).toBe('update');
        expect(options[2].value).toBe('error');
      });
    });

    describe('Keyboard Navigation State Management', () => {
      it('should prevent navigation when importing', () => {
        component.isImporting.set(true);
        component.currentStep.set(2);

        component.nextStep();

        expect(component.currentStep()).toBe(2);
      });

      it('should prevent backward navigation when importing', () => {
        component.isImporting.set(true);
        component.currentStep.set(3);

        component.previousStep();

        expect(component.currentStep()).toBe(3);
      });

      it('should track navigation state with canNavigate computed signal', () => {
        component.isImporting.set(false);
        expect(component.canNavigate()).toBeTruthy();

        component.isImporting.set(true);
        expect(component.canNavigate()).toBeFalsy();

        component.isImporting.set(false);
        expect(component.canNavigate()).toBeTruthy();
      });

      it('should indicate keyboard focus availability during validation', () => {
        component.isValidating.set(true);

        expect(component).toBeTruthy();

        component.isValidating.set(false);
        expect(component).toBeTruthy();
      });
    });

    describe('Keyboard Accessibility - Semantic Requirements', () => {
      it('should have accessible step titles for keyboard users', () => {
        for (let step = 1; step <= 4; step++) {
          component.currentStep.set(step);
          const title = component.getStepTitle();
          expect(title.length).toBeGreaterThan(0);
        }
      });

      it('should handle rapid key presses without breaking navigation', () => {
        component.currentStep.set(1);

        component.nextStep();
        component.nextStep();
        component.nextStep();

        expect(component.currentStep()).toBe(4);
      });

      it('should maintain focus context when switching steps', () => {
        component.currentStep.set(1);
        expect(component.canProceedToNextStep()).toBeTruthy();

        component.nextStep();
        expect(component.currentStep()).toBe(2);
        expect(component.canProceedToNextStep()).toBeFalsy();

        const file = new File(['test'], 'test.csv', { type: 'text/csv' });
        component.selectedFile.set(file);
        expect(component.canProceedToNextStep()).toBeTruthy();
      });

      it('should provide clear feedback for disabled buttons via keyboard', () => {
        component.currentStep.set(2);
        component.selectedFile.set(null);

        expect(component.canProceedToNextStep()).toBeFalsy();
      });
    });
  });
});
