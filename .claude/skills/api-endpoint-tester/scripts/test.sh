#!/bin/bash

# API Endpoint Tester Helper Script
# Quick API testing from command line

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
BASE_URL="http://localhost:3000"
AUTH_TOKEN=""
DRY_RUN=false
USE_AUTH=false
REQUEST_DATA=""

echo -e "${BLUE}API Endpoint Tester${NC}"
echo "===================="
echo ""

# Check if arguments provided
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 <METHOD> <PATH> [options]"
    echo ""
    echo -e "${YELLOW}Arguments:${NC}"
    echo "  METHOD              HTTP method (GET, POST, PUT, DELETE)"
    echo "  PATH                Endpoint path (e.g., /api/v1/departments)"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --data JSON         Request body (for POST/PUT)"
    echo "  --auth              Include authentication token"
    echo "  --token TOKEN       Specify custom auth token"
    echo "  --base-url URL      Custom base URL (default: http://localhost:3000)"
    echo "  --dry-run           Show command without executing"
    echo "  --feature NAME      Test all endpoints for a feature"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  # GET request"
    echo "  $0 GET /api/v1/departments"
    echo ""
    echo "  # POST with data and auth"
    echo "  $0 POST /api/v1/departments --data '{\"dept_code\":\"IT\",\"dept_name\":\"IT Dept\"}' --auth"
    echo ""
    echo "  # Test all endpoints for feature"
    echo "  $0 --feature departments"
    echo ""
    echo "  # Dry run"
    echo "  $0 GET /api/v1/departments --dry-run"
    exit 1
fi

# Check for --feature option
if [ "$1" == "--feature" ]; then
    FEATURE_NAME="$2"
    echo -e "${BLUE}Feature:${NC} $FEATURE_NAME"
    echo ""
    echo -e "${YELLOW}Recommendation:${NC}"
    echo "For comprehensive feature testing, use Claude:"
    echo ""
    echo -e "${GREEN}  \"Claude, test the $FEATURE_NAME API\"${NC}"
    echo ""
    echo -e "${BLUE}Why use Claude?${NC}"
    echo "  • Tests all endpoints systematically"
    echo "  • Generates proper test data"
    echo "  • Handles authentication automatically"
    echo "  • Validates responses against contract"
    echo "  • Provides detailed error analysis"
    echo "  • Tests validation rules"
    echo "  • Cleans up test data"
    exit 0
fi

# Parse arguments
HTTP_METHOD="$1"
ENDPOINT_PATH="$2"
shift 2

while [[ $# -gt 0 ]]; do
    case $1 in
        --data)
            REQUEST_DATA="$2"
            shift 2
            ;;
        --auth)
            USE_AUTH=true
            shift
            ;;
        --token)
            AUTH_TOKEN="$2"
            USE_AUTH=true
            shift 2
            ;;
        --base-url)
            BASE_URL="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Validate HTTP method
case $HTTP_METHOD in
    GET|POST|PUT|DELETE|PATCH)
        ;;
    *)
        echo -e "${RED}Invalid HTTP method: $HTTP_METHOD${NC}"
        echo "Supported: GET, POST, PUT, DELETE, PATCH"
        exit 1
        ;;
esac

# Get port from .env.local if exists
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    API_PORT=$(grep "^API_PORT=" "$PROJECT_ROOT/.env.local" | cut -d '=' -f2 | tr -d '"' | tr -d ' ')
    if [ -n "$API_PORT" ]; then
        BASE_URL="http://localhost:$API_PORT"
    fi
fi

FULL_URL="${BASE_URL}${ENDPOINT_PATH}"

echo -e "${BLUE}Request Details:${NC}"
echo "  Method: $HTTP_METHOD"
echo "  URL: $FULL_URL"
if [ -n "$REQUEST_DATA" ]; then
    echo "  Data: $REQUEST_DATA"
fi
echo ""

# Build curl command
CURL_CMD="curl -X $HTTP_METHOD \"$FULL_URL\""

