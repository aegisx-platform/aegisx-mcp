import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Receipts (header)
  await knex.raw(`
    CREATE TABLE inventory.receipts (
      id BIGSERIAL PRIMARY KEY,
      receipt_number VARCHAR(50) NOT NULL,
      po_id BIGINT REFERENCES inventory.purchase_orders(id) NOT NULL,
      location_id INTEGER REFERENCES inventory.locations(id) NOT NULL,
      receipt_date DATE DEFAULT CURRENT_DATE,
      delivery_note_number VARCHAR(50),
      invoice_number VARCHAR(50),
      invoice_date DATE,
      status inventory.receipt_status DEFAULT 'DRAFT',
      total_amount DECIMAL(15,2),
      notes TEXT,
      received_by UUID REFERENCES public.users(id) NOT NULL,
      inspected_by UUID REFERENCES public.users(id),
      inspected_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT receipts_receipt_number_key UNIQUE (receipt_number)
    )
  `);

  await knex.raw(`CREATE INDEX idx_receipts_po ON inventory.receipts(po_id)`);
  await knex.raw(
    `CREATE INDEX idx_receipts_location ON inventory.receipts(location_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_receipts_status ON inventory.receipts(status)`,
  );
  await knex.raw(
    `CREATE INDEX idx_receipts_receipt_date ON inventory.receipts(receipt_date)`,
  );

  // Receipt Items (detail)
  await knex.raw(`
    CREATE TABLE inventory.receipt_items (
      id BIGSERIAL PRIMARY KEY,
      receipt_id BIGINT REFERENCES inventory.receipts(id) ON DELETE CASCADE NOT NULL,
      po_item_id BIGINT REFERENCES inventory.purchase_order_items(id) NOT NULL,
      generic_id INTEGER REFERENCES inventory.drug_generics(id) NOT NULL,
      quantity_ordered DECIMAL(10,2) NOT NULL,
      quantity_received DECIMAL(10,2) NOT NULL,
      quantity_accepted DECIMAL(10,2) NOT NULL,
      quantity_rejected DECIMAL(10,2) DEFAULT 0,
      rejection_reason TEXT,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(15,2) NOT NULL,
      lot_number VARCHAR(50) NOT NULL,
      manufacture_date DATE,
      expiry_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT receipt_items_quantity_check CHECK (quantity_received > 0),
      CONSTRAINT receipt_items_accepted_check CHECK (quantity_accepted + quantity_rejected = quantity_received),
      CONSTRAINT receipt_items_expiry_check CHECK (expiry_date > manufacture_date OR manufacture_date IS NULL),
      CONSTRAINT receipt_items_price_check CHECK (total_price = quantity_accepted * unit_price)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_receipt_items_receipt ON inventory.receipt_items(receipt_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_receipt_items_po_item ON inventory.receipt_items(po_item_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_receipt_items_generic ON inventory.receipt_items(generic_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_receipt_items_lot ON inventory.receipt_items(lot_number)`,
  );
  await knex.raw(
    `CREATE INDEX idx_receipt_items_expiry ON inventory.receipt_items(expiry_date)`,
  );

  // Receipt Inspectors
  await knex.raw(`
    CREATE TABLE inventory.receipt_inspectors (
      id BIGSERIAL PRIMARY KEY,
      receipt_id BIGINT REFERENCES inventory.receipts(id) ON DELETE CASCADE NOT NULL,
      inspector_id UUID REFERENCES public.users(id) NOT NULL,
      inspector_role inventory.inspector_role,
      inspected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_receipt_inspectors_receipt ON inventory.receipt_inspectors(receipt_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_receipt_inspectors_inspector ON inventory.receipt_inspectors(inspector_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.receipt_inspectors CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.receipt_items CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.receipts CASCADE`);
}
