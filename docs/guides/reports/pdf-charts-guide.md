---
title: 'PDF Charts User Guide'
description: 'Complete guide for adding visual analytics to PDF reports using charts'
category: guides
tags: [reports, pdf, charts, visualization, inventory]
---

# PDF Charts User Guide

## Introduction

Learn how to add visual analytics to PDF reports using charts. This guide covers chart types, when to use them, and practical examples for inventory management.

Charts transform raw data into visual insights, making reports more engaging and easier to understand. The PDF Charts feature allows you to embed bar charts, line charts, pie charts, and doughnut charts directly into your PDF exports.

## Quick Start

### Basic Example

```typescript
import { PDFMakeService } from '@api/services/pdfmake.service';

const pdfService = new PDFMakeService();

const pdf = await pdfService.generatePdf({
  title: 'Stock Report',
  data: inventoryData,
  fields: stockFields,
  charts: [
    {
      type: 'bar',
      position: 'before',
      data: {
        labels: ['คลังกลาง', 'ตึกผู้ป่วยใน A', 'ตึกผู้ป่วยใน B'],
        datasets: [
          {
            label: 'มูลค่าคงคลัง (บาท)',
            data: [80000, 50000, 30000],
          },
        ],
      },
      options: {
        title: 'มูลค่าคงคลังแยกตามหน่วยงาน',
        colorScheme: 'primary',
        displayValues: true,
      },
    },
  ],
});
```

## Chart Types

### 1. Bar Chart

**Best for**: Comparing values across categories

**When to use**:

- Stock levels by location
- Budget allocation by category
- Quantity comparison across different items
- Monthly/quarterly comparisons

**Characteristics**:

- Vertical bars for easy comparison
- Supports multiple datasets
- Clear value display
- Ideal for 3-20 categories

**Example**: Stock Value by Location

```typescript
const stockByLocationChart = {
  type: 'bar',
  position: 'before',
  data: {
    labels: ['คลังกลาง', 'ตึกผู้ป่วยใน A', 'ตึกผู้ป่วยใน B', 'ห้องฉุกเฉิน', 'ห้องผ่าตัด'],
    datasets: [
      {
        label: 'มูลค่าคงคลัง (บาท)',
        data: [85000, 52000, 48000, 35000, 28000],
      },
    ],
  },
  options: {
    title: 'มูลค่าคงคลังแยกตามหน่วยงาน',
    subtitle: 'ข้อมูล ณ วันที่ 19 ธันวาคม 2567',
    colorScheme: 'primary',
    displayValues: true,
    showLegend: true,
    showGrid: true,
  },
  width: 600,
  height: 350,
};
```

### 2. Line Chart

**Best for**: Trends over time

**When to use**:

- Drug usage trends (monthly/quarterly)
- Stock level changes over time
- Budget spending trends
- Seasonal patterns

**Characteristics**:

- Shows continuous data over time
- Multiple series comparison
- Smooth curves with tension
- Perfect for 6-12 time periods

**Example**: 6-Month Drug Usage Trend

```typescript
const drugUsageTrendChart = {
  type: 'line',
  position: 'before',
  data: {
    labels: ['ม.ค. 67', 'ก.พ. 67', 'มี.ค. 67', 'เม.ย. 67', 'พ.ค. 67', 'มิ.ย. 67'],
    datasets: [
      {
        label: 'Paracetamol 500mg',
        data: [1200, 1350, 1100, 1400, 1300, 1250],
      },
      {
        label: 'Amoxicillin 500mg',
        data: [800, 850, 900, 950, 920, 880],
      },
      {
        label: 'Ibuprofen 400mg',
        data: [600, 650, 580, 700, 680, 720],
      },
    ],
  },
  options: {
    title: 'แนวโน้มการใช้ยา 6 เดือน',
    subtitle: 'มกราคม - มิถุนายน 2567',
    colorScheme: ['#3b82f6', '#10b981', '#f59e0b'],
    showLegend: true,
    showGrid: true,
    displayValues: false, // Too crowded for line charts
  },
  width: 700,
  height: 350,
};
```

### 3. Pie Chart

**Best for**: Percentage distribution, parts of a whole

**When to use**:

- Budget distribution by category
- Drug category distribution
- Stock distribution by type
- Department allocation

**Characteristics**:

- Shows proportions clearly
- Displays percentages automatically
- Best for 3-7 categories
- Legend on the right side

**Example**: Budget Allocation Q1

```typescript
const budgetDistributionChart = {
  type: 'pie',
  position: 'after',
  data: {
    labels: ['จัดซื้อยาและเวชภัณฑ์', 'จ่ายยาผู้ป่วย', 'รับคืนยา', 'ปรับปรุงสต็อก'],
    datasets: [
      {
        data: [2500000, 1800000, 450000, 250000],
      },
    ],
  },
  options: {
    title: 'การใช้งบประมาณไตรมาส 1/2567',
    subtitle: 'รวมทั้งสิ้น 5,000,000 บาท',
    colorScheme: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    displayValues: true, // Shows percentages
    showLegend: true,
  },
  width: 500,
  height: 400,
};
```

### 4. Doughnut Chart

**Best for**: Similar to pie, with emphasis on total

**When to use**:

- Similar to pie chart scenarios
- When you want to show total in center
- Distribution with visual balance

**Characteristics**:

- Hollow center for total/summary
- More modern appearance
- Same use cases as pie chart
- Better for multiple small slices

**Example**: Drug Type Distribution

```typescript
const drugTypeDistributionChart = {
  type: 'doughnut',
  position: 'before',
  data: {
    labels: ['ยาแก้ปวด/ลดไข้', 'ยาปฏิชีวนะ', 'ยาแก้แพ้', 'ยาระบบทางเดินอาหาร', 'ยาโรคเรื้อรัง', 'อื่นๆ'],
    datasets: [
      {
        data: [1250, 980, 650, 520, 1100, 380],
      },
    ],
  },
  options: {
    title: 'การกระจายตัวของประเภทยา',
    subtitle: 'จำนวนรายการยาทั้งหมด 4,880 รายการ',
    colorScheme: 'mixed',
    displayValues: true,
    showLegend: true,
  },
  width: 500,
  height: 400,
};
```

## Chart Positioning

### Before Table

```typescript
position: 'before'; // Chart → Table
```

**Best for**: Overview before details

- Provides visual summary first
- Sets context for detailed data
- Good for executive summaries

### After Table

```typescript
position: 'after'; // Table → Chart
```

**Best for**: Visual summary after details

- Data first, visualization second
- Reinforces detailed information
- Good for analytical reports

### Top Position

```typescript
position: 'top'; // Chart → Title → Table
```

**Best for**: Key metric highlight

- Most prominent position
- Immediate visual impact
- Dashboard-style reports

### Bottom Position

```typescript
position: 'bottom'; // Title → Table → Chart
```

**Best for**: Conclusion visualization

- Summarizes all data
- Final takeaway message
- Analysis reports

## Color Schemes

### Choosing the Right Scheme

| Scheme    | Use Case                  | Example                        | Colors          |
| --------- | ------------------------- | ------------------------------ | --------------- |
| `primary` | Corporate, neutral data   | Stock levels, general reports  | Blue shades     |
| `success` | Positive metrics, growth  | Budget surplus, achievements   | Green shades    |
| `warning` | Attention needed          | Low stock alerts, warnings     | Amber/Orange    |
| `danger`  | Critical issues           | Expired drugs, critical alerts | Red shades      |
| `info`    | Informational             | General statistics             | Cyan/Teal       |
| `purple`  | Creative, special reports | Custom analysis                | Purple shades   |
| `mixed`   | Diverse categories        | Multi-category data            | Rainbow palette |

### Color Scheme Examples

```typescript
// Single color scheme (auto-shaded)
colorScheme: 'primary'; // Blue-500 to Blue-900
colorScheme: 'success'; // Green-500 to Green-900
colorScheme: 'warning'; // Amber-500 to Amber-900

// Custom colors array
colorScheme: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// Mixed palette for variety
colorScheme: 'mixed'; // Blue, Green, Amber, Red, Purple, Cyan, Pink
```

## Inventory-Specific Examples

### Example 1: Monthly Stock Report

Complete working example for monthly inventory stock levels with Thai labels.

