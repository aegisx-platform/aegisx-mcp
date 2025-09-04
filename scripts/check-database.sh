#!/bin/bash
# Database Schema Check Script
# Usage: ./scripts/check-database.sh [module_name]

set -e

MODULE_NAME=${1:-}
if [ -z "$MODULE_NAME" ]; then
    echo "❌ Usage: ./scripts/check-database.sh [module_name]"
    echo "   Example: ./scripts/check-database.sh users"
    exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo -e "${BLUE}🔍 Database Schema Check for: $MODULE_NAME${NC}"
echo "=================================================="

# Check if DATABASE_URL exists
if [ -z "$DATABASE_URL" ]; then
    print_status "ERROR" "DATABASE_URL environment variable not set"
    print_status "INFO" "Set it in .env file or export DATABASE_URL='postgresql://...'"
    exit 1
fi

# Test database connection
echo -e "\n${BLUE}Step 1: Database Connection${NC}"
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    print_status "SUCCESS" "Database connection successful"
else
    print_status "ERROR" "Cannot connect to database"
    print_status "INFO" "Make sure PostgreSQL is running: docker-compose up -d postgres"
    exit 1
fi

# Check if migrations table exists
echo -e "\n${BLUE}Step 2: Migrations Check${NC}"
if psql "$DATABASE_URL" -c "\d knex_migrations" > /dev/null 2>&1; then
    print_status "SUCCESS" "Migrations system is set up"
    
    # Check latest migration status
    LATEST_MIGRATION=$(psql "$DATABASE_URL" -t -c "SELECT name FROM knex_migrations ORDER BY id DESC LIMIT 1;" | xargs)
    if [ -n "$LATEST_MIGRATION" ]; then
        print_status "INFO" "Latest migration: $LATEST_MIGRATION"
    fi
else
    print_status "WARNING" "Migration system not initialized"
    print_status "INFO" "Run: npx knex migrate:latest"
fi

# Check if module table exists
TABLE_NAME="${MODULE_NAME}s"
echo -e "\n${BLUE}Step 3: Module Table Check${NC}"
if psql "$DATABASE_URL" -c "\d $TABLE_NAME" > /dev/null 2>&1; then
    print_status "SUCCESS" "Table '$TABLE_NAME' exists"
    
    # Show table structure
    print_status "INFO" "Table structure:"
    psql "$DATABASE_URL" -c "\d+ $TABLE_NAME" | head -20
    
    # Count records
    RECORD_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $TABLE_NAME;" | xargs)
    print_status "INFO" "Records in $TABLE_NAME: $RECORD_COUNT"
    
else
    print_status "ERROR" "Table '$TABLE_NAME' does not exist"
    print_status "INFO" "Create migration: npx knex migrate:make create_${TABLE_NAME}_table"
    exit 1
fi

# Check for required columns (common ones)
echo -e "\n${BLUE}Step 4: Required Columns Check${NC}"
REQUIRED_COLUMNS=("id" "created_at" "updated_at")
for col in "${REQUIRED_COLUMNS[@]}"; do
    if psql "$DATABASE_URL" -c "\d $TABLE_NAME" | grep -q "$col"; then
        print_status "SUCCESS" "Column '$col' exists"
    else
        print_status "WARNING" "Column '$col' missing (recommended)"
    fi
done

# Test basic CRUD operations
echo -e "\n${BLUE}Step 5: Basic CRUD Test${NC}"
TEST_ID=$(uuidgen 2>/dev/null || echo "test-$(date +%s)")

# Test INSERT (with minimal data)
if psql "$DATABASE_URL" -c "INSERT INTO $TABLE_NAME (id) VALUES ('$TEST_ID') ON CONFLICT (id) DO NOTHING;" > /dev/null 2>&1; then
    print_status "SUCCESS" "INSERT operation works"
    
    # Test SELECT
    if psql "$DATABASE_URL" -c "SELECT id FROM $TABLE_NAME WHERE id = '$TEST_ID';" > /dev/null 2>&1; then
        print_status "SUCCESS" "SELECT operation works"
    else
        print_status "WARNING" "SELECT operation failed"
    fi
    
    # Test UPDATE
    if psql "$DATABASE_URL" -c "UPDATE $TABLE_NAME SET updated_at = NOW() WHERE id = '$TEST_ID';" > /dev/null 2>&1; then
        print_status "SUCCESS" "UPDATE operation works"
    else
        print_status "WARNING" "UPDATE operation failed (updated_at column missing?)"
    fi
    
    # Test DELETE (clean up)
    if psql "$DATABASE_URL" -c "DELETE FROM $TABLE_NAME WHERE id = '$TEST_ID';" > /dev/null 2>&1; then
        print_status "SUCCESS" "DELETE operation works"
    else
        print_status "WARNING" "DELETE operation failed"
    fi
    
else
    print_status "ERROR" "INSERT operation failed - check table schema"
    print_status "INFO" "Table might need required columns or constraints"
fi

# Summary
echo -e "\n${GREEN}=================================================="
print_status "SUCCESS" "Database check completed for '$MODULE_NAME'"
echo -e "${GREEN}==================================================${NC}"

print_status "INFO" "Next steps:"
echo "  1. If table missing: Create migration"
echo "  2. If columns missing: Add to migration"
echo "  3. Run: npx knex migrate:latest"
echo "  4. Run: npx knex seed:run (if needed)"
echo ""
print_status "INFO" "Quick commands:"
echo "  npx knex migrate:make create_${TABLE_NAME}_table"
echo "  npx knex seed:make ${MODULE_NAME}_seed"