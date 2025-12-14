# UserDepartmentsService - Usage Examples

> Practical examples for using the UserDepartmentsService in controllers and other services

## Quick Start

### Import and Setup

```typescript
import {
  UserDepartmentsService,
  UserDepartmentsRepository,
} from '@/core/users';
import { UsersRepository } from '@/core/users';
import { DepartmentsRepository } from '@/modules/inventory/master-data/departments';

// In your controller or service constructor
constructor(
  private userDepartmentsService: UserDepartmentsService
) {}

// Or initialize manually (in tests)
const service = new UserDepartmentsService(
  userDepartmentsRepository,
  usersRepository,
  departmentsRepository
);
```

---

## User Onboarding Workflow

### Scenario: Onboarding a new pharmacist

```typescript
// New user created, now assign to department
const assignment = await userDepartmentsService.assignUser(
  newUser.id,
  1, // Pharmacy department
  {
    isPrimary: true,
    assignedRole: 'pharmacist',
    permissions: {
      canCreateRequests: true,
      canEditRequests: true,
      canSubmitRequests: true,
      canApproveRequests: false, // Staff can't approve
      canViewReports: true,
    },
    assignedBy: currentUserId, // Who assigned them
    notes: 'Hired 2025-12-13',
  },
);

console.log('User assigned:', assignment.id);
console.log('Primary?', assignment.isPrimary);
console.log('Can approve?', assignment.canApproveRequests);
```

---

## Multi-Department Assignment

### Scenario: User works in multiple departments

```typescript
// Pharmacist primarily in Pharmacy, but also covers Emergency
const user = 'user-456';

// Primary assignment - Pharmacy
await userDepartmentsService.assignUser(user, 1, {
  isPrimary: true,
  assignedRole: 'pharmacist',
  permissions: {
    canCreateRequests: true,
    canApproveRequests: false,
  },
});

// Secondary assignment - Emergency (temporary)
const today = new Date();
const endDate = new Date(today);
endDate.setMonth(endDate.getMonth() + 3); // 3-month rotation

await userDepartmentsService.assignUser(user, 3, {
  isPrimary: false,
  assignedRole: 'staff',
  permissions: {
    canCreateRequests: true,
    canApproveRequests: false,
  },
  validFrom: today,
  validUntil: endDate,
  notes: '3-month rotation to Emergency dept',
});

// Fetch all departments
const allDepts = await userDepartmentsService.getUserDepartments(user);
console.log(`User works in ${allDepts.length} departments`);

allDepts.forEach((dept) => {
  console.log(`- Department ${dept.departmentId}: primary=${dept.isPrimary}, role=${dept.assignedRole}`);
});
```

---

## Permission-Based Authorization

### Scenario: Authorize budget request creation

```typescript
// In BudgetRequestsService
async createRequest(
  userId: string,
  departmentId: number,
  requestData: CreateBudgetRequestDTO
): Promise<BudgetRequest> {
  // Check permission
  const canCreate = await this.userDepartmentsService.hasPermissionInDepartment(
    userId,
    departmentId,
    'canCreateRequests'
  );

  if (!canCreate) {
    throw new AppError(
      'You do not have permission to create requests in this department',
      403,
      'INSUFFICIENT_PERMISSION'
    );
  }

  // Proceed with request creation
  return this.budgetRequestsRepository.create({
    ...requestData,
    userId,
    departmentId,
    createdAt: new Date(),
  });
}
```

### Scenario: Authorize request approval

```typescript
// In BudgetApprovalService
async approveRequest(
  userId: string,
  requestId: string
): Promise<void> {
  const request = await this.budgetRequestsRepository.findById(requestId);

  // Check if user has approval rights in request's department
  const canApprove = await this.userDepartmentsService.hasPermissionInDepartment(
    userId,
    request.departmentId,
    'canApproveRequests'
  );

  if (!canApprove) {
    throw new AppError(
      'You are not authorized to approve requests from this department',
      403,
      'CANNOT_APPROVE'
    );
  }

  // Update request status
  await this.budgetRequestsRepository.update(requestId, {
    status: 'approved',
    approvedBy: userId,
    approvedAt: new Date(),
  });
}
```

---

## Department Roster Management

### Scenario: Display department members in UI

```typescript
// In DepartmentController
async getDepartmentRoster(
  departmentId: number
): Promise<DepartmentRosterDTO> {
  // Get all users in department with details
  const users = await this.userDepartmentsService.getDepartmentUsers(
    departmentId
  );

  return {
    departmentId,
    memberCount: users.length,
    members: users.map((user) => ({
      userId: user.userId,
      email: user.userEmail,
      name: `${user.userFirstName} ${user.userLastName}`,
      role: user.assignedRole || 'staff',
      isPrimary: user.isPrimary,
      permissions: {
        canCreate: user.canCreateRequests,
        canApprove: user.canApproveRequests,
      },
      assignedSince: user.assignedAt,
    })),
  };
}
```

