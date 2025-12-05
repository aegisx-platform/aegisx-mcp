import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Set search_path
  await knex.raw(`SET search_path TO inventory, public`);

  // =====================================================
  // 1. Master Data Enums
  // =====================================================

  // Location type
  await knex.raw(`
    CREATE TYPE inventory.location_type AS ENUM (
      'WAREHOUSE', 'PHARMACY', 'WARD', 'EMERGENCY', 'OPERATING', 'ICU', 'STORAGE', 'QUARANTINE'
    )
  `);

  // Company type
  await knex.raw(`
    CREATE TYPE inventory.company_type AS ENUM (
      'VENDOR', 'MANUFACTURER', 'BOTH'
    )
  `);

  // Department consumption group (Ministry requirement)
  await knex.raw(`
    CREATE TYPE inventory.dept_consumption_group AS ENUM (
      'GROUP_1', 'GROUP_2', 'GROUP_3', 'GROUP_4', 'GROUP_5',
      'GROUP_6', 'GROUP_7', 'GROUP_8', 'GROUP_9'
    )
  `);

  // Budget class
  await knex.raw(`
    CREATE TYPE inventory.budget_class AS ENUM (
      'OPERATIONAL', 'INVESTMENT', 'EMERGENCY', 'RESEARCH'
    )
  `);

  // Unit type
  await knex.raw(`
    CREATE TYPE inventory.unit_type AS ENUM (
      'WEIGHT', 'VOLUME', 'QUANTITY', 'POTENCY'
    )
  `);

  // Adjustment type
  await knex.raw(`
    CREATE TYPE inventory.adjustment_type AS ENUM (
      'INCREASE', 'DECREASE'
    )
  `);

  // Return action type
  await knex.raw(`
    CREATE TYPE inventory.return_action_type AS ENUM (
      'REFUND', 'REPLACE', 'CREDIT', 'DISPOSE'
    )
  `);

  // =====================================================
  // 2. Drug Enums (Ministry Compliance)
  // =====================================================

  // NLEM status (Essential / Non-Essential)
  await knex.raw(`
    CREATE TYPE inventory.nlem_status AS ENUM (
      'E', 'N'
    )
  `);

  // Drug status
  await knex.raw(`
    CREATE TYPE inventory.drug_status AS ENUM (
      'STATUS_1', 'STATUS_2', 'STATUS_3', 'STATUS_4'
    )
  `);

  // Product category
  await knex.raw(`
    CREATE TYPE inventory.product_category AS ENUM (
      'CATEGORY_1', 'CATEGORY_2', 'CATEGORY_3', 'CATEGORY_4', 'CATEGORY_5'
    )
  `);

  // =====================================================
  // 3. Budget Enums
  // =====================================================

  // Budget plan status
  await knex.raw(`
    CREATE TYPE inventory.budget_plan_status AS ENUM (
      'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REVISED'
    )
  `);

  // Reservation status
  await knex.raw(`
    CREATE TYPE inventory.reservation_status AS ENUM (
      'ACTIVE', 'RELEASED', 'EXPIRED', 'COMMITTED'
    )
  `);

  // =====================================================
  // 4. Contract Enums
  // =====================================================

  // Contract type
  await knex.raw(`
    CREATE TYPE inventory.contract_type AS ENUM (
      'FRAMEWORK', 'SPECIFIC', 'ANNUAL'
    )
  `);

  // Contract status
  await knex.raw(`
    CREATE TYPE inventory.contract_status AS ENUM (
      'DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED'
    )
  `);

  // =====================================================
  // 5. Purchase Request Enums
  // =====================================================

  // PR urgency/priority
  await knex.raw(`
    CREATE TYPE inventory.pr_priority AS ENUM (
      'URGENT', 'HIGH', 'NORMAL', 'LOW'
    )
  `);

  // PR status
  await knex.raw(`
    CREATE TYPE inventory.pr_status AS ENUM (
      'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED'
    )
  `);

  // =====================================================
  // 6. Purchase Order Enums
  // =====================================================

  // PO status
  await knex.raw(`
    CREATE TYPE inventory.po_status AS ENUM (
      'DRAFT', 'PENDING', 'APPROVED', 'SENT', 'PARTIAL', 'COMPLETED', 'CANCELLED'
    )
  `);

  // Payment terms
  await knex.raw(`
    CREATE TYPE inventory.payment_terms AS ENUM (
      'NET15', 'NET30', 'NET45', 'NET60', 'IMMEDIATE', 'COD'
    )
  `);

  // =====================================================
  // 7. Receipt Enums
  // =====================================================

  // Receipt status
  await knex.raw(`
    CREATE TYPE inventory.receipt_status AS ENUM (
      'DRAFT', 'INSPECTING', 'ACCEPTED', 'PARTIAL', 'REJECTED', 'POSTED'
    )
  `);

  // Inspector role
  await knex.raw(`
    CREATE TYPE inventory.inspector_role AS ENUM (
      'CHAIRMAN', 'MEMBER', 'SECRETARY'
    )
  `);

  // =====================================================
  // 8. Approval & Payment Enums
  // =====================================================

  // Approval document type
  await knex.raw(`
    CREATE TYPE inventory.approval_doc_type AS ENUM (
      'DIRECTOR_APPROVAL', 'COMMITTEE_APPROVAL', 'BOARD_APPROVAL', 'SPECIAL_APPROVAL'
    )
  `);

  // Payment method
  await knex.raw(`
    CREATE TYPE inventory.payment_method AS ENUM (
      'CASH', 'CHEQUE', 'TRANSFER', 'CREDIT_CARD'
    )
  `);

  // Payment status
  await knex.raw(`
    CREATE TYPE inventory.payment_status AS ENUM (
      'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'
    )
  `);

  // =====================================================
  // 9. Inventory Enums
  // =====================================================

  // Transaction type
  await knex.raw(`
    CREATE TYPE inventory.transaction_type AS ENUM (
      'RECEIVE', 'ISSUE', 'TRANSFER', 'ADJUST', 'RETURN'
    )
  `);

  // =====================================================
  // 10. Distribution Enums
  // =====================================================

  // Distribution status
  await knex.raw(`
    CREATE TYPE inventory.distribution_status AS ENUM (
      'PENDING', 'APPROVED', 'DISPENSED', 'COMPLETED', 'CANCELLED'
    )
  `);

  // =====================================================
  // 11. Return Enums
  // =====================================================

  // Return status
  await knex.raw(`
    CREATE TYPE inventory.return_status AS ENUM (
      'DRAFT', 'SUBMITTED', 'VERIFIED', 'POSTED', 'CANCELLED'
    )
  `);

  // Return type
  await knex.raw(`
    CREATE TYPE inventory.return_type AS ENUM (
      'PURCHASED', 'FREE'
    )
  `);

  // =====================================================
  // 12. TMT Enums
  // =====================================================

  // TMT level
  await knex.raw(`
    CREATE TYPE inventory.tmt_level AS ENUM (
      'SUBS', 'VTM', 'GP', 'TP', 'GPU', 'TPU', 'GPP', 'TPP', 'GP_F', 'GP_X'
    )
  `);

  // TMT relationship type
  await knex.raw(`
    CREATE TYPE inventory.tmt_relation_type AS ENUM (
      'IS_A', 'HAS_INGREDIENT', 'HAS_FORM'
    )
  `);

  // HIS mapping status
  await knex.raw(`
    CREATE TYPE inventory.his_mapping_status AS ENUM (
      'MAPPED', 'UNMAPPED', 'PENDING', 'VERIFIED'
    )
  `);

  // =====================================================
  // 13. HPP Enums
  // =====================================================

  // HPP type
  await knex.raw(`
    CREATE TYPE inventory.hpp_type AS ENUM (
      'R', 'M', 'F', 'X', 'OHPP'
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Set search_path
  await knex.raw(`SET search_path TO inventory, public`);

  // Drop all enums in reverse order
  const enums = [
    'hpp_type',
    'his_mapping_status',
    'tmt_relation_type',
    'tmt_level',
    'return_type',
    'return_status',
    'distribution_status',
    'transaction_type',
    'payment_status',
    'payment_method',
    'approval_doc_type',
    'inspector_role',
    'receipt_status',
    'payment_terms',
    'po_status',
    'pr_status',
    'pr_priority',
    'contract_status',
    'contract_type',
    'reservation_status',
    'budget_plan_status',
    'product_category',
    'drug_status',
    'nlem_status',
    'return_action_type',
    'adjustment_type',
    'unit_type',
    'budget_class',
    'dept_consumption_group',
    'company_type',
    'location_type',
  ];

  for (const enumName of enums) {
    await knex.raw(`DROP TYPE IF EXISTS inventory.${enumName} CASCADE`);
  }
}
