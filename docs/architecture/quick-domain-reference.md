# Quick Domain Reference

> **ใช้อ้างอิงด่วน:** เมื่อไม่แน่ใจว่าต้องใช้ domain ไหน

## 🎯 ถามตัวเอง 3 คำถาม

### 1. Table นี้ถูก reference โดยตารางอื่นหรือไม่?

```sql
-- ถ้ามี foreign key ชี้มาที่ตารางนี้
other_table REFERENCES this_table(id)
```

→ **แนว MASTER-DATA** (เป็นข้อมูลอ้างอิง)

### 2. Table นี้มี state fields หรือไม่?

```sql
-- เช่น: status, state, spent, used, remaining, quantity
q1_spent DECIMAL,
q2_spent DECIMAL,
status VARCHAR,
remaining_quantity INTEGER
```

→ **แนว OPERATIONS** (มีการเปลี่ยนแปลง state)

### 3. Table นี้เก็บ configuration หรือ transaction?

- **Configuration**: ตั้งค่าไว้ก่อน (เช่น ประเภทยา, หมวดงบ)
  → **MASTER-DATA**
- **Transaction**: เกิดจากการทำธุรกรรม (เช่น การจ่ายยา, การจัดสรรงบ)
  → **OPERATIONS**

## 📊 ตัวอย่างเร็ว

### MASTER-DATA Examples

```
budget_types          → ประเภทงบ (เงินบำรุง, งบประมาณ)
budget_categories     → หมวดงบ (ค่ายา, ค่าเวชภัณฑ์)
budgets               → งบประมาณ (type + category config)
drug_generics         → ชื่อสามัญยา
dosage_forms          → รูปแบบยา (เม็ด, แคปซูล, ฯลฯ)
companies             → บริษัท
departments           → แผนก
locations             → สถานที่จัดเก็บ
```

### OPERATIONS Examples

```
budget_allocations    → จัดสรรงบให้แผนก
budget_plans          → แผนใช้งบ
budget_reservations   → สำรองงบ
inventory_transactions → เข้า-ออกสินค้า
drug_distributions    → จ่ายยา
drug_returns          → คืนยา
```

## 🚨 กรณีที่มักสับสน

### budgets → MASTER-DATA (ไม่ใช่ OPERATIONS!)

**ทำไม?**

- เป็น configuration ของงบประมาณ
- ไม่มี transaction state
- ถูก reference โดย budget_allocations, budget_plans, etc.

```sql
-- budgets = MASTER-DATA
CREATE TABLE budgets (
  budget_type_id INTEGER REFERENCES budget_types(id),
  budget_category_id INTEGER REFERENCES budget_categories(id),
  description TEXT,
  is_active BOOLEAN  -- ← ไม่ใช่ state, เป็น config flag
);

-- budget_allocations = OPERATIONS
CREATE TABLE budget_allocations (
  budget_id INTEGER REFERENCES budgets(id),  -- ← อ้างอิง master-data
  q1_spent DECIMAL,  -- ← state ที่เปลี่ยนแปลง
  q2_spent DECIMAL,
  remaining_budget DECIMAL
);
```

## ⚡ Quick Command

```bash
# Check domain for any table
bash /tmp/check_domain.sh TABLE_NAME

# Example
bash /tmp/check_domain.sh budgets
bash /tmp/check_domain.sh budget_allocations
```

## 📖 อ่านเพิ่มเติม

- [DOMAIN_ARCHITECTURE_GUIDE.md](./DOMAIN_ARCHITECTURE_GUIDE.md) - คู่มือละเอียด
- Migration files in `apps/api/src/database/migrations-inventory/`
