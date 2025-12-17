#!/bin/bash

# TypeBox Schema Generator Helper Script
# Quick schema generation from command line

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}TypeBox Schema Generator${NC}"
echo "=========================="
echo ""

# Check if table name provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 <table-name> [options]"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --dry-run          Preview what would be generated"
    echo "  --from-migration   Generate from migration file instead of database"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 departments"
    echo "  $0 employees --dry-run"
    echo "  $0 products --from-migration"
    echo ""
    echo -e "${YELLOW}Available tables:${NC}"
    if [ -f "$PROJECT_ROOT/.env.local" ]; then
        # Try to list tables from database
        DATABASE_URL=$(grep DATABASE_URL "$PROJECT_ROOT/.env.local" | cut -d '=' -f2- | tr -d '"')
        if [ -n "$DATABASE_URL" ]; then
            echo "  (Connecting to database...)"
            psql "$DATABASE_URL" -c "\dt" -t 2>/dev/null | awk '{print "  - " $3}' || echo "  (Could not connect to database)"
        fi
    else
        echo "  (Run from project root with .env.local configured)"
    fi
    exit 1
fi

TABLE_NAME="$1"
DRY_RUN=false
FROM_MIGRATION=false

# Parse options
shift
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --from-migration)
            FROM_MIGRATION=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}Table:${NC} $TABLE_NAME"
echo ""

# Step 1: Get table structure
echo -e "${YELLOW}[1/4]${NC} Getting table structure..."

if [ "$FROM_MIGRATION" = true ]; then
    # Find migration file
    MIGRATION_FILE=$(find "$PROJECT_ROOT/apps/api/migrations" -name "*.ts" | xargs grep -l "createTable.*['\"]$TABLE_NAME['\"]" | head -1)

    if [ -z "$MIGRATION_FILE" ]; then
        echo -e "${RED}Error:${NC} Migration file not found for table '$TABLE_NAME'"
        echo ""
        echo -e "${YELLOW}Tip:${NC} Use Claude for better analysis:"
        echo "  \"Claude, generate TypeBox schemas for $TABLE_NAME\""
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Found migration: $(basename $MIGRATION_FILE)"
    SOURCE="Migration file"
else
    # Try to connect to database
    if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
        echo -e "${RED}Error:${NC} .env.local not found"
        echo ""
        echo "Try using --from-migration option instead:"
        echo "  $0 $TABLE_NAME --from-migration"
        exit 1
    fi

    DATABASE_URL=$(grep DATABASE_URL "$PROJECT_ROOT/.env.local" | cut -d '=' -f2- | tr -d '"')

    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}Error:${NC} DATABASE_URL not found in .env.local"
        exit 1
    fi

    # Check if table exists
    TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$TABLE_NAME');" 2>/dev/null || echo "f")

    if [ "$TABLE_EXISTS" = " f" ]; then
        echo -e "${RED}Error:${NC} Table '$TABLE_NAME' not found in database"
        echo ""
        echo "Try using --from-migration option instead:"
        echo "  $0 $TABLE_NAME --from-migration"
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Found table in database"
    SOURCE="Database"
fi

echo ""

# Step 2: Determine output location
echo -e "${YELLOW}[2/4]${NC} Determining output location..."

# Try to guess feature location
FEATURE_DIRS=$(find "$PROJECT_ROOT/apps/api/src" -type d -name "*$TABLE_NAME*" | grep -v node_modules | grep -v ".backup" || echo "")

if [ -n "$FEATURE_DIRS" ]; then
    FEATURE_DIR=$(echo "$FEATURE_DIRS" | head -1)
    OUTPUT_DIR="$FEATURE_DIR/schemas"
else
    # Default location
    OUTPUT_DIR="$PROJECT_ROOT/apps/api/src/layers/platform/$TABLE_NAME/schemas"
fi

OUTPUT_FILE="$OUTPUT_DIR/$TABLE_NAME.schemas.ts"

if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}⚠${NC}  Schema file already exists: $OUTPUT_FILE"
else
    echo -e "${GREEN}✓${NC} Will create: $OUTPUT_FILE"
fi

echo ""

# Step 3: Show what would be generated
echo -e "${YELLOW}[3/4]${NC} Schema generation preview..."
echo ""
echo -e "${BLUE}Would generate:${NC}"
echo "  1. ${TABLE_NAME^}Schema - Complete database representation"
echo "  2. ${TABLE_NAME^}CreateSchema - For POST requests"
echo "  3. ${TABLE_NAME^}UpdateSchema - For PUT/PATCH requests"
echo "  4. ${TABLE_NAME^}QuerySchema - For GET query parameters"
echo "  5. ${TABLE_NAME^}ParamsSchema - For path parameters"
echo "  6. ${TABLE_NAME^}ResponseSchema - Single item response"
echo "  7. ${TABLE_NAME^}ListResponseSchema - Paginated list"
echo "  8. ${TABLE_NAME^}DropdownSchema - For dropdowns"
echo ""

