# 03. Validation Rules - Pre-submission Checklist

**Version:** 1.0.0
**Date:** 2025-12-12

[← Back to Index](./README.md) | [← Previous: Permission Matrix](./02-PERMISSION-MATRIX.md)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Validation Levels](#validation-levels)
3. [Pre-submission Checklist](#pre-submission-checklist)
4. [Field-level Validation](#field-level-validation)
5. [Business Rule Validation](#business-rule-validation)
6. [Warning vs Error](#warning-vs-error)
7. [Implementation Examples](#implementation-examples)

---

## Overview

การ Validate Budget Request มี 3 ระดับ:

1. **Field-level** - ตรวจสอบความถูกต้องของแต่ละ field
2. **Business Rules** - ตรวจสอบตามกฎทางธุรกิจ
3. **Pre-submission** - ตรวจสอบความพร้อมก่อน submit

### Validation Strategy

- **Client-side (Frontend)**: Validate ทันทีเพื่อ UX ที่ดี
- **Server-side (Backend)**: Validate อีกครั้งเพื่อความปลอดภัย
- **Never trust client-side alone**

---

## Validation Levels

### Level 1: Real-time Field Validation (Client)

**เมื่อ:** User พิมพ์/เปลี่ยนค่า
**จุดประสงค์:** Feedback ทันที, ป้องกันข้อมูลผิด

### Level 2: Form Submit Validation (Client + Server)

**เมื่อ:** User กด "Save" หรือ "Save All"
**จุดประสงค์:** ตรวจสอบก่อนบันทึก

### Level 3: Pre-submission Validation (Client + Server)

**เมื่อ:** User กด "Submit for Approval"
**จุดประสงค์:** ตรวจสอบความพร้อมและครบถ้วน

---

## Pre-submission Checklist

### Checklist UI Component

แสดง checklist ก่อนที่ user จะกด Submit:

```
📋 Pre-submission Checklist

✅ Required Fields
  ✓ Fiscal Year: 2568
  ✓ Department: Pharmacy Department
  ✓ Justification: Provided (150 characters)

✅ Budget Request Items
  ✓ Total Items: 45 drugs
  ✓ Total Amount: 2,500,000.00 บาท
  ✓ All items have valid prices
  ✓ All items have quarterly distribution

⚠️ Warnings
  ⚠️ 3 drugs not in budget plan (Paracetamol 500mg, Ibuprofen 400mg, Amoxicillin 500mg)
  ⚠️ Total amount exceeds 80% of allocated budget (2,500,000 / 3,000,000)

💡 Budget Allocation Status
  Budget Type: OP001 - ยาและเวชภัณฑ์
  Allocated: 3,000,000.00 บาท
  Used: 0.00 บาท
  Reserved: 500,000.00 บาท
  Available: 2,500,000.00 บาท
  This Request: 2,500,000.00 บาท
  Remaining After: 0.00 บาท ⚠️

[Cancel] [Submit for Approval]
```

---

## Field-level Validation

### Header Fields

#### 1. Fiscal Year (required)

**Rules:**

- ✅ Required
- ✅ Must be integer
- ✅ Must be >= current year - 1
- ✅ Must be <= current year + 2

**Messages:**

```typescript
{
  required: 'กรุณาเลือกปีงบประมาณ',
  min: 'ปีงบประมาณต้องไม่น้อยกว่า {{ min }}',
  max: 'ปีงบประมาณต้องไม่เกิน {{ max }}'
}
```

---

#### 2. Department (required)

**Rules:**

- ✅ Required
- ✅ Must be valid department ID
- ✅ Department must be active
- ⚠️ Warning if different from user's department (unless dept head)

**Messages:**

```typescript
{
  required: 'กรุณาเลือกแผนก',
  invalid: 'แผนกไม่ถูกต้องหรือไม่ได้ใช้งานแล้ว',
  warning: 'คุณกำลังสร้างคำขอให้กับแผนกอื่น - กรุณาตรวจสอบ'
}
```

---

#### 3. Justification (required for submit)

**Rules:**

- ⚠️ Optional for DRAFT (can save without)
- ✅ Required for SUBMIT
- ✅ Min length: 20 characters
- ✅ Max length: 1000 characters
- ✅ Must not be only whitespace

**Messages:**

```typescript
{
  requiredForSubmit: 'กรุณากรอกเหตุผลในการขอ (ต้องมีอย่างน้อย 20 ตัวอักษร)',
  minlength: 'เหตุผลต้องมีอย่างน้อย {{ min }} ตัวอักษร',
  maxlength: 'เหตุผลต้องไม่เกิน {{ max }} ตัวอักษร',
  whitespace: 'กรุณากรอกเหตุผลที่ชัดเจน ไม่ใช่แค่ช่องว่าง'
}
```

---

### Item Fields

#### 1. Generic (Drug) - required

**Rules:**

- ✅ Required
- ✅ Must be valid drug ID
- ✅ Drug must be active
- ✅ No duplicate drugs in same request

**Messages:**

```typescript
{
  required: 'กรุณาเลือกรายการยา',
  invalid: 'ยาไม่ถูกต้องหรือถูกยกเลิกการใช้งาน',
  duplicate: 'ยานี้มีอยู่ในรายการแล้ว (บรรทัดที่ {{ lineNumber }})'
}
```

---

#### 2. Requested Quantity - required

**Rules:**

- ✅ Required
- ✅ Must be > 0
- ✅ Must be integer (for most drugs)
- ✅ Max: 999,999,999
- ⚠️ Warning if qty > 10x avg usage

**Messages:**

```typescript
{
  required: 'กรุณาระบุจำนวน',
  min: 'จำนวนต้องมากกว่า 0',
  max: 'จำนวนต้องไม่เกิน {{ max }}',
  integer: 'จำนวนต้องเป็นจำนวนเต็ม',
  warning: 'จำนวนที่ขอสูงกว่าการใช้เฉลี่ยถึง {{ ratio }}% - กรุณาตรวจสอบ'
}
```

---

#### 3. Unit Price - required

**Rules:**

- ✅ Required
- ✅ Must be > 0
- ✅ Max: 999,999.99
- ✅ Max 2 decimal places
- ⚠️ Warning if price differs > 20% from last price

**Messages:**

```typescript
{
  required: 'กรุณาระบุราคาต่อหน่วย',
  min: 'ราคาต้องมากกว่า 0',
  max: 'ราคาต้องไม่เกิน {{ max }}',
  decimal: 'ราคาทศนิยมได้ไม่เกิน 2 ตำแหน่ง',
  warning: 'ราคาแตกต่างจากราคาล่าสุด {{ diff }}% ({{ lastPrice }} บาท)'
}
```

---

#### 4. Quarterly Distribution (Q1-Q4)

**Rules:**

- ✅ Each quarter >= 0
- ✅ Sum of Q1+Q2+Q3+Q4 = Requested Quantity
- ⚠️ Warning if all quantity in one quarter

**Messages:**

```typescript
{
  min: 'จำนวนในแต่ละไตรมาสต้องไม่ติดลบ',
  sum: 'ผลรวม Q1+Q2+Q3+Q4 ({{ sum }}) ต้องเท่ากับจำนวนที่ขอ ({{ total }})',
  warning: 'จำนวนทั้งหมดอยู่ในไตรมาสเดียว - กรุณาตรวจสอบการกระจาย'
}
```

---

#### 5. Budget Type & Category

**Rules:**

- ✅ Budget Type required
- ✅ Budget Category required (ถ้า type มี category)
- ✅ Must be active

**Messages:**

```typescript
{
  typeRequired: 'กรุณาเลือกประเภทงบประมาณ',
  categoryRequired: 'กรุณาเลือกหมวดงบประมาณ',
  invalid: 'ประเภท/หมวดงบไม่ถูกต้องหรือถูกยกเลิก'
}
```

---

## Business Rule Validation

### Rule 1: Minimum Items

**Rule:** Must have at least 1 item before submit

```typescript
function validateMinimumItems(request: BudgetRequest): ValidationResult {
  const itemCount = request.items.length;

  if (itemCount === 0) {
    return {
      valid: false,
      error: 'กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการก่อน submit',
    };
  }

  if (itemCount < 5) {
    return {
      valid: true,
      warning: `คำขอมีเพียง ${itemCount} รายการ - กรุณาตรวจสอบว่าครบถ้วนแล้ว`,
    };
  }

  return { valid: true };
}
```

---

### Rule 2: Budget Allocation Check

**Rule:** Total amount should not exceed allocated budget

```typescript
async function validateBudgetAllocation(request: BudgetRequest): Promise<ValidationResult> {
  // Get budget allocation
  const allocation = await getBudgetAllocation({
    fiscal_year: request.fiscal_year,
    department_id: request.department_id,
    budget_type_id: request.items[0].budget_type_id, // Assume same type for all
  });

  if (!allocation) {
    return {
      valid: false,
      error: 'ไม่พบการจัดสรรงบประมาณสำหรับแผนกนี้ในปีงบประมาณ ' + request.fiscal_year,
    };
  }

  const totalRequested = request.total_requested_amount;
  const available = allocation.remaining_budget;

  if (totalRequested > available) {
    return {
      valid: false,
      error: `งบประมาณไม่เพียงพอ: ขอ ${totalRequested.toLocaleString()} บาท แต่เหลือเพียง ${available.toLocaleString()} บาท (ขาด ${(totalRequested - available).toLocaleString()} บาท)`,
    };
  }

  const utilizationPercent = (totalRequested / available) * 100;

  if (utilizationPercent > 80) {
    return {
      valid: true,
      warning: `คำขอนี้จะใช้งบประมาณถึง ${utilizationPercent.toFixed(1)}% ของงบคงเหลือ - กรุณาพิจารณาอย่างรอบคอบ`,
    };
  }

  return { valid: true };
}
```

---

### Rule 3: Drug in Budget Plan Check

**Rule:** Warn if drug not in approved budget plan

```typescript
async function validateDrugsInPlan(request: BudgetRequest): Promise<ValidationResult> {
  const plan = await getApprovedBudgetPlan({
    fiscal_year: request.fiscal_year,
    department_id: request.department_id,
  });

  if (!plan) {
    return {
      valid: true,
      warning: 'ไม่พบแผนงบประมาณที่อนุมัติแล้วสำหรับปีนี้ - ยาทั้งหมดจะถือว่าไม่อยู่ในแผน',
    };
  }

  const planDrugIds = new Set(plan.items.map((item) => item.generic_id));
  const notInPlan = request.items.filter((item) => !planDrugIds.has(item.generic_id));

  if (notInPlan.length > 0) {
    const drugNames = notInPlan
      .slice(0, 5)
      .map((item) => item.generic_name)
      .join(', ');
    const more = notInPlan.length > 5 ? ` และอีก ${notInPlan.length - 5} รายการ` : '';

    return {
      valid: true,
      warning: `มี ${notInPlan.length} รายการที่ไม่อยู่ในแผนงบประมาณ: ${drugNames}${more}`,
    };
  }

  return { valid: true };
}
```

---

### Rule 4: Duplicate Request Check

**Rule:** Warn if similar request exists

```typescript
async function checkDuplicateRequest(request: BudgetRequest): Promise<ValidationResult> {
  const existing = await findBudgetRequests({
    fiscal_year: request.fiscal_year,
    department_id: request.department_id,
    status: ['SUBMITTED', 'DEPT_APPROVED', 'FINANCE_APPROVED'],
    created_at_after: subtractDays(new Date(), 30), // Last 30 days
  });

  if (existing.length > 0) {
    return {
      valid: true,
      warning: `พบคำขออื่นในช่วง 30 วันที่ผ่านมา (${existing.length} คำขอ) - กรุณาตรวจสอบว่าไม่ซ้ำซ้อน`,
    };
  }

  return { valid: true };
}
```

---

### Rule 5: Quarterly Distribution Logic

**Rule:** Warn if distribution seems unusual

```typescript
function validateQuarterlyDistribution(item: BudgetRequestItem): ValidationResult {
  const { q1_qty, q2_qty, q3_qty, q4_qty, requested_qty } = item;
  const quarters = [q1_qty, q2_qty, q3_qty, q4_qty];

  // Check sum
  const sum = quarters.reduce((a, b) => a + b, 0);
  if (sum !== requested_qty) {
    return {
      valid: false,
      error: `ผลรวมไตรมาส (${sum}) ไม่เท่ากับจำนวนที่ขอ (${requested_qty})`,
    };
  }

  // Check if all in one quarter
  const nonZeroQuarters = quarters.filter((q) => q > 0).length;
  if (nonZeroQuarters === 1) {
    return {
      valid: true,
      warning: 'จำนวนทั้งหมดอยู่ในไตรมาสเดียว - การกระจายดูไม่สมดุล',
    };
  }

  // Check if very uneven (one quarter > 70%)
  const maxQuarter = Math.max(...quarters);
  if (maxQuarter / requested_qty > 0.7) {
    return {
      valid: true,
      warning: `ไตรมาสหนึ่งมีจำนวนมากถึง ${((maxQuarter / requested_qty) * 100).toFixed(0)}% - ควรกระจายให้สมดุลกว่านี้`,
    };
  }

  return { valid: true };
}
```

---

## Warning vs Error

### 🔴 Error (Hard Stop)

**Cannot proceed until fixed:**

- ❌ Required fields missing
- ❌ Invalid data format
- ❌ Business rule violation (e.g., insufficient budget)
- ❌ Sum validation failed (Q1+Q2+Q3+Q4 ≠ Total)

**UI Behavior:**

- Submit button DISABLED
- Show error icon with red color
- Error message displayed prominently

---

### ⚠️ Warning (Soft Alert)

**Can proceed but should review:**

- ⚠️ Drug not in plan
- ⚠️ High budget utilization (>80%)
- ⚠️ Unusual quantity (>10x average)
- ⚠️ Price difference >20%
- ⚠️ Uneven quarterly distribution

**UI Behavior:**

- Submit button ENABLED
- Show warning icon with orange color
- User must acknowledge warnings
- Show confirmation dialog before submit

---

### 💡 Info (Helpful Context)

**Additional information:**

- ℹ️ Budget allocation status
- ℹ️ Historical usage
- ℹ️ Last year's request
- ℹ️ Suggestions

**UI Behavior:**

- Show info icon with blue color
- Non-intrusive display
- Optional to read

---

## Implementation Examples

### Frontend Validation Service

```typescript
// apps/web/src/app/features/inventory/modules/budget-requests/services/budget-request-validation.service.ts

@Injectable({
  providedIn: 'root',
})
export class BudgetRequestValidationService {
  /**
   * Validate request before submit
   * Returns array of errors and warnings
   */
  async validateForSubmit(request: BudgetRequest): Promise<ValidationResults> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];

    // 1. Header validation
    if (!request.fiscal_year) {
      errors.push('กรุณาเลือกปีงบประมาณ');
    }

    if (!request.department_id) {
      errors.push('กรุณาเลือกแผนก');
    }

    if (!request.justification || request.justification.trim().length < 20) {
      errors.push('กรุณากรอกเหตุผลในการขออย่างน้อย 20 ตัวอักษร');
    }

    // 2. Items validation
    if (request.items.length === 0) {
      errors.push('กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ');
    }

    // Check each item
    for (const item of request.items) {
      const itemErrors = this.validateItem(item);
      errors.push(...itemErrors);
    }

    // 3. Budget allocation check
    const budgetCheck = await this.validateBudgetAllocation(request);
    if (!budgetCheck.valid) {
      errors.push(budgetCheck.error!);
    } else if (budgetCheck.warning) {
      warnings.push(budgetCheck.warning);
    }

    // 4. Drug in plan check
    const planCheck = await this.validateDrugsInPlan(request);
    if (planCheck.warning) {
      warnings.push(planCheck.warning);
    }

    // 5. Duplicate check
    const dupCheck = await this.checkDuplicateRequest(request);
    if (dupCheck.warning) {
      warnings.push(dupCheck.warning);
    }

    // 6. Info messages
    info.push(`จำนวนรายการทั้งหมด: ${request.items.length}`);
    info.push(`ยอดรวม: ${request.total_requested_amount.toLocaleString()} บาท`);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Validate single item
   */
  private validateItem(item: BudgetRequestItem): string[] {
    const errors: string[] = [];

    if (!item.generic_id) {
      errors.push(`บรรทัดที่ ${item.line_number}: กรุณาเลือกรายการยา`);
    }

    if (!item.requested_qty || item.requested_qty <= 0) {
      errors.push(`บรรทัดที่ ${item.line_number}: จำนวนต้องมากกว่า 0`);
    }

    if (!item.unit_price || item.unit_price <= 0) {
      errors.push(`บรรทัดที่ ${item.line_number}: ราคาต้องมากกว่า 0`);
    }

    // Quarterly validation
    const sum = (item.q1_qty || 0) + (item.q2_qty || 0) + (item.q3_qty || 0) + (item.q4_qty || 0);
    if (sum !== item.requested_qty) {
      errors.push(`บรรทัดที่ ${item.line_number}: ผลรวมไตรมาส (${sum}) ไม่เท่ากับจำนวนที่ขอ (${item.requested_qty})`);
    }

    return errors;
  }
}
```

---

### Backend Validation (Fastify)

```typescript
// apps/api/src/modules/inventory/operations/budgetRequests/budget-requests.service.ts

export class BudgetRequestsService {
  /**
   * Validate before submit
   * Throws error if validation fails
   */
  async validateForSubmit(id: number): Promise<void> {
    const request = await this.repository.findById(id);

    if (!request) {
      throw new NotFoundException('Budget request not found');
    }

    // Load items
    const items = await this.itemsRepository.findByRequestId(id);

    // 1. Header validation
    if (!request.fiscal_year) {
      throw new BadRequestException('Fiscal year is required');
    }

    if (!request.department_id) {
      throw new BadRequestException('Department is required');
    }

    if (!request.justification || request.justification.trim().length < 20) {
      throw new BadRequestException('Justification must be at least 20 characters');
    }

    // 2. Items validation
    if (items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    // Validate each item
    for (const item of items) {
      await this.validateItem(item);
    }

    // 3. Budget allocation check (CRITICAL)
    const available = await this.checkBudgetAvailability(request);
    if (!available) {
      throw new BadRequestException('Insufficient budget allocation');
    }

    // All validations passed
  }

  /**
   * Validate single item
   */
  private async validateItem(item: BudgetRequestItem): Promise<void> {
    if (!item.generic_id) {
      throw new BadRequestException(`Line ${item.line_number}: Generic is required`);
    }

    if (item.requested_qty <= 0) {
      throw new BadRequestException(`Line ${item.line_number}: Quantity must be greater than 0`);
    }

    if (item.unit_price <= 0) {
      throw new BadRequestException(`Line ${item.line_number}: Unit price must be greater than 0`);
    }

    // Quarterly validation
    const sum = (item.q1_qty || 0) + (item.q2_qty || 0) + (item.q3_qty || 0) + (item.q4_qty || 0);
    if (sum !== item.requested_qty) {
      throw new BadRequestException(`Line ${item.line_number}: Quarterly sum (${sum}) must equal requested quantity (${item.requested_qty})`);
    }
  }
}
```

---

### Pre-submit Confirmation Dialog

```typescript
// Frontend component
async submit() {
  // 1. Run validation
  const validation = await this.validationService.validateForSubmit(this.budgetRequest());

  if (!validation.valid) {
    // Show errors
    this.dialog.open(ValidationErrorsDialog, {
      data: {
        errors: validation.errors
      }
    });
    return;
  }

  // 2. If warnings exist, show confirmation
  if (validation.warnings.length > 0) {
    const confirmed = await this.dialog.open(ConfirmSubmitDialog, {
      data: {
        warnings: validation.warnings,
        info: validation.info
      }
    }).afterClosed().toPromise();

    if (!confirmed) {
      return; // User cancelled
    }
  }

  // 3. Proceed with submit
  try {
    await this.budgetRequestService.submitBudgetRequest(this.budgetRequest().id);
    this.snackBar.open('ส่งคำขออนุมัติเรียบร้อยแล้ว', 'Close', { duration: 3000 });
    this.router.navigate(['/inventory/budget-requests']);
  } catch (error) {
    this.snackBar.open('เกิดข้อผิดพลาด: ' + error.message, 'Close', { duration: 5000 });
  }
}
```

---

## Summary

### Validation Checklist Before Submit

✅ **Required Fields**

- Fiscal Year
- Department
- Justification (>= 20 chars)

✅ **Items**

- At least 1 item
- All items have drug, qty, price
- No duplicate drugs
- Quarterly sum = total qty

✅ **Business Rules**

- Budget allocation exists
- Budget available >= requested amount
- Items validated

⚠️ **Warnings (Can proceed)**

- Drugs not in plan
- High budget utilization
- Unusual quantities
- Price differences

### Next Steps

1. ✅ Implement validation service in frontend
2. ✅ Implement validation in backend API
3. ✅ Create pre-submit confirmation dialog
4. ⏭️ Read [04-DASHBOARD-SPEC.md](./04-DASHBOARD-SPEC.md) for dashboard design

---

[← Back to Index](./README.md) | [← Previous: Permission Matrix](./02-PERMISSION-MATRIX.md) | [Next: Dashboard Spec →](./04-DASHBOARD-SPEC.md)
