# UserDepartmentsService Implementation

> **Status**: Complete
> **Implementation Phase**: Week 2 - Service Layer
> **Last Updated**: 2025-12-13

## Overview

The `UserDepartmentsService` provides business logic for managing user-department relationships. It sits between the REST API layer and the database repository layer, enforcing validation, business rules, and proper error handling.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              REST API Routes (Week 3)               │
│  GET /api/users/:userId/departments                 │
│  POST /api/users/:userId/departments                │
│  DELETE /api/users/:userId/departments/:deptId      │
└───────────────────────┬─────────────────────────────┘
                        │ (requests/responses)
┌───────────────────────▼─────────────────────────────┐
│       UserDepartmentsService (Week 2) - YOU ARE HERE│
│  - Validation logic                                  │
│  - Business rules enforcement                        │
│  - Error handling                                    │
│  - Permission checks                                │
└───────────────────────┬─────────────────────────────┘
                        │ (queries/commands)
┌───────────────────────▼─────────────────────────────┐
│          Repository Layer (Week 1)                   │
│  - Database queries (Knex)                           │
│  - Data transformations                              │
│  - Entity mapping                                    │
└─────────────────────────────────────────────────────┘
```

## Implemented Methods

### 1. assignUser()

**Assigns a user to a department with comprehensive validation.**

```typescript
async assignUser(
  userId: string,
  departmentId: number,
  options?: {
    isPrimary?: boolean;
    assignedRole?: string | null;
    permissions?: {
      canCreateRequests?: boolean;
      canEditRequests?: boolean;
      canSubmitRequests?: boolean;
      canApproveRequests?: boolean;
      canViewReports?: boolean;
    };
    validFrom?: Date | null;
    validUntil?: Date | null;
    assignedBy?: string | null;
    notes?: string | null;
  }
): Promise<UserDepartment>
```

**Validations Performed**:

- User exists in system
- Department exists in system
- No duplicate assignment (user not already in department)
- Date range is valid (validFrom < validUntil)

**Business Rules**:

- When `isPrimary=true`, automatically unsets other departments as primary
- First assignment can be set as primary immediately

**Use Cases**:

- Onboarding new user to their department
- Assigning temporary role to another department
- Multi-department assignment for cross-functional users

**Example**:

```typescript
const assignment = await userDepartmentsService.assignUser(
  'user-123',
  1, // pharmacy department
  {
    isPrimary: true,
    assignedRole: 'pharmacist',
    permissions: {
      canCreateRequests: true,
      canApproveRequests: false,
    },
  },
);
```

**Error Codes**:

- `USER_NOT_FOUND` (404): User doesn't exist
- `DEPARTMENT_NOT_FOUND` (404): Department doesn't exist
- `ASSIGNMENT_EXISTS` (409): User already assigned to this department
- `INVALID_DATE_RANGE` (400): validFrom > validUntil

---

### 2. removeUser()

**Removes a user from a department using soft delete.**

```typescript
async removeUser(
  userId: string,
  departmentId: number
): Promise<void>
```

**What Happens**:

- Sets `valid_until` to NOW() to mark assignment as inactive
- Preserves assignment history for audit trail
- Does not physically delete the record

**Validations Performed**:

- User exists
- Assignment exists
- Cannot remove user's only primary department

**Business Rules**:

- If removing primary department, user must have another primary assigned first
- Other assignments for this user remain unchanged

**Use Cases**:

- User transfers to different department
- Temporary assignment ends
- Organizational restructuring

**Example**:

```typescript
// User is transferring from Pharmacy to Finance
// First, set Finance as primary
await userDepartmentsService.setPrimaryDepartment('user-123', 2); // finance

