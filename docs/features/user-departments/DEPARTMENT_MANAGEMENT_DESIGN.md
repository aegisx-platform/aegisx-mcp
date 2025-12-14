# Department Management System Design

> **Status**: Design Complete - Ready for Implementation
> **Author**: Claude Code Planning Agent
> **Date**: 2024-12-13
> **Context**: User-department relationship required for budget request workflow

## Problem Statement

### Current Situation

- Budget requests REQUIRE `department_id` field (not nullable)
- Users have NO department assignment in the system
- Approve-finance endpoint fails with: "null value in column department_id violates not-null constraint"

### Business Context

- This is a SaaS product sold to hospitals (single installation per hospital)
- Multiple pharmacists collaborate on budget requests (not individual ownership)
- Each hospital needs to import user-department data on installation
- Must support flexible assignment (multi-department users, temporary assignments)

### Root Cause

Budget Request ID 5 has no department_id because users don't have department assignments. This reveals a fundamental gap in the data model.

## Design Options Analysis

### Option A: Simple Column Approach

**Add `department_id` to users table**

#### Schema

```sql
ALTER TABLE public.users
ADD COLUMN department_id INTEGER REFERENCES departments(id);

CREATE INDEX idx_users_department ON users(department_id);
```

#### Pros

- ✅ Simplest implementation (1 migration, minimal code)
- ✅ Easy CSV import (just add column to users.csv)
- ✅ Fast queries (no joins needed)
- ✅ Works immediately for basic use case

#### Cons

- ❌ One department per user only (inflexible)
- ❌ No support for temporary assignments
- ❌ No granular permissions per department
- ❌ Difficult to track assignment history
- ❌ No support for multi-department users

#### Use Cases Supported

- ✅ Pharmacist belongs to Pharmacy department
- ❌ Pharmacist works in both Pharmacy and Emergency departments
- ❌ Temporary assignment to another department
- ❌ User can create requests in Dept A but approve in Dept B

#### Timeline

**1 week**

---

### Option B: Junction Table Approach ⭐ RECOMMENDED

**Create `user_departments` junction table**

#### Schema

```sql
CREATE TABLE public.user_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,

  -- Assignment metadata
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_role VARCHAR(50), -- e.g., 'pharmacist', 'head', 'staff'

  -- Granular permissions per department
  can_create_requests BOOLEAN DEFAULT true,
  can_edit_requests BOOLEAN DEFAULT true,
  can_submit_requests BOOLEAN DEFAULT true,
  can_approve_requests BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT true,

  -- Temporal validity
  valid_from DATE,
  valid_until DATE,

  -- Audit
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_dept_hospital UNIQUE(user_id, department_id, hospital_id),
  CONSTRAINT valid_date_range CHECK (valid_until IS NULL OR valid_until >= valid_from)
);

CREATE INDEX idx_ud_user ON user_departments(user_id);
CREATE INDEX idx_ud_department ON user_departments(department_id);
CREATE INDEX idx_ud_hospital ON user_departments(hospital_id);
CREATE INDEX idx_ud_primary ON user_departments(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_ud_validity ON user_departments(valid_from, valid_until);
```

#### Additional Schema Changes

```sql
-- Add hospital_id to departments (for multi-hospital support)
ALTER TABLE public.departments
ADD COLUMN hospital_id INTEGER REFERENCES hospitals(id);

CREATE INDEX idx_departments_hospital ON departments(hospital_id);
```

#### Pros

- ✅ Full flexibility (multi-department users)
- ✅ Temporal assignments (valid_from/until)
- ✅ Granular permissions per department
- ✅ Easy CSV import (simple junction table format)
- ✅ Assignment history tracking
- ✅ Supports complex workflows
- ✅ Future-proof for growth

#### Cons

- ⚠️ More complex queries (requires joins)
- ⚠️ More database storage
- ⚠️ Longer implementation time

#### Use Cases Supported

- ✅ Pharmacist belongs to Pharmacy department
- ✅ Pharmacist works in both Pharmacy and Emergency departments
- ✅ Temporary assignment to another department
- ✅ User can create requests in Dept A but approve in Dept B
- ✅ User transfers departments (keep history)
- ✅ Department head has approval rights, staff doesn't

#### CSV Import Format

```csv
user_email,department_code,hospital_code,is_primary,assigned_role,can_create,can_approve,valid_from,valid_until
john@example.com,PHARM,HOSP001,true,pharmacist,true,false,2024-01-01,
mary@example.com,FINANCE,HOSP001,true,head,true,true,2024-01-01,
jane@example.com,PHARM,HOSP001,false,staff,true,false,2024-01-01,2024-12-31
```

