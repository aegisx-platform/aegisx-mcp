---
name: api-endpoint-tester
description: Test API endpoints quickly using curl commands. Use when testing newly implemented APIs, debugging issues, or verifying request/response formats. Generates curl commands from API contracts and executes tests with proper authentication.
allowed-tools: Read, Grep, Glob, Bash
---

# API Endpoint Tester

Quick API endpoint testing using curl commands with proper authentication and formatting.

## When Claude Should Use This Skill

- User asks to "test API", "check endpoint", or "try calling the API"
- After implementing new API endpoints
- When debugging API issues or errors
- User wants to verify request/response formats
- Testing authentication or authorization
- Verifying API contract implementation

## Testing Process

### Step 1: Identify Endpoint to Test

From user request, extract:

- **HTTP Method** (GET, POST, PUT, DELETE)
- **Endpoint Path** (e.g., `/api/v1/departments`)
- **Feature Name** (to find contract/implementation)

If not specified, offer to test all endpoints for a feature.

### Step 2: Get API Contract Details

Read `docs/features/[feature]/API_CONTRACTS.md` to get:

- Full endpoint path
- Request body schema (for POST/PUT)
- Query parameters (for GET)
- Path parameters (for /:id routes)
- Authentication requirements
- Expected response format

### Step 3: Prepare Test Data

#### For GET Requests (List)

```bash
# Basic list
curl -X GET "http://localhost:3000/api/v1/departments"

# With pagination
curl -X GET "http://localhost:3000/api/v1/departments?page=1&limit=10"

# With search
curl -X GET "http://localhost:3000/api/v1/departments?search=IT"

# With filters
curl -X GET "http://localhost:3000/api/v1/departments?is_active=true&sort_by=dept_name"
```

#### For GET by ID

```bash
curl -X GET "http://localhost:3000/api/v1/departments/1"
```

#### For POST (Create)

Generate realistic test data based on schema:

```bash
curl -X POST "http://localhost:3000/api/v1/departments" \
  -H "Content-Type: application/json" \
  -d '{
    "dept_code": "IT",
    "dept_name": "Information Technology",
    "is_active": true
  }'
```

#### For PUT (Update)

```bash
curl -X PUT "http://localhost:3000/api/v1/departments/1" \
  -H "Content-Type: application/json" \
  -d '{
    "dept_name": "IT Department Updated"
  }'
```

#### For DELETE

```bash
curl -X DELETE "http://localhost:3000/api/v1/departments/1"
```

### Step 4: Add Authentication

Check if endpoint requires authentication:

#### JWT Token Authentication

```bash
# Get token first (if needed)
TOKEN=$(curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' | jq -r '.data.access_token')

# Use token in request
curl -X GET "http://localhost:3000/api/v1/departments" \
  -H "Authorization: Bearer $TOKEN"
```

#### Session Cookie Authentication

```bash
# Login and save cookies
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  -c cookies.txt

# Use cookies in subsequent requests
curl -X GET "http://localhost:3000/api/v1/departments" \
  -b cookies.txt
```

### Step 5: Execute Test

Run the curl command with additional options:

```bash
# Basic test with verbose output
curl -X GET "http://localhost:3000/api/v1/departments" -v

# With formatted JSON response
curl -X GET "http://localhost:3000/api/v1/departments" | jq '.'

# Save response to file
curl -X GET "http://localhost:3000/api/v1/departments" -o response.json

# Show HTTP status code
curl -X GET "http://localhost:3000/api/v1/departments" -w "\nHTTP Status: %{http_code}\n"

# Include response headers
curl -X GET "http://localhost:3000/api/v1/departments" -i
```

### Step 6: Verify Response

Check the response:

1. **Status Code** - Should match expected (200, 201, 400, 404, etc.)
2. **Response Structure** - Matches schema in contract
3. **Data Values** - Correct types and formats
4. **Error Handling** - Proper error messages for invalid requests

Compare with expected response from API contract.

## Testing Patterns

### Pattern 1: Complete CRUD Testing

Test all CRUD operations in sequence:

```bash
# 1. Create
RESPONSE=$(curl -X POST "http://localhost:3000/api/v1/departments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"dept_code":"TEST","dept_name":"Test Department"}')

# Extract created ID
DEPT_ID=$(echo $RESPONSE | jq -r '.data.id')

# 2. Read (single)
curl -X GET "http://localhost:3000/api/v1/departments/$DEPT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 3. Update
curl -X PUT "http://localhost:3000/api/v1/departments/$DEPT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"dept_name":"Test Department Updated"}' | jq '.'

# 4. Delete
curl -X DELETE "http://localhost:3000/api/v1/departments/$DEPT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### Pattern 2: Validation Testing

Test validation rules:

```bash
# Test missing required field
curl -X POST "http://localhost:3000/api/v1/departments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"dept_name":"IT"}' \
  | jq '.'
