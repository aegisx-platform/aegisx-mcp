#!/usr/bin/env bash

###############################################################################
# Documentation Migration Script
#
# Migrates documentation files based on file-mapping.json configuration
# Supports dry-run mode for safe preview before execution
#
# Usage:
#   ./scripts/migrate-docs.sh                 # Execute migration
#   ./scripts/migrate-docs.sh --dry-run       # Preview changes only
#   ./scripts/migrate-docs.sh --help          # Show help
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MAPPING_FILE="$PROJECT_ROOT/.spec-workflow/specs/docs-restructure/file-mapping.json"
LOG_FILE="$PROJECT_ROOT/.spec-workflow/specs/docs-restructure/migration-$(date +%Y%m%d-%H%M%S).log"

# Mode flags
DRY_RUN=false
VERBOSE=false

# Counters
TOTAL_FILES=0
MOVED_FILES=0
ARCHIVED_FILES=0
RENAMED_FILES=0
SKIPPED_FILES=0
ERROR_FILES=0

###############################################################################
# Helper Functions
###############################################################################

print_usage() {
    cat << EOF
Documentation Migration Script

Usage: $0 [OPTIONS]

Options:
    --dry-run       Preview changes without executing (recommended first run)
    --verbose, -v   Show detailed output
    --help, -h      Show this help message

Examples:
    # Preview migration
    $0 --dry-run

    # Execute migration
    $0

    # Verbose dry-run
    $0 --dry-run --verbose

Migration will read from: $MAPPING_FILE
Logs will be written to: $LOG_FILE
EOF
}

log() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message" | tee -a "$LOG_FILE"
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

    # Check for required commands
    local deps=("jq" "git")
    for cmd in "${deps[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "Required command not found: $cmd"
            echo "Please install $cmd and try again"
            exit 1
        fi
    done

    # Check for mapping file
    if [[ ! -f "$MAPPING_FILE" ]]; then
        log_error "Mapping file not found: $MAPPING_FILE"
        exit 1
    fi

    # Validate JSON syntax
    if ! jq empty "$MAPPING_FILE" 2>/dev/null; then
        log_error "Invalid JSON in mapping file"
        exit 1
    fi

    log_success "All dependencies satisfied"
}

ensure_directory_exists() {
    local dir="$1"
    if [[ ! -d "$dir" ]]; then
        if [[ "$DRY_RUN" == true ]]; then
            log_info "[DRY-RUN] Would create directory: $dir"
        else
            mkdir -p "$dir"
            log_success "Created directory: $dir"
        fi
    fi
}

execute_git_mv() {
    local from="$1"
    local to="$2"
    local action="$3"

    # Expand to full paths
    local from_path="$PROJECT_ROOT/$from"
    local to_path="$PROJECT_ROOT/$to"

    # Check if source file exists
    if [[ ! -f "$from_path" ]]; then
        log_warning "Source file not found: $from"
        ((SKIPPED_FILES++))
        return 1
    fi

    # Ensure target directory exists
    local to_dir="$(dirname "$to_path")"
    ensure_directory_exists "$to_dir"

    # Detect case-only rename (e.g., UPPERCASE.md → uppercase.md)
    local is_case_rename=false
    local from_lower=$(echo "$from" | tr '[:upper:]' '[:lower:]')
    local to_lower=$(echo "$to" | tr '[:upper:]' '[:lower:]')
    if [[ "$from_lower" == "$to_lower" ]] && [[ "$from" != "$to" ]]; then
        is_case_rename=true
    fi

    # Check if target file already exists (skip check for case-only renames)
    if [[ -f "$to_path" ]] && [[ "$from_path" != "$to_path" ]] && [[ "$is_case_rename" == false ]]; then
        log_warning "Target file already exists: $to"
        log_warning "  Skipping: $from → $to"
        ((SKIPPED_FILES++))
        return 1
    fi

    # Execute or simulate git mv
    if [[ "$DRY_RUN" == true ]]; then
        if [[ "$is_case_rename" == true ]]; then
            echo -e "${BLUE}[DRY-RUN]${NC} git mv $from ${from}.tmp && git mv ${from}.tmp $to ${YELLOW}(case-only rename)${NC}"
            ((MOVED_FILES++))
            ((RENAMED_FILES++))
        else
            echo -e "${BLUE}[DRY-RUN]${NC} git mv $from $to"
            case "$action" in
                "archive")
                    ((ARCHIVED_FILES++))
                    ;;
                "move")
                    ((MOVED_FILES++))
                    # Check if it's a rename (not case-only, already counted above)
                    if [[ "$from" != "$to" ]] && [[ "$from_lower" != "$to_lower" ]]; then
                        ((RENAMED_FILES++))
                    fi
                    ;;
                *)
                    ((MOVED_FILES++))
                    ;;
            esac
        fi
        [[ "$VERBOSE" == true ]] && echo "          Action: $action"
    else
        # Handle case-only renames with two-step process
        if [[ "$is_case_rename" == true ]]; then
            local temp_path="${from_path}.tmp"
            if git mv "$from_path" "$temp_path" 2>/dev/null && git mv "$temp_path" "$to_path" 2>/dev/null; then
                log_success "Moved (case-rename): $from → $to"
                ((MOVED_FILES++))
                ((RENAMED_FILES++))
            else
                log_error "Failed to move (case-rename): $from → $to"
                ((ERROR_FILES++))
                return 1
            fi
        elif git mv "$from_path" "$to_path" 2>/dev/null; then
            log_success "Moved: $from → $to"
            case "$action" in
                "archive")
                    ((ARCHIVED_FILES++))
                    ;;
                "move")
                    ((MOVED_FILES++))
                    # Check if it's a rename (not case-only, already counted above)
                    if [[ "$from" != "$to" ]] && [[ "$from_lower" != "$to_lower" ]]; then
                        ((RENAMED_FILES++))
                    fi
                    ;;
                *)
                    ((MOVED_FILES++))
                    ;;
            esac
        else
            log_error "Failed to move: $from → $to"
            ((ERROR_FILES++))
            return 1
        fi
    fi

    ((TOTAL_FILES++))
    return 0
}

