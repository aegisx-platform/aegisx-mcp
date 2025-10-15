# 🔧 CRUD Generator Troubleshooting Guide

> **Common issues, solutions, and debugging procedures for the CRUD generator system**

This guide provides comprehensive troubleshooting information for developers and system administrators working with the CRUD Generator.

## 🎯 Quick Diagnosis

### Health Check Commands

Run these commands to quickly diagnose system health:

```bash
# Check generator status
cd tools/crud-generator
node health-check.js

# Check database connection
node -e "
const knex = require('./src/knex-connection');
knex.raw('SELECT 1').then(() => console.log('✅ Database connected')).catch(err => console.error('❌ Database error:', err.message));
"

# Check template availability
ls -la templates/ frontend-templates/

# Check dependencies
pnpm list --depth=0

# Check generated modules build
nx build api
nx build web
```

### System Requirements Verification

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check pnpm version
pnpm --version  # Should be >= 8.0.0

# Check PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"

# Check available disk space
df -h

# Check memory usage
free -h  # Linux
top -l 1 | grep PhysMem  # macOS
```

## 🐛 Common Issues & Solutions

### 1. Generation Failures

#### Issue: "Table not found" Error

**Symptoms:**

```
Error: Table 'books' does not exist in database
    at SchemaInspector.analyzeTable
```

**Solutions:**

```bash
# 1. Verify table exists
psql $DATABASE_URL -c "\dt books"

# 2. Check database connection
psql $DATABASE_URL -c "SELECT current_database();"

# 3. Verify table name spelling (case sensitive)
psql $DATABASE_URL -c "\dt"

# 4. Check if migrations have been run
pnpm db:status
pnpm db:migrate

# 5. Verify user permissions
psql $DATABASE_URL -c "SELECT has_table_privilege('books', 'SELECT');"
```

#### Issue: "Template compilation failed" Error

**Symptoms:**

```
Error: Template compilation failed for 'list-component.hbs'
SyntaxError: Unexpected token '}'
```

**Solutions:**

```bash
# 1. Validate template syntax
node -e "
const fs = require('fs');
const Handlebars = require('handlebars');
const template = fs.readFileSync('./frontend-templates/list-component.hbs', 'utf8');
try {
  Handlebars.compile(template);
  console.log('✅ Template syntax valid');
} catch (err) {
  console.error('❌ Template error:', err.message);
}
"

# 2. Check for missing helpers
grep -r "{{[^{}]*}}" frontend-templates/ | grep -v "{{#\|{{/\|{{else"

# 3. Reset templates to default
git checkout HEAD -- frontend-templates/ templates/

# 4. Clear template cache
rm -rf .template-cache/
```

#### Issue: "TypeScript compilation errors" After Generation

**Symptoms:**

```
Error: Type 'string | undefined' is not assignable to type 'string'
```

**Solutions:**

```bash
# 1. Check generated type definitions
cat apps/web/src/app/features/books/types/books.types.ts

# 2. Verify schema alignment
node -e "
const schema = require('./src/database.js');
schema.getTableSchema('books').then(s => console.log(JSON.stringify(s, null, 2)));
"

# 3. Regenerate with force flag
node index.js generate books --package enhanced --force
node generate-frontend-direct.js books enhanced --force

# 4. Check TypeScript configuration
npx tsc --noEmit --project apps/web/tsconfig.json
```

### 2. Database Connection Issues

#### Issue: "Connection timeout" Error

**Symptoms:**

```
Error: Connection timeout expired
    at KnexTimeoutError
```

**Solutions:**

```bash
# 1. Check database server status
pg_isready -h localhost -p 5432

# 2. Verify connection string format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database

# 3. Test connection with timeout
timeout 10 psql $DATABASE_URL -c "SELECT 1;"

# 4. Check firewall/network connectivity
telnet localhost 5432

# 5. Increase timeout in configuration
# Edit src/knex-connection.js:
# acquireConnectionTimeout: 60000,
# timeout: 60000
```

#### Issue: "Permission denied" Error

**Symptoms:**

```
Error: permission denied for table books
```

**Solutions:**

```bash
# 1. Check user permissions
psql $DATABASE_URL -c "
SELECT
  schemaname,
  tablename,
  has_table_privilege(current_user, schemaname||'.'||tablename, 'SELECT') as can_select,
  has_table_privilege(current_user, schemaname||'.'||tablename, 'INSERT') as can_insert
FROM pg_tables
WHERE tablename = 'books';
"

# 2. Grant necessary permissions
psql $DATABASE_URL -c "
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO current_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO current_user;
"

# 3. Check role membership
psql $DATABASE_URL -c "\du"
```

### 3. Build and Compilation Issues

#### Issue: Angular Build Failures

**Symptoms:**

```
Error: Module not found: '@angular/material/...'
```

**Solutions:**

```bash
# 1. Install missing dependencies
pnpm install

