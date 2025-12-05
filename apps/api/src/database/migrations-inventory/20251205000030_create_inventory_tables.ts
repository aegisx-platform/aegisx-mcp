import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Inventory (stock levels)
  await knex.raw(`
    CREATE TABLE inventory.inventory (
      id BIGSERIAL PRIMARY KEY,
      drug_id INTEGER REFERENCES inventory.drugs(id) NOT NULL,
      location_id INTEGER REFERENCES inventory.locations(id) NOT NULL,
      quantity_on_hand DECIMAL(15,3) NOT NULL DEFAULT 0,
      min_level DECIMAL(15,3),
      max_level DECIMAL(15,3),
      reorder_point DECIMAL(15,3),
      average_cost DECIMAL(15,4),
      last_cost DECIMAL(15,4),
      last_updated TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT inventory_drug_location_key UNIQUE (drug_id, location_id),
      CONSTRAINT inventory_quantity_check CHECK (quantity_on_hand >= 0)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_inventory_drug ON inventory.inventory(drug_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_inventory_location ON inventory.inventory(location_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_inventory_reorder ON inventory.inventory(reorder_point) WHERE quantity_on_hand <= reorder_point`,
  );

  // Drug Lots (FIFO/FEFO tracking)
  await knex.raw(`
    CREATE TABLE inventory.drug_lots (
      id BIGSERIAL PRIMARY KEY,
      drug_id INTEGER REFERENCES inventory.drugs(id) NOT NULL,
      location_id INTEGER REFERENCES inventory.locations(id) NOT NULL,
      lot_number VARCHAR(50) NOT NULL,
      expiry_date DATE NOT NULL,
      quantity_available DECIMAL(15,3) NOT NULL DEFAULT 0,
      unit_cost DECIMAL(15,4) NOT NULL,
      received_date DATE NOT NULL,
      receipt_id BIGINT REFERENCES inventory.receipts(id),
      is_active BOOLEAN DEFAULT true,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT drug_lots_drug_location_lot_key UNIQUE (drug_id, location_id, lot_number),
      CONSTRAINT drug_lots_quantity_check CHECK (quantity_available >= 0),
      CONSTRAINT drug_lots_expiry_check CHECK (expiry_date > received_date)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_drug_lots_drug ON inventory.drug_lots(drug_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_lots_location ON inventory.drug_lots(location_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_lots_expiry ON inventory.drug_lots(expiry_date) WHERE is_active = true`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_lots_fifo ON inventory.drug_lots(drug_id, location_id, received_date) WHERE quantity_available > 0`,
  );
  await knex.raw(
    `CREATE INDEX idx_drug_lots_fefo ON inventory.drug_lots(drug_id, location_id, expiry_date) WHERE quantity_available > 0`,
  );

  // Inventory Transactions (audit trail)
  await knex.raw(`
    CREATE TABLE inventory.inventory_transactions (
      id BIGSERIAL PRIMARY KEY,
      inventory_id BIGINT REFERENCES inventory.inventory(id) NOT NULL,
      transaction_type inventory.transaction_type NOT NULL,
      quantity DECIMAL(15,3) NOT NULL,
      unit_cost DECIMAL(15,4),
      reference_id BIGINT,
      reference_type VARCHAR(50),
      notes TEXT,
      created_by UUID REFERENCES public.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_inv_trans_inventory ON inventory.inventory_transactions(inventory_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_inv_trans_type ON inventory.inventory_transactions(transaction_type)`,
  );
  await knex.raw(
    `CREATE INDEX idx_inv_trans_reference ON inventory.inventory_transactions(reference_id, reference_type)`,
  );
  await knex.raw(
    `CREATE INDEX idx_inv_trans_created ON inventory.inventory_transactions(created_at DESC)`,
  );
  await knex.raw(
    `CREATE INDEX idx_inv_trans_user ON inventory.inventory_transactions(created_by)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    `DROP TABLE IF EXISTS inventory.inventory_transactions CASCADE`,
  );
  await knex.raw(`DROP TABLE IF EXISTS inventory.drug_lots CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.inventory CASCADE`);
}
