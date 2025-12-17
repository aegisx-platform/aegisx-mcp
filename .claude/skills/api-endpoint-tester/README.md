# API Endpoint Tester Skill

Quickly test API endpoints using curl commands with proper authentication and validation.

## What This Skill Does

Claude will **automatically use this skill** when you:

- Ask to "test API" or "check endpoint"
- Say "try calling the [feature] API"
- Request "verify the API is working"
- Mention "test if the endpoint returns correct data"
- Want to debug API issues

## How It Works

1. **Identifies Endpoint** - Determines which endpoint to test
2. **Reads API Contract** - Gets expected request/response format
3. **Generates curl Commands** - Creates proper curl requests with:
   - Correct HTTP method (GET, POST, PUT, DELETE)
   - Authentication headers
   - Request body (for POST/PUT)
   - Query parameters (for GET)
4. **Executes Tests** - Runs curl commands and captures responses
5. **Verifies Results** - Checks status codes and response format
6. **Reports Findings** - Shows test results with recommendations

## Quick Start

### Example 1: Test All Endpoints

```
You: "Test the departments API"
```

Claude will:

- Read `docs/features/departments/API_CONTRACTS.md`
- Test all 5-6 endpoints (GET, POST, PUT, DELETE, etc.)
- Show results for each endpoint
- Report any issues found

**Sample Output:**

```
## API Test Results

✅ GET /api/v1/departments - 200 OK (45ms)
✅ GET /api/v1/departments/:id - 200 OK (12ms)
✅ POST /api/v1/departments - 201 Created
✅ PUT /api/v1/departments/:id - 200 OK
✅ DELETE /api/v1/departments/:id - 200 OK

Status: 5/5 passed
```

### Example 2: Test Specific Endpoint

```
You: "Test POST /api/v1/users endpoint"
```

Claude will:

- Generate valid test data
- Execute POST request
- Show request and response
- Verify response format

### Example 3: Debug Failing Endpoint

```
You: "The products API is giving 500 errors, can you test it?"
```

Claude will:

- Test the endpoint
- Capture error response
- Analyze the error
- Suggest fixes

## What Gets Tested

### ✅ HTTP Methods

- GET (list and detail)
- POST (create)
- PUT (update)
- DELETE (delete)
- Custom endpoints (dropdown, bulk, etc.)

### ✅ Authentication

- Requests without token (should return 401)
- Requests with invalid token (should return 401)
- Requests with valid token (should succeed)

### ✅ Validation Rules

- Missing required fields (should return 400)
- Invalid data types (should return 400)
- Constraint violations (maxLength, pattern)
- Unique constraints (should return 409)

### ✅ Response Format

- Status codes (200, 201, 400, 401, 404, 409, 500)
- Response structure matches contract
- Field types correct
- Pagination structure (for lists)

### ✅ Edge Cases

- Empty strings
- Maximum lengths
- Boundary values
- Invalid IDs (should return 404)

## Example Test Commands

### GET Request (List with Filters)

```bash
curl -X GET "http://localhost:3000/api/v1/departments?page=1&limit=10&search=IT&is_active=true" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### POST Request (Create)

```bash
curl -X POST "http://localhost:3000/api/v1/departments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dept_code": "IT",
    "dept_name": "Information Technology",
    "is_active": true
  }' | jq '.'
```

### PUT Request (Update)

```bash
curl -X PUT "http://localhost:3000/api/v1/departments/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dept_name": "IT Department Updated"
  }' | jq '.'
```

### DELETE Request

```bash
curl -X DELETE "http://localhost:3000/api/v1/departments/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

## Test Patterns

### Complete CRUD Flow Test

Claude will test the entire CRUD lifecycle:

1. **Create** - POST new record, get ID
2. **Read** - GET by ID, verify data
3. **List** - GET list, verify new record appears
4. **Update** - PUT to modify, verify changes
5. **Delete** - DELETE record, verify removal

### Validation Testing

Claude tests that your API properly validates:

```
❌ Missing required field → 400 Bad Request
❌ Invalid email format → 400 Bad Request
❌ String too long → 400 Bad Request
❌ Duplicate unique field → 409 Conflict
❌ Non-existent ID → 404 Not Found
```

### Authentication Testing

```
❌ No token → 401 Unauthorized
❌ Invalid token → 401 Unauthorized
✅ Valid token → 200 OK / 201 Created
```

## Benefits

### 🚀 Speed

- Test all endpoints in seconds
- No need to write curl commands manually
- Automated test data generation

### ✅ Accuracy

- Uses actual API contracts
- Verifies response formats
- Tests all status codes

### 🔍 Comprehensive

- Tests happy path and errors
- Validates authentication
- Checks edge cases

### 📊 Clear Results

- Easy-to-read test reports
- Shows request and response
- Identifies issues quickly

## Real-World Scenarios

### Scenario 1: After Implementation

**You:** "I just implemented the employees API, test it"

**Claude:**

