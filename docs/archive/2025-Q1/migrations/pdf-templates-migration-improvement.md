# PDF Templates Migration Improvement

> **Migration**: `20251219100000_update_default_pdf_templates.ts`
> **Seed**: `009_update_pdf_template_starters.ts`
> **Date**: 2025-12-19

---

## 📋 สรุปการปรับปรุง (Summary)

การปรับปรุงครั้งนี้แก้ไขปัญหาของ PDF Templates เริ่มต้นที่ไม่เหมาะสมกับระบบจริง โดยแทนที่ด้วย Templates ที่รองรับ:

✅ **ภาษาไทย** - ใช้ฟอนต์ Sarabun
✅ **กราฟและชาร์ต** - Chart placeholders สำหรับข้อมูลแบบ visual
✅ **โดเมนที่ใช้จริง** - Inventory และ Budget management
✅ **ข้อมูลตัวอย่างที่สมจริง** - Field names และ values ตรงกับฐานข้อมูลจริง

---

## 🎯 ปัญหาของ Templates เดิม

### Default Templates (จาก migration 012)

| Template             | ปัญหา                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **simple-report**    | - ใช้ข้อมูล generic (name, value, date)<br>- ไม่มีฟอนต์ไทย<br>- ไม่รองรับกราฟ<br>- ไม่เกี่ยวข้องกับ Inventory/Budget |
| **invoice-template** | - ออกแบบสำหรับ invoice ทั่วไป<br>- ไม่มีฟอนต์ไทย<br>- Field names ไม่ตรงกับระบบ<br>- ไม่มี chart support             |

### Template Starters (จาก seed 004)

| Starter                 | ปัญหา                                     |
| ----------------------- | ----------------------------------------- |
| **thai-invoice**        | - Generic invoice ไม่เฉพาะเจาะจง          |
| **thai-receipt**        | - ใช้ fields ทั่วไป (customerName, total) |
| **thai-quotation**      | - ไม่เกี่ยวข้องกับโดเมน Inventory/Budget  |
| **thai-monthly-report** | - รายงานทั่วไป ไม่มี context              |

---

## ✨ Templates ใหม่

### 1. Default Templates (2 templates)

#### 1.1 inventory-stock-report

**หมวดหมู่**: `inventory`
**ประเภท**: `report`
**จุดเด่น**:

- รายงานยาคงคลังแบบครบถ้วน
- Summary cards แสดงภาพรวม (มูลค่ารวม, จำนวนรายการ, ยาใกล้หมดอายุ, ยาต่ำกว่าจุดสั่งซื้อ)
- Chart placeholder สำหรับกราฟมูลค่าแยกตามคลัง
- ตารางรายละเอียดยาทุกรายการ
- รองรับฟอนต์ Sarabun สำหรับภาษาไทย

**Sample Data Structure**:

```typescript
{
  month: 'มกราคม 2568',
  department: 'ฝ่ายเภสัชกรรม',
  totalValue: 1650000,        // มูลค่ารวมทั้งหมด
  totalItems: 156,             // จำนวนรายการยา
  nearExpiry: 12,              // ยาใกล้หมดอายุ
  belowReorderPoint: 8,        // ยาต่ำกว่าจุดสั่งซื้อ
  items: [
    {
      drugName: 'Paracetamol 500mg',
      location: 'คลังหลัก',
      quantity: 5000,
      unit: 'เม็ด',
      unitPrice: 10,
      totalValue: 50000,
      expiryDate: '2026-12-31',
      reorderPoint: 1000
    }
  ],
  stockByLocationChart: 'data:image/png;base64,...' // Base64 chart
}
```

**Chart Placeholder Usage**:

```handlebars
{{#if stockByLocationChart}}
  { text: '📍 มูลค่ายาคงคลังแยกตามคลัง', style: 'chartTitle', margin: [0, 20, 0, 10] }, { image: '{{stockByLocationChart}}', width: 500, height: 300, alignment: 'center', margin: [0, 0, 0, 20] },
{{/if}}
```

**การสร้างกราฟ**:

