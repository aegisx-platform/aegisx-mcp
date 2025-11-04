/**
 * Permission Migration Helper
 *
 * Provides reusable utilities for permission assignment migrations.
 * Ensures idempotent, atomic, and safe permission assignments.
 */

/**
 * Create permissions and optionally assign them to roles
 *
 * Features:
 * - Idempotent: Safe to run multiple times
 * - Atomic: Wrapped in transaction
 * - Safe: Checks role existence before assignment
 * - Flexible: Supports multiple role assignments
 *
 * @param {object} knex - Knex instance
 * @param {array} permissions - List of permissions to create
 * @param {object} options - Configuration options
 */
async function createPermissions(knex, permissions, options = {}) {
  const { assignToAdmin = true, roleAssignments = [] } = options;

  return knex.transaction(async (trx) => {
    // Step 1: Create permissions (idempotent)
    for (const permission of permissions) {
      await trx.raw(
        `
        INSERT INTO permissions (resource, action, description, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
        ON CONFLICT (resource, action) DO UPDATE
        SET
          description = EXCLUDED.description,
          updated_at = NOW()
      `,
        [
          permission.resource,
          permission.action,
          permission.description ||
            `${permission.action} ${permission.resource}`,
        ],
      );
    }

    // Step 2: Assign permissions to admin role (if enabled)
    if (assignToAdmin) {
      await assignPermissionsToRole(trx, 'admin', permissions, {
        skipIfRoleNotExists: true,
      });
    }

    // Step 3: Assign permissions to additional roles
    for (const assignment of roleAssignments) {
      await assignPermissionsToRole(
        trx,
        assignment.roleId,
        assignment.permissions,
        { skipIfRoleNotExists: true },
      );
    }
  });
}

/**
 * Assign permissions to a role
 *
 * Features:
 * - Idempotent: Uses ON CONFLICT DO NOTHING
 * - Safe: Can skip if role doesn't exist
 * - Efficient: Uses parameterized queries
 * - Flexible: Accepts role name or UUID
 *
 * @param {object} trx - Knex transaction
 * @param {string} roleIdOrName - Role UUID or role name
 * @param {array} permissions - Permissions to assign
 * @param {object} options - Assignment options
 */
async function assignPermissionsToRole(
  trx,
  roleIdOrName,
  permissions,
  options = {},
) {
  const { skipIfRoleNotExists = true } = options;

  // Try to find role by name first, then by ID
  let role = await trx('roles').where({ name: roleIdOrName }).first();

  if (!role) {
    // If not found by name, try by ID
    role = await trx('roles').where({ id: roleIdOrName }).first();
  }

  if (!role) {
    if (skipIfRoleNotExists) {
      console.log(
        `[Migration] Role ${roleIdOrName} not found, skipping permission assignment`,
      );
      return;
    } else {
      throw new Error(`Role ${roleIdOrName} not found`);
    }
  }

  const roleId = role.id;

  // Assign each permission to the role
  for (const permission of permissions) {
    await trx.raw(
      `
      INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
      SELECT ?, id, NOW(), NOW()
      FROM permissions
      WHERE resource = ? AND action = ?
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `,
      [roleId, permission.resource, permission.action],
    );
  }
}

/**
 * Remove permissions (for down migrations)
 *
 * Features:
 * - Safe: Only removes specified permissions
 * - Cascading: Removes role assignments first
 * - Atomic: Wrapped in transaction
 *
 * @param {object} knex - Knex instance
 * @param {array} permissions - Permissions to remove
 */
async function removePermissions(knex, permissions) {
  return knex.transaction(async (trx) => {
    for (const permission of permissions) {
      // Remove role assignments first
      await trx.raw(
        `
        DELETE FROM role_permissions
        WHERE permission_id = (
          SELECT id FROM permissions
          WHERE resource = ? AND action = ?
        )
      `,
        [permission.resource, permission.action],
      );

      // Then remove permission
      await trx('permissions')
        .where({
          resource: permission.resource,
          action: permission.action,
        })
        .delete();
    }
  });
}

/**
 * Check if permission exists
 */
async function permissionExists(knex, resource, action) {
  const result = await knex('permissions').where({ resource, action }).first();
  return !!result;
}

/**
 * Get permission ID by resource and action
 */
async function getPermissionId(knex, resource, action) {
  const result = await knex('permissions')
    .select('id')
    .where({ resource, action })
    .first();
  return result?.id || null;
}

/**
 * Create role if it doesn't exist, with optional parent role
 *
 * Features:
 * - Idempotent: Safe to run multiple times
 * - Parent role lookup: Can reference parent by name
 * - Hierarchical: Supports role inheritance via parent_id
 *
 * @param {object} knex - Knex instance
 * @param {string} roleName - Name of the role to create
 * @param {string} description - Description of the role
 * @param {string} parentRoleName - Optional parent role name for hierarchy
 */
async function createRoleIfNotExists(
  knex,
  roleName,
  description = null,
  parentRoleName = null,
) {
  return knex.transaction(async (trx) => {
    // Find parent role ID if parentRoleName provided
    let parentId = null;
    if (parentRoleName) {
      const parentRole = await trx('roles')
        .where('name', parentRoleName)
        .first();
      if (!parentRole) {
        console.log(
          `[Migration] Parent role "${parentRoleName}" not found, creating role without parent`,
        );
      } else {
        parentId = parentRole.id;
      }
    }

    // Create or update role
    await trx.raw(
      `
      INSERT INTO roles (name, description, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
      ON CONFLICT (name) DO UPDATE
      SET
        description = EXCLUDED.description,
        parent_id = EXCLUDED.parent_id,
        updated_at = NOW()
    `,
      [roleName, description || `${roleName} role`, parentId],
    );

    if (parentId) {
      console.log(
        `✅ Created/updated role: "${roleName}" (parent: "${parentRoleName}")`,
      );
    } else {
      console.log(`✅ Created/updated role: "${roleName}"`);
    }
  });
}

module.exports = {
  createPermissions,
  createRoleIfNotExists,
  removePermissions,
  permissionExists,
  getPermissionId,
};