- Tests all CRUD endpoints
- Validates request/response formats
- Tests authentication
- Reports: "✅ All 6 endpoints working correctly"

### Scenario 2: Debugging

**You:** "POST /api/v1/products is failing"

**Claude:**

- Tests POST endpoint with valid data
- Captures error response
- Analyzes: "Error 500 - Missing foreign key for category_id"
- Suggests: "Check that category_id exists in categories table"

### Scenario 3: Before Deployment

**You:** "Test all APIs before we deploy"

**Claude:**

- Tests departments ✅
- Tests users ✅
- Tests products ✅
- Tests orders ⚠️ (found issue in PUT endpoint)
- Reports findings with details

### Scenario 4: Integration Testing

**You:** "Test if the products API works with the categories API"

**Claude:**

- Creates test category first
- Creates product with category_id
- Verifies relationship
- Tests cascade delete behavior

## Error Analysis

When tests fail, Claude provides detailed analysis:

### 400 Bad Request

```
❌ POST /api/v1/users failed with 400

Error: "dept_code" is required

Analysis:
- Request body missing required field "dept_code"
- Schema requires: dept_code (string, max 10 chars)

Fix:
Add dept_code to request:
{
  "dept_code": "IT",
  "dept_name": "Information Technology"
}
```

### 500 Internal Server Error

```
❌ POST /api/v1/employees failed with 500

Server Error: Foreign key constraint failed

Analysis:
- Trying to insert department_id = 999
- Department with ID 999 doesn't exist

Fix:
1. Check that department_id exists in database
2. Or create department first, then employee
```

## Helper Script

Quick testing from command line:

```bash
# Test specific endpoint
./.claude/skills/api-endpoint-tester/scripts/test.sh GET /api/v1/departments

# Test with authentication
./.claude/skills/api-endpoint-tester/scripts/test.sh POST /api/v1/departments \
  --data '{"dept_code":"IT","dept_name":"IT Dept"}' \
  --auth

# Test all endpoints for a feature
./.claude/skills/api-endpoint-tester/scripts/test.sh --feature departments

# Dry run (show commands without executing)
./.claude/skills/api-endpoint-tester/scripts/test.sh GET /api/v1/departments --dry-run
```

**Note:** For comprehensive testing, ask Claude directly.

## Integration with Workflow

### Perfect Workflow

```
1. Design API
   ↓
2. Generate schemas
   "Claude, generate schemas for products"
   ↓
3. Implement routes
   ↓
4. Generate contract
   "Claude, generate API contract for products"
   ↓
5. Test endpoints ← YOU ARE HERE
   "Claude, test the products API"
   ↓
6. Validate contract match
   "Claude, validate products API"
   ↓
7. Deploy
```

### When to Test

- ✅ After implementing new endpoints
- ✅ After modifying existing endpoints
- ✅ Before committing code
- ✅ Before creating pull request
- ✅ After merging to develop
- ✅ Before deploying to production

## Best Practices

### 1. Test Early, Test Often

Test immediately after implementing:

```
You: "Just finished the users API"
You: "Claude, test it"
```

### 2. Use Real Data Patterns

Claude generates realistic test data:

```json
{
  "employee_code": "EMP001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  "department_id": 1
}
```

### 3. Clean Up Test Data

Claude automatically cleans up:

```
✅ Created test record (ID: 123)
✅ Tested update
✅ Tested delete
✅ Cleaned up test data
```

### 4. Test Both Success and Failure

Claude tests both:

- ✅ Valid requests (should succeed)
- ❌ Invalid requests (should fail with correct error)

### 5. Verify Complete Response

Not just status codes:

```
✅ Status: 200 OK
✅ Response structure correct
✅ Field types match schema
✅ Pagination included
✅ Timestamps in ISO format
```

## Troubleshooting

### Server Not Running?

```
Error: Connection refused

Claude: Let me check if the server is running...
> lsof -i :3000

No server found. Starting server...
> pnpm run dev:api
```

### Wrong Port?

```
Error: Connection refused at port 3000

Claude: Checking your configuration...
> cat .env.local | grep API_PORT

Found: API_PORT=3001
Using correct port: http://localhost:3001
```

### Authentication Token Expired?

```
Error: 401 Unauthorized

Claude: Token expired. Getting new token...
> curl -X POST http://localhost:3000/api/v1/auth/login ...

New token obtained. Retrying test...
```

## Related Skills

Use these skills together:

1. **typebox-schema-generator** - Generate schemas
2. **api-contract-generator** - Document APIs
3. **api-endpoint-tester** ← Test implementation
4. **api-contract-validator** - Verify contract match

Complete quality assurance:

```
Generate → Document → Test → Validate
```

## Questions?

Ask Claude:

- "How do I test an API endpoint?"
- "Test the departments API"
- "Why is this endpoint failing?"
- "Test with authentication"
- "Test all APIs before deployment"

---

**Ready to use!** Just ask Claude to test your endpoints.
