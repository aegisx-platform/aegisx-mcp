#!/bin/bash
# API-Frontend Alignment Check Script
# 🚨 MANDATORY: Run this before any API-related frontend development

set -e

echo "🔍 API-Frontend Alignment Check Starting..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "SUCCESS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" = "ERROR" ]; then
        echo -e "${RED}❌ $message${NC}"
    elif [ "$status" = "INFO" ]; then
        echo -e "${BLUE}📍 $message${NC}"
    fi
}

# Step 1: Check if API server is running
echo -e "\n${BLUE}Step 1: API Server Health Check${NC}"
if curl -s "http://localhost:3333/api/health" > /dev/null; then
    print_status "SUCCESS" "API server is running on port 3333"
    API_NAME=$(curl -s "http://localhost:3333/api/info" | jq -r '.data.name' 2>/dev/null || echo "Unknown")
    print_status "INFO" "API Name: $API_NAME"
else
    print_status "ERROR" "API server is NOT running on port 3333"
    print_status "INFO" "Run: npx nx serve api"
    exit 1
fi

# Step 2: Check Frontend Environment Configuration
echo -e "\n${BLUE}Step 2: Frontend Environment Check${NC}"
if [ -f "apps/web/src/environments/environment.ts" ]; then
    API_URL=$(grep -o 'http://localhost:[0-9]*' apps/web/src/environments/environment.ts || echo "NOT_FOUND")
    if [ "$API_URL" = "http://localhost:3333" ]; then
        print_status "SUCCESS" "Frontend API URL is correct: $API_URL"
    else
        print_status "ERROR" "Frontend API URL is wrong: $API_URL (should be http://localhost:3333)"
        exit 1
    fi
else
    print_status "ERROR" "Environment file not found"
    exit 1
fi

# Step 3: Get Available API Endpoints
echo -e "\n${BLUE}Step 3: Available API Endpoints${NC}"
if ENDPOINTS=$(curl -s "http://localhost:3333/api-docs/json" | jq -r '.paths | keys[]' 2>/dev/null); then
    print_status "SUCCESS" "Retrieved API endpoints from OpenAPI spec"
    echo -e "${YELLOW}Available Auth Endpoints:${NC}"
    echo "$ENDPOINTS" | grep -E "(auth|login|register|logout|refresh)" | while read endpoint; do
        echo "  📍 $endpoint"
    done
else
    print_status "ERROR" "Could not retrieve API endpoints"
    exit 1
fi

# Step 4: Test Critical Auth Endpoints
echo -e "\n${BLUE}Step 4: Auth Endpoints Testing${NC}"

# Test login endpoint with wrong credentials (should return 401)
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST "http://localhost:3333/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' 2>/dev/null)

HTTP_CODE="${LOGIN_RESPONSE: -3}"
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
    print_status "SUCCESS" "Login endpoint responding correctly (HTTP $HTTP_CODE)"
else
    print_status "WARNING" "Login endpoint returned HTTP $HTTP_CODE (expected 401/400)"
fi

# Step 5: Check Frontend Service URLs
echo -e "\n${BLUE}Step 5: Frontend Service URL Check${NC}"
if [ -f "apps/web/src/app/core/auth.service.ts" ]; then
    # Check if all auth URLs have /api prefix
    WRONG_URLS=$(grep -n "environment.apiUrl.*auth" apps/web/src/app/core/auth.service.ts | grep -v "/api/auth" || true)
    if [ -z "$WRONG_URLS" ]; then
        print_status "SUCCESS" "All auth service URLs have correct /api prefix"
    else
        print_status "ERROR" "Found auth URLs without /api prefix:"
        echo "$WRONG_URLS"
        exit 1
    fi
    
    # Count auth endpoints
    AUTH_ENDPOINTS=$(grep -c "environment.apiUrl.*api/auth" apps/web/src/app/core/auth.service.ts || echo "0")
    print_status "INFO" "Found $AUTH_ENDPOINTS auth endpoints in service"
else
    print_status "WARNING" "Auth service file not found"
fi

# Step 6: Demo Accounts Check
echo -e "\n${BLUE}Step 6: Demo Accounts Verification${NC}"
print_status "INFO" "Demo accounts available for testing:"
echo "  👤 admin@aegisx.local / Admin123!"
echo "  👤 demo@aegisx.local / Demo123!"

# Test with demo account
DEMO_LOGIN=$(curl -s -w "%{http_code}" -X POST "http://localhost:3333/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@aegisx.local","password":"Admin123!"}' 2>/dev/null)

DEMO_HTTP_CODE="${DEMO_LOGIN: -3}"
if [ "$DEMO_HTTP_CODE" = "200" ]; then
    print_status "SUCCESS" "Demo admin login works correctly"
