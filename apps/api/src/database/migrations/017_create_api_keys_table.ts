import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('api_keys', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // User reference
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .comment('Owner of the API key');

    // API Key identification
    table
      .string('name', 100)
      .notNullable()
      .comment('Human-readable name for the API key');
    table
      .string('key_hash', 255)
      .notNullable()
      .comment('bcrypt hash of the full API key');
    table
      .string('key_prefix', 11)
      .notNullable()
      .comment('API key prefix (ak_xxxxxxxx) for fast lookup');

    // Permissions and scopes
    table
      .jsonb('scopes')
      .nullable()
      .comment(
        'Array of permission scopes {resource: string, actions: string[]}',
      );

    // Usage tracking
    table
      .timestamp('last_used_at')
      .nullable()
      .comment('Last time this API key was used');
    table
      .string('last_used_ip', 45)
      .nullable()
      .comment('Last IP address that used this key (IPv4/IPv6)');

    // Expiration and status
    table
      .timestamp('expires_at')
      .nullable()
      .comment('When this API key expires (null = never expires)');
    table
      .boolean('is_active')
      .notNullable()
      .defaultTo(true)
      .comment('Whether this API key is active');

    // Audit timestamps
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When this API key was created');
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When this API key was last updated');

    // Primary indexes for performance
    table.index(['user_id'], 'idx_api_keys_user');
    table.index(['key_prefix'], 'idx_api_keys_prefix');
    table.index(['is_active'], 'idx_api_keys_active');
    table.index(['expires_at'], 'idx_api_keys_expiry');

    // Composite indexes for common queries
    table.index(['user_id', 'is_active'], 'idx_api_keys_user_active');
    table.index(['key_prefix', 'is_active'], 'idx_api_keys_prefix_active');
    table.index(['expires_at', 'is_active'], 'idx_api_keys_expiry_active');

    // Index for usage tracking queries
    table.index(['last_used_at'], 'idx_api_keys_last_used');
  });

  // Add table comment
  await knex.raw(`
    COMMENT ON TABLE api_keys IS 'API keys for programmatic access with scope-based permissions and usage tracking'
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('api_keys');
}
