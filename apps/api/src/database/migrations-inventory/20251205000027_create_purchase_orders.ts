import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Purchase Orders (header)
  await knex.raw(`
    CREATE TABLE inventory.purchase_orders (
      id BIGSERIAL PRIMARY KEY,
      po_number VARCHAR(50) NOT NULL,
      pr_id BIGINT REFERENCES inventory.purchase_requests(id) NOT NULL,
      vendor_id INTEGER REFERENCES inventory.companies(id) NOT NULL,
      contract_id BIGINT REFERENCES inventory.contracts(id),
      po_date DATE DEFAULT CURRENT_DATE,
      delivery_date DATE NOT NULL,
      total_amount DECIMAL(15,2) NOT NULL,
      vat_amount DECIMAL(15,2) DEFAULT 0,
      grand_total DECIMAL(15,2) NOT NULL,
      status inventory.po_status DEFAULT 'DRAFT',
      payment_terms inventory.payment_terms DEFAULT 'NET30',
      shipping_address TEXT,
      billing_address TEXT,
      notes TEXT,
      created_by UUID REFERENCES public.users(id) NOT NULL,
      approved_by UUID REFERENCES public.users(id),
      approved_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT purchase_orders_po_number_key UNIQUE (po_number),
      CONSTRAINT purchase_orders_date_check CHECK (delivery_date >= po_date),
      CONSTRAINT purchase_orders_total_check CHECK (grand_total = total_amount + vat_amount)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_purchase_orders_pr ON inventory.purchase_orders(pr_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_purchase_orders_vendor ON inventory.purchase_orders(vendor_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_purchase_orders_contract ON inventory.purchase_orders(contract_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_purchase_orders_status ON inventory.purchase_orders(status)`,
  );
  await knex.raw(
    `CREATE INDEX idx_purchase_orders_po_date ON inventory.purchase_orders(po_date)`,
  );

  // Purchase Order Items (detail)
  await knex.raw(`
    CREATE TABLE inventory.purchase_order_items (
      id BIGSERIAL PRIMARY KEY,
      po_id BIGINT REFERENCES inventory.purchase_orders(id) ON DELETE CASCADE NOT NULL,
      pr_item_id BIGINT REFERENCES inventory.purchase_request_items(id),
      generic_id INTEGER REFERENCES inventory.drug_generics(id) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit VARCHAR(20) NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      discount_percent DECIMAL(5,2) DEFAULT 0,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      total_price DECIMAL(15,2) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT po_items_quantity_check CHECK (quantity > 0),
      CONSTRAINT po_items_price_check CHECK (unit_price > 0),
      CONSTRAINT po_items_discount_check CHECK (discount_percent BETWEEN 0 AND 100),
      CONSTRAINT po_items_total_check CHECK (total_price = (quantity * unit_price) - discount_amount)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_po_items_po ON inventory.purchase_order_items(po_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_po_items_pr_item ON inventory.purchase_order_items(pr_item_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_po_items_generic ON inventory.purchase_order_items(generic_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.purchase_order_items CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.purchase_orders CASCADE`);
}
