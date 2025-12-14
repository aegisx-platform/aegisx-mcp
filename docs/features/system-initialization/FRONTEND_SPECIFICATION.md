# System Initialization Dashboard - Frontend Specification

> **Version**: 1.0.0
> **Date**: 2025-12-13
> **Status**: Specification - Ready for Implementation

## Overview

This specification defines the frontend implementation for the **System Initialization Dashboard** - a centralized Angular application for managing data imports through the Auto-Discovery Import System.

## Project Context

### Existing Backend (Already Implemented)

- ✅ Auto-Discovery Import System API (9 endpoints)
- ✅ Import Services (departments, users)
- ✅ User-Departments API (7 endpoints)
- ✅ Complete backend infrastructure with validation, rollback, audit trail

### What We're Building (Frontend)

- 🎯 Admin dashboard for system initialization
- 🎯 Import wizard (4-step process)
- 🎯 Real-time progress tracking
- 🎯 Import history timeline
- 🎯 Module management UI

## Architecture

### Technology Stack

- **Framework**: Angular 17+ (Standalone Components)
- **UI Library**: Angular Material + AegisX UI Components
- **State Management**: Angular Signals
- **Styling**: TailwindCSS
- **HTTP Client**: Angular HttpClient
- **File Upload**: Native HTML5 + Drag & Drop

### Folder Structure

```
apps/web/src/app/features/system-init/
├── pages/
│   └── system-init-dashboard/
│       ├── system-init-dashboard.page.ts
│       ├── system-init-dashboard.page.html
│       └── system-init-dashboard.page.scss
├── components/
│   ├── module-card/
│   │   ├── module-card.component.ts
│   │   ├── module-card.component.html
│   │   └── module-card.component.scss
│   ├── import-wizard/
│   │   ├── import-wizard.dialog.ts
│   │   ├── import-wizard.dialog.html
│   │   └── import-wizard.dialog.scss
│   ├── progress-tracker/
│   │   ├── progress-tracker.component.ts
│   │   ├── progress-tracker.component.html
│   │   └── progress-tracker.component.scss
│   ├── import-history-timeline/
│   │   ├── import-history-timeline.component.ts
│   │   ├── import-history-timeline.component.html
│   │   └── import-history-timeline.component.scss
│   └── validation-results/
│       ├── validation-results.component.ts
│       ├── validation-results.component.html
│       └── validation-results.component.scss
├── services/
│   ├── system-init.service.ts
│   ├── import-progress.service.ts
│   └── user-departments.service.ts
├── types/
│   ├── system-init.types.ts
│   ├── import-module.types.ts
│   └── validation.types.ts
└── system-init.routes.ts
```

## User Interface Specifications

### 1. System Initialization Dashboard (Main Page)

**Route**: `/admin/system-init`

**Layout**: Full-page dashboard with sections

#### Sections:

##### A. Header Section

```
┌─────────────────────────────────────────────────────────┐
│  System Initialization Dashboard                        │
│  Manage data imports and system setup                   │
│                                                          │
│  [🔄 Refresh] [📥 Import History] [⚙️ Settings]        │
└─────────────────────────────────────────────────────────┘
```

##### B. Overview Cards Section

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Modules│  Completed   │ In Progress  │   Pending    │
│      12      │      8       │      1       │      3       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

##### C. Import Modules Grid Section

