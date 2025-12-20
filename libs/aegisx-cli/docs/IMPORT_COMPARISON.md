# Import Architecture Comparison

**Detailed comparison between Generic Import and System Init Import**

---

## Quick Summary

| Aspect             | Generic Import                 | System Init Import            |
| ------------------ | ------------------------------ | ----------------------------- |
| **Complexity**     | ⭐⭐ Simple                    | ⭐⭐⭐⭐ Advanced             |
| **Setup Time**     | ⚡ 5 minutes                   | ⚡⚡ 15 minutes (first time)  |
| **Best For**       | Single modules, simple imports | Multiple modules, master data |
| **Learning Curve** | 📚 Easy                        | 📚📚 Moderate                 |
| **Maintenance**    | 🔧 Per-module                  | 🔧 Centralized                |

---

## 1. Architecture Overview

### Generic Import (Module-Specific)

```
┌─────────────────────────────────────────┐
│          Module: Products               │
├─────────────────────────────────────────┤
│  products-import.service.ts             │
│  ├─ Config object (fields, validators) │
│  └─ extends BaseImportService          │
│                                         │
│  products-import.routes.ts              │
│  ├─ POST /import/preview                │
│  ├─ POST /import/execute                │
│  └─ GET /import/status/:sessionId       │
│                                         │
│  products-import-dialog.component.ts    │
│  └─ 5-step wizard UI                    │
└─────────────────────────────────────────┘

Storage: In-memory Map
Discovery: Manual registration
Dashboard: None
```

### System Init Import (Auto-Discovery)

```
┌──────────────────────────────────────────────────┐
│         System Initialization Dashboard          │
├──────────────────────────────────────────────────┤
│  Auto-Discovery Engine                           │
│  ├─ Scans *-import.service.ts files              │
│  ├─ Loads @ImportService decorators              │
│  ├─ Builds dependency graph                      │
│  └─ Calculates import order (topological sort)   │
│                                                   │
│  Centralized API (/api/admin/system-init)        │
│  ├─ GET /available-modules                       │
│  ├─ GET /import-order                            │
│  ├─ GET /module/:name/template                   │
│  ├─ POST /module/:name/validate                  │
│  ├─ POST /module/:name/import                    │
│  ├─ GET /module/:name/status/:jobId              │
│  └─ DELETE /module/:name/rollback/:jobId         │
│                                                   │
│  Import Services (Decorated)                     │
│  ├─ @ImportService({ metadata })                 │
│  ├─ getTemplateColumns()                         │
│  ├─ validateRow()                                │
│  ├─ insertBatch()                                │
│  └─ performRollback()                            │
└──────────────────────────────────────────────────┘

Storage: PostgreSQL (import_sessions, import_history)
Discovery: Automatic on server start
Dashboard: Centralized UI with module cards
```

---

## 2. Feature Comparison

### 2.1 Setup & Configuration

#### Generic Import

**Pros:**

- ✅ Simple config object
- ✅ No database migrations required
- ✅ Self-contained per module
- ✅ Quick to implement

**Cons:**

- ❌ Manual setup for each module
- ❌ No centralized management
- ❌ Config can become verbose
- ❌ No auto-discovery

**Example:**

```typescript
export class ProductsImportService extends BaseImportService<Product> {
  constructor(knex: Knex, repository: ProductsRepository) {
    super(knex, ProductsImportService.createConfig(repository), 'products');
  }

  private static createConfig(repository): ImportModuleConfig<Product> {
    return {
      moduleName: 'products',
      displayName: 'Products',
      fields: [
        /* field configs */
      ],
      maxRows: 10000,
      // ... more config
    };
  }
}
```

#### System Init Import

**Pros:**

- ✅ Declarative decorator syntax
- ✅ Auto-discovery on server start
- ✅ Centralized metadata
- ✅ Dependency management built-in

**Cons:**

- ❌ Requires database tables
- ❌ Slightly more complex setup
- ❌ Need to understand decorator system
- ❌ Migration needed for existing modules

**Example:**

```typescript
@ImportService({
  module: 'products',
  domain: 'inventory',
  displayName: 'Products (สินค้า)',
  dependencies: ['categories'],
  priority: 2,
  tags: ['master-data'],
  supportsRollback: true,
})
export class ProductsImportService extends BaseImportService<Product> {
  getTemplateColumns(): TemplateColumn[] {
    /* ... */
  }
  async validateRow(row, rowNumber): Promise<ValidationError[]> {
    /* ... */
  }
}
```

---

### 2.2 Session Management

#### Generic Import

**Storage:** In-memory JavaScript `Map`

**Pros:**

- ✅ Fast (no database queries)
- ✅ Simple implementation
- ✅ No migrations needed

