/**
 * Inventory Reference Data Seed
 *
 * Seeds all reference data for the inventory system matching the actual schema:
 * - Budget Types (type_code, type_name, budget_class)
 * - Budget Categories (category_code, category_name)
 * - Dosage Forms (form_code, form_name, form_name_en)
 * - Drug Units (unit_code, unit_name, unit_name_en, unit_type)
 * - Locations (location_code, location_name, location_type)
 * - Companies (company_code, company_name, is_vendor, is_manufacturer)
 *
 * Uses upsert pattern to safely re-run on upgrades.
 */

import type { Knex } from 'knex';

// ============================================================================
// Reference Data Definitions (matching actual schema)
// ============================================================================

// budget_class enum: OPERATIONAL, INVESTMENT, EMERGENCY, RESEARCH
const BUDGET_TYPES = [
  {
    type_code: 'OPD',
    type_name: 'เงินบำรุง (OPD)',
    budget_class: 'OPERATIONAL',
  },
  { type_code: 'NHSO', type_name: 'สปสช. (NHSO)', budget_class: 'OPERATIONAL' },
  {
    type_code: 'UC',
    type_name: 'หลักประกันสุขภาพถ้วนหน้า (UC)',
    budget_class: 'OPERATIONAL',
  },
  {
    type_code: 'LGO',
    type_name: 'องค์กรปกครองส่วนท้องถิ่น (อปท.)',
    budget_class: 'OPERATIONAL',
  },
  {
    type_code: 'SSO',
    type_name: 'ประกันสังคม (สปส.)',
    budget_class: 'OPERATIONAL',
  },
  {
    type_code: 'GOV',
    type_name: 'ข้าราชการ/รัฐวิสาหกิจ',
    budget_class: 'OPERATIONAL',
  },
  { type_code: 'EMG', type_name: 'งบฉุกเฉิน', budget_class: 'EMERGENCY' },
  { type_code: 'INV', type_name: 'งบลงทุน', budget_class: 'INVESTMENT' },
  { type_code: 'RES', type_name: 'งบวิจัย', budget_class: 'RESEARCH' },
];

const BUDGET_CATEGORIES = [
  {
    category_code: 'DRUG',
    category_name: 'ยาและเวชภัณฑ์',
    accounting_code: '4101',
  },
  {
    category_code: 'MED_SUP',
    category_name: 'วัสดุการแพทย์',
    accounting_code: '4102',
  },
  { category_code: 'CHEM', category_name: 'สารเคมี', accounting_code: '4103' },
  {
    category_code: 'DENTAL',
    category_name: 'วัสดุทันตกรรม',
    accounting_code: '4104',
  },
  {
    category_code: 'LAB',
    category_name: 'วัสดุห้องปฏิบัติการ',
    accounting_code: '4105',
  },
  {
    category_code: 'XRAY',
    category_name: 'วัสดุเอกซเรย์',
    accounting_code: '4106',
  },
];

