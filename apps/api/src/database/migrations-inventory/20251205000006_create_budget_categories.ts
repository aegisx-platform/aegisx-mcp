import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.budget_categories (
      id SERIAL PRIMARY KEY,
      category_code VARCHAR(10) NOT NULL,
      category_name VARCHAR(100) NOT NULL,
      accounting_code VARCHAR(20),
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT budget_categories_category_code_key UNIQUE (category_code)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_budget_categories_accounting ON inventory.budget_categories(accounting_code)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.budget_categories CASCADE`);
}
