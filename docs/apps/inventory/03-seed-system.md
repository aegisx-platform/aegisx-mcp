# Seed System Design

> **Enterprise-grade seed patterns for multi-site deployments**

This document defines the standard patterns for database seeding in the AegisX platform. These patterns support 100+ customer site deployments with safe re-runs and data preservation.

## Core Principles

### 1. Knex Native Seeds

Use Knex's built-in seed system instead of standalone scripts:

```typescript
// ✅ CORRECT: Knex seed file
import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Seed logic here
}

// ❌ WRONG: Standalone script with imports
import { SeedRunner } from './seed-runner';
```

**Why Knex native?**

- No circular dependency issues
- Consistent with migration patterns
- Works with `knex seed:run` command
- Proper transaction handling

### 2. Upsert Pattern (INSERT ON CONFLICT)

All seeds must be **safe to re-run** without data loss:

```typescript
// ✅ CORRECT: Upsert pattern - safe to re-run
await knex.raw(
  `
  INSERT INTO inventory.budget_types (type_code, type_name, budget_class, is_active, created_at, updated_at)
  VALUES (?, ?, ?::inventory.budget_class, true, NOW(), NOW())
  ON CONFLICT (type_code) DO UPDATE SET
    type_name = EXCLUDED.type_name,
    budget_class = EXCLUDED.budget_class,
    updated_at = NOW()
`,
  [item.type_code, item.type_name, item.budget_class],
);

// ❌ WRONG: Delete then insert - loses customer customizations
await knex('inventory.budget_types').del();
await knex('inventory.budget_types').insert(data);
```

### 3. Schema Prefix Required

Always use explicit schema prefix:

```typescript
// ✅ CORRECT: Explicit schema
await knex.raw(`SET search_path TO inventory, public`);
await knex.raw(`INSERT INTO inventory.budget_types ...`);

// ❌ WRONG: Relies on search_path
await knex('budget_types').insert(data); // Goes to public!
```

### 4. Enum Casting

PostgreSQL enums must be cast explicitly:

```typescript
// ✅ CORRECT: Cast to enum type
await knex.raw(
  `
  INSERT INTO inventory.budget_types (budget_class)
  VALUES (?::inventory.budget_class)
`,
  ['OPERATIONAL'],
);

// ❌ WRONG: No casting
await knex.raw(
  `
  INSERT INTO inventory.budget_types (budget_class)
  VALUES (?)
`,
  ['OPERATIONAL'],
); // Error: invalid input for enum
```

## Directory Structure

```
apps/api/src/database/
├── seeds/                      # Core platform seeds
│   └── 001_initial_data.ts
├── seeds-inventory/            # Inventory module seeds
│   └── 001_reference_data.ts   # Single consolidated seed file
└── scripts/                    # Standalone utility scripts
    ├── analyze-indexes.ts      # Database analysis
    └── inventory-import-tmt.ts # TMT data import
```

**Key Design Decisions:**

1. **Single consolidated seed file** - Easier to manage dependencies between tables
2. **No nested modules in seeds** - Prevents circular dependencies
3. **Scripts separate from seeds** - Different execution patterns

## Seed File Template

```typescript
import type { Knex } from 'knex';

// =====================================================
// Reference Data Constants
// =====================================================

const BUDGET_TYPES = [
  { type_code: 'OPD', type_name: 'เงินบำรุง (OPD)', budget_class: 'OPERATIONAL' },
  { type_code: 'NHSO', type_name: 'สปสช. (NHSO)', budget_class: 'OPERATIONAL' },
  // ... more data
];

const DOSAGE_FORMS = [
  { form_code: 'TAB', form_name: 'ยาเม็ด', form_name_en: 'Tablet' },
  // ... more data
];

// =====================================================
// Seed Function
// =====================================================

export async function seed(knex: Knex): Promise<void> {
  console.log('🌱 Seeding inventory reference data...\n');

  // Set search path for this session
  await knex.raw(`SET search_path TO inventory, public`);

  // Seed each table
  await seedBudgetTypes(knex);
  await seedDosageForms(knex);
  // ... more tables

  console.log('\n✅ Seed completed successfully!');
}

// =====================================================
// Individual Seed Functions
// =====================================================

async function seedBudgetTypes(knex: Knex): Promise<void> {
  console.log('  📋 Seeding budget_types...');

  for (const item of BUDGET_TYPES) {
    await knex.raw(
      `
      INSERT INTO inventory.budget_types (type_code, type_name, budget_class, is_active, created_at, updated_at)
      VALUES (?, ?, ?::inventory.budget_class, true, NOW(), NOW())
      ON CONFLICT (type_code) DO UPDATE SET
        type_name = EXCLUDED.type_name,
        budget_class = EXCLUDED.budget_class,
        updated_at = NOW()
    `,
      [item.type_code, item.type_name, item.budget_class],
    );
  }

  console.log(`    ✓ ${BUDGET_TYPES.length} budget types`);
}
```

