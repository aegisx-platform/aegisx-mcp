# Validation Results Component - Integration Guide

This guide explains how to integrate the Validation Results Component into the Import Wizard and other parts of the System Initialization feature.

## Quick Integration

### 1. Import the Component

```typescript
import { ValidationResultsComponent } from './validation-results/validation-results.component';

@Component({
  selector: 'app-import-wizard',
  standalone: true,
  imports: [
    ValidationResultsComponent,
    // ... other imports
  ],
  template: '...',
})
export class ImportWizardDialog {
  // ...
}
```

### 2. Add to Template

```html
<mat-step>
  <ng-template matStepLabel>Validation Results</ng-template>

  <app-validation-results
    [validationResult]="validationResult()"
    [fileName]="selectedFile()?.name"
    [fileSize]="selectedFile()?.size"
    (downloadReport)="downloadValidationReport()"
  />
</mat-step>
```

### 3. Implement Component Logic

```typescript
export class ImportWizardDialog {
  // Validation state
  validationResult = signal<ValidationResult | null>(null);
  selectedFile = signal<File | null>(null);

  // Validate file on step 3
  async validateFile(file: File): Promise<void> {
    try {
      this.selectedFile.set(file);
      const result = await firstValueFrom(
        this.systemInitService.validateFile(
          this.data.module.module,
          file
        )
      );
      this.validationResult.set(result);

      // Move to next step if validation passed
      if (result.isValid || result.canProceed) {
        this.currentStep.set(4);
      }
    } catch (error) {
      this.snackBar.open('Validation failed', 'Close', { duration: 5000 });
    }
  }

  downloadValidationReport(): void {
    const result = this.validationResult();
    if (!result) return;

    const csv = this.generateCSVReport(result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `validation-report-${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private generateCSVReport(result: ValidationResult): string {
    const rows: string[] = [];

    // Header
    rows.push('Validation Report');
    rows.push(`Generated: ${new Date().toISOString()}`);
    rows.push(`Session ID: ${result.sessionId}`);
    rows.push('');

    // Summary
    rows.push('SUMMARY');
    rows.push(`Total Rows,${result.stats.totalRows}`);
    rows.push(`Valid Rows,${result.stats.validRows}`);
    rows.push(`Error Rows,${result.stats.errorRows}`);
    rows.push(`Total Errors,${result.errors.length}`);
    rows.push(`Total Warnings,${result.warnings.length}`);
    rows.push('');

    // Errors
    if (result.errors.length > 0) {
      rows.push('ERRORS');
      rows.push('Row,Field,Message,Code');
      result.errors.forEach(error => {
        const rowNum = error.row || '';
        const field = error.field || '';
        const message = error.message.replace(/,/g, ';');
        rows.push(`${rowNum},${field},${message},${error.code}`);
      });
      rows.push('');
    }

    // Warnings
    if (result.warnings.length > 0) {
      rows.push('WARNINGS');
      rows.push('Row,Field,Message,Code');
      result.warnings.forEach(warning => {
        const rowNum = warning.row || '';
        const field = warning.field || '';
        const message = warning.message.replace(/,/g, ';');
        rows.push(`${rowNum},${field},${message},${warning.code}`);
      });
    }

    return rows.join('\n');
  }
}
```

## Usage in Different Contexts

### As Part of Import Wizard Dialog (Recommended)

```typescript
@Component({
  selector: 'app-import-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatStepperModule,
    MatButtonModule,
    CommonModule,
    ValidationResultsComponent,
  ],
  template: `
    <h2 mat-dialog-title>Import Wizard - Step 3</h2>

    <mat-dialog-content>
      <mat-stepper #stepper>
        <!-- Step 1: Download Template -->
        <mat-step>
          <ng-template matStepLabel>Download Template</ng-template>
          <!-- Template download UI -->
        </mat-step>

        <!-- Step 2: Upload File -->
        <mat-step>
          <ng-template matStepLabel>Upload File</ng-template>
          <!-- File upload UI -->
        </mat-step>

        <!-- Step 3: Validation Results -->
        <mat-step>
          <ng-template matStepLabel>Validation Results</ng-template>

          <app-validation-results
            *ngIf="validationResult() as result"
            [validationResult]="result"
            [fileName]="selectedFile()?.name"
            [fileSize]="selectedFile()?.size"
            (downloadReport)="downloadValidationReport()"
          />

          <div class="step-actions">
            <button mat-button (click)="stepper.previous()">Back</button>
            <button
              mat-raised-button
              color="primary"
              (click)="stepper.next()"
              [disabled]="!canProceedToStep4()"
            >
              Next: Confirm Import
            </button>
          </div>
        </mat-step>

        <!-- Step 4: Confirm Import -->
        <mat-step>
          <ng-template matStepLabel>Confirm Import</ng-template>
          <!-- Confirmation UI -->
        </mat-step>
      </mat-stepper>
    </mat-dialog-content>
  `,
})
export class ImportWizardDialog {
  validationResult = signal<ValidationResult | null>(null);
  selectedFile = signal<File | null>(null);

