# PDF Charts Feature - Implementation Tasks

## 📋 Overview

**Feature**: Server-side Chart Generation for PDF Reports
**Status**: PLANNING
**Sprint**: TBD
**Estimated Effort**: 8-12 hours

---

## 🎯 Implementation Phases

### Phase 1: Foundation (2-3 hours)

**Goal**: Set up chart generation infrastructure

### Phase 2: Integration (2-3 hours)

**Goal**: Integrate charts with PDFMakeService

### Phase 3: Testing (2-3 hours)

**Goal**: Comprehensive testing and validation

### Phase 4: Documentation (1-2 hours)

**Goal**: Complete documentation and examples

---

## 📝 Detailed Tasks

### Phase 1: Foundation

#### Task 1.1: Verify Dependencies

**Priority**: HIGH
**Estimated Time**: 15 minutes

**Acceptance Criteria**:

- [ ] `chartjs-node-canvas` installed and verified
- [ ] `chart.js` installed and verified
- [ ] Dependencies work in Node.js environment
- [ ] No version conflicts with existing packages

**Steps**:

```bash
# Check package.json
pnpm list chartjs-node-canvas
pnpm list chart.js

# Test import
node -e "const { ChartJSNodeCanvas } = require('chartjs-node-canvas'); console.log('OK')"
```

---

#### Task 1.2: Create ChartService

**Priority**: HIGH
**Estimated Time**: 1.5 hours

**Files**:

- `apps/api/src/services/chart.service.ts`

**Acceptance Criteria**:

- [ ] ChartService class created
- [ ] Color schemes defined (primary, success, warning, danger, info, purple, mixed)
- [ ] `generateBarChart()` implemented
- [ ] `generateLineChart()` implemented
- [ ] `generatePieChart()` implemented
- [ ] `generateDoughnutChart()` implemented
- [ ] `generateChart()` generic method implemented
- [ ] Helper methods implemented:
  - [ ] `getColors()`
  - [ ] `darkenColor()`
  - [ ] `transparentize()`
- [ ] Thai language support verified
- [ ] All methods properly typed with TypeScript

**Validation**:

```bash
# Compile TypeScript
pnpm run build

# No type errors
```

---

#### Task 1.3: Create Chart Service Tests

**Priority**: HIGH
**Estimated Time**: 1 hour

**Files**:

- `apps/api/src/services/chart.service.spec.ts`

**Acceptance Criteria**:

- [ ] Unit tests for `generateBarChart()`
- [ ] Unit tests for `generateLineChart()`
- [ ] Unit tests for `generatePieChart()`
- [ ] Unit tests for `generateDoughnutChart()`
- [ ] Test color scheme application
- [ ] Test value display (displayValues option)
- [ ] Test Thai language labels
- [ ] All tests passing

**Test Cases**:

```typescript
describe('ChartService', () => {
  it('should generate bar chart with correct dimensions');
  it('should apply color scheme correctly');
  it('should display values when displayValues is true');
  it('should handle Thai language labels');
  it('should throw error for invalid chart type');
});
```

**Validation**:

```bash
pnpm run test:api -- chart.service.spec
```

---

### Phase 2: Integration

#### Task 2.1: Enhance PDFMakeService Interfaces

**Priority**: HIGH
**Estimated Time**: 30 minutes

**Files**:

- `apps/api/src/services/pdfmake.service.ts`

**Acceptance Criteria**:

- [ ] `PdfChartConfig` interface created
- [ ] `PdfExportOptions` interface updated with `charts?: PdfChartConfig[]`
- [ ] All existing code still compiles
- [ ] Backward compatibility maintained

**Changes**:

```typescript
export interface PdfChartConfig {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  position: 'before' | 'after' | 'top' | 'bottom';
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
  margin?: [number, number, number, number];
}

export interface PdfExportOptions {
  // ... existing fields
  charts?: PdfChartConfig[];
}
```

**Validation**:

```bash
pnpm run build
```

---

#### Task 2.2: Implement Chart Element Creation

**Priority**: HIGH
**Estimated Time**: 1 hour

**Files**:

- `apps/api/src/services/pdfmake.service.ts`

**Acceptance Criteria**:

- [ ] ChartService injected into PDFMakeService constructor
- [ ] `createChartElement()` method implemented
- [ ] PNG buffer to base64 conversion working
- [ ] PDFMake image element structure correct
- [ ] Width, height, alignment, margin properly applied

**Implementation**:

