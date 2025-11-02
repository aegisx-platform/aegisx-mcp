# CRUD Generator Quick Reference

Complete command reference for the AegisX CRUD Generator.

## Basic Generation

### Generate Basic CRUD (No Import, No Events)

```bash
pnpm aegisx-crud books --package
```

Creates:

- Backend: controller, service, repository, routes, schemas, tests
- Frontend: list, create/edit/view dialogs, service, types
- Database: Migration file

### Generate with Import Functionality

```bash
pnpm aegisx-crud budgets --package --with-import
```

Adds:

- Backend import service with Excel/CSV support
- Frontend import dialog component
- Validation and error handling
- Progress tracking

### Generate with WebSocket Events

```bash
pnpm aegisx-crud notifications --package --with-events
```

Adds:

- EventService integration
- Event emission on create/update/delete
- Bulk operation events (bulk_started, bulk_progress, bulk_completed)
- Real-time updates via WebSocket

### Generate with Both Import and Events

```bash
pnpm aegisx-crud products --package --with-import --with-events
```

Full-featured CRUD with both import dialog and real-time events.

## Advanced Options

### Dry Run (Preview Without Creating Files)

```bash
pnpm aegisx-crud articles --package --dry-run
```

Shows what files would be created/modified without actually creating them.

### Force Overwrite Existing Files

```bash
pnpm aegisx-crud users --package --force
```

Overwrites existing files. Use when regenerating after template updates.

### Combine All Flags

```bash
pnpm aegisx-crud inventory --package --with-import --with-events --force
```

Generate with all features and force overwrite existing files.

## Common Workflows

### 1. New Feature with Import

```bash
# Generate CRUD with import dialog
pnpm aegisx-crud budgets --package --with-import

# Files created:
# Backend:
#   - apps/api/src/modules/budgets/budgets.controller.ts
#   - apps/api/src/modules/budgets/budgets.service.ts
#   - apps/api/src/modules/budgets/budgets.repository.ts
#   - apps/api/src/modules/budgets/budgets.routes.ts
#   - apps/api/src/modules/budgets/budgets.schemas.ts
#   - apps/api/src/modules/budgets/budgets.spec.ts
#
# Frontend:
#   - apps/web/src/app/features/budgets/budgets-list.component.ts
#   - apps/web/src/app/features/budgets/budget-dialog.component.ts
#   - apps/web/src/app/features/budgets/budget-import-dialog.component.ts
#   - apps/web/src/app/features/budgets/budgets.service.ts
#   - apps/web/src/app/features/budgets/budgets.types.ts
#
# Database:
#   - apps/api/src/database/migrations/XXX_create_budgets_table.ts
```

### 2. Real-Time Feature with Events

```bash
# Generate CRUD with WebSocket events
pnpm aegisx-crud notifications --package --with-events

# Backend includes:
# - EventService integration in controller
# - Event emission on create/update/delete operations
# - Bulk operation events with progress tracking
# - Proper error handling for event failures
#
# Frontend can subscribe to:
# - notification:created
# - notification:updated
# - notification:deleted
# - notifications:bulk_started
# - notifications:bulk_progress
# - notifications:bulk_completed
```

### 3. Regenerate Existing Feature

```bash
# Review changes first
pnpm aegisx-crud books --package --dry-run

# Check what files would be modified
# Review the changes carefully

# Force regenerate if satisfied
pnpm aegisx-crud books --package --force
```

Useful when:

- Template updates available
- Need to apply new patterns to existing code
- Want to standardize older implementations

## Flag Reference

| Flag            | Description                                | Use Case                          |
| --------------- | ------------------------------------------ | --------------------------------- |
| `--package`     | Use `.crudgen.json` config                 | ✅ ALWAYS use this flag           |
| `--with-import` | Add import dialog + backend import service | Bulk data import features         |
| `--with-events` | Add WebSocket real-time events             | Live updates, notifications       |
| `--dry-run`     | Preview changes without creating files     | Review before generation          |
| `--force`       | Overwrite existing files                   | Regenerate after template updates |

## Configuration File

The generator uses `.crudgen.json` in the project root for configuration:

```json
{
  "outputDir": "apps/api/src/modules",
  "frontendOutputDir": "apps/web/src/app/features",
  "migrationDir": "apps/api/src/database/migrations",
  "templateDir": "libs/aegisx-crud-generator/templates",
  "namingConvention": "kebab-case",
  "features": {
    "import": false,
    "events": false,
    "audit": true,
    "softDelete": true
  }
}
```

