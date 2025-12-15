#!/usr/bin/env bash

###############################################################################
# Frontmatter Injection Utility
#
# Adds or updates YAML frontmatter in markdown files based on file-mapping.json
# Preserves existing content while ensuring proper frontmatter format
#
# Usage:
#   ./scripts/inject-frontmatter.sh                 # Inject all
#   ./scripts/inject-frontmatter.sh --dry-run       # Preview only
#   ./scripts/inject-frontmatter.sh --file path.md  # Single file
###############################################################################

set -e
set -u

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MAPPING_FILE="$PROJECT_ROOT/.spec-workflow/specs/docs-restructure/file-mapping.json"
LOG_FILE="$PROJECT_ROOT/.spec-workflow/specs/docs-restructure/frontmatter-$(date +%Y%m%d-%H%M%S).log"

# Flags
DRY_RUN=false
SINGLE_FILE=""
VERBOSE=false

# Counters
TOTAL_FILES=0
UPDATED_FILES=0
ADDED_FILES=0
SKIPPED_FILES=0
ERROR_FILES=0

###############################################################################
# Helper Functions
###############################################################################

print_usage() {
    cat << EOF
Frontmatter Injection Utility

Usage: $0 [OPTIONS]

Options:
    --dry-run           Preview changes without modifying files
    --file FILE         Process single file only
    --verbose, -v       Show detailed output
    --help, -h          Show this help message

Examples:
    # Preview frontmatter injection for all files
    $0 --dry-run

    # Inject frontmatter in all files
    $0

    # Process single file
    $0 --file docs/guides/development/feature-development-standard.md

Dependencies:
    - yq (YAML processor): brew install yq
EOF
}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v yq &> /dev/null; then
        log_error "yq (YAML processor) not found"
        echo "Install with: brew install yq"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_error "jq (JSON processor) not found"
        echo "Install with: brew install jq"
        exit 1
    fi

    if [[ ! -f "$MAPPING_FILE" ]]; then
        log_error "Mapping file not found: $MAPPING_FILE"
        exit 1
    fi

    log_success "Dependencies satisfied"
}

has_frontmatter() {
    local file="$1"

    # Check if file starts with ---
    if head -n 1 "$file" 2>/dev/null | grep -q "^---$"; then
        return 0
    fi
    return 1
}

extract_frontmatter() {
    local file="$1"

    if has_frontmatter "$file"; then
        # Extract frontmatter between first two ---
        sed -n '/^---$/,/^---$/p' "$file" | sed '1d;$d'
    else
        echo ""
    fi
}

extract_content() {
    local file="$1"

    if has_frontmatter "$file"; then
        # Extract content after second ---
        sed -n '/^---$/,/^---$/!p' "$file" | tail -n +2
    else
        cat "$file"
    fi
}

create_frontmatter_yaml() {
    local title="$1"
    local description="$2"
    local category="$3"
    local tags="$4"

    cat << EOF
---
title: "$title"
description: "$description"
category: $category
tags: [$tags]
---
EOF
}

inject_frontmatter_to_file() {
    local file="$1"
    local frontmatter_json="$2"

    # Parse frontmatter fields
    local title=$(echo "$frontmatter_json" | jq -r '.title // ""')
    local description=$(echo "$frontmatter_json" | jq -r '.description // ""')
    local category=$(echo "$frontmatter_json" | jq -r '.category // "guides"')
    local tags=$(echo "$frontmatter_json" | jq -r '.tags // [] | join(", ")')

    # Skip if no frontmatter data
    if [[ -z "$title" ]]; then
        log_warning "No frontmatter data for: $file"
        ((SKIPPED_FILES++))
        return 1
    fi

    # Check if file exists
    if [[ ! -f "$file" ]]; then
        log_warning "File not found: $file"
        ((SKIPPED_FILES++))
        return 1
    fi

    # Extract existing content
    local content=$(extract_content "$file")
    local has_existing=$(has_frontmatter "$file" && echo "yes" || echo "no")

    # Create new frontmatter
    local new_frontmatter=$(create_frontmatter_yaml "$title" "$description" "$category" "$tags")

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY-RUN]${NC} Would inject frontmatter to: $file"
        if [[ "$VERBOSE" == true ]]; then
            echo "$new_frontmatter"
            echo ""
        fi
        ((TOTAL_FILES++))
        if [[ "$has_existing" == "yes" ]]; then
            ((UPDATED_FILES++))
        else
            ((ADDED_FILES++))
        fi
    else
        # Create temporary file
        local temp_file="${file}.tmp"

        # Write new frontmatter + content
        {
            echo "$new_frontmatter"
            echo ""
            echo "$content"
        } > "$temp_file"

        # Replace original file
        if mv "$temp_file" "$file"; then
            if [[ "$has_existing" == "yes" ]]; then
                log_success "Updated frontmatter: $file"
                ((UPDATED_FILES++))
            else
                log_success "Added frontmatter: $file"
                ((ADDED_FILES++))
            fi
            ((TOTAL_FILES++))
        else
            log_error "Failed to update: $file"
            rm -f "$temp_file"
            ((ERROR_FILES++))
            return 1
        fi
    fi

    return 0
}

