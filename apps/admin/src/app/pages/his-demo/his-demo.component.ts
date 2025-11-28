import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import {
  AxEnterpriseLayoutComponent,
  EnterpriseNavItem,
  AxBreadcrumbComponent,
  BreadcrumbItem,
} from '@aegisx/ui';

interface Patient {
  id: string;
  hn: string;
  name: string;
  age: number;
  gender: string;
  department: string;
  doctor: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'admitted';
  time: string;
}

interface Appointment {
  id: string;
  time: string;
  patient: string;
  doctor: string;
  type: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed';
}

@Component({
  selector: 'ax-his-demo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    AxEnterpriseLayoutComponent,
    AxBreadcrumbComponent,
  ],
  template: `
    <ax-enterprise-layout
      [appName]="'Hospital Information System'"
      [navigation]="navigation"
      [showFooter]="true"
      [headerTheme]="'dark'"
      [contentBackground]="'gray'"
      (logoutClicked)="onLogout()"
    >
      <!-- Header Actions -->
      <ng-template #headerActions>
        <button mat-icon-button matTooltip="Emergency" class="emergency-btn">
          <mat-icon>emergency</mat-icon>
        </button>
        <button
          mat-icon-button
          matTooltip="Notifications"
          [matBadge]="'5'"
          matBadgeColor="warn"
          matBadgeSize="small"
        >
          <mat-icon>notifications</mat-icon>
        </button>
        <button mat-icon-button matTooltip="Settings">
          <mat-icon>settings</mat-icon>
        </button>
      </ng-template>

      <!-- Main Content -->
      <div class="his-content">
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
            <p>Today: {{ today | date: 'EEEE, MMMM d, yyyy' }}</p>
          </div>
          <div class="page-actions">
            <button mat-stroked-button>
              <mat-icon>print</mat-icon>
              Print Report
            </button>
            <button mat-flat-button color="primary">
              <mat-icon>person_add</mat-icon>
              New Patient
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card appearance="outlined" class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <div class="stat-icon blue">
                  <mat-icon>groups</mat-icon>
                </div>
                <div class="stat-trend positive">
                  <mat-icon>trending_up</mat-icon>
                  <span>+8%</span>
                </div>
              </div>
              <div class="stat-body">
                <span class="stat-value">1,247</span>
                <span class="stat-label">Total Patients</span>
              </div>
              <div class="stat-footer">
                <span>+45 this week</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined" class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <div class="stat-icon green">
                  <mat-icon>event_available</mat-icon>
                </div>
                <div class="stat-trend neutral">
                  <mat-icon>schedule</mat-icon>
                  <span>Today</span>
                </div>
              </div>
              <div class="stat-body">
                <span class="stat-value">48</span>
                <span class="stat-label">Appointments</span>
              </div>
              <div class="stat-footer">
                <span>12 completed, 36 remaining</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined" class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <div class="stat-icon orange">
                  <mat-icon>science</mat-icon>
                </div>
                <div class="stat-trend negative">
                  <mat-icon>priority_high</mat-icon>
                  <span>Pending</span>
                </div>
              </div>
              <div class="stat-body">
                <span class="stat-value">23</span>
                <span class="stat-label">Lab Results</span>
              </div>
              <div class="stat-footer">
                <span>15 urgent, 8 routine</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card appearance="outlined" class="stat-card">
            <mat-card-content>
              <div class="stat-header">
                <div class="stat-icon purple">
                  <mat-icon>hotel</mat-icon>
                </div>
                <div class="stat-trend neutral">
                  <mat-icon>bed</mat-icon>
                  <span>85%</span>
                </div>
              </div>
              <div class="stat-body">
                <span class="stat-value">68</span>
                <span class="stat-label">Admitted Patients</span>
              </div>
              <div class="stat-footer">
                <span>12 beds available</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Main Content Grid -->
        <div class="main-grid">
          <!-- Queue Section -->
          <mat-card appearance="outlined" class="queue-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>queue</mat-icon>
                Patient Queue
              </mat-card-title>
              <div class="card-actions">
                <button mat-icon-button [matMenuTriggerFor]="queueMenu">
                  <mat-icon>filter_list</mat-icon>
                </button>
                <mat-menu #queueMenu="matMenu">
                  <button mat-menu-item>All Departments</button>
                  <button mat-menu-item>OPD</button>
                  <button mat-menu-item>Emergency</button>
                  <button mat-menu-item>Specialist</button>
                </mat-menu>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="queue-list">
                @for (patient of queuePatients; track patient.id) {
                  <div class="queue-item" [class]="patient.status">
                    <div class="queue-number">
                      <span class="q-num">{{ patient.id }}</span>
                      <span class="q-time">{{ patient.time }}</span>
                    </div>
                    <div class="queue-info">
                      <div class="patient-name">
                        <span>{{ patient.name }}</span>
                        <span class="patient-hn">HN: {{ patient.hn }}</span>
                      </div>
                      <div class="patient-details">
                        <span>{{ patient.department }}</span>
                        <span class="separator">|</span>
                        <span>{{ patient.doctor }}</span>
                      </div>
                    </div>
                    <div class="queue-status">
                      <span class="status-badge" [class]="patient.status">
                        {{ getStatusLabel(patient.status) }}
                      </span>
                    </div>
                    <div class="queue-actions">
                      <button
                        mat-icon-button
                        [matMenuTriggerFor]="patientMenu"
                        matTooltip="Actions"
                      >
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #patientMenu="matMenu">
                        <button mat-menu-item>
                          <mat-icon>visibility</mat-icon> View Record
                        </button>
                        <button mat-menu-item>
                          <mat-icon>edit</mat-icon> Update Status
                        </button>
                        <button mat-menu-item>
                          <mat-icon>medical_services</mat-icon> Start
                          Consultation
                        </button>
                      </mat-menu>
                    </div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Right Column -->
          <div class="side-column">
            <!-- Today's Appointments -->
            <mat-card appearance="outlined" class="appointments-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>event</mat-icon>
                  Today's Schedule
                </mat-card-title>
                <button mat-button color="primary">View All</button>
              </mat-card-header>
              <mat-card-content>
                <div class="appointments-list">
                  @for (apt of appointments; track apt.id) {
                    <div class="appointment-item">
                      <div class="apt-time">{{ apt.time }}</div>
                      <div class="apt-info">
                        <span class="apt-patient">{{ apt.patient }}</span>
                        <span class="apt-type">{{ apt.type }}</span>
                      </div>
                      <span class="apt-status" [class]="apt.status">
                        {{ getAppointmentStatus(apt.status) }}
                      </span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Department Stats -->
            <mat-card appearance="outlined" class="dept-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>local_hospital</mat-icon>
                  Department Load
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="dept-list">
                  @for (dept of departments; track dept.name) {
                    <div class="dept-item">
                      <div class="dept-info">
                        <span class="dept-name">{{ dept.name }}</span>
                        <span class="dept-count"
                          >{{ dept.patients }} patients</span
                        >
                      </div>
                      <div class="dept-bar">
                        <div
                          class="bar-fill"
                          [style.width.%]="dept.load"
                          [class.high]="dept.load > 80"
                        ></div>
                      </div>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>

      <!-- Footer Content -->
      <ng-template #footerContent>
        <span>Hospital Information System - AegisX Platform</span>
        <span class="footer-version">v1.0.0</span>
      </ng-template>
    </ax-enterprise-layout>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      .his-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Page Header */
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

      .emergency-btn {
        color: var(--ax-error-default) !important;
      }

      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .stat-card {
        mat-card-content {
          padding: 1.25rem !important;
        }
      }

      .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }

      .stat-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ax-radius-lg);

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }

        &.blue {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-default);
        }

        &.green {
          background: var(--ax-success-faint);
          color: var(--ax-success-default);
        }

        &.orange {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-default);
        }

        &.purple {
          background: #f3e8ff;
          color: #9333ea;
        }
      }

      .stat-trend {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: var(--ax-radius-sm);

        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }

        &.positive {
          background: var(--ax-success-faint);
          color: var(--ax-success-default);
        }

        &.negative {
          background: var(--ax-error-faint);
          color: var(--ax-error-default);
        }

        &.neutral {
          background: var(--ax-background-muted);
          color: var(--ax-text-secondary);
        }
      }

      .stat-body {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
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

      .stat-footer {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--ax-border-muted);
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }

      /* Main Grid */
      .main-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;

        @media (min-width: 1200px) {
          grid-template-columns: 1fr 380px;
        }
      }

      /* Queue Card */
      .queue-card {
        mat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--ax-border-muted);

          mat-card-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            margin: 0;

            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
              color: var(--ax-brand-default);
            }
          }
        }

        mat-card-content {
          padding: 0 !important;
        }
      }

      .queue-list {
        display: flex;
        flex-direction: column;
      }

      .queue-item {
        display: grid;
        grid-template-columns: 70px 1fr auto auto;
        gap: 1rem;
        align-items: center;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--ax-border-muted);
        transition: background 0.15s ease;

        &:hover {
          background: var(--ax-background-subtle);
        }

        &:last-child {
          border-bottom: none;
        }

        &.in-progress {
          background: var(--ax-brand-faint);
          border-left: 3px solid var(--ax-brand-default);
        }
      }

      .queue-number {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
      }

      .q-num {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--ax-brand-default);
      }

      .q-time {
        font-size: 0.6875rem;
        color: var(--ax-text-subtle);
      }

      .queue-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-width: 0;
      }

      .patient-name {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        color: var(--ax-text-primary);
      }

      .patient-hn {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--ax-text-subtle);
        background: var(--ax-background-muted);
        padding: 0.125rem 0.5rem;
        border-radius: var(--ax-radius-sm);
      }

      .patient-details {
        font-size: 0.8125rem;
        color: var(--ax-text-secondary);

        .separator {
          margin: 0 0.5rem;
          color: var(--ax-border-default);
        }
      }

      .status-badge {
        display: inline-flex;
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: var(--ax-radius-full);

        &.waiting {
          background: var(--ax-background-muted);
          color: var(--ax-text-secondary);
        }

        &.in-progress {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-700);
        }

        &.completed {
          background: var(--ax-success-faint);
          color: var(--ax-success-700);
        }

        &.admitted {
          background: #f3e8ff;
          color: #7c3aed;
        }
      }

      /* Side Column */
      .side-column {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      /* Appointments Card */
      .appointments-card {
        mat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--ax-border-muted);

          mat-card-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            margin: 0;

            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
              color: var(--ax-success-default);
            }
          }
        }

        mat-card-content {
          padding: 0 !important;
        }
      }

      .appointments-list {
        display: flex;
        flex-direction: column;
      }

      .appointment-item {
        display: grid;
        grid-template-columns: 60px 1fr auto;
        gap: 0.75rem;
        align-items: center;
        padding: 0.875rem 1.25rem;
        border-bottom: 1px solid var(--ax-border-muted);

        &:last-child {
          border-bottom: none;
        }
      }

      .apt-time {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ax-text-heading);
      }

      .apt-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        min-width: 0;
      }

      .apt-patient {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ax-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .apt-type {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }

      .apt-status {
        font-size: 0.6875rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: var(--ax-radius-sm);

        &.scheduled {
          background: var(--ax-background-muted);
          color: var(--ax-text-secondary);
        }

        &.checked-in {
          background: var(--ax-info-faint);
          color: var(--ax-info-700);
        }

        &.in-progress {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-700);
        }

        &.completed {
          background: var(--ax-success-faint);
          color: var(--ax-success-700);
        }
      }

      /* Department Card */
      .dept-card {
        mat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--ax-border-muted);

          mat-card-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            margin: 0;

            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
              color: var(--ax-error-default);
            }
          }
        }

        mat-card-content {
          padding: 1rem 1.25rem !important;
        }
      }

      .dept-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .dept-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .dept-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .dept-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ax-text-primary);
      }

      .dept-count {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }

      .dept-bar {
        height: 6px;
        background: var(--ax-background-muted);
        border-radius: 3px;
        overflow: hidden;
      }

      .bar-fill {
        height: 100%;
        background: var(--ax-brand-default);
        border-radius: 3px;
        transition: width 0.3s ease;

        &.high {
          background: var(--ax-error-default);
        }
      }

      /* Footer */
      .footer-version {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }
    `,
  ],
})
export class HisDemoComponent {
  today = new Date();

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'HIS', url: '/his-demo' },
    { label: 'Dashboard' },
  ];

  navigation: EnterpriseNavItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      link: '/his-demo',
      icon: 'dashboard',
    },
    { id: 'patients', title: 'Patients', link: '/his-demo', icon: 'groups' },
    {
      id: 'appointments',
      title: 'Appointments',
      link: '/his-demo',
      icon: 'event',
    },
    { id: 'labs', title: 'Lab Results', link: '/his-demo', icon: 'science' },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      link: '/his-demo',
      icon: 'medication',
    },
    { id: 'reports', title: 'Reports', link: '/his-demo', icon: 'assessment' },
  ];

  queuePatients: Patient[] = [
    {
      id: 'A001',
      hn: '64-123456',
      name: 'สมชาย ใจดี',
      age: 45,
      gender: 'M',
      department: 'OPD',
      doctor: 'นพ.สมศักดิ์',
      status: 'in-progress',
      time: '09:00',
    },
    {
      id: 'A002',
      hn: '64-234567',
      name: 'สมหญิง รักดี',
      age: 32,
      gender: 'F',
      department: 'OPD',
      doctor: 'พญ.สมใจ',
      status: 'waiting',
      time: '09:15',
    },
    {
      id: 'A003',
      hn: '64-345678',
      name: 'วิชัย มั่นคง',
      age: 58,
      gender: 'M',
      department: 'Cardiology',
      doctor: 'นพ.หัวใจ',
      status: 'waiting',
      time: '09:30',
    },
    {
      id: 'A004',
      hn: '64-456789',
      name: 'นิภา สุขใจ',
      age: 28,
      gender: 'F',
      department: 'OB-GYN',
      doctor: 'พญ.สตรี',
      status: 'completed',
      time: '08:30',
    },
    {
      id: 'A005',
      hn: '64-567890',
      name: 'ประยุทธ์ เข้มแข็ง',
      age: 67,
      gender: 'M',
      department: 'Emergency',
      doctor: 'นพ.ฉุกเฉิน',
      status: 'admitted',
      time: '08:00',
    },
  ];

  appointments: Appointment[] = [
    {
      id: '1',
      time: '09:00',
      patient: 'สมชาย ใจดี',
      doctor: 'นพ.สมศักดิ์',
      type: 'Follow-up',
      status: 'in-progress',
    },
    {
      id: '2',
      time: '09:30',
      patient: 'วิชัย มั่นคง',
      doctor: 'นพ.หัวใจ',
      type: 'Consultation',
      status: 'checked-in',
    },
    {
      id: '3',
      time: '10:00',
      patient: 'มานี ทองดี',
      doctor: 'พญ.สมใจ',
      type: 'Check-up',
      status: 'scheduled',
    },
    {
      id: '4',
      time: '10:30',
      patient: 'ชูใจ สว่าง',
      doctor: 'นพ.ตา',
      type: 'Eye Exam',
      status: 'scheduled',
    },
    {
      id: '5',
      time: '11:00',
      patient: 'ปิติ ยินดี',
      doctor: 'นพ.กระดูก',
      type: 'X-Ray Review',
      status: 'scheduled',
    },
  ];

  departments = [
    { name: 'OPD', patients: 45, load: 90 },
    { name: 'Emergency', patients: 12, load: 60 },
    { name: 'Cardiology', patients: 18, load: 72 },
    { name: 'OB-GYN', patients: 15, load: 50 },
    { name: 'Orthopedics', patients: 8, load: 32 },
  ];

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      waiting: 'Waiting',
      'in-progress': 'In Progress',
      completed: 'Completed',
      admitted: 'Admitted',
    };
    return labels[status] || status;
  }

  getAppointmentStatus(status: string): string {
    const labels: Record<string, string> = {
      scheduled: 'Scheduled',
      'checked-in': 'Checked In',
      'in-progress': 'In Progress',
      completed: 'Done',
    };
    return labels[status] || status;
  }

  onLogout(): void {
    console.log('Logout clicked');
  }
}
