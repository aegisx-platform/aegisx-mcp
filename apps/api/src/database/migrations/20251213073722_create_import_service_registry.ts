import type { Knex } from 'knex';

/**
 * Migration: Create import_service_registry table
 *
 * Tracks auto-discovered import services with metadata, status, and dependencies
 * Part of: Auto-Discovery Import System
 *
 * Table purpose:
 * - Stores metadata for all discovered import services
 * - Tracks import status and completion
 * - Manages dependency relationships
 * - Records file path for source service implementations
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('import_service_registry', (table) => {
    // Primary key
    table.increments('id').primary();

    // Module identification
    table
      .string('module_name', 100)
      .notNullable()
      .unique()
      .comment('Unique module identifier (e.g., drug_generics)');

    // Domain classification
    table
      .string('domain', 50)
      .notNullable()
      .comment('Domain (e.g., inventory, core, hr)');

    table
      .string('subdomain', 50)
      .nullable()
      .comment('Subdomain (e.g., master-data, operations)');

    // Display information
    table
      .string('display_name', 200)
      .notNullable()
      .comment('Human-readable name (e.g., Drug Generics (ยาหลัก))');

    table.text('description').nullable().comment('Module description');

    // Dependencies and priority
    table
      .jsonb('dependencies')
      .notNullable()
      .defaultTo('[]')
      .comment('Array of module dependencies (e.g., ["users", "departments"])');

    table
      .integer('priority')
      .notNullable()
      .defaultTo(100)
      .comment(
        'Import priority: 1 = highest (import first), 100+ = lower priority',
      );

    // Classification tags
    table
      .jsonb('tags')
      .notNullable()
      .defaultTo('[]')
      .comment('Tags for categorization (e.g., ["master-data", "required"])');

    // Capabilities
    table
      .boolean('supports_rollback')
      .notNullable()
      .defaultTo(false)
      .comment('Whether this service supports rolling back imports');

    // Version information
    table
      .string('version', 20)
      .nullable()
      .comment('Service implementation version (e.g., 1.0.0)');

    // Import status tracking
    table
      .string('import_status', 20)
      .notNullable()
      .defaultTo('not_started')
      .comment(
        'Current import status: not_started, in_progress, completed, error',
      );

    table
      .timestamp('last_import_date')
      .nullable()
      .comment('When the last successful import was completed');

    table
      .uuid('last_import_job_id')
      .nullable()
      .comment('Reference to last import job in import_history');

    table
      .integer('record_count')
      .notNullable()
      .defaultTo(0)
      .comment('Number of records imported in last successful import');

    // Discovery metadata
    table
      .timestamp('discovered_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When this service was first auto-discovered');

    table
      .string('file_path', 500)
      .nullable()
      .comment('File path to service implementation');

    // Audit fields
    table.timestamps(true, true);

    // ========================================================================
    // INDEXES
    // ========================================================================

    // Basic lookups
    table.index(['module_name'], 'idx_isr_module_name');
    table.index(['domain'], 'idx_isr_domain');
    table.index(['import_status'], 'idx_isr_status');
    table.index(['priority'], 'idx_isr_priority');

    // Timestamps for ordering
    table.index(['discovered_at'], 'idx_isr_discovered');
    table.index(['last_import_date'], 'idx_isr_last_import');

    // Composite indexes for common queries
    table.index(['domain', 'import_status'], 'idx_isr_domain_status');
    table.index(['priority', 'import_status'], 'idx_isr_priority_status');
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE import_service_registry IS
    'Registry of auto-discovered import services with metadata, dependencies, and import status tracking'
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('import_service_registry');
}
