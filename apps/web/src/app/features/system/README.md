# System Initialization Feature

This feature provides the Angular frontend implementation for the System Initialization Dashboard, enabling administrators to manage data imports through the Auto-Discovery Import System.

## Overview

The System Initialization feature allows admins to:

- Discover available modules for import
- Download import templates (CSV/Excel)
- Validate import files before uploading
- Execute imports with real-time progress tracking
- Rollback completed imports
- Monitor import history and system health

## Architecture

### Folder Structure

```
system/
├── types/
│   ├── system-init.types.ts    # All type definitions
│   └── index.ts                 # Barrel export
├── services/
│   ├── system-init.service.ts                  # Main API service (9 endpoints)
│   ├── import-progress.service.ts              # Real-time progress polling
│   ├── user-departments.service.ts             # User-department management
│   └── index.ts                 # Barrel export
├── pages/
│   └── system-init-dashboard/   # (To be implemented)
├── components/
│   ├── module-card/             # (To be implemented)
│   ├── import-wizard/           # (To be implemented)
│   ├── progress-tracker/        # (To be implemented)
│   ├── import-history-timeline/ # (To be implemented)
│   └── validation-results/      # (To be implemented)
├── system.routes.ts             # Routing configuration
├── system.config.ts
├── system-shell.component.ts
├── index.ts                     # Barrel export
└── README.md
```

## Services

### SystemInitService

Main service for all system initialization API calls.

```typescript
import { SystemInitService } from './services';

export class MyComponent {
  constructor(private systemInit: SystemInitService) {}

  loadDashboard() {
    this.systemInit.getDashboard().subscribe((data) => {
      console.log(data.overview);
    });
  }
}
```

#### Methods

| Method                                       | Description                        | Returns                                |
| -------------------------------------------- | ---------------------------------- | -------------------------------------- |
| `getAvailableModules()`                      | Get all available modules          | `Observable<AvailableModulesResponse>` |
| `getImportOrder()`                           | Get recommended import order       | `Observable<ImportOrderResponse>`      |
| `getDashboard()`                             | Get dashboard overview and history | `Observable<DashboardResponse>`        |
| `downloadTemplate(moduleName, format)`       | Download CSV/Excel template        | `Observable<Blob>`                     |
| `validateFile(moduleName, file)`             | Validate import file               | `Observable<ValidationResult>`         |
| `importData(moduleName, sessionId, options)` | Start import job                   | `Observable<ImportJobResponse>`        |
| `getImportStatus(moduleName, jobId)`         | Get import progress                | `Observable<ImportStatus>`             |
| `rollbackImport(moduleName, jobId)`          | Undo completed import              | `Observable<void>`                     |
| `getHealth()`                                | Check system health                | `Observable<HealthResponse>`           |

### ImportProgressService

Real-time progress tracking for import jobs with automatic polling.

```typescript
import { ImportProgressService } from './services';

export class ImportWizardComponent {
  constructor(
    private progress: ImportProgressService,
    private destroy: DestroyRef,
  ) {}

  trackImport(moduleName: string, jobId: string) {
    this.progress
      .trackProgress(moduleName, jobId)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (status) => {
          // Updates every 2 seconds
          console.log(`Progress: ${status.progress.percentComplete}%`);
        },
        error: (err) => console.error('Tracking failed', err),
      });
  }
}
```

#### Key Features

- **Automatic Polling**: Checks status every 2 seconds
- **Automatic Cleanup**: Stops polling when import completes
- **Shared Subscriptions**: Multiple subscribers share one polling stream
- **Memory Safe**: Automatically unsubscribes on completion

#### Methods

| Method                              | Description                     |
| ----------------------------------- | ------------------------------- |
| `trackProgress(moduleName, jobId)`  | Start tracking an import job    |
| `cancelTracking(moduleName, jobId)` | Stop tracking a specific job    |
| `isTracking(moduleName, jobId)`     | Check if a job is being tracked |
| `getActivePollerCount()`            | Get number of active jobs       |
| `cancelAllTracking()`               | Stop tracking all jobs          |

### UserDepartmentsService

Manage user-department relationships.

```typescript
import { UserDepartmentsService } from './services';

export class UserSettingsComponent {
  constructor(private userDepts: UserDepartmentsService) {}

  assignDepartment(userId: string, deptId: number) {
    this.userDepts
      .assignDepartment(userId, {
        departmentId: deptId,
        isPrimary: true,
      })
      .subscribe(
        (dept) => console.log('Department assigned:', dept),
        (err) => console.error('Failed to assign:', err),
      );
  }
}
```

#### Methods

