import { Knex } from 'knex';

/**
 * Add additional fields to tmt_concepts table
 *
 * Fields added:
 * - manufacturer: Manufacturer name (for TP/TPU levels)
 * - pack_size: Package size information
 * - unit_of_use: Unit of use (e.g., tablet, capsule)
 * - route_of_administration: Route (e.g., oral, IV)
 * - effective_date: Effective date
 * - release_date: Release date
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  console.log('📦 Adding additional fields to tmt_concepts...');

  // Add new columns
  await knex.raw(`
    ALTER TABLE inventory.tmt_concepts
    ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255),
    ADD COLUMN IF NOT EXISTS pack_size VARCHAR(100),
    ADD COLUMN IF NOT EXISTS unit_of_use VARCHAR(100),
    ADD COLUMN IF NOT EXISTS route_of_administration VARCHAR(100),
    ADD COLUMN IF NOT EXISTS effective_date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS release_date VARCHAR(20)
  `);

  // Create index on manufacturer for TP/TPU searches
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_tmt_concepts_manufacturer
    ON inventory.tmt_concepts(manufacturer)
    WHERE manufacturer IS NOT NULL
  `);

  console.log('✅ Additional fields added to tmt_concepts successfully!');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  console.log('🗑️  Removing additional fields from tmt_concepts...');

  // Drop index first
  await knex.raw(`
    DROP INDEX IF EXISTS inventory.idx_tmt_concepts_manufacturer
  `);

  // Remove columns
  await knex.raw(`
    ALTER TABLE inventory.tmt_concepts
    DROP COLUMN IF EXISTS manufacturer,
    DROP COLUMN IF EXISTS pack_size,
    DROP COLUMN IF EXISTS unit_of_use,
    DROP COLUMN IF EXISTS route_of_administration,
    DROP COLUMN IF EXISTS effective_date,
    DROP COLUMN IF EXISTS release_date
  `);

  console.log('✅ Additional fields removed from tmt_concepts');
}
