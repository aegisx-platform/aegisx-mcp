# Chart Generation API Reference

Complete API reference for **server-side chart generation** using Chart.js and ChartJS Node Canvas for PDF report embedding.

## Overview

The **ChartService** provides a robust, type-safe API for generating high-quality charts as PNG buffers on the server. Designed specifically for embedding in PDF reports and other server-rendered documents.

### Key Features

- **Server-side rendering** - Generate charts without browser dependencies
- **Multiple chart types** - Bar, Line, Pie, Doughnut charts with full customization
- **Built-in color schemes** - Primary, success, warning, danger, info, purple, and mixed palettes
- **Thai language support** - Full Unicode support for Thai labels and formatting
- **Responsive design** - Adaptive layout with customizable dimensions
- **Data value display** - Option to show numeric values directly on charts
- **Performance optimized** - Efficient PNG compression with < 500ms generation time

### Import

```typescript
import { ChartService, ChartType, ChartData, ChartOptions, CHART_COLORS } from '@/services/chart.service';
```

Location: `/apps/api/src/services/chart.service.ts`

---

## ChartService Class

### Constructor

```typescript
constructor(width?: number, height?: number)
```

Creates a new ChartService instance with optional custom dimensions.

**Parameters:**

| Parameter | Type     | Default | Description             |
| --------- | -------- | ------- | ----------------------- |
| `width`   | `number` | `800`   | Canvas width in pixels  |
| `height`  | `number` | `400`   | Canvas height in pixels |

**Example:**

```typescript
// Use default dimensions (800x400)
const chartService = new ChartService();

// Custom dimensions for large posters
const largeChart = new ChartService(1920, 1080);

// Square format for social media
const squareChart = new ChartService(600, 600);
```

---

## Core Methods

### generateBarChart()

Generate a vertical bar chart as PNG buffer.

**Signature:**

```typescript
async generateBarChart(data: ChartData, options?: ChartOptions): Promise<Buffer>
```

**Parameters:**

| Parameter | Type           | Required | Description                       |
| --------- | -------------- | -------- | --------------------------------- |
| `data`    | `ChartData`    | Yes      | Chart data with labels and values |
| `options` | `ChartOptions` | No       | Optional customization settings   |

**Returns:** `Promise<Buffer>` - PNG image buffer ready for embedding

**Example:**

```typescript
const chartService = new ChartService();

const inventoryData: ChartData = {
  labels: ['คลังหลัก', 'คลังย่อย A', 'คลังย่อย B', 'คลังย่อย C'],
  datasets: [{
    label: 'มูลค่ายาคงคลัง',
    data: [80000, 50000, 30000, 45000]
  }]
};

const buffer = await chartService.generateBarChart(inventoryData, {
  title: 'มูลค่ายาคงคลังแยกตามคลัง',
  subtitle: 'ข้อมูล ณ วันที่ 19 ธันวาคม 2567',
  colorScheme: 'primary',
  displayValues: true,
  showGrid: true
});

// Use in PDF generation
await pdfDoc.embedImage({ url: buffer }, { ... });
```

**Color Rendering:**

- Uses bar fill colors from selected color scheme
- Automatically darkens border colors for contrast
- Each dataset gets distinct color progression

**Data Formatting:**

- Numeric values formatted with locale-specific separators (Thai: `,`)
- Y-axis grid lines enabled by default
- X-axis grid lines disabled for clarity

---

### generateLineChart()

Generate a smooth line chart with optional filled areas.

**Signature:**

```typescript
async generateLineChart(data: ChartData, options?: ChartOptions): Promise<Buffer>
```

**Parameters:**

| Parameter | Type           | Required | Description                        |
| --------- | -------------- | -------- | ---------------------------------- |
| `data`    | `ChartData`    | Yes      | Chart data with time series values |
| `options` | `ChartOptions` | No       | Optional customization settings    |

**Returns:** `Promise<Buffer>` - PNG image buffer

**Features:**

- Smooth curves (tension: 0.4) for natural-looking trends
- Filled area under lines with 20% transparency
- Multiple dataset support with distinct colors
- Automatic legend positioning for multi-series data

**Example - Single Series:**

