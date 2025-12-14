# System Initialization Services - Quick Start Guide

This guide shows how to immediately start using the newly implemented service layer.

## Importing Services

```typescript
// Single import for all services
import { SystemInitService, ImportProgressService, UserDepartmentsService } from './services';

// Or import individual services as needed
import { SystemInitService } from './services/system-init.service';
```

## Importing Types

```typescript
// Import all types from barrel export
import type {
  ImportModule,
  ValidationResult,
  ImportStatus,
  DashboardResponse,
  UserDepartment,
} from './types';

// Or import everything at once
import type * from './types';
```

## Service 1: SystemInitService

### Purpose

Main API service for all system initialization operations.

### Basic Usage

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { SystemInitService } from './services';
import type { DashboardResponse } from './types';

@Component({
  selector: 'app-dashboard',
  template: `
    <div *ngIf="loading()">Loading...</div>
    <div *ngIf="dashboard() as dash">
      <h1>{{ dash.overview.totalModules }} Modules</h1>
      <p>{{ dash.overview.completedModules }} Completed</p>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private systemInit = inject(SystemInitService);

  dashboard = signal<DashboardResponse | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.systemInit.getDashboard().subscribe({
      next: (data) => this.dashboard.set(data),
      error: (err) => console.error('Failed to load', err),
      finalize: () => this.loading.set(false),
    });
  }
}
```

### Common Methods

**Get Available Modules**

```typescript
this.systemInit.getAvailableModules().subscribe((response) => {
  console.log('Available modules:', response.modules);
  console.log('Total:', response.totalModules);
  console.log('Completed:', response.completedModules);
});
```

**Get Dashboard Data**

```typescript
this.systemInit.getDashboard().subscribe((data) => {
  console.log('Overview:', data.overview);
  console.log('Modules by domain:', data.modulesByDomain);
  console.log('Recent imports:', data.recentImports);
});
```

**Download Template**

```typescript
this.systemInit.downloadTemplate('departments', 'csv').subscribe((blob) => {
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'departments_template.csv';
  link.click();
  window.URL.revokeObjectURL(url);
});
```

**Validate File**

```typescript
const file = new File(['data'], 'data.csv');
this.systemInit.validateFile('departments', file).subscribe((result) => {
  if (result.isValid) {
    console.log('File is valid!');
    console.log('Session ID:', result.sessionId);
  } else {
    console.log('Validation errors:', result.errors);
  }
});
```

**Start Import**

```typescript
this.systemInit
  .importData('departments', sessionId, {
    skipWarnings: false,
    batchSize: 100,
    onConflict: 'skip',
  })
  .subscribe((job) => {
    console.log('Import started with job ID:', job.jobId);
    // Use job.jobId with ImportProgressService
  });
```

**Get Import Status**

```typescript
this.systemInit.getImportStatus('departments', jobId).subscribe((status) => {
  console.log('Progress:', status.progress.percentComplete, '%');
  console.log('Imported:', status.progress.importedRows);
  console.log('Status:', status.status);
});
```

**Rollback Import**

```typescript
this.systemInit.rollbackImport('departments', jobId).subscribe({
  next: () => console.log('Rollback successful'),
  error: (err) => console.error('Rollback failed', err),
});
```

## Service 2: ImportProgressService

### Purpose

Real-time progress tracking for import jobs.

### Basic Usage

```typescript
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImportProgressService } from './services';
import type { ImportStatus } from './types';

@Component({
  selector: 'app-progress',
  template: `
    <div *ngIf="status() as s">
      <p>Progress: {{ s.progress.percentComplete }}%</p>
      <p>{{ s.progress.importedRows }} / {{ s.progress.totalRows }}</p>
      <progress [value]="s.progress.percentComplete"></progress>
    </div>
  `,
})
export class ProgressComponent {
  private progress = inject(ImportProgressService);
  private destroy = inject(DestroyRef);

  status = signal<ImportStatus | null>(null);

  trackImport(moduleName: string, jobId: string) {
    this.progress
      .trackProgress(moduleName, jobId)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (status) => this.status.set(status),
        error: (err) => console.error('Tracking failed', err),
      });
  }
}
```

### Key Features

**Automatic Polling**

```typescript
// Polls every 2 seconds automatically
// Stops when job completes or fails
this.progress.trackProgress(moduleName, jobId).subscribe(...);
```

**Shared Subscriptions**

```typescript
// Multiple components can subscribe to the same job
// Only one polling stream is created (memory efficient)
const poller$ = this.progress.trackProgress(moduleName, jobId);

// In Component A
poller$.subscribe((status) => updateProgressA(status));

// In Component B
poller$.subscribe((status) => updateProgressB(status));
// Still only one HTTP request every 2 seconds!
```

**Manual Control**

```typescript
// Check if a job is being tracked
if (this.progress.isTracking(moduleName, jobId)) {
  console.log('Job is being tracked');
}

// Get number of active pollers
const activeCount = this.progress.getActivePollerCount();
console.log(`Currently tracking ${activeCount} jobs`);

// Stop tracking a specific job
this.progress.cancelTracking(moduleName, jobId);

// Stop all tracking
this.progress.cancelAllTracking();
```

## Service 3: UserDepartmentsService

### Purpose

Manage user-department relationships.

### Basic Usage

```typescript
import { Component, inject } from '@angular/core';
import { UserDepartmentsService } from './services';
import type { UserDepartment } from './types';

@Component({
  selector: 'app-user-depts',
})
export class UserDeptsComponent {
  private userDepts = inject(UserDepartmentsService);

  departments = signal<UserDepartment[]>([]);

  loadUserDepartments(userId: string) {
    this.userDepts.getUserDepartments(userId).subscribe((depts) => {
      this.departments.set(depts);
    });
  }
}
```

### Common Methods

**Get User's Departments**

```typescript
this.userDepts.getUserDepartments(userId).subscribe((departments) => {
  console.log('User departments:', departments);
  departments.forEach((dept) => {
    console.log(`- ${dept.name} (Primary: ${dept.isPrimary})`);
  });
});
```

**Assign Department to User**

```typescript
this.userDepts
  .assignDepartment(userId, {
    departmentId: 5,
    isPrimary: true,
  })
  .subscribe((dept) => {
    console.log('Department assigned:', dept.name);
  });
```

**Set Primary Department**

```typescript
this.userDepts.setPrimaryDepartment(userId, deptId).subscribe({
  next: () => console.log('Primary department updated'),
  error: (err) => console.error('Failed to update', err),
});
```

**Remove Department**

```typescript
this.userDepts.removeDepartment(userId, deptId).subscribe({
  next: () => console.log('Department removed'),
  error: (err) => console.error('Failed to remove', err),
});
```

**Get Users in Department**

```typescript
this.userDepts.getDepartmentUsers(deptId).subscribe((users) => {
  console.log('Users in department:', users);
  users.forEach((user) => {
    console.log(`- ${user.name} (${user.email})`);
  });
});
```

**Get Primary Department**

```typescript
this.userDepts.getPrimaryDepartment(userId).subscribe((dept) => {
  if (dept) {
    console.log('Primary department:', dept.name);
  } else {
    console.log('User has no primary department');
  }
});
```

## Complete Example: Import Wizard

```typescript
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SystemInitService, ImportProgressService } from './services';
import type { ValidationResult, ImportStatus } from './types';

@Component({
  selector: 'app-import-wizard',
  template: `
    <div class="wizard">
      <!-- Step 1: Download Template -->
      <div *ngIf="step() === 1">
        <button (click)="downloadTemplate('csv')">Download CSV</button>
        <button (click)="downloadTemplate('xlsx')">Download Excel</button>
        <button (click)="step.set(2)">Next</button>
      </div>

      <!-- Step 2: Upload File -->
      <div *ngIf="step() === 2">
        <input #fileInput type="file" (change)="onFileSelected($event)" hidden />
        <button (click)="fileInput.click()">
          {{ selectedFile()?.name || 'Select File' }}
        </button>
        <button (click)="validateFile()" [disabled]="!selectedFile()">Validate</button>
      </div>

      <!-- Step 3: Review Validation -->
      <div *ngIf="step() === 3">
        <div *ngIf="validationResult() as result">
          <p *ngIf="result.isValid">✓ File is valid</p>
          <p *ngIf="!result.isValid">✗ File has errors</p>
          <div *ngFor="let error of result.errors">
            <p>Error: {{ error.message }}</p>
          </div>
          <button (click)="startImport()" [disabled]="!result.canProceed">Start Import</button>
        </div>
      </div>

      <!-- Step 4: Show Progress -->
      <div *ngIf="step() === 4">
        <div *ngIf="importStatus() as status">
          <p>Progress: {{ status.progress.percentComplete }}%</p>
          <progress [value]="status.progress.percentComplete" max="100"></progress>
          <p>{{ status.progress.importedRows }} / {{ status.progress.totalRows }}</p>
        </div>
      </div>
    </div>
  `,
})
export class ImportWizardComponent {
  private systemInit = inject(SystemInitService);
  private progress = inject(ImportProgressService);
  private destroy = inject(DestroyRef);

  step = signal(1);
  selectedFile = signal<File | null>(null);
  validationResult = signal<ValidationResult | null>(null);
  importStatus = signal<ImportStatus | null>(null);
  sessionId = signal<string | null>(null);
  jobId = signal<string | null>(null);

  constructor() {
    // Start on step 1
  }

  downloadTemplate(format: 'csv' | 'xlsx') {
    this.systemInit.downloadTemplate('departments', format).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  validateFile() {
    const file = this.selectedFile();
    if (!file) return;

    this.systemInit.validateFile('departments', file).subscribe((result) => {
      this.validationResult.set(result);
      this.sessionId.set(result.sessionId);
      if (result.canProceed) {
        this.step.set(3);
      }
    });
  }

  startImport() {
    const sessionId = this.sessionId();
    if (!sessionId) return;

    this.systemInit
      .importData('departments', sessionId, {
        skipWarnings: false,
        batchSize: 100,
        onConflict: 'skip',
      })
      .subscribe((job) => {
        this.jobId.set(job.jobId);
        this.step.set(4);
        this.trackProgress(job.jobId);
      });
  }

  private trackProgress(jobId: string) {
    this.progress
      .trackProgress('departments', jobId)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((status) => {
        this.importStatus.set(status);

        if (status.status === 'completed') {
          console.log('Import completed!');
        } else if (status.status === 'failed') {
          console.log('Import failed:', status.error);
        }
      });
  }
}
```

## Error Handling

All services include error handling:

```typescript
this.systemInit.importData(module, sessionId, options).subscribe({
  next: (response) => {
    console.log('Import started');
  },
  error: (error) => {
    // error.status (HTTP status code)
    // error.error (response body)
    // error.message (error message)
    const message = error.error?.message || error.message || 'Unknown error';
    this.snackBar.open(message, 'Close', { duration: 5000 });
  },
});
```

## Memory Management

Always use `takeUntilDestroyed()` to prevent memory leaks:

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class MyComponent {
  private destroy = inject(DestroyRef);

  ngOnInit() {
    this.service.getData()
      .pipe(takeUntilDestroyed(this.destroy)) // <- Add this!
      .subscribe(...);
  }
}
```

## Best Practices

1. **Use Signals** for reactive state
2. **Use takeUntilDestroyed()** for subscription cleanup
3. **Handle errors** with proper messages
4. **Cache when needed** with `shareReplay(1)`
5. **Type everything** with imported types
6. **Check for null** when optional fields

## Next Steps

1. Look at `/README.md` for detailed documentation
2. Review the specification in `/docs/features/system-initialization/FRONTEND_SPECIFICATION.md`
3. Check existing examples in Angular components for patterns
4. Implement dashboard page component
5. Implement import wizard dialog

## Support

For detailed API documentation, see `README.md` in the system feature folder.
