# 📊 Hospital Budget Planning System - Technical Specification

**Version:** 1.0.0
**Date:** 2025-12-08
**Status:** Draft
**Author:** System Analysis Team

---

## 📑 Table of Contents

1. [System Overview](#1-system-overview)
2. [Business Requirements](#2-business-requirements)
3. [System Workflow](#3-system-workflow)
4. [Database Design](#4-database-design)
5. [API Specifications](#5-api-specifications)
6. [Excel Import/Export](#6-excel-importexport)
7. [Frontend Requirements](#7-frontend-requirements)
8. [Technical Requirements](#8-technical-requirements)
9. [Implementation Plan](#9-implementation-plan)

---

## 1. System Overview

### 1.1 Purpose

ระบบบริหารจัดการและควบคุมงบประมาณยา (Hospital Budget Planning & Control System) สำหรับโรงพยาบาล เพื่อ:

- จัดทำแผนงบประมาณจัดซื้อยาประจำปี
- ควบคุมการใช้จ่ายงบประมาณให้อยู่ในวงเงินที่อนุมัติ
- สร้างรายงานส่ง สำนักงานสาธารณสุขจังหวัด (สสจ.)

### 1.2 Key Features

1. **Centralized Planning** - จัดทำแผนรวมจุดเดียว (ไม่แยกตามแผนก)
2. **Excel Import/Export** - นำเข้า/ส่งออก Excel ตามรูปแบบ สสจ.
3. **Historical Data** - ข้อมูลการใช้ย้อนหลัง 3 ปี
4. **Real-time Calculation** - คำนวณยอดรวมแบบทันที
5. **Budget Control** - ล็อคงบประมาณและตรวจสอบยอดคงเหลือ
6. **Approval Workflow** - Planner → Director

### 1.3 Scope

**In Scope:**

- จัดทำแผนงบประมาณยา (รายตัวยา)
- อนุมัติแผนและล็อคงบประมาณ
- ตรวจสอบยอดงบประมาณคงเหลือ (API)
- รายงาน Excel ตามรูปแบบ สสจ.

**Out of Scope:**

- การจัดซื้อจริง (PO/PR) - ใช้ระบบเดิม
- การรับยาเข้าคลัง - ใช้ระบบเดิม
- การเบิกยา - ใช้ระบบเดิม

---

## 2. Business Requirements

### 2.1 User Roles

| Role                     | Responsibilities   | Permissions           |
| ------------------------ | ------------------ | --------------------- |
| **Pharmacist (Planner)** | จัดทำแผนงบประมาณยา | Create, Edit, Submit  |
| **Director**             | อนุมัติแผนงบประมาณ | View, Approve, Reject |
| **System Admin**         | จัดการระบบ         | Full Access           |

### 2.2 Business Rules

1. **Historical Data**: ระบบดึงข้อมูลการใช้ย้อนหลัง 3 ปี (2566, 2567, 2568) มาแสดงอัตโนมัติ
2. **Auto Calculation**: `ประมาณการจัดซื้อ = ประมาณการใช้ - ยอดคงคลัง`
3. **Growth Rate**: สามารถใส่ % Growth Rate เพื่อปรับยอดทั้งกลุ่มได้
4. **Budget Lock**: หลังอนุมัติแล้ว ระบบสร้าง Budget Control (ล็อคงบ) อัตโนมัติ
5. **Spending Control**: ระบบจัดซื้อต้องตรวจสอบงบคงเหลือก่อนออก PO/PR

### 2.3 Data Volume

- **รายการยา**: ~2,000 - 5,000 รายการ/ปี
- **Concurrent Users**: ~5-10 users
- **Response Time**: < 3 seconds สำหรับการโหลด/แก้ไขข้อมูล

---

## 3. System Workflow

### 3.1 Overall Workflow (5 Phases)

```
Phase 1: System Initialization
├─ ระบบดึงประวัติการใช้ย้อนหลัง 3 ปี
├─ ระบบดึงราคาอ้างอิงล่าสุด
└─ ระบบสร้างร่างแผนเบื้องต้น (Draft)
         ↓
Phase 2: Planning & Adjustment
├─ Planner ตรวจสอบและแก้ไขข้อมูล
├─ Import Excel (optional)
├─ ใช้ Growth Rate Tool ปรับยอด
└─ Submit แผน
         ↓
Phase 3: Approval
├─ Director ดู Dashboard สรุปยอด
├─ พิจารณาและอนุมัติ
└─ Status: DRAFT → APPROVED
         ↓
Phase 4: Budget Locking
├─ ระบบสร้าง Budget Control อัตโนมัติ
├─ ล็อควงเงินงบประมาณ
└─ พร้อมใช้งานควบคุมการจัดซื้อ
         ↓
Phase 5: Purchasing & Control
├─ ระบบจัดซื้อเรียก API ตรวจสอบงบคงเหลือ
├─ ถ้ายอดพอ → ตัดยอดจอง (Reserve)
└─ ถ้ายอดไม่พอ → BLOCK (แจ้งเตือน)
```

### 3.2 Detailed Workflow

#### Phase 1: System Initialization (Auto)

**Trigger:** เมื่อเริ่มต้นปีงบประมาณใหม่

**Process:**

1. ระบบ query ข้อมูลการใช้ยาย้อนหลัง 3 ปี:

   ```sql
   SELECT
     generic_id,
     SUM(CASE WHEN fiscal_year = 2566 THEN qty END) as usage_2566,
     SUM(CASE WHEN fiscal_year = 2567 THEN qty END) as usage_2567,
     SUM(CASE WHEN fiscal_year = 2568 THEN qty END) as usage_2568,
     AVG(qty) as avg_usage
   FROM inventory.drug_usage_history
   WHERE fiscal_year BETWEEN 2566 AND 2568
   GROUP BY generic_id
   ```

2. ระบบดึงราคาล่าสุด:

   ```sql
   SELECT DISTINCT ON (generic_id)
     generic_id,
     unit_price
   FROM inventory.purchase_orders
   WHERE status = 'COMPLETED'
   ORDER BY generic_id, created_at DESC
   ```

3. สร้าง Draft Plan:
   ```sql
   INSERT INTO budget_request_items (
     budget_request_id,
     generic_id,
     usage_year_2566,
     usage_year_2567,
     usage_year_2568,
     estimated_usage_2569,
     unit_price,
     requested_qty,
     requested_amount
   )
   SELECT
     :budget_request_id,
     generic_id,
     usage_2566,
     usage_2567,
     usage_2568,
     ROUND(avg_usage),  -- ประมาณการเท่ากับค่าเฉลี่ย
     unit_price,
     ROUND(avg_usage),  -- ขอเท่ากับประมาณการ
     ROUND(avg_usage) * unit_price
   FROM historical_data
   ```

**Output:** Draft Plan พร้อมข้อมูลเบื้องต้น

---

#### Phase 2: Planning & Adjustment (User: Planner)

**Screens:**

1. Budget Plan List (รายการแผนทั้งหมด)
2. Budget Plan Editor (แก้ไขแผน)

**Features:**

**2.1 Import Excel**

- Upload Excel ตามรูปแบบ Template
- ระบบ Validate columns และ data types
- Update existing records (by generic_code)
- Insert new records

**2.2 Inline Edit**

- แก้ไขข้อมูลใน Data Grid ได้ทันที
- Auto-save เมื่อเปลี่ยนค่า
- Validation: qty > 0, price > 0

**2.3 Growth Rate Tool**

```
Modal: "Apply Growth Rate"
├─ Select Drug Group: [ All | ED only | NED only ]
├─ Growth Rate: [___] %
├─ Apply to: [ Quantity | Price | Both ]
└─ [Cancel] [Apply]

Logic:
requested_qty = estimated_usage * (1 + growth_percent / 100)
requested_amount = requested_qty * unit_price
```

**2.4 Real-time Summary**

```
Footer Bar:
├─ Total Items: 1,250
├─ Total Amount: 45,678,900 บาท
├─ ED Amount: 35,000,000 บาท (77%)
└─ NED Amount: 10,678,900 บาท (23%)
```

**2.5 Submit Plan**

- Validation: ต้องมีรายการอย่างน้อย 1 รายการ
- Status: DRAFT → SUBMITTED
- Notification: ส่งแจ้ง Director

---

#### Phase 3: Approval (User: Director)

**Screens:**

1. Budget Plan Approval Dashboard

**Features:**

**3.1 Dashboard Summary**

```
Cards:
├─ Total Budget: 45,678,900 บาท
├─ ED Budget: 35,000,000 บาท (77%)
├─ NED Budget: 10,678,900 บาท (23%)
└─ Top 10 High-Value Drugs

Charts:
├─ Budget Comparison: 2568 vs 2569
├─ Budget Distribution: ED/NED Pie Chart
└─ Quarterly Distribution: Q1-Q4 Bar Chart
```

**3.2 Approval Actions**

```
Buttons:
├─ [View Details] → แสดงตารางรายละเอียด
├─ [Export PDF] → รายงานสำหรับพิจารณา
├─ [Reject] → เหตุผล + ส่งกลับแก้ไข
└─ [Approve] → อนุมัติแผน

On Approve:
├─ Status: SUBMITTED → APPROVED
├─ approved_by = current_user_id
├─ approved_at = NOW()
└─ Trigger: Create Budget Controls
```

---

#### Phase 4: Budget Locking (Auto)

**Trigger:** เมื่อ Director กด Approve

**Process:**

```typescript
async approveAndLockBudget(budgetRequestId: number, userId: string) {
  const trx = await db.transaction();

  try {
    // 1. Update status
    await trx('budget_requests')
      .where({ id: budgetRequestId })
      .update({
        status: 'APPROVED',
        approved_by: userId,
        approved_at: new Date()
      });

    // 2. Get all items
    const items = await trx('budget_request_items')
      .where({ budget_request_id: budgetRequestId })
      .select('*');

    // 3. Create Budget Controls (Lock)
    for (const item of items) {
      await trx.raw(`
        INSERT INTO inventory.budget_controls (
          fiscal_year,
          generic_id,
          approved_budget,
          approved_qty,
          used_budget,
          used_qty,
          reserved_budget,
          reserved_qty,
          is_locked
        ) VALUES (?, ?, ?, ?, 0, 0, 0, 0, true)
        ON CONFLICT (fiscal_year, generic_id)
        DO UPDATE SET
          approved_budget = EXCLUDED.approved_budget,
          approved_qty = EXCLUDED.approved_qty,
          is_locked = true
      `, [
        2569,
        item.generic_id,
        item.requested_amount,
        item.requested_qty
      ]);
    }

    await trx.commit();
    console.log('Budget locked successfully');
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
```

**Output:** Budget Controls พร้อมใช้งาน

---

#### Phase 5: Purchasing & Control (API Integration)

**API Endpoint:** `POST /api/budget-control/check`

**Request:**

```json
{
  "fiscal_year": 2569,
  "generic_id": 12345,
  "requested_amount": 50000,
  "requested_qty": 500,
  "reference_type": "PR",
  "reference_id": "PR-2569-001"
}
```

**Response (Success):**

```json
{
  "canProceed": true,
  "control": {
    "approved_budget": 2000000,
    "used_budget": 500000,
    "reserved_budget": 100000,
    "remaining_budget": 1400000
  },
  "message": "งบประมาณเพียงพอ"
}
```

**Response (Insufficient):**

```json
{
  "canProceed": false,
  "control": {
    "approved_budget": 2000000,
    "used_budget": 1800000,
    "reserved_budget": 150000,
    "remaining_budget": 50000
  },
  "message": "งบประมาณไม่เพียงพอ (ต้องการ 50,000 บาท แต่คงเหลือ 50,000 บาท)",
  "required": 50000,
  "available": 50000
}
```

**Logic:**

```typescript
async checkBudget(params: CheckBudgetRequest) {
  const control = await db('budget_controls')
    .where({
      fiscal_year: params.fiscal_year,
      generic_id: params.generic_id
    })
    .first();

  if (!control) {
    throw new Error('ไม่พบงบประมาณสำหรับยานี้');
  }

  const remaining = control.approved_budget
                  - control.used_budget
                  - control.reserved_budget;

  if (remaining >= params.requested_amount) {
    // Reserve budget
    await db('budget_controls')
      .where({ id: control.id })
      .increment('reserved_budget', params.requested_amount)
      .increment('reserved_qty', params.requested_qty);

    // Log transaction
    await db('budget_transactions').insert({
      control_id: control.id,
      transaction_type: 'RESERVE',
      reference_type: params.reference_type,
      reference_id: params.reference_id,
      amount: params.requested_amount,
      qty: params.requested_qty
    });

    return { canProceed: true, control };
  } else {
    return {
      canProceed: false,
      control,
      required: params.requested_amount,
      available: remaining
    };
  }
}
```

---

## 4. Database Design

### 4.1 Enhanced budget_request_items Table

**Migration:** `20251208120000_enhance_budget_request_items.ts`

```sql
-- Add columns to existing table
ALTER TABLE inventory.budget_request_items

-- Drug Information
ADD COLUMN generic_code VARCHAR(50),
ADD COLUMN generic_name VARCHAR(500),
ADD COLUMN package_size VARCHAR(100),
ADD COLUMN unit VARCHAR(50),

-- Historical Usage (ย้อนหลัง 3 ปี)
ADD COLUMN usage_year_2566 DECIMAL(10,2) DEFAULT 0,
ADD COLUMN usage_year_2567 DECIMAL(10,2) DEFAULT 0,
ADD COLUMN usage_year_2568 DECIMAL(10,2) DEFAULT 0,
ADD COLUMN avg_usage DECIMAL(10,2) DEFAULT 0,

-- Planning (ประมาณการ)
ADD COLUMN estimated_usage_2569 DECIMAL(10,2) DEFAULT 0,
ADD COLUMN current_stock DECIMAL(10,2) DEFAULT 0,
ADD COLUMN estimated_purchase DECIMAL(10,2) DEFAULT 0,

-- Pricing
ADD COLUMN unit_price DECIMAL(10,2) DEFAULT 0,

-- Request (ที่ขอ)
ADD COLUMN requested_qty DECIMAL(10,2) DEFAULT 0,
-- requested_amount already exists

-- Growth Rate
ADD COLUMN growth_percent DECIMAL(5,2) DEFAULT 0,

-- Drug Type
ADD COLUMN drug_type VARCHAR(10), -- 'ED' or 'NED'

-- Line Number (for report)
ADD COLUMN line_number INTEGER,

-- Notes
ADD COLUMN notes TEXT;

-- Add constraints
ALTER TABLE inventory.budget_request_items
ADD CONSTRAINT check_requested_amount_calculation
  CHECK (requested_amount = requested_qty * unit_price),

ADD CONSTRAINT check_estimated_purchase_calculation
  CHECK (estimated_purchase = estimated_usage_2569 - current_stock);

-- Add indexes
CREATE INDEX idx_budget_request_items_generic_code
  ON inventory.budget_request_items(generic_code);

CREATE INDEX idx_budget_request_items_drug_type
  ON inventory.budget_request_items(drug_type);
```

### 4.2 New Table: budget_controls

```sql
CREATE TABLE inventory.budget_controls (
  id BIGSERIAL PRIMARY KEY,

  -- Identification
  fiscal_year INTEGER NOT NULL,
  generic_id INTEGER REFERENCES inventory.drug_generics(id),

  -- Approved Budget (งบที่อนุมัติ)
  approved_budget DECIMAL(15,2) NOT NULL,
  approved_qty DECIMAL(10,2) NOT NULL,

  -- Used (ใช้ไปแล้ว - จาก PO ที่ปิดแล้ว)
  used_budget DECIMAL(15,2) DEFAULT 0,
  used_qty DECIMAL(10,2) DEFAULT 0,

  -- Reserved (จองไว้ - จาก PR/PO ที่รออนุมัติ)
  reserved_budget DECIMAL(15,2) DEFAULT 0,
  reserved_qty DECIMAL(10,2) DEFAULT 0,

  -- Remaining (คงเหลือ - Auto calculated)
  remaining_budget DECIMAL(15,2) GENERATED ALWAYS AS
    (approved_budget - used_budget - reserved_budget) STORED,
  remaining_qty DECIMAL(10,2) GENERATED ALWAYS AS
    (approved_qty - used_qty - reserved_qty) STORED,

  -- Status
  is_locked BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(fiscal_year, generic_id)
);

-- Indexes
CREATE INDEX idx_budget_controls_fiscal_year
  ON inventory.budget_controls(fiscal_year);

CREATE INDEX idx_budget_controls_generic_id
  ON inventory.budget_controls(generic_id);

CREATE INDEX idx_budget_controls_remaining
  ON inventory.budget_controls(remaining_budget);
```

### 4.3 New Table: budget_transactions

```sql
CREATE TABLE inventory.budget_transactions (
  id BIGSERIAL PRIMARY KEY,

  -- Reference
  control_id BIGINT REFERENCES inventory.budget_controls(id) NOT NULL,

  -- Transaction Info
  transaction_type VARCHAR(20) NOT NULL, -- 'RESERVE', 'COMMIT', 'RELEASE'
  reference_type VARCHAR(20),             -- 'PR', 'PO'
  reference_id VARCHAR(50),

  -- Amounts
  amount DECIMAL(15,2) NOT NULL,
  qty DECIMAL(10,2) NOT NULL,

  -- Audit
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_transaction_type
    CHECK (transaction_type IN ('RESERVE', 'COMMIT', 'RELEASE'))
);

-- Indexes
CREATE INDEX idx_budget_transactions_control
  ON inventory.budget_transactions(control_id);

CREATE INDEX idx_budget_transactions_reference
  ON inventory.budget_transactions(reference_type, reference_id);

CREATE INDEX idx_budget_transactions_created_at
  ON inventory.budget_transactions(created_at DESC);
```

### 4.4 Database Relationships

```
budget_requests (1) ──< (N) budget_request_items
                              └─> drug_generics (FK: generic_id)

budget_request_items ──[Approved]──> budget_controls
                                        ├─< budget_transactions
                                        └─> drug_generics (FK)
```

---

## 5. API Specifications

### 5.1 Budget Request APIs

#### Create Budget Request

```
POST /api/inventory/budget-requests
Authorization: Bearer {token}
Permissions: budgetRequests:create

Request Body:
{
  "fiscal_year": 2569,
  "request_number": "BR-2569-001",
  "department_id": null,  // null = centralized
  "justification": "แผนงบประมาณจัดซื้อยาประจำปี 2569"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "fiscal_year": 2569,
    "status": "DRAFT",
    "created_at": "2025-12-08T10:00:00Z"
  }
}
```

#### Get Budget Request with Items

```
GET /api/inventory/budget-requests/:id?include=items
Authorization: Bearer {token}
Permissions: budgetRequests:read

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "fiscal_year": 2569,
    "status": "DRAFT",
    "total_requested_amount": 45678900,
    "items": [
      {
        "id": 1,
        "line_number": 1,
        "generic_code": "100103660",
        "generic_name": "0.1% Triamcinolone acetone",
        "package_size": "1",
        "unit": "หลอด",
        "usage_year_2566": 0,
        "usage_year_2567": 0,
        "usage_year_2568": 4527,
        "estimated_usage_2569": 4662,
        "current_stock": 851,
        "estimated_purchase": 3811,
        "unit_price": 15,
        "requested_qty": 3811,
        "requested_amount": 57165,
        "drug_type": "ED"
      }
    ]
  }
}
```

#### Update Budget Request Item

```
PUT /api/inventory/budget-requests/:id/items/:itemId
Authorization: Bearer {token}
Permissions: budgetRequests:update

Request Body:
{
  "estimated_usage_2569": 5000,
  "current_stock": 900,
  "unit_price": 15,
  "notes": "ปรับเพิ่มตามแนวโน้มผู้ป่วยเพิ่ม"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "estimated_usage_2569": 5000,
    "estimated_purchase": 4100,  // auto calculated
    "requested_qty": 4100,
    "requested_amount": 61500,   // auto calculated
    "updated_at": "2025-12-08T10:05:00Z"
  }
}
```

#### Apply Growth Rate

```
POST /api/inventory/budget-requests/:id/apply-growth-rate
Authorization: Bearer {token}
Permissions: budgetRequests:update

Request Body:
{
  "growth_percent": 5,
  "drug_type": "ED",  // "ED", "NED", or null (all)
  "apply_to": "quantity"  // "quantity", "price", or "both"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "affected_items": 850,
    "total_amount_before": 35000000,
    "total_amount_after": 36750000,
    "message": "Applied 5% growth rate to 850 ED drugs"
  }
}
```

### 5.2 Excel Import/Export APIs

#### Import Excel

```
POST /api/inventory/budget-requests/:id/import-excel
Authorization: Bearer {token}
Permissions: budgetRequests:update
Content-Type: multipart/form-data

Form Data:
file: [Excel file]
mode: "update"  // "update" or "replace"

Response: 200 OK
{
  "success": true,
  "data": {
    "total_rows": 1250,
    "imported": 1248,
    "skipped": 2,
    "errors": [
      {
        "row": 10,
        "error": "Invalid generic code: ABC123"
      }
    ]
  }
}
```

#### Export to สสจ Format

```
GET /api/inventory/budget-requests/:id/export-sscj
Authorization: Bearer {token}
Permissions: budgetRequests:export

Response: 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="แผนงบ-2569.xlsx"

[Excel file with สสจ format]
```

### 5.3 Budget Control APIs

#### Check Budget Availability

```
POST /api/inventory/budget-control/check
Authorization: Bearer {token}
Permissions: budgetControl:check

Request Body:
{
  "fiscal_year": 2569,
  "generic_id": 12345,
  "requested_amount": 50000,
  "requested_qty": 500,
  "reference_type": "PR",
  "reference_id": "PR-2569-001"
}

Response: 200 OK (Budget Available)
{
  "success": true,
  "data": {
    "canProceed": true,
    "control": {
      "approved_budget": 2000000,
      "used_budget": 500000,
      "reserved_budget": 100000,
      "remaining_budget": 1400000
    },
    "message": "งบประมาณเพียงพอ"
  }
}

Response: 200 OK (Insufficient Budget)
{
  "success": false,
  "data": {
    "canProceed": false,
    "control": {
      "approved_budget": 2000000,
      "used_budget": 1800000,
      "reserved_budget": 150000,
      "remaining_budget": 50000
    },
    "message": "งบประมาณไม่เพียงพอ",
    "required": 50000,
    "available": 50000
  }
}
```

#### Reserve Budget

```
POST /api/inventory/budget-control/reserve
Authorization: Bearer {token}
Permissions: budgetControl:reserve

Request Body:
{
  "fiscal_year": 2569,
  "generic_id": 12345,
  "amount": 50000,
  "qty": 500,
  "reference_type": "PR",
  "reference_id": "PR-2569-001"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "transaction_id": 123,
    "control": {
      "remaining_budget": 1350000
    }
  }
}
```

#### Commit Budget (PO Approved)

```
POST /api/inventory/budget-control/commit
Authorization: Bearer {token}
Permissions: budgetControl:commit

Request Body:
{
  "reference_type": "PR",
  "reference_id": "PR-2569-001"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "transaction_id": 124,
    "message": "งบประมาณถูกตัดจ่ายแล้ว"
  }
}
```

#### Release Budget (PO Rejected/Cancelled)

```
POST /api/inventory/budget-control/release
Authorization: Bearer {token}
Permissions: budgetControl:release

Request Body:
{
  "reference_type": "PR",
  "reference_id": "PR-2569-001"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "transaction_id": 125,
    "message": "ปลดล็อคงบประมาณแล้ว"
  }
}
```

---

## 6. Excel Import/Export

### 6.1 Import Template Format

**File:** `template_import_budget.xlsx`

| Column | Header         | Data Type    | Required | Example            |
| ------ | -------------- | ------------ | -------- | ------------------ |
| A      | รหัสยา         | VARCHAR(50)  | Yes      | 100103660          |
| B      | ชื่อยา         | VARCHAR(500) | Yes      | 0.1% Triamcinolone |
| C      | ขนาดบรรจุ      | VARCHAR(100) | No       | 1                  |
| D      | หน่วย          | VARCHAR(50)  | Yes      | หลอด               |
| E      | ปี 2566        | NUMBER       | No       | 0                  |
| F      | ปี 2567        | NUMBER       | No       | 0                  |
| G      | ปี 2568        | NUMBER       | No       | 4527               |
| H      | ประมาณการ 2569 | NUMBER       | Yes      | 4662               |
| I      | คงคลัง         | NUMBER       | No       | 851                |
| J      | ราคา/หน่วย     | NUMBER       | Yes      | 15                 |
| K      | ประเภท         | VARCHAR(10)  | No       | ED                 |

**Validation Rules:**

1. รหัสยา must exist in `drug_generics` table
2. ประมาณการ 2569 > 0
3. ราคา/หน่วย > 0
4. ประเภท must be 'ED' or 'NED'

**Import Logic:**

```typescript
async importExcel(file: Buffer, budgetRequestId: number) {
  const workbook = XLSX.read(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const results = {
    total: rows.length,
    imported: 0,
    skipped: 0,
    errors: []
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      // Validate
      if (!row['รหัสยา']) {
        throw new Error('Missing generic code');
      }

      // Find drug
      const drug = await db('drug_generics')
        .where({ tmt_code: row['รหัสยา'] })
        .first();

      if (!drug) {
        throw new Error(`Drug not found: ${row['รหัสยา']}`);
      }

      // Calculate
      const estimatedUsage = Number(row['ประมาณการ 2569']) || 0;
      const currentStock = Number(row['คงคลัง']) || 0;
      const unitPrice = Number(row['ราคา/หน่วย']) || 0;
      const estimatedPurchase = Math.max(0, estimatedUsage - currentStock);

      // Upsert
      await db('budget_request_items')
        .insert({
          budget_request_id: budgetRequestId,
          generic_id: drug.id,
          generic_code: row['รหัสยา'],
          generic_name: row['ชื่อยา'],
          package_size: row['ขนาดบรรจุ'],
          unit: row['หน่วย'],
          usage_year_2566: Number(row['ปี 2566']) || 0,
          usage_year_2567: Number(row['ปี 2567']) || 0,
          usage_year_2568: Number(row['ปี 2568']) || 0,
          estimated_usage_2569: estimatedUsage,
          current_stock: currentStock,
          estimated_purchase: estimatedPurchase,
          unit_price: unitPrice,
          requested_qty: estimatedPurchase,
          requested_amount: estimatedPurchase * unitPrice,
          drug_type: row['ประเภท'] || 'ED'
        })
        .onConflict(['budget_request_id', 'generic_code'])
        .merge();

      results.imported++;
    } catch (error) {
      results.skipped++;
      results.errors.push({
        row: i + 2,
        error: error.message
      });
    }
  }

  return results;
}
```

### 6.2 Export สสจ Format

**File:** `แผนงบ-2569.xlsx`

**Structure:**

- Row 1: Title (Merged A1:N1) - "แผนงบประมาณจัดซื้อยา ปีงบประมาณ 2569"
- Row 2: Subtitle
- Row 3-4: Column Headers (with some merged cells)
- Row 5+: Data

**Export Logic:**

```typescript
async exportToSscjFormat(budgetRequestId: number) {
  const data = await db('budget_request_items')
    .where({ budget_request_id: budgetRequestId })
    .orderBy('line_number', 'asc');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('แผนงบ 69');

  // Title
  worksheet.mergeCells('A1:N1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'แผนงบประมาณจัดซื้อยา ปีงบประมาณ 2569';
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Subtitle
  worksheet.getCell('L2').value = 'รวมมูลค่าจัดซื้อ';
  worksheet.getCell('M2').value = data.reduce((sum, i) => sum + i.requested_amount, 0);

  // Headers
  worksheet.mergeCells('F3:H3');
  worksheet.getCell('F3').value = 'ข้อมูลอัตราการใช้ย้อนหลัง';
  worksheet.mergeCells('M3:N3');
  worksheet.getCell('M3').value = 'จัดซื้อด้วยเงินงบประมาณ';

  const headerRow4 = worksheet.addRow([
    'ลำดับ', 'รหัส', 'รายการ', 'ขนาดบรรจุ', 'หน่วยนับ',
    'ปีงบฯ2566', 'ปีงบฯ2567', 'ปีงบฯ2568',
    'ประมาณการใช้ปีงบฯ 2569', 'ยอดยาคงคลัง',
    'ประมาณการจัดซื้อปีงบฯ2569', 'ราคา/หน่วยขนาดบรรจุ',
    'จำนวน', 'มูลค่า'
  ]);

  // Data rows
  data.forEach((item, index) => {
    worksheet.addRow([
      index + 1,
      item.generic_code,
      item.generic_name,
      item.package_size,
      item.unit,
      item.usage_year_2566,
      item.usage_year_2567,
      item.usage_year_2568,
      item.estimated_usage_2569,
      item.current_stock,
      item.estimated_purchase,
      item.unit_price,
      item.requested_qty,
      item.requested_amount
    ]);
  });

  // Formatting
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  // Number format for currency
  worksheet.getColumn(12).numFmt = '#,##0.00';
  worksheet.getColumn(14).numFmt = '#,##0.00';

  // Borders
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 3) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });

  return workbook.xlsx.writeBuffer();
}
```

---

## 7. Frontend Requirements

### 7.1 Screens

#### 7.1.1 Budget Plan List

```
Path: /inventory/budget/plans
Component: BudgetPlanListComponent

Features:
- Table with columns: Plan Number, Fiscal Year, Status, Total Amount, Created Date
- Actions: View, Edit, Delete, Submit, Approve
- Filters: Fiscal Year, Status
- Search: by Plan Number
- Pagination: 20 items/page
```

#### 7.1.2 Budget Plan Editor

```
Path: /inventory/budget/plans/:id/edit
Component: BudgetPlanEditorComponent

Layout:
├─ Header Bar
│  ├─ Title: "แผนงบประมาณ 2569"
│  ├─ Status Badge
│  └─ Actions: [Import Excel] [Export Excel] [Save] [Submit]
│
├─ Toolbar
│  ├─ [Apply Growth Rate]
│  ├─ [Add Item]
│  └─ [Delete Selected]
│
├─ Data Grid (AG Grid)
│  ├─ Columns: ลำดับ, รหัสยา, ชื่อยา, หน่วย, ปี2566-2568,
│  │           ประมาณการ2569, คงคลัง, จัดซื้อ, ราคา, มูลค่า
│  ├─ Inline Edit: Double-click to edit
│  ├─ Auto-save: on cell change
│  └─ Row selection
│
└─ Summary Footer
   ├─ Total Items: 1,250
   ├─ Total Amount: 45,678,900 บาท
   ├─ ED: 35,000,000 (77%)
   └─ NED: 10,678,900 (23%)
```

**AG Grid Configuration:**

```typescript
columnDefs = [
  {
    field: 'line_number',
    headerName: 'ลำดับ',
    width: 80,
    editable: false
  },
  {
    field: 'generic_code',
    headerName: 'รหัสยา',
    width: 120,
    editable: false
  },
  {
    field: 'generic_name',
    headerName: 'ชื่อยา',
    width: 300,
    editable: false
  },
  {
    field: 'unit',
    headerName: 'หน่วย',
    width: 100,
    editable: false
  },
  {
    field: 'usage_year_2566',
    headerName: 'ปี 2566',
    width: 100,
    type: 'numericColumn',
    editable: false,
    cellStyle: { backgroundColor: '#f0f0f0' }
  },
  {
    field: 'usage_year_2567',
    headerName: 'ปี 2567',
    width: 100,
    type: 'numericColumn',
    editable: false,
    cellStyle: { backgroundColor: '#f0f0f0' }
  },
  {
    field: 'usage_year_2568',
    headerName: 'ปี 2568',
    width: 100,
    type: 'numericColumn',
    editable: false,
    cellStyle: { backgroundColor: '#f0f0f0' }
  },
  {
    field: 'estimated_usage_2569',
    headerName: 'ประมาณการ 2569',
    width: 120,
    type: 'numericColumn',
    editable: true,
    cellStyle: { backgroundColor: '#fff3cd' }
  },
  {
    field: 'current_stock',
    headerName: 'คงคลัง',
    width: 100,
    type: 'numericColumn',
    editable: true
  },
  {
    field: 'estimated_purchase',
    headerName: 'จัดซื้อ',
    width: 100,
    type: 'numericColumn',
    editable: false,
    valueGetter: (params) => {
      return params.data.estimated_usage_2569 - params.data.current_stock;
    },
    cellStyle: { fontWeight: 'bold' }
  },
  {
    field: 'unit_price',
    headerName: 'ราคา/หน่วย',
    width: 120,
    type: 'numericColumn',
    editable: true,
    valueFormatter: (params) => params.value?.toFixed(2)
  },
  {
    field: 'requested_amount',
    headerName: 'มูลค่า',
    width: 150,
    type: 'numericColumn',
    editable: false,
    valueGetter: (params) => {
      const qty = params.data.estimated_usage_2569 - params.data.current_stock;
      return qty * params.data.unit_price;
    },
    valueFormatter: (params) => params.value?.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    cellStyle: { fontWeight: 'bold', color: '#2563eb' }
  }
];

onCellValueChanged(event) {
  // Auto-save
  const item = event.data;
  this.budgetService.updateItem(item.id, {
    estimated_usage_2569: item.estimated_usage_2569,
    current_stock: item.current_stock,
    unit_price: item.unit_price
  }).subscribe();

  // Recalculate summary
  this.calculateSummary();
}
```

#### 7.1.3 Growth Rate Modal

```typescript
export class GrowthRateModalComponent {
  form = this.fb.group({
    drugType: ['all'], // 'all', 'ED', 'NED'
    growthPercent: [0, [Validators.required, Validators.min(-100), Validators.max(100)]],
    applyTo: ['quantity'], // 'quantity', 'price', 'both'
  });

  applyGrowthRate() {
    const { drugType, growthPercent, applyTo } = this.form.value;

    this.budgetService
      .applyGrowthRate(this.budgetRequestId, {
        drug_type: drugType === 'all' ? null : drugType,
        growth_percent: growthPercent,
        apply_to: applyTo,
      })
      .subscribe((result) => {
        this.toastr.success(`Applied ${growthPercent}% to ${result.affected_items} items`);
        this.dialogRef.close(true);
      });
  }
}
```

#### 7.1.4 Approval Dashboard

```
Path: /inventory/budget/plans/:id/approve
Component: BudgetApprovalDashboardComponent

Layout:
├─ Summary Cards
│  ├─ Total Budget
│  ├─ ED Budget
│  ├─ NED Budget
│  └─ Item Count
│
├─ Charts
│  ├─ Budget Comparison (2568 vs 2569)
│  ├─ ED/NED Distribution
│  └─ Top 10 High-Value Drugs
│
├─ Details Table (Read-only)
│
└─ Action Buttons
   ├─ [Export PDF]
   ├─ [Reject]
   └─ [Approve]
```

### 7.2 UI Components

#### 7.2.1 Budget Summary Card

```typescript
@Component({
  selector: 'app-budget-summary-card',
  template: `
    <ax-card>
      <div class="p-4">
        <div class="text-sm text-gray-600">{{ label }}</div>
        <div class="text-2xl font-bold mt-2">
          {{ amount | number: '1.2-2' }}
        </div>
        <div class="text-xs text-gray-500 mt-1">{{ percentage }}% of total</div>
      </div>
    </ax-card>
  `,
})
export class BudgetSummaryCardComponent {
  @Input() label: string;
  @Input() amount: number;
  @Input() percentage: number;
}
```

#### 7.2.2 Excel Upload Component

```typescript
@Component({
  selector: 'app-excel-upload',
  template: `
    <input type="file" accept=".xlsx,.xls" (change)="onFileSelected($event)" #fileInput hidden />
    <button ax-button variant="outlined" (click)="fileInput.click()">
      <ax-icon>upload</ax-icon>
      Import Excel
    </button>

    <ax-progress-bar *ngIf="uploading" [value]="progress"></ax-progress-bar>
  `,
})
export class ExcelUploadComponent {
  @Input() budgetRequestId: number;
  @Output() uploadComplete = new EventEmitter();

  uploading = false;
  progress = 0;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading = true;
    const formData = new FormData();
    formData.append('file', file);

    this.budgetService.importExcel(this.budgetRequestId, formData).subscribe({
      next: (result) => {
        this.uploading = false;
        this.toastr.success(`Imported ${result.imported} items`);
        this.uploadComplete.emit(result);
      },
      error: (error) => {
        this.uploading = false;
        this.toastr.error('Import failed');
      },
    });
  }
}
```

---

## 8. Technical Requirements

### 8.1 Performance

| Metric                | Target       | Measurement            |
| --------------------- | ------------ | ---------------------- |
| **Page Load Time**    | < 2 seconds  | First Contentful Paint |
| **Data Grid Render**  | < 3 seconds  | 2,000 rows loaded      |
| **API Response Time** | < 500ms      | 95th percentile        |
| **Excel Export**      | < 5 seconds  | 2,000 rows             |
| **Excel Import**      | < 10 seconds | 2,000 rows             |
| **Budget Check API**  | < 200ms      | Critical path          |

### 8.2 Data Precision

- **Decimal Fields**: Use `DECIMAL(15,2)` for money, `DECIMAL(10,2)` for quantities
- **No Float**: Never use FLOAT for financial calculations
- **Rounding**: Round to 2 decimal places for display
- **Calculation Order**: Calculate in cents/satang, then convert to display

### 8.3 Security

1. **Authentication**: JWT tokens with 1-hour expiration
2. **Authorization**: Role-based permissions (Planner, Director, Admin)
3. **Input Validation**:
   - TypeBox schemas for all API inputs
   - Excel file validation (max 10MB, .xlsx only)
4. **SQL Injection Protection**: Use parameterized queries only
5. **Audit Trail**: Log all budget changes (who, when, what)

### 8.4 Technology Stack

**Backend:**

- Node.js 20+
- Fastify 4.x
- TypeBox for validation
- Knex.js for database
- PostgreSQL 14+
- ExcelJS for Excel generation

**Frontend:**

- Angular 17+
- Angular Material + TailwindCSS
- AG Grid for data tables
- Chart.js for charts
- ngx-file-drop for file uploads

---

## 9. Implementation Plan

### Phase 1: Foundation (Week 1-2)

**Database:**

- [x] Create migration: enhance budget_request_items
- [x] Create migration: budget_controls table
- [x] Create migration: budget_transactions table
- [ ] Create seed data script

**Backend:**

- [ ] Update budget_request_items schema
- [ ] Update budget_request_items repository
- [ ] Update budget_request_items service
- [ ] Create budget_controls repository
- [ ] Create budget_controls service

**Deliverables:**

- Database ready
- Basic CRUD APIs working
- Postman collection for testing

---

### Phase 2: Planning Features (Week 3-4)

**Backend:**

- [ ] Implement Excel import service
- [ ] Implement Excel export service (สสจ format)
- [ ] Implement growth rate API
- [ ] Implement auto-calculation logic
- [ ] Add historical data seeding

**Frontend:**

- [ ] Create Budget Plan List page
- [ ] Create Budget Plan Editor with AG Grid
- [ ] Implement inline editing
- [ ] Implement Growth Rate modal
- [ ] Implement Excel upload component
- [ ] Implement real-time summary footer

**Deliverables:**

- Planner can create and edit plans
- Import/Export Excel works
- Growth rate tool works
- Auto-save works

---

### Phase 3: Approval & Locking (Week 5-6)

**Backend:**

- [ ] Implement approval workflow
- [ ] Implement budget locking logic
- [ ] Implement budget_controls creation on approve
- [ ] Add approval notifications

**Frontend:**

- [ ] Create Approval Dashboard
- [ ] Implement summary cards
- [ ] Implement charts (comparison, distribution)
- [ ] Implement approve/reject actions
- [ ] Add status badges and timeline

**Deliverables:**

- Director can approve plans
- Budget automatically locks on approval
- Notifications sent

---

### Phase 4: Budget Control (Week 7-8)

**Backend:**

- [ ] Implement budget check API
- [ ] Implement budget reserve API
- [ ] Implement budget commit API
- [ ] Implement budget release API
- [ ] Add budget transaction logging

**Frontend:**

- [ ] Create Budget Control Dashboard (optional)
- [ ] Implement real-time budget monitoring
- [ ] Add alerts for low budget

**Integration:**

- [ ] Document API for Purchasing System
- [ ] Provide sample integration code
- [ ] Test with Purchasing System

**Deliverables:**

- Budget Control APIs ready
- Integration documentation
- E2E testing complete

---

### Testing & Deployment (Week 9-10)

**Testing:**

- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Performance testing (2,000+ items)
- [ ] Excel import/export testing
- [ ] Budget control API testing

**Documentation:**

- [ ] User manual (Planner)
- [ ] User manual (Director)
- [ ] API documentation (for integration)
- [ ] Troubleshooting guide

**Deployment:**

- [ ] Production database migration
- [ ] Production deployment
- [ ] User training
- [ ] Go-live support

---

## 10. Appendix

### 10.1 Business Logic Examples

#### Example 1: Calculate Estimated Purchase

```sql
estimated_purchase = GREATEST(0, estimated_usage_2569 - current_stock)

-- If estimated_usage = 5000, current_stock = 800
-- → estimated_purchase = 4200

-- If estimated_usage = 5000, current_stock = 6000
-- → estimated_purchase = 0 (ไม่ต้องซื้อ)
```

#### Example 2: Apply Growth Rate

```typescript
// Apply 5% growth to all ED drugs
const items = await db('budget_request_items').where({ drug_type: 'ED' });

for (const item of items) {
  const newQty = item.estimated_usage_2569 * 1.05;
  await db('budget_request_items')
    .where({ id: item.id })
    .update({
      estimated_usage_2569: Math.round(newQty),
      requested_qty: Math.round(newQty - item.current_stock),
      requested_amount: Math.round(newQty - item.current_stock) * item.unit_price,
    });
}
```

### 10.2 Error Codes

| Code                    | Message                                  | HTTP Status |
| ----------------------- | ---------------------------------------- | ----------- |
| BUDGET_NOT_FOUND        | Budget request not found                 | 404         |
| BUDGET_ALREADY_APPROVED | Cannot edit approved budget              | 403         |
| INSUFFICIENT_BUDGET     | งบประมาณไม่เพียงพอ                       | 400         |
| INVALID_GROWTH_RATE     | Growth rate must be between -100 and 100 | 400         |
| EXCEL_PARSE_ERROR       | Failed to parse Excel file               | 400         |
| DRUG_NOT_FOUND          | Drug code not found                      | 404         |

### 10.3 Sample Data

```sql
-- Sample Budget Request
INSERT INTO inventory.budget_requests (
  id, fiscal_year, request_number, status, total_requested_amount
) VALUES (
  1, 2569, 'BR-2569-001', 'DRAFT', 45678900
);

-- Sample Items
INSERT INTO inventory.budget_request_items (
  budget_request_id, line_number, generic_code, generic_name, unit,
  usage_year_2566, usage_year_2567, usage_year_2568,
  estimated_usage_2569, current_stock, estimated_purchase,
  unit_price, requested_qty, requested_amount, drug_type
) VALUES
  (1, 1, '100103660', '0.1% Triamcinolone acetone', 'หลอด',
   0, 0, 4527, 4662, 851, 3811, 15, 3811, 57165, 'ED'),
  (1, 2, '100102902', '1,300kcal SMOF lipid 20%', 'ถุง',
   340, 480, 459, 473, 100, 373, 1391, 373, 518843, 'NED');
```

---

## 11. Glossary

- **ED**: Essential Drug (ยาในบัญชี)
- **NED**: Non-Essential Drug (ยานอกบัญชี)
- **สสจ.**: สำนักงานสาธารณสุขจังหวัด (Provincial Health Office)
- **TMT**: Thai Medical Terminology (รหัสยา)
- **Budget Control**: ระบบควบคุมงบประมาณ
- **Budget Locking**: การล็อคงบประมาณหลังอนุมัติ
- **Reserve**: จองงบประมาณชั่วคราว
- **Commit**: ตัดจ่ายงบประมาณจริง
- **Release**: ปลดล็อคงบประมาณ

---

**End of Specification Document**