# 2. Check package.json for missing Angular Material modules
grep -r "MatTableModule\|MatButtonModule" apps/web/src/

# 3. Update Angular Material imports in generated components
# Check if components import correct modules:
grep -r "from '@angular/material" apps/web/src/app/features/

# 4. Verify Angular version compatibility
pnpm list @angular/core @angular/material

# 5. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
pnpm install
```

#### Issue: API Build Failures

**Symptoms:**

```
Error: Cannot find module './types/books.types'
```

**Solutions:**

```bash
# 1. Check file structure
find apps/api/src/modules/books -name "*.ts" -type f

# 2. Verify import paths
grep -r "from '\\.\\./\\.\\./" apps/api/src/modules/books/

# 3. Check index.ts exports
cat apps/api/src/modules/books/index.ts

# 4. Regenerate with proper structure
rm -rf apps/api/src/modules/books
node index.js generate books --package enhanced

# 5. Verify TypeScript configuration
npx tsc --showConfig --project apps/api/tsconfig.json
```

### 4. Runtime Issues

#### Issue: "Cannot read property of undefined" in Frontend

**Symptoms:**

```
TypeError: Cannot read property 'status' of undefined
    at BookListComponent.loadData
```

**Solutions:**

```bash
# 1. Check API endpoint response format
curl -H "Authorization: Bearer $TOKEN" http://localhost:3333/api/books

# 2. Verify service method implementation
cat apps/web/src/app/features/books/services/books.service.ts

# 3. Check for proper error handling
grep -A 5 -B 5 "catch\|error" apps/web/src/app/features/books/

# 4. Add defensive programming
# Update component to handle undefined values:
# this.data()?.filter(item => item.status === 'active') || []

# 5. Check network requests in browser DevTools
# Open browser DevTools → Network tab → Check API responses
```

#### Issue: "404 Not Found" for Generated Endpoints

**Symptoms:**

```
GET /api/books 404 (Not Found)
```

**Solutions:**

```bash
# 1. Check if module is registered in API
grep -r "books" apps/api/src/bootstrap/

# 2. Verify route registration
cat apps/api/src/modules/books/routes/index.ts

# 3. Check plugin loading
grep -r "registerModule\|fastify.register" apps/api/src/

# 4. Restart API server
# Kill existing process and restart:
nx serve api

# 5. Check route registration in logs
# Look for "Registered routes" in API startup logs
```

### 5. Performance Issues

#### Issue: Slow Generation Performance

**Symptoms:**

- Generation takes > 30 seconds
- High memory usage during generation
- Template compilation timeouts

**Solutions:**

```bash
# 1. Enable performance monitoring
DEBUG=crud-generator:performance node index.js generate books

# 2. Check available memory
free -h  # Linux
vm_stat | grep "Pages free"  # macOS

# 3. Optimize database queries
# Add indexes for commonly queried tables:
psql $DATABASE_URL -c "
CREATE INDEX IF NOT EXISTS idx_information_schema_columns
ON information_schema.columns (table_name, column_name);
"

# 4. Clear caches
rm -rf .cache/ .template-cache/

# 5. Use faster disk (SSD) for temp files
export TMPDIR=/path/to/fast/storage
```

#### Issue: High Memory Usage in Frontend

**Symptoms:**

- Browser becomes unresponsive
- "Out of memory" errors in console
- Slow page loading

**Solutions:**

```bash
# 1. Check bundle size
nx build web --stats-json
npx webpack-bundle-analyzer dist/apps/web/stats.json

# 2. Implement virtual scrolling for large lists
# Update list component template:
# <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
#   <div *cdkVirtualFor="let item of data()">

# 3. Add pagination
# Check if pagination is properly implemented:
grep -r "paginator\|pageSize" apps/web/src/app/features/

# 4. Optimize change detection
# Use OnPush strategy in components:
# @Component({ changeDetection: ChangeDetectionStrategy.OnPush })

# 5. Check for memory leaks
# Use Angular DevTools to monitor component instances
```

## 🔍 Debugging Procedures

### Enable Debug Mode

```bash
# Set debug environment variables
export DEBUG=crud-generator:*
export LOG_LEVEL=debug
export NODE_ENV=development

# Run with detailed logging
node index.js generate books --package enhanced
```

### Database Query Debugging

```bash
# Enable query logging in PostgreSQL
# Add to postgresql.conf:
# log_statement = 'all'
# log_duration = on

# Or set per session:
psql $DATABASE_URL -c "SET log_statement = 'all';"

