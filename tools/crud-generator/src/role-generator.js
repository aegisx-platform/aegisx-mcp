const { getKnexConnection } = require('./knex-connection');
const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

/**
 * Generate migration file for roles and permissions
 */
async function generateMigrationFile(moduleName, options = {}) {
  // Determine correct path based on current working directory
  const cwd = process.cwd();
  const isInCrudGenerator = cwd.endsWith('tools/crud-generator');
  const defaultPath = isInCrudGenerator
    ? '../../apps/api/src/database/migrations'
    : 'apps/api/src/database/migrations';

  const {
    dryRun = false,
    multipleRoles = false,
    outputDir = path.resolve(cwd, defaultPath),
  } = options;

  // Generate data structure same as before
  const permissions = [
    {
      name: `${moduleName}.create`,
      description: `Create ${moduleName}`,
      resource: moduleName,
      action: 'create',
    },
    {
      name: `${moduleName}.read`,
      description: `Read ${moduleName}`,
      resource: moduleName,
      action: 'read',
    },
    {
      name: `${moduleName}.update`,
      description: `Update ${moduleName}`,
      resource: moduleName,
      action: 'update',
    },
    {
      name: `${moduleName}.delete`,
      description: `Delete ${moduleName}`,
      resource: moduleName,
      action: 'delete',
    },
  ];

  // Generate roles based on multipleRoles option
  const roles = multipleRoles
    ? [
        {
          name: `${moduleName}_admin`,
          description: `Full access to ${moduleName}`,
          permissions: permissions.map((p) => p.name),
        },
        {
          name: `${moduleName}_editor`,
          description: `Create, read, and update ${moduleName}`,
          permissions: [
            `${moduleName}.create`,
            `${moduleName}.read`,
            `${moduleName}.update`,
          ],
        },
        {
          name: `${moduleName}_viewer`,
          description: `Read-only access to ${moduleName}`,
          permissions: [`${moduleName}.read`],
        },
      ]
    : [
        {
          name: `${moduleName}`,
          description: `Access to ${moduleName}`,
          permissions: permissions.map((p) => p.name),
        },
      ];

  // Prepare role permissions data for template
  const rolePermissions = {};
  roles.forEach((role, index) => {
    const key = multipleRoles
      ? role.name.includes('admin')
        ? 'admin'
        : role.name.includes('editor')
          ? 'editor'
          : 'viewer'
      : 'main';
    rolePermissions[key] = {
      roleName: role.name,
      permissionNames: JSON.stringify(role.permissions),
    };
  });

  const context = {
    moduleName,
    ModuleName: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
    permissions,
    roles,
    rolePermissions,
    timestamp: new Date().toISOString(),
  };

  // Generate migration filename with timestamp
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, '')
    .split('.')[0];
  const migrationFileName = `${timestamp}_add_${moduleName}_permissions.ts`;
  const migrationPath = path.join(outputDir, migrationFileName);

  if (dryRun) {
    console.log(`📋 Would create migration file: ${migrationPath}`);
    return {
      permissions,
      roles,
      migrationFile: migrationPath,
      content: await renderMigrationTemplate(context),
    };
  }

  try {
    // Ensure directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Render template
    const content = await renderMigrationTemplate(context);

    // Write migration file
    await fs.writeFile(migrationPath, content, 'utf8');

    console.log(`✅ Created migration file: ${migrationPath}`);

    return {
      permissions,
      roles,
      migrationFile: migrationPath,
      content,
    };
  } catch (error) {
    console.error(`❌ Error creating migration file:`, error.message);
    throw error;
  }
}

/**
 * Render migration template
 */
async function renderMigrationTemplate(context) {
  const templatePath = path.join(
    __dirname,
    '../templates/permissions-migration.hbs',
  );
  const templateContent = await fs.readFile(templatePath, 'utf8');
  const template = Handlebars.compile(templateContent);
  return template(context);
}

/**
 * Generate roles and permissions for CRUD module
 */
