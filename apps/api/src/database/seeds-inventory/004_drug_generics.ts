/**
 * Drug Generics Seed
 *
 * Seeds baseline drug generics data for the inventory system.
 * This is the initial/reference drug catalog used throughout the application.
 *
 * Data source: ./data/drug_generics.sql
 * Total records: 1104
 *
 * Uses INSERT ... ON CONFLICT (working_code) DO UPDATE for idempotent seeding.
 * Safe to run multiple times - existing records will be updated.
 */

import type { Knex } from 'knex';
import * as fs from 'fs';
import * as path from 'path';

export async function seed(knex: Knex): Promise<void> {
  console.log(
    '\n═══════════════════════════════════════════════════════════════',
  );
  console.log('  SEEDING DRUG GENERICS (inventory.drug_generics)');
  console.log(
    '═══════════════════════════════════════════════════════════════\n',
  );

  // Get count before seeding
  const beforeCount = await knex.raw(`
    SELECT COUNT(*) as total FROM inventory.drug_generics
  `);
  console.log(`Before: ${beforeCount.rows[0].total} records`);

  // Read SQL file - use path relative to project root
  const sqlFilePath = path.join(
    process.cwd(),
    'apps/api/src/database/seeds-inventory/data/drug_generics.sql',
  );

  if (!fs.existsSync(sqlFilePath)) {
    console.log(`SQL file not found: ${sqlFilePath}`);
    console.log('Skipping drug_generics seed');
    return;
  }

  console.log('Loading SQL from:', sqlFilePath);
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Execute the SQL
  console.log('Executing INSERT ... ON CONFLICT statement...');

  try {
    await knex.raw(sqlContent);
    console.log('SQL executed successfully');
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }

  // Get count after seeding
  const afterCount = await knex.raw(`
    SELECT COUNT(*) as total FROM inventory.drug_generics
  `);
  console.log(`After: ${afterCount.rows[0].total} records`);

  // Summary by ED category
  const edSummary = await knex.raw(`
    SELECT
      COALESCE(ed_category::text, 'Unclassified') as category,
      COUNT(*) as count
    FROM inventory.drug_generics
    GROUP BY ed_category
    ORDER BY category
  `);

  console.log('\nED Classification Summary:');
  for (const row of edSummary.rows) {
    console.log(`   - ${row.category}: ${row.count} records`);
  }

  console.log(
    '\n═══════════════════════════════════════════════════════════════',
  );
  console.log('  DRUG GENERICS SEEDING COMPLETE');
  console.log(
    '═══════════════════════════════════════════════════════════════\n',
  );
}