# Step 4: Recommendation
echo -e "${YELLOW}[4/4]${NC} Generation recommendation..."
echo ""
echo -e "${BLUE}This is a basic helper script.${NC}"
echo -e "For complete and accurate schema generation, use Claude:"
echo ""
echo -e "${GREEN}Recommended command:${NC}"
echo "  \"Claude, generate TypeBox schemas for $TABLE_NAME\""
echo ""
echo -e "${BLUE}Why use Claude?${NC}"
echo "  • Analyzes database structure deeply"
echo "  • Maps all PostgreSQL types correctly"
echo "  • Adds proper validations (maxLength, patterns, etc.)"
echo "  • Handles nullable/optional fields"
echo "  • Generates all CRUD schemas"
echo "  • Adds helpful descriptions"
echo "  • Follows project standards"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN]${NC} No files created."
    echo ""
    echo -e "${BLUE}Would create:${NC}"
    echo "  Output: $OUTPUT_FILE"
    echo "  Source: $SOURCE"
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

    # Convert table name to PascalCase for type names
    TYPE_NAME=$(echo "$TABLE_NAME" | sed 's/_\([a-z]\)/\U\1/g' | sed 's/^\([a-z]\)/\U\1/')

    cat > "$OUTPUT_FILE" <<EOF
import { Type, Static } from '@sinclair/typebox';

// ============================================================================
// ${TYPE_NAME} Schemas
// ============================================================================

/**
 * TODO: Generate complete schemas using Claude
 *
 * Run: "Claude, generate TypeBox schemas for $TABLE_NAME"
 *
 * Source: $SOURCE
 */

/**
 * Base schema with all database fields
 */
export const ${TYPE_NAME}Schema = Type.Object({
  id: Type.Integer(),
  // TODO: Add all fields from database
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
});

export type ${TYPE_NAME} = Static<typeof ${TYPE_NAME}Schema>;

/**
 * Schema for creating new ${TABLE_NAME}
 */
export const ${TYPE_NAME}CreateSchema = Type.Object({
  // TODO: Add all fields (excluding id, timestamps)
});

export type ${TYPE_NAME}Create = Static<typeof ${TYPE_NAME}CreateSchema>;

/**
 * Schema for updating existing ${TABLE_NAME}
 */
export const ${TYPE_NAME}UpdateSchema = Type.Partial(
  Type.Object({
    // TODO: Add all updatable fields
  })
);

export type ${TYPE_NAME}Update = Static<typeof ${TYPE_NAME}UpdateSchema>;

/**
 * Schema for query parameters
 */
export const ${TYPE_NAME}QuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
  search: Type.Optional(Type.String()),
  sort_by: Type.Optional(Type.String()),
  sort_order: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ], { default: 'asc' })),
  // TODO: Add specific filter fields
});

export type ${TYPE_NAME}Query = Static<typeof ${TYPE_NAME}QuerySchema>;

/**
 * Schema for path parameters
 */
export const ${TYPE_NAME}ParamsSchema = Type.Object({
  id: Type.Integer({ description: '${TYPE_NAME} ID' }),
});

export type ${TYPE_NAME}Params = Static<typeof ${TYPE_NAME}ParamsSchema>;

/**
 * Schema for API response (single item)
 */
export const ${TYPE_NAME}ResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: ${TYPE_NAME}Schema,
  message: Type.String(),
});

export type ${TYPE_NAME}Response = Static<typeof ${TYPE_NAME}ResponseSchema>;

/**
 * Schema for API response (list with pagination)
 */
export const ${TYPE_NAME}ListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    items: Type.Array(${TYPE_NAME}Schema),
    pagination: Type.Object({
      page: Type.Integer(),
      limit: Type.Integer(),
      total: Type.Integer(),
      total_pages: Type.Integer(),
    }),
  }),
  message: Type.String(),
});

export type ${TYPE_NAME}ListResponse = Static<typeof ${TYPE_NAME}ListResponseSchema>;

/**
 * Schema for dropdown options
 */
export const ${TYPE_NAME}DropdownSchema = Type.Object({
  value: Type.Integer(),
  label: Type.String(),
});

export type ${TYPE_NAME}Dropdown = Static<typeof ${TYPE_NAME}DropdownSchema>;

// ============================================================================
// Next Steps:
// 1. Ask Claude to generate complete schemas
// 2. Use in routes: { schema: { body: ${TYPE_NAME}CreateSchema } }
// 3. Generate API contract
// ============================================================================
EOF

    echo ""
    echo -e "${GREEN}✓ Created placeholder:${NC} $OUTPUT_FILE"
    echo ""
    echo -e "${YELLOW}Next step:${NC}"
    echo "  Ask Claude to generate the complete schemas"
else
    echo ""
    echo "No files created."
fi

echo ""
echo -e "${GREEN}Done!${NC}"
