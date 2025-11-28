import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';

interface ReportCategory {
  title: string;
  icon: string;
  reports: Report[];
}

interface Report {
  name: string;
  description: string;
  lastRun?: string;
}

@Component({
  selector: 'ax-his-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    AxBreadcrumbComponent,
  ],
  template: `
    <div class="reports-page">
      <!-- Breadcrumb -->
      <ax-breadcrumb
        [items]="breadcrumbItems"
        separatorIcon="chevron_right"
        size="sm"
      ></ax-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">
          <h1>Reports</h1>
          <p>Generate and view hospital reports</p>
        </div>
        <div class="page-actions">
          <button mat-stroked-button>
            <mat-icon>schedule</mat-icon>
            Scheduled Reports
          </button>
          <button mat-flat-button color="primary">
            <mat-icon>add</mat-icon>
            Custom Report
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <mat-card appearance="outlined" class="quick-stat">
          <mat-card-content>
            <mat-icon>description</mat-icon>
            <div class="stat-info">
              <span class="stat-value">156</span>
              <span class="stat-label">Reports Generated Today</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card appearance="outlined" class="quick-stat">
          <mat-card-content>
            <mat-icon>schedule</mat-icon>
            <div class="stat-info">
              <span class="stat-value">12</span>
              <span class="stat-label">Scheduled Reports</span>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card appearance="outlined" class="quick-stat">
          <mat-card-content>
            <mat-icon>download</mat-icon>
            <div class="stat-info">
              <span class="stat-value">89</span>
              <span class="stat-label">Downloads This Week</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Report Categories -->
      <div class="report-categories">
        @for (category of reportCategories; track category.title) {
          <mat-card appearance="outlined" class="category-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>{{ category.icon }}</mat-icon>
              <mat-card-title>{{ category.title }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-list>
                @for (
                  report of category.reports;
                  track report.name;
                  let last = $last
                ) {
                  <mat-list-item class="report-item">
                    <div class="report-info">
                      <span class="report-name">{{ report.name }}</span>
                      <span class="report-description">{{
                        report.description
                      }}</span>
                      @if (report.lastRun) {
                        <span class="report-last-run"
                          >Last run: {{ report.lastRun }}</span
                        >
                      }
                    </div>
                    <div class="report-actions">
                      <button mat-icon-button matTooltip="Generate">
                        <mat-icon>play_arrow</mat-icon>
                      </button>
                      <button mat-icon-button matTooltip="Schedule">
                        <mat-icon>schedule</mat-icon>
                      </button>
                      <button mat-icon-button matTooltip="Download">
                        <mat-icon>download</mat-icon>
                      </button>
                    </div>
                  </mat-list-item>
                  @if (!last) {
                    <mat-divider></mat-divider>
                  }
                }
              </mat-list>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .reports-page {
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

      .page-actions {
        display: flex;
        gap: 0.75rem;
      }

      .quick-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .quick-stat mat-card-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem !important;

        > mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--ax-brand-default);
        }
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ax-text-heading);
      }

      .stat-label {
        font-size: 0.75rem;
        color: var(--ax-text-secondary);
      }

      .report-categories {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;

        @media (max-width: 500px) {
          grid-template-columns: 1fr;
        }
      }

      .category-card {
        mat-card-header {
          padding: 1rem 1rem 0;

          mat-icon[mat-card-avatar] {
            background: var(--ax-brand-faint);
            color: var(--ax-brand-default);
            width: 40px;
            height: 40px;
            border-radius: var(--ax-radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        mat-card-content {
          padding: 0 !important;
        }
      }

      .report-item {
        height: auto !important;
        padding: 1rem !important;

        &:hover {
          background: var(--ax-background-subtle);
        }
      }

      .report-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
      }

      .report-name {
        font-weight: 500;
        color: var(--ax-text-primary);
      }

      .report-description {
        font-size: 0.8125rem;
        color: var(--ax-text-secondary);
      }

      .report-last-run {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }

      .report-actions {
        display: flex;
        gap: 0.25rem;

        button {
          opacity: 0.7;

          &:hover {
            opacity: 1;
          }
        }
      }

      mat-list {
        padding: 0 !important;
      }
    `,
  ],
})
export class HisReportsComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'HIS', url: '/his-demo' },
    { label: 'Reports' },
  ];

  reportCategories: ReportCategory[] = [
    {
      title: 'Patient Reports',
      icon: 'groups',
      reports: [
        {
          name: 'Patient Census',
          description: 'Daily patient count by department',
          lastRun: 'Today, 08:00 AM',
        },
        {
          name: 'Admission Summary',
          description: 'Weekly admission and discharge statistics',
          lastRun: 'Jan 14, 2024',
        },
        {
          name: 'Patient Demographics',
          description: 'Age, gender, and location distribution',
          lastRun: 'Jan 10, 2024',
        },
        {
          name: 'Length of Stay Report',
          description: 'Average stay duration by department',
        },
      ],
    },
    {
      title: 'Clinical Reports',
      icon: 'medical_services',
      reports: [
        {
          name: 'Lab Test Volume',
          description: 'Daily/weekly test counts by type',
          lastRun: 'Today, 07:30 AM',
        },
        {
          name: 'Pending Results',
          description: 'Outstanding lab results summary',
          lastRun: 'Today, 06:00 AM',
        },
        {
          name: 'Critical Values',
          description: 'Alert report for critical lab values',
          lastRun: 'Today, 08:15 AM',
        },
        {
          name: 'Radiology Workload',
          description: 'Imaging studies by modality',
        },
      ],
    },
    {
      title: 'Pharmacy Reports',
      icon: 'local_pharmacy',
      reports: [
        {
          name: 'Drug Dispensing',
          description: 'Daily medication dispensing summary',
          lastRun: 'Today, 09:00 AM',
        },
        {
          name: 'Inventory Status',
          description: 'Current stock levels and alerts',
          lastRun: 'Today, 06:00 AM',
        },
        {
          name: 'Expiring Medications',
          description: 'Drugs approaching expiration',
          lastRun: 'Jan 13, 2024',
        },
        {
          name: 'Prescription Analysis',
          description: 'Most prescribed medications',
        },
      ],
    },
    {
      title: 'Financial Reports',
      icon: 'payments',
      reports: [
        {
          name: 'Revenue Summary',
          description: 'Daily/weekly revenue by department',
          lastRun: 'Today, 07:00 AM',
        },
        {
          name: 'Outstanding Balances',
          description: 'Unpaid bills and aging report',
          lastRun: 'Jan 14, 2024',
        },
        {
          name: 'Insurance Claims',
          description: 'Claim status and processing',
          lastRun: 'Jan 12, 2024',
        },
        { name: 'Cost Analysis', description: 'Departmental cost breakdown' },
      ],
    },
    {
      title: 'Operational Reports',
      icon: 'analytics',
      reports: [
        {
          name: 'Bed Occupancy',
          description: 'Real-time bed utilization',
          lastRun: 'Today, 08:00 AM',
        },
        {
          name: 'Staff Attendance',
          description: 'Daily staff presence report',
          lastRun: 'Today, 09:00 AM',
        },
        {
          name: 'Appointment Analytics',
          description: 'No-shows and cancellation rates',
          lastRun: 'Jan 14, 2024',
        },
        {
          name: 'Wait Time Analysis',
          description: 'Average patient wait times',
        },
      ],
    },
    {
      title: 'Quality & Compliance',
      icon: 'verified',
      reports: [
        {
          name: 'Quality Indicators',
          description: 'Key performance metrics',
          lastRun: 'Jan 14, 2024',
        },
        {
          name: 'Incident Reports',
          description: 'Safety incidents and near-misses',
          lastRun: 'Jan 13, 2024',
        },
        {
          name: 'Audit Trail',
          description: 'System access and changes log',
          lastRun: 'Today, 00:00 AM',
        },
        {
          name: 'Compliance Summary',
          description: 'Regulatory compliance status',
        },
      ],
    },
  ];
}
