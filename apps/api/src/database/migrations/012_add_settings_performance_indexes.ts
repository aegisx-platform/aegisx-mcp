import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add performance indexes for Settings API
  // Note: Using regular CREATE INDEX without CONCURRENTLY to work within transactions

  // 1. Composite index for common filter combinations
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_settings_filter_combo 
    ON app_settings(namespace, access_level, is_hidden, category)
    WHERE is_hidden = false;
  `);

  // 2. Full-text search index for better search performance
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_settings_search_text 
    ON app_settings USING gin(
      to_tsvector('english', coalesce(key, '') || ' ' || 
                            coalesce(label, '') || ' ' || 
                            coalesce(description, ''))
    );
  `);

  // 3. Index for sorting performance
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_settings_sort 
    ON app_settings(sort_order, created_at);
  `);

  // 4. Covering index for user settings lookups (PostgreSQL 11+)
  const pgVersion = await knex.raw(
    "SELECT current_setting('server_version_num')::integer as version",
  );
  if (pgVersion.rows[0].version >= 110000) {
    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_user_settings_lookup 
      ON app_user_settings(user_id, setting_id) 
      INCLUDE (value);
    `);
  } else {
    // Fallback for older PostgreSQL versions
    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_user_settings_lookup 
      ON app_user_settings(user_id, setting_id);
    `);
  }

  // 5. Index for history queries with time range
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_settings_history_time_range 
    ON app_settings_history(setting_id, changed_at DESC);
  `);

  // 6. Index for history queries by user
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_settings_history_user 
    ON app_settings_history(changed_by, changed_at DESC);
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop indexes in reverse order
  await knex.raw('DROP INDEX IF EXISTS idx_settings_history_user');
  await knex.raw('DROP INDEX IF EXISTS idx_settings_history_time_range');
  await knex.raw('DROP INDEX IF EXISTS idx_user_settings_lookup');
  await knex.raw('DROP INDEX IF EXISTS idx_settings_sort');
  await knex.raw('DROP INDEX IF EXISTS idx_settings_search_text');
  await knex.raw('DROP INDEX IF EXISTS idx_settings_filter_combo');
}
