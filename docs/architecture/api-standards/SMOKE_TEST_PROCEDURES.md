# Smoke Testing Procedures for API Architecture Standardization

> Comprehensive testing procedures to validate deployment quality in staging and production environments

## Overview

Smoke testing is a quick, high-level verification process to ensure the API is functioning correctly after deployment. These procedures are designed to catch critical issues before they impact users.

**Execution Time:** ~5-10 minutes
**Frequency:** Before each environment deployment and after configuration changes

## Pre-Testing Checklist

- [ ] Environment is fully deployed and stable
- [ ] All services are running
- [ ] Database is accessible and seeded
- [ ] Required API tokens are available
- [ ] Monitoring is configured and running
- [ ] Test user accounts exist with appropriate permissions

## Test Setup

### Environment Variables

```bash
# Feature flags for different testing scenarios
export ENABLE_NEW_ROUTES=false      # For Phase 2 testing (old routes only)
export ENABLE_OLD_ROUTES=true       # Old routes must remain active

# API Configuration
export API_URL="http://localhost:3333"
export API_VERSION="v1"

# Test Credentials (use staging test account)
export TEST_ADMIN_EMAIL="test-admin@example.com"
export TEST_ADMIN_PASSWORD="secure-password"
export TEST_USER_EMAIL="test-user@example.com"
export TEST_USER_PASSWORD="secure-password"
```

### Authentication Helper Function

```bash
# Get JWT token for testing
get_auth_token() {
  local email=$1
  local password=$2

  local response=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")

  echo "$response" | jq -r '.data.accessToken'
}

# Usage:
# ADMIN_TOKEN=$(get_auth_token "$TEST_ADMIN_EMAIL" "$TEST_ADMIN_PASSWORD")
# USER_TOKEN=$(get_auth_token "$TEST_USER_EMAIL" "$TEST_USER_PASSWORD")
```

## Smoke Tests

### Test 1: System Availability

**Objective:** Verify the API server is running and responsive

**Test Steps:**

```bash
# 1. Health Check Endpoint
curl -v "$API_URL/api/health" 2>&1 | grep -E "HTTP|healthy"

# Expected: HTTP/1.1 200 OK
# Response body contains: "healthy": true
```

**Pass Criteria:**

- HTTP status: 200
- Response time: < 500ms
- Body contains health status

**Failure Actions:**

- Check if API server is running
- Check logs for startup errors
- Verify network connectivity

---

### Test 2: Authentication

**Objective:** Verify authentication system is working

**Test Steps:**

```bash
# 1. Successful Login
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"correct-password"
  }' | jq '.'

# Expected: 200 OK with accessToken

# 2. Failed Login (wrong password)
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"wrong-password"
  }' | jq '.'

# Expected: 401 Unauthorized

# 3. Invalid Email
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"nonexistent@example.com",
    "password":"password"
  }' | jq '.'

# Expected: 401 Unauthorized
```

**Pass Criteria:**

- Successful login returns valid JWT token
- Failed login returns 401
- Token is usable for subsequent requests

**Failure Actions:**

- Check authentication service logs
- Verify database connectivity
- Check JWT configuration

---

### Test 3: Authorization

**Objective:** Verify permission system is working

**Test Steps:**

```bash
# Get tokens for different users
ADMIN_TOKEN=$(get_auth_token "admin@example.com" "password")
USER_TOKEN=$(get_auth_token "user@example.com" "password")

# 1. Admin can access admin endpoints
curl -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data | length'

# Expected: 200 OK with user list

# 2. Regular user cannot access admin endpoints
curl -X POST "$API_URL/api/users" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password"}' 2>&1

# Expected: 403 Forbidden

# 3. Unauthenticated request
curl -X GET "$API_URL/api/users" 2>&1

# Expected: 401 Unauthorized
```

**Pass Criteria:**

- Authorized requests succeed (200/201)
- Unauthorized requests return 403
- Unauthenticated requests return 401

**Failure Actions:**

- Check RBAC service logs
- Verify permission configuration
- Check token validation

---

### Test 4: Core Layer - Authentication Service

**Objective:** Verify authentication endpoints are functional

**Test Steps:**

```bash
API_URL="http://localhost:3333"

# 1. Login endpoint
echo "Testing: POST /api/auth/login"
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' | jq '.data.accessToken' > /tmp/token.txt

TOKEN=$(cat /tmp/token.txt | tr -d '"')
echo "Got token: $TOKEN"

# 2. Get current user
echo "Testing: GET /api/auth/me"
curl -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.email'

# 3. Logout
echo "Testing: POST /api/auth/logout"
curl -X POST "$API_URL/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN"
```