```typescript
import { ChartService } from '@/services/chart.service';
import { PdfTemplateService } from '@/layers/platform/pdf-templates/pdf-template.service';

// 1. เตรียมข้อมูลสำหรับกราฟ
const locationSummary = inventoryData.reduce(
  (acc, item) => {
    acc[item.location] = (acc[item.location] || 0) + item.totalValue;
    return acc;
  },
  {} as Record<string, number>,
);

// 2. สร้างกราฟ
const chartService = new ChartService();
const chartBuffer = await chartService.generateChart({
  type: 'bar',
  data: {
    labels: Object.keys(locationSummary),
    datasets: [
      {
        label: 'มูลค่ายาคงคลัง (บาท)',
        data: Object.values(locationSummary),
        backgroundColor: ['#1976d2', '#42a5f5', '#64b5f6'],
      },
    ],
  },
  options: {
    title: 'มูลค่ายาคงคลังแยกตามคลัง',
    colorScheme: 'primary',
    displayValues: true,
    showLegend: true,
  },
  width: 500,
  height: 300,
});

// 3. แปลงเป็น base64 data URL
const stockByLocationChart = `data:image/png;base64,${chartBuffer.toString('base64')}`;

// 4. Render PDF
const pdfService = new PdfTemplateService();
const pdfBuffer = await pdfService.renderTemplate({
  templateName: 'inventory-stock-report',
  data: {
    ...inventoryData,
    stockByLocationChart, // ใส่ chart ลงไปใน data
  },
});
```

---

#### 1.2 budget-allocation-report

**หมวดหมู่**: `budget`
**ประเภท**: `report`
**จุดเด่น**:

- รายงานการจัดสรรงบประมาณ
- Summary แสดงงบที่ได้รับ/ใช้/คงเหลือ
- Chart placeholders 2 กราฟ:
  - กราฆ pie chart แสดงสัดส่วนการกระจายงบ
  - กราฟ bar chart เปรียบเทียบงบที่ได้รับกับที่ใช้ไป
- ตารางรายละเอียดแยกตามหมวดหมู่
- รองรับฟอนต์ Sarabun

**Sample Data Structure**:

```typescript
{
  fiscalYear: '2568',
  department: 'ฝ่ายเภสัชกรรม',
  totalAllocated: 5000000,     // งบที่ได้รับทั้งหมด
  totalSpent: 3200000,         // งบที่ใช้ไปแล้ว
  remaining: 1800000,          // งบคงเหลือ
  usagePercent: 64,            // % การใช้งบ
  allocations: [
    {
      category: 'จัดซื้อยา',
      allocated: 2500000,
      spent: 1800000,
      remaining: 700000,
      usagePercent: 72
    },
    {
      category: 'ค่าบำรุงรักษาอุปกรณ์',
      allocated: 1500000,
      spent: 900000,
      remaining: 600000,
      usagePercent: 60
    },
    {
      category: 'ค่าวัสดุสิ้นเปลือง',
      allocated: 1000000,
      spent: 500000,
      remaining: 500000,
      usagePercent: 50
    }
  ],
  budgetDistributionChart: 'data:image/png;base64,...',
  budgetComparisonChart: 'data:image/png;base64,...'
}
```

**Chart Placeholders Usage**:

```handlebars
{{#if budgetDistributionChart}}
  { text: '📊 สัดส่วนการกระจายงบประมาณ', style: 'chartTitle' }, { image: '{{budgetDistributionChart}}', width: 400, height: 400, alignment: 'center' },
{{/if}}

{{#if budgetComparisonChart}}
  { text: '📈 เปรียบเทียบงบประมาณที่ได้รับกับที่ใช้ไป', style: 'chartTitle' }, { image: '{{budgetComparisonChart}}', width: 500, height: 300, alignment: 'center' },
{{/if}}
```

**การสร้างกราฟ**:

