import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Hospital Pharmaceutical Products (HPP)
  await knex.raw(`
    CREATE TABLE inventory.hospital_pharmaceutical_products (
      id BIGSERIAL PRIMARY KEY,
      hpp_code VARCHAR(50) NOT NULL,
      hpp_type inventory.hpp_type NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      generic_id INTEGER REFERENCES inventory.drug_generics(id),
      drug_id INTEGER REFERENCES inventory.drugs(id),
      base_product_id BIGINT REFERENCES inventory.hospital_pharmaceutical_products(id),
      tmt_code VARCHAR(50),
      is_outsourced BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT hospital_pharmaceutical_products_hpp_code_key UNIQUE (hpp_code)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_hpp_code ON inventory.hospital_pharmaceutical_products(hpp_code)`,
  );
  await knex.raw(
    `CREATE INDEX idx_hpp_type ON inventory.hospital_pharmaceutical_products(hpp_type)`,
  );
  await knex.raw(
    `CREATE INDEX idx_hpp_generic ON inventory.hospital_pharmaceutical_products(generic_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_hpp_drug ON inventory.hospital_pharmaceutical_products(drug_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_hpp_active ON inventory.hospital_pharmaceutical_products(is_active)`,
  );

  // HPP Formulations
  await knex.raw(`
    CREATE TABLE inventory.hpp_formulations (
      id BIGSERIAL PRIMARY KEY,
      hpp_id BIGINT REFERENCES inventory.hospital_pharmaceutical_products(id) ON DELETE CASCADE NOT NULL,
      component_type VARCHAR(50) NOT NULL,
      component_name VARCHAR(255) NOT NULL,
      component_strength VARCHAR(100),
      component_ratio DECIMAL(10,4),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_formulation_hpp ON inventory.hpp_formulations(hpp_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_formulation_type ON inventory.hpp_formulations(component_type)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.hpp_formulations CASCADE`);
  await knex.raw(
    `DROP TABLE IF EXISTS inventory.hospital_pharmaceutical_products CASCADE`,
  );
}
