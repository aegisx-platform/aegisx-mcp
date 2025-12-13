# Validation Results Component - Quick Reference

## Component Overview

**Selector**: `app-validation-results`

**Module**: Standalone component (no NgModule required)

**Change Detection**: OnPush

**Styling**: SCSS with Material Design + TailwindCSS compatibility

## Basic Usage

```html
<app-validation-results
  [validationResult]="validationResult()"
  [fileName]="'departments.csv'"
  [fileSize]="1024000"
  (downloadReport)="onDownloadReport()"
/>
```

## Component API

### Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `validationResult` | `ValidationResult` | Yes | Validation result with errors/warnings |
| `fileName` | `string` | No | Display name of uploaded file |
| `fileSize` | `number` | No | File size in bytes (auto-formats to KB/MB/GB) |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `downloadReport` | `EventEmitter<void>` | Emitted when download button clicked |

### Public Properties

| Name | Type | Description |
|------|------|-------------|
| `validationPassed` | `boolean` | True if validation passed |
| `hasErrors` | `boolean` | True if errors exist |
| `hasWarnings` | `boolean` | True if warnings exist |
| `formattedFileSize` | `string` | Formatted file size (e.g., "1.25 MB") |
| `statusIcon` | `string` | Material icon name for status |
| `statusLabel` | `string` | Display label for validation status |
| `summary` | `object` | Stats: totalRows, validRows, errorRows, errorCount, warningCount |

## Type Definitions

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

interface ValidationError {
  row?: number;
  field?: string;
  message: string;
  severity: 'ERROR';
  code: string;
  data?: any;
}

interface ValidationWarning {
  row?: number;
  field?: string;
  message: string;
  severity: 'WARNING';
  code: string;
  data?: any;
}
```

## Display Features

### When Validation Passes (No Errors)
- ✅ Green success badge
- Summary shows all valid rows
- No error/warning sections rendered
- Can proceed with import

### When Validation Has Warnings Only
- ⚠️ Yellow/orange warning badge
- Summary shows warnings count
- Only warnings section rendered
- Can proceed with import

### When Validation Fails (Has Errors)
- ❌ Red failure badge
- Summary shows error count
- Error section expanded by default
- Warning section shown if any
- Cannot proceed until errors fixed

## Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Success | #2e7d32 (green) | Validation passed, valid rows |
| Error | #c62828 (red) | Validation failed, errors |
| Warning | #e65100 (orange) | Warnings, caution states |
| Neutral | #757575 (gray) | Text, labels |

## Responsive Breakpoints

| Size | Width | Grid | Font |
|------|-------|------|------|
| Mobile | <480px | 2 col | 70% |
| Tablet | 480-768px | 2 col | 80% |
| Desktop | >768px | varies | 100% |

## Quick Integration Examples

### In Import Wizard Dialog (Step 3)

```typescript
@Component({
  selector: 'app-import-wizard',
  imports: [ValidationResultsComponent, MatStepperModule, ...],
})
export class ImportWizardDialog {
  validationResult = signal<ValidationResult | null>(null);
  selectedFile = signal<File | null>(null);

  // After validation
  async validateFile(file: File) {
    const result = await this.systemInitService.validateFile('module', file);
    this.validationResult.set(result);
    this.selectedFile.set(file);
  }

  onDownloadReport() {
    const csv = this.generateValidationReport();
    this.downloadFile(csv, 'validation-report.csv');
  }
}
```

### As Standalone Page

```typescript
@Component({
  selector: 'app-validation-page',
  imports: [ValidationResultsComponent, ...],
  template: `
    <app-validation-results
      [validationResult]="result()"
      (downloadReport)="download()"
    />
  `
})
export class ValidationPageComponent {
  result = signal<ValidationResult | null>(null);

