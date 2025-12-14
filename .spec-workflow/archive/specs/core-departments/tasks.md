# Tasks Document: Core Departments

## Phase 1: Database Migration

- [x] 1. Create migration for public.departments table
  - File: `apps/api/src/database/migrations/YYYYMMDDHHMMSS_create_departments.ts`
  - Create `public.departments` table with fields: id, dept_code, dept_name, parent_id, is_active, import_batch_id, created_at, updated_at
  - Add indexes: parent_id, is_active, import_batch_id
  - Add unique constraint on dept_code
  - Purpose: Create core departments table in public schema
  - _Leverage: `apps/api/src/database/migrations-inventory/20251205000004_create_departments.ts` (reference pattern)_
  - _Requirements: 1.1, 1.2_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Database Migration Developer | Task: Create Knex migration for public.departments table following requirements 1.1 and 1.2, using existing migration patterns from migrations-inventory | Restrictions: Use public schema not inventory, do not include inventory-specific fields (consumption_group, his_code, hospital_id), follow existing migration naming convention | Success: Migration runs successfully, table created with correct structure, indexes and constraints applied | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 2. Create migration to add departments permissions
  - File: `apps/api/src/database/migrations/YYYYMMDDHHMMSS_add_departments_permissions.ts`
  - Add permissions: departments:read, departments:create, departments:update, departments:delete, departments:export
  - Assign to admin role
  - Purpose: Set up RBAC permissions for departments module
  - _Leverage: `apps/api/src/database/migrations-inventory/20251208020428_add_departments_permissions.ts`_
  - _Requirements: 3.4, 3.5_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Security Developer | Task: Create migration for departments permissions following requirements 3.4 and 3.5 | Restrictions: Follow existing permission naming pattern, assign to existing admin role | Success: Permissions created and assigned, no duplicate entries | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

## Phase 2: Core Module Implementation

- [x] 3. Create departments TypeBox schemas
  - File: `apps/api/src/core/departments/departments.schemas.ts`
  - Define schemas: DepartmentsSchema, CreateDepartmentsSchema, UpdateDepartmentsSchema, DepartmentsIdParamSchema, ListDepartmentsQuerySchema
  - Export types from schemas
  - Purpose: Type-safe validation for API requests/responses
  - _Leverage: `apps/api/src/modules/inventory/master-data/departments/departments.schemas.ts`, `apps/api/src/core/users/users.schemas.ts`_
  - _Requirements: 1.1, 2.1_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer specializing in TypeBox | Task: Create TypeBox schemas for departments following requirements 1.1 and 2.1, adapting from inventory departments schemas but removing inventory-specific fields | Restrictions: Do not include consumption_group, his_code, hospital_id, use same TypeBox patterns as users module | Success: All schemas compile, types exported correctly, validation works | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 4. Create departments types
  - File: `apps/api/src/core/departments/departments.types.ts`
  - Define TypeScript interfaces: Department, CreateDepartment, UpdateDepartment
  - Define error codes enum: DepartmentsErrorCode
  - Purpose: Runtime types for departments module
  - _Leverage: `apps/api/src/modules/inventory/master-data/departments/departments.types.ts`_
  - _Requirements: 1.1_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: TypeScript Developer | Task: Create TypeScript types and error codes for departments | Restrictions: Keep core types minimal without inventory-specific fields | Success: Types compile correctly, error codes defined | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 5. Create departments repository
  - File: `apps/api/src/core/departments/departments.repository.ts`
  - Extend BaseRepository with department-specific methods
  - Implement: findAll, findById, findByCode, create, update, delete, getHierarchy, getDropdown, canBeDeleted
  - Use public.departments table
  - Purpose: Database operations for departments
  - _Leverage: `apps/api/src/modules/inventory/master-data/departments/departments.repository.ts`, `apps/api/src/core/base/base.repository.ts`_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer with Knex expertise | Task: Create DepartmentsRepository extending BaseRepository for all CRUD operations following requirements 2.1-2.7 | Restrictions: Use 'departments' table name (public schema), adapt from inventory repository but remove inventory-specific queries, check user_departments for delete validation | Success: All repository methods work, queries are efficient, proper error handling | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 6. Create departments service
  - File: `apps/api/src/core/departments/departments.service.ts`
  - Extend BaseService with business logic
  - Implement validation, hierarchy checks, delete prevention
  - Purpose: Business logic layer for departments
  - _Leverage: `apps/api/src/modules/inventory/master-data/departments/departments.service.ts`, `apps/api/src/core/base/base.service.ts`_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Backend Developer | Task: Create DepartmentsService with business logic, validation, and hierarchy management following requirements 2.1-2.6 | Restrictions: Follow existing service patterns, validate circular hierarchy, check references before delete | Success: Service methods work correctly, validation prevents invalid data, proper error messages | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 7. Create departments controller
  - File: `apps/api/src/core/departments/departments.controller.ts`
  - Handle HTTP requests: list, getById, create, update, delete, dropdown, hierarchy
  - Format responses using standard patterns
  - Purpose: HTTP request handling for departments API
  - _Leverage: `apps/api/src/modules/inventory/master-data/departments/departments.controller.ts`, `apps/api/src/core/users/users.controller.ts`_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: API Developer | Task: Create DepartmentsController handling all HTTP endpoints following requirements 2.1-2.7 | Restrictions: Use standard response format, follow existing controller patterns from users module | Success: All endpoints return correct responses, proper status codes, error handling works | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 8. Create departments routes
  - File: `apps/api/src/core/departments/departments.routes.ts`
  - Define routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id, GET /dropdown, GET /hierarchy
  - Add authentication and permission middleware
  - Purpose: API route definitions with validation
  - _Leverage: `apps/api/src/modules/inventory/master-data/departments/departments.route.ts`, `apps/api/src/core/users/users.routes.ts`_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.4, 3.5_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: API Developer | Task: Create departments routes with authentication and permission checks following requirements 2.1-2.7 and 3.4-3.5 | Restrictions: Use departments:\* permissions, follow existing route patterns, add schema validation | Success: All routes work with proper auth, permissions checked, validation applied | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 9. Create departments plugin and index
  - File: `apps/api/src/core/departments/index.ts`
  - Create Fastify plugin for departments module
  - Export all components (Repository, Service, Controller, schemas, types)
  - Register routes under `/departments` prefix
  - Purpose: Module entry point and plugin registration
  - _Leverage: `apps/api/src/modules/inventory/master-data/departments/index.ts`, `apps/api/src/core/users/index.ts`_
  - _Requirements: 2.1_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Fastify Developer | Task: Create departments plugin and module exports | Restrictions: Follow existing plugin patterns, register under /departments prefix | Success: Plugin registers correctly, all exports available, routes accessible | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 10. Register departments plugin in app
  - File: `apps/api/src/app.ts` or appropriate bootstrap file
  - Register departments plugin from core
  - Ensure proper load order (after auth, before feature modules)
  - Purpose: Enable departments API in application
  - _Leverage: `apps/api/src/app.ts`, `apps/api/src/bootstrap/plugin.loader.ts`_
  - _Requirements: 2.1_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Fastify Developer | Task: Register departments plugin in application bootstrap | Restrictions: Maintain proper plugin load order, follow existing registration patterns | Success: Departments API accessible at /api/departments, no conflicts with other routes | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

