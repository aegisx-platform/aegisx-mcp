import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.bank (
      id SERIAL PRIMARY KEY,
      bank_code VARCHAR(10) NOT NULL,
      bank_name VARCHAR(100) NOT NULL,
      swift_code VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT bank_bank_code_key UNIQUE (bank_code)
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.bank CASCADE`);
}
