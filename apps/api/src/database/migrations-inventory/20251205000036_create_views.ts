import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // View: Current Stock Summary
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_current_stock_summary AS
    SELECT
      i.id AS inventory_id,
      i.drug_id,
      d.drug_code,
      d.trade_name,
      dg.generic_name,
      dg.working_code AS generic_code,
      l.id AS location_id,
      l.location_code,
      l.location_name,
      i.quantity_on_hand,
      i.min_level,
      i.max_level,
      i.reorder_point,
      i.average_cost,
      i.last_cost,
      CASE
        WHEN i.quantity_on_hand <= 0 THEN 'OUT_OF_STOCK'
        WHEN i.reorder_point IS NOT NULL AND i.quantity_on_hand <= i.reorder_point THEN 'LOW_STOCK'
        WHEN i.max_level IS NOT NULL AND i.quantity_on_hand >= i.max_level THEN 'OVERSTOCK'
        ELSE 'NORMAL'
      END AS stock_status,
      (i.quantity_on_hand * COALESCE(i.average_cost, i.last_cost, 0)) AS stock_value,
      i.last_updated,
      i.updated_at
    FROM inventory.inventory i
    JOIN inventory.drugs d ON d.id = i.drug_id
    LEFT JOIN inventory.drug_generics dg ON dg.id = d.generic_id
    JOIN inventory.locations l ON l.id = i.location_id
    WHERE d.is_active = true
  `);

  // View: Low Stock Items (for alerts)
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_low_stock_items AS
    SELECT
      i.id AS inventory_id,
      i.drug_id,
      d.drug_code,
      d.trade_name,
      dg.generic_name,
      l.id AS location_id,
      l.location_code,
      l.location_name,
      i.quantity_on_hand,
      i.reorder_point,
      (i.reorder_point - i.quantity_on_hand) AS quantity_needed,
      i.min_level,
      i.average_cost,
      ((i.reorder_point - i.quantity_on_hand) * COALESCE(i.average_cost, 0)) AS estimated_cost,
      CASE
        WHEN i.quantity_on_hand <= 0 THEN 'CRITICAL'
        WHEN i.quantity_on_hand <= i.min_level THEN 'URGENT'
        ELSE 'WARNING'
      END AS alert_level
    FROM inventory.inventory i
    JOIN inventory.drugs d ON d.id = i.drug_id
    LEFT JOIN inventory.drug_generics dg ON dg.id = d.generic_id
    JOIN inventory.locations l ON l.id = i.location_id
    WHERE i.reorder_point IS NOT NULL
      AND i.quantity_on_hand <= i.reorder_point
      AND d.is_active = true
    ORDER BY
      CASE
        WHEN i.quantity_on_hand <= 0 THEN 1
        WHEN i.quantity_on_hand <= i.min_level THEN 2
        ELSE 3
      END,
      (i.reorder_point - i.quantity_on_hand) DESC
  `);

  // View: Expiring Drugs (within 6 months)
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_expiring_drugs AS
    SELECT
      dl.id AS lot_id,
      dl.drug_id,
      d.drug_code,
      d.trade_name,
      dg.generic_name,
      dl.lot_number,
      dl.expiry_date,
      dl.quantity_available,
      dl.unit_cost,
      (dl.quantity_available * dl.unit_cost) AS lot_value,
      l.id AS location_id,
      l.location_code,
      l.location_name,
      (dl.expiry_date - CURRENT_DATE) AS days_to_expiry,
      CASE
        WHEN dl.expiry_date <= CURRENT_DATE THEN 'EXPIRED'
        WHEN dl.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'CRITICAL'
        WHEN dl.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'WARNING'
        ELSE 'APPROACHING'
      END AS expiry_status
    FROM inventory.drug_lots dl
    JOIN inventory.drugs d ON d.id = dl.drug_id
    LEFT JOIN inventory.drug_generics dg ON dg.id = d.generic_id
    JOIN inventory.locations l ON l.id = dl.location_id
    WHERE dl.quantity_available > 0
      AND dl.is_active = true
      AND dl.expiry_date <= CURRENT_DATE + INTERVAL '180 days'
    ORDER BY dl.expiry_date ASC
  `);

  // View: Drug Lot Details (with calculated values)
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_drug_lot_details AS
    SELECT
      dl.id AS lot_id,
      dl.drug_id,
      d.drug_code,
      d.trade_name,
      dg.generic_name,
      dl.lot_number,
      dl.expiry_date,
      dl.quantity_available,
      dl.unit_cost,
      (dl.quantity_available * dl.unit_cost) AS lot_value,
      dl.received_date,
      dl.receipt_id,
      l.id AS location_id,
      l.location_code,
      l.location_name,
      dl.is_active,
      (dl.expiry_date - CURRENT_DATE) AS days_to_expiry,
      (CURRENT_DATE - dl.received_date) AS days_in_stock,
      CASE WHEN dl.expiry_date <= CURRENT_DATE THEN TRUE ELSE FALSE END AS is_expired,
      dl.created_at,
      dl.updated_at
    FROM inventory.drug_lots dl
    JOIN inventory.drugs d ON d.id = dl.drug_id
    LEFT JOIN inventory.drug_generics dg ON dg.id = d.generic_id
    JOIN inventory.locations l ON l.id = dl.location_id
    WHERE dl.is_active = true
  `);

  // View: Budget Summary
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_budget_summary AS
    SELECT
      b.id AS budget_id,
      bt.type_code AS budget_type_code,
      bt.type_name AS budget_type_name,
      bc.category_code AS budget_category_code,
      bc.category_name AS budget_category_name,
      b.description AS budget_description,
      ba.fiscal_year,
      ba.total_budget,
      ba.total_spent,
      ba.remaining_budget,
      ba.q1_budget,
      ba.q2_budget,
      ba.q3_budget,
      ba.q4_budget,
      ROUND((ba.total_spent / NULLIF(ba.total_budget, 0) * 100), 2) AS utilization_percentage,
      CASE
        WHEN ba.remaining_budget <= 0 THEN 'EXHAUSTED'
        WHEN (ba.total_spent / NULLIF(ba.total_budget, 0) * 100) >= 90 THEN 'CRITICAL'
        WHEN (ba.total_spent / NULLIF(ba.total_budget, 0) * 100) >= 75 THEN 'WARNING'
        ELSE 'NORMAL'
      END AS budget_status,
      b.is_active,
      ba.updated_at
    FROM inventory.budgets b
    JOIN inventory.budget_allocations ba ON ba.budget_id = b.id
    JOIN inventory.budget_types bt ON bt.id = b.budget_type_id
    LEFT JOIN inventory.budget_categories bc ON bc.id = b.budget_category_id
    WHERE b.is_active = true
  `);

  // View: Procurement Status Summary
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_procurement_summary AS
    SELECT
      'PR' AS doc_type,
      pr.pr_number AS doc_number,
      pr.request_date AS doc_date,
      pr.status::TEXT,
      dep.dept_code,
      dep.dept_name,
      pr.total_amount,
      pr.created_at,
      pr.updated_at
    FROM inventory.purchase_requests pr
    JOIN inventory.departments dep ON dep.id = pr.department_id
    WHERE pr.status NOT IN ('CANCELLED', 'REJECTED')

    UNION ALL

    SELECT
      'PO' AS doc_type,
      po.po_number AS doc_number,
      po.po_date AS doc_date,
      po.status::TEXT,
      dep.dept_code,
      dep.dept_name,
      po.total_amount,
      po.created_at,
      po.updated_at
    FROM inventory.purchase_orders po
    JOIN inventory.purchase_requests pr ON pr.id = po.pr_id
    JOIN inventory.departments dep ON dep.id = pr.department_id
    WHERE po.status NOT IN ('CANCELLED')

    UNION ALL

    SELECT
      'RCV' AS doc_type,
      r.receipt_number AS doc_number,
      r.receipt_date AS doc_date,
      r.status::TEXT,
      dep.dept_code,
      dep.dept_name,
      r.total_amount,
      r.created_at,
      r.updated_at
    FROM inventory.receipts r
    JOIN inventory.purchase_orders po ON po.id = r.po_id
    JOIN inventory.purchase_requests pr ON pr.id = po.pr_id
    JOIN inventory.departments dep ON dep.id = pr.department_id
  `);

  // View: Distribution Summary by Department
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_distribution_by_department AS
    SELECT
      dep.id AS department_id,
      dep.dept_code,
      dep.dept_name,
      COUNT(DISTINCT dd.id) AS total_distributions,
      SUM(dd.total_items) AS total_items_distributed,
      SUM(dd.total_amount) AS total_amount,
      MAX(dd.distribution_date) AS last_distribution_date
    FROM inventory.departments dep
    LEFT JOIN inventory.drug_distributions dd ON dd.requesting_dept_id = dep.id
      AND dd.status = 'COMPLETED'
    WHERE dep.is_active = true
    GROUP BY dep.id, dep.dept_code, dep.dept_name
    ORDER BY total_amount DESC NULLS LAST
  `);

  // View: Drug Movement History
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_drug_movement AS
    SELECT
      it.id AS transaction_id,
      it.inventory_id,
      i.drug_id,
      d.drug_code,
      d.trade_name,
      l.location_code,
      l.location_name,
      it.transaction_type,
      it.quantity,
      it.unit_cost,
      (it.quantity * COALESCE(it.unit_cost, 0)) AS transaction_value,
      it.reference_type,
      it.reference_id,
      it.notes,
      u.username AS created_by_username,
      it.created_at
    FROM inventory.inventory_transactions it
    JOIN inventory.inventory i ON i.id = it.inventory_id
    JOIN inventory.drugs d ON d.id = i.drug_id
    JOIN inventory.locations l ON l.id = i.location_id
    LEFT JOIN public.users u ON u.id = it.created_by
    ORDER BY it.created_at DESC
  `);

  // View: TMT Mapping Status
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_tmt_mapping_status AS
    SELECT
      d.id AS drug_id,
      d.drug_code,
      d.trade_name,
      dg.generic_name,
      tm.tmt_id,
      tm.tmt_level,
      tc.concept_code AS tmt_code,
      tc.fsn AS tmt_fsn,
      tc.preferred_term AS tmt_preferred_term,
      tm.is_verified,
      u.username AS verified_by_username,
      tm.verified_at,
      CASE
        WHEN tm.id IS NULL THEN 'UNMAPPED'
        WHEN tm.is_verified = false THEN 'PENDING_VERIFICATION'
        ELSE 'VERIFIED'
      END AS mapping_status
    FROM inventory.drugs d
    LEFT JOIN inventory.drug_generics dg ON dg.id = d.generic_id
    LEFT JOIN inventory.tmt_mappings tm ON tm.drug_id = d.id
    LEFT JOIN inventory.tmt_concepts tc ON tc.id = tm.tmt_concept_id
    LEFT JOIN public.users u ON u.id = tm.verified_by
    WHERE d.is_active = true
  `);

  // View: Ministry Export - Drug List
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_ministry_drug_export AS
    SELECT
      d.drug_code AS "รหัสยา",
      d.trade_name AS "ชื่อการค้า",
      dg.generic_name AS "ชื่อสามัญ",
      dg.working_code AS "รหัสยาสามัญ",
      df.form_name AS "รูปแบบยา",
      dg.strength_value AS "ความแรง",
      du.unit_name AS "หน่วยนับ",
      d.nlem_status::TEXT AS "สถานะ_NLEM",
      d.drug_status::TEXT AS "สถานะยา",
      d.product_category::TEXT AS "ประเภทผลิตภัณฑ์",
      tc.concept_code AS "TMT_Code",
      tc.preferred_term AS "TMT_Name",
      CASE WHEN d.is_active THEN 'ใช้งาน' ELSE 'ยกเลิก' END AS "สถานะการใช้งาน"
    FROM inventory.drugs d
    LEFT JOIN inventory.drug_generics dg ON dg.id = d.generic_id
    LEFT JOIN inventory.dosage_forms df ON df.id = dg.dosage_form_id
    LEFT JOIN inventory.drug_units du ON du.id = dg.strength_unit_id
    LEFT JOIN inventory.tmt_mappings tm ON tm.drug_id = d.id AND tm.is_verified = true
    LEFT JOIN inventory.tmt_concepts tc ON tc.id = tm.tmt_concept_id
    ORDER BY d.drug_code
  `);

  // View: Ministry Export - Stock Report
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_ministry_stock_export AS
    SELECT
      l.location_code AS "รหัสคลัง",
      l.location_name AS "ชื่อคลัง",
      d.drug_code AS "รหัสยา",
      d.trade_name AS "ชื่อยา",
      dg.generic_name AS "ชื่อสามัญ",
      SUM(i.quantity_on_hand) AS "ยอดคงเหลือ",
      du.unit_name AS "หน่วย",
      AVG(i.average_cost) AS "ราคาเฉลี่ย",
      SUM(i.quantity_on_hand * COALESCE(i.average_cost, 0)) AS "มูลค่ารวม",
      MIN(dl.expiry_date) AS "วันหมดอายุใกล้สุด",
      tc.concept_code AS "TMT_Code"
    FROM inventory.inventory i
    JOIN inventory.drugs d ON d.id = i.drug_id
    LEFT JOIN inventory.drug_generics dg ON dg.id = d.generic_id
    JOIN inventory.locations l ON l.id = i.location_id
    LEFT JOIN inventory.drug_units du ON du.id = dg.strength_unit_id
    LEFT JOIN inventory.drug_lots dl ON dl.drug_id = d.id
      AND dl.location_id = l.id
      AND dl.quantity_available > 0
      AND dl.is_active = true
    LEFT JOIN inventory.tmt_mappings tm ON tm.drug_id = d.id AND tm.is_verified = true
    LEFT JOIN inventory.tmt_concepts tc ON tc.id = tm.tmt_concept_id
    WHERE d.is_active = true
    GROUP BY l.location_code, l.location_name, d.drug_code, d.trade_name,
             dg.generic_name, du.unit_name, tc.concept_code
    ORDER BY l.location_code, d.drug_code
  `);

  // View: HPP Product Summary
  await knex.raw(`
    CREATE OR REPLACE VIEW inventory.v_hpp_summary AS
    SELECT
      hpp.id AS hpp_id,
      hpp.hpp_code,
      hpp.hpp_type,
      hpp.product_name,
      dg.working_code AS generic_code,
      dg.generic_name,
      d.drug_code AS base_drug_code,
      d.trade_name AS base_drug_name,
      hpp.tmt_code,
      hpp.is_outsourced,
      hpp.is_active,
      COUNT(hf.id) AS formulation_count,
      hpp.created_at,
      hpp.updated_at
    FROM inventory.hospital_pharmaceutical_products hpp
    LEFT JOIN inventory.drug_generics dg ON dg.id = hpp.generic_id
    LEFT JOIN inventory.drugs d ON d.id = hpp.drug_id
    LEFT JOIN inventory.hpp_formulations hf ON hf.hpp_id = hpp.id
    GROUP BY hpp.id, hpp.hpp_code, hpp.hpp_type, hpp.product_name,
             dg.working_code, dg.generic_name, d.drug_code, d.trade_name,
             hpp.tmt_code, hpp.is_outsourced, hpp.is_active,
             hpp.created_at, hpp.updated_at
    ORDER BY hpp.hpp_code
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_hpp_summary`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_ministry_stock_export`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_ministry_drug_export`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_tmt_mapping_status`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_drug_movement`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_distribution_by_department`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_procurement_summary`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_budget_summary`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_drug_lot_details`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_expiring_drugs`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_low_stock_items`);
  await knex.raw(`DROP VIEW IF EXISTS inventory.v_current_stock_summary`);
}