**Cons:**

- ❌ Lost on server restart
- ❌ Not scalable (single server only)
- ❌ No persistence
- ❌ Manual cleanup required

**Session Lifecycle:**

```
Upload File → Create Session (Map.set)
           ↓
Execute Import (Map.get)
           ↓
Complete → Auto-cleanup after 1 hour
           ↓
Server Restart → All sessions lost ❌
```

#### System Init Import

**Storage:** PostgreSQL database (`import_sessions` table)

**Pros:**

- ✅ Survives server restart
- ✅ Scalable (multi-server)
- ✅ Complete audit trail
- ✅ Automatic expiration (database-level)

**Cons:**

- ❌ Slower (database I/O)
- ❌ Requires migrations
- ❌ More complex setup

**Session Lifecycle:**

```
Upload File → INSERT INTO import_sessions
           ↓
Execute Import → SELECT FROM import_sessions
           ↓
Complete → DELETE FROM import_sessions
           ↓
Auto-cleanup → Database trigger/cron (expires_at)
           ↓
Server Restart → Sessions preserved ✅
```

---

### 2.3 Import History & Audit Trail

#### Generic Import

**History:** ❌ Not included

**What You Get:**

- Nothing built-in
- Must implement manually if needed
- No rollback support
- No audit trail

**To Add History (Manual):**

```typescript
// You would need to:
// 1. Create your own history table
// 2. Track imports manually
// 3. Implement rollback logic
// 4. Build audit trail yourself
```

#### System Init Import

**History:** ✅ Complete audit trail (`import_history` table)

**What You Get:**

- Job ID (UUID)
- Session ID reference
- Module name
- Status (pending, running, completed, failed)
- Row counts (total, imported, errors)
- Duration (milliseconds)
- Error messages
- User context (who, when, where)
- File metadata
- Batch ID for rollback

**Example Query:**

```sql
SELECT
  job_id,
  module_name,
  status,
  imported_rows,
  error_rows,
  duration_ms,
  imported_by_name,
  completed_at
FROM import_history
WHERE module_name = 'products'
ORDER BY created_at DESC
LIMIT 10;
```

---

### 2.4 Rollback Support

#### Generic Import

**Rollback:** ❌ Not supported

**Why:**

- No batch tracking
- No way to identify imported records
- Would need to implement manually

**Manual Rollback Challenges:**

```typescript
// How do you know which records to delete?
// ❌ Option 1: Delete by timestamp (risky - affects other imports)
await knex('products').where('created_at', '>=', importStartTime).delete();

// ❌ Option 2: Track IDs separately (complex, error-prone)
const insertedIds = []; // Need to maintain this list
await knex('products').whereIn('id', insertedIds).delete();
```

#### System Init Import

**Rollback:** ✅ Precise rollback with `batch_id`

**How It Works:**

```typescript
// Each import gets a unique batch_id (UUID)
const batchId = uuidv4();

// All inserted records tagged with batch_id
await knex('products').insert({
  ...data,
  import_batch_id: batchId,
});

// Rollback: Delete only records from this batch
await knex('products').where({ import_batch_id: batchId }).delete();
```

**Safety:**

- ✅ Only deletes records from THIS import
- ✅ No risk of deleting records from other imports
- ✅ Works even if other imports happened after
- ✅ Can rollback weeks later

**Database Setup:**

```sql
-- Add to each table that supports import
ALTER TABLE products ADD COLUMN import_batch_id UUID DEFAULT NULL;
CREATE INDEX idx_products_import_batch ON products(import_batch_id);
```

---

### 2.5 Dependency Management

#### Generic Import

**Dependencies:** ❌ Not supported

**Issues:**

- No way to specify import order
- Must manually import in correct sequence
- Easy to make mistakes (import child before parent)

**Example Problem:**

```bash
# ❌ Wrong order - will fail (foreign key constraint)
Import products first (needs categories)
Import categories second

# ✅ Correct order - must do manually
Import categories first
Import products second (references categories)
```

#### System Init Import

**Dependencies:** ✅ Automatic dependency resolution

**How It Works:**

```typescript
// Define dependencies in decorator
@ImportService({
  module: 'products',
  dependencies: ['categories', 'suppliers'],
  priority: 3,
  // ...
})

// System automatically:
// 1. Builds dependency graph
// 2. Validates (no circular dependencies)
// 3. Calculates import order (topological sort)
// 4. Displays modules in correct order
```

**Import Order Calculation:**

```
Categories (priority 1, no dependencies)
  └─> Suppliers (priority 2, no dependencies)
       └─> Products (priority 3, depends on categories, suppliers)
            └─> Inventory Transactions (priority 4, depends on products)
```

**Dashboard Shows:**