```
┌─ Filters ────────────────────────────────────────────────┐
│ Domain: [All ▼] Status: [All ▼] Search: [________] 🔍   │
└──────────────────────────────────────────────────────────┘

┌─ Available Modules ──────────────────────────────────────┐
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Departments  │  │    Users     │  │  Drug Gen.   │  │
│  │ inventory    │  │     core     │  │  inventory   │  │
│  │              │  │              │  │              │  │
│  │ ✅ Completed │  │ ✅ Completed │  │ ⏸ Not Started│  │
│  │ 5 records    │  │ 10 records   │  │ 0 records    │  │
│  │              │  │              │  │              │  │
│  │ [📥 Import]  │  │ [📥 Import]  │  │ [📥 Import]  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

##### D. Recent Imports Timeline Section

```
┌─ Recent Imports ──────────────────────────────────────────┐
│                                                            │
│  🟢 Users Import - Completed                              │
│  ├─ 2025-12-13 11:05:00                                   │
│  ├─ 10 records imported                                   │
│  └─ By: admin@example.com                                 │
│                                                            │
│  🟢 Departments Import - Completed                        │
│  ├─ 2025-12-13 11:00:05                                   │
│  ├─ 5 records imported                                    │
│  └─ By: admin@example.com                                 │
│                                                            │
│  🔴 Drug Generics Import - Failed                         │
│  ├─ 2025-12-13 10:50:00                                   │
│  ├─ Error: Duplicate codes found                         │
│  └─ By: admin@example.com                                 │
│                                                            │
│  [View All History]                                       │
└────────────────────────────────────────────────────────────┘
```

#### Dashboard Features:

1. **Auto-refresh** - Poll `/available-modules` every 30 seconds
2. **Filter modules** - By domain, status, search term
3. **Sort modules** - By priority, name, status
4. **Quick actions** - Import, view details, rollback
5. **Responsive grid** - 1-3 columns based on screen size

### 2. Import Wizard Dialog (4-Step Process)

**Trigger**: Click "Import" button on module card

**Size**: Large modal (800px width)

#### Step 1: Select Module & Download Template

```
┌─ Import Wizard - Step 1 of 4 ────────────────────────────┐
│                                                            │
│  Selected Module: Departments (inventory/master-data)     │
│                                                            │
│  ┌─ Template ────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  📄 departments_template.csv                       │   │
│  │                                                     │   │
│  │  This template contains the required columns:      │   │
│  │  • code (required)                                 │   │
│  │  • name (required)                                 │   │
│  │  • hospital_id (optional)                          │   │
│  │  • description (optional)                          │   │
│  │  • is_active (optional)                            │   │
│  │                                                     │   │
│  │  [📥 Download CSV Template]                        │   │
│  │  [📥 Download Excel Template]                      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ℹ️ Fill in the template with your data before uploading │
│                                                            │
│  [Cancel]                            [Next: Upload File →]│
└────────────────────────────────────────────────────────────┘
```

#### Step 2: Upload File

```
┌─ Import Wizard - Step 2 of 4 ────────────────────────────┐
│                                                            │
│  Selected Module: Departments                             │
│                                                            │
│  ┌─ Upload File ─────────────────────────────────────┐   │
│  │                                                     │   │
│  │         ╔═══════════════════════════════╗          │   │
│  │         ║                               ║          │   │
│  │         ║    📁 Drag & Drop CSV/Excel  ║          │   │
│  │         ║           file here           ║          │   │
│  │         ║                               ║          │   │
│  │         ║         or click to browse    ║          │   │
│  │         ║                               ║          │   │
│  │         ╚═══════════════════════════════╝          │   │
│  │                                                     │   │
│  │  📄 departments_data.csv (1.2 MB)                  │   │
│  │  ✅ File size OK (< 10 MB)                         │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ⚠️ Maximum file size: 10 MB                              │
│  ⚠️ Maximum rows: 10,000                                  │
│                                                            │
│  [← Back]                           [Next: Validate File →]│
└────────────────────────────────────────────────────────────┘
```

#### Step 3: Validation Results

```
┌─ Import Wizard - Step 3 of 4 ────────────────────────────┐
│                                                            │
│  Selected Module: Departments                             │
│  File: departments_data.csv (1.2 MB)                      │
│                                                            │
│  ┌─ Validation Results ──────────────────────────────┐   │
│  │                                                     │   │
│  │  ✅ Validation Passed                              │   │
│  │                                                     │   │
│  │  📊 Statistics:                                    │   │
│  │  • Total rows: 50                                  │   │
│  │  • Valid rows: 48                                  │   │
│  │  • Rows with errors: 0                             │   │
│  │  • Rows with warnings: 2                           │   │
│  │                                                     │   │
│  │  ⚠️ Warnings (2):                                  │   │
│  │  ├─ Row 15: Description is empty                  │   │
│  │  └─ Row 32: Description is empty                  │   │
│  │                                                     │   │
│  │  [📋 View Detailed Report]                         │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  Import Options:                                          │
│  ☑️ Skip warnings and proceed                             │
│  Batch size: [100 ▼]                                      │
│  On conflict: [Skip ▼] (Skip / Update / Error)           │
│                                                            │
│  [← Back]                            [Next: Confirm Import]│
└────────────────────────────────────────────────────────────┘
```

**Error State Example:**

```
┌─ Import Wizard - Step 3 of 4 ────────────────────────────┐
│                                                            │
│  ❌ Validation Failed                                     │
│                                                            │
│  🔴 Errors (3):                                           │
│  ├─ Row 5: Duplicate code 'PHARM' (already exists)       │
│  ├─ Row 12: Invalid code format 'pharmacy-1'             │
│  └─ Row 25: Required field 'name' is missing             │
│                                                            │
│  ⚠️ Cannot proceed with import until errors are fixed.   │
│                                                            │
│  [← Back to upload]     [📥 Download Error Report (CSV)]  │
└────────────────────────────────────────────────────────────┘
```

#### Step 4: Confirm & Import

```
┌─ Import Wizard - Step 4 of 4 ────────────────────────────┐
│                                                            │
│  Ready to Import                                          │
│                                                            │
│  ┌─ Summary ──────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  Module: Departments (inventory/master-data)        │  │
│  │  File: departments_data.csv                         │  │
│  │  Records to import: 48                              │  │
│  │                                                      │  │
│  │  Import Options:                                    │  │
│  │  • Skip warnings: Yes                               │  │
│  │  • Batch size: 100                                  │  │
│  │  • On conflict: Skip                                │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ⚠️ This action will create 48 new records in the        │
│     database. This operation can be rolled back later.    │
│                                                            │
│  [← Back]              [Cancel]        [✅ Start Import]  │
└────────────────────────────────────────────────────────────┘
```

**Import in Progress:**

```
┌─ Import Wizard - Importing... ────────────────────────────┐
│                                                            │
│  Importing Departments...                                 │
│                                                            │
│  Progress: 24 / 48 records (50%)                          │
│                                                            │
│  ████████████████░░░░░░░░░░░░░░░░                         │
│                                                            │
│  Current batch: 1 of 1                                    │
│  Elapsed time: 5 seconds                                  │
│  Estimated remaining: 5 seconds                           │
│                                                            │
│  ℹ️ Please do not close this window...                   │
│                                                            │
│  [Cancel Import]                                          │
└────────────────────────────────────────────────────────────┘
```

**Import Complete:**

```
┌─ Import Complete ──────────────────────────────────────────┐
│                                                            │
│  ✅ Import Completed Successfully!                        │
│                                                            │
│  ┌─ Results ────────────────────────────────────────┐    │
│  │                                                    │    │
│  │  Module: Departments                              │    │
│  │  Job ID: abc-123-def-456                          │    │
│  │                                                    │    │
│  │  📊 Import Statistics:                            │    │
│  │  • Total records: 48                              │    │
│  │  • Successfully imported: 48                      │    │
│  │  • Failed: 0                                      │    │
│  │  • Duration: 10 seconds                           │    │
│  │                                                    │    │
│  │  Next Steps:                                      │    │
│  │  • Verify imported data in Departments module     │    │
│  │  • If needed, use Rollback to undo this import    │    │
│  │                                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
│  [View Import History]  [Rollback Import]  [Close ✓]     │
└────────────────────────────────────────────────────────────┘
```

### 3. Module Card Component

**Reusable component** for displaying module information

```typescript
// Props:
interface ModuleCardProps {
  module: ImportModule;
  onImport: (module: ImportModule) => void;
  onViewDetails: (module: ImportModule) => void;
  onRollback: (module: ImportModule) => void;
}
```

**Visual States:**

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

### 4. Import History Timeline Component

**Displays** chronological list of all import jobs

```
┌─ Import History ───────────────────────────────────────────┐
│                                                             │
│  Filters: [All Modules ▼] [All Statuses ▼] [Last 30 Days ▼]│
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 2025-12-13 11:05:00                                  │  │
│  │ ● Users Import                          ✅ Completed │  │
│  │ └─ 10 records imported by admin@example.com         │  │
│  │    Job ID: job-uuid-yyy                             │  │
│  │    [View Details] [Rollback]                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 2025-12-13 11:00:05                                  │  │
│  │ ● Departments Import                    ✅ Completed │  │
│  │ └─ 5 records imported by admin@example.com          │  │
│  │    Job ID: job-uuid-xxx                             │  │
│  │    [View Details] [Rollback]                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 2025-12-13 10:50:00                                  │  │
│  │ ● Drug Generics Import                  ❌ Failed    │  │
│  │ └─ Error: Duplicate codes found                     │  │
│  │    By: admin@example.com                            │  │
│  │    [View Errors] [Retry]                            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [Load More]                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5. Progress Tracker Component

