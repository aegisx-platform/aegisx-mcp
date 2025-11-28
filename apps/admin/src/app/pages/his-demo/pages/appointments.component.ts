import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';

interface Appointment {
  id: string;
  patientName: string;
  patientMrn: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'procedure' | 'emergency';
  status:
    | 'scheduled'
    | 'confirmed'
    | 'in-progress'
    | 'completed'
    | 'cancelled'
    | 'no-show';
}

@Component({
  selector: 'ax-his-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatTabsModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDividerModule,
    AxBreadcrumbComponent,
  ],
  template: `
    <div class="appointments-page">
      <!-- Breadcrumb -->
      <ax-breadcrumb
        [items]="breadcrumbItems"
        separatorIcon="chevron_right"
        size="sm"
      ></ax-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">
          <h1>Appointments</h1>
          <p>Manage patient appointments and scheduling</p>
        </div>
        <div class="page-actions">
          <button mat-stroked-button>
            <mat-icon>calendar_today</mat-icon>
            Calendar View
          </button>
          <button mat-flat-button color="primary">
            <mat-icon>add</mat-icon>
            New Appointment
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon scheduled">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">15</span>
              <span class="summary-label">Scheduled</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon confirmed">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">28</span>
              <span class="summary-label">Confirmed</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon in-progress">
              <mat-icon>pending</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">5</span>
              <span class="summary-label">In Progress</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon completed">
              <mat-icon>task_alt</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">42</span>
              <span class="summary-label">Completed Today</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs & Table -->
      <mat-card appearance="outlined" class="table-card">
        <mat-tab-group>
          <mat-tab label="Today's Appointments">
            <div class="tab-content">
              <table
                mat-table
                [dataSource]="appointments"
                class="appointments-table"
              >
                <ng-container matColumnDef="time">
                  <th mat-header-cell *matHeaderCellDef>Time</th>
                  <td mat-cell *matCellDef="let apt">
                    <span class="time-badge">{{ apt.time }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="patient">
                  <th mat-header-cell *matHeaderCellDef>Patient</th>
                  <td mat-cell *matCellDef="let apt">
                    <div class="patient-info">
                      <span class="patient-name">{{ apt.patientName }}</span>
                      <span class="patient-mrn">{{ apt.patientMrn }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="doctor">
                  <th mat-header-cell *matHeaderCellDef>Doctor</th>
                  <td mat-cell *matCellDef="let apt">
                    <div class="doctor-info">
                      <mat-icon>person</mat-icon>
                      {{ apt.doctor }}
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let apt">{{ apt.department }}</td>
                </ng-container>

                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let apt">
                    <span class="type-badge" [class]="apt.type">
                      {{ getTypeLabel(apt.type) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let apt">
                    <span class="status-badge" [class]="apt.status">
                      {{ getStatusLabel(apt.status) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let apt">
                    <button mat-icon-button [matMenuTriggerFor]="rowMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #rowMenu="matMenu">
                      <button mat-menu-item>
                        <mat-icon>visibility</mat-icon> View Details
                      </button>
                      <button mat-menu-item>
                        <mat-icon>edit</mat-icon> Edit
                      </button>
                      @if (apt.status === 'scheduled') {
                        <button mat-menu-item>
                          <mat-icon>check</mat-icon> Confirm
                        </button>
                      }
                      @if (apt.status === 'confirmed') {
                        <button mat-menu-item>
                          <mat-icon>play_arrow</mat-icon> Start
                        </button>
                      }
                      @if (apt.status === 'in-progress') {
                        <button mat-menu-item>
                          <mat-icon>done</mat-icon> Complete
                        </button>
                      }
                      <button mat-menu-item>
                        <mat-icon>schedule</mat-icon> Reschedule
                      </button>
                      <mat-divider></mat-divider>
                      <button mat-menu-item class="danger">
                        <mat-icon>cancel</mat-icon> Cancel
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                ></tr>
              </table>

              <mat-paginator
                [length]="90"
                [pageSize]="10"
                [pageSizeOptions]="[5, 10, 25]"
                showFirstLastButtons
              ></mat-paginator>
            </div>
          </mat-tab>
          <mat-tab label="Upcoming (28)"></mat-tab>
          <mat-tab label="Past (156)"></mat-tab>
          <mat-tab label="Cancelled (12)"></mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .appointments-page {
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

      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .summary-card mat-card-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem !important;
      }

      .summary-icon {
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

        &.scheduled {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-default);
        }

        &.confirmed {
          background: var(--ax-info-faint);
          color: var(--ax-info-default);
        }

        &.in-progress {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-default);
        }

        &.completed {
          background: var(--ax-success-faint);
          color: var(--ax-success-default);
        }
      }

      .summary-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .summary-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--ax-text-heading);
      }

      .summary-label {
        font-size: 0.75rem;
        color: var(--ax-text-secondary);
      }

      .table-card {
        overflow: hidden;
      }

      .tab-content {
        padding: 0;
      }

      .appointments-table {
        width: 100%;

        th.mat-header-cell {
          font-weight: 600;
          color: var(--ax-text-heading);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 1rem;
          background: var(--ax-background-subtle);
        }

        td.mat-cell {
          padding: 1rem;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--ax-border-muted);
        }

        tr.mat-row:hover {
          background: var(--ax-background-subtle);
        }
      }

      .time-badge {
        font-family: monospace;
        font-weight: 600;
        color: var(--ax-text-heading);
        background: var(--ax-background-muted);
        padding: 0.25rem 0.5rem;
        border-radius: var(--ax-radius-sm);
      }

      .patient-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .patient-name {
        font-weight: 500;
        color: var(--ax-text-primary);
      }

      .patient-mrn {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }

      .doctor-info {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: var(--ax-text-secondary);

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: var(--ax-text-subtle);
        }
      }

      .type-badge {
        display: inline-flex;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: var(--ax-radius-sm);
        background: var(--ax-background-muted);
        color: var(--ax-text-secondary);

        &.consultation {
          background: var(--ax-info-faint);
          color: var(--ax-info-700);
        }

        &.follow-up {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-700);
        }

        &.procedure {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-700);
        }

        &.emergency {
          background: var(--ax-error-faint);
          color: var(--ax-error-700);
        }
      }

      .status-badge {
        display: inline-flex;
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: var(--ax-radius-full);

        &.scheduled {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-700);
        }

        &.confirmed {
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

        &.cancelled,
        &.no-show {
          background: var(--ax-error-faint);
          color: var(--ax-error-700);
        }
      }

      .danger {
        color: var(--ax-error-default);
      }

      mat-paginator {
        border-top: 1px solid var(--ax-border-muted);
      }
    `,
  ],
})
export class AppointmentsComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'HIS', url: '/his-demo' },
    { label: 'Appointments' },
  ];

  displayedColumns = [
    'time',
    'patient',
    'doctor',
    'department',
    'type',
    'status',
    'actions',
  ];

  appointments: Appointment[] = [
    {
      id: '1',
      patientName: 'John Smith',
      patientMrn: 'MRN-001234',
      doctor: 'Dr. Wilson',
      department: 'General Medicine',
      date: '2024-01-15',
      time: '09:00',
      type: 'consultation',
      status: 'completed',
    },
    {
      id: '2',
      patientName: 'Sarah Johnson',
      patientMrn: 'MRN-001235',
      doctor: 'Dr. Brown',
      department: 'Surgery',
      date: '2024-01-15',
      time: '09:30',
      type: 'follow-up',
      status: 'in-progress',
    },
    {
      id: '3',
      patientName: 'Michael Brown',
      patientMrn: 'MRN-001236',
      doctor: 'Dr. Davis',
      department: 'Orthopedics',
      date: '2024-01-15',
      time: '10:00',
      type: 'procedure',
      status: 'confirmed',
    },
    {
      id: '4',
      patientName: 'Emily Davis',
      patientMrn: 'MRN-001237',
      doctor: 'Dr. Miller',
      department: 'Pediatrics',
      date: '2024-01-15',
      time: '10:30',
      type: 'consultation',
      status: 'scheduled',
    },
    {
      id: '5',
      patientName: 'David Wilson',
      patientMrn: 'MRN-001238',
      doctor: 'Dr. Wilson',
      department: 'General Medicine',
      date: '2024-01-15',
      time: '11:00',
      type: 'follow-up',
      status: 'scheduled',
    },
    {
      id: '6',
      patientName: 'Lisa Anderson',
      patientMrn: 'MRN-001239',
      doctor: 'Dr. Taylor',
      department: 'Surgery',
      date: '2024-01-15',
      time: '11:30',
      type: 'consultation',
      status: 'confirmed',
    },
    {
      id: '7',
      patientName: 'Robert Taylor',
      patientMrn: 'MRN-001240',
      doctor: 'Dr. Wilson',
      department: 'General Medicine',
      date: '2024-01-15',
      time: '13:00',
      type: 'emergency',
      status: 'completed',
    },
    {
      id: '8',
      patientName: 'Jennifer Martinez',
      patientMrn: 'MRN-001241',
      doctor: 'Dr. Garcia',
      department: 'Maternity',
      date: '2024-01-15',
      time: '14:00',
      type: 'follow-up',
      status: 'cancelled',
    },
  ];

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      consultation: 'Consultation',
      'follow-up': 'Follow-up',
      procedure: 'Procedure',
      emergency: 'Emergency',
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      scheduled: 'Scheduled',
      confirmed: 'Confirmed',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      'no-show': 'No Show',
    };
    return labels[status] || status;
  }
}
