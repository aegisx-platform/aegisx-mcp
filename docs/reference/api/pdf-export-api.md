---
title: 'PDF Export API'
description: 'PDF export API reference and implementation guide with charts integration'
category: reference
tags: [api, pdf-export, backend, charts]
---

# PDF Export API Guide

## Overview

Complete guide for implementing PDF export functionality with TypeBox validation, dynamic table generation, and integrated charts support. Generate professional reports with customizable layouts, charts, and data formatting.

## Key Features

- **Dynamic Table Generation**: Automatic table rendering from data arrays
- **Charts Integration**: Embed bar, line, pie, and doughnut charts
- **Type-Safe Schemas**: Full TypeBox validation for all requests
- **Customizable Layout**: Flexible positioning, alignment, and margins
- **Multi-Language Support**: Support for Thai and other languages
- **Professional Styling**: Automatic pagination, headers, and footers

## Core Interfaces

### PdfExportOptions (Main Request)

```typescript
interface PdfExportOptions {
  // Title and basic info
  title: string; // Report title (required)
  subtitle?: string; // Optional subtitle
  description?: string; // Report description

  // Data configuration
  data: Record<string, any>[]; // Array of data rows (required)
  fields: Array<{
    name: string; // Data field name
    label: string; // Display label
    format?: string; // Format type: 'number', 'date', 'currency', 'percent'
    width?: number; // Column width in percentage
    align?: 'left' | 'center' | 'right'; // Text alignment
  }>;

  // Layout options
  orientation?: 'portrait' | 'landscape'; // Default: 'portrait'
  pageSize?: 'A4' | 'A3' | 'letter'; // Default: 'A4'
  margins?: [number, number, number, number]; // [top, right, bottom, left] in mm

  // Charts configuration
  charts?: PdfChartConfig[]; // Array of chart configurations

  // Styling options
  theme?: 'light' | 'dark'; // Color theme
  colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  fontSize?: number; // Base font size (default: 11)
  fontFamily?: string; // Font family (default: 'THSarabun')

  // Additional options
  includeFooter?: boolean; // Default: true
  includePageNumbers?: boolean; // Default: true
  generatedBy?: string; // Footer text
  timestamp?: boolean; // Include generation timestamp
}
```

### PdfChartConfig Interface

```typescript
interface PdfChartConfig {
  // Chart type and data
  type: ChartType; // 'bar' | 'line' | 'pie' | 'doughnut'
  data: ChartData; // Chart data
  options?: ChartOptions; // Chart customization

  // Positioning
  position: 'before' | 'after' | 'top' | 'bottom';

  // Dimensions
  width?: number; // Default: 500 (pixels)
  height?: number; // Default: 300 (pixels)

  // Styling
  alignment?: 'left' | 'center' | 'right'; // Default: 'center'
  margin?: [number, number, number, number]; // [top, right, bottom, left]
}
```

### ChartData Interface

```typescript
interface ChartData {
  labels: string[]; // X-axis labels
  datasets: Array<{
    label: string; // Dataset label
    data: number[]; // Data values
    backgroundColor?: string | string[]; // Bar/pie colors
    borderColor?: string | string[]; // Border colors
    borderWidth?: number; // Border width
  }>;
}
```

### ChartOptions Interface

```typescript
interface ChartOptions {
  title?: string; // Chart title
  displayValues?: boolean; // Show values on bars/slices
  showLegend?: boolean; // Show legend
  showGridLines?: boolean; // Show grid (bar/line charts)
  colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  responsive?: boolean; // Responsive sizing
  maintainAspectRatio?: boolean; // Maintain aspect ratio
}
```

## Charts Integration

### Chart Positioning

The `position` field controls where the chart appears in the document:

- **`top`** - Chart appears before title (ideal for header information)
- **`before`** - Chart appears after title, before table (recommended)
- **`after`** - Chart appears immediately after table (recommended)
- **`bottom`** - Chart appears at end of document (after footer)

### Supported Chart Types

| Type       | Use Case                     | Best For                                  |
| ---------- | ---------------------------- | ----------------------------------------- |
| `bar`      | Comparing categorical values | Budget categories, inventory by location  |
| `line`     | Showing trends over time     | Monthly reports, trend analysis           |
| `pie`      | Showing proportions of whole | Market share, category distribution       |
| `doughnut` | Proportions with center info | Department distribution, source breakdown |

### Dimension Constraints