**Real-time** import progress display

```
┌─ Import Progress ──────────────────────────────────────────┐
│                                                             │
│  Job: Departments Import                                   │
│  Job ID: job-uuid-xxx                                      │
│  Status: In Progress 🔄                                    │
│                                                             │
│  Overall Progress: 75 / 100 records (75%)                  │
│  ██████████████████████████████░░░░░░░░░░                  │
│                                                             │
│  Current Batch: 1 of 1                                     │
│  Batch Progress: 75 / 100                                  │
│                                                             │
│  ⏱ Started: 2025-12-13 11:00:00                           │
│  ⏱ Elapsed: 15 seconds                                    │
│  ⏱ Estimated remaining: 5 seconds                         │
│                                                             │
│  Speed: ~5 records/second                                  │
│                                                             │
│  [Cancel Import] [View Logs]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6. Validation Results Component

**Displays** validation errors and warnings

```
┌─ Validation Results ───────────────────────────────────────┐
│                                                             │
│  Session ID: uuid-xxx                                      │
│  File: departments_data.csv                                │
│  Size: 1.2 MB                                              │
│                                                             │
│  ┌─ Summary ──────────────────────────────────────────┐   │
│  │ Total Rows: 50                                      │   │
│  │ Valid Rows: 48                                      │   │
│  │ Errors: 0                                           │   │
│  │ Warnings: 2                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ Warnings (2)                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Row 15                                               │  │
│  │ Field: description                                   │  │
│  │ Warning: Field is empty                             │  │
│  │ Code: EMPTY_OPTIONAL_FIELD                          │  │
│  │ Data: { code: 'PHARM', name: 'Pharmacy', ... }     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Row 32                                               │  │
│  │ Field: description                                   │  │
│  │ Warning: Field is empty                             │  │
│  │ Code: EMPTY_OPTIONAL_FIELD                          │  │
│  │ Data: { code: 'FINANCE', name: 'Finance', ... }    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [📥 Download Full Report (CSV)]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Technical Specifications

