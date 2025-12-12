# 02. Permission Matrix - Role-based Access Control

**Version:** 1.0.0
**Date:** 2025-12-12

[← Back to Index](./README.md) | [← Previous: Workflow Analysis](./01-WORKFLOW-ANALYSIS.md)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Role Definitions](#role-definitions)
3. [Permission Matrix](#permission-matrix)
4. [Department-based Access](#department-based-access)
5. [Business Rules](#business-rules)
6. [Implementation Guide](#implementation-guide)

---

## Overview

ระบบ Permission สำหรับ Budget Request ต้องควบคุม:

1. **ใครสามารถทำอะไรได้บ้าง** (Role-based)
2. **สามารถเข้าถึงข้อมูลของใครได้บ้าง** (Department-based)
3. **ในสถานะไหนสามารถทำอะไรได้บ้าง** (State-based)

---

## Role Definitions

### 1. Pharmacist / Staff (เภสัชกร/เจ้าหน้าที่)

**Role Name:** `inventory.pharmacist` หรือ `inventory.staff`

**Responsibilities:**

- สร้าง Budget Request
- แก้ไขคำขอของตัวเอง (DRAFT only)
- Submit คำขอเพื่ออนุมัติ
- ดูสถานะคำขอของตัวเอง
- Reopen คำขอที่ถูก reject (ของตัวเอง)

**Access Scope:**

- ✅ คำขอที่สร้างเอง (created_by = current_user)
- ✅ คำขอของแผนกตัวเอง (department_id = user.department_id)
- ❌ คำขอของแผนกอื่น

---

### 2. Department Head (หัวหน้าแผนก)

**Role Name:** `inventory.department_head`

**Responsibilities:**

- ทุกอย่างที่ Pharmacist ทำได้
- ดูคำขอทั้งหมดในแผนก
- Approve/Reject คำขอที่ SUBMITTED
- เพิ่มความคิดเห็น
- Reopen คำขอที่ reject ได้ทุกคำขอในแผนก

**Access Scope:**

- ✅ คำขอทั้งหมดในแผนก (department_id = user.department_id)
- ❌ คำขอของแผนกอื่น

**Restrictions:**

- ❌ ห้ามอนุมัติคำขอของตัวเอง (conflict of interest)

---

### 3. Finance Manager (ผู้จัดการการเงิน)

**Role Name:** `inventory.finance_manager`

**Responsibilities:**

- ดูคำขอทั้งหมดทุกแผนก
- Approve/Reject คำขอที่ DEPT_APPROVED
- ตรวจสอบงบประมาณก่อนอนุมัติ
- เพิ่มความคิดเห็น/เงื่อนไข
- ดู Dashboard งบประมาณทั้งระบบ

**Access Scope:**

- ✅ คำขอทั้งหมดทุกแผนก
- ✅ งบประมาณทั้งหมด

**Restrictions:**

- ❌ ไม่สามารถแก้ไขรายการยา (read-only)
- ❌ ไม่สามารถ submit คำขอ (ไม่ใช่ requester)

---

### 4. Admin / Super User

**Role Name:** `admin` หรือ `super_admin`

**Responsibilities:**

- ทำทุกอย่างได้
- Override การอนุมัติ
- จัดการ permissions
- ดูรายงานทั้งหมด

**Access Scope:**

- ✅ All access

---

## Permission Matrix

### Create & Edit Permissions

| Permission                       | Pharmacist |   Dept Head    | Finance Mgr | Admin |
| -------------------------------- | :--------: | :------------: | :---------: | :---: |
| **Create new request**           |     ✅     |       ✅       |     ❌      |  ✅   |
| **Edit own request (DRAFT)**     |     ✅     |       ✅       |     ❌      |  ✅   |
| **Edit other's request (DRAFT)** |     ❌     | ✅ (same dept) |     ❌      |  ✅   |
| **Edit after SUBMITTED**         |     ❌     |       ❌       |     ❌      |  ✅   |
| **Delete request (DRAFT)**       |  ✅ (own)  | ✅ (same dept) |     ❌      |  ✅   |
| **Delete after SUBMITTED**       |     ❌     |       ❌       |     ❌      |  ✅   |

### View Permissions

| Permission                 | Pharmacist |   Dept Head   | Finance Mgr | Admin |
| -------------------------- | :--------: | :-----------: | :---------: | :---: |
| **View own requests**      |     ✅     |      ✅       |     ✅      |  ✅   |
| **View dept requests**     |     ✅     |      ✅       |     ✅      |  ✅   |
| **View all depts**         |     ❌     |      ❌       |     ✅      |  ✅   |
| **View budget allocation** |     ❌     | ✅ (own dept) |  ✅ (all)   |  ✅   |
| **View budget plans**      |     ❌     | ✅ (own dept) |  ✅ (all)   |  ✅   |

### Workflow Permissions

| Action                  | Status Required | Pharmacist |   Dept Head    | Finance Mgr | Admin |
| ----------------------- | --------------- | :--------: | :------------: | :---------: | :---: |
| **Submit for approval** | DRAFT           |  ✅ (own)  | ✅ (same dept) |     ❌      |  ✅   |
| **Department approve**  | SUBMITTED       |     ❌     | ✅ (not self)  |     ❌      |  ✅   |
| **Department reject**   | SUBMITTED       |     ❌     |       ✅       |     ❌      |  ✅   |
| **Finance approve**     | DEPT_APPROVED   |     ❌     |       ❌       |     ✅      |  ✅   |
| **Finance reject**      | DEPT_APPROVED   |     ❌     |       ❌       |     ✅      |  ✅   |
| **Reopen (own)**        | REJECTED        |     ✅     |       ✅       |     ❌      |  ✅   |
| **Reopen (any)**        | REJECTED        |     ❌     | ✅ (same dept) |     ❌      |  ✅   |

### Additional Permissions

| Permission                 | Pharmacist |   Dept Head    | Finance Mgr | Admin |
| -------------------------- | :--------: | :------------: | :---------: | :---: |
| **Add/Edit items (DRAFT)** |  ✅ (own)  | ✅ (same dept) |     ❌      |  ✅   |
| **Import from Excel**      |  ✅ (own)  | ✅ (same dept) |     ❌      |  ✅   |
| **Add comments**           |     ✅     |       ✅       |     ✅      |  ✅   |
| **View audit trail**       |     ❌     | ✅ (same dept) |  ✅ (all)   |  ✅   |
| **Export to Excel**        |  ✅ (own)  | ✅ (same dept) |  ✅ (all)   |  ✅   |

---

## Department-based Access

### Access Rules by Role

```typescript
// Pharmacist / Staff
function canAccessRequest(user: User, request: BudgetRequest): boolean {
  // Can access own requests
  if (request.created_by === user.id) return true;

  // Can view dept requests (read-only if not own)
  if (request.department_id === user.department_id) return true;

  return false;
}

// Department Head
function canAccessRequest(user: User, request: BudgetRequest): boolean {
  // Can access all requests in dept
  if (request.department_id === user.department_id) return true;

  return false;
}

// Finance Manager
function canAccessRequest(user: User, request: BudgetRequest): boolean {
  // Can access all requests
  return true;
}
```

### Edit Permissions by Department

```typescript
function canEditRequest(user: User, request: BudgetRequest): boolean {
  // ✅ Must be DRAFT status
  if (request.status !== 'DRAFT') return false;

  // ✅ Pharmacist: Only own requests
  if (user.role === 'pharmacist') {
    return request.created_by === user.id;
  }

  // ✅ Department Head: Any request in dept
  if (user.role === 'department_head') {
    return request.department_id === user.department_id;
  }

  // ✅ Finance Manager: Cannot edit
  if (user.role === 'finance_manager') {
    return false;
  }

  // ✅ Admin: Can edit anything
  if (user.role === 'admin') {
    return true;
  }

  return false;
}
```

---

## Business Rules

### Rule 1: Self-approval Prevention

**ห้ามอนุมัติคำขอของตัวเอง**

```typescript
function canApproveDepartment(user: User, request: BudgetRequest): boolean {
  // ✅ Must be department head
  if (user.role !== 'department_head') return false;

  // ✅ Must be same department
  if (request.department_id !== user.department_id) return false;

  // ❌ Cannot approve own request
  if (request.created_by === user.id) return false;

  // ✅ Status must be SUBMITTED
  if (request.status !== 'SUBMITTED') return false;

  return true;
}
```

**Error Message:**

> ❌ คุณไม่สามารถอนุมัติคำขอของตัวเองได้ (Conflict of Interest)

---

### Rule 2: Sequential Approval

**ต้องผ่านการอนุมัติตามลำดับ**

```typescript
function canApproveFinance(user: User, request: BudgetRequest): boolean {
  // ✅ Must be finance manager
  if (user.role !== 'finance_manager') return false;

  // ✅ Status must be DEPT_APPROVED (not SUBMITTED)
  if (request.status !== 'DEPT_APPROVED') return false;

  // ✅ Must have dept approval first
  if (!request.dept_reviewed_by || !request.dept_reviewed_at) return false;

  return true;
}
```

**Error Message:**

> ❌ คำขอต้องได้รับการอนุมัติจากหัวหน้าแผนกก่อน

---

### Rule 3: Budget Availability Check

**Finance Manager ต้องตรวจสอบงบประมาณก่อนอนุมัติ**

```typescript
async function approveFinance(user: User, request: BudgetRequest): Promise<void> {
  // ✅ Check permissions
  if (!canApproveFinance(user, request)) {
    throw new Error('No permission to approve');
  }

  // ✅ Check budget availability
  const budgetAvailable = await checkBudgetAvailability({
    fiscal_year: request.fiscal_year,
    department_id: request.department_id,
    amount: request.total_requested_amount,
  });

  if (!budgetAvailable) {
    throw new Error('Insufficient budget allocation');
  }

  // ✅ Update status
  await updateBudgetRequest(request.id, {
    status: 'FINANCE_APPROVED',
    finance_reviewed_by: user.id,
    finance_reviewed_at: new Date(),
  });
}
```

**Warning Message (if budget tight):**

> ⚠️ งบประมาณเหลือเพียง 15% - กรุณาตรวจสอบความจำเป็นอย่างรอบคอบ

---

### Rule 4: Reopen Restrictions

**จำกัดการ Reopen คำขอที่ถูก Reject**

```typescript
function canReopenRequest(user: User, request: BudgetRequest): boolean {
  // ✅ Status must be REJECTED
  if (request.status !== 'REJECTED') return false;

  // ✅ Pharmacist: Only own requests
  if (user.role === 'pharmacist') {
    return request.created_by === user.id;
  }

  // ✅ Department Head: Any request in dept
  if (user.role === 'department_head') {
    return request.department_id === user.department_id;
  }

  // ❌ Finance Manager: Cannot reopen
  if (user.role === 'finance_manager') {
    return false;
  }

  return false;
}

// Optional: Limit reopen count
const MAX_REOPEN_COUNT = 2;

async function reopenRequest(user: User, request: BudgetRequest): Promise<void> {
  const reopenCount = await countReopens(request.id);

  if (reopenCount >= MAX_REOPEN_COUNT) {
    throw new Error(`คำขอถูก reopen แล้ว ${MAX_REOPEN_COUNT} ครั้ง - กรุณาติดต่อหัวหน้าแผนก`);
  }

  // Continue with reopen...
}
```

---

## Implementation Guide

### 1. Database Setup

#### Add Permission Records

```sql
-- Insert budget request permissions
INSERT INTO permissions (name, description, category) VALUES
('budget_requests.create', 'Create budget requests', 'inventory'),
('budget_requests.view_own', 'View own budget requests', 'inventory'),
('budget_requests.view_dept', 'View department budget requests', 'inventory'),
('budget_requests.view_all', 'View all budget requests', 'inventory'),
('budget_requests.edit_own', 'Edit own budget requests (DRAFT)', 'inventory'),
('budget_requests.edit_dept', 'Edit department budget requests (DRAFT)', 'inventory'),
('budget_requests.delete_own', 'Delete own budget requests (DRAFT)', 'inventory'),
('budget_requests.submit', 'Submit budget requests for approval', 'inventory'),
('budget_requests.approve_dept', 'Department head approval', 'inventory'),
('budget_requests.approve_finance', 'Finance manager approval', 'inventory'),
('budget_requests.reject', 'Reject budget requests', 'inventory'),
('budget_requests.reopen_own', 'Reopen own rejected requests', 'inventory'),
('budget_requests.reopen_dept', 'Reopen department rejected requests', 'inventory');
```

#### Assign Permissions to Roles

```sql
-- Pharmacist / Staff
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'inventory.pharmacist'),
  id
FROM permissions
WHERE name IN (
  'budget_requests.create',
  'budget_requests.view_own',
  'budget_requests.view_dept',
  'budget_requests.edit_own',
  'budget_requests.delete_own',
  'budget_requests.submit',
  'budget_requests.reopen_own'
);

-- Department Head
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'inventory.department_head'),
  id
FROM permissions
WHERE name IN (
  'budget_requests.create',
  'budget_requests.view_dept',
  'budget_requests.edit_dept',
  'budget_requests.delete_own',
  'budget_requests.submit',
  'budget_requests.approve_dept',
  'budget_requests.reject',
  'budget_requests.reopen_dept'
);

-- Finance Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE name = 'inventory.finance_manager'),
  id
FROM permissions
WHERE name IN (
  'budget_requests.view_all',
  'budget_requests.approve_finance',
  'budget_requests.reject'
);
```

---

### 2. Backend Implementation

#### Permission Service

```typescript
// apps/api/src/core/permissions/budget-request-permissions.service.ts

export class BudgetRequestPermissionService {
  /**
   * Check if user can view a budget request
   */
  async canView(userId: string, requestId: number): Promise<boolean> {
    const user = await this.getUserWithRoles(userId);
    const request = await this.getBudgetRequest(requestId);

    // Admin can view all
    if (this.isAdmin(user)) return true;

    // Finance manager can view all
    if (this.hasRole(user, 'finance_manager')) return true;

    // Department head can view dept requests
    if (this.hasRole(user, 'department_head')) {
      return request.department_id === user.department_id;
    }

    // Pharmacist can view own + dept requests
    if (this.hasRole(user, 'pharmacist')) {
      return request.created_by === userId || request.department_id === user.department_id;
    }

    return false;
  }

  /**
   * Check if user can edit a budget request
   */
  async canEdit(userId: string, requestId: number): Promise<boolean> {
    const user = await this.getUserWithRoles(userId);
    const request = await this.getBudgetRequest(requestId);

    // ✅ Must be DRAFT
    if (request.status !== 'DRAFT') return false;

    // Admin can edit all
    if (this.isAdmin(user)) return true;

    // Department head can edit dept DRAFT requests
    if (this.hasRole(user, 'department_head')) {
      return request.department_id === user.department_id;
    }

    // Pharmacist can edit only own DRAFT requests
    if (this.hasRole(user, 'pharmacist')) {
      return request.created_by === userId;
    }

    return false;
  }

  /**
   * Check if user can approve at department level
   */
  async canApproveDepartment(userId: string, requestId: number): Promise<boolean> {
    const user = await this.getUserWithRoles(userId);
    const request = await this.getBudgetRequest(requestId);

    // ✅ Must be department head
    if (!this.hasRole(user, 'department_head') && !this.isAdmin(user)) {
      return false;
    }

    // ✅ Must be SUBMITTED
    if (request.status !== 'SUBMITTED') return false;

    // ✅ Must be same department
    if (request.department_id !== user.department_id && !this.isAdmin(user)) {
      return false;
    }

    // ❌ Cannot approve own request
    if (request.created_by === userId) return false;

    return true;
  }

  /**
   * Check if user can approve at finance level
   */
  async canApproveFinance(userId: string, requestId: number): Promise<boolean> {
    const user = await this.getUserWithRoles(userId);
    const request = await this.getBudgetRequest(requestId);

    // ✅ Must be finance manager or admin
    if (!this.hasRole(user, 'finance_manager') && !this.isAdmin(user)) {
      return false;
    }

    // ✅ Must be DEPT_APPROVED
    if (request.status !== 'DEPT_APPROVED') return false;

    // ✅ Must have dept approval
    if (!request.dept_reviewed_by) return false;

    return true;
  }
}
```

---

#### Route Guard (Fastify Hook)

```typescript
// apps/api/src/modules/inventory/operations/budgetRequests/guards/budget-request.guard.ts

export async function checkBudgetRequestPermission(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const requestId = parseInt(request.params.id);
  const action = request.routeOptions.config.permission; // 'view', 'edit', 'approve_dept', etc.

  const permissionService = new BudgetRequestPermissionService();

  let hasPermission = false;

  switch (action) {
    case 'view':
      hasPermission = await permissionService.canView(userId, requestId);
      break;
    case 'edit':
      hasPermission = await permissionService.canEdit(userId, requestId);
      break;
    case 'approve_dept':
      hasPermission = await permissionService.canApproveDepartment(userId, requestId);
      break;
    case 'approve_finance':
      hasPermission = await permissionService.canApproveFinance(userId, requestId);
      break;
  }

  if (!hasPermission) {
    return reply.forbidden('You do not have permission to perform this action');
  }
}
```

---

#### Apply Guard to Routes

```typescript
// apps/api/src/modules/inventory/operations/budgetRequests/budget-requests.route.ts

fastify.get(
  '/:id',
  {
    preValidation: [authenticateUser, checkBudgetRequestPermission],
    config: { permission: 'view' },
  },
  getBudgetRequestHandler,
);

fastify.put(
  '/:id',
  {
    preValidation: [authenticateUser, checkBudgetRequestPermission],
    config: { permission: 'edit' },
  },
  updateBudgetRequestHandler,
);

fastify.post(
  '/:id/approve-dept',
  {
    preValidation: [authenticateUser, checkBudgetRequestPermission],
    config: { permission: 'approve_dept' },
  },
  approveDepartmentHandler,
);

fastify.post(
  '/:id/approve-finance',
  {
    preValidation: [authenticateUser, checkBudgetRequestPermission],
    config: { permission: 'approve_finance' },
  },
  approveFinanceHandler,
);
```

---

### 3. Frontend Implementation

#### Permission Directive

```typescript
// apps/web/src/app/core/directives/has-permission.directive.ts

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  @Input() set hasPermission(permission: string) {
    const hasPermission = this.authService.hasPermission(permission);

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
```

#### Usage in Templates

```html
<!-- Show Submit button only if user can submit -->
<button mat-raised-button color="primary" (click)="submit()" *hasPermission="'budget_requests.submit'">Submit for Approval</button>

<!-- Show Approve button only if user can approve -->
<button mat-raised-button color="accent" (click)="approveDepartment()" *hasPermission="'budget_requests.approve_dept'" [disabled]="!canApproveDept()">Approve (Department)</button>
```

#### Permission Service

```typescript
// apps/web/src/app/core/services/budget-request-permission.service.ts

@Injectable({
  providedIn: 'root',
})
export class BudgetRequestPermissionService {
  private authService = inject(AuthService);
  private currentUser = this.authService.currentUser;

  canView(request: BudgetRequest): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Admin can view all
    if (user.roles.includes('admin')) return true;

    // Finance manager can view all
    if (user.roles.includes('finance_manager')) return true;

    // Department head can view dept requests
    if (user.roles.includes('department_head')) {
      return request.department_id === user.department_id;
    }

    // Pharmacist can view own + dept
    return request.created_by === user.id || request.department_id === user.department_id;
  }

  canEdit(request: BudgetRequest): boolean {
    const user = this.currentUser();
    if (!user || request.status !== 'DRAFT') return false;

    // Admin can edit all
    if (user.roles.includes('admin')) return true;

    // Department head can edit dept DRAFT requests
    if (user.roles.includes('department_head')) {
      return request.department_id === user.department_id;
    }

    // Pharmacist can edit own DRAFT
    return request.created_by === user.id;
  }

  canApproveDepartment(request: BudgetRequest): boolean {
    const user = this.currentUser();
    if (!user || request.status !== 'SUBMITTED') return false;

    // Must be dept head or admin
    if (!user.roles.includes('department_head') && !user.roles.includes('admin')) {
      return false;
    }

    // Must be same dept (unless admin)
    if (!user.roles.includes('admin') && request.department_id !== user.department_id) {
      return false;
    }

    // Cannot approve own request
    if (request.created_by === user.id) return false;

    return true;
  }

  canApproveFinance(request: BudgetRequest): boolean {
    const user = this.currentUser();
    if (!user || request.status !== 'DEPT_APPROVED') return false;

    // Must be finance manager or admin
    return user.roles.includes('finance_manager') || user.roles.includes('admin');
  }
}
```

---

## Summary

### Key Takeaways

1. **4 Main Roles**: Pharmacist, Department Head, Finance Manager, Admin
2. **Department-based Access**: Users can only access requests in their department (except Finance & Admin)
3. **Self-approval Prevention**: Cannot approve own requests
4. **Sequential Approval**: Must go through dept approval before finance
5. **Budget Check Required**: Finance must verify budget before final approval

### Next Steps

1. ✅ Implement permission records in database
2. ✅ Create permission service in backend
3. ✅ Add route guards to protect endpoints
4. ✅ Implement permission checking in frontend
5. ⏭️ Read [03-VALIDATION-RULES.md](./03-VALIDATION-RULES.md) for validation logic

---

[← Back to Index](./README.md) | [← Previous: Workflow Analysis](./01-WORKFLOW-ANALYSIS.md) | [Next: Validation Rules →](./03-VALIDATION-RULES.md)
