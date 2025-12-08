# Inventory App - Next Phase Specification for Haiku

**Document**: Technical Specification for Remaining Backend APIs
**Created**: 2024-12-08
**For**: Claude Haiku (Cost-effective AI model)
**Status**: Ready for implementation
**Estimated Time**: 2-4 hours

---

## Executive Summary

Generate remaining backend API modules (13 modules total) for the Hospital Drug Inventory Management System using the CRUD generator tool with consistent patterns.

**What's Already Done:**

- ✅ 19 Master Data backend modules complete
- ✅ PostgreSQL schema prefix bug fixed
- ✅ All modules use correct schema-qualified queries

**What Needs To Be Done:**

- Generate 13 remaining backend modules across 3 categories:
  1. Procurement APIs (8 modules)
  2. Inventory APIs (3 modules)
  3. Distribution & Return APIs (2 modules)

---

## Prerequisites

### Environment Check

```bash
# Verify current working directory
pwd
# Expected: /Users/sathitseethaphon/projects/aegisx-platform/aegisx-starter-1

# Verify database schema exists
psql -U postgres -d aegisx_dev_1 -c "\dn inventory"
# Should show: inventory schema

# Verify CRUD generator is working
node libs/aegisx-cli/bin/cli.js --version
# Should show version number

# Verify migrations are applied
pnpm run db:migrate:inventory
# Should show: Already up to date
```

### Required Information

- **Database Schema**: `inventory`
- **Domain Path**: `inventory/procurement`, `inventory/operations`
- **Target**: `backend`
- **Force Mode**: `--force` (to overwrite if exists)

---

## Task Breakdown

### Phase 3.2: Procurement APIs (8 modules)

Generate 8 CRUD modules for procurement system.

#### Table Mapping

| #   | Table Name           | Snake Case           | Module Name        | Description                |
| --- | -------------------- | -------------------- | ------------------ | -------------------------- |
| 1   | purchase_orders      | purchase_orders      | purchaseOrders     | Purchase order headers     |
| 2   | purchase_order_items | purchase_order_items | purchaseOrderItems | PO line items              |
| 3   | suppliers            | suppliers            | suppliers          | Supplier/vendor master     |
| 4   | purchase_requests    | purchase_requests    | purchaseRequests   | PR from departments        |
| 5   | quotations           | quotations           | quotations         | Vendor quotations          |
| 6   | tender_processes     | tender_processes     | tenderProcesses    | Tender/bidding processes   |
| 7   | delivery_notes       | delivery_notes       | deliveryNotes      | Goods receipt notes        |
| 8   | inspection_records   | inspection_records   | inspectionRecords  | Quality inspection records |

#### Generation Commands

```bash
# Navigate to project root
cd /Users/sathitseethaphon/projects/aegisx-platform/aegisx-starter-1

# 1. Purchase Orders
node libs/aegisx-cli/bin/cli.js generate purchase_orders \
  --target backend \
  --domain inventory/procurement \
  --schema inventory \
  --force

# 2. Purchase Order Items
node libs/aegisx-cli/bin/cli.js generate purchase_order_items \
  --target backend \
  --domain inventory/procurement \
  --schema inventory \
  --force

# 3. Suppliers
node libs/aegisx-cli/bin/cli.js generate suppliers \
  --target backend \
  --domain inventory/procurement \
  --schema inventory \
  --force

# 4. Purchase Requests
node libs/aegisx-cli/bin/cli.js generate purchase_requests \
  --target backend \
  --domain inventory/procurement \
  --schema inventory \
  --force

# 5. Quotations
node libs/aegisx-cli/bin/cli.js generate quotations \
  --target backend \
  --domain inventory/procurement \
  --schema inventory \
  --force

# 6. Tender Processes
node libs/aegisx-cli/bin/cli.js generate tender_processes \
  --target backend \
  --domain inventory/procurement \
  --schema inventory \
  --force

# 7. Delivery Notes
node libs/aegisx-cli/bin/cli.js generate delivery_notes \
  --target backend \
  --domain inventory/procurement \
  --schema inventory \
  --force

# 8. Inspection Records
node libs/aegisx-cli/bin/cli.js generate inspection_records \
  --target backend \
  --domain inventory/procurement \
  --schema inventory \
  --force
```

