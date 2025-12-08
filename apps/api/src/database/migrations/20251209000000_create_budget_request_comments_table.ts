import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Create budget_request_comments table for discussion threads
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS inventory.budget_request_comments (
      id BIGSERIAL PRIMARY KEY,
      budget_request_id BIGINT NOT NULL REFERENCES inventory.budget_requests(id) ON DELETE CASCADE,
      parent_id BIGINT REFERENCES inventory.budget_request_comments(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      created_by UUID NOT NULL REFERENCES public.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  // Create indexes for faster queries
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_comments_budget_request_id
    ON inventory.budget_request_comments(budget_request_id);
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_comments_parent_id
    ON inventory.budget_request_comments(parent_id);
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_comments_created_by
    ON inventory.budget_request_comments(created_by);
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_comments_created_at
    ON inventory.budget_request_comments(created_at DESC);
  `);

  // Add comment for documentation
  await knex.raw(`
    COMMENT ON TABLE inventory.budget_request_comments IS 'Comments and discussion threads for budget requests';
  `);

  await knex.raw(`
    COMMENT ON COLUMN inventory.budget_request_comments.parent_id IS 'For nested comments - references parent comment ID';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Drop budget_request_comments table
  await knex.raw(`
    DROP TABLE IF EXISTS inventory.budget_request_comments CASCADE
  `);
}
