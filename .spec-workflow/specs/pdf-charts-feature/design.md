# PDF Charts Feature - Design Document

## 📐 Architecture Overview

### System Context

```
┌─────────────────────────────────────────────────────────┐
│                    Client Request                        │
│         (Generate PDF with Charts)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              PDFMakeService                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  generatePdf(options: PdfExportOptions)           │  │
│  │    - Process charts[] array                       │  │
│  │    - Generate chart images                        │  │
│  │    - Embed in PDF document                        │  │
│  └───────────────────────────────────────────────────┘  │
└────────────┬──────────────────┬────────────────────────┘
             │                  │
             │                  └──────────────┐
             ▼                                 ▼
┌────────────────────────┐         ┌──────────────────────┐
│   ChartService         │         │  FontManagerService  │
│  ┌──────────────────┐  │         │  (Thai Font Support) │
│  │ Chart.js Canvas  │  │         └──────────────────────┘
│  │ Server-side      │  │
│  │ PNG Generation   │  │
│  └──────────────────┘  │
└────────────────────────┘
             │
             ▼
┌────────────────────────┐
│   PNG Buffer (Base64)  │
│   Embedded in PDF      │
└────────────────────────┘
```

---

## 🏗️ Component Design

### 1. ChartService (NEW)

**File**: `apps/api/src/services/chart.service.ts`

**Responsibility**: Server-side chart generation using Chart.js

**Key Methods**:

```typescript
class ChartService {
  // Core chart generation methods
  async generateBarChart(data: ChartData, options: ChartOptions): Promise<Buffer>;
  async generateLineChart(data: ChartData, options: ChartOptions): Promise<Buffer>;
  async generatePieChart(data: ChartData, options: ChartOptions): Promise<Buffer>;
  async generateDoughnutChart(data: ChartData, options: ChartOptions): Promise<Buffer>;

  // Generic method
  async generateChart(type: ChartType, data: ChartData, options: ChartOptions): Promise<Buffer>;

  // Helper methods
  private getColors(scheme: ColorScheme, count: number): string[];
  private darkenColor(color: string): string;
  private transparentize(color: string, alpha: number): string;
}
```

**Dependencies**:

- `chartjs-node-canvas` - Server-side Canvas API
- `chart.js` - Chart.js library

**Configuration**:

```typescript
const canvas = new ChartJSNodeCanvas({
  width: 800,
  height: 400,
  backgroundColour: 'white',
  plugins: {
    modern: ['chartjs-plugin-datalabels'], // For value labels
  },
});
```

---

### 2. PDFMakeService (ENHANCED)

**File**: `apps/api/src/services/pdfmake.service.ts`

**Changes**:

#### 2.1 Enhanced Interfaces

```typescript
// NEW: Chart configuration
export interface PdfChartConfig {
  type: ChartType; // 'bar' | 'line' | 'pie' | 'doughnut'
  data: ChartData; // Labels and datasets
  options?: ChartOptions; // Title, colors, legend, etc.
  position: ChartPosition; // 'before' | 'after' | 'top' | 'bottom'
  width?: number; // Default: 500px
  height?: number; // Default: 300px
  alignment?: 'left' | 'center' | 'right'; // Default: 'center'
  margin?: [top, right, bottom, left];
}

// UPDATED: Existing interface
export interface PdfExportOptions {
  // ... existing fields
  charts?: PdfChartConfig[]; // NEW: Optional charts array
}
```

#### 2.2 New Methods

```typescript
class PDFMakeService {
  private chartService: ChartService; // NEW dependency

  // NEW: Generate chart element for PDF
  private async createChartElement(config: PdfChartConfig): Promise<any> {
    // 1. Generate chart as PNG buffer
    const chartBuffer = await this.chartService.generateChart(config.type, config.data, config.options);

    // 2. Convert to base64
    const base64Image = chartBuffer.toString('base64');

    // 3. Create PDFMake image element
    return {
      image: base64Image,
      width: config.width || 500,
      height: config.height || 300,
      alignment: config.alignment || 'center',
      margin: config.margin || [0, 10, 0, 20],
    };
  }

  // UPDATED: Now async to support charts
  private async createDocumentDefinition(options: PdfExportOptions): Promise<any> {
    const content: any[] = [];

    // Add title
    content.push(this.createTitleSection(title, subtitle));

    // Add charts at 'top' or 'before' position
    const topCharts = charts.filter((c) => c.position === 'top' || c.position === 'before');
    for (const chartConfig of topCharts) {
      const chartElement = await this.createChartElement(chartConfig);
      content.push(chartElement);
    }

    // Add table
    content.push(this.createDataTable(data, fields));

    // Add charts at 'after' or 'bottom' position
    const bottomCharts = charts.filter((c) => c.position === 'after' || c.position === 'bottom');
    for (const chartConfig of bottomCharts) {
      const chartElement = await this.createChartElement(chartConfig);
      content.push(chartElement);
    }

    return docDefinition;
  }

  // UPDATED: Now async
  async generatePdf(options: PdfExportOptions): Promise<Buffer> {
    await this.waitForFonts();
    const docDefinition = await this.createDocumentDefinition(options); // Now awaits
    // ... rest of PDF generation
  }
}
```

