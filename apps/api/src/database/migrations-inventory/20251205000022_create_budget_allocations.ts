import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.budget_allocations (
      id BIGSERIAL PRIMARY KEY,
      fiscal_year INTEGER NOT NULL,
      budget_id INTEGER REFERENCES inventory.budgets(id) NOT NULL,
      department_id INTEGER REFERENCES inventory.departments(id) NOT NULL,
      total_budget DECIMAL(15,2) NOT NULL,
      q1_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
      q2_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
      q3_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
      q4_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
      q1_spent DECIMAL(15,2) NOT NULL DEFAULT 0,
      q2_spent DECIMAL(15,2) NOT NULL DEFAULT 0,
      q3_spent DECIMAL(15,2) NOT NULL DEFAULT 0,
      q4_spent DECIMAL(15,2) NOT NULL DEFAULT 0,
      total_spent DECIMAL(15,2) NOT NULL DEFAULT 0,
      remaining_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT budget_allocations_year_budget_dept_key UNIQUE (fiscal_year, budget_id, department_id),
      CONSTRAINT budget_allocations_quarterly_check CHECK (q1_budget + q2_budget + q3_budget + q4_budget = total_budget),
      CONSTRAINT budget_allocations_remaining_check CHECK (remaining_budget = total_budget - total_spent)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_budget_allocations_year ON inventory.budget_allocations(fiscal_year)`,
  );
  await knex.raw(
    `CREATE INDEX idx_budget_allocations_budget ON inventory.budget_allocations(budget_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_budget_allocations_dept ON inventory.budget_allocations(department_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.budget_allocations CASCADE`);
}
