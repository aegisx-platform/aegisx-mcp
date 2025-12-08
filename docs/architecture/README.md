# Architecture Documentation

> **เอกสารสถาปัตยกรรมระบบ** - อ่านก่อนสร้าง module ใหม่

## 📚 คู่มือหลัก

### 1. [DOMAIN_ARCHITECTURE_GUIDE.md](./DOMAIN_ARCHITECTURE_GUIDE.md)

**คู่มือฉบับเต็ม:** อธิบายหลักการแบ่ง domain อย่างละเอียด

- หลักการแบ่ง Master-Data vs Operations
- Decision Tree สำหรับเลือก domain
- ตัวอย่างเฉพาะกรณี (budgets, etc.)
- Checklist ก่อน generate

### 2. [QUICK_DOMAIN_REFERENCE.md](./QUICK_DOMAIN_REFERENCE.md)

**อ้างอิงด่วน:** ใช้เมื่อต้องการคำตอบเร็ว

- ถามตัวเอง 3 คำถาม
- ตัวอย่างเร็ว
- กรณีที่มักสับสน

## 🔧 เครื่องมือช่วยเหลือ

### Domain Checker Tool

```bash
# ใช้ตรวจสอบว่า table ควรอยู่ domain ไหน
bash /tmp/check_domain.sh TABLE_NAME

# ตัวอย่าง
bash /tmp/check_domain.sh budgets
# → Output: MASTER-DATA domain

bash /tmp/check_domain.sh budget_allocations
# → Output: OPERATIONS domain
```

## 🎯 Workflow แนะนำ

### ก่อนสร้าง CRUD Module ใหม่:

1. **อ่าน Migration File**

   ```bash
   cat apps/api/src/database/migrations-inventory/*_create_TABLE_NAME.ts
   ```

2. **ใช้ Domain Checker**

   ```bash
   bash /tmp/check_domain.sh TABLE_NAME
   ```

3. **อ่าน Quick Reference**
   - [QUICK_DOMAIN_REFERENCE.md](./QUICK_DOMAIN_REFERENCE.md)

4. **Generate ด้วยคำสั่งที่ถูกต้อง**
   - ใช้ `--domain` ตามคำแนะนำจาก checker
   - ใช้ `--section` ตาม UX grouping

5. **ตรวจสอบ Breadcrumb**
   - ต้องมี 4 levels: Home > Shell > Section > Module
   - คลิกย้อนกลับได้ทุก level

## 📋 Domain Structure

### Inventory Shell

```
inventory/
├── master-data/          (Lookup & Reference Data)
│   ├── budget_types
│   ├── budget_categories
│   ├── budgets           ← Configuration
│   ├── drugs
│   ├── drug_generics
│   ├── dosage_forms
│   ├── drug_units
│   ├── companies
│   ├── departments
│   └── locations
│
└── operations/           (Transactional Data)
    ├── budgets           ❌ REMOVED (duplicate)
    ├── budget_allocations
    ├── budget_plans
    ├── budget_plan_items
    ├── budget_reservations
    ├── inventory
    ├── inventory_transactions
    ├── drug_distributions
    └── drug_returns
```

## ⚠️ Common Mistakes

### ❌ ผิด: ใส่ budgets ใน operations

```bash
# WRONG!
--domain inventory/operations
```

### ✅ ถูก: ใส่ budgets ใน master-data

```bash
# CORRECT!
--domain inventory/master-data
```

**เหตุผล:**

- budgets เป็น configuration (type + category)
- ไม่มี transaction state
- ถูก reference โดย operations tables

## 🚀 Quick Commands

### Check Domain

```bash
bash /tmp/check_domain.sh budgets
```

### Generate Master-Data Module

```bash
node libs/aegisx-cli/bin/cli.js generate TABLE_NAME \
  --target frontend \
  --shell inventory \
  --section master-data \
  --domain inventory/master-data \
  --schema inventory \
  --package full --with-import --with-export --force
```

### Generate Operations Module

```bash
node libs/aegisx-cli/bin/cli.js generate TABLE_NAME \
  --target frontend \
  --shell inventory \
  --section [operations|budget|procurement] \
  --domain inventory/operations \
  --schema inventory \
  --package full --with-import --with-export --force
```

## 📖 Related Documentation

- [Feature Development Standard](../development/feature-development-standard.md)
- [Universal Full-Stack Standard](../development/universal-fullstack-standard.md)
- [CRUD Generator Docs](../../libs/aegisx-cli/docs/)

## 💡 Key Principles

1. **Master-Data** = Configuration, Lookup, Reference
2. **Operations** = Transactions, State Changes
3. **Section** (Frontend) = UX Grouping
4. **Domain** (Backend) = Architecture Grouping
5. **Different** section + domain is OK!
   - Example: budget_types (master-data domain) + budget section (frontend)

## 🎓 Learn More

- Read [DOMAIN_ARCHITECTURE_GUIDE.md](./DOMAIN_ARCHITECTURE_GUIDE.md) ละเอียด
- Use `/tmp/check_domain.sh` ก่อน generate
- Check migration files to understand table structure
- Follow the Decision Tree in the guide
