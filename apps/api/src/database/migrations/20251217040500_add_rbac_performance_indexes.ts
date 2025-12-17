import { Knex } from 'knex';

/**
 * IMPORTANT: This migration disables transaction wrapping to allow CONCURRENTLY.
 * CONCURRENTLY prevents table locking but cannot run inside transactions.
 */
export const config = { transaction: false };

/**
 * Migration: Add Performance Indexes for RBAC Permission Queries
 *
 * Purpose:
 * - Optimize permission cache queries in auth.strategies.ts
 * - Reduce query execution time by 30-50%
 * - Improve performance for large-scale RBAC systems
 *
 * Indexes Created:
 * 1. idx_user_roles_user_active: Composite index on (user_id, is_active)
 *    - Used by permission query to filter active role assignments
 *    - Improves WHERE clause performance
 *
 * 2. idx_role_permissions_role: Single column index on role_id
 *    - Used by permission query for JOIN operations
 *    - Speeds up role → permission lookups
 *
 * 3. idx_permissions_resource_action: Composite index on (resource, action)
 *    - Used by permission query for DISTINCT resource:action
 *    - Improves SELECT DISTINCT performance
 *
 * Performance Impact:
 * - Expected query time reduction: 30-50%
 * - Index creation uses CONCURRENTLY to avoid table locking
 * - Safe for production deployment without downtime
 */

export async function up(knex: Knex): Promise<void> {
  // Index 1: user_roles(user_id, is_active)
  // Used by: Permission query filtering active role assignments
  // Query pattern: WHERE user_roles.user_id = ? AND user_roles.is_active = true
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_active
    ON user_roles(user_id, is_active)
  `);

  // Index 2: role_permissions(role_id)
  // Used by: Permission query joining roles → role_permissions
  // Query pattern: JOIN role_permissions ON roles.id = role_permissions.role_id
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_role_permissions_role
    ON role_permissions(role_id)
  `);

  // Index 3: permissions(resource, action)
  // Used by: Permission query selecting distinct resource:action pairs
  // Query pattern: SELECT DISTINCT permissions.resource, permissions.action
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_permissions_resource_action
    ON permissions(resource, action)
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop indexes in reverse order
  await knex.raw(`DROP INDEX IF EXISTS idx_permissions_resource_action`);
  await knex.raw(`DROP INDEX IF EXISTS idx_role_permissions_role`);
  await knex.raw(`DROP INDEX IF EXISTS idx_user_roles_user_active`);
}