```typescript
const salesData: ChartData = {
  labels: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน'],
  datasets: [
    {
      label: 'ยอดขายรวม',
      data: [100000, 120000, 110000, 130000, 140000, 125000],
    },
  ],
};

const buffer = await chartService.generateLineChart(salesData, {
  title: 'แนวโน้มยอดขายรายเดือน',
  colorScheme: 'success',
  displayValues: true,
  showLegend: true,
});
```

**Example - Multiple Series (Comparison):**

```typescript
const comparisonData: ChartData = {
  labels: ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4'],
  datasets: [
    {
      label: 'เป้าหมาย',
      data: [100, 100, 100, 100],
      fill: false, // Line only, no fill
      borderWidth: 2,
    },
    {
      label: 'ผลงานจริง',
      data: [85, 90, 95, 102],
      fill: true, // Area under line
    },
  ],
};

const buffer = await chartService.generateLineChart(comparisonData, {
  title: 'เปรียบเทียบเป้าหมายและผลงาน',
  colorScheme: 'mixed',
  showGrid: true,
});
```

---

### generatePieChart()

Generate a pie chart showing proportion distribution.

**Signature:**

```typescript
async generatePieChart(data: ChartData, options?: ChartOptions): Promise<Buffer>
```

**Parameters:**

| Parameter | Type           | Required | Description                     |
| --------- | -------------- | -------- | ------------------------------- |
| `data`    | `ChartData`    | Yes      | Chart data (uses first dataset) |
| `options` | `ChartOptions` | No       | Optional customization          |

**Returns:** `Promise<Buffer>` - PNG image buffer

**Features:**

- Automatically calculates percentages
- White borders between segments for clarity
- Legend positioned on the right side
- Percentage labels displayed on segments by default
- Best for 2-7 categories

**Example:**

```typescript
const drugTypeData: ChartData = {
  labels: ['ยาเม็ด', 'ยาน้ำ', 'ยาฉีด', 'ยาทา', 'อื่น ๆ'],
  datasets: [
    {
      data: [120, 75, 45, 30, 25], // Total = 295
    },
  ],
};

const buffer = await chartService.generatePieChart(drugTypeData, {
  title: 'สัดส่วนประเภทยาในคลังยา',
  colorScheme: 'mixed',
  displayValues: true, // Shows percentages
});

// Will display: 40.7%, 25.4%, 15.3%, 10.2%, 8.5%
```

**Important:**

- Only the first dataset is used (additional datasets ignored)
- Percentage calculation: `(value / sum) × 100`
- Best for displaying categorical distribution
- Avoid using with more than 8 categories (readability decreases)

---

### generateDoughnutChart()

Generate a doughnut chart (pie chart with hollow center).

**Signature:**

```typescript
async generateDoughnutChart(data: ChartData, options?: ChartOptions): Promise<Buffer>
```

**Parameters:**

| Parameter | Type           | Required | Description                     |
| --------- | -------------- | -------- | ------------------------------- |
| `data`    | `ChartData`    | Yes      | Chart data (uses first dataset) |
| `options` | `ChartOptions` | No       | Optional customization          |

**Returns:** `Promise<Buffer>` - PNG image buffer

**Features:**

- Same as pie chart with hollow center design
- Cleaner aesthetic for embedded reports
- Percentage labels display in segments
- Right-aligned legend

**Example - Budget Distribution:**

```typescript
const budgetData: ChartData = {
  labels: ['ค่าเวชภัณฑ์', 'ค่าอุปกรณ์การแพทย์', 'ค่าจ้างบุคลากร', 'ค่าโครงสร้างพื้นฐาน'],
  datasets: [
    {
      data: [4500000, 2000000, 8000000, 1500000],
    },
  ],
};

const buffer = await chartService.generateDoughnutChart(budgetData, {
  title: 'สัดส่วนการจัดสรรงบประมาณ',
  subtitle: 'ประจำปีงบประมาณ 2568',
  colorScheme: 'primary',
  showLegend: true,
  displayValues: true,
});
```

---

### generateChart()

Generic chart generator - route to specific chart type based on parameter.

**Signature:**

