import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.budget_types (
      id SERIAL PRIMARY KEY,
      type_code VARCHAR(10) NOT NULL,
      type_name VARCHAR(100) NOT NULL,
      budget_class inventory.budget_class NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT budget_types_type_code_key UNIQUE (type_code)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_budget_types_class ON inventory.budget_types(budget_class)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.budget_types CASCADE`);
}
