# Tasks Document: System Init Core Discovery

- [x] 1. Update scanForImportServices to support multiple base paths
  - File: `apps/api/src/core/import/discovery/import-discovery.service.ts`
  - Modify `scanForImportServices()` method at line 140-175
  - Replace single `basePath` with `basePaths` array
  - Add loop to iterate over each path with existence check
  - Purpose: Enable discovery of import services from both modules and core directories
  - _Leverage: Existing `scanDirectory()` method - no changes needed_
  - _Requirements: REQ-1, REQ-3_
  - _Prompt: Implement the task for spec system-init-core-discovery, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with expertise in Node.js and file system operations | Task: Update the scanForImportServices() method in ImportDiscoveryService to scan both apps/api/src/modules and apps/api/src/core directories for import services. The change should be minimal (~10 lines), use an array of base paths and iterate over each, checking for directory existence before scanning. Must maintain backward compatibility with existing modules. | Restrictions: Do NOT modify scanDirectory() method, do NOT change any public interfaces, do NOT add new dependencies | Success: 1) Both directories are scanned, 2) departments appears in discovery logs, 3) Existing module discovery still works, 4) No errors if core directory is empty | After implementation: Mark task as in-progress in tasks.md before starting, log implementation with log-implementation tool when done, then mark as complete [x]_

- [x] 2. Verify departments discovery and System Init integration
  - Verification steps (no code changes)
  - Start API server and check logs for `[ImportDiscovery] Registered: departments`
  - Call `GET /api/system-init/modules` - verify departments appears with domain="core"
  - Download template: `GET /api/system-init/templates/departments` - verify columns
  - Test validation session creation with sample CSV
  - Purpose: Ensure departments is fully functional in System Init
  - _Leverage: Existing System Init API endpoints_
  - _Requirements: REQ-2_
  - _Prompt: Implement the task for spec system-init-core-discovery, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer with expertise in API testing | Task: Verify that departments import service is properly discovered and functional in System Init. Test all System Init endpoints with departments module including: GET /api/system-init/modules (should include departments), GET /api/system-init/templates/departments (should return valid template), POST /api/system-init/sessions for validation | Restrictions: This is verification only - no code changes, document any issues found | Success: 1) departments appears in modules list with domain="core" and priority=1, 2) Template download works with columns: code, name, parent_code, is_active, 3) Validation session can be created | After verification: Mark task as in-progress in tasks.md before starting, log verification results with log-implementation tool when done, then mark as complete [x]_
