import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  ActivityItem,
  ActivityTimelineComponent,
  ChartData,
  ChartWidgetComponent,
  ProgressItem,
  ProgressWidgetComponent,
  QuickAction,
  QuickActionsComponent,
} from './widgets';
import {
  StatsCardDataNew,
  StatsCardNewComponent,
} from './widgets/stats-card-new.component';
import { ApiKeysStatsWidget } from './widgets/api-keys-stats.widget';
import { SystemMetricsWidget } from './widgets/system-metrics.widget';
import { SystemAlertsBannerWidget } from './widgets/system-alerts-banner.widget';
import { DatabasePerformanceWidget } from './widgets/database-performance.widget';

@Component({
  selector: 'ax-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ChartWidgetComponent,
    StatsCardNewComponent,
    ActivityTimelineComponent,
    ProgressWidgetComponent,
    QuickActionsComponent,
    ApiKeysStatsWidget,
    SystemMetricsWidget,
    SystemAlertsBannerWidget,
    DatabasePerformanceWidget,
  ],
  template: `
    <div class="w-full h-full overflow-y-auto overflow-x-hidden bg-gray-50">
      <!-- Page Header - Tremor Style -->
      <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div class="px-6 sm:px-8 py-6">
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1
                class="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight"
              >
                Analytics Dashboard
              </h1>
              <p class="text-sm text-slate-600 mt-1">
                Real-time overview of your application performance and
                activities
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white
                       border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <mat-icon class="!text-base">calendar_today</mat-icon>
                <span>Last 30 days</span>
              </button>
              <button
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600
                       rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <mat-icon class="!text-base">file_download</mat-icon>
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-6 sm:p-8 space-y-8">
        <!-- System Alerts Banner (Top Priority) -->
        <ax-system-alerts-banner></ax-system-alerts-banner>

        <!-- New Platform Widgets Grid (3 columns) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- API Keys Statistics -->
          <ax-api-keys-stats-widget></ax-api-keys-stats-widget>

          <!-- System Metrics (Real-time) -->
          <ax-system-metrics-widget></ax-system-metrics-widget>

          <!-- Database Performance -->
          <ax-database-performance-widget></ax-database-performance-widget>
        </div>

        <!-- Custom Tab Section - Tremor Style -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
          <!-- Tab Headers -->
          <div class="border-b border-slate-200">
            <div class="flex overflow-x-auto">
              @for (tab of tabs(); track tab.id) {
                <button
                  (click)="activeTab.set(tab.id)"
                  class="px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                  [class.border-blue-600]="activeTab() === tab.id"
                  [class.text-blue-600]="activeTab() === tab.id"
                  [class.border-transparent]="activeTab() !== tab.id"
                  [class.text-slate-600]="activeTab() !== tab.id"
                  [class.hover:text-slate-900]="activeTab() !== tab.id"
                >
                  {{ tab.label }}
                </button>
              }
            </div>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Overview Tab -->
            @if (activeTab() === 'overview') {
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ax-chart-widget
                  title="Revenue Trends"
                  subtitle="Last 12 months"
                  [data]="revenueChartData"
                  [chartType]="'line'"
                  [height]="350"
                ></ax-chart-widget>

                <ax-chart-widget
                  title="User Distribution"
                  subtitle="By region"
                  [data]="userDistributionData"
                  [chartType]="'doughnut'"
                  [height]="350"
                ></ax-chart-widget>
              </div>
            }

            <!-- Performance Tab -->
            @if (activeTab() === 'performance') {
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ax-chart-widget
                  title="API Response Times"
                  subtitle="Average response time (ms)"
                  [data]="apiPerformanceData"
                  [chartType]="'bar'"
                  [height]="350"
                ></ax-chart-widget>

                <ax-progress-widget
                  title="System Resources"
                  subtitle="Current usage"
                  [items]="systemResourcesData"
                  [showTotal]="false"
                ></ax-progress-widget>
              </div>
            }

            <!-- Analytics Tab -->
            @if (activeTab() === 'analytics') {
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ax-chart-widget
                  title="Traffic Sources"
                  subtitle="Last 30 days"
                  [data]="trafficSourcesData"
                  [chartType]="'pie'"
                  [height]="300"
                ></ax-chart-widget>

                <ax-chart-widget
                  title="Conversion Funnel"
                  subtitle="User journey"
                  [data]="conversionFunnelData"
                  [chartType]="'bar'"
                  [height]="300"
                ></ax-chart-widget>

                <ax-progress-widget
                  title="Goals Progress"
                  subtitle="Q4 2024"
                  [items]="goalsProgressData"
                  [actionLabel]="'Update Goals'"
                ></ax-progress-widget>
              </div>
            }
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Activity Timeline (2 columns) -->
          <div class="lg:col-span-2">
            <ax-activity-timeline
              [activities]="activities"
              [itemsPerPage]="6"
            ></ax-activity-timeline>
          </div>

          <!-- Quick Actions (1 column) -->
          <div>
            <ax-quick-actions
              [actions]="quickActionsData"
              [columns]="2"
              [showAllButton]="true"
              [moreActionsAvailable]="true"
              (actionClick)="handleQuickAction($event)"
            ></ax-quick-actions>
          </div>
        </div>

        <!-- Additional Widgets Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Project Progress -->
          <ax-progress-widget
            title="Active Projects"
            subtitle="Current sprint progress"
            [items]="projectProgressData"
            [actionLabel]="'View All Projects'"
          ></ax-progress-widget>

          <!-- Team Performance -->
          <ax-chart-widget
            title="Team Velocity"
            subtitle="Story points per sprint"
            [data]="teamVelocityData"
            [chartType]="'area'"
            [height]="250"
          ></ax-chart-widget>

          <!-- Notifications Summary - Tremor Style -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <!-- Card Header -->
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-slate-200"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"
                >
                  <mat-icon class="text-blue-600 !text-xl"
                    >notifications</mat-icon
                  >
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-900">
                    Notifications
                  </h3>
                  <p class="text-xs text-slate-600">Recent alerts</p>
                </div>
              </div>
            </div>

            <!-- Notifications List -->
            <div class="p-4 space-y-2">
              @for (
                notification of recentNotifications;
                track notification.id
              ) {
                <div
                  class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div
                    class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    [class.bg-red-50]="notification.type === 'error'"
                    [class.bg-yellow-50]="notification.type === 'warning'"
                    [class.bg-blue-50]="notification.type === 'info'"
                    [class.bg-green-50]="notification.type === 'success'"
                  >
                    <mat-icon
                      class="!text-base"
                      [class.text-red-600]="notification.type === 'error'"
                      [class.text-yellow-600]="notification.type === 'warning'"
                      [class.text-blue-600]="notification.type === 'info'"
                      [class.text-green-600]="notification.type === 'success'"
                    >
                      {{ notification.icon }}
                    </mat-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors"
                    >
                      {{ notification.title }}
                    </p>
                    <p class="text-xs text-slate-500 mt-0.5">
                      {{ notification.time }}
                    </p>
                  </div>
                </div>
              }
            </div>

            <!-- Card Actions -->
            <div
              class="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50"
            >
              <button
                class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </button>
              <button
                class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Mark as Read
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      /* Smooth transitions for all interactive elements */
      button {
        transition: all 0.2s ease-in-out;
      }

      /* Icon adjustments */
      .mat-icon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
    `,
  ],
})
export class DashboardPage {
  Math = Math;