- ✅ Correct import order
- ✅ Dependency tree
- ✅ Which modules must import first
- ✅ Warnings if dependencies not met

---

### 2.6 User Interface

#### Generic Import

**UI:** Module-specific import dialog

**Location:** Each module has its own dialog

```
Products Module:
  ├─ List View
  └─ Import Button → ProductsImportDialog

Categories Module:
  ├─ List View
  └─ Import Button → CategoriesImportDialog

// No central place to see all imports
```

**Pros:**

- ✅ Integrated into module UI
- ✅ Contextual to the module
- ✅ Simple navigation

**Cons:**

- ❌ No overview of all imports
- ❌ Can't see import history across modules
- ❌ Duplicate UI code for each module

#### System Init Import

**UI:** Centralized dashboard

**Location:** `/admin/system-init`

```
System Init Dashboard:
  ├─ Module Cards (all discoverable modules)
  │  ├─ Domain: Core
  │  │  ├─ Departments ✅ Imported
  │  │  └─ Organizations ⏳ Pending
  │  ├─ Domain: Inventory
  │  │  ├─ Categories ✅ Imported
  │  │  ├─ Suppliers ✅ Imported
  │  │  └─ Products ⏳ In Progress (45%)
  │  └─ Domain: Budget
  ├─ Import History Timeline
  ├─ Statistics
  └─ Search & Filter
```

**Pros:**

- ✅ See all modules in one place
- ✅ Import history across all modules
- ✅ Dependency visualization
- ✅ Statistics dashboard
- ✅ Search and filter

**Cons:**

- ❌ Separate navigation (not in module)
- ❌ More complex UI

---

### 2.7 API Endpoints

#### Generic Import

**Routes:** Module-specific

```typescript
// Each module has its own routes
POST   /api/products/import/preview
POST   /api/products/import/execute
GET    /api/products/import/status/:sessionId

POST   /api/categories/import/preview
POST   /api/categories/import/execute
GET    /api/categories/import/status/:sessionId

// Repeated for each module
```

**Pros:**

- ✅ RESTful (scoped to resource)
- ✅ Simple routing
- ✅ Module isolation

**Cons:**

- ❌ Code duplication
- ❌ Inconsistent implementations
- ❌ Hard to maintain

#### System Init Import

**Routes:** Centralized

```typescript
// Single API for all modules
GET    /api/admin/system-init/available-modules
GET    /api/admin/system-init/import-order
GET    /api/admin/system-init/module/:moduleName/template?format=csv|excel
POST   /api/admin/system-init/module/:moduleName/validate
POST   /api/admin/system-init/module/:moduleName/import
GET    /api/admin/system-init/module/:moduleName/status/:jobId
DELETE /api/admin/system-init/module/:moduleName/rollback/:jobId
GET    /api/admin/system-init/dashboard
GET    /api/admin/system-init/health-status
```

**Pros:**

- ✅ Consistent API across all modules
- ✅ Single point of maintenance
- ✅ Centralized error handling
- ✅ Better API documentation

**Cons:**

- ❌ Less RESTful (generic endpoint)
- ❌ Requires module name parameter

---

## 3. Performance Comparison

### 3.1 Auto-Discovery Performance

#### Generic Import

**Discovery:** Manual registration

```typescript
// Must manually import and register
import { ProductsImportService } from './products-import.service';
import { CategoriesImportService } from './categories-import.service';

// Register in plugin or controller
fastify.register(productsImportRoutes);
fastify.register(categoriesImportRoutes);
```

**Performance:** N/A (no auto-discovery)

#### System Init Import

**Discovery:** Automatic scan on server start

**Process:**

```
1. Scan file system → ~20ms (for 30+ files)
2. Dynamic import files → ~30ms
3. Extract metadata → ~10ms
4. Build dependency graph → ~15ms
5. Validate dependencies → ~10ms
6. Register in memory → ~10ms
────────────────────────────────────────
Total: ~95ms for 30+ modules ✅
```

**Impact:** Negligible (< 100ms on server start)

---

### 3.2 Import Execution Performance

Both architectures have similar performance:

| Operation           | Generic Import        | System Init Import    |
| ------------------- | --------------------- | --------------------- |
| **File Upload**     | ~50ms (1MB file)      | ~50ms (1MB file)      |
| **Validation**      | 5-10 rows/sec         | 5-10 rows/sec         |
| **Batch Insert**    | 50-100 rows/sec       | 50-100 rows/sec       |
| **Progress Update** | Every 2 sec (polling) | Every 2 sec (polling) |
| **Session Lookup**  | O(1) Map.get          | O(1) DB indexed query |

**Database Overhead (System Init):**

