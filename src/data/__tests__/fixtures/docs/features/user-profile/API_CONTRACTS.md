# User Profile API Contract

## API Overview

**Base URL**: `/api/profile`
**Authentication**: Required
**Content Type**: `application/json`

## Endpoints

### 1. Get User Profile

**GET** `/api/profile`

Retrieves the current user's profile information.

**Authentication:** Required

#### Request Schema

```typescript
interface GetProfileRequest {
  // No request body required
}
```

#### Response Schema

```typescript
interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
}
```

#### Response Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://example.com/avatar.jpg",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Error Responses

**401 Unauthorized** - Authentication required

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**500 Internal Server Error** - Server error occurred

### 2. Update User Profile

**PUT** `/api/profile`

Updates the current user's profile information.

**Authentication:** Required

#### Request Schema

```typescript
interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  avatar?: string;
}
```

#### Query Parameters

- `notify` (boolean, optional): Send email notification. (default: false)

#### Response Schema

```typescript
interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Response Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "avatar": "https://example.com/avatar-new.jpg",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

#### Error Responses

**400 Bad Request** - Invalid input provided

**401 Unauthorized** - Authentication required

### 3. Delete User Profile

**DELETE** `/api/profile`

Deletes the current user's profile and account.

**Authentication:** Required

#### Response Schema

```typescript
interface DeleteResponse {
  success: boolean;
  message: string;
}
```

#### Response Example

```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

#### Error Responses

**401 Unauthorized** - Authentication required

**409 Conflict** - Cannot delete profile with pending transactions
