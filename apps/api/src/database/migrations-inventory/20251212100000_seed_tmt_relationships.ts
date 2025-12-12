import type { Knex } from 'knex';

/**
 * TMT Relationships Seed Migration
 *
 * Populates tmt_relationships table by inferring parent-child relationships
 * from TMT concept naming patterns.
 *
 * Hierarchy (Generic path):
 *   VTM (Virtual Therapeutic Moiety) - สารออกฤทธิ์
 *     ↓ IS_A
 *   GP (Generic Product) - ยาสามัญ (VTM + strength + dosage form)
 *     ↓ IS_A
 *   GPU (Generic Product Unit) - ยาสามัญ+หน่วย (GP + unit packaging)
 *
 * Hierarchy (Trade path):
 *   TP (Trade Product) - ยาการค้า (Brand name)
 *     ↓ IS_A
 *   TPU (Trade Product Unit) - ยาการค้า+หน่วย (TP + unit packaging)
 *
 * Pattern matching:
 *   - VTM → GP: GP.fsn starts with VTM.fsn + " " (e.g., "paracetamol" → "paracetamol 500 mg tablet")
 *   - GP → GPU: GPU.fsn starts with GP.fsn + ", " (e.g., "paracetamol 500 mg tablet" → "paracetamol 500 mg tablet, 1 tablet")
 *   - TP → TPU: TPU.fsn starts with TP.fsn + ", "
 *
 * Note: GPU ↔ TP cross-linking is complex and may be added in future versions.
 */
export async function up(knex: Knex): Promise<void> {
  console.log('🔗 Seeding TMT relationships by inference...');

  // Clear existing relationships
  await knex.raw('TRUNCATE inventory.tmt_relationships CASCADE');

  // Disable triggers for bulk insert
  await knex.raw('SET session_replication_role = replica');

  // 1. VTM → GP relationships (single substance match)
  console.log('  📌 Creating VTM → GP relationships...');
  const vtmToGpResult = await knex.raw(`
    INSERT INTO inventory.tmt_relationships (parent_id, child_id, relationship_type, is_active)
    SELECT DISTINCT
      v.id as parent_id,
      g.id as child_id,
      'IS_A'::inventory.tmt_relation_type,
      true
    FROM inventory.tmt_concepts v
    JOIN inventory.tmt_concepts g ON
      g.level = 'GP' AND
      g.fsn LIKE v.fsn || ' %' AND
      -- Avoid matching combinations when VTM is single substance
      (v.fsn LIKE '%+%' OR g.fsn NOT LIKE '%+%')
    WHERE v.level = 'VTM' AND v.is_active = true
    ON CONFLICT (parent_id, child_id, relationship_type) DO NOTHING
  `);
  console.log(
    `     ✅ VTM → GP: ${vtmToGpResult.rowCount || 0} relationships created`,
  );

  // 2. GP → GPU relationships
  console.log('  📌 Creating GP → GPU relationships...');
  const gpToGpuResult = await knex.raw(`
    INSERT INTO inventory.tmt_relationships (parent_id, child_id, relationship_type, is_active)
    SELECT DISTINCT
      g.id as parent_id,
      u.id as child_id,
      'IS_A'::inventory.tmt_relation_type,
      true
    FROM inventory.tmt_concepts g
    JOIN inventory.tmt_concepts u ON
      u.level = 'GPU' AND
      u.fsn LIKE g.fsn || ', %'
    WHERE g.level = 'GP' AND g.is_active = true
    ON CONFLICT (parent_id, child_id, relationship_type) DO NOTHING
  `);
  console.log(
    `     ✅ GP → GPU: ${gpToGpuResult.rowCount || 0} relationships created`,
  );

  // 3. TP → TPU relationships
  console.log('  📌 Creating TP → TPU relationships...');
  const tpToTpuResult = await knex.raw(`
    INSERT INTO inventory.tmt_relationships (parent_id, child_id, relationship_type, is_active)
    SELECT DISTINCT
      tp.id as parent_id,
      tpu.id as child_id,
      'IS_A'::inventory.tmt_relation_type,
      true
    FROM inventory.tmt_concepts tp
    JOIN inventory.tmt_concepts tpu ON
      tpu.level = 'TPU' AND
      tpu.fsn LIKE tp.fsn || ', %'
    WHERE tp.level = 'TP' AND tp.is_active = true
    ON CONFLICT (parent_id, child_id, relationship_type) DO NOTHING
  `);
  console.log(
    `     ✅ TP → TPU: ${tpToTpuResult.rowCount || 0} relationships created`,
  );

  // Re-enable triggers
  await knex.raw('SET session_replication_role = DEFAULT');

  // Summary
  const totalCount = await knex('inventory.tmt_relationships')
    .count('* as count')
    .first();

  const byType = await knex.raw(`
    SELECT
      p.level as parent_level,
      c.level as child_level,
      COUNT(*) as count
    FROM inventory.tmt_relationships r
    JOIN inventory.tmt_concepts p ON p.id = r.parent_id
    JOIN inventory.tmt_concepts c ON c.id = r.child_id
    GROUP BY p.level, c.level
    ORDER BY p.level, c.level
  `);

  console.log('\n📊 TMT Relationships Summary:');
  console.log(`   Total relationships: ${totalCount?.count}`);
  console.log('   By type:');
  for (const row of byType.rows) {
    console.log(`     ${row.parent_level} → ${row.child_level}: ${row.count}`);
  }
  console.log('');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🗑️  Clearing TMT relationships...');
  await knex.raw('TRUNCATE inventory.tmt_relationships CASCADE');
  console.log('✅ TMT relationships cleared');
}