```typescript
// กราฟที่ 1: Pie Chart - สัดส่วนการกระจายงบ
const pieChartBuffer = await chartService.generateChart({
  type: 'pie',
  data: {
    labels: allocations.map((a) => a.category),
    datasets: [
      {
        data: allocations.map((a) => a.allocated),
        backgroundColor: ['#1976d2', '#388e3c', '#f57c00'],
      },
    ],
  },
  options: {
    title: 'สัดส่วนการกระจายงบประมาณ',
    colorScheme: 'mixed',
    displayValues: true,
    showLegend: true,
  },
  width: 400,
  height: 400,
});

// กราฟที่ 2: Bar Chart - เปรียบเทียบงบที่ได้รับกับที่ใช้
const barChartBuffer = await chartService.generateChart({
  type: 'bar',
  data: {
    labels: allocations.map((a) => a.category),
    datasets: [
      {
        label: 'งบที่ได้รับ',
        data: allocations.map((a) => a.allocated),
        backgroundColor: '#1976d2',
      },
      {
        label: 'งบที่ใช้',
        data: allocations.map((a) => a.spent),
        backgroundColor: '#388e3c',
      },
    ],
  },
  options: {
    title: 'เปรียบเทียบงบประมาณ',
    colorScheme: 'primary',
    displayValues: true,
    showLegend: true,
    showGrid: true,
  },
  width: 500,
  height: 300,
});

// แปลงเป็น base64
const budgetDistributionChart = `data:image/png;base64,${pieChartBuffer.toString('base64')}`;
const budgetComparisonChart = `data:image/png;base64,${barChartBuffer.toString('base64')}`;

// Render
const pdfBuffer = await pdfService.renderTemplate({
  templateName: 'budget-allocation-report',
  data: {
    ...budgetData,
    budgetDistributionChart,
    budgetComparisonChart,
  },
});
```

---

### 2. Template Starters (4 starters)

#### 2.1 inventory-requisition-starter (ใบเบิกยา)

**Display Name**: `ใบเบิกยา / Inventory Requisition`
**Use Case**: สำหรับแผนกต่างๆ เบิกยาจากคลัง

**Fields**:

- `requisitionNumber` - เลขที่ใบเบิก
- `department` - แผนกผู้เบิก
- `requisitionDate` - วันที่เบิก
- `requestedBy` - ผู้เบิก
- `approvedBy` - ผู้อนุมัติ
- `items[]` - รายการยาที่เบิก
  - `drugName` - ชื่อยา
  - `quantity` - จำนวน
  - `unit` - หน่วย

**Sample Usage**:

```typescript
const pdfBuffer = await pdfService.renderTemplate({
  templateName: 'inventory-requisition-starter',
  data: {
    requisitionNumber: 'REQ-2025-001',
    department: 'ห้องฉุกเฉิน / Emergency Room',
    requisitionDate: '2025-01-15',
    requestedBy: 'นางสาวสมหญิง พยาบาลดี',
    approvedBy: 'นายสมชาย หัวหน้าคลัง',
    items: [
      {
        drugName: 'Paracetamol 500mg',
        quantity: '100',
        unit: 'เม็ด',
      },
      {
        drugName: 'Amoxicillin 500mg',
        quantity: '50',
        unit: 'แคปซูล',
      },
    ],
  },
});
```

---

#### 2.2 drug-dispensing-receipt-starter (ใบจ่ายยา)

**Display Name**: `ใบจ่ายยา / Drug Dispensing Receipt`
**Use Case**: สำหรับห้องยาจ่ายยาให้ผู้ป่วย

**Fields**:

- `patient.hn` - เลข HN
- `patient.name` - ชื่อผู้ป่วย
- `patient.age` - อายุ
- `patient.allergies` - ประวัติแพ้ยา
- `prescriber` - แพทย์ผู้สั่งยา
- `dispensedBy` - เภสัชกรผู้จ่ายยา
- `dispensedDate` - วันที่จ่ายยา
- `medications[]` - รายการยา
  - `name` - ชื่อยา
  - `quantity` - จำนวน
  - `instruction` - วิธีใช้

**Sample Usage**:

```typescript
const pdfBuffer = await pdfService.renderTemplate({
  templateName: 'drug-dispensing-receipt-starter',
  data: {
    patient: {
      hn: 'HN-123456',
      name: 'นายสมชาย ใจดี',
      age: '45',
      allergies: 'Penicillin',
    },
    prescriber: 'นพ. สมศักดิ์ แพทย์ดี',
    dispensedBy: 'ภก. สมหญิง เภสัชกรเก่ง',
    dispensedDate: '2025-01-15',
    medications: [
      {
        name: 'Amoxicillin 500mg',
        quantity: '21',
        instruction: 'รับประทาน 1 แคปซูล วันละ 3 ครั้ง หลังอาหาร',
      },
      {
        name: 'Paracetamol 500mg',
        quantity: '10',
        instruction: 'รับประทานเมื่อมีไข้ ครั้งละ 1-2 เม็ด',
      },
    ],
  },
});
```

