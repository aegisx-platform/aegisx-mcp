# Requirements Document: System Initialization Refactor

## Introduction

This specification addresses the refactoring of the **System Initialization Dashboard** feature located at `/system/system-init`. The current implementation has multiple critical issues preventing the feature from functioning correctly, including API response format mismatches, endpoint naming inconsistencies, unimplemented functionality, and duplicate service files.

The goal is to fix all issues so the dashboard works end-to-end, allowing administrators to:

- View available import modules with correct status
- Download templates for data import
- Upload and validate import files
- Execute imports with progress tracking
- View import history
- Rollback completed imports

## Alignment with Product Vision

This feature supports the product goal of providing a **centralized system initialization dashboard** for administrators to manage data imports through an auto-discovery import system. A working system initialization feature is critical for initial system setup and ongoing data management.

## Current Issues Analysis

### Issue 1: API Response Format Mismatch

**Problem**: Backend API returns wrapped responses with `{ success, data, meta }` structure, but frontend services expect unwrapped data directly.

**Backend Response Format**:

```json
{
  "success": true,
  "data": {
    "modules": [...],
    "totalModules": 12,
    "completedModules": 5,
    "pendingModules": 7
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-12-13T...",
    "version": "1.0"
  }
}
```

**Frontend Expected Format**:

```typescript
{
  modules: ImportModule[];
  totalModules: number;
  completedModules: number;
  pendingModules: number;
}
```

**Affected Endpoints**:

- `GET /api/admin/system-init/available-modules`
- `GET /api/admin/system-init/import-order`
- `GET /api/admin/system-init/dashboard`
- `POST /api/admin/system-init/module/:moduleName/validate`
- All other endpoints

### Issue 2: Health Endpoint Path Mismatch

**Problem**: Frontend service calls incorrect endpoint path.

**Backend Endpoint**: `GET /api/admin/system-init/health-status`
**Frontend Service Call**: `GET /api/admin/system-init/health`

### Issue 3: Duplicate Service Files

**Problem**: Service files are duplicated in two locations causing confusion and potential sync issues.

**Location 1** (correct - used by dashboard):

```
apps/web/src/app/features/system-init/services/
├── system-init.service.ts
├── import-progress.service.ts
└── index.ts
```

**Location 2** (duplicate):

```
apps/web/src/app/features/system/services/
├── system-init.service.ts
├── import-progress.service.ts
└── index.ts
```

### Issue 4: Import Wizard Not Implemented

**Problem**: The Import Wizard dialog exists but all action handlers show "coming soon" messages.

**Unimplemented Functions**:

- `openImportWizard()` - Shows snackbar instead of opening dialog
- `onModuleImport()` - Shows "Import wizard coming soon"
- `onModuleViewDetails()` - Shows "View details coming soon"
- `onModuleRollback()` - Shows "Rollback coming soon"
- `onHistoryViewDetails()` - Shows "View import details coming soon"
- `onHistoryRollback()` - Shows "Rollback import coming soon"
- `onHistoryRetry()` - Shows "Retry import coming soon"

### Issue 5: Type Mismatch in Dashboard Response

**Problem**: The `DashboardResponse.nextRecommended` type differs between frontend types and backend response.

**Backend Returns**:

```typescript
nextRecommended: Array<{ module: string; reason: string }>;
```

**Frontend Type Expects**:

```typescript
nextRecommended: string[]
```

## Requirements

### Requirement 1: Fix API Response Handling

**User Story**: As a frontend developer, I want the service layer to correctly handle wrapped API responses, so that the dashboard displays data correctly.

#### Acceptance Criteria

1. WHEN `SystemInitService.getAvailableModules()` receives a response THEN the service SHALL extract `response.data` and return the unwrapped data
2. WHEN `SystemInitService.getDashboard()` receives a response THEN the service SHALL extract `response.data` and return the unwrapped data
3. WHEN `SystemInitService.getImportOrder()` receives a response THEN the service SHALL extract `response.data` and return the unwrapped data
4. WHEN `SystemInitService.validateFile()` receives a response THEN the service SHALL extract `response.data` and return the unwrapped data
5. WHEN any API call fails with `success: false` THEN the service SHALL throw an error with the error message from response

### Requirement 2: Fix Health Endpoint Path

**User Story**: As a system administrator, I want to check system health status, so that I know if the import system is operational.

#### Acceptance Criteria