# Check slow queries
psql $DATABASE_URL -c "
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
"
```

### Template Debug Mode

```javascript
// Add to template debugging script: debug-template.js
const Handlebars = require('handlebars');
const fs = require('fs');

// Enable debug mode
Handlebars.logger.level = 0; // Log everything

// Load template
const template = fs.readFileSync('./frontend-templates/list-component.hbs', 'utf8');

// Mock context for debugging
const debugContext = {
  moduleName: 'books',
  ModuleName: 'Books',
  columns: [
    { name: 'id', jsType: 'string', isId: true },
    { name: 'title', jsType: 'string', isId: false },
    { name: 'status', jsType: 'string', constraints: ['available', 'checked_out'] },
  ],
  package: { features: { bulkOperations: true } },
};

// Compile and render
try {
  const compiled = Handlebars.compile(template);
  const result = compiled(debugContext);
  console.log('✅ Template rendered successfully');
  fs.writeFileSync('./debug-output.ts', result);
} catch (error) {
  console.error('❌ Template error:', error);
}
```

### API Endpoint Testing

```bash
# Create test script: test-api.sh
#!/bin/bash

API_BASE="http://localhost:3333/api"
TOKEN="your-jwt-token"

# Test endpoints
echo "Testing Books API endpoints..."

# Test list endpoint
echo "GET /books"
curl -s -H "Authorization: Bearer $TOKEN" "$API_BASE/books" | jq '.'

# Test create endpoint
echo "POST /books"
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Book","status":"available"}' \
  "$API_BASE/books" | jq '.'

# Test validation endpoint
echo "POST /books/validate"
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"","status":"invalid"}' \
  "$API_BASE/books/validate" | jq '.'

# Test stats endpoint
echo "GET /books/stats"
curl -s -H "Authorization: Bearer $TOKEN" "$API_BASE/books/stats" | jq '.'
```

### Frontend Component Testing

```typescript
// Create test file: debug-component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BookListComponent } from './books-list.component';
import { BookService } from '../services/books.service';

describe('BookListComponent Debug', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  let service: jasmine.SpyObj<BookService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('BookService', ['list', 'getStats']);

    TestBed.configureTestingModule({
      imports: [BookListComponent, HttpClientTestingModule],
      providers: [{ provide: BookService, useValue: spy }],
    });

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(BookService) as jasmine.SpyObj<BookService>;
  });

  it('should handle empty data gracefully', () => {
    service.list.and.returnValue(Promise.resolve({ data: [], pagination: {} }));

    fixture.detectChanges();

    expect(component.data()).toEqual([]);
    expect(component.loading()).toBeFalse();
  });

  it('should handle API errors', async () => {
    service.list.and.returnValue(Promise.reject(new Error('API Error')));

    await component.loadData();

    expect(component.loading()).toBeFalse();
    expect(component.error()).toBeTruthy();
  });
});
```

## 📊 Performance Analysis

### Generation Performance Profiling

```javascript
// Create profiling script: profile-generation.js
const { performance, PerformanceObserver } = require('perf_hooks');

const obs = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
  });
});
obs.observe({ entryTypes: ['measure'] });

async function profileGeneration() {
  performance.mark('generation-start');

  performance.mark('schema-analysis-start');
  // Schema analysis code here
  performance.mark('schema-analysis-end');
  performance.measure('Schema Analysis', 'schema-analysis-start', 'schema-analysis-end');

  performance.mark('template-compilation-start');
  // Template compilation code here
  performance.mark('template-compilation-end');
  performance.measure('Template Compilation', 'template-compilation-start', 'template-compilation-end');

  performance.mark('file-generation-start');
  // File generation code here
  performance.mark('file-generation-end');
  performance.measure('File Generation', 'file-generation-start', 'file-generation-end');

  performance.mark('generation-end');
  performance.measure('Total Generation', 'generation-start', 'generation-end');
}

profileGeneration();
```

### Memory Usage Analysis

```bash
# Monitor memory during generation
#!/bin/bash
# memory-monitor.sh

PID=""
OUTPUT_FILE="memory-usage.log"

echo "Timestamp,RSS,VSZ,CPU%" > $OUTPUT_FILE

# Start generation in background
node index.js generate books --package enhanced &
PID=$!

# Monitor memory usage
while kill -0 $PID 2>/dev/null; do
  MEMORY=$(ps -p $PID -o rss=,vsz=,pcpu= | tr -s ' ')
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$TIMESTAMP,$MEMORY" >> $OUTPUT_FILE
  sleep 1
done

echo "Memory monitoring complete. See $OUTPUT_FILE"
```

## 🔧 Recovery Procedures

### Corrupted Generation Recovery

```bash
#!/bin/bash
# recovery-procedure.sh

BACKUP_DIR="./backup-$(date +%Y%m%d_%H%M%S)"
MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
    echo "Usage: $0 <module_name>"
    exit 1
