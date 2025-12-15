# Bulk Operations API Design for User Management

## Overview

This document outlines the comprehensive design for Bulk Operations API endpoints in the User Management system. The API follows RESTful conventions, provides robust error handling for partial failures, and implements security best practices.

## API Endpoints

### Base Path: `/api/users/bulk`

| Endpoint       | Method | Description            | Auth Required |
| -------------- | ------ | ---------------------- | ------------- |
| `/activate`    | POST   | Bulk activate users    | Admin only    |
| `/deactivate`  | POST   | Bulk deactivate users  | Admin only    |
| `/delete`      | POST   | Bulk soft delete users | Admin only    |
| `/role-change` | POST   | Bulk role change       | Admin only    |

## Request/Response Schemas

### 1. Bulk Activate/Deactivate Users

**Endpoint:** `POST /api/users/bulk/activate` or `POST /api/users/bulk/deactivate`

**Request Schema:**

```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Validation Rules:**

- `userIds`: Array of UUID strings
- Minimum: 1 user ID
- Maximum: 100 user IDs per request
- All IDs must be valid UUIDs

### 2. Bulk Delete Users

**Endpoint:** `POST /api/users/bulk/delete`

**Request Schema:** Same as activate/deactivate

### 3. Bulk Role Change

**Endpoint:** `POST /api/users/bulk/role-change`

**Request Schema:**

```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "roleId": "new-role-uuid"
}
```

**Validation Rules:**

- `userIds`: Array of UUID strings (1-100 items)
- `roleId`: Valid UUID of existing role

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "totalRequested": 3,
    "successCount": 2,
    "failureCount": 1,
    "results": [
      {
        "userId": "uuid1",
        "success": true
      },
      {
        "userId": "uuid2",
        "success": true
      },
      {
        "userId": "uuid3",
        "success": false,
        "error": {
          "code": "USER_NOT_FOUND",
          "message": "User not found"
        }
      }
    ],
    "summary": {
      "message": "Bulk operation completed with 2 successes and 1 failure",
      "hasFailures": true
    }
  },
  "message": "Bulk operation completed"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "userIds",
        "message": "Must contain at least 1 user ID",
        "code": "ARRAY_MIN_ITEMS",
        "value": []
      }
    ]
  }
}
```

## Error Handling Strategy

### Partial Failure Handling

The API is designed to handle partial failures gracefully:

1. **Continue Processing**: If one user operation fails, continue with remaining users
2. **Individual Results**: Each user operation result is tracked individually
3. **Summary Information**: Provide overall success/failure counts
4. **Detailed Errors**: Include specific error codes and messages for failures

### Error Codes

| Error Code                   | Description                          | HTTP Status   |
| ---------------------------- | ------------------------------------ | ------------- |
| `USER_NOT_FOUND`             | User ID doesn't exist                | 200 (partial) |
| `USER_ALREADY_ACTIVE`        | User is already active               | 200 (partial) |
| `USER_ALREADY_INACTIVE`      | User is already inactive             | 200 (partial) |
| `ROLE_NOT_FOUND`             | Target role doesn't exist            | 200 (partial) |
| `CANNOT_CHANGE_OWN_STATUS`   | Admin cannot deactivate themselves   | 200 (partial) |
| `CANNOT_CHANGE_ADMIN_STATUS` | Cannot change status of other admins | 200 (partial) |
| `INSUFFICIENT_PERMISSIONS`   | User lacks required permissions      | 403           |
| `USER_ALREADY_DELETED`       | User is already soft deleted         | 200 (partial) |
| `VALIDATION_ERROR`           | Request validation failed            | 400           |
| `RATE_LIMIT_EXCEEDED`        | Too many requests                    | 429           |

### Business Rules

1. **Self-Protection**: Admins cannot deactivate or delete themselves
2. **Admin Protection**: Only super-admins can modify other admin accounts
3. **Role Validation**: Target role must exist and be active
4. **Status Validation**: Skip operations that don't change current state

## Security Considerations

### Authentication & Authorization

1. **Admin Only**: All bulk operations require admin role
2. **JWT Authentication**: Standard bearer token authentication
3. **Role-Based Access**: Fine-grained permissions based on user roles

### Security Measures