| Property              | Min   | Max    | Default |
| --------------------- | ----- | ------ | ------- |
| Width                 | 100px | 2000px | 500px   |
| Height                | 100px | 1500px | 300px   |
| Charts per PDF        | 1     | 10     | -       |
| Data points per chart | 1     | 100    | -       |

### Color Schemes

```typescript
type ColorScheme = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

// Color mappings:
// 'primary'   → Blue (#0066cc)
// 'secondary' → Gray (#666666)
// 'success'   → Green (#28a745)
// 'warning'   → Yellow (#ffc107)
// 'danger'    → Red (#dc3545)
```

### Multi-Chart Positioning Strategy

When using multiple charts, they are rendered in order:

```typescript
charts: [
  { type: 'bar', position: 'top', ... },       // Chart 1: Appears at top
  { type: 'pie', position: 'before', ... },    // Chart 2: Before table
  { type: 'line', position: 'after', ... }     // Chart 3: After table
]
```

Charts with the same position are rendered sequentially.

## TypeBox Schema Reference

### PDF Export Request Schema

```typescript
const PdfExportRequestSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 }),
  subtitle: Type.Optional(Type.String({ maxLength: 200 })),
  description: Type.Optional(Type.String({ maxLength: 500 })),

  data: Type.Array(Type.Record(Type.String(), Type.Any()), {
    minItems: 1,
    maxItems: 10000,
  }),

  fields: Type.Array(
    Type.Object({
      name: Type.String({ minLength: 1 }),
      label: Type.String({ minLength: 1 }),
      format: Type.Optional(Type.Enum(['number', 'date', 'currency', 'percent'])),
      width: Type.Optional(Type.Number({ minimum: 5, maximum: 50 })),
      align: Type.Optional(Type.Enum(['left', 'center', 'right'])),
    }),
    {
      minItems: 1,
      maxItems: 50,
    },
  ),

  charts: Type.Optional(
    Type.Array(PdfChartConfigSchema, {
      minItems: 1,
      maxItems: 10,
    }),
  ),

  orientation: Type.Optional(Type.Enum(['portrait', 'landscape'])),
  pageSize: Type.Optional(Type.Enum(['A4', 'A3', 'letter'])),
  margins: Type.Optional(Type.Tuple([Type.Number(), Type.Number(), Type.Number(), Type.Number()])),

  theme: Type.Optional(Type.Enum(['light', 'dark'])),
  colorScheme: Type.Optional(Type.Enum(['primary', 'secondary', 'success', 'warning', 'danger'])),
  fontSize: Type.Optional(Type.Number({ minimum: 8, maximum: 24 })),
  fontFamily: Type.Optional(Type.String()),

  includeFooter: Type.Optional(Type.Boolean()),
  includePageNumbers: Type.Optional(Type.Boolean()),
  generatedBy: Type.Optional(Type.String({ maxLength: 100 })),
  timestamp: Type.Optional(Type.Boolean()),
});
```

## Usage Examples

### Example 1: Basic Report with Data

```typescript
const pdf = await pdfService.generatePdf({
  title: 'รายงานยาคงคลัง',
  subtitle: 'ประจำเดือน กันยายน 2567',

  data: [
    { drugName: 'พาราเซตามอล', quantity: 500, value: 15000 },
    { drugName: 'แอมพิซิลลิน', quantity: 300, value: 9000 },
    { drugName: 'อมอกซิซิลลิน', quantity: 450, value: 22500 },
  ],

  fields: [
    { name: 'drugName', label: 'ชื่อยา', width: 40 },
    { name: 'quantity', label: 'จำนวน', width: 30, align: 'center', format: 'number' },
    { name: 'value', label: 'มูลค่า (บาท)', width: 30, align: 'right', format: 'currency' },
  ],
});
```

### Example 2: Report with Single Chart

```typescript
const pdf = await pdfService.generatePdf({
  title: 'รายงานยาคงคลัง',
  data: inventoryData,
  fields: stockFields,

  charts: [
    {
      type: 'bar',
      position: 'before',
      width: 600,
      height: 350,
      alignment: 'center',

      data: {
        labels: ['คลังหลัก', 'คลังย่อย A', 'คลังย่อย B'],
        datasets: [
          {
            label: 'มูลค่ายาคงคลัง',
            data: [80000, 50000, 30000],
            backgroundColor: ['#0066cc', '#28a745', '#ffc107'],
          },
        ],
      },

      options: {
        title: 'มูลค่ายาคงคลังแยกตามคลัง',
        displayValues: true,
        showLegend: true,
      },
    },
  ],
});
```

