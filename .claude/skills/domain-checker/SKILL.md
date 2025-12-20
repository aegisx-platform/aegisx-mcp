---
name: domain-checker
description: ตรวจสอบ domain classification ก่อน generate CRUD module ใหม่. ใช้เมื่อจะสร้าง CRUD สำหรับตารางใหม่
invocable: true
---

# Domain Checker Skill

ตรวจสอบและแนะนำ domain classification ที่ถูกต้องสำหรับตารางก่อนการ generate CRUD

## When to Use

ใช้ skill นี้เมื่อ:

- จะ generate CRUD module ใหม่
- ไม่แน่ใจว่าตารางควรอยู่ใน domain ไหน (master-data vs operations)
- ต้องการตรวจสอบว่า schema ที่เลือกถูกต้องหรือไม่
- ต้องการดู command ที่ถูกต้องสำหรับการ generate CRUD

## Instructions

1. ถามผู้ใช้ว่าต้องการตรวจสอบตารางอะไร
2. อ่านโครงสร้างตารางจาก database หรือ migration file
3. วิเคราะห์ characteristics ของตาราง:
   - ดู fields ที่มี
   - ตรวจสอบ foreign keys
   - ดู audit fields
   - พิจารณาวัตถุประสงค์การใช้งาน
4. จำแนก domain:
   - **Master-Data**: Lookup/Reference data
   - **Operations**: Transactional data
5. แนะนำ schema ที่ถูกต้อง:
   - `public` - สำหรับ main system tables
   - `inventory` - สำหรับ inventory domain
   - (อื่นๆ ตาม domain ที่มี)
6. สร้างและแสดง CRUD command ที่ถูกต้อง

## Analysis Pattern

### Master-Data Indicators (master-data domain)

**Characteristics:**

- มี fields: `code`, `name`, `is_active`
- ใช้สำหรับ dropdown/lookup/reference
- ไม่มี audit fields มาก (อาจมีแค่ `created_at`)
- เปลี่ยนแปลงไม่บ่อย
- Configuration data

**Examples:**

- `budget_types` - ประเภทงบประมาณ
- `drug_catalogs` - รายการยา
- `unit_of_measures` - หน่วยนับ
- `locations` - สถานที่
- `suppliers` - ผู้จัดจำหน่าย

**Classification:**

```bash
pnpm run crud -- TABLE_NAME --domain master-data/SECTION --force

# For inventory domain
pnpm run crud -- TABLE_NAME --domain inventory/master-data --schema inventory --force
```

### Operations Indicators (operations domain)

**Characteristics:**

- มี audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`
- มี foreign keys หลายตัว
- Transaction/activity data
- เกิดขึ้นบ่อย, มีปริมาณมาก
- มี workflow/status fields

**Examples:**

- `budget_allocations` - การจัดสรรงบ
- `stock_transactions` - รายการเคลื่อนไหวสินค้า
- `purchase_orders` - ใบสั่งซื้อ
- `requisitions` - ใบเบิก

**Classification:**

```bash
pnpm run crud -- TABLE_NAME --domain operations/SECTION --force

# For inventory domain
pnpm run crud -- TABLE_NAME --domain inventory/operations --schema inventory --force
```

## Domain Decision Tree

```
START: Analyze table
│
├─ Is it configuration/lookup data?
│  ├─ YES: Has code/name/is_active fields?
│  │      └─ YES: → MASTER-DATA
│  │
│  └─ NO: Continue...
│
├─ Does it have many audit fields?
│  ├─ YES: created_by, updated_by, timestamps?
│  │      └─ YES: → OPERATIONS
│  │
│  └─ NO: Continue...
│
├─ Is it transactional data?
│  ├─ YES: Activities, events, transactions?
│  │      └─ YES: → OPERATIONS
│  │
│  └─ NO: → MASTER-DATA (likely reference data)
```

## Schema Selection

### Public Schema (Main System)

```bash
# Budget domain
pnpm run crud -- budget_types --domain master-data/budgets --force
pnpm run crud -- budget_allocations --domain operations/budgets --force

# Main system tables
pnpm run crud -- users --domain master-data/users --force
pnpm run crud -- roles --domain master-data/roles --force
```

### Inventory Schema (Inventory Domain)

```bash
# Inventory master-data
pnpm run crud -- drug_catalogs --domain inventory/master-data --schema inventory --force
pnpm run crud -- unit_of_measures --domain inventory/master-data --schema inventory --force