### 1. Service Layer

#### SystemInitService

```typescript
@Injectable({
  providedIn: 'root',
})
export class SystemInitService {
  private readonly baseUrl = '/api/admin/system-init';

  constructor(private http: HttpClient) {}

  // Dashboard APIs
  getAvailableModules(): Observable<AvailableModulesResponse> {
    return this.http.get<AvailableModulesResponse>(`${this.baseUrl}/available-modules`);
  }

  getImportOrder(): Observable<ImportOrderResponse> {
    return this.http.get<ImportOrderResponse>(`${this.baseUrl}/import-order`);
  }

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard`);
  }

  // Module-specific APIs
  downloadTemplate(moduleName: string, format: 'csv' | 'xlsx'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/module/${moduleName}/template`, {
      params: { format },
      responseType: 'blob',
    });
  }

  validateFile(moduleName: string, file: File): Observable<ValidationResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ValidationResult>(`${this.baseUrl}/module/${moduleName}/validate`, formData);
  }

  importData(moduleName: string, sessionId: string, options: ImportOptions): Observable<ImportJobResponse> {
    return this.http.post<ImportJobResponse>(`${this.baseUrl}/module/${moduleName}/import`, { sessionId, options });
  }

  getImportStatus(moduleName: string, jobId: string): Observable<ImportStatus> {
    return this.http.get<ImportStatus>(`${this.baseUrl}/module/${moduleName}/status/${jobId}`);
  }

  rollbackImport(moduleName: string, jobId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/module/${moduleName}/rollback/${jobId}`);
  }

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }
}
```

#### ImportProgressService

```typescript
@Injectable({
  providedIn: 'root',
})
export class ImportProgressService {
  private progressPollers = new Map<string, Observable<ImportStatus>>();

  constructor(
    private systemInitService: SystemInitService,
    private ngZone: NgZone,
  ) {}

