# Validation Results Component

A comprehensive Angular component for displaying import file validation results, including errors, warnings, and validation statistics.

## Overview

The Validation Results Component displays:
- File information (name, size, session ID)
- Validation status (passed/failed)
- Summary statistics (total rows, valid rows, errors, warnings)
- Detailed error list with expandable data preview
- Detailed warning list with expandable data preview
- Download report button for CSV export

## Features

### Display Elements

1. **Header Section**
   - Session ID
   - File name and size
   - Validation timestamp
   - Validation status badge (pass/fail with icon)

2. **Summary Card**
   - Total rows processed
   - Valid rows count
   - Error count (color-coded red)
   - Warning count (color-coded orange)
   - Visual distinction between successful and failed validations

3. **Errors Section** (Expandable)
   - Row number indicator
   - Field name
   - Error message
   - Error code (monospace)
   - Row data JSON preview (expandable)
   - Severity badge (red)

4. **Warnings Section** (Expandable)
   - Row number indicator
   - Field name
   - Warning message
   - Warning code (monospace)
   - Row data JSON preview (expandable)
   - Severity badge (orange)

5. **Actions**
   - Download Full Report (CSV) button

### Design Features

- **Color Coding**: Red for errors, Orange for warnings, Green for success
- **Responsive Layout**: Adapts to mobile, tablet, and desktop screens
- **Material Design**: Uses Angular Material components (mat-card, mat-expansion-panel, mat-chip, mat-icon, mat-button)
- **Smooth Animations**: Icon spinning for validation in progress, smooth expansions
- **Dark/Light Mode Support**: Uses Material theming
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

## Component API

### Inputs

```typescript
@Input() validationResult!: ValidationResult;
@Input() fileName?: string;
@Input() fileSize?: number;
```

#### validationResult (Required)
Type: `ValidationResult`

Contains validation results:
```typescript
interface ValidationResult {
  sessionId: string | null;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: {
    totalRows: number;
    validRows: number;
    errorRows: number;
  };
  expiresAt: string;
  canProceed: boolean;
}
```

#### fileName (Optional)
Type: `string`

Display name of the uploaded file (e.g., "departments_data.csv")

#### fileSize (Optional)
Type: `number`

File size in bytes. Will be automatically formatted to KB, MB, or GB.

### Outputs

```typescript
@Output() downloadReport = new EventEmitter<void>();
```

#### downloadReport
Emitted when user clicks the "Download Full Report (CSV)" button.

## Usage Example

### Basic Usage

```typescript
import { ValidationResultsComponent } from './validation-results.component';

@Component({
  selector: 'app-import-wizard-step-3',
  standalone: true,
  imports: [ValidationResultsComponent, CommonModule],
  template: `
    <app-validation-results
      [validationResult]="validationResult()"
      [fileName]="fileName()"
      [fileSize]="fileSize()"
      (downloadReport)="onDownloadReport()"
    />
  `
})
export class ImportWizardStep3Component {
  validationResult = signal<ValidationResult | null>(null);
  fileName = signal<string>('');
  fileSize = signal<number>(0);

  constructor(private systemInitService: SystemInitService) {}

  onDownloadReport(): void {
    // Handle report download
    const csv = this.generateCSVReport(this.validationResult());
    this.downloadFile(csv, 'validation-report.csv');
  }

  private downloadFile(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private generateCSVReport(result: ValidationResult | null): string {
    if (!result) return '';

    // Generate CSV with headers and error/warning details
    const rows = [];
    rows.push('Validation Report');
    rows.push(`Session ID,${result.sessionId}`);
    rows.push(`Total Rows,${result.stats.totalRows}`);
    rows.push(`Valid Rows,${result.stats.validRows}`);
    rows.push(`Error Count,${result.errors.length}`);
    rows.push(`Warning Count,${result.warnings.length}`);
    rows.push('');

    if (result.errors.length > 0) {
      rows.push('ERRORS');
      rows.push('Row,Field,Message,Code');
      result.errors.forEach(error => {
        rows.push(
          `${error.row || ''},${error.field || ''},${error.message},${error.code}`
        );
      });
      rows.push('');
    }

    if (result.warnings.length > 0) {
      rows.push('WARNINGS');
      rows.push('Row,Field,Message,Code');
      result.warnings.forEach(warning => {
        rows.push(
          `${warning.row || ''},${warning.field || ''},${warning.message},${warning.code}`
        );
      });
    }

    return rows.join('\n');
  }
}
```

### In Import Wizard Dialog

```typescript
import { ValidationResultsComponent } from '../validation-results/validation-results.component';

@Component({
  selector: 'app-import-wizard-dialog',
  standalone: true,
  imports: [
    ValidationResultsComponent,
    MatDialogModule,
    MatStepperModule,
    CommonModule,
    // ...
  ],
  template: `
    <mat-dialog-content>
      <mat-step>
        <ng-template matStepLabel>Validation Results</ng-template>

        <app-validation-results
          [validationResult]="validationResult()"
          [fileName]="selectedFile()?.name"
          [fileSize]="selectedFile()?.size"
          (downloadReport)="downloadValidationReport()"
        />
      </mat-step>
    </mat-dialog-content>
  `
})
export class ImportWizardDialog {
  validationResult = signal<ValidationResult | null>(null);
  selectedFile = signal<File | null>(null);

  async validateFile(file: File): Promise<void> {
    try {
      this.selectedFile.set(file);
      const result = await firstValueFrom(
        this.systemInitService.validateFile(this.moduleName, file)
      );
      this.validationResult.set(result);
    } catch (error) {
      console.error('Validation failed', error);
    }
  }

  downloadValidationReport(): void {
    // Implementation here
  }
}
```

