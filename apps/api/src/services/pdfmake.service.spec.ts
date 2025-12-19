import {
  PDFMakeService,
  PdfExportOptions,
  PdfChartConfig,
} from './pdfmake.service';
import { ChartService } from './chart.service';

// Mock ChartService
jest.mock('./chart.service');

// Increase test timeout for PDF generation
jest.setTimeout(30000);

describe('PDFMakeService with Charts', () => {
  let pdfService: PDFMakeService;
  let mockChartService: jest.Mocked<ChartService>;

  // Sample data for testing
  const sampleData = [
    { id: 1, name: 'Product A', quantity: 100, price: 50 },
    { id: 2, name: 'Product B', quantity: 200, price: 75 },
    { id: 3, name: 'Product C', quantity: 150, price: 60 },
  ];

  const sampleFields = [
    { key: 'id', label: 'ID', type: 'number' as const },
    { key: 'name', label: 'Product Name', type: 'string' as const },
    { key: 'quantity', label: 'Quantity', type: 'number' as const },
    { key: 'price', label: 'Price', type: 'number' as const },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create PDF service instance
    pdfService = new PDFMakeService();

    // Get the mocked chart service
    mockChartService = (pdfService as any)
      .chartService as jest.Mocked<ChartService>;

    // Mock chart generation to return a simple PNG buffer
    const mockChartBuffer = Buffer.from('mock-chart-png-data');
    mockChartService.generateChart = jest
      .fn()
      .mockResolvedValue(mockChartBuffer);
    mockChartService.generateBarChart = jest
      .fn()
      .mockResolvedValue(mockChartBuffer);
    mockChartService.generatePieChart = jest
      .fn()
      .mockResolvedValue(mockChartBuffer);
    mockChartService.generateLineChart = jest
      .fn()
      .mockResolvedValue(mockChartBuffer);
    mockChartService.generateDoughnutChart = jest
      .fn()
      .mockResolvedValue(mockChartBuffer);

    // Wait for fonts to initialize (with longer timeout for CI environments)
    await pdfService.waitForFonts();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, 10000); // 10 second timeout for beforeEach

  describe('Chart Integration', () => {
    it('should generate PDF with bar chart before table', async () => {
      // Arrange
      const chartConfig: PdfChartConfig = {
        type: 'bar',
        position: 'before',
        data: {
          labels: ['Product A', 'Product B', 'Product C'],
          datasets: [
            {
              label: 'Quantity',
              data: [100, 200, 150],
            },
          ],
        },
        options: {
          title: 'Stock Levels',
          showLegend: true,
        },
      };

      const options: PdfExportOptions = {
        title: 'Stock Report',
        data: sampleData,
        fields: sampleFields,
        charts: [chartConfig],
        metadata: {
          exportedBy: 'Test User',
          exportedAt: new Date(),
          totalRecords: 3,
        },
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(1000);
      expect(mockChartService.generateChart).toHaveBeenCalledWith(
        'bar',
        chartConfig.data,
        chartConfig.options,
      );
    });

    it('should generate PDF with pie chart after table', async () => {
      // Arrange
      const chartConfig: PdfChartConfig = {
        type: 'pie',
        position: 'after',
        data: {
          labels: ['Product A', 'Product B', 'Product C'],
          datasets: [
            {
              data: [100, 200, 150],
            },
          ],
        },
        options: {
          title: 'Distribution',
          displayValues: true,
        },
      };

      const options: PdfExportOptions = {
        title: 'Sales Distribution Report',
        data: sampleData,
        fields: sampleFields,
        charts: [chartConfig],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(1000);
      expect(mockChartService.generateChart).toHaveBeenCalledWith(
        'pie',
        chartConfig.data,
        chartConfig.options,
      );
    });

    it('should generate PDF with multiple charts (before and after)', async () => {
      // Arrange
      const chartsBefore: PdfChartConfig[] = [
        {
          type: 'bar',
          position: 'before',
          data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{ data: [100, 150, 200, 175] }],
          },
          options: { title: 'Quarterly Sales' },
        },
        {
          type: 'line',
          position: 'before',
          data: {
            labels: ['Jan', 'Feb', 'Mar'],
            datasets: [{ data: [50, 75, 100] }],
          },
          options: { title: 'Monthly Trends' },
        },
      ];

      const chartsAfter: PdfChartConfig[] = [
        {
          type: 'pie',
          position: 'after',
          data: {
            labels: ['A', 'B', 'C'],
            datasets: [{ data: [30, 40, 30] }],
          },
          options: { title: 'Category Distribution' },
        },
      ];

      const options: PdfExportOptions = {
        title: 'Comprehensive Report',
        data: sampleData,
        fields: sampleFields,
        charts: [...chartsBefore, ...chartsAfter],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(2000);
      expect(mockChartService.generateChart).toHaveBeenCalledTimes(3);
    });

    it('should handle chart positions top and bottom as aliases', async () => {
      // Arrange
      const charts: PdfChartConfig[] = [
        {
          type: 'bar',
          position: 'top',
          data: {
            labels: ['A', 'B'],
            datasets: [{ data: [10, 20] }],
          },
        },
        {
          type: 'pie',
          position: 'bottom',
          data: {
            labels: ['X', 'Y'],
            datasets: [{ data: [30, 70] }],
          },
        },
      ];

      const options: PdfExportOptions = {
        title: 'Report with Top and Bottom Charts',
        data: sampleData,
        fields: sampleFields,
        charts,
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(mockChartService.generateChart).toHaveBeenCalledTimes(2);
    });

    it('should maintain backward compatibility (PDF without charts still works)', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Simple Report',
        data: sampleData,
        fields: sampleFields,
        // No charts parameter
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(500);
      expect(mockChartService.generateChart).not.toHaveBeenCalled();
    });

    it('should handle empty charts array', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Report with Empty Charts',
        data: sampleData,
        fields: sampleFields,
        charts: [],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(mockChartService.generateChart).not.toHaveBeenCalled();
    });
  });

  describe('Chart with Thai Language Labels', () => {
    it('should generate PDF with Thai text in chart labels', async () => {
      // Arrange
      const chartConfig: PdfChartConfig = {
        type: 'bar',
        position: 'before',
        data: {
          labels: ['สินค้า A', 'สินค้า B', 'สินค้า C'],
          datasets: [
            {
              label: 'จำนวน',
              data: [100, 200, 150],
            },
          ],
        },
        options: {
          title: 'รายงานสต็อกสินค้า',
          showLegend: true,
        },
      };

      const options: PdfExportOptions = {
        title: 'รายงานภาษาไทย',
        data: [
          { id: 1, name: 'สินค้า A', quantity: 100 },
          { id: 2, name: 'สินค้า B', quantity: 200 },
        ],
        fields: [
          { key: 'id', label: 'รหัส', type: 'number' as const },
          { key: 'name', label: 'ชื่อสินค้า', type: 'string' as const },
          { key: 'quantity', label: 'จำนวน', type: 'number' as const },
        ],
        charts: [chartConfig],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(1000);
      expect(mockChartService.generateChart).toHaveBeenCalledWith(
        'bar',
        expect.objectContaining({
          labels: expect.arrayContaining(['สินค้า A', 'สินค้า B', 'สินค้า C']),
        }),
        expect.any(Object),
      );
    });

    it('should handle mixed Thai and English labels', async () => {
      // Arrange
      const chartConfig: PdfChartConfig = {
        type: 'pie',
        position: 'after',
        data: {
          labels: ['Product A', 'สินค้า B', 'Item C'],
          datasets: [
            {
              data: [30, 40, 30],
            },
          ],
        },
        options: {
          title: 'Mixed Language Chart',
        },
      };

      const options: PdfExportOptions = {
        title: 'Mixed Language Report',
        data: sampleData,
        fields: sampleFields,
        charts: [chartConfig],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(mockChartService.generateChart).toHaveBeenCalled();
    });
  });

  describe('Chart Validation', () => {
    it('should throw error for invalid chart type', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Invalid Chart Report',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'invalid' as any,
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
          },
        ],
      };

      // Act & Assert
      await expect(pdfService.generatePdf(options)).rejects.toThrow(
        'Invalid chart type: invalid',
      );
    });

    it('should throw error when chart labels is not an array', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Invalid Labels',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: 'invalid' as any,
              datasets: [{ data: [10, 20] }],
            },
          },
        ],
      };

      // Act & Assert
      await expect(pdfService.generatePdf(options)).rejects.toThrow(
        'Chart labels must be an array',
      );
    });

    it('should throw error when chart datasets is not an array', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Invalid Datasets',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: 'invalid' as any,
            },
          },
        ],
      };

      // Act & Assert
      await expect(pdfService.generatePdf(options)).rejects.toThrow(
        'Chart datasets must be an array',
      );
    });

    it('should throw error when too many data points (>100)', async () => {
      // Arrange
      const tooManyLabels = Array.from({ length: 101 }, (_, i) => `Label ${i}`);
      const tooManyDataPoints = Array.from(
        { length: 101 },
        () => Math.random() * 100,
      );

      const options: PdfExportOptions = {
        title: 'Too Many Data Points',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: tooManyLabels,
              datasets: [{ data: tooManyDataPoints }],
            },
          },
        ],
      };

      // Act & Assert
      await expect(pdfService.generatePdf(options)).rejects.toThrow(
        'Maximum 100 data points per chart',
      );
    });
  });

  describe('Chart Dimension Limits', () => {
    it('should throw error for chart width below minimum (100)', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Width Too Small',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
            width: 50,
          },
        ],
      };

      // Act & Assert
      await expect(pdfService.generatePdf(options)).rejects.toThrow(
        'Chart width must be between 100 and 2000',
      );
    });

    it('should throw error for chart width above maximum (2000)', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Width Too Large',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
            width: 2500,
          },
        ],
      };

      // Act & Assert
      await expect(pdfService.generatePdf(options)).rejects.toThrow(
        'Chart width must be between 100 and 2000',
      );
    });

    it('should throw error for chart height below minimum (100)', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Height Too Small',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
            height: 50,
          },
        ],
      };

      // Act & Assert
      await expect(pdfService.generatePdf(options)).rejects.toThrow(
        'Chart height must be between 100 and 1500',
      );
    });

    it('should throw error for chart height above maximum (1500)', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Height Too Large',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
            height: 2000,
          },
        ],
      };

      // Act & Assert
      await expect(pdfService.generatePdf(options)).rejects.toThrow(
        'Chart height must be between 100 and 1500',
      );
    });

    it('should accept valid chart dimensions', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Valid Dimensions',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
            width: 600,
            height: 400,
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
    });
  });

  describe('Maximum Charts Per PDF Limit', () => {
    it('should throw error for more than 10 charts', async () => {
      // Arrange
      const charts: PdfChartConfig[] = Array.from({ length: 11 }, (_, i) => ({
        type: 'bar' as const,
        position: 'before' as const,
        data: {
          labels: ['A', 'B'],
          datasets: [{ data: [10, 20] }],
        },
        options: { title: `Chart ${i + 1}` },
      }));

      const options: PdfExportOptions = {
        title: 'Too Many Charts',
        data: sampleData,
        fields: sampleFields,
        charts,
      };

      // Act & Assert
      await expect(pdfService.generatePdf(options)).rejects.toThrow(
        'Maximum 10 charts allowed per PDF',
      );
    });

    it('should accept exactly 10 charts', async () => {
      // Arrange
      const charts: PdfChartConfig[] = Array.from({ length: 10 }, (_, i) => ({
        type: 'bar' as const,
        position: i % 2 === 0 ? ('before' as const) : ('after' as const),
        data: {
          labels: ['A', 'B'],
          datasets: [{ data: [10 * (i + 1), 20 * (i + 1)] }],
        },
        options: { title: `Chart ${i + 1}` },
      }));

      const options: PdfExportOptions = {
        title: 'Maximum Charts Allowed',
        data: sampleData,
        fields: sampleFields,
        charts,
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(mockChartService.generateChart).toHaveBeenCalledTimes(10);
    });
  });

  describe('Chart Types', () => {
    it('should generate PDF with line chart', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Line Chart Report',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'line',
            position: 'before',
            data: {
              labels: ['Jan', 'Feb', 'Mar'],
              datasets: [{ data: [10, 20, 15] }],
            },
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(mockChartService.generateChart).toHaveBeenCalledWith(
        'line',
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should generate PDF with doughnut chart', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Doughnut Chart Report',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'doughnut',
            position: 'after',
            data: {
              labels: ['A', 'B', 'C'],
              datasets: [{ data: [30, 40, 30] }],
            },
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(mockChartService.generateChart).toHaveBeenCalledWith(
        'doughnut',
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe('Chart Customization', () => {
    it('should apply custom chart dimensions', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Custom Dimensions',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
            width: 700,
            height: 500,
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
    });

    it('should apply custom chart alignment', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Custom Alignment',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
            alignment: 'left',
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
    });

    it('should apply custom chart margins', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Custom Margins',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
            margin: [10, 20, 10, 30],
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
    });

    it('should apply chart options (title, legend, grid)', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Chart with Options',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B', 'C'],
              datasets: [{ data: [10, 20, 30] }],
            },
            options: {
              title: 'Sales Chart',
              subtitle: 'Q1 2024',
              showLegend: true,
              showGrid: true,
              displayValues: true,
            },
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
      expect(mockChartService.generateChart).toHaveBeenCalledWith(
        'bar',
        expect.any(Object),
        expect.objectContaining({
          title: 'Sales Chart',
          subtitle: 'Q1 2024',
          showLegend: true,
          showGrid: true,
          displayValues: true,
        }),
      );
    });
  });

  describe('Chart Data Validation Edge Cases', () => {
    it('should handle empty labels array', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Empty Labels',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: [],
              datasets: [{ data: [] }],
            },
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
    });

    it('should handle single data point', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Single Data Point',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A'],
              datasets: [{ data: [100] }],
            },
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
    });

    it('should handle multiple datasets', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Multiple Datasets',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['Q1', 'Q2', 'Q3'],
              datasets: [
                { label: '2023', data: [100, 150, 200] },
                { label: '2024', data: [120, 180, 220] },
              ],
            },
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
    });
  });

  describe('Chart Generation Error Handling', () => {
    it('should handle chart generation errors gracefully', async () => {
      // Arrange
      mockChartService.generateChart.mockRejectedValue(
        new Error('Chart generation failed'),
      );

      const options: PdfExportOptions = {
        title: 'Chart Error',
        data: sampleData,
        fields: sampleFields,
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
          },
        ],
      };

      // Act & Assert
      await expect(pdfService.generatePdf(options)).rejects.toThrow();
    });
  });

  describe('PDF with Charts and Different Templates', () => {
    it('should generate PDF with charts using professional template', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Professional Template',
        data: sampleData,
        fields: sampleFields,
        template: 'professional',
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [10, 20] }],
            },
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
    });

    it('should generate PDF with charts using minimal template', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Minimal Template',
        data: sampleData,
        fields: sampleFields,
        template: 'minimal',
        charts: [
          {
            type: 'pie',
            position: 'after',
            data: {
              labels: ['A', 'B'],
              datasets: [{ data: [50, 50] }],
            },
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
    });

    it('should generate PDF with charts in landscape orientation', async () => {
      // Arrange
      const options: PdfExportOptions = {
        title: 'Landscape Report',
        data: sampleData,
        fields: sampleFields,
        orientation: 'landscape',
        charts: [
          {
            type: 'bar',
            position: 'before',
            data: {
              labels: ['A', 'B', 'C', 'D', 'E'],
              datasets: [{ data: [10, 20, 30, 25, 15] }],
            },
            width: 700,
          },
        ],
      };

      // Act
      const pdf = await pdfService.generatePdf(options);

      // Assert
      expect(pdf).toBeInstanceOf(Buffer);
    });
  });
});
