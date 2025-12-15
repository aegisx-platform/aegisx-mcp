# Domain Architecture Guide

> **คู่มือสำคัญ:** อ่านก่อนสร้าง CRUD module ใหม่ทุกครั้ง เพื่อเลือก domain ที่ถูกต้อง

## 🎯 หลักการแบ่ง Domain

### Master-Data Domain (`inventory/master-data`)

**ใช้สำหรับ:** ข้อมูลอ้างอิง, lookup tables, configuration data

**คำถามทดสอบ:**

- ✅ เป็นข้อมูลที่ต้องตั้งค่าก่อนใช้งานระบบหรือไม่?
- ✅ เป็นข้อมูลที่ไม่ค่อยเปลี่ยนแปลงหรือไม่?
- ✅ เป็นข้อมูลที่ใช้อ้างอิงใน dropdown/select หรือไม่?
- ✅ ถูก reference โดย foreign key จากตารางอื่นหรือไม่?

**ตัวอย่าง:**

```
✅ budget_types         - ประเภทงบประมาณ (เงินบำรุง, เงินงบประมาณ)
✅ budget_categories    - หมวดงบประมาณ (ค่ายา, ค่าเวชภัณฑ์)
✅ budgets              - งบประมาณ (configuration: type + category)
✅ drug_generics        - ชื่อสามัญยา
✅ dosage_forms         - รูปแบบยา (เม็ด, แคปซูล)
✅ companies            - บริษัท
✅ departments          - แผนก
✅ locations            - สถานที่จัดเก็บ
```

### Operations Domain (`inventory/operations`)

**ใช้สำหรับ:** ข้อมูล transactional, การดำเนินงานจริง

**คำถามทดสอบ:**

- ✅ เป็นข้อมูลที่เกิดจากการทำธุรกรรมหรือไม่?
- ✅ มีการเปลี่ยนแปลงบ่อยครั้งหรือไม่?
- ✅ มี status/state ที่เปลี่ยนแปลงตามเวลาหรือไม่?
- ✅ Reference ไปหา master-data หรือไม่?

**ตัวอย่าง:**

```
✅ budget_allocations   - การจัดสรรงบ (transaction: จัดสรรงบให้แผนก)
✅ budget_plans         - แผนการใช้งบ (transaction: วางแผนใช้งบ)
✅ budget_plan_items    - รายการในแผน (transaction items)
✅ budget_reservations  - การสำรองงบ (transaction: จองงบไว้)
✅ inventory            - คลังสินค้า (มี stock ที่เปลี่ยนแปลง)
✅ inventory_transactions - ธุรกรรมเข้า-ออก
✅ drug_distributions   - การจ่ายยา
✅ drug_returns         - การคืนยา
```

## 📋 Decision Tree

```
เริ่มสร้าง CRUD module ใหม่
          │
          ↓
    ถามตัวเอง: Table นี้เก็บข้อมูลแบบไหน?
          │
    ┌─────┴─────┐
    │           │
Master-Data   Operations
(ข้อมูลอ้างอิง) (ธุรกรรม)
    │           │
    ↓           ↓
--domain     --domain
inventory/   inventory/
master-data  operations
```

## 🔍 ตัวอย่างเฉพาะกรณี Budget

### ทำไม budgets อยู่ใน master-data?

```sql
-- budgets table structure
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  budget_type_id INTEGER REFERENCES budget_types(id),      -- อ้างอิง master
  budget_category_id INTEGER REFERENCES budget_categories(id), -- อ้างอิง master
  description TEXT,
  is_active BOOLEAN
);

-- นี่คือ CONFIGURATION ของงบประมาณ
-- เช่น: "งบเงินบำรุง - ค่ายา" หรือ "งบประมาณแผ่นดิน - ค่าเวชภัณฑ์"
-- ตั้งค่าไว้ก่อน แล้วใช้อ้างอิงในตาราง operations
```

### ตารางที่ใช้งาน budgets (operations)

```sql
-- budget_allocations (TRANSACTIONAL)
CREATE TABLE budget_allocations (
  id BIGSERIAL PRIMARY KEY,
  fiscal_year INTEGER,
  budget_id INTEGER REFERENCES budgets(id),  -- ← อ้างอิงจาก master-data
  department_id INTEGER,
  total_budget DECIMAL,
  q1_spent DECIMAL,  -- เปลี่ยนแปลงตลอดเวลา
  q2_spent DECIMAL,
  -- มี state ที่เปลี่ยนแปลง = OPERATIONS
);
```

