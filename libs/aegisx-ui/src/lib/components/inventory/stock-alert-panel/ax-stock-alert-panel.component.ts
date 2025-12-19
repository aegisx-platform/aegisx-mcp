import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import {
  AlertActionEvent,
  AlertCounts,
  AlertFilter,
  AlertGroup,
  AlertGroupBy,
  AlertPanelConfig,
  AlertSeverity,
  AlertType,
  SoundConfig,
  StockAlert,
  WebSocketAlertMessage,
} from './ax-stock-alert-panel.component.types';

/**
 * Stock Alert Panel Component
 * =============================================================================
 *
 * Displays real-time stock alerts and notifications with the following features:
 * - Alert types: low stock, expiring soon, out of stock, overstocked
 * - Priority indicators (critical/warning/info)
 * - Filtering by type, priority, location
 * - Mark as read/resolved actions
 * - WebSocket integration for real-time updates
 * - Notification sounds (optional)
 * - Alert history
 *
 * @example
 * ```html
 * <ax-stock-alert-panel
 *   [alerts]="myAlerts"
 *   [groupBy]="'priority'"
 *   [maxDisplay]="10"
 *   [enableRealtime]="true"
 *   [enableSounds]="true"
 *   (onAlertClick)="handleAlertClick($event)"
 *   (onAlertAction)="handleAction($event)"
 *   (onAlertDismiss)="handleDismiss($event)">
 * </ax-stock-alert-panel>
 * ```
 */
@Component({
  selector: 'ax-stock-alert-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatChipsModule,
    MatSelectModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatDividerModule,
  ],
  templateUrl: './ax-stock-alert-panel.component.html',
  styleUrls: ['./ax-stock-alert-panel.component.scss'],
})
export class AxStockAlertPanelComponent implements OnInit, OnDestroy {
  // =============================================================================
  // INPUTS
  // =============================================================================

  /**
   * Pre-loaded alerts (optional)
   * If provided, these alerts will be displayed. Otherwise, component will
   * attempt to load alerts from the configured API endpoint.
   */
  alerts = input<StockAlert[]>([]);

  /**
   * Alert grouping strategy
   * - 'priority': Group by severity (critical, warning, info)
   * - 'type': Group by alert type (low-stock, expiring, etc.)
   * - 'location': Group by location
   * - 'none': No grouping, flat list
   */
  groupBy = input<AlertGroupBy>('priority');

  /**
   * Show action buttons on alerts
   */
  showActions = input<boolean>(true);

  /**
   * Maximum number of alerts to display
   * Alerts beyond this limit will be shown via "View All" link
   */
  maxDisplay = input<number>(10);

  /**
   * Enable real-time WebSocket updates
   * When enabled, component will subscribe to WebSocket for live alert updates
   */
  enableRealtime = input<boolean>(false);

  /**
   * Enable notification sounds
   * When enabled, plays sound notifications for new critical/warning alerts
   */
  enableSounds = input<boolean>(false);

  /**
   * Alert filter criteria
   * Used to filter alerts by type, severity, location, etc.
   */
  filters = input<AlertFilter | undefined>(undefined);

  /**
   * Component configuration
   * Advanced configuration options for the alert panel
   */
  config = input<AlertPanelConfig | undefined>(undefined);

  // =============================================================================
  // OUTPUTS
  // =============================================================================

  /**
   * Emitted when an alert is clicked
   */
  onAlertClick = output<StockAlert>();

  /**
   * Emitted when an action button is clicked
   */
  onAlertAction = output<AlertActionEvent>();

  /**
   * Emitted when an alert is dismissed
   */
  onAlertDismiss = output<string>();

  /**
   * Emitted when an alert is marked as resolved
   */
  onAlertResolve = output<string>();

  /**
   * Emitted after alerts are loaded from API
   */
  onAlertsLoad = output<StockAlert[]>();

  // =============================================================================
  // INTERNAL STATE (SIGNALS)
  // =============================================================================