- Session INSERT: ~5ms
- Session SELECT: ~3ms
- History INSERT: ~5ms
- History UPDATE: ~3ms

**Total Overhead:** ~16ms per import (negligible)

---

## 4. Scalability

### 4.1 Horizontal Scaling

#### Generic Import

**Multi-Server Support:** ❌ Not supported

**Why:**

- In-memory sessions (server-local)
- No shared state
- Import started on Server A, can't check status from Server B

**Workaround:**

```
Use sticky sessions / session affinity
  └─> Forces user to same server
       └─> Not ideal for load balancing
```

#### System Init Import

**Multi-Server Support:** ✅ Fully supported

**Why:**

- Database-backed sessions (shared state)
- Can check status from any server
- Load balancer can route freely

**Architecture:**

```
Load Balancer
   ├─> Server A (uploads file, creates session in DB)
   ├─> Server B (checks status, reads session from DB)
   └─> Server C (executes import, updates session in DB)

All servers share same database state ✅
```

---

### 4.2 Module Scalability

#### Generic Import

**Adding New Modules:**

```
1. Generate import service
2. Generate import routes
3. Register routes manually
4. Generate frontend dialog
5. Test independently

Time: ~30 minutes per module
```

**Maintenance:**

- Each module is independent
- Changes don't affect other modules
- But consistency is manual

#### System Init Import

**Adding New Modules:**

```
1. Generate import service with decorator
2. Auto-discovered on server restart
3. Appears in dashboard automatically
4. No manual registration needed

Time: ~15 minutes per module
```

**Maintenance:**

- Centralized updates (all modules benefit)
- Consistent behavior across modules
- Dashboard updates automatically

---

## 5. Use Cases & Recommendations

### When to Use Generic Import

✅ **Ideal For:**

1. **Single Module Imports**
   - You only need import for 1-2 modules
   - Import is not a core feature

2. **Simple Use Cases**
   - No dependency management needed
   - No rollback required
   - No audit trail needed

3. **Prototyping**
   - Quick proof-of-concept
   - Testing import functionality

4. **Isolated Features**
   - Import feature isolated to specific module
   - No need for centralized management

**Example:**

```typescript
// Simple product import for a single e-commerce module
@Component()
export class ProductsImportDialog {
  // Standalone import dialog
  // No need for dashboard or history
}
```

---

### When to Use System Init Import

✅ **Ideal For:**

1. **Master Data Management**
   - Multiple master data tables
   - Need to import in correct order
   - Dependencies between entities

2. **System Initialization**
   - Onboarding new customers
   - Migrating from legacy systems
   - Initial system setup

3. **Enterprise Applications**
   - Need audit trail
   - Compliance requirements
   - Rollback capability essential

4. **Multiple Modules**
   - 5+ modules with import needs
   - Want centralized management
   - Need consistency across modules

**Example:**

```typescript
// Hospital system with 30+ master data tables
// Departments → Employees → Drug Categories → Drugs → Inventory
// Need: dependency order, audit trail, rollback
@ImportService({
  module: 'drugs',
  dependencies: ['drug_categories', 'suppliers'],
  priority: 5,
  supportsRollback: true,
})
```

---

## 6. Migration Path

### From Generic → System Init

**Effort:** Medium (2-4 hours per module)

**Benefits:**

- Centralized dashboard
- Auto-discovery
- Import history
- Rollback support

**When to Migrate:**

- You have 3+ modules with imports
- Need centralized management
- Want better audit trail

---

### From System Init → Generic

**Effort:** Low (1-2 hours per module)

**Benefits:**

- Simpler architecture
- Self-contained module
- No database dependencies

**When to Migrate:**

- Simplifying system
- Only 1-2 modules need import
- Don't need central dashboard

---

## 7. Summary Decision Matrix

| Criteria                  | Generic Import | System Init Import       |
| ------------------------- | -------------- | ------------------------ |
| **Number of Modules**     | 1-2 modules    | 3+ modules               |
| **Dependency Management** | Not needed     | Required                 |
| **Audit Trail**           | Not needed     | Required                 |
| **Rollback**              | Not needed     | Required                 |
| **Central Dashboard**     | Not needed     | Wanted                   |
| **Horizontal Scaling**    | Single server  | Multi-server             |
| **Setup Complexity**      | Simple         | Moderate                 |
| **Maintenance**           | Per-module     | Centralized              |
| **Best For**              | Simple imports | Master data, System init |

---

## 8. Conclusion

**Both architectures are valid** - choose based on your needs:

- **Start with Generic Import** if you need something quick and simple
- **Use System Init Import** if you're building a comprehensive data import system

You can always migrate from Generic to System Init later if requirements evolve.

---

**Last Updated:** December 20, 2025
**Version:** 2.0.0
