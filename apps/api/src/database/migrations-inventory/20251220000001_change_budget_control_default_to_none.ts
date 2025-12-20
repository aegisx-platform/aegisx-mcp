import type { Knex } from 'knex';

/**
 * Change Budget Control Default Values to NONE
 *
 * Purpose: Change default values for control types from 'SOFT' to 'NONE'
 * Reason: Items should not have control by default - user opts in manually
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -- Change default values to NONE
    ALTER TABLE inventory.budget_request_items
      ALTER COLUMN quantity_control_type SET DEFAULT 'NONE',
      ALTER COLUMN price_control_type SET DEFAULT 'NONE';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    -- Revert to SOFT default
    ALTER TABLE inventory.budget_request_items
      ALTER COLUMN quantity_control_type SET DEFAULT 'SOFT',
      ALTER COLUMN price_control_type SET DEFAULT 'SOFT';
  `);
}
