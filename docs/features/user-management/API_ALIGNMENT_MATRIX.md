# User Detail Page - API Alignment Matrix

> Analysis of frontend and backend API alignment to identify independent work streams and parallel development opportunities

## Overview

Frontend: `/apps/web/src/app/core/users/pages/user-detail.component.ts`
Backend: `/apps/api/src/core/users/`

---

## Frontend Component Status

### User Detail Component Tabs

| Tab             | Status         | Frontend Service Method     | Backend API Endpoint                 | Alignment       |
| --------------- | -------------- | --------------------------- | ------------------------------------ | --------------- |
| **Profile**     | ✅ Implemented | `loadUserById()`            | `GET /api/users/:id`                 | ✅ Complete     |
| **Activity**    | ❌ Placeholder | `getUserActivities()`       | `GET /api/profile/activity`          | ⚠️ Backend only |
| **Permissions** | ❌ Placeholder | `getUserRoles()`            | `GET /api/users/:id/roles`           | ✅ Both ready   |
| **Sessions**    | ❌ Placeholder | `getUserActivitySessions()` | `GET /api/profile/activity/sessions` | ⚠️ Backend only |

---

## Backend API Endpoints Available

### ✅ User CRUD Operations

| Endpoint                  | Method | Permission              | Status   | Description                          |
| ------------------------- | ------ | ----------------------- | -------- | ------------------------------------ |
| `/api/users`              | GET    | `users:read`            | ✅ Ready | List all users with pagination       |
| `/api/users/:id`          | GET    | `users:read`            | ✅ Ready | Get user by ID (used in Profile tab) |
| `/api/users/:id`          | PUT    | `users:update`          | ✅ Ready | Update user details                  |
| `/api/users/:id`          | DELETE | `users:delete`          | ✅ Ready | Delete user                          |
| `/api/users/:id/password` | PUT    | `users:update-password` | ✅ Ready | Change user password                 |
| `/api/profile/password`   | POST   | Authenticated           | ✅ Ready | Change own password                  |

### ✅ Multi-Role Management

| Endpoint                      | Method | Permission     | Status   | Description                    |
| ----------------------------- | ------ | -------------- | -------- | ------------------------------ |
| `/api/users/:id/roles`        | GET    | `users:read`   | ✅ Ready | Get all roles assigned to user |
| `/api/users/:id/roles/assign` | POST   | `users:update` | ✅ Ready | Assign multiple roles to user  |
| `/api/users/:id/roles/remove` | POST   | `users:update` | ✅ Ready | Remove role from user          |
| `/api/users/:id/roles/expiry` | POST   | `users:update` | ✅ Ready | Update role expiry date        |
| `/api/roles`                  | GET    | admin/manager  | ✅ Ready | Get all available roles        |

### ✅ Bulk Operations

| Endpoint                        | Method | Permission                 | Status   | Description            |
| ------------------------------- | ------ | -------------------------- | -------- | ---------------------- |
| `/api/users/bulk/activate`      | POST   | `users:bulk:activate`      | ✅ Ready | Bulk activate users    |
| `/api/users/bulk/deactivate`    | POST   | `users:bulk:deactivate`    | ✅ Ready | Bulk deactivate users  |
| `/api/users/bulk/delete`        | POST   | `users:bulk:delete`        | ✅ Ready | Bulk soft delete users |
| `/api/users/bulk/role-change`   | POST   | admin                      | ✅ Ready | Bulk change roles      |
| `/api/users/bulk/change-status` | POST   | `users:bulk:change-status` | ✅ Ready | Bulk change status     |

### ✅ Activity Tracking

| Endpoint                         | Method | Permission    | Status   | Description                  |
| -------------------------------- | ------ | ------------- | -------- | ---------------------------- |
| `/api/profile/activity`          | GET    | Authenticated | ✅ Ready | Get user's activity logs     |
| `/api/profile/activity/sessions` | GET    | Authenticated | ✅ Ready | Get user's sessions          |
| `/api/profile/activity/stats`    | GET    | Authenticated | ✅ Ready | Get activity statistics      |
| `/api/activity-logs`             | GET    | admin         | ✅ Ready | Get all system activity logs |
| `/api/activity-logs/stats`       | GET    | admin         | ✅ Ready | Get system activity stats    |

