# Enhanced CRUD Generator - Troubleshooting Guide

> **🔧 Common issues and solutions for the Enhanced CRUD Generator**

## 🚨 Quick Diagnostic Commands

```bash
# 1. Check generator availability
node tools/crud-generator/index.js --help

# 2. Verify database connection
psql $DATABASE_URL -c "SELECT version();"

# 3. Check project structure
ls -la tools/crud-generator/templates/domain/

# 4. Test API build
nx run api:build

# 5. Verify base schemas
cat apps/api/src/schemas/base.schemas.ts | grep -E "(export|Schema)"
```

---

## 🔴 Generation Issues

### ❌ Error: "Table not found"

**Problem:**

```bash
$ node tools/crud-generator/index.js generate missing_table
Error: Table 'missing_table' not found in database
```

**Solutions:**

1. **Check table exists:**

```bash
psql $DATABASE_URL -c "\dt"  # List all tables
psql $DATABASE_URL -c "\d your_table_name"  # Describe specific table
```

2. **Verify database connection:**

```bash
# Test connection
psql $DATABASE_URL -c "SELECT current_database();"

# Check environment variables
echo $DATABASE_URL
```

3. **Check schema/case sensitivity:**

```bash
# PostgreSQL table names are case-sensitive
psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

---

### ❌ Error: "Command not found"

**Problem:**

```bash
$ node tools/crud-generator/index.js generate users
/bin/sh: tools/crud-generator/index.js: No such file or directory
```

**Solutions:**

1. **Verify current directory:**

```bash
pwd  # Should end with 'aegisx-starter-1'
ls tools/  # Should see 'crud-generator' directory
```

2. **Check file permissions:**

```bash
ls -la tools/crud-generator/index.js
chmod +x tools/crud-generator/index.js  # If needed
```

3. **Use absolute path:**

```bash
node /full/path/to/tools/crud-generator/index.js generate users
```

---

### ❌ Error: "Invalid package level"

**Problem:**

```bash
$ node tools/crud-generator/index.js generate users --package=invalid
Error: Invalid package level 'invalid'. Must be one of: standard, enterprise, full
```

**Solution:**

```bash
# Use valid package levels
node tools/crud-generator/index.js generate users --package=standard
node tools/crud-generator/index.js generate users --package=enterprise
node tools/crud-generator/index.js generate users --package=full
```

---

## 🔵 File Generation Issues

### ❌ Error: "Permission denied writing files"

**Problem:**

```bash
Error: EACCES: permission denied, open 'apps/api/src/modules/users/controller.ts'
```

**Solutions:**

1. **Check directory permissions:**

```bash
ls -la apps/api/src/modules/
mkdir -p apps/api/src/modules/users  # Create if missing
chmod 755 apps/api/src/modules/users
```

2. **Check file ownership:**

```bash
sudo chown -R $USER:$USER apps/api/src/modules/
```

3. **Use force flag for overwriting:**

```bash
node tools/crud-generator/index.js generate users --force
```

---

### ❌ Error: "Files generated in wrong directory"

**Problem:**
Files appear in `tools/crud-generator/apps/` instead of `apps/`

**Solution:**

1. **Verify you're in project root:**

```bash
pwd  # Should end with aegisx-starter-1
ls | grep -E "(apps|tools|package.json)"  # Should see all three
```

2. **Clean up wrong directory:**

```bash
rm -rf tools/crud-generator/apps/
```

3. **Regenerate from correct location:**

```bash
cd /path/to/aegisx-starter-1  # Go to project root
node tools/crud-generator/index.js generate users --force
```

---

## 🟡 TypeScript Build Errors

### ❌ Error: "Cannot find module or type declarations"

**Problem:**

```bash
apps/api/src/modules/users/controllers/users.controller.ts:5:23
Error: Cannot find module '../../../schemas/base.schemas'
```

**Solutions:**

1. **Check base schemas exist:**

```bash
ls -la apps/api/src/schemas/base.schemas.ts
```

2. **Verify schema exports:**

```bash
grep "export" apps/api/src/schemas/base.schemas.ts | head -10
```

3. **Check TypeScript paths:**

```bash
cat tsconfig.json | grep -A 5 "paths"
```

4. **Regenerate with correct structure:**

```bash
node tools/crud-generator/index.js generate users --package=standard --force
nx run api:build
```

---

### ❌ Error: "Type 'unknown' is not assignable to parameter"

**Problem:**

```typescript
Error: Argument of type 'unknown' is not assignable to parameter of type 'BulkCreateRequest'
```

**Solutions:**

1. **Check generated types match schemas:**

```bash
# Compare controller and schema types
grep -A 5 "BulkCreateRequest" apps/api/src/modules/users/controllers/users.controller.ts
grep -A 5 "BulkCreateSchema" apps/api/src/schemas/base.schemas.ts
```

2. **Fix type annotations manually:**

```typescript
// In controller, replace:
request: FastifyRequest<{ Body: unknown }>;

