import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.adjustment_reasons (
      id SERIAL PRIMARY KEY,
      reason_code VARCHAR(10) NOT NULL,
      reason_name VARCHAR(100) NOT NULL,
      adjustment_type inventory.adjustment_type,
      requires_approval BOOLEAN DEFAULT false,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT adjustment_reasons_reason_code_key UNIQUE (reason_code)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_adjustment_reasons_type ON inventory.adjustment_reasons(adjustment_type)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.adjustment_reasons CASCADE`);
}
