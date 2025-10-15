# Enhanced CRUD Generator - User Guide

> **📖 Complete guide for developers using the Enhanced CRUD Generator**

## 🚀 Getting Started

### Prerequisites

1. **Database Table**: Ensure your table exists in PostgreSQL
2. **Base Schemas**: Enhanced schemas should be available in `base.schemas.ts`
3. **Development Environment**: AegisX platform development setup

### Installation Check

Verify the generator is available:

```bash
node tools/crud-generator/index.js --help
```

## 📋 Command Syntax

```bash
node tools/crud-generator/index.js generate <table-name> [options]
```

### Available Options

| Option      | Description              | Values                           | Default    |
| ----------- | ------------------------ | -------------------------------- | ---------- |
| `--package` | Feature package level    | `standard`, `enterprise`, `full` | `standard` |
| `--force`   | Overwrite existing files | `true`, `false`                  | `false`    |

## 🎯 Package Selection Guide

### When to Use Standard Package

**Best for:**

- Simple entities (users, categories, tags)
- MVP/prototype development
- Basic admin interfaces
- Read-heavy applications

**Features:**

- Basic CRUD operations
- List with pagination
- TypeBox validation
- RBAC authorization

**Example:**

```bash
node tools/crud-generator/index.js generate categories --package=standard
```

### When to Use Enterprise Package

**Best for:**

- Admin dashboards
- Bulk data management
- Complex business entities
- Multi-tenant applications

**Features:**

- All Standard features
- Bulk operations (create/update/delete multiple)
- Dropdown APIs for UI components
- Status management (activate/deactivate/toggle)
- Statistics endpoints

**Example:**

```bash
node tools/crud-generator/index.js generate products --package=enterprise
```

### When to Use Full Package

**Best for:**

- Critical business entities
- Complex validation requirements
- Real-time form validation
- High data integrity requirements

**Features:**

- All Enterprise features
- Data validation before save
- Field uniqueness checking
- Advanced form helpers

**Example:**

```bash
node tools/crud-generator/index.js generate users --package=full
```

## 🔄 Typical Workflow

### 1. Plan Your Module

```bash
# Check existing table structure
psql -d your_database -c "\d your_table"

# Review base schemas
cat apps/api/src/schemas/base.schemas.ts
```

### 2. Generate Module

```bash
# Choose appropriate package level
node tools/crud-generator/index.js generate products --package=enterprise
```

### 3. Review Generated Files

```bash
# Check generated structure
ls -la apps/api/src/modules/products/

# Review routes
cat apps/api/src/modules/products/routes/index.ts
```

### 4. Test the Module

```bash
# Build the API
nx run api:build

# Run tests
nx run api:test --testPathPattern=products
```

### 5. Run Migrations

```bash
# Apply permission migrations
npm run db:migrate
```

## 📊 Generated Routes by Package

### Standard Package Routes (5)

| Method   | Endpoint     | Description            |
| -------- | ------------ | ---------------------- |
| `POST`   | `/table`     | Create new item        |
| `GET`    | `/table/:id` | Get item by ID         |
| `GET`    | `/table`     | List items (paginated) |
| `PUT`    | `/table/:id` | Update item            |
| `DELETE` | `/table/:id` | Delete item            |

### Enterprise Package Routes (+8)

| Method   | Endpoint                | Description          |
| -------- | ----------------------- | -------------------- |
| `GET`    | `/table/dropdown`       | Get dropdown options |
| `POST`   | `/table/bulk`           | Bulk create items    |
| `PUT`    | `/table/bulk`           | Bulk update items    |
| `DELETE` | `/table/bulk`           | Bulk delete items    |
| `PATCH`  | `/table/bulk/status`    | Bulk status update   |
| `PATCH`  | `/table/:id/activate`   | Activate item        |
| `PATCH`  | `/table/:id/deactivate` | Deactivate item      |
| `PATCH`  | `/table/:id/toggle`     | Toggle item status   |
| `GET`    | `/table/stats`          | Get statistics       |

### Full Package Routes (+2)

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| `POST` | `/table/validate`     | Validate data before save |
| `GET`  | `/table/check/:field` | Check field uniqueness    |

## 🔧 Customization

### Modifying Generated Code

1. **Controllers**: Add custom business logic
2. **Services**: Extend with additional methods
3. **Repositories**: Add custom queries
4. **Routes**: Modify authentication/authorization
5. **Schemas**: Extend validation rules

### Adding Custom Routes

```typescript
// In routes/index.ts
fastify.get('/custom-endpoint', {
  schema: {
    /* OpenAPI schema */
  },
  preValidation: [fastify.authenticate],
  handler: controller.customMethod.bind(controller),
});
```

## 🚨 Common Patterns

### Form Integration (Frontend)

```typescript
// Using dropdown endpoint
getProductOptions() {
  return this.http.get('/api/products/dropdown?limit=50');
}

// Using uniqueness checking
checkProductName(name: string) {
  return this.http.get(`/api/products/check/name?value=${name}`);
}

// Using validation endpoint
validateProduct(data: any) {
  return this.http.post('/api/products/validate', { data });
}
```

### Bulk Operations

```typescript
// Bulk create
const bulkData = {
  items: [
    { name: 'Product 1', price: 100 },
    { name: 'Product 2', price: 200 },
  ],
  options: { continueOnError: true },
};

// Bulk status update
const statusUpdate = {
  ids: ['1', '2', '3'],
  status: true, // activate all
};
```

## ⚠️ Important Notes

### File Overwriting

- Use `--force` flag carefully - it overwrites ALL generated files
- Back up custom modifications before regenerating
- Consider version control before force regeneration

### Migration Management

- Each generation creates new migration files
- Remove duplicate migration files manually
- Check migration timestamps to avoid conflicts

### Type Safety

- Generated code follows strict TypeScript typing
- All routes have proper TypeBox schema validation
- Update schemas when modifying generated code

## 🔍 Troubleshooting Quick Fixes

### Generation Fails

```bash
# Check table exists
psql -d your_db -c "\d your_table"

# Verify you're in project root
pwd  # Should end with aegisx-starter-1
```

### Build Errors

```bash
# Check TypeScript errors
nx run api:build

# Review generated schemas
cat apps/api/src/modules/your-table/schemas/your-table.schemas.ts
```

### Migration Issues

```bash
# Check migration files
ls apps/api/src/database/migrations/*your-table*

# Remove duplicates if needed
rm apps/api/src/database/migrations/duplicate-file.ts
```

---

**Next Steps:**

- Review [Developer Guide](./DEVELOPER_GUIDE.md) for technical details
- Check [API Reference](./API_REFERENCE.md) for endpoint specifications
- See [Troubleshooting](./TROUBLESHOOTING.md) for detailed problem solving
