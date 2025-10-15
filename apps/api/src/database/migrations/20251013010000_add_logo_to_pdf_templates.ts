import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('pdf_templates', (table) => {
    // Add logo_file_id column with foreign key to uploaded_files
    table
      .uuid('logo_file_id')
      .nullable()
      .references('id')
      .inTable('uploaded_files')
      .onDelete('SET NULL')
      .comment('Reference to uploaded logo file');

    // Add logo_settings for width, height, position configuration
    table
      .jsonb('logo_settings')
      .nullable()
      .comment('Logo display settings (width, height, position, etc.)');
  });

  // Add index for logo_file_id for faster lookups
  await knex.schema.alterTable('pdf_templates', (table) => {
    table.index('logo_file_id', 'idx_pdf_templates_logo_file_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('pdf_templates', (table) => {
    table.dropIndex('logo_file_id', 'idx_pdf_templates_logo_file_id');
    table.dropColumn('logo_settings');
    table.dropColumn('logo_file_id');
  });
}
