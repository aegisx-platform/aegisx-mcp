# Phase 3: Backend API Development

**Status**: NOT_STARTED
**Depends on**: Phase 1 Complete (Phase 2 optional for basic CRUD)
**Total Modules**: 28 API modules across 8 systems

---

## Strategy

1. ใช้ CRUD Generator สำหรับ basic CRUD operations
2. สร้าง Custom endpoints สำหรับ business logic
3. แบ่ง development เป็น parallel tracks

---

## API Module Structure

```
apps/api/src/modules/inventory/
├── master/
│   ├── locations/
│   ├── departments/
│   ├── companies/
│   ├── dosage-forms/
│   ├── drug-units/
│   ├── drug-generics/
│   └── drugs/
├── budget/
│   ├── allocations/
│   ├── plans/
│   └── reservations/
├── procurement/
│   ├── contracts/
│   ├── purchase-requests/
│   ├── purchase-orders/
│   └── receipts/
├── stock/
│   ├── inventory/
│   ├── drug-lots/
│   └── transactions/
├── operations/
│   ├── distributions/
│   └── returns/
└── integration/
    ├── tmt/
    └── hpp/
```

---

## Parallel Development Tracks

### Track A: Master Data APIs (สามารถเริ่มได้ทันทีหลัง Phase 1.2)

| Module        | CRUD Type | Custom Endpoints         | Status |
| ------------- | --------- | ------------------------ | ------ |
| locations     | standard  | hierarchy tree           | [ ]    |
| departments   | standard  | hierarchy tree           | [ ]    |
| companies     | import    | vendor search            | [ ]    |
| dosage-forms  | standard  | -                        | [ ]    |
| drug-units    | standard  | -                        | [ ]    |
| drug-generics | import    | search, TMT link         | [ ]    |
| drugs         | import    | advanced search, barcode | [ ]    |

**Commands**:

```bash
# Generate in sequence
pnpm run crud -- inventory.locations --force
pnpm run crud -- inventory.departments --force
pnpm run crud:import -- inventory.companies --force
pnpm run crud -- inventory.dosage_forms --force
pnpm run crud -- inventory.drug_units --force
pnpm run crud:import -- inventory.drug_generics --force
pnpm run crud:import -- inventory.drugs --force
```

---

### Track B: Budget APIs (สามารถเริ่มได้หลัง Phase 1.3)

| Module              | CRUD Type   | Custom Endpoints       | Status |
| ------------------- | ----------- | ---------------------- | ------ |
| budget-allocations  | standard    | quarterly summary      | [ ]    |
| budget-plans        | standard    | approve workflow       | [ ]    |
| budget-plan-items   | standard    | consumption calc       | [ ]    |
| budget-reservations | standard    | expire check           | [ ]    |
| budget-checking     | custom only | check, reserve, commit | [ ]    |

**Custom Endpoints**:

```
POST /api/inventory/budget/check-availability
POST /api/inventory/budget/reserve
POST /api/inventory/budget/commit
POST /api/inventory/budget/release
```

**Commands**:

```bash
pnpm run crud -- inventory.budget_allocations --force
pnpm run crud -- inventory.budget_plans --force
pnpm run crud -- inventory.budget_plan_items --force
pnpm run crud -- inventory.budget_reservations --force
# Custom budget-checking module (manual)
```

---

### Track C: Procurement APIs (สามารถเริ่มได้หลัง Phase 1.4)

| Module            | CRUD Type | Custom Endpoints | Status |
| ----------------- | --------- | ---------------- | ------ |
| contracts         | standard  | status check     | [ ]    |
| contract-items    | standard  | availability     | [ ]    |
| purchase-requests | standard  | submit, approve  | [ ]    |
| pr-items          | standard  | -                | [ ]    |
| purchase-orders   | standard  | convert from PR  | [ ]    |
| po-items          | standard  | -                | [ ]    |
| receipts          | standard  | verify, post     | [ ]    |
| receipt-items     | standard  | lot creation     | [ ]    |
| approvals         | standard  | approve/reject   | [ ]    |
| payments          | standard  | status update    | [ ]    |

**Workflow Endpoints**:

```
POST /api/inventory/pr/{id}/submit
POST /api/inventory/pr/{id}/approve
POST /api/inventory/pr/{id}/convert-to-po
POST /api/inventory/po/{id}/send
POST /api/inventory/receipt/{id}/verify
POST /api/inventory/receipt/{id}/post
```

**Commands**:

```bash
pnpm run crud -- inventory.contracts --force
pnpm run crud -- inventory.purchase_requests --force
pnpm run crud -- inventory.purchase_orders --force
pnpm run crud -- inventory.receipts --force
pnpm run crud -- inventory.approval_documents --force
pnpm run crud -- inventory.payment_documents --force
```

---

### Track D: Inventory APIs (สามารถเริ่มได้หลัง Phase 1.5)

| Module       | CRUD Type | Custom Endpoints | Status |
| ------------ | --------- | ---------------- | ------ |
| inventory    | events    | stock update     | [ ]    |
| drug-lots    | standard  | FIFO/FEFO select | [ ]    |
| transactions | standard  | audit trail      | [ ]    |