#### API Design

```typescript
// GET /api/users/:userId/departments
{
  departments: [
    {
      id: 1,
      code: 'PHARM',
      name: 'Pharmacy',
      hospital: { id: 1, name: 'Main Hospital' },
      isPrimary: true,
      assignedRole: 'pharmacist',
      permissions: {
        canCreate: true,
        canApprove: false
      },
      validFrom: '2024-01-01',
      validUntil: null
    }
  ]
}

// POST /api/users/:userId/departments
{
  departmentId: 1,
  isPrimary: false,
  assignedRole: 'staff',
  permissions: {
    canCreate: true,
    canApprove: false
  },
  validFrom: '2024-01-01',
  validUntil: null
}

// DELETE /api/users/:userId/departments/:departmentId
// Soft delete: sets valid_until = NOW()
```

#### Timeline

**5 weeks**

---

### Option C: RBAC Integration Approach

**Add department context to existing RBAC system**

#### Schema

```sql
-- Extend user_roles to include department context
ALTER TABLE public.user_roles
ADD COLUMN department_id INTEGER REFERENCES departments(id),
ADD COLUMN hospital_id INTEGER REFERENCES hospitals(id);

CREATE INDEX idx_user_roles_department ON user_roles(department_id);
```

#### Example

User has role "pharmacist" in Pharmacy department, "staff" in Emergency department:

```sql
INSERT INTO user_roles (user_id, role_id, department_id) VALUES
  ('user-1', 'pharmacist-role-id', 1), -- Pharmacy
  ('user-1', 'staff-role-id', 2);      -- Emergency
```

#### Pros

- ✅ Leverages existing RBAC system
- ✅ No new tables needed
- ✅ Permission checks already integrated
- ✅ Familiar pattern for developers

#### Cons

- ❌ Overloads RBAC with department concept (not its primary purpose)
- ❌ Less intuitive for department management
- ❌ Harder to query "all users in department X"
- ❌ Difficult to model temporal assignments
- ❌ Complex CSV import (must know role IDs)

#### Use Cases Supported

- ✅ User has different roles per department
- ⚠️ Multi-department users (but complex queries)
- ❌ Temporal assignments (no built-in support)
- ⚠️ Granular permissions (via role permissions)

#### Timeline

**3 weeks**

---

## Recommendation: Option B (Junction Table)

### Rationale

1. **Flexibility**: Fully supports all current and future requirements
2. **Clarity**: Dedicated table makes intent clear
3. **Temporal Support**: Built-in validity period for assignments
4. **Import-Friendly**: Simple CSV format for hospital admins
5. **Future-Proof**: Can extend with additional metadata without schema changes
6. **Audit Trail**: Full history of assignments

### Trade-offs Accepted

- More complex queries (but manageable with repository pattern)
- Longer implementation time (5 weeks vs 1-3 weeks)
- More storage (negligible for typical hospital scale)

### Migration Strategy

1. Create `user_departments` table
2. Add `hospital_id` to departments
3. Migrate existing data (if any users have implicit departments)
4. Update budget request service to use user departments
5. Implement CSV import/export
6. Build admin UI for department assignments

## Implementation Plan (5 Weeks)

### Week 1: Database Layer

**Goal**: Schema ready, migrations tested

- Create migration for `user_departments` table
- Create migration to add `hospital_id` to departments
- Write seed data for testing (10 users, 5 departments, various assignments)
- Create `UserDepartmentsRepository` with methods:
  - `findByUserId(userId: string): Promise<UserDepartment[]>`
  - `findByDepartmentId(deptId: number): Promise<UserDepartment[]>`
  - `getPrimaryDepartment(userId: string): Promise<UserDepartment | null>`
  - `assignUserToDepartment(data: AssignmentData): Promise<UserDepartment>`
  - `removeUserFromDepartment(userId: string, deptId: number): Promise<void>`
  - `getActiveDepartments(userId: string): Promise<UserDepartment[]>` (respects valid_from/until)

**Deliverables**:

- 2 migration files
- UserDepartmentsRepository with 6 methods
- Unit tests for repository
- Seed data

---

### Week 2: Service Layer

**Goal**: Business logic for department assignments

