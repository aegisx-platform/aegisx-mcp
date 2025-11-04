import type { Knex } from 'knex';

/**
 * Consolidated Migration: Test Tables for CRUD Generator Development
 *
 * Creates test tables for validating CRUD generator functionality:
 * - test_categories: Parent table with comprehensive field types
 * - test_products: Child table demonstrating various field configurations
 *
 * Both tables include:
 * - Unique constraints (code, name)
 * - Enum/string status fields
 * - JSONB fields (metadata, settings)
 * - Boolean fields (is_active, is_featured)
 * - Integer and decimal types
 * - Audit fields (created_by, updated_by)
 * - Soft delete (deleted_at)
 *
 * Environment: Development/Test only (production-safe)
 *
 * This consolidates migrations:
 * - 20251103042541_create_test_categories_dev_only.ts
 * - 20251104_create_test_products.ts
 */

export async function up(knex: Knex): Promise<void> {
  // ============================================================================
  // PRODUCTION SAFETY: Skip in production
  // ============================================================================
  const isDevelopment =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  if (!isDevelopment) {
    console.log('⏭️  [PROD] Skipping test tables creation (development only)');
    return;
  }

  // ============================================================================
  // 1. TEST_CATEGORIES TABLE (Parent Table)
  // ============================================================================
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

    // ========================================================================
    // INDEXES
    // ========================================================================
    table.index('code', 'idx_test_categories_code');
    table.index('slug', 'idx_test_categories_slug');
    table.index('status', 'idx_test_categories_status');
    table.index('is_active', 'idx_test_categories_is_active');
    table.index(['status', 'is_active'], 'idx_test_categories_status_active');
  });

  console.log('✅ [DEV] Created test_categories table');

  // ============================================================================
  // 2. TEST_PRODUCTS TABLE (Child Table)
  // ============================================================================
  const testProductsExists = await knex.schema.hasTable('test_products');
  if (!testProductsExists) {
    await knex.schema.createTable('test_products', (table) => {
      // Primary Key
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

      // Unique Constraints
      table.string('code').notNullable().unique();
      table.string('name').notNullable().unique();
      table.string('slug').notNullable();

      // Text Type
      table.text('description').nullable();

      // Boolean Types
      table.boolean('is_active').nullable().defaultTo(true);
      table.boolean('is_featured').nullable().defaultTo(false);

      // Integer Types
      table.integer('display_order').nullable();
      table.integer('item_count').nullable();

      // Decimal Type
      table.decimal('discount_rate', 5, 2).nullable();

      // JSONB Types
      table.jsonb('metadata').nullable();
      table.jsonb('settings').nullable();

      // Status (String instead of Enum for flexibility)
      table.string('status').nullable();

      // Audit Fields
      table.uuid('created_by').nullable();
      table.uuid('updated_by').nullable();

      // Soft Delete
      table.timestamp('deleted_at').nullable();

      // Timestamps
      table.timestamps(true, true);

      // ========================================================================
      // INDEXES
      // ========================================================================
      table.index('code', 'idx_test_products_code');
      table.index('slug', 'idx_test_products_slug');
      table.index('status', 'idx_test_products_status');
      table.index('is_active', 'idx_test_products_is_active');
    });

    console.log('✅ [DEV] Created test_products table');
  } else {
    console.log('ℹ️  [DEV] test_products table already exists, skipping');
  }

  // Add table comments
  await knex.raw(`
    COMMENT ON TABLE test_categories IS 'Development test table for CRUD generator validation - comprehensive field type coverage';
  `);

  await knex.raw(`
    COMMENT ON TABLE test_products IS 'Development test table for CRUD generator validation - flexible field configurations';
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Safe: dropTableIfExists won't error if table doesn't exist
  await knex.schema.dropTableIfExists('test_products');
  await knex.schema.dropTableIfExists('test_categories');
  console.log('✅ Dropped test tables');
}