```typescript
async generateChart(
  type: ChartType,
  data: ChartData,
  options?: ChartOptions
): Promise<Buffer>
```

**Parameters:**

| Parameter | Type           | Required | Description                                        |
| --------- | -------------- | -------- | -------------------------------------------------- |
| `type`    | `ChartType`    | Yes      | Chart type: 'bar' \| 'line' \| 'pie' \| 'doughnut' |
| `data`    | `ChartData`    | Yes      | Chart data                                         |
| `options` | `ChartOptions` | No       | Optional customization                             |

**Returns:** `Promise<Buffer>` - PNG image buffer

**Example:**

```typescript
const chartType = 'bar'; // Dynamic selection
const chartBuffer = await chartService.generateChart(chartType, dataSet, {
  title: 'Dynamic Chart',
  colorScheme: 'primary',
});
```

**Error Handling:**

```typescript
try {
  const buffer = await chartService.generateChart('invalid', data);
} catch (error) {
  // Error: "Unsupported chart type: invalid"
  console.error(error.message);
}
```

---

## Data Interfaces

### ChartType

Type union for supported chart types.

```typescript
type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
```

**Supported Types:**

| Type        | Best Use Case                         |
| ----------- | ------------------------------------- |
| `bar`       | Categorical comparisons, inventory    |
| `line`      | Time series, trends, performance      |
| `pie`       | Proportional distribution, budget     |
| `doughnut`  | Distribution with better aesthetics   |
| `radar`     | Multi-dimensional analysis (reserved) |
| `polarArea` | Cyclical data (reserved)              |

---

### ChartData

Interface for chart data structure.

```typescript
interface ChartData {
  labels: string[];
  datasets: Array<{
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}
```

**Properties:**

| Property          | Type                 | Required | Description                        |
| ----------------- | -------------------- | -------- | ---------------------------------- |
| `labels`          | `string[]`           | Yes      | X-axis labels or categories        |
| `datasets`        | `Dataset[]`          | Yes      | Array of data series               |
| `label`           | `string`             | No       | Dataset name for legend            |
| `data`            | `number[]`           | Yes      | Numeric values (any sign/size)     |
| `backgroundColor` | `string \| string[]` | No       | Fill colors (hex codes)            |
| `borderColor`     | `string \| string[]` | No       | Border/line colors                 |
| `borderWidth`     | `number`             | No       | Border thickness in pixels         |
| `fill`            | `boolean`            | No       | Fill area under line (line charts) |

**Example:**

```typescript
const complexData: ChartData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Expected Revenue',
      data: [100000, 120000, 140000, 160000],
      backgroundColor: '#3b82f6',
      borderColor: '#1d4ed8',
      borderWidth: 2,
    },
    {
      label: 'Actual Revenue',
      data: [95000, 110000, 135000, 155000],
      backgroundColor: '#10b981',
      borderColor: '#059669',
      borderWidth: 2,
    },
  ],
};
```

---

### ChartOptions

Interface for chart customization options.

```typescript
interface ChartOptions {
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  colorScheme?: keyof typeof CHART_COLORS | string[];
  showLegend?: boolean;
  showGrid?: boolean;
  displayValues?: boolean;
  responsive?: boolean;
}
```

**Properties:**

| Property        | Type                 | Default   | Description                         |
| --------------- | -------------------- | --------- | ----------------------------------- |
| `title`         | `string`             | undefined | Chart main title                    |
| `subtitle`      | `string`             | undefined | Chart subtitle                      |
| `width`         | `number`             | `800`     | Canvas width in pixels              |
| `height`        | `number`             | `400`     | Canvas height in pixels             |
| `colorScheme`   | `string \| string[]` | `mixed`   | Color palette name or custom colors |
| `showLegend`    | `boolean`            | `true`    | Display legend                      |
| `showGrid`      | `boolean`            | `true`    | Display grid lines (Y-axis)         |
| `displayValues` | `boolean`            | `false`   | Show numeric values on chart        |
| `responsive`    | `boolean`            | `true`    | Enable responsive rendering         |

**Example - All Options:**