fi

echo "Starting recovery for module: $MODULE_NAME"

# 1. Backup current state
echo "Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r "apps/api/src/modules/$MODULE_NAME" "$BACKUP_DIR/api-$MODULE_NAME" 2>/dev/null || true
cp -r "apps/web/src/app/features/$MODULE_NAME" "$BACKUP_DIR/web-$MODULE_NAME" 2>/dev/null || true

# 2. Remove corrupted files
echo "Removing corrupted files..."
rm -rf "apps/api/src/modules/$MODULE_NAME"
rm -rf "apps/web/src/app/features/$MODULE_NAME"

# 3. Regenerate from scratch
echo "Regenerating module..."
cd tools/crud-generator
node index.js generate "$MODULE_NAME" --package enhanced --force
node generate-frontend-direct.js "$MODULE_NAME" enhanced --force

# 4. Verify generation
echo "Verifying build..."
cd ../..
if nx build api && nx build web; then
    echo "✅ Recovery successful"
    echo "Backup saved in: $BACKUP_DIR"
else
    echo "❌ Recovery failed. Restoring backup..."
    cp -r "$BACKUP_DIR/api-$MODULE_NAME" "apps/api/src/modules/$MODULE_NAME" 2>/dev/null || true
    cp -r "$BACKUP_DIR/web-$MODULE_NAME" "apps/web/src/app/features/$MODULE_NAME" 2>/dev/null || true
fi
```

### Database Schema Mismatch Recovery

```bash
#!/bin/bash
# schema-recovery.sh

TABLE_NAME=$1

if [ -z "$TABLE_NAME" ]; then
    echo "Usage: $0 <table_name>"
    exit 1
fi

echo "Recovering schema for table: $TABLE_NAME"

# 1. Backup current schema
pg_dump --schema-only --table="$TABLE_NAME" $DATABASE_URL > "schema-backup-$TABLE_NAME.sql"

# 2. Export current table data
pg_dump --data-only --table="$TABLE_NAME" $DATABASE_URL > "data-backup-$TABLE_NAME.sql"

# 3. Check table structure
psql $DATABASE_URL -c "\d $TABLE_NAME"

# 4. Run pending migrations
pnpm db:migrate

# 5. Verify table structure matches expectations
node -e "
const { getTableSchema } = require('./tools/crud-generator/src/database.js');
getTableSchema('$TABLE_NAME').then(schema => {
  console.log('Current schema:');
  console.log(JSON.stringify(schema, null, 2));
}).catch(err => {
  console.error('Schema error:', err.message);
});
"

echo "Schema recovery completed"
```

## 📚 Support Resources

### Log File Locations

```bash
# Application logs
tail -f logs/app.log
tail -f logs/error.log

# System logs
journalctl -u crud-generator -f  # systemd
tail -f /var/log/crud-generator.log

# Docker logs
docker logs -f crud-generator-container

# Kubernetes logs
kubectl logs -f deployment/crud-generator
```

### Useful Commands Reference

```bash
# Database operations
psql $DATABASE_URL -c "\l"           # List databases
psql $DATABASE_URL -c "\dt"          # List tables
psql $DATABASE_URL -c "\d table"     # Describe table
psql $DATABASE_URL -c "\df"          # List functions

# File operations
find . -name "*.hbs" -type f         # Find templates
find . -name "*.ts" -path "*/features/*" # Find generated files
grep -r "error\|Error" logs/         # Search logs for errors

# Process operations
ps aux | grep node                   # Find Node.js processes
netstat -tlnp | grep :3333          # Check port usage
lsof -i :3333                       # Check what's using port

# Git operations
git status --porcelain               # Check changes
git diff --name-only HEAD~1          # See changed files
git log --oneline -10                # Recent commits
```

### Getting Help

1. **Documentation**: Check the comprehensive documentation in `docs/features/crud-generator/`
2. **Issue Tracking**: Report bugs and feature requests in the project repository
3. **Community Support**: Join the AegisX community channels
4. **Professional Support**: Contact AegisX support for enterprise assistance

### Emergency Contacts

```yaml
Support Levels:
  Level 1 - General Issues:
    Email: support@aegisx.com
    Response: 24 hours

  Level 2 - Critical Issues:
    Email: critical@aegisx.com
    Phone: +1-555-AEGISX-1
    Response: 4 hours

  Level 3 - Emergency:
    Email: emergency@aegisx.com
    Phone: +1-555-AEGISX-911
    Response: 1 hour
    Available: 24/7
```

---

**This troubleshooting guide provides comprehensive solutions for common issues and debugging procedures for the CRUD Generator system.** 🔧

_Keep this guide handy for quick issue resolution and system maintenance._