### Configuration Options

- **outputDir**: Backend module output directory
- **frontendOutputDir**: Frontend feature output directory
- **migrationDir**: Database migration output directory
- **templateDir**: Custom template directory (optional)
- **namingConvention**: File naming convention (kebab-case, camelCase, PascalCase)
- **features**: Default feature flags
  - **import**: Enable import functionality by default
  - **events**: Enable WebSocket events by default
  - **audit**: Enable audit logging (created_at, updated_at, created_by, updated_by)
  - **softDelete**: Enable soft delete (deleted_at field)

## Generated File Structure

### Backend Structure

```
apps/api/src/modules/[entity-name]/
├── [entity-name].controller.ts    # HTTP endpoints
├── [entity-name].service.ts       # Business logic
├── [entity-name].repository.ts    # Database queries
├── [entity-name].routes.ts        # Route definitions
├── [entity-name].schemas.ts       # TypeBox schemas
└── [entity-name].spec.ts          # Unit tests
```

### Frontend Structure

```
apps/web/src/app/features/[entity-name]/
├── [entity-name]-list.component.ts         # List view with table
├── [entity-name]-dialog.component.ts       # Create/Edit/View dialog
├── [entity-name]-import-dialog.component.ts # Import dialog (with --with-import)
├── [entity-name].service.ts                # HTTP service
└── [entity-name].types.ts                  # TypeScript interfaces
```

### Database Migration

```
apps/api/src/database/migrations/
└── [timestamp]_create_[entity_name]_table.ts
```

## Best Practices

### 1. Always Use --package Flag

```bash
# ✅ Correct
pnpm aegisx-crud books --package

# ❌ Wrong (ignores .crudgen.json config)
pnpm aegisx-crud books
```

### 2. Review with Dry Run First

```bash
# Preview changes first
pnpm aegisx-crud articles --package --dry-run

# Then generate if satisfied
pnpm aegisx-crud articles --package
```

### 3. Use Flags for Specific Features Only

```bash
# Only add flags when you need them
pnpm aegisx-crud users --package --with-import

# Don't add unnecessary flags
pnpm aegisx-crud simple-lookup --package  # No import/events needed
```

### 4. Backup Before Force Regeneration

```bash
# Commit your changes first
git add .
git commit -m "feat: add custom validations to books module"

# Then force regenerate
pnpm aegisx-crud books --package --force

# Review changes
git diff

# If needed, cherry-pick your customizations back
```

## Troubleshooting

### Error: ".crudgen.json not found"

**Solution**: Ensure you're in the project root directory where `.crudgen.json` exists.

```bash
# Check current directory
pwd

# Should be in project root
cd /path/to/aegisx-starter

# Verify config exists
cat .crudgen.json
```

### Error: "Table already exists"

**Solution**: The migration has already been run. Either:

1. Rollback the migration first
2. Use `--force` to overwrite files (won't re-run migration)

```bash
# Option 1: Rollback migration
pnpm db:rollback

# Option 2: Force regenerate (keeps existing table)
pnpm aegisx-crud books --package --force
```

### Generated Files Not Matching Expected Pattern

**Solution**: Check your `.crudgen.json` configuration:

```bash
# Verify config
cat .crudgen.json

# Check template directory
ls libs/aegisx-crud-generator/templates/
```

### Import Dialog Not Generated

**Solution**: Ensure you used the `--with-import` flag:

```bash
# Regenerate with import flag
pnpm aegisx-crud products --package --with-import --force
```

## Examples by Use Case

### Simple Lookup Table

```bash
# No import, no events - just basic CRUD
pnpm aegisx-crud categories --package
```

### Master Data with Import

```bash
# Enable import for bulk data loading
pnpm aegisx-crud products --package --with-import
```

### Real-Time Notifications

```bash
# Enable events for live updates
pnpm aegisx-crud notifications --package --with-events
```

### Full-Featured Transaction Module

```bash
# Both import and events
pnpm aegisx-crud invoices --package --with-import --with-events
```

### Quick Prototype

```bash
# Dry run to see what would be generated
pnpm aegisx-crud prototypes --package --dry-run
```

## Related Documentation

- **[Git Workflow](./GIT_WORKFLOW.md)** - Version release and NPM publishing
- **[Complete Guide](./README.md)** - Full CRUD generator documentation
- **[Templates](../../libs/aegisx-crud-generator/templates/)** - Template customization

---

**📚 For complete documentation, see `docs/crud-generator/` directory**
