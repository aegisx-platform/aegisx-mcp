import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.purchase_types (
      id SERIAL PRIMARY KEY,
      type_code VARCHAR(10) NOT NULL,
      type_name VARCHAR(100) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT purchase_types_type_code_key UNIQUE (type_code)
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.purchase_types CASCADE`);
}
