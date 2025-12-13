# Module Card Component

A reusable Angular component that displays import module information with status tracking, progress visualization, and action buttons. Part of the System Initialization Dashboard.

## Overview

The Module Card Component presents a card-based UI for managing import modules. It supports multiple visual states, real-time progress tracking, and contextual actions based on the module's import status.

## Features

- **Multiple Visual States**: Not Started, In Progress, Completed, Failed
- **Status Badges**: Color-coded status indicators with icons
- **Progress Tracking**: Real-time progress bar for in-progress imports
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader friendly
- **Material Design**: Built with Angular Material components
- **TypeScript**: Fully typed component with proper interfaces

## Installation

The component is already part of the system-init feature module. To use it:

```typescript
import { ModuleCardComponent } from './module-card/module-card.component';
```

## Component API

### Inputs

```typescript
@Input() module!: ImportModule;
```

The module data to display. Must implement the `ImportModule` interface:

```typescript
interface ImportModule {
  module: string;                    // Unique module identifier
  domain: string;                    // Domain (e.g., 'inventory')
  subdomain?: string;                // Optional subdomain (e.g., 'master-data')
  displayName: string;               // User-friendly name
  displayNameThai?: string;          // Thai translation (optional)
  dependencies: string[];            // Module dependencies
  priority: number;                  // Import priority order
  importStatus: ImportModuleStatus;  // Current status
  recordCount: number;               // Total records
  lastImport?: {                     // Last successful import
    jobId: string;
    completedAt: string;             // ISO 8601 datetime
    importedBy: {
      id: string;
      name: string;
    };
  };
  progress?: {                       // Only for in_progress status
    totalRows: number;
    importedRows: number;
    percentComplete: number;
  };
  error?: string;                    // Only for failed status
}

type ImportModuleStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'failed';
```

### Outputs

```typescript
@Output() import = new EventEmitter<ImportModule>();
```
Emitted when user clicks "Start Import" button (not_started state).

```typescript
@Output() viewDetails = new EventEmitter<ImportModule>();
```
Emitted when user clicks:
- "View Progress" button (in_progress state)
- "View Details" button (completed state)
- "View Errors" button (failed state)

```typescript
@Output() rollback = new EventEmitter<ImportModule>();
```
Emitted when user clicks "Rollback" button (completed state only).

## Usage Examples

### Basic Usage

```html
<app-module-card
  [module]="module"
  (import)="onImport($event)"
  (viewDetails)="onViewDetails($event)"
  (rollback)="onRollback($event)"
/>
```

### In Grid Layout

```html
<div class="modules-grid">
  @for (module of modules$ | async; track module.module) {
    <app-module-card
      [module]="module"
      (import)="handleImport($event)"
      (viewDetails)="handleViewDetails($event)"
      (rollback)="handleRollback($event)"
    />
  }
</div>
```

### Component Class Integration

```typescript
import { Component, signal } from '@angular/core';
import { ModuleCardComponent, ImportModule } from './module-card/module-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ModuleCardComponent],
  template: `
    <app-module-card
      [module]="currentModule()"
      (import)="onImport($event)"
      (viewDetails)="onViewDetails($event)"
      (rollback)="onRollback($event)"
    />
  `
})
export class DashboardComponent {
  currentModule = signal<ImportModule>({
    module: 'departments',
    domain: 'inventory',
    subdomain: 'master-data',
    displayName: 'Departments',
    displayNameThai: 'แผนกต่างๆ',
    dependencies: [],
    priority: 1,
    importStatus: 'not_started',
    recordCount: 0
  });

  onImport(module: ImportModule) {
    console.log('Start import:', module);
    // Open import wizard dialog
  }

  onViewDetails(module: ImportModule) {
    console.log('View details:', module);
    // Open details/progress dialog
  }

  onRollback(module: ImportModule) {
    console.log('Rollback:', module);
    // Confirm and rollback import
  }
}
```

## Visual States

