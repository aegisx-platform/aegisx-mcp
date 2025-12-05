# CRUD Generator Changelog

## [2.2.3] - 2025-12-03

### Added

#### Shell-Based Route Registration (`--shell`)

**New CLI flag** to register frontend routes directly into shell routes files instead of `app.routes.ts`.

**Problem Solved**: Previously, CRUD-generated frontend routes were always registered at the root level in `app.routes.ts`. This didn't integrate well with shell-based architectures where routes should be registered as children of shell components (e.g., SystemShell, InventoryShell).

**Usage**:

```bash
# Register in SystemShell routes
./bin/cli.js generate products --target frontend --shell system --force

# Register in InventoryShell routes
./bin/cli.js generate products --target frontend --shell inventory --force
```

**How it works**:

- Routes are registered as **children** of the shell component
- Shell routes file: `apps/{app}/src/app/features/{shell}/{shell}.routes.ts`
- Falls back to `app.routes.ts` if shell routes file not found
- Automatically detects duplicate routes to prevent double registration

**Example Result** (in `system.routes.ts`):

```typescript
export const SYSTEM_ROUTES: Routes = [
  {
    path: '',
    component: SystemShellComponent,
    children: [
      // ... existing routes ...

      // Products (Generated CRUD)
      {
        path: 'products',
        loadChildren: () => import('../products/products.routes').then((m) => m.productsRoutes),
        data: {
          title: 'Products',
          description: 'Products Management System',
          requiredPermissions: ['products.read', 'admin.*'],
        },
      },
    ],
  },
];
```

**Files Modified**:

- `bin/cli.js` - Added `--shell` option and auto-detection for frontend target
- `lib/generators/frontend-generator.js` - Added `autoRegisterShellRoute()` function

### Fixed

#### Auto-Detection of App Target for Frontend Generation

When `--target frontend` is specified without `--app`, the generator now automatically defaults to `--app web` instead of `--app api`. This prevents frontend files from being incorrectly generated to the API app folder.

---

## [2.2.2] - 2025-12-03

### Added

#### Multi-App Frontend Generation (`--app`)

**New CLI flag** to generate frontend modules to different Angular apps in the monorepo.

**Problem Solved**: Previously, frontend generation was hardcoded to only generate files to `apps/web/`. This update enables generating to any app (web, admin, or custom apps).

**Usage**:

```bash
# Generate to web app (default behavior)
./bin/cli.js generate products --target frontend --force

# Generate to admin app
./bin/cli.js generate products --target frontend --app admin --force
```

**Output Directories by App**:

- `--app web` → `apps/web/src/app/features/`
- `--app admin` → `apps/admin/src/app/features/`

**Auto-Registration**:

- Routes are automatically registered in the target app's `app.routes.ts`
- If `app.routes.ts` doesn't exist for the target app, a warning is shown

**Files Modified**:

- `bin/cli.js` - Pass `app` option to FrontendGenerator
- `lib/generators/frontend-generator.js` - Dynamic `outputDir` and `autoRegisterRoute()` based on target app

---

## [2.2.1] - 2025-11-28

### Added

#### Audit Fields Control (`--include-audit-fields`)

**New CLI flag** to control whether audit fields appear in generated frontend forms.

**Problem Solved**: Previously, audit fields (`created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`) were inconsistently included in forms. Now they are excluded by default since they are typically auto-managed by the backend.

**Default Behavior** (without flag):

- Audit fields are **excluded** from forms
- Users cannot manually set these values
- Backend handles audit field population automatically

**With `--include-audit-fields`**:

- Audit fields are **included** in forms
- Useful for admin interfaces or data migration tools
- Provides manual control over audit timestamps

**Usage**:

```bash
# Default: audit fields hidden from forms
./bin/cli.js generate products --target frontend --force

# Include audit fields (admin use case)
./bin/cli.js generate products --target frontend --include-audit-fields --force
```

**Audit Fields Affected**:

- `id` - Primary key (always excluded from forms)
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp
- `created_by` - User who created the record
- `updated_by` - User who last updated the record
- `deleted_by` - User who deleted the record

