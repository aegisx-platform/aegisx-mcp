import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Return Reasons
  await knex.raw(`
    CREATE TABLE inventory.return_reasons (
      id SERIAL PRIMARY KEY,
      reason_code VARCHAR(10) NOT NULL,
      reason_name VARCHAR(100) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT return_reasons_reason_code_key UNIQUE (reason_code)
    )
  `);

  // Drug Returns (header)
  await knex.raw(`
    CREATE TABLE inventory.drug_returns (
      id BIGSERIAL PRIMARY KEY,
      return_number VARCHAR(50) NOT NULL,
      department_id INTEGER REFERENCES inventory.departments(id) NOT NULL,
      return_date DATE NOT NULL,
      return_reason_id INTEGER REFERENCES inventory.return_reasons(id),
      return_reason TEXT,
      action_taken TEXT,
      status inventory.return_status DEFAULT 'DRAFT',
      total_items INTEGER DEFAULT 0,
      total_amount DECIMAL(15,2) DEFAULT 0,
      received_by VARCHAR(100),
      verified_by VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT drug_returns_return_number_key UNIQUE (return_number)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drug_returns_number ON inventory.drug_returns(return_number)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_returns_date ON inventory.drug_returns(return_date)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_returns_dept ON inventory.drug_returns(department_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_returns_status ON inventory.drug_returns(status)`,
  );

  // Drug Return Items (detail)
  await knex.raw(`
    CREATE TABLE inventory.drug_return_items (
      id BIGSERIAL PRIMARY KEY,
      return_id BIGINT REFERENCES inventory.drug_returns(id) ON DELETE CASCADE NOT NULL,
      drug_id INTEGER REFERENCES inventory.drugs(id) NOT NULL,
      total_quantity DECIMAL(15,3) NOT NULL,
      good_quantity DECIMAL(15,3) NOT NULL DEFAULT 0,
      damaged_quantity DECIMAL(15,3) NOT NULL DEFAULT 0,
      lot_number VARCHAR(50) NOT NULL,
      expiry_date DATE NOT NULL,
      return_type inventory.return_type NOT NULL,
      location_id INTEGER REFERENCES inventory.locations(id) NOT NULL,
      action_id INTEGER REFERENCES inventory.return_actions(id),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT drug_return_items_quantity_check CHECK (total_quantity = good_quantity + damaged_quantity),
      CONSTRAINT drug_return_items_positive_check CHECK (total_quantity > 0)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drug_return_items_return ON inventory.drug_return_items(return_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_return_items_drug ON inventory.drug_return_items(drug_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_return_items_lot ON inventory.drug_return_items(lot_number)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_return_items_type ON inventory.drug_return_items(return_type)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_return_items_location ON inventory.drug_return_items(location_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.drug_return_items CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.drug_returns CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.return_reasons CASCADE`);
}