const DOSAGE_FORMS = [
  { form_code: 'TAB', form_name: 'ยาเม็ด', form_name_en: 'Tablet' },
  { form_code: 'CAP', form_name: 'ยาแคปซูล', form_name_en: 'Capsule' },
  { form_code: 'SYR', form_name: 'ยาน้ำเชื่อม', form_name_en: 'Syrup' },
  { form_code: 'SUSP', form_name: 'ยาแขวนตะกอน', form_name_en: 'Suspension' },
  { form_code: 'SOL', form_name: 'ยาสารละลาย', form_name_en: 'Solution' },
  { form_code: 'INJ', form_name: 'ยาฉีด', form_name_en: 'Injection' },
  { form_code: 'CREAM', form_name: 'ยาครีม', form_name_en: 'Cream' },
  { form_code: 'OINT', form_name: 'ยาขี้ผึ้ง', form_name_en: 'Ointment' },
  { form_code: 'GEL', form_name: 'ยาเจล', form_name_en: 'Gel' },
  { form_code: 'LOTION', form_name: 'ยาโลชั่น', form_name_en: 'Lotion' },
  { form_code: 'DROP', form_name: 'ยาหยอด', form_name_en: 'Eye/Ear Drop' },
  { form_code: 'SPRAY', form_name: 'ยาพ่น', form_name_en: 'Spray' },
  { form_code: 'INHALER', form_name: 'ยาสูดพ่น', form_name_en: 'Inhaler' },
  { form_code: 'SUPP', form_name: 'ยาเหน็บ', form_name_en: 'Suppository' },
  {
    form_code: 'PATCH',
    form_name: 'แผ่นแปะผิวหนัง',
    form_name_en: 'Transdermal Patch',
  },
  { form_code: 'POWDER', form_name: 'ยาผง', form_name_en: 'Powder' },
  { form_code: 'GRANULE', form_name: 'ยาเกล็ด', form_name_en: 'Granule' },
  {
    form_code: 'EFFER',
    form_name: 'ยาเม็ดฟู่',
    form_name_en: 'Effervescent Tablet',
  },
  {
    form_code: 'CHEW',
    form_name: 'ยาเม็ดเคี้ยว',
    form_name_en: 'Chewable Tablet',
  },
  {
    form_code: 'SUBLIN',
    form_name: 'ยาอมใต้ลิ้น',
    form_name_en: 'Sublingual Tablet',
  },
  { form_code: 'LOZ', form_name: 'ยาอม', form_name_en: 'Lozenge' },
  { form_code: 'ENEMA', form_name: 'ยาสวนทวาร', form_name_en: 'Enema' },
  { form_code: 'VAG', form_name: 'ยาสอดช่องคลอด', form_name_en: 'Vaginal' },
  {
    form_code: 'IV',
    form_name: 'สารน้ำให้ทางหลอดเลือด',
    form_name_en: 'IV Solution',
  },
  {
    form_code: 'NEB',
    form_name: 'ยาพ่นฝอย',
    form_name_en: 'Nebulizer Solution',
  },
  { form_code: 'PASTE', form_name: 'ยาพอก', form_name_en: 'Paste' },
  { form_code: 'SHAMP', form_name: 'ยาแชมพู', form_name_en: 'Shampoo' },
  { form_code: 'EMUL', form_name: 'ยาอิมัลชัน', form_name_en: 'Emulsion' },
];

