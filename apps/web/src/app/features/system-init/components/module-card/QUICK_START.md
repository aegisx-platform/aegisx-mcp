# Module Card Component - Quick Start Guide

Get started with the Module Card Component in minutes.

## 1. Basic Usage (30 seconds)

```typescript
// Import the component
import { ModuleCardComponent } from './module-card/module-card.component';

// Use in your component
@Component({
  imports: [ModuleCardComponent],
  template: `
    <app-module-card
      [module]="myModule"
      (import)="onImport($event)"
      (viewDetails)="onViewDetails($event)"
      (rollback)="onRollback($event)"
    />
  `
})
export class MyDashboard {
  myModule: ImportModule = {
    module: 'departments',
    domain: 'inventory',
    displayName: 'Departments',
    dependencies: [],
    priority: 1,
    importStatus: 'not_started',
    recordCount: 0
  };

  onImport(module: ImportModule) {
    console.log('Import:', module);
  }

  onViewDetails(module: ImportModule) {
    console.log('View Details:', module);
  }

  onRollback(module: ImportModule) {
    console.log('Rollback:', module);
  }
}
```

## 2. With Grid Layout (1 minute)

```html
<div class="modules-grid">
  @for (module of modules(); track module.module) {
    <app-module-card
      [module]="module"
      (import)="handleImport($event)"
      (viewDetails)="handleViewDetails($event)"
      (rollback)="handleRollback($event)"
    />
  }
</div>

<style>
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;
}
</style>
```

## 3. Get Example Data (Instant)

```typescript
import { MOCK_DASHBOARD_MODULES } from './module-card.examples';

export class MyComponent {
  modules = signal(MOCK_DASHBOARD_MODULES); // 12 example modules!
}
```

## 4. Module States Reference

```typescript
// State 1: Not Started
const notStarted: ImportModule = {
  module: 'drug_generics',
  domain: 'inventory',
  subdomain: 'master-data',
  displayName: 'Drug Generics',
  dependencies: [],
  priority: 2,
  importStatus: 'not_started',
  recordCount: 0
};

// State 2: In Progress
const inProgress: ImportModule = {
  module: 'locations',
  domain: 'inventory',
  displayName: 'Locations',
  dependencies: [],
  priority: 1,
  importStatus: 'in_progress',
  recordCount: 0,
  progress: {
    totalRows: 100,
    importedRows: 45,
    percentComplete: 45
  }
};

// State 3: Completed
const completed: ImportModule = {
  module: 'departments',
  domain: 'inventory',
  displayName: 'Departments',
  dependencies: [],
  priority: 1,
  importStatus: 'completed',
  recordCount: 50,
  lastImport: {
    jobId: 'job-uuid',
    completedAt: '2025-12-13T11:00:00Z',
    importedBy: {
      id: 'user-uuid',
      name: 'admin@example.com'
    }
  }
};

// State 4: Failed
const failed: ImportModule = {
  module: 'drug_brands',
  domain: 'inventory',
  displayName: 'Drug Brands',
  dependencies: [],
  priority: 3,
  importStatus: 'failed',
  recordCount: 0,
  error: 'Duplicate codes found',
  lastImport: {
    jobId: 'job-uuid',
    completedAt: '2025-12-13T10:50:00Z',
    importedBy: {
      id: 'user-uuid',
      name: 'admin@example.com'
    }
  }
};
```

## 5. Common Tasks

### Handle Import Start
```typescript
onImport(module: ImportModule) {
  console.log('Starting import for:', module.displayName);
  // Open import wizard dialog
  this.dialog.open(ImportWizardDialog, {
    data: { module }
  });
}
```

### Handle View Details
```typescript
onViewDetails(module: ImportModule) {
  switch (module.importStatus) {
    case 'in_progress':
      // Show progress tracker
      this.showProgressDialog(module);
      break;
    case 'completed':
      // Show import details
      this.showDetailsDialog(module);
      break;
    case 'failed':
      // Show error details
      this.showErrorDialog(module);
      break;
  }
}
```

### Handle Rollback
```typescript
onRollback(module: ImportModule) {
  if (confirm('Rollback this import?')) {
    this.systemInitService
      .rollbackImport(module.module, module.lastImport.jobId)
      .subscribe(() => {
        this.loadModules(); // Refresh
      });
  }
}
```

## 6. Styling Customization

### Change Colors

```scss
// Override in your component styles
::ng-deep .module-card {
  &-not-started {
    background-color: #f0f0f0; // Your color
  }
  &-in-progress {
    background-color: #e0f2f1; // Your color
  }
}
```

### Change Card Size

```html
<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
  <!-- Cards will be narrower in 2-column layout -->
</div>
```

## 7. Testing with Mock Data

```typescript
import { MOCK_DASHBOARD_MODULES } from './module-card.examples';

describe('Dashboard with Module Cards', () => {
  it('should display all modules', () => {
    component.modules.set(MOCK_DASHBOARD_MODULES);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(
      By.directive(ModuleCardComponent)
    );
    expect(cards.length).toBe(12); // 12 mock modules
  });
});
```

## 8. API Reference (Cheat Sheet)

### Inputs
```typescript
@Input() module!: ImportModule;
```

### Outputs
```typescript
@Output() import = new EventEmitter<ImportModule>();
@Output() viewDetails = new EventEmitter<ImportModule>();
@Output() rollback = new EventEmitter<ImportModule>();
```

### Template Usage
```html
<app-module-card
  [module]="moduleObject"        <!-- Required: Import module data -->
  (import)="handleImport($event)"        <!-- Emitted on Start/Retry -->
  (viewDetails)="handleDetails($event)"  <!-- Emitted on View action -->
  (rollback)="handleRollback($event)"    <!-- Emitted on Rollback -->
/>
```

## 9. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Navigate between buttons |
| Enter | Activate focused button |
| Space | Activate focused button |

## 10. Accessibility

- All buttons have `aria-label` attributes
- Use keyboard (Tab/Enter) to navigate
- Screen reader announces status
- High contrast mode compatible
- Reduced motion respected

## Common Issues & Solutions

### Button not responding?
- Check `importStatus` is one of: 'not_started', 'in_progress', 'completed', 'failed'
- Verify event handler is bound: `(import)="handler($event)"`
- Check Angular Material is imported

### Styling not applying?
- Verify Angular Material theme is loaded globally
- Check for CSS conflicts
- Use `::ng-deep` for component style overrides

### Progress bar not showing?
- Ensure `importStatus === 'in_progress'`
- Check `progress` object has `percentComplete` field (0-100)
- Verify `MatProgressBarModule` is imported

## Need Help?

- See full docs: `README.md`
- Integration examples: `INTEGRATION_GUIDE.md`
- Example data: `module-card.examples.ts`
- Test examples: `module-card.component.spec.ts`

## Files

| File | Purpose |
|------|---------|
| `module-card.component.ts` | Main component logic |
| `module-card.component.html` | Template |
| `module-card.component.scss` | Styles |
| `README.md` | Full documentation |
| `INTEGRATION_GUIDE.md` | Integration guide |
| `module-card.examples.ts` | Example data |

---

**Time to implement**: ~5 minutes
**Time to customize**: ~15 minutes
**Complexity**: Beginner-friendly

Ready to go! Start with Step 1 above.
