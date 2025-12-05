import { Knex } from 'knex';

/**
 * Seed Metadata Table
 *
 * Tracks which seeds have been applied and their versions.
 * Enables safe upgrades across multiple customer sites.
 *
 * Usage:
 * - On first install: all seeds run and are recorded
 * - On upgrade: only new/updated seeds run based on version comparison
 * - Customer-modified data is protected (can_update = false)
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.seed_metadata (
      id SERIAL PRIMARY KEY,
      seed_name VARCHAR(100) NOT NULL,
      seed_category VARCHAR(50) NOT NULL,
      seed_version VARCHAR(20) NOT NULL,
      description TEXT,
      records_affected INTEGER DEFAULT 0,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      applied_by VARCHAR(100) DEFAULT 'system',
      checksum VARCHAR(64),
      is_reversible BOOLEAN DEFAULT false,
      CONSTRAINT seed_metadata_name_key UNIQUE (seed_name)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_seed_metadata_category ON inventory.seed_metadata(seed_category)`,
  );
  await knex.raw(
    `CREATE INDEX idx_seed_metadata_version ON inventory.seed_metadata(seed_version)`,
  );

  // System info table for tracking installation
  await knex.raw(`
    CREATE TABLE inventory.system_info (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) NOT NULL,
      value TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT system_info_key_key UNIQUE (key)
    )
  `);

  // Insert initial system info
  await knex.raw(`
    INSERT INTO inventory.system_info (key, value) VALUES
    ('schema_version', '1.0.0'),
    ('installed_at', NOW()::TEXT),
    ('last_upgraded_at', NOW()::TEXT)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.system_info CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.seed_metadata CASCADE`);
}
