---
title: 'User-Department Integration Migration Guide'
description: 'Guide for migrating to user-department integration with backward compatibility'
category: guide
tags: [migration, users, departments, upgrade]
---

# User-Department Integration Migration Guide

> **Migration Guide**: Seamlessly adopt department-based user workflows without disrupting existing operations

## Overview

This guide helps system administrators migrate from standalone user accounts to department-integrated user management. The migration is **backward compatible** - existing users without department assignments continue working normally.

## What's New

### Department Assignment for Users

Users can now be assigned to departments, enabling:

- ✅ **Auto-populated department fields** in budget requests and workflows
- ✅ **Department-based access control** and resource filtering
- ✅ **Organizational hierarchy** representation
- ✅ **Automated workflow routing** based on department structure

### Backward Compatibility

**No breaking changes** - the system handles both:

- **Legacy users**: Users with `department_id: null` (created before this feature)
- **New users**: Users with department assignments

## Migration Timeline

### Phase 1: Immediate (No Action Required)

- ✅ System deployed with backward compatibility
- ✅ Existing users continue working normally
- ✅ No service interruption

### Phase 2: Department Assignment (Administrator Action)

- 👤 Administrators assign departments to existing users
- ⏱️ Can be done gradually over time
- 🎯 Recommended: Complete within 30 days

### Phase 3: Full Adoption

- ✅ All users have department assignments
- ✅ Department-based workflows fully operational
- ✅ Enhanced reporting and analytics available

## Impact Assessment

### Who is Affected?

| User Type                             | Impact                                           | Action Required              |
| ------------------------------------- | ------------------------------------------------ | ---------------------------- |
| **Existing users without department** | ⚠️ Cannot use auto-population in budget requests | Admin must assign department |
| **Existing users with department**    | ✅ No impact                                     | None                         |
| **New users**                         | ✅ Department assigned during creation           | None                         |
| **System administrators**             | 📋 Must assign departments to legacy users       | Follow guide below           |

### Feature Impact

| Feature                  | Before Migration               | After Migration                        |
| ------------------------ | ------------------------------ | -------------------------------------- |
| **User Login**           | ✅ Works                       | ✅ Works (includes department context) |
| **User Profile**         | ✅ Works                       | ✅ Works (shows department)            |
| **Budget Requests**      | ✅ Manual department selection | ✅ Auto-filled from user profile       |
| **Department Filtering** | ❌ Not available               | ✅ Available                           |
| **Workflow Routing**     | ⚠️ Manual routing              | ✅ Automatic department-based routing  |

## Migration Steps for Administrators

### Step 1: Identify Users Without Departments

**API Request**:

```bash
GET /platform/users?department_id=null&page=1&limit=100
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "email": "john.doe@example.com",
      "username": "john.doe",
      "firstName": "John",
      "lastName": "Doe",
      "department_id": null,
      "status": "active"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "totalPages": 1
  }
}
```

**Expected Result**: List of all users needing department assignment

---

### Step 2: Review Department Structure

**API Request**:

```bash
GET /core/departments?is_active=true&page=1&limit=100
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "dept_code": "IT",
      "dept_name": "Information Technology",
      "parent_id": null,
      "is_active": true
    },
    {
      "id": 55,
      "dept_code": "FIN",
      "dept_name": "Finance",
      "parent_id": null,
      "is_active": true
    }
  ]
}
```

**Action**: Map each user to their appropriate department

---

### Step 3: Assign Departments to Users

**API Request** (Single User):

```bash
PUT /platform/users/:userId
Content-Type: application/json

{
  "department_id": 42
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "john.doe@example.com",
    "department_id": 42,
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

**Bulk Assignment Script** (Node.js):

```javascript
const axios = require('axios');

const API_BASE = 'https://your-api.com';
const ACCESS_TOKEN = 'your-admin-token';

// User-to-department mapping
const assignments = [
  { userId: 'user-123', departmentId: 42 },
  { userId: 'user-456', departmentId: 55 },
  // ... more assignments
];

async function assignDepartments() {
  for (const assignment of assignments) {
    try {
      const response = await axios.put(
        `${API_BASE}/platform/users/${assignment.userId}`,
        { department_id: assignment.departmentId },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`✅ Assigned user ${assignment.userId} to department ${assignment.departmentId}`);
    } catch (error) {
      console.error(`❌ Failed for user ${assignment.userId}:`, error.response?.data);
    }
  }
}

assignDepartments();
```

---

### Step 4: Verify Migration

**Check Assignment Coverage**:

```bash
# Count users with departments
GET /platform/users?page=1&limit=1
# Note total count from pagination.total

# Count users without departments
GET /platform/users?department_id=null&page=1&limit=1
# Note total count from pagination.total

# Calculate coverage: (total - null) / total * 100%
```

**Expected Result**: 100% coverage (or acceptable percentage per your policy)

---

### Step 5: Notify Users

**Email Template**:

```
Subject: Department Assignment Completed - Enhanced Workflow Available

Dear [User Name],

Your account has been assigned to the [Department Name] department.

What this means for you:
✅ Faster budget request creation (department auto-filled)
✅ Department-based document filtering
✅ Access to department-specific resources

No action required from you. Simply log out and log back in to see the changes.

If you believe your department assignment is incorrect, please contact IT support.

Best regards,
IT Team
```

## Common Scenarios

### Scenario 1: User in Multiple Departments

**Problem**: User works across multiple departments

**Solution**:

1. Assign user to their **primary** department (where they spend most time)
2. User can manually override department in workflows when needed
3. Consider role-based permissions for cross-department access

**Example**:

```json
// Primary assignment
PUT /platform/users/user-123
{ "department_id": 42 }

