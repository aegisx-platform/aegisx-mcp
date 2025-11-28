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

interface Prescription {
  id: string;
  rxNumber: string;
  patientName: string;
  patientMrn: string;
  medication: string;
  dosage: string;
  quantity: number;
  prescribedBy: string;
  prescribedDate: string;
  status: 'pending' | 'preparing' | 'ready' | 'dispensed' | 'cancelled';
}

@Component({
  selector: 'ax-his-pharmacy',
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
    <div class="pharmacy-page">
      <!-- Breadcrumb -->
      <ax-breadcrumb
        [items]="breadcrumbItems"
        separatorIcon="chevron_right"
        size="sm"
      ></ax-breadcrumb>

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title">
          <h1>Pharmacy</h1>
          <p>Manage prescriptions and medication dispensing</p>
        </div>
        <div class="page-actions">
          <button mat-stroked-button>
            <mat-icon>inventory</mat-icon>
            Drug Inventory
          </button>
          <button mat-flat-button color="primary">
            <mat-icon>add</mat-icon>
            New Prescription
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon pending">
              <mat-icon>hourglass_empty</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">23</span>
              <span class="summary-label">Pending</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon preparing">
              <mat-icon>science</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">12</span>
              <span class="summary-label">Preparing</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon ready">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">8</span>
              <span class="summary-label">Ready for Pickup</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card appearance="outlined" class="summary-card">
          <mat-card-content>
            <div class="summary-icon dispensed">
              <mat-icon>task_alt</mat-icon>
            </div>
            <div class="summary-info">
              <span class="summary-value">89</span>
              <span class="summary-label">Dispensed Today</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs & Table -->
      <mat-card appearance="outlined" class="table-card">
        <mat-tab-group>
          <mat-tab label="All Prescriptions">
            <div class="tab-content">
              <table
                mat-table
                [dataSource]="prescriptions"
                class="pharmacy-table"
              >
                <ng-container matColumnDef="rxNumber">
                  <th mat-header-cell *matHeaderCellDef>Rx Number</th>
                  <td mat-cell *matCellDef="let rx">
                    <span class="rx-number">{{ rx.rxNumber }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="patient">
                  <th mat-header-cell *matHeaderCellDef>Patient</th>
                  <td mat-cell *matCellDef="let rx">
                    <div class="patient-info">
                      <span class="patient-name">{{ rx.patientName }}</span>
                      <span class="patient-mrn">{{ rx.patientMrn }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="medication">
                  <th mat-header-cell *matHeaderCellDef>Medication</th>
                  <td mat-cell *matCellDef="let rx">
                    <div class="medication-info">
                      <span class="medication-name">{{ rx.medication }}</span>
                      <span class="medication-dosage"
                        >{{ rx.dosage }} x {{ rx.quantity }}</span
                      >
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="prescribedBy">
                  <th mat-header-cell *matHeaderCellDef>Prescribed By</th>
                  <td mat-cell *matCellDef="let rx">
                    <div class="doctor-info">
                      <mat-icon>person</mat-icon>
                      {{ rx.prescribedBy }}
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let rx">{{ rx.prescribedDate }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let rx">
                    <span class="status-badge" [class]="rx.status">
                      {{ getStatusLabel(rx.status) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let rx">
                    <button mat-icon-button [matMenuTriggerFor]="rowMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #rowMenu="matMenu">
                      <button mat-menu-item>
                        <mat-icon>visibility</mat-icon> View Details
                      </button>
                      @if (rx.status === 'pending') {
                        <button mat-menu-item>
                          <mat-icon>science</mat-icon> Start Preparing
                        </button>
                      }
                      @if (rx.status === 'preparing') {
                        <button mat-menu-item>
                          <mat-icon>check</mat-icon> Mark Ready
                        </button>
                      }
                      @if (rx.status === 'ready') {
                        <button mat-menu-item>
                          <mat-icon>local_pharmacy</mat-icon> Dispense
                        </button>
                      }
                      <button mat-menu-item>
                        <mat-icon>print</mat-icon> Print Label
                      </button>
                      <button mat-menu-item>
                        <mat-icon>history</mat-icon> Patient History
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
                [length]="132"
                [pageSize]="10"
                [pageSizeOptions]="[5, 10, 25]"
                showFirstLastButtons
              ></mat-paginator>
            </div>
          </mat-tab>
          <mat-tab label="Pending (23)"></mat-tab>
          <mat-tab label="Ready (8)"></mat-tab>
          <mat-tab label="Dispensed (89)"></mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .pharmacy-page {
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

        &.pending {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-default);
        }

        &.preparing {
          background: var(--ax-info-faint);
          color: var(--ax-info-default);
        }

        &.ready {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-default);
        }

        &.dispensed {
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

      .pharmacy-table {
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

      .rx-number {
        font-family: monospace;
        font-weight: 600;
        color: var(--ax-brand-default);
        background: var(--ax-brand-faint);
        padding: 0.25rem 0.5rem;
        border-radius: var(--ax-radius-sm);
      }

      .patient-info,
      .medication-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .patient-name,
      .medication-name {
        font-weight: 500;
        color: var(--ax-text-primary);
      }

      .patient-mrn,
      .medication-dosage {
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

      .status-badge {
        display: inline-flex;
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: var(--ax-radius-full);

        &.pending {
          background: var(--ax-warning-faint);
          color: var(--ax-warning-700);
        }

        &.preparing {
          background: var(--ax-info-faint);
          color: var(--ax-info-700);
        }

        &.ready {
          background: var(--ax-brand-faint);
          color: var(--ax-brand-700);
        }

        &.dispensed {
          background: var(--ax-success-faint);
          color: var(--ax-success-700);
        }

        &.cancelled {
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
export class PharmacyComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'HIS', url: '/his-demo' },
    { label: 'Pharmacy' },
  ];

  displayedColumns = [
    'rxNumber',
    'patient',
    'medication',
    'prescribedBy',
    'date',
    'status',
    'actions',
  ];

  prescriptions: Prescription[] = [
    {
      id: '1',
      rxNumber: 'RX-8834',
      patientName: 'John Smith',
      patientMrn: 'MRN-001234',
      medication: 'Amoxicillin',
      dosage: '500mg',
      quantity: 21,
      prescribedBy: 'Dr. Wilson',
      prescribedDate: '2024-01-15',
      status: 'dispensed',
    },
    {
      id: '2',
      rxNumber: 'RX-8835',
      patientName: 'Sarah Johnson',
      patientMrn: 'MRN-001235',
      medication: 'Ibuprofen',
      dosage: '400mg',
      quantity: 30,
      prescribedBy: 'Dr. Brown',
      prescribedDate: '2024-01-15',
      status: 'ready',
    },
    {
      id: '3',
      rxNumber: 'RX-8836',
      patientName: 'Michael Brown',
      patientMrn: 'MRN-001236',
      medication: 'Omeprazole',
      dosage: '20mg',
      quantity: 14,
      prescribedBy: 'Dr. Davis',
      prescribedDate: '2024-01-15',
      status: 'preparing',
    },
    {
      id: '4',
      rxNumber: 'RX-8837',
      patientName: 'Emily Davis',
      patientMrn: 'MRN-001237',
      medication: 'Metformin',
      dosage: '850mg',
      quantity: 60,
      prescribedBy: 'Dr. Miller',
      prescribedDate: '2024-01-15',
      status: 'pending',
    },
    {
      id: '5',
      rxNumber: 'RX-8838',
      patientName: 'David Wilson',
      patientMrn: 'MRN-001238',
      medication: 'Lisinopril',
      dosage: '10mg',
      quantity: 30,
      prescribedBy: 'Dr. Wilson',
      prescribedDate: '2024-01-15',
      status: 'pending',
    },
    {
      id: '6',
      rxNumber: 'RX-8839',
      patientName: 'Lisa Anderson',
      patientMrn: 'MRN-001239',
      medication: 'Atorvastatin',
      dosage: '20mg',
      quantity: 30,
      prescribedBy: 'Dr. Taylor',
      prescribedDate: '2024-01-14',
      status: 'dispensed',
    },
    {
      id: '7',
      rxNumber: 'RX-8840',
      patientName: 'Robert Taylor',
      patientMrn: 'MRN-001240',
      medication: 'Aspirin',
      dosage: '81mg',
      quantity: 90,
      prescribedBy: 'Dr. Wilson',
      prescribedDate: '2024-01-14',
      status: 'ready',
    },
    {
      id: '8',
      rxNumber: 'RX-8841',
      patientName: 'Jennifer Martinez',
      patientMrn: 'MRN-001241',
      medication: 'Prenatal Vitamins',
      dosage: '1 tablet',
      quantity: 30,
      prescribedBy: 'Dr. Garcia',
      prescribedDate: '2024-01-14',
      status: 'preparing',
    },
  ];

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pending',
      preparing: 'Preparing',
      ready: 'Ready',
      dispensed: 'Dispensed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  }
}
