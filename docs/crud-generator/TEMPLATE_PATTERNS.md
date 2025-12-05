# CRUD Generator Template Patterns

> **Purpose**: This document captures the knowledge about CRUD generator structure, patterns, and how templates work. Read this before making changes to the generator.

## Generator Location

```
libs/aegisx-cli/
├── bin/cli.js                    # CLI entry point
├── src/
│   ├── index.ts                  # Main generator logic
│   ├── generator.ts              # Core generation functions
│   ├── schema-analyzer.ts        # Database schema analysis
│   ├── template-engine.ts        # Handlebars template processing
│   └── utils/                    # Helper utilities
└── templates/
    ├── backend/domain/           # Backend templates (Fastify)
    ├── frontend/v2/              # Frontend templates (Angular)
    └── shared/                   # Shared templates (permissions)
```

## Package Types

The generator supports 3 package types with different feature sets:

| Package      | Features             | Use Case          |
| ------------ | -------------------- | ----------------- |
| `standard`   | Basic CRUD           | Simple entities   |
| `enterprise` | + Soft delete, audit | Business entities |
| `full`       | + Import, Events     | Complex workflows |

## Backend Templates (`templates/backend/domain/`)

### Files Generated

| Template             | Output                | Purpose                                  |
| -------------------- | --------------------- | ---------------------------------------- |
| `controller.hbs`     | `*.controller.ts`     | Route handlers                           |
| `service.hbs`        | `*.service.ts`        | Business logic (extends BaseService)     |
| `repository.hbs`     | `*.repository.ts`     | Database access (extends BaseRepository) |
| `schemas.hbs`        | `*.schemas.ts`        | TypeBox validation schemas               |
| `routes.hbs`         | `*.routes.ts`         | Fastify route registration               |
| `types.hbs`          | `*.types.ts`          | TypeScript interfaces                    |
| `index.hbs`          | `index.ts`            | Module exports                           |
| `events.hbs`         | `*.events.ts`         | WebSocket events (if --with-events)      |
| `import.service.hbs` | `*.import.service.ts` | Excel/CSV import (if --with-import)      |

### Key Patterns

**Service extends BaseService:**

```typescript
export class ArticlesService extends BaseService<Articles, CreateArticles, UpdateArticles> {
  constructor(repository: ArticlesRepository, eventEmitter?: EventEmitter) {
    super(repository, 'articles', eventEmitter);
  }
}
```

**Repository extends BaseRepository:**

```typescript
export class ArticlesRepository extends BaseRepository<Articles, CreateArticles, UpdateArticles> {
  constructor(knex: Knex) {
    super(
      knex,
      'articles', // table name
      ['title', 'content'], // searchable fields
      ['id', 'author_id'], // UUID fields for validation
    );
  }
}
```

**TypeBox Schemas:**

```typescript
export const CreateArticlesSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  content: Type.Optional(Type.String()),
  author_id: Type.String({ format: 'uuid' }),
});
export type CreateArticles = Static<typeof CreateArticlesSchema>;
```

## Frontend Templates (`templates/frontend/v2/`)

### Files Generated

| Template             | Output                | Purpose                          |
| -------------------- | --------------------- | -------------------------------- |
| `list.component.hbs` | `*-list.component.ts` | Data table with filters          |
| `create.dialog.hbs`  | `*-create.dialog.ts`  | Create form dialog               |
| `edit.dialog.hbs`    | `*-edit.dialog.ts`    | Edit form dialog                 |
| `view.dialog.hbs`    | `*-view.dialog.ts`    | View details dialog              |
| `delete.dialog.hbs`  | `*-delete.dialog.ts`  | Delete confirmation              |
| `service.hbs`        | `*.service.ts`        | HTTP API calls                   |
| `types.hbs`          | `*.types.ts`          | TypeScript interfaces            |
| `import.dialog.hbs`  | `*-import.dialog.ts`  | Import dialog (if --with-import) |

### Angular Patterns Used

- **Signals** for reactive state (`signal()`, `computed()`)
- **inject()** for dependency injection
- **Standalone components** with inline templates
- **Material Design** components (MatTable, MatDialog, MatForm)
- **TailwindCSS + aegisx-ui tokens** for styling

## CSS Classes Reference

### Dialog Headers (from `_dialog-shared.scss`)

```html
<!-- Header with icon -->
<h2 mat-dialog-title class="ax-header ax-header-gradient-info">
  <div class="ax-icon-info">
    <mat-icon>add_circle</mat-icon>
  </div>
  <div class="header-text">
    <div class="ax-title">Create Item</div>
    <div class="ax-subtitle">Fill in the details below</div>
  </div>
</h2>
```

**Header color variants:**

- `ax-header-gradient-info` / `ax-icon-info` - Blue (create/view)
- `ax-header-gradient-warning` / `ax-icon-warning` - Yellow (edit)
- `ax-header-gradient-error` / `ax-icon-error` - Red (delete)
- `ax-header-gradient-success` / `ax-icon-success` - Green (success)
- `ax-header-gradient-neutral` / `ax-icon-neutral` - Gray (neutral)

### Form Sections

```html
<div class="ax-dialog-section">
  <h3 class="ax-dialog-section-title">Basic Information</h3>
  <div class="ax-dialog-section-content">
    <!-- form fields -->
  </div>
</div>
```

### View Dialog Field Layout

```html
<div class="ax-dialog-field-row">
  <span class="ax-dialog-field-label">Field Name</span>
  <span class="ax-dialog-field-value">{{ value }}</span>
</div>
```

## Shared Templates (`templates/shared/`)

### Permission Migration (`permissions-migration.hbs`)

Generates idempotent permission migration:

```typescript
// Creates permissions: create, read, update, delete, export, import
// Assigns to roles: super_admin (all), admin (most), user (read only)
```

## Template Variables

Common variables available in all templates:

| Variable            | Example         | Description               |
| ------------------- | --------------- | ------------------------- |
| `{{moduleName}}`    | `test-products` | Kebab-case name           |
| `{{ModuleName}}`    | `TestProducts`  | PascalCase name           |
| `{{modulename}}`    | `testproducts`  | Lowercase name            |
| `{{tableName}}`     | `test_products` | Original table name       |
| `{{columns}}`       | Array           | Column definitions        |
| `{{primaryKey}}`    | `id`            | Primary key column        |
| `{{hasTimestamps}}` | boolean         | Has created_at/updated_at |
| `{{hasSoftDelete}}` | boolean         | Has deleted_at            |

## CLI Commands

```bash
# List available tables
pnpm run crud:list

# Generate backend (standard)
pnpm run crud -- TABLE_NAME --force

# Generate with import
pnpm run crud:import -- TABLE_NAME --force

# Generate with events
pnpm run crud:events -- TABLE_NAME --force

# Generate frontend
./bin/cli.js generate TABLE_NAME --target frontend --force

# Dry run
pnpm run crud -- TABLE_NAME --dry-run
```

## Reference Implementation

**test-products** is the reference implementation:

- Frontend: `apps/web/src/app/features/test-products/`
- Backend: `apps/api/src/modules/testProducts/`

These were generated by CRUD generator and refined as the template standard. Always compare generated output against test-products to verify correctness.

---

_Last Updated: Session 73 - CSS Token Migration_