// unit_type enum: WEIGHT, VOLUME, QUANTITY, POTENCY
const DRUG_UNITS = [
  {
    unit_code: 'TAB',
    unit_name: 'เม็ด',
    unit_name_en: 'Tablet(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'CAP',
    unit_name: 'แคปซูล',
    unit_name_en: 'Capsule(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'ML',
    unit_name: 'มิลลิลิตร',
    unit_name_en: 'Milliliter(s)',
    unit_type: 'VOLUME',
  },
  {
    unit_code: 'L',
    unit_name: 'ลิตร',
    unit_name_en: 'Liter(s)',
    unit_type: 'VOLUME',
  },
  {
    unit_code: 'G',
    unit_name: 'กรัม',
    unit_name_en: 'Gram(s)',
    unit_type: 'WEIGHT',
  },
  {
    unit_code: 'MG',
    unit_name: 'มิลลิกรัม',
    unit_name_en: 'Milligram(s)',
    unit_type: 'WEIGHT',
  },
  {
    unit_code: 'MCG',
    unit_name: 'ไมโครกรัม',
    unit_name_en: 'Microgram(s)',
    unit_type: 'WEIGHT',
  },
  {
    unit_code: 'KG',
    unit_name: 'กิโลกรัม',
    unit_name_en: 'Kilogram(s)',
    unit_type: 'WEIGHT',
  },
  {
    unit_code: 'AMP',
    unit_name: 'แอมพูล',
    unit_name_en: 'Ampule(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'VIAL',
    unit_name: 'ไวอัล',
    unit_name_en: 'Vial(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'TUBE',
    unit_name: 'หลอด',
    unit_name_en: 'Tube(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'BTL',
    unit_name: 'ขวด',
    unit_name_en: 'Bottle(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'BOX',
    unit_name: 'กล่อง',
    unit_name_en: 'Box(es)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'PACK',
    unit_name: 'แพ็ค',
    unit_name_en: 'Pack(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'STRIP',
    unit_name: 'แผง',
    unit_name_en: 'Strip(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'SACHET',
    unit_name: 'ซอง',
    unit_name_en: 'Sachet(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'BAG',
    unit_name: 'ถุง',
    unit_name_en: 'Bag(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'SYR',
    unit_name: 'กระบอกฉีด',
    unit_name_en: 'Syringe(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'DOSE',
    unit_name: 'โดส',
    unit_name_en: 'Dose(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'PUFF',
    unit_name: 'พัฟ',
    unit_name_en: 'Puff(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'DROP',
    unit_name: 'หยด',
    unit_name_en: 'Drop(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'SUPP',
    unit_name: 'เม็ดเหน็บ',
    unit_name_en: 'Suppository',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'PATCH',
    unit_name: 'แผ่นแปะ',
    unit_name_en: 'Patch(es)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'PEN',
    unit_name: 'ปากกา',
    unit_name_en: 'Pen(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'UNIT',
    unit_name: 'หน่วย',
    unit_name_en: 'Unit(s)',
    unit_type: 'POTENCY',
  },
  {
    unit_code: 'IU',
    unit_name: 'หน่วยสากล',
    unit_name_en: 'International Unit(s)',
    unit_type: 'POTENCY',
  },
  {
    unit_code: 'MEQ',
    unit_name: 'มิลลิอิควิวาเลนต์',
    unit_name_en: 'Milliequivalent(s)',
    unit_type: 'POTENCY',
  },
  {
    unit_code: 'MMOL',
    unit_name: 'มิลลิโมล',
    unit_name_en: 'Millimole(s)',
    unit_type: 'POTENCY',
  },
  {
    unit_code: 'SET',
    unit_name: 'ชุด',
    unit_name_en: 'Set(s)',
    unit_type: 'QUANTITY',
  },
  {
    unit_code: 'PIECE',
    unit_name: 'ชิ้น',
    unit_name_en: 'Piece(s)',
    unit_type: 'QUANTITY',
  },
];

// location_type enum: WAREHOUSE, PHARMACY, WARD, EMERGENCY, OPERATING, ICU, STORAGE, QUARANTINE
const LOCATIONS = [
  {
    location_code: 'MAIN',
    location_name: 'คลังยาหลัก',
    location_type: 'WAREHOUSE',
  },
  {
    location_code: 'SUB1',
    location_name: 'คลังยาย่อย 1',
    location_type: 'STORAGE',
  },
  {
    location_code: 'OPD',
    location_name: 'ห้องยาผู้ป่วยนอก',
    location_type: 'PHARMACY',
  },
  {
    location_code: 'IPD',
    location_name: 'ห้องยาผู้ป่วยใน',
    location_type: 'PHARMACY',
  },
  {
    location_code: 'ER',
    location_name: 'ห้องฉุกเฉิน',
    location_type: 'EMERGENCY',
  },
  {
    location_code: 'OR',
    location_name: 'ห้องผ่าตัด',
    location_type: 'OPERATING',
  },
  { location_code: 'ICU', location_name: 'ไอซียู', location_type: 'ICU' },
  {
    location_code: 'WARD1',
    location_name: 'หอผู้ป่วย 1',
    location_type: 'WARD',
  },
  {
    location_code: 'WARD2',
    location_name: 'หอผู้ป่วย 2',
    location_type: 'WARD',
  },
  {
    location_code: 'QUA',
    location_name: 'พื้นที่กักกัน',
    location_type: 'QUARANTINE',
  },
];

