import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.drug_units (
      id SERIAL PRIMARY KEY,
      unit_code VARCHAR(10) NOT NULL,
      unit_name VARCHAR(50) NOT NULL,
      unit_name_en VARCHAR(50),
      unit_type inventory.unit_type,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT drug_units_unit_code_key UNIQUE (unit_code)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drug_units_type ON inventory.drug_units(unit_type)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.drug_units CASCADE`);
}
