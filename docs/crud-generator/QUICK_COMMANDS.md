# Quick Commands Reference

**Fast reference for all CRUD Generator CLI commands and flags**

## Table of Contents

- [Quick Start](#quick-start)
- [Basic Commands](#basic-commands)
- [CLI Flags](#cli-flags)
- [Package System](#package-system)
- [Common Workflows](#common-workflows)
- [Flag Combinations](#flag-combinations)
- [Examples by Use Case](#examples-by-use-case)

---

## Quick Start

### Fastest Way to Generate CRUD

```bash
# Interactive mode (recommended for beginners)
pnpm run crud-gen

# Direct command (fastest for experienced users)
pnpm run crud-gen products --entity Product --package standard
```

### One-Line Commands

```bash
# Standard CRUD (basic operations)
pnpm run crud-gen products --entity Product

# Enterprise CRUD (with events & import)
pnpm run crud-gen products --entity Product --package enterprise

# Full CRUD (everything enabled)
pnpm run crud-gen products --entity Product --package full
```

---

## Basic Commands

### Main Command

```bash
pnpm run crud-gen [name] [options]
```

**Parameters**:

- `name` - Module name (plural, lowercase, e.g., `products`, `users`)

### Initialize Configuration

```bash
# Create .crudgen.json with defaults
pnpm run crud-gen --init
```

### Help & Information

```bash
# Show help
pnpm run crud-gen --help

# Show version
pnpm run crud-gen --version
```

### Dry Run

```bash
# Preview what will be generated (no files created)
pnpm run crud-gen products --entity Product --dry-run
```

---

## CLI Flags

### Required Flags

| Flag       | Short | Description                        | Example            |
| ---------- | ----- | ---------------------------------- | ------------------ |
| `--entity` | `-e`  | Entity name (singular, PascalCase) | `--entity Product` |

### Package Selection

| Flag                   | Description                  | Includes                                   |
| ---------------------- | ---------------------------- | ------------------------------------------ |
| `--package standard`   | Basic CRUD operations        | Create, Read, Update, Delete, List, Search |
| `--package enterprise` | Standard + advanced features | Standard + Events + Import                 |
| `--package full`       | Everything enabled           | Enterprise + Audit + Soft Delete + Export  |

### Feature Flags

| Flag                 | Description                        | Package          |
| -------------------- | ---------------------------------- | ---------------- |
| `--with-events`      | Enable WebSocket event emission    | Enterprise, Full |
| `--with-import`      | Enable bulk Excel/CSV import       | Enterprise, Full |
| `--with-export`      | Enable Excel/CSV export            | Full             |
| `--with-audit`       | Enable audit trail logging         | Full             |
| `--with-soft-delete` | Enable soft delete (trash/restore) | Full             |

### Template Selection

| Flag                  | Options                              | Description           |
| --------------------- | ------------------------------------ | --------------------- |
| `--backend-template`  | `standard`, `enterprise`, `advanced` | Backend code template |
| `--frontend-template` | `basic`, `material`, `advanced`      | Frontend UI template  |

### Output Paths

| Flag                | Description                | Default                    |
| ------------------- | -------------------------- | -------------------------- |
| `--backend-output`  | Backend files destination  | `apps/api/src/domains`     |
| `--frontend-output` | Frontend files destination | `apps/web/src/app/modules` |

### Behavior Flags

| Flag              | Description                    |
| ----------------- | ------------------------------ |
| `--force`         | Overwrite existing files       |
| `--verbose`       | Show detailed logging          |
| `--dry-run`       | Preview without creating files |
| `--skip-backend`  | Generate frontend only         |
| `--skip-frontend` | Generate backend only          |

---

## Package System

### Package Comparison Table

| Feature                 | Standard | Enterprise | Full |
| ----------------------- | -------- | ---------- | ---- |
| **CRUD Operations**     | ✅       | ✅         | ✅   |
| Create                  | ✅       | ✅         | ✅   |
| Read (by ID)            | ✅       | ✅         | ✅   |
| Update                  | ✅       | ✅         | ✅   |
| Delete                  | ✅       | ✅         | ✅   |
| List with pagination    | ✅       | ✅         | ✅   |
| Search & filters        | ✅       | ✅         | ✅   |
| **Advanced Features**   |          |            |      |
| WebSocket events        | ❌       | ✅         | ✅   |
| Bulk import (Excel/CSV) | ❌       | ✅         | ✅   |
| Export (Excel/CSV)      | ❌       | ❌         | ✅   |
| Audit trail             | ❌       | ❌         | ✅   |
| Soft delete             | ❌       | ❌         | ✅   |
| **Code Quality**        |          |            |      |
| TypeBox schemas         | ✅       | ✅         | ✅   |
| OpenAPI documentation   | ✅       | ✅         | ✅   |
| Type safety             | ✅       | ✅         | ✅   |
| Error handling          | ✅       | ✅         | ✅   |
| **Generated Files**     |          |            |      |
| Backend controller      | ✅       | ✅         | ✅   |
| Backend service         | ✅       | ✅         | ✅   |
| Backend repository      | ✅       | ✅         | ✅   |
| Backend schemas         | ✅       | ✅         | ✅   |
| Frontend list component | ✅       | ✅         | ✅   |
| Frontend create dialog  | ✅       | ✅         | ✅   |
| Frontend edit dialog    | ✅       | ✅         | ✅   |
| Frontend view dialog    | ✅       | ✅         | ✅   |
| Frontend import dialog  | ❌       | ✅         | ✅   |
| Frontend service        | ✅       | ✅         | ✅   |
| Frontend types          | ✅       | ✅         | ✅   |

### Choosing the Right Package

**Use Standard when**:

- Building simple CRUD modules
- No need for real-time updates
- No bulk import/export requirements
- Quick prototyping

**Use Enterprise when**:

- Need real-time collaboration
- Require bulk data import
- Building production applications
- Want event-driven architecture

**Use Full when**:

- Need complete audit trail
- Require soft delete functionality
- Need export capabilities
- Building mission-critical systems

---

## Common Workflows

### 1. Generate Basic CRUD Module

```bash
# Interactive mode
pnpm run crud-gen

# Follow prompts:
# 1. Enter module name: products
# 2. Enter entity name: Product
# 3. Select package: standard
# 4. Confirm generation
```

### 2. Generate with Import Feature

```bash
# Direct command
pnpm run crud-gen products \
  --entity Product \
  --package enterprise

# Or with explicit flag
pnpm run crud-gen products \
  --entity Product \
  --with-import
```

### 3. Regenerate Existing Module

```bash
# Force overwrite existing files
pnpm run crud-gen products \
  --entity Product \
  --force

# Preview changes first
pnpm run crud-gen products \
  --entity Product \
  --force \
  --dry-run
```

### 4. Generate Backend Only

```bash
# Skip frontend generation
pnpm run crud-gen products \
  --entity Product \
  --skip-frontend
```

### 5. Generate Frontend Only

```bash
# Skip backend generation (backend must exist)
pnpm run crud-gen products \
  --entity Product \
  --skip-backend
```

### 6. Custom Output Paths

```bash
# Specify custom output directories
pnpm run crud-gen products \
  --entity Product \
  --backend-output apps/api/src/custom-path \
  --frontend-output apps/web/src/custom-path
```

---

## Flag Combinations

### Standard Package Equivalents

```bash
# These are identical
pnpm run crud-gen products --entity Product --package standard
pnpm run crud-gen products --entity Product
```

### Enterprise Package Equivalents

```bash
# These are identical
pnpm run crud-gen products --entity Product --package enterprise
pnpm run crud-gen products --entity Product --with-events --with-import
```

### Full Package Equivalents

```bash
# These are identical
pnpm run crud-gen products --entity Product --package full
pnpm run crud-gen products --entity Product --with-events --with-import --with-export --with-audit --with-soft-delete
```

### Custom Feature Combinations

```bash
# Standard + Events only
pnpm run crud-gen products \
  --entity Product \
  --with-events

# Standard + Import only
pnpm run crud-gen products \
  --entity Product \
  --with-import

# Events + Import + Audit (no export, no soft-delete)
pnpm run crud-gen products \
  --entity Product \
  --with-events \
  --with-import \
  --with-audit
```

---

## Examples by Use Case

### E-Commerce Product Catalog

```bash
# Full package with all features
pnpm run crud-gen products \
  --entity Product \
  --package full

# Enables:
# - CRUD operations
# - Real-time inventory updates (events)
# - Bulk product import from suppliers (import)
# - Export product catalog (export)
# - Track price changes (audit)
# - Archive discontinued products (soft-delete)
```

### User Management System

```bash
# Enterprise package
pnpm run crud-gen users \
  --entity User \
  --package enterprise

# Enables:
# - CRUD operations
# - Real-time user status updates (events)
# - Bulk user import from CSV (import)
```

### Simple Blog System

```bash
# Standard package
pnpm run crud-gen articles \
  --entity Article \
  --package standard

# Enables:
# - CRUD operations
# - Pagination & search
# - No advanced features needed
```

### Multi-Tenant CRM

```bash
# Full package with custom paths
pnpm run crud-gen companies \
  --entity Company \
  --package full \
  --backend-output apps/api/src/domains \
  --frontend-output apps/web/src/app/modules

# Enables:
# - CRUD operations
# - Real-time updates across tenants (events)
# - Bulk company import (import)
# - Export company data (export)
# - Audit trail for compliance (audit)
# - Archive old companies (soft-delete)
```

### Event Management Platform

```bash
# Enterprise with events focus
pnpm run crud-gen events \
  --entity Event \
  --with-events \
  --with-import

# Enables:
# - CRUD operations
# - Real-time attendee updates (events)
# - Bulk attendee import (import)
```

### Document Management System

```bash
# Full package for compliance
pnpm run crud-gen documents \
  --entity Document \
  --package full

# Enables:
# - CRUD operations
# - Real-time collaboration (events)
# - Bulk upload (import)
# - Export for backup (export)
# - Complete audit trail (audit)
# - Trash/restore (soft-delete)
```

---

## Configuration File (.crudgen.json)

### Initialize Configuration

```bash
pnpm run crud-gen --init
```

### Example Configuration

```json
{
  "defaultPackage": "enterprise",
  "backendOutput": "apps/api/src/domains",
  "frontendOutput": "apps/web/src/app/modules",
  "backendTemplate": "standard",
  "frontendTemplate": "material",
  "features": {
    "events": true,
    "import": true,
    "export": false,
    "audit": false,
    "softDelete": false
  }
}
```

### Using Configuration

```bash
# Use defaults from .crudgen.json
pnpm run crud-gen products --entity Product

# Override specific settings
pnpm run crud-gen products \
  --entity Product \
  --package full  # Overrides defaultPackage
```

---

## Advanced Usage

### Verbose Mode for Debugging

```bash
pnpm run crud-gen products \
  --entity Product \
  --verbose

# Shows:
# - Template resolution
# - File generation steps
# - Variable substitution
# - Success/failure details
```

### Dry Run for Testing

```bash
pnpm run crud-gen products \
  --entity Product \
  --package full \
  --dry-run

# Shows what WOULD be generated:
# - File paths
# - File contents preview
# - No actual files created
```

### Force Regeneration

```bash
# Regenerate all files (overwrites existing)
pnpm run crud-gen products \
  --entity Product \
  --force

# Useful for:
# - Updating to new templates
# - Fixing broken code
# - Applying generator updates
```

---

## Naming Conventions

### Module Name (Required)

**Format**: lowercase, plural, kebab-case

```bash
# ✅ Good
pnpm run crud-gen products
pnpm run crud-gen user-profiles
pnpm run crud-gen blog-posts

# ❌ Bad
pnpm run crud-gen Product       # Should be plural and lowercase
pnpm run crud-gen UserProfiles  # Should be kebab-case
pnpm run crud-gen user_profiles # Should use hyphens, not underscores
```

### Entity Name (Required)

**Format**: singular, PascalCase

```bash
# ✅ Good
--entity Product
--entity UserProfile
--entity BlogPost

# ❌ Bad
--entity product       # Should be PascalCase
--entity Products      # Should be singular
--entity user_profile  # Should be PascalCase
```

### Example Pairs

| Module Name     | Entity Name   | Description      |
| --------------- | ------------- | ---------------- |
| `products`      | `Product`     | Product catalog  |
| `users`         | `User`        | User management  |
| `blog-posts`    | `BlogPost`    | Blog articles    |
| `user-profiles` | `UserProfile` | User profiles    |
| `order-items`   | `OrderItem`   | Order line items |

---

## Template Selection Guide

### Backend Templates

| Template     | Description                                                  | Use When               |
| ------------ | ------------------------------------------------------------ | ---------------------- |
| `standard`   | Basic patterns (BaseRepository, BaseService, BaseController) | Most cases             |
| `enterprise` | Advanced patterns (CQRS, Event Sourcing)                     | Complex business logic |
| `advanced`   | Custom patterns                                              | Special requirements   |

### Frontend Templates

| Template   | Description         | Use When                      |
| ---------- | ------------------- | ----------------------------- |
| `basic`    | Simple HTML forms   | Quick prototypes              |
| `material` | Angular Material UI | Production apps (recommended) |
| `advanced` | Custom components   | Special UI requirements       |

### Selecting Templates

```bash
# Use Material UI (recommended)
pnpm run crud-gen products \
  --entity Product \
  --frontend-template material

# Use enterprise backend patterns
pnpm run crud-gen products \
  --entity Product \
  --backend-template enterprise

# Combine templates
pnpm run crud-gen products \
  --entity Product \
  --backend-template enterprise \
  --frontend-template material
```

---

## Troubleshooting Commands

### Check What Will Be Generated

```bash
# Dry run with verbose output
pnpm run crud-gen products \
  --entity Product \
  --package full \
  --dry-run \
  --verbose
```

### Verify Configuration

```bash
# Show current configuration
cat .crudgen.json

# Reinitialize configuration
pnpm run crud-gen --init --force
```

### Clean and Regenerate

```bash
# 1. Remove existing files manually
rm -rf apps/api/src/domains/products
rm -rf apps/web/src/app/modules/products

# 2. Regenerate from scratch
pnpm run crud-gen products --entity Product --package full
```

---

## Migration Commands

### Upgrading from v1.x to v2.0

```bash
# 1. Initialize new configuration
pnpm run crud-gen --init

# 2. Regenerate each module with --force
pnpm run crud-gen products --entity Product --force
pnpm run crud-gen users --entity User --force
```

### Updating from v2.0.0 to v2.0.1

```bash
# Regenerate modules with import feature
pnpm run crud-gen products \
  --entity Product \
  --with-import \
  --force

# This updates:
# - Import dialog component
# - ImportJob type definitions
# - Type alignment fixes
```

---

## Quick Reference Table

### Most Common Commands

| Task              | Command                                                       |
| ----------------- | ------------------------------------------------------------- |
| **Basic CRUD**    | `pnpm run crud-gen products --entity Product`                 |
| **With Events**   | `pnpm run crud-gen products --entity Product --with-events`   |
| **With Import**   | `pnpm run crud-gen products --entity Product --with-import`   |
| **Full Featured** | `pnpm run crud-gen products --entity Product --package full`  |
| **Regenerate**    | `pnpm run crud-gen products --entity Product --force`         |
| **Preview Only**  | `pnpm run crud-gen products --entity Product --dry-run`       |
| **Backend Only**  | `pnpm run crud-gen products --entity Product --skip-frontend` |
| **Frontend Only** | `pnpm run crud-gen products --entity Product --skip-backend`  |

### Flags Cheat Sheet

| Flag                 | Short         | Effect                   |
| -------------------- | ------------- | ------------------------ |
| `--entity Product`   | `-e Product`  | Set entity name          |
| `--package standard` | `-p standard` | Use standard package     |
| `--with-events`      |               | Enable WebSocket events  |
| `--with-import`      |               | Enable bulk import       |
| `--with-export`      |               | Enable export            |
| `--force`            | `-f`          | Overwrite existing files |
| `--dry-run`          | `-d`          | Preview without creating |
| `--verbose`          | `-v`          | Show detailed output     |
| `--help`             | `-h`          | Show help                |

---

## Performance Tips

### Faster Generation

```bash
# Skip frontend for faster backend-only generation
pnpm run crud-gen products \
  --entity Product \
  --skip-frontend

# Use standard package (fewer files)
pnpm run crud-gen products \
  --entity Product \
  --package standard
```

### Batch Generation

```bash
# Generate multiple modules
pnpm run crud-gen products --entity Product --skip-frontend
pnpm run crud-gen users --entity User --skip-frontend
pnpm run crud-gen orders --entity Order --skip-frontend

# Then generate all frontends
pnpm run crud-gen products --entity Product --skip-backend
pnpm run crud-gen users --entity User --skip-backend
pnpm run crud-gen orders --entity Order --skip-backend
```

---

## Summary

**Key Takeaways**:

- Use `--package` flag for predefined feature sets
- Use individual `--with-*` flags for custom combinations
- Always specify `--entity` (singular, PascalCase)
- Module name should be plural, lowercase
- Use `--dry-run` to preview before generating
- Use `--force` to overwrite existing files
- Use `--verbose` for debugging

**Most Used Commands**:

```bash
# Standard CRUD
pnpm run crud-gen products --entity Product

# Enterprise CRUD
pnpm run crud-gen products --entity Product --package enterprise

# Full CRUD
pnpm run crud-gen products --entity Product --package full

# Regenerate
pnpm run crud-gen products --entity Product --force
```

**Related Guides**:

- [User Guide](./USER_GUIDE.md) - Complete feature walkthrough
- [Events Guide](./EVENTS_GUIDE.md) - WebSocket events documentation
- [Import Guide](./IMPORT_GUIDE.md) - Bulk import documentation
- [API Reference](./API_REFERENCE.md) - Technical specifications
