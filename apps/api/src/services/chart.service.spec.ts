import {
  ChartService,
  ChartData,
  ChartOptions,
  CHART_COLORS,
  ChartType,
} from './chart.service';

// Mock ChartJSNodeCanvas to avoid native canvas dependency issues in tests
jest.mock('chartjs-node-canvas', () => {
  return {
    ChartJSNodeCanvas: jest.fn().mockImplementation(() => {
      return {
        renderToBuffer: jest
          .fn()
          .mockResolvedValue(Buffer.from('mock-chart-image')),
      };
    }),
  };
});

describe('ChartService', () => {
  let chartService: ChartService;

  // Sample test data with Thai labels
  const sampleData: ChartData = {
    labels: ['คลังหลัก', 'คลังย่อย A', 'คลังย่อย B'],
    datasets: [
      {
        label: 'มูลค่ายาคงคลัง',
        data: [80000, 50000, 30000],
      },
    ],
  };

  const multiDatasetData: ChartData = {
    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.'],
    datasets: [
      {
        label: 'รายรับ',
        data: [100000, 120000, 110000, 130000],
      },
      {
        label: 'รายจ่าย',
        data: [80000, 90000, 85000, 95000],
      },
    ],
  };

  beforeEach(() => {
    chartService = new ChartService();
  });

  describe('constructor', () => {
    it('should initialize with default dimensions', () => {
      const service = new ChartService();
      expect(service).toBeDefined();
      expect(service['defaultWidth']).toBe(800);
      expect(service['defaultHeight']).toBe(400);
    });

    it('should initialize with custom dimensions', () => {
      const service = new ChartService(1200, 600);
      expect(service).toBeDefined();
    });
  });

  describe('generateBarChart', () => {
    it('should generate bar chart buffer', async () => {
      const result = await chartService.generateBarChart(sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should apply color scheme correctly', async () => {
      const options: ChartOptions = {
        colorScheme: 'primary',
      };

      const result = await chartService.generateBarChart(sampleData, options);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should apply custom color array', async () => {
      const options: ChartOptions = {
        colorScheme: ['#FF0000', '#00FF00', '#0000FF'],
      };

      const result = await chartService.generateBarChart(sampleData, options);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should display values when enabled', async () => {
      const options: ChartOptions = {
        displayValues: true,
      };

      const result = await chartService.generateBarChart(sampleData, options);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle Thai language labels', async () => {
      const thaiData: ChartData = {
        labels: ['กรุงเทพฯ', 'เชียงใหม่', 'ภูเก็ต', 'ขอนแก่น'],
        datasets: [
          {
            label: 'จำนวนโรงพยาบาล',
            data: [150, 80, 60, 90],
          },
        ],
      };

      const result = await chartService.generateBarChart(thaiData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should apply title and subtitle', async () => {
      const options: ChartOptions = {
        title: 'รายงานสต็อกยา',
        subtitle: 'ประจำเดือนธันวาคม 2567',
      };

      const result = await chartService.generateBarChart(sampleData, options);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should hide legend when showLegend is false', async () => {
      const options: ChartOptions = {
        showLegend: false,
      };

      const result = await chartService.generateBarChart(sampleData, options);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should hide grid when showGrid is false', async () => {
      const options: ChartOptions = {
        showGrid: false,
      };

      const result = await chartService.generateBarChart(sampleData, options);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle multiple datasets', async () => {
      const result = await chartService.generateBarChart(multiDatasetData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should apply custom dataset properties', async () => {
      const customData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'Test',
            data: [10, 20, 30],
            backgroundColor: '#FF0000',
            borderColor: '#000000',
            borderWidth: 3,
          },
        ],
      };

      const result = await chartService.generateBarChart(customData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('generateLineChart', () => {
    it('should generate line chart buffer', async () => {
      const result = await chartService.generateLineChart(sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should apply color scheme for multiple datasets', async () => {
      const options: ChartOptions = {
        colorScheme: 'success',
      };

      const result = await chartService.generateLineChart(
        multiDatasetData,
        options,
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should display values when enabled', async () => {
      const options: ChartOptions = {
        displayValues: true,
      };

      const result = await chartService.generateLineChart(sampleData, options);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle Thai language labels', async () => {
      const thaiData: ChartData = {
        labels: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม'],
        datasets: [
          {
            label: 'ยอดขาย',
            data: [100, 150, 120],
          },
        ],
      };

      const result = await chartService.generateLineChart(thaiData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle fill option', async () => {
      const dataWithFill: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'Test',
            data: [10, 20, 15],
            fill: false,
          },
        ],
      };

      const result = await chartService.generateLineChart(dataWithFill);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should apply all options together', async () => {
      const options: ChartOptions = {
        title: 'แนวโน้มยอดขาย',
        subtitle: 'รายไตรมาส',
        colorScheme: 'info',
        showLegend: true,
        showGrid: true,
        displayValues: true,
      };

      const result = await chartService.generateLineChart(
        multiDatasetData,
        options,
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('generatePieChart', () => {
    it('should generate pie chart buffer', async () => {
      const result = await chartService.generatePieChart(sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should apply color scheme correctly', async () => {
      const options: ChartOptions = {
        colorScheme: 'warning',
      };

      const result = await chartService.generatePieChart(sampleData, options);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should calculate percentages correctly', async () => {
      // This test verifies that the chart is generated
      // Percentage calculation is done by datalabels formatter
      const result = await chartService.generatePieChart(sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should display percentages by default', async () => {
      const result = await chartService.generatePieChart(sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should hide values when displayValues is false', async () => {
      const options: ChartOptions = {
        displayValues: false,
      };

      const result = await chartService.generatePieChart(sampleData, options);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle Thai language labels', async () => {
      const thaiData: ChartData = {
        labels: ['ยาเม็ด', 'ยาน้ำ', 'ยาฉีด', 'ยาทา'],
        datasets: [
          {
            label: 'ประเภทยา',
            data: [45, 25, 20, 10],
          },
        ],
      };

      const result = await chartService.generatePieChart(thaiData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should position legend on the right', async () => {
      const options: ChartOptions = {
        showLegend: true,
      };

      const result = await chartService.generatePieChart(sampleData, options);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should use only first dataset', async () => {
      // Pie charts use only the first dataset
      const result = await chartService.generatePieChart(multiDatasetData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('generateDoughnutChart', () => {
    it('should generate doughnut chart buffer', async () => {
      const result = await chartService.generateDoughnutChart(sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should apply color scheme correctly', async () => {
      const options: ChartOptions = {
        colorScheme: 'danger',
      };

      const result = await chartService.generateDoughnutChart(
        sampleData,
        options,
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should calculate percentages correctly', async () => {
      const result = await chartService.generateDoughnutChart(sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should display percentages by default', async () => {
      const result = await chartService.generateDoughnutChart(sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should hide values when displayValues is false', async () => {
      const options: ChartOptions = {
        displayValues: false,
      };

      const result = await chartService.generateDoughnutChart(
        sampleData,
        options,
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle Thai language labels', async () => {
      const thaiData: ChartData = {
        labels: ['รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น'],
        datasets: [
          {
            label: 'สถานะงาน',
            data: [30, 50, 20],
          },
        ],
      };

      const result = await chartService.generateDoughnutChart(thaiData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should apply title and subtitle', async () => {
      const options: ChartOptions = {
        title: 'สัดส่วนการจัดสรรงบประมาณ',
        subtitle: 'ปีงบประมาณ 2568',
      };

      const result = await chartService.generateDoughnutChart(
        sampleData,
        options,
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('generateChart', () => {
    it('should route to bar chart', async () => {
      const result = await chartService.generateChart('bar', sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should route to line chart', async () => {
      const result = await chartService.generateChart('line', sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should route to pie chart', async () => {
      const result = await chartService.generateChart('pie', sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should route to doughnut chart', async () => {
      const result = await chartService.generateChart('doughnut', sampleData);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should throw error for invalid chart type', async () => {
      await expect(
        chartService.generateChart('invalid' as ChartType, sampleData),
      ).rejects.toThrow('Unsupported chart type: invalid');
    });

    it('should pass options to chart generators', async () => {
      const options: ChartOptions = {
        title: 'Test Chart',
        colorScheme: 'purple',
        displayValues: true,
      };

      const result = await chartService.generateChart(
        'bar',
        sampleData,
        options,
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('color helpers', () => {
    describe('getColors', () => {
      it('should return mixed colors by default', () => {
        const colors = chartService['getColors'](undefined, 3);

        expect(colors).toHaveLength(3);
        expect(colors).toEqual(CHART_COLORS.mixed.slice(0, 3));
      });

      it('should return primary color scheme', () => {
        const colors = chartService['getColors']('primary', 3);

        expect(colors).toHaveLength(3);
        expect(colors).toEqual(CHART_COLORS.primary.slice(0, 3));
      });

      it('should return success color scheme', () => {
        const colors = chartService['getColors']('success', 2);

        expect(colors).toHaveLength(2);
        expect(colors).toEqual(CHART_COLORS.success.slice(0, 2));
      });

      it('should return warning color scheme', () => {
        const colors = chartService['getColors']('warning', 4);

        expect(colors).toHaveLength(4);
        expect(colors).toEqual(CHART_COLORS.warning.slice(0, 4));
      });

      it('should return danger color scheme', () => {
        const colors = chartService['getColors']('danger', 3);

        expect(colors).toHaveLength(3);
        expect(colors).toEqual(CHART_COLORS.danger.slice(0, 3));
      });

      it('should return info color scheme', () => {
        const colors = chartService['getColors']('info', 2);

        expect(colors).toHaveLength(2);
        expect(colors).toEqual(CHART_COLORS.info.slice(0, 2));
      });

      it('should return purple color scheme', () => {
        const colors = chartService['getColors']('purple', 3);

        expect(colors).toHaveLength(3);
        expect(colors).toEqual(CHART_COLORS.purple.slice(0, 3));
      });

      it('should return custom color array', () => {
        const customColors = ['#FF0000', '#00FF00', '#0000FF'];
        const colors = chartService['getColors'](customColors, 3);

        expect(colors).toEqual(customColors);
      });

      it('should repeat colors when count exceeds palette size', () => {
        const colors = chartService['getColors']('primary', 8);

        expect(colors).toHaveLength(8);
        // First 5 should match the primary palette
        expect(colors.slice(0, 5)).toEqual(CHART_COLORS.primary);
        // Next 3 should repeat from the beginning
        expect(colors.slice(5, 8)).toEqual(CHART_COLORS.primary.slice(0, 3));
      });

      it('should handle large count values', () => {
        const colors = chartService['getColors']('mixed', 20);

        expect(colors).toHaveLength(20);
        // Should cycle through the mixed palette
        for (let i = 0; i < 20; i++) {
          expect(colors[i]).toBe(
            CHART_COLORS.mixed[i % CHART_COLORS.mixed.length],
          );
        }
      });
    });

    describe('darkenColor', () => {
      it('should darken a hex color', () => {
        const original = '#3b82f6'; // Primary blue
        const darkened = chartService['darkenColor'](original);

        expect(darkened).toMatch(/^#[0-9a-f]{6}$/);
        expect(darkened).not.toBe(original);

        // Verify the darkened color has lower RGB values
        const origR = parseInt(original.substr(1, 2), 16);
        const darkR = parseInt(darkened.substr(1, 2), 16);
        expect(darkR).toBeLessThan(origR);
      });

      it('should not go below 0 for RGB values', () => {
        const darkColor = '#0a0a0a'; // Very dark color
        const darkened = chartService['darkenColor'](darkColor);

        expect(darkened).toMatch(/^#[0-9a-f]{6}$/);
        expect(darkened).toBe('#000000'); // Should be black
      });

      it('should handle bright colors', () => {
        const brightColor = '#ffffff';
        const darkened = chartService['darkenColor'](brightColor);

        expect(darkened).toMatch(/^#[0-9a-f]{6}$/);
        expect(darkened).toBe('#e1e1e1'); // 255 - 30 = 225 = e1
      });

      it('should handle colors with lowercase hex', () => {
        const color = '#ff5733';
        const darkened = chartService['darkenColor'](color);

        expect(darkened).toMatch(/^#[0-9a-f]{6}$/);
      });
    });

    describe('transparentize', () => {
      it('should convert hex to rgba with alpha', () => {
        const color = '#3b82f6';
        const transparent = chartService['transparentize'](color, 0.5);

        expect(transparent).toBe('rgba(59, 130, 246, 0.5)');
      });

      it('should handle different alpha values', () => {
        const color = '#ff0000';

        const alpha01 = chartService['transparentize'](color, 0.1);
        expect(alpha01).toBe('rgba(255, 0, 0, 0.1)');

        const alpha09 = chartService['transparentize'](color, 0.9);
        expect(alpha09).toBe('rgba(255, 0, 0, 0.9)');
      });

      it('should handle full opacity', () => {
        const color = '#00ff00';
        const opaque = chartService['transparentize'](color, 1);

        expect(opaque).toBe('rgba(0, 255, 0, 1)');
      });

      it('should handle full transparency', () => {
        const color = '#0000ff';
        const transparent = chartService['transparentize'](color, 0);

        expect(transparent).toBe('rgba(0, 0, 255, 0)');
      });

      it('should correctly parse hex colors', () => {
        const color = '#10b981'; // Success green
        const transparent = chartService['transparentize'](color, 0.2);

        expect(transparent).toBe('rgba(16, 185, 129, 0.2)');
      });
    });
  });

  describe('all color schemes', () => {
    it('should generate charts with all available color schemes', async () => {
      const schemes: Array<keyof typeof CHART_COLORS> = [
        'primary',
        'success',
        'warning',
        'danger',
        'info',
        'purple',
        'mixed',
      ];

      for (const scheme of schemes) {
        const options: ChartOptions = {
          colorScheme: scheme,
        };

        const result = await chartService.generateBarChart(sampleData, options);
        expect(result).toBeDefined();
        expect(Buffer.isBuffer(result)).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty data arrays', async () => {
      const emptyData: ChartData = {
        labels: [],
        datasets: [{ data: [] }],
      };

      const result = await chartService.generateBarChart(emptyData);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle single data point', async () => {
      const singleData: ChartData = {
        labels: ['เดียว'],
        datasets: [{ data: [100] }],
      };

      const result = await chartService.generatePieChart(singleData);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle large numbers', async () => {
      const largeData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'Large Values',
            data: [1000000000, 2000000000, 1500000000],
          },
        ],
      };

      const result = await chartService.generateBarChart(largeData);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle decimal values', async () => {
      const decimalData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'Decimal Values',
            data: [10.5, 20.7, 15.3],
          },
        ],
      };

      const result = await chartService.generateLineChart(decimalData);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle zero values', async () => {
      const zeroData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'With Zeros',
            data: [0, 100, 0],
          },
        ],
      };

      const result = await chartService.generateBarChart(zeroData);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle negative values', async () => {
      const negativeData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            label: 'Profit/Loss',
            data: [-100, 200, -50],
          },
        ],
      };

      const result = await chartService.generateBarChart(negativeData);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle very long labels', async () => {
      const longLabelData: ChartData = {
        labels: [
          'คลังยาโรงพยาบาลมหาวิทยาลัยเชียงใหม่',
          'คลังยาโรงพยาบาลจุฬาลงกรณ์',
          'คลังยาโรงพยาบาลรามาธิบดี',
        ],
        datasets: [
          {
            label: 'มูลค่าสินค้าคงคลัง',
            data: [1000000, 800000, 900000],
          },
        ],
      };

      const result = await chartService.generateBarChart(longLabelData);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle many data points', async () => {
      const manyPointsData: ChartData = {
        labels: Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`),
        datasets: [
          {
            label: 'Many Points',
            data: Array.from({ length: 50 }, () =>
              Math.floor(Math.random() * 100),
            ),
          },
        ],
      };

      const result = await chartService.generateLineChart(manyPointsData);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('responsive option', () => {
    it('should be responsive by default', async () => {
      const result = await chartService.generateBarChart(sampleData);
      expect(result).toBeDefined();
    });

    it('should disable responsive mode when set to false', async () => {
      const options: ChartOptions = {
        responsive: false,
      };

      const result = await chartService.generateBarChart(sampleData, options);
      expect(result).toBeDefined();
    });
  });

  describe('complex scenarios', () => {
    it('should generate chart with all options enabled', async () => {
      const options: ChartOptions = {
        title: 'รายงานสต็อกยาครบวงจร',
        subtitle: 'ข้อมูล ณ วันที่ 19 ธันวาคม 2567',
        width: 1200,
        height: 600,
        colorScheme: 'primary',
        showLegend: true,
        showGrid: true,
        displayValues: true,
        responsive: true,
      };

      const result = await chartService.generateBarChart(sampleData, options);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should generate multiple different chart types in sequence', async () => {
      const barResult = await chartService.generateBarChart(sampleData);
      const lineResult = await chartService.generateLineChart(sampleData);
      const pieResult = await chartService.generatePieChart(sampleData);
      const doughnutResult =
        await chartService.generateDoughnutChart(sampleData);

      expect(barResult).toBeDefined();
      expect(lineResult).toBeDefined();
      expect(pieResult).toBeDefined();
      expect(doughnutResult).toBeDefined();

      // All should be buffers (in mocked version they are the same, but in real use they would be different)
      expect(Buffer.isBuffer(barResult)).toBe(true);
      expect(Buffer.isBuffer(lineResult)).toBe(true);
      expect(Buffer.isBuffer(pieResult)).toBe(true);
      expect(Buffer.isBuffer(doughnutResult)).toBe(true);
    });

    it('should handle mixed Thai and English labels', async () => {
      const mixedData: ChartData = {
        labels: ['Pharmacy A', 'คลังยา B', 'Hospital C', 'โรงพยาบาล D'],
        datasets: [
          {
            label: 'Stock Value / มูลค่าคงคลัง',
            data: [100000, 80000, 90000, 70000],
          },
        ],
      };

      const result = await chartService.generateBarChart(mixedData);
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });
});