  /**
   * Poll import status every 2 seconds until completion
   */
  trackProgress(moduleName: string, jobId: string): Observable<ImportStatus> {
    const key = `${moduleName}:${jobId}`;

    if (this.progressPollers.has(key)) {
      return this.progressPollers.get(key)!;
    }

    const poller$ = interval(2000).pipe(
      startWith(0),
      switchMap(() => this.systemInitService.getImportStatus(moduleName, jobId)),
      takeWhile(
        (status) => status.status === 'queued' || status.status === 'running',
        true, // Include final value
      ),
      shareReplay(1),
      finalize(() => this.progressPollers.delete(key)),
    );

    this.progressPollers.set(key, poller$);
    return poller$;
  }

  /**
   * Cancel tracking for a job
   */
  cancelTracking(moduleName: string, jobId: string): void {
    const key = `${moduleName}:${jobId}`;
    this.progressPollers.delete(key);
  }
}
```

#### UserDepartmentsService

```typescript
@Injectable({
  providedIn: 'root',
})
export class UserDepartmentsService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getUserDepartments(userId: string): Observable<UserDepartment[]> {
    return this.http.get<{ departments: UserDepartment[] }>(`${this.baseUrl}/users/${userId}/departments`).pipe(map((res) => res.departments));
  }

  assignDepartment(userId: string, data: AssignDepartmentRequest): Observable<UserDepartment> {
    return this.http.post<UserDepartment>(`${this.baseUrl}/users/${userId}/departments`, data);
  }

  removeDepartment(userId: string, deptId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${userId}/departments/${deptId}`);
  }

  setPrimaryDepartment(userId: string, deptId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/users/${userId}/departments/${deptId}/primary`, {});
  }

  getDepartmentUsers(deptId: number): Observable<DepartmentUser[]> {
    return this.http.get<{ users: DepartmentUser[] }>(`${this.baseUrl}/departments/${deptId}/users`).pipe(map((res) => res.users));
  }

  getPrimaryDepartment(userId: string): Observable<UserDepartment | null> {
    return this.http.get<UserDepartment>(`${this.baseUrl}/users/${userId}/departments/primary`).pipe(
      catchError((err) => {
        if (err.status === 404) return of(null);
        throw err;
      }),
    );
  }
}
```

### 2. Type Definitions

```typescript
// apps/web/src/app/features/system-init/types/system-init.types.ts

export interface ImportModule {
  module: string;
  domain: string;
  subdomain?: string;
  displayName: string;
  displayNameThai?: string;
  dependencies: string[];
  priority: number;
  importStatus: ImportModuleStatus;
  recordCount: number;
  lastImport?: {
    jobId: string;
    completedAt: string;
    importedBy: {
      id: string;
      name: string;
    };
  };
}

export type ImportModuleStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

export interface AvailableModulesResponse {
  modules: ImportModule[];
  totalModules: number;
  completedModules: number;
  pendingModules: number;
}

export interface ImportOrderResponse {
  order: Array<{
    module: string;
    reason: string;
  }>;
}

export interface DashboardResponse {
  overview: {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    pendingModules: number;
    totalRecordsImported: number;
  };
  modulesByDomain: Record<
    string,
    {
      total: number;
      completed: number;
    }
  >;
  recentImports: ImportHistoryItem[];
  nextRecommended: string[];
}

export interface ImportHistoryItem {
  jobId: string;
  module: string;
  status: ImportJobStatus;
  recordsImported: number;
  completedAt: string;
  importedBy: {
    id: string;
    name: string;
  };
  error?: string;
}

