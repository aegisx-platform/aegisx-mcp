# Phase 2: Data Migration

**Status**: NOT_STARTED
**Depends on**: Phase 1 Complete
**Source**: `invs_modern_full.sql.gz` (~101,000 records)

---

## Strategy

1. Import SQL backup ไปที่ temp database `inventory_temp`
2. สร้าง seed scripts ดึงข้อมูลจาก temp → `inventory` schema
3. Validate data integrity

---

## Data Volume

| System       | Tables | Records      | Priority |
| ------------ | ------ | ------------ | -------- |
| Master Data  | 18     | 9,473        | P1       |
| Budget       | 5      | 1,722        | P2       |
| Procurement  | 15     | 38           | P3       |
| Inventory    | 3      | 13,138       | P2       |
| Distribution | 3      | 2            | P4       |
| Return       | 4      | 27           | P4       |
| TMT          | 7      | 76,904       | P3       |
| HPP          | 2      | 0            | P5       |
| **Total**    | **57** | **~101,000** | -        |

---

## Tasks

### 2.1 Setup Temp Database

```bash
# Already done in Phase 0, verify data exists
psql -p 5482 inventory_temp -c "\dt"
```

- [ ] Verify temp database has data
- [ ] Count records in key tables
- [ ] Note table name mappings (if different from target)

---

### 2.2 Seed Master Data (Priority 1)

**Seed File**: `seeds-inventory/001_master_data.ts`

| Table             | Source Table      | Records | Status |
| ----------------- | ----------------- | ------- | ------ |
| locations         | locations         | 96      | [ ]    |
| departments       | departments       | 108     | [ ]    |
| budget_types      | budget_types      | 3       | [ ]    |
| budget_categories | budget_categories | 3       | [ ]    |
| budgets           | budgets           | 2       | [ ]    |
| bank              | bank              | 5       | [ ]    |
| companies         | companies         | 800     | [ ]    |
| dosage_forms      | dosage_form       | 107     | [ ]    |
| drug_units        | sale_unit         | 88      | [ ]    |

---

### 2.3 Seed Drug Data (Priority 1)

**Seed File**: `seeds-inventory/002_drug_data.ts`

| Table            | Source Table  | Records | Status |
| ---------------- | ------------- | ------- | ------ |
| drug_generics    | drug_generics | 1,109   | [ ]    |
| drugs            | drugs         | 7,261   | [ ]    |
| drug_components  | drug_compos   | 736     | [ ]    |
| drug_focus_lists | focus_list    | 62      | [ ]    |
| drug_pack_ratios | pack_ratio    | 1,266   | [ ]    |

---

### 2.4 Seed Lookup Data (Priority 2)

**Seed File**: `seeds-inventory/003_lookup_data.ts`

| Table              | Source     | Records | Status |
| ------------------ | ---------- | ------- | ------ |
| adjustment_reasons | (new)      | 10      | [ ]    |
| hospitals          | hosp       | 13,176  | [ ]    |
| return_actions     | rtn_action | 8       | [ ]    |
| purchase_methods   | buymethod  | 18      | [ ]    |
| purchase_types     | buycommon  | 20      | [ ]    |
| return_reasons     | rtn_reason | 19      | [ ]    |
| distribution_types | dist_type  | 2       | [ ]    |

---

### 2.5 Seed TMT Data (Priority 3)

**Seed File**: `seeds-inventory/004_tmt_data.ts`

| Table             | Source            | Records | Status |
| ----------------- | ----------------- | ------- | ------ |
| tmt_concepts      | tmt_concepts      | 76,904  | [ ]    |
| tmt_relationships | tmt_relationships | TBD     | [ ]    |
| tmt_mappings      | tmt_mappings      | TBD     | [ ]    |

**Note**: TMT data is large, may need batch import

---

### 2.6 Seed Budget Data (Priority 2)

**Seed File**: `seeds-inventory/005_budget_data.ts`

| Table              | Records | Status |
| ------------------ | ------- | ------ |
| budget_allocations | 4       | [ ]    |
| budget_plans       | 3       | [ ]    |
| budget_plan_items  | 1,710   | [ ]    |

---

### 2.7 Seed Inventory Data (Priority 2)

**Seed File**: `seeds-inventory/006_inventory_data.ts`

| Table     | Records | Status |
| --------- | ------- | ------ |
| inventory | 7,105   | [ ]    |
| drug_lots | 6,033   | [ ]    |

---

### 2.8 Validate Data Integrity

**Validation Queries**:

```sql
-- Check record counts
SELECT 'drugs' as table_name, COUNT(*) FROM inventory.drugs
UNION ALL
SELECT 'drug_generics', COUNT(*) FROM inventory.drug_generics
UNION ALL
SELECT 'companies', COUNT(*) FROM inventory.companies
UNION ALL
SELECT 'tmt_concepts', COUNT(*) FROM inventory.tmt_concepts;

-- Check foreign key integrity
SELECT d.id, d.drug_code
FROM inventory.drugs d
LEFT JOIN inventory.drug_generics g ON d.generic_id = g.id
WHERE d.generic_id IS NOT NULL AND g.id IS NULL;

-- Check for orphan records
SELECT COUNT(*) as orphan_count
FROM inventory.inventory i
LEFT JOIN inventory.drugs d ON i.drug_id = d.id
WHERE d.id IS NULL;
```

**Checklist**:

- [ ] Run record count validation
- [ ] Run FK integrity checks
- [ ] Run orphan record checks
- [ ] Compare counts with source database
- [ ] Document any discrepancies

---

## Seed Script Template

```typescript
// seeds-inventory/001_master_data.ts
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('inventory.locations').del();

  // Insert from temp database
  await knex.raw(`
    INSERT INTO inventory.locations (
      id, location_code, location_name, location_type,
      parent_id, address, responsible_person, is_active, created_at
    )
    SELECT
      id, location_code, location_name, location_type,
      parent_id, address, responsible_person, is_active, created_at
    FROM inventory_temp.public.locations
  `);

  // Reset sequence
  await knex.raw(`
    SELECT setval('inventory.locations_id_seq',
      (SELECT MAX(id) FROM inventory.locations))
  `);
}
```

---

## Run Seeds

```bash
# Run all inventory seeds
pnpm run db:seed:inventory

# Run specific seed
pnpm run db:seed:inventory --specific=001_master_data.ts
```

---

## Completion Criteria

- [ ] All seed files created (6 files)
- [ ] All seeds run successfully
- [ ] Record counts match source
- [ ] FK integrity verified
- [ ] No orphan records
- [ ] Sequences reset correctly

---

## Next Phase

After completing Phase 2, proceed to [Phase 3: Backend APIs](./PHASE_3_BACKEND.md)

---

_Created: 2024-12-05_
