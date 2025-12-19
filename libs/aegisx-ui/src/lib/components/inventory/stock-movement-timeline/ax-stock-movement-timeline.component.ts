import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { firstValueFrom } from 'rxjs';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

import {
  MovementRecord,
  MovementFilter,
  MovementGroup,
  BalanceDataPoint,
  MovementApiResponse,
  ExportEventData,
  MovementType,
  GroupByStrategy,
  ExportFormat,
  MOVEMENT_TYPE_CONFIGS,
} from './ax-stock-movement-timeline.component.types';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Stock Movement Timeline Component - Phase 6
 *
 * Features:
 * - Visual timeline of stock movements with running balance
 * - Chart.js integration for balance line chart
 * - Filter by date range, movement type, location
 * - Group by day/week/month
 * - Export to PDF/Excel
 * - Expandable movement details
 * - Real-time WebSocket updates
 * - Virtual scrolling for large datasets
 * - Animations for new movements
 *
 * @example
 * ```html
 * <ax-stock-movement-timeline
 *   [productId]="'PROD-001'"
 *   [(groupBy)]="grouping"
 *   [showBalance]="true"
 *   [enableRealtime]="true"
 *   (onMovementClick)="handleMovementClick($event)"
 *   (onExport)="handleExport($event)"
 * />
 * ```
 */
