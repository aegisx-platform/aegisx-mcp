import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  // ============================================================================
  // เพิ่มฟิลด์สำหรับการควบคุมงบราย Item (Item-Level Budget Control)
  // ============================================================================
  await knex.raw(`
    ALTER TABLE inventory.budget_request_items

    -- ระดับการควบคุมปริมาณ (Quantity Control Type)
    ADD COLUMN quantity_control_type VARCHAR(10) DEFAULT 'SOFT'
      CHECK (quantity_control_type IN ('NONE', 'SOFT', 'HARD')),

    -- ระดับการควบคุมราคา (Price Control Type)
    ADD COLUMN price_control_type VARCHAR(10) DEFAULT 'SOFT'
      CHECK (price_control_type IN ('NONE', 'SOFT', 'HARD')),

    -- เปอร์เซ็นต์ยอมให้เกินสำหรับปริมาณ (Quantity Variance %)
    ADD COLUMN quantity_variance_percent INTEGER DEFAULT 10
      CHECK (quantity_variance_percent >= 0 AND quantity_variance_percent <= 100),

    -- เปอร์เซ็นต์ยอมให้เกินสำหรับราคา (Price Variance %)
    ADD COLUMN price_variance_percent INTEGER DEFAULT 15
      CHECK (price_variance_percent >= 0 AND price_variance_percent <= 100);
  `);

  // ============================================================================
  // เพิ่ม Comments สำหรับอธิบายการใช้งาน
  // ============================================================================
  await knex.raw(`
    COMMENT ON COLUMN inventory.budget_request_items.quantity_control_type IS
      'ระดับการควบคุมปริมาณ: NONE=ไม่ควบคุม, SOFT=เตือน+ต้องระบุเหตุผล, HARD=บล็อคไม่ให้สร้าง PR';

    COMMENT ON COLUMN inventory.budget_request_items.price_control_type IS
      'ระดับการควบคุมราคา: NONE=ไม่ควบคุม, SOFT=เตือน+ต้องระบุเหตุผล, HARD=บล็อคไม่ให้สร้าง PR';

    COMMENT ON COLUMN inventory.budget_request_items.quantity_variance_percent IS
      'เปอร์เซ็นต์ยอมให้เกินสำหรับปริมาณ (0-100): เช่น 10 = ยอมให้เกิน±10%';

    COMMENT ON COLUMN inventory.budget_request_items.price_variance_percent IS
      'เปอร์เซ็นต์ยอมให้เกินสำหรับราคา (0-100): เช่น 15 = ยอมให้เกิน±15%';
  `);

  // ============================================================================
  // Examples / Documentation
  // ============================================================================
  // Control Type Behavior:
  //
  // NONE: ไม่มีการตรวจสอบ PR สามารถสร้างได้เลย
  // SOFT: แจ้งเตือนสีเหลือง ต้องระบุเหตุผล แต่ยังสร้าง PR ได้
  // HARD: แสดงข้อผิดพลาดสีแดง บล็อคไม่ให้สร้าง PR
  //
  // Variance Tolerance:
  // - quantity_variance_percent = 10 → ยอมให้เกิน±10%
  //   เช่น แผน 100 → สามารถซื้อ 90-110 ได้
  // - price_variance_percent = 15 → ยอมให้เกิน±15%
  //   เช่น แผน 100 บาท → สามารถซื้อ 85-115 บาท ได้
  //
  // Default Values:
  // - quantity_control_type = 'SOFT' (เตือนเมื่อเกิน)
  // - price_control_type = 'SOFT' (เตือนเมื่อเกิน)
  // - quantity_variance_percent = 10 (±10%)
  // - price_variance_percent = 15 (±15%)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`SET search_path TO inventory, public`);

  await knex.raw(`
    ALTER TABLE inventory.budget_request_items
    DROP COLUMN IF EXISTS price_variance_percent,
    DROP COLUMN IF EXISTS quantity_variance_percent,
    DROP COLUMN IF EXISTS price_control_type,
    DROP COLUMN IF EXISTS quantity_control_type;
  `);
}