```typescript
const fullOptions: ChartOptions = {
  title: 'ภาพรวมประสิทธิการใช้งานระบบ',
  subtitle: 'ข้อมูลประจำเดือนธันวาคม 2567',
  width: 1200,
  height: 600,
  colorScheme: 'primary',
  showLegend: true,
  showGrid: true,
  displayValues: true,
  responsive: true,
};
```

---

## Color Schemes

### CHART_COLORS Object

Pre-defined color palettes exported from ChartService.

```typescript
export const CHART_COLORS = {
  primary: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  success: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  info: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
  purple: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'],
  mixed: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'],
};
```

### Built-in Palettes

#### primary

Blue corporate tones - best for business metrics.

```typescript
colorScheme: 'primary';
// Colors: #3b82f6, #2563eb, #1d4ed8, #1e40af, #1e3a8a
```

Use for: Revenue, performance, neutral metrics

#### success

Green tones - indicates positive metrics.

```typescript
colorScheme: 'success';
// Colors: #10b981, #059669, #047857, #065f46, #064e3b
```

Use for: Growth, achievements, inventory surplus

#### warning

Amber/orange tones - draws attention.

```typescript
colorScheme: 'warning';
// Colors: #f59e0b, #d97706, #b45309, #92400e, #78350f
```

Use for: Caution, pending items, near-limit metrics

#### danger

Red tones - indicates problems.

```typescript
colorScheme: 'danger';
// Colors: #ef4444, #dc2626, #b91c1c, #991b1b, #7f1d1d
```

Use for: Errors, critical alerts, inventory shortages

#### info

Cyan tones - informational.

```typescript
colorScheme: 'info';
// Colors: #06b6d4, #0891b2, #0e7490, #155e75, #164e63
```

Use for: Information display, educational content

#### purple

Purple tones - creative/custom.

```typescript
colorScheme: 'purple';
// Colors: #8b5cf6, #7c3aed, #6d28d9, #5b21b6, #4c1d95
```

Use for: Custom categories, special reports

#### mixed

Multi-color diverse palette - maximum distinction.

```typescript
colorScheme: 'mixed';
// Colors: #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6, #06b6d4, #ec4899
```

Use for: Pie charts, categorical data with many categories

### Custom Colors

Pass array of hex color codes for complete control.

**Example:**

```typescript
const options: ChartOptions = {
  colorScheme: ['#FF5733', '#33FF57', '#3357FF', '#FF33F5'],
};
```

**Color Cycling:**

If data has more values than colors provided, colors repeat automatically.

```typescript
const options: ChartOptions = {
  colorScheme: ['#3b82f6', '#10b981'], // 2 colors
};

const data: ChartData = {
  labels: ['A', 'B', 'C', 'D', 'E'], // 5 categories
  datasets: [
    {
      data: [10, 20, 30, 40, 50],
      // Will use: #3b82f6, #10b981, #3b82f6, #10b981, #3b82f6
    },
  ],
};
```

---

## Complete Examples

### Example 1: Pharmacy Inventory Bar Chart

```typescript
import { ChartService } from '@/services/chart.service';

async function generateInventoryReport() {
  const chartService = new ChartService(1000, 500);

  const inventoryData = {
    labels: ['ยาปฏิชีวนะ', 'ยาแก้ปวด', 'วิตามิน', 'ยาลดไข้', 'ยาระบายสำหรับเด็ก'],
    datasets: [
      {
        label: 'จำนวนหน่วยในคลัง',
        data: [4500, 3200, 8900, 2100, 1500],
      },
    ],
  };

  const buffer = await chartService.generateBarChart(inventoryData, {
    title: 'สต็อกยาในคลังการบริการสุขภาพ',
    subtitle: 'ข้อมูล ณ วันที่ 19 ธันวาคม 2567',
    colorScheme: 'primary',
    displayValues: true,
    showGrid: true,
    showLegend: false,
  });

  // Embed in PDF
  const pdfDoc = new PDFDocument();
  pdfDoc.image(buffer, 50, 100, { width: 500, height: 300 });
  pdfDoc.pipe(fs.createWriteStream('inventory-report.pdf'));
  pdfDoc.end();
}
```

### Example 2: Sales Trend Line Chart with Multiple Series