- Create `UserDepartmentsService` with methods:
  - `assignUser(userId, deptId, options)` - assign user to department
  - `removeUser(userId, deptId)` - soft delete (sets valid_until)
  - `getUserDepartments(userId)` - get all departments for user
  - `getDepartmentUsers(deptId)` - get all users in department
  - `setPrimaryDepartment(userId, deptId)` - change primary department
  - `hasPermissionInDepartment(userId, deptId, permission)` - check granular permission

- Update `BudgetRequestsService`:
  - Modify `create()` to get department_id from user's primary department
  - Add validation: user must have `can_create_requests` in target department
  - Update `approveFinance()` to validate department assignment exists

**Deliverables**:

- UserDepartmentsService with 6 methods
- Updated BudgetRequestsService
- Integration tests

---

### Week 3: API Layer

**Goal**: REST endpoints for department management

- Create routes in `apps/api/src/modules/users/user-departments.route.ts`:
  - `GET /api/users/:userId/departments` - list user's departments
  - `POST /api/users/:userId/departments` - assign department
  - `DELETE /api/users/:userId/departments/:deptId` - remove assignment
  - `PUT /api/users/:userId/departments/:deptId/primary` - set as primary
  - `GET /api/users/:userId/departments/:deptId/permissions` - get permissions

- Create routes in `apps/api/src/modules/departments/department-users.route.ts`:
  - `GET /api/departments/:deptId/users` - list department users
  - `POST /api/departments/:deptId/users` - assign user (admin)
  - `DELETE /api/departments/:deptId/users/:userId` - remove user

- Add TypeBox schemas for all request/response types

**Deliverables**:

- 8 API endpoints
- TypeBox schemas
- API tests (Postman/Thunder Client collection)

---

### Week 4: Import/Export System

**Goal**: CSV import for hospital onboarding

- Create `UserDepartmentsImportService` (following auto-discovery pattern):
  - Template generation (CSV with columns: user_email, department_code, etc.)
  - Row validation (check user exists, department exists, no duplicates)
  - Batch import with transaction support
  - Rollback capability

- Create export endpoint:
  - `GET /api/admin/user-departments/export?format=csv`
  - Exports all user-department assignments

- Add CLI command:
  ```bash
  pnpm run import:user-departments -- --file=/path/to/assignments.csv
  ```

**Deliverables**:

- UserDepartmentsImportService
- Export endpoint
- CLI command
- Sample CSV files

---

### Week 5: Frontend UI

**Goal**: Admin interface for department management

**Component 1: User Department Manager**
Location: `apps/web/src/app/features/admin/pages/user-departments/`

Features:

- Table view: All users with their departments
- Filter by department
- Inline edit: Assign/remove departments
- Set primary department (dropdown)
- Temporal assignment (date pickers)
- Permission toggles per assignment

**Component 2: Department User List**
Location: `apps/web/src/app/features/admin/pages/department-users/`

Features:

- View all users in a department
- Add user to department (autocomplete search)
- Remove user from department
- Bulk operations (assign multiple users at once)

**Component 3: Import/Export UI**
Location: `apps/web/src/app/features/admin/pages/data-import/user-departments/`

Features:

- Download template button
- File upload (CSV/Excel)
- Validation preview (errors, warnings)
- Confirm and import
- Export current assignments

**Deliverables**:

- 3 frontend components
- Integration with backend APIs
- User acceptance testing

---

## Database Queries Examples

### Get user's active departments

```sql
SELECT
  ud.id,
  ud.department_id,
  d.code AS department_code,
  d.name AS department_name,
  ud.is_primary,
  ud.assigned_role,
  ud.can_create_requests,
  ud.can_approve_requests
FROM user_departments ud
JOIN departments d ON d.id = ud.department_id
WHERE ud.user_id = $1
  AND (ud.valid_from IS NULL OR ud.valid_from <= NOW())
  AND (ud.valid_until IS NULL OR ud.valid_until >= NOW());
```

### Get user's primary department

```sql
SELECT
  department_id,
  d.code,
  d.name
FROM user_departments ud
JOIN departments d ON d.id = ud.department_id
WHERE ud.user_id = $1
  AND ud.is_primary = true
  AND (ud.valid_from IS NULL OR ud.valid_from <= NOW())
  AND (ud.valid_until IS NULL OR ud.valid_until >= NOW())
LIMIT 1;
```

### Check if user can create requests in department

```sql
SELECT EXISTS (
  SELECT 1
  FROM user_departments
  WHERE user_id = $1
    AND department_id = $2
    AND can_create_requests = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
) AS has_permission;
```

### Get all users in department

