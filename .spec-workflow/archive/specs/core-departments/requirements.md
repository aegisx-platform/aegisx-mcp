# Requirements Document: Core Departments

## Introduction

ระบบ Departments (แผนก) เป็นข้อมูลพื้นฐานขององค์กรที่ใช้ร่วมกันในหลายระบบ เช่น ระบบหนังสือเวียน, ระบบจองรถ, ระบบห้องประชุม, และระบบคลังยา ปัจจุบัน departments อยู่ใน inventory module ซึ่งไม่เหมาะสมสำหรับการใช้งานข้ามระบบ

Feature นี้จะย้าย Departments มาเป็น Core module เพื่อให้:

- ทุกระบบสามารถใช้ข้อมูลแผนกร่วมกันได้
- ผูก User กับ Department สำหรับ authorization และ data filtering
- Import ผ่าน System Init เป็น core dependency

## Alignment with Product Vision

Core Departments สนับสนุนเป้าหมายของ platform:

- **Modularity**: แยก departments เป็น core ให้ทุก module ใช้ได้
- **Scalability**: รองรับระบบใหม่ที่ต้องใช้ข้อมูลแผนก
- **Maintainability**: Single source of truth สำหรับข้อมูลแผนก

## Requirements

### Requirement 1: Core Departments Data Model

**User Story:** As a system administrator, I want departments to be a core entity, so that all modules can share the same department data.

#### Acceptance Criteria

1. WHEN the system starts THEN the system SHALL have a `public.departments` table with fields: `id`, `dept_code`, `dept_name`, `parent_id`, `is_active`, `created_at`, `updated_at`
2. IF a department has a parent THEN the system SHALL support hierarchical structure via `parent_id` self-reference
3. WHEN migrating from inventory.departments THEN the system SHALL preserve all existing data and relationships

### Requirement 2: Core Departments API

**User Story:** As a developer, I want a REST API for departments at `/api/departments`, so that I can manage departments from any frontend or service.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/departments` THEN the system SHALL return a paginated list of departments with filtering and sorting
2. WHEN a GET request is made to `/api/departments/:id` THEN the system SHALL return the department details including parent information
3. WHEN a POST request is made to `/api/departments` with valid data THEN the system SHALL create a new department
4. WHEN a PUT request is made to `/api/departments/:id` THEN the system SHALL update the department
5. WHEN a DELETE request is made to `/api/departments/:id` AND no references exist THEN the system SHALL delete the department
6. IF a department has child departments or user assignments THEN the system SHALL prevent deletion with appropriate error message
7. WHEN a GET request is made to `/api/departments/dropdown` THEN the system SHALL return a simplified list for dropdowns

### Requirement 3: User-Department Association

**User Story:** As a system administrator, I want to assign users to departments, so that I can filter data and control access based on department membership.

#### Acceptance Criteria

1. WHEN a user is assigned to a department THEN the system SHALL create a record in `user_departments` table
2. IF a user has multiple department assignments THEN the system SHALL support marking one as primary
3. WHEN querying user profile THEN the system SHALL include department assignments
4. WHEN departments API is accessed THEN the system SHALL require `departments:read` permission
5. WHEN creating/updating departments THEN the system SHALL require `departments:create` or `departments:update` permission

### Requirement 4: System Init Import

**User Story:** As a system administrator, I want to import departments via System Init, so that I can set up the organization structure during initial deployment.

#### Acceptance Criteria

1. WHEN listing available import modules THEN the system SHALL show "Departments" as a core module with priority 1
2. WHEN importing departments THEN the system SHALL validate: unique dept_code, valid parent_id references
3. IF import fails THEN the system SHALL support rollback via batch_id tracking
4. WHEN downloading template THEN the system SHALL provide CSV/Excel with columns: `code`, `name`, `parent_code`, `is_active`

### Requirement 5: Inventory Extension (Optional)

**User Story:** As a hospital administrator, I want to add inventory-specific data to departments, so that I can use departments with drug consumption tracking.

#### Acceptance Criteria

1. WHEN inventory module is enabled THEN the system SHALL support extending departments with `consumption_group` and `his_code`
2. IF department_inventory_config exists THEN inventory module SHALL read extended data from this table
3. WHEN importing with inventory extension THEN the system SHALL accept additional columns: `consumption_group`, `his_code`

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: Core departments module handles only department CRUD and user associations
- **Modular Design**: Inventory extension is optional and separate from core
- **Dependency Management**: Core departments has no dependencies on other modules
- **Clear Interfaces**: Department service provides clean methods for other modules to query

### Performance

- Department list queries SHALL complete within 100ms for up to 1000 departments
- Dropdown endpoint SHALL be cached with appropriate TTL
- Hierarchical queries SHALL use efficient recursive CTE or adjacency list pattern

### Security

- All endpoints SHALL require authentication
- Permission-based access control (departments:read, departments:create, departments:update, departments:delete)
- User can only see departments based on their role (admin sees all, user sees assigned)

### Reliability

- Migration SHALL be reversible with rollback script
- Import SHALL use transactions to ensure atomicity
- Foreign key constraints SHALL prevent orphaned records

### Usability

- API SHALL follow existing patterns in the codebase
- Error messages SHALL be descriptive and actionable
- Import template SHALL include example data and validation hints