const COMPANIES = [
  {
    company_code: 'GPO',
    company_name: 'องค์การเภสัชกรรม',
    tax_id: '0994000167254',
    is_vendor: true,
    is_manufacturer: true,
  },
  {
    company_code: 'ANB',
    company_name: 'บริษัท เอ.เอ็น.บี. ลาบอราตอรี่ จำกัด',
    tax_id: '',
    is_vendor: true,
    is_manufacturer: true,
  },
  {
    company_code: 'BIOLAB',
    company_name: 'บริษัท ไบโอแลป จำกัด',
    tax_id: '',
    is_vendor: true,
    is_manufacturer: true,
  },
  {
    company_code: 'SIAM',
    company_name: 'บริษัท สยามฟาร์มาซูติคอล จำกัด',
    tax_id: '',
    is_vendor: true,
    is_manufacturer: true,
  },
  {
    company_code: 'BERLIN',
    company_name: 'บริษัท เบอร์ลินฟาร์มาซูติคอลอินดัสตรี้ จำกัด',
    tax_id: '',
    is_vendor: true,
    is_manufacturer: true,
  },
  {
    company_code: 'MEGA',
    company_name: 'Mega Lifesciences',
    tax_id: '',
    is_vendor: true,
    is_manufacturer: true,
  },
  {
    company_code: 'OSOTH',
    company_name: 'บริษัท โอสถสภา จำกัด',
    tax_id: '',
    is_vendor: true,
    is_manufacturer: false,
  },
  {
    company_code: 'DKSH',
    company_name: 'DKSH (Thailand) Limited',
    tax_id: '',
    is_vendor: true,
    is_manufacturer: false,
  },
];

// ============================================================================
// Seed Function
// ============================================================================