# Expected: 400 Bad Request with validation error

# Test maxLength constraint
curl -X POST "http://localhost:3000/api/v1/departments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"dept_code":"VERYLONGCODE123","dept_name":"IT"}' \
  | jq '.'
# Expected: 400 Bad Request

# Test unique constraint
curl -X POST "http://localhost:3000/api/v1/departments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"dept_code":"IT","dept_name":"IT Department"}' \
  | jq '.'
# Expected: 409 Conflict if IT already exists
```

### Pattern 3: Authentication Testing

```bash
# Test without authentication
curl -X GET "http://localhost:3000/api/v1/departments"
# Expected: 401 Unauthorized

# Test with invalid token
curl -X GET "http://localhost:3000/api/v1/departments" \
  -H "Authorization: Bearer invalid_token_here"
# Expected: 401 Unauthorized

# Test with valid token
curl -X GET "http://localhost:3000/api/v1/departments" \
  -H "Authorization: Bearer $VALID_TOKEN"
# Expected: 200 OK
```

### Pattern 4: Pagination Testing

```bash
# Test first page
curl -X GET "http://localhost:3000/api/v1/departments?page=1&limit=5" | jq '.data.pagination'

# Test page navigation
curl -X GET "http://localhost:3000/api/v1/departments?page=2&limit=5" | jq '.data.pagination'

# Test invalid pagination
curl -X GET "http://localhost:3000/api/v1/departments?page=0&limit=1000" | jq '.'
# Expected: Validation error or capped at max limit
```

### Pattern 5: Search and Filter Testing

```bash
# Test search
curl -X GET "http://localhost:3000/api/v1/departments?search=IT" | jq '.data.items[].dept_name'

# Test filter by status
curl -X GET "http://localhost:3000/api/v1/departments?is_active=true" | jq '.data.items[].is_active'

# Test sorting
curl -X GET "http://localhost:3000/api/v1/departments?sort_by=dept_name&sort_order=desc" | jq '.data.items[].dept_name'

# Test combined filters
curl -X GET "http://localhost:3000/api/v1/departments?search=IT&is_active=true&sort_by=created_at" | jq '.'
```

## Examples

### Example 1: Test New Feature

```
User: "Test the departments API"

Claude:
1. Read: docs/features/departments/API_CONTRACTS.md
2. Generate test commands for all endpoints:
   - GET /api/v1/departments (list)
   - GET /api/v1/departments/:id (detail)
   - POST /api/v1/departments (create)
   - PUT /api/v1/departments/:id (update)
   - DELETE /api/v1/departments/:id (delete)
3. Execute each test
4. Report results with status codes and responses
```

### Example 2: Debug Specific Endpoint

```
User: "The POST /api/v1/users endpoint is giving an error"

Claude:
1. Read contract for POST /users
2. Generate valid test data
3. Test with curl:
   curl -X POST "http://localhost:3000/api/v1/users" \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com"}'
4. Analyze error response
5. Suggest fixes based on error
```

### Example 3: Verify After Implementation

```
User: "I just implemented the products API, can you test it?"

Claude:
1. Read: docs/features/products/API_CONTRACTS.md
2. Test each endpoint:
   ✅ GET /products - 200 OK, returned 10 items
   ✅ GET /products/1 - 200 OK, correct format
   ✅ POST /products - 201 Created, returns new product
   ⚠️  PUT /products/1 - 500 Error (found issue)
   ✅ DELETE /products/1 - 200 OK
3. Report: 4/5 endpoints working, found error in PUT
4. Show error details and suggest fix
```

## Helper Functions

### Get Authentication Token

```bash
# Function to get token
get_token() {
  curl -s -X POST "http://localhost:3000/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin"}' \
    | jq -r '.data.access_token'
}

# Usage
TOKEN=$(get_token)
```

### Test Endpoint Function

```bash
# Function to test endpoint with authentication
test_endpoint() {
  local METHOD=$1
  local URL=$2
  local DATA=$3
  local TOKEN=$4

  if [ -n "$DATA" ]; then
    curl -X $METHOD "$URL" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$DATA" \
      -w "\nHTTP Status: %{http_code}\n" | jq '.'
  else
    curl -X $METHOD "$URL" \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nHTTP Status: %{http_code}\n" | jq '.'
  fi
}

# Usage
test_endpoint GET "http://localhost:3000/api/v1/departments" "" "$TOKEN"
```

## Configuration

### Check Server Port

```bash
# Read from .env.local
grep "API_PORT" .env.local

