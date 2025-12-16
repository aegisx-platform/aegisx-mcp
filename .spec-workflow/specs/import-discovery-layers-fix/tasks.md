# Tasks Document

## Overview

This spec fixes the Import Discovery Service to include the `layers/` directory in its scan path, enabling departments and other layer-based import services to be discovered by System Init.

**Total Tasks:** 4 tasks (1 code change + 3 verification tasks)
**Estimated Effort:** ~30 minutes (most tasks are verification)

---

- [x] 1. Add layers/ directory to import discovery scan path
  - **File:** `apps/api/src/layers/platform/import/discovery/import-discovery.service.ts`
  - **Lines:** 143-147 (basePaths array)
  - **Change:** Add `path.join(process.cwd(), 'apps/api/src/layers'),` to basePaths array
  - **Purpose:** Enable discovery of import services in platform, core, and domains layers
  - _Leverage: Existing scanDirectory() recursive algorithm, no changes needed to scan logic_
  - _Requirements: REQ-1, REQ-3, REQ-4_
  - _Prompt: Role: Backend Developer with expertise in Node.js file system operations and import/discovery patterns | Task: Modify the scanForImportServices() method in ImportDiscoveryService (apps/api/src/layers/platform/import/discovery/import-discovery.service.ts lines 143-147) to include layers/ directory in the scan path by adding path.join(process.cwd(), 'apps/api/src/layers') to the basePaths array, enabling automatic discovery of departments-import.service.ts and other layer-based import services | Restrictions: ONLY modify the basePaths array, do NOT change scanDirectory() or other methods, do NOT add error handling, maintain exact formatting, the change must be a single line addition | Success: basePaths array includes path.join(process.cwd(), 'apps/api/src/layers'), code compiles without errors, existing functionality unchanged, change is minimal (1 line added)_

- [x] 2. Restart API server and verify departments import service is discovered
  - **Command:** `pnpm run dev:api`
  - **Verification:** Check server startup logs for `[Platform ImportDiscovery] Registered: departments (Departments (แผนก))`
  - **Purpose:** Confirm discovery service finds and registers departments import service
  - _Leverage: Existing plugin initialization and logging in import-discovery.plugin.ts_
  - _Requirements: REQ-1, REQ-2_
  - _Prompt: Role: DevOps Engineer with expertise in Node.js server operations and log analysis | Task: Restart the API server (pnpm run dev:api) and verify that the Import Discovery Service successfully discovers and registers the departments import service from the layers/ directory by analyzing startup logs to confirm log message "[Platform ImportDiscovery] Registered: departments (Departments (แผนก))" appears, no validation errors occur, and discovery completes in under 100ms | Restrictions: Do NOT modify any code during this task, do NOT skip log verification, do NOT proceed if validation errors appear, must verify performance requirement (sub-100ms discovery time) | Success: API server starts without errors, log confirms departments import service is registered, no validation errors in discovery logs, discovery process completes in under 100ms, total discovered services count increased by 1_

- [x] 3. Verify departments module appears in System Init Dashboard
  - **URL:** http://localhost:4200/system/system-init
  - **API Endpoint:** `GET /v1/admin/system-init/modules`
  - **Expected:** Departments module with domain=core, priority=1, dependencies=[]
  - **Purpose:** Confirm System Init integration works correctly end-to-end
  - _Leverage: Existing System Init service and dashboard components_
  - _Requirements: REQ-2_
  - _Prompt: Role: QA Engineer with expertise in API testing and frontend verification | Task: Verify that the departments module appears correctly in the System Init Dashboard by testing both the API endpoint (GET /v1/admin/system-init/modules) and the frontend UI (http://localhost:4200/system/system-init), confirming departments appears with correct metadata (module=departments, domain=core, displayName=Departments (แผนก), priority=1, dependencies=[], supportsRollback=true, importStatus=not_started) and is selectable for import | Restrictions: Do NOT modify any code during verification, do NOT attempt to execute import (just verify visibility), must test both API and UI, all metadata must match expected values exactly | Success: API returns departments module with correct metadata, import order includes departments at priority 1, dashboard UI displays departments module correctly, all metadata fields show expected values, module is selectable for import_

- [x] 4. Create implementation logs and mark spec as complete
  - **Action:** Use log-implementation tool for completed tasks
  - **Purpose:** Document changes for future reference and searchable knowledge base
  - _Leverage: spec-workflow log-implementation MCP tool_
  - _Requirements: All requirements_
  - _Prompt: Role: Technical Documentation Specialist with expertise in implementation logging and knowledge management | Task: Document the complete implementation of the import-discovery-layers-fix spec by creating comprehensive implementation logs using log-implementation tool for Task 1 (taskId "1", summary "Added layers/ directory to ImportDiscoveryService scan path", filesModified ["apps/api/src/layers/platform/import/discovery/import-discovery.service.ts"], statistics {linesAdded: 1, linesRemoved: 0}, artifacts with functions array documenting scanForImportServices and integrations array describing ImportDiscoveryService→System Init data flow), verify all tasks marked as [x] in tasks.md, and confirm spec-status shows 100% completion | Restrictions: Do NOT skip artifact documentation, do NOT use generic summaries, must document exact file locations with line numbers, must describe integration data flow clearly | Success: Implementation log created for Task 1 with complete artifacts, all tasks in tasks.md marked as [x], spec-status shows 4/4 tasks completed, documentation is clear specific and searchable_
