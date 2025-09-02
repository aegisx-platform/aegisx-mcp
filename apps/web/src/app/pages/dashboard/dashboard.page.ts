import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { AegisxCardComponent, AegisxAlertComponent } from '@aegisx/ui';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  change: number;
  color: string;
}

@Component({
  selector: 'ax-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    AegisxCardComponent,
    AegisxAlertComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Welcome Alert -->
      <ax-alert
        type="info"
        title="Welcome to AegisX Platform"
        class="mb-8"
      >
        This is a demonstration of the @aegisx/ui library integration with Angular 19.
      </ax-alert>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Overview of your application statistics and recent activities.
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        @for (stat of stats; track stat.title) {
          <ax-card [appearance]="'elevated'" class="relative overflow-hidden">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {{ stat.title }}
                </p>
                <p class="text-2xl font-bold mt-2" [ngClass]="stat.color">
                  {{ stat.value }}
                </p>
                <p class="text-sm mt-2" [ngClass]="{
                  'text-green-600': stat.change > 0,
                  'text-red-600': stat.change < 0,
                  'text-gray-600': stat.change === 0
                }">
                  @if (stat.change > 0) {
                    <mat-icon class="text-sm align-middle">trending_up</mat-icon>
                  } @else if (stat.change < 0) {
                    <mat-icon class="text-sm align-middle">trending_down</mat-icon>
                  } @else {
                    <mat-icon class="text-sm align-middle">trending_flat</mat-icon>
                  }
                  {{ Math.abs(stat.change) }}%
                </p>
              </div>
              <div class="text-4xl" [ngClass]="stat.color + '-light'">
                <mat-icon [fontIcon]="stat.icon" class="text-5xl opacity-20"></mat-icon>
              </div>
            </div>
          </ax-card>
        }
      </div>

      <!-- Recent Activities -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Activities Card -->
        <ax-card 
          title="Recent Activities" 
          subtitle="Latest system events"
          icon="history"
          [appearance]="'outlined'"
        >
          <div class="space-y-4">
            @for (activity of activities; track activity.id) {
              <div class="flex items-start space-x-3 pb-4 border-b last:border-0">
                <div [ngClass]="activity.color" class="p-2 rounded-full">
                  <mat-icon [fontIcon]="activity.icon" class="text-white text-sm"></mat-icon>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ activity.title }}</p>
                  <p class="text-xs text-gray-500">{{ activity.time }}</p>
                </div>
              </div>
            }
          </div>
          <div card-actions>
            <button mat-button color="primary">View All Activities</button>
          </div>
        </ax-card>

        <!-- Quick Actions -->
        <ax-card 
          title="Quick Actions" 
          subtitle="Common tasks"
          icon="flash_on"
          [appearance]="'outlined'"
        >
          <div class="grid grid-cols-2 gap-4">
            @for (action of quickActions; track action.title) {
              <button mat-stroked-button class="h-24 flex flex-col items-center justify-center space-y-2">
                <mat-icon [fontIcon]="action.icon" [color]="action.color"></mat-icon>
                <span>{{ action.title }}</span>
              </button>
            }
          </div>
        </ax-card>
      </div>
    </div>
  `,
  styles: [`
    .text-primary { color: #1976d2; }
    .text-success { color: #388e3c; }
    .text-warning { color: #f57c00; }
    .text-danger { color: #d32f2f; }
    
    .text-primary-light { color: #90caf9; }
    .text-success-light { color: #81c784; }
    .text-warning-light { color: #ffb74d; }
    .text-danger-light { color: #ef5350; }

    .bg-primary { background-color: #1976d2; }
    .bg-success { background-color: #388e3c; }
    .bg-warning { background-color: #f57c00; }
    .bg-info { background-color: #0288d1; }
  `]
})
export class DashboardPage {
  Math = Math;

  stats: StatCard[] = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: 'people',
      change: 12.5,
      color: 'text-primary'
    },
    {
      title: 'Active Sessions',
      value: '456',
      icon: 'devices',
      change: -2.3,
      color: 'text-success'
    },
    {
      title: 'API Calls',
      value: '98.5K',
      icon: 'api',
      change: 8.7,
      color: 'text-warning'
    },
    {
      title: 'Error Rate',
      value: '0.12%',
      icon: 'error_outline',
      change: -15.2,
      color: 'text-danger'
    }
  ];

  activities = [
    {
      id: 1,
      title: 'New user registration',
      time: '5 minutes ago',
      icon: 'person_add',
      color: 'bg-primary'
    },
    {
      id: 2,
      title: 'System backup completed',
      time: '1 hour ago',
      icon: 'backup',
      color: 'bg-success'
    },
    {
      id: 3,
      title: 'API rate limit warning',
      time: '2 hours ago',
      icon: 'warning',
      color: 'bg-warning'
    },
    {
      id: 4,
      title: 'Database maintenance scheduled',
      time: '3 hours ago',
      icon: 'storage',
      color: 'bg-info'
    }
  ];

  quickActions = [
    { title: 'Add User', icon: 'person_add', color: 'primary' },
    { title: 'View Reports', icon: 'assessment', color: 'accent' },
    { title: 'Settings', icon: 'settings', color: 'warn' },
    { title: 'Export Data', icon: 'cloud_download', color: 'primary' }
  ];
}