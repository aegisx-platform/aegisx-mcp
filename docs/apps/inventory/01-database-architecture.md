# Database Architecture

> **Phase 1 Complete - Database foundation for Hospital Drug Inventory System**

## Design Principles

### 1. Schema Isolation

```
PostgreSQL Database (aegisx_db)
├── public schema        <- Core platform (users, roles, permissions)
└── inventory schema     <- Drug inventory module (isolated)
```

**Why separate schema?**

- **Clear boundaries**: Inventory can be deployed/upgraded independently
- **No naming conflicts**: `inventory.drugs` vs potential `public.drugs`
- **Easy backup/restore**: Can backup just inventory schema
- **Customer-specific**: Different sites can have different versions

### 2. Schema Structure Overview

```
inventory schema (69 objects)
├── Reference Tables (8)       <- Master data, rarely changes
├── Core Entities (12)         <- Main business objects
├── Transaction Tables (8)     <- Movement records
├── Junction Tables (5)        <- Many-to-many relationships
├── TMT Tables (7)            <- Thai Medical Terminology
├── Budget Tables (6)         <- Budget management
├── Views (12)                <- Reports & dashboards
├── Functions (4)             <- Business logic
└── System Tables (7)         <- Metadata & tracking
```

## Table Categories

### Reference Tables (Master Data)

| Table               | Purpose                   | Example Data                 |
| ------------------- | ------------------------- | ---------------------------- |
| `budget_types`      | Types of hospital budgets | OPD, NHSO, UC, SSO           |
| `budget_categories` | Budget categories         | ยาและเวชภัณฑ์, วัสดุการแพทย์ |
| `dosage_forms`      | Drug forms                | Tablet, Capsule, Injection   |
| `drug_units`        | Measurement units         | mg, ml, tablet               |
| `locations`         | Storage locations         | คลังยาหลัก, ห้องยา OPD       |
| `companies`         | Vendors & manufacturers   | องค์การเภสัชกรรม             |
| `purchase_methods`  | Procurement methods       | วิธีเฉพาะเจาะจง              |
| `purchase_types`    | Purchase categories       | จัดซื้อปกติ                  |

### Core Entity Tables

| Table           | Purpose          | Key Fields                              |
| --------------- | ---------------- | --------------------------------------- |
| `drugs`         | Drug master      | trade_name, generic_id, manufacturer_id |
| `drug_generics` | Generic names    | generic_name, dosage_form_id, strength  |
| `drug_lots`     | Lot tracking     | lot_number, expiry_date, quantity       |
| `inventory`     | Current stock    | drug_id, location_id, quantity          |
| `hospitals`     | Hospital info    | hospital_code, name, address            |
| `departments`   | Departments      | dept_code, dept_name                    |
| `contracts`     | Vendor contracts | contract_no, vendor_id, validity        |

### Transaction Tables

| Table                    | Purpose      | Key Fields                            |
| ------------------------ | ------------ | ------------------------------------- |
| `purchase_requests`      | PR documents | pr_number, department_id, status      |
| `purchase_orders`        | PO documents | po_number, vendor_id, contract_id     |
| `receipts`               | GR documents | receipt_number, po_id, received_date  |
| `drug_distributions`     | Distribution | from_location, to_location, quantity  |
| `drug_returns`           | Returns      | return_reason, return_date            |
| `inventory_transactions` | Movement log | transaction_type, quantity, reference |

## Enum Types

Custom PostgreSQL enums for data integrity:

```sql
-- Budget classification
CREATE TYPE inventory.budget_class AS ENUM (
  'OPERATIONAL',  -- งบดำเนินการ
  'INVESTMENT',   -- งบลงทุน
  'EMERGENCY',    -- งบฉุกเฉิน
  'RESEARCH'      -- งบวิจัย
);

-- Location types
CREATE TYPE inventory.location_type AS ENUM (
  'WAREHOUSE',    -- คลังยาหลัก
  'PHARMACY',     -- ห้องยา
  'WARD',         -- หอผู้ป่วย
  'EMERGENCY',    -- ห้องฉุกเฉิน
  'OPERATING',    -- ห้องผ่าตัด
  'ICU',          -- ไอซียู
  'STORAGE',      -- ที่เก็บย่อย
  'QUARANTINE'    -- พื้นที่กักกัน
);

-- Drug unit types
CREATE TYPE inventory.unit_type AS ENUM (
  'WEIGHT',       -- น้ำหนัก (g, mg, kg)
  'VOLUME',       -- ปริมาตร (ml, L)
  'QUANTITY',     -- จำนวน (tablet, capsule)
  'POTENCY'       -- ความแรง (IU, unit)
);

-- Document statuses
CREATE TYPE inventory.document_status AS ENUM (
  'DRAFT',        -- ร่าง
  'PENDING',      -- รออนุมัติ
  'APPROVED',     -- อนุมัติ
  'REJECTED',     -- ไม่อนุมัติ
  'CANCELLED',    -- ยกเลิก
  'COMPLETED'     -- เสร็จสิ้น
);
```

## Key Relationships

### Drug Master Data

