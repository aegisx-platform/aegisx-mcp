import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

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
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  // Stats Cards Data
  stats: StatCard[] = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12.5%',
      changeType: 'increase',
      icon: 'people',
      iconColor: 'var(--aegisx-brand-default)',
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

  // Recent Activities
  recentActivities: Activity[] = [
    {
      user: 'John Doe',
      action: 'Created new project',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'success',
    },
    {
      user: 'Jane Smith',
      action: 'Updated user profile',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'success',
    },
    {
      user: 'Bob Johnson',
      action: 'Deleted 3 files',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'warning',
    },
    {
      user: 'Alice Williams',
      action: 'Failed login attempt',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: 'error',
    },
    {
      user: 'Charlie Brown',
      action: 'Exported report',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: 'success',
    },
  ];

  // Quick Actions
  quickActions = [
    { icon: 'person_add', label: 'Add User', color: 'primary' },
    { icon: 'upload_file', label: 'Upload File', color: 'accent' },
    { icon: 'assessment', label: 'View Reports', color: 'primary' },
    { icon: 'settings', label: 'Settings', color: 'accent' },
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'var(--aegisx-brand-default)';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return 'var(--aegisx-text-body)';
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