export type ImportJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ValidationResult {
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

export interface ValidationError {
  row?: number;
  field?: string;
  message: string;
  severity: 'ERROR';
  code: string;
  data?: any;
}

export interface ValidationWarning {
  row?: number;
  field?: string;
  message: string;
  severity: 'WARNING';
  code: string;
  data?: any;
}

export interface ImportOptions {
  skipWarnings: boolean;
  batchSize: number;
  onConflict: 'skip' | 'update' | 'error';
}

export interface ImportJobResponse {
  jobId: string;
  status: ImportJobStatus;
  message: string;
}

export interface ImportStatus {
  jobId: string;
  status: ImportJobStatus;
  progress: {
    totalRows: number;
    importedRows: number;
    errorRows: number;
    currentRow: number;
    percentComplete: number;
  };
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  discoveredServices: number;
  lastDiscoveryTime: string;
  services: Array<{
    module: string;
    status: 'active' | 'inactive';
  }>;
}
```

### 3. State Management (Signals)

```typescript
// apps/web/src/app/features/system-init/pages/system-init-dashboard/system-init-dashboard.page.ts

export class SystemInitDashboardPage implements OnInit {
  // Signals for reactive state
  modules = signal<ImportModule[]>([]);
  dashboard = signal<DashboardResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filters
  selectedDomain = signal<string>('all');
  selectedStatus = signal<ImportModuleStatus | 'all'>('all');
  searchTerm = signal<string>('');

  // Computed signals
  filteredModules = computed(() => {
    let result = this.modules();

    // Filter by domain
    if (this.selectedDomain() !== 'all') {
      result = result.filter((m) => m.domain === this.selectedDomain());
    }

    // Filter by status
    if (this.selectedStatus() !== 'all') {
      result = result.filter((m) => m.importStatus === this.selectedStatus());
    }

    // Filter by search term
    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter((m) => m.displayName.toLowerCase().includes(term) || m.module.toLowerCase().includes(term));
    }

    return result;
  });

  availableDomains = computed(() => {
    const domains = new Set(this.modules().map((m) => m.domain));
    return Array.from(domains).sort();
  });

  constructor(
    private systemInitService: SystemInitService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadDashboard();
    this.startAutoRefresh();
  }

  private loadDashboard() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      modules: this.systemInitService.getAvailableModules(),
      dashboard: this.systemInitService.getDashboard(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ modules, dashboard }) => {
          this.modules.set(modules.modules);
          this.dashboard.set(dashboard);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load dashboard');
          this.snackBar.open('Failed to load dashboard', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  private startAutoRefresh() {
    interval(30000) // 30 seconds
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadDashboard());
  }

  openImportWizard(module: ImportModule) {
    const dialogRef = this.dialog.open(ImportWizardDialog, {
      width: '800px',
      maxHeight: '90vh',
      data: { module },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.loadDashboard(); // Refresh after successful import
      }
    });
  }
}
```

### 4. Routing Configuration

```typescript
// apps/web/src/app/features/system-init/system-init.routes.ts

import { Routes } from '@angular/router';

export const SYSTEM_INIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/system-init-dashboard/system-init-dashboard.page').then((m) => m.SystemInitDashboardPage),
    data: {
      title: 'System Initialization',
      breadcrumb: 'System Init',
    },
  },
];
```

```typescript
// Add to main app routes (apps/web/src/app/app.routes.ts)

{
  path: 'admin/system-init',
  loadChildren: () =>
    import('./features/system-init/system-init.routes').then(
      m => m.SYSTEM_INIT_ROUTES
    ),
  canActivate: [AuthGuard, AdminGuard]
}
```

### 5. Import Wizard Dialog Implementation

```typescript
// apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.ts

export interface ImportWizardData {
  module: ImportModule;
}

export interface ImportWizardResult {
  success: boolean;
  jobId?: string;
}

