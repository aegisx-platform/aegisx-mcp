import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add is_template_starter column to pdf_templates table
  await knex.schema.alterTable('pdf_templates', (table) => {
    table.boolean('is_template_starter').defaultTo(false).notNullable();
  });

  // Create index for faster queries on template starters
  await knex.schema.alterTable('pdf_templates', (table) => {
    table.index(['is_template_starter'], 'idx_pdf_templates_template_starter');
  });

  console.log('✅ Added is_template_starter field to pdf_templates table');
}

export async function down(knex: Knex): Promise<void> {
  // Drop index first
  await knex.schema.alterTable('pdf_templates', (table) => {
    table.dropIndex(
      ['is_template_starter'],
      'idx_pdf_templates_template_starter',
    );
  });

  // Drop column
  await knex.schema.alterTable('pdf_templates', (table) => {
    table.dropColumn('is_template_starter');
  });

  console.log('✅ Removed is_template_starter field from pdf_templates table');
}
