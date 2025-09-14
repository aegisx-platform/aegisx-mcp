#!/bin/bash

# Avatar Display Testing Script
# This script runs the comprehensive avatar display tests

echo "🎯 Starting Avatar Display Tests"
echo "================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success") echo -e "${GREEN}✅ $message${NC}" ;;
        "error") echo -e "${RED}❌ $message${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "info") echo -e "ℹ️  $message" ;;
    esac
}

# Check if services are running
check_services() {
    print_status "info" "Checking if required services are running..."
    
    # Check API server
    if curl -s http://localhost:3333/api/health > /dev/null 2>&1; then
        print_status "success" "API server is running on localhost:3333"
    else
        print_status "error" "API server is not running. Please start with: npm run serve api"
        exit 1
    fi
    
    # Check Web server
    if curl -s http://localhost:4200 > /dev/null 2>&1; then
        print_status "success" "Web server is running on localhost:4200"
    else
        print_status "error" "Web server is not running. Please start with: npm run serve web"
        exit 1
    fi
}

# Verify avatar file exists
check_avatar_file() {
    print_status "info" "Checking if test avatar file exists..."
    
    local avatar_path="uploads/avatars/2c9fe167-a9e0-4709-8e12-39e699d97754_95113282-dd26-4392-8cb1-1f9aa945d549.png"
    
    if [ -f "$avatar_path" ]; then
        print_status "success" "Test avatar file found at $avatar_path"
    else
        print_status "warning" "Test avatar file not found. Tests will verify fallback behavior."
    fi
}

# Test API profile endpoint
test_profile_api() {
    print_status "info" "Testing profile API endpoint..."
    
    # First login to get token
    local login_response=$(curl -s -X POST http://localhost:3333/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@aegisx.local","password":"Admin123!"}')
    
    if echo "$login_response" | grep -q "accessToken"; then
        print_status "success" "Login successful"
        
        # Extract token
        local token=$(echo "$login_response" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
        
        # Test profile endpoint
        local profile_response=$(curl -s -H "Authorization: Bearer $token" http://localhost:3333/api/profile)
        
        if echo "$profile_response" | grep -q '"success":true'; then
            print_status "success" "Profile API endpoint working"
            
            # Check if avatar is in response
            if echo "$profile_response" | grep -q '"avatar"'; then
                print_status "success" "Avatar data present in profile response"
            else
                print_status "warning" "No avatar data in profile response"
            fi
        else
            print_status "error" "Profile API endpoint failed"
        fi
    else
        print_status "error" "Login failed. Please check credentials."
        exit 1
    fi
}

# Run specific avatar tests
run_avatar_tests() {
    print_status "info" "Running avatar display tests..."
    
    # Navigate to e2e directory
    cd apps/e2e
    
    # Run the avatar display test specifically
    if npx playwright test src/specs/avatar-display.spec.ts --headed --project=chromium; then
        print_status "success" "Avatar display tests completed successfully"
    else
        print_status "error" "Avatar display tests failed"
        return 1
    fi
    
    # Go back to root directory
    cd ../..
}

# Generate test report
generate_report() {
    print_status "info" "Generating test report..."
    
    echo ""
    echo "📊 Avatar Display Test Report"
    echo "============================"
    echo ""
    
    echo "✅ Tests Completed:"
    echo "   - Navigation bar avatar display"
    echo "   - User menu dropdown avatar display"  
    echo "   - Profile page avatar display"
    echo "   - Avatar styling and circular shape"
    echo "   - Avatar fallback behavior"
    echo "   - Avatar accessibility attributes"
    echo "   - Visual regression testing"
    echo "   - Error handling scenarios"
    echo ""
    
    echo "📸 Screenshots generated in:"
    echo "   - apps/e2e/test-results/"
    echo "   - apps/e2e/screenshots/"
    echo ""
    
    print_status "success" "Avatar display testing completed!"
}

# Main execution
main() {
    echo "Starting Avatar Display Test Suite..."
    echo "Time: $(date)"
    echo ""
    
    check_services
    echo ""
    
    check_avatar_file
    echo ""
    
    test_profile_api
    echo ""
    
    if run_avatar_tests; then
        echo ""
        generate_report
    else
        print_status "error" "Tests failed. Check the output above for details."
        exit 1
    fi
}

# Run main function
main "$@"