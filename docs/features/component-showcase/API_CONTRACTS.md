# component showcase - API Contracts

## 📋 API Overview

**Base URL**: `/api/[resource]`  
**Authentication**: JWT Bearer Token Required  
**Content Type**: `application/json`

## 🛠️ Endpoints

### 1. List [Resources]

```http
GET /api/[resource]
```

#### Query Parameters

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `sort` (string, optional): Sort field (default: 'created_at')
- `order` (string, optional): Sort order ('asc' or 'desc', default: 'desc')
- `search` (string, optional): Search query
- `filter` (object, optional): Filter criteria

#### Request Example

```bash
GET /api/[resource]?page=1&limit=20&sort=name&order=asc&search=query
```

#### Response Schema

```typescript
{
  data: [Resource][];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}
```

#### Response Example

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Example Resource",
      "created_at": "2025-09-12T10:30:00Z",
      "updated_at": "2025-09-12T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2025-09-12T10:30:00Z",
    "version": "1.0"
  }
}
```

### 2. Get Single [Resource]

```http
GET /api/[resource]/:id
```

#### Path Parameters

- `id` (string, required): Resource UUID

#### Response Schema

```typescript
{
  data: Resource;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

#### Response Example

```json
{
  "data": {
    "id": "uuid",
    "name": "Example Resource",
    "description": "Resource description",
    "created_at": "2025-09-12T10:30:00Z",
    "updated_at": "2025-09-12T10:30:00Z"
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2025-09-12T10:30:00Z",
    "version": "1.0"
  }
}
```

### 3. Create [Resource]

```http
POST /api/[resource]
```

#### Request Schema

```typescript
{
  name: string;
  description?: string;
  // Add other required fields
}
```

#### Request Example

```json
{
  "name": "New Resource",
  "description": "Resource description"
}
```

#### Response Schema

```typescript
{
  data: Resource;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

### 4. Update [Resource]

```http
PUT /api/[resource]/:id
```

#### Path Parameters

- `id` (string, required): Resource UUID

#### Request Schema

```typescript
{
  name?: string;
  description?: string;
  // Add other updatable fields
}
```

#### Request Example

```json
{
  "name": "Updated Resource Name",
  "description": "Updated description"
}
```

#### Response Schema

```typescript
{
  data: Resource;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

### 5. Delete [Resource]

```http
DELETE /api/[resource]/:id
```

#### Path Parameters

- `id` (string, required): Resource UUID

#### Response Schema

```typescript
{
  data: {
    id: string;
    deleted: boolean;
  }
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  }
}
```

## 📊 Data Models

### Resource Model

```typescript
interface Resource {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'deleted';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}
```

### Request Models

```typescript
interface CreateResourceRequest {
  name: string;
  description?: string;
}

interface UpdateResourceRequest {
  name?: string;
  description?: string;
}

interface ResourceFilters {
  status?: 'active' | 'inactive';
  created_after?: string;
  created_before?: string;
}
```

### Response Models

```typescript
interface ResourceListResponse {
  data: Resource[];
  pagination: PaginationMeta;
  meta: ResponseMeta;
}

interface ResourceResponse {
  data: Resource;
  meta: ResponseMeta;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ResponseMeta {
  requestId: string;
  timestamp: string;
  version: string;
}
```

## ❌ Error Responses

### Error Schema

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}
```

### Common Error Codes

- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict
- `422` Validation Error
- `500` Internal Server Error

### Error Examples

#### Validation Error (422)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": ["Name is required"],
      "description": ["Description must be at least 10 characters"]
    }
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2025-09-12T10:30:00Z",
    "version": "1.0"
  }
}
```

#### Not Found Error (404)

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  },
  "meta": {
    "requestId": "req_123456",
    "timestamp": "2025-09-12T10:30:00Z",
    "version": "1.0"
  }
}
```

## 🔐 Authentication & Authorization

### Authentication

All endpoints require JWT Bearer token in Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Authorization

Different endpoints may require different permissions:

- `[resource]:read` - View resources
- `[resource]:create` - Create resources
- `[resource]:update` - Update resources
- `[resource]:delete` - Delete resources

## 📝 TypeBox Schemas

### Request Schemas

```typescript
export const CreateResourceSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 1000 })),
});

export const UpdateResourceSchema = Type.Object({
  name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 1000 })),
});

export const ResourceFiltersSchema = Type.Object({
  status: Type.Optional(Type.Union([Type.Literal('active'), Type.Literal('inactive')])),
  created_after: Type.Optional(Type.String({ format: 'date-time' })),
  created_before: Type.Optional(Type.String({ format: 'date-time' })),
});
```

### Response Schemas

```typescript
export const ResourceSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal('active'), Type.Literal('inactive'), Type.Literal('deleted')]),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  created_by: Type.String({ format: 'uuid' }),
  updated_by: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
});

export const ResourceListResponseSchema = Type.Object({
  data: Type.Array(ResourceSchema),
  pagination: PaginationSchema,
  meta: ResponseMetaSchema,
});
```

## 🧪 Test Cases

### Unit Test Cases

1. **GET /api/[resource]**
   - Returns paginated list
   - Applies filters correctly
   - Handles empty results
   - Validates query parameters

2. **GET /api/[resource]/:id**
   - Returns single resource
   - Returns 404 for non-existent resource
   - Validates UUID format

3. **POST /api/[resource]**
   - Creates resource successfully
   - Validates required fields
   - Returns validation errors
   - Handles duplicate names

4. **PUT /api/[resource]/:id**
   - Updates resource successfully
   - Validates fields
   - Returns 404 for non-existent resource
   - Handles partial updates

5. **DELETE /api/[resource]/:id**
   - Deletes resource successfully
   - Returns 404 for non-existent resource
   - Handles cascade deletions

### Integration Test Cases

1. **Complete CRUD workflow**
2. **Authentication/Authorization**
3. **Error handling**
4. **Performance under load**
5. **Concurrent operations**

## 📋 Implementation Checklist

### Backend Implementation

- [ ] Database migrations
- [ ] TypeBox schemas defined
- [ ] Repository layer implemented
- [ ] Service layer implemented
- [ ] Controller layer implemented
- [ ] Route registration
- [ ] Validation middleware
- [ ] Error handling
- [ ] Unit tests written
- [ ] Integration tests written

### Frontend Implementation

- [ ] Service interfaces defined
- [ ] HTTP client implementation
- [ ] Type definitions created
- [ ] Error handling implemented
- [ ] Loading states managed
- [ ] Response transformation
- [ ] Unit tests written

### Documentation

- [ ] API documentation complete
- [ ] OpenAPI/Swagger specs
- [ ] Postman collection created
- [ ] Examples provided
- [ ] Error scenarios documented
