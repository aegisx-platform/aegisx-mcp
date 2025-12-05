import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.return_actions (
      id SERIAL PRIMARY KEY,
      action_code VARCHAR(10) NOT NULL,
      action_name VARCHAR(100) NOT NULL,
      action_type inventory.return_action_type,
      requires_vendor_approval BOOLEAN DEFAULT false,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT return_actions_action_code_key UNIQUE (action_code)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_return_actions_type ON inventory.return_actions(action_type)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.return_actions CASCADE`);
}