---

## User Profile - Department Section

### Scenario: Display user's departments in profile page

```typescript
// In UserProfileService
async getUserProfile(userId: string): Promise<UserProfileDTO> {
  const user = await this.usersService.getUserById(userId);

  // Get user's departments
  const departments = await this.userDepartmentsService.getUserDepartments(
    userId
  );

  // Get primary department with full details
  const primaryDept = await this.userDepartmentsService.getUserPrimaryDepartment(
    userId
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    },
    primaryDepartment: primaryDept
      ? {
          id: primaryDept.departmentId,
          code: primaryDept.departmentCode,
          name: primaryDept.departmentName,
        }
      : null,
    allDepartments: departments.map((dept) => ({
      id: dept.departmentId,
      isPrimary: dept.isPrimary,
      role: dept.assignedRole,
      joinedAt: dept.assignedAt,
      expiresAt: dept.validUntil,
    })),
  };
}
```

---

## Department Transfer Workflow

### Scenario: User transfers to different department

```typescript
// Step 1: Check current assignments
const currentDepts = await this.userDepartmentsService.getUserDepartments(userId);
console.log(`User currently in ${currentDepts.length} department(s)`);

// Step 2: Assign to new department as temporary
const newAssignment = await this.userDepartmentsService.assignUser(userId, newDepartmentId, {
  isPrimary: false, // Not primary yet
  assignedRole: 'staff',
  permissions: {
    canCreateRequests: true,
    canApproveRequests: false,
  },
  notes: 'Transfer from Finance to Operations, pending approval',
});

// Step 3: Once transfer is approved, set as primary
const updated = await this.userDepartmentsService.setPrimaryDepartment(userId, newDepartmentId);
console.log(`New primary department: ${updated.departmentId}`);

// Step 4: Remove from old department
await this.userDepartmentsService.removeUser(userId, oldDepartmentId);

console.log('Transfer complete!');
```

---

## Temporary Assignment (Rotation)

### Scenario: Staff rotation to another department

```typescript
// Manager wants to rotate staff for 6 months
const rotationStart = new Date('2025-01-15');
const rotationEnd = new Date('2025-07-15');

const rotation = await this.userDepartmentsService.assignUser(userId, 4, {
  isPrimary: false,
  assignedRole: 'temporary_staff',
  permissions: {
    canCreateRequests: true,
    canEditRequests: false,
    canApproveRequests: false,
  },
  validFrom: rotationStart,
  validUntil: rotationEnd,
  assignedBy: managerId,
  notes: 'Temporary rotation - Operations dept Q1/Q2 2025',
});

console.log('Rotation assignment created:', rotation.id);

// Later, fetch user's current departments (ignores expired assignments)
const activeDepts = await this.userDepartmentsService.getUserDepartments(userId);
// After 2025-07-15, rotation assignment won't appear in this list
```

---

## Validation Examples

### Example 1: User doesn't exist

```typescript
try {
  await userDepartmentsService.assignUser('invalid-user-id', 1);
} catch (error) {
  if (error.code === 'USER_NOT_FOUND') {
    console.log('Error: User not found in system');
  }
}
```

### Example 2: Department doesn't exist

```typescript
try {
  await userDepartmentsService.assignUser('user-123', 9999);
} catch (error) {
  if (error.code === 'DEPARTMENT_NOT_FOUND') {
    console.log('Error: Department does not exist');
  }
}
```

### Example 3: User already assigned

```typescript
try {
  // User already in Pharmacy dept
  await userDepartmentsService.assignUser('user-123', 1);
  // Try to assign again
  await userDepartmentsService.assignUser('user-123', 1);
} catch (error) {
  if (error.code === 'ASSIGNMENT_EXISTS') {
    console.log('Error: User is already assigned to this department');
  }
}
```

### Example 4: Invalid date range

```typescript
try {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await userDepartmentsService.assignUser('user-123', 1, {
    validFrom: tomorrow,
    validUntil: today, // End date before start date!
  });
} catch (error) {
  if (error.code === 'INVALID_DATE_RANGE') {
    console.log('Error: Valid from date must be before valid until date');
  }
}
```

### Example 5: Cannot remove only primary

```typescript
try {
  // User has only one department assignment, and it's primary
  const depts = await userDepartmentsService.getUserDepartments('user-123');
  // depts.length === 1 and depts[0].isPrimary === true

  await userDepartmentsService.removeUser('user-123', 1);
} catch (error) {
  if (error.code === 'CANNOT_REMOVE_ONLY_PRIMARY') {
    console.log('Error: Cannot remove user from their only primary department');
  }
}
```

---

## Permission Checking Examples

### Example 1: Multiple permission checks

