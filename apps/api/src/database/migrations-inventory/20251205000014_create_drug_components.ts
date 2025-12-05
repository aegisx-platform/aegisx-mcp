import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.drug_components (
      id SERIAL PRIMARY KEY,
      generic_id INTEGER REFERENCES inventory.drug_generics(id) NOT NULL,
      component_name VARCHAR(200) NOT NULL,
      strength VARCHAR(50),
      strength_value DECIMAL(10,4),
      strength_unit VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drug_components_generic ON inventory.drug_components(generic_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_components_name ON inventory.drug_components(component_name)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.drug_components CASCADE`);
}