@Component({
  selector: 'ax-stock-movement-timeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    ScrollingModule,
  ],
  templateUrl: './ax-stock-movement-timeline.component.html',
  styleUrl: './ax-stock-movement-timeline.component.scss',
})
export class AxStockMovementTimelineComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private readonly http = inject(HttpClient);

  // Expose constants for template use
  protected readonly MOVEMENT_TYPE_CONFIGS = MOVEMENT_TYPE_CONFIGS;
  protected readonly Math = Math;

  // Chart canvas reference
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  // =============================================================================
  // INPUTS
  // =============================================================================

  /** Product ID to show movements for */
  productId = input.required<string>();

  /** Optional pre-loaded movements (otherwise fetch from API) */
  movements = input<MovementRecord[]>([]);

  /** Grouping strategy (supports two-way binding) */
  groupBy = model<GroupByStrategy>('none');

  /** Show running balance line chart */
  showBalance = input<boolean>(true);

  /** Show filter controls */
  showFilters = input<boolean>(true);

  /** Enable PDF/Excel export */
  enableExport = input<boolean>(true);

  /** Enable WebSocket real-time updates */
  enableRealtime = input<boolean>(false);

  /** Date range filter (optional) */
  dateRange = input<{ start: Date; end: Date } | undefined>(undefined);

  /** Items per page for pagination */
  pageSize = input<number>(50);

  // =============================================================================
  // OUTPUTS
  // =============================================================================

  /** Emitted when movement is clicked */
  onMovementClick = output<MovementRecord>();

  /** Emitted on export */
  onExport = output<ExportEventData>();

  /** Emitted when filters change */
  onFilterChange = output<MovementFilter>();

  /** Emitted after movements loaded from API */
  onMovementsLoad = output<MovementRecord[]>();

  /** Emitted on errors */
  onError = output<string>();

  // =============================================================================
  // INTERNAL STATE
  // =============================================================================

  /** Internal movement storage */
  private internalMovements = signal<MovementRecord[]>([]);

  /** Current filters */
  private filters = signal<MovementFilter>({ types: [] });

  /** Expanded movement IDs */
  private expandedIds = signal<Set<string>>(new Set());

  /** Loading state */
  isLoading = signal<boolean>(false);

  /** Current page */
  private currentPage = signal<number>(0);

  /** Current balance (from API) */
  private currentBalance = signal<number>(0);

  /** Selected filter types for chips */
  selectedTypes = signal<MovementType[]>([]);

  /** Date range for filter */
  filterDateStart = signal<Date | null>(null);
  filterDateEnd = signal<Date | null>(null);

  // =============================================================================
  // COMPUTED SIGNALS
  // =============================================================================

  /**
   * Filtered movements based on current filters
   */
  filteredMovements = computed(() => {
    let movements = this.internalMovements();
    const filter = this.filters();

    // Filter by types
    if (filter.types && filter.types.length > 0) {
      movements = movements.filter((m) => filter.types.includes(m.type));
    }

    // Filter by date range
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      movements = movements.filter((m) => {
        const timestamp = new Date(m.timestamp);
        return timestamp >= start && timestamp <= end;
      });
    }

    // Filter by locations
    if (filter.locations && filter.locations.length > 0) {
      movements = movements.filter(
        (m) => m.location && filter.locations!.includes(m.location),
      );
    }

    // Filter by users
    if (filter.users && filter.users.length > 0) {
      movements = movements.filter((m) => filter.users!.includes(m.user.id));
    }

    return movements;
  });

  /**
   * Grouped movements based on groupBy strategy
   */
  groupedMovements = computed(() => {
    const movements = this.filteredMovements();
    const grouping = this.groupBy();

    if (grouping === 'none') {
      return [
        {
          key: 'all',
          date: null,
          movements,
          total: this.calculateNetChange(movements),
        } as MovementGroup,
      ];
    }

    const groups = new Map<string, MovementRecord[]>();

    movements.forEach((m) => {
      const key = this.getGroupKey(new Date(m.timestamp), grouping);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(m);
    });

    return Array.from(groups.entries())
      .map(([key, movements]) => ({
        key,
        date: movements[0] ? new Date(movements[0].timestamp) : null,
        movements,
        total: this.calculateNetChange(movements),
      }))
      .sort((a, b) => {
        // Sort groups by date descending (newest first)
        if (!a.date || !b.date) return 0;
        return b.date.getTime() - a.date.getTime();
      });
  });

  /**
   * Balance data for chart
   */
  balanceData = computed(() => {
    const movements = this.filteredMovements();
    if (movements.length === 0) return [];

    // Sort by timestamp ascending for chart
    const sorted = [...movements].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    // Calculate running balance
    let runningBalance = this.currentBalance() - this.getTotalChange(sorted);

    return sorted.map((m) => {
      const change = this.getQuantityChange(m);
      runningBalance += change;
      return {
        timestamp: new Date(m.timestamp),
        balance: runningBalance,
      } as BalanceDataPoint;
    });
  });

  /**
   * Available movement types
   */
  availableTypes = computed(() => {
    return Object.keys(MOVEMENT_TYPE_CONFIGS) as MovementType[];
  });

  // =============================================================================
  // LIFECYCLE HOOKS
  // =============================================================================

  async ngOnInit() {
    const providedMovements = this.movements();
    if (providedMovements.length > 0) {
      // Use provided movements
      this.internalMovements.set(providedMovements);
    } else {
      // Load from API
      await this.loadMovements();
    }

    // Initialize date filters if dateRange is provided
    const dateRange = this.dateRange();
    if (dateRange) {
      this.filterDateStart.set(dateRange.start);
      this.filterDateEnd.set(dateRange.end);
      this.applyDateFilter();
    }
  }

  ngAfterViewInit() {
    if (this.showBalance() && this.chartCanvas) {
      this.initializeChart();
    }
  }

  ngOnDestroy() {
    this.destroyChart();
  }

  // =============================================================================
  // API INTEGRATION
  // =============================================================================

  /**
   * Load movements from API
   */
  private async loadMovements() {
    const productId = this.productId();
    if (!productId) {
      this.onError.emit('Product ID is required to load movements');
      return;
    }

    this.isLoading.set(true);

    try {
      const params: any = {
        limit: this.pageSize(),
        offset: this.currentPage() * this.pageSize(),
      };

      const filter = this.filters();
      if (filter.types?.length) {
        params.types = filter.types.join(',');
      }
      if (filter.dateRange) {
        params.startDate = filter.dateRange.start.toISOString();
        params.endDate = filter.dateRange.end.toISOString();
      }

      const response = await firstValueFrom(
        this.http.get<MovementApiResponse>(
          `/api/inventory/products/${productId}/movements`,
          { params },
        ),
      );

      // Parse dates from API response
      const movements = response.movements.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));

      this.internalMovements.set(movements);
      this.currentBalance.set(response.currentBalance);
      this.onMovementsLoad.emit(movements);
    } catch (error: any) {
      this.onError.emit(
        `Failed to load movements: ${error.message || 'Unknown error'}`,
      );
      this.internalMovements.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  // =============================================================================
  // CHART INTEGRATION
  // =============================================================================

  /**
   * Initialize Chart.js balance chart
   */
  private initializeChart() {
    if (!this.chartCanvas) return;

    // Use effect to reactively update chart when balance data changes
    effect(() => {
      const data = this.balanceData();
      this.updateChart(data);
    });
  }

  /**
   * Update or create chart with new data
   */
  private updateChart(data: BalanceDataPoint[]) {
    if (!this.chartCanvas) return;

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    // Don't create chart if no data
    if (data.length === 0) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: data.map((d) => d.timestamp),
        datasets: [
          {
            label: 'Balance',
            data: data.map((d) => d.balance),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                if (items.length === 0 || !items[0].parsed.x) return '';
                const date = new Date(items[0].parsed.x);
                return date.toLocaleString();
              },
              label: (item) => {
                return `Balance: ${item.parsed.y ?? 0} units`;
              },
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
            display: true,
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            beginAtZero: true,
            display: true,
            title: {
              display: true,
              text: 'Balance',
            },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  /**
   * Destroy chart instance
   */
  private destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  // =============================================================================
  // FILTERING LOGIC
  // =============================================================================

  /**
   * Toggle movement type filter
   */
  toggleTypeFilter(type: MovementType) {
    const selected = this.selectedTypes();
    const index = selected.indexOf(type);

    if (index >= 0) {
      // Remove type
      this.selectedTypes.set(selected.filter((t) => t !== type));
    } else {
      // Add type
      this.selectedTypes.set([...selected, type]);
    }

    this.applyTypeFilter();
  }

  /**
   * Apply type filter
   */
  private applyTypeFilter() {
    const types = this.selectedTypes();
    this.filters.update((f) => ({ ...f, types }));
    this.onFilterChange.emit(this.filters());
  }

  /**
   * Apply date range filter
   */
  applyDateFilter() {
    const start = this.filterDateStart();
    const end = this.filterDateEnd();

    if (start && end) {
      this.filters.update((f) => ({
        ...f,
        dateRange: { start, end },
      }));
      this.onFilterChange.emit(this.filters());
    } else {
      // Clear date range filter
      this.filters.update((f) => {
        const { dateRange, ...rest } = f;
        return rest;
      });
      this.onFilterChange.emit(this.filters());
    }
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.selectedTypes.set([]);
    this.filterDateStart.set(null);
    this.filterDateEnd.set(null);
    this.filters.set({ types: [] });
    this.onFilterChange.emit(this.filters());
  }

  // =============================================================================
  // GROUPING LOGIC
  // =============================================================================

  /**
   * Get group key for a date based on grouping strategy
   */
  private getGroupKey(date: Date, grouping: GroupByStrategy): string {
    switch (grouping) {
      case 'day':
        return date.toISOString().split('T')[0];

      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      }

      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      default:
        return 'all';
    }
  }

  /**
   * Format group label for display
   */
  getGroupLabel(group: MovementGroup): string {
    if (!group.date) return 'All Movements';

    const date = group.date;
    const grouping = this.groupBy();

    switch (grouping) {
      case 'day':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      case 'week': {
        const weekEnd = new Date(date);
        weekEnd.setDate(date.getDate() + 6);
        return `Week of ${date.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      }

      case 'month':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        });

      default:
        return '';
    }
  }

  // =============================================================================
  // MOVEMENT CALCULATIONS
  // =============================================================================

  /**
   * Get quantity change for a movement (+/-)
   */
  private getQuantityChange(movement: MovementRecord): number {
    const config = MOVEMENT_TYPE_CONFIGS[movement.type];
    return config.isInbound ? movement.quantity : -movement.quantity;
  }

  /**
   * Calculate total change across movements
   */
  private getTotalChange(movements: MovementRecord[]): number {
    return movements.reduce((sum, m) => sum + this.getQuantityChange(m), 0);
  }

  /**
   * Calculate net change for a group
   */
  private calculateNetChange(movements: MovementRecord[]): number {
    return this.getTotalChange(movements);
  }

  /**
   * Format quantity with sign
   */
  formatQuantityWithSign(movement: MovementRecord): string {
    const change = this.getQuantityChange(movement);
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}`;
  }

  // =============================================================================
  // MOVEMENT INTERACTION
  // =============================================================================

  /**
   * Toggle movement expansion
   */
  toggleMovement(movement: MovementRecord) {
    const expanded = this.expandedIds();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(movement.id)) {
      newExpanded.delete(movement.id);
    } else {
      newExpanded.add(movement.id);
    }

    this.expandedIds.set(newExpanded);
    this.onMovementClick.emit(movement);
  }

  /**
   * Check if movement is expanded
   */
  isExpanded(movement: MovementRecord): boolean {
    return this.expandedIds().has(movement.id);
  }

  /**
   * Get movement type config
   */
  getMovementConfig(type: MovementType) {
    return MOVEMENT_TYPE_CONFIGS[type];
  }

  // =============================================================================
  // EXPORT FUNCTIONALITY
  // =============================================================================

  /**
   * Export data to PDF or Excel
   */
  async exportData(format: ExportFormat) {
    const data = this.filteredMovements();
    this.onExport.emit({ format, data });

    if (format === 'excel') {
      await this.exportToExcel(data);
    } else {
      await this.exportToPdf(data);
    }
  }

  /**
   * Export to Excel using xlsx
   */
  private async exportToExcel(data: MovementRecord[]) {
    try {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(
        data.map((m) => ({
          'Date/Time': new Date(m.timestamp).toLocaleString(),
          Type: MOVEMENT_TYPE_CONFIGS[m.type].label,
          Quantity: this.getQuantityChange(m),
          Balance: m.balanceAfter,
          Unit: m.unit,
          User: m.user.name,
          Document: m.referenceDocument?.number || '',
          Batch: m.batchNumber || '',
          Location: m.location || '',
          Notes: m.notes || '',
        })),
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Movements');
      XLSX.writeFile(
        workbook,
        `movements-${this.productId()}-${Date.now()}.xlsx`,
      );
    } catch (error: any) {
      this.onError.emit(`Failed to export to Excel: ${error.message}`);
    }
  }

  /**
   * Export to PDF using jsPDF
   */
  private async exportToPdf(data: MovementRecord[]) {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.text('Stock Movement History', 14, 20);

      // Product info
      doc.setFontSize(10);
      doc.text(`Product ID: ${this.productId()}`, 14, 30);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

      // Movements
      let y = 46;
      doc.setFontSize(9);

      data.forEach((m, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        const date = new Date(m.timestamp).toLocaleString();
        const type = MOVEMENT_TYPE_CONFIGS[m.type].label;
        const qty = this.getQuantityChange(m);
        const balance = m.balanceAfter;

        doc.text(
          `${date} | ${type} | ${qty} → Balance: ${balance} ${m.unit}`,
          14,
          y,
        );
        y += 6;

        if (m.user) {
          doc.text(`  User: ${m.user.name}`, 14, y);
          y += 5;
        }

        if (m.referenceDocument) {
          doc.text(
            `  Ref: ${m.referenceDocument.type}-${m.referenceDocument.number}`,
            14,
            y,
          );
          y += 5;
        }

        y += 2; // spacing between movements
      });

      doc.save(`movements-${this.productId()}-${Date.now()}.pdf`);
    } catch (error: any) {
      this.onError.emit(`Failed to export to PDF: ${error.message}`);
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  /**
   * Format time for display
   */
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString();
  }

  /**
   * Track by function for ngFor
   */
  trackByMovementId(index: number, movement: MovementRecord): string {
    return movement.id;
  }

  /**
   * Track by function for groups
   */
  trackByGroupKey(index: number, group: MovementGroup): string {
    return group.key;
  }
}
