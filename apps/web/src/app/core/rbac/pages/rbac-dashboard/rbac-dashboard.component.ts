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
import {
  BreadcrumbComponent,
  BreadcrumbItem,
  AxKpiCardComponent,
} from '@aegisx/ui';
import {
  DashboardCard,
  RbacStats,
  RecentActivity,
} from '../../models/rbac.interfaces';
import { RbacService } from '../../services/rbac.service';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

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
    AxKpiCardComponent,
    HasPermissionDirective,
  ],
  template: `
    <div class="rbac-dashboard">
      <!-- Breadcrumb -->
      <div class="breadcrumb-wrapper">
        <ax-breadcrumb [items]="breadcrumbItems"></ax-breadcrumb>
      </div>

      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">RBAC Management</h1>
        <p class="page-subtitle">Manage roles, permissions, and user access</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading()" class="dashboard-content">
        <!-- Statistics Cards using KPI Card Component -->
        <div class="stats-grid">
          <ax-kpi-card
            *ngFor="let card of dashboardCards()"
            variant="simple"
            [label]="card.title"
            [value]="card.value"
            [change]="card.trend?.value"
            [changeType]="
              card.trend?.direction === 'up'
                ? 'up'
                : card.trend?.direction === 'down'
                  ? 'down'
                  : 'neutral'
            "
            [hoverable]="true"
            [clickable]="true"
            (click)="handleCardClick(card)"
          ></ax-kpi-card>
        </div>

        <!-- Quick Actions & Recent Activity -->
        <div class="actions-activity-grid">
          <!-- Quick Actions -->
          <div class="quick-actions-section">
            <mat-card appearance="filled">
              <mat-card-header>
                <mat-card-title class="section-card-title">
                  <mat-icon class="section-icon">flash_on</mat-icon>
                  Quick Actions
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="actions-list">
                  <button
                    *hasPermission="'roles:create'"
                    mat-stroked-button
                    class="action-button"
                    (click)="quickCreateRole()"
                  >
                    <mat-icon class="action-icon">add_circle_outline</mat-icon>
                    Create New Role
                  </button>

                  <button
                    *hasPermission="'permissions:assign'"
                    mat-stroked-button
                    class="action-button"
                    (click)="quickCreatePermission()"
                  >
                    <mat-icon class="action-icon">verified_user</mat-icon>
                    Create Permission
                  </button>

                  <button
                    *hasPermission="'roles:update'"
                    mat-stroked-button
                    class="action-button"
                    (click)="bulkAssignRoles()"
                  >
                    <mat-icon class="action-icon">group_add</mat-icon>
                    Bulk Assign Roles
                  </button>

                  <mat-divider></mat-divider>

                  <button
                    *hasPermission="'dashboard:view'"
                    mat-stroked-button
                    class="action-button"
                    (click)="viewAuditLog()"
                  >
                    <mat-icon class="action-icon">history</mat-icon>
                    View Audit Log
                  </button>

                  <button
                    *hasPermission="'dashboard:view'"
                    mat-stroked-button
                    class="action-button"
                    (click)="exportReport()"
                  >
                    <mat-icon class="action-icon">download</mat-icon>
                    Export Report
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Recent Activity -->
          <div class="recent-activity-section">
            <mat-card appearance="filled">
              <mat-card-header>
                <mat-card-title class="section-card-title-row">
                  <div class="section-title-with-icon">
                    <mat-icon class="section-icon">timeline</mat-icon>
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
              <mat-card-content class="activity-content">
                <mat-list *ngIf="recentActivity().length > 0; else noActivity">
                  <mat-list-item
                    *ngFor="
                      let activity of recentActivity();
                      trackBy: trackByActivityId
                    "
                    class="activity-item"
                  >
                    <mat-icon
                      matListItemIcon
                      [class]="
                        'activity-icon ' + getActivityIconClass(activity.type)
                      "
                    >
                      {{ getActivityIcon(activity.type) }}
                    </mat-icon>

                    <div matListItemTitle class="activity-title">
                      {{ activity.title }}
                    </div>

                    <div matListItemLine class="activity-description">
                      {{ activity.description }}
                    </div>

                    <div matListItemMeta class="activity-meta">
                      <span class="activity-user">{{
                        activity.user.name
                      }}</span>
                      <span class="activity-time">{{
                        formatRelativeTime(activity.timestamp)
                      }}</span>
                    </div>
                  </mat-list-item>
                </mat-list>

                <ng-template #noActivity>
                  <div class="empty-state">
                    <mat-icon class="empty-icon">timeline</mat-icon>
                    <p class="empty-text">No recent activity</p>
                  </div>
                </ng-template>
              </mat-card-content>

              <mat-card-actions *ngIf="recentActivity().length > 0">
                <button
                  *hasPermission="'dashboard:view'"
                  mat-button
                  (click)="viewAllActivity()"
                >
                  View All Activity
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* ===== CONTAINER ===== */
      .rbac-dashboard {
        padding: var(--ax-spacing-2xl) var(--ax-spacing-lg);
        max-width: 1400px;
        margin: 0 auto;
      }

      /* ===== BREADCRUMB ===== */
      .breadcrumb-wrapper {
        margin-bottom: var(--ax-spacing-xl);
      }

      /* ===== PAGE HEADER ===== */
      .page-header {
        margin-bottom: var(--ax-spacing-2xl);
      }

      .page-title {
        margin: 0 0 var(--ax-spacing-xs) 0;
        font-size: var(--ax-text-3xl);
        font-weight: var(--ax-font-bold);
        color: var(--mat-sys-on-surface);
        letter-spacing: -0.02em;
      }

      .page-subtitle {
        margin: 0;
        font-size: var(--ax-text-sm);
        color: var(--mat-sys-on-surface-variant);
      }

      /* ===== LOADING STATE ===== */
      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: var(--ax-spacing-3xl) 0;
      }

      /* ===== DASHBOARD CONTENT ===== */
      .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-2xl);
      }

      /* ===== STATS GRID ===== */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: var(--ax-spacing-lg);
      }

      @media (min-width: 768px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (min-width: 1024px) {
        .stats-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      /* ===== ACTIONS & ACTIVITY GRID ===== */
      .actions-activity-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: var(--ax-spacing-xl);
      }

      @media (min-width: 1024px) {
        .actions-activity-grid {
          grid-template-columns: 1fr 2fr;
        }
      }

      /* ===== QUICK ACTIONS ===== */
      .actions-list {
        display: flex;
        flex-direction: column;
        gap: var(--ax-spacing-sm);
      }

      .action-button {
        width: 100%;
        justify-content: flex-start;
      }

      .action-icon {
        margin-right: var(--ax-spacing-sm);
      }

      /* ===== RECENT ACTIVITY ===== */
      .section-card-title {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm);
      }

      .section-card-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .section-title-with-icon {
        display: flex;
        align-items: center;
        gap: var(--ax-spacing-sm);
      }

      .section-icon {
        margin-right: 0;
      }

      .activity-content {
        padding: 0;
      }

      .activity-item {
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      .activity-item:last-child {
        border-bottom: none;
      }

      .activity-icon {
        margin-right: var(--ax-spacing-md);
      }

      .activity-icon-green {
        color: var(--mat-sys-primary);
      }

      .activity-icon-blue {
        color: var(--mat-sys-tertiary);
      }

      .activity-icon-red {
        color: var(--mat-sys-error);
      }

      .activity-icon-orange {
        color: var(--mat-sys-tertiary);
      }

      .activity-icon-purple {
        color: var(--mat-sys-primary);
      }

      .activity-icon-gray {
        color: var(--mat-sys-on-surface-variant);
      }

      .activity-title {
        font-weight: var(--ax-font-medium);
        color: var(--mat-sys-on-surface);
      }

      .activity-description {
        font-size: var(--ax-text-sm);
        color: var(--mat-sys-on-surface-variant);
      }

      .activity-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        font-size: var(--ax-text-xs);
        gap: var(--ax-spacing-xs);
      }

      .activity-user {
        color: var(--mat-sys-on-surface);
      }

      .activity-time {
        color: var(--mat-sys-on-surface-variant);
      }

      /* ===== EMPTY STATE ===== */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--ax-spacing-3xl) 0;
        color: var(--mat-sys-on-surface-variant);
      }

      .empty-icon {
        font-size: 2.25rem;
        margin-bottom: var(--ax-spacing-sm);
        opacity: 0.5;
      }

      .empty-text {
        margin: 0;
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 768px) {
        .rbac-dashboard {
          padding: var(--ax-spacing-lg) var(--ax-spacing-md);
        }

        .page-title {
          font-size: var(--ax-text-2xl);
        }
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
  breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      url: '/',
    },
    {
      label: 'Management',
    },
    {
      label: 'RBAC Management',
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

  getActivityIconClass(type: string): string {
    const classMap: Record<string, string> = {
      role_created: 'activity-icon-green',
      role_updated: 'activity-icon-blue',
      role_deleted: 'activity-icon-red',
      role_assigned: 'activity-icon-green',
      role_removed: 'activity-icon-orange',
      permission_created: 'activity-icon-green',
      permission_updated: 'activity-icon-blue',
      permission_deleted: 'activity-icon-red',
      bulk_operation: 'activity-icon-purple',
    };
    return classMap[type] || 'activity-icon-gray';
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