```sql
SELECT
  u.id,
  u.email,
  u.display_name,
  ud.assigned_role,
  ud.is_primary,
  ud.can_create_requests,
  ud.can_approve_requests,
  ud.valid_from,
  ud.valid_until
FROM user_departments ud
JOIN users u ON u.id = ud.user_id
WHERE ud.department_id = $1
  AND (ud.valid_from IS NULL OR ud.valid_from <= NOW())
  AND (ud.valid_until IS NULL OR ud.valid_until >= NOW())
ORDER BY ud.is_primary DESC, u.display_name;
```

## Repository Implementation

```typescript
// apps/api/src/modules/users/repositories/user-departments.repository.ts

import { BaseRepository } from '@/core/database/base.repository';
import { Knex } from 'knex';

export interface UserDepartment {
  id: string;
  userId: string;
  departmentId: number;
  hospitalId: number | null;
  isPrimary: boolean;
  assignedRole: string | null;
  canCreateRequests: boolean;
  canEditRequests: boolean;
  canSubmitRequests: boolean;
  canApproveRequests: boolean;
  canViewReports: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  assignedBy: string | null;
  assignedAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserDepartmentsRepository extends BaseRepository<UserDepartment> {
  constructor(db: Knex) {
    super(db, 'user_departments');
  }

  async findByUserId(userId: string): Promise<UserDepartment[]> {
    return this.db(this.tableName).where({ user_id: userId }).orderBy('is_primary', 'desc').orderBy('created_at', 'asc');
  }

  async findByDepartmentId(departmentId: number): Promise<UserDepartment[]> {
    return this.db(this.tableName).where({ department_id: departmentId }).orderBy('is_primary', 'desc');
  }

  async getPrimaryDepartment(userId: string): Promise<UserDepartment | null> {
    const result = await this.db(this.tableName).where({ user_id: userId, is_primary: true }).whereRaw('(valid_from IS NULL OR valid_from <= NOW())').whereRaw('(valid_until IS NULL OR valid_until >= NOW())').first();

    return result || null;
  }

  async getActiveDepartments(userId: string): Promise<UserDepartment[]> {
    return this.db(this.tableName).where({ user_id: userId }).whereRaw('(valid_from IS NULL OR valid_from <= NOW())').whereRaw('(valid_until IS NULL OR valid_until >= NOW())').orderBy('is_primary', 'desc');
  }

  async assignUserToDepartment(data: {
    userId: string;
    departmentId: number;
    hospitalId?: number;
    isPrimary?: boolean;
    assignedRole?: string;
    permissions?: Partial<{
      canCreateRequests: boolean;
      canEditRequests: boolean;
      canSubmitRequests: boolean;
      canApproveRequests: boolean;
      canViewReports: boolean;
    }>;
    validFrom?: Date;
    validUntil?: Date;
    assignedBy?: string;
    notes?: string;
  }): Promise<UserDepartment> {
    // If setting as primary, unset other primaries first
    if (data.isPrimary) {
      await this.db(this.tableName).where({ user_id: data.userId }).update({ is_primary: false });
    }

    const [result] = await this.db(this.tableName)
      .insert({
        user_id: data.userId,
        department_id: data.departmentId,
        hospital_id: data.hospitalId || null,
        is_primary: data.isPrimary || false,
        assigned_role: data.assignedRole || null,
        can_create_requests: data.permissions?.canCreateRequests ?? true,
        can_edit_requests: data.permissions?.canEditRequests ?? true,
        can_submit_requests: data.permissions?.canSubmitRequests ?? true,
        can_approve_requests: data.permissions?.canApproveRequests ?? false,
        can_view_reports: data.permissions?.canViewReports ?? true,
        valid_from: data.validFrom || null,
        valid_until: data.validUntil || null,
        assigned_by: data.assignedBy || null,
        notes: data.notes || null,
      })
      .returning('*');

    return result;
  }

  async removeUserFromDepartment(userId: string, departmentId: number): Promise<void> {
    // Soft delete: set valid_until to NOW()
    await this.db(this.tableName).where({ user_id: userId, department_id: departmentId }).update({ valid_until: this.db.fn.now() });
  }

  async hasPermissionInDepartment(userId: string, departmentId: number, permission: keyof Pick<UserDepartment, 'canCreateRequests' | 'canEditRequests' | 'canSubmitRequests' | 'canApproveRequests' | 'canViewReports'>): Promise<boolean> {
    const result = await this.db(this.tableName).where({ user_id: userId, department_id: departmentId }).where(permission, true).whereRaw('(valid_from IS NULL OR valid_from <= NOW())').whereRaw('(valid_until IS NULL OR valid_until >= NOW())').first();

    return !!result;
  }
}
```