export async function seed(knex: Knex): Promise<void> {
  console.log(
    '\n═══════════════════════════════════════════════════════════════',
  );
  console.log('  🌱 SEEDING INVENTORY REFERENCE DATA');
  console.log(
    '═══════════════════════════════════════════════════════════════\n',
  );

  // Ensure we're in inventory schema
  await knex.raw(`SET search_path TO inventory, public`);

  // Seed Budget Types
  console.log('📋 Seeding budget_types...');
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
  console.log(`   ✅ ${BUDGET_TYPES.length} budget types`);

  // Seed Budget Categories
  console.log('📋 Seeding budget_categories...');
  for (const item of BUDGET_CATEGORIES) {
    await knex.raw(
      `
      INSERT INTO inventory.budget_categories (category_code, category_name, accounting_code, is_active, created_at, updated_at)
      VALUES (?, ?, ?, true, NOW(), NOW())
      ON CONFLICT (category_code) DO UPDATE SET
        category_name = EXCLUDED.category_name,
        accounting_code = EXCLUDED.accounting_code,
        updated_at = NOW()
    `,
      [item.category_code, item.category_name, item.accounting_code],
    );
  }
  console.log(`   ✅ ${BUDGET_CATEGORIES.length} budget categories`);

  // Seed Dosage Forms
  console.log('📋 Seeding dosage_forms...');
  for (const item of DOSAGE_FORMS) {
    await knex.raw(
      `
      INSERT INTO inventory.dosage_forms (form_code, form_name, form_name_en, is_active, created_at, updated_at)
      VALUES (?, ?, ?, true, NOW(), NOW())
      ON CONFLICT (form_code) DO UPDATE SET
        form_name = EXCLUDED.form_name,
        form_name_en = EXCLUDED.form_name_en,
        updated_at = NOW()
    `,
      [item.form_code, item.form_name, item.form_name_en],
    );
  }
  console.log(`   ✅ ${DOSAGE_FORMS.length} dosage forms`);

  // Seed Drug Units
  console.log('📋 Seeding drug_units...');
  for (const item of DRUG_UNITS) {
    await knex.raw(
      `
      INSERT INTO inventory.drug_units (unit_code, unit_name, unit_name_en, unit_type, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?::inventory.unit_type, true, NOW(), NOW())
      ON CONFLICT (unit_code) DO UPDATE SET
        unit_name = EXCLUDED.unit_name,
        unit_name_en = EXCLUDED.unit_name_en,
        unit_type = EXCLUDED.unit_type,
        updated_at = NOW()
    `,
      [item.unit_code, item.unit_name, item.unit_name_en, item.unit_type],
    );
  }
  console.log(`   ✅ ${DRUG_UNITS.length} drug units`);

  // Seed Locations
  console.log('📋 Seeding locations...');
  for (const item of LOCATIONS) {
    await knex.raw(
      `
      INSERT INTO inventory.locations (location_code, location_name, location_type, is_active, created_at, updated_at)
      VALUES (?, ?, ?::inventory.location_type, true, NOW(), NOW())
      ON CONFLICT (location_code) DO UPDATE SET
        location_name = EXCLUDED.location_name,
        location_type = EXCLUDED.location_type,
        updated_at = NOW()
    `,
      [item.location_code, item.location_name, item.location_type],
    );
  }
  console.log(`   ✅ ${LOCATIONS.length} locations`);

  // Seed Companies (Vendors/Manufacturers)
  console.log('📋 Seeding companies...');
  for (const item of COMPANIES) {
    await knex.raw(
      `
      INSERT INTO inventory.companies (company_code, company_name, tax_id, is_vendor, is_manufacturer, is_active, created_at, updated_at)
      VALUES (?, ?, NULLIF(?, ''), ?, ?, true, NOW(), NOW())
      ON CONFLICT (company_code) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        tax_id = EXCLUDED.tax_id,
        is_vendor = EXCLUDED.is_vendor,
        is_manufacturer = EXCLUDED.is_manufacturer,
        updated_at = NOW()
    `,
      [
        item.company_code,
        item.company_name,
        item.tax_id,
        item.is_vendor,
        item.is_manufacturer,
      ],
    );
  }
  console.log(`   ✅ ${COMPANIES.length} companies`);

  // Update system info
  console.log('\n📋 Updating system info...');
  await knex.raw(`
    INSERT INTO inventory.system_info (key, value, updated_at)
    VALUES ('schema_version', '1.0.0', NOW())
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = NOW()
  `);
  await knex.raw(
    `
    INSERT INTO inventory.system_info (key, value, updated_at)
    VALUES ('last_seeded_at', ?, NOW())
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = NOW()
  `,
    [new Date().toISOString()],
  );

  console.log(
    '\n═══════════════════════════════════════════════════════════════',
  );
  console.log('  ✅ REFERENCE DATA SEEDING COMPLETE');
  console.log(
    '═══════════════════════════════════════════════════════════════\n',
  );

  // Summary
  const counts = await knex.raw(`
    SELECT
      (SELECT COUNT(*) FROM inventory.budget_types) as budget_types,
      (SELECT COUNT(*) FROM inventory.budget_categories) as budget_categories,
      (SELECT COUNT(*) FROM inventory.dosage_forms) as dosage_forms,
      (SELECT COUNT(*) FROM inventory.drug_units) as drug_units,
      (SELECT COUNT(*) FROM inventory.locations) as locations,
      (SELECT COUNT(*) FROM inventory.companies) as companies
  `);

  const c = counts.rows[0];
  console.log('📊 Reference Data Summary:');
  console.log(`   - Budget Types:      ${c.budget_types} records`);
  console.log(`   - Budget Categories: ${c.budget_categories} records`);
  console.log(`   - Dosage Forms:      ${c.dosage_forms} records`);
  console.log(`   - Drug Units:        ${c.drug_units} records`);
  console.log(`   - Locations:         ${c.locations} records`);
  console.log(`   - Companies:         ${c.companies} records`);
  console.log('');
}