---

### Phase 3.3: Inventory APIs (3 modules)

Generate 3 CRUD modules for inventory operations.

#### Table Mapping

| #   | Table Name        | Snake Case        | Module Name      | Description               |
| --- | ----------------- | ----------------- | ---------------- | ------------------------- |
| 1   | stock_balances    | stock_balances    | stockBalances    | Current stock levels      |
| 2   | stock_movements   | stock_movements   | stockMovements   | Stock in/out transactions |
| 3   | stock_adjustments | stock_adjustments | stockAdjustments | Manual adjustments        |

#### Generation Commands

```bash
# Navigate to project root
cd /Users/sathitseethaphon/projects/aegisx-platform/aegisx-starter-1

# 1. Stock Balances
node libs/aegisx-cli/bin/cli.js generate stock_balances \
  --target backend \
  --domain inventory/operations \
  --schema inventory \
  --force

# 2. Stock Movements
node libs/aegisx-cli/bin/cli.js generate stock_movements \
  --target backend \
  --domain inventory/operations \
  --schema inventory \
  --force

# 3. Stock Adjustments
node libs/aegisx-cli/bin/cli.js generate stock_adjustments \
  --target backend \
  --domain inventory/operations \
  --schema inventory \
  --force
```

---

### Phase 3.4: Distribution & Return APIs (2 modules)

Generate 2 CRUD modules for distribution and returns.

#### Table Mapping

| #   | Table Name    | Snake Case    | Module Name   | Description                |
| --- | ------------- | ------------- | ------------- | -------------------------- |
| 1   | distributions | distributions | distributions | Drug distribution to wards |
| 2   | returns       | returns       | returns       | Return from wards/expired  |

#### Generation Commands

```bash
# Navigate to project root
cd /Users/sathitseethaphon/projects/aegisx-platform/aegisx-starter-1

# 1. Distributions
node libs/aegisx-cli/bin/cli.js generate distributions \
  --target backend \
  --domain inventory/operations \
  --schema inventory \
  --force

# 2. Returns
node libs/aegisx-cli/bin/cli.js generate returns \
  --target backend \
  --domain inventory/operations \
  --schema inventory \
  --force
```

---

## Batch Generation Script

### Option 1: Sequential Generation

Create this script: `/tmp/generate_remaining_backend.sh`

```bash
#!/bin/bash

# Batch generate remaining inventory backend modules
# Run from project root

echo "🚀 Starting batch generation of remaining backend modules..."
echo ""

CLI="/Users/sathitseethaphon/projects/aegisx-platform/aegisx-starter-1/libs/aegisx-cli/bin/cli.js"
SCHEMA="inventory"

SUCCESS=0
FAILED=0

# Procurement modules (8)
echo "📦 === PROCUREMENT MODULES ==="
PROCUREMENT_TABLES=(
  "purchase_orders"
  "purchase_order_items"
  "suppliers"
  "purchase_requests"
  "quotations"
  "tender_processes"
  "delivery_notes"
  "inspection_records"
)

for table in "${PROCUREMENT_TABLES[@]}"; do
  echo "Generating: $table"
  if node "$CLI" generate "$table" \
    --target backend \
    --domain inventory/procurement \
    --schema "$SCHEMA" \
    --force > /tmp/gen_${table}.log 2>&1; then
    echo "   ✅ SUCCESS"
    ((SUCCESS++))
  else
    echo "   ❌ FAILED (check /tmp/gen_${table}.log)"
    ((FAILED++))
  fi
  echo ""
done

# Operations modules (5)
echo "🏭 === OPERATIONS MODULES ==="
OPERATIONS_TABLES=(
  "stock_balances"
  "stock_movements"
  "stock_adjustments"
  "distributions"
  "returns"
)

for table in "${OPERATIONS_TABLES[@]}"; do
  echo "Generating: $table"
  if node "$CLI" generate "$table" \
    --target backend \
    --domain inventory/operations \
    --schema "$SCHEMA" \
    --force > /tmp/gen_${table}.log 2>&1; then
    echo "   ✅ SUCCESS"
    ((SUCCESS++))
  else
    echo "   ❌ FAILED (check /tmp/gen_${table}.log)"
    ((FAILED++))
  fi
  echo ""
done

echo "========================================" echo "📊 Generation Summary:"
echo "   ✅ Success: $SUCCESS"
echo "   ❌ Failed:  $FAILED"
echo "   📝 Total:   13"
echo "========================================"
echo ""
echo "✅ Batch generation complete!"
```

