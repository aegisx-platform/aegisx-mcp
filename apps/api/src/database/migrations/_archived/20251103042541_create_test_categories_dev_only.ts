import type { Knex } from 'knex';

/**
 * 🧪 DEVELOPMENT-ONLY TABLE: test_categories
 *
 * Purpose: Test CRUD generator with parent table (FK references)
 * Environment: Only created in development/test
 * Production: Safely skipped with early return
 *
 * Coverage:
 * - Unique constraints (code, name)
 * - Enum type (status)
 * - JSONB fields (metadata, settings)
 * - Boolean fields (is_active, is_featured)
 * - Integer with validation (item_count >= 0)
 * - Decimal type (discount_rate)
 * - Audit fields (created_by, updated_by)
 * - Soft delete (deleted_at)
 */

export async function up(knex: Knex): Promise<void> {
  // 🛡️ PRODUCTION SAFETY: Skip in production
  const isDevelopment =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  if (!isDevelopment) {
    console.log('⏭️  [PROD] Skipping test_categories creation');
    return;
  }

  // 🧪 CREATE TEST TABLE (Development/Test Only)
  await knex.schema.createTable('test_categories', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Unique Constraints (2 fields)
    table
      .string('code', 50)
      .notNullable()
      .unique()
      .comment('Unique category code (e.g., ELEC, BOOK)');
    table
      .string('name', 255)
      .notNullable()
      .unique()
      .comment('Unique category name');
    table.string('slug', 255).notNullable().comment('URL-friendly slug');

    // Text Type
    table.text('description').nullable();

    // Boolean Types (2 fields)
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);

    // Integer Types with Business Rules
    table.integer('display_order').defaultTo(0);
    table
      .integer('item_count')
      .defaultTo(0)
      .comment('Business rule: must be >= 0');

    // Decimal Type
    table
      .decimal('discount_rate', 5, 2)
      .nullable()
      .comment('Percentage discount (0.00-999.99)');

    // JSONB Types (2 fields)
    table
      .jsonb('metadata')
      .nullable()
      .comment('Flexible metadata (icon, color, etc.)');
    table.jsonb('settings').nullable().comment('Category-specific settings');

    // Enum Type
    table.enum('status', ['draft', 'active', 'archived']).defaultTo('draft');

    // Foreign Keys (Audit)
    table.uuid('created_by').nullable();
    table.uuid('updated_by').nullable();
    table.foreign('created_by').references('users.id').onDelete('SET NULL');
    table.foreign('updated_by').references('users.id').onDelete('SET NULL');

    // Soft Delete
    table.timestamp('deleted_at').nullable();

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index('code', 'idx_test_categories_code');
    table.index('slug', 'idx_test_categories_slug');
    table.index('status', 'idx_test_categories_status');
    table.index('is_active', 'idx_test_categories_is_active');
    table.index(['status', 'is_active'], 'idx_test_categories_status_active');
  });

  console.log('✅ [DEV] Created test_categories table');
}

export async function down(knex: Knex): Promise<void> {
  // ✅ Safe: dropTableIfExists won't error if table doesn't exist
  await knex.schema.dropTableIfExists('test_categories');
  console.log('✅ Dropped test_categories table');
}
