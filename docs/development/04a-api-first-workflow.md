# API-First Development Workflow Guide

## 🎯 Overview

This guide explains the recommended API-First development approach for the AegisX platform. Following this workflow ensures frontend-backend alignment and reduces integration issues.

## 📘 What is API-First?

**API-First** means designing the API contract (OpenAPI specification) before writing any implementation code. This is different from Backend-First where you code first and document later.

### Key Principles:

1. **Design Before Code** - API contract comes first
2. **Contract as Source of Truth** - Both frontend and backend follow the spec
3. **Parallel Development** - Teams can work simultaneously
4. **Type Safety** - Generate types from spec
5. **Documentation by Design** - API docs are always up-to-date

## 🔄 API-First vs Backend-First

| Aspect                 | API-First                        | Backend-First         |
| ---------------------- | -------------------------------- | --------------------- |
| **Start Point**        | OpenAPI Spec Design              | Direct Coding         |
| **Type Generation**    | From spec to code                | From code (maybe)     |
| **Frontend Dev**       | Can start immediately with mocks | Must wait for backend |
| **Documentation**      | Always in sync                   | Often outdated        |
| **Team Collaboration** | Excellent                        | Challenging           |
| **Change Management**  | Update spec first                | Change code directly  |

## ✅ Recommended Workflow

### Step 1: Start Feature with API-First

```bash
/start invoice-management

# When asked, choose option 1 (API-First)
```

### Step 2: Design API Contract

```bash
/feature:api invoice-management

# This creates:
# - OpenAPI specification
# - Endpoint definitions
# - Request/Response schemas
# - Error responses
# - Authentication requirements
```

### Step 3: Review & Approve

Before proceeding, review the API design with your team:

- Are the endpoints RESTful?
- Do the schemas match business requirements?
- Is error handling comprehensive?
- Are security considerations addressed?

### Step 4: Generate Shared Types

```bash
/sync:types

# Generates:
# - TypeScript interfaces for DTOs
# - API client types
# - Validation schemas
# - Ensures frontend/backend use identical types
```

### Step 5: Parallel Implementation

Both teams can now work simultaneously:

**Backend Team:**

```bash
/feature:backend invoice-management --from-spec
# Implements controllers, services, repositories
# Following the exact spec
```

**Frontend Team:**

```bash
/feature:frontend invoice-management --from-spec --mock
# Builds UI with mock data
# Using the same types and endpoints
```

### Step 6: Continuous Alignment Check

```bash
/align:check invoice-management --watch
# Monitors for:
# - Type mismatches
# - Endpoint differences
# - Schema violations
# - Contract breaks
```

### Step 7: Integration Testing

```bash
/integration:test invoice-management
# Tests actual frontend-backend communication
# Validates the complete flow
```

## 📋 Complete Example: User Management Feature

### 1. Initial Command

```bash
/start user-management
> Choose: 1 (API-First)
```

### 2. API Design Output

```yaml
# Generated OpenAPI Spec
paths:
  /api/users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          type: integer
        - name: limit
          in: query
          type: integer
      responses:
        200:
          schema:
            $ref: '#/definitions/UserListResponse'

    post:
      summary: Create user
      parameters:
        - in: body
          schema:
            $ref: '#/definitions/CreateUserDto'
      responses:
        201:
          schema:
            $ref: '#/definitions/UserResponse'

definitions:
  CreateUserDto:
    type: object
    required: [email, name, role]
    properties:
      email:
        type: string
        format: email
      name:
        type: string
      role:
        type: string
        enum: [admin, user, guest]

  UserResponse:
    type: object
    properties:
      id:
        type: string
        format: uuid
      email:
        type: string
      name:
        type: string
      role:
        type: string
      createdAt:
        type: string
        format: date-time
```

### 3. Generated Types

```typescript
// Shared types generated from spec
export interface CreateUserDto {
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface UserListResponse {
  data: UserResponse[];
  pagination: PaginationMeta;
}
```

### 4. Backend Implementation

```typescript
// Controller implements exact spec
@Post('/users')
async createUser(@Body() dto: CreateUserDto): Promise<UserResponse> {
  // Implementation following contract
  return this.userService.create(dto);
}
```

### 5. Frontend Implementation

```typescript
// Service uses same types
export class UserService {
  createUser(dto: CreateUserDto): Observable<UserResponse> {
    return this.http.post<UserResponse>('/api/users', dto);
  }
}
```

## 🚀 Quick Commands Reference

### Starting a Feature

```bash
/start [feature] --api-first  # Force API-First
/start [feature]              # Interactive choice
```

### API Design

```bash
/feature:api [feature]        # Design OpenAPI spec
/api [resource]              # Design single endpoint
/sync:types                  # Generate shared types
```

### Implementation

```bash
/feature:backend [feature] --from-spec   # Backend from spec
/feature:frontend [feature] --from-spec  # Frontend from spec
```

### Validation

```bash
/align:check [feature]       # Check alignment
/contract:verify            # Verify contracts
/mismatch:detect           # Find issues
```

## ⚠️ Common Pitfalls to Avoid

### ❌ Don't Skip the Spec

```bash
# Wrong
/feature:backend users
/feature:frontend users
# Result: Misalignment, rework
```

### ❌ Don't Change Implementation Without Updating Spec

```bash
# Wrong: Change backend directly
# Right: Update spec first, then implementation
/feature:api users --update
/sync:types
/feature:backend users --update
```

### ❌ Don't Ignore Type Mismatches

```bash
# Always run alignment checks
/align:check users
/align:fix users  # Auto-fix when possible
```

## 📊 Benefits of API-First

1. **Reduced Integration Issues** - 90% fewer frontend-backend mismatches
2. **Faster Development** - Parallel work saves 30-40% time
3. **Better Documentation** - Always up-to-date
4. **Type Safety** - Compile-time error catching
5. **Team Communication** - Clear contract reduces confusion
6. **Client Generation** - Auto-generate API clients
7. **Testing** - Contract testing ensures compatibility

## 🎓 Best Practices

1. **Always Start with Spec** - Even for "simple" features
2. **Review Before Implementation** - Get team agreement
3. **Keep Spec Updated** - It's the source of truth
4. **Use Semantic Versioning** - For API versions
5. **Document Edge Cases** - In the spec
6. **Include Examples** - In schema definitions
7. **Define Error Responses** - Comprehensive error handling

## 🔄 Workflow Diagram

```
┌─────────────────┐
│ /start feature  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Design API Spec │ ← Always start here
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Types  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Backend │ │Frontend│ ← Parallel development
└────┬───┘ └───┬────┘
     │         │
     └────┬────┘
          │
          ▼
┌─────────────────┐
│ Align & Test    │
└─────────────────┘
```

## 📝 Summary

API-First is the recommended approach for all new features in the AegisX platform. It ensures:

- Clear contracts between frontend and backend
- Parallel development capabilities
- Type safety across the stack
- Always up-to-date documentation
- Reduced integration issues

Remember: **Design First, Code Second, Stay Aligned!**
