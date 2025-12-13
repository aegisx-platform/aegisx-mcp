import type { Knex } from 'knex';

/**
 * Migration: Create user_departments junction table
 *
 * Manages flexible user-to-department assignments with:
 * - Support for multi-department users
 * - Temporal validity (valid_from/until dates)
 * - Granular permissions per department
 * - Assignment history and audit trail
 *
 * Part of: Department Management System (Week 1: Database Layer)
 *
 * Table purpose:
 * - Allows one user to work in multiple departments
 * - Tracks department-specific permissions and roles
 * - Supports temporary assignments with time windows
 * - Maintains complete assignment history for compliance
 * - Enables soft deletes via valid_until date
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_departments', (table) => {
    // ========================================================================
    // PRIMARY KEY
    // ========================================================================
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'))
      .comment('Unique identifier for this user-department assignment');

    // ========================================================================
    // FOREIGN KEYS
    // ========================================================================
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .comment('Reference to user record');

    table
      .integer('department_id')
      .notNullable()
      .references('id')
      .inTable('inventory.departments')
      .onDelete('CASCADE')
      .comment('Reference to department record in inventory schema');

    table
      .integer('hospital_id')
      .nullable()
      .references('id')
      .inTable('inventory.hospitals')
      .onDelete('CASCADE')
      .comment('Reference to hospital (for multi-hospital support)');

    // ========================================================================
    // ASSIGNMENT METADATA
    // ========================================================================
    table
      .boolean('is_primary')
      .notNullable()
      .defaultTo(false)
      .comment("Whether this is the user's primary/default department");

    table
      .string('assigned_role', 50)
      .nullable()
      .comment('Role in this department (e.g., pharmacist, head, staff)');

    // ========================================================================
    // GRANULAR PERMISSIONS
    // ========================================================================
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

    // ========================================================================
    // TEMPORAL VALIDITY
    // ========================================================================
    table
      .date('valid_from')
      .nullable()
      .comment(
        'Assignment becomes effective on this date (null = immediately)',
      );

    table
      .date('valid_until')
      .nullable()
      .comment(
        'Assignment expires on this date (null = indefinite, or used for soft delete)',
      );

    // ========================================================================
    // AUDIT TRAIL
    // ========================================================================
    table
      .uuid('assigned_by')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .comment('User who made this assignment (admin/manager)');

    table
      .timestamp('assigned_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When this assignment was made');

    table
      .text('notes')
      .nullable()
      .comment(
        'Notes about the assignment (e.g., reason for temporary assignment)',
      );

    // ========================================================================
    // SYSTEM AUDIT FIELDS
    // ========================================================================
    table.timestamps(true, true);

    // ========================================================================
    // CONSTRAINTS
    // ========================================================================
    table
      .unique(['user_id', 'department_id', 'hospital_id'], {
        indexName: 'idx_ud_unique_user_dept_hospital',
      })
      .comment(
        'Prevent duplicate assignments (user cannot be assigned twice to same department in same hospital)',
      );

    // Validity period constraint
    // (checked with raw SQL after table creation)

    // ========================================================================
    // INDEXES
    // ========================================================================

    // Lookup by user (common query: find all departments for user)
    table.index(['user_id'], 'idx_ud_user');

    // Lookup by department (find all users in department)
    table.index(['department_id'], 'idx_ud_department');

    // Lookup by hospital (multi-hospital support)
    table.index(['hospital_id'], 'idx_ud_hospital');

    // Find user's primary department quickly
    table.index(['user_id', 'is_primary'], 'idx_ud_primary');

    // Validity window queries (active assignments as of date)
    table.index(['valid_from', 'valid_until'], 'idx_ud_validity');

    // Audit queries
    table.index(['assigned_by'], 'idx_ud_assigned_by');
    table.index(['assigned_at'], 'idx_ud_assigned_at');

    // Permission queries (e.g., find users who can approve in department)
    table.index(
      ['department_id', 'can_approve_requests'],
      'idx_ud_dept_approvers',
    );

    // Composite indexes for common workflows
    table.index(
      ['user_id', 'valid_from', 'valid_until'],
      'idx_ud_user_validity',
    );

    table.index(
      ['department_id', 'valid_from', 'valid_until'],
      'idx_ud_dept_validity',
    );
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE user_departments IS
    'Junction table managing flexible user-to-department assignments with temporal validity, granular permissions, and audit trail'
  `);

  // Add column comments
  await knex.raw(`
    COMMENT ON COLUMN user_departments.is_primary IS
    'Flag indicating if this is the user''s primary department (used for default budget request department)'
  `);

  await knex.raw(`
    COMMENT ON COLUMN user_departments.valid_until IS
    'Soft delete mechanism: setting to NOW() marks assignment as inactive while preserving history'
  `);

  // Add check constraint for validity date range
  await knex.raw(`
    ALTER TABLE user_departments
    ADD CONSTRAINT valid_date_range
    CHECK (valid_until IS NULL OR valid_until >= valid_from)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_departments');
}
