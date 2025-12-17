---
name: api-contract-generator
description: Generate API_CONTRACTS.md documentation from existing Fastify route implementations. Use when routes exist but documentation is missing, or when updating documentation after route changes. Creates standardized API contract documents following project conventions.
allowed-tools: Read, Grep, Glob, Write
---

# API Contract Generator

Generates `API_CONTRACTS.md` documentation from existing Fastify backend routes.

## When Claude Should Use This Skill

- User asks to "generate API contract", "create API docs", or "document API"
- After implementing routes but before creating contract documentation
- When updating existing contract docs after route changes
- When creating documentation for legacy routes
- User mentions "I have routes but no documentation"

## Generation Process

### Step 1: Locate Route Files

Find all route files for the feature:

```bash
# Search for route files
find apps/api/src -name "*routes.ts" | grep [feature-name]

# Or search by feature name in code
grep -r "fastify.register" apps/api/src | grep [feature-name]
```

Common locations:

```
apps/api/src/layers/platform/[feature]/[feature].routes.ts
apps/api/src/layers/domains/[domain]/[feature]/[feature].routes.ts
apps/api/src/modules/[feature]/[feature].routes.ts
apps/api/src/core/[feature]/[feature].routes.ts
```

### Step 2: Analyze Route Implementation

For each route file, extract:

#### Route Registration & Prefix

```typescript
// Look for: fastify.register(routes, { prefix: '/api/v1/departments' })
// Extract: Base URL prefix
```

#### Individual Routes

For each route (GET, POST, PUT, DELETE), extract:

```typescript
fastify.post(
  '/path',
  {
    preValidation: [authenticate], // → Authentication: Yes
    schema: {
      body: SchemaName, // → Request body schema
      params: ParamsSchema, // → Path parameters
      querystring: QuerySchema, // → Query parameters
      response: {
        200: SuccessSchema, // → Success response
        400: ErrorSchema, // → Error responses
        404: NotFoundSchema,
      },
    },
  },
  handler,
);
```

Extract:

- **HTTP Method** (GET, POST, PUT, DELETE)
- **Full Path** (prefix + route path)
- **Authentication** (check for preValidation/preHandler hooks)
- **Request Schema** (body, params, query)
- **Response Schema** (success and error codes)
- **Handler Summary** (what the endpoint does - infer from code)

#### Schema Definitions

Find schema definitions used in routes:

```bash
grep -r "const [SchemaName]" apps/api/src | grep Type.Object
```

Extract schema structure:

```typescript
const DepartmentCreateSchema = Type.Object({
  dept_code: Type.String({ maxLength: 10 }), // → Field: dept_code, Type: string, Max: 10
  dept_name: Type.String({ maxLength: 100 }), // → Field: dept_name, Type: string, Max: 100
  is_active: Type.Boolean({ default: true }), // → Field: is_active, Type: boolean, Default: true
});
```

### Step 3: Generate Contract Document

Create `docs/features/[feature]/API_CONTRACTS.md` using this template:

```markdown
# [Feature Name] API Contracts

> **Generated from:** `apps/api/src/.../[feature].routes.ts`
> **Last updated:** [YYYY-MM-DD]

## Base URL
```

/api/v1/[feature]

````

## Authentication

All endpoints require authentication unless otherwise noted.

## Endpoints

### 1. List [Resources]

**Endpoint:** `GET /api/v1/[feature]`

**Description:** Retrieve a paginated list of [resources] with optional filtering and sorting.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | integer | No | Page number (default: 1) | `1` |
| limit | integer | No | Items per page (default: 10) | `10` |
| search | string | No | Search term | `"keyword"` |
| sort_by | string | No | Field to sort by | `"created_at"` |
| sort_order | string | No | Sort direction (asc/desc) | `"desc"` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "field_name": "value",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "total_pages": 10
    }
  },
  "message": "Resources retrieved successfully"
}
````

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `500 Internal Server Error` - Server error

---

### 2. Get [Resource] by ID

**Endpoint:** `GET /api/v1/[feature]/:id`

**Description:** Retrieve a single [resource] by its ID.

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Resource ID |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "field_name": "value"
  },
  "message": "Resource retrieved successfully"
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

### 3. Create [Resource]

**Endpoint:** `POST /api/v1/[feature]`

**Description:** Create a new [resource].

**Authentication:** Required

**Request Body:**

```json
{
  "field_name": "value",
  "another_field": "value"
}
```

**Field Validations:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| field_name | string | Yes | Max 100 chars | Field description |
| another_field | string | No | Max 255 chars | Field description |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "field_name": "value"
  },
  "message": "Resource created successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid authentication
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

### 4. Update [Resource]

**Endpoint:** `PUT /api/v1/[feature]/:id`

**Description:** Update an existing [resource].

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Resource ID |

**Request Body:**

