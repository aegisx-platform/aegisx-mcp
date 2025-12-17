#!/bin/bash

# =============================================================================
# AegisX Development Workflow Helper Script
# =============================================================================
# This script provides helper functions for the development workflow.
# It can be used standalone or sourced by Claude for quick operations.
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../../../../" && pwd )"

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# =============================================================================
# Pre-flight Check
# =============================================================================

preflight_check() {
    print_header "Pre-flight Check"

    cd "$PROJECT_ROOT"

    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Not in project root directory"
        exit 1
    fi

    # Check build
    print_step "Checking build..."
    if pnpm run build > /dev/null 2>&1; then
        print_success "Build passes"
    else
        print_error "Build failed - fix errors before proceeding"
        exit 1
    fi

    # Check database connection
    print_step "Checking database connection..."
    if pnpm run crud:list > /dev/null 2>&1; then
        print_success "Database connection OK"
    else
        print_warning "Database connection failed - check .env.local"
    fi

    # Check ports
    print_step "Checking port configuration..."
    if [ -f ".env.local" ]; then
        API_PORT=$(grep "API_PORT" .env.local 2>/dev/null | cut -d'=' -f2 || echo "3000")
        print_info "API Port: ${API_PORT:-3000}"
    else
        print_warning ".env.local not found"
    fi

    print_success "Pre-flight check complete"
}

# =============================================================================
# List Available Tables
# =============================================================================

list_tables() {
    print_header "Available Database Tables"
    cd "$PROJECT_ROOT"
    pnpm run crud:list
}

# =============================================================================
# Generate Backend
# =============================================================================

generate_backend() {
    local TABLE_NAME="$1"
    local PACKAGE="${2:-standard}"
    local DOMAIN="$3"
    local SCHEMA="$4"

    if [ -z "$TABLE_NAME" ]; then
        print_error "Usage: workflow.sh generate-backend TABLE_NAME [PACKAGE] [DOMAIN] [SCHEMA]"
        echo "  PACKAGE: standard, enterprise, full (default: standard)"
        echo "  DOMAIN: inventory/master-data, inventory/operations, etc."
        echo "  SCHEMA: PostgreSQL schema name"
        exit 1
    fi

    print_header "Generating Backend for: $TABLE_NAME"
    cd "$PROJECT_ROOT"

    # Build command
    local CMD=""
    case "$PACKAGE" in
        enterprise)
            CMD="pnpm run crud:import -- $TABLE_NAME"
            ;;
        full)
            CMD="pnpm run crud:full -- $TABLE_NAME"
            ;;
        *)
            CMD="pnpm run crud -- $TABLE_NAME"
            ;;
    esac

    # Add domain and schema if provided
    if [ -n "$DOMAIN" ]; then
        CMD="$CMD --domain $DOMAIN"
    fi
    if [ -n "$SCHEMA" ]; then
        CMD="$CMD --schema $SCHEMA"
    fi

    CMD="$CMD --force"

    print_step "Executing: $CMD"
    eval "$CMD"

    print_success "Backend generated for $TABLE_NAME"
}

# =============================================================================
# Generate Frontend
# =============================================================================

generate_frontend() {
    local TABLE_NAME="$1"
    local SHELL="$2"
    local WITH_IMPORT="$3"

    if [ -z "$TABLE_NAME" ]; then
        print_error "Usage: workflow.sh generate-frontend TABLE_NAME [SHELL] [WITH_IMPORT]"
        echo "  SHELL: system, inventory, etc."
        echo "  WITH_IMPORT: true/false"
        exit 1
    fi

    print_header "Generating Frontend for: $TABLE_NAME"
    cd "$PROJECT_ROOT"

    # Build command
    local CMD="./bin/cli.js generate $TABLE_NAME --target frontend"

    if [ -n "$SHELL" ]; then
        CMD="$CMD --shell $SHELL"
    fi

    if [ "$WITH_IMPORT" = "true" ]; then
        CMD="$CMD --with-import"
    fi

    CMD="$CMD --force"

    print_step "Executing: $CMD"
    eval "$CMD"

    print_success "Frontend generated for $TABLE_NAME"
}

# =============================================================================
# Full Workflow
# =============================================================================

full_workflow() {
    local TABLE_NAME="$1"
    local PACKAGE="${2:-standard}"
    local SHELL="${3:-system}"

    if [ -z "$TABLE_NAME" ]; then
        print_error "Usage: workflow.sh full TABLE_NAME [PACKAGE] [SHELL]"
        exit 1
    fi

    print_header "Full Workflow for: $TABLE_NAME"

    # Pre-flight
    preflight_check

    # Generate backend
    generate_backend "$TABLE_NAME" "$PACKAGE"

    # Build check
    print_step "Building project..."
    cd "$PROJECT_ROOT"
    if ! pnpm run build > /dev/null 2>&1; then
        print_error "Build failed after backend generation"
        exit 1
    fi
    print_success "Build passed"

    # Generate frontend
    generate_frontend "$TABLE_NAME" "$SHELL"

    # Final build check
    print_step "Final build check..."
    if ! pnpm run build > /dev/null 2>&1; then
        print_error "Build failed after frontend generation"
        exit 1
    fi
    print_success "Build passed"

    print_header "Workflow Complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Start API server:   pnpm run dev:api"
    echo "  2. Start Admin app:    pnpm run dev:admin"
    echo "  3. Test in browser:    http://localhost:4200"
    echo ""
}

# =============================================================================
# Test API Endpoints
# =============================================================================