---

## 📊 Data Flow

### Chart Generation Flow

```
1. User Request
   ├─ PdfExportOptions with charts[] array
   │
2. PDFMakeService.generatePdf()
   ├─ Process each chart in charts[]
   │  ├─ Position: 'before' → Add before table
   │  └─ Position: 'after' → Add after table
   │
3. For each chart:
   ├─ Call ChartService.generateChart()
   │  ├─ Create Chart.js configuration
   │  ├─ Apply color scheme
   │  ├─ Render to Canvas
   │  └─ Return PNG Buffer
   │
4. Convert chart to PDF element
   ├─ Buffer → Base64 string
   ├─ Create PDFMake image object
   └─ Add to content array
   │
5. Assemble final PDF
   ├─ Title
   ├─ Charts (before)
   ├─ Data Table
   ├─ Charts (after)
   └─ Footer
   │
6. Generate PDF
   └─ Return Buffer to client
```

---

## 🎨 Color Schemes

### Predefined Palettes

```typescript
export const CHART_COLORS = {
  primary: [
    '#3b82f6', // Blue-500
    '#2563eb', // Blue-600
    '#1d4ed8', // Blue-700
    '#1e40af', // Blue-800
    '#1e3a8a', // Blue-900
  ],

  success: [
    '#10b981', // Green-500
    '#059669', // Green-600
    '#047857', // Green-700
    '#065f46', // Green-800
    '#064e3b', // Green-900
  ],

  warning: [
    '#f59e0b', // Amber-500
    '#d97706', // Amber-600
    '#b45309', // Amber-700
    '#92400e', // Amber-800
    '#78350f', // Amber-900
  ],

  danger: [
    '#ef4444', // Red-500
    '#dc2626', // Red-600
    '#b91c1c', // Red-700
    '#991b1b', // Red-800
    '#7f1d1d', // Red-900
  ],

  mixed: [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#ec4899', // Pink
  ],
};
```

### Color Helper Methods

```typescript
// Darken color for borders
private darkenColor(color: string): string {
  // Reduce RGB values by 20%
  return darker(color);
}

// Make color transparent for fills
private transparentize(color: string, alpha: number): string {
  // Convert hex to rgba with alpha
  return `rgba(r, g, b, ${alpha})`;
}
```

---

## 📐 Chart.js Configuration Templates

### Bar Chart Configuration

```typescript
{
  type: 'bar',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{
      label: 'Dataset 1',
      data: [10, 20, 30],
      backgroundColor: colors,
      borderColor: darkenColors,
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Chart Title',
        font: { size: 18, weight: 'bold' }
      },
      legend: {
        display: true,
        position: 'top'
      },
      datalabels: {
        display: true,
        color: '#000',
        formatter: (value) => value.toLocaleString()
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true },
        ticks: {
          callback: (value) => value.toLocaleString()
        }
      },
      x: {
        grid: { display: false }
      }
    }
  }
}
```

### Line Chart Configuration

```typescript
{
  type: 'line',
  data: {
    labels: monthLabels,
    datasets: [{
      label: 'Series 1',
      data: values,
      borderColor: color,
      backgroundColor: transparentColor,
      borderWidth: 2,
      fill: true,
      tension: 0.4  // Smooth curves
    }]
  },
  options: {
    // Similar to bar chart
    // + Line-specific options
  }
}
```

### Pie/Doughnut Chart Configuration

```typescript
{
  type: 'pie',  // or 'doughnut'
  data: {
    labels: categories,
    datasets: [{
      data: values,
      backgroundColor: colors,
      borderColor: '#fff',
      borderWidth: 2
    }]
  },
  options: {
    plugins: {
      legend: {
        position: 'right'
      },
      datalabels: {
        color: '#fff',
        formatter: (value, ctx) => {
          const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percentage = ((value / sum) * 100).toFixed(1);
          return `${percentage}%`;
        }
      }
    }
  }
}
```

---

## 🔄 API Usage Examples

### Example 1: Simple Bar Chart

```typescript
const pdf = await pdfService.generatePdf({
  title: 'Stock Report',
  data: inventoryData,
  fields: stockFields,
  charts: [
    {
      type: 'bar',
      position: 'before',
      data: {
        labels: ['Pharmacy', 'Ward A', 'Ward B'],
        datasets: [
          {
            label: 'Stock Value (THB)',
            data: [80000, 50000, 30000],
          },
        ],
      },
      options: {
        title: 'Stock Value by Location',
        colorScheme: 'primary',
        displayValues: true,
      },
    },
  ],
});
```