# Add authentication if needed
if [ "$USE_AUTH" = true ]; then
    if [ -z "$AUTH_TOKEN" ]; then
        echo -e "${YELLOW}[AUTH]${NC} No token provided, attempting to login..."

        # Try to login
        LOGIN_URL="${BASE_URL}/api/v1/auth/login"
        LOGIN_DATA='{"username":"admin","password":"admin"}'

        echo "  Login URL: $LOGIN_URL"

        if [ "$DRY_RUN" = false ]; then
            AUTH_RESPONSE=$(curl -s -X POST "$LOGIN_URL" \
                -H "Content-Type: application/json" \
                -d "$LOGIN_DATA" 2>/dev/null || echo "")

            if [ -n "$AUTH_RESPONSE" ]; then
                # Try to extract token (adjust based on your response format)
                AUTH_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.data.access_token // .token // .access_token // empty' 2>/dev/null || echo "")

                if [ -n "$AUTH_TOKEN" ] && [ "$AUTH_TOKEN" != "null" ]; then
                    echo -e "  ${GREEN}✓${NC} Token obtained"
                else
                    echo -e "  ${YELLOW}⚠${NC}  Could not extract token from response"
                    echo "  Response: $AUTH_RESPONSE"
                fi
            else
                echo -e "  ${YELLOW}⚠${NC}  Login failed or server not responding"
            fi
        else
            echo "  (Dry run - skipping actual login)"
        fi
    fi

    if [ -n "$AUTH_TOKEN" ]; then
        CURL_CMD="$CURL_CMD -H \"Authorization: Bearer $AUTH_TOKEN\""
    fi
fi

# Add Content-Type for POST/PUT/PATCH
if [[ "$HTTP_METHOD" =~ ^(POST|PUT|PATCH)$ ]]; then
    CURL_CMD="$CURL_CMD -H \"Content-Type: application/json\""
fi

# Add request data
if [ -n "$REQUEST_DATA" ]; then
    CURL_CMD="$CURL_CMD -d '$REQUEST_DATA'"
fi

# Add formatting
CURL_CMD="$CURL_CMD -w \"\\nHTTP Status: %{http_code}\\n\""

# Check if jq is available
if command -v jq &> /dev/null; then
    CURL_CMD="$CURL_CMD | jq '.'"
fi

echo -e "${YELLOW}[COMMAND]${NC}"
echo "  $CURL_CMD"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN]${NC} Command not executed"
    echo ""
    echo -e "${BLUE}To execute:${NC}"
    echo "  Remove --dry-run flag"
    echo ""
    echo -e "${BLUE}Or use Claude for better testing:${NC}"
    echo "  \"Claude, test $HTTP_METHOD $ENDPOINT_PATH\""
    exit 0
fi

# Check if server is running
echo -e "${YELLOW}[CHECK]${NC} Verifying server is running..."
if command -v lsof &> /dev/null; then
    PORT=$(echo "$BASE_URL" | grep -oP ':\K[0-9]+' || echo "3000")
    SERVER_RUNNING=$(lsof -i :$PORT 2>/dev/null | grep LISTEN || echo "")

    if [ -z "$SERVER_RUNNING" ]; then
        echo -e "${RED}✗${NC} Server not running on port $PORT"
        echo ""
        echo -e "${YELLOW}Start server with:${NC}"
        echo "  pnpm run dev:api"
        exit 1
    else
        echo -e "${GREEN}✓${NC} Server running on port $PORT"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Cannot verify (lsof not available)"
fi
echo ""

# Execute request
echo -e "${YELLOW}[EXECUTE]${NC} Sending request..."
echo ""

eval $CURL_CMD

echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
echo -e "${BLUE}For comprehensive testing, use Claude:${NC}"
echo "  \"Claude, test $ENDPOINT_PATH\""
echo "  \"Claude, test all validation rules for this endpoint\""
echo "  \"Claude, test CRUD flow for this feature\""