test_api() {
    local TABLE_NAME="$1"
    local TOKEN="$2"
    local BASE_URL="${3:-http://localhost:3000}"

    if [ -z "$TABLE_NAME" ]; then
        print_error "Usage: workflow.sh test-api TABLE_NAME [TOKEN] [BASE_URL]"
        exit 1
    fi

    print_header "Testing API for: $TABLE_NAME"

    # Get token if not provided
    if [ -z "$TOKEN" ]; then
        print_step "Getting authentication token..."
        TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"username":"admin","password":"admin"}' | jq -r '.data.access_token')

        if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
            print_error "Failed to get token. Is the server running?"
            exit 1
        fi
        print_success "Token acquired"
    fi

    # Convert table name to kebab-case for URL
    local URL_PATH=$(echo "$TABLE_NAME" | sed 's/_/-/g')
    local ENDPOINT="$BASE_URL/api/v1/$URL_PATH"

    echo ""
    print_step "Testing GET $ENDPOINT"
    echo "Response:"
    curl -s -X GET "$ENDPOINT" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" | jq '.'

    echo ""
    print_success "API test complete"
}

# =============================================================================
# Check Feature Status
# =============================================================================

check_status() {
    local TABLE_NAME="$1"

    if [ -z "$TABLE_NAME" ]; then
        print_error "Usage: workflow.sh check-status TABLE_NAME"
        exit 1
    fi

    print_header "Checking Status for: $TABLE_NAME"
    cd "$PROJECT_ROOT"

    local URL_PATH=$(echo "$TABLE_NAME" | sed 's/_/-/g')

    # Check database table
    print_step "Database table..."
    if pnpm run crud:list 2>/dev/null | grep -q "$TABLE_NAME"; then
        print_success "Table exists: $TABLE_NAME"
    else
        print_warning "Table not found: $TABLE_NAME"
    fi

    # Check backend module
    print_step "Backend module..."
    local BACKEND_PATH=""
    if [ -d "apps/api/src/modules/$URL_PATH" ]; then
        BACKEND_PATH="apps/api/src/modules/$URL_PATH"
    elif [ -d "apps/api/src/layers/platform/$URL_PATH" ]; then
        BACKEND_PATH="apps/api/src/layers/platform/$URL_PATH"
    fi

    if [ -n "$BACKEND_PATH" ]; then
        print_success "Backend found: $BACKEND_PATH"
        ls -la "$BACKEND_PATH"
    else
        print_warning "Backend not found"
    fi

    # Check frontend module
    print_step "Frontend module..."
    local FRONTEND_PATH=""
    if [ -d "apps/web/src/app/features/$URL_PATH" ]; then
        FRONTEND_PATH="apps/web/src/app/features/$URL_PATH"
    elif [ -d "apps/admin/src/app/features/$URL_PATH" ]; then
        FRONTEND_PATH="apps/admin/src/app/features/$URL_PATH"
    fi

    if [ -n "$FRONTEND_PATH" ]; then
        print_success "Frontend found: $FRONTEND_PATH"
        ls -la "$FRONTEND_PATH"
    else
        print_warning "Frontend not found"
    fi

    echo ""
}

# =============================================================================
# Classify Domain
# =============================================================================

classify_domain() {
    local TABLE_NAME="$1"

    if [ -z "$TABLE_NAME" ]; then
        print_error "Usage: workflow.sh classify-domain TABLE_NAME"
        exit 1
    fi

    print_header "Domain Classification for: $TABLE_NAME"

    echo "Answer these questions to determine domain:"
    echo ""
    echo "1. Is the table referenced by other tables via FK?"
    echo "   - Yes: Likely MASTER-DATA"
    echo "   - No: Check next question"
    echo ""
    echo "2. Does it have state/status fields (spent, remaining, status)?"
    echo "   - Yes: OPERATIONS"
    echo "   - No: Likely MASTER-DATA"
    echo ""
    echo "3. Is it configuration or transactional data?"
    echo "   - Configuration: MASTER-DATA"
    echo "   - Transactional: OPERATIONS"
    echo ""
    echo "Examples:"
    echo "  MASTER-DATA: budget_types, departments, categories, drug_generics"
    echo "  OPERATIONS:  budget_allocations, inventory_transactions, orders"
    echo ""
}

# =============================================================================
# Show Help
# =============================================================================

show_help() {
    print_header "AegisX Development Workflow Helper"

    echo "Usage: workflow.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  preflight              Run pre-flight checks"
    echo "  list-tables            List available database tables"
    echo "  generate-backend       Generate backend CRUD module"
    echo "  generate-frontend      Generate frontend module"
    echo "  full                   Run complete workflow"
    echo "  test-api               Test API endpoints"
    echo "  check-status           Check feature status"
    echo "  classify-domain        Help classify domain for table"
    echo "  help                   Show this help"
    echo ""
    echo "Examples:"
    echo "  workflow.sh preflight"
    echo "  workflow.sh list-tables"
    echo "  workflow.sh generate-backend products standard"
    echo "  workflow.sh generate-frontend products system"
    echo "  workflow.sh full products enterprise system"
    echo "  workflow.sh test-api products"
    echo "  workflow.sh check-status products"
    echo ""
}

# =============================================================================
# Main Entry Point
# =============================================================================

main() {
    local COMMAND="${1:-help}"
    shift 2>/dev/null || true

    case "$COMMAND" in
        preflight)
            preflight_check
            ;;
        list-tables)
            list_tables
            ;;
        generate-backend)
            generate_backend "$@"
            ;;
        generate-frontend)
            generate_frontend "$@"
            ;;
        full)
            full_workflow "$@"
            ;;
        test-api)
            test_api "$@"
            ;;
        check-status)
            check_status "$@"
            ;;
        classify-domain)
            classify_domain "$@"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# Run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
