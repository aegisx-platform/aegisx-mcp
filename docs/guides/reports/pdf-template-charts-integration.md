# การใช้งาน Charts ใน PDF Templates

> คู่มือการเพิ่ม Charts เข้ากับระบบ PDF Template สำหรับสร้างรายงานที่มีกราฟและตาราง

## 📋 สารบัญ

- [ภาพรวม](#ภาพรวม)
- [วิธีการทำงาน](#วิธีการทำงาน)
- [การใช้งานพื้นฐาน](#การใช้งานพื้นฐาน)
- [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)
- [Best Practices](#best-practices)
- [การแก้ไขปัญหา](#การแก้ไขปัญหา)

---

## ภาพรวม

ระบบ PDF Template รองรับการเพิ่ม **Charts (กราฟ)** เข้าไปในเอกสาร PDF โดยใช้ความสามารถของ **ChartService** ร่วมกับ **PDFMake**

### ความสามารถหลัก

- ✅ รองรับ 4 ประเภทกราฟ: Bar, Line, Pie, Doughnut
- ✅ ใช้งานได้กับ PDF Templates ทุกประเภท
- ✅ รองรับภาษาไทยด้วย Sarabun font
- ✅ Customize สี, ขนาด, และตำแหน่งได้
- ✅ แสดงค่าบนกราฟได้ (displayValues)
- ✅ ควบคุม Legend และ Grid ได้

### ข้อจำกัด

- Charts จะถูก render เป็น PNG images
- ไม่รองรับ interactive charts (PDF เป็น static document)
- แต่ละ PDF สามารถมีได้สูงสุด 10 charts

---

## วิธีการทำงาน

### Architecture Flow

```
PDF Template (Handlebars)
    ↓
HandlebarsTemplateService (compile)
    ↓
PDFMake Document Definition
    ↓
ChartService (generate PNG charts)
    ↓
Embed Charts as Base64 Images
    ↓
Final PDF Output
```

### 2 วิธีในการใช้ Charts

#### วิธีที่ 1: ใช้ PDFMakeService โดยตรง (แนะนำสำหรับ Reports)

เหมาะสำหรับ: รายงานที่ generate จาก code โดยตรง

```typescript
import { PDFMakeService } from '@/services/pdfmake.service';

const pdfService = new PDFMakeService();

const pdfBuffer = await pdfService.generatePdf({
  title: 'รายงานยอดขาย',
  subtitle: 'มกราคม 2568',
  data: salesData,
  fields: salesFields,
  charts: [
    {
      type: 'bar',
      position: 'before',
      data: {
        labels: ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4'],
        datasets: [
          {
            label: 'ยอดขาย (บาท)',
            data: [45000, 52000, 48000, 61000],
          },
        ],
      },
      options: {
        title: 'ยอดขายรายสัปดาห์',
        colorScheme: 'primary',
        displayValues: true,
      },
    },
  ],
});
```

#### วิธีที่ 2: ใช้ PDF Template System (แนะนำสำหรับ Templates)

เหมาะสำหรับ: Template ที่ต้องการให้ user customize ได้

```typescript
import { PdfTemplateService } from '@/services/pdf-template.service';

const templateService = new PdfTemplateService(knex);

// 1. สร้าง template ที่มี chart placeholder
const template = await templateService.createTemplate({
  name: 'monthly-sales-report',
  display_name: 'รายงานยอดขายรายเดือน',
  category: 'report',
  type: 'handlebars',
  template_data: {
    content: [
      { text: 'รายงานยอดขาย', style: 'header' },
      // Chart จะถูกแทรกที่นี่ผ่าน custom helper
      '{{#chart type="bar" title="ยอดขายรายสัปดาห์"}}',
      // หรือใช้ PDFMake image syntax
      {
        image: '{{chartImage}}', // จะถูกแทนด้วย base64
        width: 500,
        height: 300,
      },
    ],
  },
  sample_data: {
    chartData: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          data: [45000, 52000, 48000, 61000],
        },
      ],
    },
  },
});

// 2. Render PDF จาก template
const pdfResponse = await templateService.renderPdf({
  templateName: 'monthly-sales-report',
  data: {
    chartImage: chartBase64DataUrl, // Pre-generated chart
    // ... other data
  },
});
```

---

## การใช้งานพื้นฐาน

### ขั้นตอนที่ 1: เตรียมข้อมูลกราฟ

```typescript
// ข้อมูลสำหรับกราฟ
const chartData = {
  labels: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน'],
  datasets: [
    {
      label: 'รายได้',
      data: [120000, 150000, 135000, 180000],
    },
    {
      label: 'รายจ่าย',
      data: [80000, 95000, 90000, 110000],
    },
  ],
};
```

### ขั้นตอนที่ 2: กำหนด Chart Configuration

```typescript
const chartConfig = {
  type: 'line', // 'bar' | 'line' | 'pie' | 'doughnut'
  position: 'before', // 'top' | 'before' | 'after' | 'bottom'
  data: chartData,
  options: {
    title: 'รายได้-รายจ่าย 4 เดือน',
    subtitle: 'หน่วย: บาท',
    colorScheme: 'mixed', // 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'mixed'
    displayValues: true, // แสดงค่าบนกราฟ
    showLegend: true, // แสดง legend
    showGrid: true, // แสดง grid
    width: 600,
    height: 350,
  },
  alignment: 'center', // 'left' | 'center' | 'right'
  margin: [0, 10, 0, 20], // [left, top, right, bottom]
};
```

### ขั้นตอนที่ 3: สร้าง PDF พร้อม Chart

```typescript
const pdfBuffer = await pdfService.generatePdf({
  title: 'รายงานการเงิน Q1/2568',
  data: financialData,
  fields: financialFields,
  charts: [chartConfig],
});
```

---

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: รายงานยาคงคลังพร้อม Bar Chart

```typescript
import { PDFMakeService } from '@/services/pdfmake.service';

async function generateInventoryReport(inventoryData: any[]) {
  const pdfService = new PDFMakeService();

  // คำนวณมูลค่ารวมตาม location
  const locationSummary = inventoryData.reduce((acc, item) => {
    acc[item.location] = (acc[item.location] || 0) + item.value;
    return acc;
  }, {});

  const pdfBuffer = await pdfService.generatePdf({
    title: 'รายงานยาคงคลัง - มกราคม 2568',
    subtitle: 'Stock Level Report - January 2025',
    data: inventoryData,
    fields: [
      { key: 'drug_name', label: 'ชื่อยา', width: '*' },
      { key: 'location', label: 'สถานที่', width: 'auto' },
      { key: 'quantity', label: 'จำนวน', type: 'number', width: 'auto' },
      { key: 'value', label: 'มูลค่า (บาท)', type: 'number', width: 'auto' },
    ],
    charts: [
      {
        type: 'bar',
        position: 'before',
        data: {
          labels: Object.keys(locationSummary),
          datasets: [
            {
              label: 'มูลค่ายาคงคลัง (บาท)',
              data: Object.values(locationSummary),
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
        alignment: 'center',
      },
    ],
  });

  return pdfBuffer;
}
```

### ตัวอย่างที่ 2: Executive Summary พร้อม Multiple Charts

```typescript
async function generateExecutiveSummary(data: { stockByLocation: any[]; usageTrend: any[]; budgetDistribution: any[] }) {
  const pdfService = new PDFMakeService();

  const pdfBuffer = await pdfService.generatePdf({
    title: 'รายงานสรุปผู้บริหาร',
    subtitle: 'Executive Summary - มกราคม 2568',
    data: [], // No table data, charts only
    fields: [],
    charts: [
      // Chart 1: Stock by Location (Bar)
      {
        type: 'bar',
        position: 'before',
        data: {
          labels: data.stockByLocation.map((d) => d.location),
          datasets: [
            {
              label: 'มูลค่ายาคงคลัง (บาท)',
              data: data.stockByLocation.map((d) => d.value),
            },
          ],
        },
        options: {
          title: 'มูลค่ายาคงคลังแยกตามคลัง',
          colorScheme: 'primary',
          displayValues: true,
        },
        width: 500,
        height: 250,
      },

      // Chart 2: Usage Trend (Line)
      {
        type: 'line',
        position: 'before',
        data: {
          labels: data.usageTrend.map((d) => d.month),
          datasets: [
            {
              label: 'การใช้ยา',
              data: data.usageTrend.map((d) => d.quantity),
            },
          ],
        },
        options: {
          title: 'แนวโน้มการใช้ยา',
          colorScheme: 'success',
          showLegend: true,
          showGrid: true,
        },
        width: 500,
        height: 250,
      },

      // Chart 3: Budget Distribution (Pie)
      {
        type: 'pie',
        position: 'after',
        data: {
          labels: data.budgetDistribution.map((d) => d.category),
          datasets: [
            {
              data: data.budgetDistribution.map((d) => d.percentage),
            },
          ],
        },
        options: {
          title: 'การใช้งบประมาณ',
          colorScheme: 'mixed',
          displayValues: true,
        },
        width: 400,
        height: 300,
        alignment: 'center',
      },
    ],
  });

  return pdfBuffer;
}
```

### ตัวอย่างที่ 3: Monthly Report Template (พร้อม Chart)

```typescript
// 1. สร้าง Custom Template พร้อม Chart Support
async function createMonthlyReportTemplate() {
  const templateService = new PdfTemplateService(knex);

  const template = await templateService.createTemplate({
    name: 'inventory-monthly-report-with-chart',
    display_name: 'รายงานยาประจำเดือน (มีกราฟ)',
    category: 'report',
    type: 'handlebars',
    page_size: 'A4',
    orientation: 'portrait',
    template_data: {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          text: 'รายงานยาประจำเดือน {{month}}',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        {
          text: 'แผนก: {{department}}',
          margin: [0, 0, 0, 20],
        },

        // สรุปตัวเลขสำคัญ
        {
          text: 'สรุปข้อมูล / Summary',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            {
              width: '25%',
              stack: [
                { text: 'มูลค่ายาคงคลัง', style: 'label' },
                { text: '{{totalValue}} บาท', style: 'value' },
              ],
            },
            {
              width: '25%',
              stack: [
                { text: 'ยาใกล้หมดอายุ', style: 'label' },
                { text: '{{nearExpiry}} รายการ', style: 'value' },
              ],
            },
            {
              width: '25%',
              stack: [
                { text: 'ยาต่ำกว่า Min', style: 'label' },
                { text: '{{belowMin}} รายการ', style: 'value' },
              ],
            },
            {
              width: '25%',
              stack: [
                { text: 'งบประมาณคงเหลือ', style: 'label' },
                { text: '{{remainingBudget}} บาท', style: 'value' },
              ],
            },
          ],
          margin: [0, 0, 0, 30],
        },

        // *** Placeholder สำหรับ Charts ***
        // Note: Charts จะต้อง generate ก่อน render template
        // แล้วส่งเป็น base64 image มาใน renderData

        {
          text: 'กราฟแสดงมูลค่ายาคงคลังแยกตามคลัง',
          style: 'chartTitle',
          margin: [0, 0, 0, 10],
        },
        {
          image: '{{stockByLocationChart}}', // Base64 data URL
          width: 500,
          height: 300,
          alignment: 'center',
          margin: [0, 0, 0, 30],
        },

        {
          text: 'กราฟแสดงแนวโน้มการใช้ยา',
          style: 'chartTitle',
          margin: [0, 0, 0, 10],
        },
        {
          image: '{{usageTrendChart}}', // Base64 data URL
          width: 500,
          height: 300,
          alignment: 'center',
          margin: [0, 0, 0, 30],
        },

        // ตารางรายละเอียด
        {
          text: 'รายละเอียดยาคงคลัง',
          style: 'sectionHeader',
          pageBreak: 'before',
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'ชื่อยา', style: 'tableHeader' },
                { text: 'จำนวน', style: 'tableHeader' },
                { text: 'หน่วย', style: 'tableHeader' },
                { text: 'มูลค่า (บาท)', style: 'tableHeader' },
              ],
              '{{#each items}}',
              ['{{drug_name}}', { text: '{{quantity}}', alignment: 'right' }, '{{unit}}', { text: '{{value}}', alignment: 'right' }],
              '{{/each}}',
            ],
          },
        },
      ],
      styles: {
        header: { fontSize: 20, bold: true, font: 'Sarabun' },
        sectionHeader: { fontSize: 14, bold: true, font: 'Sarabun', color: '#1a237e' },
        chartTitle: { fontSize: 12, bold: true, font: 'Sarabun', color: '#424242' },
        label: { fontSize: 10, font: 'Sarabun', color: '#666666' },
        value: { fontSize: 16, bold: true, font: 'Sarabun' },
        tableHeader: {
          bold: true,
          fontSize: 10,
          font: 'Sarabun',
          fillColor: '#e3f2fd',
          alignment: 'center',
        },
      },
      defaultStyle: {
        font: 'Sarabun',
        fontSize: 10,
      },
    },
    sample_data: {
      month: 'มกราคม 2568',
      department: 'ฝ่ายเภสัชกรรม',
      totalValue: '1,500,000',
      nearExpiry: '15',
      belowMin: '8',
      remainingBudget: '850,000',
      stockByLocationChart: 'data:image/png;base64,...', // จะถูกแทนด้วย chart จริง
      usageTrendChart: 'data:image/png;base64,...', // จะถูกแทนด้วย chart จริง
      items: [
        { drug_name: 'Paracetamol 500mg', quantity: '1,200', unit: 'เม็ด', value: '12,000' },
        { drug_name: 'Amoxicillin 500mg', quantity: '800', unit: 'แคปซูล', value: '24,000' },
      ],
    },
  });

  return template;
}

// 2. Generate Charts และ Render PDF
async function renderMonthlyReportWithCharts(inventoryData: any[]) {
  const chartService = new ChartService();
  const templateService = new PdfTemplateService(knex);

  // สร้าง Chart 1: Stock by Location
  const stockByLocationBuffer = await chartService.generateChart(
    'bar',
    {
      labels: ['คลังหลัก', 'คลังย่อย A', 'คลังย่อย B'],
      datasets: [
        {
          label: 'มูลค่ายาคงคลัง (บาท)',
          data: [800000, 450000, 250000],
        },
      ],
    },
    {
      title: 'มูลค่ายาคงคลังแยกตามคลัง',
      colorScheme: 'primary',
      displayValues: true,
      showLegend: true,
    },
  );

  // สร้าง Chart 2: Usage Trend
  const usageTrendBuffer = await chartService.generateChart(
    'line',
    {
      labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
      datasets: [
        {
          label: 'การใช้ยา',
          data: [1200, 1350, 1100, 1400, 1300, 1250],
        },
      ],
    },
    {
      title: 'แนวโน้มการใช้ยา',
      colorScheme: 'success',
      showLegend: true,
      showGrid: true,
    },
  );

  // แปลง buffer เป็น base64 data URL
  const stockChartDataUrl = `data:image/png;base64,${stockByLocationBuffer.toString('base64')}`;
  const usageChartDataUrl = `data:image/png;base64,${usageTrendBuffer.toString('base64')}`;

  // Render PDF
  const pdfResponse = await templateService.renderPdf({
    templateName: 'inventory-monthly-report-with-chart',
    data: {
      month: 'มกราคม 2568',
      department: 'ฝ่ายเภสัชกรรม',
      totalValue: '1,500,000',
      nearExpiry: '15',
      belowMin: '8',
      remainingBudget: '850,000',
      stockByLocationChart: stockChartDataUrl, // Base64 image
      usageTrendChart: usageChartDataUrl, // Base64 image
      items: inventoryData,
    },
  });

  return pdfResponse.buffer;
}
```

---

## Best Practices

### 1. การจัดการขนาดกราฟ

```typescript
// ✅ แนะนำ: กำหนดขนาดให้เหมาะสมกับหน้า A4
{
  width: 500,   // สำหรับ portrait (max ~515px)
  height: 300   // สัดส่วน 5:3 อ่านง่าย
}

// ✅ สำหรับ landscape
{
  width: 700,   // สำหรับ landscape (max ~750px)
  height: 350
}

// ❌ หลีกเลี่ยง: ขนาดใหญ่เกินไป
{
  width: 800,   // จะล้นหน้ากระดาษ
  height: 600
}
```

### 2. การเลือก Chart Type

```typescript
// Bar Chart - เหมาะสำหรับเปรียบเทียบค่า
{
  type: 'bar',
  data: { labels: categories, datasets: [{ data: values }] }
}

// Line Chart - เหมาะสำหรับแสดงแนวโน้ม
{
  type: 'line',
  data: { labels: months, datasets: [{ data: trends }] }
}

// Pie Chart - เหมาะสำหรับแสดงสัดส่วน (ไม่เกิน 7 ส่วน)
{
  type: 'pie',
  data: { labels: categories, datasets: [{ data: percentages }] }
}

// Doughnut Chart - เหมาะสำหรับแสดงสัดส่วนพร้อมพื้นที่กลาง
{
  type: 'doughnut',
  data: { labels: categories, datasets: [{ data: percentages }] }
}
```

### 3. Color Schemes

```typescript
// ใช้ color scheme ที่เหมาะสมกับข้อมูล
{
  colorScheme: 'primary',   // สีน้ำเงิน - สำหรับข้อมูลทั่วไป
  colorScheme: 'success',   // สีเขียว - สำหรับผลลัพธ์ที่ดี
  colorScheme: 'warning',   // สีเหลือง/ส้ม - สำหรับข้อมูลที่ต้องระวัง
  colorScheme: 'danger',    // สีแดง - สำหรับปัญหาหรือข้อมูลเชิงลบ
  colorScheme: 'mixed',     // หลายสี - สำหรับข้อมูลหลากหลาย
}

// หรือกำหนดสีเอง
{
  colorScheme: ['#3b82f6', '#10b981', '#f59e0b']
}
```

### 4. Chart Positioning

```typescript
// ตำแหน่งกราฟใน PDF
{
  position: 'before',  // ✅ แนะนำ: วางก่อนตาราง (ภาพรวมก่อน)
  position: 'after',   // ✅ วางหลังตาราง (สรุปท้าย)
  position: 'top',     // วางก่อน title
  position: 'bottom'   // วางท้ายเอกสาร
}
```

### 5. Performance

```typescript
// ✅ แนะนำ: จำกัดจำนวน charts ต่อ PDF
const MAX_CHARTS = 5;

// ✅ แนะนำ: จำกัดจำนวน data points
const MAX_DATA_POINTS = 50;

// ✅ Cache charts ที่ใช้บ่อย
const chartCache = new Map<string, Buffer>();

async function getCachedChart(key: string, generator: () => Promise<Buffer>) {
  if (chartCache.has(key)) {
    return chartCache.get(key)!;
  }
  const buffer = await generator();
  chartCache.set(key, buffer);
  return buffer;
}
```

### 6. Error Handling

```typescript
try {
  const pdfBuffer = await pdfService.generatePdf({
    // ... config
    charts: chartConfigs,
  });
  return pdfBuffer;
} catch (error) {
  console.error('PDF generation failed:', error);

  // Fallback: สร้าง PDF โดยไม่มี charts
  const fallbackBuffer = await pdfService.generatePdf({
    // ... config without charts
  });
  return fallbackBuffer;
}
```

---

## การแก้ไขปัญหา

### ปัญหา 1: ข้อความภาษาไทยใน Chart แสดงเป็นกล่อง

**สาเหตุ**: Font ไม่ถูกต้อง

**แก้ไข**: ChartService ใช้ Sarabun font โดยอัตโนมัติ แต่ต้องแน่ใจว่า font files มีอยู่

```bash
# ตรวจสอบ font files
ls apps/api/src/assets/fonts/Sarabun/

# ควรมี:
# - Sarabun-Regular.ttf
# - Sarabun-Bold.ttf
# - Sarabun-Italic.ttf
# - Sarabun-BoldItalic.ttf
```

### ปัญหา 2: Chart ไม่แสดงใน PDF

**สาเหตุ**: Base64 data URL ไม่ถูกต้อง

**แก้ไข**:

```typescript
// ✅ ถูกต้อง
const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

// ❌ ผิด
const dataUrl = buffer.toString('base64'); // ขาด prefix
```

### ปัญหา 3: PDF ใหญ่เกินไป

**สาเหตุ**: Charts มีขนาดใหญ่ หรือมี charts เยอะเกินไป

**แก้ไข**:

```typescript
// ลดขนาด chart
{
  width: 400,  // ลดจาก 600
  height: 250  // ลดจาก 400
}

// หรือจำกัดจำนวน charts
const charts = allCharts.slice(0, 3); // ใช้แค่ 3 อันแรก
```

### ปัญหา 4: Chart ล้นหน้ากระดาษ

**สาเหตุ**: ขนาด chart ใหญ่เกินกว่าพื้นที่

**แก้ไข**:

```typescript
// สำหรับ A4 Portrait
const MAX_WIDTH = 515;  // 595 - (40 margin * 2)
const MAX_HEIGHT = 720; // 842 - (60 margin * 2)

// ปรับขนาด chart
{
  width: Math.min(requestedWidth, MAX_WIDTH),
  height: Math.min(requestedHeight, MAX_HEIGHT)
}
```

### ปัญหา 5: Charts ไม่แสดงค่าบนกราฟ

**สาเหตุ**: ไม่ได้เปิด `displayValues`

**แก้ไข**:

```typescript
{
  options: {
    displayValues: true,  // ⭐ เปิดการแสดงค่า
    // ...
  }
}
```

---

## สรุป

### ข้อดีของการใช้ Charts ใน PDF Templates

- ✅ เพิ่มความเข้าใจในข้อมูลด้วยภาพ
- ✅ สื่อสารข้อมูลได้รวดเร็วกว่าตาราง
- ✅ ดูเป็นมืออาชีพและน่าเชื่อถือ
- ✅ รองรับภาษาไทยเต็มรูปแบบ
- ✅ Customize ได้ตามความต้องการ

### เมื่อไหร่ควรใช้ Charts

- ✅ รายงานผู้บริหาร (Executive Summary)
- ✅ รายงานประจำเดือน/ประจำปี
- ✅ รายงานการขาย/สต็อก
- ✅ Dashboard PDF
- ✅ Presentation Materials

### เมื่อไหร่ไม่ควรใช้ Charts

- ❌ ข้อมูลละเอียดที่ต้องการความแม่นยำสูง
- ❌ ตารางข้อมูลที่มีหลายคอลัมน์
- ❌ เอกสารที่ต้องการพื้นที่สำหรับข้อความเยอะ
- ❌ PDF ที่ต้องการขนาดไฟล์เล็ก

---

## อ้างอิง

- [Chart Generation API Reference](../../reference/api/chart-generation-api.md)
- [PDF Export API Reference](../../reference/api/pdf-export-api.md)
- [PDF Charts User Guide](./pdf-charts-guide.md)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [PDFMake Documentation](http://pdfmake.org/)

---

**เอกสารนี้อัพเดทล่าสุด**: 2025-12-19
**เวอร์ชัน**: 1.0.0