elif [ "$DEMO_HTTP_CODE" = "401" ]; then
    print_status "WARNING" "Demo admin login failed - check database seeding"
else
    print_status "WARNING" "Demo admin login returned HTTP $DEMO_HTTP_CODE"
fi

# Step 7: API Schema vs Frontend Types (if TypeScript files exist)
echo -e "\n${BLUE}Step 7: Schema Consistency Check${NC}"
if [ -f "apps/api/src/modules/auth/auth.schemas.ts" ]; then
    print_status "INFO" "API auth schemas found"
    # Check if frontend types exist
    if find apps/web/src -name "*.ts" -exec grep -l "LoginRequest\|AuthResponse" {} \; | head -1 > /dev/null; then
        print_status "SUCCESS" "Frontend auth types found"
    else
        print_status "WARNING" "Frontend auth types may be missing"
    fi
else
    print_status "WARNING" "API auth schemas not found"
fi

# Step 8: Module Structure Validation
echo -e "\n${BLUE}Step 8: Backend Module Structure Check${NC}"
MODULES_FOUND=0
for module_dir in apps/api/src/modules/*/; do
    if [ -d "$module_dir" ]; then
        MODULE_NAME=$(basename "$module_dir")
        MODULES_FOUND=$((MODULES_FOUND + 1))
        
        # Check for mandatory plugin file
        if [ -f "${module_dir}${MODULE_NAME}.plugin.ts" ]; then
            print_status "SUCCESS" "Module $MODULE_NAME has plugin.ts"
        else
            print_status "ERROR" "Module $MODULE_NAME missing mandatory plugin.ts"
        fi
        
        # Check for mandatory schemas file
        if [ -f "${module_dir}${MODULE_NAME}.schemas.ts" ]; then
            print_status "SUCCESS" "Module $MODULE_NAME has schemas.ts"
        else
            print_status "ERROR" "Module $MODULE_NAME missing mandatory schemas.ts"
        fi
        
        # Check for service and repository
        if [ -f "${module_dir}${MODULE_NAME}.service.ts" ]; then
            print_status "SUCCESS" "Module $MODULE_NAME has service.ts"
        else
            print_status "WARNING" "Module $MODULE_NAME missing service.ts"
        fi
        
        if [ -f "${module_dir}${MODULE_NAME}.repository.ts" ]; then
            print_status "SUCCESS" "Module $MODULE_NAME has repository.ts"
        else
            print_status "WARNING" "Module $MODULE_NAME missing repository.ts"
        fi
    fi
done

if [ $MODULES_FOUND -eq 0 ]; then
    print_status "WARNING" "No backend modules found in apps/api/src/modules/"
else
    print_status "INFO" "Found $MODULES_FOUND backend modules"
fi

# Step 9: Frontend Service Structure Check
echo -e "\n${BLUE}Step 9: Frontend Service Structure Check${NC}"
FRONTEND_SERVICES=0
for service_file in apps/web/src/app/core/*.service.ts apps/web/src/app/services/*.service.ts; do
    if [ -f "$service_file" ]; then
        FRONTEND_SERVICES=$((FRONTEND_SERVICES + 1))
        SERVICE_NAME=$(basename "$service_file" .service.ts)
        
        # Check for environment.apiUrl usage
        if grep -q "environment\.apiUrl.*\/api\/" "$service_file"; then
            print_status "SUCCESS" "Service $SERVICE_NAME uses correct API URL pattern"
        else
            print_status "ERROR" "Service $SERVICE_NAME missing environment.apiUrl/api/ pattern"
        fi
    fi
done

if [ $FRONTEND_SERVICES -eq 0 ]; then
    print_status "WARNING" "No frontend services found"
else
    print_status "INFO" "Found $FRONTEND_SERVICES frontend services"
fi

# Final Summary
echo -e "\n${GREEN}=================================================="
echo "🎯 API-Frontend Alignment Check Complete"
echo "==================================================${NC}"

print_status "INFO" "Key URLs to remember:"
echo "  🔗 API Server: http://localhost:3333"
echo "  📚 API Docs: http://localhost:3333/api-docs"  
echo "  🔐 Login Endpoint: http://localhost:3333/api/auth/login"
echo "  🌐 Frontend: http://localhost:4200 (when running)"

print_status "SUCCESS" "Ready for frontend development! 🚀"

echo -e "\n${YELLOW}💡 Next Steps:${NC}"
echo "1. Follow exact OpenAPI endpoint paths"
echo "2. Use environment.apiUrl + '/api/auth/endpoint'"  
echo "3. Match request/response schemas exactly"
echo "4. Test with demo credentials"