```typescript
import { PDFMakeService } from '@api/services/pdfmake.service';

async function generateMonthlyStockReport(inventoryData: any[]) {
  const pdfService = new PDFMakeService();

  // Aggregate data by location
  const stockByLocation = inventoryData.reduce((acc, item) => {
    const location = item.location_name || 'ไม่ระบุ';
    if (!acc[location]) {
      acc[location] = 0;
    }
    acc[location] += item.quantity * item.unit_price;
    return acc;
  }, {});

  const pdf = await pdfService.generatePdf({
    title: 'รายงานมูลค่าคงคลังประจำเดือน',
    subtitle: 'เดือนธันวาคม 2567',
    data: inventoryData,
    fields: [
      { key: 'drug_name', label: 'ชื่อยา', width: '*' },
      { key: 'location_name', label: 'สถานที่จัดเก็บ', width: 'auto' },
      { key: 'quantity', label: 'จำนวน', type: 'number', width: 70 },
      { key: 'unit_price', label: 'ราคา/หน่วย', type: 'number', width: 80 },
      {
        key: 'total_value',
        label: 'มูลค่ารวม',
        type: 'number',
        width: 100,
        format: (value) => `${value.toLocaleString()} บาท`,
      },
    ],
    charts: [
      {
        type: 'bar',
        position: 'before',
        data: {
          labels: Object.keys(stockByLocation),
          datasets: [
            {
              label: 'มูลค่าคงคลัง (บาท)',
              data: Object.values(stockByLocation),
            },
          ],
        },
        options: {
          title: 'มูลค่าคงคลังแยกตามหน่วยงาน',
          subtitle: 'ข้อมูล ณ วันที่ 19 ธันวาคม 2567',
          colorScheme: 'primary',
          displayValues: true,
          showLegend: false,
          showGrid: true,
        },
        width: 600,
        height: 350,
      },
    ],
    metadata: {
      exportedBy: 'ระบบบริหารคลังยา',
      exportedAt: new Date(),
      totalRecords: inventoryData.length,
    },
    pageSize: 'A4',
    orientation: 'landscape',
    template: 'professional',
  });

  return pdf;
}
```

### Example 2: Drug Expiry Alert Report

Critical alert report showing drugs approaching expiration.

```typescript
async function generateExpiryAlertReport(expiringDrugs: any[]) {
  const pdfService = new PDFMakeService();

  // Group by urgency
  const urgencyGroups = {
    'หมดอายุภายใน 30 วัน': expiringDrugs.filter((d) => d.daysUntilExpiry <= 30).length,
    'หมดอายุภายใน 60 วัน': expiringDrugs.filter((d) => d.daysUntilExpiry > 30 && d.daysUntilExpiry <= 60).length,
    'หมดอายุภายใน 90 วัน': expiringDrugs.filter((d) => d.daysUntilExpiry > 60 && d.daysUntilExpiry <= 90).length,
  };

  const pdf = await pdfService.generatePdf({
    title: 'รายงานยาใกล้หมดอายุ',
    subtitle: 'รายการยาที่ต้องดำเนินการ',
    data: expiringDrugs,
    fields: [
      { key: 'drug_name', label: 'ชื่อยา', width: '*' },
      { key: 'lot_number', label: 'Lot Number', width: 100 },
      { key: 'expiry_date', label: 'วันหมดอายุ', type: 'date', width: 100 },
      { key: 'daysUntilExpiry', label: 'เหลือ (วัน)', type: 'number', width: 80 },
      { key: 'quantity', label: 'จำนวน', type: 'number', width: 70 },
      {
        key: 'total_value',
        label: 'มูลค่า',
        type: 'number',
        width: 100,
        format: (value) => `${value.toLocaleString()} บาท`,
      },
    ],
    charts: [
      {
        type: 'bar',
        position: 'before',
        data: {
          labels: Object.keys(urgencyGroups),
          datasets: [
            {
              label: 'จำนวนรายการ',
              data: Object.values(urgencyGroups),
            },
          ],
        },
        options: {
          title: 'รายการยาแยกตามความเร่งด่วน',
          colorScheme: 'danger',
          displayValues: true,
          showGrid: true,
        },
        width: 600,
        height: 300,
      },
      {
        type: 'pie',
        position: 'after',
        data: {
          labels: Object.keys(urgencyGroups),
          datasets: [
            {
              data: Object.values(urgencyGroups),
            },
          ],
        },
        options: {
          title: 'สัดส่วนความเร่งด่วน',
          colorScheme: ['#ef4444', '#f59e0b', '#3b82f6'],
          displayValues: true,
        },
        width: 400,
        height: 400,
      },
    ],
    metadata: {
      exportedBy: 'ระบบติดตามยาหมดอายุ',
      exportedAt: new Date(),
      totalRecords: expiringDrugs.length,
    },
    template: 'professional',
  });

  return pdf;
}
```