**Pass Criteria:**

- All endpoints return 200 or 201
- Token is valid JWT format
- User info returned correctly
- Logout completes without error

---

### Test 5: Platform Layer - User Management

**Objective:** Verify user management endpoints are functional

**Test Steps:**

```bash
ADMIN_TOKEN="<from_test_4>"

# 1. List users
echo "Testing: GET /api/users"
curl -X GET "$API_URL/api/users?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.meta.total'

# Expected: number of total users

# 2. Get specific user
USER_ID="<valid-user-id>"
echo "Testing: GET /api/users/:id"
curl -X GET "$API_URL/api/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.id'

# Expected: $USER_ID

# 3. Create user
echo "Testing: POST /api/users"
curl -X POST "$API_URL/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"Password123!",
    "firstName":"Test",
    "lastName":"User"
  }' | jq '.data.id'

# Expected: new user ID

# 4. Update user
echo "Testing: PUT /api/users/:id"
curl -X PUT "$API_URL/api/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Updated"}' | jq '.data.firstName'

# Expected: "Updated"
```

**Pass Criteria:**

- List returns paginated user data
- Get returns specific user
- Create returns new user ID
- Update returns updated data

---

### Test 6: Platform Layer - Departments

**Objective:** Verify department management endpoints

**Test Steps:**

```bash
ADMIN_TOKEN="<from_test_4>"

# 1. List departments
echo "Testing: GET /api/departments"
curl -X GET "$API_URL/api/departments?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.meta | keys'

# Expected: ["page", "limit", "total", "hasMore"]

# 2. Create department
echo "Testing: POST /api/departments"
DEPT_ID=$(curl -s -X POST "$API_URL/api/departments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Department",
    "code":"TEST-'$(date +%s)'",
    "description":"Smoke test department",
    "isActive":true
  }' | jq -r '.data.id')

echo "Created department: $DEPT_ID"

# 3. Get specific department
echo "Testing: GET /api/departments/:id"
curl -X GET "$API_URL/api/departments/$DEPT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.name'

# Expected: "Test Department"

# 4. Update department
echo "Testing: PUT /api/departments/:id"
curl -X PUT "$API_URL/api/departments/$DEPT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Department"}' | jq '.data.name'

# Expected: "Updated Department"

# 5. Delete department
echo "Testing: DELETE /api/departments/:id"
curl -X DELETE "$API_URL/api/departments/$DEPT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.success'

# Expected: true
```

**Pass Criteria:**

- List returns paginated data with metadata
- Create returns new department ID
- Get returns department details
- Update returns updated data
- Delete succeeds without error

---

### Test 7: Platform Layer - Settings

**Objective:** Verify system settings endpoints

**Test Steps:**

```bash
ADMIN_TOKEN="<from_test_4>"

# 1. List settings
echo "Testing: GET /api/settings"
curl -X GET "$API_URL/api/settings?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data | length'

# Expected: number of settings

# 2. Get specific setting
SETTING_ID="<valid-setting-id>"
echo "Testing: GET /api/settings/:id"
curl -X GET "$API_URL/api/settings/$SETTING_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.key'

# Expected: setting key name

# 3. Update setting
echo "Testing: PUT /api/settings/:id"
curl -X PUT "$API_URL/api/settings/$SETTING_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"new-value"}' | jq '.data.value'

# Expected: "new-value"
```

**Pass Criteria:**

- List returns settings
- Get returns specific setting
- Update returns updated setting value

---

### Test 8: Platform Layer - Navigation

**Objective:** Verify navigation menu endpoints

**Test Steps:**

```bash
USER_TOKEN="<valid-user-token>"

# 1. Get navigation
echo "Testing: GET /api/navigation"
curl -X GET "$API_URL/api/navigation" \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.data | keys'

# Expected: array of menu items

# 2. Verify menu structure
echo "Testing: Menu structure"
curl -X GET "$API_URL/api/navigation" \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.data[0] | keys'

# Expected: ["id", "label", "path", "icon", "children", ...]
```

**Pass Criteria:**

- Returns menu structure
- Menu items have required fields
- Menu accessible to authenticated users

---

### Test 9: Domains Layer - Inventory

**Objective:** Verify domain-level inventory endpoints

**Test Steps:**

