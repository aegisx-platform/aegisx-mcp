# CRUD Generator Quick Reference

## 📦 Package Scripts

| Script                          | Command                                    | Description                                     |
| ------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| `pnpm run crud -- TABLE`        | `pnpm run crud -- users --force`           | Basic CRUD (standard package)                   |
| `pnpm run crud:import -- TABLE` | `pnpm run crud:import -- products --force` | CRUD with Excel/CSV import (enterprise package) |
| `pnpm run crud:events -- TABLE` | `pnpm run crud:events -- orders --force`   | CRUD with WebSocket events (full package)       |
| `pnpm run crud:full -- TABLE`   | `pnpm run crud:full -- budgets --force`    | All features combined (full package)            |

## Command Examples

### Basic CRUD Generation

```bash
pnpm run crud -- users --force
pnpm run crud -- products --domain inventory/master-data --schema inventory --force
```

### With Import/Export

```bash
pnpm run crud:import -- employees --force
pnpm run crud:import -- departments --schema hr --force
```

### With Real-time Events

```bash
pnpm run crud:events -- notifications --force
```

### Full Features

```bash
pnpm run crud:full -- budget_requests --domain inventory/operations --schema inventory --force
```

## Important Notes

**CRITICAL**: Always use `--force` flag to overwrite existing files without confirmation.

**Note**: The domain parameter is optional. If not specified, module is created in default location.

**DO**:

- Run sync before CRUD generation
- Use specific domain when applicable
- Test generated code with `pnpm run build`

**DON'T**:

- Manually edit generated files
- Use CRUD without domain context
- Skip build validation

## List Available Tables

```bash
pnpm run crud:list
```

## Options

### Global Options

- `--force` - Overwrite existing files without confirmation
- `--dry-run` - Preview files without creating them
- `--verbose` - Show detailed output

### Domain Options

- `--domain DOMAIN/SUBDOMAIN` - Specify domain and subdomain
- `--schema SCHEMA_NAME` - Specify database schema

### Feature Options

- `--with-import` - Include Excel/CSV import functionality
- `--with-events` - Include WebSocket events for real-time updates
- `--with-validation` - Include advanced validation rules
