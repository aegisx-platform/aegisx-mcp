# CRUD Generator - Role Generation Feature

## Overview

The CRUD Generator now supports configurable role generation strategies for role-based access control (RBAC). You can choose between single role (default) or multiple roles approach based on your application's security requirements.

## Role Generation Modes

### 1. Single Role (Default)

Default behavior that creates one role per module with full CRUD permissions.

```bash
# Default - generates single role
node tools/crud-generator/index.js generate themes --dry-run

# Explicit single role
node tools/crud-generator/index.js generate themes --dry-run
```

**Generated:**

- **Permissions**: 4 permissions (create, read, update, delete)
- **Roles**: 1 role (`themes`) with all permissions
- **Route Authorization**: `fastify.authorize(['themes', 'admin'])`

### 2. Multiple Roles

Generates three hierarchical roles with different permission levels.

```bash
# Multiple roles approach
node tools/crud-generator/index.js generate themes --dry-run --multiple-roles
```

**Generated:**

- **Permissions**: 4 permissions (create, read, update, delete)
- **Roles**: 3 roles with different access levels:
  - `themes_admin`: Full access (all 4 permissions)
  - `themes_editor`: Create, read, update permissions
  - `themes_viewer`: Read-only permission
- **Route Authorization**: Uses specific permissions like `fastify.authorize(['themes.read', 'admin'])`

## Migration-Based Deployment

By default, roles and permissions are generated as database migration files for production safety.

### Migration File Generation

```bash
# Generate migration file (default)
node tools/crud-generator/index.js generate themes --migration-only --dry-run

# Output:
# 📋 Would create migration file: /path/to/migrations/20250927031456_add_themes_permissions.ts
# 📝 Migration would create 4 permissions and 1 roles (single role)
# 📝 Migration would create 4 permissions and 3 roles (multiple roles)
```

### Direct Database Mode (Development Only)

```bash
# Write directly to database (development only)
node tools/crud-generator/index.js generate themes --direct-db --dry-run
```

⚠️ **Warning**: Direct database mode should only be used in development environments.

## CLI Options Reference

| Option             | Description                                     | Default                  |
| ------------------ | ----------------------------------------------- | ------------------------ |
| `--multiple-roles` | Generate multiple roles (admin, editor, viewer) | `false` (single role)    |
| `--direct-db`      | Write roles directly to database                | `false` (migration file) |
| `--no-roles`       | Skip role generation entirely                   | `false`                  |
| `--migration-only` | Generate migration file only (no CRUD files)    | `false`                  |
| `--dry-run`        | Preview without creating files                  | `false`                  |

## Complete Examples

### Single Role Module (Default)

```bash
# Generate themes module with single role
node tools/crud-generator/index.js generate themes

# Output:
# 👥 Role strategy: Single role
# 🔐 Role generation: Migration file
# ✅ Created migration file: /path/to/migrations/add_themes_permissions.ts
# 📝 Migration will create 4 permissions and 1 roles
```

**Generated Migration:**

```typescript
// Creates themes role with all CRUD permissions
const roles = [
  {
    name: 'themes',
    description: 'Access to themes',
    permissions: ['themes.create', 'themes.read', 'themes.update', 'themes.delete'],
  },
];
```

**Generated Routes:**

```typescript
// Uses role-based authorization
fastify.authorize(['themes', 'admin']);
```

### Multiple Roles Module

```bash
# Generate themes module with multiple roles
node tools/crud-generator/index.js generate themes --multiple-roles

# Output:
# 👥 Role strategy: Multiple roles (admin, editor, viewer)
# 🔐 Role generation: Migration file
# ✅ Created migration file: /path/to/migrations/add_themes_permissions.ts
# 📝 Migration will create 4 permissions and 3 roles
```

**Generated Migration:**

```typescript
// Creates hierarchical roles with different permissions
const roles = [
  {
    name: 'themes_admin',
    description: 'Full access to themes',
    permissions: ['themes.create', 'themes.read', 'themes.update', 'themes.delete'],
  },
  {
    name: 'themes_editor',
    description: 'Create, read, and update themes',
    permissions: ['themes.create', 'themes.read', 'themes.update'],
  },
  {
    name: 'themes_viewer',
    description: 'Read-only access to themes',
    permissions: ['themes.read'],
  },
];
```

**Generated Routes:**

```typescript
// Uses permission-based authorization
fastify.authorize(['themes.read', 'admin']); // GET endpoints
fastify.authorize(['themes.create', 'admin']); // POST endpoints
fastify.authorize(['themes.update', 'admin']); // PUT endpoints
fastify.authorize(['themes.delete', 'admin']); // DELETE endpoints
```

## Migration Deployment

### Running Migrations

```bash
# Run migrations to create roles and permissions
npm run db:migrate

# Output:
# 🔐 Adding Themes permissions and roles...
# 📝 Inserting 4 permissions for themes...
# 🏷️  Inserting 1 role for themes...
# 🔗 Linking 4 permissions to themes role...
# ✅ Themes permissions and roles added successfully
```

### Rollback Migrations

```bash
# Rollback if needed
npm run db:rollback

# Output:
# 🗑️ Removing Themes permissions and roles...
# 🔗 Removing role permissions for themes...
# 🏷️ Removing themes role...
# 📝 Removing themes permissions...
# ✅ Removed 1 roles and 4 permissions for themes
```

## Best Practices

### When to Use Single Role

- **Rapid prototyping**: Quick setup for development
- **Simple applications**: Basic CRUD operations without complex access control
- **Team-based access**: All team members have same access level
- **Microservices**: Service-to-service communication

### When to Use Multiple Roles

- **Enterprise applications**: Complex role hierarchies
- **Multi-tenant systems**: Different access levels per tenant
- **Customer-facing applications**: End users with different permission levels
- **Compliance requirements**: Audit trails and fine-grained access control

### Security Considerations

1. **Migration-based deployment**: Always use migration files for production
2. **Role naming**: Clear, descriptive role names following naming conventions
3. **Permission granularity**: Balance between security and usability
4. **Admin bypass**: Always include admin role bypass in authorization checks

## Troubleshooting

### Common Issues

1. **Template Syntax Errors**: Check Handlebars template syntax in migration files
2. **Database Connection**: Ensure database is running and accessible
3. **Migration Conflicts**: Use unique migration timestamps
4. **Permission Duplication**: Handle existing permissions gracefully

### Debug Commands

```bash
# Check database connection
docker exec aegisx_1_postgres psql -U postgres -d aegisx_db -c "SELECT current_database();"

# List existing permissions
# Use database client to check permissions table

# Dry run to preview changes
node tools/crud-generator/index.js generate [table] --dry-run --multiple-roles
```

## Related Documentation

- [CRUD Generator Overview](./README.md)
- [API-First Development](../../development/api-first-workflow.md)
- [Database Migration Guide](../../infrastructure/database-migrations.md)
- [RBAC System](../../features/rbac/README.md)