// User can still create budget for department 55
POST /inventory/budget-requests
{
  "fiscal_year": 2567,
  "department_id": 55  // Manual override
}
```

---

### Scenario 2: Department Restructuring

**Problem**: Department merged or split

**Solution**:

1. Create new department structure first
2. Update affected users' `department_id`
3. Delete old departments (users automatically set to `null`)
4. Re-assign users to new departments

**Example**:

```bash
# 1. Create new department
POST /core/departments
{ "dept_code": "IT-OPS", "dept_name": "IT Operations" }
# Response: { id: 100 }

# 2. Update users from old department (42) to new (100)
PUT /platform/users/user-123
{ "department_id": 100 }

# 3. Delete old department
DELETE /core/departments/42
# All users with department_id: 42 are now null

# 4. Re-assign if needed
```

---

### Scenario 3: User Without Department Creates Budget Request

**Problem**: Legacy user tries to create budget request

**Error Response**:

```json
{
  "success": false,
  "error": {
    "code": "USER_NO_DEPARTMENT",
    "message": "You are not assigned to a department. Please contact your administrator to assign you to a department before creating budget requests, or select a department manually.",
    "statusCode": 400
  }
}
```

**Resolution**:

1. **Option A**: Admin assigns department to user (recommended)
2. **Option B**: User manually selects department in form

---

### Scenario 4: Inactive Department Assigned to User

**Problem**: User assigned to inactive department

**System Behavior**:

- ✅ Login succeeds
- ⚠️ Warning displayed in profile: "Your department is currently inactive"
- ✅ Workflows continue normally (department still valid)

**Admin Action**: No immediate action required unless department is deleted

## Troubleshooting

### Issue: "Cannot assign department - department not found"

**Error**:

```json
{
  "code": "INVALID_DEPARTMENT",
  "message": "Department with ID 999 does not exist"
}
```

**Solution**:

1. Verify department exists: `GET /core/departments/999`
2. Check department is active: `is_active: true`
3. Use correct department ID from departments list

---

### Issue: Users not seeing department after assignment

**Cause**: User session contains old authentication context

**Solution**: User must **log out and log back in** to refresh session

---

### Issue: Bulk assignment script fails for some users

**Common Causes**:

- Invalid user ID (user deleted)
- Invalid department ID (department doesn't exist)
- Permission denied (insufficient admin rights)

**Solution**:

```javascript
// Enhanced error handling
try {
  await assignDepartment(userId, departmentId);
} catch (error) {
  if (error.response?.status === 404) {
    console.error(`User ${userId} not found - skip or investigate`);
  } else if (error.response?.status === 422) {
    console.error(`Department ${departmentId} invalid - verify department exists`);
  } else if (error.response?.status === 403) {
    console.error(`Permission denied - check admin token`);
  }
}
```

## Rollback Plan

### If Issues Arise During Migration

**Rollback is not required** - backward compatibility ensures:

- Users with `department_id: null` continue working
- No data loss occurs
- System remains stable

**To Pause Migration**:

1. Stop assigning departments to remaining users
2. Investigate issues
3. Resume when resolved

**To Revert Department Assignments** (if absolutely necessary):

```bash
# Set all users back to null department
PUT /platform/users/:userId
{ "department_id": null }
```

## Best Practices

### 1. Gradual Migration

- ✅ Start with small pilot group (e.g., IT department)
- ✅ Gather feedback
- ✅ Expand to other departments progressively

### 2. Communication Plan

- ✅ Announce migration timeline to all users
- ✅ Provide training on new department-based features
- ✅ Set up support channel for questions

### 3. Data Quality

- ✅ Verify department structure is complete
- ✅ Ensure department names are accurate
- ✅ Double-check user-to-department mappings

### 4. Testing

- ✅ Test with pilot users before full rollout
- ✅ Verify budget request workflow with department auto-fill
- ✅ Test filtering and reporting features

### 5. Monitoring

- ✅ Monitor error logs for `USER_NO_DEPARTMENT` errors
- ✅ Track migration progress (% users with departments)
- ✅ Collect user feedback on new features

## FAQ

### Q: Do existing budget requests need to be updated?

**A**: No. Existing budget requests retain their original `department_id` (or `null`). Only new budget requests benefit from auto-population.

---

### Q: Can users change their own department?

**A**: No. Only administrators can assign departments to users. This maintains organizational control.

---

### Q: What happens if a department is deleted?

**A**: All users assigned to that department have their `department_id` set to `null`. They become "legacy users" and require manual department selection in workflows.

---

### Q: Will this affect performance?

**A**: No. Department assignment is a simple foreign key relationship. No performance impact on existing operations.

---

### Q: Can I assign users to multiple departments?

**A**: Currently, each user can have **one primary department**. However, users can manually override department selection in individual workflows.

---

### Q: How do I generate a migration report?

**A**: Use this API query:

```bash
# Summary report
GET /platform/users?page=1&limit=1000

# Process response to count:
# - Total users
# - Users with departments
# - Users without departments
# - Department distribution
```

## Success Criteria

Migration is considered complete when:

- ✅ 100% of active users have department assignments (or acceptable %)
- ✅ No `USER_NO_DEPARTMENT` errors in logs
- ✅ Department-based workflows operational
- ✅ User feedback is positive
- ✅ Admin team trained on department management

## Support

### Need Help?

- 📧 Email: it-support@company.com
- 📞 Phone: +66-XXX-XXXX
- 💬 Slack: #it-support
- 📖 Documentation: [Users API Reference](../../reference/api/users-api.md)

### Escalation Path

1. **Level 1**: IT Support Team
2. **Level 2**: System Administrator
3. **Level 3**: Development Team

---

**Document Version**: 1.0
**Last Updated**: 2024-01-15
**Related Docs**: [Users API](../../reference/api/users-api.md), [Departments API](../../reference/api/departments-api.md)
