import type { Knex } from 'knex';

/**
 * Migration: Budget Requests Mode 1 Support
 *
 * Changes:
 * 1. Make department_id nullable for hospital-wide mode (Mode 1)
 * 2. Add parent_request_id for Mode 2 (future)
 * 3. Add is_aggregated, aggregated_at for Mode 2
 * 4. Add budget_type_id to items for budget allocation
 * 5. Add source tracking fields for Mode 2 aggregation
 */

export async function up(knex: Knex): Promise<void> {
  // 1. Make department_id nullable for hospital-wide mode
  await knex.raw(`
    ALTER TABLE inventory.budget_requests
    ALTER COLUMN department_id DROP NOT NULL
  `);

  // 2. Add parent_request_id for Mode 2 (future)
  await knex.schema
    .withSchema('inventory')
    .alterTable('budget_requests', (table) => {
      table
        .bigInteger('parent_request_id')
        .references('id')
        .inTable('inventory.budget_requests')
        .onDelete('SET NULL')
        .comment('Parent request for department aggregation (Mode 2)');
    });

  // 3. Add aggregation metadata
  await knex.schema
    .withSchema('inventory')
    .alterTable('budget_requests', (table) => {
      table
        .boolean('is_aggregated')
        .defaultTo(false)
        .comment('TRUE if this is an aggregated parent request');

      table
        .timestamp('aggregated_at')
        .nullable()
        .comment('When this request was aggregated');
    });

  // 4. budget_type_id already exists (added by previous migration)
  // Skipping - already added by 20251208201656_enhance_budget_request_items.ts

  // 5. Add source tracking fields for Mode 2
  await knex.schema
    .withSchema('inventory')
    .alterTable('budget_request_items', (table) => {
      table
        .bigInteger('source_request_id')
        .references('id')
        .inTable('inventory.budget_requests')
        .onDelete('SET NULL')
        .comment('Original department request (for aggregated items)');

      table
        .integer('source_department_id')
        .references('id')
        .inTable('inventory.departments')
        .onDelete('SET NULL')
        .comment('Original department (for aggregated items)');
    });

  // 6. Add index for better query performance
  await knex.schema
    .withSchema('inventory')
    .alterTable('budget_requests', (table) => {
      table.index('parent_request_id', 'idx_budget_requests_parent');
      table.index(
        ['fiscal_year', 'department_id'],
        'idx_budget_requests_fiscal_dept',
      );
    });
}

export async function down(knex: Knex): Promise<void> {
  // Drop indexes
  await knex.schema
    .withSchema('inventory')
    .alterTable('budget_requests', (table) => {
      table.dropIndex('parent_request_id', 'idx_budget_requests_parent');
      table.dropIndex(
        ['fiscal_year', 'department_id'],
        'idx_budget_requests_fiscal_dept',
      );
    });

  // Drop source tracking fields
  await knex.schema
    .withSchema('inventory')
    .alterTable('budget_request_items', (table) => {
      table.dropColumn('source_department_id');
      table.dropColumn('source_request_id');
    });

  // budget_type_id managed by other migration - don't drop
  // (Added by 20251208201656_enhance_budget_request_items.ts)

  // Drop aggregation metadata
  await knex.schema
    .withSchema('inventory')
    .alterTable('budget_requests', (table) => {
      table.dropColumn('aggregated_at');
      table.dropColumn('is_aggregated');
    });

  // Drop parent_request_id
  await knex.schema
    .withSchema('inventory')
    .alterTable('budget_requests', (table) => {
      table.dropColumn('parent_request_id');
    });

  // Cannot easily restore NOT NULL constraint on department_id
  // Manual intervention required if rollback is needed
}