### Example 3: Budget Performance Dashboard

Multi-chart dashboard showing budget allocation and usage.

```typescript
async function generateBudgetDashboard(budgetData: any) {
  const pdfService = new PDFMakeService();

  const { monthlySpending, categoryAllocation, departmentUsage, transactions } = budgetData;

  const pdf = await pdfService.generatePdf({
    title: 'Dashboard งบประมาณไตรมาส 1/2567',
    subtitle: 'ภาพรวมการใช้จ่ายและการจัดสรร',
    data: transactions,
    fields: [
      { key: 'date', label: 'วันที่', type: 'date', width: 100 },
      { key: 'category', label: 'หมวดหมู่', width: 'auto' },
      { key: 'department', label: 'หน่วยงาน', width: 'auto' },
      {
        key: 'amount',
        label: 'จำนวนเงิน',
        type: 'number',
        width: 100,
        format: (value) => `${value.toLocaleString()} บาท`,
      },
    ],
    charts: [
      // Chart 1: Monthly Spending Trend
      {
        type: 'line',
        position: 'before',
        data: {
          labels: ['ม.ค.', 'ก.พ.', 'มี.ค.'],
          datasets: [
            {
              label: 'งบประมาณที่จัดสรร',
              data: monthlySpending.allocated,
            },
            {
              label: 'งบประมาณที่ใช้จริง',
              data: monthlySpending.actual,
            },
          ],
        },
        options: {
          title: 'แนวโน้มการใช้จ่ายรายเดือน',
          colorScheme: ['#3b82f6', '#10b981'],
          showLegend: true,
          showGrid: true,
        },
        width: 700,
        height: 300,
      },

      // Chart 2: Category Allocation
      {
        type: 'doughnut',
        position: 'before',
        data: {
          labels: Object.keys(categoryAllocation),
          datasets: [
            {
              data: Object.values(categoryAllocation),
            },
          ],
        },
        options: {
          title: 'การจัดสรรงบประมาณตามหมวดหมู่',
          colorScheme: 'mixed',
          displayValues: true,
        },
        width: 400,
        height: 350,
      },

      // Chart 3: Department Usage
      {
        type: 'bar',
        position: 'before',
        data: {
          labels: Object.keys(departmentUsage),
          datasets: [
            {
              label: 'การใช้จ่าย (บาท)',
              data: Object.values(departmentUsage),
            },
          ],
        },
        options: {
          title: 'การใช้จ่ายแยกตามหน่วยงาน',
          colorScheme: 'success',
          displayValues: true,
          showGrid: true,
        },
        width: 600,
        height: 300,
      },
    ],
    metadata: {
      exportedBy: 'ระบบบริหารงบประมาณ',
      exportedAt: new Date(),
      totalRecords: transactions.length,
    },
    pageSize: 'A4',
    orientation: 'landscape',
    template: 'professional',
  });

  return pdf;
}
```

### Example 4: Executive Summary

High-level overview with multiple visualizations for management.

