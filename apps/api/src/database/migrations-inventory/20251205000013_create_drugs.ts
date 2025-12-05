import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.drugs (
      id SERIAL PRIMARY KEY,
      drug_code VARCHAR(24) NOT NULL,
      trade_name VARCHAR(200) NOT NULL,
      generic_id INTEGER REFERENCES inventory.drug_generics(id) NOT NULL,
      manufacturer_id INTEGER REFERENCES inventory.companies(id) NOT NULL,
      tmt_tpu_id INTEGER,
      nlem_status inventory.nlem_status NOT NULL,
      drug_status inventory.drug_status NOT NULL,
      product_category inventory.product_category NOT NULL,
      status_changed_date DATE,
      unit_price DECIMAL(10,2),
      package_size INTEGER,
      package_unit VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT drugs_drug_code_key UNIQUE (drug_code),
      CONSTRAINT drugs_drug_code_length CHECK (char_length(drug_code) = 24)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drugs_generic ON inventory.drugs(generic_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drugs_manufacturer ON inventory.drugs(manufacturer_id)`,
  );
  await knex.raw(`CREATE INDEX idx_drugs_tmt ON inventory.drugs(tmt_tpu_id)`);
  await knex.raw(`CREATE INDEX idx_drugs_nlem ON inventory.drugs(nlem_status)`);
  await knex.raw(
    `CREATE INDEX idx_drugs_status ON inventory.drugs(drug_status)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drugs_category ON inventory.drugs(product_category)`,
  );
  await knex.raw(`CREATE INDEX idx_drugs_active ON inventory.drugs(is_active)`);
  await knex.raw(
    `CREATE INDEX idx_drugs_trade_name ON inventory.drugs(trade_name)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.drugs CASCADE`);
}
