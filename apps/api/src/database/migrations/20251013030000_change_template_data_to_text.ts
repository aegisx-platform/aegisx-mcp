import type { Knex } from 'knex';

/**
 * Change template_data column type from json to text
 * to support both JSON objects and Handlebars template strings
 */
export async function up(knex: Knex): Promise<void> {
  // Change template_data from json to text in pdf_templates table
  await knex.raw(`
    ALTER TABLE pdf_templates
    ALTER COLUMN template_data TYPE text
    USING template_data::text;
  `);

  // Change template_data from json to text in pdf_template_versions table
  await knex.raw(`
    ALTER TABLE pdf_template_versions
    ALTER COLUMN template_data TYPE text
    USING template_data::text;
  `);
}

export async function down(knex: Knex): Promise<void> {
  // WARNING: This rollback will fail if template_data contains Handlebars templates
  // that are not valid JSON. Only use this if all template_data values are valid JSON.

  await knex.raw(`
    ALTER TABLE pdf_templates
    ALTER COLUMN template_data TYPE json
    USING template_data::json;
  `);

  await knex.raw(`
    ALTER TABLE pdf_template_versions
    ALTER COLUMN template_data TYPE json
    USING template_data::json;
  `);
}