**How to use:**

```bash
chmod +x /tmp/generate_remaining_backend.sh
bash /tmp/generate_remaining_backend.sh
```

---

## Verification Steps

### After Generation

For each module, verify the following files exist:

```
apps/api/src/modules/inventory/
├── procurement/
│   ├── index.ts
│   ├── purchaseOrders/
│   │   ├── index.ts
│   │   ├── purchase-orders.controller.ts
│   │   ├── purchase-orders.service.ts
│   │   ├── purchase-orders.repository.ts
│   │   ├── purchase-orders.schemas.ts
│   │   ├── purchase-orders.types.ts
│   │   ├── purchase-orders.route.ts
│   │   └── __tests__/
│   │       └── purchase-orders.test.ts
│   └── [other procurement modules...]
└── operations/
    ├── index.ts
    └── [operations modules...]
```

### Critical Checks

**1. Schema Prefix Verification**

Check that repositories use `inventory.table_name`:

```bash
# Example: Check purchase_orders repository
grep -n "inventory.purchase_orders" \
  apps/api/src/modules/inventory/procurement/purchaseOrders/purchase-orders.repository.ts

# Should show multiple lines with 'inventory.purchase_orders'
```

**2. Permission Migrations**

Verify permission migration files are created:

```bash
ls -l apps/api/src/database/migrations-inventory/*_add_*_permissions.ts | tail -13

# Should show 13 new permission migration files
```

**3. Domain Registration**

Check that domains are registered:

```bash
# Check procurement domain
grep -A 5 "procurement" apps/api/src/modules/inventory/index.ts

# Check operations domain
grep -A 5 "operations" apps/api/src/modules/inventory/index.ts
```

**4. Route Prefixes**

Verify routes have correct prefixes:

```bash
# Procurement routes should be: /api/inventory/procurement/*
# Operations routes should be: /api/inventory/operations/*
```

---

## Expected Output Files

### Total Files Generated

- **8 Procurement modules** × 8 files = 64 files
- **5 Operations modules** × 8 files = 40 files
- **13 Permission migrations** = 13 files
- **2 Domain index files** (procurement, operations)

**Grand Total**: ~117 new files

### Directory Structure After Completion

```
apps/api/src/
├── modules/inventory/
│   ├── index.ts                    # Updated
│   ├── master-data/                # 19 modules (existing)
│   ├── procurement/                # NEW - 8 modules
│   │   ├── index.ts
│   │   ├── purchaseOrders/
│   │   ├── purchaseOrderItems/
│   │   ├── suppliers/
│   │   ├── purchaseRequests/
│   │   ├── quotations/
│   │   ├── tenderProcesses/
│   │   ├── deliveryNotes/
│   │   └── inspectionRecords/
│   └── operations/                 # NEW - 5 modules
│       ├── index.ts
│       ├── stockBalances/
│       ├── stockMovements/
│       ├── stockAdjustments/
│       ├── distributions/
│       └── returns/
└── database/migrations-inventory/
    └── [13 new permission migrations]
```

---

## Error Handling

### Common Issues & Solutions

**Issue 1: Table not found in database**

```
Error: Table 'purchase_orders' does not exist in schema 'inventory'
```

**Solution:**

