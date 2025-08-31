#!/bin/bash

echo "🧪 Migration Test Script"
echo "========================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check result
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 - PASSED${NC}"
    else
        echo -e "${RED}❌ $1 - FAILED${NC}"
        exit 1
    fi
}

echo -e "\n${YELLOW}1. Testing Database Connection${NC}"
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "SELECT 1;" > /dev/null 2>&1
check_result "Database connection"

echo -e "\n${YELLOW}2. Testing Migration Status${NC}"
npx knex migrate:status > /dev/null 2>&1
check_result "Migration status check"

echo -e "\n${YELLOW}3. Testing Rollback${NC}"
npx knex migrate:rollback > /dev/null 2>&1
check_result "Migration rollback"

# Check if tables are dropped
TABLE_COUNT=$(docker exec aegisx_postgres psql -U postgres -d aegisx_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name NOT LIKE 'knex_%';")
if [ $TABLE_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ Tables dropped successfully${NC}"
else
    echo -e "${RED}❌ Tables not properly dropped${NC}"
fi

echo -e "\n${YELLOW}4. Testing Migration Up${NC}"
npx knex migrate:latest > /dev/null 2>&1
check_result "Migration up"

# Check if all tables exist
EXPECTED_TABLES=("users" "roles" "permissions" "role_permissions" "user_roles" "user_sessions")
for table in "${EXPECTED_TABLES[@]}"; do
    docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "SELECT 1 FROM $table LIMIT 1;" > /dev/null 2>&1
    check_result "Table '$table' exists"
done

echo -e "\n${YELLOW}5. Testing Seed Data${NC}"
npx knex seed:run > /dev/null 2>&1
check_result "Seed data"

# Verify admin user
ADMIN_EXISTS=$(docker exec aegisx_postgres psql -U postgres -d aegisx_db -t -c "SELECT COUNT(*) FROM users WHERE email = 'admin@aegisx.local';")
if [ $ADMIN_EXISTS -eq 1 ]; then
    echo -e "${GREEN}✅ Admin user created${NC}"
else
    echo -e "${RED}❌ Admin user not found${NC}"
fi

echo -e "\n${YELLOW}6. Testing Foreign Key Constraints${NC}"
# Try to insert user_role with non-existent user_id (should fail)
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "INSERT INTO user_roles (user_id, role_id) VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000');" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${GREEN}✅ Foreign key constraints working${NC}"
else
    echo -e "${RED}❌ Foreign key constraints not working${NC}"
fi

echo -e "\n${YELLOW}7. Testing Unique Constraints${NC}"
# Try to insert duplicate email (should fail)
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "INSERT INTO users (email, username, password) VALUES ('admin@aegisx.local', 'test', 'test');" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${GREEN}✅ Unique constraints working${NC}"
else
    echo -e "${RED}❌ Unique constraints not working${NC}"
fi

echo -e "\n${GREEN}✅ All migration tests completed!${NC}"