```typescript
async function generateExecutiveSummary(summaryData: any) {
  const pdfService = new PDFMakeService();

  const { stockLevels, usageTrends, budgetStatus, alerts, topDrugs } = summaryData;

  const pdf = await pdfService.generatePdf({
    title: 'Executive Summary - ระบบบริหารคลังยา',
    subtitle: 'รายงานประจำเดือนธันวาคม 2567',
    data: topDrugs,
    fields: [
      { key: 'rank', label: 'อันดับ', width: 50 },
      { key: 'drug_name', label: 'ชื่อยา', width: '*' },
      { key: 'usage_count', label: 'ความถี่การใช้', type: 'number', width: 100 },
      {
        key: 'total_value',
        label: 'มูลค่าการใช้',
        type: 'number',
        width: 120,
        format: (value) => `${value.toLocaleString()} บาท`,
      },
    ],
    charts: [
      // Chart 1: Stock Levels Overview
      {
        type: 'bar',
        position: 'before',
        data: {
          labels: ['คลังกลาง', 'ตึกผู้ป่วยใน', 'ห้องฉุกเฉิน', 'ห้องผ่าตัด', 'OPD'],
          datasets: [
            {
              label: 'มูลค่าคงคลัง (บาท)',
              data: stockLevels,
            },
          ],
        },
        options: {
          title: 'ภาพรวมมูลค่าคงคลัง',
          colorScheme: 'primary',
          displayValues: true,
          showGrid: true,
        },
        width: 650,
        height: 300,
      },

      // Chart 2: 6-Month Usage Trend
      {
        type: 'line',
        position: 'before',
        data: {
          labels: ['ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
          datasets: [
            {
              label: 'จำนวนการจ่ายยา',
              data: usageTrends.dispensing,
            },
            {
              label: 'จำนวนการรับเข้า',
              data: usageTrends.receiving,
            },
          ],
        },
        options: {
          title: 'แนวโน้มการเคลื่อนไหวคลัง 6 เดือน',
          colorScheme: ['#10b981', '#3b82f6'],
          showLegend: true,
          showGrid: true,
        },
        width: 700,
        height: 300,
      },

      // Chart 3: Budget vs Actual
      {
        type: 'bar',
        position: 'before',
        data: {
          labels: ['ไตรมาส 1', 'ไตรมาส 2', 'ไตรมาส 3', 'ไตรมาส 4'],
          datasets: [
            {
              label: 'งบประมาณ',
              data: budgetStatus.allocated,
            },
            {
              label: 'ใช้จริง',
              data: budgetStatus.actual,
            },
          ],
        },
        options: {
          title: 'การใช้งบประมาณเทียบกับที่จัดสรร',
          colorScheme: ['#3b82f6', '#10b981'],
          showLegend: true,
          displayValues: true,
          showGrid: true,
        },
        width: 650,
        height: 300,
      },

      // Chart 4: Alert Distribution
      {
        type: 'doughnut',
        position: 'before',
        data: {
          labels: ['ยาใกล้หมดอายุ', 'สต็อกต่ำ', 'รอจัดซื้อ', 'อื่นๆ'],
          datasets: [
            {
              data: [alerts.expiring, alerts.lowStock, alerts.pending, alerts.others],
            },
          ],
        },
        options: {
          title: 'สถานะแจ้งเตือน',
          colorScheme: ['#ef4444', '#f59e0b', '#3b82f6', '#6b7280'],
          displayValues: true,
        },
        width: 400,
        height: 350,
      },
    ],
    metadata: {
      exportedBy: 'ระบบบริหารคลังยา - Executive Dashboard',
      exportedAt: new Date(),
      totalRecords: topDrugs.length,
    },
    pageSize: 'A4',
    orientation: 'landscape',
    template: 'professional',
    showSummary: true,
  });

  return pdf;
}
```

## Best Practices

### 1. Data Preparation

**Clean data before charting**

```typescript
// Remove null/undefined values
const cleanData = rawData.filter((item) => item.value !== null && item.value !== undefined && !isNaN(item.value));

// Handle Thai text encoding
const thaiLabels = labels.map((label) => label.toString().normalize('NFC'));
```

**Aggregate when necessary**

```typescript
// Group by location and sum values
const aggregated = data.reduce((acc, item) => {
  const key = item.location;
  acc[key] = (acc[key] || 0) + item.value;
  return acc;
}, {});
```

**Limit data points (max 100)**

```typescript
// Too many points reduce readability
if (dataPoints.length > 100) {
  // Aggregate by week/month instead of day
  dataPoints = aggregateByWeek(dataPoints);
}

// Or take top N
const topN = dataPoints.sort((a, b) => b.value - a.value).slice(0, 20);
```

### 2. Chart Selection

**Use bar charts for comparisons**