process_migrations() {
    log_info "Processing migrations..."

    # Read migrations from JSON
    local migrations_count=$(jq '.migrations | length' "$MAPPING_FILE")
    log_info "Found $migrations_count migration entries"

    # Iterate through migrations
    for i in $(seq 0 $((migrations_count - 1))); do
        local entry=$(jq -r ".migrations[$i]" "$MAPPING_FILE")

        # Skip comment-only entries
        local has_from=$(echo "$entry" | jq -r 'has("from")')
        if [[ "$has_from" != "true" ]]; then
            continue
        fi

        local from=$(echo "$entry" | jq -r '.from')
        local to=$(echo "$entry" | jq -r '.to')
        local action=$(echo "$entry" | jq -r '.action // "move"')

        # Handle wildcard patterns (e.g., sessions/daily/*.md)
        if [[ "$from" == *"*"* ]]; then
            local pattern="${from//\*/}"
            local base_dir=$(dirname "$pattern")
            log_info "Processing pattern: $from"

            # Find matching files
            find "$PROJECT_ROOT/$base_dir" -name "*.md" -type f 2>/dev/null | while read -r file; do
                local rel_path="${file#$PROJECT_ROOT/}"
                execute_git_mv "$rel_path" "$to" "$action"
            done
        else
            # Single file migration
            execute_git_mv "$from" "$to" "$action"
        fi
    done
}

print_summary() {
    echo ""
    echo "========================================="
    echo "         Migration Summary"
    echo "========================================="
    echo "Total files processed:     $TOTAL_FILES"
    echo "Successfully moved:        $MOVED_FILES"
    echo "Archived:                  $ARCHIVED_FILES"
    echo "Renamed (case change):     $RENAMED_FILES"
    echo "Skipped (already exists):  $SKIPPED_FILES"
    echo "Errors:                    $ERROR_FILES"
    echo "========================================="

    if [[ "$DRY_RUN" == true ]]; then
        echo ""
        echo -e "${YELLOW}DRY-RUN MODE:${NC} No files were actually moved"
        echo "Run without --dry-run to execute migration"
    else
        echo ""
        echo "Log file: $LOG_FILE"

        if [[ $ERROR_FILES -gt 0 ]]; then
            echo -e "${RED}⚠ Migration completed with errors${NC}"
            echo "Please review the log file for details"
            exit 1
        elif [[ $MOVED_FILES -gt 0 ]]; then
            echo -e "${GREEN}✓ Migration completed successfully${NC}"
            echo ""
            echo "Next steps:"
            echo "  1. Review changes: git status"
            echo "  2. Test documentation structure"
            echo "  3. Commit changes: git commit -m 'docs: restructure documentation'"
        else
            echo "No files were moved (all files may already be in correct locations)"
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

    # Print header
    echo "========================================="
    echo "  Documentation Migration Script"
    echo "========================================="
    echo "Mode: $([ "$DRY_RUN" == true ] && echo "DRY-RUN (preview only)" || echo "EXECUTE (will move files)")"
    echo "Project: $PROJECT_ROOT"
    echo "Mapping: $MAPPING_FILE"
    echo "========================================="
    echo ""

    # Initialize log
    log "=== Documentation Migration Started ==="
    log "Mode: $([ "$DRY_RUN" == true ] && echo "DRY-RUN" || echo "EXECUTE")"
    log "User: $(whoami)"
    log "Time: $(date)"

    # Check dependencies
    check_dependencies

    # Process migrations
    process_migrations

    # Print summary
    print_summary

    log "=== Documentation Migration Completed ==="
}

# Run main function
main "$@"