  /**
   * Internal alerts state
   * Managed by the component, merged with input alerts
   */
  private internalAlerts = signal<StockAlert[]>([]);

  /**
   * Loading state
   */
  isLoading = signal<boolean>(false);

  /**
   * Error state
   */
  error = signal<string | null>(null);

  /**
   * WebSocket connection state
   */
  protected wsConnected = signal<boolean>(false);

  /**
   * WebSocket instance (mock for demonstration)
   */
  private ws: any = null;

  /**
   * Audio context for sound notifications
   */
  private audioContext: AudioContext | null = null;

  /**
   * Auto-refresh interval ID
   */
  private autoRefreshInterval: any = null;

  // =============================================================================
  // COMPUTED SIGNALS
  // =============================================================================

  /**
   * Filtered alerts based on filter criteria
   */
  filteredAlerts = computed(() => {
    let alerts = this.internalAlerts();
    const filter = this.filters();

    if (!filter) {
      return alerts;
    }

    // Filter by types
    if (filter.types && filter.types.length > 0) {
      alerts = alerts.filter((a) => filter.types!.includes(a.type));
    }

    // Filter by severity
    if (filter.severity && filter.severity.length > 0) {
      alerts = alerts.filter((a) => filter.severity!.includes(a.severity));
    }

    // Filter by product IDs
    if (filter.productIds && filter.productIds.length > 0) {
      alerts = alerts.filter((a) => filter.productIds!.includes(a.product.id));
    }

    // Filter by location IDs
    if (filter.locationIds && filter.locationIds.length > 0) {
      alerts = alerts.filter(
        (a) =>
          a.metadata?.locationId &&
          filter.locationIds!.includes(a.metadata.locationId),
      );
    }

    // Filter unread only
    if (filter.unreadOnly) {
      alerts = alerts.filter((a) => !a.read);
    }

    // Filter unresolved only
    if (filter.unresolvedOnly) {
      alerts = alerts.filter((a) => !a.resolved);
    }

    return alerts;
  });

  /**
   * Grouped alerts based on groupBy strategy
   */
  groupedAlerts = computed((): AlertGroup[] => {
    const alerts = this.filteredAlerts();
    const grouping = this.groupBy();
    const max = this.maxDisplay();

    if (grouping === 'none') {
      return [
        {
          key: 'all',
          label: 'All Alerts',
          alerts: alerts.slice(0, max),
          criticalCount: alerts.filter((a) => a.severity === 'critical').length,
          warningCount: alerts.filter((a) => a.severity === 'warning').length,
          infoCount: alerts.filter((a) => a.severity === 'info').length,
        },
      ];
    }

    const groups = new Map<string, StockAlert[]>();

    alerts.forEach((alert) => {
      const key = this.getGroupKey(alert, grouping);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(alert);
    });

    // Convert to AlertGroup array with counts
    const result: AlertGroup[] = [];

    // Define priority order for groups
    const priorityOrder = ['critical', 'warning', 'info'];
    const typeOrder = [
      'out-of-stock',
      'expired',
      'low-stock',
      'expiring',
      'overstock',
      'reorder',
    ];

    // Sort groups based on grouping strategy
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
      if (grouping === 'priority') {
        return priorityOrder.indexOf(a) - priorityOrder.indexOf(b);
      } else if (grouping === 'type') {
        return typeOrder.indexOf(a) - typeOrder.indexOf(b);
      }
      return a.localeCompare(b);
    });

    sortedKeys.forEach((key) => {
      const groupAlerts = groups.get(key)!;
      result.push({
        key,
        label: this.getGroupLabel(key, grouping),
        alerts: groupAlerts.slice(0, max),
        criticalCount: groupAlerts.filter((a) => a.severity === 'critical')
          .length,
        warningCount: groupAlerts.filter((a) => a.severity === 'warning')
          .length,
        infoCount: groupAlerts.filter((a) => a.severity === 'info').length,
      });
    });