```typescript
const userId = 'user-123';
const departmentId = 1;

// Check different permissions
const permissions = {
  canCreate: await userDepartmentsService.hasPermissionInDepartment(userId, departmentId, 'canCreateRequests'),
  canEdit: await userDepartmentsService.hasPermissionInDepartment(userId, departmentId, 'canEditRequests'),
  canSubmit: await userDepartmentsService.hasPermissionInDepartment(userId, departmentId, 'canSubmitRequests'),
  canApprove: await userDepartmentsService.hasPermissionInDepartment(userId, departmentId, 'canApproveRequests'),
  canViewReports: await userDepartmentsService.hasPermissionInDepartment(userId, departmentId, 'canViewReports'),
};

console.log('User Permissions:', permissions);
```

### Example 2: Safe fail (returns false)

```typescript
// These always return false, never throw
const fake1 = await userDepartmentsService.hasPermissionInDepartment('non-existent-user', 1, 'canApproveRequests');
console.log(fake1); // false

const fake2 = await userDepartmentsService.hasPermissionInDepartment('user-123', 9999, 'canApproveRequests');
console.log(fake2); // false

// Good for boolean checks without try-catch
if (!fake1 && !fake2) {
  // User has no approval permissions
}
```

---

## Helper Method Examples

### Count departments

```typescript
// How many departments does this user work in?
const count = await userDepartmentsService.countUserActiveDepartments('user-123');
console.log(`User works in ${count} departments`);
```

### Count users in department

```typescript
// How many staff in this department?
const count = await userDepartmentsService.countDepartmentActiveUsers(1);
console.log(`Department has ${count} active staff members`);
```

### Check if user has any assignment

```typescript
// Validate user is properly onboarded
const hasAssignment = await userDepartmentsService.hasActiveDepartmentAssignment('user-123');

if (!hasAssignment) {
  throw new AppError('User must be assigned to at least one department', 400, 'NO_DEPARTMENT_ASSIGNMENT');
}
```

### Get primary with details

```typescript
// Fetch primary department for budget request creation
const primaryDept = await userDepartmentsService.getUserPrimaryDepartment('user-123');

if (!primaryDept) {
  throw new AppError('User has no primary department', 400, 'NO_PRIMARY_DEPT');
}

// Use in request creation
const request = await budgetRequestsService.create({
  userId: 'user-123',
  departmentId: primaryDept.departmentId, // Safe!
  amount: 50000,
});
```

---

## Integration Patterns

### Pattern 1: Service Injection (Recommended)

```typescript
// In your controller
export class UserDepartmentsController {
  constructor(private userDepartmentsService: UserDepartmentsService) {}

  async assignDepartment(req, res) {
    const result = await this.userDepartmentsService.assignUser(req.params.userId, req.body.departmentId, req.body.options);
    res.json(result);
  }
}
```

### Pattern 2: Standalone Usage (Testing)

```typescript
// In tests
const service = new UserDepartmentsService(new UserDepartmentsRepository(knexConnection), new UsersRepository(knexConnection), new DepartmentsRepository(knexConnection));

const result = await service.assignUser('user-id', 1);
```

### Pattern 3: Composition with Other Services

```typescript
export class BudgetWorkflowService {
  constructor(
    private budgetRequestsService: BudgetRequestsService,
    private userDepartmentsService: UserDepartmentsService,
    private approvalService: ApprovalService,
  ) {}

  async submitRequest(userId: string, requestData: CreateRequestDTO): Promise<void> {
    // Validate user has department
    const depts = await this.userDepartmentsService.getUserDepartments(userId);
    if (!depts.length) throw new Error('User has no department');

    // Create request
    const request = await this.budgetRequestsService.create(userId, requestData);

    // Route to appropriate approvers in department
    const departmentUsers = await this.userDepartmentsService.getDepartmentUsers(request.departmentId);
    const approvers = departmentUsers.filter((u) => u.canApproveRequests && u.isPrimary);

    // Send notifications
    for (const approver of approvers) {
      await this.notificationService.sendApprovalNotification(approver.userId, request);
    }
  }
}
```

---

## Best Practices

1. **Always check existence first**: Call `getUserDepartments()` before attempting operations
2. **Use permission checks for authorization**: Don't duplicate permission logic in controllers
3. **Handle temporal assignments**: Consider `validFrom`/`validUntil` in UI date displays
4. **Atomic primary updates**: Always use `setPrimaryDepartment()` for atomic consistency
5. **Audit trail**: Use `assignedBy` and `notes` fields for compliance tracking
6. **Soft deletes**: Never try to query deleted assignments; use `getActiveDepartments()`

---

## Related Documentation

- [DEPARTMENT_MANAGEMENT_DESIGN.md](./DEPARTMENT_MANAGEMENT_DESIGN.md) - Design specification
- [USER_DEPARTMENTS_SERVICE.md](./USER_DEPARTMENTS_SERVICE.md) - API documentation
- Service Tests: `apps/api/src/core/users/__tests__/user-departments.service.test.ts`