---

#### 2.3 budget-request-form-starter (ใบขอจัดสรรงบประมาณ)

**Display Name**: `ใบขอจัดสรรงบประมาณ / Budget Request Form`
**Use Case**: สำหรับแผนกต่างๆ ขอจัดสรรงบประมาณ

**Fields**:

- `requestNumber` - เลขที่คำขอ
- `department` - แผนกผู้ขอ
- `fiscalYear` - ปีงบประมาณ
- `budgetType` - ประเภทงบประมาณ
- `purpose` - วัตถุประสงค์
- `totalAmount` - จำนวนเงินรวม
- `requestedBy` - ผู้ขอ
- `items[]` - รายการที่ขอ
  - `description` - รายละเอียด
  - `quantity` - จำนวน
  - `unitPrice` - ราคา/หน่วย
  - `total` - รวม

**Sample Usage**:

```typescript
const pdfBuffer = await pdfService.renderTemplate({
  templateName: 'budget-request-form-starter',
  data: {
    requestNumber: 'BRQ-2025-001',
    department: 'ฝ่ายเภสัชกรรม',
    fiscalYear: '2568',
    budgetType: 'งบลงทุน',
    purpose: 'จัดซื้อตู้เย็นเก็บยา',
    totalAmount: 150000,
    requestedBy: 'นายสมชาย หัวหน้าฝ่าย',
    items: [
      {
        description: 'ตู้เย็นเก็บยา ขนาด 500 ลิตร',
        quantity: '2',
        unitPrice: '65000',
        total: '130000',
      },
      {
        description: 'เครื่องวัดอุณหภูมิดิจิตอล',
        quantity: '4',
        unitPrice: '5000',
        total: '20000',
      },
    ],
  },
});
```

---

#### 2.4 inventory-monthly-report-chart-starter (รายงานยาประจำเดือน + กราฟ)

**Display Name**: `รายงานยาประจำเดือน (มีกราฟ) / Monthly Inventory Report with Charts`
**Use Case**: รายงานประจำเดือนแบบครบถ้วนพร้อมกราฟ

**จุดเด่น**:

- รองรับกราฟหลายแบบ (chart1, chart2, chart3)
- Summary cards แสดงภาพรวม
- ตารางรายละเอียดครบถ้วน

**Fields**:

- `month` - เดือน
- `department` - แผนก
- `totalValue` - มูลค่ารวม
- `totalItems` - จำนวนรายการ
- `nearExpiry` - ยาใกล้หมดอายุ
- `items[]` - รายการยา
- `chart1`, `chart2`, `chart3` - กราฟ (base64 data URL)

**Sample Usage**:

```typescript
// สร้างกราฟ 3 แบบ
const chart1Buffer = await chartService.generateChart({
  type: 'bar',
  data: {
    labels: ['คลังหลัก', 'คลังย่อย A', 'คลังย่อย B'],
    datasets: [
      {
        label: 'มูลค่ายาคงคลัง',
        data: [800000, 450000, 250000],
      },
    ],
  },
  options: {
    title: 'มูลค่ายาคงคลังแยกตามคลัง',
    colorScheme: 'primary',
    displayValues: true,
  },
});

const chart2Buffer = await chartService.generateChart({
  type: 'line',
  data: {
    labels: ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4'],
    datasets: [
      {
        label: 'การเบิกจ่ายยา',
        data: [45000, 52000, 48000, 61000],
      },
    ],
  },
  options: {
    title: 'แนวโน้มการเบิกจ่ายยา',
    colorScheme: 'success',
  },
});

const chart3Buffer = await chartService.generateChart({
  type: 'pie',
  data: {
    labels: ['ยาหมุนเวียนเร็ว', 'ยาหมุนเวียนปานกลาง', 'ยาหมุนเวียนช้า'],
    datasets: [
      {
        data: [45, 35, 20],
      },
    ],
  },
  options: {
    title: 'สัดส่วนยาตามความเร็วหมุนเวียน',
    colorScheme: 'mixed',
    displayValues: true,
  },
});

// Render
const pdfBuffer = await pdfService.renderTemplate({
  templateName: 'inventory-monthly-report-chart-starter',
  data: {
    month: 'มกราคม 2568',
    department: 'ฝ่ายเภสัชกรรม',
    totalValue: 1650000,
    totalItems: 156,
    nearExpiry: 12,
    items: inventoryData,
    chart1: `data:image/png;base64,${chart1Buffer.toString('base64')}`,
    chart2: `data:image/png;base64,${chart2Buffer.toString('base64')}`,
    chart3: `data:image/png;base64,${chart3Buffer.toString('base64')}`,
  },
});
```