  // Tab management
  activeTab = signal<string>('overview');
  tabs = signal([
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'analytics', label: 'Analytics' },
  ]);

  // Stats data with signals for reactivity - Tremor Colors
  statsData = signal<StatsCardDataNew[]>([
    {
      title: 'Total Users',
      value: 1234,
      icon: 'people',
      change: 12.5,
      changeLabel: 'from last month',
      color: 'blue',
      trend: 'up',
    },
    {
      title: 'Revenue',
      value: '$89.5K',
      icon: 'payments',
      change: 23.8,
      changeLabel: 'from last month',
      color: 'emerald',
      trend: 'up',
    },
    {
      title: 'Active Projects',
      value: 42,
      icon: 'folder_open',
      change: -5.4,
      changeLabel: 'from last week',
      color: 'rose',
      trend: 'down',
    },
    {
      title: 'Performance',
      value: '98.5%',
      icon: 'speed',
      change: 4.1,
      changeLabel: 'improvement',
      color: 'cyan',
      trend: 'up',
    },
  ]);

  // Chart data - Tremor Planner Color Palette
  revenueChartData: ChartData = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'Revenue',
        data: [65, 72, 78, 85, 82, 89, 92, 88, 94, 98, 102, 108],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
      },
      {
        label: 'Expenses',
        data: [45, 48, 52, 55, 53, 58, 60, 62, 65, 68, 70, 72],
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderColor: '#94a3b8',
      },
    ],
  };

  userDistributionData: ChartData = {
    labels: ['North America', 'Europe', 'Asia', 'South America', 'Africa'],
    datasets: [
      {
        label: 'Users',
        data: [435, 320, 280, 120, 79],
        backgroundColor: [
          '#3b82f6',
          '#60a5fa',
          '#93c5fd',
          '#bfdbfe',
          '#dbeafe',
        ],
      },
    ],
  };

  apiPerformanceData: ChartData = {
    labels: ['Auth', 'Users', 'Products', 'Orders', 'Reports', 'Analytics'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [45, 52, 38, 65, 89, 125],
        backgroundColor: '#3b82f6',
      },
    ],
  };

  trafficSourcesData: ChartData = {
    labels: ['Direct', 'Social', 'Referral', 'Search', 'Email'],
    datasets: [
      {
        label: 'Traffic',
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          '#3b82f6',
          '#60a5fa',
          '#10b981',
          '#f97316',
          '#94a3b8',
        ],
      },
    ],
  };

  conversionFunnelData: ChartData = {
    labels: ['Visitors', 'Signups', 'Active', 'Paying'],
    datasets: [
      {
        label: 'Users',
        data: [1000, 650, 400, 180],
        backgroundColor: '#3b82f6',
      },
    ],
  };

  teamVelocityData: ChartData = {
    labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5'],
    datasets: [
      {
        label: 'Story Points',
        data: [42, 48, 51, 45, 53],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
      },
    ],
  };

  // Progress data
  systemResourcesData: ProgressItem[] = [
    {
      label: 'CPU Usage',
      value: 68,
      max: 100,
      color: 'primary',
      icon: 'memory',
    },
    { label: 'Memory', value: 4.2, max: 8, color: 'accent', icon: 'storage' },
    { label: 'Storage', value: 234, max: 500, color: 'warn', icon: 'folder' },
    {
      label: 'Bandwidth',
      value: 780,
      max: 1000,
      color: 'success',
      icon: 'wifi',
    },
  ];

  goalsProgressData: ProgressItem[] = [
    {
      label: 'New Users',
      value: 850,
      max: 1000,
      color: 'primary',
      description: '150 users to go',
    },
    {
      label: 'Revenue Target',
      value: 89500,
      max: 100000,
      color: 'success',
      description: '$10.5K remaining',
    },
    {
      label: 'Customer Satisfaction',
      value: 94,
      max: 100,
      color: 'accent',
      description: '94% positive feedback',
    },
  ];

  projectProgressData: ProgressItem[] = [
    {
      label: 'Mobile App v2.0',
      value: 78,
      max: 100,
      color: 'primary',
      icon: 'phone_android',
    },
    { label: 'API Migration', value: 45, max: 100, color: 'warn', icon: 'api' },
    {
      label: 'UI Redesign',
      value: 92,
      max: 100,
      color: 'success',
      icon: 'brush',
    },
    {
      label: 'Security Audit',
      value: 60,
      max: 100,
      color: 'accent',
      icon: 'security',
    },
  ];

  // Activities data
  activities: ActivityItem[] = [
    {
      id: 1,
      title: 'New user registration',
      description: 'John Doe signed up for a premium account',
      time: '5 minutes ago',
      icon: 'person_add',
      color: 'primary',
      user: { name: 'John Doe', avatar: 'assets/images/avatars/male.png' },
    },
    {
      id: 2,
      title: 'System backup completed',
      description: 'Daily backup finished successfully',
      time: '1 hour ago',
      icon: 'backup',
      color: 'success',
    },
    {
      id: 3,
      title: 'API rate limit warning',
      description: 'API usage at 85% of daily limit',
      time: '2 hours ago',
      icon: 'warning',
      color: 'warn',
    },
    {
      id: 4,
      title: 'New deployment',
      description: 'Version 2.3.1 deployed to production',
      time: '3 hours ago',
      icon: 'cloud_upload',
      color: 'info',
      user: { name: 'DevOps Team' },
    },
    {
      id: 5,
      title: 'Security scan completed',
      description: 'No vulnerabilities found',
      time: '5 hours ago',
      icon: 'security',
      color: 'success',
    },
    {
      id: 6,
      title: 'Database optimization',
      description: 'Query performance improved by 40%',
      time: '8 hours ago',
      icon: 'storage',
      color: 'accent',
    },
  ];

  // Quick actions data
  quickActionsData: QuickAction[] = [
    { id: 'add-user', title: 'Add User', icon: 'person_add', color: 'primary' },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'assessment',
      color: 'accent',
      badge: 3,
    },
    { id: 'settings', title: 'Settings', icon: 'settings' },
    { id: 'export', title: 'Export', icon: 'cloud_download', color: 'primary' },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications',
      badge: 'New',
    },
    { id: 'help', title: 'Help', icon: 'help_outline' },
  ];

  // Recent notifications
  recentNotifications = [
    {
      id: 1,
      title: 'Server CPU usage is high',
      type: 'warning',
      icon: 'warning',
      time: '10 minutes ago',
    },
    {
      id: 2,
      title: 'New user registered',
      type: 'info',
      icon: 'person_add',
      time: '25 minutes ago',
    },
    {
      id: 3,
      title: 'Backup completed successfully',
      type: 'success',
      icon: 'check_circle',
      time: '1 hour ago',
    },
    {
      id: 4,
      title: 'Failed login attempt detected',
      type: 'error',
      icon: 'error',
      time: '2 hours ago',
    },
  ];

  handleQuickAction(action: QuickAction): void {
    console.log('Quick action clicked:', action);
    // Handle navigation or action based on action.id
    switch (action.id) {
      case 'add-user':
        // Navigate to add user page
        break;
      case 'reports':
        // Navigate to reports
        break;
      // ... handle other actions
    }
  }
}
