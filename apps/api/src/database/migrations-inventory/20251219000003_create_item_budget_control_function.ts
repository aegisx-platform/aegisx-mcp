import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // ============================================================================
  // Function: check_item_budget_control
  // Purpose: ตรวจสอบการควบคุมงบราย Item เมื่อสร้าง PR
  // Returns: allowed flag, quantity/price status, detailed JSONB message
  // ============================================================================
  await knex.raw(`
    CREATE OR REPLACE FUNCTION inventory.check_item_budget_control(
      p_budget_request_item_id BIGINT,
      p_pr_quantity NUMERIC,
      p_pr_unit_price NUMERIC,
      p_quarter INTEGER
    )
    RETURNS TABLE(
      allowed BOOLEAN,
      quantity_status VARCHAR(10),
      price_status VARCHAR(10),
      message JSONB
    )
    LANGUAGE plpgsql
    AS $$
    DECLARE
      v_item RECORD;
      v_quarter_planned_qty NUMERIC;
      v_quarter_purchased_qty NUMERIC;
      v_remaining_qty NUMERIC;
      v_planned_unit_price NUMERIC;
      v_qty_diff_percent NUMERIC;
      v_price_diff_percent NUMERIC;
      v_qty_status VARCHAR(10);
      v_price_status VARCHAR(10);
      v_overall_allowed BOOLEAN;
      v_message JSONB;
    BEGIN
      -- ============================================================================
      -- STEP 1: Fetch item configuration and data
      -- ============================================================================
      SELECT * INTO v_item
      FROM inventory.budget_request_items
      WHERE id = p_budget_request_item_id;

      -- ตรวจสอบว่ามี item หรือไม่
      IF v_item IS NULL THEN
        RETURN QUERY SELECT
          false,
          'BLOCKED'::VARCHAR(10),
          'BLOCKED'::VARCHAR(10),
          jsonb_build_object(
            'error', 'Budget request item not found',
            'item_id', p_budget_request_item_id
          );
        RETURN;
      END IF;

      -- ============================================================================
      -- STEP 2: Get quarterly planned and purchased quantities
      -- ============================================================================
      v_quarter_planned_qty := CASE
        WHEN p_quarter = 1 THEN v_item.q1_qty
        WHEN p_quarter = 2 THEN v_item.q2_qty
        WHEN p_quarter = 3 THEN v_item.q3_qty
        WHEN p_quarter = 4 THEN v_item.q4_qty
        ELSE 0
      END;

      v_quarter_purchased_qty := CASE
        WHEN p_quarter = 1 THEN COALESCE(v_item.q1_purchased_qty, 0)
        WHEN p_quarter = 2 THEN COALESCE(v_item.q2_purchased_qty, 0)
        WHEN p_quarter = 3 THEN COALESCE(v_item.q3_purchased_qty, 0)
        WHEN p_quarter = 4 THEN COALESCE(v_item.q4_purchased_qty, 0)
        ELSE 0
      END;

      v_remaining_qty := v_quarter_planned_qty - v_quarter_purchased_qty;
      v_planned_unit_price := COALESCE(v_item.unit_price, 0);

      -- ============================================================================
      -- STEP 3: Calculate variance percentages
      -- ============================================================================

      -- Quantity variance calculation
      IF v_remaining_qty = 0 THEN
        -- ถ้างบเหลือ 0 แต่ PR ยังมี → เกิน 100%
        v_qty_diff_percent := CASE
          WHEN p_pr_quantity > 0 THEN 100
          ELSE 0
        END;
      ELSE
        -- คำนวณ % ที่เกิน: ((PR - remaining) / remaining) * 100
        v_qty_diff_percent := ((p_pr_quantity - v_remaining_qty) / v_remaining_qty) * 100;
      END IF;

      -- Price variance calculation
      IF v_planned_unit_price = 0 THEN
        v_price_diff_percent := 0;  -- ถ้าไม่มีราคาวางแผน ให้ผ่าน
      ELSE
        -- คำนวณ % ที่เกิน: ((PR price - planned price) / planned price) * 100
        v_price_diff_percent := ((p_pr_unit_price - v_planned_unit_price) / v_planned_unit_price) * 100;
      END IF;

      -- ============================================================================
      -- STEP 4: Check quantity control
      -- ============================================================================
      IF v_item.quantity_control_type = 'NONE' THEN
        -- ไม่ควบคุม → ผ่านเลย
        v_qty_status := 'OK';
      ELSIF ABS(v_qty_diff_percent) <= v_item.quantity_variance_percent THEN
        -- อยู่ใน tolerance → ผ่าน
        v_qty_status := 'OK';
      ELSIF v_item.quantity_control_type = 'SOFT' THEN
        -- เกิน tolerance แต่เป็น SOFT → แจ้งเตือน
        v_qty_status := 'WARNING';
      ELSE
        -- เกิน tolerance และเป็น HARD → บล็อค
        v_qty_status := 'BLOCKED';
      END IF;

      -- ============================================================================
      -- STEP 5: Check price control
      -- ============================================================================
      IF v_item.price_control_type = 'NONE' THEN
        v_price_status := 'OK';
      ELSIF ABS(v_price_diff_percent) <= v_item.price_variance_percent THEN
        v_price_status := 'OK';
      ELSIF v_item.price_control_type = 'SOFT' THEN
        v_price_status := 'WARNING';
      ELSE
        v_price_status := 'BLOCKED';
      END IF;

      -- ============================================================================
      -- STEP 6: Determine overall allowed status
      -- ============================================================================
      v_overall_allowed := (v_qty_status != 'BLOCKED' AND v_price_status != 'BLOCKED');

      -- ============================================================================
      -- STEP 7: Build detailed JSONB message
      -- ============================================================================
      v_message := jsonb_build_object(
        'quantity', jsonb_build_object(
          'planned', v_quarter_planned_qty,
          'purchased', v_quarter_purchased_qty,
          'remaining', v_remaining_qty,
          'requested', p_pr_quantity,
          'diff_percent', ROUND(v_qty_diff_percent, 2),
          'tolerance', v_item.quantity_variance_percent,
          'control_type', v_item.quantity_control_type,
          'exceeded', ABS(v_qty_diff_percent) > v_item.quantity_variance_percent
        ),
        'price', jsonb_build_object(
          'planned', v_planned_unit_price,
          'requested', p_pr_unit_price,
          'diff_percent', ROUND(v_price_diff_percent, 2),
          'tolerance', v_item.price_variance_percent,
          'control_type', v_item.price_control_type,
          'exceeded', ABS(v_price_diff_percent) > v_item.price_variance_percent
        ),
        'item', jsonb_build_object(
          'id', v_item.id,
          'budget_request_id', v_item.budget_request_id,
          'item_id', v_item.item_id
        ),
        'quarter', p_quarter
      );

      -- ============================================================================
      -- STEP 8: Return results
      -- ============================================================================
      RETURN QUERY SELECT
        v_overall_allowed,
        v_qty_status,
        v_price_status,
        v_message;
    END;
    $$;
  `);

  // ============================================================================
  // Add function comment
  // ============================================================================
  await knex.raw(`
    COMMENT ON FUNCTION inventory.check_item_budget_control(BIGINT, NUMERIC, NUMERIC, INTEGER) IS
      'ตรวจสอบการควบคุมงบราย Item: รับ (item_id, pr_qty, pr_price, quarter)
       คืนค่า (allowed, quantity_status, price_status, message)

       Status values:
       - OK: ผ่านการตรวจสอบ
       - WARNING: เกิน tolerance (SOFT control) ต้องระบุเหตุผล
       - BLOCKED: เกิน tolerance (HARD control) ห้ามสร้าง PR

       Control types:
       - NONE: ไม่ตรวจสอบ
       - SOFT: เตือน + ต้องระบุเหตุผล
       - HARD: บล็อคไม่ให้สร้าง PR

       Example usage:
       SELECT * FROM inventory.check_item_budget_control(123, 1000, 50.00, 1);';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    DROP FUNCTION IF EXISTS inventory.check_item_budget_control(BIGINT, NUMERIC, NUMERIC, INTEGER);
  `);
}
