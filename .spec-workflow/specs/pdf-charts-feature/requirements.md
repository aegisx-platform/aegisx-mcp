# PDF Charts Feature - Requirements Document

## 📋 Overview

**Feature**: Server-side Chart Generation for PDF Reports
**Domain**: Core Services (PDF Export)
**Priority**: HIGH
**Target**: Inventory Reports, Analytics Reports, Executive Dashboards
**Status**: PLANNING

---

## 🎯 Business Requirements

### BR-1: Visual Analytics in PDF Reports

**As a** Hospital Administrator
**I want** charts and graphs embedded in PDF reports
**So that** I can visualize trends and patterns without switching to the dashboard

**Acceptance Criteria**:

- ✅ Charts appear in PDF exports alongside tables
- ✅ Charts are high-quality and printable
- ✅ Charts support Thai language labels
- ✅ Charts match the visual theme of the dashboard

### BR-2: Executive Summary Reports

**As a** Department Head
**I want** monthly summary reports with visual analytics
**So that** I can quickly understand key metrics without reading raw data

**Acceptance Criteria**:

- ✅ Summary reports include KPI charts
- ✅ Charts show comparative data (current vs previous period)
- ✅ Charts are positioned before detailed tables
- ✅ Reports are professional and presentation-ready

### BR-3: Inventory Analytics

**As a** Pharmacy Manager
**I want** inventory reports with stock trend charts
**So that** I can identify usage patterns and optimize stock levels

**Acceptance Criteria**:

- ✅ Stock level bar charts by location
- ✅ Usage trend line charts over time
- ✅ Budget distribution pie charts
- ✅ Expiry timeline visualizations

### BR-4: Multi-Chart Reports

**As a** Report User
**I want** multiple charts in a single PDF report
**So that** I can analyze different aspects of the data in one document

**Acceptance Criteria**:

- ✅ Support multiple charts per report
- ✅ Charts can be positioned before or after tables
- ✅ Each chart has independent configuration
- ✅ Charts are properly paginated

---

## 📊 Functional Requirements

### FR-1: Chart Types Support

**Priority**: HIGH

**Requirements**:

- REQ-1.1: Bar Chart - Vertical bars for comparing values across categories
- REQ-1.2: Line Chart - Trends over time with multiple series support
- REQ-1.3: Pie Chart - Percentage distribution with labels
- REQ-1.4: Doughnut Chart - Similar to pie with center hollow
- REQ-1.5: (Future) Radar Chart - Multi-dimensional data comparison
- REQ-1.6: (Future) Polar Area Chart - Circular bar chart

**Supported Chart Types (Phase 1)**:

```typescript
type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';
```

### FR-2: Chart Configuration

**Priority**: HIGH

**Requirements**:

- REQ-2.1: **Title & Subtitle** - Chart heading and description
- REQ-2.2: **Data Labels** - Category names for X-axis
- REQ-2.3: **Data Values** - Numeric values for Y-axis
- REQ-2.4: **Color Scheme** - Predefined or custom colors
- REQ-2.5: **Legend** - Show/hide legend with position control
- REQ-2.6: **Grid Lines** - Show/hide grid for better readability
- REQ-2.7: **Value Display** - Show values on chart elements

**Configuration Interface**:

```typescript
interface ChartOptions {
  title?: string;
  subtitle?: string;
  width?: number; // Default: 800px
  height?: number; // Default: 400px
  colorScheme?: 'primary' | 'success' | 'warning' | 'mixed' | string[];
  showLegend?: boolean; // Default: true
  showGrid?: boolean; // Default: true
  displayValues?: boolean; // Default: false
}
```

### FR-3: Chart Positioning

**Priority**: MEDIUM

**Requirements**:

- REQ-3.1: **Top Position** - Chart appears before title
- REQ-3.2: **Before Position** - Chart appears after title, before table
- REQ-3.3: **After Position** - Chart appears after table
- REQ-3.4: **Bottom Position** - Chart appears at end of document

**Position Options**:

```typescript
type ChartPosition = 'top' | 'before' | 'after' | 'bottom';
```

### FR-4: Chart Data Binding

**Priority**: HIGH

**Requirements**:

- REQ-4.1: Support array of labels (X-axis categories)
- REQ-4.2: Support single or multiple datasets
- REQ-4.3: Auto-format numbers with locale (1,000.00)
- REQ-4.4: Support Thai language labels
- REQ-4.5: Calculate percentages for pie charts

**Data Structure**:

```typescript
interface ChartData {
  labels: string[]; // ['Pharmacy', 'Ward A', 'Ward B']
  datasets: Array<{
    label?: string; // 'Stock Value'
    data: number[]; // [80000, 50000, 30000]
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }>;
}
```

### FR-5: Integration with Existing PDF System

**Priority**: HIGH

**Requirements**:

- REQ-5.1: Extend `PdfExportOptions` interface
- REQ-5.2: Maintain backward compatibility
- REQ-5.3: Support templates (professional, minimal, standard)
- REQ-5.4: Work with Thai font (Sarabun)
- REQ-5.5: Support page orientation (portrait/landscape)

**Integration**:

```typescript
interface PdfExportOptions {
  // ... existing fields
  charts?: PdfChartConfig[]; // NEW: Chart support
}

interface PdfChartConfig {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  position: ChartPosition;
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
  margin?: [number, number, number, number];
}
```

---

## 🔧 Non-Functional Requirements

### NFR-1: Performance

**Requirements**:

- NFR-1.1: Chart generation < 500ms per chart
- NFR-1.2: PDF with 5 charts < 3 seconds total
- NFR-1.3: Support up to 10 charts per PDF
- NFR-1.4: Memory efficient (< 100MB for large reports)

### NFR-2: Quality

**Requirements**:

- NFR-2.1: Charts rendered at 300 DPI (print quality)
- NFR-2.2: PNG format with white background
- NFR-2.3: Anti-aliased text and shapes
- NFR-2.4: Proper aspect ratio maintained

### NFR-3: Compatibility

**Requirements**:

- NFR-3.1: Compatible with all PDF viewers
- NFR-3.2: Charts work in portrait and landscape
- NFR-3.3: Charts scale properly on different page sizes
- NFR-3.4: Thai fonts render correctly in chart labels

### NFR-4: Maintainability

**Requirements**:

- NFR-4.1: Separate ChartService for reusability
- NFR-4.2: Type-safe interfaces
- NFR-4.3: Comprehensive error handling
- NFR-4.4: Logging for debugging

---

## 📦 Dependencies

### External Libraries

| Library               | Version | Purpose                     | License |
| --------------------- | ------- | --------------------------- | ------- |
| `chartjs-node-canvas` | ^5.0.0  | Server-side chart rendering | MIT     |
| `chart.js`            | ^4.x    | Chart.js core library       | MIT     |

**Installation**:

```bash
pnpm add chartjs-node-canvas chart.js
```

### Internal Dependencies

- ✅ `PDFMakeService` - Existing PDF generation service
- ✅ `FontManagerService` - Thai font support
- ✅ `pdfmake` - PDF creation library

---

## 🎨 Use Cases

### UC-1: Stock Level Report with Bar Chart

**Actor**: Pharmacy Manager
**Goal**: Generate PDF report showing stock levels by location

**Flow**:

1. User selects "Export Stock Report with Charts"
2. System generates bar chart of stock values
3. System generates table of detailed data
4. System combines chart + table in PDF
5. User downloads PDF

**Example**:

```typescript
const stockReport = await pdfService.generatePdf({
  title: 'รายงานยาคงคลัง - มกราคม 2568',
  data: inventoryData,
  fields: stockFields,
  charts: [
    {
      type: 'bar',
      position: 'before',
      data: {
        labels: ['คลังหลัก', 'คลังย่อย A', 'คลังย่อย B'],
        datasets: [
          {
            label: 'มูลค่ายาคงคลัง (บาท)',
            data: [80000, 50000, 30000],
          },
        ],
      },
      options: {
        title: 'มูลค่ายาคงคลังแยกตามคลัง',
        colorScheme: 'primary',
        displayValues: true,
      },
    },
  ],
});
```

### UC-2: Monthly Usage Trend with Line Chart

**Actor**: Department Head
**Goal**: View drug usage trends over 6 months

**Example**:

```typescript
const trendReport = await pdfService.generatePdf({
  title: 'แนวโน้มการใช้ยา - 6 เดือน',
  charts: [
    {
      type: 'line',
      position: 'before',
      data: {
        labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
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
        title: 'แนวโน้มการใช้ยา',
        colorScheme: ['#3b82f6', '#10b981'],
      },
    },
  ],
});
```

### UC-3: Budget Distribution with Pie Chart

**Actor**: Finance Manager
**Goal**: Visualize budget allocation across categories

**Example**:

```typescript
const budgetReport = await pdfService.generatePdf({
  title: 'การจัดสรรงบประมาณ Q1',
  charts: [
    {
      type: 'pie',
      position: 'before',
      data: {
        labels: ['จัดซื้อ', 'จ่ายยา', 'คืนยา', 'ปรับปรุง'],
        datasets: [
          {
            data: [40, 30, 20, 10],
          },
        ],
      },
      options: {
        title: 'สัดส่วนการใช้งบประมาณ',
        colorScheme: 'mixed',
        displayValues: true,
      },
    },
  ],
});
```

### UC-4: Multi-Chart Executive Summary

**Actor**: Hospital Director
**Goal**: Comprehensive monthly report with multiple visualizations

**Example**:

```typescript
const executiveReport = await pdfService.generatePdf({
  title: 'รายงานสรุปผู้บริหาร - มกราคม 2568',
  subtitle: 'ระบบบริหารจัดการยา',
  charts: [
    {
      type: 'bar',
      position: 'before',
      data: {
        /* stock by location */
      },
      options: { title: 'มูลค่ายาคงคลัง' },
    },
    {
      type: 'line',
      position: 'before',
      data: {
        /* usage trend */
      },
      options: { title: 'แนวโน้มการใช้ยา' },
    },
    {
      type: 'pie',
      position: 'after',
      data: {
        /* budget distribution */
      },
      options: { title: 'การใช้งบประมาณ' },
    },
  ],
  data: summaryData,
  fields: summaryFields,
});
```

---

## 🚫 Out of Scope (Phase 1)

1. **Interactive Charts** - PDF charts are static images
2. **Real-time Data** - Charts use snapshot data at generation time
3. **Chart Animations** - Server-side rendering has no animations
4. **Custom Chart Types** - Only predefined types supported
5. **Chart Export Separately** - Charts only embedded in PDFs
6. **Advanced Chart.js Features** - Mixed chart types, stacked bars, etc.
7. **Chart Templates** - Predefined chart configurations (future)

---

## ✅ Acceptance Criteria (Overall)

### Phase 1 Completion Criteria:

1. ✅ All 4 chart types (bar, line, pie, doughnut) working
2. ✅ Charts embed in PDFs before/after tables
3. ✅ Thai language support in chart labels
4. ✅ Color schemes (primary, success, warning, mixed)
5. ✅ Title, subtitle, legend support
6. ✅ Value display on charts (optional)
7. ✅ PDF generation < 3 seconds with 5 charts
8. ✅ Print quality (300 DPI)
9. ✅ Example inventory reports documented
10. ✅ Unit tests for ChartService
11. ✅ Integration tests with PDFMakeService
12. ✅ API documentation updated

---

## 📈 Success Metrics

### Quantitative Metrics:

- Chart generation time < 500ms
- PDF export with charts < 3 seconds
- 80%+ test coverage
- Zero crashes in production

### Qualitative Metrics:

- User satisfaction with chart quality
- Reduced need for manual chart creation
- Improved executive report adoption
- Positive feedback from department heads

---

## 🔄 Future Enhancements (Phase 2+)

1. **Radar Charts** - Multi-dimensional data comparison
2. **Stacked Bar Charts** - Cumulative data visualization
3. **Mixed Charts** - Combine bar and line in one chart
4. **Chart Templates** - Pre-configured charts for common reports
5. **Dynamic Data Binding** - Auto-generate charts from table data
6. **Conditional Formatting** - Color rules based on thresholds
7. **Chart Export API** - Standalone chart generation endpoint
8. **Responsive Charts** - Auto-resize based on page size

---

**Version**: 1.0
**Created**: 2024-12-19
**Author**: AegisX Platform Team
**Status**: APPROVED - Ready for Design Phase