1. WHEN `SystemInitService.getHealth()` is called THEN the service SHALL call `/api/admin/system-init/health-status` endpoint
2. IF the health check returns `isHealthy: true` THEN the UI SHALL display healthy status
3. IF the health check returns validation errors THEN the UI SHALL display the errors

### Requirement 3: Remove Duplicate Service Files

**User Story**: As a developer, I want a single source of truth for service files, so that code maintenance is simplified.

#### Acceptance Criteria

1. WHEN the refactor is complete THEN there SHALL be only one set of service files in `apps/web/src/app/features/system-init/services/`
2. WHEN the refactor is complete THEN the duplicate files in `apps/web/src/app/features/system/services/` SHALL be removed
3. IF any components reference the duplicate location THEN those imports SHALL be updated to the correct location

### Requirement 4: Implement Import Wizard Dialog

**User Story**: As a system administrator, I want to use the Import Wizard to import data for modules, so that I can initialize system data efficiently.

#### Acceptance Criteria

1. WHEN user clicks "Import" on a module card THEN the system SHALL open the Import Wizard dialog
2. WHEN the wizard opens THEN it SHALL display Step 1 with module info and template download options
3. WHEN user clicks "Download CSV Template" THEN the system SHALL download the template file
4. WHEN user clicks "Download Excel Template" THEN the system SHALL download the Excel template file
5. WHEN user selects a file in Step 2 THEN the system SHALL display file info and enable the validate button
6. WHEN user clicks "Validate" THEN the system SHALL upload and validate the file via API
7. IF validation succeeds THEN the system SHALL display validation results and enable import button
8. IF validation fails with errors THEN the system SHALL display errors and disable import button
9. WHEN user clicks "Start Import" in Step 4 THEN the system SHALL execute the import job
10. WHEN import is in progress THEN the system SHALL poll for status and display progress
11. WHEN import completes successfully THEN the system SHALL display success message with statistics
12. IF import fails THEN the system SHALL display error message with details

### Requirement 5: Fix Type Definitions

**User Story**: As a developer, I want consistent type definitions between frontend and backend, so that data flows correctly.

#### Acceptance Criteria

1. WHEN `DashboardResponse` type is defined THEN `nextRecommended` SHALL be `Array<{ module: string; reason: string; }>`
2. WHEN API response types are defined THEN they SHALL match the backend response structure exactly
3. WHEN the `ImportHistoryItem` type is used THEN it SHALL match the backend `ImportHistoryRecord` schema

### Requirement 6: Implement Module Actions

**User Story**: As a system administrator, I want functional module actions (view details, rollback), so that I can manage imported data.

#### Acceptance Criteria

1. WHEN user clicks "View Details" on a completed module THEN the system SHALL display module import details
2. WHEN user clicks "Rollback" on a completed module THEN the system SHALL show confirmation dialog
3. IF user confirms rollback THEN the system SHALL call rollback API and refresh dashboard
4. IF rollback succeeds THEN the system SHALL display success message
5. IF rollback fails THEN the system SHALL display error message

### Requirement 7: Implement Import History Actions

**User Story**: As a system administrator, I want functional import history actions, so that I can manage past imports.

#### Acceptance Criteria

1. WHEN user clicks "View Details" on a history item THEN the system SHALL display import job details
2. WHEN user clicks "Rollback" on a completed history item THEN the system SHALL execute rollback
3. WHEN user clicks "Retry" on a failed history item THEN the system SHALL open import wizard for that module
4. WHEN user clicks "Load More" THEN the system SHALL fetch additional history items

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Each service method shall handle one API endpoint
- **Modular Design**: Components shall be reusable and self-contained
- **Dependency Management**: Services shall use Angular's dependency injection
- **Clear Interfaces**: Type definitions shall be complete and accurate

### Performance

- Dashboard shall load in under 2 seconds
- Import progress polling shall use 2-second intervals
- File validation shall support files up to 10MB
- Auto-refresh shall occur every 30 seconds without UI jank

### Security

- All API calls shall include authentication token
- File uploads shall validate file type and size client-side
- Session IDs shall be handled securely in memory

### Reliability

- Network errors shall be handled gracefully with user-friendly messages
- Import operations shall be resumable after page refresh (via job ID)
- Rollback functionality shall preserve data integrity

### Usability

- All buttons shall show loading state during async operations
- Error messages shall be actionable and user-friendly
- Progress indicators shall show percentage and estimated time
- Wizard shall allow navigation between steps without losing state
