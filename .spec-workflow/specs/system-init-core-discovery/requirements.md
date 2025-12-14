# Requirements Document: System Init Core Discovery

## Introduction

ปรับปรุง ImportDiscoveryService ให้สามารถค้นหา import services จาก `apps/api/src/core` นอกเหนือจาก `apps/api/src/modules` เพื่อให้ Core Departments และ core modules อื่นๆ สามารถใช้งาน System Init auto-discovery ได้

**ปัญหาปัจจุบัน:**

- `ImportDiscoveryService.scanForImportServices()` scan เฉพาะ `apps/api/src/modules`
- `departments-import.service.ts` อยู่ใน `apps/api/src/core/departments/`
- ทำให้ departments ไม่ปรากฏใน System Init dashboard

## Alignment with Product Vision

การปรับปรุงนี้สนับสนุน:

- **Core Master Data Management**: Departments เป็น core reference data ที่จำเป็นต้อง import ก่อน modules อื่น
- **Unified Import Experience**: ผู้ใช้สามารถ import ทั้ง core และ module data จาก System Init dashboard เดียว
- **Extensibility**: รองรับ core import services อื่นๆ ในอนาคต

## Requirements

### REQ-1: Multi-Path Directory Scanning

**User Story:** As a system administrator, I want the System Init to automatically discover import services from both modules and core directories, so that I can import all master data from a single interface.

#### Acceptance Criteria

1. WHEN ImportDiscoveryService.discoverServices() runs THEN it SHALL scan `apps/api/src/modules` directory
2. WHEN ImportDiscoveryService.discoverServices() runs THEN it SHALL also scan `apps/api/src/core` directory
3. IF a directory does not exist THEN the system SHALL skip it without errors
4. WHEN `*-import.service.ts` files are found in either directory THEN they SHALL be registered in the import registry

### REQ-2: Core Departments Discovery

**User Story:** As a system administrator, I want departments to appear in the System Init module list, so that I can bulk import organizational structure.

#### Acceptance Criteria

1. WHEN discovery completes THEN departments SHALL appear in `/api/system-init/modules` response
2. WHEN departments is discovered THEN it SHALL have domain="core" and priority=1
3. WHEN template is requested THEN `/api/system-init/templates/departments` SHALL return valid CSV/Excel template
4. WHEN import is executed THEN records SHALL be tagged with `import_batch_id` for rollback support

### REQ-3: Backward Compatibility

**User Story:** As a developer, I want the discovery changes to not affect existing module imports, so that current functionality remains stable.

#### Acceptance Criteria

1. WHEN discovery runs THEN all previously discovered modules SHALL still be discovered
2. WHEN modules directory is scanned first THEN existing import order SHALL be preserved
3. IF no import services exist in core directory THEN system SHALL continue normally

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Only modify `scanForImportServices()` method
- **Modular Design**: Use array of paths instead of hardcoded single path
- **Clear Interfaces**: No changes to public API or type definitions

### Performance

- Discovery SHALL complete in under 100ms (existing requirement)
- Additional directory scan SHALL add minimal overhead (<10ms)

### Reliability

- Directory existence check before scanning
- Graceful handling of missing directories
- No errors if core directory is empty

### Usability

- No user-facing changes required
- Departments auto-appears in System Init dashboard after deployment
