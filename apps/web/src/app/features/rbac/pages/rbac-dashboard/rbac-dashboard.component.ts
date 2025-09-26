import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { BreadcrumbComponent, AegisxNavigationItem } from '@aegisx/ui';
import {
  DashboardCard,
  RbacStats,
  RecentActivity,
} from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-rbac-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    BreadcrumbComponent,
  ],
  template: `
    <div class="rbac-dashboard p-6 space-y-6">
      <!-- Breadcrumb -->
      <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>

      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            RBAC Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage roles, permissions, and user access
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button mat-raised-button color="primary" (click)="navigateToRoles()">
            <mat-icon>people</mat-icon>
            Manage Roles
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="navigateToPermissions()"
          >
            <mat-icon>security</mat-icon>
            Manage Permissions
          </button>
          <button
            mat-raised-button
            color="accent"
            (click)="navigateToUserRoles()"
          >
            <mat-icon>assignment_ind</mat-icon>
            User Assignments
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading()" class="space-y-6">
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <mat-card
            appearance="outlined"
            *ngFor="let card of dashboardCards()"
            class="cursor-pointer transition-transform hover:scale-105"
            (click)="handleCardClick(card)"
          >
            <mat-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div
                    class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                  >
                    {{ card.title }}
                  </div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ card.value | number }}
                  </div>
                  <div
                    *ngIf="card.trend"
                    class="flex items-center mt-2 text-sm"
                  >
                    <mat-icon
                      [class]="
                        'mr-1 text-base ' +
                        (card.trend.direction === 'up'
                          ? 'text-green-600'
                          : 'text-red-600')
                      "
                    >
                      {{
                        card.trend.direction === 'up'
                          ? 'trending_up'
                          : 'trending_down'
                      }}
                    </mat-icon>
                    <span
                      [class]="
                        card.trend.direction === 'up'
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                    >
                      {{ card.trend.value }}%
                    </span>
                    <span class="text-gray-500 ml-1">{{
                      card.trend.period
                    }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <mat-icon
                    [class]="'text-4xl ' + getCardIconColor(card.color)"
                  >
                    {{ card.icon }}
                  </mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions & Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Quick Actions -->
          <div class="lg:col-span-1">
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title class="flex items-center">
                  <mat-icon class="mr-2">flash_on</mat-icon>
                  Quick Actions
                </mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-6">
                <div class="space-y-3">
                  <button
                    mat-stroked-button
                    class="w-full justify-start"
                    (click)="quickCreateRole()"
                  >
                    <mat-icon class="mr-2">add_circle_outline</mat-icon>
                    Create New Role
                  </button>

                  <button
                    mat-stroked-button
                    class="w-full justify-start"
                    (click)="quickCreatePermission()"
                  >
                    <mat-icon class="mr-2">verified_user</mat-icon>
                    Create Permission
                  </button>

                  <button
                    mat-stroked-button
                    class="w-full justify-start"
                    (click)="bulkAssignRoles()"
                  >
                    <mat-icon class="mr-2">group_add</mat-icon>
                    Bulk Assign Roles
                  </button>

                  <mat-divider></mat-divider>

                  <button
                    mat-stroked-button
                    class="w-full justify-start"
                    (click)="viewAuditLog()"
                  >
                    <mat-icon class="mr-2">history</mat-icon>
                    View Audit Log
                  </button>

                  <button
                    mat-stroked-button
                    class="w-full justify-start"
                    (click)="exportReport()"
                  >
                    <mat-icon class="mr-2">download</mat-icon>
                    Export Report
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Recent Activity -->
          <div class="lg:col-span-2">
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title
                  class="flex items-center justify-between w-full"
                >
                  <div class="flex items-center">
                    <mat-icon class="mr-2">timeline</mat-icon>
                    Recent Activity
                  </div>
                  <button
                    mat-icon-button
                    (click)="refreshActivity()"
                    matTooltip="Refresh"
                  >
                    <mat-icon>refresh</mat-icon>
                  </button>
                </mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-0">
                <mat-list *ngIf="recentActivity().length > 0; else noActivity">
                  <mat-list-item
                    *ngFor="
                      let activity of recentActivity();
                      trackBy: trackByActivityId
                    "
                    class="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <mat-icon
                      matListItemIcon
                      [class]="'text-' + getActivityIconColor(activity.type)"
                    >
                      {{ getActivityIcon(activity.type) }}
                    </mat-icon>

                    <div
                      matListItemTitle
                      class="font-medium text-gray-900 dark:text-white"
                    >
                      {{ activity.title }}
                    </div>

                    <div
                      matListItemLine
                      class="text-sm text-gray-600 dark:text-gray-400"
                    >
                      {{ activity.description }}
                    </div>

                    <div
                      matListItemMeta
                      class="flex flex-col items-end text-xs text-gray-500"
                    >
                      <span>{{ activity.user.name }}</span>
                      <span>{{ formatRelativeTime(activity.timestamp) }}</span>
                    </div>
                  </mat-list-item>
                </mat-list>

                <ng-template #noActivity>
                  <div
                    class="flex flex-col items-center justify-center py-12 text-gray-500"
                  >
                    <mat-icon class="text-4xl mb-2 opacity-50"
                      >timeline</mat-icon
                    >
                    <p>No recent activity</p>
                  </div>
                </ng-template>
              </mat-card-content>

              <mat-card-actions
                *ngIf="recentActivity().length > 0"
                class="p-4 pt-0"
              >
                <button mat-button (click)="viewAllActivity()">
                  View All Activity
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- System Status -->
        <mat-card appearance="outlined" *ngIf="stats()">
          <mat-card-header>
            <mat-card-title class="flex items-center">
              <mat-icon class="mr-2">dashboard</mat-icon>
              System Overview
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div
                  class="text-2xl font-bold text-blue-600 dark:text-blue-400"
                >
                  {{ stats()?.active_roles || 0 }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Active Roles
                </div>
              </div>

              <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div
                  class="text-2xl font-bold text-green-600 dark:text-green-400"
                >
                  {{ stats()?.active_permissions || 0 }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Active Permissions
                </div>
              </div>

              <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div
                  class="text-2xl font-bold text-purple-600 dark:text-purple-400"
                >
                  {{ stats()?.total_user_roles || 0 }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  User Assignments
                </div>
              </div>

              <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div
                  class="text-2xl font-bold text-orange-600 dark:text-orange-400"
                >
                  {{ stats()?.expiring_user_roles || 0 }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Expiring Soon
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .rbac-dashboard {
        min-height: 100vh;
        background: var(--background-color);
      }

      mat-card {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        border: 1px solid var(--border-color);
      }

      mat-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .mat-mdc-raised-button {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .mat-mdc-card-content {
        padding: 24px !important;
      }

      .mat-mdc-list-item {
        padding: 16px !important;
      }

      /* Dark theme adjustments */
      :host-context(.dark) {
        --background-color: #1f2937;
        --border-color: #374151;
      }

      /* Light theme adjustments */
      :host-context(.light) {
        --background-color: #f9fafb;
        --border-color: #e5e7eb;
      }

      /* Material Icons styling now handled by aegisx-ui */

      /* Fix icon size and alignment */
      .text-4xl mat-icon,
      mat-icon.text-4xl {
        font-size: 2.25rem !important;
        width: 2.25rem !important;
        height: 2.25rem !important;
        min-width: 2.25rem !important;
        min-height: 2.25rem !important;
      }

      /* Ensure button icons are properly aligned */
      button mat-icon {
        margin-right: 0 !important;
        vertical-align: middle;
      }

      /* Loading state for icons */
      mat-icon:empty::before {
        content: '';
        display: inline-block;
        width: 1em;
        height: 1em;
        background: rgba(0, 0, 0, 0.12);
        border-radius: 2px;
      }
    `,
  ],
})
export class RbacDashboardComponent implements OnInit {
  private readonly rbacService = inject(RbacService);
  private readonly router = inject(Router);