**Files Modified**:

- `bin/cli.js` - Added `--include-audit-fields` option
- `lib/generators/frontend-generator.js` - Added `AUDIT_FIELDS` constant and filtering logic

---

## [2.1.1] - 2025-10-31

### Changed

#### Authorization Pattern Migration

**Migrated from role-based to permission-based authorization** across all CRUD Generator backend templates.

**Problem Solved**: The previous `authorize(['resource.action', 'admin'])` pattern required manually listing the 'admin' role in every route, creating maintenance burden and potential security gaps.

**Solution - Permission-Based Authorization**:

1. **Simplified Authorization Pattern**
   - **Before**: `fastify.authorize(['{{moduleName}}.create', 'admin'])`
   - **After**: `fastify.verifyPermission('{{moduleName}}', 'create')`
   - **Impact**: Admin users automatically get access via `*:*` wildcard permission

2. **Enhanced Security Features**
   - Redis-cached permission checks for performance
   - Database-backed permission validation
   - Wildcard support: `*:*` (admin), `resource:*`, `*:action`
   - Granular permission control per operation

3. **Better RBAC Integration**
   - Aligns with platform's multi-role RBAC system
   - Supports dynamic permission assignment
   - Enables fine-grained access control without code changes

**Files Modified**:

- `templates/backend/standard/routes.hbs` - 16 authorization points updated
- `templates/backend/domain/route.hbs` - 17 authorization points updated (includes export)
- `templates/backend/import-routes.hbs` - 3 authorization points updated
- **Total**: 36 authorization points migrated across 3 templates

**Migration Pattern**:

```typescript
// Standard CRUD operations
create:   authorize(['resource.create', 'admin']) → verifyPermission('resource', 'create')
read:     authorize(['resource.read', 'admin'])   → verifyPermission('resource', 'read')
update:   authorize(['resource.update', 'admin']) → verifyPermission('resource', 'update')
delete:   authorize(['resource.delete', 'admin']) → verifyPermission('resource', 'delete')

// Enhanced operations (Enterprise/Full packages)
export:   authorize(['resource.read', 'resource.export', 'admin']) → verifyPermission('resource', 'export')
dropdown: authorize(['resource.read', 'admin'])   → verifyPermission('resource', 'read')
validate: authorize(['resource.create', 'resource.update', 'admin']) → verifyPermission('resource', 'read')
```

**Benefits**:

- ✅ **No Manual Admin Inclusion**: Admin role gets automatic access via wildcard permissions
- 🔒 **Better Security**: Database-backed permission checks with Redis cache
- 🎯 **Granular Control**: Fine-grained permissions without template changes
- ⚡ **Performance**: Redis-cached permission lookups
- 🏗️ **Scalable**: Easy to extend with new permission patterns

**Backward Compatibility**:

- `authorize` method still exists as alias for `verifyRole`
- Existing generated code continues to work
- Platform supports both patterns during transition
- Regenerate modules to get new authorization pattern

**Example Generated Code**:

```typescript
// Create route with new pattern
fastify.post('/', {
  schema: {
    /* ... */
  },
  preValidation: [
    fastify.authenticate,
    fastify.verifyPermission('budgets', 'create'), // ✅ Simpler, more secure
  ],
  handler: controller.create.bind(controller),
});
```

---

# Changelog

All notable changes to AegisX CRUD Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-10-28

### Added

#### HIS Mode (Hospital Information System Mode)

**New Default Behavior**: Prioritize data accuracy over real-time speed for critical healthcare and enterprise systems.

**Problem Solved**: Optimistic updates in critical systems (like Hospital Information Systems) can cause dangerous data misunderstandings:

- User sees "deleted" but server rejects due to business rules
- UI shows outdated data that doesn't match database
- Critical decisions made based on incorrect UI state

**Solution - HIS Mode Architecture**:

1. **Backend Always Emits Events** (for audit trail and event-driven architecture)
   - All CRUD operations emit WebSocket events when generated with `--with-events`
   - Events available for microservices integration and audit logging
   - Event structure: `feature.entity.action` (e.g., `budgets.budgets.created`)

