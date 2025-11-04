import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('error_logs', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Error details
    table.timestamp('timestamp').notNullable();
    table.enum('level', ['error', 'warn', 'info']).notNullable().index();
    table.text('message').notNullable();
    table.text('url');
    table.text('stack');
    table.jsonb('context');
    table
      .enum('type', ['javascript', 'http', 'angular', 'custom'])
      .notNullable()
      .index();

    // User context
    table.uuid('user_id').index();
    table.string('session_id', 255).index();
    table.string('user_agent', 512);

    // Request context
    table.string('correlation_id', 255).index();
    table.string('ip_address', 45); // IPv4 (15) or IPv6 (45)
    table.text('referer');

    // Timestamps
    table.timestamp('server_timestamp').notNullable().defaultTo(knex.fn.now());
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes for common queries
    table.index(['timestamp', 'level']); // Filter by time and severity
    table.index(['user_id', 'timestamp']); // User error history
    table.index(['type', 'timestamp']); // Error type analysis
    table.index('created_at'); // Cleanup old errors

    // Foreign key (optional, if users table exists)
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
  });

  // Add comment
  await knex.raw(`
    COMMENT ON TABLE error_logs IS 'Client and server error logs for monitoring and debugging';
  `);

  console.log('✅ Created error_logs table');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('error_logs');
  console.log('✅ Dropped error_logs table');
}
