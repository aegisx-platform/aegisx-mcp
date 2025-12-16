# Requirements Document

## Introduction

The Import Discovery Service currently scans only `apps/api/src/modules/` and `apps/api/src/core/` directories to discover import services decorated with `@ImportService`. However, with the introduction of layered architecture (`apps/api/src/layers/`), import services located in platform, core, and domain layers are not being discovered. This causes critical modules like departments to be invisible to System Init Dashboard, preventing data imports.

This specification addresses the need to expand the scanner's coverage to include the `layers/` directory structure, ensuring all import services across the codebase are discovered and registered properly.

**Value to Users:**

- System administrators can import departments data through System Init Dashboard
- All platform and domain import services are automatically discovered
- Proper import order recommendations based on dependencies

## Alignment with Product Vision

This fix aligns with the platform's commitment to:

- **Modular Architecture**: Supporting the new layered architecture (platform/core/domains)
- **Auto-Discovery**: Maintaining zero-configuration import service registration
- **Developer Experience**: Allowing developers to place import services in appropriate architectural layers without manual registration

## Requirements

### REQ-1: Comprehensive Import Service Discovery

**User Story:** As a **System Administrator**, I want the system to **automatically discover all import services across all architectural layers**, so that **I can import data for all modules through System Init Dashboard without manual configuration**.

#### Acceptance Criteria

1. WHEN the API server starts THEN the Import Discovery Service SHALL scan `apps/api/src/modules/`, `apps/api/src/core/`, AND `apps/api/src/layers/` directories
2. WHEN an import service file exists in any scanned directory THEN it SHALL be discovered and registered in the import registry
3. WHEN the discovery process completes THEN it SHALL log the total number of discovered services including those from layers directory
4. IF an import service is located in `apps/api/src/layers/platform/departments/` THEN it SHALL be included in the discovered services list

### REQ-2: Departments Import Service Visibility

**User Story:** As a **System Administrator**, I want to **see Departments module in System Init Dashboard**, so that **I can import departments master data into the system**.

#### Acceptance Criteria

1. WHEN accessing System Init Dashboard THEN the available modules list SHALL include "Departments (แผนก)"
2. WHEN viewing departments module details THEN it SHALL show:
   - Module: departments
   - Domain: core
   - Display Name: Departments (แผนก)
   - Priority: 1
   - Dependencies: []
   - Supports Rollback: true
3. WHEN checking import order THEN departments SHALL appear at priority level 1 (high priority, no dependencies)

### REQ-3: Backward Compatibility

**User Story:** As a **Developer**, I want **existing import services in modules/ and core/ to continue working**, so that **the fix doesn't break current functionality**.

#### Acceptance Criteria

1. WHEN the enhanced scanner runs THEN all existing import services in `modules/` and `core/` SHALL still be discovered
2. WHEN comparing discovery results before and after the change THEN all previously discovered services SHALL remain in the registry
3. IF there are existing import jobs THEN they SHALL continue to function without changes

### REQ-4: Discovery Performance Maintenance

**User Story:** As a **Platform Engineer**, I want **import service discovery to remain fast**, so that **API server startup time is not impacted**.

#### Acceptance Criteria

1. WHEN discovery scans all three base paths (modules, core, layers) THEN it SHALL complete within 100ms for up to 30+ import services
2. IF discovery exceeds 100ms THEN it SHALL log a performance warning
3. WHEN scanning the layers directory THEN it SHALL use the same efficient recursive directory traversal algorithm

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: The scanner modification affects only the `scanForImportServices()` method
- **Modular Design**: No changes to decorator registration, dependency graph building, or service instantiation logic
- **Dependency Management**: No new dependencies introduced
- **Clear Interfaces**: The `ImportDiscoveryService` interface remains unchanged

### Performance

- Discovery process SHALL complete in under 100ms for 30+ import services (existing requirement)
- Directory traversal SHALL be efficient using Node.js fs operations
- No performance degradation for existing scan paths

### Security

- File scanning SHALL be restricted to application source directories only
- No scanning of `node_modules/`, test files, or system directories
- Path traversal protection SHALL be maintained

### Reliability

- Discovery SHALL handle missing directories gracefully (e.g., if layers/ doesn't exist yet)
- All discovered services SHALL be validated for decorator metadata
- Circular dependencies SHALL be detected across all discovered services
- Zero validation errors for properly decorated import services

### Maintainability

- The change SHALL be a single-line addition to the basePaths array
- Code comments SHALL be updated to reflect all scanned directories
- Discovery logs SHALL clearly indicate which directories were scanned
