# คำสั่งทดสอบ Migrations แบบ Manual

## 1. ทดสอบพื้นฐาน

```bash
# ดู migration status
npx knex migrate:status

# ดู migration list
npx knex migrate:list

# Run migrations
npx knex migrate:latest

# Rollback ล่าสุด
npx knex migrate:rollback

# Run specific migration
npx knex migrate:up 001_create_roles_and_permissions.ts

# Rollback specific migration
npx knex migrate:down 003_create_sessions.ts
```

## 2. ทดสอบ Database Constraints

### Test Unique Constraints

```sql
-- ทดสอบ email ซ้ำ (ควร error)
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "
INSERT INTO users (email, username, password)
VALUES ('admin@aegisx.local', 'newuser', 'password');
"

-- ทดสอบ username ซ้ำ (ควร error)
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "
INSERT INTO users (email, username, password)
VALUES ('new@email.com', 'admin', 'password');
"
```

### Test Foreign Key Constraints

```sql
-- ทดสอบใส่ user_id ที่ไม่มีอยู่ (ควร error)
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "
INSERT INTO user_sessions (user_id, refresh_token, expires_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'test_token', NOW() + INTERVAL '7 days');
"
```

### Test Cascade Delete

```sql
-- สร้าง test user
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "
INSERT INTO users (email, username, password)
VALUES ('test@delete.com', 'testdelete', 'password')
RETURNING id;
"

-- ลบ user (sessions ควรหายไปด้วย)
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "
DELETE FROM users WHERE email = 'test@delete.com';
"
```

## 3. ทดสอบ Performance Indexes

```sql
-- ดู execution plan สำหรับ query ที่ใช้ index
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'admin@aegisx.local';
"

-- ดู index ทั้งหมด
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
"
```

## 4. ทดสอบ Default Values

```sql
-- Test UUID generation
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "
INSERT INTO roles (name, description)
VALUES ('test_role', 'Test role')
RETURNING id;
"

-- Test timestamp defaults
docker exec aegisx_postgres psql -U postgres -d aegisx_db -c "
SELECT id, created_at, updated_at
FROM roles
WHERE name = 'test_role';
"
```

## 5. ทดสอบในสภาพแวดล้อมต่างๆ

```bash
# Test with different environments
NODE_ENV=test npx knex migrate:latest
NODE_ENV=production npx knex migrate:latest

# Test with wrong credentials (should fail)
DATABASE_PASSWORD=wrongpass npx knex migrate:latest
```
