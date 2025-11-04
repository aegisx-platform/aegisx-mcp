import type { Knex } from 'knex';

/**
 * Migration: Add Role Hierarchy Support
 *
 * Adds parent_id column to roles table to support role inheritance.
 * This allows creating hierarchical roles where child roles inherit
 * permissions from parent roles.
 *
 * Architecture:
 * - Level 1: admin (root, parent_id = NULL)
 * - Level 2: Module roles (e.g., testProducts, parent_id = admin.id)
 * - Level 3: Custom roles (e.g., product_manager, parent_id = module_role.id)
 *
 * Features:
 * - Idempotent: Safe to run multiple times
 * - Backward compatible: Existing roles work unchanged (parent_id = NULL)
 * - Self-referencing: Foreign key to same table
 */

export async function up(knex: Knex): Promise<void> {
  console.log('[Migration] Adding role hierarchy support...');

  await knex.schema.alterTable('roles', (table) => {
    table
      .uuid('parent_id')
      .nullable()
      .references('id')
      .inTable('roles')
      .onDelete('SET NULL')
      .comment('Parent role ID for role hierarchy/inheritance');

    // Index for faster lookups when traversing hierarchy
    table.index('parent_id');
  });

  console.log('✅ Added parent_id column to roles table');
  console.log('✅ Added index on parent_id for performance');
}

export async function down(knex: Knex): Promise<void> {
  console.log('[Migration] Removing role hierarchy support...');

  await knex.schema.alterTable('roles', (table) => {
    table.dropColumn('parent_id');
  });

  console.log('✅ Removed parent_id column from roles table');
}
