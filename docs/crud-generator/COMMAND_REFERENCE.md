# CRUD Generator - Command Reference

Detailed reference for all CRUD Generator commands and options (v2.2.0)

---

## Table of Contents

1. [Package Scripts](#package-scripts)
2. [CLI Commands](#cli-commands)
3. [Flags Reference](#flags-reference)
4. [Examples](#examples)
5. [Table Name Conventions](#table-name-conventions)

---

## Package Scripts

All scripts defined in `package.json`:

### 1. `pnpm run crud -- TABLE [OPTIONS]`

**Full Command**: `./bin/cli.js generate TABLE [OPTIONS]`

**Description**: Generate basic CRUD module (standard package)

**Examples**:

```bash
# Interactive if no table
pnpm run crud

# With table name
pnpm run crud -- products --force

# With custom package
pnpm run crud -- products --package enterprise --force

# With import
pnpm run crud -- products --with-import --force

# Dry run
pnpm run crud -- products --dry-run
```

### 2. `pnpm run crud:import -- TABLE [OPTIONS]`

**Full Command**: `./bin/cli.js generate TABLE --with-import [OPTIONS]`

**Description**: Generate CRUD with import functionality (Excel/CSV)

**Examples**:

```bash
# Basic import
pnpm run crud:import -- budgets --force

# With events
pnpm run crud:import -- products --with-events --force

# Full package with import
pnpm run crud:import -- orders --package full --force
```

**Includes**:

- Backend import service
- Frontend import dialog
- Validation and error handling
- Progress tracking

### 3. `pnpm run crud:events -- TABLE [OPTIONS]`

**Full Command**: `./bin/cli.js generate TABLE --with-events [OPTIONS]`

**Description**: Generate CRUD with WebSocket events

**Examples**:

```bash
# Basic events
pnpm run crud:events -- notifications --force

# With import
pnpm run crud:events -- products --with-import --force

# Full package with events
pnpm run crud:events -- orders --package full --force
```

**Includes**:

- EventService integration
- Event emission on CRUD operations
- Bulk operation events
- Real-time updates

### 4. `pnpm run crud:full -- TABLE [OPTIONS]`

**Full Command**: `./bin/cli.js generate TABLE --package full [OPTIONS]`

**Description**: Generate with full feature package

**Examples**:

```bash
# Full package
pnpm run crud:full -- products --force

# Full + import + events
./bin/cli.js generate products --package full --with-import --with-events --force
```

**Includes**:

- All standard features
- Bulk operations
- Advanced validation
- Field uniqueness checking
- Export capabilities
- Advanced search/filter
- Statistics endpoints

### 5. `pnpm run crud:list`

**Full Command**: `./bin/cli.js list-tables`

**Description**: List available database tables

**Examples**:

```bash
# List tables
pnpm run crud:list

# Output example:
# Available database tables:
#   • test_products (18 columns)
#   • test_categories (15 columns)
#   • users (12 columns)
```

### 6. `pnpm run crud:validate -- MODULE`

**Full Command**: `./bin/cli.js validate MODULE`

**Description**: Validate generated module structure

**Examples**:

```bash
# Validate module
pnpm run crud:validate -- products

# Output example:
# ✅ Module 'products' is valid
# OR
# ❌ Module 'products' has issues:
#   • Missing controller.ts
#   • Missing service.ts
```

---

## CLI Commands

Direct CLI commands for advanced usage:

### Command: `generate`

**Syntax**:

```bash
./bin/cli.js generate [TABLE_NAME] [OPTIONS]
./libs/aegisx-crud-generator/bin/cli.js generate [TABLE_NAME] [OPTIONS]
```

**Aliases**: `g`

**Description**: Generate CRUD module (core command)

**Arguments**:

- `[TABLE_NAME]` - Optional. Database table name in snake_case (e.g., `test_products`)
  - If not provided, enters interactive mode

**Key Options**:

- `-t, --target <type>` - Generation target: `backend` (default) or `frontend`
- `--package <type>` - Feature package: `standard` (default), `enterprise`, `full`
- `-f, --force` - Overwrite existing files without prompt
- `-d, --dry-run` - Preview files without creating
- `--with-import` - Include import functionality
- `-e, --with-events` - Include WebSocket events
- `-a, --app <app>` - Target app: `api` (default), `web`, `admin`
- `--no-roles` - Skip role generation
- `--flat` - Use flat structure instead of domain

**Examples**:

```bash
# Basic backend
./bin/cli.js generate products --force

# Frontend only
./bin/cli.js generate products --target frontend --force

# With all options
./bin/cli.js generate products --package full --with-import --with-events --force

# Dry run
./bin/cli.js generate products --dry-run

# For specific app
./bin/cli.js generate settings --app admin --force
```

---

### Command: `domain`

**Syntax**:

```bash
./bin/cli.js domain <DOMAIN_NAME> [OPTIONS]
```

**Aliases**: `d`

**Description**: Generate organized domain module with multiple routes

**Arguments**:

- `<DOMAIN_NAME>` - Required. Domain name (e.g., `auth`, `users`)

**Key Options**:

- `-r, --routes <routes>` - Comma-separated routes (e.g., `core,sessions,profiles`)
- `-t, --target <type>` - Generation target: `backend` (default) or `frontend`
- `-e, --with-events` - Include WebSocket events
- `-f, --force` - Overwrite existing files

**Examples**:

```bash
# Domain with routes
./bin/cli.js domain users --routes core,sessions,profiles --force

# Domain with events
./bin/cli.js domain orders --routes core,tracking,returns --with-events --force
```

---

### Command: `route`

**Syntax**:

```bash
./bin/cli.js route <DOMAIN/ROUTE> [OPTIONS]
```

**Aliases**: `r`

**Description**: Add new route to existing domain

**Arguments**:

- `<DOMAIN/ROUTE>` - Required. Route path in format "domain/route" (e.g., `users/sessions`)

**Key Options**:

- `-t, --target <type>` - Generation target: `backend` (default) or `frontend`
- `-e, --with-events` - Include WebSocket events
- `-f, --force` - Overwrite existing files

**Examples**:

```bash
# Add route to domain
./bin/cli.js route users/notifications --force

# Route with events
./bin/cli.js route orders/refunds --with-events --force
```

---

### Command: `list-tables`

**Syntax**:

```bash
./bin/cli.js list-tables
```

**Aliases**: `ls`

**Description**: List available database tables

**Options**: None

**Examples**:

```bash
# List tables
./bin/cli.js list-tables
```

---

### Command: `validate`

**Syntax**:

```bash
./bin/cli.js validate <MODULE_NAME>
```

**Description**: Validate module structure

**Arguments**:

- `<MODULE_NAME>` - Module name to validate

**Examples**:

```bash
./bin/cli.js validate products
```

---

### Command: `packages`

**Syntax**:

```bash
./bin/cli.js packages
```

**Aliases**: `pkg`

**Description**: Display feature package information

**Examples**:

```bash
./bin/cli.js packages
```

**Output**:

```
📦 Available Feature Packages:

🟢 STANDARD (default)
   • Basic CRUD operations
   • Standard REST API endpoints
   • Role-based access control
   • TypeBox schema validation
   • Pagination and filtering

🟡 ENTERPRISE
   • Everything in Standard, plus:
   • Dropdown/Options API
   • Bulk operations
   • Status management
   • Statistics endpoints
   • Enhanced error handling

🔴 FULL
   • Everything in Enterprise, plus:
   • Data validation
   • Field uniqueness checking
   • Advanced search/filter
   • Export capabilities
   • Business rule validation
```

---

### Command: `templates`

**Syntax**:

```bash
./bin/cli.js templates <SUBCOMMAND>
```

**Aliases**: `t`

**Description**: Manage CRUD generator templates

**Subcommands**:

#### `templates list [TYPE]`

- **Aliases**: `ls`
- **Arguments**: `[TYPE]` - Optional: `backend`, `frontend`, or `all`
- **Description**: List available templates

#### `templates set-default`

- **Aliases**: `default`
- **Description**: Set default template (interactive)

#### `templates add`

- **Description**: Add custom template (interactive)

#### `templates remove`

- **Aliases**: `rm`
- **Description**: Remove custom template (interactive)

---

### Command: `config`

**Syntax**:

```bash
./bin/cli.js config <SUBCOMMAND>
```

**Aliases**: `cfg`

**Description**: Manage CRUD generator configuration

**Subcommands**:

#### `config init`

- **Options**: `-f, --force` - Overwrite existing config
- **Description**: Initialize `.crudgen.json` configuration file

#### `config show`

- **Description**: Display current configuration

---

## Flags Reference

### Target Selection Flags

#### `-t, --target <type>`

- **Options**: `backend`, `frontend`
- **Default**: `backend`
- **Description**: Specify what to generate
- **Important**: Generate backend FIRST, then frontend

#### `-a, --app <app>`

- **Options**: `api`, `web`, `admin`
- **Default**: `api`
- **Description**: Target application directory

#### `-o, --output <dir>`

- **Default**: Auto-determined based on app and target
- **Description**: Custom output directory

---

### Feature Package Flags

#### `--package <type>`

- **Options**: `standard`, `enterprise`, `full`
- **Default**: `standard`
- **Description**: Feature package level

| Package    | CRUD | Bulk Ops | Validation | Export | Search   | Stats | Import   |
| ---------- | ---- | -------- | ---------- | ------ | -------- | ----- | -------- |
| standard   | ✅   | ❌       | ❌         | ❌     | Basic    | ❌    | Optional |
| enterprise | ✅   | ✅       | ❌         | ❌     | Good     | ✅    | Optional |
| full       | ✅   | ✅       | ✅         | ✅     | Advanced | ✅    | Optional |

---

### Feature Flags

#### `-e, --with-events`

- **Default**: `false`
- **Description**: Include WebSocket event integration
- **Generates**: EventService, event emission, real-time updates

#### `--with-import`

- **Default**: `false`
- **Description**: Include bulk import (Excel/CSV)
- **Generates**: Import service, import dialog, validation

#### `--smart-stats`

- **Default**: `false`
- **Description**: Auto-detect statistics fields
- **Affects**: Standard statistics endpoint generation

#### `--multiple-roles`

- **Default**: `false`
- **Description**: Generate multiple roles (admin, editor, viewer)
- **Default**: Single role generation

---

### Generation Control Flags

#### `-f, --force`

- **Default**: `false`
- **Description**: Overwrite existing files without prompting
- **Recommended**: Always use for CI/CD and automated generation

#### `-d, --dry-run`

- **Default**: `false`
- **Description**: Preview files without creating
- **Use Case**: Review changes before generating

#### `--flat`

- **Default**: `false`
- **Description**: Use flat structure instead of domain-based
- **Impact**: Affects folder organization

#### `--no-register`

- **Default**: `false`
- **Description**: Skip auto-registration in plugin.loader.ts
- **Use Case**: Manual registration needed

#### `--no-format`

- **Default**: `false`
- **Description**: Skip Prettier code formatting
- **Use Case**: When Prettier is not available

#### `--no-roles`

- **Default**: `false`
- **Description**: Skip role/permission generation
- **Impact**: No permission migration generated

#### `--migration-only`

- **Default**: `false`
- **Description**: Generate migration file only
- **Use Case**: Manual code generation

#### `--direct-db`

- **Default**: `false`
- **Description**: Write roles directly to database
- **WARNING**: Development only, use with caution

---

### Configuration Flags

#### `-c, --config <file>`

- **Description**: Path to custom .crudgen.json configuration file
- **Default**: Searches from project root

---

## Examples

### Example 1: Basic CRUD (Backend + Frontend)

```bash
# Step 1: Generate backend
pnpm run crud -- products --force

# Step 2: Generate frontend
./bin/cli.js generate products --target frontend --force

# Result:
# - API: /api/products
# - Frontend: /products route
# - Components: list, create, edit, view dialogs
```

### Example 2: Import Feature

```bash
# Step 1: Backend with import
pnpm run crud:import -- budgets --force

# Step 2: Frontend with import dialog
./bin/cli.js generate budgets --target frontend --with-import --force

# Result:
# - POST /api/budgets/import endpoint
# - Excel/CSV upload support
# - Frontend import dialog
```

### Example 3: Real-Time Feature

```bash
# Step 1: Backend with events
pnpm run crud:events -- notifications --force

# Step 2: Frontend with event handling
./bin/cli.js generate notifications --target frontend --with-events --force

# Result:
# - WebSocket event emission
# - Real-time list updates
# - Event listeners in UI
```

### Example 4: Enterprise Admin Interface

```bash
# Backend with all features
./bin/cli.js generate users --package enterprise --with-import --with-events --force

# Frontend with all features
./bin/cli.js generate users --target frontend --package enterprise --with-import --with-events --force

# Result:
# - Bulk operations
# - Status management
# - Statistics endpoints
# - Import dialog
# - Real-time updates
```

### Example 5: Regenerate After Template Update

```bash
# Preview changes
pnpm run crud -- products --dry-run

# Apply changes if satisfied
pnpm run crud -- products --force
```

---

## Table Name Conventions

### Automatic Conversions

CRUD Generator automatically converts table names:

| Context         | Format     | Example               |
| --------------- | ---------- | --------------------- |
| Database table  | snake_case | `test_products`       |
| Module folder   | kebab-case | `test-products/`      |
| TypeScript type | PascalCase | `TestProducts`        |
| API route       | kebab-case | `/api/test-products`  |
| Service class   | PascalCase | `TestProductsService` |

### Rules

1. **Input**: Always use database table name (snake_case)

   ```bash
   pnpm run crud -- test_products --force
   ```

2. **Generation**:
   - Folder: `test-products/`
   - Types: `TestProducts`, `CreateTestProducts`, `UpdateTestProducts`
   - Service: `TestProductsService`
   - Routes: `GET /api/test-products`, `POST /api/test-products`, etc.

3. **Naming Pattern**:
   ```
   test_products (database)
   └── test-products/ (folder)
       ├── services/
       │   └── test-products.service.ts
       ├── types/
       │   └── test-products.types.ts
       ├── controllers/
       │   └── test-products.controller.ts
       └── routes/
           └── index.ts
   ```

---

## Quick Reference

### Most Used Commands

```bash
pnpm run crud -- TABLE --force
pnpm run crud:import -- TABLE --force
pnpm run crud:events -- TABLE --force
pnpm run crud:full -- TABLE --force
pnpm run crud:list
./bin/cli.js generate TABLE --target frontend --force
./bin/cli.js list-tables
```

### Important Points

- ✅ Always use `--` with pnpm scripts
- ✅ Generate backend BEFORE frontend
- ✅ Use snake_case for table names
- ✅ Add `--force` to skip prompts
- ❌ Don't use `pnpm aegisx-crud` (doesn't exist)
- ❌ Don't use `--entity` flag (doesn't exist)
- ❌ Don't skip `--` separator with pnpm

---

**Generator Version**: 2.2.0
**Last Updated**: November 6, 2025
**Status**: ✅ Production Ready
