import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.dosage_forms (
      id SERIAL PRIMARY KEY,
      form_code VARCHAR(10) NOT NULL,
      form_name VARCHAR(100) NOT NULL,
      form_name_en VARCHAR(100),
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT dosage_forms_form_code_key UNIQUE (form_code)
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.dosage_forms CASCADE`);
}
