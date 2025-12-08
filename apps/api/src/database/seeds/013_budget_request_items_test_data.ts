import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // 🛡️ PRODUCTION SAFETY: Skip in production
  const isDevelopment =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  if (!isDevelopment) {
    console.log('⏭️  [PROD] Skipping budget_request_items seed');
    return;
  }

  console.log('🌱 [DEV] Seeding budget_request_items test data...');

  // Set search path to inventory schema
  await knex.raw(`SET search_path TO inventory, public`);

  // Get sample budget request (DRAFT status)
  const budgetRequest = await knex('inventory.budget_requests')
    .where({ status: 'DRAFT' })
    .first();

  if (!budgetRequest) {
    console.log('⚠️  [DEV] No DRAFT budget request found, skipping seed');
    return;
  }

  // Get sample drug generics
  const drugGenerics = await knex('inventory.drug_generics')
    .select('id', 'generic_code', 'generic_name', 'package_size', 'unit')
    .limit(10);

  if (drugGenerics.length === 0) {
    console.log('⚠️  [DEV] No drug generics found, skipping seed');
    return;
  }

  // Clear existing items for this budget request
  await knex('inventory.budget_request_items')
    .where({ budget_request_id: budgetRequest.id })
    .del();

  console.log(`✨ Creating test items for Budget Request #${budgetRequest.id}`);

  // Create test budget request items with diverse scenarios
  const budgetRequestItems = drugGenerics.map((generic, index) => {
    const lineNumber = index + 1;
    const requestedQty = 1000 + index * 500; // 1000, 1500, 2000, etc.
    const unitPrice = 10 + index * 5; // 10, 15, 20, etc.
    const requestedAmount = requestedQty * unitPrice;

    // Quarterly distribution (25% each)
    const q1Qty = Math.round(requestedQty * 0.25);
    const q2Qty = Math.round(requestedQty * 0.25);
    const q3Qty = Math.round(requestedQty * 0.25);
    const q4Qty = requestedQty - (q1Qty + q2Qty + q3Qty); // Remaining

    // Historical usage data (JSONB) - 3 years of data
    const historicalUsage = {
      '2566': 800 + index * 400, // 800, 1200, 1600, etc.
      '2567': 900 + index * 450, // 900, 1350, 1800, etc.
      '2568': 950 + index * 475, // 950, 1425, 1900, etc.
    };

    // Calculate average usage from historical data
    const avgUsage =
      (historicalUsage['2566'] +
        historicalUsage['2567'] +
        historicalUsage['2568']) /
      3;

    return {
      budget_request_id: budgetRequest.id,
      budget_id: 1,
      generic_id: generic.id,
      generic_code: generic.generic_code,
      generic_name: generic.generic_name,
      package_size: generic.package_size || '',
      unit: generic.unit || 'unit',
      line_number: lineNumber,
      historical_usage: JSON.stringify(historicalUsage),
      avg_usage: Math.round(avgUsage),
      requested_qty: requestedQty,
      unit_price: unitPrice,
      requested_amount: requestedAmount,
      budget_qty: requestedQty,
      fund_qty: requestedQty,
      q1_qty: q1Qty,
      q2_qty: q2Qty,
      q3_qty: q3Qty,
      q4_qty: q4Qty,
      item_justification: `Test justification for ${generic.generic_name}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
  });

  // Insert budget request items
  await knex('inventory.budget_request_items').insert(budgetRequestItems);

  console.log(
    `✅ [DEV] Successfully created ${budgetRequestItems.length} budget request items`,
  );
  console.log(`   Budget Request ID: ${budgetRequest.id}`);
  console.log(`   Items with historical usage (2566-2568)`);
  console.log(`   Quarterly distribution calculated (Q1-Q4)`);
}