---

## 🔄 Migration Procedures

### วิธีการ Migrate

```bash
# 1. Run migration
pnpm run db:migrate

# 2. Run seed (ถ้าต้องการ Template Starters)
pnpm run db:seed
```

**สิ่งที่เกิดขึ้น**:

1. Migration จะ:
   - ลบ default templates เก่า 2 ตัว (simple-report, invoice-template)
   - สร้าง default templates ใหม่ 2 ตัว (inventory-stock-report, budget-allocation-report)

2. Seed จะ:
   - ลบ template starters เก่า 4 ตัว (thai-invoice, thai-receipt, thai-quotation, thai-monthly-report)
   - สร้าง template starters ใหม่ 4 ตัว (inventory-requisition-starter, drug-dispensing-receipt-starter, budget-request-form-starter, inventory-monthly-report-chart-starter)

### วิธีการ Rollback

```bash
pnpm run db:rollback
```

**สิ่งที่เกิดขึ้น**:

- ลบ templates ใหม่ทั้งหมด
- คืน templates เก่ากลับมา (simple-report, invoice-template)

**⚠️ หมายเหตุ**: Seed ไม่มี rollback - ต้อง manually restore ถ้าต้องการ

---

## 📊 Comparison Table

### Default Templates

| Feature           | เดิม (simple-report)     | ใหม่ (inventory-stock-report)                         |
| ----------------- | ------------------------ | ----------------------------------------------------- |
| **ฟอนต์ไทย**      | ❌ ไม่มี                 | ✅ Sarabun                                            |
| **Chart Support** | ❌ ไม่มี                 | ✅ มี chart placeholder                               |
| **โดเมนเฉพาะ**    | ❌ Generic               | ✅ Inventory domain                                   |
| **Summary Cards** | ❌ ไม่มี                 | ✅ 4 cards (total value, items, near expiry, reorder) |
| **Field Names**   | ❌ Generic (name, value) | ✅ Realistic (drugName, location, quantity)           |
| **Sample Data**   | ❌ ข้อมูลทั่วไป          | ✅ ข้อมูลยาจริง                                       |

| Feature           | เดิม (invoice-template)   | ใหม่ (budget-allocation-report)           |
| ----------------- | ------------------------- | ----------------------------------------- |
| **ฟอนต์ไทย**      | ❌ ไม่มี                  | ✅ Sarabun                                |
| **Chart Support** | ❌ ไม่มี                  | ✅ 2 charts (pie + bar)                   |
| **โดเมนเฉพาะ**    | ❌ Generic invoice        | ✅ Budget domain                          |
| **Summary**       | ❌ แค่ total              | ✅ Allocated/Spent/Remaining              |
| **Field Names**   | ❌ Generic (items, total) | ✅ Realistic (category, allocated, spent) |

### Template Starters

| Feature           | เดิม                                          | ใหม่                                                               |
| ----------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| **จำนวน**         | 4 templates                                   | 4 templates                                                        |
| **โดเมน**         | Generic (invoice, receipt, quotation, report) | Specific (requisition, dispensing, budget request, monthly report) |
| **ฟอนต์ไทย**      | ✅ มี (Sarabun)                               | ✅ มี (Sarabun)                                                    |
| **Chart Support** | ❌ ไม่มี                                      | ✅ 1 template มี (monthly report)                                  |
| **Field Names**   | ❌ Generic                                    | ✅ ตรงกับ DB schema                                                |
| **Use Case**      | ❌ ไม่ชัดเจน                                  | ✅ ชัดเจน (เบิกยา, จ่ายยา, ขอจัดสรร, รายงาน)                       |