// Then remove from Pharmacy
await userDepartmentsService.removeUser('user-123', 1); // pharmacy
```

**Error Codes**:

- `USER_NOT_FOUND` (404): User doesn't exist
- `ASSIGNMENT_NOT_FOUND` (404): User not assigned to this department
- `CANNOT_REMOVE_ONLY_PRIMARY` (400): User has no other primary

---

### 3. getUserDepartments()

**Retrieves all active departments for a user.**

```typescript
async getUserDepartments(userId: string): Promise<UserDepartment[]>
```

**Returns**:

- Array of active UserDepartment records
- Respects temporal validity (valid_from/until dates)
- Ordered by primary first, then creation date

**What's Included**:

- Department ID and assignment details
- User's permissions in each department
- Temporal validity information
- Assignment metadata (role, dates, notes)

**Validations**:

- User exists

**Use Cases**:

- Display user's department roster in UI
- Authorization checks for operations
- Department context selection
- Budget request submission (pick department)

**Example**:

```typescript
const departments = await userDepartmentsService.getUserDepartments('user-123');
// [
//   {
//     id: 'assign-1',
//     departmentId: 1,
//     isPrimary: true,
//     canCreateRequests: true,
//     canApproveRequests: false,
//     ...
//   },
//   {
//     id: 'assign-2',
//     departmentId: 2,
//     isPrimary: false,
//     canCreateRequests: true,
//     canApproveRequests: true,
//     ...
//   }
// ]
```

**Error Codes**:

- `USER_NOT_FOUND` (404): User doesn't exist

---

### 4. getDepartmentUsers()

**Gets all users assigned to a department with enriched user details.**

```typescript
async getDepartmentUsers(
  departmentId: number
): Promise<(UserDepartment & {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
})[]>
```

**Returns**:

- Array of assignments with joined user information
- Email, first name, last name for each user
- Full assignment details (permissions, roles, etc.)

**Data Enrichment**:

- Each assignment is joined with user profile data
- Includes user contact information
- Shows current assignment status

**Validations**:

- Department exists
- All referenced users exist (throws if user is missing)

**Use Cases**:

- Department roster page
- Email broadcasts to department members
- Permission delegation UI
- Department head reporting

**Example**:

```typescript
const users = await userDepartmentsService.getDepartmentUsers(1);
// [
//   {
//     id: 'assign-1',
//     userId: 'user-1',
//     departmentId: 1,
//     userEmail: 'john@example.com',
//     userFirstName: 'John',
//     userLastName: 'Doe',
//     isPrimary: true,
//     canApproveRequests: true,
//     ...
//   },
//   ...
// ]
```

**Error Codes**:

- `DEPARTMENT_NOT_FOUND` (404): Department doesn't exist
- `USER_DATA_INCONSISTENCY` (500): Referenced user not found

---

### 5. setPrimaryDepartment()

**Atomically updates a user's primary department.**

```typescript
async setPrimaryDepartment(
  userId: string,
  departmentId: number
): Promise<UserDepartment>
```

**Atomicity**:

- Automatically unsets all other departments as primary
- Sets the specified department as primary in single operation
- Ensures only one primary department per user

**Validations**:

- User exists
- Assignment exists
- Assignment is currently valid (within temporal range)
- Assignment hasn't expired yet

**Business Rules**:

- Cannot set future assignment (validFrom in future) as primary
- Cannot set expired assignment (validUntil in past) as primary
- Automatically unsets other primaries

**Use Cases**:

- User promotion to department head role
- Department transfer
- Default department for budget requests
- Changing primary role context

**Example**:

```typescript
// User promoted, changing primary from Pharmacy to Finance
const updated = await userDepartmentsService.setPrimaryDepartment('user-123', 2);
// Now user's budget requests will default to Finance department
```

**Error Codes**:

- `USER_NOT_FOUND` (404): User doesn't exist
- `ASSIGNMENT_NOT_FOUND` (404): Assignment doesn't exist
- `ASSIGNMENT_NOT_YET_VALID` (400): validFrom date in future
- `ASSIGNMENT_EXPIRED` (400): validUntil date in past
- `UPDATE_FAILED` (500): Database update failed

---

### 6. hasPermissionInDepartment()

**Checks if a user has a specific permission in a department.**

```typescript
async hasPermissionInDepartment(
  userId: string,
  departmentId: number,
  permission: 'canCreateRequests'
    | 'canEditRequests'
    | 'canSubmitRequests'
    | 'canApproveRequests'
    | 'canViewReports'
): Promise<boolean>
```

**Returns**:

- `true` if user has the permission and assignment is active
- `false` if user lacks permission or assignment is inactive

**Behavior**:

- Respects temporal validity (valid_from/until dates)
- Fail-safe design: returns false if not found (no exceptions)
- Optimized for authorization gates

**Permission Types**:

- `canCreateRequests`: Can initiate budget requests
- `canEditRequests`: Can modify draft requests
- `canSubmitRequests`: Can submit requests for approval
- `canApproveRequests`: Can approve submitted requests
- `canViewReports`: Can access department reports

**Use Cases**:

- Authorization gates in API endpoints
- UI permission checking (show/hide buttons)
- Access control for operations
- RBAC integration points

**Example**:

```typescript
// Authorization check in endpoint
const canApprove = await userDepartmentsService.hasPermissionInDepartment(userId, departmentId, 'canApproveRequests');