async function generateRolesAndPermissions(moduleName, options = {}) {
  const {
    dryRun = false,
    useMigration = true,
    directDb = false,
    multipleRoles = false,
    outputDir,
  } = options;

  // Default to migration file generation
  if (useMigration && !directDb) {
    return await generateMigrationFile(moduleName, {
      dryRun,
      multipleRoles,
      outputDir,
    });
  }

  // Legacy: Direct database write (development only)
  return await writeToDatabase(moduleName, { ...options, multipleRoles });
}

/**
 * Write roles and permissions directly to database (legacy)
 */
async function writeToDatabase(moduleName, options = {}) {
  const { dryRun = false, multipleRoles = false } = options;

  const knex = getKnexConnection();

  try {
    // Define CRUD permissions for the module
    const permissions = [
      {
        name: `${moduleName}.create`,
        description: `Create ${moduleName}`,
        resource: moduleName,
        action: 'create',
      },
      {
        name: `${moduleName}.read`,
        description: `Read ${moduleName}`,
        resource: moduleName,
        action: 'read',
      },
      {
        name: `${moduleName}.update`,
        description: `Update ${moduleName}`,
        resource: moduleName,
        action: 'update',
      },
      {
        name: `${moduleName}.delete`,
        description: `Delete ${moduleName}`,
        resource: moduleName,
        action: 'delete',
      },
    ];

    // Define roles for the module based on multipleRoles option
    const roles = multipleRoles
      ? [
          {
            name: `${moduleName}_admin`,
            description: `Full access to ${moduleName}`,
            permissions: permissions.map((p) => p.name),
          },
          {
            name: `${moduleName}_editor`,
            description: `Create, read, and update ${moduleName}`,
            permissions: [
              `${moduleName}.create`,
              `${moduleName}.read`,
              `${moduleName}.update`,
            ],
          },
          {
            name: `${moduleName}_viewer`,
            description: `Read-only access to ${moduleName}`,
            permissions: [`${moduleName}.read`],
          },
        ]
      : [
          {
            name: `${moduleName}`,
            description: `Access to ${moduleName}`,
            permissions: permissions.map((p) => p.name),
          },
        ];

    const generatedData = {
      permissions,
      roles,
      sql: [],
    };

    if (dryRun) {
      console.log(
        `📋 Would create ${permissions.length} permissions and ${roles.length} roles for module: ${moduleName}`,
      );

      // Generate SQL for preview
      generatedData.sql = await generateRolesSql(
        permissions,
        roles,
        moduleName,
      );

      return generatedData;
    }

    // Check if permissions already exist
    const existingPermissions = await knex('permissions')
      .whereIn(
        'name',
        permissions.map((p) => p.name),
      )
      .select('name');

    const existingPermissionNames = existingPermissions.map((p) => p.name);
    const newPermissions = permissions.filter(
      (p) => !existingPermissionNames.includes(p.name),
    );

    // Insert new permissions
    if (newPermissions.length > 0) {
      await knex('permissions').insert(
        newPermissions.map((p) => ({
          name: p.name,
          description: p.description,
          resource: p.resource,
          action: p.action,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      );

      console.log(`✅ Created ${newPermissions.length} permissions`);
    } else {
      console.log(
        `ℹ️  All permissions already exist for module: ${moduleName}`,
      );
    }

    // Check if roles already exist
    const existingRoles = await knex('roles')
      .whereIn(
        'name',
        roles.map((r) => r.name),
      )
      .select('name');

    const existingRoleNames = existingRoles.map((r) => r.name);
    const newRoles = roles.filter((r) => !existingRoleNames.includes(r.name));

    // Insert new roles
    if (newRoles.length > 0) {
      for (const role of newRoles) {
        await knex.transaction(async (trx) => {
          // Insert role
          const [roleRecord] = await trx('roles')
            .insert({
              name: role.name,
              description: role.description,
              created_at: new Date(),
              updated_at: new Date(),
            })
            .returning('*');

          // Get permission IDs
          const permissionRecords = await trx('permissions')
            .whereIn('name', role.permissions)
            .select('id', 'name');

          // Insert role permissions
          if (permissionRecords.length > 0) {
            const rolePermissions = permissionRecords.map((perm) => ({
              role_id: roleRecord.id,
              permission_id: perm.id,
              created_at: new Date(),
            }));

            await trx('role_permissions').insert(rolePermissions);
          }
        });
      }

      console.log(`✅ Created ${newRoles.length} roles with permissions`);
    } else {
      console.log(`ℹ️  All roles already exist for module: ${moduleName}`);
    }

    console.log(`🎯 Role generation completed for module: ${moduleName}`);

    return generatedData;
  } catch (error) {
    console.error(`❌ Error generating roles and permissions:`, error.message);
    throw error;
  } finally {
    await knex.destroy();
  }
}

/**
 * Generate SQL statements for roles and permissions (for dry-run preview)
 */
async function generateRolesSql(permissions, roles, moduleName) {
  const sql = [];

  // Permissions SQL
  sql.push(`-- Permissions for module: ${moduleName}`);
  for (const perm of permissions) {
    sql.push(`INSERT INTO permissions (name, description, resource, action, created_at, updated_at) 
VALUES ('${perm.name}', '${perm.description}', '${perm.resource}', '${perm.action}', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;`);
  }

  sql.push('');

  // Roles SQL
  sql.push(`-- Roles for module: ${moduleName}`);
  for (const role of roles) {
    sql.push(`INSERT INTO roles (name, description, created_at, updated_at) 
VALUES ('${role.name}', '${role.description}', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;`);
  }

  sql.push('');

  // Role permissions SQL
  sql.push(`-- Role permissions for module: ${moduleName}`);
  for (const role of roles) {
    for (const permName of role.permissions) {
      sql.push(`INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, NOW()
FROM roles r, permissions p 
WHERE r.name = '${role.name}' AND p.name = '${permName}'
ON CONFLICT (role_id, permission_id) DO NOTHING;`);
    }
  }

  return sql;
}

/**
 * Delete roles and permissions for a module (cleanup)
 */
async function deleteModuleRoles(moduleName, options = {}) {
  const { dryRun = false } = options;

  const knex = getKnexConnection();

  try {
    if (dryRun) {
      console.log(
        `📋 Would delete all roles and permissions for module: ${moduleName}`,
      );
      return;
    }

    await knex.transaction(async (trx) => {
      // Delete role permissions first
      await trx('role_permissions')
        .whereIn(
          'role_id',
          trx('roles').select('id').where('name', 'like', `${moduleName}_%`),
        )
        .del();

      // Delete roles
      const deletedRoles = await trx('roles')
        .where('name', 'like', `${moduleName}_%`)
        .del();

      // Delete permissions
      const deletedPermissions = await trx('permissions')
        .where('resource', moduleName)
        .del();

      console.log(
        `🗑️  Deleted ${deletedRoles} roles and ${deletedPermissions} permissions for module: ${moduleName}`,
      );
    });
  } catch (error) {
    console.error(
      `❌ Error deleting roles for module ${moduleName}:`,
      error.message,
    );
    throw error;
  } finally {
    await knex.destroy();
  }
}

/**
 * List existing roles and permissions for a module
 */
async function listModuleRoles(moduleName) {
  const knex = getKnexConnection();

  try {
    // Get permissions
    const permissions = await knex('permissions')
      .where('resource', moduleName)
      .select('name', 'description', 'action');

    // Get roles
    const roles = await knex('roles')
      .where('name', 'like', `${moduleName}_%`)
      .select('id', 'name', 'description');

    // Get role permissions
    for (const role of roles) {
      const rolePermissions = await knex('role_permissions as rp')
        .join('permissions as p', 'rp.permission_id', 'p.id')
        .where('rp.role_id', role.id)
        .select('p.name', 'p.description');

      role.permissions = rolePermissions;
    }

    return {
      permissions,
      roles,
    };
  } catch (error) {
    console.error(
      `❌ Error listing roles for module ${moduleName}:`,
      error.message,
    );
    throw error;
  } finally {
    await knex.destroy();
  }
}

module.exports = {
  generateRolesAndPermissions,
  generateMigrationFile,
  writeToDatabase,
  deleteModuleRoles,
  listModuleRoles,
  generateRolesSql,
  renderMigrationTemplate,
};
