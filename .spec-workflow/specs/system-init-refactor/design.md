# Design Document: System Initialization Refactor

## Overview

This design document outlines the technical approach for refactoring the System Initialization Dashboard feature. The refactoring addresses critical issues including API response format mismatches, endpoint path errors, duplicate service files, unimplemented functionality, and type definition inconsistencies.

The solution follows a **frontend-focused approach** since the backend API is already fully implemented and working. We will modify the frontend service layer to correctly handle the wrapped API responses and implement all missing functionality.

## Steering Document Alignment

### Technical Standards (tech.md)

- **Angular 17+ Standalone Components**: All components use standalone architecture
- **Angular Signals**: State management uses signals for reactive updates
- **RxJS Operators**: Use `map()` operator to transform API responses
- **TypeBox**: Backend uses TypeBox schemas (no changes needed)
- **TailwindCSS + Angular Material**: UI styling follows existing patterns

### Project Structure (structure.md)

- Feature location: `apps/web/src/app/features/system-init/`
- Services: `services/` subfolder
- Types: `types/` subfolder
- Components: `components/` subfolder
- Pages: `pages/` subfolder

## Code Reuse Analysis

### Existing Components to Leverage

- **ModuleCardComponent**: Already implemented, needs action handler integration
- **ImportHistoryTimelineComponent**: Already implemented, needs action handler integration
- **ImportWizardDialog**: Structure exists, needs full implementation
- **ProgressTrackerComponent**: Exists, needs integration with import progress service
- **ValidationResultsComponent**: Exists, needs integration with validation API

### Integration Points

- **Backend API**: `/api/admin/system-init/*` - All 9 endpoints already working
- **Authentication**: Uses existing `AuthGuard` and auth token injection
- **HTTP Client**: Angular's `HttpClient` with existing interceptors
- **Material Dialog**: For Import Wizard modal
- **Material Snackbar**: For notifications

## Architecture

The refactoring follows a **Service Adapter Pattern** where the frontend service layer transforms wrapped API responses into the expected frontend format.

```mermaid
graph TD
    subgraph Frontend
        A[Dashboard Page] --> B[SystemInitService]
        A --> C[ImportProgressService]
        B --> D[HttpClient]
        C --> D
        D --> E[API Interceptor]
    end

    subgraph Backend
        E --> F[/api/admin/system-init/*]
        F --> G[SystemInitController]
        G --> H[SystemInitService]
        H --> I[ImportDiscoveryService]
    end

    subgraph Response Transform
        D -->|Raw Response| J[map operator]
        J -->|response.data| B
    end
```

### Modular Design Principles

- **Single File Responsibility**: Each service method handles one API endpoint with response transformation
- **Component Isolation**: Import Wizard steps are separate but contained within the dialog
- **Service Layer Separation**: Services handle API communication, components handle presentation
- **Utility Modularity**: Response transformation is done inline with RxJS operators

## Components and Interfaces

### Component 1: SystemInitService (Refactored)

- **Purpose:** Handle all System Init API calls with proper response unwrapping
- **Interfaces:**
  ```typescript
  // All methods return unwrapped data, not the full API response
  getAvailableModules(): Observable<AvailableModulesData>
  getDashboard(): Observable<DashboardData>
  getImportOrder(): Observable<ImportOrderData>
  downloadTemplate(moduleName: string, format: 'csv' | 'xlsx'): Observable<Blob>
  validateFile(moduleName: string, file: File): Observable<ValidationData>
  importData(moduleName: string, sessionId: string, options: ImportOptions): Observable<ImportJobData>
  getImportStatus(moduleName: string, jobId: string): Observable<ImportStatusData>
  rollbackImport(moduleName: string, jobId: string): Observable<RollbackData>
  getHealthStatus(): Observable<HealthStatusData>  // Fixed endpoint path
  ```
- **Dependencies:** HttpClient, RxJS operators
- **Pattern:** Use `pipe(map(response => response.data))` on all API calls

### Component 2: ImportWizardDialog (Implemented)

- **Purpose:** 4-step wizard for importing data into modules
- **Interfaces:**
  ```typescript
  @Input() data: { module: ImportModule }
  @Output() result: { success: boolean, jobId?: string }
  ```
- **Dependencies:** SystemInitService, ImportProgressService, MatDialog, MatStepper
- **Steps:**
  1. Template Download - Show module info and download buttons
  2. File Upload - Drag & drop or file picker
  3. Validation - Show results, errors, warnings
  4. Import - Execute and track progress

### Component 3: SystemInitDashboardPage (Enhanced)

- **Purpose:** Main dashboard with working action handlers
- **Interfaces:**
  ```typescript
  // Action handlers that actually work
  openImportWizard(module: ImportModule): void
  onModuleImport(module: ImportModule): void
  onModuleViewDetails(module: ImportModule): void
  onModuleRollback(module: ImportModule): void
  onHistoryViewDetails(item: ImportHistoryItem): void
  onHistoryRollback(item: ImportHistoryItem): void
  onHistoryRetry(item: ImportHistoryItem): void
  ```
- **Dependencies:** SystemInitService, MatDialog, MatSnackBar
- **Reuses:** ModuleCardComponent, ImportHistoryTimelineComponent

## Data Models

### API Response Wrapper (Backend sends this)

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode?: number;
  };
  meta: { ... };
}
```

### Frontend Data Types (What components use)

```typescript
// Available Modules - extracted from response.data
interface AvailableModulesData {
  modules: ImportModule[];
  totalModules: number;
  completedModules: number;
  pendingModules: number;
}