2. **Frontend Uses Reload Trigger** (default behavior for data accuracy)
   - Services return data WITHOUT modifying local state
   - List components refresh via `reloadTrigger` signal after operations
   - UI always displays actual server-verified data
   - No optimistic updates that might mislead users

3. **Optional Real-Time Mode** (easy to enable when needed)
   - Comprehensive commented WebSocket subscription code provided in templates
   - 4 code blocks to uncomment for enabling real-time CRUD updates
   - State manager still initializes (always needed for import events)
   - Perfect for non-critical features that benefit from instant feedback

**Files Modified**:

- `templates/frontend/v2/service.hbs` - Removed optimistic updates from create/update/delete
- `templates/backend/domain/controller.hbs` - Added event emission after CRUD operations
- `templates/frontend/v2/list-component-v2.hbs` - Added commented WebSocket subscription code
- `docs/crud-generator/EVENTS_GUIDE.md` - Comprehensive HIS Mode documentation

**Benefits**:

- ⚕️ **Data Accuracy First**: UI always shows actual database state
- 🛡️ **No Confusion**: Users never see outdated or rejected data
- 📊 **Audit Trail**: Backend always emits events for compliance
- 🏗️ **Event-Driven Ready**: Events available for microservices
- 🔧 **Flexible**: Easy to enable real-time updates when appropriate

**Migration Guide**:

Regenerate modules to get HIS Mode behavior:

```bash
# With events for audit trail
pnpm aegisx-crud budgets --package --with-events --force

# With import + events
pnpm aegisx-crud budgets --package --with-import --with-events --force
```

**Enabling Optional Real-Time Updates**:

1. Locate the 4 commented code blocks in list component
2. Uncomment imports, properties, constructor setup, and event listeners
3. WebSocket will automatically sync CRUD operations across clients
4. See EVENTS_GUIDE.md for detailed instructions

**Example HIS Mode Pattern**:

```typescript
// Service returns data without optimistic update
async deleteBudgets(id: string): Promise<boolean> {
  const response = await this.httpClient.delete(`${this.baseUrl}/${id}`);
  if (response?.success) {
    return true; // ✅ No optimistic update
  }
  return false;
}

// Backend always emits event (audit trail)
this.eventService.for('budgets', 'budgets').emitCustom('deleted', { id }, 'normal');

// List component refreshes from server
async onDeleteBudget(budget: Budgets) {
  await this.budgetsService.deleteBudgets(budget.id);
  this.reloadTrigger.update(n => n + 1); // ✅ Refresh from database
}
```

### Changed

- **Default Behavior**: Services no longer perform optimistic updates
- **Event Emission**: Backend controllers always emit events (when `--with-events` used)
- **List Refresh**: Components use reload trigger pattern instead of local state updates

### Removed

- Cleanup of unused test files in `apps/` directory
- Removed optimistic update logic from service templates

### Documentation

- Updated EVENTS_GUIDE.md with comprehensive HIS Mode documentation
- Added "Why HIS Mode?" section with healthcare example
- Added "Enabling Optional Real-Time Updates" step-by-step guide
- Added complete example with real-time enabled component

---

## [2.0.1] - 2025-10-26

### Fixed

#### Import Dialog Template Type Alignment

**Problem**: Generated import dialogs had type mismatches with BaseImportService API responses, causing runtime errors during import operations.

**Root Cause**: Template used nested object structure while backend API returns flat structure.

**Changes Made**:

1. **Progress Property Alignment**
   - **Before**: `progress.percentage` (nested object)
   - **After**: `progress` (direct number 0-100)
   - **Impact**: Progress updates now work correctly without null reference errors

2. **Summary Properties Simplified**
   - **Before**: `summary.created`, `summary.updated`, `summary.failed`
   - **After**: `successCount`, `failedCount` (flat structure)
   - **Impact**: Success/failure counts display correctly in completion screen

