import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration, Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components
Chart.register(...registerables, ChartDataLabels);

/**
 * Chart Type Options
 */
export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'polarArea';

/**
 * Chart Color Scheme
 */
export const CHART_COLORS = {
  primary: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  success: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  info: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
  purple: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'],
  mixed: [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
  ],
};

/**
 * Chart Data Interface
 */
export interface ChartData {
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

/**
 * Chart Options Interface
 */
export interface ChartOptions {
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

/**
 * Chart Service
 *
 * Server-side chart generation using Chart.js
 * Generates charts as PNG buffers for embedding in PDFs
 */
export class ChartService {
  private canvas: ChartJSNodeCanvas;
  private readonly defaultWidth = 800;
  private readonly defaultHeight = 400;

  constructor(width?: number, height?: number) {
    this.canvas = new ChartJSNodeCanvas({
      width: width || this.defaultWidth,
      height: height || this.defaultHeight,
      backgroundColour: 'white',
    });
  }

  /**
   * Generate Bar Chart
   */
  async generateBarChart(
    data: ChartData,
    options: ChartOptions = {},
  ): Promise<Buffer> {
    const colors = this.getColors(
      options.colorScheme,
      data.datasets[0].data.length,
    );

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor || colors,
          borderColor:
            dataset.borderColor || colors.map((c) => this.darkenColor(c)),
          borderWidth: dataset.borderWidth || 1,
        })),
      },
      options: {
        responsive: options.responsive !== false,
        plugins: {
          title: {
            display: !!options.title,
            text: options.title || '',
            font: {
              size: 18,
              weight: 'bold',
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
          subtitle: {
            display: !!options.subtitle,
            text: options.subtitle || '',
            font: {
              size: 14,
            },
          },
          legend: {
            display: options.showLegend !== false,
            position: 'top',
          },
          datalabels: {
            display: options.displayValues === true,
            color: '#000',
            font: {
              weight: 'bold',
              size: 12,
            },
            formatter: (value: number) => {
              return value.toLocaleString();
            },
          } as any,
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: options.showGrid !== false,
            },
            ticks: {
              callback: function (value) {
                return value.toLocaleString();
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    };

    return await this.canvas.renderToBuffer(config);
  }

  /**
   * Generate Line Chart
   */
  async generateLineChart(
    data: ChartData,
    options: ChartOptions = {},
  ): Promise<Buffer> {
    const colors = this.getColors(options.colorScheme, data.datasets.length);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
          ...dataset,
          borderColor: dataset.borderColor || colors[index],
          backgroundColor:
            dataset.backgroundColor || this.transparentize(colors[index], 0.2),
          borderWidth: dataset.borderWidth || 2,
          fill: dataset.fill !== false,
          tension: 0.4, // Smooth curves
        })),
      },
      options: {
        responsive: options.responsive !== false,
        plugins: {
          title: {
            display: !!options.title,
            text: options.title || '',
            font: {
              size: 18,
              weight: 'bold',
            },
          },
          subtitle: {
            display: !!options.subtitle,
            text: options.subtitle || '',
            font: {
              size: 14,
            },
          },
          legend: {
            display: options.showLegend !== false,
            position: 'top',
          },
          datalabels: {
            display: options.displayValues === true,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 4,
            color: '#000',
            font: {
              weight: 'bold',
            },
            formatter: (value: number) => {
              return value.toLocaleString();
            },
          } as any,
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: options.showGrid !== false,
            },
          },
        },
      },
    };

    return await this.canvas.renderToBuffer(config);
  }

  /**
   * Generate Pie Chart
   */
  async generatePieChart(
    data: ChartData,
    options: ChartOptions = {},
  ): Promise<Buffer> {
    const colors = this.getColors(options.colorScheme, data.labels.length);

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.datasets[0].data,
            backgroundColor: colors,
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: options.responsive !== false,
        plugins: {
          title: {
            display: !!options.title,
            text: options.title || '',
            font: {
              size: 18,
              weight: 'bold',
            },
          },
          subtitle: {
            display: !!options.subtitle,
            text: options.subtitle || '',
            font: {
              size: 14,
            },
          },
          legend: {
            display: options.showLegend !== false,
            position: 'right',
          },
          datalabels: {
            display: options.displayValues !== false,
            color: '#fff',
            font: {
              weight: 'bold',
              size: 14,
            },
            formatter: (value: number, ctx: any) => {
              const sum = ctx.chart.data.datasets[0].data.reduce(
                (a: number, b: number) => a + b,
                0,
              );
              const percentage = ((value / sum) * 100).toFixed(1);
              return `${percentage}%`;
            },
          } as any,
        },
      },
    };

    return await this.canvas.renderToBuffer(config);
  }

  /**
   * Generate Doughnut Chart
   */
  async generateDoughnutChart(
    data: ChartData,
    options: ChartOptions = {},
  ): Promise<Buffer> {
    const colors = this.getColors(options.colorScheme, data.labels.length);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.datasets[0].data,
            backgroundColor: colors,
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: options.responsive !== false,
        plugins: {
          title: {
            display: !!options.title,
            text: options.title || '',
            font: {
              size: 18,
              weight: 'bold',
            },
          },
          legend: {
            display: options.showLegend !== false,
            position: 'right',
          },
          datalabels: {
            display: options.displayValues !== false,
            color: '#fff',
            font: {
              weight: 'bold',
            },
            formatter: (value: number, ctx: any) => {
              const sum = ctx.chart.data.datasets[0].data.reduce(
                (a: number, b: number) => a + b,
                0,
              );
              const percentage = ((value / sum) * 100).toFixed(1);
              return `${percentage}%`;
            },
          } as any,
        },
      },
    };

    return await this.canvas.renderToBuffer(config);
  }

  /**
   * Generate chart by type
   */
  async generateChart(
    type: ChartType,
    data: ChartData,
    options: ChartOptions = {},
  ): Promise<Buffer> {
    switch (type) {
      case 'bar':
        return await this.generateBarChart(data, options);
      case 'line':
        return await this.generateLineChart(data, options);
      case 'pie':
        return await this.generatePieChart(data, options);
      case 'doughnut':
        return await this.generateDoughnutChart(data, options);
      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }
  }

  /**
   * Get color palette
   */
  private getColors(
    scheme: keyof typeof CHART_COLORS | string[] | undefined,
    count: number,
  ): string[] {
    if (Array.isArray(scheme)) {
      return scheme;
    }

    const palette = scheme ? CHART_COLORS[scheme] : CHART_COLORS.mixed;

    // Repeat colors if needed
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }

    return colors;
  }

  /**
   * Darken color for borders
   */
  private darkenColor(color: string): string {
    // Simple darkening by reducing RGB values by 20%
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Make color transparent
   */
  private transparentize(color: string, alpha: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
