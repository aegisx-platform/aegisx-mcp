# PDF Charts Feature - Specification Summary

> **Status**: ✅ APPROVED - Ready for Implementation
> **Version**: 1.0
> **Created**: 2024-12-19
> **Author**: AegisX Platform Team

---

## 📋 Executive Summary

This specification defines the implementation of **server-side chart generation for PDF reports** in the AegisX Platform. The feature enables embedding of visual analytics (bar charts, line charts, pie charts, doughnut charts) directly into PDF documents, with full Thai language support.

### Business Value

- **Enhanced Reports**: Visual data representation improves comprehension
- **Professional Output**: Print-ready charts at 300 DPI quality
- **Thai Language Support**: Full compatibility with existing Thai font system
- **Flexible Integration**: Charts can be positioned before, after, or around tables
- **Backward Compatible**: Existing PDF generation continues to work unchanged

---

## 📚 Specification Documents

This specification consists of three core documents:

### 1️⃣ [Requirements](./requirements.md) - 587 lines

**What we need to build**

- **Business Requirements** (BR-1 to BR-4)
  - Visual analytics in PDF reports
  - Executive summary reports
  - Inventory analytics
  - Multi-chart reports

- **Functional Requirements** (FR-1 to FR-5)
  - Chart types: bar, line, pie, doughnut
  - Configuration: title, colors, legend, grid, values
  - Positioning: top, before, after, bottom
  - Data binding: labels, datasets, Thai support
  - PDF integration: backward compatible

- **Non-Functional Requirements** (NFR-1 to NFR-4)
  - Performance: < 500ms per chart, < 3s for 5 charts
  - Quality: 300 DPI, print-ready
  - Compatibility: All PDF viewers, Thai fonts
  - Maintainability: Type-safe, modular, testable

- **Use Cases** (UC-1 to UC-4)
  - Stock level report with bar chart
  - Monthly usage trend with line chart
  - Budget distribution with pie chart
  - Multi-chart executive summary

### 2️⃣ [Design](./design.md) - 910 lines

**How we will build it**

- **Architecture Overview**
  - System context diagrams
  - Component interaction flow
  - Data flow diagrams

- **Component Design**
  - **ChartService** (NEW): Server-side chart generation using Chart.js
  - **PDFMakeService** (ENHANCED): Chart embedding in PDFs

- **Technical Details**
  - Chart.js configuration templates
  - Color scheme definitions (7 palettes)
  - PNG generation and Base64 embedding
  - Thai font integration

- **Quality Assurance**
  - Testing strategy (unit, integration, performance)
  - Error handling patterns
  - Performance optimization
  - Security considerations

### 3️⃣ [Tasks](./tasks.md) - Implementation Roadmap

**Step-by-step implementation plan**

- **Phase 1: Foundation** (2-3 hours)
  - Verify dependencies
  - Create ChartService
  - Unit tests

- **Phase 2: Integration** (2-3 hours)
  - Enhance PDFMakeService interfaces
  - Implement chart element creation
  - Update document generation
  - Add validation

- **Phase 3: Testing** (2-3 hours)
  - Integration tests
  - Performance tests
  - Manual testing with real data

- **Phase 4: Documentation** (1-2 hours)
  - Code documentation
  - API reference
  - User guide
  - Inventory examples

**Total Estimate**: 13.5 hours (~2 working days with buffer)

---

## 🎯 Key Decisions

### Technical Stack

| Component          | Technology          | Rationale                             |
| ------------------ | ------------------- | ------------------------------------- |
| Chart Rendering    | Chart.js            | Industry standard, feature-rich       |
| Server-side Canvas | chartjs-node-canvas | Node.js Canvas API support            |
| Image Format       | PNG (Base64)        | Best quality, universal compatibility |
| Resolution         | 300 DPI             | Print quality                         |

### Chart Types (Phase 1)

1. **Bar Chart** - Comparing values across categories
2. **Line Chart** - Trends over time
3. **Pie Chart** - Percentage distribution
4. **Doughnut Chart** - Similar to pie with center hollow

### Color Schemes

- **primary**: Blue tones (default for corporate)
- **success**: Green tones (positive metrics)
- **warning**: Amber tones (attention needed)
- **danger**: Red tones (critical issues)
- **info**: Cyan tones (informational)
- **purple**: Purple tones (creative)
- **mixed**: Multi-color (diverse data)

### Chart Positioning

- **top**: Chart before title
- **before**: Chart after title, before table
- **after**: Chart after table
- **bottom**: Chart at end of document

---

## 🔍 Implementation Highlights

### ChartService (NEW)

