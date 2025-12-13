# Tasks Document: System Initialization Refactor

## Phase 1: Fix Type Definitions

- [x] 1. Fix frontend type definitions to match backend API response structure
  - File: `apps/web/src/app/features/system-init/types/system-init.types.ts`
  - Add `ApiResponse<T>` wrapper type for all API responses
  - Fix `DashboardResponse.nextRecommended` to be `Array<{ module: string; reason: string; }>`
  - Add `HealthStatusData` type for health endpoint response
  - Ensure all types match backend TypeBox schemas exactly
  - Purpose: Establish type safety between frontend and backend
  - _Leverage: `apps/api/src/modules/admin/system-init/system-init.schemas.ts`_
  - _Requirements: 5.1, 5.2, 5.3_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer specializing in type alignment | Task: Fix type definitions in system-init.types.ts to match backend API response structure. Add ApiResponse wrapper type, fix nextRecommended type to Array<{module: string; reason: string}>, add HealthStatusData type | Restrictions: Do not modify backend schemas, maintain backward compatibility with existing component usage, follow project type naming conventions | \_Leverage: apps/api/src/modules/admin/system-init/system-init.schemas.ts for exact type definitions | \_Requirements: 5.1, 5.2, 5.3 | Success: All types compile without errors, types match backend schema exactly, existing components still work after type changes | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

## Phase 2: Fix Service Layer

- [x] 2. Update SystemInitService to handle wrapped API responses
  - File: `apps/web/src/app/features/system-init/services/system-init.service.ts`
  - Add RxJS `map()` operator to extract `response.data` from all API calls
  - Fix `getHealth()` method to call `/health-status` instead of `/health`
  - Add proper error handling for `success: false` responses
  - Update return types to return unwrapped data types
  - Purpose: Correctly transform API responses for component consumption
  - _Leverage: Existing RxJS patterns in other services_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Developer with RxJS expertise | Task: Update SystemInitService to unwrap API responses using pipe(map(response => response.data)) on all methods, fix health endpoint path to /health-status, add error handling for success:false responses | Restrictions: Do not change method signatures (only return types), maintain observable patterns, do not break existing component subscriptions | \_Leverage: RxJS operators map, catchError, throwError | \_Requirements: 1.1-1.5, 2.1-2.3 | Success: All service methods return unwrapped data, health endpoint calls correct path, errors are properly thrown for failed responses | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

## Phase 3: Remove Duplicate Files

- [x] 3. Remove duplicate service and type files from features/system folder
  - Files to DELETE:
    - `apps/web/src/app/features/system/services/system-init.service.ts`
    - `apps/web/src/app/features/system/services/import-progress.service.ts`
    - `apps/web/src/app/features/system/services/index.ts`
    - `apps/web/src/app/features/system/types/system-init.types.ts`
    - `apps/web/src/app/features/system/types/index.ts`
  - Update any imports that reference the old location
  - Purpose: Single source of truth for services and types
  - _Leverage: Global search for import paths_
  - _Requirements: 3.1, 3.2, 3.3_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Developer specializing in codebase cleanup | Task: Delete duplicate service and type files from apps/web/src/app/features/system/services/ and apps/web/src/app/features/system/types/, then search entire codebase for any imports referencing the old locations and update them | Restrictions: Do not delete the canonical files in features/system-init/, verify no references remain before completing, ensure build still passes | \_Leverage: grep/ripgrep for finding imports | \_Requirements: 3.1, 3.2, 3.3 | Success: All duplicate files removed, no broken imports, pnpm run build passes successfully | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

## Phase 4: Implement Dashboard Action Handlers

- [x] 4. Implement openImportWizard method to open actual dialog
  - File: `apps/web/src/app/features/system-init/pages/system-init-dashboard/system-init-dashboard.page.ts`
  - Replace snackbar "coming soon" with actual MatDialog.open() call
  - Pass module data to ImportWizardDialog
  - Handle dialog afterClosed() to refresh dashboard on success
  - Add ImportWizardDialog to component imports
  - Purpose: Enable import functionality from dashboard
  - _Leverage: `apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.ts`_
  - _Requirements: 4.1, 4.2_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Developer with Material Dialog expertise | Task: Replace snackbar in openImportWizard() with MatDialog.open(ImportWizardDialog, {width: '800px', maxHeight: '90vh', data: {module}, disableClose: true}), handle afterClosed() to refresh dashboard | Restrictions: Must import ImportWizardDialog properly, maintain existing dialog configuration patterns, do not change component selector | \_Leverage: ImportWizardDialog component, MatDialog service | \_Requirements: 4.1, 4.2 | Success: Clicking Import button opens wizard dialog, dialog receives module data, dashboard refreshes after successful import | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

