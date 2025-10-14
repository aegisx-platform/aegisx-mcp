import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('pdf_templates', (table) => {
    table
      .jsonb('asset_file_ids')
      .notNullable()
      .defaultTo(knex.raw("'[]'::jsonb"))
      .comment('Array of uploaded asset file IDs used within the template');
  });

  await knex.schema.raw(
    "UPDATE pdf_templates SET asset_file_ids = '[]'::jsonb WHERE asset_file_ids IS NULL",
  );

  await knex.schema.alterTable('pdf_template_versions', (table) => {
    table
      .jsonb('asset_file_ids')
      .nullable()
      .comment('Snapshot of asset file IDs as of this version');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('pdf_template_versions', (table) => {
    table.dropColumn('asset_file_ids');
  });

  await knex.schema.alterTable('pdf_templates', (table) => {
    table.dropColumn('asset_file_ids');
  });
}