## Type Definitions

### ValidationResult
```typescript
interface ValidationResult {
  sessionId: string | null;              // Session ID for tracking
  isValid: boolean;                       // Whether validation passed
  errors: ValidationError[];              // List of validation errors
  warnings: ValidationWarning[];          // List of validation warnings
  stats: {
    totalRows: number;                    // Total rows in file
    validRows: number;                    // Rows with no errors
    errorRows: number;                    // Rows with errors
  };
  expiresAt: string;                      // When validation expires (ISO string)
  canProceed: boolean;                    // Whether import can proceed despite warnings
}
```

### ValidationError
```typescript
interface ValidationError {
  row?: number;                           // Row number (1-indexed)
  field?: string;                         // Field name that failed validation
  message: string;                        // Human-readable error message
  severity: 'ERROR';                      // Always 'ERROR' for this type
  code: string;                           // Machine-readable error code
  data?: any;                             // The row data that caused the error
}
```

### ValidationWarning
```typescript
interface ValidationWarning {
  row?: number;                           // Row number (1-indexed)
  field?: string;                         // Field name with warning
  message: string;                        // Human-readable warning message
  severity: 'WARNING';                    // Always 'WARNING' for this type
  code: string;                           // Machine-readable warning code
  data?: any;                             // The row data associated with the warning
}
```

## Styling & Customization

### CSS Classes

The component uses the following CSS classes for styling:

- `.validation-results-container` - Main container
- `.header-section` - Header information
- `.summary-card` - Summary statistics card
- `.error-list` - Errors container
- `.warning-list` - Warnings container
- `.error-item` - Individual error item
- `.warning-item` - Individual warning item
- `.severity-badge` - Error/warning badge
- `.data-json` - JSON data display

### Customizing Colors

Override colors in your global styles or component styles:

```scss
// Errors
.validation-results-container {
  .error-header {
    background-color: #ffebee; // Light red
  }

  .error-item {
    border-left-color: #d32f2f; // Dark red
  }

  .error-severity {
    background-color: #ffcdd2; // Red badge
  }
}

// Warnings
.validation-results-container {
  .warning-header {
    background-color: #fff3e0; // Light orange
  }

  .warning-item {
    border-left-color: #f57c00; // Dark orange
  }

  .warning-severity {
    background-color: #ffe0b2; // Orange badge
  }
}

// Success
.validation-results-container {
  .status-badge.validation-passed {
    background-color: #c8e6c9; // Light green
    color: #2e7d32; // Dark green
  }
}
```

### Dark Mode

The component uses Material theming and automatically adapts to dark mode when enabled in your application's theme.

## Responsive Design

The component is fully responsive:

- **Desktop (≥1200px)**: Full layout with side-by-side columns
- **Tablet (768px-1199px)**: Adjusted grid layout
- **Mobile (<768px)**: Single column stack layout

### Mobile Features

- Stacked summary grid (2 columns)
- Full-width action buttons
- Smaller fonts for better readability
- Touch-friendly tap targets

## Accessibility

The component is WCAG 2.1 AA compliant:

- Semantic HTML structure
- ARIA labels on interactive elements
- Proper heading hierarchy
- Keyboard navigation support
  - Tab: Navigate through expandable sections
  - Enter: Expand/collapse sections
  - Space: Toggle details sections
- Screen reader support for status changes
- Color not used alone to convey information (badges include text/icons)
- Sufficient color contrast (tested against WCAG AA standards)

## Performance Considerations

- Uses `OnPush` change detection for optimal performance
- TrackBy functions implemented for `*ngFor` loops
- Large error/warning lists are virtualized via expansion panels
- No subscriptions (stateless component)
- Minimal DOM rendering

## Testing

### Unit Test Example

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidationResultsComponent } from './validation-results.component';
import { validationFailedExample } from './validation-results.examples';

describe('ValidationResultsComponent', () => {
  let component: ValidationResultsComponent;
  let fixture: ComponentFixture<ValidationResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationResultsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ValidationResultsComponent);
    component = fixture.componentInstance;
  });

  it('should display validation results', () => {
    component.validationResult = validationFailedExample;
    component.fileName = 'test.csv';
    component.fileSize = 1024000;
    fixture.detectChanges();

    expect(component.hasErrors).toBe(true);
    expect(component.hasWarnings).toBe(true);
  });

  it('should emit downloadReport event', (done) => {
    component.validationResult = validationFailedExample;
    component.downloadReport.subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    component.onDownloadReport();
  });

  it('should format file size correctly', () => {
    component.fileSize = 1024000; // 1 MB
    expect(component.formattedFileSize).toBe('1000.00 KB');

    component.fileSize = 1048576; // 1 MB (1024 * 1024)
    expect(component.formattedFileSize).toBe('1.00 MB');
  });
});
```

## Examples

See `validation-results.examples.ts` for complete usage examples with different validation scenarios:

1. Validation passed with no errors/warnings
2. Validation passed with warnings
3. Validation failed with errors
4. Complex validation with multiple error types

## Browser Support

- Chrome/Edge 100+
- Firefox 99+
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `@angular/core` >= 17
- `@angular/common` >= 17
- `@angular/material` >= 17

No external dependencies required beyond Angular Material.

## See Also

- [System Init Feature Documentation](../../README.md)
- [Import Wizard Dialog](../import-wizard/README.md)
- [System Init Types](../../types/system-init.types.ts)
- [Angular Material Expansion Panel](https://material.angular.io/components/expansion/overview)
- [Angular Material Card](https://material.angular.io/components/card/overview)