  download() {
    // Handle download
  }
}
```

## Error Handling

```typescript
// Try validation
try {
  const result = await firstValueFrom(
    this.systemInitService.validateFile(moduleName, file)
  );

  if (result.isValid || result.canProceed) {
    // Show success message
    this.snackBar.open('Validation passed', 'Close', {duration: 3000});
    this.nextStep();
  } else {
    // Show validation results with errors
    this.validationResult.set(result);
  }
} catch (error) {
  this.snackBar.open('Validation failed', 'Close', {duration: 5000});
}
```

## Common Methods

### Format JSON Data
```typescript
formatDataForDisplay(data: any): string
```
Returns JSON string for preview, or 'N/A' if null/undefined

### Check if Data Should Display
```typescript
shouldShowData(data: any): boolean
```
Returns true if data exists and is not null/undefined

### Download Report Handler
```typescript
onDownloadReport(): void
```
Emits downloadReport event

## CSS Customization

### Override Error Color
```scss
.validation-results-container {
  .error-item {
    border-left-color: #d32f2f;
  }
}
```

### Override Warning Color
```scss
.validation-results-container {
  .warning-item {
    border-left-color: #f57c00;
  }
}
```

### Override Summary Card
```scss
.summary-card {
  background: your-color;
  border-color: your-color;
}
```

## Testing

### Basic Test Setup
```typescript
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
    component.validationResult = mockValidationResult;
    fixture.detectChanges();

    expect(component.hasErrors).toBe(true);
  });
});
```

## File Size Formatting

Auto-formats file sizes to appropriate units:

| Bytes | Formatted |
|-------|-----------|
| 512 | 512.00 B |
| 1024 | 1.00 KB |
| 1048576 | 1.00 MB |
| 1073741824 | 1.00 GB |

## Accessibility Features

- WCAG 2.1 AA compliant
- Keyboard navigable (Tab, Enter, Space)
- Screen reader friendly
- High contrast support
- Semantic HTML
- ARIA labels on interactive elements

## Performance

- OnPush change detection
- No subscriptions
- TrackBy functions implemented
- Efficient DOM rendering
- CSS animations (not JS)
- Lazy expansion panel rendering

## Browser Support

- Chrome/Edge 100+
- Firefox 99+
- Safari 15+
- iOS Safari 15+
- Chrome Mobile latest

## Dependencies

```json
{
  "@angular/core": "^17.0.0",
  "@angular/common": "^17.0.0",
  "@angular/material": "^17.0.0"
}
```

No additional dependencies required.

## Common Issues & Solutions

### Component Not Showing
**Problem**: Component doesn't render
**Solution**: Ensure validationResult input is set and change detection triggered

### Styling Not Applied
**Problem**: Colors/spacing not showing
**Solution**: Verify Material theme is loaded and ViewEncapsulation is correct

### Events Not Firing
**Problem**: downloadReport event not emitted
**Solution**: Check signal usage and Change Detection is OnPush

### File Size Wrong
**Problem**: File size shows as 0
**Solution**: Pass fileSize in bytes, not formatted string

## Documentation Links

- **Full Documentation**: README.md
- **Integration Guide**: INTEGRATION.md
- **Test Examples**: validation-results.component.spec.ts
- **Usage Examples**: validation-results.examples.ts
- **Implementation Details**: IMPLEMENTATION_SUMMARY.md

## Quick Checklist for Integration

- [ ] Import ValidationResultsComponent
- [ ] Add to component imports array
- [ ] Create validationResult signal
- [ ] Pass validationResult to component
- [ ] Pass fileName and fileSize (optional)
- [ ] Implement downloadReport handler
- [ ] Test with various validation scenarios
- [ ] Test responsive design on mobile
- [ ] Test keyboard navigation
- [ ] Test screen reader

## Support

For issues or questions:
1. Check README.md for detailed documentation
2. Review INTEGRATION.md for usage patterns
3. Look at validation-results.examples.ts for scenarios
4. Check component spec.ts for test examples