// With proper typing:
request: FastifyRequest<{
  Body: {
    items: Static<typeof CreateUsersSchema>[];
    options?: { continueOnError?: boolean };
  };
}>;
```

3. **Regenerate with latest templates:**

```bash
node tools/crud-generator/index.js generate users --package=enterprise --force
```

---

### ❌ Error: "Property does not exist on type"

**Problem:**

```typescript
Error: Property 'items' does not exist on type '{}'
```

**Solution:**

This usually means the request body typing is incorrect. Check the controller method signatures match the route schemas:

```typescript
// Route schema should match controller typing
// In routes/index.ts:
body: BulkCreateSchema(CreateUsersSchema),

// In controller:
request: FastifyRequest<{ Body: Static<typeof BulkCreateSchema<typeof CreateUsersSchema>> }>
```

---

## 🟢 Database & Migration Issues

### ❌ Error: "Migration file syntax error"

**Problem:**

```bash
SyntaxError: The requested module 'knex' does not provide an export named 'Knex'
```

**Solutions:**

1. **Check migration import:**

```typescript
// Wrong:
import { Knex } from 'knex';

// Correct:
import Knex from 'knex';
```

2. **Fix migration template:**

```bash
# Find and fix all migration files
find apps/api/src/database/migrations -name "*permissions.ts" -exec sed -i 's/import { Knex }/import Knex/g' {} \;
```

3. **Regenerate migration:**

```bash
rm apps/api/src/database/migrations/*users_permissions.ts
node tools/crud-generator/index.js generate users --package=enterprise --force
```

---

### ❌ Error: "Duplicate migration files"

**Problem:**
Multiple migration files with similar names exist

**Solution:**

1. **List duplicate migrations:**

```bash
ls apps/api/src/database/migrations/*permissions.ts
```

2. **Remove older duplicates:**

```bash
# Keep the latest timestamp, remove others
rm apps/api/src/database/migrations/20240101_old_permissions.ts
```

3. **Run migration:**

```bash
npm run db:migrate
```

---

### ❌ Error: "Permission denied for table"

**Problem:**

```sql
ERROR: permission denied for table users
```

**Solutions:**

1. **Check database user permissions:**

```sql
-- Connect as superuser and grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

2. **Verify database connection string:**

```bash
echo $DATABASE_URL
# Should include correct username with permissions
```

---

## 🟠 Runtime Errors

### ❌ Error: "Cannot read properties of undefined"

**Problem:**

```bash
TypeError: Cannot read properties of undefined (reading 'findMany')
```

**Solutions:**

1. **Check service dependency injection:**

```typescript
// In index.ts, ensure proper service instantiation:
const repository = new UsersRepository(fastify.knex);
const service = new UsersService(repository); // Repository must be passed
const controller = new UsersController(service);
```

2. **Verify module registration:**

```typescript
// Check that knex plugin is registered before the module
await fastify.register(knexPlugin);
await fastify.register(usersModule);
```

3. **Check constructor calls:**

```typescript
// Controller constructor should receive service
constructor(private usersService: UsersService) {}
```

---

### ❌ Error: "Route already registered"

**Problem:**

```bash
Error: Route GET:/api/users already registered
```

**Solutions:**

1. **Check for duplicate registrations:**

```bash
grep -r "register.*users" apps/api/src/
```

2. **Use unique prefixes:**

```typescript
await fastify.register(usersModule, { prefix: '/api/users' });
// Don't register the same module twice
```

3. **Clear module cache during development:**

```bash
# Restart the dev server
npm run api:dev
```

---

## 🔧 Development Issues

### ❌ Error: "Template compilation failed"

**Problem:**

```bash
Error compiling template: Expected "," but found "}"
```

**Solutions:**

1. **Check template syntax:**

```bash
# Validate Handlebars templates
node -e "
const fs = require('fs');
const Handlebars = require('handlebars');
const template = fs.readFileSync('tools/crud-generator/templates/domain/controller.hbs', 'utf8');
try {
  Handlebars.compile(template);
  console.log('Template is valid');
} catch (error) {
  console.error('Template error:', error.message);
}
"
```

2. **Fix template escaping:**

```handlebars
{{!-- Wrong --}}
{{#if package === 'enterprise'}}

{{!-- Correct --}}
{{#if (eq package 'enterprise')}}
```

---

### ❌ Error: "Context variable undefined"

**Problem:**
Generated files have `undefined` values where variables should be

**Solutions:**

1. **Check context building:**

```javascript
// In generator.js, verify context includes all required fields
const context = {
  tableName,
  className: pascalCase(tableName),
  package: options.package,
  hasStatusField: analysis.hasStatusField,
  // ... ensure all template variables are defined
};
```

2. **Debug template context:**

```javascript
// Add debug logging in generator
console.log('Template context:', JSON.stringify(context, null, 2));
```

---

## 🔍 Performance Issues

### ❌ Error: "Generation taking too long"

**Problem:**
Generator hangs or takes excessive time

**Solutions:**

1. **Check database connection:**

```bash
# Test connection speed
time psql $DATABASE_URL -c "SELECT 1;"
```

2. **Optimize database queries:**

```sql
-- Check for slow queries during generation
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE query LIKE '%information_schema%'
ORDER BY mean_time DESC;
```

3. **Use connection pooling:**

```javascript
// In knex-connection.js
const knex = require('knex')({
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  pool: { min: 1, max: 5 }, // Limit connections
});
```

---

## 📊 Testing Issues

### ❌ Error: "Generated tests failing"

**Problem:**

```bash
npm run test
FAIL apps/api/src/modules/users/__tests__/users.test.ts
```

**Solutions:**

1. **Check test data matches schemas:**

```typescript
// Ensure test data includes only schema-defined fields
const testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  // Don't include: id, created_at, updated_at (auto-generated)
};
```

2. **Verify test app setup:**

```typescript
// Ensure test app includes required plugins
await app.register(knexPlugin);
await app.register(authPlugin);
await app.register(usersModule);
```

3. **Update test assertions:**

```typescript
// Check response structure matches API spec
expect(response.body).toMatchObject({
  success: true,
  data: expect.objectContaining({
    id: expect.any(String),
    name: 'John Doe',
  }),
});
```

---

## 🆘 Emergency Recovery

### Complete Reset Procedure

If everything is broken and you need to start fresh:

```bash
# 1. Backup any custom changes
cp -r apps/api/src/modules/users apps/api/src/modules/users.backup

# 2. Remove generated module
rm -rf apps/api/src/modules/users

# 3. Remove migration files
rm apps/api/src/database/migrations/*users_permissions.ts

# 4. Regenerate from scratch
node tools/crud-generator/index.js generate users --package=standard --force

# 5. Test build
nx run api:build

# 6. Run tests
nx run api:test --testPathPattern=users

# 7. Apply migrations
npm run db:migrate
```

### Clean Environment Setup

```bash
# Complete environment reset
git clean -fdx  # Remove all untracked files
pnpm install    # Reinstall dependencies
nx reset        # Clear Nx cache
npm run docker:down && npm run docker:up  # Reset database
npm run db:migrate && npm run db:seed     # Reset data
```

---

## 📞 Getting Help

### Debug Information to Collect

When seeking help, provide:

```bash
# 1. Environment info
node --version
npm --version
echo $DATABASE_URL | sed 's/:[^@]*@/:***@/'  # Hide password

# 2. Project structure
ls -la tools/crud-generator/
ls -la apps/api/src/modules/

# 3. Generation command and full error
node tools/crud-generator/index.js generate users --package=enterprise 2>&1

# 4. Build status
nx run api:build 2>&1

# 5. Recent git changes
git log --oneline -5
git status
```

### Useful Debug Commands

```bash
# Check all templates exist
find tools/crud-generator/templates -name "*.hbs" | wc -l

# Verify database table structure
psql $DATABASE_URL -c "\d+ your_table"

# Check generated file sizes
find apps/api/src/modules -name "*.ts" -exec wc -l {} \; | sort -n

# Test individual template rendering
node -e "
const Handlebars = require('handlebars');
const fs = require('fs');
const template = Handlebars.compile(fs.readFileSync('tools/crud-generator/templates/domain/controller.hbs', 'utf8'));
console.log(template({ tableName: 'test', package: 'standard' }).substring(0, 200));
"
```

---

**Related Documentation:**

- [User Guide](./USER_GUIDE.md) - Usage instructions
- [Developer Guide](./DEVELOPER_GUIDE.md) - Technical details
- [API Reference](./API_REFERENCE.md) - Endpoint documentation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production setup
