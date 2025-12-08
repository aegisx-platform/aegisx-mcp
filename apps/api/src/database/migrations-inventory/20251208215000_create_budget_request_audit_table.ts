import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Create budget_request_audit table for tracking all changes
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS inventory.budget_request_audit (
      id BIGSERIAL PRIMARY KEY,
      budget_request_id BIGINT REFERENCES inventory.budget_requests(id) ON DELETE CASCADE,
      action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'SUBMIT', 'APPROVE_DEPT', 'APPROVE_FINANCE', 'REJECT', 'REOPEN'
      entity_type VARCHAR(50), -- 'BUDGET_REQUEST', 'BUDGET_REQUEST_ITEM'
      entity_id BIGINT,
      field_name VARCHAR(100),
      old_value TEXT,
      new_value TEXT,
      user_id UUID REFERENCES public.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  // Create index for faster queries
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_audit_budget_request_id
    ON inventory.budget_request_audit(budget_request_id);
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_audit_user_id
    ON inventory.budget_request_audit(user_id);
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_audit_created_at
    ON inventory.budget_request_audit(created_at DESC);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Drop budget_request_audit table
  await knex.raw(`
    DROP TABLE IF EXISTS inventory.budget_request_audit CASCADE
  `);
}