### Example 3: Report with Multiple Charts

```typescript
const pdf = await pdfService.generatePdf({
  title: 'รายงานการใช้ยาประจำเดือน',
  data: usageData,
  fields: usageFields,

  charts: [
    {
      type: 'bar',
      position: 'before',
      data: {
        labels: ['ยาแกง', 'ยาฉีด', 'ยาประคบ', 'ยาเทศ'],
        datasets: [
          {
            label: 'การใช้ยา (ยา)',
            data: [450, 320, 180, 90],
          },
        ],
      },
    },
    {
      type: 'pie',
      position: 'after',
      width: 450,
      height: 450,
      data: {
        labels: ['ยาแกง', 'ยาฉีด', 'ยาประคบ', 'ยาเทศ'],
        datasets: [
          {
            label: 'สัดส่วนการใช้',
            data: [45, 32, 18, 5],
            backgroundColor: ['#0066cc', '#28a745', '#ffc107', '#dc3545'],
          },
        ],
      },
      options: {
        title: 'สัดส่วนการใช้ยาแยกตามประเภท',
        displayValues: true,
      },
    },
  ],
});
```

### Example 4: Advanced Chart with Styling

```typescript
const pdf = await pdfService.generatePdf({
  title: 'รายงานผลทำกำไร',
  data: profitData,
  fields: profitFields,
  theme: 'light',
  colorScheme: 'success',

  charts: [
    {
      type: 'line',
      position: 'after',
      width: 700,
      height: 400,
      alignment: 'center',
      margin: [20, 10, 20, 10],

      data: {
        labels: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม'],
        datasets: [
          {
            label: 'รายได้',
            data: [150000, 165000, 180000, 195000, 210000],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
          },
          {
            label: 'ค่าใช้จ่าย',
            data: [100000, 105000, 110000, 115000, 120000],
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
          },
        ],
      },

      options: {
        title: 'แนวโน้มรายได้และค่าใช้จ่าย (5 เดือน)',
        showGridLines: true,
        displayValues: false,
        showLegend: true,
      },
    },
  ],
});
```

## Validation Rules

### Chart-Specific Rules

1. **Dimension Constraints**:
   - Width must be between 100-2000 pixels
   - Height must be between 100-1500 pixels
   - Aspect ratio should be between 1:3 and 3:1

2. **Data Point Limits**:
   - Maximum 100 data points per dataset
   - Maximum 50 datasets per chart
   - All datasets must have same number of labels

3. **Chart Count**:
   - Maximum 10 charts per PDF
   - Charts are rendered in order specified

4. **Chart Type**:
   - Must be one of: 'bar', 'line', 'pie', 'doughnut'
   - Type determines positioning constraints

### Table Data Rules

1. **Data Limits**:
   - Minimum 1 row, Maximum 10,000 rows
   - Minimum 1 field, Maximum 50 fields
   - Each field name must be unique

2. **Field Configuration**:
   - `name` must match data object keys
   - `width` must be between 5-50 (percentage)
   - `format` must be valid (number, date, currency, percent)

3. **Data Types**:
   - String fields support any text
   - Number fields automatically formatted based on format type
   - Date fields should be ISO 8601 format

## Error Handling

### Common Error Scenarios

```typescript
try {
  const pdf = await pdfService.generatePdf(options);
} catch (error) {
  // Invalid chart type
  if (error.message.includes('Invalid chart type')) {
    // Handle: Unknown chart type provided
  }

  // Dimension out of range
  if (error.message.includes('Chart dimensions out of range')) {
    // Handle: Width/height outside allowed range
  }

  // Too many charts
  if (error.message.includes('Maximum 10 charts')) {
    // Handle: More than 10 charts requested
  }

  // Too many data points
  if (error.message.includes('Maximum 100 data points')) {
    // Handle: Chart dataset exceeds 100 points
  }

  // Invalid field names
  if (error.message.includes('Field name not found')) {
    // Handle: Field.name doesn't exist in data
  }

  // Missing required fields
  if (error.message.includes('Required field missing')) {
    // Handle: Missing title, data, or fields
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "PDF_EXPORT_ERROR",
    "message": "Chart dimensions out of range: width must be 100-2000px",
    "details": {
      "field": "charts[0].width",
      "value": 2500,
      "constraint": "100-2000"
    }
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-09-22T10:30:00.000Z"
  }
}
```