## ⚠️ กรณีที่มักสับสน

### ❌ ผิด: ใส่ budgets ใน operations

**เหตุผล:**

- budgets ไม่ได้มี transaction state
- ไม่มีการเปลี่ยนแปลงข้อมูลบ่อย
- เป็นข้อมูล configuration สำหรับใช้อ้างอิง

### ✅ ถูก: ใส่ budgets ใน master-data

**เหตุผล:**

- เป็น lookup/reference data
- ใช้สำหรับตั้งค่าระบบ
- ถูก reference โดย budget_allocations, budget_plans, etc.

## 🚀 คำสั่ง Generate ที่ถูกต้อง

### Master-Data Modules

```bash
# Budget master data
node libs/aegisx-cli/bin/cli.js generate budget_types \
  --target frontend \
  --shell inventory \
  --section master-data \  # ← frontend section
  --domain inventory/master-data \  # ← backend domain
  --schema inventory \
  --package full --with-import --with-export --force

# ใช้ pattern เดียวกันสำหรับ:
# - budget_categories
# - budgets
# - drugs, drug_generics, dosage_forms, drug_units, etc.
```

### Operations Modules

```bash
# Budget operations
node libs/aegisx-cli/bin/cli.js generate budget_allocations \
  --target frontend \
  --shell inventory \
  --section budget \  # ← frontend section (UX grouping)
  --domain inventory/operations \  # ← backend domain (architecture)
  --schema inventory \
  --package full --with-import --with-export --force

# ใช้ pattern เดียวกันสำหรับ:
# - budget_plans
# - budget_plan_items
# - budget_reservations
```

## 📊 สรุปแบบตาราง

| Module              | Domain          | Section     | เหตุผล                      |
| ------------------- | --------------- | ----------- | --------------------------- |
| budget_types        | master-data     | master-data | Lookup table                |
| budget_categories   | master-data     | master-data | Lookup table                |
| **budgets**         | **master-data** | **budget**  | **Configuration/Reference** |
| budget_allocations  | operations      | budget      | Transaction                 |
| budget_plans        | operations      | budget      | Transaction                 |
| budget_plan_items   | operations      | budget      | Transaction items           |
| budget_reservations | operations      | budget      | Transaction                 |

## 🎯 Checklist ก่อน Generate

- [ ] อ่านโครงสร้าง database migration
- [ ] ดูว่าตารางมี foreign key อ้างอิงตารางไหน
- [ ] ตอบคำถาม: เป็น master-data หรือ operations?
- [ ] เช็ค section ที่จะใช้ใน frontend (UX grouping)
- [ ] ตรวจสอบว่า backend domain ถูกต้องหรือไม่
- [ ] Generate ด้วยคำสั่งที่ถูกต้อง

## 🔧 เครื่องมือช่วยเหลือ

ใช้ script `/tmp/check_domain.sh` เพื่อตรวจสอบว่า table ควรอยู่ domain ไหน:

```bash
bash /tmp/check_domain.sh budget_allocations
# Output: ✅ OPERATIONS (has foreign key to budgets, has spent/state fields)

bash /tmp/check_domain.sh budgets
# Output: ✅ MASTER-DATA (is referenced by other tables, no state fields)
```

## 📝 สรุป

**กฎทองคำ:**

1. **Master-Data** = ตั้งค่าก่อน, ใช้อ้างอิง, ไม่ค่อยเปลี่ยน
2. **Operations** = ทำธุรกรรม, เปลี่ยนแปลงบ่อย, มี state
3. **Section** (frontend) = จัดกลุ่มตาม UX ให้ user ใช้งานง่าย
4. **Domain** (backend) = จัดกลุ่มตาม architecture ให้ถูกต้อง

**ห้ามลืม:**

- Module เดียวกันอาจอยู่คนละ domain (backend) แต่อยู่ section เดียวกัน (frontend) ได้
- ตัวอย่าง: budget_types (master-data) และ budget_allocations (operations) แสดงใน section "budget" ตัวเดียวกัน
- นี่ไม่ผิด! Frontend จัดกลุ่มตาม UX, Backend จัดกลุ่มตาม architecture

**เมื่อสงสัย:**

- ดู foreign key relationships
- ถามตัวเอง: "ตารางนี้มี state ที่เปลี่ยนแปลงหรือไม่?"
- อ่านคู่มือนี้อีกครั้ง
