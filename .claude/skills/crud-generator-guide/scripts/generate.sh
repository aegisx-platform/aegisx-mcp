#!/bin/bash

###############################################################################
# AegisX CRUD Generator Helper Script
###############################################################################
#
# Quick helper for generating CRUD modules with common options.
# For best results, ask Claude directly - this is just a convenience wrapper.
#
# Usage:
#   ./generate.sh TABLE_NAME [OPTIONS]
#
# Examples:
#   ./generate.sh products
#   ./generate.sh products --package enterprise
#   ./generate.sh products --with-import --with-events
#   ./generate.sh drugs --domain inventory/master-data --schema inventory
#   ./generate.sh products --dry-run
#
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root (4 levels up from .claude/skills/crud-generator-guide/scripts/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
CLI_PATH="$PROJECT_ROOT/bin/cli.js"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         AegisX CRUD Generator - Quick Helper                   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

show_usage() {
    cat << EOF
Usage: $0 TABLE_NAME [OPTIONS]

Options:
  --package PACKAGE         Package type (standard|enterprise|full)
  --with-import            Add Excel/CSV import functionality
  --with-events            Add WebSocket events
  --domain DOMAIN          Domain path (e.g., inventory/master-data)
  --schema SCHEMA          PostgreSQL schema (e.g., inventory)
  --section SECTION        Frontend section for UX grouping
  --shell SHELL            Shell for route registration
  --app APP                Target app (api|web|admin)
  --target TARGET          Target (backend|frontend)
  --dry-run                Preview without generating
  --help                   Show this help message

Examples:
  # Basic CRUD
  $0 products

  # With import
  $0 products --with-import

  # Full package
  $0 orders --package full --with-import --with-events

  # Domain-specific (master-data)
  $0 drugs --domain inventory/master-data --schema inventory

  # Frontend only
  $0 products --target frontend

  # Preview
  $0 products --dry-run

Package Decision:
  standard   - Basic CRUD only
  enterprise - CRUD + import/export + bulk ops (recommended)
  full       - Everything (validation, stats, events)

Domain Decision:
  master-data   - Reference/lookup data (drugs, departments)
  operations    - Transactional data (allocations, transactions)

EOF
}

check_table_exists() {
    local table_name="$1"

    print_info "Checking if table '$table_name' exists..."

    cd "$PROJECT_ROOT"

    # Try to list tables
    if ! pnpm run crud:list &> /dev/null; then
        print_warning "Could not verify table existence (database connection issue)"
        return 0
    fi

    # Check if table is in the list
    if pnpm run crud:list 2>/dev/null | grep -q "$table_name"; then
        print_success "Table '$table_name' found"
        return 0
    else
        print_error "Table '$table_name' not found in database"
        echo ""
        print_info "Available tables:"
        pnpm run crud:list 2>/dev/null || true
        return 1
    fi
}

suggest_package() {
    echo ""
    print_info "Package Recommendation:"
    echo ""
    echo "  • Use 'standard' for: Simple lookup tables"
    echo "  • Use 'enterprise' for: Most production features (recommended)"
    echo "  • Use 'full' for: Complex features with all requirements"
    echo ""
    echo "Add --with-import if you need Excel/CSV import"
    echo "Add --with-events if you need real-time WebSocket updates"
    echo ""
}

suggest_domain() {
    local table_name="$1"

    echo ""
    print_info "Domain Classification:"
    echo ""
    echo "  • Use 'master-data' for: Reference/lookup data"
    echo "    - Rarely changes"
    echo "    - Used in dropdowns"
    echo "    - Referenced by other tables"
    echo ""
    echo "  • Use 'operations' for: Transactional data"
    echo "    - Changes frequently"
    echo "    - Has status/state fields"
    echo "    - References master-data"
    echo ""
    print_warning "Not sure? Ask Claude: 'Should $table_name be master-data or operations?'"
    echo ""
}

###############################################################################
# Main
###############################################################################

main() {
    print_header

    # Check if CLI exists
    if [ ! -f "$CLI_PATH" ]; then
        print_error "CLI not found at: $CLI_PATH"
        exit 1
    fi

    # Check for help
    if [ "$1" = "--help" ] || [ "$1" = "-h" ] || [ -z "$1" ]; then
        show_usage
        exit 0
    fi

    # Get table name
    TABLE_NAME="$1"
    shift

    # Check table exists (skip if dry-run or help)
    if [[ ! " $* " =~ " --dry-run " ]] && [[ ! " $* " =~ " --help " ]]; then
        if ! check_table_exists "$TABLE_NAME"; then
            echo ""
            print_error "Table verification failed. Run 'pnpm run db:migrate' if needed."
            exit 1
        fi
    fi

    # Determine target (backend or frontend)
    TARGET="backend"
    if [[ " $* " =~ " --target " ]]; then
        TARGET=$(echo "$*" | sed -n 's/.*--target \([^ ]*\).*/\1/p')
    fi

    # Build command
    CMD="$CLI_PATH generate $TABLE_NAME"

    # Add all arguments
    CMD="$CMD $*"

    # Add --force if not dry-run
    if [[ ! " $* " =~ " --dry-run " ]] && [[ ! " $* " =~ " --force " ]]; then
        CMD="$CMD --force"
    fi

    # Show command
    echo ""
    print_info "Command:"
    echo ""
    echo "  $CMD"
    echo ""

    # Suggest package if not specified
    if [[ ! " $* " =~ " --package " ]] && [ "$TARGET" = "backend" ]; then
        suggest_package
    fi

    # Suggest domain if not specified
    if [[ ! " $* " =~ " --domain " ]] && [ "$TARGET" = "backend" ]; then
        suggest_domain "$TABLE_NAME"
    fi

    # Ask for confirmation if not dry-run and not force
    if [[ ! " $* " =~ " --dry-run " ]]; then
        echo ""
        read -p "$(echo -e ${YELLOW}Continue? [Y/n]:${NC} )" -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
            print_info "Cancelled"
            exit 0
        fi
    fi

    # Execute
    echo ""
    print_info "Generating..."
    echo ""

    cd "$PROJECT_ROOT"

    if eval "$CMD"; then
        echo ""
        print_success "Generation complete!"

        # Show next steps
        if [[ " $* " =~ " --dry-run " ]]; then
            echo ""
            print_info "This was a dry run. Remove --dry-run to generate files."
        else
            echo ""
            print_info "Next steps:"

            if [ "$TARGET" = "backend" ]; then
                echo ""
                echo "  1. Test build:"
                echo "     pnpm run build"
                echo ""
                echo "  2. Test API endpoints:"
                echo "     curl http://localhost:3000/api/$TABLE_NAME"
                echo ""
                echo "  3. Generate frontend:"
                echo "     $CLI_PATH generate $TABLE_NAME --target frontend --force"
            else
                echo ""
                echo "  1. Test build:"
                echo "     pnpm run build"
                echo ""
                echo "  2. Test in browser:"
                echo "     pnpm run dev:admin"
                echo ""
                echo "  3. Customize UI components as needed"
            fi

            echo ""
        fi
    else
        echo ""
        print_error "Generation failed!"
        exit 1
    fi
}

# Run main
main "$@"