## Phase 3: Import Service

- [x] 11. Create departments import service
  - File: `apps/api/src/core/departments/departments-import.service.ts`
  - Extend BaseImportService with @ImportService decorator
  - Set domain: 'core', priority: 1, dependencies: []
  - Implement: getTemplateColumns, validateRow, insertBatch, performRollback
  - Template columns: code, name, parent_code, is_active
  - Purpose: Enable departments import via System Init
  - _Leverage: `apps/api/src/modules/inventory/master-data/departments/departments-import.service.ts`, `apps/api/src/core/import/base/base-import.service.ts`_
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Import System Developer | Task: Create DepartmentsImportService for System Init following requirements 4.1-4.4 | Restrictions: Use domain 'core' not 'inventory', priority 1, no dependencies, validate parent_code references | Success: Import service discovered by System Init, template downloads correctly, import and rollback work | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

## Phase 4: Data Migration

- [x] 12. Create data migration from inventory.departments
  - File: `apps/api/src/database/migrations/YYYYMMDDHHMMSS_migrate_departments_data.ts`
  - Copy data from inventory.departments to public.departments
  - Reset sequence to max id
  - Handle parent_id references correctly
  - Purpose: Migrate existing department data to new table
  - _Leverage: Design document migration plan_
  - _Requirements: 1.3_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Database Migration Developer | Task: Create data migration from inventory.departments to public.departments following requirement 1.3 | Restrictions: Preserve all existing data, maintain id values, update sequence correctly | Success: All data migrated, ids preserved, parent_id references intact | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 13. Update user_departments foreign key
  - File: `apps/api/src/database/migrations/YYYYMMDDHHMMSS_update_user_departments_fk.ts`
  - Drop old FK to inventory.departments
  - Add new FK to public.departments
  - Purpose: Point user_departments to new core table
  - _Leverage: Design document migration plan_
  - _Requirements: 3.1_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Database Migration Developer | Task: Update user_departments FK from inventory.departments to public.departments following requirement 3.1 | Restrictions: Ensure FK constraint is valid, data integrity maintained | Success: FK updated, no orphaned records, user_departments queries work | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