1. **Request Size Limits**: Maximum 100 users per request
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Audit Logging**: Log all bulk operations for compliance
4. **Input Validation**: Strict TypeBox validation on all inputs
5. **SQL Injection Protection**: Parameterized queries only

### Recommended Rate Limits

```typescript
// Recommended rate limiting configuration
const rateLimits = {
  bulk_operations: {
    windowMs: 60000, // 1 minute
    max: 10, // 10 requests per minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  per_user_operations: {
    windowMs: 60000, // 1 minute
    max: 500, // Max 500 user operations per minute across all requests
    countUsersInRequest: true,
  },
};
```

## Implementation Guidelines

### Database Considerations

1. **Transactions**: Use database transactions for consistency
2. **Batch Processing**: Process users in batches to avoid memory issues
3. **Indexes**: Ensure proper indexes on user_id and role_id columns
4. **Soft Deletes**: Use `deleted_at` timestamp for soft deletes

### Performance Optimizations

1. **Batch Size**: Process 10-20 users per database batch
2. **Connection Pooling**: Use connection pooling for database operations
3. **Async Processing**: Consider async processing for very large bulk operations
4. **Caching**: Cache role lookups during bulk role changes

### Example Service Implementation Pattern

```typescript
class BulkUserService {
  async bulkActivateUsers(userIds: string[]): Promise<BulkOperationResult[]> {
    const results: BulkOperationResult[] = [];

    // Process in batches of 20
    const batches = this.createBatches(userIds, 20);

    for (const batch of batches) {
      await this.db.transaction(async (trx) => {
        for (const userId of batch) {
          try {
            await this.activateUser(userId, trx);
            results.push({ userId, success: true });
          } catch (error) {
            results.push({
              userId,
              success: false,
              error: this.mapError(error),
            });
          }
        }
      });
    }

    return results;
  }
}
```

## Testing Strategy

### Unit Tests

1. **Schema Validation**: Test TypeBox schemas with valid/invalid data
2. **Business Logic**: Test each bulk operation with various scenarios
3. **Error Handling**: Test partial failure scenarios
4. **Security**: Test authorization and rate limiting

### Integration Tests

1. **Database Operations**: Test actual database transactions
2. **API Endpoints**: Test complete request/response cycles
3. **Authentication**: Test with different user roles
4. **Rate Limiting**: Test rate limit enforcement

### Test Data Scenarios

```typescript
// Test scenarios to cover
const testScenarios = ['all_users_exist_and_active', 'mix_of_active_and_inactive_users', 'some_users_not_found', 'admin_trying_to_deactivate_self', 'invalid_role_id_in_bulk_change', 'exceeding_max_users_limit', 'duplicate_user_ids_in_request', 'empty_user_ids_array'];
```

## Monitoring & Observability

### Metrics to Track

1. **Operation Counts**: Track successful vs failed operations
2. **Response Times**: Monitor bulk operation performance
3. **Error Rates**: Track different types of errors
4. **User Impact**: Monitor how many users are affected

### Logging Requirements

```typescript
// Required log fields for bulk operations
interface BulkOperationLog {
  operation: 'bulk_activate' | 'bulk_deactivate' | 'bulk_delete' | 'bulk_role_change';
  requestId: string;
  adminUserId: string;
  totalRequested: number;
  successCount: number;
  failureCount: number;
  duration: number;
  errors?: Array<{
    userId: string;
    errorCode: string;
    errorMessage: string;
  }>;
}
```

## OpenAPI Specification

The complete OpenAPI 3.0 specification is automatically generated from the TypeBox schemas and includes:

- Complete endpoint documentation
- Request/response schemas
- Error response formats
- Security requirements
- Rate limiting information
- Example requests and responses

Access the generated OpenAPI docs at: `/api/docs` (Swagger UI)

## Migration Strategy

If implementing in an existing system:

1. **Phase 1**: Add schemas and route definitions
2. **Phase 2**: Implement service layer with business logic
3. **Phase 3**: Add comprehensive tests
4. **Phase 4**: Deploy with feature flags
5. **Phase 5**: Monitor and optimize based on usage

This design ensures scalable, secure, and maintainable bulk operations for user management while providing excellent error handling and developer experience.