  canProceedToStep4(): boolean {
    const result = this.validationResult();
    return result !== null && (result.isValid || result.canProceed);
  }
}
```

### As Standalone Page Component

```typescript
@Component({
  selector: 'app-validation-results-page',
  standalone: true,
  imports: [
    CommonModule,
    ValidationResultsComponent,
    MatButtonModule,
  ],
  template: `
    <div class="page-container">
      <h1>Validation Results</h1>

      <app-validation-results
        *ngIf="validationResult() as result"
        [validationResult]="result"
        [fileName]="fileName()"
        [fileSize]="fileSize()"
        (downloadReport)="downloadValidationReport()"
      />

      <div class="page-actions">
        <button mat-stroked-button (click)="goBack()">Back to Import</button>
      </div>
    </div>
  `,
})
export class ValidationResultsPageComponent {
  validationResult = signal<ValidationResult | null>(null);
  fileName = signal<string>('');
  fileSize = signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loadValidationResult();
  }

  private loadValidationResult(): void {
    // Load from route state or service
  }

  downloadValidationReport(): void {
    // Implementation
  }

  goBack(): void {
    this.router.navigate(['/admin/system-init']);
  }
}
```

### In Module Details View

```typescript
@Component({
  selector: 'app-module-details',
  standalone: true,
  imports: [
    CommonModule,
    ValidationResultsComponent,
    MatTabsModule,
  ],
  template: `
    <mat-tab-group>
      <mat-tab label="Module Info">
        <!-- Module information -->
      </mat-tab>

      <mat-tab label="Last Import Validation">
        <app-validation-results
          *ngIf="lastValidationResult() as result"
          [validationResult]="result"
          [fileName]="lastFileName()"
          [fileSize]="lastFileSize()"
          (downloadReport)="downloadLastValidationReport()"
        />
      </mat-tab>

      <mat-tab label="Import History">
        <!-- History timeline -->
      </mat-tab>
    </mat-tab-group>
  `,
})
export class ModuleDetailsComponent {
  lastValidationResult = signal<ValidationResult | null>(null);
  lastFileName = signal<string>('');
  lastFileSize = signal<number>(0);

  constructor(
    private systemInitService: SystemInitService,
    private route: ActivatedRoute
  ) {
    this.loadModuleDetails();
  }

  private loadModuleDetails(): void {
    // Load module details including last validation
  }

  downloadLastValidationReport(): void {
    // Implementation
  }
}
```

## State Management Integration

### Using Signals (Recommended)

```typescript
export class ImportWizardComponent {
  // File upload state
  selectedFile = signal<File | null>(null);

  // Validation state
  isValidating = signal(false);
  validationResult = signal<ValidationResult | null>(null);
  validationError = signal<string | null>(null);

  // Step navigation
  currentStep = signal(1);

  // Computed signals
  canProceedToNextStep = computed(() => {
    const step = this.currentStep();
    switch (step) {
      case 2:
        return this.selectedFile() !== null;
      case 3:
        const result = this.validationResult();
        return result !== null && (result.isValid || result.canProceed);
      default:
        return true;
    }
  });