3. **Error Handling Streamlined**
   - **Before**: `errors[]` array with complex error objects
   - **After**: `error` single string message
   - **Impact**: Error messages display clearly without iteration complexity

4. **Status Types Corrected**
   - **Before**: Included 'partial' status (unsupported by backend)
   - **After**: Only 'completed' and 'failed' statuses
   - **Impact**: Status checks work reliably without edge cases

**Files Modified**:

- `templates/frontend/v2/import-dialog.hbs` - Updated ImportJob interface
- `templates/frontend/v2/types.hbs` - Aligned type definitions
- `templates/backend/domain/schemas.hbs` - Ensured schema consistency

**Validation**: Budgets module regenerated and tested successfully with real import operations.

**Migration Guide**: Regenerate any modules using `--with-import` flag to get updated templates:

```bash
pnpm run crud-gen budgets --entity Budget --force --with-import
```

### Technical Details

**Breaking Changes**: None for end users. Template updates only affect newly generated code.

**Backend Compatibility**: Works with existing BaseImportService (no backend changes required).

**Type Safety**: All TypeScript interfaces now match runtime API responses exactly.

**Reference Implementation**: See `apps/web/src/app/modules/budgets/` for working example.

---

## [2.0.0] - 2025-10-21

### Added

#### Interactive CLI Mode

- **Step-by-step wizard** using inquirer prompts
- **Intelligent defaults** based on project analysis
- **Validation** at each step with helpful error messages
- **Confirmation screen** before generation

#### Template Management System

- **Multiple backend templates**: Standard, Enterprise, Advanced
- **Multiple frontend templates**: Basic, Material, Advanced
- **Version-specific templates**: Organized by Angular/Fastify versions
- **Template customization**: Easy to add custom templates

#### Configuration System

- **`.crudgen.json`** for project-level defaults
- **Persistent settings**: Remember package preferences, output paths
- **Environment detection**: Auto-configure based on monorepo structure
- **Override support**: CLI flags override config file settings

#### Package System

- **Standard Package**: Basic CRUD operations (Create, Read, Update, Delete)
- **Enterprise Package**: Standard + Events + Import/Export
- **Full Package**: Everything including Audit Logs, Soft Delete, Advanced Search

#### Feature Flags

- **`--with-events`**: WebSocket real-time event emission
- **`--with-import`**: Bulk import with Excel/CSV support
- **`--with-export`**: Export to Excel/CSV formats
- **`--with-audit`**: Audit trail for all operations
- **`--with-soft-delete`**: Soft delete with trash/restore

#### Developer Experience

- **`--dry-run`**: Preview what will be generated without creating files
- **`--force`**: Regenerate existing modules (overwrite protection)
- **`--verbose`**: Detailed logging for debugging
- **Color-coded output**: Success (green), warnings (yellow), errors (red)

#### Code Quality

- **TypeBox schemas**: Full request/response validation
- **OpenAPI integration**: Auto-generated API documentation
- **Type safety**: End-to-end TypeScript type checking
- **Error handling**: Comprehensive error responses with proper HTTP codes

### Changed

#### CLI Architecture

- **Modular design**: Separate generators for backend/frontend/docs
- **Template engine**: Handlebars with custom helpers
- **Config management**: Centralized configuration loading
- **Error reporting**: Better error messages with context

#### Code Generation

- **Backend patterns**: BaseRepository, BaseService, BaseController
- **Frontend patterns**: Signals-based state management, Material UI
- **Type alignment**: Frontend types match backend schemas exactly
- **File organization**: Better separation of concerns

#### Documentation

- **Auto-generated docs**: Feature documentation for each module
- **API contracts**: OpenAPI-based API documentation
- **Developer guides**: Complete guides for each generated module
- **Examples**: Working code examples in every guide

### Improved

#### Type Safety

- **Schema-first**: All routes start with TypeBox schemas
- **Type exports**: Automatic TypeScript type generation from schemas
- **Generic types**: Proper generics throughout repository/service layers
- **Null safety**: Strict null checks enabled

#### Testing Support

