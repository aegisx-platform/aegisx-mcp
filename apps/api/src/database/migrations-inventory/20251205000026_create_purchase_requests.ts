import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Purchase Requests (header)
  await knex.raw(`
    CREATE TABLE inventory.purchase_requests (
      id BIGSERIAL PRIMARY KEY,
      pr_number VARCHAR(50) NOT NULL,
      department_id INTEGER REFERENCES inventory.departments(id) NOT NULL,
      budget_id INTEGER REFERENCES inventory.budgets(id) NOT NULL,
      fiscal_year INTEGER NOT NULL,
      request_date DATE DEFAULT CURRENT_DATE,
      required_date DATE NOT NULL,
      requested_by UUID REFERENCES public.users(id) NOT NULL,
      total_amount DECIMAL(15,2) NOT NULL,
      status inventory.pr_status DEFAULT 'DRAFT',
      priority inventory.pr_priority DEFAULT 'NORMAL',
      purpose TEXT,
      approved_by UUID REFERENCES public.users(id),
      approved_at TIMESTAMP WITH TIME ZONE,
      rejected_by UUID REFERENCES public.users(id),
      rejected_at TIMESTAMP WITH TIME ZONE,
      rejection_reason TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT purchase_requests_pr_number_key UNIQUE (pr_number),
      CONSTRAINT purchase_requests_date_check CHECK (required_date >= request_date)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_purchase_requests_dept ON inventory.purchase_requests(department_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_purchase_requests_budget ON inventory.purchase_requests(budget_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_purchase_requests_fiscal_year ON inventory.purchase_requests(fiscal_year)`,
  );
  await knex.raw(
    `CREATE INDEX idx_purchase_requests_status ON inventory.purchase_requests(status)`,
  );
  await knex.raw(
    `CREATE INDEX idx_purchase_requests_priority ON inventory.purchase_requests(priority)`,
  );
  await knex.raw(
    `CREATE INDEX idx_purchase_requests_requested_by ON inventory.purchase_requests(requested_by)`,
  );

  // Purchase Request Items (detail)
  await knex.raw(`
    CREATE TABLE inventory.purchase_request_items (
      id BIGSERIAL PRIMARY KEY,
      pr_id BIGINT REFERENCES inventory.purchase_requests(id) ON DELETE CASCADE NOT NULL,
      generic_id INTEGER REFERENCES inventory.drug_generics(id) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      unit VARCHAR(20) NOT NULL,
      estimated_unit_price DECIMAL(10,2) NOT NULL,
      estimated_total DECIMAL(15,2) NOT NULL,
      specification TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT pr_items_quantity_check CHECK (quantity > 0),
      CONSTRAINT pr_items_price_check CHECK (estimated_unit_price > 0),
      CONSTRAINT pr_items_total_check CHECK (estimated_total = quantity * estimated_unit_price)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_pr_items_pr ON inventory.purchase_request_items(pr_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_pr_items_generic ON inventory.purchase_request_items(generic_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    `DROP TABLE IF EXISTS inventory.purchase_request_items CASCADE`,
  );
  await knex.raw(`DROP TABLE IF EXISTS inventory.purchase_requests CASCADE`);
}
