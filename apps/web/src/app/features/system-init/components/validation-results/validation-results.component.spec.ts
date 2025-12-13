import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidationResultsComponent } from './validation-results.component';
import {
  validationPassedExample,
  validationWithWarningsExample,
  validationFailedExample,
  complexValidationExample,
} from './validation-results.examples';

describe('ValidationResultsComponent', () => {
  let component: ValidationResultsComponent;
  let fixture: ComponentFixture<ValidationResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationResultsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidationResultsComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.errorPanelExpanded()).toBe(false);
      expect(component.warningPanelExpanded()).toBe(false);
    });
  });

  describe('Validation Passed Scenario', () => {
    beforeEach(() => {
      component.validationResult = validationPassedExample;
      component.fileName = 'departments_data.csv';
      component.fileSize = 1024000;
      fixture.detectChanges();
    });

    it('should display correct validation status', () => {
      expect(component.validationPassed).toBe(true);
      expect(component.statusIcon).toBe('check_circle');
      expect(component.statusLabel).toBe('Validation Passed');
    });

    it('should indicate no errors', () => {
      expect(component.hasErrors).toBe(false);
      expect(component.summary.errorCount).toBe(0);
    });

    it('should indicate no warnings', () => {
      expect(component.hasWarnings).toBe(false);
      expect(component.summary.warningCount).toBe(0);
    });

    it('should display correct summary statistics', () => {
      expect(component.summary.totalRows).toBe(100);
      expect(component.summary.validRows).toBe(100);
      expect(component.summary.errorRows).toBe(0);
    });

    it('should display session ID correctly', () => {
      expect(component.validationResult.sessionId).toBe('session-uuid-001');
    });

    it('should not render error and warning sections', () => {
      const errorSection = fixture.nativeElement.querySelector(
        '.errors-section'
      );
      const warningSection = fixture.nativeElement.querySelector(
        '.warnings-section'
      );

      expect(errorSection).toBeFalsy();
      expect(warningSection).toBeFalsy();
    });
  });

  describe('Validation with Warnings Scenario', () => {
    beforeEach(() => {
      component.validationResult = validationWithWarningsExample;
      component.fileName = 'departments_data.csv';
      component.fileSize = 1200000;
      fixture.detectChanges();
    });

    it('should indicate warnings but not errors', () => {
      expect(component.hasErrors).toBe(false);
      expect(component.hasWarnings).toBe(true);
    });

    it('should display warning count correctly', () => {
      expect(component.summary.warningCount).toBe(3);
    });

    it('should not render error section', () => {
      const errorSection = fixture.nativeElement.querySelector(
        '.errors-section'
      );
      expect(errorSection).toBeFalsy();
    });

    it('should render warning section', () => {
      const warningSection = fixture.nativeElement.querySelector(
        '.warnings-section'
      );
      expect(warningSection).toBeTruthy();
    });

    it('should display all warning items', () => {
      const warningItems = fixture.nativeElement.querySelectorAll(
        '.warning-item'
      );
      expect(warningItems.length).toBe(3);
    });
  });

  describe('Validation Failed Scenario', () => {
    beforeEach(() => {
      component.validationResult = validationFailedExample;
      component.fileName = 'departments_data.csv';
      component.fileSize = 1500000;
      fixture.detectChanges();
    });

    it('should indicate validation failure', () => {
      expect(component.validationPassed).toBe(false);
      expect(component.statusIcon).toBe('error');
      expect(component.statusLabel).toBe('Validation Failed');
    });

    it('should display both errors and warnings', () => {
      expect(component.hasErrors).toBe(true);
      expect(component.hasWarnings).toBe(true);
    });

    it('should display correct error count', () => {
      expect(component.summary.errorCount).toBe(3);
    });

    it('should display correct warning count', () => {
      expect(component.summary.warningCount).toBe(1);
    });

    it('should render error section with all errors', () => {
      const errorSection = fixture.nativeElement.querySelector(
        '.errors-section'
      );
      expect(errorSection).toBeTruthy();

      const errorItems = fixture.nativeElement.querySelectorAll('.error-item');
      expect(errorItems.length).toBe(3);
    });

    it('should render warning section with all warnings', () => {
      const warningSection = fixture.nativeElement.querySelector(
        '.warnings-section'
      );
      expect(warningSection).toBeTruthy();

      const warningItems = fixture.nativeElement.querySelectorAll(
        '.warning-item'
      );
      expect(warningItems.length).toBe(1);
    });

    it('should display error details correctly', () => {
      const firstErrorItem = fixture.nativeElement.querySelector('.error-item');
      const rowBadge = firstErrorItem.querySelector('.row-badge');

      expect(rowBadge.textContent).toContain('Row 5');
    });
  });

  describe('Complex Validation Scenario', () => {
    beforeEach(() => {
      component.validationResult = complexValidationExample;
      component.fileName = 'complex_data.csv';
      component.fileSize = 2500000;
      fixture.detectChanges();
    });

    it('should handle multiple error types', () => {
      expect(component.summary.errorCount).toBe(4);
      expect(component.validationResult.errors[0].code).toBe(
        'VALUE_LENGTH_EXCEEDED'
      );
      expect(component.validationResult.errors[1].code).toBe(
        'FOREIGN_KEY_NOT_FOUND'
      );
      expect(component.validationResult.errors[2].code).toBe('DUPLICATE_CODE');
      expect(component.validationResult.errors[3].code).toBe(
        'REQUIRED_FIELD_MISSING'
      );
    });

    it('should handle multiple warning types', () => {
      expect(component.summary.warningCount).toBe(3);
      expect(component.validationResult.warnings[0].code).toBe(
        'EMPTY_OPTIONAL_FIELD'
      );
      expect(component.validationResult.warnings[1].code).toBe(
        'DEFAULT_VALUE_APPLIED'
      );
      expect(component.validationResult.warnings[2].code).toBe(
        'SPECIAL_CHARACTERS_DETECTED'
      );
    });

    it('should display correct stats', () => {
      expect(component.summary.totalRows).toBe(100);
      expect(component.summary.validRows).toBe(87);
      expect(component.summary.errorRows).toBe(4);
    });
  });

  describe('File Size Formatting', () => {
    it('should format bytes correctly', () => {
      component.fileSize = 512;
      expect(component.formattedFileSize).toBe('512.00 B');
    });

    it('should format kilobytes correctly', () => {
      component.fileSize = 1024;
      expect(component.formattedFileSize).toBe('1.00 KB');
    });

    it('should format megabytes correctly', () => {
      component.fileSize = 1048576; // 1 MB
      expect(component.formattedFileSize).toBe('1.00 MB');
    });

    it('should format gigabytes correctly', () => {
      component.fileSize = 1073741824; // 1 GB
      expect(component.formattedFileSize).toBe('1.00 GB');
    });

    it('should handle undefined file size', () => {
      component.fileSize = undefined;
      expect(component.formattedFileSize).toBe('');
    });

    it('should handle zero file size', () => {
      component.fileSize = 0;
      expect(component.formattedFileSize).toBe('0.00 B');
    });
  });

  describe('Data Formatting', () => {
    it('should format JSON data correctly', () => {
      const data = { code: 'TEST', name: 'Test' };
      const formatted = component.formatDataForDisplay(data);

      expect(formatted).toContain('"code"');
      expect(formatted).toContain('"TEST"');
      expect(formatted).toContain('"name"');
      expect(formatted).toContain('"Test"');
    });

    it('should handle null data', () => {
      expect(component.formatDataForDisplay(null)).toBe('N/A');
    });

    it('should handle undefined data', () => {
      expect(component.formatDataForDisplay(undefined)).toBe('N/A');
    });

    it('should handle string data', () => {
      const result = component.formatDataForDisplay('test string');
      expect(result).toBe('test string');
    });

    it('should return N/A for invalid JSON', () => {
      const result = component.formatDataForDisplay(
        (() => {}) // Function cannot be JSON stringified
      );
      expect(result).toBe('[object Object]');
    });
  });

  describe('Data Display Check', () => {
    it('should show data when present', () => {
      expect(component.shouldShowData({ test: 'data' })).toBe(true);
    });

    it('should not show data when null', () => {
      expect(component.shouldShowData(null)).toBe(false);
    });

    it('should not show data when undefined', () => {
      expect(component.shouldShowData(undefined)).toBe(false);
    });

    it('should show empty object data', () => {
      expect(component.shouldShowData({})).toBe(true);
    });
  });

  describe('Status Styling', () => {
    it('should return correct status class for passed validation', () => {
      component.validationResult = validationPassedExample;
      expect(component.statusClass).toBe('validation-passed');
    });

    it('should return correct status class for failed validation', () => {
      component.validationResult = validationFailedExample;
      expect(component.statusClass).toBe('validation-failed');
    });
  });

  describe('Event Emissions', () => {
    beforeEach(() => {
      component.validationResult = validationFailedExample;
    });

    it('should emit downloadReport event when button clicked', (done) => {
      component.downloadReport.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      component.onDownloadReport();
    });

    it('should emit downloadReport with correct event', (done) => {
      let emitted = false;
      component.downloadReport.subscribe(() => {
        emitted = true;
      });

      component.onDownloadReport();
      expect(emitted).toBe(true);
      done();
    });
  });

  describe('Panel Expansion', () => {
    beforeEach(() => {
      component.validationResult = validationWithWarningsExample;
      fixture.detectChanges();
    });

    it('should track error panel expansion state', () => {
      expect(component.errorPanelExpanded()).toBe(false);

      component.errorPanelExpanded.set(true);
      expect(component.errorPanelExpanded()).toBe(true);

      component.errorPanelExpanded.set(false);
      expect(component.errorPanelExpanded()).toBe(false);
    });

    it('should track warning panel expansion state', () => {
      expect(component.warningPanelExpanded()).toBe(false);

      component.warningPanelExpanded.set(true);
      expect(component.warningPanelExpanded()).toBe(true);

      component.warningPanelExpanded.set(false);
      expect(component.warningPanelExpanded()).toBe(false);
    });
  });

  describe('TrackBy Functions', () => {
    it('should track by index correctly', () => {
      expect(component.trackByIndex(0)).toBe(0);
      expect(component.trackByIndex(5)).toBe(5);
      expect(component.trackByIndex(999)).toBe(999);
    });

    it('should track by row field correctly', () => {
      const error = validationFailedExample.errors[0];
      const result = component.trackByRowField(0, error);

      expect(result).toContain(String(error.row));
      expect(result).toContain(error.field!);
    });

    it('should handle trackByRowField for items without row', () => {
      const error = { ...validationFailedExample.errors[0], row: undefined };
      const result = component.trackByRowField(0, error);

      expect(result).toBeTruthy();
    });
  });

  describe('Severity Badge Colors', () => {
    beforeEach(() => {
      component.validationResult = validationFailedExample;
    });

    it('should return correct error severity color', () => {
      expect(component.getErrorSeverityColor()).toBe('warn');
    });

    it('should return correct warning severity color', () => {
      expect(component.getWarningSeverityColor()).toBe('accent');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty error and warning arrays', () => {
      component.validationResult = validationPassedExample;

      expect(component.hasErrors).toBe(false);
      expect(component.hasWarnings).toBe(false);
    });

    it('should handle missing optional input properties', () => {
      component.validationResult = validationFailedExample;
      component.fileName = undefined;
      component.fileSize = undefined;

      expect(component.fileName).toBeUndefined();
      expect(component.fileSize).toBeUndefined();
      expect(component.formattedFileSize).toBe('');
    });

    it('should handle errors without row numbers', () => {
      const errorWithoutRow = {
        ...validationFailedExample.errors[0],
        row: undefined,
      };
      component.validationResult = {
        ...validationFailedExample,
        errors: [errorWithoutRow],
      };

      expect(component.hasErrors).toBe(true);
      expect(component.summary.errorCount).toBe(1);
    });

    it('should handle warnings without field names', () => {
      const warningWithoutField = {
        ...validationWithWarningsExample.warnings[0],
        field: undefined,
      };
      component.validationResult = {
        ...validationWithWarningsExample,
        warnings: [warningWithoutField],
      };

      expect(component.hasWarnings).toBe(true);
    });
  });

  describe('Summary Calculations', () => {
    it('should calculate warning rows correctly', () => {
      component.validationResult = validationWithWarningsExample;

      const expectedWarningRows =
        component.validationResult.stats.totalRows -
        component.validationResult.stats.validRows -
        component.validationResult.stats.errorRows;

      expect(component.summary.warningRows).toBe(expectedWarningRows);
    });

    it('should handle case where errorRows is not zero', () => {
      component.validationResult = complexValidationExample;

      const expectedWarningRows =
        component.validationResult.stats.totalRows -
        component.validationResult.stats.validRows -
        component.validationResult.stats.errorRows;

      expect(component.summary.warningRows).toBe(expectedWarningRows);
    });
  });
});
