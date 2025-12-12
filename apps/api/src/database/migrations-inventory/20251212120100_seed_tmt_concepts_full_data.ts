import type { Knex } from 'knex';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

/**
 * TMT Concepts Full Data Seed Migration
 *
 * Seeds complete TMT concepts data with all fields:
 * - 76,904 TMT concepts records
 * - Includes: manufacturer, pack_size, unit_of_use, route_of_administration, etc.
 *
 * Source: invs-modern database full_dump.sql.gz
 */
export async function up(knex: Knex): Promise<void> {
  console.log('📦 Loading TMT concepts full data from SQL file...');

  const sqlGzPath = path.join(
    process.cwd(),
    'apps/api/src/database/migrations-inventory/data/tmt_concepts_full_insert.sql.gz',
  );

  // Check if file exists
  if (!fs.existsSync(sqlGzPath)) {
    console.log('⚠️  TMT concepts data file not found, skipping...');
    console.log(`   Expected path: ${sqlGzPath}`);
    return;
  }

  // Read and decompress the SQL file
  const compressedData = fs.readFileSync(sqlGzPath);
  const sqlContent = zlib.gunzipSync(compressedData).toString('utf8');

  console.log('📋 Executing TMT concepts seed SQL...');
  console.log(
    `   File size: ${(compressedData.length / 1024 / 1024).toFixed(2)} MB compressed`,
  );
  console.log(
    `   SQL size: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB uncompressed`,
  );

  // Extract only INSERT statements from SQL
  const insertStatements = sqlContent
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.startsWith('INSERT INTO'));

  console.log(`   Total INSERT statements: ${insertStatements.length}`);

  // Clear existing data first (outside transaction for performance)
  console.log('🗑️  Clearing existing TMT concepts data...');
  await knex.raw('SET session_replication_role = replica');
  await knex.raw('TRUNCATE inventory.tmt_concepts RESTART IDENTITY CASCADE');

  // Execute INSERT statements in batches
  const batchSize = 500;
  let processed = 0;

  for (let i = 0; i < insertStatements.length; i += batchSize) {
    const batch = insertStatements.slice(i, i + batchSize);
    const batchSql = batch.join(';\n') + ';';

    await knex.raw(batchSql);

    processed += batch.length;
    if (processed % 10000 === 0) {
      console.log(
        `   Processed ${processed}/${insertStatements.length} statements...`,
      );
    }
  }

  // Reset sequences
  await knex.raw(
    "SELECT setval('inventory.tmt_concepts_id_seq', COALESCE((SELECT MAX(id) FROM inventory.tmt_concepts), 1))",
  );

  // Re-enable triggers
  await knex.raw('SET session_replication_role = DEFAULT');

  // Verify count
  const result = await knex('inventory.tmt_concepts')
    .count('* as count')
    .first();

  console.log('✅ TMT concepts full data loaded successfully!');
  console.log(`   Total records: ${result?.count}`);

  // Show sample statistics
  const withManufacturer = await knex('inventory.tmt_concepts')
    .count('* as count')
    .whereNotNull('manufacturer')
    .first();

  console.log(`   With manufacturer: ${withManufacturer?.count}`);
}

export async function down(knex: Knex): Promise<void> {
  console.log('🗑️  Clearing TMT concepts full data...');
  await knex.raw('TRUNCATE inventory.tmt_concepts RESTART IDENTITY CASCADE');
  console.log('✅ TMT concepts data cleared');
}
