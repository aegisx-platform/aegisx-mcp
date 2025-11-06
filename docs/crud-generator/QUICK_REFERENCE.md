# CRUD Generator - Quick Reference

Complete command reference for AegisX CRUD Generator (v2.2.0)

---

## 🚀 Quick Start

### Most Common Commands

```bash
# Basic CRUD
pnpm run crud -- TABLE_NAME --force

# With import
pnpm run crud:import -- TABLE_NAME --force

# With events
pnpm run crud:events -- TABLE_NAME --force

# Full package (all features)
pnpm run crud:full -- TABLE_NAME --force
```

**CRITICAL**: Always use `--` separator with pnpm scripts!

---

## 📦 Package Scripts

Available scripts in `package.json`:

| Script                             | Command                 | Description                  |
| ---------------------------------- | ----------------------- | ---------------------------- |
| `pnpm run crud -- TABLE`           | `./bin/cli.js generate` | Basic CRUD generation        |
| `pnpm run crud:import -- TABLE`    | + `--with-import`       | With bulk import (Excel/CSV) |
| `pnpm run crud:events -- TABLE`    | + `--with-events`       | With WebSocket events        |
| `pnpm run crud:full -- TABLE`      | + `--package full`      | Full feature package         |
| `pnpm run crud:list`               | `list-tables`           | List database tables         |
| `pnpm run crud:validate -- MODULE` | `validate`              | Validate module              |

---

## 💻 Direct CLI Usage

Use direct CLI for advanced features or multiple flags:

```bash
./bin/cli.js generate TABLE_NAME [OPTIONS]

# Or full path
./libs/aegisx-crud-generator/bin/cli.js generate TABLE_NAME [OPTIONS]
```

### Examples

```bash
# Backend with multiple features
./bin/cli.js generate products --with-import --with-events --force

# Frontend (after backend)
./bin/cli.js generate products --target frontend --force

# Frontend with import dialog
./bin/cli.js generate products --target frontend --with-import --force

# Dry run to preview
./bin/cli.js generate products --dry-run

# Custom output directory
./bin/cli.js generate products --output ./custom/path --force
```

---

## 🎯 Available Flags

### Target Selection

| Flag           | Options               | Default   | Description      |
| -------------- | --------------------- | --------- | ---------------- |
| `-t, --target` | `backend`, `frontend` | `backend` | What to generate |
| `-a, --app`    | `api`, `web`, `admin` | `api`     | Target app       |
| `-o, --output` | `<dir>`               | Auto      | Custom output    |

**Important**: Generate backend FIRST, then frontend

### Feature Package

| Flag        | Options                          | Default    | Description   |
| ----------- | -------------------------------- | ---------- | ------------- |
| `--package` | `standard`, `enterprise`, `full` | `standard` | Feature level |

**Packages**:

- **standard**: Basic CRUD
- **enterprise**: + bulk ops, dropdown API, export
- **full**: + validation, uniqueness check, advanced search

### Features

| Flag                | Default | Description                            |
| ------------------- | ------- | -------------------------------------- |
| `-e, --with-events` | `false` | WebSocket real-time events             |
| `--with-import`     | `false` | Excel/CSV import                       |
| `--smart-stats`     | `false` | Auto-detect stats fields               |
| `--multiple-roles`  | `false` | Generate 3 roles (admin/editor/viewer) |

### Generation Control

| Flag            | Default | Description                    |
| --------------- | ------- | ------------------------------ |
| `-f, --force`   | `false` | Overwrite files without prompt |
| `-d, --dry-run` | `false` | Preview files only             |
| `--flat`        | `false` | Use flat structure             |
| `--no-register` | `false` | Skip auto-registration         |
| `--no-format`   | `false` | Skip prettier                  |
| `--no-roles`    | `false` | Skip role generation           |

---

## 📋 Common Workflows

### 1. Basic Feature (Backend + Frontend)

```bash
# Step 1: Backend
pnpm run crud -- products --force

# Step 2: Frontend
./bin/cli.js generate products --target frontend --force
```

### 2. With Import Functionality

```bash
# Step 1: Backend with import service
pnpm run crud:import -- budgets --force

# Step 2: Frontend with import dialog
./bin/cli.js generate budgets --target frontend --with-import --force
```

### 3. Real-Time Feature

```bash
# Step 1: Backend with events
pnpm run crud:events -- notifications --force

# Step 2: Frontend with event handling
./bin/cli.js generate notifications --target frontend --with-events --force
```

### 4. Full-Featured Module

```bash
# Backend - all features
./bin/cli.js generate orders --package full --with-import --with-events --force

# Frontend - all features
./bin/cli.js generate orders --target frontend --package full --with-import --with-events --force
```

