# 📖 CRUD Generator User Guide

> **Step-by-step guide for generating production-ready CRUD modules**

This guide walks you through the complete process of generating backend and frontend CRUD modules using the AegisX CRUD Generator system.

## 🎯 Overview

The CRUD Generator creates complete, production-ready modules with:

- **Backend**: Fastify API with TypeBox validation
- **Frontend**: Angular components with Material Design
- **Zero Manual Work**: Code compiles and runs immediately

## 📋 Prerequisites

### Required Setup

- Node.js 18+ installed
- pnpm package manager
- Database with existing table schema
- AegisX project structure

### Database Requirements

- PostgreSQL database running
- Table schema defined with proper constraints
- Database connection configured in project

## 🚀 Step-by-Step Guide

### Step 1: Prepare Your Database Schema

Before generating code, ensure your database table has proper schema:

```sql
-- Example: Books table with constraints
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES authors(id),
    isbn VARCHAR(13) UNIQUE,
    publication_date DATE,
    status VARCHAR(50) CHECK (status IN ('available', 'checked_out', 'reserved')),
    genre VARCHAR(100),
    page_count INTEGER CHECK (page_count > 0),
    price DECIMAL(10,2) CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Important Schema Elements:**

- ✅ Primary key (preferably UUID)
- ✅ NOT NULL constraints where appropriate
- ✅ CHECK constraints for enum-like fields
- ✅ Foreign key relationships
- ✅ Proper data types
- ✅ Timestamps for auditing

### Step 2: Generate Backend Module

Navigate to the CRUD generator directory:

```bash
cd tools/crud-generator
```

#### Basic Backend Generation

```bash
# Generate standard backend module
node index.js generate books

# Generated files:
# ✅ controllers/books.controller.ts
# ✅ services/books.service.ts
# ✅ repositories/books.repository.ts
# ✅ schemas/books.schemas.ts
# ✅ types/books.types.ts
# ✅ routes/index.ts
# ✅ __tests__/books.test.ts
# ✅ index.ts
```

#### Enhanced Backend Generation

```bash
# Generate enhanced backend with advanced features
node index.js generate books --package enhanced

# Additional features:
# ✅ Bulk operations endpoints
# ✅ Advanced search and filtering
# ✅ Statistics endpoints
# ✅ Export functionality
# ✅ Enhanced validation
```

#### Preview Before Generation (Recommended)

```bash
# Preview what will be generated
node index.js generate books --dry-run

# Output shows:
# - Files that will be created
# - Database columns detected
# - Constraints and relationships found
# - Template features that will be included
```

### Step 3: Verify Backend Generation

Check that the backend module was created successfully:

```bash
# Check generated files
ls -la apps/api/src/modules/books/

# Expected output:
# controllers/
# services/
# repositories/
# schemas/
# types/
# routes/
# __tests__/
# index.ts
```

Test backend compilation:

```bash
# From project root
nx build api

# Should compile successfully with no errors
```

### Step 4: Generate Frontend Module

Generate the Angular frontend components:

```bash
# From tools/crud-generator directory
node generate-frontend-direct.js books enhanced

# Generated files:
# ✅ components/books-list.component.ts
# ✅ components/books-create.dialog.ts
# ✅ components/books-edit.dialog.ts
# ✅ components/books-view.dialog.ts
# ✅ components/books-form.component.ts
# ✅ services/books.service.ts
# ✅ types/books.types.ts
```

#### Frontend Package Options

**Standard Package:**

```bash
node generate-frontend-direct.js books standard
# Basic CRUD with simple filtering
```

**Enhanced Package:**

```bash
node generate-frontend-direct.js books enhanced
# Advanced features including:
# - Constraint-based dropdowns
# - Quick filter buttons
# - Bulk operations
# - Export functionality
# - Real-time dashboard
```

### Step 5: Verify Frontend Generation

Check the frontend files:

```bash
# Check generated files
ls -la apps/web/src/app/features/books/

# Expected output:
# components/
# services/
# types/
# books.routes.ts
# index.ts
```

Test frontend compilation:

```bash
# From project root
nx build web

# Should compile successfully with no errors
```

### Step 6: Configure Navigation (Optional)

Add the new module to your navigation:

```typescript
// apps/web/src/app/core/navigation/navigation-config.ts
export const navigationConfig = {
  // ... existing items
  {
    label: 'Books',
    icon: 'book',
    route: '/books',
    permissions: ['books.read']
  }
  // ... rest of config
};
```

Update route configuration:

```typescript
// apps/web/src/app/app.routes.ts
export const routes: Routes = [
  // ... existing routes
  {
    path: 'books',
    loadChildren: () => import('./features/books/books.routes').then((m) => m.BOOKS_ROUTES),
  },
  // ... rest of routes
];
```

### Step 7: Test Your Generated Module

#### Start Development Servers

```bash
# Start API server
nx serve api

# Start web app (in another terminal)
nx serve web
```

#### Access Your CRUD Module

1. **Navigate to the module**: `http://localhost:4200/books`
2. **Test list view**: Should show books table with filtering
3. **Test create**: Click "Add Book" button
4. **Test edit**: Click edit icon on any row
5. **Test view**: Click view icon to see details
6. **Test filters**: Use constraint-based dropdowns
7. **Test quick filters**: Click quick filter buttons
8. **Test bulk operations**: Select multiple items and use bulk menu
9. **Test export**: Export data in various formats

## 🎨 Understanding Generated Features

### Backend Features

#### 1. Complete CRUD Endpoints

