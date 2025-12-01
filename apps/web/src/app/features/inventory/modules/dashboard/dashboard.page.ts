import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Dashboard Page Component
 *
 * Main dashboard page for inventory overview.
 * Shows KPIs, stock alerts, and quick actions.
 */
@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard-page">
      <header class="page-header">
        <h1>{{ pageTitle }}</h1>
        <p class="subtitle">{{ pageSubtitle }}</p>
      </header>

      @switch (view) {
        @case ('kpis') {
          <section class="kpi-section">
            <h2>KPI Metrics</h2>
            <div class="kpi-grid">
              @for (kpi of kpis; track kpi.title) {
                <mat-card class="kpi-card">
                  <mat-card-content>
                    <mat-icon [class]="kpi.iconClass">{{ kpi.icon }}</mat-icon>
                    <div class="kpi-value">{{ kpi.value }}</div>
                    <div class="kpi-title">{{ kpi.title }}</div>
                    <div
                      class="kpi-change"
                      [class.positive]="kpi.change > 0"
                      [class.negative]="kpi.change < 0"
                    >
                      {{ kpi.change > 0 ? '+' : '' }}{{ kpi.change }}%
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </section>
        }
        @case ('alerts') {
          <section class="alerts-section">
            <h2>Stock Alerts</h2>
            <div class="alerts-list">
              @for (alert of alerts; track alert.id) {
                <mat-card
                  class="alert-card"
                  [class]="'alert-' + alert.severity"
                >
                  <mat-card-content>
                    <mat-icon>{{ alert.icon }}</mat-icon>
                    <div class="alert-content">
                      <div class="alert-title">{{ alert.title }}</div>
                      <div class="alert-message">{{ alert.message }}</div>
                    </div>
                    <button mat-button color="primary">View</button>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </section>
        }
        @default {
          <section class="overview-section">
            <h2>Overview</h2>
            <div class="stats-grid">
              @for (stat of stats; track stat.title) {
                <mat-card class="stat-card">
                  <mat-card-content>
                    <mat-icon [style.color]="stat.color">{{
                      stat.icon
                    }}</mat-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stat.value }}</div>
                      <div class="stat-title">{{ stat.title }}</div>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>

            <div class="quick-actions">
              <h3>Quick Actions</h3>
              <div class="actions-grid">
                <button mat-raised-button color="primary">
                  <mat-icon>add</mat-icon>
                  New Stock Entry
                </button>
                <button mat-raised-button>
                  <mat-icon>qr_code_scanner</mat-icon>
                  Scan Barcode
                </button>
                <button mat-raised-button>
                  <mat-icon>swap_horiz</mat-icon>
                  Stock Transfer
                </button>
                <button mat-raised-button>
                  <mat-icon>calculate</mat-icon>
                  Stock Count
                </button>
              </div>
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: [
    `
      .dashboard-page {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 32px;

        h1 {
          font-size: 28px;
          font-weight: 500;
          margin: 0 0 8px 0;
          color: var(--ax-text-default);
        }

        .subtitle {
          color: var(--ax-text-muted);
          margin: 0;
        }
      }

      h2 {
        font-size: 20px;
        font-weight: 500;
        margin: 0 0 16px 0;
      }

      h3 {
        font-size: 16px;
        font-weight: 500;
        margin: 24px 0 12px 0;
      }

      .stats-grid,
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card,
      .kpi-card {
        mat-card-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
        }

        .stat-info,
        .kpi-value {
          flex: 1;
        }

        .stat-value,
        .kpi-value {
          font-size: 28px;
          font-weight: 600;
          color: var(--ax-text-default);
        }

        .stat-title,
        .kpi-title {
          font-size: 14px;
          color: var(--ax-text-muted);
        }
      }

      .kpi-card {
        mat-card-content {
          flex-direction: column;
          text-align: center;
        }

        .kpi-change {
          font-size: 14px;
          margin-top: 8px;

          &.positive {
            color: #10b981;
          }

          &.negative {
            color: #ef4444;
          }
        }
      }

      .alerts-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .alert-card {
        mat-card-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
        }

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-weight: 500;
        }

        .alert-message {
          font-size: 14px;
          color: var(--ax-text-muted);
        }

        &.alert-warning {
          border-left: 4px solid #f59e0b;
          mat-icon {
            color: #f59e0b;
          }
        }

        &.alert-critical {
          border-left: 4px solid #ef4444;
          mat-icon {
            color: #ef4444;
          }
        }

        &.alert-info {
          border-left: 4px solid #3b82f6;
          mat-icon {
            color: #3b82f6;
          }
        }
      }

      .quick-actions {
        margin-top: 32px;
      }

      .actions-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        button {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    `,
  ],
})
export class DashboardPage {
  private readonly route = inject(ActivatedRoute);

  get view(): string {
    return this.route.snapshot.data['view'] || 'overview';
  }

  get pageTitle(): string {
    switch (this.view) {
      case 'kpis':
        return 'KPI Metrics';
      case 'alerts':
        return 'Stock Alerts';
      default:
        return 'Inventory Dashboard';
    }
  }

  get pageSubtitle(): string {
    switch (this.view) {
      case 'kpis':
        return 'Track your key performance indicators';
      case 'alerts':
        return 'Monitor stock levels and warnings';
      default:
        return 'Monitor your inventory at a glance';
    }
  }

  // Sample data
  stats = [
    {
      icon: 'inventory_2',
      title: 'Total Items',
      value: '12,458',
      color: '#7c3aed',
    },
    {
      icon: 'warehouse',
      title: 'Warehouses',
      value: '5',
      color: '#0891b2',
    },
    {
      icon: 'move_to_inbox',
      title: 'Pending Receipts',
      value: '23',
      color: '#f97316',
    },
    {
      icon: 'local_shipping',
      title: 'Pending Shipments',
      value: '47',
      color: '#10b981',
    },
  ];

  kpis = [
    {
      icon: 'inventory',
      iconClass: 'text-primary',
      title: 'Stock Accuracy',
      value: '98.5%',
      change: 2.3,
    },
    {
      icon: 'trending_up',
      iconClass: 'text-success',
      title: 'Turnover Rate',
      value: '4.2x',
      change: 0.5,
    },
    {
      icon: 'schedule',
      iconClass: 'text-warning',
      title: 'Fill Rate',
      value: '94.8%',
      change: -1.2,
    },
    {
      icon: 'attach_money',
      iconClass: 'text-info',
      title: 'Inventory Value',
      value: '$1.2M',
      change: 5.7,
    },
  ];

  alerts = [
    {
      id: 1,
      icon: 'warning',
      severity: 'critical',
      title: 'Low Stock Alert',
      message: '15 items are below minimum stock level',
    },
    {
      id: 2,
      icon: 'schedule',
      severity: 'warning',
      title: 'Expiring Soon',
      message: '8 items will expire within 30 days',
    },
    {
      id: 3,
      icon: 'info',
      severity: 'info',
      title: 'Stock Count Due',
      message: 'Monthly stock count scheduled for tomorrow',
    },
  ];
}
