import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.drug_generics (
      id SERIAL PRIMARY KEY,
      working_code VARCHAR(7) NOT NULL,
      generic_name VARCHAR(200) NOT NULL,
      dosage_form VARCHAR(50),
      strength_unit VARCHAR(20),
      dosage_form_id INTEGER REFERENCES inventory.dosage_forms(id),
      strength_unit_id INTEGER REFERENCES inventory.drug_units(id),
      strength_value DECIMAL(10,2),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT drug_generics_working_code_key UNIQUE (working_code),
      CONSTRAINT drug_generics_working_code_length CHECK (char_length(working_code) = 7)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drug_generics_dosage_form ON inventory.drug_generics(dosage_form_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_generics_strength_unit ON inventory.drug_generics(strength_unit_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_generics_active ON inventory.drug_generics(is_active)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_generics_name ON inventory.drug_generics(generic_name)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.drug_generics CASCADE`);
}