```typescript
// Automatically generated endpoints:
POST   /api/books          // Create new book
GET    /api/books/:id      // Get single book
GET    /api/books          // List books with filtering
PUT    /api/books/:id      // Update book
DELETE /api/books/:id      // Delete book

// Enhanced package adds:
GET    /api/books/dropdown     // Dropdown options
POST   /api/books/bulk         // Bulk create
PUT    /api/books/bulk         // Bulk update
DELETE /api/books/bulk         // Bulk delete
POST   /api/books/validate     // Validate data
GET    /api/books/check/:field // Check uniqueness
GET    /api/books/stats        // Statistics
```

#### 2. TypeBox Validation

```typescript
// Automatically generated schemas
export const CreateBookSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 255 }),
  author_id: Type.String({ format: 'uuid' }),
  isbn: Type.Optional(Type.String({ pattern: '^[0-9]{13}$' })),
  status: Type.Union([Type.Literal('available'), Type.Literal('checked_out'), Type.Literal('reserved')]),
  // ... other fields
});
```

#### 3. UUID Protection

```typescript
// Automatic UUID validation prevents PostgreSQL errors
export class BooksRepository extends BaseRepository {
  constructor(knex: Knex) {
    super(
      knex,
      'books',
      searchFields,
      ['id', 'author_id'], // UUID fields automatically protected
    );
  }
}
```

### Frontend Features

#### 1. Advanced List Component

The generated list component includes:

- **Data Table**: Material Design table with sorting and pagination
- **Search Bar**: Full-text search across specified fields
- **Constraint Filters**: Dropdowns automatically generated from CHECK constraints
- **Quick Filters**: Smart buttons for common filter combinations
- **Bulk Operations**: Multi-select with bulk actions menu
- **Export Functions**: CSV, Excel, JSON, PDF export
- **Real-time Dashboard**: Summary statistics with live updates

#### 2. CRUD Dialogs

Three dialog types are generated:

- **Create Dialog**: Form for adding new records
- **Edit Dialog**: Form pre-filled with existing data
- **View Dialog**: Read-only display of record details

#### 3. Shared Form Component

Reusable form component with:

- Reactive form validation
- Material Design form fields
- Error handling and display
- Custom validators for business rules

## 🔧 Customization Options

### Template Customization

You can customize templates by modifying files in:

- `tools/crud-generator/templates/` (backend templates)
- `tools/crud-generator/frontend-templates/` (frontend templates)

### Adding Custom Fields

To add custom form fields or table columns:

1. Update database schema
2. Regenerate module with `--force` flag
3. Templates automatically detect new fields

### Changing Package Features

Switch between package levels by regenerating:

```bash
# Upgrade to enhanced package
node generate-frontend-direct.js books enhanced --force
```

## 🐛 Common Issues & Solutions

### Issue: Build Errors After Generation

**Problem**: TypeScript compilation errors after generating module

**Solution**:

1. Check that all dependencies are installed: `pnpm install`
2. Verify database schema has no syntax errors
3. Regenerate with `--force` flag to overwrite

### Issue: Database Connection Errors

**Problem**: Generator fails to connect to database

**Solution**:

1. Verify database is running: `docker-compose ps`
2. Check connection string in `.env` file
3. Ensure database contains the target table

### Issue: Missing Navigation

**Problem**: Generated module not accessible in UI

**Solution**:

1. Add route to `app.routes.ts`
2. Update navigation configuration
3. Verify user has required permissions

### Issue: Template Features Not Working

**Problem**: Advanced features like exports not functioning

**Solution**:

1. Ensure you used `enhanced` package level
2. Check that all Angular Material modules are imported
3. Verify API endpoints are responding correctly

## 🎯 Best Practices

### 1. Database Schema Design

- Use meaningful column names (avoided generic names like `name` for specific entities)
- Add appropriate constraints (CHECK, FOREIGN KEY, NOT NULL)
- Include audit fields (created_at, updated_at)
- Use UUID primary keys for better distribution

### 2. Generation Workflow

- Always use `--dry-run` first to preview
- Use enhanced package for production features
- Regenerate with `--force` when schema changes
- Test both builds after generation

### 3. Customization Strategy

- Start with generated code, then customize
- Keep customizations in separate files when possible
- Document any template modifications
- Consider contributing useful customizations back

### 4. Testing Approach

- Use generated tests as starting point
- Add business-specific test cases
- Test all generated features (CRUD, filters, exports)
- Verify permissions and authorization

## 🚀 Advanced Usage

### Custom Package Configuration

Create custom package configurations:

```javascript
// tools/crud-generator/packages/custom.js
module.exports = {
  name: 'custom',
  features: {
    basicCrud: true,
    bulkOperations: true,
    customValidation: true,
    advancedSearch: false,
    exports: ['csv', 'json'], // Selective exports
    realtime: true,
  },
};
```

### Template Extensions

Extend templates with custom helpers:

```javascript
// tools/crud-generator/helpers/custom-helpers.js
module.exports = {
  customFieldType: (column) => {
    // Custom logic for field type detection
    return column.dataType === 'json' ? 'JsonField' : 'StandardField';
  },
};
```

### Batch Generation

Generate multiple modules at once:

```bash
# Generate multiple modules
for table in books authors categories; do
  node index.js generate $table --package enhanced
  node generate-frontend-direct.js $table enhanced
done
```

## 📚 Next Steps

1. **Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** for technical details
2. **Check [API_REFERENCE.md](./API_REFERENCE.md)** for complete API documentation
3. **Review [ARCHITECTURE.md](./ARCHITECTURE.md)** for system design details
4. **Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for production deployment

---

**You're now ready to generate production-ready CRUD modules in seconds!** 🎉

_Remember: The generated code is production-ready and requires zero manual fixes. Focus on customizing business logic rather than basic CRUD operations._
