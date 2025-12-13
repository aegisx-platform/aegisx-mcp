/**
 * Validation Results Component - Usage Examples
 *
 * This file demonstrates how to use the ValidationResultsComponent
 * in different validation scenarios.
 */

import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../../types/system-init.types';

/**
 * Example 1: Validation passed with no errors or warnings
 */
export const validationPassedExample: ValidationResult = {
  sessionId: 'session-uuid-001',
  isValid: true,
  errors: [],
  warnings: [],
  stats: {
    totalRows: 100,
    validRows: 100,
    errorRows: 0,
  },
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  canProceed: true,
};

/**
 * Example 2: Validation passed with warnings (can proceed)
 */
export const validationWithWarningsExample: ValidationResult = {
  sessionId: 'session-uuid-002',
  isValid: false,
  errors: [],
  warnings: [
    {
      row: 15,
      field: 'description',
      message: 'Field is empty (optional)',
      severity: 'WARNING',
      code: 'EMPTY_OPTIONAL_FIELD',
      data: {
        code: 'PHARM',
        name: 'Pharmacy Department',
        hospital_id: 1,
      },
    },
    {
      row: 32,
      field: 'description',
      message: 'Field is empty (optional)',
      severity: 'WARNING',
      code: 'EMPTY_OPTIONAL_FIELD',
      data: {
        code: 'FINANCE',
        name: 'Finance Department',
        hospital_id: 2,
      },
    },
    {
      row: 47,
      field: 'is_active',
      message: 'Will default to true if not provided',
      severity: 'WARNING',
      code: 'DEFAULT_VALUE_APPLIED',
      data: {
        code: 'HR',
        name: 'Human Resources',
        hospital_id: 1,
      },
    },
  ],
  stats: {
    totalRows: 50,
    validRows: 47,
    errorRows: 0,
  },
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  canProceed: true,
};

/**
 * Example 3: Validation failed with errors
 */
export const validationFailedExample: ValidationResult = {
  sessionId: 'session-uuid-003',
  isValid: false,
  errors: [
    {
      row: 5,
      field: 'code',
      message: 'Duplicate code already exists in database',
      severity: 'ERROR',
      code: 'DUPLICATE_CODE',
      data: {
        code: 'PHARM',
        name: 'Pharmacy',
        hospital_id: 1,
      },
    },
    {
      row: 12,
      field: 'code',
      message: 'Code format is invalid. Expected alphanumeric and underscore only',
      severity: 'ERROR',
      code: 'INVALID_FORMAT',
      data: {
        code: 'pharmacy-1',
        name: 'Pharmacy First Floor',
        hospital_id: 1,
      },
    },
    {
      row: 25,
      field: 'name',
      message: 'Required field is missing',
      severity: 'ERROR',
      code: 'REQUIRED_FIELD_MISSING',
      data: {
        code: 'MED',
        hospital_id: 2,
      },
    },
  ],
  warnings: [
    {
      row: 8,
      field: 'description',
      message: 'Field is empty (optional)',
      severity: 'WARNING',
      code: 'EMPTY_OPTIONAL_FIELD',
      data: {
        code: 'LAB',
        name: 'Laboratory',
        hospital_id: 1,
      },
    },
  ],
  stats: {
    totalRows: 50,
    validRows: 46,
    errorRows: 3,
  },
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  canProceed: false,
};

/**
 * Example 4: Complex validation with multiple error types
 */
export const complexValidationExample: ValidationResult = {
  sessionId: 'session-uuid-004',
  isValid: false,
  errors: [
    {
      row: 3,
      field: 'code',
      message: 'Value exceeds maximum length of 20 characters',
      severity: 'ERROR',
      code: 'VALUE_LENGTH_EXCEEDED',
      data: {
        code: 'VeryLongCodeThatExceedsTheMaximumAllowedLength',
        name: 'Department',
      },
    },
    {
      row: 7,
      field: 'hospital_id',
      message: 'Referenced hospital does not exist',
      severity: 'ERROR',
      code: 'FOREIGN_KEY_NOT_FOUND',
      data: {
        code: 'DEPT001',
        name: 'Department 001',
        hospital_id: 999,
      },
    },
    {
      row: 15,
      field: 'code',
      message: 'Duplicate code already exists in database',
      severity: 'ERROR',
      code: 'DUPLICATE_CODE',
      data: {
        code: 'EXISTING',
        name: 'Existing Department',
        hospital_id: 1,
      },
    },
    {
      row: 22,
      field: 'name',
      message: 'Required field is missing',
      severity: 'ERROR',
      code: 'REQUIRED_FIELD_MISSING',
      data: {
        code: 'DEPT022',
      },
    },
  ],
  warnings: [
    {
      row: 4,
      field: 'description',
      message: 'Field is empty (optional)',
      severity: 'WARNING',
      code: 'EMPTY_OPTIONAL_FIELD',
      data: {
        code: 'DEPT004',
        name: 'Department 004',
      },
    },
    {
      row: 9,
      field: 'is_active',
      message: 'Will default to true if not provided',
      severity: 'WARNING',
      code: 'DEFAULT_VALUE_APPLIED',
      data: {
        code: 'DEPT009',
        name: 'Department 009',
      },
    },
    {
      row: 18,
      field: 'description',
      message: 'Text contains special characters that may cause encoding issues',
      severity: 'WARNING',
      code: 'SPECIAL_CHARACTERS_DETECTED',
      data: {
        code: 'DEPT018',
        name: 'Department 018',
        description: 'Special chars: <>&"\'',
      },
    },
  ],
  stats: {
    totalRows: 100,
    validRows: 87,
    errorRows: 4,
  },
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  canProceed: false,
};

/**
 * Usage in Component:
 *
 * ```typescript
 * import { ValidationResultsComponent } from './validation-results.component';
 *
 * @Component({
 *   selector: 'app-import-wizard',
 *   standalone: true,
 *   imports: [ValidationResultsComponent, ...],
 *   template: `
 *     <app-validation-results
 *       [validationResult]="validationResult()"
 *       [fileName]="'departments_data.csv'"
 *       [fileSize]="1200000"
 *       (downloadReport)="onDownloadReport()"
 *     />
 *   `
 * })
 * export class ImportWizardComponent {
 *   validationResult = signal<ValidationResult>(validationPassedExample);
 *
 *   onDownloadReport() {
 *     // Generate CSV report and download
 *     const csv = this.generateValidationReport();
 *     this.downloadFile(csv, 'validation-report.csv');
 *   }
 * }
 * ```
 *
 * Component Inputs:
 * - validationResult: The validation result object (required)
 * - fileName: Display file name (optional)
 * - fileSize: File size in bytes (optional)
 *
 * Component Outputs:
 * - downloadReport: Emitted when download button is clicked
 */