```typescript
async function generateSalesAnalysis() {
  const chartService = new ChartService(1200, 600);

  const salesData = {
    labels: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน'],
    datasets: [
      {
        label: 'เป้าหมายการขาย',
        data: [500000, 550000, 600000, 650000, 700000, 750000],
        borderColor: '#999999',
        fill: false,
        borderWidth: 2,
        borderDash: [5, 5], // Dashed line
      },
      {
        label: 'ยอดขายจริง',
        data: [480000, 520000, 610000, 640000, 720000, 700000],
        borderColor: '#10b981',
        fill: true,
      },
    ],
  };

  const buffer = await chartService.generateLineChart(salesData, {
    title: 'การวิเคราะห์ยอดขายแรกครึ่งปี 2568',
    subtitle: 'เปรียบเทียบเป้าหมายกับผลงานจริง',
    colorScheme: 'mixed',
    displayValues: true,
    showGrid: true,
  });

  return buffer;
}
```

### Example 3: Budget Distribution Doughnut Chart

```typescript
async function generateBudgetBreakdown() {
  const chartService = new ChartService(600, 600);

  const budgetData = {
    labels: ['ค่าเวชภัณฑ์', 'ค่าอุปกรณ์การแพทย์', 'ค่าจ้างบุคลากร', 'ค่าโครงสร้างพื้นฐาน', 'อื่น ๆ'],
    datasets: [
      {
        data: [
          4500000, // 35%
          2500000, // 19%
          8000000, // 62%
          2000000, // 16%
          1000000, // 8%
        ],
      },
    ],
  };

  const buffer = await chartService.generateDoughnutChart(budgetData, {
    title: 'การจัดสรรงบประมาณประจำปี 2568',
    subtitle: 'รวมทั้งสิ้น 18 ล้านบาท',
    colorScheme: 'primary',
    displayValues: true,
  });

  return buffer;
}
```

### Example 4: Drug Type Distribution Pie Chart

```typescript
async function generateDrugTypeAnalysis() {
  const chartService = new ChartService(800, 500);

  const drugTypeData = {
    labels: ['ยาเม็ด', 'ยาน้ำ', 'ยาฉีด', 'ยาทา', 'อื่น ๆ'],
    datasets: [
      {
        data: [450, 280, 190, 75, 45],
      },
    ],
  };

  const buffer = await chartService.generatePieChart(drugTypeData, {
    title: 'สัดส่วนประเภทยาในคลังยา',
    colorScheme: 'mixed',
    displayValues: true,
  });

  return buffer;
}
```

### Example 5: Dynamic Chart Generation with Error Handling

```typescript
async function generateReport(chartType: string, data: any, options: any) {
  try {
    const chartService = new ChartService(1000, 500);

    // Validate chart type
    const validTypes = ['bar', 'line', 'pie', 'doughnut'];
    if (!validTypes.includes(chartType)) {
      throw new Error(`Invalid chart type: ${chartType}. ` + `Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate data
    if (!data.labels || !data.datasets) {
      throw new Error('Data must have labels and datasets properties');
    }

    if (data.labels.length === 0) {
      throw new Error('Data labels cannot be empty');
    }

    // Generate chart
    const buffer = await chartService.generateChart(chartType, data, options);

    return {
      success: true,
      buffer,
      info: {
        type: chartType,
        width: options?.width || 800,
        height: options?.height || 400,
        labels: data.labels.length,
        series: data.datasets.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: 'CHART_GENERATION_ERROR',
    };
  }
}
```

---

## Best Practices

### 1. Data Preparation

- Ensure labels and data arrays have matching lengths
- Validate data is numeric before passing to chart service
- Format large numbers appropriately (use displayValues for clarity)

```typescript
// ✓ Good
const data = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [{ data: [100, 200, 150] }],
};