```typescript
// apps/api/src/services/chart.service.ts

export class ChartService {
  async generateBarChart(data, options): Promise<Buffer>;
  async generateLineChart(data, options): Promise<Buffer>;
  async generatePieChart(data, options): Promise<Buffer>;
  async generateDoughnutChart(data, options): Promise<Buffer>;
  async generateChart(type, data, options): Promise<Buffer>;
}
```

**Key Features**:

- Server-side PNG generation
- 7 predefined color schemes
- Thai language support
- Customizable dimensions
- Value display options
- Legend control

### PDFMakeService (ENHANCED)

```typescript
// apps/api/src/services/pdfmake.service.ts

export interface PdfChartConfig {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  position: ChartPosition;
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
  margin?: [number, number, number, number];
}

export interface PdfExportOptions {
  // ... existing fields
  charts?: PdfChartConfig[]; // NEW
}
```

**Key Changes**:

- New `charts` array parameter
- Async document generation
- Chart positioning logic
- Error handling with fallback
- Validation for security

---

## 💡 Usage Example

### Inventory Stock Report with Bar Chart

```typescript
const pdfService = new PDFMakeService();

const stockReport = await pdfService.generatePdf({
  title: 'รายงานยาคงคลัง - มกราคม 2568',
  subtitle: 'Stock Level Report',
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
        showLegend: true,
      },
      width: 500,
      height: 300,
      alignment: 'center',
    },
  ],
});

// Returns PDF Buffer
```

**Output**: PDF with Thai-language bar chart showing stock values by location, followed by detailed inventory table.

---

## 📊 Success Criteria

### Functional (100% Required)

- ✅ All 4 chart types implemented
- ✅ Charts embed in PDFs correctly
- ✅ Thai language support working
- ✅ All 7 color schemes available
- ✅ Chart positioning (before/after) working
- ✅ Backward compatibility maintained

### Performance (100% Required)

- ✅ Chart generation < 500ms per chart
- ✅ PDF with 5 charts < 3 seconds total
- ✅ Memory usage < 100MB for large reports
- ✅ No memory leaks

### Quality (80%+ Required)

- ✅ Test coverage > 80%
- ✅ All tests passing
- ✅ No TypeScript errors
- ✅ Print quality (300 DPI)
- ✅ Documentation complete

---

## 🚫 Out of Scope (Phase 1)

The following are **explicitly excluded** from this phase:

1. ❌ Interactive charts (PDF charts are static)
2. ❌ Real-time data updates
3. ❌ Chart animations
4. ❌ Custom chart types beyond the 4 defined
5. ❌ Standalone chart export (charts only in PDFs)
6. ❌ Advanced Chart.js features (stacked bars, mixed types)
7. ❌ Chart templates/presets

**Note**: These may be considered for Phase 2 based on user feedback.

---

## 🔄 Dependencies

### External (NPM Packages)

```json
{
  "chartjs-node-canvas": "^5.0.0",
  "chart.js": "^4.x"
}
```

**License**: Both MIT-licensed ✅

### Internal (Existing Services)

- ✅ `PDFMakeService` - PDF generation
- ✅ `FontManagerService` - Thai font support
- ✅ `pdfmake` - PDF library

**No Breaking Changes**: All existing services continue to work unchanged.

---

## 🧪 Testing Strategy

### Unit Tests (ChartService)

```typescript
describe('ChartService', () => {
  it('generates bar chart with correct dimensions');
  it('applies color schemes correctly');
  it('handles Thai language labels');
  it('displays values when enabled');
  it('throws error for invalid chart type');
});
```

### Integration Tests (PDFMakeService)

```typescript
describe('PDFMakeService with Charts', () => {
  it('generates PDF with chart before table');
  it('generates PDF with chart after table');
  it('generates PDF with multiple charts');
  it('maintains backward compatibility without charts');
  it('handles Thai language in charts and tables');
});
```

### Performance Tests

```typescript
describe('Performance', () => {
  it('generates single chart in < 500ms');
  it('generates PDF with 5 charts in < 3 seconds');
  it('handles 100 data points efficiently');
});
```

### Manual Testing (Real Scenarios)

1. Stock level report with bar chart
2. Usage trend report with line chart
3. Budget distribution report with pie chart
4. Executive summary with 3 charts

**Validation**: Save PDFs, verify in Adobe Reader, Preview, Chrome PDF viewer.

---

## 📝 Documentation Plan

### Code Documentation

- JSDoc comments for all public methods
- TypeScript interfaces exported
- Usage examples in comments

### API Reference

- `docs/reference/api/pdf-export-api.md` (update)
- `docs/reference/api/chart-generation-api.md` (new)

### User Guide

- `docs/guides/reports/pdf-charts-guide.md` (new)
  - Introduction
  - Chart types explained
  - Step-by-step examples
  - Inventory-specific patterns
  - Troubleshooting

### Feature Documentation

- `docs/features/inventory-app/inventory-reports.md` (update)
  - Add charts section
  - Update report examples

