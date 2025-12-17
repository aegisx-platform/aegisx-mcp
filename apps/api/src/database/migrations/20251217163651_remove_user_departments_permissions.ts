import { Knex } from 'knex';

/**
 * Migration: Remove Permission Columns from user_departments
 *
 * Part of: RBAC Permission Consolidation Spec
 * Phase: 3 - Database Schema Changes (Task 7)
 *
 * Purpose:
 * - Remove redundant permission columns from user_departments table
 * - Permissions now managed exclusively through RBAC system
 * - Five boolean columns being removed:
 *   1. can_create_requests
 *   2. can_edit_requests
 *   3. can_submit_requests
 *   4. can_approve_requests
 *   5. can_view_reports
 *
 * Migration Strategy:
 * - up(): Drop all 5 permission columns
 * - down(): Restore columns with original defaults for rollback capability
 * - Transaction-wrapped for atomicity
 * - Detailed logging for audit trail
 *
 * Prerequisites:
 * - Permission mapping script must have been run (Task 4)
 * - All users must have equivalent RBAC permissions assigned
 * - Audit script confirms no users at risk of losing access
 *
 * Safety:
 * - Fully reversible via down() migration
 * - Transaction ensures all-or-nothing execution
 * - No data loss (permission logic moved to RBAC tables)
 */

export async function up(knex: Knex): Promise<void> {
  console.log('========================================');
  console.log(
    'Starting migration: Removing permission columns from user_departments',
  );
  console.log('========================================');

  try {
    await knex.transaction(async (trx) => {
      console.log(
        '→ Dropping permission columns from user_departments table...',
      );

      await trx.schema.alterTable('user_departments', (table) => {
        // Drop all 5 permission columns
        table.dropColumn('can_create_requests');
        table.dropColumn('can_edit_requests');
        table.dropColumn('can_submit_requests');
        table.dropColumn('can_approve_requests');
        table.dropColumn('can_view_reports');
      });

      console.log('✓ Successfully dropped 5 permission columns:');
      console.log('  - can_create_requests');
      console.log('  - can_edit_requests');
      console.log('  - can_submit_requests');
      console.log('  - can_approve_requests');
      console.log('  - can_view_reports');
    });

    console.log('========================================');
    console.log('✓ Migration completed successfully');
    console.log('========================================');
  } catch (error) {
    console.error('========================================');
    console.error('✗ Migration failed with error:');
    console.error(error);
    console.error('========================================');
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  console.log('========================================');
  console.log('Rolling back: Restoring permission columns to user_departments');
  console.log('========================================');

  try {
    await knex.transaction(async (trx) => {
      console.log(
        '→ Restoring permission columns to user_departments table...',
      );

      await trx.schema.alterTable('user_departments', (table) => {
        // Restore all 5 permission columns with original definitions from
        // migration: 20251213074350_create_user_departments.ts

        table
          .boolean('can_create_requests')
          .notNullable()
          .defaultTo(true)
          .comment('Can user create budget requests in this department?');

        table
          .boolean('can_edit_requests')
          .notNullable()
          .defaultTo(true)
          .comment('Can user edit draft budget requests in this department?');

        table
          .boolean('can_submit_requests')
          .notNullable()
          .defaultTo(true)
          .comment('Can user submit budget requests from this department?');

        table
          .boolean('can_approve_requests')
          .notNullable()
          .defaultTo(false)
          .comment(
            'Can user approve budget requests in this department? (Head/supervisor only)',
          );

        table
          .boolean('can_view_reports')
          .notNullable()
          .defaultTo(true)
          .comment('Can user view reports for this department?');
      });

      console.log('✓ Successfully restored 5 permission columns:');
      console.log('  - can_create_requests (default: true)');
      console.log('  - can_edit_requests (default: true)');
      console.log('  - can_submit_requests (default: true)');
      console.log('  - can_approve_requests (default: false)');
      console.log('  - can_view_reports (default: true)');
    });

    console.log('========================================');
    console.log('✓ Rollback completed successfully');
    console.log('========================================');
  } catch (error) {
    console.error('========================================');
    console.error('✗ Rollback failed with error:');
    console.error(error);
    console.error('========================================');
    throw error;
  }
}