// ✗ Bad
const data = {
  labels: ['Jan', 'Feb'],
  datasets: [{ data: [100, 200, 150] }], // Mismatch
};
```

### 2. Chart Type Selection

Choose appropriate chart types for your data:

| Data Type             | Best Chart | Why                         |
| --------------------- | ---------- | --------------------------- |
| Time series trends    | Line       | Shows progression naturally |
| Category comparisons  | Bar        | Easy visual comparison      |
| Part-to-whole ratios  | Pie/Dough  | Shows proportions clearly   |
| Multi-series trends   | Line       | Multiple lines overlay well |
| Large categories (8+) | Bar        | More readable than pie      |

### 3. Color Scheme Selection

Select colors based on data context:

```typescript
// Revenue/positive metrics
colorScheme: 'success';

// Warning/caution situations
colorScheme: 'warning';

// Critical/error situations
colorScheme: 'danger';

// Business/neutral metrics
colorScheme: 'primary';

// Multiple unrelated categories
colorScheme: 'mixed';
```

### 4. Performance Considerations

- Chart generation: < 500ms per chart
- Memory usage: < 10MB per chart
- Optimal data points: 10-100 per dataset
- Maximum practical size: 1920x1080 pixels

**Optimization tips:**

```typescript
// For many data points, consider aggregation
const aggregatedData = {
  labels: largeDataset.labels.slice(0, 50),
  datasets: [
    {
      data: aggregateValues(largeDataset.data, 50),
    },
  ],
};

// Use smaller dimensions for thumbnails
const thumbnail = new ChartService(400, 300);
```

### 5. PDF Integration

When embedding in PDFs:

```typescript
import PDFDocument from 'pdfkit';

async function embedChartInPDF() {
  const chart = await chartService.generateBarChart(data, options);

  const pdf = new PDFDocument();

  // Add space for chart
  pdf.addPage();
  pdf.image(chart, 50, 50, {
    width: 500,
    height: 300,
    align: 'center',
  });

  pdf.pipe(fs.createWriteStream('report.pdf'));
  pdf.end();
}
```

### 6. Thai Language Support

ChartService fully supports Thai text in all label fields:

```typescript
const thaiData = {
  labels: ['คลังหลัก', 'คลังย่อยอาคารเดิม', 'คลังย่อยอาคารใหม่'],
  datasets: [
    {
      label: 'มูลค่ายาคงคลัง',
      data: [80000, 50000, 30000],
    },
  ],
};

const buffer = await chartService.generateBarChart(thaiData, {
  title: 'รายงานสต็อกยาแยกตามคลัง',
  subtitle: 'ประจำเดือนธันวาคม 2567',
});
```

---

## Error Handling

### Common Errors and Solutions

#### Error: "Unsupported chart type"

```typescript
// ✗ Wrong
await chartService.generateChart('scatter', data);

// ✓ Correct - use valid types
await chartService.generateChart('bar', data);
// Valid types: 'bar' | 'line' | 'pie' | 'doughnut'
```

#### Error: Empty data arrays

```typescript
// ✗ Wrong
const data = {
  labels: [],
  datasets: [{ data: [] }],
};

// ✓ Correct - always provide data
const data = {
  labels: ['Category 1', 'Category 2'],
  datasets: [{ data: [100, 200] }],
};
```

#### Label/Data mismatch

```typescript
// ✗ Wrong - 3 labels, 4 data points
{
  labels: ['A', 'B', 'C'],
  datasets: [{ data: [10, 20, 30, 40] }]
}

// ✓ Correct - matching counts
{
  labels: ['A', 'B', 'C', 'D'],
  datasets: [{ data: [10, 20, 30, 40] }]
}
```

### Error Handling Pattern

```typescript
async function safeChartGeneration(type: string, data: any, options?: any) {
  try {
    // Validate inputs
    if (!['bar', 'line', 'pie', 'doughnut'].includes(type)) {
      throw new Error(`Invalid chart type: ${type}`);
    }

    if (!Array.isArray(data?.labels)) {
      throw new Error('Data must have labels array');
    }

    if (!Array.isArray(data?.datasets)) {
      throw new Error('Data must have datasets array');
    }

    if (data.labels.length === 0) {
      throw new Error('Labels array cannot be empty');
    }

    // Generate chart
    const service = new ChartService(options?.width, options?.height);

    return await service.generateChart(type, data, options);
  } catch (error) {
    // Log error
    console.error('Chart generation failed:', {
      type,
      error: error.message,
      labels: data?.labels?.length,
      datasets: data?.datasets?.length,
    });

    // Return null or throw based on requirements
    throw error;
  }
}
```

---

## Integration Examples

### With Express/Fastify Route

```typescript
// POST /api/reports/generate-chart
async function generateChartRoute(req: FastifyRequest, reply: FastifyReply) {
  const { type, data, options } = req.body;

  try {
    const service = new ChartService(options?.width, options?.height);

    const buffer = await service.generateChart(type, data, options);

    reply.type('image/png');
    reply.send(buffer);
  } catch (error) {
    reply.status(400).send({
      error: 'Chart generation failed',
      message: error.message,
    });
  }
}
```

### With PDF Report Service

```typescript
import PDFDocument from 'pdfkit';