```json
{
  "field_name": "new value"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "field_name": "new value"
  },
  "message": "Resource updated successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

### 5. Delete [Resource]

**Endpoint:** `DELETE /api/v1/[feature]/:id`

**Description:** Delete a [resource] by its ID.

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Resource ID |

**Response (200 OK):**

```json
{
  "success": true,
  "data": null,
  "message": "Resource deleted successfully"
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Common Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All IDs are integers
- Pagination defaults: page=1, limit=10
- Maximum limit per page: 100

## Related Documentation

- [API Response Standard](../../../docs/reference/api/api-response-standard.md)
- [TypeBox Schema Standard](../../../docs/reference/api/typebox-schema-standard.md)

```

### Step 4: Customize Based on Route Analysis

Adjust the template based on actual routes found:
- Add/remove endpoints that exist
- Include actual field names from schemas
- Add custom endpoints (e.g., `/dropdown`, `/bulk`, `/import`)
- Include actual validation constraints
- Add domain-specific notes

### Step 5: Verify and Save

1. Double-check all endpoints are documented
2. Ensure schema fields match implementation
3. Verify authentication requirements are correct
4. Save to `docs/features/[feature]/API_CONTRACTS.md`
5. Create parent directories if needed

## Examples

### Example 1: Generate from Existing Routes

```

User: "Generate API contract for departments"

Claude:

1. Locate: apps/api/src/layers/platform/departments/departments.routes.ts
2. Analyze routes:
   - GET / (list with pagination)
   - GET /:id (detail)
   - POST / (create)
   - PUT /:id (update)
   - DELETE /:id (delete)
   - GET /dropdown (custom endpoint)
3. Extract schemas: DepartmentCreateSchema, DepartmentUpdateSchema
4. Generate: docs/features/departments/API_CONTRACTS.md
5. Report: "Created API contract with 6 endpoints"

```

### Example 2: Update Existing Contract

```

User: "Update the users API contract, I added a new endpoint"

Claude:

1. Read existing: docs/features/users/API_CONTRACTS.md
2. Read routes: apps/api/src/.../users.routes.ts
3. Compare: Find new POST /users/bulk-import endpoint
4. Update contract: Add bulk import section
5. Report: "Updated contract with new bulk-import endpoint"

```

### Example 3: Document Multiple Features

```

User: "Generate contracts for all inventory features"

Claude:

1. Find all route files in: apps/api/src/layers/domains/inventory/
2. For each feature (products, categories, suppliers):
   - Analyze routes
   - Generate contract
3. Report: "Generated 3 API contracts in docs/features/inventory/"

````

## TypeBox to Contract Field Mapping

### Common Types

```typescript
Type.String({ maxLength: 100 })
→ Type: string, Max: 100 chars

Type.Integer({ minimum: 1 })
→ Type: integer, Min: 1

Type.Boolean({ default: true })
→ Type: boolean, Default: true

Type.Optional(Type.String())
→ Required: No

Type.String({ format: 'email' })
→ Type: string (email format)

Type.String({ format: 'uuid' })
→ Type: string (UUID format)

Type.Enum(['active', 'inactive'])
→ Type: enum, Values: active, inactive

Type.Array(Type.Object({...}))
→ Type: array of objects
````

## Best Practices

### 1. Always Read Route Files First

Never generate contracts from assumptions - always analyze actual implementation.

### 2. Include All Custom Endpoints

Document non-CRUD endpoints like:

- `/dropdown` - For select dropdowns
- `/bulk` - For bulk operations
- `/import` - For CSV/Excel imports
- `/export` - For data exports
- `/stats` - For statistics

### 3. Document Actual Validations

Include real constraints from TypeBox schemas:

```typescript
Type.String({ maxLength: 50, pattern: '^[A-Z0-9]+$' })
→ Max 50 chars, uppercase alphanumeric only
```

### 4. Note Special Response Formats

If responses differ from standard format, document it:

```markdown
**Note:** This endpoint returns a simplified format without pagination.
```

### 5. Include Domain Context

Add feature-specific notes:

```markdown
## Notes

- Department codes must be unique
- Inactive departments cannot be deleted if they have employees
- Supports soft delete (is_active flag)
```

## Output Format

Always provide a summary after generation:

```markdown
## API Contract Generation Complete

**Feature:** [feature-name]
**Contract Location:** docs/features/[feature]/API_CONTRACTS.md
**Source:** apps/api/src/.../[feature].routes.ts

**Endpoints Documented:**

1. GET /api/v1/[feature] - List with pagination
2. GET /api/v1/[feature]/:id - Get by ID
3. POST /api/v1/[feature] - Create
4. PUT /api/v1/[feature]/:id - Update
5. DELETE /api/v1/[feature]/:id - Delete
6. GET /api/v1/[feature]/dropdown - Dropdown list

**Schemas Analyzed:**

- [Feature]CreateSchema (5 fields)
- [Feature]UpdateSchema (5 fields)
- [Feature]ResponseSchema

**Next Steps:**

1. Review generated contract for accuracy
2. Add any missing business logic notes
3. Use api-contract-validator skill to verify implementation matches
4. Commit documentation: `git add docs/features/[feature]/`
```

## Troubleshooting

### Issue: Route file not found

**Solution:**

```bash
# Search broader
find apps/api/src -name "*.routes.ts" | grep -i [keyword]
```

### Issue: Schema definitions in separate file

**Solution:**

```bash
# Search for schemas
grep -r "[FeatureName].*Schema" apps/api/src
```

### Issue: Complex nested routes

**Solution:** Document the full resolved path, including all prefixes from parent registrations.

## Related Skills

- Use `api-contract-validator` after generating to verify accuracy
- Use `typebox-schema-generator` if schemas need to be created
- Use `api-endpoint-tester` to test documented endpoints

## Related Documentation

- [API Calling Standard](../../../docs/guides/development/api-calling-standard.md)
- [API Response Standard](../../../docs/reference/api/api-response-standard.md)
- [Feature Development Standard](../../../docs/guides/development/feature-development-standard.md)