### ✅ Utility Endpoints

| Endpoint              | Method | Permission   | Status   | Description                   |
| --------------------- | ------ | ------------ | -------- | ----------------------------- |
| `/api/users/dropdown` | GET    | `users:read` | ✅ Ready | Get users for dropdown/select |

---

## Frontend Service Methods Available

All methods in `UserService` are already implemented:

### User Management

- `loadUsers()` - List users
- `loadUserById(userId)` - Get user details
- `createUser(data)` - Create new user
- `updateUser(userId, data)` - Update user
- `deleteUser(userId)` - Delete user
- `changePassword(userId, password)` - Change password

### Multi-Role Management

- `getUserRoles(userId)` - Get user roles ✅
- `assignRolesToUser(userId, roleIds)` - Assign roles ✅
- `removeRoleFromUser(userId, roleId)` - Remove role ✅
- `updateRoleExpiry(userId, roleId, expiresAt)` - Set expiry ✅
- `getAllRoles()` - List all roles ✅

### Activity & Sessions

- `getUserActivities(userId, query)` - Get activity logs ✅
- `getUserActivitySessions(userId, page, limit)` - Get sessions ✅
- `getUserActivityStats(userId)` - Get activity stats ✅

### Bulk Operations

- `bulkActivateUsers(userIds)` - Activate multiple
- `bulkDeactivateUsers(userIds)` - Deactivate multiple
- `bulkSuspendUsers(userIds)` - Suspend multiple
- `bulkDeleteUsers(userIds)` - Delete multiple
- `bulkChangeUserRoles(userIds, roleIds)` - Change roles
- `bulkChangeUserStatus(userIds, status)` - Change status

---

## Component Implementation Gap Analysis

### Profile Tab (line 97-165)

**Status**: ✅ **COMPLETE**

Currently displays:

- User header with initials
- Basic user information (username, email, role, status)
- Timestamps (created, updated, last login)

No additional work needed.

---

### Activity Tab (line 167-176)

**Status**: ❌ **NOT IMPLEMENTED**

**What needs to be done**:

1. Create activity list component to display recent activities
2. Call `userService.getUserActivities(userId)`
3. Display activity records with:
   - Action type (e.g., "login", "profile_view", "role_assignment")
   - Description
   - Timestamp
   - Severity level (if available)
4. Add pagination support for activity logs

**Backend Ready**: ✅ YES

- Endpoint: `GET /api/profile/activity?page=1&limit=10`
- Response includes: activities array + pagination metadata

**Frontend Service**: ✅ Already implemented

- Method: `getUserActivities(userId, query)`

---

### Permissions/Roles Tab (line 178-187)

**Status**: ❌ **NOT IMPLEMENTED**

**What needs to be done**:

1. Create role assignment component
2. Display current roles assigned to user with:
   - Role name
   - Assignment date
   - Expiry date (if set)
   - Active/Inactive status
3. Add UI for:
   - **Assign new roles**: Button → Dialog with multi-select roles
   - **Remove roles**: Delete button per role with confirmation
   - **Set role expiry**: Edit date per role with date picker
4. Handle role operations:
   - `assignRolesToUser(userId, roleIds)`
   - `removeRoleFromUser(userId, roleId)`
   - `updateRoleExpiry(userId, roleId, expiresAt)`

**Backend Ready**: ✅ YES

- GET roles: `GET /api/users/:id/roles`
- Assign roles: `POST /api/users/:id/roles/assign`
- Remove roles: `POST /api/users/:id/roles/remove`
- Update expiry: `POST /api/users/:id/roles/expiry`
- List all roles: `GET /api/roles`

**Frontend Service**: ✅ Already implemented

- `getUserRoles(userId)`
- `assignRolesToUser(userId, request)`
- `removeRoleFromUser(userId, request)`
- `updateRoleExpiry(userId, request)`
- `getAllRoles()`

---

### Sessions Tab (line 189-198)

**Status**: ❌ **NOT IMPLEMENTED**

**What needs to be done**:

1. Create session management component
2. Display active sessions with:
   - Session ID
   - IP address / Device info
   - Last activity timestamp
   - Duration/Started at
3. Optional: Ability to revoke sessions (if backend supports)

**Backend Ready**: ✅ Partially

- Endpoint: `GET /api/profile/activity/sessions?page=1&limit=10`
- Returns session data with pagination

**Frontend Service**: ✅ Already implemented

- Method: `getUserActivitySessions(userId, page, limit)`

---

## Additional Features to Implement

### Status Management

**Current Implementation**: Profile tab shows status but no UI to change it

**Recommended Addition**:

1. Add status change dropdown in Profile tab or separate UI
2. Show current status as badge (active/inactive/suspended/pending)
3. Call bulk endpoint or single user update for status changes
4. Add confirmation dialog before changing status

**Available Endpoints**:

- Single user: `PUT /api/users/:id` (include `status` in body)
- Bulk: `POST /api/users/bulk/change-status` (for multiple users)

---

## Parallel Development Streams

### Stream A: Permissions/Roles Tab ⚡ **INDEPENDENT**

- **Components**: Role assignment UI
- **Estimated Effort**: 2-3 hours
- **Dependencies**: None (all backend ready, service ready)
- **Blocking**: None
- **Can Start**: ✅ Immediately

### Stream B: Activity Tab ⚡ **INDEPENDENT**

- **Components**: Activity log list with pagination
- **Estimated Effort**: 2-3 hours
- **Dependencies**: None (backend ready, service ready)
- **Blocking**: None
- **Can Start**: ✅ Immediately

### Stream C: Sessions Tab ⚡ **INDEPENDENT**

- **Components**: Session management list
- **Estimated Effort**: 1-2 hours
- **Dependencies**: None (backend ready, service ready)
- **Blocking**: None
- **Can Start**: ✅ Immediately

### Stream D: Status Management 🔧 **OPTIONAL**

- **Components**: Status change UI
- **Estimated Effort**: 1 hour
- **Dependencies**: None
- **Blocking**: None
- **Can Start**: ✅ Immediately

---

## Recommended Implementation Order

Since all three tabs can work independently, you can develop them in parallel:

### Parallel Approach (Fastest)

```
Developer 1: Implement Permissions/Roles Tab
Developer 2: Implement Activity Tab
Developer 3: Implement Sessions Tab
→ Combine when all ready (1-2 hours for testing/fixes)
```

### Sequential Approach (If only one developer)

```
1. Permissions Tab (core functionality)
2. Activity Tab (user insights)
3. Sessions Tab (basic session info)
4. Status Management (enhancement)
```

---

## API Response Formats

### GET /api/users/:id/roles

```json
{
  "success": true,
  "data": [
    {
      "id": "role_id",
      "roleId": "role_id",
      "roleName": "Administrator",
      "assignedAt": "2024-11-08T10:00:00Z",
      "assignedBy": "user_id",
      "expiresAt": null,
      "isActive": true
    }
  ]
}
```

### GET /api/profile/activity

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_id",
        "action": "login",
        "description": "User logged in",
        "severity": "info",
        "timestamp": "2024-11-08T10:00:00Z",
        "metadata": { ... }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

### GET /api/profile/activity/sessions

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_id",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "startedAt": "2024-11-08T10:00:00Z",
        "lastActivityAt": "2024-11-08T10:30:00Z",
        "expiresAt": "2024-11-09T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## Summary

| Feature           | Frontend | Backend  | Ready | Effort |
| ----------------- | -------- | -------- | ----- | ------ |
| Profile Tab       | ✅ Done  | ✅ Ready | Yes   | -      |
| Permissions Tab   | ❌ TODO  | ✅ Ready | 50%   | 2-3h   |
| Activity Tab      | ❌ TODO  | ✅ Ready | 50%   | 2-3h   |
| Sessions Tab      | ❌ TODO  | ✅ Ready | 50%   | 1-2h   |
| Status Management | ❌ TODO  | ✅ Ready | 50%   | 1h     |

**Total Effort**: 6-9 hours (sequential) or 2-3 hours (parallel with 3 developers)

**Recommendation**: Use parallel development to complete all three tabs simultaneously in 2-3 hours.
