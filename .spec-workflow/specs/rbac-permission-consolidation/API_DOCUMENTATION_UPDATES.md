# User-Departments API - Documentation Updates

## Summary of Changes

The user-departments API endpoints have been updated as part of the RBAC Permission Consolidation initiative. Department permission flags have been removed, and all permission management is now handled through the RBAC system.

## Breaking Changes

### Removed Fields (Responses)

The following fields have been **REMOVED** from all response schemas:

- `canCreateRequests` / `can_create_requests`
- `canEditRequests` / `can_edit_requests`
- `canSubmitRequests` / `can_submit_requests`
- `canApproveRequests` / `can_approve_requests`
- `canViewReports` / `can_view_reports`

### Removed Fields (Requests)

The following fields are **NO LONGER ACCEPTED** in request payloads:

- `canCreateRequests`
- `canEditRequests`
- `canSubmitRequests`
- `canApproveRequests`
- `canViewReports`

## Updated Endpoints

### GET /users/me/departments

Returns user's department assignments (organizational structure only).

**Response Schema (Updated):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "departmentId": 1,
      "isPrimary": true,
      "assignedRole": "Manager",
      "validFrom": "2025-01-01T00:00:00Z",
      "validUntil": null,
      "assignedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Note:** Permission fields removed. Use RBAC system for permission checks.

### POST /users/:userId/departments/:departmentId

Assigns user to department (organizational structure only).

**Request Schema (Updated):**

```json
{
  "isPrimary": true,
  "assignedRole": "Staff",
  "validFrom": "2025-01-01",
  "validUntil": null
}
```

**Note:** Permission parameters removed. Assign permissions via RBAC endpoints.

### GET /users/:userId/departments/primary

Returns user's primary department.

**Response Schema:** Same as GET /users/me/departments (single object)

### DELETE /users/:userId/departments/:departmentId

Removes user from department (soft delete via validUntil).

**No schema changes** - operates on organizational structure only.

## Migration Guide for API Consumers

### For Frontend Applications

**Before:**

```typescript
// OLD: Check department permission
if (userDepartment.canApproveRequests) {
  showApproveButton();
}
```

**After:**

```typescript
// NEW: Check RBAC permission
if (authService.hasPermission('budget-requests:approve')) {
  showApproveButton();
}
```

### For External API Integrations

**Before:**

```bash
# OLD: Assign with permissions
curl -X POST /users/123/departments/456 \
  -d '{
    "isPrimary": true,
    "canApproveRequests": true
  }'
```

**After:**

```bash
# NEW: Assign without permissions
curl -X POST /users/123/departments/456 \
  -d '{"isPrimary": true}'

# Assign permissions separately via RBAC
curl -X POST /users/123/roles \
  -d '{"roleId": "supervisor-role-id"}'
```

## Permission Mapping Reference

| Old Department Flag    | RBAC Permission           |
| ---------------------- | ------------------------- |
| `can_create_requests`  | `budget-requests:create`  |
| `can_edit_requests`    | `budget-requests:update`  |
| `can_submit_requests`  | `budget-requests:submit`  |
| `can_approve_requests` | `budget-requests:approve` |
| `can_view_reports`     | `reports:view`            |

## RBAC Endpoints

For permission management, use these endpoints:

- **GET /rbac/users/:userId/permissions** - Get user's effective permissions
- **POST /rbac/users/:userId/roles** - Assign role to user
- **GET /rbac/roles** - List available roles
- **GET /rbac/roles/:roleId/permissions** - Get role's permissions

## Backward Compatibility

**API Version:** v1 (current)

**Breaking Changes:** Yes - permission fields removed from responses and requests

**Recommended Actions:**

1. Update API clients to remove permission field references
2. Implement RBAC permission checks where needed
3. Test thoroughly in staging before production deployment

## Support

For questions or issues:

- Review RBAC Permission Consolidation specification
- Contact API team
- Refer to migration runbook

---

**Document Version:** 1.0
**Last Updated:** 2025-12-17
**Related Spec:** RBAC Permission Consolidation