## Data Categories

### Reference Data (Seeded)

Static data that rarely changes, seeded with the system:

| Table               | Count | Description      |
| ------------------- | ----- | ---------------- |
| `budget_types`      | 9     | ประเภทงบประมาณ   |
| `budget_categories` | 6     | หมวดหมู่งบประมาณ |
| `dosage_forms`      | 28    | รูปแบบยา         |
| `drug_units`        | 30    | หน่วยนับยา       |
| `locations`         | 10    | คลังยาและสถานที่ |
| `companies`         | 8     | บริษัทยาหลัก     |

### Dynamic Data (Not Seeded)

Data entered by users, not touched by seeds:

- `drugs` - Hospital-specific drug list
- `drug_generics` - Generic name mappings
- `inventory` - Current stock levels
- `purchase_orders` - Procurement documents
- All transaction tables

### TMT Data (Imported Separately)

Thai Medical Terminology data imported via separate script:

```bash
# Import TMT data (when available)
pnpm run inventory:import-tmt -- --path=/path/to/tmt
```

## Seed Data: Thai Hospital Reference

### Budget Types (9 records)

```typescript
const BUDGET_TYPES = [
  // Operational budgets
  { type_code: 'OPD', type_name: 'เงินบำรุง (OPD)', budget_class: 'OPERATIONAL' },
  { type_code: 'NHSO', type_name: 'สปสช. (NHSO)', budget_class: 'OPERATIONAL' },
  { type_code: 'UC', type_name: 'บัตรทอง (UC)', budget_class: 'OPERATIONAL' },
  { type_code: 'SSO', type_name: 'ประกันสังคม (SSO)', budget_class: 'OPERATIONAL' },
  { type_code: 'CSMBS', type_name: 'ข้าราชการ (CSMBS)', budget_class: 'OPERATIONAL' },

  // Investment budget
  { type_code: 'GOV', type_name: 'เงินงบประมาณ', budget_class: 'INVESTMENT' },

  // Emergency budget
  { type_code: 'EMRG', type_name: 'งบฉุกเฉิน', budget_class: 'EMERGENCY' },

  // Research budget
  { type_code: 'RES', type_name: 'งบวิจัย', budget_class: 'RESEARCH' },

  // Donation
  { type_code: 'DONA', type_name: 'เงินบริจาค', budget_class: 'OPERATIONAL' },
];
```

### Dosage Forms (28 records)

Common pharmaceutical forms used in Thai hospitals:

```typescript
const DOSAGE_FORMS = [
  // Solid forms
  { form_code: 'TAB', form_name: 'ยาเม็ด', form_name_en: 'Tablet' },
  { form_code: 'CAP', form_name: 'ยาแคปซูล', form_name_en: 'Capsule' },
  { form_code: 'PWD', form_name: 'ยาผง', form_name_en: 'Powder' },
  { form_code: 'GRN', form_name: 'ยาเม็ดแกรนูล', form_name_en: 'Granule' },
  { form_code: 'LOZ', form_name: 'ยาอม', form_name_en: 'Lozenge' },

  // Liquid forms
  { form_code: 'SYR', form_name: 'ยาน้ำเชื่อม', form_name_en: 'Syrup' },
  { form_code: 'SUS', form_name: 'ยาแขวนตะกอน', form_name_en: 'Suspension' },
  { form_code: 'SOL', form_name: 'ยาสารละลาย', form_name_en: 'Solution' },
  { form_code: 'ELX', form_name: 'ยาอิลิกเซอร์', form_name_en: 'Elixir' },
  { form_code: 'EMU', form_name: 'ยาอิมัลชัน', form_name_en: 'Emulsion' },

  // Injectable forms
  { form_code: 'INJ', form_name: 'ยาฉีด', form_name_en: 'Injection' },
  { form_code: 'INF', form_name: 'ยาฉีดเข้าหลอดเลือด', form_name_en: 'Infusion' },

  // Topical forms
  { form_code: 'CRM', form_name: 'ยาครีม', form_name_en: 'Cream' },
  { form_code: 'OIN', form_name: 'ยาขี้ผึ้ง', form_name_en: 'Ointment' },
  { form_code: 'GEL', form_name: 'ยาเจล', form_name_en: 'Gel' },
  { form_code: 'LOT', form_name: 'ยาโลชั่น', form_name_en: 'Lotion' },

  // Eye/Ear/Nose
  { form_code: 'EYD', form_name: 'ยาหยอดตา', form_name_en: 'Eye drops' },
  { form_code: 'EYO', form_name: 'ยาป้ายตา', form_name_en: 'Eye ointment' },
  { form_code: 'EAD', form_name: 'ยาหยอดหู', form_name_en: 'Ear drops' },
  { form_code: 'NSD', form_name: 'ยาหยอดจมูก', form_name_en: 'Nasal drops' },
  { form_code: 'NSS', form_name: 'ยาพ่นจมูก', form_name_en: 'Nasal spray' },

  // Respiratory forms
  { form_code: 'INH', form_name: 'ยาสูดพ่น', form_name_en: 'Inhaler' },
  { form_code: 'NEB', form_name: 'ยาพ่นละออง', form_name_en: 'Nebulizer solution' },

  // Rectal/Vaginal forms
  { form_code: 'SUP', form_name: 'ยาเหน็บทวาร', form_name_en: 'Suppository' },
  { form_code: 'VAG', form_name: 'ยาเหน็บช่องคลอด', form_name_en: 'Vaginal tablet' },
  { form_code: 'ENE', form_name: 'ยาสวนทวาร', form_name_en: 'Enema' },

  // Special forms
  { form_code: 'PAT', form_name: 'ยาแผ่นแปะ', form_name_en: 'Patch' },
  { form_code: 'IMP', form_name: 'ยาฝัง', form_name_en: 'Implant' },
];
```

### Drug Units (30 records)

Measurement units categorized by type:

```typescript
const DRUG_UNITS = [
  // Weight units
  { unit_code: 'MG', unit_name: 'มิลลิกรัม', unit_name_en: 'Milligram', unit_type: 'WEIGHT' },
  { unit_code: 'G', unit_name: 'กรัม', unit_name_en: 'Gram', unit_type: 'WEIGHT' },
  { unit_code: 'KG', unit_name: 'กิโลกรัม', unit_name_en: 'Kilogram', unit_type: 'WEIGHT' },
  { unit_code: 'MCG', unit_name: 'ไมโครกรัม', unit_name_en: 'Microgram', unit_type: 'WEIGHT' },

  // Volume units
  { unit_code: 'ML', unit_name: 'มิลลิลิตร', unit_name_en: 'Milliliter', unit_type: 'VOLUME' },
  { unit_code: 'L', unit_name: 'ลิตร', unit_name_en: 'Liter', unit_type: 'VOLUME' },
  { unit_code: 'CC', unit_name: 'ซีซี', unit_name_en: 'Cubic centimeter', unit_type: 'VOLUME' },

  // Quantity units
  { unit_code: 'TAB', unit_name: 'เม็ด', unit_name_en: 'Tablet', unit_type: 'QUANTITY' },
  { unit_code: 'CAP', unit_name: 'แคปซูล', unit_name_en: 'Capsule', unit_type: 'QUANTITY' },
  { unit_code: 'AMP', unit_name: 'แอมพูล', unit_name_en: 'Ampoule', unit_type: 'QUANTITY' },
  { unit_code: 'VIAL', unit_name: 'ไวแอล', unit_name_en: 'Vial', unit_type: 'QUANTITY' },
  { unit_code: 'BTL', unit_name: 'ขวด', unit_name_en: 'Bottle', unit_type: 'QUANTITY' },
  { unit_code: 'TUBE', unit_name: 'หลอด', unit_name_en: 'Tube', unit_type: 'QUANTITY' },
  { unit_code: 'BOX', unit_name: 'กล่อง', unit_name_en: 'Box', unit_type: 'QUANTITY' },
  { unit_code: 'PACK', unit_name: 'แพ็ค', unit_name_en: 'Pack', unit_type: 'QUANTITY' },
  { unit_code: 'STRIP', unit_name: 'แผง', unit_name_en: 'Strip', unit_type: 'QUANTITY' },
  { unit_code: 'BLST', unit_name: 'บลิสเตอร์', unit_name_en: 'Blister', unit_type: 'QUANTITY' },
  { unit_code: 'BAG', unit_name: 'ถุง', unit_name_en: 'Bag', unit_type: 'QUANTITY' },
  { unit_code: 'SACHET', unit_name: 'ซอง', unit_name_en: 'Sachet', unit_type: 'QUANTITY' },
  { unit_code: 'SET', unit_name: 'ชุด', unit_name_en: 'Set', unit_type: 'QUANTITY' },
  { unit_code: 'DOSE', unit_name: 'โดส', unit_name_en: 'Dose', unit_type: 'QUANTITY' },
  { unit_code: 'PUFF', unit_name: 'พัฟ', unit_name_en: 'Puff', unit_type: 'QUANTITY' },
  { unit_code: 'DROP', unit_name: 'หยด', unit_name_en: 'Drop', unit_type: 'QUANTITY' },
  { unit_code: 'SPRAY', unit_name: 'สเปรย์', unit_name_en: 'Spray', unit_type: 'QUANTITY' },
  { unit_code: 'PC', unit_name: 'ชิ้น', unit_name_en: 'Piece', unit_type: 'QUANTITY' },

  // Potency units
  { unit_code: 'IU', unit_name: 'หน่วยสากล', unit_name_en: 'International Unit', unit_type: 'POTENCY' },
  { unit_code: 'MIU', unit_name: 'ล้านหน่วย', unit_name_en: 'Million IU', unit_type: 'POTENCY' },
  { unit_code: 'UNIT', unit_name: 'ยูนิต', unit_name_en: 'Unit', unit_type: 'POTENCY' },
  { unit_code: 'MEQ', unit_name: 'มิลลิอิควิวาเลนท์', unit_name_en: 'Milliequivalent', unit_type: 'POTENCY' },
  { unit_code: 'MMOL', unit_name: 'มิลลิโมล', unit_name_en: 'Millimole', unit_type: 'POTENCY' },
];
```

### Locations (10 records)

Hospital storage locations:

```typescript
const LOCATIONS = [
  // Main warehouse
  { location_code: 'WH-MAIN', location_name: 'คลังยาหลัก', location_type: 'WAREHOUSE' },
  { location_code: 'WH-COLD', location_name: 'คลังยาควบคุมอุณหภูมิ', location_type: 'WAREHOUSE' },

  // Pharmacies
  { location_code: 'PH-OPD', location_name: 'ห้องยา OPD', location_type: 'PHARMACY' },
  { location_code: 'PH-IPD', location_name: 'ห้องยา IPD', location_type: 'PHARMACY' },

  // Clinical areas
  { location_code: 'ER', location_name: 'ห้องฉุกเฉิน', location_type: 'EMERGENCY' },
  { location_code: 'OR', location_name: 'ห้องผ่าตัด', location_type: 'OPERATING' },
  { location_code: 'ICU-1', location_name: 'ไอซียู 1', location_type: 'ICU' },

  // Wards
  { location_code: 'WARD-MED', location_name: 'หอผู้ป่วยอายุรกรรม', location_type: 'WARD' },
  { location_code: 'WARD-SUR', location_name: 'หอผู้ป่วยศัลยกรรม', location_type: 'WARD' },

  // Quarantine
  { location_code: 'QA-ZONE', location_name: 'พื้นที่กักกันยา', location_type: 'QUARANTINE' },
];
```

### Companies (8 records)

Major pharmaceutical companies in Thailand:

```typescript
const COMPANIES = [
  { company_code: 'GPO', company_name: 'องค์การเภสัชกรรม' },
  { company_code: 'BERLIN', company_name: 'บริษัท เบอร์ลินฟาร์มาซูติคอล จำกัด' },
  { company_code: 'SIAM', company_name: 'บริษัท สยามฟาร์มาซูติคอล จำกัด' },
  { company_code: 'BIOLAB', company_name: 'บริษัท ไบโอแลป จำกัด' },
  { company_code: 'ATLANTIC', company_name: 'บริษัท แอตแลนติก จำกัด' },
  { company_code: 'MEGA', company_name: 'บริษัท เมก้า ไลฟ์ไซแอ็นซ์ จำกัด (มหาชน)' },
  { company_code: 'ANB', company_name: 'บริษัท เอ.เอ็น.บี. ลาบอราตอรี่ จำกัด' },
  { company_code: 'OSOT', company_name: 'บริษัท โอสถสภา จำกัด (มหาชน)' },
];
```

## Multi-Site Deployment Flow

### Initial Installation (New Site)

```bash
# 1. Run core platform migrations and seeds
pnpm run db:migrate
pnpm run db:seed

# 2. Run inventory module setup
pnpm run inventory:setup
# This runs: db:migrate:inventory && db:seed:inventory

# 3. Verify seed data
psql -c "SELECT COUNT(*) FROM inventory.budget_types;"
# Expected: 9
```

### Upgrades (Existing Site)

```bash
# 1. Run new migrations (if any)
pnpm run db:migrate:inventory

# 2. Re-run seeds (safe with upsert)
pnpm run db:seed:inventory
# - Adds any new reference data
# - Updates existing records
# - Preserves customer customizations
```

### Data Verification

```bash
# Check seed counts
psql -d aegisx_db -c "
  SELECT 'budget_types' as table_name, COUNT(*) as count FROM inventory.budget_types
  UNION ALL
  SELECT 'budget_categories', COUNT(*) FROM inventory.budget_categories
  UNION ALL
  SELECT 'dosage_forms', COUNT(*) FROM inventory.dosage_forms
  UNION ALL
  SELECT 'drug_units', COUNT(*) FROM inventory.drug_units
  UNION ALL
  SELECT 'locations', COUNT(*) FROM inventory.locations
  UNION ALL
  SELECT 'companies', COUNT(*) FROM inventory.companies
  ORDER BY table_name;
"
```

Expected output:

```
    table_name     | count
-------------------+-------
 budget_categories |     6
 budget_types      |     9
 companies         |     8
 dosage_forms      |    28
 drug_units        |    30
 locations         |    10
```

## Adding New Reference Data

### When to Add Seeds

- New budget types for specific programs
- New dosage forms for new drug types
- New locations for hospital expansion
- New vendor companies

### How to Add

1. **Add to constant array:**

```typescript
const BUDGET_TYPES = [
  // ... existing entries ...
  { type_code: 'NEW', type_name: 'งบใหม่', budget_class: 'OPERATIONAL' },
];
```

2. **Test locally:**

```bash
pnpm run db:seed:inventory
```

3. **Commit and deploy:**

```bash
git add apps/api/src/database/seeds-inventory/001_reference_data.ts
git commit -m "feat(inventory): add NEW budget type"
```

4. **Run on all sites during upgrade:**

Seeds are automatically run during upgrade process.

## Troubleshooting

### Column Not Found Error

```
error: column "code" of relation "budget_types" does not exist
```

**Solution:** Check actual database schema with:

```sql
\d inventory.budget_types
```

Use correct column names in seed file.

### Enum Cast Error

```
error: invalid input value for enum inventory.budget_class
```

**Solution:** Use explicit casting:

```typescript
await knex.raw(`... ?::inventory.budget_class ...`, ['OPERATIONAL']);
```

### Circular Dependency Error

```
ERR_REQUIRE_CYCLE_MODULE: Circular dependency
```

**Solution:**

- Don't import modules in seed files
- Use Knex native seed format
- Keep seed files self-contained

### Module Not Found Error

```
ERR_MODULE_NOT_FOUND: Cannot find module
```

**Solution:**

- Remove `index.ts` from seeds directory
- Don't create complex module structures in seeds
- Keep seeds as simple Knex seed files
