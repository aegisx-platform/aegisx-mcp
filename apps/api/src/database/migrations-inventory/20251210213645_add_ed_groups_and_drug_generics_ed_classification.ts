/**
 * Migration: Add ED Classification to drug_generics
 *
 * Adds fields for ED (Essential Drugs) classification:
 * - ed_category: EdCategory enum (ED, NED, NDMS, CM, LS, PS)
 * - ed_list: 1-6 (ED sub-category)
 * - ed_group_id: FK to ed_groups (therapeutic class)
 * - tmt_gpu_code: TMT GPU code (Phase 17)
 * - tmt_gpu_id: FK to tmt_concepts
 *
 * Also creates ed_groups table for therapeutic classification
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Create EdCategory enum type
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE inventory."EdCategory" AS ENUM ('ED', 'NED', 'NDMS', 'CM', 'LS', 'PS');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 2. Create ed_groups table
  const hasEdGroups = await knex.schema
    .withSchema('inventory')
    .hasTable('ed_groups');
  if (!hasEdGroups) {
    await knex.schema
      .withSchema('inventory')
      .createTable('ed_groups', (table) => {
        table.increments('id').primary();
        table.string('code', 8).notNullable().unique();
        table.string('name', 100).notNullable();
        table.integer('sub_commit_code').nullable();
        table.decimal('forecast', 10, 2).nullable();
        table.boolean('is_hidden').notNullable().defaultTo(false);
        table.boolean('is_active').notNullable().defaultTo(true);
        table.timestamps(true, true);
      });

    // Create trigger for updated_at
    await knex.raw(`
      CREATE TRIGGER trg_ed_groups_updated_at
      BEFORE UPDATE ON inventory.ed_groups
      FOR EACH ROW
      EXECUTE FUNCTION inventory.update_updated_at();
    `);
  }

  // 3. Add new columns to drug_generics
  await knex.schema
    .withSchema('inventory')
    .alterTable('drug_generics', (table) => {
      // ED Classification
      table
        .specificType('ed_category', 'inventory."EdCategory"')
        .nullable()
        .comment('ED, NED, NDMS, CM, LS, PS');
      table.integer('ed_list').nullable().comment('1-6 ED sub-category');
      table
        .integer('ed_group_id')
        .nullable()
        .references('id')
        .inTable('inventory.ed_groups')
        .onDelete('SET NULL');

      // TMT GPU mapping (Phase 17)
      table.string('tmt_gpu_code', 10).nullable().comment('TMT GPU code');
      table
        .bigInteger('tmt_gpu_id')
        .nullable()
        .comment('FK to tmt_concepts for GPU level');

      // TMT legacy fields (if not exist)
      table.string('tmt_vtm_code', 10).nullable();
      table.bigInteger('tmt_vtm_id').nullable();
      table.string('tmt_gp_code', 10).nullable();
      table.bigInteger('tmt_gp_id').nullable();
      table.string('tmt_gpf_code', 10).nullable();
      table.bigInteger('tmt_gpf_id').nullable();
      table.string('tmt_gpx_code', 10).nullable();
      table.bigInteger('tmt_gpx_id').nullable();
      table.string('tmt_code', 10).nullable();
      table.string('standard_unit', 10).nullable();
      table.string('therapeutic_group', 50).nullable();
      table.string('composition', 100).nullable();
      table.string('sale_unit', 10).nullable();
    });

  // 4. Add indexes
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_drug_generics_ed_category ON inventory.drug_generics(ed_category);
    CREATE INDEX IF NOT EXISTS idx_drug_generics_ed_group ON inventory.drug_generics(ed_group_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop indexes
  await knex.raw(`
    DROP INDEX IF EXISTS inventory.idx_drug_generics_ed_category;
    DROP INDEX IF EXISTS inventory.idx_drug_generics_ed_group;
  `);

  // Remove columns from drug_generics
  await knex.schema
    .withSchema('inventory')
    .alterTable('drug_generics', (table) => {
      table.dropColumn('ed_category');
      table.dropColumn('ed_list');
      table.dropColumn('ed_group_id');
      table.dropColumn('tmt_gpu_code');
      table.dropColumn('tmt_gpu_id');
      table.dropColumn('tmt_vtm_code');
      table.dropColumn('tmt_vtm_id');
      table.dropColumn('tmt_gp_code');
      table.dropColumn('tmt_gp_id');
      table.dropColumn('tmt_gpf_code');
      table.dropColumn('tmt_gpf_id');
      table.dropColumn('tmt_gpx_code');
      table.dropColumn('tmt_gpx_id');
      table.dropColumn('tmt_code');
      table.dropColumn('standard_unit');
      table.dropColumn('therapeutic_group');
      table.dropColumn('composition');
      table.dropColumn('sale_unit');
    });

  // Drop ed_groups table
  await knex.raw(
    'DROP TRIGGER IF EXISTS trg_ed_groups_updated_at ON inventory.ed_groups',
  );
  await knex.schema.withSchema('inventory').dropTableIfExists('ed_groups');

  // Drop enum type
  await knex.raw('DROP TYPE IF EXISTS inventory."EdCategory"');
}
