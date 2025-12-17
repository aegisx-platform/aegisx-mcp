#!/bin/bash

# API Contract Generator Helper Script
# Quick contract generation from command line

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}API Contract Generator${NC}"
echo "========================"
echo ""

# Check if feature name provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 <feature-name> [options]"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --dry-run    Preview what would be generated without creating files"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 departments"
    echo "  $0 users --dry-run"
    echo ""
    echo -e "${YELLOW}Available features with routes:${NC}"
    find "$PROJECT_ROOT/apps/api/src" -name "*routes.ts" | sed 's/.*\///' | sed 's/.routes.ts//' | sort | sed 's/^/  - /'
    exit 1
fi

FEATURE_NAME="$1"
DRY_RUN=false

if [ "$2" == "--dry-run" ]; then
    DRY_RUN=true
fi

echo -e "${BLUE}Feature:${NC} $FEATURE_NAME"
echo ""

# Find route file
echo -e "${YELLOW}[1/4]${NC} Searching for route files..."
ROUTE_FILE=$(find "$PROJECT_ROOT/apps/api/src" -name "*${FEATURE_NAME}*.routes.ts" | head -1)

if [ -z "$ROUTE_FILE" ]; then
    echo -e "${RED}Error:${NC} Route file not found for feature '$FEATURE_NAME'"
    echo ""
    echo "Tried searching for: *${FEATURE_NAME}*.routes.ts"
    echo ""
    echo -e "${YELLOW}Tip:${NC} Use Claude for better analysis:"
    echo "  \"Claude, generate API contract for $FEATURE_NAME\""
    exit 1
fi

echo -e "${GREEN}✓${NC} Found: $(basename $ROUTE_FILE)"
echo "  Path: $ROUTE_FILE"
echo ""

# Check for schemas
echo -e "${YELLOW}[2/4]${NC} Looking for TypeBox schemas..."
SCHEMA_COUNT=$(grep -c "Type\\.Object" "$ROUTE_FILE" || echo "0")
echo -e "${GREEN}✓${NC} Found $SCHEMA_COUNT schema definitions"
echo ""

# Determine output path
echo -e "${YELLOW}[3/4]${NC} Determining output location..."
OUTPUT_DIR="$PROJECT_ROOT/docs/features/$FEATURE_NAME"
OUTPUT_FILE="$OUTPUT_DIR/API_CONTRACTS.md"

if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}⚠${NC}  Contract already exists: $OUTPUT_FILE"
    echo ""
    if [ "$DRY_RUN" = false ]; then
        read -p "Overwrite existing file? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Cancelled."
            exit 0
        fi
    fi
else
    echo -e "${GREEN}✓${NC} Will create: $OUTPUT_FILE"
fi
echo ""

# Generate contract
echo -e "${YELLOW}[4/4]${NC} Generation recommendation..."
echo ""
echo -e "${BLUE}This is a basic helper script.${NC}"
echo -e "For complete and accurate contract generation, use Claude:"
echo ""
echo -e "${GREEN}Recommended command:${NC}"
echo "  \"Claude, generate API contract for $FEATURE_NAME\""
echo ""
echo -e "${BLUE}Why use Claude?${NC}"
echo "  • Analyzes complex route structures"
echo "  • Extracts schema validations"
echo "  • Documents authentication requirements"
echo "  • Generates example requests/responses"
echo "  • Follows project documentation standards"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN]${NC} No files created."
    echo ""
    echo -e "${BLUE}Would create:${NC}"
    echo "  Output: $OUTPUT_FILE"
    echo "  Source: $ROUTE_FILE"
    exit 0
fi

# Offer to create minimal placeholder
echo -e "${YELLOW}Would you like to create a minimal placeholder?${NC}"
echo "(This will need manual completion or Claude generation)"
echo ""
read -p "Create placeholder? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    mkdir -p "$OUTPUT_DIR"

    cat > "$OUTPUT_FILE" <<EOF
# ${FEATURE_NAME^} API Contracts

> **TODO:** Generate complete contract using Claude
>
> Run: "Claude, generate API contract for $FEATURE_NAME"

## Source

**Route Implementation:** \`${ROUTE_FILE#$PROJECT_ROOT/}\`

## Base URL

\`/api/v1/$FEATURE_NAME\`

## Authentication

[TODO: Document authentication requirements]

## Endpoints

[TODO: Document all endpoints]

### Example Endpoint Structure

**Endpoint:** \`GET /api/v1/$FEATURE_NAME\`

**Description:** [TODO: Add description]

**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Success"
}
\`\`\`

---

## Next Steps

1. Ask Claude to generate complete contract:
   \`\`\`
   "Claude, generate API contract for $FEATURE_NAME"
   \`\`\`

2. Review and customize generated documentation

3. Validate implementation matches:
   \`\`\`
   "Claude, validate the $FEATURE_NAME API"
   \`\`\`

EOF

    echo ""
    echo -e "${GREEN}✓ Created placeholder:${NC} $OUTPUT_FILE"
    echo ""
    echo -e "${YELLOW}Next step:${NC}"
    echo "  Ask Claude to generate the complete contract"
else
    echo ""
    echo "No files created."
fi

echo ""
echo -e "${GREEN}Done!${NC}"
