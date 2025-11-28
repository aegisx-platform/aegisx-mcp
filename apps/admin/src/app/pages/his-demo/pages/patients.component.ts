import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { AxBreadcrumbComponent, BreadcrumbItem } from '@aegisx/ui';

interface Patient {
  id: string;
  mrn: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  phone: string;
  lastVisit: string;
  status: 'active' | 'admitted' | 'discharged';
  department: string;
}

@Component({
  selector: 'ax-his-patients',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDividerModule,
    AxBreadcrumbComponent,
  ],
  template: `
    <div class="patients-page">
      <!-- Breadcrumb -->
      <ax-breadcrumb
        [items]="breadcrumbItems"
        separatorIcon="chevron_right"
        size="sm"
      ></ax-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">
          <h1>Patients</h1>
          <p>Manage patient records and information</p>
        </div>
        <div class="page-actions">
          <button mat-stroked-button>
            <mat-icon>file_upload</mat-icon>
            Import
          </button>
          <button mat-stroked-button>
            <mat-icon>file_download</mat-icon>
            Export
          </button>
          <button mat-flat-button color="primary">
            <mat-icon>person_add</mat-icon>
            Register Patient
          </button>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="stats-row">
        <mat-card appearance="outlined" class="mini-stat">
          <mat-card-content>
            <span class="mini-stat-value">1,247</span>
            <span class="mini-stat-label">Total Patients</span>
          </mat-card-content>
        </mat-card>
        <mat-card appearance="outlined" class="mini-stat">
          <mat-card-content>
            <span class="mini-stat-value">89</span>
            <span class="mini-stat-label">Currently Admitted</span>
          </mat-card-content>
        </mat-card>
        <mat-card appearance="outlined" class="mini-stat">
          <mat-card-content>
            <span class="mini-stat-value">156</span>
            <span class="mini-stat-label">New This Month</span>
          </mat-card-content>
        </mat-card>
        <mat-card appearance="outlined" class="mini-stat">
          <mat-card-content>
            <span class="mini-stat-value">48</span>
            <span class="mini-stat-label">Today's Visits</span>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card appearance="outlined" class="filter-card">
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search patients</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput placeholder="Search by name, MRN, phone..." />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select>
                <mat-option value="">All Status</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="admitted">Admitted</mat-option>
                <mat-option value="discharged">Discharged</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <mat-select>
                <mat-option value="">All Departments</mat-option>
                <mat-option value="general">General Medicine</mat-option>
                <mat-option value="surgery">Surgery</mat-option>
                <mat-option value="pediatrics">Pediatrics</mat-option>
                <mat-option value="orthopedics">Orthopedics</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Gender</mat-label>
              <mat-select>
                <mat-option value="">All</mat-option>
                <mat-option value="male">Male</mat-option>
                <mat-option value="female">Female</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Patients Table -->
      <mat-card appearance="outlined" class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="patients" class="patients-table">
            <ng-container matColumnDef="mrn">
              <th mat-header-cell *matHeaderCellDef>MRN</th>
              <td mat-cell *matCellDef="let patient">
                <span class="mrn-badge">{{ patient.mrn }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Patient Name</th>
              <td mat-cell *matCellDef="let patient">
                <div class="patient-info">
                  <div class="patient-avatar" [class]="patient.gender">
                    <mat-icon>{{
                      patient.gender === 'male' ? 'person' : 'person_outline'
                    }}</mat-icon>
                  </div>
                  <div class="patient-details">
                    <span class="patient-name">{{ patient.name }}</span>
                    <span class="patient-meta"
                      >{{ patient.gender | titlecase }},
                      {{ patient.age }} years</span
                    >
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let patient">{{ patient.phone }}</td>
            </ng-container>

            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let patient">
                {{ patient.department }}
              </td>
            </ng-container>

            <ng-container matColumnDef="lastVisit">
              <th mat-header-cell *matHeaderCellDef>Last Visit</th>
              <td mat-cell *matCellDef="let patient">
                {{ patient.lastVisit }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let patient">
                <span class="status-badge" [class]="patient.status">
                  {{ getStatusLabel(patient.status) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let patient">
                <button mat-icon-button [matMenuTriggerFor]="rowMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #rowMenu="matMenu">
                  <button mat-menu-item>
                    <mat-icon>visibility</mat-icon> View Details
                  </button>
                  <button mat-menu-item><mat-icon>edit</mat-icon> Edit</button>
                  <button mat-menu-item>
                    <mat-icon>event</mat-icon> Schedule Appointment
                  </button>
                  <button mat-menu-item>
                    <mat-icon>history</mat-icon> Medical History
                  </button>
                  <button mat-menu-item>
                    <mat-icon>science</mat-icon> Lab Results
                  </button>
                  <button mat-menu-item>
                    <mat-icon>medication</mat-icon> Prescriptions
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item>
                    <mat-icon>print</mat-icon> Print Record
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <mat-paginator
            [length]="1247"
            [pageSize]="10"
            [pageSizeOptions]="[5, 10, 25, 50]"
            showFirstLastButtons
          ></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .patients-page {
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

      .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .mini-stat mat-card-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 1rem !important;
      }

      .mini-stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ax-text-heading);
      }

      .mini-stat-label {
        font-size: 0.75rem;
        color: var(--ax-text-secondary);
      }

      .filter-card mat-card-content {
        padding: 1rem !important;
      }

      .filters {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .search-field {
        flex: 1;
        min-width: 250px;
      }

      .table-card mat-card-content {
        padding: 0 !important;
      }

      .patients-table {
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

      .mrn-badge {
        font-family: monospace;
        font-weight: 600;
        color: var(--ax-brand-default);
        background: var(--ax-brand-faint);
        padding: 0.25rem 0.5rem;
        border-radius: var(--ax-radius-sm);
      }

      .patient-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .patient-avatar {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ax-radius-full);

        &.male {
          background: var(--ax-info-faint);
          color: var(--ax-info-default);
        }

        &.female {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-default);
        }
      }

      .patient-details {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .patient-name {
        font-weight: 500;
        color: var(--ax-text-primary);
      }

      .patient-meta {
        font-size: 0.75rem;
        color: var(--ax-text-subtle);
      }

      .status-badge {
        display: inline-flex;
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: var(--ax-radius-full);

        &.active {
          background: var(--ax-success-faint);
          color: var(--ax-success-700);
        }

        &.admitted {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-700);
        }

        &.discharged {
          background: var(--ax-background-muted);
          color: var(--ax-text-secondary);
        }
      }

      mat-paginator {
        border-top: 1px solid var(--ax-border-muted);
      }
    `,
  ],
})
export class PatientsComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'HIS', url: '/his-demo' },
    { label: 'Patients' },
  ];

  displayedColumns = [
    'mrn',
    'name',
    'phone',
    'department',
    'lastVisit',
    'status',
    'actions',
  ];

  patients: Patient[] = [
    {
      id: '1',
      mrn: 'MRN-001234',
      name: 'John Smith',
      gender: 'male',
      age: 45,
      phone: '081-234-5678',
      lastVisit: '2024-01-15',
      status: 'active',
      department: 'General Medicine',
    },
    {
      id: '2',
      mrn: 'MRN-001235',
      name: 'Sarah Johnson',
      gender: 'female',
      age: 32,
      phone: '082-345-6789',
      lastVisit: '2024-01-14',
      status: 'admitted',
      department: 'Surgery',
    },
    {
      id: '3',
      mrn: 'MRN-001236',
      name: 'Michael Brown',
      gender: 'male',
      age: 58,
      phone: '083-456-7890',
      lastVisit: '2024-01-12',
      status: 'active',
      department: 'Orthopedics',
    },
    {
      id: '4',
      mrn: 'MRN-001237',
      name: 'Emily Davis',
      gender: 'female',
      age: 28,
      phone: '084-567-8901',
      lastVisit: '2024-01-10',
      status: 'discharged',
      department: 'Pediatrics',
    },
    {
      id: '5',
      mrn: 'MRN-001238',
      name: 'David Wilson',
      gender: 'male',
      age: 67,
      phone: '085-678-9012',
      lastVisit: '2024-01-08',
      status: 'admitted',
      department: 'General Medicine',
    },
    {
      id: '6',
      mrn: 'MRN-001239',
      name: 'Lisa Anderson',
      gender: 'female',
      age: 41,
      phone: '086-789-0123',
      lastVisit: '2024-01-05',
      status: 'active',
      department: 'Surgery',
    },
    {
      id: '7',
      mrn: 'MRN-001240',
      name: 'Robert Taylor',
      gender: 'male',
      age: 53,
      phone: '087-890-1234',
      lastVisit: '2024-01-03',
      status: 'active',
      department: 'General Medicine',
    },
    {
      id: '8',
      mrn: 'MRN-001241',
      name: 'Jennifer Martinez',
      gender: 'female',
      age: 36,
      phone: '088-901-2345',
      lastVisit: '2024-01-01',
      status: 'admitted',
      department: 'Maternity',
    },
  ];

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Active',
      admitted: 'Admitted',
      discharged: 'Discharged',
    };
    return labels[status] || status;
  }
}