---

## 💡 Best Practices

### 1. การใช้ Default Templates

**inventory-stock-report**:

- ✅ ใช้สำหรับรายงานยาคงคลังรายเดือน
- ✅ ใส่กราฟแสดงมูลค่าแยกตามคลัง
- ✅ รวม summary cards เพื่อภาพรวม
- ❌ ไม่ใช้สำหรับรายงานประเภทอื่น

**budget-allocation-report**:

- ✅ ใช้สำหรับรายงานจัดสรรงบประมาณ
- ✅ ใส่กราฆ 2 แบบ (pie + bar) เพื่อมุมมองที่หลากหลาย
- ✅ แสดง % การใช้งบในแต่ละหมวด
- ❌ ไม่ใช้สำหรับรายงานการเงินประเภทอื่น

### 2. การใช้ Template Starters

**เมื่อไหร่ควรใช้**:

- ✅ เริ่มต้นสร้าง template ใหม่
- ✅ ต้องการ template พื้นฐานที่ปรับแต่งได้
- ✅ ต้องการ reference structure

**เมื่อไหร่ไม่ควรใช้**:

- ❌ ต้องการ template สำเร็จรูป (ใช้ default templates)
- ❌ ต้องการ template ที่ซับซ้อนมาก

### 3. Chart Integration

**ขั้นตอนที่แนะนำ**:

1. **เตรียมข้อมูล** - Aggregate data สำหรับกราฟ
2. **สร้างกราฟ** - ใช้ ChartService
3. **แปลง base64** - Convert buffer เป็น data URL
4. **ส่งเข้า template** - ใส่ใน data object
5. **Render PDF** - ใช้ PdfTemplateService

**ตัวอย่าง**:

```typescript
// 1. เตรียมข้อมูล
const chartData = aggregateInventoryByLocation(inventoryItems);

// 2. สร้างกราฟ
const chartBuffer = await chartService.generateChart({
  type: 'bar',
  data: chartData,
  options: {
    title: 'มูลค่ายาคงคลังแยกตามคลัง',
    colorScheme: 'primary',
    displayValues: true,
  },
  width: 500,
  height: 300,
});

// 3. แปลง base64
const stockByLocationChart = `data:image/png;base64,${chartBuffer.toString('base64')}`;

// 4 & 5. Render
const pdfBuffer = await pdfTemplateService.renderTemplate({
  templateName: 'inventory-stock-report',
  data: {
    ...reportData,
    stockByLocationChart, // ใส่ chart
  },
});
```

### 4. Font Configuration

**ตรวจสอบ Sarabun fonts**:

```bash
ls -la apps/api/src/assets/fonts/Sarabun/
```

**ควรมีไฟล์**:

- Sarabun-Regular.ttf
- Sarabun-Bold.ttf
- Sarabun-Italic.ttf
- Sarabun-BoldItalic.ttf