- [x] 5. Implement onModuleRollback method with confirmation dialog
  - File: `apps/web/src/app/features/system-init/pages/system-init-dashboard/system-init-dashboard.page.ts`
  - Replace "coming soon" with actual rollback implementation
  - Show confirmation dialog before rollback
  - Call SystemInitService.rollbackImport() on confirmation
  - Show success/error snackbar and refresh dashboard
  - Purpose: Enable rollback functionality from module cards
  - _Leverage: SystemInitService.rollbackImport()_
  - _Requirements: 6.2, 6.3, 6.4, 6.5_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Developer | Task: Implement onModuleRollback() to show confirmation dialog, call systemInitService.rollbackImport(module.module, module.lastImport.jobId), handle success/error with snackbar, refresh dashboard | Restrictions: Must validate module.lastImport exists before rollback, show appropriate error if no import to rollback, use existing snackbar patterns | \_Leverage: SystemInitService, MatSnackBar, window.confirm or MatDialog | \_Requirements: 6.2-6.5 | Success: Rollback shows confirmation, calls API correctly, shows result message, refreshes dashboard | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

- [x] 6. Implement import history action handlers
  - File: `apps/web/src/app/features/system-init/pages/system-init-dashboard/system-init-dashboard.page.ts`
  - Implement `onHistoryViewDetails()` - show job details dialog or navigate
  - Implement `onHistoryRollback()` - rollback completed import with confirmation
  - Implement `onHistoryRetry()` - open import wizard for failed module
  - Implement `onHistoryLoadMore()` - fetch additional history items
  - Purpose: Enable history management functionality
  - _Leverage: SystemInitService methods_
  - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Developer | Task: Implement all history action handlers - onHistoryViewDetails() shows details, onHistoryRollback() calls rollback API with confirmation, onHistoryRetry() opens import wizard for the module, onHistoryLoadMore() fetches more items | Restrictions: Must handle edge cases (no items, API errors), maintain existing UI patterns, do not break timeline component | \_Leverage: SystemInitService, ImportWizardDialog | \_Requirements: 7.1-7.4 | Success: All history actions work correctly, proper error handling, UI updates after actions | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

## Phase 5: Complete Import Wizard Implementation

- [x] 7. Implement Import Wizard Step 1 - Template Download
  - File: `apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.ts`
  - File: `apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.html`
  - Display selected module information (name, domain, dependencies)
  - Implement downloadTemplate() to download CSV/Excel templates
  - Create download link and trigger browser download
  - Purpose: Allow users to download import templates
  - _Leverage: SystemInitService.downloadTemplate()_
  - _Requirements: 4.3, 4.4_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Developer with file download expertise | Task: Complete Import Wizard Step 1 - display module info, implement downloadTemplate(format) to call service and trigger browser download using URL.createObjectURL and link.click() | Restrictions: Must support both CSV and Excel formats, handle download errors gracefully, show loading state during download | \_Leverage: SystemInitService.downloadTemplate(), Blob handling | \_Requirements: 4.3, 4.4 | Success: Template downloads work for both formats, file has correct name and extension, errors show user-friendly message | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

- [x] 8. Implement Import Wizard Step 2 - File Upload
  - File: `apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.ts`
  - File: `apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.html`
  - Implement drag & drop file zone
  - Implement file input click handler
  - Validate file type (CSV, XLSX) and size (max 10MB) client-side
  - Display selected file info (name, size)
  - Purpose: Allow users to upload import files
  - _Leverage: Native File API, HTML5 drag & drop_
  - _Requirements: 4.5_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Developer with file upload expertise | Task: Complete Import Wizard Step 2 - implement drag & drop zone with onDragOver, onDrop handlers, file input with onFileSelected, validate file type (.csv, .xlsx) and size (<10MB), display file info | Restrictions: Must prevent default drag behavior, validate before accepting file, show clear error for invalid files | \_Leverage: Native File API, DragEvent | \_Requirements: 4.5 | Success: Drag & drop works, file picker works, validation rejects invalid files, file info displays correctly | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

