import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import {
  AxEnterpriseLayoutComponent,
  AxNavigationItem,
  AxBreadcrumbComponent,
  BreadcrumbItem,
  EnterprisePresetTheme,
  ENTERPRISE_PRESET_THEMES,
} from '@aegisx/ui';

interface ThemeOption {
  id: EnterprisePresetTheme;
  name: string;
  description: string;
  primary: string;
  headerBg: string;
}

@Component({
  selector: 'ax-enterprise-demo',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    AxEnterpriseLayoutComponent,
    AxBreadcrumbComponent,
  ],
  template: `
    <ax-enterprise-layout
      [appName]="'Enterprise Demo'"
      [navigation]="navigation"
      [showFooter]="true"
      [appTheme]="currentTheme()"
      [contentBackground]="'gray'"
      (logoutClicked)="onLogout()"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
        <button mat-icon-button matTooltip="Notifications">
          <mat-icon>notifications</mat-icon>
        </button>
        <button mat-icon-button matTooltip="Settings">
          <mat-icon>settings</mat-icon>
        </button>
      </ng-template>

      <!-- Main Content -->
      <div class="demo-content">
        <!-- Breadcrumb -->
        <ax-breadcrumb
          [items]="breadcrumbItems"
          separatorIcon="chevron_right"
          size="sm"
        ></ax-breadcrumb>

        <!-- Theme Switcher Card -->
        <mat-card appearance="outlined" class="theme-switcher-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>palette</mat-icon>
              Theme Switcher
            </mat-card-title>
            <mat-card-subtitle>
              เลือก theme เพื่อดูการเปลี่ยนสีของ header และองค์ประกอบต่างๆ
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="theme-grid">
              @for (theme of themeOptions; track theme.id) {
                <button
                  class="theme-option"
                  [class.active]="currentTheme() === theme.id"
                  (click)="selectTheme(theme.id)"
                >
                  <div
                    class="theme-preview"
                    [style.background]="theme.headerBg"
                  >
                    <div
                      class="theme-dot"
                      [style.background]="theme.primary"
                    ></div>
                  </div>
                  <div class="theme-info">
                    <span class="theme-name">{{ theme.name }}</span>
                    <span class="theme-desc">{{ theme.description }}</span>
                  </div>
                  @if (currentTheme() === theme.id) {
                    <mat-icon class="check-icon">check_circle</mat-icon>
                  }
                </button>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card appearance="outlined" class="stat-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">12,847</span>
                <span class="stat-label">Total Users</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined" class="stat-card">
            <mat-card-content>
              <div class="stat-icon revenue">
                <mat-icon>attach_money</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">$847,293</span>
                <span class="stat-label">Revenue</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined" class="stat-card">
            <mat-card-content>
              <div class="stat-icon orders">
                <mat-icon>shopping_cart</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">3,847</span>
                <span class="stat-label">Orders</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined" class="stat-card">
            <mat-card-content>
              <div class="stat-icon growth">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">+24.5%</span>
                <span class="stat-label">Growth</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Main Content Area -->
        <div class="main-content-grid">
          <mat-card appearance="outlined" class="chart-card">
            <mat-card-header>
              <mat-card-title>Revenue Overview</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-placeholder">
                <mat-icon>show_chart</mat-icon>
                <p>Chart Area - Full Width Available</p>
                <span>This is where your data visualizations would go</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined" class="table-card">
            <mat-card-header>
              <mat-card-title>Recent Transactions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="table-placeholder">
                <div class="table-row header">
                  <span>ID</span>
                  <span>Customer</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>
                @for (item of tableData; track item.id) {
                  <div class="table-row">
                    <span>{{ item.id }}</span>
                    <span>{{ item.customer }}</span>
                    <span>{{ item.amount }}</span>
                    <span class="status" [class]="item.statusClass">{{
                      item.status
                    }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Info Box -->
        <mat-card appearance="outlined" class="info-card">
          <mat-card-content>
            <mat-icon class="info-icon">info</mat-icon>
            <div class="info-text">
              <strong>Enterprise Layout Theme Demo</strong>
              <p>
                ลองเลือก theme ด้านบนเพื่อดูการเปลี่ยนสีของ header แต่ละ theme
                ออกแบบมาสำหรับ industry ต่างๆ เช่น Medical (สีฟ้าเขียว), Finance
                (สีเขียวมรกต), Inventory (สีม่วง) คุณสามารถใช้ preset themes
                หรือสร้าง custom theme ของตัวเองได้
              </p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Footer Content -->
      <ng-template #footerContent>
        <span>Enterprise Demo - AegisX Design System</span>
        <a mat-button routerLink="/docs/components/aegisx/layout/enterprise">
          View Documentation
        </a>
      </ng-template>
    </ax-enterprise-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      .demo-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Theme Switcher Card */
      .theme-switcher-card {
        mat-card-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--ax-border-default);

          mat-card-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.125rem;
            font-weight: 600;
            margin: 0;

            mat-icon {
              color: var(--ax-brand-default);
            }
          }

          mat-card-subtitle {
            margin-top: 0.25rem;
            font-size: 0.875rem;
          }
        }

        mat-card-content {
          padding: 1.25rem !important;
        }
      }

      .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.75rem;
      }

      .theme-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border: 2px solid var(--ax-border-default);
        border-radius: var(--ax-radius-lg);
        background: var(--ax-background-surface);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;

        &:hover {
          border-color: var(--ax-border-emphasis);
          background: var(--ax-background-subtle);
        }

        &.active {
          border-color: var(--ax-brand-default);
          background: var(--ax-brand-faint);
        }
      }

      .theme-preview {
        width: 40px;
        height: 40px;
        border-radius: var(--ax-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .theme-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.5);
      }

      .theme-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .theme-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ax-text-heading);
      }

      .theme-desc {
        font-size: 0.6875rem;
        color: var(--ax-text-subtle);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .check-icon {
        color: var(--ax-brand-default);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .stat-card {
        mat-card-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem !important;
        }
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ax-radius-lg);
        background: var(--ax-brand-faint);
        color: var(--ax-brand-default);

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        &.revenue {
          background: var(--ax-success-faint);
          color: var(--ax-success-default);
        }

        &.orders {
          background: var(--ax-info-faint);
          color: var(--ax-info-default);
        }

        &.growth {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-default);
        }
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ax-text-heading);
      }

      .stat-label {
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
      }

      /* Main Content Grid */
      .main-content-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;

        @media (min-width: 1024px) {
          grid-template-columns: 1fr 1fr;
        }
      }

      .chart-card,
      .table-card {
        min-height: 300px;
      }

      .chart-placeholder {
        height: 250px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--ax-background-subtle);
        border-radius: var(--ax-radius-md);
        color: var(--ax-text-secondary);

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        p {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        span {
          font-size: 0.875rem;
        }
      }

      /* Table Placeholder */
      .table-placeholder {
        display: flex;
        flex-direction: column;
      }

      .table-row {
        display: grid;
        grid-template-columns: 80px 1fr 100px 100px;
        gap: 1rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--ax-border-default);
        font-size: 0.875rem;

        &.header {
          font-weight: 600;
          color: var(--ax-text-heading);
          background: var(--ax-background-subtle);
        }

        &:last-child {
          border-bottom: none;
        }
      }

      .status {
        padding: 0.25rem 0.5rem;
        border-radius: var(--ax-radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
        text-align: center;

        &.success {
          background: var(--ax-success-faint);
          color: var(--ax-success-700);
        }

        &.pending {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-700);
        }

        &.failed {
          background: var(--ax-error-faint);
          color: var(--ax-error-700);
        }
      }

      /* Info Card */
      .info-card {
        background: var(--ax-info-faint);
        border: 1px solid var(--ax-info-200);

        mat-card-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem !important;
        }
      }

      .info-icon {
        color: var(--ax-info-default);
        font-size: 24px;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .info-text {
        strong {
          color: var(--ax-info-700);
          font-size: 1rem;
        }

        p {
          margin: 0.5rem 0 0 0;
          font-size: 0.9375rem;
          color: var(--ax-info-700);
          line-height: 1.6;
        }
      }
    `,
  ],
})
export class EnterpriseDemoComponent {
  // Current selected theme
  currentTheme = signal<EnterprisePresetTheme>('default');