| Method                                 | Description                   | Returns                              |
| -------------------------------------- | ----------------------------- | ------------------------------------ |
| `getUserDepartments(userId)`           | Get all user's departments    | `Observable<UserDepartment[]>`       |
| `assignDepartment(userId, data)`       | Assign department to user     | `Observable<UserDepartment>`         |
| `removeDepartment(userId, deptId)`     | Remove department from user   | `Observable<void>`                   |
| `setPrimaryDepartment(userId, deptId)` | Set user's primary department | `Observable<void>`                   |
| `getDepartmentUsers(deptId)`           | Get all users in department   | `Observable<DepartmentUser[]>`       |
| `getPrimaryDepartment(userId)`         | Get user's primary department | `Observable<UserDepartment \| null>` |

## Type Definitions

All types are defined in `system-init.types.ts` and exported from `types/index.ts`:

```typescript
import type {
  ImportModule,
  ImportModuleStatus,
  ValidationResult,
  ImportStatus,
  ImportJobStatus,
  UserDepartment,
  DepartmentUser,
  // ... and more
} from '../types';
```

### Core Types

- **ImportModule**: Metadata about an importable module
- **AvailableModulesResponse**: Response from discovering modules
- **ValidationResult**: File validation results with errors/warnings
- **ImportStatus**: Real-time progress of import job
- **DashboardResponse**: Complete dashboard overview
- **UserDepartment**: User's department assignment

## Usage Patterns

### 1. Loading Dashboard

```typescript
export class DashboardComponent implements OnInit {
  dashboard = signal<DashboardResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private systemInit: SystemInitService) {}

  ngOnInit() {
    forkJoin({
      modules: this.systemInit.getAvailableModules(),
      dashboard: this.systemInit.getDashboard(),
    }).subscribe({
      next: ({ modules, dashboard }) => {
        this.dashboard.set(dashboard);
      },
      error: (err) => {
        this.error.set(err.message);
      },
      finalize: () => this.loading.set(false),
    });
  }
}
```

### 2. Import Wizard Flow

```typescript
// Step 1: Download template
async downloadTemplate(moduleName: string) {
  const blob = await firstValueFrom(
    this.systemInit.downloadTemplate(moduleName, 'csv')
  );
  // Trigger download...
}

// Step 2: Upload and validate
async validateFile(moduleName: string, file: File) {
  const result = await firstValueFrom(
    this.systemInit.validateFile(moduleName, file)
  );

  if (result.canProceed) {
    this.sessionId = result.sessionId;
  }
}

// Step 3: Import
async startImport(moduleName: string, sessionId: string) {
  const job = await firstValueFrom(
    this.systemInit.importData(moduleName, sessionId, {
      skipWarnings: false,
      batchSize: 100,
      onConflict: 'skip'
    })
  );

  // Step 4: Track progress
  this.progress.trackProgress(moduleName, job.jobId)
    .subscribe(status => {
      this.currentProgress = status.progress.percentComplete;
    });
}
```

### 3. Real-time Progress Tracking

```typescript
export class ProgressTrackerComponent {
  progress = signal(0);
  status = signal<ImportStatus | null>(null);

  constructor(
    private progressService: ImportProgressService,
    private destroy: DestroyRef,
  ) {}

  trackJob(moduleName: string, jobId: string) {
    this.progressService
      .trackProgress(moduleName, jobId)
      .pipe(
        takeUntilDestroyed(this.destroy),
        tap((status) => this.status.set(status)),
      )
      .subscribe();
  }
}
```

## API Endpoints

All endpoints are predefined in the services. Here's a reference:

### System Initialization (Base: `/api/admin/system-init`)

| Method | Endpoint                                  | Service Method                         |
| ------ | ----------------------------------------- | -------------------------------------- |
| GET    | `/available-modules`                      | `getAvailableModules()`                |
| GET    | `/import-order`                           | `getImportOrder()`                     |
| GET    | `/dashboard`                              | `getDashboard()`                       |
| GET    | `/module/:name/template?format=csv\|xlsx` | `downloadTemplate(name, format)`       |
| POST   | `/module/:name/validate`                  | `validateFile(name, file)`             |
| POST   | `/module/:name/import`                    | `importData(name, sessionId, options)` |
| GET    | `/module/:name/status/:jobId`             | `getImportStatus(name, jobId)`         |
| DELETE | `/module/:name/rollback/:jobId`           | `rollbackImport(name, jobId)`          |
| GET    | `/health`                                 | `getHealth()`                          |

### User Departments (Base: `/api`)