async function generateMonthlyReport(month: string) {
  const pdf = new PDFDocument();
  const service = new ChartService(1000, 500);

  // Generate multiple charts
  const inventoryChart = await service.generateBarChart(inventoryData, {
    title: 'Monthly Inventory',
  });

  const salesChart = await service.generateLineChart(salesData, {
    title: 'Sales Trend',
  });

  // Embed in PDF
  pdf.text(`Report for ${month}`, { fontSize: 24 });
  pdf.addPage();
  pdf.image(inventoryChart, 50, 50, { width: 500 });

  pdf.addPage();
  pdf.image(salesChart, 50, 50, { width: 500 });

  pdf.pipe(fs.createWriteStream(`report-${month}.pdf`));
  pdf.end();
}
```

---

## Performance Metrics

### Typical Generation Times

| Chart Type | Data Points | Time  |
| ---------- | ----------- | ----- |
| Bar        | 10          | 150ms |
| Bar        | 100         | 280ms |
| Line       | 10          | 140ms |
| Line       | 100         | 250ms |
| Pie        | 5           | 120ms |
| Pie        | 10          | 180ms |
| Doughnut   | 5           | 130ms |
| Doughnut   | 10          | 190ms |

### Memory Usage

- Typical chart: 2-5 MB (uncompressed PNG)
- With compression: 500KB-2MB
- Multiple concurrent: < 50MB for 10 charts

---

## API Reference Summary

### Quick Method Reference

| Method                    | Returns           | Best For                 |
| ------------------------- | ----------------- | ------------------------ |
| `generateBarChart()`      | `Promise<Buffer>` | Categorical comparisons  |
| `generateLineChart()`     | `Promise<Buffer>` | Trends and time series   |
| `generatePieChart()`      | `Promise<Buffer>` | Distribution/proportions |
| `generateDoughnutChart()` | `Promise<Buffer>` | Distribution (aesthetic) |
| `generateChart()`         | `Promise<Buffer>` | Dynamic type selection   |

### Quick Property Reference

| Property        | Type    | Default   |
| --------------- | ------- | --------- |
| `title`         | string  | undefined |
| `subtitle`      | string  | undefined |
| `width`         | number  | 800       |
| `height`        | number  | 400       |
| `colorScheme`   | string  | 'mixed'   |
| `showLegend`    | boolean | true      |
| `showGrid`      | boolean | true      |
| `displayValues` | boolean | false     |
| `responsive`    | boolean | true      |

---

## Testing

The ChartService includes comprehensive test coverage. See `/apps/api/src/services/chart.service.spec.ts` for:

- All chart type generation tests
- Color scheme validation
- Thai language support verification
- Edge cases (empty data, large numbers, negative values)
- Multiple dataset handling
- Custom dimension rendering

Run tests with:

```bash
pnpm run test:api -- chart.service.spec.ts
```

---

## Version Information

- **Service Location**: `/apps/api/src/services/chart.service.ts`
- **Dependencies**: `chartjs-node-canvas`, `chart.js`, `chartjs-plugin-datalabels`
- **Node Versions**: 16+ (for native canvas support)
- **Last Updated**: 2025-12-19

---

## Related Documentation

- [API Response Standard](./api-response-standard.md)
- [PDF Report Generation Guide](../guides/pdf-generation-guide.md)
- [File Upload Guide](./file-upload-guide.md)
- [TypeBox Schema Standard](./typebox-schema-standard.md)