- **Test templates**: Unit test scaffolding for services
- **Mock factories**: Test data generation utilities
- **E2E setup**: Playwright test structure
- **Coverage**: Test coverage configuration

#### Error Handling

- **Validation errors**: Clear, actionable error messages
- **Business logic errors**: Custom error classes
- **Database errors**: Graceful handling with user-friendly messages
- **API errors**: Proper HTTP status codes and error responses

### Deprecated

#### Legacy Patterns

- **Manual type definitions**: Replaced by schema-generated types
- **Unvalidated requests**: All requests now validated by TypeBox
- **Inconsistent naming**: Standardized naming conventions
- **Scattered files**: Consolidated into feature modules

### Fixed

#### Common Issues

- **Type mismatches**: Frontend-backend type alignment
- **Validation gaps**: All endpoints now properly validated
- **Missing error handling**: Comprehensive error coverage
- **Import path issues**: Consistent relative imports

#### Template Bugs

- **Hardcoded values**: Removed all hardcoded strings
- **Inconsistent formatting**: Prettier integration
- **Missing exports**: All necessary exports included
- **Circular dependencies**: Proper dependency management

### Security

#### Enhancements

- **Input validation**: All inputs validated against schemas
- **SQL injection prevention**: Parameterized queries only
- **XSS protection**: Proper output encoding
- **CORS configuration**: Secure CORS settings

---

## [1.x.x] - Legacy Versions

Previous versions used manual code generation without template system.
See git history for details on legacy implementations.

---

## Upgrade Guide

### From 1.x to 2.0.0

1. **Install latest version**:

   ```bash
   cd libs/aegisx-cli
   pnpm install
   ```

2. **Create configuration file**:

   ```bash
   pnpm run crud-gen --init
   ```

3. **Review `.crudgen.json`**:
   - Set default package
   - Configure output paths
   - Set template preferences

4. **Regenerate modules** (optional):

   ```bash
   # Use --force to overwrite existing files
   pnpm run crud-gen your-module --force
   ```

5. **Update imports**:
   - Check for any import path changes
   - Verify type imports from schemas

### From 2.0.0 to 2.0.1

1. **For existing modules with import feature**:

   ```bash
   # Regenerate to get fixed import dialog
   pnpm run crud-gen your-module --with-import --force
   ```

2. **Verify type alignment**:
   - Check ImportJob interface matches BaseImportService
   - Test import functionality end-to-end
   - Verify progress tracking works correctly

3. **No other changes required** - v2.0.1 is a template-only fix

---

## Future Roadmap

### Planned for 2.1.0

- **GraphQL support**: Optional GraphQL endpoint generation
- **Real-time lists**: WebSocket-powered live updates for list views
- **Advanced search**: Elasticsearch integration option
- **Batch operations**: Select multiple items for bulk actions
- **Custom validators**: Plugin system for custom validation rules

### Planned for 2.2.0

- **Mobile templates**: React Native component generation
- **API versioning**: Support for versioned APIs
- **Multi-tenancy**: Tenant isolation patterns
- **Internationalization**: i18n support in generated code

### Under Consideration

- **Microservices mode**: Generate service-per-module architecture
- **Event sourcing**: CQRS/Event Sourcing patterns
- **Custom UI frameworks**: Support for other UI libraries
- **Database migrations**: Auto-generate Knex migrations

---

## Contributing

When making changes to templates:

1. Update version in `package.json`
2. Document changes in this CHANGELOG
3. Add examples to relevant guides
4. Test with `--dry-run` first
5. Regenerate example modules for validation

## Links

- **Main Documentation**: `/docs/crud-generator/README.md`
- **User Guide**: `/docs/crud-generator/USER_GUIDE.md`
- **API Reference**: `/docs/crud-generator/API_REFERENCE.md`
- **Events Guide**: `/docs/crud-generator/EVENTS_GUIDE.md`
- **Import Guide**: `/docs/crud-generator/IMPORT_GUIDE.md`
- **Quick Commands**: `/docs/crud-generator/QUICK_COMMANDS.md`