## Response Format

### Successful PDF Generation Response

```json
{
  "success": true,
  "data": {
    "id": "pdf-550e8400-e29b-41d4-a716-446655440000",
    "filename": "รายงานยาคงคลัง-2025-09-22.pdf",
    "mimeType": "application/pdf",
    "fileSize": 125000,
    "pages": 3,
    "downloadUrl": "/api/pdf/550e8400-e29b-41d4-a716-446655440000/download",
    "previewUrl": "/api/pdf/550e8400-e29b-41d4-a716-446655440000/preview",
    "expiresAt": "2025-09-25T10:30:00.000Z"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-09-22T10:30:00.000Z",
    "version": "1.0"
  }
}
```

## Best Practices

### 1. Chart Positioning Strategy

```typescript
// Recommended: One summary chart before, detailed charts after
charts: [
  { type: 'pie', position: 'before', ... },      // Overview
  { type: 'bar', position: 'after', ... },       // Details by category
  { type: 'line', position: 'after', ... }       // Trends
]
```

### 2. Data Formatting

```typescript
// Always use correct format types for better display
fields: [
  { name: 'name', label: 'ชื่อ', format: undefined },
  { name: 'quantity', label: 'จำนวน', format: 'number' },
  { name: 'price', label: 'ราคา', format: 'currency' },
  { name: 'percentage', label: 'สัดส่วน %', format: 'percent' },
  { name: 'createdAt', label: 'วันสร้าง', format: 'date' },
];
```

### 3. Color Selection

```typescript
// Use colorScheme for consistent theming
const options = {
  colorScheme: 'success', // Green theme for positive reports

  charts: [
    {
      data: {
        datasets: [
          {
            // Option 1: Use colorScheme (automatic)
            // Option 2: Explicit colors override colorScheme
            backgroundColor: ['#28a745', '#20c997', '#198754'],
          },
        ],
      },
    },
  ],
};
```

### 4. Responsive Sizing

```typescript
// Adapt dimensions based on device/context
const isMobile = window.innerWidth < 768;
const chartWidth = isMobile ? 400 : 600;

const pdf = await pdfService.generatePdf({
  charts: [
    {
      width: chartWidth,
      height: Math.round(chartWidth * 0.6), // 60% height
      options: {
        responsive: true,
        maintainAspectRatio: true,
      },
    },
  ],
});
```

## Performance Considerations

### Optimization Tips

1. **Data Size**:
   - Keep rows under 1000 per PDF for better performance
   - Use pagination for larger datasets

2. **Chart Complexity**:
   - Limit to maximum 50 data points per chart
   - Use simpler chart types (bar, line) for large datasets

3. **PDF Generation Time**:
   - Baseline: ~500ms for simple report
   - Add ~100ms per chart
   - Add ~50ms per 1000 data rows

### Caching Strategy

```typescript
// Cache generated PDFs for repeated requests
const cacheKey = `pdf:${crypto.md5(JSON.stringify(options))}`;
const cached = await cache.get(cacheKey);

if (cached) {
  return cached; // Return within 10ms
}

const pdf = await pdfService.generatePdf(options);
await cache.set(cacheKey, pdf, { ttl: 3600 }); // Cache 1 hour
```

## Related Files

- `apps/api/src/modules/pdf-export/pdf-export.routes.ts` - Route definitions
- `apps/api/src/modules/pdf-export/pdf-export.controller.ts` - Request handling
- `apps/api/src/modules/pdf-export/pdf-export.service.ts` - Core PDF generation
- `apps/api/src/modules/pdf-export/pdf-export.schemas.ts` - TypeBox schemas
- `apps/web/src/app/shared/components/pdf-export/pdf-export.service.ts` - Frontend service

## Troubleshooting

### Common Issues

1. **Chart not appearing in PDF**
   - Verify `position` is valid
   - Check data array is not empty
   - Ensure chart type is supported

2. **Invalid dimensions error**
   - Width/height outside 100-2000/100-1500 range
   - Verify pixel values, not percentages

3. **Font issues with Thai text**
   - Use `fontFamily: 'THSarabun'` (default)
   - Ensure Thai font is properly installed

4. **PDF too large**
   - Reduce number of rows
   - Reduce chart resolution
   - Consider pagination

5. **Timeout on large PDFs**
   - Default timeout: 30 seconds
   - For large reports, implement chunking
   - Use pagination for datasets > 5000 rows