- Comparing values across categories
- Comparing multiple series
- Showing rankings
- Time period comparisons (discrete)

**Use line charts for trends**

- Continuous time series
- Multiple trend comparison
- Showing patterns over time
- Forecasting visualization

**Use pie/doughnut for distributions**

- Percentage of total
- Part-to-whole relationships
- Maximum 7 categories
- Single dataset only

**Don't overuse pie charts**

- Hard to compare similar values
- Poor for many categories
- Consider bar chart instead for comparisons

### 3. Visual Design

**Choose appropriate colors**

```typescript
// Match color to meaning
colorScheme: 'success'; // For positive metrics
colorScheme: 'danger'; // For critical alerts
colorScheme: 'primary'; // For neutral data
colorScheme: 'mixed'; // For diverse categories
```

**Enable value display when helpful**

```typescript
displayValues: true; // For bar/pie charts with few data points
displayValues: false; // For line charts or many data points (cluttered)
```

**Keep titles clear and concise**

```typescript
title: 'มูลค่าคงคลังแยกตามหน่วยงาน'; // Clear, specific
subtitle: 'ข้อมูล ณ วันที่ 19 ธันวาคม 2567'; // Add context
```

**Use Thai language consistently**

```typescript
// All labels, titles, legends in Thai
labels: ['คลังกลาง', 'ตึกผู้ป่วยใน A', 'ตึกผู้ป่วยใน B'];
datasets: [
  {
    label: 'มูลค่าคงคลัง (บาท)', // Units in Thai
    data: values,
  },
];
```

### 4. Performance

**Limit charts per PDF (recommended: 3-5)**

```typescript
// Too many charts slow down generation
charts: [
  chart1, // Key metric
  chart2, // Trend
  chart3, // Distribution
];
// Avoid: 10+ charts in one PDF
```

**Optimize data point count**

```typescript
// Keep under 100 points per chart
const optimized = data.length > 100 ? aggregateData(data) : data;
```

**Consider page orientation**

```typescript
orientation: 'landscape'; // Better for wide charts
orientation: 'portrait'; // For tall/stacked charts
```

### 5. Accessibility

**High contrast colors**

```typescript
// Avoid similar colors
colorScheme: ['#3b82f6', '#10b981', '#f59e0b']; // Good: Blue, Green, Amber
// Not: ['#3b82f6', '#2563eb', '#1d4ed8']        // Bad: All blues
```

**Clear labels**

```typescript
options: {
  title: 'ชื่อชัดเจน',
  showLegend: true,  // Enable for multi-series
  displayValues: true  // Show values for clarity
}
```

**Readable font sizes**

- Chart titles: 18px
- Subtitles: 14px
- Labels: 12px
- Values: 12-14px (automatically set)

**Print-friendly designs**

```typescript
// Use colors that print well
colorScheme: 'primary'; // Blues print well
// Avoid: Very light colors or pure yellow
```

## Common Patterns

### Pattern 1: Overview + Details

Show visual overview first, then detailed table.

```typescript
const report = await pdfService.generatePdf({
  title: 'รายงานสต็อกคลัง',
  charts: [
    {
      type: 'bar',
      position: 'before', // Chart first
      data: summaryData,
      options: { title: 'ภาพรวมสต็อก' },
    },
  ],
  data: detailedTable, // Detailed data follows
  fields: tableFields,
});
```

### Pattern 2: Compare + Trend

Current comparison followed by historical trend.

```typescript
charts: [
  {
    type: 'bar',
    position: 'before',
    data: currentComparison,
    options: { title: 'สถานะปัจจุบัน' },
  },
  {
    type: 'line',
    position: 'before',
    data: historicalTrend,
    options: { title: 'แนวโน้ม 6 เดือน' },
  },
];
```

### Pattern 3: Executive Summary

Multiple charts for comprehensive overview.

```typescript
charts: [
  {
    type: 'bar',
    position: 'before',
    data: keyMetric1,
    options: { title: 'ตัวชี้วัดหลัก' },
  },
  {
    type: 'line',
    position: 'before',
    data: trendData,
    options: { title: 'แนวโน้ม' },
  },
  {
    type: 'pie',
    position: 'after',
    data: distribution,
    options: { title: 'การกระจาย' },
  },
];
```

