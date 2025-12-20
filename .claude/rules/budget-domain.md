---
paths:
  - apps/api/src/layers/domains/inventory/budget/**/*.ts
  - apps/api/src/layers/domains/inventory/master-data/budgets/**/*.ts
  - apps/api/src/layers/domains/inventory/master-data/budgetTypes/**/*.ts
  - apps/api/src/layers/domains/inventory/master-data/budgetCategories/**/*.ts
  - apps/api/src/layers/domains/inventory/operations/budgetAllocations/**/*.ts
  - apps/api/src/layers/domains/inventory/operations/budgetPlans/**/*.ts
  - apps/web/src/app/features/inventory/**/budget*/**/*.ts
---

# Budget Domain Rules

## Architecture Overview

Budget-related modules are distributed across multiple directories:

```
apps/api/src/layers/domains/inventory/
├── master-data/
│   ├── budgets/             # Budget configuration (master-data)
│   ├── budgetTypes/         # Budget types (capital, operational, etc.)
│   └── budgetCategories/    # Budget categories
├── operations/
│   ├── budgetAllocations/   # Budget allocations (operations)
│   └── budgetPlans/         # Budget plans (operations)
└── budget/
    ├── budgetRequests/      # Budget request workflow
    ├── budgetRequestItems/  # Budget request line items
    └── budgetRequestComments/ # Budget request comments
```

**NOTE**: Budget follows the SAME plugin pattern as described in `inventory-domain.md`. ใช้ pattern เดียวกัน!

## Domain Classification

### Master-Data (Configuration)

- `budgets` - Budget configuration (งบประมาณ)
- `budgetTypes` - Budget types (ประเภทงบ: งบลงทุน, งบดำเนินงาน)
- `budgetCategories` - Budget categories (หมวดงบ)

**Location**: `apps/api/src/layers/domains/inventory/master-data/budgets/`

**CRUD Command**:

```bash
pnpm run crud -- budgets --domain inventory/master-data --schema inventory --force
```

### Operations (Transactional)

- `budgetAllocations` - Budget allocations (การจัดสรรงบ)
- `budgetPlans` - Budget planning (แผนงบประมาณ)

**Location**: `apps/api/src/layers/domains/inventory/operations/budgetAllocations/`

**CRUD Command**:

```bash
pnpm run crud -- budget_allocations --domain inventory/operations --schema inventory --force
```

### Budget Domain (Workflow)

- `budgetRequests` - Budget requests (คำของบประมาณ)
- `budgetRequestItems` - Budget request items (รายการคำขอ)
- `budgetRequestComments` - Budget request comments (ความเห็น)

**Location**: `apps/api/src/layers/domains/inventory/budget/budgetRequests/`

**CRUD Command**:

```bash
pnpm run crud -- budget_requests --domain inventory/budget --schema inventory --force
```

## Amount Fields (CRITICAL)

### ✅ ALWAYS use DECIMAL for money

```typescript
// Migration
table.decimal('allocated_amount', 15, 2).notNullable();
table.decimal('used_amount', 15, 2).defaultTo(0);
table.decimal('remaining_amount', 15, 2).defaultTo(0);
table.decimal('total_amount', 15, 2).notNullable();

// ❌ NEVER use FLOAT or INTEGER for money
table.float('allocated_amount'); // Precision issues!
table.integer('allocated_amount'); // Can't handle decimals!
```

### TypeBox Schema for Amounts

```typescript
import { Type } from '@sinclair/typebox';

export const BudgetAllocationSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  allocated_amount: Type.Number({ minimum: 0 }), // Must be positive
  used_amount: Type.Number({ minimum: 0 }),
  remaining_amount: Type.Number({ minimum: 0 }),
  fiscal_year: Type.Number({ minimum: 2500, maximum: 2600 }), // Buddhist year
});
```

## Budget Calculation Logic

### Remaining Amount Calculation

```typescript
export class BudgetAllocationService {
  async calculateRemaining(allocationId: string): Promise<number> {
    const allocation = await this.repo.findById(allocationId);
    if (!allocation) throw new Error('Allocation not found');

    const remaining = allocation.allocated_amount - allocation.used_amount;

    await this.repo.update(allocationId, {
      remaining_amount: remaining,
    });

    return remaining;
  }

  async checkAvailability(allocationId: string, requestedAmount: number): Promise<boolean> {
    const allocation = await this.repo.findById(allocationId);
    if (!allocation) return false;

    const remaining = allocation.allocated_amount - allocation.used_amount;
    return remaining >= requestedAmount;
  }
}
```

## Workflow Status

### Budget Request Status

```typescript
type BudgetRequestStatus = 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'cancelled';

const validTransitions: Record<BudgetRequestStatus, BudgetRequestStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['reviewing', 'cancelled'],
  reviewing: ['approved', 'rejected'],
  approved: [],
  rejected: ['draft'],
  cancelled: [],
};
```

## URL Structure

```
# Master-Data
/api/inventory/master-data/budgets             GET, POST
/api/inventory/master-data/budgets/:id         GET, PUT, DELETE
/api/inventory/master-data/budget-types        GET, POST
/api/inventory/master-data/budget-categories   GET, POST

# Operations
/api/inventory/operations/budget-allocations         GET, POST
/api/inventory/operations/budget-allocations/:id     GET, PUT, DELETE
/api/inventory/operations/budget-plans               GET, POST

# Budget Workflow
/api/inventory/budget/budget-requests                GET, POST
/api/inventory/budget/budget-requests/:id            GET, PUT, DELETE
/api/inventory/budget/budget-request-items           GET, POST
/api/inventory/budget/budget-request-comments        GET, POST
```

## Common Mistakes

### ❌ WRONG: Missing Decimal Precision

```typescript
table.float('allocated_amount'); // Don't use float!
```

### ✅ CORRECT: Use Decimal

```typescript
table.decimal('allocated_amount', 15, 2);
```

### ❌ WRONG: No Budget Check Before Transaction

```typescript
async createTransaction(data: BudgetTransaction) {
  return await this.repo.create(data); // Dangerous!
}
```

### ✅ CORRECT: Check Budget First

```typescript
async createTransaction(data: BudgetTransaction) {
  const available = await this.checkAvailability(
    data.allocation_id,
    data.amount
  );

  if (!available) {
    throw new Error('Insufficient budget');
  }

  const transaction = await this.repo.create(data);
  await this.updateUsedAmount(data.allocation_id, data.amount);
  return transaction;
}
```

## Pre-CRUD Checklist

1. ✅ Determine correct domain:
   - Master-data: Configuration tables (budgets, budget_types)
   - Operations: Transactional (budget_allocations, budget_plans)
   - Budget workflow: Request workflow (budget_requests)
2. ✅ Use DECIMAL for all amount fields
3. ✅ Use correct schema: `inventory`
4. ✅ Follow plugin pattern (same as inventory-domain.md)
5. ✅ Implement budget validation logic

## Quick Reference

```bash
# Master-Data
pnpm run crud -- budgets --domain inventory/master-data --schema inventory --force

# Operations
pnpm run crud -- budget_allocations --domain inventory/operations --schema inventory --force

# Budget Workflow
pnpm run crud -- budget_requests --domain inventory/budget --schema inventory --force
```

**For complete plugin pattern and route examples, see `inventory-domain.md`**