  // Theme options for the switcher
  themeOptions: ThemeOption[] = [
    {
      id: 'default',
      name: 'Default',
      description: 'General apps',
      primary: ENTERPRISE_PRESET_THEMES.default.primary,
      headerBg: ENTERPRISE_PRESET_THEMES.default.headerBg,
    },
    {
      id: 'medical',
      name: 'Medical',
      description: 'Healthcare/HIS',
      primary: ENTERPRISE_PRESET_THEMES.medical.primary,
      headerBg: ENTERPRISE_PRESET_THEMES.medical.headerBg,
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Banking',
      primary: ENTERPRISE_PRESET_THEMES.finance.primary,
      headerBg: ENTERPRISE_PRESET_THEMES.finance.headerBg,
    },
    {
      id: 'inventory',
      name: 'Inventory',
      description: 'Warehouse',
      primary: ENTERPRISE_PRESET_THEMES.inventory.primary,
      headerBg: ENTERPRISE_PRESET_THEMES.inventory.headerBg,
    },
    {
      id: 'hr',
      name: 'HR',
      description: 'Human Resources',
      primary: ENTERPRISE_PRESET_THEMES.hr.primary,
      headerBg: ENTERPRISE_PRESET_THEMES.hr.headerBg,
    },
    {
      id: 'education',
      name: 'Education',
      description: 'LMS',
      primary: ENTERPRISE_PRESET_THEMES.education.primary,
      headerBg: ENTERPRISE_PRESET_THEMES.education.headerBg,
    },
    {
      id: 'retail',
      name: 'Retail',
      description: 'POS',
      primary: ENTERPRISE_PRESET_THEMES.retail.primary,
      headerBg: ENTERPRISE_PRESET_THEMES.retail.headerBg,
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      description: 'MES',
      primary: ENTERPRISE_PRESET_THEMES.manufacturing.primary,
      headerBg: ENTERPRISE_PRESET_THEMES.manufacturing.headerBg,
    },
    {
      id: 'logistics',
      name: 'Logistics',
      description: 'TMS',
      primary: ENTERPRISE_PRESET_THEMES.logistics.primary,
      headerBg: ENTERPRISE_PRESET_THEMES.logistics.headerBg,
    },
  ];

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Enterprise Demo', url: '/enterprise-demo' },
    { label: 'Dashboard' },
  ];

  navigation: AxNavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      link: '/enterprise-demo',
      icon: 'dashboard',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      link: '/enterprise-demo',
      icon: 'analytics',
    },
    {
      id: 'reports',
      title: 'Reports',
      link: '/enterprise-demo',
      icon: 'assessment',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      children: [
        { id: 'profile', title: 'Profile', link: '/enterprise-demo' },
        { id: 'account', title: 'Account', link: '/enterprise-demo' },
        { id: 'billing', title: 'Billing', link: '/enterprise-demo' },
      ],
    },
  ];

  subNavigation: AxNavigationItem[] = [
    {
      id: 'overview',
      title: 'Overview',
      link: '/enterprise-demo',
      icon: 'home',
    },
    { id: 'performance', title: 'Performance', link: '/enterprise-demo' },
    {
      id: 'users',
      title: 'Users',
      link: '/enterprise-demo',
      badge: { content: '12' },
      badgeColor: 'primary',
    },
    { id: 'revenue', title: 'Revenue', link: '/enterprise-demo' },
    {
      id: 'growth',
      title: 'Growth',
      link: '/enterprise-demo',
      badge: { content: 'New' },
      badgeColor: 'accent',
    },
  ];

  tableData = [
    {
      id: '#TXN001',
      customer: 'John Doe',
      amount: '$1,234.00',
      status: 'Completed',
      statusClass: 'success',
    },
    {
      id: '#TXN002',
      customer: 'Jane Smith',
      amount: '$567.00',
      status: 'Pending',
      statusClass: 'pending',
    },
    {
      id: '#TXN003',
      customer: 'Bob Johnson',
      amount: '$2,890.00',
      status: 'Completed',
      statusClass: 'success',
    },
    {
      id: '#TXN004',
      customer: 'Alice Brown',
      amount: '$345.00',
      status: 'Failed',
      statusClass: 'failed',
    },
    {
      id: '#TXN005',
      customer: 'Charlie Wilson',
      amount: '$1,567.00',
      status: 'Completed',
      statusClass: 'success',
    },
  ];

  selectTheme(themeId: EnterprisePresetTheme): void {
    this.currentTheme.set(themeId);
  }

  onLogout(): void {
    console.log('Logout clicked');
  }
}