| Method | Endpoint                                     | Service Method                         |
| ------ | -------------------------------------------- | -------------------------------------- |
| GET    | `/users/:userId/departments`                 | `getUserDepartments(userId)`           |
| POST   | `/users/:userId/departments`                 | `assignDepartment(userId, data)`       |
| DELETE | `/users/:userId/departments/:deptId`         | `removeDepartment(userId, deptId)`     |
| PUT    | `/users/:userId/departments/:deptId/primary` | `setPrimaryDepartment(userId, deptId)` |
| GET    | `/departments/:deptId/users`                 | `getDepartmentUsers(deptId)`           |
| GET    | `/users/:userId/departments/primary`         | `getPrimaryDepartment(userId)`         |

## Error Handling

All services include proper error handling:

```typescript
// Service methods handle errors gracefully
this.systemInit.validateFile(module, file).subscribe({
  next: (result) => {
    // Handle success
  },
  error: (error) => {
    // error.status, error.message available
    console.error('Validation failed:', error.message);
  },
});

// getPrimaryDepartment returns null for 404
this.userDepts.getPrimaryDepartment(userId).subscribe((dept) => {
  if (dept) {
    console.log('Primary department:', dept.name);
  } else {
    console.log('No primary department assigned');
  }
});
```

## Best Practices

### 1. Use Signals with Services

```typescript
// ✅ Good: Combine signals with services for reactive state
export class MyComponent {
  modules = signal<ImportModule[]>([]);
  loading = signal(true);

  constructor(private systemInit: SystemInitService) {}

  ngOnInit() {
    this.systemInit.getAvailableModules().subscribe({
      next: (response) => this.modules.set(response.modules),
      finalize: () => this.loading.set(false),
    });
  }
}
```

### 2. Clean up Subscriptions

```typescript
// ✅ Good: Use takeUntilDestroyed
export class ProgressComponent {
  constructor(
    private progress: ImportProgressService,
    private destroy: DestroyRef,
  ) {}

  ngOnInit() {
    this.progress
      .trackProgress(module, jobId)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((status) => {
        // Handle status
      });
  }
}
```

### 3. Handle Errors Properly

```typescript
// ✅ Good: Inform users of failures
this.systemInit.importData(module, sessionId, options).subscribe({
  next: (job) => this.trackJob(job),
  error: (err) => {
    this.snackBar.open(err.error?.message || 'Import failed', 'Close', { duration: 5000 });
  },
});
```

### 4. Use forkJoin for Multiple Requests

```typescript
// ✅ Good: Parallel loading
forkJoin({
  modules: this.systemInit.getAvailableModules(),
  dashboard: this.systemInit.getDashboard(),
  health: this.systemInit.getHealth(),
}).subscribe(({ modules, dashboard, health }) => {
  // All requests complete together
});
```

## Performance Considerations

### Progress Polling

The `ImportProgressService` uses polling with these characteristics:

- **Interval**: 2 seconds (configurable with different `interval()` value)
- **Polling**: Stops automatically when import completes
- **Shared**: Multiple subscribers share a single polling stream (via `shareReplay(1)`)
- **Memory**: Automatically cleaned up when all subscribers unsubscribe

### Caching

Services don't cache by default. For caching, use RxJS operators:

```typescript
private modules$ = this.systemInit.getAvailableModules().pipe(
  shareReplay(1) // Cache and replay to new subscribers
);
```

## Testing

```typescript
describe('SystemInitService', () => {
  let service: SystemInitService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SystemInitService]
    });
    service = TestBed.inject(SystemInitService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should get available modules', () => {
    const mockModules = { modules: [], totalModules: 0, ... };

    service.getAvailableModules().subscribe(result => {
      expect(result.modules).toEqual([]);
    });

    const req = http.expectOne('/api/admin/system-init/available-modules');
    expect(req.request.method).toBe('GET');
    req.flush(mockModules);
  });
});
```

## Next Steps

The following components still need to be implemented:

1. **System Init Dashboard Page** - Main dashboard with cards and timeline
2. **Module Card Component** - Reusable module display card
3. **Import Wizard Dialog** - 4-step import workflow
4. **Progress Tracker Component** - Real-time progress display
5. **Validation Results Component** - Error/warning display
6. **Import History Timeline Component** - History view

These will use the services defined here as their data layer.

## Related Documentation

- See `/docs/features/system-initialization/FRONTEND_SPECIFICATION.md` for complete UI/UX specifications
- See `/docs/features/system-initialization/BACKEND_API.md` for backend API reference
- See `/docs/development/API_CALLING_STANDARD.md` for API calling patterns

## Dependencies

All services depend on:

- `@angular/core` - Injectable decorator, inject()
- `@angular/common/http` - HttpClient
- `rxjs` - Observable, operators

No additional npm packages required.

## Author

Angular Frontend Team - System Initialization Feature

## Last Updated

December 13, 2025