### Example 2: Multi-Series Line Chart

```typescript
charts: [
  {
    type: 'line',
    position: 'before',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Paracetamol',
          data: [1200, 1350, 1100, 1400, 1300, 1250],
        },
        {
          label: 'Amoxicillin',
          data: [800, 850, 900, 950, 920, 880],
        },
      ],
    },
    options: {
      title: 'Drug Usage Trend (6 Months)',
      colorScheme: ['#3b82f6', '#10b981'],
      showLegend: true,
    },
  },
];
```

### Example 3: Pie Chart with Custom Colors

```typescript
charts: [
  {
    type: 'pie',
    position: 'after',
    data: {
      labels: ['Procurement', 'Distribution', 'Returns', 'Adjustments'],
      datasets: [
        {
          data: [40, 30, 20, 10],
        },
      ],
    },
    options: {
      title: 'Budget Distribution Q1',
      colorScheme: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      displayValues: true,
    },
    width: 400,
    height: 400,
  },
];
```

### Example 4: Multiple Charts

```typescript
const executiveReport = await pdfService.generatePdf({
  title: 'Executive Summary - January 2024',
  charts: [
    {
      type: 'bar',
      position: 'before',
      data: {
        /* stock data */
      },
      options: { title: 'Stock Levels' },
    },
    {
      type: 'line',
      position: 'before',
      data: {
        /* trend data */
      },
      options: { title: 'Usage Trends' },
    },
    {
      type: 'pie',
      position: 'after',
      data: {
        /* budget data */
      },
      options: { title: 'Budget Distribution' },
    },
  ],
  data: summaryData,
  fields: summaryFields,
});
```

---

## 🧪 Testing Strategy

### Unit Tests

**File**: `chart.service.spec.ts`

```typescript
describe('ChartService', () => {
  describe('generateBarChart', () => {
    it('should generate bar chart with correct dimensions', async () => {
      const buffer = await chartService.generateBarChart(data, options);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should apply color scheme correctly', async () => {
      const buffer = await chartService.generateBarChart(data, {
        colorScheme: 'primary',
      });
      // Verify colors applied
    });

    it('should display values when displayValues is true', async () => {
      const buffer = await chartService.generateBarChart(data, {
        displayValues: true,
      });
      // Verify data labels rendered
    });
  });

  describe('generatePieChart', () => {
    it('should calculate percentages correctly', async () => {
      // Test percentage calculation
    });
  });
});
```

**File**: `pdfmake.service.spec.ts`

```typescript
describe('PDFMakeService with Charts', () => {
  it('should generate PDF with chart before table', async () => {
    const pdf = await pdfService.generatePdf({
      data: testData,
      fields: testFields,
      charts: [
        {
          type: 'bar',
          position: 'before',
          data: chartData,
        },
      ],
    });

    expect(pdf).toBeInstanceOf(Buffer);
  });

  it('should handle multiple charts', async () => {
    const pdf = await pdfService.generatePdf({
      charts: [
        { type: 'bar', position: 'before', data: data1 },
        { type: 'pie', position: 'after', data: data2 },
      ],
    });

    expect(pdf).toBeInstanceOf(Buffer);
  });

  it('should maintain backward compatibility', async () => {
    // Test without charts
    const pdf = await pdfService.generatePdf({
      data: testData,
      fields: testFields,
      // No charts
    });

    expect(pdf).toBeInstanceOf(Buffer);
  });
});
```

### Integration Tests

**File**: `pdf-charts.integration.spec.ts`

```typescript
describe('PDF Charts Integration', () => {
  it('should generate inventory report with bar chart', async () => {
    const inventoryData = await getInventoryData();
    const pdf = await pdfService.generatePdf({
      title: 'Stock Level Report',
      data: inventoryData,
      fields: stockFields,
      charts: [
        {
          type: 'bar',
          position: 'before',
          data: aggregateByLocation(inventoryData),
          options: {
            title: 'Stock by Location',
            colorScheme: 'primary',
          },
        },
      ],
    });

    // Save to temp file for manual inspection
    fs.writeFileSync('/tmp/test-inventory-report.pdf', pdf);

    expect(pdf.length).toBeGreaterThan(10000); // Non-empty PDF
  });
});
```

### Performance Tests

```typescript
describe('Performance', () => {
  it('should generate chart in under 500ms', async () => {
    const start = Date.now();
    await chartService.generateBarChart(data, options);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(500);
  });

  it('should generate PDF with 5 charts in under 3 seconds', async () => {
    const start = Date.now();
    await pdfService.generatePdf({
      charts: Array(5).fill(chartConfig),
    });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(3000);
  });
});
```