### Not Started
Default state when module hasn't been imported yet.
- Gray background with gray left border
- Shows priority and dependencies
- "Start Import" button available

```
┌─ Not Started ──────────────────┐
│ 📦 Drug Generics               │
│ inventory/master-data          │
│                                │
│ ⏸ Not Started                 │
│ 0 records                      │
│                                │
│ Priority: 2                    │
│ Dependencies: None             │
│                                │
│ [📥 Start Import]              │
└────────────────────────────────┘
```

### In Progress
Displayed while import is running.
- Blue background with blue left border
- Shows current progress with percentage
- Animated progress bar
- "View Progress" button available

```
┌─ In Progress ──────────────────┐
│ 📦 Locations                   │
│ inventory/master-data          │
│                                │
│ 🔄 In Progress                 │
│ 45 / 100 records (45%)         │
│                                │
│ ████████████░░░░░░░░           │
│                                │
│ [View Progress]                │
└────────────────────────────────┘
```

### Completed
Shown after successful import.
- Green background with green left border
- Shows record count, import date, and who imported it
- "View Details" and "Rollback" buttons available

```
┌─ Completed ────────────────────┐
│ 📦 Departments                 │
│ inventory/master-data          │
│                                │
│ ✅ Completed                   │
│ 50 records                     │
│                                │
│ Imported: 2025-12-13 11:00     │
│ By: admin@example.com          │
│                                │
│ [View Details] [Rollback]      │
└────────────────────────────────┘
```

### Failed
Displayed when import encounters errors.
- Red background with red left border
- Shows error message and last attempt timestamp
- "View Errors" and "Retry" buttons available

```
┌─ Failed ───────────────────────┐
│ 📦 Drug Generics               │
│ inventory/master-data          │
│                                │
│ ❌ Failed                      │
│ 0 records                      │
│                                │
│ Error: Duplicate codes         │
│ Last attempt: 2025-12-13 10:50 │
│                                │
│ [View Errors] [Retry]          │
└────────────────────────────────┘
```

## Styling

### CSS Custom Properties

The component uses CSS custom properties (CSS variables) that can be overridden:

```scss
:host {
  --card-min-height: 280px;
  --card-padding: 16px;
  --card-border-radius: 8px;

  /* Status colors */
  --status-not-started-bg: #f5f5f5;
  --status-in-progress-bg: #e3f2fd;
  --status-completed-bg: #e8f5e9;
  --status-failed-bg: #ffebee;
}
```

### Responsive Breakpoints

- **Desktop (1200px+)**: Full-featured card with all information visible
- **Tablet (768px-1199px)**: Optimized spacing and font sizes
- **Mobile (<768px)**: Single-column layout with stacked buttons

### Dark Mode

The component automatically adapts to dark mode if `prefers-color-scheme: dark` is enabled.

## Accessibility

- **ARIA Labels**: All buttons have proper `aria-label` attributes
- **Keyboard Navigation**: Full keyboard support with Tab and Enter keys
- **Screen Reader Support**: Status badges and buttons are properly announced
- **Focus Management**: Clear focus indicators for keyboard users
- **High Contrast Mode**: Automatically increases border widths in high contrast
- **Reduced Motion**: Respects `prefers-reduced-motion` preference

## Performance

- **OnPush Change Detection**: Optimized for performance with minimal change detection
- **Standalone Component**: Lightweight, no dependency on shared modules
- **Minimal Imports**: Only required Angular Material modules are imported
- **CSS Containment**: Uses CSS containment for better rendering performance

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Integration with System Init Service

The component works with the SystemInitService for data fetching:

```typescript
@Injectable({ providedIn: 'root' })
export class SystemInitService {
  getAvailableModules(): Observable<AvailableModulesResponse> {
    return this.http.get<AvailableModulesResponse>(
      `${this.baseUrl}/available-modules`
    );
  }
}

// In parent component:
this.systemInitService.getAvailableModules().subscribe(response => {
  this.modules.set(response.modules);
});
```

