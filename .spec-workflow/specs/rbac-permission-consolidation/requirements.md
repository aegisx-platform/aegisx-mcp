# Requirements Document - RBAC Permission Consolidation

## Introduction

This specification addresses the architectural redundancy in the permission system where permissions are managed in two separate locations: the RBAC (Role-Based Access Control) system and department-level permission flags. Currently, the system has:

1. **RBAC System**: Centralized permission management through `roles` → `role_permissions` → `permissions`
2. **Department Permission Flags**: Direct permission flags in `user_departments` table (`can_create_requests`, `can_edit_requests`, etc.)

This duplication creates maintenance overhead, potential inconsistencies, and architectural confusion. The purpose of this refactoring is to **consolidate all permission logic into the RBAC system** and simplify the `user_departments` table to serve purely as an organizational structure (department membership) without permission management.

**Value to Users:**

- Consistent permission behavior across the entire application
- Simplified permission management through a single system
- Reduced risk of permission conflicts or inconsistencies
- Easier permission auditing and compliance reporting

## Alignment with Product Vision

This refactoring aligns with the enterprise-grade system architecture goals by:

- Establishing RBAC as the single source of truth for all permissions
- Simplifying the data model to reduce complexity
- Improving maintainability and scalability of the permission system
- Following industry best practices for permission management in enterprise applications

## Requirements

### Requirement 1: Remove Department-Level Permission Flags

**User Story:** As a system architect, I want to remove all permission flags from the `user_departments` table, so that permissions are managed solely through RBAC and the data model is simplified.

#### Acceptance Criteria

1. WHEN reviewing the `user_departments` table schema THEN the system SHALL NOT contain any of the following columns:
   - `can_create_requests`
   - `can_edit_requests`
   - `can_submit_requests`
   - `can_approve_requests`
   - `can_view_reports`

2. WHEN a migration is created to remove these columns THEN the system SHALL:
   - Create a reversible migration (with up and down methods)
   - Include a data preservation strategy if needed
   - Document the changes in migration comments

3. WHEN the migration is applied THEN the system SHALL:
   - Successfully remove all permission flag columns
   - Preserve all other user-department relationship data
   - Maintain data integrity for existing relationships

### Requirement 2: Preserve Department Organizational Structure

**User Story:** As a system administrator, I want departments to continue representing organizational structure and membership, so that users can still be assigned to departments without mixing permission logic.

#### Acceptance Criteria

1. WHEN the refactoring is complete THEN the `user_departments` table SHALL contain only:
   - `id` (UUID) - Primary key
   - `user_id` (UUID) - Foreign key to users
   - `department_id` (INTEGER) - Foreign key to departments
   - `hospital_id` (UUID) - Hospital context
   - `is_primary` (BOOLEAN) - Primary department flag
   - `assigned_role` (VARCHAR) - Optional role within department (e.g., "Head", "Deputy")
   - `valid_from` (TIMESTAMP) - Assignment start date
   - `valid_until` (TIMESTAMP) - Assignment end date (nullable)
   - `assigned_by` (UUID) - Who made the assignment
   - `assigned_at` (TIMESTAMP) - When assignment was made
   - `notes` (TEXT) - Optional assignment notes
   - Standard audit fields (created_at, updated_at, created_by, updated_by)

2. WHEN querying user departments THEN the system SHALL return organizational membership without permission data

3. WHEN displaying user department information THEN the system SHALL show:
   - Department name and code
   - Assignment dates (valid_from, valid_until)
   - Primary department indicator
   - Assigned role (if any)

### Requirement 3: Update Backend Services to Use RBAC

**User Story:** As a backend developer, I want all services to check permissions through RBAC decorators and middleware, so that permission logic is centralized and consistent.

#### Acceptance Criteria

1. WHEN implementing permission checks THEN the system SHALL use RBAC decorators:
   - `@RequirePermissions(['resource:action'])`
   - `@RequireRole(['role-name'])`

2. WHEN a service needs to verify permissions THEN the system SHALL:
   - Call RBAC permission checker methods
   - NOT read permission flags from user_departments
   - Use the existing permission cache for performance

3. IF code exists that checks department permission flags THEN the system SHALL:
   - Identify all such code locations through grep/search
   - Replace with RBAC permission checks
   - Document the mapping of old flags to RBAC permissions

### Requirement 4: Map Department Permission Flags to RBAC Permissions

**User Story:** As a system designer, I want a clear mapping from old department flags to RBAC permissions, so that existing functionality is preserved after refactoring.

#### Acceptance Criteria

1. WHEN defining the permission mapping THEN the system SHALL document:

   ```
   Department Flag          → RBAC Permission
   can_create_requests     → budget-requests:create
   can_edit_requests       → budget-requests:update
   can_submit_requests     → budget-requests:submit
   can_approve_requests    → budget-requests:approve
   can_view_reports        → reports:read
   ```

2. WHEN users had department flags enabled THEN the system SHALL ensure:
   - Equivalent RBAC permissions are assigned to appropriate roles
   - No loss of access for existing users
   - Clear audit trail of permission changes

3. IF a department flag had no direct RBAC equivalent THEN the system SHALL:
   - Create the appropriate RBAC permission
   - Assign it to relevant roles
   - Document the new permission in the permissions table

### Requirement 5: Update UserDepartmentsService

**User Story:** As a backend developer, I want the UserDepartmentsService to focus only on department membership management, so that it follows the single responsibility principle.