### 5. Regenerate After Changes

```bash
# Preview
pnpm run crud -- products --dry-run

# Apply
pnpm run crud -- products --force
```

---

## 🏷️ Table Name Conventions

Database table names are converted automatically:

| Database Table  | Module Folder    | TypeScript Types | API Routes           |
| --------------- | ---------------- | ---------------- | -------------------- |
| `test_products` | `test-products/` | `TestProducts`   | `/api/test-products` |
| `user_profiles` | `user-profiles/` | `UserProfiles`   | `/api/user-profiles` |
| `blog_posts`    | `blog-posts/`    | `BlogPosts`      | `/api/blog-posts`    |

```bash
# Input: database table (snake_case)
pnpm run crud -- test_products --force

# Generates:
# - Folder: apps/api/src/modules/test-products/
# - Types: TestProducts, CreateTestProducts, UpdateTestProducts
# - Routes: /api/test-products
```

---

## ✅ Before Generating

```bash
# 1. List available tables
pnpm run crud:list

# 2. Run migrations if needed
pnpm run db:migrate

# 3. Preview with dry run
pnpm run crud -- TABLE_NAME --dry-run

# 4. Generate with force
pnpm run crud -- TABLE_NAME --force
```

---

## ❌ Common Mistakes

### Missing `--` Separator

```bash
# ❌ WRONG - Arguments ignored
pnpm run crud products --force

# ✅ CORRECT - With double dash
pnpm run crud -- products --force
```

### Non-existent Command

```bash
# ❌ WRONG - Command doesn't exist
pnpm aegisx-crud products

# ✅ CORRECT - Use pnpm run crud
pnpm run crud -- products --force
```

### Double Command

```bash
# ❌ WRONG - Causes "generate generate"
pnpm run crud generate products --force

# ✅ CORRECT
pnpm run crud -- products --force
```

### Both Targets at Once

```bash
# ❌ WRONG - Can't do both
./bin/cli.js generate products --target backend --target frontend

# ✅ CORRECT - Run twice
pnpm run crud -- products --force
./bin/cli.js generate products --target frontend --force
```

### Missing `--force`

```bash
# Without --force, you'll get prompted
pnpm run crud -- products

# Add --force to skip prompts
pnpm run crud -- products --force
```

---

## 🔧 Troubleshooting

### Error: "Table not found"

```bash
# Check if table exists
pnpm run crud:list

# Ensure migrations ran
pnpm run db:migrate
```

### Error: "Arguments not recognized"

Check for missing `--` separator:

```bash
# ❌ WRONG
pnpm run crud products --force

# ✅ CORRECT
pnpm run crud -- products --force
```

### Frontend files not generated

Backend must exist first:

```bash
# 1. Backend
pnpm run crud -- products --force

# 2. Then frontend
./bin/cli.js generate products --target frontend --force
```

### Files not auto-registered

Check if auto-registration succeeded:

```bash
# Re-generate with force to trigger registration
pnpm run crud -- products --force
```

---

## 📚 Command Reference

### All Available Commands

```bash
# GENERATE commands
generate [TABLE]             # Generate CRUD module
domain <NAME>                # Generate domain module
route <DOMAIN/ROUTE>         # Add route to domain

# INFORMATION commands
list-tables                  # List database tables
packages                     # Show feature packages
validate <MODULE>            # Validate module

# TEMPLATE commands
templates list [TYPE]        # List templates
templates set-default        # Set default template
templates add                # Add custom template
templates remove             # Remove custom template

# CONFIG commands
config init                  # Initialize .crudgen.json
config show                  # Show current config
```

---

## 🎓 Key Takeaways

✅ **DO:**

- Use `pnpm run crud -- TABLE` for basic generation
- Use `pnpm run crud:import --` for import features
- Use `./bin/cli.js generate` for advanced options
- Generate **backend FIRST**, then frontend
- Use table names in `snake_case` (e.g., `test_products`)
- Add `--force` to avoid prompts
- Check `pnpm run crud:list` before generating

❌ **DON'T:**

- Use `pnpm aegisx-crud` (doesn't exist)
- Forget the `--` separator with pnpm scripts
- Use `--entity` flag (doesn't exist)
- Generate frontend without backend
- Use PascalCase or kebab-case for table names
- Assume `--target frontend` is default (it's not)

---

## 📖 Complete Guides

- [README.md](./README.md) - Full documentation
- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) - Version release & NPM publishing

---

**Generator Version**: 2.2.0
**Last Updated**: November 6, 2025
**Status**: ✅ Production Ready
