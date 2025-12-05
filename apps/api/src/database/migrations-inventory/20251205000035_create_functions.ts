import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // Function: Check Budget Availability
  await knex.raw(`
    CREATE OR REPLACE FUNCTION inventory.check_budget_availability(
      p_budget_id INTEGER,
      p_amount DECIMAL(15,2)
    ) RETURNS TABLE (
      is_available BOOLEAN,
      remaining_budget DECIMAL(15,2),
      message TEXT
    ) AS $$
    DECLARE
      v_remaining DECIMAL(15,2);
    BEGIN
      SELECT ba.remaining_budget INTO v_remaining
      FROM inventory.budget_allocations ba
      WHERE ba.budget_id = p_budget_id
        AND ba.fiscal_year = EXTRACT(YEAR FROM CURRENT_DATE);

      IF v_remaining IS NULL THEN
        RETURN QUERY SELECT
          FALSE::BOOLEAN,
          0::DECIMAL(15,2),
          'Budget allocation not found for current fiscal year'::TEXT;
        RETURN;
      END IF;

      IF v_remaining >= p_amount THEN
        RETURN QUERY SELECT
          TRUE::BOOLEAN,
          v_remaining,
          'Budget available'::TEXT;
      ELSE
        RETURN QUERY SELECT
          FALSE::BOOLEAN,
          v_remaining,
          format('Insufficient budget. Required: %s, Available: %s', p_amount, v_remaining)::TEXT;
      END IF;
    END;
    $$ LANGUAGE plpgsql
  `);

  // Function: Reserve Budget
  await knex.raw(`
    CREATE OR REPLACE FUNCTION inventory.reserve_budget(
      p_budget_id INTEGER,
      p_amount DECIMAL(15,2),
      p_reference_type VARCHAR(50),
      p_reference_id BIGINT,
      p_description TEXT DEFAULT NULL
    ) RETURNS TABLE (
      success BOOLEAN,
      reservation_id BIGINT,
      message TEXT
    ) AS $$
    DECLARE
      v_allocation_id BIGINT;
      v_remaining DECIMAL(15,2);
      v_reservation_id BIGINT;
    BEGIN
      SELECT ba.id, ba.remaining_budget INTO v_allocation_id, v_remaining
      FROM inventory.budget_allocations ba
      WHERE ba.budget_id = p_budget_id
        AND ba.fiscal_year = EXTRACT(YEAR FROM CURRENT_DATE)
      FOR UPDATE;

      IF v_allocation_id IS NULL THEN
        RETURN QUERY SELECT
          FALSE::BOOLEAN,
          NULL::BIGINT,
          'Budget allocation not found'::TEXT;
        RETURN;
      END IF;

      IF v_remaining < p_amount THEN
        RETURN QUERY SELECT
          FALSE::BOOLEAN,
          NULL::BIGINT,
          format('Insufficient budget. Required: %s, Available: %s', p_amount, v_remaining)::TEXT;
        RETURN;
      END IF;

      INSERT INTO inventory.budget_reservations (
        allocation_id, reserved_amount, reference_type, reference_id,
        status, description, reserved_at
      ) VALUES (
        v_allocation_id, p_amount, p_reference_type, p_reference_id,
        'ACTIVE', p_description, NOW()
      ) RETURNING id INTO v_reservation_id;

      UPDATE inventory.budget_allocations
      SET remaining_budget = remaining_budget - p_amount,
          updated_at = NOW()
      WHERE id = v_allocation_id;

      RETURN QUERY SELECT
        TRUE::BOOLEAN,
        v_reservation_id,
        'Budget reserved successfully'::TEXT;
    END;
    $$ LANGUAGE plpgsql
  `);

  // Function: Commit Budget (convert reservation to actual spending)
  await knex.raw(`
    CREATE OR REPLACE FUNCTION inventory.commit_budget(
      p_reservation_id BIGINT
    ) RETURNS TABLE (
      success BOOLEAN,
      message TEXT
    ) AS $$
    DECLARE
      v_reservation RECORD;
    BEGIN
      SELECT * INTO v_reservation
      FROM inventory.budget_reservations
      WHERE id = p_reservation_id
      FOR UPDATE;

      IF v_reservation IS NULL THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, 'Reservation not found'::TEXT;
        RETURN;
      END IF;

      IF v_reservation.status != 'ACTIVE' THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, format('Invalid reservation status: %s', v_reservation.status)::TEXT;
        RETURN;
      END IF;

      UPDATE inventory.budget_reservations
      SET status = 'COMMITTED', committed_at = NOW()
      WHERE id = p_reservation_id;

      UPDATE inventory.budget_allocations
      SET total_spent = total_spent + v_reservation.reserved_amount,
          updated_at = NOW()
      WHERE id = v_reservation.allocation_id;

      RETURN QUERY SELECT TRUE::BOOLEAN, 'Budget committed successfully'::TEXT;
    END;
    $$ LANGUAGE plpgsql
  `);

  // Function: Release Budget Reservation
  await knex.raw(`
    CREATE OR REPLACE FUNCTION inventory.release_budget(
      p_reservation_id BIGINT
    ) RETURNS TABLE (
      success BOOLEAN,
      message TEXT
    ) AS $$
    DECLARE
      v_reservation RECORD;
    BEGIN
      SELECT * INTO v_reservation
      FROM inventory.budget_reservations
      WHERE id = p_reservation_id
      FOR UPDATE;

      IF v_reservation IS NULL THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, 'Reservation not found'::TEXT;
        RETURN;
      END IF;

      IF v_reservation.status != 'ACTIVE' THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, format('Cannot release %s reservation', v_reservation.status)::TEXT;
        RETURN;
      END IF;

      UPDATE inventory.budget_reservations
      SET status = 'RELEASED', released_at = NOW()
      WHERE id = p_reservation_id;

      UPDATE inventory.budget_allocations
      SET remaining_budget = remaining_budget + v_reservation.reserved_amount,
          updated_at = NOW()
      WHERE id = v_reservation.allocation_id;

      RETURN QUERY SELECT TRUE::BOOLEAN, 'Budget released successfully'::TEXT;
    END;
    $$ LANGUAGE plpgsql
  `);

  // Function: Get FIFO Lots (First In, First Out)
  await knex.raw(`
    CREATE OR REPLACE FUNCTION inventory.get_fifo_lots(
      p_drug_id INTEGER,
      p_location_id INTEGER,
      p_quantity_needed DECIMAL(15,3)
    ) RETURNS TABLE (
      lot_id BIGINT,
      lot_number VARCHAR(50),
      expiry_date DATE,
      quantity_available DECIMAL(15,3),
      quantity_to_use DECIMAL(15,3),
      unit_cost DECIMAL(15,4)
    ) AS $$
    DECLARE
      v_remaining DECIMAL(15,3);
      v_lot RECORD;
    BEGIN
      v_remaining := p_quantity_needed;

      FOR v_lot IN
        SELECT dl.id, dl.lot_number, dl.expiry_date, dl.quantity_available, dl.unit_cost
        FROM inventory.drug_lots dl
        WHERE dl.drug_id = p_drug_id
          AND dl.location_id = p_location_id
          AND dl.quantity_available > 0
          AND dl.is_active = true
        ORDER BY dl.received_date ASC, dl.id ASC
      LOOP
        IF v_remaining <= 0 THEN
          EXIT;
        END IF;

        RETURN QUERY SELECT
          v_lot.id,
          v_lot.lot_number,
          v_lot.expiry_date,
          v_lot.quantity_available,
          LEAST(v_lot.quantity_available, v_remaining),
          v_lot.unit_cost;

        v_remaining := v_remaining - v_lot.quantity_available;
      END LOOP;
    END;
    $$ LANGUAGE plpgsql
  `);

  // Function: Get FEFO Lots (First Expiry, First Out)
  await knex.raw(`
    CREATE OR REPLACE FUNCTION inventory.get_fefo_lots(
      p_drug_id INTEGER,
      p_location_id INTEGER,
      p_quantity_needed DECIMAL(15,3)
    ) RETURNS TABLE (
      lot_id BIGINT,
      lot_number VARCHAR(50),
      expiry_date DATE,
      quantity_available DECIMAL(15,3),
      quantity_to_use DECIMAL(15,3),
      unit_cost DECIMAL(15,4)
    ) AS $$
    DECLARE
      v_remaining DECIMAL(15,3);
      v_lot RECORD;
    BEGIN
      v_remaining := p_quantity_needed;

      FOR v_lot IN
        SELECT dl.id, dl.lot_number, dl.expiry_date, dl.quantity_available, dl.unit_cost
        FROM inventory.drug_lots dl
        WHERE dl.drug_id = p_drug_id
          AND dl.location_id = p_location_id
          AND dl.quantity_available > 0
          AND dl.is_active = true
          AND dl.expiry_date > CURRENT_DATE
        ORDER BY dl.expiry_date ASC, dl.received_date ASC, dl.id ASC
      LOOP
        IF v_remaining <= 0 THEN
          EXIT;
        END IF;

        RETURN QUERY SELECT
          v_lot.id,
          v_lot.lot_number,
          v_lot.expiry_date,
          v_lot.quantity_available,
          LEAST(v_lot.quantity_available, v_remaining),
          v_lot.unit_cost;

        v_remaining := v_remaining - v_lot.quantity_available;
      END LOOP;
    END;
    $$ LANGUAGE plpgsql
  `);

  // Function: Update Inventory from Receipt
  await knex.raw(`
    CREATE OR REPLACE FUNCTION inventory.update_inventory_from_receipt(
      p_receipt_id BIGINT,
      p_user_id UUID DEFAULT NULL
    ) RETURNS TABLE (
      success BOOLEAN,
      message TEXT,
      lots_created INTEGER,
      inventory_updated INTEGER
    ) AS $$
    DECLARE
      v_receipt RECORD;
      v_item RECORD;
      v_inventory_id BIGINT;
      v_lot_id BIGINT;
      v_lots_created INTEGER := 0;
      v_inventory_updated INTEGER := 0;
    BEGIN
      SELECT * INTO v_receipt
      FROM inventory.receipts
      WHERE id = p_receipt_id;

      IF v_receipt IS NULL THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, 'Receipt not found'::TEXT, 0, 0;
        RETURN;
      END IF;

      IF v_receipt.status != 'APPROVED' THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, 'Receipt must be approved before inventory update'::TEXT, 0, 0;
        RETURN;
      END IF;

      FOR v_item IN
        SELECT ri.*, po.warehouse_id
        FROM inventory.receipt_items ri
        JOIN inventory.receipts r ON r.id = ri.receipt_id
        JOIN inventory.purchase_orders po ON po.id = r.po_id
        WHERE ri.receipt_id = p_receipt_id
      LOOP
        SELECT id INTO v_inventory_id
        FROM inventory.inventory
        WHERE drug_id = v_item.drug_id
          AND location_id = v_item.warehouse_id;

        IF v_inventory_id IS NULL THEN
          INSERT INTO inventory.inventory (drug_id, location_id, quantity_on_hand, last_cost)
          VALUES (v_item.drug_id, v_item.warehouse_id, 0, v_item.unit_cost)
          RETURNING id INTO v_inventory_id;
        END IF;

        INSERT INTO inventory.drug_lots (
          drug_id, location_id, lot_number, expiry_date,
          quantity_available, unit_cost, received_date, receipt_id
        ) VALUES (
          v_item.drug_id, v_item.warehouse_id, v_item.lot_number, v_item.expiry_date,
          v_item.quantity_accepted, v_item.unit_cost, CURRENT_DATE, p_receipt_id
        ) RETURNING id INTO v_lot_id;

        v_lots_created := v_lots_created + 1;

        UPDATE inventory.inventory
        SET quantity_on_hand = quantity_on_hand + v_item.quantity_accepted,
            last_cost = v_item.unit_cost,
            average_cost = (
              (COALESCE(average_cost, 0) * quantity_on_hand + v_item.unit_cost * v_item.quantity_accepted) /
              NULLIF(quantity_on_hand + v_item.quantity_accepted, 0)
            ),
            last_updated = NOW(),
            updated_at = NOW()
        WHERE id = v_inventory_id;

        v_inventory_updated := v_inventory_updated + 1;

        INSERT INTO inventory.inventory_transactions (
          inventory_id, transaction_type, quantity, unit_cost,
          reference_id, reference_type, notes, created_by
        ) VALUES (
          v_inventory_id, 'RECEIPT', v_item.quantity_accepted, v_item.unit_cost,
          p_receipt_id, 'RECEIPT', format('Lot: %s, Expiry: %s', v_item.lot_number, v_item.expiry_date),
          p_user_id
        );
      END LOOP;

      UPDATE inventory.receipts
      SET status = 'COMPLETED', updated_at = NOW()
      WHERE id = p_receipt_id;

      RETURN QUERY SELECT TRUE::BOOLEAN, 'Inventory updated successfully'::TEXT, v_lots_created, v_inventory_updated;
    END;
    $$ LANGUAGE plpgsql
  `);

  // Function: Deduct Inventory (for distribution)
  await knex.raw(`
    CREATE OR REPLACE FUNCTION inventory.deduct_inventory(
      p_drug_id INTEGER,
      p_from_location_id INTEGER,
      p_quantity DECIMAL(15,3),
      p_reference_type VARCHAR(50),
      p_reference_id BIGINT,
      p_use_fefo BOOLEAN DEFAULT TRUE,
      p_user_id UUID DEFAULT NULL
    ) RETURNS TABLE (
      success BOOLEAN,
      message TEXT,
      lots_used JSONB
    ) AS $$
    DECLARE
      v_inventory_id BIGINT;
      v_remaining DECIMAL(15,3);
      v_lot RECORD;
      v_lot_quantity DECIMAL(15,3);
      v_lots_used JSONB := '[]'::JSONB;
    BEGIN
      SELECT id INTO v_inventory_id
      FROM inventory.inventory
      WHERE drug_id = p_drug_id AND location_id = p_from_location_id
      FOR UPDATE;

      IF v_inventory_id IS NULL THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, 'Inventory record not found'::TEXT, '[]'::JSONB;
        RETURN;
      END IF;

      v_remaining := p_quantity;

      FOR v_lot IN
        SELECT dl.id, dl.lot_number, dl.expiry_date, dl.quantity_available, dl.unit_cost
        FROM inventory.drug_lots dl
        WHERE dl.drug_id = p_drug_id
          AND dl.location_id = p_from_location_id
          AND dl.quantity_available > 0
          AND dl.is_active = true
        ORDER BY
          CASE WHEN p_use_fefo THEN dl.expiry_date END ASC,
          dl.received_date ASC
      LOOP
        IF v_remaining <= 0 THEN
          EXIT;
        END IF;

        v_lot_quantity := LEAST(v_lot.quantity_available, v_remaining);

        UPDATE inventory.drug_lots
        SET quantity_available = quantity_available - v_lot_quantity,
            updated_at = NOW()
        WHERE id = v_lot.id;

        v_lots_used := v_lots_used || jsonb_build_object(
          'lot_id', v_lot.id,
          'lot_number', v_lot.lot_number,
          'quantity', v_lot_quantity,
          'unit_cost', v_lot.unit_cost
        );

        v_remaining := v_remaining - v_lot_quantity;
      END LOOP;

      IF v_remaining > 0 THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, format('Insufficient stock. Short by: %s', v_remaining)::TEXT, v_lots_used;
        RETURN;
      END IF;

      UPDATE inventory.inventory
      SET quantity_on_hand = quantity_on_hand - p_quantity,
          last_updated = NOW(),
          updated_at = NOW()
      WHERE id = v_inventory_id;

      INSERT INTO inventory.inventory_transactions (
        inventory_id, transaction_type, quantity, reference_id, reference_type, created_by
      ) VALUES (
        v_inventory_id, 'DISTRIBUTION', -p_quantity, p_reference_id, p_reference_type, p_user_id
      );

      RETURN QUERY SELECT TRUE::BOOLEAN, 'Inventory deducted successfully'::TEXT, v_lots_used;
    END;
    $$ LANGUAGE plpgsql
  `);

  // Trigger function: Update updated_at timestamp
  await knex.raw(`
    CREATE OR REPLACE FUNCTION inventory.update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  // Apply updated_at trigger to key tables
  const tablesWithUpdatedAt = [
    'locations',
    'departments',
    'drugs',
    'drug_generics',
    'companies',
    'budgets',
    'budget_allocations',
    'contracts',
    'purchase_requests',
    'purchase_orders',
    'receipts',
    'inventory',
    'drug_lots',
    'drug_distributions',
    'drug_returns',
    'hospital_pharmaceutical_products',
  ];

  for (const table of tablesWithUpdatedAt) {
    await knex.raw(
      `DROP TRIGGER IF EXISTS trg_${table}_updated_at ON inventory.${table}`,
    );
    await knex.raw(`
      CREATE TRIGGER trg_${table}_updated_at
      BEFORE UPDATE ON inventory.${table}
      FOR EACH ROW EXECUTE FUNCTION inventory.update_updated_at()
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Drop triggers first
  const tablesWithUpdatedAt = [
    'locations',
    'departments',
    'drugs',
    'drug_generics',
    'companies',
    'budgets',
    'budget_allocations',
    'contracts',
    'purchase_requests',
    'purchase_orders',
    'receipts',
    'inventory',
    'drug_lots',
    'drug_distributions',
    'drug_returns',
    'hospital_pharmaceutical_products',
  ];

  for (const table of tablesWithUpdatedAt) {
    await knex.raw(
      `DROP TRIGGER IF EXISTS trg_${table}_updated_at ON inventory.${table}`,
    );
  }

  // Drop functions
  await knex.raw(`DROP FUNCTION IF EXISTS inventory.update_updated_at()`);
  await knex.raw(
    `DROP FUNCTION IF EXISTS inventory.deduct_inventory(INTEGER, INTEGER, DECIMAL, VARCHAR, BIGINT, BOOLEAN, UUID)`,
  );
  await knex.raw(
    `DROP FUNCTION IF EXISTS inventory.update_inventory_from_receipt(BIGINT, UUID)`,
  );
  await knex.raw(
    `DROP FUNCTION IF EXISTS inventory.get_fefo_lots(INTEGER, INTEGER, DECIMAL)`,
  );
  await knex.raw(
    `DROP FUNCTION IF EXISTS inventory.get_fifo_lots(INTEGER, INTEGER, DECIMAL)`,
  );
  await knex.raw(`DROP FUNCTION IF EXISTS inventory.release_budget(BIGINT)`);
  await knex.raw(`DROP FUNCTION IF EXISTS inventory.commit_budget(BIGINT)`);
  await knex.raw(
    `DROP FUNCTION IF EXISTS inventory.reserve_budget(INTEGER, DECIMAL, VARCHAR, BIGINT, TEXT)`,
  );
  await knex.raw(
    `DROP FUNCTION IF EXISTS inventory.check_budget_availability(INTEGER, DECIMAL)`,
  );
}
