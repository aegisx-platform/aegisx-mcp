import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Budget Plans (header)
  await knex.raw(`
    CREATE TABLE inventory.budget_plans (
      id BIGSERIAL PRIMARY KEY,
      fiscal_year INTEGER NOT NULL,
      department_id INTEGER REFERENCES inventory.departments(id) NOT NULL,
      plan_name VARCHAR(200),
      total_planned_amount DECIMAL(15,2) DEFAULT 0,
      status inventory.budget_plan_status NOT NULL DEFAULT 'DRAFT',
      approved_at TIMESTAMP WITH TIME ZONE,
      approved_by UUID REFERENCES public.users(id),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT budget_plans_year_dept_key UNIQUE (fiscal_year, department_id)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_budget_plans_year ON inventory.budget_plans(fiscal_year)`,
  );
  await knex.raw(
    `CREATE INDEX idx_budget_plans_dept ON inventory.budget_plans(department_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_budget_plans_status ON inventory.budget_plans(status)`,
  );

  // Budget Plan Items (detail)
  await knex.raw(`
    CREATE TABLE inventory.budget_plan_items (
      id BIGSERIAL PRIMARY KEY,
      budget_plan_id BIGINT REFERENCES inventory.budget_plans(id) ON DELETE CASCADE NOT NULL,
      generic_id INTEGER REFERENCES inventory.drug_generics(id) NOT NULL,
      last_year_qty DECIMAL(10,2) DEFAULT 0,
      two_years_ago_qty DECIMAL(10,2) DEFAULT 0,
      three_years_ago_qty DECIMAL(10,2) DEFAULT 0,
      planned_quantity DECIMAL(10,2) NOT NULL,
      estimated_unit_price DECIMAL(10,2) NOT NULL,
      total_planned_value DECIMAL(15,2) NOT NULL,
      q1_planned_qty DECIMAL(10,2) DEFAULT 0,
      q2_planned_qty DECIMAL(10,2) DEFAULT 0,
      q3_planned_qty DECIMAL(10,2) DEFAULT 0,
      q4_planned_qty DECIMAL(10,2) DEFAULT 0,
      q1_purchased_qty DECIMAL(10,2) DEFAULT 0,
      q2_purchased_qty DECIMAL(10,2) DEFAULT 0,
      q3_purchased_qty DECIMAL(10,2) DEFAULT 0,
      q4_purchased_qty DECIMAL(10,2) DEFAULT 0,
      total_purchased_qty DECIMAL(10,2) DEFAULT 0,
      total_purchased_value DECIMAL(15,2) DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT budget_plan_items_plan_generic_key UNIQUE (budget_plan_id, generic_id),
      CONSTRAINT budget_plan_items_quarterly_check CHECK (q1_planned_qty + q2_planned_qty + q3_planned_qty + q4_planned_qty = planned_quantity),
      CONSTRAINT budget_plan_items_value_check CHECK (total_planned_value = planned_quantity * estimated_unit_price)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_budget_plan_items_plan ON inventory.budget_plan_items(budget_plan_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_budget_plan_items_generic ON inventory.budget_plan_items(generic_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.budget_plan_items CASCADE`);
  await knex.raw(`DROP TABLE IF EXISTS inventory.budget_plans CASCADE`);
}