### Pattern 4: Alert Report

Critical information with supporting charts.

```typescript
const alertReport = await pdfService.generatePdf({
  title: 'รายงานแจ้งเตือน - ยาใกล้หมดอายุ',
  charts: [
    {
      type: 'bar',
      position: 'before',
      data: urgencyBreakdown,
      options: {
        title: 'แยกตามความเร่งด่วน',
        colorScheme: 'danger',
      },
    },
  ],
  data: criticalItems,
  fields: alertFields,
  template: 'professional',
});
```

## Troubleshooting

### Chart not appearing

**Symptom**: PDF generates but chart is missing

**Possible causes**:

1. Invalid chart configuration
2. Empty dataset
3. Incorrect data structure

**Solutions**:

```typescript
// Validate data before generation
if (!chartData.labels || chartData.labels.length === 0) {
  throw new Error('Chart labels cannot be empty');
}

if (!chartData.datasets || chartData.datasets[0].data.length === 0) {
  throw new Error('Chart dataset cannot be empty');
}

// Check data structure
console.log('Chart data:', JSON.stringify(chartData, null, 2));
```

### Thai text not rendering

**Symptom**: Thai characters show as boxes or question marks

**Cause**: Sarabun font not initialized

**Solution**:

```typescript
// Fonts are auto-initialized by PDFMakeService
// Ensure fonts exist in: apps/api/src/assets/fonts/Sarabun/

// Check font status
const pdfService = new PDFMakeService();
await pdfService.waitForFonts();
const status = pdfService.getFontStatus();
console.log('Font status:', status);
```

### PDF too large

**Symptom**: PDF file size exceeds 10MB

**Causes**:

1. Too many charts
2. High chart dimensions
3. Too many data points

**Solutions**:

```typescript
// 1. Reduce number of charts
charts: charts.slice(0, 5)  // Max 5 charts

// 2. Decrease dimensions
width: 500,   // Instead of 800
height: 300   // Instead of 500

// 3. Limit data points
data: data.slice(0, 50)  // Top 50 only
```

### Performance issues

**Symptom**: PDF generation takes more than 5 seconds

**Causes**:

1. Too many charts (> 5)
2. Large datasets (> 100 points per chart)
3. High resolution charts

**Solutions**:

```typescript
// 1. Generate charts in parallel (already done internally)

// 2. Aggregate data
const aggregated = aggregateByWeek(dailyData);

// 3. Use appropriate dimensions
width: 600,   // Default: 500
height: 350   // Default: 300
// Avoid: width > 1000, height > 600

// 4. Monitor generation time
const start = Date.now();
const pdf = await pdfService.generatePdf(options);
console.log(`Generation time: ${Date.now() - start}ms`);
```

### Chart dimensions incorrect

**Symptom**: Chart appears stretched or compressed

**Cause**: Aspect ratio mismatch with page size

**Solution**:

```typescript
// For landscape A4 (842 x 595 points)
orientation: 'landscape',
charts: [{
  width: 700,   // Fits well in landscape
  height: 350
}]

// For portrait A4 (595 x 842 points)
orientation: 'portrait',
charts: [{
  width: 500,   // Fits well in portrait
  height: 350
}]
```

## Advanced Usage

### Custom Colors

Define your own color palette for brand consistency.

```typescript
// Custom color array
charts: [
  {
    type: 'bar',
    data: chartData,
    options: {
      colorScheme: [
        '#1e40af', // Hospital primary blue
        '#059669', // Hospital secondary green
        '#d97706', // Hospital accent amber
        '#dc2626', // Hospital alert red
      ],
    },
  },
];
```

### Multiple Datasets

Compare multiple series in one chart.

```typescript
charts: [
  {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'ปี 2566',
          data: year2023Data,
        },
        {
          label: 'ปี 2567',
          data: year2024Data,
        },
        {
          label: 'เป้าหมาย',
          data: targetData,
        },
      ],
    },
    options: {
      title: 'เปรียบเทียบการใช้ยา 3 ปี',
      colorScheme: ['#3b82f6', '#10b981', '#f59e0b'],
      showLegend: true,
    },
  },
];
```

### Chart Customization

