import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Distribution Types
  await knex.raw(`
    CREATE TABLE inventory.distribution_types (
      id SERIAL PRIMARY KEY,
      type_code VARCHAR(10) NOT NULL,
      type_name VARCHAR(100) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT distribution_types_type_code_key UNIQUE (type_code)
    )
  `);

  // Drug Distributions (header)
  await knex.raw(`
    CREATE TABLE inventory.drug_distributions (
      id BIGSERIAL PRIMARY KEY,
      distribution_number VARCHAR(50) NOT NULL,
      distribution_date DATE NOT NULL,
      distribution_type_id INTEGER REFERENCES inventory.distribution_types(id),
      from_location_id INTEGER REFERENCES inventory.locations(id) NOT NULL,
      to_location_id INTEGER REFERENCES inventory.locations(id),
      requesting_dept_id INTEGER REFERENCES inventory.departments(id) NOT NULL,
      requested_by VARCHAR(100),
      approved_by VARCHAR(100),
      dispensed_by VARCHAR(100),
      status inventory.distribution_status DEFAULT 'PENDING',
      total_items INTEGER DEFAULT 0,
      total_amount DECIMAL(15,2) DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT drug_distributions_distribution_number_key UNIQUE (distribution_number)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drug_distributions_number ON inventory.drug_distributions(distribution_number)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_distributions_date ON inventory.drug_distributions(distribution_date)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_distributions_from_location ON inventory.drug_distributions(from_location_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_distributions_to_location ON inventory.drug_distributions(to_location_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_distributions_dept ON inventory.drug_distributions(requesting_dept_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_distributions_status ON inventory.drug_distributions(status)`,
  );

  // Drug Distribution Items (detail)
  await knex.raw(`
    CREATE TABLE inventory.drug_distribution_items (
      id BIGSERIAL PRIMARY KEY,
      distribution_id BIGINT REFERENCES inventory.drug_distributions(id) ON DELETE CASCADE NOT NULL,
      item_number INTEGER NOT NULL,
      drug_id INTEGER REFERENCES inventory.drugs(id) NOT NULL,
      lot_number VARCHAR(50) NOT NULL,
      quantity_dispensed DECIMAL(15,3) NOT NULL,
      unit_cost DECIMAL(15,4) NOT NULL,
      expiry_date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT drug_distribution_items_dist_item_key UNIQUE (distribution_id, item_number),
      CONSTRAINT drug_distribution_items_quantity_check CHECK (quantity_dispensed > 0)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drug_distribution_items_dist ON inventory.drug_distribution_items(distribution_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_distribution_items_drug ON inventory.drug_distribution_items(drug_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_distribution_items_lot ON inventory.drug_distribution_items(lot_number)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_distribution_items_expiry ON inventory.drug_distribution_items(expiry_date)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    `DROP TABLE IF EXISTS inventory.drug_distribution_items CASCADE`,
  );
  await knex.raw(`DROP TABLE IF EXISTS inventory.drug_distributions CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.distribution_types CASCADE`);
}
