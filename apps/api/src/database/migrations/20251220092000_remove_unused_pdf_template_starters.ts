import type { Knex } from 'knex';

/**
 * Migration: Remove Unused PDF Template Starters
 *
 * Removes 6 business-focused template starters that are not needed:
 * - thai-invoice-starter
 * - thai-quotation-starter
 * - thai-delivery-note-starter
 * - thai-purchase-order-starter
 * - thai-monthly-report-starter
 * - thai-tax-invoice-full-starter
 *
 * Keeps 4 general-purpose templates:
 * - thai-business-letter-starter
 * - thai-payment-voucher-starter
 * - thai-certificate-starter
 * - thai-receipt-starter
 */

export async function up(knex: Knex): Promise<void> {
  const templatesToRemove = [
    'thai-invoice-starter',
    'thai-quotation-starter',
    'thai-delivery-note-starter',
    'thai-purchase-order-starter',
    'thai-monthly-report-starter',
    'thai-tax-invoice-full-starter',
  ];

  console.log(
    `🗑️  Removing ${templatesToRemove.length} unused PDF template starters...`,
  );

  // First, get template IDs to remove
  const templatesToDelete = await knex('pdf_templates')
    .select('id')
    .whereIn('name', templatesToRemove)
    .andWhere('is_template_starter', true);

  if (templatesToDelete.length === 0) {
    console.log('⏭️  No templates to remove (already deleted)');
    return;
  }

  const templateIds = templatesToDelete.map((t) => t.id);

  // Delete related pdf_renders first (to avoid foreign key constraint)
  const rendersDeleted = await knex('pdf_renders')
    .whereIn('template_id', templateIds)
    .delete();

  if (rendersDeleted > 0) {
    console.log(`🗑️  Deleted ${rendersDeleted} related pdf_renders`);
  }

  // Now delete the templates
  const deleted = await knex('pdf_templates')
    .whereIn('id', templateIds)
    .delete();

  console.log(`✅ Successfully removed ${deleted} PDF template starters`);
}

export async function down(knex: Knex): Promise<void> {
  console.log(
    '⚠️  Migration rollback: Templates were removed. Please re-run seed 007_pdf_template_starters to restore them.',
  );
}
