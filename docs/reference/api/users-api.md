---
title: 'Users API Reference'
description: 'API endpoints for user management with department integration'
category: reference
tags: [api, users, departments, authentication]
---

# Users API Reference

> API endpoints for user management with department assignment and authentication

## Overview

The Users API provides endpoints for managing user accounts with department assignment integration. Users can be assigned to departments for organizational hierarchy and automated workflow assignment.

## Key Features

- Create and manage user accounts
- Assign users to departments
- Department-based access control
- Authentication with department context
- Backward compatibility with legacy users (null department)

## Data Model

### User Object

```typescript
interface User {
  id: string; // UUID primary key
  email: string; // Unique email address
  username: string; // Unique username
  firstName: string; // First name
  lastName: string; // Last name
  department_id?: number | null; // Department assignment (nullable)
  status: UserStatus; // 'active' | 'inactive' | 'suspended' | 'pending'
  isActive: boolean; // Account active flag
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
```

### UserProfile Object (Extended)

```typescript
interface UserProfile extends User {
  bio?: string; // User biography
  avatar?: string; // Avatar URL
  role: string; // Primary role name (deprecated)
  roles: UserRole[]; // Multi-role support
  permissions: string[]; // Aggregated permissions
  emailVerified: boolean; // Email verification status
  preferences?: UserPreferences; // User preferences
}
```

## Endpoints

### Create User

Create a new user account with optional department assignment.

**Endpoint**: `POST /platform/users`

**Request Body**:

```typescript
{
  email: string;                 // Required, unique
  username: string;              // Required, unique
  password: string;              // Required, min 8 chars
  firstName: string;             // Required
  lastName: string;              // Required
  department_id?: number | null; // Optional, must exist if provided
  isActive?: boolean;            // Optional, defaults to true
}
```

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe",
    "department_id": 42,
    "status": "active",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:

```json
// Invalid department_id
{
  "success": false,
  "error": {
    "code": "INVALID_DEPARTMENT",
    "message": "Department with ID 999 does not exist",
    "statusCode": 422
  }
}

// Duplicate email
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email already exists",
    "statusCode": 409
  }
}

// Validation error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    },
    "statusCode": 400
  }
}
```

### Get User by ID

Retrieve user details including department assignment.

**Endpoint**: `GET /platform/users/:id`

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe",
    "department_id": 42,
    "status": "active",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:

```json
// User not found
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "statusCode": 404
  }
}
```

### List Users

Retrieve paginated list of users with optional filters.

**Endpoint**: `GET /platform/users`

**Query Parameters**:

```typescript
{
  page?: number;           // Page number (default: 1)
  limit?: number;          // Items per page (default: 10, max: 100)
  search?: string;         // Search in email, username, firstName, lastName
  department_id?: number;  // Filter by department
  status?: UserStatus;     // Filter by status
  isActive?: boolean;      // Filter by active status
  sort?: string;           // Sort field:order (e.g., "createdAt:desc")
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "username": "john.doe",
      "firstName": "John",
      "lastName": "Doe",
      "department_id": 42,
      "status": "active",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

### Update User

Update user details including department assignment.

**Endpoint**: `PUT /platform/users/:id`

**Request Body**:

```typescript
{
  email?: string;                // Optional, must be unique
  username?: string;             // Optional, must be unique
  firstName?: string;            // Optional
  lastName?: string;             // Optional
  department_id?: number | null; // Optional, validates department exists
  isActive?: boolean;            // Optional
  status?: UserStatus;           // Optional
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe",
    "department_id": 55,
    "status": "active",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

**Error Responses**:

```json
// Invalid department_id
{
  "success": false,
  "error": {
    "code": "INVALID_DEPARTMENT",
    "message": "Department with ID 999 does not exist",
    "statusCode": 422
  }
}
```

### Delete User

Soft delete a user account.

**Endpoint**: `DELETE /platform/users/:id`

**Response**: `200 OK`

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Authentication Endpoints

### Login

Authenticate user and receive access token with department context.

**Endpoint**: `POST /auth/login`

**Request Body**:

```typescript
{
  email: string; // Required
  password: string; // Required
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "department_id": 42,
      "roles": ["user"],
      "permissions": ["read:profile", "update:profile"]
    }
  }
}
```

**Key Feature**: The `user` object in the login response **includes `department_id`**, enabling frontend applications to access the user's department context immediately after authentication.

**Error Responses**:

```json
// Invalid credentials
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "statusCode": 401
  }
}

// Account inactive
{
  "success": false,
  "error": {
    "code": "ACCOUNT_INACTIVE",
    "message": "Your account is inactive. Please contact support.",
    "statusCode": 403
  }
}
```

### Get Current User Profile

Retrieve authenticated user's profile with department information.

**Endpoint**: `GET /auth/profile`

**Headers**: `Authorization: Bearer {accessToken}`

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe",
    "department_id": 42,
    "bio": "Senior Developer",
    "avatar": "https://example.com/avatars/john.jpg",
    "role": "admin",
    "roles": [
      {
        "id": "role-123",
        "name": "admin",
        "permissions": ["users:create", "users:read", "users:update"]
      }
    ],
    "permissions": ["users:create", "users:read", "users:update"],
    "emailVerified": true,
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Department Integration

### Department Assignment Validation

When creating or updating users with `department_id`:

1. **Department must exist**: The system validates that the department exists in the database
2. **Nullable field**: Setting `department_id: null` is allowed (backward compatibility)
3. **Inactive departments**: Users can be assigned to inactive departments (warning issued)
4. **Cascading updates**: If a department is deleted, users' `department_id` is set to `null`

### Auto-Population in Workflows

The `department_id` from the authenticated user is automatically used in:

- **Budget Requests**: Automatically fills `department_id` when creating budget requests
- **Document Workflows**: Department-based document approval routing
- **Access Control**: Department-based resource filtering

### Example: Budget Request with Department Auto-Population

```typescript
// Frontend: User is authenticated
const currentUser = authService.currentUser(); // { id: "...", department_id: 42 }

// Create budget request (department_id auto-filled by backend)
const response = await fetch('/inventory/budget-requests', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fiscal_year: 2567,
    justification: 'Q1 Budget Request',
    // No need to specify department_id - auto-populated from user
  }),
});

// Backend automatically adds department_id from authenticated user
// Response includes department_id: 42
```

## Error Codes Reference

| Error Code            | Status Code | Description               |
| --------------------- | ----------- | ------------------------- |
| `VALIDATION_ERROR`    | 400         | Request validation failed |
| `USER_NOT_FOUND`      | 404         | User does not exist       |
| `DUPLICATE_EMAIL`     | 409         | Email already in use      |
| `DUPLICATE_USERNAME`  | 409         | Username already in use   |
| `INVALID_DEPARTMENT`  | 422         | Department does not exist |
| `INVALID_CREDENTIALS` | 401         | Login failed              |
| `ACCOUNT_INACTIVE`    | 403         | User account is inactive  |
| `UNAUTHORIZED`        | 401         | Missing or invalid token  |
| `FORBIDDEN`           | 403         | Insufficient permissions  |

## Backward Compatibility

### Legacy Users (No Department)

Users created before department integration have `department_id: null`. These users:

- ✅ Can login successfully
- ✅ Can access all endpoints
- ⚠️ May see warnings in department-dependent workflows
- ❌ Cannot create budget requests without manually selecting a department

### Migration Path

1. Admin assigns departments to existing users via `PUT /platform/users/:id`
2. Users log out and log back in to refresh department context
3. Department-dependent features become available automatically

## Best Practices

### Frontend Integration

```typescript
// Check if user has department before using department-dependent features
if (currentUser.department_id) {
  // User has department - can use auto-population
  createBudgetRequest({ fiscal_year: 2567 });
} else {
  // User has no department - show warning and require manual selection
  showWarning('Please select a department manually');
  createBudgetRequest({ fiscal_year: 2567, department_id: selectedDepartmentId });
}
```

### Error Handling

```typescript
try {
  const response = await createUser({
    email: 'user@example.com',
    username: 'newuser',
    password: 'SecurePass123',
    firstName: 'New',
    lastName: 'User',
    department_id: 999, // Invalid
  });
} catch (error) {
  if (error.code === 'INVALID_DEPARTMENT') {
    // Handle invalid department error
    alert('Selected department does not exist');
  } else if (error.code === 'DUPLICATE_EMAIL') {
    // Handle duplicate email error
    alert('Email already in use');
  }
}
```

### Filtering by Department

```typescript
// Get all users in a specific department
const response = await fetch('/platform/users?department_id=42&page=1&limit=50');

// Get users without department assignment
const response = await fetch('/platform/users?department_id=null');
```

## Related Documentation

- [Departments API](./departments-api.md) - Department management endpoints
- [Budget Requests API](./budget-requests-api.md) - Budget request with department integration
- [API Response Standard](./api-response-standard.md) - Standard response format
- [User-Department Integration Migration Guide](../../guides/migrations/user-department-integration.md) - Migration guide for administrators