# Or check if server is running
lsof -i :3000
```

### Set Base URL

```bash
# Development
BASE_URL="http://localhost:3000"

# Staging
BASE_URL="https://staging.example.com"

# Production (be careful!)
BASE_URL="https://api.example.com"
```

## Output Format

Always provide clear test results:

```markdown
## API Endpoint Test Results

**Feature:** departments
**Tested:** 5 endpoints
**Status:** ✅ 5/5 passed

### Test Details

#### 1. GET /api/v1/departments

**Status:** ✅ 200 OK
**Response Time:** 45ms
**Sample Response:**
{
"success": true,
"data": {
"items": [...],
"pagination": {...}
}
}

#### 2. GET /api/v1/departments/:id

**Status:** ✅ 200 OK
**Response Time:** 12ms

#### 3. POST /api/v1/departments

**Status:** ✅ 201 Created
**Test Data:** {"dept_code":"IT","dept_name":"IT Department"}
**Created ID:** 5

#### 4. PUT /api/v1/departments/:id

**Status:** ✅ 200 OK
**Updated Fields:** dept_name

#### 5. DELETE /api/v1/departments/:id

**Status:** ✅ 200 OK
**Deleted ID:** 5

### Validation Tests

✅ Missing required field returns 400
✅ Invalid data type returns 400
✅ Duplicate unique field returns 409
✅ Non-existent ID returns 404

### Authentication Tests

✅ Request without token returns 401
✅ Request with invalid token returns 401
✅ Request with valid token returns 200

### Summary

- All endpoints working correctly
- Validation rules enforced
- Authentication properly configured
- Response formats match contract

**Next Steps:**

- Run integration tests
- Test with frontend
- Deploy to staging
```

## Error Analysis

When tests fail, analyze and suggest fixes:

### 400 Bad Request

```
Error: Validation failed

Likely causes:
1. Missing required field
2. Invalid data type
3. Constraint violation (maxLength, pattern)

Check:
- Request body matches CreateSchema
- All required fields included
- Field types correct
```

### 401 Unauthorized

```
Error: Unauthorized

Likely causes:
1. Missing Authorization header
2. Invalid token
3. Token expired

Check:
- Token included in request
- Token format: "Bearer {token}"
- Token not expired
```

### 404 Not Found

```
Error: Resource not found

Likely causes:
1. Invalid ID
2. Resource deleted
3. Wrong endpoint path

Check:
- ID exists in database
- Endpoint path correct
- Server running
```

### 500 Internal Server Error

```
Error: Internal server error

Likely causes:
1. Database connection error
2. Unhandled exception in code
3. Missing foreign key reference

Check:
- Server logs for details
- Database connection
- Foreign key constraints
```

## Best Practices

### 1. Test in Order

Test CRUD operations in logical order:

1. POST (create test data)
2. GET list (verify in list)
3. GET by ID (verify details)
4. PUT (update)
5. DELETE (cleanup)

### 2. Use Test Data

Create test data that's easy to identify:

```json
{
  "dept_code": "TEST001",
  "dept_name": "[TEST] Test Department"
}
```

### 3. Clean Up After Tests

Always delete test data after testing:

```bash
# Delete test records
curl -X DELETE "http://localhost:3000/api/v1/departments/$TEST_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test Edge Cases

- Empty strings
- Maximum lengths
- Boundary values
- Invalid formats
- Missing optional fields

### 5. Verify Response Structure

Don't just check status codes, verify:

- Response has correct structure
- Field types match schema
- Required fields present
- Optional fields handled correctly

## Troubleshooting

### Server Not Running

```bash
# Check if server is running
lsof -i :3000

# Start server if needed
pnpm run dev:api
```

### Connection Refused

```bash
# Check port in .env.local
cat .env.local | grep API_PORT

# Use correct port in curl
curl -X GET "http://localhost:PORT/api/v1/..."
```

### CORS Errors

If testing from browser, use curl instead or configure CORS in server.

### SSL Certificate Errors

```bash
# Skip SSL verification for local testing (development only!)
curl -k -X GET "https://localhost:3000/api/v1/..."
```

## Related Skills

- Use `api-contract-generator` to create endpoint documentation
- Use `api-contract-validator` to verify implementation matches contract
- Use `typebox-schema-generator` to create request/response schemas

## Related Documentation

- [API Calling Standard](../../../docs/guides/development/api-calling-standard.md)
- [API Response Standard](../../../docs/reference/api/api-response-standard.md)
- [QA Checklist](../../../docs/guides/development/qa-checklist.md)
