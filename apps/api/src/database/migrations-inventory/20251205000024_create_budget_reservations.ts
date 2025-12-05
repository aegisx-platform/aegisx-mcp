import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    CREATE TABLE inventory.budget_reservations (
      id BIGSERIAL PRIMARY KEY,
      allocation_id BIGINT REFERENCES inventory.budget_allocations(id) NOT NULL,
      pr_id BIGINT NOT NULL,
      reserved_amount DECIMAL(15,2) NOT NULL,
      quarter INTEGER NOT NULL,
      reservation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_date TIMESTAMP WITH TIME ZONE NOT NULL,
      is_released BOOLEAN DEFAULT false,
      released_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT budget_reservations_pr_key UNIQUE (pr_id),
      CONSTRAINT budget_reservations_quarter_check CHECK (quarter BETWEEN 1 AND 4)
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_budget_reservations_allocation ON inventory.budget_reservations(allocation_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_budget_reservations_pr ON inventory.budget_reservations(pr_id)`,
  );
  await knex.raw(
    `CREATE INDEX idx_budget_reservations_expires ON inventory.budget_reservations(expires_date)`,
  );
  await knex.raw(
    `CREATE INDEX idx_budget_reservations_released ON inventory.budget_reservations(is_released)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP TABLE IF EXISTS inventory.budget_reservations CASCADE`);
}