Fine-tune chart appearance with advanced options.

```typescript
charts: [
  {
    type: 'bar',
    data: chartData,
    options: {
      title: 'Custom Chart',
      subtitle: 'With advanced styling',
      showLegend: true,
      showGrid: false, // Hide grid lines
      displayValues: true, // Show values on bars
      width: 600,
      height: 400,
    },
    // PDF placement customization
    width: 600,
    height: 400,
    alignment: 'center', // 'left' | 'center' | 'right'
    margin: [0, 20, 0, 30], // [top, right, bottom, left]
  },
];
```

### Conditional Charts

Add charts based on data conditions.

```typescript
const charts: PdfChartConfig[] = [];

// Always include overview
charts.push({
  type: 'bar',
  position: 'before',
  data: overviewData,
  options: { title: 'ภาพรวม' },
});

// Add trend chart if historical data available
if (historicalData.length >= 6) {
  charts.push({
    type: 'line',
    position: 'before',
    data: historicalData,
    options: { title: 'แนวโน้ม' },
  });
}

// Add distribution if multiple categories
if (categories.length > 1) {
  charts.push({
    type: 'pie',
    position: 'after',
    data: distributionData,
    options: { title: 'การกระจาย' },
  });
}

const pdf = await pdfService.generatePdf({
  title: 'Dynamic Report',
  charts: charts,
  data: tableData,
  fields: tableFields,
});
```

### Data Transformation

Transform database results into chart data.

```typescript
// From database query results
const queryResults = [
  { location: 'คลังกลาง', total: 80000 },
  { location: 'ตึกผู้ป่วยใน A', total: 50000 },
  { location: 'ตึกผู้ป่วยใน B', total: 30000 },
];

// Transform to chart data
const chartData = {
  labels: queryResults.map((r) => r.location),
  datasets: [
    {
      label: 'มูลค่าคงคลัง (บาท)',
      data: queryResults.map((r) => r.total),
    },
  ],
};

// Use in chart
charts: [
  {
    type: 'bar',
    position: 'before',
    data: chartData,
    options: {
      title: 'มูลค่าคงคลังแยกตามหน่วยงาน',
      colorScheme: 'primary',
    },
  },
];
```

## API Reference

For detailed API documentation, see:

- **[Chart Generation API](../../reference/api/chart-generation-api.md)** - Chart service API reference
- **[PDF Export API](../../reference/api/pdf-export-api.md)** - PDF generation API reference

## Quick Reference

### Chart Types Summary

| Type       | Best For     | Max Data Points | Legend Position |
| ---------- | ------------ | --------------- | --------------- |
| `bar`      | Comparisons  | 20              | Top             |
| `line`     | Trends       | 50              | Top             |
| `pie`      | Distribution | 7               | Right           |
| `doughnut` | Distribution | 7               | Right           |

### Color Schemes

| Scheme    | Colors  | Use Case         |
| --------- | ------- | ---------------- |
| `primary` | Blues   | General/neutral  |
| `success` | Greens  | Positive metrics |
| `warning` | Ambers  | Warnings         |
| `danger`  | Reds    | Alerts           |
| `info`    | Cyans   | Information      |
| `purple`  | Purples | Special          |
| `mixed`   | Rainbow | Diversity        |

### Position Options

| Position | Order                 | Best For       |
| -------- | --------------------- | -------------- |
| `top`    | Chart → Title → Table | Key highlights |
| `before` | Title → Chart → Table | Overview first |
| `after`  | Title → Table → Chart | Summary        |
| `bottom` | Title → Table → Chart | Conclusion     |

## Examples Repository

Find complete working examples at:

```
apps/api/src/services/__examples__/pdf-charts-example.ts
```

Run examples:

```bash
npx ts-node apps/api/src/services/__examples__/pdf-charts-example.ts
```

## Related Documentation

- **[PDF Template System](../../reference/api/pdf-template-system.md)** - Custom PDF templates
- **[Export Service](../../reference/api/export-service.md)** - Excel, CSV, PDF exports
- **[Inventory Features](../../features/inventory/README.md)** - Inventory system overview

---

**Version**: 1.0
**Last Updated**: 2024-12-19
**Author**: AegisX Platform Team
