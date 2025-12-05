import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.budgets (
      id SERIAL PRIMARY KEY,
      budget_type_id INTEGER REFERENCES inventory.budget_types(id) NOT NULL,
      budget_category_id INTEGER REFERENCES inventory.budget_categories(id) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT budgets_type_category_key UNIQUE (budget_type_id, budget_category_id)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_budgets_type ON inventory.budgets(budget_type_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_budgets_category ON inventory.budgets(budget_category_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.budgets CASCADE`);
}