## Phase 5: Inventory Extension (Optional)

- [x] 14. Create department_inventory_config table
  - File: `apps/api/src/database/migrations-inventory/20251214060012_create_department_inventory_config.ts`
  - Create inventory.department_inventory_config table
  - Fields: id, department_id (FK to public.departments), consumption_group, his_code
  - Migrate existing data from inventory.departments
  - Purpose: Store inventory-specific department data separately
  - _Leverage: Design document migration plan_
  - _Requirements: 5.1, 5.2_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Database Migration Developer | Task: Create department_inventory_config extension table following requirements 5.1 and 5.2 | Restrictions: Use inventory schema, FK to public.departments, migrate existing consumption_group and his_code | Success: Extension table created, data migrated, FK works | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 15. Update inventory module FKs
  - File: `apps/api/src/database/migrations-inventory/YYYYMMDDHHMMSS_update_inventory_fks.ts`
  - Update FK in: budget_allocations, budget_plans, purchase_requests, drug_distributions, drug_returns
  - Point to public.departments instead of inventory.departments
  - Purpose: Redirect inventory tables to core departments
  - _Leverage: Design document migration plan_
  - _Requirements: 1.3_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Database Migration Developer | Task: Update all inventory module FKs to reference public.departments | Restrictions: Update all tables listed in design, maintain data integrity | Success: All FKs updated, no constraint violations, queries work | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

## Phase 6: Cleanup

- [x] 16. Remove old inventory departments module
  - Files to remove/modify:
    - Remove: `apps/api/src/modules/inventory/master-data/departments/` (entire folder)
    - Modify: Update inventory module index to remove departments export
  - Purpose: Clean up old code after migration complete
  - _Requirements: All_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Code Cleanup Developer | Task: Remove old inventory departments module and update exports | Restrictions: Only remove after verifying all migrations successful, update inventory module index | Success: Old code removed, no broken imports, inventory module still works | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 17. Drop old inventory.departments table
  - File: `apps/api/src/database/migrations-inventory/YYYYMMDDHHMMSS_drop_old_departments.ts`
  - Drop inventory.departments table
  - Add safety check to verify data migrated
  - Purpose: Remove redundant table after successful migration
  - _Requirements: All_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: Database Migration Developer | Task: Create migration to drop inventory.departments table | Restrictions: Add verification that public.departments has data, make reversible if possible | Success: Old table dropped, no data loss, system still works | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

## Phase 7: Testing

- [x] 18. Create departments unit tests
  - File: `apps/api/src/core/departments/__tests__/departments.test.ts`
  - Test repository, service, and controller methods
  - Test validation and error handling
  - Purpose: Ensure module reliability
  - _Leverage: `apps/api/src/modules/inventory/master-data/departments/__tests__/departments.test.ts`_
  - _Requirements: All_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Create comprehensive unit tests for departments module | Restrictions: Test all CRUD operations, validation, error cases, use existing test patterns | Success: All tests pass, good coverage, edge cases tested | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

- [x] 19. Create departments integration tests
  - File: `apps/api/src/core/departments/__tests__/departments.integration.test.ts`
  - Test API endpoints end-to-end
  - Test authentication and permissions
  - Test import and rollback
  - Purpose: Verify API works correctly
  - _Leverage: Existing integration test patterns_
  - _Requirements: All_
  - _Prompt: Implement the task for spec core-departments, first run spec-workflow-guide to get the workflow guide then implement the task: Role: QA Engineer | Task: Create integration tests for departments API | Restrictions: Test real database operations, use test fixtures, clean up after tests | Success: All API endpoints tested, auth/permissions verified, import tested | After implementation: Mark this task as [-] in-progress before starting, use log-implementation tool to record details, then mark as [x] complete_

## Summary

| Phase                  | Tasks | Description                                       |
| ---------------------- | ----- | ------------------------------------------------- |
| 1. Database Migration  | 1-2   | Create tables and permissions                     |
| 2. Core Module         | 3-10  | Implement Repository, Service, Controller, Routes |
| 3. Import Service      | 11    | Enable System Init import                         |
| 4. Data Migration      | 12-13 | Migrate data and update FKs                       |
| 5. Inventory Extension | 14-15 | Create extension table (optional)                 |
| 6. Cleanup             | 16-17 | Remove old code and table                         |
| 7. Testing             | 18-19 | Unit and integration tests                        |

**Total Tasks: 19**
