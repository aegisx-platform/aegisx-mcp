import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';

@Component({
  selector: 'ax-his-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    AxBreadcrumbComponent,
  ],
  template: `
    <div class="dashboard-page">
      <!-- Breadcrumb -->
      <ax-breadcrumb
        [items]="breadcrumbItems"
        separatorIcon="chevron_right"
        size="sm"
      ></ax-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">
          <h1>Dashboard</h1>
          <p>Hospital overview and key metrics</p>
        </div>
        <div class="page-actions">
          <button mat-stroked-button>
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card appearance="outlined" class="stat-card">
          <mat-card-content>
            <div class="stat-icon patients">
              <mat-icon>groups</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">1,247</span>
              <span class="stat-label">Total Patients</span>
              <span class="stat-change positive">+12% from last month</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="stat-card">
          <mat-card-content>
            <div class="stat-icon appointments">
              <mat-icon>event</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">48</span>
              <span class="stat-label">Today's Appointments</span>
              <span class="stat-change">8 pending, 40 completed</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="stat-card">
          <mat-card-content>
            <div class="stat-icon lab">
              <mat-icon>biotech</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">156</span>
              <span class="stat-label">Pending Lab Results</span>
              <span class="stat-change warning">23 urgent</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="stat-card">
          <mat-card-content>
            <div class="stat-icon pharmacy">
              <mat-icon>local_pharmacy</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">89</span>
              <span class="stat-label">Prescriptions Today</span>
              <span class="stat-change positive">All dispensed</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions & Recent Activity -->
      <div class="content-grid">
        <mat-card appearance="outlined" class="quick-actions-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="quick-actions">
              <button mat-stroked-button class="action-btn">
                <mat-icon>person_add</mat-icon>
                Register Patient
              </button>
              <button mat-stroked-button class="action-btn">
                <mat-icon>event_available</mat-icon>
                Schedule Appointment
              </button>
              <button mat-stroked-button class="action-btn">
                <mat-icon>science</mat-icon>
                Order Lab Test
              </button>
              <button mat-stroked-button class="action-btn">
                <mat-icon>medication</mat-icon>
                New Prescription
              </button>
              <button mat-stroked-button class="action-btn">
                <mat-icon>emergency</mat-icon>
                Emergency Admission
              </button>
              <button mat-stroked-button class="action-btn">
                <mat-icon>receipt_long</mat-icon>
                Generate Bill
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="activity-card">
          <mat-card-header>
            <mat-card-title>Recent Activity</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="activity-list">
              @for (activity of recentActivities; track activity.id) {
                <div class="activity-item">
                  <div class="activity-icon" [class]="activity.type">
                    <mat-icon>{{ activity.icon }}</mat-icon>
                  </div>
                  <div class="activity-content">
                    <span class="activity-title">{{ activity.title }}</span>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Department Occupancy -->
      <mat-card appearance="outlined" class="occupancy-card">
        <mat-card-header>
          <mat-card-title>Department Occupancy</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="occupancy-grid">
            @for (dept of departments; track dept.name) {
              <div class="occupancy-item">
                <div class="occupancy-header">
                  <span class="dept-name">{{ dept.name }}</span>
                  <span class="occupancy-rate"
                    >{{ dept.occupied }}/{{ dept.total }}</span
                  >
                </div>
                <mat-progress-bar
                  mode="determinate"
                  [value]="(dept.occupied / dept.total) * 100"
                  [color]="getOccupancyColor(dept.occupied / dept.total)"
                ></mat-progress-bar>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .dashboard-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .page-title h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--ax-text-heading);
      }

      .page-title p {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .stat-card mat-card-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem !important;
      }

      .stat-icon {
        width: 52px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ax-radius-lg);

        mat-icon {
          font-size: 26px;
          width: 26px;
          height: 26px;
        }

        &.patients {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-default);
        }

        &.appointments {
          background: var(--ax-info-faint);
          color: var(--ax-info-default);
        }

        &.lab {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-default);
        }

        &.pharmacy {
          background: var(--ax-success-faint);
          color: var(--ax-success-default);
        }
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--ax-text-heading);
        line-height: 1.2;
      }

      .stat-label {
        font-size: 0.875rem;
        color: var(--ax-text-secondary);
      }

      .stat-change {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);

        &.positive {
          color: var(--ax-success-default);
        }

        &.warning {
          color: var(--ax-warning-default);
        }
      }

      .content-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        @media (max-width: 900px) {
          grid-template-columns: 1fr;
        }
      }

      .quick-actions-card mat-card-content,
      .activity-card mat-card-content {
        padding: 1rem !important;
      }

      .quick-actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: flex-start;
        padding: 0.75rem 1rem;
        height: auto;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .activity-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: var(--ax-radius-md);

        &:hover {
          background: var(--ax-background-subtle);
        }
      }

      .activity-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ax-radius-full);
        background: var(--ax-background-muted);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }

        &.patient {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-default);
        }

        &.appointment {
          background: var(--ax-info-faint);
          color: var(--ax-info-default);
        }

        &.lab {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-default);
        }

        &.pharmacy {
          background: var(--ax-success-faint);
          color: var(--ax-success-default);
        }
      }

      .activity-content {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        flex: 1;
      }

      .activity-title {
        font-size: 0.875rem;
        color: var(--ax-text-primary);
      }

      .activity-time {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }

      .occupancy-card mat-card-content {
        padding: 1rem !important;
      }

      .occupancy-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .occupancy-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .occupancy-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .dept-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ax-text-primary);
      }

      .occupancy-rate {
        font-size: 0.75rem;
        color: var(--ax-text-secondary);
      }

      mat-progress-bar {
        height: 6px;
        border-radius: 3px;
      }
    `,
  ],
})
export class HisDashboardComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'HIS', url: '/his-demo' },
    { label: 'Dashboard' },
  ];

  recentActivities = [
    {
      id: 1,
      type: 'patient',
      icon: 'person_add',
      title: 'New patient registered: John Smith',
      time: '5 minutes ago',
    },
    {
      id: 2,
      type: 'appointment',
      icon: 'event_available',
      title: 'Appointment completed: Room 302',
      time: '12 minutes ago',
    },
    {
      id: 3,
      type: 'lab',
      icon: 'science',
      title: 'Lab results ready: Blood test #4521',
      time: '25 minutes ago',
    },
    {
      id: 4,
      type: 'pharmacy',
      icon: 'medication',
      title: 'Prescription dispensed: Order #8834',
      time: '32 minutes ago',
    },
    {
      id: 5,
      type: 'appointment',
      icon: 'event',
      title: 'New appointment scheduled: Dr. Wilson',
      time: '45 minutes ago',
    },
    {
      id: 6,
      type: 'lab',
      icon: 'biotech',
      title: 'Lab test ordered: X-Ray chest',
      time: '1 hour ago',
    },
  ];

  departments = [
    { name: 'General Ward', occupied: 42, total: 50 },
    { name: 'ICU', occupied: 8, total: 10 },
    { name: 'Emergency', occupied: 15, total: 20 },
    { name: 'Pediatrics', occupied: 18, total: 30 },
    { name: 'Surgery', occupied: 5, total: 8 },
    { name: 'Maternity', occupied: 12, total: 15 },
  ];

  getOccupancyColor(rate: number): 'primary' | 'accent' | 'warn' {
    if (rate >= 0.9) return 'warn';
    if (rate >= 0.7) return 'accent';
    return 'primary';
  }
}