// Dashboard - extracted from response.data
interface DashboardData {
  overview: DashboardOverview;
  modulesByDomain: Record<string, DomainStats>;
  recentImports: ImportHistoryItem[];
  nextRecommended: NextRecommendedItem[]; // Fixed type
}

// Next Recommended - Fixed to match backend
interface NextRecommendedItem {
  module: string;
  reason: string;
}

// Import History Item - Aligned with backend
interface ImportHistoryItem {
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

// Health Status - New type for fixed endpoint
interface HealthStatusData {
  isHealthy: boolean;
  validationErrors: string[];
  circularDependencies: Array<{ path: string[] }>;
}
```

## Implementation Details

### Fix 1: Response Unwrapping in Service

```typescript
// BEFORE (broken)
getAvailableModules(): Observable<AvailableModulesResponse> {
  return this.http.get<AvailableModulesResponse>(
    `${this.baseUrl}/available-modules`
  );
}

// AFTER (fixed)
getAvailableModules(): Observable<AvailableModulesData> {
  return this.http.get<ApiResponse<AvailableModulesData>>(
    `${this.baseUrl}/available-modules`
  ).pipe(
    map(response => response.data)
  );
}
```

### Fix 2: Health Endpoint Path

```typescript
// BEFORE (broken)
getHealth(): Observable<HealthResponse> {
  return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
}

// AFTER (fixed)
getHealthStatus(): Observable<HealthStatusData> {
  return this.http.get<ApiResponse<HealthStatusData>>(
    `${this.baseUrl}/health-status`
  ).pipe(
    map(response => response.data)
  );
}
```

### Fix 3: Import Wizard Integration

```typescript
// BEFORE (broken)
openImportWizard(module: ImportModule) {
  this.snackBar.open(
    `Import wizard for ${module.displayName} coming soon`,
    'Close',
    { duration: 3000 }
  );
}

// AFTER (working)
openImportWizard(module: ImportModule) {
  const dialogRef = this.dialog.open(ImportWizardDialog, {
    width: '800px',
    maxHeight: '90vh',
    data: { module },
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.success) {
      this.loadDashboard();
      this.snackBar.open('Import completed successfully', 'Close', {
        duration: 5000
      });
    }
  });
}
```

### Fix 4: Remove Duplicate Files

Files to DELETE:

- `apps/web/src/app/features/system/services/system-init.service.ts`
- `apps/web/src/app/features/system/services/import-progress.service.ts`
- `apps/web/src/app/features/system/services/index.ts`
- `apps/web/src/app/features/system/types/system-init.types.ts`
- `apps/web/src/app/features/system/types/index.ts`

Keep and update:

- `apps/web/src/app/features/system-init/services/system-init.service.ts`
- `apps/web/src/app/features/system-init/services/import-progress.service.ts`
- `apps/web/src/app/features/system-init/types/system-init.types.ts`

## Error Handling

### Error Scenarios

1. **API Response with success: false**
   - **Handling:** Service throws error extracted from `response.error.message`
   - **User Impact:** Snackbar shows error message

2. **Network Error (no response)**
   - **Handling:** HTTP interceptor catches, returns generic error
   - **User Impact:** Snackbar shows "Network error, please try again"

3. **File Validation Errors**
   - **Handling:** Display errors in ValidationResultsComponent
   - **User Impact:** Shows row-by-row errors with field names and messages

4. **Import Job Failure**
   - **Handling:** Poll status detects failed state, stops polling
   - **User Impact:** Shows error message with option to view details or retry

5. **Rollback Failure**
   - **Handling:** Catch error, show message, refresh dashboard anyway
   - **User Impact:** Snackbar shows rollback error, dashboard refreshes

## Testing Strategy

### Unit Testing

- **SystemInitService**: Test all methods return unwrapped data
- **Response transformation**: Test map operator extracts data correctly
- **Error handling**: Test error responses throw proper errors
- **ImportWizardDialog**: Test step navigation and state management

### Integration Testing

- **Dashboard loading**: Test forkJoin loads both endpoints correctly
- **Import flow**: Test full wizard flow from template to completion
- **Rollback flow**: Test confirmation and API call

### End-to-End Testing

- **Complete import**: Upload file → Validate → Import → Verify
- **Rollback**: Import → Rollback → Verify data removed
- **Error handling**: Invalid file → See errors → Fix → Retry

## File Changes Summary

### Files to Modify

1. `apps/web/src/app/features/system-init/services/system-init.service.ts` - Add response unwrapping
2. `apps/web/src/app/features/system-init/types/system-init.types.ts` - Fix type definitions
3. `apps/web/src/app/features/system-init/pages/system-init-dashboard/system-init-dashboard.page.ts` - Implement action handlers
4. `apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.ts` - Full implementation

### Files to Delete

1. `apps/web/src/app/features/system/services/system-init.service.ts`
2. `apps/web/src/app/features/system/services/import-progress.service.ts`
3. `apps/web/src/app/features/system/services/index.ts`
4. `apps/web/src/app/features/system/types/system-init.types.ts`
5. `apps/web/src/app/features/system/types/index.ts`

### Files Unchanged

- Backend files (all working correctly)
- Other frontend components (ModuleCard, Timeline, etc. - structure is correct)
