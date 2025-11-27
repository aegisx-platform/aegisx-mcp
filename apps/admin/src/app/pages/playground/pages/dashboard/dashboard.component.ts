import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxChartsModule } from '@swimlane/ngx-charts';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: string;
  iconColor: string;
}

interface Activity {
  user: string;
  action: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
}

interface SystemMetric {
  label: string;
  value: number;
  status: 'healthy' | 'warning';
  statusColor: string;
}

interface MiniStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface Product {
  name: string;
  category: string;
  sales: string;
}

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
  performance: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    NgxChartsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  // Stats Cards Data (Tremor Style - No icons)
  stats: StatCard[] = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12.5%',
      changeType: 'increase',
      icon: 'people',
      iconColor: 'var(--ax-brand-default)',
    },
    {
      title: 'Active Sessions',
      value: '1,234',
      change: '+8.2%',
      changeType: 'increase',
      icon: 'trending_up',
      iconColor: '#10b981',
    },
    {
      title: 'Total Revenue',
      value: '$48,234',
      change: '+23.1%',
      changeType: 'increase',
      icon: 'payments',
      iconColor: '#f59e0b',
    },
    {
      title: 'Bounce Rate',
      value: '32.8%',
      change: '-5.4%',
      changeType: 'decrease',
      icon: 'error_outline',
      iconColor: '#ef4444',
    },
  ];

  // Chart Data for ngx-charts
  lineChartData = [
    {
      name: 'Users',
      series: [
        { name: 'Jan', value: 2100 },
        { name: 'Feb', value: 2200 },
        { name: 'Mar', value: 2350 },
        { name: 'Apr', value: 2400 },
        { name: 'May', value: 2450 },
        { name: 'Jun', value: 2543 },
      ],
    },
  ];

  barChartData = [
    { name: 'Engineering', value: 45 },
    { name: 'Sales', value: 32 },
    { name: 'Marketing', value: 28 },
    { name: 'HR', value: 18 },
    { name: 'Operations', value: 15 },
    { name: 'Finance', value: 12 },
  ];

  // Chart Options
  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = false;
  showYAxisLabel = false;
  colorScheme = 'cool';

  // Recent Activities
  recentActivities: Activity[] = [
    {
      user: 'John Doe',
      action: 'Created new project "AegisX Dashboard"',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'success',
    },
    {
      user: 'Jane Smith',
      action: 'Updated user profile settings',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'success',
    },
    {
      user: 'Bob Johnson',
      action: 'Deleted 3 files from storage',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'warning',
    },
    {
      user: 'Alice Williams',
      action: 'Failed login attempt detected',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: 'error',
    },
    {
      user: 'Charlie Brown',
      action: 'Exported monthly analytics report',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: 'success',
    },
  ];

  // Quick Actions
  quickActions = [
    { icon: 'person_add', label: 'Add User', color: 'primary' },
    { icon: 'upload_file', label: 'Upload', color: 'accent' },
    { icon: 'assessment', label: 'Reports', color: 'primary' },
    { icon: 'settings', label: 'Settings', color: 'accent' },
  ];

  // System Metrics
  systemMetrics: SystemMetric[] = [
    {
      label: 'CPU Usage',
      value: 45,
      status: 'healthy',
      statusColor: 'var(--ax-brand-default)',
    },
    {
      label: 'Memory',
      value: 68,
      status: 'healthy',
      statusColor: 'var(--ax-brand-default)',
    },
    {
      label: 'Storage',
      value: 82,
      status: 'warning',
      statusColor: '#f59e0b',
    },
    {
      label: 'Network',
      value: 34,
      status: 'healthy',
      statusColor: 'var(--ax-brand-default)',
    },
  ];

  // Mini Stats for Performance Overview
  miniStats: MiniStat[] = [
    {
      label: 'Page Views',
      value: '45.2K',
      icon: 'visibility',
      color: 'var(--ax-brand-default)',
    },
    {
      label: 'Conversions',
      value: '2.4K',
      icon: 'shopping_cart',
      color: '#10b981',
    },
    {
      label: 'Avg. Duration',
      value: '3m 24s',
      icon: 'schedule',
      color: '#f59e0b',
    },
    {
      label: 'Bounce Rate',
      value: '32.8%',
      icon: 'exit_to_app',
      color: '#ef4444',
    },
  ];

  // Top Products
  topProducts: Product[] = [
    {
      name: 'Premium Subscription',
      category: 'Digital Product',
      sales: '1,234',
    },
    {
      name: 'Enterprise License',
      category: 'Software',
      sales: '892',
    },
    {
      name: 'Consulting Package',
      category: 'Service',
      sales: '645',
    },
    {
      name: 'API Access',
      category: 'Digital Product',
      sales: '534',
    },
    {
      name: 'Training Course',
      category: 'Education',
      sales: '423',
    },
  ];

  // Team Members Performance
  teamMembers: TeamMember[] = [
    {
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      initials: 'SJ',
      avatarColor: 'var(--ax-brand-default)',
      performance: 92,
    },
    {
      name: 'Mike Chen',
      role: 'Backend Developer',
      initials: 'MC',
      avatarColor: '#10b981',
      performance: 88,
    },
    {
      name: 'Emily Davis',
      role: 'UI/UX Designer',
      initials: 'ED',
      avatarColor: '#f59e0b',
      performance: 95,
    },
    {
      name: 'David Kim',
      role: 'DevOps Engineer',
      initials: 'DK',
      avatarColor: '#8b5cf6',
      performance: 78,
    },
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'var(--ax-brand-default)';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return 'var(--ax-text-body)';
    }
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