```typescript
private async createChartElement(config: PdfChartConfig): Promise<any> {
  // 1. Generate chart as PNG buffer
  const chartBuffer = await this.chartService.generateChart(
    config.type,
    config.data,
    config.options
  );

  // 2. Convert to base64
  const base64Image = chartBuffer.toString('base64');

  // 3. Create PDFMake image element
  return {
    image: `data:image/png;base64,${base64Image}`,
    width: config.width || 500,
    height: config.height || 300,
    alignment: config.alignment || 'center',
    margin: config.margin || [0, 10, 0, 20]
  };
}
```

**Validation**:

- Generate single chart
- Verify base64 string format
- Check PDFMake accepts the image object

---

#### Task 2.3: Update Document Definition Creation

**Priority**: HIGH
**Estimated Time**: 1 hour

**Files**:

- `apps/api/src/services/pdfmake.service.ts`

**Acceptance Criteria**:

- [ ] `createDocumentDefinition()` changed to async
- [ ] Charts positioned at 'top' or 'before' added before table
- [ ] Charts positioned at 'after' or 'bottom' added after table
- [ ] Charts maintain proper order
- [ ] Existing PDF generation still works (backward compatibility)

**Implementation**:

```typescript
private async createDocumentDefinition(options: PdfExportOptions): Promise<any> {
  const { charts = [] } = options;
  const content: any[] = [];

  // Add title
  content.push(this.createTitleSection(title, subtitle));

  // Add charts at 'top' or 'before' position
  const topCharts = charts.filter(c => c.position === 'top' || c.position === 'before');
  for (const chartConfig of topCharts) {
    const chartElement = await this.createChartElement(chartConfig);
    content.push(chartElement);
  }

  // Add table
  if (data && data.length > 0) {
    content.push(this.createDataTable(data, fields));
  }

  // Add charts at 'after' or 'bottom' position
  const bottomCharts = charts.filter(c => c.position === 'after' || c.position === 'bottom');
  for (const chartConfig of bottomCharts) {
    const chartElement = await this.createChartElement(chartConfig);
    content.push(chartElement);
  }

  return docDefinition;
}
```

**Validation**:

- Generate PDF with chart before table
- Generate PDF with chart after table
- Generate PDF with multiple charts
- Generate PDF without charts (backward compatibility)

---

#### Task 2.4: Update generatePdf Method

**Priority**: HIGH
**Estimated Time**: 30 minutes

**Files**:

- `apps/api/src/services/pdfmake.service.ts`

**Acceptance Criteria**:

- [ ] `generatePdf()` method properly awaits async `createDocumentDefinition()`
- [ ] Error handling for chart generation failures
- [ ] Fallback to PDF without charts on error
- [ ] Logging for debugging

**Implementation**:

```typescript
async generatePdf(options: PdfExportOptions): Promise<Buffer> {
  try {
    await this.waitForFonts();

    // Validate chart configurations
    if (options.charts && options.charts.length > 0) {
      this.validateChartConfigs(options.charts);
    }

    // Create document with charts
    const docDefinition = await this.createDocumentDefinition(options);

    // Generate PDF
    return await this.renderPdf(docDefinition);

  } catch (error) {
    console.error('PDF generation with charts failed:', error);

    // Fallback: Try without charts
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

#### Task 2.5: Add Validation

**Priority**: MEDIUM
**Estimated Time**: 30 minutes

**Files**:

- `apps/api/src/services/pdfmake.service.ts`

**Acceptance Criteria**:

- [ ] `validateChartConfigs()` method implemented
- [ ] Chart type validation
- [ ] Data structure validation
- [ ] Dimension limits enforced (width: 100-2000, height: 100-1500)
- [ ] Maximum charts per PDF (10)
- [ ] Maximum data points per chart (100)

**Implementation**:

```typescript
private validateChartConfigs(charts: PdfChartConfig[]): void {
  // Limit number of charts
  if (charts.length > 10) {
    throw new Error('Maximum 10 charts allowed per PDF');
  }

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

    if (chart.height && (chart.height < 100 || chart.height > 1500)) {
      throw new Error('Chart height must be between 100 and 1500');
    }

    // Limit data points
    if (chart.data.labels.length > 100) {
      throw new Error('Maximum 100 data points per chart');
    }
  }
}
```

---

### Phase 3: Testing

#### Task 3.1: Integration Tests

**Priority**: HIGH
**Estimated Time**: 1.5 hours

**Files**:

- `apps/api/src/services/pdfmake.service.spec.ts` (update existing)
- `apps/api/tests/integration/pdf-charts.integration.spec.ts` (new)

**Acceptance Criteria**:

- [ ] Test PDF with single bar chart
- [ ] Test PDF with single line chart
- [ ] Test PDF with single pie chart
- [ ] Test PDF with multiple charts
- [ ] Test chart positioning (before, after, top, bottom)
- [ ] Test backward compatibility (PDF without charts)
- [ ] Test Thai language in chart labels
- [ ] Test error handling (invalid chart config)
- [ ] All tests passing

**Test Cases**:

```typescript
describe('PDFMakeService with Charts', () => {
  it('should generate PDF with bar chart before table');
  it('should generate PDF with pie chart after table');
  it('should generate PDF with multiple charts');
  it('should handle Thai language labels in charts');
  it('should maintain backward compatibility without charts');
  it('should throw error for invalid chart type');
  it('should enforce chart dimension limits');
  it('should enforce maximum charts per PDF');
});
```

**Validation**:

```bash
pnpm run test:api
```

---

#### Task 3.2: Performance Testing

**Priority**: MEDIUM
**Estimated Time**: 1 hour

**Files**:

- `apps/api/tests/performance/chart-performance.spec.ts`

**Acceptance Criteria**:

- [ ] Chart generation < 500ms per chart
- [ ] PDF with 5 charts < 3 seconds
- [ ] Memory usage < 100MB for large reports
- [ ] Performance benchmarks documented

**Test Cases**:

```typescript
describe('Performance', () => {
  it('should generate single chart in under 500ms');
  it('should generate PDF with 5 charts in under 3 seconds');
  it('should handle 100 data points without performance degradation');
});
```

**Validation**:

```bash
pnpm run test:performance
```

---

#### Task 3.3: Manual Testing with Real Data

**Priority**: HIGH
**Estimated Time**: 1 hour

**Acceptance Criteria**:

- [ ] Generate inventory stock report with bar chart
- [ ] Generate usage trend report with line chart
- [ ] Generate budget distribution report with pie chart
- [ ] Generate executive summary with multiple charts
- [ ] Verify print quality (300 DPI)
- [ ] Verify Thai fonts render correctly
- [ ] Verify charts are readable and professional
- [ ] PDF opens in all major viewers (Adobe, Preview, Chrome)

**Test Reports**:

1. Stock Level Report
   - Bar chart of stock values by location
   - Table of detailed inventory data

2. Usage Trend Report
   - Line chart showing 6-month trend
   - Multiple drug series

3. Budget Distribution Report
   - Pie chart of budget allocation
   - Summary statistics

4. Executive Summary
   - 3 charts (bar, line, pie)
   - Comprehensive data tables

**Validation**:

- Save PDFs to `/tmp/test-reports/`
- Open in different PDF viewers
- Print to verify quality

---

### Phase 4: Documentation

#### Task 4.1: Code Documentation

**Priority**: MEDIUM
**Estimated Time**: 30 minutes

**Acceptance Criteria**:

- [ ] JSDoc comments for all public methods
- [ ] Type definitions exported
- [ ] Examples in comments

**Files**:

- `apps/api/src/services/chart.service.ts`
- `apps/api/src/services/pdfmake.service.ts`

---

#### Task 4.2: API Documentation

**Priority**: MEDIUM
**Estimated Time**: 1 hour

**Files**:

- `docs/reference/api/pdf-export-api.md` (update)
- `docs/reference/api/chart-generation-api.md` (new)

**Acceptance Criteria**:

- [ ] PdfExportOptions interface documented
- [ ] PdfChartConfig interface documented
- [ ] Chart types documented
- [ ] Color schemes documented
- [ ] Usage examples for each chart type
- [ ] Common patterns documented

**Sections**:

1. Overview
2. Interface Reference
3. Chart Types
4. Color Schemes
5. Usage Examples
6. Best Practices
7. Troubleshooting

---

#### Task 4.3: User Guide

**Priority**: MEDIUM
**Estimated Time**: 1 hour

**Files**:

- `docs/guides/reports/pdf-charts-guide.md` (new)

**Acceptance Criteria**:

- [ ] Introduction to PDF charts
- [ ] When to use each chart type
- [ ] Step-by-step examples
- [ ] Inventory-specific examples
- [ ] Common patterns
- [ ] Troubleshooting guide

**Examples**:

1. Simple bar chart for stock levels
2. Multi-series line chart for trends
3. Pie chart for budget distribution
4. Executive report with multiple charts

---

#### Task 4.4: Update Inventory Documentation

**Priority**: LOW
**Estimated Time**: 30 minutes

**Files**:

- `docs/features/inventory-app/inventory-reports.md` (update)

**Acceptance Criteria**:

- [ ] Add charts section
- [ ] Update report examples with charts
- [ ] Link to PDF charts guide

---

## 🚀 Deployment Tasks

### Task D.1: Build Verification

**Priority**: HIGH
**Estimated Time**: 15 minutes

**Acceptance Criteria**:

- [ ] `pnpm run build` succeeds
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All tests pass

**Validation**:

```bash
pnpm run build
pnpm run lint
pnpm run test:api
```

---

### Task D.2: Dependency Check

**Priority**: HIGH
**Estimated Time**: 15 minutes

**Acceptance Criteria**:

- [ ] `chartjs-node-canvas` in package.json
- [ ] `chart.js` in package.json
- [ ] Versions compatible
- [ ] No security vulnerabilities

**Validation**:

```bash
pnpm audit
pnpm outdated
```

---

### Task D.3: Database Migration Check

**Priority**: LOW
**Estimated Time**: 5 minutes

**Acceptance Criteria**:

- [ ] No database changes required for this feature
- [ ] Existing PDF generation still works

**Note**: This feature is code-only, no database changes needed.

---

### Task D.4: Environment Variables

**Priority**: LOW
**Estimated Time**: 5 minutes

**Acceptance Criteria**:

- [ ] No new environment variables required
- [ ] Document any optional configuration

**Note**: All configuration is in code, no env vars needed.

---

## 📊 Success Metrics

### Functional Metrics

- [ ] All 4 chart types working (bar, line, pie, doughnut)
- [ ] Charts embed in PDFs correctly
- [ ] Thai language support working
- [ ] All color schemes available
- [ ] Print quality verified (300 DPI)

### Performance Metrics

- [ ] Chart generation < 500ms
- [ ] PDF with 5 charts < 3 seconds
- [ ] No memory leaks
- [ ] Stable under load

### Quality Metrics

- [ ] 80%+ test coverage
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Documentation complete

---

## ✅ Acceptance Checklist

Before marking this feature as complete:

### Code Quality

- [ ] All tasks completed
- [ ] Code reviewed
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All tests passing
- [ ] Test coverage > 80%

### Functionality

- [ ] All chart types working
- [ ] Chart positioning working
- [ ] Color schemes working
- [ ] Thai fonts working
- [ ] Error handling working
- [ ] Backward compatibility maintained

### Performance

- [ ] Performance targets met
- [ ] No memory leaks
- [ ] Stable under load

### Documentation

- [ ] Code documented (JSDoc)
- [ ] API reference updated
- [ ] User guide created
- [ ] Examples provided

### Testing

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Performance tests passing
- [ ] Manual testing complete

### Deployment

- [ ] Build succeeds
- [ ] Dependencies verified
- [ ] No security vulnerabilities
- [ ] Ready for production

---

## 🔄 Rollback Plan

### If Issues Occur in Production

**Option 1: Feature Toggle (Recommended)**

```typescript
// Add feature flag
const ENABLE_CHARTS = process.env.ENABLE_PDF_CHARTS === 'true';

