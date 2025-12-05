# AegisX CLI - Complete Command Reference

> Comprehensive documentation for all CLI commands

---

## Table of Contents

1. [generate](#generate-command)
2. [domain](#domain-command)
3. [route](#route-command)
4. [shell](#shell-command)
5. [list-tables](#list-tables-command)
6. [validate](#validate-command)
7. [packages](#packages-command)
8. [templates](#templates-command)
9. [config](#config-command)
10. [License Commands](#license-commands)

---

## generate Command

Generate CRUD modules for backend or frontend.

### Syntax

```bash
aegisx generate [table-name] [options]
aegisx g [table-name] [options]
```

### Arguments

| Argument     | Required | Description                                    |
| ------------ | -------- | ---------------------------------------------- |
| `table-name` | Optional | Database table name. Interactive mode if empty |

### Options

| Option                   | Alias | Default    | Description                                 |
| ------------------------ | ----- | ---------- | ------------------------------------------- |
| `--target <type>`        | `-t`  | `backend`  | Generation target: `backend`, `frontend`    |
| `--domain <path>`        | -     | -          | Domain path (e.g., `inventory/master-data`) |
| `--schema <schema>`      | `-s`  | `public`   | PostgreSQL schema to read table from        |
| `--app <app>`            | `-a`  | `api`      | Target app: `api`, `web`, `admin`           |
| `--output <dir>`         | `-o`  | -          | Custom output directory (overrides --app)   |
| `--package <type>`       | -     | `standard` | Package: `standard`, `enterprise`, `full`   |
| `--with-events`          | `-e`  | `false`    | Include WebSocket events                    |
| `--with-import`          | -     | `false`    | Include bulk import (Excel/CSV)             |
| `--force`                | `-f`  | `false`    | Force overwrite existing files              |
| `--dry-run`              | `-d`  | `false`    | Preview files without creating              |
| `--shell <name>`         | -     | -          | Target shell for route registration         |
| `--no-register`          | -     | `false`    | Skip auto-registration in plugin.loader.ts  |
| `--include-audit-fields` | -     | `false`    | Include audit fields in forms               |
| `--direct-db`            | -     | `false`    | Write roles directly to database (dev only) |
| `--no-roles`             | -     | `false`    | Skip role generation entirely               |
| `--migration-only`       | -     | `false`    | Generate migration file only                |
| `--multiple-roles`       | -     | `false`    | Generate admin, editor, viewer roles        |
| `--smart-stats`          | -     | `false`    | Enable smart statistics detection           |
| `--no-format`            | -     | `false`    | Skip auto-formatting generated files        |
| `--config <file>`        | `-c`  | -          | Configuration file path                     |
| `--help`                 | `-h`  | -          | Display help                                |

### Examples

```bash
# Basic backend CRUD
aegisx generate products --force

# With domain structure
aegisx generate drugs --domain inventory/master-data --force

# From specific schema
aegisx generate drug_lots --schema inventory --force

# Frontend component
aegisx generate products --target frontend --force

# Full-featured backend
aegisx generate orders --with-events --with-import --force

# Enterprise package with all features
aegisx generate invoices --package enterprise --with-events --force

# Dry run to preview
aegisx generate users --dry-run

# Interactive mode
aegisx generate
```

---

## domain Command

Generate a domain module with organized structure.

### Syntax

```bash
aegisx domain <domain-name> [options]
aegisx d <domain-name> [options]
```

### Arguments

| Argument      | Required | Description             |
| ------------- | -------- | ----------------------- |
| `domain-name` | Yes      | Domain name to generate |

### Options

| Option              | Alias | Default   | Description                    |
| ------------------- | ----- | --------- | ------------------------------ |
| `--routes <routes>` | `-r`  | -         | Comma-separated list of routes |
| `--with-events`     | `-e`  | `false`   | Include real-time events       |
| `--target <type>`   | `-t`  | `backend` | Generation target              |
| `--app <app>`       | `-a`  | `api`     | Target app                     |
| `--output <dir>`    | `-o`  | -         | Custom output directory        |
| `--force`           | `-f`  | `false`   | Force overwrite                |
| `--dry-run`         | `-d`  | `false`   | Preview without creating       |
| `--config <file>`   | `-c`  | -         | Configuration file path        |
| `--help`            | `-h`  | -         | Display help                   |

### Examples

```bash
# Basic domain with routes
aegisx domain users --routes core,profiles,preferences --force

# Domain with events
aegisx domain notifications --routes alerts,inbox --with-events --force

# Preview domain structure
aegisx domain inventory --routes master-data,transactions --dry-run
```

---

## route Command

Add route to existing domain module.

### Syntax

```bash
aegisx route <route-path> [options]
aegisx r <route-path> [options]
```

### Arguments

| Argument     | Required | Description       |
| ------------ | -------- | ----------------- |
| `route-path` | Yes      | Route path to add |

### Options

| Option            | Alias | Default   | Description              |
| ----------------- | ----- | --------- | ------------------------ |
| `--with-events`   | `-e`  | `false`   | Include real-time events |
| `--target <type>` | `-t`  | `backend` | Generation target        |
| `--app <app>`     | `-a`  | `api`     | Target app               |
| `--force`         | `-f`  | `false`   | Force overwrite          |
| `--dry-run`       | `-d`  | `false`   | Preview without creating |
| `--help`          | `-h`  | -         | Display help             |

---

## shell Command

Generate Angular app shell (layout with navigation).

### Syntax

```bash
aegisx shell <shell-name> [options]
aegisx sh <shell-name> [options]
```

### Arguments

| Argument     | Required | Description            |
| ------------ | -------- | ---------------------- |
| `shell-name` | Yes      | Shell name to generate |

### Options

| Option                  | Alias | Default      | Description                                       |
| ----------------------- | ----- | ------------ | ------------------------------------------------- |
| `--type <type>`         | `-t`  | `enterprise` | Shell type: `simple`, `enterprise`, `multi-app`   |
| `--app <app>`           | `-a`  | `web`        | Target app: `web`, `admin`                        |
| `--name <name>`         | `-n`  | -            | Display name for the shell                        |
| `--theme <theme>`       | -     | `default`    | Theme preset: `default`, `indigo`, `teal`, `rose` |
| `--order <number>`      | -     | `0`          | App order in launcher                             |
| `--with-dashboard`      | -     | `true`       | Include dashboard page                            |
| `--with-settings`       | -     | `false`      | Include settings page                             |
| `--with-auth`           | -     | `true`       | Include AuthGuard and AuthService                 |
| `--with-theme-switcher` | -     | `false`      | Include theme switcher component                  |
| `--force`               | `-f`  | `false`      | Force overwrite                                   |
| `--dry-run`             | `-d`  | `false`      | Preview without creating                          |
| `--no-format`           | -     | `false`      | Skip auto-formatting                              |
| `--help`                | `-h`  | -            | Display help                                      |

### Shell Types

| Type         | Description                         |
| ------------ | ----------------------------------- |
| `simple`     | Minimal layout without navigation   |
| `enterprise` | Full sidebar + header (default)     |
| `multi-app`  | Enterprise + sub-app tabs in header |

### Examples

```bash
# Enterprise shell (default)
aegisx shell reports --force

# Simple shell for auth pages
aegisx shell auth --type simple --force

# Multi-app shell for complex modules
aegisx shell warehouse --type multi-app --force

# With additional features
aegisx shell admin --with-settings --with-theme-switcher --force

# For admin app
aegisx shell system --app admin --force

# With custom theme
aegisx shell inventory --theme indigo --force
```

---

## list-tables Command

List available database tables.

### Syntax

```bash
aegisx list-tables [options]
aegisx ls [options]
```

### Options

| Option            | Alias | Default  | Description               |
| ----------------- | ----- | -------- | ------------------------- |
| `--schema <name>` | `-s`  | `public` | PostgreSQL schema to list |
| `--help`          | `-h`  | -        | Display help              |

### Examples

```bash
# List tables in public schema
aegisx list-tables

# List tables in specific schema
aegisx list-tables --schema inventory
```

---

## validate Command

Validate generated module structure.

### Syntax

```bash
aegisx validate <module-name>
```

### Arguments

| Argument      | Required | Description             |
| ------------- | -------- | ----------------------- |
| `module-name` | Yes      | Module name to validate |

### Examples

```bash
# Validate module
aegisx validate products

# Validate domain module
aegisx validate inventory/master-data/drugs
```

---

## packages Command

Show available feature packages.

### Syntax

```bash
aegisx packages
aegisx pkg
```

### Output

```
📦 Available Feature Packages:

🟢 STANDARD (default)
   • Basic CRUD operations (Create, Read, Update, Delete)
   • Standard REST API endpoints
   • Role-based access control
   • TypeBox schema validation
   • Pagination and filtering

🟡 ENTERPRISE
   • Everything in Standard, plus:
   • Dropdown/Options API for UI components
   • Bulk operations (create, update, delete)
   • Status management (activate, deactivate, toggle)
   • Statistics and analytics endpoints
   • Enhanced error handling

🔴 FULL
   • Everything in Enterprise, plus:
   • Data validation before save
   • Field uniqueness checking
   • Advanced search and filtering
   • Export capabilities
   • Business rule validation
```

---

## templates Command

Manage CRUD generator templates.

### Syntax

```bash
aegisx templates <subcommand>
aegisx t <subcommand>
```

### Subcommands

| Subcommand    | Alias     | Description              |
| ------------- | --------- | ------------------------ |
| `list`        | `ls`      | List available templates |
| `set-default` | `default` | Set default template     |
| `add`         | -         | Add custom template      |
| `remove`      | `rm`      | Remove custom template   |

### Examples

```bash
# List all templates
aegisx templates list

# List backend templates only
aegisx templates list backend

# List frontend templates only
aegisx templates list frontend

# Set default template (interactive)
aegisx templates set-default

# Add custom template (interactive)
aegisx templates add

# Remove custom template (interactive)
aegisx templates remove
```

---

## config Command

Manage CRUD generator configuration.

### Syntax

```bash
aegisx config <subcommand>
aegisx cfg <subcommand>
```

### Subcommands

| Subcommand | Description                            |
| ---------- | -------------------------------------- |
| `init`     | Initialize .crudgen.json configuration |
| `show`     | Show current configuration             |

### Examples

```bash
# Initialize config file
aegisx config init

# Show current configuration
aegisx config show
```

### Configuration File (.crudgen.json)

```json
{
  "defaultPackage": "standard",
  "defaultTarget": "backend",
  "defaultApp": "api",
  "autoFormat": true,
  "autoRegister": true,
  "templates": {
    "backend": "default",
    "frontend": "default"
  },
  "database": {
    "schema": "public"
  }
}
```

---

## License Commands

### Start Trial

```bash
aegisx trial
```

### Activate License

```bash
aegisx activate <license-key>
```

### Check License Status

```bash
aegisx license
aegisx status
```

### Deactivate License

```bash
aegisx deactivate
```

### License Key Format

```
AEGISX-[TIER]-[SERIAL]-[CHECKSUM]
```

| Tier         | Example                   |
| ------------ | ------------------------- |
| Professional | `AEGISX-PRO-A7X9K2M4-5C`  |
| Team         | `AEGISX-TEAM-B8Y0L3N5-9D` |
| Enterprise   | `AEGISX-ENT-C9Z1M4P6-3E`  |

---

## Global Options

These options work with most commands:

| Option      | Alias | Description         |
| ----------- | ----- | ------------------- |
| `--version` | `-V`  | Show version number |
| `--help`    | `-h`  | Display help        |

---

## Exit Codes

| Code | Description               |
| ---- | ------------------------- |
| 0    | Success                   |
| 1    | General error             |
| 2    | Invalid arguments         |
| 3    | License error             |
| 4    | Database connection error |
| 5    | File system error         |

---

## Environment Variables

| Variable          | Description                       |
| ----------------- | --------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string      |
| `AEGISX_LICENSE`  | License key (alternative to file) |
| `AEGISX_NO_COLOR` | Disable colored output            |
| `AEGISX_DEBUG`    | Enable debug logging              |

---

## See Also

- [Quick Reference](./QUICK_REFERENCE.md) - Commands at a glance
- [Domain Guide](./DOMAIN_GUIDE.md) - Domain-based organization
- [Shell Guide](./SHELL_GUIDE.md) - Angular shell generation
- [Events Guide](./EVENTS_GUIDE.md) - WebSocket integration
- [Import Guide](./IMPORT_GUIDE.md) - Bulk import feature
- [Installation](./INSTALLATION.md) - Setup guide

---

**Copyright (c) 2024 AegisX Team. All rights reserved.**
