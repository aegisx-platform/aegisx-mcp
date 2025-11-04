import type { Knex } from 'knex';

/**
 * Create file_access_control table
 *
 * Manages file sharing and access control entries.
 * Supports role-based access control (RBAC) and user-specific sharing.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('file_access_control', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // File and user references
    table
      .uuid('file_id')
      .notNullable()
      .references('id')
      .inTable('uploaded_files')
      .onDelete('CASCADE')
      .comment('File being shared');

    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .comment('User being granted access');

    // Access level
    table
      .string('access_level', 20)
      .notNullable()
      .comment('Access level: owner, write, read, none');

    // Grant information
    table
      .uuid('granted_by')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .comment('User who granted this access');

    table
      .timestamp('granted_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When access was granted');

    // Expiration
    table
      .timestamp('expires_at')
      .nullable()
      .comment('When access expires (null = permanent)');

    // Audit fields
    table.timestamps(true, true);

    // Unique constraint: one access entry per file-user pair
    table.unique(['file_id', 'user_id'], {
      indexName: 'uq_file_access_control_file_user',
    });

    // Indexes for queries
    table.index(['file_id'], 'idx_file_access_control_file');
    table.index(['user_id'], 'idx_file_access_control_user');
    table.index(['access_level'], 'idx_file_access_control_level');
    table.index(['expires_at'], 'idx_file_access_control_expires');
    table.index(['granted_by'], 'idx_file_access_control_granter');

    // Composite indexes
    table.index(
      ['file_id', 'access_level'],
      'idx_file_access_control_file_level',
    );
    table.index(
      ['user_id', 'access_level'],
      'idx_file_access_control_user_level',
    );

    // Cleanup index for expired access
    table.index(
      ['expires_at', 'updated_at'],
      'idx_file_access_control_cleanup',
    );
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE file_access_control IS 'File sharing and access control - manages user-specific permissions for files'
  `);

  // Add column comments
  await knex.raw(`
    COMMENT ON COLUMN file_access_control.access_level IS 'owner (full), write (read+write), read (read-only), none (no access)';
    COMMENT ON COLUMN file_access_control.expires_at IS 'Optional expiration time for time-limited access sharing';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('file_access_control');
}
