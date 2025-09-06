import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { AegisxCardComponent } from '@aegisx/ui';
import {
  ChartWidgetComponent,
  StatsCardComponent,
  ActivityTimelineComponent,
  ProgressWidgetComponent,
  QuickActionsComponent,
  ChartData,
  StatsCardData,
  ActivityItem,
  ProgressItem,
  QuickAction,
} from './widgets';

@Component({
  selector: 'ax-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatTabsModule,
    AegisxCardComponent,
    ChartWidgetComponent,
    StatsCardComponent,
    ActivityTimelineComponent,
    ProgressWidgetComponent,
    QuickActionsComponent,
  ],
  template: `
    <div class="w-full h-full overflow-y-auto overflow-x-hidden">
      <!-- Page Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 sm:px-8 sm:py-6 bg-white dark:bg-gray-900"
      >
        <div>
          <h1
            class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
          >
            Analytics Dashboard
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Real-time overview of your application performance and activities
          </p>
        </div>
        <div class="flex items-center mt-4 sm:mt-0 space-x-3">
          <button mat-stroked-button>
            <mat-icon class="mr-2">calendar_today</mat-icon>
            Last 30 days
          </button>
          <button mat-flat-button color="primary">
            <mat-icon class="mr-2">file_download</mat-icon>
            Export
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-6 sm:p-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          @for (stat of statsData(); track stat.title) {
            <ax-stats-card
              [data]="stat"
              [showSparkline]="true"
              [actionLabel]="'View Details'"
            ></ax-stats-card>
          }
        </div>

        <!-- Tab Section for Charts and Analytics -->
        <mat-tab-group class="mb-8">
          <mat-tab label="Overview">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
          </mat-tab>

          <mat-tab label="Performance">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
          </mat-tab>

          <mat-tab label="Analytics">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
          </mat-tab>
        </mat-tab-group>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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

          <!-- Notifications Summary -->
          <ax-card
            title="Notifications"
            subtitle="Recent alerts"
            icon="notifications"
            [appearance]="'elevated'"
          >
            <div class="space-y-3">
              @for (
                notification of recentNotifications;
                track notification.id
              ) {
                <div
                  class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <mat-icon
                    class="text-xl mt-0.5"
                    [ngClass]="{
                      'text-red-600': notification.type === 'error',
                      'text-yellow-600': notification.type === 'warning',
                      'text-blue-600': notification.type === 'info',
                      'text-green-600': notification.type === 'success',
                    }"
                    >{{ notification.icon }}</mat-icon
                  >
                  <div class="flex-1">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {{ notification.title }}
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {{ notification.time }}
                    </p>
                  </div>
                </div>
              }
            </div>
            <div card-actions>
              <button mat-button color="primary">View All</button>
              <button mat-button>Mark as Read</button>
            </div>
          </ax-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        padding-bottom: 2rem;
      }

      ::ng-deep .mat-mdc-tab-group {
        .mat-mdc-tab-body-wrapper {
          margin-top: 1rem;
        }
      }

      ::ng-deep .mat-mdc-card {
        transition: all 0.3s ease;
      }
    `,
  ],
})
export class DashboardPage {
  Math = Math;

  // Stats data with signals for reactivity
  statsData = signal<StatsCardData[]>([
    {
      title: 'Total Users',
      value: 1234,
      icon: 'people',
      change: 12.5,
      changeLabel: 'from last month',
      color: 'primary',
      trend: 'up',
    },
    {
      title: 'Revenue',
      value: '$89.5K',
      icon: 'payments',
      change: 23.8,
      changeLabel: 'from last month',
      color: 'success',
      trend: 'up',
    },
    {
      title: 'Active Projects',
      value: 42,
      icon: 'folder_open',
      change: -5.4,
      changeLabel: 'from last week',
      color: 'warn',
      trend: 'down',
    },
    {
      title: 'Performance',
      value: '98.5%',
      icon: 'speed',
      change: 4.1,
      changeLabel: 'improvement',
      color: 'info',
      trend: 'up',
    },
  ]);

  // Chart data
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
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderColor: '#1976d2',
      },
      {
        label: 'Expenses',
        data: [45, 48, 52, 55, 53, 58, 60, 62, 65, 68, 70, 72],
        backgroundColor: 'rgba(255, 64, 129, 0.1)',
        borderColor: '#ff4081',
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
          '#1976d2',
          '#ff4081',
          '#4caf50',
          '#ff9800',
          '#9c27b0',
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
        backgroundColor: '#1976d2',
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
          '#1976d2',
          '#00bcd4',
          '#4caf50',
          '#ff9800',
          '#f44336',
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
        backgroundColor: '#4caf50',
      },
    ],
  };

  teamVelocityData: ChartData = {
    labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5'],
    datasets: [
      {
        label: 'Story Points',
        data: [42, 48, 51, 45, 53],
        backgroundColor: 'rgba(156, 39, 176, 0.2)',
        borderColor: '#9c27b0',
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
      user: { name: 'John Doe', avatar: 'assets/avatars/user1.jpg' },
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
