import { Knex } from 'knex';

/**
 * Enhancement for Budget Request Items
 *
 * Purpose: Add drug-level planning capabilities to budget_request_items
 * - Drug information (generic, package size, unit)
 * - Historical usage data (3 years)
 * - Planning data (estimated usage, current stock, purchase qty)
 * - Pricing and quantity details
 * - Quarterly breakdowns
 *
 * Related: BUDGET_PLANNING_SYSTEM_SPEC_V2.md Section 4.1
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // ==============================================
  // Step 1: Drop existing constraints that we need to modify
  // ==============================================
  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    DROP CONSTRAINT IF EXISTS budget_request_items_quarterly_check
  `);

  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    DROP CONSTRAINT IF EXISTS budget_request_items_amount_check
  `);

  // ==============================================
  // Step 2: Rename quarterly columns from _amount to _qty (if they exist)
  // ==============================================
  // Check if q1_amount exists before renaming
  const hasQ1Amount = await knex.raw(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'inventory'
    AND table_name = 'budget_request_items'
    AND column_name = 'q1_amount'
  `);

  if (hasQ1Amount.rows.length > 0) {
    await knex.raw(`
      ALTER TABLE inventory.budget_request_items
      RENAME COLUMN q1_amount TO q1_qty
    `);

    await knex.raw(`
      ALTER TABLE inventory.budget_request_items
      RENAME COLUMN q2_amount TO q2_qty
    `);

    await knex.raw(`
      ALTER TABLE inventory.budget_request_items
      RENAME COLUMN q3_amount TO q3_qty
    `);

    await knex.raw(`
      ALTER TABLE inventory.budget_request_items
      RENAME COLUMN q4_amount TO q4_qty
    `);
  }

  // ==============================================
  // Step 3: Add new columns for drug-level planning (if they don't exist)
  // ==============================================
  const hasDrugId = await knex.raw(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'inventory'
    AND table_name = 'budget_request_items'
    AND column_name = 'drug_id'
  `);

  if (hasDrugId.rows.length === 0) {
    await knex.raw(`
      ALTER TABLE inventory.budget_request_items

      -- Drug Information
      ADD COLUMN drug_id INTEGER REFERENCES inventory.drugs(id),
      ADD COLUMN generic_id INTEGER REFERENCES inventory.drug_generics(id),
      ADD COLUMN generic_code VARCHAR(50),
      ADD COLUMN generic_name VARCHAR(500),
      ADD COLUMN package_size VARCHAR(100),
      ADD COLUMN unit VARCHAR(50),
      ADD COLUMN line_number INTEGER,

      -- Historical Usage Data (3 years)
      ADD COLUMN usage_year_2566 DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN usage_year_2567 DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN usage_year_2568 DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN avg_usage DECIMAL(10,2) DEFAULT 0,

      -- Planning Data
      ADD COLUMN estimated_usage_2569 DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN current_stock DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN estimated_purchase DECIMAL(10,2) DEFAULT 0,

      -- Pricing and Quantities
      ADD COLUMN unit_price DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN requested_qty DECIMAL(10,2) DEFAULT 0,

      -- Budget Classification
      ADD COLUMN budget_type_id INTEGER REFERENCES inventory.budget_types(id),
      ADD COLUMN budget_category_id INTEGER REFERENCES inventory.budget_categories(id)
    `);
  }

  // ==============================================
  // Step 4: Make requested_amount nullable (calculated field)
  // ==============================================
  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    ALTER COLUMN requested_amount DROP NOT NULL
  `);

  // ==============================================
  // Step 5: Create indexes for performance (if they don't exist)
  // ==============================================
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_items_drug
    ON inventory.budget_request_items(drug_id)
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_items_generic
    ON inventory.budget_request_items(generic_id)
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_items_generic_code
    ON inventory.budget_request_items(generic_code)
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_budget_request_items_line_number
    ON inventory.budget_request_items(budget_request_id, line_number)
  `);

  // ==============================================
  // Step 6: Add comments for documentation (only for new columns)
  // ==============================================
  if (hasDrugId.rows.length === 0) {
    await knex.raw(`
      COMMENT ON COLUMN inventory.budget_request_items.drug_id IS 'Reference to specific drug (optional - may only have generic)';
      COMMENT ON COLUMN inventory.budget_request_items.generic_id IS 'Reference to drug generic (primary identifier)';
      COMMENT ON COLUMN inventory.budget_request_items.generic_code IS 'Generic code for quick lookup and Excel import';
      COMMENT ON COLUMN inventory.budget_request_items.generic_name IS 'Generic name (denormalized for Excel export)';
      COMMENT ON COLUMN inventory.budget_request_items.line_number IS 'Line number for Excel export ordering';
      COMMENT ON COLUMN inventory.budget_request_items.usage_year_2566 IS 'Historical usage in fiscal year 2566 (calculated from drug_distributions)';
      COMMENT ON COLUMN inventory.budget_request_items.usage_year_2567 IS 'Historical usage in fiscal year 2567 (calculated from drug_distributions)';
      COMMENT ON COLUMN inventory.budget_request_items.usage_year_2568 IS 'Historical usage in fiscal year 2568 (calculated from drug_distributions)';
      COMMENT ON COLUMN inventory.budget_request_items.avg_usage IS 'Average usage across 3 years (calculated)';
      COMMENT ON COLUMN inventory.budget_request_items.estimated_usage_2569 IS 'Estimated usage for planning year 2569';
      COMMENT ON COLUMN inventory.budget_request_items.current_stock IS 'Current stock level at planning time';
      COMMENT ON COLUMN inventory.budget_request_items.estimated_purchase IS 'Estimated purchase quantity (calculated: estimated_usage - current_stock)';
      COMMENT ON COLUMN inventory.budget_request_items.unit_price IS 'Unit price for budget calculation';
      COMMENT ON COLUMN inventory.budget_request_items.requested_qty IS 'Total requested quantity';
      COMMENT ON COLUMN inventory.budget_request_items.budget_type_id IS 'Budget type for this line item';
      COMMENT ON COLUMN inventory.budget_request_items.budget_category_id IS 'Budget category for this line item';
    `);
  }

  // Always add comments for quarterly columns (they were renamed)
  await knex.raw(`
    COMMENT ON COLUMN inventory.budget_request_items.requested_amount IS 'Total requested amount (calculated: requested_qty * unit_price)';
    COMMENT ON COLUMN inventory.budget_request_items.q1_qty IS 'Q1 quantity (must sum to requested_qty)';
    COMMENT ON COLUMN inventory.budget_request_items.q2_qty IS 'Q2 quantity (must sum to requested_qty)';
    COMMENT ON COLUMN inventory.budget_request_items.q3_qty IS 'Q3 quantity (must sum to requested_qty)';
    COMMENT ON COLUMN inventory.budget_request_items.q4_qty IS 'Q4 quantity (must sum to requested_qty)';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Drop indexes
  await knex.raw(
    `DROP INDEX IF EXISTS inventory.idx_budget_request_items_drug`,
  );
  await knex.raw(
    `DROP INDEX IF EXISTS inventory.idx_budget_request_items_generic`,
  );
  await knex.raw(
    `DROP INDEX IF EXISTS inventory.idx_budget_request_items_generic_code`,
  );
  await knex.raw(
    `DROP INDEX IF EXISTS inventory.idx_budget_request_items_line_number`,
  );

  // Remove added columns
  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    DROP COLUMN IF EXISTS drug_id,
    DROP COLUMN IF EXISTS generic_id,
    DROP COLUMN IF EXISTS generic_code,
    DROP COLUMN IF EXISTS generic_name,
    DROP COLUMN IF EXISTS package_size,
    DROP COLUMN IF EXISTS unit,
    DROP COLUMN IF EXISTS line_number,
    DROP COLUMN IF EXISTS usage_year_2566,
    DROP COLUMN IF EXISTS usage_year_2567,
    DROP COLUMN IF EXISTS usage_year_2568,
    DROP COLUMN IF EXISTS avg_usage,
    DROP COLUMN IF EXISTS estimated_usage_2569,
    DROP COLUMN IF EXISTS current_stock,
    DROP COLUMN IF EXISTS estimated_purchase,
    DROP COLUMN IF EXISTS unit_price,
    DROP COLUMN IF EXISTS requested_qty,
    DROP COLUMN IF EXISTS budget_type_id,
    DROP COLUMN IF EXISTS budget_category_id
  `);

  // Restore requested_amount as NOT NULL
  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    ALTER COLUMN requested_amount SET NOT NULL
  `);

  // Rename columns back
  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    RENAME COLUMN q1_qty TO q1_amount
  `);

  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    RENAME COLUMN q2_qty TO q2_amount
  `);

  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    RENAME COLUMN q3_qty TO q3_amount
  `);

  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    RENAME COLUMN q4_qty TO q4_amount
  `);

  // Re-add original constraints
  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    ADD CONSTRAINT budget_request_items_quarterly_check CHECK (
      q1_amount + q2_amount + q3_amount + q4_amount = requested_amount
    ),
    ADD CONSTRAINT budget_request_items_amount_check CHECK (
      requested_amount > 0
    )
  `);
}