  // Signals
  readonly isLoading = signal(true);
  readonly stats = signal<RbacStats | null>(null);
  readonly dashboardCards = signal<DashboardCard[]>([]);
  readonly recentActivity = signal<RecentActivity[]>([]);

  // Breadcrumb items
  breadcrumbItems: AegisxNavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      link: '/',
      type: 'basic',
    },
    {
      id: 'management',
      title: 'Management',
      icon: 'settings',
      type: 'basic',
    },
    {
      id: 'rbac',
      title: 'RBAC Management',
      icon: 'security',
      type: 'basic',
    },
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    try {
      this.isLoading.set(true);

      // Load statistics
      const statsResponse = await this.rbacService.getRbacStats().toPromise();
      if (statsResponse?.data) {
        this.stats.set(statsResponse.data);
        this.buildDashboardCards(statsResponse.data);
      }

      // Load recent activity (mock data for now - would come from actual API)
      this.loadRecentActivity();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private buildDashboardCards(stats: RbacStats): void {
    const cards: DashboardCard[] = [
      {
        title: 'Total Roles',
        value: stats.total_roles,
        icon: 'people',
        color: 'primary',
        action: { label: 'Manage Roles', route: '/rbac/roles' },
      },
      {
        title: 'Total Permissions',
        value: stats.total_permissions,
        icon: 'security',
        color: 'accent',
        action: { label: 'Manage Permissions', route: '/rbac/permissions' },
      },
      {
        title: 'Active Assignments',
        value: stats.total_user_roles,
        icon: 'assignment_ind',
        color: 'primary',
        action: { label: 'View Assignments', route: '/rbac/user-roles' },
      },
      {
        title: 'Expiring Soon',
        value: stats.expiring_user_roles,
        icon: 'schedule',
        color: 'warn',
        trend:
          stats.expiring_user_roles > 0
            ? {
                value: 15,
                direction: 'up',
                period: 'vs last week',
              }
            : undefined,
        action: {
          label: 'View Expiring',
          route: '/rbac/user-roles?expiry=expiring',
        },
      },
    ];

    this.dashboardCards.set(cards);
  }

  private loadRecentActivity(): void {
    // Mock recent activity data - in real implementation, this would come from API
    const mockActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'role_created',
        title: 'New role created',
        description: 'Role "Project Manager" was created with 12 permissions',
        user: { id: 'user1', name: 'John Doe' },
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'role_assigned',
        title: 'Role assigned to user',
        description: 'Sarah Smith was assigned the "Developer" role',
        user: { id: 'user2', name: 'Admin User' },
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'permission_updated',
        title: 'Permission modified',
        description: 'Permission "user.delete" was updated',
        user: { id: 'user3', name: 'Jane Smith' },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'bulk_operation',
        title: 'Bulk role assignment completed',
        description: 'Assigned "Viewer" role to 25 users',
        user: { id: 'user1', name: 'John Doe' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        type: 'role_removed',
        title: 'Role removed from user',
        description: 'Removed "Admin" role from inactive user',
        user: { id: 'user2', name: 'Admin User' },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.recentActivity.set(mockActivity);
  }

  // Navigation methods
  navigateToRoles(): void {
    this.router.navigate(['/rbac/roles']);
  }

  navigateToPermissions(): void {
    this.router.navigate(['/rbac/permissions']);
  }

  navigateToUserRoles(): void {
    this.router.navigate(['/rbac/user-roles']);
  }

  // Card click handler
  handleCardClick(card: DashboardCard): void {
    if (card.action) {
      this.router.navigate([card.action.route]);
    }
  }

  // Quick action methods
  quickCreateRole(): void {
    this.router.navigate(['/rbac/roles'], {
      queryParams: { action: 'create' },
    });
  }

  quickCreatePermission(): void {
    this.router.navigate(['/rbac/permissions'], {
      queryParams: { action: 'create' },
    });
  }

  bulkAssignRoles(): void {
    this.router.navigate(['/rbac/user-roles'], {
      queryParams: { action: 'bulk-assign' },
    });
  }

  viewAuditLog(): void {
    this.router.navigate(['/rbac/audit']);
  }

  exportReport(): void {
    // TODO: Implement report export functionality
    console.log('Export report functionality to be implemented');
  }

  // Activity methods
  refreshActivity(): void {
    this.loadRecentActivity();
  }

  viewAllActivity(): void {
    this.router.navigate(['/rbac/activity']);
  }

  // Utility methods
  getCardIconColor(color: 'primary' | 'accent' | 'warn'): string {
    const colorMap = {
      primary: 'text-blue-500',
      accent: 'text-purple-500',
      warn: 'text-orange-500',
    };
    return colorMap[color];
  }

  getActivityIcon(type: string): string {
    const iconMap: Record<string, string> = {
      role_created: 'add_circle',
      role_updated: 'edit',
      role_deleted: 'delete',
      role_assigned: 'person_add',
      role_removed: 'person_remove',
      permission_created: 'verified_user',
      permission_updated: 'security',
      permission_deleted: 'block',
      bulk_operation: 'group_work',
    };
    return iconMap[type] || 'info';
  }

  getActivityIconColor(type: string): string {
    const colorMap: Record<string, string> = {
      role_created: 'green-500',
      role_updated: 'blue-500',
      role_deleted: 'red-500',
      role_assigned: 'green-500',
      role_removed: 'orange-500',
      permission_created: 'green-500',
      permission_updated: 'blue-500',
      permission_deleted: 'red-500',
      bulk_operation: 'purple-500',
    };
    return colorMap[type] || 'gray-500';
  }

  formatRelativeTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  trackByActivityId(index: number, activity: RecentActivity): string {
    return activity.id;
  }
}