#### Acceptance Criteria

1. WHEN the UserDepartmentsService is refactored THEN it SHALL:
   - Remove all methods that assign or check permission flags
   - Keep methods for department assignment/removal
   - Keep methods for querying user's departments
   - NOT perform any permission validation

2. WHEN assigning a user to a department THEN the service SHALL:
   - Validate user and department exist
   - Create the user_departments record with organizational data only
   - NOT set any permission flags (removed)

3. WHEN removing a user from a department THEN the service SHALL:
   - Update the valid_until date or delete the record
   - NOT affect user's RBAC permissions

### Requirement 6: Update TypeBox Schemas

**User Story:** As a frontend developer, I want TypeBox schemas to reflect the new structure, so that API contracts are accurate and type-safe.

#### Acceptance Criteria

1. WHEN updating schemas THEN the system SHALL remove:
   - Permission flag fields from request/response schemas
   - Validation rules for permission flags

2. WHEN defining user-department schemas THEN they SHALL include only:
   - Organizational relationship fields
   - Assignment metadata (dates, assigned_by, notes)
   - NOT include any permission fields

3. WHEN API responses return department data THEN they SHALL:
   - Exclude all permission flags
   - Include only organizational information

### Requirement 7: Update Frontend Components

**User Story:** As a frontend developer, I want to remove all code that reads or displays department permission flags, so that the UI reflects the new RBAC-only architecture.

#### Acceptance Criteria

1. WHEN reviewing frontend code THEN the system SHALL identify:
   - All components that display department permission flags
   - All forms that edit department permission flags
   - All services that send permission flag data

2. WHEN updating frontend components THEN the system SHALL:
   - Remove UI elements for department permission flags
   - Use RBAC permission checks instead (via auth service)
   - Update component logic to work without flag data

3. IF a component needs to check permissions THEN it SHALL:
   - Use the existing RBAC permission guard/directive
   - NOT check department-related permission properties

### Requirement 8: Database Migration Strategy

**User Story:** As a database administrator, I want a safe migration strategy, so that the database changes can be applied without data loss or downtime.

#### Acceptance Criteria

1. WHEN creating the migration THEN the system SHALL:
   - Generate a timestamped migration file
   - Include both up (drop columns) and down (restore columns) methods
   - Add safety checks to prevent data loss

2. WHEN the migration runs in production THEN the system SHALL:
   - Log all actions clearly
   - Complete within acceptable timeframe (under 5 seconds for typical data volumes)
   - Support rollback if issues occur

3. IF users currently have department permission flags set THEN the migration SHALL:
   - Optionally export existing flag data to a backup table
   - Provide a script to verify RBAC permissions are correctly assigned
   - Document how to restore permissions if needed

### Requirement 9: Update API Documentation

**User Story:** As an API consumer, I want updated API documentation, so that I understand the new department and permission endpoints.

#### Acceptance Criteria

1. WHEN generating Swagger/OpenAPI docs THEN the system SHALL:
   - Show updated schemas without permission flags
   - Mark old permission-related endpoints as deprecated (if any exist)
   - Document the proper way to check permissions (via RBAC)

2. WHEN documenting department endpoints THEN the system SHALL explain:
   - Departments are organizational units only
   - Permissions are managed through RBAC
   - How to assign roles to users for permission management

### Requirement 10: Backward Compatibility and Migration Path

**User Story:** As a system administrator, I want a clear migration path for existing deployments, so that the system can be upgraded without disruption.

#### Acceptance Criteria

1. WHEN planning the migration THEN the system SHALL provide:
   - Step-by-step upgrade instructions
   - Script to verify current permission assignments
   - Script to assign equivalent RBAC permissions based on old flags

2. WHEN upgrading a production system THEN the administrator SHALL be able to:
   - Run a pre-migration check to identify affected users
   - Apply the migration with confidence
   - Verify that all users retain their access levels

3. IF issues are discovered after migration THEN the system SHALL:
   - Support rollback to previous state
   - Provide detailed logs for troubleshooting
   - Document how to manually fix permission assignments

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: UserDepartmentsService handles only department membership; RBAC services handle only permissions
- **Separation of Concerns**: Department structure is completely independent from permission logic
- **Clear Interfaces**: Department APIs return organizational data; permission checks use RBAC APIs
- **Dependency Management**: Department code does not depend on permission flag logic

### Performance

- **Permission Checks**: Must use existing RBAC permission cache (no performance regression)
- **Database Queries**: Removing unused columns may slightly improve query performance
- **Migration Execution**: Must complete in under 5 seconds for databases with up to 100,000 user-department records

### Security

- **No Permission Bypass**: Ensure no code paths check removed permission flags (would fail open)
- **Audit Trail**: Maintain audit logs of all permission changes during migration
- **Access Control**: Verify that all existing access controls continue to work after refactoring

### Reliability

- **Zero Downtime**: Migration should support online execution if possible
- **Rollback Support**: All changes must be reversible
- **Data Integrity**: Foreign key constraints and relationships must remain intact

### Maintainability

- **Code Clarity**: Remove all references to department permission flags
- **Documentation**: Update all relevant documentation to reflect RBAC-only approach
- **Testing**: Update all tests to use RBAC permission checks instead of flag checks

### Testability

- **Unit Tests**: Update service tests to remove permission flag scenarios
- **Integration Tests**: Verify department operations work without permission data
- **E2E Tests**: Ensure UI flows work with RBAC-based permissions only