if (!canApprove) {
  throw new AppError('User cannot approve requests in this department', 403, 'INSUFFICIENT_PERMISSION');
}
```

**Error Codes**: None - method returns false instead of throwing

---

## Helper Methods

### getUserPrimaryDepartment()

Returns user's primary department with full details.

```typescript
async getUserPrimaryDepartment(
  userId: string
): Promise<UserDepartment & {
  departmentCode: string;
  departmentName: string;
} | null>
```

**Use Case**: Creating budget requests - fetches department_id for the request

---

### hasActiveDepartmentAssignment()

Verifies user has at least one active department assignment.

```typescript
async hasActiveDepartmentAssignment(userId: string): Promise<boolean>
```

**Use Case**: Validation during user onboarding

---

### countUserActiveDepartments()

Returns count of user's currently active departments.

```typescript
async countUserActiveDepartments(userId: string): Promise<number>
```

---

### countDepartmentActiveUsers()

Returns count of currently active users in a department.

```typescript
async countDepartmentActiveUsers(departmentId: number): Promise<number>
```

---

## Error Handling

All methods use `AppError` with structured error codes:

```typescript
throw new AppError('User message here', httpStatusCode, 'ERROR_CODE');
```

**Status Codes Used**:

- `400` Bad Request: Validation error (invalid dates, wrong state)
- `404` Not Found: User/department/assignment not found
- `409` Conflict: Duplicate assignment
- `500` Internal Server Error: Database inconsistency

---

## Integration with Other Services

### BudgetRequestsService

The UserDepartmentsService integrates with budget request creation:

```typescript
// In BudgetRequestsService.create()
const primaryDept = await userDepartmentsService.getUserPrimaryDepartment(userId);
if (!primaryDept) {
  throw new AppError('User has no primary department', 400, 'NO_PRIMARY_DEPT');
}

// Check permission
const canCreate = await userDepartmentsService.hasPermissionInDepartment(userId, primaryDept.departmentId, 'canCreateRequests');
```

### Future: RBAC System

Can integrate with role-based access control:

```typescript
// Check department-specific permissions
const hasRole = await rbacService.hasRole(userId, 'approver');
const hasPermission = await userDepartmentsService.hasPermissionInDepartment(userId, departmentId, 'canApproveRequests');

// Both role and department permission required
if (!hasRole || !hasPermission) {
  // deny access
}
```

---

## Testing

Comprehensive test suite included: `user-departments.service.test.ts`

**Test Coverage**:

- ✅ All 6 main methods
- ✅ Helper methods
- ✅ Success scenarios
- ✅ Error scenarios
- ✅ Edge cases (expired assignments, date ranges, etc.)
- ✅ Validation rules
- ✅ Business logic enforcement

**Run Tests**:

```bash
pnpm test -- user-departments.service
```

---

## File Locations

```
apps/api/src/core/users/
├── user-departments.service.ts          (THIS FILE)
├── user-departments.repository.ts       (Database layer)
├── users.repository.ts                  (User lookups)
├── users.types.ts
├── users.service.ts
└── __tests__/
    └── user-departments.service.test.ts (Unit tests)

apps/api/src/modules/inventory/master-data/departments/
└── departments.repository.ts            (Department lookups)
```

---

## Design References

Full design specification: [DEPARTMENT_MANAGEMENT_DESIGN.md](./DEPARTMENT_MANAGEMENT_DESIGN.md)

Key sections:

- **Service Layer Example** (lines 608-700): Original design
- **Database Queries** (lines 394-460): SQL query patterns
- **Week 2 Timeline** (lines 281-301): Implementation scope

---

## Summary

The `UserDepartmentsService` is a complete, production-ready implementation of the Week 2 service layer. It provides:

✅ 6 core methods (assignUser, removeUser, getUserDepartments, getDepartmentUsers, setPrimaryDepartment, hasPermissionInDepartment)
✅ Comprehensive validation and error handling
✅ Business rule enforcement
✅ Temporal validity support
✅ Soft delete for audit trails
✅ Helper methods for common use cases
✅ Full TypeScript typing
✅ Unit test coverage

Ready for REST API endpoint implementation (Week 3).