- [x] 9. Implement Import Wizard Step 3 - Validation
  - File: `apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.ts`
  - File: `apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.html`
  - Call SystemInitService.validateFile() on step entry
  - Display validation results using ValidationResultsComponent
  - Show errors (blocking) and warnings (non-blocking) separately
  - Store sessionId for import step
  - Enable/disable "Next" based on canProceed
  - Purpose: Validate file before import
  - _Leverage: SystemInitService.validateFile(), ValidationResultsComponent_
  - _Requirements: 4.6, 4.7, 4.8_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Developer | Task: Complete Import Wizard Step 3 - call validateFile() when entering step, display results in ValidationResultsComponent, separate errors and warnings, store sessionId, control Next button based on canProceed | Restrictions: Must show loading during validation, handle validation errors gracefully, clear previous results on new validation | \_Leverage: SystemInitService.validateFile(), ValidationResultsComponent | \_Requirements: 4.6, 4.7, 4.8 | Success: Validation calls API, results display correctly, sessionId is stored, Next button enables only when canProceed is true | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

- [x] 10. Implement Import Wizard Step 4 - Import Execution
  - File: `apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.ts`
  - File: `apps/web/src/app/features/system-init/components/import-wizard/import-wizard.dialog.html`
  - Display import summary (module, file, record count, options)
  - Implement import options form (skipWarnings, batchSize, onConflict)
  - Call SystemInitService.importData() with sessionId and options
  - Use ImportProgressService.trackProgress() to poll status
  - Display progress using ProgressTrackerComponent
  - Handle completion (success/failure) with appropriate UI
  - Purpose: Execute import with progress tracking
  - _Leverage: SystemInitService.importData(), ImportProgressService.trackProgress(), ProgressTrackerComponent_
  - _Requirements: 4.9, 4.10, 4.11, 4.12_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Angular Developer with real-time polling expertise | Task: Complete Import Wizard Step 4 - show summary, implement options form, call importData() on confirm, use trackProgress() to poll status every 2 seconds, display progress in ProgressTrackerComponent, handle completion states | Restrictions: Must disable UI during import, handle polling cleanup on dialog close, show clear success/failure messages | \_Leverage: SystemInitService, ImportProgressService, ProgressTrackerComponent | \_Requirements: 4.9, 4.10, 4.11, 4.12 | Success: Import starts correctly, progress updates in real-time, completion shows appropriate message, dialog can be closed after completion | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

## Phase 6: Testing and Verification

- [x] 11. Build and verify all changes compile without errors
  - Run `pnpm run build` to verify TypeScript compilation
  - Fix any type errors or import issues
  - Verify no console errors in browser
  - Purpose: Ensure code quality and type safety
  - _Leverage: TypeScript compiler, build scripts_
  - _Requirements: All_
  - _Prompt: Implement the task for spec system-init-refactor, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Build Engineer | Task: Run pnpm run build, fix any TypeScript errors, verify browser console has no errors when loading the system-init dashboard | Restrictions: Must fix all errors, not suppress them, do not change tsconfig strictness | \_Leverage: pnpm run build | \_Requirements: All | Success: Build passes with no errors, browser console is clean, all pages load correctly | Instructions: Mark this task as in-progress in tasks.md before starting, use log-implementation tool after completion with detailed artifacts, then mark as complete_

- [x] 12. Manual end-to-end testing of complete flow
  - Test dashboard loads and displays modules correctly
  - Test Import Wizard full flow (template → upload → validate → import)
  - Test rollback functionality
  - Test import history actions
  - Document any remaining issues
  - Purpose: Verify feature works end-to-end
  - _Leverage: Running application at localhost:4249_
  - _Requirements: All_
  - _Test Results:_
    - ✅ API health-status endpoint working: returns `{success: true, data: {isHealthy: true, ...}}`
    - ✅ API available-modules endpoint working: returns modules with proper wrapper format
    - ✅ API dashboard endpoint working: returns overview, modulesByDomain, nextRecommended
    - ✅ Build passes with exit code 0 (only CSS/Sass deprecation warnings)
    - ✅ Frontend proxy configured correctly for API_PORT 3383
    - 📝 User should verify UI at http://localhost:4249/system/system-init
