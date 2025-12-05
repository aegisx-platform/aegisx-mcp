import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Contracts
  await knex.raw(`
    CREATE TABLE inventory.contracts (
      id BIGSERIAL PRIMARY KEY,
      contract_number VARCHAR(50) NOT NULL,
      contract_type inventory.contract_type NOT NULL,
      vendor_id INTEGER REFERENCES inventory.companies(id) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_value DECIMAL(15,2) NOT NULL,
      remaining_value DECIMAL(15,2) NOT NULL,
      fiscal_year VARCHAR(4) NOT NULL,
      status inventory.contract_status DEFAULT 'DRAFT',
      egp_number VARCHAR(50),
      project_number VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT contracts_contract_number_key UNIQUE (contract_number),
      CONSTRAINT contracts_date_check CHECK (end_date >= start_date),
      CONSTRAINT contracts_value_check CHECK (remaining_value <= total_value)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_contracts_vendor ON inventory.contracts(vendor_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_contracts_status ON inventory.contracts(status)`,
  );
  await knex.raw(
    `CREATE INDEX idx_contracts_fiscal_year ON inventory.contracts(fiscal_year)`,
  );
  await knex.raw(
    `CREATE INDEX idx_contracts_dates ON inventory.contracts(start_date, end_date)`,
  );

  // Contract Items
  await knex.raw(`
    CREATE TABLE inventory.contract_items (
      id BIGSERIAL PRIMARY KEY,
      contract_id BIGINT REFERENCES inventory.contracts(id) ON DELETE CASCADE NOT NULL,
      generic_id INTEGER REFERENCES inventory.drug_generics(id) NOT NULL,
      agreed_unit_price DECIMAL(10,2) NOT NULL,
      quantity_limit DECIMAL(10,2),
      quantity_used DECIMAL(10,2) DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT contract_items_contract_generic_key UNIQUE (contract_id, generic_id),
      CONSTRAINT contract_items_price_check CHECK (agreed_unit_price > 0),
      CONSTRAINT contract_items_quantity_check CHECK (quantity_used <= quantity_limit OR quantity_limit IS NULL)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_contract_items_contract ON inventory.contract_items(contract_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_contract_items_generic ON inventory.contract_items(generic_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.contract_items CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.contracts CASCADE`);
}
