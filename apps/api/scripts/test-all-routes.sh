#!/bin/bash

# API Testing Script - Tests all routes in the API
# Usage: ./test-all-routes.sh [base_url]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL (default to local)
BASE_URL=${1:-"http://127.0.0.1:3333"}
API_URL="${BASE_URL}/api"

# Test credentials
ADMIN_EMAIL="admin@aegisx.local"
ADMIN_PASSWORD="Admin123!"

# Token storage
ACCESS_TOKEN=""
REFRESH_TOKEN=""

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Function to print test results
print_result() {
    local test_name=$1
    local status=$2
    local details=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ $test_name${NC}"
        echo -e "  ${RED}Details: $details${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to make API request and check response
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local data=$4
    local description=$5
    local use_auth=${6:-true}
    
    local url="${API_URL}${endpoint}"
    local auth_header=""
    
    if [ "$use_auth" = "true" ] && [ -n "$ACCESS_TOKEN" ]; then
        auth_header="-H \"Authorization: Bearer $ACCESS_TOKEN\""
    fi
    
    local curl_cmd="curl -s -w '\n%{http_code}' -X $method \"$url\""
    
    if [ -n "$auth_header" ]; then
        curl_cmd="$curl_cmd $auth_header"
    fi
    
    if [ -n "$data" ] && [ "$method" != "GET" ] && [ "$method" != "DELETE" ]; then
        curl_cmd="$curl_cmd -H \"Content-Type: application/json\" -d '$data'"
    fi
    
    # Execute curl and capture response
    local response=$(eval $curl_cmd 2>/dev/null || echo "CURL_ERROR")
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$response" = "CURL_ERROR" ]; then
        print_result "$description" "FAIL" "Connection error"
        return 1
    fi
    
    if [ "$http_code" = "$expected_status" ]; then
        print_result "$description" "PASS"
        return 0
    else
        print_result "$description" "FAIL" "Expected $expected_status, got $http_code. Response: $body"
        return 1
    fi
}