**Custom Endpoints**:

```
GET  /api/inventory/stock/summary
GET  /api/inventory/stock/low-stock
GET  /api/inventory/stock/expiring
POST /api/inventory/stock/adjust
GET  /api/inventory/lots/fifo/{drugId}/{locationId}
GET  /api/inventory/lots/fefo/{drugId}/{locationId}
```

**Commands**:

```bash
pnpm run crud:events -- inventory.inventory --force
pnpm run crud -- inventory.drug_lots --force
pnpm run crud -- inventory.inventory_transactions --force
```

---

### Track E: Operations APIs (สามารถเริ่มได้หลัง Phase 1.6)

| Module             | CRUD Type | Custom Endpoints  | Status |
| ------------------ | --------- | ----------------- | ------ |
| distributions      | standard  | approve, dispense | [ ]    |
| distribution-items | standard  | lot deduction     | [ ]    |
| drug-returns       | standard  | verify, post      | [ ]    |
| return-items       | standard  | action routing    | [ ]    |

**Commands**:

```bash
pnpm run crud -- inventory.drug_distributions --force
pnpm run crud -- inventory.drug_returns --force
```

---

### Track F: Integration APIs (สามารถเริ่มได้หลัง Phase 1.7)

| Module       | CRUD Type | Custom Endpoints  | Status |
| ------------ | --------- | ----------------- | ------ |
| tmt-concepts | standard  | search, hierarchy | [ ]    |
| tmt-mappings | standard  | verify, batch map | [ ]    |
| hpp-products | standard  | formula calc      | [ ]    |

**Commands**:

```bash
pnpm run crud -- inventory.tmt_concepts --force
pnpm run crud -- inventory.tmt_mappings --force
pnpm run crud -- inventory.hospital_pharmaceutical_products --force
```

---

## Route Registration

**File**: `apps/api/src/modules/inventory/inventory.routes.ts`

```typescript
import { FastifyInstance } from 'fastify';

export async function inventoryRoutes(fastify: FastifyInstance) {
  // Master Data
  fastify.register(import('./master/locations/locations.routes'), { prefix: '/locations' });
  fastify.register(import('./master/departments/departments.routes'), { prefix: '/departments' });
  fastify.register(import('./master/companies/companies.routes'), { prefix: '/companies' });
  fastify.register(import('./master/drugs/drugs.routes'), { prefix: '/drugs' });
  fastify.register(import('./master/drug-generics/drug-generics.routes'), { prefix: '/drug-generics' });

  // Budget
  fastify.register(import('./budget/allocations/allocations.routes'), { prefix: '/budget/allocations' });
  fastify.register(import('./budget/plans/plans.routes'), { prefix: '/budget/plans' });
  fastify.register(import('./budget/checking/checking.routes'), { prefix: '/budget' });

  // Procurement
  fastify.register(import('./procurement/contracts/contracts.routes'), { prefix: '/contracts' });
  fastify.register(import('./procurement/pr/pr.routes'), { prefix: '/pr' });
  fastify.register(import('./procurement/po/po.routes'), { prefix: '/po' });
  fastify.register(import('./procurement/receipts/receipts.routes'), { prefix: '/receipts' });

  // Stock
  fastify.register(import('./stock/inventory/inventory.routes'), { prefix: '/stock' });
  fastify.register(import('./stock/lots/lots.routes'), { prefix: '/lots' });

  // Operations
  fastify.register(import('./operations/distributions/distributions.routes'), { prefix: '/distributions' });
  fastify.register(import('./operations/returns/returns.routes'), { prefix: '/returns' });

  // Integration
  fastify.register(import('./integration/tmt/tmt.routes'), { prefix: '/tmt' });
  fastify.register(import('./integration/hpp/hpp.routes'), { prefix: '/hpp' });
}
```

**Register in app**:

```typescript
// apps/api/src/app/app.ts
fastify.register(import('../modules/inventory/inventory.routes'), {
  prefix: '/api/inventory',
});
```

---

## API Base URLs

| System      | Base URL                                                            |
| ----------- | ------------------------------------------------------------------- |
| Master Data | `/api/inventory/locations`, `/api/inventory/drugs`, etc.            |
| Budget      | `/api/inventory/budget/*`                                           |
| Procurement | `/api/inventory/pr`, `/api/inventory/po`, `/api/inventory/receipts` |
| Stock       | `/api/inventory/stock`, `/api/inventory/lots`                       |
| Operations  | `/api/inventory/distributions`, `/api/inventory/returns`            |
| Integration | `/api/inventory/tmt`, `/api/inventory/hpp`                          |

---

## Completion Criteria

- [ ] All 28 CRUD modules generated
- [ ] All custom workflow endpoints implemented
- [ ] All routes registered
- [ ] API documentation generated (OpenAPI)
- [ ] Basic tests passing

---

## Next Phase

After completing Phase 3, proceed to [Phase 4: Frontend](./PHASE_4_FRONTEND.md)

---

_Created: 2024-12-05_
