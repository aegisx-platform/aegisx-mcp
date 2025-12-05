# API Development Checklist

**Total**: 28 modules across 8 systems

---

## Quick Status

| System       | Modules | Done  | %      |
| ------------ | ------- | ----- | ------ |
| Master Data  | 7       | 0     | 0%     |
| Budget       | 5       | 0     | 0%     |
| Procurement  | 8       | 0     | 0%     |
| Inventory    | 3       | 0     | 0%     |
| Distribution | 2       | 0     | 0%     |
| Return       | 2       | 0     | 0%     |
| TMT          | 2       | 0     | 0%     |
| HPP          | 1       | 0     | 0%     |
| **Total**    | **28**  | **0** | **0%** |

---

## System 1: Master Data APIs

| Module        | CRUD Type | Command                                           | Status |
| ------------- | --------- | ------------------------------------------------- | ------ |
| locations     | standard  | `pnpm run crud -- inventory.locations`            | [ ]    |
| departments   | standard  | `pnpm run crud -- inventory.departments`          | [ ]    |
| companies     | import    | `pnpm run crud:import -- inventory.companies`     | [ ]    |
| dosage-forms  | standard  | `pnpm run crud -- inventory.dosage_forms`         | [ ]    |
| drug-units    | standard  | `pnpm run crud -- inventory.drug_units`           | [ ]    |
| drug-generics | import    | `pnpm run crud:import -- inventory.drug_generics` | [ ]    |
| drugs         | import    | `pnpm run crud:import -- inventory.drugs`         | [ ]    |

---

## System 2: Budget APIs

| Module              | CRUD Type | Command                                          | Status |
| ------------------- | --------- | ------------------------------------------------ | ------ |
| budget-allocations  | standard  | `pnpm run crud -- inventory.budget_allocations`  | [ ]    |
| budget-plans        | standard  | `pnpm run crud -- inventory.budget_plans`        | [ ]    |
| budget-plan-items   | standard  | `pnpm run crud -- inventory.budget_plan_items`   | [ ]    |
| budget-reservations | standard  | `pnpm run crud -- inventory.budget_reservations` | [ ]    |
| budget-checking     | custom    | Manual implementation                            | [ ]    |

**Custom Endpoints**:

- [ ] `POST /api/inventory/budget/check-availability`
- [ ] `POST /api/inventory/budget/reserve`
- [ ] `POST /api/inventory/budget/commit`
- [ ] `POST /api/inventory/budget/release`

---

## System 3: Procurement APIs

| Module             | CRUD Type | Command                                         | Status |
| ------------------ | --------- | ----------------------------------------------- | ------ |
| contracts          | standard  | `pnpm run crud -- inventory.contracts`          | [ ]    |
| contract-items     | standard  | `pnpm run crud -- inventory.contract_items`     | [ ]    |
| purchase-requests  | standard  | `pnpm run crud -- inventory.purchase_requests`  | [ ]    |
| purchase-orders    | standard  | `pnpm run crud -- inventory.purchase_orders`    | [ ]    |
| receipts           | standard  | `pnpm run crud -- inventory.receipts`           | [ ]    |
| receipt-inspectors | standard  | `pnpm run crud -- inventory.receipt_inspectors` | [ ]    |
| approval-documents | standard  | `pnpm run crud -- inventory.approval_documents` | [ ]    |
| payment-documents  | standard  | `pnpm run crud -- inventory.payment_documents`  | [ ]    |

**Workflow Endpoints**:

- [ ] `POST /api/inventory/pr/{id}/submit`
- [ ] `POST /api/inventory/pr/{id}/approve`
- [ ] `POST /api/inventory/pr/{id}/convert-to-po`
- [ ] `POST /api/inventory/po/{id}/send`
- [ ] `POST /api/inventory/receipt/{id}/verify`
- [ ] `POST /api/inventory/receipt/{id}/post`

---

## System 4: Inventory APIs

| Module                 | CRUD Type | Command                                             | Status |
| ---------------------- | --------- | --------------------------------------------------- | ------ |
| inventory              | events    | `pnpm run crud:events -- inventory.inventory`       | [ ]    |
| drug-lots              | standard  | `pnpm run crud -- inventory.drug_lots`              | [ ]    |
| inventory-transactions | standard  | `pnpm run crud -- inventory.inventory_transactions` | [ ]    |

**Custom Endpoints**:

- [ ] `GET /api/inventory/stock/summary`
- [ ] `GET /api/inventory/stock/low-stock`
- [ ] `GET /api/inventory/stock/expiring`
- [ ] `POST /api/inventory/stock/adjust`
- [ ] `GET /api/inventory/lots/fifo/{drugId}/{locationId}`
- [ ] `GET /api/inventory/lots/fefo/{drugId}/{locationId}`

---

## System 5: Distribution APIs

| Module             | CRUD Type | Command                                              | Status |
| ------------------ | --------- | ---------------------------------------------------- | ------ |
| drug-distributions | standard  | `pnpm run crud -- inventory.drug_distributions`      | [ ]    |
| distribution-items | standard  | `pnpm run crud -- inventory.drug_distribution_items` | [ ]    |

**Workflow Endpoints**:

- [ ] `POST /api/inventory/distributions/{id}/approve`
- [ ] `POST /api/inventory/distributions/{id}/dispense`

---

## System 6: Return APIs

| Module       | CRUD Type | Command                                        | Status |
| ------------ | --------- | ---------------------------------------------- | ------ |
| drug-returns | standard  | `pnpm run crud -- inventory.drug_returns`      | [ ]    |
| return-items | standard  | `pnpm run crud -- inventory.drug_return_items` | [ ]    |

**Workflow Endpoints**:

- [ ] `POST /api/inventory/returns/{id}/submit`
- [ ] `POST /api/inventory/returns/{id}/verify`
- [ ] `POST /api/inventory/returns/{id}/post`

---

## System 7: TMT APIs

| Module       | CRUD Type | Command                                   | Status |
| ------------ | --------- | ----------------------------------------- | ------ |
| tmt-concepts | standard  | `pnpm run crud -- inventory.tmt_concepts` | [ ]    |
| tmt-mappings | standard  | `pnpm run crud -- inventory.tmt_mappings` | [ ]    |

**Custom Endpoints**:

- [ ] `GET /api/inventory/tmt/search`
- [ ] `GET /api/inventory/tmt/hierarchy/{conceptId}`
- [ ] `POST /api/inventory/tmt/mappings/verify`

---

## System 8: HPP APIs

| Module       | CRUD Type | Command                                                       | Status |
| ------------ | --------- | ------------------------------------------------------------- | ------ |
| hpp-products | standard  | `pnpm run crud -- inventory.hospital_pharmaceutical_products` | [ ]    |

---

## Route Registration

- [ ] Create `apps/api/src/modules/inventory/inventory.routes.ts`
- [ ] Register in `apps/api/src/app/app.ts`
- [ ] Verify OpenAPI documentation

---

_Updated: 2024-12-05_