process_single_file() {
    local file="$1"

    log_info "Processing single file: $file"

    # Find matching entry in mapping file
    local rel_path="${file#$PROJECT_ROOT/}"
    local entry=$(jq -r ".migrations[] | select(.to == \"$rel_path\")" "$MAPPING_FILE")

    if [[ -z "$entry" ]]; then
        log_error "No mapping found for: $rel_path"
        return 1
    fi

    local frontmatter=$(echo "$entry" | jq -r '.frontmatter')
    inject_frontmatter_to_file "$file" "$frontmatter"
}

process_all_files() {
    log_info "Processing all files from mapping..."

    local migrations_count=$(jq '.migrations | length' "$MAPPING_FILE")
    log_info "Found $migrations_count migration entries"

    for i in $(seq 0 $((migrations_count - 1))); do
        local entry=$(jq -r ".migrations[$i]" "$MAPPING_FILE")

        # Skip entries without 'to' field
        local has_to=$(echo "$entry" | jq -r 'has("to")')
        if [[ "$has_to" != "true" ]]; then
            continue
        fi

        # Skip entries without frontmatter
        local has_frontmatter=$(echo "$entry" | jq -r 'has("frontmatter")')
        if [[ "$has_frontmatter" != "true" ]]; then
            continue
        fi

        local to=$(echo "$entry" | jq -r '.to')
        local frontmatter=$(echo "$entry" | jq -r '.frontmatter')
        local file_path="$PROJECT_ROOT/$to"

        # Handle wildcard patterns (skip for now, will be implemented post-migration)
        if [[ "$to" == *"*"* ]]; then
            continue
        fi

        inject_frontmatter_to_file "$file_path" "$frontmatter"
    done
}

print_summary() {
    echo ""
    echo "========================================="
    echo "     Frontmatter Injection Summary"
    echo "========================================="
    echo "Total files processed:     $TOTAL_FILES"
    echo "Frontmatter added:         $ADDED_FILES"
    echo "Frontmatter updated:       $UPDATED_FILES"
    echo "Skipped (no data):         $SKIPPED_FILES"
    echo "Errors:                    $ERROR_FILES"
    echo "========================================="

    if [[ "$DRY_RUN" == true ]]; then
        echo ""
        echo -e "${YELLOW}DRY-RUN MODE:${NC} No files were modified"
        echo "Run without --dry-run to inject frontmatter"
    else
        echo ""
        echo "Log file: $LOG_FILE"

        if [[ $ERROR_FILES -gt 0 ]]; then
            echo -e "${RED}⚠ Completed with errors${NC}"
            exit 1
        else
            echo -e "${GREEN}✓ Frontmatter injection completed${NC}"
            echo ""
            echo "Next steps:"
            echo "  1. Review changes: git diff"
            echo "  2. Validate frontmatter: scripts/validate-links.sh"
            echo "  3. Commit: git commit -m 'docs: add frontmatter metadata'"
        fi
    fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --file)
                SINGLE_FILE="$2"
                shift 2
                ;;
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --help|-h)
                print_usage
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done

    echo "========================================="
    echo "  Frontmatter Injection Utility"
    echo "========================================="
    echo "Mode: $([ "$DRY_RUN" == true ] && echo "DRY-RUN" || echo "EXECUTE")"
    echo "========================================="
    echo ""

    log "=== Frontmatter Injection Started ==="
    log "Mode: $([ "$DRY_RUN" == true ] && echo "DRY-RUN" || echo "EXECUTE")"

    check_dependencies

    if [[ -n "$SINGLE_FILE" ]]; then
        process_single_file "$SINGLE_FILE"
    else
        process_all_files
    fi

    print_summary

    log "=== Frontmatter Injection Completed ==="
}

main "$@"
