# CRUD Generator Documentation

> **Automatic CRUD API generation with built-in error handling and validation**

## 🎉 What's New in v2.1.0

**HIS Mode (Hospital Information System Mode)** - New default behavior that prioritizes data accuracy over real-time speed for critical systems:

- ⚕️ **Data Accuracy First**: UI always shows actual database state (no optimistic updates)
- 📊 **Backend Always Emits Events**: Audit trail and event-driven architecture ready
- 🔧 **Optional Real-Time Mode**: Easy to enable by uncommenting 4 code blocks
- 🛡️ **No Confusion**: Users never see outdated or server-rejected data

**Why HIS Mode?** In critical systems like hospitals, financial systems, or enterprise applications, showing users data that might not match the database can be dangerous. HIS Mode ensures the UI always reflects the actual server state.

**Migration**: Regenerate modules to get HIS Mode behavior:

```bash
# With events for audit trail
pnpm aegisx-crud budgets --package --with-events --force

# With import + events
pnpm aegisx-crud budgets --package --with-import --with-events --force
```

**Enabling Optional Real-Time Updates**: See [Events Guide](./EVENTS_GUIDE.md) for step-by-step instructions to enable WebSocket real-time CRUD updates.

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

---

## 🚀 Quick Start

```bash
# Interactive mode (recommended)
pnpm run crud-gen

# Direct command with standard CRUD
pnpm run crud-gen products --entity Product

# Enterprise package (with events & import)
pnpm run crud-gen products --entity Product --package enterprise

# Full package (all features)
pnpm run crud-gen products --entity Product --package full

# Legacy command (still works)
node libs/aegisx-crud-generator/bin/cli.js generate authors --package full --no-roles --force
```

## 📚 Documentation

### Essential Guides (Start Here)

1. **[Quick Commands Reference](./QUICK_COMMANDS.md)** ⭐ **Start Here!**
   - All CLI flags and options
   - Package comparison table
   - Common workflows and examples
   - Fast reference for daily use

2. **[User Guide](./USER_GUIDE.md)** ⭐ **Complete Walkthrough**
   - Feature-by-feature documentation
   - Step-by-step tutorials
   - Best practices and patterns
   - Enterprise and Full package features

3. **[Events Guide](./EVENTS_GUIDE.md)** - WebSocket Real-Time Events
   - What is `--with-events`
   - Backend event emission (EventService, CrudEventHelper)
   - Frontend integration patterns
   - Testing and troubleshooting

4. **[Import Guide](./IMPORT_GUIDE.md)** - Bulk Excel/CSV Import
   - What is `--with-import`
   - 5-step import workflow
   - BaseImportService integration
   - v2.0.1 type alignment fixes
   - Session management and progress tracking

5. **[Error Handling Guide](./ERROR_HANDLING_GUIDE.md)** - Validation & Errors
   - Automatic error detection from database schema
   - Error code conventions and status codes (409 vs 422)
   - Generated error types and response formats
   - Troubleshooting common issues

6. **[Validation Reference](./VALIDATION_REFERENCE.md)** - Field Validations
   - Auto-detected validations (email, date, phone, etc.)
   - Field name patterns that trigger validations
   - Complete validation rules reference
   - Testing strategies

7. **[Testing Guide](./TESTING_GUIDE.md)** - Quality Assurance
   - Test setup and configuration
   - Unit, integration, and E2E testing strategies
   - Validation and error handling test examples
   - Test utilities and best practices

8. **[CHANGELOG](./CHANGELOG.md)** - Version History
   - v2.0.1 import dialog fixes
   - v2.0.0 complete rewrite
   - Migration guides
   - Future roadmap

### Coming Soon

9. **Type Mapping Guide** - PostgreSQL to TypeScript/TypeBox mapping
10. **Best Practices** - Database schema design and naming conventions
11. **API Reference** - Complete API documentation

---

## 🎯 What You Get

When you generate a CRUD module, you automatically get:

### ✅ Complete CRUD Operations (All Packages)

- **Create** - POST with validation
- **Read** - GET by ID with includes
- **List** - GET all with pagination, search, filter, sort
- **Update** - PUT with validation
- **Delete** - DELETE with FK reference checking

### ✅ Automatic Error Handling (All Packages)

- **409 Conflict** - Duplicate unique values
- **422 Unprocessable Entity** - Business rule violations
- **422 Unprocessable Entity** - FK blocking (can't delete)
- **Type-safe error codes** - TypeScript enums
- **Error message mapping** - Single source of truth

### ✅ Enterprise Features (Enterprise & Full Packages)

- **WebSocket Events** (`--with-events`) - Real-time CRUD event emission
- **Bulk Import** (`--with-import`) - Excel/CSV import with 5-step wizard
- **Dropdown** - GET /dropdown for UI components
- **Bulk Operations** - POST/PUT/DELETE /bulk
- **Export** - GET /export (CSV, Excel, PDF)
- **Statistics** - GET /stats

### ✅ Full Package Features (Full Package Only)

- **Audit Trail** (`--with-audit`) - Complete change history
- **Soft Delete** (`--with-soft-delete`) - Trash and restore functionality
- **Validation** - POST /validate (pre-save)
- **Uniqueness Check** - GET /check/:field

### ✅ Type Safety (All Packages)

- **PostgreSQL Schema** → TypeBox schemas
- **TypeBox** → TypeScript types
- **TypeScript** → OpenAPI documentation
- **No type assertions** - Fully type-safe end-to-end

### ✅ Code Quality (All Packages)

- **BaseRepository** - Consistent data access patterns
- **BaseService** - Business logic layer with validation
- **BaseController** - Route handlers with error handling
- **BaseImportService** - Standardized import workflow (with `--with-import`)
- **EventService** - WebSocket event management (with `--with-events`)
- **Angular Signals** - Modern reactive state management (frontend)

---

## 🔍 Automatic Error Detection

The generator analyzes your PostgreSQL database and automatically detects:

### 1. UNIQUE Constraints → 409 Conflict

```sql
ALTER TABLE authors ADD CONSTRAINT authors_email_unique UNIQUE (email);
```

**Generates:**

```typescript
// Error code enum
DUPLICATE_EMAIL = 'AUTHORS_DUPLICATE_EMAIL';

// Validation in service
if (await repository.findByEmail(data.email)) {
  throw conflictError(409, 'DUPLICATE_EMAIL');
}
```

---

### 2. Foreign Key References → 422 Cannot Delete

```sql
ALTER TABLE books ADD CONSTRAINT books_author_fk
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE RESTRICT;
```

**Generates:**

```typescript
// Error codes
CANNOT_DELETE_HAS_REFERENCES = 'AUTHORS_CANNOT_DELETE_HAS_REFERENCES';
CANNOT_DELETE_HAS_BOOKS = 'AUTHORS_CANNOT_DELETE_HAS_BOOKS';

// Validation before delete
const deleteCheck = await repository.checkDeleteReferences(id);
if (deleteCheck.hasReferences) {
  throw unprocessableError(422, 'CANNOT_DELETE_HAS_BOOKS', {
    references: deleteCheck.blockedBy,
  });
}
```

---

### 3. Business Rules (Field Names) → 422 Validation Failed

**Email Fields:**

```sql
email VARCHAR(255)  → Email format validation
```

**Date Fields:**

```sql
birth_date DATE  → Date cannot be in future
```

**Price Fields:**

```sql
price DECIMAL(10,2)  → Must be positive number
```

**URL Fields:**

```sql
website VARCHAR(255)  → Valid URL format
```

**Phone Fields:**

```sql
phone VARCHAR(20)  → Phone number format
```

---

## 📊 Field Name Patterns

The generator detects validations based on field names:

| Field Pattern                   | Validation      | Status | Error Code Pattern      |
| ------------------------------- | --------------- | ------ | ----------------------- |
| `*email*`                       | Email format    | 422    | `INVALID_EMAIL_{FIELD}` |
| `*birth*`, `*dob*`              | Date not future | 422    | `INVALID_DATE_{FIELD}`  |
| `*price*`, `*cost*`, `*amount*` | Positive number | 422    | `INVALID_VALUE_{FIELD}` |
| `*url*`, `*website*`, `*link*`  | URL format      | 422    | `INVALID_URL_{FIELD}`   |
| `*phone*`, `*tel*`, `*mobile*`  | Phone format    | 422    | `INVALID_PHONE_{FIELD}` |

**💡 Tip:** Use descriptive field names that match these patterns for automatic validation!

---

## 🎨 Package Options

### Standard Package

```bash
--package standard  # Basic CRUD only
```

**Features:**

- ✅ Create, Read, Update, Delete
- ✅ Pagination & Search
- ✅ Error handling
- ✅ Field selection

---

### Enterprise Package

```bash
--package enterprise  # Standard + Advanced features
```

**Additional Features:**

- ✅ Dropdown options (for UI selects)
- ✅ Bulk operations (create/update/delete multiple)
- ✅ Export (CSV, Excel, PDF)
- ✅ Statistics endpoint

---

### Full Package ⭐ **Recommended**

```bash
--package full  # Enterprise + Validation tools
```

**Additional Features:**

- ✅ Pre-save validation endpoint
- ✅ Real-time uniqueness checking
- ✅ All enterprise features

---

## 💡 Examples

### Generate with Full Features

```bash
# Authors table with email validation and FK checking
node libs/aegisx-crud-generator/bin/cli.js generate authors --package full --no-roles --force

# Expected output:
✅ Detected unique constraints:
   - Single field: email
✅ Detected foreign key references:
   - books.author_id (ON DELETE CASCADE)
✅ Detected 2 business rules:
   - email: email_format
   - birth_date: date_not_future
✅ Error codes: 7 codes generated
```

---

### Test Generated Validation

**Test Email Format:**

```bash
curl -X POST http://localhost:3333/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "invalid-email"}'

# Response: 422 with INVALID_EMAIL_EMAIL
```

**Test Duplicate:**

```bash
curl -X POST http://localhost:3333/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "existing@example.com"}'

# Response: 409 with DUPLICATE_EMAIL
```

**Test Cannot Delete:**

```bash
curl -X DELETE http://localhost:3333/api/authors/123
# (author has books)

# Response: 422 with CANNOT_DELETE_HAS_BOOKS
```

---

## 🧪 Testing

### Manual Testing

```bash
# Test validation
curl -X POST http://localhost:3333/api/authors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Author",
    "email": "invalid-email",
    "birth_date": "2030-01-01"
  }'

# Expected: 422 with detailed error
```

### Automated Testing

```typescript
describe('Authors Validation', () => {
  it('should validate email format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/authors',
      payload: {
        name: 'Test',
        email: 'not-an-email',
      },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error.code).toBe('AUTHORS_INVALID_EMAIL_EMAIL');
  });
});
```

---

## 📖 Documentation Index

| Document                                          | Description                              | Priority |
| ------------------------------------------------- | ---------------------------------------- | -------- |
| [Quick Commands Reference](./QUICK_COMMANDS.md)   | Fast CLI reference for daily use         | ⭐ High  |
| [User Guide](./USER_GUIDE.md)                     | Complete feature walkthrough             | ⭐ High  |
| [Events Guide](./EVENTS_GUIDE.md)                 | WebSocket real-time events               | ⭐ High  |
| [Import Guide](./IMPORT_GUIDE.md)                 | Bulk Excel/CSV import                    | ⭐ High  |
| [CHANGELOG](./CHANGELOG.md)                       | Version history & migration              | ⭐ High  |
| [Error Handling Guide](./ERROR_HANDLING_GUIDE.md) | Error detection & handling               | High     |
| [Validation Reference](./VALIDATION_REFERENCE.md) | Field validation rules                   | High     |
| [Testing Guide](./TESTING_GUIDE.md)               | Testing strategies                       | High     |
| Type Mapping Guide                                | PostgreSQL to TypeScript (coming soon)   | Medium   |
| Best Practices                                    | Database design guidelines (coming soon) | Medium   |
| API Reference                                     | Complete API docs (coming soon)          | Medium   |

---

## 🎯 Best Practices

### Database Schema Design

✅ **DO:**

- Use descriptive field names (`email`, `birth_date`, `product_price`)
- Add UNIQUE constraints in database (not just app-level)
- Set proper ON DELETE rules for foreign keys (`CASCADE` or `RESTRICT`)
- Use appropriate PostgreSQL types (UUID, TIMESTAMP, DECIMAL)

❌ **DON'T:**

- Use ambiguous names (`field1`, `data`, `value`)
- Skip database constraints (app-level validation isn't enough)
- Use ON DELETE SET NULL (can break data integrity)
- Mix naming conventions (snake_case for database)

---

### Error Handling

✅ **DO:**

- Use generated error code enums
- Include details in 422 errors (FK references, validation context)
- Follow status code strategy (409 vs 422)
- Log validation failures for analytics

❌ **DON'T:**

- Hardcode error messages
- Use 500 for validation errors
- Skip error codes
- Forget to set `error.statusCode`

---

## 🔧 Troubleshooting

### Error Code Not Generated

**Problem:** Expected validation not generated

**Solutions:**

1. Check field name matches pattern (see [Validation Reference](./VALIDATION_REFERENCE.md#field-name-patterns))
2. Verify database constraints exist
3. Regenerate with `--force` flag

---

### Validation Not Triggering

**Problem:** Error code exists but doesn't throw

**Solutions:**

1. Check if field is optional (`if (data.field)` guard)
2. Verify validation is in correct method (`validateCreate` vs `validateUpdate`)
3. Review generated service.ts for logic

---

### Wrong Status Code

**Problem:** Getting 500 instead of 409/422

**Solutions:**

1. Verify `error.statusCode` is set
2. Check Fastify error handler respects statusCode
3. Review error logs for unexpected errors

---

## 📚 Related Documentation

- [CRUD Generator Source](../../libs/aegisx-crud-generator/) - Generator implementation
- [API Documentation](../api/) - Complete API reference
- [Database Migrations](../database/) - Migration patterns

---

## ❓ Need Help?

1. **Check Documentation:**
   - [Error Handling Guide](./ERROR_HANDLING_GUIDE.md)
   - [Validation Reference](./VALIDATION_REFERENCE.md)

2. **Review Generated Code:**
   - Look at `apps/api/src/modules/authors/` as reference
   - Check service layer for validation logic
   - Review types file for error codes

3. **Test Your Setup:**
   - Use `curl` to test validations
   - Write automated tests
   - Check server logs

4. **Get Support:**
   - Report issues to the team
   - Review troubleshooting guides
   - Check existing modules for patterns

---

## 🎉 Success Checklist

After generating a CRUD module, verify:

- [ ] ✅ Module generates without errors
- [ ] ✅ Build passes (`nx build api`)
- [ ] ✅ OpenAPI/Swagger shows all routes
- [ ] ✅ Error responses documented (409, 422)
- [ ] ✅ Email validation works (if applicable)
- [ ] ✅ Duplicate detection works (if applicable)
- [ ] ✅ FK blocking works (if applicable)
- [ ] ✅ Tests pass (if written)

---

## 🔗 Quick Links

- **[Quick Commands](./QUICK_COMMANDS.md)** - CLI reference
- **[Events Guide](./EVENTS_GUIDE.md)** - Real-time WebSocket events
- **[Import Guide](./IMPORT_GUIDE.md)** - Bulk import with Excel/CSV
- **[CHANGELOG](./CHANGELOG.md)** - Version history

---

**Last Updated:** 2025-10-26
**Generator Version:** 2.0.1
