/**
 * Migration: Import TMT Relationships from Excel Files
 *
 * This migration imports TMT relationship data from the official TMT release files.
 * It processes the following relationships:
 * - VTM → GP (Virtual Therapeutic Moiety → Generic Product)
 * - GP → GPU (Generic Product → Generic Product Unit)
 * - GPU → TPU (Generic Product Unit → Trade Product Unit)
 * - TP → TPU (Trade Product → Trade Product Unit)
 * - GP → TP (Generic Product → Trade Product)
 *
 * Data source: docs/features/inventory-app/TMT/TMTRF20251201/TMTRF20251201_BONUS/Relationship/
 *
 * @requires Python 3 with pandas, openpyxl, xlrd installed
 */

import type { Knex } from 'knex';
import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

export async function up(knex: Knex): Promise<void> {
  console.log('🔄 Importing TMT relationships from Excel files...');

  // Path to the import script, relative to the project root where the command is run
  const scriptPath = join(
    process.cwd(),
    'scripts',
    'import-tmt-relationships.py',
  );

  if (!existsSync(scriptPath)) {
    throw new Error(`Import script not found: ${scriptPath}`);
  }

  try {
    // Run the Python import script
    const output = execSync(`python3 ${scriptPath}`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      env: {
        ...process.env,
        // Pass database configuration to script if needed
        DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
        DATABASE_PORT: process.env.DATABASE_PORT || '5482',
        DATABASE_NAME: process.env.DATABASE_NAME || 'aegisx_db',
        DATABASE_USER: process.env.DATABASE_USER || 'postgres',
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'postgres',
      },
    });

    console.log(output);
    console.log('✅ TMT relationships imported successfully');
  } catch (error: any) {
    console.error('❌ Error importing TMT relationships:');
    console.error(error.stdout || error.message);
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Removing imported TMT relationships...');

  // Delete all relationships (but keep the table structure)
  await knex('inventory.tmt_relationships').del();

  console.log('✅ TMT relationships removed');
}