---

## 🛡️ Error Handling

### Chart Generation Errors

```typescript
try {
  const chartBuffer = await chartService.generateChart(type, data, options);
} catch (error) {
  if (error instanceof ChartConfigurationError) {
    // Invalid chart configuration
    throw new BadRequestException('Invalid chart configuration');
  } else if (error instanceof ChartRenderError) {
    // Rendering failed
    throw new InternalServerErrorException('Chart rendering failed');
  }
  throw error;
}
```

### PDF Generation Errors

```typescript
async generatePdf(options: PdfExportOptions): Promise<Buffer> {
  try {
    // Validate chart configurations
    if (options.charts) {
      this.validateChartConfigs(options.charts);
    }

    // Generate PDF
    const docDefinition = await this.createDocumentDefinition(options);
    return await this.renderPdf(docDefinition);

  } catch (error) {
    console.error('PDF generation failed:', error);

    // Fallback: Generate PDF without charts
    if (options.charts && options.charts.length > 0) {
      console.warn('Attempting PDF generation without charts');
      return await this.generatePdf({
        ...options,
        charts: undefined
      });
    }

    throw error;
  }
}
```

---

## 📊 Performance Optimization

### Chart Caching (Future Enhancement)

```typescript
class ChartService {
  private cache: Map<string, Buffer> = new Map();

  async generateChart(type, data, options): Promise<Buffer> {
    const cacheKey = this.generateCacheKey(type, data, options);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const buffer = await this.renderChart(type, data, options);
    this.cache.set(cacheKey, buffer);

    return buffer;
  }
}
```

### Parallel Chart Generation

```typescript
async createDocumentDefinition(options: PdfExportOptions): Promise<any> {
  // Generate all charts in parallel
  const chartPromises = options.charts.map(config =>
    this.createChartElement(config)
  );

  const chartElements = await Promise.all(chartPromises);

  // Assemble content with charts in correct positions
  const content = this.assembleContent(chartElements, options);

  return { content, ... };
}
```

---

## 🔐 Security Considerations

### Input Validation

```typescript
validateChartConfigs(charts: PdfChartConfig[]): void {
  for (const chart of charts) {
    // Validate chart type
    if (!['bar', 'line', 'pie', 'doughnut'].includes(chart.type)) {
      throw new Error(`Invalid chart type: ${chart.type}`);
    }

    // Validate data structure
    if (!chart.data.labels || !Array.isArray(chart.data.labels)) {
      throw new Error('Chart labels must be an array');
    }

    // Validate dimensions
    if (chart.width && (chart.width < 100 || chart.width > 2000)) {
      throw new Error('Chart width must be between 100 and 2000');
    }

    // Limit dataset size to prevent DoS
    if (chart.data.labels.length > 100) {
      throw new Error('Maximum 100 data points per chart');
    }
  }
}
```

### Resource Limits

```typescript
// Maximum charts per PDF
const MAX_CHARTS_PER_PDF = 10;

if (options.charts && options.charts.length > MAX_CHARTS_PER_PDF) {
  throw new Error(`Maximum ${MAX_CHARTS_PER_PDF} charts allowed per PDF`);
}

// Maximum chart dimensions
const MAX_CHART_WIDTH = 2000;
const MAX_CHART_HEIGHT = 1500;
```

---

## 📝 Documentation

### JSDoc Comments

```typescript
/**
 * Generate a bar chart as PNG buffer
 *
 * @param data - Chart data with labels and datasets
 * @param options - Chart customization options
 * @returns Promise<Buffer> - PNG image buffer
 *
 * @example
 * const chart = await chartService.generateBarChart({
 *   labels: ['A', 'B', 'C'],
 *   datasets: [{ data: [10, 20, 30] }]
 * }, {
 *   title: 'My Chart',
 *   colorScheme: 'primary'
 * });
 */
async generateBarChart(
  data: ChartData,
  options: ChartOptions = {}
): Promise<Buffer>
```

### API Documentation

- Add examples to API reference docs
- Create inventory-specific chart templates guide
- Document color schemes and when to use each

---

## ✅ Design Review Checklist

- [x] Architecture follows existing patterns
- [x] Backward compatible with existing PDF system
- [x] Type-safe interfaces
- [x] Error handling comprehensive
- [x] Performance targets defined
- [x] Testing strategy complete
- [x] Security considerations addressed
- [x] Thai font support maintained
- [x] Scalable for future chart types
- [x] Documentation plan defined

---

**Version**: 1.0
**Created**: 2024-12-19
**Author**: AegisX Platform Team
**Status**: APPROVED - Ready for Implementation