if (ENABLE_CHARTS && options.charts) {
  // Generate charts
} else {
  // Skip charts
}
```

**Option 2: Code Rollback**

1. Revert commits related to chart feature
2. Redeploy API
3. Verify PDF generation still works

**Option 3: Graceful Degradation (Already Implemented)**

```typescript
try {
  // Generate PDF with charts
} catch (error) {
  console.error('Chart generation failed:', error);
  // Fallback to PDF without charts
  return generatePdf({ ...options, charts: undefined });
}
```

---

## 📅 Timeline Estimate

| Phase                  | Tasks     | Time Estimate  |
| ---------------------- | --------- | -------------- |
| Phase 1: Foundation    | 1.1 - 1.3 | 2.75 hours     |
| Phase 2: Integration   | 2.1 - 2.5 | 3.5 hours      |
| Phase 3: Testing       | 3.1 - 3.3 | 3.5 hours      |
| Phase 4: Documentation | 4.1 - 4.4 | 3 hours        |
| Deployment             | D.1 - D.4 | 0.75 hours     |
| **Total**              |           | **13.5 hours** |

**Buffer**: +20% = 16 hours (~2 working days)

---

## 🔗 Dependencies

### External

- chartjs-node-canvas ^5.0.0
- chart.js ^4.x

### Internal

- PDFMakeService (existing)
- FontManagerService (existing)
- pdfmake (existing)

### No Blockers

This feature can be developed independently without waiting for other features.

---

## 📌 Notes

### Important Considerations

1. **Backward Compatibility**: Must maintain 100% backward compatibility with existing PDF generation code.

2. **Thai Language Support**: All charts must support Thai language labels using existing Sarabun font.

3. **Performance**: Chart generation is CPU-intensive. Monitor server load in production.

4. **File Size**: Charts increase PDF file size. Consider compression if needed.

5. **Testing**: Manual testing with real inventory data is critical before production deployment.

6. **Error Handling**: Graceful degradation ensures PDF generation never fails completely.

---

**Version**: 1.0
**Created**: 2024-12-19
**Author**: AegisX Platform Team
**Status**: READY FOR IMPLEMENTATION
**Next Step**: Begin Phase 1 - Foundation