# Inventory operations
pnpm run crud -- stock_transactions --domain inventory/operations --schema inventory --force
pnpm run crud -- requisitions --domain inventory/operations --schema inventory --force
```

## Output Format

After analysis, provide output in this format:

````markdown
## Domain Analysis: [TABLE_NAME]

### Table Characteristics

- Schema: `[schema_name]`
- Primary fields: [list key fields]
- Foreign keys: [list FK fields]
- Audit fields: [list audit fields]
- Special fields: [list special fields]

### Classification

**Domain Type:** [MASTER-DATA | OPERATIONS]

**Reasoning:**

- [Reason 1]
- [Reason 2]
- [Reason 3]

### Recommended Section

**Section:** [section_name] (e.g., budgets, inventory, etc.)

### CRUD Generation Command

```bash
# Recommended command
pnpm run crud -- [TABLE_NAME] --domain [DOMAIN/SECTION] [--schema SCHEMA] --force
```
````

### Examples

**Full package (with import + events):**

```bash
pnpm run crud:full -- [TABLE_NAME] --domain [DOMAIN/SECTION] [--schema SCHEMA] --force
```

**With import only:**

```bash
pnpm run crud:import -- [TABLE_NAME] --domain [DOMAIN/SECTION] [--schema SCHEMA] --force
```

**With events only:**

```bash
pnpm run crud:events -- [TABLE_NAME] --domain [DOMAIN/SECTION] [--schema SCHEMA] --force
```

### Next Steps

1. ✅ Review the recommended command
2. ✅ Verify table exists in database
3. ✅ Check migration has UUID primary key
4. ✅ Run the CRUD generation command
5. ✅ Test the generated endpoints

````

## Examples

### Example 1: Budget Types (Master-Data)

**Input:** "ตรวจสอบ budget_types"

**Analysis:**
```sql
CREATE TABLE budget_types (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
````

**Output:**

````markdown
## Domain Analysis: budget_types

### Table Characteristics

- Schema: `public`
- Primary fields: `code`, `name`, `is_active`
- Foreign keys: None
- Audit fields: `created_at` only
- Special fields: `description`

### Classification

**Domain Type:** MASTER-DATA

**Reasoning:**

- Has `code` and `name` fields (lookup pattern)
- Has `is_active` for soft delete
- No complex audit fields (`created_by`, `updated_by`)
- Used for dropdown/reference data
- Configuration data that changes infrequently

### Recommended Section

**Section:** budgets

### CRUD Generation Command

```bash
# Recommended command
pnpm run crud -- budget_types --domain master-data/budgets --force
```
````

````

### Example 2: Stock Transactions (Operations)

**Input:** "ตรวจสอบ stock_transactions"

**Analysis:**
```sql
CREATE TABLE inventory.stock_transactions (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES inventory.items(id),
  transaction_type VARCHAR(50) NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  reference_number VARCHAR(100),
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);
````

**Output:**

````markdown
## Domain Analysis: stock_transactions

### Table Characteristics

- Schema: `inventory`
- Primary fields: `transaction_type`, `quantity`
- Foreign keys: `item_id`, `created_by`, `updated_by`
- Audit fields: `created_by`, `created_at`, `updated_by`, `updated_at`
- Special fields: `reference_number`, `notes`

### Classification

**Domain Type:** OPERATIONS

**Reasoning:**

- Has full audit trail (`created_by`, `updated_by`, timestamps)
- Multiple foreign keys (item_id, user references)
- Transactional data (stock movements)
- High volume, frequently created
- Activity/event data

### Recommended Section

**Section:** inventory (operations)

### CRUD Generation Command

```bash
# Recommended command
pnpm run crud -- stock_transactions --domain inventory/operations --schema inventory --force
```
````

### Next Steps

1. ✅ Review the recommended command
2. ✅ Verify `inventory.stock_transactions` table exists
3. ✅ Check migration has UUID primary key
4. ✅ Run the CRUD generation command
5. ✅ Test the generated endpoints at `/api/inventory/stock-transactions`

```

```

## Common Scenarios

### Scenario 1: User asks to generate CRUD without specifying domain

```
User: "สร้าง CRUD สำหรับ drug_catalogs"
```