```
drug_generics (Generic Names)
    ↓ dosage_form_id
dosage_forms (Tablet, Capsule, etc.)

drugs (Trade Names)
    ↓ generic_id
drug_generics
    ↓ manufacturer_id
companies (Manufacturers)

drug_lots (Lot/Batch Tracking)
    ↓ drug_id
drugs
    ↓ location_id
locations
```

### Procurement Flow

```
purchase_requests (PR)
    ↓ approved
purchase_orders (PO)
    ↓ vendor_id
companies (Vendors)
    ↓ received
receipts (GR)
    ↓ inspected
drug_lots (Stock In)
```

### Inventory Movement

```
inventory (Current Stock)
    ↓ transfer
drug_distributions
    ↓ from/to
locations

inventory
    ↓ issue/return
drug_returns
    ↓ reason
return_reasons
```

## Database Views

Pre-built views for common queries:

| View                           | Purpose                    |
| ------------------------------ | -------------------------- |
| `v_current_stock_summary`      | Stock by drug and location |
| `v_drug_lot_details`           | Lot details with expiry    |
| `v_expiring_drugs`             | Drugs expiring soon        |
| `v_low_stock_items`            | Below minimum stock        |
| `v_drug_movement`              | Movement history           |
| `v_procurement_summary`        | PR/PO status summary       |
| `v_budget_summary`             | Budget utilization         |
| `v_hpp_summary`                | HPP drug summary           |
| `v_ministry_drug_export`       | Ministry format export     |
| `v_ministry_stock_export`      | Ministry stock export      |
| `v_distribution_by_department` | Usage by department        |
| `v_tmt_mapping_status`         | TMT mapping progress       |

## Functions & Triggers

### Auto-update Timestamps

```sql
-- All tables use this trigger
CREATE FUNCTION inventory.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Inventory Calculations

```sql
-- Calculate average cost
CREATE FUNCTION inventory.calculate_average_cost(p_drug_id INT)
RETURNS DECIMAL(12,2);

-- Update inventory after transaction
CREATE FUNCTION inventory.update_inventory_on_transaction()
RETURNS TRIGGER;
```

## Performance Indexes

Key indexes for common queries:

```sql
-- Drug lookups
CREATE INDEX idx_drugs_generic ON inventory.drugs(generic_id);
CREATE INDEX idx_drugs_manufacturer ON inventory.drugs(manufacturer_id);

-- Inventory queries
CREATE INDEX idx_inventory_drug_location ON inventory.inventory(drug_id, location_id);
CREATE INDEX idx_drug_lots_expiry ON inventory.drug_lots(expiry_date);

-- Document searches
CREATE INDEX idx_pr_status ON inventory.purchase_requests(status);
CREATE INDEX idx_po_vendor ON inventory.purchase_orders(vendor_id);
CREATE INDEX idx_receipts_date ON inventory.receipts(received_date);
```

## Thai Medical Terminology (TMT) Integration

### TMT Table Structure

```
tmt_concepts (Main TMT data)
├── tmt_id (UUID)
├── tmt_level (VTM, GPU, TPU, GP, TP, GPUID, TPUID)
├── name_th, name_en
├── status (ACTIVE, INACTIVE)
└── parent_tmt_id (hierarchy)

tmt_relationships (Concept links)
├── source_tmt_id
├── target_tmt_id
└── relationship_type

tmt_mappings (Drug-to-TMT mapping)
├── drug_id -> drugs.id
├── tmt_concept_id -> tmt_concepts.id
└── mapping_status (VERIFIED, PENDING)
```

### TMT Hierarchy

```
VTM (Virtual Therapeutic Moiety)
 └── GPU (Generic Product Unspecified)
      └── TPU (Trade Product Unspecified)
           └── GP (Generic Product)
                └── TP (Trade Product)
                     ├── GPUID (GP + Unique ID)
                     └── TPUID (TP + Unique ID)
```

## Ministry Export Compliance

Views formatted for กระทรวงสาธารณสุข reporting:

### v_ministry_drug_export

```sql
SELECT
  hospital_code,        -- รหัสสถานพยาบาล
  drug_code,           -- รหัสยา
  tmt_id,              -- รหัส TMT
  generic_name,        -- ชื่อสามัญทางยา
  trade_name,          -- ชื่อการค้า
  strength,            -- ความแรง
  dosage_form,         -- รูปแบบยา
  package_size,        -- ขนาดบรรจุ
  unit_price,          -- ราคาต่อหน่วย
  nlem_category        -- บัญชียาหลักแห่งชาติ
FROM inventory.v_ministry_drug_export;
```

### v_ministry_stock_export

```sql
SELECT
  hospital_code,       -- รหัสสถานพยาบาล
  report_date,         -- วันที่รายงาน
  drug_code,           -- รหัสยา
  beginning_balance,   -- ยอดยกมา
  received_qty,        -- รับเข้า
  issued_qty,          -- จ่ายออก
  adjusted_qty,        -- ปรับปรุง
  ending_balance       -- คงเหลือ
FROM inventory.v_ministry_stock_export;
```

## Schema Version Tracking

```sql
-- Track schema version for upgrades
CREATE TABLE inventory.system_info (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Current tracked values:
-- schema_version: '1.0.0'
-- last_seeded_at: ISO timestamp
-- installed_at: ISO timestamp
```