# Function to login and get tokens
login() {
    local response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
    
    ACCESS_TOKEN=$(echo $response | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
    REFRESH_TOKEN=$(echo $response | grep -o '"refreshToken":"[^"]*' | sed 's/"refreshToken":"//')
    
    if [ -z "$ACCESS_TOKEN" ]; then
        echo -e "${RED}Failed to login! Cannot proceed with authenticated tests.${NC}"
        echo -e "${RED}Response: $response${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Login successful${NC}"
}

# Start testing
echo -e "${YELLOW}API Route Testing${NC}"
echo -e "${YELLOW}Testing API at: $API_URL${NC}"

# Test Default/System Endpoints
print_section "Testing Default/System Endpoints"
test_endpoint "GET" "/info" 200 "" "GET /api/info - API information" false
test_endpoint "GET" "/status" 200 "" "GET /api/status - System status" false
test_endpoint "GET" "/health" 200 "" "GET /api/health - Health check" false

# Test Auth Endpoints
print_section "Testing Auth Endpoints"
test_endpoint "POST" "/auth/register" 201 '{"email":"test@example.com","username":"testuser","password":"Test123!","firstName":"Test","lastName":"User"}' "POST /api/auth/register - Register new user" false
test_endpoint "POST" "/auth/login" 200 '{"email":"test@example.com","password":"Test123!"}' "POST /api/auth/login - Login user" false

# Login as admin for authenticated tests
print_section "Authenticating as Admin"
login

# Continue Auth tests with authentication
test_endpoint "GET" "/auth/profile" 200 "" "GET /api/auth/profile - Get current user profile"
test_endpoint "POST" "/auth/refresh" 200 "{\"refreshToken\":\"$REFRESH_TOKEN\"}" "POST /api/auth/refresh - Refresh access token" false
test_endpoint "POST" "/auth/logout" 200 "" "POST /api/auth/logout - Logout user"

# Re-login after logout
login

# Test Navigation Endpoints
print_section "Testing Navigation Endpoints"
test_endpoint "GET" "/navigation" 200 "" "GET /api/navigation - Get navigation items"
test_endpoint "GET" "/navigation?includeDisabled=true" 200 "" "GET /api/navigation?includeDisabled=true - Get all navigation items"

# Test User Management Endpoints
print_section "Testing User Management Endpoints"
test_endpoint "GET" "/users" 200 "" "GET /api/users - List all users"
test_endpoint "GET" "/users?page=1&limit=10" 200 "" "GET /api/users?page=1&limit=10 - List users with pagination"
test_endpoint "GET" "/users/1" 200 "" "GET /api/users/1 - Get user by ID"
test_endpoint "PUT" "/users/1" 200 '{"firstName":"Updated","lastName":"Name"}' "PUT /api/users/1 - Update user"

# Test User Profile Endpoints
print_section "Testing User Profile Endpoints"
test_endpoint "GET" "/profile" 200 "" "GET /api/profile - Get current user profile"
test_endpoint "PUT" "/profile" 200 '{"firstName":"Updated","lastName":"Admin"}' "PUT /api/profile - Update current user profile"

# Test Settings Endpoints
print_section "Testing Settings Endpoints"
test_endpoint "GET" "/settings" 200 "" "GET /api/settings - List all settings"
test_endpoint "GET" "/settings?namespace=app" 200 "" "GET /api/settings?namespace=app - Filter by namespace"
test_endpoint "GET" "/settings?category=general" 200 "" "GET /api/settings?category=general - Filter by category"
test_endpoint "GET" "/settings?page=1&limit=5" 200 "" "GET /api/settings?page=1&limit=5 - Paginated settings"

# Create a test setting
test_endpoint "POST" "/settings" 201 '{"key":"test.setting","namespace":"app","category":"test","value":"test_value","type":"string","description":"Test setting"}' "POST /api/settings - Create setting"

# Get the created setting
test_endpoint "GET" "/settings/test.setting" 200 "" "GET /api/settings/test.setting - Get setting by key"

# Update the setting
test_endpoint "PUT" "/settings/test.setting" 200 '{"value":"updated_value"}' "PUT /api/settings/test.setting - Update setting"

# Bulk operations
test_endpoint "POST" "/settings/bulk" 200 '{"settings":[{"key":"bulk.test1","namespace":"app","category":"test","value":"value1","type":"string"},{"key":"bulk.test2","namespace":"app","category":"test","value":"value2","type":"string"}]}' "POST /api/settings/bulk - Bulk create/update"
test_endpoint "GET" "/settings/bulk?keys=bulk.test1,bulk.test2" 200 "" "GET /api/settings/bulk?keys=... - Bulk get settings"

# Delete test settings
test_endpoint "DELETE" "/settings/test.setting" 204 "" "DELETE /api/settings/test.setting - Delete setting"
test_endpoint "DELETE" "/settings/bulk.test1" 204 "" "DELETE /api/settings/bulk.test1 - Delete bulk test 1"
test_endpoint "DELETE" "/settings/bulk.test2" 204 "" "DELETE /api/settings/bulk.test2 - Delete bulk test 2"

# Test Error Cases
print_section "Testing Error Cases"
test_endpoint "GET" "/nonexistent" 404 "" "GET /api/nonexistent - 404 Not Found" false
test_endpoint "GET" "/users" 401 "" "GET /api/users - 401 Unauthorized (no token)" false
test_endpoint "POST" "/auth/login" 401 '{"email":"wrong@example.com","password":"wrong"}' "POST /api/auth/login - Invalid credentials" false
test_endpoint "POST" "/settings" 400 '{"invalid":"data"}' "POST /api/settings - 400 Bad Request (invalid data)"

# Test Rate Limiting (if enabled)
print_section "Testing Rate Limiting"
echo -e "${YELLOW}Note: Rate limiting tests might fail if not configured${NC}"
for i in {1..5}; do
    test_endpoint "GET" "/status" 200 "" "GET /api/status - Request $i" false
done

# Summary
print_section "Test Summary"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed!${NC}"
    exit 1
fi