## Example: Module Card with Progress Tracking

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { ModuleCardComponent, ImportModule } from './module-card/module-card.component';
import { SystemInitService, ImportProgressService } from '../services/';

@Component({
  selector: 'app-module-example',
  standalone: true,
  imports: [CommonModule, ModuleCardComponent],
  template: `
    <div class="example-container">
      <app-module-card
        [module]="module()"
        (import)="startImport()"
        (viewDetails)="viewProgress()"
        (rollback)="confirmRollback()"
      />
    </div>
  `,
  styles: [`
    .example-container {
      max-width: 400px;
      margin: 20px auto;
    }
  `]
})
export class ModuleExampleComponent implements OnInit {
  module = signal<ImportModule>({
    module: 'departments',
    domain: 'inventory',
    subdomain: 'master-data',
    displayName: 'Departments',
    dependencies: [],
    priority: 1,
    importStatus: 'not_started',
    recordCount: 0
  });

  constructor(
    private systemInitService: SystemInitService,
    private importProgressService: ImportProgressService
  ) {}

  ngOnInit() {
    this.loadModuleData();
  }

  private loadModuleData() {
    this.systemInitService.getAvailableModules().subscribe(response => {
      const dept = response.modules.find(m => m.module === 'departments');
      if (dept) {
        this.module.set(dept);
      }
    });
  }

  startImport() {
    const module = this.module();
    console.log('Starting import for:', module.displayName);
    // Trigger import wizard dialog
  }

  viewProgress() {
    const module = this.module();
    if (module.importStatus === 'in_progress' && module.lastImport) {
      // Track progress
      this.importProgressService
        .trackProgress(module.module, module.lastImport.jobId)
        .subscribe(status => {
          console.log('Progress:', status.progress.percentComplete);
        });
    }
  }

  confirmRollback() {
    const module = this.module();
    if (confirm(`Are you sure you want to rollback ${module.displayName} import?`)) {
      // Call rollback API
    }
  }
}
```

## Testing

The component is designed to be easily testable:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModuleCardComponent, ImportModule } from './module-card.component';

describe('ModuleCardComponent', () => {
  let component: ModuleCardComponent;
  let fixture: ComponentFixture<ModuleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModuleCardComponent);
    component = fixture.componentInstance;
  });

  it('should display module name', () => {
    component.module = {
      module: 'test',
      domain: 'inventory',
      displayName: 'Test Module',
      dependencies: [],
      priority: 1,
      importStatus: 'not_started',
      recordCount: 0
    };
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Test Module');
  });

  it('should emit import event on button click', () => {
    spyOn(component.import, 'emit');
    component.module = {
      module: 'test',
      domain: 'inventory',
      displayName: 'Test Module',
      dependencies: [],
      priority: 1,
      importStatus: 'not_started',
      recordCount: 0
    };

    component.onImport();
    expect(component.import.emit).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Button not responding
- Ensure the module status is correctly set
- Check that event handlers are properly bound in parent component
- Verify Material modules are imported

### Styling issues
- Confirm Angular Material theme is loaded
- Check for CSS conflicts with TailwindCSS
- Verify custom CSS variables are properly scoped

### Progress bar not showing
- Ensure `importStatus === 'in_progress'`
- Verify `progress` object has correct structure with `percentComplete`
- Check that `MatProgressBarModule` is imported

## Related Components

- **ImportWizardDialog**: Handles the 4-step import workflow
- **ProgressTrackerComponent**: Real-time import progress display
- **ValidationResultsComponent**: Shows validation errors and warnings
- **ImportHistoryTimelineComponent**: Displays historical imports

## See Also

- [System Initialization Dashboard Spec](/docs/features/system-initialization/FRONTEND_SPECIFICATION.md)
- [System Init Service](/apps/web/src/app/features/system-init/services/)
- [Angular Material Card](https://material.angular.io/components/card/overview)
- [Module Card Examples](./examples/)

---

**Last Updated**: 2025-12-13
**Status**: Complete
**Maintenance**: Part of System Initialization Dashboard feature