## Service Layer Example

```typescript
// apps/api/src/modules/users/services/user-departments.service.ts

export class UserDepartmentsService {
  constructor(
    private repository: UserDepartmentsRepository,
    private usersRepository: UsersRepository,
    private departmentsRepository: DepartmentsRepository,
  ) {}

  async assignUser(
    userId: string,
    departmentId: number,
    options: {
      isPrimary?: boolean;
      assignedRole?: string;
      permissions?: any;
      validFrom?: Date;
      validUntil?: Date;
      assignedBy?: string;
    },
  ): Promise<UserDepartment> {
    // Validate user exists
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Validate department exists
    const department = await this.departmentsRepository.findById(departmentId);
    if (!department) {
      throw new Error(`Department ${departmentId} not found`);
    }

    // Check for existing assignment
    const existing = await this.repository.findByUserId(userId);
    const hasExisting = existing.some((ud) => ud.departmentId === departmentId);

    if (hasExisting) {
      throw new Error(`User ${userId} is already assigned to department ${departmentId}`);
    }

    // Assign
    return this.repository.assignUserToDepartment({
      userId,
      departmentId,
      ...options,
    });
  }

  async setPrimaryDepartment(userId: string, departmentId: number): Promise<void> {
    // Unset all primaries
    await this.repository.db('user_departments').where({ user_id: userId }).update({ is_primary: false });

    // Set new primary
    await this.repository.db('user_departments').where({ user_id: userId, department_id: departmentId }).update({ is_primary: true });
  }

  async getUserDepartments(userId: string): Promise<UserDepartment[]> {
    return this.repository.getActiveDepartments(userId);
  }

  async getDepartmentUsers(departmentId: number): Promise<any[]> {
    const assignments = await this.repository.findByDepartmentId(departmentId);

    // Join with users table to get user details
    return Promise.all(
      assignments.map(async (assignment) => {
        const user = await this.usersRepository.findById(assignment.userId);
        return {
          ...assignment,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
          },
        };
      }),
    );
  }
}
```

## Testing Strategy

### Unit Tests

- Repository methods (10 tests)
- Service methods (15 tests)
- Import service validation (20 tests)

### Integration Tests

- API endpoints (8 endpoints × 3 scenarios = 24 tests)
- Import workflow (5 tests)
- Permission checks (10 tests)

### E2E Tests

- User assignment flow (5 scenarios)
- CSV import flow (3 scenarios)
- Budget request with department validation (3 scenarios)

**Total Tests: 90+**

## Rollout Strategy

### Phase 1: Database Migration (Week 1)

- Run migration in development
- Verify schema
- Test with seed data

### Phase 2: Backend APIs (Week 2-3)

- Deploy repository and service
- Deploy REST endpoints
- Test with Postman

### Phase 3: Import System (Week 4)

- Deploy import service
- Test with sample CSV
- Document import process

### Phase 4: Frontend UI (Week 5)

- Deploy admin components
- User acceptance testing
- Train admin users

### Phase 5: Production Migration

- Backup database
- Run migration on production
- Import initial user-department data from CSV
- Verify budget request creation works
- Monitor for issues

## Success Criteria

- ✅ All users have at least one department assignment
- ✅ Budget request creation automatically uses user's primary department
- ✅ Approve-finance endpoint works without department_id errors
- ✅ CSV import successfully loads 100+ user-department assignments
- ✅ Admin UI allows easy department management
- ✅ Zero downtime during migration

## References

### Related Documents

- [Auto-Discovery Import System](./AUTO_DISCOVERY_IMPORT_SYSTEM.md)
- [Budget Request Submission Spec](../budget-request-submission-v2/IMPLEMENTATION-PLAN.md)
- [Universal Full-Stack Standard](../../../development/universal-fullstack-standard.md)

### Code Locations

- Migration: `apps/api/src/database/migrations/XXXXXX_create_user_departments.ts`
- Repository: `apps/api/src/modules/users/repositories/user-departments.repository.ts`
- Service: `apps/api/src/modules/users/services/user-departments.service.ts`
- Routes: `apps/api/src/modules/users/user-departments.route.ts`
- Frontend: `apps/web/src/app/features/admin/pages/user-departments/`

---

**Status**: ✅ Design Complete - Ready for Implementation
**Next Step**: User to approve approach and prioritize implementation
