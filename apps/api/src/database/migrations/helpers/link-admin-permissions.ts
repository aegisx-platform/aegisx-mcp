import type { Knex } from 'knex';

/**
 * Link all permissions for a resource to the admin role
 *
 * @param knex - Knex instance
 * @param resource - Resource name (e.g., 'testProducts', 'users', 'articles')
 * @param actions - Optional array of specific actions to link. If not provided, links all actions for the resource.
 * @returns Promise<{ linked: number; skipped: number }>
 *
 * @example
 * // Link all testProducts permissions to admin role
 * await linkAdminPermissions(knex, 'testProducts');
 *
 * @example
 * // Link only specific actions to admin role
 * await linkAdminPermissions(knex, 'testProducts', ['create', 'read', 'update']);
 */
export async function linkAdminPermissions(
  knex: Knex,
  resource: string,
  actions?: string[],
): Promise<{ linked: number; skipped: number }> {
  console.log(`🔗 Linking ${resource} permissions to admin role...`);

  // Find admin role
  const adminRole = await knex('roles').where('name', 'admin').first();

  if (!adminRole) {
    console.log('⚠️  Admin role not found, skipping admin role permissions');
    return { linked: 0, skipped: 0 };
  }

  // Build query for permissions
  let query = knex('permissions').where('resource', resource);

  if (actions && actions.length > 0) {
    query = query.whereIn('action', actions);
  }

  const permissions = await query.select('id', 'action');

  if (permissions.length === 0) {
    console.log(`⚠️  No permissions found for resource: ${resource}`);
    return { linked: 0, skipped: 0 };
  }

  // Prepare role permissions data
  const rolePermissions = permissions.map((p) => ({
    role_id: adminRole.id,
    permission_id: p.id,
  }));

  // Insert with conflict handling
  const inserted = await knex('role_permissions')
    .insert(rolePermissions)
    .onConflict(['role_id', 'permission_id'])
    .ignore();

  // Calculate how many were actually inserted vs skipped
  const linked = Array.isArray(inserted) ? inserted.length : permissions.length;
  const skipped = permissions.length - linked;

  console.log(
    `✅ Linked ${linked} permissions to admin role (${skipped} already existed)`,
  );

  return { linked, skipped };
}

/**
 * Remove all permission links for a resource from the admin role
 *
 * @param knex - Knex instance
 * @param resource - Resource name (e.g., 'testProducts', 'users', 'articles')
 * @returns Promise<number> - Number of links removed
 *
 * @example
 * // Remove all testProducts permission links from admin role
 * await unlinkAdminPermissions(knex, 'testProducts');
 */
export async function unlinkAdminPermissions(
  knex: Knex,
  resource: string,
): Promise<number> {
  console.log(`🗑️  Unlinking ${resource} permissions from admin role...`);

  // Find admin role
  const adminRole = await knex('roles').where('name', 'admin').first();

  if (!adminRole) {
    console.log('⚠️  Admin role not found, nothing to unlink');
    return 0;
  }

  // Get permission IDs for this resource
  const permissionIds = await knex('permissions')
    .where('resource', resource)
    .pluck('id');

  if (permissionIds.length === 0) {
    console.log(`⚠️  No permissions found for resource: ${resource}`);
    return 0;
  }

  // Remove role permissions
  const deleted = await knex('role_permissions')
    .where('role_id', adminRole.id)
    .whereIn('permission_id', permissionIds)
    .del();

  console.log(`✅ Unlinked ${deleted} permissions from admin role`);

  return deleted;
}

/**
 * Link permissions for multiple resources to admin role
 *
 * @param knex - Knex instance
 * @param resources - Array of resource names
 * @returns Promise<{ total: number; linked: number; skipped: number }>
 *
 * @example
 * // Link permissions for multiple resources
 * await linkMultipleAdminPermissions(knex, ['testProducts', 'users', 'articles']);
 */
export async function linkMultipleAdminPermissions(
  knex: Knex,
  resources: string[],
): Promise<{ total: number; linked: number; skipped: number }> {
  console.log(
    `🔗 Linking permissions for ${resources.length} resources to admin role...`,
  );

  let totalLinked = 0;
  let totalSkipped = 0;

  for (const resource of resources) {
    const result = await linkAdminPermissions(knex, resource);
    totalLinked += result.linked;
    totalSkipped += result.skipped;
  }

  console.log(
    `✅ Total: ${totalLinked} linked, ${totalSkipped} skipped across ${resources.length} resources`,
  );

  return {
    total: totalLinked + totalSkipped,
    linked: totalLinked,
    skipped: totalSkipped,
  };
}