  async validateFile(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    this.isValidating.set(true);
    this.validationError.set(null);

    try {
      const result = await firstValueFrom(
        this.systemInitService.validateFile(this.moduleName, file)
      );
      this.validationResult.set(result);
    } catch (error: any) {
      this.validationError.set(
        error.error?.message || 'Validation failed'
      );
    } finally {
      this.isValidating.set(false);
    }
  }
}
```

### With Service State Management

```typescript
@Injectable({
  providedIn: 'root'
})
export class ImportWizardStateService {
  private validationResultSubject = new BehaviorSubject<ValidationResult | null>(null);
  validationResult$ = this.validationResultSubject.asObservable();

  constructor(private systemInitService: SystemInitService) {}

  async validateFile(moduleName: string, file: File): Promise<ValidationResult> {
    const result = await firstValueFrom(
      this.systemInitService.validateFile(moduleName, file)
    );
    this.validationResultSubject.next(result);
    return result;
  }

  getValidationResult(): ValidationResult | null {
    return this.validationResultSubject.value;
  }

  clearValidationResult(): void {
    this.validationResultSubject.next(null);
  }
}
```

## Error Handling Patterns

### Handling Validation Errors

```typescript
async validateFile(): Promise<void> {
  this.isValidating.set(true);

  try {
    const result = await firstValueFrom(
      this.systemInitService.validateFile(this.moduleName, this.selectedFile()!)
    );

    if (result.isValid) {
      this.snackBar.open('Validation passed', 'Close', { duration: 3000 });
      this.currentStep.set(4);
    } else if (result.canProceed) {
      this.snackBar.open('Validation passed with warnings', 'Close', { duration: 3000 });
      // Show user the option to proceed
    } else {
      this.snackBar.open('Validation failed - fix errors before proceeding', 'Close', { duration: 5000 });
      // Show validation results with errors
    }

    this.validationResult.set(result);
  } catch (error: any) {
    const message = error.error?.message || 'Validation failed unexpectedly';
    this.snackBar.open(message, 'Close', { duration: 5000 });
    this.validationError.set(message);
  } finally {
    this.isValidating.set(false);
  }
}
```

## Report Generation

### CSV Report Export

```typescript
generateCSVReport(result: ValidationResult): string {
  const lines: string[] = [];

  // Header with metadata
  lines.push('Validation Report');
  lines.push(`Generated,${new Date().toISOString()}`);
  lines.push(`Session ID,${result.sessionId}`);
  lines.push('');

  // Summary section
  lines.push('SUMMARY');
  lines.push('Metric,Value');
  lines.push(`Total Rows,${result.stats.totalRows}`);
  lines.push(`Valid Rows,${result.stats.validRows}`);
  lines.push(`Error Rows,${result.stats.errorRows}`);
  lines.push(`Total Errors,${result.errors.length}`);
  lines.push(`Total Warnings,${result.warnings.length}`);
  lines.push(`Status,${result.isValid ? 'PASSED' : 'FAILED'}`);
  lines.push(`Can Proceed,${result.canProceed ? 'YES' : 'NO'}`);
  lines.push('');

  // Errors section
  if (result.errors.length > 0) {
    lines.push('ERRORS');
    lines.push('"Row","Field","Message","Code","Data"');
    result.errors.forEach(error => {
      const row = error.row || '';
      const field = error.field || '';
      const message = error.message.replace(/"/g, '""');
      const data = JSON.stringify(error.data || {}).replace(/"/g, '""');
      lines.push(`"${row}","${field}","${message}","${error.code}","${data}"`);
    });
    lines.push('');
  }

  // Warnings section
  if (result.warnings.length > 0) {
    lines.push('WARNINGS');
    lines.push('"Row","Field","Message","Code","Data"');
    result.warnings.forEach(warning => {
      const row = warning.row || '';
      const field = warning.field || '';
      const message = warning.message.replace(/"/g, '""');
      const data = JSON.stringify(warning.data || {}).replace(/"/g, '""');
      lines.push(`"${row}","${field}","${message}","${warning.code}","${data}"`);
    });
  }

  return lines.join('\n');
}
```

### JSON Report Export

```typescript
generateJSONReport(result: ValidationResult): string {
  const report = {
    metadata: {
      generatedAt: new Date().toISOString(),
      sessionId: result.sessionId,
    },
    summary: {
      totalRows: result.stats.totalRows,
      validRows: result.stats.validRows,
      errorRows: result.stats.errorRows,
      totalErrors: result.errors.length,
      totalWarnings: result.warnings.length,
      status: result.isValid ? 'PASSED' : 'FAILED',
      canProceed: result.canProceed,
    },
    errors: result.errors,
    warnings: result.warnings,
  };

  return JSON.stringify(report, null, 2);
}
```

## Testing Integration

### Example Test Setup

```typescript
describe('ImportWizardDialog with ValidationResults', () => {
  let component: ImportWizardDialog;
  let fixture: ComponentFixture<ImportWizardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ImportWizardDialog,
        ValidationResultsComponent,
      ],
      providers: [
        {
          provide: SystemInitService,
          useValue: {
            validateFile: jasmine.createSpy('validateFile')
              .and.returnValue(of(validationFailedExample)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportWizardDialog);
    component = fixture.componentInstance;
  });

  it('should display validation results on step 3', async () => {
    // Upload a file
    component.selectedFile.set(new File(['test'], 'test.csv'));

    // Move to step 3
    component.currentStep.set(3);

    // Validate
    await component.validateFile();
    fixture.detectChanges();

    // Assert validation results are displayed
    const validationComponent = fixture.debugElement.query(
      By.directive(ValidationResultsComponent)
    );
    expect(validationComponent).toBeTruthy();
  });

  it('should emit downloadReport event', (done) => {
    const validationComponent = fixture.debugElement.query(
      By.directive(ValidationResultsComponent)
    ).componentInstance;

    validationComponent.downloadReport.subscribe(() => {
      expect(true).toBe(true);
      done();
    });

    validationComponent.onDownloadReport();
  });
});
```

## Performance Optimization

### Lazy Loading

```typescript
const routes: Routes = [
  {
    path: 'import-wizard',
    loadComponent: () =>
      import('./import-wizard.component').then(m => m.ImportWizardDialog),
  },
  {
    path: 'validation-results',
    loadComponent: () =>
      import('./validation-results/validation-results.component').then(
        m => m.ValidationResultsComponent
      ),
  },
];
```

### Virtual Scrolling for Large Lists

For imports with thousands of errors/warnings, consider virtual scrolling:

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [
    ValidationResultsComponent,
    ScrollingModule,
  ],
  template: `
    <cdk-virtual-scroll-viewport itemSize="100" class="error-list">
      <div *cdkVirtualFor="let error of validationResult().errors"
           class="error-item">
        <!-- Error display -->
      </div>
    </cdk-virtual-scroll-viewport>
  `,
})
export class LargeValidationResultsComponent {
  // ...
}
```

## Accessibility Notes

- Component is fully keyboard navigable
- Screen reader support for status and severity badges
- ARIA labels automatically applied to interactive elements
- Focus management in expansion panels
- Color contrast meets WCAG AA standards

## Troubleshooting

### Component Not Displaying

Ensure:
1. ValidationResultsComponent is imported in your component
2. validationResult input is set with a valid ValidationResult object
3. Change detection is triggered (Angular Material modules are imported)

### Styling Issues

If styles don't apply:
1. Check that ViewEncapsulation is set correctly
2. Ensure Material theme is loaded globally
3. Verify TailwindCSS classes are available
4. Check z-index if expansion panels overlap

### Event Not Firing

Ensure:
1. downloadReport output is properly bound in template
2. Method signature is correct in parent component
3. Change detection is OnPush - signals must be used

## Related Components

- Import Wizard Dialog
- Module Card Component
- Import History Timeline
- Progress Tracker Component
