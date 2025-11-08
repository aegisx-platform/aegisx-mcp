import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create role_assignment_history table for audit logging
  await knex.schema.createTable('role_assignment_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .uuid('role_id')
      .notNullable()
      .references('id')
      .inTable('roles')
      .onDelete('CASCADE');

    // Action: 'assigned' | 'removed' | 'expired'
    table
      .enum('action', ['assigned', 'removed', 'expired'], {
        useNative: true,
        enumName: 'role_assignment_action',
      })
      .notNullable();

    // Who performed the action
    table
      .uuid('performed_by')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    // When the action was performed
    table.timestamp('performed_at').notNullable().defaultTo(knex.fn.now());

    // Expiry date if applicable
    table.timestamp('expires_at').nullable();

    // Additional metadata (JSON for flexibility)
    table.jsonb('metadata').nullable();

    // Timestamp
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Indexes for better query performance
    table.index('user_id');
    table.index('role_id');
    table.index('performed_at');
    table.index('action');
    table.index(['user_id', 'performed_at']);
    table.index(['user_id', 'action']);
  });

  // Add comment to table
  await knex.schema.raw(`
    COMMENT ON TABLE role_assignment_history IS 'Audit log for role assignment operations. Tracks all role assignment/removal/expiry events for compliance and debugging.';
    COMMENT ON COLUMN role_assignment_history.action IS 'Type of action: assigned (role added to user), removed (role removed from user), or expired (role automatically expired)';
    COMMENT ON COLUMN role_assignment_history.performed_by IS 'User ID who performed the action. NULL for system-triggered events (e.g., expiry).';
    COMMENT ON COLUMN role_assignment_history.metadata IS 'Additional context: previous roles, reason for removal, etc.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop enum type if it exists
  await knex.schema.raw('DROP TABLE IF EXISTS role_assignment_history CASCADE');
  await knex.schema.raw('DROP TYPE IF EXISTS role_assignment_action CASCADE');
}