**ถ้าไม่มี**: Download จาก [Google Fonts](https://fonts.google.com/specimen/Sarabun)

---

## 🐛 Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. ข้อความภาษาไทยแสดงเป็นกล่อง

**สาเหตุ**: ไม่มี Sarabun fonts

**แก้ไข**:

```bash
# 1. ตรวจสอบว่ามี fonts
ls apps/api/src/assets/fonts/Sarabun/

# 2. ถ้าไม่มี download จาก Google Fonts
# 3. วางไฟล์ใน directory นั้น
# 4. Restart API server
```

#### 2. Chart ไม่แสดงใน PDF

**สาเหตุ**: ข้อมูล chart ไม่ถูกต้องหรือไม่ใส่ใน data

**แก้ไข**:

```typescript
// ✅ ถูกต้อง
const data = {
  ...reportData,
  stockByLocationChart: `data:image/png;base64,${chartBuffer.toString('base64')}`,
};

// ❌ ผิด - ลืมใส่ chart
const data = {
  ...reportData,
  // ไม่มี stockByLocationChart
};
```

#### 3. Migration ล้มเหลว

**สาเหตุ**: Default templates เก่าอาจถูกแก้ไข

**แก้ไข**:

```sql
-- ตรวจสอบ templates ที่มี
SELECT name, display_name FROM pdf_templates WHERE is_default = true;

-- ลบ manually
DELETE FROM pdf_templates WHERE name IN ('simple-report', 'invoice-template');

-- Run migration ใหม่
```

#### 4. Seed ไม่ทำงาน

**สาเหตุ**: Template starters เก่ายังอยู่

**แก้ไข**:

```sql
-- ลบ template starters เก่า
DELETE FROM pdf_templates WHERE is_template_starter = true;

-- Run seed ใหม่
pnpm run db:seed
```

---

## 📚 Related Documentation

- [PDF Template Charts Integration](../guides/reports/pdf-template-charts-integration.md) - คู่มือฉบับเต็ม
- [PDF Charts Quick Start](../guides/reports/pdf-charts-quick-start.md) - เริ่มต้นใช้งานเร็ว
- [Chart Service Documentation](../reference/api/chart-generation-api.md) - API Reference
- [PDF Template Service](../reference/api/pdf-template-service.md) - Service API

---

## 🎓 Example Files

### Migration File

```
apps/api/src/database/migrations/20251219100000_update_default_pdf_templates.ts
```

### Seed File

```
apps/api/src/database/seeds/009_update_pdf_template_starters.ts
```

### Example Usage

```
apps/api/src/services/__examples__/pdf-template-charts-usage.ts
```

### Seed Examples

```
apps/api/src/database/seeds/008_pdf_template_chart_examples.ts
```

---

## ❓ FAQ

### Q1: ต้อง migrate ทันทีไหม?

**A**: ขึ้นอยู่กับว่าคุณใช้ default templates เก่าอยู่หรือไม่

- ถ้า**ไม่ใช้** → Migrate ได้เลย
- ถ้า**ใช้อยู่** → ควร backup ข้อมูลก่อน หรือ customize templates เก่าแทน

### Q2: Rollback แล้วข้อมูลหายไหม?

**A**: Migration rollback จะคืน default templates เก่ากลับมา แต่:

- ✅ pdf_template_versions ของ templates ใหม่จะยังอยู่
- ✅ pdf_renders ที่สร้างจาก templates ใหม่ยังอยู่
- ❌ Seed ไม่มี rollback - template starters เก่าจะไม่กลับมา

### Q3: สามารถใช้ทั้ง templates เก่าและใหม่พร้อมกันได้ไหม?

**A**: ไม่ได้ โดย design - migration จะ replace templates เก่าด้วยใหม่
ถ้าต้องการเก็บเก่าไว้:

1. Rename templates เก่า (เปลี่ยน name)
2. แก้ migration ไม่ให้ลบ templates เก่า
3. Run migration

### Q4: Chart ขนาดเท่าไหร่ที่เหมาะสม?

**A**: แนะนำ:

- **Width**: 400-600 px
- **Height**: 250-400 px
- **Bar/Line**: 500x300
- **Pie/Doughnut**: 400x400

### Q5: สามารถใส่กราฟหลายแบบในรายงานเดียวได้ไหม?

**A**: ได้! ดูตัวอย่างที่ `budget-allocation-report` และ `inventory-monthly-report-chart-starter`

- ใช้ chart placeholders หลายตัว (chart1, chart2, chart3)
- สร้างกราฟแต่ละแบบแยกกัน
- ใส่ทั้งหมดใน data object

### Q6: ต้อง restart API server หลัง migrate ไหม?

**A**: ไม่ต้อง - templates load from database dynamically

### Q7: จะ customize templates ใหม่ได้ไหม?

**A**: ได้! แนะนำ:

1. Copy template ที่ต้องการ
2. Rename (เปลี่ยน name, display_name)
3. แก้ไข template_data ตามต้องการ
4. บันทึกเป็น template ใหม่

---

**เอกสารนี้อัพเดทล่าสุด**: 2025-12-19
**Migration Version**: 20251219100000
**Seed Version**: 009

**หากมีคำถามเพิ่มเติม**: ติดต่อทีมพัฒนาหรือสร้าง issue ใน GitHub 👨‍💻