@Component({
  selector: 'app-import-wizard-dialog',
  standalone: true,
  templateUrl: './import-wizard.dialog.html',
  styleUrls: ['./import-wizard.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportWizardDialog implements OnInit {
  // Wizard state
  currentStep = signal(1);
  totalSteps = 4;

  // Upload state
  selectedFile = signal<File | null>(null);
  uploadProgress = signal(0);

  // Validation state
  validationResult = signal<ValidationResult | null>(null);
  isValidating = signal(false);

  // Import state
  sessionId = signal<string | null>(null);
  importOptions = signal<ImportOptions>({
    skipWarnings: false,
    batchSize: 100,
    onConflict: 'skip',
  });

  // Import job state
  importJob = signal<ImportJobResponse | null>(null);
  importStatus = signal<ImportStatus | null>(null);
  isImporting = signal(false);

  constructor(
    public dialogRef: MatDialogRef<ImportWizardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ImportWizardData,
    private systemInitService: SystemInitService,
    private importProgressService: ImportProgressService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    // Initialize wizard
  }

  // Step 1: Download template
  async downloadTemplate(format: 'csv' | 'xlsx') {
    try {
      const blob = await firstValueFrom(this.systemInitService.downloadTemplate(this.data.module.module, format));

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.data.module.module}_template.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.snackBar.open('Template downloaded', 'Close', { duration: 3000 });
    } catch (err) {
      this.snackBar.open('Failed to download template', 'Close', { duration: 3000 });
    }
  }

  // Step 2: Upload file
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile.set(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Step 3: Validate file
  async validateFile() {
    const file = this.selectedFile();
    if (!file) return;

    this.isValidating.set(true);

    try {
      const result = await firstValueFrom(this.systemInitService.validateFile(this.data.module.module, file));

      this.validationResult.set(result);
      this.sessionId.set(result.sessionId);

      if (result.isValid || result.canProceed) {
        this.snackBar.open('Validation passed', 'Close', { duration: 3000 });
      } else {
        this.snackBar.open('Validation failed', 'Close', { duration: 3000 });
      }
    } catch (err: any) {
      this.snackBar.open(err.error?.message || 'Validation failed', 'Close', { duration: 5000 });
    } finally {
      this.isValidating.set(false);
    }
  }

  // Step 4: Import data
  async startImport() {
    const sessionId = this.sessionId();
    if (!sessionId) return;

    this.isImporting.set(true);

    try {
      // Start import
      const jobResponse = await firstValueFrom(this.systemInitService.importData(this.data.module.module, sessionId, this.importOptions()));

      this.importJob.set(jobResponse);

      // Track progress
      this.importProgressService.trackProgress(this.data.module.module, jobResponse.jobId).subscribe({
        next: (status) => {
          this.importStatus.set(status);

          if (status.status === 'completed') {
            this.snackBar.open('Import completed successfully', 'Close', {
              duration: 5000,
            });
            this.isImporting.set(false);
          } else if (status.status === 'failed') {
            this.snackBar.open('Import failed', 'Close', { duration: 5000 });
            this.isImporting.set(false);
          }
        },
        error: (err) => {
          this.snackBar.open('Failed to track import progress', 'Close', {
            duration: 5000,
          });
          this.isImporting.set(false);
        },
      });
    } catch (err: any) {
      this.snackBar.open(err.error?.message || 'Failed to start import', 'Close', { duration: 5000 });
      this.isImporting.set(false);
    }
  }

  // Navigation
  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update((s) => s + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep()) {
      case 1:
        return true; // Can always proceed from template download
      case 2:
        return this.selectedFile() !== null;
      case 3:
        const result = this.validationResult();
        return result !== null && (result.isValid || result.canProceed);
      case 4:
        return false; // Final step, no next
      default:
        return false;
    }
  }

  close(success: boolean = false) {
    const result: ImportWizardResult = {
      success,
      jobId: this.importJob()?.jobId,
    };
    this.dialogRef.close(result);
  }
}
```

## UI/UX Requirements

### Design System

- **Colors**: Use Material Design color palette
- **Typography**: Roboto font family
- **Spacing**: 8px grid system
- **Shadows**: Material elevation levels
- **Icons**: Material Icons + Custom SVG icons

### Responsive Design

- **Desktop** (≥1200px): 3-column grid for modules
- **Tablet** (768px-1199px): 2-column grid
- **Mobile** (<768px): 1-column stack

### Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support (Tab, Enter, Esc)
- Screen reader announcements for status changes
- High contrast mode support
- Focus indicators on all focusable elements

### Loading States

- Skeleton loaders for dashboard cards
- Spinner for wizard steps
- Progress bars for file upload and import
- Disable buttons during async operations

### Error Handling

- Toast notifications for errors
- Inline error messages in forms
- Error summary at top of validation results
- Retry buttons for failed operations

## Performance Requirements

### Page Load

- Initial render: <1s
- First Contentful Paint: <2s
- Time to Interactive: <3s

### API Response Handling

- Show loading state immediately
- Display cached data while refreshing
- Debounce search input (300ms)
- Batch multiple API calls with forkJoin

### File Upload

- Show upload progress
- Validate file size client-side before upload
- Support drag & drop for better UX

### Real-time Updates

- Poll import status every 2 seconds during import
- Auto-refresh dashboard every 30 seconds
- WebSocket support (future enhancement)

## Testing Requirements

### Unit Tests

- All services (100% coverage)
- All components (80%+ coverage)
- All validators and utilities

### Integration Tests

- Import wizard full flow
- Dashboard data loading
- Error handling scenarios

### E2E Tests

- Complete import flow (template → upload → validate → import)
- Rollback operation
- Filter and search functionality

## Implementation Phases

### Phase 1: Core Dashboard (Week 1)

- ✅ Service layer implementation
- ✅ Dashboard page with overview cards
- ✅ Module card component
- ✅ Import history timeline
- ✅ Basic routing

### Phase 2: Import Wizard (Week 2)

- ✅ Wizard dialog structure (4 steps)
- ✅ File upload with drag & drop
- ✅ Validation results display
- ✅ Import execution with progress tracking

### Phase 3: Advanced Features (Week 3)

- ✅ Rollback functionality
- ✅ Detailed error reporting
- ✅ Export validation/import reports
- ✅ Filter and search improvements

### Phase 4: Polish & Testing (Week 4)

- ✅ Responsive design refinements
- ✅ Accessibility improvements
- ✅ Unit and E2E tests
- ✅ Performance optimization
- ✅ Documentation

## Acceptance Criteria

### Dashboard

- [ ] Displays all discovered import modules
- [ ] Shows accurate status and record counts
- [ ] Auto-refreshes every 30 seconds
- [ ] Filter by domain, status works correctly
- [ ] Search by module name works
- [ ] Recent imports timeline displays last 10 imports

### Import Wizard

- [ ] Download CSV/Excel templates works
- [ ] File upload with drag & drop works
- [ ] Client-side file validation (size, type)
- [ ] Server-side validation displays errors/warnings
- [ ] Import execution starts job successfully
- [ ] Progress tracking updates in real-time
- [ ] Success/failure states handled correctly
- [ ] Can close wizard at any step (with confirmation)

### Error Handling

- [ ] Network errors show user-friendly messages
- [ ] Validation errors displayed clearly
- [ ] Import failures show actionable error messages
- [ ] Retry functionality available after failures

### Performance

- [ ] Dashboard loads in <2 seconds
- [ ] File upload shows progress
- [ ] Import progress updates smoothly
- [ ] No memory leaks during polling

### Accessibility

- [ ] Keyboard navigation works throughout
- [ ] Screen reader announcements accurate
- [ ] ARIA labels present on all controls
- [ ] Focus management in wizard dialog

## Security Considerations

### Client-side Validation

- File size validation before upload
- File type validation (CSV, Excel only)
- Input sanitization for search/filter

### API Security

- All requests include auth token
- CSRF protection enabled
- Rate limiting on upload endpoint

### Data Protection

- No sensitive data in client logs
- Session IDs expire after 30 minutes
- Clear file data from memory after upload

## Documentation Requirements

### Code Documentation

- JSDoc comments on all public methods
- README in feature folder
- Type definitions documented
- Component prop documentation

### User Documentation

- User guide for import workflow
- FAQ for common issues
- Video tutorial (optional)

### Developer Documentation

- Architecture decision records
- API integration guide
- Deployment guide

## Dependencies

### Required Packages (Already in Project)

- @angular/core
- @angular/common
- @angular/router
- @angular/forms
- @angular/material
- @aegisx/ui
- rxjs

### No New Dependencies Required

All functionality can be implemented with existing packages.

## Rollout Plan

### Development Environment

1. Implement Phase 1 (Dashboard)
2. Test with mock data
3. Integrate with development API
4. User acceptance testing

### Staging Environment

1. Deploy complete implementation
2. Integration testing with real data
3. Performance testing
4. Security audit

### Production Environment

1. Feature flag enabled for admins only
2. Monitor performance and errors
3. Gradually roll out to all users
4. Full documentation release

## Success Metrics

### User Adoption

- 80%+ of data imports use dashboard (vs manual SQL)
- <5 support tickets per month
- Average time to import: <5 minutes

### Technical Metrics

- Page load time: <2s
- Import success rate: >95%
- Zero critical bugs in production
- Test coverage: >80%

---

**Next Steps:**

1. Review and approve this specification
2. Create implementation tasks
3. Assign to development team
4. Begin Phase 1 implementation

**Estimated Total Effort:** 3-4 weeks (1 developer)

**Priority:** High (Required for production data initialization)

**Status:** ✅ SPECIFICATION COMPLETE - READY FOR IMPLEMENTATION