```bash
# Check if migration exists
ls apps/api/src/database/migrations-inventory/*_create_purchase_orders.ts

# Run migrations if needed
pnpm run db:migrate:inventory
```

**Issue 2: Domain path already exists**

```
Error: Domain 'inventory/procurement' already exists
```

**Solution:**

```bash
# This is OK - domain initialization only happens once
# Modules will be added to existing domain
```

**Issue 3: Schema prefix not applied**

```
Error: relation "purchase_orders" does not exist
```

**Solution:**

- Verify backend-generator.js has `fullTableName` context (already fixed on 2024-12-08)
- Check repository.hbs template uses `{{fullTableName}}`
- Re-generate the module if needed

---

## Quality Assurance Checklist

After completing all generations:

### Code Quality

- [ ] All 13 modules generated successfully
- [ ] No TypeScript compilation errors
- [ ] All imports resolve correctly
- [ ] Schema prefix used in all repositories

### Database

- [ ] All permission migrations created
- [ ] Migrations can run without errors
- [ ] No foreign key constraint violations

### Testing

- [ ] Test files generated for all modules
- [ ] Basic CRUD operations work
- [ ] Permission checks function correctly

### Documentation

- [ ] Update PROJECT_PROGRESS.md with completion status
- [ ] Mark Phase 3 as 100% complete (32/32 modules)

---

## Post-Generation Tasks

### 1. Run Migrations

```bash
pnpm run db:migrate:inventory
```

### 2. Format Code

```bash
pnpm run format
```

### 3. Build Project

```bash
pnpm run build
```

### 4. Commit Changes

```bash
git add apps/api/src/modules/inventory/procurement/
git add apps/api/src/modules/inventory/operations/
git add apps/api/src/database/migrations-inventory/
git add apps/api/src/modules/inventory/index.ts

git commit -m "feat(inventory): generate remaining backend APIs (13 modules)

- Added 8 Procurement modules (purchase orders, suppliers, etc.)
- Added 5 Operations modules (stock balance, movements, distributions)
- Generated permission migrations for all modules
- Domain structure: inventory/procurement, inventory/operations

Modules generated:
Procurement: purchaseOrders, purchaseOrderItems, suppliers,
purchaseRequests, quotations, tenderProcesses, deliveryNotes,
inspectionRecords

Operations: stockBalances, stockMovements, stockAdjustments,
distributions, returns

Backend APIs: 32/32 (100%)
"
```

### 5. Push to Remote

```bash
git push origin develop
```

---

## Success Criteria

- ✅ All 13 backend modules generated
- ✅ All files compile without TypeScript errors
- ✅ All modules use schema-qualified table names (`inventory.table_name`)
- ✅ Permission migrations created and applied
- ✅ Domains registered correctly (`procurement`, `operations`)
- ✅ Code formatted and linted
- ✅ Changes committed and pushed
- ✅ PROJECT_PROGRESS.md updated to show 100% backend completion

---

## Timeline Estimate

| Task                     | Time        |
| ------------------------ | ----------- |
| Setup & verification     | 10 min      |
| Generate Procurement (8) | 30 min      |
| Generate Operations (5)  | 20 min      |
| Verification & testing   | 20 min      |
| Migrations & build       | 15 min      |
| Commit & push            | 10 min      |
| Documentation update     | 15 min      |
| **Total**                | **2 hours** |

---

## Notes for Haiku

1. **Use the batch script** for efficiency - don't run commands manually
2. **Check logs** if any generation fails (`/tmp/gen_*.log`)
3. **Verify schema prefix** in at least 2-3 generated repositories
4. **Run migrations** before committing
5. **Test build** to catch any TypeScript errors early
6. **Update metrics** in PROJECT_PROGRESS.md when done

---

## Contact & Support

If you encounter any blocking issues:

1. Check error logs in `/tmp/gen_*.log`
2. Verify database migrations are up to date
3. Confirm CRUD generator fix is applied (schema prefix support)
4. Check existing master-data modules as reference

---

_Specification prepared: 2024-12-08_
_Ready for execution: Yes_
_Estimated completion: 2 hours_