    return result;
  });

  /**
   * Alert counts by severity
   */
  alertCounts = computed((): AlertCounts => {
    const alerts = this.filteredAlerts();
    return {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      info: alerts.filter((a) => a.severity === 'info').length,
      unread: alerts.filter((a) => !a.read).length,
      unresolved: alerts.filter((a) => !a.resolved).length,
    };
  });

  /**
   * Whether there are more alerts than maxDisplay
   */
  hasMoreAlerts = computed(() => {
    return this.filteredAlerts().length > this.maxDisplay();
  });

  /**
   * Count of hidden alerts
   */
  hiddenAlertsCount = computed(() => {
    const total = this.filteredAlerts().length;
    const max = this.maxDisplay();
    return Math.max(0, total - max);
  });

  // =============================================================================
  // LIFECYCLE HOOKS
  // =============================================================================

  constructor() {
    // Effect to sync input alerts with internal state
    effect(() => {
      const inputAlerts = this.alerts();
      if (inputAlerts.length > 0) {
        this.internalAlerts.set(inputAlerts);
      }
    });
  }

  ngOnInit(): void {
    // Load alerts if not provided via input
    if (this.alerts().length === 0) {
      this.loadAlerts();
    }

    // Setup WebSocket if enabled
    if (this.enableRealtime()) {
      this.setupWebSocket();
    }

    // Setup auto-refresh if configured
    const refreshInterval = this.config()?.autoRefreshInterval;
    if (refreshInterval && refreshInterval > 0) {
      this.autoRefreshInterval = setInterval(() => {
        this.loadAlerts();
      }, refreshInterval);
    }

    // Initialize audio context if sounds enabled
    if (this.enableSounds()) {
      this.initAudioContext();
    }
  }

  ngOnDestroy(): void {
    // Cleanup WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Cleanup auto-refresh
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }

    // Cleanup audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  // =============================================================================
  // PUBLIC METHODS
  // =============================================================================

  /**
   * Handle alert click
   */
  handleAlertClick(alert: StockAlert): void {
    // Mark alert as read
    if (!alert.read) {
      this.markAsRead(alert.id);
    }

    this.onAlertClick.emit(alert);
  }

  /**
   * Handle action button click
   */
  handleAction(alert: StockAlert, action: string): void {
    const event: AlertActionEvent = {
      alert,
      action: action as any,
    };
    this.onAlertAction.emit(event);
  }

  /**
   * Dismiss an alert
   */
  dismissAlert(alertId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Remove from internal state
    this.internalAlerts.update((alerts) =>
      alerts.filter((a) => a.id !== alertId),
    );

    this.onAlertDismiss.emit(alertId);

    // In a real implementation, you would also call the API to persist the dismissal
    // this.http.post(`/api/inventory/alerts/${alertId}/dismiss`, {}).subscribe();
  }

  /**
   * Mark alert as resolved
   */
  resolveAlert(alertId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Update internal state
    this.internalAlerts.update((alerts) =>
      alerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
    );

    this.onAlertResolve.emit(alertId);

    // In a real implementation, you would also call the API
    // this.http.post(`/api/inventory/alerts/${alertId}/resolve`, {}).subscribe();
  }

  /**
   * Mark alert as read
   */
  markAsRead(alertId: string): void {
    this.internalAlerts.update((alerts) =>
      alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a)),
    );

    // In a real implementation, you would also call the API
    // this.http.post(`/api/inventory/alerts/${alertId}/mark-read`, {}).subscribe();
  }

  /**
   * Refresh alerts manually
   */
  refreshAlerts(): void {
    this.loadAlerts();
  }

  /**
   * Get severity icon
   */
  getSeverityIcon(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'notifications';
    }
  }

  /**
   * Get severity color class
   */
  getSeverityClass(severity: AlertSeverity): string {
    return `severity-${severity}`;
  }

  /**
   * Get alert type icon
   */
  getAlertTypeIcon(type: AlertType): string {
    switch (type) {
      case 'low-stock':
        return 'trending_down';
      case 'out-of-stock':
        return 'remove_circle';
      case 'expiring':
        return 'schedule';
      case 'expired':
        return 'event_busy';
      case 'overstock':
        return 'trending_up';
      case 'reorder':
        return 'refresh';
      default:
        return 'notifications';
    }
  }

  /**
   * Get suggested actions for an alert
   */
  getSuggestedActions(alert: StockAlert): string[] {
    if (alert.suggestedActions && alert.suggestedActions.length > 0) {
      return alert.suggestedActions;
    }

    // Default actions based on alert type
    switch (alert.type) {
      case 'out-of-stock':
        return ['create-po', 'view-product'];
      case 'low-stock':
        return ['reorder', 'view-product'];
      case 'expired':
        return ['dispose', 'view-product'];
      case 'expiring':
        return ['view-product', 'adjust-stock'];
      case 'overstock':
        return ['adjust-stock', 'view-product'];
      default:
        return ['view-product'];
    }
  }

  /**
   * Get action label
   */
  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'create-po': 'Create PO',
      'adjust-stock': 'Adjust Stock',
      'view-product': 'View Product',
      dispose: 'Dispose',
      reorder: 'Reorder',
      dismiss: 'Dismiss',
      resolve: 'Resolve',
    };
    return labels[action] || action;
  }

  /**
   * Get action icon
   */
  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      'create-po': 'add_shopping_cart',
      'adjust-stock': 'edit',
      'view-product': 'visibility',
      dispose: 'delete',
      reorder: 'refresh',
      dismiss: 'close',
      resolve: 'check',
    };
    return icons[action] || 'touch_app';
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Load alerts from API (mock implementation)
   */
  private loadAlerts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Mock API call - in real implementation, use HttpClient
    setTimeout(() => {
      try {
        // Mock data
        const mockAlerts: StockAlert[] = this.generateMockAlerts();
        this.internalAlerts.set(mockAlerts);
        this.onAlertsLoad.emit(mockAlerts);
        this.isLoading.set(false);
      } catch (err: any) {
        this.error.set(err.message || 'Failed to load alerts');
        this.isLoading.set(false);
      }
    }, 500);
  }

  /**
   * Setup WebSocket connection (mock implementation)
   */
  private setupWebSocket(): void {
    // Mock WebSocket implementation
    // In real implementation, use WebSocket or a WebSocket service

    // Simulate connection after 1 second
    setTimeout(() => {
      this.wsConnected.set(true);

      // Simulate receiving new alerts every 10 seconds
      setInterval(() => {
        const newAlert = this.generateRandomAlert();
        this.handleWebSocketMessage({
          type: 'new-alert',
          data: newAlert,
          timestamp: new Date(),
        });
      }, 10000);
    }, 1000);
  }

  /**
   * Handle WebSocket message
   */
  private handleWebSocketMessage(message: WebSocketAlertMessage): void {
    switch (message.type) {
      case 'new-alert':
        // Add new alert to the beginning
        this.internalAlerts.update((alerts) => [message.data, ...alerts]);

        // Play notification sound if enabled
        if (this.enableSounds()) {
          this.playNotificationSound(message.data.severity);
        }
        break;

      case 'alert-updated':
        // Update existing alert
        this.internalAlerts.update((alerts) =>
          alerts.map((a) => (a.id === message.data.id ? message.data : a)),
        );
        break;

      case 'alert-resolved':
        // Mark alert as resolved
        this.internalAlerts.update((alerts) =>
          alerts.map((a) =>
            a.id === message.data.id ? { ...a, resolved: true } : a,
          ),
        );
        break;

      case 'alert-dismissed':
        // Remove alert
        this.internalAlerts.update((alerts) =>
          alerts.filter((a) => a.id !== message.data.id),
        );
        break;
    }
  }

  /**
   * Initialize audio context for sound notifications
   */
  private initAudioContext(): void {
    if (typeof AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
    } else if (typeof (window as any).webkitAudioContext !== 'undefined') {
      this.audioContext = new (window as any).webkitAudioContext();
    }
  }

  /**
   * Play notification sound using Web Audio API
   */
  private playNotificationSound(severity: AlertSeverity): void {
    if (!this.audioContext) {
      return;
    }

    const soundConfig = this.config()?.soundConfig;
    const volume = soundConfig?.volume ?? 0.3;

    // Create oscillator for simple beep/chime sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Set frequency based on severity
    let frequency = 440; // Default A4
    if (severity === 'critical') {
      frequency = 880; // Higher pitch for critical
    } else if (severity === 'warning') {
      frequency = 660; // Medium pitch for warning
    }

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Set volume
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.3,
    );

    // Play sound
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Get group key for an alert based on grouping strategy
   */
  private getGroupKey(alert: StockAlert, grouping: AlertGroupBy): string {
    switch (grouping) {
      case 'type':
        return alert.type;
      case 'priority':
        return alert.severity;
      case 'location':
        return alert.metadata?.locationId || 'unknown';
      default:
        return 'all';
    }
  }

  /**
   * Get group label based on key and grouping strategy
   */
  private getGroupLabel(key: string, grouping: AlertGroupBy): string {
    if (grouping === 'priority') {
      const labels: Record<string, string> = {
        critical: 'Critical',
        warning: 'Warning',
        info: 'Information',
      };
      return labels[key] || key;
    }

    if (grouping === 'type') {
      const labels: Record<string, string> = {
        'low-stock': 'Low Stock',
        'out-of-stock': 'Out of Stock',
        expiring: 'Expiring Soon',
        expired: 'Expired',
        overstock: 'Overstock',
        reorder: 'Reorder Point',
      };
      return labels[key] || key;
    }

    if (grouping === 'location') {
      return key === 'unknown' ? 'Unknown Location' : key;
    }

    return 'All Alerts';
  }

  /**
   * Generate mock alerts for demonstration
   */
  private generateMockAlerts(): StockAlert[] {
    return [
      {
        id: '1',
        type: 'out-of-stock',
        severity: 'critical',
        product: {
          id: 'prod-001',
          name: 'Aspirin 500mg',
          sku: 'SKU-001',
        },
        message: 'Product is out of stock',
        createdAt: new Date(Date.now() - 3600000),
        metadata: {
          currentStock: 0,
          minimumStock: 50,
        },
        read: false,
        resolved: false,
      },
      {
        id: '2',
        type: 'expired',
        severity: 'critical',
        product: {
          id: 'prod-042',
          name: 'Ibuprofen 200mg',
          sku: 'SKU-042',
        },
        message: 'Product has expired',
        createdAt: new Date(Date.now() - 7200000),
        metadata: {
          expiryDate: new Date(Date.now() - 432000000),
          batchNumber: 'BATCH-2023-099',
        },
        read: false,
        resolved: false,
      },
      {
        id: '3',
        type: 'low-stock',
        severity: 'warning',
        product: {
          id: 'prod-015',
          name: 'Paracetamol 650mg',
          sku: 'SKU-015',
        },
        message: 'Stock level below minimum threshold',
        createdAt: new Date(Date.now() - 10800000),
        metadata: {
          currentStock: 25,
          minimumStock: 50,
        },
        read: false,
        resolved: false,
      },
    ];
  }

  /**
   * Generate a random alert for WebSocket simulation
   */
  private generateRandomAlert(): StockAlert {
    const types: AlertType[] = [
      'low-stock',
      'out-of-stock',
      'expiring',
      'expired',
      'overstock',
    ];
    const severities: AlertSeverity[] = ['critical', 'warning', 'info'];

    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    return {
      id: `alert-${Date.now()}`,
      type,
      severity,
      product: {
        id: `prod-${Math.floor(Math.random() * 1000)}`,
        name: `Product ${Math.floor(Math.random() * 1000)}`,
        sku: `SKU-${Math.floor(Math.random() * 1000)}`,
      },
      message: `New ${type} alert`,
      createdAt: new Date(),
      read: false,
      resolved: false,
    };
  }
}
