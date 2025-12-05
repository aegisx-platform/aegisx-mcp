import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.drug_pack_ratios (
      id SERIAL PRIMARY KEY,
      drug_id INTEGER REFERENCES inventory.drugs(id) NOT NULL,
      company_id INTEGER REFERENCES inventory.companies(id),
      pack_size INTEGER NOT NULL,
      pack_unit VARCHAR(20) NOT NULL,
      unit_per_pack DECIMAL(10,2) NOT NULL,
      pack_price DECIMAL(10,2),
      is_default BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drug_pack_ratios_drug ON inventory.drug_pack_ratios(drug_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_pack_ratios_company ON inventory.drug_pack_ratios(company_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.drug_pack_ratios CASCADE`);
}