---

## 🔐 Security Considerations

### Input Validation

- Chart type whitelist (only 4 allowed types)
- Dimension limits (100-2000px width, 100-1500px height)
- Maximum charts per PDF (10)
- Maximum data points per chart (100)
- Array and object structure validation

### Resource Protection

- Memory limits enforced
- CPU time monitoring
- File size limits
- DoS prevention through limits

### Error Handling

- Graceful degradation (PDF without charts on error)
- No sensitive data in error messages
- Proper logging for debugging
- Fallback mechanisms

---

## 🎨 Design Patterns Used

### Separation of Concerns

- **ChartService**: Pure chart generation (single responsibility)
- **PDFMakeService**: PDF assembly and orchestration
- **FontManagerService**: Font handling (existing)

### Dependency Injection

```typescript
class PDFMakeService {
  constructor() {
    this.chartService = new ChartService();
  }
}
```

### Async/Await Pattern

```typescript
async generatePdf(options: PdfExportOptions): Promise<Buffer> {
  const docDefinition = await this.createDocumentDefinition(options);
  return await this.renderPdf(docDefinition);
}
```

### Strategy Pattern (Color Schemes)

```typescript
const colors = this.getColors(options.colorScheme, count);
// Returns different colors based on scheme
```

### Facade Pattern

```typescript
// Simple interface hides complex Chart.js configuration
await chartService.generateChart('bar', data, { colorScheme: 'primary' });
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`pnpm run test:api`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Dependencies verified (`pnpm audit`)
- [ ] Documentation complete

### Deployment

- [ ] Dependencies installed on server
- [ ] Environment variables (none required)
- [ ] Database migrations (none required)
- [ ] Backward compatibility verified

### Post-Deployment

- [ ] Smoke test: Generate simple PDF with chart
- [ ] Monitor server CPU/memory
- [ ] Check error logs
- [ ] Verify Thai fonts working

### Rollback Plan

**Option 1**: Feature flag

```typescript
const ENABLE_CHARTS = process.env.ENABLE_PDF_CHARTS === 'true';
```

**Option 2**: Graceful degradation (built-in)

```typescript
try {
  // Generate with charts
} catch (error) {
  // Fallback to PDF without charts
}
```

---

## 📈 Future Enhancements (Phase 2+)

### Additional Chart Types

- Radar charts (multi-dimensional comparison)
- Stacked bar charts (cumulative data)
- Mixed charts (bar + line combination)
- Polar area charts

### Advanced Features

- Chart templates (pre-configured charts)
- Dynamic data binding (auto-generate from table)
- Conditional formatting (color rules based on thresholds)
- Chart export API (standalone chart generation)
- Responsive charts (auto-resize based on page)

### Performance Optimizations

- Chart caching (reuse generated charts)
- Parallel chart generation
- Image compression
- PDF compression

---

## 🤝 Stakeholder Sign-Off

### Required Approvals

- [x] **Product Owner**: Business requirements approved
- [x] **Tech Lead**: Architecture design approved
- [x] **QA Lead**: Testing strategy approved
- [ ] **Dev Team**: Ready to implement (pending)

### Review Comments

- ✅ Requirements clear and comprehensive
- ✅ Design follows existing patterns
- ✅ Implementation plan detailed
- ✅ Timeline realistic
- ✅ No blockers identified

---

## 📞 Contact & Support

### Questions or Issues

- **Spec Author**: AegisX Platform Team
- **Documentation**: See individual spec files
- **Implementation Questions**: Refer to design.md
- **Task Clarifications**: Refer to tasks.md

---

## 📎 Appendix

### Related Documents

- [PDF Templates Guide](../../../docs/features/pdf-export/pdf-templates-guide.md)
- [Font Manager Documentation](../../../apps/api/src/services/font-manager.service.ts)
- [PDFMake Service](../../../apps/api/src/services/pdfmake.service.ts)
- [Inventory Features](../../../docs/features/inventory-app/)

### Reference Links

- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [chartjs-node-canvas](https://github.com/SeanSobey/ChartjsNodeCanvas)
- [PDFMake Documentation](http://pdfmake.org/)

### Change Log

| Version | Date       | Changes               | Author               |
| ------- | ---------- | --------------------- | -------------------- |
| 1.0     | 2024-12-19 | Initial specification | AegisX Platform Team |

---

**🎉 SPECIFICATION COMPLETE - READY FOR IMPLEMENTATION**

**Next Steps**:

1. ✅ Specification approved by stakeholders
2. ⏳ Assign to developer
3. ⏳ Create implementation branch
4. ⏳ Begin Phase 1: Foundation (Task 1.1)

---

**Document Version**: 1.0
**Last Updated**: 2024-12-19
**Status**: ✅ APPROVED