```bash
ADMIN_TOKEN="<from_test_4>"

# 1. List inventory items
echo "Testing: GET /api/inventory"
curl -X GET "$API_URL/api/inventory?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data | length'

# Expected: number of items or empty array

# 2. List master data (if available)
echo "Testing: GET /api/inventory/master-data/drugs"
curl -X GET "$API_URL/api/inventory/master-data/drugs?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.meta.total'

# Expected: total count or 0
```

**Pass Criteria:**

- Inventory endpoints are accessible
- Inventory data can be retrieved
- Pagination works correctly

---

### Test 10: Error Handling

**Objective:** Verify error responses are properly formatted

**Test Steps:**

```bash
# 1. Invalid request (missing required fields)
echo "Testing: Validation errors"
curl -X POST "$API_URL/api/departments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.error'

# Expected: error message about missing fields

# 2. Non-existent resource
echo "Testing: 404 Not Found"
curl -X GET "$API_URL/api/users/invalid-id" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.statusCode'

# Expected: 404

# 3. Invalid content type
echo "Testing: Invalid content type"
curl -X POST "$API_URL/api/departments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: text/plain" \
  -d 'invalid' | jq '.statusCode'

# Expected: 400 or 415

# 4. Database error (if applicable)
echo "Testing: Server errors"
# Try to trigger a database error if possible
# Expected: 500 with error details (in development)
```

**Pass Criteria:**

- Validation errors return 400 with details
- Not found returns 404
- Server errors return 500
- Error responses are properly formatted

---

### Test 11: No Redirects (Feature Disabled)

**Objective:** Verify NO HTTP 307 redirects occur when ENABLE_NEW_ROUTES=false

**Test Steps:**

```bash
# 1. Check for redirects on old route
echo "Testing: No redirects on old routes"
curl -i -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" 2>&1 | grep -E "HTTP|<"

# Expected: HTTP/1.1 200 (NOT 307)
# Should NOT see: HTTP/1.1 307 Temporary Redirect

# 2. Verify no Location header (redirect indicator)
echo "Testing: No Location header"
curl -i -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" 2>&1 | grep "Location"

# Expected: No Location header in response

# 3. Response should come directly from /api/...
echo "Testing: Direct response from old route"
curl -X GET "$API_URL/api/users?page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data | type'

# Expected: "array" (direct response, not redirect)
```

**Pass Criteria:**

- HTTP status is 200 (not 307)
- No Location headers in response
- Requests return data directly (not redirects)

---

### Test 12: Response Format Validation

**Objective:** Verify API response format is consistent

**Test Steps:**

```bash
ADMIN_TOKEN="<from_test_4>"

# 1. Success response format
echo "Testing: Success response format"
curl -s -X GET "$API_URL/api/users?page=1&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq 'keys'

# Expected: ["success", "data", "meta", "statusCode"]

# 2. Paginated response format
echo "Testing: Paginated response"
curl -s -X GET "$API_URL/api/users?page=1&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.meta | keys'

# Expected: ["page", "limit", "total", "hasMore"]

# 3. Single resource response
echo "Testing: Single resource response"
curl -s -X GET "$API_URL/api/departments/$DEPT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data | type'

# Expected: "object"

# 4. List response
echo "Testing: List response"
curl -s -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data | type'

# Expected: "array"
```

**Pass Criteria:**

- All success responses have consistent structure
- Paginated responses include metadata
- Single resources return objects
- Lists return arrays

---

## Automated Smoke Test Script

Create a shell script to automate the smoke tests:

```bash
#!/bin/bash

# File: scripts/smoke-test.sh
# Description: Automated smoke testing for API deployment

set -e

API_URL="${API_URL:-http://localhost:3333}"
TEST_EMAIL="${TEST_EMAIL:-admin@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-password}"
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function for tests
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local token=$4
  local body=${5:-""}
  local expected_status=${6:-200}

  echo -n "Testing $name... "

  if [ -z "$body" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
      -H "Authorization: Bearer $token" 2>/dev/null)
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$body" 2>/dev/null)
  fi

  http_code=$(echo "$response" | tail -n1)

  if [ "$http_code" = "$expected_status" ] || [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "${GREEN}PASS${NC} (HTTP $http_code)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}FAIL${NC} (Expected $expected_status, got $http_code)"
    ((FAILED++))
    return 1
  fi
}

echo "==================="
echo "SMOKE TEST SUITE"
echo "==================="
echo "API URL: $API_URL"
echo "Environment: ${NODE_ENV:-development}"
echo ""

# Test 1: Health check
echo "Test 1: System Availability"
echo -n "Testing health endpoint... "
http_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health")
if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}PASS${NC}"
  ((PASSED++))
else
  echo -e "${RED}FAIL${NC} (HTTP $http_code)"
  ((FAILED++))
  exit 1
fi

# Test 2: Authentication
echo ""
echo "Test 2: Authentication"
token_response=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo "$token_response" | jq -r '.data.accessToken' 2>/dev/null)
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}FAIL${NC} - Could not obtain auth token"
  echo "Response: $token_response"
  ((FAILED++))
  exit 1
else
  echo -e "${GREEN}PASS${NC} - Obtained auth token"
  ((PASSED++))
fi

# Test 3-12: Core endpoints
echo ""
echo "Test 3: Core Layer Endpoints"
test_endpoint "GET /api/auth/me" "GET" "/api/auth/me" "$TOKEN" "" "200"
test_endpoint "GET /api/health" "GET" "/api/health" "" "" "200"

echo ""
echo "Test 4: Platform Layer - Users"
test_endpoint "GET /api/users" "GET" "/api/users" "$TOKEN" "" "200"

echo ""
echo "Test 5: Platform Layer - Departments"
test_endpoint "GET /api/departments" "GET" "/api/departments" "$TOKEN" "" "200"

echo ""
echo "Test 6: Platform Layer - Settings"
test_endpoint "GET /api/settings" "GET" "/api/settings" "$TOKEN" "" "200"

echo ""
echo "Test 7: Platform Layer - Navigation"
test_endpoint "GET /api/navigation" "GET" "/api/navigation" "$TOKEN" "" "200"

echo ""
echo "Test 8: Domains Layer - Inventory"
test_endpoint "GET /api/inventory" "GET" "/api/inventory" "$TOKEN" "" "200"

echo ""
echo "Test 9: Error Handling"
test_endpoint "GET /api/nonexistent" "GET" "/api/nonexistent" "$TOKEN" "" "404"

echo ""
echo "Test 10: No Redirects"
http_code=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $TOKEN")
echo -n "Verifying no HTTP 307 redirects... "
if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}PASS${NC} (No redirect, HTTP $http_code)"
  ((PASSED++))
else
  echo -e "${YELLOW}WARNING${NC} (Got HTTP $http_code)"
fi

# Summary
echo ""
echo "==================="
echo "RESULTS"
echo "==================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All smoke tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
fi
```

**Usage:**

```bash
# Run smoke tests
bash scripts/smoke-test.sh

# With custom API URL
API_URL="http://staging-api.example.com" bash scripts/smoke-test.sh

# With custom credentials
TEST_EMAIL="admin@example.com" TEST_PASSWORD="password" bash scripts/smoke-test.sh
```

---

## Performance Benchmarks

**Expected Response Times (Local/Staging):**

| Endpoint           | Expected P95 | Method |
| ------------------ | ------------ | ------ |
| Health check       | < 100ms      | GET    |
| Authentication     | < 500ms      | POST   |
| List users         | < 500ms      | GET    |
| Get user           | < 200ms      | GET    |
| Create user        | < 500ms      | POST   |
| Update user        | < 300ms      | PUT    |
| List departments   | < 500ms      | GET    |
| Create department  | < 500ms      | POST   |
| Settings endpoints | < 300ms      | All    |
| Navigation         | < 200ms      | GET    |
| Inventory          | < 500ms      | GET    |

**If actual times exceed expected:**

1. Check database query performance
2. Check server resource usage
3. Check network latency
4. Profile slow endpoints

---

## Post-Test Actions

### If All Tests Pass

- [ ] Document test results
- [ ] Update status dashboard
- [ ] Notify stakeholders
- [ ] Proceed to next deployment phase

### If Some Tests Fail

- [ ] Document failures with specifics
- [ ] Collect relevant logs
- [ ] Identify root cause
- [ ] Fix and re-test
- [ ] Only proceed after all tests pass

### If Critical Tests Fail

- [ ] Immediately halt deployment
- [ ] Execute rollback procedures
- [ ] Investigate root cause
- [ ] Document post-mortem
- [ ] Update procedures to prevent recurrence

---

## Version History

| Date       | Version | Changes                                   |
| ---------- | ------- | ----------------------------------------- |
| 2025-12-14 | 1.0     | Initial smoke test procedures for Phase 2 |

## Related Documentation

- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Migration Guide](./06-migration-guide.md)
- [Architecture Specification](./02-architecture-specification.md)
